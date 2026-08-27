/*
 * The unlocking rules, walked end to end by a real learner.
 *
 * Everything here goes through the same functions the pages call. A probe that
 * asserted against its own copy of the rules would pass while the site let
 * somebody into a locked course, which is the failure this exists to prevent.
 *
 * The learner is created, moved through the orientation and all of level 1,
 * and removed. Nothing else in the database is touched.
 *
 * ── THE RULE THIS NOW PINS ─────────────────────────────────────────────────
 *
 * A level used to close on the marked paper at the end of it. It closes on the
 * decision run now, and the paper is revision. So the assertions below are
 * about three things that all have to hold at once:
 *
 *   1. every course of the level that countsTowardsLevel, and
 *   2. a FINISHED run — or a paper passed before RUN_REQUIRED_FROM, which is
 *      the exemption for the people who closed a level under the old rule,
 *   3. EXCEPT level 0, which closes on the orientation alone.
 *
 * Point 3 is the sharpest trap in the change and is asserted twice: once as
 * behaviour, and once against chk_lcr_level itself, because requiring a run at
 * level 0 would demand a row the database refuses to hold and would therefore
 * have shut level 1 to every volunteer on the platform, for ever, with nothing
 * on any screen to explain it.
 *
 * ── WHY NO ROW IS EVER WRITTEN TO level_challenge_runs ─────────────────────
 *
 * Because it could never be removed again. Migration 042 puts a BEFORE DELETE
 * trigger on that table which refuses unconditionally — migration 045's
 * takaful_delete_allowed() escape hatch was given to achievements and
 * impact_points and NOT to this one — and level_challenge_runs.user_id is
 * ON DELETE RESTRICT, so a single probe run would also leave the throwaway
 * learner undeletable in a database that holds real volunteers. sweep.mts
 * could not clear either. No probe in this suite writes to a delete-refusing
 * table, and this one does not become the first.
 *
 * What that costs is nothing, because levelClosed, levelOpen and decide are
 * pure over a Snapshot — gate.ts says so in as many words — so a finished run
 * is expressed here by putting the level into snapshot.runs, exactly as
 * levelsWithFinishedRun would have. The half that genuinely needs the table is
 * the query that fills that set, and it is pinned by reading gate.ts as text:
 * it must ask whether the run is FINISHED and must never ask how it went.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
/* Source read through the shared reader: a CRLF checkout would otherwise let
 * the `\n}`-anchored slice below quietly return nothing, and the negative
 * assertion over it would pass. See scripts/source-text.mts. */
import { repoSource } from './source-text.mts';
import {
  snapshotFor,
  decide,
  accessToCourse,
  refreshLevelProgress,
  levelOpen,
  levelClosed,
  countsTowardsLevel,
  levelsWithFinishedRun,
  levelsClosedBeforeCutover,
  RUN_REQUIRED_FROM,
  type Snapshot,
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
const LEVEL_2 = ['life-skills', 'documentation-and-reporting', 'field-safety',
  'media-and-content', 'first-aid-basics'];
const CHALLENGE_1 = 'level-1-challenge';

/**
 * A day before the cutover, derived from RUN_REQUIRED_FROM rather than typed
 * out, so moving the cutover cannot leave this probe asserting about a date
 * that is no longer on the other side of it.
 */
const PRE_CUTOVER = new Date(Date.parse(RUN_REQUIRED_FROM) - 86_400_000).toISOString();

/** The kinds of Missing a refusal carried, for a detail line worth reading. */
const kinds = (missing: { kind: string }[]) =>
  missing.map((m) => m.kind).join(',') || 'nothing';

/**
 * The same picture, with the decision run for these levels finished.
 *
 * This is what levelsWithFinishedRun returns from the database, and it is a set
 * of LEVEL NUMBERS — there is no outcome in it and no field that could carry
 * one. Finishing closes the level; the verdict is not in the room.
 */
const withRun = (snapshot: Snapshot, ...levels: number[]): Snapshot => ({
  ...snapshot,
  runs: new Set([...snapshot.runs, ...levels]),
});

const gateSource = repoSource('src', 'lib', 'programme', 'gate.ts');

await c.connect();
const learner = randomUUID();

/**
 * Record a pass exactly as submitAttempt does.
 *
 * question_ids is non-empty on purpose: chk_attempt_questions refuses an
 * attempt that answered nothing unless it is a migrated row. The constraint
 * caught the first version of this probe, which is the constraint working.
 *
 * `submittedAt` exists for one reason: the grandfathering rule turns on when a
 * paper was submitted, so a probe that could only ever write now() could not
 * tell the two sides of RUN_REQUIRED_FROM apart.
 */
async function pass(slug: string, submittedAt?: string) {
  await c.query(
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, submitted_at,
                                  score, passed, pass_mark)
     VALUES ($1, $2, $3, ARRAY['probe-q1','probe-q2']::text[],
             COALESCE($4::timestamptz, now()), 100, TRUE, 70)`,
    [randomUUID(), learner, slug, submittedAt ?? null],
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
  check('level 0 is not closed until the orientation is passed', !levelClosed(snap, 0));
  check('level 1 is not open yet', !levelOpen(snap, 1));

  for (const slug of LEVEL_1) {
    const d = decide(snap, slug);
    check(`${slug} is locked`, !d.allowed);
    check(`  ...and names the orientation as what is missing`,
      d.missing.some((m) => m.kind === 'orientation'), kinds(d.missing));
  }

  const chal = decide(snap, CHALLENGE_1);
  check('the level 1 challenge paper is locked', !chal.allowed);
  check('and it names the courses, not a generic refusal', chal.missing.length > 0,
    `${chal.missing.length} requirement(s) listed`);

  console.log('\n--- what a level actually asks for ---');
  /*
   * The paper is still in the catalogue and still openable, and it no longer
   * counts towards its level. Asserted on the catalogue rather than on one
   * slug, so a seventh course of kind 'challenge' cannot slip past it.
   */
  const inLevel1 = snap.courses.filter((x) => x.level_number === 1);
  check('level 1 still holds its marked paper', inLevel1.some((x) => x.kind === 'challenge'));
  check('and the paper is the only thing in the level that does not count towards it',
    inLevel1.filter((x) => !countsTowardsLevel(x)).map((x) => x.slug).join(',') === CHALLENGE_1,
    inLevel1.filter((x) => !countsTowardsLevel(x)).map((x) => x.slug).join(',') || 'none');
  check('so the level asks for five courses, not six',
    inLevel1.filter(countsTowardsLevel).length === 5,
    inLevel1.filter(countsTowardsLevel).length);

  console.log('\n--- after passing the orientation: THE LEVEL 0 TRAP ---');
  await pass(ORIENTATION);
  snap = await snapshotFor(learner);
  /*
   * Level 0 closes on its own course and asks for no run. If it ever asks for
   * one, level 1 shuts for everybody: chk_lcr_level bounds level_number to
   * 1..6, so the row the gate would be waiting for cannot be written by
   * anybody, ever.
   */
  check('level 0 closes on the orientation alone, with no decision run',
    levelClosed(snap, 0) && snap.runs.size === 0, `${snap.runs.size} run(s) finished`);
  check('and level 1 therefore opens on the orientation alone', levelOpen(snap, 1));
  const bound = await c.query<{ def: string }>(
    `SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname = 'chk_lcr_level'`,
  );
  /*
   * Postgres stores the constraint normalised, so the migration's
   * "BETWEEN 1 AND 6" comes back as two comparisons. Both renderings are
   * accepted; what is asserted is the lower bound, which is the whole trap:
   * level_number cannot be 0, so a gate that demanded a run at level 0 would
   * be waiting on a row nobody could ever write.
   */
  const lcr = (bound.rows[0]?.def ?? '').replace(/\s+/g, ' ');
  check('the database could not hold a level 0 run even if the gate asked for one',
    /level_number >= 1/.test(lcr) || /BETWEEN 1 AND 6/i.test(lcr),
    lcr || 'chk_lcr_level is missing');

  for (const slug of LEVEL_1) {
    check(`${slug} is open`, decide(snap, slug).allowed, kinds(decide(snap, slug).missing));
  }
  check('the level 1 paper is still locked', !decide(snap, CHALLENGE_1).allowed);
  check('level 2 is still shut', !levelOpen(snap, 2));

  console.log('\n--- part way through level 1 ---');
  await pass('volunteering-foundations');
  await pass('communication-skills');
  snap = await snapshotFor(learner);
  const partial = decide(snap, CHALLENGE_1);
  check('the paper lists only what is still missing', partial.missing.length === 3,
    partial.missing.map((m) => ('slug' in m ? m.slug : m.kind)).join(', '));
  check('and does not list the two already passed',
    !partial.missing.some((m) => 'slug' in m
      && ['volunteering-foundations', 'communication-skills'].includes(m.slug)),
    partial.missing.map((m) => ('slug' in m ? m.slug : m.kind)).join(', '));
  /*
   * A course outstanding is named as a course. Never the run: the run page
   * refuses anybody whose level is not behind them, so sending them there
   * would be sending them to a door that does not open.
   */
  const earlyNext = decide(snap, 'life-skills');
  check('a level 2 course is refused', !earlyNext.allowed);
  check('and blames an unfinished level 1 COURSE, never the run',
    earlyNext.missing.some((m) => m.kind === 'course' && m.level === 1)
    && !earlyNext.missing.some((m) => m.kind === 'decision-run'),
    kinds(earlyNext.missing));

  console.log('\n--- all five courses passed, and no run walked ---');
  for (const slug of LEVEL_1.slice(2)) await pass(slug);
  snap = await snapshotFor(learner);
  check('the paper opens, because it is revision and revision is allowed',
    decide(snap, CHALLENGE_1).allowed, kinds(decide(snap, CHALLENGE_1).missing));
  check('no decision run is finished for this learner',
    (await levelsWithFinishedRun(learner)).size === 0);
  check('level 1 is NOT closed on the courses alone', !levelClosed(snap, 1));
  check('and level 2 is NOT open', !levelOpen(snap, 2));
  const outstanding = decide(snap, 'life-skills');
  const onlyReason = outstanding.missing[0];
  check('a level 2 course is still refused', !outstanding.allowed);
  check('and now names the decision run for level 1, and only that',
    outstanding.missing.length === 1
    && onlyReason?.kind === 'decision-run' && onlyReason.level === 1,
    outstanding.missing.map((m) => `${m.kind}${'level' in m ? `:${m.level}` : ''}`).join(','));

  // level_progress is written by nothing in src/ — probe-gate drives it here on
  // purpose, and a green line below is not evidence that the table is live.
  const early = await refreshLevelProgress(learner);
  check('level 1 is not recorded as finished before the run',
    !early.includes(1), early.join(',') || 'none recorded');
  check('level 0 is recorded, because it needed no run', early.includes(0), early.join(','));

  console.log('\n--- the same learner, with the run finished ---');
  const ran = withRun(snap, 1);
  check('the level closes', levelClosed(ran, 1));
  check('and it closes without the marked paper being passed at all',
    !ran.passed.has(CHALLENGE_1), 'the paper is revision now');
  check('level 2 opens', levelOpen(ran, 2));
  check('a level 2 course is reachable', decide(ran, 'life-skills').allowed,
    kinds(decide(ran, 'life-skills').missing));
  /*
   * FINISHING is what closes it, not the verdict. There is no outcome in the
   * snapshot to gate on — runs is a set of level numbers — and the query that
   * fills it must never grow one, or a volunteer who walked a hard run to the
   * end would be held back by the thing the exercise exists to surface.
   */
  const runQuery = /export async function levelsWithFinishedRun[\s\S]*?\n}/.exec(gateSource)?.[0] ?? '';
  /*
   * CONTROL, before the two checks that depend on it. The second of them is a
   * negative — "never asks how it went" — and `!/outcome/.test('')` is true, so
   * a slice that found nothing would report the guarantee as kept.
   */
  check('CONTROL: the levelsWithFinishedRun body was actually found and read',
    runQuery.length > 100 && /SELECT/i.test(runQuery),
    runQuery.length === 0
      ? 'read nothing — "never asks how it went" below would pass vacuously'
      : `${runQuery.length} chars`);
  check('the gate reads that set from the runs table', /level_challenge_runs/.test(runQuery));
  check('and asks only whether the run is finished, never how it went',
    /finished_at IS NOT NULL/.test(runQuery) && !/outcome/.test(runQuery),
    'a review verdict closes a level exactly as a clear one does');

  console.log('\n--- the marked paper, passed after the cutover ---');
  const late = Date.now() >= Date.parse(RUN_REQUIRED_FROM);
  check('this probe is running after the cutover, so a pass recorded now is a late one',
    late, `now ${new Date().toISOString()} vs cutover ${RUN_REQUIRED_FROM}`);
  await pass(CHALLENGE_1);
  snap = await snapshotFor(learner);
  check('the paper is recorded as passed', snap.passed.has(CHALLENGE_1));
  check('but it grandfathers nothing', !snap.grandfathered.has(1),
    [...snap.grandfathered].join(',') || 'no level grandfathered');
  check('so the level is STILL not closed', !levelClosed(snap, 1));
  check('and level 2 is STILL shut', !levelOpen(snap, 2));
  const stillShut = await refreshLevelProgress(learner);
  check('and nothing is recorded as finished on the strength of it',
    !stillShut.includes(1), stillShut.join(',') || 'none recorded');

  console.log('\n--- a paper passed BEFORE the cutover, which still closes a level ---');
  /*
   * Two people closed level 1 under the old rule. Re-locking them would be the
   * platform taking back something it had already given, so a pass submitted
   * before RUN_REQUIRED_FROM still closes its level — and only that pass does.
   */
  await pass(CHALLENGE_1, PRE_CUTOVER);
  snap = await snapshotFor(learner);
  check('the pre-cutover pass is found', (await levelsClosedBeforeCutover(learner)).has(1),
    PRE_CUTOVER);
  check('level 1 is closed by it', levelClosed(snap, 1));
  check('with no decision run anywhere', snap.runs.size === 0);
  check('level 2 opens', levelOpen(snap, 2));
  const recorded = await refreshLevelProgress(learner);
  check('and level 1 is recorded as finished', recorded.includes(1), recorded.join(','));

  console.log('\n--- level 2, and the run named one level up ---');
  check('a level 2 course is now reachable', decide(snap, 'life-skills').allowed,
    kinds(decide(snap, 'life-skills').missing));
  check('level 3 is still shut', !levelOpen(snap, 3));
  const l3 = decide(snap, 'team-leadership');
  check('a level 3 course is refused', !l3.allowed);
  check('and blames an unfinished level 2 course, not a run nobody may open yet',
    l3.missing.some((m) => m.kind === 'course' && m.level === 2)
    && !l3.missing.some((m) => m.kind === 'decision-run'),
    l3.missing.map((m) => `${m.kind}${'level' in m ? `:${m.level}` : ''}`).join(','));

  for (const slug of LEVEL_2) await pass(slug);
  snap = await snapshotFor(learner);
  check('with level 2\'s courses behind them, level 2 is still not closed',
    !levelClosed(snap, 2));
  const l3again = decide(snap, 'team-leadership');
  const only3 = l3again.missing[0];
  check('and the level 3 refusal now names the level 2 decision run',
    l3again.missing.length === 1
    && only3?.kind === 'decision-run' && only3.level === 2,
    l3again.missing.map((m) => `${m.kind}${'level' in m ? `:${m.level}` : ''}`).join(','));
  const ran2 = withRun(snap, 2);
  check('finishing level 2\'s run closes it', levelClosed(ran2, 2));
  check('and opens level 3', levelOpen(ran2, 3));
  check('a level 3 course is then reachable', decide(ran2, 'team-leadership').allowed,
    kinds(decide(ran2, 'team-leadership').missing));

  console.log('\n--- recording a level twice ---');
  const again = await refreshLevelProgress(learner);
  check('re-running reports nothing newly completed', again.length === 0,
    again.join(',') || 'none');
  // Two rows is correct: level 0 (the orientation) and level 1. Level 2 has no
  // run and no pre-cutover paper, so it is not finished and has no row.
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
  /*
   * Nothing here writes a decision run, and this says so out loud: a row in
   * that table could not be deleted afterwards, and it would hold the learner
   * down with it. See the head of this file.
   */
  const runs = await c.query(
    'SELECT count(*)::int AS n FROM level_challenge_runs WHERE user_id = $1', [learner]);
  console.log(`  ${runs.rows[0].n} decision run(s) left behind (expected 0, and none is ever written)`);
  await c.end();
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
