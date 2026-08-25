/**
 * Birthdays and personal milestones: the arithmetic, and nothing else.
 *
 * Two features share this file because they share the one property that makes
 * both of them dangerous: they are the platform's only warm, unprompted
 * messages, and a warm message sent twice is worse than none. Everything that
 * decides "has this already happened?" lives here, where it can be held to
 * account without a database.
 *
 * FOUR THINGS THIS FILE EXISTS TO STOP
 *
 *   A birthday on the wrong day. The database session runs GMT and the
 *   association lives in Beirut, so a greeting decided from a GMT clock goes
 *   out to everybody born tomorrow, for the two hours after midnight, every
 *   night. Nothing here reads a clock: the caller passes today in, as the
 *   YYYY-MM-DD that beirutToday() returns, and every comparison below is text
 *   against text. There is no Date object in this module and none may be
 *   added — a birth date parsed as an instant lands on the previous day for
 *   anybody born after ten in the evening Beirut time, which moves their
 *   birthday to the day before for the rest of their life.
 *
 *   A volunteer born on 29 February greeted once every four years. See
 *   birthdayKeys.
 *
 *   A countdown. There is no "days until", no "next birthday", no sort by how
 *   soon. Nothing in this module can answer a question about a future
 *   birthday, because the moment something can, a page shows it — and an
 *   upcoming birthday published is a birth date published, in instalments.
 *
 *   A milestone announced twice. milestonesEarned returns what is TRUE of
 *   somebody right now, not what is new. It has no memory and cannot have one:
 *   deciding what is new is the database's job, done by a primary key in
 *   migration 037, because a function that decides it from figures would send
 *   the whole set again the first time a figure was corrected upward.
 *
 * WHAT MAY NEVER COME OUT OF HERE
 *
 * No function returns a date of birth, a day, a month, a year, an age, or a
 * count of days until anything. birthdayKeys returns MM-DD strings, which are
 * inputs to a query and are never rendered; everything else returns booleans
 * and codes. dictionaries/milestones.ts holds the words, and there is not a
 * digit in the birthday half of it.
 *
 * PURE. No database, no 'server-only', no clock, no React —
 * scripts/probe-milestones exercises it directly.
 */

/** A plain calendar date. A timestamp is refused rather than trimmed. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Whether a YYYY-MM-DD string is one, without building a Date to find out. */
export function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE.test(value.trim());
}

/** The Gregorian rule, spelled out rather than inferred from a Date. */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * The MM-DD keys whose owners have a birthday TODAY.
 *
 * Almost always one. The exception is 28 February in a year with no 29th,
 * which returns both '02-28' and '02-29'.
 *
 * Somebody born on 29 February has a birthday every year; the calendar simply
 * declines to print it three years in four. Greeting them only when the date
 * exists means a greeting in 2028 and then silence until 2032, which reads to
 * the person receiving it as having been forgotten — and it is the association
 * that would look like it forgot. So the 28th carries them, and the 29th
 * carries them in the years it exists.
 *
 * That fallback is exactly the shape that sends two greetings in a leap year
 * if it is written carelessly: greet on the 28th because the 29th is coming,
 * then greet again on the 29th. It cannot happen here, twice over. This
 * function only adds '02-29' when the year has no 29 February, so in a leap
 * year the 28th matches nobody born on the 29th. And the year is the primary
 * key of birthday_greetings_sent, so even a bug in this function cannot
 * produce a second greeting in the same year.
 *
 * Returns an empty array for anything that is not a plain date. A caller with
 * no keys selects nobody, which is the safe direction: a greeting not sent is
 * a disappointment, and a greeting sent to the wrong list is a disclosure.
 */
export function birthdayKeys(todayIso: string): string[] {
  const today = String(todayIso ?? '').trim();
  if (!ISO_DATE.test(today)) return [];

  const monthDay = today.slice(5);
  if (monthDay !== '02-28') return [monthDay];

  const year = Number(today.slice(0, 4));
  return isLeapYear(year) ? [monthDay] : [monthDay, '02-29'];
}

/**
 * Whether `dobIso` has its birthday on `todayIso`.
 *
 * The same rule as birthdayKeys, asked one person at a time — the list query
 * narrows by MM-DD in SQL and this is what the row is then checked against, so
 * a page and a query can never disagree about whose day it is.
 *
 * Refuses anything that is not a plain YYYY-MM-DD rather than trimming it to
 * ten characters. A GMT timestamp's first ten characters are the wrong day for
 * anybody born late in the evening, and the wrong day here is a greeting sent
 * on the wrong day every year without ever looking broken.
 */
export function isBirthdayToday(dobIso: string | null | undefined, todayIso: string): boolean {
  const dob = String(dobIso ?? '').trim();
  if (!ISO_DATE.test(dob)) return false;
  return birthdayKeys(todayIso).includes(dob.slice(5));
}

/** The Beirut calendar year of a YYYY-MM-DD, for the once-a-year key. */
export function yearOf(todayIso: string): number | null {
  const today = String(todayIso ?? '').trim();
  if (!ISO_DATE.test(today)) return null;
  return Number(today.slice(0, 4));
}

/* ------------------------------------------------------------- milestones */

/**
 * The milestones, in the order a volunteer meets them.
 *
 * Every one is a fact about what this person did, and not one of them is a
 * comparison with anybody else. There is no "faster than", no "more than most"
 * and no code that could be derived from another volunteer's figures — a
 * milestone arriving in the same week as somebody else's must read identically
 * to both of them.
 *
 * The stage codes are generated rather than listed: the journey has six stages
 * today and the number is configuration, so writing them out here would make
 * a seventh stage silently unrecognised.
 */
export const HOURS_MILESTONES = [10, 50, 100] as const;

/** The journey the association runs. Six stages; see chk_stage_range in 002. */
export const MAX_STAGE = 6;

/**
 * Written out rather than generated from the two constants above.
 *
 * Generating them would give `stage-${number}` as the type, which accepts
 * 'stage-99' and would let a code with no words behind it through every check
 * in the system. Listed, every code is a literal, so the dictionary is
 * required by the compiler to have a title and a body for each one in both
 * languages. The probe holds the list and the constants to each other, which
 * is the part a human would forget.
 */
export const MILESTONE_CODES = [
  'first-activity',
  'first-certificate',
  'hours-10', 'hours-50', 'hours-100',
  'first-year',
  'stage-1', 'stage-2', 'stage-3', 'stage-4', 'stage-5', 'stage-6',
  'returned',
  'path-complete',
] as const;

export type MilestoneCode = (typeof MILESTONE_CODES)[number];

export function isMilestoneCode(value: unknown): value is MilestoneCode {
  return typeof value === 'string' && (MILESTONE_CODES as readonly string[]).includes(value);
}

/**
 * How long an absence has to be before coming back is worth saying anything
 * about.
 *
 * Six months. Short enough that a volunteer who stopped over a summer and came
 * back is recognised; long enough that somebody who simply had a quiet
 * February is not told they were away, which reads as an accusation rather
 * than a welcome.
 */
export const RETURN_GAP_DAYS = 180;

/**
 * Everything a milestone can be decided from.
 *
 * All of it is a figure or a plain date the caller has already gathered.
 * Nothing here is a name, a date of birth or another person's anything.
 */
export type MilestoneFacts = {
  /** Confirmed attendance, all time. */
  activitiesAttended: number;
  /** Certificates that still stand — a revoked one is not a first. */
  certificates: number;
  /** Verified minutes, all time. Minutes because that is what the ledger holds. */
  verifiedMinutes: number;
  /**
   * The day the association counts them from: volunteer_roster.joined_on, or
   * users.created_at read in Beirut. YYYY-MM-DD text; anything else is treated
   * as unknown and yields no anniversary.
   */
  joinedOn?: string | null;
  /** Stage numbers actually recorded in stage_progress. Not derived. */
  stagesReached: number[];
  /** How many stages the journey they are assigned to has. Null when none. */
  stagesTotal?: number | null;
  /**
   * The longest run of days between two consecutive days on which they did
   * something. Null when they have fewer than two such days.
   *
   * Computed from the ledger rather than from "days since last seen", so it
   * does not change while somebody is away: a gap that is still open is not a
   * return, and a figure that grows every night would announce a return the
   * day it crossed the threshold, to somebody who has not come back.
   */
  longestGapDays?: number | null;
  /** Today in Beirut, YYYY-MM-DD. The caller owns the clock. */
  today: string;
};

/**
 * Whether a whole year has passed since `joinedOn`, as of `today`.
 *
 * Text arithmetic, and the reason is 29 February again: adding a year to
 * 2024-02-29 gives 2025-02-29, a date that does not exist and that every Date
 * constructor silently turns into 1 March — or, in some paths, refuses. As a
 * string it needs no rescuing. '2025-03-01' >= '2025-02-29' is true and
 * '2025-02-28' >= '2025-02-29' is false, so the volunteer's first anniversary
 * lands on 1 March, which is the answer the calendar would give anyway.
 *
 * Returns false, never null, for an unknown or malformed join date. There is
 * no anniversary of a day nobody recorded, and inventing one would thank
 * somebody for a year they may not have served.
 */
export function hasCompletedAYear(joinedOn: string | null | undefined, today: string): boolean {
  const joined = String(joinedOn ?? '').trim();
  if (!ISO_DATE.test(joined) || !ISO_DATE.test(String(today ?? '').trim())) return false;
  const anniversary = String(Number(joined.slice(0, 4)) + 1).padStart(4, '0') + joined.slice(4);
  return today >= anniversary;
}

/**
 * Which milestones are TRUE of this person, today.
 *
 * Not which are new. This function has no memory, deliberately: the set it
 * returns for somebody with ninety verified hours is the same set every time
 * it is called, and the caller inserts it into milestone_events with
 * ON CONFLICT DO NOTHING. The primary key decides what is new, once, in the
 * database, in the same transaction as the notification.
 *
 * That is the whole idempotency argument and it is worth stating plainly,
 * because the tempting alternative — comparing today's figures against
 * yesterday's and announcing the difference — fails in a way nobody sees
 * coming: correct one person's hours downward and then upward again and every
 * hours milestone they ever passed is announced a second time.
 *
 * Returned sorted by the catalogue order, so a person crossing two at once is
 * told about them in the order they were reached rather than in whatever order
 * a Set iterated.
 */
export function milestonesEarned(facts: MilestoneFacts): MilestoneCode[] {
  const earned = new Set<MilestoneCode>();

  if (facts.activitiesAttended >= 1) earned.add('first-activity');
  if (facts.certificates >= 1) earned.add('first-certificate');

  for (const hours of HOURS_MILESTONES) {
    /* Compared in minutes, which is what hour_entries stores. Converting the
     * ledger to hours to compare against a threshold in hours would round, and
     * 599 minutes is not ten hours however it is displayed. */
    if (facts.verifiedMinutes >= hours * 60) earned.add(`hours-${hours}`);
  }

  if (hasCompletedAYear(facts.joinedOn, facts.today)) earned.add('first-year');

  /*
   * A stage number is data — it comes from a row somebody wrote — so the code
   * built from it is checked against the catalogue rather than cast into it.
   * A seventh stage added to the journey before this file knows about it
   * produces 'stage-7', which has no words in either language; it is dropped
   * silently here rather than reaching a notification as a bare code.
   */
  for (const stage of facts.stagesReached) {
    const code = `stage-${stage}`;
    if (isMilestoneCode(code)) earned.add(code);
  }

  const gap = facts.longestGapDays;
  if (typeof gap === 'number' && Number.isFinite(gap) && gap >= RETURN_GAP_DAYS) {
    earned.add('returned');
  }

  /*
   * The whole path, from stage_progress rather than from a journey view.
   *
   * A stage with no requirements configured computes as one hundred per cent —
   * nought of nought required items are met — and every stage of the
   * association's journey is unconfigured today. Reading completion from that
   * would congratulate all thirty-seven volunteers on finishing a path nobody
   * has defined. A row in stage_progress is a decision somebody recorded, so
   * it cannot be produced by an empty configuration.
   */
  const total = facts.stagesTotal;
  if (typeof total === 'number' && total > 0) {
    const distinct = new Set(facts.stagesReached.filter((s) => s >= 1 && s <= total));
    if (distinct.size >= total) earned.add('path-complete');
  }

  return MILESTONE_CODES.filter((code) => earned.has(code));
}
