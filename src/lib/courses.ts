import type { Locale } from './i18n';

export type CourseStatus = 'available' | 'draft' | 'soon';

/**
 * How hard the course is, not how long. A volunteer choosing between two
 * courses needs to know which one assumes things they may not know yet.
 */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type CategoryKey =
  | 'foundations'
  | 'people'
  | 'leadership'
  | 'projects'
  | 'community'
  | 'media'
  | 'digital';

export type Course = {
  slug: string;
  level: number;
  category: CategoryKey;
  status: CourseStatus;
  difficulty: Difficulty;
  /** Measured from the Arabic text. See the note in the content files. */
  minutes: number;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;

  /**
   * Courses that must be passed first. Empty means empty — a prerequisite is
   * a locked door, and one invented for tidiness turns a volunteer away from
   * a course they could have taken today.
   */
  requires: string[];
  /** Suggested, not enforced. The course works without it; it lands better with it. */
  recommends: string[];

  /** Who it is written for, in their own words. */
  audience: Record<Locale, string[]>;
  /** What a volunteer walks away holding. */
  outcomes: Record<Locale, string[]>;

  /** An emoji rather than an icon font: no request, no licence, renders in both scripts. */
  icon: string;
};

export const CATEGORIES: Record<CategoryKey, Record<Locale, string>> = {
  foundations: { ar: 'أساسيات التطوّع', en: 'Volunteering foundations' },
  people: { ar: 'المهارات الشخصية', en: 'Personal skills' },
  leadership: { ar: 'القيادة والعمل الجماعي', en: 'Leadership and teamwork' },
  projects: { ar: 'إدارة المبادرات', en: 'Running initiatives' },
  community: { ar: 'العمل الإنساني والمجتمعي', en: 'Humanitarian and community work' },
  media: { ar: 'الإعلام وصناعة المحتوى', en: 'Media and content' },
  digital: { ar: 'المهارات الرقمية', en: 'Digital skills' },
};

export const DIFFICULTY_LABEL: Record<Difficulty, Record<Locale, string>> = {
  beginner: { ar: 'مبتدئ', en: 'Beginner' },
  intermediate: { ar: 'متوسّط', en: 'Intermediate' },
  advanced: { ar: 'متقدّم', en: 'Advanced' },
};

/**
 * Takaful Academy catalogue.
 *
 * Content is universal — written for any volunteer in any organisation — with
 * examples drawn from the kind of work this association actually does.
 *
 * The five published courses each carry six modules and six or seven scenario
 * questions. Their minutes are measured from the Arabic text rather than
 * aspired to, and must match the figure in the course's own content file;
 * probe-courses fails if they drift apart, because the card and the course are
 * read by the same person.
 *
 * The rest are listed with real metadata and a status of `soon`. They are a
 * roadmap, not a promise of content that exists: a volunteer can see where the
 * academy is going without being sent to an empty page. Writing seven more
 * courses of humanitarian training is a commission, not a code change.
 */
export const COURSES: Course[] = [
  /*
   * The orientation.
   *
   * This catalogue and src/lib/programme/definition.ts both describe the
   * academy right now: this one drives the public pages, that one drives the
   * programme, the gate and the learner dashboard. Adding the orientation to
   * only one of them is what the courses probe caught — the public academy
   * would not have listed the one course every volunteer must take first.
   *
   * The duplication is temporary and tracked: the public pages move onto the
   * programme definition once the remaining courses are written, and this file
   * goes with them. Until then, an entry added here must be added there too.
   */
  {
    slug: 'code-of-conduct-and-reporting',
    level: 1,
    category: 'foundations',
    status: 'available',
    difficulty: 'beginner',
    minutes: 30,
    icon: '🛡️',
    title: {
      ar: 'مدوّنة السلوك والحماية وآلية الإبلاغ',
      en: 'Code of Conduct, Safeguarding and Reporting',
    },
    summary: {
      ar: 'الدورة التي تُفتح قبل كل شيء آخر. ما يُنتظر منك، أين تقف حدودك، كيف تحمي من تخدمهم وتحمي نفسك، ومتى وكيف تُبلّغ.',
      en: 'The course that opens before anything else. What is expected of you, where your limits are, how to protect the people you serve and yourself, and when and how to report.',
    },
    requires: [],
    recommends: [],
    audience: {
      ar: [
        'كل متطوّع قبل أي نشاط ميداني',
        'من سيعمل مع الأطفال أو الفئات المعرّضة للخطر',
        'قادة الفرق ومنسّقو الأنشطة',
      ],
      en: [
        'Every volunteer, before any field activity',
        'Anyone who will work with children or people at risk',
        'Team leaders and activity coordinators',
      ],
    },
    outcomes: {
      ar: [
        'شهادة إتمام برمز تحقّق عام',
        'فتح المستوى الأول من مسار المتطوّع',
        'معرفة اسم ورقم من تُبلّغه فعلياً',
      ],
      en: [
        'A certificate with a public verification code',
        'Level 1 of the volunteer path unlocked',
        'The actual name and number of the person you report to',
      ],
    },
  },

  // ---------------------------------------------------------------- level 1
  {
    slug: 'volunteering-foundations',
    level: 1,
    category: 'foundations',
    status: 'available',
    difficulty: 'beginner',
    minutes: 30,
    icon: '🌱',
    title: {
      ar: 'أساسيات العمل التطوعي',
      en: 'Foundations of Volunteering',
    },
    summary: {
      ar: 'ما هو التطوّع، ولماذا نقوم به، وما المبادئ التي تحكمه — وكيف تحمي نفسك ومَن تخدمهم منذ يومك الأول.',
      en: 'What volunteering is, why we do it, the principles that govern it — and how to protect yourself and those you serve from day one.',
    },
    requires: [],
    recommends: [],
    audience: {
      ar: ['المتطوّعون الجدد', 'من يفكّر في التطوّع ولم يبدأ بعد', 'أعضاء الفرق الشبابية'],
      en: ['New volunteers', 'Anyone considering volunteering', 'Members of youth teams'],
    },
    outcomes: {
      ar: ['شهادة إتمام برمز تحقّق عام', 'توثيق الدورة في ملفك الشخصي', 'احتسابها ضمن مسار المتطوّع'],
      en: ['A certificate with a public verification code', 'The course recorded on your profile', 'Credit towards your volunteer journey'],
    },
  },
  {
    slug: 'level-1-challenge',
    level: 1,
    category: 'foundations',
    status: 'available',
    difficulty: 'beginner',
    minutes: 25,
    icon: '🎯',
    title: {
      ar: 'تحدّي المستوى الأول: يوم تطوّعي كامل',
      en: 'Level 1 Challenge: A Full Volunteering Day',
    },
    summary: {
      ar: 'يوم واحد من الوصول حتى المغادرة. كل قرار يحتاج أكثر من دورة واحدة ممّا تعلّمته، ولا يوجد دائماً خيار مريح.',
      en: 'One day, from arrival to departure. Every decision needs more than one of the courses behind it, and there is not always a comfortable option.',
    },
    // The five courses of level 1. This is the door to level 2, so the
    // prerequisite list is the whole level and not a selection from it.
    requires: [
      'volunteering-foundations',
      'communication-skills',
      'teamwork',
      'working-with-children',
      'digital-basics',
    ],
    recommends: [],
    audience: {
      ar: [
        'من أنهى دورات المستوى الأول الخمس',
        'المتطوّعون المقبلون على أول نشاط ميداني',
        'من يريد أن يعرف ما إذا كان ما تعلّمه صار قراراً',
      ],
      en: [
        'Anyone who has finished the five level 1 courses',
        'Volunteers about to do their first field activity',
        'Anyone wanting to know whether what they learned has become decisions',
      ],
    },
    outcomes: {
      ar: ['شهادة المستوى الأول', 'فتح المستوى الثاني', 'تقرير بما تحتاج مراجعته'],
      en: ['The level 1 certificate', 'Level 2 unlocked', 'A report of what you need to revise'],
    },
  },
  {
    slug: 'communication-skills',
    level: 1,
    category: 'people',
    status: 'available',
    difficulty: 'beginner',
    minutes: 25,
    icon: '💬',
    title: { ar: 'مهارات التواصل', en: 'Communication Skills' },
    summary: {
      ar: 'الإصغاء الفعّال، التواصل مع الفئات المختلفة، والتعامل مع المواقف الصعبة.',
      en: 'Active listening, communicating across different groups, and handling difficult conversations.',
    },
    requires: [],
    recommends: ['volunteering-foundations'],
    audience: {
      ar: ['المتطوّعون في العمل الميداني', 'من يتعامل مع الأهالي والمستفيدين', 'منسّقو الأنشطة'],
      en: ['Volunteers working in the field', 'Anyone dealing with families and beneficiaries', 'Activity coordinators'],
    },
    outcomes: {
      ar: ['شهادة إتمام برمز تحقّق عام', 'توثيق الدورة في ملفك الشخصي', 'احتسابها ضمن مسار المتطوّع'],
      en: ['A certificate with a public verification code', 'The course recorded on your profile', 'Credit towards your volunteer journey'],
    },
  },
  {
    slug: 'teamwork',
    level: 1,
    category: 'leadership',
    status: 'available',
    difficulty: 'beginner',
    minutes: 25,
    icon: '🤝',
    title: { ar: 'العمل ضمن فريق', en: 'Teamwork' },
    summary: {
      ar: 'الأدوار داخل الفريق، التنسيق، وحلّ الخلافات قبل أن تكبر.',
      en: 'Roles within a team, coordination, and resolving friction before it grows.',
    },
    requires: [],
    recommends: ['volunteering-foundations'],
    audience: {
      ar: ['كل من يعمل ضمن فريق تطوّعي', 'قادة الفرق الجدد', 'المتطوّعون في الأنشطة الجماعية'],
      en: ['Anyone working in a volunteer team', 'New team leads', 'Volunteers on group activities'],
    },
    outcomes: {
      ar: ['شهادة إتمام برمز تحقّق عام', 'توثيق الدورة في ملفك الشخصي', 'احتسابها ضمن مسار المتطوّع'],
      en: ['A certificate with a public verification code', 'The course recorded on your profile', 'Credit towards your volunteer journey'],
    },
  },
  {
    slug: 'working-with-children',
    level: 1,
    category: 'community',
    // Publishable now that ORG.safeguardingFocalPoint names someone: the course
    // tells trainees four times to report a disclosure, and it can finally say
    // to whom. The number is the association's main line rather than a direct
    // one, which is a compromise worth revisiting.
    status: 'available',
    difficulty: 'beginner',
    minutes: 25,
    icon: '🛡️',
    title: { ar: 'التعامل مع الأطفال', en: 'Working with Children' },
    summary: {
      ar: 'مبادئ حماية الطفل، الحدود الآمنة، والإبلاغ — وفق المعايير الدولية.',
      en: 'Child safeguarding principles, safe boundaries, and reporting — to international standards.',
    },
    requires: [],
    recommends: ['volunteering-foundations'],
    audience: {
      ar: [
        'كل متطوّع يقترب من الأطفال بأي شكل',
        'المشرفون على الأنشطة الترفيهية والتعليمية',
        'فرق التوزيع والفعاليات العائلية',
      ],
      en: [
        'Every volunteer who comes near children in any way',
        'Supervisors of recreational and educational activities',
        'Distribution and family-event teams',
      ],
    },
    outcomes: {
      ar: [
        'شهادة إتمام برمز تحقّق عام',
        'معرفة من تبلّغ وكيف، قبل أن تحتاج ذلك',
        'احتسابها ضمن مسار المتطوّع',
      ],
      en: [
        'A certificate with a public verification code',
        'Knowing who to report to and how, before you need it',
        'Credit towards your volunteer journey',
      ],
    },
  },
  {
    slug: 'digital-basics',
    level: 1,
    category: 'digital',
    status: 'available',
    difficulty: 'beginner',
    minutes: 25,
    icon: '💻',
    title: { ar: 'المهارات الرقمية الأساسية', en: 'Digital Basics for Volunteers' },
    summary: {
      ar: 'الأدوات التي يحتاجها كل متطوّع للتوثيق والتنسيق وحماية بيانات الناس.',
      en: 'The tools every volunteer needs for documentation, coordination, and protecting people’s data.',
    },
    requires: [],
    recommends: [],
    audience: {
      ar: ['من يتولّى التوثيق والتقارير', 'منسّقو الفرق', 'كل متطوّع يحمل بيانات مستفيدين'],
      en: ['Anyone handling documentation and reports', 'Team coordinators', 'Every volunteer who holds beneficiary data'],
    },
    outcomes: {
      ar: ['شهادة إتمام برمز تحقّق عام', 'توثيق الدورة في ملفك الشخصي', 'احتسابها ضمن مسار المتطوّع'],
      en: ['A certificate with a public verification code', 'The course recorded on your profile', 'Credit towards your volunteer journey'],
    },
  },

  // ---------------------------------------------------------------- level 2
  {
    slug: 'events-management',
    level: 2,
    category: 'projects',
    status: 'soon',
    difficulty: 'intermediate',
    minutes: 30,
    icon: '📅',
    title: { ar: 'تنظيم الفعاليات والأنشطة', en: 'Organising Events and Activities' },
    summary: {
      ar: 'من الفكرة إلى يوم التنفيذ: التخطيط، الأدوار، اللوجستيات، وما يجب أن يكون جاهزاً قبل وصول أول مشارك.',
      en: 'From an idea to the day itself: planning, roles, logistics, and what has to be ready before the first participant arrives.',
    },
    requires: [],
    recommends: ['teamwork', 'volunteering-foundations'],
    audience: {
      ar: ['منسّقو الأنشطة', 'قادة الفرق', 'من يتولّى تنظيم فعالية للمرة الأولى'],
      en: ['Activity coordinators', 'Team leads', 'Anyone organising an event for the first time'],
    },
    outcomes: {
      ar: ['شهادة إتمام برمز تحقّق عام', 'قائمة تحقّق قابلة للاستخدام في أي فعالية'],
      en: ['A certificate with a public verification code', 'A checklist you can use on any event'],
    },
  },
  {
    slug: 'project-management',
    level: 2,
    category: 'projects',
    status: 'soon',
    difficulty: 'intermediate',
    minutes: 35,
    icon: '🧭',
    title: { ar: 'إدارة المبادرات المجتمعية', en: 'Managing Community Initiatives' },
    summary: {
      ar: 'كيف تتحوّل فكرة إلى مبادرة لها هدف وخطة وميزانية وطريقة لقياس أثرها.',
      en: 'How an idea becomes an initiative with an aim, a plan, a budget, and a way of measuring what it changed.',
    },
    requires: [],
    recommends: ['events-management'],
    audience: {
      ar: ['من يقود مبادرة أو ينوي إطلاقها', 'منسّقو المشاريع', 'قادة الفرق'],
      en: ['Anyone leading or planning an initiative', 'Project coordinators', 'Team leads'],
    },
    outcomes: {
      ar: ['شهادة إتمام برمز تحقّق عام', 'إطار عمل لكتابة مبادرة من الصفر'],
      en: ['A certificate with a public verification code', 'A framework for writing an initiative from scratch'],
    },
  },
  {
    slug: 'life-skills',
    level: 2,
    category: 'people',
    status: 'soon',
    difficulty: 'intermediate',
    minutes: 30,
    icon: '🌤️',
    title: { ar: 'مهارات الحياة للمتطوّع', en: 'Life Skills for Volunteers' },
    summary: {
      ar: 'إدارة الوقت، ضغط العمل الميداني، الإرهاق النفسي، وكيف تحافظ على نفسك لتستمرّ.',
      en: 'Managing time, the pressure of field work, burnout, and how to look after yourself so that you last.',
    },
    requires: [],
    recommends: ['volunteering-foundations'],
    audience: {
      ar: ['المتطوّعون المستمرّون', 'من يعمل في بيئات ضاغطة', 'قادة الفرق المسؤولون عن غيرهم'],
      en: ['Long-term volunteers', 'Anyone working in demanding settings', 'Team leads responsible for others'],
    },
    outcomes: {
      ar: ['شهادة إتمام برمز تحقّق عام', 'أدوات عملية للتعامل مع الضغط والإرهاق'],
      en: ['A certificate with a public verification code', 'Practical tools for pressure and burnout'],
    },
  },
  {
    slug: 'media-and-content',
    level: 2,
    category: 'media',
    status: 'soon',
    difficulty: 'intermediate',
    minutes: 30,
    icon: '📷',
    title: { ar: 'الإعلام وصناعة المحتوى للجمعيات', en: 'Media and Content for Associations' },
    summary: {
      ar: 'كيف تروي قصة عمل الجمعية بكرامة: التصوير بموافقة، الكتابة الصادقة، والنشر الذي لا يضرّ أحداً.',
      en: 'Telling the story of the work with dignity: photographing with consent, writing honestly, and publishing in a way that harms nobody.',
    },
    requires: [],
    recommends: ['working-with-children', 'digital-basics'],
    audience: {
      ar: ['فريق الإعلام والتواصل', 'من يصوّر الأنشطة', 'من يكتب عن عمل الجمعية'],
      en: ['Communications teams', 'Anyone photographing activities', 'Anyone writing about the work'],
    },
    outcomes: {
      ar: ['شهادة إتمام برمز تحقّق عام', 'قواعد واضحة للتصوير والنشر والموافقة'],
      en: ['A certificate with a public verification code', 'Clear rules on photography, publication and consent'],
    },
  },

  // ---------------------------------------------------------------- level 3
  {
    slug: 'community-needs',
    level: 3,
    category: 'community',
    status: 'soon',
    difficulty: 'advanced',
    minutes: 35,
    icon: '🔍',
    title: { ar: 'فهم احتياجات المجتمع', en: 'Understanding Community Needs' },
    summary: {
      ar: 'كيف تعرف ما يحتاجه الناس فعلاً بدل ما نظنّ أنهم يحتاجونه — الاستماع، والتقييم، وتجنّب الضرر.',
      en: 'How to learn what people actually need rather than what we assume — listening, assessment, and avoiding harm.',
    },
    requires: [],
    recommends: ['communication-skills', 'project-management'],
    audience: {
      ar: ['منسّقو المشاريع', 'فرق التقييم الميداني', 'من يخطّط لمبادرة جديدة'],
      en: ['Project coordinators', 'Field assessment teams', 'Anyone planning a new initiative'],
    },
    outcomes: {
      ar: ['شهادة إتمام برمز تحقّق عام', 'طريقة منظّمة لتقييم حاجة قبل الاستجابة لها'],
      en: ['A certificate with a public verification code', 'A structured way to assess a need before responding to it'],
    },
  },
  {
    slug: 'partnerships',
    level: 3,
    category: 'projects',
    status: 'soon',
    difficulty: 'advanced',
    minutes: 30,
    icon: '🌉',
    title: { ar: 'بناء الشراكات وجمع الدعم', en: 'Partnerships and Fundraising' },
    summary: {
      ar: 'كيف تبني علاقة مع جهة داعمة، وما الذي يجعل الشراكة تستمرّ بعد المشروع الأول.',
      en: 'Building a relationship with a supporter, and what makes a partnership outlast the first project.',
    },
    requires: [],
    recommends: ['project-management'],
    audience: {
      ar: ['من يتواصل مع الجهات الداعمة', 'قادة المبادرات', 'الإدارة'],
      en: ['Anyone approaching supporters', 'Initiative leads', 'Management'],
    },
    outcomes: {
      ar: ['شهادة إتمام برمز تحقّق عام', 'إطار لعرض مبادرة على جهة داعمة'],
      en: ['A certificate with a public verification code', 'A framework for presenting an initiative to a supporter'],
    },
  },
  {
    slug: 'protecting-vulnerable',
    level: 3,
    category: 'community',
    status: 'soon',
    difficulty: 'advanced',
    minutes: 35,
    icon: '🕊️',
    title: { ar: 'حماية الفئات الأكثر عرضة للخطر', en: 'Protecting People at Risk' },
    summary: {
      ar: 'ما وراء حماية الطفل: كبار السنّ، ذوو الإعاقة، الناجون من العنف، ومن لا يستطيع الاعتراض.',
      en: 'Beyond child safeguarding: older people, people with disabilities, survivors of violence, and anyone who cannot say no.',
    },
    requires: ['working-with-children'],
    recommends: ['communication-skills'],
    audience: {
      ar: ['المتطوّعون في العمل الحمائي', 'فرق التوزيع والزيارات المنزلية', 'المشرفون'],
      en: ['Volunteers in protection work', 'Distribution and home-visit teams', 'Supervisors'],
    },
    outcomes: {
      ar: ['شهادة إتمام برمز تحقّق عام', 'معرفة حدود دورك ومتى تُحيل'],
      en: ['A certificate with a public verification code', 'Knowing the limits of your role and when to refer on'],
    },
  },
  {
    slug: 'field-safety',
    level: 3,
    category: 'community',
    status: 'soon',
    difficulty: 'intermediate',
    minutes: 30,
    icon: '🦺',
    title: { ar: 'السلامة في العمل الميداني', en: 'Safety in Field Work' },
    summary: {
      ar: 'تقدير المخاطر قبل النشاط، السلامة الشخصية، الإسعاف الأوّلي الأساسي، وخطة الطوارئ.',
      en: 'Assessing risk before an activity, personal safety, basic first aid, and the emergency plan.',
    },
    requires: [],
    recommends: ['volunteering-foundations'],
    audience: {
      ar: ['كل متطوّع ميداني', 'مسؤولو السلامة في الأنشطة', 'قادة الفرق'],
      en: ['Every field volunteer', 'Activity safety focal points', 'Team leads'],
    },
    outcomes: {
      ar: ['شهادة إتمام برمز تحقّق عام', 'قائمة تقدير مخاطر تُستخدم قبل أي نشاط'],
      en: ['A certificate with a public verification code', 'A risk checklist to use before any activity'],
    },
  },
];

export function coursesByLevel(level: number) {
  return COURSES.filter((c) => c.level === level);
}

export function courseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

/** Levels present in the catalogue, in order. */
export function levels(): number[] {
  return [...new Set(COURSES.map((c) => c.level))].sort((a, b) => a - b);
}

/** Categories that actually have a course, in catalogue order. */
export function usedCategories(): CategoryKey[] {
  const seen: CategoryKey[] = [];
  for (const c of COURSES) if (!seen.includes(c.category)) seen.push(c.category);
  return seen;
}
