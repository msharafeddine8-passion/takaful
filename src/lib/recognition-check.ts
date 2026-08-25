/**
 * The rules that decide whether a staff member's badge instruction is allowed,
 * separated from the action that carries it out.
 *
 * `actions/recognition-admin.ts` is a 'use server' module and `achievements.ts`
 * is `server-only`, so neither can be imported by a probe. These checks are the
 * part worth holding: each exists because of a specific way the recognition
 * system can be made to lie, and a rule that lives only inside a server action
 * is a rule nobody tests.
 *
 * The set of automatically-computed codes is passed in rather than imported,
 * which is what keeps this module free of `server-only`. The caller passes
 * `ACHIEVEMENTS.map((d) => d.code)`; probe-recognition passes its own list and
 * checks the rule, and probe-achievements already holds the definitions.
 */

export type Refusal =
  | 'needBoth'
  | 'needReason'
  | 'notYourself'
  | 'ruleOwnsIt';

/** Long enough that somebody reading the audit log a year later learns something. */
export const MIN_REASON = 10;

export type Instruction = {
  email: string;
  code: string;
  reason: string;
  actorId: string;
  targetId: string;
};

/** True when the automatic pass computes this code and would undo a manual grant. */
export function ruleOwns(code: string, automaticCodes: readonly string[]): boolean {
  return automaticCodes.includes(code.trim());
}

function shared(input: Instruction): Refusal | null {
  if (!input.email.trim() || !input.code.trim()) return 'needBoth';
  if (input.reason.trim().length < MIN_REASON) return 'needReason';
  /*
   * Self-acting is refused in both directions. Not because withdrawing your own
   * badge harms anybody, but because a record where the actor and the subject
   * are the same person proves nothing about the person — and the roles table
   * has refused self-grants since migration 001's chk_user_roles_no_self_grant.
   * Two rules that disagree invite an argument about which one is right.
   */
  if (input.actorId === input.targetId) return 'notYourself';
  return null;
}

/**
 * Whether a by-hand grant may go ahead.
 *
 * The `ruleOwnsIt` refusal is the one that matters and the least obvious.
 * Granting, by hand, a badge the engine also computes appears to work: the row
 * is inserted, the volunteer is notified, the badge shows on their wall. Then
 * somebody verifies an hour, recomputeAchievements runs, finds that code below
 * its threshold, and withdraws it — with the engine's generic reason, from
 * nobody, on a day unconnected to anything. The volunteer sees a badge they
 * were given taken back for no stated cause.
 *
 * Refusing at the door is the only place this can be caught: by the time it
 * happens the two events are weeks apart and look unrelated.
 */
export function checkGrant(
  input: Instruction,
  automaticCodes: readonly string[],
): Refusal | null {
  const first = shared(input);
  if (first) return first;
  if (ruleOwns(input.code, automaticCodes)) return 'ruleOwnsIt';
  return null;
}

/**
 * Whether a withdrawal may go ahead.
 *
 * The same checks minus `ruleOwnsIt`, deliberately. Correcting a badge that
 * stands on data which turned out to be wrong is a real thing staff need to do,
 * and if the automatic pass restores it afterwards that means the figures
 * genuinely support it — the right outcome, not a surprise.
 */
export function checkWithdraw(input: Instruction): Refusal | null {
  return shared(input);
}
