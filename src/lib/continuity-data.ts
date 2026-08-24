import 'server-only';
import { query } from './db';
import type { ContinuityRow } from './continuity';

/**
 * Who «صنّاع الاستمرارية» is about, read from the badge rather than re-derived.
 *
 * WHY THE BADGE AND NOT THE RULE. The condition — joined on or before
 * 31 December 2023 and still a volunteer — already exists, in one place, as
 * the `continuity` figure in lib/achievements.ts, and it is already granted to
 * twenty-five people. Writing the date test again here would create a second
 * definition of the same fact, and the two would drift the first time either
 * is corrected: a page thanking somebody whose badge the engine has revoked,
 * or a badge on a wall belonging to somebody the page will not name. Reading
 * `achievements` means the page and the badge cannot disagree, because there
 * is only one of them.
 *
 * The consequence to know about: the badge is refreshed by
 * `recomputeAchievements`, which runs when something about the person changes
 * rather than on a clock. Somebody who stops being a volunteer keeps the badge
 * until the next recompute for them. That is the same lag the badge wall on
 * their own account already has, and accepting it is better than this page
 * holding its own opinion about who counts.
 *
 * ONLY CLAIMED, APPROVED ROSTER LINES. The join starts at `users` and reaches
 * the roster through `claimed_by`, never the other way round. The roster
 * carries four hundred people imported from the association's own records, and
 * most of those lines belong to somebody who has never made an account, never
 * seen this platform and never agreed to anything on it. A page that read the
 * roster directly would publish them.
 *
 * THE TWO BIRTH DATES. Reaching for a date of birth needs justifying, and this
 * is the justification: lib/visibility.ts refuses to publish a minor's name or
 * photograph whatever they chose, and it cannot apply that rule without being
 * told. Both sources are read because neither is authoritative on its own —
 * see treatAsMinor. They are handed to that function and to nothing else:
 * ContinuityPerson has no field either could land in, so neither can reach the
 * browser however this page is later edited.
 *
 * NOTE ON BACKTICKS: there are none in the SQL below, and none may be added.
 * It is a template literal, so a backtick around an identifier in one of these
 * comments ends the string and the file stops parsing — which is exactly how
 * this build broke once.
 */
const SQL = `
  SELECT u.id::TEXT                                                       AS id,
         p.full_name,
         p.display_name,
         p.member_number,
         p.public_visibility,

         /*
          * The join date as TEXT, at 'YYYY-MM-DD', and the fallback converted
          * to Beirut before it is cut down to a date.
          *
          * Two separate traps, both of which change the YEAR this page prints.
          * The session runs in GMT, so casting created_at to a date on an
          * account made at 01:00 Beirut on 1 January reads as 31 December —
          * the volunteer is thanked for a year they had not started. And
          * handing a DATE back to the driver produces a JS Date at local
          * midnight, which the year is then read out of in whatever zone the
          * server happens to be in. Text never has either problem.
          *
          * joined_on first and created_at only as the fallback, exactly as the
          * membership card does it: for the people recognised from the roster
          * the account is weeks old and the membership is years old, and this
          * whole page is about the second one.
          */
         to_char(
           COALESCE(r.joined_on, (u.created_at AT TIME ZONE 'Asia/Beirut')::date),
           'YYYY-MM-DD'
         )                                                                AS joined_on,

         /* Text for the same reason, and it matters more here: isMinorOn
          * refuses anything that is not a plain YYYY-MM-DD rather than
          * trimming a timestamp, and a GMT timestamp's first ten characters
          * are the wrong day for anybody born after ten in the evening. */
         to_char(ps.date_of_birth, 'YYYY-MM-DD')                          AS sensitive_dob,
         to_char(sr.date_of_birth, 'YYYY-MM-DD')                          AS safeguarding_dob,

         st.title_ar                                                      AS stage_ar,
         st.title_en                                                      AS stage_en,
         st.stage                                                         AS stage_number,

         COALESCE((SELECT SUM(h.minutes) FROM hour_entries h
                    WHERE h.user_id = u.id AND h.status = 'verified'), 0)::INTEGER
                                                                          AS minutes,
         (SELECT count(*) FROM activity_attendance aa
           WHERE aa.user_id = u.id AND aa.attended)::INTEGER              AS activities,

         /* Certificates that still stand, not courses passed. Revoking one
          * leaves the passed attempt behind it, and «شهادات فعّالة» is a claim
          * about the credential rather than about the exam. */
         (SELECT count(*) FROM certificates c
           WHERE c.user_id = u.id AND c.kind = 'course' AND c.revoked_at IS NULL)::INTEGER
                                                                          AS certificates,

         (SELECT ph.version FROM profile_photos ph WHERE ph.user_id = u.id) AS photo_version,

         ARRAY(SELECT b.code FROM achievements b
                WHERE b.user_id = u.id AND b.revoked_at IS NULL
                ORDER BY b.earned_at DESC, b.id DESC)                     AS badges

    FROM achievements a
    JOIN users u    ON u.id = a.user_id
    JOIN profiles p ON p.user_id = u.id

    /* Read only by treatAsMinor, never carried any further. Both, because a
     * date is missing from one or the other for most of this platform. */
    LEFT JOIN profiles_sensitive   ps ON ps.user_id = u.id
    LEFT JOIN safeguarding_records sr ON sr.user_id = u.id

    /* The roster only through a line this account has claimed and staff have
     * approved. An unclaimed line is a person who has consented to nothing. */
    LEFT JOIN volunteer_roster r
           ON r.claimed_by = u.id AND r.approved_at IS NOT NULL

    /*
     * The stage they have reached, named.
     *
     * journey_stages holds one row per stage PER VERSION, and stage_progress
     * records only the number — so joining on the number alone can match a
     * stage six from a retired version of the journey and print its old
     * wording. The tie-break prefers the version this person is actually
     * assigned to; where they have no assignment it still returns a name
     * rather than nothing, which is what a plain equality join would do.
     */
    LEFT JOIN LATERAL (
      SELECT js.title_ar, js.title_en, sp.stage
        FROM stage_progress sp
        JOIN journey_stages js ON js.number = sp.stage
       WHERE sp.user_id = u.id
       ORDER BY sp.stage DESC,
                (js.version_id = (SELECT cja.version_id
                                    FROM current_journey_assignment cja
                                   WHERE cja.user_id = u.id)) DESC
       LIMIT 1
    ) st ON TRUE

   WHERE a.code = 'continuity-maker'
     AND a.revoked_at IS NULL
   ORDER BY u.id
`;

/**
 * Everybody holding the continuity badge, as rows.
 *
 * A row is not something to render. It becomes renderable only by going
 * through `buildRoll` in lib/continuity.ts, which asks lib/visibility.ts about
 * each person and then builds the public object from an allowlist.
 *
 * ORDER BY u.id, deliberately meaningless: the reading order is chosen on the
 * page by `sortRoll`, and a query that arrived pre-sorted by hours or by date
 * would make "whatever order the database gave us" a ranking nobody decided to
 * publish.
 */
export async function continuityRows(): Promise<ContinuityRow[]> {
  return query<ContinuityRow>(SQL);
}
