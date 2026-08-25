/*
 * What staff are allowed to do to somebody's badges by hand.
 *
 * The recognition system's whole claim is that a badge means something. Three
 * things can break that claim and all three are decided in recognition-check:
 *
 *   - a reason nobody can review, which makes the audit log a wall of "fix"
 *   - somebody acting on their own record, which proves nothing about them
 *   - acting on nobody, or on nothing, which writes a row that explains itself
 *     to no one
 *
 * A FOURTH RULE USED TO LIVE HERE AND IS DELIBERATELY GONE.
 *
 * Granting by hand a badge the engine also computes was refused, because the
 * next recompute would find the figure short and withdraw it — silently, weeks
 * later, with a generic reason and no named person behind it. That refusal also
 * stopped the association doing something it legitimately needs to do: honour
 * work that predates the platform.
 *
 * So the fix moved to the root. recomputeAchievements now skips any badge a
 * person granted, which makes a hand-granted badge stable whatever the figures
 * say, and the refusal is no longer needed. The assertions below hold the new
 * arrangement; probe-badge-circulation holds the engine's half.
 *
 * A PURE probe: no database, no network.
 */

import {
  checkGrant, checkWithdraw, codesFrom, MIN_REASON,
  type Instruction,
} from '../src/lib/recognition-check.ts';

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

const ACTOR = 'actor-0000';
const OTHER = 'person-9999';

const good = (over: Partial<Instruction> = {}): Instruction => ({
  targetId: OTHER,
  codes: ['first-hour'],
  reason: 'ساعد في المكتب ثلاث سنوات قبل وجود المنصة.',
  actorId: ACTOR,
  ...over,
});

/* ------------------------------------------------------------------ *
 * 1. Granting by hand
 * ------------------------------------------------------------------ */
console.log('\n1. granting');

eq('a well-formed grant to somebody else is allowed', checkGrant(good()), null);

/*
 * The rule that replaced the old refusal. A badge the engine computes may now
 * be given by hand — that is the point of the change — and it is safe because
 * the engine leaves manual rows alone. If this ever starts refusing again,
 * either somebody reinstated the guard or the engine stopped honouring manual
 * grants, and both are worth stopping the build for.
 */
eq('a badge the engine computes may be granted by hand',
  checkGrant(good({ codes: ['fifty-hours'] })), null);

eq('several badges at once are allowed',
  checkGrant(good({ codes: ['first-hour', 'ten-hours', 'first-course'] })), null);

eq('a grant with nobody chosen is refused',
  checkGrant(good({ targetId: '' })), 'needPerson');
eq('and whitespace is not a person',
  checkGrant(good({ targetId: '   ' })), 'needPerson');
eq('a grant with no badge ticked is refused',
  checkGrant(good({ codes: [] })), 'needBadge');
/* A hand-built request can post an empty string where a checkbox posts
 * nothing. A badge with an empty code would be a row nothing can explain. */
eq('a blank code does not count as a badge',
  checkGrant(good({ codes: ['', '  '] })), 'needBadge');

eq('a one-word reason is refused',
  checkGrant(good({ reason: 'تصحيح' })), 'needReason');
eq('whitespace is not a reason',
  checkGrant(good({ reason: ' '.repeat(40) })), 'needReason');
eq('a reason exactly at the floor is accepted',
  checkGrant(good({ reason: 'x'.repeat(MIN_REASON) })), null);
eq('one character short is not',
  checkGrant(good({ reason: 'x'.repeat(MIN_REASON - 1) })), 'needReason');
eq('nobody may grant themselves a badge',
  checkGrant(good({ targetId: ACTOR })), 'notYourself');

/*
 * Order matters. Refusing "you picked nobody" before "your reason is short"
 * means the person fixes the thing that actually blocked them first, rather
 * than correcting the reason and being refused again for a different cause.
 */
eq('the missing person is reported before the short reason',
  checkGrant(good({ targetId: '', reason: 'لا' })), 'needPerson');
eq('and the missing badge before the short reason',
  checkGrant(good({ codes: [], reason: 'لا' })), 'needBadge');

/* ------------------------------------------------------------------ *
 * 2. Withdrawing
 * ------------------------------------------------------------------ */
console.log('\n2. withdrawing');

eq('a well-formed withdrawal is allowed', checkWithdraw(good()), null);
eq('withdrawing still needs a reason',
  checkWithdraw(good({ reason: 'خطأ' })), 'needReason');
eq('and still refuses self-action',
  checkWithdraw(good({ targetId: ACTOR })), 'notYourself');
eq('and still needs at least one badge',
  checkWithdraw(good({ codes: [] })), 'needBadge');
eq('a badge the engine computes may be withdrawn by hand',
  checkWithdraw(good({ codes: ['fifty-hours'] })), null);

/* ------------------------------------------------------------------ *
 * 3. The codes that actually get acted on
 * ------------------------------------------------------------------ */
console.log('\n3. cleaning the chosen codes');

eq('blanks are dropped', codesFrom(['first-hour', '', '  ']).join(), 'first-hour');
eq('surrounding space is trimmed', codesFrom(['  ten-hours  ']).join(), 'ten-hours');
/* A form can post the same value twice. Granting one badge twice in a request
 * would either fail on the unique index or write two audit lines for one
 * decision, and neither is what the person did. */
eq('a code posted twice is acted on once',
  codesFrom(['ten-hours', 'ten-hours']).join(), 'ten-hours');
eq('order is preserved', codesFrom(['b', 'a', 'b']).join(), 'b,a');
eq('nothing in, nothing out', codesFrom([]).length, 0);

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
