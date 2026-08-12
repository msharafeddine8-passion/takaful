/**
 * Badges.
 *
 * The interesting behaviour is not earning one — it is what happens when the
 * ground moves. An hour corrected downward has to take the badge with it,
 * without erasing the fact that it was once held, and winning it back must
 * not mint a second one with today's date.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import {
  recomputeAchievements,
  achievementsFor,
  achievementHistory,
  standingFor,
  nextUp,
  ACHIEVEMENTS,
} from '../src/lib/achievements.ts';

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();

let holes = 0,
  confirmed = 0;
function check(label: string, ok: boolean, detail: unknown = '') {
  if (!ok) holes += 1;
  else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail === '' ? '' : '  — ' + detail}`);
}
async function mustFail(name: string, sql: string, params: unknown[] = []) {
  try {
    await c.query(sql, params);
    console.log(`  HOLE     ${name}  <-- allowed and should not be`);
    holes += 1;
  } catch (e) {
    console.log(`  rejected ${name}  (${(e as { code?: string }).code ?? '?'})`);
    confirmed += 1;
  }
}

const MARK = `ach-${Date.now()}`;
const made: string[] = [];
let activity = '';

async function makeUser(tag: string): Promise<string> {
  const id = randomUUID();
  await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [
    id, `${MARK}-${tag}@example.test`, 'x',
  ]);
  await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [id, tag]);
  await c.query(
    `INSERT INTO membership_status_history (user_id, new_status) VALUES ($1, 'registered_user')`,
    [id],
  );
  made.push(id);
  return id;
}

try {
  const vol = await makeUser('vol');
  const sup = await makeUser('sup');

  console.log('\n--- what the table refuses ---');
  await mustFail(
    'a revoked badge with no reason',
    `INSERT INTO achievements (user_id, code, revoked_at) VALUES ($1, 'first-hour', now())`,
    [vol],
  );
  await mustFail(
    'a negative value',
    `INSERT INTO achievements (user_id, code, value) VALUES ($1, 'first-hour', -5)`,
    [vol],
  );

  console.log('\n--- nothing done, nothing earned ---');
  let r = await recomputeAchievements(vol);
  check('no badges are handed out for signing up', r.earned.length === 0, r.earned.join(','));
  check('and none are held', (await achievementsFor(vol)).length === 0);

  console.log('\n--- the first verified hour ---');
  const entry = randomUUID();
  await c.query(
    `INSERT INTO hour_entries (id, user_id, worked_on, minutes, status, verified_by, verified_at)
     VALUES ($1, $2, CURRENT_DATE - 5, 90, 'verified', $3, now())`,
    [entry, vol, sup],
  );
  r = await recomputeAchievements(vol);
  check('the first hour earns a badge', r.earned.includes('first-hour'), r.earned.join(','));
  check('and only that one', r.earned.length === 1, r.earned.join(','));

  let held = await achievementsFor(vol);
  const first = held.find((a) => a.code === 'first-hour');
  check('the figure that earned it is frozen on the row', first?.value === 90, first?.value);
  const firstEarnedAt = first!.earned_at;

  console.log('\n--- recomputing changes nothing ---');
  r = await recomputeAchievements(vol);
  check('running it again earns nothing new', r.earned.length === 0 && r.revoked.length === 0);
  check('and does not duplicate the row', (await achievementHistory(vol)).length === 1);
  await mustFail(
    'a second row for the same badge',
    `INSERT INTO achievements (user_id, code) VALUES ($1, 'first-hour')`,
    [vol],
  );

  console.log('\n--- ten hours ---');
  await c.query(
    `INSERT INTO hour_entries (id, user_id, worked_on, minutes, status, verified_by, verified_at)
     VALUES (gen_random_uuid(), $1, CURRENT_DATE - 4, 520, 'verified', $2, now())`,
    [vol, sup],
  );
  r = await recomputeAchievements(vol);
  check('crossing ten hours earns the next badge', r.earned.includes('ten-hours'), r.earned.join(','));
  held = await achievementsFor(vol);
  check('and the first one is still held', held.some((a) => a.code === 'first-hour'));
  check(
    'the fifty-hour badge is not given early',
    !held.some((a) => a.code === 'fifty-hours'),
    held.map((a) => a.code).join(','),
  );

  console.log('\n--- an hour is corrected downward ---');
  // The 520-minute entry is withdrawn, dropping them to 90 minutes.
  await c.query(
    `UPDATE hour_entries SET status = 'rejected', reject_reason = 'logged in error'
      WHERE user_id = $1 AND minutes = 520`,
    [vol],
  );
  r = await recomputeAchievements(vol, 'ساعات صُحّحت');
  check('the ten-hour badge is revoked', r.revoked.includes('ten-hours'), r.revoked.join(','));
  check('the first-hour badge survives', !r.revoked.includes('first-hour'));

  const history = await achievementHistory(vol);
  const revoked = history.find((a) => a.code === 'ten-hours');
  check('the revoked row is kept, not deleted', revoked !== undefined);
  check('with a reason on it', revoked?.revoke_reason === 'ساعات صُحّحت', revoked?.revoke_reason);
  check(
    'and it no longer counts as held',
    !(await achievementsFor(vol)).some((a) => a.code === 'ten-hours'),
  );

  console.log('\n--- and won back ---');
  await c.query(
    `UPDATE hour_entries SET status = 'verified', reject_reason = NULL, verified_by = $2, verified_at = now()
      WHERE user_id = $1 AND minutes = 520`,
    [vol, sup],
  );
  r = await recomputeAchievements(vol);
  check('the badge returns', r.earned.includes('ten-hours'), r.earned.join(','));
  const back = (await achievementsFor(vol)).find((a) => a.code === 'ten-hours');
  check('as the same badge, not a new one', (await achievementHistory(vol)).length === 2);
  check('and it is no longer marked revoked', back?.revoked_at === null);
  check(
    'the first-hour badge kept its original date through all of it',
    (await achievementsFor(vol)).find((a) => a.code === 'first-hour')?.earned_at.getTime() ===
      firstEarnedAt.getTime(),
  );

  console.log('\n--- courses count people, not attempts ---');
  for (let i = 0; i < 3; i += 1) {
    await c.query(
      `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, pass_mark, submitted_at, score, passed)
       VALUES (gen_random_uuid(), $1, 'teamwork', ARRAY['q'], 70, now(), 90, true)`,
      [vol],
    );
  }
  let standing = await standingFor(vol);
  check('three passes of one course count as one course', standing.courses === 1, standing.courses);
  r = await recomputeAchievements(vol);
  check('and that earns the first-course badge', r.earned.includes('first-course'), r.earned.join(','));
  check(
    'but not the all-foundations one',
    !(await achievementsFor(vol)).some((a) => a.code === 'all-foundations'),
  );

  console.log('\n--- activities count attendance, not registration ---');
  await c.query(
    `INSERT INTO activities (id, title_ar, title_en, starts_at, ends_at, created_by)
     VALUES ($1, 'نشاط', 'activity', now() - INTERVAL '2 days', now() - INTERVAL '1 day', $2)`,
    [(activity = randomUUID()), sup],
  );
  await c.query(
    `INSERT INTO activity_registrations (id, activity_id, user_id) VALUES (gen_random_uuid(), $1, $2)`,
    [activity, vol],
  );
  r = await recomputeAchievements(vol);
  check(
    'registering for an activity earns nothing',
    !(await achievementsFor(vol)).some((a) => a.code === 'first-activity'),
  );
  await c.query(
    `INSERT INTO activity_attendance (id, activity_id, user_id, attended, confirmed_by)
     VALUES (gen_random_uuid(), $1, $2, true, $3)`,
    [activity, vol, sup],
  );
  r = await recomputeAchievements(vol);
  check('turning up does', r.earned.includes('first-activity'), r.earned.join(','));

  console.log('\n--- what is next ---');
  standing = await standingFor(vol);
  const heldCodes = new Set((await achievementsFor(vol)).map((a) => a.code));
  const next = nextUp(standing, heldCodes);
  check('a next badge is suggested for each kind', next.length === 4, next.length);
  check(
    'none of them are ones already held',
    next.every((n) => !heldCodes.has(n.def.code)),
    next.map((n) => n.def.code).join(','),
  );
  check(
    'the suggestion is the nearest one, not the grandest',
    next.find((n) => n.def.kind === 'hours')?.def.code === 'fifty-hours',
    next.find((n) => n.def.kind === 'hours')?.def.code,
  );
  check(
    'and it says how far there is to go',
    next.find((n) => n.def.kind === 'hours')?.remaining === 3000 - standing.hours,
    next.find((n) => n.def.kind === 'hours')?.remaining,
  );

  console.log('\n--- the catalogue itself ---');
  check(
    'every badge has a code nobody else uses',
    new Set(ACHIEVEMENTS.map((a) => a.code)).size === ACHIEVEMENTS.length,
  );
  check(
    'and both languages, so none renders blank',
    ACHIEVEMENTS.every(
      (a) => a.title.ar && a.title.en && a.description.ar && a.description.en,
    ),
  );
  check('and a threshold above zero', ACHIEVEMENTS.every((a) => a.threshold > 0));
} finally {
  console.log('\n--- cleanup ---');
  if (activity) {
    for (const sql of [
      'DELETE FROM activity_attendance WHERE activity_id = $1',
      'DELETE FROM activity_registrations WHERE activity_id = $1',
    ]) {
      await c.query(sql, [activity]).catch((e) => console.error(`  ${(e as Error).message}`));
    }
  }
  for (const id of made) {
    for (const sql of [
      'DELETE FROM achievements WHERE user_id = $1',
      'DELETE FROM hour_allocations WHERE user_id = $1',
      'DELETE FROM hour_entries WHERE user_id = $1 OR verified_by = $1',
      'DELETE FROM course_attempts WHERE user_id = $1',
      'DELETE FROM stage_progress WHERE user_id = $1 OR awarded_by = $1',
      'DELETE FROM audit_logs WHERE actor_id = $1',
      'DELETE FROM membership_status_history WHERE user_id = $1 OR changed_by = $1',
      'DELETE FROM user_journey_assignments WHERE user_id = $1 OR assigned_by = $1',
      'DELETE FROM profiles WHERE user_id = $1',
    ]) {
      await c.query(sql, [id]).catch((e) => console.error(`  ${sql.split(' ')[3]}: ${(e as Error).message}`));
    }
  }
  if (activity) await c.query('DELETE FROM activities WHERE id = $1', [activity]).catch(() => {});
  for (const id of made) {
    await c.query('DELETE FROM users WHERE id = $1', [id]).catch((e) =>
      console.error(`  users: ${(e as Error).message}`),
    );
  }
  const left = (
    await c.query<{ n: string }>('SELECT count(*)::TEXT AS n FROM users WHERE email LIKE $1', [
      `${MARK}%`,
    ])
  ).rows[0].n;
  console.log(`  ${left} probe users remaining (expected 0)`);
  await c.end();
}

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
