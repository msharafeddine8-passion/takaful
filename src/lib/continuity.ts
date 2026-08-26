/**
 * What the page of thanks is allowed to say, and in what order it may say it.
 *
 * «صنّاع الاستمرارية» names people who have been with the association since
 * 2023 or earlier. It is a thank-you, not a league table, and the two differ
 * in ways that have to be built in rather than styled on:
 *
 *   - Nobody carries a position. There is no index, no ordinal, no "first".
 *     Sorting exists because a page of many cards needs a reading order, and
 *     `sortRoll` returns a plain array — it never decorates a person with
 *     where they landed, so no template can print one by accident.
 *
 *   - Nothing is ordered more finely than it is shown. The cards display the
 *     YEAR somebody joined, so "longest with the association" sorts by year
 *     and then alphabetically, never by the full date. Sorting by a date that
 *     is not on the page would publish it anyway: the reader can recover
 *     everyone's ordering within a year just by looking at the sequence. The
 *     same rule governs hours: the card reads whole hours, so the sort reads
 *     whole hours, and somebody whose figures are withheld is never sorted by
 *     those figures at all — see `sortRoll`.
 *
 *   - The join date never becomes a Date object. It arrives as 'YYYY-MM-DD'
 *     text from Postgres and is sliced as text. The database session runs in
 *     GMT and the association is in Beirut; parsing a date to compare it is
 *     how a January join becomes a December one for the people who joined in
 *     the evening.
 *
 * PURE. No 'server-only', no database, no React — so scripts/probe-continuity
 * exercises these rules directly rather than through a page that might be
 * rendering something else entirely.
 */

import type { Locale } from '@/lib/i18n';
import { publicIdentity, treatAsMinor, visibilityFrom } from '@/lib/visibility';

/* ------------------------------------------------------------------ consent
 *
 * INTEGRATION POINT — the one place this page decides what may be published.
 *
 * `consentFor` below is the whole of it: every field on every card reads a
 * flag this function set, and nothing else in the file, the page or the probe
 * asks the question again. It was written against a local interface while
 * src/lib/visibility.ts was still being built, defaulting to "nothing about
 * anybody" so that a page of real names could not ship ahead of the mechanism
 * that asks them. visibility.ts and migration 033 have since landed, and the
 * body is now what it was always meant to be: one call out to that module.
 *
 * WHAT THIS MODULE MUST NOT DO, and the reason the seam is worth keeping:
 *
 *   It does not decide who is a minor, or read a birth date to guess. It hands
 *   both stored dates to treatAsMinor and forgets them. An unknown age comes
 *   back as "protect this person", and that is visibility.ts's judgement, not
 *   this page's.
 *
 *   It does not choose between a display name and a legal one. publicIdentity
 *   returns the name that may be printed, or refuses. A page that fell back to
 *   the full name when a display name was empty would break the promise the
 *   setting made, and the fallback would look like a bug fix.
 *
 *   It does not reuse profiles.is_public. That flag governs whether a stranger
 *   holding a scanned membership card sees a name — a different surface, a
 *   different audience, a different decision. Migration 033 says so in as many
 *   words, and taking it as consent to be named on the open web is exactly the
 *   quiet reuse this page must not do.
 */

/** What may be published about one person on this page, field by field. */
export type ContinuityConsent = {
  /** May they appear on the page at all. Everything else is moot if false. */
  listed: boolean;
  /** The exact name that may be printed. Chosen by visibility.ts, not here. */
  name: string | null;
  photo: boolean;
  memberNumber: boolean;
  /** Verified hours and activities attended, which move together. */
  figures: boolean;
  certificates: boolean;
  badges: boolean;
  stage: boolean;
};

/** Nothing about anybody. What silence, an unknown age or a refusal returns. */
export const CONSENT_NONE: ContinuityConsent = {
  listed: false,
  name: null,
  photo: false,
  memberNumber: false,
  figures: false,
  certificates: false,
  badges: false,
  stage: false,
};

/** Everything visibility.ts needs, and nothing this page keeps afterwards. */
export type ConsentSubject = {
  full_name: string | null;
  display_name: string | null;
  /** profiles.public_visibility, from migration 033. Absent reads as hidden. */
  public_visibility?: string | null;
  /** profiles_sensitive.date_of_birth, as YYYY-MM-DD text. */
  sensitive_dob?: string | null;
  /** safeguarding_records.date_of_birth, as YYYY-MM-DD text. */
  safeguarding_dob?: string | null;
  /** volunteer_roster.date_of_birth, via a claimed and approved line. */
  roster_dob?: string | null;
};

/**
 * What this page may publish about one person.
 *
 * `today` is passed in rather than read from the clock, because visibility.ts
 * owns no clock either and the safeguarding rule has to be testable without
 * one — see beirutToday for where the page gets it.
 */
export function consentFor(subject: ConsentSubject, today: string): ContinuityConsent {
  const identity = publicIdentity({
    choice: visibilityFrom(subject.public_visibility),
    isMinor: treatAsMinor({
      sensitiveDob: subject.sensitive_dob,
      safeguardingDob: subject.safeguarding_dob,
      rosterDob: subject.roster_dob,
      today,
    }),
    fullName: subject.full_name ?? '',
    displayName: subject.display_name,
  });

  if (!identity.show) return CONSENT_NONE;

  /*
   * The membership number goes out only beside a legal name.
   *
   * It is sequential, it is printed on the physical card, and this page would
   * otherwise publish the mapping from T0NN to a person — which is most of
   * what migration 026 was written to take away. Beside somebody's real name
   * it says no more than the card in their pocket already does. Beside a name
   * they chose it undoes the choice: anyone who has seen that card can read
   * the pseudonym straight back to them, and visibility.ts hands out a chosen
   * name precisely when the real one must not appear.
   *
   * Compared against the full name rather than against the reason, because
   * the reason is deliberately not on offer: visibility.ts says what may be
   * shown and never why, so that no caller can leak "this one is a child".
   */
  const namedInFull = identity.name === (subject.full_name ?? '').trim();

  return {
    listed: true,
    name: identity.name,
    photo: identity.photo,
    /*
     * NEVER PUBLISHED, WHOEVER CONSENTED TO WHAT.
     *
     * This was `namedInFull`, so anybody named in full had their membership
     * number printed beside their name. It reads as a small extra honour and it
     * was half a credential: a roster claim was auto-approved on a membership
     * number plus a name that folds to the roster's, and the account holder
     * types their own name. This page therefore printed both halves of that
     * check — read a name and a number off it, register, set the name to match,
     * and the platform recognised you as that volunteer.
     *
     * The claim path is closed too (see SELF_EVIDENT in actions/roster.ts).
     * This is closed as well rather than left to depend on that: a number that
     * identifies a person in the association's own records has no business on a
     * public page, and whatever is keyed on it next will not arrive with a note
     * explaining why it used to be safe.
     */
    memberNumber: false,
    /*
     * The rest of the card follows from being listed at all.
     *
     * The setting is worded as consent to appear on «صفحات التقدير» — the
     * recognition pages — and hours, activities, certificates and badges are
     * what a recognition page is made of. Splitting them into further
     * questions the form never asked would mean inventing an answer on the
     * volunteer's behalf, in either direction. If the association later wants
     * finer consent, it belongs in the form and in visibility.ts, and these
     * three lines are where it arrives.
     */
    figures: true,
    certificates: true,
    badges: true,
    stage: true,
  };
}

/**
 * Today in Beirut, as YYYY-MM-DD.
 *
 * The one place a clock is read. Everything downstream compares text, so the
 * conversion happens once, here, rather than in each caller with whatever
 * timezone the server happened to be started in. Built from formatToParts and
 * not from toISOString: the server runs in GMT and the association does not,
 * and after ten in the evening those are different days.
 */
export function beirutToday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Beirut',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/* -------------------------------------------------------------- the person */

/** A row as the query hands it over. Carries more than may ever be shown. */
export type ContinuityRow = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  member_number: number | null;
  /** 'YYYY-MM-DD' text. Never a Date — see the header. */
  joined_on: string | null;
  stage_ar: string | null;
  stage_en: string | null;
  stage_number: number | null;
  minutes: number | null;
  activities: number | null;
  certificates: number | null;
  photo_version: string | null;
  /** Every badge they hold, newest first, revoked ones already excluded. */
  badges: string[] | null;
  /* The consent inputs. Read once by consentFor and never carried onward —
   * ContinuityPerson has no field either birth date could land in. */
  public_visibility?: string | null;
  sensitive_dob?: string | null;
  safeguarding_dob?: string | null;
  /** volunteer_roster.date_of_birth, via a claimed and approved line. */
  roster_dob?: string | null;
};

/**
 * Exactly what a card may render. Anything not named here never reaches the
 * browser, because nothing else is put in the object the template receives —
 * the same allowlist discipline as lib/card-view.ts, and for the same reason:
 * "the template does not print it" and "it never left the server" are
 * different guarantees, and only the second one survives a JSON dump.
 *
 * There is no `rank`, no `position` and no `index`. There is nowhere to put
 * one.
 */
export type ContinuityPerson = {
  id: string;
  /** '2019'. Year precision, deliberately — never the day they joined. */
  joinedYear: string;
  /** The name visibility.ts permitted. Null only if it permitted none. */
  name: string | null;
  /** «T014», or null. */
  memberNumber: string | null;
  stage: string | null;
  /** For ordering the stage filter, never rendered. */
  stageNumber: number | null;
  /**
   * WHOLE verified hours, or null when withheld. Null is not zero.
   *
   * Whole, and not the minutes the ledger holds, for two reasons that point
   * the same way. A thank-you has no use for somebody's odd twenty minutes,
   * and the sort must not order more finely than the card reads: two people
   * shown as «٤ ساعات» whom the list separates have had their minutes
   * published by their positions.
   */
  hours: number | null;
  activities: number | null;
  certificates: number | null;
  badges: string[];
  /** A photograph may be requested only when this is true. */
  showPhoto: boolean;
  photoVersion: string | null;
};

/**
 * Badges worth showing beside a name.
 *
 * `continuity-maker` is dropped: everybody on this page holds it — it is the
 * reason they are on it — so printing it on all of them says nothing and
 * pushes the badges that differ off the card. Capped, because a card carrying
 * twenty badges has stopped being a thank-you and started being a scoreboard.
 *
 * Order is left exactly as the query gave it (most recently earned first) and
 * is never sorted by rarity or worth: ranking the badges is ranking the people
 * holding them, one step removed.
 */
export const BADGE_LIMIT = 6;

export function notableBadges(codes: readonly string[] | null, limit = BADGE_LIMIT): string[] {
  if (!codes) return [];
  return codes.filter((code) => code !== 'continuity-maker').slice(0, Math.max(0, limit));
}

/** «T014». Padded to three, matching the membership card and the roster. */
function formatNumber(value: number | null): string | null {
  return typeof value === 'number' ? `T${String(value).padStart(3, '0')}` : null;
}

/**
 * The only way a row becomes something the page can render.
 *
 * Returns null for anybody who has not consented to be listed. Every remaining
 * field is gated on its own flag, so a card is assembled from permissions
 * rather than from a row with some columns left unprinted.
 */
export function toPublicPerson(
  row: ContinuityRow,
  consent: ContinuityConsent,
  lang: Locale,
): ContinuityPerson | null {
  if (!consent.listed) return null;

  /*
   * No join date, no card. The badge is granted from a roster line that has a
   * date on it, so this should be unreachable — but a page whose whole subject
   * is "how long they have been here" must not print a guess, and a blank year
   * beside a thank-you reads as a mistake about the person.
   */
  const joinedOn = row.joined_on ?? '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(joinedOn)) return null;

  // The query returns both languages; only one may be carried into the object
  // the browser receives. Choosing here rather than in the template is what
  // keeps the allowlist a single place.
  const stage = (lang === 'ar' ? row.stage_ar : row.stage_en) ?? null;

  return {
    id: row.id,
    joinedYear: joinedOn.slice(0, 4),
    name: consent.name,
    memberNumber: consent.memberNumber ? formatNumber(row.member_number) : null,
    stage: consent.stage ? stage : null,
    stageNumber: consent.stage ? (row.stage_number ?? null) : null,
    hours:
      consent.figures && typeof row.minutes === 'number'
        ? Math.floor(row.minutes / 60)
        : null,
    activities: consent.figures ? (row.activities ?? null) : null,
    certificates: consent.certificates ? (row.certificates ?? null) : null,
    badges: consent.badges ? notableBadges(row.badges) : [],
    showPhoto: consent.photo && Boolean(row.photo_version),
    photoVersion: consent.photo ? (row.photo_version ?? null) : null,
  };
}

/**
 * Every row that may be shown, and nothing else.
 *
 * The one place `consentFor` is called from, so there is no route by which a
 * row could reach the page without having been asked about.
 *
 * `today` is the caller's, once for the whole roll: asking the clock per
 * person would let a run that straddles midnight judge two people by
 * different calendars, and the calendar is what decides who is a child.
 */
export function buildRoll(
  rows: readonly ContinuityRow[],
  lang: Locale,
  today: string,
): ContinuityPerson[] {
  const out: ContinuityPerson[] = [];
  for (const row of rows) {
    const person = toPublicPerson(row, consentFor(row, today), lang);
    if (person) out.push(person);
  }
  return out;
}

/* ------------------------------------------------------------------ reading */

export const SORTS = ['longest', 'hours', 'name'] as const;
export type ContinuitySort = (typeof SORTS)[number];
export const DEFAULT_SORT: ContinuitySort = 'longest';

/** A query string is whatever somebody typed. Anything unknown is the default. */
export function parseSort(value: unknown): ContinuitySort {
  return (SORTS as readonly string[]).includes(String(value))
    ? (value as ContinuitySort)
    : DEFAULT_SORT;
}

export type ContinuityFilter = { year: string | null; stage: string | null };
export const NO_FILTER: ContinuityFilter = { year: null, stage: null };

/**
 * A filter is only ever one of the values the page itself offered.
 *
 * Validating against the roll rather than against a pattern is what stops the
 * filter becoming a probe: `?stage=` anything at all would otherwise render a
 * page that says "nobody matches", and the difference between that and a page
 * with results tells whoever asked whether a stage exists. Everything
 * unrecognised falls back to "no filter", which shows the same page as no
 * query string at all.
 */
export function parseFilter(
  people: readonly ContinuityPerson[],
  year: unknown,
  stage: unknown,
): ContinuityFilter {
  const years = new Set(joiningYears(people));
  const stages = new Set(stageOptions(people).map((s) => s.label));
  return {
    year: typeof year === 'string' && years.has(year) ? year : null,
    stage: typeof stage === 'string' && stages.has(stage) ? stage : null,
  };
}

/** The years actually present, newest first. Derived from the roll, so the
 *  option list itself cannot betray somebody who is not on the page. */
export function joiningYears(people: readonly ContinuityPerson[]): string[] {
  return [...new Set(people.map((p) => p.joinedYear))].sort((a, b) => b.localeCompare(a));
}

/** The stages present, in journey order. The number orders the menu and is
 *  never rendered — a stage is a place on a path, not a score. */
export function stageOptions(
  people: readonly ContinuityPerson[],
): { label: string; number: number }[] {
  const seen = new Map<string, number>();
  for (const p of people) {
    if (!p.stage) continue;
    const n = p.stageNumber ?? 0;
    // The lowest number wins a tie, so a label that somehow appears at two
    // stages still lands in one place rather than moving between renders.
    if (!seen.has(p.stage) || n < (seen.get(p.stage) as number)) seen.set(p.stage, n);
  }
  return [...seen.entries()]
    .map(([label, number]) => ({ label, number }))
    .sort((a, b) => a.number - b.number || a.label.localeCompare(b.label));
}

export function filterRoll(
  people: readonly ContinuityPerson[],
  filter: ContinuityFilter,
): ContinuityPerson[] {
  return people.filter(
    (p) =>
      (filter.year === null || p.joinedYear === filter.year) &&
      (filter.stage === null || p.stage === filter.stage),
  );
}

/**
 * A reading order. Never a ranking.
 *
 * Returns a new array and leaves the input alone — the caller holds the
 * unfiltered roll and uses it to build the filter menus, and an in-place sort
 * would reorder that behind its back.
 *
 * Two rules that are privacy rules rather than presentation ones:
 *
 *   - 'longest' orders by the year on the card and then by name. Ordering by
 *     the full join date would publish the day: within one year, position in
 *     the list is the ordering, and anybody can read it off.
 *
 *   - 'hours' reads the whole hours the card prints, so two people shown the
 *     same figure are separated only by their names. And it puts anybody whose
 *     figures are withheld at the end, in name order, rather than treating a
 *     withheld figure as zero: slotting them among the visible figures would
 *     say roughly how many hours they have to anyone who looked at their
 *     neighbours, which is the number they declined to publish.
 */
export function sortRoll(
  people: readonly ContinuityPerson[],
  sort: ContinuitySort,
  lang: Locale,
): ContinuityPerson[] {
  const byName = (a: ContinuityPerson, b: ContinuityPerson) =>
    (a.name ?? '').localeCompare(b.name ?? '', lang === 'ar' ? 'ar' : 'en');

  const copy = [...people];

  if (sort === 'name') return copy.sort(byName);

  if (sort === 'hours') {
    return copy.sort((a, b) => {
      const aHidden = a.hours === null;
      const bHidden = b.hours === null;
      if (aHidden !== bHidden) return aHidden ? 1 : -1;
      if (aHidden && bHidden) return byName(a, b);
      return (b.hours as number) - (a.hours as number) || byName(a, b);
    });
  }

  // 'longest': the earliest year first, by text comparison — 'YYYY' strings
  // sort chronologically as text, and no Date is ever built from them.
  return copy.sort((a, b) => a.joinedYear.localeCompare(b.joinedYear) || byName(a, b));
}
