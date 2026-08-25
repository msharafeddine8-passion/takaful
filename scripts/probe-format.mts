/*
 * Counted nouns in the second duration formatter.
 *
 * There are two formatDuration in this repository and only one of them was
 * ever right. src/lib/when.ts always shaped Arabic properly; src/lib/format.ts
 * was copied from an older file that wrote «{n} ساعة» for every count, and it
 * is the one the membership card, the journey page, the dashboard, the honours
 * board and the achievements page all use. So most of the site was printing
 * «2 ساعة», which is wrong the way "2 hour" is wrong, on the figures the whole
 * platform is about.
 *
 * The two are deliberately not merged — their contracts differ where it
 * matters, and this probe holds both differences as well as the grammar,
 * because the obvious "cleanup" later is to delete one of them.
 *
 * It also holds the numeral policy, settled in the same pass: Latin digits in
 * both languages, everywhere, because formatNumber was the only thing on the
 * site using Arabic-Indic ones.
 *
 * A PURE probe: no database, no network.
 */

import { formatDuration, formatNumber } from '../src/lib/format.ts';

let ok = 0;
const holes: string[] = [];

function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1;
  else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

const eq = (what: string, got: unknown, want: unknown) =>
  check(what, Object.is(got, want),
    got === want ? '' : `got ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`);

/* ------------------------------------------------------------------ *
 * 1. The five bands Arabic counts in
 * ------------------------------------------------------------------ */
console.log('\n1. hours, in Arabic');

eq('one hour is a word, not a number and a word', formatDuration(60, 'ar'), 'ساعة');
eq('two hours is the dual', formatDuration(120, 'ar'), 'ساعتان');
eq('three is the plural of paucity', formatDuration(180, 'ar'), '3 ساعات');
eq('ten is still the plural of paucity', formatDuration(600, 'ar'), '10 ساعات');
/* The band nobody remembers: from eleven up, the noun goes back to singular. */
eq('eleven takes the singular again', formatDuration(660, 'ar'), '11 ساعة');
eq('and so does fifty', formatDuration(3000, 'ar'), '50 ساعة');

console.log('\n2. minutes, and both together');

eq('one minute', formatDuration(1, 'ar'), 'دقيقة');
eq('two minutes is the dual', formatDuration(2, 'ar'), 'دقيقتان');
eq('five minutes', formatDuration(5, 'ar'), '5 دقائق');
eq('forty-five minutes', formatDuration(45, 'ar'), '45 دقيقة');
eq('an hour and a half', formatDuration(90, 'ar'), 'ساعة و30 دقيقة');
eq('two and a half hours', formatDuration(150, 'ar'), 'ساعتان و30 دقيقة');

/* ------------------------------------------------------------------ *
 * 3. The two contracts that stop these being one function
 * ------------------------------------------------------------------ */
console.log('\n3. what makes this one different from when.ts');

/*
 * A reversal is stored as negative minutes and the hours ledger has to show
 * it. when.ts answers '—' for anything at or below zero, which on a correction
 * row would erase the very thing the row exists to report.
 */
eq('a reversal keeps its sign', formatDuration(-120, 'ar'), '-ساعتان');
eq('and in English too', formatDuration(-90, 'en'), '-1 h 30 min');

/*
 * Zero is a figure here, not a gap. A dashboard tile reading «0 دقيقة» says
 * "none yet"; a tile reading «—» says "we do not know", and those are
 * different claims to make to somebody about their own record.
 */
eq('zero is a number, not a dash', formatDuration(0, 'ar'), '0 دقيقة');
eq('and in English', formatDuration(0, 'en'), '0 min');

console.log('\n4. English is unchanged');

eq('hours and minutes', formatDuration(150, 'en'), '2 h 30 min');
eq('whole hours', formatDuration(120, 'en'), '2 h');
eq('minutes alone', formatDuration(45, 'en'), '45 min');

console.log('\n5. numerals — one vocabulary across the site');

/*
 * Latin digits everywhere, in both languages.
 *
 * formatNumber used to return Arabic-Indic digits in Arabic, on a reasonable
 * ground: a Latin digit inside Arabic prose reads as a foreign body. It was
 * the only thing on the site doing it. Every date and every duration is Latin,
 * decided at the top of when.ts for a sturdier reason — the association's own
 * paperwork, its ID cards and the keypad on a volunteer's phone all use Latin
 * digits, and a figure here is copied onto paper more often than read aloud.
 *
 * So one screen showed «50 ساعة» beside «١٬٢٣٤ نقطة», which does not read as a
 * considered choice — it reads as two pages stitched together. This holds the
 * settled answer in both directions, so it cannot drift back in one place and
 * not the other.
 */
eq('durations use Latin digits', formatDuration(3000, 'ar'), '50 ساعة');
eq('and so do counts, in Arabic', formatNumber(1234, 'ar'), '1,234');
eq('and in English', formatNumber(1234, 'en'), '1,234');
check('no Arabic-Indic digit survives in any formatted figure',
  !/[٠-٩]/.test(formatNumber(1234567, 'ar') + formatDuration(3000, 'ar')));
/* ar-LB with Latin digits groups as 1.234.567, and a dot where an English
 * reader expects a decimal point is worse than the problem it solves. */
eq('grouped with commas, not dots', formatNumber(1234567, 'ar'), '1,234,567');

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
