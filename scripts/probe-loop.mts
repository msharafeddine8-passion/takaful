/**
 * The whole loop, using the real actions and the real evaluator:
 * activity → registration → attendance → verified hours → stage progress.
 *
 * If this passes, the four systems the brief asked to be connected are
 * actually connected.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import { journeyFor } from '../src/lib/journey.ts';
import { reallocate } from '../src/lib/allocation.ts';
import { roster, opportunities, scheduledMinutes } from '../src/lib/activities.ts';
import { guardedCleanup } from './guarded-cleanup.mts';

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();

let holes = 0, confirmed = 0;
function check(label: string, ok: boolean, detail = '') {
  if (!ok) holes += 1; else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail ? '  — ' + detail : ''}`);
}

const MARK = `loop-${Date.now()}`;
const req = randomUUID();
const act = randomUUID();
let vol = '', sup = '', version = '';

try {
  /*
   * A journey this probe owns, copied from the live one.
   *
   * Writing the requirement onto the default journey - which is what this did
   * - leaves the association's programme carrying a rule nobody decided on,
   * and the assertions below then depend on whatever else previous runs left
   * behind. Isolation makes the result mean something.
   */
  const liveStages = (await c.query<{ number: number; title_ar: string; title_en: string }>(
    `SELECT s.number, s.title_ar, s.title_en FROM journey_stages s
       JOIN journey_versions v ON v.id = s.version_id AND v.is_default
      ORDER BY s.number`)).rows;

  version = randomUUID();
  await c.query(
    `INSERT INTO journey_versions (id, name, description, is_default)
     VALUES ($1, $2, 'Created by probe-loop. Safe to delete.', false)`,
    [version, `probe ${MARK}`]);

  let stage1 = '';
  for (const s of liveStages) {
    const id = randomUUID();
    await c.query(
      `INSERT INTO journey_stages (id, version_id, number, title_ar, title_en)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, version, s.number, s.title_ar, s.title_en]);
    if (s.number === 1) stage1 = id;
  }

  // An admin sets Stage 1 to need 4 hours.
  await c.query(
    `INSERT INTO stage_requirements (id, stage_id, kind, label_ar, label_en, config, sort_order)
     VALUES ($1, $2, 'hours', 'أربع ساعات معتمدة', 'Four verified hours', '{"minutes":"240"}', 1)`,
    [req, stage1]);

  async function makeUser(tag: string) {
    const id = randomUUID();
    await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
      [id, `${MARK}-${tag}@example.test`, 'x']);
    await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [id, tag]);
    await c.query(`INSERT INTO membership_status_history (user_id, new_status) VALUES ($1, 'registered_user')`, [id]);
    return id;
  }
  vol = await makeUser('vol');
  sup = await makeUser('sup');
  await c.query(
    `INSERT INTO membership_status_history (user_id, previous_status, new_status, changed_by, actor_role, reason)
     VALUES ($1, 'volunteer_applicant', 'accepted_volunteer', $2, 'applications.review', 'probe')`,
    [vol, sup]);

  // Acceptance puts them on the default journey; move them onto the probe's.
  await c.query(
    // id is a generated identity, not a uuid, so it is left to the database.
    `INSERT INTO user_journey_assignments (user_id, version_id, assigned_by, reason)
     VALUES ($1, $2, $3, 'probe: moved onto an isolated journey')`,
    [vol, version, sup]);

  console.log('\n--- an activity is published ---');
  await c.query(
    `INSERT INTO activities (id, title_ar, title_en, location, starts_at, ends_at, capacity, min_stage, led_by)
     VALUES ($1, 'حملة توزيع طرود', 'Food parcel drive', 'طرابلس',
             now() + interval '1 day', now() + interval '1 day 5 hours', 25, NULL, $2)`,
    [act, sup]);

  const listed = (await opportunities(vol)).filter((o) => o.id === act);
  check('it appears on the opportunities page', listed.length === 1);
  check('with places shown as 0 of 25', listed[0]?.taken === 0 && listed[0]?.capacity === 25);
  check('and no registration for this viewer yet', listed[0]?.my_status === null);
  const worth = scheduledMinutes(listed[0]);
  check('worth five hours, from its own schedule', worth === 300, `${worth} min`);

  console.log('\n--- the volunteer registers ---');
  await c.query(
    `INSERT INTO activity_registrations (id, activity_id, user_id, status)
     VALUES ($1, $2, $3, 'registered')`, [randomUUID(), act, vol]);
  const after = (await opportunities(vol)).find((o) => o.id === act);
  check('the card now says they are registered', after?.my_status === 'registered');
  check('and one place is taken', after?.taken === 1, `${after?.taken}/25`);

  const sheet = await roster(act);
  check('the supervisor sees them on the roster', sheet.length === 1, sheet[0]?.full_name);
  check('with no attendance recorded yet', sheet[0]?.attended === null);

  console.log('\n--- stage 1 before any hours ---');
  let j = await journeyFor(vol);
  let hours = j?.stages[0].requirements.find((r) => r.id === req);
  check('the hours requirement is visible and unmet', hours?.satisfied === false);
  check('showing 0 of 240 minutes', hours?.progress?.current === 0);

  console.log('\n--- the supervisor confirms attendance ---');
  // What confirmAttendanceAction writes when policy verifies immediately.
  const entry = randomUUID();
  await c.query(
    `INSERT INTO hour_entries
       (id, user_id, activity_id, worked_on, started_at, ended_at, minutes, status, verified_by, verified_at)
     VALUES ($1, $2, $3, CURRENT_DATE, '09:00', '14:00', 300, 'verified', $4, now())`,
    [entry, vol, act, sup]);
  await c.query(
    `INSERT INTO activity_attendance (id, activity_id, user_id, attended, minutes, confirmed_by, hour_entry_id)
     VALUES ($1, $2, $3, true, 300, $4, $5)`, [randomUUID(), act, vol, sup, entry]);
  await reallocate(vol);

  const sheet2 = await roster(act);
  check('the roster shows them as attended', sheet2[0]?.attended === true);
  check('for 300 minutes', sheet2[0]?.attended_minutes === 300);

  console.log('\n--- and the stage moves, without anyone touching it ---');
  j = await journeyFor(vol);
  hours = j?.stages[0].requirements.find((r) => r.id === req);
  check('the requirement is now satisfied', hours?.satisfied === true);
  check('240 of 240 allocated, not 300', hours?.progress?.current === 240,
    `${hours?.progress?.current}/240`);
  check('stage 1 requirements complete',
    j?.stages[0].status === 'requirements_completed', j?.stages[0].status);

  const spare = (await c.query<{ remaining: number }>(
    'SELECT remaining_minutes AS remaining FROM unallocated_hours WHERE hour_entry_id = $1',
    [entry])).rows[0]?.remaining;
  check('the spare 60 minutes are held, not burned', spare === 60, `${spare} min spare`);

  console.log('\n--- the hours are traceable back to the activity ---');
  const link = (await c.query<{ activity_id: string; started_at: string }>(
    'SELECT activity_id, started_at FROM hour_entries WHERE id = $1', [entry])).rows[0];
  check('the ledger entry names the activity it came from', link.activity_id === act);
  check('and carries the times, so overlaps can be caught', link.started_at === '09:00:00',
    link.started_at);

} finally {
  /*
   * Under the delete hatch, in one transaction with a savepoint per statement.
   * `audit_logs` is append-only since migration 049: an unguarded DELETE there
   * is refused, `audit_logs.actor_id` is ON DELETE RESTRICT, and the account
   * then survives the `DELETE FROM users` below — in the association's live
   * database. The `.catch()` this loop carries would have reported that in a
   * line nobody reads, which is exactly how probe-achievements leaked seven
   * accounts. See scripts/guarded-cleanup.mts for the two SET LOCAL traps.
   */
  const report = (sql: string, e: Error) =>
    console.error(`  cleanup failed: ${sql.split(' ')[3]} — ${e.message}`);

  await guardedCleanup(c, [
    `DELETE FROM hour_allocations WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM activity_attendance WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM hour_entries WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM activity_registrations WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM stage_requirement_progress WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM stage_progress WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM user_journey_assignments WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM membership_status_history WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM audit_logs WHERE actor_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    // Every statement runs even if one fails, so a single broken DELETE
    // cannot silently skip everything after it. That is what the savepoint
    // inside the helper preserves now the whole list shares one transaction.
  ], { params: [`${MARK}-%`], onError: report });

  await c.query('DELETE FROM activities WHERE id = $1', [act]).catch(() => {});
  await c.query('DELETE FROM users WHERE email LIKE $1', [`${MARK}-%`]).catch(() => {});

  if (version) {
    // Postgres rejects a statement given more parameters than it uses, so
    // each one carries exactly its own. Getting this wrong is silent when the
    // errors are caught, which is how the leftover versions went unnoticed.
    await guardedCleanup(
      c,
      [
        ['DELETE FROM hour_allocations WHERE requirement_id = $1', [req]],
        ['DELETE FROM stage_requirement_progress WHERE requirement_id = $1', [req]],
        ['DELETE FROM stage_requirements WHERE stage_id IN (SELECT id FROM journey_stages WHERE version_id = $1)', [version]],
        ['DELETE FROM user_journey_assignments WHERE version_id = $1', [version]],
        ['DELETE FROM journey_stages WHERE version_id = $1', [version]],
        ['DELETE FROM journey_versions WHERE id = $1', [version]],
      ],
      { onError: report },
    );
  }

  const u = (await c.query<{ n: string }>(
    'SELECT count(*)::TEXT AS n FROM users WHERE email LIKE $1', [`${MARK}-%`])).rows[0].n;
  const onLive = (await c.query<{ n: string }>(`
    SELECT count(*)::TEXT AS n FROM stage_requirements r
      JOIN journey_stages s ON s.id = r.stage_id
      JOIN journey_versions v ON v.id = s.version_id AND v.is_default`)).rows[0].n;
  const spareVersions = (await c.query<{ n: string }>(
    `SELECT count(*)::TEXT AS n FROM journey_versions WHERE name LIKE 'probe %'`)).rows[0].n;
  const a = (await c.query<{ n: string }>('SELECT count(*)::TEXT AS n FROM activities')).rows[0].n;
  console.log(
    `\ncleanup: ${u} users, ${spareVersions} probe journeys, ${onLive} requirements on the live ` +
      `journey, ${a} activities remaining (expected 0, 0, 0, 0)`,
  );
  await c.end();
}

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
