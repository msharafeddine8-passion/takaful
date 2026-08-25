import 'server-only';
import { query } from './db';
import { questionsIn } from './academy';
import { COURSE_CONTENT } from './course-content';
import {
  completionOf, paceOf, steepestDropOff, strandedAt, strandedIn, hardestQuestions,
  tooThinToJudge, neverAttempted, worstCompletion, COLD_DAYS,
  type CourseCompletion, type CatalogueEntry, type DropOff, type Figure,
  type ModuleStep, type Pace, type QuestionStanding, type QuestionTally,
} from './learning-analytics';

/**
 * The reads behind the learning analytics page.
 *
 * Two rules, both inherited from analytics.ts and both load-bearing here:
 * everything is aggregated in SQL, and every count is cast to INTEGER because
 * count() is bigint and the driver hands bigint back as a string.
 *
 * A third rule belongs to this module alone. **No query below selects a user
 * id into a returned row.** User ids appear inside CTEs, because working out
 * how many people reached module four requires knowing which people reached
 * module four — but the outermost SELECT of every function here returns a
 * course slug, a module slug, a question id and counts. There is no field on
 * the way out that a person could travel in, which is a stronger guarantee
 * than remembering not to render one.
 *
 * ── Recognised passes are not readings of a course ──────────────────────────
 *
 * `source = 'recognised'` marks a pass the association granted for learning
 * done elsewhere: no paper was sat, no module was opened, no question was
 * answered. Counting one as a completion flatters the course; counting the
 * person as a starter who never finished slanders it. They are excluded from
 * every figure about how the content performs, and included in exactly one
 * place — deciding whether somebody part-way through is stranded, because
 * a person who has been credited for the course is not stuck in it.
 *
 * ── No date arithmetic in JavaScript ────────────────────────────────────────
 *
 * The session on the production database runs GMT and the association is in
 * Beirut. Everything below is either a duration — which has no timezone — or
 * an interval compared against now() inside Postgres. Nothing here builds a
 * Date to compare two calendar days, which is the trap src/lib/when.ts exists
 * to describe.
 *
 * No backticks anywhere in the SQL, including in the comments inside it: these
 * are template literals, and a backtick in a SQL comment ends the string and
 * stops the file parsing. That has happened in this repository before.
 */

/* ------------------------------------------------------------- the catalogue */

type CatalogueRow = {
  slug: string;
  kind: string;
  status: string;
  minutes: number;
  title_ar: string;
  title_en: string;
  level_number: number | null;
  module_count: number;
};

/**
 * Every course the association has defined, whether or not anybody has touched
 * it. Read from the `courses` table rather than from the TypeScript catalogue
 * because a programme manager can edit a title or retire a course from
 * /staff/programme, and this page has to agree with that one.
 */
async function catalogue(): Promise<CatalogueRow[]> {
  return query<CatalogueRow>(`
    SELECT c.slug, c.kind, c.status, c.minutes, c.title_ar, c.title_en,
           l.number AS level_number,
           (SELECT count(*) FROM modules m WHERE m.course_id = c.id)::INTEGER AS module_count
      FROM courses c
      LEFT JOIN program_levels l ON l.id = c.level_id
     ORDER BY l.number NULLS LAST, c.sort_order
  `);
}

type ModuleRow = {
  course_slug: string;
  module_id: string;
  sort_order: number;
  title_ar: string;
  title_en: string;
};

/**
 * The rungs of every course, in the order a learner meets them.
 *
 * Read from the `modules` table when it has rows for the course and from the
 * TypeScript content otherwise, and today it is always otherwise: migration
 * 017 built the table and the seed that fills it has never been run, so
 * `modules` is empty while `course_module_progress` holds a hundred and
 * thirty-one real reads keyed on ids that only COURSE_CONTENT defines.
 *
 * Reading the database alone would therefore draw no ladder at all and report
 * every course as having no modules — a page confidently saying nothing.
 * Reading TypeScript alone would ignore a programme manager who has edited a
 * module title from /staff/programme, on the day that seed does run. So the
 * database wins where it has an answer, and this is the fallback rather than
 * the other way round.
 *
 * Either way the ids are the same ids: `modules.slug` and the content's
 * `module.id` are both what markModuleRead validates a read against, and
 * migration 017 states they are never regenerated.
 */
async function moduleOrder(): Promise<ModuleRow[]> {
  const rows = await query<ModuleRow>(`
    SELECT c.slug AS course_slug, m.slug AS module_id, m.sort_order,
           m.title_ar, m.title_en
      FROM modules m
      JOIN courses c ON c.id = m.course_id
     ORDER BY c.slug, m.sort_order, m.slug
  `);

  const fromDb = new Set(rows.map((r) => r.course_slug));
  const authored: ModuleRow[] = [];
  for (const content of Object.values(COURSE_CONTENT)) {
    if (fromDb.has(content.slug)) continue;
    content.modules.forEach((m, i) => {
      authored.push({
        course_slug: content.slug,
        module_id: m.id,
        sort_order: i,
        title_ar: m.title.ar,
        title_en: m.title.en,
      });
    });
  }
  return [...rows, ...authored];
}

/* ------------------------------------------------------------ the counting */

type TotalsRow = {
  course_slug: string;
  started: number;
  finished: number;
  passed: number;
  attempts_by_passers: number;
};

/**
 * Per course: how many opened it, how many sat the paper, how many passed, and
 * how many papers the passers needed.
 *
 * A start is opening the course at all — reading one module counts. Counting
 * only people who began a paper would hide the loss this page exists to find:
 * somebody who read three modules and never reached the questions did start
 * the course, and their leaving is the finding.
 *
 * Papers are counted up to and including the passing one. Sitting a course
 * again afterwards, which a volunteer may do to revise, is not evidence that
 * passing it was hard.
 */
async function courseTotals(): Promise<TotalsRow[]> {
  return query<TotalsRow>(`
    WITH sat AS (
      SELECT user_id, course_slug, started_at, submitted_at, passed
        FROM course_attempts
       WHERE source <> 'recognised'
    ), per_person AS (
      SELECT user_id, course_slug,
             bool_or(submitted_at IS NOT NULL)       AS finished,
             COALESCE(bool_or(passed), false)        AS passed,
             MIN(submitted_at) FILTER (WHERE passed) AS passed_at
        FROM sat
       GROUP BY user_id, course_slug
    ), tries AS (
      SELECT s.user_id, s.course_slug, count(*)::INTEGER AS papers
        FROM sat s
        JOIN per_person p ON p.user_id = s.user_id AND p.course_slug = s.course_slug
       WHERE p.passed_at IS NOT NULL
         AND s.submitted_at IS NOT NULL
         AND s.submitted_at <= p.passed_at
       GROUP BY s.user_id, s.course_slug
    ), opened AS (
      SELECT user_id, course_slug FROM per_person
      UNION
      SELECT DISTINCT user_id, course_slug FROM course_module_progress
    )
    SELECT o.course_slug,
           count(*)::INTEGER                                     AS started,
           (count(*) FILTER (WHERE p.finished))::INTEGER         AS finished,
           (count(*) FILTER (WHERE p.passed))::INTEGER           AS passed,
           COALESCE(SUM(t.papers), 0)::INTEGER                   AS attempts_by_passers
      FROM opened o
      LEFT JOIN per_person p ON p.user_id = o.user_id AND p.course_slug = o.course_slug
      LEFT JOIN tries t      ON t.user_id = o.user_id AND t.course_slug = o.course_slug
     GROUP BY o.course_slug
  `);
}

type ReachRow = {
  course_slug: string;
  module_id: string;
  reached: number;
  stranded: number;
};

/**
 * Per module: how many people finished reading it, and how many stopped there
 * for good.
 *
 * «For good» is three conditions together, and dropping any one of them turns
 * this figure into a slander: their furthest module is this one, they never
 * passed the course, and nothing has been heard from them on it in COLD_DAYS.
 * Somebody who read module three last Tuesday is reading the course, not stuck
 * in it, and a page that calls them abandoned would have staff chasing people
 * who are getting on with it.
 *
 * The pass test here does NOT exclude recognised passes — see the header. A
 * volunteer credited for prior learning half way through reading the course is
 * finished with it, whatever the ledger says about how.
 */
async function moduleReach(): Promise<ReachRow[]> {
  return query<ReachRow>(
    `WITH furthest AS (
       SELECT DISTINCT ON (user_id, course_slug)
              user_id, course_slug, module_id
         FROM course_module_progress
        ORDER BY user_id, course_slug, completed_at DESC, module_id
     ), last_touch AS (
       SELECT user_id, course_slug, MAX(at) AS at FROM (
         SELECT user_id, course_slug, completed_at AS at FROM course_module_progress
         UNION ALL
         SELECT user_id, course_slug, COALESCE(submitted_at, started_at) FROM course_attempts
       ) x GROUP BY user_id, course_slug
     ), stopped AS (
       SELECT f.course_slug, f.module_id, count(*)::INTEGER AS stranded
         FROM furthest f
         JOIN last_touch lt ON lt.user_id = f.user_id AND lt.course_slug = f.course_slug
        WHERE lt.at < now() - ($1 || ' days')::INTERVAL
          AND NOT EXISTS (
            SELECT 1 FROM course_attempts a
             WHERE a.user_id = f.user_id AND a.course_slug = f.course_slug AND a.passed)
        GROUP BY f.course_slug, f.module_id
     )
     SELECT r.course_slug, r.module_id,
            count(DISTINCT r.user_id)::INTEGER AS reached,
            COALESCE(MAX(s.stranded), 0)::INTEGER AS stranded
       FROM course_module_progress r
       LEFT JOIN stopped s ON s.course_slug = r.course_slug AND s.module_id = r.module_id
      GROUP BY r.course_slug, r.module_id`,
    [String(COLD_DAYS)],
  );
}

type ChoiceRow = {
  course_slug: string;
  question_id: string;
  chose: number;
  times: number;
  people: number;
};

/**
 * Which option each question's answers went to, and how many people answered
 * it at all.
 *
 * The verdict is not computed here, because the correct option lives in
 * TypeScript and this page must not be able to disagree with the grader about
 * what «wrong» means. `answers` holds the ORIGINAL option index — the shuffle
 * is a presentation detail, as academy.ts records — so comparing it against
 * `question.correct` is exactly the comparison submitAttempt makes when it
 * decides somebody's score.
 *
 * `people` is carried alongside the per-option counts and is the same number
 * on every row of a question: it is what suppression is decided on, and
 * summing the per-option counts to get it would count one person twice when
 * they answered the same question differently on a retake.
 */
async function choiceTallies(): Promise<ChoiceRow[]> {
  return query<ChoiceRow>(`
    WITH picked AS (
      SELECT a.course_slug, ans.key AS question_id, a.user_id,
             (ans.value #>> '{}')::INTEGER AS chose
        FROM course_attempts a
        CROSS JOIN LATERAL jsonb_each(a.answers) AS ans
       WHERE a.source <> 'recognised'
    ), per_question AS (
      SELECT course_slug, question_id, count(DISTINCT user_id)::INTEGER AS people
        FROM picked
       GROUP BY course_slug, question_id
    )
    SELECT p.course_slug, p.question_id, p.chose,
           count(*)::INTEGER AS times,
           q.people
      FROM picked p
      JOIN per_question q
        ON q.course_slug = p.course_slug AND q.question_id = p.question_id
     GROUP BY p.course_slug, p.question_id, p.chose, q.people
  `);
}

type PaceRow = {
  course_slug: string;
  median_minutes: number | null;
  in_one_day: number;
  passers_timed: number;
};

/**
 * How long the course takes in practice.
 *
 * Elapsed time is all this platform records — there is no time-on-page and
 * there should not be — so the honest measure is narrowed to learners who
 * opened and passed the course within a day. A course read across three
 * evenings is a normal way to take a course; folding that person's 62 hours
 * into a median would produce a number that describes their week rather than
 * the course. They are counted separately, as context.
 */
async function coursePace(): Promise<PaceRow[]> {
  return query<PaceRow>(`
    WITH sat AS (
      SELECT user_id, course_slug, started_at, submitted_at, passed
        FROM course_attempts
       WHERE source <> 'recognised'
    ), passed_at AS (
      SELECT user_id, course_slug, MIN(submitted_at) AS at
        FROM sat WHERE passed
       GROUP BY user_id, course_slug
    ), first_touch AS (
      SELECT user_id, course_slug, MIN(at) AS at FROM (
        SELECT user_id, course_slug, started_at AS at FROM sat
        UNION ALL
        SELECT user_id, course_slug, completed_at FROM course_module_progress
      ) t GROUP BY user_id, course_slug
    ), spans AS (
      SELECT p.course_slug,
             EXTRACT(EPOCH FROM (p.at - f.at)) / 60 AS minutes
        FROM passed_at p
        JOIN first_touch f ON f.user_id = p.user_id AND f.course_slug = p.course_slug
       WHERE p.at > f.at
    )
    SELECT course_slug,
           percentile_cont(0.5) WITHIN GROUP (ORDER BY minutes)
             FILTER (WHERE minutes <= 1440)                  AS median_minutes,
           (count(*) FILTER (WHERE minutes <= 1440))::INTEGER AS in_one_day,
           count(*)::INTEGER                                  AS passers_timed
      FROM spans
     GROUP BY course_slug
  `);
}

/* ------------------------------------------------------------ the assembly */

/** One rung of a course as the page draws it. */
export type ModuleLine = ModuleStep & {
  title: { ar: string; en: string };
  /** Shown only when it clears the floor — one person stopping is one person. */
  stranded: Figure;
};

/** A question, with the words a reader needs to recognise which one it is. */
export type QuestionLine = QuestionStanding & {
  label: { ar: string; en: string };
  question: { ar: string; en: string };
};

export type CourseReport = {
  slug: string;
  title: { ar: string; en: string };
  status: string;
  level: number | null;
  totals: CourseCompletion;
  modules: ModuleLine[];
  dropOff: DropOff | null;
  stranded: Figure;
  hardest: QuestionLine[];
  /** Questions too thinly answered to judge — the honest footnote under the list. */
  unjudged: number;
  pace: Pace;
  /** Passers who took more than a day over it. Context, never a fault. */
  spreadOut: number;
};

export type AcademyReport = {
  courses: CourseReport[];
  worst: CourseCompletion[];
  unopened: CatalogueEntry[];
  unwritten: CatalogueEntry[];
  /** Courses with any activity at all, for the summary line. */
  touched: number;
};

/**
 * Five aggregates, assembled once.
 *
 * One pass over the whole academy rather than a query per course: forty-one
 * courses is forty-one round trips, and a page that gets slower every time
 * somebody writes a course is a page that stops being opened.
 */
export async function academyReport(): Promise<AcademyReport> {
  const [courses, modules, totals, reach, choices, pace] = await Promise.all([
    catalogue(), moduleOrder(), courseTotals(), moduleReach(), choiceTallies(), coursePace(),
  ]);

  const totalsBySlug = new Map(totals.map((t) => [t.course_slug, t]));
  const paceBySlug = new Map(pace.map((p) => [p.course_slug, p]));

  const reachBy = new Map<string, ReachRow>();
  for (const r of reach) reachBy.set(`${r.course_slug} ${r.module_id}`, r);

  const reports: CourseReport[] = [];
  for (const course of courses) {
    const t = totalsBySlug.get(course.slug);
    const counted = {
      slug: course.slug,
      started: t?.started ?? 0,
      finished: t?.finished ?? 0,
      passed: t?.passed ?? 0,
      attemptsByPassers: t?.attempts_by_passers ?? 0,
    };

    const steps: ModuleLine[] = modules
      .filter((m) => m.course_slug === course.slug)
      .map((m) => {
        const row = reachBy.get(`${course.slug} ${m.module_id}`);
        const strandedHere = row?.stranded ?? 0;
        return {
          moduleId: m.module_id,
          reached: row?.reached ?? 0,
          strandedHere,
          title: { ar: m.title_ar, en: m.title_en },
          /*
           * Per-module suppression is decided on that module's own number, not
           * on the course cohort. A course fifty people opened can still have
           * exactly one person stopped at module six, and printing a 1 there
           * points a coordinator at a single learner by name in two clicks.
           */
          stranded: strandedAt(strandedHere),
        };
      });

    const tallies = questionTalliesFor(course.slug, choices);
    const asked = questionsIn(course.slug);
    const hardest: QuestionLine[] = hardestQuestions(tallies).map((standing) => {
      const q = asked.find((a) => a.id === standing.questionId);
      return {
        ...standing,
        label: { ar: q?.label.ar ?? standing.questionId, en: q?.label.en ?? standing.questionId },
        question: { ar: q?.question.ar ?? '', en: q?.question.en ?? '' },
      };
    });

    const p = paceBySlug.get(course.slug);
    reports.push({
      slug: course.slug,
      title: { ar: course.title_ar, en: course.title_en },
      status: course.status,
      level: course.level_number,
      totals: completionOf(counted),
      modules: steps,
      dropOff: steepestDropOff(steps),
      stranded: strandedIn(steps),
      hardest,
      unjudged: tooThinToJudge(tallies),
      pace: paceOf(
        p?.median_minutes === null || p?.median_minutes === undefined
          ? null
          : Math.round(p.median_minutes),
        course.minutes,
        p?.in_one_day ?? 0,
      ),
      spreadOut: (p?.passers_timed ?? 0) - (p?.in_one_day ?? 0),
    });
  }

  const entries: CatalogueEntry[] = courses.map((c) => ({
    slug: c.slug,
    started: totalsBySlug.get(c.slug)?.started ?? 0,
    // Content written in TypeScript but not yet seeded into `modules` still
    // counts as written: the learner can read it either way, and reporting it
    // as unwritten would send an author to write something that exists.
    hasContent: c.module_count > 0 || COURSE_CONTENT[c.slug] !== undefined,
    status: c.status,
  }));
  const idle = neverAttempted(entries);

  return {
    courses: reports,
    worst: worstCompletion(reports.map((r) => r.totals)),
    unopened: idle.unopened,
    unwritten: idle.unwritten,
    touched: reports.filter((r) => r.totals.started > 0).length,
  };
}

/**
 * Per-option counts folded into a per-question verdict.
 *
 * Answers to a question id the content no longer defines are dropped rather
 * than counted wrong. There is nothing to compare them against — the question
 * they belong to was edited out — and calling them failures would report a
 * removed question as the hardest one in the course forever.
 */
function questionTalliesFor(slug: string, choices: ChoiceRow[]): QuestionTally[] {
  const asked = questionsIn(slug);
  if (asked.length === 0) return [];

  const byQuestion = new Map<string, QuestionTally>();
  for (const row of choices) {
    if (row.course_slug !== slug) continue;
    const question = asked.find((a) => a.id === row.question_id);
    if (!question) continue;

    const tally = byQuestion.get(row.question_id) ?? {
      questionId: row.question_id,
      moduleId: question.moduleId,
      answeredBy: row.people,
      answers: 0,
      wrong: 0,
    };
    tally.answers += row.times;
    if (row.chose !== question.correct) tally.wrong += row.times;
    byQuestion.set(row.question_id, tally);
  }
  return [...byQuestion.values()];
}
