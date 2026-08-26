import 'server-only';
import type { Locale } from './i18n';
import type { ContinuityRow } from './continuity';
import { treatAsMinor } from './visibility';
import { rolesFor } from './volunteer-roles';
import { ANONYMOUS, roleTitle } from './volunteer-role-view';

/**
 * The roles a PUBLIC page may print beside a name, and nobody else's.
 *
 * This module exists so that the decision is made once, in one function, with
 * both rules written out in the order they are applied — rather than in a
 * template that happened to be handed a row. It is the same argument
 * lib/visibility.ts makes about itself, and this platform has already published
 * half a credential on a public page by making a decision like this in a
 * template.
 *
 * ── THE THREE GATES, ALL OF WHICH MUST HOLD ────────────────────────────────
 *
 * 1. THE PERSON MAY BE SHOWN AT ALL. `listed` is the set of ids that survived
 *    buildRoll() — which is to say the set for whom consentFor() → publicIdentity()
 *    in lib/continuity.ts returned `show: true`. This function does not re-ask
 *    that question and must never learn how to: two answers to "may this person
 *    appear" is one answer too many, and the second one is always the one that
 *    is wrong on the day it matters.
 *
 * 2. THE ROLE ITSELF SAYS PUBLIC. rolesFor(id, ANONYMOUS) — an ANONYMOUS
 *    viewer, never a widened one, and never viewerOf(user). visibleTo() maps
 *    anonymous to exactly ['public'], so the filter is applied in SQL by the
 *    same function the probe holds. A role marked 'volunteers' or 'staff' is
 *    not merely unrendered here; it never leaves the database. Note that gate 1
 *    and gate 2 are INDEPENDENT: a person who consented to be named has not
 *    thereby consented to have every responsibility they hold published, which
 *    is precisely why volunteer_roles.visibility defaults to 'volunteers' and
 *    not to 'public' (see DEFAULT_ROLE_VISIBILITY).
 *
 * 3. NOBODY treatAsMinor() IS TRUE FOR, INCLUDING UNKNOWN AGES.
 *
 *    This is the rule that is easiest to leave out and worst to leave out, so
 *    it is stated at length. A public page in this codebase carries no legal
 *    name and no photograph for a minor — publicIdentity() strips both, and
 *    what is left is a pseudonym they invented, or silence. That protection
 *    works because a pseudonym on a page of forty people identifies nobody.
 *
 *    A specific institutional role does. «رئيسة لجنة الإعلام» beside a chosen
 *    name is not a hint; inside an association of four hundred people there is
 *    exactly one of her, and anybody who has ever been in a room with the media
 *    committee has just been told which display name belongs to which child.
 *    Attaching the role re-identifies the person the minor rule exists to keep
 *    unidentified, and it does it THROUGH the very mechanism that was supposed
 *    to protect them. So the role is withheld from a minor whatever they chose
 *    and whatever an administrator marked the role as.
 *
 *    Unknown ages are treated as children, because that is what treatAsMinor
 *    already does and this is not the place to argue with it: the cost of being
 *    wrong that way is a volunteer whose chips do not appear, and the cost of
 *    being wrong the other way is a child's responsibility on the open web.
 *
 * ── WHAT LEAVES THIS FILE ──────────────────────────────────────────────────
 *
 * Strings. A Map of user id to a list of TITLES, already in the page's
 * language. No VolunteerRole ever reaches a public template, so a description,
 * an entity id, a start date or a `visibility` column has no route onto the
 * page however the card is later edited — the same allowlist discipline as
 * ContinuityPerson.
 *
 * And no birth date, no age and no "why not". A person withheld under gate 3
 * is absent from the Map in exactly the way a person with no public roles is
 * absent from it, which is the ordinary case for almost everybody. The empty
 * result carries no information about which gate closed.
 */

/**
 * How many chips one card may carry.
 *
 * The same reasoning as BADGE_LIMIT in lib/continuity.ts: a card carrying ten
 * chips has stopped being a thank-you and started being a résumé, and the
 * badges it is meant to sit beside are already capped at six. Taken from the
 * front of the list rolesFor returned — current first, then newest start — and
 * NOT sorted, ranked or scored here. Nothing counts anybody's roles.
 */
export const ROLE_CHIP_LIMIT = 4;

/**
 * Current, public roles for the people a public page has already decided it may
 * name.
 *
 * `today` is the caller's, once for the whole page: asking the clock per person
 * would let a render that straddles midnight judge two people by different
 * calendars, and the calendar is what decides who is a child. It is the same
 * beirutToday() the roll was built with, passed in rather than read here so
 * that this module owns no clock — see the head of lib/continuity.ts.
 */
export async function publicRoleTitles(
  rows: readonly ContinuityRow[],
  /** The ids buildRoll() kept. GATE 1, and this function's only view of it. */
  listed: ReadonlySet<string>,
  lang: Locale,
  today: string,
): Promise<Map<string, string[]>> {
  const eligible = rows.filter((row) => {
    // GATE 1 — publicIdentity(), already asked by consentFor() in buildRoll().
    if (!listed.has(row.id)) return false;
    // GATE 3 — the minor exclusion. Unknown ages come back true and are dropped.
    return !treatAsMinor({
      sensitiveDob: row.sensitive_dob,
      safeguardingDob: row.safeguarding_dob,
      rosterDob: row.roster_dob,
      today,
    });
  });

  const found = await Promise.all(
    eligible.map(async (row) => {
      /* GATE 2 — ANONYMOUS, so the query binds visibility = ANY(['public']).
       * Never viewerOf(user): a signed-in member of staff reading this page
       * must see exactly what a stranger sees, or the page is only private
       * until an administrator opens it. */
      const roles = await rolesFor(row.id, ANONYMOUS);
      const titles = roles
        .filter((role) => role.isCurrent)
        .slice(0, ROLE_CHIP_LIMIT)
        .map((role) => roleTitle(role, lang));
      return [row.id, titles] as const;
    }),
  );

  const out = new Map<string, string[]>();
  // Absent rather than empty, so "no public roles", "not eligible" and "a minor"
  // are one indistinguishable state as far as anything downstream can tell.
  for (const [id, titles] of found) if (titles.length > 0) out.set(id, titles);
  return out;
}
