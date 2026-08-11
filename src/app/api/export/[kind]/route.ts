import { NextRequest } from 'next/server';
import { currentUser, audit } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured, query } from '@/lib/db';
import { toCsv, csvFilename, csvResponse } from '@/lib/csv';

/**
 * CSV exports for staff.
 *
 * An association reports to its board, its donors and the ministry, and those
 * numbers have to come out of the system rather than out of somebody counting
 * rows by hand at midnight.
 *
 * Two rules here. Every export is written to the audit log, because a file of
 * members' names leaving the system is an event worth being able to ask about
 * later. And the roster carries no address, phone or date of birth: a
 * spreadsheet gets forwarded, and what is not in it cannot be forwarded.
 */

type Kind = 'members' | 'hours' | 'activities';

const KINDS: Record<Kind, { capability: Parameters<typeof can>[1]; }> = {
  members: { capability: 'members.manage' },
  hours: { capability: 'hours.verify' },
  activities: { capability: 'activities.manage' },
};

function isKind(value: string): value is Kind {
  return value === 'members' || value === 'hours' || value === 'activities';
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ kind: string }> },
) {
  const { kind } = await context.params;
  if (!isKind(kind)) return new Response('Not found', { status: 404 });
  if (!isDbConfigured()) return new Response('Not available', { status: 503 });

  const user = await currentUser();
  // 404 rather than 403: whether an export exists is not something to confirm
  // to someone who may not sign in at all.
  if (!user || !can(user, KINDS[kind].capability)) {
    return new Response('Not found', { status: 404 });
  }

  const { headers, rows } = await build(kind);

  await audit({
    actorId: user.id,
    action: 'export.downloaded',
    targetType: 'export',
    targetId: kind,
    newValue: { rows: rows.length },
  });

  return csvResponse(toCsv(headers, rows), csvFilename(`takaful-${kind}`, new Date()));
}

async function build(kind: Kind): Promise<{ headers: string[]; rows: unknown[][] }> {
  if (kind === 'members') {
    const rows = await query<Record<string, unknown>>(`
      SELECT p.member_number, p.full_name, u.status,
             (SELECT h.new_status FROM membership_status_history h
               WHERE h.user_id = u.id ORDER BY h.changed_at DESC, h.id DESC LIMIT 1) AS membership,
             (SELECT MAX(s.stage) FROM stage_progress s WHERE s.user_id = u.id)       AS stage,
             COALESCE((SELECT vm.minutes FROM verified_minutes vm WHERE vm.user_id = u.id), 0)::INTEGER
               AS verified_minutes,
             (SELECT count(*) FROM certificates ct
               WHERE ct.user_id = u.id AND ct.revoked_at IS NULL)::INTEGER            AS certificates,
             u.created_at::DATE AS joined
        FROM users u JOIN profiles p ON p.user_id = u.id
       ORDER BY p.member_number NULLS LAST, u.created_at
    `);
    return {
      headers: [
        'member_number', 'full_name', 'account_status', 'membership_status',
        'stage', 'verified_hours', 'certificates', 'joined',
      ],
      rows: rows.map((r) => [
        r.member_number, r.full_name, r.status, r.membership, r.stage,
        // Hours, not minutes: the number that goes in a report.
        ((r.verified_minutes as number) / 60).toFixed(2),
        r.certificates, r.joined,
      ]),
    };
  }

  if (kind === 'hours') {
    const rows = await query<Record<string, unknown>>(`
      SELECT h.worked_on, p.full_name, h.minutes, h.status,
             a.title_ar AS activity, vp.full_name AS verified_by, h.verified_at::DATE AS verified_on
        FROM hour_entries h
        JOIN profiles p ON p.user_id = h.user_id
        LEFT JOIN activities a ON a.id = h.activity_id
        LEFT JOIN profiles vp ON vp.user_id = h.verified_by
       ORDER BY h.worked_on DESC, p.full_name
    `);
    return {
      headers: ['worked_on', 'volunteer', 'hours', 'status', 'activity', 'verified_by', 'verified_on'],
      rows: rows.map((r) => [
        r.worked_on, r.full_name, ((r.minutes as number) / 60).toFixed(2),
        r.status, r.activity, r.verified_by, r.verified_on,
      ]),
    };
  }

  const rows = await query<Record<string, unknown>>(`
    SELECT a.title_ar, a.title_en, a.area, a.location, a.starts_at::DATE AS starts_on,
           a.capacity,
           (SELECT count(*) FROM activity_registrations r
             WHERE r.activity_id = a.id AND r.cancelled_at IS NULL)::INTEGER AS registered,
           (SELECT count(*) FROM activity_attendance t
             WHERE t.activity_id = a.id AND t.attended)::INTEGER             AS attended
      FROM activities a
     WHERE NOT a.is_archived
     ORDER BY a.starts_at DESC NULLS LAST
  `);
  return {
    headers: ['title_ar', 'title_en', 'area', 'location', 'starts_on', 'capacity', 'registered', 'attended'],
    rows: rows.map((r) => [
      r.title_ar, r.title_en, r.area, r.location, r.starts_on, r.capacity, r.registered, r.attended,
    ]),
  };
}
