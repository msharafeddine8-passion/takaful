import type { Locale } from '@/lib/i18n';

/**
 * Every string the volunteer passport needs, in one file.
 *
 * Its own module rather than three splices into types.ts / ar.ts / en.ts, for
 * the reason dictionaries/challenge-levels.ts, dictionaries/volunteer-roles.ts
 * and dictionaries/member-profile.ts all give: those three files are edited in
 * lockstep by other work, and a feature's worth of new keys landing in the
 * middle of them is a conflict nobody learns anything from resolving. To fold
 * it in later, add `passport: PassportStrings` to the Dictionary type and
 * spread these two objects into ar.ts and en.ts. Nothing else has to move.
 *
 * Placeholders are filled with String.replace — {date}, {n}, {total} — which is
 * the convention the rest of the dictionary uses. There is no ICU here.
 *
 * ── THE MOST IMPORTANT STRING IN THIS FILE ─────────────────────────────────
 *
 * `notACertificate`. This platform issues real certificates: they carry a code,
 * they are minted at the moment a course is passed, and a stranger can check
 * one at /verify. A sheet of A4 carrying the association's logo, a membership
 * number and a list of hours looks exactly like one of those from across a
 * desk, and it is not — it is a summary the holder printed of their own
 * account, and every figure on it came from the holder's own screen.
 *
 * So the disclaimer is not a footnote and is not softened. It sits above the
 * record, it uses the word «شهادة» / "certificate" so that the thing being
 * denied is named, and it tells the reader where a real one is checked. A
 * university admissions officer who reads only one line of this document must
 * read that one.
 *
 * ── AND THE SECOND MOST IMPORTANT: THE EMPTY STATES ────────────────────────
 *
 * The client's section 58. Not one string in this file renders a zero. A
 * volunteer with no certificates yet is handed a document that says what would
 * put a certificate there, not one that says «٠». Both readings are true; only
 * one of them is a reason to carry on. Every `*Empty` key below is a sentence
 * naming the thing that fills its section, and each is written for the person
 * holding the paper rather than about them.
 *
 * ── WHAT IS NOT HERE ───────────────────────────────────────────────────────
 *
 * No string comparing this volunteer with another, no rank, no percentile, no
 * «من أصل ٤٠٠ متطوّع». The passport is one person's record; the moment it
 * carries a position it becomes a league table somebody attaches to a
 * scholarship application. The same refusal as the head of lib/awards.ts.
 */

/** The shape countPhrase() in lib/when.ts expects. Only few/many carry {n}. */
export type CountForms = {
  zero: string;
  one: string;
  two: string;
  few: string;
  many: string;
};

export type PassportStrings = {
  // ---- the way in
  /** The account navigation label, beside the card and the certificates. */
  navLabel: string;
  kicker: string;
  title: string;
  lede: string;

  // ---- the export (section 11)
  download: string;
  downloadHint: string;
  back: string;

  /*
   * ---- the sheet's own identity
   *
   * The registration number, the telephone and the verification address are
   * NOT interpolated into these strings, and each is rendered beside its label
   * in its own `dir="ltr"` span instead. A Latin run inside Arabic prose is
   * reordered by the bidi algorithm, and «+961 81 206 341» inside an RTL
   * paragraph puts the plus sign on the wrong end of the number — which is a
   * telephone number that cannot be dialled, printed on a document nobody can
   * correct once it is paper.
   */
  generatedOn: string;
  orgRegistrationLabel: string;
  contactLabel: string;

  /*
   * ---- what this sheet is
   *
   * This began as a disclaimer: "a record you generated yourself, not a
   * certificate from the association", written so a printed summary could not
   * be mistaken for a credential across an admissions desk.
   *
   * The association overruled it, and was right. Almost nothing here is
   * self-reported — the hours were verified by a supervisor, the attendance
   * confirmed, the certificates issued by the association, the roles written
   * onto the record by its own staff. Calling that "generated yourself"
   * understated what the association already stands behind, and made its own
   * record read like a claim somebody was making about themselves.
   *
   * What survives of the caution is the pointer to /verify — a certificate
   * listed here really does carry a code a stranger can check — and the note
   * beside skills, which is the one thing on the sheet nobody reviewed.
   */
  issuedTitle: string;
  issuedBody: string;
  verifyHint: string;

  // ---- who this is
  nameLabel: string;
  numberLabel: string;
  noNumber: string;
  memberSinceLabel: string;
  memberSinceUnknown: string;

  // ---- the figures
  summaryTitle: string;
  hoursLabel: string;
  hoursEmpty: string;
  activitiesLabel: string;
  activityCount: CountForms;
  activitiesEmpty: string;
  academyLabel: string;
  academyLevel: string;
  academyCourses: string;
  academyEmpty: string;

  // ---- the roles section. Its heading and its per-entry labels are borrowed
  //      from dictionaries/volunteer-roles.ts so the words are identical to the
  //      timeline this is a copy of; only the lede belongs to the passport.
  rolesLede: string;

  // ---- certificates
  certificatesTitle: string;
  certificatesLede: string;
  certificatesEmpty: string;
  issuedOn: string;
  certificatesWithdrawnNote: string;

  // ---- skills
  skillsTitle: string;
  skillsNote: string;
  skillsEmpty: string;

  // ---- badges
  badgesTitle: string;
  badgesLede: string;
  badgesEmpty: string;
  earnedOn: string;

  // ---- recognition
  recognitionTitle: string;
  recognitionLede: string;
  recognitionEmpty: string;
};

export const passportAr: PassportStrings = {
  navLabel: 'سجلّي التطوّعي',
  kicker: 'سجلّي في الجمعية',
  title: 'سجلّي التطوّعي',
  lede:
    'سجلّك في جمعية تكافل كلّه في ورقة واحدة: ساعاتك الموثّقة، والأنشطة التي حضرتَها، وما أنهيته في الأكاديمية، وشهاداتك، ومناصبك ومهامّك بتواريخها. حمّلها لتُرفقها بسيرتك الذاتية أو بطلب جامعة أو منحة.',

  download: 'تحميل سجلّي التطوّعي',
  downloadHint:
    'يفتح صندوق الطباعة في متصفّحك. اختر منه «حفظ بصيغة PDF» إن أردت ملفاً تُرفقه برسالة، أو اطبعه على ورق A4.',
  back: 'العودة إلى حسابي',

  generatedOn: 'أُصدرت هذه الورقة في {date}',
  orgRegistrationLabel: 'علم وخبر رقم',
  contactLabel: 'للتواصل مع الجمعية',

  issuedTitle: 'سجلّ تطوّعي صادر عن جمعية تكافل',
  /*
   * Read this next to what the platform actually issues before changing a word
   * of it. «مصدَّقة» and «موثَّقة» are the two words a reader would use to
   * describe a document the association stands behind, and both are denied here
   * explicitly rather than left to be inferred from silence.
   */
  issuedBody:
    'ما في هذه الورقة مأخوذ من سجلّ صاحبها في منصّة الجمعية: ساعاتٌ وثّقها مشرفوه، وحضورٌ أُثبت في حينه، وشهاداتٌ أصدرتها الجمعية باسمها، ومناصبُ كتبتها إدارتها على سجلّه.',
  verifyHint:
    'كلّ شهادةٍ واردة هنا تحمل رمزاً خاصاً بها؛ أدخله في صفحة التحقّق على موقع الجمعية للتثبّت منها.',

  nameLabel: 'الاسم',
  numberLabel: 'رقم العضوية',
  noNumber:
    'لم يُسنَد إليك رقم عضوية بعد. يُمنح الرقم حين تقبلك الجمعية متطوّعاً، ويظهر هنا وعلى بطاقتك.',
  memberSinceLabel: 'عضو منذ',
  memberSinceUnknown:
    'لم يُدوَّن تاريخ انتسابك بعد. راسل الجمعية ليُضاف إلى سجلّك ويظهر هنا.',

  summaryTitle: 'الخلاصة',
  hoursLabel: 'ساعات التطوّع الموثّقة',
  hoursEmpty:
    'لم تُوثَّق لك ساعات بعد. تُسجَّل ساعاتك بعد كلّ نشاط ويوثّقها مشرفك، فتظهر هنا.',
  activitiesLabel: 'الأنشطة التي حضرتَها',
  activityCount: {
    zero: 'لا أنشطة',
    one: 'نشاط واحد',
    two: 'نشاطان',
    few: '{n} أنشطة',
    many: '{n} نشاطاً',
  },
  activitiesEmpty:
    'لم يُسجَّل لك حضور في نشاط بعد. أوّل نشاط تحضره ويؤكّده مشرفه يظهر هنا.',
  academyLabel: 'الأكاديمية',
  academyLevel: 'المستوى {n}: {title}',
  academyCourses: 'أنهيتَ {done} من أصل {total} دورة.',
  academyEmpty:
    'لم تبدأ دورات الأكاديمية بعد. أوّل دورة تجتازها تظهر هنا مع المستوى الذي تفتحه.',

  rolesLede:
    'ما شغلته داخل الجمعية بتواريخه: ما تشغله الآن أوّلاً، ثمّ ما شغلته سابقاً. لا يُستبدل منصب بآخر — حين يخلفك أحد يُقفَل سطرك بتاريخه ويبقى في سجلّك.',

  certificatesTitle: 'الشهادات',
  certificatesLede:
    'شهادات أصدرتها الجمعية باسمك، وما زالت قائمة. لكلٍّ منها رمزٌ يُدخَل في صفحة التحقّق، وهو ما يُثبتها لا هذه الورقة.',
  certificatesEmpty:
    'لا شهادات في سجلّك بعد. تصدر لك الجمعية شهادةً باسمها عند اجتيازك أوّل دورة في الأكاديمية، وتحمل رمز تحقّق يُقرأ من موقعها.',
  issuedOn: 'أُصدرت في {date}',
  certificatesWithdrawnNote:
    'سُحبت من سجلّك شهادةٌ أو أكثر فلا تظهر في هذه الورقة. تجدها مع سبب سحبها في صفحة شهاداتك.',

  skillsTitle: 'المهارات',
  /* Said in the same breath as the list, because a reader who takes these for
     something the association assessed has been misled by the layout. */
  skillsNote: 'كما كتبتَها أنت في ملفّك الشخصي. لم تقيّمها الجمعية.',
  skillsEmpty:
    'لم تُدوِّن مهاراتك بعد. أضِفها من صفحة ملفّك الشخصي لتظهر في هذه الورقة.',

  badgesTitle: 'الشارات',
  badgesLede: 'تُمنح تلقائياً بحسب ما سجّلته المنصّة من عملك.',
  badgesEmpty:
    'لا شارات في سجلّك بعد. تُمنح الشارات تلقائياً عمّا تفعله — أوّل ساعة موثّقة، أوّل نشاط، أوّل دورة — فتظهر هنا من دون أن تطلبها.',
  earnedOn: 'نلتَها في {date}',

  recognitionTitle: 'تكريم',
  recognitionLede: 'ما كرّمتك به الجمعية بقرارٍ من لجنتها، لا بحسابٍ آليّ.',
  recognitionEmpty:
    'لم يُسنَد إليك تكريم بعد. تختار الجمعية في كلّ شهر من تكرّمهم بقرارٍ من لجنتها، وما يُسنَد إليك منها يظهر هنا.',
};

export const passportEn: PassportStrings = {
  navLabel: 'My volunteer record',
  kicker: 'My record',
  title: 'My volunteer record',
  lede:
    'Your whole record with Takaful on one sheet: your verified hours, the activities you attended, what you have finished in the academy, your certificates, and your roles and responsibilities with their dates. Download it to attach to a CV, a university application or a scholarship.',

  download: 'Download my volunteer record',
  downloadHint:
    'This opens your browser’s print dialogue. Choose “Save as PDF” for a file you can attach to an email, or print it on A4.',
  back: 'Back to my account',

  generatedOn: 'This sheet was generated on {date}',
  orgRegistrationLabel: 'Registration (ʿilm wa khabar) no.',
  contactLabel: 'To reach the association',

  issuedTitle: 'A volunteering record issued by Takaful',
  issuedBody:
    'Everything on this sheet is taken from its holder’s record on the association’s platform: hours their supervisors verified, attendance confirmed at the time, certificates the association issued in its own name, and roles its staff wrote onto the record.',
  verifyHint:
    'Every certificate listed here carries a code of its own; enter it on the association’s verification page to confirm it.',

  nameLabel: 'Name',
  numberLabel: 'Membership number',
  noNumber:
    'You have not been given a membership number yet. It is granted when the association accepts you as a volunteer, and it appears here and on your card.',
  memberSinceLabel: 'Member since',
  memberSinceUnknown:
    'The date you joined has not been written down yet. Write to the association and it will be added to your record and appear here.',

  summaryTitle: 'At a glance',
  hoursLabel: 'Verified volunteering hours',
  hoursEmpty:
    'No hours have been verified for you yet. You log your hours after each activity, your supervisor verifies them, and they appear here.',
  activitiesLabel: 'Activities attended',
  activityCount: {
    zero: 'No activities',
    one: 'One activity',
    two: '2 activities',
    few: '{n} activities',
    many: '{n} activities',
  },
  activitiesEmpty:
    'No attendance has been recorded for you yet. The first activity you attend appears here once its supervisor confirms it.',
  academyLabel: 'The academy',
  academyLevel: 'Level {n}: {title}',
  academyCourses: 'You have passed {done} of {total} courses.',
  academyEmpty:
    'You have not started the academy’s courses yet. The first course you pass appears here, together with the level it opens.',

  rolesLede:
    'What you have been inside Takaful, with dates: what you hold now first, then what you held before. No role replaces another — when somebody succeeds you, your line is closed with its date and stays on your record.',

  certificatesTitle: 'Certificates',
  certificatesLede:
    'Certificates the association issued in your name that still stand. Each carries a code to be entered on the verification page, and it is that code which proves it — not this sheet.',
  certificatesEmpty:
    'There are no certificates on your record yet. The association issues one in its own name when you pass your first course in the academy, and it carries a verification code readable from its website.',
  issuedOn: 'Issued on {date}',
  certificatesWithdrawnNote:
    'One or more certificates have been withdrawn from your record and do not appear on this sheet. You will find them, with the reason they were withdrawn, on your certificates page.',

  skillsTitle: 'Skills',
  skillsNote: 'As you wrote them on your own profile. The association has not assessed them.',
  skillsEmpty:
    'You have not written down your skills yet. Add them on your profile page and they appear on this sheet.',

  badgesTitle: 'Badges',
  badgesLede: 'Granted automatically for the work the platform has recorded.',
  badgesEmpty:
    'There are no badges on your record yet. Badges are granted automatically for what you do — a first verified hour, a first activity, a first course — and appear here without your having to ask.',
  earnedOn: 'Earned on {date}',

  recognitionTitle: 'Recognition',
  recognitionLede: 'What the association honoured you with by a decision of its committee, not by an arithmetic.',
  recognitionEmpty:
    'No recognition has been given to you yet. Each month the association’s committee chooses volunteers to honour, and anything given to you appears here.',
};

export const passportDictionaries: Record<Locale, PassportStrings> = {
  ar: passportAr,
  en: passportEn,
};

export function passportStrings(lang: Locale): PassportStrings {
  return passportDictionaries[lang];
}
