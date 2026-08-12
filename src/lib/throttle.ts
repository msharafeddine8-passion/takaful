import 'server-only';
import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { query, execute } from './db';

/**
 * Slowing down guessing.
 *
 * Argon2 makes each password check cost about a tenth of a second, which is
 * plenty against one guess and nothing against a script making them in
 * parallel. This counts recent failures and refuses once there have been too
 * many.
 *
 * Two limits, because they answer different attacks:
 *
 *   By address — someone working through a wordlist against one account.
 *   By machine — someone spraying one common password across many accounts,
 *   which the per-address limit would never see.
 *
 * The per-address limit is a denial of service against the account's real
 * owner: anyone who knows the address can lock them out for the window. That
 * is a genuine cost and it is accepted knowingly. The window is short, it
 * measures failures rather than attempts so a legitimate sign-in is never
 * blocked by someone else's failures being counted against them, and the
 * alternative — letting an account be guessed at indefinitely — is worse.
 */

const WINDOW_MINUTES = 15;
const MAX_FAILURES_PER_EMAIL = 10;
const MAX_FAILURES_PER_IP = 20;

/**
 * Neither the address nor the IP is stored. AUTH_PEPPER, when set, means a
 * copy of this table cannot be tested against a list of guessed addresses;
 * without it the hashing still keeps plain addresses out of the table, which
 * matters most for the failed attempts on addresses that have no account here.
 */
function fingerprint(value: string): string {
  return createHash('sha256')
    .update(`${process.env.AUTH_PEPPER ?? 'takaful'}:${value.trim().toLowerCase()}`)
    .digest('hex');
}

/**
 * The caller's address, as far as the proxy in front of us reports it.
 *
 * x-forwarded-for can be set by anyone if nothing trusted rewrites it, so this
 * is a hint and not an identity — which is exactly why it only ever adds a
 * limit and never lifts one.
 */
export async function callerIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || null;
  return h.get('x-real-ip');
}

export type ThrottleVerdict = { allowed: true } | { allowed: false; retryAfterMinutes: number };

export async function checkLoginAllowed(email: string, ip: string | null): Promise<ThrottleVerdict> {
  const rows = await query<{ by_email: number; by_ip: number }>(
    `SELECT
       (count(*) FILTER (WHERE email_hash = $1))::INTEGER AS by_email,
       (count(*) FILTER (WHERE ip_hash = $2 AND $2 IS NOT NULL))::INTEGER AS by_ip
     FROM auth_attempts
     WHERE NOT succeeded
       AND at > now() - ($3 || ' minutes')::INTERVAL
       AND (email_hash = $1 OR ($2 IS NOT NULL AND ip_hash = $2))`,
    [fingerprint(email), ip ? fingerprint(ip) : null, String(WINDOW_MINUTES)],
  );

  const counts = rows[0] ?? { by_email: 0, by_ip: 0 };
  if (counts.by_email >= MAX_FAILURES_PER_EMAIL || counts.by_ip >= MAX_FAILURES_PER_IP) {
    return { allowed: false, retryAfterMinutes: WINDOW_MINUTES };
  }
  return { allowed: true };
}

export async function recordLoginAttempt(
  email: string,
  ip: string | null,
  succeeded: boolean,
): Promise<void> {
  await execute(
    'INSERT INTO auth_attempts (email_hash, ip_hash, succeeded) VALUES ($1, $2, $3)',
    [fingerprint(email), ip ? fingerprint(ip) : null, succeeded],
  );

  /*
   * Prune from time to time rather than on a schedule, because there is no
   * scheduler and a table that needs one grows until somebody notices. One in
   * fifty successful sign-ins pays for it; failures never do, so a flood
   * cannot make the cleanup part of the attack.
   */
  if (succeeded && Math.random() < 0.02) {
    await execute('SELECT prune_auth_attempts()').catch(() => {});
    await execute('SELECT prune_auth_tokens()').catch(() => {});
  }
}

/*
 * Creating accounts is throttled separately, and by machine only.
 *
 * The sign-in limiter keys on the address, which is useless here: every
 * automated sign-up uses a fresh one. What repeats is the machine. The window
 * is an hour rather than fifteen minutes because a flood of accounts is a
 * slower, cheaper attack than guessing a password, and the ceiling is low
 * because a household sharing one connection does not need six accounts in an
 * hour — while a script wants thousands.
 *
 * Successes are counted, not failures: the thing being limited is the account
 * that got created, not the attempt that failed.
 */
const SIGNUP_WINDOW_MINUTES = 60;
const MAX_SIGNUPS_PER_IP = 5;

export async function checkSignupAllowed(ip: string | null): Promise<ThrottleVerdict> {
  // No usable address means no evidence to refuse on. A limiter that blocks
  // everyone it cannot identify would lock out anyone behind a proxy that
  // strips the header.
  if (!ip) return { allowed: true };

  const rows = await query<{ n: number }>(
    `SELECT count(*)::INTEGER AS n FROM auth_attempts
      WHERE succeeded AND email_hash IS NULL AND ip_hash = $1
        AND at > now() - ($2 || ' minutes')::INTERVAL`,
    [fingerprint(ip), String(SIGNUP_WINDOW_MINUTES)],
  );
  const used = rows[0]?.n ?? 0;
  return used >= MAX_SIGNUPS_PER_IP
    ? { allowed: false, retryAfterMinutes: SIGNUP_WINDOW_MINUTES }
    : { allowed: true };
}

/**
 * Records a created account. email_hash is left null on purpose: this row
 * counts a machine's sign-ups and has no reason to carry the address, and the
 * null is what distinguishes it from a sign-in attempt.
 */
export async function recordSignup(ip: string | null): Promise<void> {
  if (!ip) return;
  await execute(
    'INSERT INTO auth_attempts (email_hash, ip_hash, succeeded) VALUES (NULL, $1, true)',
    [fingerprint(ip)],
  );
}

/** Sign-ups counted against a machine right now, for tests and diagnostics. */
export async function recentSignups(ip: string): Promise<number> {
  const rows = await query<{ n: number }>(
    `SELECT count(*)::INTEGER AS n FROM auth_attempts
      WHERE succeeded AND email_hash IS NULL AND ip_hash = $1
        AND at > now() - ($2 || ' minutes')::INTERVAL`,
    [fingerprint(ip), String(SIGNUP_WINDOW_MINUTES)],
  );
  return rows[0]?.n ?? 0;
}

/** Failures counted against an address right now, for tests and diagnostics. */
export async function recentFailures(email: string): Promise<number> {
  const rows = await query<{ n: number }>(
    `SELECT count(*)::INTEGER AS n FROM auth_attempts
      WHERE NOT succeeded AND email_hash = $1
        AND at > now() - ($2 || ' minutes')::INTERVAL`,
    [fingerprint(email), String(WINDOW_MINUTES)],
  );
  return rows[0]?.n ?? 0;
}

export const THROTTLE_LIMITS = {
  windowMinutes: WINDOW_MINUTES,
  perEmail: MAX_FAILURES_PER_EMAIL,
  perIp: MAX_FAILURES_PER_IP,
  signupWindowMinutes: SIGNUP_WINDOW_MINUTES,
  signupsPerIp: MAX_SIGNUPS_PER_IP,
} as const;
