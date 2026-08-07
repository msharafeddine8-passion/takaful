import type { Locale } from './i18n';

export type CourseStatus = 'available' | 'draft' | 'soon';

export type Course = {
  slug: string;
  level: number;
  status: CourseStatus;
  minutes: number;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
};

/**
 * Takaful Academy catalogue.
 * Content is universal — written for any volunteer in any organisation.
 * Only course 1 has drafted content so far; the rest are declared honestly.
 */
export const COURSES: Course[] = [
  {
    slug: 'volunteering-foundations',
    level: 1,
    status: 'available',
    minutes: 90,
    title: {
      ar: 'أساسيات العمل التطوعي',
      en: 'Foundations of Volunteering',
    },
    summary: {
      ar: 'ما هو التطوّع، ولماذا نقوم به، وما المبادئ التي تحكمه — وكيف تحمي نفسك ومَن تخدمهم منذ يومك الأول.',
      en: 'What volunteering is, why we do it, the principles that govern it — and how to protect yourself and those you serve from day one.',
    },
  },
  {
    slug: 'communication-skills',
    level: 1,
    status: 'available',
    minutes: 75,
    title: { ar: 'مهارات التواصل', en: 'Communication Skills' },
    summary: {
      ar: 'الإصغاء الفعّال، التواصل مع الفئات المختلفة، والتعامل مع المواقف الصعبة.',
      en: 'Active listening, communicating across different groups, and handling difficult conversations.',
    },
  },
  {
    slug: 'teamwork',
    level: 1,
    status: 'available',
    minutes: 70,
    title: { ar: 'العمل ضمن فريق', en: 'Teamwork' },
    summary: {
      ar: 'الأدوار داخل الفريق، التنسيق، وحلّ الخلافات قبل أن تكبر.',
      en: 'Roles within a team, coordination, and resolving friction before it grows.',
    },
  },
  {
    slug: 'working-with-children',
    level: 1,
    // Approved by the association along with the rest, but held back until
    // ORG.safeguardingFocalPoint is filled in. The course tells trainees four
    // times to report a disclosure to "your organisation's safeguarding focal
    // point", and its own text says it is incomplete without that name and a
    // direct number. Publishing it unnamed would teach a fifteen-year-old to
    // report child abuse to nobody. Set the focal point, then flip this line.
    status: 'draft',
    minutes: 90,
    title: { ar: 'التعامل مع الأطفال', en: 'Working with Children' },
    summary: {
      ar: 'مبادئ حماية الطفل، الحدود الآمنة، والإبلاغ — وفق المعايير الدولية.',
      en: 'Child safeguarding principles, safe boundaries, and reporting — to international standards.',
    },
  },
  {
    slug: 'digital-basics',
    level: 1,
    status: 'available',
    minutes: 60,
    title: { ar: 'مهارات الحاسوب الأساسية', en: 'Basic Computer Skills' },
    summary: {
      ar: 'الأدوات التي يحتاجها كل متطوّع للتوثيق والتنسيق والعمل المشترك.',
      en: 'The tools every volunteer needs for documentation, coordination and collaboration.',
    },
  },
];

export function coursesByLevel(level: number) {
  return COURSES.filter((c) => c.level === level);
}
