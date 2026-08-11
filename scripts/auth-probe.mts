/**
 * Exercises the real authentication code against the real database.
 *
 * Calls the same functions the app calls - no reimplementation - so a pass
 * here means registration and sign-in actually work, not that something
 * shaped like them does. Cleans up after itself.
 */
import { Client } from 'pg';
import { hashPassword, verifyPassword, registerUser, authenticate, membershipStatus } from '../src/lib/auth.ts';
import { generateCode } from '../src/lib/certificates.ts';

let failures = 0;
function check(name: string, ok: boolean, detail = '') {
  if (!ok) failures += 1;
  console.log(`  ${ok ? 'pass' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
}

const email = `probe-${Date.now()}@example.test`;
const password = 'a-correct-horse-battery';

console.log('--- password hashing (Argon2id) ---');
const t0 = Date.now();
const hash = await hashPassword(password);
const hashMs = Date.now() - t0;
check('produces an argon2id hash', hash.startsWith('$argon2id$'), hash.slice(0, 30) + '...');
// Assert the cost parameters, not the wall time: the same hash takes wildly
// different times on a laptop and on a cold serverless instance, so a
// millisecond threshold would only measure the machine it ran on.
// m=19456,t=2,p=1 is the OWASP baseline for Argon2id.
check('uses the OWASP cost parameters', hash.includes('$m=19456,t=2,p=1$'), hash.split('$')[3]);
console.log(`  note  hashing took ${hashMs}ms on this machine`);
check('verifies the right password', await verifyPassword(hash, password));
check('rejects the wrong password', !(await verifyPassword(hash, password + 'x')));
check('rejects a malformed hash without throwing', !(await verifyPassword('not-a-hash', password)));

const salted = await hashPassword(password);
check('same password hashes differently (salted)', salted !== hash);

console.log('\n--- registration ---');
const reg = await registerUser({ email, password, fullName: 'Probe Person', locale: 'ar' });
check('registers', reg.ok === true);
if (!reg.ok) { console.error(reg); process.exit(1); }
const userId = reg.userId;

const dup = await registerUser({ email, password, fullName: 'Impostor', locale: 'ar' });
check('refuses a duplicate address', dup.ok === false && dup.error === 'email_taken');

const upper = await registerUser({
  email: email.toUpperCase(), password, fullName: 'Caps', locale: 'ar',
});
check('treats UPPERCASE as the same address', upper.ok === false && upper.error === 'email_taken');

console.log('\n--- sign in ---');
const good = await authenticate(email, password);
check('accepts the right password', good.ok === true);
const bad = await authenticate(email, 'wrong-password');
check('rejects the wrong password', bad.ok === false && bad.error === 'invalid_credentials');
const nobody = await authenticate('nobody-here@example.test', password);
check('rejects an unknown address', nobody.ok === false && nobody.error === 'invalid_credentials');

// The dummy-hash path exists so response time does not reveal whether an
// address is registered. Measure it rather than trusting the comment.
const tKnown = Date.now(); await authenticate(email, 'wrong-password'); const msKnown = Date.now() - tKnown;
const tUnknown = Date.now(); await authenticate('nobody-here@example.test', 'wrong-password'); const msUnknown = Date.now() - tUnknown;
const ratio = msUnknown / Math.max(msKnown, 1);
check('unknown address takes comparable time', ratio > 0.4 && ratio < 2.5, `known ${msKnown}ms vs unknown ${msUnknown}ms`);

console.log('\n--- what registration wrote ---');
const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect();

const profile = await c.query('SELECT full_name FROM profiles WHERE user_id = $1', [userId]);
check('a profile row exists', profile.rows.length === 1, profile.rows[0]?.full_name);

const roles = await c.query('SELECT role FROM user_roles WHERE user_id = $1', [userId]);
check('starts as registered_user', roles.rows.length === 1 && roles.rows[0].role === 'registered_user');

const status = await membershipStatus(userId);
check('membership status derives from history', status === 'registered_user', status);

const stored = await c.query('SELECT password_hash, email FROM users WHERE id = $1', [userId]);
check('password is not stored in the clear', !stored.rows[0].password_hash.includes(password));
check('email stored lowercase', stored.rows[0].email === email.toLowerCase());

const logged = await c.query(`SELECT action FROM audit_logs WHERE target_id = $1`, [userId]);
check('registration is in the audit log', logged.rows.some((r) => r.action === 'user.registered'));

console.log('\n--- certificate round trip ---');
const code = generateCode();
await c.query(
  `INSERT INTO certificates (id, code, user_id, kind, hours_at_issue, snapshot)
   VALUES (gen_random_uuid(), $1, $2, 'hours', 300, $3)`,
  [code, userId, JSON.stringify({ fullName: 'Probe Person', titleAr: 'x', titleEn: 'x' })],
);
const found = await c.query('SELECT code, snapshot FROM certificates WHERE code = $1', [code]);
check('issued certificate is findable by code', found.rows.length === 1, code);
check('snapshot survived the round trip', found.rows[0]?.snapshot?.fullName === 'Probe Person');

console.log('\n--- cleanup ---');
await c.query('DELETE FROM certificates WHERE user_id = $1', [userId]);
await c.query('DELETE FROM audit_logs WHERE target_id = $1', [userId]);
await c.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
await c.query('DELETE FROM membership_status_history WHERE user_id = $1', [userId]);
await c.query('DELETE FROM profiles WHERE user_id = $1', [userId]);
await c.query('DELETE FROM users WHERE id = $1', [userId]);
const left = await c.query('SELECT count(*)::int n FROM users');
check('database left empty', left.rows[0].n === 0, `${left.rows[0].n} users`);
await c.end();

console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
