'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { resetPasswordAction, type ResetState } from '@/lib/actions/account';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';

export function ResetForm({
  lang,
  dict,
  token,
}: {
  lang: Locale;
  dict: Dictionary;
  token: string;
}) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPasswordAction, {});
  const t = dict.account.recovery;

  if (state.done) {
    return (
      <div className="mt-8 rounded-2xl border border-ok/40 bg-ok/[0.08] p-6">
        <h2 className="text-[1.1rem] font-extrabold text-ok">{t.resetDoneTitle}</h2>
        <p className="mt-2 leading-relaxed text-ink-2">{t.resetDoneBody}</p>
        <Link
          href={`/${lang}/login`}
          className="mt-4 inline-block rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
        >
          {t.signIn}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="lang" value={lang} />

      <label htmlFor="password" className="mb-1.5 block text-[0.92rem] font-bold">
        {t.newPassword}
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        minLength={10}
        autoComplete="new-password"
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-[1rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
      />

      <label htmlFor="confirm" className="mb-1.5 mt-4 block text-[0.92rem] font-bold">
        {t.confirmPassword}
      </label>
      <input
        id="confirm"
        name="confirm"
        type="password"
        required
        minLength={10}
        autoComplete="new-password"
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-[1rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
      />

      {state.error && (
        <div role="alert" className="mt-4">
          <p className="text-[0.92rem] font-semibold text-danger">
            {state.error === 'generic'
              ? t.resetInvalidBody
              : dict.account.errors[state.error]}
          </p>
          {state.error === 'generic' && (
            <Link
              href={`/${lang}/forgot`}
              className="mt-2 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
            >
              {t.forgotTitle} →
            </Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-full bg-brand-orange px-6 py-3 text-[0.98rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
      >
        {t.setPassword}
      </button>
    </form>
  );
}
