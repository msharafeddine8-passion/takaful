import type { Locale } from './i18n';
import { COURSES as DEFINED, type CourseDef } from './programme/definition';
import { COURSE_CONTENT } from './course-content';
import { AUDIENCE_OF } from './course-audience';

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
  /** Courses that must be passed first. A prerequisite is a locked door. */
  requires: string[];
  /** Suggested, not enforced. */
  recommends: string[];
  /** Who it is written for. Empty when nobody has written that yet. */
  audience: Record<Locale, string[]>;
  /** What a volunteer walks away holding. */
  outcomes: Record<Locale, string[]>;
  /** An emoji rather than an icon font: no request, no licence, both scripts. */
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
 * The public catalogue, derived from the programme definition.
 *
 * This used to be a second hand-written list, and it cost something real. Two
 * courses in a row were added to the programme and forgotten here — so the
 * academy would not have listed the orientation every volunteer must take
 * first, nor the challenge that opens level 2. The probe caught both, which is
 * the only reason they were not live errors. A rule that depends on somebody
 * remembering is a rule that breaks on the thirtieth course, and there are
 * thirty-four still to write.
 *
 * So this file no longer decides what exists. It decides only how the public
 * pages present what the programme already defines: which shelf a course sits
 * on, and who it was written for. Title, summary, minutes, difficulty,
 * prerequisites and icon now come from one place.
 *
 * Adding a course is one entry in programme/definition.ts. A course with no
 * line below still appears — filed under a default category with no audience
 * section — rather than vanishing.
 */

/** Which shelf a course sits on in the public catalogue. */
const CATEGORY_OF: Record<string, CategoryKey> = {
  'code-of-conduct-and-reporting': 'foundations',
  'volunteering-foundations': 'foundations',
  'level-1-challenge': 'foundations',
  'communication-skills': 'people',
  teamwork: 'leadership',
  'working-with-children': 'community',
  'digital-basics': 'digital',
  'events-management': 'projects',
  'project-management': 'projects',
  'life-skills': 'people',
  'media-and-content': 'media',
  'community-needs': 'community',
  partnerships: 'projects',
  'protecting-vulnerable': 'community',
  'field-safety': 'community',
};

/** The shelf for a course nobody has filed yet. */
const DEFAULT_CATEGORY: CategoryKey = 'foundations';

/**
 * What a volunteer walks away holding. The same for almost every course, so it
 * is written once rather than copied into forty-one entries — which is how it
 * was, and how a typo in one of them would have gone unnoticed.
 */
const REWARDS: Record<Locale, string[]> = {
  ar: ['شهادة إتمام برمز تحقّق عام', 'توثيق الدورة في ملفك الشخصي', 'احتسابها ضمن مسار المتطوّع'],
  en: [
    'A certificate with a public verification code',
    'The course recorded on your profile',
    'Credit towards your volunteer journey',
  ],
};

const REWARDS_OF: Record<string, Record<Locale, string[]>> = {
  'code-of-conduct-and-reporting': {
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
  'level-1-challenge': {
    ar: ['شهادة المستوى الأول', 'فتح المستوى الثاني', 'تقرير بما تحتاج مراجعته'],
    en: ['The level 1 certificate', 'Level 2 unlocked', 'A report of what you need to revise'],
  },
};

/**
 * Available when the content exists, coming soon when it does not.
 *
 * Derived rather than declared, so a status can never claim a course is ready
 * while the page it opens is empty. That was previously a field somebody set
 * by hand, and the two are not the same thing.
 */
function statusOf(slug: string): CourseStatus {
  return COURSE_CONTENT[slug] ? 'available' : 'soon';
}

function present(def: CourseDef): Course {
  return {
    slug: def.slug,
    // Electives carry no level. The public catalogue groups by category rather
    // than by level, so 1 here is a display fallback, not a claim about where
    // an elective sits in the path.
    level: def.level ?? 1,
    category: CATEGORY_OF[def.slug] ?? DEFAULT_CATEGORY,
    status: statusOf(def.slug),
    difficulty: def.difficulty,
    minutes: def.minutes,
    title: def.title,
    summary: def.summary,
    requires: def.requires,
    recommends: def.recommends,
    audience: AUDIENCE_OF[def.slug] ?? { ar: [], en: [] },
    outcomes: REWARDS_OF[def.slug] ?? REWARDS,
    icon: def.icon,
  };
}

export const COURSES: Course[] = DEFINED.map(present);

export function courseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function levels(): number[] {
  return [...new Set(COURSES.map((c) => c.level))].sort((a, b) => a - b);
}

export function usedCategories(): CategoryKey[] {
  const order: CategoryKey[] = [
    'foundations',
    'people',
    'leadership',
    'community',
    'digital',
    'projects',
    'media',
  ];
  const used = new Set(COURSES.map((c) => c.category));
  return order.filter((k) => used.has(k));
}
