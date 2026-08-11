/**
 * Walks one volunteer through a configured journey, using the real evaluator
 * and the real allocator. Rolled back at the end.
 *
 * This is the test that matters: not "does a constraint fire" but "does the
 * engine tell a volunteer the truth about where they stand".
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import { journeyFor } from '../src/lib/journey.ts';
import { reallocate, rebuildAllocations } from '../src/lib/allocation.ts';

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();

let holes = 0;
let confirmed = 0;
function check(label: string, ok: boolean, detail = '') {
  if (!ok) holes += 1; else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail ? '  — ' + detail : ''}`);
}

// Everything happens inside one transaction on the shared pool connection is
// not possible here (journeyFor uses the pool), so this probe writes real rows
// under a marker and deletes them at the end.
const MARK = `eng-${Date.now()}`;
const version = randomUUID();
const stageIds = [randomUUID(), randomUUID()];
const reqCourse = randomUUID();
const reqHours1 = randomUUID();
const reqHours2 = randomUUID();
let volunteer = '';
let staff = '';

try {
  // A journey version of our own so the association's live one is untouched.
  await c.query(
    `INSERT INTO journey_versions (id, name, is_default) VALUES ($1, $2, false)`,
    [version, `probe ${MARK}`],
  );
  await c.query(
    `INSERT INTO journey_stages (id, version_id, number, title_ar, title_en)
     VALUES ($1, $2, 1, 'الأولى', 'One'), ($3, $2, 2, 'الثانية', 'Two')`,
    [stageIds[0], version, stageIds[1]],
  );
  await c.query(
    `INSERT INTO stage_requirements (id, stage_id, kind, label_ar, label_en, config, sort_order)
     VALUES
       ($1, $2, 'course', 'دورة العمل ضمن فريق', 'Teamwork course', '{"courseSlug":"teamwork"}', 1),
       ($3, $2, 'hours',  'ساعات المرحلة الأولى', 'Stage 1 hours',  '{"minutes":"120"}', 2),
       ($4, $5, 'hours',  'ساعات المرحلة الثانية','Stage 2 hours',  '{"minutes":"300"}', 1)`,
    [reqCourse, stageIds[0], reqHours1, reqHours2, stageIds[1]],
  );

  async function makeUser(tag: string): Promise<string> {
    const id = randomUUID();
    await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
      [id, `${MARK}-${tag}@example.test`, 'x']);
    await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [id, tag]);
    await c.query(
      `INSERT INTO membership_status_history (user_id, previous_status, new_status)
       VALUES ($1, NULL, 'registered_user')`, [id]);
    return id;
  }
  volunteer = await makeUser('volunteer');
  staff = await makeUser('staff');

  console.log('\n--- a learner has no journey ---');
  check('journeyFor returns null for a learner', (await journeyFor(volunteer)) === null);

  console.log('\n--- accepted, and placed on our probe journey ---');
  await c.query(
    `INSERT INTO membership_status_history (user_id, previous_status, new_status, changed_by, actor_role, reason)
     VALUES ($1, 'volunteer_applicant', 'accepted_volunteer', $2, 'applications.review', 'probe')`,
    [volunteer, staff],
  );
  await c.query(
    `INSERT INTO user_journey_assignments (user_id, version_id, assigned_by, reason)
     VALUES ($1, $2, $3, 'probe')`, [volunteer, version, staff]);

  let j = await journeyFor(volunteer);
  check('journey now exists', j !== null);
  check('stage 1 is available, not locked', j?.stages[0].status === 'available', j?.stages[0].status);
  check('stage 2 is locked behind stage 1', j?.stages[1].status === 'locked', j?.stages[1].status);
  check('stage 1 starts at 0%', j?.stages[0].percent === 0, `${j?.stages[0].percent}%`);
  check('next action is the course', j?.nextAction?.requirement.kind === 'course',
    j?.nextAction?.requirement.labelEn);

  console.log('\n--- passing the course satisfies one requirement ---');
  await c.query(
    `INSERT INTO course_progress (user_id, course_slug, score, passed, completed_at)
     VALUES ($1, 'teamwork', 90, true, now())`, [volunteer]);
  j = await journeyFor(volunteer);
  check('course requirement satisfied', j?.stages[0].requirements[0].satisfied === true);
  check('stage 1 now 50%', j?.stages[0].percent === 50, `${j?.stages[0].percent}%`);
  check('next action moved to hours', j?.nextAction?.requirement.kind === 'hours');
  check('hours progress shows 0 of 120',
    j?.nextAction?.requirement.progress?.current === 0 &&
    j?.nextAction?.requirement.progress?.target === 120);

  console.log('\n--- 90 verified minutes: partial progress, honestly reported ---');
  const e1 = randomUUID();
  await c.query(
    `INSERT INTO hour_entries (id, user_id, worked_on, minutes, status, verified_by, verified_at)
     VALUES ($1, $2, CURRENT_DATE - 10, 90, 'verified', $3, now())`, [e1, volunteer, staff]);
  await reallocate(volunteer);
  j = await journeyFor(volunteer);
  const h = j?.stages[0].requirements[1];
  check('90 of 120 minutes allocated', h?.progress?.current === 90, `${h?.progress?.current}/120`);
  check('requirement not yet satisfied', h?.satisfied === false);
  check('stage 1 still not complete', j?.stages[0].status === 'in_progress', j?.stages[0].status);

  console.log('\n--- THE SPLIT: a 240-minute entry fills stage 1 and spills into stage 2 ---');
  const e2 = randomUUID();
  await c.query(
    `INSERT INTO hour_entries (id, user_id, worked_on, minutes, status, verified_by, verified_at)
     VALUES ($1, $2, CURRENT_DATE - 5, 240, 'verified', $3, now())`, [e2, volunteer, staff]);
  await reallocate(volunteer);

  const s1 = (await c.query<{ minutes: string }>(
    'SELECT minutes FROM allocated_minutes WHERE user_id = $1 AND requirement_id = $2',
    [volunteer, reqHours1])).rows[0]?.minutes;
  const s2 = (await c.query<{ minutes: string }>(
    'SELECT minutes FROM allocated_minutes WHERE user_id = $1 AND requirement_id = $2',
    [volunteer, reqHours2])).rows[0]?.minutes;
  check('stage 1 hours filled to exactly 120', s1 === '120', `${s1}`);
  check('the remaining 210 went to stage 2, not lost', s2 === '210', `${s2}`);

  const totalAllocated = (await c.query<{ n: string }>(
    'SELECT COALESCE(SUM(minutes),0)::TEXT AS n FROM hour_allocations WHERE user_id = $1',
    [volunteer])).rows[0].n;
  check('nothing counted twice: 90 + 240 = 330 allocated', totalAllocated === '330', totalAllocated);

  console.log('\n--- an entry cannot be over-allocated ---');
  let refused = false;
  try {
    await c.query(
      `INSERT INTO hour_allocations (hour_entry_id, requirement_id, user_id, minutes)
       VALUES ($1, $2, $3, 999)`, [e1, reqHours2, volunteer]);
  } catch { refused = true; }
  check('allocating more minutes than were worked is refused', refused);

  console.log('\n--- completing stage 1 unlocks stage 2 ---');
  await c.query(
    `INSERT INTO stage_progress (user_id, stage, awarded_by, note)
     VALUES ($1, 1, $2, 'requirements met')`, [volunteer, staff]);
  j = await journeyFor(volunteer);
  check('stage 1 reads as completed', j?.stages[0].status === 'completed', j?.stages[0].status);
  check('stage 1 shows 100%', j?.stages[0].percent === 100);
  check('stage 2 is no longer locked', j?.stages[1].status !== 'locked', j?.stages[1].status);
  check('current stage is now stage 2', j?.currentStage?.number === 2);

  console.log('\n--- correcting hours takes the credit back ---');
  await c.query(`UPDATE hour_entries SET status = 'corrected' WHERE id = $1`, [e2]);
  await rebuildAllocations(volunteer);
  j = await journeyFor(volunteer);
  const after1 = (await c.query<{ minutes: string }>(
    'SELECT minutes FROM allocated_minutes WHERE user_id = $1 AND requirement_id = $2',
    [volunteer, reqHours1])).rows[0]?.minutes ?? '0';
  const after2 = (await c.query<{ minutes: string }>(
    'SELECT minutes FROM allocated_minutes WHERE user_id = $1 AND requirement_id = $2',
    [volunteer, reqHours2])).rows[0]?.minutes ?? '0';
  check('stage 1 falls back to the surviving 90 minutes', after1 === '90', after1);
  check('stage 2 allocation is released entirely', after2 === '0', after2);
  check('stage 1 stays completed — history is not rewritten',
    j?.stages[0].status === 'completed', j?.stages[0].status);

} finally {
  // Clean up everything this probe created.
  for (const sql of [
    `DELETE FROM hour_allocations WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM hour_entries WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM stage_progress WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM course_progress WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM stage_requirement_progress WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM user_journey_assignments WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM membership_status_history WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM audit_logs WHERE actor_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM users WHERE email LIKE $1`,
  ]) await c.query(sql, [`${MARK}-%`]);
  await c.query('DELETE FROM stage_requirements WHERE stage_id = ANY($1)', [stageIds]);
  await c.query('DELETE FROM journey_stages WHERE version_id = $1', [version]);
  await c.query('DELETE FROM journey_versions WHERE id = $1', [version]);

  const left = await c.query<{ n: string }>(
    'SELECT count(*)::TEXT AS n FROM users WHERE email LIKE $1', [`${MARK}-%`]);
  console.log(`\ncleanup: ${left.rows[0].n} probe users remaining (expected 0)`);
  await c.end();
}

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
