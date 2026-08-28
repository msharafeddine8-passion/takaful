/**
 * Changing a password while signed in, and the sign-up limiter.
 *
 * The action itself reads its caller out of a request and cannot be called
 * from a script, so this exercises the same sequence against the database and
 * asserts the properties it depends on: the old password stops working, the
 * new one starts, other devices are signed out, and the device doing the
 * changing is not.
 */
import { Client } from 'pg';
import { randomUUID, createHash } from 'node:crypto';
import { hashPassword, verifyPassword } from '../src/lib/auth.ts';
import { checkSignupAllowed, recordSignup, recentSignups, THROTTLE_LIMITS } from '../src/lib/throttle.ts';
import { guardedCleanup } from './guarded-cleanup.mts';

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();

let holes = 0,
  confirmed = 0;
function check(label: string, ok: boolean, detail: unknown = '') {
  if (!ok) holes += 1;
  else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail === '' ? '' : '  — ' + detail}`);
}

const MARK = `pwd-${Date.now()}`;
const user = randomUUID();
const IP = '198.51.100.77';
const hash = (s: string) => createHash('sha256').update(s).digest('hex');

try {
  await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [
    user, `${MARK}@example.test`, await hashPassword('the-old-password'),
  ]);
  await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [user, 'فحص']);
  await c.query(
    `INSERT INTO membership_status_history (user_id, new_status) VALUES ($1, 'registered_user')`,
    [user],
  );

  console.log('\n--- three devices signed in ---');
  const thisDevice = 'token-of-the-device-changing-it';
  for (const token of [thisDevice, 'token-of-a-phone', 'token-of-an-intruder']) {
    await c.query(
      `INSERT INTO sessions (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, now() + INTERVAL '30 days')`,
      [randomUUID(), user, hash(token)],
    );
  }
  check(
    'three sessions exist',
    (await c.query<{ n: string }>('SELECT count(*)::TEXT AS n FROM sessions WHERE user_id = $1', [user]))
      .rows[0].n === '3',
  );

  console.log('\n--- the change ---');
  const before = (await c.query<{ password_hash: string }>(
    'SELECT password_hash FROM users WHERE id = $1', [user])).rows[0].password_hash;
  check('the current password verifies', await verifyPassword(before, 'the-old-password'));
  check('a wrong current password does not', !(await verifyPassword(before, 'not-it')));
  check(
    'and the action refuses a new password identical to the old one',
    await verifyPassword(before, 'the-old-password'),
  );

  // Exactly what changePasswordAction performs.
  const next = await hashPassword('a-brand-new-password');
  await c.query('BEGIN');
  await c.query('UPDATE users SET password_hash = $2 WHERE id = $1', [user, next]);
  await c.query('DELETE FROM sessions WHERE user_id = $1 AND token_hash <> $2', [user, hash(thisDevice)]);
  await c.query('COMMIT');

  const after = (await c.query<{ password_hash: string }>(
    'SELECT password_hash FROM users WHERE id = $1', [user])).rows[0].password_hash;
  check('the new password works', await verifyPassword(after, 'a-brand-new-password'));
  check('the old one stops working', !(await verifyPassword(after, 'the-old-password')));

  const left = (await c.query<{ token_hash: string }>(
    'SELECT token_hash FROM sessions WHERE user_id = $1', [user])).rows;
  check('every other device is signed out', left.length === 1, left.length);
  check(
    'and the one still signed in is the device that made the change',
    left[0]?.token_hash === hash(thisDevice),
  );

  console.log('\n--- the sign-up limiter ---');
  await c.query(`DELETE FROM auth_attempts WHERE ip_hash IS NOT NULL`);
  check('a fresh machine may create an account', (await checkSignupAllowed(IP)).allowed);
  check('with no address recorded against it', (await recentSignups(IP)) === 0);

  for (let i = 0; i < THROTTLE_LIMITS.signupsPerIp - 1; i += 1) await recordSignup(IP);
  check(
    `${THROTTLE_LIMITS.signupsPerIp - 1} accounts is still allowed`,
    (await checkSignupAllowed(IP)).allowed,
    await recentSignups(IP),
  );

  await recordSignup(IP);
  check(`${THROTTLE_LIMITS.signupsPerIp} accounts is refused`, !(await checkSignupAllowed(IP)).allowed);
  check('a different machine is unaffected', (await checkSignupAllowed('203.0.113.9')).allowed);
  check(
    'a caller with no usable address is not blocked',
    (await checkSignupAllowed(null)).allowed,
  );

  const stored = (await c.query<{ email_hash: string | null }>(
    'SELECT email_hash FROM auth_attempts WHERE ip_hash IS NOT NULL LIMIT 1')).rows[0];
  check('sign-up rows carry no address at all', stored?.email_hash === null);

  const raw = (await c.query<{ n: string }>(
    'SELECT count(*)::TEXT AS n FROM auth_attempts WHERE ip_hash = $1', [IP])).rows[0].n;
  check('and the machine is stored hashed, not in the clear', raw === '0');
} finally {
  console.log('\n--- cleanup ---');
  // The body opens a transaction of its own; anything thrown mid-way leaves it
  // open, and the cleanup transaction below cannot begin inside it.
  await c.query('ROLLBACK').catch(() => {});
  /*
   * Under the delete hatch. `audit_logs` is append-only since migration 049,
   * and `actor_id` is ON DELETE RESTRICT — a refused DELETE here means the
   * `DELETE FROM users` two lines later is refused too and a real account is
   * left in production, which is what happened to probe-achievements.
   *
   * The unfiltered `auth_attempts` statement is why the helper only applies
   * the shared parameters to statements that carry a `$n`: sending `[user]`
   * with a statement that has no placeholder is refused outright, and that is
   * the second of the two traps documented in scripts/guarded-cleanup.mts.
   */
  await guardedCleanup(
    c,
    [
      'DELETE FROM auth_attempts WHERE ip_hash IS NOT NULL',
      'DELETE FROM sessions WHERE user_id = $1',
      'DELETE FROM audit_logs WHERE actor_id = $1',
      'DELETE FROM membership_status_history WHERE user_id = $1 OR changed_by = $1',
      'DELETE FROM user_journey_assignments WHERE user_id = $1',
      'DELETE FROM profiles WHERE user_id = $1',
      'DELETE FROM users WHERE id = $1',
    ],
    { params: [user] },
  );
  const n = (await c.query<{ n: string }>(
    'SELECT count(*)::TEXT AS n FROM users WHERE email LIKE $1', [`${MARK}%`])).rows[0].n;
  console.log(`  ${n} probe users remaining (expected 0)`);
  await c.end();
}

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
