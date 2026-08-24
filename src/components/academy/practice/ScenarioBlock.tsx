'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n';

/**
 * A situation, and where each response leads.
 *
 * Deliberately not a question with one right answer. Most of what a volunteer
 * faces has several defensible responses and the difference between them is
 * what happens next — so the consequence is the teaching, and the reader is
 * shown it whichever choice they make.
 *
 * `best` is still marked, once they have chosen. Leaving it out would be
 * coy: somebody who picked a workable-but-worse option deserves to know what
 * the association would have done, and a scenario with no view at all reads as
 * though every answer is equally fine.
 */

const UI = {
  ar: {
    whatWouldYouDo: 'ماذا تفعل؟',
    outcome: 'ما يحدث بعدها',
    bestLabel: 'هذا ما تختاره الجمعية',
    tryAnother: 'جرّب خياراً آخر',
  },
  en: {
    whatWouldYouDo: 'What do you do?',
    outcome: 'What happens next',
    bestLabel: 'This is what the association would do',
    tryAnother: 'Try a different response',
  },
} as const;

export function ScenarioBlock({
  lang, title, situation, choices,
}: {
  lang: Locale;
  title: string;
  situation: string;
  choices: { text: string; outcome: string; best?: boolean }[];
}) {
  const t = UI[lang];
  const [picked, setPicked] = useState<number | null>(null);
  const chosen = picked === null ? null : choices[picked];

  return (
    <div className="my-6 overflow-hidden rounded-2xl border-2 border-brand-orange/40">
      <div className="bg-brand-orange/[0.12] px-5 py-3">
        <p className="text-[0.78rem] font-extrabold tracking-[0.12em] text-brand-orange-text dark:text-brand-orange">
          {t.whatWouldYouDo}
        </p>
        {/* h3: these sit under the module's h1 alongside the block headings,
            which are h2. */}
        <h3 className="mt-1 text-[1.05rem] font-extrabold">{title}</h3>
      </div>

      <div className="bg-surface p-5">
        <p className="text-[0.98rem] leading-relaxed text-ink-2">{situation}</p>

        <ul className="mt-4 space-y-2">
          {choices.map((c, i) => {
            const isPicked = picked === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  aria-pressed={isPicked}
                  onClick={() => setPicked(i)}
                  className={`w-full rounded-xl border-2 p-4 text-start text-[0.95rem] leading-snug transition-colors ${
                    isPicked
                      ? 'border-brand-blue bg-brand-blue/[0.07] font-bold dark:border-sky-300'
                      : 'border-line hover:bg-surface-2'
                  }`}
                >
                  {c.text}
                </button>
              </li>
            );
          })}
        </ul>

        {chosen && (
          <div role="status" className="mt-5 rounded-xl border border-line bg-surface-2 p-4">
            <p className="text-[0.78rem] font-extrabold tracking-[0.12em] text-ink-3">
              {t.outcome}
            </p>
            <p className="mt-2 text-[0.96rem] leading-relaxed text-ink-2">{chosen.outcome}</p>

            {chosen.best ? (
              <p className="mt-3 text-[0.92rem] font-extrabold text-ok">✓ {t.bestLabel}</p>
            ) : (
              <p className="mt-3 text-[0.9rem] font-bold text-ink-3">{t.tryAnother}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
