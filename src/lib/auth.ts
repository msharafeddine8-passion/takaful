import 'server-only';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { hash, verify } from '@node-rs/argon2';
import { execute, query, queryOne, transaction } from './db';

export const SESSION_COOKIE = 'tkf_session';
const SESSION_DAYS = 30;

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

export type MembershipStatus =
  | 'registered_user'
  | 'course_participant'
  | 'volunteer_applicant'
  | 'volunteer_candidate'
  | 'accepted_volunteer'
  | 'active_volunteer'
  | 'inactive_volunteer'
  | 'volunteer_alumni'
  | 'suspended'
  | 'rejected';

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
     VALUES (?, ?, ?, ?, ?)`,
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
    await execute('DELETE FROM sessions WHERE token_hash = ?', [hashToken(token)]);
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

  const row = await queryOne<{
    id: string;
    email: string;
    locale: 'ar' | 'en';
    status: 'active' | 'suspended' | 'deactivated';
    full_name: string;
  }>(
    `SELECT u.id, u.email, u.locale, u.status, p.full_name
       FROM sessions s
       JOIN users u    ON u.id = s.user_id
       JOIN profiles p ON p.user_id = u.id
      WHERE s.token_hash = ? AND s.expires_at > NOW()
      LIMIT 1`,
    [hashToken(token)],
  );

  if (!row || row.status !== 'active') return null;

  const roleRows = await query<{ role: Role }>(
    `SELECT role FROM user_roles
      WHERE user_id = ?
        AND valid_from <= NOW()
        AND (valid_until IS NULL OR valid_until > NOW())`,
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
      WHERE user_id = ? ORDER BY changed_at DESC, id DESC LIMIT 1`,
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
     VALUES (?, ?, ?, ?, ?, ?)`,
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
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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

  const existing = await queryOne<{ id: string }>('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) return { ok: false, error: 'email_taken' };

  const userId = randomUUID();
  const passwordHash = await hashPassword(input.password);

  // The account, its profile and its first status row are one atomic fact.
  await transaction(async (conn) => {
    await conn.execute(
      'INSERT INTO users (id, email, password_hash, locale) VALUES (?, ?, ?, ?)',
      [userId, email, passwordHash, input.locale],
    );
    await conn.execute('INSERT INTO profiles (user_id, full_name) VALUES (?, ?)', [
      userId,
      input.fullName.trim(),
    ]);
    await conn.execute(
      `INSERT INTO membership_status_history (user_id, previous_status, new_status)
       VALUES (?, NULL, 'registered_user')`,
      [userId],
    );
    await conn.execute(
      `INSERT INTO user_roles (user_id, role, scope_type) VALUES (?, 'registered_user', 'self')`,
      [userId],
    );
  });

  await audit({ action: 'user.registered', targetType: 'user', targetId: userId });
  return { ok: true, userId };
}

// -------------------------------------------------------------------- login

export type LoginResult =
  | { ok: true; userId: string }
  | { ok: false; error: 'invalid_credentials' | 'suspended' };

export async function authenticate(email: string, password: string): Promise<LoginResult> {
  const row = await queryOne<{ id: string; password_hash: string; status: string }>(
    'SELECT id, password_hash, status FROM users WHERE email = ? LIMIT 1',
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

  await execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [row.id]);
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
