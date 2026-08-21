/**
 * How the association decides that two records describe the same person.
 *
 * Split out of roster.ts, which imports the database and is therefore
 * `server-only` and unreachable from a plain script. These four rules are the
 * hinge the whole feature turns on — they decide who is handed a membership
 * number, and since recognition became automatic, they decide it with nobody
 * watching. Rules that consequential should be testable without a database,
 * and now they are: probe-recognition holds them directly.
 *
 * Nothing here touches storage and nothing here grants anything. It compares
 * strings.
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
 * One Lebanese line, reduced to the digits that identify it.
 *
 * The same line is written 03 123 456, +961 3 123 456 and 00961 3 123 456, and
 * this has to see one number in all three. Keeping the last eight digits — the
 * obvious reading, and what this did — does not achieve that: the local form
 * carries a trunk 0 that the international form drops, so 03 123 456 keeps
 * "03123456" while +961 3 123 456 yields "13123456". Two spellings of one
 * phone, two different keys, and a volunteer who typed the wrong one was told
 * the association had never heard of them.
 *
 * It only ever showed up on the numbers with a single-digit national prefix —
 * 03 and the landlines — because 70/71/76/78/79/81 have no trunk 0 to lose.
 * That made it eleven people out of four hundred and thirty-nine, which is
 * exactly the kind of proportion that never gets reported and never gets found.
 *
 * So the country code and the trunk zero both come off, leaving the national
 * significant number, which is the thing that actually identifies the line.
 */
export function phoneTail(s: string): string | null {
  let d = String(s ?? '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('961')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  // Seven digits is a full Lebanese national number; less is not a phone.
  return d.length >= 7 ? d : null;
}

/**
 * The stored roster key, reduced to the same national form as phoneTail.
 *
 * The roster was imported before phoneTail was corrected and only the derived
 * key was kept — the number as typed was never stored, so there is nothing to
 * recompute from. What is stored is the old last-eight-digits key, which for a
 * locally-written 03 number still carries the trunk zero: "03998877". Taking
 * that zero off is exactly what the corrected rule does to the typed number,
 * so both sides land on "3998877" and meet.
 *
 * Deliberately not a migration. Four hundred rows of the association's records
 * do not need rewriting to save a comparison from doing this, and a comparison
 * works whether or not anybody remembered to run anything.
 *
 * findRosterMatch says the same thing in SQL, as `regexp_replace(phone_tail,
 * '^0', '')`. probe-recognition checks the two still agree.
 */
export function normaliseStoredTail(stored: string): string {
  return stored.replace(/^0/, '');
}

/**
 * Names agree when they share at least two words — enough that "محمد علي حسن"
 * and "محمد حسن" meet, and that two unrelated people do not.
 *
 * Two rather than one, because one shared word is a coincidence: half the
 * roster is a محمد or an علي. Two also means a single-word name never agrees
 * with anything, which sends those to a member of staff instead of through —
 * the cautious side to fail on, given what agreement now unlocks.
 */
export function namesAgree(a: string, b: string): boolean {
  const ta = new Set(foldName(a).split(' ').filter((t) => t.length > 1));
  const tb = foldName(b).split(' ').filter((t) => t.length > 1);
  let shared = 0;
  for (const t of tb) if (ta.has(t)) shared++;
  return shared >= 2;
}

/** How far the evidence goes. The wording a claimant sees depends on it. */
export type MatchStrength = 'phone-and-name' | 'phone-only' | 'number-and-name';
