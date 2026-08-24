/**
 * What somebody did before this platform existed, and how to record it.
 *
 * The association has been running since 2020; the site is weeks old. A
 * volunteer of six years shows zero hours and is locked out of a course they
 * used to teach. Both facts are true of the database and false about the
 * person, and the fix is to let staff carry the record forward.
 *
 * Kept pure so the rules can be held without a database. They are the sort of
 * rule that fails quietly: an hours figure entered in hours rather than
 * minutes is sixty times too big and looks like an unusually committed
 * volunteer, and a date typed as 2205 instead of 2025 sails through anything
 * that only checks "not in the future".
 */

/** Ten thousand hours. High enough for anybody real, low enough to catch a slip. */
export const MAX_CARRIED_MINUTES = 600_000;

/** The association was founded in 2020. Nothing volunteered here predates it. */
export const FOUNDED_YEAR = 2020;

export type CarriedHoursInput = {
  /** As typed: a number of hours, whole or with a half. */
  hours: string;
  /** YYYY-MM-DD — the day the carried-over period is counted up to. */
  upTo: string;
  /** What the figure covers. Required: a number with no account of itself is not a record. */
  note: string;
};

export type CarriedHoursProblem =
  | 'hours-missing' | 'hours-not-a-number' | 'hours-not-positive' | 'hours-too-many'
  | 'date-missing' | 'date-malformed' | 'date-future' | 'date-before-founding'
  | 'note-missing';

export type CarriedHours = { minutes: number; upTo: string; note: string };

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Checks a carry-over and converts it to minutes, or says what is wrong.
 *
 * `today` is passed in rather than read, so the probe can sit on any date and
 * so the same answer comes back on the server and in a test. Compared as
 * calendar dates and never as instants — the database session runs GMT and the
 * association lives in Beirut, and a Date built here would put an entry made
 * this evening into tomorrow.
 */
export function checkCarriedHours(
  input: CarriedHoursInput,
  today: string,
): { ok: true; value: CarriedHours } | { ok: false; problem: CarriedHoursProblem } {
  const hours = input.hours.trim();
  if (!hours) return { ok: false, problem: 'hours-missing' };
  const n = Number(hours);
  if (!Number.isFinite(n)) return { ok: false, problem: 'hours-not-a-number' };
  if (n <= 0) return { ok: false, problem: 'hours-not-positive' };

  const minutes = Math.round(n * 60);
  if (minutes > MAX_CARRIED_MINUTES) return { ok: false, problem: 'hours-too-many' };

  const upTo = input.upTo.trim();
  if (!upTo) return { ok: false, problem: 'date-missing' };
  if (!ISO.test(upTo)) return { ok: false, problem: 'date-malformed' };
  if (upTo > today) return { ok: false, problem: 'date-future' };
  if (Number(upTo.slice(0, 4)) < FOUNDED_YEAR) return { ok: false, problem: 'date-before-founding' };

  const note = input.note.trim();
  if (!note) return { ok: false, problem: 'note-missing' };

  return { ok: true, value: { minutes, upTo, note } };
}

export type RecognitionInput = { slug: string; note: string };
export type RecognitionProblem = 'course-missing' | 'course-unknown' | 'note-missing' | 'note-too-short';

/**
 * Checks a claim that somebody already did a course.
 *
 * The note is required and has to say something. This is the one place a pass
 * is granted without a paper being sat, and "ok" written in a box is not a
 * reason anybody could review a year from now — the standing it unlocks is the
 * same standing an exam unlocks, so the record has to carry as much.
 */
export function checkRecognition(
  input: RecognitionInput,
  knownSlugs: ReadonlySet<string>,
): { ok: true; value: RecognitionInput } | { ok: false; problem: RecognitionProblem } {
  const slug = input.slug.trim();
  if (!slug) return { ok: false, problem: 'course-missing' };
  if (!knownSlugs.has(slug)) return { ok: false, problem: 'course-unknown' };

  const note = input.note.trim();
  if (!note) return { ok: false, problem: 'note-missing' };
  if (note.length < 10) return { ok: false, problem: 'note-too-short' };

  return { ok: true, value: { slug, note } };
}

/**
 * Minutes as the association says them. 90 is "1.5", 60 is "1", 30 is "0.5".
 *
 * Used to put a figure back in the box a member of staff typed it into, so a
 * correction starts from what is there rather than from blank.
 */
export function hoursFromMinutes(minutes: number): string {
  const h = minutes / 60;
  return Number.isInteger(h) ? String(h) : h.toFixed(2).replace(/\.?0+$/, '');
}
