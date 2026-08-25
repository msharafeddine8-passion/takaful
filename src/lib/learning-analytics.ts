/**
 * Where the academy loses people, worked out from counts and nothing else.
 *
 * The association can see that a course has a low pass rate. What it cannot
 * see — and what decides whether anybody fixes anything — is *which module*
 * they stopped at, *which question* is failed by four learners in five, and
 * whether ninety claimed minutes is anywhere near what ninety minutes of this
 * course actually costs. Those are answers about the course. The platform has
 * always been able to produce them and has never been asked to.
 *
 * ── The one rule this file exists to hold ───────────────────────────────────
 *
 * Every figure here describes a piece of content, never a person. That is easy
 * to say and easy to lose: a question-failure rate over two learners is a
 * statement about those two learners wearing a percentage sign, and one over a
 * single learner is that learner's answer printed on a staff page. So a figure
 * whose cohort is under MIN_COHORT is not rounded, not blurred and not shown —
 * it is withheld, and the page says it was withheld. Silence that looks like
 * an empty cell teaches staff that the page has gaps; silence that says «too
 * few to report» teaches them why.
 *
 * Nothing here takes a user id, and nothing here returns one. There is no
 * field on the way out that a name could land in, so no later edit to the page
 * can print one by accident — the same shape milestones-data.ts uses for dates
 * of birth.
 *
 * Pure and free of `server-only` so probe-learning-analytics can drive it: the
 * suppression rule is the whole ethic of the feature, and a rule that cannot
 * be tested without a database is a rule nobody checks.
 */

/**
 * The smallest cohort a derived figure may be computed over.
 *
 * Three, not two. With two people behind a percentage, a coordinator who knows
 * one of them — and in an association of this size they will — reads the other
 * one off by subtraction: «60% got it wrong» over two answers means exactly one
 * of the two was wrong, and if you know your own trainee passed, you have just
 * learned something about somebody else that nobody offered to tell you.
 */
export const MIN_COHORT = 3;

/**
 * How long a learner must be silent before their stopping point counts as
 * having stopped.
 *
 * Somebody half way through a course last Tuesday is reading it, not stuck.
 * Sixty days is roughly the point past which the association's own follow-up
 * has already happened and not worked.
 */
export const COLD_DAYS = 60;

/**
 * A number the page may print, a number it refuses to print, or nothing to
 * print at all.
 *
 * Three states rather than `number | null`, because «withheld» and «nobody has
 * done this yet» are different facts and a reader who cannot tell them apart
 * will assume the worse of the two about the platform.
 */
export type Figure =
  | { state: 'known'; value: number }
  | { state: 'withheld'; cohort: number }
  | { state: 'empty' };

/**
 * Whether a cohort is too small to say anything about.
 *
 * Zero is deliberately NOT suppressed. «Nobody has opened this course» names
 * nobody, hides nothing, and is the single most useful line on the page for a
 * content manager deciding what to write next. Suppressing it would trade the
 * whole point of the feature for a rule that protects no one.
 */
export function isSuppressed(cohort: number): boolean {
  return cohort > 0 && cohort < MIN_COHORT;
}

/** Wraps a computed value in the decision about whether it may be shown. */
export function figureFor(value: number | null, cohort: number): Figure {
  if (isSuppressed(cohort)) return { state: 'withheld', cohort };
  if (value === null || !Number.isFinite(value)) return { state: 'empty' };
  return { state: 'known', value };
}

/**
 * A share as a whole percentage, or null when there is nothing to divide by.
 *
 * Null rather than 0: a course nobody started has no completion rate, and
 * printing 0% for it puts an untouched course at the bottom of the «worst
 * completion» table above courses that are genuinely failing people.
 *
 * Clamped, because the inputs come from separate aggregates over a table that
 * is written to while the page renders. A pass counted after the starters were
 * counted must not produce 103%.
 */
export function percentageOf(part: number, whole: number): number | null {
  if (whole <= 0) return null;
  return Math.min(100, Math.max(0, Math.round((part / whole) * 100)));
}

/* ------------------------------------------------------------ per course */

/**
 * The raw counts one course produces, all of them counts of people rather than
 * of rows except where the name says otherwise.
 *
 * Passes recognised from prior learning are excluded upstream and deliberately.
 * Somebody the association credited for a first-aid course they sat elsewhere
 * read none of this content and answered none of these questions; counting
 * them as a completion would flatter every course that has ever been
 * recognised, and counting them as a starter who never finished would slander
 * it. Neither is a reading of the course.
 */
export type CourseTotals = {
  slug: string;
  /** Opened it: read a module, or started a paper. */
  started: number;
  /** Submitted at least one paper, whatever the result. */
  finished: number;
  /** Passed by sitting a paper here. */
  passed: number;
  /** Papers submitted by the people who eventually passed. */
  attemptsByPassers: number;
};

export type CourseCompletion = {
  slug: string;
  /** Always shown. A head count of who opened something identifies nobody. */
  started: number;
  finished: Figure;
  passed: Figure;
  /** Of those who opened it, the share that passed. */
  completion: Figure;
  /** Of those who opened it, the share that got as far as submitting. */
  reachedThePaper: Figure;
  /** Mean papers sat per person who passed, to one decimal. */
  attemptsToPass: Figure;
};

/**
 * Everything a course row on the page shows, with the suppression already
 * applied.
 *
 * Applied here rather than in the page for the obvious reason and one less
 * obvious one: the page renders these figures in three places — the summary
 * table, the course card and the worst-completion ranking — and a rule
 * enforced at the point of rendering is a rule enforced two times out of
 * three.
 */
export function completionOf(t: CourseTotals): CourseCompletion {
  const cohort = t.started;
  return {
    slug: t.slug,
    started: t.started,
    finished: figureFor(t.started === 0 ? null : t.finished, cohort),
    passed: figureFor(t.started === 0 ? null : t.passed, cohort),
    completion: figureFor(percentageOf(t.passed, t.started), cohort),
    reachedThePaper: figureFor(percentageOf(t.finished, t.started), cohort),
    /*
     * Its own cohort: the people who passed, not the people who started. A
     * course fifty people opened and two people passed would otherwise report
     * an average built from those two under cover of the larger number.
     *
     * Floored at 1. A mean below one paper per pass would mean somebody passed
     * without sitting anything, which is a recognised pass — excluded upstream
     * — or a bug, and neither should print as «0.6 attempts».
     */
    attemptsToPass: figureFor(
      t.passed === 0 ? null : Math.max(1, Math.round((t.attemptsByPassers / t.passed) * 10) / 10),
      t.passed,
    ),
  };
}

/* ------------------------------------------------------------ per module */

/** One rung of a course, in the order the course presents it. */
export type ModuleStep = {
  moduleId: string;
  /** People who finished reading this module. */
  reached: number;
  /** People whose furthest module is this one, who never passed, and who have gone quiet. */
  strandedHere: number;
};

export type DropOff = {
  /** The module people were reading when the ladder narrowed. */
  moduleId: string;
  /** The module they did not get to. */
  nextModuleId: string;
  lost: number;
  /** Of those who reached `moduleId`, the share that went no further. */
  share: number | null;
  /**
   * Whether it may be named on the page. A cliff one person fell off is one
   * person's Tuesday afternoon, not a finding about the course.
   */
  reportable: boolean;
};

/**
 * The steepest fall between two consecutive modules.
 *
 * Consecutive rather than «furthest from the first»: a course loses people all
 * the way down and a cumulative figure always names the last module, which is
 * true and useless. What an author can act on is the one place where the
 * ladder narrows sharply, and that is a difference between neighbours.
 *
 * The largest fall in *people* wins rather than the largest fall in share.
 * Late in a long course the remaining cohort is small enough that losing two
 * of three reads as 67% and is not the association's problem; losing eleven of
 * forty at module two is.
 */
export function steepestDropOff(steps: ModuleStep[]): DropOff | null {
  if (steps.length < 2) return null;

  let worst: DropOff | null = null;
  for (let i = 0; i < steps.length - 1; i += 1) {
    const from = steps[i];
    const to = steps[i + 1];
    const lost = from.reached - to.reached;
    if (lost <= 0) continue;
    // Strictly greater, so a tie keeps the earlier module: everybody standing
    // at the later one had to get past the earlier one first, and fixing the
    // first narrowing is the only fix that can help both.
    if (worst && lost <= worst.lost) continue;
    worst = {
      moduleId: from.moduleId,
      nextModuleId: to.moduleId,
      lost,
      share: percentageOf(lost, from.reached),
      reportable: lost >= MIN_COHORT,
    };
  }
  return worst;
}

/**
 * One stopping point, and whether it may be named.
 *
 * The cohort a stranded count is judged on is the count itself: «one person
 * stopped at module six» is one person, and a coordinator holding that line
 * needs two clicks elsewhere to work out who. Nothing else on this page can
 * make that number safe, so nothing else is consulted.
 */
export function strandedAt(count: number): Figure {
  return figureFor(count, count);
}

/**
 * How many people are sitting part-way through this course and are not coming
 * back, and whether that total may be shown.
 */
export function strandedIn(steps: ModuleStep[]): Figure {
  return strandedAt(steps.reduce((sum, s) => sum + s.strandedHere, 0));
}

/* --------------------------------------------------------- per question */

/**
 * What a question did, counted over answers rather than people.
 *
 * `answers` counts every recorded answer including retakes, because a question
 * that keeps being got wrong on the second sitting is a differently broken
 * question from one that is got wrong once and then understood. `answeredBy`
 * counts people, and is the only figure suppression is decided on.
 */
export type QuestionTally = {
  questionId: string;
  moduleId: string;
  answeredBy: number;
  answers: number;
  wrong: number;
};

export type QuestionStanding = {
  questionId: string;
  moduleId: string;
  answeredBy: number;
  failure: Figure;
};

export function questionStandingOf(t: QuestionTally): QuestionStanding {
  return {
    questionId: t.questionId,
    moduleId: t.moduleId,
    answeredBy: t.answeredBy,
    failure: figureFor(percentageOf(t.wrong, t.answers), t.answeredBy),
  };
}

/**
 * The questions most people get wrong, hardest first.
 *
 * Withheld ones are dropped rather than sorted to the bottom. A row reading
 * «question 4 — withheld» in a list titled «most failed» tells a reader that
 * question 4 is among the most failed, which is the fact suppression was
 * supposed to withhold. If it cannot be ranked it does not appear in the
 * ranking; the course card says separately how many questions were too thinly
 * answered to judge.
 */
export function hardestQuestions(tallies: QuestionTally[], limit = 5): QuestionStanding[] {
  return tallies
    .map(questionStandingOf)
    .filter((q): q is QuestionStanding & { failure: { state: 'known'; value: number } } =>
      q.failure.state === 'known' && q.failure.value > 0)
    .sort((a, b) =>
      b.failure.value - a.failure.value
      || b.answeredBy - a.answeredBy
      // Last resort so the order does not wander between two identical rows.
      || a.questionId.localeCompare(b.questionId))
    .slice(0, limit);
}

/** How many of a course's questions could not be judged, for the honest footnote. */
export function tooThinToJudge(tallies: QuestionTally[]): number {
  return tallies.filter((t) => isSuppressed(t.answeredBy)).length;
}

/* -------------------------------------------------------------- the clock */

export type Verdict = 'as-claimed' | 'slower' | 'faster' | 'unknown';

export type Pace = {
  /** What the course card promises, in minutes. */
  claimed: number;
  /** Median elapsed minutes from opening it to passing it, for those who did both in a day. */
  median: Figure;
  verdict: Verdict;
};

/**
 * A quarter either way is the same course.
 *
 * Tighter than this and every course on the platform reports as mistimed,
 * which is a page nobody reads twice. The claim on the card is a reading
 * estimate, not a stopwatch.
 */
const TOLERANCE = 0.25;

/**
 * What the course costs against what it promises.
 *
 * The median is over learners who opened and passed within one day — measured
 * upstream — because elapsed time is all this platform records and elapsed
 * time over somebody who left the tab open for a fortnight is not a duration.
 * A course read across three evenings is a normal way to take a course and is
 * counted separately as context, not as a fault.
 */
export function paceOf(medianMinutes: number | null, claimed: number, cohort: number): Pace {
  const median = figureFor(medianMinutes, cohort);
  if (median.state !== 'known' || claimed <= 0) {
    return { claimed, median, verdict: 'unknown' };
  }
  const ratio = median.value / claimed;
  const verdict: Verdict =
    ratio > 1 + TOLERANCE ? 'slower' : ratio < 1 - TOLERANCE ? 'faster' : 'as-claimed';
  return { claimed, median, verdict };
}

/* ----------------------------------------------------- across the academy */

/**
 * The courses failing the most people, worst first.
 *
 * Only rows whose completion may be shown at all. A course two people opened
 * and neither passed is a 0% that would top this table every time and mean
 * nothing — and would point staff at the two people rather than at the course.
 */
export function worstCompletion(rows: CourseCompletion[], limit = 8): CourseCompletion[] {
  return rows
    .filter((r) => r.completion.state === 'known')
    .sort((a, b) => {
      const av = a.completion.state === 'known' ? a.completion.value : 0;
      const bv = b.completion.state === 'known' ? b.completion.value : 0;
      // The bigger cohort breaks the tie: the same 40% over thirty learners is
      // a firmer finding than over three, and should be read first.
      return av - bv || b.started - a.started || a.slug.localeCompare(b.slug);
    })
    .slice(0, limit);
}

export type CatalogueEntry = {
  slug: string;
  started: number;
  /** Whether any module has been written for it yet. */
  hasContent: boolean;
  /** The catalogue status: draft, review, published, archived. */
  status: string;
};

/**
 * Courses nobody has opened, split by whose problem that is.
 *
 * A published course with content that nobody has touched is a question for
 * whoever decides what volunteers are pointed at. A course with no modules
 * written cannot be attempted by anyone and is a question for whoever is
 * writing it. Reporting them in one list would put forty unwritten drafts in
 * front of the two real findings and bury both.
 *
 * Archived courses are in neither list: nobody opening a course that was
 * deliberately withdrawn is the system working.
 */
export function neverAttempted(entries: CatalogueEntry[]): {
  unopened: CatalogueEntry[];
  unwritten: CatalogueEntry[];
} {
  const idle = entries.filter((e) => e.started === 0 && e.status !== 'archived');
  return {
    unopened: idle.filter((e) => e.hasContent),
    unwritten: idle.filter((e) => !e.hasContent),
  };
}
