import 'server-only';
import { randomUUID } from 'node:crypto';
import { query, queryOne, transaction } from './db';
import { snapshotFor } from './programme/gate';
import {
  challengeFingerprint,
  challengeForLevel,
  checkMove,
  outcomeOf,
  seedFor,
  walk,
  type Decision,
  type Outcome,
} from './programme/level-challenge';

/**
 * Reading and writing level decision runs.
 *
 * The rules are next door in programme/level-challenge.ts, where a probe can
 * reach them without a database. This file is the part that cannot be pure:
 * the queries, the transaction that appends one decision, and the one place
 * that decides whether somebody may open a run at all.
 *
 * ── WHAT THIS MAY NOT DO, AND STRUCTURALLY CANNOT ──────────────────────────
 *
 * It writes to `level_challenge_runs` and to nothing else. It issues no
 * certificate, records no attempt, touches no level_progress row and returns
 * nothing that gate.ts or credentials.ts consults. A volunteer who never opens
 * a run is in precisely the position they were in before the feature existed —
 * which is the promise, and the reason the rows live in a table of their own.
 * See the head of migration 042.
 *
 * ── WHO MAY OPEN ONE ───────────────────────────────────────────────────────
 *
 * A signed-in learner who has already completed the level. That is not a new
 * rule and not a new gate: it is read from the same passes gate.ts reads, and
 * it sits *behind* an achievement rather than in front of one. Nothing is
 * walled off that was reachable yesterday.
 *
 * The check is re-run on every write rather than trusted from the page that
 * rendered the form. A page decides what to draw; it does not decide who
 * somebody is.
 *
 * ── WHAT A ROW MAY CONTAIN ─────────────────────────────────────────────────
 *
 * A level, a seed, a list of decisions and one of three words. No profile is
 * joined here and no query in this file selects from `profiles` — so there is
 * no variable in this feature that could carry a date of birth, an age or a
 * safeguarding field, and nothing one careless JSX line away from rendering
 * one. Every query is scoped to a single user_id, so there is nothing to sort
 * across people and nothing to compare.
 *
 * ── DATES ──────────────────────────────────────────────────────────────────
 *
 * The session runs GMT and the association is in Beirut. Any day this file
 * hands upward is produced by Postgres as 'YYYY-MM-DD' text, already shifted to
 * Asia/Beirut, and is compared and rendered as text from there on. Nothing
 * downstream rebuilds a Date from it: a run started at 00:30 Beirut on the 5th
 * would read as the 4th the moment anything did.
 */

/*
 * to_char over AT TIME ZONE, not the bare timestamp. Named once and reused,
 * because the correction is easy to leave out of exactly one query and
 * impossible to notice afterwards — see the same note in practical-submissions.
 */
const beirutDay = (column: string) =>
  `to_char(${column} AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')`;

const RUN_COLUMNS = `id, level_number, challenge_version, seed, decisions, outcome,
  ${beirutDay('started_at')} AS started_on,
  ${beirutDay('finished_at')} AS finished_on`;

type RunRow = {
  id: string;
  level_number: number;
  challenge_version: string;
  /** BIGINT arrives from the driver as a string; never use it unparsed. */
  seed: string | number;
  decisions: Decision[];
  outcome: Outcome | null;
  started_on: string;
  finished_on: string | null;
};

export type Run = {
  id: string;
  level: number;
  challengeVersion: string;
  seed: number;
  decisions: Decision[];
  outcome: Outcome | null;
  /** 'YYYY-MM-DD' in Beirut, as text. Never reconstruct a Date from it. */
  startedOn: string;
  finishedOn: string | null;
};

const toRun = (r: RunRow): Run => ({
  id: r.id,
  level: Number(r.level_number),
  challengeVersion: r.challenge_version,
  // Number(), because pg hands a BIGINT back as a string and hashing arithmetic
  // on "1234567890" silently produces something else entirely.
  seed: Number(r.seed),
  decisions: Array.isArray(r.decisions) ? r.decisions : [],
  outcome: r.outcome,
  startedOn: r.started_on,
  finishedOn: r.finished_on,
});

/**
 * Has this learner finished every course in the level?
 *
 * Read from the gate's own snapshot, which derives passes from
 * `course_attempts` — so this agrees with the level badge, the certificate and
 * the map by construction rather than by coincidence. Deliberately does NOT
 * read `level_progress`: that table is written after the fact, and a run that
 * depended on it would be unavailable to somebody who had genuinely finished.
 */
export async function levelIsComplete(userId: string, level: number): Promise<boolean> {
  const snapshot = await snapshotFor(userId);
  const inLevel = snapshot.courses.filter((c) => c.level_number === level);
  if (inLevel.length === 0) return false;
  return inLevel.every((c) => snapshot.passed.has(c.slug));
}

/** The run this learner has open on a level, if any. */
export async function openRun(userId: string, level: number): Promise<Run | null> {
  const row = await queryOne<RunRow>(
    `SELECT ${RUN_COLUMNS} FROM level_challenge_runs
      WHERE user_id = $1 AND level_number = $2 AND finished_at IS NULL`,
    [userId, level],
  );
  return row ? toRun(row) : null;
}

/** Everything this learner has finished on a level, newest first. */
export async function finishedRuns(userId: string, level: number): Promise<Run[]> {
  const rows = await query<RunRow>(
    `SELECT ${RUN_COLUMNS} FROM level_challenge_runs
      WHERE user_id = $1 AND level_number = $2 AND finished_at IS NOT NULL
      ORDER BY started_at DESC`,
    [userId, level],
  );
  return rows.map(toRun);
}

/** The levels this learner has ever run, for the one link on the journey page. */
export async function levelsRun(userId: string): Promise<Set<number>> {
  const rows = await query<{ level_number: number }>(
    'SELECT DISTINCT level_number FROM level_challenge_runs WHERE user_id = $1',
    [userId],
  );
  return new Set(rows.map((r) => Number(r.level_number)));
}

export type StartResult =
  | { ok: true; run: Run }
  | { ok: false; reason: 'level-not-complete' | 'no-challenge' | 'db' };

/**
 * Opens a run, or hands back the one already open.
 *
 * The seed is derived from the user and the freshly minted run id and then
 * stored, so a second run by the same person on the same level walks a
 * different path — which is what makes taking it again worth anything.
 *
 * A learner with a run already open gets that one rather than a new one. Two
 * tabs racing for uq_lcr_open_once is the ordinary case, not the exotic one,
 * and losing that race means the other tab's run is the run.
 */
export async function startRun(userId: string, level: number): Promise<StartResult> {
  const def = challengeForLevel(level);
  if (!def) return { ok: false, reason: 'no-challenge' };
  if (!(await levelIsComplete(userId, level))) return { ok: false, reason: 'level-not-complete' };

  const existing = await openRun(userId, level);
  if (existing) return { ok: true, run: existing };

  const id = randomUUID();
  try {
    const row = await queryOne<RunRow>(
      `INSERT INTO level_challenge_runs
         (id, user_id, level_number, challenge_version, seed)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${RUN_COLUMNS}`,
      [id, userId, level, challengeFingerprint(def), seedFor(userId, id)],
    );
    return row ? { ok: true, run: toRun(row) } : { ok: false, reason: 'db' };
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      const won = await openRun(userId, level);
      if (won) return { ok: true, run: won };
    }
    return { ok: false, reason: 'db' };
  }
}

export type DecisionResult =
  | { ok: true; run: Run; finished: boolean }
  | {
      ok: false;
      /*
       * The four in the middle come straight back from checkMove() rather than
       * being flattened into one 'refused'. They are the difference between a
       * stale tab (wrong-step), a run that ended while somebody was reading
       * (finished), an option that was never on the screen (unknown-choice) and
       * a row that no longer walks (broken) — and only the last of those is
       * anybody's bug.
       */
      reason:
        | 'level-not-complete'
        | 'no-challenge'
        | 'no-run'
        | 'wrong-step'
        | 'unknown-choice'
        | 'finished'
        | 'broken'
        | 'db';
    };

/**
 * Records one decision against the open run.
 *
 * The row is locked and re-read inside the transaction rather than trusted from
 * the page the learner was looking at, which may be a stale tab. Everything the
 * decision is checked against — where the run stands, which options that
 * situation offers — is recomputed from the stored seed and the stored
 * decisions by checkMove(), so a crafted request cannot skip to the last
 * situation, cannot answer one twice after reading its consequence, and cannot
 * name an option that was never on the screen.
 *
 * The eligibility check runs again here. The page that drew the form is not
 * evidence of anything by the time a POST arrives.
 */
export async function recordDecision(
  userId: string,
  level: number,
  move: Decision,
): Promise<DecisionResult> {
  const def = challengeForLevel(level);
  if (!def) return { ok: false, reason: 'no-challenge' };
  if (!(await levelIsComplete(userId, level))) return { ok: false, reason: 'level-not-complete' };

  try {
    return await transaction(async (client) => {
      const { rows } = await client.query<RunRow>(
        `SELECT ${RUN_COLUMNS} FROM level_challenge_runs
          WHERE user_id = $1 AND level_number = $2 AND finished_at IS NULL
          FOR UPDATE`,
        [userId, level],
      );
      const row = rows[0];
      if (!row) return { ok: false as const, reason: 'no-run' as const };
      const run = toRun(row);

      const verdict = checkMove(def, run.seed, run.decisions, move);
      if (!verdict.ok) return { ok: false as const, reason: verdict.reason };

      const decisions = [...run.decisions, move];

      /*
       * Whether that was the last decision is decided by walking the tree, not
       * by counting: the run ends where the authored path ends, and a count
       * would go wrong the moment a challenge gained a round.
       */
      const path = walk(def, run.seed, decisions);
      if (!path.ok) return { ok: false as const, reason: 'broken' as const };
      const finished = path.done;
      const outcome = finished ? outcomeOf(path.walked) : null;

      const updated = await client.query<RunRow>(
        `UPDATE level_challenge_runs
            SET decisions = $3::jsonb,
                outcome = $4,
                finished_at = CASE WHEN $5::boolean THEN now() ELSE NULL END
          WHERE id = $1 AND user_id = $2 AND finished_at IS NULL
          RETURNING ${RUN_COLUMNS}`,
        [run.id, userId, JSON.stringify(decisions), outcome, finished],
      );
      const after = updated.rows[0];
      if (!after) return { ok: false as const, reason: 'db' as const };
      return { ok: true as const, run: toRun(after), finished };
    });
  } catch {
    return { ok: false, reason: 'db' };
  }
}
