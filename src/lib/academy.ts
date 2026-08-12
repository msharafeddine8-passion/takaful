import 'server-only';
import { randomUUID, randomInt } from 'node:crypto';
import { query, queryOne, execute, transaction } from './db';
import { COURSE_CONTENT } from './course-content';
import { COURSES } from './courses';
import { generateCode } from './certificates';
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
  answers, started_at, submitted_at, score, passed, pass_mark`;

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
      `INSERT INTO course_attempts (id, user_id, course_slug, question_ids, option_order, pass_mark)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${ATTEMPT_COLUMNS}`,
      [randomUUID(), userId, slug, ids, JSON.stringify(optionOrder), passMarkFor(slug)],
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

/** Every course someone has passed but holds no certificate for. */
export async function unissuedCourseCertificates(userId: string): Promise<string[]> {
  const rows = await query<{ course_slug: string }>(
    `SELECT DISTINCT a.course_slug
       FROM course_attempts a
      WHERE a.user_id = $1 AND a.passed
        AND NOT EXISTS (
          SELECT 1 FROM certificates c
           WHERE c.user_id = a.user_id AND c.kind = 'course'
             AND c.course_slug = a.course_slug)`,
    [userId],
  );
  return rows.map((r) => r.course_slug);
}

export type CourseStanding = {
  course_slug: string;
  attempts: number;
  best_score: number | null;
  passed: boolean;
  last_attempt_at: Date | null;
  open_answered: number | null;
  modules_read: number;
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
    `WITH attempts AS (
       SELECT course_slug,
              (count(*) FILTER (WHERE submitted_at IS NOT NULL))::INTEGER AS attempts,
              MAX(score) FILTER (WHERE submitted_at IS NOT NULL)          AS best_score,
              COALESCE(bool_or(passed), false)                            AS passed,
              MAX(submitted_at)                                           AS last_attempt_at,
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
            a.last_attempt_at,
            a.open_answered,
            COALESCE(m.modules_read, 0)              AS modules_read
       FROM attempts a FULL OUTER JOIN modules m ON m.course_slug = a.course_slug`,
    [userId],
  );
  return new Map(rows.map((r) => [r.course_slug, r]));
}

export type AttemptSummary = {
  started_at: Date;
  submitted_at: Date | null;
  score: number | null;
  passed: boolean;
  pass_mark: number | null;
  answered: number;
};

/** Every sitting, newest first — what the old single-row table could not say. */
export async function attemptHistory(userId: string, slug: string): Promise<AttemptSummary[]> {
  return query<AttemptSummary>(
    `SELECT started_at, submitted_at, score, passed, pass_mark,
            (SELECT count(*) FROM jsonb_object_keys(answers))::INTEGER AS answered
       FROM course_attempts
      WHERE user_id = $1 AND course_slug = $2
      ORDER BY started_at DESC`,
    [userId, slug],
  );
}
