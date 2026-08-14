'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useReducedMotion } from '@/components/lms/a11y';
import { Announcer } from '@/components/lms/Announcer';
import type { Locale } from '@/lib/i18n';
import type { LmsStrings } from '@/lib/dictionaries/lms';
import type { LevelBadgeStanding } from '@/lib/programme/level-badges';

/**
 * The one place on the map where motion is even considered.
 *
 * A learner who has just finished a level should be told so once, on the page
 * they were already going to, and then never again. That is the whole feature:
 * an inline card above the map, a dismiss button, and a note in localStorage
 * so the next visit is quiet.
 *
 * MOTION. `globals.css` blanket-kills animation and transition under
 * `prefers-reduced-motion: reduce`, which is right but is not enough on its
 * own — CSS can strip the animation off a component that still schedules
 * timers, still applies a transform, and still ramps opacity from a starting
 * value the stylesheet never sees. So the branch is taken in JavaScript.
 * `useReducedMotion()` true means a completely static card: no `transition-*`,
 * no `animate-*`, no transform, no opacity ramp, no `setTimeout`, no
 * `requestAnimationFrame`, no auto-dismiss. False permits exactly one thing: a
 * single 220ms fade-and-scale on the medallion, one iteration, nothing that
 * continues after mount. No confetti, no particles, no loop. The keyframes are
 * additionally wrapped in `@media (prefers-reduced-motion: no-preference)`, so
 * the CSS is correct even if the JavaScript guard is ever removed, and the
 * JavaScript is correct even if the stylesheet is.
 *
 * FOCUS. The card does not take focus on mount. Moving focus on page load is
 * itself a WCAG failure, and this repository has no focus-restore machinery to
 * pair with it. The announcement goes through the shared `<Announcer>`; the
 * card is a plain region with a real `<h2>`. Escape dismisses when focus is
 * already inside the card — a handler on the card, never a global listener,
 * so it cannot swallow Escape from anything else on the page.
 *
 * ANNOUNCING. Announcer.tsx states the rule in its own header: a live region
 * that enters the DOM already holding its text is not reliably announced,
 * because assistive technology watches regions it already knows about rather
 * than rescanning the document. This component used to break that rule and
 * therefore, in all likelihood, never said anything at all: it returned null
 * on the first commit, so no region existed, and the commit that revealed the
 * card mounted the region and the congratulation together.
 *
 * The fix is the shape the rule asks for, and it is why this component no
 * longer has an early `return null` anywhere in it:
 *
 *   commit 1  region mounted, empty          (visible === null, card hidden)
 *   commit 2  card decided                   (effect sets `visible`)
 *   commit 3  region filled                  (effect sets `announced`)
 *
 * Two commits with an empty region before there is anything to hear. The card
 * itself is still conditional — only the region is unconditional.
 *
 * SSR. localStorage is read in an effect. Until it has been read the card is
 * not rendered, so the server output and the first client render agree and
 * nothing flashes in and back out. The empty live region is in both.
 */

const STORAGE_KEY = 'takaful.lms.celebrated.v1';

const POP = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes lms-celebrate-pop {
    from { opacity: 0; transform: scale(0.88); }
    to   { opacity: 1; transform: none; }
  }
  .lms-celebrate-pop { animation: lms-celebrate-pop 220ms ease-out 1 both; }
}
`;

function readDismissed(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    // A blocked or full localStorage must not take the page down with it.
    return [];
  }
}

export function Celebration({
  badge,
  lang,
  strings,
  certificateHref,
}: {
  badge: LevelBadgeStanding | null;
  lang: Locale;
  /**
   * A narrow projection, never the whole dictionary. Handing a client
   * component the full `Dictionary` put roughly 55KB into every response the
   * last time it was measured — see src/components/header-strings.ts.
   */
  strings: Pick<
    LmsStrings,
    | 'celebrationTitle'
    | 'celebrationBody'
    | 'celebrationDismiss'
    | 'celebrationViewCertificate'
    | 'badgeEarned'
  >;
  certificateHref: string | null;
}) {
  const reduced = useReducedMotion();
  // Three states, not two: unknown (render nothing, localStorage not read
  // yet), shown, dismissed.
  const [visible, setVisible] = useState<boolean | null>(null);
  // What the live region is currently holding. Null until a commit after the
  // card appears, so the region is in the accessibility tree and empty before
  // it is ever filled.
  const [announced, setAnnounced] = useState<string | null>(null);
  const code = badge?.code ?? null;

  const title = badge ? strings.celebrationTitle.replace('{title}', badge.title[lang]) : null;

  useEffect(() => {
    if (!code) {
      setVisible(false);
      return;
    }
    setVisible(!readDismissed().includes(code));
  }, [code]);

  useEffect(() => {
    // Deliberately a second effect, and deliberately keyed on `visible`: it
    // cannot run until the commit after the one that showed the card, which is
    // the whole point. Merging it into the effect above would put the region
    // and its text in the same commit again.
    if (visible !== true || title === null) return;
    setAnnounced(title);
  }, [visible, title]);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (!code) return;
    try {
      const next = readDismissed();
      if (!next.includes(code)) next.push(code);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Nothing to do: the card closes either way, it will simply return on a
      // later visit. Better than an unhandled exception on the map.
    }
  }, [code]);

  // There is no early return anywhere in this component, on purpose: the live
  // region below is mounted on every commit, including the ones where there is
  // no badge and nothing to say. Only the card is conditional.
  return (
    <>
      <Announcer message={announced} />

      {badge !== null && title !== null && visible === true && (
        <>
          {!reduced && <style>{POP}</style>}
          <section
            aria-labelledby="lms-celebration-title"
            onKeyDown={(event) => {
              if (event.key === 'Escape') dismiss();
            }}
            className="mb-8 rounded-2xl border-2 border-brand-orange bg-brand-orange/[0.08] p-6"
          >
            <div className="flex flex-wrap items-start gap-4">
              <span
                aria-hidden="true"
                className={`grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-blue-deep text-3xl text-white ring-2 ring-brand-orange${
                  reduced ? '' : ' lms-celebrate-pop'
                }`}
              >
                {badge.icon}
              </span>

              <div className="min-w-[16rem] flex-1">
                {/* `uppercase` and the tracking are for the English kicker.
                    Neither reaches the Arabic: uppercase has no effect on a
                    unicased script, and globals.css drops letter-spacing under
                    html[lang="ar"], where 0.14em would have pulled the glyphs
                    of نلته apart at the joins. */}
                <p className="text-[0.8rem] font-extrabold uppercase tracking-[0.14em] text-brand-orange-text dark:text-brand-orange">
                  {strings.badgeEarned}
                </p>
                <h2
                  id="lms-celebration-title"
                  className="mt-1.5 text-[1.3rem] font-extrabold tracking-tight"
                >
                  {title}
                </h2>
                <p className="mt-2 max-w-[60ch] text-[1rem] leading-relaxed text-ink-2">
                  {strings.celebrationBody.replace('{badge}', badge.title[lang])}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {certificateHref && (
                    <Link
                      href={certificateHref as Parameters<typeof Link>[0]['href']}
                      className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-blue px-6 text-[0.95rem] font-extrabold text-white hover:bg-brand-blue-dark"
                    >
                      {strings.celebrationViewCertificate}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={dismiss}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-surface px-6 text-[0.95rem] font-extrabold text-ink hover:bg-surface-2"
                  >
                    {strings.celebrationDismiss}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
