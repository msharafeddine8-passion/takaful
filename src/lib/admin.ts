import 'server-only';
import { query, queryOne } from './db';
import type { MembershipStatus } from './auth';

/**
 * Everything the staff dashboard reads.
 *
 * One module so the numbers on the dashboard, in a queue, and on a member's
 * page can never disagree - they all come from here. Anything that looks like
 * a total is computed in SQL rather than by adding up rows in JavaScript,
 * because a page that fetches 50 rows and sums them is quietly wrong the day
 * there are 51.
 */

export type Overview = {
  members: number;
  volunteers: number;
  applicationsOpen: number;
  hoursPending: number;
  hoursPendingMinutes: number;
  verifiedMinutes: number;
  certificates: number;
  coursesPassed: number;
  newThisMonth: number;
};

export async function overview(): Promise<Overview> {
  const row = await queryOne<Record<string, string>>(`
    SELECT
      (SELECT count(*) FROM users WHERE status = 'active')                        AS members,
      (SELECT count(DISTINCT user_id) FROM user_roles
         WHERE role = 'volunteer'
           AND (valid_until IS NULL OR valid_until > now()))                      AS volunteers,
      (SELECT count(*) FROM volunteer_applications
         WHERE status IN ('submitted','under_review','interview_required','interview_scheduled'))
                                                                                  AS applications_open,
      (SELECT count(*) FROM hour_entries WHERE status = 'pending')                AS hours_pending,
      (SELECT COALESCE(SUM(minutes),0) FROM hour_entries WHERE status = 'pending')AS hours_pending_minutes,
      (SELECT COALESCE(SUM(minutes),0) FROM hour_entries WHERE status = 'verified') AS verified_minutes,
      (SELECT count(*) FROM certificates WHERE revoked_at IS NULL)                AS certificates,
      (SELECT count(*) FROM course_progress WHERE passed)                         AS courses_passed,
      (SELECT count(*) FROM users WHERE created_at >= date_trunc('month', now())) AS new_this_month
  `);

  const n = (k: string) => Number.parseInt(row?.[k] ?? '0', 10);
  return {
    members: n('members'),
    volunteers: n('volunteers'),
    applicationsOpen: n('applications_open'),
    hoursPending: n('hours_pending'),
    hoursPendingMinutes: n('hours_pending_minutes'),
    verifiedMinutes: n('verified_minutes'),
    certificates: n('certificates'),
    coursesPassed: n('courses_passed'),
    newThisMonth: n('new_this_month'),
  };
}

// --------------------------------------------------------------- members

export type MemberRow = {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: Date;
  membership_status: string | null;
  roles: string[];
  verified_minutes: string;
  stage: number | null;
  /*
   * When they joined the ASSOCIATION, which for most people here is not when
   * they made an account.
   *
   * The list was showing created_at under a column headed "joined", so a
   * volunteer of five years read as having arrived last Tuesday — the same
   * fault the membership card had, and it matters more here, because this is
   * the page staff make decisions on. It comes from the roster line they were
   * recognised through; null when there is no such line, which is the honest
   * answer for somebody genuinely new rather than a date standing in for one.
   *
   * Kept beside created_at rather than replacing it, so the two can be shown
   * together where they differ. "With us since 2021, account since 2026" is
   * useful to an administrator; one date pretending to be the other is not.
   */
  joined_on: string | null;
};

/**
 * The one definition of "the membership status of this account".
 *
 * The latest row of the history and nothing else — there is no status column on
 * `users`, and is_volunteer() in migration 006 reads exactly this. Written once
 * and interpolated so that the column the list DISPLAYS and the column the
 * filter MATCHES ON can never drift into being two different questions: a
 * filter that answers with rows whose visible status is not the one asked for
 * is worse than no filter, because it is believed.
 *
 * `changed_at DESC, id DESC` because two rows can share a timestamp — the
 * identity column breaks the tie in insertion order, which is the order the
 * decisions were actually taken.
 */
const LATEST_STATUS = `(SELECT h.new_status FROM membership_status_history h
                         WHERE h.user_id = u.id
                         ORDER BY h.changed_at DESC, h.id DESC LIMIT 1)`;

/**
 * The member list. `search` matches name or address, case-insensitively, and
 * `status` narrows to one membership status — '' meaning every status, the
 * same empty-string-is-no-filter idiom `search` already uses, so neither
 * parameter needs to be nullable.
 *
 * Sensitive fields are not selected: this is a roster, not a file on someone.
 */
export async function members(
  search = '',
  limit = 50,
  offset = 0,
  status: MembershipStatus | '' = '',
): Promise<MemberRow[]> {
  const term = search.trim();
  return query<MemberRow>(
    `SELECT u.id, p.full_name, u.email, u.status, u.created_at,
            ${LATEST_STATUS} AS membership_status,
            COALESCE((SELECT array_agg(r.role ORDER BY r.role) FROM user_roles r
                       WHERE r.user_id = u.id
                         AND (r.valid_until IS NULL OR r.valid_until > now())), '{}') AS roles,
            COALESCE((SELECT vm.minutes FROM verified_minutes vm WHERE vm.user_id = u.id), 0)::TEXT AS verified_minutes,
            (SELECT MAX(s.stage) FROM stage_progress s WHERE s.user_id = u.id) AS stage,
            /* to_char, not the bare date. The session runs GMT and the
             * association is in Beirut, so a date handed back as a timestamp
             * arrives two hours early and renders as the day before. */
            (SELECT to_char(r.joined_on, 'YYYY-MM-DD') FROM volunteer_roster r
              WHERE r.claimed_by = u.id AND r.approved_at IS NOT NULL
              LIMIT 1) AS joined_on
       FROM users u
       JOIN profiles p ON p.user_id = u.id
      WHERE ($1 = '' OR p.full_name ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%')
        AND ($4 = '' OR ${LATEST_STATUS} = $4)
      ORDER BY u.created_at DESC
      LIMIT $2 OFFSET $3`,
    [term, limit, offset, status],
  );
}

/**
 * How many members the same two filters match.
 *
 * Takes `status` for the reason the list does: the figure under the search box
 * is read as "how many there are", and a total counted without the filter that
 * produced the rows is a number that contradicts the table beneath it.
 */
export async function memberCount(search = '', status: MembershipStatus | '' = ''): Promise<number> {
  const row = await queryOne<{ n: string }>(
    `SELECT count(*) AS n FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE ($1 = '' OR p.full_name ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%')
        AND ($2 = '' OR ${LATEST_STATUS} = $2)`,
    [search.trim(), status],
  );
  return Number.parseInt(row?.n ?? '0', 10);
}

// ------------------------------------------------------------- audit log

export type AuditRow = {
  id: string;
  actor_name: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  reason: string | null;
  created_at: Date;
};

export async function auditLog(limit = 100, action = ''): Promise<AuditRow[]> {
  return query<AuditRow>(
    `SELECT a.id::TEXT, p.full_name AS actor_name, a.action, a.target_type, a.target_id,
            a.reason, a.created_at
       FROM audit_logs a
       LEFT JOIN profiles p ON p.user_id = a.actor_id
      WHERE ($1 = '' OR a.action LIKE $1 || '%')
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT $2`,
    [action.trim(), limit],
  );
}

/** Distinct actions, for the filter, so it lists what has happened rather than what might. */
export async function auditActions(): Promise<string[]> {
  const rows = await query<{ action: string }>(
    'SELECT DISTINCT action FROM audit_logs ORDER BY action',
  );
  return rows.map((r) => r.action);
}
