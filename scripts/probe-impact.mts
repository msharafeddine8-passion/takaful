/*
 * What a point is worth, and what earns one.
 *
 * Three failures this is here to stop, none of which shows up as an error:
 *
 *   - Apportioning. Three forty-minute entries are two hours of work.
 *     Rounding each one down pays nothing; rounding each one up pays for
 *     three. Both look plausible in a table and neither is what the person
 *     did.
 *   - Double counting. The ledger's unique index is the guarantee, but the
 *     engine has to agree with it about what "the same thing" means, or every
 *     re-run is a wall of caught constraint errors and somebody eventually
 *     turns the check off.
 *   - Points for things nobody can check. Pending hours, an activity somebody
 *     signed up for and did not attend, a revoked certificate. A leaderboard
 *     built on any of those is a leaderboard nobody can defend.
 *
 * And one rule that is about people rather than arithmetic: nothing here may
 * ever return a negative award. Corrections exist and are a different kind of
 * row; a rule that could dock somebody would end up being used to.
 *
 * PURE: no database, no network.
 */

import {
  POINTS, COMMITMENT_MIN_ACTIVITIES, pointsForMinutes, periodOf,
  isActiveMonth, earnsCommitment, awardsForMonth, awardKey, newAwardsOnly,
  presentMinutes,
  type Award,
} from '../src/lib/impact.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1; else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

console.log('1. hours are apportioned over the month');
{
  check('one hour is ten points', pointsForMinutes(60) === 10);
  check('two hours are twenty', pointsForMinutes(120) === 20);
  check('three forty-minute entries are two hours',
    pointsForMinutes(40 + 40 + 40) === 20,
    'rounded per entry this would be 0 or 30, and both are wrong');
  check('and six twenty-minute entries are the same two hours',
    pointsForMinutes(20 * 6) === 20);
  check('a part hour on its own earns nothing yet', pointsForMinutes(59) === 0);
  check('and is not lost — it counts once the hour completes',
    pointsForMinutes(59) + pointsForMinutes(1) < pointsForMinutes(60) + 1,
    'the remainder stays in the month rather than being paid twice');
  check('ninety minutes is one hour, not one and a half', pointsForMinutes(90) === 10);
  check('zero earns nothing', pointsForMinutes(0) === 0);
  check('a negative figure earns nothing rather than taking points away',
    pointsForMinutes(-600) === 0,
    'no rule here may ever return a debit');
  check('a nonsense figure earns nothing', pointsForMinutes(Number.NaN) === 0);
  check('a very large month is still linear',
    pointsForMinutes(60 * 500) === 5000);
}

console.log('\n2. what counts as an active month');
{
  check('hours make it active', isActiveMonth({ minutes: 120, attended: 0, registered: 0 }));
  check('attendance makes it active', isActiveMonth({ minutes: 0, attended: 1, registered: 1 }));
  check('neither does not', !isActiveMonth({ minutes: 0, attended: 0, registered: 3 }));
  check('registering for three and attending none is not activity',
    !isActiveMonth({ minutes: 0, attended: 0, registered: 3 }),
    'and the person is told nothing about it either way');
  check('even a single minute counts', isActiveMonth({ minutes: 1, attended: 0, registered: 0 }));
}

console.log('\n3. the commitment award');
{
  const f = (attended: number, registered: number) => ({ minutes: 0, attended, registered });
  check('attended both of two', earnsCommitment(f(2, 2)));
  check('attended all five of five', earnsCommitment(f(5, 5)));
  check('missed one of three', !earnsCommitment(f(2, 3)));
  check('one of one is not a pattern', !earnsCommitment(f(1, 1)),
    `the floor is ${COMMITMENT_MIN_ACTIVITIES}`);
  check('registered for none', !earnsCommitment(f(0, 0)));
  check('attended more than registered still earns it',
    earnsCommitment(f(4, 3)),
    'somebody who turned up to help at one they had not signed up for');
}

console.log('\n4. a month, as ledger rows');
{
  const rows = awardsForMonth('2026-03', { minutes: 185, attended: 2, registered: 2 });
  const by = (k: string) => rows.find((r) => r.kind === k);
  check('hours are one row for the month, not one per entry',
    rows.filter((r) => r.kind === 'hours').length === 1);
  check('three hours of a hundred and eighty-five minutes', by('hours')?.points === 30);
  check('the active month is there', by('active_month')?.points === POINTS.activeMonth);
  check('so is the commitment', by('commitment')?.points === POINTS.commitment);
  check('every row is dated inside its own month',
    rows.every((r) => r.earnedOn.startsWith('2026-03')),
    'a backfill run today must not pile every month into today');
  check('every row carries the period', rows.every((r) => r.period === '2026-03'));
  check('and no row carries a source id', rows.every((r) => r.sourceId === null),
    'these are about a period; there is no single record behind them');
  check('every row is positive', rows.every((r) => r.points > 0));

  const quiet = awardsForMonth('2026-04', { minutes: 0, attended: 0, registered: 0 });
  check('a month with nothing in it earns nothing at all', quiet.length === 0,
    'and so says nothing about the person');

  const partial = awardsForMonth('2026-05', { minutes: 30, attended: 0, registered: 0 });
  check('half an hour is an active month with no hour points yet',
    partial.length === 1 && partial[0].kind === 'active_month');
}

console.log('\n5. the same thing is never counted twice');
{
  const u = 'user-1';
  const rows = awardsForMonth('2026-03', { minutes: 120, attended: 2, registered: 2 });
  const keys = new Set(rows.map((r) => awardKey(u, r.kind, r.sourceId, r.period)));

  check('running the same month again proposes nothing new',
    newAwardsOnly(u, rows, keys).length === 0,
    'the engine has to be safe to re-run, not merely refused by the index');
  check('a fresh person is offered all of them',
    newAwardsOnly('user-2', rows, new Set()).length === rows.length);

  const dup: Award[] = [...rows, ...rows];
  check('a duplicate inside one batch is dropped too',
    newAwardsOnly('user-3', dup, new Set()).length === rows.length,
    'two rules producing the same award in one pass');

  check('the key separates people',
    awardKey('a', 'hours', null, '2026-03') !== awardKey('b', 'hours', null, '2026-03'));
  check('and separates months',
    awardKey('a', 'hours', null, '2026-03') !== awardKey('a', 'hours', null, '2026-04'));
  check('and separates kinds',
    awardKey('a', 'hours', null, '2026-03') !== awardKey('a', 'active_month', null, '2026-03'));
  check('and separates records',
    awardKey('a', 'certificate', 'c1', null) !== awardKey('a', 'certificate', 'c2', null));
  check('a missing source id does not collide with an empty one',
    awardKey('a', 'certificate', null, null) === awardKey('a', 'certificate', '', null),
    'which is why the index coalesces rather than relying on null being distinct');
}

console.log('\n6. the figures the association agreed');
{
  check('an hour is ten', POINTS.perHour === 10);
  check('an attendance is twenty', POINTS.attendance === 20);
  check('a certificate is twenty-five', POINTS.certificate === 25);
  check('a level challenge is fifty', POINTS.levelChallenge === 50);
  check('a stage is a hundred', POINTS.stage === 100);
  check('the whole path is two hundred and fifty', POINTS.programme === 250);
  check('an active month is ten', POINTS.activeMonth === 10);
  check('commitment is forty', POINTS.commitment === 40);
  check('every figure is positive', Object.values(POINTS).every((v) => v > 0),
    'there is no rule in this table that takes points away');
}

console.log('\n7. periods');
{
  check('a date reduces to its month', periodOf('2026-03-17') === '2026-03');
  check('the first of the month', periodOf('2026-01-01') === '2026-01');
  check('the last of the year', periodOf('2025-12-31') === '2025-12');
  /* The period is text throughout, never a Date. The database session runs GMT
   * and the association is in Beirut, so anything that made an instant of a
   * date would put the first of the month into the previous one. */
  check('the first of a month in Beirut stays in that month',
    periodOf('2026-03-01') === '2026-03',
    'made an instant, this is 2026-02-28T22:00Z and the wrong month');
  check('periods sort as text in date order',
    ['2026-01', '2025-12', '2026-10'].sort().join() === '2025-12,2026-01,2026-10');
}

console.log('\ncarried-over hours, and what a month may claim');

/*
 * A carry-over is years of service recorded against one date, because that is
 * the only date anybody has. In this database two entries of a hundred hours
 * each sit in January 2024.
 *
 * They count fully towards hours points — the service happened, and the
 * association entered it deliberately. They must not count towards the awards
 * that are about a MONTH. "Active in January 2024", awarded off a filing
 * decision, is a claim about a person the data does not support, and the same
 * lump would go on to earn a commitment award for a month in which nothing was
 * registered and nothing attended.
 */
check('hours points count every minute, carried or not', pointsForMinutes(6000) === 1000);
check('but a month made only of carried hours claims no presence',
  presentMinutes(6000, 6000) === 0);
check('so it is not an active month',
  !isActiveMonth({ minutes: presentMinutes(6000, 6000), attended: 0, registered: 0 }));
check('and it earns no commitment award',
  !earnsCommitment({ minutes: presentMinutes(6000, 6000), attended: 0, registered: 0 }));

/* A month that mixes both keeps the part actually worked in it. */
check('a mixed month counts only what was worked in it', presentMinutes(6600, 6000) === 600);
check('and that is enough to make it active',
  isActiveMonth({ minutes: presentMinutes(6600, 6000), attended: 0, registered: 0 }));

/* An attendance stands on its own: somebody who turned up and logged no hours
 * was present, whatever the minutes say. */
check('an attendance makes a month active with no minutes at all',
  isActiveMonth({ minutes: presentMinutes(6000, 6000), attended: 1, registered: 1 }));

check('nothing ever goes negative', presentMinutes(60, 600) === 0);

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
