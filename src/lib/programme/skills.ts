import { CATEGORIES, COURSES, type CategoryKey } from '@/lib/courses';
import type { LmsStrings } from '@/lib/dictionaries/lms';
import type { Locale } from '@/lib/i18n';
import type { ProgrammeStanding } from './standing';

/**
 * The skill map — derived, not stored.
 *
 * There is no skills schema and this deliberately does not add one. Every
 * course already sits on a shelf in the public catalogue (CATEGORY_OF in
 * src/lib/courses.ts, itself derived from the programme definition), so "what
 * have I built" is just those shelves counted against what the learner has
 * passed. No new table, no new query, and nothing to keep in sync by hand.
 *
 * Pure: ProgrammeStanding is a type-only import.
 */

export type SkillBand = 'none' | 'emerging' | 'working' | 'strong';

export type SkillStanding = {
  key: CategoryKey;
  label: Record<Locale, string>;
  passed: number;
  total: number;
  /** Integer 0-100, zero-guarded the same way the map model is. */
  percent: number;
  band: SkillBand;
};

/** slug -> shelf. Built once at module load; the catalogue is static. */
const CATEGORY_BY_SLUG = new Map<string, CategoryKey>(COURSES.map((c) => [c.slug, c.category]));

/**
 * Four bands rather than a figure, and deliberately coarse.
 *
 * This is a self-picture, not a score: "متمكّن / Strong" tells a volunteer
 * something they can act on, where "73%" invites them to treat a count of
 * finished courses as a measure of their ability. Four words also survive
 * translation, where a percentage of a percentage does not.
 */
function bandOf(percent: number): SkillBand {
  if (percent === 0) return 'none';
  if (percent < 40) return 'emerging';
  if (percent < 80) return 'working';
  return 'strong';
}

export function bandLabel(band: SkillBand, t: LmsStrings): string {
  switch (band) {
    case 'none':
      return t.skillNone;
    case 'emerging':
      return t.skillEmerging;
    case 'working':
      return t.skillWorking;
    case 'strong':
      return t.skillStrong;
  }
}

export function skillMap(standing: ProgrammeStanding): SkillStanding[] {
  const totals = new Map<CategoryKey, { passed: number; total: number }>();
  const counted = new Set<string>();

  const all = [...standing.levels.flatMap((l) => l.courses), ...standing.electives];

  for (const course of all) {
    // A slug could appear twice if a level query and the elective query ever
    // overlap. Counting it twice would quietly inflate a bar.
    if (counted.has(course.slug)) continue;
    counted.add(course.slug);

    const key = CATEGORY_BY_SLUG.get(course.slug);
    // A course with no catalogue entry belongs on no shelf. Inventing one
    // would put it under "foundations" and misreport that shelf.
    if (!key) continue;

    const bucket = totals.get(key) ?? { passed: 0, total: 0 };
    bucket.total += 1;
    if (course.standing === 'passed') bucket.passed += 1;
    totals.set(key, bucket);
  }

  return [...totals.entries()]
    .filter(([, v]) => v.total > 0) // an empty bar tells a learner nothing
    .map(([key, v]) => {
      const percent = v.total > 0 ? Math.round((v.passed / v.total) * 100) : 0;
      return {
        key,
        label: CATEGORIES[key],
        passed: v.passed,
        total: v.total,
        percent,
        band: bandOf(percent),
      };
    })
    // Biggest shelf first, then alphabetically by key: a stable order between
    // renders, so a bar does not jump because one course was passed.
    .sort((a, b) => b.total - a.total || a.key.localeCompare(b.key));
}
