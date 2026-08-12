import 'server-only';
import { query, queryOne } from './db';

/**
 * The numbers a coordinator needs to run a season.
 *
 * The question this module exists to answer is not "how many volunteers do we
 * have" — the dashboard already says that — but "where do people stop?"
 * Someone who registers, finishes a course, and is never seen again is a
 * failure the totals hide completely.
 *
 * Two rules throughout:
 *
 *   Everything is aggregated in SQL. A page that fetches rows and counts them
 *   in JavaScript is wrong the moment there are more rows than it fetched.
 *
 *   Every count is cast to INTEGER. count() is bigint, which the driver hands
 *   back as a string, and '9' + 1 = '91' is a bug waiting for the day the
 *   numbers matter.
 *
 * Nothing here names anyone. These are totals, and the capability that opens
 * this page is deliberately not the one that opens a member's record.
 */

export type FunnelStep = {
  key: 'registered' | 'learning' | 'passed' | 'applied' | 'accepted' | 'contributing';
  count: number;
};

/**
 * The path from an account to an active volunteer.
 *
 * Each step counts people who have *ever* reached it, not people sitting in it
 * now, so the steps only ever shrink and the drop between two of them is a
 * real loss rather than an artefact of someone having moved on.
 */
export async function funnel(): Promise<FunnelStep[]> {
  const row = await queryOne<Record<string, number>>(`
    SELECT
      (SELECT count(*) FROM users WHERE status <> 'deactivated')::INTEGER          AS registered,
      (SELECT count(DISTINCT user_id) FROM course_attempts)::INTEGER               AS learning,
      (SELECT count(DISTINCT user_id) FROM course_attempts WHERE passed)::INTEGER  AS passed,
      (SELECT count(DISTINCT user_id) FROM volunteer_applications)::INTEGER        AS applied,
      (SELECT count(DISTINCT user_id) FROM membership_status_history
        WHERE new_status = 'accepted_volunteer')::INTEGER                          AS accepted,
      (SELECT count(DISTINCT user_id) FROM hour_entries
        WHERE status = 'verified')::INTEGER                                        AS contributing
  `);

  const keys: FunnelStep['key'][] = [
    'registered', 'learning', 'passed', 'applied', 'accepted', 'contributing',
  ];
  return keys.map((key) => ({ key, count: row?.[key] ?? 0 }));
}

export type StageStanding = {
  stage: number;
  title_ar: string;
  title_en: string;
  /** People whose current stage this is. */
  in_stage: number;
  /** People who have finished it. */
  completed: number;
  /** Median days spent in this stage by those who left it, or null if nobody has. */
  median_days: number | null;
};

/**
 * How many volunteers sit in each stage, and how long it takes to leave it.
 *
 * The clock for a stage starts when the previous one was reached, and for
 * stage 1 when the account was created. Measuring from the account date for
 * every stage would make the later stages look slower and slower for no reason
 * other than that they come later.
 *
 * The median rather than the mean: one volunteer who took two years over
 * stage 1 would drag an average far enough to hide the typical experience.
 */
export async function stageStandings(): Promise<StageStanding[]> {
  return query<StageStanding>(`
    WITH def AS (
      SELECT js.number AS stage, js.title_ar, js.title_en
        FROM journey_stages js
        JOIN journey_versions jv ON jv.id = js.version_id
       WHERE jv.is_default
    ), standing AS (
      -- The highest stage someone has reached tells us the one they are
      -- working through now: the next one up.
      SELECT u.id AS user_id, COALESCE(MAX(sp.stage), 0) + 1 AS stage
        FROM users u
        LEFT JOIN stage_progress sp ON sp.user_id = u.id
       WHERE u.status = 'active'
         AND EXISTS (SELECT 1 FROM user_journey_assignments a WHERE a.user_id = u.id)
       GROUP BY u.id
    ), spans AS (
      SELECT sp.stage,
             sp.reached_at - COALESCE(
               (SELECT prev.reached_at FROM stage_progress prev
                 WHERE prev.user_id = sp.user_id AND prev.stage = sp.stage - 1),
               u.created_at
             ) AS took
        FROM stage_progress sp
        JOIN users u ON u.id = sp.user_id
    ), done AS (
      SELECT stage,
             count(*)::INTEGER AS completed,
             percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM took) / 86400)
               AS median_days
        FROM spans
       GROUP BY stage
    )
    SELECT def.stage, def.title_ar, def.title_en,
           COALESCE((SELECT count(*) FROM standing s WHERE s.stage = def.stage), 0)::INTEGER AS in_stage,
           COALESCE(done.completed, 0) AS completed,
           ROUND(done.median_days)::INTEGER AS median_days
      FROM def LEFT JOIN done ON done.stage = def.stage
     ORDER BY def.stage
  `);
}

export type CourseStanding = {
  course_slug: string;
  started: number;
  finished: number;
  passed: number;
  /** Average of the best score each person achieved, or null if nobody finished. */
  average_best: number | null;
};

/**
 * Per course: how many opened it, how many saw it through, how many passed.
 *
 * The gap between started and finished is the one worth watching. A course
 * everyone opens and nobody finishes is too long, not too hard.
 */
export async function courseStandings(): Promise<CourseStanding[]> {
  return query<CourseStanding>(`
    WITH best AS (
      SELECT user_id, course_slug,
             bool_or(submitted_at IS NOT NULL) AS finished,
             bool_or(passed)                   AS passed,
             MAX(score) FILTER (WHERE submitted_at IS NOT NULL) AS best_score
        FROM course_attempts
       GROUP BY user_id, course_slug
    )
    SELECT course_slug,
           count(*)::INTEGER                                AS started,
           (count(*) FILTER (WHERE finished))::INTEGER      AS finished,
           (count(*) FILTER (WHERE passed))::INTEGER        AS passed,
           ROUND(AVG(best_score))::INTEGER                  AS average_best
      FROM best
     GROUP BY course_slug
     ORDER BY started DESC, course_slug
  `);
}

export type MonthlyHours = { month: string; minutes: number; people: number };

/** Verified hours by month, most recent last, so a chart reads left to right. */
export async function monthlyHours(months = 12): Promise<MonthlyHours[]> {
  return query<MonthlyHours>(
    `SELECT to_char(date_trunc('month', worked_on), 'YYYY-MM')  AS month,
            COALESCE(SUM(minutes), 0)::INTEGER                  AS minutes,
            count(DISTINCT user_id)::INTEGER                    AS people
       FROM hour_entries
      WHERE status = 'verified'
        AND worked_on >= date_trunc('month', now()) - ($1 || ' months')::INTERVAL
      GROUP BY 1
      ORDER BY 1`,
    [String(months)],
  );
}

export type AttendanceStanding = {
  registered: number;
  attended: number;
  no_shows: number;
};

/**
 * Whether people turn up to what they sign up for.
 *
 * Only activities that have already ended are counted — including one that
 * starts next week would report everyone registered for it as a no-show — and
 * only registrations that were never cancelled. Someone who told us in advance
 * that they could not come did the right thing and is not a no-show.
 */
export async function attendanceStanding(): Promise<AttendanceStanding> {
  const row = await queryOne<AttendanceStanding>(`
    WITH past AS (
      SELECT id FROM activities WHERE ends_at IS NOT NULL AND ends_at < now()
    ), standing AS (
      SELECT r.activity_id, r.user_id
        FROM activity_registrations r
        JOIN past ON past.id = r.activity_id
       WHERE r.cancelled_at IS NULL
    )
    SELECT
      (SELECT count(*) FROM standing)::INTEGER AS registered,
      (SELECT count(*) FROM standing s
        WHERE EXISTS (
          SELECT 1 FROM activity_attendance a
           WHERE a.activity_id = s.activity_id AND a.user_id = s.user_id AND a.attended))::INTEGER
        AS attended,
      (SELECT count(*) FROM standing s
        WHERE NOT EXISTS (
          SELECT 1 FROM activity_attendance a
           WHERE a.activity_id = s.activity_id AND a.user_id = s.user_id AND a.attended))::INTEGER
        AS no_shows
  `);
  return row ?? { registered: 0, attended: 0, no_shows: 0 };
}

export type Stalled = {
  /** How many active volunteers have logged nothing in this many days. */
  days: number;
  count: number;
};

/**
 * Volunteers who have gone quiet.
 *
 * The point of the whole platform is that nobody is lost track of, and this is
 * the number that says whether that is true.
 */
export async function stalledVolunteers(): Promise<Stalled[]> {
  const rows = await query<{ days: number; count: number }>(`
    WITH thresholds AS (SELECT unnest(ARRAY[30, 60, 90]) AS days),
    active AS (
      SELECT u.id,
             (SELECT MAX(h.worked_on) FROM hour_entries h
               WHERE h.user_id = u.id AND h.status = 'verified') AS last_worked
        FROM users u
       WHERE u.status = 'active'
         AND EXISTS (
           SELECT 1 FROM user_roles r
            WHERE r.user_id = u.id AND r.role = 'volunteer'
              AND (r.valid_until IS NULL OR r.valid_until > now()))
    )
    SELECT t.days,
           (SELECT count(*) FROM active a
             WHERE a.last_worked IS NULL
                OR a.last_worked < (now() - (t.days || ' days')::INTERVAL))::INTEGER AS count
      FROM thresholds t
     ORDER BY t.days
  `);
  return rows;
}
