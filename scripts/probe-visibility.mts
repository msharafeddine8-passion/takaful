/*
 * Who may be named on a public page, and who may never be.
 *
 * This one is not like the others. Most probes here protect a figure or a
 * total, and a hole in them means somebody is shown the wrong number. A hole
 * in this one means a fifteen-year-old's name and photograph on a page that
 * anybody can read, forward and screenshot, and there is no correction that
 * takes that back.
 *
 * Four things it holds, and each is a way the feature could look finished and
 * be wrong:
 *
 *   - Silence is a no. A default that published people who never answered
 *     would be one word different in the migration and would read exactly as
 *     correct.
 *   - A minor is never named or photographed, whatever they chose. Including
 *     when they choose the display name and type their real one into it, which
 *     is the obvious way round a rule of this shape.
 *   - "Display name only" never falls back to the legal name. A fallback is
 *     the natural thing to write and it breaks the promise the label makes.
 *   - Opting out of a public list is not opting out of your own record. The
 *     easy mistake is to reuse the public decision to gate the private page,
 *     and it punishes exactly the people who asked for privacy.
 *
 * And one that is about the shape rather than the rules: the answer must never
 * carry a reason. A `hiddenBecause` field would be honest, useful, and would
 * end up in a payload or an empty state announcing which volunteers are
 * children.
 *
 * PURE: no database, no network. It reads migration 033 as text, only to check
 * that the schema and the code still agree about what the default is.
 */

import { readFileSync } from 'node:fs';
import {
  VISIBILITY_CHOICES, DEFAULT_VISIBILITY, ADULT_AGE,
  isVisibilityChoice, visibilityFrom, isMinorOn, treatAsMinor,
  publicIdentity, seesOwnStanding, publicBirthdayIdentity,
  type VisibilityChoice, type PublicIdentity,
} from '../src/lib/visibility.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1; else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

/** A grown-up volunteer with everything filled in. Varied per case. */
const ADULT = { isMinor: false, fullName: 'محمد علي حسن', displayName: 'أبو خالد' };
/** The same person, fifteen years old. */
const CHILD = { ...ADULT, isMinor: true };

const named = (r: PublicIdentity): string | null => (r.show ? r.name : null);
const photographed = (r: PublicIdentity): boolean => r.show && r.photo;

console.log('1. silence is a no');
{
  check('the default choice is the private one', DEFAULT_VISIBILITY === 'hidden');
  check('and it is the first one offered', VISIBILITY_CHOICES[0] === 'hidden',
    'the option people take when skimming must be the one that publishes nothing');
  check('there are exactly three', VISIBILITY_CHOICES.length === 3);

  check('a row with no value at all is private', visibilityFrom(null) === 'hidden',
    'a profile written before the column existed');
  check('an absent value is private', visibilityFrom(undefined) === 'hidden');
  check('an empty string is private', visibilityFrom('') === 'hidden');
  check('a value from some future migration is private',
    visibilityFrom('everything') === 'hidden',
    'an old build meeting a new database must fail closed, not open');
  check('a near miss is not a match', visibilityFrom('Name_And_Photo') === 'hidden');
  check('a padded value is not a match', visibilityFrom(' name_and_photo ') === 'hidden');
  check('the three real values survive the round trip',
    VISIBILITY_CHOICES.every((c) => visibilityFrom(c) === c));
  check('isVisibilityChoice refuses a number', !isVisibilityChoice(3));
  check('and refuses an object', !isVisibilityChoice({ toString: () => 'hidden' }));

  const silent = publicIdentity({ ...ADULT, choice: DEFAULT_VISIBILITY });
  check('somebody who never answered is not on the page', !silent.show,
    'an adult with a name and a photograph, and still nothing is published');
}

console.log('\n2. the schema and the code agree about the default');
{
  /*
   * READ THE LATEST MIGRATION THAT TOUCHES IT, NOT THE ONE THAT CREATED IT.
   *
   * This read only 033 and asserted the defaults it set — hidden, and birthday
   * greetings off. Migration 038 changed both, deliberately, after the
   * association decided that appearing is the ordinary state. This check went
   * on passing, because 033's text has not changed and never will: an audit
   * found it green while describing a schema that no longer exists.
   *
   * A check that reads a superseded file is worse than no check. It reports
   * agreement between the code and a database it is not looking at.
   */
  const sql = readFileSync(new URL('../migrations/033_visibility.sql', import.meta.url), 'utf8');
  const later = readFileSync(new URL('../migrations/038_visible_by_default.sql', import.meta.url), 'utf8');

  check('the current default is name_and_photo, set by 038',
    /public_visibility\s+SET DEFAULT\s+'name_and_photo'/i.test(later),
    'the association decided appearing is the ordinary state; 033 said hidden');
  check('birthday greetings now default to on',
    /birthday_greetings\s+SET DEFAULT\s+TRUE/i.test(later));

  /*
   * DEFAULT_VISIBILITY stays 'hidden' and that is not a contradiction. It is
   * the fallback for a value this build cannot read — a null from a row that
   * predates the column, a typo, a value from a future migration — and failing
   * closed there is right whatever the column default happens to be.
   */
  check('the code still fails closed on a value it cannot read',
    visibilityFrom('something nobody has taught this build') === 'hidden',
    'the column default is a decision about people; this is what to do with unreadable data');

  check('038 only ever stood in for silence',
    /visibility_chosen_at IS NULL/.test(later),
    'it must never turn "nobody asked" into "they chose"');

  check('the CHECK allows exactly the three the code knows',
    VISIBILITY_CHOICES.every((c) => sql.includes(`'${c}'`)),
    VISIBILITY_CHOICES.join(', '));
  check('the migration adds no birth date and no age to profiles',
    !/ADD COLUMN[^;]*(date_of_birth|birth_date|\bage\b|is_minor)/i.test(sql),
    'a flag on profiles saying which volunteers are children is far easier to leak than a date in a table nothing renders from');
}

console.log('\n3. a minor is never named or photographed, whatever they chose');
{
  /* The exhaustive part. Every choice against every shape of display name a
   * child could type, including the ones that are their real name wearing a
   * different hat. */
  const displayNames = [
    null, '', '   ',
    'محمد',                 // their first name
    'محمد علي حسن',          // the whole thing
    'حسن محمد',             // the same words, reordered
    'أحمد علي',             // a name they do not have, plus one they do
    'محمد الصغير',           // their name plus a word
    'فريق الأمل',            // a name of their own
  ];
  let breaches = 0;
  let photos = 0;
  for (const choice of VISIBILITY_CHOICES) {
    for (const displayName of displayNames) {
      const r = publicIdentity({ ...CHILD, choice, displayName });
      if (named(r) === CHILD.fullName) breaches += 1;
      if (photographed(r)) photos += 1;
    }
  }
  check('across every choice and every display name, the legal name never appears',
    breaches === 0, `${VISIBILITY_CHOICES.length * displayNames.length} combinations`);
  check('and no photograph is ever permitted', photos === 0);

  check('choosing name and photo publishes nothing when there is no other name',
    !publicIdentity({ ...CHILD, choice: 'name_and_photo', displayName: null }).show,
    'the option is honoured as far as it safely can be, which here is not at all');
  check('choosing name and photo with a name of their own shows that, without a photograph',
    (() => {
      const r = publicIdentity({ ...CHILD, choice: 'name_and_photo', displayName: 'فريق الأمل' });
      return r.show && r.name === 'فريق الأمل' && r.photo === false;
    })());
  check('a display name that is just their first name is refused',
    !publicIdentity({ ...CHILD, choice: 'display_name', displayName: 'محمد' }).show,
    'a first name is a real name, and this is the obvious way round the rule');
  check('a display name that is their whole name is refused',
    !publicIdentity({ ...CHILD, choice: 'display_name', displayName: 'محمد علي حسن' }).show);
  check('the same words in another order are still refused',
    !publicIdentity({ ...CHILD, choice: 'display_name', displayName: 'حسن علي' }).show);
  check('a different spelling of the same name is refused',
    !publicIdentity({
      ...CHILD, fullName: 'أحمد إبراهيم', choice: 'display_name', displayName: 'احمد ابراهيم',
    }).show,
    'أ and ا are the same name, and folding is why this cannot be spelled past');
  check('their name with a word added is refused',
    !publicIdentity({ ...CHILD, choice: 'display_name', displayName: 'محمد الصغير' }).show,
    'it still says محمد on a public page');
  check('a name that is genuinely their own is allowed',
    publicIdentity({ ...CHILD, choice: 'display_name', displayName: 'فريق الأمل' }).show);
  check('an adult may use a display name a minor could not',
    publicIdentity({ ...ADULT, choice: 'display_name', displayName: 'محمد' }).show,
    'the nickname rule protects children, and is not a house style for everybody');
}

console.log('\n4. nothing in the answer says why');
{
  const hidden = publicIdentity({ ...CHILD, choice: 'name_and_photo', displayName: null });
  check('a refusal is one field and no explanation',
    JSON.stringify(hidden) === '{"show":false}',
    'no reason, no hiddenBecause, no isMinor — one of those in a payload announces a child');
  check('a refusal for a child and a refusal for somebody who opted out are the same object',
    JSON.stringify(hidden) === JSON.stringify(publicIdentity({ ...ADULT, choice: 'hidden' })),
    'a page that could tell the two apart could tell which of its volunteers are children');
  const shown = publicIdentity({ ...ADULT, choice: 'name_and_photo' });
  check('a permission carries exactly what may be rendered',
    Object.keys(shown).sort().join(',') === 'name,photo,show');
}

console.log('\n5. display name only, for a grown-up');
{
  const r = publicIdentity({ ...ADULT, choice: 'display_name' });
  check('the display name is shown', r.show && r.name === 'أبو خالد');
  check('and no photograph with it', !photographed(r),
    'the option says name only, and a face is not a name');
  check('the legal name is nowhere in the answer', named(r) !== ADULT.fullName);

  check('nobody with an empty display name is shown their legal name instead',
    !publicIdentity({ ...ADULT, choice: 'display_name', displayName: null }).show,
    'the fallback is the natural thing to write and it breaks the promise the label made');
  check('a blank display name is the same as none',
    !publicIdentity({ ...ADULT, choice: 'display_name', displayName: '   ' }).show);
  check('a padded display name is trimmed rather than refused',
    (() => {
      const p = publicIdentity({ ...ADULT, choice: 'display_name', displayName: '  أبو خالد  ' });
      return p.show && p.name === 'أبو خالد';
    })());
}

console.log('\n6. name and photograph, for a grown-up');
{
  const r = publicIdentity({ ...ADULT, choice: 'name_and_photo' });
  check('the full name is shown', r.show && r.name === ADULT.fullName);
  check('and the photograph is permitted', photographed(r));
  check('a person with no name recorded is not published',
    !publicIdentity({ ...ADULT, choice: 'name_and_photo', fullName: '  ' }).show,
    'there is nothing to name, and a blank row on a ranking is its own kind of exposure');
  check('the choice does not leak the display name',
    named(r) !== ADULT.displayName);
}

console.log('\n7. opting out is not opting out of your own record');
{
  check('somebody hidden still sees their own standing', seesOwnStanding('hidden'),
    'the easy mistake is to reuse the public decision to gate the private page');
  check('so does everybody else',
    VISIBILITY_CHOICES.every((c: VisibilityChoice) => seesOwnStanding(c)));
  check('and the two answers are genuinely independent',
    seesOwnStanding('hidden') && !publicIdentity({ ...ADULT, choice: 'hidden' }).show,
    'hidden from the ranking, present on their own dashboard');
  check('a child sees their own standing too',
    seesOwnStanding('name_and_photo') &&
      !publicIdentity({ ...CHILD, choice: 'name_and_photo', displayName: null }).show,
    'protected on the public page, told nothing about it on their own');
}

console.log('\n8. how old somebody is, decided as text');
{
  check('eighteen is the line', ADULT_AGE === 18);
  check('the day before their eighteenth birthday they are a minor',
    isMinorOn('2008-08-25', '2026-08-24') === true);
  check('on their eighteenth birthday they are not',
    isMinorOn('2008-08-24', '2026-08-24') === false,
    'the birthday itself, which is the boundary an off-by-one lands on');
  check('the day after, plainly not', isMinorOn('2008-08-23', '2026-08-24') === false);
  check('a small child is a minor', isMinorOn('2019-01-01', '2026-08-24') === true);
  check('somebody of forty is not', isMinorOn('1986-03-02', '2026-08-24') === false);

  /* The bug this project has actually had. A birth date read as an instant
   * lands on the previous day when the session is GMT and the person is in
   * Beirut, and on the wrong day of the year that turns a seventeen-year-old
   * into an adult. Text against text has no timezone in it. */
  check('the first of January is compared as the first of January',
    isMinorOn('2009-01-01', '2026-12-31') === true,
    'made an instant this is 2008-12-31T22:00Z, a different year, a different answer');
  check('a birthday on the twenty-ninth of February holds before the first of March',
    isMinorOn('2008-02-29', '2026-02-28') === true,
    'in a non-leap year they turn eighteen on the first of March');
  check('and passes on the first of March',
    isMinorOn('2008-02-29', '2026-03-01') === false);

  check('a timestamp is refused, not trimmed to ten characters',
    isMinorOn('2008-08-24T22:00:00.000Z', '2026-08-24') === null,
    'those ten characters are the wrong day for anybody born after ten at night in Beirut');
  check('a date without padding is refused', isMinorOn('2008-8-4', '2026-08-24') === null);
  check('an empty date is refused', isMinorOn('', '2026-08-24') === null);
  check('a missing date is refused', isMinorOn(null, '2026-08-24') === null);
  check('a nonsense today is refused', isMinorOn('2008-08-24', 'today') === null);
}

console.log('\n9. two records, one answer, and the cautious one wins');
{
  const today = '2026-08-24';
  check('the safeguarding record alone can say minor',
    treatAsMinor({ safeguardingDob: '2012-04-01', sensitiveDob: null, today }));
  check('the registration record alone can say minor',
    treatAsMinor({ sensitiveDob: '2012-04-01', safeguardingDob: null, today }));
  check('either record saying minor is enough, even against the other',
    treatAsMinor({ sensitiveDob: '1990-01-01', safeguardingDob: '2012-04-01', today }),
    'a disagreement means one of the two is wrong, and publishing is not the answer to that');
  check('and the other way round as well',
    treatAsMinor({ sensitiveDob: '2012-04-01', safeguardingDob: '1990-01-01', today }));
  check('two records agreeing on an adult is an adult',
    !treatAsMinor({ sensitiveDob: '1990-01-01', safeguardingDob: '1990-01-01', today }));
  check('one usable record saying adult is enough',
    !treatAsMinor({ sensitiveDob: null, safeguardingDob: '1990-01-01', today }));
  check('an unusable record beside a usable one does not veto it',
    !treatAsMinor({ sensitiveDob: '1990-01-01T22:00:00Z', safeguardingDob: '1990-01-01', today }),
    'otherwise every adult with a stray timestamp disappears from the association');
  check('nobody knows how old they are, so they are protected',
    treatAsMinor({ sensitiveDob: null, safeguardingDob: null, today }),
    'this hides some adults with incomplete records, which is the right side to be wrong on');
  check('and an unreadable date is the same as no date',
    treatAsMinor({ sensitiveDob: '01/01/1990', safeguardingDob: '', today }));

  const unknown = publicIdentity({
    ...ADULT,
    isMinor: treatAsMinor({ sensitiveDob: null, safeguardingDob: null, today }),
    choice: 'name_and_photo',
  });
  check('an unknown age withholds the legal name and the photograph',
    named(unknown) !== ADULT.fullName && !photographed(unknown),
    'a record with no birth date in it gets exactly the protection a child gets');
  check('and there is no path from two empty records to a published photograph',
    VISIBILITY_CHOICES.every((choice) => !photographed(publicIdentity({
      ...ADULT,
      isMinor: treatAsMinor({ sensitiveDob: null, safeguardingDob: null, today }),
      choice,
    }))));
}

console.log('\n10. birthday greetings');
{
  const on = { ...ADULT, birthdayGreetings: true };
  check('off by default means no greeting, however visible the person is',
    !publicBirthdayIdentity({ ...ADULT, choice: 'name_and_photo', birthdayGreetings: false }).show,
    'agreeing to be ranked is not agreeing to have your birth date announced');
  check('turned on, a visible adult may be greeted',
    publicBirthdayIdentity({ ...on, choice: 'name_and_photo' }).show);
  check('but never with a photograph',
    !photographed(publicBirthdayIdentity({ ...on, choice: 'name_and_photo' })),
    'a face beside a date of birth is a different disclosure again');
  check('somebody hidden from the rankings is not greeted publicly either',
    !publicBirthdayIdentity({ ...on, choice: 'hidden' }).show,
    'the greeting cannot become a back door into the list they left');
  check('a greeting uses the display name when that is what they chose',
    (() => {
      const r = publicBirthdayIdentity({ ...on, choice: 'display_name' });
      return r.show && r.name === ADULT.displayName;
    })());
  check('a child is never greeted on a public page, whatever is set',
    VISIBILITY_CHOICES.every(
      (choice) => !publicBirthdayIdentity({
        ...CHILD, choice, displayName: 'فريق الأمل', birthdayGreetings: true,
      }).show,
    ),
    'a birth date, to the day, on a page strangers read');
  check('and a refusal there explains nothing either',
    JSON.stringify(publicBirthdayIdentity({ ...CHILD, choice: 'display_name', birthdayGreetings: true })) === '{"show":false}');
}

/* ------------------------------------------------------------------
 * The roster as a third source of age.
 *
 * Failing closed on an unknown age is right, and was very nearly unusable.
 * With only profiles_sensitive and safeguarding_records, twenty of the
 * association's thirty-seven accounts had no date anywhere and were therefore
 * treated as children — more than half the platform hidden from every public
 * page, not because anybody objected but because nothing knew how old they
 * were. The association's own roster carries 418 of these dates, on lines
 * these people have claimed and staff have approved.
 * ------------------------------------------------------------------ */
console.log('\nthe roster as a third source of age');
{
  const TODAY = '2026-08-24';
  check('an adult date on the roster alone is enough to be shown',
    treatAsMinor({ rosterDob: '1990-01-01', today: TODAY }) === false);
  check('a child date on the roster alone is respected',
    treatAsMinor({ rosterDob: '2015-01-01', today: TODAY }) === true);
  check('no date anywhere is still treated as a child',
    treatAsMinor({ today: TODAY }) === true,
    'the rule that made a third source necessary, not one it replaces');

  /* Disagreement resolves protectively, whichever source dissents. */
  check('the roster does not override a safeguarding record saying child',
    treatAsMinor({ safeguardingDob: '2015-01-01', rosterDob: '1990-01-01', today: TODAY }) === true);
  check('nor a sensitive record saying child',
    treatAsMinor({ sensitiveDob: '2015-01-01', rosterDob: '1990-01-01', today: TODAY }) === true);
  check('and a roster child outweighs an adult record elsewhere',
    treatAsMinor({ safeguardingDob: '1990-01-01', rosterDob: '2015-01-01', today: TODAY }) === true);

  check('a malformed roster date is no answer rather than an adult one',
    treatAsMinor({ rosterDob: '01/01/1990', today: TODAY }) === true);
  check('an empty roster date is no answer either',
    treatAsMinor({ rosterDob: '', today: TODAY }) === true);
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
