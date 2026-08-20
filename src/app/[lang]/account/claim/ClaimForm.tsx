'use client';

import { useActionState } from 'react';
import { claimRosterAction, type ClaimState } from '@/lib/actions/roster';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { TextField, FormError, SubmitButton } from '@/components/account/fields';

/*
 * Takes only its own slice of the dictionary. A client component's props are
 * serialised into the page, and passing the whole Dictionary would ship every
 * staff label and report heading in the application to a volunteer on a phone.
 */
type Props = { lang: Locale; t: Dictionary['account']['claim'] };

const empty: ClaimState = {};

export function ClaimForm({ lang, t }: Props) {
  const [state, formAction, pending] = useActionState(claimRosterAction, empty);

  return (
    <form action={formAction} noValidate className="mt-6">
      <input type="hidden" name="lang" value={lang} />

      <FormError>
        {state.error === 'needIdentifier'
          ? t.errNeedIdentifier
          : state.error === 'alreadyClaimed'
            ? t.errAlreadyClaimed
            : state.error === 'dbUnavailable'
              ? t.errUnavailable
              : null}
      </FormError>

      {/* Not an error: the roster simply does not have them, and the way
          forward is the ordinary application, offered below the form. */}
      {state.notFound ? (
        <div className="mb-5 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-[1.02rem] font-bold">{t.notFoundTitle}</p>
          <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-2">{t.notFoundBody}</p>
        </div>
      ) : null}

      <TextField name="phone" label={t.phoneLabel} hint={t.phoneHint} type="tel" autoComplete="tel" />
      <TextField name="memberNumber" label={t.numberLabel} hint={t.numberHint} />

      <SubmitButton label={t.submit} pending={pending} />
    </form>
  );
}
