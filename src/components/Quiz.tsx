'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n';

type Props = {
  lang: Locale;
  label: string;
  question: string;
  scenario?: string;
  options: string[];
  correct: number;
  feedback: string;
};

const UI = {
  ar: { right: '✓ إجابة صحيحة', wrong: '✗ ليست الإجابة الأنسب' },
  en: { right: '✓ Correct', wrong: '✗ Not the best answer' },
} as const;

export function Quiz({ lang, label, question, scenario, options, correct, feedback }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const isRight = picked === correct;
  const letters = lang === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];

  return (
    <div className="my-7 rounded-2xl border border-line bg-surface p-6">
      <p className="mb-2 text-[0.76rem] font-extrabold tracking-[0.13em] text-ink-3">{label}</p>
      <p className="mb-4 text-[1.06rem] font-extrabold leading-snug">{question}</p>

      {scenario && (
        <p className="mb-4 rounded-lg border-s-4 border-brand-blue bg-ground p-4 text-[0.95rem] leading-relaxed text-ink-2">
          {scenario}
        </p>
      )}

      <div className="flex flex-col gap-2.5" role="group">
        {options.map((opt, i) => {
          const showCorrect = answered && i === correct;
          const showWrong = answered && i === picked && !isRight;
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => setPicked(i)}
              aria-pressed={picked === i}
              className={`flex items-start gap-3 rounded-xl border-[1.5px] p-3.5 text-start text-[0.96rem] transition-colors ${
                showCorrect
                  ? 'border-ok bg-ok/10'
                  : showWrong
                    ? 'border-danger bg-danger/10'
                    : answered
                      ? 'border-line bg-ground opacity-60'
                      : 'border-line bg-ground hover:border-brand-blue'
              }`}
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[0.78rem] font-extrabold ${
                  showCorrect
                    ? 'border-ok bg-ok text-white'
                    : showWrong
                      ? 'border-danger bg-danger text-white'
                      : 'border-line text-ink-3'
                }`}
              >
                {letters[i] ?? i + 1}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          role="status"
          className={`mt-4 rounded-xl border p-4 text-[0.94rem] leading-relaxed ${
            isRight ? 'border-ok/30 bg-ok/10 text-ok' : 'border-danger/30 bg-danger/10 text-danger'
          }`}
        >
          <strong className="mb-1 block">{isRight ? UI[lang].right : UI[lang].wrong}</strong>
          <span className="text-ink-2">{feedback}</span>
        </div>
      )}
    </div>
  );
}
