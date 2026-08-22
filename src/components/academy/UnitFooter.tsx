'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { markModuleReadAction } from '@/lib/actions/courses';
import type { Locale } from '@/lib/i18n';

type Labels = {
  next: string;
  prev: string;
  markAndNext: string;
  saving: string;
  savedJust: string;
};

/**
 * Moving on, and recording that you got this far.
 *
 * The old page had two separate controls: a button that said "I have finished
 * this module" and, beside it, a link to the next one. Nothing stopped a
 * reader using the second without the first, and most did — which is why
 * volunteers had modules read but no progress recorded, and why "resume" kept
 * offering them module 1. Marking and moving are one action here.
 *
 * It is still a deliberate press, not a scroll tracker. Scrolling to the
 * bottom of ninety minutes of safeguarding material takes two seconds and
 * says nothing about having read it.
 *
 * The mark is written before the navigation. Firing both together loses the
 * write whenever the new page renders first, and it loses it silently: the
 * reader sees the next module and has no reason to think anything failed.
 */
export function UnitFooter({
  lang,
  slug,
  moduleId,
  done,
  prevHref,
  nextHref,
  labels,
}: {
  lang: Locale;
  slug: string;
  /** Null on the assessment screen, which is not a module and marks nothing. */
  moduleId: string | null;
  done: boolean;
  prevHref: string | null;
  nextHref: string | null;
  labels: Labels;
}) {
  const router = useRouter();
  const [marked, setMarked] = useState(done);
  const [pending, start] = useTransition();

  const needsMark = moduleId !== null && !marked;

  function advance() {
    start(async () => {
      if (moduleId !== null && !marked) {
        await markModuleReadAction(slug, moduleId);
        setMarked(true);
      }
      if (nextHref) router.push(nextHref as Parameters<typeof router.push>[0]);
      /* The contents list and the progress bar are server-rendered from the
       * same records this just wrote. Without the refresh, staying on the
       * last unit leaves a page insisting the module is unread. */
      router.refresh();
    });
  }

  return (
    <div className="mt-10 border-t border-line pt-6">
      <div className="flex flex-wrap items-center gap-3">
        {prevHref ? (
          <Link
            href={prevHref as Parameters<typeof Link>[0]['href']}
            className="inline-flex min-h-12 items-center rounded-full border border-line px-5 text-[0.93rem] font-bold transition-colors hover:bg-surface-2"
          >
            <span aria-hidden className="me-2">
              {lang === 'ar' ? '→' : '←'}
            </span>
            {labels.prev}
          </Link>
        ) : (
          <span />
        )}

        <div className="ms-auto flex flex-wrap items-center gap-3">
          {marked && (
            <span className="text-[0.86rem] font-bold text-ok" role="status">
              ✓ {labels.savedJust}
            </span>
          )}

          {/* One control, whatever it is about to do. A reader who has already
              marked this module still needs a way forward, and a second
              button that appears only sometimes is worse than one whose
              wording changes. */}
          {nextHref || needsMark ? (
            <button
              type="button"
              onClick={advance}
              disabled={pending}
              className="inline-flex min-h-12 items-center rounded-full bg-brand-orange px-6 text-[0.95rem] font-extrabold text-[#241503] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? labels.saving : needsMark ? labels.markAndNext : labels.next}
              {!pending && (
                <span aria-hidden className="ms-2">
                  {lang === 'ar' ? '←' : '→'}
                </span>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
