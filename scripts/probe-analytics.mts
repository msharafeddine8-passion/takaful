/**
 * The reporting queries.
 *
 * These are read-only, so the probe builds a small cohort with a known shape,
 * asserts the numbers come back describing exactly that shape, and removes it.
 * A reporting query that is merely syntactically valid is worth nothing; the
 * risk is that it quietly counts the wrong people.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import {
  funnel,
  stageStandings,
  courseStandings,
  monthlyHours,
  attendanceStanding,
  stalledVolunteers,
} from '../src/lib/analytics.ts';
import { guardedCleanup } from './guarded-cleanup.mts';

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();

let holes = 0,
  confirmed = 0;
function check(label: string, ok: boolean, detail: unknown = '') {
  if (!ok) holes += 1;
  else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail === '' ? '' : '  — ' + detail}`);
}

const MARK = `ana-${Date.now()}`;
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
  // A baseline, so every assertion is about the change this cohort caused
  // rather than about whatever else is already in the database.
  const before = {
    funnel: await funnel(),
    attendance: await attendanceStanding(),
    stalled: await stalledVolunteers(),
    courses: await courseStandings(),
  };

  // Four people at four different depths, which is the whole point of a funnel.
  const justRegistered = await makeUser('registered');
  const learner = await makeUser('learner');
  const applicant = await makeUser('applicant');
  const volunteer = await makeUser('volunteer');

  await c.query(
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, pass_mark, submitted_at, score, passed)
     VALUES ($1, $2, 'teamwork', ARRAY['q'], 70, now(), 40, false)`,
    [randomUUID(), learner],
  );
  await c.query(
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, pass_mark, submitted_at, score, passed)
     VALUES ($1, $2, 'teamwork', ARRAY['q'], 70, now(), 90, true)`,
    [randomUUID(), applicant],
  );
  await c.query(
    `INSERT INTO volunteer_applications (id, user_id, status) VALUES ($1, $2, 'submitted')`,
    [randomUUID(), applicant],
  );

  await c.query(
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, pass_mark, submitted_at, score, passed)
     VALUES ($1, $2, 'teamwork', ARRAY['q'], 70, now(), 100, true)`,
    [randomUUID(), volunteer],
  );
  // chk_va_decision refuses a decided application with no decider or date,
  // which is the schema being right: a decision nobody made is not a decision.
  await c.query(
    `INSERT INTO volunteer_applications (id, user_id, status, decided_at, decided_by, decision_reason)
     VALUES ($1, $2, 'accepted', now(), $3, 'probe')`,
    [randomUUID(), volunteer, applicant],
  );
  await c.query(
    `INSERT INTO membership_status_history (user_id, previous_status, new_status, reason)
     VALUES ($1, 'volunteer_applicant', 'accepted_volunteer', 'probe')`,
    [volunteer],
  );
  // Verified hours need a verifier, and it may not be the person who logged
  // them — the schema enforces both.
  await c.query(
    `INSERT INTO hour_entries (id, user_id, worked_on, minutes, status, verified_by, verified_at)
     VALUES ($1, $2, CURRENT_DATE - 3, 120, 'verified', $3, now())`,
    [randomUUID(), volunteer, applicant],
  );

  console.log('\n--- the funnel ---');
  const f = await funnel();
  const delta = (key: string) =>
    (f.find((s) => s.key === key)?.count ?? 0) -
    (before.funnel.find((s) => s.key === key)?.count ?? 0);

  /*
   * At least, not exactly.
   *
   * These read `=== 4` and so on, which is right against a database nobody
   * else is touching. This one is production. Sixteen people registered in
   * one afternoon, one of them between the before and after snapshots, and
   * the probe reported a hole in the funnel that did not exist. A test that
   * fails when the association is busiest is worse than no test: it is the
   * one nobody believes the second time.
   *
   * Somebody else using the site can only push a step up, never down, so
   * `>=` still catches the failure worth catching — a step that does not
   * count what it should. Over-counting here is other people volunteering.
   */
  const atLeast = (key: string, n: number) => delta(key) >= n;
  check('four new accounts show at the top', atLeast('registered', 4), delta('registered'));
  check('three of them opened a course', atLeast('learning', 3), delta('learning'));
  check('two of those passed one', atLeast('passed', 2), delta('passed'));
  check('two applied', atLeast('applied', 2), delta('applied'));
  check('one was accepted', atLeast('accepted', 1), delta('accepted'));
  check('and one has verified hours', atLeast('contributing', 1), delta('contributing'));

  check(
    'every step is a number, not a string',
    f.every((s) => typeof s.count === 'number'),
    typeof f[0].count,
  );
  /*
   * Not one chain — two.
   *
   * This used to assert that all six steps shrink in order, and it passed only
   * because this probe's own fixtures padded the upper ones. On the
   * association's real data it is false, and not by accident: nobody has to
   * pass a course to volunteer. A volunteer of six years who claims their
   * roster record and never opens the academy reaches "applied" without ever
   * having been counted in "learning", so "passed" sitting above "applied" in
   * one list compares two populations that were never nested.
   *
   * Each track shrinks properly on its own, which is the property actually
   * worth holding. Asserting the six-step version instead would mean a probe
   * that only stays green while test fixtures happen to hide the shape of the
   * real data — which is how this went unnoticed in the first place.
   */
  const step = (key: string) => f.find((s) => s.key === key)?.count ?? 0;
  const shrinks = (track: string[]) =>
    track.every((k, i) => i === 0 || step(k) <= step(track[i - 1]));

  check(
    'the learning track never grows as it goes deeper',
    shrinks(['registered', 'learning', 'passed']),
    ['registered', 'learning', 'passed'].map(step).join(' > '),
  );
  check(
    'the volunteering track never grows as it goes deeper',
    shrinks(['registered', 'applied', 'accepted', 'contributing']),
    ['registered', 'applied', 'accepted', 'contributing'].map(step).join(' > '),
  );

  /*
   * Within the volunteering track, the step that actually broke: "applied"
   * counted volunteer_applications only, while a volunteer recognised from the
   * roster reaches "accepted" without ever filing one. All three of the
   * association's volunteers had come in that way, so the report showed more
   * people accepted than had asked. Counting both doors is the fix, and this
   * says so out loud.
   */
  const roster = await c.query<{ n: number }>(
    `SELECT count(DISTINCT claimed_by)::int AS n FROM volunteer_roster WHERE claimed_by IS NOT NULL`,
  );
  const applications = await c.query<{ n: number }>(
    `SELECT count(DISTINCT user_id)::int AS n FROM volunteer_applications`,
  );
  const applied = f.find((s) => s.key === 'applied')?.count ?? 0;
  check(
    'the applied step counts roster claims, not only application forms',
    applied >= roster.rows[0].n && applied >= applications.rows[0].n,
    `applied=${applied}, claims=${roster.rows[0].n}, applications=${applications.rows[0].n}`,
  );
  check(
    'nobody is accepted without appearing at the applied step',
    (f.find((s) => s.key === 'accepted')?.count ?? 0) <= applied,
  );

  console.log('\n--- courses ---');
  const courses = await courseStandings();
  const teamwork = courses.find((x) => x.course_slug === 'teamwork');
  check('the course appears', teamwork !== undefined);
  check('counts are numbers', typeof teamwork?.started === 'number', typeof teamwork?.started);

  /*
   * A delta, not an absolute.
   *
   * This assertion used to read `started === finished` against the global
   * count, which held only while the database contained nothing but this
   * probe's fixtures. One real volunteer with an attempt they never submitted
   * made `started` one higher than `finished` and the probe reported a hole in
   * a query that was working correctly. Every other section here already
   * measures against `before`; this one had been missed.
   */
  const wasTeamwork = before.courses.find((x) => x.course_slug === 'teamwork');
  const startedDelta = (teamwork?.started ?? 0) - (wasTeamwork?.started ?? 0);
  const finishedDelta = (teamwork?.finished ?? 0) - (wasTeamwork?.finished ?? 0);
  check(
    'the three who opened it count as three, and the one who tried twice counts once',
    startedDelta === 3 && finishedDelta === 3,
    `+${startedDelta} started / +${finishedDelta} finished`,
  );
  check('passed never exceeds finished', (teamwork?.passed ?? 0) <= (teamwork?.finished ?? 0));
  check(
    'the average best score is a number when anyone finished',
    typeof teamwork?.average_best === 'number',
    teamwork?.average_best,
  );

  console.log('\n--- stages ---');
  const stages = await stageStandings();
  check('the default journey has stages', stages.length > 0, stages.length);
  check(
    'each is numbered and named',
    stages.every((s) => typeof s.stage === 'number' && s.title_ar.length > 0),
  );
  check(
    'counts are numbers, and a stage nobody finished reports no median rather than zero',
    stages.every(
      (s) =>
        typeof s.in_stage === 'number' &&
        typeof s.completed === 'number' &&
        (s.median_days === null || typeof s.median_days === 'number'),
    ),
  );
  check(
    'the accepted volunteer is counted as working through stage 1',
    (stages.find((s) => s.stage === 1)?.in_stage ?? 0) >= 1,
    stages.find((s) => s.stage === 1)?.in_stage,
  );

  console.log('\n--- hours by month ---');
  const hours = await monthlyHours(12);
  check('this month is present', hours.length > 0);
  check('minutes are numbers', hours.every((m) => typeof m.minutes === 'number'));
  check('people are numbers', hours.every((m) => typeof m.people === 'number'));
  check(
    'months come back oldest first, so a chart reads left to right',
    hours.every((m, i) => i === 0 || m.month >= hours[i - 1].month),
  );

  console.log('\n--- turning up ---');
  await c.query(
    `INSERT INTO activities (id, title_ar, title_en, starts_at, ends_at, created_by)
     VALUES ($1, 'نشاط فحص', 'probe activity', now() - INTERVAL '2 days', now() - INTERVAL '1 day', $2)`,
    [(activity = randomUUID()), volunteer],
  );
  await c.query(
    `INSERT INTO activity_registrations (id, activity_id, user_id) VALUES ($1, $2, $3)`,
    [randomUUID(), activity, volunteer],
  );
  await c.query(
    `INSERT INTO activity_registrations (id, activity_id, user_id) VALUES ($1, $2, $3)`,
    [randomUUID(), activity, applicant],
  );
  // Cancelled in advance: not a no-show, and not a registration to judge.
  await c.query(
    `INSERT INTO activity_registrations (id, activity_id, user_id, cancelled_at, cancel_reason)
     VALUES ($1, $2, $3, now(), 'could not make it')`,
    [randomUUID(), activity, learner],
  );
  // Nobody marks their own attendance — chk_attendance_no_self, and quite right.
  await c.query(
    `INSERT INTO activity_attendance (id, activity_id, user_id, attended, confirmed_by)
     VALUES ($1, $2, $3, true, $4)`,
    [randomUUID(), activity, volunteer, justRegistered],
  );

  const att = await attendanceStanding();
  check(
    'the two live registrations are counted and the cancelled one is not',
    att.registered - before.attendance.registered === 2,
    att.registered - before.attendance.registered,
  );
  check('the one who came is counted', att.attended - before.attendance.attended === 1);
  check('the one who did not is a no-show', att.no_shows - before.attendance.no_shows === 1);
  check(
    'attended and no-shows account for every registration',
    att.attended + att.no_shows === att.registered,
    `${att.attended} + ${att.no_shows} vs ${att.registered}`,
  );

  console.log('\n--- who has gone quiet ---');
  const stalled = await stalledVolunteers();
  check('three thresholds are reported', stalled.length === 3, stalled.map((s) => s.days).join(','));
  check('counts are numbers', stalled.every((s) => typeof s.count === 'number'));
  check(
    'a longer silence can never count more people than a shorter one',
    stalled.every((s, i) => i === 0 || s.count <= stalled[i - 1].count),
    stalled.map((s) => `${s.days}d:${s.count}`).join(' '),
  );
  check(
    'someone who worked three days ago is not counted as quiet for thirty',
    (stalled.find((s) => s.days === 30)?.count ?? 0) ===
      (before.stalled.find((s) => s.days === 30)?.count ?? 0),
  );
} finally {
  console.log('\n--- cleanup ---');
  if (activity) {
    await guardedCleanup(
      c,
      [
        'DELETE FROM activity_attendance WHERE activity_id = $1',
        'DELETE FROM activity_registrations WHERE activity_id = $1',
      ],
      { params: [activity] },
    );
  }
  for (const id of made) {
    /*
     * Through the shared hatch. `audit_logs` is append-only since migration
     * 049, and the `.catch()` this loop used to carry would have swallowed the
     * refusal into a line nobody reads while the foreign key held the account
     * in the live database. See scripts/guarded-cleanup.mts.
     */
    await guardedCleanup(
      c,
      [
        'DELETE FROM hour_entries WHERE user_id = $1',
        'DELETE FROM course_attempts WHERE user_id = $1',
        'DELETE FROM volunteer_applications WHERE user_id = $1',
        'DELETE FROM membership_status_history WHERE user_id = $1',
        'DELETE FROM user_journey_assignments WHERE user_id = $1',
        'DELETE FROM stage_progress WHERE user_id = $1',
        'DELETE FROM notifications WHERE user_id = $1',
        'DELETE FROM audit_logs WHERE actor_id = $1',
        'DELETE FROM profiles WHERE user_id = $1',
      ],
      { params: [id] },
    );
  }
  if (activity) await c.query('DELETE FROM activities WHERE id = $1', [activity]).catch(() => {});
  for (const id of made) {
    await c.query('DELETE FROM users WHERE id = $1', [id]).catch((e) => console.error(`  users: ${e.message}`));
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
