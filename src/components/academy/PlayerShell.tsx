'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * The frame around one unit: contents to the side on a desktop, behind a
 * button on a phone.
 *
 * Only the drawer needs the browser, so only the drawer lives here. The
 * contents list itself is passed in already rendered by the server, which
 * keeps the course structure out of the JavaScript bundle and means it is in
 * the HTML for a reader whose scripts never arrive.
 *
 * The desktop copy and the drawer copy are the same nodes rendered twice
 * rather than one column that moves. A single column repositioned by CSS
 * cannot be `inert` in one place and focusable in the other, and a contents
 * list that is off-screen but still in the tab order is the standard way a
 * responsive drawer becomes unusable with a keyboard.
 */
export function PlayerShell({
  nav,
  children,
  showLabel,
  hideLabel,
  contentsLabel,
}: {
  nav: ReactNode;
  children: ReactNode;
  showLabel: string;
  hideLabel: string;
  contentsLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  /*
   * Escape closes it, and focus goes back to the button that opened it.
   * Without the second half, dismissing the drawer drops the keyboard caret
   * at the top of the document and the reader has to tab through the whole
   * page to get back to where they were.
   */
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        opener.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    /* The page behind must not scroll while the drawer is over it. On iOS a
     * scrollable body under a fixed overlay is what makes the overlay feel
     * broken: the finger moves the wrong layer. */
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="lg:grid lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-10">
      {/* ------------------------------------------------ desktop column */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pb-6">
          <h2 className="mb-3 text-[0.8rem] font-extrabold tracking-[0.1em] text-ink-3">
            {contentsLabel}
          </h2>
          {nav}
        </div>
      </aside>

      {/* --------------------------------------------------- phone drawer */}
      <div className="lg:hidden">
        <button
          ref={opener}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-[0.9rem] font-extrabold transition-colors hover:bg-surface-2"
        >
          <span aria-hidden>☰</span>
          {showLabel}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={hideLabel}
            onClick={() => {
              setOpen(false);
              opener.current?.focus();
            }}
            className="absolute inset-0 bg-black/50"
          />
          <div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={contentsLabel}
            /* Anchored to the start edge so it slides in from the side the
             * reader's language runs from — the right in Arabic. */
            className="absolute inset-y-0 start-0 flex w-[min(21rem,88vw)] flex-col bg-surface shadow-2xl outline-none"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line p-4">
              <h2 className="text-[0.95rem] font-extrabold">{contentsLabel}</h2>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  opener.current?.focus();
                }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-[1.1rem] transition-colors hover:bg-surface-2"
              >
                <span aria-hidden>✕</span>
                <span className="sr-only">{hideLabel}</span>
              </button>
            </div>
            {/* Tapping a unit navigates, which unmounts this — no explicit
             * close needed, and none that could get out of step with it. */}
            <div className="flex-1 overflow-y-auto p-4">{nav}</div>
          </div>
        </div>
      )}

      <div className="min-w-0">{children}</div>
    </div>
  );
}
