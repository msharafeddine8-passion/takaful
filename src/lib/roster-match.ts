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
 *
 * What it cannot do is cross alphabets. The roster is in Arabic and most
 * people register in Latin script, so "Hala ghemrawi" and "هلا معن غمرواي"
 * share nothing at all: thirteen of the association's twenty-one accounts
 * have a name that agrees with no roster line anywhere. Romanising the Arabic
 * side was tried against the real pairs and rescued three of twelve; getting
 * the rest would have meant prefix and near-miss matching, which is not a
 * thing to put in front of an automatic grant of somebody's membership
 * identity. The date of birth carries those instead — see datesAgree.
 */
export function namesAgree(a: string, b: string): boolean {
  const ta = new Set(foldName(a).split(' ').filter((t) => t.length > 1));
  const tb = foldName(b).split(' ').filter((t) => t.length > 1);
  let shared = 0;
  for (const t of tb) if (ta.has(t)) shared++;
  return shared >= 2;
}

/**
 * A date of birth, compared as a calendar date.
 *
 * The second factor that survives the alphabet. A volunteer knows their own
 * birthday whichever way they spell their name, and somebody else in the same
 * household sharing the phone has a different one — which is the case
 * name agreement was there to catch.
 *
 * String equality on YYYY-MM-DD, deliberately, and never a Date object. The
 * database session runs GMT while the association lives in Beirut, so turning
 * either side into an instant makes a birthday recorded at midnight Beirut
 * into the previous day. The roster column is selected as
 * `to_char(…, 'YYYY-MM-DD')` and an `<input type="date">` submits the same
 * shape, so both sides are text before they ever meet.
 *
 * Both sides must be exactly that shape, and a timestamp is refused rather
 * than trimmed down to its first ten characters. Trimming looks like the
 * forgiving choice and is the dangerous one: querying the column without
 * to_char yields `2002-12-31T22:00:00.000Z` for a birthday of 1 January,
 * because the session is GMT and Beirut is two hours ahead — so the first ten
 * characters are the wrong day, and this would quietly hand somebody the
 * wrong record. Refusing means that if the query ever loses its to_char,
 * nobody is recognised automatically until someone notices, which is the side
 * to fail on.
 */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function datesAgree(rosterIso: string | null, typed: string): boolean {
  if (!rosterIso) return false;
  const a = rosterIso.trim();
  const b = typed.trim();
  return ISO_DATE.test(a) && ISO_DATE.test(b) && a === b;
}

/**
 * How far the evidence goes. The wording a claimant sees depends on it.
 *
 * The four two-fact strengths are what recognition can happen on without a
 * person watching. `phone-only` and `number-only` are one fact each and go to
 * a member of staff.
 *
 * `number-only` exists because what it replaced was worse than a queue. A
 * membership number matching a real line whose name did not agree used to
 * return no match at all — so a volunteer of six years holding their own card
 * was told the association had never heard of them, and because nothing was
 * written down there was no claim for anybody to approve. With most accounts
 * in Latin script and the roster in Arabic, "the name did not agree" is the
 * ordinary case rather than the suspicious one.
 */
export type MatchStrength =
  | 'phone-and-name'
  | 'phone-and-dob'
  | 'number-and-name'
  | 'number-and-dob'
  | 'phone-only'
  | 'number-only';
