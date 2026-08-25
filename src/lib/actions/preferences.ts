'use server';

import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute, queryOne } from '@/lib/db';
import { audit, currentUser } from '@/lib/auth';
import { isLocale, type Locale } from '@/lib/i18n';
import { NOTIFICATION_TOPICS, topicsFrom, type NotificationTopic } from '@/lib/preferences';
import type { FormState } from './types';

function localeOf(f: FormData): Locale {
  const v = String(f.get('lang') ?? 'ar');
  return isLocale(v) ? v : 'ar';
}

/**
 * Recording what somebody would rather not hear about.
 *
 * THE FORM SENDS WHAT IS ON, AND THIS STORES WHAT IS OFF
 *
 * The checkboxes read «أخبرني عن…» because that is the sentence a person can
 * answer; the column stores the subjects they switched off, because a row that
 * does not exist must mean "everything is on" — migration 010 settled that and
 * four hundred accounts have no row. Storing the positive list would make a
 * missing row mean "tell them nothing", and every volunteer who has never
 * opened this page would go silent.
 *
 * An unticked checkbox sends nothing at all, so absence is the off state and
 * the two halves meet here: whatever is not in the form is muted.
 *
 * WHY IT WRITES EVERY SUBJECT EVERY TIME
 *
 * The array is replaced rather than added to. A partial update — muting what
 * was ticked off and leaving the rest — cannot express "I changed my mind and
 * want badges again" without a second code path, and two code paths writing
 * one array is how a preference comes back from the dead.
 *
 * WHAT IT REFUSES
 *
 * A value that is not one of the four is dropped rather than stored. The
 * database would refuse it anyway — chk_muted_topics in migration 037 — but a
 * refusal there arrives as a failed save with nothing to tell the person, and
 * the only source of an unrecognised value here is a request nobody's browser
 * made.
 *
 * NOT MERGED INTO THE VISIBILITY ACTION
 *
 * They sit next to each other on the page and they answer different questions.
 * Visibility is consent to be published — evidence the association may one day
 * have to produce, which is why it stamps visibility_chosen_at. This is a
 * preference about what arrives in somebody's own bell. Folding the two
 * together would mean a person adjusting their notifications re-stamped their
 * consent, and the record would say they agreed to be named on a day they
 * merely turned the badges off.
 */
export async function updatePreferencesAction(
  prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'dbUnavailable' };

  const user = await currentUser();
  if (!user) return { error: 'generic' };

  const wanted = new Set(
    formData
      .getAll('topic')
      .map((v) => String(v))
      .filter((v): v is NotificationTopic => (NOTIFICATION_TOPICS as readonly string[]).includes(v)),
  );
  const muted = NOTIFICATION_TOPICS.filter((topic) => !wanted.has(topic));

  const before = await queryOne<{ muted_topics: string[] | null }>(
    'SELECT muted_topics FROM notification_preferences WHERE user_id = $1',
    [user.id],
  );

  /*
   * Upsert, because most people have no row. The insert supplies only the
   * column this page owns; email_enabled and muted_kinds keep their defaults
   * on the way in and are left untouched on the way through, so a setting made
   * on another screen is not reset by somebody saving this one.
   */
  await execute(
    `INSERT INTO notification_preferences (user_id, muted_topics)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET muted_topics = EXCLUDED.muted_topics`,
    [user.id, [...muted]],
  );

  await audit({
    actorId: user.id,
    action: 'profile.notification_preferences_changed',
    targetType: 'user',
    targetId: user.id,
    previousValue: { mutedTopics: topicsFrom(before?.muted_topics) },
    newValue: { mutedTopics: muted },
  });

  revalidatePath(`/${lang}/account/profile`);
  return { attempt: (prev.attempt ?? 0) + 1 };
}
