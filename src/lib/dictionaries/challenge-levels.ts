/**
 * Every string the level decision runs introduce, in one file.
 *
 * The dictionary proper is three large files edited in lockstep — types.ts
 * declares the shape, ar.ts and en.ts fill it — and adding a namespace by
 * hand-editing all three at once is how two people working in parallel
 * collide. So this namespace owns its strings here and the route imports it
 * directly, exactly as challenges.ts, awards.ts, lms.ts and practical.ts
 * already do. Splicing it into the main dictionary later is three one-line
 * edits.
 *
 * Placeholders are filled with String.replace — {n}, {level} — which is the
 * convention the rest of the dictionary uses. There is no ICU here.
 *
 * ── COUNTED NOUNS ──────────────────────────────────────────────────────────
 *
 * Two counts reach a screen: how many decisions a run takes, and how many
 * courses it leaned on. Arabic inflects a counted noun in bands and English in
 * two, so «2 قرارات» and «3 قرار» are both wrong. Both are `CountForms` and the
 * caller passes them to countPhrase() from lib/when.ts — the helper this
 * codebase already uses for hours, activities, badges and certificates. Its
 * bands are zero / one / two / few (3–10) / many (11+), and only the last two
 * carry {n}, because «قراران» does not want a numeral in front of it.
 *
 * ── TONE ───────────────────────────────────────────────────────────────────
 *
 * Nothing here grades, and there is no string for a mark, a percentage or a
 * position. The three outcomes are described in terms of the decisions rather
 * than the person: «مرّ من دون ما يُراجَع» is what happened, «رسبت» is not, and
 * `review` is deliberately never called failure — a volunteer who took a
 * harmful option took it here rather than in a hall with thirty children in it.
 *
 * There is also no string comparing one learner with another, because there is
 * no figure in this feature that could be compared. See the head of migration
 * 042.
 */

/** 'ar' | 'en', spelled out rather than imported, so this file stays a leaf. */
type ChallengeLocale = 'ar' | 'en';

/** The shape countPhrase() in lib/when.ts expects. Only few/many carry {n}. */
export type CountForms = {
  zero: string;
  one: string;
  two: string;
  few: string;
  many: string;
};

export type ChallengeLevelStrings = {
  // ---- the way in
  cardKicker: string;
  cardTitle: string;
  cardBody: string;
  cardCta: string;
  cardRetake: string;

  // ---- the run itself
  screenTitle: string;
  optional: string;
  optionalBody: string;
  situationHeading: string;
  questionHeading: string;
  decisionOf: string;
  start: string;
  choose: string;

  // ---- what a decision cost
  consequenceHeading: string;
  continueCta: string;

  // ---- the debrief
  debriefTitle: string;
  debriefLede: string;
  outcomeClear: string;
  outcomeHeld: string;
  outcomeReview: string;
  outcomeClearBody: string;
  outcomeHeldBody: string;
  outcomeReviewBody: string;
  drewOnHeading: string;
  yourDecisionsHeading: string;
  youChose: string;
  againCta: string;
  backToJourney: string;

  // ---- counted nouns, for countPhrase()
  decisionCount: CountForms;
  courseCount: CountForms;

  // ---- refusals and empty states
  notYet: string;
  notYetBody: string;
  noRun: string;
  signIn: string;
  errors: {
    'not-signed-in': string;
    'level-not-complete': string;
    'no-challenge': string;
    'no-run': string;
    'wrong-step': string;
    finished: string;
    broken: string;
    db: string;
  };
};

export const challengeLevelsAr: ChallengeLevelStrings = {
  cardKicker: 'تمرين اختياري',
  cardTitle: 'مسار القرار في المستوى {level}',
  cardBody:
    'موقف واحد يمتدّ من أوّله إلى آخره، ويحتاج ما تعلّمته في دورات هذا المستوى مجتمعةً لا دورة واحدة. ما تختاره في كل خطوة يقرّر الموقف الذي يليه، فلا يمرّ اثنان بالمسار نفسه.',
  cardCta: 'ابدأ المسار',
  cardRetake: 'خُضْه من جديد',

  screenTitle: 'مسار القرار',
  optional: 'اختياري بالكامل',
  optionalBody:
    'هذا التمرين لا يُحتسب في أيّ علامة ولا يصدر عنه شهادة، ولا يفتح ولا يُغلق شيئاً. أنهيتَ هذا المستوى فعلاً، وهذا مكان لتجرّب فيه قراراتك قبل الميدان.',
  situationHeading: 'الموقف',
  questionHeading: 'قرارك',
  decisionOf: 'القرار {n} من {total}',
  start: 'ابدأ',
  choose: 'اختر هذا',

  consequenceHeading: 'ما ترتّب على قرارك',
  continueCta: 'تابع',

  debriefTitle: 'مراجعة المسار',
  debriefLede:
    'هذه قراراتك كما اتّخذتها، وما ترتّب على كلٍّ منها. المسار محفوظ كما هو حتى تعود إليه متى شئت.',
  outcomeClear: 'مرّ من دون ملاحظات',
  outcomeHeld: 'مرّ بكلفة',
  outcomeReview: 'قرار يستحقّ وقفة',
  outcomeClearBody:
    'في كل خطوة اخترتَ ما تختاره الجمعية. هذا لا يعني أن الموقف كان سهلاً — يعني أنك ربطتَ القرار بالمبدأ الذي يحكمه.',
  outcomeHeldBody:
    'لم يتجاوز أيّ قرار حدّاً، وبعضها كلّف أكثر ممّا كان يلزم — وقتاً أو ثقةً أو علاقة. اقرأ ما ترتّب على كل خطوة أدناه؛ هناك تحديداً يقع الفرق.',
  outcomeReviewBody:
    'قرار واحد على الأقلّ تجاوز حدّاً ليس لنا أن نتجاوزه. وقوعه هنا بدل الميدان هو الفائدة كلّها من هذا التمرين. اقرأ ما ترتّب عليه، وإن أردت فتحدّث عنه مع منسّقك.',
  drewOnHeading: 'الدورات التي احتاجها مسارك',
  yourDecisionsHeading: 'ما اخترتَه، خطوةً خطوة',
  youChose: 'اخترت',
  againCta: 'خُضْه من جديد بمسار مختلف',
  backToJourney: 'عودة إلى مساري',

  decisionCount: {
    zero: 'لا قرارات',
    one: 'قرار واحد',
    two: 'قراران',
    few: '{n} قرارات',
    many: '{n} قراراً',
  },
  courseCount: {
    zero: 'لا دورات',
    one: 'دورة واحدة',
    two: 'دورتان',
    few: '{n} دورات',
    many: '{n} دورة',
  },

  notYet: 'لم يكتمل هذا المستوى بعد',
  notYetBody:
    'يفتح مسار القرار بعد أن تُنهي دورات هذا المستوى. لا شيء ينتظرك هنا قبل ذلك، ولا يؤثّر عدم خوضه في شهادتك ولا في تقدّمك.',
  noRun: 'لا يوجد مسار مفتوح.',
  signIn: 'سجّل الدخول لتخوض المسار.',
  errors: {
    'not-signed-in': 'سجّل الدخول أوّلاً.',
    'level-not-complete': 'يفتح هذا المسار بعد إتمام دورات المستوى.',
    'no-challenge': 'لا يوجد مسار قرار لهذا المستوى بعد.',
    'no-run': 'لا يوجد مسار مفتوح. ابدأ واحداً.',
    'wrong-step': 'انتقل المسار خطوةً بعد أن فتحتَ هذه الصفحة. حدّثها لترى موقفك الحالي.',
    finished: 'انتهى هذا المسار. اقرأ المراجعة أو ابدأ مساراً جديداً.',
    broken: 'تعذّرت قراءة هذا المسار. ابدأ مساراً جديداً — لن يُحذف القديم.',
    db: 'تعذّر الحفظ الآن. حاول مرّة أخرى.',
  },
};

export const challengeLevelsEn: ChallengeLevelStrings = {
  cardKicker: 'Optional exercise',
  cardTitle: 'Level {level} decision run',
  cardBody:
    'One situation from beginning to end, needing what this level’s courses taught together rather than any one of them. What you choose at each step decides the situation that follows, so no two people walk the same path.',
  cardCta: 'Start the run',
  cardRetake: 'Take it again',

  screenTitle: 'Decision run',
  optional: 'Entirely optional',
  optionalBody:
    'This exercise counts towards no mark, issues no certificate, and opens and closes nothing. You have already finished this level; this is somewhere to try your decisions out before the field does.',
  situationHeading: 'The situation',
  questionHeading: 'Your decision',
  decisionOf: 'Decision {n} of {total}',
  start: 'Begin',
  choose: 'Choose this',

  consequenceHeading: 'What your decision led to',
  continueCta: 'Carry on',

  debriefTitle: 'Looking back at the run',
  debriefLede:
    'These are your decisions as you took them, and what each one led to. The run is kept exactly as it stands, so you can come back to it whenever you like.',
  outcomeClear: 'Came through with nothing to note',
  outcomeHeld: 'Came through at a cost',
  outcomeReview: 'A decision worth sitting with',
  outcomeClearBody:
    'At every step you chose what the association would choose. That does not mean the situation was easy — it means you tied the decision to the principle behind it.',
  outcomeHeldBody:
    'No decision crossed a line, and some cost more than they needed to — time, trust, or a relationship. Read what each step led to below; that is exactly where the difference sits.',
  outcomeReviewBody:
    'At least one decision crossed a line that is not ours to cross. That it happened here rather than in the field is the entire point of the exercise. Read what it led to, and talk it over with your coordinator if you would like to.',
  drewOnHeading: 'The courses your path leaned on',
  yourDecisionsHeading: 'What you chose, step by step',
  youChose: 'You chose',
  againCta: 'Take it again on a different path',
  backToJourney: 'Back to my journey',

  decisionCount: {
    zero: 'No decisions',
    one: 'One decision',
    two: '2 decisions',
    few: '{n} decisions',
    many: '{n} decisions',
  },
  courseCount: {
    zero: 'No courses',
    one: 'One course',
    two: '2 courses',
    few: '{n} courses',
    many: '{n} courses',
  },

  notYet: 'This level is not finished yet',
  notYetBody:
    'The decision run opens once you have finished this level’s courses. Nothing is waiting for you here before then, and not taking it affects neither your certificate nor your progress.',
  noRun: 'There is no run open.',
  signIn: 'Sign in to take the run.',
  errors: {
    'not-signed-in': 'Sign in first.',
    'level-not-complete': 'This run opens once the level’s courses are finished.',
    'no-challenge': 'There is no decision run for this level yet.',
    'no-run': 'There is no run open. Start one.',
    'wrong-step': 'The run moved on after you opened this page. Refresh to see where you are.',
    finished: 'This run has ended. Read the debrief, or start a new one.',
    broken: 'That run could not be read back. Start a new one — the old one is kept.',
    db: 'That could not be saved just now. Try again.',
  },
};

export const challengeLevelDictionaries: Record<ChallengeLocale, ChallengeLevelStrings> = {
  ar: challengeLevelsAr,
  en: challengeLevelsEn,
};

export function challengeLevels(lang: ChallengeLocale): ChallengeLevelStrings {
  return challengeLevelDictionaries[lang];
}
