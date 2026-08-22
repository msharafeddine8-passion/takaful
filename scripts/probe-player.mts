/*
 * Splitting a course into screens, and finding the way back to one.
 *
 * The part of the player that can be wrong without looking wrong. A layout
 * bug is visible the moment somebody opens the page; a resume rule that sends
 * a reader to module 1 when they stopped at module 9 just looks like the
 * course is longer than they remembered, and nobody reports it.
 *
 * Four things have to hold, and the last two are the ones that bite:
 *
 *   - The units are the modules, in order, plus one assessment screen — and
 *     only when the course actually asks questions. Several electives ask
 *     none, and a submit screen for a paper that does not exist is a dead end.
 *   - Resume finds the first unread module, not the last read one. Modules
 *     can be marked in any order.
 *   - Nothing returns a unit that is not in the list. Every one of these
 *     values becomes a URL, and a bad one is a 404 in the middle of a course.
 *   - Empty and one-unit courses do not fall off either end.
 *
 * PURE: no database, no network.
 */

import {
  unitsOf, findUnit, resumeUnitId, neighbours, unitStates, unitProgress, ASSESSMENT_ID,
} from '../src/lib/programme/player.ts';
import { COURSE_CONTENT } from '../src/lib/course-content/index.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1; else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

const M = ['intro', 'signs', 'disclosure', 'reporting'];

console.log('1. what the screens are');
{
  const u = unitsOf({ moduleIds: M, hasQuestions: true });
  check('one screen per module, plus the assessment', u.length === 5, u.length);
  check('modules keep their authored order',
    u.slice(0, 4).map((x) => x.id).join(',') === M.join(','));
  check('the assessment is last', u[4].id === ASSESSMENT_ID && u[4].kind === 'assessment');
  check('positions are 1-based and gapless',
    u.every((x, i) => x.position === i + 1), u.map((x) => x.position).join(','));
  check('modules are marked as modules', u.slice(0, 4).every((x) => x.kind === 'module'));
}
{
  const u = unitsOf({ moduleIds: M, hasQuestions: false });
  check('no questions, no assessment screen', u.length === 4);
  check('and nothing claims to be one', u.every((x) => x.kind === 'module'));
}
{
  const u = unitsOf({ moduleIds: [], hasQuestions: false });
  check('a course with nothing in it has no screens', u.length === 0);
}
{
  const u = unitsOf({ moduleIds: [], hasQuestions: true });
  check('questions but no modules is just the assessment', u.length === 1 && u[0].position === 1);
}

console.log('\n2. finding one');
{
  const u = unitsOf({ moduleIds: M, hasQuestions: true });
  check('a real id is found', findUnit(u, 'disclosure')?.position === 3);
  check('the assessment is found by its id', findUnit(u, ASSESSMENT_ID)?.kind === 'assessment');
  check('an unknown id is null, not a guess', findUnit(u, 'nope') === null);
  check('and so is the empty string', findUnit(u, '') === null);
  check('the assessment is not found when there is none',
    findUnit(unitsOf({ moduleIds: M, hasQuestions: false }), ASSESSMENT_ID) === null,
    'otherwise a course with no paper links to a submit screen');
}

console.log('\n3. where a reader comes back to');
{
  const u = unitsOf({ moduleIds: M, hasQuestions: true });
  check('nothing read yet opens the first module', resumeUnitId(u, []) === 'intro');
  check('two read opens the third', resumeUnitId(u, ['intro', 'signs']) === 'disclosure');
  check('read out of order still returns the gap',
    resumeUnitId(u, ['intro', 'signs', 'reporting']) === 'disclosure',
    'the last one READ is reporting; the place to go back to is the one skipped');
  check('everything read opens the assessment',
    resumeUnitId(u, M) === ASSESSMENT_ID);
  check('an unknown id among the read ones changes nothing',
    resumeUnitId(u, ['intro', 'deleted-module']) === 'signs');
}
{
  const u = unitsOf({ moduleIds: M, hasQuestions: false });
  check('everything read with no paper reopens the last module',
    resumeUnitId(u, M) === 'reporting',
    'returning null here would send a finished elective to a page that cannot exist');
}
check('a course with no screens resumes to nothing',
  resumeUnitId(unitsOf({ moduleIds: [], hasQuestions: false }), []) === null);
{
  const u = unitsOf({ moduleIds: M, hasQuestions: true });
  const ids = new Set(u.map((x) => x.id));
  const cases = [[], ['intro'], ['intro', 'signs'], M, ['reporting'], ['x']];
  check('every resume answer is a screen that exists',
    cases.every((c) => ids.has(resumeUnitId(u, c) as string)),
    'each of these becomes a URL');
}

console.log('\n4. moving between them');
{
  const u = unitsOf({ moduleIds: M, hasQuestions: true });
  check('the first has no previous', neighbours(u, 'intro').prev === null);
  check('the first has a next', neighbours(u, 'intro').next?.id === 'signs');
  check('the middle has both',
    neighbours(u, 'signs').prev?.id === 'intro' && neighbours(u, 'signs').next?.id === 'disclosure');
  check('the last module leads to the assessment',
    neighbours(u, 'reporting').next?.id === ASSESSMENT_ID);
  check('the assessment has no next', neighbours(u, ASSESSMENT_ID).next === null);
  check('the assessment goes back to the last module',
    neighbours(u, ASSESSMENT_ID).prev?.id === 'reporting');
  check('an unknown id has neither, rather than the first',
    neighbours(u, 'nope').prev === null && neighbours(u, 'nope').next === null);
}
{
  const one = unitsOf({ moduleIds: ['only'], hasQuestions: false });
  const n = neighbours(one, 'only');
  check('a one-screen course has no way out either side', n.prev === null && n.next === null);
}
{
  const u = unitsOf({ moduleIds: M, hasQuestions: true });
  check('next and prev are inverses all the way along',
    u.every((x) => {
      const nx = neighbours(u, x.id).next;
      return nx === null || neighbours(u, nx.id).prev?.id === x.id;
    }));
}

console.log('\n5. what the contents list shows');
{
  const u = unitsOf({ moduleIds: M, hasQuestions: true });
  const s = unitStates(u, ['intro', 'signs'], 'disclosure', false);
  check('read modules are done', s.get('intro') === 'done' && s.get('signs') === 'done');
  check('the one being viewed is current', s.get('disclosure') === 'current');
  check('the rest are ahead', s.get('reporting') === 'ahead');
  check('an unpassed assessment is not done', s.get(ASSESSMENT_ID) === 'ahead');
  check('every unit gets a state', s.size === u.length);
}
{
  const u = unitsOf({ moduleIds: M, hasQuestions: true });
  const s = unitStates(u, M, ASSESSMENT_ID, true);
  check('a passed assessment being viewed is still current', s.get(ASSESSMENT_ID) === 'current');
  const away = unitStates(u, M, 'intro', true);
  check('a passed assessment viewed from elsewhere is done', away.get(ASSESSMENT_ID) === 'done');
  const failed = unitStates(u, M, 'intro', false);
  check('a submitted but failed attempt is not done', failed.get(ASSESSMENT_ID) === 'ahead',
    'a tick beside a retake button says the course is finished when it is not');
}
{
  const u = unitsOf({ moduleIds: M, hasQuestions: true });
  const s = unitStates(u, ['reporting'], 'reporting', false);
  check('current wins over done for the same unit', s.get('reporting') === 'current',
    'both are true; the reader needs to see where they are');
}
{
  const u = unitsOf({ moduleIds: M, hasQuestions: true });
  const s = unitStates(u, [], 'nope', false);
  check('viewing an unknown unit leaves everything else intact', s.size === u.length);
  check('and nothing is falsely current', [...s.values()].every((v) => v !== 'current'));
}

console.log('\n6. how far through');
{
  const u = unitsOf({ moduleIds: M, hasQuestions: true });
  check('nothing read is zero', unitProgress(u, []).percent === 0);
  check('two of four is half', unitProgress(u, ['intro', 'signs']).percent === 50);
  check('every module read is a hundred, assessment or not',
    unitProgress(u, M).percent === 100,
    'counting the assessment would leave a fully-read course at 80%');
  check('the total is modules, not screens', unitProgress(u, []).total === 4);
  check('unknown read ids do not inflate it', unitProgress(u, [...M, 'ghost']).done === 4);
  check('a duplicate read id counts once',
    unitProgress(u, ['intro', 'intro']).done === 1);
  check('an empty course is zero and not NaN',
    unitProgress(unitsOf({ moduleIds: [], hasQuestions: true }), []).percent === 0);
  check('percent is always a whole number in range',
    [[], ['intro'], ['intro', 'signs'], M].every((r) => {
      const p = unitProgress(u, r).percent;
      return Number.isInteger(p) && p >= 0 && p <= 100;
    }));
}

console.log('\n7. against the real catalogue');
{
  const slugs = Object.keys(COURSE_CONTENT);
  let widest = 0;
  const reserved: string[] = [];
  const underscored: string[] = [];
  const dupes: string[] = [];
  const misresumed: string[] = [];
  for (const slug of slugs) {
    const c = COURSE_CONTENT[slug];
    const ids = c.modules.map((m) => m.id);
    if (ids.includes(ASSESSMENT_ID)) reserved.push(slug);
    // The underscore is the whole reason the reserved id is safe. If content
    // ever starts using one, the guarantee is gone and this says so.
    if (ids.some((id) => id.startsWith('_'))) underscored.push(slug);
    if (new Set(ids).size !== ids.length) dupes.push(slug);
    const u = unitsOf({ moduleIds: ids, hasQuestions: true });
    widest = Math.max(widest, u.length);
    if (ids.length > 0 && resumeUnitId(u, []) !== ids[0]) misresumed.push(slug);
  }
  check('no course uses the reserved assessment id for a module', reserved.length === 0,
    reserved.join(',') || 'field-safety used to, which is why the id has an underscore');
  check('no module id starts with an underscore', underscored.length === 0,
    underscored.join(','));
  check('no course has two modules with the same id', dupes.length === 0,
    `${slugs.length} courses checked`);
  check('every written course splits into screens', slugs.length > 0, `${slugs.length} courses`);
  check('the longest is a sane number of screens', widest > 0 && widest < 60, `${widest} screens`);
  check('every course resumes to its own first module', misresumed.length === 0,
    misresumed.join(','));
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
