'use server';

import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { revalidatePath } from 'next/cache';
import { isDbConfigured, queryOne, transaction } from '@/lib/db';
import { audit } from '@/lib/auth';
import { can, requireCapability } from '@/lib/authz';
import { reallocate } from '@/lib/allocation';
import { recomputeAchievements } from '@/lib/achievements';
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

/* -------------------------------------------------- the one attendance write */

type AttendanceWrite = {
  activityId: string;
  userId: string;
  attended: boolean;
  /** Already clamped by the caller. Ignored when `attended` is false. */
  minutes: number;
  note: string | null;
  supervisorId: string;
  needsSecond: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  /**
   * The person had no registration for this activity and a member of staff
   * added them by hand. Changes nothing about what is written to the ledger —
   * same minutes, same confirmed_by, same one hour entry — and changes only
   * what the audit line says, because that is the fact somebody may later ask
   * about.
   */
  addedWithoutRegistration: boolean;
};

/**
 * One person's attendance for one activity, written inside a transaction.
 *
 * THE ONLY PLACE ATTENDANCE IS WRITTEN by either of the two ways onto a
 * register — the sheet the supervisor fills in, and the control that adds
 * somebody who turned up without signing up. One function, so that a person
 * added by hand cannot end up with hours computed differently, verified
 * differently or carried by a second hour entry. The rule the module header
 * states — one attendance row owns at most one hour entry, for ever — is
 * enforced here and nowhere else.
 *
 * DUPLICATES ARE IMPOSSIBLE, not merely avoided. The row is locked FOR UPDATE
 * before anything is decided, so two supervisors pressing at once queue rather
 * than race; the insert is ON CONFLICT DO UPDATE on (activity_id, user_id),
 * which the unique index guarantees; and an existing row's `hour_entry_id` is
 * reused, so amending a person moves their hours rather than adding a second
 * lot. Adding somebody who is already on the register therefore corrects what
 * is there. It cannot create a second anything.
 *
 * Returns whether it wrote. False means the stored row already said exactly
 * this, in which case nothing is touched and nothing is audited: a re-submitted
 * sheet must not fill the trail with changes nobody made.
 */
async function writeAttendance(client: PoolClient, w: AttendanceWrite): Promise<boolean> {
  const { rows: existingRows } = await client.query<{
    id: string; attended: boolean; minutes: number | null; hour_entry_id: string | null;
  }>(
    `SELECT id, attended, minutes, hour_entry_id
       FROM activity_attendance
      WHERE activity_id = $1 AND user_id = $2
      FOR UPDATE`,
    [w.activityId, w.userId],
  );
  const existing = existingRows[0] ?? null;
  const minutes = w.attended ? w.minutes : 0;

  // Nothing changed: do not write, do not audit, do not touch the hours.
  if (existing && existing.attended === w.attended && (existing.minutes ?? 0) === minutes) {
    return false;
  }

  let entryId = existing?.hour_entry_id ?? null;

  if (w.attended) {
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
        [entryId, minutes, w.note, w.needsSecond ? 'pending' : 'verified',
         w.needsSecond ? null : w.supervisorId, w.needsSecond ? null : new Date()],
      );
    } else {
      entryId = randomUUID();
      const worked = w.startsAt ?? new Date();
      await client.query(
        `INSERT INTO hour_entries
           (id, user_id, activity_id, worked_on, started_at, ended_at, minutes,
            note, status, verified_by, verified_at)
         VALUES ($1,$2,$3,$4::DATE,$5,$6,$7,$8,$9,$10,$11)`,
        [
          entryId, w.userId, w.activityId, worked,
          w.startsAt ? new Date(w.startsAt).toISOString().slice(11, 19) : null,
          w.endsAt ? new Date(w.endsAt).toISOString().slice(11, 19) : null,
          minutes, w.note,
          w.needsSecond ? 'pending' : 'verified',
          w.needsSecond ? null : w.supervisorId,
          w.needsSecond ? null : new Date(),
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
      [entryId, w.supervisorId, 'سُجِّل الغياب لهذا النشاط بعد أن كان مسجَّلاً حضوراً'],
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
      existing?.id ?? randomUUID(), w.activityId, w.userId, w.attended,
      w.attended ? minutes : null, w.supervisorId, w.note, entryId,
    ],
  );

  /*
   * Every change is recorded with what it was and what it became, so a
   * duration edited weeks later can still be accounted for. Written on the
   * same connection as the change itself, so the trail cannot survive a
   * rolled-back save or go missing from one that committed.
   *
   * A person added without a registration gets its own action name and its own
   * reason, in both cases saying so in words. Somebody reading the log a year
   * later — a coordinator, an auditor, the volunteer — asks how this person
   * came to be on a register they never signed up for, and the answer has to
   * be in the line itself rather than inferable from the absence of a
   * registration row somewhere else.
   */
  const action = w.addedWithoutRegistration
    ? existing
      ? 'attendance.amended_unregistered'
      : 'attendance.added_unregistered'
    : existing
      ? 'attendance.amended'
      : 'attendance.recorded';

  const reason = w.addedWithoutRegistration
    ? existing
      ? 'Attendance corrected for a person added without a registration'
      : 'Added as attending by staff — this person had no registration for this activity'
    : existing
      ? 'Attendance corrected'
      : 'Attendance recorded';

  await client.query(
    `INSERT INTO audit_logs
       (actor_id, actor_role, action, target_type, target_id, previous_value, new_value, reason)
     VALUES ($1, 'hours.verify', $2, 'activity', $3, $4, $5, $6)`,
    [
      w.supervisorId,
      action,
      w.activityId,
      existing
        ? JSON.stringify({ userId: w.userId, attended: existing.attended, minutes: existing.minutes })
        : null,
      JSON.stringify({
        userId: w.userId,
        attended: w.attended,
        minutes,
        withoutRegistration: w.addedWithoutRegistration,
      }),
      reason,
    ],
  );

  return true;
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
     * Who this sheet may write about, read inside the transaction. Anyone whose
     * id arrives in the form but is not on this list is ignored: attendance for
     * someone who never registered is an administrative act of its own, not
     * something a form post should be able to do quietly.
     *
     * Two ways onto the list, and the second is not a loosening of that rule.
     * A registration is one. An attendance row that already exists is the
     * other — and one of those only comes into being because a member of staff
     * deliberately added the person through addAttendeeAction, which does its
     * own capability check and writes its own audit line saying they had no
     * registration. Without this clause somebody added by hand could never be
     * corrected: their row would be on the screen and every save would skip it.
     */
    const { rows: onSheet } = await client.query<{ user_id: string }>(
      `SELECT user_id FROM activity_registrations
        WHERE activity_id = $1 AND status <> 'cancelled'
        UNION
       SELECT user_id FROM activity_attendance
        WHERE activity_id = $1`,
      [activityId],
    );

    for (const { user_id: userId } of onSheet) {
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

      const wrote = await writeAttendance(client, {
        activityId,
        userId,
        attended,
        minutes,
        note,
        supervisorId: supervisor.id,
        needsSecond,
        startsAt: activity.starts_at,
        endsAt: activity.ends_at,
        addedWithoutRegistration: false,
      });
      if (wrote) saved++;
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

/* ------------------------------------ somebody who came but never signed up */

export type AddAttendeeState = {
  /** The name that was added, so the screen can say who rather than "done". */
  added?: string;
  /** True when an existing row was corrected instead of a new one written. */
  amended?: boolean;
  error?:
    | 'forbidden'
    | 'cancelled'
    | 'notFound'
    | 'unavailable'
    | 'noPerson'
    | 'notAVolunteer'
    | 'notYourself'
    | 'unchanged';
};

/**
 * Marking somebody present who never registered.
 *
 * People came to the Mawlid, took part, and were never on a register — nobody
 * had signed them up, so the sheet had no line for them and their hours were
 * simply lost. This is the way to put them on it.
 *
 * ── IT IS THE SAME ATTENDANCE, NOT A SPECIAL KIND ─────────────────────────
 *
 * It goes through `writeAttendance`, exactly as a tick on the sheet does: the
 * same minutes rule, the same `confirmed_by`, the same single hour entry, the
 * same second-check policy. So the hours land in the same ledger, the badges
 * recompute off the same rows, and a month later nothing in this person's
 * record reads differently from anybody else's. The only difference is the
 * audit line, which says they had no registration — see the note in that
 * function on why that fact is written in words.
 *
 * ── EVERY REFUSAL IS RE-ASSERTED HERE ─────────────────────────────────────
 *
 * `hours.verify`, the same capability the sheet requires, asked of authz and
 * not of the screen — a control that is only rendered for staff is not a
 * permission check, and this action is reachable by anybody who can post a
 * form. A cancelled activity is refused; so is crediting yourself, which a
 * CHECK constraint refuses too; and so is anybody `is_volunteer` says is not a
 * volunteer, which is the same test a volunteer signing themselves up has to
 * pass. Adding by hand must not be the way around any of them.
 *
 * ── A DUPLICATE IS A CORRECTION ───────────────────────────────────────────
 *
 * There is no "already added" refusal, because a second insert is not possible:
 * `writeAttendance` locks the row, upserts on (activity_id, user_id) and reuses
 * the hour entry the row already owns. Adding somebody twice amends what is
 * there — and `amended` comes back so the screen can say that is what happened,
 * rather than reporting a fresh addition that did not occur.
 */
export async function addAttendeeAction(
  _prev: AddAttendeeState,
  formData: FormData,
): Promise<AddAttendeeState> {
  const lang = localeOf(formData);
  const activityId = text(formData, 'activityId');
  const userId = text(formData, 'userId');
  if (!isDbConfigured() || !activityId) return { error: 'unavailable' };
  if (!userId) return { error: 'noPerson' };

  const supervisor = await requireCapability('hours.verify');
  if (supervisor.id === userId) return { error: 'notYourself' };

  const activity = await queryOne<{
    starts_at: Date | null;
    ends_at: Date | null;
    cancelled_at: Date | null;
  }>('SELECT starts_at, ends_at, cancelled_at FROM activities WHERE id = $1', [activityId]);
  if (!activity) return { error: 'notFound' };
  if (activity.cancelled_at) return { error: 'cancelled' };

  /* The person, and whether they are a volunteer at all. One statement, so a
   * missing account and a learner give different answers rather than both
   * failing as "not found". */
  const person = await queryOne<{ full_name: string; is_volunteer: boolean }>(
    `SELECT p.full_name, is_volunteer(u.id) AS is_volunteer
       FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE u.id = $1`,
    [userId],
  );
  if (!person) return { error: 'noPerson' };
  if (!person.is_volunteer) return { error: 'notAVolunteer' };

  const scheduled =
    activity.starts_at && activity.ends_at
      ? Math.round((new Date(activity.ends_at).getTime() - new Date(activity.starts_at).getTime()) / 60000)
      : null;

  /* The activity's own length, and the ceiling the sheet applies. A duration
   * is not typed here on purpose: the person is being added because nobody
   * wrote anything down at the time, so the honest default is "as long as the
   * activity ran", and a supervisor who knows better corrects it on the sheet
   * afterwards through the same path. */
  const mayExceed = can(supervisor, 'members.manage');
  let minutes = scheduled ?? 60;
  if (scheduled && minutes > scheduled && !mayExceed) minutes = scheduled;
  if (minutes > 1440) minutes = 1440;

  const settings = await queryOne<{ second: boolean }>(
    'SELECT hours_require_second_check AS second FROM org_settings LIMIT 1',
  );
  const needsSecond = settings?.second ?? false;

  /* Whether there was already a row decides what the screen is told, and it is
   * read inside the transaction that writes — reading it before would be a
   * different question from the one writeAttendance locks and answers. */
  let amended = false;
  let wrote = false;

  await transaction(async (client) => {
    const { rows } = await client.query<{ one: number }>(
      'SELECT 1 AS one FROM activity_attendance WHERE activity_id = $1 AND user_id = $2',
      [activityId, userId],
    );
    amended = rows.length > 0;

    wrote = await writeAttendance(client, {
      activityId,
      userId,
      attended: true,
      minutes,
      note: text(formData, 'note') || null,
      supervisorId: supervisor.id,
      needsSecond,
      startsAt: activity.starts_at,
      endsAt: activity.ends_at,
      addedWithoutRegistration: true,
    });
  });

  /* Already recorded as present for exactly this long. Nothing was written and
   * nothing is claimed — saying "added" would be reporting a change that did
   * not happen. */
  if (!wrote) return { error: 'unchanged', added: person.full_name, amended: true };

  /* Only verified minutes can be allocated, so there is nothing to reallocate
   * yet when policy says a second person must look. Both of these run outside
   * the transaction and neither may take the addition down with it: the
   * attendance and its hours are committed, and a failure to recompute a badge
   * is a stale badge, not a lost record. */
  if (!needsSecond) {
    await reallocate(userId).catch((error) =>
      console.error('[attendance] attendee added but allocation failed:', error),
    );
  }
  await recomputeAchievements(userId).catch((error) =>
    console.error('[attendance] attendee added but achievements not recomputed:', error),
  );

  await audit({
    actorId: supervisor.id,
    action: amended ? 'attendance.amended_unregistered' : 'attendance.added_unregistered',
    targetType: 'user',
    targetId: userId,
    newValue: { activityId, minutes, withoutRegistration: true },
    reason: amended
      ? 'Attendance corrected for a person added without a registration'
      : 'Added as attending by staff — this person had no registration for this activity',
  });

  revalidatePath(`/${lang}/staff/activities/${activityId}`);
  revalidatePath(`/${lang}/staff/activities`);
  revalidatePath(`/${lang}/account/hours`);
  revalidatePath(`/${lang}/account/activities`);

  return { added: person.full_name, amended };
}
