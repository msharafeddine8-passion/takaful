'use client';

import { useActionState } from 'react';
import {
  createActivityAction,
  editActivityAction,
  type ActivityFormState,
} from '@/lib/actions/activity-admin';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { toLocalInput } from '@/lib/when';

/**
 * One form, used to write an activity and to correct one.
 *
 * Shared deliberately: when the two were going to be separate, the edit form
 * would inevitably have grown a field the create form lacked, and an activity
 * would have had a property nobody could set at the start. The same fields,
 * the same validation, the same words.
 */

type T = Dictionary['account']['activityForm'];

export type ActivityDraft = {
  id?: string;
  title_ar?: string;
  title_en?: string;
  description_ar?: string | null;
  description_en?: string | null;
  location?: string | null;
  map_url?: string | null;
  image_url?: string | null;
  activity_type?: string | null;
  audience?: string | null;
  starts_at?: Date | string | null;
  ends_at?: Date | string | null;
  registration_closes_at?: Date | string | null;
  capacity?: number | null;
  min_stage?: number | null;
  credited_minutes?: number | null;
  requires_approval?: boolean;
  is_published?: boolean;
};

const empty: ActivityFormState = {};

/* <input type="datetime-local"> wants exactly "YYYY-MM-DDTHH:mm" and shows an
 * empty box for anything else. toLocalInput writes that shape in Beirut, which
 * is the zone the action reads it back in — a coordinator travelling abroad
 * would otherwise open an activity and see a start time three hours from the
 * one on the public page, and "correct" it. */
const forInput = toLocalInput;

const field =
  'w-full rounded-xl border border-line bg-ground px-4 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25';

function Field({
  label, name, hint, children,
}: { label: string; name?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block" htmlFor={name}>
      <span className="mb-1.5 block text-[0.88rem] font-bold">{label}</span>
      {hint && <span className="mb-1.5 block text-[0.82rem] text-ink-2">{hint}</span>}
      {children}
    </label>
  );
}

export function ActivityForm({
  lang, t, draft, mode,
}: { lang: Locale; t: T; draft?: ActivityDraft; mode: 'create' | 'edit' }) {
  const [state, formAction, pending] = useActionState(
    mode === 'edit' ? editActivityAction : createActivityAction,
    empty,
  );

  /*
   * What was typed wins over what was stored. A refusal re-renders this form,
   * and without echoing the submission back, a coordinator who filled in a
   * dozen fields and got one time wrong would find all twelve emptied.
   */
  const echoed = state.values ?? {};
  const keep = (name: string, stored: string | number | null | undefined) =>
    echoed[name] ?? (stored ?? '');

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="lang" value={lang} />
      {draft?.id && <input type="hidden" name="activityId" value={draft.id} />}

      {state.error && (
        <p role="alert" className="rounded-xl border-2 border-bad bg-bad/10 p-4 text-[0.95rem] font-bold">
          {t.errors[state.error]}
        </p>
      )}
      {state.ok && (
        <p role="status" className="rounded-xl border-2 border-ok bg-ok/10 p-4 text-[0.95rem] font-bold">
          {mode === 'edit' ? t.savedEdit : t.savedCreate}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.titleAr} name="titleAr">
          <input id="titleAr" name="titleAr" required defaultValue={keep('titleAr', draft?.title_ar)} className={field} />
        </Field>
        <Field label={t.titleEn} name="titleEn">
          <input id="titleEn" name="titleEn" required defaultValue={keep('titleEn', draft?.title_en)} className={field} dir="ltr" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.descriptionAr} name="descriptionAr">
          <textarea id="descriptionAr" name="descriptionAr" rows={3} defaultValue={keep('descriptionAr', draft?.description_ar)} className={field} />
        </Field>
        <Field label={t.descriptionEn} name="descriptionEn">
          <textarea id="descriptionEn" name="descriptionEn" rows={3} defaultValue={keep('descriptionEn', draft?.description_en)} className={field} dir="ltr" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field label={t.activityType} name="activityType">
          <input id="activityType" name="activityType" defaultValue={keep('activityType', draft?.activity_type)} className={field} />
        </Field>
        <Field label={t.audience} name="audience">
          <input id="audience" name="audience" defaultValue={keep('audience', draft?.audience)} className={field} />
        </Field>
        <Field label={t.location} name="location">
          <input id="location" name="location" defaultValue={keep('location', draft?.location)} className={field} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.mapUrl} name="mapUrl" hint={t.mapUrlHint}>
          <input id="mapUrl" name="mapUrl" type="url" defaultValue={keep('mapUrl', draft?.map_url)} className={field} dir="ltr" />
        </Field>
        <Field label={t.imageUrl} name="imageUrl" hint={t.imageUrlHint}>
          <input id="imageUrl" name="imageUrl" defaultValue={keep('imageUrl', draft?.image_url)} className={field} dir="ltr" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field label={t.startsAt} name="startsAt" hint={t.datesOptionalHint}>
          <input id="startsAt" name="startsAt" type="datetime-local" defaultValue={echoed.startsAt ?? forInput(draft?.starts_at)} className={field} dir="ltr" />
        </Field>
        <Field label={t.endsAt} name="endsAt">
          <input id="endsAt" name="endsAt" type="datetime-local" defaultValue={echoed.endsAt ?? forInput(draft?.ends_at)} className={field} dir="ltr" />
        </Field>
        <Field label={t.registrationClosesAt} name="registrationClosesAt" hint={t.registrationClosesHint}>
          <input id="registrationClosesAt" name="registrationClosesAt" type="datetime-local" defaultValue={echoed.registrationClosesAt ?? forInput(draft?.registration_closes_at)} className={field} dir="ltr" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field label={t.capacity} name="capacity" hint={t.capacityHint}>
          <input id="capacity" name="capacity" type="number" min="1" max="10000" defaultValue={keep('capacity', draft?.capacity)} className={field} dir="ltr" />
        </Field>
        <Field label={t.minStage} name="minStage" hint={t.minStageHint}>
          <input id="minStage" name="minStage" type="number" min="1" max="20" defaultValue={keep('minStage', draft?.min_stage)} className={field} dir="ltr" />
        </Field>
        <Field label={t.creditedMinutes} name="creditedMinutes" hint={t.creditedMinutesHint}>
          <input id="creditedMinutes" name="creditedMinutes" type="number" min="1" max="1440" defaultValue={keep('creditedMinutes', draft?.credited_minutes)} className={field} dir="ltr" />
        </Field>
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[0.95rem] font-bold">
        <input type="checkbox" name="requiresApproval" defaultChecked={echoed.requiresApproval === 'on' || (!state.values && (draft?.requires_approval ?? false))} className="size-5" />
        {t.requiresApproval}
      </label>

      <fieldset>
        <legend className="mb-2 text-[0.88rem] font-bold">{t.status}</legend>
        <div className="flex flex-wrap gap-2">
          {(['draft', 'published'] as const).map((value) => (
            <label
              key={value}
              className="min-h-11 cursor-pointer rounded-full border-2 border-line px-5 py-2.5 text-[0.9rem] font-bold has-[:checked]:border-brand-orange has-[:checked]:bg-brand-orange/10"
            >
              <input
                type="radio"
                name="status"
                value={value}
                defaultChecked={
                  echoed.status
                    ? value === echoed.status
                    : // A new activity starts as a draft; an existing one keeps
                      // whatever it already is.
                      value === (draft ? (draft.is_published === false ? 'draft' : 'published') : 'draft')
                }
                className="sr-only"
              />
              {value === 'draft' ? t.statusDraft : t.statusPublished}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-full bg-brand-orange px-7 py-3 text-[0.98rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark disabled:opacity-60"
      >
        {pending ? t.saving : mode === 'edit' ? t.saveEdit : t.create}
      </button>
    </form>
  );
}
