'use client';

import { useState, useTransition } from 'react';
import { resendVerificationAction } from '@/lib/actions/account';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';

/**
 * Shown to anyone whose address is unproven.
 *
 * It asks rather than blocks. Accounts that existed before verification was
 * introduced are unproven through no fault of their own, and locking them out
 * of a platform they already volunteer through would be punishing them for a
 * change on our side.
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

  return (
    <div className="mt-6 rounded-2xl border border-brand-orange/40 bg-brand-orange/[0.09] p-5">
      <p className="text-[0.96rem] leading-relaxed text-ink-2">{t.unverifiedBanner}</p>

      {!emailConfigured ? (
        <p className="mt-2 text-[0.88rem] font-bold text-brand-orange-dark dark:text-brand-orange">
          {t.noProvider}
        </p>
      ) : sent ? (
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
