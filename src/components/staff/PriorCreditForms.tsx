'use client';

import { useActionState } from 'react';
import { addCarriedHoursAction, recogniseCourseAction, type PriorState } from '@/lib/actions/prior-credit';
import type { Dictionary } from '@/lib/dictionaries';
import { formatDuration } from '@/lib/format';
import type { Locale } from '@/lib/i18n';

/**
 * The two ways staff carry a record forward from before the platform.
 *
 * Both ask for a reason and neither will save without one. These grant the
 * same standing an activity attended and an exam sat would grant, and the only
 * thing that makes them reviewable a year from now is the sentence the person
 * typed when they pressed the button.
 */

const empty: PriorState = {};

type T = Dictionary['account']['staff']['prior'];

function Problem({ code, t }: { code: string; t: T }) {
  return (
    <p role="status" className="mt-3 text-[0.92rem] font-bold text-danger">
      {t.errors[code as keyof typeof t.errors] ?? t.errors.unavailable}
    </p>
  );
}

export function CarriedHoursForm({ lang, userId, t }: { lang: Locale; userId: string; t: T }) {
  const [state, action, pending] = useActionState(addCarriedHoursAction, empty);
  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="userId" value={userId} />

      <div className="flex flex-wrap items-end gap-3">
        <label className="w-28">
          <span className="mb-1.5 block text-[0.86rem] font-bold text-ink-2">{t.hoursLabel}</span>
          <input
            name="hours"
            inputMode="decimal"
            dir="ltr"
            className="min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[0.95rem]"
          />
        </label>
        <label className="w-44">
          <span className="mb-1.5 block text-[0.86rem] font-bold text-ink-2">{t.upToLabel}</span>
          <input
            name="upTo"
            type="date"
            className="min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[0.95rem]"
          />
        </label>
        <label className="min-w-[18rem] flex-1">
          <span className="mb-1.5 block text-[0.86rem] font-bold text-ink-2">{t.noteLabel}</span>
          <input
            name="note"
            placeholder={t.hoursNoteHint}
            className="min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[0.95rem]"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-full border-2 border-brand-blue px-5 text-[0.92rem] font-extrabold text-brand-blue transition-colors hover:bg-brand-blue/10 disabled:opacity-60 dark:border-sky-300 dark:text-sky-300"
        >
          {pending ? t.saving : t.hoursSubmit}
        </button>
      </div>

      {state.error && <Problem code={state.error} t={t} />}
      {state.ok && (
        <p role="status" className="mt-3 text-[0.92rem] font-bold text-ok">
          {/* The action returns minutes; this reads them back as a duration.
              The raw figure was printed against a bare «دقيقة», which is the
              eleven-and-above form, and six minutes is «6 دقائق». It also
              answered in a unit nobody typed: staff enter hours. */}
          ✓ {t.hoursDone.replace('{minutes}', formatDuration(Number(state.ok), lang))}
        </p>
      )}
    </form>
  );
}

export function RecogniseCourseForm({
  lang, userId, courses, t,
}: {
  lang: Locale;
  userId: string;
  courses: { slug: string; title: string }[];
  t: T;
}) {
  const [state, action, pending] = useActionState(recogniseCourseAction, empty);
  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="userId" value={userId} />

      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[16rem] flex-1">
          <span className="mb-1.5 block text-[0.86rem] font-bold text-ink-2">{t.courseLabel}</span>
          <select
            name="slug"
            defaultValue=""
            className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-[0.95rem]"
          >
            <option value="" disabled>
              {t.coursePlaceholder}
            </option>
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[18rem] flex-1">
          <span className="mb-1.5 block text-[0.86rem] font-bold text-ink-2">{t.noteLabel}</span>
          <input
            name="note"
            placeholder={t.courseNoteHint}
            className="min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[0.95rem]"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-full border-2 border-brand-blue px-5 text-[0.92rem] font-extrabold text-brand-blue transition-colors hover:bg-brand-blue/10 disabled:opacity-60 dark:border-sky-300 dark:text-sky-300"
        >
          {pending ? t.saving : t.courseSubmit}
        </button>
      </div>

      {state.error && <Problem code={state.error} t={t} />}
      {state.ok && (
        <p role="status" className="mt-3 text-[0.92rem] font-bold text-ok">
          ✓ {t.courseDone}
        </p>
      )}
    </form>
  );
}
