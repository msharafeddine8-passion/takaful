/**
 * The academy: what the database refuses to record, and what the attempt
 * ledger says once it has.
 *
 * These write real rows and clean up afterwards rather than rolling back,
 * because the library functions under test read through the application's
 * connection pool and cannot see an uncommitted transaction.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import {
  questionsIn,
  startOrResumeAttempt,
  openAttemptFor,
  recordAnswer,
  submitAttempt,
  markModuleRead,
  completedModules,
  attemptHistory,
  ensureCourseCertificate,
  unissuedCourseCertificates,
  learningStanding,
} from '../src/lib/academy.ts';
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

const MARK = `acd-${Date.now()}`;
const SLUG = 'volunteering-foundations';
const questions = questionsIn(SLUG);
const learner = randomUUID();

try {
  await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [
    learner,
    `${MARK}@example.test`,
    'x',
  ]);
  await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [learner, 'متعلّم']);
  await c.query(
    `INSERT INTO membership_status_history (user_id, new_status) VALUES ($1, 'registered_user')`,
    [learner],
  );

  console.log(`\ncourse has ${questions.length} questions`);

  console.log('\n--- what the ledger refuses ---');
  await mustFail(
    'a pass with no score',
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, pass_mark, submitted_at, passed)
     VALUES ($1, $2, $3, ARRAY['q'], 70, now(), true)`,
    [randomUUID(), learner, SLUG],
  );
  await mustFail(
    'a pass below the pass mark it was graded against',
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, pass_mark, submitted_at, score, passed)
     VALUES ($1, $2, $3, ARRAY['q'], 70, now(), 40, true)`,
    [randomUUID(), learner, SLUG],
  );
  await mustFail(
    'a score on an attempt still open',
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, pass_mark, score)
     VALUES ($1, $2, $3, ARRAY['q'], 70, 90)`,
    [randomUUID(), learner, SLUG],
  );
  await mustFail(
    'a score of 130',
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, pass_mark, submitted_at, score)
     VALUES ($1, $2, $3, ARRAY['q'], 70, now(), 130)`,
    [randomUUID(), learner, SLUG],
  );
  await mustFail(
    'a real attempt with no pass mark recorded',
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids)
     VALUES ($1, $2, $3, ARRAY['q'])`,
    [randomUUID(), learner, SLUG],
  );
  await mustFail(
    'a real attempt that asked no questions',
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, pass_mark)
     VALUES ($1, $2, $3, '{}'::TEXT[], 70)`,
    [randomUUID(), learner, SLUG],
  );

  console.log('\n--- starting an attempt ---');
  const a1 = await startOrResumeAttempt(learner, SLUG);
  check('an attempt opens', a1 !== null);
  check('it asks every question in the course', a1?.question_ids.length === questions.length, a1?.question_ids.length);
  check(
    'and it freezes an option order for each of them',
    questions.every((q) => Array.isArray(a1?.option_order[q.id])),
  );
  check(
    'the order is a permutation, not a truncation',
    questions.every((q) => {
      const o = a1!.option_order[q.id];
      return o.length === q.options.length && new Set(o).size === o.length;
    }),
  );
  check('the pass mark is stored with the attempt', a1?.pass_mark === 70, a1?.pass_mark);

  const a2 = await startOrResumeAttempt(learner, SLUG);
  check('opening it again resumes rather than reshuffling', a1?.id === a2?.id);
  check(
    'and the option order is identical, so a reload cannot reroll a question',
    JSON.stringify(a1?.option_order) === JSON.stringify(a2?.option_order),
  );

  await mustFail(
    'a second attempt while one is still open',
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, pass_mark)
     VALUES ($1, $2, $3, ARRAY['q'], 70)`,
    [randomUUID(), learner, SLUG],
  );

  console.log('\n--- answering ---');
  const q0 = questions[0];
  const order0 = a1!.option_order[q0.id];
  const rightSlot = order0.indexOf(q0.correct);
  const wrongSlot = rightSlot === 0 ? 1 : 0;

  const wrong = await recordAnswer(learner, SLUG, q0.id, wrongSlot, 'ar');
  check('a wrong answer is reported wrong', wrong.ok && !wrong.correct);
  check('and it comes back with the explanation', wrong.ok && wrong.feedback.length > 0);

  const retry = await recordAnswer(learner, SLUG, q0.id, rightSlot, 'ar');
  check(
    'answering again after seeing the feedback does not change the verdict',
    retry.ok && !retry.correct && retry.already,
  );
  const stored = await openAttemptFor(learner, SLUG);
  check(
    'and the first answer is what the ledger holds',
    stored?.answers[q0.id] === order0[wrongSlot],
    stored?.answers[q0.id],
  );

  const bad = await recordAnswer(learner, SLUG, questions[1].id, 99, 'ar');
  check('an option that was never shown is refused', !bad.ok && bad.reason === 'bad_choice');
  const ghost = await recordAnswer(learner, SLUG, 'no-such-question', 0, 'ar');
  check('a question that is not in the course is refused', !ghost.ok && ghost.reason === 'unknown_question');

  console.log('\n--- grading ---');
  const g1 = await submitAttempt(learner, SLUG);
  const expected = Math.round((0 / questions.length) * 100);
  check('unanswered questions count as wrong', g1?.score === expected, g1?.score);
  check('and a score under the mark does not pass', g1?.passed === false);
  check('the attempt is closed', (await openAttemptFor(learner, SLUG)) === null);
  check('submitting again finds nothing to submit', (await submitAttempt(learner, SLUG)) === null);

  console.log('\n--- a second, correct attempt ---');
  const a3 = await startOrResumeAttempt(learner, SLUG);
  check('a finished attempt does not block a new one', a3 !== null && a3.id !== a1!.id);
  for (const q of questions) {
    const order = a3!.option_order[q.id];
    await recordAnswer(learner, SLUG, q.id, order.indexOf(q.correct), 'ar');
  }
  const g2 = await submitAttempt(learner, SLUG);
  check('every answer right scores 100', g2?.score === 100, g2?.score);
  check('and that passes', g2?.passed === true);

  console.log('\n--- what course_progress now says ---');
  const cp = (
    await c.query<{ score: number; passed: boolean; attempts: number; completed_at: Date | null }>(
      'SELECT score, passed, attempts, completed_at FROM course_progress WHERE user_id = $1 AND course_slug = $2',
      [learner, SLUG],
    )
  ).rows[0];
  check('it keeps the best score, not the last', cp?.score === 100, cp?.score);
  check('it counts both sittings', cp?.attempts === 2, cp?.attempts);
  check('attempts is a number, not a string', typeof cp?.attempts === 'number', typeof cp?.attempts);
  check('and it records when the pass happened', cp?.completed_at !== null);

  const history = await attemptHistory(learner, SLUG);
  check('the history shows both, newest first', history.length === 2 && history[0].passed);
  check('the failed one is still there — a pass does not erase the road to it', history[1].passed === false);

  await mustFail(
    'writing to course_progress directly',
    `INSERT INTO course_progress (user_id, course_slug, score, passed) VALUES ($1, $2, 100, true)`,
    [learner, SLUG],
  );

  console.log('\n--- certificates ---');
  const code = await ensureCourseCertificate(learner, SLUG, 'متعلّم');
  check('passing earns a certificate', typeof code === 'string' && code.startsWith('TKF-'), code);
  const again = await ensureCourseCertificate(learner, SLUG, 'متعلّم');
  check('calling again does not issue a second one', again === null);
  check('and nothing is left owed', (await unissuedCourseCertificates(learner)).length === 0);

  const stranger = randomUUID();
  check(
    'someone who never passed is owed nothing',
    (await unissuedCourseCertificates(stranger)).length === 0,
  );

  console.log('\n--- where they stopped reading ---');
  await markModuleRead(learner, SLUG, 'made-up-module');
  check(
    'a module that does not exist is not recorded',
    (await completedModules(learner, SLUG)).length === 0,
  );
  const realModule = questions[0].moduleId;
  await markModuleRead(learner, SLUG, realModule);
  await markModuleRead(learner, SLUG, realModule);
  const read = await completedModules(learner, SLUG);
  check('a real one is, once', read.length === 1 && read[0] === realModule, read.join(','));

  console.log('\n--- the account page view of all this ---');
  const standing = await learningStanding(learner);
  const s = standing.get(SLUG);
  check('the course they worked on is there', s !== undefined);
  check('with both attempts counted', s?.attempts === 2, s?.attempts);
  check('attempts is a number', typeof s?.attempts === 'number', typeof s?.attempts);
  check('best score is the best, not the last', s?.best_score === 100, s?.best_score);
  check('and it knows they passed', s?.passed === true);
  check('modules read is a number, not a string', typeof s?.modules_read === 'number', typeof s?.modules_read);
  check('and counts the one they finished', s?.modules_read === 1, s?.modules_read);
  check('no open attempt is reported once both are submitted', s?.open_answered === null, String(s?.open_answered));
  check('a course never touched is absent, not zeroed', standing.get('teamwork') === undefined);

  // A course read but never attempted must still appear, which is what the
  // full outer join is for — an inner join would hide it.
  await markModuleRead(learner, 'teamwork', questionsIn('teamwork')[0].moduleId);
  const standing2 = await learningStanding(learner);
  const readOnly = standing2.get('teamwork');
  check('a course read but not attempted still shows up', readOnly !== undefined);
  check('with no attempts', readOnly?.attempts === 0, readOnly?.attempts);
  check('and not marked passed', readOnly?.passed === false);
  check('and its module counted', readOnly?.modules_read === 1, readOnly?.modules_read);

  // And an attempt still open must report how far in they are.
  await startOrResumeAttempt(learner, 'teamwork');
  const tq = questionsIn('teamwork')[0];
  const tOrder = (await openAttemptFor(learner, 'teamwork'))!.option_order[tq.id];
  await recordAnswer(learner, 'teamwork', tq.id, tOrder.indexOf(tq.correct), 'ar');
  const standing3 = await learningStanding(learner);
  check(
    'an open attempt reports how many questions are answered so far',
    standing3.get('teamwork')?.open_answered === 1,
    standing3.get('teamwork')?.open_answered,
  );
} finally {
  console.log('\n--- cleanup ---');
  /*
   * Through the shared hatch: `audit_logs` is append-only since migration 049
   * and refuses this DELETE outside a transaction that has asked for the
   * exception by name. A bare sequence also stopped at the first failure, so
   * the refusal would have taken the profile, the user and the residue check
   * with it. See scripts/guarded-cleanup.mts for both traps.
   */
  await guardedCleanup(
    c,
    [
      'DELETE FROM certificates WHERE user_id = $1',
      'DELETE FROM course_module_progress WHERE user_id = $1',
      'DELETE FROM course_attempts WHERE user_id = $1',
      'DELETE FROM audit_logs WHERE actor_id = $1',
      'DELETE FROM membership_status_history WHERE user_id = $1',
      'DELETE FROM user_journey_assignments WHERE user_id = $1',
      'DELETE FROM profiles WHERE user_id = $1',
      'DELETE FROM users WHERE id = $1',
    ],
    { params: [learner] },
  );
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
