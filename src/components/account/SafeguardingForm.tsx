'use client';

import { useActionState, useState } from 'react';
import { saveSafeguardingAction, type SafeguardingState } from '@/lib/actions/safeguarding';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { TextField, CheckField, FormError, SubmitButton } from './fields';

/**
 * Emergency contact, guardian consent, and the three agreements — and nothing
 * else. Someone recognised from the association's roster has already been
 * accepted; being asked again why they would like to volunteer is exactly the
 * insult this whole feature exists to remove.
 *
 * The guardian section appears once the birth date says the volunteer is a
 * minor. Showing it is a courtesy; the requirement is enforced in the action
 * and again by a CHECK constraint that recomputes the age from the stored
 * date, so it cannot be avoided by not showing the fields.
 */

type T = Dictionary['account']['safeguarding'];
type Errors = Dictionary['account']['errors'];

export type SafeguardingRecord = {
  date_of_birth: string;
  emergency_name: string;
  emergency_phone: string;
  emergency_relation: string | null;
  guardian_name: string | null;
  guardian_relation: string | null;
  guardian_phone: string | null;
  medical_notes: string | null;
} | null;

const empty: SafeguardingState = {};

function isMinorOn(dob: string): boolean {
  if (!dob) return false;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age < 18;
}

export function SafeguardingForm({
  lang, t, errors, record,
}: { lang: Locale; t: T; errors: Errors; record: SafeguardingRecord }) {
  const [state, formAction, pending] = useActionState(saveSafeguardingAction, empty);
  /* A refusal re-renders this form and uncontrolled fields fall back to their
   * defaults, so the submission is echoed back and wins over what was stored.
   * Otherwise a volunteer who misses one tick box retypes everything. */
  const echoed = state.values ?? {};
  const keep = (name: string, stored: string | null | undefined) => echoed[name] ?? (stored ?? '');
  const ticked = (name: string) => echoed[name] === 'on';

  const [dob, setDob] = useState(echoed.dateOfBirth ?? record?.date_of_birth ?? '');
  const minor = isMinorOn(dob);

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="lang" value={lang} />

      <FormError>{state.error ? errors.dbUnavailable : null}</FormError>
      {state.ok && (
        <p role="status" className="mb-5 rounded-xl border-2 border-ok bg-ok/10 p-4 text-[0.95rem] font-bold">
          {t.saved}
        </p>
      )}

      <h2 className="mb-3 mt-2 text-[0.82rem] font-extrabold tracking-[0.13em] text-ink-3">
        {t.aboutYou}
      </h2>

      <label className="block">
        <span className="mb-1.5 block text-[0.88rem] font-bold">{t.dateOfBirth}</span>
        <span className="mb-1.5 block text-[0.82rem] text-ink-2">{t.dateOfBirthHint}</span>
        <input
          name="dateOfBirth"
          type="date"
          required
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          dir="ltr"
          className="w-full rounded-xl border border-line bg-ground px-4 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
        />
        {state.fields?.dateOfBirth && (
          <span role="alert" className="mt-1.5 block text-[0.86rem] font-bold text-bad-text dark:text-bad">
            {errors[state.fields.dateOfBirth]}
          </span>
        )}
      </label>

      <h2 className="mb-3 mt-8 text-[0.82rem] font-extrabold tracking-[0.13em] text-ink-3">
        {t.emergencyTitle}
      </h2>
      <p className="mb-4 text-[0.92rem] leading-relaxed text-ink-2">{t.emergencyLede}</p>

      <TextField
        name="emergencyName"
        label={t.emergencyName}
        required
        defaultValue={keep('emergencyName', record?.emergency_name)}
        error={state.fields?.emergencyName ? errors.required : undefined}
      />
      <TextField
        name="emergencyPhone"
        label={t.emergencyPhone}
        type="tel"
        required
        defaultValue={keep('emergencyPhone', record?.emergency_phone)}
        error={state.fields?.emergencyPhone ? errors.required : undefined}
      />
      <TextField
        name="emergencyRelation"
        label={t.emergencyRelation}
        defaultValue={keep('emergencyRelation', record?.emergency_relation)}
      />

      {minor && (
        <>
          <h2 className="mb-3 mt-8 text-[0.82rem] font-extrabold tracking-[0.13em] text-ink-3">
            {t.guardianTitle}
          </h2>
          <p className="mb-4 text-[0.92rem] leading-relaxed text-ink-2">{t.guardianLede}</p>

          <TextField name="guardianName" label={t.guardianName} required defaultValue={keep('guardianName', record?.guardian_name)} />
          <TextField name="guardianRelation" label={t.guardianRelation} defaultValue={keep('guardianRelation', record?.guardian_relation)} />
          <TextField name="guardianPhone" label={t.guardianPhone} type="tel" required defaultValue={keep('guardianPhone', record?.guardian_phone)} />
          <CheckField name="guardianConsent" label={t.guardianConsent} defaultChecked={ticked('guardianConsent')} />
          {state.fields?.guardian && (
            <p role="alert" className="mt-1.5 text-[0.86rem] font-bold text-bad-text dark:text-bad">
              {errors.guardianRequired}
            </p>
          )}
        </>
      )}

      <h2 className="mb-3 mt-8 text-[0.82rem] font-extrabold tracking-[0.13em] text-ink-3">
        {t.commitments}
      </h2>
      <CheckField name="codeOfConduct" label={t.codeOfConduct} defaultChecked={ticked('codeOfConduct')} />
      <CheckField name="safeguarding" label={t.safeguarding} defaultChecked={ticked('safeguarding')} />
      <CheckField name="dataConsent" label={t.dataConsent} defaultChecked={ticked('dataConsent')} />
      {state.fields?.commitments && (
        <p role="alert" className="mt-1.5 text-[0.86rem] font-bold text-bad-text dark:text-bad">
          {errors.commitmentsRequired}
        </p>
      )}

      <div className="mt-6">
        <TextField name="medicalNotes" label={t.medicalNotes} defaultValue={keep('medicalNotes', record?.medical_notes)} />
      </div>

      <SubmitButton label={pending ? t.saving : t.submit} pending={pending} />
    </form>
  );
}
