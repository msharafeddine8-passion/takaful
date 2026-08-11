'use client';

import { useState, useTransition } from 'react';
import { markModuleReadAction } from '@/lib/actions/courses';
import type { Locale } from '@/lib/i18n';

/**
 * "I have read this module."
 *
 * Deliberately a button rather than a scroll tracker. Scroll position is a
 * poor proxy for having read something — a fast scroll to the bottom would
 * mark ninety minutes of safeguarding material as done — and a reader who
 * says so is telling us something a scroll event cannot.
 */

const UI = {
  ar: { mark: 'أنهيت هذه الوحدة', done: '✓ أنهيت هذه الوحدة', saving: 'جارٍ الحفظ…' },
  en: { mark: 'I have finished this module', done: '✓ Module finished', saving: 'Saving…' },
} as const;

export function ModuleRead({
  lang,
  slug,
  moduleId,
  done,
}: {
  lang: Locale;
  slug: string;
  moduleId: string;
  done: boolean;
}) {
  const [marked, setMarked] = useState(done);
  const [pending, startTransition] = useTransition();
  const t = UI[lang];

  if (marked) {
    return (
      <p className="mt-2 text-[0.9rem] font-bold text-ok" role="status">
        {t.done}
      </p>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await markModuleReadAction(slug, moduleId);
          setMarked(true);
        })
      }
      className="mt-2 rounded-full border border-line px-5 py-2.5 text-[0.9rem] font-bold text-ink-2 transition-colors hover:bg-surface-2 disabled:opacity-60"
    >
      {pending ? t.saving : t.mark}
    </button>
  );
}
