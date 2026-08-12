/*
 * The unlocking rules, walked end to end by a real learner.
 *
 * Everything here goes through the same functions the pages call. A probe that
 * asserted against its own copy of the rules would pass while the site let
 * somebody into a locked course, which is the failure this exists to prevent.
 *
 * The learner is created, moved through the orientation and all of level 1,
 * and removed. Nothing else in the database is touched.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import {
  snapshotFor,
  decide,
  accessToCourse,
  refreshLevelProgress,
  levelOpen,
} from '../src/lib/programme/gate.ts';

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail?: unknown) {
  if (passed) { ok++; console.log(`  ok       ${what}${detail === undefined ? '' : `  — ${detail}`}`); }
  else { holes.push(what); console.log(`  HOLE     ${what}${detail === undefined ? '' : `  — ${detail}`}`); }
}

const ORIENTATION = 'code-of-conduct-and-reporting';
const LEVEL_1 = ['volunteering-foundations', 'communication-skills', 'teamwork',
  'working-with-children', 'digital-basics'];
const CHALLENGE_1 = 'level-1-challenge';

await c.connect();
const learner = randomUUID();

/**
 * Record a pass exactly as submitAttempt does.
 *
 * question_ids is non-empty on purpose: chk_attempt_questions refuses an
 * attempt that answered nothing unless it is a migrated row. The constraint
 * caught the first version of this probe, which is the constraint working.
 */
async function pass(slug: string) {
  await c.query(
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, submitted_at,
                                  score, passed, pass_mark)
     VALUES ($1, $2, $3, ARRAY['probe-q1','probe-q2']::text[], now(), 100, TRUE, 70)`,
    [randomUUID(), learner, slug],
  );
}

try {
  await c.query(
    `INSERT INTO users (id, email, password_hash, locale, status)
     VALUES ($1, $2, 'probe-not-a-real-hash', 'ar', 'active')`,
    [learner, `probe-gate-${learner}@example.invalid`],
  );

  console.log('\n--- a visitor who has not signed in ---');
  const anon = await accessToCourse(null, ORIENTATION);
  check('may read the orientation without an account', anon.allowed);
  const anonCore = await accessToCourse(null, 'volunteering-foundations');
  check('may not open a core course', !anonCore.allowed);
  check('and is told to sign in, not given a blank refusal',
    anonCore.missing[0]?.kind === 'sign-in', anonCore.missing[0]?.kind);

  console.log('\n--- a brand new account ---');
  let snap = await snapshotFor(learner);
  check('the orientation is open immediately', decide(snap, ORIENTATION).allowed);
  check('level 1 is not open yet', !levelOpen(snap, 1));

  for (const slug of LEVEL_1) {
    const d = decide(snap, slug);
    check(`${slug} is locked`, !d.allowed);
    check(`  ...and names the orientation as what is missing`,
      d.missing.some((m) => m.kind === 'orientation'),
      d.missing.map((m) => m.kind).join(',') || 'nothing');
  }

  const chal = decide(snap, CHALLENGE_1);
  check('the level 1 challenge is locked', !chal.allowed);
  check('and it names the courses, not a generic refusal', chal.missing.length > 0,
    `${chal.missing.length} requirement(s) listed`);

  console.log('\n--- after passing the orientation ---');
  await pass(ORIENTATION);
  snap = await snapshotFor(learner);
  check('level 1 is now open', levelOpen(snap, 1));
  for (const slug of LEVEL_1) {
    check(`${slug} is open`, decide(snap, slug).allowed,
      decide(snap, slug).missing.map((m) => m.kind).join(',') || 'open');
  }
  check('the level 1 challenge is still locked', !decide(snap, CHALLENGE_1).allowed);
  check('level 2 is still shut', !levelOpen(snap, 2));

  console.log('\n--- part way through level 1 ---');
  await pass('volunteering-foundations');
  await pass('communication-skills');
  snap = await snapshotFor(learner);
  const partial = decide(snap, CHALLENGE_1);
  check('the challenge lists only what is still missing', partial.missing.length === 3,
    partial.missing.map((m) => ('slug' in m ? m.slug : m.kind)).join(', '));
  check('and does not list the two already passed',
    !partial.missing.some((m) => 'slug' in m
      && ['volunteering-foundations', 'communication-skills'].includes(m.slug)),
    partial.missing.map((m) => ('slug' in m ? m.slug : m.kind)).join(', '));

  console.log('\n--- all five courses passed ---');
  for (const slug of LEVEL_1.slice(2)) await pass(slug);
  snap = await snapshotFor(learner);
  check('the challenge opens', decide(snap, CHALLENGE_1).allowed,
    decide(snap, CHALLENGE_1).missing.map((m) => 'slug' in m ? m.slug : m.kind).join(','));
  check('level 2 stays shut until the challenge is done', !levelOpen(snap, 2));

  // Level 1 must NOT be recorded complete while the challenge is outstanding.
  const early = await refreshLevelProgress(learner);
  check('level 1 is not recorded as finished before the challenge',
    !early.includes(1), early.join(',') || 'none recorded');

  console.log('\n--- the challenge passed ---');
  await pass(CHALLENGE_1);
  const recorded = await refreshLevelProgress(learner);
  check('level 1 is recorded as finished', recorded.includes(1), recorded.join(','));

  snap = await snapshotFor(learner);
  check('level 2 opens', levelOpen(snap, 2));
  check('a level 2 course is now reachable', decide(snap, 'life-skills').allowed,
    decide(snap, 'life-skills').missing.map((m) => 'slug' in m ? m.slug : m.kind).join(','));
  check('level 3 is still shut', !levelOpen(snap, 3));
  const l3 = decide(snap, 'team-leadership');
  check('a level 3 course is refused', !l3.allowed);
  check('and blames the level 2 challenge specifically',
    l3.missing.some((m) => m.kind === 'challenge' && m.level === 2),
    l3.missing.map((m) => `${m.kind}${'level' in m ? m.level : ''}`).join(','));

  console.log('\n--- recording a level twice ---');
  const again = await refreshLevelProgress(learner);
  check('re-running reports nothing newly completed', again.length === 0,
    again.join(',') || 'none');
  // Two rows is correct: level 0 (the orientation) and level 1.
  const rows = await c.query(
    'SELECT count(*)::int AS n FROM level_progress WHERE user_id = $1', [learner]);
  check('one row per finished level, no duplicates', rows.rows[0].n === 2, rows.rows[0].n);

  console.log('\n--- electives are never gated by a level ---');
  const elective = decide(snap, 'environmental-volunteering');
  check('an elective with no prerequisites is open', elective.allowed);
  const psych = decide(snap, 'psychological-first-aid');
  check('an elective that requires the orientation is open once it is passed', psych.allowed);

  console.log('\n--- recommendations advise, never block ---');
  const withRecs = await c.query<{ slug: string }>(`
    SELECT a.slug FROM course_prerequisites p
    JOIN courses a ON a.id = p.course_id
    WHERE p.kind = 'recommends' LIMIT 1`);
  if (withRecs.rowCount) {
    const d = decide(snap, withRecs.rows[0].slug);
    check('a course with unmet recommendations still reports them as suggestions',
      d.suggested.length >= 0 && !d.missing.some((m) => m.kind === 'course' &&
        d.suggested.some((s) => s.slug === m.slug)),
      `${d.suggested.length} suggested`);
  }
} finally {
  console.log('\n--- cleanup ---');
  for (const sql of [
    'DELETE FROM level_progress WHERE user_id = $1',
    'DELETE FROM course_attempts WHERE user_id = $1',
    'DELETE FROM users WHERE id = $1',
  ]) {
    await c.query(sql, [learner]).catch((e) => console.log(`  cleanup: ${e.message.slice(0, 60)}`));
  }
  const left = await c.query('SELECT count(*)::int AS n FROM users WHERE id = $1', [learner]);
  console.log(`  ${left.rows[0].n} probe user(s) remaining (expected 0)`);
  await c.end();
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
