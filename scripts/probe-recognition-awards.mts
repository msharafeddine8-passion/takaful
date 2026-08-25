/*
 * The monthly awards: the rules that decide who may be considered, and the one
 * rule about who may never be shown.
 *
 * Five failures this exists to stop, none of which shows up as an error:
 *
 *   - The same four people winning every month. The three-month cooling-off is
 *     the only thing preventing it, it is arithmetic on 'YYYY-MM' text, and it
 *     is off by one in whichever direction nobody tested. The boundary is
 *     checked from both sides here, including the case that has to work:
 *     eligible again in the fourth month.
 *
 *   - Somebody in the wrong award. Volunteer of the Month asks for more than
 *     six months' standing and Rising Star for six or fewer, measured to the
 *     END of the month being judged rather than to today. The two tests are
 *     complements, so an error in either opens a gap somebody falls through or
 *     an overlap that puts a fifteen-year member in the newcomers' award.
 *
 *   - The biggest committee winning by existing. Ranked by total, the largest
 *     wins every month and «فريق الشهر» becomes an award for being numerous.
 *     The test below is the real shape of the problem: a big team with more
 *     than twice the total loses to a small team with a better average.
 *
 *   - An award to an individual under a group's name. Without a floor on
 *     active members, one person having a good month gives their committee an
 *     unbeatable average. Without a floor on attendances, two data points beat
 *     a fortnight of work.
 *
 *   - A LOSER, PUBLISHED. Five people are shortlisted and one is chosen; the
 *     other four did nothing wrong. The last section runs the whole flow —
 *     shortlist five, choose one, render the honours page — and searches every
 *     character of the output for any trace of the four who were not chosen.
 *     Migration 036 is why there is nothing to leak; this is the proof that
 *     the code agrees.
 *
 * PURE: no database, no network, no clock. Every date and period here is text.
 */

import {
  AWARD_BADGE_PREFIX, AWARD_KINDS, COOLING_OFF_MONTHS, MEMBERSHIP_MONTHS,
  PERSON_AWARDS, SHORTLIST, TEAM_MIN_ACTIVE_MEMBERS, TEAM_MIN_ATTENDANCES,
  awardBadgeCode, coolingOffPassed, eligibleFor, hasVerifiedActivity, honoursView,
  isAwardKind, isPeriod, isPersonAward, joinedLongAgo, joinedRecently, monthScore,
  parseAwardBadgeCode, periodOf, periodWindow, periodsBetween, previousPeriod,
  publicAward, shiftMonthsOnDate, shiftPeriod, shortlist, shortlistTeams,
  teamAverage, teamQualifies,
  type AwardRecord, type NomineeFacts, type TeamFacts,
} from '../src/lib/awards.ts';
import {
  AWARD_ICONS, MONTH_NAMES, awardBadgeFor, awardsAr, awardsAreComplete, awardsEn,
  formatPeriod,
} from '../src/lib/dictionaries/awards.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1; else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

/** The month everything below is judged for. August 2026, 31 days. */
const AUG = '2026-08';

/** A volunteer of long standing who had a good month and has never won. */
function person(over: Partial<NomineeFacts> = {}): NomineeFacts {
  return {
    userId: 'u-0',
    isVolunteer: true,
    joinedOn: '2021-03-14',
    verifiedMinutes: 600,
    attendances: 4,
    badges: [],
    lastWonPeriod: null,
    consentShows: true,
    ...over,
  };
}

function team(over: Partial<TeamFacts> = {}): TeamFacts {
  return {
    committee: 'لجنة الإغاثة',
    activeMembers: 6,
    verifiedMinutes: 1_200,
    attendances: 12,
    lastWonPeriod: null,
    ...over,
  };
}

/* ------------------------------------------------------------------ */
console.log('1. periods are text, and the calendar arithmetic behind them');
{
  check('a well-formed period is accepted', isPeriod('2026-08'));
  check('month 13 is not a month', !isPeriod('2026-13'));
  check('month 00 is not a month', !isPeriod('2026-00'));
  check('a full date is not a period', !isPeriod('2026-08-01'));
  check('an unpadded month is refused', !isPeriod('2026-8'),
    'the database CHECK uses the same shape, and a mismatch would be a 500');

  check('a date names its own period', periodOf('2026-08-31') === '2026-08');
  check('an unreadable date names none', periodOf('not-a-date') === null);

  check('three months on', shiftPeriod('2026-08', 3) === '2026-11');
  check('crossing the year forwards', shiftPeriod('2026-11', 3) === '2027-02');
  check('crossing the year backwards', shiftPeriod('2026-02', -3) === '2025-11');
  check('the month before', previousPeriod('2026-01') === '2025-12');

  check('a gap of three months', periodsBetween('2026-05', '2026-08') === 3);
  check('a gap across a year', periodsBetween('2025-11', '2026-02') === 3);
  check('a gap backwards is negative', periodsBetween('2026-08', '2026-05') === -3);
  check('nonsense in gives null out', periodsBetween('2026-8', '2026-05') === null);

  const window = periodWindow(AUG);
  check('August runs to the 31st', window?.startsOn === '2026-08-01' && window?.endsOn === '2026-08-31');
  check('February 2026 runs to the 28th', periodWindow('2026-02')?.endsOn === '2026-02-28');
  check('February 2028 runs to the 29th', periodWindow('2028-02')?.endsOn === '2028-02-29');
  check('a window is never built from a Date',
    typeof periodWindow(AUG)?.endsOn === 'string',
    'new Date(2026-08-01) is 02:00 on the 1st in Beirut, and the 31st of July before that');

  /* The clamp. Six months before the 31st of August is the 28th of February,
   * not the 31st (which does not exist) and not the 3rd of March (which is
   * what adding and normalising silently produces). */
  check('six months before 31 August 2026 is 28 February',
    shiftMonthsOnDate('2026-08-31', -6) === '2026-02-28');
  check('six months before 31 August 2028 is 29 February',
    shiftMonthsOnDate('2028-08-31', -6) === '2028-02-29');
  check('six months before 30 September is 31 March, not clamped needlessly',
    shiftMonthsOnDate('2026-09-30', -6) === '2026-03-30');
  check('the clamp never invents a day that is not in the month',
    ['2026-01-31', '2026-03-31', '2026-05-31', '2026-07-31', '2026-10-31', '2026-12-31']
      .every((d) => {
        const back = shiftMonthsOnDate(d, -6);
        return back !== null && periodWindow(back.slice(0, 7))!.endsOn >= back;
      }));
}

/* ------------------------------------------------------------------ */
console.log('\n2. the three-month cooling-off');
{
  check('somebody who has never won is free', coolingOffPassed(null, AUG));
  check('an empty stored period reads as never', coolingOffPassed('', AUG));

  check('winning the same month blocks it', !coolingOffPassed(AUG, AUG));
  check('one month ago blocks', !coolingOffPassed('2026-07', AUG));
  check('two months ago blocks', !coolingOffPassed('2026-06', AUG));
  check('three months ago still blocks', !coolingOffPassed('2026-05', AUG),
    'May, June, July is three months served; August is the third month after May');
  check('FOUR months ago is free again', coolingOffPassed('2026-04', AUG),
    'the rule has to let go, or nobody wins twice');
  check('a year ago is free', coolingOffPassed('2025-08', AUG));

  /* The boundary stated the other way round, from the winner's side: a win in
   * May sits out exactly three months and returns in September. */
  const won = '2026-05';
  const blocked = ['2026-05', '2026-06', '2026-07', '2026-08'];
  const free = ['2026-09', '2026-10'];
  check('a May winner sits out June, July and August',
    blocked.every((p) => !coolingOffPassed(won, p)));
  check('and is eligible again from September',
    free.every((p) => coolingOffPassed(won, p)));
  check('the waiting period is exactly the constant it claims to be',
    blocked.length - 1 === COOLING_OFF_MONTHS);

  /* Symmetric. Deciding an old month must not slip a second rosette in behind
   * a recent one — the association does judge months late. */
  check('a future win blocks an earlier month too', !coolingOffPassed('2026-09', AUG),
    'backfilling July after winning September would otherwise be two awards in three months');

  check('an unreadable stored period blocks rather than allows',
    !coolingOffPassed('2026-8', AUG),
    'failing open would switch the rule off for one person and say nothing');

  check('the cooling-off is applied by eligibleFor, not just available to it',
    !eligibleFor('volunteer_of_the_month', person({ lastWonPeriod: '2026-06' }), AUG) &&
    eligibleFor('volunteer_of_the_month', person({ lastWonPeriod: '2026-04' }), AUG));
}

/* ------------------------------------------------------------------ */
console.log('\n3. the six-month line, from both sides');
{
  /* Measured to the END of August 2026, so the cutoff is 2026-02-28. */
  const cutoff = shiftMonthsOnDate('2026-08-31', -6)!;
  check('the cutoff is the end of February', cutoff === '2026-02-28');

  check('a day before the cutoff is more than six months',
    joinedLongAgo('2026-02-27', AUG) && !joinedRecently('2026-02-27', AUG));
  check('the cutoff day itself is NOT more than six months',
    !joinedLongAgo(cutoff, AUG) && joinedRecently(cutoff, AUG),
    'exactly six months is six months, not more than six');
  check('a day after the cutoff is recent',
    !joinedLongAgo('2026-03-01', AUG) && joinedRecently('2026-03-01', AUG));

  check('a fifteen-year member is not a rising star',
    joinedLongAgo('2011-01-01', AUG) && !joinedRecently('2011-01-01', AUG));
  check('somebody who joined this month is a rising star',
    joinedRecently('2026-08-20', AUG) && !joinedLongAgo('2026-08-20', AUG));

  /* No gap and no overlap for any real join date: exactly one of the two is
   * true. That is the property that makes the pair safe to reason about. */
  const dates = [
    '2019-06-30', '2025-12-31', '2026-01-31', '2026-02-27', '2026-02-28',
    '2026-03-01', '2026-06-15', '2026-08-01', '2026-08-31',
  ];
  check('every real join date belongs to exactly one of the two awards',
    dates.every((d) => joinedLongAgo(d, AUG) !== joinedRecently(d, AUG)),
    dates.filter((d) => joinedLongAgo(d, AUG) === joinedRecently(d, AUG)).join(', '));

  /* The exceptions to that, both of which must be refused by BOTH. */
  check('a join date after the month is neither',
    !joinedLongAgo('2026-09-01', AUG) && !joinedRecently('2026-09-01', AUG),
    'a data error must not make somebody a rising star for a month they had not joined');
  check('an unknown join date is neither',
    !joinedLongAgo(null, AUG) && !joinedRecently(null, AUG),
    'guessing would put a fifteen-year member in the newcomers award');
  check('a timestamp is refused rather than trimmed',
    !joinedLongAgo('2021-03-14T00:00:00Z', AUG) && !joinedRecently('2021-03-14T00:00:00Z', AUG));

  check('the line is where the constant says it is', MEMBERSHIP_MONTHS === 6);

  /* Measured to the month being judged, never to today. The same volunteer
   * moves between the two awards as the months pass, and which award they are
   * in for August cannot depend on when the committee got round to meeting. */
  check('a May joiner is a rising star in August',
    joinedRecently('2026-05-10', '2026-08') && !joinedLongAgo('2026-05-10', '2026-08'));
  check('and a volunteer of the month by December',
    joinedLongAgo('2026-05-10', '2026-12') && !joinedRecently('2026-05-10', '2026-12'));
}

/* ------------------------------------------------------------------ */
console.log('\n4. what else it takes to be considered at all');
{
  check('a month with hours counts', hasVerifiedActivity({ verifiedMinutes: 30, attendances: 0 }));
  check('a month with attendance counts', hasVerifiedActivity({ verifiedMinutes: 0, attendances: 1 }));
  check('an empty month does not', !hasVerifiedActivity({ verifiedMinutes: 0, attendances: 0 }));
  check('a month of corrections that net to nothing does not',
    !hasVerifiedActivity({ verifiedMinutes: -60, attendances: 0 }));

  check('a volunteer with a good month qualifies',
    eligibleFor('volunteer_of_the_month', person(), AUG));
  check('somebody whose standing has lapsed does not',
    !eligibleFor('volunteer_of_the_month', person({ isVolunteer: false }), AUG));
  check('somebody who did nothing this month does not',
    !eligibleFor('volunteer_of_the_month', person({ verifiedMinutes: 0, attendances: 0 }), AUG));

  /* Consent is a criterion for NOMINATION, not only for display. Shortlisting
   * somebody the honours page could never name sets a decision up to vanish. */
  check('somebody who has not agreed to be named is never shortlisted',
    !eligibleFor('volunteer_of_the_month', person({ consentShows: false }), AUG));
  check('and the same holds for the rising star',
    !eligibleFor('rising_star', person({ joinedOn: '2026-06-01', consentShows: false }), AUG));
  check('and for the continuity maker',
    !eligibleFor('continuity_maker',
      person({ badges: ['continuity-maker'], consentShows: false }), AUG));

  check('the continuity award reads the badge rather than restating the rule',
    eligibleFor('continuity_maker', person({ badges: ['continuity-maker'] }), AUG) &&
    !eligibleFor('continuity_maker', person({ badges: ['fifty-hours'] }), AUG));
  check('the continuity award still needs a month behind it',
    !eligibleFor('continuity_maker',
      person({ badges: ['continuity-maker'], verifiedMinutes: 0, attendances: 0 }), AUG),
    'the badge says they stayed; the award says they were here THIS month');

  check('no person is ever eligible for the team award',
    !eligibleFor('team_of_the_month', person(), AUG));
  check('an unreadable period disqualifies everybody',
    !eligibleFor('volunteer_of_the_month', person(), '2026-8'));

  check('every award kind is recognised', AWARD_KINDS.every(isAwardKind));
  check('a made-up award is not', !isAwardKind('employee_of_the_month'));
  check('three of the four name a person',
    PERSON_AWARDS.length === 3 && PERSON_AWARDS.every(isPersonAward) &&
    !isPersonAward('team_of_the_month'));
}

/* ------------------------------------------------------------------ */
console.log('\n5. the shortlist orders, and stops');
{
  check('a month of hours scores', monthScore({ verifiedMinutes: 600, attendances: 0 }) === 100);
  check('attendances score', monthScore({ verifiedMinutes: 0, attendances: 3 }) === 60);
  check('part-hours are not paid for twice',
    monthScore({ verifiedMinutes: 40, attendances: 0 }) === 0 &&
    monthScore({ verifiedMinutes: 120, attendances: 0 }) === 20,
    'three forty-minute entries are two hours, summed once and divided once');
  check('a negative month scores nothing rather than a negative',
    monthScore({ verifiedMinutes: -600, attendances: -4 }) === 0);

  const many = Array.from({ length: 9 }, (_, i) =>
    person({ userId: `u-${i}`, verifiedMinutes: (i + 1) * 60, attendances: 0 }),
  );
  const five = shortlist('volunteer_of_the_month', many, AUG);
  check('a shortlist holds five', five.length === SHORTLIST);
  check('and holds the five best months',
    five.map((n) => n.userId).join(',') === 'u-8,u-7,u-6,u-5,u-4');
  check('highest first', five.every((n, i) => i === 0 || five[i - 1].score >= n.score));

  /* A shortlist that reordered itself between the page load and the press
   * would mean a coordinator approved a different row from the one they saw. */
  const tied = [
    person({ userId: 'u-c', verifiedMinutes: 600, attendances: 0 }),
    person({ userId: 'u-a', verifiedMinutes: 600, attendances: 0 }),
    person({ userId: 'u-b', verifiedMinutes: 600, attendances: 0 }),
  ];
  check('ties break on something meaningless and stable',
    shortlist('volunteer_of_the_month', tied, AUG).map((n) => n.userId).join(',') === 'u-a,u-b,u-c');
  check('and the same input gives the same list twice',
    JSON.stringify(shortlist('volunteer_of_the_month', tied, AUG)) ===
    JSON.stringify(shortlist('volunteer_of_the_month', [...tied].reverse(), AUG)));

  check('fewer than five qualifying gives fewer than five',
    shortlist('volunteer_of_the_month', many.slice(0, 2), AUG).length === 2,
    'padding the list with people who do not qualify is how an ineligible person is chosen');
  check('nobody qualifying gives an empty list',
    shortlist('volunteer_of_the_month', [person({ isVolunteer: false })], AUG).length === 0);

  check('the shortlist carries no name, no photograph and no birth date',
    Object.keys(five[0]).sort().join(',') === 'attendances,score,userId,verifiedMinutes');

  /* There is deliberately no pickWinner, topOne or decide in this module. */
  check('nothing in the shortlist says who won',
    !('winner' in five[0]) && !('rank' in five[0]) && !('place' in five[0]),
    'a place printed beside a name is a result, and this list is not one');
}

/* ------------------------------------------------------------------ */
console.log('\n6. teams: the average, and the floors');
{
  /*
   * THE TEST THIS WHOLE SECTION EXISTS FOR.
   *
   * A committee of twenty with more than twice the total loses to a committee
   * of four with a better average. Ranked by total the big one wins every
   * month by existing, and the small committees correctly stop reading.
   */
  const big = team({
    committee: 'اللجنة الكبرى', activeMembers: 20, verifiedMinutes: 2_000, attendances: 40,
  });
  const small = team({
    committee: 'لجنة صغيرة', activeMembers: 4, verifiedMinutes: 600, attendances: 20,
  });

  check('the big team really does have the bigger total',
    monthScore(big) > monthScore(small),
    `${monthScore(big)} vs ${monthScore(small)}`);
  check('and the smaller team the better average',
    teamAverage(small) > teamAverage(big),
    `${teamAverage(small).toFixed(1)} vs ${teamAverage(big).toFixed(1)} per active member`);

  const ranked = shortlistTeams([big, small], AUG);
  check('so the smaller team is ranked first',
    ranked[0]?.committee === 'لجنة صغيرة',
    'ranked by total, «فريق الشهر» would be an award for being numerous');
  check('and the bigger team is still on the list, just behind',
    ranked[1]?.committee === 'اللجنة الكبرى',
    'losing the ranking is not the same as being disqualified');

  /* Doubling a qualifying team changes nothing: the same people, twice over,
   * did the same amount each. This is the property "average, never total"
   * actually means. */
  const doubled = team({
    committee: 'مضاعَفة',
    activeMembers: small.activeMembers * 2,
    verifiedMinutes: small.verifiedMinutes * 2,
    attendances: small.attendances * 2,
  });
  check('a team of twice the size doing twice as much ranks the same',
    Math.abs(teamAverage(doubled) - teamAverage(small)) < 1e-9);

  check('the average is not rounded before it is compared',
    teamAverage(team({ activeMembers: 3, verifiedMinutes: 180, attendances: 0 })) === 10 &&
    teamAverage(team({ activeMembers: 7, verifiedMinutes: 420, attendances: 1 })) !== 10,
    'rounding here manufactures ties that then get broken alphabetically');

  // ---------------------------------------------------------------- floors
  check('a committee of one is not a team, whatever its average',
    !teamQualifies(team({ activeMembers: 1, verifiedMinutes: 6_000, attendances: 40 })),
    'one person having a good month would otherwise win the group award');
  check('two is still not a team',
    !teamQualifies(team({ activeMembers: 2, attendances: 30 })));
  check('three is', teamQualifies(team({ activeMembers: 3, attendances: 5 })));
  check('the member floor is the constant it claims to be',
    TEAM_MIN_ACTIVE_MEMBERS === 3 &&
    !teamQualifies(team({ activeMembers: TEAM_MIN_ACTIVE_MEMBERS - 1, attendances: 30 })) &&
    teamQualifies(team({ activeMembers: TEAM_MIN_ACTIVE_MEMBERS, attendances: 30 })));

  check('a big committee that barely turned up does not qualify',
    !teamQualifies(team({ activeMembers: 12, attendances: TEAM_MIN_ATTENDANCES - 1 })),
    'two data points are not a month');
  check('and one that did qualifies',
    teamQualifies(team({ activeMembers: 12, attendances: TEAM_MIN_ATTENDANCES })));

  check('an unqualified team never reaches the shortlist even with a huge average',
    shortlistTeams([
      team({ committee: 'واحد', activeMembers: 1, verifiedMinutes: 60_000, attendances: 200 }),
      team({ committee: 'ثلاثة', activeMembers: 3, verifiedMinutes: 180, attendances: 6 }),
    ], AUG).map((t) => t.committee).join(',') === 'ثلاثة');

  check('a team with no active members scores nothing rather than Infinity',
    teamAverage(team({ activeMembers: 0, verifiedMinutes: 600, attendances: 5 })) === 0,
    'Infinity sorts to the top of any list it reaches');

  // ------------------------------------------------------------ cooling-off
  check('a committee that won three months ago is not shortlisted',
    shortlistTeams([team({ committee: 'الإغاثة', lastWonPeriod: '2026-05' })], AUG).length === 0);
  check('and is shortlisted again in the fourth month',
    shortlistTeams([team({ committee: 'الإغاثة', lastWonPeriod: '2026-05' })], '2026-09').length === 1);
  check('a shortlist for an unreadable period is empty',
    shortlistTeams([team()], '2026-8').length === 0);

  check('the team shortlist holds five at most',
    shortlistTeams(
      Array.from({ length: 8 }, (_, i) =>
        team({ committee: `ل-${i}`, activeMembers: 4, verifiedMinutes: (i + 1) * 240, attendances: 8 })),
      AUG,
    ).length === SHORTLIST);
}

/* ------------------------------------------------------------------ */
console.log('\n7. the badge carries its own month');
{
  check('a badge names the award and the month',
    awardBadgeCode('volunteer_of_the_month', '2026-08') === 'award-volunteer-2026-08');
  check('every award has a distinct badge prefix',
    new Set(Object.values(AWARD_BADGE_PREFIX)).size === AWARD_KINDS.length);
  check('an unreadable period yields no badge',
    awardBadgeCode('volunteer_of_the_month', '2026-8') === null);

  check('every award code round-trips',
    AWARD_KINDS.every((award) => {
      const code = awardBadgeCode(award, '2026-08');
      const back = code === null ? null : parseAwardBadgeCode(code);
      return back?.award === award && back.period === '2026-08';
    }));
  check('a badge from the ordinary catalogue is not an award badge',
    parseAwardBadgeCode('fifty-hours') === null &&
    parseAwardBadgeCode('continuity-maker') === null,
    'the wall asks the catalogue first, and this must not answer for it');
  check('a malformed award code is refused rather than half-read',
    parseAwardBadgeCode('award-volunteer-2026') === null);

  /* Two wins are two badges, because uq_achievement_live_once is on
   * (user_id, code): one code per award would make the second grant overwrite
   * the first, quietly taking a badge off a wall to put the same one back. */
  check('two months are two different codes',
    awardBadgeCode('volunteer_of_the_month', '2026-08') !==
    awardBadgeCode('volunteer_of_the_month', '2027-01'));

  const view = awardBadgeFor('award-rising-star-2026-08');
  check('a badge can name its own month in both languages',
    view?.title.ar.includes('آب 2026') === true && view?.title.en.includes('August 2026') === true,
    `${view?.title.ar} / ${view?.title.en}`);
  check('no placeholder survives into a rendered badge',
    AWARD_KINDS.every((a) => {
      const v = awardBadgeFor(awardBadgeCode(a, '2026-08')!);
      return v !== null &&
        !v.title.ar.includes('{month}') && !v.title.en.includes('{month}') &&
        !v.description.ar.includes('{month}') && !v.description.en.includes('{month}');
    }));
  check('the badge view carries the three fields the wall reads',
    view !== null && Object.keys(view).sort().join(',') === 'description,icon,title');
}

/* ------------------------------------------------------------------ */
console.log('\n8. the words');
{
  check('every award has a name, a meaning and an icon in both languages', awardsAreComplete());
  check('twelve months in each language',
    MONTH_NAMES.ar.length === 12 && MONTH_NAMES.en.length === 12);
  check('the Arabic months are the Levantine set the association actually uses',
    MONTH_NAMES.ar[0] === 'كانون الثاني' && MONTH_NAMES.ar[7] === 'آب',
    'يناير/فبراير would read as a translation of the site rather than the site speaking');
  check('a period reads as a month and a year', formatPeriod('2026-08', 'ar') === 'آب 2026');
  check('and in English', formatPeriod('2026-08', 'en') === 'August 2026');
  check('the year keeps Latin digits',
    /\d{4}/.test(formatPeriod('2026-08', 'ar')),
    'a year is copied between the site and paper more often than it is read aloud');
  check('an unreadable period prints a dash rather than a wrong month',
    formatPeriod('2026-13', 'ar') === '—' && formatPeriod('', 'en') === '—');
  check('every award has an icon', AWARD_KINDS.every((a) => AWARD_ICONS[a].trim() !== ''));

  /* The two strings that are load-bearing rather than decorative. Both say
   * something the page would otherwise be silently wrong about. */
  check('the staff page says the shortlist is not a result',
    awardsAr.nominatedNote.trim() !== '' && awardsEn.nominatedNote.trim() !== '');
  check('the reason field warns that it is published',
    /ينشر|يُنشر/.test(awardsAr.reasonPublished) &&
    /published/i.test(awardsEn.reasonPublished));
  check('the public page explains why there are no runners-up',
    awardsAr.oneNameNote.trim() !== '' && awardsEn.oneNameNote.trim() !== '');

  /*
   * No LABEL in this namespace names a losing position.
   *
   * Keys rather than values, deliberately. The prose does say "not chosen" —
   * `oneNameNote` exists precisely to explain that nobody who was passed over
   * is recorded — and a check over the values would have to forbid the
   * sentence that makes the absence legible. What must not exist is a key: a
   * key is a slot a page can render, and `runnerUp` sitting unused in a
   * dictionary is how somebody later decides it would be nice to show one.
   */
  const keys = [
    ...Object.keys(awardsAr),
    ...Object.keys(awardsAr.names),
    ...Object.keys(awardsAr.errors),
  ].map((k) => k.toLowerCase());
  check('no dictionary key could render a runner-up',
    !keys.some((k) => /runner|second|loser|passedover|alsoconsidered|rank|place|position/.test(k)),
    keys.filter((k) => /runner|second|loser|rank|place|position/.test(k)).join(', '));
  check('and the two dictionaries hold exactly the same keys',
    Object.keys(awardsAr).sort().join(',') === Object.keys(awardsEn).sort().join(','),
    'a key present in one language and missing in the other renders as a blank to half the association');
}

/* ------------------------------------------------------------------ */
console.log('\n9. the four who were not chosen appear nowhere');
{
  /*
   * The whole flow, end to end, with the thing that must never happen at the
   * end of it: five people are shortlisted, a person chooses one, and the
   * public page is rendered. The other four are searched for in every
   * character of the output.
   */
  const candidates = [
    person({ userId: 'winner-uuid', verifiedMinutes: 900, attendances: 6 }),
    person({ userId: 'passed-over-alpha', verifiedMinutes: 800, attendances: 5 }),
    person({ userId: 'passed-over-beta', verifiedMinutes: 700, attendances: 4 }),
    person({ userId: 'passed-over-gamma', verifiedMinutes: 600, attendances: 3 }),
    person({ userId: 'passed-over-delta', verifiedMinutes: 500, attendances: 2 }),
  ];
  const nominated = shortlist('volunteer_of_the_month', candidates, AUG);
  check('all five were shortlisted', nominated.length === 5);

  // A person decides. The module offers no function that would do this for
  // them, which is the point — this line is a human being in a staff page.
  const chosenId = 'winner-uuid';
  const notChosen = nominated.map((n) => n.userId).filter((id) => id !== chosenId);
  check('four were not chosen', notChosen.length === 4);

  const decided: AwardRecord[] = [{
    period: AUG,
    award: 'volunteer_of_the_month',
    team: null,
    publicName: 'مريم حيدر',
    photo: true,
    reason: 'حملت توزيع الحصص في الأسبوع الأخير كاملاً، ولم تتخلّف عن موعد.',
    minutes: 900,
    attendances: 6,
    activeMembers: null,
  }];

  const honours = honoursView(decided);
  const rendered = JSON.stringify(honours);

  check('the winner is published', honours.current?.awards[0]?.name === 'مريم حيدر');
  check('NOBODY WHO WAS NOT CHOSEN APPEARS IN THE OUTPUT',
    notChosen.every((id) => !rendered.includes(id)),
    notChosen.filter((id) => rendered.includes(id)).join(', '));
  check('and neither does the winner\'s own id',
    !rendered.includes(chosenId),
    'a page holding an id puts it in a link, and an id is a handle onto a person');
  check('the published shape has no field an id could live in',
    honours.current !== null &&
    Object.keys(honours.current.awards[0]).sort().join(',') ===
      'activeMembers,attendances,award,minutes,name,period,photo,reason',
    Object.keys(honours.current?.awards[0] ?? {}).sort().join(','));

  /* The structural guarantee: honoursView cannot be handed a shortlist. There
   * is no overload, no union, and a Nomination has none of the fields an
   * AwardRecord needs — so a page cannot pass one by mistake. */
  check('a nomination is not the shape a public page can render',
    publicAward({
      ...(nominated[1] as unknown as AwardRecord),
      award: 'volunteer_of_the_month',
      period: AUG,
    }) === null,
    'no publicName and no team means nothing to print');
}

/* ------------------------------------------------------------------ */
console.log('\n10. what the honours page shows, and what consent takes away');
{
  const record = (over: Partial<AwardRecord>): AwardRecord => ({
    period: AUG,
    award: 'volunteer_of_the_month',
    team: null,
    publicName: 'مريم حيدر',
    photo: false,
    reason: 'سبب مكتوب بخط اليد.',
    minutes: 900,
    attendances: 6,
    activeMembers: null,
    ...over,
  });

  check('a consenting winner is published', publicAward(record({}))?.name === 'مريم حيدر');
  check('a winner who has since withdrawn consent is dropped entirely',
    publicAward(record({ publicName: null })) === null,
    'a "name withheld" line narrows to one person in an association of four hundred');
  check('an empty name is a refusal, not an empty card',
    publicAward(record({ publicName: '   ' })) === null);

  check('the team award names the committee',
    publicAward(record({
      award: 'team_of_the_month', publicName: null, team: 'لجنة الإغاثة',
    }))?.name === 'لجنة الإغاثة',
    'a committee is a label the association owns, not a person who consented');
  check('and never carries a photograph',
    publicAward(record({
      award: 'team_of_the_month', publicName: null, team: 'لجنة الإغاثة', photo: true,
    }))?.photo === false);
  check('a team award with no committee on it is dropped',
    publicAward(record({ award: 'team_of_the_month', publicName: null, team: null })) === null);

  check('an unreadable period is not published',
    publicAward(record({ period: '2026-8' })) === null);

  // ------------------------------------------------------- current and archive
  const months = honoursView([
    record({ period: '2026-06' }),
    record({ period: AUG, award: 'rising_star' }),
    record({ period: AUG }),
    record({ period: '2026-07' }),
  ]);
  check('the most recent month is the current one', months.current?.period === AUG);
  check('and it holds both of its awards', months.current?.awards.length === 2);
  check('the archive is every month before it, newest first',
    months.archive.map((m) => m.period).join(',') === '2026-07,2026-06');
  check('awards inside a month read in a fixed order, never by a figure',
    months.current?.awards.map((a) => a.award).join(',') ===
      'volunteer_of_the_month,rising_star',
    'anything else could be mistaken for a ranking between the four');

  check('an empty archive is empty rather than absent',
    honoursView([]).current === null && honoursView([]).archive.length === 0);
  check('a month whose only winner withdrew consent disappears rather than emptying',
    honoursView([record({ publicName: null })]).current === null,
    'an empty August heading is a question about one person');
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
