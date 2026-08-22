'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { execute, isDbConfigured, queryOne } from '@/lib/db';
import { audit, currentUser } from '@/lib/auth';
import { isLocale, type Locale } from '@/lib/i18n';

/**
 * "Tell me when this one opens."
 *
 * An activity with no date yet cannot be registered for — there is nothing to
 * turn up to. It can be waited for, and this records that: no seat, no
 * capacity, no obligation on either side. When the coordinator sets a time,
 * everybody here is told once, and each of them then decides for themselves
 * whether the day suits them.
 *
 * Interest deliberately does not become a registration. Converting it
 * automatically would fill an activity with people who agreed to hear about it
 * and never agreed to attend it, and the first anybody would know is when they
 * did not show up.
 */

function localeOf(f: FormData): Locale {
  const v = String(f.get('lang') ?? 'ar');
  return isLocale(v) ? v : 'ar';
}

export type InterestState = { error?: 'unavailable' | 'notVolunteer' | 'notWaiting' };

export async function markInterestAction(
  _prev: InterestState,
  formData: FormData,
): Promise<InterestState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'unavailable' };

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  const activityId = String(formData.get('activityId') ?? '').trim();
  if (!activityId) return { error: 'unavailable' };

  /*
   * The same gate the register button uses, and the same function —
   * is_volunteer() reads the membership history in the database, so the two
   * cannot drift into disagreeing about who may put their name down.
   * Opportunities are for volunteers; a learner allowed to register interest
   * would be told later that the activity was never open to them, which is
   * worse than not offering it.
   */
  const standing = await queryOne<{ ok: boolean }>('SELECT is_volunteer($1) AS ok', [user.id]);
  if (!standing?.ok) return { error: 'notVolunteer' };

  /*
   * Only for an activity that is genuinely waiting on a date. Once one is set
   * the button is a registration button, and accepting interest here would
   * quietly record something the volunteer cannot act on.
   */
  const activity = await queryOne<{ id: string; starts_at: Date | null; cancelled_at: Date | null }>(
    'SELECT id, starts_at, cancelled_at FROM activities WHERE id = $1 AND is_published',
    [activityId],
  );
  if (!activity || activity.starts_at !== null || activity.cancelled_at !== null) {
    return { error: 'notWaiting' };
  }

  // Pressing twice is not two people — see the unique constraint.
  await execute(
    `INSERT INTO activity_interest (id, activity_id, user_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (activity_id, user_id) DO NOTHING`,
    [randomUUID(), activityId, user.id],
  );

  await audit({
    actorId: user.id,
    action: 'activity.interested',
    targetType: 'activity',
    targetId: activityId,
  });

  revalidatePath(`/${lang}/opportunities`);
  revalidatePath(`/${lang}/account/activities`);
  return {};
}

/** Changed their mind before a date was ever set. */
export async function withdrawInterestAction(
  _prev: InterestState,
  formData: FormData,
): Promise<InterestState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'unavailable' };

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  const activityId = String(formData.get('activityId') ?? '').trim();
  if (!activityId) return { error: 'unavailable' };

  await execute(
    'DELETE FROM activity_interest WHERE activity_id = $1 AND user_id = $2',
    [activityId, user.id],
  );

  await audit({
    actorId: user.id,
    action: 'activity.uninterested',
    targetType: 'activity',
    targetId: activityId,
  });

  revalidatePath(`/${lang}/opportunities`);
  revalidatePath(`/${lang}/account/activities`);
  return {};
}
