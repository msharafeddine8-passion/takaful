'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useCourseProgress } from './CourseProgress';
import { completeCourseAction, type CompleteResult } from '@/lib/actions/courses';
import type { Locale } from '@/lib/i18n';

const UI = {
  ar: {
    title: 'إنهاء الدورة',
    progress: (done: number, total: number) => `أجبت على ${done} من ${total} سؤالاً`,
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
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [pending, startTransition] = useTransition();
  const t = UI[lang];

  if (!progress) return null;

  const done = Object.keys(progress.picks).length;
  const complete = done >= progress.total && progress.total > 0;

  function submit() {
    startTransition(async () => {
      setResult(await completeCourseAction(slug, progress!.picks, lang));
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

      {result?.ok === false && result.reason !== 'unauthenticated' && (
        <p role="alert" className="mt-4 text-[0.96rem] font-semibold text-red-600 dark:text-red-400">
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

          <Link
            href={`/${lang}/account`}
            className="mt-4 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
          >
            {t.viewAccount} →
          </Link>
        </div>
      )}
    </div>
  );
}
