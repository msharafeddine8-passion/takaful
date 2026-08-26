/*
 * Does the longest option win?
 *
 * A multiple-choice paper has a second, invisible question printed beside
 * every real one: "which of these was written by the person who knew the
 * answer?" A correct option gets the qualifier, the exception and the "and
 * then tell the lead"; the three wrong ones get a clause each. Nobody decides
 * to do this. It falls out of writing the true thing carefully and the false
 * things quickly, and once it is in the paper a volunteer who has read none of
 * the material can pass by counting characters.
 *
 * An audit put that at ~92.8% of this academy's marked questions. At that rate
 * the certificate measures test-wiseness and nothing else.
 *
 * WHAT IS MEASURED, AND WHY IT IS NOT "IS THE CORRECT ONE THE LONGEST"
 *
 * The honest figure is the *payoff of the strategy*: a learner who reads
 * nothing, measures the four options and picks a longest one. If the correct
 * answer stands alone at the top they score 1. If it ties with one other
 * longest option they score 1/2, because they are choosing between two
 * indistinguishable-by-length answers. If it is not among the longest they
 * score 0.
 *
 * That definition matters because the cheap way to make a "strictly longest"
 * check go green is to pad one distractor to exactly the length of the correct
 * answer and leave the other two short — which barely dents the real tell. The
 * payoff metric prices that honestly (0.5, not 0) and only falls when the
 * correct answer stops being reliably at the top.
 *
 * Both languages are measured separately and both must pass. Arabic and
 * English say the same thing at different lengths, so a tell fixed in one
 * survives happily in the other, and a volunteer sitting the paper sits it in
 * one language.
 *
 * PURE: reads the authored TypeScript and nothing else. No database, no
 * network — DATABASE_URL on this machine points at production.
 */
import { COURSE_CONTENT } from '../src/lib/course-content/index.ts';
import type { Block, CourseContent } from '../src/lib/course-content/types.ts';
import type { Locale } from '../src/lib/i18n.ts';

let holes = 0,
  confirmed = 0;
function check(label: string, ok: boolean, detail: unknown = '') {
  if (!ok) holes += 1;
  else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail === '' ? '' : '  — ' + detail}`);
}

const LANGS: Locale[] = ['ar', 'en'];

/*
 * THE THRESHOLD: 40%.
 *
 * Four options, so a learner who cannot read the paper at all scores 25%. The
 * floor is not the target: a correct answer is often legitimately the longer
 * sentence, because "call the lead, then write it down" is genuinely the
 * answer and "ignore it" is genuinely one of the wrong ones. Forcing every
 * paper down to 25% would mean padding distractors into nonsense, which is a
 * worse paper than the one being fixed.
 *
 * 40% is a 15-point lift over chance — enough room for that honest excess,
 * and low enough that the strategy fails three times in five. Above it, length
 * is a usable substitute for study; below it, it is noise a learner cannot
 * bank on. 92.8% is not in the same conversation as either.
 */
const OVERALL_MAX = 0.4;

/*
 * And a per-course ceiling, because an overall average can hide a course that
 * is still perfectly exploitable — forty honest courses will happily carry one
 * that answers to a ruler. 60% on any course with enough questions to be more
 * than noise. A five-question course swings 20 points on one question, so
 * asserting a rate there measures rounding rather than authoring.
 */
const PER_COURSE_MAX = 0.6;
const PER_COURSE_MIN_QUESTIONS = 6;

type Quiz = Extract<Block, { type: 'quiz' }>;

/** Every marked question in a course, flattened. Practice blocks are not marked. */
function quizzesIn(course: CourseContent): Quiz[] {
  const found: Quiz[] = [];
  for (const mod of course.modules) {
    for (const block of mod.blocks) {
      if (block.type === 'quiz') found.push(block);
    }
  }
  return found;
}

/*
 * Length as a reader meets it: code points, trimmed, with Arabic short vowels
 * and tatweel removed. A harakah is not a syllable of extra reading and an
 * author who vocalises one option and not another has not made it longer;
 * counting them would let a diacritic decide whether a question passes.
 */
const ARABIC_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
function readLength(text: string): number {
  return [...text.replace(ARABIC_MARKS, '').trim()].length;
}

/** What "always pick a longest option" scores on one question: 1, a fraction, or 0. */
function payoff(options: string[], correct: number): number {
  const lengths = options.map(readLength);
  const longest = Math.max(...lengths);
  const winners = lengths.filter((n) => n === longest).length;
  return lengths[correct] === longest ? 1 / winners : 0;
}

type Tally = { questions: number; payoff: number; strictlyLongest: number; tiedLongest: number };
const empty = (): Tally => ({ questions: 0, payoff: 0, strictlyLongest: 0, tiedLongest: 0 });

const perCourse = new Map<string, Record<Locale, Tally>>();
const overall: Record<Locale, Tally> = { ar: empty(), en: empty() };

const slugs = Object.keys(COURSE_CONTENT).sort();
for (const slug of slugs) {
  const course = COURSE_CONTENT[slug];
  const tally: Record<Locale, Tally> = { ar: empty(), en: empty() };
  for (const quiz of quizzesIn(course)) {
    for (const lang of LANGS) {
      const options = quiz.options.map((o) => o[lang]);
      const lengths = options.map(readLength);
      const longest = Math.max(...lengths);
      const winners = lengths.filter((n) => n === longest).length;
      const t = tally[lang];
      t.questions += 1;
      t.payoff += payoff(options, quiz.correct);
      if (lengths[quiz.correct] === longest) {
        if (winners === 1) t.strictlyLongest += 1;
        else t.tiedLongest += 1;
      }
    }
  }
  perCourse.set(slug, tally);
  for (const lang of LANGS) {
    overall[lang].questions += tally[lang].questions;
    overall[lang].payoff += tally[lang].payoff;
    overall[lang].strictlyLongest += tally[lang].strictlyLongest;
    overall[lang].tiedLongest += tally[lang].tiedLongest;
  }
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const rate = (t: Tally) => (t.questions === 0 ? 0 : t.payoff / t.questions);

console.log(
  `\n${slugs.length} courses, ${overall.ar.questions} marked questions, measured in ${LANGS.length} languages\n`,
);

console.log('--- per course: what "pick the longest option" scores ---');
console.log('    course                                 ar            en');
for (const slug of slugs) {
  const t = perCourse.get(slug)!;
  const cell = (lang: Locale) => {
    const x = t[lang];
    return `${pct(rate(x)).padStart(6)} (${x.strictlyLongest}${x.tiedLongest ? `+${x.tiedLongest}` : ''}/${x.questions})`;
  };
  console.log(`    ${slug.padEnd(36)} ${cell('ar').padEnd(13)} ${cell('en')}`);
}

console.log('\n--- overall, per language ---');
for (const lang of LANGS) {
  const t = overall[lang];
  console.log(
    `    ${lang}: ${pct(rate(t))} over ${t.questions} questions  ` +
      `(${t.strictlyLongest} strictly longest, ${t.tiedLongest} tied longest)`,
  );
}

console.log('\n--- the paper does not answer to a ruler ---');
for (const lang of LANGS) {
  const t = overall[lang];
  check(
    `${lang}: picking the longest option scores below ${pct(OVERALL_MAX)}`,
    rate(t) < OVERALL_MAX,
    `${pct(rate(t))} over ${t.questions} questions`,
  );
}

console.log('\n--- and no single course is exploitable on its own ---');
for (const lang of LANGS) {
  const bad = slugs.filter((slug) => {
    const t = perCourse.get(slug)![lang];
    return t.questions >= PER_COURSE_MIN_QUESTIONS && rate(t) >= PER_COURSE_MAX;
  });
  check(
    `${lang}: no course of ${PER_COURSE_MIN_QUESTIONS}+ questions scores ${pct(PER_COURSE_MAX)} or more`,
    bad.length === 0,
    bad.length
      ? bad.map((s) => `${s} ${pct(rate(perCourse.get(s)![lang]))}`).join(', ')
      : `${slugs.filter((s) => perCourse.get(s)!.ar.questions >= PER_COURSE_MIN_QUESTIONS).length} courses large enough to judge`,
  );
}

/*
 * A control, and the reason this file is not three green lines that prove
 * nothing: the measurement must be able to see the defect it was written for.
 * A synthetic question whose correct answer is plainly the longest has to
 * score 1, and one whose correct answer is the shortest has to score 0. If
 * either drifts, every figure above is decoration.
 */
console.log('\n--- the measurement itself still detects the tell ---');
check(
  'a question whose correct answer is plainly the longest scores 1',
  payoff(['نعم', 'لا', 'تبلغ المسؤول ثم توثّق ما جرى كتابةً في نفس اليوم', 'ربما'], 2) === 1,
);
check(
  'one whose correct answer is the shortest scores 0',
  payoff(['تبلغ المسؤول ثم توثّق ما جرى كتابةً في نفس اليوم', 'لا تفعل شيئاً أبداً', 'نعم', 'ربما'], 2) === 0,
);
check(
  'and a correct answer tied with one other longest scores a half',
  payoff(['aaaa', 'bbbb', 'cc', 'd'], 0) === 0.5,
);

/*
 * Nothing here may quietly change a paper. This probe only reads, but the
 * fix it drives edits option text across the catalogue, and the one edit
 * nobody is allowed to make is to the answer key. Every question must still
 * point at an option that exists.
 */
console.log('\n--- every answer key still points at a real option ---');
let keyed = 0;
for (const slug of slugs) {
  for (const quiz of quizzesIn(COURSE_CONTENT[slug])) {
    if (quiz.correct >= 0 && quiz.correct < quiz.options.length) keyed += 1;
    else console.log(`    out of range: ${slug} ${quiz.id} correct=${quiz.correct}`);
  }
}
check('all of them', keyed === overall.ar.questions, `${keyed}/${overall.ar.questions}`);

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
