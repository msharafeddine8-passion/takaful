'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { requestResetAction, type ResetRequestState } from '@/lib/actions/account';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';

// The two slices this form reads. Passing the whole Dictionary would put every
// string in the application into a page a locked-out volunteer is loading.
export function ForgotForm({
  lang,
  t,
  errors,
}: {
  lang: Locale;
  t: Dictionary['account']['recovery'];
  errors: Dictionary['account']['errors'];
}) {
  const [state, action, pending] = useActionState<ResetRequestState, FormData>(
    requestResetAction,
    {},
  );

  // The same confirmation whether or not the address is registered. Anything
  // else turns this form into a way of checking who has an account here.
  if (state.done) {
    return (
      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-[1.1rem] font-extrabold">{t.sentTitle}</h2>
        <p className="mt-2 leading-relaxed text-ink-2">{t.sentBody}</p>
        <Link
          href={`/${lang}/login`}
          className="mt-4 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {t.signIn} →
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="lang" value={lang} />
      <label htmlFor="email" className="mb-1.5 block text-[0.92rem] font-bold">
        {t.emailLabel}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        dir="ltr"
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-[1rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
      />

      {state.error && (
        <p role="alert" className="mt-3 text-[0.92rem] font-semibold text-danger">
          {errors[state.error]}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-full bg-brand-orange px-6 py-3 text-[0.98rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
      >
        {pending ? t.sending : t.sendLink}
      </button>
    </form>
  );
}
