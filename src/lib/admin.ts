import 'server-only';
import { query, queryOne } from './db';

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
};

/**
 * The member list. `search` matches name or address, case-insensitively.
 * Sensitive fields are not selected: this is a roster, not a file on someone.
 */
export async function members(search = '', limit = 50, offset = 0): Promise<MemberRow[]> {
  const term = search.trim();
  return query<MemberRow>(
    `SELECT u.id, p.full_name, u.email, u.status, u.created_at,
            (SELECT h.new_status FROM membership_status_history h
              WHERE h.user_id = u.id ORDER BY h.changed_at DESC, h.id DESC LIMIT 1) AS membership_status,
            COALESCE((SELECT array_agg(r.role ORDER BY r.role) FROM user_roles r
                       WHERE r.user_id = u.id
                         AND (r.valid_until IS NULL OR r.valid_until > now())), '{}') AS roles,
            COALESCE((SELECT vm.minutes FROM verified_minutes vm WHERE vm.user_id = u.id), 0)::TEXT AS verified_minutes,
            (SELECT MAX(s.stage) FROM stage_progress s WHERE s.user_id = u.id) AS stage
       FROM users u
       JOIN profiles p ON p.user_id = u.id
      WHERE ($1 = '' OR p.full_name ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%')
      ORDER BY u.created_at DESC
      LIMIT $2 OFFSET $3`,
    [term, limit, offset],
  );
}

export async function memberCount(search = ''): Promise<number> {
  const row = await queryOne<{ n: string }>(
    `SELECT count(*) AS n FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE ($1 = '' OR p.full_name ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%')`,
    [search.trim()],
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
