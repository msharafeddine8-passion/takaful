'use client';

import { useActionState } from 'react';
import { logHoursAction } from '@/lib/actions/hours';
import { emptyState } from '@/lib/actions/types';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { FieldShell } from './fields';

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-[0.98rem] text-ink outline-none transition-colors placeholder:text-ink-2/60 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25';

export type ActivityOption = { id: string; title: string };

export function HoursForm({
  lang,
  dict,
  activities,
  today,
}: {
  lang: Locale;
  dict: Dictionary;
  activities: ActivityOption[];
  /** Passed in from the server so the input's max does not depend on the visitor's clock. */
  today: string;
}) {
  const [state, action, pending] = useActionState(logHoursAction, emptyState);
  const t = dict.account.hours;
  const errors = dict.account.errors;

  return (
    // Remounting on each attempt is what makes the echoed values apply: React
    // resets an uncontrolled form once the action returns.
    <form action={action} key={state.attempt ?? 0} className="mt-4">
      <input type="hidden" name="lang" value={lang} />

      <div className="grid gap-x-5 sm:grid-cols-2">
        <FieldShell
          label={t.dateLabel}
          htmlFor="workedOn"
          error={state.fields?.workedOn ? errors[state.fields.workedOn] : undefined}
        >
          <input
            id="workedOn"
            name="workedOn"
            type="date"
            required
            max={today}
            defaultValue={state.values?.workedOn ?? today}
            className={inputClass}
            aria-invalid={Boolean(state.fields?.workedOn)}
          />
        </FieldShell>

        <FieldShell
          label={t.durationLabel}
          htmlFor="duration"
          hint={t.durationHint}
          error={state.fields?.duration ? errors[state.fields.duration] : undefined}
        >
          <input
            id="duration"
            name="duration"
            type="text"
            inputMode="text"
            required
            dir="ltr"
            placeholder="2:30"
            defaultValue={state.values?.duration ?? ''}
            className={inputClass}
            aria-invalid={Boolean(state.fields?.duration)}
            aria-describedby="duration-hint"
          />
        </FieldShell>
      </div>

      {activities.length > 0 && (
        <FieldShell label={t.activityLabel} htmlFor="activityId">
          <select id="activityId" name="activityId" defaultValue="" className={inputClass}>
            <option value="">{t.activityNone}</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </FieldShell>
      )}

      <FieldShell label={t.noteLabel} htmlFor="note" optional={dict.account.apply.optional}>
        <textarea
          id="note"
          name="note"
          rows={2}
          defaultValue={state.values?.note ?? ''}
          className={inputClass}
        />
      </FieldShell>

      {state.error && (
        <p role="alert" className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[0.92rem] font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {errors[state.error]}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
      >
        {t.submit}
      </button>
    </form>
  );
}
