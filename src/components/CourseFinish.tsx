'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCourseProgress } from './CourseProgress';
import { completeCourseAction, type CompleteResult } from '@/lib/actions/courses';
import { countPhrase } from '@/lib/when';
import type { Locale } from '@/lib/i18n';

const UI = {
  ar: {
    title: 'إنهاء الدورة',
    /*
     * The counted noun agrees with the total, and Arabic needs five bands to
     * do it. This said «0 من 7 سؤالاً» — the singular accusative, which
     * belongs to eleven and above. Three to ten takes a plural: «7 أسئلة».
     * It was wrong on every course in the academy, because not one of them
     * asks eleven questions.
     */
    progress: (done: number, total: number) =>
      `أجبت على ${done} من ${countPhrase(total, {
        zero: 'لا أسئلة',
        one: 'سؤال واحد',
        two: 'سؤالين',
        few: '{n} أسئلة',
        many: '{n} سؤالاً',
      })}`,
    incomplete: 'أجب على كل الأسئلة قبل الإنهاء.',
    submit: 'أنهِ الدورة',
    sending: 'جارٍ الحفظ…',
    passed: (score: number) => `✅ نجحت بنتيجة ${score}%`,
    failed: (score: number, mark: number) =>
      `نتيجتك ${score}%، والنجاح يبدأ من ${mark}%. راجع المحتوى وأعد المحاولة — لا يوجد حدّ لعدد المحاولات.`,
    certificate: 'صدرت شهادتك. رمزها:',
    already: 'سُجّلت نتيجتك.',
    signIn: 'سجّل الدخول لحفظ نتيجتك والحصول على شهادة.',
    signInCta: 'تسجيل الدخول',
    error: 'تعذّر الحفظ. حاول مرة أخرى.',
    noAttempt: 'لم نجد محاولة مفتوحة. أعد تحميل الصفحة لتبدأ محاولة جديدة.',
    retake: 'ابدأ محاولة جديدة',
    viewAccount: 'حسابي',
  },
  en: {
    title: 'Finish the course',
    progress: (done: number, total: number) => `You answered ${done} of ${total} questions`,
    incomplete: 'Answer every question before finishing.',
    submit: 'Finish course',
    sending: 'Saving…',
    passed: (score: number) => `✅ Passed with ${score}%`,
    failed: (score: number, mark: number) =>
      `You scored ${score}%, and the pass mark is ${mark}%. Review the material and try again — there is no limit on attempts.`,
    certificate: 'Your certificate has been issued. Code:',
    already: 'Your result has been recorded.',
    signIn: 'Sign in to save your result and receive a certificate.',
    signInCta: 'Sign in',
    error: 'Could not save. Please try again.',
    noAttempt: 'No attempt is open. Reload the page to start a new one.',
    retake: 'Start a new attempt',
    viewAccount: 'My account',
  },
} as const;

export function CourseFinish({
  lang,
  slug,
  passMark,
}: {
  lang: Locale;
  slug: string;
  passMark: number;
}) {
  const progress = useCourseProgress();
  const router = useRouter();
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [pending, startTransition] = useTransition();
  const t = UI[lang];

  if (!progress) return null;

  const done = progress.answered.size;
  const complete = done >= progress.total && progress.total > 0;

  function submit() {
    startTransition(async () => {
      // No answers are sent: they are already recorded, and the score is
      // computed from those. The browser only says "I am finished".
      setResult(await completeCourseAction(slug, lang));
    });
  }

  return (
    <div className="my-10 rounded-2xl border-2 border-brand-blue/30 bg-surface p-6">
      <h2 className="text-[1.2rem] font-extrabold">{t.title}</h2>
      <p className="mt-1.5 text-[0.96rem] text-ink-2">{t.progress(done, progress.total)}</p>

      {!result && (
        <>
          {!complete && <p className="mt-3 text-[0.92rem] text-ink-3">{t.incomplete}</p>}
          <button
            type="button"
            onClick={submit}
            disabled={!complete || pending}
            className="mt-4 rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? t.sending : t.submit}
          </button>
        </>
      )}

      {result?.ok === false && result.reason === 'unauthenticated' && (
        <div className="mt-4">
          <p className="text-[0.96rem] text-ink-2">{t.signIn}</p>
          <Link
            href={`/${lang}/login`}
            className="mt-3 inline-block rounded-full bg-brand-blue px-6 py-3 text-[0.95rem] font-extrabold text-white hover:bg-brand-blue-dark"
          >
            {t.signInCta}
          </Link>
        </div>
      )}

      {result?.ok === false && result.reason === 'no_attempt' && (
        <div className="mt-4">
          <p role="alert" className="text-[0.96rem] text-ink-2">
            {t.noAttempt}
          </p>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="mt-3 rounded-full border border-line px-5 py-2.5 text-[0.92rem] font-bold hover:bg-surface-2"
          >
            {t.retake}
          </button>
        </div>
      )}

      {result?.ok === false &&
        result.reason !== 'unauthenticated' &&
        result.reason !== 'no_attempt' && (
          <p
            role="alert"
            className="mt-4 text-[0.96rem] font-semibold text-red-600 dark:text-red-400"
          >
            {t.error}
          </p>
        )}

      {result?.ok && (
        <div className="mt-4">
          {result.passed ? (
            <p className="text-[1.1rem] font-extrabold text-emerald-700 dark:text-emerald-400">
              {t.passed(result.score)}
            </p>
          ) : (
            <p className="text-[0.98rem] leading-relaxed text-ink-2">
              {t.failed(result.score, passMark)}
            </p>
          )}

          {result.certificateCode && (
            <p className="mt-3 text-[0.96rem]">
              {t.certificate}{' '}
              <span className="font-mono font-bold tracking-wider" dir="ltr">
                {result.certificateCode}
              </span>
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link
              href={`/${lang}/account`}
              className="font-bold text-brand-blue hover:underline dark:text-brand-orange"
            >
              {t.viewAccount} →
            </Link>
            {!result.passed && (
              // Reloading opens a fresh attempt, with the questions and the
              // options in a new order.
              <button
                type="button"
                onClick={() => router.refresh()}
                className="rounded-full border border-line px-5 py-2.5 text-[0.92rem] font-bold hover:bg-surface-2"
              >
                {t.retake}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
