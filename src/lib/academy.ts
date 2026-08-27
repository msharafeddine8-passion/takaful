import 'server-only';
import { randomUUID, randomInt } from 'node:crypto';
import { query, queryOne, execute, transaction } from './db';
import { COURSE_CONTENT } from './course-content';
import { COURSES, courseBySlug } from './courses';
import { generateCode } from './certificates';
import { courseFingerprint } from './course-version';
import { prerequisitesMet } from './programme/access';
import type { Locale } from './i18n';

/**
 * The learning side of the academy.
 *
 * Course *content* stays in TypeScript. It is authored, translated and
 * reviewed like code, and a missing translation is a compile error rather
 * than a blank space discovered by a volunteer. Moving it into the database
 * would trade all of that for an editing screen nobody asked for.
 *
 * What belongs in the database is what the content cannot know: who read
 * which module, who answered what, and how many times they tried.
 *
 * The one rule this file exists to enforce: **the answer key never leaves the
 * server.** It used to be handed to the browser so a quiz could show instant
 * feedback, which meant anyone who opened the developer tools could score
 * full marks on a course whose certificate an employer is asked to trust.
 * Answers are checked here, one at a time, and only the verdict goes back.
 */

export type Question = {
  id: string;
  moduleId: string;
  label: Record<Locale, string>;
  question: Record<Locale, string>;
  scenario?: Record<Locale, string>;
  options: Record<Locale, string>[];
  correct: number;
  feedback: Record<Locale, string>;
};

/** Every question in a course, flattened, in authored order. */
export function questionsIn(slug: string): Question[] {
  const course = COURSE_CONTENT[slug];
  if (!course) return [];

  const found: Question[] = [];
  for (const mod of course.modules) {
    for (const block of mod.blocks) {
      if (block.type === 'quiz') {
        found.push({
          id: block.id,
          moduleId: mod.id,
          label: block.label,
          question: block.question,
          scenario: block.scenario,
          options: block.options,
          correct: block.correct,
          feedback: block.feedback,
        });
      }
    }
  }
  return found;
}

export function passMarkFor(slug: string): number {
  return COURSE_CONTENT[slug]?.passMark ?? 70;
}

/**
 * The fingerprint stamped on a new attempt — see lib/course-version.ts.
 *
 * Computed once per course and cached: it is a hash over content that cannot
 * change while the process is running, and 41 courses × every page load is a
 * lot of hashing for an answer that never differs.
 *
 * Null for a course with no content written yet, which is the honest value —
 * there is nothing to fingerprint.
 */
const versionCache = new Map<string, string | null>();
export function versionOf(slug: string): string | null {
  const cached = versionCache.get(slug);
  if (cached !== undefined) return cached;
  const content = COURSE_CONTENT[slug];
  const version = content ? courseFingerprint(content) : null;
  versionCache.set(slug, version);
  return version;
}

export function isCoursePublished(slug: string): boolean {
  return COURSES.find((c) => c.slug === slug)?.status === 'available';
}

/** A Fisher-Yates shuffle over crypto randomness. */
function shuffled<T>(input: readonly T[]): T[] {
  const out = [...input];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type Attempt = {
  id: string;
  user_id: string;
  course_slug: string;
  question_ids: string[];
  /** {questionId: [originalIndex, ...]} in the order the options are shown. */
  option_order: Record<string, number[]>;
  /** {questionId: originalOptionIndex} — what they picked, not what was right. */
  answers: Record<string, number>;
  started_at: Date;
  submitted_at: Date | null;
  score: number | null;
  passed: boolean;
  pass_mark: number | null;
};

const ATTEMPT_COLUMNS = `id, user_id, course_slug, question_ids, option_order,
  answers, started_at, submitted_at, score, passed, pass_mark, content_version`;

export async function openAttemptFor(userId: string, slug: string): Promise<Attempt | null> {
  return queryOne<Attempt>(
    `SELECT ${ATTEMPT_COLUMNS} FROM course_attempts
      WHERE user_id = $1 AND course_slug = $2 AND submitted_at IS NULL`,
    [userId, slug],
  );
}

/**
 * The attempt someone is currently taking, starting one if they have none.
 *
 * The question order and the option order are decided once, here, and stored.
 * Deciding them at render time would mean a reload reshuffles, and a learner
 * who did not like a question could keep reloading until it went away.
 */
export async function startOrResumeAttempt(userId: string, slug: string): Promise<Attempt | null> {
  const existing = await openAttemptFor(userId, slug);
  if (existing) return existing;

  const questions = questionsIn(slug);
  if (questions.length === 0) return null;

  const ids = shuffled(questions.map((q) => q.id));
  const optionOrder: Record<string, number[]> = {};
  for (const q of questions) {
    optionOrder[q.id] = shuffled(q.options.map((_, i) => i));
  }

  try {
    return await queryOne<Attempt>(
      /*
       * The content version is stamped when the attempt opens, not when it is
       * submitted. The paper somebody sat is the one they were shown: if an
       * editor changes the course while their tab is open, the attempt still
       * belongs to the version that produced these question ids and this
       * option order. See lib/course-version.ts.
       */
      `INSERT INTO course_attempts
         (id, user_id, course_slug, question_ids, option_order, pass_mark, content_version)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${ATTEMPT_COLUMNS}`,
      [
        randomUUID(), userId, slug, ids, JSON.stringify(optionOrder), passMarkFor(slug),
        versionOf(slug),
      ],
    );
  } catch (error) {
    // Two tabs opening the same course race for the one-open-attempt index.
    // Losing that race is not an error; the winner's attempt is the attempt.
    if ((error as { code?: string }).code === '23505') return openAttemptFor(userId, slug);
    throw error;
  }
}

export type AnswerVerdict =
  | { ok: true; correct: boolean; feedback: string; already: boolean }
  | { ok: false; reason: 'no_attempt' | 'unknown_question' | 'bad_choice' };

/**
 * Records one answer and reports whether it was right.
 *
 * The first answer stands. Re-answering after seeing the feedback would make
 * the score meaningless, and because the record is kept here rather than in
 * React state, that holds across a reload, a second tab, and a new phone.
 */
export async function recordAnswer(
  userId: string,
  slug: string,
  questionId: string,
  displayedIndex: number,
  lang: Locale,
): Promise<AnswerVerdict> {
  const question = questionsIn(slug).find((q) => q.id === questionId);
  if (!question) return { ok: false, reason: 'unknown_question' };

  return transaction(async (client) => {
    // Lock the attempt row: two quick taps must not both think they are first.
    const attempt = (
      await client.query<Attempt>(
        `SELECT ${ATTEMPT_COLUMNS} FROM course_attempts
          WHERE user_id = $1 AND course_slug = $2 AND submitted_at IS NULL
          FOR UPDATE`,
        [userId, slug],
      )
    ).rows[0];
    if (!attempt) return { ok: false, reason: 'no_attempt' as const };

    const order = attempt.option_order[questionId] ?? question.options.map((_, i) => i);
    if (!Number.isInteger(displayedIndex) || displayedIndex < 0 || displayedIndex >= order.length) {
      return { ok: false, reason: 'bad_choice' as const };
    }
    const original = order[displayedIndex];

    const previous = attempt.answers[questionId];
    if (previous !== undefined) {
      return {
        ok: true as const,
        correct: previous === question.correct,
        feedback: question.feedback[lang],
        already: true,
      };
    }

    await client.query(
      `UPDATE course_attempts
          SET answers = answers || jsonb_build_object($3::TEXT, $4::INTEGER)
        WHERE id = $1 AND user_id = $2 AND submitted_at IS NULL`,
      [attempt.id, userId, questionId, original],
    );

    return {
      ok: true as const,
      correct: original === question.correct,
      feedback: question.feedback[lang],
      already: false,
    };
  });
}

export type Graded = { score: number; passed: boolean; answered: number; total: number };

/**
 * Closes the open attempt and grades it from what the database holds.
 *
 * Nothing the browser sends is used. The score decides whether a certificate
 * is issued, so it is computed from the answers already recorded here.
 */
export async function submitAttempt(userId: string, slug: string): Promise<Graded | null> {
  const questions = questionsIn(slug);
  if (questions.length === 0) return null;
  const passMark = passMarkFor(slug);

  return transaction(async (client) => {
    const attempt = (
      await client.query<Attempt>(
        `SELECT ${ATTEMPT_COLUMNS} FROM course_attempts
          WHERE user_id = $1 AND course_slug = $2 AND submitted_at IS NULL
          FOR UPDATE`,
        [userId, slug],
      )
    ).rows[0];
    if (!attempt) return null;

    // Unanswered counts as wrong. Skipping a question is not a way to raise a score.
    const right = questions.filter((q) => attempt.answers[q.id] === q.correct).length;
    const score = Math.round((right / questions.length) * 100);
    const passed = score >= passMark;

    await client.query(
      `UPDATE course_attempts
          SET submitted_at = now(), score = $2, passed = $3
        WHERE id = $1 AND submitted_at IS NULL`,
      [attempt.id, score, passed],
    );

    return {
      score,
      passed,
      answered: Object.keys(attempt.answers).length,
      total: questions.length,
    };
  });
}

// ------------------------------------------------------------ reading progress

export async function completedModules(userId: string, slug: string): Promise<string[]> {
  const rows = await query<{ module_id: string }>(
    'SELECT module_id FROM course_module_progress WHERE user_id = $1 AND course_slug = $2',
    [userId, slug],
  );
  return rows.map((r) => r.module_id);
}

export async function markModuleRead(userId: string, slug: string, moduleId: string): Promise<void> {
  const course = COURSE_CONTENT[slug];
  // Only modules that exist. Otherwise the resume point could be set to
  // anything a crafted request names.
  if (!course?.modules.some((m) => m.id === moduleId)) return;

  await execute(
    `INSERT INTO course_module_progress (user_id, course_slug, module_id)
     VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
    [userId, slug, moduleId],
  );
}

// ------------------------------------------------------------- certificates

/**
 * Issues the certificate for a passed course, if it is owed and not already
 * held. Safe to call as often as you like.
 *
 * This is separate from finishing a course on purpose. If the insert fails the
 * moment someone passes — a dropped connection, a deploy mid-request — the
 * pass is already recorded in the ledger, and a learner should not have to
 * retake a course to get the paper for it. Calling this again puts it right.
 */
export async function ensureCourseCertificate(
  userId: string,
  slug: string,
  fullName: string,
): Promise<string | null> {
  const meta = COURSES.find((c) => c.slug === slug);
  if (!meta) return null;

  /*
   * A level's paper is not a credential of its own.
   *
   * programme/credentials.ts has said so since it was written — it refuses a
   * course credential for kind 'challenge' — but this function never asked, and
   * completeCourseAction calls it for every pass. So passing the paper minted a
   * `kind='course'` certificate for it anyway, and two of those are live in
   * production: the rule existed in one file and was contradicted from another.
   *
   * It matters more now than it did. The paper no longer closes a level; the
   * decision run does, and the level certificate attests that. A certificate
   * for the revision on top of it would be a credential for having practised.
   */
  if (meta.kind === 'challenge') return null;

  const passed = await queryOne<{ one: number }>(
    `SELECT 1 AS one FROM course_attempts
      WHERE user_id = $1 AND course_slug = $2 AND passed LIMIT 1`,
    [userId, slug],
  );
  if (!passed) return null;

  const snapshot = {
    fullName,
    titleAr: `شهادة إتمام — ${meta.title.ar}`,
    titleEn: `Certificate of completion — ${meta.title.en}`,
  };

  // uq_cert_course_once carries the "only once" rule, so a race between two
  // callers ends with one certificate and no error.
  const row = await queryOne<{ code: string }>(
    `INSERT INTO certificates (id, code, user_id, kind, course_slug, snapshot)
     VALUES ($1, $2, $3, 'course', $4, $5)
     ON CONFLICT (user_id, course_slug) WHERE kind = 'course' DO NOTHING
     RETURNING code`,
    [randomUUID(), generateCode(), userId, slug, JSON.stringify(snapshot)],
  );
  return row?.code ?? null;
}

/**
 * Every course someone has passed but holds no certificate for.
 *
 * `kind <> 'challenge'` for the same reason ensureCourseCertificate refuses
 * one: a level's paper earns no certificate of its own. Without it this list
 * would name the paper for ever — offering to issue something the issuer is
 * built to refuse, and a backfill that never stops finding work to do.
 */
export async function unissuedCourseCertificates(userId: string): Promise<string[]> {
  const rows = await query<{ course_slug: string }>(
    `SELECT DISTINCT a.course_slug
       FROM course_attempts a
       JOIN courses c2 ON c2.slug = a.course_slug
      WHERE a.user_id = $1 AND a.passed
        AND c2.kind <> 'challenge'
        AND NOT EXISTS (
          SELECT 1 FROM certificates c
           WHERE c.user_id = a.user_id AND c.kind = 'course'
             AND c.course_slug = a.course_slug)`,
    [userId],
  );
  return rows.map((r) => r.course_slug);
}

/**
 * Whether somebody may start a course, and what stands in the way.
 *
 * A prerequisite is a locked door. The rule here is that it locks only when
 * the catalogue says so — `requires` is empty on almost every course, and the
 * one place it is not, the earlier course genuinely has to come first.
 * `recommends` never locks anything; it is advice, and advice that blocks is
 * not advice.
 */
export type Eligibility = {
  allowed: boolean;
  /** Courses that must be passed first and have not been. */
  missing: string[];
  /** Suggested first, not required. Shown, never enforced. */
  suggested: string[];
};

export async function eligibilityFor(userId: string | null, slug: string): Promise<Eligibility> {
  const course = courseBySlug(slug);
  if (!course) return { allowed: false, missing: [], suggested: [] };
  if (course.requires.length === 0 && course.recommends.length === 0) {
    return { allowed: true, missing: [], suggested: [] };
  }

  // A signed-out visitor has passed nothing, so everything unmet is listed —
  // which is the honest answer, and the page invites them to sign in.
  const passed = userId ? await passedCourseSlugs(userId) : new Set<string>();

  return {
    // The shared expression, not a second copy of it. See access.ts.
    allowed: prerequisitesMet(course.requires, passed),
    missing: course.requires.filter((r) => !passed.has(r)),
    suggested: course.recommends.filter((r) => !passed.has(r)),
  };
}

export async function passedCourseSlugs(userId: string): Promise<Set<string>> {
  const rows = await query<{ course_slug: string }>(
    'SELECT DISTINCT course_slug FROM course_attempts WHERE user_id = $1 AND passed',
    [userId],
  );
  return new Set(rows.map((r) => r.course_slug));
}

/*
 * ── DATES ──────────────────────────────────────────────────────────────────
 *
 * The session runs GMT and the association is in Beirut. Every day this file
 * hands upward is produced by Postgres as 'YYYY-MM-DD' text, already shifted
 * to Asia/Beirut, and is rendered as text from there on. Nothing downstream
 * rebuilds a Date from it: an attempt submitted at 01:00 Beirut on the 5th is
 * 22:00 GMT on the 4th, and `new Date(...).toISOString()` would date somebody's
 * sitting to the day before they sat it.
 *
 * That is not hypothetical — it is what the account page did with
 * `last_attempt_at` until this column became text. See the same note and the
 * same helper in lib/level-challenge-runs.ts.
 */
const beirutDay = (column: string) =>
  `to_char(${column} AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')`;

export type CourseStanding = {
  course_slug: string;
  attempts: number;
  best_score: number | null;
  passed: boolean;
  /** 'YYYY-MM-DD' in Beirut, as text. Never reconstruct a Date from it. */
  last_attempt_on: string | null;
  open_answered: number | null;
  modules_read: number;
  /*
   * Passed because the association recognised prior learning, not because a
   * paper was sat here.
   *
   * Kept beside `passed` rather than folded into it. The standing is the
   * same; the story is not, and a page reporting "1 attempt, no score,
   * passed" reads as a fault rather than as recognition.
   */
  recognised: boolean;
};

/**
 * Where someone stands in every course they have touched.
 *
 * One query rather than one per course: the account page shows the whole
 * catalogue, and a request that grows with the catalogue is a request that
 * gets slower every time content is added.
 */
export async function learningStanding(userId: string): Promise<Map<string, CourseStanding>> {
  const rows = await query<CourseStanding>(
    /*
     * A recognised pass is a row here but was never an attempt: nothing was
     * sat, and it carries no score by design. So it is excluded from the
     * attempt count, the best score and the last-attempt date — otherwise the
     * page says "1 attempt, no score" about somebody who answered nothing —
     * and surfaced on its own flag instead.
     */
    `WITH attempts AS (
       SELECT course_slug,
              (count(*) FILTER (WHERE submitted_at IS NOT NULL
                                  AND source <> 'recognised'))::INTEGER    AS attempts,
              MAX(score) FILTER (WHERE submitted_at IS NOT NULL)          AS best_score,
              COALESCE(bool_or(passed), false)                            AS passed,
              COALESCE(bool_or(source = 'recognised'), false)             AS recognised,
              ${beirutDay("MAX(submitted_at) FILTER (WHERE source <> 'recognised')")}
                                                                          AS last_attempt_on,
              -- Parenthesised so the cast applies to the aggregate and not to
              -- the FILTER clause, and because MAX over count(*) is a bigint,
              -- which the driver would otherwise hand back as a string.
              (MAX((SELECT count(*) FROM jsonb_object_keys(answers)))
                 FILTER (WHERE submitted_at IS NULL))::INTEGER            AS open_answered
         FROM course_attempts WHERE user_id = $1 GROUP BY course_slug
     ), modules AS (
       SELECT course_slug, count(*)::INTEGER AS modules_read
         FROM course_module_progress WHERE user_id = $1 GROUP BY course_slug
     )
     SELECT COALESCE(a.course_slug, m.course_slug)   AS course_slug,
            COALESCE(a.attempts, 0)                  AS attempts,
            a.best_score,
            COALESCE(a.passed, false)                AS passed,
            COALESCE(a.recognised, false)            AS recognised,
            a.last_attempt_on,
            a.open_answered,
            COALESCE(m.modules_read, 0)              AS modules_read
       FROM attempts a FULL OUTER JOIN modules m ON m.course_slug = a.course_slug`,
    [userId],
  );
  return new Map(rows.map((r) => [r.course_slug, r]));
}

// ---------------------------------------------------------- attempt history

/**
 * One sitting, as the learner is shown it.
 *
 * `source` rides along because three of these rows mean three different
 * things and a page that renders them identically tells at least two lies:
 *
 *   web         somebody sat the paper here. Everything below is real.
 *   recognised  the association credited the course from prior learning.
 *               No paper, no score, and `answered` is zero because nothing
 *               was answered — not because they gave up.
 *   migrated    carried over from the single-row table migration 012
 *               replaced, where the questions, the answers and the pass mark
 *               were never recorded. The score is what that row held; the
 *               blanks are blank because nobody wrote them down, and the
 *               screen says so rather than showing a sitting with no detail.
 */
export type AttemptSummary = {
  /** 'YYYY-MM-DD' in Beirut, as text. Never reconstruct a Date from it. */
  started_on: string;
  submitted_on: string | null;
  score: number | null;
  passed: boolean;
  pass_mark: number | null;
  answered: number;
  asked: number;
  source: string;
};

const HISTORY_COLUMNS = `${beirutDay('started_at')}   AS started_on,
  ${beirutDay('submitted_at')} AS submitted_on,
  score, passed, pass_mark, source,
  (SELECT count(*) FROM jsonb_object_keys(answers))::INTEGER AS answered,
  cardinality(question_ids)::INTEGER                         AS asked`;

/*
 * A row that is not a sitting.
 *
 * startOrResumeAttempt opens an attempt the moment somebody lands on any unit
 * of a course, so simply looking at the material leaves a row here with no
 * answers and no submission. Sixteen of the seventy-four rows in production
 * are that — including several on courses the learner had already passed and
 * came back to re-read.
 *
 * The standing already knows: learningStanding surfaces the open one as
 * `open_answered`, and the account page has a banner for it. But in a list of
 * sittings those rows would read as "attempt 4, not finished, 0 of 7
 * answered" — telling somebody who reopened a course to check one paragraph
 * that they abandoned a paper. Nobody sat anything, so nothing is listed.
 *
 * An open attempt WITH answers stays: that person is halfway through a paper,
 * and saying so is the truth.
 */
const IS_A_SITTING = `(submitted_at IS NOT NULL OR answers <> '{}'::jsonb)`;

/**
 * Every sitting of one course, newest first — what the old single-row table
 * could not say.
 *
 * Ordered by when it was sat and by nothing else. Ordering by score would
 * turn a record of what somebody did into a table of their own attempts
 * ranked against each other, which is the same instrument migrations 034 and
 * 041 refused to build between people. It is no better pointed inward.
 */
export async function attemptHistory(userId: string, slug: string): Promise<AttemptSummary[]> {
  return query<AttemptSummary>(
    `SELECT ${HISTORY_COLUMNS}
       FROM course_attempts
      WHERE user_id = $1 AND course_slug = $2 AND ${IS_A_SITTING}
      ORDER BY started_at DESC`,
    [userId, slug],
  );
}

/**
 * The same, for every course at once, keyed by slug.
 *
 * The account page lists the whole catalogue. Calling attemptHistory() per
 * course there would be one round trip per course on every load, and the
 * catalogue is the thing that grows.
 */
export async function attemptHistoryByCourse(
  userId: string,
): Promise<Map<string, AttemptSummary[]>> {
  const rows = await query<AttemptSummary & { course_slug: string }>(
    `SELECT course_slug, ${HISTORY_COLUMNS}
       FROM course_attempts
      WHERE user_id = $1 AND ${IS_A_SITTING}
      ORDER BY course_slug, started_at DESC`,
    [userId],
  );

  const byCourse = new Map<string, AttemptSummary[]>();
  for (const { course_slug, ...attempt } of rows) {
    const list = byCourse.get(course_slug);
    if (list) list.push(attempt);
    else byCourse.set(course_slug, [attempt]);
  }
  return byCourse;
}

/**
 * The score of the most recent finished sitting, or null if there is none.
 *
 * Section 28 of the brief asks for a last score beside the best one, and this
 * is all "last score" is allowed to be here: a fact about the most recent
 * sitting. It is deliberately NOT returned alongside a comparison with the
 * best, a difference, a direction or a trend. Two numbers on a page are two
 * facts; the same two with an arrow between them is a verdict on somebody's
 * last hour, and nobody asked for that.
 *
 * Expects the newest-first order both readers above produce, and skips the
 * open attempt at the head of the list — an attempt in progress has no score
 * yet, and treating its absence as one would report "last score: —" to
 * somebody who is halfway through answering.
 */
export function lastScoreOf(history: readonly AttemptSummary[]): number | null {
  for (const attempt of history) {
    if (attempt.submitted_on === null) continue;
    if (attempt.source === 'recognised') continue;
    if (attempt.score !== null) return attempt.score;
  }
  return null;
}

/**
 * The highest score across finished sittings, or null if there is none.
 *
 * Derived here rather than taken from learningStanding.best_score so that the
 * panel showing the list and the number above the list are computed from the
 * same rows. Two aggregates over the same table, written in two places, is
 * how a page ends up claiming a best score that appears nowhere in the list
 * underneath it.
 */
export function bestScoreOf(history: readonly AttemptSummary[]): number | null {
  let best: number | null = null;
  for (const attempt of history) {
    if (attempt.submitted_on === null || attempt.score === null) continue;
    if (best === null || attempt.score > best) best = attempt.score;
  }
  return best;
}

/**
 * The sittings, oldest first, numbered from one — with the rows that were
 * never sittings left out of the count.
 *
 * A recognised pass is a row in this table and is shown in the list, but it
 * is not an attempt at anything and numbering it "attempt 2" would tell
 * somebody they sat a paper they never saw.
 */
export function numberSittings(
  history: readonly AttemptSummary[],
): Map<AttemptSummary, number> {
  const numbers = new Map<AttemptSummary, number>();
  let n = 0;
  // The callers hand this over newest first; numbering runs the other way, so
  // that attempt 1 is the first one somebody sat rather than the last.
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const attempt = history[i];
    if (attempt.source === 'recognised') continue;
    n += 1;
    numbers.set(attempt, n);
  }
  return numbers;
}
