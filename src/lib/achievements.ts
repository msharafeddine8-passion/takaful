import 'server-only';
import { query, transaction } from './db';
import type { Locale } from './i18n';
import { LEVEL_BADGES } from './programme/level-badges';

/**
 * Badges.
 *
 * An achievement is not a certificate. A certificate is a claim made to a
 * stranger — an employer, a university — and its wording is frozen at issue.
 * An achievement is a mark of something a volunteer did, shown to them and to
 * staff, and it is derived from the same ledgers the rest of the platform
 * reads. Nobody awards one by clicking.
 *
 * Architecture decision 9 governs what happens when the ground shifts. If an
 * hour entry is corrected downward, or a certificate revoked, the figure
 * behind a badge can fall below its threshold. The badge is then marked
 * revoked with a reason and kept. Deleting it would mean a volunteer who saw
 * it yesterday finds no trace of it today; leaving it standing while wrong
 * would make every other figure on the page suspect.
 *
 * The catalogue is authored here rather than in the database for the same
 * reason the courses are: a badge has meaning and two translations, and a
 * missing translation should stop a build rather than render as a blank.
 */

export type AchievementKind = 'hours' | 'courses' | 'activities' | 'stages' | 'levels';

export type AchievementDef = {
  code: string;
  kind: AchievementKind;
  /** The figure that must be reached. Minutes for hours, a count otherwise. */
  threshold: number;
  icon: string;
  title: Record<Locale, string>;
  /** What the volunteer did. Written in the past tense: it already happened. */
  description: Record<Locale, string>;
};

/**
 * Deliberately modest. A badge for signing up is a badge for nothing, and a
 * wall of them makes each one worthless — the first hour matters because
 * somebody actually turned up.
 */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    code: 'first-hour',
    kind: 'hours',
    threshold: 60,
    icon: '🌱',
    title: { ar: 'أول ساعة', en: 'First hour' },
    description: {
      ar: 'أول ساعة تطوّع موثّقة. البداية هي الجزء الأصعب.',
      en: 'A first verified hour of volunteering. Starting is the hard part.',
    },
  },
  {
    code: 'ten-hours',
    kind: 'hours',
    threshold: 600,
    icon: '⏳',
    title: { ar: 'عشر ساعات', en: 'Ten hours' },
    description: {
      ar: 'عشر ساعات موثّقة في الميدان.',
      en: 'Ten verified hours in the field.',
    },
  },
  {
    code: 'fifty-hours',
    kind: 'hours',
    threshold: 3000,
    icon: '🔥',
    title: { ar: 'خمسون ساعة', en: 'Fifty hours' },
    description: {
      ar: 'خمسون ساعة موثّقة. هذا التزام، لا تجربة.',
      en: 'Fifty verified hours. That is a commitment, not an experiment.',
    },
  },
  {
    code: 'hundred-hours',
    kind: 'hours',
    threshold: 6000,
    icon: '🏛️',
    title: { ar: 'مئة ساعة', en: 'One hundred hours' },
    description: {
      ar: 'مئة ساعة موثّقة في خدمة المجتمع.',
      en: 'One hundred verified hours in service of the community.',
    },
  },
  {
    code: 'first-course',
    kind: 'courses',
    threshold: 1,
    icon: '📘',
    title: { ar: 'أول دورة', en: 'First course' },
    description: {
      ar: 'إتمام أول دورة في الأكاديمية بنجاح.',
      en: 'Passed a first course in the academy.',
    },
  },
  {
    code: 'all-foundations',
    kind: 'courses',
    threshold: 5,
    icon: '🎓',
    title: { ar: 'الأسس كاملة', en: 'Foundations complete' },
    description: {
      ar: 'إتمام دورات المستوى الأول كلها.',
      en: 'Passed every course at the first level.',
    },
  },
  {
    code: 'first-activity',
    kind: 'activities',
    threshold: 1,
    icon: '🤝',
    title: { ar: 'أول نشاط', en: 'First activity' },
    description: {
      ar: 'أول حضور مؤكّد في نشاط ميداني.',
      en: 'A first confirmed attendance at a field activity.',
    },
  },
  {
    code: 'ten-activities',
    kind: 'activities',
    threshold: 10,
    icon: '🧭',
    title: { ar: 'عشرة أنشطة', en: 'Ten activities' },
    description: {
      ar: 'حضور مؤكّد في عشرة أنشطة.',
      en: 'Confirmed attendance at ten activities.',
    },
  },
  {
    code: 'stage-three',
    kind: 'stages',
    threshold: 3,
    icon: '⛰️',
    title: { ar: 'المرحلة الثالثة', en: 'Stage three' },
    description: {
      ar: 'الوصول إلى المرحلة الثالثة من مسار المتطوّع.',
      en: 'Reached the third stage of the volunteer journey.',
    },
  },
  /*
   * The six level badges, built from the programme catalogue rather than
   * retyped. Code, icon, title and description all come from
   * `src/lib/programme/level-badges.ts`, so a level renamed there cannot leave
   * a stale copy of its wording sitting on somebody's wall.
   *
   * `threshold: levelNumber` against the `levels` figure in `standingFor`,
   * which is the highest CONSECUTIVE completed level — so the engine's
   * existing `standing[def.kind] >= def.threshold` reads as "has finished
   * level N and everything below it". Nothing special-cases this kind.
   *
   * LEVEL 0 IS EXCLUDED, deliberately, and this is the choice the brief asked
   * to be made explicitly. Its threshold would be 0, and `0 >= 0` holds for an
   * account created one second ago that has done nothing at all — the engine
   * would award it on sign-up, not on finishing the orientation, because it
   * compares a figure rather than asking whether a level is complete. This
   * file opens by saying a badge for signing up is a badge for nothing. The
   * orientation badge is not lost: `levelBadgeStanding` still renders it on
   * the map and the badge wall, where it is derived from the orientation
   * actually being passed.
   */
  ...LEVEL_BADGES.filter((b) => b.levelNumber >= 1).map(
    (b): AchievementDef => ({
      code: b.code,
      kind: 'levels',
      threshold: b.levelNumber,
      icon: b.icon,
      title: b.title,
      description: b.description,
    }),
  ),
];

export function achievementByCode(code: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.code === code);
}

export type EarnedAchievement = {
  code: string;
  value: number | null;
  earned_at: Date;
  revoked_at: Date | null;
  revoke_reason: string | null;
};

/** What somebody currently holds, newest first. Revoked ones are excluded. */
export async function achievementsFor(userId: string): Promise<EarnedAchievement[]> {
  return query<EarnedAchievement>(
    `SELECT code, value, earned_at, revoked_at, revoke_reason
       FROM achievements
      WHERE user_id = $1 AND revoked_at IS NULL
      ORDER BY earned_at DESC, id DESC`,
    [userId],
  );
}

/** Including revoked ones, for a staff member looking at a record. */
export async function achievementHistory(userId: string): Promise<EarnedAchievement[]> {
  return query<EarnedAchievement>(
    `SELECT code, value, earned_at, revoked_at, revoke_reason
       FROM achievements
      WHERE user_id = $1
      ORDER BY earned_at DESC, id DESC`,
    [userId],
  );
}

export type Standing = Record<AchievementKind, number>;

/**
 * The five figures every threshold is measured against.
 *
 * `levels` is the highest N such that every level from 1 to N of the default
 * programme is complete — consecutive, not maximum, which is what a `>=`
 * threshold can express honestly. It is derived from passed `course_attempts`,
 * exactly as gate.ts and programme/credentials.ts derive completion, and
 * deliberately NOT from `level_progress`: nothing in the running application
 * writes that table until refreshLevelProgress happens to be called, so a
 * badge read from it would arrive late or never. A level with no courses in it
 * counts as incomplete, matching `LevelStanding.complete` in programme/standing.ts —
 * an empty level is not an achievement.
 */
export async function standingFor(userId: string): Promise<Standing> {
  const rows = await query<Standing>(
    `SELECT
       COALESCE((SELECT SUM(minutes) FROM hour_entries
                  WHERE user_id = $1 AND status = 'verified'), 0)::INTEGER   AS hours,
       (SELECT count(DISTINCT course_slug) FROM course_attempts
         WHERE user_id = $1 AND passed)::INTEGER                             AS courses,
       (SELECT count(*) FROM activity_attendance
         WHERE user_id = $1 AND attended)::INTEGER                           AS activities,
       COALESCE((SELECT MAX(stage) FROM stage_progress WHERE user_id = $1), 0)::INTEGER
                                                                             AS stages,
       COALESCE((
         SELECT MAX(l.number) FROM program_levels l
          WHERE l.number >= 1
            AND l.program_id = (SELECT id FROM programs WHERE is_default LIMIT 1)
            -- No level at or below this one may be unfinished, which is what
            -- makes the answer consecutive rather than merely the highest.
            AND NOT EXISTS (
              SELECT 1 FROM program_levels g
               WHERE g.program_id = l.program_id
                 AND g.number BETWEEN 1 AND l.number
                 AND (
                   NOT EXISTS (SELECT 1 FROM courses c WHERE c.level_id = g.id)
                   OR EXISTS (
                     SELECT 1 FROM courses c
                      WHERE c.level_id = g.id
                        AND NOT EXISTS (
                          SELECT 1 FROM course_attempts a
                           WHERE a.user_id = $1 AND a.course_slug = c.slug AND a.passed
                        )
                   )
                 )
            )
       ), 0)::INTEGER                                                        AS levels`,
    [userId],
  );
  return rows[0] ?? { hours: 0, courses: 0, activities: 0, stages: 0, levels: 0 };
}

export type Recomputed = { earned: string[]; revoked: string[] };

/**
 * Brings someone's badges in line with what they have actually done.
 *
 * Safe to call as often as you like, and cheap: one query for the figures,
 * one write only when something changed. Called after hours are verified,
 * a course is passed, or attendance is confirmed — and on the achievements
 * page itself, so a badge is never waiting on a background job nobody runs.
 */
export async function recomputeAchievements(
  userId: string,
  reason = 'المعطيات تغيّرت',
): Promise<Recomputed> {
  const standing = await standingFor(userId);
  const earned: string[] = [];
  const revoked: string[] = [];

  await transaction(async (client) => {
    const held = new Map(
      (
        await client.query<{ code: string; revoked_at: Date | null }>(
          'SELECT code, revoked_at FROM achievements WHERE user_id = $1 FOR UPDATE',
          [userId],
        )
      ).rows.map((r) => [r.code, r.revoked_at]),
    );

    for (const def of ACHIEVEMENTS) {
      const value = standing[def.kind];
      const qualifies = value >= def.threshold;
      const has = held.has(def.code);
      const isRevoked = has && held.get(def.code) !== null;

      if (qualifies && !has) {
        await client.query(
          'INSERT INTO achievements (user_id, code, value) VALUES ($1, $2, $3)',
          [userId, def.code, value],
        );
        earned.push(def.code);
        continue;
      }

      if (qualifies && isRevoked) {
        // Earned again. The original earned_at stands: a badge someone lost to
        // a correction and won back is the same badge, not a new one.
        await client.query(
          `UPDATE achievements SET revoked_at = NULL, revoke_reason = NULL, value = $3
            WHERE user_id = $1 AND code = $2`,
          [userId, def.code, value],
        );
        earned.push(def.code);
        continue;
      }

      if (!qualifies && has && !isRevoked) {
        await client.query(
          `UPDATE achievements SET revoked_at = now(), revoke_reason = $3
            WHERE user_id = $1 AND code = $2 AND revoked_at IS NULL`,
          [userId, def.code, reason],
        );
        revoked.push(def.code);
      }
    }
  });

  return { earned, revoked };
}

/** How close someone is to the next badge of each kind, for a progress hint. */
export type NextUp = { def: AchievementDef; current: number; remaining: number };

export function nextUp(standing: Standing, held: Set<string>): NextUp[] {
  const out: NextUp[] = [];
  for (const kind of ['hours', 'courses', 'activities', 'stages', 'levels'] as AchievementKind[]) {
    const next = ACHIEVEMENTS.filter((a) => a.kind === kind && !held.has(a.code)).sort(
      (a, b) => a.threshold - b.threshold,
    )[0];
    if (!next) continue;
    out.push({
      def: next,
      current: standing[kind],
      remaining: Math.max(0, next.threshold - standing[kind]),
    });
  }
  return out;
}
