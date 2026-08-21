import { query, queryOne } from '@/lib/db';
import { foldName, namesAgree, phoneTail, type MatchStrength } from '@/lib/roster-match';

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

export { formatMemberNumber, foldName, phoneTail, normaliseStoredTail, namesAgree } from '@/lib/roster-match';
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
 * The phone is the key because it is the one thing here that only its owner
 * knows; the account's own name is then used to corroborate. A membership
 * number is accepted too, for the volunteers who carry an old card, but never
 * on its own — numbers are sequential and therefore guessable.
 */
export async function findRosterMatch(opts: {
  phone?: string | null;
  memberNumber?: number | null;
  accountName: string;
}): Promise<RosterMatch | null> {
  const tail = phoneTail(opts.phone ?? '');

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
      return {
        entry: row,
        strength: namesAgree(row.full_name, opts.accountName) ? 'phone-and-name' : 'phone-only',
      };
    }
  }

  if (opts.memberNumber && Number.isInteger(opts.memberNumber)) {
    const row = await queryOne<RosterEntry>(
      `SELECT ${COLUMNS} FROM volunteer_roster WHERE member_number = $1 LIMIT 1`,
      [opts.memberNumber],
    );
    // A number alone proves nothing, so the name has to carry this one.
    if (row && namesAgree(row.full_name, opts.accountName)) {
      return { entry: row, strength: 'number-and-name' };
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
