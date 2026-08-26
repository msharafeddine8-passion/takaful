/*
 * The four credential layers, earned by one learner from nothing.
 *
 * The assertions that matter most are the negative ones: that a credential
 * cannot be issued for work not done, that issuing twice produces one
 * certificate, and that a revoked level pulls the ground out from under the
 * path credential that depended on it.
 *
 * ── WHAT A LEVEL CERTIFICATE NOW ATTESTS ───────────────────────────────────
 *
 * Not the marked paper. Every course of the level that counts towards it, and
 * a FINISHED decision run — or, for the two people who closed a level before
 * RUN_REQUIRED_FROM, the paper they passed under the old rule. Passing that
 * paper today earns nothing: not a level credential, and not a certificate of
 * its own either, because the paper is revision now.
 *
 * ── WHY NO DECISION RUN IS WRITTEN HERE ────────────────────────────────────
 *
 * Migration 042 puts a BEFORE DELETE trigger on level_challenge_runs that
 * refuses unconditionally — 045's takaful_delete_allowed() hatch was given to
 * achievements and impact_points and not to that table — and its user_id is
 * ON DELETE RESTRICT. One inserted run would therefore be permanent in a
 * production database, and would hold the throwaway learner in the users table
 * with it, where the association's own reports count them. No probe in this
 * suite writes to a delete-refusing table.
 *
 * So the run arm of the rule is pinned by reading credentials.ts as text, and
 * what it pins is the sharp part: the issuer asks whether the run FINISHED and
 * never asks what it concluded. An outcome of 'review' earns the certificate
 * exactly as 'clear' does — not because some fixture happened to say so, but
 * because there is no expression anywhere in the issuer that could read a
 * verdict at all. The half that can be driven against real rows — every course
 * passed and still refused, the late paper refused, the pre-cutover paper
 * accepted — is driven against real rows below.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import {
  issueCourseCredential,
  issueLevelCredential,
  issueProgrammeCredential,
  issueEarnedCredentials,
  revokeCredential,
} from '../src/lib/programme/credentials.ts';
import { ensureCourseCertificate, unissuedCourseCertificates } from '../src/lib/academy.ts';
import { RUN_REQUIRED_FROM } from '../src/lib/programme/gate.ts';
import { findByCode, normaliseCode, generateCode } from '../src/lib/certificates.ts';

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
const HOLDER = 'متطوّع الاختبار';

/** A day before the cutover, derived so a moved cutover cannot strand it. */
const PRE_CUTOVER = new Date(Date.parse(RUN_REQUIRED_FROM) - 86_400_000).toISOString();

const REPO = fileURLToPath(new URL('..', import.meta.url));
/*
 * Line endings normalised on the way in. The repository checks out CRLF on
 * Windows, and the first version of the reads below anchored on "\n}\n" — which
 * matches nothing in a CRLF file, so five assertions about the issuer went red
 * while the issuer was perfectly correct. A probe that fails on a line ending
 * teaches the next person to distrust it.
 */
const credentialsSource = readFileSync(
  join(REPO, 'src', 'lib', 'programme', 'credentials.ts'), 'utf8').replace(/\r\n/g, '\n');

/** The file with its prose removed, so an assertion is about code, not comments. */
const codeOf = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');

await c.connect();
const learner = randomUUID();

async function pass(slug: string, submittedAt?: string) {
  await c.query(
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, submitted_at,
                                  score, passed, pass_mark)
     VALUES ($1, $2, $3, ARRAY['q1','q2']::text[],
             COALESCE($4::timestamptz, now()), 100, TRUE, 70)`,
    [randomUUID(), learner, slug, submittedAt ?? null],
  );
}

try {
  await c.query(
    `INSERT INTO users (id, email, password_hash, locale, status)
     VALUES ($1, $2, 'probe-not-a-real-hash', 'ar', 'active')`,
    [learner, `probe-cred-${learner}@example.invalid`],
  );
  await c.query(
    `INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)`,
    [learner, HOLDER],
  );

  console.log('\n--- codes ---');
  const codes = new Set(Array.from({ length: 500 }, () => generateCode()));
  check('500 generated codes are all distinct', codes.size === 500, codes.size);
  const sample = generateCode();
  check('the format is TKF and three groups of four', /^TKF(-[234679ACDEFGHJKMNPQRTUVWXYZ]{4}){3}$/.test(sample), sample);
  check('a code typed in lower case with spaces still normalises',
    normaliseCode(sample.toLowerCase().replace(/-/g, ' ')) === sample,
    normaliseCode(sample.toLowerCase().replace(/-/g, ' ')));

  console.log('\n--- nothing is issued that was not earned ---');
  check('no credential for a course never attempted',
    (await issueCourseCredential(learner, ORIENTATION)) === null);
  check('no level credential before any course',
    (await issueLevelCredential(learner, 1)) === null);
  check('no path credential before any level',
    (await issueProgrammeCredential(learner)) === null);

  console.log('\n--- the orientation ---');
  await pass(ORIENTATION);
  const orient = await issueCourseCredential(learner, ORIENTATION);
  check('a credential is issued once it is passed', orient?.created === true, orient?.code);
  const orientRow = await findByCode(orient!.code);
  check('and its kind is orientation, not course', orientRow?.kind === 'orientation', orientRow?.kind);
  check('the holder name is frozen into the snapshot',
    orientRow?.snapshot.fullName === HOLDER, orientRow?.snapshot.fullName);
  check('the skills are frozen too', (orientRow?.snapshot.skillsAr?.length ?? 0) >= 3,
    orientRow?.snapshot.skillsAr?.length);
  check('learning minutes are recorded', (orientRow?.learning_minutes ?? 0) > 0,
    orientRow?.learning_minutes);

  const again = await issueCourseCredential(learner, ORIENTATION);
  check('issuing twice returns the same certificate', again?.created === false
    && again?.code === orient?.code, again?.code);
  const countOrient = await c.query(
    `SELECT count(*)::int AS n FROM certificates WHERE user_id = $1 AND course_slug = $2`,
    [learner, ORIENTATION]);
  check('exactly one row exists for it', countOrient.rows[0].n === 1, countOrient.rows[0].n);

  console.log('\n--- level 1: every course passed, and still refused ---');
  for (const slug of LEVEL_1) await pass(slug);
  /*
   * The five courses are the whole of what the level teaches, and they are not
   * enough. This is the reversal: what the certificate now attests is the
   * decision run, and the run has not been walked.
   */
  check('the level credential refuses with every course of the level passed',
    (await issueLevelCredential(learner, 1)) === null,
    'the decision run has not been finished');

  console.log('\n--- the marked paper, passed after the cutover ---');
  const late = Date.now() >= Date.parse(RUN_REQUIRED_FROM);
  check('this probe runs after the cutover, so a pass recorded now is a late one',
    late, `now ${new Date().toISOString()} vs cutover ${RUN_REQUIRED_FROM}`);
  await pass(CHALLENGE_1);
  check('the paper still earns no credential of its own',
    (await issueCourseCredential(learner, CHALLENGE_1)) === null);
  check('and it does not earn the level either',
    (await issueLevelCredential(learner, 1)) === null,
    'passing the paper today must open nothing, or the old route is still open');

  /*
   * ensureCourseCertificate is the other issuer — the one completeCourseAction
   * calls on every pass. It said nothing about challenges until recently, so
   * passing the paper minted a kind='course' certificate for it anyway and two
   * of those are live in production. The rule existed in one file and was
   * contradicted from another; this is the assertion that keeps them together.
   */
  console.log('\n--- the paper earns no certificate from the other issuer either ---');
  check('ensureCourseCertificate returns null for the paper',
    (await ensureCourseCertificate(learner, CHALLENGE_1, HOLDER)) === null);
  const paperRows = await c.query(
    `SELECT count(*)::int AS n FROM certificates
      WHERE user_id = $1 AND course_slug = $2 AND kind = 'course'`,
    [learner, CHALLENGE_1]);
  check('and it wrote no course certificate row for it', paperRows.rows[0].n === 0,
    paperRows.rows[0].n);
  const owed = await unissuedCourseCertificates(learner);
  check('nor is the paper listed as a certificate the platform still owes',
    !owed.includes(CHALLENGE_1), owed.join(',') || 'nothing owed');

  console.log('\n--- a paper passed BEFORE the cutover, which still earns the level ---');
  await pass(CHALLENGE_1, PRE_CUTOVER);
  const level1 = await issueLevelCredential(learner, 1);
  check('the level credential is issued to somebody who closed it under the old rule',
    level1?.created === true, level1?.code);
  const l1 = await findByCode(level1!.code);
  check('it names the level', l1?.snapshot.levelNumber === 1, l1?.snapshot.levelNumber);
  /*
   * Five, not six. The certificate claims the courses the level asks for, and
   * the paper is not one of them any more — printing its minutes would total
   * study the holder may never have done on a document whose whole value is
   * that a stranger can trust what it says.
   */
  check('it names the five courses the level asks for, and not the paper',
    l1?.snapshot.courses?.length === 5 && !l1?.snapshot.courses?.includes(CHALLENGE_1),
    l1?.snapshot.courses?.join(',') ?? 'no courses');
  check('its learning minutes are the sum of those five',
    (l1?.learning_minutes ?? 0) >= 130, l1?.learning_minutes);

  console.log('\n--- what the issuer may read about a run, and what it may not ---');
  /*
   * Read as text because a run cannot be written here and removed again — see
   * the head of this file. What is asserted is stronger than one fixture would
   * have been: not "a review run happened to earn it", but that there is no
   * expression in the issuer capable of reading a verdict at all.
   */
  const issuerCode = codeOf(credentialsSource);
  const levelIssuer = /export async function issueLevelCredential[\s\S]*?\n}\n/.exec(issuerCode)?.[0] ?? '';
  check('the level issuer is there to read', levelIssuer.length > 0, `${levelIssuer.length} chars`);
  check('it asks the runs table whether a run is finished',
    /level_challenge_runs/.test(levelIssuer) && /finished_at IS NOT NULL/.test(levelIssuer));
  /*
   * `course_outcomes` is a table and not a verdict, so the word is matched on
   * its own boundaries. What must appear nowhere is a read of
   * level_challenge_runs.outcome — the column that says clear, held or review.
   */
  check('and it never reads the run outcome, so a review verdict earns the certificate too',
    !/\boutcome\b/.test(issuerCode),
    'walking a hard run to the end is the behaviour rewarded, never the verdict');
  check('nothing in the issuer names a verdict at all',
    !/\b(clear|held|review)\b/.test(
      levelIssuer.replace(/course_outcomes/g, '')),
    'there is no expression here that could hold one back');
  check('it honours the pre-cutover exemption from one shared constant',
    /RUN_REQUIRED_FROM/.test(levelIssuer) && /from '\.\/gate'/.test(credentialsSource),
    'two copies of a cutover date is one copy too many');
  check('and the outstanding-courses check excludes the marked paper',
    /kind <> 'challenge'/.test(levelIssuer),
    'otherwise the certificate would be withheld until somebody sat a paper nothing asks for');
  check('the certificate records which instrument closed the level',
    l1?.snapshot.closedBy === 'paper', l1?.snapshot.closedBy ?? 'not recorded');

  console.log('\n--- the whole path ---');
  check('the path credential refuses with one level of six',
    (await issueProgrammeCredential(learner)) === null);

  // Earn the remaining five levels. The papers are passed before the cutover,
  // because a decision run cannot be written by a probe and removed again.
  const rest = await c.query<{ slug: string; kind: string }>(`
    SELECT c.slug, c.kind FROM courses c
    JOIN program_levels l ON l.id = c.level_id
    WHERE l.number BETWEEN 2 AND 6 ORDER BY l.number, c.sort_order`);
  for (const r of rest.rows) {
    await pass(r.slug, r.kind === 'challenge' ? PRE_CUTOVER : undefined);
  }
  for (let n = 2; n <= 6; n++) await issueLevelCredential(learner, n);

  check('level 0 earns no level credential — the orientation already covers it',
    (await issueLevelCredential(learner, 0)) === null);

  const path = await issueProgrammeCredential(learner);
  check('the path credential is issued once all six levels stand',
    path?.created === true, path?.code);
  const p = await findByCode(path!.code);
  check('it is titled as the brief specified',
    p?.snapshot.titleAr === 'شهادة إتمام مسار المتطوّع المتكامل', p?.snapshot.titleAr);
  check('it claims completion, never accreditation',
    !/معتمد|accredit/i.test(`${p?.snapshot.titleAr} ${p?.snapshot.titleEn}`));

  console.log('\n--- revocation ---');
  const revoked = await revokeCredential(level1!.code, 'اختبار تلقائي');
  check('a level credential can be revoked with a reason', revoked);
  check('a revocation with no reason is refused',
    (await revokeCredential(path!.code, '  ')) === false);
  const afterRevoke = await findByCode(level1!.code);
  check('the row is kept, not deleted', afterRevoke !== null);
  check('and it reports itself as revoked', afterRevoke?.revoked_at !== null);
  check('with the reason recorded', afterRevoke?.revoke_reason === 'اختبار تلقائي',
    afterRevoke?.revoke_reason);

  check('a revoked level blocks a fresh path credential',
    (await (async () => {
      await c.query(`UPDATE certificates SET revoked_at = now(), revoke_reason = 'probe'
                      WHERE user_id = $1 AND kind = 'program'`, [learner]);
      return issueProgrammeCredential(learner);
    })()) === null);

  console.log('\n--- reissue after revocation ---');
  const reissued = await issueLevelCredential(learner, 1);
  check('a revoked level credential can be reissued', reissued?.created === true, reissued?.code);
  check('and it carries a new code', reissued?.code !== level1?.code);

  console.log('\n--- issuing everything at once ---');
  const learner2 = randomUUID();
  await c.query(
    `INSERT INTO users (id, email, password_hash, locale, status)
     VALUES ($1, $2, 'probe-not-a-real-hash', 'ar', 'active')`,
    [learner2, `probe-cred2-${learner2}@example.invalid`]);
  await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)',
    [learner2, 'متطوّعة الاختبار']);
  await c.query(
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, submitted_at,
                                  score, passed, pass_mark)
     VALUES ($1, $2, $3, ARRAY['q1']::text[], now(), 100, TRUE, 80)`,
    [randomUUID(), learner2, ORIENTATION]);

  const batch = await issueEarnedCredentials(learner2);
  check('one pass yields exactly one credential', batch.length === 1, batch.length);
  const batchAgain = await issueEarnedCredentials(learner2);
  check('running it again yields none', batchAgain.length === 0, batchAgain.length);

  /*
   * And a learner who has passed every course of level 1 but walked no run
   * gets nothing from the batch issuer either — the rule is asked once, in
   * issueLevelCredential, and the helper cannot route around it.
   */
  for (const slug of LEVEL_1) {
    await c.query(
      `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, submitted_at,
                                    score, passed, pass_mark)
       VALUES ($1, $2, $3, ARRAY['q1']::text[], now(), 100, TRUE, 70)`,
      [randomUUID(), learner2, slug]);
  }
  const batchLevel = await issueEarnedCredentials(learner2);
  const levelForTwo = await c.query(
    `SELECT count(*)::int AS n FROM certificates
      WHERE user_id = $1 AND kind = 'level' AND revoked_at IS NULL`, [learner2]);
  check('a full level with no run issues its courses but not the level',
    batchLevel.length === LEVEL_1.length && levelForTwo.rows[0].n === 0,
    `${batchLevel.length} course credential(s), ${levelForTwo.rows[0].n} level credential(s)`);

  await c.query('DELETE FROM certificates WHERE user_id = $1', [learner2]);
  await c.query('DELETE FROM course_attempts WHERE user_id = $1', [learner2]);
  await c.query('DELETE FROM profiles WHERE user_id = $1', [learner2]);
  await c.query('DELETE FROM users WHERE id = $1', [learner2]);
} finally {
  console.log('\n--- cleanup ---');
  for (const sql of [
    'DELETE FROM certificates WHERE user_id = $1',
    'DELETE FROM level_progress WHERE user_id = $1',
    'DELETE FROM course_attempts WHERE user_id = $1',
    'DELETE FROM profiles WHERE user_id = $1',
    'DELETE FROM users WHERE id = $1',
  ]) {
    await c.query(sql, [learner]).catch((e) => console.log(`  cleanup: ${e.message.slice(0, 60)}`));
  }
  const left = await c.query(
    `SELECT count(*)::int AS n FROM users WHERE email LIKE 'probe-cred%'`);
  console.log(`  ${left.rows[0].n} probe user(s) remaining (expected 0)`);
  const runs = await c.query(
    'SELECT count(*)::int AS n FROM level_challenge_runs WHERE user_id = $1', [learner]);
  console.log(`  ${runs.rows[0].n} decision run(s) left behind (expected 0, and none is ever written)`);
  await c.end();
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
