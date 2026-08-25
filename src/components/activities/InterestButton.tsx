'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { markInterestAction, withdrawInterestAction, type InterestState } from '@/lib/actions/interest';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';

/**
 * The button an activity with no date yet offers instead of "register".
 *
 * Registering for something with no date is meaningless — there is nothing to
 * turn up to — but a volunteer who wants to come should not have to keep
 * checking the page. So the offer is honest about what it is: not a place
 * held, just a message promised.
 *
 * Once they have asked, the button becomes the way to stop asking. A
 * commitment that cannot be withdrawn is not one most people make.
 */

const empty: InterestState = {};

export function InterestButton({
  lang, dict, activityId, interested, signedIn,
}: {
  lang: Locale;
  dict: Dictionary;
  activityId: string;
  interested: boolean;
  signedIn: boolean;
}) {
  const t = dict.account.activities.interest;
  const [state, formAction, pending] = useActionState(
    interested ? withdrawInterestAction : markInterestAction,
    empty,
  );

  /*
   * Signed out, this is a link to sign in — not the button.
   *
   * The register button next to it has always done this; this one did not, so
   * a stranger browsing the public opportunities page was offered ten "tell me
   * when it opens" buttons, every one of which would bounce them to the login
   * page the moment they pressed it. Same failure as a locked course offering
   * "start the course": an invitation the server will refuse.
   */
  if (!signedIn) {
    return (
      <Link
        href={`/${lang}/login` as Parameters<typeof Link>[0]['href']}
        className="inline-flex min-h-11 items-center rounded-full border border-line px-5 py-2.5 text-[0.92rem] font-bold hover:bg-surface-2"
      >
        {t.signInToBeTold}
      </Link>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="activityId" value={activityId} />

      <button
        type="submit"
        disabled={pending}
        className={
          interested
            ? 'inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ok bg-ok/10 px-5 py-2.5 text-[0.93rem] font-extrabold text-ok-text disabled:opacity-60'
            : 'inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-brand-blue px-5 py-2.5 text-[0.93rem] font-extrabold text-brand-blue hover:bg-brand-blue/10 disabled:opacity-60 dark:border-sky-300 dark:text-sky-300'
        }
      >
        {/* A tick as well as the colour — the two states have to be
            distinguishable without seeing the difference between green and
            blue. */}
        {interested && <span aria-hidden>✓</span>}
        {pending ? t.saving : interested ? t.waiting : t.notifyMe}
      </button>

      {/* Says what it is not, as well as what it is. Somebody who thinks they
          have a place and turns up to find they never registered has been
          misled by this button. */}
      <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-3">
        {interested ? t.waitingHint : t.notifyMeHint}
      </p>

      {state.error && (
        <p role="alert" className="mt-2 text-[0.86rem] font-bold text-danger-text">
          {t.errors[state.error]}
        </p>
      )}
    </form>
  );
}
