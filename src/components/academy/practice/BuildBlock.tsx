'use client';

import { useId, useMemo, useState } from 'react';
import { hashSeed, shuffleAnswers, pickProgress } from '@/lib/practice';
import { practiceBlockStrings } from '@/lib/dictionaries/practice-blocks';
import { countPhrase } from '@/lib/when';
import type { Locale } from '@/lib/i18n';

/**
 * Build the line out of its parts, one choice per part.
 *
 * Radio groups rather than the aria-pressed buttons the other blocks use, and
 * that is a deliberate departure. One-of-many is exactly what a radio group
 * is: it arrives with arrow-key movement between the options, a single tab
 * stop for the whole group, and an announcement of "2 of 4" that no amount of
 * aria on a row of buttons reproduces faithfully. A fieldset and a legend then
 * say which part of the line the group belongs to, which is the piece of
 * information a reader hearing the page would otherwise have to infer from
 * where it sits.
 *
 * shuffleAnswers rather than shuffleIndices: every slot authors its correct
 * option first, and a shuffle that is allowed to leave index 0 in place makes
 * "press the top one in every row" a winning strategy. See lib/practice.ts.
 *
 * Nothing is recorded and nothing is marked.
 */

export function BuildBlock({
  lang, prompt, slots, afterword,
}: {
  lang: Locale;
  prompt: string;
  slots: { label: string; options: string[]; because: string }[];
  afterword: string;
}) {
  const t = practiceBlockStrings[lang].build;
  const groupId = useId();

  /* Seeded from the content, so the server and the browser lay this out the
   * same way and the page does not hydrate into a mismatch. */
  const seed = useMemo(() => hashSeed(prompt + slots.map((s) => s.label).join('|')), [prompt, slots]);
  const orders = useMemo(
    () => slots.map((slot, s) => shuffleAnswers(slot.options.length, seed + s)),
    [slots, seed],
  );

  const [chosen, setChosen] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);

  /* Every slot authors its correct option first, so the expected answer is
   * zero everywhere — see the type declaration. */
  const expected = useMemo(() => slots.map(() => 0), [slots]);
  const progress = pickProgress(chosen, expected);
  const right = progress.correct === progress.total;

  return (
    <div className="my-6 rounded-2xl border border-brand-blue/30 bg-brand-blue/[0.04] p-5">
      <p className="text-[0.78rem] font-extrabold text-ink-3">{t.kicker}</p>
      <p className="mt-1 font-extrabold text-ink">{prompt}</p>

      <div className="mt-4 space-y-3">
        {slots.map((slot, s) => {
          const picked = chosen[s];
          const settled = picked !== undefined;
          const correct = settled && picked === 0;
          return (
            <fieldset
              key={s}
              className={`rounded-xl border-2 bg-surface p-4 ${
                checked && settled ? (correct ? 'border-ok' : 'border-danger') : 'border-line'
              }`}
            >
              <legend className="px-1 text-[0.78rem] font-extrabold text-ink-3">{slot.label}</legend>

              <div className="mt-1 space-y-1">
                {orders[s].map((o) => (
                  <label
                    key={o}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 text-[0.94rem] leading-snug hover:bg-surface-2"
                  >
                    <input
                      type="radio"
                      name={`${groupId}-${s}`}
                      checked={picked === o}
                      onChange={() => { setChosen((prev) => ({ ...prev, [s]: o })); setChecked(false); }}
                      className="h-5 w-5 shrink-0 accent-brand-blue"
                    />
                    <span className="min-w-0 flex-1">{slot.options[o]}</span>
                  </label>
                ))}
              </div>

              {/* The reason, once they have asked — for a wrong part as well as
                  a right one. A tick with no account of what the other options
                  were missing teaches only which button to press. */}
              {checked && settled && (
                <p
                  className={`mt-3 border-s-[3px] ps-3 text-[0.9rem] leading-relaxed text-ink-2 ${
                    correct ? 'border-ok' : 'border-danger'
                  }`}
                >
                  <span className={`font-extrabold ${correct ? 'text-ok-text' : 'text-danger-text'}`}>
                    {/* A glyph as well as a colour, so right and wrong are not
                        carried by colour alone. */}
                    <span aria-hidden>{correct ? '✓ ' : '✕ '}</span>
                    {correct ? t.right : t.wrong}.{' '}
                  </span>
                  {slot.because}
                </p>
              )}
            </fieldset>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={!progress.done}
          onClick={() => setChecked(true)}
          className="inline-flex min-h-11 items-center rounded-full border-2 border-brand-blue px-5 text-[0.92rem] font-extrabold text-ink disabled:opacity-40"
        >
          {t.check}
        </button>
        <p className="text-[0.92rem] font-bold text-ink-2" role="status">
          {countPhrase(progress.total - progress.placed, t.left)}
        </p>
        {checked && (
          <button
            type="button"
            onClick={() => { setChosen({}); setChecked(false); }}
            className="inline-flex min-h-11 items-center px-2 text-[0.9rem] font-bold text-ink-3 hover:underline"
          >
            {t.again}
          </button>
        )}
      </div>

      {/* role="status" so the result is announced. Without it a screen reader
          user presses Check and nothing at all happens as far as they know. */}
      {checked && right && (
        <div role="status" className="mt-4 rounded-xl border border-ok/40 bg-ok/[0.08] p-4">
          <p className="text-[0.78rem] font-extrabold text-ink-3">{t.assembled}</p>
          <p className="mt-1 text-[0.98rem] font-bold leading-relaxed">
            {slots.map((slot) => slot.options[0]).join(' — ')}
          </p>
          <p className="mt-3 text-[0.78rem] font-extrabold text-ink-3">{t.afterwordHeading}</p>
          <p className="mt-1 text-[0.94rem] leading-relaxed text-ink-2">{afterword}</p>
        </div>
      )}
    </div>
  );
}
