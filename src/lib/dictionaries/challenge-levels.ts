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
  /*
   * Renamed from `optional`/`optionalBody` when the decision run became the
   * thing that closes a level. A key called `optionalBody` holding a string
   * that says "required" is the trap this codebase keeps writing probes
   * against: the next reader trusts the name and never opens the value.
   */
  closes: string;
  closesBody: string;
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

  /*
   * ---- the staff side: runs that ended in `review`
   *
   * Nested rather than prefixed, so that everything a reviewer reads is in one
   * place and nothing here can be mistaken for a string the volunteer sees.
   * The two audiences want different words for the same fact: the learner is
   * told «تحدّث عنه مع منسّقك», and the coordinator is told what the
   * conversation is for.
   *
   * NOTHING IN HERE GRADES EITHER. `review` is not a failure on the staff
   * screen any more than it is on the learner's, there is no string for a
   * count of runs against a name, and there is no string comparing two
   * volunteers — because the query behind this page produces no such figure.
   * See the invariant comment on reviewQueue() in lib/level-challenge-runs.ts.
   */
  staff: {
    queueTitle: string;
    queueLede: string;
    queueOrderNote: string;
    queueEmpty: string;
    queueWaiting: CountForms;
    levelLabel: string;
    finishedOn: string;
    readCta: string;
    goQueue: string;
    forbidden: string;

    // ---- reading one run back
    readTitle: string;
    readLede: string;
    /* Its own string rather than a reuse of `drewOnHeading`, which says «مسارك»
       — "your path". The learner's debrief speaks to the person who walked it;
       this screen speaks about them, and a second-person heading on a
       reviewer's page reads as though the reviewer sat the run. */
    drewOnHeading: string;
    optionsHeading: string;
    tookThis: string;
    consequenceHeading: string;
    conversationTitle: string;
    conversationBody: string;
    notFound: string;
    unreadable: string;
    backToQueue: string;
  };

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
  cardKicker: 'بهذا يُغلق المستوى',
  cardTitle: 'مسار القرار في المستوى {level}',
  cardBody:
    'موقف واحد يمتدّ من أوّله إلى آخره، ويحتاج ما تعلّمته في دورات هذا المستوى مجتمعةً لا دورة واحدة. ما تختاره في كل خطوة يقرّر الموقف الذي يليه، فلا يمرّ اثنان بالمسار نفسه.',
  cardCta: 'ابدأ المسار',
  cardRetake: 'خُضْه من جديد',

  screenTitle: 'مسار القرار',
  closes: 'مطلوب، وبلا علامة',
  closesBody:
    'هذا ما يُغلق هذا المستوى ويفتح الذي يليه. لا علامة فيه ولا نجاح ولا رسوب — ما يُسجَّل هو القرارات التي اتّخذتَها، ليقرأها معك إنسان. أنهِه كما هو، ولا تتراجع عن خطوة تشعر أنك أخطأتَ فيها: هي أهمّ ما فيه.',
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

  staff: {
    queueTitle: 'قرارات تستحقّ وقفة',
    queueLede:
      'مسارات أنهاها متطوّعون، وفيها قرارٌ واحد على الأقلّ تجاوز حدّاً ليس لنا أن نتجاوزه. المستوى أُغلق كما هو ولا شيء هنا معلَّق على رأيك؛ المطلوب أن يقرأ إنسانٌ المسار ثمّ يجلس مع صاحبه.',
    queueOrderNote:
      'القائمة مرتّبة بالأحدث أوّلاً، وبهذا وحده. لا عدّ لأحد ولا مقارنة بين اثنين: هذه محادثات تُفتح، لا سجلّ يُبنى على أحد.',
    queueEmpty: 'لا مسار ينتظر القراءة.',
    queueWaiting: {
      zero: 'لا مسارات تنتظر القراءة',
      one: 'مسار واحد ينتظر القراءة',
      two: 'مساران ينتظران القراءة',
      few: '{n} مسارات تنتظر القراءة',
      many: '{n} مساراً ينتظر القراءة',
    },
    levelLabel: 'المستوى {level}',
    finishedOn: 'أُنهي في',
    readCta: 'اقرأ المسار',
    goQueue: 'مسارات تنتظر القراءة',
    forbidden: 'هذه الصفحة ليست ضمن صلاحيّاتك.',

    readTitle: 'قراءة مسار',
    readLede:
      'هذا ما مرّ به المتطوّع كما مرّ به: الموقف، والخيارات كما ظهرت له وبالترتيب نفسه، وما اختاره منها. أُعيد بناؤه من المسار المحفوظ، فهو ما رآه فعلاً لا ما نظنّ أنه رآه.',
    drewOnHeading: 'الدورات التي احتاجها هذا المسار',
    optionsHeading: 'الخيارات كما ظهرت له',
    tookThis: 'ما اختاره',
    consequenceHeading: 'ما ترتّب على القرار',
    conversationTitle: 'هذه محادثة، لا مساءلة',
    conversationBody:
      'قراءتك لهذا المسار لا تُسجَّل على أحد ولا تفتح إجراءً، والمستوى مُغلق منذ أن أنهاه. ما يُطلب منك أن تجلس معه وتسأله ماذا رأى في تلك اللحظة وما الذي دفعه إلى ما اختاره. وقوع القرار هنا بدل الميدان هو الفائدة كلّها من هذا التمرين.',
    notFound: 'لم يُعثر على هذا المسار.',
    unreadable:
      'تعذّرت قراءة هذا المسار: عُدِّل محتوى مسار القرار بعد أن خاضه المتطوّع، فلم تعد القرارات المحفوظة تصف طريقاً فيه. تحدّث مع المتطوّع مباشرةً.',
    backToQueue: 'عودة إلى القائمة',
  },

  notYet: 'لم تُنهِ دورات هذا المستوى بعد',
  notYetBody:
    'يفتح مسار القرار بعد أن تُنهي دورات هذا المستوى، وإنهاؤه هو ما يُغلق المستوى ويفتح الذي يليه. أنهِ دوراتك أولاً ثم عُد إلى هنا.',
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
  cardKicker: 'How this level closes',
  cardTitle: 'Level {level} decision run',
  cardBody:
    'One situation from beginning to end, needing what this level’s courses taught together rather than any one of them. What you choose at each step decides the situation that follows, so no two people walk the same path.',
  cardCta: 'Start the run',
  cardRetake: 'Take it again',

  screenTitle: 'Decision run',
  closes: 'Required, and unmarked',
  closesBody:
    'This is what closes the level and opens the one after it. There is no mark in it, no pass and no fail — what is recorded is the decisions you took, so that a person can read them with you. Walk it to the end, and do not back away from a step you feel you got wrong: that step is the most useful thing in it.',
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

  staff: {
    queueTitle: 'Decisions worth sitting with',
    queueLede:
      'Runs finished by volunteers in which at least one decision crossed a line that is not ours to cross. The level closed as it stands and nothing here is waiting on your verdict; what is needed is that a person reads the run and then sits with whoever walked it.',
    queueOrderNote:
      'The list is ordered newest first, and by that alone. Nobody is counted and no two people are compared: these are conversations to open, not a record being built about anyone.',
    queueEmpty: 'No run is waiting to be read.',
    queueWaiting: {
      zero: 'Nothing waiting to be read',
      one: 'One run waiting to be read',
      two: '2 runs waiting to be read',
      few: '{n} runs waiting to be read',
      many: '{n} runs waiting to be read',
    },
    levelLabel: 'Level {level}',
    finishedOn: 'Finished on',
    readCta: 'Read the run',
    goQueue: 'Runs waiting to be read',
    forbidden: 'This page is not within your capabilities.',

    readTitle: 'Reading a run',
    readLede:
      'This is what the volunteer met, as they met it: the situation, the options as they appeared and in the same order, and the one they took. It is rebuilt from the stored run, so it is what they actually saw rather than what we assume they saw.',
    drewOnHeading: 'The courses this path leaned on',
    optionsHeading: 'The options as they appeared',
    tookThis: 'Took this',
    consequenceHeading: 'What the decision led to',
    conversationTitle: 'This is a conversation, not an inquiry',
    conversationBody:
      'Reading this run is recorded against nobody and opens no procedure, and the level has been closed since they finished it. What is asked of you is to sit with them and ask what they saw at that moment, and what led them to what they chose. That the decision happened here rather than in the field is the entire value of the exercise.',
    notFound: 'That run could not be found.',
    unreadable:
      'This run could not be read back: the decision run’s content was edited after the volunteer walked it, so the stored decisions no longer describe a path through it. Speak with the volunteer directly.',
    backToQueue: 'Back to the list',
  },

  notYet: 'You have not finished this level’s courses yet',
  notYetBody:
    'The decision run opens once this level’s courses are behind you, and finishing it is what closes the level and opens the one after it. Finish your courses first, then come back here.',
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
