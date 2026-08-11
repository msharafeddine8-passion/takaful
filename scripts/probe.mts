/**
 * Tries to break the rules the schema is supposed to enforce.
 *
 * A CHECK constraint that was never tested is a comment. Each case below
 * SHOULD fail; a case that succeeds is a hole. Everything runs inside one
 * transaction that is rolled back, so the database is left untouched.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15_000,
});
await client.connect();
await client.query('BEGIN');

let holes = 0;
let confirmed = 0;

/** Asserts that a statement is rejected. */
async function mustFail(name: string, sql: string, params: unknown[] = []) {
  await client.query('SAVEPOINT s');
  try {
    await client.query(sql, params);
    await client.query('ROLLBACK TO SAVEPOINT s');
    console.log(`  HOLE      ${name}  <-- was allowed and should not be`);
    holes += 1;
  } catch (error) {
    await client.query('ROLLBACK TO SAVEPOINT s');
    const code = (error as { code?: string }).code ?? '?';
    console.log(`  rejected  ${name}  (${code})`);
    confirmed += 1;
  }
}

/** Asserts that a statement is accepted. */
async function mustPass(name: string, sql: string, params: unknown[] = []) {
  await client.query('SAVEPOINT s');
  try {
    await client.query(sql, params);
    await client.query('RELEASE SAVEPOINT s');
    console.log(`  ok        ${name}`);
    confirmed += 1;
  } catch (error) {
    await client.query('ROLLBACK TO SAVEPOINT s');
    console.log(`  BROKEN    ${name}  <-- ${(error as Error).message}`);
    holes += 1;
  }
}

// Two people to work with.
const alice = randomUUID();
const bob = randomUUID();
for (const [id, email, name] of [
  [alice, 'probe-alice@example.test', 'Alice Probe'],
  [bob, 'probe-bob@example.test', 'Bob Probe'],
] as const) {
  await client.query(
    'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
    [id, email, 'x'],
  );
  await client.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [id, name]);
}

console.log('\n--- identity ---');
await mustFail(
  'duplicate email',
  'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
  [randomUUID(), 'probe-alice@example.test', 'x'],
);
await mustFail(
  'uppercase email (must be stored lowercase)',
  'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
  [randomUUID(), 'PROBE-CAPS@example.test', 'x'],
);
await mustFail(
  'unknown status',
  'INSERT INTO users (id, email, password_hash, status) VALUES ($1, $2, $3, $4)',
  [randomUUID(), 'probe-x@example.test', 'x', 'banana'],
);

console.log('\n--- roles ---');
await mustFail(
  'granting yourself a role',
  `INSERT INTO user_roles (user_id, role, granted_by) VALUES ($1, 'program_admin', $1)`,
  [alice],
);
await mustPass(
  'someone else granting the role',
  `INSERT INTO user_roles (user_id, role, granted_by) VALUES ($1, 'program_admin', $2)`,
  [alice, bob],
);

console.log('\n--- hours ---');
await mustFail(
  'verifying your own hours',
  `INSERT INTO hour_entries (id, user_id, worked_on, minutes, status, verified_by, verified_at)
   VALUES ($1, $2, CURRENT_DATE, 60, 'verified', $2, now())`,
  [randomUUID(), alice],
);
await mustFail(
  'verified without saying who or when',
  `INSERT INTO hour_entries (id, user_id, worked_on, minutes, status)
   VALUES ($1, $2, CURRENT_DATE, 60, 'verified')`,
  [randomUUID(), alice],
);
await mustFail(
  'rejected without a reason',
  `INSERT INTO hour_entries (id, user_id, worked_on, minutes, status, verified_by, verified_at)
   VALUES ($1, $2, CURRENT_DATE, 60, 'rejected', $3, now())`,
  [randomUUID(), alice, bob],
);
await mustFail(
  'negative hours that are not a correction',
  `INSERT INTO hour_entries (id, user_id, worked_on, minutes) VALUES ($1, $2, CURRENT_DATE, -60)`,
  [randomUUID(), alice],
);
await mustFail(
  'a 30-hour day',
  `INSERT INTO hour_entries (id, user_id, worked_on, minutes) VALUES ($1, $2, CURRENT_DATE, 1800)`,
  [randomUUID(), alice],
);
await mustFail(
  'hours logged next week',
  `INSERT INTO hour_entries (id, user_id, worked_on, minutes)
   VALUES ($1, $2, CURRENT_DATE + 7, 60)`,
  [randomUUID(), alice],
);
await mustPass(
  'an ordinary entry',
  `INSERT INTO hour_entries (id, user_id, worked_on, minutes) VALUES ($1, $2, CURRENT_DATE, 90)`,
  [randomUUID(), alice],
);

console.log('\n--- applications ---');
const app1 = randomUUID();
await mustPass(
  'first open application',
  `INSERT INTO volunteer_applications (id, user_id, status, submitted_at)
   VALUES ($1, $2, 'submitted', now())`,
  [app1, alice],
);
await mustFail(
  'a second open application for the same person',
  `INSERT INTO volunteer_applications (id, user_id, status, submitted_at)
   VALUES ($1, $2, 'submitted', now())`,
  [randomUUID(), alice],
);
await mustFail(
  'accepting without recording who decided',
  `UPDATE volunteer_applications SET status = 'accepted' WHERE id = $1`,
  [app1],
);
await mustPass(
  'accepting properly',
  `UPDATE volunteer_applications SET status = 'accepted', decided_by = $1, decided_at = now() WHERE id = $2`,
  [bob, app1],
);

console.log('\n--- stages and consent ---');
await mustFail(
  'awarding yourself a stage',
  `INSERT INTO stage_progress (user_id, stage, awarded_by) VALUES ($1, 2, $1)`,
  [alice],
);
await mustFail(
  'stage 9 of 6',
  `INSERT INTO stage_progress (user_id, stage) VALUES ($1, 9)`,
  [alice],
);
await mustPass('stage 1', `INSERT INTO stage_progress (user_id, stage) VALUES ($1, 1)`, [alice]);
await mustFail(
  'reaching stage 1 twice',
  `INSERT INTO stage_progress (user_id, stage) VALUES ($1, 1)`,
  [alice],
);
await mustFail(
  'a consent scope we do not recognise',
  `INSERT INTO guardian_consents (id, minor_user_id, guardian_name, guardian_relation, guardian_phone, consent_scope)
   VALUES ($1, $2, 'G', 'parent', '123', ARRAY['selling-data'])`,
  [randomUUID(), alice],
);

console.log('\n--- certificates ---');
const snap = JSON.stringify({ fullName: 'Alice Probe', titleAr: 'x', titleEn: 'x' });
await mustPass(
  'a course certificate',
  `INSERT INTO certificates (id, code, user_id, kind, course_slug, snapshot)
   VALUES ($1, 'TKF-AAAA-BBBB', $2, 'course', 'teamwork', $3)`,
  [randomUUID(), alice, snap],
);
await mustFail(
  'the same course certificate twice',
  `INSERT INTO certificates (id, code, user_id, kind, course_slug, snapshot)
   VALUES ($1, 'TKF-CCCC-DDDD', $2, 'course', 'teamwork', $3)`,
  [randomUUID(), alice, snap],
);
await mustFail(
  'a duplicate certificate code',
  `INSERT INTO certificates (id, code, user_id, kind, hours_at_issue, snapshot)
   VALUES ($1, 'TKF-AAAA-BBBB', $2, 'hours', 100, $3)`,
  [randomUUID(), bob, snap],
);
await mustFail(
  'a course certificate with no course',
  `INSERT INTO certificates (id, code, user_id, kind, snapshot)
   VALUES ($1, 'TKF-EEEE-FFFF', $2, 'course', $3)`,
  [randomUUID(), bob, snap],
);

console.log('\n--- the verified_minutes view ---');
await client.query(
  `INSERT INTO hour_entries (id, user_id, worked_on, minutes, status, verified_by, verified_at)
   VALUES ($1, $2, CURRENT_DATE, 120, 'verified', $3, now())`,
  [randomUUID(), bob, alice],
);
const before = await client.query<{ minutes: string }>(
  'SELECT minutes FROM verified_minutes WHERE user_id = $1',
  [bob],
);
const correction = randomUUID();
const original = (
  await client.query<{ id: string }>(
    `SELECT id FROM hour_entries WHERE user_id = $1 AND status = 'verified' LIMIT 1`,
    [bob],
  )
).rows[0].id;
await client.query(
  `INSERT INTO hour_entries (id, user_id, worked_on, minutes, status, verified_by, verified_at, corrects_id)
   VALUES ($1, $2, CURRENT_DATE, -30, 'verified', $3, now(), $4)`,
  [correction, bob, alice, original],
);
const after = await client.query<{ minutes: string }>(
  'SELECT minutes FROM verified_minutes WHERE user_id = $1',
  [bob],
);
const ok = before.rows[0].minutes === '120' && after.rows[0].minutes === '90';
console.log(`  ${ok ? 'ok       ' : 'BROKEN   '} 120 min, then a -30 correction -> ${after.rows[0].minutes} min`);
if (ok) confirmed += 1; else holes += 1;

await client.query('ROLLBACK');
await client.end();

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
console.log('Everything ran inside a transaction that was rolled back; the database is unchanged.');
process.exit(holes === 0 ? 0 : 1);
