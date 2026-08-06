'use client';

import { useActionState, useState } from 'react';
import { applyAction } from '@/lib/actions/account';
import { emptyState } from '@/lib/actions/types';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { TextField, TextArea, CheckField, FormError, SubmitButton } from './fields';

function ageFrom(value: string): number | null {
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDelta = now.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function ApplyForm({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.account.apply;
  const errors = dict.account.errors;
  const [state, formAction, pending] = useActionState(applyAction, emptyState);
  const [dob, setDob] = useState('');

  // Revealing the guardian block early is a courtesy; the server enforces it regardless.
  const age = dob ? ageFrom(dob) : null;
  const showGuardian = age !== null && age < 18 && age >= 0;

  const err = (name: string) => {
    const key = state.fields?.[name];
    return key ? errors[key] : undefined;
  };

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="lang" value={lang} />
      <FormError>{state.error ? errors[state.error] : null}</FormError>

      <fieldset className="mb-8">
        <legend className="mb-4 text-[1.1rem] font-extrabold text-ink">{t.aboutYou}</legend>

        <div className="mb-5">
          <label htmlFor="dateOfBirth" className="mb-1.5 block text-[0.92rem] font-bold text-ink">
            {t.dateOfBirth}
          </label>
          <p id="dateOfBirth-hint" className="mb-2 text-[0.85rem] leading-relaxed text-ink-2">
            {t.dateOfBirthHint}
          </p>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            required
            value={dob}
            onChange={(event) => setDob(event.target.value)}
            aria-describedby="dateOfBirth-hint"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-[0.98rem] text-ink outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
          />
          {err('dateOfBirth') && (
            <p role="alert" className="mt-1.5 text-[0.85rem] font-semibold text-red-600 dark:text-red-400">
              {err('dateOfBirth')}
            </p>
          )}
        </div>

        <TextField name="phone" label={t.phone} type="tel" autoComplete="tel" required error={err('phone')} />
        <TextField name="city" label={t.city} required error={err('city')} />
        <TextField name="emergencyName" label={t.emergencyName} required error={err('emergencyName')} />
        <TextField
          name="emergencyPhone"
          label={t.emergencyPhone}
          type="tel"
          required
          error={err('emergencyPhone')}
        />
      </fieldset>

      {showGuardian && (
        <fieldset className="mb-8 rounded-2xl border border-brand-orange/45 bg-brand-orange/8 p-5">
          <legend className="px-2 text-[1.05rem] font-extrabold text-ink">{t.guardianTitle}</legend>
          <p className="mb-4 text-[0.9rem] leading-relaxed text-ink-2">{t.guardianLede}</p>

          <TextField name="guardianName" label={t.guardianName} error={err('guardianName')} />
          <TextField name="guardianRelation" label={t.guardianRelation} error={err('guardianRelation')} />
          <TextField name="guardianPhone" label={t.guardianPhone} type="tel" error={err('guardianPhone')} />
          <CheckField name="guardianConsent" label={t.guardianConsent} error={err('guardianConsent')} />
        </fieldset>
      )}

      <fieldset className="mb-8">
        <legend className="mb-4 text-[1.1rem] font-extrabold text-ink">{t.yourInterest}</legend>

        <TextArea
          name="motivation"
          label={t.motivation}
          hint={t.motivationHint}
          rows={5}
          error={err('motivation')}
        />
        <TextField
          name="availability"
          label={t.availability}
          hint={t.availabilityHint}
          error={err('availability')}
        />
        <TextField
          name="interests"
          label={t.interests}
          hint={t.interestsHint}
          error={err('interests')}
        />
        <TextArea
          name="experience"
          label={t.experience}
          hint={t.experienceHint}
          optional={t.optional}
          rows={3}
        />
      </fieldset>

      <fieldset className="mb-8 rounded-2xl border border-line bg-surface-2 p-5">
        <legend className="px-2 text-[1.05rem] font-extrabold text-ink">{t.commitments}</legend>
        <CheckField name="codeOfConduct" label={t.codeOfConduct} />
        <CheckField name="safeguarding" label={t.safeguarding} />
        <CheckField name="dataConsent" label={t.dataConsent} />
      </fieldset>

      <SubmitButton label={t.submit} pending={pending} />
    </form>
  );
}
