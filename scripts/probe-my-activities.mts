/*
 * Four different things that were reading as one on /account/activities.
 *
 * Registered, attended, called off by the association and withdrawn by the
 * volunteer are four separate facts, and the page used to collapse them into
 * two words. The worst of the collapses had a person in it: an activity the
 * association cancelled sat in the "past" list under «لم تحضر», telling a
 * volunteer they had failed to turn up to something that never took place.
 *
 * The ordering that prevents it is one function, and this holds the ordering —
 * particularly the first rule, that a cancellation outranks whatever is on the
 * attendance sheet, which is exactly the kind of thing a later hand reorders
 * while tidying.
 *
 * A PURE probe: no database, no network.
 *
 *   npx tsx scripts/probe-my-activities.mts
 */

import {
  registrationOutcome, alsoWithdrew, groupOf, canWithdraw, OUTCOME_TONE,
  type RegistrationFacts, type RegistrationOutcome,
} from '../src/lib/registration-view.ts';
import { ar } from '../src/lib/dictionaries/ar.ts';
import { en } from '../src/lib/dictionaries/en.ts';

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

/** A fixed "now", so the probe reads the same on any day. */
const NOW = Date.parse('2026-08-25T12:00:00Z');
const YESTERDAY = '2026-08-24T12:00:00Z';
const TOMORROW = '2026-08-26T12:00:00Z';

/** Registered for something still to come — every other case is this with
 *  something switched on. */
const base: RegistrationFacts = {
  registrationStatus: 'registered',
  attended: null,
  cancelledAt: null,
  endsAt: TOMORROW,
};
const facts = (over: Partial<RegistrationFacts>): RegistrationFacts => ({ ...base, ...over });
const outcome = (over: Partial<RegistrationFacts>) => registrationOutcome(facts(over), NOW);

const ALL: RegistrationOutcome[] = [
  'called-off', 'withdrawn', 'attended', 'absence-recorded',
  'awaiting-record', 'registered', 'waitlisted',
];

/** The outcome names as the dictionary spells them — the same map the page
 *  keeps, so an outcome added on one side and not the other is a hole here
 *  rather than an empty pill on somebody's screen. */
const KEY: Record<RegistrationOutcome, keyof typeof ar.account.activities.outcome> = {
  'called-off': 'calledOff',
  withdrawn: 'withdrawn',
  attended: 'attended',
  'absence-recorded': 'absenceRecorded',
  'awaiting-record': 'awaitingRecord',
  registered: 'registered',
  waitlisted: 'waitlisted',
};

/* ------------------------------------------------------------------ *
 * 1. A cancelled activity is never an absence
 * ------------------------------------------------------------------ */
console.log('\n1. what the association called off');

/*
 * The rule this whole module exists for. `attended = false` may well be sitting
 * on the sheet from before the cancellation; once the activity is called off it
 * says nothing about anybody, and showing it says something false about a
 * particular person.
 */
eq('a cancelled activity is never shown as an absence',
  outcome({ cancelledAt: YESTERDAY, attended: false, endsAt: YESTERDAY }), 'called-off');
eq('nor as a past activity awaiting a record',
  outcome({ cancelledAt: YESTERDAY, endsAt: YESTERDAY }), 'called-off');
eq('nor as an upcoming one, even before its start time',
  outcome({ cancelledAt: YESTERDAY }), 'called-off');
/* Matches activityState(), where cancellation already outranks the clock, so
 * the two cannot disagree about what a cancelled activity is. */
eq('and it keeps its own list rather than joining the past ones',
  groupOf('called-off'), 'called-off');
check('a called-off activity offers no button to give up a place that is gone',
  !canWithdraw('called-off'));
/*
 * Amber, not red. Red on this site means something is wrong with your record;
 * an activity the association called off is news about the association.
 */
check('and is not painted as a failure of the volunteer’s',
  OUTCOME_TONE['called-off'] !== OUTCOME_TONE['absence-recorded']
  && !OUTCOME_TONE['called-off'].includes('danger'),
  OUTCOME_TONE['called-off']);

/* ------------------------------------------------------------------ *
 * 2. Withdrawing is the volunteer's own act
 * ------------------------------------------------------------------ */
console.log('\n2. what the volunteer withdrew from');

eq('a cancelled registration is a withdrawal', outcome({ registrationStatus: 'cancelled' }), 'withdrawn');
eq('and stays a withdrawal after the date has passed',
  outcome({ registrationStatus: 'cancelled', endsAt: YESTERDAY }), 'withdrawn');
/* Somebody who gave up their place was not expected and is not absent. */
check('a withdrawal is never read off the attendance sheet',
  outcome({ registrationStatus: 'cancelled', attended: false, endsAt: YESTERDAY }) !== 'absence-recorded');
eq('it has its own list', groupOf('withdrawn'), 'withdrawn');

/*
 * The one case where the ordering above would otherwise lose half the record.
 * Somebody who withdrew on the Tuesday from an activity cancelled on the
 * Wednesday is shown the cancellation as the headline — it is why nothing
 * happened — and their own decision on the line underneath. Neither is deleted.
 */
const both = facts({ registrationStatus: 'cancelled', cancelledAt: YESTERDAY, endsAt: YESTERDAY });
eq('a cancellation is still the headline when the volunteer had also withdrawn',
  registrationOutcome(both, NOW), 'called-off');
check('but the withdrawal is not thrown away', alsoWithdrew(both));
check('an ordinary cancellation carries no withdrawal',
  !alsoWithdrew(facts({ cancelledAt: YESTERDAY })));
check('and an ordinary withdrawal is not reported twice',
  !alsoWithdrew(facts({ registrationStatus: 'cancelled' })));

/* The four words the page must not blur together, checked as words in both
 * languages rather than only as enum members. */
for (const [name, d] of [['ar', ar], ['en', en]] as const) {
  const o = d.account.activities.outcome;
  const four = [o.registered, o.attended, o.calledOff, o.withdrawn];
  check(`the four states read as four different things in ${name}`,
    new Set(four).size === 4, four.join(' | '));
  check(`and a called-off activity is not described as an absence in ${name}`,
    o.calledOff !== o.absenceRecorded, `${o.calledOff} | ${o.absenceRecorded}`);
  check(`the two headings say who cancelled, in ${name}`,
    d.account.activities.calledOffTitle !== d.account.activities.withdrawnTitle);
  check(`and a called-off row carries the sentence that it is not an absence, in ${name}`,
    d.account.activities.calledOffNote.length > 0);
}

/* ------------------------------------------------------------------ *
 * 3. What the supervisor recorded, and what they have not
 * ------------------------------------------------------------------ */
console.log('\n3. the attendance sheet');

eq('a recorded attendance is an attendance',
  outcome({ attended: true, endsAt: YESTERDAY }), 'attended');
eq('a recorded absence says so plainly',
  outcome({ attended: false, endsAt: YESTERDAY }), 'absence-recorded');
/*
 * Nobody having got to the sheet yet is a different fact from the sheet saying
 * absent, and the volunteer can act on one of them. These were one state.
 */
eq('an unrecorded past activity is waiting on the supervisor, not an absence',
  outcome({ endsAt: YESTERDAY }), 'awaiting-record');
check('and the two are not the same words',
  ar.account.activities.outcome.awaitingRecord !== ar.account.activities.outcome.absenceRecorded);
/* An attendance recorded before the end time is still an attendance — a
 * supervisor may tick the sheet while the activity is running. */
eq('a tick during the activity still counts', outcome({ attended: true }), 'attended');

/* ------------------------------------------------------------------ *
 * 4. Still to come
 * ------------------------------------------------------------------ */
console.log('\n4. what is still to come');

eq('a held place is a held place', outcome({}), 'registered');
eq('a waiting-list place is not', outcome({ registrationStatus: 'waitlisted' }), 'waitlisted');
eq('an activity with no end date stays upcoming rather than becoming an absence',
  outcome({ endsAt: null }), 'registered');
check('both may still be given up', canWithdraw('registered') && canWithdraw('waitlisted'));
check('and nothing in the past may', !canWithdraw('attended') && !canWithdraw('awaiting-record'));

/* ------------------------------------------------------------------ *
 * 5. Nothing falls through
 * ------------------------------------------------------------------ */
console.log('\n5. every outcome is complete');

for (const o of ALL) {
  check(`${o} belongs to a list`, groupOf(o) !== undefined, groupOf(o));
  check(`${o} has a tone`, (OUTCOME_TONE[o] ?? '').length > 0);
  check(`${o} has a label in both languages`,
    Boolean(ar.account.activities.outcome[KEY[o]]) && Boolean(en.account.activities.outcome[KEY[o]]));
}
/* Neither cancellation may be filed under "past". That is where they were, and
 * where they read as absences. */
check('neither kind of cancellation is filed with the past activities',
  groupOf('called-off') !== 'past' && groupOf('withdrawn') !== 'past');

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
