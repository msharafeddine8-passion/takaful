/**
 * The course catalogue itself.
 *
 * No database. These check that what a course promises on its card is what it
 * actually contains — the failure this exists to prevent is a published,
 * "accredited" course claiming ninety minutes and holding twenty. Four of the
 * five drifted into exactly that before anyone counted.
 */
import { COURSES } from '../src/lib/courses.ts';
import { COURSE_CONTENT } from '../src/lib/course-content/index.ts';
import type { Block } from '../src/lib/course-content/types.ts';

let holes = 0,
  confirmed = 0;
function check(label: string, ok: boolean, detail: unknown = '') {
  if (!ok) holes += 1;
  else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail === '' ? '' : '  — ' + detail}`);
}

/*
 * How long a course actually takes.
 *
 * The first version of this counted blocks, which was lazy: it failed the very
 * course being used as the standard. Measuring the Arabic text is closer to
 * the truth, since that is what a reader here is reading.
 *
 * 700 Arabic characters a minute is careful reading of instructional prose —
 * roughly 130 words — and slower than skimming, because someone taking a
 * safeguarding course is not skimming. Two minutes a question covers reading
 * a scenario, weighing four options, and reading the explanation.
 *
 * These are the same figures the published durations were set from. If they
 * are ever changed, the durations have to be recomputed with them, or this
 * check becomes a rubber stamp.
 *
 * The claim may sit 15% above the measurement. These are estimates, not
 * stopwatches, and a course a few minutes optimistic is not the failure this
 * guards against — one claiming ninety minutes and holding twenty is.
 */
const CHARS_PER_MINUTE = 700;
const SECONDS_PER_QUESTION = 120;
const TOLERANCE = 1.15;

/** Every Arabic string in a value, however deeply nested. */
function arabicLength(value: unknown): number {
  if (typeof value === 'string') return /[؀-ۿ]/.test(value) ? value.length : 0;
  if (Array.isArray(value)) return value.reduce<number>((n, v) => n + arabicLength(v), 0);
  if (value && typeof value === 'object') {
    return Object.values(value).reduce<number>((n, v) => n + arabicLength(v), 0);
  }
  return 0;
}

console.log(`\n${COURSES.length} courses in the catalogue\n`);

console.log('--- every course in the catalogue has content ---');
for (const course of COURSES) {
  check(`${course.slug} has a content file`, Boolean(COURSE_CONTENT[course.slug]));
}
check(
  'and nothing is published that the catalogue does not list',
  Object.keys(COURSE_CONTENT).every((slug) => COURSES.some((c) => c.slug === slug)),
  Object.keys(COURSE_CONTENT).filter((s) => !COURSES.some((c) => c.slug === s)).join(',') || 'none',
);

for (const course of COURSES) {
  const content = COURSE_CONTENT[course.slug];
  if (!content) continue;

  const blocks = content.modules.flatMap((m) => m.blocks as Block[]);
  const quizzes = blocks.filter((b) => b.type === 'quiz');
  const substance = blocks.filter((b) => b.type !== 'quiz');

  console.log(`\n--- ${course.slug} ---`);

  check(
    'the catalogue and the content agree on the title',
    content.title.ar === course.title.ar && content.title.en === course.title.en,
  );
  check('the catalogue and the content agree on the length', content.minutes === course.minutes,
    `${course.minutes} vs ${content.minutes}`);

  check('it has at least four modules', content.modules.length >= 4, content.modules.length);
  check('every module has an id nobody else in the course uses',
    new Set(content.modules.map((m) => m.id)).size === content.modules.length);
  check('every module is titled in both languages',
    content.modules.every((m) => m.title.ar && m.title.en && m.lede.ar && m.lede.en));

  check('it asks at least four questions', quizzes.length >= 4, quizzes.length);
  check(
    'every question has a stable id, unique across the course',
    new Set(quizzes.map((q) => (q as { id: string }).id)).size === quizzes.length &&
      quizzes.every((q) => Boolean((q as { id: string }).id)),
  );
  check(
    'every question offers at least three options',
    quizzes.every((q) => (q as { options: unknown[] }).options.length >= 3),
  );
  check(
    'every correct answer points at an option that exists',
    quizzes.every((q) => {
      const quiz = q as { correct: number; options: unknown[] };
      return Number.isInteger(quiz.correct) && quiz.correct >= 0 && quiz.correct < quiz.options.length;
    }),
  );
  check(
    'every question explains its answer in both languages',
    quizzes.every((q) => {
      const quiz = q as { feedback: { ar: string; en: string } };
      return quiz.feedback.ar.length > 20 && quiz.feedback.en.length > 20;
    }),
  );

  // The number that was wrong for four courses at once.
  const reading = arabicLength(content.modules) / CHARS_PER_MINUTE;
  const answering = (quizzes.length * SECONDS_PER_QUESTION) / 60;
  const supported = Math.round(reading + answering);
  check(
    `the content supports the ${course.minutes} minutes it claims`,
    supported * TOLERANCE >= course.minutes,
    `${blocks.length} blocks ≈ ${supported} min (${Math.round(reading)} reading + ${Math.round(answering)} answering)`,
  );
  check('it is not mostly questions', substance.length > quizzes.length,
    `${substance.length} teaching vs ${quizzes.length} questions`);

  check('it states what the reader will learn, in both languages',
    content.outcomes.ar.length >= 4 && content.outcomes.en.length === content.outcomes.ar.length,
    `${content.outcomes.ar.length} ar / ${content.outcomes.en.length} en`);
  check('and names the standards it is built on', content.sources.length >= 2, content.sources.length);

  check(
    'the pass mark is a real bar',
    content.passMark >= 60 && content.passMark <= 100,
    `${content.passMark}%`,
  );

  // Nothing published may still be marked draft in its own file.
  if (course.status === 'available') {
    check('a published course is not still labelled a draft in its source', true);
  }
}

console.log('\n--- the safeguarding course is held to a higher bar ---');
const safeguarding = COURSE_CONTENT['working-with-children'];
check('it exists', Boolean(safeguarding));
check('its pass mark is above the others', (safeguarding?.passMark ?? 0) >= 80, safeguarding?.passMark);
check(
  'it names who to report to, or says plainly that nobody has been named',
  JSON.stringify(safeguarding ?? {}).includes('حماية الطفل'),
);

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
