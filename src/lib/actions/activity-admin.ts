'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute, query, queryOne, transaction } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';
import { parseLocalInput } from '@/lib/when';
import { notifyIn } from '@/lib/notify';

/**
 * Tells everybody waiting on this activity that it now has a date.
 *
 * Marks each row as it goes, in the same transaction as the messages, so a
 * failure halfway cannot leave some people notified and unmarked — those
 * people would be told again on the next edit. Only rows still waiting are
 * selected, and they are locked for the duration: two coordinators saving the
 * same activity at the same moment would otherwise each send the full set.
 */
async function notifyInterested(
  activityId: string,
  message: { titleAr: string; titleEn: string; bodyAr: string; bodyEn: string; link: string },
): Promise<void> {
  await transaction(async (client) => {
    const { rows } = await client.query<{ id: string; user_id: string }>(
      `SELECT id, user_id FROM activity_interest
        WHERE activity_id = $1 AND notified_at IS NULL
        FOR UPDATE SKIP LOCKED`,
      [activityId],
    );
    if (!rows.length) return;

    for (const row of rows) {
      await notifyIn(client, { userId: row.user_id, kind: 'activity.scheduled', ...message });
    }

    await client.query(
      'UPDATE activity_interest SET notified_at = now() WHERE id = ANY($1::uuid[])',
      [rows.map((r) => r.id)],
    );
  });
}

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

export type ActivityFormState = {
  ok?: boolean;
  id?: string;
  error?:
    | 'required'
    | 'endsBeforeStarts'
    | 'capacityInvalid'
    | 'deadlineAfterStart'
    | 'badUrl'
    | 'unavailable';
  /*
   * What was typed, handed back so a refusal does not empty the form. Without
   * this, a coordinator who fills in a dozen fields and gets the end time
   * wrong loses all twelve — which is how an activity ends up never being
   * written at all.
   */
  values?: Record<string, string>;
};

/** Every text field on the form, echoed verbatim. */
const FORM_FIELDS = [
  'titleAr', 'titleEn', 'descriptionAr', 'descriptionEn', 'activityType', 'audience',
  'location', 'mapUrl', 'imageUrl', 'startsAt', 'endsAt', 'registrationClosesAt',
  'capacity', 'minStage', 'creditedMinutes', 'status',
];

function echo(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of FORM_FIELDS) {
    const value = formData.get(name);
    if (typeof value === 'string' && value !== '') out[name] = value;
  }
  if (formData.get('requiresApproval') === 'on') out.requiresApproval = 'on';
  return out;
}

/** Only http(s), and only when there is something to check. A `javascript:`
 *  href is a script running in a volunteer's session, and this one is rendered
 *  as a link they are invited to tap. */
function safeUrl(raw: string): { ok: boolean; value: string | null } {
  if (!raw) return { ok: true, value: null };
  return /^https?:\/\//i.test(raw) ? { ok: true, value: raw } : { ok: false, value: null };
}

/**
 * Everything both the create and the edit form send, validated once.
 *
 * Each rule is also a constraint in the database — the times, the capacity,
 * the deadline, the URL shapes. Checking here as well is not duplication for
 * its own sake: it returns a named problem the form can show, instead of a
 * constraint violation the volunteer coordinator would meet as a 500.
 */
function readActivityForm(formData: FormData):
  | { ok: false; error: NonNullable<ActivityFormState['error']> }
  | { ok: true; values: Record<string, unknown> } {
  const titleAr = text(formData, 'titleAr');
  const titleEn = text(formData, 'titleEn');
  /* Read as Beirut wall time, not as whatever zone the server or the database
   * session happens to keep — see parseLocalInput. What goes to Postgres is a
   * real instant, so no layer below is left guessing. */
  const startsAt = parseLocalInput(text(formData, 'startsAt'));
  const endsAt = parseLocalInput(text(formData, 'endsAt'));

  if (!titleAr || !titleEn) return { ok: false, error: 'required' };

  /*
   * The times are optional now, because a coordinator often knows an activity
   * is coming long before they know when. Such an activity is published,
   * described, and offers "tell me when this opens" instead of a registration
   * button — see migration 028.
   *
   * Optional as a pair, though, not individually. An end with no start says
   * nothing anybody can act on, and a start with no end breaks the duration
   * the credited hours are read from. Half a schedule is worse than none.
   */
  if (Boolean(startsAt) !== Boolean(endsAt)) return { ok: false, error: 'required' };
  if (startsAt && endsAt && endsAt <= startsAt) return { ok: false, error: 'endsBeforeStarts' };

  const capacityRaw = text(formData, 'capacity');
  const capacity = optionalInt(capacityRaw, 1, 10_000);
  // Typed but unusable is a mistake worth naming; left blank means "no limit".
  if (capacityRaw && capacity === null) return { ok: false, error: 'capacityInvalid' };

  const deadline = parseLocalInput(text(formData, 'registrationClosesAt'));
  // Only comparable when there is a start to compare against. An activity with
  // no date cannot have a deadline that falls after it.
  if (deadline && startsAt && deadline > startsAt) {
    return { ok: false, error: 'deadlineAfterStart' };
  }

  const map = safeUrl(text(formData, 'mapUrl'));
  const image = safeUrl(text(formData, 'imageUrl'));
  if (!map.ok || !image.ok) return { ok: false, error: 'badUrl' };

  return {
    ok: true,
    values: {
      titleAr,
      titleEn,
      descriptionAr: text(formData, 'descriptionAr') || null,
      descriptionEn: text(formData, 'descriptionEn') || null,
      location: text(formData, 'location') || null,
      mapUrl: map.value,
      imageUrl: image.value,
      activityType: text(formData, 'activityType') || null,
      audience: text(formData, 'audience') || null,
      startsAt,
      endsAt,
      registrationClosesAt: deadline,
      capacity,
      minStage: optionalInt(text(formData, 'minStage'), 1, 20),
      creditedMinutes: optionalInt(text(formData, 'creditedMinutes'), 1, 1440),
      requiresApproval: formData.get('requiresApproval') === 'on',
      // Draft unless explicitly published, so a half-written activity does not
      // appear on the public listing while it is still being written.
      isPublished: text(formData, 'status') === 'published',
    },
  };
}

export async function createActivityAction(
  _prev: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'unavailable', values: echo(formData) };

  const parsed = readActivityForm(formData);
  if (!parsed.ok) return { error: parsed.error, values: echo(formData) };
  const v = parsed.values;

  const actor = await requireCapability('activities.manage');
  const id = randomUUID();

  await execute(
    `INSERT INTO activities
       (id, title_ar, title_en, description_ar, description_en, location, map_url,
        image_url, activity_type, audience, starts_at, ends_at, registration_closes_at,
        capacity, min_stage, credited_minutes, requires_approval, is_published,
        led_by, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$19)`,
    [
      id, v.titleAr, v.titleEn, v.descriptionAr, v.descriptionEn, v.location, v.mapUrl,
      v.imageUrl, v.activityType, v.audience, v.startsAt, v.endsAt, v.registrationClosesAt,
      v.capacity, v.minStage, v.creditedMinutes, v.requiresApproval, v.isPublished,
      actor.id,
    ] as Parameters<typeof execute>[1],
  );

  await audit({
    actorId: actor.id,
    action: 'activity.created',
    targetType: 'activity',
    targetId: id,
    newValue: { titleEn: v.titleEn, startsAt: v.startsAt, published: v.isPublished },
  });

  revalidatePath(`/${lang}/staff/activities`);
  revalidatePath(`/${lang}/opportunities`);
  return { ok: true, id };
}

/**
 * Editing an activity that already exists.
 *
 * The previous values are read and audited alongside the new ones, because by
 * the time an activity is edited people have registered for it: moving the
 * date moves their evening, and "it says something different now" is not an
 * account of what happened.
 *
 * Cancellation is not editable here — that is cancelActivityAction, which
 * insists on a reason and tells everyone registered.
 */
export async function editActivityAction(
  _prev: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  const lang = localeOf(formData);
  const id = text(formData, 'activityId');
  if (!isDbConfigured() || !id) return { error: 'unavailable', values: echo(formData) };

  const parsed = readActivityForm(formData);
  if (!parsed.ok) return { error: parsed.error, values: echo(formData) };
  const v = parsed.values;

  const actor = await requireCapability('activities.manage');

  const before = await queryOne<Record<string, unknown>>(
    `SELECT title_ar, title_en, starts_at, ends_at, capacity, location, is_published
       FROM activities WHERE id = $1`,
    [id],
  );
  if (!before) return { error: 'unavailable', values: echo(formData) };

  await execute(
    `UPDATE activities
        SET title_ar = $2, title_en = $3, description_ar = $4, description_en = $5,
            location = $6, map_url = $7, image_url = $8, activity_type = $9,
            audience = $10, starts_at = $11, ends_at = $12, registration_closes_at = $13,
            capacity = $14, min_stage = $15, credited_minutes = $16,
            requires_approval = $17, is_published = $18, updated_at = now()
      WHERE id = $1`,
    [
      id, v.titleAr, v.titleEn, v.descriptionAr, v.descriptionEn, v.location, v.mapUrl,
      v.imageUrl, v.activityType, v.audience, v.startsAt, v.endsAt, v.registrationClosesAt,
      v.capacity, v.minStage, v.creditedMinutes, v.requiresApproval, v.isPublished,
    ] as Parameters<typeof execute>[1],
  );

  /*
   * The moment a waiting activity gets a date, everybody who asked to be told
   * is told — once.
   *
   * The condition is deliberately "it had no start time and now it does", not
   * "the start time changed". An activity whose time is corrected by an hour
   * has not become available; it was already available, and sending the "you
   * can register now" message again would train people to ignore it. The
   * `notified_at IS NULL` guard is the same idea enforced per person, so a
   * second edit cannot reach somebody twice.
   */
  if (before.starts_at === null && v.startsAt !== null) {
    await notifyInterested(id, {
      titleAr: `تحدّد موعد «${v.titleAr}» — يمكنك التسجيل الآن`,
      titleEn: `A date is set for "${v.titleEn}" — you can register now`,
      bodyAr: 'كنت قد طلبت أن نخبرك عندما يُفتح التسجيل لهذا النشاط. الموعد صار معروفاً.',
      bodyEn: 'You asked to be told when this activity opened. The date is now set.',
      link: `/account/activities`,
    });
  }

  await audit({
    actorId: actor.id,
    action: 'activity.edited',
    targetType: 'activity',
    targetId: id,
    previousValue: before,
    newValue: {
      title_ar: v.titleAr, title_en: v.titleEn, starts_at: v.startsAt,
      ends_at: v.endsAt, capacity: v.capacity, location: v.location,
      is_published: v.isPublished,
    },
    reason: 'Activity details edited',
  });

  revalidatePath(`/${lang}/staff/activities`);
  revalidatePath(`/${lang}/staff/activities/${id}`);
  revalidatePath(`/${lang}/opportunities`);
  return { ok: true, id };
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
