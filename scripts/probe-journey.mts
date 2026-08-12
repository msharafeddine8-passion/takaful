/**
 * Tries to break the journey engine's rules. Each case SHOULD fail; one that
 * succeeds is a hole. Runs in a transaction that is rolled back.
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

async function mustFail(name: string, sql: string, params: unknown[] = []) {
  await client.query('SAVEPOINT s');
  try {
    await client.query(sql, params);
    await client.query('ROLLBACK TO SAVEPOINT s');
    console.log(`  HOLE      ${name}  <-- allowed and should not be`);
    holes += 1;
  } catch (e) {
    await client.query('ROLLBACK TO SAVEPOINT s');
    console.log(`  rejected  ${name}  (${(e as { code?: string }).code ?? '?'})`);
    confirmed += 1;
  }
}

async function mustPass(name: string, sql: string, params: unknown[] = []) {
  await client.query('SAVEPOINT s');
  try {
    await client.query(sql, params);
    await client.query('RELEASE SAVEPOINT s');
    console.log(`  ok        ${name}`);
    confirmed += 1;
  } catch (e) {
    await client.query('ROLLBACK TO SAVEPOINT s');
    console.log(`  BROKEN    ${name}  <-- ${(e as Error).message}`);
    holes += 1;
  }
}

const version = (await client.query<{ id: string }>(
  'SELECT id FROM journey_versions WHERE is_default LIMIT 1',
)).rows[0].id;
const stage1 = (await client.query<{ id: string }>(
  'SELECT id FROM journey_stages WHERE version_id = $1 AND number = 1',
  [version],
)).rows[0].id;

const alice = randomUUID();
const bob = randomUUID();
for (const [id, email, name] of [
  [alice, 'jprobe-a@example.test', 'Alice'],
  [bob, 'jprobe-b@example.test', 'Bob'],
] as const) {
  await client.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [id, email, 'x']);
  await client.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [id, name]);
}

console.log('\n--- journey versions ---');
await mustFail(
  'a second default version',
  `INSERT INTO journey_versions (id, name, is_default) VALUES ($1, 'Other', true)`,
  [randomUUID()],
);
await mustPass(
  'a non-default version',
  `INSERT INTO journey_versions (id, name, is_default) VALUES ($1, 'Journey 2027', false)`,
  [randomUUID()],
);
await mustFail(
  'a duplicate version name',
  `INSERT INTO journey_versions (id, name) VALUES ($1, 'Journey 2026')`,
  [randomUUID()],
);

console.log('\n--- stages ---');
await mustFail(
  'two stage 1s in one version',
  `INSERT INTO journey_stages (id, version_id, number, title_ar, title_en)
   VALUES ($1, $2, 1, 'x', 'x')`,
  [randomUUID(), version],
);
await mustFail(
  'stage 0',
  `INSERT INTO journey_stages (id, version_id, number, title_ar, title_en)
   VALUES ($1, $2, 0, 'x', 'x')`,
  [randomUUID(), version],
);

console.log('\n--- requirement configuration ---');
await mustFail(
  'an hours requirement with no number',
  `INSERT INTO stage_requirements (id, stage_id, kind, label_ar, label_en, config)
   VALUES ($1, $2, 'hours', 'x', 'x', '{}')`,
  [randomUUID(), stage1],
);
await mustFail(
  'an hours requirement of zero minutes',
  `INSERT INTO stage_requirements (id, stage_id, kind, label_ar, label_en, config)
   VALUES ($1, $2, 'hours', 'x', 'x', '{"minutes":"0"}')`,
  [randomUUID(), stage1],
);
await mustFail(
  'an hours requirement with a non-numeric value',
  `INSERT INTO stage_requirements (id, stage_id, kind, label_ar, label_en, config)
   VALUES ($1, $2, 'hours', 'x', 'x', '{"minutes":"lots"}')`,
  [randomUUID(), stage1],
);
await mustFail(
  'a course requirement with no course',
  `INSERT INTO stage_requirements (id, stage_id, kind, label_ar, label_en, config)
   VALUES ($1, $2, 'course', 'x', 'x', '{}')`,
  [randomUUID(), stage1],
);
await mustFail(
  'a requirement kind we do not recognise',
  `INSERT INTO stage_requirements (id, stage_id, kind, label_ar, label_en, config)
   VALUES ($1, $2, 'vibes', 'x', 'x', '{}')`,
  [randomUUID(), stage1],
);

const hoursReq = randomUUID();
await mustPass(
  'a valid hours requirement (600 minutes)',
  `INSERT INTO stage_requirements (id, stage_id, kind, label_ar, label_en, config)
   VALUES ($1, $2, 'hours', 'ساعات', 'Hours', '{"minutes":"600"}')`,
  [hoursReq, stage1],
);
await mustPass(
  'a valid course requirement',
  `INSERT INTO stage_requirements (id, stage_id, kind, label_ar, label_en, config)
   VALUES ($1, $2, 'course', 'دورة', 'Course', '{"courseSlug":"teamwork"}')`,
  [randomUUID(), stage1],
);

console.log('\n--- journey assignment ---');
await mustFail(
  'moving someone between versions with no reason',
  `INSERT INTO user_journey_assignments (user_id, version_id, assigned_by)
   VALUES ($1, $2, $3)`,
  [alice, version, bob],
);
await mustPass(
  'moving someone with a reason',
  `INSERT INTO user_journey_assignments (user_id, version_id, assigned_by, reason)
   VALUES ($1, $2, $3, 'Previous certified experience accepted.')`,
  [alice, version, bob],
);

console.log('\n--- requirement progress ---');
await mustFail(
  'confirming your own requirement',
  `INSERT INTO stage_requirement_progress (user_id, requirement_id, confirmed_by)
   VALUES ($1, $2, $1)`,
  [alice, hoursReq],
);
await mustPass(
  'someone else confirming it',
  `INSERT INTO stage_requirement_progress (user_id, requirement_id, confirmed_by)
   VALUES ($1, $2, $3)`,
  [alice, hoursReq, bob],
);
await mustFail(
  'satisfying the same requirement twice',
  `INSERT INTO stage_requirement_progress (user_id, requirement_id) VALUES ($1, $2)`,
  [alice, hoursReq],
);

console.log('\n--- hour allocation (decision 1) ---');
const entry = randomUUID();
await client.query(
  `INSERT INTO hour_entries (id, user_id, worked_on, minutes, status, verified_by, verified_at)
   VALUES ($1, $2, CURRENT_DATE, 120, 'verified', $3, now())`,
  [entry, bob, alice],
);
await mustPass(
  'allocating an hour to a requirement',
  `INSERT INTO hour_allocations (hour_entry_id, requirement_id, user_id, minutes)
   VALUES ($1, $2, $3, 120)`,
  [entry, hoursReq, bob],
);
await mustFail(
  'allocating the SAME hour to a second requirement',
  `INSERT INTO hour_allocations (hour_entry_id, requirement_id, user_id, minutes)
   VALUES ($1, $2, $3, 120)`,
  [entry, hoursReq, bob],
);
await mustFail(
  'a zero-minute allocation',
  `INSERT INTO hour_allocations (hour_entry_id, requirement_id, user_id, minutes)
   VALUES ($1, $2, $3, 0)`,
  [randomUUID(), hoursReq, bob],
);

const alloc = await client.query<{ minutes: string }>(
  'SELECT minutes FROM allocated_minutes WHERE user_id = $1 AND requirement_id = $2',
  [bob, hoursReq],
);
const viewOk = alloc.rows[0]?.minutes === '120';
console.log(`  ${viewOk ? 'ok       ' : 'BROKEN   '} allocated_minutes view reports 120`);
viewOk ? (confirmed += 1) : (holes += 1);

console.log('\n--- seed ---');
const stages = await client.query<{ n: string }>(
  'SELECT count(*) AS n FROM journey_stages WHERE version_id = $1',
  [version],
);
const seeded = stages.rows[0].n === '6';
console.log(`  ${seeded ? 'ok       ' : 'BROKEN   '} default version has 6 stages`);
seeded ? (confirmed += 1) : (holes += 1);

/*
 * This used to assert that every user was on a journey. Migration 006 changed
 * that deliberately: a journey is assigned when someone is accepted as a
 * volunteer, not when they register. Somebody taking a course without joining
 * the association has no volunteer journey, and that is the normal state
 * rather than a gap. The assertion now checks the rule that replaced it, in
 * both directions.
 */
// The probe's own Alice and Bob are excluded: it assigned them journeys a few
// lines up to test the assignment rules, and they were never accepted as
// volunteers. Counting them here would be the probe reading its own fixtures.
const wrongWay = await client.query<{ missing: string; extra: string }>(`
  SELECT
    (SELECT count(*) FROM users u
      WHERE is_volunteer(u.id)
        AND u.email NOT LIKE 'jprobe-%'
        AND NOT EXISTS (SELECT 1 FROM current_journey_assignment a WHERE a.user_id = u.id))::TEXT
      AS missing,
    (SELECT count(*) FROM current_journey_assignment a
      JOIN users u ON u.id = a.user_id
     WHERE NOT is_volunteer(a.user_id) AND u.email NOT LIKE 'jprobe-%')::TEXT AS extra
`);
const { missing, extra } = wrongWay.rows[0];

const volunteersAssigned = missing === '0';
console.log(
  `  ${volunteersAssigned ? 'ok       ' : 'BROKEN   '} every accepted volunteer is on a journey` +
    (volunteersAssigned ? '' : `  — ${missing} without one`),
);
volunteersAssigned ? (confirmed += 1) : (holes += 1);

const learnersFree = extra === '0';
console.log(
  `  ${learnersFree ? 'ok       ' : 'BROKEN   '} and nobody else is — a learner has no volunteer journey` +
    (learnersFree ? '' : `  — ${extra} who should not have one`),
);
learnersFree ? (confirmed += 1) : (holes += 1);

await client.query('ROLLBACK');
await client.end();

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
console.log('Rolled back; the database is unchanged.');
process.exit(holes === 0 ? 0 : 1);

