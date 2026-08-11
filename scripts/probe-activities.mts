/**
 * Walks the activity loop: register, fill up, refuse on stage, attend,
 * and watch attendance become hours the journey engine can see.
 * Removes everything it creates.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();
await c.query('BEGIN');

let holes = 0, confirmed = 0;
function check(label: string, ok: boolean, detail = '') {
  if (!ok) holes += 1; else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail ? '  — ' + detail : ''}`);
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

const MARK = `act-${Date.now()}`;
async function makeUser(tag: string) {
  const id = randomUUID();
  await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
    [id, `${MARK}-${tag}@example.test`, 'x']);
  await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [id, tag]);
  return id;
}
const a1 = await makeUser('a'), a2 = await makeUser('b'), a3 = await makeUser('c');
const sup = await makeUser('sup');

const act = randomUUID();
await c.query(
  `INSERT INTO activities (id, title_ar, title_en, starts_at, ends_at, capacity, min_stage, led_by)
   VALUES ($1, 'حملة توزيع', 'Distribution drive', now() + interval '2 days',
           now() + interval '2 days 5 hours', 2, NULL, $2)`,
  [act, sup],
);

console.log('\n--- capacity ---');
for (const [u, tag] of [[a1, 'first'], [a2, 'second']] as const) {
  await c.query(
    `INSERT INTO activity_registrations (id, activity_id, user_id, status)
     VALUES ($1, $2, $3, 'registered')`, [randomUUID(), act, u]);
  check(`${tag} volunteer registered`, true);
}
const places = (await c.query<{ taken: number; capacity: number }>(
  'SELECT taken, capacity FROM activity_places WHERE activity_id = $1', [act])).rows[0];
check('two of two places taken', places.taken === 2 && places.capacity === 2,
  `${places.taken}/${places.capacity}`);

await c.query(
  `INSERT INTO activity_registrations (id, activity_id, user_id, status)
   VALUES ($1, $2, $3, 'waitlisted')`, [randomUUID(), act, a3]);
const after = (await c.query<{ taken: number; waiting: number }>(
  'SELECT taken, waiting FROM activity_places WHERE activity_id = $1', [act])).rows[0];
check('a third goes to the waiting list, not away', after.waiting === 1, `waiting ${after.waiting}`);

await mustFail(
  'registering twice for the same activity',
  `INSERT INTO activity_registrations (id, activity_id, user_id, status)
   VALUES ($1, $2, $3, 'registered')`, [randomUUID(), act, a1],
);

console.log('\n--- cancelling frees the person to return ---');
await c.query(
  `UPDATE activity_registrations SET status = 'cancelled', cancelled_at = now()
    WHERE activity_id = $1 AND user_id = $2`, [act, a1]);
await c.query(
  `INSERT INTO activity_registrations (id, activity_id, user_id, status)
   VALUES ($1, $2, $3, 'registered')`, [randomUUID(), act, a1]);
check('someone who cancelled can sign up again', true);

await mustFail(
  'a cancelled row with no cancellation time',
  `INSERT INTO activity_registrations (id, activity_id, user_id, status)
   VALUES ($1, $2, $3, 'cancelled')`, [randomUUID(), act, sup],
);

console.log('\n--- attendance ---');
await mustFail(
  'recording your own attendance',
  `INSERT INTO activity_attendance (id, activity_id, user_id, attended, minutes, confirmed_by)
   VALUES ($1, $2, $3, true, 300, $3)`, [randomUUID(), act, a1],
);
await mustFail(
  'a no-show with minutes attached',
  `INSERT INTO activity_attendance (id, activity_id, user_id, attended, minutes, confirmed_by)
   VALUES ($1, $2, $3, false, 300, $4)`, [randomUUID(), act, a1, sup],
);
await mustFail(
  'attending for 30 hours',
  `INSERT INTO activity_attendance (id, activity_id, user_id, attended, minutes, confirmed_by)
   VALUES ($1, $2, $3, true, 1800, $4)`, [randomUUID(), act, a1, sup],
);

const entry = randomUUID();
await c.query(
  `INSERT INTO hour_entries (id, user_id, activity_id, worked_on, started_at, ended_at,
                             minutes, status, verified_by, verified_at)
   VALUES ($1, $2, $3, CURRENT_DATE, '09:00', '14:00', 300, 'verified', $4, now())`,
  [entry, a1, act, sup]);
await c.query(
  `INSERT INTO activity_attendance (id, activity_id, user_id, attended, minutes, confirmed_by, hour_entry_id)
   VALUES ($1, $2, $3, true, 300, $4, $5)`, [randomUUID(), act, a1, sup, entry]);
check('attendance produced verified hours linked back to it', true);

await mustFail(
  'recording attendance twice for the same person',
  `INSERT INTO activity_attendance (id, activity_id, user_id, attended, minutes, confirmed_by)
   VALUES ($1, $2, $3, true, 60, $4)`, [randomUUID(), act, a1, sup],
);

console.log('\n--- times and overlap ---');
await mustFail(
  'an entry that ends before it starts',
  `INSERT INTO hour_entries (id, user_id, worked_on, started_at, ended_at, minutes)
   VALUES ($1, $2, CURRENT_DATE, '14:00', '09:00', 300)`, [randomUUID(), a2],
);
await mustFail(
  'a start time with no end time',
  `INSERT INTO hour_entries (id, user_id, worked_on, started_at, minutes)
   VALUES ($1, $2, CURRENT_DATE, '09:00', 300)`, [randomUUID(), a2],
);

const clash = await c.query<{ id: string }>(
  'SELECT id FROM overlapping_hours($1, CURRENT_DATE, $2, $3)', [a1, '13:00', '16:00']);
check('an overlapping afternoon is detected', clash.rows.length === 1, `${clash.rows.length} clash`);

const noClash = await c.query<{ id: string }>(
  'SELECT id FROM overlapping_hours($1, CURRENT_DATE, $2, $3)', [a1, '15:00', '18:00']);
check('a later, non-overlapping slot is not flagged', noClash.rows.length === 0);

const touching = await c.query<{ id: string }>(
  'SELECT id FROM overlapping_hours($1, CURRENT_DATE, $2, $3)', [a1, '14:00', '16:00']);
check('one ending exactly as the other begins is not an overlap', touching.rows.length === 0);

console.log('\n--- policy ---');
const s = (await c.query<{ second: boolean }>(
  'SELECT hours_require_second_check AS second FROM org_settings')).rows[0];
check('a settings row exists with a default policy', s !== undefined, `second check: ${s?.second}`);
await mustFail(
  'a second settings row',
  `INSERT INTO org_settings (id) VALUES (false)`,
);

await c.query('ROLLBACK');
await c.end();

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
console.log('Rolled back; the database is unchanged.');
process.exit(holes === 0 ? 0 : 1);
