'use client';

import { useActionState } from 'react';
import { registerAction, loginAction } from '@/lib/actions/account';
import { emptyState } from '@/lib/actions/types';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { TextField, FormError, SubmitButton } from './fields';

type Props = { lang: Locale; dict: Dictionary };

export function RegisterForm({ lang, dict }: Props) {
  const t = dict.account.join;
  const errors = dict.account.errors;
  const [state, formAction, pending] = useActionState(registerAction, emptyState);

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="lang" value={lang} />
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

export function LoginForm({ lang, dict }: Props) {
  const t = dict.account.login;
  const errors = dict.account.errors;
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
