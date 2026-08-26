import 'server-only';
import { queryOne } from './db';
import type { SessionUser } from './auth';
import { portalSummary, type PortalSummary } from './portal';
import { programmeStanding, type ProgrammeStanding } from './programme/standing';
import { certificatesFor, type Certificate } from './certificates';
import { achievementsFor, type EarnedAchievement } from './achievements';
import { parseAwardBadgeCode } from './awards';
import { rolesFor, viewerOf, type VolunteerRole } from './volunteer-roles';
import { listFrom } from './account-state';

/**
 * Everything the volunteer passport shows, gathered once.
 *
 * The same job lib/portal.ts does for the dashboard, and written the same way:
 * one function, one Promise.all, and the page renders the answer rather than
 * assembling it.
 *
 * ── ALMOST NOTHING HERE IS A QUERY, AND THAT IS THE POINT ──────────────────
 *
 * The passport is a second view of figures that already have exactly one
 * source each. If it counted attendances for itself, the sheet a volunteer
 * attaches to a university application could disagree with the dashboard they
 * read it off — and they would be right to ask which of the two the
 * association stands behind. So the hours, the activities, the courses and the
 * certificate count come from `portalSummary`; the academy standing from
 * `programmeStanding`, which is what the path map reads; the certificates from
 * `certificatesFor`; the badges from `achievementsFor`; the roles from
 * `rolesFor`. Not one of those is re-implemented below.
 *
 * `portalSummary` also fetches an unread-notification count and a next
 * activity that this page has no use for. That waste is deliberate and cheap:
 * a passport-shaped copy of the four figures would be a second definition of
 * "activities attended", which is precisely the disagreement above.
 *
 * The ONE query is the profile row — name, membership number, join date,
 * skills — and it exists because those four facts have no reader anywhere
 * except inline in the pages that show them.
 *
 * ── THE VIEWER IS THE SESSION, AND IS NEVER WIDENED ────────────────────────
 *
 * `rolesFor(user.id, viewerOf(user))`, exactly as the dashboard and
 * /account/roles call it. A role an administrator marked staff-only does not
 * become readable by being about you — visibleTo()'s header in
 * lib/volunteer-role-view.ts argues why, and this module deliberately takes a
 * SessionUser rather than a user id so that there is nothing here to call with
 * a viewer of its own choosing.
 */

export type PassportRecord = {
  fullName: string;
  /** Null for somebody the association has not accepted as a volunteer yet. */
  memberNumber: number | null;
  /** The association's own join date where there is one; the account's otherwise. */
  joinedAt: Date | null;
  /** One free-text box, split. Self-declared — the sheet says so. */
  skills: string[];
  summary: PortalSummary;
  academy: ProgrammeStanding;
  /** Certificates that still stand. A withdrawn one is not a credential held. */
  certificates: Certificate[];
  /** How many were withdrawn, so the sheet can say so rather than hide it. */
  withdrawnCertificates: number;
  /** The catalogue badges: granted by the engine for what the ledgers show. */
  badges: EarnedAchievement[];
  /** The monthly awards: granted because a person decided. Kept apart. */
  recognition: EarnedAchievement[];
  /** Current first, then newest start — the order rolesFor already applied. */
  roles: VolunteerRole[];
};

export async function passportFor(user: SessionUser): Promise<PassportRecord> {
  const [profile, summary, academy, certificates, achievements, roles] = await Promise.all([
    queryOne<{
      full_name: string;
      member_number: number | null;
      skills: string | null;
      joined_at: Date | null;
    }>(
      /*
       * `joined_on` first, `created_at` only as a fallback — the identical
       * COALESCE the membership card and the badge engine use, and for the
       * identical reason. For the four hundred people recognised from the
       * roster the account is weeks old and the membership is years old, and a
       * document a volunteer attaches to a scholarship application must carry
       * the second. Getting this wrong on a passport erases exactly the
       * seniority the roster import existed to preserve.
       */
      `SELECT p.full_name, p.member_number, p.skills,
              COALESCE(r.joined_on::timestamptz, u.created_at) AS joined_at
         FROM profiles p
         JOIN users u ON u.id = p.user_id
         LEFT JOIN volunteer_roster r
                ON r.claimed_by = p.user_id AND r.approved_at IS NOT NULL
        WHERE p.user_id = $1`,
      [user.id],
    ),
    portalSummary(user.id),
    programmeStanding(user.id),
    certificatesFor(user.id),
    achievementsFor(user.id),
    rolesFor(user.id, viewerOf(user)),
  ]);

  /*
   * A monthly award is not a badge the engine granted.
   *
   * `award-volunteer-2026-08` and friends are deliberately absent from the
   * ACHIEVEMENTS catalogue — see the head of lib/awards.ts — because a
   * recompute must never withdraw a decision a person made. They arrive in the
   * same list as everything else, and this is the one place that separates
   * them, so the sheet can put «تكريم» under its own heading instead of
   * burying a committee's decision among thirty automatic marks.
   */
  const recognition = achievements.filter((a) => parseAwardBadgeCode(a.code) !== null);
  const badges = achievements.filter((a) => parseAwardBadgeCode(a.code) === null);

  return {
    fullName: profile?.full_name ?? user.fullName,
    memberNumber: profile?.member_number ?? null,
    joinedAt: profile?.joined_at ?? null,
    skills: listFrom(profile?.skills),
    summary,
    academy,
    /* Live ones only. A withdrawn certificate stays on /account/certificates
     * with the reason it was withdrawn — that page's argument for keeping it is
     * about the holder's own record, and it holds. This is a sheet the holder
     * hands to somebody else, and a credential the association has taken back
     * is not one they hold. The count is carried so the omission is stated on
     * the page rather than performed silently. */
    certificates: certificates.filter((c) => c.revoked_at === null),
    withdrawnCertificates: certificates.filter((c) => c.revoked_at !== null).length,
    badges,
    recognition,
    roles,
  };
}
