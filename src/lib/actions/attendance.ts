'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { isDbConfigured, queryOne, transaction } from '@/lib/db';
import { audit } from '@/lib/auth';
import { can, requireCapability } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';

/**
 * Recording who turned up, for a whole activity at once.
 *
 * The old flow saved one person per button press and then refused to hear any
 * more: `ON CONFLICT DO NOTHING` meant a mistake could never be corrected, and
 * anything the supervisor had typed for the others was lost every time the
 * page reloaded. This takes the sheet as one submission, and can be submitted
 * again.
 *
 * Being able to submit again is the whole difficulty, because attendance pays
 * out in volunteer hours. The rule here is that one attendance row owns at
 * most one hour entry, for ever:
 *
 *   present, no entry yet   -> create it
 *   present, entry exists   -> update that same row's minutes
 *   absent,  entry exists   -> reject it, which removes it from every total
 *
 * There is no path that inserts a second entry for the same person and
 * activity, so correcting a duration cannot inflate anybody's hours, and
 * changing "present" to "absent" takes them back off again.
 */

export type AttendanceMark = 'attended' | 'absent' | 'unset';

export type SaveAttendanceState = {
  ok?: boolean;
  saved?: number;
  error?: 'forbidden' | 'cancelled' | 'notFound' | 'unavailable' | 'overLong';
};

function localeOf(f: FormData): Locale {
  const v = String(f.get('lang') ?? 'ar');
  return isLocale(v) ? v : 'ar';
}
const text = (f: FormData, n: string) => String(f.get(n) ?? '').trim();

/** Minutes from separate hour and minute boxes, so "61" never has to be typed
 *  or puzzled over. Non-numeric and negative input collapses to zero, which
 *  the caller then treats as "nothing recorded". */
function minutesFrom(hoursRaw: string, minutesRaw: string): number {
  const h = Number.parseInt(hoursRaw, 10);
  const m = Number.parseInt(minutesRaw, 10);
  const hours = Number.isFinite(h) && h > 0 ? h : 0;
  const mins = Number.isFinite(m) && m > 0 ? m : 0;
  return hours * 60 + mins;
}

export async function saveAttendanceAction(
  _prev: SaveAttendanceState,
  formData: FormData,
): Promise<SaveAttendanceState> {
  const lang = localeOf(formData);
  const activityId = text(formData, 'activityId');
  if (!isDbConfigured() || !activityId) return { error: 'unavailable' };

  const supervisor = await requireCapability('hours.verify');

  const activity = await queryOne<{
    starts_at: Date | null;
    ends_at: Date | null;
    cancelled_at: Date | null;
  }>('SELECT starts_at, ends_at, cancelled_at FROM activities WHERE id = $1', [activityId]);
  if (!activity) return { error: 'notFound' };
  // The database refuses this too; stopping here gives a message instead of a 500.
  if (activity.cancelled_at) return { error: 'cancelled' };

  const scheduled =
    activity.starts_at && activity.ends_at
      ? Math.round((new Date(activity.ends_at).getTime() - new Date(activity.starts_at).getTime()) / 60000)
      : null;

  /*
   * Nobody is credited for longer than the activity ran, unless they hold the
   * capability that exists for the genuine exceptions — the volunteer who
   * stayed to clear up for another hour. Without the ceiling, a typo in a
   * minutes box becomes verified volunteering hours.
   */
  const mayExceed = can(supervisor, 'members.manage');

  const settings = await queryOne<{ second: boolean }>(
    'SELECT hours_require_second_check AS second FROM org_settings LIMIT 1',
  );
  const needsSecond = settings?.second ?? false;

  let saved = 0;
  let refusedOverLong = false;

  await transaction(async (client) => {
    /*
     * The people actually signed up, read inside the transaction. Anyone whose
     * id arrives in the form but is not on this list is ignored: attendance
     * for someone who never registered is an administrative act of its own,
     * not something a form post should be able to do quietly.
     */
    const { rows: registered } = await client.query<{ user_id: string }>(
      `SELECT user_id FROM activity_registrations
        WHERE activity_id = $1 AND status <> 'cancelled'`,
      [activityId],
    );

    for (const { user_id: userId } of registered) {
      const mark = text(formData, `mark.${userId}`) as AttendanceMark;
      if (mark !== 'attended' && mark !== 'absent') continue; // left undecided
      // A CHECK constraint refuses this as well; skipping keeps the rest of
      // the sheet saveable instead of failing the whole submission.
      if (userId === supervisor.id) continue;

      const attended = mark === 'attended';
      const useFull = formData.get(`full.${userId}`) === 'on';
      let minutes = attended
        ? useFull && scheduled
          ? scheduled
          : minutesFrom(text(formData, `hours.${userId}`), text(formData, `minutes.${userId}`))
        : 0;

      if (attended) {
        if (minutes <= 0) minutes = scheduled ?? 60;
        if (scheduled && minutes > scheduled && !mayExceed) {
          refusedOverLong = true;
          minutes = scheduled;
        }
        if (minutes > 1440) minutes = 1440;
      }

      const note = text(formData, `note.${userId}`) || null;

      const { rows: existingRows } = await client.query<{
        id: string; attended: boolean; minutes: number | null; hour_entry_id: string | null;
      }>(
        `SELECT id, attended, minutes, hour_entry_id
           FROM activity_attendance
          WHERE activity_id = $1 AND user_id = $2
          FOR UPDATE`,
        [activityId, userId],
      );
      const existing = existingRows[0] ?? null;

      // Nothing changed: do not write, do not audit, do not touch the hours.
      if (existing && existing.attended === attended && (existing.minutes ?? 0) === minutes) {
        continue;
      }

      let entryId = existing?.hour_entry_id ?? null;

      if (attended) {
        if (entryId) {
          // The same row, so a correction moves the total rather than adding
          // to it. Re-verified, because the figure has changed.
          await client.query(
            `UPDATE hour_entries
                SET minutes = $2,
                    note = $3,
                    status = $4,
                    verified_by = $5,
                    verified_at = $6
              WHERE id = $1`,
            [entryId, minutes, note, needsSecond ? 'pending' : 'verified',
             needsSecond ? null : supervisor.id, needsSecond ? null : new Date()],
          );
        } else {
          entryId = randomUUID();
          const worked = activity.starts_at ?? new Date();
          await client.query(
            `INSERT INTO hour_entries
               (id, user_id, activity_id, worked_on, started_at, ended_at, minutes,
                note, status, verified_by, verified_at)
             VALUES ($1,$2,$3,$4::DATE,$5,$6,$7,$8,$9,$10,$11)`,
            [
              entryId, userId, activityId, worked,
              activity.starts_at ? new Date(activity.starts_at).toISOString().slice(11, 19) : null,
              activity.ends_at ? new Date(activity.ends_at).toISOString().slice(11, 19) : null,
              minutes, note,
              needsSecond ? 'pending' : 'verified',
              needsSecond ? null : supervisor.id,
              needsSecond ? null : new Date(),
            ],
          );
        }
      } else if (entryId) {
        /*
         * Marked absent after having been marked present. Only the status
         * changes: totals count 'pending' and 'verified' alone, so rejecting
         * takes the hours straight back off, while the row keeps the figure it
         * once carried as evidence of what was corrected.
         *
         * The minutes are deliberately left alone — chk_hours_minutes forbids
         * zero on an entry that is not a correction of another, and zeroing it
         * would also destroy the very number the audit trail is for.
         */
        await client.query(
          `UPDATE hour_entries
              SET status = 'rejected',
                  reject_reason = $3,
                  verified_by = $2,
                  verified_at = now()
            WHERE id = $1`,
          // chk_hours_reject_reason insists a rejection says why, and it is
          // right to: the volunteer can see this entry, and hours that vanish
          // without explanation are how someone concludes they were cheated.
          [entryId, supervisor.id, 'سُجِّل الغياب لهذا النشاط بعد أن كان مسجَّلاً حضوراً'],
        );
      }

      await client.query(
        `INSERT INTO activity_attendance
           (id, activity_id, user_id, attended, minutes, confirmed_by, confirmed_at, note, hour_entry_id)
         VALUES ($1,$2,$3,$4,$5,$6,now(),$7,$8)
         ON CONFLICT (activity_id, user_id) DO UPDATE
           SET attended = EXCLUDED.attended,
               minutes = EXCLUDED.minutes,
               confirmed_by = EXCLUDED.confirmed_by,
               confirmed_at = now(),
               note = EXCLUDED.note,
               hour_entry_id = EXCLUDED.hour_entry_id`,
        [
          existing?.id ?? randomUUID(), activityId, userId, attended,
          attended ? minutes : null, supervisor.id, note, entryId,
        ],
      );

      /*
       * Every change is recorded with what it was and what it became, so a
       * duration edited weeks later can still be accounted for. Written on the
       * same connection as the change itself, so the trail cannot survive a
       * rolled-back save or go missing from one that committed.
       */
      await client.query(
        `INSERT INTO audit_logs
           (actor_id, actor_role, action, target_type, target_id, previous_value, new_value, reason)
         VALUES ($1, 'hours.verify', $2, 'activity', $3, $4, $5, $6)`,
        [
          supervisor.id,
          existing ? 'attendance.amended' : 'attendance.recorded',
          activityId,
          existing
            ? JSON.stringify({ userId, attended: existing.attended, minutes: existing.minutes })
            : null,
          JSON.stringify({ userId, attended, minutes: attended ? minutes : 0 }),
          existing ? 'Attendance corrected' : 'Attendance recorded',
        ],
      );

      saved++;
    }
  });

  await audit({
    actorId: supervisor.id,
    action: 'attendance.saved',
    targetType: 'activity',
    targetId: activityId,
    newValue: { people: saved },
  });

  revalidatePath(`/${lang}/staff/activities/${activityId}`);
  revalidatePath(`/${lang}/staff/activities`);
  revalidatePath(`/${lang}/account/hours`);

  return { ok: true, saved, error: refusedOverLong ? 'overLong' : undefined };
}
