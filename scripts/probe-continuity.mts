/*
 * «صنّاع الاستمرارية» — the rules the page of thanks has to keep.
 *
 * Three of them, and each has a way of failing quietly:
 *
 *   1. NOBODY IS PUBLISHED WITHOUT CONSENT. The page asks lib/visibility.ts
 *      and abides by the answer: silence is a no, an unreadable birth date is
 *      a child, and a chosen name is never quietly swapped for a legal one.
 *      Checked here as well as in probe-visibility because that probe proves
 *      the module is right and this one proves the page is asking it.
 *
 *   2. NO POSITION NUMBERS. Not "no numbers in the design" — no place for one
 *      to come from. The public object has no rank field, the list is <ul>
 *      markup, and no callback on the page takes an index. Checked as facts
 *      about the code rather than as a look, because a leaderboard is one
 *      `{i + 1}` away from any list of people.
 *
 *   3. NOTHING IS ORDERED MORE FINELY THAN IT IS SHOWN. The card prints a
 *      year, so the sort must not order by the day; a figure that is withheld
 *      must not decide where its owner lands. Position in a sorted list is
 *      readable, and a sort key that is not on the page is published anyway.
 *
 * PURE. No database, no server. Everything below is either a call into
 * lib/continuity.ts or a fact read off a source file, so this cannot be fooled
 * by whatever happens to be in a database on the day it runs.
 */

/* Source read through the shared reader, so a CRLF checkout cannot turn a
 * `\n`-anchored regex below into a silent pass. See scripts/source-text.mts. */
import { REPO, readSource } from './source-text.mts';
import {
  BADGE_LIMIT, CONSENT_NONE, DEFAULT_SORT, SORTS,
  beirutToday, buildRoll, consentFor, filterRoll, joiningYears, notableBadges, parseFilter,
  parseSort, sortRoll, stageOptions, toPublicPerson,
  type ContinuityConsent, type ContinuityPerson, type ContinuityRow,
} from '../src/lib/continuity.ts';
import { continuityAr, continuityEn } from '../src/lib/dictionaries/continuity.ts';

let ok = 0;
const holes: string[] = [];

function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1;
  else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}
/** `note` explains WHY the wanted value is the wanted one, where that is not
 *  obvious from the label. Shown whether or not the check passed. */
const eq = (what: string, got: unknown, want: unknown, note = '') => {
  const same = JSON.stringify(got) === JSON.stringify(want);
  check(what, same, same ? note : `got ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`);
};

const read = (p: string) => readSource(`${REPO}${p}`);

/*
 * A file with its comments taken out.
 *
 * Every assertion made against source below is about what the code DOES, and
 * these files explain themselves at length: the comment saying this page must
 * never reuse profiles.is_public contains the string `is_public`, and the one
 * warning against `new Date` contains `new Date`. Reading the prose alongside
 * the code makes a probe that fails hardest on the files documented best.
 */
const strip = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

/** A day to reason from. Fixed, so nothing here depends on when it is run. */
const TODAY = '2026-08-24';
/** Comfortably an adult on TODAY, and comfortably a child. */
const ADULT_DOB = '1996-01-01';
const CHILD_DOB = '2011-03-15';

/** Full consent, as consentFor returns it for a consenting adult. */
const CONSENT_ALL: ContinuityConsent = {
  listed: true, name: 'زياد الفوّاز', photo: true, memberNumber: true,
  figures: true, certificates: true, badges: true, stage: true,
};

/** A row carrying everything a careless `SELECT *` would carry. */
function row(over: Partial<ContinuityRow> = {}): ContinuityRow {
  return {
    id: 'u-1',
    full_name: 'زياد الفوّاز',
    display_name: null,
    member_number: 14,
    joined_on: '2019-04-17',
    stage_ar: 'العمل الميداني',
    stage_en: 'Field work',
    stage_number: 3,
    minutes: 6000,
    activities: 22,
    certificates: 4,
    photo_version: 'v7',
    badges: ['continuity-maker', 'hundred-hours', 'certs-3'],
    public_visibility: 'name_and_photo',
    safeguarding_dob: ADULT_DOB,
    ...over,
  };
}

/** A card as it would look for a consenting adult, without going near a clock. */
const person = (over: Partial<ContinuityRow> = {}): ContinuityPerson => {
  const r = row(over);
  return toPublicPerson(r, { ...CONSENT_ALL, name: r.full_name }, 'ar') as ContinuityPerson;
};

/* ------------------------------------------------------------------ *
 * 1. Consent: the page asks visibility.ts and abides by the answer
 * ------------------------------------------------------------------ */
console.log('\n1. consent');

eq('silence is a no — an unanswered profile publishes nothing',
  consentFor({ full_name: 'ز', display_name: null, safeguarding_dob: ADULT_DOB }, TODAY),
  CONSENT_NONE);
eq('and so is the stored default',
  consentFor({ full_name: 'ز', display_name: null, public_visibility: 'hidden', safeguarding_dob: ADULT_DOB }, TODAY),
  CONSENT_NONE);
eq('an unrecognised stored value resolves private rather than throwing',
  consentFor({ full_name: 'ز', display_name: null, public_visibility: 'everything', safeguarding_dob: ADULT_DOB }, TODAY),
  CONSENT_NONE);
check('CONSENT_NONE grants nothing at all',
  Object.values(CONSENT_NONE).every((v) => v === false || v === null));

check('a consenting adult is listed under their own name',
  consentFor(row(), TODAY).listed === true &&
  consentFor(row(), TODAY).name === 'زياد الفوّاز' &&
  consentFor(row(), TODAY).photo === true);

check('a minor is never named or photographed, whatever they chose',
  consentFor(row({ safeguarding_dob: CHILD_DOB }), TODAY).listed === false,
  'no display name of their own, so nothing may be published');
check('a minor with a name of their own appears under it and never with a photograph',
  consentFor(row({ safeguarding_dob: CHILD_DOB, display_name: 'فريق الأمل' }), TODAY).name === 'فريق الأمل' &&
  consentFor(row({ safeguarding_dob: CHILD_DOB, display_name: 'فريق الأمل' }), TODAY).photo === false);
check('an unreadable age is treated as a child',
  consentFor(row({ safeguarding_dob: null, sensitive_dob: null }), TODAY).listed === false,
  'wrong on the side of a volunteer having to ask, not a child being published');
check('a timestamp is not a birth date and is refused as one',
  consentFor(row({ safeguarding_dob: '2011-03-15T22:30:00Z' }), TODAY).listed === false);

check('display_name publishes the chosen name and no photograph',
  consentFor(row({ public_visibility: 'display_name', display_name: 'أبو خالد' }), TODAY).name === 'أبو خالد' &&
  consentFor(row({ public_visibility: 'display_name', display_name: 'أبو خالد' }), TODAY).photo === false);
check('display_name with nothing to show falls back to silence, never to the legal name',
  consentFor(row({ public_visibility: 'display_name', display_name: null }), TODAY).listed === false);

/*
 * THE MEMBERSHIP NUMBER IS NEVER PUBLISHED NOW, and this assertion used to
 * guard the narrower version of that rule: it went out beside a legal name and
 * not beside a chosen one.
 *
 * A security audit showed the narrow rule was not enough. Roster claims were
 * auto-approved on a membership number plus a name that folds to the roster's
 * — and the account holder types their own name. So this page printed both
 * halves of that check, and somebody could read a name and a number off it and
 * be recognised by the platform as that volunteer.
 *
 * The claim path is closed as well (probe-recognition holds it). Both were
 * closed, rather than one: a number that identifies a person in the
 * association's own records does not belong on a public page, and the next
 * feature keyed on it will not arrive with a note explaining why it used to be
 * safe.
 */
check('the membership number is never published, whatever was consented to',
  consentFor(row(), TODAY).memberNumber === false &&
  consentFor(row({ public_visibility: 'display_name', display_name: 'أبو خالد' }), TODAY).memberNumber === false,
  'it was half of the roster-claim check, printed beside the other half');

check('this page never reads profiles.is_public',
  !/is_public/.test(strip(read('src/lib/continuity.ts'))) &&
  !/is_public/.test(strip(read('src/lib/continuity-data.ts'))),
  'that flag is about a scanned card, a different audience and a different decision');

check('toPublicPerson returns nothing at all without consent',
  toPublicPerson(row(), CONSENT_NONE, 'ar') === null);
eq('buildRoll publishes nobody who has not answered',
  buildRoll(
    [row({ public_visibility: null }), row({ id: 'u-2', public_visibility: 'hidden' })],
    'ar', TODAY,
  ),
  []);
eq('and publishes the person who did',
  buildRoll([row()], 'ar', TODAY).map((p) => p.name), ['زياد الفوّاز']);
check('listed:false alone is enough — no other flag can reopen it',
  toPublicPerson(row(), { ...CONSENT_ALL, listed: false }, 'ar') === null);

check('today is read in Beirut and comes back as YYYY-MM-DD',
  /^\d{4}-\d{2}-\d{2}$/.test(beirutToday()));
eq('and never as the GMT day for an evening instant',
  beirutToday(new Date('2026-12-31T22:30:00Z')), '2027-01-01',
  'GMT would say 31 December; Beirut is two hours ahead and has turned the year');

/* ------------------------------------------------------------------ *
 * 2. The allowlist: what a card may carry once consent exists
 * ------------------------------------------------------------------ */
console.log('\n2. the allowlist');

const full = person();
const EXPECTED_KEYS = [
  'id', 'joinedYear', 'name', 'memberNumber', 'stage', 'stageNumber',
  'hours', 'activities', 'certificates', 'badges', 'showPhoto', 'photoVersion',
];
eq('the public person carries exactly the fields the card renders',
  Object.keys(full).sort(), [...EXPECTED_KEYS].sort());

const serialised = JSON.stringify(full);
check('the full join date never survives — only the year',
  !serialised.includes('2019-04-17') && full.joinedYear === '2019');
check('neither birth date survives, in any form',
  !serialised.includes(ADULT_DOB) && !serialised.includes(CHILD_DOB) &&
  !serialised.includes('dob') && !serialised.includes('birth'),
  'they are read to decide and forgotten');
for (const forbidden of ['rank', 'position', 'index', 'place', 'ordinal', 'score']) {
  check(`no "${forbidden}" field exists to print a placing into`, !(forbidden in full));
}

check('a name withheld leaves no name behind',
  toPublicPerson(row(), { ...CONSENT_ALL, name: null }, 'ar')?.name === null);
check('a membership number withheld leaves no number behind',
  toPublicPerson(row(), { ...CONSENT_ALL, memberNumber: false }, 'ar')?.memberNumber === null);
check('figures withheld are null and never zero',
  toPublicPerson(row(), { ...CONSENT_ALL, figures: false }, 'ar')?.hours === null,
  'zero would read as "did nothing", which is a claim about them');
eq('hours reach the card whole, never as the minutes the ledger holds',
  [person({ minutes: 6000 }).hours, person({ minutes: 89 }).hours, person({ minutes: 0 }).hours],
  [100, 1, 0],
  'the odd twenty minutes is not something a thank-you publishes');
check('badges withheld leave an empty list',
  toPublicPerson(row(), { ...CONSENT_ALL, badges: false }, 'ar')?.badges.length === 0);
check('a photograph is only ever requested with consent AND a stored version',
  toPublicPerson(row({ photo_version: null }), CONSENT_ALL, 'ar')?.showPhoto === false &&
  toPublicPerson(row(), { ...CONSENT_ALL, photo: false }, 'ar')?.showPhoto === false);

eq('the membership number is formatted as the card prints it', full.memberNumber, 'T014');
eq('the name printed is the one consent chose, never one picked here',
  toPublicPerson(row({ display_name: 'أبو خالد' }), { ...CONSENT_ALL, name: 'أبو خالد' }, 'ar')?.name,
  'أبو خالد');
eq('the stage is carried in the reader\'s language only',
  [toPublicPerson(row(), CONSENT_ALL, 'ar')?.stage, toPublicPerson(row(), CONSENT_ALL, 'en')?.stage],
  ['العمل الميداني', 'Field work']);

/* ------------------------------------------------------------------ *
 * 3. The join year, as text
 * ------------------------------------------------------------------ */
console.log('\n3. the join year');

eq('the year is sliced out of YYYY-MM-DD text', person({ joined_on: '2021-12-31' }).joinedYear, '2021');
check('a row with no join date is not published with a guessed one',
  toPublicPerson(row({ joined_on: null }), CONSENT_ALL, 'ar') === null);
check('nor is a malformed one',
  toPublicPerson(row({ joined_on: '2021' }), CONSENT_ALL, 'ar') === null &&
  toPublicPerson(row({ joined_on: 'yesterday' }), CONSENT_ALL, 'ar') === null);
const libCode = strip(read('src/lib/continuity.ts'));
check('lib/continuity.ts reads a clock in exactly one place, and it is beirutToday',
  (libCode.match(/new Date\(/g) ?? []).length === 1 &&
  /beirutToday\(now: Date = new Date\(\)\)/.test(libCode),
  'a join date parsed into a Date lands on the wrong day, and then in the wrong year');
check('and compares dates as text everywhere else',
  /joinedOn\.slice\(0, 4\)/.test(libCode) && !/getFullYear|Date\.parse/.test(libCode));

/* ------------------------------------------------------------------ *
 * 4. Badges beside a name
 * ------------------------------------------------------------------ */
console.log('\n4. badges');

eq('continuity-maker is dropped — everybody here holds it',
  notableBadges(['continuity-maker', 'hundred-hours']), ['hundred-hours']);
eq('the order the badges arrived in is left alone',
  notableBadges(['certs-3', 'hundred-hours', 'year-1']), ['certs-3', 'hundred-hours', 'year-1']);
eq('the list is capped', notableBadges(Array(20).fill('certs-3'), 3).length, 3);
eq('and capped by default at BADGE_LIMIT',
  notableBadges(Array(20).fill('certs-3')).length, BADGE_LIMIT);
eq('no badges at all is an empty list, never a crash', notableBadges(null), []);

/* ------------------------------------------------------------------ *
 * 5. Sorting is a reading order, never a ranking
 * ------------------------------------------------------------------ */
console.log('\n5. sorting');

const roll: ContinuityPerson[] = [
  person({ id: 'c', joined_on: '2019-01-02', full_name: 'جميل', minutes: 6000, stage_ar: 'المرحلة الثانية', stage_number: 2 }),
  person({ id: 'a', joined_on: '2019-11-30', full_name: 'أحمد', minutes: 54000, stage_ar: 'العمل الميداني', stage_number: 3 }),
  person({ id: 'b', joined_on: '2021-05-05', full_name: 'بشرى', minutes: 30000, stage_ar: 'العمل الميداني', stage_number: 3 }),
  person({ id: 'd', joined_on: '2023-08-08', full_name: 'دلال', minutes: null, stage_ar: null, stage_en: null, stage_number: null }),
];

eq('longest-serving puts the earliest year first',
  sortRoll(roll, 'longest', 'ar').map((p) => p.joinedYear), ['2019', '2019', '2021', '2023']);
eq(
  'and orders within a year alphabetically, NOT by the day',
  sortRoll(roll, 'longest', 'ar').slice(0, 2).map((p) => p.id),
  ['a', 'c'],
  'أحمد joined in November and جميل in January; ordering by date would publish the day the card does not show',
);
eq('most-hours descends', sortRoll(roll, 'hours', 'ar').slice(0, 3).map((p) => p.id), ['a', 'b', 'c']);
eq(
  'and separates two people shown the same figure only by name',
  sortRoll(
    [person({ id: 'z', full_name: 'ياسر', minutes: 119 }), person({ id: 'y', full_name: 'أمل', minutes: 60 })],
    'hours', 'ar',
  ).map((p) => p.id),
  ['y', 'z'],
  'both read as one hour on the card; ordering by the minutes would publish them',
);
eq('a withheld figure sorts to the end rather than being read as zero',
  sortRoll(roll, 'hours', 'ar').at(-1)?.id, 'd');
eq('alphabetical is alphabetical', sortRoll(roll, 'name', 'ar').map((p) => p.name),
  ['أحمد', 'بشرى', 'جميل', 'دلال']);

const before = roll.map((p) => p.id);
sortRoll(roll, 'hours', 'ar');
eq('sortRoll leaves its input alone — the caller still holds the unsorted roll',
  roll.map((p) => p.id), before);
check('nothing sortRoll returns carries where it landed',
  sortRoll(roll, 'hours', 'ar').every(
    (p) => Object.keys(p).sort().join() === [...EXPECTED_KEYS].sort().join(),
  ));
check('every sort in SORTS is handled and returns everybody',
  SORTS.every((s) => sortRoll(roll, s, 'ar').length === roll.length));

eq('an unknown sort falls back to the default', parseSort('best'), DEFAULT_SORT);
eq('as does a missing one', parseSort(undefined), DEFAULT_SORT);
eq('as does an array, which is what a repeated query parameter gives you',
  parseSort(['hours', 'name']), DEFAULT_SORT);
check('a known sort is honoured', SORTS.every((s) => parseSort(s) === s));

/* ------------------------------------------------------------------ *
 * 6. Filtering
 * ------------------------------------------------------------------ */
console.log('\n6. filtering');

eq('the year menu lists what is present, newest first, once each',
  joiningYears(roll), ['2023', '2021', '2019']);
eq('the stage menu is in journey order and never shows the number',
  stageOptions(roll), [
    { label: 'المرحلة الثانية', number: 2 },
    { label: 'العمل الميداني', number: 3 },
  ]);
eq('somebody with no stage adds no menu entry',
  stageOptions([person({ stage_ar: null, stage_number: null })]), []);

eq('filtering by year keeps only that year',
  filterRoll(roll, { year: '2019', stage: null }).map((p) => p.id), ['c', 'a']);
eq('filtering by stage keeps only that stage',
  filterRoll(roll, { year: null, stage: 'العمل الميداني' }).map((p) => p.id), ['a', 'b']);
eq('the two narrow together',
  filterRoll(roll, { year: '2019', stage: 'العمل الميداني' }).map((p) => p.id), ['a']);
eq('no filter is everybody', filterRoll(roll, { year: null, stage: null }).length, roll.length);

const untouched = roll.map((p) => p.id);
filterRoll(roll, { year: '2019', stage: null });
eq('filterRoll leaves its input alone', roll.map((p) => p.id), untouched);

eq('a year nobody joined in is ignored rather than answered',
  parseFilter(roll, '1999', undefined), { year: null, stage: null },
  'answering "nobody matches" would make the filter an oracle');
eq('a stage nobody is at is ignored the same way',
  parseFilter(roll, undefined, 'المرحلة السادسة'), { year: null, stage: null });
eq('a year that is present is accepted',
  parseFilter(roll, '2021', undefined), { year: '2021', stage: null });
eq('a stage that is present is accepted',
  parseFilter(roll, undefined, 'العمل الميداني'), { year: null, stage: 'العمل الميداني' });
eq('an array parameter is not a filter', parseFilter(roll, ['2019', '2021'], undefined),
  { year: null, stage: null });
eq('and the menus of an empty roll offer nothing to filter by',
  [joiningYears([]).length, stageOptions([]).length, parseFilter([], '2019', 'x')],
  [0, 0, { year: null, stage: null }]);

/* ------------------------------------------------------------------ *
 * 7. No position numbers — facts about the page, not about its look
 * ------------------------------------------------------------------ */
console.log('\n7. no positions');

const page = read('src/app/[lang]/continuity/page.tsx');

const code = strip(page);

check('the list of people is unordered markup', !/<ol[\s>]/.test(code) && /<ul[\s>]/.test(code));
check('no ordered-list styling sneaks the numbers back in',
  !/list-decimal|list-\[decimal|counter-(reset|increment)/.test(code));

/* Every `.map(` callback on the page takes exactly one parameter. A second one
 * is the array index, and an index rendered beside a person is a placing. */
const mapParams = [...code.matchAll(/\.map\(\s*(?:\(([^)]*)\)|([A-Za-z_$][\w$]*))\s*=>/g)].map(
  (m) => (m[1] ?? m[2] ?? '').trim(),
);
check('the page has map callbacks to check at all', mapParams.length >= 3, `${mapParams.length} found`);
check('and not one of them takes an index',
  mapParams.every((p) => !p.includes(',')),
  mapParams.filter((p) => p.includes(',')).join(' | '));

check('nothing on the page adds one to an offset',
  !/\b(i|idx|index|n)\s*\+\s*1\b/.test(code));
check('the page never renders a number it was not given',
  !/#\s*\{|№/.test(code));

/*
 * "It is not a ranking" has to be read BEFORE the sort control, not after it.
 * Source order does not settle that — Frame is declared below the component
 * that uses it — so this reads the rendered order out of Frame itself: the
 * sentence, then the slot everything else fills.
 */
const frameAt = code.indexOf('function Frame(');
const frame = frameAt === -1 ? '' : code.slice(frameAt);
/*
 * CONTROL, and it comes first. `indexOf` returns −1 when Frame is renamed, and
 * `slice(-1)` is one character: every check below would then be reasoning about
 * a closing brace. An unfound region is a HOLE, not a quiet pass.
 */
check('CONTROL: the Frame component was actually found and sliced',
  frame.length > 200 && frame.includes('{children}'),
  frame.length === 0 ? 'function Frame( is not in the page' : `${frame.length} chars`);
check('the page says it is not a ranking, above everything the reader will sort',
  frame.includes('t.notRanked') && frame.indexOf('t.notRanked') < frame.indexOf('{children}'));

check('lib/continuity.ts declares no field a placing could live in',
  !/^\s*(rank|position|index|placing)\??\s*:/m.test(read('src/lib/continuity.ts')));

for (const [name, strings] of [['ar', continuityAr], ['en', continuityEn]] as const) {
  check(`the ${name} strings carry no placing vocabulary`,
    !Object.values(strings).some((v) => /#\s*\d|\bno\.\s*\d|المركز|المرتبة|\btop\s*\d/i.test(v)));
}

/* ------------------------------------------------------------------ *
 * 8. The strings
 * ------------------------------------------------------------------ */
console.log('\n8. the strings');

const arKeys = Object.keys(continuityAr).sort();
const enKeys = Object.keys(continuityEn).sort();
eq('continuityAr and continuityEn hold exactly the same keys', arKeys, enKeys);
check('no string is empty',
  [...Object.values(continuityAr), ...Object.values(continuityEn)].every((v) => v.trim().length > 0));
check('no key holds the same literal in both languages',
  arKeys.every((k) => continuityAr[k as keyof typeof continuityAr] !== continuityEn[k as keyof typeof continuityEn]),
  arKeys.filter((k) => continuityAr[k as keyof typeof continuityAr] === continuityEn[k as keyof typeof continuityEn]).join(', '));
check('the count template carries its placeholder in both languages',
  continuityAr.showing.includes('{n}') && continuityEn.showing.includes('{n}'));
check('the empty state explains consent rather than looking broken',
  continuityAr.emptyBody.includes('موافقته') && /consent|agreed/i.test(continuityEn.emptyBody));

check('the strings live outside types.ts / ar.ts / en.ts',
  !/continuity/i.test(read('src/lib/dictionaries/types.ts')),
  'the shared dictionary is edited by several people at once');

/* ------------------------------------------------------------------ *
 * 9. Where the page gets its people from
 * ------------------------------------------------------------------ */
console.log('\n9. the query');

const data = read('src/lib/continuity-data.ts');

check('the page reads the granted badge', data.includes("a.code = 'continuity-maker'"));
check('and only while it stands', data.includes('a.revoked_at IS NULL'));
check('the 2023 rule is not restated here — one definition, in achievements.ts',
  !/2023-12-31|DATE '2023/.test(data),
  'a second copy of the rule is a page and a badge that can disagree');
check('a roster line is only ever reached through the account that claimed it',
  /claimed_by\s*=\s*u\.id\s*AND\s*r\.approved_at IS NOT NULL/.test(data),
  'unclaimed lines are real people who have consented to nothing');
check('the roster is joined from users, never queried as the starting table',
  /FROM achievements a/.test(data) && !/FROM volunteer_roster/.test(data));
check('the join date comes back as YYYY-MM-DD text',
  /to_char\(/.test(data) && data.includes("'YYYY-MM-DD'"));
check('and the created_at fallback is converted to Beirut before it becomes a date',
  data.includes("AT TIME ZONE 'Asia/Beirut'"),
  'in GMT an account made at 01:00 on 1 January reads as the previous year');
check('the query imposes no order that could read as a ranking',
  /ORDER BY u\.id/.test(data) && !/ORDER BY[\s\S]{0,40}(minutes|joined_on)\b/.test(data));
check('only non-revoked certificates are counted', data.includes("c.revoked_at IS NULL"));

const lib = read('src/lib/continuity.ts');
check('the page asks about consent through buildRoll and nowhere else',
  page.includes('buildRoll(') && !page.includes('consentFor('));
check('and consentFor has exactly one caller',
  (lib.match(/consentFor\(/g) ?? []).length === 2,
  'its definition and the single call in buildRoll');
check('the consent decision is delegated, not reimplemented',
  /from '@\/lib\/visibility'/.test(lib) &&
  /publicIdentity\(/.test(lib) && /treatAsMinor\(/.test(lib));
check('the page reads no birth date of its own',
  !/dob|date_of_birth|isMinorOn/.test(page),
  'the decision is made once, in consentFor, from data the page never holds');
check('the integration point is still named, so the next change knows where to go',
  /INTEGRATION POINT/.test(lib));

/* ------------------------------------------------------------------ *
 * 10. It fits on a phone and can be tapped
 * ------------------------------------------------------------------ */
console.log('\n10. the small screen');

check('the shared select style is 44px tall', /CONTROL =[\s\S]{0,200}min-h-11/.test(code));
check('so are the submit button and the clear link',
  (code.match(/min-h-11/g) ?? []).length >= 3,
  'one shared select class, the button, the link');
check('the grid starts at one column and widens',
  /grid[\s\S]{0,60}sm:grid-cols-2/.test(code));
/*
 * The reason here changed; the check did not, and that is worth saying rather
 * than quietly leaving a stale sentence behind.
 *
 * It used to be that formatNumber gave Arabic-Indic digits while formatDuration
 * gave Latin, so mixing them on one card put two scripts side by side.
 * formatNumber is Latin in both languages now and that clash is gone. One
 * function for every figure on the card is still what keeps them consistent the
 * next time somebody changes their mind about digits.
 */
check('the card sets every figure through one formatter',
  !/formatDuration/.test(code) && (code.match(/formatNumber\(/g) ?? []).length >= 4,
  'one function for all four figures, so they cannot drift apart');
check('a figure of zero is not printed beside somebody being thanked',
  /\{!!person\.hours &&/.test(code) && /\{!!person\.activities &&/.test(code) &&
  /\{!!person\.certificates &&/.test(code));
check('every select sits in a Field, and Field ties its label to its control',
  /htmlFor=\{id\}/.test(code) && (code.match(/<Field\s+id=/g) ?? []).length >= 3);
check('the filters work with no JavaScript at all',
  code.includes('method="get"') && !code.includes("'use client'"));

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
