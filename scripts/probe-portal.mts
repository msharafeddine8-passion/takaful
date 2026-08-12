/**
 * The portal home for both kinds of participant: a learner who only takes
 * courses, and a volunteer partway through a stage.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import { portalSummary } from '../src/lib/portal.ts';
import { reallocate } from '../src/lib/allocation.ts';

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();

let holes = 0, confirmed = 0;
function check(label: string, ok: boolean, detail = '') {
  if (!ok) holes += 1; else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail ? '  — ' + detail : ''}`);
}

const MARK = `ptl-${Date.now()}`;
const req = randomUUID();
const act = randomUUID();
let learner = '', vol = '', sup = '', version = '';

try {
  /*
   * A journey of this probe's own. Writing the requirement onto the default
   * journey - which is what this did - leaves the association's programme
   * configured with a rule nobody decided on, for as long as the cleanup
   * happens to work.
   */
  const liveStages = (await c.query<{ number: number; title_ar: string; title_en: string }>(
    `SELECT s.number, s.title_ar, s.title_en FROM journey_stages s
       JOIN journey_versions v ON v.id = s.version_id AND v.is_default
      ORDER BY s.number`)).rows;

  version = randomUUID();
  await c.query(
    `INSERT INTO journey_versions (id, name, description, is_default)
     VALUES ($1, $2, 'Created by probe-portal. Safe to delete.', false)`,
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

  await c.query(
    `INSERT INTO stage_requirements (id, stage_id, kind, label_ar, label_en, config, sort_order)
     VALUES ($1, $2, 'hours', 'ستّ ساعات', 'Six hours', '{"minutes":"360"}', 1)`,
    [req, stage1]);

  async function makeUser(tag: string) {
    const id = randomUUID();
    await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
      [id, `${MARK}-${tag}@example.test`, 'x']);
    await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [id, tag]);
    await c.query(`INSERT INTO membership_status_history (user_id, new_status) VALUES ($1, 'registered_user')`, [id]);
    return id;
  }
  learner = await makeUser('learner');
  vol = await makeUser('vol');
  sup = await makeUser('sup');

  console.log('\n--- a learner, fresh ---');
  let s = await portalSummary(learner);
  check('has no journey', s.journey === null);
  check('no verified hours', s.verifiedMinutes === 0);
  check('no certificates', s.certificates === 0);
  check('no upcoming activity', s.nextActivity === null);
  check('sees how many courses exist to take', s.coursesTotal > 0, `${s.coursesTotal} courses`);

  console.log('\n--- the learner takes a course ---');
  await c.query(
    // course_progress became a view over course_attempts in migration 012, so
    // a pass is recorded by recording the attempt that earned it.
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, pass_mark, submitted_at, score, passed)
     VALUES (gen_random_uuid(), $1, 'teamwork', ARRAY['q'], 70, now(), 88, true)`, [learner]);
  await c.query(
    `INSERT INTO certificates (id, code, user_id, kind, course_slug, snapshot)
     VALUES ($1, 'TKF-PRB1-TEST', $2, 'course', 'teamwork', $3)`,
    [randomUUID(), learner, JSON.stringify({ fullName: 'learner', titleAr: 'x', titleEn: 'x' })]);

  s = await portalSummary(learner);
  check('one course passed', s.coursesPassed === 1);
  check('one certificate earned without being a volunteer', s.certificates === 1);
  check('the latest certificate code is offered', s.latestCertificateCode === 'TKF-PRB1-TEST');
  check('still no journey', s.journey === null);

  console.log('\n--- a volunteer, partway through ---');
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

  await c.query(
    `INSERT INTO activities (id, title_ar, title_en, location, starts_at, ends_at, led_by)
     VALUES ($1, 'يوم ميداني', 'Field day', 'طرابلس',
             now() + interval '3 days', now() + interval '3 days 4 hours', $2)`, [act, sup]);
  await c.query(
    `INSERT INTO activity_registrations (id, activity_id, user_id, status)
     VALUES ($1, $2, $3, 'registered')`, [randomUUID(), act, vol]);

  const e = randomUUID();
  await c.query(
    `INSERT INTO hour_entries (id, user_id, worked_on, minutes, status, verified_by, verified_at)
     VALUES ($1, $2, CURRENT_DATE - 2, 180, 'verified', $3, now())`, [e, vol, sup]);
  await c.query(
    `INSERT INTO hour_entries (id, user_id, worked_on, minutes) VALUES ($1, $2, CURRENT_DATE, 60)`,
    [randomUUID(), vol]);
  await reallocate(vol);

  s = await portalSummary(vol);
  check('has a journey', s.journey !== null, s.journey?.versionName);
  check('current stage is stage 1', s.journey?.currentStage?.number === 1);
  check('three verified hours counted', s.verifiedMinutes === 180, `${s.verifiedMinutes} min`);
  check('one hour still pending, shown separately', s.pendingMinutes === 60, `${s.pendingMinutes} min`);
  check('stage progress is 0% — the requirement is not met yet',
    s.journey?.currentStage?.percent === 0, `${s.journey?.currentStage?.percent}%`);
  check('the next step is the hours requirement',
    s.journey?.nextAction?.requirement.kind === 'hours',
    s.journey?.nextAction?.requirement.labelAr);
  check('their upcoming activity is surfaced', s.nextActivity?.id === act,
    s.nextActivity?.title_ar);

  console.log('\n--- pending hours are not counted as progress ---');
  const alloc = (await c.query<{ minutes: string }>(
    'SELECT minutes FROM allocated_minutes WHERE user_id = $1 AND requirement_id = $2',
    [vol, req])).rows[0]?.minutes;
  check('only the verified 180 were allocated', alloc === '180', alloc);
  check('the requirement still needs 180 more',
    (s.journey?.nextAction?.requirement.progress?.target ?? 0) -
      (s.journey?.nextAction?.requirement.progress?.current ?? 0) === 180);

} finally {
  for (const sql of [
    `DELETE FROM hour_allocations WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM certificates WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM activity_registrations WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM hour_entries WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM course_attempts WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM stage_requirement_progress WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM user_journey_assignments WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM membership_status_history WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    // Every statement runs even if one fails. A finally block that stops at
    // the first error is how residue accumulates unnoticed.
  ]) await c.query(sql, [`${MARK}-%`]).catch((e) =>
    console.error(`  cleanup failed: ${sql.split(' ')[3]} — ${(e as Error).message}`));

  await c.query('DELETE FROM activities WHERE id = $1', [act]).catch(() => {});
  await c.query('DELETE FROM users WHERE email LIKE $1', [`${MARK}-%`]).catch(() => {});

  if (version) {
    // Postgres rejects a statement given more parameters than it uses, so
    // each one carries exactly its own. Getting this wrong is silent when the
    // errors are caught, which is how the leftover versions went unnoticed.
    for (const [sql, params] of [
      ['DELETE FROM hour_allocations WHERE requirement_id = $1', [req]],
      ['DELETE FROM stage_requirement_progress WHERE requirement_id = $1', [req]],
      ['DELETE FROM stage_requirements WHERE stage_id IN (SELECT id FROM journey_stages WHERE version_id = $1)', [version]],
      ['DELETE FROM user_journey_assignments WHERE version_id = $1', [version]],
      ['DELETE FROM journey_stages WHERE version_id = $1', [version]],
      ['DELETE FROM journey_versions WHERE id = $1', [version]],
    ] as [string, unknown[]][]) {
      await c.query(sql, params).catch((e) =>
        console.error(`  cleanup failed: ${sql.split(' ')[3]} — ${(e as Error).message}`));
    }
  }

  const u = (await c.query<{ n: string }>(
    'SELECT count(*)::TEXT AS n FROM users WHERE email LIKE $1', [`${MARK}-%`])).rows[0].n;
  const onLive = (await c.query<{ n: string }>(`
    SELECT count(*)::TEXT AS n FROM stage_requirements r
      JOIN journey_stages s ON s.id = r.stage_id
      JOIN journey_versions v ON v.id = s.version_id AND v.is_default`)).rows[0].n;
  const spare = (await c.query<{ n: string }>(
    `SELECT count(*)::TEXT AS n FROM journey_versions WHERE name LIKE 'probe %'`)).rows[0].n;
  console.log(
    `\ncleanup: ${u} probe users, ${spare} probe journeys, ${onLive} requirements on the live journey (expected 0, 0, 0)`,
  );
  await c.end();
}

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
