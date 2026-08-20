'use server';

import { randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isDbConfigured, queryOne, transaction } from '@/lib/db';
import {
  authenticate,
  createSession,
  destroySession,
  registerUser,
  setMembershipStatus,
  currentUser,
  audit,
} from '@/lib/auth';
import {
  callerIp,
  checkLoginAllowed,
  recordLoginAttempt,
  checkSignupAllowed,
  recordSignup,
} from '@/lib/throttle';
import { requestPasswordReset, resetPassword, requestEmailVerification } from '@/lib/recovery';
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
    /*
     * Signing in was throttled and creating an account was not, which left the
     * cheaper attack open: a script does not need to guess a password to fill
     * the members table, corrupt the funnel figures and — once email is
     * switched on — turn the site into a way of sending mail to strangers.
     *
     * Checked before the account is written, and recorded only after it is, so
     * a failed attempt does not spend somebody's allowance.
     */
    const ip = await callerIp();
    const allowed = await checkSignupAllowed(ip);
    if (!allowed.allowed) return { ...kept, error: 'tooManyAttempts' };

    const result = await registerUser({ email, password, fullName, locale: lang });
    if (!result.ok) return { ...kept, fields: { email: 'emailTaken' } };
    userId = result.userId;
    await recordSignup(ip);
    await createSession(userId, await userAgent());
  } catch {
    return { ...kept, error: 'dbUnavailable' };
  }

  // Not awaited for its outcome: an email provider having a bad minute must
  // not stop someone finishing sign-up. The account works unverified, and the
  // link can be sent again from their account page.
  await requestEmailVerification(userId, lang).catch(() => {});

  /*
   * Someone who said at the door that they already volunteer is taken straight
   * to the roster claim. Before this they landed on the account page and had
   * to notice a prompt among everything else there, which is how a volunteer
   * of six years ends up filling in an application form instead.
   *
   * Only the two known values are honoured — the field arrives from a form and
   * an open redirect is not something to hand a stranger.
   */
  const next = text(formData, 'next');
  const destination = next === 'volunteer' ? `/${lang}/account/claim` : `/${lang}/account`;

  // redirect() signals by throwing, so it must sit outside the try block above.
  redirect(destination);
}

// --------------------------------------------------------------------- login

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const lang = localeOf(formData);
  const email = text(formData, 'email');
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'invalidCredentials' };
  if (!isDbConfigured()) return { error: 'dbUnavailable' };

  let userId: string;
  try {
    const ip = await callerIp();

    // Checked before the password is verified, so a throttled attempt costs
    // one indexed count instead of a tenth of a second of Argon2 — otherwise
    // the defence would itself be the way to exhaust the server.
    const allowed = await checkLoginAllowed(email, ip);
    if (!allowed.allowed) return { error: 'tooManyAttempts' };

    const result = await authenticate(email, password);
    await recordLoginAttempt(email, ip, result.ok);

    if (!result.ok) {
      return { error: result.error === 'suspended' ? 'suspended' : 'invalidCredentials' };
    }
    userId = result.userId;
    await createSession(userId, await userAgent());
  } catch {
    return { error: 'dbUnavailable' };
  }

  redirect(`/${lang}/account`);
}

// ----------------------------------------------------------- password reset

/**
 * Both of these answer the same way whether or not the address is registered.
 * A different message for a known address would turn this form into a way of
 * checking who volunteers here.
 */
export type ResetRequestState = { done?: boolean; error?: 'invalidEmail' | 'dbUnavailable' };

export async function requestResetAction(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const lang = localeOf(formData);
  const email = text(formData, 'email');

  if (!looksLikeEmail(email)) return { error: 'invalidEmail' };
  if (!isDbConfigured()) return { error: 'dbUnavailable' };

  try {
    const ip = await callerIp();
    // Asking for reset links is itself a way to flood someone's inbox, so it
    // rides the same limiter as signing in.
    const allowed = await checkLoginAllowed(email, ip);
    if (allowed.allowed) {
      await requestPasswordReset(email, lang);
      await recordLoginAttempt(email, ip, false);
    }
  } catch {
    // Even a failure answers the same way. Telling someone the send failed for
    // their address, and nothing for another, is the leak this avoids.
  }

  return { done: true };
}

export type ResetState = { done?: boolean; error?: 'passwordTooShort' | 'passwordMismatch' | 'generic' };

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const token = text(formData, 'token');
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < MIN_PASSWORD) return { error: 'passwordTooShort' };
  if (password !== confirm) return { error: 'passwordMismatch' };
  if (!isDbConfigured() || !token) return { error: 'generic' };

  try {
    const outcome = await resetPassword(token, password);
    if (outcome !== 'ok') return { error: 'generic' };
  } catch {
    return { error: 'generic' };
  }

  return { done: true };
}

/** Sends the confirmation link again, for someone who never got the first. */
export async function resendVerificationAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return;
  const user = await currentUser();
  if (!user) return;
  await requestEmailVerification(user.id, lang).catch(() => {});
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

  // One open application at a time. This check exists so the person gets a
  // sensible redirect rather than an error; the partial unique index
  // uq_va_one_open_per_user is what actually guarantees it under a race.
  const open = await queryOne<{ id: string }>(
    `SELECT id FROM volunteer_applications
      WHERE user_id = $1
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
    await transaction(async (client) => {
      await client.query(
        `INSERT INTO profiles_sensitive
           (user_id, date_of_birth, phone, city, emergency_contact_name, emergency_contact_phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO UPDATE SET
           date_of_birth = EXCLUDED.date_of_birth,
           phone = EXCLUDED.phone,
           city = EXCLUDED.city,
           emergency_contact_name = EXCLUDED.emergency_contact_name,
           emergency_contact_phone = EXCLUDED.emergency_contact_phone`,
        [user.id, dobRaw, phone, city, emergencyName, emergencyPhone],
      );

      if (isMinor) {
        await client.query(
          `INSERT INTO guardian_consents
             (id, minor_user_id, guardian_name, guardian_relation, guardian_phone, consent_scope)
           VALUES ($1, $2, $3, $4, $5, ARRAY['participation'])`,
          [randomUUID(), user.id, guardianName, guardianRelation, guardianPhone],
        );
      }

      await client.query(
        `INSERT INTO volunteer_applications
           (id, user_id, status, motivation, availability, interests, experience,
            answers_snapshot, submitted_at)
         VALUES ($1, $2, 'submitted', $3, $4, $5, $6, $7, now())`,
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

/*
 * Removed: markCourseStarted().
 *
 * It had no callers, which is why it survived a rewrite of the academy — but
 * an unused function in a 'use server' file is not dead code. Every export
 * here is a network endpoint, callable by anyone with a session whether or not
 * a component references it. This one promoted the caller from registered_user
 * to course_participant without their having opened a course, writing a
 * membership-history row and an audit entry that both said otherwise.
 *
 * Promotion now happens only in completeCourseAction, after a graded pass.
 */
