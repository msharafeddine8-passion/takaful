'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * The card, filling the screen, turned on its side.
 *
 * Everything on the membership card is sized in `cqw` — percentages of the
 * card's own width — so the whole thing scales as one object. That is right,
 * and it has a consequence nobody notices on a desktop: on a 320px phone the
 * card is 288px wide, and the three smallest type sizes come out at 6.6px,
 * 7.5px and 8.1px. Those are the membership number and the name. A membership
 * card whose number cannot be read is not a membership card.
 *
 * Widening the card is not available — it is 85.6 × 54mm because that is what
 * an ID-1 card is, and the ratio is the reason it reads as issued rather than
 * as a web page about a person. So the screen is used the other way round:
 * turned ninety degrees, the card's width runs down the long side of the
 * phone. On a 320 × 720 screen that takes it from 288px to about 700px, and
 * 6.6px type becomes 16px.
 *
 * The rotation only happens in portrait. In landscape — and on any desktop —
 * the card is simply scaled up, because turning it would then be the thing
 * making it hard to read.
 *
 * The same React children are rendered in both places rather than a second
 * copy of the card, so there is no way for the full-screen version to fall
 * behind the inline one.
 */

export function CardStage({
  children,
  openLabel,
  closeLabel,
}: {
  children: ReactNode;
  openLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);

    /*
     * Close before printing.
     *
     * While the stage is open the card lives inside the overlay, and the
     * overlay is hidden for print — so a reader who hits Ctrl+P with it open
     * would get a blank sheet. Closing on beforeprint puts the card back in
     * the page in time for the layout the dialog is about to use.
     */
    const onBeforePrint = () => setOpen(false);
    window.addEventListener('beforeprint', onBeforePrint);

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('beforeprint', onBeforePrint);
      document.body.style.overflow = previous;
    };
  }, [open]);

  /* Focus goes back to the button that opened it, or the reader is dropped at
   * the top of the document with no idea where they are. */
  useEffect(() => {
    if (!open) opener.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <>
      <style>{`
        .card-stage-fit {
          /* Rotated, the card's width runs along the screen's height — so it
             is bounded by the viewport height, and by the viewport width
             through its own 85.6:54 ratio. The 0.94 leaves a margin so the
             edges are not flush against the glass. */
          width: min(94vh, calc(94vw * 85.6 / 54));
          transform: translate(-50%, -50%) rotate(90deg);
        }
        @media (orientation: landscape) {
          .card-stage-fit {
            width: min(94vw, calc(94vh * 85.6 / 54));
            transform: translate(-50%, -50%);
          }
        }
        /* Nothing is rotated for print — the print rules own that. */
        @media print { .card-stage-overlay { display: none !important; } }
      `}</style>

      {!open && children}

      <button
        ref={opener}
        type="button"
        onClick={() => setOpen(true)}
        className="no-print min-h-12 rounded-full border border-line px-6 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
      >
        {openLabel}
      </button>

      {open && (
        <div
          ref={panel}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={openLabel}
          className="card-stage-overlay fixed inset-0 z-50 bg-[#08121c] outline-none"
        >
          {/* The whole backdrop closes it. On a phone held up to show somebody
              a card, hunting for a small × is the wrong interaction. */}
          <button
            type="button"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default"
          />

          <div className="card-stage-fit pointer-events-none absolute left-1/2 top-1/2">
            {children}
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute end-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-[1.2rem] text-white backdrop-blur transition-colors hover:bg-white/25"
          >
            <span aria-hidden>✕</span>
            <span className="sr-only">{closeLabel}</span>
          </button>
        </div>
      )}
    </>
  );
}
