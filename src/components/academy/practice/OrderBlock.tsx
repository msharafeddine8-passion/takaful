'use client';

import { useMemo, useState } from 'react';
import { hashSeed, shuffleIndices, moveBy, isOrdered } from '@/lib/practice';
import type { Locale } from '@/lib/i18n';

/**
 * Put the steps back in the order they happen.
 *
 * Moved with two buttons per row rather than by dragging. Dragging is awkward
 * on a phone, which is where these courses are actually read, and close to
 * unusable with a keyboard or a screen reader — and "what do I do first" is
 * exactly the material a volunteer needs to be able to practise.
 *
 * Nothing is recorded. The reader can get it wrong as often as they like, and
 * the course's marked questions are somewhere else entirely.
 */

const UI = {
  ar: {
    up: 'حرّك لأعلى', down: 'حرّك لأسفل', check: 'تحقّق', again: 'رتّب من جديد',
    right: '✓ صحيح — هذا هو الترتيب.', wrong: 'ليس بعد. جرّب مرة أخرى.',
    position: 'الموضع {n} من {total}',
  },
  en: {
    up: 'Move up', down: 'Move down', check: 'Check', again: 'Start over',
    right: '✓ That is the order.', wrong: 'Not yet. Try again.',
    position: 'Position {n} of {total}',
  },
} as const;

export function OrderBlock({
  lang, prompt, steps, afterword,
}: {
  lang: Locale;
  prompt: string;
  steps: string[];
  afterword: string;
}) {
  const t = UI[lang];
  /* Seeded from the content, so the server and the browser lay the steps out
   * the same way and the page does not hydrate into a mismatch. */
  const seed = useMemo(() => hashSeed(prompt + steps.join('|')), [prompt, steps]);
  const [order, setOrder] = useState<number[]>(() => shuffleIndices(steps.length, seed));
  const [checked, setChecked] = useState(false);

  const right = isOrdered(order);

  return (
    <div className="my-6 rounded-2xl border border-brand-blue/30 bg-brand-blue/[0.04] p-5">
      <p className="font-extrabold text-brand-blue dark:text-sky-300">{prompt}</p>

      <ol className="mt-4 space-y-2">
        {order.map((original, i) => (
          <li
            key={original}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
          >
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-[0.9rem] font-extrabold"
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 text-[0.95rem] leading-snug">{steps[original]}</span>
            <span className="flex shrink-0 gap-1">
              {/* The accessible name carries the step's own text, so a screen
                  reader user hears which row a button belongs to instead of
                  "Move up" eight times over. */}
              <button
                type="button"
                disabled={i === 0}
                onClick={() => { setOrder(moveBy(order, i, -1)); setChecked(false); }}
                aria-label={`${t.up}: ${steps[original]}`}
                className="grid h-11 w-11 place-items-center rounded-lg border border-line text-[1rem] transition-colors hover:bg-surface-2 disabled:opacity-30"
              >
                <span aria-hidden>↑</span>
              </button>
              <button
                type="button"
                disabled={i === order.length - 1}
                onClick={() => { setOrder(moveBy(order, i, 1)); setChecked(false); }}
                aria-label={`${t.down}: ${steps[original]}`}
                className="grid h-11 w-11 place-items-center rounded-lg border border-line text-[1rem] transition-colors hover:bg-surface-2 disabled:opacity-30"
              >
                <span aria-hidden>↓</span>
              </button>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="inline-flex min-h-11 items-center rounded-full border-2 border-brand-blue px-5 text-[0.92rem] font-extrabold text-brand-blue transition-colors hover:bg-brand-blue/10 dark:border-sky-300 dark:text-sky-300"
        >
          {t.check}
        </button>
        {checked && !right && (
          <button
            type="button"
            onClick={() => { setOrder(shuffleIndices(steps.length, seed + 1)); setChecked(false); }}
            className="inline-flex min-h-11 items-center px-2 text-[0.9rem] font-bold text-ink-3 hover:underline"
          >
            {t.again}
          </button>
        )}
      </div>

      {/* role="status" so the verdict is announced. Without it a screen reader
          user presses Check and nothing at all happens as far as they know. */}
      {checked && (
        <div role="status" className="mt-3">
          <p className={`text-[0.95rem] font-extrabold ${right ? 'text-ok' : 'text-brand-orange-text dark:text-brand-orange'}`}>
            {right ? t.right : t.wrong}
          </p>
          {right && (
            <p className="mt-2 text-[0.94rem] leading-relaxed text-ink-2">{afterword}</p>
          )}
        </div>
      )}
    </div>
  );
}
