/*
 * The practice blocks: exercises that teach and do not count.
 *
 * Two kinds of failure, and neither one looks like a failure.
 *
 * The first is an exercise that is free. An "arrange these in order" that
 * hands the reader the steps already in order is not broken — it renders, it
 * accepts a Check, it says well done. It just teaches nothing, and nobody
 * reports it because nothing went wrong.
 *
 * The second is the one that matters. These were added to courses volunteers
 * have already sat, and the entire reason that is safe is that questionsIn()
 * collects `quiz` and nothing else, and courseFingerprint hashes the same
 * list. If a practice block ever became a question, every past attempt would
 * be short an answer and every certificate would belong to a paper that no
 * longer exists. So that property is asserted here rather than assumed.
 *
 * PURE: no database, no network.
 */

import { hashSeed, shuffleIndices, isOrdered, moveBy, sortProgress } from '../src/lib/practice.ts';
import { COURSE_CONTENT } from '../src/lib/course-content/index.ts';
import { courseFingerprint } from '../src/lib/course-version.ts';
import type { Block } from '../src/lib/course-content/types.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1; else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

const PRACTICE = ['order', 'sort', 'scenario', 'reveal'];
const practiceBlocks: { slug: string; mod: string; block: Block }[] = [];
for (const [slug, course] of Object.entries(COURSE_CONTENT)) {
  for (const m of course.modules) {
    for (const b of m.blocks) {
      if (PRACTICE.includes(b.type)) practiceBlocks.push({ slug, mod: m.id, block: b });
    }
  }
}

console.log('1. practice never becomes assessment');
{
  /*
   * The property the whole design rests on. Said three ways, because it is
   * the one that costs somebody their certificate if it stops being true.
   */
  const marked = practiceBlocks.filter((p) => 'correct' in p.block);
  check('no practice block carries a marked answer', marked.length === 0,
    marked.map((m) => `${m.slug}/${m.mod}`).join(',') || `${practiceBlocks.length} blocks`);

  const withIds = practiceBlocks.filter((p) => 'id' in p.block);
  check('no practice block carries a question id', withIds.length === 0,
    'an id is what questionsIn keys an answer by');

  // The fingerprint of every course, recomputed with the practice removed.
  let moved = 0;
  for (const [slug, course] of Object.entries(COURSE_CONTENT)) {
    const stripped = {
      ...course,
      modules: course.modules.map((m) => ({
        ...m,
        blocks: m.blocks.filter((b) => !PRACTICE.includes(b.type)),
      })),
    };
    if (courseFingerprint(course) !== courseFingerprint(stripped)) moved += 1;
  }
  check('removing every practice block changes no course fingerprint', moved === 0,
    moved === 0 ? `${Object.keys(COURSE_CONTENT).length} courses` : `${moved} moved`);
  check('and there are practice blocks for that to mean something',
    practiceBlocks.length > 0, `${practiceBlocks.length} blocks in the catalogue`);
}

console.log('\n2. the shuffle is deterministic');
{
  check('the same seed gives the same arrangement',
    shuffleIndices(6, 123).join() === shuffleIndices(6, 123).join(),
    'the server and the browser both render this; a difference is a hydration mismatch');
  check('a different seed usually gives a different one',
    shuffleIndices(6, 1).join() !== shuffleIndices(6, 2).join());
  check('the same text always seeds the same', hashSeed('abc') === hashSeed('abc'));
  check('different text seeds differently', hashSeed('abc') !== hashSeed('abd'));
  check('the seed is a positive integer', Number.isInteger(hashSeed('x')) && hashSeed('x') >= 0);
  check('an empty string still seeds', Number.isInteger(hashSeed('')));
}

console.log('\n3. the shuffle never hands over the answer');
{
  let identities = 0;
  let malformed = 0;
  for (let n = 2; n <= 8; n += 1) {
    for (let seed = 0; seed < 400; seed += 1) {
      const s = shuffleIndices(n, seed);
      if (isOrdered(s)) identities += 1;
      const seen = new Set(s);
      if (s.length !== n || seen.size !== n || s.some((v) => v < 0 || v >= n)) malformed += 1;
    }
  }
  check('never returns the authored order, over 2800 shuffles', identities === 0,
    'one in six three-item shuffles lands on it by chance');
  check('always a complete permutation', malformed === 0);
  check('one item is left alone', shuffleIndices(1, 5).join() === '0');
  check('no items is an empty list', shuffleIndices(0, 5).length === 0);
  check('two items are always swapped', shuffleIndices(2, 7).join() === '1,0');
}

console.log('\n4. moving items about');
{
  const l = [0, 1, 2, 3];
  check('an item moves up', moveBy(l, 2, -1).join() === '0,2,1,3');
  check('an item moves down', moveBy(l, 1, 1).join() === '0,2,1,3');
  check('the first cannot move up', moveBy(l, 0, -1).join() === l.join());
  check('the last cannot move down', moveBy(l, 3, 1).join() === l.join());
  check('an index off the end changes nothing', moveBy(l, 9, -1).join() === l.join());
  check('a negative index changes nothing', moveBy(l, -1, 1).join() === l.join());
  check('the original is not modified', (moveBy(l, 0, 1), l.join() === '0,1,2,3'),
    'the component holds this in state; mutating it would skip a render');
  check('up then down returns to the start',
    moveBy(moveBy(l, 1, -1), 0, 1).join() === l.join());
  check('an empty list survives', moveBy([], 0, 1).length === 0);
}

console.log('\n5. counting a sort');
{
  const items = [{ bucket: 'a' }, { bucket: 'b' }, { bucket: 'a' }];
  check('nothing placed is nothing', sortProgress({}, items).placed === 0);
  check('and not done', sortProgress({}, items).done === false);
  check('one right counts once', sortProgress({ 0: 'a' }, items).correct === 1);
  check('one wrong counts as placed but not correct', (() => {
    const p = sortProgress({ 0: 'b' }, items);
    return p.placed === 1 && p.correct === 0;
  })());
  check('all placed is done even when some are wrong',
    sortProgress({ 0: 'b', 1: 'b', 2: 'a' }, items).done === true,
    'a done that needed a perfect answer would never tell somebody they had finished');
  check('all correct is done and correct', (() => {
    const p = sortProgress({ 0: 'a', 1: 'b', 2: 'a' }, items);
    return p.done && p.correct === 3;
  })());
  check('total is the number of items', sortProgress({}, items).total === 3);
  check('an assignment for an item that does not exist is ignored',
    sortProgress({ 9: 'a' }, items).placed === 0);
  check('no items is done with nothing to do', sortProgress({}, []).done === true);
}

console.log('\n6. what the catalogue actually contains');
{
  const orders = practiceBlocks.filter((p) => p.block.type === 'order');
  const sorts = practiceBlocks.filter((p) => p.block.type === 'sort');
  const scenarios = practiceBlocks.filter((p) => p.block.type === 'scenario');
  const reveals = practiceBlocks.filter((p) => p.block.type === 'reveal');
  console.log(`  (${orders.length} order, ${sorts.length} sort, ${scenarios.length} scenario, ${reveals.length} reveal)`);

  check('every ordering exercise has enough steps to be one',
    orders.every((p) => {
      const b = p.block as Extract<Block, { type: 'order' }>;
      return b.steps.ar.length >= 3 && b.steps.en.length === b.steps.ar.length;
    }),
    'two steps is a coin toss');

  check('every sorting item goes in a bucket that exists',
    sorts.every((p) => {
      const b = p.block as Extract<Block, { type: 'sort' }>;
      const ids = new Set(b.buckets.map((x) => x.id));
      return b.items.every((it) => ids.has(it.bucket));
    }),
    'an item with no bucket can never be got right');

  check('every sorting exercise uses all of its buckets',
    sorts.every((p) => {
      const b = p.block as Extract<Block, { type: 'sort' }>;
      const used = new Set(b.items.map((it) => it.bucket));
      return b.buckets.every((x) => used.has(x.id));
    }),
    'an empty bucket is a hint that it is the wrong answer');

  check('every sorting item explains itself',
    sorts.every((p) => {
      const b = p.block as Extract<Block, { type: 'sort' }>;
      return b.items.every((it) => it.because.ar.length > 20 && it.because.en.length > 20);
    }),
    'being told only that it is wrong leaves the wrong idea intact');

  check('every scenario marks at most one best response',
    scenarios.every((p) => {
      const b = p.block as Extract<Block, { type: 'scenario' }>;
      return b.choices.filter((c) => c.best).length <= 1;
    }));

  check('every scenario offers a real choice',
    scenarios.every((p) => (p.block as Extract<Block, { type: 'scenario' }>).choices.length >= 3));

  check('every scenario choice says what happens next',
    scenarios.every((p) => {
      const b = p.block as Extract<Block, { type: 'scenario' }>;
      return b.choices.every((c) => c.outcome.ar.length > 20 && c.outcome.en.length > 20);
    }),
    'the consequence is the teaching');

  check('every reveal has something behind it',
    reveals.every((p) => {
      const b = p.block as Extract<Block, { type: 'reveal' }>;
      return b.answer.ar.length > 20 && b.answer.en.length > 20;
    }));
}

console.log('\n7. both languages, everywhere');
{
  const missing: string[] = [];
  const bothWays = (where: string, a: string, e: string) => {
    if (!a || !e) missing.push(`${where}: empty`);
    else if (a.length > 1 && a === e) missing.push(`${where}: "${a}" in both`);
  };
  for (const { slug, mod, block } of practiceBlocks) {
    const at = `${slug}/${mod}/${block.type}`;
    if (block.type === 'order') {
      bothWays(at, block.prompt.ar, block.prompt.en);
      bothWays(at, block.afterword.ar, block.afterword.en);
      if (block.steps.ar.length !== block.steps.en.length) missing.push(`${at}: step counts differ`);
    }
    if (block.type === 'sort') {
      bothWays(at, block.prompt.ar, block.prompt.en);
      for (const b of block.buckets) bothWays(`${at} bucket`, b.label.ar, b.label.en);
      for (const it of block.items) bothWays(`${at} item`, it.text.ar, it.text.en);
    }
    if (block.type === 'scenario') {
      bothWays(at, block.title.ar, block.title.en);
      bothWays(at, block.situation.ar, block.situation.en);
      for (const c of block.choices) bothWays(`${at} choice`, c.text.ar, c.text.en);
    }
    if (block.type === 'reveal') {
      bothWays(at, block.prompt.ar, block.prompt.en);
      bothWays(at, block.answer.ar, block.answer.en);
    }
  }
  check('nothing is left untranslated', missing.length === 0,
    missing.slice(0, 4).join(' | ') || `${practiceBlocks.length} blocks checked`);
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
