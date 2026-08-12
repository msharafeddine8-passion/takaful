'use client';

import { useState, useTransition } from 'react';
import type { Locale } from '@/lib/i18n';
import { useCourseProgress } from './CourseProgress';
import { answerQuestionAction } from '@/lib/actions/courses';

/**
 * One question.
 *
 * The correct option is deliberately absent from these props. It used to be
 * passed in, which put the whole answer key in the page source of a course
 * whose certificate is meant to mean something. Tapping an option now asks
 * the server, which records the answer and sends back the verdict and the
 * explanation.
 *
 * `options` arrives already in the order this attempt should show them, so
 * two people sitting the same course do not see the same arrangement, and a
 * reload does not reshuffle.
 */

type Props = {
  lang: Locale;
  slug: string;
  id: string;
  label: string;
  question: string;
  scenario?: string;
  options: string[];
  /** Set when the server has already recorded an answer for this question. */
  previous?: { displayedIndex: number; correct: boolean; feedback: string };
};

const UI = {
  ar: {
    right: '✓ إجابة صحيحة',
    wrong: '✗ ليست الإجابة الأنسب',
    checking: 'جارٍ التحقق…',
    error: 'تعذّر التحقق من الإجابة. حاول مرة أخرى.',
  },
  en: {
    right: '✓ Correct',
    wrong: '✗ Not the best answer',
    checking: 'Checking…',
    error: 'Could not check that answer. Please try again.',
  },
} as const;

export function Quiz({ lang, slug, id, label, question, scenario, options, previous }: Props) {
  const [picked, setPicked] = useState<number | null>(previous?.displayedIndex ?? null);
  const [verdict, setVerdict] = useState<{ correct: boolean; feedback: string } | null>(
    previous ? { correct: previous.correct, feedback: previous.feedback } : null,
  );
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const progress = useCourseProgress();
  const t = UI[lang];
  const letters = lang === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];
  const answered = verdict !== null;

  function choose(index: number) {
    if (answered || pending) return;
    setPicked(index);
    setFailed(false);
    startTransition(async () => {
      const result = await answerQuestionAction(slug, id, index, lang);
      if (!result.ok) {
        // Let them try again rather than stranding the question.
        setPicked(null);
        setFailed(true);
        return;
      }
      setVerdict({ correct: result.correct, feedback: result.feedback });
      progress?.markAnswered(id);
    });
  }

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
          // Only the option they chose is marked. Which one was right is not
          // known here unless they got it right, and the explanation says it.
          const chosen = picked === i;
          const showRight = answered && chosen && verdict.correct;
          const showWrong = answered && chosen && !verdict.correct;
          return (
            <button
              key={i}
              type="button"
              disabled={answered || pending}
              onClick={() => choose(i)}
              aria-pressed={chosen}
              className={`flex items-start gap-3 rounded-xl border-[1.5px] p-3.5 text-start text-[0.96rem] transition-colors ${
                showRight
                  ? 'border-ok bg-ok/10'
                  : showWrong
                    ? 'border-danger bg-danger/10'
                    : answered
                      ? 'border-line bg-ground opacity-60'
                      : 'border-line bg-ground hover:border-brand-blue disabled:opacity-60'
              }`}
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[0.78rem] font-extrabold ${
                  showRight
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

      {pending && <p className="mt-3 text-[0.9rem] text-ink-3">{t.checking}</p>}

      {failed && (
        <p role="alert" className="mt-3 text-[0.92rem] font-semibold text-danger">
          {t.error}
        </p>
      )}

      {verdict && (
        <div
          role="status"
          className={`mt-4 rounded-xl border p-4 text-[0.94rem] leading-relaxed ${
            verdict.correct
              ? 'border-ok/30 bg-ok/10 text-ok'
              : 'border-danger/30 bg-danger/10 text-danger'
          }`}
        >
          <strong className="mb-1 block">{verdict.correct ? t.right : t.wrong}</strong>
          <span className="text-ink-2">{verdict.feedback}</span>
        </div>
      )}
    </div>
  );
}
