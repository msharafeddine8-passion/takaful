import type { Locale } from '@/lib/i18n';

/**
 * Strings for the learning analytics page.
 *
 * Its own module rather than three splices into types.ts / ar.ts / en.ts,
 * following dictionaries/recognition-admin.ts. Several parts of the platform
 * are built in parallel and every one of them would otherwise be editing the
 * same three files at the same time.
 *
 * To fold it into the main dictionary later: add `learningAnalytics:
 * LearningAnalyticsStrings` to the Dictionary type, then `...` these two
 * objects into ar.ts and en.ts. Nothing else has to move.
 *
 * ── On the wording ─────────────────────────────────────────────────────────
 *
 * Every sentence here is about a course and none is about a learner, and that
 * is a choice made in the strings as much as in the queries. «Where learners
 * fail» invites a reader to look for the learners; «where the course loses
 * people» invites them to look at the course. The Arabic follows the same
 * rule, and the counted nouns take the five forms Arabic actually has — see
 * countPhrase in src/lib/when.ts, which these `forms` objects feed.
 */

/** The five shapes a counted noun takes, for countPhrase. */
export type CountForms = {
  zero: string;
  one: string;
  two: string;
  few: string;
  many: string;
};

export type LearningAnalyticsStrings = {
  title: string;
  lede: string;

  ethicTitle: string;
  ethicBody: string;

  withheld: string;
  withheldWhy: string;
  nothingYet: string;

  overviewTitle: string;
  overviewLede: string;
  coursesTouched: string;

  worstTitle: string;
  worstLede: string;
  colCourse: string;
  colStarted: string;
  colFinished: string;
  colPassed: string;
  colCompletion: string;
  colAttempts: string;

  unopenedTitle: string;
  unopenedLede: string;
  unopenedNone: string;
  unwrittenTitle: string;
  unwrittenLede: string;
  unwrittenNone: string;

  courseTitle: string;
  courseLede: string;

  modulesTitle: string;
  reachedLabel: string;
  strandedHere: string;
  strandedTotal: string;
  noModules: string;

  dropOffTitle: string;
  dropOffLine: string;
  dropOffThin: string;
  dropOffNone: string;

  questionsTitle: string;
  questionsLede: string;
  failureRate: string;
  questionsNone: string;
  unjudged: string;

  paceTitle: string;
  claimed: string;
  inPractice: string;
  spreadOut: string;
  verdicts: Record<'as-claimed' | 'slower' | 'faster' | 'unknown', string>;

  statuses: Record<string, string>;
  levelWord: string;
  electiveWord: string;

  forms: {
    learners: CountForms;
    courses: CountForms;
    questions: CountForms;
    modules: CountForms;
    attempts: CountForms;
    minutes: CountForms;
  };
};

export const learningAnalyticsAr: LearningAnalyticsStrings = {
  title: 'أين تفقد الأكاديمية متعلّميها',
  lede:
    'ما الذي يحدث فعلاً داخل الدورات: أين يتوقّف الناس عن القراءة، وأي سؤال يسقط فيه أكثرهم، '
    + 'وكم تستغرق الدورة مقارنةً بما تَعِد به. الأرقام هنا عن المحتوى لا عن الأشخاص — '
    + 'الغاية أن تُصلَح الدورة، لا أن يُلام من تعثّر فيها.',

  ethicTitle: 'ما لا تعرضه هذه الصفحة',
  ethicBody:
    'لا أسماء ولا ترتيب أشخاص ولا علامة فرد. وحين يكون العدد خلف الرقم صغيراً إلى حدّ يكشف '
    + 'شخصاً بعينه، يُحجب الرقم ويُقال إنّه محجوب بدل أن يُطبع. نسبة الخطأ في سؤال ملاحظة على '
    + 'السؤال؛ أمّا قائمة من أخطأوا فيه فشيء آخر لم يطلبه أحد.',

  withheld: 'محجوب',
  withheldWhy: 'العدد أصغر من أن يُقال دون كشف شخص بعينه.',
  nothingYet: 'لا شيء بعد.',

  overviewTitle: 'الأكاديمية كلّها',
  overviewLede: 'الصورة العامة أولاً، ثم تفصيل كل دورة تحتها.',
  coursesTouched: 'دورات فتحها أحد',

  worstTitle: 'أدنى نسب الإتمام',
  worstLede:
    'من فتح الدورة ثم نجح فيها، كنسبة. الدورات التي لم يفتحها أحد ليست هنا: '
    + 'صفر من صفر ليس فشلاً، بل غياب.',
  colCourse: 'الدورة',
  colStarted: 'فتحوها',
  colFinished: 'قدّموا الاختبار',
  colPassed: 'نجحوا',
  colCompletion: 'نسبة الإتمام',
  colAttempts: 'محاولات حتى النجاح',

  unopenedTitle: 'دورات مكتوبة لم يفتحها أحد',
  unopenedLede:
    'محتواها جاهز ولم يدخلها أحد بعد. هذا سؤال لمن يقرّر إلى أين يُوجَّه المتطوّعون، '
    + 'لا لمن يكتب المحتوى.',
  unopenedNone: 'كل دورة مكتوبة فتحها أحد.',
  unwrittenTitle: 'دورات لم يُكتب محتواها',
  unwrittenLede:
    'لا وحدات فيها بعد، فلا يمكن أن يفتحها أحد أصلاً. مذكورة على حدة كي لا تدفن '
    + 'المسوّدات الملاحظات الحقيقية فوقها.',
  unwrittenNone: 'كل دورة في الفهرس مكتوبة.',

  courseTitle: 'دورة بدورة',
  courseLede:
    'الدورات التي فتحها أحد فقط. ما لم يفتحه أحد مذكور أعلاه، وعرضه هنا بأصفار '
    + 'يُغرق ما يمكن التصرّف به.',

  modulesTitle: 'الوحدات',
  reachedLabel: 'أنهوا قراءتها',
  strandedHere: 'توقّفوا هنا ولم يعودوا',
  strandedTotal: 'متوقّفون في منتصف الدورة',
  noModules: 'لا وحدات مسجّلة لهذه الدورة.',

  dropOffTitle: 'أحدّ انخفاض',
  dropOffLine: 'بين «{from}» و«{to}»: خسرت الدورة {lost} من {reached} ({share}%).',
  dropOffThin: 'الانخفاض أصغر من أن يُنسب إلى الدورة لا إلى يوم أحدهم.',
  dropOffNone: 'لا انخفاض حادّاً بين وحدتين متتاليتين.',

  questionsTitle: 'الأسئلة الأكثر سقوطاً',
  questionsLede:
    'نسبة الإجابات الخاطئة على كل سؤال. السؤال الذي يخطئ فيه معظم من أجابوه إمّا صياغته '
    + 'ملتبسة أو أنّ الوحدة قبله لم تشرح ما يفترض أنّها شرحته.',
  failureRate: 'خطأ',
  questionsNone: 'لا سؤال في هذه الدورة أجابه ما يكفي من الناس ليُحكم عليه.',
  unjudged: 'و{n} لم يُحكم عليها: عدد من أجابوها أصغر من أن يُقال.',

  paceTitle: 'الوقت',
  claimed: 'تَعِد بـ',
  inPractice: 'الوسيط الفعلي',
  spreadOut: 'من نجحوا موزّعين على أكثر من يوم',
  verdicts: {
    'as-claimed': 'قريبة ممّا تَعِد به',
    slower: 'أطول ممّا تَعِد به',
    faster: 'أقصر ممّا تَعِد به',
    unknown: 'لا يكفي للحكم',
  },

  statuses: {
    draft: 'مسوّدة',
    review: 'قيد المراجعة',
    published: 'منشورة',
    archived: 'مؤرشفة',
  },
  levelWord: 'المستوى',
  electiveWord: 'اختيارية',

  forms: {
    learners: {
      zero: 'لا أحد',
      one: 'متعلّم واحد',
      two: 'متعلّمان',
      few: '{n} متعلّمين',
      many: '{n} متعلّماً',
    },
    courses: {
      zero: 'لا دورات',
      one: 'دورة واحدة',
      two: 'دورتان',
      few: '{n} دورات',
      many: '{n} دورة',
    },
    questions: {
      zero: 'لا أسئلة',
      one: 'سؤال واحد',
      two: 'سؤالان',
      few: '{n} أسئلة',
      many: '{n} سؤالاً',
    },
    modules: {
      zero: 'لا وحدات',
      one: 'وحدة واحدة',
      two: 'وحدتان',
      few: '{n} وحدات',
      many: '{n} وحدة',
    },
    attempts: {
      zero: 'لا محاولات',
      one: 'محاولة واحدة',
      two: 'محاولتان',
      few: '{n} محاولات',
      many: '{n} محاولة',
    },
    minutes: {
      zero: 'أقلّ من دقيقة',
      one: 'دقيقة',
      two: 'دقيقتان',
      few: '{n} دقائق',
      many: '{n} دقيقة',
    },
  },
};

export const learningAnalyticsEn: LearningAnalyticsStrings = {
  title: 'Where the academy loses people',
  lede:
    'What actually happens inside the courses: where people stop reading, which question '
    + 'most of them get wrong, and how long a course takes against what it promises. These '
    + 'figures are about the content, not about the people — so that the course gets fixed '
    + 'rather than the learner blamed.',

  ethicTitle: 'What this page does not show',
  ethicBody:
    'No names, no ranking of people, no individual score. Where the cohort behind a figure '
    + 'is small enough to identify somebody, the figure is withheld and said to be withheld '
    + 'rather than printed. A failure rate on a question is feedback about the question; a '
    + 'list of who got it wrong is a different thing nobody asked for.',

  withheld: 'Withheld',
  withheldWhy: 'Too few people behind this to report without identifying somebody.',
  nothingYet: 'Nothing yet.',

  overviewTitle: 'The academy as a whole',
  overviewLede: 'The shape first, then each course underneath.',
  coursesTouched: 'Courses anybody has opened',

  worstTitle: 'Worst completion',
  worstLede:
    'Of those who opened the course, the share that passed it. Courses nobody has opened '
    + 'are not here: nought of nought is an absence, not a failure.',
  colCourse: 'Course',
  colStarted: 'Opened it',
  colFinished: 'Sat the paper',
  colPassed: 'Passed',
  colCompletion: 'Completion',
  colAttempts: 'Papers per pass',

  unopenedTitle: 'Written, and nobody has opened it',
  unopenedLede:
    'The content is there and no one has been through it. That is a question for whoever '
    + 'decides where volunteers are pointed, not for whoever writes the courses.',
  unopenedNone: 'Every written course has been opened.',
  unwrittenTitle: 'No content written yet',
  unwrittenLede:
    'No modules, so nobody could have opened them. Listed apart so a pile of drafts does '
    + 'not bury the findings above.',
  unwrittenNone: 'Every course in the catalogue has content.',

  courseTitle: 'Course by course',
  courseLede:
    'Only courses somebody has opened. The untouched ones are listed above, and repeating '
    + 'them here as rows of noughts would drown what can be acted on.',

  modulesTitle: 'Modules',
  reachedLabel: 'Finished reading it',
  strandedHere: 'Stopped here and did not come back',
  strandedTotal: 'Stopped part-way through',
  noModules: 'No modules recorded for this course.',

  dropOffTitle: 'Steepest drop',
  dropOffLine: 'Between {from} and {to}: the course lost {lost} of {reached} ({share}%).',
  dropOffThin: 'The drop is too small to be about the course rather than about somebody\x27s day.',
  dropOffNone: 'No sharp drop between two consecutive modules.',

  questionsTitle: 'Most failed questions',
  questionsLede:
    'The share of answers that were wrong. A question most people get wrong is either '
    + 'worded ambiguously or sits after a module that did not teach what it was meant to.',
  failureRate: 'wrong',
  questionsNone: 'No question in this course has been answered by enough people to judge.',
  unjudged: 'and {n} not judged: too few people answered them to report.',

  paceTitle: 'Time',
  claimed: 'Promises',
  inPractice: 'Median in practice',
  spreadOut: 'passers took more than a day over it',
  verdicts: {
    'as-claimed': 'About what it promises',
    slower: 'Longer than it promises',
    faster: 'Shorter than it promises',
    unknown: 'Not enough to judge',
  },

  statuses: {
    draft: 'Draft',
    review: 'In review',
    published: 'Published',
    archived: 'Archived',
  },
  levelWord: 'Level',
  electiveWord: 'Elective',

  forms: {
    learners: {
      zero: 'nobody',
      one: '1 learner',
      two: '2 learners',
      few: '{n} learners',
      many: '{n} learners',
    },
    courses: {
      zero: 'no courses',
      one: '1 course',
      two: '2 courses',
      few: '{n} courses',
      many: '{n} courses',
    },
    questions: {
      zero: 'no questions',
      one: '1 question',
      two: '2 questions',
      few: '{n} questions',
      many: '{n} questions',
    },
    modules: {
      zero: 'no modules',
      one: '1 module',
      two: '2 modules',
      few: '{n} modules',
      many: '{n} modules',
    },
    attempts: {
      zero: 'no papers',
      one: '1 paper',
      two: '2 papers',
      few: '{n} papers',
      many: '{n} papers',
    },
    minutes: {
      zero: 'under a minute',
      one: '1 minute',
      two: '2 minutes',
      few: '{n} minutes',
      many: '{n} minutes',
    },
  },
};

export const learningAnalytics = (lang: Locale): LearningAnalyticsStrings =>
  lang === 'ar' ? learningAnalyticsAr : learningAnalyticsEn;
