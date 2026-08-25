/*
 * What the staff member file may say, and what it must never say.
 *
 * The page gathers everything the association knows about one person, which is
 * exactly the page where a birth date, a guardian's telephone number or a
 * child's medical note would end up if nobody had written the rule down. So the
 * rule is written down here rather than trusted to a template: sensitive values
 * go into `memberFile` and do not come out of it, whatever the query upstream
 * decides to select.
 *
 * The rest is the arithmetic that is wrong by a little in a way nobody notices
 * for months — hours counted twice because a carry-over is already verified, an
 * attendance record of nought out of nought reading as a hundred per cent, a
 * default that speaks for somebody who was never asked.
 *
 * A PURE probe: no database, no network.
 */

import {
  activityStanding, auditEntry, calendarDate, hoursStanding, memberFile, membershipSpan,
  minorStatus, rosterLink, rosterRecognition, safeguardingPresence, visibilityState,
  type RawMemberFile,
} from '../src/lib/member-profile.ts';
import { countPhrase } from '../src/lib/when.ts';
import {
  memberProfileAr, memberProfileEn, type MemberProfileStrings,
} from '../src/lib/dictionaries/member-profile.ts';

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

/* ------------------------------------------------------------------ *
 * The fixture: one record with something sensitive in every corner.
 * ------------------------------------------------------------------ */

/** Every string that must never reach a page. Planted, then hunted for. */
const SECRETS = {
  dob: '2011-04-07',
  guardianName: 'أم خالد',
  guardianPhone: '03998877',
  emergencyName: 'خالد سعيد',
  emergencyPhone: '70112233',
  medical: 'حساسية من البنسلين',
};

const TODAY = '2026-08-25';

const raw: RawMemberFile = {
  today: TODAY,
  account: {
    status: 'active',
    membershipStatus: 'active_volunteer',
    createdOn: '2026-02-10',
    lastSeenAt: '2026-08-20T07:15:00.000Z',
  },
  roles: ['volunteer', 'team_leader'],
  isVolunteer: true,
  roster: {
    member_number: 47,
    committee: 'الإغاثة',
    joined_on: '2019-06-01',
    claimed_on: '2026-02-11',
    approved_on: '2026-02-12',
    actions: ['roster.claimed', 'roster.approved'],
    strength: 'phone-and-dob',
    date_of_birth: SECRETS.dob,
  },
  sensitiveDob: SECRETS.dob,
  safeguarding: {
    date_of_birth: SECRETS.dob,
    emergency_name: SECRETS.emergencyName,
    emergency_phone: SECRETS.emergencyPhone,
    emergency_relation: 'أب',
    guardian_name: SECRETS.guardianName,
    guardian_phone: SECRETS.guardianPhone,
    guardian_relation: 'أم',
    guardian_consent_at: '2026-02-13T09:00:00.000Z',
    code_of_conduct_at: '2026-02-13T09:00:00.000Z',
    safeguarding_at: '2026-02-13T09:00:00.000Z',
    data_consent_at: '2026-02-13T09:00:00.000Z',
    medical_notes: SECRETS.medical,
  },
  visibility: { stored: 'display_name', chosenAt: '2026-03-01T10:00:00.000Z' },
  hours: { verifiedMinutes: 9000, pendingMinutes: 120, carriedMinutes: 6000 },
  activities: { registered: 12, attended: 11 },
  courses: {
    passed: [{ slug: 'safety', passedOn: '2026-04-02', attempts: 2 }],
    inProgress: [{ slug: 'teamwork', passedOn: null, attempts: 1 }],
  },
  certificates: [
    { code: 'TKF-A', titleAr: 'شهادة', titleEn: 'Certificate', issuedOn: '2026-05-01', revokedOn: null, revokeReason: null },
    { code: 'TKF-B', titleAr: 'شهادة', titleEn: 'Certificate', issuedOn: '2026-05-02', revokedOn: '2026-06-01', revokeReason: 'أُصدرت لدورة خاطئة' },
  ],
  badges: [
    { code: 'first-hour', earnedOn: '2026-03-05', withdrawnOn: null, withdrawReason: null, byHand: false },
    { code: 'invented', earnedOn: '2026-03-06', withdrawnOn: '2026-07-01', withdrawReason: 'مُنحت بالخطأ', byHand: true },
  ],
  points: 430,
  stages: [
    { stage: 1, reachedOn: '2026-02-12' },
    { stage: 2, reachedOn: '2026-05-20' },
  ],
  audit: [
    { at: '2026-02-12T08:00:00.000Z', action: 'roster.approved', actor_id: 'u1', actor_name: 'سلمى', reason: 'معروفة في اللجنة' },
    { at: '2026-02-11T08:00:00.000Z', action: 'roster.auto_approved', actor_id: null, actor_name: null, reason: null },
  ],
};

const file = memberFile(raw);

/* ------------------------------------------------------------------ *
 * 1. Nothing sensitive survives the crossing
 * ------------------------------------------------------------------ */
console.log('\n1. what may not leave the module');

/** Every leaf of the assembled file, with the key it arrived under. */
function leaves(node: unknown, key: string, out: Array<[string, unknown]>): void {
  if (Array.isArray(node)) {
    for (const item of node) leaves(item, key, out);
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) leaves(v, k, out);
    return;
  }
  out.push([key, node]);
}

const flat: Array<[string, unknown]> = [];
leaves(file, 'root', flat);

const planted = Object.values(SECRETS);
const hunt = (node: unknown): Array<[string, unknown]> => {
  const found: Array<[string, unknown]> = [];
  leaves(node, 'root', found);
  return found.filter(([, v]) => typeof v === 'string' && planted.some((s) => v.includes(s)));
};

/* The control. A hunter that cannot find anything proves nothing about a page
 * that shows nothing, and the assertion below would pass just as happily
 * against a typo in SECRETS. */
check('the search finds the planted values when they are there',
  hunt(raw).length >= planted.length, `${hunt(raw).length} of ${planted.length}`);

const leaked = hunt(file);
check('no birth date, guardian, contact or medical value reaches the page',
  leaked.length === 0, JSON.stringify(leaked));

/*
 * The stronger form of the same rule, and the one that survives a refactor.
 * A field NAMED after any of these may only ever be a yes or a no: the moment
 * one holds a string, somebody has started passing a value through under a
 * presence-shaped name.
 */
const SENSITIVE_KEY = /guardian|medical|emergency|dob|birth/i;
const valued = flat.filter(([k, v]) => SENSITIVE_KEY.test(k) && typeof v !== 'boolean');
check('any field named for one of them holds a boolean and nothing else',
  valued.length === 0, JSON.stringify(valued));

const aged = flat.filter(([k]) => /(^|_)age$|ageOf|years/i.test(k));
check('and no field is named for an age at all', aged.length === 0, JSON.stringify(aged));

/* The presence summary refuses a full row on its own, not merely because the
 * query happens not to select one. */
const presence = safeguardingPresence(raw.safeguarding);
check('safeguardingPresence answers a full row with booleans only',
  Object.values(presence).every((v) => typeof v === 'boolean'), JSON.stringify(presence));
check('and carries none of the row across',
  !planted.some((secret) => JSON.stringify(presence).includes(secret)));

eq('a record that exists says so', presence.onFile, true);
eq('with the guardian consent noted as present', presence.guardianConsentRecorded, true);
eq('and the medical note noted as present, never quoted', presence.medicalNoteOnFile, true);

const none = safeguardingPresence(null);
check('no record at all is four noes rather than a crash',
  Object.values(none).every((v) => v === false), JSON.stringify(none));
eq('a record missing one of the three agreements is not complete',
  safeguardingPresence({ code_of_conduct_at: 'x', safeguarding_at: 'x', data_consent_at: null })
    .agreementsRecorded,
  false);

/* ------------------------------------------------------------------ *
 * 2. A child is a fact, not a date
 * ------------------------------------------------------------------ */
console.log('\n2. the age band');

eq('somebody born fifteen years ago is a minor',
  minorStatus({ safeguardingDob: '2011-04-07', today: TODAY }), 'minor');
eq('somebody born thirty years ago is an adult',
  minorStatus({ safeguardingDob: '1996-04-07', today: TODAY }), 'adult');

/* Not 'adult'. Seven accounts have no date anywhere, and saying "adult" about
 * them is the record asserting something nobody checked. */
eq('no date anywhere is unknown, and never adult',
  minorStatus({ today: TODAY }), 'unknown');
eq('a timestamp is not a date and does not become one',
  minorStatus({ safeguardingDob: '2011-04-07T23:30:00Z', today: TODAY }), 'unknown');

eq('where the sources disagree the younger answer wins',
  minorStatus({ sensitiveDob: '1990-01-01', safeguardingDob: '2011-04-07', today: TODAY }), 'minor');
eq('and the roster counts as a source like the others',
  minorStatus({ rosterDob: '2011-04-07', today: TODAY }), 'minor');

/* The boundary the whole rule turns on, and the one a Date object gets wrong
 * across a timezone. */
eq('an eighteenth birthday today is an adult today',
  minorStatus({ safeguardingDob: '2008-08-25', today: TODAY }), 'adult');
eq('and the day before it is still a minor',
  minorStatus({ safeguardingDob: '2008-08-26', today: TODAY }), 'minor');

eq('the assembled file states the band and not the date', file.minor, 'minor');

/* ------------------------------------------------------------------ *
 * 3. Dates are text, because the session is not in Beirut
 * ------------------------------------------------------------------ */
console.log('\n3. calendar dates');

eq('a plain calendar day is taken', calendarDate('2019-06-01'), '2019-06-01');
/* Refused rather than sliced to ten characters. A GMT timestamp written after
 * ten in the evening Beirut time names the previous day, and this page compares
 * a join date against an account date to decide what to tell a coordinator. */
eq('a timestamp is refused, not trimmed', calendarDate('2019-06-01T22:30:00Z'), null);
eq('and so is a Date', calendarDate(new Date('2019-06-01')), null);
eq('empty is nothing', calendarDate(''), null);

const span = membershipSpan({ joinedOn: '2019-06-01', accountFrom: '2026-02-10' });
eq('a volunteer of years shows the association date', span.joinedOn, '2019-06-01');
eq('and the account date beside it, not instead of it', span.accountFrom, '2026-02-10');
check('and is marked as predating the platform', span.predatesAccount);
check('somebody who signed up today does not predate anything',
  !membershipSpan({ joinedOn: '2026-02-10', accountFrom: '2026-02-10' }).predatesAccount);
check('and neither does an account with no association date',
  !membershipSpan({ joinedOn: null, accountFrom: '2026-02-10' }).predatesAccount);

/* ------------------------------------------------------------------ *
 * 4. Figures that must not double-count
 * ------------------------------------------------------------------ */
console.log('\n4. hours and attendance');

const h = hoursStanding({ verifiedMinutes: 9000, pendingMinutes: 120, carriedMinutes: 6000 });
check('carried hours are part of the verified total, not an addition to it',
  h.onPlatform + h.carried === h.verified, JSON.stringify(h));
check('so the two halves never exceed the whole', h.carried <= h.verified && h.onPlatform >= 0);
check('and hours awaiting review are added to neither',
  h.verified === 9000 && h.pending === 120);
check('a carry-over larger than the verified total cannot make the split negative',
  hoursStanding({ verifiedMinutes: 100, carriedMinutes: 5000 }).onPlatform === 0);
check('nonsense reads as nothing rather than NaN',
  hoursStanding({ verifiedMinutes: 'x', pendingMinutes: -5 }).verified === 0
    && hoursStanding({ verifiedMinutes: 'x', pendingMinutes: -5 }).pending === 0);

const a = activityStanding({ registered: 12, attended: 11 });
eq('what was signed up for and not attended is the difference', a.missed, 1);
eq('and the rate is of the registrations', a.rate, 92);
/* Nought of nought is arithmetically a hundred per cent and reads as a perfect
 * record, which is the same trap the journey card avoids on an unconfigured
 * stage. */
eq('somebody who never signed up for anything has no rate at all',
  activityStanding({ registered: 0, attended: 0 }).rate, null);
check('attendance can never exceed what was registered for',
  activityStanding({ registered: 2, attended: 9 }).attended === 2
    && activityStanding({ registered: 2, attended: 9 }).missed === 0);

/* ------------------------------------------------------------------ *
 * 5. Consent, and whether anybody ever asked
 * ------------------------------------------------------------------ */
console.log('\n5. public visibility');

const never = visibilityState('hidden', null);
eq('the stored default is hidden', never.choice, 'hidden');
check('and somebody who never answered is marked as never having answered',
  !never.everChose);
check('which is not itself a fault', !never.unexplained);

const chose = visibilityState('display_name', '2026-03-01T10:00:00.000Z');
check('somebody who set it themselves is recorded as having done so', chose.everChose);
eq('with when they did it', chose.chosenAt, '2026-03-01T10:00:00.000Z');

/* Should be impossible: every path that writes the choice writes the time with
 * it. It means a hand-edited row or a bug in that path, and either way it is a
 * person on a public page with no recorded consent. */
check('a public listing with no record of consent is flagged as a fault',
  visibilityState('name_and_photo', null).unexplained);

eq('an unrecognised stored value resolves to the private option',
  visibilityState('everything', '2026-03-01T10:00:00.000Z').choice, 'hidden');
eq('and so does a missing row', visibilityState(null, null).choice, 'hidden');

/* ------------------------------------------------------------------ *
 * 6. How they were recognised
 * ------------------------------------------------------------------ */
console.log('\n6. the roster line');

eq('a claim nobody has decided is waiting',
  rosterRecognition(['roster.claimed']), 'awaiting');
eq('a rule that recognised them says so',
  rosterRecognition(['roster.claimed', 'roster.auto_approved']), 'rule');
eq('a person who approved it says so',
  rosterRecognition(['roster.claimed', 'roster.approved']), 'staff');
eq('and a person who attached the account without a claim is a third answer',
  rosterRecognition(['roster.linked_by_staff']), 'staff-link');
/* When both are on the record the accountable party is the one who can be
 * asked why, so a human decision outranks the rule. */
eq('a human decision outranks the rule when both were recorded',
  rosterRecognition(['roster.auto_approved', 'roster.approved']), 'staff');
eq('nothing recorded is nothing claimed', rosterRecognition([]), null);

const link = rosterLink(raw.roster);
eq('the membership number is shown the way the association writes it',
  link?.label, 'T047');
eq('with the two facts that agreed at the time', link?.strength, 'phone-and-dob');
/* A strength this build does not know is dropped rather than printed raw: the
 * page looks it up in a table of labels and would otherwise render a bare slug
 * to somebody reading Arabic. */
eq('an unrecognised strength is dropped rather than shown as a slug',
  rosterLink({ member_number: 1, strength: 'vibes' })?.strength, null);
check('and the roster line carries no birth date out with it',
  !JSON.stringify(rosterLink(raw.roster)).includes(SECRETS.dob));
eq('no roster line is null, not an empty one', rosterLink(null), null);

/* ------------------------------------------------------------------ *
 * 7. Who did it
 * ------------------------------------------------------------------ */
console.log('\n7. the audit trail');

/*
 * audit_logs.actor_id is null when the system acted and only then. Rendering
 * that as "unknown" tells a reader the platform lost track of who did
 * something, which is false and is exactly the sort of thing that makes
 * somebody distrust the rest of the log.
 */
const byRule = auditEntry({ at: 'x', action: 'roster.auto_approved', actor_id: null, actor_name: null });
check('an action with no actor is the system, not an unknown person',
  byRule.byRule && byRule.actor === null);
const byPerson = auditEntry({ at: 'x', action: 'roster.approved', actor_id: 'u1', actor_name: 'سلمى' });
check('an action with an actor names them and is not the system',
  !byPerson.byRule && byPerson.actor === 'سلمى');
check('an actor whose profile has gone is still not the system',
  auditEntry({ at: 'x', action: 'role.granted', actor_id: 'u9', actor_name: null }).byRule === false);

/* ------------------------------------------------------------------ *
 * 8. What the assembled file says
 * ------------------------------------------------------------------ */
console.log('\n8. the file as a whole');

check('a revoked certificate is kept and shown, not filtered away',
  file.certificates.revoked.length === 1 && file.certificates.held.length === 1);
check('and it keeps the reason it was revoked for',
  file.certificates.revoked.every((c) => Boolean(c.revokeReason)));
check('a withdrawn badge is kept with its reason too',
  file.badges.withdrawn.length === 1 && file.badges.withdrawn.every((b) => Boolean(b.withdrawReason)));
check('a badge still held is not listed among the withdrawn',
  file.badges.held.every((b) => b.withdrawnOn === null));
eq('the stage shown is the highest reached', file.stage, 2);
eq('an account with no stages is at nought',
  memberFile({ ...raw, stages: [] }).stage, 0);
check('the roles come through as they were granted', file.roles.length === 2);

/* ------------------------------------------------------------------ *
 * 9. Arabic counts in five bands, not two
 * ------------------------------------------------------------------ */
console.log('\n9. counted nouns');

/*
 * countPhrase substitutes {n} into `few` and `many` only. A placeholder in
 * zero, one or two is printed literally — «{n} نشاط» on the page — and a
 * missing one in few or many drops the number entirely, which turns a figure
 * into a word.
 */
for (const [name, strings] of [['ar', memberProfileAr], ['en', memberProfileEn]] as Array<
  [string, MemberProfileStrings]
>) {
  for (const [key, forms] of Object.entries(strings.counts)) {
    check(`${name}.${key}: the bands that take no number carry no placeholder`,
      !forms.zero.includes('{n}') && !forms.one.includes('{n}') && !forms.two.includes('{n}'),
      JSON.stringify(forms));
    check(`${name}.${key}: the bands that take one carry it`,
      forms.few.includes('{n}') && forms.many.includes('{n}'),
      JSON.stringify(forms));
    check(`${name}.${key}: no count from 0 to 40 prints the placeholder itself`,
      Array.from({ length: 41 }, (_, n) => countPhrase(n, forms)).every((s) => !s.includes('{n}')));
  }
}

/* The four bands are actually distinct in Arabic: «٢ أنشطة» and «٣ نشاط» are
 * both wrong, and a form set that reuses one string for all of them would pass
 * the placeholder checks above and still read as broken. */
const act = memberProfileAr.counts.activities;
check('the Arabic dual is not the same word as the plural',
  act.two !== act.few && act.few !== act.many && act.one !== act.two,
  [act.one, act.two, act.few, act.many].join(' | '));

/* ------------------------------------------------------------------ *
 * 10. The two dictionaries describe the same page
 * ------------------------------------------------------------------ */
console.log('\n10. both languages');

const MAPS = ['accountStatus', 'membership', 'strengths', 'recognition', 'visibility', 'actions'] as const;
for (const name of MAPS) {
  const arKeys = Object.keys(memberProfileAr[name]).sort();
  const enKeys = Object.keys(memberProfileEn[name]).sort();
  /* A key present in one and not the other renders an English label on an
   * Arabic page — or, worse, a raw database value like 'accepted_volunteer'. */
  check(`${name} has the same keys in both languages`,
    arKeys.join(',') === enKeys.join(','), `ar=${arKeys.length} en=${enKeys.length}`);
}

check('every match strength the roster can produce has a label',
  (['phone-and-name', 'phone-and-dob', 'number-and-name', 'number-and-dob', 'phone-only', 'number-only'] as const)
    .every((s) => Boolean(memberProfileAr.strengths[s] && memberProfileEn.strengths[s])));
check('and so does every way a roster line can be recognised',
  (['rule', 'staff', 'staff-link', 'awaiting'] as const)
    .every((r) => Boolean(memberProfileAr.recognition[r] && memberProfileEn.recognition[r])));
check('and every membership status the schema permits',
  (['registered_user', 'course_participant', 'volunteer_applicant', 'volunteer_candidate',
    'accepted_volunteer', 'active_volunteer', 'inactive_volunteer', 'volunteer_alumni',
    'suspended', 'rejected'] as const)
    .every((s) => Boolean(memberProfileAr.membership[s] && memberProfileEn.membership[s])));
check('and every account status', (['active', 'suspended', 'deactivated'] as const)
  .every((s) => Boolean(memberProfileAr.accountStatus[s] && memberProfileEn.accountStatus[s])));
check('and each of the three visibility choices',
  (['hidden', 'display_name', 'name_and_photo'] as const)
    .every((c) => Boolean(memberProfileAr.visibility[c] && memberProfileEn.visibility[c])));

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
