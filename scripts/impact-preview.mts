/**
 * Who would earn what, if the engine ran. Writes nothing.
 *
 *   npx tsx --conditions=react-server --env-file=.env.local scripts/impact-preview.mts
 *
 * The association's own instruction was not to backfill before seeing this,
 * and it is the right instruction: a badge is a message to a person, and four
 * hundred of them sent at once on a rule nobody checked is not a thing that
 * can be taken back. So this reads, counts, and stops.
 *
 * It also reports what the data cannot answer, which on a platform three weeks
 * old is most of it. A rule that would award nothing because nobody has any
 * attendance recorded is not a broken rule, and the difference matters when
 * deciding whether to run the backfill at all.
 */
import { Client } from 'pg';
import { readFileSync } from 'node:fs';
import { pointsForMinutes, POINTS } from '../src/lib/impact.ts';

const env = readFileSync('.env.local', 'utf8');
const url = /DATABASE_URL\s*=\s*"?([^"\n\r]+)"?/.exec(env)![1].trim();
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await c.connect();

/* The trailing comma is required: in a .mts file a bare `<T>` on an arrow
 * function is reserved syntax, because it cannot be told apart from JSX. */
const one = async <T,>(sql: string, args: unknown[] = []): Promise<T> =>
  (await c.query(sql, args)).rows[0] as T;
const all = async <T,>(sql: string, args: unknown[] = []): Promise<T[]> =>
  (await c.query(sql, args)).rows as T[];

const rule = (s: string) => console.log(`\n${'—'.repeat(4)} ${s}`);

/* ------------------------------------------------------------- the pool */
rule('who is in scope');
const pool = await one<{ accounts: number; volunteers: number; linked: number }>(`
  SELECT count(*)::int AS accounts,
         count(*) FILTER (WHERE is_volunteer(u.id))::int AS volunteers,
         count(r.id)::int AS linked
    FROM users u
    LEFT JOIN volunteer_roster r ON r.claimed_by = u.id AND r.approved_at IS NOT NULL`);
console.log(`  ${pool.accounts} accounts · ${pool.volunteers} can register for activities · ${pool.linked} linked to the roster`);

/* ------------------------------------------------------------ the facts */
rule('the facts the rules read');
const facts = await one<Record<string, number>>(`
  SELECT
    (SELECT count(*) FROM hour_entries WHERE status='verified')::int              AS verified_entries,
    (SELECT COALESCE(sum(minutes),0) FROM hour_entries WHERE status='verified')::int AS verified_minutes,
    (SELECT count(*) FROM hour_entries WHERE status='verified' AND carried_over)::int AS carried_entries,
    (SELECT count(*) FROM activity_attendance WHERE attended)::int                AS attendances,
    (SELECT count(*) FROM certificates WHERE kind='course' AND revoked_at IS NULL)::int AS active_course_certs,
    (SELECT count(*) FROM certificates WHERE revoked_at IS NOT NULL)::int         AS revoked_certs,
    (SELECT count(*) FROM stage_progress)::int                                    AS stage_awards,
    (SELECT count(*) FROM achievements WHERE revoked_at IS NULL)::int             AS badges_held`);
for (const [k, v] of Object.entries(facts)) console.log(`  ${k.padEnd(22)} ${v}`);

/* --------------------------------------------------------------- points */
rule('points that would be awarded');

const monthly = await all<{ user_id: string; period: string; minutes: number; attended: number; registered: number }>(`
  WITH months AS (
    SELECT user_id, to_char(worked_on,'YYYY-MM') AS period, sum(minutes)::int AS minutes
      FROM hour_entries WHERE status='verified' GROUP BY 1,2
  ), att AS (
    SELECT aa.user_id, to_char(a.starts_at AT TIME ZONE 'Asia/Beirut','YYYY-MM') AS period,
           count(*) FILTER (WHERE aa.attended)::int AS attended
      FROM activity_attendance aa JOIN activities a ON a.id = aa.activity_id
     WHERE a.starts_at IS NOT NULL GROUP BY 1,2
  ), reg AS (
    -- Activities the association cancelled are out of the denominator: nobody
    -- loses an award because something was called off.
    SELECT ar.user_id, to_char(a.starts_at AT TIME ZONE 'Asia/Beirut','YYYY-MM') AS period,
           count(*)::int AS registered
      FROM activity_registrations ar JOIN activities a ON a.id = ar.activity_id
     WHERE a.starts_at IS NOT NULL AND a.cancelled_at IS NULL AND ar.status <> 'cancelled'
     GROUP BY 1,2
  )
  SELECT COALESCE(m.user_id, att.user_id, reg.user_id)  AS user_id,
         COALESCE(m.period, att.period, reg.period)     AS period,
         COALESCE(m.minutes, 0)                         AS minutes,
         COALESCE(att.attended, 0)                      AS attended,
         COALESCE(reg.registered, 0)                    AS registered
    FROM months m
    FULL OUTER JOIN att ON att.user_id=m.user_id AND att.period=m.period
    FULL OUTER JOIN reg ON reg.user_id=COALESCE(m.user_id,att.user_id)
                       AND reg.period=COALESCE(m.period,att.period)`);

let hourPts = 0, activePts = 0, commitPts = 0, activeMonths = 0, commitMonths = 0;
for (const m of monthly) {
  hourPts += pointsForMinutes(m.minutes);
  if (m.minutes > 0 || m.attended > 0) { activePts += POINTS.activeMonth; activeMonths += 1; }
  if (m.registered >= 2 && m.attended >= m.registered) { commitPts += POINTS.commitment; commitMonths += 1; }
}
const attPts = facts.attendances * POINTS.attendance;
const certPts = facts.active_course_certs * POINTS.certificate;
const stagePts = facts.stage_awards * POINTS.stage;

const line = (what: string, rows: number, pts: number) =>
  console.log(`  ${what.padEnd(28)} ${String(rows).padStart(5)} rows  ${String(pts).padStart(7)} pts`);
line('hours (per month)', monthly.filter((m) => pointsForMinutes(m.minutes) > 0).length, hourPts);
line('attendance', facts.attendances, attPts);
line('active course certificates', facts.active_course_certs, certPts);
line('stages reached', facts.stage_awards, stagePts);
line('active months', activeMonths, activePts);
line('commitment months', commitMonths, commitPts);
console.log(`  ${'TOTAL'.padEnd(28)} ${String(monthly.length).padStart(5)} months ${String(hourPts+attPts+certPts+stagePts+activePts+commitPts).padStart(7)} pts`);

/* --------------------------------------------------------------- badges */
rule('badges that would be granted (threshold rules only)');
const badges = await all<{ code: string; people: number }>(`
  WITH standing AS (
    SELECT u.id AS user_id,
      COALESCE((SELECT sum(minutes) FROM hour_entries WHERE user_id=u.id AND status='verified'),0)::int AS minutes,
      (SELECT count(*) FROM activity_attendance WHERE user_id=u.id AND attended)::int AS activities,
      (SELECT count(*) FROM certificates WHERE user_id=u.id AND kind='course' AND revoked_at IS NULL)::int AS certs,
      COALESCE((SELECT max(stage) FROM stage_progress WHERE user_id=u.id),0)::int AS stage
    FROM users u
  ), rules(code, met) AS (
    SELECT 'hours-10',   count(*) FILTER (WHERE minutes >= 600)    FROM standing UNION ALL
    SELECT 'hours-25',   count(*) FILTER (WHERE minutes >= 1500)   FROM standing UNION ALL
    SELECT 'hours-50',   count(*) FILTER (WHERE minutes >= 3000)   FROM standing UNION ALL
    SELECT 'hours-100',  count(*) FILTER (WHERE minutes >= 6000)   FROM standing UNION ALL
    SELECT 'hours-250',  count(*) FILTER (WHERE minutes >= 15000)  FROM standing UNION ALL
    SELECT 'hours-500',  count(*) FILTER (WHERE minutes >= 30000)  FROM standing UNION ALL
    SELECT 'first-activity', count(*) FILTER (WHERE activities >= 1)  FROM standing UNION ALL
    SELECT 'activities-5',   count(*) FILTER (WHERE activities >= 5)  FROM standing UNION ALL
    SELECT 'activities-10',  count(*) FILTER (WHERE activities >= 10) FROM standing UNION ALL
    SELECT 'activities-25',  count(*) FILTER (WHERE activities >= 25) FROM standing UNION ALL
    SELECT 'activities-50',  count(*) FILTER (WHERE activities >= 50) FROM standing UNION ALL
    SELECT 'certs-1',   count(*) FILTER (WHERE certs >= 1)  FROM standing UNION ALL
    SELECT 'certs-3',   count(*) FILTER (WHERE certs >= 3)  FROM standing UNION ALL
    SELECT 'certs-5',   count(*) FILTER (WHERE certs >= 5)  FROM standing UNION ALL
    SELECT 'certs-10',  count(*) FILTER (WHERE certs >= 10) FROM standing UNION ALL
    SELECT 'certs-20',  count(*) FILTER (WHERE certs >= 20) FROM standing UNION ALL
    SELECT 'stage-2',   count(*) FILTER (WHERE stage >= 2)  FROM standing UNION ALL
    SELECT 'stage-3',   count(*) FILTER (WHERE stage >= 3)  FROM standing UNION ALL
    SELECT 'stage-4',   count(*) FILTER (WHERE stage >= 4)  FROM standing UNION ALL
    SELECT 'stage-5',   count(*) FILTER (WHERE stage >= 5)  FROM standing UNION ALL
    SELECT 'stage-6',   count(*) FILTER (WHERE stage >= 6)  FROM standing UNION ALL
    SELECT 'balanced',  count(*) FILTER (WHERE minutes >= 3000 AND activities >= 5 AND certs >= 5) FROM standing
  )
  SELECT code, met::int AS people FROM rules ORDER BY code`);
for (const b of badges) console.log(`  ${b.code.padEnd(18)} ${String(b.people).padStart(4)} would qualify`);

/* ---------------------------------------------------------- continuity */
rule('continuity: joined on or before 31 December 2023');
const cont = await all<{ bucket: string; n: number }>(`
  SELECT CASE
           WHEN r.claimed_by IS NULL                       THEN 'roster line, no account linked'
           WHEN NOT is_volunteer(r.claimed_by)             THEN 'linked but not currently a volunteer'
           ELSE 'linked and eligible'
         END AS bucket,
         count(*)::int AS n
    FROM volunteer_roster r
   WHERE r.joined_on <= DATE '2023-12-31'
   GROUP BY 1 ORDER BY 2 DESC`);
for (const r of cont) console.log(`  ${String(r.n).padStart(4)}  ${r.bucket}`);

/* --------------------------------------------------------- what is thin */
rule('what the data cannot answer yet');
const gaps: string[] = [];
if (facts.attendances === 0) gaps.push('No attendance has ever been confirmed, so every participation badge and every attendance point is zero. Not a rule fault — the attendance-to-hours path has never run on real data.');
if (facts.verified_entries <= 5) gaps.push(`Only ${facts.verified_entries} verified hour entries exist, ${facts.carried_entries} of them carried over from before the platform.`);
const noJoin = await one<{ n: number }>(`
  SELECT count(*)::int n FROM volunteer_roster WHERE joined_on IS NULL`);
if (noJoin.n) gaps.push(`${noJoin.n} roster lines have no join date, so continuity cannot be decided for them and must not be guessed.`);
const dob = await one<{ n: number }>(`SELECT count(*)::int n FROM profiles_sensitive WHERE date_of_birth IS NOT NULL`);
gaps.push(`${dob.n} accounts have a date of birth on file, which is what birthday greetings would read.`);
for (const g of gaps) console.log(`  · ${g}`);

console.log('\nNothing was written. Run the backfill only after reading the above.');
await c.end();
