/*
 * Retiring a badge, without taking it off the people who hold it.
 *
 * The gamification brief asked for a switch that turns a badge off. The
 * dangerous way to build that is to make the engine treat a retired badge as
 * one nobody meets — one line, looks right, and withdraws the badge from every
 * single holder on the next recompute, with the engine's generic reason, on a
 * day unconnected to anything they did.
 *
 * The safe way is to drop the definition from the pass entirely: no grant, no
 * withdrawal, no row touched. The difference is invisible in a code review and
 * catastrophic in production, so it is held here.
 *
 * A PURE probe: no database, no network.
 */

import {
  inCirculation, isRetired, retiredCodesFrom,
} from '../src/lib/badge-circulation.ts';

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

const DEFS = [
  { code: 'first-hour' },
  { code: 'ten-hours' },
  { code: 'first-course' },
  { code: 'first-activity' },
];

/* ------------------------------------------------------------------ *
 * 1. Which definitions the engine may act on
 * ------------------------------------------------------------------ */
console.log('\n1. what stays in circulation');

eq('with nothing retired, every definition passes through',
  inCirculation(DEFS, []).length, DEFS.length);
check('and they are the same definitions, not copies of one',
  inCirculation(DEFS, []).map((d) => d.code).join() === DEFS.map((d) => d.code).join());

const left = inCirculation(DEFS, ['ten-hours']);
check('a retired code is gone from the pass',
  !left.some((d) => d.code === 'ten-hours'), left.map((d) => d.code).join());
eq('and only that one is gone', left.length, DEFS.length - 1);

/*
 * THE POINT OF THE WHOLE FEATURE.
 *
 * Gone from the pass is not the same as present-but-unmet. The engine's
 * withdrawal branch reads `!qualifies && has && !isRevoked` — a retired
 * definition that reached it would be withdrawn from every holder. It must
 * never reach it, which means it must not be in the list at all.
 */
check('a retired definition is absent, never present-and-failing',
  inCirculation(DEFS, ['ten-hours']).every((d) => d.code !== 'ten-hours'));

check('retiring everything leaves an empty pass, not the original list',
  inCirculation(DEFS, DEFS.map((d) => d.code)).length === 0);
check('a retired code nothing defines changes nothing',
  inCirculation(DEFS, ['a-badge-that-was-deleted']).length === DEFS.length);

/* The catalogue must survive the filter unchanged: ACHIEVEMENTS is a shared
 * module-level array, and a filter that mutated it would retire a badge for
 * the lifetime of the process rather than for one pass. */
const before = DEFS.map((d) => d.code).join();
inCirculation(DEFS, ['first-hour', 'ten-hours']);
eq('the catalogue itself is not modified', DEFS.map((d) => d.code).join(), before);

/* ------------------------------------------------------------------ *
 * 2. Reading the table
 * ------------------------------------------------------------------ */
console.log('\n2. retired, lifted, and the difference');

check('a row with no lift is retired', isRetired({ lifted_at: null }));
check('a row that was lifted is not', !isRetired({ lifted_at: new Date() }));
check('no row at all is not retired', !isRetired(null));
check('and undefined is not retired either', !isRetired(undefined));

/*
 * Lifted rows are KEPT rather than deleted — migration 039 has a trigger that
 * refuses the DELETE. So every read has to tell the two apart, and reading a
 * lifted row as still-retired would leave a badge quietly out of circulation
 * after somebody deliberately brought it back.
 */
const rows = [
  { code: 'ten-hours', lifted_at: null },
  { code: 'first-course', lifted_at: new Date('2026-03-01T00:00:00Z') },
  { code: 'first-activity', lifted_at: null },
];
eq('only the unlifted codes come back', retiredCodesFrom(rows).join(), 'ten-hours,first-activity');
check('a badge brought back is handed out again',
  inCirculation(DEFS, retiredCodesFrom(rows)).some((d) => d.code === 'first-course'));
check('and one still retired is not',
  !inCirculation(DEFS, retiredCodesFrom(rows)).some((d) => d.code === 'ten-hours'));
eq('an empty table retires nothing', retiredCodesFrom([]).length, 0);

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
