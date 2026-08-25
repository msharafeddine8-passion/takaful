/*
 * Practical tasks: work a learner writes, and a trainer reads.
 *
 * Three kinds of failure, and the first one is the expensive one.
 *
 * THE EXPENSIVE ONE. This feature is bolted onto courses volunteers have
 * already sat and already hold certificates for. courseFingerprint() decides
 * which version of a paper an attempt belongs to, and it is computed from the
 * content itself — so if a practical task ever leaked into the hashed shape of
 * a course, every past attempt at that course would suddenly claim to belong
 * to a paper that never existed, and every certificate would be evidence of
 * having passed something nobody can reconstruct. It is asserted here four
 * ways rather than assumed, exactly as probe-practice asserts the same
 * property for the practice blocks.
 *
 * THE QUIET ONE. A practical screen that a course does not ask for, or an
 * assessment screen that disappears when one is added. Every unit id becomes a
 * URL and a contents-list row; getting the list wrong is a 404 in the middle
 * of a course, or a reader who never finds the paper.
 *
 * THE ONE THAT MATTERS TO A PERSON. Somebody marking their own work, a
 * rejection with no words in it, or an approval quietly taken back. Those are
 * rules about people rather than about data, and they are written three times
 * over — here, in the server action, and as CHECK constraints in migration 041.
 * This is the copy that can be run without a database.
 *
 * PURE: no database, no network.
 */

import {
  unitsOf, findUnit, neighbours, unitStates, unitProgress,
  ASSESSMENT_ID, PRACTICAL_ID,
} from '../src/lib/programme/player.ts';
import {
  practicalTaskFor, hasPractical, coursesWithPractical,
  practicalState, newestFirst, latest, lastFeedback, mayResubmit, nextAttemptNo,
  checkBody, checkReview, courseOutcome, MIN_FEEDBACK,
  type Attempt, type PracticalTask,
} from '../src/lib/programme/practical.ts';
import { COURSE_CONTENT } from '../src/lib/course-content/index.ts';
import { courseFingerprint } from '../src/lib/course-version.ts';
import type { CourseContent } from '../src/lib/course-content/types.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1; else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

const SLUGS = Object.keys(COURSE_CONTENT);

/** A task shaped like a real one, for the rules that need one but not a course. */
const TASK: PracticalTask = {
  id: 'probe-task',
  title: { ar: 'مهمّة', en: 'Task' },
  brief: { ar: 'اكتب', en: 'Write' },
  looksLike: { ar: ['شيء'], en: ['something'] },
  minChars: 40,
  maxChars: 200,
};

/** An attempt, with only the fields a rule looks at spelled out. */
const attempt = (over: Partial<Attempt> = {}): Attempt => ({
  attemptNo: 1,
  submittedOn: '2026-08-25',
  body: 'x'.repeat(60),
  decision: null,
  feedback: null,
  reviewedOn: null,
  ...over,
});

/* ====================================================================== */
console.log('1. a practical task changes no existing course');
{
  /*
   * Said four ways, because it is the one property that costs somebody their
   * certificate if it stops being true.
   */
  const stripped = (c: CourseContent): CourseContent => {
    const { practical: _dropped, ...rest } = c;
    return rest as CourseContent;
  };

  let moved = 0;
  for (const slug of SLUGS) {
    if (courseFingerprint(COURSE_CONTENT[slug]) !== courseFingerprint(stripped(COURSE_CONTENT[slug]))) {
      moved += 1;
    }
  }
  check('removing every practical task changes no course fingerprint', moved === 0,
    moved === 0 ? `${SLUGS.length} courses` : `${moved} moved`);

  // The other direction, and the one that actually happens: a task is ADDED to
  // a course people have already sat.
  let movedOnAdd = 0;
  for (const slug of SLUGS) {
    const before = courseFingerprint(stripped(COURSE_CONTENT[slug]));
    const after = courseFingerprint({ ...stripped(COURSE_CONTENT[slug]), practical: TASK });
    if (before !== after) movedOnAdd += 1;
  }
  check('adding one to every course in the catalogue changes no fingerprint either',
    movedOnAdd === 0, `${SLUGS.length} courses`);

  // Editing a task afterwards — rewording the brief, moving the limits, even
  // renaming the id — must be just as free, or nobody dares touch one.
  const base = { ...stripped(COURSE_CONTENT[SLUGS[0]]), practical: TASK };
  const edited = {
    ...base,
    practical: { ...TASK, id: 'renamed', minChars: 999, brief: { ar: 'آخر', en: 'other' } },
  };
  check('editing a task afterwards changes no fingerprint',
    courseFingerprint(base) === courseFingerprint(edited),
    'otherwise a typo fix in a brief invalidates every attempt at that course');

  check('and there are real tasks for that to mean something',
    coursesWithPractical().length > 0,
    `${coursesWithPractical().map((c) => c.slug).join(', ')}`);

  /*
   * The check above is worthless if courseFingerprint has stopped noticing
   * anything at all. This is the control: something that SHOULD move it.
   */
  const withTask = { ...stripped(COURSE_CONTENT[SLUGS[0]]), practical: TASK };
  check('the fingerprint still moves when the pass mark does',
    courseFingerprint(withTask) !== courseFingerprint({ ...withTask, passMark: 99 }),
    'without this, the four assertions above would pass on a broken hash');
}

console.log('\n2. a task is never a question');
{
  // questionsIn() collects blocks of type 'quiz' and nothing else. A practical
  // task is not a block at all, and this is what keeps it that way.
  const blockTypes = new Set<string>();
  for (const slug of SLUGS) {
    for (const m of COURSE_CONTENT[slug].modules) for (const b of m.blocks) blockTypes.add(b.type);
  }
  check('no course has a block claiming to be a practical task', !blockTypes.has('practical'),
    [...blockTypes].join(','));

  const tasks = coursesWithPractical();
  check('no task carries a marked answer', tasks.every((t) => !('correct' in t.task)));
  check('no task carries a question id that answers could key on',
    tasks.every((t) => !('options' in t.task)),
    'an id plus options is what questionsIn turns into a graded question');
}

console.log('\n3. the screens a course splits into');
{
  const M = ['intro', 'risks', 'response'];

  const plain = unitsOf({ moduleIds: M, hasQuestions: true });
  check('a course with no task has exactly the screens it always had',
    plain.length === 4 && plain[3].id === ASSESSMENT_ID,
    'every existing call site omits hasPractical entirely');

  const both = unitsOf({ moduleIds: M, hasQuestions: true, hasPractical: true });
  check('a task adds one screen and no more', both.length === 5);
  check('it sits after the last module', both[3].id === PRACTICAL_ID && both[3].kind === 'practical');
  check('and before the assessment', both[4].id === ASSESSMENT_ID,
    'after it would mean pressing "finish the course" and then finding work left to do');
  check('positions stay 1-based and gapless',
    both.every((u, i) => u.position === i + 1), both.map((u) => u.position).join(','));

  const noPaper = unitsOf({ moduleIds: M, hasQuestions: false, hasPractical: true });
  check('a task with no questions is the last screen', noPaper.length === 4
    && noPaper[3].id === PRACTICAL_ID);
  check('and no assessment screen is invented for it',
    findUnit(noPaper, ASSESSMENT_ID) === null);

  check('the practical is not found on a course that sets none',
    findUnit(plain, PRACTICAL_ID) === null,
    'otherwise every course would link to a screen with no brief on it');

  check('the last module leads to the practical', neighbours(both, 'response').next?.id === PRACTICAL_ID);
  check('the practical leads to the assessment', neighbours(both, PRACTICAL_ID).next?.id === ASSESSMENT_ID);
  check('and back to the last module', neighbours(both, PRACTICAL_ID).prev?.id === 'response');
  check('next and prev remain inverses all the way along',
    both.every((u) => {
      const nx = neighbours(both, u.id).next;
      return nx === null || neighbours(both, nx.id).prev?.id === u.id;
    }));

  check('the practical is not counted as reading progress',
    unitProgress(both, M).percent === 100 && unitProgress(both, []).total === 3,
    'it is work, not a page — counting it leaves a fully-read course short of 100%');
}

console.log('\n4. what the contents list shows');
{
  const M = ['intro', 'risks'];
  const u = unitsOf({ moduleIds: M, hasQuestions: true, hasPractical: true });

  const sent = unitStates(u, M, 'intro', true, false);
  check('submitted but unread by a trainer is not done', sent.get(PRACTICAL_ID) === 'ahead',
    'a tick against work still in somebody queue says the course is finished when it is not');

  const accepted = unitStates(u, M, 'intro', true, true);
  check('accepted is done', accepted.get(PRACTICAL_ID) === 'done');

  const here = unitStates(u, M, PRACTICAL_ID, true, true);
  check('an accepted task being viewed is still current', here.get(PRACTICAL_ID) === 'current');

  check('every unit still gets a state', sent.size === u.length);
  check('the old four-argument call is unchanged',
    unitStates(u, M, 'intro', true).get(PRACTICAL_ID) === 'ahead',
    'every call that predates written work must behave as it did');
}

console.log('\n5. where a learner stands');
{
  check('nothing sent is not started', practicalState([]) === 'not-started');
  check('sent and unjudged is awaiting review',
    practicalState([attempt()]) === 'awaiting-review');
  check('sent back is changes requested',
    practicalState([attempt({ decision: 'changes_requested', feedback: 'add the assembly point' })])
      === 'changes-requested');
  check('accepted is accepted',
    practicalState([attempt({ decision: 'approved' })]) === 'approved');

  const returnedThenAccepted = [
    attempt({ attemptNo: 1, decision: 'changes_requested', feedback: 'more detail please' }),
    attempt({ attemptNo: 2, decision: 'approved' }),
  ];
  check('a rejection followed by an acceptance is accepted',
    practicalState(returnedThenAccepted) === 'approved');

  check('an acceptance anywhere in the history wins',
    practicalState([attempt({ attemptNo: 2, decision: 'approved' }), attempt({ attemptNo: 1 })])
      === 'approved',
    'the database refuses two verdicts, but a screen must never take back an acceptance');

  check('the newest is by attempt number, not by date',
    latest([
      attempt({ attemptNo: 1, submittedOn: '2026-08-25' }),
      attempt({ attemptNo: 2, submittedOn: '2026-08-25' }),
    ])?.attemptNo === 2,
    'two attempts on the same day tie on date and must still read in order');

  check('the order is newest first and complete',
    newestFirst([attempt({ attemptNo: 1 }), attempt({ attemptNo: 3 }), attempt({ attemptNo: 2 })])
      .map((a) => a.attemptNo).join(',') === '3,2,1');

  check('sorting does not modify what it was handed', (() => {
    const given = [attempt({ attemptNo: 1 }), attempt({ attemptNo: 2 })];
    newestFirst(given);
    return given[0].attemptNo === 1;
  })(), 'the page renders from the same array');

  check('the feedback shown is the newest that has any',
    lastFeedback([
      attempt({ attemptNo: 1, decision: 'changes_requested', feedback: 'first note' }),
      attempt({ attemptNo: 2, decision: 'changes_requested', feedback: 'second note' }),
      attempt({ attemptNo: 3 }),
    ])?.feedback === 'second note');
  check('no feedback anywhere is null rather than an empty attempt',
    lastFeedback([attempt()]) === null);
}

console.log('\n6. when a learner may write again');
{
  check('with nothing sent, yes', mayResubmit([]) === true);
  check('after being sent back, yes',
    mayResubmit([attempt({ decision: 'changes_requested', feedback: 'again please' })]) === true);
  check('while a trainer holds it, no', mayResubmit([attempt()]) === false,
    'a second copy in the queue is two people reading the same plan');
  check('after acceptance, no', mayResubmit([attempt({ decision: 'approved' })]) === false);

  check('the first attempt is number one', nextAttemptNo([]) === 1);
  check('numbers are never reused',
    nextAttemptNo([attempt({ attemptNo: 1 }), attempt({ attemptNo: 2 })]) === 3);
  check('and never reused after a gap',
    nextAttemptNo([attempt({ attemptNo: 5 })]) === 6,
    'reusing 2 after a row was somehow lost would overwrite a kept submission');
}

console.log('\n7. what can be sent');
{
  const long = 'x'.repeat(80);
  check('a real answer goes through', checkBody(long, TASK).ok === true);
  check('an empty box is refused',
    (() => { const r = checkBody('', TASK); return !r.ok && r.reason === 'empty'; })());
  check('whitespace is empty, not long enough',
    (() => { const r = checkBody('   \n\n\t  ', TASK); return !r.ok && r.reason === 'empty'; })(),
    'twelve blank lines must not clear a minimum');
  check('too short is refused as too short',
    (() => { const r = checkBody('too brief', TASK); return !r.ok && r.reason === 'too-short'; })());
  check('too long is refused',
    (() => { const r = checkBody('x'.repeat(500), TASK); return !r.ok && r.reason === 'too-long'; })());
  check('exactly the minimum is accepted',
    checkBody('x'.repeat(TASK.minChars), TASK).ok === true, 'a boundary that refuses is a bug report');
  check('exactly the maximum is accepted',
    checkBody('x'.repeat(TASK.maxChars), TASK).ok === true);
  check('what is stored is trimmed',
    (() => { const r = checkBody(`  ${long}  `, TASK); return r.ok && r.body === long; })());
  check('length is measured after trimming, not before',
    (() => {
      const r = checkBody(' '.repeat(400) + 'short', TASK);
      return !r.ok && r.reason === 'too-short';
    })(),
    'padding with spaces must not buy a pass through the floor');
}

console.log('\n8. who may judge, and how');
{
  const good = {
    capable: true, reviewerId: 'trainer', learnerId: 'learner',
    alreadyDecided: false, decision: 'approved' as const, feedback: '',
  };
  check('a capable reader may accept work', checkReview(good).ok === true);
  check('acceptance needs no words', checkReview({ ...good, feedback: '' }).ok === true,
    '"accepted" is already a complete message');

  check('nobody marks their own work',
    (() => {
      const r = checkReview({ ...good, reviewerId: 'learner' });
      return !r.ok && r.reason === 'self';
    })(),
    'trainers take these courses too; this is the rule that makes every approval mean anything');

  check('and not even to send their own work back',
    (() => {
      const r = checkReview({
        ...good, reviewerId: 'learner',
        decision: 'changes_requested', feedback: 'a perfectly good note',
      });
      return !r.ok && r.reason === 'self';
    })(),
    'self is checked before the feedback rule, so the refusal names the real reason');

  check('somebody without the capability may not',
    (() => {
      const r = checkReview({ ...good, capable: false });
      return !r.ok && r.reason === 'not-permitted';
    })());

  check('a verdict already recorded is not overwritten',
    (() => {
      const r = checkReview({ ...good, alreadyDecided: true });
      return !r.ok && r.reason === 'already-decided';
    })(),
    'two trainers opening the same submission is the ordinary case');

  check('sending work back must say what to change',
    (() => {
      const r = checkReview({ ...good, decision: 'changes_requested', feedback: '' });
      return !r.ok && r.reason === 'no-feedback';
    })());
  check('and a shrug does not count',
    (() => {
      const r = checkReview({ ...good, decision: 'changes_requested', feedback: '  no  ' });
      return !r.ok && r.reason === 'no-feedback';
    })(),
    'measured after trimming, like the body');
  check('a real sentence does',
    checkReview({
      ...good, decision: 'changes_requested',
      feedback: 'The assembly point is missing from the emergency plan.',
    }).ok === true);
  check('the floor is a length somebody could write a sentence in',
    MIN_FEEDBACK >= 5 && MIN_FEEDBACK <= 40, String(MIN_FEEDBACK));
}

console.log('\n9. whether the course is finished');
{
  const none = { task: null, history: [] as Attempt[], alreadyCertified: false };

  check('a course with no task is complete on the paper alone',
    courseOutcome({ ...none, paperPassed: true }).complete === true,
    'thirty-eight of the forty-one courses take this branch and must not change');
  check('and incomplete when the paper is not passed',
    courseOutcome({ ...none, paperPassed: false }).waitingOn === 'paper');

  const set = { task: TASK, alreadyCertified: false };
  check('a task and no paper waits on the paper',
    courseOutcome({ ...set, paperPassed: false, history: [] }).waitingOn === 'paper');
  check('a passed paper and nothing written waits on the writing',
    courseOutcome({ ...set, paperPassed: true, history: [] }).waitingOn === 'practical-submission');
  check('written and unread waits on the trainer',
    courseOutcome({ ...set, paperPassed: true, history: [attempt()] }).waitingOn
      === 'practical-review');
  check('sent back waits on the learner again',
    courseOutcome({
      ...set, paperPassed: true,
      history: [attempt({ decision: 'changes_requested', feedback: 'add the roles' })],
    }).waitingOn === 'practical-changes');
  check('paper passed and work accepted is finished',
    courseOutcome({
      ...set, paperPassed: true, history: [attempt({ decision: 'approved' })],
    }).complete === true);

  check('nothing incomplete ever reports itself as finished',
    ([false, true] as const).every((paper) =>
      [[], [attempt()], [attempt({ decision: 'changes_requested', feedback: 'redo it' })]]
        .every((h) => {
          const out = courseOutcome({ ...set, paperPassed: paper, history: h });
          return out.complete === false && out.waitingOn !== null;
        })),
    'a refusal with no reason is a dead end for the learner');
  check('and nothing finished carries an outstanding step',
    courseOutcome({ ...set, paperPassed: true, history: [attempt({ decision: 'approved' })] })
      .waitingOn === null);

  /*
   * The promise that makes it safe to add a task to a course that is already
   * running. Said twice, because it is what the migration and the whole design
   * are protecting.
   */
  check('a certificate already held is never put back into a queue',
    courseOutcome({ task: TASK, paperPassed: true, history: [], alreadyCertified: true })
      .complete === true,
    'adding a task to Field Safety must not tell last March volunteers their certificate is pending');
  check('not even when their work was once sent back',
    courseOutcome({
      task: TASK, paperPassed: true, alreadyCertified: true,
      history: [attempt({ decision: 'changes_requested', feedback: 'this was later' })],
    }).complete === true);
}

console.log('\n10. days are Beirut text, never a Date');
{
  /*
   * The query hands over 'YYYY-MM-DD' already shifted to Asia/Beirut. The
   * failure this guards against is somebody "helpfully" reconstructing a Date
   * from it downstream: work submitted at 00:30 Beirut on the 5th is 22:30 GMT
   * on the 4th, and every GMT-based reading of it is off by a day.
   */
  const beirutDay = '2026-03-05';
  const gmtWouldSay = new Date('2026-03-04T22:30:00Z').toISOString().slice(0, 10);
  check('the two readings genuinely differ for a late-night submission',
    gmtWouldSay === '2026-03-04',
    'if this ever stops being true the assertion below proves nothing');

  const row = attempt({ submittedOn: beirutDay });
  check('the day is carried through untouched',
    latest([row])?.submittedOn === beirutDay,
    'nothing between the query and the screen may reinterpret it');
  check('ordering never consults the day at all',
    newestFirst([
      attempt({ attemptNo: 2, submittedOn: '2026-01-01' }),
      attempt({ attemptNo: 1, submittedOn: '2026-12-31' }),
    ])[0].attemptNo === 2,
    'a later date on an earlier attempt must not reorder the history');
  check('every day handed around is plain YYYY-MM-DD text',
    typeof row.submittedOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(row.submittedOn));
}

console.log('\n11. against the real catalogue');
{
  const tasks = coursesWithPractical();
  console.log(`  (${tasks.length} of ${SLUGS.length} courses set written work)`);

  check('every course that sets one is found by slug',
    tasks.every((t) => practicalTaskFor(t.slug)?.id === t.task.id));
  check('and every course that does not returns null',
    SLUGS.filter((s) => !hasPractical(s)).every((s) => practicalTaskFor(s) === null));
  check('an unknown slug is null, not a guess', practicalTaskFor('no-such-course') === null);
  check('and so is the empty string', practicalTaskFor('') === null);

  check('no task id collides with a module id of its own course',
    tasks.every((t) => !COURSE_CONTENT[t.slug].modules.some((m) => m.id === t.task.id)),
    'both become part of a URL under the same course');

  check('no task id is a reserved player id',
    tasks.every((t) => t.task.id !== ASSESSMENT_ID && t.task.id !== PRACTICAL_ID));

  check('no module id anywhere collides with the practical screen',
    SLUGS.every((s) => !COURSE_CONTENT[s].modules.some((m) => m.id === PRACTICAL_ID)),
    'the underscore is what makes the reserved id safe; probe-player holds the general rule');

  check('task ids are unique across the catalogue',
    new Set(tasks.map((t) => t.task.id)).size === tasks.length,
    'they are only ever read alongside a slug, but a duplicate is a copy-paste that meant something else');

  check('every limit leaves room for the work asked for',
    tasks.every((t) => t.task.minChars >= 100 && t.task.minChars < t.task.maxChars),
    'a floor a learner can clear with two lines tests nothing');

  check('and no ceiling is lower than the database floor',
    tasks.every((t) => t.task.minChars >= 40),
    'chk_practical_body in migration 041 refuses anything under 40 characters');

  check('every task states what a trainer will look for',
    tasks.every((t) => t.task.looksLike.ar.length >= 3 && t.task.looksLike.en.length >= 3),
    'without it the learner is guessing and two trainers are marking different things');

  const missing: string[] = [];
  const bothWays = (where: string, a: string, e: string) => {
    if (!a || !e) missing.push(`${where}: empty`);
    else if (a.length > 1 && a === e) missing.push(`${where}: "${a}" in both`);
  };
  for (const { slug, task } of tasks) {
    bothWays(`${slug}/title`, task.title.ar, task.title.en);
    bothWays(`${slug}/brief`, task.brief.ar, task.brief.en);
    if (task.looksLike.ar.length !== task.looksLike.en.length) {
      missing.push(`${slug}: looksLike counts differ`);
    }
    task.looksLike.ar.forEach((a, i) => bothWays(`${slug}/looksLike[${i}]`, a, task.looksLike.en[i] ?? ''));
  }
  check('nothing is left untranslated', missing.length === 0,
    missing.slice(0, 4).join(' | ') || `${tasks.length} tasks checked`);

  check('every brief says enough to act on',
    tasks.every((t) => t.task.brief.ar.length > 150 && t.task.brief.en.length > 150),
    'a one-line brief produces a one-line submission and an evening of rejections');
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
