import 'server-only';
import { query, queryOne } from '../db';
import type { Locale } from '../i18n';

/**
 * What a learner may open, and — when they may not — exactly what is missing.
 *
 * THIS IS THE ONLY PLACE THE RULES LIVE.
 *
 * Every page, server action and route that can reveal course material asks
 * this module first. A check in a component is a decoration: it hides a link
 * and leaves the URL working. The brief is explicit that the constraint must
 * be in the server and the database rather than the interface, and the reason
 * is not theoretical — the orientation covers safeguarding and reporting, so a
 * volunteer who slips past it reaches children without having been told the
 * rules.
 *
 * THE RULES
 *
 *   orientation   opens as soon as there is an account
 *   level 1       opens when the orientation is passed
 *   a course      opens when its level is open and its own prerequisites pass
 *   a challenge   opens when the five courses in its level are passed
 *   level N+1     opens when level N's challenge is passed
 *
 * A refusal always carries the specific unmet requirements. "You need to
 * finish Child Safeguarding first" is a route forward; "Access denied" is a
 * dead end, and the learner cannot tell whether it is their mistake or a bug.
 */

export type L = Record<Locale, string>;

/** One thing standing between the learner and the course. */
export type Missing =
  | { kind: 'sign-in' }
  | { kind: 'orientation'; slug: string; title: L }
  | { kind: 'course'; slug: string; title: L; level: number | null }
  | { kind: 'challenge'; slug: string; title: L; level: number }
  | { kind: 'level'; number: number; title: L };

export type Access = {
  allowed: boolean;
  /** Empty when allowed. Never empty when refused. */
  missing: Missing[];
  /** Advice, never a blocker. */
  suggested: { slug: string; title: L }[];
};

type CourseRow = {
  id: string;
  slug: string;
  kind: 'orientation' | 'core' | 'elective' | 'challenge';
  level_number: number | null;
  title_ar: string;
  title_en: string;
  status: string;
};

const titleOf = (r: { title_ar: string; title_en: string }): L => ({
  ar: r.title_ar,
  en: r.title_en,
});

/** Every course in the default programme, with the level it belongs to. */
async function catalogue(): Promise<CourseRow[]> {
  return query<CourseRow>(`
    SELECT c.id, c.slug, c.kind, c.title_ar, c.title_en, c.status, l.number AS level_number
    FROM courses c
    LEFT JOIN program_levels l ON l.id = c.level_id
    ORDER BY l.number NULLS LAST, c.sort_order
  `);
}

/**
 * Slugs the learner has passed.
 *
 * Read from `course_attempts`, which is where a pass has always been recorded
 * and where the two attempts that predate the programme still live. Deriving
 * it from anywhere else would quietly disown that history.
 */
export async function passedSlugs(userId: string): Promise<Set<string>> {
  const rows = await query<{ course_slug: string }>(
    `SELECT DISTINCT course_slug FROM course_attempts WHERE user_id = $1 AND passed`,
    [userId],
  );
  return new Set(rows.map((r) => r.course_slug));
}

/** Levels the learner has completed, by number. */
export async function completedLevels(userId: string): Promise<Set<number>> {
  const rows = await query<{ number: number }>(
    `SELECT l.number FROM level_progress p
     JOIN program_levels l ON l.id = p.level_id
     WHERE p.user_id = $1`,
    [userId],
  );
  return new Set(rows.map((r) => r.number));
}

/**
 * The whole picture in three queries, so a page rendering forty cards does not
 * make forty round trips. Every other function here works off this.
 */
export type Snapshot = {
  courses: CourseRow[];
  passed: Set<string>;
  levels: Set<number>;
  /** slug -> prerequisite slugs, split by whether they lock or advise. */
  requires: Map<string, string[]>;
  recommends: Map<string, string[]>;
};

export async function snapshotFor(userId: string | null): Promise<Snapshot> {
  const [courses, edges, passed, levels] = await Promise.all([
    catalogue(),
    query<{ from_slug: string; to_slug: string; kind: string }>(`
      SELECT a.slug AS from_slug, b.slug AS to_slug, p.kind
      FROM course_prerequisites p
      JOIN courses a ON a.id = p.course_id
      JOIN courses b ON b.id = p.requires_course_id
    `),
    userId ? passedSlugs(userId) : Promise.resolve(new Set<string>()),
    userId ? completedLevels(userId) : Promise.resolve(new Set<number>()),
  ]);

  const requires = new Map<string, string[]>();
  const recommends = new Map<string, string[]>();
  for (const e of edges) {
    const target = e.kind === 'requires' ? requires : recommends;
    target.set(e.from_slug, [...(target.get(e.from_slug) ?? []), e.to_slug]);
  }
  return { courses, passed, levels, requires, recommends };
}

/**
 * Is a level open to this learner? Level 0 always is; level N needs every
 * course in level N-1 passed, challenge included.
 *
 * Derived from passes rather than from `level_progress`. That table is the
 * record a certificate is issued from and it is written by
 * refreshLevelProgress *after* a pass — so reading it here made unlocking
 * depend on whether that function had run yet. Passing the orientation left
 * level 1 shut until something else happened to call it, and the individual
 * courses opened anyway because their own prerequisite edge points at the
 * orientation. The gate looked right and the level did not.
 *
 * Gating now depends only on what the learner has actually passed, so it
 * cannot go stale.
 */
export function levelOpen(snapshot: Snapshot, level: number): boolean {
  if (level <= 0) return true;
  const previous = snapshot.courses.filter((c) => c.level_number === level - 1);
  if (previous.length === 0) return false;
  return previous.every((c) => snapshot.passed.has(c.slug));
}

/**
 * The decision, computed from a snapshot. Pure, so the probe can drive it
 * through every combination without touching the database.
 */
export function decide(snapshot: Snapshot, slug: string): Access {
  const course = snapshot.courses.find((c) => c.slug === slug);
  if (!course) return { allowed: false, missing: [], suggested: [] };

  const missing: Missing[] = [];
  const byslug = (s: string) => snapshot.courses.find((c) => c.slug === s);

  // 1. The level itself. An elective has no level and is never gated by one.
  if (course.level_number !== null && course.level_number > 0) {
    for (let n = 0; n < course.level_number; n++) {
      if (!levelOpen(snapshot, n + 1)) {
        // Report the first level that is not finished, not all of them: a list
        // of five locked levels tells the learner nothing they can act on.
        const blocker = snapshot.courses.find(
          (c) => c.kind === 'challenge' && c.level_number === n,
        );
        if (n === 0) {
          const orientation = snapshot.courses.find((c) => c.kind === 'orientation');
          if (orientation && !snapshot.passed.has(orientation.slug)) {
            missing.push({
              kind: 'orientation',
              slug: orientation.slug,
              title: titleOf(orientation),
            });
          }
        } else if (blocker) {
          missing.push({
            kind: 'challenge',
            slug: blocker.slug,
            title: titleOf(blocker),
            level: n,
          });
        }
        break;
      }
    }
  }

  // 2. Its own prerequisites.
  for (const req of snapshot.requires.get(slug) ?? []) {
    if (snapshot.passed.has(req)) continue;
    const target = byslug(req);
    if (!target) continue;
    // The orientation is reported as itself, so the message reads "finish the
    // orientation" rather than naming it like any other course.
    if (target.kind === 'orientation') {
      if (!missing.some((m) => m.kind === 'orientation')) {
        missing.push({ kind: 'orientation', slug: target.slug, title: titleOf(target) });
      }
    } else if (target.kind === 'challenge') {
      missing.push({
        kind: 'challenge',
        slug: target.slug,
        title: titleOf(target),
        level: target.level_number ?? 0,
      });
    } else {
      missing.push({
        kind: 'course',
        slug: target.slug,
        title: titleOf(target),
        level: target.level_number,
      });
    }
  }

  const suggested = (snapshot.recommends.get(slug) ?? [])
    .filter((s) => !snapshot.passed.has(s))
    .map((s) => byslug(s))
    .filter((c): c is CourseRow => c !== undefined)
    .map((c) => ({ slug: c.slug, title: titleOf(c) }));

  return { allowed: missing.length === 0, missing, suggested };
}

/**
 * The one every route calls. Refuses for an anonymous visitor on anything but
 * the orientation, which they may read before signing up — nobody should have
 * to create an account to find out what the rules are.
 */
export async function accessToCourse(
  userId: string | null,
  slug: string,
): Promise<Access> {
  const snapshot = await snapshotFor(userId);
  const course = snapshot.courses.find((c) => c.slug === slug);
  if (!course) return { allowed: false, missing: [], suggested: [] };

  if (!userId) {
    const readable = course.kind === 'orientation' || course.kind === 'elective';
    return readable
      ? { allowed: true, missing: [], suggested: [] }
      : { allowed: false, missing: [{ kind: 'sign-in' }], suggested: [] };
  }
  return decide(snapshot, slug);
}

/**
 * Record a finished level, and issue nothing here.
 *
 * Completion is written down rather than recomputed on every page load,
 * because the certificate is issued from it and must not change underneath a
 * volunteer when a course is later edited or moved. `snapshot` freezes what
 * was true at the moment it was earned.
 *
 * Idempotent: ON CONFLICT DO NOTHING, so a double submit cannot produce two
 * completions and two certificates.
 */
export async function recordLevelIfComplete(
  userId: string,
  level: number,
): Promise<boolean> {
  const snapshot = await snapshotFor(userId);
  const inLevel = snapshot.courses.filter((c) => c.level_number === level);
  if (inLevel.length === 0) return false;

  // Every course in the level, challenge included, must be passed.
  const unfinished = inLevel.filter((c) => !snapshot.passed.has(c.slug));
  if (unfinished.length > 0) return false;

  const row = await queryOne<{ id: string }>(
    `SELECT l.id FROM program_levels l
     JOIN programs p ON p.id = l.program_id AND p.is_default
     WHERE l.number = $1`,
    [level],
  );
  if (!row) return false;

  /*
   * RETURNING, and the return value is whether a row was actually inserted —
   * not merely whether the level is complete.
   *
   * The first version returned true whenever the level was finished, so every
   * later call reported it as newly completed. A caller issuing a certificate
   * or showing a celebration from that would have fired on every page load.
   * ON CONFLICT DO NOTHING returns no row on a repeat, which is exactly the
   * signal needed.
   */
  const inserted = await query<{ user_id: string }>(
    `INSERT INTO level_progress (user_id, level_id, snapshot)
     VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (user_id, level_id) DO NOTHING
     RETURNING user_id`,
    [userId, row.id, JSON.stringify({ courses: inLevel.map((c) => c.slug), level })],
  );
  return inserted.length > 0;
}

/**
 * Called after any pass. Walks the levels in order and returns the ones that
 * became complete on this call — so finishing a challenge opens the next level
 * in the same request, and a repeat call returns nothing.
 */
export async function refreshLevelProgress(userId: string): Promise<number[]> {
  const recorded: number[] = [];
  const levels = await query<{ number: number }>(
    `SELECT l.number FROM program_levels l
     JOIN programs p ON p.id = l.program_id AND p.is_default
     ORDER BY l.number`,
  );
  for (const { number } of levels) {
    if (await recordLevelIfComplete(userId, number)) recorded.push(number);
  }
  return recorded;
}
