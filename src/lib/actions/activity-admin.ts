'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';

function localeOf(f: FormData): Locale {
  const v = String(f.get('lang') ?? 'ar');
  return isLocale(v) ? v : 'ar';
}
const text = (f: FormData, n: string) => String(f.get(n) ?? '').trim();

function optionalInt(raw: string, min: number, max: number): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

export async function createActivityAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const titleAr = text(formData, 'titleAr');
  const titleEn = text(formData, 'titleEn');
  const startsAt = text(formData, 'startsAt');
  const endsAt = text(formData, 'endsAt');

  if (!isDbConfigured() || !titleAr || !titleEn || !startsAt || !endsAt) return;
  // The database refuses this too; stopping here keeps the admin on the form
  // rather than on an error page.
  if (new Date(endsAt) <= new Date(startsAt)) return;

  const actor = await requireCapability('activities.manage');
  const id = randomUUID();

  await execute(
    `INSERT INTO activities
       (id, title_ar, title_en, description_ar, description_en, location,
        starts_at, ends_at, capacity, min_stage, led_by, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11)`,
    [
      id, titleAr, titleEn,
      text(formData, 'descriptionAr') || null,
      text(formData, 'descriptionEn') || null,
      text(formData, 'location') || null,
      startsAt, endsAt,
      optionalInt(text(formData, 'capacity'), 1, 10_000),
      optionalInt(text(formData, 'minStage'), 1, 20),
      actor.id,
    ],
  );

  await audit({
    actorId: actor.id,
    action: 'activity.created',
    targetType: 'activity',
    targetId: id,
    newValue: { titleEn, startsAt },
  });

  revalidatePath(`/${lang}/staff/activities`);
  revalidatePath(`/${lang}/opportunities`);
}

/** Closes registration without hiding the activity or losing its roster. */
/**
 * Calls an activity off.
 *
 * Not a delete. Volunteers registered for it, some of them arranged their week
 * around it, and a few may already have attendance recorded — erasing the row
 * would erase their history along with it. The activity stays, wearing the
 * reason, and the database refuses any further registration or attendance
 * against it (migration 020).
 *
 * The reason is required here and again by a CHECK constraint, because a
 * cancellation with no explanation leaves a volunteer guessing whether the
 * thing moved, was called off, or they were dropped from it.
 */
export async function cancelActivityAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const id = text(formData, 'activityId');
  const reason = text(formData, 'reason');
  if (!isDbConfigured() || !id || !reason) return;

  const actor = await requireCapability('activities.manage');

  await execute(
    `UPDATE activities
        SET cancelled_at = now(), cancel_reason = $2, cancelled_by = $3, is_open = false
      WHERE id = $1 AND cancelled_at IS NULL`,
    [id, reason, actor.id],
  );

  await audit({
    actorId: actor.id,
    action: 'activity.cancelled',
    targetType: 'activity',
    targetId: id,
    reason,
  });

  revalidatePath(`/${lang}/staff/activities`);
  revalidatePath(`/${lang}/opportunities`);
  revalidatePath(`/${lang}/account/activities`);
}

/** Undoes a cancellation made in error. Registration stays shut until it is
 *  reopened deliberately, so nobody is signed up by an undo. */
export async function uncancelActivityAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const id = text(formData, 'activityId');
  const reason = text(formData, 'reason');
  if (!isDbConfigured() || !id || !reason) return;

  const actor = await requireCapability('activities.manage');

  await execute(
    `UPDATE activities
        SET cancelled_at = NULL, cancel_reason = NULL, cancelled_by = NULL
      WHERE id = $1 AND cancelled_at IS NOT NULL`,
    [id],
  );
  await audit({
    actorId: actor.id,
    action: 'activity.uncancelled',
    targetType: 'activity',
    targetId: id,
    reason,
  });

  revalidatePath(`/${lang}/staff/activities`);
  revalidatePath(`/${lang}/opportunities`);
}

/** Reopens sign-ups that were closed early. Capacity still applies. */
export async function reopenActivityAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const id = text(formData, 'activityId');
  if (!isDbConfigured() || !id) return;

  const actor = await requireCapability('activities.manage');
  await execute(
    'UPDATE activities SET is_open = true WHERE id = $1 AND cancelled_at IS NULL',
    [id],
  );
  await audit({ actorId: actor.id, action: 'activity.reopened', targetType: 'activity', targetId: id });

  revalidatePath(`/${lang}/staff/activities`);
  revalidatePath(`/${lang}/opportunities`);
}

/**
 * Removes an activity outright — allowed only for one created by mistake that
 * nobody has touched. The guard is in the WHERE clause rather than in a check
 * beforehand, so a registration arriving between the check and the delete
 * cannot slip through: with any registration or attendance row present, the
 * delete matches nothing and the activity survives.
 */
export async function deleteActivityAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const id = text(formData, 'activityId');
  if (!isDbConfigured() || !id) return;

  const actor = await requireCapability('activities.manage');

  await execute(
    `DELETE FROM activities a
      WHERE a.id = $1
        AND NOT EXISTS (SELECT 1 FROM activity_registrations r WHERE r.activity_id = a.id)
        AND NOT EXISTS (SELECT 1 FROM activity_attendance att WHERE att.activity_id = a.id)`,
    [id],
  );
  await audit({
    actorId: actor.id,
    action: 'activity.deleted',
    targetType: 'activity',
    targetId: id,
    reason: 'Created in error, no registrations or attendance',
  });

  revalidatePath(`/${lang}/staff/activities`);
}

export async function closeActivityAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const id = text(formData, 'activityId');
  if (!isDbConfigured() || !id) return;

  const actor = await requireCapability('activities.manage');
  await execute('UPDATE activities SET is_open = false WHERE id = $1', [id]);
  await audit({
    actorId: actor.id,
    action: 'activity.closed',
    targetType: 'activity',
    targetId: id,
  });

  revalidatePath(`/${lang}/staff/activities`);
  revalidatePath(`/${lang}/opportunities`);
}
