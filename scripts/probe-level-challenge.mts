/*
 * The level decision runs: branching that is reproducible, that closes a level,
 * and that cannot reach anybody's score.
 *
 * THE FAILURE THIS PROBE EXISTS FOR IS SILENT IN BOTH DIRECTIONS.
 *
 * A branching challenge whose branches all lead to the same place is not
 * broken — it renders, it records decisions, it produces an outcome. It just
 * gives every volunteer the same paper, which is the one thing it was built not
 * to do.
 *
 * And a run that quietly became part of a course would be worse: forty-one
 * courses have been sat, scored and certificated against a fingerprint, and a
 * new marked question anywhere in that hash makes every past attempt short an
 * answer. So the first section asserts that property three ways AND asserts a
 * control — that the fingerprint still moves when a question genuinely changes.
 * Without the control, three green lines prove only that the hash is constant,
 * which is exactly what a broken hash looks like.
 *
 * ── WHAT CHANGED, AND WHAT DID NOT ─────────────────────────────────────────
 *
 * The decision run used to gate nothing. It now closes a programme level, and
 * the marked paper at the end of the level was demoted to revision. Sections 2,
 * 9, 10 and 11 assert the new direction; everything else is unchanged, because
 * the reversal moved WHAT the run does and none of what it may say about a
 * person.
 *
 * The sharpest rule in the feature after the reversal, and the one a future
 * edit is most likely to "fix" by mistake:
 *
 *   FINISHING closes the level. The OUTCOME never gates anything.
 *
 * A `review` run closes the level and earns the certificate exactly as a
 * `clear` run does. Section 11 exists for that sentence alone.
 *
 * PURE: no database, no network. gate.ts is imported for its pure exports —
 * decide(), levelClosed(), levelOpen(), countsTowardsLevel() — which take a
 * Snapshot rather than fetch one, so the gate's real rules can be driven
 * through every combination here without a connection. lib/db.ts builds its
 * pool lazily and nothing below asks it for one.
 *
 * Deliberately no run is ever written. migration 042's delete trigger has no
 * escape hatch — 045 opened one for achievements and impact_points only — so a
 * row inserted here against production could never be removed again.
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import { COURSE_CONTENT } from '../src/lib/course-content/index.ts';
import { courseFingerprint } from '../src/lib/course-version.ts';
import type { CourseContent } from '../src/lib/course-content/types.ts';
import { hashSeed } from '../src/lib/practice.ts';
import { countPhrase } from '../src/lib/when.ts';
import { challengeLevelsAr, challengeLevelsEn } from '../src/lib/dictionaries/challenge-levels.ts';
import { coursesInLevel, LEVELS } from '../src/lib/programme/definition.ts';
import {
  countsTowardsLevel,
  decide,
  levelClosed,
  levelOpen,
  RUN_REQUIRED_FROM,
  type Snapshot,
} from '../src/lib/programme/gate.ts';
import {
  allChallenges,
  challengeFingerprint,
  challengeForLevel,
  checkMove,
  choiceOrderFor,
  coursesBehind,
  coursesTouched,
  everyPath,
  openingFor,
  outcomeOf,
  pickIndex,
  reachableSteps,
  seedFor,
  stepById,
  uniformDepth,
  walk,
  type Choice,
  type Decision,
  type LevelChallenge,
  type Step,
} from '../src/lib/programme/level-challenge.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1;
  else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

const REPO = fileURLToPath(new URL('..', import.meta.url));
const readSource = (...parts: string[]): string => {
  const path = join(REPO, ...parts);
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
};

/**
 * The same file with its comments removed.
 *
 * Every assertion below that reads source is about what the code does, and
 * these files explain themselves at length — the engine's own header says the
 * words `course_attempts`, `server-only`, `Math.random` and "percentage" while
 * explaining why it contains none of them. Scanning the raw text made five
 * assertions fail on their own documentation, which would have taught the next
 * person that the honest fix is to delete the comment.
 *
 * It matters more after the reversal, not less. gate.ts and credentials.ts now
 * both carry a paragraph saying `review` is not a failure and earns the
 * certificate exactly as `clear` does — so a check that bans the verdict words
 * from those files has to read the code and not the promise about the code.
 */
const codeOf = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');

const ARABIC = /[؀-ۿ]/;
const CHALLENGES = allChallenges();
const COURSES_ALL = Object.values(COURSE_CONTENT) as CourseContent[];

/** Every quiz block in the catalogue, which is the whole of what is marked. */
const quizzesOf = (course: CourseContent) =>
  course.modules.flatMap((m) => m.blocks).filter((b) => b.type === 'quiz');

/* ------------------------------------------------------------------ */
console.log('1. a decision run cannot reach a score, a certificate or a fingerprint');
{
  check('there are decision runs, so the rest of this section means something',
    CHALLENGES.length > 0, `${CHALLENGES.length} authored`);

  /*
   * Said three ways, because it is the one property that costs somebody their
   * certificate if it stops holding.
   */
  const marked = CHALLENGES.flatMap((c) =>
    c.steps.flatMap((s) => [
      ...(('correct' in s) ? [`${c.level}/${s.id}`] : []),
      ...s.choices.filter((ch) => 'correct' in ch).map((ch) => `${c.level}/${s.id}/${ch.id}`),
    ]),
  );
  check('no situation and no option carries a marked answer', marked.length === 0,
    marked.slice(0, 4).join(',') || 'nothing marked anywhere');

  const asBlocks = CHALLENGES.flatMap((c) => c.steps).filter((s) => 'type' in s);
  check('no situation is shaped like a course block at all', asBlocks.length === 0,
    'questionsIn() collects blocks whose type is quiz; these have no type field');

  const slugs = new Set(Object.keys(COURSE_CONTENT));
  const collide = CHALLENGES.filter((c) => slugs.has(`level-${c.level}-run`) || slugs.has(String(c.level)));
  check('no decision run occupies a course slug', collide.length === 0,
    `${slugs.size} courses in the catalogue`);

  /*
   * A stored decision names a step id and a choice id. If either could collide
   * with a course question id, a row in one table could be read as an answer in
   * the other — which is the shape of the accident this whole separation exists
   * to make impossible.
   */
  const questionIds = new Set(COURSES_ALL.flatMap((c) => quizzesOf(c).map((q) => (q as { id: string }).id)));
  const runIds = CHALLENGES.flatMap((c) => [
    ...c.steps.map((s) => s.id),
    ...c.steps.flatMap((s) => s.choices.map((ch) => ch.id)),
  ]);
  const shared = runIds.filter((id) => questionIds.has(id));
  check('no situation or option id collides with a marked question id',
    shared.length === 0, shared.slice(0, 4).join(',') || `${questionIds.size} question ids checked`);

  // ---- the fingerprint, and the control that proves the hash is alive.
  let drifted = 0;
  for (const course of COURSES_ALL) {
    if (courseFingerprint(course) !== courseFingerprint(structuredClone(course))) drifted += 1;
  }
  check('every course fingerprint is stable across a recomputation', drifted === 0,
    `${COURSES_ALL.length} courses`);

  /*
   * The prose of a whole decision run spliced into a course as ordinary
   * content. This is the accident being guarded against — somebody deciding a
   * run "belongs" inside its level's course — and it must move nothing.
   */
  let movedByProse = 0;
  const runProse = CHALLENGES[0].steps.map((s) => ({
    type: 'text' as const,
    content: { ar: s.situation.ar, en: s.situation.en },
  }));
  for (const course of COURSES_ALL) {
    const before = courseFingerprint(course);
    const spliced: CourseContent = {
      ...course,
      modules: course.modules.map((m, i) =>
        i === 0 ? { ...m, blocks: [...m.blocks, ...runProse] } : m),
    };
    if (courseFingerprint(spliced) !== before) movedByProse += 1;
  }
  check('splicing a whole decision run into a course as prose moves no fingerprint',
    movedByProse === 0, movedByProse === 0 ? `${COURSES_ALL.length} courses` : `${movedByProse} moved`);

  /*
   * THE CONTROL.
   *
   * Everything above asserts that a fingerprint did not move. A hash that had
   * stopped hashing would satisfy every one of them. So: change the thing the
   * hash exists to notice, and require it to move, on every course that has a
   * question to change.
   */
  const withQuestions = COURSES_ALL.filter((c) => quizzesOf(c).length > 0);
  let unmoved = 0;
  for (const course of withQuestions) {
    const mutated = structuredClone(course);
    const quiz = mutated.modules
      .flatMap((m) => m.blocks)
      .find((b) => b.type === 'quiz') as { correct: number } | undefined;
    if (!quiz) continue;
    quiz.correct = (quiz.correct + 1) % 4;
    if (courseFingerprint(mutated) === courseFingerprint(course)) unmoved += 1;
  }
  check('CONTROL: changing which answer is correct moves every course fingerprint',
    withQuestions.length > 0 && unmoved === 0,
    unmoved === 0 ? `${withQuestions.length} courses moved as they should` : `${unmoved} did not move`);

  let markUnmoved = 0;
  for (const course of COURSES_ALL) {
    const mutated = structuredClone(course);
    mutated.passMark = course.passMark === 70 ? 80 : 70;
    if (courseFingerprint(mutated) === courseFingerprint(course)) markUnmoved += 1;
  }
  check('CONTROL: changing a pass mark moves every course fingerprint too',
    markUnmoved === 0, markUnmoved === 0 ? `${COURSES_ALL.length} courses` : `${markUnmoved} did not move`);

  // And the run's own fingerprint is a separate function over a separate type.
  check('a decision run has a fingerprint of its own', CHALLENGES.every((c) =>
    /^[0-9a-f]{12}$/.test(challengeFingerprint(c))));
  check('and no two runs share it',
    new Set(CHALLENGES.map(challengeFingerprint)).size === CHALLENGES.length);
  check('rewording prose does not move it', (() => {
    const edited = structuredClone(CHALLENGES[0]);
    edited.steps[0].situation.ar = 'نصّ مختلف تماماً لأغراض الاختبار';
    edited.steps[0].choices[0].consequence.en = 'Entirely different wording for the probe.';
    return challengeFingerprint(edited) === challengeFingerprint(CHALLENGES[0]);
  })(), 'a hash that churned on every copy-edit would stop meaning anything');
  check('CONTROL: but changing where an option leads does move it', (() => {
    const edited = structuredClone(CHALLENGES[0]);
    const step = edited.steps.find((s) => s.choices.some((c) => c.next !== null));
    if (!step) return false;
    const choice = step.choices.find((c) => c.next !== null);
    if (!choice) return false;
    choice.next = null;
    return challengeFingerprint(edited) !== challengeFingerprint(CHALLENGES[0]);
  })(), 'the branching shape is exactly what it is supposed to cover');
}

/* ------------------------------------------------------------------ */
console.log('\n2. the gate and the issuer now consult finished runs; the engine still may not');
{
  /*
   * THIS SECTION USED TO ASSERT THE OPPOSITE, AND IT WAS RIGHT TO.
   *
   * Until the reversal a decision run gated nothing, and the way to mean that
   * was to require that the modules deciding access did not know the feature
   * existed. That premise is gone: finishing a run is what closes a level now,
   * so gate.ts reads level_challenge_runs and credentials.ts reads it too. A
   * probe still banning the import would go red on the feature working, and the
   * obvious way to make it green again would be to break the feature.
   *
   * So the assertions are inverted rather than deleted — the point of a
   * separation is worth nothing if nobody can say which way it runs. What
   * survives untouched is the DIRECTION:
   *
   *   gate.ts / credentials.ts  ->  the runs TABLE      (they may, and do)
   *   level-challenge-runs.ts   ->  the engine          (it may, and does)
   *   the engine                ->  anything at all     (it may not, and does not)
   *
   * The gate learned about runs. The engine learned nothing. It is still a pure
   * function over authored data, which is why every section but this one can
   * drive it without a database.
   */
  const gate = readSource('src', 'lib', 'programme', 'gate.ts');
  const credentials = readSource('src', 'lib', 'programme', 'credentials.ts');
  const badges = readSource('src', 'lib', 'programme', 'level-badges.ts');
  check('the gate, the credential issuer and the badges are all there to read',
    gate.length > 0 && credentials.length > 0 && badges.length > 0);

  const gateCode = codeOf(gate);
  const credsCode = codeOf(credentials);
  const badgesCode = codeOf(badges);

  check('the gate now knows decision runs exist',
    /level_challenge_runs/.test(gateCode),
    'INVERTED: a finished run is half of what closes a level');
  check('and it reads them as what a level closes on',
    /finished_at IS NOT NULL/.test(gateCode) && /levelsWithFinishedRun/.test(gateCode),
    'finished, not cleared — see section 11');
  check('the credential issuer consults them too',
    /level_challenge_runs/.test(credsCode) && /finished_at IS NOT NULL/.test(credsCode),
    'INVERTED: the gate and the certificate have to fire from the same event');
  check('and it still refuses to issue anything nobody earned',
    /course_attempts/.test(credsCode) && /NOT EXISTS/.test(credsCode),
    'the earning condition is still the query, not a caller\'s assertion');
  check('the gate still unlocks from course_attempts as well',
    /course_attempts/.test(gateCode) && /passed/.test(gateCode),
    'the courses of the level, and then the run — not the run alone');
  check('the level badges still know nothing about any of it',
    !/level-challenge|challenge-content|level_challenge/.test(badgesCode),
    'a run earns a level, and the badge is earned from the level');

  /*
   * The engine, which is the half that did not move. Read as text on purpose:
   * the rule is not "no test happened to reach a certificate", it is that the
   * module computing the branching cannot reach one. An import is how that
   * stops being true.
   */
  const engineRaw = readSource('src', 'lib', 'programme', 'level-challenge.ts');
  const engineCode = codeOf(engineRaw);
  check('the engine is there to read', engineRaw.length > 0);
  for (const table of ['course_attempts', 'certificates', 'level_progress', 'course_module_progress']) {
    check(`the engine never touches ${table}`, !engineCode.includes(table));
  }
  check('the engine never touches its own table either',
    !engineCode.includes('level_challenge_runs'),
    'the rules are pure; the queries live next door in level-challenge-runs.ts');
  check('the engine imports no database module',
    !/from '\.\.\/db'|'server-only'/.test(engineCode),
    'server-only in lib/db.ts would poison every importer, this probe included');
  check('and it imports neither the gate nor the persistence module',
    !/from '\.\/gate'/.test(engineCode) && !/level-challenge-runs/.test(engineCode),
    'the dependency runs gate -> runs -> engine, and a cycle would let it run back');
}

/* ------------------------------------------------------------------ */
console.log('\n3. nothing is random, and a run can be rebuilt from what is stored');
{
  const def = CHALLENGES[0];

  const engineCode = codeOf(readSource('src', 'lib', 'programme', 'level-challenge.ts'));
  const contentCode = codeOf(
    CHALLENGES.map((c) => readSource('src', 'lib', 'challenge-content', `level-${c.level}.ts`)).join(''),
  );
  check('Math.random appears nowhere in the feature',
    !/Math\.random/.test(engineCode) && !/Math\.random/.test(contentCode),
    'a path nobody can reconstruct is a result nobody can review');

  check('the same person and the same run always seed the same',
    seedFor('user-a', 'run-1') === seedFor('user-a', 'run-1'));
  check('a second run by the same person seeds differently',
    seedFor('user-a', 'run-1') !== seedFor('user-a', 'run-2'),
    'otherwise taking it again would deal the same paper');
  check('two people on the same run id seed differently',
    seedFor('user-a', 'run-1') !== seedFor('user-b', 'run-1'));
  check('the seed is a non-negative integer, which is what the column stores',
    Number.isInteger(seedFor('u', 'r')) && seedFor('u', 'r') >= 0, seedFor('u', 'r'));

  /*
   * The opening is picked from a small pool, and shuffleIndices cannot do it:
   * for a pool of two it never returns the authored order, so it would answer
   * "the second one" every single time and no volunteer would ever see the
   * first situation.
   */
  for (const c of CHALLENGES) {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i += 1) {
      const opening = openingFor(c, hashSeed(`spread:${i}`));
      if (opening) seen.add(opening.id);
    }
    check(`level ${c.level}: every authored opening is actually reachable`,
      seen.size === c.openings.length, `${seen.size} of ${c.openings.length} over 500 seeds`);
  }

  check('the same seed always picks the same opening',
    openingFor(def, 12345)?.id === openingFor(def, 12345)?.id);
  check('pickIndex stays inside the list', (() => {
    for (let i = 0; i < 400; i += 1) {
      const n = pickIndex(3, i);
      if (!Number.isInteger(n) || n < 0 || n >= 3) return false;
    }
    return true;
  })());
  check('one candidate is picked without a shuffle', pickIndex(1, 999) === 0);

  // ---- the option order.
  let identity = 0;
  let malformed = 0;
  for (const c of CHALLENGES) {
    for (const step of c.steps) {
      for (let s = 0; s < 120; s += 1) {
        const order = choiceOrderFor(step, s);
        if (order.every((v, i) => v === i)) identity += 1;
        const set = new Set(order);
        if (order.length !== step.choices.length || set.size !== order.length) malformed += 1;
      }
    }
  }
  check('the options are never shown in the order they were authored', identity === 0,
    'the sound option tends to be written first; showing it first would be the whole answer');
  check('and the shown order is always a complete permutation', malformed === 0);
  check('the same run shows the same step the same way twice',
    choiceOrderFor(def.steps[0], 77).join() === choiceOrderFor(def.steps[0], 77).join(),
    'a reload that reshuffled would let somebody hunt for a different option set');
  /*
   * A distribution, not a pair. Three options have only five non-identity
   * arrangements between them, so two particular seeds landing on the same one
   * is ordinary rather than a defect — asserting on one pair would make this
   * probe fail on a shuffle that was working perfectly.
   */
  check('the arrangement genuinely varies from run to run', (() => {
    const seen = new Set<string>();
    for (let s = 0; s < 200; s += 1) seen.add(choiceOrderFor(def.steps[0], s).join());
    return seen.size > 1;
  })(), 'one arrangement for every run would be a fixed paper with extra steps');
  check('and it depends on the situation as well as on the run', (() => {
    const seen = new Set<string>();
    for (const step of def.steps) seen.add(choiceOrderFor(step, 55).join());
    return seen.size > 1;
  })(), 'otherwise one volunteer meets the same arrangement three times over');

  /*
   * THE REPRODUCIBILITY PROMISE, stated as the thing a reviewer actually does:
   * take the stored seed and the stored decisions, and read back exactly what
   * was on the screen. It matters more now than it did: the staff reader at
   * /staff/decision-runs/[id] rebuilds another person's run from these two
   * columns and shows it to somebody who was not there.
   */
  const seed = seedFor('volunteer-x', 'run-x');
  const takeSoundPath = (c: LevelChallenge, s: number): Decision[] => {
    const out: Decision[] = [];
    let current: Step | null = openingFor(c, s);
    while (current) {
      const chosen = current.choices.find((ch) => ch.weight === 'sound') ?? current.choices[0];
      out.push({ step: current.id, choice: chosen.id });
      current = chosen.next ? stepById(c, chosen.next) : null;
    }
    return out;
  };
  const decisions = takeSoundPath(def, seed);
  const first = walk(def, seed, decisions);
  const second = walk(def, seed, decisions);
  check('a run walked twice from the same stored row is identical',
    first.ok && second.ok
    && JSON.stringify(first.walked.map((w) => [w.step.id, w.shown.map((c) => c.id), w.chosen.id]))
      === JSON.stringify(second.walked.map((w) => [w.step.id, w.shown.map((c) => c.id), w.chosen.id])),
    'this is the answer to "what was this person actually asked?"');
  check('and it recovers the options in the position they appeared in',
    first.ok && first.walked.every((w) =>
      w.shown.length === w.step.choices.length && w.shown.includes(w.chosen)));
  check('a finished run reports itself finished', first.ok && first.done);
  check('a run one decision short is not finished, and names what is on screen',
    (() => {
      const partial = walk(def, seed, decisions.slice(0, -1));
      return partial.ok && !partial.done && partial.current !== null;
    })());
  check('a different seed can produce a different paper for the same person',
    (() => {
      const other = seedFor('volunteer-x', 'run-y');
      const a = walk(def, seed, takeSoundPath(def, seed));
      const b = walk(def, other, takeSoundPath(def, other));
      if (!a.ok || !b.ok) return false;
      const shape = (p: typeof a) => p.ok ? p.walked.map((w) => [w.step.id, w.shown.map((c) => c.id).join()].join(':')).join('>') : '';
      return shape(a) !== shape(b);
    })(),
    'same decisions, different run — the arrangement must not be shared');
}

/* ------------------------------------------------------------------ */
console.log('\n4. the branching is real, and no path is shorter than another');
{
  for (const c of CHALLENGES) {
    const depth = uniformDepth(c);
    check(`level ${c.level}: every path takes the same number of decisions`,
      depth !== null && depth > 1, depth === null ? 'paths disagree, or there is a cycle' : `${depth} decisions`);

    const reachable = reachableSteps(c);
    const orphans = c.steps.filter((s) => !reachable.has(s.id)).map((s) => s.id);
    check(`level ${c.level}: every authored situation can actually be reached`,
      orphans.length === 0, orphans.join(',') || `${reachable.size} situations`);

    const dangling = c.steps.flatMap((s) =>
      s.choices.filter((ch) => ch.next !== null && stepById(c, ch.next) === null)
        .map((ch) => `${s.id}/${ch.id}`));
    check(`level ${c.level}: no option leads somewhere that does not exist`,
      dangling.length === 0, dangling.join(',') || 'all destinations resolve');

    /*
     * A branch that goes nowhere different is decoration. This is the assertion
     * that separates a branching challenge from a linear one wearing its name.
     */
    const decorative = c.steps
      .filter((s) => s.choices.some((ch) => ch.next !== null))
      .filter((s) => new Set(s.choices.map((ch) => ch.next)).size < 2)
      .map((s) => s.id);
    check(`level ${c.level}: no situation sends every answer to the same place`,
      decorative.length === 0, decorative.join(',') || 'every branch divides');

    const paths = everyPath(c);
    check(`level ${c.level}: there is more than one distinct paper`,
      paths.length > 1, `${paths.length} distinct sequences of situations`);
    check(`level ${c.level}: the openings do not converge immediately`,
      new Set(paths.map((p) => p[0])).size === c.openings.length,
      `${c.openings.length} openings`);

    // The last round ends, and nothing before it does.
    const depthOf = depth ?? 0;
    const endsEarly = c.steps.filter((s) => s.round < depthOf && s.choices.some((ch) => ch.next === null));
    check(`level ${c.level}: nothing ends the run before the last round`,
      endsEarly.length === 0, endsEarly.map((s) => s.id).join(',') || 'ends only at the end');
    const lastRound = c.steps.filter((s) => s.round === depthOf);
    check(`level ${c.level}: every option in the last round ends the run`,
      lastRound.length > 0 && lastRound.every((s) => s.choices.every((ch) => ch.next === null)));
  }
}

/* ------------------------------------------------------------------ */
console.log('\n5. it draws on the level rather than on one course');
{
  for (const c of CHALLENGES) {
    const core = coursesBehind(c.level);
    check(`level ${c.level}: the level has core courses to draw on`, core.length > 0, core.length);

    const unknown = c.steps.flatMap((s) => s.draws.filter((d) => !core.includes(d)));
    check(`level ${c.level}: every situation names a real course of that level`,
      unknown.length === 0, [...new Set(unknown)].join(',') || `${core.length} courses`);

    const thin = c.steps.filter((s) => new Set(s.draws).size < 2).map((s) => s.id);
    check(`level ${c.level}: no situation rests on a single course`,
      thin.length === 0, thin.join(',') || 'every situation needs at least two at once');

    const covered = new Set(c.steps.flatMap((s) => s.draws));
    const missed = core.filter((s) => !covered.has(s));
    check(`level ${c.level}: the run as a whole covers every course in the level`,
      missed.length === 0, missed.join(',') || `${covered.size} of ${core.length}`);

    /*
     * Not just the pool — every individual walk. A challenge whose coverage
     * only holds when you add up all the branches would still let one
     * volunteer answer three questions out of one course.
     */
    const shallow = everyPath(c).filter((p) => {
      const walked = p.map((id) => stepById(c, id)).filter((s): s is Step => s !== null)
        .map((s) => ({ step: s, shown: s.choices, chosen: s.choices[0] }));
      return coursesTouched(walked).length < 3;
    });
    check(`level ${c.level}: every single path leans on at least three courses`,
      shallow.length === 0, shallow.length === 0 ? 'all paths' : `${shallow.length} thin path(s)`);
  }

  const levelled = CHALLENGES.every((c) => LEVELS.some((l) => l.number === c.level && l.number >= 1));
  check('every run belongs to a real level, and never to the orientation', levelled,
    CHALLENGES.map((c) => c.level).join(','));
  check('no level has two runs',
    new Set(CHALLENGES.map((c) => c.level)).size === CHALLENGES.length);
  check('a level with no run authored answers null rather than improvising',
    LEVELS.filter((l) => l.number >= 1).every((l) =>
      CHALLENGES.some((c) => c.level === l.number) || challengeForLevel(l.number) === null),
    `authored: ${CHALLENGES.map((c) => c.level).join(',')}`);
  check('and the courses behind a level exclude its own challenge course',
    CHALLENGES.every((c) => !coursesBehind(c.level).some((s) => s.includes('-challenge'))),
    'a run leans on what was taught, not on the paper at the end of it');
}

/* ------------------------------------------------------------------ */
console.log('\n6. what an option may be, and what a run may say about a person');
{
  for (const c of CHALLENGES) {
    const ids = c.steps.map((s) => s.id);
    check(`level ${c.level}: situation ids are unique`, new Set(ids).size === ids.length);
    const choiceIds = c.steps.flatMap((s) => s.choices.map((ch) => `${s.id}/${ch.id}`));
    check(`level ${c.level}: option ids are unique within their situation`,
      new Set(choiceIds).size === choiceIds.length);

    const noWayThrough = c.steps.filter((s) => !s.choices.some((ch) => ch.weight === 'sound'));
    check(`level ${c.level}: every situation offers a defensible answer`,
      noWayThrough.length === 0, noWayThrough.map((s) => s.id).join(',') || 'a clear run is always possible');

    const free = c.steps.filter((s) => s.choices.every((ch) => ch.weight === 'sound'));
    check(`level ${c.level}: and every situation costs something to get wrong`,
      free.length === 0, free.map((s) => s.id).join(',') || 'no situation is a free tick');

    const tooFew = c.steps.filter((s) => s.choices.length < 3);
    check(`level ${c.level}: every situation offers a real choice`,
      tooFew.length === 0, tooFew.map((s) => s.id).join(',') || 'three or more everywhere');

    const silent = c.steps.flatMap((s) =>
      s.choices.filter((ch) => ch.consequence.ar.length < 40 || ch.consequence.en.length < 40)
        .map((ch) => `${s.id}/${ch.id}`));
    check(`level ${c.level}: every option says what it actually costs`,
      silent.length === 0, silent.slice(0, 3).join(',') || 'the consequence is the teaching, not the label');
  }

  // ---- the outcome, which is three words and can never become a number.
  const def = CHALLENGES[0];
  const seed = seedFor('u', 'r');
  const opening = openingFor(def, seed);
  const pick = (weight: string) => {
    const out: Decision[] = [];
    let current: Step | null = opening;
    while (current) {
      const chosen = current.choices.find((ch) => ch.weight === weight) ?? current.choices[0];
      out.push({ step: current.id, choice: chosen.id });
      current = chosen.next ? stepById(def, chosen.next) : null;
    }
    return out;
  };
  const walkedOf = (d: Decision[]) => {
    const p = walk(def, seed, d);
    return p.ok ? p.walked : [];
  };
  check('every decision sound reads as clear', outcomeOf(walkedOf(pick('sound'))) === 'clear');
  check('a costly decision anywhere reads as held',
    outcomeOf(walkedOf(pick('costly'))) === 'held');
  check('a harmful decision anywhere reads as review, whatever else was right',
    outcomeOf(walkedOf(pick('harmful'))) === 'review');
  check('and harmful outranks costly rather than averaging with it', (() => {
    const mixed = walkedOf(pick('costly'));
    const harmful = walkedOf(pick('harmful'));
    if (mixed.length === 0 || harmful.length === 0) return false;
    return outcomeOf([...mixed.slice(1), harmful[0]]) === 'review';
  })(), 'a mark out of three would have let two right answers cancel a crossed line');
  check('an empty run is not a verdict about anybody', outcomeOf([]) === 'clear');

  const engineCode = codeOf(readSource('src', 'lib', 'programme', 'level-challenge.ts'));
  check('the engine computes no percentage and no total out of the decisions',
    !/\/\s*walked\.length|\*\s*100|percent|toFixed/i.test(engineCode),
    'the moment a number exists somebody puts it beside somebody else\'s');
  check('and it never sorts or ranks anything about a person',
    !/ORDER BY|\brank\b|leaderboard/i.test(engineCode));

  /*
   * Safeguarding values are not merely absent from the screen — there is no
   * field here that could carry one. A run knows a level, a seed and a list of
   * decisions.
   */
  const surface = engineCode + codeOf(readSource('src', 'lib', 'challenge-content', 'types.ts'));
  const forbidden = ['date_of_birth', 'dateOfBirth', 'dob', 'age', 'emergency', 'safeguarding_'];
  const leaked = forbidden.filter((f) => new RegExp(`\\b${f}`, 'i').test(surface));
  check('no date of birth, age or safeguarding value can reach this feature',
    leaked.length === 0, leaked.join(',') || 'no field exists to carry one');
}

/* ------------------------------------------------------------------ */
console.log('\n7. a crafted request cannot skip, repeat or rewrite a run');
{
  const def = CHALLENGES[0];
  const seed = seedFor('u', 'r');
  const opening = openingFor(def, seed);
  const firstChoice = opening?.choices[0];

  check('the run has somewhere to start', opening !== null && firstChoice !== undefined);
  if (opening && firstChoice) {
    check('the situation on screen accepts its own option',
      checkMove(def, seed, [], { step: opening.id, choice: firstChoice.id }).ok);

    const elsewhere = def.steps.find((s) => s.id !== opening.id);
    check('a decision naming a different situation is refused', (() => {
      if (!elsewhere) return false;
      const move = checkMove(def, seed, [], { step: elsewhere.id, choice: elsewhere.choices[0].id });
      return !move.ok && move.reason === 'wrong-step';
    })(), 'this is what stops a request jumping straight to the last situation');

    check('an option that is not on this situation is refused', (() => {
      const move = checkMove(def, seed, [], { step: opening.id, choice: 'not-a-real-option' });
      return !move.ok && move.reason === 'unknown-choice';
    })());

    const full: Decision[] = [];
    let current: Step | null = opening;
    while (current) {
      // Annotated rather than inferred: `chosen` is derived from `current` and
      // then reassigns it, which TypeScript reads as a circular initializer.
      const chosen: Choice = current.choices[0];
      full.push({ step: current.id, choice: chosen.id });
      current = chosen.next ? stepById(def, chosen.next) : null;
    }
    check('a finished run refuses a further decision', (() => {
      const move = checkMove(def, seed, full, full[full.length - 1]);
      return !move.ok && move.reason === 'finished';
    })(), 'answering again after reading the consequence is the obvious exploit');

    check('answering the same situation twice is refused', (() => {
      const move = checkMove(def, seed, [full[0]], full[0]);
      return !move.ok && move.reason === 'wrong-step';
    })());

    check('stored decisions that do not describe this run are reported, not guessed at',
      (() => {
        const nonsense = walk(def, seed, [{ step: 'no-such-step', choice: 'x' }]);
        return !nonsense.ok && nonsense.reason === 'out-of-order';
      })());
    check('and a walk that stops making sense returns rather than throwing',
      (() => {
        const bad = walk(def, seed, [{ step: opening.id, choice: 'ghost' }]);
        return !bad.ok && bad.reason === 'unknown-choice' && Array.isArray(bad.walked);
      })(),
      'a hand-edited row must not take a page down for everybody else');
  }
}

/* ------------------------------------------------------------------ */
console.log('\n8. both languages, everywhere, and Arabic that is actually Arabic');
{
  const problems: string[] = [];
  const both = (where: string, ar: string, en: string) => {
    if (!ar?.trim() || !en?.trim()) problems.push(`${where}: empty`);
    else if (!ARABIC.test(ar)) problems.push(`${where}: Arabic side is not Arabic`);
    else if (ar === en) problems.push(`${where}: same string in both`);
  };

  for (const c of CHALLENGES) {
    both(`level ${c.level} title`, c.title.ar, c.title.en);
    both(`level ${c.level} lede`, c.lede.ar, c.lede.en);
    for (const step of c.steps) {
      both(`${step.id} situation`, step.situation.ar, step.situation.en);
      both(`${step.id} question`, step.question.ar, step.question.en);
      for (const choice of step.choices) {
        both(`${step.id}/${choice.id} text`, choice.text.ar, choice.text.en);
        both(`${step.id}/${choice.id} consequence`, choice.consequence.ar, choice.consequence.en);
      }
    }
  }
  check('nothing is left untranslated or pasted across', problems.length === 0,
    problems.slice(0, 4).join(' | ') || `${CHALLENGES.length} runs checked`);

  const when = readSource('src', 'lib', 'when.ts');
  check('countPhrase exists for whoever writes the screen strings',
    /export function countPhrase/.test(when),
    'Arabic counts in bands; a screen saying «2 قرارات» would be wrong in two ways');
}

/* ------------------------------------------------------------------ */
console.log('\n9. the levels this run leans on are still the levels that exist');
{
  for (const c of CHALLENGES) {
    const inLevel = coursesInLevel(c.level);
    check(`level ${c.level} still has its courses in the programme definition`,
      inLevel.length > 0, `${inLevel.length} courses`);
  }
  check('a run is never authored for a level the programme does not have',
    CHALLENGES.every((c) => LEVELS.some((l) => l.number === c.level)));

  /*
   * The marked paper. This used to read "untouched by any of this — the marked
   * paper still exists and still ends the level", and the second half of that
   * is exactly what the reversal took away.
   *
   * Both halves are still worth asserting, and they pull in opposite
   * directions. It must still EXIST: forty-one attempts were sat against it and
   * deleting a course deletes what those attempts refer to, so the demotion had
   * to be from "closes the level" to "revision", not from "closes the level" to
   * "gone". And it must now close NOTHING: countsTowardsLevel excludes it, so
   * neither the gate, the run's own precondition nor the level certificate
   * waits for a paper nothing else asks of anybody.
   */
  check('the challenge course at the end of each level still exists',
    CHALLENGES.every((c) => coursesInLevel(c.level).some((x) => x.kind === 'challenge')),
    'demoted to revision, never deleted — past attempts still point at it');
  check('and it no longer closes anything',
    CHALLENGES.every((c) =>
      coursesInLevel(c.level).filter((x) => x.kind === 'challenge').every((x) => !countsTowardsLevel(x))),
    'INVERTED: countsTowardsLevel excludes it, so nothing waits on the paper');
  check('while every course that teaches the level still counts towards it',
    CHALLENGES.every((c) =>
      coursesInLevel(c.level).filter((x) => x.kind !== 'challenge').every(countsTowardsLevel)),
    'the CONTROL for the line above: a predicate that excluded everything would pass it');
}

/* ------------------------------------------------------------------ */
console.log('\n10. a volunteer can actually get to it, staff can read it, and the write path checks who they are');
{
  /*
   * This section exists because the feature was, for a while, a great many
   * probed behaviours that nothing under src/app imported. Logic nobody can
   * reach is not a feature, and a probe that only exercises the logic cannot
   * tell the difference. The same reasoning now covers the staff queue, which
   * arrived with the reversal and is just as easy to leave unrouted.
   */
  const route = readSource('src', 'app', '[lang]', 'academy', 'challenge', '[level]', 'page.tsx');
  const routeCode = codeOf(route);
  check('there is a route where the run can be taken', route.length > 0,
    '/[lang]/academy/challenge/[level]');
  check('and it renders the authored run rather than inventing one',
    /challengeForLevel/.test(routeCode) && /shownChoices/.test(routeCode),
    'the arrangement must come from the engine, seeded by the stored run');
  /*
   * `readyForRun`, which is what levelIsComplete was renamed to. Matched on the
   * CALL rather than on the name, because both names sit on one import line and
   * an indexOf over the whole file would have been satisfied by the import
   * alone — green whatever order the calls were actually in.
   */
  check('the route refuses before it fetches, for a level whose courses are not done',
    routeCode.includes('readyForRun(user.id')
    && routeCode.indexOf('readyForRun(user.id') < routeCode.indexOf('openRun(user.id'),
    'a refusal that queries first is a refusal that already did the work');

  const academy = readSource('src', 'app', '[lang]', 'academy', 'page.tsx');
  const academyCode = codeOf(academy);
  check('a learner is linked to it from somewhere they already look',
    /academy\/challenge\//.test(academyCode), 'the academy level view');

  /*
   * ASSERTED AS MEANING, NOT AS A LINE OF SOURCE.
   *
   * This check used to require the literal string
   * `inLevel.every((c) => passed.has(c.slug))`. When the rule changed to
   * `inLevel.filter(countsTowardsLevel).every(...)` the probe went red on a
   * page that had been corrected, and the shortest way back to green would have
   * been to reinstate the bug. A regex over one expression asserts that nobody
   * edited a line; it does not assert anything about what the line does.
   *
   * What actually matters is two things: the offer appears once the courses
   * that COUNT are passed, and "which courses count" is decided by the gate's
   * own predicate rather than by a second copy living in a page. So the page is
   * required to delegate, and the predicate is then exercised directly.
   */
  const offer = (() => {
    const i = academyCode.indexOf('challengeForLevel(');
    const j = i < 0 ? -1 : academyCode.indexOf(';', i);
    return i < 0 || j < 0 ? '' : academyCode.slice(i, j);
  })();
  check('the offer is decided by the level\'s counting courses being passed',
    offer.length > 0 && /countsTowardsLevel/.test(offer) && /\.every\(/.test(offer),
    offer.length > 0 ? 'the same expression that offers the run filters through the gate' : 'expression not found');
  check('and specifically does not wait for the marked paper',
    countsTowardsLevel({ kind: 'challenge' }) === false
    && countsTowardsLevel({ kind: 'core' }) === true
    && countsTowardsLevel({ kind: 'orientation' }) === true,
    'the predicate itself, exercised — this is the claim, not the source line');
  check('the page keeps no second copy of that rule',
    /programme\/gate/.test(academy) && !/kind\s*===\s*'challenge'/.test(academyCode),
    'a private copy is free to drift, and drifted once already');

  const action = readSource('src', 'lib', 'actions', 'level-challenge.ts');
  const actionCode = codeOf(action);
  check('the write path exists', action.length > 0);
  check('it is a server action', /^'use server'/m.test(action));
  check('both actions establish who the caller is from the session',
    (actionCode.match(/await currentUser\(\)/g) ?? []).length >= 2,
    'never from the form — that is the one thing a form may not say');
  check('and both refuse when there is nobody signed in',
    (actionCode.match(/if \(!user\) return;/g) ?? []).length >= 2);
  check('the level is validated rather than cast',
    /\[1-6\]/.test(actionCode),
    '"3; DROP" must become null here, not NaN inside a query');

  const runs = readSource('src', 'lib', 'level-challenge-runs.ts');
  const runsCode = codeOf(runs);
  check('the persistence module exists', runs.length > 0);
  check('both write paths re-check that the learner\'s courses are behind them',
    (runsCode.match(/await readyForRun\(/g) ?? []).length >= 2,
    'renamed from levelIsComplete: the run is the precondition, not the completion');
  check('a decision is checked against the stored run before it is written',
    /checkMove\(def, run\.seed, run\.decisions, move\)/.test(runsCode),
    'this is what refuses a skip, a repeat, and an option never shown');
  check('the open run is locked while a decision is appended',
    /FOR UPDATE/.test(runsCode), 'two quick taps must not both think they are first');

  /*
   * Every write is scoped to one person. Asserted rather than assumed, because
   * a WHERE that lost its user_id would be invisible: the feature would go on
   * working, for everybody's rows at once.
   */
  const writes = runsCode.match(/(INSERT INTO|UPDATE)\s+(\w+)/g) ?? [];
  const targets = [...new Set(writes.map((w) => w.split(/\s+/).pop()))];
  check('it writes to exactly one table, and that table is not course_attempts',
    targets.length === 1 && targets[0] === 'level_challenge_runs', targets.join(',') || 'none');

  /*
   * ── THE STAFF READS ────────────────────────────────────────────────────────
   *
   * Two assertions here used to be "this file never mentions profiles" and
   * "every read of the table is scoped to a single user". Both are now false ON
   * PURPOSE: reviewQueue() and runForReview() read across people so that a run
   * ending in `review` is seen by a human being rather than by nobody, and they
   * take a name from `profiles` so the reviewer knows whose conversation it is.
   *
   * Deleting those two checks would have left the interesting half unguarded.
   * The real invariant is narrower and sharper than "never read across people":
   *
   *   ONE COLUMN FROM profiles. ORDER BY TIME ONLY. NOTHING COUNTED, GROUPED
   *   OR RANKED, EVER.
   *
   * That is the line between a queue of moments and a league table of
   * volunteers — and a league table would arrive here as one reasonable-looking
   * ORDER BY, not as a new feature anybody would review as one.
   */
  const profileColumns = [...new Set([...runsCode.matchAll(/\bp\.([a-z_]+)/gi)].map((m) => m[1]))];
  check('the staff reads take exactly one column from profiles, and it is the name',
    profileColumns.length > 0
    && profileColumns.every((c) => c === 'full_name' || c === 'user_id')
    && profileColumns.includes('full_name')
    && !/\bp\.\*/.test(runsCode),
    profileColumns.join(',') + ' — user_id is the join, full_name is the read');
  check('and nothing here goes near the sensitive profile at all',
    !/profiles_sensitive/.test(runsCode),
    'the date of birth and the safeguarding fields live there; a SELECT * would fetch them');

  const orderBys = [...runsCode.matchAll(/ORDER BY\s+([^\n]*)/gi)]
    .map((m) => m[1].replace(/[`'"].*$/, '').trim());
  check('every ordering in the file is by time and by nothing else',
    orderBys.length > 0
    && orderBys.every((o) => /^(r\.)?(started_at|finished_at)\s+(ASC|DESC)$/i.test(o)),
    orderBys.join(' | ') || 'no ORDER BY found');
  check('no ordering anywhere touches the outcome',
    !orderBys.some((o) => /outcome/i.test(o)),
    'sorting review to the top is how a list of conversations becomes a list of the worst');
  check('nobody is counted, and nobody is grouped',
    !/GROUP BY/i.test(runsCode) && !/\bCOUNT\s*\(/i.test(runsCode)
    && !/\bRANK\s*\(/i.test(runsCode),
    'a tally of how often a name appears is a record being built about a person');

  /*
   * And the scoping rule, restated so it still bites: the ONLY reads that are
   * not tied to one user_id are the two that join profiles. Both of those alias
   * the table `r`; every learner-facing read does not.
   */
  const acrossPeople = (runsCode.match(/FROM level_challenge_runs r\b/g) ?? []).length;
  const ownRowsOnly = (runsCode.match(/FROM level_challenge_runs(?! r\b)/g) ?? []).length;
  const scoped = (runsCode.match(/user_id = \$1/g) ?? []).length;
  check('exactly two reads cross between people, and they are the staff ones',
    acrossPeople === 2 && /reviewQueue/.test(runsCode) && /runForReview/.test(runsCode),
    `${acrossPeople} joined read(s)`);
  check('and every other read of the table is scoped to a single user',
    ownRowsOnly > 0 && ownRowsOnly === scoped,
    `${ownRowsOnly} learner reads, ${scoped} scoped by user_id`);

  /*
   * Reachability again, for the staff half. A review queue nobody can open is
   * the same failure as a decision run nobody can open, and it fails more
   * quietly: the runs still finish, and no person ever sees the ones that
   * crossed a line.
   */
  const queuePage = readSource('src', 'app', '[lang]', 'staff', 'decision-runs', 'page.tsx');
  const readerPage = readSource('src', 'app', '[lang]', 'staff', 'decision-runs', '[id]', 'page.tsx');
  const staffHub = readSource('src', 'app', '[lang]', 'staff', 'page.tsx');
  check('the review queue has a page of its own', queuePage.length > 0 && /reviewQueue\(/.test(queuePage),
    '/[lang]/staff/decision-runs');
  check('a reviewer can open one run and read what was actually met',
    readerPage.length > 0 && /runForReview\(/.test(readerPage) && /\bwalk\(/.test(readerPage),
    'rebuilt from the stored seed by the engine, not from anything re-derived here');
  check('and staff are linked to the queue from the page they start on',
    /staff\/decision-runs/.test(staffHub), 'the staff hub');
  check('the queue refuses before it reads other people\'s runs', (() => {
    const code = codeOf(queuePage);
    const guard = code.indexOf('can(user,');
    const read = code.indexOf('reviewQueue(');
    return guard >= 0 && read > guard;
  })(), 'rendering and then hiding the rows would already have fetched them');

  const migration = readSource('migrations', '042_level_challenge_runs.sql');
  check('migration 042 is written', migration.length > 0);
  check('it refuses deletes with a trigger rather than by convention',
    /BEFORE DELETE ON level_challenge_runs/.test(migration) && /RAISE EXCEPTION/.test(migration));
  check('it is safe to run twice',
    /CREATE TABLE IF NOT EXISTS/.test(migration)
    && /CREATE OR REPLACE FUNCTION/.test(migration)
    && /DROP TRIGGER IF EXISTS/.test(migration));
  check('there is no score, grade or rank column to put on a screen',
    !/\b(score|grade|rank|percent|position)\s+(INTEGER|NUMERIC|TEXT|REAL|BIGINT)/i.test(migration),
    'nothing in this table can be ordered to compare two volunteers');
  check('the seed is wide enough for the hash it stores',
    /seed\s+BIGINT/.test(migration),
    'INTEGER tops out below 2^32 and would have refused about half of all inserts');
  check('and every non-obvious column explains itself',
    (migration.match(/COMMENT ON COLUMN/g) ?? []).length >= 5
    && /COMMENT ON TABLE/.test(migration));
}

/* ------------------------------------------------------------------ */
console.log('\n11. finishing closes the level; the outcome never gates anything');
{
  /*
   * THE SHARPEST RULE IN THE FEATURE, AND THE ONE MOST LIKELY TO BE "FIXED".
   *
   * A `review` run means at least one decision crossed a line. Every instinct
   * says a line like that should hold something back, and the next person to
   * read this code will feel that instinct and have a small, plausible, one-line
   * way to act on it: `AND r.outcome = 'clear'`.
   *
   * It must not happen, and the reason is not softness. A volunteer who senses
   * halfway through that they have erred must have no reason at all to abandon
   * the run and start a cleaner one. Gate on the verdict and you hand them
   * exactly that reason, and the exercise stops recording what anybody would
   * really do. Walking it to the end — including the part that hurt — is the
   * behaviour worth rewarding, so that is the behaviour the gate reads.
   *
   * Driven through gate.ts's own pure functions over a hand-built snapshot, so
   * these are the rules the site runs on rather than a restatement of them.
   */
  type Course = Snapshot['courses'][number];
  const course = (slug: string, kind: Course['kind'], level: number | null): Course => ({
    id: slug,
    slug,
    kind,
    level_number: level,
    title_ar: `دورة ${slug}`,
    title_en: slug,
    status: 'published',
  });

  const WORLD: Course[] = [
    course('probe-orientation', 'orientation', 0),
    course('probe-l1-a', 'core', 1),
    course('probe-l1-b', 'core', 1),
    course('probe-l1-paper', 'challenge', 1),
    course('probe-l2-a', 'core', 2),
    course('probe-l2-paper', 'challenge', 2),
  ];
  const snap = (over: Partial<Snapshot> = {}): Snapshot => ({
    courses: WORLD,
    passed: new Set<string>(),
    levels: new Set<number>(),
    runs: new Set<number>(),
    grandfathered: new Set<number>(),
    requires: new Map<string, string[]>(),
    recommends: new Map<string, string[]>(),
    ...over,
  });
  const COURSES_DONE = new Set(['probe-orientation', 'probe-l1-a', 'probe-l1-b']);

  // ---- courses all passed, run unfinished. The level does not close.
  const waiting = snap({ passed: COURSES_DONE });
  check('a level whose courses are all passed is NOT closed while the run is unfinished',
    levelClosed(waiting, 1) === false,
    'this is the whole reversal in one line');
  check('and level 2 stays shut behind it', levelOpen(waiting, 2) === false);

  const refusal = decide(waiting, 'probe-l2-a');
  const first = refusal.missing[0];
  check('the refusal names the decision run, not a course and not a blank denial',
    refusal.allowed === false && first !== undefined && first.kind === 'decision-run',
    first?.kind ?? 'nothing missing');
  check('and it names the right level',
    first !== undefined && first.kind === 'decision-run' && first.level === 1,
    first !== undefined && first.kind === 'decision-run' ? `level ${first.level}` : 'n/a');
  check('the decision-run refusal carries no slug, because there is nothing to link to',
    first !== undefined && !('slug' in first),
    'a run is not a course; the route is /academy/challenge/{level}');

  // ---- the run finishes. The level closes and the next one opens.
  const closed = snap({ passed: COURSES_DONE, runs: new Set([1]) });
  check('a finished run closes the level', levelClosed(closed, 1) === true);
  check('and opens the one after it', levelOpen(closed, 2) === true);
  check('and the course behind it becomes readable', decide(closed, 'probe-l2-a').allowed === true);

  /*
   * The old route, explicitly shut. Passing the marked paper today must close
   * nothing, or the reversal would have added a rule without removing one and
   * the paper would still be the way through.
   */
  const paperOnly = snap({ passed: new Set([...COURSES_DONE, 'probe-l1-paper']) });
  check('passing the marked paper today closes nothing',
    levelClosed(paperOnly, 1) === false && levelOpen(paperOnly, 2) === false,
    'the old route is shut, not merely no longer advertised');
  check('and not passing it costs nothing either',
    levelClosed(closed, 1) === true,
    'the level above closed on courses and a run, with the paper never sat');

  /*
   * LEVEL 0, WHICH WOULD HAVE BEEN A CATASTROPHE.
   *
   * chk_lcr_level bounds level_number to 1..6, so a run for level 0 is a row
   * the database will not hold. A gate that demanded one at level 0 would have
   * shut level 1 to every volunteer on the platform, for ever, with nothing on
   * any screen to explain it — and it would have looked like one more line of
   * the same rule.
   */
  const oriented = snap({ passed: new Set(['probe-orientation']) });
  check('level 0 closes on the orientation alone, with no run',
    levelClosed(oriented, 0) === true);
  check('so level 1 opens for somebody who has only been oriented',
    levelOpen(oriented, 1) === true,
    'the failure this guards against locks out the entire platform');
  const migration = readSource('migrations', '042_level_challenge_runs.sql');
  check('and the database agrees: a run may only exist for levels 1 to 6',
    /CHECK\s*\(\s*level_number BETWEEN 1 AND 6\s*\)/.test(migration),
    'chk_lcr_level — which is why demanding one at level 0 could never be satisfied');

  /*
   * The people who closed a level under the old rule. Re-locking them would be
   * the platform taking back something it had already given.
   */
  const grandfathered = snap({ passed: COURSES_DONE, grandfathered: new Set([1]) });
  check('a level closed before the cutover stays closed',
    levelClosed(grandfathered, 1) === true && levelOpen(grandfathered, 2) === true,
    'nobody is re-locked by a rule that changed after they finished');
  check('and the cutover instant is a real one, stated in the open',
    typeof RUN_REQUIRED_FROM === 'string' && !Number.isNaN(Date.parse(RUN_REQUIRED_FROM)),
    RUN_REQUIRED_FROM);

  /*
   * ── THE OUTCOME REACHES NEITHER THE GATE NOR THE CERTIFICATE ──────────────
   *
   * Read as code with the comments stripped, because both files now carry a
   * paragraph explaining that `review` earns the certificate exactly as `clear`
   * does — and a check banning those words from the raw text would go red on
   * the sentence making the promise, teaching the next person to delete it.
   */
  const gateCode = codeOf(readSource('src', 'lib', 'programme', 'gate.ts'));
  const credsCode = codeOf(readSource('src', 'lib', 'programme', 'credentials.ts'));
  const VERDICTS = /\boutcome\b|'clear'|'held'|'review'|"clear"|"held"|"review"/i;

  check('the gate asks only whether a run finished',
    /finished_at IS NOT NULL/.test(gateCode) && !VERDICTS.test(gateCode),
    'there is no verdict word anywhere in the gate\'s code');
  check('and there is nowhere in a snapshot for a verdict to be carried',
    [...closed.runs].every((v) => typeof v === 'number'),
    'runs is a set of level numbers; the outcome never leaves the row');
  check('the level certificate asks only whether a run finished',
    /level_challenge_runs/.test(credsCode) && /finished_at IS NOT NULL/.test(credsCode)
    && !VERDICTS.test(credsCode),
    'INVERTED-ADJACENT: the issuer consults runs now, but never what they said');
  check('and the certificate no longer waits for the marked paper',
    /kind <> 'challenge'/.test(credsCode),
    'otherwise the paper would still hold the credential the run now attests');

  /*
   * Stated as one line, because this is the sentence a future edit breaks.
   *
   * The engine really does produce `review` for a harmful decision (section 6
   * proves that independently); the gate closes a level on a finished run with
   * no verdict word in its code; the issuer mints the level certificate on the
   * same condition. Put together: a run that ended in review closed the level
   * and earned the certificate, exactly as a clear one did.
   */
  const def = CHALLENGES[0];
  const seed = seedFor('probe-review', 'probe-run');
  const harmful = (() => {
    const out: Decision[] = [];
    let current: Step | null = openingFor(def, seed);
    while (current) {
      const chosen = current.choices.find((ch) => ch.weight === 'harmful') ?? current.choices[0];
      out.push({ step: current.id, choice: chosen.id });
      current = chosen.next ? stepById(def, chosen.next) : null;
    }
    return out;
  })();
  const walked = walk(def, seed, harmful);
  check('A REVIEW RUN CLOSES THE LEVEL AND EARNS THE CERTIFICATE, EXACTLY AS A CLEAR ONE DOES',
    walked.ok && walked.done && outcomeOf(walked.walked) === 'review'
    && !VERDICTS.test(gateCode) && !VERDICTS.test(credsCode)
    && levelClosed(closed, 1) === true,
    'the verdict is a thing to talk about, never a thing to withhold');
  check('and `review` is called failure nowhere in the code that decides any of it',
    !/\bfail(ed|ure)?\b/i.test(gateCode) && !/\bfail(ed|ure)?\b/i.test(credsCode),
    'the word would be the first step towards behaving as though it were one');

  /*
   * The other half of the same event. The gate and the credential have to fire
   * from one moment, or a volunteer finishes their run, watches the next level
   * open, and holds no certificate until they happen to pass something else
   * weeks later.
   */
  const actionCode = codeOf(readSource('src', 'lib', 'actions', 'level-challenge.ts'));
  const parts = actionCode.split('if (result.finished)');
  check('decideAction issues the credentials when a run finishes',
    parts.length === 2
    && /issueEarnedCredentials\s*\(/.test(parts[1])
    && /recomputeAchievements\s*\(/.test(parts[1]),
    'the same request that closes the level mints the paper for it');
  check('and only when it finishes',
    parts.length === 2 && !/issueEarnedCredentials\s*\(/.test(parts[0])
    && !/recomputeAchievements\s*\(/.test(parts[0]),
    'a mid-run decision must mint nothing');
  check('starting a run issues nothing at all', (() => {
    const start = actionCode.indexOf('function startRunAction');
    const decide_ = actionCode.indexOf('function decideAction');
    if (start < 0 || decide_ < 0 || decide_ < start) return false;
    return !/issueEarnedCredentials\s*\(/.test(actionCode.slice(start, decide_));
  })(), 'opening a run is not finishing one');
  check('and a failed mint cannot roll back a decision already taken',
    /issueEarnedCredentials\(user\.id\)\.catch\(/.test(actionCode)
    && /recomputeAchievements\(user\.id\)\.catch\(/.test(actionCode),
    'the row is the record; the paper can always be issued again');
}

/* ------------------------------------------------------------------ */
console.log('\n12. the strings, in both languages and with the counted nouns Arabic needs');
{
  type Leaf = [string, string];
  const leaves = (o: object): Leaf[] =>
    Object.entries(o).flatMap(([k, v]): Leaf[] =>
      typeof v === 'string' ? [[k, v]] : leaves(v as object).map(([s, x]): Leaf => [`${k}.${s}`, x]));

  const ar = leaves(challengeLevelsAr);
  const en = Object.fromEntries(leaves(challengeLevelsEn));
  check('Arabic and English cover exactly the same keys',
    JSON.stringify(ar.map(([k]) => k).sort()) === JSON.stringify(Object.keys(en).sort()),
    `${ar.length} leaves`);
  check('no string is empty in either language',
    ar.every(([k, v]) => v.trim().length > 0 && en[k]?.trim().length > 0));
  const notArabic = ar.filter(([, v]) => !ARABIC.test(v)).map(([k]) => k);
  check('every Arabic string is actually Arabic — no English shipped twice',
    notArabic.length === 0, notArabic.join(',') || 'all Arabic');
  const same = ar.filter(([k, v]) => v === en[k]).map(([k]) => k);
  check('and none is the English string pasted into the Arabic file',
    same.length === 0, same.join(',') || 'none');
  const ph = (s: string) => (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort().join(',');
  const lost = ar.filter(([k, v]) => ph(v) !== ph(en[k] ?? '')).map(([k]) => k);
  check('interpolations survive translation on both sides',
    lost.length === 0, lost.join(',') || 'all match');
  check('the staff strings are covered by all of the above',
    ar.some(([k]) => k.startsWith('staff.')),
    `${ar.filter(([k]) => k.startsWith('staff.')).length} staff leaves`);

  /*
   * The counted nouns. countPhrase() picks a band, and only few/many carry a
   * numeral — «قراران» does not want a "2" in front of it, and putting one
   * there is the exact error this shape exists to prevent.
   */
  for (const [name, forms] of [
    ['decisionCount', challengeLevelsAr.decisionCount],
    ['courseCount', challengeLevelsAr.courseCount],
    ['staff.queueWaiting', challengeLevelsAr.staff.queueWaiting],
  ] as const) {
    check(`${name} carries {n} only where Arabic wants a numeral`,
      !forms.zero.includes('{n}') && !forms.one.includes('{n}') && !forms.two.includes('{n}')
      && forms.few.includes('{n}') && forms.many.includes('{n}'),
      `${forms.two} / ${forms.few}`);
    check(`${name} inflects across the bands rather than repeating one form`,
      new Set([forms.one, forms.two, forms.few, forms.many]).size === 4,
      'Arabic counts in bands; one noun shape for all of them is wrong four ways');
  }
  check('countPhrase picks the band the noun needs', (() => {
    const f = challengeLevelsAr.decisionCount;
    return countPhrase(1, f) === f.one
      && countPhrase(2, f) === f.two
      && countPhrase(3, f) === f.few.replace('{n}', '3')
      && countPhrase(11, f) === f.many.replace('{n}', '11');
  })());

  const route = readSource('src', 'app', '[lang]', 'academy', 'challenge', '[level]', 'page.tsx');
  check('the screen uses countPhrase rather than writing its own plural',
    /countPhrase\(/.test(route));
  check('and it takes these strings from the new file only',
    /dictionaries\/challenge-levels/.test(route));
  const queuePage = readSource('src', 'app', '[lang]', 'staff', 'decision-runs', 'page.tsx');
  check('so does the staff queue, and from the staff block of it',
    /dictionaries\/challenge-levels/.test(queuePage) && /countPhrase\(/.test(queuePage)
    && /\)\.staff\b/.test(queuePage),
    'one place for the strings a reviewer reads, and it is not the learner\'s');

  /*
   * Not "the word `mark` appears nowhere" — the first version of this asserted
   * exactly that and failed on the very string whose job is to promise the
   * learner that the run carries no mark. A check that goes red on the sentence
   * making the promise teaches the next person to delete the promise.
   *
   * The rule is that nothing here ASSERTS a mark, a rank or a comparison about
   * the volunteer, which is a claim about the verdict strings specifically —
   * and now about the staff strings too, because `review` is not a failure on a
   * coordinator's screen any more than it is on the learner's.
   */
  const staffLeaves = [
    ...leaves(challengeLevelsAr.staff).map(([, v]) => v),
    ...leaves(challengeLevelsEn.staff).map(([, v]) => v),
  ];
  const verdicts = [
    challengeLevelsAr.outcomeClear, challengeLevelsAr.outcomeHeld, challengeLevelsAr.outcomeReview,
    challengeLevelsAr.outcomeClearBody, challengeLevelsAr.outcomeHeldBody,
    challengeLevelsAr.outcomeReviewBody,
    challengeLevelsEn.outcomeClear, challengeLevelsEn.outcomeHeld, challengeLevelsEn.outcomeReview,
    challengeLevelsEn.outcomeClearBody, challengeLevelsEn.outcomeHeldBody,
    challengeLevelsEn.outcomeReviewBody,
    ...staffLeaves,
  ];
  /*
   * «ترتيب» used to be banned outright, and extending the check to the staff
   * block is what showed that to be wrong. staff.readLede promises the reviewer
   * that the options are shown «وبالترتيب نفسه» — in the same order the
   * volunteer met them — which is the fidelity guarantee this whole feature
   * rests on. Banning the word made the probe go red on the sentence keeping
   * the promise, and the shortest way back to green would have been to weaken
   * the promise.
   *
   * The banned sense is an ordering OF PEOPLE, so that is what is banned:
   * «تصنيف», «ترتيبك», «الترتيب بين». Ordering options is not ranking anybody.
   */
  const grades = (v: string) =>
    /علامة|درجة|تصنيف|ترتيبك|الترتيب بين|نسبة|رسب|نجح|فشل/.test(v)
    || /\bscore\b|\bgrade\b|\brank\b|\bpercent|\bfail|\bpassed\b/i.test(v);
  check('no verdict string grades the volunteer or names a mark',
    !verdicts.some(grades),
    'three words about the decisions, and no figure anybody could compare');
  check('and no staff-facing string grades either',
    !staffLeaves.some(grades),
    `${staffLeaves.length} staff strings — the reviewer is told what to talk about, not what to record`);
  check('no verdict or staff string mentions another learner at all',
    !verdicts.some((v) => /غيرك|الآخرين|زملائك|others|other volunteers|than you/i.test(v)));
  check('no key in the strings is even shaped like a mark',
    !ar.some(([k]) => /score|grade|rank|percent|mark/i.test(k)),
    ar.length + ' keys');

  /*
   * The promise on the screen, which the reversal rewrote rather than removed.
   *
   * `optional`/`optionalBody` are gone — a key called `optionalBody` holding a
   * string that says "required" is precisely the trap this codebase keeps
   * writing probes against. `closes`/`closesBody` replace them, and the string
   * now has to do two things at once: say plainly that finishing is what closes
   * the level, and go on promising that nothing in it is marked. Losing either
   * half would be a different screen. Losing the second half would be a mark.
   */
  check('the learner is told plainly that finishing this is what closes the level',
    /يُغلق/.test(challengeLevelsAr.closesBody) && /المستوى/.test(challengeLevelsAr.closesBody)
    && /closes the level/i.test(challengeLevelsEn.closesBody),
    'INVERTED: it used to promise the opposite, and the key said so');
  check('and in the same breath that there is no mark in it',
    /لا علامة/.test(challengeLevelsAr.closesBody)
    && /\bno mark\b/i.test(challengeLevelsEn.closesBody),
    'required and unmarked are not a contradiction, and the string has to say both');
  check('and no pass and no fail',
    /لا نجاح/.test(challengeLevelsAr.closesBody) && /رسوب/.test(challengeLevelsAr.closesBody)
    && /\bno pass\b/i.test(challengeLevelsEn.closesBody)
    && /\bno fail\b/i.test(challengeLevelsEn.closesBody),
    'the promise is made on the screen, not only in a migration comment');
  check('and the kicker on the way in says what the run is for',
    /يُغلق/.test(challengeLevelsAr.cardKicker) && /closes/i.test(challengeLevelsEn.cardKicker),
    'somebody must not have to click to find out that this is what ends the level');
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
