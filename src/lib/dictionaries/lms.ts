/**
 * Every user-facing string the path map introduces, in one file.
 *
 * The dictionary is three large files edited in lockstep — types.ts declares
 * the shape, ar.ts and en.ts fill it. Adding a namespace by hand-editing all
 * three at once is how two people working in parallel collide. So the map owns
 * its strings here, and the integrator splices this in three one-line edits:
 *
 *   types.ts   map: LmsStrings;      (inside Account, plus the import)
 *   ar.ts      map: lmsAr,
 *   en.ts      map: lmsEn,
 *
 * Placeholders are filled with String.replace, matching the convention the rest
 * of the dictionary already uses. There is no ICU here.
 *
 * COUNTED NOUNS. An earlier version of this header claimed every Arabic
 * template was written to read correctly for any number. It was not true, and
 * it was untrue exactly where it hurt most: the orientation station holds one
 * course, so the commonest string on the map rendered "0 من 1 دورات" — Arabic
 * never pluralises after 1 — and "0 of 1 courses" in English. A template with a
 * hole in it cannot be grammatical for every number, because Arabic inflects
 * the counted noun five ways and English two.
 *
 * So the three counted strings are `PluralForms`, not `string`, and the caller
 * asks `plural(forms, n, lang)` for the one that fits. The forms are named for
 * the CLDR categories:
 *
 *   one   n = 1        دورة واحدة        1 course
 *   two   n = 2        دورتان            (English reuses `other`)
 *   few   n % 100 = 3-10   3 دورات       (English reuses `other`)
 *   many  n % 100 = 11-99  11 دورة       (English reuses `other`)
 *   other everything else
 *
 * Both locales declare all five, even where English repeats itself, because
 * scripts/probe-a11y asserts that the two objects hold exactly the same keys —
 * a form present in one language and missing from the other is precisely the
 * bug that would reappear here.
 *
 * Two rules this file must keep, both asserted directly by scripts/probe-a11y:
 *   - no key holds the same literal in both locales;
 *   - no key is empty.
 */

/** 'ar' | 'en' — spelled out rather than imported, so this file stays leaf. */
type PluralLocale = 'ar' | 'en';

export type PluralForms = {
  one: string;
  two: string;
  few: string;
  many: string;
  other: string;
};

/**
 * The CLDR plural category of `n`, per language.
 *
 * Arabic's `zero` category is deliberately absent: all three counted strings
 * here are guarded by their caller against n = 0 — `coursesOf` renders only
 * when `station.hasCourses`, `nextCertificateBody` only when courses remain,
 * `remainingLevels` only when `remaining > 0`. A zero form would be dead text
 * in two languages, so 0 falls through to `other` rather than being invented.
 */
function category(n: number, lang: PluralLocale): keyof PluralForms {
  const abs = Math.abs(Math.trunc(n));
  if (lang === 'en') return abs === 1 ? 'one' : 'other';

  if (abs === 1) return 'one';
  if (abs === 2) return 'two';
  const mod = abs % 100;
  if (mod >= 3 && mod <= 10) return 'few';
  if (mod >= 11 && mod <= 99) return 'many';
  return 'other';
}

/** The form of `forms` that agrees with `n` in `lang`. Fill its {placeholders} after. */
export function plural(forms: PluralForms, n: number, lang: PluralLocale): string {
  return forms[category(n, lang)];
}

export type LmsStrings = {
  title: string;
  lede: string;
  youAreHere: string;
  overallLabel: string;
  ringLabel: string;
  ringValue: string;
  percentValue: string;
  stationOrientation: string;
  stationLevel: string;
  stationList: string;
  stateComplete: string;
  stateCurrent: string;
  stateOpen: string;
  stateLocked: string;
  lockedUntil: string;
  /** Counted by {total}. Fill {done} and {total} after `plural()` picks a form. */
  coursesOf: PluralForms;
  notStartedYet: string;
  nothingSetYet: string;
  openStation: string;
  skillsTitle: string;
  skillsLede: string;
  skillNone: string;
  skillEmerging: string;
  skillWorking: string;
  skillStrong: string;
  skillValue: string;
  nextCertificateTitle: string;
  /** Counted by {n}, the number of courses still owed. */
  nextCertificateBody: PluralForms;
  nextCertificateReady: string;
  nextCertificateNone: string;
  badgesTitle: string;
  badgesLede: string;
  badgeEarned: string;
  badgeEarnedOn: string;
  badgeLocked: string;
  /** Counted by {n}, the number of levels still to come. */
  remainingLevels: PluralForms;
  celebrationTitle: string;
  celebrationBody: string;
  celebrationDismiss: string;
  celebrationViewCertificate: string;
  certValid: string;
  certRevoked: string;
  certRevokedOn: string;
  certRevokedReason: string;
  breadcrumb: string;
};

export const lmsAr: LmsStrings = {
  title: 'خريطة المسار',
  lede: 'محطّاتك من التوجيه حتى التخرّج، وما ينقصك للوصول إلى كلٍّ منها.',
  youAreHere: 'أنت هنا',
  overallLabel: 'تقدّمك الإجمالي',
  ringLabel: 'نسبة الإنجاز',
  ringValue: '{done} من {total}',
  percentValue: '{n}٪',
  stationOrientation: 'محطّة التوجيه',
  stationLevel: 'المستوى {n}',
  stationList: 'محطّات المسار',
  stateComplete: 'مكتمل',
  stateCurrent: 'جارٍ الآن',
  stateOpen: 'متاح',
  stateLocked: 'مقفل',
  lockedUntil: 'يُفتح بعد {what}',
  // دورة is feminine and takes the dual دورتين; 3-10 take the plural دورات;
  // 11 and above return to the singular دورة. "١ دورات" is not a stylistic
  // preference in Arabic, it is a grammatical error.
  coursesOf: {
    one: '{done} من دورة واحدة',
    two: '{done} من دورتين',
    few: '{done} من {total} دورات',
    many: '{done} من {total} دورة',
    other: '{done} من {total} دورة',
  },
  notStartedYet: 'لم تبدأ بعد',
  nothingSetYet: 'لم تُحدَّد بعد',
  openStation: 'افتح المحطّة',
  skillsTitle: 'خريطة المهارات',
  skillsLede: 'ما بنيته حتى الآن في كل مجال، محسوبًا من الدورات التي اجتزتها.',
  skillNone: 'لم يبدأ',
  skillEmerging: 'في البداية',
  skillWorking: 'جيّد',
  skillStrong: 'متمكّن',
  skillValue: '{done} من {total}',
  nextCertificateTitle: 'الشهادة القادمة',
  nextCertificateBody: {
    one: 'تبقّت دورة واحدة لنيل شهادة {title}.',
    two: 'تبقّت دورتان لنيل شهادة {title}.',
    few: 'تبقّت {n} دورات لنيل شهادة {title}.',
    many: 'تبقّت {n} دورة لنيل شهادة {title}.',
    other: 'تبقّت {n} دورة لنيل شهادة {title}.',
  },
  nextCertificateReady: 'أتممت متطلّبات هذه الشهادة.',
  nextCertificateNone: 'أتممت كل شهادات المسار.',
  badgesTitle: 'أوسمة المستويات',
  badgesLede: 'وسام لكل مستوى تُتمّه.',
  badgeEarned: 'نلته',
  badgeEarnedOn: 'نلته في {date}',
  badgeLocked: 'لم يُنل بعد',
  // مستوى is masculine: the dual is مستويان, 3-10 take مستويات, 11+ مستوى.
  remainingLevels: {
    one: 'يتبقّى مستوى واحد',
    two: 'يتبقّى مستويان',
    few: 'يتبقّى {n} مستويات',
    many: 'يتبقّى {n} مستوى',
    other: 'يتبقّى {n} مستوى',
  },
  celebrationTitle: 'مبارك! أتممت {title}',
  celebrationBody: 'وسام {badge} أصبح لك، وشهادة المستوى في سجلّك.',
  celebrationDismiss: 'إغلاق',
  celebrationViewCertificate: 'عرض الشهادة',
  certValid: 'سارية',
  certRevoked: 'مسحوبة',
  certRevokedOn: 'سُحبت في {date}',
  certRevokedReason: 'السبب: {reason}',
  breadcrumb: 'مسار التنقّل',
};

export const lmsEn: LmsStrings = {
  title: 'Your path map',
  lede: 'Your stations from orientation to graduation, and what is left before each one.',
  youAreHere: 'You are here',
  overallLabel: 'Overall progress',
  ringLabel: 'Completion',
  ringValue: '{done} of {total}',
  percentValue: '{n}%',
  stationOrientation: 'Orientation station',
  stationLevel: 'Level {n}',
  stationList: 'Path stations',
  stateComplete: 'Complete',
  stateCurrent: 'In progress',
  stateOpen: 'Open',
  stateLocked: 'Locked',
  lockedUntil: 'Opens after {what}',
  // English inflects twice, not five times, so `two`, `few`, `many` and
  // `other` are the same sentence. They are written out rather than shared by
  // reference so that the two locales hold identical key sets, which is what
  // the probe checks and what stops a form going missing in one language.
  // `one` spells the count out rather than carrying {total}, because "1" is
  // the only value that can reach it.
  coursesOf: {
    one: '{done} of 1 course',
    two: '{done} of 2 courses',
    few: '{done} of {total} courses',
    many: '{done} of {total} courses',
    other: '{done} of {total} courses',
  },
  notStartedYet: 'Not started yet',
  nothingSetYet: 'Not set yet',
  openStation: 'Open station',
  skillsTitle: 'Skill map',
  skillsLede: 'What you have built in each area so far, counted from the courses you have passed.',
  skillNone: 'Not started',
  skillEmerging: 'Emerging',
  skillWorking: 'Working',
  skillStrong: 'Strong',
  skillValue: '{done} of {total}',
  nextCertificateTitle: 'Next certificate',
  nextCertificateBody: {
    one: 'One course left to earn the {title} certificate.',
    two: 'Two courses left to earn the {title} certificate.',
    few: '{n} courses left to earn the {title} certificate.',
    many: '{n} courses left to earn the {title} certificate.',
    other: '{n} courses left to earn the {title} certificate.',
  },
  nextCertificateReady: 'You have completed everything this certificate needs.',
  nextCertificateNone: 'You have earned every certificate on the path.',
  badgesTitle: 'Level badges',
  badgesLede: 'One badge for each level you complete.',
  badgeEarned: 'Earned',
  badgeEarnedOn: 'Earned on {date}',
  badgeLocked: 'Not earned yet',
  remainingLevels: {
    one: 'One level to go',
    two: 'Two levels to go',
    few: '{n} levels to go',
    many: '{n} levels to go',
    other: '{n} levels to go',
  },
  celebrationTitle: 'Congratulations — you completed {title}',
  celebrationBody: 'The {badge} badge is yours, and the level certificate is in your record.',
  celebrationDismiss: 'Dismiss',
  celebrationViewCertificate: 'View certificate',
  certValid: 'Valid',
  certRevoked: 'Revoked',
  certRevokedOn: 'Revoked on {date}',
  certRevokedReason: 'Reason: {reason}',
  breadcrumb: 'Breadcrumb',
};
