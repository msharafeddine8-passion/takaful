'use server';

import { randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isDbConfigured, execute, queryOne, transaction } from '@/lib/db';
import {
  authenticate,
  createSession,
  destroySession,
  registerUser,
  setMembershipStatus,
  currentUser,
  audit,
} from '@/lib/auth';
import { isLocale, type Locale } from '@/lib/i18n';
import type { FormState } from './types';

const MIN_PASSWORD = 10;
const MIN_AGE = 15;

function localeOf(formData: FormData): Locale {
  const value = String(formData.get('lang') ?? 'ar');
  return isLocale(value) ? value : 'ar';
}

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim();
}

function checked(formData: FormData, name: string): boolean {
  return formData.get(name) === 'on';
}

/**
 * Collect the named text fields so they can be echoed back to the form.
 * Passwords are never included.
 */
function echo(formData: FormData, names: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of names) {
    const value = formData.get(name);
    if (typeof value === 'string' && value !== '') out[name] = value;
  }
  return out;
}

/** Deliberately permissive: the point is to catch typos, not to police addresses. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/** Whole years completed as of today. */
function ageFrom(birth: Date): number {
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDelta = now.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

async function userAgent(): Promise<string | undefined> {
  const h = await headers();
  return h.get('user-agent') ?? undefined;
}

// -------------------------------------------------------------- registration

export async function registerAction(prev: FormState, formData: FormData): Promise<FormState> {
  const lang = localeOf(formData);
  const fullName = text(formData, 'fullName');
  const email = text(formData, 'email');
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  const kept = {
    values: echo(formData, ['fullName', 'email']),
    attempt: (prev.attempt ?? 0) + 1,
  };

  const fields: FormState['fields'] = {};
  if (fullName.length < 3) fields.fullName = 'required';
  if (!looksLikeEmail(email)) fields.email = 'invalidEmail';
  if (password.length < MIN_PASSWORD) fields.password = 'passwordTooShort';
  else if (password !== confirm) fields.confirm = 'passwordMismatch';
  if (Object.keys(fields).length > 0) return { ...kept, fields };

  if (!isDbConfigured()) return { ...kept, error: 'dbUnavailable' };

  let userId: string;
  try {
    const result = await registerUser({ email, password, fullName, locale: lang });
    if (!result.ok) return { ...kept, fields: { email: 'emailTaken' } };
    userId = result.userId;
    await createSession(userId, await userAgent());
  } catch {
    return { ...kept, error: 'dbUnavailable' };
  }

  // redirect() signals by throwing, so it must sit outside the try block above.
  redirect(`/${lang}/account`);
}

// --------------------------------------------------------------------- login

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const lang = localeOf(formData);
  const email = text(formData, 'email');
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'invalidCredentials' };
  if (!isDbConfigured()) return { error: 'dbUnavailable' };

  try {
    const result = await authenticate(email, password);
    if (!result.ok) {
      return { error: result.error === 'suspended' ? 'suspended' : 'invalidCredentials' };
    }
    await createSession(result.userId, await userAgent());
  } catch {
    return { error: 'dbUnavailable' };
  }

  redirect(`/${lang}/account`);
}

// -------------------------------------------------------------------- logout

export async function logoutAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  try {
    await destroySession();
  } catch {
    // A failure to delete the row must not trap someone in a session;
    // destroySession clears the cookie regardless.
  }
  redirect(`/${lang}`);
}

// -------------------------------------------------------- volunteer application

export async function applyAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const lang = localeOf(formData);

  if (!isDbConfigured()) return { error: 'dbUnavailable' };

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  const fields: FormState['fields'] = {};

  const dobRaw = text(formData, 'dateOfBirth');
  const dob = dobRaw ? new Date(dobRaw) : null;
  const age = dob && !Number.isNaN(dob.getTime()) ? ageFrom(dob) : null;
  if (age === null) fields.dateOfBirth = 'required';
  else if (age < MIN_AGE) fields.dateOfBirth = 'tooYoung';

  const phone = text(formData, 'phone');
  const city = text(formData, 'city');
  const emergencyName = text(formData, 'emergencyName');
  const emergencyPhone = text(formData, 'emergencyPhone');
  const motivation = text(formData, 'motivation');
  const availability = text(formData, 'availability');
  const interests = text(formData, 'interests');
  const experience = text(formData, 'experience');

  if (!phone) fields.phone = 'required';
  if (!city) fields.city = 'required';
  if (!emergencyName) fields.emergencyName = 'required';
  if (!emergencyPhone) fields.emergencyPhone = 'required';
  if (motivation.length < 20) fields.motivation = 'required';
  if (!availability) fields.availability = 'required';
  if (!interests) fields.interests = 'required';

  // A minor cannot submit without a named guardian who has consented.
  const isMinor = age !== null && age < 18;
  const guardianName = text(formData, 'guardianName');
  const guardianRelation = text(formData, 'guardianRelation');
  const guardianPhone = text(formData, 'guardianPhone');
  const guardianConsent = checked(formData, 'guardianConsent');

  if (isMinor) {
    if (!guardianName) fields.guardianName = 'guardianRequired';
    if (!guardianRelation) fields.guardianRelation = 'guardianRequired';
    if (!guardianPhone) fields.guardianPhone = 'guardianRequired';
    if (!guardianConsent) fields.guardianConsent = 'guardianRequired';
  }

  const commitmentsAgreed =
    checked(formData, 'codeOfConduct') &&
    checked(formData, 'safeguarding') &&
    checked(formData, 'dataConsent');

  if (Object.keys(fields).length > 0) return { fields };
  if (!commitmentsAgreed) return { error: 'commitmentsRequired' };

  // One open application at a time.
  const open = await queryOne<{ id: string }>(
    `SELECT id FROM volunteer_applications
      WHERE user_id = ?
        AND status IN ('submitted','under_review','interview_required','interview_scheduled')
      LIMIT 1`,
    [user.id],
  );
  if (open) redirect(`/${lang}/account`);

  const applicationId = randomUUID();
  const snapshot = {
    motivation,
    availability,
    interests,
    experience,
    ageAtSubmission: age,
    guardianRequired: isMinor,
    commitments: { codeOfConduct: true, safeguarding: true, dataConsent: true },
    locale: lang,
  };

  try {
    await transaction(async (conn) => {
      await conn.execute(
        `INSERT INTO profiles_sensitive
           (user_id, date_of_birth, phone, city, emergency_contact_name, emergency_contact_phone)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           date_of_birth = VALUES(date_of_birth),
           phone = VALUES(phone),
           city = VALUES(city),
           emergency_contact_name = VALUES(emergency_contact_name),
           emergency_contact_phone = VALUES(emergency_contact_phone)`,
        [user.id, dobRaw, phone, city, emergencyName, emergencyPhone],
      );

      if (isMinor) {
        await conn.execute(
          `INSERT INTO guardian_consents
             (id, minor_user_id, guardian_name, guardian_relation, guardian_phone, consent_scope)
           VALUES (?, ?, ?, ?, ?, 'participation')`,
          [randomUUID(), user.id, guardianName, guardianRelation, guardianPhone],
        );
      }

      await conn.execute(
        `INSERT INTO volunteer_applications
           (id, user_id, status, motivation, availability, interests, experience,
            answers_snapshot, submitted_at)
         VALUES (?, ?, 'submitted', ?, ?, ?, ?, ?, NOW())`,
        [
          applicationId,
          user.id,
          motivation,
          availability,
          interests,
          experience || null,
          JSON.stringify(snapshot),
        ],
      );
    });

    await setMembershipStatus({ userId: user.id, next: 'volunteer_applicant' });
    await audit({
      actorId: user.id,
      action: 'application.submitted',
      targetType: 'volunteer_application',
      targetId: applicationId,
    });
  } catch {
    return { error: 'generic' };
  }

  redirect(`/${lang}/account`);
}

/** Records that someone finished a course, and promotes them out of `registered_user`. */
export async function markCourseStarted(courseSlug: string): Promise<void> {
  if (!isDbConfigured()) return;
  const user = await currentUser();
  if (!user || user.membershipStatus !== 'registered_user') return;

  await setMembershipStatus({ userId: user.id, next: 'course_participant' });
  await execute(
    `INSERT INTO audit_logs (actor_id, action, target_type, target_id)
     VALUES (?, 'course.started', 'course', ?)`,
    [user.id, courseSlug],
  );
}
