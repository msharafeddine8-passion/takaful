/*
 * What the learning analytics page may say, and what it must refuse to say.
 *
 * The page reports where a course loses people: the module they stop at, the
 * question most of them get wrong, the time it really costs. Every one of
 * those figures is one column of names away from being a page about people
 * instead, and the thing standing between the two is a suppression rule that
 * lives in one pure function and is applied in about a dozen places.
 *
 * That is exactly the kind of rule somebody later relaxes by one — «three is
 * so conservative, surely two is fine» — in a commit about something else.
 * This holds it, along with the arithmetic it guards: a completion rate that
 * cannot exceed a hundred, a mean that cannot fall below one paper per pass,
 * and a drop-off that names the earlier of two equal cliffs because that is
 * the only one whose repair helps everybody behind it.
 *
 * A PURE probe: no database, no network.
 */

import {
  MIN_COHORT, COLD_DAYS,
  isSuppressed, figureFor, percentageOf,
  completionOf, steepestDropOff, strandedAt, strandedIn,
  questionStandingOf, hardestQuestions, tooThinToJudge,
  paceOf, worstCompletion, neverAttempted,
  type CourseTotals, type Figure, type ModuleStep, type QuestionTally,
} from '../src/lib/learning-analytics.ts';

let ok = 0;
const holes: string[] = [];

function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1;
  else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

const eq = (what: string, got: unknown, want: unknown) =>
  check(
    what,
    Object.is(got, want),
    Object.is(got, want) ? '' : `got ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`,
  );

/** A figure's value, or the state name when there is no value to read. */
const val = (f: Figure): number | string => (f.state === 'known' ? f.value : f.state);

const totals = (over: Partial<CourseTotals>): CourseTotals => ({
  slug: 'teamwork', started: 0, finished: 0, passed: 0, attemptsByPassers: 0, ...over,
});

const step = (moduleId: string, reached: number, strandedHere = 0): ModuleStep =>
  ({ moduleId, reached, strandedHere });

const tally = (
  questionId: string, answeredBy: number, answers: number, wrong: number,
): QuestionTally => ({ questionId, moduleId: 'm1', answeredBy, answers, wrong });

/* ------------------------------------------------------------------ *
 * 1. The rule the whole page rests on
 * ------------------------------------------------------------------ */
console.log('\n1. suppression');

check('the floor is at least three people', MIN_COHORT >= 3, `MIN_COHORT=${MIN_COHORT}`);
check('one person is never reportable', isSuppressed(1));
check('two people are never reportable', isSuppressed(2));
check('the floor itself is reportable', !isSuppressed(MIN_COHORT));
/*
 * Zero is the one small number that is safe, and getting this wrong would gut
 * the feature: «nobody has opened this course» names nobody, and it is the
 * single most useful line on the page for whoever decides what to write next.
 */
check('nobody is not somebody, so zero is not suppressed', !isSuppressed(0));

const overTwo = figureFor(80, 2);
eq('a figure over a thin cohort is withheld, not rounded', overTwo.state, 'withheld');
eq('and it carries the cohort so the page can explain itself',
  overTwo.state === 'withheld' ? overTwo.cohort : null, 2);
eq('a figure over a real cohort is shown', val(figureFor(80, 9)), 80);
eq('nothing to compute is empty, which is not the same as withheld',
  figureFor(null, 9).state, 'empty');
/* Two different facts. A reader who cannot tell them apart concludes the
 * platform has gaps, which is the worse of the two conclusions. */
check('empty and withheld are distinguishable',
  figureFor(null, 9).state !== figureFor(80, 1).state);

/* ------------------------------------------------------------------ *
 * 2. Completion arithmetic
 * ------------------------------------------------------------------ */
console.log('\n2. completion');

eq('a share is a whole percentage', percentageOf(1, 3), 33);
eq('nothing to divide by has no share, rather than nought per cent',
  percentageOf(0, 0), null);
/* The counts come from separate aggregates over a table that is written to
 * while the page renders. A pass counted after the starters were counted must
 * not produce 103%. */
eq('a share can never exceed a hundred', percentageOf(12, 10), 100);
eq('nor fall below nought', percentageOf(-2, 10), 0);

const healthy = completionOf(totals({ started: 20, finished: 16, passed: 12, attemptsByPassers: 18 }));
eq('completion is of those who opened it', val(healthy.completion), 60);
eq('and reaching the paper is counted separately', val(healthy.reachedThePaper), 80);
eq('the head count is always shown', healthy.started, 20);
eq('papers per pass is a mean to one decimal', val(healthy.attemptsToPass), 1.5);

const thin = completionOf(totals({ started: 2, finished: 2, passed: 1, attemptsByPassers: 1 }));
eq('a course two people opened reports no completion rate', thin.completion.state, 'withheld');
eq('nor how many of the two finished', thin.finished.state, 'withheld');
eq('nor how many passed', thin.passed.state, 'withheld');
/* The head count stays. Knowing two people opened a course reveals neither of
 * them; knowing one of two passed reveals both. */
eq('but the head count still stands', thin.started, 2);

const untouched = completionOf(totals({ started: 0 }));
eq('a course nobody opened has no completion rate at all', untouched.completion.state, 'empty');
check('and is not reported as nought per cent',
  !(untouched.completion.state === 'known' && untouched.completion.value === 0));

/*
 * Its own cohort. A course fifty opened and two passed would otherwise report
 * an average built from those two under cover of the bigger number.
 */
eq('papers per pass is judged on the passers, not the starters',
  completionOf(totals({ started: 50, finished: 30, passed: 2, attemptsByPassers: 5 }))
    .attemptsToPass.state,
  'withheld');
eq('with nobody passing there is nothing to average',
  completionOf(totals({ started: 9, finished: 4, passed: 0 })).attemptsToPass.state, 'empty');
/* Below one would mean somebody passed without sitting anything — a recognised
 * pass, which is excluded upstream, or a bug. Neither prints as 0.6. */
eq('and it can never read as less than one paper per pass',
  val(completionOf(totals({ started: 9, finished: 9, passed: 5, attemptsByPassers: 2 }))
    .attemptsToPass),
  1);

/* ------------------------------------------------------------------ *
 * 3. Where the ladder narrows
 * ------------------------------------------------------------------ */
console.log('\n3. drop-off');

eq('one module cannot have a drop-off', steepestDropOff([step('a', 40)]), null);
eq('nor can a course everybody reads through',
  steepestDropOff([step('a', 12), step('b', 12), step('c', 12)]), null);

const cliff = steepestDropOff([step('a', 40), step('b', 38), step('c', 12), step('d', 11)]);
eq('the steepest fall is found, not the first', cliff?.moduleId, 'b');
eq('and it names the module people did not get to', cliff?.nextModuleId, 'c');
eq('with the people lost', cliff?.lost, 26);
eq('and the share of those who had got that far', cliff?.share, 68);

/*
 * The earlier of two equal cliffs. Everybody standing at the later one had to
 * get past the earlier one first, so repairing the first narrowing is the only
 * repair that can help both.
 */
eq('a tie goes to the earlier module',
  steepestDropOff([step('a', 30), step('b', 20), step('c', 20), step('d', 10)])?.moduleId, 'a');

/* A cliff one person fell off is one person's Tuesday afternoon. */
check('a fall of one is not reportable',
  steepestDropOff([step('a', 9), step('b', 8)])?.reportable === false);
check('a fall that clears the floor is',
  steepestDropOff([step('a', 9), step('b', 9 - MIN_COHORT)])?.reportable === true);
/* Found but not named: the page says the ladder is too thin to call rather
 * than pretending the course is fine. */
check('but it is still found, so the page can say why it is silent',
  steepestDropOff([step('a', 9), step('b', 8)]) !== null);

/*
 * Late in a long course the cohort still walking is small, so an ordinary
 * trickle reads as a huge share: five of six leaving at the last module is
 * 83% and is five people. Thirty of a hundred at the first is 30% and is the
 * association's problem. The count decides, and the share is context.
 */
const tail = [step('a', 100), step('b', 70), step('c', 45), step('d', 22), step('e', 6), step('f', 1)];
eq('the biggest fall in people wins, not the biggest fall in share',
  steepestDropOff(tail)?.moduleId, 'a');
check('even though a later rung loses a far bigger share of who is left',
  (steepestDropOff(tail)?.share ?? 100) < 50, `share=${steepestDropOff(tail)?.share}`);

/* ------------------------------------------------------------------ *
 * 4. People who stopped and did not come back
 * ------------------------------------------------------------------ */
console.log('\n4. stranded');

check('the cold threshold is a real wait, not a fortnight', COLD_DAYS >= 30, String(COLD_DAYS));
eq('one person stopped at a module is not printed', strandedAt(1).state, 'withheld');
eq('nor two', strandedAt(2).state, 'withheld');
eq('the floor is', val(strandedAt(MIN_COHORT)), MIN_COHORT);
eq('nobody stopped is nobody, and says so', val(strandedAt(0)), 0);

/*
 * The course total is judged on the total, not on any one rung. Four people
 * stopped across four modules is a fact about the course; that no single
 * module holds more than one of them does not make it unsayable.
 */
eq('a total across modules is judged on the total',
  val(strandedIn([step('a', 9, 1), step('b', 8, 1), step('c', 7, 1), step('d', 6, 1)])), 4);
eq('and a course with one person stranded anywhere still says nothing',
  strandedIn([step('a', 9, 1), step('b', 8, 0)]).state, 'withheld');

/* ------------------------------------------------------------------ *
 * 5. Questions
 * ------------------------------------------------------------------ */
console.log('\n5. questions');

eq('a failure rate is the share of answers that were wrong',
  val(questionStandingOf(tally('q1', 10, 20, 15)).failure), 75);
eq('a question one person answered is withheld',
  questionStandingOf(tally('q1', 1, 1, 1)).failure.state, 'withheld');
eq('suppression is decided on people, not on answers',
  questionStandingOf(tally('q1', 2, 40, 30)).failure.state, 'withheld');

const asked = [
  tally('q1', 10, 10, 9),   // 90% wrong
  tally('q2', 10, 10, 4),   // 40% wrong
  tally('q3', 1, 1, 1),     // 100% wrong, one person
  tally('q4', 8, 8, 0),     // nobody gets it wrong
];
const hardest = hardestQuestions(asked);
eq('the hardest question comes first', hardest[0]?.questionId, 'q1');
/*
 * The withheld one is dropped rather than sorted last. A row reading
 * «q3 — withheld» inside a list titled «most failed» tells the reader that q3
 * is among the most failed, which is the fact suppression was meant to keep.
 */
check('a withheld question never appears in the ranking',
  !hardest.some((q) => q.questionId === 'q3'), hardest.map((q) => q.questionId).join(', '));
check('a question nobody gets wrong is not a hard question',
  !hardest.some((q) => q.questionId === 'q4'));
check('every question in the ranking carries a number',
  hardest.every((q) => q.failure.state === 'known'));
eq('the ranking is capped', hardestQuestions(
  Array.from({ length: 20 }, (_, i) => tally(`q${i}`, 9, 9, 5)), 5).length, 5);
eq('and the ones that could not be judged are counted for the footnote',
  tooThinToJudge(asked), 1);

/* ------------------------------------------------------------------ *
 * 6. What the course costs against what it promises
 * ------------------------------------------------------------------ */
console.log('\n6. pace');

eq('a course taking about what it claims reads as such',
  paceOf(48, 45, 10).verdict, 'as-claimed');
eq('one taking half as long again is slower', paceOf(80, 45, 10).verdict, 'slower');
eq('one done in a third of the time is faster', paceOf(15, 45, 10).verdict, 'faster');
/* A verdict computed over two people is a verdict about two people. */
eq('a verdict is not reached over a thin cohort', paceOf(80, 45, 2).verdict, 'unknown');
eq('and the median behind it is withheld too', paceOf(80, 45, 2).median.state, 'withheld');
eq('with nobody timed there is no verdict', paceOf(null, 45, 0).verdict, 'unknown');
eq('a course claiming nothing cannot be judged against its claim',
  paceOf(30, 0, 10).verdict, 'unknown');
eq('the claim is carried through either way', paceOf(null, 45, 0).claimed, 45);

/* ------------------------------------------------------------------ *
 * 7. Across the academy
 * ------------------------------------------------------------------ */
console.log('\n7. the whole catalogue');

const rows = [
  completionOf(totals({ slug: 'good', started: 30, finished: 28, passed: 27 })),
  completionOf(totals({ slug: 'bad', started: 30, finished: 20, passed: 6 })),
  completionOf(totals({ slug: 'tiny', started: 2, finished: 0, passed: 0 })),
  completionOf(totals({ slug: 'idle', started: 0 })),
];
const worst = worstCompletion(rows);
eq('the worst course comes first', worst[0]?.slug, 'bad');
/*
 * Two people who both failed would top this table at 0% every time, and would
 * point staff at the two people rather than at the course.
 */
check('a course too thin to judge is not ranked as the worst',
  !worst.some((r) => r.slug === 'tiny'), worst.map((r) => r.slug).join(', '));
check('and neither is one nobody has opened',
  !worst.some((r) => r.slug === 'idle'));

const catalogue = neverAttempted([
  { slug: 'written-idle', started: 0, hasContent: true, status: 'published' },
  { slug: 'unwritten', started: 0, hasContent: false, status: 'draft' },
  { slug: 'busy', started: 14, hasContent: true, status: 'published' },
  { slug: 'retired', started: 0, hasContent: true, status: 'archived' },
]);
/*
 * Two different questions for two different people: a written course nobody
 * opens is for whoever points volunteers at courses, an unwritten one is for
 * whoever writes them. One list would put forty drafts above the finding.
 */
eq('a written course nobody opened is reported on its own', catalogue.unopened.length, 1);
eq('and an unwritten one separately', catalogue.unwritten.length, 1);
eq('the unwritten one is the one with no modules', catalogue.unwritten[0]?.slug, 'unwritten');
check('a course people are using is in neither list',
  !catalogue.unopened.concat(catalogue.unwritten).some((c) => c.slug === 'busy'));
/* Nobody opening a course that was deliberately withdrawn is the system
 * working, not a finding. */
check('a withdrawn course is not reported as neglected',
  !catalogue.unopened.concat(catalogue.unwritten).some((c) => c.slug === 'retired'));

/* ------------------------------------------------------------------ *
 * 8. Nothing on the way out can carry a person
 * ------------------------------------------------------------------ */
console.log('\n8. no people');

/*
 * A shape test rather than a value test, and worth its place: the failure mode
 * this page has is not a wrong percentage, it is somebody adding a `userId`
 * beside a count because it was there in the CTE anyway. Everything the pure
 * layer emits is checked for a field that could hold one.
 */
const PERSONAL = /user|person|learner|name|email|member/i;
const emitted: unknown[] = [
  healthy, thin, untouched, cliff, hardest[0], paceOf(48, 45, 10),
  strandedAt(4), catalogue.unopened[0], worst[0],
];
const leaked = emitted
  .filter((o): o is Record<string, unknown> => typeof o === 'object' && o !== null)
  .flatMap((o) => Object.keys(o))
  .filter((k) => PERSONAL.test(k));
eq('no figure this module returns has a field a person could travel in',
  leaked.join(', '), '');

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
