/*
 * What a scanned membership card is allowed to tell a stranger.
 *
 * The card's QR used to carry `?member=NNNN`, and membership numbers run in
 * sequence from T014 to T473. A loop counting to five hundred returned the
 * full name and stage of every volunteer in the association — four hundred and
 * thirty-nine people, from a public page, with no login. The card was not the
 * leak; the identifier was.
 *
 * Two things have to hold now, and neither is the sort of thing to leave to a
 * template. The token must be unguessable, and the public view must be built
 * from an allowlist rather than by hiding columns — because "the page does not
 * print it" and "it never left the server" are different guarantees, and only
 * the second one survives someone adding a debug dump or a JSON endpoint.
 *
 * PURE: the allowlist and the status rules are pure functions, so this needs
 * no database and cannot be fooled by whatever happens to be in one.
 */

import { fileURLToPath } from 'node:url';

/* Every read below is a text assertion over application source, so it goes
 * through the shared reader, which normalises CRLF to LF. See the header of
 * scripts/source-text.mts for the two failures that paid for it. */
import { readSource } from './source-text.mts';
import {
  cardStatusOf, monthOf, toPublicCard, NEVER_PUBLIC,
} from '../src/lib/card-view.ts';

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

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/* A row carrying everything a careless `SELECT *` would carry. Nothing on the
 * second half of this may survive into the public object. */
const dangerousRow = {
  full_name: 'زياد الفواز',
  member_number: 14,
  is_public: true,
  account_status: 'active',
  membership_status: 'active_volunteer',
  stage_label: 'العمل الميداني',
  created_at: new Date('2018-03-05T10:00:00Z'),
  updated_at: new Date('2026-08-01T10:00:00Z'),
  // Everything below is the reason this function exists.
  date_of_birth: '2011-03-15',
  age: 15,
  is_minor: true,
  guardian_name: 'والد المتطوّع',
  guardian_phone: '03654321',
  emergency_name: 'والدة المتطوّع',
  emergency_phone: '03123456',
  medical_notes: 'حساسية من البنسلين',
  phone: '03998877',
  email: 'someone@example.com',
  user_id: 'd53b8741-8813-4714-a9ca-7edbb9534e73',
  card_token: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
  password_hash: '$argon2id$v=19$...',
  reject_reason: 'internal note nobody outside should read',
};

/* ------------------------------------------------------------------ *
 * 1. Nothing forbidden survives the allowlist
 * ------------------------------------------------------------------ */
console.log('\n1. the allowlist');

const publicCard = toPublicCard(dangerousRow);
const serialised = JSON.stringify(publicCard);

for (const field of NEVER_PUBLIC) {
  check(`the public card carries no "${field}"`, !(field in (publicCard as object)));
}

/* Not just absent as a key — absent as a value. A birth date copied into a
 * differently-named field would pass the check above and fail this one. */
const forbiddenValues: Array<[string, string]> = [
  ['the birth date', '2011-03-15'],
  ["the guardian's name", 'والد المتطوّع'],
  ["the guardian's phone", '03654321'],
  ['the emergency contact', 'والدة المتطوّع'],
  ['the emergency phone', '03123456'],
  ['the medical notes', 'حساسية من البنسلين'],
  ['the phone number', '03998877'],
  ['the email address', 'someone@example.com'],
  ['the internal user id', 'd53b8741-8813-4714-a9ca-7edbb9534e73'],
  ['the card token itself', 'a1b2c3d4e5f60718293a4b5c6d7e8f90'],
  ['the password hash', '$argon2id$'],
  ['an internal reason', 'internal note nobody outside should read'],
];
for (const [what, value] of forbiddenValues) {
  check(`${what} does not appear anywhere in the serialised card`, !serialised.includes(value));
}
check('nor does the age, as a number', !serialised.includes('15') || !serialised.includes('"age"'));

/* ------------------------------------------------------------------ *
 * 2. What it DOES say, for a genuine card
 * ------------------------------------------------------------------ */
console.log('\n2. what a genuine card shows');

eq('the holder is named', publicCard.fullName, 'زياد الفواز');
eq('the membership number is formatted, not raw', publicCard.memberNumber, 'T014');
eq('the stage is named, not numbered', publicCard.stageLabel, 'العمل الميداني');
eq('membership is dated to the month, never the day', publicCard.memberSince, '2018-03');
eq('the last update is dated to the month too', publicCard.updated, '2026-08');
eq('the card reads as active', publicCard.status, 'active');
check('the photo is allowed only because the profile is public', publicCard.showPhoto === true);
eq('a private profile shows no photo',
  toPublicCard({ ...dangerousRow, is_public: false }).showPhoto, false);

/* ------------------------------------------------------------------ *
 * 3. A card that is not current says nothing about its holder
 * ------------------------------------------------------------------ */
console.log('\n3. anything other than genuine reveals nothing');

const suspended = toPublicCard({ ...dangerousRow, account_status: 'suspended' });
eq('a suspended card reads as suspended', suspended.status, 'suspended');
eq('and does not name the holder', suspended.fullName, null);
eq('and does not give the membership number', suspended.memberNumber, null);
eq('and does not give the stage', suspended.stageLabel, null);

const unknown = toPublicCard(null);
eq('an unknown token reads as unknown', unknown.status, 'unknown');
eq('and names nobody', unknown.fullName, null);
check('an unknown token and a suspended one differ only in status, not in detail',
  unknown.fullName === suspended.fullName && unknown.memberNumber === suspended.memberNumber);

/* ------------------------------------------------------------------ *
 * 4. The status rules
 * ------------------------------------------------------------------ */
console.log('\n4. card status');

const st = (o: Partial<Parameters<typeof cardStatusOf>[0]>) =>
  cardStatusOf({ accountStatus: 'active', membershipStatus: 'active_volunteer', hasMemberNumber: true, ...o });

eq('an active volunteer is active', st({}), 'active');
eq('a newly accepted volunteer is active', st({ membershipStatus: 'accepted_volunteer' }), 'active');
eq('an inactive volunteer is inactive', st({ membershipStatus: 'inactive_volunteer' }), 'inactive');
eq('an alumnus is inactive, not suspended', st({ membershipStatus: 'volunteer_alumni' }), 'inactive');
eq('a suspended account is suspended', st({ accountStatus: 'suspended' }), 'suspended');
eq('a suspended membership is suspended', st({ membershipStatus: 'suspended' }), 'suspended');
eq('a deactivated account is not active', st({ accountStatus: 'deactivated' }), 'inactive');
eq('no membership number means no card', st({ hasMemberNumber: false }), 'unknown');
eq('a learner has no card', st({ membershipStatus: 'registered_user' }), 'unknown');

/* Alumni and inactive collapse together on purpose: a checkpoint does not need
 * to know which, and spelling it out is a disclosure with no purpose. */
eq('alumni and inactive are indistinguishable to a stranger',
  st({ membershipStatus: 'volunteer_alumni' }), st({ membershipStatus: 'inactive_volunteer' }));

/* ------------------------------------------------------------------ *
 * 5. Dates never carry a day
 * ------------------------------------------------------------------ */
console.log('\n5. month precision');

eq('a date reduces to its month', monthOf(new Date('2018-03-05T10:00:00Z')), '2018-03');
eq('an ISO string works too', monthOf('2026-06-15T09:00:00Z'), '2026-06');
/* The month is Beirut's, not UTC's. 22:00 on the 31st of December is already
 * January where the association is, and a card saying otherwise would be
 * saying a member joined in a year they did not. */
eq('the last hours of a month belong to the month Beirut is in',
  monthOf('2026-12-31T22:00:00Z'), '2027-01');
eq('nothing is nothing', monthOf(null), null);
eq('rubbish is nothing', monthOf('not a date'), null);
check('no output ever contains a day component',
  ['2018-03-05T10:00:00Z', '2026-01-01T00:00:00Z'].every((d) => (monthOf(d) ?? '').length === 7));

/* ------------------------------------------------------------------ *
 * 6. The identifier itself
 * ------------------------------------------------------------------ */
console.log('\n6. the token cannot be counted to');

const certs = readSource(`${ROOT}src/lib/certificates.ts`);
check('lookup is by card_token, not by membership number',
  certs.includes('WHERE p.card_token = $1'));
check('the old findMember lookup is gone entirely',
  !certs.includes('findMember'),
  'a sequential identifier must not remain reachable');
check('the token is shape-checked before it reaches SQL',
  /\[0-9a-f\]\{32,\}/.test(certs));

const verifyPage = readSource(`${ROOT}src/app/[lang]/verify/page.tsx`);
check('the public verify page no longer accepts ?member=',
  !/searchParams[\s\S]{0,200}member/.test(verifyPage) && !verifyPage.includes('findMember'));

const migration = readSource(`${ROOT}migrations/026_card_token.sql`);
check('the token comes from a CSPRNG, not from a counter or a timestamp',
  migration.includes('gen_random_bytes'));
check('and is at least 16 bytes', /gen_random_bytes\(\s*(1[6-9]|[2-9]\d)\s*\)/.test(migration));
check('a uniqueness constraint makes collision impossible rather than unlikely',
  migration.includes('CREATE UNIQUE INDEX'));

const cardPage = readSource(`${ROOT}src/app/[lang]/account/card/page.tsx`);
check('the card QR points at the token route',
  cardPage.includes('/verify/card/${profile.card_token}'));
check('and never falls back to the membership number',
  !cardPage.includes('verify?member='));

const publicPage = readSource(`${ROOT}src/app/[lang]/verify/card/[token]/page.tsx`);
check('the public card page renders only what toPublicCard returns',
  publicPage.includes('toPublicCard(row)') && !publicPage.includes('row.'),
  'reading row fields directly would bypass the allowlist');
check('the public card page is not indexable',
  publicPage.includes('index: false'));

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
