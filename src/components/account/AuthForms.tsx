'use client';

import { useActionState } from 'react';
import { registerAction, loginAction } from '@/lib/actions/account';
import { emptyState } from '@/lib/actions/types';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { TextField, FormError, SubmitButton } from './fields';

/*
 * These take the two slices they read rather than the whole Dictionary.
 *
 * A client component's props are serialised into the page, so `dict:
 * Dictionary` on a form put every string in the application — staff labels,
 * report headings, hour statuses — into the sign-in page of a site whose
 * volunteers are on phones. Sign-in and registration are the first thing a
 * stranger loads, so they are the worst place to pay for it.
 */
type Errors = Dictionary['account']['errors'];
type RegisterProps = {
  lang: Locale;
  t: Dictionary['account']['join'];
  errors: Errors;
  /** Which door they came in by, so registration ends where they meant to go:
   *  a new volunteer at the application form, an existing one at the roster
   *  claim, a learner at their account. */
  next?: 'new-volunteer' | 'volunteer' | 'learner';
};
type LoginProps = { lang: Locale; t: Dictionary['account']['login']; errors: Errors };

export function RegisterForm({ lang, t, errors, next }: RegisterProps) {
  const [state, formAction, pending] = useActionState(registerAction, emptyState);

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="lang" value={lang} />
      {next && <input type="hidden" name="next" value={next} />}
      <FormError>{state.error ? errors[state.error] : null}</FormError>

      <TextField
        name="fullName"
        label={t.fullName}
        autoComplete="name"
        required
        error={state.fields?.fullName ? errors[state.fields.fullName] : undefined}
      />
      <TextField
        name="email"
        label={t.email}
        type="email"
        autoComplete="email"
        required
        error={state.fields?.email ? errors[state.fields.email] : undefined}
      />
      <TextField
        name="password"
        label={t.password}
        type="password"
        hint={t.passwordHint}
        autoComplete="new-password"
        required
        error={state.fields?.password ? errors[state.fields.password] : undefined}
      />
      <TextField
        name="confirm"
        label={t.confirm}
        type="password"
        autoComplete="new-password"
        required
        error={state.fields?.confirm ? errors[state.fields.confirm] : undefined}
      />

      <SubmitButton label={t.submit} pending={pending} />
    </form>
  );
}

export function LoginForm({ lang, t, errors }: LoginProps) {
  const [state, formAction, pending] = useActionState(loginAction, emptyState);

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="lang" value={lang} />
      <FormError>{state.error ? errors[state.error] : null}</FormError>

      <TextField name="email" label={t.email} type="email" autoComplete="email" required />
      <TextField
        name="password"
        label={t.password}
        type="password"
        autoComplete="current-password"
        required
      />

      <SubmitButton label={t.submit} pending={pending} />
    </form>
  );
}
