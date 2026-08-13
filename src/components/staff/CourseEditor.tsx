'use client';

import { useState, useTransition } from 'react';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/dictionaries';
import {
  updateCourseAction,
  setCourseStatusAction,
  markReviewedAction,
} from '@/lib/actions/programme';

/**
 * One course, collapsed to a row until somebody opens it.
 *
 * Collapsed by default because forty-one open forms is not a page anybody can
 * read, and because the row already carries the four things a programme
 * manager scans for: status, whether content exists, whether it has ever been
 * reviewed, and whether staff have edited it.
 *
 * The client half does no authorisation. Every button here calls a server
 * action that checks the capability again before it touches anything — this
 * component only decides what is worth showing.
 */

export type EditableCourse = {
  slug: string;
  kind: string;
  status: string;
  origin: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  minutes: number;
  passMark: number;
  version: number;
  hasContent: boolean;
  reviewedAt: string | null;
};

const STATUS_TONE: Record<string, string> = {
  published: 'bg-ok/15 text-ok',
  review: 'bg-brand-orange/15 text-brand-orange-text dark:text-brand-orange',
  draft: 'bg-surface-2 text-ink-3',
  archived: 'bg-surface-2 text-ink-3 line-through',
};

export function CourseEditor({
  lang,
  t,
  course,
  mayPublish,
}: {
  lang: Locale;
  t: Dictionary['account']['programme'];
  course: EditableCourse;
  mayPublish: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const statusLabel: Record<string, string> = {
    draft: t.statusDraft,
    review: t.statusReview,
    published: t.statusPublished,
    archived: t.statusArchived,
  };

  const errorLabel: Record<string, string> = {
    noContent: t.cannotPublishEmpty,
    bothLanguages: t.bothLanguagesNeeded,
    forbidden: t.forbidden,
  };

  function run(action: (f: FormData) => Promise<{ ok: boolean; error?: string }>, form: FormData) {
    startTransition(async () => {
      const result = await action(form);
      setMessage(
        result.ok ? t.saved : (errorLabel[result.error ?? ''] ?? (result.error ?? 'error')),
      );
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-12 w-full flex-wrap items-center gap-x-3 gap-y-2 p-4 text-start"
      >
        <span className="flex-1 font-bold">
          {lang === 'ar' ? course.titleAr : course.titleEn}
          <span className="ms-2 font-mono text-[0.78rem] font-normal text-ink-3" dir="ltr">
            {course.slug}
          </span>
        </span>

        <span
          className={`rounded-full px-3 py-1 text-[0.8rem] font-extrabold ${
            STATUS_TONE[course.status] ?? STATUS_TONE.draft
          }`}
        >
          {statusLabel[course.status] ?? course.status}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-[0.8rem] font-bold ${
            course.hasContent ? 'bg-ok/10 text-ok' : 'border border-line text-ink-3'
          }`}
        >
          {course.hasContent ? t.contentWritten : t.contentMissing}
        </span>

        {course.origin === 'admin' && (
          <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-[0.8rem] font-bold text-brand-blue dark:text-sky-300">
            {t.editedByAdmin}
          </span>
        )}

        <span className="text-[0.8rem] text-ink-3">
          {course.reviewedAt ? `${t.reviewedOn} ${course.reviewedAt}` : t.neverReviewed}
        </span>
      </button>

      {open && (
        <div className="border-t border-line p-4">
          <form
            action={(f) => run(updateCourseAction, f)}
            className="grid gap-3 sm:grid-cols-2"
          >
            <input type="hidden" name="slug" value={course.slug} />

            <Field label={t.titleArLabel} name="titleAr" defaultValue={course.titleAr} dir="rtl" />
            <Field label={t.titleEnLabel} name="titleEn" defaultValue={course.titleEn} dir="ltr" />
            <Area label={t.summaryArLabel} name="summaryAr" defaultValue={course.summaryAr} dir="rtl" />
            <Area label={t.summaryEnLabel} name="summaryEn" defaultValue={course.summaryEn} dir="ltr" />

            <Field
              label={t.minutesLabel}
              name="minutes"
              defaultValue={String(course.minutes)}
              type="number"
              dir="ltr"
            />
            <Field
              label={t.passMarkLabel}
              name="passMark"
              defaultValue={String(course.passMark)}
              type="number"
              dir="ltr"
            />

            <div className="sm:col-span-2">
              <Field label={t.noteLabel} name="note" defaultValue="" dir="auto" />
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex min-h-11 items-center rounded-full bg-brand-orange px-6 text-[0.95rem] font-extrabold text-[#241503] disabled:opacity-60"
              >
                {t.save}
              </button>
              <span className="text-[0.82rem] text-ink-3" dir="ltr">
                {t.version} {course.version}
              </span>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            {(['draft', 'review', 'published', 'archived'] as const)
              .filter((s) => s !== course.status)
              // Publishing is the one direction that needs the higher
              // capability, and offering a button that will be refused is worse
              // than not offering it.
              .filter((s) => s !== 'published' || mayPublish)
              .map((status) => (
                <form key={status} action={(f) => run(setCourseStatusAction, f)}>
                  <input type="hidden" name="slug" value={course.slug} />
                  <input type="hidden" name="status" value={status} />
                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-[0.88rem] font-bold hover:bg-surface-2 disabled:opacity-60"
                  >
                    → {statusLabel[status]}
                  </button>
                </form>
              ))}

            <form action={(f) => run(markReviewedAction, f)}>
              <input type="hidden" name="slug" value={course.slug} />
              <button
                type="submit"
                disabled={pending}
                className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-[0.88rem] font-bold hover:bg-surface-2 disabled:opacity-60"
              >
                {t.markReviewed}
              </button>
            </form>
          </div>

          {message && (
            <p role="status" className="mt-3 text-[0.9rem] font-bold text-ink-2">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  dir,
  type = 'text',
}: {
  label: string;
  name: string;
  defaultValue: string;
  dir: 'rtl' | 'ltr' | 'auto';
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.85rem] font-bold text-ink-2">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        dir={dir}
        className="min-h-11 rounded-lg border border-line bg-ground px-3 text-[0.95rem]"
      />
    </label>
  );
}

function Area({
  label,
  name,
  defaultValue,
  dir,
}: {
  label: string;
  name: string;
  defaultValue: string;
  dir: 'rtl' | 'ltr';
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.85rem] font-bold text-ink-2">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        dir={dir}
        rows={3}
        className="rounded-lg border border-line bg-ground p-3 text-[0.95rem] leading-relaxed"
      />
    </label>
  );
}
