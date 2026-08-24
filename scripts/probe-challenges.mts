/*
 * Group challenges: the arithmetic, the month boundary, and the one rule that
 * is not about arithmetic at all.
 *
 * Four failures this is here to stop, none of which shows up as an error:
 *
 *   - A bar past the end, or a bar of NaN. `total / target` is not a
 *     percentage. The target can be zero, the total arrives from a driver that
 *     hands bigints back as strings, and a community that beats its goal would
 *     get a bar drawn half again as wide as the box it sits in. NaN in a width
 *     renders as nothing at all, silently.
 *
 *   - The month boundary. The association is in Beirut and the database
 *     session is GMT. "This month" computed from a GMT clock starts at two in
 *     the morning on the 1st and hands the first two hours of every month to
 *     the month before. Every date here is text and every comparison is a
 *     string comparison, which is the only way that stays true.
 *
 *   - A person made visible. Somebody who contributed nothing must never be
 *     shown to have contributed nothing, and no volunteer's figure may ever
 *     reach another volunteer. The tests below hold both, including the one
 *     that matters most: what a viewer sees of the community is identical
 *     whoever the viewer is.
 *
 *   - A stale bar. Nothing here computes progress from a stored counter — the
 *     shape of these functions is what enforces that, since none of them can
 *     accept anything but a total handed in from the source tables.
 *
 * PURE: no database, no network.
 */

import {
  CHALLENGE_METRICS, METRIC_BASE_UNIT,
  beirutMonthWindow, challengeStatus, daysBetween, daysInMonth, daysRemaining,
  isChallengeMetric, isComplete, isIsoDate, isRunning, ownContribution,
  percentComplete, remainingToTarget, showsOnAccount, targetFromInput,
  toDisplayValue, viewOf,
  type ChallengeFacts,
} from '../src/lib/challenges.ts';
import {
  challengePlural, challengesAr, challengesEn, unitFormsFor,
} from '../src/lib/dictionaries/challenges.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1; else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

/** The association's own example: 500 verified hours in August. */
function challenge(over: Partial<ChallengeFacts> = {}): ChallengeFacts {
  return {
    metric: 'verified_minutes',
    target: 500 * 60,
    startsOn: '2026-08-01',
    endsOn: '2026-08-31',
    isActive: true,
    isArchived: false,
    ...over,
  };
}

console.log('1. the percentage, at both edges');
{
  check('half way is fifty', percentComplete(250, 500) === 50);
  check('reaching the target is a hundred', percentComplete(500, 500) === 100);
  check('beating the target is still a hundred', percentComplete(900, 500) === 100,
    'a bar cannot be drawn 180% of the way across its own box');
  check('beating it enormously is still a hundred', percentComplete(1e9, 500) === 100);
  check('nothing done is nought', percentComplete(0, 500) === 0);

  check('a target of zero is nought, not NaN',
    percentComplete(10, 0) === 0 && Number.isFinite(percentComplete(10, 0)),
    'Infinity and NaN both render as a bar of no width, with no error anywhere');
  check('zero over zero is nought, not NaN', percentComplete(0, 0) === 0);
  check('a negative target is nought', percentComplete(10, -5) === 0);
  check('a negative total is nought, never a negative bar', percentComplete(-40, 500) === 0);

  check('NaN in gives nought out', percentComplete(Number.NaN, 500) === 0);
  check('NaN as the target gives nought out', percentComplete(10, Number.NaN) === 0);
  check('Infinity gives nought out', percentComplete(Number.POSITIVE_INFINITY, 500) === 0,
    'a non-finite total is a broken read, not a completed goal');
  check('every percentage is an integer between 0 and 100',
    [[0, 0], [1, 3], [499, 500], [29_999, 30_000], [-1, 7], [7, -1], [Number.NaN, 3]]
      .every(([t, g]) => {
        const p = percentComplete(t, g);
        return Number.isInteger(p) && p >= 0 && p <= 100;
      }));

  check('just short of the goal never reads as a hundred',
    percentComplete(499 * 60 + 59, 500 * 60) === 99,
    '99.99% of 500 hours is not 500 hours, and rounding up is a small lie a figure never recovers from');
  check('one minute into a 500-hour goal reads as nought, not one',
    percentComplete(1, 500 * 60) === 0);
  check('completion is its own question, not read off the bar',
    isComplete(500, 500) && !isComplete(499, 500));
  check('a zero target is never complete', !isComplete(0, 0),
    'or an empty goal would announce itself reached the moment it was created');
  check('what is left is never negative', remainingToTarget(900, 500) === 0);
  check('what is left is the honest gap', remainingToTarget(120, 500) === 380);
}

console.log('\n2. hours, minutes and the unit the target is kept in');
{
  check('hour_entries stores minutes, so the target does too',
    METRIC_BASE_UNIT.verified_minutes === 'minutes');
  check('the other three are plain counts',
    METRIC_BASE_UNIT.attendances === 'count' &&
    METRIC_BASE_UNIT.certificates === 'count' &&
    METRIC_BASE_UNIT.activities === 'count');
  check('500 typed as hours is stored as 30000 minutes',
    targetFromInput('verified_minutes', 500) === 30_000);
  check('100 typed as certificates is stored as 100',
    targetFromInput('certificates', 100) === 100);
  check('a target of zero is refused', targetFromInput('certificates', 0) === null,
    'a goal of nothing is complete before anybody starts');
  check('a negative target is refused', targetFromInput('verified_minutes', -3) === null);
  check('a nonsense target is refused', targetFromInput('activities', Number.NaN) === null);
  check('29 990 minutes reads as 499 hours, not 500',
    toDisplayValue('verified_minutes', 499 * 60 + 50) === 499,
    'printing 500 beside a bar that is not full contradicts the bar next to it');
  check('30 000 minutes reads as 500 hours',
    toDisplayValue('verified_minutes', 30_000) === 500);
  check('a count is shown as itself', toDisplayValue('activities', 5) === 5);
  check('a negative figure is shown as nought', toDisplayValue('activities', -2) === 0);
}

console.log('\n3. the Beirut month boundary');
{
  const august = beirutMonthWindow('2026-08-19');
  check('a day in August gives the whole of August',
    august?.startsOn === '2026-08-01' && august?.endsOn === '2026-08-31');

  const feb = beirutMonthWindow('2026-02-14');
  check('February in an ordinary year ends on the 28th', feb?.endsOn === '2026-02-28');
  const leap = beirutMonthWindow('2028-02-14');
  check('February in a leap year ends on the 29th', leap?.endsOn === '2028-02-29');
  check('1900 was not a leap year', daysInMonth(1900, 2) === 28);
  check('2000 was', daysInMonth(2000, 2) === 29);

  /* The bug this file exists for. Midnight Beirut on the 1st of August is
   * 21:00 GMT on the 31st of July; a boundary computed from the GMT clock,
   * or from `new Date('2026-08-01')`, puts the first three hours of the month
   * into the month before — so an hour logged just after midnight would count
   * towards a challenge that had already closed. */
  const first = beirutMonthWindow('2026-08-01');
  check('the first of the month in Beirut belongs to that month',
    first?.startsOn === '2026-08-01' && first?.endsOn === '2026-08-31',
    'built as an instant, 2026-08-01 is 2026-07-31T21:00Z and the wrong month');
  const last = beirutMonthWindow('2026-08-31');
  check('and so does the last', last?.startsOn === '2026-08-01' && last?.endsOn === '2026-08-31');
  check('December does not roll into next January',
    beirutMonthWindow('2026-12-31')?.endsOn === '2026-12-31');
  check('January does not reach back into December',
    beirutMonthWindow('2026-01-01')?.startsOn === '2026-01-01');

  check('a window is text, both ends, in the shape the database stores',
    isIsoDate(august!.startsOn) && isIsoDate(august!.endsOn));
  check('nonsense in gives nothing out', beirutMonthWindow('the 1st') === null);
  check('a timestamp is not a date', !isIsoDate('2026-08-01T00:00:00Z'));
  check('the 31st of February is not a date', !isIsoDate('2026-02-31'));
  check('the 13th month is not a date', !isIsoDate('2026-13-01'));

  check('dates sort as text in date order',
    ['2026-10-01', '2026-02-09', '2026-02-10'].sort().join() ===
    '2026-02-09,2026-02-10,2026-10-01',
    'which is what lets every comparison in this feature be a string comparison');
  check('a whole August is 30 days from the 1st to the 31st',
    daysBetween('2026-08-01', '2026-08-31') === 30);
  check('across a month boundary', daysBetween('2026-08-31', '2026-09-01') === 1);
  check('across a year boundary', daysBetween('2025-12-31', '2026-01-01') === 1);
  check('across the leap day', daysBetween('2028-02-28', '2028-03-01') === 2);
  check('backwards is negative', daysBetween('2026-08-31', '2026-08-01') === -30);
}

console.log('\n4. whether a challenge is running, and for how much longer');
{
  const c = challenge();
  check('a day inside the window is running', isRunning(c, '2026-08-19'));
  check('the first day is running', isRunning(c, '2026-08-01'),
    'inclusive at both ends — a challenge that opens tomorrow was never open today');
  check('the last day is running', isRunning(c, '2026-08-31'), 'inclusive at both ends');
  check('the day before is not', !isRunning(c, '2026-07-31'));
  check('the day after is not', !isRunning(c, '2026-09-01'));

  check('before the window it is upcoming', challengeStatus(c, '2026-07-20') === 'upcoming');
  check('after the window it has ended', challengeStatus(c, '2026-09-01') === 'ended');
  check('paused is paused while the window is open',
    challengeStatus(challenge({ isActive: false }), '2026-08-19') === 'paused');
  check('but a paused challenge past its window has ended, not paused',
    challengeStatus(challenge({ isActive: false }), '2026-09-05') === 'ended',
    '"paused" would suggest it might come back');
  check('archived outranks the dates',
    challengeStatus(challenge({ isArchived: true, isActive: false }), '2026-08-19') === 'archived');
  check('an archived challenge never runs',
    !isRunning(challenge({ isArchived: true, isActive: false }), '2026-08-19'));
  check('an unreadable date does not leave a challenge running',
    !isRunning(c, 'today'),
    'a bar nobody can explain is worse than no bar');

  check('mid-month, thirteen days are left including today',
    daysRemaining(c, '2026-08-19') === 13);
  check('the last day reads as one day left, not nought',
    daysRemaining(c, '2026-08-31') === 1,
    'somebody on the last day still has the whole evening');
  check('the day after is nought', daysRemaining(c, '2026-09-01') === 0);
  check('an upcoming challenge counts from its own first day',
    daysRemaining(c, '2026-07-01') === 31,
    'not from today, or a goal opening next month would advertise a length it has not got');
  check('an archived one has no days left',
    daysRemaining(challenge({ isArchived: true, isActive: false }), '2026-08-19') === 0);
  check('a single-day challenge has one day',
    daysRemaining(challenge({ startsOn: '2026-08-19', endsOn: '2026-08-19' }), '2026-08-19') === 1);
  check('days remaining is never negative',
    ['2026-01-01', '2026-08-19', '2027-05-05', 'nonsense']
      .every((d) => daysRemaining(c, d) >= 0));

  check('running and upcoming challenges show on the account',
    showsOnAccount(c, '2026-08-19') && showsOnAccount(c, '2026-07-01'));
  check('an ended one does not', !showsOnAccount(c, '2026-09-02'),
    'a bar nobody can move reads as a task that was missed');
  check('nor does a paused one', !showsOnAccount(challenge({ isActive: false }), '2026-08-19'));
}

console.log('\n5. nobody is shown to have contributed nothing');
{
  check('nothing contributed is null, not zero', ownContribution(0) === null,
    '"you contributed 0 hours" is a sentence this platform must never form');
  check('a negative figure is null', ownContribution(-30) === null);
  check('a nonsense figure is null', ownContribution(Number.NaN) === null);
  check('something contributed comes back', ownContribution(180) === 180);

  const c = challenge();
  const gave = viewOf(c, 12_000, 180, '2026-08-19');
  const none = viewOf(c, 12_000, 0, '2026-08-19');

  check('somebody who gave three hours is told so', gave.yourContribution === 3);
  check('somebody who gave nothing is told nothing at all',
    none.yourContribution === null,
    'there is no branch in the panel that renders for null, so no empty state can shame anybody');
  check('and 40 minutes towards an hours goal is silence, not "0 hours"',
    viewOf(c, 12_000, 40, '2026-08-19').yourContribution === null,
    'a rounded-down zero is the same sentence by another route');

  /* The property that makes the card safe to render at all: everything except
   * the single private line is identical whoever is looking. Two volunteers
   * comparing screens learn nothing about each other. */
  const community = (v: ReturnType<typeof viewOf>) => {
    const { yourContribution: _drop, ...rest } = v;
    return JSON.stringify(rest);
  };
  check('the community half of the card is identical for everybody',
    community(gave) === community(none),
    'no arrangement of these numbers tells one volunteer anything about another');
  check('one person contributing does not move what anybody else sees',
    gave.total === none.total && gave.percent === none.percent);

  const keys = Object.keys(gave);
  check('the card has exactly one field about the viewer',
    keys.filter((k) => /^your/i.test(k)).length === 1);
  check('and no field that could hold somebody else',
    !keys.some((k) => /rank|position|leader|top|contributor|member|user|name|list|others/i.test(k)),
    `fields: ${keys.join(', ')}`);
  check('nothing in a rendered card is a user id',
    !/[0-9a-f]{8}-[0-9a-f]{4}-/i.test(JSON.stringify(gave)));
  check('the whole module exposes no way to ask for more than one person',
    ownContribution.length === 1,
    'it takes a number, not a list — there is nothing here to sort');
}

console.log('\n6. the card a volunteer actually reads');
{
  const c = challenge();
  const v = viewOf(c, 300 * 60, 90, '2026-08-19');
  check('the community total is shown in hours', v.totalDisplay === 300);
  check('the target is shown in hours', v.targetDisplay === 500);
  check('the bar is sixty per cent', v.percent === 60);
  check('the goal is not yet reached', !v.complete);
  check('two hundred hours are still to do', v.remainingDisplay === 200);
  check('thirteen days are left', v.daysLeft === 13);
  check('the viewer gave an hour and is told so', v.yourContribution === 1);

  const done = viewOf(c, 520 * 60, 0, '2026-08-19');
  check('past the goal the bar stops at a hundred', done.percent === 100);
  check('past the goal nothing is still to do', done.remainingDisplay === 0);
  check('past the goal it reads as complete', done.complete);

  const broken = viewOf(challenge({ target: 0 }), Number.NaN, Number.NaN, '2026-08-19');
  check('a broken read produces a card that is merely empty, not NaN',
    broken.percent === 0 && broken.total === 0 && broken.yourContribution === null &&
    Number.isFinite(broken.percent));

  check('every metric the association named is offered',
    CHALLENGE_METRICS.length === 4 &&
    (['verified_minutes', 'attendances', 'certificates', 'activities'] as const)
      .every((m) => CHALLENGE_METRICS.includes(m)),
    'verified hours, confirmed attendance, active certificates, activities run');
  check('the set is closed', !isChallengeMetric('anything_else'),
    'every metric must be backed by a verified fact that already exists');
  check('an empty string is not a metric', !isChallengeMetric(''));
}

console.log('\n7. the words, in both languages');
{
  const flat = (obj: unknown, prefix = '', out: Record<string, string> = {}) => {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (typeof v === 'string') out[`${prefix}${k}`] = v;
      else if (v && typeof v === 'object') flat(v, `${prefix}${k}.`, out);
    }
    return out;
  };
  const ar = flat(challengesAr);
  const en = flat(challengesEn);
  const arKeys = Object.keys(ar).sort();
  const enKeys = Object.keys(en).sort();

  check('the two locales hold exactly the same keys', arKeys.join() === enKeys.join(),
    'a form present in one language and missing from the other is a blank on somebody\'s screen');
  check('no string is empty', [...Object.values(ar), ...Object.values(en)].every((s) => s.trim() !== ''));
  check('no key holds the same literal in both',
    arKeys.filter((k) => ar[k] === en[k]).length === 0,
    'an untranslated string is one somebody forgot');
  /*
   * The sentence must not exist even as a template.
   *
   * Two ways it could creep back in: a personal string carrying a figure of
   * its own, or somebody adding an "empty state" key for the volunteer who
   * gave nothing. Neither is caught by a type — the panel would compile and
   * render — so it is asserted on the words themselves. (The validation
   * messages are exempt by construction: they are about a target a coordinator
   * typed, not about a person, and «أكبر من صفر» is the correct wording there.)
   */
  const personal = Object.entries(ar).concat(Object.entries(en))
    .filter(([k]) => /^your/i.test(k));
  check('the personal strings are labels and carry no figure of their own',
    personal.length === 4 && personal.every(([, s]) => !/\d|صفر|zero|none|nothing/i.test(s)),
    personal.map(([k]) => k).join(', '));
  check('there is no empty state for somebody who gave nothing',
    !arKeys.some((k) => /(none|empty|zero|nothing|missing|inactive)/i.test(k) && /^your|contribut/i.test(k)),
    'the panel has no branch to render for null, and there is no string for one either');

  /* Arabic inflects the counted noun in five bands, English in two. «2 ساعات»
   * and «3 ساعة» are both wrong, and a template with a hole in it cannot be
   * grammatical for every number. */
  check('one hour in Arabic', challengePlural(challengesAr.hours, 1, 'ar') === 'ساعة واحدة');
  check('two hours in Arabic take the dual', challengePlural(challengesAr.hours, 2, 'ar') === 'ساعتان');
  check('three to ten take the plural', challengePlural(challengesAr.hours, 5, 'ar') === '5 ساعات');
  check('eleven and above take the singular again',
    challengePlural(challengesAr.hours, 11, 'ar') === '11 ساعة');
  check('and so does 500', challengePlural(challengesAr.hours, 500, 'ar') === '500 ساعة');
  check('English says one hour', challengePlural(challengesEn.hours, 1, 'en') === '1 hour');
  check('English says two hours', challengePlural(challengesEn.hours, 2, 'en') === '2 hours');
  check('no placeholder survives into the rendered string',
    [1, 2, 3, 11, 100, 500].every((n) =>
      !challengePlural(challengesAr.hours, n, 'ar').includes('{n}') &&
      !challengePlural(challengesEn.hours, n, 'en').includes('{n}')));
  check('every metric has its counted forms in both languages',
    CHALLENGE_METRICS.every((m) =>
      unitFormsFor(challengesAr, m).one !== '' && unitFormsFor(challengesEn, m).one !== ''));
  check('every metric has a name in both languages',
    CHALLENGE_METRICS.every((m) =>
      challengesAr.metrics[m].trim() !== '' && challengesEn.metrics[m].trim() !== ''));
  check('the days-left phrase reads for one, two, a few and many',
    ['بقي يوم واحد', 'بقي يومان', 'بقيت 5 أيام', 'بقي 13 يوماً'].every((expected, i) =>
      challengePlural(challengesAr.daysLeft, [1, 2, 5, 13][i], 'ar') === expected));
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
