/*
 * Which one thing the dashboard asks for, and in what order.
 *
 * The account page used to render every banner it had and leave the volunteer
 * to work out which applied to them. Now one function picks one audience and
 * one next step, and the ordering it uses is a set of decisions about people:
 * a volunteer with no emergency contact is asked for that before anything
 * else, somebody waiting on a decision is told to wait rather than given busy
 * work, and a stopped account is not handed a to-do list.
 *
 * Those decisions are exactly the kind that get quietly reordered later by
 * somebody moving an `if`. This holds them.
 *
 * A PURE probe: no database, no network.
 */

import {
  audienceOf, nextStepOf, otherTasksOf, profileCompleteness,
  type AccountFacts,
} from '../src/lib/account-state.ts';

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

/** A plain learner — every other case is this with something switched on. */
const base: AccountFacts = {
  accountStatus: 'active',
  membershipStatus: 'registered_user',
  rosterClaimPending: false,
  rosterOffered: false,
  applicationOpen: false,
  applicationRejected: false,
  hasSafeguarding: false,
  stageRequirement: null,
  courseInProgress: null,
  coursesPassed: 0,
  nextActivityId: null,
  isVolunteer: false,
};
const facts = (over: Partial<AccountFacts>): AccountFacts => ({ ...base, ...over });

const volunteer = facts({ isVolunteer: true, membershipStatus: 'accepted_volunteer', hasSafeguarding: true });

/* ------------------------------------------------------------------ *
 * 1. Who the page is for
 * ------------------------------------------------------------------ */
console.log('\n1. the audience');

eq('somebody who just registered is a learner', audienceOf(base), 'learner');
eq('an accepted volunteer is a volunteer', audienceOf(volunteer), 'volunteer');
eq('a claimed-but-unconfirmed record is roster-unlinked',
  audienceOf(facts({ rosterClaimPending: true })), 'roster-unlinked');
eq('an unclaimed record on offer is roster-unlinked',
  audienceOf(facts({ rosterOffered: true })), 'roster-unlinked');
eq('an open application is application-pending',
  audienceOf(facts({ applicationOpen: true })), 'application-pending');

/* The two that must win over everything, because getting them wrong means
 * showing a stopped account a cheerful list of things to do. */
eq('a suspended account outranks everything else',
  audienceOf(facts({ accountStatus: 'suspended', isVolunteer: true, rosterOffered: true })), 'suspended');
eq('a suspended membership counts as suspended too',
  audienceOf(facts({ membershipStatus: 'suspended', isVolunteer: true })), 'suspended');
eq('a rejected application outranks a roster offer',
  audienceOf(facts({ applicationRejected: true, rosterOffered: true })), 'rejected');
eq('being a volunteer outranks an old open application',
  audienceOf(facts({ isVolunteer: true, applicationOpen: true, hasSafeguarding: true })), 'volunteer');

/* ------------------------------------------------------------------ *
 * 2. The one thing asked for
 * ------------------------------------------------------------------ */
console.log('\n2. the primary step');

/*
 * Safeguarding details are not the headline step, and this asserts the change
 * rather than merely dropping the old assertion.
 *
 * They were the headline: a volunteer without a record was told to fill one in
 * before anything else. The association collects this on paper in the office
 * and has done for years, so for most of these people the platform was
 * demanding something they had already given — and the first task somebody
 * sees should be one they can act on.
 */
eq('a volunteer with no emergency contact is pointed at real work, not a form',
  nextStepOf(facts({ isVolunteer: true, hasSafeguarding: false, courseInProgress: 'x', nextActivityId: 'y' })).key,
  'attend-activity');
eq('and one with nothing else owed is sent to the field',
  nextStepOf(facts({ isVolunteer: true, hasSafeguarding: false })).key,
  'find-activity');
/* Still offered, just not demanded. The narrow reason to keep offering it: a
 * coordinator in the field with a phone can reach a contact that is in here,
 * and cannot reach one that is in a drawer in the office. */
check('but it stays on the list of things they could do',
  otherTasksOf(facts({ isVolunteer: true, hasSafeguarding: false })).includes('safeguarding'));
check('and drops off once the association has it',
  !otherTasksOf(facts({ isVolunteer: true, hasSafeguarding: true })).includes('safeguarding'));
/* The rule the whole change rests on. Nothing may refuse a volunteer for the
 * want of it: a record the association already holds does not become missing
 * because this database cannot see it. */
check('and having no record never makes somebody less of a volunteer',
  audienceOf(facts({ isVolunteer: true, hasSafeguarding: false }))
    === audienceOf(facts({ isVolunteer: true, hasSafeguarding: true })));

eq('an unclaimed record is offered before an application',
  nextStepOf(facts({ rosterOffered: true })).key, 'claim-roster');
eq('a claim already made means waiting, not doing',
  nextStepOf(facts({ rosterClaimPending: true })).key, 'await-decision');
eq('an open application means waiting too',
  nextStepOf(facts({ applicationOpen: true })).key, 'await-decision');

eq('a suspended account is asked for nothing',
  nextStepOf(facts({ accountStatus: 'suspended', isVolunteer: true, hasSafeguarding: false })).key,
  'nothing');
eq('a rejected application is asked for nothing',
  nextStepOf(facts({ applicationRejected: true, courseInProgress: 'x' })).key, 'nothing');

const withReq = facts({
  ...volunteer,
  stageRequirement: { stageNumber: 3, label: 'دورة السلامة', courseSlug: 'safety' },
});
eq('a named stage requirement wins over an activity',
  nextStepOf({ ...withReq, nextActivityId: 'a' }).key, 'stage-requirement');
eq('and links straight to the course when it names one',
  nextStepOf(withReq).href, '/academy/safety');
eq('a requirement with no course links to the journey',
  nextStepOf(facts({ ...volunteer, stageRequirement: { stageNumber: 2, label: 'ساعات', courseSlug: null } })).href,
  '/account/journey');

/* With no requirements configured — which is the state of the live journey
 * today — the card must still find something real to say. */
eq('with no requirements, an upcoming activity is the step',
  nextStepOf({ ...volunteer, nextActivityId: 'a1' }).key, 'attend-activity');
eq('then an unfinished course',
  nextStepOf({ ...volunteer, courseInProgress: 'teamwork' }).key, 'finish-course');
/* A volunteer recognised from the roster after years of service has passed no
 * courses. Opening their dashboard with "start a course" would tell somebody
 * who has volunteered since 2018 that they have not begun. */
eq('a volunteer with nothing owed is pointed at the field, not the academy',
  nextStepOf(volunteer).key, 'find-activity');
check('and learning is still offered underneath',
  otherTasksOf(volunteer).includes('start-learning'), otherTasksOf(volunteer).join(', '));
eq('a learner who never opened a course is asked to start',
  nextStepOf(base).key, 'start-learning');
eq('a stopped account gets no other-tasks list either',
  otherTasksOf(facts({ accountStatus: 'suspended', isVolunteer: true, courseInProgress: 'x' })).length, 0);
eq('a learner who finished something and owes nothing is told so',
  nextStepOf(facts({ coursesPassed: 3 })).key, 'nothing');

/* ------------------------------------------------------------------ *
 * 3. The small list underneath
 * ------------------------------------------------------------------ */
console.log('\n3. other tasks');

const busy = facts({
  isVolunteer: true, hasSafeguarding: false,
  courseInProgress: 'teamwork', nextActivityId: 'a1', rosterOffered: true,
});
const others = otherTasksOf(busy);
check('the primary step never repeats in the list',
  !others.includes(nextStepOf(busy).key), `primary=${nextStepOf(busy).key}, others=${others.join(', ')}`);
check('the remaining tasks are still offered', others.length >= 2, others.join(', '));
eq('a settled volunteer with nothing pending has an empty list',
  otherTasksOf({ ...volunteer, coursesPassed: 4 }).length, 0);

/* ------------------------------------------------------------------ *
 * 4. Profile completeness
 * ------------------------------------------------------------------ */
console.log('\n4. profile completeness');

const empty = { photoRef: null, bio: null, interests: null, skills: null, languages: null };
eq('an empty profile is nought of five', profileCompleteness(empty).done, 0);
eq('and names what is missing', profileCompleteness(empty).missing.length, 5);
const full = { photoRef: 'p', bio: 'x', interests: ['a'], skills: ['b'], languages: ['ar'] };
eq('a full profile is five of five', profileCompleteness(full).done, 5);
eq('and names nothing', profileCompleteness(full).missing.length, 0);
check('an empty array does not count as filled in',
  profileCompleteness({ ...empty, skills: [] }).done === 0);
check('whitespace is not a bio',
  profileCompleteness({ ...empty, bio: '   ' }).done === 0);

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
