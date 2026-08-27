/**
 * Every string the "somebody attended who never signed up" control introduces.
 *
 * Its own module rather than three splices into types.ts / ar.ts / en.ts,
 * exactly as role-search.ts, recognition-admin.ts and prior-activities.ts do
 * it. Those three files are large, edited in lockstep, and being edited by
 * other work; a namespace landing in the middle of all three at once is a
 * conflict nobody learns anything from resolving. Folding it in later is three
 * one-line edits.
 *
 * Placeholders are filled with String.replace — {name}, {q}, {n} — which is
 * the convention the rest of the dictionary uses. There is no ICU here.
 *
 * ── THE SCREEN SAYS WHAT THE RECORD WILL SAY ──────────────────────────────
 *
 * `lede` states, before anything is pressed, that the addition is written down
 * as an addition made without a registration. That is not a warning and not a
 * hedge: it is the same fact the audit line carries, said to the person doing
 * it at the moment they do it, so that nobody discovers months later that the
 * platform recorded something about their decision that they were not told.
 *
 * ── AND IT SAYS WHEN NOTHING HAPPENED ─────────────────────────────────────
 *
 * `amended` and `unchanged` exist because a second press on the same person
 * must not report an addition that did not occur. One corrects what is already
 * on the register, the other did nothing at all, and both say so plainly.
 * "Added" three times over one person is how a coordinator comes to believe
 * they credited three people.
 */

/** 'ar' | 'en', spelled out rather than imported, so this file stays a leaf. */
type AddAttendeeLocale = 'ar' | 'en';

export type AddAttendeeStrings = {
  sectionTitle: string;
  lede: string;

  searchLabel: string;
  searchPlaceholder: string;
  searchGo: string;
  /** Before any search has been made. Says why the screen is empty. */
  prompt: string;
  /** Carries {q}. */
  none: string;
  /** Carries {n}. */
  limitNote: string;

  addButton: string;
  noteField: string;
  durationNote: string;

  /** Chips beside a name the search found. */
  onRegister: string;
  registered: string;
  onRegisterNote: string;

  /**
   * Beside a name on the register itself, and as a figure in the summary
   * under it. The register would otherwise show somebody with no registration
   * status and no explanation, which reads as a record that lost something.
   */
  chip: string;
  summaryFact: string;

  /** Carries {name}. */
  added: string;
  /** Carries {name}. */
  amended: string;
  /** Carries {name}. */
  unchanged: string;

  errors: {
    forbidden: string;
    cancelled: string;
    notFound: string;
    unavailable: string;
    noPerson: string;
    notAVolunteer: string;
    notYourself: string;
  };
};

const ar: AddAttendeeStrings = {
  sectionTitle: 'إضافة من حضر دون تسجيل',
  lede:
    'إن شارك أحدهم في النشاط ولم يكن مسجَّلاً فيه، ابحث عنه بالاسم أو برقم العضوية وأضِفه '
    + 'إلى سجلّ الحضور. تُحتسب ساعاته كما تُحتسب لسائر الحاضرين، ويُثبَّت في سجلّ العمليات '
    + 'أنّه أُضيف من دون تسجيل مسبق.',

  searchLabel: 'ابحث عن متطوّع',
  searchPlaceholder: 'الاسم أو رقم العضوية',
  searchGo: 'ابحث',
  /* Says out loud that the emptiness is a decision, not a page that failed to
     load. The control is on a screen for ticking a register, and a list of the
     association's members is not something it may put there unasked. */
  prompt: 'اكتب اسماً أو رقم عضوية ثمّ اضغط «ابحث». لا تظهر أيّ أسماء قبل ذلك.',
  none: 'لا نتائج تطابق «{q}».',
  limitNote: 'تظهر {n} نتيجة على الأكثر. إن لم يكن من تبحث عنه بينها فضيّق بحثك.',

  addButton: 'أضِفه حاضراً',
  noteField: 'ملاحظة (اختيارية)',
  durationNote: 'تُحتسب المدّة بطول النشاط، ويمكن تعديلها من سجلّ الحضور أعلاه.',

  onRegister: 'مدرَج في سجلّ الحضور',
  registered: 'مسجَّل في النشاط',
  onRegisterNote: 'هذا الشخص مدرَج في السجلّ أعلاه، وتُعدَّل بياناته من هناك.',

  chip: 'أُضيف دون تسجيل',
  summaryFact: 'أُضيفوا دون تسجيل',

  added: 'أُضيف «{name}» إلى سجلّ الحضور واحتُسبت ساعاته.',
  amended: 'كان «{name}» مدرَجاً في السجلّ، فعُدّل حضوره بدل إضافة قيد ثانٍ له.',
  unchanged: '«{name}» مسجَّل حاضراً بالمدّة نفسها، فلم يتغيّر شيء.',

  errors: {
    forbidden: 'لا صلاحية لك لتسجيل الحضور.',
    cancelled: 'أُلغي هذا النشاط، ولا يُسجَّل عليه حضور.',
    notFound: 'لم يُعثر على هذا النشاط.',
    unavailable: 'تعذّر الوصول إلى قاعدة البيانات.',
    noPerson: 'لم يُعثر على هذا الشخص.',
    notAVolunteer: 'هذا الحساب ليس حساب متطوّع، ولا يُسجَّل له حضور نشاط ميداني.',
    notYourself: 'لا يمكنك تسجيل حضورك بنفسك.',
  },
};

const en: AddAttendeeStrings = {
  sectionTitle: 'Add someone who attended without registering',
  lede:
    'If somebody took part in this activity without being registered for it, find them by name '
    + 'or membership number and add them to the register. Their hours are credited exactly as for '
    + 'anybody else, and the audit log records that they were added without a registration.',

  searchLabel: 'Search for a volunteer',
  searchPlaceholder: 'Name or membership number',
  searchGo: 'Search',
  prompt: 'Type a name or a membership number and press Search. No names are shown before that.',
  none: 'Nothing matches “{q}”.',
  limitNote: 'At most {n} results are shown. If the person you want is not among them, narrow the search.',

  addButton: 'Mark as attended',
  noteField: 'Note (optional)',
  durationNote: 'Credited for the length of the activity. Correct it on the register above if it was shorter or longer.',

  onRegister: 'On the register',
  registered: 'Registered',
  onRegisterNote: 'This person is on the register above. Change their record there.',

  chip: 'Added without registering',
  summaryFact: 'Added without registering',

  added: '“{name}” was added to the register and their hours credited.',
  amended: '“{name}” was already on the register, so their attendance was corrected rather than added a second time.',
  unchanged: '“{name}” is already recorded as attending for the same length of time. Nothing changed.',

  errors: {
    forbidden: 'You do not have permission to record attendance.',
    cancelled: 'This activity was called off. No attendance can be recorded against it.',
    notFound: 'That activity could not be found.',
    unavailable: 'The database is unavailable.',
    noPerson: 'That person could not be found.',
    notAVolunteer: 'That account is not a volunteer, so it cannot be marked present at a field activity.',
    notYourself: 'You cannot record your own attendance.',
  },
};

export function addAttendee(lang: AddAttendeeLocale): AddAttendeeStrings {
  return lang === 'ar' ? ar : en;
}
