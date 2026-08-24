/**
 * Every string group challenges introduce, in one file.
 *
 * The dictionary proper is three large files edited in lockstep - types.ts
 * declares the shape, ar.ts and en.ts fill it - and adding a namespace by
 * hand-editing all three at once is how two people working in parallel
 * collide. So this namespace owns its strings here and the pages import it
 * directly. Splicing it into the main dictionary later is three one-line
 * edits, exactly as lms.ts describes:
 *
 *   types.ts   challenges: ChallengeStrings;   (inside Account, plus the import)
 *   ar.ts      challenges: challengesAr,
 *   en.ts      challenges: challengesEn,
 *
 * Placeholders are filled with String.replace - {n}, {target}, {days} - which
 * is the convention the rest of the dictionary uses. There is no ICU here.
 *
 * WHAT THE ARABIC HAD TO GET RIGHT
 *
 * Counted nouns. Arabic inflects after a number in five bands and English in
 * two, so «2 ساعات» and «3 ساعة» are both wrong. The counted strings are
 * `PluralForms` and the caller asks `challengePlural(forms, n, lang)`, the
 * same shape lms.ts settled on.
 *
 * And the tone. Nothing here congratulates an individual and nothing here
 * addresses somebody who has contributed nothing - there is deliberately no
 * "you contributed 0" string to render, and no empty state that says a person
 * is missing from the effort. The community line is «أنجزنا» - what *we* did.
 */

/** 'ar' | 'en', spelled out rather than imported, so this file stays a leaf. */
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
 * Arabic's `zero` category is absent for the same reason it is absent from
 * lms.ts: every counted string here is guarded by its caller against n = 0.
 * A community total of nothing shows the goal and the days left, not a count.
 */
export function challengePlural(forms: PluralForms, n: number, lang: PluralLocale): string {
  const count = Math.abs(Math.floor(n));
  if (lang !== 'ar') return (count === 1 ? forms.one : forms.other).replace('{n}', String(count));
  const hundred = count % 100;
  const shape =
    count === 1 ? forms.one
      : count === 2 ? forms.two
        : hundred >= 3 && hundred <= 10 ? forms.few
          : hundred >= 11 && hundred <= 99 ? forms.many
            : forms.other;
  return shape.replace('{n}', String(count));
}

export type ChallengeStrings = {
  /** The account panel. */
  panelTitle: string;
  panelLede: string;
  /** Above the bar: what the community has done, of what it set out to do. */
  communityDone: string;
  ofTarget: string;
  /** Shown only to somebody who has contributed. Never rendered for zero. */
  yourPart: string;
  yourPartNote: string;
  /** When the goal is reached. Addressed to everybody, never to one person. */
  reached: string;
  notStarted: string;
  daysLeft: PluralForms;
  lastDay: string;
  /** Units, counted. */
  hours: PluralForms;
  attendances: PluralForms;
  certificates: PluralForms;
  activities: PluralForms;
  metrics: {
    verified_minutes: string;
    attendances: string;
    certificates: string;
    activities: string;
  };
  /** The staff area. */
  manageTitle: string;
  manageLede: string;
  newChallenge: string;
  fieldNameAr: string;
  fieldNameEn: string;
  fieldDescriptionAr: string;
  fieldDescriptionEn: string;
  fieldMetric: string;
  fieldTarget: string;
  fieldTargetHoursNote: string;
  fieldStartsOn: string;
  fieldEndsOn: string;
  thisMonth: string;
  create: string;
  archive: string;
  archiveReason: string;
  archiveNote: string;
  archivedOn: string;
  statuses: {
    running: string;
    upcoming: string;
    paused: string;
    ended: string;
    archived: string;
  };
  privacyNote: string;
  emptyStaff: string;
  errors: {
    required: string;
    targetInvalid: string;
    datesInvalid: string;
    duplicate: string;
    unavailable: string;
  };
};

export const challengesAr: ChallengeStrings = {
  panelTitle: 'تحدٍّ جماعي',
  panelLede: 'هدف نمشي إليه معاً، ويُحتسب من الساعات والحضور والشهادات المُوثَّقة.',
  communityDone: 'أنجزنا',
  ofTarget: 'من أصل {target}',
  yourPart: 'مساهمتك',
  yourPartNote: 'هذا السطر لك وحدك، ولا يظهر لأحد غيرك.',
  reached: 'بلغنا الهدف. شكراً لكل من شارك.',
  notStarted: 'يبدأ هذا التحدي قريباً.',
  daysLeft: {
    one: 'بقي يوم واحد',
    two: 'بقي يومان',
    few: 'بقيت {n} أيام',
    many: 'بقي {n} يوماً',
    other: 'بقي {n} يوم',
  },
  lastDay: 'اليوم آخر يوم.',
  hours: {
    one: 'ساعة واحدة',
    two: 'ساعتان',
    few: '{n} ساعات',
    many: '{n} ساعة',
    other: '{n} ساعة',
  },
  attendances: {
    one: 'حضور واحد',
    two: 'حضوران',
    few: '{n} حضورات',
    many: '{n} حضوراً',
    other: '{n} حضور',
  },
  certificates: {
    one: 'شهادة واحدة',
    two: 'شهادتان',
    few: '{n} شهادات',
    many: '{n} شهادة',
    other: '{n} شهادة',
  },
  activities: {
    one: 'نشاط واحد',
    two: 'نشاطان',
    few: '{n} أنشطة',
    many: '{n} نشاطاً',
    other: '{n} نشاط',
  },
  metrics: {
    verified_minutes: 'ساعات تطوّع مُوثَّقة',
    attendances: 'حضور مُثبَت في الأنشطة',
    certificates: 'شهادات دورات سارية',
    activities: 'أنشطة نُفِّذت',
  },
  manageTitle: 'التحدّيات الجماعية',
  manageLede:
    'أهداف تخصّ الجمعية كلها. تُحتسب من السجلات المُوثَّقة وحدها، ولا تُظهر مساهمة أي متطوّع لأحد سواه.',
  newChallenge: 'تحدٍّ جديد',
  fieldNameAr: 'الاسم بالعربية',
  fieldNameEn: 'الاسم بالإنكليزية',
  fieldDescriptionAr: 'الشرح بالعربية (اختياري)',
  fieldDescriptionEn: 'الشرح بالإنكليزية (اختياري)',
  fieldMetric: 'ما الذي يُحتسب',
  fieldTarget: 'الهدف',
  fieldTargetHoursNote: 'يُكتب بالساعات عند اختيار ساعات التطوّع، وبالعدد في ما عدا ذلك.',
  fieldStartsOn: 'من تاريخ',
  fieldEndsOn: 'إلى تاريخ',
  thisMonth: 'التواريخ مضبوطة على هذا الشهر بتوقيت بيروت. عدّلها إن أردت مدة أخرى.',
  create: 'أنشئ التحدي',
  archive: 'أرشفة',
  archiveReason: 'سبب الأرشفة',
  archiveNote: 'لا يُحذف تحدٍّ أبداً. الأرشفة تُخفيه عن المتطوّعين وتُبقي سجله.',
  archivedOn: 'أُرشِف في {date}',
  statuses: {
    running: 'جارٍ',
    upcoming: 'لم يبدأ بعد',
    paused: 'موقوف مؤقتاً',
    ended: 'انتهى',
    archived: 'مؤرشف',
  },
  privacyNote:
    'لا تُعرض هنا مساهمة أي متطوّع على حدة. المجموع للجمعية، وكل متطوّع يرى نصيبه في صفحته وحده.',
  emptyStaff: 'لا تحدّيات بعد.',
  errors: {
    required: 'الاسم بالعربية والإنكليزية مطلوبان.',
    targetInvalid: 'الهدف يجب أن يكون عدداً صحيحاً أكبر من صفر.',
    datesInvalid: 'تاريخ الانتهاء لا يسبق تاريخ البداية.',
    duplicate: 'هناك تحدٍّ مطابق قائم بالمدة نفسها.',
    unavailable: 'تعذّر الحفظ. حاول مرة أخرى.',
  },
};

export const challengesEn: ChallengeStrings = {
  panelTitle: 'A challenge we share',
  panelLede: 'One goal for the whole association, counted from verified hours, attendance and certificates.',
  communityDone: 'Together we have reached',
  ofTarget: 'of {target}',
  yourPart: 'Your part',
  yourPartNote: 'This line is yours alone — nobody else can see it.',
  reached: 'We reached the goal. Thank you to everyone who took part.',
  notStarted: 'This challenge opens soon.',
  daysLeft: {
    one: '1 day left',
    two: '{n} days left',
    few: '{n} days left',
    many: '{n} days left',
    other: '{n} days left',
  },
  lastDay: 'Today is the last day.',
  hours: {
    one: '1 hour',
    two: '{n} hours',
    few: '{n} hours',
    many: '{n} hours',
    other: '{n} hours',
  },
  attendances: {
    one: '1 attendance',
    two: '{n} attendances',
    few: '{n} attendances',
    many: '{n} attendances',
    other: '{n} attendances',
  },
  certificates: {
    one: '1 certificate',
    two: '{n} certificates',
    few: '{n} certificates',
    many: '{n} certificates',
    other: '{n} certificates',
  },
  activities: {
    one: '1 activity',
    two: '{n} activities',
    few: '{n} activities',
    many: '{n} activities',
    other: '{n} activities',
  },
  metrics: {
    verified_minutes: 'Verified volunteering hours',
    attendances: 'Confirmed attendance at activities',
    certificates: 'Active course certificates',
    activities: 'Activities run',
  },
  manageTitle: 'Group challenges',
  manageLede:
    'Goals for the whole association. Counted from verified records only, and no volunteer’s own share is ever shown to anybody else.',
  newChallenge: 'New challenge',
  fieldNameAr: 'Name in Arabic',
  fieldNameEn: 'Name in English',
  fieldDescriptionAr: 'Description in Arabic (optional)',
  fieldDescriptionEn: 'Description in English (optional)',
  fieldMetric: 'What it counts',
  fieldTarget: 'Target',
  fieldTargetHoursNote: 'Entered in hours for volunteering hours, and as a plain count otherwise.',
  fieldStartsOn: 'From',
  fieldEndsOn: 'To',
  thisMonth: 'The dates are set to this month in Beirut. Change them for a different window.',
  create: 'Create challenge',
  archive: 'Archive',
  archiveReason: 'Why it is being archived',
  archiveNote: 'A challenge is never deleted. Archiving hides it from volunteers and keeps its record.',
  archivedOn: 'Archived on {date}',
  statuses: {
    running: 'Running',
    upcoming: 'Not started',
    paused: 'Paused',
    ended: 'Ended',
    archived: 'Archived',
  },
  privacyNote:
    'No individual’s contribution is shown here. The total belongs to the association; each volunteer sees their own part on their own page.',
  emptyStaff: 'No challenges yet.',
  errors: {
    required: 'The Arabic and English names are both required.',
    targetInvalid: 'The target must be a whole number above zero.',
    datesInvalid: 'The end date cannot fall before the start date.',
    duplicate: 'An identical challenge already exists for the same window.',
    unavailable: 'That could not be saved. Please try again.',
  },
};

/** The counted-noun forms for a metric, so a caller does not switch on it. */
export function unitFormsFor(
  strings: ChallengeStrings,
  metric: 'verified_minutes' | 'attendances' | 'certificates' | 'activities',
): PluralForms {
  switch (metric) {
    case 'verified_minutes': return strings.hours;
    case 'attendances': return strings.attendances;
    case 'certificates': return strings.certificates;
    case 'activities': return strings.activities;
  }
}

export const challengeDictionaries: Record<PluralLocale, ChallengeStrings> = {
  ar: challengesAr,
  en: challengesEn,
};
