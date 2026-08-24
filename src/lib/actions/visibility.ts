'use server';

import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute, queryOne } from '@/lib/db';
import { audit, currentUser } from '@/lib/auth';
import { isLocale, type Locale } from '@/lib/i18n';
import { isVisibilityChoice, visibilityFrom } from '@/lib/visibility';
import type { FormState } from './types';

function localeOf(f: FormData): Locale {
  const v = String(f.get('lang') ?? 'ar');
  return isLocale(v) ? v : 'ar';
}

/**
 * Recording what somebody chose about being named in public.
 *
 * Three things this does that the other profile actions do not need to:
 *
 *   It refuses a value it does not recognise instead of coercing one. Reading
 *   an unknown value falls back to the private option — see visibilityFrom —
 *   because a public page must render something. Writing is the opposite case:
 *   the only source of an unrecognised value here is a request nobody's browser
 *   made, and saving a silent substitute for it would leave the person looking
 *   at a setting they did not pick.
 *
 *   It stamps visibility_chosen_at, which is the difference between a person
 *   who chose privacy and a person who has never been asked. The column is the
 *   association's only evidence of consent, and evidence written by the same
 *   statement as the choice cannot drift from it.
 *
 *   It audits the previous value alongside the new one. "When did I agree to
 *   this?" is asked once, always by somebody upset, and a row that records
 *   only the current state cannot answer it.
 *
 * What it deliberately does not do is read a date of birth or decide anything
 * about age. The person is storing a preference; whether that preference can
 * be honoured on a public page is decided when the page is rendered, by
 * src/lib/visibility.ts. Keeping it out of here means this action never holds
 * a fact about a child, and the profile page never has to be given one.
 */
export async function updateVisibilityAction(
  prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'dbUnavailable' };

  const user = await currentUser();
  if (!user) return { error: 'generic' };

  const choice = String(formData.get('visibility') ?? '');
  if (!isVisibilityChoice(choice)) return { error: 'generic' };

  // An unticked checkbox sends nothing at all, which is the off state.
  const birthday = formData.get('birthdayGreetings') === 'on';

  const before = await queryOne<{ public_visibility: string; birthday_greetings: boolean }>(
    'SELECT public_visibility, birthday_greetings FROM profiles WHERE user_id = $1',
    [user.id],
  );
  if (!before) return { error: 'generic' };

  await execute(
    `UPDATE profiles
        SET public_visibility = $2,
            birthday_greetings = $3,
            visibility_chosen_at = now()
      WHERE user_id = $1`,
    [user.id, choice, birthday],
  );

  await audit({
    actorId: user.id,
    action: 'profile.visibility_changed',
    targetType: 'user',
    targetId: user.id,
    previousValue: {
      visibility: visibilityFrom(before.public_visibility),
      birthdayGreetings: before.birthday_greetings === true,
    },
    newValue: { visibility: choice, birthdayGreetings: birthday },
  });

  revalidatePath(`/${lang}/account/profile`);
  return { attempt: (prev.attempt ?? 0) + 1 };
}
