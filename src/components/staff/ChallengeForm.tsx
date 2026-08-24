'use client';

import { useActionState } from 'react';
import { createChallengeAction, type ChallengeFormState } from '@/lib/actions/challenges';
import { CHALLENGE_METRICS } from '@/lib/challenges';
import type { ChallengeStrings } from '@/lib/dictionaries/challenges';
import type { Locale } from '@/lib/i18n';

/**
 * Setting a goal for the whole association.
 *
 * There is no edit form and there is not meant to be. A challenge is an
 * announcement; changing its target after volunteers have started working
 * towards it moves the goalposts silently. A goal set wrongly is archived with
 * a reason and set again, and both stay on the record.
 *
 * The window comes in prefilled with the current Beirut month, worked out on
 * the server by beirutMonthWindow(). It is not computed here: this runs in the
 * volunteer's browser, in the volunteer's own timezone, and a coordinator
 * abroad would otherwise get somebody else's month.
 */

const field =
  'w-full rounded-xl border border-line bg-ground px-4 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25';

const empty: ChallengeFormState = {};

function Field({
  label, name, hint, children,
}: { label: string; name: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block" htmlFor={name}>
      <span className="mb-1.5 block text-[0.88rem] font-bold">{label}</span>
      {hint && <span className="mb-1.5 block text-[0.82rem] text-ink-2">{hint}</span>}
      {children}
    </label>
  );
}

export function ChallengeForm({
  lang, t, defaultWindow,
}: {
  lang: Locale;
  t: ChallengeStrings;
  /** This Beirut month, from the server. Both ends inclusive, 'YYYY-MM-DD'. */
  defaultWindow: { startsOn: string; endsOn: string };
}) {
  const [state, formAction, pending] = useActionState(createChallengeAction, empty);

  // What was typed wins over the prefill, so a refusal does not empty the form.
  const echoed = state.values ?? {};
  const keep = (name: string, fallback: string) => echoed[name] ?? fallback;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="lang" value={lang} />

      {state.error && (
        <p role="alert" className="rounded-xl border-2 border-bad bg-bad/10 p-4 text-[0.95rem] font-bold">
          {t.errors[state.error]}
        </p>
      )}
      {state.ok && (
        <p role="status" className="rounded-xl border-2 border-ok bg-ok/10 p-4 text-[0.95rem] font-bold">
          {t.create}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fieldNameAr} name="nameAr">
          <input id="nameAr" name="nameAr" required defaultValue={keep('nameAr', '')} className={field} />
        </Field>
        <Field label={t.fieldNameEn} name="nameEn">
          <input id="nameEn" name="nameEn" required defaultValue={keep('nameEn', '')} className={field} dir="ltr" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fieldDescriptionAr} name="descriptionAr">
          <textarea id="descriptionAr" name="descriptionAr" rows={2} defaultValue={keep('descriptionAr', '')} className={field} />
        </Field>
        <Field label={t.fieldDescriptionEn} name="descriptionEn">
          <textarea id="descriptionEn" name="descriptionEn" rows={2} defaultValue={keep('descriptionEn', '')} className={field} dir="ltr" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fieldMetric} name="metric">
          <select id="metric" name="metric" defaultValue={keep('metric', 'verified_minutes')} className={`${field} min-h-11`}>
            {CHALLENGE_METRICS.map((metric) => (
              <option key={metric} value={metric}>{t.metrics[metric]}</option>
            ))}
          </select>
        </Field>
        <Field label={t.fieldTarget} name="target" hint={t.fieldTargetHoursNote}>
          {/* inputMode numeric so a phone offers digits; min=1 because a
              target of zero is complete before anybody starts. */}
          <input
            id="target" name="target" type="number" inputMode="numeric" min={1} step={1} required
            defaultValue={keep('target', '')} className={`${field} min-h-11`} dir="ltr"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fieldStartsOn} name="startsOn">
          <input
            id="startsOn" name="startsOn" type="date" required
            defaultValue={keep('startsOn', defaultWindow.startsOn)}
            className={`${field} min-h-11`} dir="ltr"
          />
        </Field>
        <Field label={t.fieldEndsOn} name="endsOn">
          <input
            id="endsOn" name="endsOn" type="date" required
            defaultValue={keep('endsOn', defaultWindow.endsOn)}
            className={`${field} min-h-11`} dir="ltr"
          />
        </Field>
      </div>

      <p className="text-[0.85rem] leading-relaxed text-ink-2">{t.thisMonth}</p>

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-full bg-brand-orange px-6 py-2.5 text-[0.95rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
      >
        {t.create}
      </button>
    </form>
  );
}
