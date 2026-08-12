'use client';

import { useState } from 'react';
import { addRequirementAction } from '@/lib/actions/journey';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';

const input =
  'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25';

type Kind = 'course' | 'hours' | 'assessment' | 'activity' | 'evaluation' | 'document' | 'approval';

/**
 * Adding a requirement. Client-side only so the extra fields can follow the
 * chosen type — an hours requirement should not ask which course.
 *
 * The action validates everything again on the server and the database
 * refuses a malformed config regardless; this is about not showing someone
 * six fields when they need one.
 */
export function RequirementForm({
  lang,
  dict,
  stageId,
  courses,
}: {
  lang: Locale;
  dict: Dictionary;
  stageId: string;
  courses: { slug: string; title: string }[];
}) {
  const t = dict.account.staff.journeyBuilder;
  const [kind, setKind] = useState<Kind>('hours');

  const kindLabels: Record<Kind, string> = {
    course: t.kindCourse,
    hours: t.kindHours,
    assessment: t.kindAssessment,
    activity: t.kindActivity,
    evaluation: t.kindEvaluation,
    document: t.kindDocument,
    approval: t.kindApproval,
  };

  return (
    <form action={addRequirementAction} className="mt-4 rounded-xl border border-line bg-surface-2 p-5">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="stageId" value={stageId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[0.88rem] font-bold">{t.kind}</span>
          <select
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
            className={input}
          >
            {(Object.keys(kindLabels) as Kind[]).map((k) => (
              <option key={k} value={k}>{kindLabels[k]}</option>
            ))}
          </select>
        </label>

        {kind === 'hours' && (
          <label className="block">
            <span className="mb-1.5 block text-[0.88rem] font-bold">{t.hoursField}</span>
            <input name="hours" type="number" min="0.5" step="0.5" required className={input} dir="ltr" />
          </label>
        )}

        {(kind === 'course' || kind === 'assessment') && (
          <label className="block">
            <span className="mb-1.5 block text-[0.88rem] font-bold">{t.courseField}</span>
            <select name="courseSlug" required className={input}>
              {courses.map((c) => (
                <option key={c.slug} value={c.slug}>{c.title}</option>
              ))}
            </select>
          </label>
        )}

        {kind === 'course' && (
          <label className="block">
            <span className="mb-1.5 block text-[0.88rem] font-bold">{t.minScoreField}</span>
            <input name="minScore" type="number" min="0" max="100" className={input} dir="ltr" />
          </label>
        )}

        {kind === 'assessment' && (
          <label className="block">
            <span className="mb-1.5 block text-[0.88rem] font-bold">{t.passMarkField}</span>
            <input name="passMark" type="number" min="0" max="100" defaultValue={70} required className={input} dir="ltr" />
          </label>
        )}

        {kind === 'document' && (
          <label className="block">
            <span className="mb-1.5 block text-[0.88rem] font-bold">{t.documentField}</span>
            <input name="documentKind" type="text" required className={input} />
          </label>
        )}

        <label className="block">
          <span className="mb-1.5 block text-[0.88rem] font-bold">{t.labelAr}</span>
          <input name="labelAr" type="text" required className={input} dir="rtl" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[0.88rem] font-bold">{t.labelEn}</span>
          <input name="labelEn" type="text" required className={input} dir="ltr" />
        </label>
      </div>

      <label className="mt-4 flex items-center gap-2.5">
        <input name="isRequired" type="checkbox" defaultChecked className="h-4 w-4" />
        <span className="text-[0.92rem] font-bold">{t.required}</span>
      </label>

      <button
        type="submit"
        className="mt-4 rounded-full bg-brand-blue px-6 py-2.5 text-[0.92rem] font-extrabold text-white hover:bg-brand-blue-dark"
      >
        {t.add}
      </button>
    </form>
  );
}
