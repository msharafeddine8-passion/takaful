'use client';

import { useMemo, useState } from 'react';
import { hashSeed, shuffleIndices, budgetTally } from '@/lib/practice';
import { practiceBlockStrings } from '@/lib/dictionaries/practice-blocks';
import { countPhrase } from '@/lib/when';
import type { Locale } from '@/lib/i18n';

/**
 * There is not enough. Decide what goes.
 *
 * Checkboxes, and that is the whole control. One-of-many is a radio group and
 * some-of-many is a checkbox, and a checkbox arrives knowing how to be tabbed
 * to, toggled with a space bar and announced as ticked or not — none of which
 * a row of aria-pressed buttons reproduces as faithfully. The cost sits inside
 * the label rather than beside it, so the accessible name is "a first-aid kit,
 * 40 dollars" and a reader hearing the page is never told a price without
 * being told what it buys.
 *
 * The running sum is a live region and is the only thing on the page that
 * changes as ticks go in. It has to be: the number is the exercise, and a
 * reader who cannot see it would otherwise be choosing with the constraint
 * invisible, which is the one condition under which this teaches nothing.
 *
 * Overcommitting is allowed and then shown. Refusing the tick that crosses the
 * line is the tempting design and it would quietly teach that a budget cannot
 * be overspent.
 *
 * Nothing is recorded and nothing is marked.
 */

/**
 * The four things that can have happened to a candidate.
 *
 * The same four shapes ReviewBlock uses and deliberately not the same meanings.
 * There, a colour said whether the reader had spotted something; here it says
 * what their spending did — `warn` for money that went where it did not need
 * to, `danger` for the thing that had to be funded and was not. Cutting too
 * deep and padding are both failures and they are not the same failure, so
 * they do not share a colour and they are never added together.
 */
const VERDICT = {
  kept: { border: 'border-ok', text: 'text-ok-text', mark: '✓' },
  cut: { border: 'border-danger', text: 'text-danger-text', mark: '✕' },
  padded: { border: 'border-warn', text: 'text-warn-text', mark: '!' },
  spared: { border: 'border-line', text: 'text-ink-3', mark: '·' },
} as const;

export function BudgetBlock({
  lang, prompt, limit, unit, options, afterword,
}: {
  lang: Locale;
  prompt: string;
  limit: number;
  unit: { zero: string; one: string; two: string; few: string; many: string };
  options: { text: string; cost: number; take: boolean; because: string }[];
  afterword: string;
}) {
  const t = practiceBlockStrings[lang].budget;

  /* Seeded from the content, so the server and the browser lay this out the
   * same way and the page does not hydrate into a mismatch. The authored order
   * puts what survives beside what does not; shuffling stops the file's shape
   * from being readable off the screen. */
  const seed = useMemo(() => hashSeed(prompt + options.map((o) => o.text).join('|')), [prompt, options]);
  const order = useMemo(() => shuffleIndices(options.length, seed), [options.length, seed]);

  const [taken, setTaken] = useState<Record<number, boolean>>({});
  const [checked, setChecked] = useState(false);

  const tally = budgetTally(taken, options, limit);
  const amount = (n: number) => countPhrase(n, unit);

  return (
    <div className="my-6 rounded-2xl border border-brand-blue/30 bg-brand-blue/[0.04] p-5">
      <p className="text-[0.78rem] font-extrabold text-ink-3">{t.kicker}</p>

      <fieldset className="mt-1">
        <legend className="font-extrabold text-ink">{prompt}</legend>

        <ul className="mt-4 space-y-2">
          {order.map((i) => {
            const option = options[i];
            const mine = taken[i] === true;
            const verdict = !checked
              ? null
              : mine
                ? option.take
                  ? 'kept'
                  : 'padded'
                : option.take
                  ? 'cut'
                  : 'spared';
            const style = verdict ? VERDICT[verdict] : null;

            return (
              <li
                key={i}
                className={`rounded-xl border-s-[3px] bg-surface p-3 ${
                  style ? style.border : mine ? 'border-brand-blue' : 'border-line'
                }`}
              >
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[0.95rem] leading-snug">
                  <input
                    type="checkbox"
                    checked={mine}
                    onChange={() => {
                      setTaken((prev) => ({ ...prev, [i]: !prev[i] }));
                      setChecked(false);
                    }}
                    className="h-5 w-5 shrink-0 accent-brand-blue"
                  />
                  <span className="min-w-0 flex-1">{option.text}</span>
                  {/* Inside the label, so the price is never announced apart
                      from the thing it is the price of. */}
                  <span className="shrink-0 text-[0.86rem] font-extrabold text-ink-3">
                    {amount(option.cost)}
                  </span>
                </label>

                {/* The reason, once the list is closed — for what was left out
                    as well as for what was kept. A reader told only that they
                    overspent still does not know which line to cut. */}
                {checked && style && verdict && (
                  <p className="mt-2 ps-8 text-[0.9rem] leading-relaxed text-ink-2">
                    <span className={`font-extrabold ${style.text}`}>
                      {/* A glyph as well as a colour, so the four verdicts are
                          distinguishable without seeing the difference. */}
                      <span aria-hidden className="me-1.5">{style.mark}</span>
                      {t[verdict]}.{' '}
                    </span>
                    {option.because}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      {/*
        role="status" so the sum is announced as it moves. Everywhere else here
        a live region reports a verdict after a button; this one reports the
        constraint itself, which is the only thing that makes the choosing hard.
      */}
      <p
        role="status"
        className={`mt-4 text-[0.94rem] font-extrabold ${tally.over ? 'text-warn-text' : 'text-ink'}`}
      >
        {t.spent.replace('{n}', String(tally.spent)).replace('{limit}', amount(limit))}
        {' — '}
        {tally.over
          ? t.over.replace('{n}', amount(-tally.remaining))
          : t.remaining.replace('{n}', amount(tally.remaining))}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={tally.taken === 0}
          onClick={() => setChecked(true)}
          className="inline-flex min-h-11 items-center rounded-full border-2 border-brand-blue px-5 text-[0.92rem] font-extrabold text-ink disabled:opacity-40"
        >
          {t.check}
        </button>
        {checked && (
          <button
            type="button"
            onClick={() => { setTaken({}); setChecked(false); }}
            className="inline-flex min-h-11 items-center px-2 text-[0.9rem] font-bold text-ink-3 hover:underline"
          >
            {t.again}
          </button>
        )}
      </div>

      {checked && (
        <div role="status" className="mt-3">
          {/* Three numbers, never one. Dropping the kit and paying for the
              banner are different mistakes and a single score would hide
              which of them the reader made. */}
          <p className="text-[0.94rem] font-extrabold text-ink">
            {[
              countPhrase(tally.kept, t.keptCount),
              countPhrase(tally.cut, t.cutCount),
              countPhrase(tally.padded, t.paddedCount),
            ].join(lang === 'ar' ? '، ' : ', ')}
          </p>
          <p className="mt-3 text-[0.78rem] font-extrabold text-ink-3">{t.afterwordHeading}</p>
          <p className="mt-1 text-[0.94rem] leading-relaxed text-ink-2">{afterword}</p>
        </div>
      )}
    </div>
  );
}
