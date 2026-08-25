/**
 * Every string the practice blocks put on a screen, in one file.
 *
 * The dictionary proper is three large files edited in lockstep — types.ts
 * declares the shape, ar.ts and en.ts fill it — and adding a namespace by
 * hand-editing all three at once is how two people working in parallel
 * collide. So this namespace owns its strings here and the components import
 * it directly, exactly as challenges.ts, awards.ts, lms.ts and practical.ts
 * already do.
 *
 * Placeholders are filled with String.replace — {n}, {total} — which is the
 * convention the rest of the dictionary uses. There is no ICU here.
 *
 * ── COUNTED NOUNS ──────────────────────────────────────────────────────────
 *
 * Four counts reach a screen: pairs left to make, pairs in the wrong place,
 * parts left to choose, and what a reader found and missed in a document.
 * Arabic inflects the counted noun in bands, so «2 أزواج» and «3 زوج» are both
 * wrong. Every count here is `CountForms` and the component passes it to
 * countPhrase() in lib/when.ts — bands zero / one / two / few (3–10) / many
 * (11+), and only the last two carry {n}, because «زوجان» does not want a
 * numeral in front of it.
 *
 * ── TONE ───────────────────────────────────────────────────────────────────
 *
 * None of this marks anything, and none of it may sound as though it does.
 * There is no score, no percentage, no pass and no fail — a reader who put
 * every pair in the wrong place is told «أعد المحاولة», and a reader who
 * missed the line that named a child is told what the line was. The verdict
 * strings say what happened to the document, not what happened to the reader.
 *
 * ── DIRECTION ──────────────────────────────────────────────────────────────
 *
 * No string here contains an arrow or any other glyph whose meaning depends on
 * which way the page runs. «التالي» with a ← beside it points the wrong way
 * the moment the same component renders in English, and a component cannot fix
 * that by mirroring a character it was handed as text. Where a direction is
 * genuinely needed the component uses a logical property; here there are only
 * words, plus ✓ and ✕, which mean the same thing in both scripts.
 */

/** 'ar' | 'en', spelled out rather than imported, so this file stays a leaf. */
type PracticeLocale = 'ar' | 'en';

/** The shape countPhrase() in lib/when.ts expects. Only few/many carry {n}. */
export type CountForms = {
  zero: string;
  one: string;
  two: string;
  few: string;
  many: string;
};

export type PracticeBlockStrings = {
  match: {
    kicker: string;
    /** The empty option in every row's menu. */
    choose: string;
    /** Labels the menu for a screen reader: "{left} — pair with". */
    pairWith: string;
    /** While rows are still empty. */
    left: CountForms;
    /** Once every row has an answer. */
    misplaced: CountForms;
    reset: string;
  };
  review: {
    kicker: string;
    flag: string;
    unflag: string;
    check: string;
    again: string;
    /** The four things that can have happened to a line. */
    caught: string;
    missed: string;
    falseAlarm: string;
    sound: string;
    found: CountForms;
    slipped: CountForms;
    overRead: CountForms;
    afterwordHeading: string;
  };
  dialogue: {
    kicker: string;
    /** Names the reader's own lines in the transcript. */
    you: string;
    /** The heading over the replies on offer. */
    yourReply: string;
    turn: string;
    closed: string;
    reached: string;
    best: string;
    restart: string;
    afterwordHeading: string;
  };
  build: {
    kicker: string;
    check: string;
    again: string;
    left: CountForms;
    right: string;
    wrong: string;
    /** The heading over the assembled result. */
    assembled: string;
    afterwordHeading: string;
  };
};

const ar: PracticeBlockStrings = {
  match: {
    kicker: 'صِل كل طرف بما يقابله',
    choose: 'اختر…',
    pairWith: '{left} — يقابله',
    left: {
      zero: 'اكتملت المطابقة',
      one: 'بقي زوج واحد',
      two: 'بقي زوجان',
      few: 'بقيت {n} أزواج',
      many: 'بقي {n} زوجاً',
    },
    misplaced: {
      zero: 'كل زوج في مكانه',
      one: 'زوج واحد في غير مكانه',
      two: 'زوجان في غير مكانهما',
      few: '{n} أزواج في غير مكانها',
      many: '{n} زوجاً في غير مكانه',
    },
    reset: 'ابدأ من جديد',
  },
  review: {
    kicker: 'راجع هذه الوثيقة',
    flag: 'علّم هذا السطر',
    unflag: 'أزل التعليم',
    check: 'أظهر ما فات',
    again: 'راجعها من جديد',
    caught: 'أصبت — هذا السطر لا يمرّ',
    missed: 'فاتك هذا السطر',
    falseAlarm: 'هذا السطر سليم كما هو',
    sound: 'سليم',
    found: {
      zero: 'لم تجد أيّاً من المشاكل',
      one: 'وجدت مشكلة واحدة',
      two: 'وجدت مشكلتين',
      few: 'وجدت {n} مشاكل',
      many: 'وجدت {n} مشكلة',
    },
    slipped: {
      zero: 'ولم يفتك شيء',
      one: 'وفاتتك واحدة',
      two: 'وفاتتك اثنتان',
      few: 'وفاتتك {n}',
      many: 'وفاتتك {n}',
    },
    overRead: {
      zero: 'ولم تعلّم سطراً سليماً',
      one: 'وعلّمت سطراً سليماً واحداً',
      two: 'وعلّمت سطرين سليمين',
      few: 'وعلّمت {n} أسطر سليمة',
      many: 'وعلّمت {n} سطراً سليماً',
    },
    afterwordHeading: 'ما تعلّمه هذه الوثيقة',
  },
  dialogue: {
    kicker: 'محادثة',
    you: 'أنت',
    yourReply: 'بماذا تردّ؟',
    turn: 'الدور {n} من {total}',
    closed: 'أُغلق الحديث هنا. لم يعد أمامك ما تقوله.',
    reached: 'وصلت إلى آخر المحادثة.',
    best: 'هذا ما تختاره الجمعية',
    restart: 'ابدأ المحادثة من جديد',
    afterwordHeading: 'ما الذي صنع الفرق',
  },
  build: {
    kicker: 'ركّب العبارة من أجزائها',
    check: 'تحقّق',
    again: 'ابدأ من جديد',
    left: {
      zero: 'اكتملت الأجزاء',
      one: 'بقي جزء واحد',
      two: 'بقي جزءان',
      few: 'بقيت {n} أجزاء',
      many: 'بقي {n} جزءاً',
    },
    right: 'هذا الجزء صحيح',
    wrong: 'هذا الجزء ينقصه شيء',
    assembled: 'ما ركّبته',
    afterwordHeading: 'لماذا هذه الصيغة',
  },
};

const en: PracticeBlockStrings = {
  match: {
    kicker: 'Pair each one with what it goes with',
    choose: 'Choose…',
    pairWith: '{left} — pair with',
    left: {
      zero: 'Every pair made',
      one: 'One pair left',
      two: 'Two pairs left',
      few: '{n} pairs left',
      many: '{n} pairs left',
    },
    misplaced: {
      zero: 'Every pair is in its place',
      one: 'One pair is in the wrong place',
      two: 'Two pairs are in the wrong place',
      few: '{n} pairs are in the wrong place',
      many: '{n} pairs are in the wrong place',
    },
    reset: 'Start over',
  },
  review: {
    kicker: 'Review this document',
    flag: 'Flag this line',
    unflag: 'Remove the flag',
    check: 'Show what was missed',
    again: 'Review it again',
    caught: 'Right — this line does not pass',
    missed: 'You missed this line',
    falseAlarm: 'This line is sound as written',
    sound: 'Sound',
    found: {
      zero: 'You found none of the problems',
      one: 'You found one problem',
      two: 'You found two problems',
      few: 'You found {n} problems',
      many: 'You found {n} problems',
    },
    slipped: {
      zero: 'missed nothing',
      one: 'missed one',
      two: 'missed two',
      few: 'missed {n}',
      many: 'missed {n}',
    },
    overRead: {
      zero: 'flagged no sound lines',
      one: 'flagged one sound line',
      two: 'flagged two sound lines',
      few: 'flagged {n} sound lines',
      many: 'flagged {n} sound lines',
    },
    afterwordHeading: 'What this document teaches',
  },
  dialogue: {
    kicker: 'Conversation',
    you: 'You',
    yourReply: 'What do you say?',
    turn: 'Turn {n} of {total}',
    closed: 'The conversation closed here. There is nothing left for you to say.',
    reached: 'You reached the end of the conversation.',
    best: 'This is what the association would say',
    restart: 'Start the conversation again',
    afterwordHeading: 'What made the difference',
  },
  build: {
    kicker: 'Build the line out of its parts',
    check: 'Check',
    again: 'Start over',
    left: {
      zero: 'Every part chosen',
      one: 'One part left',
      two: 'Two parts left',
      few: '{n} parts left',
      many: '{n} parts left',
    },
    right: 'This part is right',
    wrong: 'This part is missing something',
    assembled: 'What you built',
    afterwordHeading: 'Why it is written this way',
  },
};

export const practiceBlockStrings: Record<PracticeLocale, PracticeBlockStrings> = { ar, en };
