'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute, queryOne } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';
import { COURSES } from '@/lib/courses';
import { ensureCourseCertificate } from '@/lib/academy';
import { checkCarriedHours, checkRecognition } from '@/lib/prior-credit';
import { beirutToday } from '@/lib/when';

/**
 * Recording what somebody did before this platform existed.
 *
 * Both of these grant standing without the platform having watched it happen,
 * which makes them the two most consequential buttons in the staff area after
 * roster recognition. So both take the same shape as that one: a capability
 * check, a refusal to act on yourself, a required reason, and an audit line
 * naming who decided.
 *
 * Neither hides what it is. Carried-over hours are flagged `carried_over` and
 * a recognised course is `source = 'recognised'` with no score, so a report
 * can always separate the association's own record from this platform's.
 */

function localeOf(formData: FormData): Locale {
  const value = String(formData.get('lang') ?? 'ar');
  return isLocale(value) ? value : 'ar';
}
function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim();
}

export type PriorState = { error?: string; ok?: string };

/**
 * Hours worked before the site.
 *
 * One row covering a period, not one row per day — nobody is going to enter
 * six years of Saturdays. `worked_on` is the day the period is counted up to
 * and the note says what it covers, which is the honest reading of a figure
 * that has no single day behind it.
 *
 * It goes into hour_entries rather than a table of its own because every
 * total, stage rule and certificate already reads that table. A parallel store
 * would mean a volunteer whose hours are all carried over failing a stage
 * whose rule never learned about it.
 */
export async function addCarriedHoursAction(
  _prev: PriorState,
  formData: FormData,
): Promise<PriorState> {
  const lang = localeOf(formData);
  const userId = text(formData, 'userId');
  if (!isDbConfigured()) return { error: 'unavailable' };
  if (!userId) return { error: 'noMember' };

  const actor = await requireCapability('hours.verify');
  // The ledger's own constraint refuses a self-verified entry; this refuses it
  // one layer earlier so the person gets a sentence rather than a 500.
  if (actor.id === userId) return { error: 'notYourself' };

  const checked = checkCarriedHours(
    { hours: text(formData, 'hours'), upTo: text(formData, 'upTo'), note: text(formData, 'note') },
    beirutToday(),
  );
  if (!checked.ok) return { error: checked.problem };

  const { minutes, upTo, note } = checked.value;

  await execute(
    `INSERT INTO hour_entries
       (id, user_id, activity_id, worked_on, minutes, note, status,
        verified_by, verified_at, carried_over)
     VALUES ($1, $2, NULL, $3, $4, $5, 'verified', $6, now(), TRUE)`,
    [randomUUID(), userId, upTo, minutes, note, actor.id],
  );

  await audit({
    actorId: actor.id,
    action: 'hours.carried_over',
    targetType: 'user',
    targetId: userId,
    newValue: { minutes, upTo },
    reason: note,
  });

  revalidatePath(`/${lang}/staff/members/${userId}`);
  return { ok: String(minutes) };
}

/**
 * A course somebody had already done.
 *
 * Written as a `course_attempts` row with `source = 'recognised'` and no
 * score. No score because there was no paper: putting a mark on it would say
 * the person sat something they did not, and the certificate would carry it.
 *
 * In that table rather than beside it for the same reason as the hours — every
 * gate reads course_attempts, and a credit the gate did not know about would
 * lock somebody out of the course they are credited for.
 *
 * A certificate is issued as it is for any pass. The snapshot has never
 * carried a score, so the document says "certificate of completion" and states
 * nothing untrue.
 */
export async function recogniseCourseAction(
  _prev: PriorState,
  formData: FormData,
): Promise<PriorState> {
  const lang = localeOf(formData);
  const userId = text(formData, 'userId');
  if (!isDbConfigured()) return { error: 'unavailable' };
  if (!userId) return { error: 'noMember' };

  const actor = await requireCapability('stages.award');
  if (actor.id === userId) return { error: 'notYourself' };

  const known = new Set(COURSES.map((c) => c.slug));
  const checked = checkRecognition(
    { slug: text(formData, 'slug'), note: text(formData, 'note') },
    known,
  );
  if (!checked.ok) return { error: checked.problem };

  const { slug, note } = checked.value;

  const already = await queryOne<{ one: number }>(
    `SELECT 1 AS one FROM course_attempts
      WHERE user_id = $1 AND course_slug = $2 AND passed LIMIT 1`,
    [userId, slug],
  );
  if (already) return { error: 'alreadyPassed' };

  const person = await queryOne<{ full_name: string }>(
    'SELECT full_name FROM profiles WHERE user_id = $1',
    [userId],
  );
  if (!person) return { error: 'noMember' };

  /*
   * question_ids and option_order are empty because no questions were asked.
   * chk_attempt_questions exempts this source for exactly that reason, and
   * leaving them empty is what makes a recognised row impossible to mistake
   * for a sat one when reading the table directly.
   */
  await execute(
    `INSERT INTO course_attempts
       (id, user_id, course_slug, question_ids, option_order, answers,
        started_at, submitted_at, score, passed, pass_mark, source,
        recognised_by, recognised_note)
     VALUES ($1, $2, $3, '{}', '{}'::jsonb, '{}'::jsonb,
             now(), now(), NULL, TRUE, NULL, 'recognised', $4, $5)`,
    [randomUUID(), userId, slug, actor.id, note],
  );

  const code = await ensureCourseCertificate(userId, slug, person.full_name);

  await audit({
    actorId: actor.id,
    action: 'course.recognised',
    targetType: 'user',
    targetId: userId,
    newValue: { courseSlug: slug, certificate: code },
    reason: note,
  });

  revalidatePath(`/${lang}/staff/members/${userId}`);
  return { ok: slug };
}
