/**
 * Every string the staff role search introduces, in one file.
 *
 * The dictionary proper is three large files edited in lockstep — types.ts
 * declares the shape, ar.ts and en.ts fill it — and adding a namespace by
 * hand-editing all three at once is how two people working in parallel
 * collide. So this namespace owns its strings here and the route imports it
 * directly, exactly as challenge-levels.ts, challenges.ts, awards.ts and
 * volunteer-roles.ts already do. Splicing it into the main dictionary later is
 * three one-line edits.
 *
 * Placeholders are filled with String.replace — {q}, {n}, {title} — which is
 * the convention the rest of the dictionary uses. There is no ICU here.
 *
 * ── THERE IS NOT ONE ROLE TITLE IN THIS FILE, AND THERE MUST NEVER BE ──────
 *
 * No placeholder listing «رئيس لجنة» / «منسّق مشروع», no example search in a
 * lede, no chip label written by a developer. The whole reason migration 046
 * made `title_ar` free text is that an association invents responsibilities
 * faster than anybody ships a migration; a title spelled out here would be a
 * developer quietly deciding which responsibilities are the real ones, and the
 * first person to read it as a menu would stop typing anything else.
 *
 * The placeholder therefore says what SHAPE of thing to type — a part of a
 * title — and never an instance of one. What the box actually offers comes
 * from roleTitleSuggestions(), read back out of the table at request time.
 *
 * ── NOTHING HERE COUNTS OR RANKS A PERSON ─────────────────────────────────
 *
 * `resultCount` counts MATCHING ROLES, which is the length of one list, and it
 * is never shown against a name. There is no string for "roles held", no
 * "most titles", no comparative of any kind, because peopleWithRole() produces
 * no such figure to put in one — the invariant is stated on the function in
 * lib/volunteer-roles.ts and restated as `orderNote` and `repeatNote` below,
 * which are the two sentences on the screen that tell a reader why the list is
 * shaped the way it is.
 */

/** 'ar' | 'en', spelled out rather than imported, so this file stays a leaf. */
type RoleSearchLocale = 'ar' | 'en';

/** The shape countPhrase() in lib/when.ts expects. Only few/many carry {n}. */
export type CountForms = {
  zero: string;
  one: string;
  two: string;
  few: string;
  many: string;
};

export type RoleSearchStrings = {
  // ---- the panel
  sectionTitle: string;
  lede: string;

  // ---- the box
  searchLabel: string;
  searchPlaceholder: string;
  searchGo: string;
  heldLabel: string;
  heldAny: string;
  heldCurrent: string;
  heldPast: string;

  // ---- what the box offers before anybody types
  suggestionsHeading: string;
  /* Restates on screen what the module restates in code: a typeahead, never a
   * permitted set. An administrator who reads this knows the box will take a
   * word no chip below it shows. */
  suggestionsNote: string;
  suggestionsEmpty: string;
  prompt: string;

  // ---- the results
  resultsHeading: string;
  resultCount: CountForms;
  /** Why the list is in the order it is in, and what it deliberately is not. */
  orderNote: string;
  /** Why one person can occupy two lines, and why that is not a total. */
  repeatNote: string;
  capped: string;
  noResults: string;

  // ---- one line of the results
  badgeCurrent: string;
  badgePast: string;
  typeLabel: string;
  entityLabel: string;
  /** The title in the other language, so a match nobody can see still reads. */
  alsoWritten: string;
  nameMissing: string;
  openProfile: string;
};

export const roleSearchAr: RoleSearchStrings = {
  sectionTitle: 'البحث في المناصب والمهامّ',
  lede:
    'اكتب جزءاً من اسم منصب أو مهمّة، بالعربية أو بالإنكليزية، فتظهر كلّ المناصب التي يرد فيها ذلك الجزء ومن تولّاها ومتى. ما يُبحث فيه هو ما كُتب فعلاً في سجلّات المتطوّعين، لا قائمة معدّة سلفاً، فلا كلمة يرفضها هذا البحث.',

  searchLabel: 'من تولّى منصباً يطابق…',
  searchPlaceholder: 'جزء من اسم المنصب',
  searchGo: 'ابحث',
  heldLabel: 'يتولّاه الآن أم تولّاه سابقاً',
  heldAny: 'الحالي والسابق معاً',
  heldCurrent: 'يتولّاه الآن',
  heldPast: 'تولّاه سابقاً',

  suggestionsHeading: 'مناصب سبق تسجيلها',
  suggestionsNote:
    'هذه قراءةٌ لما كُتب في السجلّات، لا قائمةٌ مسموحاً بها: اضغط واحداً لتبحث به، أو اكتب في الصندوق ما لا تجده هنا — يُبحث عنه كما تكتبه.',
  suggestionsEmpty: 'لم يُسجَّل أيّ منصب بعد، فلا شيء يُقترح.',
  prompt: 'اكتب جزءاً من اسم منصب لتبدأ، أو اضغط أحد المقترحات أدناه.',

  resultsHeading: 'المناصب المطابقة',
  resultCount: {
    zero: 'لا منصب مطابق',
    one: 'منصب واحد مطابق',
    two: 'منصبان مطابقان',
    few: '{n} مناصب مطابقة',
    many: '{n} منصباً مطابقاً',
  },
  orderNote:
    'الترتيب ترتيب المناصب نفسها: ما يُتولّى اليوم أوّلاً، ثمّ الأحدث بداية. ليس ترتيباً بين الأشخاص، ولا يُحصى لأحد عددُ ما تولّاه، ولا يُقارَن اثنان.',
  repeatNote:
    'من تولّى أكثر من منصب مطابق يظهر مرّةً عن كلّ منصب، لأنّ لكلّ منصب مدّته وحده وسطرٌ واحد لا يسع مدّتين. هو اسمٌ يتكرّر لأنّ الوقائع اثنتان، لا مجموعٌ يُبنى له.',
  capped: 'هذه أوّل {n} نتيجة. ضيّق البحث لترى ما بعدها.',
  noResults: 'لا منصب يطابق «{q}».',

  badgeCurrent: 'حالي',
  badgePast: 'سابق',
  typeLabel: 'النوع',
  entityLabel: 'ضمن',
  alsoWritten: 'ويُكتب أيضاً: {title}',
  nameMissing: 'اسم غير مسجَّل',
  openProfile: 'افتح صفحة العضو',
};

export const roleSearchEn: RoleSearchStrings = {
  sectionTitle: 'Search the roles and responsibilities',
  lede:
    'Type part of a role or responsibility, in Arabic or in English, and every role whose title contains that part appears, with who held it and when. What is searched is what was actually written on the volunteers’ records rather than a list prepared in advance, so there is no word this search refuses.',

  searchLabel: 'Who has held a role matching…',
  searchPlaceholder: 'Part of a role title',
  searchGo: 'Search',
  heldLabel: 'Holds it now, or held it before',
  heldAny: 'Current and past together',
  heldCurrent: 'Holds it now',
  heldPast: 'Held it before',

  suggestionsHeading: 'Roles recorded before',
  suggestionsNote:
    'This is a reading of what the records already say, not a permitted list: tap one to search with it, or type into the box whatever you do not find here — it is searched for exactly as you write it.',
  suggestionsEmpty: 'No role has been recorded yet, so there is nothing to suggest.',
  prompt: 'Type part of a role title to begin, or tap one of the suggestions below.',

  resultsHeading: 'Matching roles',
  resultCount: {
    zero: 'No matching role',
    one: 'One matching role',
    two: '2 matching roles',
    few: '{n} matching roles',
    many: '{n} matching roles',
  },
  orderNote:
    'The order is the roles’ own: those held today first, then the most recently begun. It is not an ordering of people, nobody’s roles are counted up, and no two people are compared.',
  repeatNote:
    'Anyone who has held more than one matching role appears once for each of them, because every role has its own period and one line cannot hold two. It is a name occurring twice because there are two facts, not a total being built about them.',
  capped: 'These are the first {n} results. Narrow the search to see past them.',
  noResults: 'No role matches “{q}”.',

  badgeCurrent: 'Current',
  badgePast: 'Past',
  typeLabel: 'Type',
  entityLabel: 'Part of',
  alsoWritten: 'Also written: {title}',
  nameMissing: 'Name not recorded',
  openProfile: 'Open the member’s page',
};

export const roleSearchDictionaries: Record<RoleSearchLocale, RoleSearchStrings> = {
  ar: roleSearchAr,
  en: roleSearchEn,
};

export function roleSearch(lang: RoleSearchLocale): RoleSearchStrings {
  return roleSearchDictionaries[lang];
}
