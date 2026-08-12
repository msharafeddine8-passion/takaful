'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute, queryOne, transaction } from '@/lib/db';
import { audit, currentUser } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { reallocate } from '@/lib/allocation';
import { recomputeAchievements } from '@/lib/achievements';
import { isLocale, type Locale } from '@/lib/i18n';

function localeOf(f: FormData): Locale {
  const v = String(f.get('lang') ?? 'ar');
  return isLocale(v) ? v : 'ar';
}
const text = (f: FormData, n: string) => String(f.get(n) ?? '').trim();

export type JoinResult =
  | { ok: true; status: 'registered' | 'waitlisted' }
  | { ok: false; reason: 'not_signed_in' | 'closed' | 'stage_too_low' | 'already' | 'error';
      requiredStage?: number; yourStage?: number };

/**
 * Registering for an activity.
 *
 * Refusals name the reason and the numbers. "This activity requires Stage 3,
 * you are on Stage 2" is something a volunteer can act on; "not eligible" is
 * something they have to ask about.
 */
export async function joinActivityAction(activityId: string, lang: Locale): Promise<JoinResult> {
  if (!isDbConfigured()) return { ok: false, reason: 'error' };
  const user = await currentUser();
  if (!user) return { ok: false, reason: 'not_signed_in' };

  const result = await transaction<JoinResult>(async (client) => {
    // Lock the activity so two people cannot take the last place at once.
    const { rows: found } = await client.query<{
      id: string; is_open: boolean; is_archived: boolean;
      capacity: number | null; min_stage: number | null;
    }>(
      `SELECT id, is_open, is_archived, capacity, min_stage
         FROM activities WHERE id = $1 FOR UPDATE`,
      [activityId],
    );
    const activity = found[0];
    if (!activity || !activity.is_open || activity.is_archived) {
      return { ok: false, reason: 'closed' };
    }

    if (activity.min_stage !== null) {
      const { rows } = await client.query<{ stage: number | null }>(
        'SELECT MAX(stage) AS stage FROM stage_progress WHERE user_id = $1',
        [user.id],
      );
      const reached = rows[0]?.stage ?? 0;
      if (reached < activity.min_stage) {
        return {
          ok: false, reason: 'stage_too_low',
          requiredStage: activity.min_stage, yourStage: reached,
        };
      }
    }

    const { rows: live } = await client.query<{ id: string }>(
      `SELECT id FROM activity_registrations
        WHERE activity_id = $1 AND user_id = $2 AND status <> 'cancelled'`,
      [activityId, user.id],
    );
    if (live.length > 0) return { ok: false, reason: 'already' };

    // Full means waitlisted, not refused. Someone always drops out.
    let status: 'registered' | 'waitlisted' = 'registered';
    if (activity.capacity !== null) {
      const { rows: places } = await client.query<{ taken: number }>(
        'SELECT taken FROM activity_places WHERE activity_id = $1',
        [activityId],
      );
      if ((places[0]?.taken ?? 0) >= activity.capacity) status = 'waitlisted';
    }

    await client.query(
      `INSERT INTO activity_registrations (id, activity_id, user_id, status)
       VALUES ($1, $2, $3, $4)`,
      [randomUUID(), activityId, user.id, status],
    );

    return { ok: true, status };
  });

  if (result.ok) {
    await audit({
      actorId: user.id,
      action: `activity.${result.status}`,
      targetType: 'activity',
      targetId: activityId,
    });
    revalidatePath(`/${lang}/opportunities`);
    revalidatePath(`/${lang}/account/activities`);
  }

  return result;
}

export async function leaveActivityAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const activityId = text(formData, 'activityId');
  if (!isDbConfigured() || !activityId) return;

  const user = await currentUser();
  if (!user) return;

  await execute(
    `UPDATE activity_registrations
        SET status = 'cancelled', cancelled_at = now(), cancel_reason = $1
      WHERE activity_id = $2 AND user_id = $3 AND status <> 'cancelled'`,
    [text(formData, 'reason') || null, activityId, user.id],
  );
  await audit({
    actorId: user.id,
    action: 'activity.cancelled',
    targetType: 'activity',
    targetId: activityId,
  });

  revalidatePath(`/${lang}/account/activities`);
  revalidatePath(`/${lang}/opportunities`);
}

/**
 * A supervisor confirms who turned up, and for how long.
 *
 * This is where attendance becomes hours. Whether those hours are verified
 * immediately or wait for a second person is organisation policy, not a
 * hard-coded rule - see org_settings.hours_require_second_check and
 * architecture decision 7, which this softens deliberately.
 */
export async function confirmAttendanceAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const activityId = text(formData, 'activityId');
  const userId = text(formData, 'userId');
  const attended = formData.get('attended') === 'yes';
  const minutes = Number.parseInt(text(formData, 'minutes'), 10);

  if (!isDbConfigured() || !activityId || !userId) return;
  if (attended && (!Number.isInteger(minutes) || minutes <= 0 || minutes > 1440)) return;

  const supervisor = await requireCapability('hours.verify');
  // The CHECK refuses this too; stopping here gives a clean path instead of a 500.
  if (supervisor.id === userId) return;

  const settings = await queryOne<{ second: boolean }>(
    'SELECT hours_require_second_check AS second FROM org_settings LIMIT 1',
  );
  const needsSecond = settings?.second ?? false;

  const activity = await queryOne<{
    starts_at: Date | null; ends_at: Date | null; title_ar: string;
  }>('SELECT starts_at, ends_at, title_ar FROM activities WHERE id = $1', [activityId]);
  if (!activity) return;

  let entryId: string | null = null;

  await transaction(async (client) => {
    if (attended) {
      entryId = randomUUID();
      const worked = activity.starts_at ?? new Date();

      await client.query(
        `INSERT INTO hour_entries
           (id, user_id, activity_id, worked_on, started_at, ended_at, minutes,
            note, status, verified_by, verified_at)
         VALUES ($1, $2, $3, $4::DATE, $5, $6, $7, $8, $9, $10, $11)`,
        [
          entryId, userId, activityId, worked,
          activity.starts_at ? new Date(activity.starts_at).toISOString().slice(11, 19) : null,
          activity.ends_at ? new Date(activity.ends_at).toISOString().slice(11, 19) : null,
          minutes,
          text(formData, 'note') || null,
          needsSecond ? 'pending' : 'verified',
          needsSecond ? null : supervisor.id,
          needsSecond ? null : new Date(),
        ],
      );
    }

    await client.query(
      `INSERT INTO activity_attendance
         (id, activity_id, user_id, attended, minutes, confirmed_by, note, hour_entry_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (activity_id, user_id) DO NOTHING`,
      [
        randomUUID(), activityId, userId, attended,
        attended ? minutes : null, supervisor.id,
        text(formData, 'note') || null, entryId,
      ],
    );
  });

  await audit({
    actorId: supervisor.id,
    action: attended ? 'activity.attended' : 'activity.no_show',
    targetType: 'activity',
    targetId: activityId,
    newValue: { userId, minutes: attended ? minutes : 0, verified: attended && !needsSecond },
  });

  // Only verified minutes can be allocated, so there is nothing to do yet
  // when policy says a second person must look.
  if (attended && !needsSecond) {
    try {
      await reallocate(userId);
    } catch (error) {
      console.error('[activities] attendance recorded but allocation failed:', error);
    }
  }

  // Attendance itself earns badges, whether or not the hours needed a second
  // pair of eyes: turning up is the thing being marked.
  await recomputeAchievements(userId).catch((error) =>
    console.error('[activities] achievements not recomputed:', error),
  );

  revalidatePath(`/${lang}/staff/activities/${activityId}`);
  revalidatePath(`/${lang}/staff/hours`);
}
