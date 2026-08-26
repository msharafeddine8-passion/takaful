import type { Locale } from '../i18n';

/**
 * The training programme: what exists, where it sits, and what it requires.
 *
 * This is the authored source. The seed writes it into Postgres, the
 * application reads Postgres, and staff edit Postgres. Once a row has been
 * edited by a person it is marked `origin = 'admin'` and the seed leaves it
 * alone permanently — that is the entire conflict rule between the two.
 *
 * Authored here rather than typed straight into the database because a missing
 * translation should be a compile error, the probe suite should be able to
 * read the whole structure without a connection, and a change to what the
 * association teaches should arrive as a diff somebody reviewed.
 *
 * SLUGS ARE PERMANENT IDENTIFIERS, NOT LABELS.
 *
 * `course_attempts`, `course_module_progress` and `certificates` all key on
 * `course_slug` TEXT. Renaming a slug orphans a volunteer's history silently —
 * no error, just a person whose completed course stops counting. Five slugs
 * below carry titles that no longer match them (`digital-basics` is now
 * "Digital Skills and Data Protection", `life-skills` is now "Time, Pressure
 * and Wellbeing"). That mismatch is deliberate and is the cheap half of the
 * trade.
 */

export type L = Record<Locale, string>;
export type LList = Record<Locale, string[]>;

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type CourseKind = 'orientation' | 'core' | 'elective' | 'challenge';

export type CourseDef = {
  slug: string;
  kind: CourseKind;
  /** 0 is the orientation; 1-6 are the levels; electives carry null. */
  level: number | null;
  /** Position within the level. The challenge is always last. */
  order: number;
  title: L;
  summary: L;
  /** Measured from the written content, never aspired to. 25-60. */
  minutes: number;
  difficulty: Difficulty;
  /**
   * 80 where being wrong hurts somebody, 70 otherwise. The five at 80 are the
   * orientation, child safeguarding, people at risk, first aid, and field
   * safety — the courses whose subject is somebody else's safety.
   */
  passMark: 70 | 80;
  icon: string;
  /** Locks the door. A slug that must be passed first. */
  requires: string[];
  /** Advises only. Never blocks. */
  recommends: string[];
  outcomes: LList;
};

export type LevelDef = {
  number: number;
  title: L;
  description: L;
  badgeCode: string;
};

export const PROGRAM_SLUG = 'volunteer-path';

export const PROGRAM: { slug: string; title: L; description: L } = {
  slug: PROGRAM_SLUG,
  title: {
    ar: 'مسار المتطوّع المتكامل',
    en: 'The Complete Volunteer Path',
  },
  description: {
    ar: 'برنامج تدريبي متدرّج من ستة مستويات، يبدأ بدورة تمهيدية إلزامية وينتهي بمتطوّع قادر على قيادة فريق وتصميم مبادرة وحماية من يخدمهم. كل مستوى ينتهي بموقف واقعي تخوضه قراراً بعد قرار، ثم شهادة المستوى.',
    en: 'A six-level training programme that starts with a mandatory orientation and ends with a volunteer who can lead a team, design an initiative, and protect the people they serve. Every level ends with a real situation you walk through decision by decision, and then the level certificate.',
  },
};

export const LEVELS: LevelDef[] = [
  {
    number: 0,
    title: { ar: 'التهيئة', en: 'Orientation' },
    description: {
      ar: 'قبل أي تدريب أو نشاط ميداني: ما يُنتظر منك، وما لا يُقبل منك، وكيف تُبلّغ حين يحدث شيء.',
      en: 'Before any training or field activity: what is expected of you, what is not acceptable, and how to report when something happens.',
    },
    badgeCode: 'level-0-oriented',
  },
  {
    number: 1,
    title: { ar: 'الأسس العامة', en: 'Foundations' },
    description: {
      ar: 'الأرضية المشتركة لكل متطوّع: ما هو التطوّع، كيف تتواصل، كيف تعمل ضمن فريق، كيف تحمي الأطفال، وكيف تحمي البيانات.',
      en: 'The common ground for every volunteer: what volunteering is, how to communicate, how to work in a team, how to protect children, and how to protect data.',
    },
    badgeCode: 'level-1-foundations',
  },
  {
    number: 2,
    title: { ar: 'المهارات الأساسية', en: 'Core Skills' },
    description: {
      ar: 'ما تحتاجه ليوم ميداني حقيقي: إدارة وقتك وضغطك، توثيق ما جرى، السلامة والطوارئ، الإعلام المسؤول، والاستجابة الأولى.',
      en: 'What a real field day asks of you: managing your time and pressure, documenting what happened, safety and emergencies, responsible media, and first response.',
    },
    badgeCode: 'level-2-core',
  },
  {
    number: 3,
    title: { ar: 'التخصصات', en: 'Specialisations' },
    description: {
      ar: 'من التنفيذ إلى التصميم: قيادة فريق، كتابة مقترح، تنظيم فعالية آمنة، حماية الفئات المعرّضة للخطر، وقراءة احتياج المجتمع كما هو لا كما نفترضه.',
      en: 'From doing to designing: leading a team, writing a proposal, running a safe event, protecting people at risk, and reading what a community needs rather than what we assume it needs.',
    },
    badgeCode: 'level-3-specialist',
  },
  {
    number: 4,
    title: { ar: 'التخصص المتقدم', en: 'Advanced Practice' },
    description: {
      ar: 'المهارات التي تظهر حين يختلف الناس: الذكاء العاطفي، تيسير الاجتماعات، التفاوض والمناصرة، حل النزاعات، والدمج بحيث لا يبقى أحد خارج الغرفة.',
      en: 'The skills that show up when people disagree: emotional intelligence, facilitation, negotiation and advocacy, conflict resolution, and inclusion that leaves nobody outside the room.',
    },
    badgeCode: 'level-4-advanced',
  },
  {
    number: 5,
    title: { ar: 'القيادة والتأثير', en: 'Leadership and Influence' },
    description: {
      ar: 'قيادة تُبنى على القيم لا على الموقع: قيادة التغيير، الخطاب المؤثر، إدارة مشروع بميزانية ومخاطر، القرار الأخلاقي، وقياس الأثر بصدق.',
      en: 'Leadership built on values rather than position: leading change, speaking with impact, running a project with a budget and risks, deciding ethically, and measuring impact honestly.',
    },
    badgeCode: 'level-5-leader',
  },
  {
    number: 6,
    title: { ar: 'الاحتراف والاستدامة', en: 'Professional Practice and Sustainability' },
    description: {
      ar: 'بناء ما يبقى بعدك: دورة حياة المتطوّع، تعبئة الموارد، الشراكات، تدريب المدربين، والحوكمة التي تحفظ ثقة المجتمع.',
      en: 'Building what outlasts you: the volunteer lifecycle, resourcing, partnerships, training trainers, and the governance that keeps a community’s trust.',
    },
    badgeCode: 'level-6-steward',
  },
];

/** Shorthand so the table below stays readable. */
const o = (ar: string[], en: string[]): LList => ({ ar, en });

export const COURSES: CourseDef[] = [
  // =================================================================== level 0
  {
    slug: 'code-of-conduct-and-reporting',
    kind: 'orientation',
    level: 0,
    order: 1,
    title: {
      ar: 'مدوّنة السلوك والحماية وآلية الإبلاغ',
      en: 'Code of Conduct, Safeguarding and Reporting',
    },
    summary: {
      ar: 'الدورة التي تُفتح قبل كل شيء آخر. ما يُنتظر منك كمتطوّع، أين تقف حدودك، كيف تحمي من تخدمهم وتحمي نفسك، ومتى وكيف تُبلّغ.',
      en: 'The course that opens before anything else. What is expected of you, where your limits are, how to protect the people you serve and yourself, and when and how to report.',
    },
    minutes: 30,
    difficulty: 'beginner',
    passMark: 80,
    icon: '🛡️',
    requires: [],
    recommends: [],
    outcomes: o(
      [
        'تلتزم بمدوّنة سلوك المتطوّع وتشرح سبب كل بند فيها',
        'تحدّد الحدود المهنية وتتعرّف على السلوك الذي يتجاوزها',
        'تطبّق مبدأ عدم الإضرار على قرار ميداني حقيقي',
        'تميّز بين الشكوى والحادث والحالة الطارئة، وتختار القناة الصحيحة لكلٍّ منها',
        'تُبلّغ عن مخاوف الحماية والاستغلال والتحرّش عبر القنوات الرسمية للجمعية',
      ],
      [
        'Follow the volunteer code of conduct and explain the reason behind each clause',
        'Identify professional boundaries and recognise behaviour that crosses them',
        'Apply the do-no-harm principle to a real field decision',
        'Distinguish a complaint from an incident from an emergency, and pick the right channel for each',
        'Report safeguarding, exploitation and harassment concerns through the association’s official channels',
      ],
    ),
  },

  // =================================================================== level 1
  {
    slug: 'volunteering-foundations',
    kind: 'core',
    level: 1,
    order: 1,
    title: {
      ar: 'أساسيات العمل التطوّعي وأخلاقياته',
      en: 'Foundations and Ethics of Volunteering',
    },
    summary: {
      ar: 'ما هو التطوّع بالضبط، وما ليس تطوّعاً، وما المبادئ التي تحكمه — وأين تنتهي مسؤوليتك وتبدأ مسؤولية غيرك.',
      en: 'What volunteering precisely is, what it is not, the principles that govern it — and where your responsibility ends and someone else’s begins.',
    },
    minutes: 30,
    difficulty: 'beginner',
    passMark: 70,
    icon: '🤲',
    requires: ['code-of-conduct-and-reporting'],
    recommends: [],
    outcomes: o(
      [
        'تُعرّف العمل التطوّعي وتميّزه عن العمل المأجور والتدريب الإلزامي',
        'تطبّق المبادئ الإنسانية على مواقف ميدانية متعارضة',
        'تعدّد حقوقك وواجباتك كمتطوّع، وتعرف على من ترجع',
        'تصف حدود دور المتطوّع وتتعرّف على اللحظة التي تتجاوزها',
      ],
      [
        'Define volunteering and distinguish it from paid work and mandatory placements',
        'Apply humanitarian principles to field situations where they conflict',
        'State your rights and responsibilities as a volunteer, and know who to turn to',
        'Describe the limits of a volunteer’s role and recognise the moment you are past them',
      ],
    ),
  },
  {
    slug: 'communication-skills',
    kind: 'core',
    level: 1,
    order: 2,
    title: { ar: 'التواصل الفعّال', en: 'Effective Communication' },
    summary: {
      ar: 'الاستماع قبل الكلام، والسؤال قبل الافتراض، والتواصل الذي يحفظ كرامة من أمامك حتى تحت الضغط.',
      en: 'Listening before speaking, asking before assuming, and communicating in a way that keeps the other person’s dignity intact — even under pressure.',
    },
    minutes: 25,
    difficulty: 'beginner',
    passMark: 70,
    icon: '💬',
    requires: ['code-of-conduct-and-reporting'],
    recommends: ['volunteering-foundations'],
    outcomes: o(
      [
        'تمارس الاستماع الفعّال وتتحقّق من فهمك قبل الرد',
        'تصوغ أسئلة مفتوحة تناسب الموقف والشخص',
        'تتعامل مع سوء الفهم وتصحّحه دون إحراج أحد',
        'تقدّم ملاحظة نقدية وتستقبلها دون أن تتحوّل إلى خصومة',
      ],
      [
        'Practise active listening and check your understanding before replying',
        'Frame open questions that fit the situation and the person',
        'Handle and correct a misunderstanding without embarrassing anyone',
        'Give and receive critical feedback without it turning into a fight',
      ],
    ),
  },
  {
    slug: 'teamwork',
    kind: 'core',
    level: 1,
    order: 3,
    title: { ar: 'العمل ضمن فريق', en: 'Working in a Team' },
    summary: {
      ar: 'كيف يتوزّع العمل، ومن يقرّر ماذا، وماذا تفعل حين لا يلتزم زميل — من دون أن تتحوّل المهمة إلى خلاف.',
      en: 'How work gets divided, who decides what, and what to do when a teammate does not follow through — without the task turning into a dispute.',
    },
    minutes: 25,
    difficulty: 'beginner',
    passMark: 70,
    icon: '🤝',
    requires: ['code-of-conduct-and-reporting'],
    recommends: ['communication-skills'],
    outcomes: o(
      [
        'تحدّد دورك ودور غيرك في الفريق قبل بدء النشاط',
        'تطلب المساعدة في الوقت المناسب بدل تحمّل ما يفوقك',
        'تتعامل مع عضو غير ملتزم بخطوات متدرّجة قبل التصعيد',
        'تشارك في تقييم أداء الفريق بعد النشاط بصدق ومن دون تجريح',
      ],
      [
        'Establish your role and everyone else’s before an activity starts',
        'Ask for help at the right time instead of carrying more than you can',
        'Handle a teammate who is not following through, in steps, before escalating',
        'Take part in an honest post-activity team review without making it personal',
      ],
    ),
  },
  {
    slug: 'working-with-children',
    kind: 'core',
    level: 1,
    order: 4,
    title: { ar: 'حماية الطفل والتعامل الآمن', en: 'Child Safeguarding and Safe Conduct' },
    summary: {
      ar: 'القواعد غير القابلة للتفاوض حين يكون بينك وبين طفل نشاط: الحدود، التصوير، الخصوصية، وماذا تفعل بالضبط إن أفصح لك طفل.',
      en: 'The non-negotiable rules when an activity puts you near a child: boundaries, photography, privacy, and exactly what to do if a child discloses something to you.',
    },
    minutes: 25,
    difficulty: 'beginner',
    passMark: 80,
    icon: '🧒',
    requires: ['code-of-conduct-and-reporting'],
    recommends: ['volunteering-foundations'],
    outcomes: o(
      [
        'تطبّق قاعدة عدم الانفراد بطفل في كل ترتيبات النشاط',
        'تحصل على الموافقة الصحيحة قبل التصوير وتحمي هوية الطفل بعده',
        'تستجيب لإفصاح طفل دون تحقيق ودون وعد بالسرية',
        'تُبلّغ عبر القناة الرسمية خلال المهلة المطلوبة',
      ],
      [
        'Apply the never-alone-with-a-child rule to every arrangement in an activity',
        'Obtain proper consent before photographing and protect a child’s identity afterwards',
        'Respond to a child’s disclosure without investigating and without promising secrecy',
        'Report through the official channel within the required time',
      ],
    ),
  },
  {
    slug: 'digital-basics',
    kind: 'core',
    level: 1,
    order: 5,
    title: { ar: 'المهارات الرقمية وحماية البيانات', en: 'Digital Skills and Data Protection' },
    summary: {
      ar: 'الأدوات التي ستستخدمها فعلاً، وكلمة المرور التي تحمي ملفاً فيه أسماء أطفال، ولماذا لا يذهب أي شيء إلى مجموعة واتساب.',
      en: 'The tools you will actually use, the password protecting a file with children’s names in it, and why nothing goes into a WhatsApp group.',
    },
    minutes: 25,
    difficulty: 'beginner',
    passMark: 70,
    icon: '💻',
    requires: ['code-of-conduct-and-reporting'],
    recommends: [],
    outcomes: o(
      [
        'تنظّم الملفات والمستندات المشتركة بتسمية يفهمها غيرك',
        'تتعرّف على رسالة تصيّد وتتصرّف قبل أن تُدخل كلمة مرورك',
        'تشارك ملفاً يحتوي بيانات مستفيدين بالطريقة الآمنة الوحيدة المقبولة',
        'تحدّد ما لا يجوز تخزينه على جهازك الشخصي ولماذا',
      ],
      [
        'Organise shared files and documents with names another person can follow',
        'Recognise a phishing message and act before entering your password',
        'Share a file containing beneficiary data the one safe way that is acceptable',
        'Identify what must never sit on your personal device, and why',
      ],
    ),
  },
  {
    slug: 'level-1-challenge',
    kind: 'challenge',
    level: 1,
    order: 6,
    title: { ar: 'مراجعة المستوى الأول: يوم تطوّعي كامل', en: 'Level 1 Review: A Full Volunteering Day' },
    summary: {
      ar: 'موقف تطوّعي من الوصول حتى المغادرة. قرارات في التواصل والعمل الجماعي وحماية الطفل والأخلاقيات وحماية البيانات — بلا إجابة واحدة صحيحة دائماً.',
      en: 'A volunteering situation from arrival to departure. Decisions across communication, teamwork, child safeguarding, ethics and data protection — with no single right answer every time.',
    },
    minutes: 25,
    difficulty: 'beginner',
    passMark: 70,
    icon: '🎯',
    requires: [
      'volunteering-foundations',
      'communication-skills',
      'teamwork',
      'working-with-children',
      'digital-basics',
    ],
    recommends: [],
    outcomes: o(
      [
        'تتّخذ قرارات متتابعة في يوم ميداني وتشرح سبب كل قرار',
        'تربط القرار بالمبدأ الذي يحكمه بدل الاعتماد على الحدس',
        'تتعرّف على أثر قرارك على الفريق وعلى المستفيد معاً',
      ],
      [
        'Make a sequence of decisions across a field day and justify each one',
        'Connect a decision to the principle behind it rather than relying on instinct',
        'Recognise the effect of your decision on the team and on the person served, together',
      ],
    ),
  },

  // =================================================================== level 2
  {
    slug: 'life-skills',
    kind: 'core',
    level: 2,
    order: 1,
    title: { ar: 'إدارة الوقت والضغط والرفاه النفسي', en: 'Time, Pressure and Wellbeing' },
    summary: {
      ar: 'كيف تخطّط ليوم ميداني، وكيف تعرف أنك تقترب من الإرهاق قبل أن تصل إليه، وكيف تضع حداً بين التطوّع وحياتك.',
      en: 'How to plan a field day, how to know you are approaching burnout before you arrive at it, and how to keep a line between volunteering and your own life.',
    },
    minutes: 25,
    difficulty: 'intermediate',
    passMark: 70,
    icon: '⏳',
    requires: ['volunteering-foundations'],
    recommends: ['teamwork'],
    outcomes: o(
      [
        'ترتّب أولويات يوم ميداني وتخطّط له بوقت واقعي',
        'تتعرّف على علامات الإرهاق النفسي في نفسك وفي زميل',
        'تطلب الدعم قبل أن يتحوّل التعب إلى انسحاب',
        'تضع حدوداً بين التطوّع والحياة الشخصية وتحافظ عليها',
      ],
      [
        'Prioritise and plan a field day against realistic time',
        'Recognise the signs of burnout in yourself and in a teammate',
        'Ask for support before exhaustion turns into withdrawal',
        'Set boundaries between volunteering and personal life, and keep them',
      ],
    ),
  },
  {
    slug: 'documentation-and-reporting',
    kind: 'core',
    level: 2,
    order: 2,
    title: { ar: 'التوثيق وكتابة التقارير والمحاضر', en: 'Documentation, Reports and Minutes' },
    summary: {
      ar: 'ما جرى فعلاً، مكتوباً بحيث يفهمه شخص لم يحضر — والفرق بين واقعة ورأي، وكيف تُوثّق حادثاً من دون كشف بيانات أحد.',
      en: 'What actually happened, written so somebody who was not there can follow it — the difference between a fact and an opinion, and how to document an incident without exposing anyone’s data.',
    },
    minutes: 25,
    difficulty: 'intermediate',
    passMark: 70,
    icon: '📝',
    requires: ['digital-basics'],
    recommends: ['communication-skills'],
    outcomes: o(
      [
        'تكتب محضر اجتماع يسجّل القرارات والمهام ومن يتولّاها',
        'تفصل الوقائع عن الآراء والتفسيرات في تقرير نشاط',
        'تكتب تقرير حادث كاملاً دون كشف بيانات لا يحتاجها القارئ',
        'تؤرشف الملفات بحيث تُسترجع بعد سنة من دونك',
      ],
      [
        'Write minutes that record decisions, actions and who owns them',
        'Separate facts from opinions and interpretations in an activity report',
        'Write a complete incident report without exposing data the reader does not need',
        'Archive files so they can be found a year later without you',
      ],
    ),
  },
  {
    slug: 'field-safety',
    kind: 'core',
    level: 2,
    order: 3,
    title: { ar: 'السلامة الميدانية والاستعداد للطوارئ', en: 'Field Safety and Emergency Preparedness' },
    summary: {
      ar: 'تقييم المخاطر قبل النشاط لا بعده، ونقطة تجمّع يعرفها الجميع، وحدود ما يجوز لمتطوّع غير مدرّب أن يتدخّل فيه.',
      en: 'Assessing risk before an activity rather than after, an assembly point everyone knows, and the limits of what an untrained volunteer may step into.',
    },
    minutes: 25,
    difficulty: 'intermediate',
    passMark: 80,
    icon: '🦺',
    requires: ['volunteering-foundations'],
    recommends: ['teamwork'],
    outcomes: o(
      [
        'تُجري تقييم مخاطر مكتوباً قبل نشاط وتحدّد إجراء لكل خطر',
        'تضع خطة طوارئ فيها نقطة تجمّع ومسؤول سلامة وطريقة تواصل',
        'تنفّذ إجراء إخلاء وتعرف دورك فيه',
        'تتعرّف على الحالة التي يجب ألّا تتدخّل فيها، وتطلب المختص',
      ],
      [
        'Carry out a written risk assessment before an activity and assign an action to each risk',
        'Build an emergency plan with an assembly point, a safety lead and a way to communicate',
        'Carry out an evacuation and know your part in it',
        'Recognise the situation you must not step into, and call the person who should',
      ],
    ),
  },
  {
    slug: 'media-and-content',
    kind: 'core',
    level: 2,
    order: 4,
    title: { ar: 'الإعلام المسؤول وصناعة المحتوى', en: 'Responsible Media and Content' },
    summary: {
      ar: 'كيف تروي قصة عمل مجتمعي من دون استغلال معاناة أحد، ومن دون تضخيم رقم، ومن دون كشف وجه لا يجوز كشفه.',
      en: 'How to tell the story of community work without exploiting anyone’s suffering, without inflating a number, and without showing a face that must not be shown.',
    },
    minutes: 35,
    difficulty: 'intermediate',
    passMark: 70,
    icon: '📣',
    requires: ['working-with-children'],
    recommends: ['communication-skills'],
    outcomes: o(
      [
        'تحصل على موافقة صحيحة قبل التصوير وتوثّقها',
        'تكتب تعليقاً صادقاً يحفظ كرامة من في الصورة',
        'تتحقّق من معلومة قبل نشرها وترفض تضخيم الأرقام',
        'تميّز بين الحساب الشخصي والحساب الرسمي في ما تنشر وكيف ترد',
      ],
      [
        'Obtain and record proper consent before photographing',
        'Write an honest caption that keeps the dignity of the person in the frame',
        'Verify a claim before publishing it, and refuse to inflate figures',
        'Distinguish a personal account from an official one in what you post and how you reply',
      ],
    ),
  },
  {
    slug: 'first-aid-basics',
    kind: 'core',
    level: 2,
    order: 5,
    title: { ar: 'مبادئ الإسعافات الأولية', en: 'First Aid Principles' },
    summary: {
      ar: 'دورة توعوية: كيف تُؤمّن المكان، وكيف تطلب المساعدة، وما الذي يجب ألّا تفعله. لا تجعلك مسعفاً، ولا تُغني عن تدريب عملي معتمد.',
      en: 'An awareness course: how to make a scene safe, how to call for help, and what you must not do. It does not make you a first aider and does not replace certified hands-on training.',
    },
    minutes: 30,
    difficulty: 'intermediate',
    passMark: 80,
    icon: '🩹',
    requires: ['field-safety'],
    recommends: [],
    outcomes: o(
      [
        'تُقيّم سلامة المكان قبل الاقتراب من مصاب',
        'تطلب خدمات الطوارئ وتعطيها المعلومات التي تحتاجها بالترتيب',
        'تتعرّف على ما يجب ألّا تفعله حتى وصول المختص',
        'تشرح لماذا لا تُغني هذه الدورة عن تدريب عملي معتمد',
      ],
      [
        'Assess whether a scene is safe before approaching an injured person',
        'Call emergency services and give them what they need, in order',
        'Recognise what you must not do until a trained responder arrives',
        'Explain why this course is not a substitute for certified hands-on training',
      ],
    ),
  },
  {
    slug: 'level-2-challenge',
    kind: 'challenge',
    level: 2,
    order: 6,
    title: { ar: 'مراجعة المستوى الثاني: تخطيط يوم ميداني', en: 'Level 2 Review: Planning a Field Day' },
    summary: {
      ar: 'خطّط يوماً ميدانياً كاملاً: جدول، توثيق، محتوى إعلامي، سجل مخاطر — ثم تقع حالة طارئة وترى ما إذا كانت خطتك تصمد.',
      en: 'Plan a whole field day: a schedule, documentation, media content, a risk log — then an emergency happens and you find out whether your plan holds.',
    },
    minutes: 30,
    difficulty: 'intermediate',
    passMark: 70,
    icon: '🎯',
    requires: [
      'life-skills',
      'documentation-and-reporting',
      'field-safety',
      'media-and-content',
      'first-aid-basics',
    ],
    recommends: [],
    outcomes: o(
      [
        'تبني خطة يوم ميداني مكتملة بجدول ومسؤوليات وسجل مخاطر',
        'تتعامل مع حالة طارئة ضمن خطة كتبتها بنفسك',
        'توثّق ما جرى بصيغة يقرأها مشرف لم يحضر',
      ],
      [
        'Build a complete field-day plan with a schedule, responsibilities and a risk log',
        'Handle an emergency inside a plan you wrote yourself',
        'Document what happened in a form a supervisor who was not there can read',
      ],
    ),
  },

  // =================================================================== level 3
  {
    slug: 'team-leadership',
    kind: 'core',
    level: 3,
    order: 1,
    title: { ar: 'قيادة الفرق وتوزيع الأدوار', en: 'Leading Teams and Assigning Roles' },
    summary: {
      ar: 'الفرق بين أن تقود وأن تدير، وكيف تختار الشخص المناسب للمهمة، وكيف تتعامل مع تقصير من دون أن تكسر أحداً.',
      en: 'The difference between leading and managing, how to match a person to a task, and how to address underperformance without breaking anyone.',
    },
    minutes: 35,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🧭',
    requires: ['teamwork'],
    recommends: ['communication-skills'],
    outcomes: o(
      [
        'توزّع الأدوار بناءً على القدرة والتوفّر لا على العلاقة',
        'تُجري Briefing قبل النشاط وDebriefing بعده',
        'تتابع التنفيذ من دون أن تتحوّل المتابعة إلى مراقبة',
        'تعالج التقصير بمحادثة مباشرة موثّقة قبل التصعيد',
      ],
      [
        'Assign roles by capacity and availability rather than by relationship',
        'Run a briefing before an activity and a debriefing after it',
        'Follow up on delivery without the follow-up becoming surveillance',
        'Address underperformance in a direct, documented conversation before escalating',
      ],
    ),
  },
  {
    slug: 'project-management',
    kind: 'core',
    level: 3,
    order: 2,
    title: {
      ar: 'تصميم المبادرات وكتابة مقترحات المشاريع',
      en: 'Designing Initiatives and Writing Proposals',
    },
    summary: {
      ar: 'من فكرة إلى مقترح: تحديد المشكلة، تحليل الاحتياج، هدف قابل للقياس، أنشطة، جدول، ميزانية أولية، ومخاطر مكتوبة.',
      en: 'From an idea to a proposal: defining the problem, analysing need, a measurable objective, activities, a timeline, an initial budget, and written risks.',
    },
    minutes: 45,
    difficulty: 'advanced',
    passMark: 70,
    icon: '📐',
    requires: ['documentation-and-reporting'],
    recommends: ['community-needs'],
    outcomes: o(
      [
        'تحوّل مشكلة ملاحظة إلى بيان مشكلة قابل للعمل عليه',
        'تصوغ هدفاً ونتائج ومخرجات يمكن قياسها',
        'تكتب Concept Note ثم مقترح مشروع مبسّط',
        'تسجّل المخاطر والافتراضات ومؤشرات النجاح قبل البدء',
      ],
      [
        'Turn an observed problem into a problem statement you can work from',
        'Write an objective, outcomes and outputs that can actually be measured',
        'Write a concept note and then a simple project proposal',
        'Record risks, assumptions and success indicators before starting',
      ],
    ),
  },
  {
    slug: 'events-management',
    kind: 'core',
    level: 3,
    order: 3,
    title: { ar: 'تخطيط وتنظيم الفعاليات الآمنة', en: 'Planning and Running Safe Events' },
    summary: {
      ar: 'من الفكرة إلى Run of Show: الجمهور، المكان، الأدوار، التسجيل، الوصول لذوي الإعاقة، السلامة، وخطة بديلة حين يتغيّر شيء.',
      en: 'From an idea to a run of show: audience, venue, roles, registration, disability access, safety, and a fallback for when something changes.',
    },
    minutes: 25,
    difficulty: 'advanced',
    passMark: 70,
    icon: '📅',
    requires: ['field-safety'],
    recommends: ['team-leadership', 'project-management'],
    outcomes: o(
      [
        'تحوّل فكرة فعالية إلى خطة فيها أدوار ومواعيد ولوجستيات',
        'تضمن وصول الأشخاص ذوي الإعاقة في تصميم الفعالية لا كإضافة لاحقة',
        'تدمج السلامة وحماية الطفل في الخطة قبل يوم الفعالية',
        'تكتب Run of Show وخطة بديلة وتقيّم الفعالية بعدها',
      ],
      [
        'Turn an event idea into a plan with roles, timings and logistics',
        'Build disability access into the event design rather than adding it later',
        'Fold safety and child safeguarding into the plan before the day',
        'Write a run of show and a fallback plan, and evaluate the event afterwards',
      ],
    ),
  },
  {
    slug: 'protecting-vulnerable',
    kind: 'core',
    level: 3,
    order: 4,
    title: {
      ar: 'حماية الفئات المعرّضة للخطر والإحالة الآمنة',
      en: 'Protecting People at Risk and Safe Referral',
    },
    summary: {
      ar: 'أبعد من حماية الطفل: كبار السن، ذوو الإعاقة، الناجون من العنف، النازحون، وكل من لا يستطيع أن يقول لا. ومتى تُحيل بدل أن تتصرّف.',
      en: 'Beyond child safeguarding: older people, people with disabilities, survivors of violence, displaced people, and anyone who cannot say no. And when to refer rather than act.',
    },
    minutes: 40,
    difficulty: 'advanced',
    passMark: 80,
    icon: '🫂',
    requires: ['working-with-children'],
    recommends: ['communication-skills'],
    outcomes: o(
      [
        'تتعرّف على مؤشّرات الخطر لدى فئات مختلفة',
        'تُجري إحالة آمنة بموافقة الشخص وضمن حدود السرية',
        'ترفض التحقيق مع الشخص ورفض تقديم وعد لا تستطيع تنفيذه',
        'تحدّد اللحظة التي يجب فيها رفع الحالة للمشرف فوراً',
      ],
      [
        'Recognise risk indicators across different groups of people',
        'Make a safe referral with the person’s consent and within the limits of confidentiality',
        'Decline to investigate, and decline to promise what you cannot deliver',
        'Identify the moment a case must go to a supervisor immediately',
      ],
    ),
  },
  {
    slug: 'community-needs',
    kind: 'core',
    level: 3,
    order: 5,
    title: {
      ar: 'تقييم احتياجات المجتمع والمساءلة المجتمعية',
      en: 'Community Needs Assessment and Accountability',
    },
    summary: {
      ar: 'الفرق بين ما نفترض أن الناس يحتاجونه وما يقولونه هم — وكيف تسأل، وكيف تفتح قناة شكاوى، وكيف تُغلق حلقة الملاحظات.',
      en: 'The gap between what we assume people need and what they say they need — how to ask, how to open a complaints channel, and how to close the feedback loop.',
    },
    minutes: 40,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🔎',
    requires: ['communication-skills'],
    recommends: ['documentation-and-reporting'],
    outcomes: o(
      [
        'تميّز بين الاحتياج المفترض والاحتياج الذي عبّر عنه المجتمع',
        'تختار أداة جمع بيانات مناسبة: مقابلة، مجموعة نقاش، استبيان، ملاحظة',
        'تختار المشاركين بعدالة وتشرح معايير الاستفادة علناً',
        'تفتح قناة شكاوى وتُغلق حلقة الملاحظات بردّ يصل لصاحبها',
      ],
      [
        'Distinguish an assumed need from one a community has actually voiced',
        'Choose a fitting method: interview, focus group, survey, observation',
        'Select participants fairly and state the eligibility criteria openly',
        'Open a complaints channel and close the feedback loop with a reply that reaches the person',
      ],
    ),
  },
  {
    slug: 'level-3-challenge',
    kind: 'challenge',
    level: 3,
    order: 6,
    title: { ar: 'مراجعة المستوى الثالث: بناء مبادرة مجتمعية', en: 'Level 3 Review: Build a Community Initiative' },
    summary: {
      ar: 'من تقييم احتياج إلى مقترح إلى فريق إلى فعالية — مع حالة حماية تظهر في منتصف الطريق وتفرض عليك إحالة.',
      en: 'From a needs assessment to a proposal to a team to an event — with a safeguarding case appearing halfway through that forces a referral.',
    },
    minutes: 50,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🎯',
    requires: [
      'team-leadership',
      'project-management',
      'events-management',
      'protecting-vulnerable',
      'community-needs',
    ],
    recommends: [],
    outcomes: o(
      [
        'تصمّم مبادرة كاملة من الاحتياج حتى التقييم',
        'تتعامل مع حالة حماية أثناء إدارة مشروع قائم',
        'تبرّر كل قرار بالمبدأ والدليل لا بالرأي',
      ],
      [
        'Design a complete initiative from need through to evaluation',
        'Handle a safeguarding case while running an ongoing project',
        'Justify every decision with a principle and evidence rather than an opinion',
      ],
    ),
  },

  // =================================================================== level 4
  {
    slug: 'emotional-intelligence',
    kind: 'core',
    level: 4,
    order: 1,
    title: { ar: 'الذكاء العاطفي وبناء الثقة', en: 'Emotional Intelligence and Building Trust' },
    summary: {
      ar: 'أن تعرف ما تشعر به قبل أن تتصرّف، وأن تتعاطف من دون أن تتجاوز الحدود، وأن تُعيد بناء ثقة انكسرت.',
      en: 'Knowing what you feel before you act, showing empathy without crossing a boundary, and rebuilding trust after it breaks.',
    },
    minutes: 35,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🫀',
    requires: ['teamwork'],
    recommends: ['life-skills'],
    outcomes: o(
      [
        'تتعرّف على انفعالك وتؤجّل الرد حين يلزم',
        'تتعاطف مع شخص من دون أن تعد بما لا تملك',
        'تبني أماناً نفسياً في فريق يسمح بالاعتراف بالخطأ',
        'تعتذر اعتذاراً يُصلح بدل أن يدافع',
      ],
      [
        'Recognise your own reaction and hold a reply when you need to',
        'Show empathy without promising what is not yours to give',
        'Build the psychological safety in a team that makes admitting a mistake possible',
        'Apologise in a way that repairs rather than defends',
      ],
    ),
  },
  {
    slug: 'meetings-and-facilitation',
    kind: 'core',
    level: 4,
    order: 2,
    title: { ar: 'إدارة الاجتماعات والتيسير', en: 'Meetings and Facilitation' },
    summary: {
      ar: 'اجتماع له هدف وجدول ووقت ينتهي فيه — وكيف تمنع شخصاً واحداً من احتلال الغرفة، وكيف تخرج بقرارات لا بانطباعات.',
      en: 'A meeting with a purpose, an agenda and an end time — how to stop one person occupying the room, and how to leave with decisions rather than impressions.',
    },
    minutes: 35,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🗂️',
    requires: ['communication-skills'],
    recommends: ['documentation-and-reporting', 'team-leadership'],
    outcomes: o(
      [
        'تحدّد هدف الاجتماع وتكتب جدول أعمال يخدمه',
        'تُيسّر نقاشاً يشارك فيه الصامتون ولا يحتكره أحد',
        'تلخّص القرارات وتوزّع المهام قبل انتهاء الاجتماع',
        'تُيسّر جلسة مجتمعية بقواعد يتّفق عليها الحاضرون',
      ],
      [
        'Set a meeting’s purpose and write an agenda that serves it',
        'Facilitate a discussion where quiet people speak and nobody monopolises',
        'Summarise decisions and assign actions before the meeting ends',
        'Facilitate a community session under ground rules the room agrees to',
      ],
    ),
  },
  {
    slug: 'negotiation-and-advocacy',
    kind: 'core',
    level: 4,
    order: 3,
    title: { ar: 'التفاوض والمناصرة المجتمعية', en: 'Negotiation and Community Advocacy' },
    summary: {
      ar: 'الفرق بين المصلحة والموقف، وكيف تبني حجّة بالدليل، وكيف تناصر قضية من دون أن تتحدّث باسم أحد لم يفوّضك.',
      en: 'The difference between an interest and a position, how to build an argument on evidence, and how to advocate without speaking for people who did not ask you to.',
    },
    minutes: 40,
    difficulty: 'advanced',
    passMark: 70,
    icon: '⚖️',
    requires: ['communication-skills'],
    recommends: ['community-needs'],
    outcomes: o(
      [
        'تفصل المصالح عن المواقف المعلنة قبل التفاوض',
        'تبني رسالة مناصرة بالدليل وتوجّهها للجهة التي تملك القرار',
        'تدير اعتراضاً وتبحث عن حل يحقّق مصلحة مشتركة',
        'ترفض التحدّث باسم المجتمع من دون مشاركته',
      ],
      [
        'Separate interests from stated positions before negotiating',
        'Build an evidence-based advocacy message aimed at whoever holds the decision',
        'Handle an objection and look for a shared-interest outcome',
        'Refuse to speak for a community that has not been part of the conversation',
      ],
    ),
  },
  {
    slug: 'conflict-resolution',
    kind: 'core',
    level: 4,
    order: 4,
    title: { ar: 'حل النزاعات والوساطة', en: 'Conflict Resolution and Mediation' },
    summary: {
      ar: 'نزاع على مهمّة ونزاع شخصي ليسا الشيء نفسه. كيف تستمع للطرفين، وتخفّض التصعيد، وتوثّق حلاً يصمد.',
      en: 'A dispute about a task and a personal dispute are not the same thing. How to hear both sides, de-escalate, and document a resolution that holds.',
    },
    minutes: 35,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🕊️',
    requires: ['teamwork'],
    recommends: ['emotional-intelligence'],
    outcomes: o(
      [
        'تميّز بين النزاع حول المهام والنزاع الشخصي وتعالج كلاً بطريقته',
        'تفصل الوقائع عن التفسيرات في رواية كل طرف',
        'تخفّض التصعيد وتدير وساطة تنتهي بخطوات عملية',
        'تحدّد متى يتجاوز النزاع صلاحيتك ويجب تحويله للإدارة',
      ],
      [
        'Tell a task dispute from a personal one and handle each on its own terms',
        'Separate facts from interpretations in each side’s account',
        'De-escalate and mediate to an agreement with concrete steps',
        'Recognise when a conflict is past your authority and must go to management',
      ],
    ),
  },
  {
    slug: 'inclusion-and-accessibility',
    kind: 'core',
    level: 4,
    order: 5,
    title: { ar: 'الدمج والتنوّع وإتاحة الوصول', en: 'Inclusion, Diversity and Accessibility' },
    summary: {
      ar: 'من يغيب عن نشاطك من دون أن تلاحظ؟ التحيّز غير الواعي، الترتيبات التيسيرية، واللغة التي تُدخل بدل أن تُقصي.',
      en: 'Who is missing from your activity without your noticing? Unconscious bias, reasonable adjustments, and language that includes rather than excludes.',
    },
    minutes: 35,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🌍',
    requires: ['volunteering-foundations'],
    recommends: ['events-management'],
    outcomes: o(
      [
        'تتعرّف على تحيّز غير واعٍ في قرار اتّخذته أنت',
        'تصمّم نشاطاً متاحاً لذوي الإعاقة ولمن لا يشبهك',
        'تقدّم ترتيباً تيسيرياً من دون أن تجعله استثناءً محرجاً',
        'تُشرك فئات مختلفة في القرار لا في التنفيذ فقط',
      ],
      [
        'Recognise unconscious bias in a decision you made yourself',
        'Design an activity accessible to disabled people and to people unlike you',
        'Offer a reasonable adjustment without making it an awkward exception',
        'Involve different groups in the decision, not only in the delivery',
      ],
    ),
  },
  {
    slug: 'level-4-challenge',
    kind: 'challenge',
    level: 4,
    order: 6,
    title: { ar: 'مراجعة المستوى الرابع: إدارة اجتماع متأزّم', en: 'Level 4 Review: Running a Difficult Meeting' },
    summary: {
      ar: 'اجتماع فيه خلاف قديم، وطرف يفاوض، وشخص لا يُسمع صوته، وقرار مشترك لا بد من الخروج به.',
      en: 'A meeting carrying an old disagreement, a party negotiating, a person nobody is hearing, and a shared decision that has to be reached.',
    },
    minutes: 45,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🎯',
    requires: [
      'emotional-intelligence',
      'meetings-and-facilitation',
      'negotiation-and-advocacy',
      'conflict-resolution',
      'inclusion-and-accessibility',
    ],
    recommends: [],
    outcomes: o(
      [
        'تُيسّر اجتماعاً متأزّماً وتخرج منه بقرار مشترك موثّق',
        'توازن بين التفاوض والوساطة والدمج في موقف واحد',
        'تتعرّف على من غاب صوته وتُعيده إلى النقاش',
      ],
      [
        'Facilitate a tense meeting to a documented shared decision',
        'Balance negotiation, mediation and inclusion within one situation',
        'Notice whose voice is missing and bring it back into the discussion',
      ],
    ),
  },

  // =================================================================== level 5
  {
    slug: 'transformational-leadership',
    kind: 'core',
    level: 5,
    order: 1,
    title: { ar: 'القيادة التحويلية والتكيّفية', en: 'Transformational and Adaptive Leadership' },
    summary: {
      ar: 'قيادة حين لا تكون الصورة واضحة: صياغة رؤية، مواجهة مقاومة، بناء صف ثانٍ، والتمسّك بالقيم تحت الضغط.',
      en: 'Leading when the picture is not clear: shaping a vision, meeting resistance, building a second line of leaders, and holding to values under pressure.',
    },
    minutes: 40,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🌟',
    requires: ['team-leadership'],
    recommends: ['emotional-intelligence'],
    outcomes: o(
      [
        'تصوغ رؤية يفهمها الفريق ويرى نفسه فيها',
        'تقود تغييراً وتتعامل مع المقاومة بدل تجاهلها',
        'تبني صفاً ثانياً من القادة بدل أن يعتمد كل شيء عليك',
        'تحافظ على القيم حين يكون خرقها أسرع',
      ],
      [
        'Shape a vision the team understands and can see itself in',
        'Lead a change and engage resistance rather than ignoring it',
        'Build a second line of leaders instead of everything depending on you',
        'Hold to the values when breaking them would be faster',
      ],
    ),
  },
  {
    slug: 'public-speaking',
    kind: 'core',
    level: 5,
    order: 2,
    title: { ar: 'الخطابة والتواصل المؤثّر', en: 'Public Speaking and Persuasive Communication' },
    summary: {
      ar: 'أن تعرف لمن تتحدّث قبل ماذا تقول، وأن تروي قصة صادقة، وأن تعرض رقماً من دون أن تضخّمه.',
      en: 'Knowing who you are speaking to before what you will say, telling an honest story, and presenting a number without inflating it.',
    },
    minutes: 35,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🎤',
    requires: ['communication-skills'],
    recommends: ['media-and-content'],
    outcomes: o(
      [
        'تبني رسالة تناسب جمهوراً محدّداً وتفتتحها بما يمسّه',
        'تروي قصة تخدم الفكرة وتحفظ كرامة أصحابها',
        'تعرض أرقاماً بصدق وتجيب عن سؤال صعب',
        'تقدّم مشروعاً لشريك أو مانح في وقت محدود',
      ],
      [
        'Build a message for a specific audience and open on what matters to them',
        'Tell a story that serves the point and keeps its subjects’ dignity',
        'Present figures honestly and answer a hard question',
        'Pitch a project to a partner or funder inside a fixed time',
      ],
    ),
  },
  {
    slug: 'community-project-management',
    kind: 'core',
    level: 5,
    order: 3,
    title: {
      ar: 'إدارة المشاريع المجتمعية والميزانية والمخاطر',
      en: 'Community Project Management, Budget and Risk',
    },
    summary: {
      ar: 'دورة حياة مشروع كاملة: نطاق، جدول، ميزانية، سجل مخاطر، إدارة تغيير، وإغلاق يترك دروساً مكتوبة.',
      en: 'A full project lifecycle: scope, timeline, budget, risk log, change control, and a closure that leaves written lessons behind.',
    },
    minutes: 45,
    difficulty: 'advanced',
    passMark: 70,
    icon: '📊',
    requires: ['project-management'],
    recommends: ['documentation-and-reporting'],
    outcomes: o(
      [
        'تحدّد نطاق مشروع وتمنع توسّعه غير المتحكّم فيه',
        'تبني ميزانية واقعية وتدير موارد محدودة',
        'تمسك سجل مخاطر حيّاً وتحدّثه أثناء التنفيذ',
        'تُغلق مشروعاً بتوثيق دروس مستفادة تُقرأ لاحقاً',
      ],
      [
        'Define a project’s scope and stop it expanding uncontrolled',
        'Build a realistic budget and manage limited resources',
        'Keep a risk log alive and update it during delivery',
        'Close a project with lessons documented well enough to be read later',
      ],
    ),
  },
  {
    slug: 'ethical-decision-making',
    kind: 'core',
    level: 5,
    order: 4,
    title: { ar: 'اتّخاذ القرار الأخلاقي وإدارة المخاطر', en: 'Ethical Decision-Making and Risk' },
    summary: {
      ar: 'حين تتعارض السرعة مع الدقّة، والمصلحة مع المبدأ. كيف تقرّر تحت الضغط، وكيف توثّق سبب قرارك.',
      en: 'When speed conflicts with accuracy, and interest with principle. How to decide under pressure, and how to record why you decided.',
    },
    minutes: 40,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🧩',
    requires: ['volunteering-foundations'],
    recommends: ['transformational-leadership'],
    outcomes: o(
      [
        'تحدّد القرار المطلوب فعلاً وتجمع ما يكفي من المعلومات',
        'تُقيّم بدائل وتفهم أثر كل منها على أصحاب المصلحة',
        'تتعرّف على تحيّزاتك في القرار تحت الضغط',
        'توثّق سبب القرار وتراجعه بعد التنفيذ',
      ],
      [
        'Identify the decision actually being asked and gather enough to make it',
        'Weigh alternatives and understand each one’s effect on the people involved',
        'Recognise your own biases when deciding under pressure',
        'Record why you decided, and review it after delivery',
      ],
    ),
  },
  {
    slug: 'monitoring-and-evaluation',
    kind: 'core',
    level: 5,
    order: 5,
    title: {
      ar: 'الرصد والتقييم والتعلّم وقياس الأثر',
      en: 'Monitoring, Evaluation, Learning and Impact',
    },
    summary: {
      ar: 'الفرق بين النشاط والمخرج والنتيجة والأثر — ولماذا تضخيم الأثر يضرّ الجمعية أكثر من رقم متواضع صادق.',
      en: 'The difference between an activity, an output, an outcome and an impact — and why inflating impact costs an organisation more than a modest honest figure.',
    },
    minutes: 45,
    difficulty: 'advanced',
    passMark: 70,
    icon: '📈',
    requires: ['documentation-and-reporting'],
    recommends: ['community-needs'],
    outcomes: o(
      [
        'تميّز بين النشاط والمخرج والنتيجة والأثر في مشروع حقيقي',
        'تختار مؤشّرات كميّة ونوعية وتحدّد خط أساس وهدفاً',
        'تحكم على جودة بيانات جُمعت وترفض ما لا يصلح',
        'تكتب تقرير أثر مختصراً وصادقاً لا يضخّم',
      ],
      [
        'Tell activity from output from outcome from impact in a real project',
        'Choose quantitative and qualitative indicators with a baseline and a target',
        'Judge the quality of collected data and reject what will not hold',
        'Write a short, honest impact report that does not inflate',
      ],
    ),
  },
  {
    slug: 'level-5-challenge',
    kind: 'challenge',
    level: 5,
    order: 6,
    title: { ar: 'مراجعة المستوى الخامس: قيادة مشروع', en: 'Level 5 Review: Leading a Project' },
    summary: {
      ar: 'مشروع يفرض قراراً أخلاقياً، وإدارة مخاطر، وميزانية لا تكفي، وخطاباً لشريك، ومؤشّرات أثر لا يمكن تضخيمها.',
      en: 'A project forcing an ethical decision, risk management, a budget that does not stretch, a pitch to a partner, and impact indicators you cannot inflate.',
    },
    minutes: 50,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🎯',
    requires: [
      'transformational-leadership',
      'public-speaking',
      'community-project-management',
      'ethical-decision-making',
      'monitoring-and-evaluation',
    ],
    recommends: [],
    outcomes: o(
      [
        'تقود مشروعاً من التصميم حتى قياس الأثر',
        'تتّخذ قراراً أخلاقياً تحت ضغط الوقت وتوثّق سببه',
        'تعرض النتائج على شريك بصدق يشمل ما لم ينجح',
      ],
      [
        'Lead a project from design through to impact measurement',
        'Make an ethical decision under time pressure and record the reasoning',
        'Present results to a partner honestly, including what did not work',
      ],
    ),
  },

  // =================================================================== level 6
  {
    slug: 'volunteer-lifecycle',
    kind: 'core',
    level: 6,
    order: 1,
    title: {
      ar: 'الإدارة المتقدّمة لدورة حياة المتطوّع',
      en: 'Advanced Volunteer Lifecycle Management',
    },
    summary: {
      ar: 'من الاستقطاب إلى الوداع: كيف تختار، وتُهيّئ، وتُشرف، وتُقدّر، وكيف تُنهي علاقة تطوّعية باحترام.',
      en: 'From recruitment to farewell: selecting, onboarding, supervising, recognising — and how to end a volunteering relationship with respect.',
    },
    minutes: 45,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🔄',
    requires: ['team-leadership'],
    recommends: ['inclusion-and-accessibility'],
    outcomes: o(
      [
        'تكتب وصف دور تطوّعي واضح يُستخدم في الاستقطاب والتقييم معاً',
        'تصمّم تهيئة تجعل المتطوّع الجديد نافعاً وآمناً من أسبوعه الأول',
        'تبني نظام تقدير لا يعتمد على العلاقات الشخصية',
        'تُنهي علاقة تطوّعية باحترام وتوثيق وسبب مفهوم',
      ],
      [
        'Write a volunteer role description usable for both recruitment and review',
        'Design an onboarding that makes a new volunteer useful and safe in their first week',
        'Build recognition that does not run on personal relationships',
        'End a volunteering relationship with respect, documentation and a reason that makes sense',
      ],
    ),
  },
  {
    slug: 'sustainability-and-resources',
    kind: 'core',
    level: 6,
    order: 2,
    title: { ar: 'الاستدامة وتعبئة الموارد', en: 'Sustainability and Resource Mobilisation' },
    summary: {
      ar: 'كيف يستمرّ الأثر بعد انتهاء التمويل: تنويع المصادر، الموارد المحلية، التطوّع المهني، وخطة استدامة مكتوبة.',
      en: 'How impact continues after funding ends: diversifying sources, local resources, skilled volunteering, and a written sustainability plan.',
    },
    minutes: 40,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🌱',
    requires: ['community-project-management'],
    recommends: [],
    outcomes: o(
      [
        'تميّز بين الاستدامة المالية والبشرية والتشغيلية',
        'تعبّئ موارد محلية وعينية بدل الاعتماد على مانح واحد',
        'تبني خطة استدامة تُبقي الأثر بعد انتهاء المشروع',
        'تجمع الدعم بطريقة أخلاقية لا تَعِد بما لا يُنفَّذ',
      ],
      [
        'Distinguish financial, human and operational sustainability',
        'Mobilise local and in-kind resources rather than depending on one funder',
        'Build a sustainability plan that keeps impact alive after a project ends',
        'Raise support ethically, without promising what cannot be delivered',
      ],
    ),
  },
  {
    slug: 'partnerships',
    kind: 'core',
    level: 6,
    order: 3,
    title: { ar: 'بناء الشراكات وإدارتها', en: 'Building and Managing Partnerships' },
    summary: {
      ar: 'شراكة تقوم على مصلحة مشتركة مكتوبة، لا على علاقة شخصية — وكيف تُنهيها من دون أن تحرق جسراً.',
      en: 'A partnership built on a written shared interest rather than a personal relationship — and how to end one without burning a bridge.',
    },
    minutes: 40,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🔗',
    requires: ['negotiation-and-advocacy'],
    recommends: ['sustainability-and-resources'],
    outcomes: o(
      [
        'تحلّل مصلحة مشتركة قبل عرض شراكة',
        'تكتب مذكّرة تفاهم تحدّد الأدوار والالتزامات',
        'تدير توقّعات الشريك وتتعامل مع تضارب المصالح',
        'تُقيّم شراكة وتُنهيها مع الحفاظ على العلاقة',
      ],
      [
        'Analyse a shared interest before proposing a partnership',
        'Write a memorandum of understanding that fixes roles and commitments',
        'Manage a partner’s expectations and handle a conflict of interest',
        'Evaluate a partnership and end it while keeping the relationship',
      ],
    ),
  },
  {
    slug: 'training-of-trainers',
    kind: 'core',
    level: 6,
    order: 4,
    title: { ar: 'تدريب المدرّبين وإدارة المعرفة', en: 'Training of Trainers and Knowledge Management' },
    summary: {
      ar: 'كيف يتعلّم الكبار، وكيف تصمّم جلسة لها هدف قابل للقياس، وكيف تنقل خبرة الجمعية بحيث لا تخرج مع من يخرج.',
      en: 'How adults learn, how to design a session with a measurable objective, and how to move an organisation’s experience so it does not leave with whoever leaves.',
    },
    minutes: 45,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🎓',
    requires: ['meetings-and-facilitation'],
    recommends: ['documentation-and-reporting'],
    outcomes: o(
      [
        'تحدّد احتياجاً تدريبياً وتكتب أهدافاً تعليمية قابلة للقياس',
        'تصمّم جلسة بأنشطة تناسب تعلّم الكبار وتديرها في وقتها',
        'تُقيّم التعلّم لا الرضا فقط، وتقدّم ملاحظات مفيدة',
        'توثّق الخبرة وتبني مكتبة موارد تُستخدم فعلاً',
      ],
      [
        'Identify a training need and write measurable learning objectives',
        'Design a session with activities suited to adult learning and run it to time',
        'Evaluate learning rather than only satisfaction, and give useful feedback',
        'Document experience and build a resource library people actually use',
      ],
    ),
  },
  {
    slug: 'governance-and-accountability',
    kind: 'core',
    level: 6,
    order: 5,
    title: { ar: 'الحوكمة والشفافية والمساءلة', en: 'Governance, Transparency and Accountability' },
    summary: {
      ar: 'من يقرّر ماذا، وبأي صلاحية، وبأي سجل — وكيف تحفظ جمعية ثقة مجتمعها حين لا يكون أحد ينظر.',
      en: 'Who decides what, under whose authority, and on what record — and how an organisation keeps its community’s trust when nobody is watching.',
    },
    minutes: 45,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🏛️',
    requires: ['ethical-decision-making'],
    recommends: ['volunteer-lifecycle'],
    outcomes: o(
      [
        'تميّز بين دور مجلس الإدارة والإدارة التنفيذية',
        'تقرأ سياسة وتعرف ما تُلزمك به عملياً',
        'تتعرّف على تضارب مصالح وتُفصح عنه قبل أن يصبح مشكلة',
        'تشرح كيف تحمي الشفافية المالية والسجلات ثقة المجتمع',
      ],
      [
        'Distinguish the board’s role from the executive’s',
        'Read a policy and know what it actually obliges you to do',
        'Recognise a conflict of interest and declare it before it becomes a problem',
        'Explain how financial transparency and record-keeping protect a community’s trust',
      ],
    ),
  },
  {
    slug: 'level-6-challenge',
    kind: 'challenge',
    level: 6,
    order: 6,
    title: { ar: 'مراجعة المستوى السادس: نظام تطوّع مستدام', en: 'Level 6 Review: A Sustainable Volunteering System' },
    summary: {
      ar: 'صمّم نظاماً كاملاً: دورة حياة المتطوّع، الموارد، الشراكات، التدريب، والحوكمة التي تُبقيه قائماً بعدك.',
      en: 'Design a complete system: the volunteer lifecycle, resources, partnerships, training, and the governance that keeps it standing after you.',
    },
    minutes: 55,
    difficulty: 'advanced',
    passMark: 70,
    icon: '🎯',
    requires: [
      'volunteer-lifecycle',
      'sustainability-and-resources',
      'partnerships',
      'training-of-trainers',
      'governance-and-accountability',
    ],
    recommends: [],
    outcomes: o(
      [
        'تبني نظام تطوّع متكاملاً من الاستقطاب حتى الحوكمة',
        'تربط الاستدامة والشراكات والتدريب في خطة واحدة متماسكة',
        'تصمّم ما يستمر من دونك وتشرح كيف',
      ],
      [
        'Build an integrated volunteering system from recruitment through to governance',
        'Connect sustainability, partnerships and training into one coherent plan',
        'Design something that runs without you, and explain how',
      ],
    ),
  },

  // ================================================================= electives
  {
    slug: 'professional-identity',
    kind: 'elective',
    level: null,
    order: 1,
    title: { ar: 'الهوية المهنية وبناء ملف المتطوّع', en: 'Professional Identity and Your Volunteer Profile' },
    summary: {
      ar: 'كيف تحوّل ما فعلته تطوّعاً إلى سيرة يفهمها صاحب عمل، من دون تضخيم ومن دون تقليل.',
      en: 'Turning what you did as a volunteer into something an employer understands — without inflating it and without underselling it.',
    },
    minutes: 30,
    difficulty: 'beginner',
    passMark: 70,
    icon: '🪪',
    requires: [],
    recommends: ['volunteering-foundations'],
    outcomes: o(
      [
        'تصف خبرتك التطوّعية بمهارات قابلة للتحقّق',
        'تبني ملفاً مهنياً يعرض ما فعلته فعلاً',
        'تطلب تزكية وتستخدم شهاداتك بطريقة صحيحة',
      ],
      [
        'Describe your volunteering experience as verifiable skills',
        'Build a professional profile that shows what you actually did',
        'Ask for a reference and use your certificates correctly',
      ],
    ),
  },
  {
    slug: 'psychological-first-aid',
    kind: 'elective',
    level: null,
    order: 2,
    title: { ar: 'الإسعاف النفسي الأوّلي والعناية الذاتية', en: 'Psychological First Aid and Self-Care' },
    summary: {
      ar: 'كيف تكون حاضراً لشخص في ضائقة من دون أن تتحوّل إلى معالج — وكيف تعتني بنفسك بعد ذلك.',
      en: 'How to be present for someone in distress without becoming their therapist — and how to look after yourself afterwards.',
    },
    minutes: 35,
    difficulty: 'intermediate',
    passMark: 80,
    icon: '💗',
    requires: ['code-of-conduct-and-reporting'],
    recommends: ['protecting-vulnerable'],
    outcomes: o(
      [
        'تطبّق مبادئ الإسعاف النفسي الأوّلي: أنصت، احمِ، اربط',
        'تتعرّف على حدودك وترفض الدخول في دور المعالج',
        'تُحيل إلى دعم متخصّص بطريقة آمنة',
        'تعتني بنفسك بعد التعرّض لموقف صعب',
      ],
      [
        'Apply the principles of psychological first aid: listen, protect, connect',
        'Recognise your limits and refuse to step into a therapist’s role',
        'Refer to specialist support safely',
        'Look after yourself after exposure to a difficult situation',
      ],
    ),
  },
  {
    slug: 'environmental-volunteering',
    kind: 'elective',
    level: null,
    order: 3,
    title: { ar: 'التطوّع البيئي والعمل المناخي', en: 'Environmental Volunteering and Climate Action' },
    summary: {
      ar: 'عمل بيئي يقيس أثره بدل أن يفترضه، ويشرك المجتمع بدل أن ينظّف مكانه ويغادر.',
      en: 'Environmental work that measures its effect rather than assuming it, and involves a community rather than tidying its space and leaving.',
    },
    minutes: 30,
    difficulty: 'beginner',
    passMark: 70,
    icon: '🌿',
    requires: [],
    recommends: ['community-needs'],
    outcomes: o(
      [
        'تصمّم نشاطاً بيئياً له أثر قابل للقياس',
        'تُشرك المجتمع المحلي في التخطيط لا في اليوم فقط',
        'تربط النشاط البيئي بالاحتياج المحلي الفعلي',
      ],
      [
        'Design an environmental activity with a measurable effect',
        'Involve the local community in the planning, not only on the day',
        'Connect environmental activity to an actual local need',
      ],
    ),
  },
  {
    slug: 'ethical-fundraising',
    kind: 'elective',
    level: null,
    order: 4,
    title: { ar: 'جمع الدعم والتبرّعات بطريقة أخلاقية', en: 'Ethical Fundraising' },
    summary: {
      ar: 'كيف تطلب دعماً من دون استغلال صورة أحد، ومن دون وعد لا تملك تنفيذه، ومع سجل يعرف الجميع أين ذهب المال.',
      en: 'How to ask for support without exploiting anyone’s image, without a promise you cannot keep, and with a record that shows where the money went.',
    },
    minutes: 35,
    difficulty: 'intermediate',
    passMark: 70,
    icon: '🤍',
    requires: [],
    recommends: ['media-and-content', 'governance-and-accountability'],
    outcomes: o(
      [
        'تكتب طلب دعم صادقاً لا يستغلّ معاناة أحد',
        'ترفض الوعود غير المؤكّدة في حملة جمع تبرّعات',
        'توثّق التبرّعات وتُبلّغ الداعمين بما جرى فعلاً',
      ],
      [
        'Write an honest funding request that does not exploit anyone’s suffering',
        'Refuse unverified promises in a fundraising campaign',
        'Record donations and tell supporters what actually happened',
      ],
    ),
  },
];

/** Slugs that already carry real user progress and must never be renamed. */
export const SLUGS_WITH_HISTORY = [
  'volunteering-foundations',
  'communication-skills',
  'teamwork',
  'working-with-children',
  'digital-basics',
] as const;

export function courseBySlug(slug: string): CourseDef | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function coursesInLevel(level: number): CourseDef[] {
  return COURSES.filter((c) => c.level === level).sort((a, b) => a.order - b.order);
}

export function electives(): CourseDef[] {
  return COURSES.filter((c) => c.kind === 'elective').sort((a, b) => a.order - b.order);
}

export const ORIENTATION_SLUG = 'code-of-conduct-and-reporting';
