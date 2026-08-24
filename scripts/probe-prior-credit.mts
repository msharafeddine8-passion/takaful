/*
 * Carrying a record forward from before the platform existed.
 *
 * Two staff actions that grant the same standing as an activity attended and
 * an exam sat, without the platform having watched either happen. The rules
 * that decide what gets in are the whole safeguard, and every one of them
 * fails quietly:
 *
 *   - A figure typed in hours where minutes were wanted is sixty times too
 *     big and just looks like a very committed volunteer.
 *   - A year typed as 2205 sails past anything that only asks "is it in the
 *     future" the wrong way round.
 *   - A reason of "ok" satisfies "a reason is required" and tells a reviewer
 *     nothing a year later.
 *
 * And one that would be loud but wrong: comparing a typed date against
 * today's date in GMT. The association is in Beirut, two hours ahead, so
 * between midnight and two in the morning a GMT "today" is yesterday and an
 * entry dated today would be rejected as being in the future.
 *
 * PURE: no database, no network.
 */

import {
  checkCarriedHours, checkRecognition, hoursFromMinutes,
  MAX_CARRIED_MINUTES, FOUNDED_YEAR,
} from '../src/lib/prior-credit.ts';
import { COURSES } from '../src/lib/courses.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1; else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

const TODAY = '2026-08-24';
const good = { hours: '120', upTo: '2026-06-30', note: 'تطوّع ميداني ٢٠٢١–٢٠٢٤، بحسب سجلّات اللجنة' };
const hours = (over: Partial<typeof good> = {}) =>
  checkCarriedHours({ ...good, ...over }, TODAY);
const problem = (r: ReturnType<typeof hours>) => (r.ok ? '(accepted)' : r.problem);

console.log('1. hours that should go in');
{
  const r = hours();
  check('a sound entry is accepted', r.ok);
  check('and hours become minutes', r.ok && r.value.minutes === 7200,
    r.ok ? r.value.minutes : problem(r));
  const half = hours({ hours: '1.5' });
  check('a half hour is ninety minutes', half.ok && half.value.minutes === 90);
  const third = hours({ hours: '0.25' });
  check('a quarter hour rounds to fifteen', third.ok && third.value.minutes === 15);
  const spaced = hours({ hours: '  12  ', note: '  covers 2022  ' });
  check('surrounding space is trimmed', spaced.ok && spaced.value.minutes === 720);
  check('and the note comes back trimmed', spaced.ok && spaced.value.note === 'covers 2022');
  const edge = hours({ hours: String(MAX_CARRIED_MINUTES / 60) });
  check('exactly the ceiling is allowed', edge.ok, problem(edge));
  const today = hours({ upTo: TODAY });
  check('counted up to today is allowed', today.ok, problem(today));
}

console.log('\n2. hours that should not');
{
  check('nothing typed', problem(hours({ hours: '' })) === 'hours-missing');
  check('not a number', problem(hours({ hours: 'كثير' })) === 'hours-not-a-number');
  check('zero', problem(hours({ hours: '0' })) === 'hours-not-positive');
  check('negative', problem(hours({ hours: '-40' })) === 'hours-not-positive');
  check('infinity', problem(hours({ hours: 'Infinity' })) === 'hours-not-a-number');
  check('one over the ceiling',
    problem(hours({ hours: String(MAX_CARRIED_MINUTES / 60 + 1) })) === 'hours-too-many');
  check('a slipped decimal point is caught',
    problem(hours({ hours: '1200000' })) === 'hours-too-many',
    'the failure this ceiling exists for');

  check('no date', problem(hours({ upTo: '' })) === 'date-missing');
  check('a date in the wrong shape', problem(hours({ upTo: '30/06/2026' })) === 'date-malformed');
  check('a date with a time on it', problem(hours({ upTo: '2026-06-30T12:00:00Z' })) === 'date-malformed',
    'a timestamp is not a calendar date, and slicing one is how the wrong day gets stored');
  check('tomorrow', problem(hours({ upTo: '2026-08-25' })) === 'date-future');
  check('a typo of a year', problem(hours({ upTo: '2205-06-30' })) === 'date-future',
    'sails past a check that only looks at the shape');
  check('before the association existed',
    problem(hours({ upTo: `${FOUNDED_YEAR - 1}-06-30` })) === 'date-before-founding');
  check('the founding year itself is allowed', hours({ upTo: `${FOUNDED_YEAR}-01-01` }).ok);

  check('no note', problem(hours({ note: '' })) === 'note-missing');
  check('a note of only spaces', problem(hours({ note: '   ' })) === 'note-missing',
    'a figure with no account of itself is not a record');
}

console.log('\n3. the date is compared as a calendar date');
{
  /*
   * The reason `today` is a parameter. If the action read the date itself in
   * GMT, then at 00:30 in Beirut the GMT date is still yesterday, and an entry
   * a member of staff dated today would come back "in the future".
   */
  const beirutToday = '2026-08-24';
  const gmtWouldSay = '2026-08-23';
  check('today is accepted against a Beirut today',
    checkCarriedHours({ ...good, upTo: beirutToday }, beirutToday).ok);
  check('and would have been refused against a GMT one',
    !checkCarriedHours({ ...good, upTo: beirutToday }, gmtWouldSay).ok,
    'which is what happens between midnight and two in the morning');
  check('the comparison is on text, not on a Date',
    checkCarriedHours({ ...good, upTo: '2026-08-24' }, '2026-08-24').ok
      && !checkCarriedHours({ ...good, upTo: '2026-08-25' }, '2026-08-24').ok);
}

console.log('\n4. recognising a course');
{
  const known = new Set(COURSES.map((c) => c.slug));
  const slug = COURSES[0].slug;
  const note = 'أتمّها في تدريب اللجنة صيف ٢٠٢٣، يشهد المشرف';
  const r = checkRecognition({ slug, note }, known);
  check('a real course with a real reason is accepted', r.ok, r.ok ? '' : r.problem);
  check('and comes back trimmed',
    checkRecognition({ slug: ` ${slug} `, note: ` ${note} ` }, known).ok);

  const p = (i: { slug: string; note: string }) => {
    const x = checkRecognition(i, known);
    return x.ok ? '(accepted)' : x.problem;
  };
  check('no course chosen', p({ slug: '', note }) === 'course-missing');
  check('a course that does not exist', p({ slug: 'not-a-course', note }) === 'course-unknown',
    'a certificate pointing at a page that does not exist');
  check('no reason', p({ slug, note: '' }) === 'note-missing');
  check('a reason of one word', p({ slug, note: 'تمام' }) === 'note-too-short',
    'this is the one place a pass is granted with no paper sat');
  check('a reason of spaces', p({ slug, note: '          ' }) === 'note-missing');
  check('ten characters is the line', p({ slug, note: '1234567890' }) === '(accepted)');
  check('nine is not', p({ slug, note: '123456789' }) === 'note-too-short');

  check('every real course slug is accepted',
    COURSES.every((c) => checkRecognition({ slug: c.slug, note }, known).ok),
    `${COURSES.length} courses`);
}

console.log('\n5. minutes read back as hours');
{
  check('a whole hour', hoursFromMinutes(60) === '1', hoursFromMinutes(60));
  check('two hours', hoursFromMinutes(120) === '2');
  check('an hour and a half', hoursFromMinutes(90) === '1.5', hoursFromMinutes(90));
  check('a quarter hour', hoursFromMinutes(15) === '0.25', hoursFromMinutes(15));
  check('a large figure keeps no trailing zeros', hoursFromMinutes(7200) === '120');
  check('zero', hoursFromMinutes(0) === '0');
  /* The round trip is what matters: a figure typed, saved, and shown back for
   * correction has to be the same figure. */
  check('a typed figure survives the round trip',
    ['1', '2.5', '120', '0.5'].every((h) => {
      const r = checkCarriedHours({ ...good, hours: h }, TODAY);
      return r.ok && hoursFromMinutes(r.value.minutes) === h;
    }));
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
