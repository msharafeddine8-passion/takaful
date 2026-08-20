'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { joinActivityAction, type JoinResult } from '@/lib/actions/activities';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';

/**
 * Joining, and being told plainly when you cannot.
 *
 * A refusal carries its numbers — "requires Stage 3, you are on Stage 2" —
 * because that is something a volunteer can act on, where "not eligible"
 * only prompts them to ask someone.
 */
export function JoinButton({
  activityId,
  lang,
  dict,
  signedIn,
  current,
}: {
  activityId: string;
  lang: Locale;
  dict: Dictionary;
  signedIn: boolean;
  current: 'registered' | 'waitlisted' | null;
}) {
  const t = dict.account.activities;
  const [result, setResult] = useState<JoinResult | null>(null);
  const [pending, start] = useTransition();

  const status = result?.ok ? result.status : current;

  if (!signedIn) {
    return (
      <Link
        href={`/${lang}/login`}
        className="inline-block rounded-full border border-line px-5 py-2.5 text-[0.92rem] font-bold hover:bg-surface-2"
      >
        {t.signInToJoin}
      </Link>
    );
  }

  if (status) {
    return (
      <p className="text-[0.93rem] font-bold text-emerald-700 dark:text-emerald-400">
        {status === 'waitlisted' ? t.onWaitlist : t.joined}
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setResult(await joinActivityAction(activityId, lang)))}
        className="rounded-full bg-brand-orange px-5 py-2.5 text-[0.92rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
      >
        {t.join}
      </button>

      {result && !result.ok && (
        <p role="alert" className="mt-2.5 text-[0.9rem] font-semibold text-red-600 dark:text-red-400">
          {result.reason === 'stage_too_low'
            ? t.refusedStage
                .replace('{required}', String(result.requiredStage ?? ''))
                .replace('{yours}', String(result.yourStage ?? 0))
            : result.reason === 'already'
              ? t.refusedAlready
              : result.reason === 'not_a_volunteer'
                ? t.refusedNotVolunteer
                : result.reason === 'cancelled'
                  ? t.regState.cancelled
                  : result.reason === 'closed'
                    ? t.refusedClosed
                    : dict.account.errors.generic}
        </p>
      )}
    </div>
  );
}
