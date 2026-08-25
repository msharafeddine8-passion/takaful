/**
 * The impact boards: who is shown, in what order, and what a person is told
 * about themselves.
 *
 * A leaderboard is the most dangerous page this platform has. «صنّاع
 * الاستمرارية» publishes people and says out loud that it is not a ranking;
 * this one IS a ranking, read by four hundred volunteers who know each other.
 * Everything below exists because of one of the following, and none of them is
 * a styling decision:
 *
 *   NOBODY IS LISTED WITHOUT CONSENT. lib/visibility.ts decides, exactly as it
 *   does for the page of thanks. Silence is a no and a minor is protected
 *   whatever they chose. This module never reads a birth date for any other
 *   purpose and never carries one outward.
 *
 *   OPTING OUT IS NOT OPTING OUT OF KNOWING. Somebody who declined to be
 *   listed still sees their own position, their own figure and how far they
 *   are from tenth. That is the whole of `seesOwnStanding` in visibility.ts,
 *   and it is honoured by putting the viewer into the ranked set whether or
 *   not they may be displayed.
 *
 *   THERE IS NO LAST PLACE. Not "we do not render it" — there is nowhere for
 *   one to live. Nothing in `Board`, `BoardEntry` or `OwnStanding` counts the
 *   people on the board, and the output is provably unchanged by adding
 *   somebody below the cut (scripts/probe-leaderboard holds that directly). A
 *   figure of zero is not a position at all: a person who did nothing in the
 *   window is absent from the ranking rather than at the bottom of it.
 *
 *   NOTHING DIMINISHES. No deltas, no movement, no "you dropped": this module
 *   never sees a previous window, so there is no arithmetic here that could
 *   produce one. No absence count, no rejected hours, no admin note — none of
 *   those has a field to travel in.
 *
 *   EQUAL FIGURES ARE EQUAL. Competition ranking, so 1, 2, 2, 4. Tied people
 *   are ordered by name, which is a reading order and not a placing, and they
 *   carry `tied` so the page can say so rather than letting the reader infer
 *   an order from the rows.
 *
 * DATES ARE TEXT, ALWAYS. Every boundary is computed from a YYYY-MM-DD string
 * by integer arithmetic and compared as text. No Date is constructed anywhere
 * in this file. The database session runs GMT and the association lives in
 * Beirut, so an instant made from a date is the previous day for anything
 * after ten in the evening — which would move an entry into the wrong week,
 * and on the first of January into the wrong year.
 *
 * PURE. No 'server-only', no database, no clock — the caller passes today in.
 * scripts/probe-leaderboard exercises all of it without a server.
 */

import {
  publicIdentity,
  treatAsMinor,
  visibilityFrom,
  type PublicIdentity,
} from './visibility';

/* --------------------------------------------------------------- calendar */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const pad2 = (n: number) => String(n).padStart(2, '0');
const pad4 = (n: number) => String(n).padStart(4, '0');

/**
 * A date as a count of days from 1970-01-01, by integer arithmetic alone.
 *
 * This is Howard Hinnant's days_from_civil, and it is here instead of `new
 * Date(iso)` for the reason in the header: a Date carries a timezone and a
 * boundary computed in the wrong one puts a Sunday evening's work into next
 * week. Integers have no timezone. Returns null for anything that is not a
 * plain YYYY-MM-DD, so a timestamp is refused rather than silently truncated.
 */
function dayNumber(iso: string | null | undefined): number | null {
  const s = String(iso ?? '').trim();
  if (!ISO_DATE.test(s)) return null;
  const m = Number(s.slice(5, 7));
  const d = Number(s.slice(8, 10));
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  // March-based year, so the leap day is the last day of the cycle and needs
  // no special case anywhere below.
  const y = Number(s.slice(0, 4)) - (m <= 2 ? 1 : 0);
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** The reverse. Together with dayNumber this is the only date arithmetic here. */
function isoFromDayNumber(n: number): string {
  const z = n + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365,
  );
  const y = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp + (mp < 10 ? 3 : -9);
  return `${pad4(y + (m <= 2 ? 1 : 0))}-${pad2(m)}-${pad2(d)}`;
}

/** Days in a month, as the difference between two first-of-months. */
function daysInMonth(year: number, month: number): number {
  const next = month === 12 ? `${pad4(year + 1)}-01-01` : `${pad4(year)}-${pad2(month + 1)}-01`;
  return (dayNumber(next) as number) - (dayNumber(`${pad4(year)}-${pad2(month)}-01`) as number);
}

/**
 * The same day, `months` calendar months earlier, with the day clamped.
 *
 * Clamping is the whole reason this is not `n * 30 days`. The last day of
 * August, three months back, is 31 May; the last day of May, three months
 * back, is 31 February, which does not exist. Clamping to the 28th or 29th is
 * what a person means by "three months ago" and what a naive subtraction gets
 * wrong exactly once a quarter.
 */
export function monthsBefore(today: string, months: number): string | null {
  if (dayNumber(today) === null) return null;
  const y0 = Number(today.slice(0, 4));
  const m0 = Number(today.slice(5, 7));
  const d0 = Number(today.slice(8, 10));
  const absoluteMonth = y0 * 12 + (m0 - 1) - months;
  const y = Math.floor(absoluteMonth / 12);
  const m = (absoluteMonth % 12) + 1;
  return `${pad4(y)}-${pad2(m)}-${pad2(Math.min(d0, daysInMonth(y, m)))}`;
}

/**
 * Monday of the week `today` falls in.
 *
 * Monday because the association's working week is Monday to Friday and its
 * weekend is Saturday and Sunday; a volunteer asking "what did I do this week"
 * on a Sunday means the days behind them, not a week that started that
 * morning. 1970-01-01 was a Thursday, which is where the 3 comes from.
 */
export function weekStart(today: string): string | null {
  const n = dayNumber(today);
  if (n === null) return null;
  return isoFromDayNumber(n - (((n % 7) + 7 + 3) % 7));
}

/* ---------------------------------------------------------------- windows */

export const WINDOW_KINDS = ['week', 'month', 'quarter', 'year', 'all'] as const;
export type WindowKind = (typeof WINDOW_KINDS)[number];
export const DEFAULT_WINDOW: WindowKind = 'month';

/** A query string is whatever somebody typed. Anything unknown is the default. */
export function parseWindow(value: unknown): WindowKind {
  return (WINDOW_KINDS as readonly string[]).includes(String(value))
    ? (value as WindowKind)
    : DEFAULT_WINDOW;
}

/** Inclusive at both ends. `from` is null only for all time. */
export type DateWindow = { from: string | null; to: string };

/**
 * The dates a window covers, in Beirut.
 *
 * `to` is always today and never the end of the period. A week that ran to
 * Sunday would count work dated Saturday next — nothing is dated in the future
 * today, but an hours entry may be logged for tomorrow (the schema allows
 * CURRENT_DATE + 1 for a shift that crosses midnight), and a board that
 * included it would move somebody up for work not yet done.
 *
 * Three of the five are calendar periods and one is rolling, because that is
 * what each label means: «هذا الشهر» is the month you are in, and «آخر ٣
 * أشهر» is the three months behind you. Saying so here rather than making them
 * uniform keeps each heading honest about what it counts.
 */
export function windowFor(kind: WindowKind, today: string): DateWindow {
  switch (kind) {
    case 'week':
      return { from: weekStart(today), to: today };
    case 'month':
      return { from: `${today.slice(0, 7)}-01`, to: today };
    case 'quarter':
      return { from: monthsBefore(today, 3), to: today };
    case 'year':
      return { from: `${today.slice(0, 4)}-01-01`, to: today };
    default:
      return { from: null, to: today };
  }
}

/** Whether a YYYY-MM-DD date falls inside a window. Text against text. */
export function withinWindow(date: string | null | undefined, w: DateWindow): boolean {
  const d = String(date ?? '').trim();
  if (!ISO_DATE.test(d)) return false;
  return (w.from === null || d >= w.from) && d <= w.to;
}

/* ----------------------------------------------------------------- boards */

export const BOARD_KINDS = ['active', 'learning', 'reliable', 'rising', 'overall'] as const;
export type BoardKind = (typeof BOARD_KINDS)[number];

/** Ten positions. By RANK, not by row count — see `buildBoard`. */
export const BOARD_SIZE = 10;

/**
 * Below this many resolved registrations, an attendance rate is noise.
 *
 * Somebody who signed up for one activity and came to it is not more reliable
 * than somebody who came to nineteen of twenty, and putting them above them
 * would be the board saying so. Ten is the number the reliability badge in
 * lib/achievements.ts already implies, and it is stated on the page so that an
 * absence from this board reads as "not enough to judge on" rather than as a
 * verdict.
 */
export const RELIABILITY_MIN = 10;

/** How recently somebody must have joined to be a rising star, in months. */
export const RISING_MONTHS = 6;

/**
 * One person's figures inside one window, as the query hands them over.
 *
 * Carries more than may ever be shown, and two fields in particular that must
 * never reach a `BoardEntry`: `resolved` and `turnedUp` exist only so the rate
 * can be divided out of them here. Their difference is that person's absence
 * count, which is precisely what the page may not print — see `figureFor`,
 * where the rate is rounded and the two counts are dropped.
 *
 * There is no field for pending hours, rejected hours, an admin note or a
 * suspension. The query does not select them and there is nowhere to put them.
 */
export type LeaderboardRow = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  /** profiles.public_visibility, from migration 033. Absent reads as hidden. */
  public_visibility?: string | null;
  /* The three birth dates, read once by treatAsMinor and carried no further. */
  sensitive_dob?: string | null;
  safeguarding_dob?: string | null;
  roster_dob?: string | null;
  /** 'YYYY-MM-DD'. The association's own join date where it has one. */
  joined_on: string | null;
  photo_version: string | null;
  /** Verified minutes worked in the window, net of corrections. */
  minutes: number | null;
  /** Activities attended in the window. */
  attended: number | null;
  /** Course certificates issued in the window and not since revoked. */
  certificates: number | null;
  /** Registrations in the window whose attendance was actually recorded. */
  resolved: number | null;
  /** How many of those they turned up to. */
  turnedUp: number | null;
  /** Net impact points earned in the window. */
  points: number | null;
};

/** What one row on a board may render. There is no field for anything else. */
export type BoardEntry = {
  id: string;
  /** Competition rank: 1, 2, 2, 4. Never an array index. */
  rank: number;
  /** The name visibility.ts permitted. An entry exists only when it did. */
  name: string;
  photo: boolean;
  photoVersion: string | null;
  /** The one number this board ranks on. Its unit belongs to the board. */
  figure: number;
  /** Context, never part of the ranking. Null on every board but 'active'. */
  secondary: number | null;
  /** True when somebody else holds the same rank. */
  tied: boolean;
  /** So the page can mark the reader's own row. Says nothing to anybody else. */
  isViewer: boolean;
};

/**
 * What the reader is told about themselves. Shown to them and to nobody else.
 *
 * There is no `of`, no `total` and no `outOf`, so «الثاني عشر» can never
 * become «الثاني عشر من ثمانية وثمانين» — which is how a position number
 * becomes a last place.
 */
export type OwnStanding = {
  rank: number;
  figure: number;
  tied: boolean;
  /**
   * The distance to tenth place, in this board's unit. Null when the reader is
   * already inside the ten.
   *
   * Always positive when present: equal figures share a rank, so anybody
   * ranked eleventh or lower is strictly behind the tenth figure.
   */
  toTenth: number | null;
};

/** One board. Three keys, and none of them counts anybody. */
export type Board = {
  board: BoardKind;
  entries: BoardEntry[];
  you: OwnStanding | null;
};

/**
 * The name this person may be shown under, or a refusal.
 *
 * The single call out to lib/visibility.ts, made once per person per build.
 * Nothing else in this module asks the question, so there is no route by which
 * a row could be listed without having been asked about.
 */
function listedIdentity(row: LeaderboardRow, today: string): PublicIdentity {
  return publicIdentity({
    choice: visibilityFrom(row.public_visibility),
    isMinor: treatAsMinor({
      sensitiveDob: row.sensitive_dob,
      safeguardingDob: row.safeguarding_dob,
      rosterDob: row.roster_dob,
      today,
    }),
    fullName: row.full_name ?? '',
    displayName: row.display_name,
  });
}

const int = (v: number | null | undefined) => (Number.isFinite(v) ? Math.trunc(v as number) : 0);

/**
 * The number a board ranks on, or null when this person does not belong on it.
 *
 * Null and zero are deliberately different. Null means "not on this board at
 * all" — nothing done in the window, too few registrations to judge, joined
 * too long ago to be rising — and somebody who is not on a board has no
 * position on it, which is the only honest alternative to putting them last.
 *
 * 'active' ranks on WHOLE VERIFIED HOURS and shows activities beside them
 * rather than adding the two together. An hour in the field and an attendance
 * are different things, and summing them fixes an exchange rate between them
 * that nobody agreed and that the page could not explain. Where a single
 * combined figure is wanted it already exists and is already defensible: the
 * impact ledger prices both, and that is the 'overall' board.
 *
 * 'reliable' returns a ROUNDED PERCENTAGE and drops the two counts it came
 * from. The denominator must not travel with it: «٩٠٪ من ٢٠» is nineteen
 * attendances and one absence to anybody who can subtract, and an absence is
 * exactly what this platform must never publish about a volunteer. Rounding
 * also puts real people on equal ranks, which is the right outcome — 17/19 and
 * 18/20 are the same person as far as a thank-you is concerned.
 */
export function figureFor(board: BoardKind, row: LeaderboardRow, today: string): number | null {
  switch (board) {
    case 'active': {
      /* Whole hours, not minutes. The page prints whole hours, and a sort that
       * ordered more finely than the page reads would publish the minutes:
       * position in the list is the ordering, and anybody can read it off. */
      const hours = Math.floor(int(row.minutes) / 60);
      return hours > 0 ? hours : null;
    }
    case 'learning': {
      const certificates = int(row.certificates);
      return certificates > 0 ? certificates : null;
    }
    case 'reliable': {
      const resolved = int(row.resolved);
      if (resolved < RELIABILITY_MIN) return null;
      const rate = Math.round((int(row.turnedUp) / resolved) * 100);
      return rate > 0 ? rate : null;
    }
    case 'rising': {
      const since = monthsBefore(today, RISING_MONTHS);
      const joined = String(row.joined_on ?? '').trim();
      /* An unreadable join date is not a rising star. Failing closed here
       * costs somebody a place on one board; failing open would put a
       * ten-year volunteer on a board named for newcomers. */
      if (since === null || !ISO_DATE.test(joined) || joined < since) return null;
      const points = int(row.points);
      return points > 0 ? points : null;
    }
    default: {
      const points = int(row.points);
      return points > 0 ? points : null;
    }
  }
}

/** Context beside the figure. Never ranked on, never a second sort key. */
function secondaryFor(board: BoardKind, row: LeaderboardRow): number | null {
  return board === 'active' ? int(row.attended) : null;
}

/**
 * One board, built.
 *
 * THE RANKED SET is everybody eligible whom visibility.ts allows to be listed,
 * PLUS the reader, listed or not. Two consequences that are the point of doing
 * it this way:
 *
 *   The shown ranks have no gaps that could point at somebody who is not
 *   there. Every ranked person is displayed except, possibly, the reader — so
 *   a missing position is always the reader's own, and they are told what it
 *   is on the same screen. Ranking against the whole association instead would
 *   leave holes at the positions of people who opted out, and a hole in a
 *   ranking is a person.
 *
 *   The reader's own number and their row in the list are the same number,
 *   because they come from the same ranking. Two universes would show a listed
 *   reader "third" in the table and "fifth" below it, and the difference would
 *   tell them how many people above them are hidden.
 *
 * TOP TEN IS BY RANK, NOT BY ROW COUNT. Eleven people who all did the same
 * amount of work all hold rank one, and all eleven are shown. Cutting the list
 * at ten rows would place two of them apart on identical figures, in whatever
 * order the sort happened to land on — which is the one thing a tie must never
 * do. Nobody with a rank past ten is ever shown.
 */
export function buildBoard(opts: {
  rows: readonly LeaderboardRow[];
  board: BoardKind;
  /** The signed-in reader. '' when there is none; then nothing is added. */
  viewerId: string;
  /** Today in Beirut, as YYYY-MM-DD. The caller owns the clock. */
  today: string;
}): Board {
  const { rows, board, viewerId, today } = opts;

  type Ranked = {
    row: LeaderboardRow;
    figure: number;
    identity: PublicIdentity;
    isViewer: boolean;
    /** What ties are ordered by. A reading order, never a placing. */
    sortName: string;
    rank: number;
  };

  const ranked: Ranked[] = [];
  for (const row of rows) {
    const figure = figureFor(board, row, today);
    if (figure === null) continue;
    const identity = listedIdentity(row, today);
    const isViewer = Boolean(viewerId) && row.id === viewerId;
    // Not listed and not the reader: this person is not in the ranking at all,
    // so nothing about them — not even a gap — reaches the page.
    if (!identity.show && !isViewer) continue;
    ranked.push({
      row,
      figure,
      identity,
      isViewer,
      sortName: identity.show ? identity.name : (row.full_name ?? ''),
      rank: 0,
    });
  }

  /* Descending by figure, and by name within a tie. The name is not a
   * tie-break in the ranking sense — the ranks below are equal regardless —
   * it is only what stops two identical figures swapping places between
   * renders, which would look like movement nobody made. */
  ranked.sort((a, b) => b.figure - a.figure || a.sortName.localeCompare(b.sortName));

  let rank = 0;
  let runningFigure: number | null = null;
  ranked.forEach((entry, index) => {
    if (runningFigure === null || entry.figure !== runningFigure) {
      rank = index + 1;
      runningFigure = entry.figure;
    }
    entry.rank = rank;
  });

  const sharing = new Map<number, number>();
  for (const entry of ranked) sharing.set(entry.rank, (sharing.get(entry.rank) ?? 0) + 1);

  const entries: BoardEntry[] = [];
  for (const entry of ranked) {
    if (!entry.identity.show || entry.rank > BOARD_SIZE) continue;
    entries.push({
      id: entry.row.id,
      rank: entry.rank,
      name: entry.identity.name,
      photo: entry.identity.photo && Boolean(entry.row.photo_version),
      photoVersion: entry.identity.photo ? (entry.row.photo_version ?? null) : null,
      figure: entry.figure,
      secondary: secondaryFor(board, entry.row),
      tied: (sharing.get(entry.rank) ?? 1) > 1,
      isViewer: entry.isViewer,
    });
  }

  /* The tenth figure is the smallest one still inside the ten, which is not
   * the same as "the tenth row": ties mean the ten positions can hold more
   * than ten people. Read from the ranking rather than from `entries`, so a
   * reader who is hidden and sitting in the ten does not change the distance
   * quoted to everybody else. */
  let cutFigure: number | null = null;
  for (const entry of ranked) {
    if (entry.rank > BOARD_SIZE) continue;
    cutFigure = cutFigure === null ? entry.figure : Math.min(cutFigure, entry.figure);
  }

  const mine = ranked.find((entry) => entry.isViewer) ?? null;
  const you: OwnStanding | null = mine
    ? {
        rank: mine.rank,
        figure: mine.figure,
        tied: (sharing.get(mine.rank) ?? 1) > 1,
        toTenth:
          mine.rank <= BOARD_SIZE || cutFigure === null ? null : cutFigure - mine.figure,
      }
    : null;

  return { board, entries, you };
}

/** All five boards from one read of the figures. */
export function buildBoards(opts: {
  rows: readonly LeaderboardRow[];
  viewerId: string;
  today: string;
}): Board[] {
  return BOARD_KINDS.map((board) => buildBoard({ ...opts, board }));
}
