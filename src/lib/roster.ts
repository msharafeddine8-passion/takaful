import { query, queryOne } from '@/lib/db';
import { namesAgree, datesAgree, phoneTail, type MatchStrength } from '@/lib/roster-match';

/**
 * Recognising people the association already knows.
 *
 * Until now the only door was the application form, which asks a volunteer of
 * six years why they would like to volunteer and then puts them in a review
 * queue. This looks them up in the association's own roster instead, so the
 * question becomes "is this you?" rather than "should we take you?".
 *
 * Finding a match still grants nothing — that decision lives in
 * lib/actions/roster.ts, which recognises the two strengths that rest on two
 * independent facts and sends the rest to a member of staff. The comparison
 * rules themselves are in roster-match.ts, kept free of the database so they
 * can be tested without one.
 */

export { formatMemberNumber, foldName, phoneTail, normaliseStoredTail, namesAgree, datesAgree } from '@/lib/roster-match';
export type { MatchStrength } from '@/lib/roster-match';

export type RosterEntry = {
  id: string;
  member_number: number;
  full_name: string;
  joined_on: string | null;
  date_of_birth: string | null;
  committee: string | null;
  claimed_by: string | null;
  approved_at: string | null;
};

export type RosterMatch = {
  entry: RosterEntry;
  strength: MatchStrength;
};

const COLUMNS = `id, member_number, full_name, joined_on,
                 to_char(date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
                 committee, claimed_by, approved_at`;

/**
 * Finds the roster line a signed-in person is claiming.
 *
 * The phone or the membership number identifies the line; a second fact then
 * corroborates that the person holding it is the person on it. Either the
 * account's own name agrees, or the date of birth they gave does.
 *
 * The date of birth was added because the name could not do the job alone.
 * The roster is written in Arabic and most people register in Latin script,
 * so name agreement fails for the majority of real members — thirteen of the
 * association's twenty-one accounts agree with no roster line anywhere. A
 * birthday is the same fact in both alphabets, and it still distinguishes a
 * claimant from whoever else in the household answers that phone, which is
 * the case the corroboration exists for.
 *
 * A line that is found but not corroborated is still a match. It comes back
 * as `phone-only` or `number-only`, which grants nothing and goes to a member
 * of staff — but it is written down, which is the part that was missing.
 */
export async function findRosterMatch(opts: {
  phone?: string | null;
  memberNumber?: number | null;
  accountName: string;
  /** As typed into a date input: YYYY-MM-DD, or empty. */
  dateOfBirth?: string | null;
}): Promise<RosterMatch | null> {
  const tail = phoneTail(opts.phone ?? '');
  const dob = (opts.dateOfBirth ?? '').trim();

  /*
   * Which second fact backs this line up, if either does.
   *
   * The date is tried first: it works when the name is in another alphabet,
   * and it is the fact the claimant has just typed rather than one carried
   * over from whatever they wrote at registration.
   */
  const corroboration = (entry: RosterEntry): 'dob' | 'name' | null => {
    if (dob && datesAgree(entry.date_of_birth, dob)) return 'dob';
    if (namesAgree(entry.full_name, opts.accountName)) return 'name';
    return null;
  };

  if (tail) {
    /* The stored key is normalised in the comparison rather than in the table
     * — see normaliseStoredTail. It costs a sequential scan of four hundred
     * rows, which is nothing, and it means a locally-imported 03 number is
     * found whether the volunteer types it as 03 998 877 or +961 3 998 877. */
    const row = await queryOne<RosterEntry>(
      `SELECT ${COLUMNS} FROM volunteer_roster
        WHERE regexp_replace(phone_tail, '^0', '') = $1 LIMIT 1`,
      [tail],
    );
    if (row) {
      const how = corroboration(row);
      return {
        entry: row,
        strength:
          how === 'dob' ? 'phone-and-dob' : how === 'name' ? 'phone-and-name' : 'phone-only',
      };
    }
  }

  if (opts.memberNumber && Number.isInteger(opts.memberNumber)) {
    const row = await queryOne<RosterEntry>(
      `SELECT ${COLUMNS} FROM volunteer_roster WHERE member_number = $1 LIMIT 1`,
      [opts.memberNumber],
    );
    if (row) {
      /*
       * A number alone still proves nothing — numbers are sequential and so
       * guessable — but it no longer means "no such person". This returned
       * null when the name disagreed, and told a real member holding their
       * own card that the association had no record of them. Nothing was
       * recorded, so there was no claim for staff to see and no way for the
       * volunteer to get any further. Now it is a claim that a person decides.
       */
      const how = corroboration(row);
      return {
        entry: row,
        strength:
          how === 'dob' ? 'number-and-dob' : how === 'name' ? 'number-and-name' : 'number-only',
      };
    }
  }

  return null;
}

/** The roster line this account has claimed, whatever its state. */
export async function claimForUser(userId: string): Promise<RosterEntry | null> {
  return queryOne<RosterEntry>(
    `SELECT ${COLUMNS} FROM volunteer_roster WHERE claimed_by = $1 LIMIT 1`,
    [userId],
  );
}

export type PendingClaim = RosterEntry & {
  claimed_at: string;
  account_name: string;
  account_email: string;
  user_id: string;
  name_agrees: boolean;
};

/** The staff queue: claimed, not yet decided, oldest first. */
export async function pendingClaims(): Promise<PendingClaim[]> {
  const rows = await query<Omit<PendingClaim, 'name_agrees'>>(
    `SELECT r.id, r.member_number, r.full_name, r.joined_on,
            to_char(r.date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
            r.committee, r.claimed_by, r.approved_at,
            to_char(r.claimed_at, 'YYYY-MM-DD HH24:MI') AS claimed_at,
            u.id    AS user_id,
            u.email AS account_email,
            -- The name someone signed up with lives on their profile.
            p.full_name AS account_name
       FROM volunteer_roster r
       JOIN users u    ON u.id = r.claimed_by
       JOIN profiles p ON p.user_id = u.id
      WHERE r.claimed_by IS NOT NULL
        AND r.approved_at IS NULL
      ORDER BY r.claimed_at ASC`,
  );
  // Surfaced rather than hidden: a reviewer should see when the account name
  // and the roster name do not look like the same person.
  return rows.map((r) => ({ ...r, name_agrees: namesAgree(r.full_name, r.account_name) }));
}
