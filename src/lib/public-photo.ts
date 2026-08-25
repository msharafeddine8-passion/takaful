import 'server-only';
import { queryOne } from './db';
import { consentFor, type ConsentSubject } from './continuity';
import { beirutToday } from './when';

/**
 * A profile photograph that may be shown to anybody, or nothing at all.
 *
 * /api/photo/[userId] serves the same bytes to the holder and to staff who
 * manage members. It refuses everybody else, and it asks nothing about
 * consent, because it does not need to: its two audiences already have a
 * reason to see the picture. Neither property is any use to a public page,
 * which has no session to check and must not serve a photograph of somebody
 * who did not agree to one being published.
 *
 * So this is the other half: no session, and consent decided per request from
 * the database rather than trusted from the URL. The URL carries a user id and
 * a cache-busting version and nothing else — there is no signature to forge
 * and no flag to flip, because the answer is looked up every time.
 *
 * THE DECISION IS NOT MADE HERE. `consentFor` in lib/continuity.ts makes it,
 * which in turn asks lib/visibility.ts. That is deliberate rather than
 * convenient: the continuity page decides whether to render an <img> and this
 * module decides whether to answer it, and if those two ever disagreed the
 * result is a broken image on a page thanking somebody — which reads to that
 * volunteer as the association having lost their picture. Calling the same
 * function means they cannot disagree.
 *
 * Consequences worth knowing:
 *   - A minor's photograph is never served here, whatever they chose.
 *   - Somebody whose birth date the association does not hold is protected,
 *     so their photograph is not served either. See treatAsMinor.
 *   - Withdrawing consent takes effect on the next request. Nothing is
 *     precomputed and no token outlives the setting.
 */

/** What the route may send. Bytes only exist when consent said they may. */
export type PublicPhoto = { contentType: string; bytes: Buffer };

/*
 * NOTE ON BACKTICKS: there are none in the SQL below and none may be added.
 * It is a template literal, so a backtick around an identifier in one of these
 * comments ends the string and the file stops parsing.
 */
const SQL = `
  SELECT p.full_name,
         p.display_name,
         p.public_visibility,

         /* Text at 'YYYY-MM-DD', never a timestamp. isMinorOn refuses anything
          * else rather than trimming it, and a GMT timestamp's first ten
          * characters are the wrong day for anybody born late in the evening
          * Beirut time — which on one day a year turns a seventeen-year-old
          * into an adult in the check that exists to stop exactly that. */
         to_char(ps.date_of_birth, 'YYYY-MM-DD') AS sensitive_dob,
         to_char(sr.date_of_birth, 'YYYY-MM-DD') AS safeguarding_dob,
         to_char(r.date_of_birth,  'YYYY-MM-DD') AS roster_dob,

         ph.content_type,
         ph.bytes

    FROM users u
    JOIN profiles p        ON p.user_id = u.id
    /* Inner join: no photograph is the same answer as no consent, and the
     * route turns both into the same 404. */
    JOIN profile_photos ph ON ph.user_id = u.id

    LEFT JOIN profiles_sensitive   ps ON ps.user_id = u.id
    LEFT JOIN safeguarding_records sr ON sr.user_id = u.id
    /* The roster only through a line this account has claimed and staff have
     * approved. An unclaimed line belongs to somebody who has consented to
     * nothing on this platform. */
    LEFT JOIN volunteer_roster     r  ON r.claimed_by = u.id AND r.approved_at IS NOT NULL

   WHERE u.id = $1::uuid
     /* A closed account is not a public page. */
     AND u.status <> 'deactivated'
`;

type Row = ConsentSubject & { content_type: string; bytes: Buffer };

/**
 * The photograph this person has agreed to have published, or null.
 *
 * Null for every refusal without distinction — opted out, a minor, an age the
 * association does not know, no photograph on file, no such account. The
 * caller turns all of them into the same 404, so the response cannot be read
 * as an answer to "does this person exist" or "is this person a child".
 */
export async function publicPhoto(userId: string): Promise<PublicPhoto | null> {
  const row = await queryOne<Row>(SQL, [userId]);
  if (!row) return null;

  /* One clock reading, from Beirut. Whether somebody is still seventeen is
   * decided by the calendar the association lives in, and the server runs in
   * GMT — which between midnight and two in the morning is still yesterday. */
  if (!consentFor(row, beirutToday()).photo) return null;

  return { contentType: row.content_type, bytes: row.bytes };
}
