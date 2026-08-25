/*
 * The four block types added after the first practice set: match, review,
 * dialogue and build.
 *
 * probe-practice holds the ground the original four stand on. This one holds
 * the same ground for the new four and then holds three things that only apply
 * to them.
 *
 * ── THE ONE THAT COSTS SOMEBODY A CERTIFICATE ──────────────────────────────
 *
 * These were added to courses volunteers have already sat and passed. That is
 * only safe because questionsIn() collects `quiz` and nothing else and
 * courseFingerprint hashes the same list — so a new block type changes no
 * score, invalidates no certificate, and does not move the version an old
 * attempt was taken against.
 *
 * An assertion that the fingerprint did not move is worthless on its own: a
 * courseFingerprint that returned a constant would pass it, and so would one
 * whose hash had been broken by an edit nobody noticed. So every invariance
 * check here is paired with a control that changes something the fingerprint
 * IS supposed to notice — the pass mark, a correct answer, a module id, a
 * question — and asserts it moved. Only the pair means anything.
 *
 * ── THE ONES THAT DO NOT LOOK LIKE FAILURES ────────────────────────────────
 *
 * A build whose correct option is the first button in every slot renders,
 * accepts a Check and says well done, and teaches "press the top one". A
 * matching exercise with two identical right-hand options is unanswerable in a
 * way nobody reports, because the reader assumes they were wrong. A dialogue
 * whose every first-turn reply ends the conversation makes turns two and three
 * unreachable, and an author reading the file cannot see it.
 *
 * ── AND THE TWO RULES THAT ARE NOT ABOUT THE CONTENT ───────────────────────
 *
 * A drag-only interaction excludes a part of the people this platform exists
 * for, and a physical-direction class is a bug that only appears in one of the
 * two languages. Both are checked against the components themselves, because
 * both are the kind of thing that gets reintroduced by somebody who did not
 * read the file header.
 *
 * PURE: no database, no network.
 */

import { readFileSync } from 'node:fs';
import {
  hashSeed,
  shuffleIndices,
  shuffleAnswers,
  pickProgress,
  reviewTally,
  nextTurn,
} from '../src/lib/practice.ts';
import { COURSE_CONTENT } from '../src/lib/course-content/index.ts';
import { courseFingerprint } from '../src/lib/course-version.ts';
import type { Block, CourseContent, L } from '../src/lib/course-content/types.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1; else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

/** The four this probe is about. The original four are probe-practice's job. */
const ADDED = ['match', 'review', 'dialogue', 'build'] as const;
type Added = (typeof ADDED)[number];

/** Every practice type, old and new — nothing in this list may be marked. */
const PRACTICE = ['order', 'sort', 'scenario', 'reveal', ...ADDED] as string[];

const courses = Object.entries(COURSE_CONTENT);
const found: { slug: string; mod: string; block: Block }[] = [];
for (const [slug, course] of courses) {
  for (const m of course.modules) {
    for (const b of m.blocks) {
      if ((ADDED as readonly string[]).includes(b.type)) found.push({ slug, mod: m.id, block: b });
    }
  }
}
const of = <T extends Added>(type: T) =>
  found.filter((f) => f.block.type === type).map((f) => ({ ...f, block: f.block as Extract<Block, { type: T }> }));

const matches = of('match');
const reviews = of('review');
const dialogues = of('dialogue');
const builds = of('build');

const both = (v: L): boolean => Boolean(v?.ar) && Boolean(v?.en);
/** Authored in one language and pasted into the other reads as translated. */
const distinct = (v: L): boolean => both(v) && (v.ar.length <= 1 || v.ar !== v.en);

console.log('1. the new types are used at all');
{
  /*
   * A block type nothing uses is dead code, and worse than dead code here:
   * every assertion below it passes vacuously over an empty list, so the probe
   * reports a wall of ok and holds nothing.
   */
  for (const type of ADDED) {
    const n = found.filter((f) => f.block.type === type).length;
    check(`\`${type}\` appears in the catalogue`, n > 0, `${n} in ${new Set(found.filter((f) => f.block.type === type).map((f) => f.slug)).size} course(s)`);
  }
  check('and every one of them is in a course somebody can open',
    found.every((f) => Boolean(COURSE_CONTENT[f.slug])), `${found.length} blocks`);
}

console.log('\n2. practice never becomes assessment');
{
  /*
   * questionsIn is in lib/academy.ts, which imports the database. Reading its
   * source rather than calling it keeps this probe pure, and it asserts the
   * thing that actually matters: which block types that function names.
   */
  const academy = readFileSync('src/lib/academy.ts', 'utf8');
  const body = academy.slice(academy.indexOf('export function questionsIn'), academy.indexOf('export function passMarkFor'));
  check('questionsIn exists to be read', body.length > 100);
  check('questionsIn collects the quiz type', body.includes("block.type === 'quiz'"));
  const named = ADDED.filter((t) => body.includes(`'${t}'`));
  check('and names no practice type at all', named.length === 0,
    named.join(',') || 'one line in this function is what every certificate rests on');

  const marked = found.filter((f) => 'correct' in f.block);
  check('no new practice block carries a marked answer', marked.length === 0,
    marked.map((m) => `${m.slug}/${m.mod}`).join(',') || `${found.length} blocks`);
  const withIds = found.filter((f) => 'id' in f.block);
  check('no new practice block carries a question id', withIds.length === 0,
    'an id is what questionsIn keys a stored answer by');
}

console.log('\n3. the fingerprint does not move — and a control that says it can');
{
  const strip = (course: CourseContent, types: readonly string[]): CourseContent => ({
    ...course,
    modules: course.modules.map((m) => ({ ...m, blocks: m.blocks.filter((b) => !types.includes(b.type)) })),
  });

  let movedNew = 0;
  let movedAll = 0;
  for (const [, course] of courses) {
    if (courseFingerprint(course) !== courseFingerprint(strip(course, ADDED))) movedNew += 1;
    if (courseFingerprint(course) !== courseFingerprint(strip(course, PRACTICE))) movedAll += 1;
  }
  check('removing every new practice block changes no course fingerprint', movedNew === 0,
    movedNew === 0 ? `${courses.length} courses` : `${movedNew} moved`);
  check('removing every practice block, old and new, changes none either', movedAll === 0,
    movedAll === 0 ? `${courses.length} courses` : `${movedAll} moved`);

  /*
   * The other direction, which is the one an author is actually about to do:
   * adding a block to a course that is already published and already sat.
   */
  const say = (s: string): L => ({ ar: s, en: s });
  const synthetic: Block[] = [
    { type: 'match', prompt: say('p'), pairs: [{ left: say('a'), right: say('b'), because: say('c') }] },
    { type: 'review', prompt: say('p'), docTitle: say('d'), lines: [{ label: say('l'), text: say('t'), wrong: true, note: say('n') }], afterword: say('a') },
    { type: 'dialogue', title: say('t'), speaker: say('s'), opening: say('o'), turns: [{ replies: [{ text: say('r'), says: say('s'), note: say('n') }] }], afterword: say('a') },
    { type: 'build', prompt: say('p'), slots: [{ label: say('l'), options: [say('a'), say('b')], because: say('c') }], afterword: say('a') },
  ];
  let movedByAdding = 0;
  for (const [, course] of courses) {
    const grown: CourseContent = {
      ...course,
      modules: course.modules.map((m, i) => (i === 0 ? { ...m, blocks: [...m.blocks, ...synthetic] } : m)),
    };
    if (courseFingerprint(course) !== courseFingerprint(grown)) movedByAdding += 1;
  }
  check('adding one of each new block to every course moves no fingerprint', movedByAdding === 0,
    movedByAdding === 0 ? `${courses.length} courses` : `${movedByAdding} moved`);

  /*
   * ── THE CONTROLS ────────────────────────────────────────────────────────
   *
   * Without these, every assertion above is also satisfied by a fingerprint
   * that has stopped working. Each of the four below changes something the
   * fingerprint is supposed to notice, and asserts it noticed.
   */
  let passMarkMoved = 0;
  let correctMoved = 0;
  let moduleMoved = 0;
  let questionMoved = 0;
  let hasQuiz = 0;
  for (const [, course] of courses) {
    const base = courseFingerprint(course);
    if (courseFingerprint({ ...course, passMark: course.passMark + 1 }) !== base) passMarkMoved += 1;
    if (courseFingerprint({ ...course, modules: course.modules.map((m, i) => (i === 0 ? { ...m, id: `${m.id}-x` } : m)) }) !== base) moduleMoved += 1;

    const quizzes = course.modules.flatMap((m) => m.blocks).filter((b) => b.type === 'quiz');
    if (quizzes.length === 0) continue;
    hasQuiz += 1;
    let flipped = false;
    const bent: CourseContent = {
      ...course,
      modules: course.modules.map((m) => ({
        ...m,
        blocks: m.blocks.map((b) => {
          if (b.type !== 'quiz' || flipped) return b;
          flipped = true;
          return { ...b, correct: (b.correct + 1) % b.options.length };
        }),
      })),
    };
    if (courseFingerprint(bent) !== base) correctMoved += 1;

    let dropped = false;
    const shorter: CourseContent = {
      ...course,
      modules: course.modules.map((m) => ({
        ...m,
        blocks: m.blocks.filter((b) => {
          if (b.type !== 'quiz' || dropped) return true;
          dropped = true;
          return false;
        }),
      })),
    };
    if (courseFingerprint(shorter) !== base) questionMoved += 1;
  }
  check('CONTROL: moving the pass mark moves every course fingerprint',
    passMarkMoved === courses.length, `${passMarkMoved} of ${courses.length}`);
  check('CONTROL: changing a correct answer moves it',
    correctMoved === hasQuiz, `${correctMoved} of ${hasQuiz} courses with questions`);
  check('CONTROL: renaming a module moves it', moduleMoved === courses.length,
    `${moduleMoved} of ${courses.length}`);
  check('CONTROL: removing a question moves it', questionMoved === hasQuiz,
    `${questionMoved} of ${hasQuiz}`);
  check('CONTROL: two different courses do not share a fingerprint',
    new Set(courses.map(([, c]) => courseFingerprint(c))).size === courses.length,
    'a constant would satisfy every invariance check above');
}

console.log('\n4. the shuffle never hands over the answer');
{
  /*
   * shuffleIndices only promises the list as a whole is not the authored one.
   * A build slot puts its correct option at index 0, so a fixed point at
   * position 0 is the answer sitting on the first button — which shuffleIndices
   * is entirely free to produce.
   */
  let firsts = 0;
  let identities = 0;
  let malformed = 0;
  let unstable = 0;
  for (let n = 2; n <= 8; n += 1) {
    for (let seed = 0; seed < 400; seed += 1) {
      const s = shuffleAnswers(n, seed);
      if (s[0] === 0) firsts += 1;
      if (s.every((v, i) => v === i)) identities += 1;
      const seen = new Set(s);
      if (s.length !== n || seen.size !== n || s.some((v) => v < 0 || v >= n)) malformed += 1;
      if (shuffleAnswers(n, seed).join() !== s.join()) unstable += 1;
    }
  }
  check('the authored answer is never the first option, over 2800 shuffles', firsts === 0,
    'a build whose answer is always the top button teaches which button to press');
  check('and the order is never the authored one', identities === 0);
  check('always a complete permutation', malformed === 0);
  check('the same seed gives the same arrangement', unstable === 0,
    'the server and the browser both render this; a difference is a hydration mismatch');
  check('a different seed usually gives a different one',
    shuffleAnswers(6, 1).join() !== shuffleAnswers(6, 2).join());
  check('one option is left alone', shuffleAnswers(1, 5).join() === '0');
  check('no options is an empty list', shuffleAnswers(0, 5).length === 0);
  check('two options are always swapped', shuffleAnswers(2, 7).join() === '1,0');
  check('the answer is not always displaced to the same place', (() => {
    const landings = new Set<number>();
    for (let seed = 0; seed < 60; seed += 1) landings.add(shuffleAnswers(5, seed).indexOf(0));
    return landings.size >= 3;
  })(), 'never first but always last is the same tell wearing a different hat');
  check('a match menu and its rows are seeded apart',
    shuffleIndices(5, hashSeed('x')).join() !== shuffleIndices(5, hashSeed(`menu:${hashSeed('x')}`)).join(),
    'one permutation for both lists lets a reader pair them off without reading either');
}

console.log('\n5. counting one choice per row');
{
  const pairs = [0, 1, 2];
  const slots = [0, 0, 0];
  check('nothing chosen is nothing', pickProgress({}, pairs).placed === 0);
  check('and not done', pickProgress({}, pairs).done === false);
  check('a right pairing counts once', pickProgress({ 0: 0 }, pairs).correct === 1);
  check('a wrong pairing counts as placed but not correct', (() => {
    const p = pickProgress({ 0: 2 }, pairs);
    return p.placed === 1 && p.correct === 0;
  })());
  check('all chosen is done even when some are wrong',
    pickProgress({ 0: 2, 1: 1, 2: 0 }, pairs).done === true,
    'a done that needed a perfect answer would never tell somebody they had finished');
  check('all right is done and correct', (() => {
    const p = pickProgress({ 0: 0, 1: 1, 2: 2 }, pairs);
    return p.done && p.correct === 3;
  })());
  check('a build expects its authored option in every slot',
    pickProgress({ 0: 0, 1: 0, 2: 0 }, slots).correct === 3);
  check('and any other option in a slot is wrong',
    pickProgress({ 0: 0, 1: 3, 2: 0 }, slots).correct === 2);
  check('a choice for a row that does not exist is ignored',
    pickProgress({ 9: 0 }, pairs).placed === 0,
    'state keyed by index outlives the list the moment an author deletes a row');
  check('no rows is done with nothing to do', pickProgress({}, []).done === true);
  check('choosing index zero is a choice and not an absence',
    pickProgress({ 0: 0 }, pairs).placed === 1,
    'a falsy check here would make the first option unselectable');
}

console.log('\n6. what a reader found in a document');
{
  const lines = [{ wrong: true }, {}, { wrong: true }, {}];
  check('nothing flagged finds nothing', reviewTally({}, lines).found === 0);
  check('and misses everything that is wrong', reviewTally({}, lines).missed === 2);
  check('flagging a problem finds it', reviewTally({ 0: true }, lines).found === 1);
  check('flagging a sound line is a false alarm, not a miss', (() => {
    const t = reviewTally({ 1: true }, lines);
    return t.falseAlarms === 1 && t.missed === 2 && t.found === 0;
  })(), 'over-reading and under-reading are not the same mistake and are never added up');
  check('a flag set false is not a flag', reviewTally({ 0: false }, lines).found === 0);
  check('every problem found leaves nothing missed',
    reviewTally({ 0: true, 2: true }, lines).missed === 0);
  check('the document knows how many problems it holds',
    reviewTally({}, lines).problems === 2);
  check('and how many lines it has', reviewTally({}, lines).total === 4);
  check('found plus missed is always the number of problems', (() => {
    const attempts: Record<number, boolean>[] = [
      {}, { 0: true }, { 1: true }, { 0: true, 1: true, 2: true, 3: true },
    ];
    for (const f of attempts) {
      const t = reviewTally(f, lines);
      if (t.found + t.missed !== t.problems) return false;
    }
    return true;
  })());
  check('an empty document holds nothing', reviewTally({}, []).problems === 0);
}

console.log('\n7. where a conversation goes next');
{
  check('an ordinary reply moves to the next turn', nextTurn(0, 3, false) === 1);
  check('a reply that ends it ends it', nextTurn(0, 3, true) === null);
  check('the last turn ends the conversation without an ending reply',
    nextTurn(2, 3, false) === null);
  check('and an ending reply on the last turn still ends it', nextTurn(2, 3, true) === null);
  check('a one-turn conversation is over after one reply', nextTurn(0, 1, false) === null);
  check('a turn past the end does not wrap round', nextTurn(9, 3, false) === null);
}

console.log('\n8. what the catalogue actually contains');
{
  console.log(`  (${matches.length} match, ${reviews.length} review, ${dialogues.length} dialogue, ${builds.length} build)`);

  // ---- match
  check('every matching exercise has enough pairs to be one',
    matches.every((p) => p.block.pairs.length >= 3), 'two pairs is a coin toss');
  check('no two right-hand items read the same',
    matches.every((p) => {
      const rights = p.block.pairs.map((x) => x.right.ar);
      return new Set(rights).size === rights.length;
    }), 'two identical options make a row unanswerable in a way nobody reports');
  check('no two left-hand items read the same',
    matches.every((p) => {
      const lefts = p.block.pairs.map((x) => x.left.ar);
      return new Set(lefts).size === lefts.length;
    }));
  check('every pair explains itself in both languages',
    matches.every((p) => p.block.pairs.every((x) => x.because.ar.length > 20 && x.because.en.length > 20)),
    'being told only that it is wrong leaves the wrong idea intact');

  // ---- review
  check('every document holds at least one line that does not pass',
    reviews.every((p) => p.block.lines.some((l) => l.wrong)),
    'a document with nothing wrong in it is a reading comprehension exercise');
  check('and at least two that do',
    reviews.every((p) => p.block.lines.filter((l) => !l.wrong).length >= 2),
    'if most of it is wrong the answer is to flag everything');
  check('the sound lines outnumber or match the faults',
    reviews.every((p) => p.block.lines.filter((l) => !l.wrong).length >= p.block.lines.filter((l) => l.wrong).length));
  check('every line carries a note, the sound ones included',
    reviews.every((p) => p.block.lines.every((l) => l.note.ar.length > 20 && l.note.en.length > 20)),
    '"this line is fine" is a thing a reader can be wrong about in both directions');
  check('every line is labelled like a field on a form',
    reviews.every((p) => p.block.lines.every((l) => both(l.label) && both(l.text))));
  check('every document says what it was teaching',
    reviews.every((p) => p.block.afterword.ar.length > 40 && p.block.afterword.en.length > 40));

  // ---- dialogue
  check('every conversation runs more than one turn',
    dialogues.every((p) => p.block.turns.length >= 2),
    'one turn is a scenario, and that block type already exists');
  check('every turn offers a real choice',
    dialogues.every((p) => p.block.turns.every((t) => t.replies.length >= 2)));
  check('every turn but the last leaves a way to carry on',
    dialogues.every((p) => p.block.turns.every((t, i) =>
      i === p.block.turns.length - 1 || t.replies.some((r) => !r.ends))),
    'if every reply ends it, the turns after it are unreachable and an author cannot see that');
  check('every conversation can be ended early by something',
    dialogues.every((p) => p.block.turns.some((t) => t.replies.some((r) => r.ends))),
    'a conversation nothing can close does not teach that anything closes one');
  check('every turn marks at most one best reply',
    dialogues.every((p) => p.block.turns.every((t) => t.replies.filter((r) => r.best).length <= 1)));
  check('and every turn marks one',
    dialogues.every((p) => p.block.turns.every((t) => t.replies.some((r) => r.best))),
    'a turn with no view reads as though every reply is equally fine');
  check('no best reply also ends the conversation',
    dialogues.every((p) => p.block.turns.every((t) => t.replies.every((r) => !(r.best && r.ends)))),
    'the association would not say the thing that shuts the person down');
  check('every reply draws something back',
    dialogues.every((p) => p.block.turns.every((t) => t.replies.every((r) => both(r.says)))));
  check('every reply is explained to the reader in both languages',
    dialogues.every((p) => p.block.turns.every((t) => t.replies.every((r) => r.note.ar.length > 20 && r.note.en.length > 20))),
    'the consequence is the teaching');
  check('every conversation names who is speaking',
    dialogues.every((p) => both(p.block.speaker) && both(p.block.opening)));

  // ---- build
  check('every build has more than one part',
    builds.every((p) => p.block.slots.length >= 2), 'one slot is a quiz without a mark');
  check('every part offers at least three options',
    builds.every((p) => p.block.slots.every((s) => s.options.length >= 3)));
  check('no two options in a part read the same',
    builds.every((p) => p.block.slots.every((s) => {
      const texts = s.options.map((o) => o.ar);
      return new Set(texts).size === texts.length;
    })), 'a duplicate of the correct option makes a right answer wrong');
  check('every part explains itself in both languages',
    builds.every((p) => p.block.slots.every((s) => s.because.ar.length > 20 && s.because.en.length > 20)));
  check('every build says what the finished thing is',
    builds.every((p) => p.block.afterword.ar.length > 40 && p.block.afterword.en.length > 40));
}

console.log('\n9. both languages, everywhere');
{
  const missing: string[] = [];
  const at = (f: { slug: string; mod: string; block: Block }) => `${f.slug}/${f.mod}/${f.block.type}`;
  const want = (where: string, v: L) => {
    if (!both(v)) missing.push(`${where}: empty`);
    else if (!distinct(v)) missing.push(`${where}: "${v.ar}" in both`);
  };
  for (const p of matches) {
    want(at(p), p.block.prompt);
    for (const x of p.block.pairs) { want(`${at(p)} left`, x.left); want(`${at(p)} right`, x.right); }
  }
  for (const p of reviews) {
    want(at(p), p.block.prompt);
    want(`${at(p)} title`, p.block.docTitle);
    want(`${at(p)} afterword`, p.block.afterword);
    for (const l of p.block.lines) { want(`${at(p)} label`, l.label); want(`${at(p)} text`, l.text); }
  }
  for (const p of dialogues) {
    want(at(p), p.block.title);
    want(`${at(p)} opening`, p.block.opening);
    want(`${at(p)} afterword`, p.block.afterword);
    for (const t of p.block.turns) for (const r of t.replies) want(`${at(p)} reply`, r.text);
  }
  for (const p of builds) {
    want(at(p), p.block.prompt);
    want(`${at(p)} afterword`, p.block.afterword);
    for (const s of p.block.slots) {
      want(`${at(p)} label`, s.label);
      for (const o of s.options) want(`${at(p)} option`, o);
    }
  }
  check('nothing is left untranslated', missing.length === 0,
    missing.slice(0, 4).join(' | ') || `${found.length} blocks checked`);
}

console.log('\n10. the components themselves');
{
  const dir = 'src/components/academy/practice';
  const files = ['MatchBlock', 'ReviewBlock', 'DialogueBlock', 'BuildBlock'];
  /*
   * Comments stripped before any of the checks below run, because the place a
   * banned token most legitimately appears is the comment forbidding it. Every
   * one of these files explains why it does not use Math.random, or `mr-auto`,
   * or a drag — and scanning the prose reported all four of them as the very
   * defect they were describing.
   */
  const code = (src: string): string => src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
  const sources = new Map(files.map((f) => [f, code(readFileSync(`${dir}/${f}.tsx`, 'utf8'))]));
  const renderer = readFileSync('src/components/academy/Blocks.tsx', 'utf8');
  const lib = code(readFileSync('src/lib/practice.ts', 'utf8'));
  const strings = code(readFileSync('src/lib/dictionaries/practice-blocks.ts', 'utf8'));

  /*
   * A block type nothing renders is dead code. The switch in Blocks.tsx is the
   * only place a course's blocks become elements, so a case missing from it is
   * a block that silently renders nothing at all.
   */
  for (const type of ADDED) {
    check(`\`${type}\` has a case in the renderer`, renderer.includes(`case '${type}':`));
  }
  for (const f of files) {
    check(`${f} is imported by the renderer`, renderer.includes(`practice/${f}`));
  }

  /*
   * Rule: a drag-only interaction excludes people this platform is for. The
   * existing blocks move things with buttons; these use menus, radios and
   * toggles. Nothing here may reintroduce a drag without a keyboard path, and
   * the cheapest way to hold that is to allow no drag at all.
   */
  /*
   * Assembled from fragments rather than written as a literal. probe-a11y
   * sweeps every file under scripts/ for the same affordances and exempts only
   * itself, so a probe spelling them out to forbid them reads to that probe as
   * a file that has them.
   */
  const DRAG = new RegExp(['drag' + 'gable', 'on' + 'Drag', 'on' + 'Drop', 'data' + 'Transfer'].join('|'));
  for (const [f, src] of sources) {
    check(`${f} has no drag-only interaction`, !DRAG.test(src),
      'every control here must be reachable with a keyboard alone');
  }

  /*
   * Rule: RTL first. A physical-direction utility is a bug that appears in
   * exactly one of the two languages, which is why it survives review.
   * `border-line` is not `border-l`, hence the trailing hyphen in the pattern.
   */
  const PHYSICAL = /\b(?:ml|mr|pl|pr|border-l|border-r|rounded-l|rounded-r)-|\btext-(?:left|right)\b|\b(?:left|right)-\d/;
  for (const [f, src] of sources) {
    const hit = src.match(PHYSICAL);
    check(`${f} uses logical directions only`, hit === null, hit?.[0] ?? 'ms/me/ps/pe/start/end');
  }

  /* Arabic joins. Tracking severs the connecting strokes — globals.css nulls
   * it for Arabic, and these components do not ask it to. */
  for (const [f, src] of sources) {
    check(`${f} sets no letter-spacing`, !/tracking-|letterSpacing/.test(src));
  }

  /*
   * Rule: deterministic. A Math.random() shuffle renders one order on the
   * server and another in the browser, and the page hydrates into a mismatch.
   */
  for (const [f, src] of sources) {
    check(`${f} contains no Math.random`, !src.includes('Math.random'));
  }
  check('and neither does the library behind them', !lib.includes('Math.random'),
    'these render on the server and again in the browser');

  /* Strings live in the dictionary module, not re-inlined per component. */
  for (const [f, src] of sources) {
    check(`${f} reads its strings from the dictionary`,
      src.includes("dictionaries/practice-blocks"));
  }
  check('the dictionary carries both languages', /const ar:/.test(strings) && /const en:/.test(strings));
  check('and no arrow whose meaning depends on the direction of the page',
    !/[←→]/.test(strings) && [...sources.values()].every((s) => !/[←→]/.test(s)),
    'an arrow meaning "next" points left in Arabic');
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
