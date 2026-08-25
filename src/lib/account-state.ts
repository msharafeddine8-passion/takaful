/**
 * What this person's dashboard is actually about.
 *
 * The account page used to render every banner it could and let the volunteer
 * work out which one applied to them: a safeguarding prompt, a roster-claim
 * offer, a pending-application notice, a stage card, a next-step card and four
 * figures, stacked. Six things asking for attention is the same as none.
 *
 * So the page now resolves one *audience* and one *next step* before it renders
 * anything. Both are decided here, in one pure function, for two reasons: a
 * screen that decides its own priorities eventually disagrees with another
 * screen, and priorities that live in JSX cannot be tested. probe-account-state
 * holds the ordering directly.
 *
 * Nothing here touches the database — it is handed the facts and returns a
 * decision. No `server-only`, so a probe can import it.
 */

/** The six situations a person can be in, in the order they are checked. */
export type Audience =
  | 'suspended'          // the account is stopped; nothing else matters
  | 'rejected'           // an application was declined
  | 'roster-unlinked'    // a volunteer the association already knows, not yet linked
  | 'application-pending'// asked to join, waiting on a decision
  | 'volunteer'          // a volunteer, active or newly accepted
  | 'learner';           // here for the courses, and that is a complete answer

/** Every next step the dashboard knows how to ask for. */
export type StepKey =
  | 'safeguarding'       // no emergency contact on file, and they volunteer
  | 'claim-roster'       // their record is waiting to be claimed
  | 'apply'              // no application, no roster line, not a volunteer
  | 'await-decision'     // nothing to do but wait, said plainly
  | 'stage-requirement'  // the journey engine named something specific
  | 'finish-course'      // a course was started and not finished
  | 'attend-activity'    // registered for something upcoming
  | 'find-activity'      // a volunteer with nothing in the diary
  | 'start-learning'     // no course ever opened
  | 'nothing';           // genuinely nothing owed, and that is worth saying

export type Step = {
  key: StepKey;
  /** Where the single primary button goes, relative to /{lang}. */
  href: string;
  /** Filled in by the caller from the journey engine, for the wording. */
  detail?: { courseSlug?: string; activityId?: string; stageNumber?: number; label?: string };
};

export type AccountFacts = {
  accountStatus: 'active' | 'suspended' | 'deactivated';
  membershipStatus: string;
  /** A claimed roster line that staff have not confirmed yet. */
  rosterClaimPending: boolean;
  /** Their record exists and nobody has claimed it — offered, not yet taken. */
  rosterOffered: boolean;
  applicationOpen: boolean;
  applicationRejected: boolean;
  hasSafeguarding: boolean;
  /** From journeyFor(): the requirement the engine says to do next, if any. */
  stageRequirement: { stageNumber: number; label: string; courseSlug: string | null } | null;
  courseInProgress: string | null;
  coursesPassed: number;
  nextActivityId: string | null;
  isVolunteer: boolean;
};

/** Standings that already mean "this person volunteers here". */
export const VOLUNTEER_STANDING: readonly string[] = [
  'accepted_volunteer', 'active_volunteer', 'inactive_volunteer', 'volunteer_alumni',
];

export function audienceOf(f: AccountFacts): Audience {
  if (f.accountStatus === 'suspended' || f.membershipStatus === 'suspended') return 'suspended';
  if (f.membershipStatus === 'rejected' || f.applicationRejected) return 'rejected';
  if (f.isVolunteer) return 'volunteer';
  if (f.rosterClaimPending || f.rosterOffered) return 'roster-unlinked';
  if (f.applicationOpen) return 'application-pending';
  return 'learner';
}

/**
 * The one thing to put in the primary card.
 *
 * Ordered by what actually blocks the person, not by what the association
 * would like them to do. Safeguarding comes first for volunteers because
 * without it the association has somebody, possibly a minor, going to a field
 * activity with no emergency contact — every other prompt can wait behind that
 * one. Waiting states come next, because telling somebody to do something they
 * cannot do yet is worse than telling them to wait.
 */
export function nextStepOf(f: AccountFacts): Step {
  const audience = audienceOf(f);

  // Nothing is actionable while the account is stopped, and pretending
  // otherwise would be a cruel kind of tidiness.
  if (audience === 'suspended' || audience === 'rejected') {
    return { key: 'nothing', href: '/account/notifications' };
  }

  /*
   * Safeguarding details are NOT the headline step, deliberately.
   *
   * They used to be: any volunteer without a record was told, above
   * everything else, to go and fill one in. The association collects this on
   * paper in the office and has done for years, so for most of these people
   * the platform was demanding something they had already given — and the one
   * task a volunteer sees first should be one they can actually act on.
   *
   * It stays in otherTasksOf as an offer. Nothing anywhere refuses a
   * volunteer for the want of it, and nothing should start to: a record the
   * association already holds does not become missing because this database
   * cannot see it.
   *
   * The reason to keep offering it at all is narrow and worth stating — a
   * coordinator in the field with a phone can reach an emergency contact that
   * is in here, and cannot reach one that is in a drawer in the office.
   */

  if (audience === 'roster-unlinked') {
    return f.rosterClaimPending
      ? { key: 'await-decision', href: '/account/notifications' }
      : { key: 'claim-roster', href: '/account/claim' };
  }

  if (audience === 'application-pending') {
    return { key: 'await-decision', href: '/account/notifications' };
  }

  if (audience === 'volunteer' && f.stageRequirement) {
    const r = f.stageRequirement;
    return {
      key: 'stage-requirement',
      href: r.courseSlug ? `/academy/${r.courseSlug}` : '/account/journey',
      detail: { stageNumber: r.stageNumber, label: r.label, courseSlug: r.courseSlug ?? undefined },
    };
  }

  if (f.nextActivityId) {
    return {
      key: 'attend-activity',
      href: `/account/activities`,
      detail: { activityId: f.nextActivityId },
    };
  }

  /*
   * Half way through something: the player, not the description. /learn
   * resolves which unit they stopped on, so this stays one string and the
   * resume rule stays in lib/programme/player.ts.
   *
   * The stage requirement above keeps pointing at the overview deliberately.
   * That is a course they have most likely never opened, and the first useful
   * thing about it is what it covers and what it needs first.
   */
  if (f.courseInProgress) {
    return {
      key: 'finish-course',
      href: `/academy/${f.courseInProgress}/learn`,
      detail: { courseSlug: f.courseInProgress },
    };
  }

  /*
   * A volunteer with nothing owed is pointed at the field, not at the academy.
   * Most of the people this applies to were recognised from the roster after
   * years of service and have passed no courses at all; opening their
   * dashboard with "start a course" tells someone who has volunteered since
   * 2018 that they have not begun. Learning is offered underneath instead.
   */
  if (audience === 'volunteer') return { key: 'find-activity', href: '/account/activities' };

  if (f.coursesPassed === 0) return { key: 'start-learning', href: '/academy' };
  return { key: 'nothing', href: '/academy' };
}

/**
 * The rest, for the small "other tasks" list under the primary card.
 *
 * Deliberately excludes whatever became the primary step, so the same thing is
 * never asked for twice on one screen.
 */
export function otherTasksOf(f: AccountFacts): StepKey[] {
  const primary = nextStepOf(f).key;
  const tasks: StepKey[] = [];

  // A stopped account gets no to-do list at all, primary or otherwise.
  const audience = audienceOf(f);
  if (audience === 'suspended' || audience === 'rejected') return [];

  if (f.isVolunteer && !f.hasSafeguarding) tasks.push('safeguarding');
  if (f.rosterOffered && !f.rosterClaimPending) tasks.push('claim-roster');
  if (f.courseInProgress) tasks.push('finish-course');
  if (f.nextActivityId) tasks.push('attend-activity');
  // Offered rather than demanded — see nextStepOf.
  if (f.isVolunteer && !f.courseInProgress && f.coursesPassed === 0) tasks.push('start-learning');

  return tasks.filter((k) => k !== primary);
}

/**
 * Interests, skills and languages as a list.
 *
 * They are one free-text column each, typed by a person into a single box, and
 * profileCompleteness wants arrays. Both commas are accepted: the Arabic «،» is
 * what an Arabic keyboard produces and is what most of these fields actually
 * contain, so splitting on the Latin one alone read a whole list as one item —
 * which still counts as filled in, but produced nonsense anywhere the items are
 * shown separately.
 */
export function listFrom(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,،؛;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * How complete the profile is, as a fraction of the fields that are worth
 * filling in. Shown only when something is genuinely missing — a ring at 100%
 * is decoration, and a prompt to complete something already complete is noise.
 */
export function profileCompleteness(p: {
  photoRef: string | null; bio: string | null;
  interests: string[] | null; skills: string[] | null; languages: string[] | null;
}): { done: number; total: number; missing: string[] } {
  const fields: Array<[string, boolean]> = [
    ['photo', Boolean(p.photoRef)],
    ['bio', Boolean(p.bio && p.bio.trim())],
    ['interests', Boolean(p.interests?.length)],
    ['skills', Boolean(p.skills?.length)],
    ['languages', Boolean(p.languages?.length)],
  ];
  return {
    done: fields.filter(([, ok]) => ok).length,
    total: fields.length,
    missing: fields.filter(([, ok]) => !ok).map(([name]) => name),
  };
}
