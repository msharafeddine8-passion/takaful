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
let learner = '', vol = '', sup = '';

try {
  const stage1 = (await c.query<{ id: string }>(
    `SELECT s.id FROM journey_stages s
       JOIN journey_versions v ON v.id = s.version_id AND v.is_default
      WHERE s.number = 1`)).rows[0].id;
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
    `INSERT INTO course_progress (user_id, course_slug, score, passed, completed_at)
     VALUES ($1, 'teamwork', 88, true, now())`, [learner]);
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
    `DELETE FROM course_progress WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM user_journey_assignments WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM membership_status_history WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
  ]) await c.query(sql, [`${MARK}-%`]);
  await c.query('DELETE FROM activities WHERE id = $1', [act]);
  await c.query('DELETE FROM stage_requirements WHERE id = $1', [req]);
  await c.query('DELETE FROM users WHERE email LIKE $1', [`${MARK}-%`]);

  const u = (await c.query<{ n: string }>(
    'SELECT count(*)::TEXT AS n FROM users WHERE email LIKE $1', [`${MARK}-%`])).rows[0].n;
  const r = (await c.query<{ n: string }>('SELECT count(*)::TEXT AS n FROM stage_requirements')).rows[0].n;
  console.log(`\ncleanup: ${u} probe users, ${r} requirements left (expected 0, 0)`);
  await c.end();
}

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
