'use client';

import { useActionState } from 'react';
import { changePasswordAction } from '@/lib/actions/profile';
import { emptyState, type FormState } from '@/lib/actions/types';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';

/**
 * Only the two dictionary slices this form reads. Passing the whole Dictionary
 * would put every string in the application into the client bundle.
 */
export function PasswordForm({
  lang,
  t,
  errors,
}: {
  lang: Locale;
  t: Dictionary['account']['password'];
  errors: Dictionary['account']['errors'];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    changePasswordAction,
    emptyState,
  );

  if (state.done) {
    return (
      <div className="mt-4 rounded-2xl border border-ok/40 bg-ok/[0.08] p-5" role="status">
        <p className="font-extrabold text-ok">{t.done}</p>
        <p className="mt-1.5 text-[0.94rem] leading-relaxed text-ink-2">{t.doneNote}</p>
      </div>
    );
  }

  return (
    // key on attempt so a rejected submission re-mounts with empty fields:
    // a password left sitting in an input after an error is a password on a
    // screen somebody may walk away from.
    <form key={state.attempt} action={action} className="mt-4 max-w-md">
      <input type="hidden" name="lang" value={lang} />

      <Field
        id="currentPassword"
        label={t.current}
        autoComplete="current-password"
        error={state.fields?.currentPassword && errors[state.fields.currentPassword]}
      />
      <Field
        id="newPassword"
        label={t.next}
        autoComplete="new-password"
        error={state.fields?.newPassword && errors[state.fields.newPassword]}
      />
      <Field
        id="confirmPassword"
        label={t.confirm}
        autoComplete="new-password"
        error={state.fields?.confirmPassword && errors[state.fields.confirmPassword]}
      />

      {state.error && (
        <p role="alert" className="mt-3 text-[0.92rem] font-semibold text-danger">
          {errors[state.error]}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
      >
        {pending ? t.saving : t.submit}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  autoComplete: string;
  error?: string;
}) {
  return (
    <div className="mt-4 first:mt-0">
      <label htmlFor={id} className="mb-1.5 block text-[0.92rem] font-bold">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="password"
        required
        minLength={id === 'currentPassword' ? undefined : 10}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-xl border bg-surface px-4 py-3 text-[1rem] outline-none focus:ring-2 focus:ring-brand-blue/25 ${
          error ? 'border-danger' : 'border-line focus:border-brand-blue'
        }`}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[0.88rem] font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
