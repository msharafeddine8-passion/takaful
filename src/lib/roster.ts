import { query, queryOne } from '@/lib/db';

/**
 * Recognising people the association already knows.
 *
 * Until now the only door was the application form, which asks a volunteer of
 * six years why they would like to volunteer and then puts them in a review
 * queue. This looks them up in the association's own roster instead, so the
 * question becomes "is this you?" rather than "should we take you?".
 *
 * Nothing here grants anything. A match is a claim; a member of staff who
 * knows the person still has to approve it. That ordering is the whole safety
 * model — a name is not a password, and this platform has minors on it.
 */

/** Shown as T047. The T and the padding live here and nowhere else. */
export function formatMemberNumber(n: number): string {
  return `T${String(n).padStart(3, '0')}`;
}

/**
 * The same folding the import uses. Arabic spelling drifts between people and
 * across years — أ/ا, ة/ه, ى/ي, stray diacritics and doubled spaces — and two
 * spellings of one name must land on one key. Matching the association's two
 * spreadsheets on raw names found 38 people in common; folded names and phone
 * numbers found 178.
 */
export function foldName(s: string): string {
  return String(s ?? '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ً-ْـٰ]/g, '')
    .replace(/[^؀-ۿ a-zA-Z]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Lebanese numbers are written 03 xxx xxx, +961 3 xxx xxx and 00961 3 xxx xxx
 * for the same line, so only the last eight digits are comparable.
 */
export function phoneTail(s: string): string | null {
  const d = String(s ?? '').replace(/\D/g, '');
  return d.length >= 8 ? d.slice(-8) : null;
}

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

/** How far the evidence goes. The wording a claimant sees depends on it. */
export type MatchStrength = 'phone-and-name' | 'phone-only' | 'number-and-name';

export type RosterMatch = {
  entry: RosterEntry;
  strength: MatchStrength;
};

const COLUMNS = `id, member_number, full_name, joined_on,
                 to_char(date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
                 committee, claimed_by, approved_at`;

/** Names agree when they share at least two words — enough that "محمد علي
 *  حسن" and "محمد حسن" meet, and that two unrelated people do not. */
function namesAgree(a: string, b: string): boolean {
  const ta = new Set(foldName(a).split(' ').filter((t) => t.length > 1));
  const tb = foldName(b).split(' ').filter((t) => t.length > 1);
  let shared = 0;
  for (const t of tb) if (ta.has(t)) shared++;
  return shared >= 2;
}

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
    const row = await queryOne<RosterEntry>(
      `SELECT ${COLUMNS} FROM volunteer_roster WHERE phone_tail = $1 LIMIT 1`,
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
