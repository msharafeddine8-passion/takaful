/**
 * Every string the staff "records that need attention" panel introduces, and
 * the membership-status filter beside it, in one file.
 *
 * The dictionary proper is three large files edited in lockstep — types.ts
 * declares the shape, ar.ts and en.ts fill it — and adding a namespace by
 * hand-editing all three at once is how two people working in parallel
 * collide. So this namespace owns its strings here and the route imports it
 * directly, exactly as role-search.ts, challenges.ts and awards.ts already do.
 *
 * The only placeholder here is {n}, in the counted-noun forms, filled by
 * countPhrase() in lib/when.ts — the convention the rest of the dictionary
 * uses. There is no ICU here.
 *
 * ── NOT ONE SENTENCE HERE DESCRIBES A PERSON ──────────────────────────────
 *
 * Every subject is a RECORD. «سجلّ لا يستقيم», "a record that does not add
 * up", "what the record is missing" — never «متطوّع مخالف», never "a problem
 * account", never anything with a person as the thing at fault. That is not
 * politeness. In all three cases the platform is what failed: it wrote a role
 * and moved nothing else, it held a roster line and showed it to nobody, it
 * accepted somebody's hours without ever putting the question of them to a
 * member of staff. The director of the association had to name five people
 * from memory because none of this was on any screen; wording that turned
 * round and blamed those five would be the same failure told backwards.
 *
 * There is likewise no severity word, no "urgent", no ordering of one line
 * against another, and no figure attached to a name. `recordCount` counts
 * RECORDS UNDER ONE HEADING — the length of one list, which is a count of the
 * platform's own loose ends — and is never shown beside anybody.
 *
 * ── AND NOT ONE OF THEM PROMISES AN ACTION ────────────────────────────────
 *
 * The panel shows and links. `fixLabel` is always the name of a SCREEN to open
 * — «افتح…», "Open…", "Link…" as a destination — never «صحّح» or "Fix", which
 * would read as a button that acts here. Every real change goes through the
 * guarded paths that take a reason and record who decided.
 */

/** 'ar' | 'en', spelled out rather than imported, so this file stays a leaf. */
type NeedsAttentionLocale = 'ar' | 'en';

/** The shape countPhrase() in lib/when.ts expects. Only few/many carry {n}. */
export type CountForms = {
  zero: string;
  one: string;
  two: string;
  few: string;
  many: string;
};

/**
 * What one heading says: the defect, its consequence, and where to go.
 *
 * `body` is printed ONCE above the lines it covers and therefore carries no
 * placeholder — no {status}, no name, nothing belonging to a single record.
 * Whatever differs between two lines under the same heading is a FACT, and
 * facts are printed as labelled pairs beneath each line. A paragraph repeated
 * five times with one word changed is a paragraph nobody reads twice.
 */
export type CheckStrings = {
  /** The defect, as a heading. A state of a record, not a kind of person. */
  title: string;
  /** What is missing, what it does to the person, and what the fix costs. */
  body: string;
  /** The screen to open. A destination, never an imperative to correct. */
  fixLabel: string;
  /** Said when this check found nothing, which is worth saying out loud. */
  empty: string;
};

export type NeedsAttentionStrings = {
  // ---- the panel
  sectionTitle: string;
  lede: string;
  /** Restates on the screen what the module restates in code: this only reads. */
  readOnlyNote: string;
  /** Why one name can occupy two headings, and why that is not a total. */
  repeatNote: string;
  /** Every check came back empty. Said plainly rather than by hiding the panel. */
  allClear: string;
  /** A count of RECORDS under one heading. Never shown against a name. */
  recordCount: CountForms;

  // ---- one heading each
  checks: {
    volunteer_role_without_standing: CheckStrings;
    account_matches_unclaimed_line: CheckStrings;
    taking_part_undecided: CheckStrings;
  };

  /** The sentence that keeps heading (b) a suggestion and not an instruction. */
  suggestionOnly: string;

  // ---- the facts printed under a line
  factStatus: string;
  factStatusMissing: string;
  factRosterLine: string;
  factRosterName: string;
  factRosterJoined: string;
  factVerifiedHours: string;
  factAttendance: string;
  factCourses: string;
  activityCount: CountForms;
  courseCount: CountForms;

  openProfile: string;
  nameMissing: string;

  // ---- the membership-status filter on the member table
  filterLabel: string;
  filterAny: string;
};

export const needsAttentionAr: NeedsAttentionStrings = {
  sectionTitle: 'سجلّات تحتاج إلى مراجعة',
  lede:
    'ما في هذه السجلّات ناقص أو متناقض، فلا يكفي أحداً ليبنيَ عليه قراراً. الخلل خلل المنصّة لا خلل أصحاب هذه الحسابات: في كلّ حالةٍ منها أدّت المنصّة نصف العمل ولم تُعلِم أحداً بالنصف الباقي. يقول كلّ سطر ما الذي ينقص السجلّ، ويُحيل إلى الشاشة التي يُتَّخذ فيها القرار ويُسجَّل فيها من اتّخذه ولماذا.',
  readOnlyNote:
    'لا يُغيَّر شيء من هذه الشاشة. هي تعرض وتُحيل، ولا تُقرّر.',
  repeatNote:
    'قد يرِد الاسم نفسه تحت أكثر من عنوان، لأنّ ما ينقص سجلَّه أكثر من أمر واحد. هو سجلٌّ يتكرّر لأنّ النقص اثنان، لا مجموعٌ يُبنى لأحد.',
  allClear:
    'لا سجلّ يحتاج إلى مراجعة الآن. تبقى العناوين أدناه ليُعرَف ما الذي يُفحَص.',
  recordCount: {
    zero: 'لا سجلّ',
    one: 'سجلّ واحد',
    two: 'سجلّان',
    few: '{n} سجلّات',
    many: '{n} سجلاًّ',
  },

  checks: {
    volunteer_role_without_standing: {
      title: 'دور «متطوّع» ساري المفعول بلا وضع تطوّع',
      body:
        'لهذه الحسابات دور «متطوّع» ما زال سارياً، غير أنّ آخر وضع عضويّة مسجَّل لها ليس وضع تطوّع. والمنصّة تقرأ وضع العضويّة وحده حين تسأل «أهذا متطوّع؟»، فصاحب الحساب لا يستطيع التسجيل في أيّ نشاط، بينما يظهر في كلّ قائمة تقرأ الأدوار كأنّه مقبول. الوضع والدور يُضبطان معاً من شاشة سجلّ التطوّع، ولا يُضبط أحدهما دون الآخر.',
      fixLabel: 'افتح شاشة سجلّ التطوّع',
      empty: 'لا حساب في هذه الحال.',
    },
    account_matches_unclaimed_line: {
      title: 'اسم حساب يطابق سطراً في السجلّ لم يُطالِب به أحد',
      body:
        'يطابق اسم هذا الحساب — بعد توحيد رسم الهمزة والتاء المربوطة — اسمَ سطرٍ في سجلّ الجمعية لم يُطالِب به أحد بعد. إن كانا شخصاً واحداً، فربط الحساب بالسطر يُبقي له الرقم الذي أعطته إيّاه الجمعية وأقدميّته معه؛ أمّا قبوله متطوّعاً جديداً فيمنحه رقماً جديداً من التسلسل ويمحو تلك الأقدميّة محواً لا يُصلحه تعديل لاحق.',
      fixLabel: 'افتح شاشة الربط بسطر السجلّ',
      empty: 'لا حساب يطابق اسمه سطراً غير مطالَب به.',
    },
    taking_part_undecided: {
      title: 'مشاركة في العمل بلا طلب تطوّع ولا قرار',
      body:
        'شارك أصحاب هذه الحسابات في عمل الجمعية — ساعاتٌ اعتمدها موظّف، أو حضورٌ أكّده موظّف، أو دورة اجتازوها — وليس لأحدهم طلب تطوّع ولا صفة متطوّع. لم يُعرَض أمرهم على أحد ليقرّر فيه: لم يُرفَضوا، بل لم يُسأل أحد أصلاً.',
      fixLabel: 'افتح شاشة سجلّ التطوّع',
      empty: 'لا حساب في هذه الحال.',
    },
  },

  suggestionOnly:
    'تطابق الاسم ليس إثباتاً للهويّة؛ في السجلّ أسماء يحملها أكثر من شخص. هذا اقتراحٌ يزنه موظّف يعرف الشخص، ولا يُربَط شيء من هنا تلقائيّاً.',

  factStatus: 'الوضع المسجَّل',
  factStatusMissing: 'لا وضع مسجَّل',
  factRosterLine: 'رقم السطر في السجلّ',
  factRosterName: 'الاسم كما في السجلّ',
  factRosterJoined: 'متطوّع منذ',
  factVerifiedHours: 'ساعات معتمدة',
  factAttendance: 'حضور مؤكَّد',
  factCourses: 'دورات مجتازة',
  activityCount: {
    zero: 'لا نشاط',
    one: 'نشاط واحد',
    two: 'نشاطان',
    few: '{n} أنشطة',
    many: '{n} نشاطاً',
  },
  courseCount: {
    zero: 'لا دورة',
    one: 'دورة واحدة',
    two: 'دورتان',
    few: '{n} دورات',
    many: '{n} دورة',
  },

  openProfile: 'افتح صفحة العضو',
  nameMissing: 'اسم غير مسجَّل',

  filterLabel: 'وضع العضويّة',
  filterAny: 'كلّ الأوضاع',
};

export const needsAttentionEn: NeedsAttentionStrings = {
  sectionTitle: 'Records that need attention',
  lede:
    'What these records hold is incomplete or contradicts itself, so it is not enough for anybody to decide on. The fault is the platform’s and not the account holders’: in each of these cases it did half a job and told nobody about the other half. Every line says what the record is missing and links to the screen where the decision is made and where who made it, and why, is written down.',
  readOnlyNote: 'Nothing is changed from this screen. It shows and it links; it does not decide.',
  repeatNote:
    'The same name can appear under more than one heading, because more than one thing is missing from that record. It is a record occurring twice because there are two gaps, not a total being built about somebody.',
  allClear:
    'No record needs attention right now. The headings stay below so that what is being checked is visible.',
  recordCount: {
    zero: 'No record',
    one: 'One record',
    two: '2 records',
    few: '{n} records',
    many: '{n} records',
  },

  checks: {
    volunteer_role_without_standing: {
      title: 'A valid volunteer role with no volunteer standing behind it',
      body:
        'These accounts hold a volunteer role that is still valid, yet the latest membership standing recorded for them is not a volunteer standing. When the platform asks “is this a volunteer?” it reads the membership standing and nothing else, so the person cannot register for a single activity — while every list that reads roles shows them as approved. The standing and the role are set together on the roster screen, and neither is set without the other.',
      fixLabel: 'Open the roster screen',
      empty: 'No account is in this state.',
    },
    account_matches_unclaimed_line: {
      title: 'An account whose name matches an unclaimed roster line',
      body:
        'This account’s name matches — once the spelling of أ/ا and ة/ه is folded together — the name on a line of the association’s roster that nobody has claimed. If they are the same person, linking the account to the line keeps the number the association gave them, and their seniority with it; accepting them as a new volunteer instead issues a fresh number from the sequence and erases that seniority in a way no later edit undoes.',
      fixLabel: 'Open the roster-linking screen',
      empty: 'No account’s name matches an unclaimed line.',
    },
    taking_part_undecided: {
      title: 'Taking part with no application and no decision',
      body:
        'These accounts have taken part in the association’s work — hours a member of staff verified, attendance a member of staff confirmed, or a course passed — and have neither a volunteer application nor volunteer standing. Nobody was ever put in front of the question: it was not refused, it was never asked.',
      fixLabel: 'Open the roster screen',
      empty: 'No account is in this state.',
    },
  },

  suggestionOnly:
    'A matching name is not proof of identity; the roster holds names that more than one person carries. This is a suggestion for a member of staff who knows the person to weigh, and nothing here links anything automatically.',

  factStatus: 'Recorded standing',
  factStatusMissing: 'No standing recorded',
  factRosterLine: 'Roster line',
  factRosterName: 'Name as the roster writes it',
  factRosterJoined: 'Volunteering since',
  factVerifiedHours: 'Verified hours',
  factAttendance: 'Confirmed attendance',
  factCourses: 'Courses passed',
  activityCount: {
    zero: 'No activity',
    one: 'One activity',
    two: '2 activities',
    few: '{n} activities',
    many: '{n} activities',
  },
  courseCount: {
    zero: 'No course',
    one: 'One course',
    two: '2 courses',
    few: '{n} courses',
    many: '{n} courses',
  },

  openProfile: 'Open the member’s page',
  nameMissing: 'Name not recorded',

  filterLabel: 'Membership standing',
  filterAny: 'Every standing',
};

export const needsAttentionDictionaries: Record<NeedsAttentionLocale, NeedsAttentionStrings> = {
  ar: needsAttentionAr,
  en: needsAttentionEn,
};

export function needsAttentionStrings(lang: NeedsAttentionLocale): NeedsAttentionStrings {
  return needsAttentionDictionaries[lang];
}
