import 'server-only';
import { transaction } from './db';

/**
 * Allocating verified hours to stage requirements.
 *
 * Architecture decision 1: a minute counts toward at most one requirement.
 * Without that, one afternoon of work could satisfy every stage at once and
 * the six-stage journey would mean nothing.
 *
 * Allocation is deterministic: oldest work first, earliest unmet requirement
 * first. Running it twice changes nothing, and running it after a correction
 * produces exactly the state you would get by starting from an empty table —
 * which is what makes it safe to run whenever anything moves.
 */

export type AllocationResult = {
  allocated: number;      // minutes newly allocated
  entriesTouched: number;
  requirementsSatisfied: string[];
};

/**
 * Brings a volunteer's allocations up to date.
 *
 * Call after: hours verified, hours corrected, a stage requirement changed,
 * or a journey version reassigned. Cheap and idempotent, so calling it when
 * unsure is the right instinct.
 */
export async function reallocate(userId: string): Promise<AllocationResult> {
  return transaction(async (client) => {
    // Requirements this person must meet, in the order they must meet them.
    const { rows: requirements } = await client.query<{
      requirement_id: string;
      stage_number: number;
      target: string;
      allocated: string;
    }>(
      `SELECT r.id AS requirement_id,
              s.number AS stage_number,
              (r.config->>'minutes') AS target,
              COALESCE(am.minutes, 0)::TEXT AS allocated
         FROM active_stage_requirements r
         JOIN journey_stages s ON s.id = r.stage_id
         JOIN current_journey_assignment a
           ON a.version_id = s.version_id AND a.user_id = $1
         LEFT JOIN allocated_minutes am
           ON am.requirement_id = r.id AND am.user_id = $1
        WHERE r.kind = 'hours'
        ORDER BY s.number, r.sort_order, r.id`,
      [userId],
    );

    if (requirements.length === 0) {
      return { allocated: 0, entriesTouched: 0, requirementsSatisfied: [] };
    }

    // Verified work with minutes still to give, oldest first. Oldest-first
    // matters: it means the hours that filled Stage 1 are the hours actually
    // worked during Stage 1, so the record reads the way the year happened.
    const { rows: entries } = await client.query<{
      hour_entry_id: string;
      remaining_minutes: number;
    }>(
      `SELECT hour_entry_id, remaining_minutes
         FROM unallocated_hours
        WHERE user_id = $1
        ORDER BY worked_on ASC, hour_entry_id ASC`,
      [userId],
    );

    let allocated = 0;
    const touched = new Set<string>();
    const satisfied: string[] = [];

    const pending = requirements.map((r) => ({
      id: r.requirement_id,
      needed: Math.max(0, Number.parseInt(r.target, 10) - Number.parseInt(r.allocated, 10)),
    }));

    // Parsed rather than trusted. The view casts to integer so this is already
    // a number, but a total that ends up on someone's certificate should not
    // depend on remembering which driver returns which SQL type as a string.
    const supply = entries.map((e) => ({
      id: e.hour_entry_id,
      left: Number(e.remaining_minutes),
    }));

    for (const requirement of pending) {
      if (requirement.needed === 0) continue;

      for (const entry of supply) {
        if (requirement.needed === 0) break;
        if (entry.left === 0) continue;

        const take = Math.min(entry.left, requirement.needed);

        await client.query(
          `INSERT INTO hour_allocations (hour_entry_id, requirement_id, user_id, minutes)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (hour_entry_id, requirement_id)
           DO UPDATE SET minutes = hour_allocations.minutes + EXCLUDED.minutes`,
          [entry.id, requirement.id, userId, take],
        );

        entry.left -= take;
        requirement.needed -= take;
        allocated += take;
        touched.add(entry.id);
      }

      if (requirement.needed === 0) satisfied.push(requirement.id);
    }

    return { allocated, entriesTouched: touched.size, requirementsSatisfied: satisfied };
  });
}

/**
 * Rebuilds a volunteer's allocations from nothing.
 *
 * Needed after a correction: releasing one entry can leave a later entry
 * allocated to a requirement an earlier one should have filled, and only a
 * rebuild puts the ledger back in the order the work happened.
 *
 * The whole thing is one transaction, so there is no moment at which someone
 * reading the dashboard sees a volunteer with zero hours.
 */
export async function rebuildAllocations(userId: string): Promise<AllocationResult> {
  await transaction(async (client) => {
    await client.query('DELETE FROM hour_allocations WHERE user_id = $1', [userId]);
  });
  return reallocate(userId);
}
