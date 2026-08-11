import 'server-only';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { queryOne, transaction } from './db';
import { hashPassword } from './auth';
import { sendEmail } from './email';
import { SITE_URL } from './seo';
import type { Locale } from './i18n';

/**
 * Getting back into an account, and proving an address belongs to you.
 *
 * Both are the same mechanism: a secret that is long, single use, short
 * lived, and stored only as a hash — so a copy of the table hands nobody a
 * working link.
 *
 * The rule that shapes every function here: a stranger must not be able to
 * learn from this whether an address has an account. "If that address is
 * registered, we have sent a link" is the whole answer, whether or not it is.
 */

export type TokenPurpose = 'password_reset' | 'email_verify';

/** Long enough that guessing is not a strategy, short enough to paste. */
const TOKEN_BYTES = 32;
const LIFETIME_MINUTES: Record<TokenPurpose, number> = {
  // Long enough to find the email on another device, short enough that a link
  // sitting in an old inbox is not a standing key to the account.
  password_reset: 60,
  email_verify: 60 * 24 * 3,
};

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function issueToken(
  userId: string,
  purpose: TokenPurpose,
  target?: string,
): Promise<string> {
  const token = randomBytes(TOKEN_BYTES).toString('base64url');
  const expires = new Date(Date.now() + LIFETIME_MINUTES[purpose] * 60_000);

  await transaction(async (client) => {
    // Asking again replaces the earlier link rather than adding to it, so an
    // old email cannot still open the account after a newer one was requested.
    await client.query(
      `UPDATE auth_tokens SET used_at = now()
        WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL`,
      [userId, purpose],
    );
    await client.query(
      `INSERT INTO auth_tokens (id, user_id, purpose, token_hash, expires_at, target)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), userId, purpose, hashToken(token), expires, target ?? null],
    );
  });

  return token;
}

export type SpentToken = { userId: string; target: string | null };

/**
 * Spends a token, or returns null.
 *
 * The update is the check: marking it used and reading it back in one
 * statement means two requests arriving together cannot both succeed.
 */
export async function spendToken(
  token: string,
  purpose: TokenPurpose,
): Promise<SpentToken | null> {
  const row = await queryOne<{ user_id: string; target: string | null }>(
    `UPDATE auth_tokens SET used_at = now()
      WHERE token_hash = $1 AND purpose = $2
        AND used_at IS NULL AND expires_at > now()
      RETURNING user_id, target`,
    [hashToken(token), purpose],
  );
  return row ? { userId: row.user_id, target: row.target } : null;
}

// ------------------------------------------------------------ password reset

const COPY: Record<Locale, { resetSubject: string; resetBody: (url: string) => string;
  verifySubject: string; verifyBody: (url: string) => string }> = {
  ar: {
    resetSubject: 'إعادة تعيين كلمة المرور — جمعية تكافل',
    resetBody: (url) =>
      `طلب أحدهم إعادة تعيين كلمة المرور لحسابك في جمعية تكافل.\n\n` +
      `افتح هذا الرابط لاختيار كلمة مرور جديدة:\n${url}\n\n` +
      `الرابط صالح لساعة واحدة ويُستخدم مرة واحدة فقط.\n\n` +
      `إذا لم تطلب هذا، تجاهل الرسالة — لم يتغيّر شيء في حسابك.`,
    verifySubject: 'تأكيد بريدك الإلكتروني — جمعية تكافل',
    verifyBody: (url) =>
      `أهلًا بك في جمعية تكافل.\n\n` +
      `افتح هذا الرابط لتأكيد أن هذا البريد لك:\n${url}\n\n` +
      `الرابط صالح لثلاثة أيام.`,
  },
  en: {
    resetSubject: 'Reset your password — Takaful',
    resetBody: (url) =>
      `Someone asked to reset the password for your Takaful account.\n\n` +
      `Open this link to choose a new one:\n${url}\n\n` +
      `The link works for one hour and can be used once.\n\n` +
      `If this was not you, ignore this message — nothing about your account has changed.`,
    verifySubject: 'Confirm your email — Takaful',
    verifyBody: (url) =>
      `Welcome to Takaful.\n\n` +
      `Open this link to confirm this address is yours:\n${url}\n\n` +
      `The link works for three days.`,
  },
};

/**
 * Starts a reset if the address has an account.
 *
 * Returns nothing either way. The caller shows the same message regardless,
 * so this cannot be used to find out who is registered.
 */
export async function requestPasswordReset(email: string, lang: Locale): Promise<void> {
  const user = await queryOne<{ id: string; email: string; locale: Locale }>(
    'SELECT id, email, locale FROM users WHERE email = $1 AND status <> $2',
    [email.trim().toLowerCase(), 'deactivated'],
  );
  if (!user) return;

  const token = await issueToken(user.id, 'password_reset');
  const locale = user.locale === 'en' || user.locale === 'ar' ? user.locale : lang;
  const url = `${SITE_URL}/${locale}/reset?token=${encodeURIComponent(token)}`;

  await sendEmail({
    userId: user.id,
    to: user.email,
    subject: COPY[locale].resetSubject,
    text: COPY[locale].resetBody(url),
  });
}

export type ResetOutcome = 'ok' | 'invalid' | 'weak';

/**
 * Sets a new password and signs every session out.
 *
 * Signing out everywhere is the point as much as the new password is: someone
 * resetting because their account was taken needs the intruder's session to
 * stop working, and the intruder's session is the one thing a new password
 * alone would not touch.
 */
export async function resetPassword(token: string, newPassword: string): Promise<ResetOutcome> {
  if (newPassword.length < 10) return 'weak';

  const spent = await spendToken(token, 'password_reset');
  if (!spent) return 'invalid';

  const hashed = await hashPassword(newPassword);
  await transaction(async (client) => {
    await client.query('UPDATE users SET password_hash = $2 WHERE id = $1', [spent.userId, hashed]);
    await client.query('DELETE FROM sessions WHERE user_id = $1', [spent.userId]);
  });

  return 'ok';
}

// -------------------------------------------------------- email verification

export async function requestEmailVerification(userId: string, lang: Locale): Promise<void> {
  const user = await queryOne<{ email: string; locale: Locale; verified: Date | null }>(
    'SELECT email, locale, email_verified_at AS verified FROM users WHERE id = $1',
    [userId],
  );
  if (!user || user.verified) return;

  // The address is recorded on the token. If someone changes it before
  // following the link, the link confirms an address they no longer use rather
  // than blessing the new one.
  const token = await issueToken(userId, 'email_verify', user.email);
  const locale = user.locale === 'en' || user.locale === 'ar' ? user.locale : lang;
  const url = `${SITE_URL}/${locale}/verify-email?token=${encodeURIComponent(token)}`;

  await sendEmail({
    userId,
    to: user.email,
    subject: COPY[locale].verifySubject,
    text: COPY[locale].verifyBody(url),
  });
}

export type VerifyOutcome = 'ok' | 'invalid' | 'address_changed' | 'already';

export async function confirmEmail(token: string): Promise<VerifyOutcome> {
  const spent = await spendToken(token, 'email_verify');
  if (!spent) return 'invalid';

  const user = await queryOne<{ email: string; verified: Date | null }>(
    'SELECT email, email_verified_at AS verified FROM users WHERE id = $1',
    [spent.userId],
  );
  if (!user) return 'invalid';
  if (user.verified) return 'already';
  if (spent.target && spent.target !== user.email) return 'address_changed';

  await queryOne(
    'UPDATE users SET email_verified_at = now() WHERE id = $1 AND email_verified_at IS NULL',
    [spent.userId],
  );
  return 'ok';
}
