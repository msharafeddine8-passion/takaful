import 'server-only';
import { randomUUID } from 'node:crypto';
import { query, queryOne, transaction } from './db';
import { countsTowardsLevel, snapshotFor } from './programme/gate';
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
 * certificate and records no attempt.
 *
 * WHAT CHANGED. gate.ts and credentials.ts now DO consult these rows: a
 * finished run is half of what closes a level, the other half being the
 * level's courses. The head of migration 042 says the opposite, in capitals,
 * and it is right about the day it was written — read it as history, and read
 * the reversal in gate.ts:levelClosed as the rule.
 *
 * What did NOT change is the shape of what may be read out of here. A run
 * still carries no score, and finishing it is the whole of what the gate asks:
 * `finished_at IS NOT NULL`, never the verdict. Nothing downstream can tell a
 * `review` from a `clear`, which is what keeps three words about a decision
 * from becoming a mark about a person.
 *
 * ── WHO MAY OPEN ONE ───────────────────────────────────────────────────────
 *
 * A signed-in learner whose courses for the level are behind them — see
 * readyForRun, and note it is not "who has completed the level" any more,
 * because finishing this is what completes it. It is read from the same passes
 * gate.ts reads, so there is one rule and not two. Nothing is
 * walled off that was reachable yesterday.
 *
 * The check is re-run on every write rather than trusted from the page that
 * rendered the form. A page decides what to draw; it does not decide who
 * somebody is.
 *
 * ── WHAT A ROW MAY CONTAIN ─────────────────────────────────────────────────
 *
 * A level, a seed, a list of decisions and one of three words. Nothing in this
 * table names anybody and nothing in it is a number, so there is no figure here
 * that two volunteers could be lined up against.
 *
 * ── THE TWO QUERIES THAT READ ACROSS PEOPLE, AND WHY ───────────────────────
 *
 * Everything a learner sees is scoped to their own user_id. The exceptions are
 * reviewQueue() and runForReview() at the foot of this file, which exist so
 * that a run ending in `review` is seen by a person rather than by nobody, and
 * both are hedged in two ways that are easy to lose and worth stating here:
 *
 *   1. They order by TIME and by nothing else, and they aggregate nothing.
 *      There is no count per volunteer, no "worst first", no GROUP BY. The full
 *      argument is on reviewQueue() itself.
 *
 *   2. They take exactly one column from `profiles` — full_name — because a
 *      reviewer has to know whose conversation this is. Not `p.*`: the date of
 *      birth and the safeguarding fields live in profiles_sensitive, which no
 *      query in this file touches, and a convenience SELECT would put a
 *      variable carrying one a single careless JSX line from a screen.
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

/*
 * The same columns, qualified, for the two reads at the foot of this file that
 * join `profiles`. Written out rather than derived from the string above,
 * because both tables carry a user_id and an unqualified name in a join is a
 * bug waiting for somebody to add a column to the other table.
 */
const RUN_COLUMNS_JOINED = `r.id, r.level_number, r.challenge_version, r.seed, r.decisions,
  r.outcome,
  ${beirutDay('r.started_at')} AS started_on,
  ${beirutDay('r.finished_at')} AS finished_on`;

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
 * May this learner sit the level's decision run?
 *
 * Renamed from `levelIsComplete`, and the rename is the point: finishing the
 * run is now what completes the level, so a function that returned "the level
 * is complete" as the *precondition* for the run was describing the world
 * backwards. What it actually answers is whether the courses are behind them.
 *
 * `countsTowardsLevel` excludes the level's marked paper. It is revision now,
 * and requiring it here would have made it compulsory in order to reach the
 * thing that replaced it — the reversal quietly undoing itself.
 *
 * Read from the gate's own snapshot, which derives passes from
 * `course_attempts` — so this agrees with the level badge, the certificate and
 * the map by construction rather than by coincidence. Deliberately does NOT
 * read `level_progress`: that table is written after the fact, and a run that
 * depended on it would be unavailable to somebody who had genuinely finished.
 */
export async function readyForRun(userId: string, level: number): Promise<boolean> {
  const snapshot = await snapshotFor(userId);
  const inLevel = snapshot.courses.filter((c) => c.level_number === level);
  if (inLevel.length === 0) return false;
  const required = inLevel.filter(countsTowardsLevel);
  return required.length > 0 && required.every((c) => snapshot.passed.has(c.slug));
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
  if (!(await readyForRun(userId, level))) return { ok: false, reason: 'level-not-complete' };

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
  if (!(await readyForRun(userId, level))) return { ok: false, reason: 'level-not-complete' };

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

// ------------------------------------------------------ runs a person must read

/**
 * A finished run that ended in `review`, and the name to say when opening the
 * conversation about it.
 */
export type RunForReview = {
  id: string;
  learnerId: string;
  /** The name a reviewer needs in order to go and find somebody. Nothing else. */
  fullName: string;
  level: number;
  /** 'YYYY-MM-DD' in Beirut, as text. Never reconstruct a Date from it. */
  finishedOn: string;
};

/** The same, with the stored run, so walk() can rebuild what was on the screen. */
export type RunToRead = RunForReview & { run: Run };

type QueueRow = {
  id: string;
  user_id: string;
  full_name: string | null;
  level_number: number;
  finished_on: string;
};

type ReviewRunRow = RunRow & { user_id: string; full_name: string | null };

/*
 * The two conditions that make a run readable by somebody other than its
 * author, named once and used by both functions below so they cannot drift
 * apart. A `clear` or `held` run, and an unfinished one, are nobody's business
 * but the volunteer's — and the reader below refuses them by the same clause
 * that keeps them out of the list, so a guessed URL opens nothing the queue
 * would not have shown.
 */
const READABLE = `r.finished_at IS NOT NULL AND r.outcome = 'review'`;

/**
 * Every finished run that ended in `review`, newest first.
 *
 * ── WHY THIS READS ACROSS PEOPLE AT ALL ────────────────────────────────────
 *
 * `review` means at least one decision crossed a line the association does not
 * cross. FINISHING a run closes the level whatever it says — that rule lives in
 * gate.ts and nothing here touches it, `review` blocks nothing, and this list
 * is not a door. Without it, somebody could cross that line and be waved
 * through with no person ever knowing. The remedy for that is not a lock. It is
 * making sure a human being sees it.
 *
 * ── THE INVARIANT: TIME ONLY, NEVER PEOPLE ─────────────────────────────────
 *
 * THIS QUERY MAY READ ACROSS PEOPLE. IT MAY NOT ORDER, SCORE, RANK OR
 * AGGREGATE THEM.
 *
 * The ORDER BY is `r.finished_at DESC` and nothing else. There is deliberately
 * no count of runs per volunteer, no "most reviews first", no tally of how
 * often a name appears and no GROUP BY anywhere in this file.
 *
 * The reason is that sorting people is how a queue quietly becomes a league
 * table. The moment this list can be read down the page as an ordering OF
 * VOLUNTEERS rather than of moments, the runs stop being conversations to have
 * and start being evidence about who is worst — which is precisely what
 * migration 042 removed the score column to prevent, and it would come back
 * here disguised as one reasonable-looking ORDER BY. A volunteer appearing
 * twice is two conversations, not a pattern this file is entitled to assert.
 *
 * Newest first, and that is a different choice from the queue in
 * practical-submissions, which is oldest first on purpose. That one is work
 * waiting on a verdict, and the person who has waited longest must not sit at
 * the bottom of it forever. Nothing here waits on a verdict — the level closed
 * when the run finished — so the useful end is the recent one, while the
 * decision is still fresh enough to talk about.
 */
export async function reviewQueue(): Promise<RunForReview[]> {
  const rows = await query<QueueRow>(
    /*
     * profiles is joined for one column. LEFT JOIN rather than JOIN: a missing
     * profile row must not make a run that needs reading disappear from the
     * list — a nameless entry a reviewer has to chase is far better than
     * silence.
     */
    `SELECT r.id, r.user_id, p.full_name, r.level_number,
            ${beirutDay('r.finished_at')} AS finished_on
       FROM level_challenge_runs r
       LEFT JOIN profiles p ON p.user_id = r.user_id
      WHERE ${READABLE}
      ORDER BY r.finished_at DESC`,
  );
  return rows.map((r) => ({
    id: r.id,
    learnerId: r.user_id,
    fullName: r.full_name ?? '',
    level: Number(r.level_number),
    finishedOn: r.finished_on,
  }));
}

/**
 * One run from that queue, by id, so a reviewer can read what was actually met.
 *
 * Returns the stored seed and decisions untouched. Rebuilding the situations,
 * the options and their order is walk()'s job in programme/level-challenge.ts
 * and no part of it is re-derived here — the whole reason the seed is a stored
 * column is that "what was this person actually asked?" has one answer, from
 * one function, this afternoon and next year.
 */
export async function runForReview(runId: string): Promise<RunToRead | null> {
  const row = await queryOne<ReviewRunRow>(
    `SELECT ${RUN_COLUMNS_JOINED}, r.user_id, p.full_name
       FROM level_challenge_runs r
       LEFT JOIN profiles p ON p.user_id = r.user_id
      WHERE r.id = $1 AND ${READABLE}`,
    [runId],
  );
  if (!row) return null;
  const run = toRun(row);
  return {
    id: run.id,
    learnerId: row.user_id,
    fullName: row.full_name ?? '',
    level: run.level,
    finishedOn: run.finishedOn ?? '',
    run,
  };
}
