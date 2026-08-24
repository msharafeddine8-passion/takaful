/**
 * Every string on the «صنّاع الاستمرارية» page, in one file.
 *
 * Deliberately NOT spliced into types.ts / ar.ts / en.ts. Those three are
 * edited in lockstep and several people are in them at once; adding a
 * namespace by hand-editing all three is how a merge eats a translation. The
 * page imports `continuityStrings(lang)` from here directly, so this feature
 * carries its own words and collides with nobody. If the dictionary is ever
 * consolidated the splice is three one-line edits, exactly as lms.ts does it:
 *
 *   types.ts   continuity: ContinuityStrings;   (plus the import)
 *   ar.ts      continuity: continuityAr,
 *   en.ts      continuity: continuityEn,
 *
 * Placeholders are filled with String.replace — `{n}` — which is the
 * convention the rest of the dictionary already uses. There is no ICU here.
 *
 * COUNTS. No string below puts a bare number in front of a noun, because
 * Arabic inflects a counted noun five ways and a template with a hole in it
 * cannot be grammatical for every number. «الظاهرون هنا: ٣» is correct for
 * every value of n; «٣ متطوّعين» is correct for a handful of them. Where a
 * figure has to be labelled, the label comes first and the number stands
 * alone after a colon.
 *
 * Two rules this file keeps, both asserted by scripts/probe-continuity:
 *   - the two objects hold exactly the same keys, and none is empty;
 *   - no key holds the same literal in both languages.
 */

import type { Locale } from '@/lib/i18n';

export type ContinuityStrings = {
  kicker: string;
  title: string;
  lede: string;
  /** The page saying out loud that it is not a league table. */
  notRanked: string;

  /** Controls. A GET form, so all of this works with no JavaScript at all. */
  sortLabel: string;
  sortLongest: string;
  sortHours: string;
  sortName: string;
  yearLabel: string;
  yearAll: string;
  stageLabel: string;
  stageAll: string;
  apply: string;
  clear: string;

  /** «الظاهرون هنا: {n}» — label first, so the number never inflects a noun. */
  showing: string;
  noMatch: string;
  emptyTitle: string;
  emptyBody: string;
  unavailable: string;

  /** Card labels. */
  since: string;
  memberNumber: string;
  stage: string;
  hours: string;
  activities: string;
  certificates: string;
  badges: string;
  /** Somebody listed who has not agreed to be named. */
  unnamed: string;

  privacyNote: string;
};

export const continuityAr: ContinuityStrings = {
  kicker: 'كلمة شكر',
  title: 'صنّاع الاستمرارية',
  lede:
    'انتسبوا إلى الجمعية في أو قبل نهاية عام ٢٠٢٣، وما زالوا معنا. ' +
    'ما بقي من عمل الجمعية قائماً اليوم قام على استمرارهم، وهذه الصفحة شكرٌ لهم.',
  notRanked:
    'لا مفاضلة هنا ولا مراتب ولا أرقام. ترتيب الأسماء وسيلة للقراءة فقط، ' +
    'ووجود اسم قبل آخر لا يعني شيئاً.',

  sortLabel: 'طريقة العرض',
  sortLongest: 'الأقدم انتساباً',
  sortHours: 'الأكثر ساعات موثّقة',
  sortName: 'بحسب الحروف',
  yearLabel: 'سنة الانتساب',
  yearAll: 'كل السنوات',
  stageLabel: 'المرحلة',
  stageAll: 'كل المراحل',
  apply: 'اعرض',
  clear: 'إزالة التصفية',

  showing: 'الظاهرون هنا: {n}',
  noMatch: 'لا أحد ضمن هذه التصفية.',
  emptyTitle: 'لم يظهر أحد بعد',
  emptyBody:
    'لا يُنشر اسم أي متطوّع على هذه الصفحة قبل موافقته الصريحة على ذلك. ' +
    'الصفحة جاهزة، وتبدأ الأسماء بالظهور فور وصول الموافقات.',
  unavailable: 'تعذّر عرض هذه الصفحة الآن. جرّب بعد قليل.',

  since: 'مع الجمعية منذ',
  memberNumber: 'رقم العضوية',
  stage: 'المرحلة الحالية',
  hours: 'ساعات موثّقة',
  activities: 'أنشطة حضرها',
  certificates: 'شهادات فعّالة',
  badges: 'شارات',
  unnamed: 'متطوّع في الجمعية',

  privacyNote:
    'يظهر هنا من وافق على نشر بياناته وحده. غياب اسم عن هذه الصفحة لا يقول شيئاً ' +
    'عن صاحبه ولا عن عطائه.',
};

export const continuityEn: ContinuityStrings = {
  kicker: 'A note of thanks',
  title: 'Makers of continuity',
  lede:
    'They joined the association on or before the end of 2023 and they are still here. ' +
    'Whatever of this work is still standing today stands on their staying, and this page is our thanks.',
  notRanked:
    'Nothing here is ranked. There are no places and no numbers. The ordering is a way to ' +
    'read the page, and one name coming before another means nothing at all.',

  sortLabel: 'Show them',
  sortLongest: 'Longest with the association',
  sortHours: 'Most verified hours',
  sortName: 'By name',
  yearLabel: 'Year they joined',
  yearAll: 'Every year',
  stageLabel: 'Stage',
  stageAll: 'Every stage',
  apply: 'Show',
  clear: 'Clear filters',

  showing: 'Shown here: {n}',
  noMatch: 'Nobody matches this filter.',
  emptyTitle: 'Nobody is shown yet',
  emptyBody:
    'No volunteer is named on this page without having agreed to it first. ' +
    'The page is ready, and people will appear here as their consent arrives.',
  unavailable: 'This page cannot be shown right now. Please try again shortly.',

  since: 'With the association since',
  memberNumber: 'Membership number',
  stage: 'Current stage',
  hours: 'Verified hours',
  activities: 'Activities attended',
  certificates: 'Valid certificates',
  badges: 'Badges',
  unnamed: 'A volunteer of the association',

  privacyNote:
    'Only people who agreed to have their details published appear here. A name that is ' +
    'absent from this page says nothing about that person, or about what they gave.',
};

export function continuityStrings(lang: Locale): ContinuityStrings {
  return lang === 'ar' ? continuityAr : continuityEn;
}
