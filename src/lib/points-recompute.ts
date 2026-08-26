import 'server-only';
import { query, queryOne } from './db';
import {
  POINTS, pointsForMinutes, isActiveMonth, earnsCommitment, awardKey, presentMinutes,
  type Award,
} from './impact';

/**
 * Bringing the points ledger in line with what people have actually done.
 *
 * The badge engine has had this since the beginning: read the verified
 * figures, work out what is owed, write only the difference. Points did not,
 * and the gap showed. Everything that grants a point does it as a side effect
 * of the event that earned it, which is correct and cheap — and it means that
 * anything the platform did not witness leaves no trace. Hours entered from a
 * paper ledger, a certificate issued by a script, an activity whose register
 * was filled in weeks late: all of those move the figures the leaderboard
 * reads and none of them awarded a point.
 *
 * So this exists for the same reason recomputeAchievements does, and it is
 * safe for the same reason: it is derived, not incremental. Run it twice and
 * the answer does not change.
 *
 * WHAT MAKES IT SAFE TO RUN AGAINST PRODUCTION.
 *
 * It only ever INSERTs, and every insert carries a key that migration 032's
 * uq_points_source_once already refuses to accept twice. So the worst a second
 * run can do is nothing. It never updates a row and never deletes one: a point
 * somebody was given is part of their record, and the ledger's own vocabulary
 * for taking one back is a correction or a reversal with its own row, which is
 * a decision a person makes rather than something a recompute does on its own.
 *
 * WHAT IT DELIBERATELY DOES NOT DO.
 *
 * It does not take points away. If a figure fell — hours corrected downward, a
 * certificate revoked — the ledger is adjusted by the code that made that
 * change, through a reversal row that says who and why. A sweep that silently
 * subtracted would leave a volunteer's total dropping with nothing anywhere to
 * explain it, which is the difference between a ledger and a score.
 */

/** One month of one person's verified activity, as the point rules read it. */
type MonthRow = {
  user_id: string;
  period: string;
  minutes: number;
  /** Of those minutes, the ones carried in from before the platform existed. */
  carried: number;
  attended: number;
  registered: number;
};

/*
 * The same shape impact-preview.mts reads, kept here so the page and the
 * script cannot answer differently. Every figure is verified: hours are
 * status='verified', attendance is attended=true, and a cancelled activity is
 * out of the denominator so nobody loses a commitment award because the
 * association called something off.
 *
 * Months are Beirut months. to_char on a timestamptz without the zone would
 * bucket an activity that started at 1am on the first into the month before,
 * for half the year.
 */
const MONTHLY_SQL = `
  WITH months AS (
    SELECT user_id, to_char(worked_on,'YYYY-MM') AS period,
           sum(minutes)::int AS minutes,
           sum(minutes) FILTER (WHERE carried_over)::int AS carried
      FROM hour_entries WHERE status='verified' GROUP BY 1,2
  ), att AS (
    SELECT aa.user_id, to_char(a.starts_at AT TIME ZONE 'Asia/Beirut','YYYY-MM') AS period,
           count(*) FILTER (WHERE aa.attended)::int AS attended
      FROM activity_attendance aa JOIN activities a ON a.id = aa.activity_id
     WHERE a.starts_at IS NOT NULL GROUP BY 1,2
  ), reg AS (
    SELECT ar.user_id, to_char(a.starts_at AT TIME ZONE 'Asia/Beirut','YYYY-MM') AS period,
           count(*)::int AS registered
      FROM activity_registrations ar JOIN activities a ON a.id = ar.activity_id
     WHERE a.starts_at IS NOT NULL AND a.cancelled_at IS NULL AND ar.status <> 'cancelled'
     GROUP BY 1,2
  )
  SELECT COALESCE(m.user_id, att.user_id, reg.user_id)  AS user_id,
         COALESCE(m.period, att.period, reg.period)     AS period,
         COALESCE(m.minutes, 0)                         AS minutes,
         COALESCE(m.carried, 0)                         AS carried,
         COALESCE(att.attended, 0)                      AS attended,
         COALESCE(reg.registered, 0)                    AS registered
    FROM months m
    FULL OUTER JOIN att ON att.user_id=m.user_id AND att.period=m.period
    FULL OUTER JOIN reg ON reg.user_id=COALESCE(m.user_id,att.user_id)
                       AND reg.period=COALESCE(m.period,att.period)`;

export type PointsChange = {
  userId: string;
  name: string;
  period: string;
  kind: Award['kind'];
  points: number;
  key: string;
};

export type PointsPlan = {
  /** People who would gain something. Not a count of rows. */
  people: number;
  rows: number;
  points: number;
  /** A sample, for the page. `rows` is the true figure. */
  sample: PointsChange[];
};

/**
 * What a recompute would write, without writing it.
 *
 * The association's rule for this whole system: nothing is backfilled against
 * real data before somebody has seen what it would do. This reads exactly what
 * the apply step reads and returns the same list; the only difference between
 * them is the INSERT.
 */
export async function planPoints(sample = 40): Promise<PointsPlan> {
  const months = await query<MonthRow>(MONTHLY_SQL);

  const names = new Map(
    (
      await query<{ id: string; full_name: string | null }>(
        'SELECT u.id, p.full_name FROM users u LEFT JOIN profiles p ON p.user_id = u.id',
      )
    ).map((r) => [r.id, r.full_name ?? r.id]),
  );

  /*
   * Every key already in the ledger, read once. The alternative is a query per
   * candidate row, which on a few hundred people across three years of months
   * is thousands of round trips to answer a question one SELECT answers.
   */
  const existing = new Set(
    (
      await query<{ k: string }>(
        /*
         * Built with the same separator awardKey uses, and that is not a
         * detail: this set is compared against keys that function produces, so
         * a colon here against a pipe there would match nothing, every row
         * would look new, and the unique index would be left doing all the
         * work while the preview promised hundreds of writes that never
         * happened.
         */
        `SELECT user_id::text || '|' || source_kind || '|' ||
                COALESCE(source_id,'') || '|' || COALESCE(period,'') AS k
           FROM impact_points`,
      )
    ).map((r) => r.k),
  );

  const changes: PointsChange[] = [];
  for (const m of months) {
    if (!m.user_id || !m.period) continue;
    const owed: Array<{ kind: Award['kind']; points: number }> = [];

    /* Hours are hours. Service given before the platform existed is still
     * service, and the association entered it deliberately. */
    const hours = pointsForMinutes(m.minutes);
    if (hours > 0) owed.push({ kind: 'hours', points: hours });

    /*
     * CARRIED-OVER HOURS DO NOT MAKE A MONTH ACTIVE, and this is the one place
     * the two kinds of award have to be told apart.
     *
     * A carry-over is a lump: years of service recorded against a single date
     * because that is the only date anybody has. One row here is a hundred
     * hours dated January 2024. Counting it as an active month would award
     * "you turned up in January 2024" to somebody who did not turn up in
     * January 2024 — the association simply wrote their history down on that
     * day — and the same lump would go on to claim a commitment award for a
     * month in which nothing was registered or attended.
     *
     * The month has to stand on its own: hours actually worked in it, or an
     * attendance in it. The hours points above are unaffected, so nobody loses
     * anything they gave; what they do not get is a monthly presence award for
     * a month that is a filing decision rather than a month they worked.
     */
    const worked = presentMinutes(m.minutes, m.carried);
    const facts = { minutes: worked, attended: m.attended, registered: m.registered };
    if (isActiveMonth(facts)) owed.push({ kind: 'active_month', points: POINTS.activeMonth });
    if (earnsCommitment(facts)) owed.push({ kind: 'commitment', points: POINTS.commitment });

    for (const award of owed) {
      const key = awardKey(m.user_id, award.kind, null, m.period);
      if (existing.has(key)) continue;
      changes.push({
        userId: m.user_id,
        name: names.get(m.user_id) ?? m.user_id,
        period: m.period,
        kind: award.kind,
        points: award.points,
        key,
      });
    }
  }

  return {
    people: new Set(changes.map((c) => c.userId)).size,
    rows: changes.length,
    points: changes.reduce((sum, c) => sum + c.points, 0),
    /* Truncated for the page; `rows` and `points` above are not, because a
     * preview that quietly showed forty of six hundred would be read as
     * forty — the one thing a preview must never be wrong about. */
    sample: changes.slice(0, sample),
  };
}

/**
 * Writes what the plan found.
 *
 * Re-derives rather than taking the plan as an argument. A plan computed
 * minutes ago and applied now would write rows against figures that have since
 * changed, and the staff member would have approved a different thing from the
 * one that happened.
 *
 * No notification. A point is not news — it is the arithmetic behind a figure
 * the volunteer can already see, and a message for each of six hundred ledger
 * rows would bury everything that matters.
 */
export async function applyPoints(): Promise<{ rows: number; points: number }> {
  const plan = await planPoints(Number.MAX_SAFE_INTEGER);
  let written = 0;
  let points = 0;

  for (const change of plan.sample) {
    /*
     * ON CONFLICT DO NOTHING against uq_points_source_once, which is the real
     * guard: two staff members pressing the button at the same moment, or a
     * grant landing between the plan and this loop, must not double a point.
     * The unique index decides, not this code.
     *
     * earned_on is the first of the month the points belong to, not today. A
     * run in August for March's hours belongs to March, or every window the
     * leaderboard offers would report it as August's work.
     */
    /* RETURNING, because execute() answers void and the whole point here is
     * knowing whether the row went in or the unique index refused it. */
    const done = await queryOne<{ id: string }>(
      `INSERT INTO impact_points (user_id, points, source_kind, source_id, period, earned_on)
       VALUES ($1, $2, $3, NULL, $4, ($4 || '-01')::DATE)
       ON CONFLICT DO NOTHING
       RETURNING id::TEXT`,
      [change.userId, change.points, change.kind, change.period],
    );
    if (done) {
      written += 1;
      points += change.points;
    }
  }

  return { rows: written, points };
}
