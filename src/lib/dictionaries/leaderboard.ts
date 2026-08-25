/**
 * Every string on the impact boards, in one file.
 *
 * Deliberately NOT spliced into types.ts / ar.ts / en.ts, for the reason
 * dictionaries/continuity.ts gives at length: those three are edited in
 * lockstep by several people at once, and adding a namespace by hand-editing
 * all three is how a merge eats a translation. The page imports
 * `leaderboardStrings(lang)` from here directly. If the dictionary is ever
 * consolidated the splice is three one-line edits.
 *
 * WORDING IS A SAFETY RULE ON THIS PAGE, not a matter of taste. A ranking read
 * by four hundred people who know each other can hurt somebody with one badly
 * chosen noun, so:
 *
 *   Nothing here names a bottom. There is no «الأخير», no «الأضعف», no
 *   «الأقل», and no string that could be filled with one — the shapes in
 *   lib/leaderboard.ts carry no count of the people on a board, so there is
 *   nothing to put after «من».
 *
 *   Nothing here describes movement. No «تراجعت», no «نزلت», no "you dropped".
 *   The module never sees a previous window, so a template for it would have
 *   nothing to fill it with, and one would eventually be filled anyway.
 *
 *   Absence from a board is stated as a limit of the board, never as a fact
 *   about the person. «اللوحة تقرأ ما وُثّق» — the board reads what was
 *   recorded — is the register the whole file keeps.
 *
 * COUNTS. A bare number in front of an Arabic noun is wrong for most values of
 * the number: «٢ نقاط» and «٣ نقطة» are both ungrammatical. So a figure that
 * has to be labelled puts the label first and the number after a colon — the
 * convention the rest of this dictionary already uses — and the one place a
 * number and a noun genuinely have to sit together, the distance to tenth
 * place, goes through `countPhrase` in lib/when.ts with all five Arabic forms
 * spelled out here.
 *
 * Placeholders are filled with String.replace — `{n}` — as everywhere else.
 * There is no ICU here.
 *
 * Two rules this file keeps, both asserted by scripts/probe-leaderboard:
 *   - the two objects hold exactly the same keys, at every depth, and no leaf
 *     is empty;
 *   - no leaf holds the same literal in both languages.
 */

import type { Locale } from '@/lib/i18n';
import type { BoardKind, WindowKind } from '@/lib/leaderboard';

/** The five forms `countPhrase` in lib/when.ts asks for. */
export type CountForms = {
  zero: string;
  one: string;
  two: string;
  few: string;
  many: string;
};

export type BoardStrings = {
  title: string;
  /** Who is on this board and what it measures. Read before the list. */
  note: string;
  /** The unit of the ranked figure, as a column heading. */
  figureLabel: string;
  /** The unit of the context figure, or an empty-free placeholder. */
  secondaryLabel: string;
};

export type LeaderboardStrings = {
  kicker: string;
  title: string;
  lede: string;

  /** The period control. A GET form, so it works with no JavaScript at all. */
  windowLabel: string;
  windows: Record<WindowKind, string>;
  apply: string;

  boards: Record<BoardKind, BoardStrings>;

  /** «المرتبة» — the rank, for screen readers and the column heading. */
  rankLabel: string;
  /** Marks the reader's own row in a list. */
  youLabel: string;
  /** Shown on every row of a shared rank. */
  equalLabel: string;

  /** «موقعك هذا الشهر: {n}» — one per period, so each reads as Arabic. */
  yourPosition: Record<WindowKind, string>;
  /** Label first, number after: grammatical for every value of {n}. */
  toTenth: string;
  /** Said of the reader when they share their rank with somebody. */
  youEqual: string;
  /** The reader has no position on this board in this period. */
  youNone: string;

  /** Nobody at all is on this board in this period. */
  boardEmpty: string;

  ties: string;
  privacyNote: string;
  /** Points at the profile page, where the listing choice is actually made. */
  visibilityHint: string;
  visibilityLink: string;

  unavailable: string;

  /** The unit each board's distance-to-tenth is counted in. */
  units: Record<BoardKind, CountForms>;
};

export const leaderboardAr: LeaderboardStrings = {
  kicker: 'تقدير',
  title: 'لوحات الأثر',
  lede:
    'خمس لوحات، كل واحدة تقرأ شيئاً واحداً وتقوله كما هو. تُبنى من الساعات الموثّقة ' +
    'والحضور المؤكَّد والشهادات الفعّالة، ولا تُبنى من شيء لم يُوثَّق.',

  windowLabel: 'المدة',
  windows: {
    week: 'هذا الأسبوع',
    month: 'هذا الشهر',
    quarter: 'آخر ثلاثة أشهر',
    year: 'هذه السنة',
    all: 'منذ البداية',
  },
  apply: 'اعرض',

  boards: {
    active: {
      title: 'الأكثر حضوراً في الميدان',
      note:
        'المرتبة بحسب الساعات الموثّقة الكاملة، والأنشطة مذكورة إلى جانبها ولا تدخل في ' +
        'الترتيب: الساعة والنشاط شيئان مختلفان، وجمعهما في رقم واحد يفترض صرفاً بينهما ' +
        'لم يتّفق عليه أحد.',
      figureLabel: 'ساعات موثّقة',
      secondaryLabel: 'أنشطة حضرها',
    },
    learning: {
      title: 'الأكثر تعلّماً',
      note: 'الشهادات الفعّالة التي صدرت ضمن المدة المختارة. الشهادة المسحوبة لا تُحتسب.',
      figureLabel: 'شهادات فعّالة',
      secondaryLabel: '—',
    },
    reliable: {
      title: 'الأوفى بالحضور',
      note:
        'نسبة الحضور إلى ما سُجِّل حضوره أو غيابه فعلياً، ولا تظهر هنا إلا لمن لديه عشرة ' +
        'تسجيلات فأكثر ضمن المدة: نسبةٌ محسوبة على تسجيل أو تسجيلين لا تقول شيئاً. ' +
        'الأنشطة التي ألغتها الجمعية أو انسحب منها المتطوّع مسبقاً خارج الحساب.',
      figureLabel: 'نسبة الحضور',
      secondaryLabel: '—',
    },
    rising: {
      title: 'وجوه جديدة',
      note: 'من انتسبوا خلال الأشهر الستة الأخيرة. اللوحة لهم وحدهم، لا يزاحمهم فيها أحد.',
      figureLabel: 'نقاط الأثر',
      secondaryLabel: '—',
    },
    overall: {
      title: 'الأثر الإجمالي',
      note:
        'نقاط الأثر: الرقم الوحيد الذي يجمع الساعات والحضور والشهادات معاً، لأنه الوحيد ' +
        'الذي يعلن سعر كل واحد منها مسبقاً.',
      figureLabel: 'نقاط الأثر',
      secondaryLabel: '—',
    },
  },

  rankLabel: 'المرتبة',
  youLabel: 'أنت',
  equalLabel: 'بالتساوي',

  yourPosition: {
    week: 'موقعك هذا الأسبوع: {n}',
    month: 'موقعك هذا الشهر: {n}',
    quarter: 'موقعك في آخر ثلاثة أشهر: {n}',
    year: 'موقعك هذه السنة: {n}',
    all: 'موقعك منذ البداية: {n}',
  },
  toTenth: 'ما يفصلك عن المركز العاشر: {n}',
  youEqual: 'تشاركك هذه المرتبة أسماء أخرى.',
  youNone:
    'لا موقع لك على هذه اللوحة ضمن هذه المدة. اللوحة تقرأ ما وُثّق في المدة المختارة ' +
    'وحدها، وهي لا تقول شيئاً عمّا قدّمته خارجها.',

  boardEmpty: 'لم يُوثَّق ما يكفي لبناء هذه اللوحة ضمن هذه المدة بعد.',

  ties:
    'الأرقام المتساوية تأخذ المرتبة نفسها. ترتيب الأسماء داخل المرتبة الواحدة أبجدي، ' +
    'وتقدُّم اسم على آخر فيها لا يعني شيئاً.',
  privacyNote:
    'تُعرض أعلى عشر مراتب فقط، ولا يظهر فيها إلا من وافق على نشر اسمه. ومن لم يوافق ' +
    'يرى موقعه هو وحده ولا يراه سواه. لا تعرض هذه الصفحة مركزاً أخيراً، ولا غياباً، ' +
    'ولا ساعات مرفوضة، ولا مقارنة بأسبوع مضى.',
  visibilityHint: 'اختيارك لما يُنشر عنك تغيّره متى شئت من',
  visibilityLink: 'صفحة حسابك',

  unavailable: 'تعذّر عرض هذه الصفحة الآن. جرّب بعد قليل.',

  units: {
    active: { zero: 'ساعة', one: 'ساعة', two: 'ساعتان', few: '{n} ساعات', many: '{n} ساعة' },
    learning: { zero: 'شهادة', one: 'شهادة', two: 'شهادتان', few: '{n} شهادات', many: '{n} شهادة' },
    reliable: {
      zero: 'نقطة مئوية',
      one: 'نقطة مئوية',
      two: 'نقطتان مئويتان',
      few: '{n} نقاط مئوية',
      many: '{n} نقطة مئوية',
    },
    rising: { zero: 'نقطة', one: 'نقطة', two: 'نقطتان', few: '{n} نقاط', many: '{n} نقطة' },
    overall: { zero: 'نقطة', one: 'نقطة', two: 'نقطتان', few: '{n} نقاط', many: '{n} نقطة' },
  },
};

export const leaderboardEn: LeaderboardStrings = {
  kicker: 'Recognition',
  title: 'Impact boards',
  lede:
    'Five boards, each reading one thing and saying it plainly. They are built from verified ' +
    'hours, confirmed attendance and valid certificates, and from nothing that was not recorded.',

  windowLabel: 'Period',
  windows: {
    week: 'This week',
    month: 'This month',
    quarter: 'The last three months',
    year: 'This year',
    all: 'All time',
  },
  apply: 'Show',

  boards: {
    active: {
      title: 'Most time in the field',
      note:
        'Ranked on whole verified hours. Activities are shown beside them and take no part in ' +
        'the ordering: an hour and an attendance are different things, and adding them together ' +
        'would fix an exchange rate between them that nobody agreed.',
      figureLabel: 'Verified hours',
      secondaryLabel: 'Activities attended',
    },
    learning: {
      title: 'Most learning',
      note: 'Certificates issued within the chosen period and not since withdrawn.',
      figureLabel: 'Valid certificates',
      secondaryLabel: '--',
    },
    reliable: {
      title: 'Most reliable',
      note:
        'Attendance measured against the registrations that were actually marked, and shown only ' +
        'for people with ten or more of them in the period: a rate out of one or two says nothing. ' +
        'Activities the association cancelled, and registrations withdrawn in advance, are left out.',
      figureLabel: 'Attendance rate',
      secondaryLabel: '--',
    },
    rising: {
      title: 'New faces',
      note: 'People who joined within the last six months. This board is theirs alone.',
      figureLabel: 'Impact points',
      secondaryLabel: '--',
    },
    overall: {
      title: 'Overall impact',
      note:
        'Impact points: the one figure that puts hours, attendance and certificates together, ' +
        'because it is the only one that says beforehand what each of them is worth.',
      figureLabel: 'Impact points',
      secondaryLabel: '--',
    },
  },

  rankLabel: 'Position',
  youLabel: 'You',
  equalLabel: 'Equal',

  yourPosition: {
    week: 'Your position this week: {n}',
    month: 'Your position this month: {n}',
    quarter: 'Your position over the last three months: {n}',
    year: 'Your position this year: {n}',
    all: 'Your position, all time: {n}',
  },
  toTenth: 'From tenth place: {n}',
  youEqual: 'Other people share this position with you.',
  youNone:
    'You have no position on this board in this period. The board reads what was recorded within ' +
    'the chosen dates, and it says nothing about what you gave outside them.',

  boardEmpty: 'Not enough has been recorded within this period to build this board yet.',

  ties:
    'Equal figures hold equal positions. Names within one position are in alphabetical order, and ' +
    'one coming before another there means nothing at all.',
  privacyNote:
    'Only the top ten positions are shown, and only people who agreed to have their name published ' +
    'appear in them. Anyone who did not agree still sees their own position, and nobody else does. ' +
    'This page shows no last place, no absences, no rejected hours and no comparison with last week.',
  visibilityHint: 'You can change what is published about you at any time from',
  visibilityLink: 'your account page',

  unavailable: 'This page cannot be shown right now. Please try again shortly.',

  units: {
    active: { zero: 'hours', one: 'one hour', two: 'two hours', few: '{n} hours', many: '{n} hours' },
    learning: {
      zero: 'certificates',
      one: 'one certificate',
      two: 'two certificates',
      few: '{n} certificates',
      many: '{n} certificates',
    },
    reliable: {
      zero: 'percentage points',
      one: 'one percentage point',
      two: 'two percentage points',
      few: '{n} percentage points',
      many: '{n} percentage points',
    },
    rising: { zero: 'points', one: 'one point', two: 'two points', few: '{n} points', many: '{n} points' },
    overall: {
      zero: 'points',
      one: 'one point',
      two: 'two points',
      few: '{n} points',
      many: '{n} points',
    },
  },
};

export function leaderboardStrings(lang: Locale): LeaderboardStrings {
  return lang === 'ar' ? leaderboardAr : leaderboardEn;
}
