/**
 * The half of an assessment that a radio button cannot reach.
 *
 * Field Safety asks a volunteer to write a risk note. Documentation asks them
 * to write minutes somebody who was not in the room can act on. Events asks
 * for a plan. None of those has a right answer among four options, and until
 * now the academy tested each of those courses on whichever part of itself
 * happened to fit into a multiple-choice question — which is the part that
 * matters least.
 *
 * So: a learner writes the thing, a trainer reads it, and the verdict is
 * approved or "here is what to change". Two words, no mark. A number out of
 * ten would be the first thing anybody compared between two volunteers, and
 * the association does not rank the people who give it their evenings.
 *
 * ── WHAT THIS MUST NOT DISTURB ─────────────────────────────────────────────
 *
 * courseFingerprint() hashes the slug, the pass mark, the module ids and the
 * quiz questions — see lib/course-version.ts. A practical task is none of
 * those, so adding one to a course somebody sat last March changes no
 * fingerprint, no score and no certificate. That is not a happy accident; it
 * is the reason the task hangs off CourseContent as its own field rather than
 * becoming a block with a `correct` on it, and probe-practical asserts it
 * across the whole catalogue.
 *
 * The second half of the same promise lives in courseOutcome() below: a
 * practical task added to a course can never take back a pass or a certificate
 * that somebody already holds.
 *
 * Kept free of the database and of React, like player.ts beside it, so the
 * probe can drive every rule here without a server. No `server-only`.
 */

import type { CourseContent, PracticalTask } from '../course-content/types';
import { COURSE_CONTENT } from '../course-content';

export type { PracticalTask };

/**
 * The reserved id of the practical screen in the player.
 *
 * Underscored for exactly the reason ASSESSMENT_ID is: module ids are authored
 * by hand as plain words, and probe-player asserts across all 41 courses that
 * none of them starts with an underscore. That assertion is what makes this id
 * unauthorable, and an authorable one would mean a course where opening the
 * practical screen served a module instead.
 */
export const PRACTICAL_ID = '_practical';

/** The task a course sets, or null for the great majority that set none. */
export function practicalTaskFor(slug: string): PracticalTask | null {
  return COURSE_CONTENT[slug]?.practical ?? null;
}

export function hasPractical(slug: string): boolean {
  return practicalTaskFor(slug) !== null;
}

export type Decision = 'approved' | 'changes_requested';

/**
 * One attempt, as the screens need it.
 *
 * `submittedOn` is a Beirut calendar day already rendered to 'YYYY-MM-DD' text
 * by the query — never a Date. The session runs GMT, and a submission made at
 * half past midnight Beirut time reads as the previous day the moment anybody
 * rebuilds a Date from the instant. Nothing in this module constructs one.
 */
export type Attempt = {
  attemptNo: number;
  submittedOn: string;
  body: string;
  decision: Decision | null;
  feedback: string | null;
  reviewedOn: string | null;
};

export type PracticalState =
  /** Nothing written yet. */
  | 'not-started'
  /** Written, waiting on a person. */
  | 'awaiting-review'
  /** Read, and sent back with what to change. */
  | 'changes-requested'
  /** Accepted. */
  | 'approved';

/**
 * Newest attempt first, by attempt number.
 *
 * Deliberately not by date. Two attempts made in the same minute carry the
 * same 'YYYY-MM-DD' and would tie, and sorting by the instant would mean the
 * order on screen depended on a clock rather than on what the learner did.
 * attempt_no is assigned once and never renumbered, so it is the only ordering
 * that cannot be wrong.
 */
export function newestFirst(history: readonly Attempt[]): Attempt[] {
  return [...history].sort((a, b) => b.attemptNo - a.attemptNo);
}

/** The most recent attempt, or null when there is none. */
export function latest(history: readonly Attempt[]): Attempt | null {
  return newestFirst(history)[0] ?? null;
}

/**
 * Where the learner stands.
 *
 * An approval anywhere in the history wins, even if it is not the newest row.
 * It should never happen — the database refuses a second approved attempt for
 * the same task — but if it somehow did, the honest reading is that the work
 * was accepted, and a screen that said otherwise would be taking something
 * back from somebody who had already been told they were finished.
 */
export function practicalState(history: readonly Attempt[]): PracticalState {
  if (history.some((a) => a.decision === 'approved')) return 'approved';
  const newest = latest(history);
  if (!newest) return 'not-started';
  return newest.decision === null ? 'awaiting-review' : 'changes-requested';
}

/** The feedback a learner is owed a sight of: the newest that carries any. */
export function lastFeedback(history: readonly Attempt[]): Attempt | null {
  return newestFirst(history).find((a) => a.feedback !== null && a.feedback !== '') ?? null;
}

/**
 * May they write again?
 *
 * Not while a trainer has it — a second submission would put the same task in
 * the queue twice and the database refuses it anyway. Not after an approval,
 * because there is nothing left to ask for. Otherwise yes, as many times as it
 * takes; nothing here counts attempts against anybody.
 */
export function mayResubmit(history: readonly Attempt[]): boolean {
  const state = practicalState(history);
  return state === 'not-started' || state === 'changes-requested';
}

/** The attempt number a new submission gets. Never reuses a number. */
export function nextAttemptNo(history: readonly Attempt[]): number {
  return history.reduce((highest, a) => Math.max(highest, a.attemptNo), 0) + 1;
}

// ------------------------------------------------------------------ writing

export type BodyRefusal = 'empty' | 'too-short' | 'too-long';

export type BodyCheck =
  | { ok: true; body: string }
  | { ok: false; reason: BodyRefusal };

/**
 * Whether what was typed can be submitted at all.
 *
 * Trimmed first and measured after, so twelve blank lines is empty rather than
 * long enough. The ceiling exists because the field is a textarea on a public
 * form and the row is kept forever; the floor exists because a risk assessment
 * in nine words is not a risk assessment, and returning it costs a trainer an
 * evening and the learner a week of waiting to be told so.
 */
export function checkBody(raw: string, task: PracticalTask): BodyCheck {
  const body = raw.trim();
  if (body.length === 0) return { ok: false, reason: 'empty' };
  if (body.length < task.minChars) return { ok: false, reason: 'too-short' };
  if (body.length > task.maxChars) return { ok: false, reason: 'too-long' };
  return { ok: true, body };
}

// ----------------------------------------------------------------- reviewing

export type ReviewRefusal =
  /** The reader holds no capability to judge work. */
  | 'not-permitted'
  /** Their own submission. */
  | 'self'
  /** Somebody has already decided this one. */
  | 'already-decided'
  /** Sending work back without saying what to change. */
  | 'no-feedback';

export type ReviewCheck = { ok: true } | { ok: false; reason: ReviewRefusal };

/** The shortest string that could be a sentence about somebody's work. */
export const MIN_FEEDBACK = 10;

/**
 * Whether this person may record this verdict.
 *
 * The self-review rule is written three times on purpose — here, in the server
 * action, and as a CHECK constraint in migration 041 — for the same reason the
 * hours ledger writes its own three times. Trainers take these courses too,
 * and a trainer approving their own activity plan is the one failure that
 * would make every approval on the platform worth nothing.
 *
 * Feedback is required to send work back and optional to accept it. "Approved"
 * is already a complete message; «أعِد كتابته» is not.
 */
export function checkReview(input: {
  capable: boolean;
  reviewerId: string;
  learnerId: string;
  alreadyDecided: boolean;
  decision: Decision;
  feedback: string;
}): ReviewCheck {
  if (!input.capable) return { ok: false, reason: 'not-permitted' };
  if (input.reviewerId === input.learnerId) return { ok: false, reason: 'self' };
  if (input.alreadyDecided) return { ok: false, reason: 'already-decided' };
  if (input.decision === 'changes_requested' && input.feedback.trim().length < MIN_FEEDBACK) {
    return { ok: false, reason: 'no-feedback' };
  }
  return { ok: true };
}

// ---------------------------------------------------- what the course is owed

export type WaitingOn =
  /** The paper has not been passed. */
  | 'paper'
  /** The practical has not been written. */
  | 'practical-submission'
  /** It is written and a trainer has not read it. */
  | 'practical-review'
  /** It was read and sent back. */
  | 'practical-changes';

export type Outcome = {
  /** Finished: the credential is owed. */
  complete: boolean;
  /** What is left, or null when nothing is. */
  waitingOn: WaitingOn | null;
};

/**
 * Whether a course is actually finished.
 *
 * The paper still decides the score and still writes `passed` on the attempt —
 * nothing in this module touches course_attempts, and gate.ts still unlocks
 * levels from exactly the rows it always did. What changes is only the last
 * step: on a course that sets a practical task, the credential waits for the
 * trainer.
 *
 * TWO THINGS THIS FUNCTION EXISTS TO GUARANTEE
 *
 * 1. A course with no practical task behaves precisely as it did before this
 *    feature existed: complete iff the paper was passed. Thirty-eight of the
 *    forty-one courses take that branch and always will.
 *
 * 2. `alreadyCertified` short-circuits everything. Adding a practical task to
 *    Field Safety next month must not tell the volunteers who passed it last
 *    March that their certificate is pending. They did what was asked of them
 *    at the time; the association's later decision to ask for more is not
 *    something to charge them for retrospectively. Certificates are never
 *    revoked from here, and this is the line that makes that true on screen as
 *    well as in the table.
 */
export function courseOutcome(input: {
  task: PracticalTask | null;
  paperPassed: boolean;
  /** Empty when the learner has submitted nothing. */
  history: readonly Attempt[];
  /** They already hold a live credential for this course. */
  alreadyCertified: boolean;
}): Outcome {
  if (input.alreadyCertified) return { complete: true, waitingOn: null };
  if (!input.paperPassed) return { complete: false, waitingOn: 'paper' };
  if (!input.task) return { complete: true, waitingOn: null };

  switch (practicalState(input.history)) {
    case 'approved':
      return { complete: true, waitingOn: null };
    case 'awaiting-review':
      return { complete: false, waitingOn: 'practical-review' };
    case 'changes-requested':
      return { complete: false, waitingOn: 'practical-changes' };
    case 'not-started':
      return { complete: false, waitingOn: 'practical-submission' };
  }
}

/**
 * Every task in the catalogue, for the probe and for anything that needs to
 * know which courses ask for written work.
 */
export function coursesWithPractical(): { slug: string; task: PracticalTask }[] {
  return Object.values(COURSE_CONTENT as Record<string, CourseContent>)
    .filter((c): c is CourseContent & { practical: PracticalTask } => Boolean(c.practical))
    .map((c) => ({ slug: c.slug, task: c.practical }));
}
