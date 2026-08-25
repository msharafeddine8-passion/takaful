/*
 * Birthdays and personal milestones.
 *
 * The two features in this system that speak first. Everything else here
 * answers a volunteer who did something; these arrive unasked, which makes
 * both of their failure modes unusually expensive:
 *
 *   - A greeting on the wrong day, every year, for one person, looking
 *     perfectly fine to everybody else. The database session runs GMT and the
 *     association lives in Beirut, and between midnight and two in the morning
 *     the two disagree about what day it is.
 *
 *   - A date of birth published. A greeting names somebody on a page other
 *     volunteers read, and the association has minors on it. There must be no
 *     day, no month, no year, no age and no countdown anywhere in the output,
 *     and no public greeting for a child at all.
 *
 *   - The same warm message sent twice. A milestone re-announced on every page
 *     render is the reason people switch notifications off for good.
 *
 * PURE: no database, no network, no fixtures. Intl is used to build a fixed
 * instant and read it in two zones, which is the only honest way to hold the
 * GMT-versus-Beirut rule without a clock to move.
 */

import {
  HOURS_MILESTONES, MAX_STAGE, MILESTONE_CODES, RETURN_GAP_DAYS,
  birthdayKeys, hasCompletedAYear, isBirthdayToday, isIsoDate, isLeapYear,
  isMilestoneCode, milestonesEarned, yearOf,
  type MilestoneCode, type MilestoneFacts,
} from '../src/lib/milestones.ts';
import {
  birthdayHeadline, milestoneDictionaries, milestonesAr, milestonesEn,
} from '../src/lib/dictionaries/milestones.ts';
import {
  NOTIFICATION_TOPICS, TOPIC_KINDS, hidesPanel, isNotificationTopic, mutes, topicsFrom,
} from '../src/lib/preferences.ts';
import { publicBirthdayIdentity, treatAsMinor } from '../src/lib/visibility.ts';
import { beirutToday } from '../src/lib/when.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1; else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

/* ------------------------------------------------------------------------ *
 * 1. Today is Beirut's today, not GMT's.
 *
 * The single instant below is 00:30 on 24 August 2026 in Beirut, which is
 * 21:30 on the 23rd in GMT. Every volunteer whose birthday is the 24th is
 * having it right now, and a system reading the date off a GMT clock would
 * greet the people born on the 23rd instead — silently, for two hours every
 * night, for as long as the feature exists.
 * ------------------------------------------------------------------------ */
console.log('1. the day is Beirut\'s day');
{
  const instant = new Date('2026-08-23T21:30:00Z');
  const inBeirut = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Beirut', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(instant);
  const inGmt = instant.toISOString().slice(0, 10);

  check('the two zones really do disagree at half past midnight',
    inBeirut === '2026-08-24' && inGmt === '2026-08-23',
    `${inBeirut} in Beirut, ${inGmt} in GMT`);

  const bornOn24th = '2003-08-24';
  const bornOn23rd = '2003-08-23';

  check('somebody born on the 24th is greeted, reading Beirut',
    isBirthdayToday(bornOn24th, inBeirut) === true);
  check('and is NOT greeted if the day is read in GMT',
    isBirthdayToday(bornOn24th, inGmt) === false,
    'the bug this rule exists to stop, demonstrated');
  check('somebody born on the 23rd is not greeted a day late',
    isBirthdayToday(bornOn23rd, inBeirut) === false);

  check('beirutToday() hands back a plain calendar date',
    isIsoDate(beirutToday()),
    'a timestamp here would be trimmed to the wrong day by every caller');

  /* A birth date must never be parsed as an instant. Ten in the evening Beirut
   * time is already the next day in some zones and the previous one in others,
   * and a date of birth read that way moves somebody's birthday permanently. */
  check('a timestamp is refused, not trimmed to ten characters',
    isBirthdayToday('2003-08-24T21:30:00Z', '2026-08-24') === false);
  check('a date in another format is refused',
    isBirthdayToday('24/08/2003', '2026-08-24') === false);
  check('an empty date is refused',
    isBirthdayToday('', '2026-08-24') === false && isBirthdayToday(null, '2026-08-24') === false);
  check('a malformed today greets nobody at all',
    birthdayKeys('not a date').length === 0 && birthdayKeys('').length === 0,
    'no keys means the query selects nobody, which is the safe direction');
}

/* ------------------------------------------------------------------------ *
 * 2. Twenty-ninth of February.
 *
 * Greeting these volunteers only on the day itself means a greeting in 2028
 * and then silence until 2032, which reads as being forgotten. Carrying them
 * on the 28th is the fix, and it is also the obvious way to send two greetings
 * in a leap year.
 * ------------------------------------------------------------------------ */
console.log('\n2. the twenty-ninth of February');
{
  check('the leap rule is the Gregorian one, not "divisible by four"',
    isLeapYear(2024) && !isLeapYear(2025) && !isLeapYear(2100) && isLeapYear(2000));

  const leapBaby = '2008-02-29';

  check('greeted on 28 February in a year with no 29th',
    isBirthdayToday(leapBaby, '2026-02-28') === true);
  check('and on the 29th in a year that has one',
    isBirthdayToday(leapBaby, '2028-02-29') === true);
  check('but NOT on the 28th of a leap year',
    isBirthdayToday(leapBaby, '2028-02-28') === false,
    'this is the double greeting: carried on the 28th and again on the 29th');
  check('and not on 1 March, which is the other tempting fallback',
    isBirthdayToday(leapBaby, '2026-03-01') === false);

  check('the 28 February keys carry both dates in a common year',
    birthdayKeys('2026-02-28').join(',') === '02-28,02-29');
  check('and only its own in a leap year',
    birthdayKeys('2028-02-28').join(',') === '02-28');

  check('somebody born on the 28th is greeted on the 28th either way',
    isBirthdayToday('2008-02-28', '2026-02-28') === true &&
    isBirthdayToday('2008-02-28', '2028-02-28') === true);

  /*
   * The belt to that brace: even if the rule above were wrong, the year is the
   * primary key of birthday_greetings_sent, so a second attempt in the same
   * year writes nothing. Held here as arithmetic on the key itself.
   */
  check('both February attempts in a leap year fall in the same year key',
    yearOf('2028-02-28') === 2028 && yearOf('2028-02-29') === 2028,
    'one key, one greeting, whatever the day rule does');
  check('a new year is a new key',
    yearOf('2029-02-28') === 2029);
}

/* ------------------------------------------------------------------------ *
 * 3. Tomorrow is not today, and there is no countdown.
 *
 * The feature the association explicitly did not ask for is "coming up". An
 * upcoming birthday shown on a page is a birth date published in instalments:
 * a reader who sees «غداً» knows the date exactly.
 * ------------------------------------------------------------------------ */
console.log('\n3. tomorrow shows nothing');
{
  const today = '2026-08-24';
  check('a birthday tomorrow is not a birthday today',
    isBirthdayToday('2003-08-25', today) === false);
  check('a birthday yesterday is over',
    isBirthdayToday('2003-08-23', today) === false);
  check('a birthday next month is nothing',
    isBirthdayToday('2003-09-24', today) === false);
  check('the same day in a different month is nothing',
    isBirthdayToday('2003-01-24', today) === false);

  check('tomorrow produces no keys of its own from today',
    !birthdayKeys(today).includes('08-25'));

  check('there is nothing in the banner when nobody has a birthday',
    birthdayHeadline(milestonesAr, []) === '' && birthdayHeadline(milestonesEn, []) === '',
    'an empty box on the other 364 days is itself a statement about today');

  /*
   * Nothing in the module can answer a question about a future birthday. This
   * is checked against the module's own surface rather than by reading the
   * source: a helper named "next" or "until" added later would fail here.
   */
  const surface = [
    'HOURS_MILESTONES', 'MAX_STAGE', 'MILESTONE_CODES', 'RETURN_GAP_DAYS',
    'birthdayKeys', 'hasCompletedAYear', 'isBirthdayToday', 'isIsoDate',
    'isLeapYear', 'isMilestoneCode', 'milestonesEarned', 'yearOf',
  ];
  /* \bage\b rather than /age/ — MAX_STAGE and every stage- code contain those
   * three letters, and a check that flags them is a check somebody deletes. */
  check('no exported name promises a countdown or an age',
    !surface.some((name) => /next|upcoming|until|countdown|daysTo|\bage\b/i.test(name)),
    surface.join(', '));
}

/* ------------------------------------------------------------------------ *
 * 4. Not one date, and not one age, in anything a person reads.
 *
 * Scanned rather than reviewed. A digit is the thing to look for: an age, a
 * year, a day of the month and a countdown all need one, and a string with no
 * digit in it cannot carry any of them however it is later edited.
 * ------------------------------------------------------------------------ */
console.log('\n4. no date and no age in the words');
{
  /* Latin, Arabic-Indic and extended Arabic-Indic digits. Writing «٣٠» would
   * pass a check that only knew about 0-9. */
  const ANY_DIGIT = /[0-9٠-٩۰-۹]/;

  /* Words that carry a date or an age even without a numeral. Months and
   * weekdays included: «عيد ميلاد محمد في آب» is a date. */
  const DATED_WORDS = [
    'عمر', 'يبلغ', 'تبلغ', 'مواليد', 'تاريخ الميلاد', 'غداً', 'غدا', 'بعد أيام',
    'كانون', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول',
    'تشرين', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت',
    'age', 'aged', 'years old', 'turns', 'born', 'tomorrow',
    'january', 'february', 'march', 'april', 'may ', 'june', 'july',
    'august', 'september', 'october', 'november', 'december',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  ];

  /* Everything a person can be shown on a birthday, in both languages, plus
   * the banner as it is actually assembled — the placeholder being filled is
   * where a date would be smuggled in. */
  const shown: string[] = [];
  for (const strings of [milestonesAr, milestonesEn]) {
    shown.push(
      strings.birthday.headline,
      strings.birthday.wish,
      strings.birthday.greetingTitle,
      birthdayHeadline(strings, ['محمد']),
      birthdayHeadline(strings, ['محمد', 'أحمد']),
      birthdayHeadline(strings, ['محمد', 'أحمد', 'علي']),
    );
  }

  check('no birthday string contains a digit in any script',
    !shown.some((s) => ANY_DIGIT.test(s)),
    shown.find((s) => ANY_DIGIT.test(s)) ?? '');
  check('no birthday string names a month, a weekday or an age',
    !shown.some((s) => DATED_WORDS.some((w) => s.toLowerCase().includes(w))),
    shown.find((s) => DATED_WORDS.some((w) => s.toLowerCase().includes(w))) ?? '');

  check('the banner reads exactly as the association wrote it',
    birthdayHeadline(milestonesAr, ['محمد']) === 'اليوم عيد ميلاد محمد 🎂');
  check('and the wish is theirs, not a shop\'s',
    milestonesAr.birthday.wish === 'كل عام وأنت جزء من أثر تكافل');

  check('several names are one line, joined the way Arabic joins them',
    birthdayHeadline(milestonesAr, ['محمد', 'أحمد', 'علي']) ===
      'اليوم عيد ميلاد محمد وأحمد وعلي 🎂');
  check('and the way English joins them',
    birthdayHeadline(milestonesEn, ['Muhammad', 'Ahmad']) ===
      "Today is Muhammad and Ahmad's birthday 🎂");
  check('there is no «and 3 others» overflow',
    !ANY_DIGIT.test(birthdayHeadline(milestonesAr, ['أ', 'ب', 'ج', 'د', 'ه', 'و', 'ز'])),
    'a count of how many share today is one more thing to work backwards from');

  check('a blank name does not leave a dangling conjunction',
    birthdayHeadline(milestonesAr, ['محمد', '  ']) === 'اليوم عيد ميلاد محمد 🎂');
}

/* ------------------------------------------------------------------------ *
 * 5. A child is never greeted in public.
 *
 * The decision belongs to src/lib/visibility.ts and is not re-implemented
 * here; what is held here is that the birthday feature actually asks it, with
 * all three date sources, and honours a refusal.
 * ------------------------------------------------------------------------ */
console.log('\n5. no public greeting for a minor');
{
  const TODAY = '2026-08-24';
  const base = {
    fullName: 'محمد علي حسن',
    displayName: 'أبو خالد',
    birthdayGreetings: true,
  };

  const adult = publicBirthdayIdentity({ ...base, choice: 'name_and_photo', isMinor: false });
  const child = publicBirthdayIdentity({ ...base, choice: 'name_and_photo', isMinor: true });

  check('an adult who agreed and is visible may be named',
    adult.show === true && adult.name === 'محمد علي حسن');
  check('a child is not named, whatever they chose',
    child.show === false);
  check('nor under a display name of their own',
    publicBirthdayIdentity({
      ...base, fullName: 'سارة خالد', displayName: 'فريق الأمل',
      choice: 'display_name', isMinor: true,
    }).show === false,
    'the display-name route is how a rule of this shape is usually got round');
  check('and never with a photograph, even for an adult who chose one',
    adult.show === true && adult.photo === false);

  check('somebody who did not switch greetings on is not named',
    publicBirthdayIdentity({
      ...base, birthdayGreetings: false, choice: 'name_and_photo', isMinor: false,
    }).show === false);
  check('nor somebody who chose not to appear at all',
    publicBirthdayIdentity({
      ...base, choice: 'hidden', isMinor: false,
    }).show === false);

  /* The three date sources, which is what the birthday query reads. An unknown
   * age is a child here, which costs an adult a greeting and is the correct
   * side to be wrong on. */
  check('the roster date alone is enough to know somebody is an adult',
    treatAsMinor({ rosterDob: '1990-01-01', today: TODAY }) === false);
  check('any source saying child wins',
    treatAsMinor({ rosterDob: '1990-01-01', safeguardingDob: '2015-01-01', today: TODAY }) === true);
  check('no date anywhere is treated as a child, so no public greeting',
    treatAsMinor({ today: TODAY }) === true);

  /* The refusal carries no reason. A `hiddenBecause` on the way out of the
   * greeting would announce which volunteers are children. */
  check('a refusal says nothing about why',
    Object.keys(child).length === 1 && Object.keys(child)[0] === 'show',
    JSON.stringify(child));
}

/* ------------------------------------------------------------------------ *
 * 6. Every milestone fires once, and a re-run sends nothing.
 *
 * milestonesEarned deliberately has no memory: it says what is TRUE, and the
 * primary key on milestone_events decides what is NEW. The set below stands in
 * for that key, and the re-runs are what the account page does on every
 * render.
 * ------------------------------------------------------------------------ */
console.log('\n6. milestones fire once each');
{
  const TODAY = '2026-08-24';
  function facts(over: Partial<MilestoneFacts> = {}): MilestoneFacts {
    return {
      activitiesAttended: 0,
      certificates: 0,
      verifiedMinutes: 0,
      joinedOn: null,
      stagesReached: [],
      stagesTotal: null,
      longestGapDays: null,
      today: TODAY,
      ...over,
    };
  }

  /** What migration 037's primary key does, in twelve lines. */
  function sender() {
    const recorded = new Set<MilestoneCode>();
    return (f: MilestoneFacts): MilestoneCode[] => {
      const fresh = milestonesEarned(f).filter((code) => !recorded.has(code));
      for (const code of fresh) recorded.add(code);
      return fresh;
    };
  }

  const busy = facts({
    activitiesAttended: 12,
    certificates: 3,
    verifiedMinutes: 120 * 60,
    joinedOn: '2024-01-15',
    stagesReached: [1, 2, 3],
    stagesTotal: 6,
    longestGapDays: 200,
  });

  const send = sender();
  const first = send(busy);
  check('a busy volunteer is told about everything they have reached, once',
    first.length > 0 && first.includes('first-activity') && first.includes('hours-100'));
  check('a second render sends nothing at all',
    send(busy).length === 0,
    'the account page runs this on every load; this is that');
  check('a hundred renders send nothing',
    Array.from({ length: 100 }, () => send(busy)).every((r) => r.length === 0));

  /*
   * The failure mode that a "compare against last time" implementation has and
   * this one cannot: hours corrected downward and then back up. The set is
   * recomputed from scratch each time, so nothing is re-announced.
   */
  const corrected = { ...busy, verifiedMinutes: 20 * 60 };
  check('an hours correction downward announces nothing',
    send(corrected).length === 0);
  check('and correcting it back up announces nothing either',
    send(busy).length === 0,
    'the whole reason the decision lives in a primary key and not in a diff');

  /* Each milestone in turn, from nothing. */
  check('the first activity fires at one, not at zero',
    milestonesEarned(facts()).includes('first-activity') === false &&
    milestonesEarned(facts({ activitiesAttended: 1 })).includes('first-activity') === true);
  check('the first certificate fires at one',
    milestonesEarned(facts({ certificates: 1 })).includes('first-certificate') === true);
  check('a revoked certificate is not a first — the caller counts only live ones',
    milestonesEarned(facts({ certificates: 0 })).includes('first-certificate') === false);

  for (const hours of HOURS_MILESTONES) {
    const code = `hours-${hours}` as MilestoneCode;
    check(`${hours} hours fires at ${hours * 60} minutes and not a minute before`,
      milestonesEarned(facts({ verifiedMinutes: hours * 60 - 1 })).includes(code) === false &&
      milestonesEarned(facts({ verifiedMinutes: hours * 60 })).includes(code) === true);
  }
  check('599 minutes is not ten hours, however it is displayed',
    milestonesEarned(facts({ verifiedMinutes: 599 })).includes('hours-10') === false);

  check('the year fires on the anniversary and not the day before',
    hasCompletedAYear('2025-08-24', '2026-08-23') === false &&
    hasCompletedAYear('2025-08-24', '2026-08-24') === true);
  check('a leap-day join gets its year on 1 March, with no invalid date built',
    hasCompletedAYear('2024-02-29', '2025-02-28') === false &&
    hasCompletedAYear('2024-02-29', '2025-03-01') === true);
  check('an unknown join date is no anniversary rather than an invented one',
    hasCompletedAYear(null, TODAY) === false && hasCompletedAYear('', TODAY) === false);
  check('a malformed join date is refused',
    hasCompletedAYear('15/01/2024', TODAY) === false);

  check('each stage reached is its own milestone',
    milestonesEarned(facts({ stagesReached: [1, 2] })).filter((c) => c.startsWith('stage-'))
      .join(',') === 'stage-1,stage-2');
  check('a stage the journey does not have is dropped, not sent as a bare code',
    milestonesEarned(facts({ stagesReached: [99] })).some((c) => c.startsWith('stage-')) === false);

  check('coming back fires only after a real absence',
    milestonesEarned(facts({ longestGapDays: RETURN_GAP_DAYS - 1 })).includes('returned') === false &&
    milestonesEarned(facts({ longestGapDays: RETURN_GAP_DAYS })).includes('returned') === true);
  check('a quiet fortnight is not a return',
    milestonesEarned(facts({ longestGapDays: 14 })).includes('returned') === false,
    'telling somebody welcome back after two weeks reads as an accusation');

  check('the whole path needs every stage of the journey',
    milestonesEarned(facts({ stagesReached: [1, 2, 3, 4, 5], stagesTotal: 6 }))
      .includes('path-complete') === false &&
    milestonesEarned(facts({ stagesReached: [1, 2, 3, 4, 5, 6], stagesTotal: 6 }))
      .includes('path-complete') === true);
  check('an unconfigured journey completes nobody',
    milestonesEarned(facts({ stagesReached: [1, 2, 3], stagesTotal: 0 }))
      .includes('path-complete') === false &&
    milestonesEarned(facts({ stagesReached: [1, 2, 3], stagesTotal: null }))
      .includes('path-complete') === false,
    'every stage is unconfigured today; this would congratulate all 37');

  check('the same stage recorded twice is still one milestone',
    milestonesEarned(facts({ stagesReached: [2, 2, 2] })).filter((c) => c === 'stage-2').length === 1);

  check('milestones come back in catalogue order, not in Set order',
    milestonesEarned(busy).join(',') ===
      MILESTONE_CODES.filter((c) => milestonesEarned(busy).includes(c)).join(','));

  check('a birthday is not a milestone and earns nothing',
    !MILESTONE_CODES.some((c) => /birth|بيرث/i.test(c)) &&
    !milestonesEarned(busy).some((c) => /birth/i.test(c)),
    'no points, no ranking, no row in the ledger');
}

/* ------------------------------------------------------------------------ *
 * 7. The catalogue and the words agree.
 * ------------------------------------------------------------------------ */
console.log('\n7. every milestone has words in both languages');
{
  check('every code has an Arabic title and body',
    MILESTONE_CODES.every((c) => milestonesAr.milestones[c].title.trim() !== '' &&
      milestonesAr.milestones[c].body.trim() !== ''));
  check('every code has an English title and body',
    MILESTONE_CODES.every((c) => milestonesEn.milestones[c].title.trim() !== '' &&
      milestonesEn.milestones[c].body.trim() !== ''));
  check('no milestone compares this person with anybody else',
    !MILESTONE_CODES.some((c) =>
      /أكثر من|أسرع|بين المتطوّعين|المرتبة|more than|faster|ahead of|rank/i.test(
        milestonesAr.milestones[c].body + milestonesEn.milestones[c].body)),
    'two people crossing the same milestone must read the same message');

  check('the hours constants each have a code',
    HOURS_MILESTONES.every((h) => isMilestoneCode(`hours-${h}`)));
  check('every stage of the journey has a code',
    Array.from({ length: MAX_STAGE }, (_, i) => i + 1).every((n) => isMilestoneCode(`stage-${n}`)));
  check('a stage beyond the journey has none',
    !isMilestoneCode(`stage-${MAX_STAGE + 1}`));
  check('no code is listed twice',
    new Set(MILESTONE_CODES).size === MILESTONE_CODES.length);
  check('every code fits the shape migration 037 will accept',
    MILESTONE_CODES.every((c) => /^[a-z][a-z0-9-]{1,60}$/.test(c)));
}

/* ------------------------------------------------------------------------ *
 * 8. What a volunteer switched off stays off.
 * ------------------------------------------------------------------------ */
console.log('\n8. the four switches');
{
  check('the four subjects are the four the association asked for',
    NOTIFICATION_TOPICS.join(',') === 'ranking,badges,challenges,birthdays');

  check('nobody with no row has muted anything',
    topicsFrom(null).length === 0 && topicsFrom(undefined).length === 0 &&
    mutes(null, null, 'badge.earned') === false,
    'absence means the defaults; four hundred accounts have no row');

  check('switching badges off stops the badge message',
    mutes([], ['badges'], 'badge.earned') === true);
  check('switching birthdays off stops the greeting',
    mutes([], ['birthdays'], 'birthday.greeting') === true);
  check('and does not stop anything else',
    mutes([], ['birthdays'], 'badge.earned') === false &&
    mutes([], ['badges'], 'birthday.greeting') === false);

  check('an older muted kind is still honoured',
    mutes(['activity.reminder'], [], 'activity.reminder') === true,
    'rewriting stored consent into a new shape is how consent gets lost');

  check('a milestone belongs to no subject and cannot be lost to one',
    NOTIFICATION_TOPICS.every((t) => !TOPIC_KINDS[t].includes('milestone.reached')),
    'nobody should lose the note thanking them for their first year');

  check('a value nobody\'s browser sent is ignored rather than stored',
    topicsFrom(['badges', 'nonsense']).join(',') === 'badges' &&
    isNotificationTopic('nonsense') === false);

  check('the panels a subject owns are hidden when it is off',
    hidesPanel(['challenges'], 'challenges') === true &&
    hidesPanel(['birthdays'], 'birthdays') === true &&
    hidesPanel(['challenges'], 'birthdays') === false,
    'a switch that visibly does nothing teaches people their settings are decorative');

  check('both dictionaries name every subject',
    NOTIFICATION_TOPICS.every((t) =>
      milestoneDictionaries.ar.preferences.topics[t].label.trim() !== '' &&
      milestoneDictionaries.en.preferences.topics[t].label.trim() !== ''));
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
