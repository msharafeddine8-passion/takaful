/**
 * Account recovery and login throttling: the rules that decide whether a
 * stranger with a stolen inbox, or a script with a wordlist, gets in.
 */
import { Client } from 'pg';
import { randomUUID, createHash } from 'node:crypto';
import { hashPassword, verifyPassword } from '../src/lib/auth.ts';
import {
  issueToken,
  spendToken,
  resetPassword,
  confirmEmail,
} from '../src/lib/recovery.ts';
import { checkLoginAllowed, recentFailures, THROTTLE_LIMITS } from '../src/lib/throttle.ts';

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();

let holes = 0,
  confirmed = 0;
function check(label: string, ok: boolean, detail: unknown = '') {
  if (!ok) holes += 1;
  else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail === '' ? '' : '  — ' + detail}`);
}
async function mustFail(name: string, sql: string, params: unknown[] = []) {
  try {
    await c.query(sql, params);
    console.log(`  HOLE     ${name}  <-- allowed and should not be`);
    holes += 1;
  } catch (e) {
    console.log(`  rejected ${name}  (${(e as { code?: string }).code ?? '?'})`);
    confirmed += 1;
  }
}

const MARK = `rec-${Date.now()}`;
const EMAIL = `${MARK}@example.test`;
const user = randomUUID();

function fingerprint(value: string): string {
  return createHash('sha256')
    .update(`${process.env.AUTH_PEPPER ?? 'takaful'}:${value.trim().toLowerCase()}`)
    .digest('hex');
}

try {
  await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [
    user,
    EMAIL,
    await hashPassword('the-original-password'),
  ]);
  await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [user, 'مستخدم']);
  await c.query(
    `INSERT INTO membership_status_history (user_id, new_status) VALUES ($1, 'registered_user')`,
    [user],
  );

  console.log('\n--- what the token table refuses ---');
  await mustFail(
    'a token for a purpose nobody defined',
    `INSERT INTO auth_tokens (id, user_id, purpose, token_hash, expires_at)
     VALUES ($1, $2, 'admin_backdoor', 'h', now() + INTERVAL '1 hour')`,
    [randomUUID(), user],
  );
  await mustFail(
    'a token that expired before it was created',
    `INSERT INTO auth_tokens (id, user_id, purpose, token_hash, expires_at, created_at)
     VALUES ($1, $2, 'password_reset', 'h2', now(), now() + INTERVAL '1 hour')`,
    [randomUUID(), user],
  );
  await c.query(
    `INSERT INTO auth_tokens (id, user_id, purpose, token_hash, expires_at)
     VALUES ($1, $2, 'password_reset', 'shared-hash', now() + INTERVAL '1 hour')`,
    [randomUUID(), user],
  );
  await mustFail(
    'two tokens with the same hash',
    `INSERT INTO auth_tokens (id, user_id, purpose, token_hash, expires_at)
     VALUES ($1, $2, 'email_verify', 'shared-hash', now() + INTERVAL '1 hour')`,
    [randomUUID(), user],
  );
  await c.query(`DELETE FROM auth_tokens WHERE token_hash = 'shared-hash'`);

  console.log('\n--- the reset link ---');
  const token = await issueToken(user, 'password_reset');
  check('a token is long enough that guessing is not a strategy', token.length >= 40, token.length);

  const raw = (
    await c.query<{ n: string }>(`SELECT count(*)::TEXT AS n FROM auth_tokens WHERE token_hash = $1`, [
      token,
    ])
  ).rows[0].n;
  check('the token itself is not what is stored', raw === '0');

  const second = await issueToken(user, 'password_reset');
  const firstStillLive = await spendToken(token, 'password_reset');
  check('asking for a new link kills the old one', firstStillLive === null);

  const wrongPurpose = await spendToken(second, 'email_verify');
  check('a reset link cannot be used to confirm an address', wrongPurpose === null);

  console.log('\n--- resetting ---');
  await c.query(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, now() + INTERVAL '30 days')`,
    [randomUUID(), user, 'session-of-an-intruder'],
  );
  const sessionsBefore = (
    await c.query<{ n: string }>('SELECT count(*)::TEXT AS n FROM sessions WHERE user_id = $1', [user])
  ).rows[0].n;
  check('there is a session open before the reset', sessionsBefore === '1');

  const short = await resetPassword(second, 'short');
  check('a password under ten characters is refused', short === 'weak');
  check(
    'and refusing it did not spend the link',
    (
      await c.query<{ n: string }>(
        `SELECT count(*)::TEXT AS n FROM auth_tokens WHERE user_id = $1 AND purpose = 'password_reset' AND used_at IS NULL`,
        [user],
      )
    ).rows[0].n === '1',
  );

  const done = await resetPassword(second, 'a-brand-new-password');
  check('a good password is accepted', done === 'ok');

  const after = (
    await c.query<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = $1', [user])
  ).rows[0];
  check('the new password works', await verifyPassword(after.password_hash, 'a-brand-new-password'));
  check(
    'and the old one does not',
    !(await verifyPassword(after.password_hash, 'the-original-password')),
  );

  const sessionsAfter = (
    await c.query<{ n: string }>('SELECT count(*)::TEXT AS n FROM sessions WHERE user_id = $1', [user])
  ).rows[0].n;
  check(
    'every session is signed out, so a thief holding one loses it',
    sessionsAfter === '0',
    sessionsAfter,
  );

  const reuse = await resetPassword(second, 'yet-another-password');
  check('the link cannot be used a second time', reuse === 'invalid');
  check(
    'and the password is unchanged by the attempt',
    await verifyPassword(
      (await c.query<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = $1', [user]))
        .rows[0].password_hash,
      'a-brand-new-password',
    ),
  );

  console.log('\n--- an expired link ---');
  /*
   * Written as a row that was issued two hours ago and lapsed one hour ago,
   * rather than by dragging a live token's expiry backwards — chk_token_window
   * refuses that, and rightly: a token that expires before it exists is a bug,
   * not a test fixture.
   */
  const expiredToken = randomUUID() + randomUUID();
  await c.query(
    `INSERT INTO auth_tokens (id, user_id, purpose, token_hash, created_at, expires_at)
     VALUES ($1, $2, 'password_reset', $3, now() - INTERVAL '2 hours', now() - INTERVAL '1 hour')`,
    [randomUUID(), user, createHash('sha256').update(expiredToken).digest('hex')],
  );
  check(
    'an expired link is refused',
    (await resetPassword(expiredToken, 'password-number-three')) === 'invalid',
  );
  check(
    'and it is not quietly marked used, so it stays visibly expired',
    (
      await c.query<{ n: string }>(
        `SELECT count(*)::TEXT AS n FROM auth_tokens
          WHERE user_id = $1 AND expires_at < now() AND used_at IS NULL`,
        [user],
      )
    ).rows[0].n === '1',
  );

  console.log('\n--- confirming an address ---');
  const verifyToken = await issueToken(user, 'email_verify', EMAIL);
  check('confirming works', (await confirmEmail(verifyToken)) === 'ok');
  check(
    'and it is recorded',
    (
      await c.query<{ v: Date | null }>('SELECT email_verified_at AS v FROM users WHERE id = $1', [user])
    ).rows[0].v !== null,
  );

  const secondVerify = await issueToken(user, 'email_verify', EMAIL);
  check('confirming an already-confirmed address says so', (await confirmEmail(secondVerify)) === 'already');

  // Someone changes their address after the link was sent.
  await c.query('UPDATE users SET email_verified_at = NULL WHERE id = $1', [user]);
  const staleToken = await issueToken(user, 'email_verify', 'old-address@example.test');
  check(
    'a link sent to a since-changed address does not confirm the new one',
    (await confirmEmail(staleToken)) === 'address_changed',
  );
  check(
    'and the address stays unconfirmed',
    (
      await c.query<{ v: Date | null }>('SELECT email_verified_at AS v FROM users WHERE id = $1', [user])
    ).rows[0].v === null,
  );

  console.log('\n--- slowing down guessing ---');
  const ip = '203.0.113.7';
  check('a fresh address is allowed through', (await checkLoginAllowed(EMAIL, ip)).allowed);

  // Failures short of the limit must not lock anyone out.
  for (let i = 0; i < THROTTLE_LIMITS.perEmail - 1; i += 1) {
    await c.query('INSERT INTO auth_attempts (email_hash, ip_hash, succeeded) VALUES ($1, $2, false)', [
      fingerprint(EMAIL),
      fingerprint(ip),
    ]);
  }
  check(
    `${THROTTLE_LIMITS.perEmail - 1} failures is still allowed`,
    (await checkLoginAllowed(EMAIL, ip)).allowed,
    await recentFailures(EMAIL),
  );

  await c.query('INSERT INTO auth_attempts (email_hash, ip_hash, succeeded) VALUES ($1, $2, false)', [
    fingerprint(EMAIL),
    fingerprint(ip),
  ]);
  const blocked = await checkLoginAllowed(EMAIL, ip);
  check(`${THROTTLE_LIMITS.perEmail} failures is refused`, !blocked.allowed);

  check(
    'a different address from the same machine is still allowed, below the machine limit',
    (await checkLoginAllowed(`other-${MARK}@example.test`, ip)).allowed,
  );
  check(
    'and the blocked address is allowed again from a different machine only if under its own limit',
    !(await checkLoginAllowed(EMAIL, '198.51.100.4')).allowed,
  );

  // Old failures fall out of the window rather than counting forever.
  await c.query(
    `UPDATE auth_attempts SET at = now() - INTERVAL '30 minutes' WHERE email_hash = $1`,
    [fingerprint(EMAIL)],
  );
  check(
    'failures older than the window stop counting',
    (await checkLoginAllowed(EMAIL, ip)).allowed,
    await recentFailures(EMAIL),
  );

  console.log('\n--- pruning ---');
  // A fresh failure, to prove the cleanup does not eat rows the limiter is
  // still counting. That is the dangerous direction: a prune that runs a
  // minute early silently switches the throttling off.
  await c.query('INSERT INTO auth_attempts (email_hash, ip_hash, succeeded) VALUES ($1, $2, false)', [
    fingerprint(EMAIL),
    fingerprint(ip),
  ]);
  await c.query('SELECT prune_auth_attempts()');
  check(
    'the default prune leaves everything inside the throttling window',
    (await recentFailures(EMAIL)) === 1,
    await recentFailures(EMAIL),
  );
  check(
    'and leaves the thirty-minute-old ones too, since they are under a day',
    (
      await c.query<{ n: string }>(
        'SELECT count(*)::TEXT AS n FROM auth_attempts WHERE email_hash = $1',
        [fingerprint(EMAIL)],
      )
    ).rows[0].n === String(THROTTLE_LIMITS.perEmail + 1),
  );

  /*
   * The deletion path is tested by ageing this probe's own rows past the
   * default 24-hour cut, not by calling prune with a short interval.
   *
   * prune_auth_attempts() is global — it has no way to be scoped to one
   * address — so asking it to remove everything older than ten minutes would
   * delete real failed sign-ins too, quietly weakening the throttle for
   * whoever those attempts belonged to. A probe must not delete rows it did
   * not create.
   */
  await c.query(
    `UPDATE auth_attempts SET at = now() - INTERVAL '25 hours' WHERE email_hash = $1 AND at < now() - INTERVAL '20 minutes'`,
    [fingerprint(EMAIL)],
  );
  const mine = async () =>
    Number(
      (
        await c.query<{ n: string }>(
          'SELECT count(*)::TEXT AS n FROM auth_attempts WHERE email_hash = $1',
          [fingerprint(EMAIL)],
        )
      ).rows[0].n,
    );
  const before = await mine();
  const removed = (
    await c.query<{ prune_auth_attempts: number }>('SELECT prune_auth_attempts()')
  ).rows[0].prune_auth_attempts;
  check('the count it reports is a number', typeof removed === 'number', removed);
  check(
    'rows past the cut are gone',
    (await mine()) === before - THROTTLE_LIMITS.perEmail,
    `${before} -> ${await mine()}`,
  );
  check('and the recent one survives', (await recentFailures(EMAIL)) === 1);
} finally {
  console.log('\n--- cleanup ---');
  await c.query('DELETE FROM auth_attempts WHERE email_hash = $1', [fingerprint(EMAIL)]);
  await c.query('DELETE FROM auth_tokens WHERE user_id = $1', [user]);
  await c.query('DELETE FROM sessions WHERE user_id = $1', [user]);
  await c.query('DELETE FROM email_deliveries WHERE user_id = $1', [user]);
  await c.query('DELETE FROM audit_logs WHERE actor_id = $1', [user]);
  await c.query('DELETE FROM membership_status_history WHERE user_id = $1', [user]);
  await c.query('DELETE FROM user_journey_assignments WHERE user_id = $1', [user]);
  await c.query('DELETE FROM profiles WHERE user_id = $1', [user]);
  await c.query('DELETE FROM users WHERE id = $1', [user]);
  const left = (
    await c.query<{ n: string }>('SELECT count(*)::TEXT AS n FROM users WHERE email LIKE $1', [
      `${MARK}%`,
    ])
  ).rows[0].n;
  console.log(`  ${left} probe users remaining (expected 0)`);
  await c.end();
}

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
