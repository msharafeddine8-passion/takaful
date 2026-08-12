/**
 * Probes migration 006: the learner/volunteer split, and the four defects
 * found reviewing 003-005. Rolled back; the database is unchanged.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();
await c.query('BEGIN');

let holes = 0;
let confirmed = 0;

function note(ok: boolean, label: string, detail = '') {
  if (!ok) holes += 1; else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail ? '  ' + detail : ''}`);
}

async function mustFail(name: string, sql: string, params: unknown[] = []) {
  await c.query('SAVEPOINT s');
  try {
    await c.query(sql, params);
    await c.query('ROLLBACK TO SAVEPOINT s');
    console.log(`  HOLE     ${name}  <-- allowed and should not be`);
    holes += 1;
  } catch (e) {
    await c.query('ROLLBACK TO SAVEPOINT s');
    console.log(`  rejected ${name}  (${(e as { code?: string }).code ?? '?'})`);
    confirmed += 1;
  }
}

const version = (await c.query<{ id: string }>(
  'SELECT id FROM journey_versions WHERE is_default LIMIT 1')).rows[0].id;
const stage1 = (await c.query<{ id: string }>(
  'SELECT id FROM journey_stages WHERE version_id = $1 AND number = 1', [version])).rows[0].id;

async function makeUser(email: string, name: string): Promise<string> {
  const id = randomUUID();
  await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [id, email, 'x']);
  await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [id, name]);
  await c.query(
    `INSERT INTO membership_status_history (user_id, previous_status, new_status)
     VALUES ($1, NULL, 'registered_user')`, [id]);
  return id;
}

const learner = await makeUser('p6-learner@example.test', 'Learner');
const vol = await makeUser('p6-volunteer@example.test', 'Volunteer');
const staff = await makeUser('p6-staff@example.test', 'Staff');

console.log('\n--- A: a learner is not a volunteer ---');
note(
  (await c.query<{ v: boolean }>('SELECT is_volunteer($1) AS v', [learner])).rows[0].v === false,
  'someone who only registered is not a volunteer',
);
note(
  (await c.query<{ n: string }>(
    'SELECT count(*) AS n FROM user_journey_assignments WHERE user_id = $1', [learner],
  )).rows[0].n === '0',
  'a learner is given NO journey on registration',
);

console.log('\n--- A: acceptance starts the journey ---');
await c.query(
  `INSERT INTO membership_status_history (user_id, previous_status, new_status, changed_by, actor_role, reason)
   VALUES ($1, 'volunteer_applicant', 'accepted_volunteer', $2, 'applications.review', 'Accepted.')`,
  [vol, staff],
);
note(
  (await c.query<{ v: boolean }>('SELECT is_volunteer($1) AS v', [vol])).rows[0].v === true,
  'an accepted applicant is a volunteer',
);
const assigned = await c.query<{ n: string }>(
  'SELECT count(*) AS n FROM user_journey_assignments WHERE user_id = $1', [vol]);
note(assigned.rows[0].n === '1', 'acceptance assigns exactly one journey', `${assigned.rows[0].n}`);

// Re-accepting must not hand out a second journey.
await c.query(
  `INSERT INTO membership_status_history (user_id, previous_status, new_status, changed_by, actor_role, reason)
   VALUES ($1, 'inactive_volunteer', 'accepted_volunteer', $2, 'applications.review', 'Returned.')`,
  [vol, staff],
);
note(
  (await c.query<{ n: string }>(
    'SELECT count(*) AS n FROM user_journey_assignments WHERE user_id = $1', [vol])).rows[0].n === '1',
  'a second acceptance does not create a second journey',
);

console.log('\n--- B1: allocation cannot point at the wrong person ---');
const req = randomUUID();
await c.query(
  `INSERT INTO stage_requirements (id, stage_id, kind, label_ar, label_en, config)
   VALUES ($1, $2, 'hours', 'ساعات', 'Hours', '{"minutes":"600"}')`, [req, stage1]);

const entry = randomUUID();
await c.query(
  `INSERT INTO hour_entries (id, user_id, worked_on, minutes, status, verified_by, verified_at)
   VALUES ($1, $2, CURRENT_DATE, 120, 'verified', $3, now())`, [entry, vol, staff]);

await mustFail(
  'allocating one person\'s hour under another person\'s id',
  `INSERT INTO hour_allocations (hour_entry_id, requirement_id, user_id, minutes)
   VALUES ($1, $2, $3, 120)`,
  [entry, req, learner],
);
await c.query(
  `INSERT INTO hour_allocations (hour_entry_id, requirement_id, user_id, minutes)
   VALUES ($1, $2, $3, 120)`, [entry, req, vol]);
note(true, 'a correctly-matched allocation is accepted');

console.log('\n--- B2: correcting an entry releases its allocation ---');
const before = (await c.query<{ minutes: string }>(
  'SELECT minutes FROM allocated_minutes WHERE user_id = $1 AND requirement_id = $2',
  [vol, req])).rows[0]?.minutes;
await c.query(`UPDATE hour_entries SET status = 'corrected' WHERE id = $1`, [entry]);
const after = (await c.query<{ minutes: string }>(
  'SELECT minutes FROM allocated_minutes WHERE user_id = $1 AND requirement_id = $2',
  [vol, req])).rows[0]?.minutes;
note(before === '120' && after === undefined, 'corrected hours stop counting toward the stage',
  `${before ?? '0'} -> ${after ?? '0'}`);

console.log('\n--- B3: only verified hours may be allocated ---');
const pending = randomUUID();
await c.query(
  `INSERT INTO hour_entries (id, user_id, worked_on, minutes) VALUES ($1, $2, CURRENT_DATE, 60)`,
  [pending, vol]);
await mustFail(
  'allocating hours that are still pending',
  `INSERT INTO hour_allocations (hour_entry_id, requirement_id, user_id, minutes)
   VALUES ($1, $2, $3, 60)`,
  [pending, req, vol],
);

console.log('\n--- B4: a requirement can be retired, not deleted ---');
await c.query(
  `INSERT INTO stage_requirement_progress (user_id, requirement_id) VALUES ($1, $2)`, [vol, req]);
await mustFail(
  'deleting a requirement someone already satisfied',
  'DELETE FROM stage_requirements WHERE id = $1', [req],
);
await c.query('UPDATE stage_requirements SET archived_at = now() WHERE id = $1', [req]);
const active = await c.query<{ n: string }>(
  'SELECT count(*) AS n FROM active_stage_requirements WHERE id = $1', [req]);
const still = await c.query<{ n: string }>(
  'SELECT count(*) AS n FROM stage_requirements WHERE id = $1', [req]);
note(active.rows[0].n === '0' && still.rows[0].n === '1',
  'archiving hides it from the evaluator but keeps it readable');

await c.query('ROLLBACK');
await c.end();

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
console.log('Rolled back; the database is unchanged.');
process.exit(holes === 0 ? 0 : 1);
