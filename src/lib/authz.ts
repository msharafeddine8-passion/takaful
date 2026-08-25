import 'server-only';
import { currentUser, type Role, type SessionUser } from './auth';

/**
 * One place decides who may do what.
 *
 * Postgres could enforce some of this with row-level security, but that needs
 * a database role per request and this application has one connection pool.
 * So the rule is a convention held by code review: no page and no action
 * queries an administrative table without first passing through this file.
 *
 * Capabilities are named after the act, not the role, so a role can be
 * re-scoped later without hunting for every `role === 'program_admin'` in the
 * codebase.
 */

export type Capability =
  | 'applications.review'
  | 'hours.log'
  | 'hours.verify'
  | 'activities.manage'
  | 'challenges.manage'
  | 'stages.award'
  | 'certificates.issue'
  | 'certificates.revoke'
  | 'members.manage'
  | 'reports.read'
  | 'audit.read'
  | 'awards.decide'
  | 'programme.edit'
  | 'programme.publish'
  | 'practical.review';

const GRANTS: Record<Capability, readonly Role[]> = {
  // Deciding who joins.
  'applications.review': ['program_admin', 'super_admin', 'project_coordinator'],

  // Every signed-in member logs their own hours; verifying them is separate,
  // and deliberately cannot be done by the same person (enforced again by a
  // CHECK constraint, because a rule this important should not rest on code
  // alone).
  'hours.log': [
    'registered_user',
    'volunteer',
    'team_leader',
    'instructor',
    'field_supervisor',
    'project_coordinator',
    'content_manager',
    'program_admin',
    'super_admin',
  ],
  'hours.verify': ['team_leader', 'field_supervisor', 'project_coordinator', 'program_admin', 'super_admin'],

  'activities.manage': ['project_coordinator', 'program_admin', 'super_admin'],

  /*
   * Setting a goal for the whole association.
   *
   * Its own capability rather than a reuse of activities.manage, because a
   * challenge is an announcement to every volunteer about what the association
   * is asking of them collectively — a different act from scheduling a field
   * activity, even though the same people do both today. Named for the act, so
   * it can be re-scoped later without hunting for role checks.
   */
  'challenges.manage': ['project_coordinator', 'program_admin', 'super_admin'],

  /*
   * Choosing the volunteer of the month, and the other three.
   *
   * Narrower than challenges.manage on purpose, and narrower than the people
   * who run the shortlist would like. Setting a shared goal is an announcement
   * about what the association is asking for; naming one volunteer above four
   * others is a judgement about people, and it belongs with the same
   * leadership that advances somebody through the six stages.
   *
   * A field supervisor can see the shortlist through /staff and can argue for
   * a name in the room. What they cannot do is be the record of who decided —
   * and since recognition_awards.decided_by is NOT NULL and never deletable,
   * that record is the whole point.
   */
  'awards.decide': ['program_admin', 'super_admin'],

  // Advancing someone through the six stages is a judgement about a person,
  // so it sits with programme leadership rather than field supervisors.
  'stages.award': ['program_admin', 'super_admin'],

  'certificates.issue': ['program_admin', 'super_admin'],
  // Revoking is rarer and more consequential than issuing.
  'certificates.revoke': ['super_admin'],

  'members.manage': ['program_admin', 'super_admin'],

  // Reading totals is not the same as reading people. A coordinator planning
  // next season needs to know where volunteers stall; that does not require
  // the ability to open anyone's record, and these figures name nobody.
  'reports.read': [
    'project_coordinator',
    'field_supervisor',
    'content_manager',
    'program_admin',
    'super_admin',
  ],

  'audit.read': ['super_admin'],

  /*
   * Editing what a course says, and deciding that it may be read.
   *
   * Split deliberately. `content_manager` has existed as a role since the
   * beginning with nothing to manage; this is the thing. But writing a course
   * and publishing it are different acts with different consequences: a draft
   * with a mistake in it is a draft, and a published safeguarding course with
   * a mistake in it is a volunteer acting on wrong information.
   *
   * So a content manager may write and revise freely, and only programme
   * leadership may move a course to published. That is also what makes the
   * draft/review/published states mean anything — if the same person could do
   * both in one click, review would be a formality.
   */
  'programme.edit': ['content_manager', 'instructor', 'program_admin', 'super_admin'],
  'programme.publish': ['program_admin', 'super_admin'],

  /*
   * Reading a learner's written work and saying whether it stands.
   *
   * Its own capability, because neither of the two candidates fits and the
   * mismatch is in a different direction for each.
   *
   * `programme.edit` is the wrong ACT. It governs what a course says, and the
   * role it exists for is `content_manager` — somebody who writes and revises
   * prose. Judging whether one volunteer's risk assessment would keep children
   * safe is a judgement about a person's work, not an edit to a document, and
   * handing it to whoever may reword a paragraph is the same conflation this
   * file already refuses between programme.edit and programme.publish.
   *
   * `hours.verify` is the right act — judging what a volunteer actually did,
   * by a named person, with the same no-self-review rule and the same
   * never-deleted record — and the wrong PEOPLE. It is held by supervisors and
   * coordinators, and pointedly not by `instructor`, who is the person that
   * teaches the course and therefore the only one who can tell whether this
   * activity plan would survive contact with a Saturday morning.
   *
   * So: hours.verify's list unchanged, plus instructor. Nobody loses anything,
   * and the person who taught the material may mark the work done for it.
   */
  'practical.review': [
    'instructor',
    'team_leader',
    'field_supervisor',
    'project_coordinator',
    'program_admin',
    'super_admin',
  ],
};

export function can(user: SessionUser | null, capability: Capability): boolean {
  if (!user) return false;
  if (user.status !== 'active') return false;
  return GRANTS[capability].some((role) => user.roles.includes(role));
}

/** Thrown rather than returned so a page cannot forget to check the result. */
export class Forbidden extends Error {
  constructor(capability: Capability) {
    super(`Missing capability: ${capability}`);
    this.name = 'Forbidden';
  }
}

/**
 * Resolve the signed-in user and assert a capability in one step.
 * Returns the user so the caller does not fetch them twice.
 */
export async function requireCapability(capability: Capability): Promise<SessionUser> {
  const user = await currentUser();
  if (!can(user, capability)) throw new Forbidden(capability);
  return user as SessionUser;
}

/**
 * True when the person has any reason to see the staff area at all.
 *
 * `practical.review` is in the list because it is the one capability an
 * `instructor` holds that produces a queue somebody has to work through. An
 * instructor could reach nothing under /staff before this, which was correct
 * while there was nothing there for them; leaving them out now would mean a
 * trainer with work waiting and no link to it.
 *
 * `programme.edit` is here for the same reason and one role later. It is the
 * capability behind /staff/programme and /staff/learning, and its role
 * `content_manager` held none of the four above — so the association could
 * grant somebody the content manager role, and the platform would then meet
 * them at the door of the staff area with "you do not have permission",
 * hiding the two pages written for them and nothing else. A capability that
 * opens a page nobody can navigate to is a capability that does not exist.
 *
 * The rule this list encodes: if holding a capability means there is a screen
 * under /staff you are expected to use, you can see /staff. It does not decide
 * what you may do once inside — every page checks its own.
 */
export function isStaff(user: SessionUser | null): boolean {
  return (
    can(user, 'applications.review') ||
    can(user, 'hours.verify') ||
    can(user, 'members.manage') ||
    can(user, 'practical.review') ||
    can(user, 'programme.edit')
  );
}
