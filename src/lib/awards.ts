/**
 * The monthly awards: who may be nominated, how a shortlist is ordered, and
 * what a public page is allowed to say afterwards.
 *
 * THE CENTRAL RULE, and the reason nothing in this file is called `award`:
 * the system nominates, a person decides. Every function here stops at a
 * shortlist. There is no `pickWinner`, no `topOne`, no tie-break that resolves
 * to a single candidate — `shortlist` returns five people and their figures
 * and then this module has nothing further to say. Choosing is done by a human
 * being in src/lib/actions/awards.ts, against a capability, with a written
 * reason, and it is recorded with their name on it.
 *
 * That is not a stylistic preference. An award that fell out of an ORDER BY is
 * a leaderboard with a rosette on it: it rewards whoever had the most free
 * time this month, it cannot see the volunteer who did one difficult thing
 * well, and the first time it picks somebody the association would not have
 * picked, nobody can explain why it did.
 *
 * WHAT THIS FILE MUST NEVER PRODUCE
 *
 * A loser. Five people are shortlisted and one is chosen; the other four did
 * nothing wrong. `honoursView` — the only function here that builds something
 * for a public page — takes decided awards and nothing else. It cannot be
 * handed a shortlist, there is no user id anywhere in its output type, and
 * scripts/probe-recognition-awards proves that a nominee who was not chosen
 * appears nowhere in what it returns. See migration 036 for why no shortlist
 * is ever written down.
 *
 * PURE. No 'server-only', no database, no clock, no React. The caller passes
 * the period and the facts in. The cooling-off rule and the six-month
 * boundaries are the two things here that must be provably right, and proving
 * them must not require a server or a fixture.
 *
 * DATES AND PERIODS ARE TEXT
 *
 * A period is 'YYYY-MM' and a date is 'YYYY-MM-DD', and every comparison in
 * this file is a string comparison. The database session runs GMT and the
 * association is in Beirut: `new Date('2026-08-01')` is 02:00 on the 1st in
 * Beirut, and read back out it is the 31st of July for the two hours before
 * that. A month boundary got from a clock hands the first two hours of every
 * month to the month before. Text never has that problem, and 'YYYY-MM' sorts
 * correctly as text for every month this association will ever see.
 *
 * The calendar arithmetic borrows `daysInMonth` and `isIsoDate` from
 * src/lib/challenges.ts rather than restating them — a second month-length
 * table is a second thing to get February wrong in.
 */

import { daysInMonth, isIsoDate } from './challenges';
import { POINTS, pointsForMinutes } from './impact';

// --------------------------------------------------------------- the awards

/**
 * The four. Stored as text with a CHECK in migration 036; this list and that
 * constraint are one rule written twice, and either drifting means the other
 * is not enforcing what it appears to.
 */
export type AwardKind =
  /** Joined more than six months ago and gave to this month. */
  | 'volunteer_of_the_month'
  /** Joined within the last six months and has already shown up. */
  | 'rising_star'
  /** Holds the continuity badge and is still active this month. */
  | 'continuity_maker'
  /** A committee, ranked by what its active members averaged. */
  | 'team_of_the_month';

export const AWARD_KINDS: readonly AwardKind[] = [
  'volunteer_of_the_month',
  'rising_star',
  'continuity_maker',
  'team_of_the_month',
] as const;

/** The three that name a person. The fourth names a committee. */
export const PERSON_AWARDS: readonly AwardKind[] = [
  'volunteer_of_the_month',
  'rising_star',
  'continuity_maker',
] as const;

export function isAwardKind(value: unknown): value is AwardKind {
  return typeof value === 'string' && (AWARD_KINDS as readonly string[]).includes(value);
}

export function isPersonAward(award: AwardKind): boolean {
  return award !== 'team_of_the_month';
}

// ------------------------------------------------------------- the numbers

/**
 * How many months a winner sits out.
 *
 * Three, and it is the point of the whole feature rather than a detail of it.
 * Without it the same four hard-working people win every month, which the
 * association has watched happen with its own paper certificates: recognition
 * that always lands on the same shoulders stops being recognition and starts
 * being a fixture, and everybody else stops reading the page.
 */
export const COOLING_OFF_MONTHS = 3;

/**
 * The line between a volunteer and a newcomer, in months.
 *
 * Volunteer of the Month asks for more than six months; Rising Star asks for
 * six or fewer. The two tests are exact complements on purpose — see
 * `joinedLongAgo` — so no volunteer is eligible for both and none falls into a
 * gap between them.
 */
export const MEMBERSHIP_MONTHS = 6;

/** How many people a shortlist holds. Five, so a decision is a choice. */
export const SHORTLIST = 5;

/**
 * The floor a committee must clear to be ranked at all.
 *
 * Both halves are needed. Without a member floor, a committee with one active
 * person and a good month has an unbeatable average and «فريق الشهر» becomes
 * an award to an individual under a group's name. Without an activity floor, a
 * three-person committee that turned up once between them outranks one that
 * ran a fortnight of distributions, because two data points are not a month.
 */
export const TEAM_MIN_ACTIVE_MEMBERS = 3;
export const TEAM_MIN_ATTENDANCES = 5;

// -------------------------------------------------------------- period text

const PERIOD = /^(\d{4})-(0[1-9]|1[0-2])$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True for a well-formed 'YYYY-MM'. */
export function isPeriod(value: unknown): value is string {
  return typeof value === 'string' && PERIOD.test(value);
}

/** The period a 'YYYY-MM-DD' belongs to. Text sliced, never parsed. */
export function periodOf(isoDate: string): string | null {
  if (!isIsoDate(isoDate)) return null;
  return isoDate.slice(0, 7);
}

/** A period as a count of months since year 0, for subtracting one from another. */
function periodNumber(period: string): number | null {
  const m = PERIOD.exec(period ?? '');
  if (!m) return null;
  return Number(m[1]) * 12 + (Number(m[2]) - 1);
}

function periodFromNumber(n: number): string {
  const year = Math.floor(n / 12);
  const month = (n % 12) + 1;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`;
}

/** Whole months from `from` to `to`. Negative when `to` is the earlier one. */
export function periodsBetween(from: string, to: string): number | null {
  const a = periodNumber(from);
  const b = periodNumber(to);
  if (a === null || b === null) return null;
  return b - a;
}

/** `n` months later, or earlier when `n` is negative. Null on nonsense in. */
export function shiftPeriod(period: string, n: number): string | null {
  const base = periodNumber(period);
  if (base === null || !Number.isInteger(n)) return null;
  const next = base + n;
  return next < 0 ? null : periodFromNumber(next);
}

/** The month before. What the staff page opens on: you judge a month once it is over. */
export function previousPeriod(period: string): string | null {
  return shiftPeriod(period, -1);
}

/**
 * The first and last calendar day of a period, inclusive, as text.
 *
 * The last day comes from the calendar table in challenges.ts rather than from
 * `new Date(y, m, 0)`, which is midnight in whatever zone the server keeps and
 * is therefore the wrong day for the two hours after Beirut midnight.
 */
export function periodWindow(period: string): { startsOn: string; endsOn: string } | null {
  const m = PERIOD.exec(period ?? '');
  if (!m) return null;
  const last = daysInMonth(Number(m[1]), Number(m[2]));
  return { startsOn: `${period}-01`, endsOn: `${period}-${String(last).padStart(2, '0')}` };
}

/**
 * A date `n` months away, clamped to the end of the month it lands in.
 *
 * Six months before the 31st of August 2026 is the 28th of February — not the
 * 31st, which does not exist, and not the 3rd of March, which is what adding
 * and normalising would silently produce. The clamp is what makes the
 * six-month boundary land on a real day for every month of the year.
 */
export function shiftMonthsOnDate(isoDate: string, n: number): string | null {
  const m = ISO_DATE.exec(isoDate ?? '');
  if (!m || !isIsoDate(isoDate) || !Number.isInteger(n)) return null;
  const target = Number(m[1]) * 12 + (Number(m[2]) - 1) + n;
  if (target < 0) return null;
  const year = Math.floor(target / 12);
  const month = (target % 12) + 1;
  const day = Math.min(Number(m[3]), daysInMonth(year, month));
  return (
    `${String(year).padStart(4, '0')}-` +
    `${String(month).padStart(2, '0')}-` +
    `${String(day).padStart(2, '0')}`
  );
}

// ------------------------------------------------------------ the criteria

/**
 * Everything the shortlist needs to know about one candidate, and nothing it
 * does not.
 *
 * There is no name here, no photograph, no date of birth and no email. This
 * module decides who may be *considered*; the page that renders the shortlist
 * fetches the identity separately, and consent has already been resolved into
 * a single boolean before anything reaches here — see `consentShows`.
 */
export type NomineeFacts = {
  userId: string;
  /** Currently a volunteer. Lapsed standing is not eligible for anything. */
  isVolunteer: boolean;
  /**
   * The association's own join date, 'YYYY-MM-DD', or null when it has none.
   *
   * Null is eligible for NEITHER of the two tenure awards, which is the
   * protective answer in both directions: it cannot be shown that they joined
   * more than six months ago, and it cannot be shown that they joined within
   * the last six either. Guessing would put a fifteen-year member in the
   * newcomers' award or a newcomer in the veterans'.
   */
  joinedOn: string | null;
  /** Verified minutes worked inside the period. Pending and rejected earn nothing. */
  verifiedMinutes: number;
  /** Attendances confirmed by somebody else inside the period. */
  attendances: number;
  /** Live badge codes. Read for 'continuity-maker' and nothing else. */
  badges: readonly string[];
  /**
   * The most recent period in which this person won ANY of the monthly awards,
   * or null.
   *
   * Any, not just this one. The rule exists to spread recognition around, and
   * a volunteer who was «نجم صاعد» in June is not short of recognition in
   * August — reading it per-award would let the same person collect two
   * rosettes in a quarter, which is precisely the fixture the cooling-off is
   * there to prevent.
   */
  lastWonPeriod: string | null;
  /**
   * Whether a public page may name this person at all — the answer from
   * `publicIdentity` in src/lib/visibility.ts, resolved by the caller.
   *
   * A criterion for nomination and not only for display, deliberately.
   * Shortlisting somebody the honours page could never name sets a decision up
   * to disappear: the committee chooses them, the badge is granted, and the
   * page they were told to look at does not have them on it.
   *
   * It is re-asked at render time as well. Consent can be withdrawn after an
   * award is given, and when it is, the honours page falls silent about that
   * person — see `publicAward`.
   */
  consentShows: boolean;
};

/** Did they actually do something this month that somebody else verified. */
export function hasVerifiedActivity(f: Pick<NomineeFacts, 'verifiedMinutes' | 'attendances'>): boolean {
  const minutes = Number.isFinite(f.verifiedMinutes) ? f.verifiedMinutes : 0;
  const attended = Number.isFinite(f.attendances) ? f.attendances : 0;
  return minutes > 0 || attended > 0;
}

/**
 * Joined more than six months before the end of the period being judged.
 *
 * Measured against the LAST DAY OF THE MONTH BEING AWARDED, never against
 * today. August's award is August's award whether it is decided on the 31st of
 * August or in the middle of October, and a tenure measured from the click
 * would move somebody out of Rising Star because the committee met late.
 *
 * `false` for a missing or unreadable join date, and `joinedLongAgo` and
 * `joinedRecently` are therefore NOT negations of each other — an unknown date
 * is refused by both. That is the whole reason they are two functions rather
 * than one and its `!`.
 */
export function joinedLongAgo(joinedOn: string | null, period: string): boolean {
  const window = periodWindow(period);
  if (!window || !isIsoDate(joinedOn ?? '')) return false;
  const cutoff = shiftMonthsOnDate(window.endsOn, -MEMBERSHIP_MONTHS);
  if (!cutoff) return false;
  // Strictly earlier: exactly six months is six months, not more than six.
  return (joinedOn as string) < cutoff;
}

/**
 * Joined within the last six months, counted to the end of the period.
 *
 * The upper bound matters as much as the lower one: a join date after the
 * month being judged is a data error, and without the second test it would
 * make somebody a Rising Star for a month they had not joined for.
 */
export function joinedRecently(joinedOn: string | null, period: string): boolean {
  const window = periodWindow(period);
  if (!window || !isIsoDate(joinedOn ?? '')) return false;
  const cutoff = shiftMonthsOnDate(window.endsOn, -MEMBERSHIP_MONTHS);
  if (!cutoff) return false;
  const joined = joinedOn as string;
  return joined >= cutoff && joined <= window.endsOn;
}

/**
 * Whether the cooling-off period has passed.
 *
 * Symmetric on purpose. A win three months either side of this period blocks
 * it, so backfilling an old month cannot slip a second rosette in behind a
 * recent one. Three months' distance is not enough; four is — a win in May
 * blocks June, July and August, and the volunteer is eligible again in
 * September.
 *
 * An unreadable stored period blocks rather than allows. Failing open here
 * would mean a corrupted row silently switches the rule off for one person.
 */
export function coolingOffPassed(lastWonPeriod: string | null, period: string): boolean {
  if (lastWonPeriod === null || lastWonPeriod === '') return true;
  const gap = periodsBetween(lastWonPeriod, period);
  if (gap === null) return false;
  return Math.abs(gap) > COOLING_OFF_MONTHS;
}

/** The badge Continuity Maker of the Month is built on. Granted by the engine. */
export const CONTINUITY_BADGE = 'continuity-maker';

/**
 * Whether this person may be shortlisted for this award in this period.
 *
 * Everything is required together, and the order below is the order the
 * association would say it out loud: are they one of us, did they do something
 * this month, have they had their turn recently, and may we name them.
 */
export function eligibleFor(award: AwardKind, f: NomineeFacts, period: string): boolean {
  if (!isPeriod(period)) return false;
  if (award === 'team_of_the_month') return false; // a person is not a team
  if (!f.isVolunteer) return false;
  if (!hasVerifiedActivity(f)) return false;
  if (!coolingOffPassed(f.lastWonPeriod, period)) return false;
  if (!f.consentShows) return false;

  if (award === 'volunteer_of_the_month') return joinedLongAgo(f.joinedOn, period);
  if (award === 'rising_star') return joinedRecently(f.joinedOn, period);
  // continuity_maker: the badge already encodes "joined by the end of 2023 and
  // still here", and it is read rather than restated — see continuity-data.ts
  // for why a second copy of that rule would drift from the first.
  return f.badges.includes(CONTINUITY_BADGE);
}

// ---------------------------------------------------------------- ordering

/**
 * What a month of volunteering came to, in impact points.
 *
 * Reuses the association's existing points, so a shortlist cannot rank people
 * by one scale while their own account page shows them another. Hours are
 * apportioned over the month's total rather than rounded per entry — three
 * forty-minute entries are two hours, and rounding each one down would award
 * nothing at all. See src/lib/impact.ts.
 *
 * IT IS AN ORDERING, NOT A VERDICT. It decides which five names a human being
 * reads, and then it is finished. Nothing downstream may treat the highest
 * score as the winner, and nothing in this file does.
 */
export function monthScore(f: Pick<NomineeFacts, 'verifiedMinutes' | 'attendances'>): number {
  const minutes = Number.isFinite(f.verifiedMinutes) && f.verifiedMinutes > 0 ? f.verifiedMinutes : 0;
  const attended = Number.isFinite(f.attendances) && f.attendances > 0 ? Math.floor(f.attendances) : 0;
  return pointsForMinutes(minutes) + attended * POINTS.attendance;
}

/** One line of a shortlist: enough to recognise the month, and no identity. */
export type Nomination = {
  userId: string;
  score: number;
  verifiedMinutes: number;
  attendances: number;
};

/**
 * The five names a person will look at, highest first.
 *
 * Ties break on the user id, which is meaningless and therefore stable: a
 * shortlist that reordered itself between the page load and the press would
 * mean a coordinator approved a different row from the one they clicked. Where
 * fewer than five qualify, fewer than five are returned — padding the list
 * with people who do not meet the criteria is how an ineligible person gets
 * chosen.
 */
export function shortlist(
  award: AwardKind,
  candidates: readonly NomineeFacts[],
  period: string,
  limit = SHORTLIST,
): Nomination[] {
  return candidates
    .filter((f) => eligibleFor(award, f, period))
    .map((f) => ({
      userId: f.userId,
      score: monthScore(f),
      verifiedMinutes: Math.max(0, Math.floor(f.verifiedMinutes || 0)),
      attendances: Math.max(0, Math.floor(f.attendances || 0)),
    }))
    .sort((a, b) => (b.score - a.score) || (a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0))
    .slice(0, Math.max(0, limit));
}

// -------------------------------------------------------------------- teams

/**
 * A committee's month.
 *
 * `committee` is a HISTORICAL LABEL. It comes from volunteer_roster.committee,
 * which was filled by the 2024 import — 337 of the 457 lines carry one — and
 * nothing in this platform maintains it. It says which committee somebody was
 * on when the association last wrote its spreadsheet, not who is on one today.
 * The award is therefore to a name the association recognises rather than to a
 * live group, and migration 036 copies the text into the award row so it
 * survives the next re-import.
 *
 * `activeMembers` is the number of people carrying that label who actually did
 * something verified this month. It is NOT the size of the committee, and the
 * difference is the whole ranking: dividing by the roll would hand the award
 * to whichever committee had the most dormant names on it.
 */
export type TeamFacts = {
  committee: string;
  activeMembers: number;
  /** Verified minutes across the committee's active members, inside the period. */
  verifiedMinutes: number;
  /** Confirmed attendances across the committee's active members, inside the period. */
  attendances: number;
  /**
   * The last period this committee won Team of the Month, or null.
   *
   * The cooling-off applies to the committee as a unit, and only to the
   * committee: a member who wins «متطوّع الشهر» in June is not stopped from
   * being part of the team that wins in August, and being part of that team
   * does not use up their own turn either. Those are two different acts of
   * recognition — one names a person, one names a group — and letting either
   * consume the other's waiting period would mean a volunteer on an active
   * committee is quietly harder to recognise individually than one on a quiet
   * committee. See how `won` is built in lib/awards-data.ts: it reads only
   * rows that name a person, so a team award never enters a personal
   * cooling-off.
   */
  lastWonPeriod?: string | null;
};

/**
 * Whether a committee may be ranked at all.
 *
 * Read the two floors together with `teamAverage` below: qualification is
 * about being a team that had a month, and the ranking is about what that
 * month came to per person. Neither test alone is enough — see the constants.
 */
export function teamQualifies(t: TeamFacts): boolean {
  const members = Number.isFinite(t.activeMembers) ? t.activeMembers : 0;
  const attended = Number.isFinite(t.attendances) ? t.attendances : 0;
  return members >= TEAM_MIN_ACTIVE_MEMBERS && attended >= TEAM_MIN_ATTENDANCES;
}

/**
 * A committee's month per active member.
 *
 * AVERAGE, NEVER TOTAL, and this is the single most important line in the
 * file. Ranked by total, the biggest committee wins every month by existing:
 * the association's largest has roughly five times the members of its
 * smallest, and no amount of effort by four people beats twenty people turning
 * up once each. That would make «فريق الشهر» an award for being numerous, and
 * the small committees would correctly stop reading the page.
 *
 * Not floored. Two teams half a point apart are genuinely half a point apart,
 * and rounding here would manufacture ties that the tie-break then resolves
 * alphabetically — which is a different way of saying "the ordering was
 * decided by the name". The DISPLAY rounds; the comparison does not.
 *
 * Zero rather than Infinity when nothing is active. `teamQualifies` already
 * refuses that case; this is the belt to that brace, because Infinity sorts to
 * the top of any list it reaches.
 */
export function teamAverage(t: TeamFacts): number {
  const members = Number.isFinite(t.activeMembers) ? Math.floor(t.activeMembers) : 0;
  if (members <= 0) return 0;
  return monthScore(t) / members;
}

export type TeamNomination = {
  committee: string;
  /** Points per active member. Compare on this; round only to print it. */
  average: number;
  activeMembers: number;
  verifiedMinutes: number;
  attendances: number;
};

/**
 * The committees a person will look at, best average first.
 *
 * The same three gates the person awards use, in the same order: big enough to
 * be a team, active enough to have had a month, and not the committee that won
 * last time. Ties break on the committee name — meaningless, and therefore
 * stable between the page load and the press.
 */
export function shortlistTeams(
  teams: readonly TeamFacts[],
  period: string,
  limit = SHORTLIST,
): TeamNomination[] {
  if (!isPeriod(period)) return [];
  return teams
    .filter(teamQualifies)
    .filter((t) => coolingOffPassed(t.lastWonPeriod ?? null, period))
    .map((t) => ({
      committee: t.committee,
      average: teamAverage(t),
      activeMembers: Math.floor(t.activeMembers),
      verifiedMinutes: Math.max(0, Math.floor(t.verifiedMinutes || 0)),
      attendances: Math.max(0, Math.floor(t.attendances || 0)),
    }))
    .sort(
      (a, b) =>
        (b.average - a.average) ||
        (a.committee < b.committee ? -1 : a.committee > b.committee ? 1 : 0),
    )
    .slice(0, Math.max(0, limit));
}

// ------------------------------------------------------------ badge codes

/**
 * The prefix each award's badge carries. The month and year are appended, so a
 * badge says WHICH August it was for — 'award-volunteer-2026-08'.
 *
 * That matters more than it looks. `uq_achievement_live_once` is on
 * (user_id, code), so a single code per award would mean a two-time winner
 * cannot hold both, and the second grant would either fail or overwrite the
 * first — quietly taking a badge off somebody's wall to put an identical one
 * back. A code per month makes the two badges two rows, which is what they are.
 *
 * These codes are deliberately NOT in the ACHIEVEMENTS catalogue. The engine in
 * src/lib/achievements.ts iterates that catalogue and leaves codes it does not
 * recognise alone, so an award badge is never revoked by a recompute — which is
 * correct: no arithmetic can withdraw a decision a person made.
 */
export const AWARD_BADGE_PREFIX: Record<AwardKind, string> = {
  volunteer_of_the_month: 'award-volunteer',
  rising_star: 'award-rising-star',
  continuity_maker: 'award-continuity',
  team_of_the_month: 'award-team',
};

export function awardBadgeCode(award: AwardKind, period: string): string | null {
  if (!isAwardKind(award) || !isPeriod(period)) return null;
  return `${AWARD_BADGE_PREFIX[award]}-${period}`;
}

/** The reverse, so a badge on somebody's wall can name its own month. */
export function parseAwardBadgeCode(code: string): { award: AwardKind; period: string } | null {
  if (typeof code !== 'string') return null;
  for (const award of AWARD_KINDS) {
    const prefix = `${AWARD_BADGE_PREFIX[award]}-`;
    if (!code.startsWith(prefix)) continue;
    const period = code.slice(prefix.length);
    if (!isPeriod(period)) return null;
    return { award, period };
  }
  return null;
}

// ------------------------------------------------------- the public honours

/**
 * A decided award, with consent already resolved.
 *
 * `publicName` is the answer from `publicIdentity` — the exact string that may
 * be printed — or null when this person may not be named today. The caller
 * asks visibility.ts; nothing in this module decides visibility for itself,
 * and there is no birth date, no display name and no raw choice in this type
 * for it to decide from.
 */
export type AwardRecord = {
  period: string;
  award: AwardKind;
  /** The committee label, for the team award. Null for the three person awards. */
  team: string | null;
  /** Null when consent does not permit naming them today. */
  publicName: string | null;
  photo: boolean;
  /** The decider's own words. Published, and the staff form says so. */
  reason: string;
  minutes: number | null;
  attendances: number | null;
  activeMembers: number | null;
};

/**
 * What a public page may render of one award.
 *
 * THERE IS NO USER ID IN THIS TYPE, and that is the guarantee rather than an
 * oversight. A page holding an id ends up putting it in a link, a key or a
 * data attribute, and an id is a handle onto a person who asked to be listed
 * under a name of their own. What is left is a name that has already been
 * approved for publication and figures that belong to the month.
 */
export type PublicAward = {
  award: AwardKind;
  period: string;
  /** Already permitted: a legal name, a chosen name, or a committee label. */
  name: string;
  photo: boolean;
  reason: string;
  minutes: number | null;
  attendances: number | null;
  activeMembers: number | null;
};

/**
 * One award as it may be published, or nothing.
 *
 * A person whose consent no longer permits naming them is dropped entirely
 * rather than rendered as "name withheld". A withheld line is still a
 * disclosure: it says a specific month had a specific winner who did not want
 * to be named, and in an association of four hundred people where the award
 * was read out at a meeting, that narrows to one person. Silence says less.
 */
export function publicAward(record: AwardRecord): PublicAward | null {
  if (!isAwardKind(record.award) || !isPeriod(record.period)) return null;

  const name = isPersonAward(record.award)
    ? (record.publicName ?? '').trim()
    : (record.team ?? '').trim();
  if (!name) return null;

  return {
    award: record.award,
    period: record.period,
    name,
    // A committee is a label, not a face: there is no photograph to show and
    // no consent behind one, so the team award never carries one.
    photo: isPersonAward(record.award) ? record.photo === true : false,
    reason: String(record.reason ?? '').trim(),
    minutes: record.minutes,
    attendances: record.attendances,
    activeMembers: record.activeMembers,
  };
}

export type HonourMonth = { period: string; awards: PublicAward[] };

/**
 * The honours page: this month's winners, and every month before it.
 *
 * `current` is the most recent period that has anything publishable in it, not
 * "the calendar month we are in". A page whose headline block empties out on
 * the 1st and refills whenever the committee next meets looks broken; the last
 * decided month stays at the top until it is replaced.
 *
 * Awards inside a month are ordered by AWARD_KINDS rather than by any figure,
 * so the four always read in the same sequence and nothing about the ordering
 * can be mistaken for a ranking between them.
 */
export function honoursView(records: readonly AwardRecord[]): {
  current: HonourMonth | null;
  archive: HonourMonth[];
} {
  const byPeriod = new Map<string, PublicAward[]>();
  for (const record of records) {
    const shown = publicAward(record);
    if (!shown) continue;
    const list = byPeriod.get(shown.period) ?? [];
    list.push(shown);
    byPeriod.set(shown.period, list);
  }

  const months: HonourMonth[] = [...byPeriod.entries()]
    .map(([period, awards]) => ({
      period,
      awards: awards.sort((a, b) => AWARD_KINDS.indexOf(a.award) - AWARD_KINDS.indexOf(b.award)),
    }))
    // Newest first, as text. 'YYYY-MM' sorts correctly and no Date is built.
    .sort((a, b) => (a.period < b.period ? 1 : a.period > b.period ? -1 : 0));

  return { current: months[0] ?? null, archive: months.slice(1) };
}
