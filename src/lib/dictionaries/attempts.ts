/**
 * Every string the attempt record introduces, in one file.
 *
 * The dictionary proper is three large files edited in lockstep — types.ts
 * declares the shape, ar.ts and en.ts fill it — and adding a namespace by
 * hand-editing all three at once is how two people working in parallel
 * collide. So this namespace owns its strings here and the pages import it
 * directly, exactly as practical.ts, challenges.ts, awards.ts and lms.ts
 * already do. Splicing it into the main dictionary later is three one-line
 * edits:
 *
 *   types.ts   attempts: AttemptStrings;   (inside Account, plus the import)
 *   ar.ts      attempts: attemptsAr,
 *   en.ts      attempts: attemptsEn,
 *
 * Placeholders are filled with String.replace — {n}, {total} — which is the
 * convention the rest of the dictionary uses. There is no ICU here.
 *
 * ── COUNTED NOUNS ──────────────────────────────────────────────────────────
 *
 * One count reaches a screen: how many times somebody has sat a paper.
 * Arabic inflects the counted noun in bands and English in two, so «2 محاولات»
 * and «3 محاولة» are both wrong. `sittings` is `CountForms` and the caller
 * passes it to countPhrase() from lib/when.ts — the helper this codebase
 * already uses for hours, activities, badges, certificates and practical
 * submissions. Its bands are zero / one / two / few (3–10) / many (11+), and
 * only the last two carry {n}, because «محاولتان» does not want a numeral in
 * front of it.
 *
 * ── TONE, WHICH IS THE WHOLE POINT OF THIS FILE ────────────────────────────
 *
 * A record of somebody's own scores is one careless sentence away from being a
 * league table with one entrant. This platform has refused to build league
 * tables between people — migrations 034 and 041 say so at length — and the
 * same reasoning holds pointed inward. So:
 *
 *   · There is no string for a trend, a direction, a difference between two
 *     scores, a personal record, or a streak. `bestScore` and `lastScore` are
 *     two facts and are never joined by a third string comparing them.
 *   · A sitting below the pass mark is «دون درجة النجاح» — where the mark
 *     stood and where the score fell. It is not «رسبت», it is not coloured as
 *     an error, and it is not given more room than any other row. A volunteer
 *     who sat the paper twice took a step, not a fall.
 *   · Nothing here calls an attempt an obstacle to a credential, because for a
 *     level's paper that is now false — see `noteRevision`.
 */

/** 'ar' | 'en', spelled out rather than imported, so this file stays a leaf. */
type AttemptLocale = 'ar' | 'en';

/** The shape countPhrase() in lib/when.ts expects. Only few/many carry {n}. */
export type CountForms = {
  zero: string;
  one: string;
  two: string;
  few: string;
  many: string;
};

export type AttemptStrings = {
  // ---- the panel
  heading: string;
  lede: string;
  empty: string;

  // ---- the two facts section 28 asks for, and nothing joining them
  bestScore: string;
  lastScore: string;
  sittings: CountForms;

  // ---- one row
  sittingLabel: string;
  scoreLabel: string;
  passMarkLabel: string;
  answeredOf: string;

  /*
   * What became of one sitting. Three states, worded as three facts.
   *
   * `belowMark` deliberately names the mark rather than the person: the score
   * fell below a number, which is a thing that happened, rather than the
   * learner having failed, which is a thing they would be.
   */
  reachedMark: string;
  belowMark: string;
  notFinished: string;

  /*
   * Rows that are not sittings at all, and must not be rendered as though
   * they were. See the `source` note on AttemptSummary in lib/academy.ts.
   */
  recognisedRow: string;
  migratedRow: string;

  // ---- what an attempt means, which differs by the kind of paper
  notePaper: string;
  noteRevision: string;
  kept: string;
};

export const attemptsAr: AttemptStrings = {
  heading: 'سجلّ محاولاتك',
  /*
   * «الاختبار» and «مسار القرار», not «الورقة» and not «الجولة».
   *
   * The vocabulary is the one the rest of the dictionary already uses —
   * ar.ts calls the assessment «الاختبار النهائي» and challenge-levels.ts
   * calls the decision run «مسار القرار». «الورقة» in this codebase means a
   * printed sheet: the passport, an A4 print, a supervisor's attendance
   * sheet. Borrowing the English "paper" for an exam here would read as a
   * translation, which is exactly what this platform's Arabic is not.
   */
  lede: 'كلّ مرّة تقدّمت فيها إلى اختبار هذه الدورة، بتاريخها ونتيجتها، من الأحدث إلى الأقدم.',
  empty: 'لم تتقدّم إلى هذا الاختبار بعد.',

  bestScore: 'أفضل نتيجة',
  lastScore: 'آخر نتيجة',
  sittings: {
    zero: 'لا محاولات',
    one: 'محاولة واحدة',
    two: 'محاولتان',
    few: '{n} محاولات',
    many: '{n} محاولة',
  },

  sittingLabel: 'المحاولة {n}',
  scoreLabel: 'النتيجة',
  passMarkLabel: 'درجة النجاح',
  /* The label goes in front of the numbers, so neither of them has to inflect
     a counted noun. The same fix is in ar.ts:answeredOf and in CourseFinish. */
  answeredOf: 'الأسئلة المُجاب عنها: {n} من {total}',

  reachedMark: 'بلغت درجة النجاح',
  belowMark: 'دون درجة النجاح',
  notFinished: 'لم تُنهَ بعد',

  recognisedRow: 'اعتماد تعلّم سابق — لم يجرِ اختبار هنا.',
  migratedRow:
    'محاولة قديمة، سُجّلت قبل أن يحفظ الموقع تفاصيل الاختبارات. النتيجة كلّ ما بقي منها.',

  notePaper: 'اجتياز هذا الاختبار جزء من إتمام الدورة، ولا حدّ لعدد المحاولات.',
  /*
   * The level's paper, after the reversal of 2026-08-26.
   *
   * gate.ts:levelClosed no longer reads this paper at all: a level closes on
   * its courses and on a finished decision run, and finishing the run is what
   * counts rather than what the run concludes. Copy telling a volunteer that
   * this paper stands between them and their certificate would now be false,
   * and it would send them back to revise for a gate that was removed.
   */
  noteRevision:
    'هذا الاختبار للمراجعة. لم يعد المستوى يُغلَق به: يُغلَق بإنهاء مسار القرار في آخره، مهما كانت خلاصته. فما هنا تمرين على المادّة، لا حاجز بينك وبين شهادتك.',
  kept: 'تبقى كلّ محاولة هنا كما جرت. لا يُحذف منها شيء، ولا تُقارَن واحدة بأخرى.',
};

export const attemptsEn: AttemptStrings = {
  heading: 'Your attempts',
  /* "Assessment", because en.ts already calls it the "Final assessment" and
     challenge-levels.ts already calls the other thing the "decision run". */
  lede: "Every time you sat this course's assessment, with the date and the score, newest first.",
  empty: 'You have not sat this assessment yet.',

  bestScore: 'Best score',
  lastScore: 'Most recent score',
  sittings: {
    zero: 'No attempts',
    one: 'One attempt',
    two: '2 attempts',
    few: '{n} attempts',
    many: '{n} attempts',
  },

  sittingLabel: 'Attempt {n}',
  scoreLabel: 'Score',
  passMarkLabel: 'Pass mark',
  answeredOf: 'Questions answered: {n} of {total}',

  reachedMark: 'Reached the pass mark',
  belowMark: 'Below the pass mark',
  notFinished: 'Not finished',

  recognisedRow: 'Prior learning recognised — no assessment was sat here.',
  migratedRow:
    'An older sitting, recorded before the site kept the detail of an assessment. The score is all that remains of it.',

  notePaper:
    'Passing this assessment is part of finishing the course, and there is no limit on attempts.',
  noteRevision:
    'This assessment is revision. The level no longer closes on it: it closes when you finish the decision run at the end of it, whatever that run concludes. What is here is practice on the material, not something standing between you and your certificate.',
  kept: 'Every attempt stays here as it happened. None is deleted, and none is set against another.',
};

export const attemptDictionaries: Record<AttemptLocale, AttemptStrings> = {
  ar: attemptsAr,
  en: attemptsEn,
};

export function attemptsDict(lang: AttemptLocale): AttemptStrings {
  return attemptDictionaries[lang];
}
