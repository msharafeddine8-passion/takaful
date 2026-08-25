'use client';

import { useId, useMemo, useState } from 'react';
import { hashSeed, shuffleIndices, pickProgress } from '@/lib/practice';
import { practiceBlockStrings } from '@/lib/dictionaries/practice-blocks';
import { countPhrase } from '@/lib/when';
import type { Locale } from '@/lib/i18n';

/**
 * Pair each item with the one thing it goes with.
 *
 * A menu per row rather than a grid of buttons or anything draggable. Four
 * pairs as buttons is sixteen controls, which is a wall on a phone and a very
 * long walk with a keyboard; a <select> is one control per row, arrives with
 * arrow-key navigation and a native "3 of 5" announcement for free, and needs
 * no aria to explain itself. Dragging a card onto a card would be the obvious
 * design and is unusable for a good part of the people this platform is for.
 *
 * Both lists are shuffled, and independently: the rows against the authored
 * order so the first row is not the first pair, and the menu against a
 * different seed so the nth row's answer is not the nth option. Shuffling only
 * one of them leaves the two readable off each other.
 *
 * Nothing is recorded and nothing is marked.
 */

export function MatchBlock({
  lang, prompt, pairs,
}: {
  lang: Locale;
  prompt: string;
  pairs: { left: string; right: string; because: string }[];
}) {
  const t = practiceBlockStrings[lang].match;
  const fieldId = useId();

  /* Seeded from the content, so the server and the browser lay this out the
   * same way and the page does not hydrate into a mismatch. */
  const seed = useMemo(() => hashSeed(prompt + pairs.map((p) => p.left).join('|')), [prompt, pairs]);
  const rows = useMemo(() => shuffleIndices(pairs.length, seed), [pairs.length, seed]);
  /* A second, unrelated seed. Reusing the first would give the menu the same
   * permutation as the rows, which is the one arrangement that lets a reader
   * pair them off without reading either. */
  const menu = useMemo(() => shuffleIndices(pairs.length, hashSeed(`menu:${seed}`)), [pairs.length, seed]);

  const [chosen, setChosen] = useState<Record<number, number>>({});

  /* Authored already paired, so left i belongs with right i and the expected
   * answer for every row is its own index. */
  const expected = useMemo(() => pairs.map((_, i) => i), [pairs]);
  const progress = pickProgress(chosen, expected);
  const remaining = progress.total - progress.placed;

  return (
    <div className="my-6 rounded-2xl border border-brand-blue/30 bg-brand-blue/[0.04] p-5">
      <p className="text-[0.78rem] font-extrabold text-ink-3">{t.kicker}</p>
      <p className="mt-1 font-extrabold text-ink">{prompt}</p>

      <ul className="mt-4 space-y-3">
        {rows.map((i) => {
          const pair = pairs[i];
          const picked = chosen[i];
          const settled = picked !== undefined;
          const correct = settled && picked === i;
          const selectId = `${fieldId}-${i}`;
          return (
            <li key={i} className="rounded-xl border border-line bg-surface p-4">
              <label htmlFor={selectId} className="block text-[0.96rem] font-bold leading-relaxed">
                {pair.left}
              </label>

              <div className="mt-2 flex items-center gap-2">
                {/* The tick or cross, so right and wrong are not carried by
                    colour alone. Outside the select because a control's own
                    text is its value, and an author did not write a ✓ into it. */}
                {settled && (
                  <span
                    aria-hidden
                    className={`text-[1rem] font-extrabold ${correct ? 'text-ok-text' : 'text-danger-text'}`}
                  >
                    {correct ? '✓' : '✕'}
                  </span>
                )}
                <select
                  id={selectId}
                  value={settled ? String(picked) : ''}
                  onChange={(e) =>
                    setChosen((prev) => ({ ...prev, [i]: Number(e.target.value) }))
                  }
                  /* The row's own text in the accessible name, so somebody
                     hearing the page knows which menu they are in rather than
                     five identical "pair with" combo boxes. */
                  aria-label={t.pairWith.replace('{left}', pair.left)}
                  className={`min-h-11 w-full min-w-0 rounded-lg border-2 bg-surface px-3 text-[0.92rem] text-ink ${
                    settled ? (correct ? 'border-ok' : 'border-danger') : 'border-line'
                  }`}
                >
                  <option value="">{t.choose}</option>
                  {menu.map((r) => (
                    <option key={r} value={r}>
                      {pairs[r].right}
                    </option>
                  ))}
                </select>
              </div>

              {/* The reason, once they have committed — for a wrong pairing as
                  well as a right one. Being told only that it is wrong leaves
                  the reader to guess, which is how a wrong idea survives. */}
              {settled && (
                <p
                  role="status"
                  className={`mt-3 border-s-[3px] ps-3 text-[0.92rem] leading-relaxed text-ink-2 ${
                    correct ? 'border-ok' : 'border-danger'
                  }`}
                >
                  {pair.because}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <p className="text-[0.92rem] font-bold text-ink-2" role="status">
          {progress.done
            ? countPhrase(progress.total - progress.correct, t.misplaced)
            : countPhrase(remaining, t.left)}
        </p>
        {progress.placed > 0 && (
          <button
            type="button"
            onClick={() => setChosen({})}
            className="inline-flex min-h-11 items-center px-2 text-[0.9rem] font-bold text-ink-3 hover:underline"
          >
            {t.reset}
          </button>
        )}
      </div>
    </div>
  );
}
