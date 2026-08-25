import 'server-only';
import { query, queryOne } from './db';
import {
  isAwardKind, isPersonAward, periodWindow,
  type AwardKind, type AwardRecord, type NomineeFacts, type TeamFacts,
} from './awards';
import { publicIdentity, treatAsMinor, visibilityFrom } from './visibility';

/**
 * What the monthly awards read out of the database.
 *
 * The one module here that touches Postgres. Everything it returns goes
 * straight into the pure functions in src/lib/awards.ts, which decide who may
 * be shortlisted and what may be published — so no criterion is stated twice
 * and none of it is stated in SQL, where it could not be tested.
 *
 * BEIRUT, AGAIN
 *
 * The session runs GMT and a period is a pair of Beirut calendar days. Every
 * timestamp is converted before it is compared with one:
 * `(starts_at AT TIME ZONE 'Asia/Beirut')::date`. Without it, an activity at
 * nine in the evening on the 31st falls into the next month and the volunteer
 * who ran it is judged for a month they were not in. `hour_entries.worked_on`
 * is already a DATE — a day somebody wrote down, with no zone in it — so it is
 * compared directly, and converting it would be the error.
 *
 * COUNTS ARE CAST
 *
 * count() and sum() come back as bigint, which the pg driver hands over as a
 * string. '9' + 1 is '91', and every figure here is fed to arithmetic that
 * orders a shortlist. Every aggregate below carries ::INTEGER.
 *
 * WHAT IS NOT HERE
 *
 * No function writes a shortlist anywhere. The nominations are assembled per
 * request and discarded with the response — see migration 036 for why there is
 * no table for them and why there must never be one.
 *
 * NOTE ON BACKTICKS: the SQL below sits in template literals, so a backtick in
 * one of these comments would end the string and the file would stop parsing.
 * There are none, and none may be added.
 */

const ZONE = 'Asia/Beirut';

/**
 * The two ledgers a month is measured from, as one reusable pair of CTEs.
 *
 * Written once rather than pasted into each query below: the candidate list
 * and the committee ranking have to agree exactly about what "active this
 * month" means, and two copies of this would agree until somebody fixed one.
 *
 * $1 and $2 are the inclusive Beirut days of the period.
 */
const MONTH_CTES = `
  mins AS (
    SELECT h.user_id, SUM(h.minutes)::INTEGER AS minutes
      FROM hour_entries h
     WHERE h.status = 'verified'
       AND h.worked_on BETWEEN $1::date AND $2::date
     GROUP BY h.user_id
  ),
  att AS (
    /* Counted on the day the activity happened, never the day a supervisor
     * got round to confirming it. August's award must not move because the
     * paperwork was done in September. An activity with no date at all cannot
     * have been attended, and the COALESCE leaves it NULL so the row drops. */
    SELECT aa.user_id, count(*)::INTEGER AS attendances
      FROM activity_attendance aa
      JOIN activities a ON a.id = aa.activity_id
     WHERE aa.attended
       AND COALESCE((a.starts_at AT TIME ZONE '${ZONE}')::date, a.starts_on)
           BETWEEN $1::date AND $2::date
     GROUP BY aa.user_id
  ),
  active AS (
    /* FULL OUTER JOIN, not UNION: somebody may have logged hours without an
     * attendance or attended without logging hours, and both are an active
     * month. An inner join would silently shortlist only the people who did
     * both. */
    SELECT COALESCE(m.user_id, a.user_id)  AS user_id,
           COALESCE(m.minutes, 0)          AS minutes,
           COALESCE(a.attendances, 0)      AS attendances
      FROM mins m
      FULL OUTER JOIN att a ON a.user_id = m.user_id
  )`;

// ------------------------------------------------------------- candidates

/**
 * One person who did something this month, with everything the criteria and
 * the staff shortlist need.
 *
 * The three birth dates are read by `treatAsMinor` and by nothing else, and
 * they never leave this module — `toFacts` does not copy them into
 * NomineeFacts, and NomineeFacts has no field they could land in. That is the
 * same discipline lib/continuity-data.ts keeps, for the same reason.
 */
export type CandidateRow = {
  user_id: string;
  full_name: string;
  display_name: string | null;
  public_visibility: string | null;
  member_number: number | null;
  /** 'YYYY-MM-DD'. The association's own join date where there is one. */
  joined_on: string | null;
  sensitive_dob: string | null;
  safeguarding_dob: string | null;
  roster_dob: string | null;
  verified_minutes: number;
  attendances: number;
  badges: string[];
  /** The last period this person won ANY monthly award, or null. */
  last_won: string | null;
};

const CANDIDATES_SQL = `
  WITH ${MONTH_CTES},
  won AS (
    /* The cooling-off, read once for everybody rather than per candidate.
     * max() over text is correct here: a period is 'YYYY-MM' and sorts
     * correctly as text for every month this association will ever see. */
    SELECT user_id, max(period) AS last_won
      FROM recognition_awards
     WHERE user_id IS NOT NULL
     GROUP BY user_id
  )
  SELECT u.id::TEXT                                                  AS user_id,
         p.full_name,
         p.display_name,
         p.public_visibility,
         p.member_number,

         /*
          * The association's own join date, falling back to the account.
          *
          * COALESCE exactly as the membership card and the badge engine do it:
          * for the four hundred people recognised from the roster the account
          * is weeks old and the membership is years old, and both tenure
          * awards are about the second. The fallback is converted to Beirut
          * before it is cut down to a date, because casting created_at on an
          * account made at 01:00 Beirut on the 1st reads as the previous month
          * in a GMT session - which is enough to move somebody across the
          * six-month line.
          */
         to_char(
           COALESCE(r.joined_on, (u.created_at AT TIME ZONE '${ZONE}')::date),
           'YYYY-MM-DD'
         )                                                           AS joined_on,

         /* Text, and refused rather than trimmed if it is not a plain
          * YYYY-MM-DD: a GMT timestamp's first ten characters are the wrong
          * day for anybody born after ten in the evening Beirut time. */
         to_char(ps.date_of_birth, 'YYYY-MM-DD')                     AS sensitive_dob,
         to_char(sr.date_of_birth, 'YYYY-MM-DD')                     AS safeguarding_dob,
         to_char(r.date_of_birth,  'YYYY-MM-DD')                     AS roster_dob,

         active.minutes::INTEGER                                     AS verified_minutes,
         active.attendances::INTEGER                                 AS attendances,

         ARRAY(SELECT b.code FROM achievements b
                WHERE b.user_id = u.id AND b.revoked_at IS NULL)     AS badges,

         won.last_won

    FROM active
    JOIN users    u ON u.id = active.user_id
    JOIN profiles p ON p.user_id = u.id

    LEFT JOIN profiles_sensitive   ps ON ps.user_id = u.id
    LEFT JOIN safeguarding_records sr ON sr.user_id = u.id
    /* The roster only through a line this account has claimed and staff have
     * approved. An unclaimed line belongs to somebody who has never made an
     * account and has consented to nothing. */
    LEFT JOIN volunteer_roster r ON r.claimed_by = u.id AND r.approved_at IS NOT NULL
    LEFT JOIN won ON won.user_id = u.id

   WHERE is_volunteer(u.id)
   /* Deliberately meaningless. The ordering is decided by monthScore() in
    * awards.ts, and a query that arrived pre-sorted by hours would make
    * "whatever order the database gave us" a ranking nobody chose to publish. */
   ORDER BY u.id
`;

export async function candidateRows(period: string): Promise<CandidateRow[]> {
  const window = periodWindow(period);
  if (!window) return [];
  return query<CandidateRow>(CANDIDATES_SQL, [window.startsOn, window.endsOn]);
}

/**
 * A row as the criteria need it — and as the criteria need it ONLY.
 *
 * Consent is resolved here, once, by asking lib/visibility.ts, and arrives in
 * awards.ts as a single boolean. Nothing downstream sees a birth date, a
 * stored choice or a display name, so nothing downstream can decide visibility
 * for itself and get it wrong.
 *
 * `today` is passed in rather than read from a clock because visibility.ts
 * owns none either: whether somebody is still seventeen is decided by the
 * calendar the association lives in, and the server runs GMT.
 */
export function toFacts(row: CandidateRow, today: string): NomineeFacts {
  const identity = publicIdentity({
    choice: visibilityFrom(row.public_visibility),
    isMinor: treatAsMinor({
      sensitiveDob: row.sensitive_dob,
      safeguardingDob: row.safeguarding_dob,
      rosterDob: row.roster_dob,
      today,
    }),
    fullName: row.full_name ?? '',
    displayName: row.display_name,
  });

  return {
    userId: row.user_id,
    // Already filtered by is_volunteer() in the query. Carried anyway so the
    // criterion is stated where it is tested rather than only in the SQL.
    isVolunteer: true,
    joinedOn: row.joined_on,
    verifiedMinutes: Number(row.verified_minutes) || 0,
    attendances: Number(row.attendances) || 0,
    badges: row.badges ?? [],
    lastWonPeriod: row.last_won,
    consentShows: identity.show,
  };
}

// ------------------------------------------------------------------ teams

/**
 * The committees, with what their ACTIVE members did this month.
 *
 * `volunteer_roster.committee` is a HISTORICAL LABEL from the 2024 import —
 * 337 of the 457 lines carry one — and nothing in this platform maintains it.
 * It records the committee somebody was on when the association last wrote its
 * spreadsheet, not who is on one today. So this is a ranking of names the
 * association recognises rather than of live groups, and migration 036 copies
 * the label into the award row so a later re-import cannot rewrite history.
 *
 * `active_members` counts only people who actually did something verified this
 * month, and it is the divisor for the average. Counting the whole roll
 * instead would hand the award to whichever committee had the most dormant
 * names on it — which is the opposite of what the award is for.
 */
const TEAMS_SQL = `
  WITH ${MONTH_CTES}
  SELECT btrim(r.committee)                     AS committee,
         count(*)::INTEGER                      AS active_members,
         SUM(active.minutes)::INTEGER           AS verified_minutes,
         SUM(active.attendances)::INTEGER       AS attendances
    FROM active
    JOIN volunteer_roster r
      ON r.claimed_by = active.user_id AND r.approved_at IS NOT NULL
   WHERE r.committee IS NOT NULL
     AND btrim(r.committee) <> ''
     AND is_volunteer(active.user_id)
     /* The same test hasVerifiedActivity() applies to a person, restated here
      * because the divisor has to mean it. A month of corrections that nets to
      * nothing leaves a row in the active CTE with minutes <= 0, and counting that
      * person as an active member would shrink the committee's average by
      * somebody who did not have a month. Persons are filtered by
      * eligibleFor() in awards.ts; a committee has no equivalent, so the SQL
      * has to be the place. */
     AND (active.minutes > 0 OR active.attendances > 0)
   GROUP BY btrim(r.committee)
   /* Alphabetical and therefore meaningless: shortlistTeams() ranks by
    * average per active member, and it must be the only thing that does. */
   ORDER BY 1
`;

export async function teamRows(period: string): Promise<TeamFacts[]> {
  const window = periodWindow(period);
  if (!window) return [];
  const rows = await query<{
    committee: string;
    active_members: number;
    verified_minutes: number;
    attendances: number;
  }>(TEAMS_SQL, [window.startsOn, window.endsOn]);

  /* One query for every committee's last win rather than one per committee.
   * There are a few dozen labels on the roster and this runs on a staff page
   * that is already doing four shortlists. */
  const wins = new Map<string, string>();
  for (const row of await query<{ team: string; last_won: string }>(
    `SELECT btrim(team) AS team, max(period) AS last_won
       FROM recognition_awards
      WHERE award = 'team_of_the_month' AND team IS NOT NULL
      GROUP BY btrim(team)`,
  )) {
    wins.set(row.team, row.last_won);
  }

  return rows.map((r) => ({
    committee: r.committee,
    activeMembers: Number(r.active_members) || 0,
    verifiedMinutes: Number(r.verified_minutes) || 0,
    attendances: Number(r.attendances) || 0,
    lastWonPeriod: wins.get(r.committee) ?? null,
  }));
}

/**
 * The members of a committee who were actually active in the period.
 *
 * Who the team badge goes to and who is told. A team is not an account, so the
 * recognition has to land on people — and only on the people who made that
 * month. A name that has sat on a 2019 spreadsheet without volunteering since
 * is not part of August's team, and a badge saying it was would be the first
 * figure on this platform that somebody could point at and call untrue.
 */
export async function teamMemberIds(period: string, committee: string): Promise<string[]> {
  const window = periodWindow(period);
  if (!window || !committee.trim()) return [];
  const rows = await query<{ user_id: string }>(
    `WITH ${MONTH_CTES}
     SELECT active.user_id::TEXT AS user_id
       FROM active
       JOIN volunteer_roster r
         ON r.claimed_by = active.user_id AND r.approved_at IS NOT NULL
      WHERE btrim(r.committee) = btrim($3)
        AND is_volunteer(active.user_id)
        -- Exactly the test TEAMS_SQL counts by, so the badges land on the same
        -- people the average was worked out over. Two different definitions of
        -- "active" here would mean the committee was ranked on one set of
        -- members and thanked as another.
        AND (active.minutes > 0 OR active.attendances > 0)
      ORDER BY 1`,
    [window.startsOn, window.endsOn, committee],
  );
  return rows.map((r) => r.user_id);
}

// -------------------------------------------------------- decided awards

/** A decided award as the staff listing needs it. Names are staff-only. */
export type DecidedRow = {
  id: string;
  period: string;
  award: AwardKind;
  user_id: string | null;
  team: string | null;
  reason: string;
  decided_at: Date;
  decided_by_name: string | null;
  winner_name: string | null;
  minutes: number | null;
  attendances: number | null;
  active_members: number | null;
};

/** Everything decided for one period. Small — at most four rows. */
export async function decidedForPeriod(period: string): Promise<DecidedRow[]> {
  return query<DecidedRow>(
    `SELECT ra.id::TEXT AS id, ra.period, ra.award, ra.user_id::TEXT AS user_id, ra.team,
            ra.reason, ra.decided_at, ra.minutes, ra.attendances, ra.active_members,
            dp.full_name AS decided_by_name,
            wp.full_name AS winner_name
       FROM recognition_awards ra
       LEFT JOIN profiles dp ON dp.user_id = ra.decided_by
       LEFT JOIN profiles wp ON wp.user_id = ra.user_id
      WHERE ra.period = $1
      ORDER BY ra.award`,
    [period],
  );
}

/** Whether this award is already settled for this period. */
export async function isDecided(period: string, award: AwardKind): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    'SELECT id::TEXT AS id FROM recognition_awards WHERE period = $1 AND award = $2',
    [period, award],
  );
  return Boolean(row);
}

/**
 * The whole archive, with consent resolved, for the public honours page.
 *
 * Returns `AwardRecord`, which carries a printable name and no user id at all
 * — so the page cannot put an identifier in a link, a key or a data attribute
 * however it is later edited. Somebody whose consent no longer permits naming
 * them arrives with `publicName: null`, and `publicAward` in awards.ts drops
 * them; the month simply has one fewer entry.
 *
 * Consent is asked again HERE rather than trusted from the moment of the
 * award. A person can change their mind after winning, and when they do the
 * honours page must fall silent about them on the next render.
 */
export async function honoursRecords(today: string): Promise<AwardRecord[]> {
  const rows = await query<{
    period: string;
    award: string;
    team: string | null;
    reason: string;
    minutes: number | null;
    attendances: number | null;
    active_members: number | null;
    full_name: string | null;
    display_name: string | null;
    public_visibility: string | null;
    sensitive_dob: string | null;
    safeguarding_dob: string | null;
    roster_dob: string | null;
  }>(
    `SELECT ra.period, ra.award, ra.team, ra.reason,
            ra.minutes, ra.attendances, ra.active_members,
            p.full_name, p.display_name, p.public_visibility,
            to_char(ps.date_of_birth, 'YYYY-MM-DD') AS sensitive_dob,
            to_char(sr.date_of_birth, 'YYYY-MM-DD') AS safeguarding_dob,
            to_char(r.date_of_birth,  'YYYY-MM-DD') AS roster_dob
       FROM recognition_awards ra
       LEFT JOIN profiles              p  ON p.user_id  = ra.user_id
       LEFT JOIN profiles_sensitive    ps ON ps.user_id = ra.user_id
       LEFT JOIN safeguarding_records  sr ON sr.user_id = ra.user_id
       LEFT JOIN volunteer_roster      r  ON r.claimed_by = ra.user_id
                                         AND r.approved_at IS NOT NULL
      ORDER BY ra.period DESC, ra.award`,
  );

  const out: AwardRecord[] = [];
  for (const row of rows) {
    if (!isAwardKind(row.award)) continue;

    let publicName: string | null = null;
    let photo = false;

    if (isPersonAward(row.award)) {
      const identity = publicIdentity({
        choice: visibilityFrom(row.public_visibility),
        isMinor: treatAsMinor({
          sensitiveDob: row.sensitive_dob,
          safeguardingDob: row.safeguarding_dob,
          rosterDob: row.roster_dob,
          today,
        }),
        fullName: row.full_name ?? '',
        displayName: row.display_name,
      });
      if (identity.show) {
        publicName = identity.name;
        photo = identity.photo;
      }
    }

    out.push({
      period: row.period,
      award: row.award,
      team: row.team,
      publicName,
      photo,
      reason: row.reason,
      minutes: row.minutes,
      attendances: row.attendances,
      activeMembers: row.active_members,
    });
  }
  return out;
}
