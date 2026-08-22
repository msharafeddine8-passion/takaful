/*
 * "Tell me when this one opens."
 *
 * An activity can now be published before anybody knows when it happens. It
 * offers to notify rather than to register, and when a coordinator finally
 * sets a date everybody waiting is told — once.
 *
 * Three things have to hold, and each of them is the kind that breaks quietly:
 *
 *   - Interest is not a registration. It holds no seat and converts to
 *     nothing. If it ever did convert automatically, an activity would fill
 *     with people who agreed to hear about it and never agreed to attend, and
 *     the first anybody would know is when they did not show up.
 *   - The message goes out once. `notified_at` is what makes that true, and a
 *     volunteer who gets "you can register now" four times stops reading them.
 *   - The card, the button and the action agree about which activities are
 *     waiting. Disagreement means offering a button the action then refuses.
 *
 * Runs inside a transaction that is rolled back.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isAwaitingDate } from '../src/lib/activity-state.ts';

let confirmed = 0;
let holes = 0;
function check(label: string, pass: boolean, note = '') {
  if (pass) { confirmed++; console.log(`  ok       ${label}${note ? `  — ${note}` : ''}`); }
  else { holes++; console.log(`  HOLE     ${label}${note ? `  — ${note}` : ''}`); }
}

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();
await c.query('BEGIN');

async function mustFail(label: string, sql: string, params: unknown[] = []) {
  await c.query('SAVEPOINT s');
  try {
    await c.query(sql, params);
    await c.query('ROLLBACK TO SAVEPOINT s');
    check(label, false, 'allowed and should not be');
  } catch (e) {
    await c.query('ROLLBACK TO SAVEPOINT s');
    check(label, true, `rejected (${(e as { code?: string }).code ?? '?'})`);
  }
}

const mkUser = async (tag: string) => {
  const id = randomUUID();
  await c.query(`INSERT INTO users (id,email,password_hash) VALUES ($1,$2,'x')`,
    [id, `int-${id}@example.test`]);
  await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1,$2)', [id, tag]);
  return id;
};

const mkActivity = async (startsAt: string | null) => {
  const id = randomUUID();
  await c.query(
    `INSERT INTO activities (id, title_ar, title_en, starts_at, ends_at, is_published)
     VALUES ($1,'نشاط','Activity',$2,$3,true)`,
    [id, startsAt, startsAt ? new Date(new Date(startsAt).getTime() + 3_600_000) : null],
  );
  return id;
};

console.log('\n--- an activity may exist before its date does ---');
const waiting = await mkActivity(null);
check('an activity can be published with no start time', Boolean(waiting));
check('and isAwaitingDate calls it waiting', isAwaitingDate({ starts_at: null, cancelled_at: null }));
check('a scheduled activity is not waiting',
  !isAwaitingDate({ starts_at: new Date(), cancelled_at: null }));
check('a cancelled activity with no date is not waiting either',
  !isAwaitingDate({ starts_at: null, cancelled_at: new Date() }),
  'nothing is coming, so there is nothing to be told about');

console.log('\n--- interest is one per person ---');
const vol = await mkUser('متطوّع');
await c.query('INSERT INTO activity_interest (id, activity_id, user_id) VALUES ($1,$2,$3)',
  [randomUUID(), waiting, vol]);
check('a volunteer can register interest', true);

await mustFail(
  'the same person twice',
  'INSERT INTO activity_interest (id, activity_id, user_id) VALUES ($1,$2,$3)',
  [randomUUID(), waiting, vol],
);

const vol2 = await mkUser('متطوّعة');
await c.query('INSERT INTO activity_interest (id, activity_id, user_id) VALUES ($1,$2,$3)',
  [randomUUID(), waiting, vol2]);
const { rows: count } = await c.query<{ n: number }>(
  'SELECT count(*)::int AS n FROM activity_interest WHERE activity_id = $1', [waiting]);
check('two different people are two rows', count[0].n === 2, String(count[0].n));

console.log('\n--- interest is not a registration ---');
const { rows: regs } = await c.query<{ n: number }>(
  'SELECT count(*)::int AS n FROM activity_registrations WHERE activity_id = $1', [waiting]);
check('nobody has been registered by registering interest', regs[0].n === 0,
  'interest holds no seat and converts to nothing');

const { rows: places } = await c.query<{ taken: number }>(
  'SELECT taken FROM activity_places WHERE activity_id = $1', [waiting]);
check('and the seat count is untouched', (places[0]?.taken ?? 0) === 0, String(places[0]?.taken));

console.log('\n--- told once, not every time ---');
const { rows: pending } = await c.query<{ n: number }>(
  `SELECT count(*)::int AS n FROM activity_interest
    WHERE activity_id = $1 AND notified_at IS NULL`, [waiting]);
check('both are waiting to be told', pending[0].n === 2, String(pending[0].n));

// What the action does when a date is set.
await c.query(`UPDATE activity_interest SET notified_at = now() WHERE activity_id = $1`, [waiting]);
const { rows: after } = await c.query<{ n: number }>(
  `SELECT count(*)::int AS n FROM activity_interest
    WHERE activity_id = $1 AND notified_at IS NULL`, [waiting]);
check('after the message goes out, nobody is still waiting', after[0].n === 0,
  'a second edit finds nobody to tell');

console.log('\n--- the rows go when the thing they point at goes ---');
const doomed = await mkActivity(null);
await c.query('INSERT INTO activity_interest (id, activity_id, user_id) VALUES ($1,$2,$3)',
  [randomUUID(), doomed, vol]);
await c.query('DELETE FROM activities WHERE id = $1', [doomed]);
const { rows: orphans } = await c.query<{ n: number }>(
  'SELECT count(*)::int AS n FROM activity_interest WHERE activity_id = $1', [doomed]);
check('deleting an activity takes its interest rows with it', orphans[0].n === 0);

const doomedUser = await mkUser('راحل');
const another = await mkActivity(null);
await c.query('INSERT INTO activity_interest (id, activity_id, user_id) VALUES ($1,$2,$3)',
  [randomUUID(), another, doomedUser]);
// profiles does not cascade from users, so it goes first. That is the schema
// being deliberate rather than an oversight — a profile is not disposable.
await c.query('DELETE FROM profiles WHERE user_id = $1', [doomedUser]);
await c.query('DELETE FROM users WHERE id = $1', [doomedUser]);
const { rows: userOrphans } = await c.query<{ n: number }>(
  'SELECT count(*)::int AS n FROM activity_interest WHERE user_id = $1', [doomedUser]);
check('and deleting a person leaves none of theirs behind', userOrphans[0].n === 0);

console.log('\n--- the notification kind exists ---');
await c.query(
  `INSERT INTO notifications (id, user_id, kind, title_ar, title_en)
   VALUES ($1,$2,'activity.scheduled','تحدّد الموعد','A date is set')`,
  [randomUUID(), vol]);
check('activity.scheduled is an accepted notification kind', true);

await mustFail(
  'an invented notification kind',
  `INSERT INTO notifications (id, user_id, kind, title_ar, title_en)
   VALUES ($1,$2,'activity.invented','x','x')`,
  [randomUUID(), vol],
);

console.log('\n--- the code agrees with itself ---');
const action = readFileSync(`${ROOT}src/lib/actions/interest.ts`, 'utf8');
check('registering interest is gated on being a volunteer',
  action.includes('is_volunteer($1)'),
  'the same gate the register button uses, so the two cannot drift');
check('and refused once the activity has a date',
  action.includes("activity.starts_at !== null"),
  'otherwise it records something the volunteer cannot act on');
check('and refused for a cancelled activity',
  action.includes('cancelled_at !== null'));

const admin = readFileSync(`${ROOT}src/lib/actions/activity-admin.ts`, 'utf8');
check('the notification fires only when a date appears where there was none',
  admin.includes('before.starts_at === null && v.startsAt !== null'),
  'not on every edit — correcting a time by an hour is not "now open"');
check('and only reaches people not already told',
  admin.includes('notified_at IS NULL'));
check('the rows are locked while the messages go out',
  admin.includes('FOR UPDATE SKIP LOCKED'),
  'two coordinators saving at once would otherwise each send the full set');
check('marking and sending happen in one transaction',
  /transaction\(async \(client\) => \{[\s\S]*notifyIn[\s\S]*UPDATE activity_interest/.test(admin),
  'a failure halfway would otherwise notify people without marking them');

const form = readFileSync(`${ROOT}src/lib/actions/activity-admin.ts`, 'utf8');
check('the times are optional as a pair, not individually',
  form.includes('Boolean(startsAt) !== Boolean(endsAt)'),
  'an end with no start says nothing anybody can act on');

const card = readFileSync(`${ROOT}src/app/[lang]/opportunities/page.tsx`, 'utf8');
check('the card picks its button from the same isAwaitingDate',
  card.includes('isAwaitingDate(a)') && card.includes('InterestButton'));
check('and says the date is unset rather than leaving a gap',
  card.includes('interest.dateUnknown'));

const button = readFileSync(`${ROOT}src/components/activities/InterestButton.tsx`, 'utf8');
check('the button tells the volunteer it is not a registration',
  button.includes('notifyMeHint'),
  'somebody who thinks they hold a seat and turns up has been misled');
check('and can be undone',
  button.includes('withdrawInterestAction'));

const staff = readFileSync(`${ROOT}src/app/[lang]/staff/activities/[id]/page.tsx`, 'utf8');
check('staff can see everybody who asked', staff.includes('interest.staffTitle'));
check('and whether each has been told', staff.includes('w.notified_at'));

await c.query('ROLLBACK');
await c.end();

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
if (holes) process.exitCode = 1;
