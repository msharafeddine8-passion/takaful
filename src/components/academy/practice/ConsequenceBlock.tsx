'use client';

import { useMemo, useState } from 'react';
import { hashSeed, shuffleAnswers, pickProgress } from '@/lib/practice';
import { practiceBlockStrings } from '@/lib/dictionaries/practice-blocks';
import { countPhrase } from '@/lib/when';
import type { Locale } from '@/lib/i18n';

/**
 * Decisions now. The bill weeks later.
 *
 * The withholding is the component. Every other block here answers on the
 * press — a sort colours the bucket, a dialogue says the next line back, a
 * scenario prints the outcome — and each of them is right for what it covers.
 * None of them can hold the failure this curriculum keeps reporting, because
 * that failure's defining property is that it felt fine at the time. Mark it
 * wrong as the button goes down and you have taught a different lesson than
 * the one intended, using the same words.
 *
 * So a decision taken here is echoed back with no judgement at all and the
 * next one is asked. A reader who presses a button and gets nothing reasonably
 * concludes the page is broken, which is why `noFeedback` says out loud that
 * nothing is coming yet. Saying so is not a hint: knowing that the answers are
 * held back tells you nothing about which answer is which.
 *
 * shuffleAnswers rather than shuffleIndices, for the reason BuildBlock uses it:
 * every decision authors the choice that sends no bill first, and a shuffle
 * that may leave index 0 alone makes "press the top one" a winning strategy
 * across three decisions often enough to matter.
 *
 * ── DIRECTION ──────────────────────────────────────────────────────────────
 *
 * No arrow appears anywhere, in this file or in the strings it reads. An arrow
 * meaning "later" points left in Arabic and right in English, and a component
 * handed one as a character cannot flip it. The passage of time is carried by
 * words — the authored `moment` on each decision and `when` over the reckoning
 * — which say the same thing whichever way the page runs.
 *
 * Nothing is recorded and nothing is marked.
 */

export function ConsequenceBlock({
  lang, title, situation, decisions, when, afterword,
}: {
  lang: Locale;
  title: string;
  situation: string;
  decisions: { moment: string; question: string; choices: { text: string; later: string }[] }[];
  when: string;
  afterword: string;
}) {
  const t = practiceBlockStrings[lang].consequence;

  /* Seeded from the content, so the server and the browser lay the choices out
   * the same way and the page does not hydrate into a mismatch. */
  const seed = useMemo(
    () => hashSeed(title + decisions.map((d) => d.question).join('|')),
    [title, decisions],
  );
  const orders = useMemo(
    () => decisions.map((d, i) => shuffleAnswers(d.choices.length, seed + i)),
    [decisions, seed],
  );

  /** One choice index per decision already taken, in order. */
  const [taken, setTaken] = useState<number[]>([]);
  const over = taken.length === decisions.length;

  /* Every decision authors the costless choice first, so the expected answer is
   * zero everywhere — the same arithmetic a build slot does. */
  const reckoning = pickProgress(
    Object.fromEntries(taken.map((choice, i) => [i, choice])),
    decisions.map(() => 0),
  );
  const bills = reckoning.total - reckoning.correct;

  return (
    <div className="my-6 overflow-hidden rounded-2xl border-2 border-brand-orange/40">
      <div className="bg-brand-orange/[0.12] px-5 py-3">
        <p className="text-[0.78rem] font-extrabold text-ink-3">{t.kicker}</p>
        {/* h3: these sit under the module's h1 alongside the block headings,
            which are h2. */}
        <h3 className="mt-1 text-[1.05rem] font-extrabold">{title}</h3>
      </div>

      <div className="bg-surface p-5">
        <p className="text-[0.98rem] leading-relaxed text-ink-2">{situation}</p>

        {/* Said before the first press, and only before it. A reader who taps a
            choice and sees no verdict will otherwise think the block failed. */}
        {taken.length === 0 && (
          <p className="mt-3 border-s-[3px] border-line ps-3 text-[0.9rem] font-bold leading-relaxed text-ink-3">
            {t.noFeedback}
          </p>
        )}

        {/* What has been decided so far, with nothing said about any of it. */}
        {taken.length > 0 && (
          <div className="mt-5">
            <p className="text-[0.78rem] font-extrabold text-ink-3">{t.decided}</p>
            <ol className="mt-2 space-y-2">
              {taken.map((choice, i) => (
                <li key={i} className="rounded-xl border border-line bg-surface-2 p-3">
                  <p className="text-[0.74rem] font-extrabold text-ink-3">{decisions[i].moment}</p>
                  <p className="mt-1 text-[0.94rem] leading-relaxed text-ink-2">
                    {decisions[i].choices[choice].text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {!over && (
          <div className="mt-5">
            <p className="text-[0.78rem] font-extrabold text-ink-3">
              {t.step
                .replace('{n}', String(taken.length + 1))
                .replace('{total}', String(decisions.length))}
              {' · '}
              {decisions[taken.length].moment}
            </p>
            <p className="mt-1 text-[0.98rem] font-bold leading-relaxed">
              {decisions[taken.length].question}
            </p>
            <ul className="mt-2 space-y-2">
              {orders[taken.length].map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => setTaken((prev) => [...prev, c])}
                    className="w-full rounded-xl border-2 border-line p-4 text-start text-[0.95rem] leading-snug hover:bg-surface-2"
                  >
                    {decisions[taken.length].choices[c].text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* role="status" so the reckoning is announced. Without it a screen
            reader user makes the last decision and, once the choices vanish,
            has nothing telling them the page moved on. */}
        {over && (
          <div role="status" className="mt-5 rounded-xl border border-line bg-surface-2 p-4">
            <p className="text-[0.78rem] font-extrabold text-ink-3">{when}</p>
            <p
              className={`mt-1 text-[0.98rem] font-extrabold ${
                bills === 0 ? 'text-ok-text' : 'text-danger-text'
              }`}
            >
              {countPhrase(bills, t.costs)}
            </p>

            <ol className="mt-3 space-y-3">
              {taken.map((choice, i) => {
                const free = choice === 0;
                return (
                  <li
                    key={i}
                    className={`border-s-[3px] ps-3 ${free ? 'border-ok' : 'border-danger'}`}
                  >
                    <p className="text-[0.74rem] font-extrabold text-ink-3">{decisions[i].moment}</p>
                    <p className="mt-1 text-[0.92rem] font-bold leading-relaxed text-ink-2">
                      {decisions[i].choices[choice].text}
                    </p>
                    <p
                      className={`mt-1 text-[0.86rem] font-extrabold ${
                        free ? 'text-ok-text' : 'text-danger-text'
                      }`}
                    >
                      {/* A glyph as well as a colour, so a bill and a clear
                          decision are not told apart by colour alone. */}
                      <span aria-hidden className="me-1.5">{free ? '·' : '✕'}</span>
                      {free ? t.free : t.paid}
                    </p>
                    <p className="mt-1 text-[0.92rem] leading-relaxed text-ink-2">
                      {decisions[i].choices[choice].later}
                    </p>
                  </li>
                );
              })}
            </ol>

            <p className="mt-4 text-[0.78rem] font-extrabold text-ink-3">{t.afterwordHeading}</p>
            <p className="mt-1 text-[0.94rem] leading-relaxed text-ink-2">{afterword}</p>
            <button
              type="button"
              onClick={() => setTaken([])}
              className="mt-3 inline-flex min-h-11 items-center px-2 text-[0.9rem] font-bold text-ink-3 hover:underline"
            >
              {t.restart}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
