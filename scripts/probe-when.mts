/**
 * Times mean Beirut, everywhere, in both directions.
 *
 * A coordinator typed 3pm into the activity form and the activity started at
 * 6pm. Nothing was broken in the obvious sense: the browser sent the bare
 * string "2026-10-01T15:00", which carries no zone at all, and every layer
 * below was then free to guess. Postgres guessed, because its session runs on
 * GMT, and stored 15:00Z. The page then rendered that in Beirut and said 6pm.
 *
 * The fix is that the guessing stops at the door: parseLocalInput reads the
 * form's wall clock as Beirut and hands down a real instant, and toLocalInput
 * writes an instant back out as Beirut wall clock. This probe holds both ends.
 *
 * It is a PURE probe: no database, no network. It deliberately does not read
 * the process timezone — the point of the exercise is that the answer must not
 * depend on it, so `npm run probe` under TZ=UTC must print the same numbers as
 * it does on a laptop in Lebanon.
 *
 *   npx tsx scripts/probe-when.mts
 */

import {
  formatDate,
  formatDuration,
  formatTime,
  parseLocalInput,
  toLocalInput,
} from '../src/lib/when.ts';

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

/* ------------------------------------------------------------------ *
 * 1. Reading the form — Beirut wall clock in, real instant out
 * ------------------------------------------------------------------ */
console.log('\n1. parseLocalInput reads the form as Beirut');

// Summer: Beirut is UTC+3. 09:00 there is 06:00Z.
eq(
  'a summer morning lands three hours earlier in UTC',
  parseLocalInput('2026-10-01T09:00')?.toISOString(),
  '2026-10-01T06:00:00.000Z',
);
// Winter: Beirut is UTC+2. 09:00 there is 07:00Z.
eq(
  'a winter morning lands two hours earlier in UTC',
  parseLocalInput('2026-01-15T09:00')?.toISOString(),
  '2026-01-15T07:00:00.000Z',
);
// The offset is measured at the instant in question, not at some fixed one,
// which is the whole reason it is applied twice.
eq(
  'the day after the clocks go back uses the new offset',
  parseLocalInput('2026-11-01T12:00')?.toISOString(),
  '2026-11-01T10:00:00.000Z',
);
eq(
  'the day before the clocks go back uses the old one',
  parseLocalInput('2026-10-24T12:00')?.toISOString(),
  '2026-10-24T09:00:00.000Z',
);
eq('midnight is read as midnight', parseLocalInput('2026-07-01T00:00')?.toISOString(), '2026-06-30T21:00:00.000Z');
check('an empty box is not a date', parseLocalInput('') === null);
check('rubbish is not a date', parseLocalInput('tomorrow-ish') === null);
check('a date with no time is not enough', parseLocalInput('2026-10-01') === null);
check('undefined is not a date', parseLocalInput(undefined) === null);

/* ------------------------------------------------------------------ *
 * 2. Writing the form — real instant in, Beirut wall clock out
 * ------------------------------------------------------------------ */
console.log('\n2. toLocalInput writes the form in Beirut');

eq(
  'a stored summer instant shows as the hour that was typed',
  toLocalInput(new Date('2026-10-01T06:00:00.000Z')),
  '2026-10-01T09:00',
);
eq(
  'a stored winter instant shows as the hour that was typed',
  toLocalInput(new Date('2026-01-15T07:00:00.000Z')),
  '2026-01-15T09:00',
);
eq('the shape is exactly what the input element accepts', toLocalInput(new Date('2026-03-05T05:04:00.000Z')), '2026-03-05T07:04');
eq('an ISO string is accepted as well as a Date', toLocalInput('2026-10-01T06:00:00.000Z'), '2026-10-01T09:00');
eq('nothing stored means an empty box', toLocalInput(null), '');
eq('an unparseable value means an empty box, not "Invalid Date"', toLocalInput('not a date'), '');

/* ------------------------------------------------------------------ *
 * 3. The round trip — what a coordinator types is what they get back
 * ------------------------------------------------------------------ */
console.log('\n3. the round trip closes');

for (const typed of [
  '2026-01-15T09:00', '2026-06-21T18:30', '2026-10-01T09:00',
  '2026-10-24T23:59', '2026-11-01T00:00', '2027-02-28T13:45',
]) {
  const instant = parseLocalInput(typed);
  eq(`typing ${typed} and reopening the form shows ${typed}`, instant && toLocalInput(instant), typed);
}

/* ------------------------------------------------------------------ *
 * 4. And the page says the same thing the form does
 * ------------------------------------------------------------------ */
console.log('\n4. the public wording agrees with the form');

const nine = parseLocalInput('2026-10-01T09:00')!;
eq('9am reads as nine in the morning', formatTime(nine, 'ar'), 'الساعة 9 صباحًا');
eq('the date names the right weekday', formatDate(nine, 'ar'), 'الخميس في 1 - 10 - 2026');
eq('afternoon is not called morning', formatTime(parseLocalInput('2026-10-01T15:00')!, 'ar'), 'الساعة 3 بعد الظهر');
eq('evening is not called afternoon', formatTime(parseLocalInput('2026-10-01T20:00')!, 'ar'), 'الساعة 8 مساءً');
eq('noon is not called midnight', formatTime(parseLocalInput('2026-10-01T12:00')!, 'ar'), 'الساعة 12 بعد الظهر');
eq('midnight is not called noon', formatTime(parseLocalInput('2026-10-01T00:00')!, 'ar'), 'الساعة 12 صباحًا');
eq('minutes appear only when there are any', formatTime(parseLocalInput('2026-10-01T09:05')!, 'ar'), 'الساعة 9:05 صباحًا');

/* Counted nouns, because "2 ساعات" is wrong and a certificate prints this. */
eq('one hour', formatDuration(60, 'ar'), 'ساعة');
eq('two hours take the dual', formatDuration(120, 'ar'), 'ساعتان');
eq('three to ten take the plural of paucity', formatDuration(180, 'ar'), '3 ساعات');
eq('eleven and above take the singular', formatDuration(660, 'ar'), '11 ساعة');
eq('hours and minutes are joined with و', formatDuration(90, 'ar'), 'ساعة و30 دقيقة');
eq('two minutes take the dual', formatDuration(2, 'ar'), 'دقيقتان');
eq('no time at all is a dash, not "0"', formatDuration(0, 'ar'), '—');

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
