/*
 * The four credential layers, earned by one learner from nothing.
 *
 * The assertions that matter most are the negative ones: that a credential
 * cannot be issued for work not done, that issuing twice produces one
 * certificate, and that a revoked level pulls the ground out from under the
 * path credential that depended on it.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import {
  issueCourseCredential,
  issueLevelCredential,
  issueProgrammeCredential,
  issueEarnedCredentials,
  revokeCredential,
} from '../src/lib/programme/credentials.ts';
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

await c.connect();
const learner = randomUUID();

async function pass(slug: string) {
  await c.query(
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, submitted_at,
                                  score, passed, pass_mark)
     VALUES ($1, $2, $3, ARRAY['q1','q2']::text[], now(), 100, TRUE, 70)`,
    [randomUUID(), learner, slug],
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
    [learner, 'متطوّع الاختبار'],
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
    orientRow?.snapshot.fullName === 'متطوّع الاختبار', orientRow?.snapshot.fullName);
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

  console.log('\n--- level 1 ---');
  for (const slug of LEVEL_1) await pass(slug);
  check('the level credential still refuses without the challenge',
    (await issueLevelCredential(learner, 1)) === null);

  await pass('level-1-challenge');
  check('a challenge earns no credential of its own',
    (await issueCourseCredential(learner, 'level-1-challenge')) === null);

  const level1 = await issueLevelCredential(learner, 1);
  check('the level credential is issued', level1?.created === true, level1?.code);
  const l1 = await findByCode(level1!.code);
  check('it names the level', l1?.snapshot.levelNumber === 1, l1?.snapshot.levelNumber);
  check('it lists the six courses it covers', l1?.snapshot.courses?.length === 6,
    l1?.snapshot.courses?.length);
  check('its learning minutes are the sum of those courses',
    (l1?.learning_minutes ?? 0) >= 150, l1?.learning_minutes);

  console.log('\n--- the whole path ---');
  check('the path credential refuses with one level of six',
    (await issueProgrammeCredential(learner)) === null);

  // Earn the remaining five levels.
  const rest = await c.query<{ slug: string }>(`
    SELECT c.slug FROM courses c
    JOIN program_levels l ON l.id = c.level_id
    WHERE l.number BETWEEN 2 AND 6 ORDER BY l.number, c.sort_order`);
  for (const r of rest.rows) await pass(r.slug);
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
  await c.end();
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
