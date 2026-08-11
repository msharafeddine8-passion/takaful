/**
 * The CSV writer.
 *
 * Pure functions, so no database. These are the failures that only show up
 * after the file has been sent to someone: a name that Excel treats as a
 * formula, a note with a comma in it that shifts every later column, Arabic
 * that arrives as mojibake.
 */
import { toCsv, csvFilename } from '../src/lib/csv.ts';

let holes = 0,
  confirmed = 0;
function check(label: string, ok: boolean, detail: unknown = '') {
  if (!ok) holes += 1;
  else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail === '' ? '' : '  — ' + JSON.stringify(detail)}`);
}

console.log('\n--- shape ---');
const basic = toCsv(['a', 'b'], [[1, 2], [3, 4]]);
check('rows are separated by CRLF', basic.includes('1,2\r\n3,4'));
check('the file ends with a newline', basic.endsWith('\r\n'));
check(
  'it starts with a byte order mark, or Excel guesses the encoding and mangles Arabic',
  basic.charCodeAt(0) === 0xfeff,
  basic.charCodeAt(0).toString(16),
);

console.log('\n--- values that would break the file ---');
const tricky = toCsv(
  ['name', 'note'],
  [
    ['محمد, أحمد', 'قال: "نعم"'],
    ['line\nbreak', 'semi;colon'],
  ],
);
check('a comma inside a value is quoted', tricky.includes('"محمد, أحمد"'));
check('a quote inside a value is doubled', tricky.includes('"قال: ""نعم"""'));
check('a newline inside a value is quoted', tricky.includes('"line\nbreak"'));
check('a semicolon is quoted too, for locales that split on it', tricky.includes('"semi;colon"'));

console.log('\n--- values that would run ---');
for (const dangerous of ['=1+1', '+44 71 000000', '-5', '@SUM(A1)', '\t=cmd']) {
  const out = toCsv(['x'], [[dangerous]]);
  check(
    `a cell starting with ${JSON.stringify(dangerous[0])} is neutralised`,
    out.includes(`'${dangerous}`) || out.includes(`"'${dangerous}`),
    out.split('\r\n')[1],
  );
}
check(
  'an ordinary value is left completely alone',
  toCsv(['x'], [['Ahmad Khalil']]).includes('\r\nAhmad Khalil\r\n'),
);
check(
  'a phone number written without a leading plus is not mangled',
  toCsv(['x'], [['71000000']]).includes('\r\n71000000\r\n'),
);

console.log('\n--- empties and types ---');
const mixed = toCsv(['a', 'b', 'c', 'd'], [[null, undefined, 0, false]]);
check('null and undefined become empty cells', mixed.includes('\r\n,,0,false'), mixed.split('\r\n')[1]);
check(
  'a date is written as a plain day, not a timestamp nobody can sort',
  toCsv(['d'], [[new Date('2026-08-11T14:30:00Z')]]).includes('2026-08-11'),
);

console.log('\n--- the filename ---');
const name = csvFilename('takaful-members', new Date('2026-08-11T00:00:00Z'));
check('it says what and when', name === 'takaful-members-2026-08-11.csv', name);
check(
  'anything that could escape a directory is stripped',
  csvFilename('../../etc/passwd', new Date('2026-08-11T00:00:00Z')) === '------etc-passwd-2026-08-11.csv',
  csvFilename('../../etc/passwd', new Date('2026-08-11T00:00:00Z')),
);
check(
  'and so is a quote that would break the Content-Disposition header',
  !csvFilename('a"b', new Date('2026-08-11T00:00:00Z')).includes('"'),
);

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
