/*
 * The impact boards — the rules a ranking of real people has to keep.
 *
 * A leaderboard is the page in this platform most likely to hurt somebody, and
 * every way it could do so is quiet. Nothing below shows up as an error: a
 * board that leaked a last place would render beautifully, and a board that
 * silently listed somebody who opted out would look exactly like one that did
 * not. So these are held as facts about the functions rather than as a look.
 *
 *   1. CONSENT DECIDES WHO IS LISTED. lib/visibility.ts is asked, and its
 *      answer is obeyed: silence is a no, a minor is protected whatever they
 *      chose, and an age the association does not hold is treated as a child.
 *      Checked here as well as in probe-visibility, because that probe proves
 *      the module is right and this one proves the board is asking it.
 *
 *   2. OPTING OUT IS NOT OPTING OUT OF KNOWING. Somebody who declined to be
 *      listed is absent from every list and still gets their own position,
 *      their own figure and the distance to tenth.
 *
 *   3. THERE IS NO LAST PLACE, and not as a matter of rendering: the returned
 *      shape has nowhere to put one, and the output is provably unchanged by
 *      adding people below the cut. If a board cannot tell how many people are
 *      behind it, no template can print it.
 *
 *   4. EQUAL FIGURES ARE EQUAL. Competition ranks, a word on every shared
 *      rank, and a tie is never cut in half to make the list ten rows long.
 *
 *   5. EVERY BOUNDARY IS TEXT. The windows are computed by integer arithmetic
 *      from YYYY-MM-DD and compared as strings. The database session runs GMT
 *      and the association is in Beirut, so a date made into an instant is the
 *      previous day after ten in the evening — which moves a Sunday's work
 *      into the week before and a first of January into last year.
 *
 * PURE. No database, no server. Everything below is either a call into
 * lib/leaderboard.ts or a fact read off a source file, so it cannot be fooled
 * by whatever happens to be in a database on the day it runs.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  BOARD_KINDS, BOARD_SIZE, RELIABILITY_MIN, RISING_MONTHS, WINDOW_KINDS,
  buildBoard, buildBoards, figureFor, monthsBefore, parseWindow, weekStart,
  windowFor, withinWindow,
  type BoardKind, type LeaderboardRow, type WindowKind,
} from '../src/lib/leaderboard.ts';
import { leaderboardAr, leaderboardEn } from '../src/lib/dictionaries/leaderboard.ts';

let ok = 0;
const holes: string[] = [];

function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1;
  else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}
/** `note` explains WHY the wanted value is the wanted one. Shown either way. */
const eq = (what: string, got: unknown, want: unknown, note = '') => {
  const same = JSON.stringify(got) === JSON.stringify(want);
  check(what, same, same ? note : `got ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`);
};

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p: string) => readFileSync(`${ROOT}${p}`, 'utf8');

/*
 * A file with its comments taken out.
 *
 * Every assertion made against source below is about what the code DOES, and
 * this module explains itself at length: the comment warning that a Date is
 * never to be constructed contains the words `new Date`. Reading the prose
 * alongside the code makes a probe that fails hardest on the file documented
 * best.
 */
const strip = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

/** A Monday, so the week boundary can be checked from both sides of it. */
const TODAY = '2026-08-24';
/** Comfortably an adult on TODAY, and comfortably a child. */
const ADULT_DOB = '1996-01-01';
const CHILD_DOB = '2011-03-15';

function person(over: Partial<LeaderboardRow> & { id: string }): LeaderboardRow {
  /* Built as a variable and then spread over, rather than as one literal with
   * `id` in it twice: TypeScript refuses the second form outright. */
  const base: LeaderboardRow = {
    id: over.id,
    full_name: over.id,
    display_name: null,
    public_visibility: 'name_and_photo',
    sensitive_dob: ADULT_DOB,
    safeguarding_dob: null,
    roster_dob: null,
    joined_on: '2019-05-01',
    photo_version: null,
    minutes: 0,
    attended: 0,
    certificates: 0,
    resolved: 0,
    turnedUp: 0,
    points: 0,
  };
  return { ...base, ...over };
}

/** A line of people on the overall board, most points first. */
const byPoints = (points: readonly number[], from = 0) =>
  points.map((p, i) => person({ id: `P${String(from + i).padStart(2, '0')}`, points: p }));

const overall = (rows: readonly LeaderboardRow[], viewerId = '') =>
  buildBoard({ rows, board: 'overall', viewerId, today: TODAY });

/* ------------------------------------------------- 1. windows and calendars */

console.log('1. the windows are Beirut calendar boundaries, computed as text');
{
  eq('a Monday is its own week start', weekStart('2026-08-24'), '2026-08-24');
  eq('the Sunday before belongs to the previous week', weekStart('2026-08-23'), '2026-08-17',
    'the association works Monday to Friday; a Sunday is the end of the week behind you');
  eq('the week may start in the previous year', weekStart('2026-01-01'), '2025-12-29',
    'a Thursday the 1st; a week that could not cross the year would start on the 1st');

  eq('this month runs from the first', windowFor('month', TODAY).from, '2026-08-01');
  eq('this year runs from January', windowFor('year', TODAY).from, '2026-01-01');
  eq('the last three months are the same day, three months back',
    windowFor('quarter', TODAY).from, '2026-05-24');
  eq('all time has no start', windowFor('all', TODAY).from, null);

  /* The clamping cases. "Three months before 31 May" is 31 February, which
   * does not exist, and a naive subtraction of days lands on a different day
   * of the month every quarter. */
  eq('a 31st clamps to the short month', monthsBefore('2026-05-31', 3), '2026-02-28');
  eq('and to the leap day in a leap year', monthsBefore('2028-05-31', 3), '2028-02-29');
  eq('months roll back over the year end', monthsBefore('2026-01-15', 3), '2025-10-15');

  eq('every window ends today, never at the end of the period',
    WINDOW_KINDS.map((k) => windowFor(k, TODAY).to),
    WINDOW_KINDS.map(() => TODAY),
    'hours may be logged for tomorrow, and work not yet done must not place anybody');

  const w = windowFor('month', TODAY);
  check('the first day of the window is inside it', withinWindow('2026-08-01', w));
  check('today is inside it', withinWindow(TODAY, w));
  check('the day before the window is outside', !withinWindow('2026-07-31', w));
  check('a day after today is outside', !withinWindow('2026-08-25', w));
  check('all time reaches back indefinitely',
    withinWindow('2014-02-03', windowFor('all', TODAY)));
  check('a timestamp is refused rather than trimmed',
    !withinWindow('2026-08-10T21:30:00Z', w),
    'trimmed to ten characters a GMT evening timestamp is the wrong Beirut day');

  eq('the first of a month is in that month, not the one before',
    withinWindow('2026-03-01', windowFor('month', '2026-03-01')), true,
    'as an instant this is 2026-02-28T22:00Z, and the month boundary would move');

  eq('an unknown period falls back to the default', parseWindow('last-fortnight'), 'month');
  eq('and so does a missing one', parseWindow(undefined), 'month');
  eq('a real period survives', parseWindow('year'), 'year');

  const source = strip(read('src/lib/leaderboard.ts'));
  check('the module never constructs a Date', !/new\s+Date|Date\.(UTC|parse|now)/.test(source),
    'one Date is all it takes to read a Beirut boundary in GMT');
  check('and never asks a clock', !/Intl\.|process\.|Math\.random/.test(source),
    'today is passed in, so every rule here is testable without one');
}

/* --------------------------------------------------------------- 2. consent */

console.log('\n2. nobody is listed without consent, and visibility.ts decides');
{
  const rows = [
    person({ id: 'A-open', points: 100 }),
    person({ id: 'B-silent', points: 90, public_visibility: null }),
    person({ id: 'C-hidden', points: 80, public_visibility: 'hidden' }),
    person({ id: 'D-child', points: 70, sensitive_dob: CHILD_DOB }),
    person({ id: 'E-unknown-age', points: 60, sensitive_dob: null }),
    person({
      id: 'F-chosen-name', points: 50,
      public_visibility: 'display_name', display_name: 'Abu Khalid',
    }),
    person({ id: 'G-no-display-name', points: 40, public_visibility: 'display_name' }),
  ];
  const board = overall(rows);
  const listed = board.entries.map((e) => e.name);

  eq('only the people who agreed are listed', listed, ['A-open', 'Abu Khalid']);
  check('silence is a no', !listed.includes('B-silent'));
  check('an explicit no is a no', !listed.includes('C-hidden'));
  check('a minor is not listed whatever they chose', !listed.includes('D-child'));
  check('an age the association does not hold is protected',
    !listed.includes('E-unknown-age'),
    'a volunteer asking why costs less than a child on a ranking');
  check('a chosen name is never swapped for a legal one',
    !listed.includes('G-no-display-name'),
    'falling back to the full name would break the promise the setting made');
  eq('a photograph needs both the choice and a file on record',
    board.entries.map((e) => e.photo), [false, false],
    'nobody in this fixture has a photo_version');

  const withPhoto = overall([
    person({ id: 'H', points: 10, photo_version: 'v7' }),
    person({ id: 'I', points: 9, photo_version: 'v3', public_visibility: 'display_name', display_name: 'Umm Sara' }),
  ]);
  eq('the photo travels only with the full-name choice',
    withPhoto.entries.map((e) => [e.name, e.photo, e.photoVersion]),
    [['H', true, 'v7'], ['Umm Sara', false, null]],
    'display_name is consent to a name and not to a face');

  /* The ranks a reader sees must have no gaps, because a gap is a person. */
  eq('the shown ranks are contiguous despite six refusals',
    board.entries.map((e) => e.rank), [1, 2],
    'ranking against everybody would leave holes at the positions of the hidden');
}

/* ------------------------------------------------------------------ 3. ties */

console.log('\n3. equal figures hold equal positions');
{
  const board = overall(byPoints([50, 40, 40, 30]));
  eq('equal figures share a rank', board.entries.map((e) => e.rank), [1, 2, 2, 4]);
  eq('the rank after a pair skips one', board.entries[3].rank, 4,
    'competition ranking: two people held second, so nobody held third');
  eq('every member of a tie is told it is one',
    board.entries.map((e) => e.tied), [false, true, true, false]);

  const named = buildBoard({
    rows: [
      person({ id: 'Z', full_name: 'Zayn', points: 40 }),
      person({ id: 'A', full_name: 'Adnan', points: 40 }),
      person({ id: 'M', full_name: 'Mona', points: 40 }),
    ],
    board: 'overall', viewerId: '', today: TODAY,
  });
  eq('a tie is ordered alphabetically, not by whatever the query returned',
    named.entries.map((e) => e.name), ['Adnan', 'Mona', 'Zayn'],
    'rows have to be printed one above another; a stable neutral order is the least it can mean');
  eq('and all of them still hold the same rank', named.entries.map((e) => e.rank), [1, 1, 1]);
}

/* -------------------------------------------------------------- 4. the ten */

console.log('\n4. ten positions, and a tie is never cut in half');
{
  const twelve = byPoints([120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10]);
  const board = overall(twelve, 'P10');
  eq('ten positions are shown', board.entries.length, BOARD_SIZE);
  eq('and they are ranks one to ten', board.entries.map((e) => e.rank),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  check('the eleventh is not on the list', !board.entries.some((e) => e.id === 'P10'));
  check('no entry ever carries a rank past ten',
    board.entries.every((e) => e.rank <= BOARD_SIZE));

  eq('the eleventh is told their position', board.you?.rank, 11);
  eq('and how far tenth is, in this board unit', board.you?.toTenth, 10,
    'the tenth figure is 30 and theirs is 20');

  const wide = overall([...byPoints([40, 40, 40, 40, 40, 40, 40, 40, 40]),
    ...byPoints([30, 30, 30], 9), ...byPoints([20], 12)], 'P12');
  eq('ten POSITIONS can hold more than ten people', wide.entries.length, 12,
    'nine on rank one and three on rank ten; cutting at ten rows would split the tie');
  eq('and the ranks are still only one and ten',
    [...new Set(wide.entries.map((e) => e.rank))], [1, 10]);
  eq('the next figure is rank thirteen and is not shown', wide.you?.rank, 13);
  eq('the distance is to the smallest figure inside the ten', wide.you?.toTenth, 10);

  const allEqual = overall(byPoints(new Array(14).fill(40)));
  eq('fourteen identical figures are fourteen firsts', allEqual.entries.length, 14);
  check('all of them on rank one', allEqual.entries.every((e) => e.rank === 1 && e.tied));

  const inside = overall(twelve, 'P03');
  eq('somebody already inside the ten is not told a distance', inside.you?.toTenth, null);
  eq('and their own number is the number in the list',
    inside.you?.rank, inside.entries.find((e) => e.id === 'P03')?.rank,
    'two ranking universes would tell a listed reader two different things');
}

/* ------------------------------------------------- 5. seeing your own place */

console.log('\n5. opting out never hides somebody from themselves');
{
  const rows = [
    ...byPoints([100, 90, 80]),
    person({ id: 'quiet', full_name: 'Quiet', points: 85, public_visibility: 'hidden' }),
  ];

  const asStranger = overall(rows, 'P00');
  check('the opted-out person is on nobody else list',
    !asStranger.entries.some((e) => e.id === 'quiet'));
  check('and no entry carries their name',
    !JSON.stringify(asStranger.entries).includes('Quiet'));

  const asThemselves = overall(rows, 'quiet');
  check('but they are still absent from the list they read',
    !asThemselves.entries.some((e) => e.id === 'quiet'),
    'their own row is not printed; their own position is');
  eq('and they are told their real position', asThemselves.you?.rank, 3,
    'eighty-five points sits between the ninety above and the eighty below');
  eq('with their own figure', asThemselves.you?.figure, 85);
  eq('their position leaves a gap only where they are',
    asThemselves.entries.map((e) => e.rank), [1, 2, 4],
    'the one missing number is the reader own, and the page tells them it is');

  eq('their choice changes nobody else numbers',
    overall(rows, 'P02').entries.map((e) => [e.id, e.rank]),
    asStranger.entries.map((e) => [e.id, e.rank]));

  const nothing = overall([...byPoints([100, 90]), person({ id: 'idle', points: 0 })], 'idle');
  eq('somebody with nothing recorded is given no position at all', nothing.you, null,
    'a position of last is the only alternative, and there is no last here');

  eq('a signed-out build invents no reader', overall(byPoints([100, 90])).you, null);
}

/* ------------------------------------------------------- 6. no last place */

console.log('\n6. there is nowhere for a last place to live');
{
  const board = overall(byPoints([100, 90, 80]), 'P02');
  eq('a board has exactly three keys', Object.keys(board).sort(), ['board', 'entries', 'you'],
    'no total, no count, no outOf: nothing to put after «من»');
  eq('an entry has exactly these fields', Object.keys(board.entries[0]).sort(),
    ['figure', 'id', 'isViewer', 'name', 'photo', 'photoVersion', 'rank', 'secondary', 'tied']);
  eq('a standing has exactly these fields', Object.keys(board.you ?? {}).sort(),
    ['figure', 'rank', 'tied', 'toTenth']);

  check('nothing about absences can travel',
    !/absence|absent_count|missed|no_show|rejected|pending|admin_note/i
      .test(JSON.stringify(board)),
    'the reliability rate is rounded and its denominator is dropped before this point');

  /* The strongest form of the rule: the output cannot depend on how many
   * people are below the cut, so it cannot know who is last. */
  const top = byPoints([100, 90, 80, 70, 60, 50, 40, 30, 20, 10]);
  const one = overall([...top, person({ id: 'X', points: 5 })], 'P00');
  const many = overall(
    [...top, ...new Array(60).fill(0).map((_, i) => person({ id: `X${i}`, points: 5 - i * 0.001 }))],
    'P00',
  );
  eq('adding sixty people below the cut changes nothing',
    JSON.stringify(many), JSON.stringify(one),
    'if the board cannot feel them, no template can count them');

  const crowd = overall(
    new Array(137).fill(0).map((_, i) => person({ id: `C${i}`, points: 500 - i })),
    'C000',
  );
  check('the size of the field appears nowhere in the output',
    !JSON.stringify(crowd).includes('137'),
    'a position number plus a field size is a last place with one subtraction');

  const source = strip(read('src/lib/leaderboard.ts'));
  check('the module counts nobody into its result',
    !/(total|outOf|fieldSize|lastPlace|worst)\s*[:=]/.test(source));
  check('and computes no movement between periods',
    !/(previous|delta|change|moved|dropped)\s*[:=]/i.test(source),
    'no wording can say «you dropped» if no arithmetic can produce it');
}

/* ------------------------------------------------------------- 7. the five */

console.log('\n7. each board reads one thing, and reads it honestly');
{
  const row = person({ id: 'one', minutes: 185, attended: 4 });
  eq('activity is ranked on whole hours', figureFor('active', row, TODAY), 3,
    'three hours and five minutes is three hours; the page prints whole hours and must not sort finer');
  const active = buildBoard({ rows: [row], board: 'active', viewerId: '', today: TODAY });
  eq('with the activities beside them, out of the ranking',
    [active.entries[0].figure, active.entries[0].secondary], [3, 4]);
  eq('under an hour is not a position', figureFor('active', person({ id: 'x', minutes: 45 }), TODAY), null);

  eq('learning counts valid certificates',
    figureFor('learning', person({ id: 'x', certificates: 3 }), TODAY), 3);
  eq('and no certificates is no position',
    figureFor('learning', person({ id: 'x', certificates: 0 }), TODAY), null);

  eq('reliability needs enough registrations to mean anything',
    figureFor('reliable', person({ id: 'x', resolved: RELIABILITY_MIN - 1, turnedUp: 9 }), TODAY), null,
    'a perfect rate out of one or two would outrank nineteen of twenty');
  eq('and is a rounded percentage',
    figureFor('reliable', person({ id: 'x', resolved: 19, turnedUp: 17 }), TODAY), 89);
  const reliable = buildBoard({
    rows: [person({ id: 'r', resolved: 19, turnedUp: 17 })],
    board: 'reliable', viewerId: '', today: TODAY,
  });
  eq('and never carries the number it was divided by',
    reliable.entries[0].secondary, null,
    '«89% of 19» is two absences to anybody who can subtract');
  eq('rounding puts near-identical people on the same rank',
    [figureFor('reliable', person({ id: 'a', resolved: 19, turnedUp: 17 }), TODAY),
      figureFor('reliable', person({ id: 'b', resolved: 20, turnedUp: 18 }), TODAY)],
    [89, 90],
    'and where they do coincide the tie rules take over');

  const recent = monthsBefore(TODAY, RISING_MONTHS) as string;
  eq('a rising star joined inside the window',
    figureFor('rising', person({ id: 'x', joined_on: recent, points: 20 }), TODAY), 20);
  eq('one day earlier is not a new face',
    figureFor('rising', person({ id: 'x', joined_on: '2026-02-23', points: 20 }), TODAY), null);
  eq('an unreadable join date is not a new face either',
    figureFor('rising', person({ id: 'x', joined_on: null, points: 20 }), TODAY), null,
    'failing open would put a ten-year volunteer on a board named for newcomers');

  eq('overall reads the ledger', figureFor('overall', person({ id: 'x', points: 42 }), TODAY), 42);
  eq('a net of nothing is not a position',
    figureFor('overall', person({ id: 'x', points: 0 }), TODAY), null);
  eq('and neither is a negative net',
    figureFor('overall', person({ id: 'x', points: -30 }), TODAY), null,
    'reversals exist; a board of people in deficit does not');

  const all = buildBoards({ rows: [person({ id: 'x', points: 5 })], viewerId: 'x', today: TODAY });
  eq('all five boards are built from one read', all.map((b) => b.board), [...BOARD_KINDS]);
  eq('and a reader off a board is told so rather than placed on it',
    all.filter((b) => b.you === null).map((b) => b.board),
    ['active', 'learning', 'reliable', 'rising'],
    'no hours, no certificates, no registrations, and they joined in 2019');
}

/* --------------------------------------------------------- 8. the wording */

console.log('\n8. the strings exist in both languages and differ in both');
{
  type Leaf = Record<string, string>;
  const leaves = (value: unknown, prefix = ''): Leaf => {
    if (typeof value === 'string') return { [prefix]: value };
    const out: Leaf = {};
    if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        Object.assign(out, leaves(v, prefix ? `${prefix}.${k}` : k));
      }
    }
    return out;
  };

  const ar = leaves(leaderboardAr);
  const en = leaves(leaderboardEn);
  eq('both languages hold the same keys at every depth',
    Object.keys(ar).sort(), Object.keys(en).sort());
  check('no string is empty',
    [...Object.values(ar), ...Object.values(en)].every((s) => s.trim().length > 0));
  const same = Object.keys(ar).filter((k) => ar[k] === en[k]);
  eq('no key holds the same literal in both', same, [],
    'an untranslated string is a string somebody forgot, not a coincidence');

  check('every period is named', WINDOW_KINDS.every((k) => Boolean(leaderboardAr.windows[k as WindowKind])));
  check('every board is named and explained',
    BOARD_KINDS.every((k) => Boolean(leaderboardAr.boards[k as BoardKind].title)
      && Boolean(leaderboardEn.boards[k as BoardKind].note)));
  check('every period has its own «موقعك» sentence',
    WINDOW_KINDS.every((k) => leaderboardAr.yourPosition[k as WindowKind].includes('{n}')),
    '«موقعك خلال منذ البداية» is what one shared template produces');
  check('every board unit carries all five Arabic forms',
    BOARD_KINDS.every((k) => {
      const u = leaderboardAr.units[k as BoardKind];
      return Boolean(u.zero && u.one && u.two && u.few && u.many);
    }));

  /*
   * The two explanatory notes are excluded on purpose, and only those two.
   * `privacyNote` and `ties` are the page saying out loud what it refuses to
   * do — «لا تعرض هذه الصفحة مركزاً أخيراً» has to name a last place in order
   * to promise there is none. Every other string is copy that appears beside a
   * person, and none of it may carry that vocabulary at all.
   */
  const spoken = (dict: unknown) =>
    Object.entries(leaves(dict))
      .filter(([k]) => k !== 'privacyNote' && k !== 'ties')
      .map(([, v]) => v)
      .join(' | ');
  const wording = `${spoken(leaderboardAr)} | ${spoken(leaderboardEn)}`;
  check('nothing said beside a person names a bottom',
    !/المركز الأخير|المرتبة الأخيرة|الأضعف|الأسوأ|\blast place\b|\bworst\b|\bweakest\b|\bbottom\b/i
      .test(wording));
  check('and nothing describes a fall',
    !/تراجع|هبط|انخفض|\byou dropped\b|\bfell\b|\bslipped\b/i.test(wording));
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
