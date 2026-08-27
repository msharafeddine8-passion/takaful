import 'server-only';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { hash, verify } from '@node-rs/argon2';
import { execute, query, queryOne, transaction } from './db';

export const SESSION_COOKIE = 'tkf_session';
const SESSION_DAYS = 30;

/*
 * The idle window, alongside the absolute one above.
 *
 * Fourteen and not one: this is a volunteer platform reached mostly from
 * phones, often weekly rather than daily, and a window that signs somebody out
 * between two activities teaches them that the site logs you out — which ends
 * with the password written somewhere worse than a cookie.
 *
 * Fourteen and not thirty, because thirty is the absolute expiry and an idle
 * rule equal to it is not a rule.
 */
const SESSION_IDLE_DAYS = 14;

/** How stale last_seen_at may get before it is worth a write. See currentUser. */
const TOUCH_AFTER_MINUTES = 10;

export type Role =
  | 'registered_user'
  | 'volunteer'
  | 'team_leader'
  | 'instructor'
  | 'field_supervisor'
  | 'project_coordinator'
  | 'content_manager'
  | 'program_admin'
  | 'super_admin';

/**
 * Every membership status there is, in the order the CHECK constraint in
 * migration 001 lists them — roughly the order somebody moves through them.
 *
 * A VALUE and not only a type, because a type is erased before anything can
 * read it. The staff filter needs to offer every status without a second copy
 * of the list living in a page: a hand-written `<option>` list is a list that
 * silently stops mentioning a status the day one is added here, and the filter
 * that quietly cannot find «متطوّع سابق» is worse than no filter at all. The
 * type below is derived from this array, so the two cannot disagree.
 *
 * `dict.account.statuses` has one label per member and its StatusLabels type
 * names the same ten keys, so a status added here without a label is a type
 * error in the dictionary rather than a raw `volunteer_alumni` on the screen.
 */
export const MEMBERSHIP_STATUSES = [
  'registered_user',
  'course_participant',
  'volunteer_applicant',
  'volunteer_candidate',
  'accepted_volunteer',
  'active_volunteer',
  'inactive_volunteer',
  /*
   * Paused by a decision, which is not the same as having gone quiet.
   *
   * inactive_volunteer describes an absence the platform noticed. `on_hold` is
   * something somebody chose — at the volunteer's own request, or while a
   * question is being looked at — and membership_status_history records who
   * decided and why. Migration 061 argues it at length.
   *
   * is_volunteer() excludes it: a pause stops somebody taking part while they
   * keep their number, their hours, their badges and their record. It is not
   * suspension either, which shuts the account and ends every session. Being
   * paused should not feel like being erased, least of all to somebody who
   * asked for it.
   */
  'on_hold',
  'volunteer_alumni',
  'suspended',
  'rejected',
] as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

/** Whether a value read out of a URL is one of the ten. Nothing else is. */
export function isMembershipStatus(value: unknown): value is MembershipStatus {
  return (
    typeof value === 'string' && (MEMBERSHIP_STATUSES as readonly string[]).includes(value)
  );
}

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  locale: 'ar' | 'en';
  status: 'active' | 'suspended' | 'deactivated';
  roles: Role[];
  membershipStatus: MembershipStatus;
};

// ---------------------------------------------------------------- passwords

/** Argon2id with parameters that are deliberate, not defaults. */
export function hashPassword(plain: string): Promise<string> {
  return hash(plain, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

export async function verifyPassword(hashed: string, plain: string): Promise<boolean> {
  try {
    return await verify(hashed, plain);
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------- sessions

/** The cookie holds the raw token; only its hash is stored, so a database leak cannot mint sessions. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string, userAgent?: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  await execute(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [randomUUID(), userId, hashToken(token), expires, userAgent?.slice(0, 255) ?? null],
  );

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await execute('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)]);
  }
  store.delete(SESSION_COOKIE);
}

/**
 * Resolve the signed-in user, or null.
 * Suspended accounts resolve to null so a suspension takes effect immediately.
 */
export async function currentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const hashed = hashToken(token);
  const row = await queryOne<{
    id: string;
    email: string;
    locale: 'ar' | 'en';
    status: 'active' | 'suspended' | 'deactivated';
    full_name: string;
    stale: boolean;
  }>(
    /*
     * Two clocks, and a session has to satisfy both.
     *
     * expires_at is the absolute one: thirty days from signing in, whatever
     * happens. last_seen_at is the idle one, and until now it was a column
     * nothing wrote and nothing read — so a phone left on a bus stayed signed
     * in to somebody's volunteer record for a month, with children's
     * safeguarding material behind that cookie.
     *
     * `stale` comes back rather than a second query: the row is already here,
     * and asking Postgres whether it is time to write is cheaper than asking
     * it again afterwards.
     */
    `SELECT u.id, u.email, u.locale, u.status, p.full_name,
            s.last_seen_at < now() - ($3 || ' minutes')::interval AS stale
       FROM sessions s
       JOIN users u    ON u.id = s.user_id
       JOIN profiles p ON p.user_id = u.id
      WHERE s.token_hash = $1
        AND s.expires_at > now()
        AND s.last_seen_at > now() - ($2 || ' days')::interval
      LIMIT 1`,
    [hashed, String(SESSION_IDLE_DAYS), String(TOUCH_AFTER_MINUTES)],
  );

  if (!row || row.status !== 'active') return null;

  /*
   * Touch it, but not on every request.
   *
   * currentUser() runs on every authenticated page render. Writing
   * last_seen_at each time would be a write per page view on a pooled Neon
   * connection, to keep a column that is only ever read to the day. Once every
   * few minutes carries the same meaning at a fraction of the cost.
   *
   * Not awaited, and failures are swallowed: this is bookkeeping. A write that
   * loses a race with another tab has written the same value, and one that
   * fails outright must not turn a signed-in volunteer's page into an error.
   */
  if (row.stale) {
    void execute('UPDATE sessions SET last_seen_at = now() WHERE token_hash = $1', [
      hashed,
    ]).catch(() => {});
  }

  const roleRows = await query<{ role: Role }>(
    `SELECT role FROM user_roles
      WHERE user_id = $1
        AND valid_from <= now()
        AND (valid_until IS NULL OR valid_until > now())`,
    [row.id],
  );

  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    locale: row.locale,
    status: row.status,
    roles: roleRows.map((r) => r.role),
    membershipStatus: await membershipStatus(row.id),
  };
}

// -------------------------------------------------------- membership status

/** Current status is always the newest history row — the history is the source of truth. */
export async function membershipStatus(userId: string): Promise<MembershipStatus> {
  const row = await queryOne<{ new_status: MembershipStatus }>(
    `SELECT new_status FROM membership_status_history
      WHERE user_id = $1 ORDER BY changed_at DESC, id DESC LIMIT 1`,
    [userId],
  );
  return row?.new_status ?? 'registered_user';
}

/**
 * Record a membership status change. Never overwrites: it appends.
 * Admin-initiated changes must carry a reason.
 */
export async function setMembershipStatus(opts: {
  userId: string;
  next: MembershipStatus;
  changedBy?: string | null;
  actorRole?: string | null;
  reason?: string | null;
}): Promise<void> {
  const previous = await membershipStatus(opts.userId);
  if (previous === opts.next) return;

  if (opts.changedBy && !opts.reason) {
    throw new Error('An admin-initiated status change requires a reason.');
  }

  await execute(
    `INSERT INTO membership_status_history
       (user_id, previous_status, new_status, changed_by, actor_role, reason)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      opts.userId,
      previous,
      opts.next,
      opts.changedBy ?? null,
      opts.actorRole ?? null,
      opts.reason ?? null,
    ],
  );
}

// ------------------------------------------------------------------ audit

export async function audit(entry: {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  reason?: string;
}): Promise<void> {
  await execute(
    `INSERT INTO audit_logs
       (actor_id, actor_role, action, target_type, target_id, previous_value, new_value, reason)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      entry.actorId ?? null,
      entry.actorRole ?? null,
      entry.action,
      entry.targetType ?? null,
      entry.targetId ?? null,
      entry.previousValue === undefined ? null : JSON.stringify(entry.previousValue),
      entry.newValue === undefined ? null : JSON.stringify(entry.newValue),
      entry.reason ?? null,
    ],
  );
}

// ------------------------------------------------------------- registration

export type RegisterResult =
  | { ok: true; userId: string }
  | { ok: false; error: 'email_taken' | 'db_unavailable' };

export async function registerUser(input: {
  email: string;
  password: string;
  fullName: string;
  locale: 'ar' | 'en';
}): Promise<RegisterResult> {
  const email = input.email.trim().toLowerCase();

  const userId = randomUUID();
  const passwordHash = await hashPassword(input.password);

  // The account, its profile and its first status row are one atomic fact.
  try {
    await transaction(async (client) => {
      // No read-then-write check for a taken address: two concurrent
      // registrations would both pass it. The unique index decides.
      await client.query(
        'INSERT INTO users (id, email, password_hash, locale) VALUES ($1, $2, $3, $4)',
        [userId, email, passwordHash, input.locale],
      );
      await client.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [
        userId,
        input.fullName.trim(),
      ]);
      await client.query(
        `INSERT INTO membership_status_history (user_id, previous_status, new_status)
         VALUES ($1, NULL, 'registered_user')`,
        [userId],
      );
      await client.query(
        `INSERT INTO user_roles (user_id, role, scope_type) VALUES ($1, 'registered_user', 'self')`,
        [userId],
      );
    });
  } catch (error) {
    // 23505 is unique_violation — on this table that can only be the address.
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return { ok: false, error: 'email_taken' };
    }
    throw error;
  }

  await audit({ action: 'user.registered', targetType: 'user', targetId: userId });
  return { ok: true, userId };
}

// -------------------------------------------------------------------- login

export type LoginResult =
  | { ok: true; userId: string }
  | { ok: false; error: 'invalid_credentials' | 'suspended' };

export async function authenticate(email: string, password: string): Promise<LoginResult> {
  const row = await queryOne<{ id: string; password_hash: string; status: string }>(
    'SELECT id, password_hash, status FROM users WHERE email = $1 LIMIT 1',
    [email.trim().toLowerCase()],
  );

  // Verify against a dummy hash when the account is unknown, so response time
  // does not reveal whether the address exists.
  if (!row) {
    await verifyPassword(
      '$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHR2YWx1ZQ$0000000000000000000000000000000000000000000',
      password,
    );
    return { ok: false, error: 'invalid_credentials' };
  }

  const valid = await verifyPassword(row.password_hash, password);
  if (!valid) return { ok: false, error: 'invalid_credentials' };
  if (row.status !== 'active') return { ok: false, error: 'suspended' };

  await execute('UPDATE users SET last_login_at = now() WHERE id = $1', [row.id]);
  return { ok: true, userId: row.id };
}

// ------------------------------------------------------------------- guards

export function hasRole(user: SessionUser | null, ...roles: Role[]): boolean {
  if (!user) return false;
  return roles.some((r) => user.roles.includes(r));
}

/** Use in server components and actions that must not run for signed-out visitors. */
export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}
