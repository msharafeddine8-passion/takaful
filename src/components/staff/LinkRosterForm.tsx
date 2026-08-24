'use client';

import { useActionState } from 'react';
import { linkAccountToRosterAction, type LinkState } from '@/lib/actions/roster';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';

/**
 * Attach an account to a roster line nobody has claimed.
 *
 * Two fields, because two facts is what it takes: an email that names an
 * account, and the membership number that names the line. The server refuses
 * anything else — an account that already has a number, a line already
 * claimed, and a member of staff trying to link themselves.
 *
 * Kept visually quieter than the approval queue above it. This is the
 * exception; a volunteer proving who they are is the rule, and a form that
 * looked like the main way in would get used as one.
 */

const empty: LinkState = {};

export function LinkRosterForm({
  lang, t,
}: {
  lang: Locale;
  t: Dictionary['account']['staff']['roster'];
}) {
  const [state, formAction, pending] = useActionState(linkAccountToRosterAction, empty);

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="lang" value={lang} />

      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[16rem] flex-1">
          <span className="mb-1.5 block text-[0.86rem] font-bold text-ink-2">{t.linkEmail}</span>
          <input
            name="email"
            type="email"
            autoComplete="off"
            className="min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[0.95rem]"
          />
        </label>
        <label className="w-32">
          <span className="mb-1.5 block text-[0.86rem] font-bold text-ink-2">{t.linkNumber}</span>
          <input
            name="memberNumber"
            inputMode="numeric"
            autoComplete="off"
            dir="ltr"
            className="min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[0.95rem]"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-full border-2 border-brand-blue px-5 text-[0.92rem] font-extrabold text-brand-blue transition-colors hover:bg-brand-blue/10 disabled:opacity-60 dark:border-sky-300 dark:text-sky-300"
        >
          {pending ? t.linkSaving : t.linkSubmit}
        </button>
      </div>

      {/* role="status" on both: the form does not navigate, so without it a
          press appears to do nothing at all to a screen reader user. */}
      {state.error && (
        <p role="status" className="mt-3 text-[0.92rem] font-bold text-danger">
          {t.linkErrors[state.error as keyof typeof t.linkErrors] ?? t.linkErrors.unavailable}
        </p>
      )}
      {state.ok && (
        <p role="status" className="mt-3 text-[0.92rem] font-bold text-ok">
          ✓ {t.linkDone.replace('{who}', state.ok)}
        </p>
      )}
    </form>
  );
}
