/**
 * What a public page is allowed to say about a volunteer.
 *
 * The leaderboard and the recognition page are the first things this platform
 * has built that publish a person rather than serve them. Every other page is
 * read by the volunteer or by staff; these are read by anybody. So the
 * decision about who appears on them is made here, once, in a function with no
 * database behind it, rather than in a template that happened to be given the
 * wrong row.
 *
 * Three rules, in the order they take precedence:
 *
 *   1. Silence is a no. The stored default is `hidden`, an unrecognised value
 *      resolves to `hidden`, and a missing row resolves to `hidden`. There is
 *      no path through this file that publishes somebody who has not answered.
 *
 *   2. A minor is never named or photographed publicly, whatever they chose.
 *      Not because a fifteen-year-old cannot consent to their own name being
 *      shown, but because they cannot consent on behalf of the person who
 *      finds the page — the association's safeguarding duty is not theirs to
 *      waive, and a ranking is exactly the sort of page that is screenshotted
 *      and forwarded.
 *
 *   3. Only then does the choice decide.
 *
 * And one rule about the shape of the answer rather than its content: the
 * result says what may be shown and never why. There is deliberately no
 * `reason`, no `hiddenBecause`, no `isMinor` on the way out. A field like that
 * survives one refactor and then appears in a JSON payload, an empty-state
 * message or an admin table, and the thing it reveals is a child's age. The
 * caller gets `{ show: false }` and has nothing to render but silence.
 *
 * PURE. No database, no `server-only`, no clock — the caller passes today in.
 * scripts/probe-visibility holds these rules directly, which is the point:
 * the safeguarding rule above is the one thing here that must be provably
 * true, and proving it must not require a server, a session or a fixture.
 */

import { foldName } from './roster-match';

/** The three answers, most private first. The UI lists them in this order. */
export const VISIBILITY_CHOICES = ['hidden', 'display_name', 'name_and_photo'] as const;

export type VisibilityChoice = (typeof VISIBILITY_CHOICES)[number];

/**
 * What somebody who has never answered gets. Matches the column default in
 * migration 033, and is asserted against it by the probe — a default that
 * drifted between the schema and the code would mean the two disagree about
 * consent, and the database would win silently.
 */
export const DEFAULT_VISIBILITY: VisibilityChoice = 'hidden';

export function isVisibilityChoice(value: unknown): value is VisibilityChoice {
  return typeof value === 'string' && (VISIBILITY_CHOICES as readonly string[]).includes(value);
}

/**
 * A stored value, as a choice this code can act on.
 *
 * Anything unexpected — null from a row that predates the column, a typo, a
 * value from a future migration this build has not been taught — resolves to
 * the private option rather than throwing. Throwing here would take the public
 * page down, and somebody would fix it by loosening the check.
 */
export function visibilityFrom(stored: string | null | undefined): VisibilityChoice {
  return isVisibilityChoice(stored) ? stored : DEFAULT_VISIBILITY;
}

/** Exactly what a public page may render of one person. Nothing else exists. */
export type PublicIdentity =
  | { show: false }
  | { show: true; name: string; photo: boolean };

/** Reused rather than rebuilt, so every refusal is the same object. */
const HIDDEN: PublicIdentity = { show: false };

/** Eighteen. Named because it appears in three places and means one thing. */
export const ADULT_AGE = 18;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Whether somebody born on `dobIso` is under eighteen on `todayIso`.
 *
 * Text against text, never a Date, and this is not a stylistic preference. The
 * database session runs GMT and the association lives in Beirut, so a birth
 * date read as an instant lands on the previous day — which moves a birthday
 * across a year boundary and, on exactly the wrong day, turns a seventeen-
 * year-old into an adult in the one function whose job is to stop that.
 * Subtracting eighteen from the year of a YYYY-MM-DD string and comparing the
 * strings has no timezone in it at all.
 *
 * Returns null when either side is not a plain YYYY-MM-DD — a timestamp is
 * refused rather than trimmed to its first ten characters, because a GMT
 * timestamp's first ten characters are the wrong day for anybody born after
 * ten in the evening Beirut time. The caller decides what an unknown age
 * means; see treatAsMinor, which decides it protectively.
 */
export function isMinorOn(dobIso: string | null | undefined, todayIso: string): boolean | null {
  const dob = String(dobIso ?? '').trim();
  const today = String(todayIso ?? '').trim();
  if (!ISO_DATE.test(dob) || !ISO_DATE.test(today)) return null;

  /* The date eighteen years ago today, as text. Somebody born after it has
   * not had their eighteenth birthday yet. 29 February needs no special case:
   * a birthday of 2008-02-29 is still ahead of the 2008-02-28 cutoff on
   * 2026-02-28 and behind the 2008-03-01 cutoff on 2026-03-01, which is the
   * calendar's own answer. */
  const cutoff = String(Number(today.slice(0, 4)) - ADULT_AGE).padStart(4, '0') + today.slice(4);
  return dob > cutoff;
}

/**
 * Whether this person must be treated as a child by the public pages.
 *
 * Two sources because the platform has two, for reasons that predate this
 * file: profiles_sensitive.date_of_birth is filled at registration and is
 * nullable, safeguarding_records.date_of_birth is required of every volunteer
 * and is the one staff actually maintain. Neither is authoritative on its own.
 *
 * Both are read to decide and neither may be carried any further. Nothing in
 * this module returns a date, an age or the answer to "which source said so".
 *
 * Two deliberately cautious rules:
 *
 *   If the sources disagree, the younger answer wins. A disagreement means one
 *   of the two records is wrong, and there is no version of this where the
 *   right response to "we are not sure whether this is a child" is to publish.
 *
 *   If neither date is usable, the person is protected. This will hide some
 *   adults whose record is incomplete, and that is the correct side to be
 *   wrong on: the cost is a volunteer who has to ask why they are not on a
 *   list, against a child's name and photograph on a public page.
 */
export function treatAsMinor(opts: {
  /** profiles_sensitive.date_of_birth, as YYYY-MM-DD text. */
  sensitiveDob?: string | null;
  /** safeguarding_records.date_of_birth, as YYYY-MM-DD text. */
  safeguardingDob?: string | null;
  /**
   * volunteer_roster.date_of_birth, from a line this account has claimed and
   * staff have approved. YYYY-MM-DD text.
   *
   * The third source, and the one that makes failing closed survivable. With
   * only the first two, twenty of thirty-seven accounts had no date anywhere
   * and were therefore treated as children — so more than half the
   * association would have disappeared from every public page, not because
   * anybody objected but because the platform did not know how old they were.
   * Reading the roster as well leaves seven.
   *
   * It is the association's own record of that person's birth date, and it is
   * consulted only for a line that this account has claimed and a member of
   * staff has approved — the same evidence the membership number and the join
   * date already rest on. An unclaimed line belongs to somebody else.
   */
  rosterDob?: string | null;
  /** Today in Beirut, as YYYY-MM-DD. The caller owns the clock. */
  today: string;
}): boolean {
  const answers = [
    isMinorOn(opts.sensitiveDob, opts.today),
    isMinorOn(opts.safeguardingDob, opts.today),
    isMinorOn(opts.rosterDob, opts.today),
  ];
  /* Any source saying "child" outweighs any number saying otherwise. Three
   * sources make a disagreement more likely rather than less, and the
   * protective answer is the one to take when they differ. */
  if (answers.some((a) => a === true)) return true;
  return !answers.some((a) => a === false);
}

/**
 * Whether a display name is a name of their own rather than a slice of their
 * legal one.
 *
 * Only asked of a minor, and only because "show my display name only" would
 * otherwise be a way to publish a child's real name by typing part of it in.
 * A volunteer called محمد علي حسن who sets their display name to محمد has not
 * chosen a pseudonym; they have chosen a shorter version of the name this
 * function exists to keep off the page.
 *
 * So every word must be a word their legal name does not contain. That is
 * strict enough to refuse محمد, and to refuse محمد الأمل, and to allow
 * فريق الأمل. It refuses more than it must, and refusing means the person is
 * simply not listed — which is a disappointment rather than a disclosure.
 *
 * Folded with the roster's own folding, so أ/ا, ة/ه and stray diacritics do
 * not let the same word through by being spelled differently.
 */
function isNameOfTheirOwn(displayName: string, fullName: string): boolean {
  const chosen = foldName(displayName).split(' ').filter(Boolean);
  if (chosen.length === 0) return false;
  const legal = new Set(foldName(fullName).split(' ').filter(Boolean));
  return chosen.every((word) => !legal.has(word));
}

/**
 * The one function a public page may use to decide what to render.
 *
 * Everything it needs is passed in, including whether the person is a minor,
 * so that the page reading the leaderboard never has to hold a birth date and
 * the decision can be tested without one.
 */
export function publicIdentity(person: {
  choice: VisibilityChoice;
  /** From treatAsMinor. Unknown ages arrive here as true. */
  isMinor: boolean;
  fullName: string;
  displayName: string | null;
}): PublicIdentity {
  const { choice, isMinor } = person;
  const fullName = String(person.fullName ?? '').trim();
  const displayName = String(person.displayName ?? '').trim();

  if (choice === 'hidden') return HIDDEN;

  if (isMinor) {
    /* A minor keeps no photograph and no legal name on a public page, whichever
     * of the two remaining options they picked. What is left is a name they
     * invented, and only if they invented one — the fallback is silence, never
     * the real name. */
    if (!displayName || !isNameOfTheirOwn(displayName, fullName)) return HIDDEN;
    return { show: true, name: displayName, photo: false };
  }

  if (choice === 'display_name') {
    /* No falling back to the full name. Somebody who asked to appear as
     * «أبو خالد» and finds their legal name on a public page was not given the
     * option they thought they were given; showing nothing is the only answer
     * that keeps the promise the label made. */
    if (!displayName) return HIDDEN;
    return { show: true, name: displayName, photo: false };
  }

  // name_and_photo. A person with no name recorded has nothing to publish.
  if (!fullName) return HIDDEN;
  return { show: true, name: fullName, photo: true };
}

/**
 * Whether a person may see their own position and their own figures.
 *
 * Always. It takes the choice so that the answer is written down rather than
 * assumed, because the mistake this prevents is a natural one: a later change
 * reaches for publicIdentity to decide whether to render the standing block on
 * somebody's own dashboard, and quietly punishes everybody who opted out by
 * hiding their own hours from them. Opting out of being listed is not opting
 * out of knowing.
 */
export function seesOwnStanding(_choice: VisibilityChoice): boolean {
  return true;
}

/**
 * What a public birthday greeting may say, if there is to be one at all.
 *
 * A greeting on a public page is a birth date published to anybody, which is a
 * heavier disclosure than a name on a ranking and needs its own answer rather
 * than a share of one. Three conditions, all required:
 *
 *   they turned the setting on — it is off by default and stays off;
 *   they are visible at all, on the terms they already chose;
 *   they are not a minor — a child's birthday, dated to the day, on a page
 *   strangers read, is the disclosure this whole module exists to prevent.
 *
 * Never a photograph, even for somebody who chose name and photo. A greeting
 * is a sentence, and a face beside a date of birth is a different thing again.
 *
 * Says nothing about greetings inside the association, which are not public
 * and are not this function's business.
 */
export function publicBirthdayIdentity(person: {
  choice: VisibilityChoice;
  isMinor: boolean;
  fullName: string;
  displayName: string | null;
  birthdayGreetings: boolean;
}): PublicIdentity {
  if (!person.birthdayGreetings) return HIDDEN;
  if (person.isMinor) return HIDDEN;
  const identity = publicIdentity(person);
  return identity.show ? { show: true, name: identity.name, photo: false } : HIDDEN;
}
