/*
 * What each line of the hours ledger says about the person it belongs to.
 *
 * Three kinds of row share one table and were being drawn as one thing. The
 * failures that produced were not cosmetic: a carry-over covering six years of
 * service printed against a single Tuesday; a correction that had just taken
 * two hours off somebody's total showed the reduction and never the grounds
 * for it, because the page rendered `reject_reason` and nothing else; and an
 * afternoon logged by hand with a note but no activity printed «—», so what
 * the volunteer wrote about their own work was nowhere on the screen.
 *
 * Each of those is a rule about honesty, and each is one moved `if` away from
 * coming back. This holds them.
 *
 * A PURE probe: no database, no network.
 *
 *   npx tsx scripts/probe-hours-ledger.mts
 */

import {
  ledgerRows, activityTitle, LEDGER_TONE,
  type LedgerEntry,
} from '../src/lib/hours-ledger.ts';
import { ar } from '../src/lib/dictionaries/ar.ts';
import { en } from '../src/lib/dictionaries/en.ts';

let ok = 0;
const holes: string[] = [];

function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1;
  else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

const eq = (what: string, got: unknown, want: unknown) =>
  check(what, Object.is(got, want), got === want ? '' : `got ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`);

/** An ordinary session logged by a volunteer — every other case is this with
 *  something switched on. */
const base: LedgerEntry = {
  id: 'e1',
  worked_on: '2026-08-01',
  minutes: 120,
  note: null,
  status: 'pending',
  carried_over: false,
  corrects_id: null,
  reject_reason: null,
  activity_title_ar: null,
  activity_title_en: null,
};
const entry = (over: Partial<LedgerEntry>): LedgerEntry => ({ ...base, ...over });
const one = (over: Partial<LedgerEntry>) => ledgerRows([entry(over)])[0];

/* ------------------------------------------------------------------ *
 * 1. Carried-over service is not a day of work
 * ------------------------------------------------------------------ */
console.log('\n1. hours carried over from before the platform');

const carried = one({
  carried_over: true,
  minutes: 7_200,
  status: 'verified',
  worked_on: '2024-12-31',
  note: 'تطوّع 2020–2024، بحسب سجلّ الجمعية',
});

eq('a carry-over is its own kind of row', carried.kind, 'carried');
/* The whole point. The date is the day the period was counted UP TO; printed
 * bare it tells somebody they volunteered a hundred and twenty hours on one
 * Tuesday, which is both false and the sort of false that looks like a bug in
 * the totals. */
eq('and its date is the end of a period, not a day worked',
  carried.dateMeaning, 'counted-up-to');
eq('an ordinary session is dated to the day it was worked',
  one({}).dateMeaning, 'worked-on');
/* The note is the only account of what the figure covers — migration 031
 * refuses a carry-over without one for exactly that reason. */
check('the period it covers survives to the row', carried.staffNote !== null, carried.staffNote);
check('and is attributed to staff, not passed off as the volunteer’s own note',
  carried.ownNote === null);
check('the two labels a carry-over needs are not the same sentence in either language',
  ar.account.hours.carriedOver !== ar.account.hours.carriedExplain
  && en.account.hours.carriedOver !== en.account.hours.carriedExplain);

/* ------------------------------------------------------------------ *
 * 2. A correction, and the row it corrects
 * ------------------------------------------------------------------ */
console.log('\n2. corrections');

/* correctHoursAction never edits the original: it inserts a reversing row with
 * negative minutes and marks the original 'corrected'. Both must stay on the
 * page — a total nobody can explain line by line is a total nobody can dispute. */
const pair = ledgerRows([
  entry({ id: 'rev', minutes: -120, status: 'verified', corrects_id: 'orig', note: 'سُجّلت مرّتين' }),
  entry({ id: 'orig', minutes: 120, status: 'corrected' }),
]);

eq('nothing is dropped from the ledger', pair.length, 2);
eq('the reversal is marked as a correction', pair[0].kind, 'correction');
/* The page needs lib/when's counted-noun formatDuration for «ساعتان», and that
 * one answers «—» for anything at or below zero. Handed a reversal whole it
 * would render an em dash where the figure should be, so the magnitude and the
 * direction are separated here and the page states both. */
eq('and reports a positive amount', pair[0].minutes, 120);
eq('marked as taken away', pair[0].direction, 'removed');
eq('an ordinary entry is an addition', one({}).direction, 'added');
check('the grounds for it are kept', pair[0].staffNote === 'سُجّلت مرّتين');
check('and attributed to the member of staff who wrote them', pair[0].ownNote === null);
eq('the row it reversed stays in the list', pair[1].id, 'orig');
check('and says it was superseded', pair[1].superseded);
check('a live row is not marked superseded', !one({ status: 'verified' }).superseded);
/*
 * The correction was a staff decision about the record. Colouring it the same
 * red the site uses for something wrong with your account would read as the
 * volunteer's error, which it is not.
 */
check('a corrected row is not painted as a failure of the volunteer’s',
  LEDGER_TONE.corrected !== LEDGER_TONE.rejected, LEDGER_TONE.corrected);

/* ------------------------------------------------------------------ *
 * 3. Where an entry came from
 * ------------------------------------------------------------------ */
console.log('\n3. what the hours were for');

const fromActivity = one({
  activity_title_ar: 'توزيع حصص غذائية',
  activity_title_en: 'Food parcel distribution',
});
eq('an activity’s title reaches the row', activityTitle(fromActivity, 'ar'), 'توزيع حصص غذائية');
eq('in the reader’s language', activityTitle(fromActivity, 'en'), 'Food parcel distribution');
/* Half the activities in this database have never been given an English title.
 * A blank cell would be worse than the other language. */
eq('and falls back rather than going blank',
  activityTitle(one({ activity_title_ar: 'حملة تنظيف', activity_title_en: null }), 'en'),
  'حملة تنظيف');
eq('an entry with no activity has none to show', activityTitle(one({}), 'ar'), null);

/* This is the case that printed «—» while the volunteer's own sentence about
 * their afternoon sat unread in the note column. */
const handLogged = one({ note: 'ساعدت في ترتيب المستودع بعد الفيضان' });
check('what the volunteer wrote about their own session is kept',
  handLogged.ownNote === 'ساعدت في ترتيب المستودع بعد الفيضان');
check('and is never presented as a supervisor’s note', handLogged.staffNote === null);
check('the two notes are labelled differently in both languages',
  ar.account.hours.yourNoteLabel !== ar.account.hours.staffNoteLabel
  && en.account.hours.yourNoteLabel !== en.account.hours.staffNoteLabel);

/* ------------------------------------------------------------------ *
 * 4. What was not verified, and how it is said
 * ------------------------------------------------------------------ */
console.log('\n4. entries that were not verified');

const notVerified = one({ status: 'rejected', reject_reason: 'النشاط لم يُقَم في هذا التاريخ' });
check('the reason is kept and never hidden',
  notVerified.staffNote === 'النشاط لم يُقَم في هذا التاريخ');
check('and is attributed, so it reads as one person’s note and not as a verdict',
  notVerified.ownNote === null);
/*
 * «مرفوضة» / "Rejected" describes the person. The wording describes what
 * happened to the entry, and matches the notification they were already sent.
 */
check('the status describes the entry, not the volunteer',
  !/مرفوض/.test(ar.account.hours.statusRejected) && !/reject/i.test(en.account.hours.statusRejected),
  `${ar.account.hours.statusRejected} / ${en.account.hours.statusRejected}`);

/* ------------------------------------------------------------------ *
 * 5. What counts
 * ------------------------------------------------------------------ */
console.log('\n5. what is in the total');

check('a verified entry counts', one({ status: 'verified' }).counts);
check('one waiting on a supervisor does not', !one({ status: 'pending' }).counts);
check('nor does one that was not verified', !one({ status: 'rejected' }).counts);
check('nor does a superseded one', !one({ status: 'corrected' }).counts);
/* Said in words beside the figure. A volunteer who thinks their pending hours
 * are already in the total is the most common misreading of this page. */
check('and the page has a sentence saying why the pending figure is not counted',
  ar.account.hours.pendingNote.length > 0 && en.account.hours.pendingNote.length > 0);

/* Every status has a tone, or a pill renders with no tint and nothing fails. */
for (const status of ['pending', 'verified', 'rejected', 'corrected'] as const) {
  check(`the ${status} pill has a tone`, LEDGER_TONE[status].length > 0);
}

/* ------------------------------------------------------------------ *
 * 6. Counted nouns
 * ------------------------------------------------------------------ */
console.log('\n6. the Arabic');

/* Five bands, not two. «2 قيد» and «3 قيد» are both wrong, and the two-form is
 * a dual word rather than a numeral with a noun after it. */
const forms = ar.account.hours.awaiting;
check('the dual form is a word, not a numeral', !/\{n\}/.test(forms.two), forms.two);
check('the one form is a word, not a numeral', !/\{n\}/.test(forms.one), forms.one);
check('the few and many forms take the count', forms.few.includes('{n}') && forms.many.includes('{n}'));
check('and differ from each other', forms.few !== forms.many);
check('the zero form says nothing is waiting rather than showing a nought',
  !/\{n\}/.test(forms.zero) && !/0/.test(forms.zero), forms.zero);

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
