import 'server-only';
import { query } from './db';
import { foldName } from './roster-match';
import type { MembershipStatus } from './auth';

/**
 * Records the platform holds that do not add up.
 *
 * ── WHY THIS EXISTS ────────────────────────────────────────────────────────
 *
 * The association's director had to say, out loud and from memory, that five
 * people "had not been added as volunteers". Looking each of them up found five
 * DIFFERENT situations: one with an unclaimed line on the roster, one already
 * accepted, one an ordinary account with no application at all, two with no
 * account. Every one of those facts was already in this database. Not one of
 * them was on any screen. A person noticed what the platform could have said
 * first, and that is the defect this module answers.
 *
 * ── WHAT A FINDING IS, AND WHAT IT IS NOT ─────────────────────────────────
 *
 * A finding is a RECORD THAT IS INCOMPLETE OR CONTRADICTS ITSELF. It is never
 * a judgement about the person named on it: every one of these states was
 * produced by the platform doing half a job — a role granted without the
 * standing that goes with it, a roster line nobody was ever shown, hours
 * accepted from somebody nobody was ever asked to decide about. The wording on
 * the screen says so, and the shape here is meant to keep it true: there is no
 * severity, no score, no ordering of one person against another, and no total
 * per person. Findings are grouped by CHECK, and the same name legitimately
 * appears under two checks when two different facts are missing about them.
 *
 * ── READ-ONLY, AND THE FIX IS ALWAYS SOMEWHERE ELSE ───────────────────────
 *
 * Nothing in this file writes and nothing built on it may. Each check names the
 * screen that fixes it — /staff/roster for all three today — because those
 * screens are the guarded paths: they take a reason, they record who decided,
 * and they set the status and the role TOGETHER, which is the exact thing whose
 * absence produces finding (a) in the first place. A button here that "just
 * fixed it" would be a fourth way to change somebody's standing with nobody's
 * name on it.
 *
 * ── ADDING A FOURTH CHECK ─────────────────────────────────────────────────
 *
 * One function that returns rows, one member added to the AttentionFinding
 * union, one entry in CHECKS, one entry in the dictionary's `checks` record,
 * and one case in describeFinding() in lib/needs-attention-view.ts. Nothing
 * else moves: the panel iterates CHECK_ORDER and renders whatever comes back.
 */

// --------------------------------------------------------------- the checks

/**
 * The checks that exist, and the order the panel shows them in.
 *
 * An order of KINDS OF DEFECT, decided here once, and not a ranking of
 * anything: the contradiction that makes somebody unable to register comes
 * before the suggestion that needs a person to weigh it.
 */
export type AttentionCheck =
  | 'volunteer_role_without_standing'
  | 'account_matches_unclaimed_line'
  | 'taking_part_undecided';

export const CHECK_ORDER: readonly AttentionCheck[] = [
  'volunteer_role_without_standing',
  'account_matches_unclaimed_line',
  'taking_part_undecided',
];

/** Who the record is about. Enough to name them and open their page. */
type Subject = {
  userId: string;
  fullName: string;
  email: string;
};

/**
 * One record that does not add up.
 *
 * A discriminated union rather than a bag of optional fields, so that a check
 * cannot be rendered with another check's facts and a fourth check cannot be
 * added without the view being made to handle it.
 */
export type AttentionFinding =
  | (Subject & {
      check: 'volunteer_role_without_standing';
      /** The latest recorded status, or null when nothing was ever recorded. */
      membershipStatus: MembershipStatus | null;
    })
  | (Subject & {
      check: 'account_matches_unclaimed_line';
      /** The association's own number for that line, e.g. 375. Never re-issued. */
      memberNumber: number;
      /** The name as the roster writes it, which is rarely spelled identically. */
      rosterName: string;
      /** 'YYYY-MM-DD' as text, or null. Never a Date — the session runs GMT. */
      rosterJoinedOn: string | null;
    })
  | (Subject & {
      check: 'taking_part_undecided';
      membershipStatus: MembershipStatus | null;
      verifiedMinutes: number;
      attendedCount: number;
      coursesPassed: number;
    });

// ------------------------------------------------------------------- (a)

/**
 * The volunteer role granted without the volunteer standing.
 *
 * lib/actions/members.ts documents this failure in the past tense — "granting
 * 'volunteer' wrote the row and moved nothing else, so the member came out
 * looking approved and still unable to register for anything. It happened to a
 * real person." It refuses that grant now, and yet the state is still in the
 * database, because the refusal cannot reach backwards and because the two
 * facts can be separated by other means: a role granted before the guard, or a
 * status moved afterwards while the role row stayed valid.
 *
 * The person is left in the worst possible shape. Every list that reads
 * `user_roles` shows them as a volunteer, so nobody thinks to look; every gate
 * that reads is_volunteer() — which is the membership history and only that —
 * turns them away. They cannot register for a single activity and the screen
 * that would explain why says they are approved.
 *
 * NOT is_volunteer() rather than a list of statuses written out here, so this
 * asks the database the same question migration 006 answers for the gates. A
 * second spelling of "counts as a volunteer" is a second thing to keep in step,
 * and the day the two disagree this check reports the wrong people.
 */
async function volunteerRoleWithoutStanding(): Promise<AttentionFinding[]> {
  const rows = await query<{
    user_id: string;
    full_name: string;
    email: string;
    membership_status: MembershipStatus | null;
  }>(
    `SELECT u.id::TEXT AS user_id, p.full_name, u.email,
            (SELECT h.new_status FROM membership_status_history h
              WHERE h.user_id = u.id ORDER BY h.changed_at DESC, h.id DESC LIMIT 1)
              AS membership_status
       FROM users u
       JOIN profiles p ON p.user_id = u.id
      WHERE EXISTS (SELECT 1 FROM user_roles r
                     WHERE r.user_id = u.id AND r.role = 'volunteer'
                       AND (r.valid_until IS NULL OR r.valid_until > now()))
        AND NOT is_volunteer(u.id)
      ORDER BY p.full_name`,
  );

  return rows.map((r) => ({
    check: 'volunteer_role_without_standing' as const,
    userId: r.user_id,
    fullName: r.full_name,
    email: r.email,
    membershipStatus: r.membership_status,
  }));
}

// ------------------------------------------------------------------- (b)

/**
 * An account whose name matches a roster line nobody has claimed.
 *
 * A SUGGESTION FOR A PERSON TO WEIGH, AND NEVER A LINK. This module reads; the
 * pairing is shown so somebody who knows the person can go and decide. The
 * reason is not caution for its own sake: a name plus a number was, until this
 * morning, enough to claim any of four hundred and twenty-six volunteer
 * identities in this same table, and the hole was closed precisely because a
 * name is not proof of who somebody is. Two people called محمد علي are two
 * people.
 *
 * Why it matters that anybody sees it at all: acceptAsVolunteerAction in
 * lib/actions/roster.ts already REFUSES when this is true, and says which line
 * it found. But a refusal is only seen by whoever happened to press the button.
 * Nobody presses a button for a person they have not thought of, which is
 * exactly the case the director had to raise from memory. The refusal protects
 * the seniority; this makes the pairing visible before anyone is standing at
 * the wrong screen.
 *
 * ── THE COMPARISON ────────────────────────────────────────────────────────
 *
 * foldName, in application code, on both sides — not ILIKE, and not a folding
 * rewritten in SQL. Arabic spelling drifts between people and across years
 * (أ/ا, ة/ه, ى/ي, diacritics, doubled spaces) and matching the association's
 * two spreadsheets on raw names found 38 people in common where folding found
 * 178. `volunteer_roster.name_folded` holds the same folding, written at import
 * and indexed for lookups; folding both sides here with the one exported
 * function is what guarantees the two sides of THIS comparison were folded by
 * the same rule, whatever any importer once wrote.
 *
 * Exact equality of the folded names, which is stricter than namesAgree() —
 * that rule accepts two shared words, and against 426 unclaimed lines two
 * shared words produces a page of coincidences (seven pairs today, one of them
 * real). A panel that cries wolf is a panel somebody stops reading. The looser
 * rule stays where it belongs: on the refusal, where being over-cautious costs
 * one conversation instead of somebody's membership number.
 *
 * Candidates are accounts with no number of their own and no line already
 * claimed. Anyone else has been decided about already.
 */
async function accountMatchesUnclaimedLine(): Promise<AttentionFinding[]> {
  const [accounts, lines] = await Promise.all([
    query<{ user_id: string; full_name: string; email: string }>(
      `SELECT u.id::TEXT AS user_id, p.full_name, u.email
         FROM users u
         JOIN profiles p ON p.user_id = u.id
        WHERE p.member_number IS NULL
          AND NOT EXISTS (SELECT 1 FROM volunteer_roster r WHERE r.claimed_by = u.id)
        ORDER BY p.full_name`,
    ),
    /* to_char, not the bare DATE. The session runs GMT and the association is
     * in Beirut, so a date handed back as a timestamp arrives two hours early
     * and renders as the day before. The same refusal as lib/admin.ts. */
    query<{ member_number: number; full_name: string; joined_on: string | null }>(
      `SELECT member_number, full_name, to_char(joined_on, 'YYYY-MM-DD') AS joined_on
         FROM volunteer_roster
        WHERE claimed_by IS NULL AND full_name IS NOT NULL`,
    ),
  ]);

  /* Keyed once rather than compared pairwise: 426 lines against every account
   * is a nested loop that grows with the association, and this is a page. */
  const byFoldedName = new Map<string, typeof lines>();
  for (const line of lines) {
    const key = foldName(line.full_name);
    if (!key) continue;
    const bucket = byFoldedName.get(key);
    if (bucket) bucket.push(line);
    else byFoldedName.set(key, [line]);
  }

  const findings: AttentionFinding[] = [];
  for (const account of accounts) {
    const key = foldName(account.full_name);
    if (!key) continue;
    /* One account can fold onto two roster lines — the roster genuinely holds
     * repeated names. Both are shown: choosing between them is the decision
     * this panel exists to hand to a person, not one to make silently here. */
    for (const line of byFoldedName.get(key) ?? []) {
      findings.push({
        check: 'account_matches_unclaimed_line',
        userId: account.user_id,
        fullName: account.full_name,
        email: account.email,
        memberNumber: line.member_number,
        rosterName: line.full_name,
        rosterJoinedOn: line.joined_on,
      });
    }
  }
  return findings;
}

// ------------------------------------------------------------------- (c)

/**
 * Somebody taking part while no decision about them was ever recorded.
 *
 * Hours verified by a member of staff, attendance confirmed by a member of
 * staff, or a course passed — every one of those is the association already
 * treating this person as one of its own. And there is no volunteer
 * application anywhere and no volunteer standing, which means nobody was ever
 * put in front of the question. It is not that the answer was no; the question
 * was never asked, and the record has no decision in it to point at.
 *
 * The three signals are OR'd and all three are reported, so the row can say
 * which of them is true rather than asserting a general "is active".
 *
 * `NOT EXISTS (… volunteer_applications …)` counts a draft as an application:
 * a person who has started one is already on their way through the front door
 * and does not need a member of staff summoned to them.
 */
async function takingPartUndecided(): Promise<AttentionFinding[]> {
  const rows = await query<{
    user_id: string;
    full_name: string;
    email: string;
    membership_status: MembershipStatus | null;
    verified_minutes: string;
    attended: string;
    passed: string;
  }>(
    `SELECT u.id::TEXT AS user_id, p.full_name, u.email,
            (SELECT h.new_status FROM membership_status_history h
              WHERE h.user_id = u.id ORDER BY h.changed_at DESC, h.id DESC LIMIT 1)
              AS membership_status,
            COALESCE((SELECT SUM(e.minutes) FROM hour_entries e
                       WHERE e.user_id = u.id AND e.status = 'verified'), 0)::TEXT
              AS verified_minutes,
            (SELECT count(*) FROM activity_attendance t
              WHERE t.user_id = u.id AND t.attended)::TEXT AS attended,
            (SELECT count(*) FROM course_progress c
              WHERE c.user_id = u.id AND c.passed)::TEXT AS passed
       FROM users u
       JOIN profiles p ON p.user_id = u.id
      WHERE NOT is_volunteer(u.id)
        AND NOT EXISTS (SELECT 1 FROM volunteer_applications a WHERE a.user_id = u.id)
        /*
         * VOLUNTEERING, not learning. A passed course does NOT put a record here.
         *
         * It was a third signal, and it made this check fire on exactly one
         * account: somebody who came through the «أريد الدورات فقط» door on
         * /join, passed a course, and has no application because they never
         * wanted one. That is the learner path working exactly as built — so
         * the panel would have opened on a healthy record, presented as
         * something to look at.
         *
         * The same mistake was made and corrected elsewhere in this codebase on
         * the same day: an alarm reading «هذا لا ينبغي أن يحدث» was measured
         * against the wrong constant and fired on 38 of the 40 profiles that
         * exist. An alarm true of almost everybody is an alarm about nothing,
         * and it buries the case it was built for.
         *
         * What remains are the two signals a learner cannot reach: hours a
         * member of staff verified, and attendance a member of staff confirmed.
         * Either means somebody did volunteer work and no decision about them
         * was ever recorded. The passed-course count is still selected and
         * still shown — useful context once a record is on the list, but not
         * what puts it there.
         */
        AND (
             EXISTS (SELECT 1 FROM hour_entries e
                      WHERE e.user_id = u.id AND e.status = 'verified')
          OR EXISTS (SELECT 1 FROM activity_attendance t
                      WHERE t.user_id = u.id AND t.attended)
        )
      ORDER BY p.full_name`,
  );

  const n = (v: string) => Number.parseInt(v, 10) || 0;
  return rows.map((r) => ({
    check: 'taking_part_undecided' as const,
    userId: r.user_id,
    fullName: r.full_name,
    email: r.email,
    membershipStatus: r.membership_status,
    verifiedMinutes: n(r.verified_minutes),
    attendedCount: n(r.attended),
    coursesPassed: n(r.passed),
  }));
}

// -------------------------------------------------------------- the panel

const CHECKS: Record<AttentionCheck, () => Promise<AttentionFinding[]>> = {
  volunteer_role_without_standing: volunteerRoleWithoutStanding,
  account_matches_unclaimed_line: accountMatchesUnclaimedLine,
  taking_part_undecided: takingPartUndecided,
};

/** Findings under one check, kept together so the panel can explain each once. */
export type AttentionGroup = {
  check: AttentionCheck;
  findings: AttentionFinding[];
};

/**
 * Every check, run together, grouped by check and in CHECK_ORDER.
 *
 * Grouped and never flattened into one ranked list: the sentence that says what
 * is missing belongs to the CHECK, is written once above its rows, and cannot
 * be written once above a mixed list. Empty groups come back too, so the panel
 * can say that a check found nothing — which is information, and is the state
 * somebody wants to see after acting on one.
 */
export async function needsAttention(): Promise<AttentionGroup[]> {
  const groups = await Promise.all(
    CHECK_ORDER.map(async (check) => ({ check, findings: await CHECKS[check]() })),
  );
  return groups;
}
