/*
 * Every column a query hands back, against the field the code reads.
 *
 * THE FAULT THIS EXISTS FOR was live and silent. leaderboard-data.ts selected
 * `AS turned_up`; LeaderboardRow declares `turnedUp`. Postgres folds an
 * unquoted alias to lower case, pg camel-cases nothing, and there is no mapping
 * layer — so `row.turnedUp` was `undefined` on every row of every query,
 * `int()` turned it into 0, the reliability rate came out 0 for everybody, and
 * the board drops anyone whose rate is not above zero.
 *
 * The «الأكثر التزاماً» board was therefore empty in production, and it did not
 * look broken. It looked like a board nobody had qualified for yet.
 *
 * probe-leaderboard has ninety-four assertions over that figure and every one
 * of them passed, because its fixtures are built from LeaderboardRow — they
 * match the type the code expects rather than the shape the query returns.
 * That is the gap: a probe that builds its own input can never discover that
 * the real input has a different name.
 *
 * So this reads the SQL as text and compares the aliases it produces against
 * the field names the consuming type declares. It is crude, and crude is the
 * point — it needs no database, no fixtures, and no agreement with either side.
 *
 * A PURE probe: no database, no network.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

let ok = 0;
const holes: string[] = [];

function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1;
  else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

const read = (...parts: string[]) => {
  try {
    return readFileSync(path.join(process.cwd(), ...parts), 'utf8');
  } catch {
    return '';
  }
};

/**
 * Aliases a query hands back, as the driver will key them.
 *
 * An unquoted alias arrives lower-cased whatever case it was written in; a
 * quoted one arrives exactly as written. That asymmetry is the entire bug, so
 * it is modelled here rather than assumed away.
 */
function aliasesIn(sql: string): string[] {
  /*
   * Comments are stripped first, and this probe learned that on its first run.
   * The comment in leaderboard-data.ts explaining the bug contains the phrase
   * "AS turned_up", so the scan reported the very fault it had just fixed. A
   * scanner that reads prose about code as though it were code will always
   * find whatever the prose warns against.
   */
  const code = sql.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ');
  const out: string[] = [];
  for (const m of code.matchAll(/\bAS\s+"([A-Za-z_][A-Za-z0-9_]*)"/g)) out.push(m[1]);
  for (const m of code.matchAll(/\bAS\s+([A-Za-z_][A-Za-z0-9_]*)\b/g)) out.push(m[1].toLowerCase());
  return [...new Set(out)];
}

/** The field names a type declares, from its source text. */
function fieldsIn(source: string, typeName: string): string[] {
  const start = source.indexOf(`export type ${typeName} = {`);
  if (start === -1) return [];
  const end = source.indexOf('\n};', start);
  if (end === -1) return [];
  const body = source.slice(start, end);
  return [...new Set([...body.matchAll(/^\s{2}([A-Za-z_][A-Za-z0-9_]*)\??\s*:/gm)].map((m) => m[1]))];
}

console.log('\n1. the reliability figure actually arrives');

const boardData = read('src', 'lib', 'leaderboard-data.ts');
const board = read('src', 'lib', 'leaderboard.ts');

check('both files are there', boardData.length > 0 && board.length > 0);

const produced = aliasesIn(boardData);
const declared = fieldsIn(board, 'LeaderboardRow');

check('LeaderboardRow declares fields', declared.length > 5, declared.join(', '));

/*
 * The specific one that broke, named on its own. A general check would go green
 * again the moment somebody renamed the field on both sides in a way that
 * happened to agree, and this figure is the one the board is about.
 */
check('turnedUp is produced with its capital, not folded to turned_up',
  produced.includes('turnedUp'),
  produced.includes('turned_up') ? 'still selected as turned_up' : produced.join(', '));
check('and nothing still selects the snake_case spelling',
  !produced.includes('turned_up'));

/*
 * Every camelCase field the type declares has to be produced by the query
 * under exactly that spelling, or it arrives as undefined. Lower-case fields
 * are not checked: those survive the fold either way, which is why `resolved`
 * beside `turnedUp` was fine and hid how easy the mistake is.
 */
const camel = declared.filter((f) => /[A-Z]/.test(f));
const missing = camel.filter((f) => !produced.includes(f));
check('every camelCase field on the row is produced under that exact name',
  missing.length === 0, missing.join(', ') || `checked ${camel.length}`);

/*
 * The other direction, reported rather than asserted: a query may legitimately
 * return more than one type consumes — the same SQL feeds several shapes here.
 * Worth printing, because a field produced and read by nothing is usually a
 * rename that only got done on one side.
 */
const unread = produced.filter(
  (a) => /[A-Z]/.test(a) && !declared.includes(a),
);
console.log(`\n  ${unread.length} camelCase alias(es) produced and not on LeaderboardRow: ${unread.join(', ') || 'none'}`);

console.log('\n2. the check can fail');

/*
 * A detector that cannot fail proves nothing, and this codebase has been
 * caught by exactly that before — invariance assertions passing against a
 * broken hash.
 */
check('an unquoted alias is seen as lower-cased',
  aliasesIn('SELECT 1 AS turnedUp').includes('turnedup'));
check('a quoted alias keeps its case',
  aliasesIn('SELECT 1 AS "turnedUp"').includes('turnedUp'));
check('and the two are not confused',
  !aliasesIn('SELECT 1 AS turnedUp').includes('turnedUp'));
check('fields are read out of a type',
  fieldsIn('export type X = {\n  aField: string;\n  b: number;\n};', 'X').join() === 'aField,b');

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
