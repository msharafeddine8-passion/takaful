'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n';

/**
 * Think, then look.
 *
 * The cheapest of these four and probably the most useful. Having to attempt
 * an answer before seeing one is most of what makes it stay, and the cost is a
 * button. It also fits material where a multiple choice would be false — "what
 * would you say to her?" has no four options.
 *
 * A button and not a <details>: the native element opens on a stray tap while
 * scrolling on a phone, and the whole point is that the reader means to look.
 */

const UI = {
  ar: { think: 'فكّر في إجابتك أولاً', show: 'أظهر الإجابة', hide: 'أخفِ الإجابة' },
  en: { think: 'Work out your answer first', show: 'Show the answer', hide: 'Hide the answer' },
} as const;

export function RevealBlock({
  lang, prompt, answer,
}: {
  lang: Locale;
  prompt: string;
  answer: string;
}) {
  const t = UI[lang];
  const [open, setOpen] = useState(false);

  return (
    <div className="my-6 rounded-2xl border border-line bg-surface-2 p-5">
      <p className="text-[0.78rem] font-extrabold tracking-[0.12em] text-ink-3">{t.think}</p>
      <p className="mt-2 text-[1rem] font-bold leading-relaxed">{prompt}</p>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="mt-4 inline-flex min-h-11 items-center rounded-full border-2 border-brand-blue px-5 text-[0.92rem] font-extrabold text-brand-blue transition-colors hover:bg-brand-blue/10 dark:border-sky-300 dark:text-sky-300"
      >
        {open ? t.hide : t.show}
      </button>

      {open && (
        <p className="mt-4 border-s-[3px] border-brand-blue ps-4 text-[0.96rem] leading-relaxed text-ink-2 dark:border-sky-300">
          {answer}
        </p>
      )}
    </div>
  );
}
