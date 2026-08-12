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
let vol = '', staff = '', version = '';

try {
  /*
   * A journey of its own, copied from the live one.
   *
   * This used to configure the default journey directly, which meant a probe
   * run left the association's actual programme carrying requirements nobody
   * had decided on. The Journey Builder is exercised just as well against a
   * version this probe owns and deletes, and there is then no run in which the
   * real configuration can be touched at all.
   */
  const liveStages = (await c.query<{ id: string; number: number; title_ar: string; title_en: string }>(
    `SELECT s.id, s.number, s.title_ar, s.title_en FROM journey_stages s
       JOIN journey_versions v ON v.id = s.version_id AND v.is_default
      ORDER BY s.number`)).rows;
  check('the live journey has stages to copy', liveStages.length === 6, `${liveStages.length}`);

  version = randomUUID();
  await c.query(
    `INSERT INTO journey_versions (id, name, description, is_default)
     VALUES ($1, $2, 'Created by probe-builder. Safe to delete.', false)`,
    [version, `probe ${MARK}`],
  );
  const stages: { id: string; number: number }[] = [];
  for (const s of liveStages) {
    const id = randomUUID();
    await c.query(
      `INSERT INTO journey_stages (id, version_id, number, title_ar, title_en)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, version, s.number, s.title_ar, s.title_en],
    );
    stages.push({ id, number: s.number });
  }
  check('the probe has its own six-stage journey', stages.length === 6, `${stages.length}`);

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

  // Acceptance puts them on the default journey; move them onto the probe's.
  await c.query(
    // id is a generated identity, not a uuid, so it is left to the database.
    `INSERT INTO user_journey_assignments (user_id, version_id, assigned_by, reason)
     VALUES ($1, $2, $3, 'probe: moved onto an isolated journey')`,
    [vol, version, staff],
  );

  let j = await journeyFor(vol);
  check('the volunteer is placed on a journey', j !== null, j?.versionName);
  check('and it is the probe\'s own, not the association\'s', j?.versionName === `probe ${MARK}`,
    j?.versionName);
  check('stage 1 shows the two configured requirements',
    j?.stages[0].requirements.length === 2, `${j?.stages[0].requirements.length}`);
  check('next step is the course, in the volunteer\'s language',
    j?.nextAction?.requirement.labelAr === 'إتمام دورة العمل ضمن فريق',
    j?.nextAction?.requirement.labelAr);
  check('the course requirement links to the course page',
    j?.nextAction?.requirement.courseSlug === 'teamwork');

  console.log('\n--- the volunteer does the work ---');
  await c.query(
    // course_progress became a view over course_attempts in migration 012, so
    // a pass is recorded by recording the attempt that earned it.
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, pass_mark, submitted_at, score, passed)
     VALUES (gen_random_uuid(), $1, 'teamwork', ARRAY['q'], 70, now(), 85, true)`, [vol]);
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
  /*
   * Every statement runs even if an earlier one fails.
   *
   * This block used to stop at the first error, and that is exactly how the
   * association's journey ended up configured with six requirements nobody
   * asked for: a DELETE against course_progress started throwing the day it
   * became a view, and everything after it - including the requirement
   * cleanup - silently never ran.
   */
  for (const sql of [
    `DELETE FROM hour_allocations WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM hour_entries WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM course_attempts WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM stage_requirement_progress WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM user_journey_assignments WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM membership_status_history WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)`,
    `DELETE FROM users WHERE email LIKE $1`,
  ]) {
    await c
      .query(sql, [`${MARK}-%`])
      .catch((e) => console.error(`  cleanup failed: ${sql.split(' ')[3]} — ${(e as Error).message}`));
  }

  // The whole version goes, and the requirements go with it. Nothing this
  // probe wrote ever touched the journey real volunteers are on.
  if (version) {
    for (const sql of [
      `DELETE FROM stage_requirement_progress WHERE requirement_id = ANY($1)`,
      `DELETE FROM hour_allocations WHERE requirement_id = ANY($1)`,
    ]) {
      // Logged, never swallowed. A cleanup failure that says nothing is how
      // residue builds up in a database that also holds real people.
      await c
        .query(sql, [added])
        .catch((e) => console.error(`  cleanup failed: ${sql.split(' ')[3]} — ${(e as Error).message}`));
    }
    for (const sql of [
      `DELETE FROM stage_requirements WHERE stage_id IN (SELECT id FROM journey_stages WHERE version_id = $1)`,
      `DELETE FROM user_journey_assignments WHERE version_id = $1`,
      `DELETE FROM journey_stages WHERE version_id = $1`,
      `DELETE FROM journey_versions WHERE id = $1`,
    ]) {
      await c
        .query(sql, [version])
        .catch((e) => console.error(`  cleanup failed: ${sql.split(' ')[3]} — ${(e as Error).message}`));
    }
  }

  const leftUsers = (await c.query<{ n: string }>(
    'SELECT count(*)::TEXT AS n FROM users WHERE email LIKE $1', [`${MARK}-%`])).rows[0].n;
  const onLive = (await c.query<{ n: string }>(`
    SELECT count(*)::TEXT AS n FROM stage_requirements r
      JOIN journey_stages s ON s.id = r.stage_id
      JOIN journey_versions v ON v.id = s.version_id AND v.is_default`)).rows[0].n;
  const spareVersions = (await c.query<{ n: string }>(
    `SELECT count(*)::TEXT AS n FROM journey_versions WHERE name LIKE 'probe %'`)).rows[0].n;
  console.log(
    `\ncleanup: ${leftUsers} probe users, ${spareVersions} probe journey versions, ` +
      `${onLive} requirements on the live journey (expected 0, 0, 0)`,
  );
  await c.end();
}

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
