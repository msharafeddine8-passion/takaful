/**
 * Loads the association's volunteer roster into volunteer_roster.
 *
 *   npx tsx --env-file=.env.local scripts/import-roster.mts <file.xlsx>          # dry run
 *   npx tsx --env-file=.env.local scripts/import-roster.mts <file.xlsx> --apply  # write
 *
 * The spreadsheet is never committed: it holds the names, birth dates and
 * addresses of real volunteers, a good number of them minors. Keep it outside
 * the repository and pass its path.
 *
 * Re-running is safe. Rows are matched on member_number and updated in place,
 * so a corrected spreadsheet can simply be imported again — except that a
 * roster line already claimed by an account is left alone, because renaming
 * somebody's membership out from under them is not a correction.
 */
import { readFileSync } from 'node:fs';
import { Client } from 'pg';

const file = process.argv[2];
const apply = process.argv.includes('--apply');

if (!file) {
  console.error('usage: import-roster.mts <roster.json> [--apply]');
  process.exit(1);
}

/** Same folding the app uses, and the reason it exists: see the migration. */
function foldName(s: string): string {
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

function phoneTail(s: string): string | null {
  const d = String(s ?? '').replace(/\D/g, '');
  return d.length >= 8 ? d.slice(-8) : null;
}

/*
 * Birth dates were typed by hand into two different sheets over seven years,
 * and it shows: 2005-30-07 is the thirtieth of July, not the thirtieth month.
 * A component over twelve can only be a day, so the pair is swapped; anything
 * that still is not a real calendar date is dropped rather than guessed at,
 * because a wrong birth date decides whether the platform treats a volunteer
 * as a child.
 */
function isoDate(s: string): string | null {
  const t = String(s ?? '').trim();
  if (!t) return null;
  let year: number, first: number, second: number;
  let m = t.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) { year = +m[1]; first = +m[2]; second = +m[3]; }
  else {
    m = t.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (!m) return null;
    year = +m[3]; first = +m[2]; second = +m[1]; // dd/mm/yyyy
  }
  let month = first, day = second;
  if (month > 12 && day <= 12) { const swap = month; month = day; day = swap; }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/*
 * A handful of rows carry a birth date of 2022 or 2023 — the joining date,
 * typed into the wrong column. Importing those would have the platform believe
 * a volunteer is three years old, and this is a platform where age decides
 * whether a guardian's consent is required. An empty birth date is a question
 * the short form can ask; a wrong one is never asked again.
 */
const droppedDates: number[] = [];
function plausibleBirthDate(iso: string | null): string | null {
  if (!iso) return null;
  const year = Number(iso.slice(0, 4));
  const thisYear = new Date().getUTCFullYear();
  if (year < 1930 || year > thisYear - 10) return null;
  return iso;
}

type Incoming = {
  memberNumber: number;
  fullName: string;
  joinedOn: string | null;
  dateOfBirth: string | null;
  phone: string | null;
  committee: string | null;
  source: string | null;
};
type Row = {
  memberNumber: number;
  fullName: string;
  phone: string | null;
  dob: string | null;
  joined: string | null;
  committee: string | null;
  source: string | null;
};

const incoming: Incoming[] = JSON.parse(readFileSync(file, 'utf8'));
if (!Array.isArray(incoming)) throw new Error('expected a JSON array of roster entries');

const rows: Row[] = [];
const problems: string[] = [];
incoming.forEach((x, i) => {
  const name = String(x.fullName ?? '').trim();
  const num = Number(x.memberNumber);
  if (!name) { problems.push(`entry ${i + 1}: number ${x.memberNumber} has no name`); return; }
  if (!Number.isInteger(num) || num <= 0) { problems.push(`entry ${i + 1}: "${name}" has no usable number`); return; }
  const rawDob = isoDate(x.dateOfBirth ?? '');
  if (rawDob && !plausibleBirthDate(rawDob)) droppedDates.push(num);
  rows.push({
    memberNumber: num,
    fullName: name,
    phone: phoneTail(x.phone ?? ''),
    dob: plausibleBirthDate(isoDate(x.dateOfBirth ?? '')),
    joined: isoDate(x.joinedOn ?? ''),
    committee: (x.committee ?? '').trim() || null,
    source: (x.source ?? '').trim() || null,
  });
});

const numbers = new Set<number>();
for (const r of rows) {
  if (numbers.has(r.memberNumber)) problems.push(`number ${r.memberNumber} appears more than once`);
  numbers.add(r.memberNumber);
}

console.log(`read ${rows.length} people from ${file}`);
console.log(`  with a phone      : ${rows.filter((r) => r.phone).length}`);
console.log(`  with a joining date: ${rows.filter((r) => r.joined).length}`);
console.log(`  with a birth date : ${rows.filter((r) => r.dob).length}`);
console.log(`  highest number    : T${Math.max(...rows.map((r) => r.memberNumber))}`);
if (droppedDates.length) {
  console.log(`  birth dates dropped as impossible: ${droppedDates.length}` +
    ` (T${droppedDates.join(', T')}) — they will be asked on the short form`);
}
if (problems.length) {
  console.error(`\n${problems.length} problem(s) — nothing was written:`);
  problems.slice(0, 20).forEach((p) => console.error('  ' + p));
  process.exit(1);
}

if (!apply) {
  console.log('\nDRY RUN — nothing written. Re-run with --apply to import.');
  process.exit(0);
}

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();
try {
  await c.query('BEGIN');
  let inserted = 0;
  let updated = 0;
  let skippedClaimed = 0;

  for (const r of rows) {
    const res = await c.query<{ action: string }>(
      `INSERT INTO volunteer_roster
         (member_number, full_name, name_folded, phone_tail, date_of_birth, joined_on, committee, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (member_number) DO UPDATE
         SET full_name     = EXCLUDED.full_name,
             name_folded   = EXCLUDED.name_folded,
             phone_tail    = EXCLUDED.phone_tail,
             date_of_birth = EXCLUDED.date_of_birth,
             joined_on     = EXCLUDED.joined_on,
             committee     = EXCLUDED.committee,
             source        = EXCLUDED.source
         -- A line someone has already claimed is theirs; leave it untouched.
         WHERE volunteer_roster.claimed_by IS NULL
       RETURNING CASE WHEN xmax = 0 THEN 'inserted' ELSE 'updated' END AS action`,
      [r.memberNumber, r.fullName, foldName(r.fullName), r.phone, r.dob, r.joined, r.committee, r.source],
    );
    if (res.rowCount === 0) skippedClaimed++;
    else if (res.rows[0].action === 'inserted') inserted++;
    else updated++;
  }

  // New volunteers must continue after the roster, never collide with it.
  const seq = await c.query<{ value: string }>(
    /*
     * The high-water mark is whatever has actually been handed out — no
     * floor. The sequence used to start at 1001, which would have the next new
     * volunteer numbered T1001 while the association's own roster ends at
     * T473, leaving a gap of five hundred numbers that mean nothing.
     */
    `SELECT setval('member_number_seq',
       GREATEST(
         (SELECT COALESCE(MAX(member_number), 0) FROM profiles),
         (SELECT COALESCE(MAX(member_number), 0) FROM volunteer_roster),
         1),
       true)::text AS value`,
  );

  await c.query('COMMIT');
  console.log(`\ninserted: ${inserted}   updated: ${updated}   left alone (already claimed): ${skippedClaimed}`);
  console.log(`next number issued to a brand-new volunteer: T${Number(seq.rows[0].value) + 1}`);
} catch (err) {
  await c.query('ROLLBACK');
  throw err;
} finally {
  await c.end();
}
