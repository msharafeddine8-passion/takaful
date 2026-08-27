/*
 * The path map, walked end to end by one learner who starts with nothing.
 *
 * This is the probe for LMS F — the /[lang]/account/map route and the pure
 * model underneath it. It does not test a component; it tests the four things
 * that would make the map lie to a volunteer, and it tests them where they are
 * decided rather than where they are drawn:
 *
 *   1. A station with no courses reports 0%, never 100%. That is the exact bug
 *      the journey engine has — all six seeded stages have zero requirements,
 *      so every one of them divides nothing by nothing and reports itself
 *      finished. buildMapModel guards it and nothing below it divides.
 *   2. The next-certificate preview must not promise a document the platform
 *      never issues. src/lib/programme/credentials.ts is complete and was, for
 *      a long time, imported by nothing under src/ — so every
 *      LevelStanding.certificateCode was null in production. The last section
 *      of this probe reads src/lib/actions/courses.ts and fails until
 *      issueEarnedCredentials is wired into the pass flow.
 *   3. Level 0 issues no level credential by design; the orientation carries
 *      its own, and the model hand-maps it onto the orientation station.
 *   4. "Renders as Revoked" is assertable without JSX, because every surface
 *      routes revocation through the pure presenter in src/lib/credential-view.
 *      scripts/tsconfig.json sets no `jsx` option, so a probe cannot import a
 *      .tsx file — it can import that.
 *
 * WHY THIS WRITES REAL ROWS AND CLEANS UP RATHER THAN ROLLING BACK.
 * programmeStanding, the gate and the credential issuer all read through the
 * application's own pg pool, which cannot see an uncommitted transaction. The
 * same reason documented at the top of probe-academy.mts. Everything this
 * touches belongs to one throwaway learner and is deleted in a `finally`; the
 * journey and configuration tables that probe-all snapshots are never touched.
 *
 * The course slugs come from definition.ts rather than being typed out here,
 * so a course rename cannot leave this probe quietly testing nothing.
 *
 * WHAT CLOSES A LEVEL, AND WHY NO DECISION RUN IS WRITTEN HERE.
 * A level closes on every course that countsTowardsLevel plus a FINISHED
 * decision run — or, before RUN_REQUIRED_FROM, on the marked paper, which is
 * the exemption for the people who closed a level under the old rule. The
 * level's paper is still listed, still openable and no longer counts towards
 * the level, so a station that holds six courses now asks for five.
 *
 * This probe closes its levels through the pre-cutover exemption rather than
 * by writing runs, because migration 042 puts a BEFORE DELETE trigger on
 * level_challenge_runs which refuses unconditionally — 045's
 * takaful_delete_allowed() hatch was never extended to it — and that table's
 * user_id is ON DELETE RESTRICT. A single inserted run would be permanent in a
 * production database and would hold the throwaway learner in `users` with it,
 * where the association's own reports count them. No probe in this suite
 * writes to a delete-refusing table.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import { readFileSync as readFileSyncRaw, existsSync } from 'node:fs';
import { normaliseNewlines } from './source-text.mts';
/* readFileSync is shadowed with a normalising wrapper: git checks src/ out
 * with CRLF on Windows, which turns a newline-anchored regex below into a silent
 * pass and once made four negative assertions read an empty string. One
 * shadow covers every call site in this file. See scripts/source-text.mts. */
const readFileSync = (p: Parameters<typeof readFileSyncRaw>[0], enc: 'utf8'): string =>
  normaliseNewlines(readFileSyncRaw(p, enc));
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import {
  accessToCourse,
  snapshotFor,
  decide,
  levelOpen,
  levelClosed,
  RUN_REQUIRED_FROM,
} from '../src/lib/programme/gate.ts';
import { programmeStanding, type ProgrammeStanding } from '../src/lib/programme/standing.ts';
import {
  issueEarnedCredentials,
  issueLevelCredential,
  issueProgrammeCredential,
  revokeCredential,
} from '../src/lib/programme/credentials.ts';
import { findByCode, certificatesFor } from '../src/lib/certificates.ts';
import { buildMapModel } from '../src/lib/programme/journey-map.ts';
import { skillMap } from '../src/lib/programme/skills.ts';
import {
  LEVEL_BADGES,
  levelBadgeByCode,
  levelBadgeStanding,
  highestLevelEarned,
} from '../src/lib/programme/level-badges.ts';
import { credentialView } from '../src/lib/credential-view.ts';
import { lmsAr, lmsEn } from '../src/lib/dictionaries/lms.ts';
import {
  COURSES,
  LEVELS,
  ORIENTATION_SLUG,
  coursesInLevel,
} from '../src/lib/programme/definition.ts';

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

const REPO = fileURLToPath(new URL('..', import.meta.url));
const readSource = (...parts: string[]): string => {
  const path = join(REPO, ...parts);
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
};

/** '{n}' and '{title}' as a sorted list, so two translations can be compared. */
const placeholders = (s: string): string =>
  (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort().join(',');

const ARABIC = /[؀-ۿ]/;

const level1 = coursesInLevel(1);
const level1Core = level1.filter((x) => x.kind === 'core');
const level1Challenge = level1.find((x) => x.kind === 'challenge');
const programmeTotal = LEVELS.flatMap((l) => coursesInLevel(l.number)).length;

/** A day before the cutover, derived so a moved cutover cannot strand it. */
const PRE_CUTOVER = new Date(Date.parse(RUN_REQUIRED_FROM) - 86_400_000).toISOString();

await c.connect();
const learner = randomUUID();

async function pass(slug: string, submittedAt?: string) {
  // chk_attempt_questions rejects an empty array: a real attempt asked
  // something, and a pass recorded against no questions is not a pass.
  //
  // submittedAt exists because the grandfathering rule turns on WHEN a paper
  // was submitted, and a probe that could only write now() could not tell the
  // two sides of RUN_REQUIRED_FROM apart.
  await c.query(
    `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, submitted_at,
                                  score, passed, pass_mark)
     VALUES ($1, $2, $3, ARRAY['probe-q1','probe-q2']::text[],
             COALESCE($4::timestamptz, now()), 100, TRUE, 70)`,
    [randomUUID(), learner, slug, submittedAt ?? null],
  );
}

/**
 * Close a level the only way a probe may: the marked paper, passed before the
 * cutover. A decision run would close it too and cannot be written here — see
 * the head of this file.
 */
async function closeLevelWithOldRule(level: number) {
  const paper = coursesInLevel(level).find((x) => x.kind === 'challenge');
  if (paper) await pass(paper.slug, PRE_CUTOVER);
}

/** The standing and the model built from it, always read together. */
async function look() {
  const standing = await programmeStanding(learner);
  return { standing, map: buildMapModel(standing) };
}

try {
  await c.query(
    `INSERT INTO users (id, email, password_hash, locale, status)
     VALUES ($1, $2, 'probe-not-a-real-hash', 'ar', 'active')`,
    [learner, `probe-path-${learner}@example.invalid`],
  );
  await c.query(
    `INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)`,
    [learner, 'متطوّع الاختبار'],
  );

  /* ------------------------------------------------------------------ */
  console.log('\n--- the badges and the authored levels agree ---');
  /*
   * The failure mode here is a typo, and a typo is silent: a badge code that
   * does not match program_levels.badge_code resolves to nothing and the level
   * simply shows no badge. Asserted in both directions so neither list can
   * drift alone.
   */
  for (const level of LEVELS) {
    check(`level ${level.number}'s authored badge code resolves to a badge`,
      levelBadgeByCode(level.badgeCode) !== undefined, level.badgeCode);
  }
  const authored = new Set(LEVELS.map((l) => l.badgeCode));
  check('and no badge invents a code the programme never authored',
    LEVEL_BADGES.every((b) => authored.has(b.code)),
    LEVEL_BADGES.filter((b) => !authored.has(b.code)).map((b) => b.code).join(',') || 'none');
  check('there is exactly one badge per level, 0 through 6',
    LEVEL_BADGES.length === LEVELS.length
      && new Set(LEVEL_BADGES.map((b) => b.levelNumber)).size === LEVELS.length,
    LEVEL_BADGES.length);
  check('every badge is written in Arabic and in English',
    LEVEL_BADGES.every((b) =>
      ARABIC.test(b.title.ar) && ARABIC.test(b.description.ar)
      && b.title.en.trim().length > 0 && b.description.en.trim().length > 0
      && b.title.ar !== b.title.en));
  check('and each carries one icon, never standing in for the text alone',
    LEVEL_BADGES.every((b) => b.icon.trim().length > 0));

  /* ------------------------------------------------------------------ */
  console.log('\n--- the map strings ---');
  const arKeys = Object.keys(lmsAr).sort();
  const enKeys = Object.keys(lmsEn).sort();
  check('Arabic and English cover the same keys',
    JSON.stringify(arKeys) === JSON.stringify(enKeys), arKeys.length);
  /*
   * Three keys — coursesOf, nextCertificateBody, remainingLevels — are not
   * strings but plural tables, because Arabic inflects a counted noun six ways
   * and "{n} دورات" is wrong for every n except 3-10. Flatten each language to
   * leaf strings keyed by "key" or "key.one" so the checks below compare like
   * with like. A leaf missing on one side is caught by the key check, not here.
   */
  type Leaf = [string, string];
  const leaves = (o: object): Leaf[] =>
    Object.entries(o).flatMap(([k, v]): Leaf[] =>
      typeof v === 'string'
        ? [[k, v]]
        : leaves(v as object).map(([sub, s]): Leaf => [`${k}.${sub}`, s]));

  const arEntries = leaves(lmsAr);
  const enStrings = Object.fromEntries(leaves(lmsEn));
  check('every leaf string is present in both languages',
    JSON.stringify(arEntries.map(([k]) => k).sort())
      === JSON.stringify(Object.keys(enStrings).sort()),
    `${arEntries.length} leaves`);
  check('no string is empty in either language',
    arEntries.every(([k, v]) => v.trim().length > 0 && enStrings[k]?.trim().length > 0));
  const notArabic = arEntries.filter(([, v]) => !ARABIC.test(v)).map(([k]) => k);
  check('every Arabic string is actually Arabic — no English shipped twice',
    notArabic.length === 0, notArabic.join(',') || 'all Arabic');
  const sameBoth = arEntries.filter(([k, v]) => v === enStrings[k]).map(([k]) => k);
  check('and none is the English string pasted into the Arabic file',
    sameBoth.length === 0, sameBoth.join(',') || 'none');
  const lostPlaceholder = arEntries
    .filter(([k, v]) => placeholders(v) !== placeholders(enStrings[k] ?? ''))
    .map(([k]) => k);
  check('interpolations survive translation on both sides',
    lostPlaceholder.length === 0, lostPlaceholder.join(',') || 'all match');

  /* ------------------------------------------------------------------ */
  console.log('\n--- a credential renders as itself, in both languages ---');
  const liveView = credentialView({ revoked_at: null, revoke_reason: null }, lmsAr, 'ar');
  check('a credential that stands reads as valid', liveView.status === 'valid'
    && liveView.statusLabel === lmsAr.certValid, liveView.statusLabel);
  check('and it may be shared', liveView.shareable);
  const withdrawn = { revoked_at: new Date('2026-03-14T10:00:00Z'), revoke_reason: 'اختبار تلقائي' };
  const revokedAr = credentialView(withdrawn, lmsAr, 'ar');
  const revokedEn = credentialView(withdrawn, lmsEn, 'en');
  check('a withdrawn one reads as revoked in Arabic',
    revokedAr.status === 'revoked' && revokedAr.statusLabel === lmsAr.certRevoked,
    revokedAr.statusLabel);
  check('and as revoked in English',
    revokedEn.status === 'revoked' && revokedEn.statusLabel === lmsEn.certRevoked,
    revokedEn.statusLabel);
  check('the state is carried by words, not by colour alone',
    revokedAr.statusLabel.trim().length > 0
    && revokedAr.statusLabel !== liveView.statusLabel);
  check('the date it was withdrawn is shown in both',
    Boolean(revokedAr.revokedOn) && Boolean(revokedEn.revokedOn),
    revokedEn.revokedOn ?? 'missing');
  check('so is the reason — the one thing that tells a holder what happened',
    revokedAr.reason?.includes('اختبار تلقائي') === true, revokedAr.reason);
  check('and a revoked credential is not offered for sharing', !revokedAr.shareable);

  /* ------------------------------------------------------------------ */
  console.log('\n--- nothing divides by nothing ---');
  /*
   * The trap, asserted on a standing with no levels at all: every station
   * falls back to an empty stand-in, and an empty station must read 0%. The
   * journey engine reports 100 in exactly this situation.
   */
  const bare: ProgrammeStanding = {
    levels: [], electives: [], currentLevel: 0, next: null,
    totalCourses: 0, passedCourses: 0, learningMinutes: 0, certificates: [], revise: [],
  };
  const bareMap = buildMapModel(bare);
  check('a station with no courses reports 0%, not 100%',
    bareMap.stations.every((s) => s.percent === 0),
    bareMap.stations.map((s) => s.percent).join(','));
  check('and says so plainly, rather than being read off a percentage',
    bareMap.stations.every((s) => !s.hasCourses));
  check('nothing out of nothing is 0% overall too', bareMap.overall.percent === 0,
    bareMap.overall.percent);
  check('an empty level never claims its certificate is ready',
    bareMap.nextCertificate?.ready === false, bareMap.nextCertificate?.ready);
  check('and exactly one station still says "you are here"',
    bareMap.stations.filter((s) => s.youAreHere).length === 1);

  /* ------------------------------------------------------------------ */
  console.log('\n--- the map a new account sees ---');
  const start = await look();
  check('the map has seven stations', start.map.stations.length === LEVELS.length,
    start.map.stations.length);
  check('the orientation is the first, then the levels in order',
    start.map.stations[0].kind === 'orientation'
    && JSON.stringify(start.map.stations.map((s) => s.number)) === JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
    start.map.stations.map((s) => s.key).join(' '));
  check('exactly one station says "you are here"',
    start.map.stations.filter((s) => s.youAreHere).length === 1);
  check('and it is the orientation, because nothing has been passed',
    start.map.youAreHere.kind === 'orientation', start.map.youAreHere.key);
  check('the orientation station is the one in progress',
    start.map.stations[0].state === 'current', start.map.stations[0].state);
  check('it holds one course, and it is the orientation itself',
    start.map.stations[0].total === 1 && start.map.stations[0].nextSlug === ORIENTATION_SLUG,
    start.map.stations[0].nextSlug);
  for (const station of start.map.stations.filter((s) => s.number >= 1)) {
    check(`level ${station.number} is locked, and the lock ships its reason`,
      station.state === 'locked' && station.lockedBy.length > 0,
      `${station.state} / ${station.lockedBy.map((m) => m.kind).join(',') || 'no reason'}`);
  }
  check('the whole path counts every course in every level',
    start.map.overall.total === programmeTotal, `${start.map.overall.total} of ${programmeTotal}`);
  check('and nothing is passed yet', start.map.overall.percent === 0
    && start.map.overall.levelsDone === 0);
  check('the next certificate on offer is level one',
    start.map.nextCertificate?.levelNumber === 1, start.map.nextCertificate?.levelNumber);
  check('it is not ready, and it lists what is left',
    start.map.nextCertificate?.ready === false
    && start.map.nextCertificate?.remaining.length === level1.length,
    start.map.nextCertificate?.remaining.length);

  console.log('\n--- the skill map before anything is built ---');
  const skills0 = skillMap(start.standing);
  check('every shelf is present but empty', skills0.length > 0
    && skills0.every((s) => s.band === 'none' && s.percent === 0 && s.passed === 0),
    skills0.length);
  check('no shelf counts a course twice',
    skills0.every((s) => s.total > 0 && s.passed <= s.total));
  check('and every shelf is labelled in both languages',
    skills0.every((s) => ARABIC.test(s.label.ar) && s.label.en.trim().length > 0));

  console.log('\n--- what the gate says about the same picture ---');
  const snap0 = await snapshotFor(learner);
  check('level 1 is shut until the orientation is passed', !levelOpen(snap0, 1));
  const firstCore = level1Core[0];
  const refused = await accessToCourse(learner, firstCore.slug);
  check(`${firstCore.slug} is refused`, !refused.allowed);
  check('and the refusal names the orientation, not "access denied"',
    refused.missing.some((m) => m.kind === 'orientation'),
    refused.missing.map((m) => m.kind).join(','));
  const orientationAccess = decide(snap0, ORIENTATION_SLUG);
  check('the orientation itself is open to a brand-new account', orientationAccess.allowed);
  check('the map agrees with the gate on that course',
    start.map.stations[1].courses.find((x) => x.slug === firstCore.slug)?.locked === true);

  /* ------------------------------------------------------------------ */
  console.log('\n--- passing the orientation ---');
  await pass(ORIENTATION_SLUG);
  const snap1 = await snapshotFor(learner);
  check('level 1 opens', levelOpen(snap1, 1));

  const firstIssue = await issueEarnedCredentials(learner);
  check('one credential is issued for it', firstIssue.length === 1, firstIssue.length);
  const orientationCert = await findByCode(firstIssue[0]);
  check('and its kind is orientation, not course', orientationCert?.kind === 'orientation',
    orientationCert?.kind);
  check('level 0 earns no level credential on top of it',
    (await issueLevelCredential(learner, 0)) === null);
  check('and the whole-path credential is nowhere near earned',
    (await issueProgrammeCredential(learner)) === null);

  const after0 = await look();
  check('the orientation station carries that credential',
    after0.map.stations[0].certificateCode === firstIssue[0],
    after0.map.stations[0].certificateCode);
  check('the orientation station is complete', after0.map.stations[0].state === 'complete'
    && after0.map.stations[0].percent === 100, after0.map.stations[0].percent);
  check('"you are here" has moved to level one',
    after0.map.youAreHere.number === 1 && after0.map.youAreHere.kind === 'level',
    after0.map.youAreHere.key);
  check('exactly one station still says it', after0.map.stations.filter((s) => s.youAreHere).length === 1);
  check('level one is now the station in progress',
    after0.map.stations[1].state === 'current', after0.map.stations[1].state);
  /*
   * Locked behind level one's COURSES, not behind its paper and not yet behind
   * its decision run: naming the run while a course is outstanding would send
   * the learner to a page that refuses them.
   */
  check('and level two is still locked behind level one\'s unfinished courses',
    after0.map.stations[2].state === 'locked'
    && after0.map.stations[2].lockedBy.some((m) => m.kind === 'course' && m.level === 1)
    && !after0.map.stations[2].lockedBy.some((m) => m.kind === 'decision-run'),
    after0.map.stations[2].lockedBy.map((m) => m.kind).join(','));
  check('the orientation badge is earned', levelBadgeStanding(after0.standing)[0].earned);
  check('but no level counts as finished yet', highestLevelEarned(after0.standing) === 0,
    highestLevelEarned(after0.standing));

  /* ------------------------------------------------------------------ */
  console.log('\n--- working through level one ---');
  for (const course of level1Core) await pass(course.slug);
  const partial = await look();
  /*
   * Five of five, not five of six. The level's marked paper is revision now
   * and does not count towards the level — counting it would leave the bar
   * stuck one short of full for a learner who has finished everything the
   * level actually asks of them.
   */
  check('the five courses are the whole of what the level asks',
    partial.map.stations[1].total === 5 && partial.map.stations[1].done === 5,
    `${partial.map.stations[1].done}/${partial.map.stations[1].total}`);
  check('so the bar reads full', partial.map.stations[1].percent === 100,
    partial.map.stations[1].percent);
  check('the paper is still listed on the station, openable and uncounted',
    partial.map.stations[1].courses.some((x) => x.slug === level1Challenge?.slug)
    && partial.map.stations[1].courses.length === level1.length,
    `${partial.map.stations[1].courses.length} courses listed, ${partial.map.stations[1].total} counted`);
  /*
   * And the level is STILL not complete, because the decision run has not been
   * walked. A full bar beside an incomplete level is the honest picture here.
   */
  check('but the level is NOT complete, because the decision run is outstanding',
    partial.standing.levels[1].complete === false
    && partial.map.stations[1].state === 'current',
    partial.map.stations[1].state);
  check('the gate agrees', !levelClosed(await snapshotFor(learner), 1));
  check('the badge is not earned yet', !levelBadgeStanding(partial.standing)[1].earned);
  check('level two is still locked', partial.map.stations[2].state === 'locked',
    partial.map.stations[2].state);
  check('and the lock now names the level one decision run',
    partial.map.stations[2].lockedBy.length === 1
    && partial.map.stations[2].lockedBy[0].kind === 'decision-run',
    partial.map.stations[2].lockedBy
      .map((m) => `${m.kind}${'level' in m ? `:${m.level}` : ''}`).join(',') || 'no reason');
  const refusedNow = await issueLevelCredential(learner, 1);
  check('the issuer refuses the level credential while the run is outstanding',
    refusedNow === null, refusedNow?.code);
  /*
   * The preview must not promise a document the platform would refuse. `ready`
   * is computed from done === total, which the courses now satisfy on their
   * own — so it outruns the issuer by exactly the width of the decision run.
   * The fix belongs in buildMapModel, which this probe may not edit.
   */
  check('and the map does not offer a certificate the issuer would refuse',
    partial.map.nextCertificate?.levelNumber === 1
    && partial.map.nextCertificate?.ready === false,
    `ready=${partial.map.nextCertificate?.ready}, issuer=${refusedNow === null ? 'refuses' : 'issues'}`);

  console.log('\n--- the marked paper no longer closes a level ---');
  check('level one has a paper to pass', level1Challenge !== undefined);
  check('this probe runs after the cutover, so a pass recorded now is a late one',
    Date.now() >= Date.parse(RUN_REQUIRED_FROM),
    `now ${new Date().toISOString()} vs cutover ${RUN_REQUIRED_FROM}`);
  if (level1Challenge) await pass(level1Challenge.slug);
  const papered = await look();
  check('passing it today leaves the level open',
    papered.standing.levels[1].complete === false
    && papered.map.stations[1].state === 'current',
    papered.map.stations[1].state);
  check('level two stays locked', papered.map.stations[2].state === 'locked');
  check('and no level credential is issued for it',
    (await issueLevelCredential(learner, 1)) === null);

  console.log('\n--- a paper passed before the cutover still closes it ---');
  /*
   * The exemption, and the only instrument a probe may use: two people closed
   * level 1 under the old rule and re-locking them would be the platform
   * taking back something it had already given.
   */
  await closeLevelWithOldRule(1);
  const done1 = await look();
  check('the level is complete',
    done1.map.stations[1].state === 'complete' && done1.map.stations[1].percent === 100,
    done1.map.stations[1].percent);
  check('level two opens', done1.map.stations[2].state !== 'locked',
    done1.map.stations[2].state);
  check('the level one badge is earned', levelBadgeStanding(done1.standing)[1].earned);
  check('and the highest consecutive level earned is one',
    highestLevelEarned(done1.standing) === 1, highestLevelEarned(done1.standing));

  /*
   * The honest middle state, and the reason `ready` exists: the work is done,
   * and no certificate has been issued because nothing in the running
   * application has issued one. The preview says so rather than showing a code
   * that does not exist.
   */
  check('the certificate reads as ready but not yet issued',
    done1.map.nextCertificate?.levelNumber === 1
    && done1.map.nextCertificate?.ready === true
    && done1.map.nextCertificate?.remaining.length === 0,
    done1.map.nextCertificate?.ready);
  check('and the badge does not pretend to hold a certificate it has not got',
    levelBadgeStanding(done1.standing)[1].certificateCode === null);

  /* ------------------------------------------------------------------ */
  console.log('\n--- issuing what has been earned ---');
  const issued = await issueEarnedCredentials(learner);
  check('the level credential is among what is issued', issued.length > 0, issued.length);
  const levelCert = (await certificatesFor(learner)).find((x) => x.kind === 'level');
  check('a level credential now exists', levelCert !== undefined, levelCert?.code);
  check('and it names level one', levelCert?.snapshot.levelNumber === 1,
    levelCert?.snapshot.levelNumber);

  const issued1 = await look();
  check('the map now carries the code on the level one station',
    issued1.map.stations[1].certificateCode === levelCert?.code,
    issued1.map.stations[1].certificateCode);
  const badges1 = levelBadgeStanding(issued1.standing);
  check('the badge carries it too', badges1[1].certificateCode === levelCert?.code);
  check('with the date it was issued', badges1[1].earnedAt instanceof Date,
    badges1[1].earnedAt?.toISOString().slice(0, 10));
  check('and the preview has moved on to level two',
    issued1.map.nextCertificate?.levelNumber === 2,
    issued1.map.nextCertificate?.levelNumber);
  check('the skill map has moved with it',
    skillMap(issued1.standing).some((s) => s.band !== 'none'));
  check('and counts exactly the courses that were passed',
    skillMap(issued1.standing).reduce((n, s) => n + s.passed, 0) === 1 + level1.length,
    skillMap(issued1.standing).reduce((n, s) => n + s.passed, 0));
  check('running it again issues nothing new',
    (await issueEarnedCredentials(learner)).length === 0);

  /* ------------------------------------------------------------------ */
  console.log('\n--- withdrawing it ---');
  const code = levelCert?.code ?? '';
  check('a level credential can be withdrawn with a reason',
    await revokeCredential(code, 'اختبار تلقائي'));
  const revokedRow = await findByCode(code);
  check('the row is kept — a verifier must be told, not shown nothing',
    revokedRow !== null && revokedRow.revoked_at !== null);
  if (revokedRow) {
    const viewAr = credentialView(revokedRow, lmsAr, 'ar');
    const viewEn = credentialView(revokedRow, lmsEn, 'en');
    check('it renders as revoked in Arabic', viewAr.status === 'revoked'
      && viewAr.statusLabel === lmsAr.certRevoked, viewAr.statusLabel);
    check('and as revoked in English', viewEn.status === 'revoked'
      && viewEn.statusLabel === lmsEn.certRevoked, viewEn.statusLabel);
    check('with the reason on both', Boolean(viewAr.reason) && Boolean(viewEn.reason));
    check('and neither offers to share it', !viewAr.shareable && !viewEn.shareable);
  }

  const afterRevoke = await look();
  check('the map stops offering a certificate that no longer stands',
    afterRevoke.map.stations[1].certificateCode === null,
    afterRevoke.map.stations[1].certificateCode);
  const badges2 = levelBadgeStanding(afterRevoke.standing);
  check('but the badge stays earned — the courses were still passed',
    badges2[1].earned && badges2[1].certificateCode === null);
  check('and the preview honestly points back at level one',
    afterRevoke.map.nextCertificate?.levelNumber === 1
    && afterRevoke.map.nextCertificate?.ready === true,
    afterRevoke.map.nextCertificate?.levelNumber);
  check('the level itself is still complete', afterRevoke.map.stations[1].state === 'complete');

  /* ------------------------------------------------------------------ */
  console.log('\n--- walking to the end of the path ---');
  /*
   * The whole-path credential, walked rather than asserted about.
   *
   * This probe used to stop at level one and check only that the path
   * credential was NOT yet earned, which is the easy half: a function that
   * returned null unconditionally would have satisfied it. It once did, near
   * enough — issueProgrammeCredential demanded a level credential for level 0
   * too, one that is deliberately never issued, so nobody could ever complete
   * the programme. Only walking to the end finds that.
   *
   * The levels are issued one at a time here rather than through
   * issueEarnedCredentials, because that helper would quietly re-mint level
   * one's withdrawn credential and hide the rule being tested: the path
   * credential stands on live level credentials, not on passes, so every
   * course in the programme being passed is not enough while one level's
   * certificate is withdrawn.
   */
  for (const level of LEVELS.filter((l) => l.number >= 2)) {
    for (const course of coursesInLevel(level.number)) {
      // The paper goes in before the cutover, which is the only instrument a
      // probe has for closing a level. Everything else is passed today.
      await pass(course.slug, course.kind === 'challenge' ? PRE_CUTOVER : undefined);
    }
  }
  for (const level of LEVELS.filter((l) => l.number >= 2)) {
    const result = await issueLevelCredential(learner, level.number);
    check(`level ${level.number} issues its own credential`, result?.created === true, result?.code);
  }
  check('every course in the programme has now been passed',
    (await look()).map.overall.passed === programmeTotal, programmeTotal);
  check('and still no whole-path credential, because level one stands withdrawn',
    (await issueProgrammeCredential(learner)) === null);

  const repaired = await issueLevelCredential(learner, 1);
  check('the withdrawn level credential can be re-issued', repaired?.created === true, repaired?.code);
  const lastIssue = await issueEarnedCredentials(learner);
  const pathCert = (await certificatesFor(learner)).find((x) => x.kind === 'program');
  check('and now the whole path is awarded', pathCert !== undefined, pathCert?.code);
  check('by the same call the application makes after a pass',
    pathCert !== undefined && lastIssue.includes(pathCert.code));
  check('it stands — nothing issues a credential already withdrawn',
    pathCert?.revoked_at === null);
  check('it is titled in both languages',
    ARABIC.test(pathCert?.snapshot.titleAr ?? '')
    && (pathCert?.snapshot.titleEn ?? '').trim().length > 0, pathCert?.snapshot.titleEn);
  /*
   * The association holds no accreditation, and a certificate that claims one
   * is a claim the volunteer would have to defend to whoever reads their CV.
   * credentials.ts says so in prose; this is the assertion behind it.
   */
  check('and claims no accreditation the association does not hold',
    !/معتمدة?\b|accredit|internationally/i.test(
      `${pathCert?.snapshot.titleAr ?? ''} ${pathCert?.snapshot.titleEn ?? ''}`),
    pathCert?.snapshot.titleAr);
  check('issuing again returns the one that exists, never a second',
    (await issueProgrammeCredential(learner))?.created === false
    && (await certificatesFor(learner)).filter((x) => x.kind === 'program').length === 1);

  const end = await look();
  check('every station on the map is complete',
    end.map.stations.every((s) => s.state === 'complete'),
    end.map.stations.filter((s) => s.state !== 'complete').map((s) => s.key).join(',') || 'all seven');
  check('the whole path reads 100%, and all six levels are done',
    end.map.overall.percent === 100 && end.map.overall.levelsDone === 6,
    `${end.map.overall.percent}% / ${end.map.overall.levelsDone} levels`);
  check('nothing further is dangled in front of a learner who holds them all',
    end.map.nextCertificate === null, end.map.nextCertificate?.levelNumber ?? 'none');
  check('the highest consecutive level earned is six',
    highestLevelEarned(end.standing) === 6, highestLevelEarned(end.standing));
  check('every level badge is earned, orientation through six',
    levelBadgeStanding(end.standing).every((b) => b.earned),
    levelBadgeStanding(end.standing).filter((b) => !b.earned).map((b) => b.levelNumber).join(',') || 'all seven');
  check('and every badge now carries the credential behind it',
    levelBadgeStanding(end.standing).every((b) => b.certificateCode !== null),
    levelBadgeStanding(end.standing).filter((b) => b.certificateCode === null).length);
  check('the skill map counts every course in the programme, none twice',
    skillMap(end.standing).reduce((n, s) => n + s.passed, 0) === programmeTotal,
    skillMap(end.standing).reduce((n, s) => n + s.passed, 0));
  check('and every shelf has moved off empty',
    skillMap(end.standing).every((s) => s.band !== 'none'),
    skillMap(end.standing).filter((s) => s.band === 'none').length);

  /* ------------------------------------------------------------------ */
  console.log('\n--- the application must actually issue these ---');
  /*
   * The preview above is only honest if something in the running application
   * issues a level credential. credentials.ts was imported by nothing under
   * src/ for the whole of its life, so every certificateCode was null in
   * production and this feature would have promised a document no learner
   * could ever receive. Read as text on purpose: this asserts the wiring
   * exists, not that some other probe's fixture happened to call it.
   */
  const submitSource = readSource('src', 'lib', 'actions', 'courses.ts');
  check('the pass flow exists to read', submitSource.length > 0);

  /*
   * An import is not a call.
   *
   * This asserted /issueEarnedCredentials/ against the whole file, which
   * matches the import line on its own — so it would have gone green on a
   * codebase where the function was imported and never invoked, which is
   * precisely the state this section exists to catch. The call is matched
   * instead, and the enclosing function is read out of the source rather than
   * named from the brief: it is completeCourseAction, and the brief's
   * submitCourseAction has never existed here. A probe that prints a name
   * nobody can grep for sends the next reader looking for the wrong thing.
   */
  const callAt = submitSource.search(/\bawait\s+issueEarnedCredentials\s*\(/);
  const recomputeAt = submitSource.search(/\bawait\s+recomputeAchievements\s*\(/);
  /*
   * Any condition beginning with graded.passed, not that one exact line.
   *
   * This read `if (graded.passed)` literally and went red the day the guard
   * became `if (graded.passed && !awaitingPractical)` — a change that made the
   * rule STRICTER, because a course carrying a practical task now holds its
   * credential until a trainer has read the work. A probe that fails when the
   * code becomes more careful is testing the typing rather than the rule, and
   * the next person to find it red will believe the rule broke.
   *
   * The rule is: credentials are issued behind a graded.passed guard and never
   * ahead of one. That is what these two searches establish, and a guard that
   * narrows further still satisfies it.
   */
  const guardAt = submitSource.search(/if\s*\(\s*graded\.passed\b/);
  const enclosing = callAt === -1
    ? null
    : [...submitSource.slice(0, callAt).matchAll(/export async function (\w+)/g)].pop()?.[1] ?? null;
  check('and submitting a passed course issues the credentials it earned', callAt !== -1,
    callAt !== -1 ? `called in ${enclosing ?? 'the pass flow'}`
      : submitSource.length > 0
        ? 'imported but never called — every certificateCode stays null'
        : 'file missing');
  check('only when the attempt actually passed',
    guardAt !== -1 && callAt > guardAt, enclosing ?? 'no graded.passed guard');
  check('and before the badge engine, which reads the credential it issues',
    callAt !== -1 && recomputeAt !== -1 && callAt < recomputeAt,
    callAt !== -1 && recomputeAt !== -1 && callAt < recomputeAt
      ? 'issue, then recompute'
      : 'recompute runs first — a level badge would lag a pass');

  const mapPage = readSource('src', 'app', '[lang]', 'account', 'map', 'page.tsx');
  check('the map route exists', mapPage.length > 0);
  const usesModel = /buildMapModel/.test(mapPage);
  check('and it draws from the one model, rather than computing its own figures', usesModel,
    usesModel ? 'buildMapModel' : mapPage.length > 0 ? 'buildMapModel not used' : 'file missing');
  check('no component divides a done by a total behind the model\'s back',
    !/\/\s*(total|level\.total|station\.total)\s*\)?\s*\*\s*100/.test(mapPage));

  const catalogueSlugs = new Set(COURSES.map((x) => x.slug));
  check('every slug this probe exercised is still a real course',
    [ORIENTATION_SLUG, ...level1.map((x) => x.slug)].every((s) => catalogueSlugs.has(s)));
} finally {
  console.log('\n--- cleanup ---');
  /*
   * Migrations 044/045: achievements refuses a plain DELETE, and this asks for
   * the exception by name.
   *
   * Two things this got wrong, both of which sweep.mts had already been bitten
   * by and documented. SET LOCAL only means anything inside a transaction —
   * outside one Postgres warns and does nothing — and this loop ran every
   * statement in its own implicit transaction, so the setting expired before
   * the next line. And the SET was inside the parameterised list, so it was
   * sent with one bind parameter and failed outright: "bind message supplies 1
   * parameters". The escape hatch had therefore never once been open, and the
   * only reason nothing was left behind is that this probe writes no
   * achievements. A SAVEPOINT per statement keeps what the loop had before:
   * one refusal does not abandon the rest.
   */
  try {
    await c.query('BEGIN');
    await c.query("SET LOCAL takaful.allow_delete = 'on'");
    await c.query('DELETE FROM achievements WHERE user_id = $1', [learner]);
    await c.query('COMMIT');
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    console.log(`  cleanup: achievements — ${(e as Error).message.slice(0, 60)}`);
  }
  /*
   * The rest outside a transaction, one statement at a time, deliberately.
   * Wrapping the whole teardown in one made a dropped connection roll back all
   * of it — which is exactly what happened once here, leaving a probe account
   * in production for the sweep to find. Each statement commits on its own, so
   * a connection lost half way through costs one delete rather than six.
   */
  for (const sql of [
    'DELETE FROM certificates WHERE user_id = $1',
    'DELETE FROM level_progress WHERE user_id = $1',
    'DELETE FROM course_attempts WHERE user_id = $1',
    'DELETE FROM profiles WHERE user_id = $1',
    'DELETE FROM users WHERE id = $1',
  ]) {
    await c.query(sql, [learner])
      .catch((e) => console.log(`  cleanup: ${sql.split(' ')[3]} — ${e.message.slice(0, 60)}`));
  }
  const left = await c.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM users WHERE email LIKE 'probe-path-%'`);
  console.log(`  ${left.rows[0].n} probe user(s) remaining (expected 0)`);
  /*
   * Nothing here writes a decision run, and this says so out loud: a row in
   * that table could not be deleted afterwards, and it would hold the learner
   * down with it. See the head of this file.
   */
  const runs = await c.query<{ n: number }>(
    'SELECT count(*)::int AS n FROM level_challenge_runs WHERE user_id = $1', [learner]);
  console.log(`  ${runs.rows[0].n} decision run(s) left behind (expected 0, and none is ever written)`);
  await c.end();
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
