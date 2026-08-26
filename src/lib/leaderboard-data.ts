import 'server-only';
import { query } from './db';
import type { DateWindow, LeaderboardRow } from './leaderboard';

/**
 * The figures every board is built from, for one window, in one query.
 *
 * ONE QUERY AND FIVE BOARDS. Everything that decides an order — the ranking,
 * the ties, the ten-place cut, who may be listed, what the reader is told
 * about themselves — happens afterwards in lib/leaderboard.ts, which has no
 * database in it and is exercised directly by scripts/probe-leaderboard. SQL
 * that sorted or ranked would move those decisions somewhere no probe can
 * reach, and the ones this page has to get right are precisely the ones that
 * fail quietly.
 *
 * EVERY WINDOW IS BEIRUT, AND EVERY COMPARISON IS A DATE. The session runs
 * GMT. A timestamp cast straight to a date is the previous day for anything
 * after two in the morning Beirut time, which moves an activity that started
 * at 01:00 on a Monday into the week before — so every timestamp below is
 * converted with AT TIME ZONE first. The columns that are already DATE
 * (worked_on, earned_on, joined_on) carry no time and need no conversion:
 * they were written as the day the thing happened.
 *
 * WHAT IS DELIBERATELY NOT SELECTED. There is no pending or rejected hours
 * figure, no absence count, no admin note, no verification comment and no
 * suspension. Not filtered out downstream — never fetched, so no later edit to
 * a template can print one.
 *
 * NOTE ON BACKTICKS: there are none in the SQL below and none may be added. It
 * is a template literal, so a backtick around an identifier in one of these
 * comments ends the string and the file stops parsing — which is how this
 * build broke once before.
 */

/*
 * $1 is the first day of the window as text, or NULL for all time; $2 is the
 * last. Repeated per figure rather than hoisted into a CTE because each one
 * tests a different column, and a join against a one-row window table would
 * read worse for no gain at four hundred rows.
 */
const IN_WINDOW = (expr: string) =>
  `($1::date IS NULL OR (${expr}) >= $1::date) AND (${expr}) <= $2::date`;

/*
 * When a piece of volunteering happened, as opposed to when somebody typed it
 * in. An activity's own start date first, its legacy date second, and the
 * moment attendance was confirmed only as a last resort: confirming a March
 * activity in June must not move that person's March work into June, or a
 * board of "this month" would fill up with a coordinator's paperwork.
 */
const ACTIVITY_DAY = `COALESCE(
  (a.starts_at AT TIME ZONE 'Asia/Beirut')::date,
  a.starts_on,
  (aa.confirmed_at AT TIME ZONE 'Asia/Beirut')::date
)`;

const REGISTRATION_DAY = `COALESCE(
  (a.starts_at AT TIME ZONE 'Asia/Beirut')::date,
  a.starts_on,
  (reg.registered_at AT TIME ZONE 'Asia/Beirut')::date
)`;

const SQL = `
  SELECT u.id::TEXT AS id,
         p.full_name,
         p.display_name,
         p.public_visibility,

         /* Read once by treatAsMinor and carried no further: LeaderboardRow
          * hands them to that function and BoardEntry has no field either
          * could land in. Text, because isMinorOn refuses a timestamp rather
          * than trimming it to the wrong day. */
         to_char(ps.date_of_birth, 'YYYY-MM-DD') AS sensitive_dob,
         to_char(sr.date_of_birth, 'YYYY-MM-DD') AS safeguarding_dob,
         to_char(r.date_of_birth,  'YYYY-MM-DD') AS roster_dob,

         /* The membership date, not the account date, and the same COALESCE
          * the membership card and the page of thanks use. For the people
          * recognised from the association's own roster the account is weeks
          * old and the membership is years old, and the rising-star board asks
          * about the membership. Converted to Beirut before it is cut to a
          * date: an account created at 01:00 on 1 January reads as 31 December
          * in GMT, which is a different year. */
         to_char(
           COALESCE(r.joined_on, (u.created_at AT TIME ZONE 'Asia/Beirut')::date),
           'YYYY-MM-DD'
         ) AS joined_on,

         (SELECT ph.version FROM profile_photos ph WHERE ph.user_id = u.id) AS photo_version,

         /* Verified only. Pending hours are a claim and rejected hours are a
          * refused claim; ranking anybody by either would be ranking them by
          * something nobody has checked. Corrections are verified rows with
          * negative minutes, so summing the lot gives the net figure — which
          * is what the volunteer's own hours page shows them. */
         COALESCE((SELECT SUM(h.minutes) FROM hour_entries h
                    WHERE h.user_id = u.id
                      AND h.status = 'verified'
                      AND ${IN_WINDOW('h.worked_on')}), 0)::INTEGER AS minutes,

         (SELECT count(*) FROM activity_attendance aa
            JOIN activities a ON a.id = aa.activity_id
           WHERE aa.user_id = u.id
             AND aa.attended
             AND ${IN_WINDOW(ACTIVITY_DAY)})::INTEGER AS attended,

         /* Certificates that still stand, not courses passed. Revoking one
          * leaves the passed attempt behind it, and a learning board is a
          * claim about the credential rather than about the exam. */
         (SELECT count(*) FROM certificates c
           WHERE c.user_id = u.id
             AND c.kind = 'course'
             AND c.revoked_at IS NULL
             AND ${IN_WINDOW("(c.issued_at AT TIME ZONE 'Asia/Beirut')::date")})::INTEGER
                                                                    AS certificates,

         /*
          * The reliability denominator: registrations whose attendance was
          * actually recorded.
          *
          * Three exclusions, each of which would otherwise punish somebody for
          * something they did not do. An activity the ASSOCIATION cancelled is
          * nobody's absence. A registration the volunteer withdrew in advance
          * is a plan changed, not a no-show. And an activity that happened but
          * whose register nobody filled in is missing paperwork — counting it
          * would mean a coordinator's forgetfulness lowering a volunteer's
          * rate, silently, months later.
          */
         (SELECT count(*) FROM activity_registrations reg
            JOIN activities a ON a.id = reg.activity_id
            JOIN activity_attendance aa
              ON aa.activity_id = reg.activity_id AND aa.user_id = reg.user_id
           WHERE reg.user_id = u.id
             AND reg.status <> 'cancelled'
             AND a.cancelled_at IS NULL
             AND ${IN_WINDOW(REGISTRATION_DAY)})::INTEGER AS resolved,

         (SELECT count(*) FROM activity_registrations reg
            JOIN activities a ON a.id = reg.activity_id
            JOIN activity_attendance aa
              ON aa.activity_id = reg.activity_id AND aa.user_id = reg.user_id
           WHERE reg.user_id = u.id
             AND reg.status <> 'cancelled'
             AND a.cancelled_at IS NULL
             AND aa.attended
             /*
              * QUOTED, AND THE QUOTES ARE THE WHOLE POINT.
              *
              * This read AS turned_up, while LeaderboardRow declares
              * turnedUp. Postgres folds an unquoted alias to lower case, pg
              * camel-cases nothing, and there is no mapping layer — so
              * row.turnedUp was undefined on every row, int() turned it into 0,
              * the rate came out 0 for everybody, and the board drops anyone
              * whose rate is not above zero. The reliability board was empty in
              * production and looked like a board nobody had qualified for.
              *
              * The probe could not see it. Its fixtures are built from
              * LeaderboardRow, so they match the type the code expects rather
              * than the shape the query returns — ninety-four assertions passing
              * over a figure that never arrives. The resolved column above is lower case
              * on both sides, which is why only one of the two broke.
              */
             AND ${IN_WINDOW(REGISTRATION_DAY)})::INTEGER AS "turnedUp",

         /* The ledger, and the only place a point is read from. earned_on is
          * the day the person earned it rather than the day the row was
          * written, so a backfill run today for March lands in March. */
         COALESCE((SELECT SUM(ip.points) FROM impact_points ip
                    WHERE ip.user_id = u.id
                      AND ${IN_WINDOW('ip.earned_on')}), 0)::INTEGER AS points

    FROM users u
    JOIN profiles p ON p.user_id = u.id

    LEFT JOIN profiles_sensitive   ps ON ps.user_id = u.id
    LEFT JOIN safeguarding_records sr ON sr.user_id = u.id
    /* The roster only through a line this account has claimed and staff have
     * approved. Four hundred imported lines belong to people who have never
     * made an account and agreed to nothing. */
    LEFT JOIN volunteer_roster     r  ON r.claimed_by = u.id AND r.approved_at IS NOT NULL

   /*
    * Closed accounts only. Suspension is deliberately NOT filtered: points are
    * recognition for work that was verified, and a board that quietly dropped
    * somebody under discipline would be using recognition as a punishment —
    * which lib/impact.ts refuses to do one layer down. A deactivated account
    * is a different thing: that person has left.
    */
   WHERE u.status <> 'deactivated'

   /* Deliberately meaningless. The order is decided by buildBoard, and a query
    * that arrived pre-sorted by points would make "whatever the database gave
    * us" a ranking nobody chose to publish. */
   ORDER BY u.id
`;

/**
 * Everybody's figures for one window, as rows.
 *
 * A row is not something to render. It becomes renderable only through
 * `buildBoard` in lib/leaderboard.ts, which asks lib/visibility.ts about each
 * person and then builds each entry from an allowlist.
 */
export async function leaderboardRows(window: DateWindow): Promise<LeaderboardRow[]> {
  return query<LeaderboardRow>(SQL, [window.from, window.to]);
}
