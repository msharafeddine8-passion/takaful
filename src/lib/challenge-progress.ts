import 'server-only';
import { query, queryOne } from './db';
import { beirutToday } from './when';
import {
  isChallengeMetric,
  showsOnAccount,
  viewOf,
  type ChallengeFacts,
  type ChallengeMetric,
  type ChallengeView,
} from './challenges';

/**
 * The live figures behind a challenge.
 *
 * Everything here is aggregated in SQL and every total is cast to INTEGER.
 * count() and sum() come back as bigint, which the driver hands over as a
 * string, and '9' + 1 = '91' is a bug that waits until the numbers matter.
 *
 * TWO RULES THIS MODULE KEEPS
 *
 * Nothing is read from a counter. Every figure below is a SELECT over the
 * source table - hour_entries, activity_attendance, certificates, activities -
 * so the bar on the page and the rows a coordinator can audit are the same
 * fact. A stored total would drift the first time an hour entry was corrected.
 *
 * No query returns a figure for anybody but the person asking. The personal
 * queries are all `WHERE user_id = $2` returning one number. There is no
 * GROUP BY user_id anywhere in this file, and there must never be: a query
 * that returns per-person totals is one ORDER BY away from a leaderboard, and
 * a leaderboard is the thing the association asked us not to build.
 *
 * BEIRUT
 *
 * The database session runs GMT. A challenge window is a pair of Beirut
 * calendar days, so every timestamp is converted before it is compared with
 * one: `(issued_at AT TIME ZONE 'Asia/Beirut')::date`. Without the conversion
 * an activity at nine in the evening on the last day of the month falls into
 * the next month and the challenge it belonged to closes without it.
 *
 * hour_entries.worked_on is already a DATE - a day somebody wrote down, with
 * no zone in it - so it is compared directly. Converting it would be wrong.
 */

const ZONE = 'Asia/Beirut';

export type ChallengeRow = {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  metric: ChallengeMetric;
  target: number;
  /** 'YYYY-MM-DD'. See toIsoDate below for why this is text and not a Date. */
  starts_on: string;
  ends_on: string;
  is_active: boolean;
  archived_at: Date | null;
  archive_reason: string | null;
  created_at: Date;
};

/** A challenge with its live figures and, privately, the viewer's own part. */
export type ChallengeCard = ChallengeRow & { view: ChallengeView };

/**
 * `starts_on` and `ends_on` come out of `pg` as JavaScript Dates, built from
 * the date at midnight in the *process* timezone. Formatting one back with
 * toISOString() in Beirut summer gives the previous day. So the columns are
 * selected with ::TEXT in every query below and this is the belt to that
 * brace, for any row that reaches here another way.
 */
function toIsoDate(value: string | Date): string {
  if (typeof value === 'string') return value.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function factsOf(row: ChallengeRow): ChallengeFacts {
  return {
    metric: row.metric,
    target: row.target,
    startsOn: toIsoDate(row.starts_on),
    endsOn: toIsoDate(row.ends_on),
    isActive: row.is_active,
    isArchived: row.archived_at !== null,
  };
}

const SELECT_COLUMNS = `
  id, name_ar, name_en, description_ar, description_en, metric, target,
  starts_on::TEXT AS starts_on, ends_on::TEXT AS ends_on,
  is_active, archived_at, archive_reason, created_at`;

/** Live challenges, newest window first. Archived ones are not offered. */
export async function liveChallenges(): Promise<ChallengeRow[]> {
  const rows = await query<ChallengeRow>(
    `SELECT ${SELECT_COLUMNS} FROM challenges
      WHERE archived_at IS NULL AND is_active
      ORDER BY ends_on ASC, created_at DESC`,
  );
  return rows.filter((r) => isChallengeMetric(r.metric));
}

/** Everything, archived included. The staff listing, which shows the history. */
export async function allChallenges(): Promise<ChallengeRow[]> {
  const rows = await query<ChallengeRow>(
    `SELECT ${SELECT_COLUMNS} FROM challenges ORDER BY created_at DESC`,
  );
  return rows.filter((r) => isChallengeMetric(r.metric));
}

export async function challengeById(id: string): Promise<ChallengeRow | null> {
  const row = await queryOne<ChallengeRow>(
    `SELECT ${SELECT_COLUMNS} FROM challenges WHERE id = $1`,
    [id],
  );
  return row && isChallengeMetric(row.metric) ? row : null;
}

/**
 * The community total for one challenge, in the metric's base unit.
 *
 * One statement per metric rather than one clever statement with a CASE in it:
 * the four count different tables with different date columns and different
 * ideas of what "verified" means, and a single query pretending otherwise
 * would be unreadable and wrong in a way nobody could see.
 *
 * `userId` narrows the same count to one person. It is bound as a parameter
 * and compared with `=`, so the personal figure is arithmetically the same
 * number as the community one, restricted - a separate query would eventually
 * disagree with the total it sits under.
 */
async function totalFor(
  metric: ChallengeMetric,
  startsOn: string,
  endsOn: string,
  userId: string | null,
): Promise<number> {
  const mine = userId !== null;
  const params = mine ? [startsOn, endsOn, userId] : [startsOn, endsOn];
  const only = (column: string) => (mine ? `AND ${column} = $3` : '');

  let sql: string;
  switch (metric) {
    /* worked_on is a DATE the volunteer wrote down. No zone conversion: it
     * never had a zone, and forcing one would move the day. */
    case 'verified_minutes':
      sql = `
        SELECT COALESCE(SUM(minutes), 0)::INTEGER AS n
          FROM hour_entries
         WHERE status = 'verified'
           AND worked_on BETWEEN $1::date AND $2::date
           ${only('user_id')}`;
      break;

    /* Counted on the day the activity happened, not the day a supervisor got
     * round to confirming it - a challenge for August must not be moved by
     * paperwork done in September. An activity with no date yet cannot have
     * been attended, so COALESCE falls back to starts_on and then excludes
     * the row by leaving it NULL. */
    case 'attendances':
      sql = `
        SELECT count(*)::INTEGER AS n
          FROM activity_attendance aa
          JOIN activities a ON a.id = aa.activity_id
         WHERE aa.attended
           AND COALESCE((a.starts_at AT TIME ZONE '${ZONE}')::date, a.starts_on)
               BETWEEN $1::date AND $2::date
           ${only('aa.user_id')}`;
      break;

    /* Revoked certificates do not count, whenever they were revoked. A goal
     * of "100 safeguarding courses" that includes withdrawn ones is a figure
     * the association cannot repeat to anybody. */
    case 'certificates':
      sql = `
        SELECT count(*)::INTEGER AS n
          FROM certificates
         WHERE revoked_at IS NULL
           AND (issued_at AT TIME ZONE '${ZONE}')::date BETWEEN $1::date AND $2::date
           ${only('user_id')}`;
      break;

    /* Activities the association ran. Cancelled ones did not happen, and an
     * archived one is not part of the programme. There is no per-person
     * version of this: nobody "owns" an activity in a way a volunteer's own
     * contribution line could honestly report, so it returns 0 below. */
    case 'activities':
      if (mine) return 0;
      sql = `
        SELECT count(*)::INTEGER AS n
          FROM activities
         WHERE cancelled_at IS NULL
           AND NOT is_archived
           AND COALESCE((starts_at AT TIME ZONE '${ZONE}')::date, starts_on)
               BETWEEN $1::date AND $2::date`;
      break;
  }

  const row = await queryOne<{ n: number }>(sql, params);
  return row?.n ?? 0;
}

/** The community total. Identical for everybody who looks at it. */
export async function communityTotal(row: ChallengeRow): Promise<number> {
  const f = factsOf(row);
  return totalFor(f.metric, f.startsOn, f.endsOn, null);
}

/**
 * One person's own part, for showing back to that person and nobody else.
 *
 * Takes a single user id and returns a single number, so there is no shape
 * here that could be rendered as a list. Callers must never pass an id other
 * than the signed-in user's.
 */
export async function myContribution(row: ChallengeRow, userId: string): Promise<number> {
  const f = factsOf(row);
  return totalFor(f.metric, f.startsOn, f.endsOn, userId);
}

/**
 * The challenges to show a volunteer, with their figures.
 *
 * `userId` is the person asking, and it is the only id that enters this
 * function. Passed null - for a page with no signed-in reader - the cards come
 * back with `yourContribution: null` and are otherwise unchanged, because the
 * community total is not private.
 */
export async function challengeBoard(userId: string | null): Promise<ChallengeCard[]> {
  const today = beirutToday();
  const rows = (await liveChallenges()).filter((row) => showsOnAccount(factsOf(row), today));
  if (rows.length === 0) return [];

  return Promise.all(
    rows.map(async (row) => {
      const [total, mine] = await Promise.all([
        communityTotal(row),
        userId ? myContribution(row, userId) : Promise.resolve(0),
      ]);
      return { ...row, view: viewOf(factsOf(row), total, mine, today) };
    }),
  );
}

/**
 * The staff listing: every challenge with its community total.
 *
 * No personal figures at all, for anybody. A coordinator has no business
 * seeing who contributed what to a shared goal - that is the report they would
 * be asked to read out, and reading it out is the harm.
 */
export async function challengeAdminList(): Promise<ChallengeCard[]> {
  const today = beirutToday();
  const rows = await allChallenges();
  return Promise.all(
    rows.map(async (row) => {
      const total = await communityTotal(row);
      return { ...row, view: viewOf(factsOf(row), total, 0, today) };
    }),
  );
}

export { factsOf as challengeFactsOf };
