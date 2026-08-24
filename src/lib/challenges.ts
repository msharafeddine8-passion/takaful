/**
 * Group challenges: the arithmetic, and the rule about whose figure is shown.
 *
 * Pure on purpose, and deliberately free of `server-only`. The account panel,
 * the staff listing and the probe all have to agree about whether a challenge
 * is running, how full its bar is and what a volunteer is told about their own
 * part in it. The only way to guarantee they agree is for all three to call
 * these functions rather than each working it out from starts_on, ends_on and
 * a total.
 *
 * TWO THINGS THIS FILE EXISTS TO PREVENT
 *
 * A bar past the end. `total / target` is not a percentage: the target can be
 * zero, the total can arrive as NaN from a driver handing back a bigint as a
 * string, and a community that beats its goal by half would otherwise get a
 * bar drawn 150% of the way across its own box.
 *
 * A person made visible. Everything about an individual passes through
 * `ownContribution`, which answers `null` for anybody who has contributed
 * nothing. There is no state in this module in which a volunteer is told they
 * gave nothing, and no function here takes more than one person's figure - so
 * there is nothing to sort, and nothing to compare.
 *
 * DATES ARE TEXT
 *
 * Every date in and out of this file is 'YYYY-MM-DD' and every comparison is a
 * string comparison. `new Date('2026-08-01')` is midnight GMT, which is
 * 02:00 on the 1st in Beirut - or, read back out, the 31st of July for the
 * two hours before that. That has caused real bugs here; see src/lib/when.ts
 * and its beirutToday(), which is where the caller gets "today" from.
 */

/** What a challenge counts. Each is backed by a fact somebody verified. */
export type ChallengeMetric =
  /** Minutes on hour_entries with status 'verified'. */
  | 'verified_minutes'
  /** Rows on activity_attendance where attended. */
  | 'attendances'
  /** Certificates issued and not revoked. */
  | 'certificates'
  /** Activities the association ran. */
  | 'activities';

export const CHALLENGE_METRICS: readonly ChallengeMetric[] = [
  'verified_minutes',
  'attendances',
  'certificates',
  'activities',
] as const;

export function isChallengeMetric(value: unknown): value is ChallengeMetric {
  return typeof value === 'string' && (CHALLENGE_METRICS as readonly string[]).includes(value);
}

/**
 * A challenge as the arithmetic needs it. Deliberately not the database row:
 * the row carries names, descriptions and an audit trail that none of this
 * cares about, and taking the whole row would let a display concern creep in
 * here later.
 */
export type ChallengeFacts = {
  metric: ChallengeMetric;
  /** In the metric base unit - minutes for verified_minutes, a count otherwise. */
  target: number;
  /** Inclusive, Beirut calendar day, 'YYYY-MM-DD'. */
  startsOn: string;
  /** Inclusive, Beirut calendar day, 'YYYY-MM-DD'. */
  endsOn: string;
  isActive: boolean;
  /** Set once retired. A challenge is archived, never deleted. */
  isArchived: boolean;
};

export type ChallengeStatus = 'archived' | 'ended' | 'paused' | 'upcoming' | 'running';

// ------------------------------------------------------------------- dates

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True for a well-formed 'YYYY-MM-DD'. Text in, text out, no Date anywhere. */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const [, y, mo, d] = m;
  const month = Number(mo);
  const day = Number(d);
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(Number(y), month);
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** Days in a calendar month. A table and the leap rule, so no Date is built. */
export function daysInMonth(year: number, month: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) return 0;
  if (month === 2 && isLeapYear(year)) return 29;
  return MONTH_LENGTHS[month - 1];
}

/**
 * A date as a day count, for subtracting one date from another.
 *
 * Date.UTC takes numbers, not a string: it is arithmetic over a proleptic
 * Gregorian calendar with no zone and no parsing, which is exactly what is
 * wanted. The forbidden thing is `new Date('2026-08-01')`, which guesses.
 */
function dayNumber(iso: string): number | null {
  if (!isIsoDate(iso)) return null;
  const [, y, mo, d] = ISO_DATE.exec(iso)!;
  return Date.UTC(Number(y), Number(mo) - 1, Number(d)) / 86_400_000;
}

/** Whole days from `from` to `to`, negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const a = dayNumber(from);
  const b = dayNumber(to);
  if (a === null || b === null) return 0;
  return b - a;
}

/**
 * The first and last day of the Beirut month containing `today`.
 *
 * This is what "reach 500 verified hours this month" means, and it is the
 * whole reason the caller must pass beirutToday() rather than anything derived
 * from the server or the database clock. Both ends are inclusive, both are
 * plain text, and the last day comes from the calendar table above rather than
 * from `new Date(y, m, 0)` - which is midnight in the runtime's own zone and
 * therefore the wrong day for the two hours after Beirut midnight.
 */
export function beirutMonthWindow(today: string): { startsOn: string; endsOn: string } | null {
  if (!isIsoDate(today)) return null;
  const [, y, mo] = ISO_DATE.exec(today)!;
  const last = daysInMonth(Number(y), Number(mo));
  return {
    startsOn: `${y}-${mo}-01`,
    endsOn: `${y}-${mo}-${String(last).padStart(2, '0')}`,
  };
}

// ----------------------------------------------------------------- status

/**
 * Where a challenge stands on a given day.
 *
 * The order is the point. Archived outranks everything, because a retired
 * challenge is retired whatever its dates say. Then the window: a challenge
 * whose last day has passed has *ended*, and saying "paused" about it would
 * suggest it might come back. Only then does the pause flag apply, and only
 * then the start date.
 */
export function challengeStatus(c: ChallengeFacts, today: string): ChallengeStatus {
  if (c.isArchived) return 'archived';
  // An unreadable date is treated as not running rather than as running:
  // a bar nobody can explain is worse than no bar.
  if (!isIsoDate(today) || !isIsoDate(c.startsOn) || !isIsoDate(c.endsOn)) return 'ended';
  if (today > c.endsOn) return 'ended';
  if (!c.isActive) return 'paused';
  if (today < c.startsOn) return 'upcoming';
  return 'running';
}

/** Whether the association is counting towards this challenge today. */
export function isRunning(c: ChallengeFacts, today: string): boolean {
  return challengeStatus(c, today) === 'running';
}

/**
 * Whole days left, counting today.
 *
 * Inclusive, so the last day reads "1 day left" rather than "0 days left" to
 * somebody who still has the whole evening to work. A challenge that has not
 * started yet counts from its first day, not from today - otherwise a goal
 * opening next month would advertise a length it does not have.
 */
export function daysRemaining(c: ChallengeFacts, today: string): number {
  const status = challengeStatus(c, today);
  if (status === 'archived' || status === 'ended') return 0;
  const from = today > c.startsOn ? today : c.startsOn;
  return Math.max(0, daysBetween(from, c.endsOn) + 1);
}

// ------------------------------------------------------------- percentages

/**
 * How full the bar is, 0 to 100.
 *
 * Floored, not rounded: 99.6% of the way to 500 hours is not 500 hours, and a
 * bar that reads 100 beside a total that has not reached the target is the
 * kind of small lie that costs a figure its credibility. `isComplete` is the
 * separate, honest answer to "did we get there?".
 *
 * A target of zero returns 0 rather than NaN or Infinity. The database refuses
 * a target of zero, so this is the belt to that brace - and NaN reaching a
 * style attribute renders as a bar of no width with no error anywhere.
 */
export function percentComplete(total: number, target: number): number {
  if (!Number.isFinite(total) || !Number.isFinite(target)) return 0;
  if (target <= 0 || total <= 0) return 0;
  return Math.min(100, Math.floor((total / target) * 100));
}

export function isComplete(total: number, target: number): boolean {
  if (!Number.isFinite(total) || !Number.isFinite(target) || target <= 0) return false;
  return total >= target;
}

/** How much is still to do. Never negative: past the goal, nothing is owed. */
export function remainingToTarget(total: number, target: number): number {
  if (!Number.isFinite(total) || !Number.isFinite(target) || target <= 0) return 0;
  return Math.max(0, target - Math.max(0, total));
}

// ------------------------------------------------------------------ units

/**
 * The base unit each metric is stored and counted in.
 *
 * Hours are the odd one out: hour_entries stores minutes, so the target is
 * stored in minutes too and the form does the conversion. A target held in a
 * different unit from the source is the sort of mistake that reads perfectly
 * well right up until somebody divides.
 */
export const METRIC_BASE_UNIT: Record<ChallengeMetric, 'minutes' | 'count'> = {
  verified_minutes: 'minutes',
  attendances: 'count',
  certificates: 'count',
  activities: 'count',
};

/** What a coordinator types, in the metric's base unit. Hours become minutes. */
export function targetFromInput(metric: ChallengeMetric, entered: number): number | null {
  if (!Number.isFinite(entered) || entered <= 0) return null;
  const whole = Math.floor(entered);
  if (whole <= 0) return null;
  return METRIC_BASE_UNIT[metric] === 'minutes' ? whole * 60 : whole;
}

/**
 * A base-unit figure as the number to print beside its label.
 *
 * Floored for the same reason the percentage is: 499 hours and 50 minutes is
 * 499 hours done, and printing 500 beside a bar that is not full contradicts
 * the bar standing next to it.
 */
export function toDisplayValue(metric: ChallengeMetric, base: number): number {
  if (!Number.isFinite(base) || base <= 0) return 0;
  return METRIC_BASE_UNIT[metric] === 'minutes' ? Math.floor(base / 60) : Math.floor(base);
}

// ---------------------------------------------------------------- privacy

/**
 * A volunteer's own part in a challenge, or nothing at all.
 *
 * The single gate every personal figure passes through, and the reason it
 * returns `null` rather than 0: "you contributed 0 hours" is a sentence the
 * platform must never form. Somebody who could not give time this month - who
 * was ill, or working, or caring for somebody - opens the page and sees the
 * community total and nothing about themselves, which is exactly what a person
 * in that position should see.
 *
 * It takes one figure. Not a list, not a map of user ids: there is nothing
 * here to rank, and nothing here that could accidentally be rendered for
 * somebody other than the person asking.
 */
export function ownContribution(mine: number): number | null {
  if (!Number.isFinite(mine) || mine <= 0) return null;
  return Math.floor(mine);
}

/**
 * Everything a challenge card shows, worked out in one place.
 *
 * `yourContribution` is the only field about the viewer, and every other field
 * is identical for everybody looking at the same challenge - which is the
 * property that makes this safe to render: no arrangement of these numbers
 * tells one volunteer anything about another.
 */
export type ChallengeView = {
  status: ChallengeStatus;
  /** Community total, base units. */
  total: number;
  /** Community total, display units - hours for a minutes metric. */
  totalDisplay: number;
  /** Target, base units. */
  target: number;
  targetDisplay: number;
  percent: number;
  complete: boolean;
  /** Still to do, display units. */
  remainingDisplay: number;
  daysLeft: number;
  /** The viewer's own figure in display units, or null when it is nothing. */
  yourContribution: number | null;
};

export function viewOf(
  c: ChallengeFacts,
  communityTotal: number,
  myContribution: number,
  today: string,
): ChallengeView {
  const total = Number.isFinite(communityTotal) && communityTotal > 0 ? communityTotal : 0;
  const mine = ownContribution(myContribution);
  return {
    status: challengeStatus(c, today),
    total,
    totalDisplay: toDisplayValue(c.metric, total),
    target: c.target,
    targetDisplay: toDisplayValue(c.metric, c.target),
    percent: percentComplete(total, c.target),
    complete: isComplete(total, c.target),
    remainingDisplay: toDisplayValue(c.metric, remainingToTarget(total, c.target)),
    daysLeft: daysRemaining(c, today),
    /* Display units, and null when there is nothing to say. A volunteer with
     * 40 verified minutes towards an hours challenge sees no line rather than
     * "0 hours" - the second is worse than silence. */
    yourContribution: mine === null ? null : (toDisplayValue(c.metric, mine) || null),
  };
}

/**
 * Whether a challenge belongs on the volunteer's account page.
 *
 * Running and upcoming only. A paused challenge is one the association is
 * thinking about, and an ended one is a bar nobody can move - shown on a
 * dashboard it reads as a task that was missed.
 */
export function showsOnAccount(c: ChallengeFacts, today: string): boolean {
  const status = challengeStatus(c, today);
  return status === 'running' || status === 'upcoming';
}
