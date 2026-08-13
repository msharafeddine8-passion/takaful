import type { Locale } from './i18n';

/**
 * Who each course is written for, in the words used when it was written.
 *
 * Lifted out of courses.ts when that file became a derivation of the programme
 * definition. It stays hand-written because it is the one field that cannot be
 * generated: a sentence describing who a course is for either came from
 * somebody who knows the course, or it is filler.
 *
 * A course with no entry here shows no audience section. That is deliberate —
 * an empty section is more honest than an invented one.
 */
export const AUDIENCE_OF: Record<string, Record<Locale, string[]>> = {
  'documentation-and-reporting': {
    ar: [
      'من يكتب تقارير الأنشطة أو محاضر الاجتماعات',
      'منسّقو الفرق ومن يتابعون تنفيذ المهام',
      'كل متطوّع قد يضطرّ لكتابة تقرير حادث',
    ],
    en: [
      'Anyone writing activity reports or meeting minutes',
      'Team coordinators and whoever follows up on actions',
      'Every volunteer who may have to write an incident report',
    ],
  },
  'code-of-conduct-and-reporting': {
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
  'volunteering-foundations': {
    ar: ['المتطوّعون الجدد', 'من يفكّر في التطوّع ولم يبدأ بعد', 'أعضاء الفرق الشبابية'],
    en: ['New volunteers', 'Anyone considering volunteering', 'Members of youth teams'],
  },
  'level-1-challenge': {
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
  'communication-skills': {
    ar: ['المتطوّعون في العمل الميداني', 'من يتعامل مع الأهالي والمستفيدين', 'منسّقو الأنشطة'],
    en: ['Volunteers working in the field', 'Anyone dealing with families and beneficiaries', 'Activity coordinators'],
  },
  'teamwork': {
    ar: ['كل من يعمل ضمن فريق تطوّعي', 'قادة الفرق الجدد', 'المتطوّعون في الأنشطة الجماعية'],
    en: ['Anyone working in a volunteer team', 'New team leads', 'Volunteers on group activities'],
  },
  'working-with-children': {
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
  'digital-basics': {
    ar: ['من يتولّى التوثيق والتقارير', 'منسّقو الفرق', 'كل متطوّع يحمل بيانات مستفيدين'],
    en: ['Anyone handling documentation and reports', 'Team coordinators', 'Every volunteer who holds beneficiary data'],
  },
  'events-management': {
    ar: ['منسّقو الأنشطة', 'قادة الفرق', 'من يتولّى تنظيم فعالية للمرة الأولى'],
    en: ['Activity coordinators', 'Team leads', 'Anyone organising an event for the first time'],
  },
  'project-management': {
    ar: ['من يقود مبادرة أو ينوي إطلاقها', 'منسّقو المشاريع', 'قادة الفرق'],
    en: ['Anyone leading or planning an initiative', 'Project coordinators', 'Team leads'],
  },
  'life-skills': {
    ar: ['المتطوّعون المستمرّون', 'من يعمل في بيئات ضاغطة', 'قادة الفرق المسؤولون عن غيرهم'],
    en: ['Long-term volunteers', 'Anyone working in demanding settings', 'Team leads responsible for others'],
  },
  'media-and-content': {
    ar: ['فريق الإعلام والتواصل', 'من يصوّر الأنشطة', 'من يكتب عن عمل الجمعية'],
    en: ['Communications teams', 'Anyone photographing activities', 'Anyone writing about the work'],
  },
  'community-needs': {
    ar: ['منسّقو المشاريع', 'فرق التقييم الميداني', 'من يخطّط لمبادرة جديدة'],
    en: ['Project coordinators', 'Field assessment teams', 'Anyone planning a new initiative'],
  },
  'partnerships': {
    ar: ['من يتواصل مع الجهات الداعمة', 'قادة المبادرات', 'الإدارة'],
    en: ['Anyone approaching supporters', 'Initiative leads', 'Management'],
  },
  'protecting-vulnerable': {
    ar: ['المتطوّعون في العمل الحمائي', 'فرق التوزيع والزيارات المنزلية', 'المشرفون'],
    en: ['Volunteers in protection work', 'Distribution and home-visit teams', 'Supervisors'],
  },
  'field-safety': {
    ar: ['كل متطوّع ميداني', 'مسؤولو السلامة في الأنشطة', 'قادة الفرق'],
    en: ['Every field volunteer', 'Activity safety focal points', 'Team leads'],
  },
  'first-aid-basics': {
    ar: ['كل متطوّع ميداني', 'من يُشارك في فعاليات جماعية', 'مسؤولو السلامة'],
    en: ['Every field volunteer', 'Anyone participating in group events', 'Safety focal points'],
  },
  'level-2-challenge': {
    ar: ['من أنهى دورات المستوى الثاني', 'المتطوّعون المقبلون على تنظيم يوم ميداني', 'منسّقو الأنشطة'],
    en: ['Anyone who has finished the Level 2 courses', 'Volunteers about to organise a field day', 'Activity coordinators'],
  },
  'team-leadership': {
    ar: ['من يقود فريقاً للمرة الأولى', 'المتطوّعون المُرشَّحون لأدوار قيادية', 'قادة الفرق الحاليون'],
    en: ['Anyone leading a team for the first time', 'Volunteers nominated for leadership roles', 'Current team leads'],
  },
  'level-3-challenge': {
    ar: ['من أنهى دورات المستوى الثالث', 'من يريد اختبار تصميم مبادرة كاملة', 'قادة الفرق'],
    en: ['Anyone who has finished the Level 3 courses', 'Anyone wanting to test designing a full initiative', 'Team leads'],
  },
  'emotional-intelligence': {
    ar: ['القادة وقادة الفرق', 'من يعمل مع فرق متنوّعة', 'كل متطوّع يمرّ بمواقف ضاغطة'],
    en: ['Leaders and team leads', 'Anyone working with diverse teams', 'Every volunteer facing demanding situations'],
  },
  'meetings-and-facilitation': {
    ar: ['من يُيسّر اجتماعات أو جلسات', 'قادة الفرق', 'من يُنظّم نقاشات مجتمعية'],
    en: ['Anyone facilitating meetings or sessions', 'Team leads', 'Anyone organising community discussions'],
  },
  'negotiation-and-advocacy': {
    ar: ['من يتفاوض مع جهات شريكة أو حكومية', 'المناصرون لقضايا مجتمعية', 'قادة المبادرات'],
    en: ['Anyone negotiating with partner or government bodies', 'Advocates for community causes', 'Initiative leads'],
  },
  'conflict-resolution': {
    ar: ['من يُدير فرقاً متعدّدة الشخصيات', 'الوسطاء في النزاعات', 'قادة الفرق'],
    en: ['Anyone managing diverse-personality teams', 'Mediators in disputes', 'Team leads'],
  },
  'inclusion-and-accessibility': {
    ar: ['مصمّمو الأنشطة والفعاليات', 'قادة الفرق', 'كل من يريد أن لا يُقصي أحداً'],
    en: ['Activity and event designers', 'Team leads', 'Everyone who wants nobody excluded'],
  },
  'level-4-challenge': {
    ar: ['من أنهى دورات المستوى الرابع', 'من يريد اختبار إدارة اجتماع متأزّم', 'الوسطاء والمسهّلون'],
    en: ['Anyone who has finished the Level 4 courses', 'Anyone wanting to test running a tense meeting', 'Mediators and facilitators'],
  },
  'transformational-leadership': {
    ar: ['قادة المبادرات والبرامج', 'من يريد بناء صفٍّ ثانٍ من القادة', 'المدراء التنفيذيون الجدد'],
    en: ['Initiative and programme leads', 'Anyone wanting to build a second leadership line', 'New executive managers'],
  },
  'public-speaking': {
    ar: ['من يُقدّم مشاريع للشركاء أو الجهات المانحة', 'المتطوّعون في التوعية والمناصرة', 'كل من يتحدّث أمام جمهور'],
    en: ['Anyone pitching projects to partners or funders', 'Volunteers in awareness and advocacy', 'Everyone who speaks before an audience'],
  },
  'community-project-management': {
    ar: ['مدراء المشاريع والبرامج', 'من يُدير ميزانيات ومخاطر', 'قادة المستوى الخامس وما فوق'],
    en: ['Project and programme managers', 'Anyone managing budgets and risks', 'Level 5 and above leads'],
  },
  'ethical-decision-making': {
    ar: ['من يتّخذ قرارات ذات أثر على الآخرين', 'قادة الفرق والبرامج', 'كل متطوّع في موقف القيادة'],
    en: ['Anyone making decisions that affect others', 'Team and programme leads', 'Every volunteer in a leadership position'],
  },
  'monitoring-and-evaluation': {
    ar: ['من يُعدّ تقارير الأثر', 'مدراء البرامج', 'من يُقدّم نتائج لمانحين أو شركاء'],
    en: ['Anyone preparing impact reports', 'Programme managers', 'Anyone presenting results to funders or partners'],
  },
  'level-5-challenge': {
    ar: ['من أنهى دورات المستوى الخامس', 'قادة المشاريع المعقّدة', 'من يريد اختبار إدارة مشروع كاملة'],
    en: ['Anyone who has finished the Level 5 courses', 'Complex project leads', 'Anyone wanting to test managing a full project'],
  },
  'volunteer-lifecycle': {
    ar: ['مدراء المتطوّعين', 'القادة المسؤولون عن استقطاب وإدارة فرق', 'المنظّمات التي تريد تنظيم دورة حياة متطوّعيها'],
    en: ['Volunteer managers', 'Leaders responsible for recruiting and managing teams', 'Organisations wanting to formalise their volunteer lifecycle'],
  },
  'sustainability-and-resources': {
    ar: ['مدراء البرامج والمشاريع', 'من يُخطّط لاستمرارية الأثر بعد التمويل', 'قادة المنظّمات المجتمعية'],
    en: ['Programme and project managers', 'Anyone planning impact continuity post-funding', 'Community organisation leaders'],
  },
  'training-of-trainers': {
    ar: ['من يُصمّم ويُقدّم تدريبات', 'قادة التعلّم والتطوير في الجمعية', 'المدرّبون الناشئون'],
    en: ['Anyone designing and delivering training', 'Learning and development leads in the organisation', 'Emerging trainers'],
  },
  'governance-and-accountability': {
    ar: ['مدراء البرامج والمنظّمات المجتمعية', 'أعضاء مجالس الإدارة والرقابة', 'القادة المسؤولون عن شفافية الجمعية'],
    en: ['Programme and community organisation managers', 'Board and oversight members', 'Leaders responsible for organisational transparency'],
  },
  'level-6-challenge': {
    ar: ['من أنهى دورات المستوى السادس', 'قادة المنظّمات المجتمعية', 'من يريد اختبار بناء نظام تطوّع متكامل'],
    en: ['Anyone who has finished the Level 6 courses', 'Community organisation leaders', 'Anyone wanting to test building an integrated volunteering system'],
  },
  'professional-identity': {
    ar: ['المتطوّعون الباحثون عن عمل', 'الطلاب الذين يستخدمون التطوّع لبناء سيرتهم', 'من يريد تقديم تجربته التطوّعية باحتراف'],
    en: ['Volunteers job-hunting', 'Students using volunteering to build their CV', 'Anyone wanting to present their volunteer experience professionally'],
  },
  'psychological-first-aid': {
    ar: ['المتطوّعون في المواقف الصعبة والأزمات', 'من يعمل مع فئات هشّة', 'كل متطوّع قد يواجه شخصاً في ضائقة'],
    en: ['Volunteers in difficult situations and crises', 'Anyone working with vulnerable groups', 'Every volunteer who may encounter someone in distress'],
  },
  'environmental-volunteering': {
    ar: ['المتطوّعون في المشاريع البيئية', 'من يُخطّط لأنشطة بيئية مجتمعية', 'من يريد تصميم تدخّل بيئي مؤثّر'],
    en: ['Volunteers in environmental projects', 'Anyone planning community environmental activities', 'Anyone wanting to design an impactful environmental intervention'],
  },
  'ethical-fundraising': {
    ar: ['من يُدير حملات جمع التبرّعات', 'المسؤولون عن علاقات المانحين', 'كل متطوّع يطلب دعماً باسم الجمعية'],
    en: ['Anyone managing fundraising campaigns', 'Those responsible for donor relations', 'Every volunteer soliciting support on behalf of the organisation'],
  },
};
