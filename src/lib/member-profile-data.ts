import 'server-only';
import { query, queryOne } from './db';
import { beirutToday } from './when';
import {
  memberFile,
  type BadgeMark,
  type CertificateMark,
  type CourseMark,
  type MemberFile,
  type RawAudit,
  type RawRoster,
  type SafeguardingRow,
  type StageMark,
} from './member-profile';

/**
 * Reading one person's whole record, for the staff file.
 *
 * Every query here is a SELECT, and that is a rule rather than an accident:
 * the file is a place to read from, and the six pages that own these rows keep
 * the buttons. A page that both showed everything and changed anything would
 * be the page where somebody suspends an account while trying to find out why
 * it is quiet.
 *
 * Nothing sensitive leaves this module. `memberFile` is applied here, in the
 * one function anybody calls, so what crosses into the page cannot carry a
 * birth date or a guardian's telephone number even if a later query starts
 * selecting them.
 */

type PersonRow = {
  full_name: string;
  display_name: string | null;
  email: string;
  status: string;
  created_on: string | null;
  last_seen_at: string | null;
  membership_status: string | null;
  is_volunteer: boolean;
  sensitive_dob: string | null;
  visibility: string | null;
  visibility_chosen_at: string | null;
  points: string;
};

export type MemberIdentity = {
  fullName: string;
  displayName: string | null;
  email: string;
};

export type MemberDossier = {
  identity: MemberIdentity;
  file: MemberFile;
};

/** Null when there is no such account, so the page can answer notFound(). */
export async function memberDossier(userId: string, auditLimit = 60): Promise<MemberDossier | null> {
  const person = await queryOne<PersonRow>(
    /* to_char rather than the bare date on everything that is a calendar day.
     * The session runs GMT and the association is in Beirut, so a date handed
     * back as a timestamp arrives two hours early and renders as the day
     * before — and lib/member-profile refuses anything that is not a plain
     * YYYY-MM-DD rather than trimming it to look like one. */
    `SELECT p.full_name,
            p.display_name,
            u.email,
            u.status,
            to_char(u.created_at AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD') AS created_on,
            u.last_login_at::TEXT                                          AS last_seen_at,
            (SELECT h.new_status FROM membership_status_history h
              WHERE h.user_id = u.id
              ORDER BY h.changed_at DESC, h.id DESC LIMIT 1)               AS membership_status,
            is_volunteer(u.id)                                             AS is_volunteer,
            /* Read to decide whether this person is a child, and discarded by
             * memberFile before the page sees anything. */
            (SELECT to_char(s.date_of_birth, 'YYYY-MM-DD') FROM profiles_sensitive s
              WHERE s.user_id = u.id)                                      AS sensitive_dob,
            p.public_visibility                                            AS visibility,
            p.visibility_chosen_at::TEXT                                   AS visibility_chosen_at,
            COALESCE((SELECT t.points FROM impact_totals t WHERE t.user_id = u.id), 0)::TEXT AS points
       FROM users u
       JOIN profiles p ON p.user_id = u.id
      WHERE u.id = $1`,
    [userId],
  );
  if (!person) return null;

  const [roles, roster, safeguarding, hours, activities, courses, certificates, badges, stages, audit] =
    await Promise.all([
      rolesOf(userId),
      rosterOf(userId),
      safeguardingOf(userId),
      hoursOf(userId),
      activitiesOf(userId),
      coursesOf(userId),
      certificatesOf(userId),
      badgesOf(userId),
      stagesOf(userId),
      auditOf(userId, auditLimit),
    ]);

  return {
    identity: {
      fullName: person.full_name,
      displayName: person.display_name,
      email: person.email,
    },
    file: memberFile({
      today: beirutToday(),
      account: {
        status: person.status,
        membershipStatus: person.membership_status,
        createdOn: person.created_on,
        lastSeenAt: person.last_seen_at,
      },
      roles,
      isVolunteer: person.is_volunteer === true,
      roster,
      sensitiveDob: person.sensitive_dob,
      safeguarding,
      visibility: { stored: person.visibility, chosenAt: person.visibility_chosen_at },
      hours,
      activities,
      courses,
      certificates,
      badges,
      points: Number.parseInt(person.points, 10),
      stages,
      audit,
    }),
  };
}

async function rolesOf(userId: string): Promise<string[]> {
  const rows = await query<{ role: string }>(
    `SELECT role FROM user_roles
      WHERE user_id = $1 AND (valid_until IS NULL OR valid_until > now())
      ORDER BY role`,
    [userId],
  );
  return rows.map((r) => r.role);
}

/**
 * The roster line, and the trail of what was decided about it.
 *
 * The strength of the match is not a column — it was true at the moment of the
 * claim and is written into the audit line for that claim. Reading it back
 * from there is how the file can say «طوبق على الهاتف والاسم» a year later
 * instead of only «مرتبط».
 */
async function rosterOf(userId: string): Promise<RawRoster | null> {
  const row = await queryOne<RawRoster & { id: string }>(
    `SELECT r.id::TEXT,
            r.member_number,
            r.committee,
            to_char(r.joined_on, 'YYYY-MM-DD')    AS joined_on,
            to_char(r.claimed_at AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')  AS claimed_on,
            to_char(r.approved_at AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD') AS approved_on,
            to_char(r.date_of_birth, 'YYYY-MM-DD') AS date_of_birth
       FROM volunteer_roster r
      WHERE r.claimed_by = $1
      LIMIT 1`,
    [userId],
  );
  if (!row) return null;

  const trail = await query<{ action: string; strength: string | null }>(
    /* The roster id is cast to text rather than target_id to uuid. target_id
     * is TEXT and does not always hold one, and a planner is free to evaluate
     * a cast before the filter that was supposed to protect it. */
    `SELECT a.action, a.new_value ->> 'strength' AS strength
       FROM audit_logs a
      WHERE a.target_type = 'volunteer_roster' AND a.target_id = $1
      ORDER BY a.created_at ASC, a.id ASC`,
    [row.id],
  );

  return {
    ...row,
    actions: trail.map((t) => t.action),
    strength: trail.find((t) => t.strength)?.strength ?? null,
  };
}

/**
 * Presence, and nothing else.
 *
 * The emergency contact, the guardian and the medical note are not selected at
 * all — not read, not held in memory, not passed on. The birth date is, and
 * only because whether this person is a child is a fact the file has to state;
 * memberFile turns it into one of three words and drops the date.
 */
async function safeguardingOf(userId: string): Promise<SafeguardingRow | null> {
  return queryOne<SafeguardingRow>(
    `SELECT to_char(s.date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
            s.guardian_consent_at::TEXT            AS guardian_consent_at,
            s.code_of_conduct_at::TEXT             AS code_of_conduct_at,
            s.safeguarding_at::TEXT                AS safeguarding_at,
            s.data_consent_at::TEXT                AS data_consent_at,
            (nullif(btrim(coalesce(s.medical_notes, '')), '') IS NOT NULL) AS medical_note_on_file
       FROM safeguarding_records s
      WHERE s.user_id = $1`,
    [userId],
  );
}

async function hoursOf(userId: string): Promise<{
  verifiedMinutes: number; pendingMinutes: number; carriedMinutes: number;
}> {
  const row = await queryOne<{ verified: string; pending: string; carried: string }>(
    /* One statement over one index rather than three round trips, and summed in
     * SQL: a page that fetches rows and adds them up in JavaScript is quietly
     * wrong the day somebody has more rows than the limit. */
    `SELECT COALESCE(SUM(minutes) FILTER (WHERE status = 'verified'), 0)::TEXT AS verified,
            COALESCE(SUM(minutes) FILTER (WHERE status = 'pending'), 0)::TEXT  AS pending,
            COALESCE(SUM(minutes) FILTER (WHERE status = 'verified' AND carried_over), 0)::TEXT
                                                                               AS carried
       FROM hour_entries WHERE user_id = $1`,
    [userId],
  );
  return {
    verifiedMinutes: Number.parseInt(row?.verified ?? '0', 10),
    pendingMinutes: Number.parseInt(row?.pending ?? '0', 10),
    carriedMinutes: Number.parseInt(row?.carried ?? '0', 10),
  };
}

/**
 * Signed up against turned up.
 *
 * Registrations the volunteer cancelled are excluded, and so are activities
 * the association itself called off. Neither is a failure to attend, and a
 * figure that counted them would show a coordinator a volunteer who looks
 * unreliable because the association cancelled twice in March.
 */
async function activitiesOf(userId: string): Promise<{ registered: number; attended: number }> {
  const row = await queryOne<{ registered: string; attended: string }>(
    `SELECT (SELECT count(*) FROM activity_registrations g
              JOIN activities act ON act.id = g.activity_id
             WHERE g.user_id = $1
               AND g.status <> 'cancelled'
               AND act.cancelled_at IS NULL)::TEXT AS registered,
            (SELECT count(*) FROM activity_attendance t
             WHERE t.user_id = $1 AND t.attended)::TEXT AS attended`,
    [userId],
  );
  return {
    registered: Number.parseInt(row?.registered ?? '0', 10),
    attended: Number.parseInt(row?.attended ?? '0', 10),
  };
}

/**
 * Courses, split by whether they are finished.
 *
 * Read from course_attempts through the course_progress view, which is what
 * every other count in the product reads — a page that counted something else
 * would disagree with the badge engine about how many courses somebody passed,
 * and the volunteer would be right to ask which of the two was lying.
 */
async function coursesOf(userId: string): Promise<{
  passed: CourseMark[]; inProgress: CourseMark[];
}> {
  const rows = await query<{
    course_slug: string; passed: boolean; passed_on: string | null; attempts: number;
  }>(
    `SELECT course_slug, passed, attempts,
            to_char(completed_at AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD') AS passed_on
       FROM course_progress
      WHERE user_id = $1
      ORDER BY passed DESC, course_slug`,
    [userId],
  );
  const mark = (r: (typeof rows)[number]): CourseMark => ({
    slug: r.course_slug,
    passedOn: r.passed_on,
    attempts: r.attempts,
  });
  return {
    passed: rows.filter((r) => r.passed).map(mark),
    inProgress: rows.filter((r) => !r.passed).map(mark),
  };
}

async function certificatesOf(userId: string): Promise<CertificateMark[]> {
  const rows = await query<{
    code: string; snapshot: { titleAr?: string; titleEn?: string };
    issued_on: string | null; revoked_on: string | null; revoke_reason: string | null;
  }>(
    `SELECT code, snapshot,
            to_char(issued_at AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')  AS issued_on,
            to_char(revoked_at AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD') AS revoked_on,
            revoke_reason
       FROM certificates
      WHERE user_id = $1
      ORDER BY issued_at DESC`,
    [userId],
  );
  return rows.map((r) => ({
    code: r.code,
    titleAr: r.snapshot?.titleAr ?? '',
    titleEn: r.snapshot?.titleEn ?? '',
    issuedOn: r.issued_on,
    revokedOn: r.revoked_on,
    revokeReason: r.revoke_reason,
  }));
}

/** Held and withdrawn together: a badge that vanished silently is the fault. */
async function badgesOf(userId: string): Promise<BadgeMark[]> {
  const rows = await query<{
    code: string; earned_on: string | null; withdrawn_on: string | null;
    revoke_reason: string | null; automatic: boolean;
  }>(
    `SELECT code, automatic, revoke_reason,
            to_char(earned_at AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')  AS earned_on,
            to_char(revoked_at AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD') AS withdrawn_on
       FROM achievements
      WHERE user_id = $1
      ORDER BY earned_at DESC, id DESC`,
    [userId],
  );
  return rows.map((r) => ({
    code: r.code,
    earnedOn: r.earned_on,
    withdrawnOn: r.withdrawn_on,
    withdrawReason: r.revoke_reason,
    byHand: r.automatic === false,
  }));
}

async function stagesOf(userId: string): Promise<StageMark[]> {
  const rows = await query<{ stage: number; reached_on: string | null }>(
    `SELECT stage, to_char(reached_at AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD') AS reached_on
       FROM stage_progress WHERE user_id = $1 ORDER BY stage`,
    [userId],
  );
  return rows.map((r) => ({ stage: r.stage, reachedOn: r.reached_on }));
}

/**
 * What staff have done to this person, in one list.
 *
 * Four target types rather than one, because audit_logs records what was
 * changed rather than who it was about: verifying an hour entry targets the
 * entry, issuing a certificate targets its code, and recognising a roster
 * claim targets the roster line. Filtering on target_type = 'user' alone gives
 * a trail with the roles and the suspensions in it and none of the hours,
 * which reads as though nobody has touched the account in months.
 *
 * The user's own ids are cast to text, never target_id to uuid. target_id is
 * TEXT and holds the literal 'all' on a recompute-everybody line; casting that
 * to uuid raises, and the target_type filter is no protection because a
 * planner may evaluate the cast first.
 */
async function auditOf(userId: string, limit: number): Promise<RawAudit[]> {
  return query<RawAudit>(
    `SELECT a.created_at::TEXT AS at,
            a.action,
            a.actor_id::TEXT   AS actor_id,
            actor.full_name    AS actor_name,
            a.reason
       FROM audit_logs a
       LEFT JOIN profiles actor ON actor.user_id = a.actor_id
      WHERE (a.target_type = 'user' AND a.target_id = $1)
         OR (a.target_type = 'volunteer_roster' AND EXISTS (
               SELECT 1 FROM volunteer_roster r
                WHERE r.claimed_by = $1::uuid AND r.id::TEXT = a.target_id))
         OR (a.target_type = 'certificate' AND EXISTS (
               SELECT 1 FROM certificates c
                WHERE c.user_id = $1::uuid AND c.code = a.target_id))
         OR (a.target_type = 'hour_entry' AND EXISTS (
               SELECT 1 FROM hour_entries h
                WHERE h.user_id = $1::uuid AND h.id::TEXT = a.target_id))
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT $2`,
    [userId, limit],
  );
}
