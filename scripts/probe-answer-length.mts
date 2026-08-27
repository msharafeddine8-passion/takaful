/*
 * Does the length of an option tell you whether it is the answer?
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
 * BOTH DIRECTIONS, BECAUSE THE TELL HAS A MIRROR
 *
 * The first pass of this probe only asked whether the *longest* option wins,
 * and drove that figure from 92.8% down to the high twenties. It went green
 * while a second, identical defect sat untouched behind it: on several courses
 * the correct answer had become the reliably *shortest* one — 83% on
 * `teamwork` (ar), on `community-needs` (ar), on `life-skills` (en). A learner
 * who notices that the short answer is usually right passes exactly as easily
 * as one who picks the long one, and a one-directional probe cannot see them.
 *
 * Worse, a one-directional probe *rewards* the mirror. The cheapest way to
 * stop a correct answer being longest is to lengthen every distractor past it,
 * which lands it at the bottom and scores green. So the two measurements are
 * not two nice-to-haves; the second is what stops the first being satisfied by
 * moving the defect rather than removing it. The fix that satisfies both at
 * once is the same one either way: leave the correct answer mid-pack, with at
 * least one distractor longer and at least one shorter.
 *
 * WHAT IS MEASURED, AND WHY IT IS NOT "IS THE CORRECT ONE THE LONGEST"
 *
 * The honest figure is the *payoff of the strategy*: a learner who reads
 * nothing, measures the four options and picks a longest one — or, for the
 * mirror, a shortest one. If the correct answer stands alone at that end they
 * score 1. If it ties with one other option there they score 1/2, because they
 * are choosing between two indistinguishable-by-length answers. If it is not
 * at that end at all they score 0.
 *
 * That definition matters because the cheap way to make a "strictly longest"
 * check go green is to pad one distractor to exactly the length of the correct
 * answer and leave the other two short — which barely dents the real tell. The
 * payoff metric prices that honestly (0.5, not 0) and only falls when the
 * correct answer stops being reliably at that end.
 *
 * AND ONE NUMBER THAT CANNOT BE GAMED FROM EITHER SIDE
 *
 * Two thresholds still leave a gap between them. A course could put every
 * correct answer second-longest of four: never longest, never shortest, both
 * directional figures at zero — and still perfectly readable by a learner who
 * has noticed the pattern. So alongside the two payoffs this probe reports the
 * correct answer's mean normalised length-rank: 0 if it is always the shortest
 * option, 1 if always the longest, 0.5 if length carries no information at
 * all. That single figure is the invariant; the two payoffs are what a person
 * can act on, which is why all three are asserted rather than just the rank.
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

/*
 * THE RANK BAND: 0.5 ± 0.10.
 *
 * The rank has a true centre that the payoffs do not — 0.5 means length told
 * the reader nothing — so it is asserted as a band around that centre rather
 * than as a ceiling. Both edges are live: drifting up is the original defect,
 * drifting down is its mirror, and a probe that only capped the top would
 * bless a paper that had been over-corrected into answering to a ruler
 * upside-down.
 *
 * 0.10 on a four-option question is a tenth of the gap between the shortest
 * and the longest option — about a third of one rank step. It leaves room for
 * the honest excess the 40% ceiling leaves room for (the true answer really is
 * the longer sentence more often than not) without leaving room for a pattern
 * anybody could bank on.
 *
 * Per course the band is wider, 0.5 ± 0.18: a six-question course moves its
 * mean rank by 0.06 on a single question, so a tight band there would fail on
 * arithmetic rather than on authoring.
 */
const RANK_CENTRE = 0.5;
const OVERALL_RANK_TOLERANCE = 0.1;
const PER_COURSE_RANK_TOLERANCE = 0.18;

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

/** The two strategies a ruler affords. Everything below is computed for each. */
type Direction = 'longest' | 'shortest';
const DIRECTIONS: Direction[] = ['longest', 'shortest'];

/**
 * What "always pick a `dir` option" scores on one question: 1, a fraction, or 0.
 *
 * One function for both directions rather than two, so the mirror cannot drift
 * away from the original: whatever the longest-side measurement means, the
 * shortest side means exactly the same thing with the comparison flipped.
 */
function payoff(options: string[], correct: number, dir: Direction = 'longest'): number {
  const lengths = options.map(readLength);
  const end = dir === 'longest' ? Math.max(...lengths) : Math.min(...lengths);
  const winners = lengths.filter((n) => n === end).length;
  return lengths[correct] === end ? 1 / winners : 0;
}

/**
 * Where the correct answer sits in the length order, as a fraction.
 *
 * 0 = the shortest option, 1 = the longest, 0.5 = squarely mid-pack. Ties take
 * the average of the ranks they span, so four options of equal length all read
 * 0.5 rather than the first one read 0 — an author who makes every option the
 * same length has removed the tell, not maximised it.
 */
function lengthRank(options: string[], correct: number): number {
  if (options.length < 2) return RANK_CENTRE;
  const lengths = options.map(readLength);
  const mine = lengths[correct];
  const shorter = lengths.filter((n) => n < mine).length;
  const same = lengths.filter((n) => n === mine).length;
  return (shorter + (same - 1) / 2) / (options.length - 1);
}

type Side = { payoff: number; strictly: number; tied: number };
type Tally = { questions: number; rank: number } & Record<Direction, Side>;
const emptySide = (): Side => ({ payoff: 0, strictly: 0, tied: 0 });
const empty = (): Tally => ({
  questions: 0,
  rank: 0,
  longest: emptySide(),
  shortest: emptySide(),
});

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
      const t = tally[lang];
      t.questions += 1;
      t.rank += lengthRank(options, quiz.correct);
      for (const dir of DIRECTIONS) {
        const end = dir === 'longest' ? Math.max(...lengths) : Math.min(...lengths);
        const winners = lengths.filter((n) => n === end).length;
        const side = t[dir];
        side.payoff += payoff(options, quiz.correct, dir);
        if (lengths[quiz.correct] === end) {
          if (winners === 1) side.strictly += 1;
          else side.tied += 1;
        }
      }
    }
  }
  perCourse.set(slug, tally);
  for (const lang of LANGS) {
    overall[lang].questions += tally[lang].questions;
    overall[lang].rank += tally[lang].rank;
    for (const dir of DIRECTIONS) {
      overall[lang][dir].payoff += tally[lang][dir].payoff;
      overall[lang][dir].strictly += tally[lang][dir].strictly;
      overall[lang][dir].tied += tally[lang][dir].tied;
    }
  }
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const rate = (t: Tally, dir: Direction) => (t.questions === 0 ? 0 : t[dir].payoff / t.questions);
const meanRank = (t: Tally) => (t.questions === 0 ? RANK_CENTRE : t.rank / t.questions);
/** The worse of the two strategies to defend against — a course is as weak as its best tell. */
const worst = (t: Tally) => Math.max(rate(t, 'longest'), rate(t, 'shortest'));

console.log(
  `\n${slugs.length} courses, ${overall.ar.questions} marked questions, measured in ${LANGS.length} languages\n`,
);

console.log('--- per course: what "always pick the longest / the shortest option" scores ---');
console.log(
  `    ${'course'.padEnd(34)} ${'ar longest'.padEnd(16)} ${'ar shortest'.padEnd(16)} ` +
    `${'en longest'.padEnd(16)} ${'en shortest'.padEnd(16)} rank ar / en`,
);
for (const slug of slugs) {
  const t = perCourse.get(slug)!;
  const cell = (lang: Locale, dir: Direction) => {
    const x = t[lang][dir];
    return `${pct(rate(t[lang], dir)).padStart(6)} (${x.strictly}${x.tied ? `+${x.tied}` : ''}/${t[lang].questions})`;
  };
  const ranks = `${meanRank(t.ar).toFixed(2)} / ${meanRank(t.en).toFixed(2)}`;
  console.log(
    `    ${slug.padEnd(34)} ${cell('ar', 'longest').padEnd(16)} ${cell('ar', 'shortest').padEnd(16)} ` +
      `${cell('en', 'longest').padEnd(16)} ${cell('en', 'shortest').padEnd(16)} ${ranks}`,
  );
}

console.log('\n--- overall, per language ---');
for (const lang of LANGS) {
  const t = overall[lang];
  for (const dir of DIRECTIONS) {
    console.log(
      `    ${lang}: picking the ${dir.padEnd(8)} scores ${pct(rate(t, dir)).padStart(6)} over ${t.questions} questions  ` +
        `(${t[dir].strictly} strictly ${dir}, ${t[dir].tied} tied)`,
    );
  }
  console.log(`    ${lang}: mean normalised length-rank of the correct answer ${meanRank(t).toFixed(3)}`);
}

console.log('\n--- the paper does not answer to a ruler, in either direction ---');
for (const lang of LANGS) {
  const t = overall[lang];
  for (const dir of DIRECTIONS) {
    check(
      `${lang}: picking the ${dir} option scores below ${pct(OVERALL_MAX)}`,
      rate(t, dir) < OVERALL_MAX,
      `${pct(rate(t, dir))} over ${t.questions} questions`,
    );
  }
}

console.log('\n--- and no single course is exploitable on its own, in either direction ---');
for (const lang of LANGS) {
  for (const dir of DIRECTIONS) {
    const bad = slugs.filter((slug) => {
      const t = perCourse.get(slug)![lang];
      return t.questions >= PER_COURSE_MIN_QUESTIONS && rate(t, dir) >= PER_COURSE_MAX;
    });
    check(
      `${lang}: no course of ${PER_COURSE_MIN_QUESTIONS}+ questions scores ${pct(PER_COURSE_MAX)} or more on ${dir}`,
      bad.length === 0,
      bad.length
        ? bad.map((s) => `${s} ${pct(rate(perCourse.get(s)![lang], dir))}`).join(', ')
        : `${slugs.filter((s) => perCourse.get(s)!.ar.questions >= PER_COURSE_MIN_QUESTIONS).length} courses large enough to judge`,
    );
  }
}

/*
 * The single invariant, and the one the two ceilings above cannot express:
 * length must carry no usable information about which option is the answer.
 * A paper can pass both directional ceilings and still be readable — put every
 * correct answer second-longest of four and neither strategy ever pays, while
 * a learner who has spotted it never misses. The rank sees that; the payoffs
 * cannot.
 */
console.log('\n--- and length carries no information either way ---');
for (const lang of LANGS) {
  const r = meanRank(overall[lang]);
  check(
    `${lang}: mean length-rank of the correct answer is ${RANK_CENTRE} ± ${OVERALL_RANK_TOLERANCE}`,
    Math.abs(r - RANK_CENTRE) <= OVERALL_RANK_TOLERANCE,
    `${r.toFixed(3)} over ${overall[lang].questions} questions`,
  );
}
for (const lang of LANGS) {
  const bad = slugs.filter((slug) => {
    const t = perCourse.get(slug)![lang];
    return (
      t.questions >= PER_COURSE_MIN_QUESTIONS &&
      Math.abs(meanRank(t) - RANK_CENTRE) > PER_COURSE_RANK_TOLERANCE
    );
  });
  check(
    `${lang}: no course of ${PER_COURSE_MIN_QUESTIONS}+ questions sits outside ${RANK_CENTRE} ± ${PER_COURSE_RANK_TOLERANCE}`,
    bad.length === 0,
    bad.length
      ? bad.map((s) => `${s} ${meanRank(perCourse.get(s)![lang]).toFixed(2)}`).join(', ')
      : `${slugs.filter((s) => perCourse.get(s)!.ar.questions >= PER_COURSE_MIN_QUESTIONS).length} courses large enough to judge`,
  );
}

/*
 * A control, and the reason this file is not three green lines that prove
 * nothing: the measurement must be able to see the defect it was written for.
 * A synthetic question whose correct answer is plainly the longest has to
 * score 1 on the longest strategy and 0 on the shortest; one whose correct
 * answer is plainly the shortest has to do the reverse. If either drifts,
 * every figure above is decoration.
 *
 * The mirrored controls are not ceremony. The shortest-side measurement is new
 * and untested by history, so it is the one most likely to be silently wrong —
 * and a silently-wrong mirror reports 0.0% on every course, which reads
 * exactly like a paper with no defect in it.
 */
const LONG = 'تبلغ المسؤول ثم توثّق ما جرى كتابةً في نفس اليوم';
console.log('\n--- the measurement itself still detects the tell ---');
check(
  'a question whose correct answer is plainly the longest scores 1',
  payoff(['نعم', 'لا', LONG, 'ربما'], 2, 'longest') === 1,
);
check(
  'one whose correct answer is the shortest scores 0',
  payoff([LONG, 'لا تفعل شيئاً أبداً', 'نعم', 'ربما'], 2, 'longest') === 0,
);
check(
  'and a correct answer tied with one other longest scores a half',
  payoff(['aaaa', 'bbbb', 'cc', 'd'], 0, 'longest') === 0.5,
);

console.log('\n--- and it detects the mirror of the tell ---');
check(
  'a question whose correct answer is plainly the shortest scores 1 on shortest',
  payoff([LONG, 'لا تفعل شيئاً أبداً', 'نعم', 'ربما'], 2, 'shortest') === 1,
);
check(
  'one whose correct answer is plainly the longest scores 0 on shortest',
  payoff(['نعم', 'لا', LONG, 'ربما'], 2, 'shortest') === 0,
);
check(
  'and a correct answer tied with one other shortest scores a half on shortest',
  payoff(['aaaa', 'bbbb', 'cc', 'dd'], 2, 'shortest') === 0.5,
);

console.log('\n--- and the rank puts those three where they belong ---');
check('plainly longest ranks 1', lengthRank(['نعم', 'لا', LONG, 'ربما'], 2) === 1);
check('plainly shortest ranks 0', lengthRank([LONG, 'لا تفعل شيئاً أبداً', 'نعم', 'ربما'], 2) === 0);
check('four options of equal length rank 0.5', lengthRank(['aa', 'bb', 'cc', 'dd'], 0) === 0.5);
check(
  'and mid-pack — one distractor longer, one shorter — ranks between',
  Math.abs(lengthRank(['a', 'bb', 'ccc', 'dddd'], 1) - 1 / 3) < 1e-9,
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
