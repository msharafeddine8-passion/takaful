'use client';

import { useMemo, useState } from 'react';
import { hashSeed, shuffleIndices, sortProgress } from '@/lib/practice';
import type { Locale } from '@/lib/i18n';

/**
 * Put each item in the bucket it belongs in.
 *
 * The exercise most of this curriculum wants: report or discuss, acceptable or
 * not, urgent or routine. Judgement about which side of a line something falls
 * on is the thing volunteers actually get wrong, and reading a list of
 * criteria does not practise it.
 *
 * One button per bucket under each item, rather than dragging — same reasoning
 * as OrderBlock, and here it also means the buckets can be named on the
 * buttons themselves instead of relying on where they sit on the screen.
 *
 * Nothing is recorded and nothing is marked.
 */

const UI = {
  ar: {
    placed: 'وضعت {placed} من {total} — {correct} في مكانها الصحيح',
    reset: 'ابدأ من جديد',
    rightHere: '✓',
    wrongHere: '✕',
  },
  en: {
    placed: '{placed} of {total} placed — {correct} in the right bucket',
    reset: 'Start over',
    rightHere: '✓',
    wrongHere: '✕',
  },
} as const;

export function SortBlock({
  lang, prompt, buckets, items,
}: {
  lang: Locale;
  prompt: string;
  buckets: { id: string; label: string }[];
  items: { text: string; bucket: string; because: string }[];
}) {
  const t = UI[lang];
  const seed = useMemo(() => hashSeed(prompt + items.map((i) => i.text).join('|')), [prompt, items]);
  const order = useMemo(() => shuffleIndices(items.length, seed), [items.length, seed]);
  const [assignment, setAssignment] = useState<Record<number, string>>({});

  const progress = sortProgress(assignment, items);

  return (
    <div className="my-6 rounded-2xl border border-brand-blue/30 bg-brand-blue/[0.04] p-5">
      <p className="font-extrabold text-brand-blue dark:text-sky-300">{prompt}</p>

      <ul className="mt-4 space-y-3">
        {order.map((i) => {
          const item = items[i];
          const chosen = assignment[i];
          const settled = chosen !== undefined;
          const correct = settled && chosen === item.bucket;
          return (
            <li key={i} className="rounded-xl border border-line bg-surface p-4">
              <p className="text-[0.96rem] leading-relaxed">{item.text}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {buckets.map((b) => {
                  const picked = chosen === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      aria-pressed={picked}
                      onClick={() =>
                        setAssignment((prev) => ({ ...prev, [i]: b.id }))
                      }
                      className={`inline-flex min-h-11 items-center rounded-full border-2 px-4 text-[0.9rem] font-bold transition-colors ${
                        picked
                          ? correct
                            ? 'border-ok bg-ok/10 text-ok-text dark:text-ok'
                            : 'border-danger bg-danger/10 text-danger'
                          : 'border-line hover:bg-surface-2'
                      }`}
                    >
                      {/* The tick or cross, so right and wrong are not carried
                          by colour alone. */}
                      {picked && (
                        <span aria-hidden className="me-1.5">
                          {correct ? t.rightHere : t.wrongHere}
                        </span>
                      )}
                      {b.label}
                    </button>
                  );
                })}
              </div>

              {/* The reason, once they have committed — for a wrong answer as
                  well as a right one. Being told only that it is wrong leaves
                  the reader to guess, which is how a wrong idea survives. */}
              {settled && (
                <p
                  role="status"
                  className={`mt-3 border-s-[3px] ps-3 text-[0.92rem] leading-relaxed ${
                    correct ? 'border-ok text-ink-2' : 'border-danger text-ink-2'
                  }`}
                >
                  {item.because}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <p className="text-[0.92rem] font-bold text-ink-2" role="status">
          {t.placed
            .replace('{placed}', String(progress.placed))
            .replace('{total}', String(progress.total))
            .replace('{correct}', String(progress.correct))}
        </p>
        {progress.placed > 0 && (
          <button
            type="button"
            onClick={() => setAssignment({})}
            className="inline-flex min-h-11 items-center px-2 text-[0.9rem] font-bold text-ink-3 hover:underline"
          >
            {t.reset}
          </button>
        )}
      </div>
    </div>
  );
}
