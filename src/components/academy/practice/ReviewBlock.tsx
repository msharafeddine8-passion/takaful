'use client';

import { useState } from 'react';
import { reviewTally } from '@/lib/practice';
import { practiceBlockStrings } from '@/lib/dictionaries/practice-blocks';
import { countPhrase } from '@/lib/when';
import type { Locale } from '@/lib/i18n';

/**
 * A document somebody filed, and what is wrong with it.
 *
 * The one exercise here with no shuffle. Every other block scrambles what it
 * shows so the arrangement cannot be the answer; a form must not be scrambled,
 * because the order of its fields is part of what makes a bad line look
 * ordinary. A date sitting where a date belongs is not read twice.
 *
 * The reader flags lines and then asks to be shown what was missed, in that
 * order and not the other way round. Marking each line as it is pressed would
 * turn this into six small true/false questions and destroy the thing being
 * practised, which is going over a whole page and deciding, unprompted, that
 * something on it is not right.
 *
 * A miss and a false alarm are reported separately and never added up. Missing
 * the line that names a child is not the same mistake as flagging a line that
 * was fine, and a single number would hide which one happened.
 *
 * Nothing is recorded and nothing is marked.
 */

/** The four things that can have happened to a line, and how each reads. */
const VERDICT = {
  caught: { border: 'border-ok', text: 'text-ok-text', mark: '✓' },
  missed: { border: 'border-danger', text: 'text-danger-text', mark: '✕' },
  falseAlarm: { border: 'border-warn', text: 'text-warn-text', mark: '!' },
  sound: { border: 'border-line', text: 'text-ink-3', mark: '·' },
} as const;

export function ReviewBlock({
  lang, prompt, docTitle, lines, afterword,
}: {
  lang: Locale;
  prompt: string;
  docTitle: string;
  lines: { label: string; text: string; wrong?: boolean; note: string }[];
  afterword: string;
}) {
  const t = practiceBlockStrings[lang].review;
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [checked, setChecked] = useState(false);

  const tally = reviewTally(flagged, lines);

  return (
    <div className="my-6 rounded-2xl border border-brand-blue/30 bg-brand-blue/[0.04] p-5">
      <p className="text-[0.78rem] font-extrabold text-ink-3">{t.kicker}</p>
      <p className="mt-1 font-extrabold text-ink">{prompt}</p>

      {/* The document itself, on its own surface, so it reads as a thing that
          was filed rather than as a list of options. */}
      <div className="mt-4 rounded-xl border border-line bg-surface p-4">
        {/* h3: these sit under the module's h1 alongside the block headings,
            which are h2. */}
        <h3 className="text-[1rem] font-extrabold">{docTitle}</h3>

        <ul className="mt-3 space-y-2">
          {lines.map((line, i) => {
            const marked = flagged[i] === true;
            const verdict = !checked
              ? null
              : marked
                ? line.wrong
                  ? 'caught'
                  : 'falseAlarm'
                : line.wrong
                  ? 'missed'
                  : 'sound';
            const style = verdict ? VERDICT[verdict] : null;

            return (
              <li
                key={i}
                className={`rounded-lg border-s-[3px] bg-surface-2 p-3 ${
                  style ? style.border : marked ? 'border-brand-orange' : 'border-line'
                }`}
              >
                <p className="text-[0.76rem] font-extrabold text-ink-3">{line.label}</p>
                <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-2">{line.text}</p>

                {!checked && (
                  <button
                    type="button"
                    aria-pressed={marked}
                    onClick={() => setFlagged((prev) => ({ ...prev, [i]: !prev[i] }))}
                    /* The line's own label in the accessible name, so a screen
                       reader user hears which field a button belongs to rather
                       than "flag this line" six times over. */
                    aria-label={`${marked ? t.unflag : t.flag}: ${line.label}`}
                    className={`mt-2 inline-flex min-h-11 items-center rounded-full border-2 px-4 text-[0.86rem] font-bold ${
                      marked
                        ? 'border-brand-orange bg-brand-orange/15 text-ink'
                        : 'border-line hover:bg-surface'
                    }`}
                  >
                    {marked ? t.unflag : t.flag}
                  </button>
                )}

                {checked && style && verdict && (
                  <>
                    <p className={`mt-2 text-[0.88rem] font-extrabold ${style.text}`}>
                      {/* A glyph as well as a colour, so the four verdicts are
                          distinguishable without seeing the difference. */}
                      <span aria-hidden className="me-1.5">{style.mark}</span>
                      {t[verdict]}
                    </p>
                    {/* The note on the sound lines too. "This one is fine" is a
                        thing a reader can be wrong about in both directions. */}
                    <p className="mt-1 text-[0.9rem] leading-relaxed text-ink-2">{line.note}</p>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!checked ? (
          <button
            type="button"
            onClick={() => setChecked(true)}
            className="inline-flex min-h-11 items-center rounded-full border-2 border-brand-blue px-5 text-[0.92rem] font-extrabold text-ink"
          >
            {t.check}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { setFlagged({}); setChecked(false); }}
            className="inline-flex min-h-11 items-center px-2 text-[0.9rem] font-bold text-ink-3 hover:underline"
          >
            {t.again}
          </button>
        )}
      </div>

      {/* role="status" so the verdict is announced. Without it a screen reader
          user presses the button and nothing at all happens as far as they
          know. */}
      {checked && (
        <div role="status" className="mt-3">
          <p className="text-[0.94rem] font-extrabold text-ink">
            {[
              countPhrase(tally.found, t.found),
              countPhrase(tally.missed, t.slipped),
              countPhrase(tally.falseAlarms, t.overRead),
            ].join(lang === 'ar' ? '، ' : ', ')}
          </p>
          <p className="mt-3 text-[0.78rem] font-extrabold text-ink-3">{t.afterwordHeading}</p>
          <p className="mt-1 text-[0.94rem] leading-relaxed text-ink-2">{afterword}</p>
        </div>
      )}
    </div>
  );
}
