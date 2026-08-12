/*
 * The programme definition, checked against itself. No database, no network.
 *
 * This runs before the seed rather than after, because a seed that writes a
 * broken structure is harder to unpick than one that refuses to start.
 */
import {
  COURSES,
  LEVELS,
  SLUGS_WITH_HISTORY,
  ORIENTATION_SLUG,
  coursesInLevel,
  electives,
  courseBySlug,
} from '../src/lib/programme/definition';

let ok = 0;
const holes: string[] = [];

function check(what: string, passed: boolean, detail?: unknown) {
  if (passed) {
    ok++;
    console.log(`  ok       ${what}${detail === undefined ? '' : `  — ${detail}`}`);
  } else {
    holes.push(what);
    console.log(`  HOLE     ${what}${detail === undefined ? '' : `  — ${detail}`}`);
  }
}

console.log('\n--- shape ---');
const core = COURSES.filter((c) => c.kind === 'core');
const challenges = COURSES.filter((c) => c.kind === 'challenge');
const orientation = COURSES.filter((c) => c.kind === 'orientation');

check('there is exactly one orientation course', orientation.length === 1, orientation.length);
check('the orientation is the slug everything else requires', orientation[0]?.slug === ORIENTATION_SLUG);
check('there are 30 core courses', core.length === 30, core.length);
check('there are 6 level challenges', challenges.length === 6, challenges.length);
check('there are 4 electives', electives().length === 4, electives().length);
check('there are 7 levels including the orientation', LEVELS.length === 7, LEVELS.length);

for (const level of LEVELS.filter((l) => l.number >= 1)) {
  const inLevel = coursesInLevel(level.number);
  const cores = inLevel.filter((c) => c.kind === 'core');
  const chal = inLevel.filter((c) => c.kind === 'challenge');
  check(`level ${level.number} has 5 courses and 1 challenge`,
    cores.length === 5 && chal.length === 1, `${cores.length} + ${chal.length}`);
  check(`level ${level.number} orders its courses 1..6 with no gaps or repeats`,
    JSON.stringify(inLevel.map((c) => c.order)) === JSON.stringify([1, 2, 3, 4, 5, 6]),
    inLevel.map((c) => c.order).join(','));
}

console.log('\n--- identity ---');
const slugs = COURSES.map((c) => c.slug);
check('every slug is unique', new Set(slugs).size === slugs.length,
  slugs.filter((s, i) => slugs.indexOf(s) !== i).join(',') || 'no duplicates');
check('every slug is url-safe', slugs.every((s) => /^[a-z0-9-]+$/.test(s)));

// The whole reason slugs are treated as permanent.
for (const slug of SLUGS_WITH_HISTORY) {
  check(`${slug} survives the restructure (it holds real progress)`, Boolean(courseBySlug(slug)));
}

console.log('\n--- prerequisites ---');
for (const course of COURSES) {
  for (const req of course.requires) {
    const target = courseBySlug(req);
    check(`${course.slug} requires ${req}, which exists`, target !== undefined);
    if (target) {
      // A prerequisite from a later level is a door that can never open.
      const from = course.level ?? 99;
      const to = target.level ?? -1;
      check(`  ...and ${req} is not from a later level`, to <= from, `L${to} -> L${from}`);
    }
  }
  for (const rec of course.recommends) {
    check(`${course.slug} recommends ${rec}, which exists`, Boolean(courseBySlug(rec)));
  }
  check(`${course.slug} does not depend on itself`,
    !course.requires.includes(course.slug) && !course.recommends.includes(course.slug));
}

// Every core course must sit behind the orientation, directly or through a
// chain. Otherwise a volunteer reaches training without the safeguarding rules.
console.log('\n--- the orientation actually gates everything ---');
function reachesOrientation(slug: string, seen = new Set<string>()): boolean {
  if (slug === ORIENTATION_SLUG) return true;
  if (seen.has(slug)) return false; // a cycle
  seen.add(slug);
  const course = courseBySlug(slug);
  if (!course) return false;
  return course.requires.some((r) => reachesOrientation(r, seen));
}
for (const course of [...core, ...challenges]) {
  check(`${course.slug} is behind the orientation`, reachesOrientation(course.slug));
}

console.log('\n--- no cycles ---');
function hasCycle(slug: string, stack: string[] = []): string[] | null {
  if (stack.includes(slug)) return [...stack, slug];
  const course = courseBySlug(slug);
  if (!course) return null;
  for (const r of course.requires) {
    const found = hasCycle(r, [...stack, slug]);
    if (found) return found;
  }
  return null;
}
for (const course of COURSES) {
  const cycle = hasCycle(course.slug);
  check(`${course.slug} starts no prerequisite cycle`, cycle === null, cycle?.join(' -> '));
}

console.log('\n--- content promises ---');
for (const course of COURSES) {
  check(`${course.slug} is titled and summarised in both languages`,
    Boolean(course.title.ar && course.title.en && course.summary.ar && course.summary.en));
  check(`${course.slug} states 3-6 outcomes, matched across languages`,
    course.outcomes.ar.length >= 3 && course.outcomes.ar.length <= 6
      && course.outcomes.ar.length === course.outcomes.en.length,
    `${course.outcomes.ar.length} ar / ${course.outcomes.en.length} en`);
  check(`${course.slug} claims a realistic 25-60 minutes`,
    course.minutes >= 25 && course.minutes <= 60, course.minutes);
  check(`${course.slug} has an icon`, Boolean(course.icon));
}

/*
 * The courses where being wrong hurts somebody other than the learner.
 *
 * The brief named five and said "ومنها" — among them — so the list is open by
 * construction. `psychological-first-aid` is the sixth by the same test: a
 * volunteer who mishandles someone in distress does the harm to that person,
 * not to their own score. Anything else at 80 is a slip, and the check below
 * is what catches it.
 */
console.log('\n--- pass marks ---');
const MUST_BE_80 = [
  'code-of-conduct-and-reporting',
  'working-with-children',
  'protecting-vulnerable',
  'first-aid-basics',
  'field-safety',
  'psychological-first-aid',
];
for (const slug of MUST_BE_80) {
  check(`${slug} demands 80%`, courseBySlug(slug)?.passMark === 80, courseBySlug(slug)?.passMark);
}
check('nothing else demands 80% by accident',
  COURSES.filter((c) => c.passMark === 80 && !MUST_BE_80.includes(c.slug)).length === 0,
  COURSES.filter((c) => c.passMark === 80 && !MUST_BE_80.includes(c.slug)).map((c) => c.slug).join(',') || 'none');

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
