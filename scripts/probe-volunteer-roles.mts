/*
 * Volunteer roles: what a period says, who may read it, and the list that must
 * not exist.
 *
 * Five failures this exists to stop, none of which shows up as an error:
 *
 *   - A ROLE THAT MOVED A MONTH BACKWARDS. started_on is a DATE and the
 *     session runs GMT while the association is in Beirut. A formatter that
 *     builds a Date from '2025-01-01' prints كانون الأول ٢٠٢٤, and nothing
 *     about the output looks wrong — it is a real month, in the right script,
 *     one off. Every boundary date below is a first of a month for that reason.
 *
 *   - A ROLE PRINTED AS BOTH SERVING AND FINISHED. chk_vr_current makes the
 *     contradictory row impossible; this holds the formatter to it, so a row
 *     hand-edited past the constraint still cannot render a person as currently
 *     holding a post they left.
 *
 *   - A ROLE PRINTED TO A PRECISION NOBODY GAVE. The precision column exists so
 *     that «٢٠٢٢» can be said honestly instead of a made-up day being displayed
 *     as fact. A day leaking into a year-precision render is the schema's whole
 *     argument being undone in the last line before the screen.
 *
 *   - A STAFF-ONLY ROLE ON THE OPEN WEB. The visibility section below is not
 *     content that a filter was called; it is a CONTROL that the filter is
 *     doing work — the same list, read by three viewers, with the staff-only
 *     role genuinely absent for two of them.
 *
 *   - A LIST OF PERMITTED ROLE TITLES. Migration 046 argues at length that
 *     there must not be one. The last section reads the module and the actions
 *     as TEXT and looks for one, because this is the failure that a passing
 *     test suite would never notice: an enum of six titles works perfectly,
 *     right up until the association invents a seventh.
 *
 * PURE: no database, no network, no clock. Every date here is text.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  ANONYMOUS,
  DEFAULT_ROLE_VISIBILITY,
  calendarDay,
  checkPeriod,
  checkTitle,
  cleanAchievements,
  formatRoleDate,
  formatRolePeriod,
  isPrecision,
  isVisibility,
  precisionFrom,
  readableBy,
  visibilityFrom,
  visibleTo,
  type RolePeriod,
  type Viewer,
  type Visibility,
} from '../src/lib/volunteer-role-view.ts';
import { MONTH_NAMES } from '../src/lib/dictionaries/awards.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1; else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** A role period, with the ordinary case as the default. */
function period(over: Partial<RolePeriod> = {}): RolePeriod {
  return {
    startedOn: '2025-01-01',
    startedPrec: 'month',
    endedOn: null,
    endedPrec: 'day',
    isCurrent: true,
    ...over,
  };
}

/* ------------------------------------------------------------------ */
console.log('1. a date is text, and stays text');
{
  check('a plain day is a day', calendarDay('2025-01-01') === '2025-01-01');
  check('a timestamp is not a day', calendarDay('2025-01-01T00:30:00Z') === null,
    'its first ten characters name the wrong day for anything after 22:00 Beirut');
  check('the 31st of February is not a day', calendarDay('2025-02-31') === null);
  check('a leap day is a day in a leap year', calendarDay('2024-02-29') === '2024-02-29');
  check('and is not one otherwise', calendarDay('2025-02-29') === null);
  check('month 13 is not a month', calendarDay('2025-13-01') === null);
  check('an unpadded date is refused', calendarDay('2025-1-1') === null,
    'the column hands back to_char output; anything else is a mistake upstream');
  check('null is missing rather than a crash', calendarDay(null) === null);

  check('the three precisions are the three the CHECK names',
    isPrecision('day') && isPrecision('month') && isPrecision('year'));
  check('and nothing else is', !isPrecision('decade') && !isPrecision(''));
  check('an unreadable precision falls back to the column default',
    precisionFrom('decade') === 'day' && precisionFrom(undefined) === 'day');
}

/* ------------------------------------------------------------------ */
console.log('\n2. every precision, in both languages');
{
  // ── year ───────────────────────────────────────────────────────────────
  check('a year in English is the year',
    formatRoleDate('2023-06-14', 'year', 'en') === '2023');
  check('a year in Arabic is the year in Arabic-Indic digits',
    formatRoleDate('2023-06-14', 'year', 'ar') === '٢٠٢٣',
    formatRoleDate('2023-06-14', 'year', 'ar'));
  check('and NEITHER leaks the month or the day it was stored with',
    !formatRoleDate('2023-06-14', 'year', 'en')!.includes('June') &&
      !formatRoleDate('2023-06-14', 'year', 'ar')!.includes('حزيران'),
    'the precision column exists so that «2023» can be said honestly');

  // ── month ──────────────────────────────────────────────────────────────
  check('a month in English', formatRoleDate('2025-01-01', 'month', 'en') === 'January 2025',
    formatRoleDate('2025-01-01', 'month', 'en'));
  check('a month in Arabic, in the Levantine set',
    formatRoleDate('2025-01-01', 'month', 'ar') === 'كانون الثاني ٢٠٢٥',
    formatRoleDate('2025-01-01', 'month', 'ar'));
  check('the month names are the ones this codebase already had',
    MONTH_NAMES.ar[0] === 'كانون الثاني' && MONTH_NAMES.ar[9] === 'تشرين الأول',
    'not يناير/فبراير, and not a second set invented here');
  check('a month render never carries the day',
    !formatRoleDate('2025-01-31', 'month', 'ar')!.includes('٣١'));

  // ── day ────────────────────────────────────────────────────────────────
  check('a full date in English', formatRoleDate('2023-03-14', 'day', 'en') === '14 March 2023',
    formatRoleDate('2023-03-14', 'day', 'en'));
  check('a full date in Arabic', formatRoleDate('2023-03-14', 'day', 'ar') === '١٤ آذار ٢٠٢٣',
    formatRoleDate('2023-03-14', 'day', 'ar'));
  check('a single-digit day loses its leading zero',
    formatRoleDate('2023-03-04', 'day', 'en') === '4 March 2023' &&
      formatRoleDate('2023-03-04', 'day', 'ar') === '٤ آذار ٢٠٢٣',
    formatRoleDate('2023-03-04', 'day', 'ar'));

  // ── THE TRAP ───────────────────────────────────────────────────────────
  check('THE FIRST OF JANUARY IS JANUARY, not the December before it',
    formatRoleDate('2025-01-01', 'month', 'en') === 'January 2025' &&
      formatRoleDate('2025-01-01', 'month', 'ar') === 'كانون الثاني ٢٠٢٥',
    'new Date("2025-01-01") is midnight UTC, which is 2024 in half the world');
  check('the first of January is 2025 at year precision too',
    formatRoleDate('2025-01-01', 'year', 'en') === '2025');
  check('the first of every month renders as that month',
    Array.from({ length: 12 }, (_, i) => {
      const mm = String(i + 1).padStart(2, '0');
      return formatRoleDate(`2025-${mm}-01`, 'month', 'en') === `${MONTH_NAMES.en[i]} 2025`;
    }).every(Boolean),
    'one Date() anywhere in the formatter and this fails twelve times');

  check('an unreadable date renders as nothing rather than "Invalid Date"',
    formatRoleDate('not-a-date', 'day', 'ar') === null &&
      formatRoleDate(null, 'day', 'en') === null);
}

/* ------------------------------------------------------------------ */
console.log('\n3. a period, as a phrase');
{
  const current = period({ startedOn: '2025-01-01', startedPrec: 'month', isCurrent: true });
  check('a current role says so in Arabic',
    formatRolePeriod(current, 'ar') === 'من كانون الثاني ٢٠٢٥ حتى الآن',
    formatRolePeriod(current, 'ar'));
  check('a current role says so in English',
    formatRolePeriod(current, 'en') === 'January 2025 – present',
    formatRolePeriod(current, 'en'));
  check('and «حتى الآن» is the exact phrase',
    formatRolePeriod(current, 'ar').includes('حتى الآن'));

  /* A row hand-edited past chk_vr_current: current AND carrying an end date.
   * The formatter must not print the end date. */
  const contradictory = period({ isCurrent: true, endedOn: '2026-05-05', endedPrec: 'day' });
  check('A CURRENT ROLE NEVER PRINTS AN END DATE, even on a contradictory row',
    !formatRolePeriod(contradictory, 'ar').includes('٢٠٢٦') &&
      !formatRolePeriod(contradictory, 'en').includes('2026'),
    formatRolePeriod(contradictory, 'en'));
  check('it prints «حتى الآن» instead',
    formatRolePeriod(contradictory, 'ar').endsWith('حتى الآن') &&
      formatRolePeriod(contradictory, 'en').endsWith('present'));

  const closed = period({
    startedOn: '2021-09-01', startedPrec: 'year',
    endedOn: '2023-06-30', endedPrec: 'year',
    isCurrent: false,
  });
  check('a finished role reads as a range in Arabic',
    formatRolePeriod(closed, 'ar') === 'من ٢٠٢١ حتى ٢٠٢٣', formatRolePeriod(closed, 'ar'));
  check('and in English', formatRolePeriod(closed, 'en') === '2021 – 2023',
    formatRolePeriod(closed, 'en'));
  check('a finished role never says «حتى الآن»',
    !formatRolePeriod(closed, 'ar').includes('حتى الآن') &&
      !formatRolePeriod(closed, 'en').includes('present'));

  const noEnd = period({
    startedOn: '2021-09-01', startedPrec: 'year', endedOn: null, isCurrent: false,
  });
  check('a past role with no end date says when it began and stops',
    formatRolePeriod(noEnd, 'ar') === 'من ٢٠٢١' && formatRolePeriod(noEnd, 'en') === 'from 2021',
    formatRolePeriod(noEnd, 'en'));
  check('and pointedly does NOT resurrect itself as current',
    !formatRolePeriod(noEnd, 'ar').includes('حتى الآن') &&
      !formatRolePeriod(noEnd, 'en').includes('present'),
    'a null end date is not a claim that somebody is still doing it');

  // ── no start date at all ───────────────────────────────────────────────
  const currentNoStart = period({ startedOn: null, isCurrent: true });
  check('a current role with no start date still renders',
    formatRolePeriod(currentNoStart, 'ar') === 'حتى الآن' &&
      formatRolePeriod(currentNoStart, 'en') === 'present',
    formatRolePeriod(currentNoStart, 'en'));
  const endedNoStart = period({
    startedOn: null, endedOn: '2019-01-01', endedPrec: 'year', isCurrent: false,
  });
  check('a finished role with no start date renders as an end',
    formatRolePeriod(endedNoStart, 'ar') === 'حتى ٢٠١٩' &&
      formatRolePeriod(endedNoStart, 'en') === 'until 2019',
    formatRolePeriod(endedNoStart, 'en'));
  const nothing = period({ startedOn: null, endedOn: null, isCurrent: false });
  check('a role with no dates at all renders as the house em dash, not as empty',
    formatRolePeriod(nothing, 'ar') === '—' && formatRolePeriod(nothing, 'en') === '—');

  const oneDay = period({
    startedOn: '2024-05-11', startedPrec: 'day',
    endedOn: '2024-05-11', endedPrec: 'day', isCurrent: false,
  });
  check('a role that began and ended the same day is one date, not a range',
    formatRolePeriod(oneDay, 'en') === '11 May 2024', formatRolePeriod(oneDay, 'en'));

  check('no rendering anywhere above produced "Invalid Date" or "NaN"',
    [current, contradictory, closed, noEnd, currentNoStart, endedNoStart, nothing, oneDay]
      .flatMap((p) => [formatRolePeriod(p, 'ar'), formatRolePeriod(p, 'en')])
      .every((s) => !s.includes('Invalid') && !s.includes('NaN') && s.length > 0));
}

/* ------------------------------------------------------------------ */
console.log('\n4. the three contradictions the schema refuses');
{
  check('an ordinary period is fine', checkPeriod(period()).ok);

  const backwards = checkPeriod(period({
    startedOn: '2023-01-01', endedOn: '2022-01-01', isCurrent: false,
  }));
  check('a role cannot end before it began',
    !backwards.ok && backwards.reason === 'out-of-order');

  const both = checkPeriod(period({ isCurrent: true, endedOn: '2024-01-01' }));
  check('a role cannot be current and finished',
    !both.ok && both.reason === 'current-and-ended', 'chk_vr_current, said in TypeScript');

  const nonsense = checkPeriod(period({ startedOn: '2023-02-30' }));
  check('a date that does not exist is refused', !nonsense.ok && nonsense.reason === 'bad-date');

  check('a single-day role is allowed',
    checkPeriod(period({
      startedOn: '2024-05-11', endedOn: '2024-05-11', isCurrent: false,
    })).ok,
    'a one-day special assignment is a real thing, not a typo');

  check('a title is required', !checkTitle('') && !checkTitle('   '));
  check('and any non-empty title is a title', checkTitle('رئيس لجنة الإعلام'),
    'ANY. There is no list to check it against');
}

/* ------------------------------------------------------------------ */
console.log('\n5. who may read a role — and a control that the filter works');
{
  check('the default visibility is inward, not public',
    DEFAULT_ROLE_VISIBILITY === 'volunteers',
    'migration 038 published a name and a photo somebody chose; this is not that');
  check('the three visibilities are the three the CHECK names',
    isVisibility('public') && isVisibility('volunteers') && isVisibility('staff'));
  check('anything else is not one', !isVisibility('everyone') && !isVisibility(''));
  check('an unreadable visibility falls back inward, never outward',
    visibilityFrom('everyone') === 'volunteers' && visibilityFrom(null) === 'volunteers');

  check('a signed-out reader may see public and nothing else',
    visibleTo(ANONYMOUS).join(',') === 'public');
  check('a volunteer may see public and volunteers',
    visibleTo({ kind: 'volunteer', userId: 'u-1' }).join(',') === 'public,volunteers');
  check('staff may see all three',
    visibleTo({ kind: 'staff', userId: 'u-2' }).join(',') === 'public,volunteers,staff');

  // ── THE CONTROL ────────────────────────────────────────────────────────
  /*
   * One list of three roles, read by three viewers. Asserting that a volunteer
   * "sees two" would pass just as happily if the filter returned the wrong two,
   * so the staff-only role is followed by name: it must be GENUINELY ABSENT for
   * the two lower tiers and present for staff, and the same list must produce
   * all three answers.
   */
  const roles: { title: string; visibility: Visibility }[] = [
    { title: 'متطوّع', visibility: 'public' },
    { title: 'رئيس لجنة الإعلام', visibility: 'volunteers' },
    { title: 'مسؤول حماية الطفل', visibility: 'staff' },
  ];
  const seenBy = (viewer: Viewer) => roles.filter((r) => readableBy(r, viewer)).map((r) => r.title);

  const anon = seenBy(ANONYMOUS);
  const vol = seenBy({ kind: 'volunteer', userId: 'u-1' });
  const staff = seenBy({ kind: 'staff', userId: 'u-2' });

  check('signed out: one role, the public one', anon.join(',') === 'متطوّع', anon.join(','));
  check('a volunteer: the public one and the volunteers one',
    vol.join(',') === 'متطوّع,رئيس لجنة الإعلام', vol.join(','));
  check('staff: all three', staff.length === 3, staff.join(','));

  check('CONTROL — the staff-only role is genuinely absent for a volunteer',
    !vol.includes('مسؤول حماية الطفل') &&
      !JSON.stringify(vol).includes('مسؤول حماية الطفل'),
    'not merely unlisted: the string is nowhere in what a volunteer is handed');
  check('CONTROL — and absent for a signed-out reader',
    !anon.includes('مسؤول حماية الطفل') && anon.length === 1);
  check('CONTROL — while the same list DOES yield it to staff',
    staff.includes('مسؤول حماية الطفل'),
    'without this, an always-empty filter would pass the two checks above');
  check('CONTROL — the volunteers-only role is absent for a signed-out reader',
    !anon.includes('رئيس لجنة الإعلام'));

  check('the tiers are cumulative, never exclusive',
    visibleTo({ kind: 'staff', userId: 'x' }).includes('public') &&
      visibleTo({ kind: 'volunteer', userId: 'x' }).includes('public'),
    'staff are also volunteers, and volunteers are also members of the public');
}

/* ------------------------------------------------------------------ */
console.log('\n6. achievements survive whatever arrives');
{
  check('a well-formed pair is kept',
    cleanAchievements([{ ar: 'نظّم ثلاث حملات', en: 'Ran three campaigns' }]).length === 1);
  check('an empty English side is kept, and falls back at the page',
    cleanAchievements([{ ar: 'نظّم ثلاث حملات', en: '' }])[0]?.en === '');
  check('an entry empty in both languages is not an achievement',
    cleanAchievements([{ ar: '', en: '' }]).length === 0);
  check('a string where an object was expected is dropped, not rendered',
    cleanAchievements(['nonsense', 42, null]).length === 0);
  check('a non-array is an empty list rather than a crash',
    cleanAchievements({ ar: 'x' }).length === 0 && cleanAchievements(null).length === 0);
}

/* ------------------------------------------------------------------ */
console.log('\n7. ending a role keeps the role');
{
  /*
   * endRole() writes to a database, so what is held here is the CONTRACT it is
   * written against: the columns it names. If somebody adds title_ar or
   * started_on to that UPDATE, this fails — which is the failure worth
   * catching, because it would not throw, it would simply erase a piece of
   * somebody's history and return ok.
   */
  const source = readFileSync(`${ROOT}src/lib/volunteer-roles.ts`, 'utf8');
  const endFn = source.slice(source.indexOf('export async function endRole'));
  const endBody = endFn.slice(0, endFn.indexOf('\n}\n') + 1);

  check('endRole sets is_current to false', /is_current\s*=\s*false/.test(endBody));
  check('endRole writes the end date and its precision',
    /ended_on\s*=/.test(endBody) && /ended_prec\s*=/.test(endBody));
  check('endRole does NOT touch the title',
    !/title_ar\s*=/.test(endBody) && !/title_en\s*=/.test(endBody),
    'the outgoing president goes on having been president');
  check('endRole does NOT touch the start date',
    !/started_on\s*=/.test(endBody) && !/started_prec\s*=/.test(endBody));
  check('endRole does NOT touch the description or the achievements',
    !/description\s*=/.test(endBody) && !/achievements\s*=/.test(endBody));
  check('endRole does NOT touch the entity it was attached to',
    !/entity_(kind|id|name)\s*=/.test(endBody));
  check('nothing in this module DELETEs a role',
    !/\bDELETE\s+FROM\b/i.test(source),
    'trg_volunteer_roles_no_delete would refuse it anyway; it is not attempted');
  check('archiving stamps the two columns chk_vr_archived requires together',
    /archived_at\s*=\s*now\(\)[\s,]*archived_by\s*=/.test(source));

  check('a period with only the end changed keeps the start',
    (() => {
      const before = period({
        startedOn: '2021-09-01', startedPrec: 'year', isCurrent: true,
      });
      const after: RolePeriod = { ...before, isCurrent: false, endedOn: '2023-06-30', endedPrec: 'year' };
      return after.startedOn === before.startedOn && after.startedPrec === before.startedPrec;
    })(),
    'the shape of the change, held in the pure layer where a probe can reach it');
}

/* ------------------------------------------------------------------ */
console.log('\n8. THERE IS NO LIST OF ROLE TITLES');
{
  const files: Record<string, string> = {
    'volunteer-roles.ts': readFileSync(`${ROOT}src/lib/volunteer-roles.ts`, 'utf8'),
    'volunteer-role-view.ts': readFileSync(`${ROOT}src/lib/volunteer-role-view.ts`, 'utf8'),
    'actions/volunteer-roles.ts': readFileSync(`${ROOT}src/lib/actions/volunteer-roles.ts`, 'utf8'),
  };

  /*
   * The titles a fixed list would be made of — the ones the migration names as
   * the tempting enum, in both languages. They may appear in prose (this
   * codebase argues in its comments), so the comments are stripped first and
   * only the CODE is searched.
   */
  const TEMPTING = [
    'President', 'Project Manager', 'Committee Leader', 'Team Leader', 'Coordinator',
    'رئيس لجنة', 'منسّق مشروع', 'قائد فريق', 'رئيس الجمعية',
  ];

  const stripComments = (src: string) =>
    src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  /* The code without its prose. Every assertion below that is about what the
   * software DOES runs against this; the one assertion that is about what a
   * comment SAYS runs against the raw file. Mixing the two is how a probe ends
   * up reporting a hole in an explanation. */
  const code: Record<string, string> = Object.fromEntries(
    Object.entries(files).map(([name, src]) => [name, stripComments(src)]),
  );

  for (const [name, src] of Object.entries(code)) {
    const found = TEMPTING.filter((t) => src.includes(t));
    check(`${name} names no role title in its code`, found.length === 0, found.join(', '));
  }

  check('no union type of titles anywhere',
    !Object.values(code).some((src) => /(title|role)\s*:\s*'[^']+'\s*\|\s*'/.test(src)),
    "a `'President' | 'Project Manager'` union is the enum in disguise");

  check('no constant array of titles anywhere',
    !Object.values(code).some((src) =>
      /(ROLE_TITLES|TITLES|ALLOWED_ROLES|ROLE_TYPES)\s*[:=]/.test(src)));

  check('role_type is never compared against a fixed value',
    !Object.values(code).some((src) => /role_type\s*=\s*'/.test(src)),
    'free text, exactly as title_ar and title_en are');

  check('the suggestions function says in its own comment that it is not a permitted set',
    /suggestions?\b[\s\S]{0,400}never a permitted set/i.test(files['volunteer-roles.ts']) ||
      /NEVER A PERMITTED SET/.test(files['volunteer-roles.ts']),
    'the comment is the thing that stops the next person tidying it into a validator');

  check('nothing validates a submitted title against a suggestion list',
    !/suggestions?\s*\.\s*includes\s*\(/.test(code['volunteer-roles.ts']) &&
      !/suggestions?\s*\.\s*includes\s*\(/.test(code['actions/volunteer-roles.ts']));

  // ── and the permission is an existing one ──────────────────────────────
  const authz = readFileSync(`${ROOT}src/lib/authz.ts`, 'utf8');
  const actions = code['actions/volunteer-roles.ts'];
  check("the actions use 'members.manage'",
    actions.includes("requireCapability('members.manage')"));
  check('which is a capability that already existed',
    /'members\.manage':\s*\[/.test(authz),
    'no new capability invented for this feature');
  check('and no action writes a permission while recording a title',
    !actions.includes('user_roles'),
    'what somebody IS in the association must never quietly hand them access');
  check('every write action asserts the capability',
    (actions.match(/export async function \w+Action/g) ?? []).length ===
      (actions.match(/requireCapability\('members\.manage'\)/g) ?? []).length,
    'one assertion per action, none of them left to a component');
  check('every write action writes an audit line',
    (actions.match(/export async function \w+Action/g) ?? []).length ===
      (actions.match(/await audit\(\{/g) ?? []).length);
}

/* ------------------------------------------------------------------ */
console.log('\n9. the module reads no date as an instant');
{
  const stripComments = (src: string) =>
    src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const source = readFileSync(`${ROOT}src/lib/volunteer-roles.ts`, 'utf8');
  const view = readFileSync(`${ROOT}src/lib/volunteer-role-view.ts`, 'utf8');
  /* Again the code without its prose: this file argues against GROUP BY
   * user_id in a comment, and a probe that grepped the comment would report a
   * hole in the very sentence promising there is not one. */
  const code = stripComments(source);

  check('the pure formatter builds no Date, ever',
    !/new Date\s*\(/.test(stripComments(view)) &&
      !/Intl\.DateTimeFormat/.test(stripComments(view)),
    'this is the single line that would move a role into the previous month');
  check('the module builds no Date from a role date either',
    !/new Date\s*\(/.test(stripComments(source)));
  check('the DATE columns are read as text',
    /to_char\(started_on, 'YYYY-MM-DD'\)/.test(source) ||
      /calendarCol\('started_on'\)/.test(source));
  check("and WITHOUT `AT TIME ZONE`, which belongs to the timestamp columns",
    !/started_on AT TIME ZONE/.test(source) && !/ended_on AT TIME ZONE/.test(source),
    'a DATE has no instant to shift; shifting one moves 2025-01-01 to 2024-12-31');
  check('the timestamp column that IS read still gets the Beirut correction',
    /beirutDay\('created_at'\)/.test(source) &&
      /AT TIME ZONE 'Asia\/Beirut'/.test(source),
    'created_at is an instant and does need shifting; the DATE columns do not');

  check('every read takes a viewer, and none of them defaults it',
    !/viewer\s*:\s*Viewer\s*=/.test(code) && !/viewer\s*\?\s*:/.test(code),
    'a filter with a default is a filter somebody forgets');
  check('the queries bind the viewer rule rather than restating it in SQL',
    /visibility = ANY\(\$\d::text\[\]\)/.test(code) && /visibleTo\(/.test(code),
    'one rule, so the probe above is checking the rule the database applies');
  check('the cross-person search groups by nothing and counts nobody',
    !/GROUP BY\s+r?\.?user_id/i.test(code) && !/count\([\s\S]{0,40}user_id/i.test(code),
    'sorting people is how a search quietly becomes a league table');
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
