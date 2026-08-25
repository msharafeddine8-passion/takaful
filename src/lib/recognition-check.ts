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
 * ONE REFUSAL WAS REMOVED FROM HERE, and the reason matters more than the rule
 * that replaced it.
 *
 * Granting by hand a badge the engine also computes used to be refused. The
 * danger was real: the row went in, the volunteer was notified, and then a
 * recompute weeks later found the figure short of the threshold and withdrew
 * it — generic reason, from nobody, on an unrelated day. Refusing at the door
 * was the only place to catch it.
 *
 * But refusing at the door left the association unable to do a thing it
 * legitimately needs to do: honour somebody for work that predates the
 * platform, or work no ledger recorded. So the fix moved to the root instead.
 * The engine now skips any badge a person granted — see recomputeAchievements —
 * so a hand-granted badge is stable whatever the figures say, and the refusal
 * it needed is gone. A guard that stops people doing legitimate work is worth
 * keeping only until the underlying danger can be removed.
 */

export type Refusal =
  | 'needPerson'
  | 'needBadge'
  | 'needReason'
  | 'notYourself';

/** Long enough that somebody reading the audit log a year later learns something. */
export const MIN_REASON = 10;

export type Instruction = {
  /** The account being acted on. Empty when the search found nobody. */
  targetId: string;
  /** One or more badge codes, chosen from the catalogue rather than typed. */
  codes: readonly string[];
  reason: string;
  actorId: string;
};

function shared(input: Instruction): Refusal | null {
  if (!input.targetId.trim()) return 'needPerson';
  /*
   * Blank codes are dropped before counting. A checkbox list posts nothing at
   * all when none is ticked, but a hand-built request can post an empty string,
   * and a badge with an empty code would be a row nothing can ever explain.
   */
  if (input.codes.filter((c) => c.trim()).length === 0) return 'needBadge';
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

/** Whether a by-hand grant of one or more badges may go ahead. */
export function checkGrant(input: Instruction): Refusal | null {
  return shared(input);
}

/**
 * Whether a withdrawal may go ahead.
 *
 * The same checks. Correcting a badge that stands on data which turned out to
 * be wrong is a real thing staff need to do, and if the figures still support
 * it the next recompute restores it — the right outcome, not a surprise.
 */
export function checkWithdraw(input: Instruction): Refusal | null {
  return shared(input);
}

/**
 * The codes to act on, cleaned.
 *
 * Deduplicated because a form can post the same value twice and granting the
 * same badge twice in one request would either fail on the unique index or
 * write a second audit line for one decision.
 */
export function codesFrom(raw: readonly string[]): string[] {
  return [...new Set(raw.map((c) => c.trim()).filter(Boolean))];
}
