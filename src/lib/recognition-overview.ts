import 'server-only';
import { query } from './db';
import { ACHIEVEMENTS, standingFor, type AchievementDef } from './achievements';

/**
 * What the recognition panel shows before anybody presses anything.
 *
 * One query for the whole catalogue rather than one per badge: thirty-seven
 * definitions would otherwise be thirty-seven round trips to render a table
 * nobody edits.
 */

export type BadgeStanding = {
  def: AchievementDef;
  /** Out of circulation: granted to nobody new, taken from nobody who holds it. */
  retired: { reason: string; at: string } | null;
  /** Currently held — a withdrawn badge is not counted here. */
  held: number;
  /** Held once and withdrawn since. Worth seeing: a row that climbs is a bug. */
  withdrawn: number;
  /** Granted by a person rather than computed. */
  byHand: number;
};

export async function badgeStandings(): Promise<BadgeStanding[]> {
  const rows = await query<{
    code: string; held: string; withdrawn: string; by_hand: string;
  }>(
    `SELECT code,
            count(*) FILTER (WHERE revoked_at IS NULL)                   AS held,
            count(*) FILTER (WHERE revoked_at IS NOT NULL)               AS withdrawn,
            count(*) FILTER (WHERE automatic = FALSE AND revoked_at IS NULL) AS by_hand
       FROM achievements
      GROUP BY code`,
  );
  const byCode = new Map(rows.map((r) => [r.code, r]));

  /* Only the rows still in force. A lifted retirement is history — the table
   * keeps it because a badge that stopped and restarted has a history — and
   * reading it as current would show a badge as withdrawn from circulation
   * months after somebody deliberately brought it back. */
  const retired = new Map(
    (
      await query<{ code: string; reason: string; at: string; lifted_at: Date | null }>(
        `SELECT code, retire_reason AS reason, to_char(retired_at,'YYYY-MM-DD') AS at, lifted_at
           FROM badge_retirements`,
      )
    )
      .filter((r) => r.lifted_at == null)
      .map((r) => [r.code, { reason: r.reason, at: r.at }]),
  );

  return ACHIEVEMENTS.map((def) => {
    const row = byCode.get(def.code);
    return {
      def,
      retired: retired.get(def.code) ?? null,
      held: Number(row?.held ?? 0),
      withdrawn: Number(row?.withdrawn ?? 0),
      byHand: Number(row?.by_hand ?? 0),
    };
  });
}

/**
 * What recomputing everybody WOULD do, without doing any of it.
 *
 * The association's own rule for this system, written into the brief: never run
 * a backfill against production before showing a preview. This is that preview.
 * It reads exactly what the recompute reads and applies exactly the same
 * comparison, and it writes nothing at all — no INSERT, no UPDATE, no
 * notification, no audit line. A preview that leaves a trace is not a preview.
 *
 * Same cost as the real thing, which is why it is a button and not something
 * the page does on load.
 */
export type Preview = {
  accounts: number;
  /** Every change, counted. Not the length of the lists below. */
  earnTotal: number;
  withdrawTotal: number;
  wouldEarn: Array<{ name: string; code: string }>;
  wouldWithdraw: Array<{ name: string; code: string }>;
};

export async function previewRecomputeAll(sample = 40): Promise<Preview> {
  const people = await query<{ id: string; full_name: string | null }>(
    `SELECT u.id, p.full_name FROM users u LEFT JOIN profiles p ON p.user_id = u.id`,
  );
  const wouldEarn: Array<{ name: string; code: string }> = [];
  const wouldWithdraw: Array<{ name: string; code: string }> = [];

  for (const person of people) {
    const standing = await standingFor(person.id);
    const held = new Map(
      (
        await query<{ code: string; revoked_at: Date | null }>(
          'SELECT code, revoked_at FROM achievements WHERE user_id = $1',
          [person.id],
        )
      ).map((r) => [r.code, r.revoked_at]),
    );
    const name = person.full_name ?? person.id;

    for (const def of ACHIEVEMENTS) {
      const qualifies = standing[def.kind] >= def.threshold;
      const has = held.has(def.code);
      const isRevoked = has && held.get(def.code) !== null;
      if (qualifies && (!has || isRevoked)) wouldEarn.push({ name, code: def.code });
      if (!qualifies && has && !isRevoked) wouldWithdraw.push({ name, code: def.code });
    }
  }

  /*
   * Truncated for display, and the totals are NOT truncated with it — the page
   * shows how many there are and then some of them. A preview that silently
   * showed the first forty of three hundred changes would be read as "forty
   * changes", which is the one thing a preview must never be wrong about.
   */
  return {
    accounts: people.length,
    earnTotal: wouldEarn.length,
    withdrawTotal: wouldWithdraw.length,
    wouldEarn: wouldEarn.slice(0, sample),
    wouldWithdraw: wouldWithdraw.slice(0, sample),
  };
}

/**
 * What staff have done to badges lately.
 *
 * /staff/audit already holds every audit line and can be filtered, but nobody
 * filters it — the log a person actually reads is the one on the page where
 * they did the thing. This is the same rows, narrowed to this subject, shown
 * where the buttons are.
 *
 * The actor's name is joined in. An audit line that says only "a badge was
 * withdrawn" is the shape of a log that exists to be pointed at rather than
 * read: if it cannot say who, it is not accountability.
 */
export type RecognitionChange = {
  at: string;
  action: string;
  actor: string | null;
  /**
   * The line was written by the platform, not by a person.
   *
   * Distinct from `actor === null`, which this page used to render as
   * "unknown". audit_logs.actor_id is documented in migration 001 as "NULL
   * means the system", so every automatic recognition and every
   * recomputed_all line was reading as though the platform had lost track of
   * who did it — which is the one thing an audit log must never appear to have
   * done.
   */
  bySystem: boolean;
  subject: string | null;
  code: string | null;
  reason: string | null;
};

export async function recentChanges(limit = 25): Promise<RecognitionChange[]> {
  const rows = await query<{
    at: string; action: string; actor: string | null; bySystem: boolean;
    subject: string | null; code: string | null; reason: string | null;
  }>(
    `SELECT a.created_at::TEXT              AS at,
            a.action,
            actor.full_name                 AS actor,
            (a.actor_id IS NULL)            AS "bySystem",
            subject.full_name               AS subject,
            a.new_value ->> 'code'          AS code,
            a.reason
       FROM audit_logs a
       LEFT JOIN profiles actor   ON actor.user_id = a.actor_id
       /*
        * The user id is cast to text, not the target_id to uuid.
        *
        * audit_logs.target_id is TEXT and does not always hold a uuid —
        * recomputeAllAction writes the literal 'all'. Casting target_id to
        * uuid would raise "invalid input syntax for type uuid" on that row,
        * and the target_type = 'user' condition is no protection: a planner is
        * free to evaluate the cast before the filter. Casting the other way
        * cannot fail on any input.
        *
        * (No backticks in this comment. It lives inside a template literal,
        * and one would end the string here.)
        */
       LEFT JOIN profiles subject ON subject.user_id::text = a.target_id
                                 AND a.target_type = 'user'
      WHERE a.action LIKE 'achievement%'
      ORDER BY a.created_at DESC
      LIMIT $1`,
    [limit],
  );
  return rows;
}

/**
 * Badges present in the table that no definition explains.
 *
 * Two ways this happens and both need saying out loud. A badge granted by hand
 * under a code of somebody's invention lands here, which is correct and is how
 * the panel accounts for it. A badge whose definition was renamed or removed in
 * the code also lands here — and that one is a fault: volunteers are holding
 * something the platform can no longer describe, and it will sit on their wall
 * with no title until somebody notices. Listing it is how somebody notices.
 */
export async function unexplainedCodes(): Promise<Array<{ code: string; held: number }>> {
  const known = ACHIEVEMENTS.map((d) => d.code);
  const rows = await query<{ code: string; held: string }>(
    `SELECT code, count(*) AS held
       FROM achievements
      WHERE revoked_at IS NULL AND NOT (code = ANY ($1::text[]))
      GROUP BY code
      ORDER BY count(*) DESC, code`,
    [known],
  );
  return rows.map((r) => ({ code: r.code, held: Number(r.held) }));
}
