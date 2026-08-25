'use server';

import { revalidatePath } from 'next/cache';
import { isDbConfigured, query, queryOne } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';
import { notify } from '@/lib/notify';
import { recomputeAchievements, ACHIEVEMENTS } from '@/lib/achievements';
import { checkGrant, checkWithdraw } from '@/lib/recognition-check';
import { previewRecomputeAll, type Preview } from '@/lib/recognition-overview';

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

/**
 * A badge granted by a person, for something the rules cannot see.
 *
 * Marked `automatic = false` and carrying the granter and the reason, which
 * migration 032's chk_achievement_manual enforces at the table. The code that
 * recomputes leaves codes it does not recognise alone, so a manual badge is
 * not swept away by the next run — but a manual grant of a code the engine DOES
 * own would be, silently, which is why this refuses those.
 */
export async function grantBadgeAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const lang = localeOf(formData);
  const email = text(formData, 'email').toLowerCase();
  const code = text(formData, 'code');
  const reason = text(formData, 'reason');
  if (!isDbConfigured()) return { error: 'unavailable' };

  const actor = await requireCapability('members.manage');

  const person = await queryOne<{ id: string; full_name: string }>(
    `SELECT u.id, p.full_name FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE lower(u.email) = $1`,
    [email],
  );

  const values = { email, code, reason };
  const refusal = checkGrant(
    { email, code, reason, actorId: actor.id, targetId: person?.id ?? '' },
    ACHIEVEMENTS.map((d) => d.code),
  );
  if (refusal) return { error: refusal, values };
  if (!person) return { error: 'noAccount', values };

  const held = await queryOne<{ id: string }>(
    'SELECT id::TEXT FROM achievements WHERE user_id = $1 AND code = $2 AND revoked_at IS NULL',
    [person.id, code],
  );
  if (held) return { error: 'alreadyHeld', values };

  /*
   * An upsert, not a plain insert.
   *
   * uq_achievement_once is unique on (user_id, code) whether or not the row is
   * revoked, so granting a badge somebody once held and lost would raise a
   * duplicate-key error — a 500 in the staff's face for a thing they are
   * entitled to do. Un-revoking the existing row is also what the engine does,
   * and for the reason it gives: a badge lost to a correction and won back is
   * the same badge, so earned_at stays the day it was first earned.
   *
   * The WHERE guards the race the pre-check above cannot: between reading and
   * writing, the same badge may have been granted by somebody else. No row
   * comes back then, and that is reported rather than silently overwriting
   * their grant reason with this one.
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
  if (!written) return { error: 'alreadyHeld', values };
  /*
   * Through notify() rather than a hand-written INSERT: the table's id has no
   * default and the helper is what respects muted_kinds. Somebody who has
   * turned badge notifications off has turned them off for this one too — a
   * badge granted by a person is still a badge, not an announcement that
   * outranks their preference.
   */
  await notify({
    userId: person.id,
    kind: 'badge.earned',
    titleAr: 'حصلت على شارة جديدة',
    titleEn: 'You have earned a badge',
    bodyAr: 'منحتك الجمعية شارة تقديراً لما قدّمته.',
    bodyEn: 'The association has awarded you a badge in recognition of what you have given.',
    link: '/account/achievements',
  });
  await audit({
    actorId: actor.id,
    action: 'achievement.granted',
    targetType: 'user',
    targetId: person.id,
    newValue: { code },
    reason,
  });

  revalidatePath(`/${lang}/staff/recognition`);
  return { ok: `${person.full_name} · ${code}` };
}

/**
 * Taking a badge back.
 *
 * Kept as a row with a reason rather than deleted, for the same reason the
 * engine does it that way: history is part of somebody's record, and the
 * achievements page shows withdrawn badges plainly rather than making them
 * disappear.
 */
export async function withdrawBadgeAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const lang = localeOf(formData);
  const email = text(formData, 'email').toLowerCase();
  const code = text(formData, 'code');
  const reason = text(formData, 'reason');
  if (!isDbConfigured()) return { error: 'unavailable' };

  const actor = await requireCapability('members.manage');

  const person = await queryOne<{ id: string; full_name: string }>(
    `SELECT u.id, p.full_name FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE lower(u.email) = $1`,
    [email],
  );

  const values = { email, code, reason };
  const refusal = checkWithdraw({
    email, code, reason, actorId: actor.id, targetId: person?.id ?? '',
  });
  if (refusal) return { error: refusal, values };
  if (!person) return { error: 'noAccount', values };

  const done = await queryOne<{ id: string }>(
    `UPDATE achievements SET revoked_at = now(), revoke_reason = $3
      WHERE user_id = $1 AND code = $2 AND revoked_at IS NULL
      RETURNING id::TEXT`,
    [person.id, code, reason],
  );
  if (!done) return { error: 'notHeld', values };

  await audit({
    actorId: actor.id,
    action: 'achievement.revoked',
    targetType: 'user',
    targetId: person.id,
    newValue: { code },
    reason,
  });

  revalidatePath(`/${lang}/staff/recognition`);
  return { ok: `${person.full_name} · ${code}` };
}
