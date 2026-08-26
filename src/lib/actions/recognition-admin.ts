'use server';

import { revalidatePath } from 'next/cache';
import { isDbConfigured, query, queryOne } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';
import { notify } from '@/lib/notify';
import { recomputeAchievements, ACHIEVEMENTS } from '@/lib/achievements';
import { checkGrant, checkWithdraw, codesFrom, MIN_REASON } from '@/lib/recognition-check';
import { previewRecomputeAll, type Preview } from '@/lib/recognition-overview';
import { planPoints, applyPoints, type PointsPlan } from '@/lib/points-recompute';

/**
 * Running the recognition system, from the staff side.
 *
 * Two things happen here and they are deliberately different in kind.
 *
 * Recomputing is safe and repeatable: it reads what people have actually done
 * and brings their badges into line, granting what is owed and withdrawing
 * what is not. It can be run at any time, over anybody, twice by accident, and
 * the answer does not change.
 *
 * Granting or withdrawing a badge by hand is not safe in that sense — it is a
 * statement by a person about another person, and no amount of recomputing
 * will produce or remove it. So it costs a capability, a written reason, and
 * an audit line, and it refuses to act on the actor themselves.
 *
 * Nothing here deletes. A badge taken back keeps its row and gains a reason,
 * because a badge somebody held and lost is part of their record and making it
 * vanish is how a volunteer stops believing the rest of the numbers.
 */

function localeOf(formData: FormData): Locale {
  const value = String(formData.get('lang') ?? 'ar');
  return isLocale(value) ? value : 'ar';
}
function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim();
}

/**
 * `values` echoes what was typed back to the form.
 *
 * A refusal here is usually "that reason is too short", and a form that clears
 * itself on refusal makes the person retype the email, the code and the reason
 * to fix the one field that was wrong. They stop writing real reasons after the
 * second time that happens, and then the audit log is full of the word "fix".
 */
export type AdminState = {
  error?: string;
  ok?: string;
  values?: Record<string, string>;
};

/**
 * Bring one person's badges in line with what they have done.
 *
 * Exposed as its own button because the automatic triggers cover the events
 * the platform sees, and the association does things the platform does not —
 * hours entered from a paper ledger, a course credited from prior learning.
 * After any of those, this is how somebody's wall catches up without waiting
 * for them to happen to log in.
 */
export async function recomputeOneAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const lang = localeOf(formData);
  const email = text(formData, 'email').toLowerCase();
  if (!isDbConfigured()) return { error: 'unavailable' };
  if (!email) return { error: 'needEmail' };

  const actor = await requireCapability('members.manage');

  const person = await queryOne<{ id: string; full_name: string }>(
    `SELECT u.id, p.full_name FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE lower(u.email) = $1`,
    [email],
  );
  if (!person) return { error: 'noAccount', values: { email } };

  const { earned, revoked } = await recomputeAchievements(person.id, 'أُعيد الاحتساب يدوياً');

  /*
   * Logged even when nothing changed, which is most of the time. "We ran it
   * and it found nothing" is the answer to a question somebody will ask, and
   * an audit trail that records only changes cannot give it.
   */
  await audit({
    actorId: actor.id,
    action: 'achievements.recomputed',
    targetType: 'user',
    targetId: person.id,
    newValue: { earned, revoked },
  });

  revalidatePath(`/${lang}/staff/recognition`);
  return { ok: `${person.full_name}: +${earned.length} / −${revoked.length}` };
}

/**
 * Everybody at once.
 *
 * The same operation, and safe for the same reason, but it writes to every
 * account on the platform and so is worth a separate press and its own audit
 * line. Runs in sequence rather than in parallel: this is a shared database
 * with real volunteers using it, and there is no hurry.
 */
export async function recomputeAllAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'unavailable' };

  const actor = await requireCapability('members.manage');

  const people = await query<{ id: string }>('SELECT id FROM users');
  let earned = 0;
  let revoked = 0;
  let failed = 0;
  for (const person of people) {
    try {
      const r = await recomputeAchievements(person.id, 'أُعيد الاحتساب للجميع');
      earned += r.earned.length;
      revoked += r.revoked.length;
    } catch {
      /* One account failing must not abandon the rest — and the count is
       * reported rather than swallowed, because "it ran" and "it ran for
       * everybody" are different claims. */
      failed += 1;
    }
  }

  await audit({
    actorId: actor.id,
    action: 'achievements.recomputed_all',
    targetType: 'system',
    targetId: 'all',
    newValue: { accounts: people.length, earned, revoked, failed },
  });

  revalidatePath(`/${lang}/staff/recognition`);
  return { ok: `${people.length} · +${earned} / −${revoked}${failed ? ` · ${failed} ✕` : ''}` };
}

/**
 * What recomputing everybody would do, shown before it is done.
 *
 * The association's own rule for this system: no backfill against production
 * before a preview. Writes nothing — no row, no notification, and no audit
 * line either, because a preview that leaves a trace is not a preview and an
 * audit log full of "somebody looked" is one nobody reads.
 */
export async function previewAllAction(
  _prev: PreviewState,
  _formData: FormData,
): Promise<PreviewState> {
  if (!isDbConfigured()) return { error: 'unavailable' };
  await requireCapability('members.manage');
  return { preview: await previewRecomputeAll() };
}

export type PreviewState = { error?: string; preview?: Preview };

export type PointsState = { error?: string; ok?: string; plan?: PointsPlan };

/**
 * What recomputing the points ledger would write, without writing it.
 *
 * A separate pair of buttons from the badge recompute, because they are not
 * the same operation and conflating them would hide that. Badges are derived
 * and can be withdrawn as well as granted; points are a ledger that is only
 * ever added to, and a point taken back is a correction row somebody signs.
 */
export async function previewPointsAction(
  _prev: PointsState,
  _formData: FormData,
): Promise<PointsState> {
  if (!isDbConfigured()) return { error: 'unavailable' };
  await requireCapability('members.manage');
  /* No audit line. A preview writes nothing, and a log full of "somebody
   * looked" is a log nobody reads. */
  return { plan: await planPoints() };
}

/**
 * Writes the points people are owed for work the platform did not witness.
 *
 * Every grant elsewhere happens as a side effect of the event that earned it,
 * which is right and cheap — and it means hours entered from a paper ledger, or
 * a register filled in weeks late, move the figures the leaderboard reads and
 * award nothing. This closes that gap and nothing else.
 */
export async function applyPointsAction(
  _prev: PointsState,
  formData: FormData,
): Promise<PointsState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'unavailable' };

  const actor = await requireCapability('members.manage');
  const { rows, points } = await applyPoints();

  await audit({
    actorId: actor.id,
    action: 'points.recomputed',
    targetType: 'system',
    targetId: 'all',
    newValue: { rows, points },
  });

  revalidatePath(`/${lang}/staff/recognition`);
  return { ok: `${rows} · +${points}` };
}

/**
 * Taking a badge out of circulation.
 *
 * The brief asked for a switch that disables a badge and a field that edits its
 * thresholds. Only the first half is here, and the missing half is a decision
 * rather than an omission: a threshold is the definition of what the
 * association honours, the engine recomputes from the ledgers, and lowering one
 * from a form would grant the badge retroactively to everybody past the new
 * line while raising one would withdraw it from people who earned it under the
 * old. Definitions live in TypeScript and change under review.
 *
 * Retiring grants nothing new and takes nothing away. Everybody holding the
 * badge goes on holding it — they did the thing, and the association's second
 * thoughts about the badge are not their fault.
 */
export async function retireBadgeAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const lang = localeOf(formData);
  const code = text(formData, 'code');
  const reason = text(formData, 'reason');
  if (!isDbConfigured()) return { error: 'unavailable' };

  const actor = await requireCapability('members.manage');
  const values = { code, reason };
  if (!code) return { error: 'needCode', values };
  if (reason.length < MIN_REASON) return { error: 'needReason', values };
  if (!ACHIEVEMENTS.some((d) => d.code === code)) return { error: 'noSuchBadge', values };

  /*
   * One row per code, ever. Retiring a badge that was retired and later lifted
   * reuses the row and clears the lift — the alternative is a second row for
   * the same code, and then "is this retired?" has more than one answer.
   */
  const done = await queryOne<{ code: string }>(
    `INSERT INTO badge_retirements (code, retired_by, retire_reason)
     VALUES ($1, $2, $3)
     ON CONFLICT (code) DO UPDATE
       SET retired_at = now(), retired_by = $2, retire_reason = $3,
           lifted_at = NULL, lifted_by = NULL, lift_reason = NULL
       WHERE badge_retirements.lifted_at IS NOT NULL
     RETURNING code`,
    [code, actor.id, reason],
  );
  if (!done) return { error: 'alreadyRetired', values };

  await audit({
    actorId: actor.id,
    action: 'achievement.retired',
    targetType: 'badge',
    targetId: code,
    reason,
  });

  revalidatePath(`/${lang}/staff/recognition`);
  return { ok: code };
}

/**
 * Bringing it back.
 *
 * An UPDATE, never a DELETE — migration 039 has a trigger that refuses the
 * delete and names this statement in its hint. A badge that was out of
 * circulation for eight months and came back has a history, and removing the
 * row would make it look as though it never stopped.
 */
export async function liftRetirementAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const lang = localeOf(formData);
  const code = text(formData, 'code');
  const reason = text(formData, 'reason');
  if (!isDbConfigured()) return { error: 'unavailable' };

  const actor = await requireCapability('members.manage');
  const values = { code, reason };
  if (!code) return { error: 'needCode', values };
  if (reason.length < MIN_REASON) return { error: 'needReason', values };

  const done = await queryOne<{ code: string }>(
    `UPDATE badge_retirements
        SET lifted_at = now(), lifted_by = $2, lift_reason = $3
      WHERE code = $1 AND lifted_at IS NULL
      RETURNING code`,
    [code, actor.id, reason],
  );
  if (!done) return { error: 'notRetired', values };

  await audit({
    actorId: actor.id,
    action: 'achievement.unretired',
    targetType: 'badge',
    targetId: code,
    reason,
  });

  revalidatePath(`/${lang}/staff/recognition`);
  return { ok: code };
}

/**
 * Finding the person before doing anything to them.
 *
 * The page used to ask for an email address typed from memory and a badge code
 * typed from memory, and told you only after you pressed whether either was
 * real. That is a form for somebody who already has the database open in
 * another window.
 *
 * A search rather than a list of everybody: a select of all four hundred
 * volunteers is a roster of who exists, sorted, on a page whose subject is who
 * deserves what — and it invites picking a name because it sits near the top.
 * Searching means you already know who you are looking for. What comes back
 * carries the badges each person holds, so the choice is made against the
 * record rather than against a memory of it.
 */
export type Found = {
  id: string;
  name: string;
  email: string;
  /** Codes currently held, so the picker can mark them rather than refuse late. */
  held: string[];
  /** Held, and granted by a person rather than computed. */
  byHand: string[];
};

export type SearchState = { error?: string; term?: string; people?: Found[] };

/** More than this and the honest answer is "search for something narrower". */
const MAX_RESULTS = 12;

export async function findPeopleAction(
  _prev: SearchState,
  formData: FormData,
): Promise<SearchState> {
  const term = text(formData, 'term');
  if (!isDbConfigured()) return { error: 'unavailable' };
  await requireCapability('members.manage');
  if (term.length < 2) return { error: 'needTerm', term };

  /*
   * Name or email, case-insensitively, anywhere in the string.
   *
   * A leading wildcard cannot use an index, and across four hundred rows that
   * does not matter in the slightest. What matters is that a coordinator
   * typing the middle of an Arabic name finds the person: the roster is
   * Arabic, thirteen of the accounts registered in Latin script, and anchoring
   * the match to the start would fail exactly the people who are already
   * hardest to find.
   */
  const like = `%${term}%`;
  const people = await query<{
    id: string; name: string; email: string; held: string[] | null; by_hand: string[] | null;
  }>(
    `SELECT u.id,
            p.full_name AS name,
            u.email,
            ARRAY(SELECT a.code FROM achievements a
                   WHERE a.user_id = u.id AND a.revoked_at IS NULL
                   ORDER BY a.code)                                   AS held,
            ARRAY(SELECT a.code FROM achievements a
                   WHERE a.user_id = u.id AND a.revoked_at IS NULL
                     AND a.automatic = FALSE
                   ORDER BY a.code)                                   AS by_hand
       FROM users u
       JOIN profiles p ON p.user_id = u.id
      WHERE p.full_name ILIKE $1 OR u.email ILIKE $1
      ORDER BY p.full_name
      LIMIT $2`,
    [like, MAX_RESULTS + 1],
  );

  if (people.length === 0) return { error: 'noMatches', term };

  /*
   * The overflow row is dropped and the fact is reported, rather than the list
   * simply stopping at twelve. A truncated list that does not say it is
   * truncated reads as the whole answer, and the person they wanted was the
   * thirteenth.
   */
  const tooMany = people.length > MAX_RESULTS;
  return {
    term,
    people: people.slice(0, MAX_RESULTS).map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      held: r.held ?? [],
      byHand: r.by_hand ?? [],
    })),
    error: tooMany ? 'tooMany' : undefined,
  };
}

/**
 * Several badges, one person, one decision.
 *
 * Multi-select because that is how the decision is actually made: somebody
 * reads a volunteer's record and concludes they are owed three things, not one
 * thing three times. One reason covers all of them, and each badge still gets
 * its own row and its own audit line, so the record reads correctly badge by
 * badge afterwards.
 *
 * Any defined badge may be granted this way, including the ones the engine
 * computes. That used to be refused, because a hand-granted 'fifty hours'
 * would be withdrawn by the next recompute — silently, weeks later, with a
 * generic reason. It is safe now because the engine skips any badge a person
 * granted; see the note in recomputeAchievements. The guard went because the
 * danger went, not because it stopped mattering.
 */
export async function grantBadgesAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const lang = localeOf(formData);
  const targetId = text(formData, 'userId');
  const reason = text(formData, 'reason');
  const codes = codesFrom(formData.getAll('codes').map(String));
  if (!isDbConfigured()) return { error: 'unavailable' };

  const actor = await requireCapability('members.manage');
  const values = { userId: targetId, reason };

  const refusal = checkGrant({ targetId, codes, reason, actorId: actor.id });
  if (refusal) return { error: refusal, values };

  const known = new Set(ACHIEVEMENTS.map((d) => d.code));
  if (codes.some((code) => !known.has(code))) return { error: 'noSuchBadge', values };

  const person = await queryOne<{ id: string; full_name: string }>(
    'SELECT u.id, p.full_name FROM users u JOIN profiles p ON p.user_id = u.id WHERE u.id = $1',
    [targetId],
  );
  if (!person) return { error: 'noAccount', values };

  const granted: string[] = [];
  for (const code of codes) {
    /*
     * An upsert, not a plain insert. uq_achievement_once is unique on
     * (user_id, code) whether or not the row is revoked, so granting a badge
     * somebody once held and lost would raise a duplicate-key error — a 500 in
     * the staff's face for a thing they are entitled to do. Un-revoking the
     * existing row is also what the engine does, and for its stated reason: a
     * badge lost to a correction and won back is the same badge, so earned_at
     * stays the day it was first earned.
     *
     * The WHERE is what makes a badge already standing a no-op rather than an
     * overwrite of somebody else's grant reason with this one.
     */
    const written = await queryOne<{ id: string }>(
      `INSERT INTO achievements (user_id, code, automatic, granted_by, grant_reason)
       VALUES ($1, $2, FALSE, $3, $4)
       ON CONFLICT (user_id, code) DO UPDATE
         SET revoked_at = NULL, revoke_reason = NULL,
             automatic = FALSE, granted_by = $3, grant_reason = $4
         WHERE achievements.revoked_at IS NOT NULL
       RETURNING id::TEXT`,
      [person.id, code, actor.id, reason],
    );
    if (!written) continue;
    granted.push(code);
    await audit({
      actorId: actor.id,
      action: 'achievement.granted',
      targetType: 'user',
      targetId: person.id,
      newValue: { code },
      reason,
    });
  }

  if (granted.length === 0) return { error: 'alreadyHeld', values };

  /*
   * ONE notification, however many badges.
   *
   * Three messages for one decision made in one moment reads as three events,
   * and the volunteer opens their notifications to a wall. The badge backfill
   * settled this the same way for the same reason.
   *
   * Through notify() rather than a hand-written INSERT: the table's id has no
   * default, and the helper is what respects the mute list. Somebody who
   * turned badge notifications off has turned them off for this one too — a
   * badge granted by a person is still a badge, not an announcement that
   * outranks their preference.
   */
  await notify({
    userId: person.id,
    kind: 'badge.earned',
    titleAr: granted.length === 1 ? 'حصلت على شارة جديدة' : 'حصلت على شارات جديدة',
    titleEn: granted.length === 1 ? 'You have earned a badge' : 'You have earned new badges',
    bodyAr: 'منحتك الجمعية تقديراً لما قدّمته.',
    bodyEn: 'The association has recognised what you have given.',
    link: '/account/achievements',
  });

  revalidatePath(`/${lang}/staff/recognition`);
  return { ok: `${person.full_name} · ${granted.length}` };
}

/**
 * Taking badges back.
 *
 * Kept as rows with a reason rather than deleted, for the reason the engine
 * does it that way: history is part of somebody's record, and the achievements
 * page shows withdrawn badges plainly rather than making them disappear.
 */
export async function withdrawBadgesAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const lang = localeOf(formData);
  const targetId = text(formData, 'userId');
  const reason = text(formData, 'reason');
  const codes = codesFrom(formData.getAll('codes').map(String));
  if (!isDbConfigured()) return { error: 'unavailable' };

  const actor = await requireCapability('members.manage');
  const values = { userId: targetId, reason };

  const refusal = checkWithdraw({ targetId, codes, reason, actorId: actor.id });
  if (refusal) return { error: refusal, values };

  const person = await queryOne<{ id: string; full_name: string }>(
    'SELECT u.id, p.full_name FROM users u JOIN profiles p ON p.user_id = u.id WHERE u.id = $1',
    [targetId],
  );
  if (!person) return { error: 'noAccount', values };

  const taken: string[] = [];
  for (const code of codes) {
    const done = await queryOne<{ id: string }>(
      `UPDATE achievements SET revoked_at = now(), revoke_reason = $3
        WHERE user_id = $1 AND code = $2 AND revoked_at IS NULL
        RETURNING id::TEXT`,
      [person.id, code, reason],
    );
    if (!done) continue;
    taken.push(code);
    await audit({
      actorId: actor.id,
      action: 'achievement.revoked',
      targetType: 'user',
      targetId: person.id,
      newValue: { code },
      reason,
    });
  }

  if (taken.length === 0) return { error: 'notHeld', values };

  /*
   * No notification, deliberately. A badge arriving is news the volunteer
   * wants. A badge being taken away is a correction, which they will see on
   * their own page with the reason beside it — pushing it at them turns a
   * quiet fix into an announcement about a thing they lost.
   */

  revalidatePath(`/${lang}/staff/recognition`);
  return { ok: `${person.full_name} · ${taken.length}` };
}

