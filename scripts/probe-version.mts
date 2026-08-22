/*
 * Which version of a course somebody actually sat.
 *
 * Content gets edited. Without a record of what was on the screen at the time,
 * an attempt from March is indistinguishable from one taken today, and the one
 * question that matters when a result is disputed — what was this person
 * actually asked? — has no answer.
 *
 * The fingerprint is only worth having if it has three properties, and each
 * fails silently if it breaks:
 *
 *   - Stable. The same content always gives the same string, whatever order
 *     things were authored in. A fingerprint that churned would report edits
 *     that never happened.
 *   - Sensitive to what matters. Change a correct answer and it must change,
 *     or an attempt claims to belong to a paper it was never sat against.
 *   - Deaf to what does not. A typo fix in a paragraph must not change it, or
 *     the field is noise within a month and everybody stops reading it.
 *
 * PURE: no database, no network.
 */

import { courseFingerprint } from '../src/lib/course-version.ts';
import { COURSE_CONTENT } from '../src/lib/course-content/index.ts';
import type { CourseContent } from '../src/lib/course-content/types.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1; else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

const L = (s: string) => ({ ar: s, en: s });
const quiz = (id: string, correct: number, options = 3) => ({
  type: 'quiz' as const,
  id,
  label: L('س'),
  question: L('سؤال'),
  options: Array.from({ length: options }, (_, i) => L(`خيار ${i}`)),
  correct,
  feedback: L('تفسير'),
});

const base: CourseContent = {
  slug: 'demo', level: 1, minutes: 20, passMark: 80,
  title: L('دورة'), lede: L('وصف'), outcomes: { ar: ['أ'], en: ['a'] },
  modules: [
    { id: 'm1', tag: L('ت'), title: L('و١'), lede: L('ل'), blocks: [quiz('q1', 0), quiz('q2', 1)] },
    { id: 'm2', tag: L('ت'), title: L('و٢'), lede: L('ل'), blocks: [quiz('q3', 2)] },
  ],
  sources: ['x'],
};
const clone = (): CourseContent => JSON.parse(JSON.stringify(base));

console.log('\n1. stable');
check('the same content gives the same fingerprint',
  courseFingerprint(base) === courseFingerprint(clone()));
check('and it is twelve hex characters',
  /^[0-9a-f]{12}$/.test(courseFingerprint(base)), courseFingerprint(base));

/* Authoring order is an accident. A fingerprint that moved when somebody
 * reordered two questions would report an edit that never happened. */
const reordered = clone();
reordered.modules[0].blocks = [quiz('q2', 1), quiz('q1', 0)];
check('reordering questions does not change it',
  courseFingerprint(reordered) === courseFingerprint(base));

console.log('\n2. sensitive to what changes a result');
const movedAnswer = clone();
(movedAnswer.modules[0].blocks[0] as { correct: number }).correct = 2;
check('changing a correct answer changes it',
  courseFingerprint(movedAnswer) !== courseFingerprint(base),
  'otherwise an attempt claims a paper it never sat');

const newMark = clone();
newMark.passMark = 60;
check('changing the pass mark changes it',
  courseFingerprint(newMark) !== courseFingerprint(base));

const added = clone();
added.modules[1].blocks.push(quiz('q4', 0));
check('adding a question changes it', courseFingerprint(added) !== courseFingerprint(base));

const removed = clone();
removed.modules[0].blocks = [quiz('q1', 0)];
check('removing one changes it', courseFingerprint(removed) !== courseFingerprint(base));

const fewerOptions = clone();
fewerOptions.modules[0].blocks[0] = quiz('q1', 0, 2);
check('changing how many options an answer hid among changes it',
  courseFingerprint(fewerOptions) !== courseFingerprint(base),
  'one-in-two is not the same test as one-in-three');

const droppedModule = clone();
droppedModule.modules = [droppedModule.modules[0]];
check('removing a module changes it',
  courseFingerprint(droppedModule) !== courseFingerprint(base));

console.log('\n3. deaf to what does not');
const typo = clone();
typo.modules[0].blocks[0] = { ...quiz('q1', 0), question: L('نفس السؤال بصياغة مصحّحة') };
check('rewording a question does not change it',
  courseFingerprint(typo) === courseFingerprint(base),
  'fixing a typo does not make somebody\'s pass a different pass');

const newProse = clone();
newProse.lede = L('وصف جديد تماماً');
newProse.title = L('عنوان جديد');
newProse.modules[0].lede = L('مقدمة معادة الكتابة');
check('rewriting the prose does not change it',
  courseFingerprint(newProse) === courseFingerprint(base));

const retimed = clone();
retimed.minutes = 45;
retimed.sources = ['a', 'b', 'c'];
check('the estimate and the reference list do not change it',
  courseFingerprint(retimed) === courseFingerprint(base));

console.log('\n4. across the real catalogue');
const slugs = Object.keys(COURSE_CONTENT);
const prints = slugs.map((s) => courseFingerprint(COURSE_CONTENT[s]));
check('every written course fingerprints', prints.every(Boolean), `${slugs.length} courses`);
check('all twelve hex characters', prints.every((p) => /^[0-9a-f]{12}$/.test(p)));
check('no two courses collide', new Set(prints).size === prints.length,
  `${new Set(prints).size} distinct of ${prints.length}`);
check('and it is the same on a second run',
  slugs.every((s, i) => courseFingerprint(COURSE_CONTENT[s]) === prints[i]),
  'a fingerprint that varied per call would stamp every attempt differently');

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
