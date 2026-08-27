/**
 * Every user-facing string the monthly awards introduce, in one file.
 *
 * The main dictionary is three large files edited in lockstep — types.ts
 * declares the shape, ar.ts and en.ts fill it — so a namespace added by
 * hand-editing all three is how two people working in parallel collide. This
 * owns its strings here, exactly as dictionaries/challenges.ts and
 * dictionaries/lms.ts do, and the pages import `awardDictionaries` directly.
 *
 * THREE STRINGS HERE ARE LOAD-BEARING RATHER THAN DECORATIVE
 *
 *   `nominatedNote` is shown above every shortlist, to staff. It says the list
 *   is an ordering and not a verdict. Without it, five names sorted by a
 *   number look exactly like a result, and the first coordinator in a hurry
 *   approves the top row — which is the leaderboard this whole feature was
 *   built to avoid.
 *
 *   `reasonPublished` sits on the reason field itself, not in a footnote. The
 *   reason is printed on a public page, and somebody writing "stronger month
 *   than the others on the list" needs to know that before they type it rather
 *   than after.
 *
 *   `oneNameNote` is on the public page. It explains why the page shows one
 *   name per award and no runners-up, so that the absence reads as a decision
 *   rather than as missing data somebody will later "fix".
 *
 * ARABIC MONTH NAMES are the Levantine set — كانون الثاني، شباط، آذار — and not
 * يناير/فبراير. That is what the association's own paperwork, its WhatsApp
 * groups and every notice on its wall use; the Gulf/Egyptian set would read as
 * a translation of the site rather than as the site speaking.
 *
 * PURE. No database, no clock, no React, so the probe reads these directly.
 */

import type { Locale } from '@/lib/i18n';
/* Relative, unlike the type-only import above, and deliberately: this one
 * survives into the compiled output, and the probes run under tsx from
 * scripts/ where the '@/' alias is a tsconfig convenience rather than
 * something the runtime resolves. A type import is erased and cannot break. */
import { AWARD_KINDS, isPeriod, parseAwardBadgeCode, type AwardKind } from '../awards';

export type AwardStrings = {
  // ------------------------------------------------------------ public page
  kicker: string;
  title: string;
  lede: string;
  /** Why there is one name per award and never a runner-up. */
  oneNameNote: string;
  currentTitle: string;
  archiveTitle: string;
  emptyTitle: string;
  emptyBody: string;
  unavailable: string;
  /** Label before the decider's written reason. */
  citation: string;
  privacyNote: string;

  // ------------------------------------------------------------- the awards
  names: Record<AwardKind, string>;
  /** One line saying what each award is for. Read by both pages. */
  meanings: Record<AwardKind, string>;

  // ------------------------------------------------------------- staff page
  manageTitle: string;
  manageLede: string;
  /** The rule, stated above every shortlist. */
  nominatedNote: string;
  periodLabel: string;
  periodApply: string;
  shortlistTitle: string;
  noCandidates: string;
  decided: string;
  decidedBy: string;
  approve: string;
  reasonLabel: string;
  reasonPublished: string;
  reasonTooShort: string;
  confirmHint: string;
  forbidden: string;

  // -------------------------------------------------------------- figures
  hours: string;
  attendances: string;
  activeMembers: string;
  perMember: string;
  points: string;

  // --------------------------------------------------------------- errors
  errors: Record<
    | 'unavailable'
    | 'needReason'
    | 'notEligible'
    | 'alreadyDecided'
    | 'notYourself'
    | 'unknownPeriod'
    | 'noSubject',
    string
  >;

  // --------------------------------------------------------------- badges
  /** The badge title, with {month} substituted. */
  badgeTitles: Record<AwardKind, string>;
  badgeDescriptions: Record<AwardKind, string>;

  /** Notification wording, sent to the winner on approval. */
  notifyTitle: Record<AwardKind, string>;
  notifyBody: string;
};

export const AWARD_ICONS: Record<AwardKind, string> = {
  volunteer_of_the_month: '🏅',
  rising_star: '🌟',
  continuity_maker: '🕊️',
  team_of_the_month: '🫱🏽‍🫲🏼',
};

export const awardsAr: AwardStrings = {
  kicker: 'تقدير',
  title: 'لوحة الشرف',
  lede:
    'في كل شهر تختار الجمعية من بين متطوّعيها من تتوقّف عندهم. الاختيار يقوم به أشخاص ' +
    'يعرفون الميدان، لا برنامج يحسب الأرقام.',
  oneNameNote:
    'اسم واحد لكل تقدير، ولا قائمة بمن لم يُختَر. الترشيح مرحلة داخلية تنتهي عند القرار، ' +
    'ولا يُحفظ منها شيء.',
  currentTitle: 'تقدير هذا الشهر',
  archiveTitle: 'الأشهر السابقة',
  emptyTitle: 'لم يُعلَن أي تقدير بعد',
  emptyBody:
    'ما إن تختار الجمعية أول تقدير شهري حتى يظهر هنا، مع سبب الاختيار كما كُتب.',
  unavailable: 'هذه الصفحة غير متاحة حالياً.',
  citation: 'سبب الاختيار',
  /* Was «إلا من وافق على إظهار اسمه». Migration 038 made appearing the default
     for anybody who had never answered, so the page can no longer say consent
     was given — only that the setting permits it. The safeguarding half of the
     sentence is untouched: it is an absolute rule and lib/visibility.ts
     enforces it after the choice, whatever the choice was. */
  privacyNote:
    'لا يظهر هنا إلا من يسمح إعداد الظهور في حسابه بذلك، ولا تُنشر أسماء القاصرين ' +
    'ولا صورهم مهما كان الخيار المسجَّل.',

  names: {
    volunteer_of_the_month: 'متطوّع الشهر',
    rising_star: 'النجم الصاعد',
    continuity_maker: 'صانع الاستمرارية لهذا الشهر',
    team_of_the_month: 'فريق الشهر',
  },
  meanings: {
    volunteer_of_the_month:
      'متطوّع مضى على انتسابه أكثر من ستة أشهر، وكان له في هذا الشهر عمل موثّق.',
    rising_star: 'متطوّع انتسب خلال الأشهر الستة الأخيرة، وبدأ فعلاً في الميدان.',
    continuity_maker:
      'من يحمل شارة «صانع الاستمرارية» وما زال حاضراً في الميدان هذا الشهر.',
    team_of_the_month:
      'لجنة تُرتَّب بمعدّل ما قدّمه كل عضو نشط فيها، لا بالمجموع — كي لا تفوز الأكبر عدداً دائماً.',
  },

  manageTitle: 'التقدير الشهري',
  manageLede:
    'يقترح النظام، ويقرّر الإنسان. ما تراه أدناه ترتيب لأسماء استوفت الشروط، وليس نتيجة.',
  nominatedNote:
    'هذه قائمة مرشّحين، لا ترتيب فائزين. الرقم يحدّد من تقرأ اسمه، ثم يتوقّف دوره. ' +
    'من لا يُختَر لا يُسجَّل في أي مكان.',
  periodLabel: 'الشهر',
  periodApply: 'اعرض',
  shortlistTitle: 'المرشّحون',
  noCandidates: 'لا أحد يستوفي الشروط في هذا الشهر.',
  decided: 'تقرّر',
  decidedBy: 'قرار',
  approve: 'اعتمد هذا الاختيار',
  reasonLabel: 'سبب الاختيار',
  reasonPublished: 'يُنشر هذا النص على لوحة الشرف كما تكتبه، ويصل إلى صاحب التقدير.',
  reasonTooShort: 'اكتب سبباً واضحاً، عشرة أحرف على الأقل.',
  confirmHint: 'تقدير الشهر يُعطى مرة واحدة ولا يُحذف بعدها.',
  forbidden: 'لا تملك صلاحية اعتماد التقدير الشهري.',

  hours: 'ساعات موثّقة',
  attendances: 'حضور مؤكّد',
  activeMembers: 'أعضاء نشطون',
  perMember: 'المعدّل لكل عضو نشط',
  points: 'نقاط الأثر',

  errors: {
    unavailable: 'الخدمة غير متاحة حالياً.',
    needReason: 'اكتب سبباً واضحاً، عشرة أحرف على الأقل.',
    notEligible: 'لم يعد هذا الاسم مستوفياً للشروط. أعد تحميل الصفحة.',
    alreadyDecided: 'تقدير هذا الشهر تقرّر بالفعل.',
    notYourself: 'لا يمنح أحد التقدير لنفسه.',
    unknownPeriod: 'الشهر غير صالح.',
    noSubject: 'اختر اسماً أو فريقاً.',
  },

  badgeTitles: {
    volunteer_of_the_month: 'متطوّع الشهر — {month}',
    rising_star: 'النجم الصاعد — {month}',
    continuity_maker: 'صانع الاستمرارية — {month}',
    team_of_the_month: 'فريق الشهر — {month}',
  },
  badgeDescriptions: {
    volunteer_of_the_month: 'اختارتك الجمعية متطوّع الشهر عن {month}.',
    rising_star: 'اختارتك الجمعية النجم الصاعد عن {month}.',
    continuity_maker: 'اختارتك الجمعية صانع الاستمرارية عن {month}.',
    team_of_the_month: 'كنت من أعضاء فريق الشهر عن {month}.',
  },

  notifyTitle: {
    volunteer_of_the_month: 'اخترناك متطوّع الشهر 🏅',
    rising_star: 'اخترناك النجم الصاعد 🌟',
    continuity_maker: 'اخترناك صانع الاستمرارية لهذا الشهر 🕊️',
    team_of_the_month: 'فريقك هو فريق الشهر 🫱🏽‍🫲🏼',
  },
  notifyBody: 'شكراً لما قدّمته. سبب الاختيار كما كُتب: ',
};

export const awardsEn: AwardStrings = {
  kicker: 'Recognition',
  title: 'Honours',
  lede:
    'Each month the association stops to name a few of its volunteers. The choosing is done ' +
    'by people who know the field, not by a program adding up numbers.',
  oneNameNote:
    'One name per award, and no list of anyone who was not chosen. The shortlist is an ' +
    'internal step that ends at the decision, and none of it is kept.',
  currentTitle: 'This month',
  archiveTitle: 'Previous months',
  emptyTitle: 'No award has been announced yet',
  emptyBody:
    'As soon as the association decides its first monthly award it appears here, together ' +
    'with the reason as it was written.',
  unavailable: 'This page is not available at the moment.',
  citation: 'Why them',
  privacyNote:
    'Only people whose visibility setting allows it appear here, and no minor is ever ' +
    'named or photographed whatever setting is stored.',

  names: {
    volunteer_of_the_month: 'Volunteer of the Month',
    rising_star: 'Rising Star',
    continuity_maker: 'Continuity Maker of the Month',
    team_of_the_month: 'Team of the Month',
  },
  meanings: {
    volunteer_of_the_month:
      'A volunteer of more than six months standing with verified work in the month.',
    rising_star: 'Someone who joined in the last six months and is already in the field.',
    continuity_maker:
      'A holder of the continuity badge who was still active this month.',
    team_of_the_month:
      'A committee, ranked by the average each active member gave rather than by the total — ' +
      'so the largest does not simply win every time.',
  },

  manageTitle: 'Monthly recognition',
  manageLede:
    'The system nominates, a person decides. What follows is an ordering of people who meet ' +
    'the criteria. It is not a result.',
  nominatedNote:
    'This is a shortlist, not a ranking of winners. The figure decides whose name you read, ' +
    'and then its job is done. Nobody who is not chosen is recorded anywhere.',
  periodLabel: 'Month',
  periodApply: 'Show',
  shortlistTitle: 'Shortlist',
  noCandidates: 'Nobody meets the criteria for this month.',
  decided: 'Decided',
  decidedBy: 'Decided by',
  approve: 'Approve this choice',
  reasonLabel: 'Why them',
  reasonPublished:
    'This text is published on the honours page exactly as you write it, and is sent to the ' +
    'person receiving the award.',
  reasonTooShort: 'Write a clear reason, at least ten characters.',
  confirmHint: 'A month is awarded once, and the record is never deleted.',
  forbidden: 'You do not have permission to decide the monthly awards.',

  hours: 'Verified hours',
  attendances: 'Confirmed attendances',
  activeMembers: 'Active members',
  perMember: 'Average per active member',
  points: 'Impact points',

  errors: {
    unavailable: 'The service is not available at the moment.',
    needReason: 'Write a clear reason, at least ten characters.',
    notEligible: 'This person no longer meets the criteria. Reload the page.',
    alreadyDecided: 'This month has already been decided.',
    notYourself: 'Nobody gives themselves an award.',
    unknownPeriod: 'That month is not valid.',
    noSubject: 'Choose a person or a team.',
  },

  badgeTitles: {
    volunteer_of_the_month: 'Volunteer of the Month — {month}',
    rising_star: 'Rising Star — {month}',
    continuity_maker: 'Continuity Maker — {month}',
    team_of_the_month: 'Team of the Month — {month}',
  },
  badgeDescriptions: {
    volunteer_of_the_month: 'Chosen by the association as Volunteer of the Month for {month}.',
    rising_star: 'Chosen by the association as Rising Star for {month}.',
    continuity_maker: 'Chosen by the association as Continuity Maker for {month}.',
    team_of_the_month: 'A member of the Team of the Month for {month}.',
  },

  notifyTitle: {
    volunteer_of_the_month: 'You are Volunteer of the Month 🏅',
    rising_star: 'You are the Rising Star 🌟',
    continuity_maker: 'You are Continuity Maker of the Month 🕊️',
    team_of_the_month: 'Your team is Team of the Month 🫱🏽‍🫲🏼',
  },
  notifyBody: 'Thank you for what you gave. The reason as it was written: ',
};

export const awardDictionaries: Record<Locale, AwardStrings> = { ar: awardsAr, en: awardsEn };

export function getAwards(lang: Locale): AwardStrings {
  return awardDictionaries[lang];
}

// ---------------------------------------------------------------- months

/**
 * The Levantine month names, in calendar order.
 *
 * Exported so the probe can check the count and so nothing else has to retype
 * them. English uses Intl-free literals for the same reason every other date
 * string in this codebase does: `new Date(period + '-01')` is midnight GMT,
 * which is the previous month for the two hours before Beirut midnight, and a
 * page that printed the wrong month name would be believed.
 */
export const MONTH_NAMES: Record<Locale, readonly string[]> = {
  ar: [
    'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
    'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

/**
 * 'YYYY-MM' as «آب 2026» / «August 2026».
 *
 * Built from the text, never from a Date. The year keeps Latin digits, as
 * every other figure in this codebase does — the association's paperwork, its
 * ID cards and its phone keypads use them, and a year is copied between the
 * site and paper more often than it is read aloud.
 */
export function formatPeriod(period: string, lang: Locale): string {
  if (!isPeriod(period)) return '—';
  const year = period.slice(0, 4);
  const month = MONTH_NAMES[lang][Number(period.slice(5, 7)) - 1];
  return `${month} ${year}`;
}

// ---------------------------------------------------------------- badges

/**
 * An award badge code as something a page can render.
 *
 * The shape deliberately matches the three fields the badge wall reads off an
 * `AchievementDef` — icon, title[lang], description[lang] — so the wall can
 * fall back to this for codes the catalogue does not own, without either file
 * learning about the other's internals.
 *
 * Returns null for anything that is not an award badge, which is every badge
 * the ACHIEVEMENTS catalogue does own. The caller asks the catalogue first.
 */
export type AwardBadgeView = {
  icon: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
};

export function awardBadgeFor(code: string): AwardBadgeView | null {
  const parsed = parseAwardBadgeCode(code);
  if (!parsed) return null;
  const { award, period } = parsed;
  const fill = (template: string, lang: Locale) =>
    template.replace('{month}', formatPeriod(period, lang));
  return {
    icon: AWARD_ICONS[award],
    title: {
      ar: fill(awardsAr.badgeTitles[award], 'ar'),
      en: fill(awardsEn.badgeTitles[award], 'en'),
    },
    description: {
      ar: fill(awardsAr.badgeDescriptions[award], 'ar'),
      en: fill(awardsEn.badgeDescriptions[award], 'en'),
    },
  };
}

/** Every award has a name, a meaning and an icon in both languages. */
export function awardsAreComplete(): boolean {
  return AWARD_KINDS.every(
    (k) =>
      awardsAr.names[k].trim() !== '' &&
      awardsEn.names[k].trim() !== '' &&
      awardsAr.meanings[k].trim() !== '' &&
      awardsEn.meanings[k].trim() !== '' &&
      AWARD_ICONS[k].trim() !== '',
  );
}
