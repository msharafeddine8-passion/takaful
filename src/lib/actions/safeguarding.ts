'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { execute, isDbConfigured, queryOne } from '@/lib/db';
import { audit, currentUser } from '@/lib/auth';
import { isLocale, type Locale } from '@/lib/i18n';

/**
 * The short form a recognised volunteer fills in instead of an application.
 *
 * Being recognised from the roster skips the queue, which was the point. It
 * was never meant to skip the emergency contact, the guardian's consent or the
 * agreement to the code of conduct — a fifteen-year-old on a field activity
 * needs those on file whether they joined last week or in 2018.
 *
 * So this asks for exactly those and nothing else. No motivation, no
 * experience, no "why would you like to volunteer" — the association settled
 * that question years ago for these people, and asking again is the insult the
 * whole feature exists to remove.
 */

export type SafeguardingState = {
  ok?: boolean;
  fields?: Partial<Record<
    'dateOfBirth' | 'emergencyName' | 'emergencyPhone' | 'guardian' | 'commitments',
    'required' | 'tooYoung' | 'guardianRequired' | 'commitmentsRequired'
  >>;
  error?: 'unavailable';
  /*
   * Echoed back so a refusal does not empty the form. Submitting a server
   * action re-renders it, and uncontrolled fields fall back to their defaults
   * — which without this would mean a volunteer who missed one tick box
   * retypes their emergency contact from scratch.
   */
  values?: Record<string, string>;
};

const ECHOED = [
  'dateOfBirth', 'emergencyName', 'emergencyPhone', 'emergencyRelation',
  'guardianName', 'guardianRelation', 'guardianPhone', 'medicalNotes',
];
const TICKS = ['guardianConsent', 'codeOfConduct', 'safeguarding', 'dataConsent'];

function echo(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of ECHOED) {
    const value = formData.get(name);
    if (typeof value === 'string' && value !== '') out[name] = value;
  }
  for (const name of TICKS) if (formData.get(name) === 'on') out[name] = 'on';
  return out;
}

function localeOf(f: FormData): Locale {
  const v = String(f.get('lang') ?? 'ar');
  return isLocale(v) ? v : 'ar';
}
const text = (f: FormData, n: string) => String(f.get(n) ?? '').trim();
const checked = (f: FormData, n: string) => f.get(n) === 'on';

/** The association's floor, matching the application form. */
const MIN_AGE = 15;

function ageOn(dob: Date, on: Date): number {
  let age = on.getFullYear() - dob.getFullYear();
  const m = on.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < dob.getDate())) age--;
  return age;
}

export async function saveSafeguardingAction(
  _prev: SafeguardingState,
  formData: FormData,
): Promise<SafeguardingState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'unavailable', values: echo(formData) };

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  const fields: SafeguardingState['fields'] = {};

  const dobRaw = text(formData, 'dateOfBirth');
  const dob = dobRaw ? new Date(dobRaw) : null;
  const age = dob && !Number.isNaN(dob.getTime()) ? ageOn(dob, new Date()) : null;
  if (age === null) fields.dateOfBirth = 'required';
  else if (age < MIN_AGE) fields.dateOfBirth = 'tooYoung';

  const emergencyName = text(formData, 'emergencyName');
  const emergencyPhone = text(formData, 'emergencyPhone');
  if (!emergencyName) fields.emergencyName = 'required';
  if (!emergencyPhone) fields.emergencyPhone = 'required';

  /*
   * Age is computed here from the date given, never taken from the form. A
   * CHECK constraint recomputes it from the stored birth date as well, so a
   * request that skips this code cannot land a minor without a guardian.
   */
  const isMinor = age !== null && age < 18;
  const guardianName = text(formData, 'guardianName');
  const guardianRelation = text(formData, 'guardianRelation');
  const guardianPhone = text(formData, 'guardianPhone');
  const guardianConsent = checked(formData, 'guardianConsent');
  if (isMinor && (!guardianName || !guardianPhone || !guardianConsent)) {
    fields.guardian = 'guardianRequired';
  }

  const agreed =
    checked(formData, 'codeOfConduct') &&
    checked(formData, 'safeguarding') &&
    checked(formData, 'dataConsent');
  if (!agreed) fields.commitments = 'commitmentsRequired';

  if (Object.keys(fields).length > 0) return { fields, values: echo(formData) };

  const existing = await queryOne<{ user_id: string }>(
    'SELECT user_id FROM safeguarding_records WHERE user_id = $1',
    [user.id],
  );

  const now = new Date();
  await execute(
    `INSERT INTO safeguarding_records
       (user_id, date_of_birth, emergency_name, emergency_phone, emergency_relation,
        guardian_name, guardian_relation, guardian_phone, guardian_consent_at,
        code_of_conduct_at, safeguarding_at, data_consent_at, medical_notes, updated_at)
     VALUES ($1,$2::DATE,$3,$4,$5,$6,$7,$8,$9,$10,$10,$10,$11,now())
     ON CONFLICT (user_id) DO UPDATE
       SET date_of_birth = EXCLUDED.date_of_birth,
           emergency_name = EXCLUDED.emergency_name,
           emergency_phone = EXCLUDED.emergency_phone,
           emergency_relation = EXCLUDED.emergency_relation,
           guardian_name = EXCLUDED.guardian_name,
           guardian_relation = EXCLUDED.guardian_relation,
           guardian_phone = EXCLUDED.guardian_phone,
           guardian_consent_at = EXCLUDED.guardian_consent_at,
           code_of_conduct_at = EXCLUDED.code_of_conduct_at,
           safeguarding_at = EXCLUDED.safeguarding_at,
           data_consent_at = EXCLUDED.data_consent_at,
           medical_notes = EXCLUDED.medical_notes,
           updated_at = now()`,
    [
      user.id, dobRaw, emergencyName, emergencyPhone,
      text(formData, 'emergencyRelation') || null,
      isMinor ? guardianName : null,
      isMinor ? guardianRelation || null : null,
      isMinor ? guardianPhone : null,
      isMinor && guardianConsent ? now : null,
      now,
      text(formData, 'medicalNotes') || null,
    ],
  );

  await audit({
    actorId: user.id,
    action: existing ? 'safeguarding.updated' : 'safeguarding.recorded',
    targetType: 'user',
    targetId: user.id,
    // Never the contents: this row holds a birth date, a guardian's name and
    // medical notes, and the audit log is read by more people than the record.
    newValue: { isMinor, hasGuardian: isMinor },
  });

  revalidatePath(`/${lang}/account`);
  return { ok: true };
}
