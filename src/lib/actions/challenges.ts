'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute, queryOne } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';
import { isChallengeMetric, isIsoDate, targetFromInput } from '@/lib/challenges';

/**
 * Creating and retiring a group challenge.
 *
 * Two acts and no third. There is deliberately no edit: a challenge is a goal
 * the association announced, and moving its target or its dates after
 * volunteers have started working towards it changes what they were asked for
 * without saying so. A goal set wrongly is archived with a reason and set
 * again, which leaves both the mistake and the correction on the record.
 *
 * Every rule checked here is also a constraint in migration 034. That is not
 * duplication for its own sake: this returns a named problem the form can
 * show, rather than a constraint violation a coordinator meets as a 500.
 */

function localeOf(f: FormData): Locale {
  const v = String(f.get('lang') ?? 'ar');
  return isLocale(v) ? v : 'ar';
}
const text = (f: FormData, n: string) => String(f.get(n) ?? '').trim();

export type ChallengeFormState = {
  ok?: boolean;
  id?: string;
  error?: 'required' | 'targetInvalid' | 'datesInvalid' | 'duplicate' | 'unavailable';
  /*
   * What was typed, handed back so a refusal does not empty the form. A
   * coordinator who fills in six fields and gets the end date wrong should not
   * lose the other five — that is how a challenge ends up never being set.
   */
  values?: Record<string, string>;
};

const FORM_FIELDS = [
  'nameAr', 'nameEn', 'descriptionAr', 'descriptionEn',
  'metric', 'target', 'startsOn', 'endsOn',
];

function echo(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of FORM_FIELDS) {
    const value = formData.get(name);
    if (typeof value === 'string' && value !== '') out[name] = value;
  }
  return out;
}

/**
 * Sets a goal for the whole association.
 *
 * The target is stored in the metric's base unit — minutes for an hours
 * challenge — because that is what hour_entries holds, and a target kept in a
 * different unit from its source is an arithmetic mistake waiting for somebody
 * in a hurry. targetFromInput() is the single place the conversion happens.
 *
 * The dates arrive as 'YYYY-MM-DD' from a `<input type="date">` and are stored
 * as text into a DATE column. Nothing here builds a Date from them: parsed in
 * a GMT session, the first of the month becomes the last of the previous one,
 * and the challenge would silently count a day it was never meant to.
 */
export async function createChallengeAction(
  _prev: ChallengeFormState,
  formData: FormData,
): Promise<ChallengeFormState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'unavailable', values: echo(formData) };

  const nameAr = text(formData, 'nameAr');
  const nameEn = text(formData, 'nameEn');
  const metric = text(formData, 'metric');
  const startsOn = text(formData, 'startsOn');
  const endsOn = text(formData, 'endsOn');

  if (!nameAr || !nameEn || !isChallengeMetric(metric)) {
    return { error: 'required', values: echo(formData) };
  }

  const target = targetFromInput(metric, Number.parseInt(text(formData, 'target'), 10));
  if (target === null) return { error: 'targetInvalid', values: echo(formData) };

  // Compared as text, in the same shape the database stores. A single-day
  // window is legitimate; one that ends before it opens is a typo.
  if (!isIsoDate(startsOn) || !isIsoDate(endsOn) || endsOn < startsOn) {
    return { error: 'datesInvalid', values: echo(formData) };
  }

  const actor = await requireCapability('challenges.manage');

  /*
   * The unique index in 034 is the guarantee; this is what turns a coordinator
   * double-tapping Create into a message instead of a caught error. Same
   * comparison the index makes — metric, window, and the English name folded.
   */
  const clash = await queryOne<{ id: string }>(
    `SELECT id FROM challenges
      WHERE archived_at IS NULL AND metric = $1
        AND starts_on = $2::date AND ends_on = $3::date
        AND lower(btrim(name_en)) = lower(btrim($4))`,
    [metric, startsOn, endsOn, nameEn],
  );
  if (clash) return { error: 'duplicate', values: echo(formData) };

  const id = randomUUID();
  try {
    await execute(
      `INSERT INTO challenges
         (id, name_ar, name_en, description_ar, description_en,
          metric, target, starts_on, ends_on, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, $9::date, $10)`,
      [
        id, nameAr, nameEn,
        text(formData, 'descriptionAr') || null,
        text(formData, 'descriptionEn') || null,
        metric, target, startsOn, endsOn, actor.id,
      ],
    );
  } catch {
    // The index caught a race the SELECT above could not: two coordinators
    // saving the same goal in the same second.
    return { error: 'duplicate', values: echo(formData) };
  }

  await audit({
    actorId: actor.id,
    action: 'challenge.created',
    targetType: 'challenge',
    targetId: id,
    newValue: { nameEn, metric, target, startsOn, endsOn },
  });

  revalidatePath(`/${lang}/staff/challenges`);
  revalidatePath(`/${lang}/account`);
  return { ok: true, id };
}

/**
 * Retires a challenge.
 *
 * Not a delete — the database refuses that outright (migration 034 carries a
 * trigger). Volunteers were shown this goal and some of them worked towards
 * it; erasing the row would mean the association asked for something and then
 * held no record of ever asking. The reason is required here and again by a
 * CHECK constraint, because the next coordinator to ask what happened to the
 * hours challenge should find the answer in the row.
 */
export async function archiveChallengeAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const id = text(formData, 'challengeId');
  const reason = text(formData, 'reason');
  if (!isDbConfigured() || !id || reason.length < 3) return;

  const actor = await requireCapability('challenges.manage');

  const before = await queryOne<Record<string, unknown>>(
    `SELECT name_en, metric, target, starts_on::TEXT AS starts_on, ends_on::TEXT AS ends_on,
            is_active
       FROM challenges WHERE id = $1 AND archived_at IS NULL`,
    [id],
  );
  if (!before) return;

  await execute(
    `UPDATE challenges
        SET is_active = false, archived_at = now(), archived_by = $2,
            archive_reason = $3, updated_at = now()
      WHERE id = $1 AND archived_at IS NULL`,
    [id, actor.id, reason],
  );

  await audit({
    actorId: actor.id,
    action: 'challenge.archived',
    targetType: 'challenge',
    targetId: id,
    previousValue: before,
    newValue: { archived: true },
    reason,
  });

  revalidatePath(`/${lang}/staff/challenges`);
  revalidatePath(`/${lang}/account`);
}
