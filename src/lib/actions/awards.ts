'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { isDbConfigured, queryOne, transaction } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';
import { beirutToday } from '@/lib/when';
import {
  awardBadgeCode, isAwardKind, isPeriod, isPersonAward, shortlist, shortlistTeams,
  type AwardKind,
} from '@/lib/awards';
import { candidateRows, teamMemberIds, teamRows, toFacts } from '@/lib/awards-data';
import { awardDictionaries, formatPeriod } from '@/lib/dictionaries/awards';

/**
 * A person decides.
 *
 * This is the only file in the feature that writes an award, and it is
 * deliberately the shape of every other staff decision in this codebase — see
 * lib/actions/roster.ts, which it is modelled on: a capability, a written
 * reason, a refusal to act on yourself, and an audit line whatever happens.
 *
 * WHY THE SHORTLIST IS REBUILT HERE
 *
 * The form arrives carrying a user id and a period, and nothing else about it
 * can be trusted — not because a coordinator would forge one, but because the
 * page they were reading may be twenty minutes old. In twenty minutes an
 * hour entry can be corrected, a volunteer's standing can lapse, somebody can
 * open their profile and choose to be hidden, and another coordinator can
 * approve the same month. So every criterion is applied again, against fresh
 * rows, by the same pure functions the page used — and the chosen name has to
 * still be on the list it came from.
 *
 * Checking "is this person eligible" instead of "is this person on the current
 * shortlist" would be the subtly wrong version: it would allow somebody who
 * qualifies but was never among the five presented, which is an award nobody
 * in the room actually considered.
 *
 * THERE IS NO EDIT AND NO DELETE
 *
 * An award is announced, a badge is granted and the volunteer is told, all in
 * one transaction. Migration 036 refuses DELETE outright. A mistake is
 * corrected by withdrawing the badge with a reason — which leaves both the
 * mistake and the correction on the record — and never by making the decision
 * disappear from under the person who was told about it.
 */

function localeOf(formData: FormData): Locale {
  const value = String(formData.get('lang') ?? 'ar');
  return isLocale(value) ? value : 'ar';
}
function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim();
}

export type AwardDecisionState = {
  ok?: string;
  error?:
    | 'unavailable'
    | 'needReason'
    | 'notEligible'
    | 'alreadyDecided'
    | 'notYourself'
    | 'unknownPeriod'
    | 'noSubject';
};

/** The same floor every other written reason in this codebase uses. */
const MIN_REASON = 10;

/**
 * Announces the month's award.
 *
 * One transaction: the decision, the badge, and the notification. If any of
 * the three fails none of them happened — an award recorded without the
 * volunteer being told is how somebody finds out from a poster, and a
 * notification sent without the record behind it is worse.
 */
export async function decideAwardAction(
  _prev: AwardDecisionState,
  formData: FormData,
): Promise<AwardDecisionState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'unavailable' };

  const period = text(formData, 'period');
  const awardRaw = text(formData, 'award');
  const winnerId = text(formData, 'userId');
  const committee = text(formData, 'team');
  const reason = text(formData, 'reason');

  if (!isPeriod(period)) return { error: 'unknownPeriod' };
  if (!isAwardKind(awardRaw)) return { error: 'noSubject' };
  const award: AwardKind = awardRaw;
  if (reason.length < MIN_REASON) return { error: 'needReason' };

  const actor = await requireCapability('awards.decide');

  // Checked before anything is read, so a race between two coordinators costs
  // one of them a message rather than a constraint violation seen as a 500.
  // uq_award_once in migration 036 is the actual guarantee; this is the manners.
  const taken = await queryOne<{ id: string }>(
    'SELECT id::TEXT AS id FROM recognition_awards WHERE period = $1 AND award = $2',
    [period, award],
  );
  if (taken) return { error: 'alreadyDecided' };

  const today = beirutToday();
  const badgeCode = awardBadgeCode(award, period);
  if (!badgeCode) return { error: 'unknownPeriod' };

  return isPersonAward(award)
    ? decidePersonAward({ actor: actor.id, lang, period, award, winnerId, reason, today, badgeCode })
    : decideTeamAward({ actor: actor.id, lang, period, committee, reason, badgeCode });
}

// -------------------------------------------------------- the three person awards

async function decidePersonAward(opts: {
  actor: string;
  lang: Locale;
  period: string;
  award: AwardKind;
  winnerId: string;
  reason: string;
  today: string;
  badgeCode: string;
}): Promise<AwardDecisionState> {
  const { actor, lang, period, award, winnerId, reason, today, badgeCode } = opts;
  if (!winnerId) return { error: 'noSubject' };

  /* Nobody gives themselves an award. Refused here so the coordinator gets a
   * sentence, and again by chk_award_no_self in migration 036 so that a future
   * caller which forgets cannot get past the table. */
  if (winnerId === actor) return { error: 'notYourself' };

  // Every criterion, applied again to rows read a moment ago. See the note at
  // the top of the file for why this is the shortlist and not just eligibility.
  const rows = await candidateRows(period);
  const nominated = shortlist(award, rows.map((r) => toFacts(r, today)), period);
  const chosen = nominated.find((n) => n.userId === winnerId);
  if (!chosen) return { error: 'notEligible' };

  const winner = rows.find((r) => r.user_id === winnerId);
  const t = awardDictionaries.ar;
  const en = awardDictionaries.en;
  const monthAr = formatPeriod(period, 'ar');
  const monthEn = formatPeriod(period, 'en');

  await transaction(async (client) => {
    await client.query(
      `INSERT INTO recognition_awards
         (id, period, award, user_id, decided_by, reason, minutes, attendances, badge_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        randomUUID(), period, award, winnerId, actor, reason,
        chosen.verifiedMinutes, chosen.attendances, badgeCode,
      ],
    );

    /*
     * The badge, carrying the month and the year in its own code.
     *
     * automatic = FALSE with the granter and the reason, which
     * chk_achievement_manual in migration 032 requires — and correctly, since
     * this badge is a statement by a person about another person and no
     * recompute will ever produce or remove it. The engine in
     * lib/achievements.ts iterates its own catalogue and leaves codes it does
     * not recognise alone, so this survives every recompute.
     *
     * ON CONFLICT DO NOTHING against uq_achievement_live_once: the award row
     * above is the thing that must be unique, and a badge that somehow already
     * exists should not turn a legitimate decision into a 500.
     */
    await client.query(
      `INSERT INTO achievements (user_id, code, automatic, granted_by, grant_reason)
       VALUES ($1, $2, FALSE, $3, $4)
       ON CONFLICT DO NOTHING`,
      [winnerId, badgeCode, actor, reason],
    );

    /*
     * Told in the same transaction as the decision.
     *
     * Inserted directly rather than through notifyIn(), which respects the
     * per-kind mute list. Being chosen is not an announcement somebody can
     * have opted out of — it is a thing that happened to them, the category
     * notify.ts calls ALWAYS_SEND — and the manual badge grant in
     * lib/actions/recognition-admin.ts already writes this way for the same
     * reason.
     *
     * KIND: 'badge.earned', which is true rather than convenient — the
     * mechanical effect of this decision is a badge on their wall, and the
     * link points there. A dedicated 'award.received' kind would read better,
     * and adding one means restating the whole of chk_notification_kind in a
     * migration; migrations 029 and 032 both had to. Doing that here, while
     * migration 035 is being written elsewhere, is exactly how another
     * migration's new kind gets silently dropped from the list. Worth doing
     * once the numbering has settled, and not before.
     */
    await client.query(
      `INSERT INTO notifications (id, user_id, kind, title_ar, title_en, body_ar, body_en, link)
       VALUES ($1, $2, 'badge.earned', $3, $4, $5, $6, '/account/achievements')`,
      [
        randomUUID(),
        winnerId,
        `${t.notifyTitle[award]} — ${monthAr}`,
        `${en.notifyTitle[award]} — ${monthEn}`,
        `${t.notifyBody}${reason}`,
        `${en.notifyBody}${reason}`,
      ],
    );
  });

  await audit({
    actorId: actor,
    action: 'award.decided',
    targetType: 'user',
    targetId: winnerId,
    newValue: {
      period,
      award,
      badgeCode,
      minutes: chosen.verifiedMinutes,
      attendances: chosen.attendances,
      /* How many names were in front of the decider — a count, never the
       * names themselves. "Chosen from five" is what makes the decision
       * legible a year later; who the other four were is nobody's business
       * and is not written down anywhere. See migration 036. */
      shortlisted: nominated.length,
    },
    reason,
  });

  revalidatePath(`/${lang}/staff/awards`);
  revalidatePath(`/${lang}/honours`);
  return { ok: winner?.full_name ?? winnerId };
}

// ------------------------------------------------------------ team of the month

/*
 * No `today` here, unlike the person path, and the absence is the point: a
 * committee is a label the association owns rather than somebody who consented
 * to be named, so there is no birth date to weigh and no visibility choice to
 * ask about. Nothing in this function needs a clock.
 */
async function decideTeamAward(opts: {
  actor: string;
  lang: Locale;
  period: string;
  committee: string;
  reason: string;
  badgeCode: string;
}): Promise<AwardDecisionState> {
  const { actor, lang, period, committee, reason, badgeCode } = opts;
  if (!committee) return { error: 'noSubject' };

  const ranked = shortlistTeams(await teamRows(period), period);
  if (!ranked.some((t) => t.committee === committee)) return { error: 'notEligible' };

  const members = await teamMemberIds(period, committee);
  if (members.length === 0) return { error: 'notEligible' };

  /*
   * A decider who is on the winning committee cannot make this decision.
   *
   * The same rule as refusing to approve your own roster claim, and it has to
   * refuse the whole award rather than quietly skip the decider's own badge:
   * dropping them from the list would give the association a Team of the Month
   * one of whose members is mysteriously missing from it, and the reason would
   * be nowhere on the record. Somebody else presses the button.
   *
   * It is also what keeps chk_achievement_manual satisfiable — that constraint
   * requires granted_by <> user_id, so a self-grant would fail mid-transaction
   * and the coordinator would meet it as a 500 instead of a sentence.
   */
  if (members.includes(actor)) return { error: 'notYourself' };

  const chosen = ranked.find((t) => t.committee === committee)!;
  const t = awardDictionaries.ar;
  const en = awardDictionaries.en;
  const monthAr = formatPeriod(period, 'ar');
  const monthEn = formatPeriod(period, 'en');

  await transaction(async (client) => {
    await client.query(
      `INSERT INTO recognition_awards
         (id, period, award, team, decided_by, reason,
          minutes, attendances, active_members, badge_code)
       VALUES ($1, $2, 'team_of_the_month', $3, $4, $5, $6, $7, $8, $9)`,
      [
        randomUUID(), period, committee, actor, reason,
        chosen.verifiedMinutes, chosen.attendances, chosen.activeMembers, badgeCode,
      ],
    );

    /*
     * The badge goes to the people, because a committee has no account.
     *
     * And only to the members who were actually active that month — see
     * teamMemberIds. A name that has sat on the 2024 spreadsheet without
     * volunteering since is not part of August's team, and a badge saying it
     * was would be the first figure on this platform somebody could point at
     * and call untrue.
     */
    for (const memberId of members) {
      await client.query(
        `INSERT INTO achievements (user_id, code, automatic, granted_by, grant_reason)
         VALUES ($1, $2, FALSE, $3, $4)
         ON CONFLICT DO NOTHING`,
        [memberId, badgeCode, actor, reason],
      );
      await client.query(
        `INSERT INTO notifications (id, user_id, kind, title_ar, title_en, body_ar, body_en, link)
         VALUES ($1, $2, 'badge.earned', $3, $4, $5, $6, '/account/achievements')`,
        [
          randomUUID(),
          memberId,
          `${t.notifyTitle.team_of_the_month} — ${monthAr}`,
          `${en.notifyTitle.team_of_the_month} — ${monthEn}`,
          `${committee} · ${t.notifyBody}${reason}`,
          `${committee} · ${en.notifyBody}${reason}`,
        ],
      );
    }
  });

  await audit({
    actorId: actor,
    action: 'award.decided',
    targetType: 'team',
    targetId: committee,
    newValue: {
      period,
      award: 'team_of_the_month',
      badgeCode,
      activeMembers: chosen.activeMembers,
      minutes: chosen.verifiedMinutes,
      attendances: chosen.attendances,
      /* The average is what the ranking was made on, so it is recorded rather
       * than left to be recomputed from figures the ledgers may later correct. */
      averagePerMember: Math.round(chosen.average * 100) / 100,
      shortlisted: ranked.length,
      badgesGranted: members.length,
    },
    reason,
  });

  revalidatePath(`/${lang}/staff/awards`);
  revalidatePath(`/${lang}/honours`);
  return { ok: committee };
}
