/**
 * Who may see what in the academy, decided in one place.
 *
 * There were two answers to that question and neither was enforced.
 * `academy.ts:eligibilityFor` read the static catalogue's `requires` list;
 * `gate.ts:accessToCourse` read the levels out of the database. The course
 * page called the first one — and then rendered the whole course anyway,
 * printing a padlock notice above content it had already built. The lock was
 * decoration: a locked course served every module to anybody with the URL,
 * signed in or not, and offered them a "start the course" button underneath
 * the sentence saying they could not.
 *
 * (What did *not* leak is the answer key — questions are graded server-side
 * and the correct options were never serialised. The exposure was the lesson
 * content, which is bad enough and is what this closes.)
 *
 * One state, named, decided before anything is loaded. The page cannot render
 * a module it never fetched, which is the only version of this that survives
 * somebody later adding a JSON endpoint or a debug dump.
 */

export type AccessState =
  /** Anybody, signed in or not. Orientation and electives. */
  | 'public'
  /** The content is open, but only to somebody with an account. */
  | 'login_required'
  /** A real course, genuinely shut until earlier work is done. */
  | 'prerequisite_locked'
  /** The description is public; the modules and the quiz are not. */
  | 'preview_only'
  /** Restricted to particular roles. */
  | 'staff_only';

export type AccessDecision = {
  state: AccessState;
  /** Whether the modules and questions may be built at all. */
  canRead: boolean;
  /** Whether an attempt may be started and graded. */
  canAttempt: boolean;
};

/**
 * The decision, from facts the caller has already gathered.
 *
 * Pure on purpose: probe-access holds this table directly, because "which
 * courses are readable" is exactly the sort of rule that gets widened by
 * accident and noticed by nobody.
 */
export function decideAccess(f: {
  /** Orientation and electives are open to the public by policy. */
  kind: 'orientation' | 'core' | 'elective' | 'challenge';
  signedIn: boolean;
  /** From the existing gate: are the prerequisites met? */
  prerequisitesMet: boolean;
  /** Content the association has not published yet. */
  published: boolean;
  /** Reserved for a future staff-only kind; false everywhere today. */
  staffOnly?: boolean;
}): AccessDecision {
  if (f.staffOnly) {
    return { state: 'staff_only', canRead: false, canAttempt: false };
  }

  /*
   * Unpublished content is a preview for everyone, including signed-in
   * volunteers who have met every prerequisite. There is nothing to read.
   */
  if (!f.published) {
    return { state: 'preview_only', canRead: false, canAttempt: false };
  }

  /*
   * The shop window: orientation and the electives.
   *
   * This is not a new policy — `gate.ts:accessToCourse` already drew the line
   * exactly here, and this is the same decision moved somewhere it is actually
   * enforced. Somebody deciding whether to volunteer can read the code of
   * conduct and the electives before making an account, which is how they find
   * out what the association is.
   *
   * They still cannot sit the quiz. An attempt belongs to a person and there
   * is nobody to attach it to — which is the association's own wording: "you
   * can read the content, but saving progress, sitting the quiz and earning
   * the certificate need an account".
   */
  if (f.kind === 'orientation' || f.kind === 'elective') {
    return { state: f.signedIn ? 'public' : 'login_required', canRead: true, canAttempt: f.signedIn };
  }

  /*
   * Everything on the path itself needs an account, and then needs the earlier
   * work done. Order matters: an unmet prerequisite is reported as such even
   * to a signed-out visitor, because "sign in" would be misleading advice when
   * signing in would not open it either.
   */
  if (!f.prerequisitesMet) {
    return { state: 'prerequisite_locked', canRead: false, canAttempt: false };
  }
  if (!f.signedIn) {
    return { state: 'login_required', canRead: false, canAttempt: false };
  }
  return { state: 'public', canRead: true, canAttempt: true };
}

/**
 * The word the catalogue card is allowed to use.
 *
 * The card said «متاحة» for courses the page then refused to open. A label
 * that contradicts the thing it labels is worse than no label: it teaches
 * people that the labels mean nothing.
 */
export function badgeFor(state: AccessState): 'available' | 'locked' | 'signIn' | 'soon' {
  switch (state) {
    case 'public': return 'available';
    case 'login_required': return 'signIn';
    case 'prerequisite_locked': return 'locked';
    case 'preview_only': return 'soon';
    case 'staff_only': return 'locked';
  }
}
