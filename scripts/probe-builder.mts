/**
 * Configures the live journey the way an admin would, then checks the
 * evaluator reads it. Removes what it added.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import { journeyFor } from '../src/lib/journey.ts';
import { reallocate } from '../src/lib/allocation.ts';

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();

let holes = 0, confirmed = 0;
function check(label: string, ok: boolean, detail = '') {
  if (!ok) holes += 1; else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail ? '  — ' + detail : ''}`);
}

const MARK = `bld-${Date.now()}`;
const added: string[] = [];
let vol = '', staff = '';

try {
  const stages = (await c.query<{ id: string; number: number }>(
    `SELECT s.id, s.number FROM journey_stages s
       JOIN journey_versions v ON v.id = s.version_id AND v.is_default
      ORDER BY s.number`)).rows;
  check('the live journey has stages to configure', stages.length === 6, `${stages.length}`);

  // What the Journey Builder writes for "Stage 1: pass Teamwork, then 10 hours".
  const r1 = randomUUID(), r2 = randomUUID();
  added.push(r1, r2);
  await c.query(
    `INSERT INTO stage_requirements (id, stage_id, kind, label_ar, label_en, config, sort_order)
     VALUES ($1, $2, 'course', 'إتمام دورة العمل ضمن فريق', 'Complete Teamwork', '{"courseSlug":"teamwork"}', 1),
            ($3, $2, 'hours',  'عشر ساعات تطوّع معتمدة', 'Ten verified hours', '{"minutes":"600"}', 2)`,
    [r1, stages[0].id, r2],
  );
  check('requirements saved against stage 1', true);

  async function makeUser(tag: string) {
    const id = randomUUID();
    await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
      [id, `${MARK}-${tag}@example.test`, 'x']);
    await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [id, tag]);
    await c.query(`INSERT INTO membership_status_history (user_id, new_status) VALUES ($1, 'registered_user')`, [id]);
    return id;
  }
  vol = await makeUser('vol');
  staff = await makeUser('staff');

  await c.query(
    `INSERT INTO membership_status_history (user_id, previous_status, new_status, changed_by, actor_role, reason)
     VALUES ($1, 'volunteer_applicant', 'accepted_volunteer', $2, 'applications.review', 'probe')`,
    [vol, staff]);

  let j = await journeyFor(vol);
  check('the volunteer is placed on the live journey', j !== null, j?.versionName);
  check('stage 1 shows the two configured requirements',
    j?.stages[0].requirements.length === 2, `${j?.stages[0].requirements.length}`);
  check('next step is the course, in the volunteer\'s language',
    j?.nextAction?.requirement.labelAr === 'إتمام دورة العمل ضمن فريق',
    j?.nextAction?.requirement.labelAr);
  check('the course requirement links to the course page',
    j?.nextAction?.requirement.courseSlug === 'teamwork');

  console.log('\n--- the volunteer does the work ---');
  await c.query(
    `INSERT INTO course_progress (user_id, course_slug, score, passed, completed_at)
     VALUES ($1, 'teamwork', 85, true, now())`, [vol]);
  const e = randomUUID();
  await c.query(
    `INSERT INTO hour_entries (id, user_id, worked_on, minutes, status, verified_by, verified_at)
     VALUES ($1, $2, CURRENT_DATE - 3, 400, 'verified', $3, now())`, [e, vol, staff]);
  await reallocate(vol);

  j = await journeyFor(vol);
  const hours = j?.stages[0].requirements.find((r) => r.kind === 'hours');
  check('course requirement is met', j?.stages[0].requirements[0].satisfied === true);
  check('hours show 400 of 600', hours?.progress?.current === 400, `${hours?.progress?.current}/600`);
  check('stage 1 is half done', j?.stages[0].percent === 50, `${j?.stages[0].percent}%`);
  check('the remaining need is reported, not hidden',
    (hours?.progress?.target ?? 0) - (hours?.progress?.current ?? 0) === 200);

  console.log('\n--- an admin raises the bar mid-journey ---');
  await c.query(`UPDATE stage_requirements SET config = '{"minutes":"300"}' WHERE id = $1`, [r2]);
  await reallocate(vol);
  j = await journeyFor(vol);
  const lowered = j?.stages[0].requirements.find((r) => r.kind === 'hours');
  check('lowering the requirement to 5h satisfies it immediately', lowered?.satisfied === true);
  check('stage 1 requirements are now all complete',
    j?.stages[0].status === 'requirements_completed', j?.stages[0].status);
  check('but the stage is not silently marked completed',
    j?.stages[0].completedAt === null);

  console.log('\n--- archiving a requirement ---');
  await c.query('UPDATE stage_requirements SET archived_at = now() WHERE id = $1', [r1]);
  j = await journeyFor(vol);
  check('an archived requirement disappears from the journey',
    j?.stages[0].requirements.length === 1, `${j?.stages[0].requirements.length}`);
  const stillThere = (await c.query<{ n: string }>(
    'SELECT count(*)::TEXT AS n FROM stage_requirements WHERE id = $1', [r1])).rows[0].n;
  check('but the row survives, so the record stays readable', stillThere === '1');

} finally {
  for (const sql of [
    `DELETE FROM hour_allocations WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM hour_entries WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM course_progress WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM stage_requirement_progress WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM user_journey_assignments WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM membership_status_history WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM users WHERE email LIKE $1`,
  ]) await c.query(sql, [`${MARK}-%`]);
  if (added.length) await c.query('DELETE FROM stage_requirements WHERE id = ANY($1)', [added]);

  const leftUsers = (await c.query<{ n: string }>(
    'SELECT count(*)::TEXT AS n FROM users WHERE email LIKE $1', [`${MARK}-%`])).rows[0].n;
  const leftReqs = (await c.query<{ n: string }>(
    'SELECT count(*)::TEXT AS n FROM stage_requirements')).rows[0].n;
  console.log(`\ncleanup: ${leftUsers} probe users, ${leftReqs} requirements left on the live journey (expected 0, 0)`);
  await c.end();
}

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
