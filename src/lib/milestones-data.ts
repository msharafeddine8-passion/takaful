import 'server-only';
import { query, queryOne, transaction } from './db';
import { notifyIn } from './notify';
import { beirutToday } from './when';
import {
  birthdayKeys, isBirthdayToday, milestonesEarned, yearOf,
  type MilestoneCode, type MilestoneFacts,
} from './milestones';
import { publicBirthdayIdentity, treatAsMinor, visibilityFrom } from './visibility';
import { milestoneDictionaries } from './dictionaries/milestones';

/**
 * Sending the greetings and the milestones, exactly once each.
 *
 * WHERE THIS RUNS, AND WHY THERE IS NO JOB
 *
 * There is no cron on this platform and adding one would be the least
 * reliable part of the feature: a scheduled task that stops running fails
 * silently, and the way anybody would find out is a volunteer saying nobody
 * wished them a happy birthday. So these run when the account page is opened,
 * the same decision `recomputeAchievements` already made — «so a badge is
 * never waiting on a background job nobody runs».
 *
 * That means they run constantly, from many requests at once, and possibly
 * twice in the same second. Which is the point: the correctness does not
 * depend on how often they run. Every write below is
 * INSERT ... ON CONFLICT DO NOTHING RETURNING against a primary key from
 * migration 037, and the notification is written inside the same transaction
 * as the row that claims it. Two requests racing both attempt the insert;
 * exactly one gets a row back and exactly one notification is written. A
 * request that dies half way rolls back both, so the next one tries again —
 * the failure mode is a greeting sent late, never twice, and never a row
 * saying somebody was greeted when they were not.
 *
 * WHAT THIS MODULE HOLDS AND DOES NOT PASS ON
 *
 * It reads three dates of birth to decide whose day it is and whether they are
 * a child. Nothing it returns contains a date, a day, a month, a year or an
 * age: `todayBirthdays` returns names that visibility.ts has already agreed
 * may be published, and nothing else. There is no field on the way out that
 * either could land in, so no later edit to a page can print one by accident.
 *
 * NO POINTS. Neither function touches impact_points or achievements. A
 * birthday is not an accomplishment and a milestone is a thank-you; putting
 * either into the ledger would move somebody up a list for having been born.
 */

const ZONE = 'Asia/Beirut';

/* ------------------------------------------------------------- birthdays */

/**
 * Everyone with a birthday today, with the three dates that decide whether
 * they are a child.
 *
 * Narrowed in SQL to the MM-DD keys the pure module produced, so this reads a
 * handful of rows rather than every date of birth the association holds. The
 * day itself is decided in TypeScript all the same — `isBirthdayToday` below —
 * because the query and the page must not be able to disagree about whose day
 * it is, and only one of the two can be tested without a database.
 *
 * The roster is joined only through a line this account has claimed and staff
 * have approved, exactly as continuity-data does it. Four hundred roster lines
 * belong to people who have never made an account and consented to nothing;
 * greeting them would be the platform announcing the birthday of somebody who
 * has never used it.
 *
 * No backticks in the SQL: it is a template literal, and one inside a comment
 * ends the string and stops the file parsing. That has happened here before.
 */
const BIRTHDAY_SQL = `
  SELECT u.id::TEXT                                AS id,
         p.full_name,
         p.display_name,
         p.public_visibility,
         p.birthday_greetings,

         /* Text, at 'YYYY-MM-DD'. isBirthdayToday refuses anything else rather
          * than trimming it, and a DATE handed to the driver becomes a JS Date
          * at midnight in whatever zone the server keeps - which is the day
          * before, for half the year, on a machine running GMT. */
         to_char(ps.date_of_birth, 'YYYY-MM-DD')   AS sensitive_dob,
         to_char(sr.date_of_birth, 'YYYY-MM-DD')   AS safeguarding_dob,
         to_char(r.date_of_birth,  'YYYY-MM-DD')   AS roster_dob

    FROM users u
    JOIN profiles p ON p.user_id = u.id
    LEFT JOIN profiles_sensitive        ps ON ps.user_id = u.id
    LEFT JOIN safeguarding_records      sr ON sr.user_id = u.id
    LEFT JOIN volunteer_roster r
           ON r.claimed_by = u.id AND r.approved_at IS NOT NULL

   /* A suspended or deactivated account is not greeted and is not named to
    * anybody. Whatever the reason for the status, a cheerful banner about
    * somebody the association has stopped working with is the wrong thing on
    * everybody's screen. */
   WHERE u.status = 'active'
     /* Cast rather than left to inference. An untyped parameter in = ANY()
      * is resolved from the operand beside it, which is a to_char() the
      * planner is free to type as unknown; naming TEXT[] here means the query
      * cannot start depending on which side Postgres looked at first. */
     AND (
       to_char(ps.date_of_birth, 'MM-DD') = ANY($1::TEXT[])
       OR to_char(sr.date_of_birth, 'MM-DD') = ANY($1::TEXT[])
       OR to_char(r.date_of_birth,  'MM-DD') = ANY($1::TEXT[])
     )
`;

type BirthdayRow = {
  id: string;
  full_name: string;
  display_name: string | null;
  public_visibility: string | null;
  birthday_greetings: boolean | null;
  sensitive_dob: string | null;
  safeguarding_dob: string | null;
  roster_dob: string | null;
};

async function birthdayRows(today: string): Promise<BirthdayRow[]> {
  const keys = birthdayKeys(today);
  // No keys means a malformed date reached this far. Selecting nobody is the
  // only safe answer: the alternative is a query with no filter on it.
  if (keys.length === 0) return [];
  return query<BirthdayRow>(BIRTHDAY_SQL, [keys]);
}

/** Whether any of the three dates the association holds falls today. */
function hasBirthdayToday(row: BirthdayRow, today: string): boolean {
  return (
    isBirthdayToday(row.sensitive_dob, today) ||
    isBirthdayToday(row.safeguarding_dob, today) ||
    isBirthdayToday(row.roster_dob, today)
  );
}

/**
 * The private greeting, once in a year.
 *
 * Sent to the person whose day it is whatever they chose about appearing in
 * public — that setting governs whether the association may TELL anybody, and
 * a volunteer who would rather not be announced has not asked to be ignored.
 * The way out of receiving one is the birthdays switch on the settings page,
 * which notifyIn honours through muted_topics.
 *
 * A minor receives theirs like everybody else. Safeguarding is about what is
 * published, not about who may be wished well.
 */
async function greet(row: BirthdayRow, today: string, year: number): Promise<void> {
  await transaction(async (client) => {
    const { rows } = await client.query<{ user_id: string }>(
      `INSERT INTO birthday_greetings_sent (user_id, greeting_year, greeted_on)
       VALUES ($1, $2, $3::DATE)
       ON CONFLICT (user_id, greeting_year) DO NOTHING
       RETURNING user_id::TEXT`,
      [row.id, year, today],
    );
    // Somebody else got there first — another request, or this page rendered
    // twice. Their greeting has already been written; there is nothing to do.
    if (rows.length === 0) return;

    await notifyIn(client, {
      userId: row.id,
      kind: 'birthday.greeting',
      titleAr: milestoneDictionaries.ar.birthday.greetingTitle,
      titleEn: milestoneDictionaries.en.birthday.greetingTitle,
      bodyAr: milestoneDictionaries.ar.birthday.wish,
      bodyEn: milestoneDictionaries.en.birthday.wish,
      /* No link. There is no birthday page to go to, and a link to the account
       * page from a message that was read on the account page is furniture. */
    });
  });
}

/** What the account page needs in order to draw the banner, and nothing more. */
export type BirthdaysToday = {
  /** Names already cleared for publication by publicBirthdayIdentity. */
  names: string[];
};

/**
 * Today's greetings: sends the private ones, returns the public names.
 *
 * One pass over one small result set, because the two answers come from the
 * same rows and reading them twice would let the page and the greeting
 * disagree on a day when somebody changed a setting between the two queries.
 *
 * `viewerId` is left out of the names. Their own greeting arrived as a
 * notification; a banner telling somebody it is their own birthday, on their
 * own dashboard, reads as the software talking to itself.
 */
export async function runBirthdays(viewerId: string, today = beirutToday()): Promise<BirthdaysToday> {
  const year = yearOf(today);
  if (year === null) return { names: [] };

  const rows = (await birthdayRows(today)).filter((row) => hasBirthdayToday(row, today));

  const names: string[] = [];
  for (const row of rows) {
    /* The private greeting first, and never blocked by a failure to render the
     * public one. Wrapped so that one person's greeting failing does not stop
     * the rest, and does not take the account page down with it - this is a
     * page render, not a job, and nothing here is worth a blank dashboard. */
    await greet(row, today, year).catch((error) =>
      console.error('[birthdays] could not greet', row.id, error),
    );

    if (row.id === viewerId) continue;

    /*
     * THE ONLY PLACE A NAME BECOMES PUBLIC.
     *
     * publicBirthdayIdentity wants all three questions answered — did they
     * turn greetings on, are they visible at all, are they a child — and it
     * answers with a name or with silence. Nothing here second-guesses it and
     * nothing here falls back to the full name when it refuses.
     *
     * treatAsMinor is given all three dates and its answer is used once, here,
     * and never stored on anything that leaves this function. An unknown age
     * comes back as "protect this person", which is visibility.ts's judgement
     * and not this module's.
     */
    const identity = publicBirthdayIdentity({
      choice: visibilityFrom(row.public_visibility),
      isMinor: treatAsMinor({
        sensitiveDob: row.sensitive_dob,
        safeguardingDob: row.safeguarding_dob,
        rosterDob: row.roster_dob,
        today,
      }),
      fullName: row.full_name,
      displayName: row.display_name,
      birthdayGreetings: row.birthday_greetings === true,
    });
    if (identity.show) names.push(identity.name);
  }

  return { names };
}

/* ------------------------------------------------------------ milestones */

/**
 * Everything a milestone is decided from, for one person, in one round trip.
 *
 * Every figure is read from the ledger it belongs to rather than from a
 * counter, for the reason the whole platform reads figures that way: a stored
 * total drifts the first time an hour entry is corrected, and a milestone
 * fired off a drifted total cannot be taken back.
 */
const FACTS_SQL = `
  SELECT
    (SELECT count(*) FROM activity_attendance aa
      WHERE aa.user_id = u.id AND aa.attended)::INTEGER                    AS activities_attended,

    /* Certificates that still stand. A revoked one is not a first: telling
     * somebody about a first certificate that has since been withdrawn is
     * worse than saying nothing. */
    (SELECT count(*) FROM certificates c
      WHERE c.user_id = u.id AND c.revoked_at IS NULL)::INTEGER            AS certificates,

    COALESCE((SELECT sum(h.minutes) FROM hour_entries h
               WHERE h.user_id = u.id AND h.status = 'verified'), 0)::INTEGER
                                                                           AS verified_minutes,

    /* The membership date the association holds, falling back to the account.
     * Converted to Beirut before it is cut to a date and handed over as text:
     * an account made at 01:00 Beirut on 1 January is 31 December in GMT, and
     * the anniversary would fall a day early every year after. */
    to_char(
      COALESCE(r.joined_on, (u.created_at AT TIME ZONE 'Asia/Beirut')::date),
      'YYYY-MM-DD'
    )                                                                      AS joined_on,

    ARRAY(SELECT sp.stage FROM stage_progress sp
           WHERE sp.user_id = u.id ORDER BY sp.stage)                      AS stages_reached,

    (SELECT count(*) FROM journey_stages js
      WHERE js.version_id = (SELECT cja.version_id FROM current_journey_assignment cja
                              WHERE cja.user_id = u.id))::INTEGER          AS stages_total,

    /*
     * The longest run of empty days between two days on which they did
     * something.
     *
     * Deliberately not "days since they were last seen". That figure grows
     * every night somebody is away, so it would cross the threshold while they
     * are still absent and welcome back a person who has not come back. A gap
     * measured between two days that both happened only exists once they have
     * returned.
     *
     * hour_entries.worked_on is a DATE - a day somebody wrote down, with no
     * zone in it - so it is used as it stands. An activity's start is a
     * timestamp and must be read in Beirut first, or an evening activity
     * counts as the following day and every gap around it is off by one.
     */
    (WITH days AS (
       SELECT DISTINCT h.worked_on AS d
         FROM hour_entries h
        WHERE h.user_id = u.id AND h.status = 'verified'
       UNION
       SELECT DISTINCT (a.starts_at AT TIME ZONE '${ZONE}')::date
         FROM activity_attendance aa
         JOIN activities a ON a.id = aa.activity_id
        WHERE aa.user_id = u.id AND aa.attended AND a.starts_at IS NOT NULL
     ),
     gaps AS (SELECT d - lag(d) OVER (ORDER BY d) AS gap FROM days)
     SELECT COALESCE(max(gap), 0)::INTEGER FROM gaps)                      AS longest_gap_days

  FROM users u
  LEFT JOIN volunteer_roster r ON r.claimed_by = u.id AND r.approved_at IS NOT NULL
  WHERE u.id = $1
`;

type FactsRow = {
  activities_attended: number;
  certificates: number;
  verified_minutes: number;
  joined_on: string | null;
  stages_reached: number[] | null;
  stages_total: number | null;
  longest_gap_days: number | null;
};

/**
 * Brings one person's milestones up to date and tells them about anything new.
 *
 * Safe to call as often as you like — and it is called on every account page
 * render, which is the whole design. The set of milestones that are true of
 * somebody is computed fresh from the ledgers; which of them are NEW is
 * decided by the primary key on milestone_events, inside the transaction that
 * writes the notification.
 *
 * Returns the codes it announced, which is almost always none. Callers use it
 * for logging; nothing renders it.
 */
export async function runMilestones(
  userId: string,
  today = beirutToday(),
): Promise<MilestoneCode[]> {
  const row = await queryOne<FactsRow>(FACTS_SQL, [userId]);
  if (!row) return [];

  const facts: MilestoneFacts = {
    activitiesAttended: Number(row.activities_attended ?? 0),
    certificates: Number(row.certificates ?? 0),
    verifiedMinutes: Number(row.verified_minutes ?? 0),
    joinedOn: row.joined_on,
    stagesReached: (row.stages_reached ?? []).map(Number),
    stagesTotal: row.stages_total,
    longestGapDays: row.longest_gap_days,
    today,
  };

  const earned = milestonesEarned(facts);
  if (earned.length === 0) return [];

  return transaction(async (client) => {
    /*
     * One statement for the whole set, and the RETURNING is the answer to
     * "which of these had never happened before".
     *
     * unnest rather than a loop of inserts: a person crossing two milestones
     * at once should either be told about both or about neither, and a loop
     * inside a transaction that fails half way would leave the first one
     * written and the second waiting for a render that may not come for weeks.
     */
    const { rows } = await client.query<{ code: string }>(
      `INSERT INTO milestone_events (user_id, code, reached_on)
       SELECT $1, t.code, $3::DATE FROM unnest($2::TEXT[]) AS t(code)
       ON CONFLICT (user_id, code) DO NOTHING
       RETURNING code`,
      [userId, earned, today],
    );

    const announced: MilestoneCode[] = [];
    /* Iterated in catalogue order rather than in the order the database
     * returned them, so somebody who crosses two at once is told about them in
     * the order they were reached. */
    for (const code of earned) {
      if (!rows.some((r) => r.code === code)) continue;
      const ar = milestoneDictionaries.ar.milestones[code];
      const en = milestoneDictionaries.en.milestones[code];
      await notifyIn(client, {
        userId,
        kind: 'milestone.reached',
        titleAr: ar.title,
        titleEn: en.title,
        bodyAr: ar.body,
        bodyEn: en.body,
        link: '/account/achievements',
      });
      announced.push(code);
    }
    return announced;
  });
}
