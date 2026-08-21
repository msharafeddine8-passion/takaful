'use client';

import { useState, useTransition } from 'react';
import { resendVerificationAction } from '@/lib/actions/account';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';

/**
 * Shown to anyone whose address is unproven — but only when they could
 * actually do something about it.
 *
 * It asks rather than blocks. Accounts that existed before verification was
 * introduced are unproven through no fault of their own, and locking them out
 * of a platform they already volunteer through would be punishing them for a
 * change on our side.
 *
 * With no mail provider configured it says nothing at all. It used to render a
 * warning followed by "sending mail is not enabled on this site yet, so the
 * link will not arrive" — a standing instruction to press a button that cannot
 * work, on the first screen a new volunteer sees. A demand nobody can satisfy
 * does not read as a caveat; it reads as a broken site. Whether the address is
 * proven is worth knowing when it can be proven, and noise when it cannot.
 */
export function VerifyBanner({
  lang,
  dict,
  emailConfigured,
}: {
  lang: Locale;
  dict: Dictionary;
  emailConfigured: boolean;
}) {
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const t = dict.account.recovery;

  if (!emailConfigured) return null;

  return (
    <div className="mt-6 rounded-2xl border border-brand-orange/40 bg-brand-orange/[0.09] p-5">
      <p className="text-[0.96rem] leading-relaxed text-ink-2">{t.unverifiedBanner}</p>

      {sent ? (
        <p role="status" className="mt-2 text-[0.9rem] font-bold text-ok">
          {t.resent}
        </p>
      ) : (
        <form
          action={(formData) =>
            startTransition(async () => {
              await resendVerificationAction(formData);
              setSent(true);
            })
          }
        >
          <input type="hidden" name="lang" value={lang} />
          <button
            type="submit"
            disabled={pending}
            className="mt-3 rounded-full border border-line bg-surface px-5 py-2.5 text-[0.9rem] font-bold transition-colors hover:bg-surface-2 disabled:opacity-60"
          >
            {pending ? t.sending : t.resend}
          </button>
        </form>
      )}
    </div>
  );
}
