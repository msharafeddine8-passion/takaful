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
};
