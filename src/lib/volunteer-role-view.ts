/**
 * What a volunteer role LOOKS like, and who is allowed to look at it.
 *
 * The queries are next door in lib/volunteer-roles.ts, where they need a
 * database. Everything here is the part that does not: how a period with a
 * known precision is written in each language, what a viewer may see, and the
 * three rules migration 046 states as CHECK constraints — restated in
 * TypeScript so a form gets a named refusal instead of meeting a constraint
 * violation as a 500.
 *
 * PURE. No 'server-only', no database, no clock, no React. scripts/
 * probe-volunteer-roles.mts drives all of it directly, which is the point:
 * the visibility rule and the date rendering must be provable without a
 * server, a fixture or a row on production.
 *
 * ── THE DATE TRAP, WHICH IS THE WHOLE REASON THIS FILE EXISTS ──────────────
 *
 * `started_on` and `ended_on` are DATE columns. Migration 046 says why: they
 * are calendar facts about a person, not instants. The session runs GMT and
 * the association is in Beirut.
 *
 * NOTHING IN THIS FILE BUILDS A `Date`. Not from 'YYYY-MM-DD', not from
 * 'YYYY-MM-01', not "just to get the month name". `new Date('2025-01-01')` is
 * midnight UTC, which is the 31st of December 2024 in any zone west of
 * Greenwich and, more to the point, is two hours before the day the volunteer
 * actually means; a role that began in كانون الثاني ٢٠٢٥ would print as
 * كانون الأول ٢٠٢٤ and be believed, because nothing about it looks wrong. So
 * the text arrives as text from Postgres and is sliced as text from there on.
 * The same argument, and the same refusal, as formatPeriod in
 * dictionaries/awards.ts.
 *
 * ── WHY THE MONTH NAMES ARE IMPORTED AND NOT WRITTEN ───────────────────────
 *
 * MONTH_NAMES already exists, in the Levantine set the association actually
 * uses — كانون الثاني، شباط، آذار, not يناير/فبراير. A second copy here would
 * be a second thing to get right, and the day the two disagree the site is
 * speaking two dialects on one page.
 */

/* Relative, not '@/lib/...', and deliberately: the probes run under tsx from
 * scripts/, where the '@/' alias is a tsconfig convenience rather than
 * something the runtime resolves. The Locale import below is type-only and is
 * erased, so it can use the alias safely. */
import { MONTH_NAMES } from './dictionaries/awards';
import type { Locale } from '@/lib/i18n';

// ------------------------------------------------------------- precision

/**
 * How much of a date is actually known.
 *
 * Nobody remembers the day they joined the activities committee in 2022. A
 * schema that demanded one would get a made-up day and then display it as
 * fact; this is what lets the timeline print «٢٠٢٢» honestly instead.
 */
export type DatePrecision = 'day' | 'month' | 'year';

const PRECISIONS: readonly DatePrecision[] = ['day', 'month', 'year'];

export function isPrecision(value: unknown): value is DatePrecision {
  return typeof value === 'string' && (PRECISIONS as readonly string[]).includes(value);
}

/** Anything unreadable becomes 'day', which is the column's own default. */
export function precisionFrom(value: unknown): DatePrecision {
  return isPrecision(value) ? value : 'day';
}

// ------------------------------------------------------------ visibility

/**
 * Who may see one role. Per role, not per person — somebody may be happy to
 * have «متطوّع» on a public page and want an internal safeguarding
 * responsibility seen by staff only.
 */
export type Visibility = 'public' | 'volunteers' | 'staff';

const VISIBILITIES: readonly Visibility[] = ['public', 'volunteers', 'staff'];

export function isVisibility(value: unknown): value is Visibility {
  return typeof value === 'string' && (VISIBILITIES as readonly string[]).includes(value);
}

/**
 * The column's default, and it is inward on purpose.
 *
 * Migration 038 made appearing publicly the default for a NAME AND PHOTO,
 * which the person chose to publish. A list of who ran what is a different
 * thing to put on the open web.
 */
export const DEFAULT_ROLE_VISIBILITY: Visibility = 'volunteers';

export function visibilityFrom(value: unknown): Visibility {
  return isVisibility(value) ? value : DEFAULT_ROLE_VISIBILITY;
}

/**
 * Who is doing the reading.
 *
 * A discriminated union and not a pair of booleans, because `rolesFor(id)`
 * with an optional viewer is a function whose easiest call is the one that
 * leaks. There is no 'everything' member and no default value anywhere: a
 * caller that has not decided who the reader is cannot call the query at all,
 * which is the only version of this rule that survives a hurried page.
 */
export type Viewer =
  | { kind: 'anonymous' }
  | { kind: 'volunteer'; userId: string }
  | { kind: 'staff'; userId: string };

/** Signed out. Named rather than written inline, so it reads as a decision. */
export const ANONYMOUS: Viewer = { kind: 'anonymous' };

/**
 * The visibilities this reader may see, widest last.
 *
 * Cumulative rather than exact: staff are also volunteers and volunteers are
 * also members of the public, so each tier adds and none replaces. Returned as
 * a list because that is what the query binds — `visibility = ANY($n)` — so
 * the rule the probe checks here is character-for-character the rule the
 * database applies, rather than a second statement of it in SQL that can drift.
 *
 * NOTE ON SELF-READING. A volunteer looking at their own profile is given the
 * volunteer's answer, not the staff one. That is deliberate and it is arguable:
 * a staff-only role is written ABOUT somebody by an administrator, and the
 * decision to show a person their own hidden role is a decision about how the
 * association talks to its volunteers, not a filtering convenience to slip in
 * here. If it is ever wanted, it belongs in an explicit fourth Viewer member so
 * that it appears in this switch and in the probe.
 */
export function visibleTo(viewer: Viewer): Visibility[] {
  switch (viewer.kind) {
    case 'staff':
      return ['public', 'volunteers', 'staff'];
    case 'volunteer':
      return ['public', 'volunteers'];
    case 'anonymous':
      return ['public'];
    default:
      /* Unreachable while Viewer has three members. If it gains a fourth and
       * somebody forgets this switch, the new kind of reader starts with the
       * least rather than the most — a bug that hides a role is recoverable,
       * one that publishes it is not. */
      return ['public'];
  }
}

/**
 * Whether one role is readable by one viewer.
 *
 * The same rule as visibleTo, applied to a single row. It exists so a probe can
 * hold the filter against a list of roles without a database, and so that any
 * code holding roles in memory — a cached profile, a search result being
 * re-filtered — has one function to ask rather than an inline comparison.
 */
export function readableBy(role: { visibility: Visibility }, viewer: Viewer): boolean {
  return visibleTo(viewer).includes(role.visibility);
}

// --------------------------------------------------------------- the rules

/** A plain calendar day, and never the first ten characters of a timestamp. */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const isLeap = (y: number): boolean => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/**
 * A value as 'YYYY-MM-DD', or null.
 *
 * A timestamp is refused rather than trimmed to its first ten characters, for
 * the reason at the top of this file: those ten characters name the wrong day
 * for anything recorded after ten in the evening Beirut time. Every date here
 * is selected with to_char and arrives as text already; anything else is a
 * mistake upstream and must read as missing rather than as the wrong day.
 */
export function calendarDay(value: unknown): string | null {
  const s = typeof value === 'string' ? value.trim() : '';
  const m = ISO_DATE.exec(s);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12) return null;
  const last = month === 2 && isLeap(year) ? 29 : DAYS_IN_MONTH[month - 1];
  return day >= 1 && day <= last ? s : null;
}

/** The period fields of a role, which is all the formatter needs. */
export type RolePeriod = {
  /** 'YYYY-MM-DD' as text, or null. Never a Date. */
  startedOn: string | null;
  startedPrec: DatePrecision;
  endedOn: string | null;
  endedPrec: DatePrecision;
  /**
   * Held separately from endedOn rather than derived from it. "No end date"
   * and "still doing it" are different facts: a role that ended in 2023 on a
   * day nobody wrote down is past with a null endedOn, and deriving
   * current-ness from that null would resurrect it.
   */
  isCurrent: boolean;
};

export type PeriodProblem = 'bad-date' | 'out-of-order' | 'current-and-ended';

/**
 * The three things migration 046 refuses, checked before the database has to.
 *
 * chk_vr_order and chk_vr_current are the guarantee; this is what turns an
 * administrator's typo into a message on the form rather than a 500. Compared
 * as TEXT, which works because 'YYYY-MM-DD' sorts lexically exactly as it sorts
 * chronologically — and because comparing them as Dates is the bug this whole
 * file is arranged to avoid.
 */
export function checkPeriod(
  period: RolePeriod,
): { ok: true } | { ok: false; reason: PeriodProblem } {
  const started = period.startedOn;
  const ended = period.endedOn;
  if (started !== null && calendarDay(started) === null) return { ok: false, reason: 'bad-date' };
  if (ended !== null && calendarDay(ended) === null) return { ok: false, reason: 'bad-date' };
  if (period.isCurrent && ended !== null) return { ok: false, reason: 'current-and-ended' };
  if (started !== null && ended !== null && ended < started) {
    return { ok: false, reason: 'out-of-order' };
  }
  return { ok: true };
}

/**
 * A title is present, or there is no role.
 *
 * Only the Arabic is required, matching chk_vr_title. The English is for the
 * CV a volunteer exports and may be left empty rather than machine-translated
 * badly — an empty string, not a null, so "not written yet" and "written as
 * nothing" do not become two different facts.
 */
export function checkTitle(titleAr: string): boolean {
  return titleAr.trim().length > 0;
}

/**
 * The title in one language, falling back to the Arabic.
 *
 * The same three lines that titleOf() already spells out in
 * components/staff/VolunteerRoles.tsx and components/account/MyRoles.tsx. It is
 * lifted here — pure, no React, no database — because the chips beside the
 * badges now need it on a PUBLIC page as well, and a fourth private copy of a
 * fallback rule is a fourth place for it to be got wrong. The two existing
 * copies are deliberately left where they are: they are correct, and rewriting
 * two working components to import one branch is churn on files this change has
 * no other reason to touch.
 *
 * The fallback direction is fixed by the column's own default — title_en is ''
 * and never null (see toRole in lib/volunteer-roles.ts) — so an untranslated
 * role reads in Arabic on the English page rather than as a blank chip.
 */
export function roleTitle(role: { titleAr: string; titleEn: string }, lang: Locale): string {
  if (lang === 'ar') return role.titleAr;
  return role.titleEn.trim() || role.titleAr;
}

/** One achievement, in both languages. `en` may be empty and the reader falls back. */
export type RoleAchievement = { ar: string; en: string };

/**
 * Whatever arrived, as a list of achievements.
 *
 * The column is JSONB with only `jsonb_typeof = 'array'` behind it, so the
 * shape inside is this application's job. Written defensively because the
 * value can come from a form, from an older row, or from a hand-edited record,
 * and a page mapping over it must not meet an object where a string was.
 */
export function cleanAchievements(value: unknown): RoleAchievement[] {
  if (!Array.isArray(value)) return [];
  const out: RoleAchievement[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const row = item as { ar?: unknown; en?: unknown };
    const ar = typeof row.ar === 'string' ? row.ar.trim() : '';
    const en = typeof row.en === 'string' ? row.en.trim() : '';
    // An entry with nothing in either language is not an achievement.
    if (!ar && !en) continue;
    out.push({ ar, en });
  }
  return out;
}

// ---------------------------------------------------------- the formatter

/**
 * How each language joins two dates, beside the formatter that uses them.
 *
 * Phrases rather than loose words, because the two languages do not join a
 * range the same way and a shared template would make one of them read as a
 * translation. Arabic takes «من ٢٠٢١ حتى ٢٠٢٣», which is how when.ts already
 * writes a time range; English takes an en dash, which is how the same function
 * already writes one there. Nobody says "from 2021 – present" out loud.
 *
 * Not a dictionary namespace: these are fragments of one sentence whose grammar
 * this file owns, exactly as MONTH_NAMES sits beside formatPeriod. A page
 * cannot re-word «حتى الآن» without also re-wording the range it sits in.
 */
type PeriodWords = {
  /** Both ends known. */
  range: (start: string, end: string) => string;
  /** Still going. */
  ongoing: (start: string) => string;
  /** Began then, ended on a day nobody wrote down. */
  since: (start: string) => string;
  /** Ended then, began on a day nobody wrote down. */
  until: (end: string) => string;
  /** Still going, and nobody wrote down when it began. */
  present: string;
  /** Nothing recorded at all. The same em dash every other formatter here uses. */
  missing: string;
};

const WORDS: Record<Locale, PeriodWords> = {
  ar: {
    range: (a, b) => `من ${a} حتى ${b}`,
    ongoing: (a) => `من ${a} حتى الآن`,
    since: (a) => `من ${a}`,
    until: (b) => `حتى ${b}`,
    present: 'حتى الآن',
    missing: '—',
  },
  en: {
    range: (a, b) => `${a} – ${b}`,
    ongoing: (a) => `${a} – present`,
    since: (a) => `from ${a}`,
    until: (b) => `until ${b}`,
    present: 'present',
    missing: '—',
  },
};

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/**
 * Arabic-Indic digits in Arabic, Latin in English.
 *
 * THIS CODEBASE IS SPLIT ON THE POINT and the split is not an accident, so the
 * choice is stated rather than assumed. when.ts and dictionaries/awards.ts keep
 * Latin digits, on the argument that a date on a notice board is copied onto
 * paper; format.ts renders `ar-LB-u-nu-arab`, on the argument that a date
 * inside Arabic prose written in Latin numerals reads as a machine's output.
 *
 * A role period is the second kind. It is a phrase in a sentence on somebody's
 * profile — «من كانون الثاني ٢٠٢٥ حتى الآن» — not a figure anybody transcribes,
 * so it follows format.ts.
 */
function digits(text: string, lang: Locale): string {
  return lang === 'ar' ? text.replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]) : text;
}

/**
 * One date, written to the precision that is actually known.
 *
 *   'year'  → «٢٠٢٣» / '2023'
 *   'month' → «كانون الثاني ٢٠٢٥» / 'January 2025'
 *   'day'   → «١٤ آذار ٢٠٢٣» / '14 March 2023'
 *
 * Every one of them is built by SLICING THE TEXT. The month name is
 * MONTH_NAMES[lang][Number(slice) - 1] and the year is four characters — no
 * Date, no Intl.DateTimeFormat, nothing that has to be told a time zone
 * because nothing here has a time.
 *
 * The English day form is '14 March 2023' rather than 'March 14, 2023' because
 * en-GB is what every other date in this codebase renders as, and because the
 * two languages then differ only in script and direction.
 *
 * Returns null for an unreadable date, so the caller decides what missing looks
 * like rather than having 'Invalid Date' appear mid-sentence.
 */
export function formatRoleDate(
  value: string | null,
  precision: DatePrecision,
  lang: Locale,
): string | null {
  const day = calendarDay(value);
  if (day === null) return null;

  const year = day.slice(0, 4);
  if (precision === 'year') return digits(year, lang);

  const monthName = MONTH_NAMES[lang][Number(day.slice(5, 7)) - 1];
  if (precision === 'month') return `${monthName} ${digits(year, lang)}`;

  // Number() to drop the leading zero: «٠٤ آذار» is not how anybody writes it.
  const dayOfMonth = digits(String(Number(day.slice(8, 10))), lang);
  return `${dayOfMonth} ${monthName} ${digits(year, lang)}`;
}

/**
 * A whole period, in one phrase.
 *
 *   «من كانون الثاني ٢٠٢٥ حتى الآن»   /  'January 2025 – present'
 *   «من ٢٠٢١ حتى ٢٠٢٣»                /  '2021 – 2023'
 *   «من ٢٠٢١»                          /  'from 2021'    (past, end date never written down)
 *   «١٤ آذار ٢٠٢٣»                     /  '14 March 2023' (began and ended the same day)
 *   «حتى الآن»                         /  'present'       (current, start unrecorded)
 *   «حتى ٢٠٢٣»                         /  'until 2023'    (ended, start unrecorded)
 *   «—»                                /  '—'             (nothing recorded at all)
 *
 * THE ONE RULE THAT MATTERS: a current role never prints an end date, and it
 * says «حتى الآن» / 'present' instead. chk_vr_current makes the contradictory
 * row impossible in the database; this makes it impossible on the page, so that
 * a row hand-edited past the constraint still cannot render a person as
 * simultaneously serving and finished.
 *
 * A PAST role whose end date nobody wrote down prints «من ٢٠٢١» / 'from 2021'
 * and stops. It deliberately does not say «حتى الآن»: that would be the null
 * resurrecting the role, which is the exact mistake is_current exists to
 * prevent. It reads as incomplete because it IS incomplete, and an
 * administrator who sees it can go and fill the date in.
 */
export function formatRolePeriod(period: RolePeriod, lang: Locale): string {
  const words = WORDS[lang];
  const start = formatRoleDate(period.startedOn, period.startedPrec, lang);
  /* Read only when the role is not current. A current role has no end date by
   * constraint; refusing to even look at the column means a bad row cannot
   * produce a contradictory phrase. */
  const end = period.isCurrent ? null : formatRoleDate(period.endedOn, period.endedPrec, lang);

  if (period.isCurrent) {
    return start === null ? words.present : words.ongoing(start);
  }
  if (start === null && end === null) return words.missing;
  if (start === null) return words.until(end as string);
  if (end === null) return words.since(start);
  /* Same day, same precision: one date, not a range from a thing to itself.
   * Compared on the rendered strings so that two dates in the same month at
   * month precision also collapse — «من آذار ٢٠٢٣ حتى آذار ٢٠٢٣» is noise. */
  if (start === end) return start;
  return words.range(start, end);
}
