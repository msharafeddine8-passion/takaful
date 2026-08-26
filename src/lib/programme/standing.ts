import 'server-only';
import { query } from '../db';
import {
  snapshotFor,
  decide,
  levelOpen,
  levelClosed,
  countsTowardsLevel,
  type Missing,
  type Snapshot,
} from './gate';
import { COURSE_CONTENT } from '../course-content';
import type { Locale } from '../i18n';

/**
 * Everything the learner dashboard needs, assembled once.
 *
 * A page that shows six levels, forty-one courses and a certificate for each
 * would otherwise make a query per card. This builds the whole picture from
 * the snapshot the gate already loads, plus two more reads.
 *
 * It answers, in the order a learner actually asks:
 *   where am I, what is next, what have I finished, what is locked and why.
 */

export type L = Record<Locale, string>;

export type CourseStanding = {
  slug: string;
  title: L;
  kind: 'orientation' | 'core' | 'elective' | 'challenge';
  minutes: number;
  passMark: number;
  icon: string | null;
  /** Whether any content has been written yet. */
  hasContent: boolean;
  standing: 'passed' | 'in-progress' | 'not-started';
  /** 0-100, from modules read. 100 once passed. */
  percent: number;
  locked: boolean;
  /** Empty when open. Never empty when locked. */
  missing: Missing[];
  /** The best score across attempts, or null if never submitted. */
  bestScore: number | null;
  attempts: number;
};

export type LevelStanding = {
  number: number;
  title: L;
  description: L;
  badgeCode: string | null;
  open: boolean;
  /** Courses passed out of the total in the level. */
  done: number;
  total: number;
  complete: boolean;
  /** The credential code, if one has been issued and stands. */
  certificateCode: string | null;
  courses: CourseStanding[];
};

export type ProgrammeStanding = {
  levels: LevelStanding[];
  electives: CourseStanding[];
  /** Where the learner is: the lowest level not yet complete. */
  currentLevel: number;
  /** The single most useful thing to do next, or null when nothing is open. */
  next: { slug: string; title: L; kind: string } | null;
  totalCourses: number;
  passedCourses: number;
  learningMinutes: number;
  certificates: { code: string; kind: string; title: L; issuedAt: Date }[];
  /** Topics the learner got wrong, worth revising. */
  revise: { slug: string; title: L; bestScore: number }[];
};

type Row = {
  slug: string;
  kind: CourseStanding['kind'];
  level_number: number | null;
  title_ar: string;
  title_en: string;
  minutes: number;
  pass_mark: number;
  icon: string | null;
  module_count: string;
};

const t = (r: { title_ar: string; title_en: string }): L => ({ ar: r.title_ar, en: r.title_en });

export async function programmeStanding(userId: string | null): Promise<ProgrammeStanding> {
  const snapshot: Snapshot = await snapshotFor(userId);

  const [courses, levels, attempts, moduleReads, certificates] = await Promise.all([
    query<Row>(`
      SELECT c.slug, c.kind, c.title_ar, c.title_en, c.minutes, c.pass_mark, c.icon,
             l.number AS level_number,
             (SELECT count(*) FROM modules m WHERE m.course_id = c.id)::text AS module_count
        FROM courses c
        LEFT JOIN program_levels l ON l.id = c.level_id
       ORDER BY l.number NULLS LAST, c.sort_order
    `),
    query<{ number: number; title_ar: string; title_en: string; description_ar: string;
            description_en: string; badge_code: string | null }>(`
      SELECT l.number, l.title_ar, l.title_en, l.description_ar, l.description_en, l.badge_code
        FROM program_levels l
        JOIN programs p ON p.id = l.program_id AND p.is_default
       ORDER BY l.number
    `),
    userId
      ? query<{ course_slug: string; best: number | null; tries: string }>(
          `SELECT course_slug, MAX(score) AS best, count(*)::text AS tries
             FROM course_attempts WHERE user_id = $1 AND submitted_at IS NOT NULL
            GROUP BY course_slug`,
          [userId],
        )
      : Promise.resolve([]),
    userId
      ? query<{ course_slug: string; n: string }>(
          `SELECT course_slug, count(*)::text AS n FROM course_module_progress
            WHERE user_id = $1 GROUP BY course_slug`,
          [userId],
        )
      : Promise.resolve([]),
    userId
      ? query<{ code: string; kind: string; snapshot: { titleAr: string; titleEn: string };
                issued_at: Date; level_id: string | null }>(
          `SELECT code, kind, snapshot, issued_at, level_id FROM certificates
            WHERE user_id = $1 AND revoked_at IS NULL ORDER BY issued_at DESC`,
          [userId],
        )
      : Promise.resolve([]),
  ]);

  const attemptBySlug = new Map(attempts.map((a) => [a.course_slug, a]));
  const readsBySlug = new Map(moduleReads.map((m) => [m.course_slug, Number(m.n)]));

  function standingOf(row: Row): CourseStanding {
    const passed = snapshot.passed.has(row.slug);
    const attempt = attemptBySlug.get(row.slug);
    const read = readsBySlug.get(row.slug) ?? 0;
    const access = decide(snapshot, row.slug);

    /*
     * Content lives in two places during the move, and this is the bridge.
     *
     * The five written courses are still TypeScript modules in COURSE_CONTENT;
     * the `modules` table is where the rest will land. Counting only the table
     * made the dashboard tell a learner that Child Safeguarding was "content
     * in preparation" while they were part-way through reading it.
     *
     * Delete the COURSE_CONTENT half of this once every course has been seeded
     * into the database — the falsy check will then simply never fire.
     */
    const authored = COURSE_CONTENT[row.slug]?.modules.length ?? 0;
    const modules = Number(row.module_count) || authored;

    // Honest completion: modules read out of modules written. A course with no
    // content yet reports 0 rather than dividing by zero into NaN.
    const percent = passed ? 100 : modules > 0 ? Math.round((read / modules) * 100) : 0;

    return {
      slug: row.slug,
      title: t(row),
      kind: row.kind,
      minutes: row.minutes,
      passMark: row.pass_mark,
      icon: row.icon,
      hasContent: modules > 0,
      standing: passed ? 'passed' : read > 0 || attempt ? 'in-progress' : 'not-started',
      percent,
      locked: !access.allowed,
      missing: access.missing,
      bestScore: attempt?.best ?? null,
      attempts: attempt ? Number(attempt.tries) : 0,
    };
  }

  const levelCertByNumber = new Map<number, string>();
  const levelIdRows = userId
    ? await query<{ number: number; code: string }>(
        `SELECT l.number, c.code FROM certificates c
           JOIN program_levels l ON l.id = c.level_id
          WHERE c.user_id = $1 AND c.kind = 'level' AND c.revoked_at IS NULL`,
        [userId],
      )
    : [];
  for (const r of levelIdRows) levelCertByNumber.set(r.number, r.code);

  /*
   * Level 0's credential is the orientation one, whose kind is 'orientation'
   * and which carries no level_id — deliberately, since the orientation is a
   * course rather than a level. The query above therefore finds nothing for
   * it, and the level 0 block showed no certificate to a learner who plainly
   * held one. Mapped here rather than by widening that query, so the two ideas
   * stay separate.
   */
  const orientationCert = certificates.find((c) => c.kind === 'orientation');
  if (orientationCert) levelCertByNumber.set(0, orientationCert.code);

  const levelStandings: LevelStanding[] = levels.map((lvl) => {
    const inLevel = courses.filter((c) => c.level_number === lvl.number).map(standingOf);
    /*
     * The level's marked paper is still listed and still openable, but it is
     * revision now and does not count towards the level. Counting it would
     * leave the bar stuck one short of full for a learner who has finished
     * everything the level actually asks of them.
     */
    const required = courses
      .filter((c) => c.level_number === lvl.number && countsTowardsLevel(c))
      .map(standingOf);
    const done = required.filter((c) => c.standing === 'passed').length;
    return {
      number: lvl.number,
      title: t(lvl),
      description: { ar: lvl.description_ar, en: lvl.description_en },
      badgeCode: lvl.badge_code,
      open: levelOpen(snapshot, lvl.number),
      done,
      total: required.length,
      // One rule, asked once — the same function the gate and the certificate use.
      complete: levelClosed(snapshot, lvl.number),
      certificateCode: levelCertByNumber.get(lvl.number) ?? null,
      courses: inLevel,
    };
  });

  const electives = courses.filter((c) => c.kind === 'elective').map(standingOf);
  const allCourses = levelStandings.flatMap((l) => l.courses);

  /*
   * Where the learner is: the lowest level they have not finished. Not the
   * highest they have touched — a volunteer who dipped into an elective has
   * not moved forward, and telling them they are on level 4 when level 2 is
   * unfinished would be flattering and wrong.
   */
  const currentLevel = levelStandings.find((l) => !l.complete)?.number ?? levelStandings.length - 1;

  /*
   * The one thing to do next. Resume before start: a half-finished course is
   * a smaller ask than a new one, and leaving it hanging is how people stop.
   */
  const open = allCourses.filter((c) => !c.locked && c.standing !== 'passed' && c.hasContent);
  const next =
    open.find((c) => c.standing === 'in-progress') ??
    open.find((c) => c.kind === 'orientation') ??
    open[0] ??
    null;

  return {
    levels: levelStandings,
    electives,
    currentLevel,
    next: next ? { slug: next.slug, title: next.title, kind: next.kind } : null,
    totalCourses: allCourses.length,
    passedCourses: allCourses.filter((c) => c.standing === 'passed').length,
    learningMinutes: allCourses
      .filter((c) => c.standing === 'passed')
      .reduce((sum, c) => sum + c.minutes, 0),
    certificates: certificates.map((c) => ({
      code: c.code,
      kind: c.kind,
      title: { ar: c.snapshot.titleAr, en: c.snapshot.titleEn },
      issuedAt: c.issued_at,
    })),
    /*
     * What to revise: courses submitted but not passed, worst first. A learner
     * told "you scored 60%" learns nothing; told which course to go back to,
     * they have something to do.
     */
    revise: [...allCourses, ...electives]
      .filter((c) => c.standing !== 'passed' && c.bestScore !== null)
      .sort((a, b) => (a.bestScore ?? 0) - (b.bestScore ?? 0))
      .slice(0, 5)
      .map((c) => ({ slug: c.slug, title: c.title, bestScore: c.bestScore ?? 0 })),
  };
}
