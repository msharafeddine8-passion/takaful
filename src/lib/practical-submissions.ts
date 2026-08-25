import 'server-only';
import { randomUUID } from 'node:crypto';
import { query, queryOne, transaction } from './db';
import { versionOf } from './academy';
import {
  practicalTaskFor,
  nextAttemptNo,
  mayResubmit,
  checkBody,
  checkReview,
  type Attempt,
  type Decision,
} from './programme/practical';

/**
 * Reading and writing practical submissions.
 *
 * The rules are next door in programme/practical.ts, where a probe can reach
 * them without a database. This file is the part that cannot be pure: the
 * queries, the transaction that assigns an attempt number, and the one place
 * that decides which columns a trainer is allowed to see about a learner.
 *
 * ── WHAT A REVIEWER IS SHOWN ───────────────────────────────────────────────
 *
 * A name, the course, the day the work arrived, and the work. That is the
 * complete list, and it is short on purpose. The queue query below selects
 * `full_name` from profiles and nothing else — no date of birth, no age, no
 * emergency contact, no safeguarding field, nothing from the roster. A trainer
 * reading a risk assessment has no business knowing how old the person who
 * wrote it is, and a query that fetched the whole profile "for convenience"
 * would put it one JSX line away from being on the screen.
 *
 * ── DATES ──────────────────────────────────────────────────────────────────
 *
 * The session runs GMT and the association is in Beirut. Every day this file
 * hands upward is produced by Postgres as 'YYYY-MM-DD' text, already shifted
 * to Asia/Beirut, and is compared and rendered as text from there on. Nothing
 * downstream rebuilds a Date from it: work submitted at 00:30 Beirut on the
 * 5th would read as the 4th the moment anything did.
 */

type Row = {
  attempt_no: number;
  submitted_on: string;
  body: string;
  decision: Decision | null;
  feedback: string | null;
  reviewed_on: string | null;
};

const rowToAttempt = (r: Row): Attempt => ({
  attemptNo: Number(r.attempt_no),
  submittedOn: r.submitted_on,
  body: r.body,
  decision: r.decision,
  feedback: r.feedback,
  reviewedOn: r.reviewed_on,
});

/*
 * to_char over AT TIME ZONE, not the bare timestamp.
 *
 * Named once here and reused, because the correction is easy to leave out of
 * exactly one query and impossible to notice afterwards — the day is only
 * wrong for submissions made between midnight and 02:00 Beirut, which is a
 * small enough slice that it looks like nothing until somebody's attempt is
 * dated the day before they made it.
 */
const beirutDay = (column: string) =>
  `to_char(${column} AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')`;

const SUBMITTED_DAY = beirutDay('submitted_at');
const REVIEWED_DAY = beirutDay('reviewed_at');

/** Every attempt this learner has made at this course's task, oldest first. */
export async function historyFor(userId: string, slug: string): Promise<Attempt[]> {
  const task = practicalTaskFor(slug);
  if (!task) return [];
  const rows = await query<Row>(
    `SELECT attempt_no, body, decision, feedback,
            ${SUBMITTED_DAY} AS submitted_on,
            ${REVIEWED_DAY} AS reviewed_on
       FROM practical_submissions
      WHERE user_id = $1 AND course_slug = $2 AND task_id = $3
      ORDER BY attempt_no`,
    [userId, slug, task.id],
  );
  return rows.map(rowToAttempt);
}

/** Whether a live credential for this course is already held. */
export async function holdsCourseCredential(userId: string, slug: string): Promise<boolean> {
  const row = await queryOne<{ one: number }>(
    `SELECT 1 AS one FROM certificates
      WHERE user_id = $1 AND course_slug = $2
        AND kind IN ('course', 'orientation') AND revoked_at IS NULL
      LIMIT 1`,
    [userId, slug],
  );
  return row !== null;
}

export type SubmitResult =
  | { ok: true; attemptNo: number }
  | { ok: false; reason: 'no-task' | 'empty' | 'too-short' | 'too-long' | 'already-open' | 'db' };

/**
 * Records a new attempt.
 *
 * The attempt number is read and written inside one transaction with the
 * learner's existing rows locked, so two tabs cannot both decide they are
 * number three. If they race anyway, uq_practical_attempt refuses the loser
 * and it surfaces as 'already-open' rather than as a 500 — losing that race
 * means the other tab's submission is in the queue, which is the correct
 * outcome and not an error the learner needs explaining.
 */
export async function submitPractical(
  userId: string,
  slug: string,
  raw: string,
): Promise<SubmitResult> {
  const task = practicalTaskFor(slug);
  if (!task) return { ok: false, reason: 'no-task' };

  const checked = checkBody(raw, task);
  if (!checked.ok) return { ok: false, reason: checked.reason };

  try {
    return await transaction(async (client) => {
      const { rows } = await client.query<{ attempt_no: number; decision: Decision | null }>(
        `SELECT attempt_no, decision FROM practical_submissions
          WHERE user_id = $1 AND course_slug = $2 AND task_id = $3
          FOR UPDATE`,
        [userId, slug, task.id],
      );
      const history = rows.map((r) => ({
        attemptNo: Number(r.attempt_no),
        submittedOn: '',
        body: '',
        decision: r.decision,
        feedback: null,
        reviewedOn: null,
      }));

      if (!mayResubmit(history)) return { ok: false as const, reason: 'already-open' as const };

      const attemptNo = nextAttemptNo(history);
      await client.query(
        `INSERT INTO practical_submissions
           (id, user_id, course_slug, task_id, attempt_no, body, content_version)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [randomUUID(), userId, slug, task.id, attemptNo, checked.body, versionOf(slug)],
      );
      return { ok: true as const, attemptNo };
    });
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      return { ok: false, reason: 'already-open' };
    }
    return { ok: false, reason: 'db' };
  }
}

// -------------------------------------------------------------- the queue

export type QueueItem = {
  id: string;
  /** The name a trainer needs to address the feedback to. Nothing else. */
  fullName: string;
  learnerId: string;
  courseSlug: string;
  taskId: string;
  attemptNo: number;
  /** 'YYYY-MM-DD' in Beirut, as text. Never reconstruct a Date from it. */
  submittedOn: string;
  body: string;
  /** How many times this learner has already been sent back on this task. */
  previousAttempts: number;
};

/**
 * Everything waiting on a person, oldest first.
 *
 * Oldest first rather than newest, because the queue is somebody's evening and
 * a stack sorted the other way leaves the learner who has waited longest at
 * the bottom of it forever.
 */
export async function reviewQueue(): Promise<QueueItem[]> {
  const rows = await query<{
    id: string;
    user_id: string;
    full_name: string | null;
    course_slug: string;
    task_id: string;
    attempt_no: number;
    submitted_on: string;
    body: string;
    previous_attempts: number;
  }>(
    /*
     * profiles is joined for one column. Selecting p.* here would put a date
     * of birth into a variable a page is one careless line away from
     * rendering — see the note at the top of this file.
     */
    `SELECT s.id, s.user_id, p.full_name, s.course_slug, s.task_id, s.attempt_no,
            ${beirutDay('s.submitted_at')} AS submitted_on,
            s.body,
            (s.attempt_no - 1)::INTEGER AS previous_attempts
       FROM practical_submissions s
       LEFT JOIN profiles p ON p.user_id = s.user_id
      WHERE s.decision IS NULL
      ORDER BY s.submitted_at`,
  );
  return rows.map((r) => ({
    id: r.id,
    fullName: r.full_name ?? '',
    learnerId: r.user_id,
    courseSlug: r.course_slug,
    taskId: r.task_id,
    attemptNo: Number(r.attempt_no),
    submittedOn: r.submitted_on,
    body: r.body,
    previousAttempts: Number(r.previous_attempts),
  }));
}

/** How many pieces of work are waiting. For the staff dashboard card. */
export async function awaitingCount(): Promise<number> {
  const row = await queryOne<{ n: number }>(
    'SELECT count(*)::INTEGER AS n FROM practical_submissions WHERE decision IS NULL',
  );
  return Number(row?.n ?? 0);
}

export type ReviewResult =
  | { ok: true; learnerId: string; courseSlug: string }
  | {
      ok: false;
      reason: 'not-found' | 'self' | 'already-decided' | 'no-feedback' | 'not-permitted' | 'db';
    };

/**
 * Records a verdict.
 *
 * The row is locked and re-read inside the transaction rather than trusted
 * from the queue the trainer was looking at, which may be minutes old. Two
 * trainers opening the same submission is the ordinary case, not the exotic
 * one, and the second must be told it is already decided rather than quietly
 * overwriting the first person's words.
 *
 * `capable` is passed in rather than checked here: the capability is resolved
 * once by the action, against the signed-in session, and this function is not
 * the place that decides who anybody is.
 */
export async function recordReview(input: {
  submissionId: string;
  reviewerId: string;
  capable: boolean;
  decision: Decision;
  feedback: string;
}): Promise<ReviewResult> {
  try {
    return await transaction(async (client) => {
      const { rows } = await client.query<{
        user_id: string;
        course_slug: string;
        decision: Decision | null;
      }>(
        `SELECT user_id, course_slug, decision FROM practical_submissions
          WHERE id = $1 FOR UPDATE`,
        [input.submissionId],
      );
      const row = rows[0];
      if (!row) return { ok: false as const, reason: 'not-found' as const };

      const verdict = checkReview({
        capable: input.capable,
        reviewerId: input.reviewerId,
        learnerId: row.user_id,
        alreadyDecided: row.decision !== null,
        decision: input.decision,
        feedback: input.feedback,
      });
      if (!verdict.ok) return { ok: false as const, reason: verdict.reason };

      // Feedback on an approval is optional and often worth writing anyway.
      // Empty is stored as NULL rather than as an empty string, so "there was
      // no feedback" and "the feedback was blank" are not two different facts.
      const feedback = input.feedback.trim();
      await client.query(
        `UPDATE practical_submissions
            SET decision = $2, reviewed_by = $3, reviewed_at = now(), feedback = $4
          WHERE id = $1 AND decision IS NULL`,
        [input.submissionId, input.decision, input.reviewerId, feedback || null],
      );
      return { ok: true as const, learnerId: row.user_id, courseSlug: row.course_slug };
    });
  } catch {
    return { ok: false, reason: 'db' };
  }
}
