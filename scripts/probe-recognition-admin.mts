/*
 * What staff are allowed to do to somebody's badges by hand.
 *
 * The recognition system's whole claim is that a badge means something. Three
 * things can break that claim and all three are decided in recognition-check:
 *
 *   - a reason nobody can review, which makes the audit log a wall of "fix"
 *   - somebody acting on their own record, which proves nothing about them
 *   - a by-hand grant of a code the engine computes, which the next recompute
 *     silently takes back weeks later with a reason from nobody
 *
 * The third is the one worth a probe. It cannot be caught by testing: the grant
 * works, the volunteer is notified, the badge appears, and the withdrawal
 * happens on an unrelated day for an unrelated cause. Only the refusal at the
 * door prevents it, and only this holds the refusal.
 *
 * A PURE probe: no database, no network.
 */

import {
  checkGrant, checkWithdraw, ruleOwns, MIN_REASON,
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

/*
 * Stand-ins for ACHIEVEMENTS.map(d => d.code). The real list cannot be imported
 * — achievements.ts is `server-only` — which is exactly why the check takes the
 * codes as an argument instead of reaching for them. probe-achievements holds
 * the definitions themselves.
 */
const AUTOMATIC = ['first-hour', 'ten-hours', 'fifty-hours', 'first-course'];

const ACTOR = 'actor-0000';
const OTHER = 'person-9999';

const good = (over: Partial<Instruction> = {}): Instruction => ({
  email: 'someone@example.org',
  code: 'office-support-2019',
  reason: 'ساعدت في المكتب ثلاث سنوات قبل وجود المنصة.',
  actorId: ACTOR,
  targetId: OTHER,
  ...over,
});

/* ------------------------------------------------------------------ *
 * 1. What the automatic pass owns
 * ------------------------------------------------------------------ */
console.log('\n1. codes the engine computes');

check('a code in the list is recognised as the engine\'s',
  ruleOwns('ten-hours', AUTOMATIC));
check('a code outside it is not', !ruleOwns('office-support-2019', AUTOMATIC));
check('surrounding space does not smuggle a code past the check',
  ruleOwns('  ten-hours  ', AUTOMATIC));
check('an empty list owns nothing', !ruleOwns('ten-hours', []));

/* ------------------------------------------------------------------ *
 * 2. Granting by hand
 * ------------------------------------------------------------------ */
console.log('\n2. granting');

eq('a well-formed grant to somebody else is allowed',
  checkGrant(good(), AUTOMATIC), null);

/*
 * THE ONE THAT MATTERS.
 *
 * Grant 'ten-hours' by hand to somebody with four hours logged and everything
 * looks right. Then an hour is verified for anybody at all, recomputeAchievements
 * runs over them, finds 240 minutes against a 600-minute threshold, and revokes
 * it with the engine's generic reason. The volunteer is told a badge they were
 * given has been taken away, weeks later, by nobody, for nothing they did.
 */
eq('a code the engine computes cannot be granted by hand',
  checkGrant(good({ code: 'ten-hours' }), AUTOMATIC), 'ruleOwnsIt');
eq('and padding the code does not get round it',
  checkGrant(good({ code: ' ten-hours' }), AUTOMATIC), 'ruleOwnsIt');

eq('a grant with no code is refused',
  checkGrant(good({ code: '   ' }), AUTOMATIC), 'needBoth');
eq('a grant with no email is refused',
  checkGrant(good({ email: '' }), AUTOMATIC), 'needBoth');
eq('a one-word reason is refused',
  checkGrant(good({ reason: 'تصحيح' }), AUTOMATIC), 'needReason');
eq('whitespace is not a reason',
  checkGrant(good({ reason: ' '.repeat(40) }), AUTOMATIC), 'needReason');
eq('a reason exactly at the floor is accepted',
  checkGrant(good({ reason: 'x'.repeat(MIN_REASON) }), AUTOMATIC), null);
eq('one character short is not',
  checkGrant(good({ reason: 'x'.repeat(MIN_REASON - 1) }), AUTOMATIC), 'needReason');
eq('nobody may grant themselves a badge',
  checkGrant(good({ targetId: ACTOR }), AUTOMATIC), 'notYourself');

/*
 * Order matters, and this is the assertion that holds it.
 *
 * `needBoth` and `needReason` are things the person can fix by typing.
 * `ruleOwnsIt` is a refusal of what they are trying to do. Reporting the
 * refusal first would have them correct the reason, press again, and only then
 * be told the whole attempt was never allowed.
 */
eq('a form fault is reported before the deeper refusal',
  checkGrant(good({ code: 'ten-hours', reason: 'لا' }), AUTOMATIC), 'needReason');

/* ------------------------------------------------------------------ *
 * 3. Withdrawing
 * ------------------------------------------------------------------ */
console.log('\n3. withdrawing');

eq('a well-formed withdrawal is allowed', checkWithdraw(good()), null);
eq('withdrawing still needs a reason',
  checkWithdraw(good({ reason: 'خطأ' })), 'needReason');
eq('and still refuses self-action',
  checkWithdraw(good({ targetId: ACTOR })), 'notYourself');

/*
 * Deliberately NOT symmetric with granting.
 *
 * A badge standing on figures that turned out to be wrong has to be
 * correctable, and that is precisely a rule-owned code. If the figures still
 * support it the next recompute restores it — which is the right answer, not a
 * surprise: it means the data says they earned it.
 */
eq('a code the engine computes MAY be withdrawn by hand',
  checkWithdraw(good({ code: 'ten-hours' })), null);

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
