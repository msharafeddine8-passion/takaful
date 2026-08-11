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
  | 'stages.award'
  | 'certificates.issue'
  | 'certificates.revoke'
  | 'members.manage'
  | 'reports.read'
  | 'audit.read';

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

/** True when the person has any reason to see the staff area at all. */
export function isStaff(user: SessionUser | null): boolean {
  return (
    can(user, 'applications.review') ||
    can(user, 'hours.verify') ||
    can(user, 'members.manage')
  );
}
