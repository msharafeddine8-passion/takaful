import 'server-only';
import { query, transaction } from './db';
import type { Locale } from './i18n';
import { LEVEL_BADGES } from './programme/level-badges';
import { inCirculation, retiredCodesFrom } from './badge-circulation';
import { activitiesCredited } from './impact';

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

/**
 * What a badge is measured against.
 *
 * The last five are yes-or-no rather than counts, and they need no special
 * handling: a threshold of 1 against a figure that is 0 or 1 says exactly
 * "this is true of them", which is what `value >= threshold` already means.
 * Worth stating, because the alternative — a second kind of rule with its own
 * branch in the engine — is how an engine stops being safe to re-run.
 *
 * `certificates` is deliberately not `courses`. A course somebody passed and a
 * certificate that is still valid are different facts: revoking a certificate
 * leaves the passed attempt behind it, and these badges are about the
 * credential rather than the exam.
 */
export type AchievementKind =
  | 'hours' | 'courses' | 'activities' | 'stages' | 'levels'
  /** Course certificates that have not been revoked. */
  | 'certificates'
  /** Whole years since the join date the association holds. */
  | 'membership'
  /** 1 once they are a volunteer at all. */
  | 'accepted'
  /** 1 when they joined on or before 31 December 2023 and still stand. */
  | 'continuity'
  /** 1 when hours, activities and certificates are all met together. */
  | 'balanced'
  /** 1 when they turned up to at least 90% of what they signed up for. */
  | 'reliability';

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

  /* ------------------------------------------------- the rest of the set
   *
   * Added to the nine that were already here rather than replacing them: the
   * codes above are on people's records, and renaming one would take a badge
   * off somebody's wall to no purpose.
   *
   * Every one of these reads a figure in `standingFor` and nothing else. There
   * is no badge here for a quality — no "team spirit", no "positive
   * attitude" — because nothing in this database evidences one, and a badge
   * awarded from hours for a thing hours cannot show is a badge that means
   * whatever the person holding it decides it means.
   */

  // ---- becoming a volunteer at all
  {
    code: 'impact-begins',
    kind: 'accepted',
    threshold: 1,
    icon: '🤝',
    title: { ar: 'بداية الأثر', en: 'Where the impact begins' },
    description: {
      ar: 'قبلتك الجمعية متطوّعاً. من هنا تبدأ.',
      en: 'Accepted by the association as a volunteer. This is where it starts.',
    },
  },

  // ---- turning up
  {
    code: 'activities-5',
    kind: 'activities',
    threshold: 5,
    icon: '🚶',
    title: { ar: 'مشارِك مستمر', en: 'A regular' },
    description: {
      ar: 'حضور خمسة أنشطة موثّقة.',
      en: 'Five activities attended and confirmed.',
    },
  },
  {
    code: 'activities-25',
    kind: 'activities',
    threshold: 25,
    icon: '🧱',
    title: { ar: 'ركيزة الميدان', en: 'A fixture in the field' },
    description: {
      ar: 'حضور خمسة وعشرين نشاطاً موثّقاً.',
      en: 'Twenty-five activities attended and confirmed.',
    },
  },
  {
    code: 'activities-50',
    kind: 'activities',
    threshold: 50,
    icon: '🌍',
    title: { ar: 'أثر ممتد', en: 'Impact that carries' },
    description: {
      ar: 'حضور خمسين نشاطاً موثّقاً.',
      en: 'Fifty activities attended and confirmed.',
    },
  },

  // ---- hours, filling the gaps between the four that existed
  {
    code: 'hours-25',
    kind: 'hours',
    threshold: 1500,
    icon: '⏳',
    title: { ar: '٢٥ ساعة عطاء', en: '25 hours given' },
    description: {
      ar: 'خمس وعشرون ساعة تطوّع موثّقة.',
      en: 'Twenty-five verified hours of volunteering.',
    },
  },
  {
    code: 'hours-250',
    kind: 'hours',
    threshold: 15000,
    icon: '🏔️',
    title: { ar: '٢٥٠ ساعة عطاء', en: '250 hours given' },
    description: {
      ar: 'مئتان وخمسون ساعة تطوّع موثّقة.',
      en: 'Two hundred and fifty verified hours of volunteering.',
    },
  },
  {
    code: 'hours-500',
    kind: 'hours',
    threshold: 30000,
    icon: '🗻',
    title: { ar: '٥٠٠ ساعة عطاء', en: '500 hours given' },
    description: {
      ar: 'خمسمئة ساعة تطوّع موثّقة.',
      en: 'Five hundred verified hours of volunteering.',
    },
  },

  // ---- certificates that still stand
  {
    code: 'certs-1',
    kind: 'certificates',
    threshold: 1,
    icon: '📜',
    title: { ar: 'أول شهادة', en: 'A first certificate' },
    description: {
      ar: 'أول شهادة دورة فعّالة.',
      en: 'A first course certificate, still valid.',
    },
  },
  {
    code: 'certs-3',
    kind: 'certificates',
    threshold: 3,
    icon: '📚',
    title: { ar: 'متعلّم مستمر', en: 'Still learning' },
    description: {
      ar: 'ثلاث شهادات دورات فعّالة.',
      en: 'Three valid course certificates.',
    },
  },
  {
    code: 'certs-5',
    kind: 'certificates',
    threshold: 5,
    icon: '🧭',
    title: { ar: 'باني المعرفة', en: 'Building knowledge' },
    description: {
      ar: 'خمس شهادات دورات فعّالة.',
      en: 'Five valid course certificates.',
    },
  },
  {
    code: 'certs-10',
    kind: 'certificates',
    threshold: 10,
    icon: '🎓',
    title: { ar: 'متميّز الأكاديمية', en: 'Academy standout' },
    description: {
      ar: 'عشر شهادات دورات فعّالة.',
      en: 'Ten valid course certificates.',
    },
  },
  {
    code: 'certs-20',
    kind: 'certificates',
    threshold: 20,
    icon: '🏛️',
    title: { ar: 'قائد المعرفة', en: 'Leading on learning' },
    description: {
      ar: 'عشرون شهادة دورة فعّالة.',
      en: 'Twenty valid course certificates.',
    },
  },

  // ---- the remaining stages
  {
    code: 'stage-two',
    kind: 'stages',
    threshold: 2,
    icon: '🗣️',
    title: { ar: 'صوت المجتمع', en: 'A voice in the community' },
    description: {
      ar: 'الوصول إلى المرحلة الثانية من مسار المتطوّع.',
      en: 'Reached the second stage of the volunteer journey.',
    },
  },
  {
    code: 'stage-four',
    kind: 'stages',
    threshold: 4,
    icon: '🧑‍🤝‍🧑',
    title: { ar: 'قائد فريق', en: 'Leading a team' },
    description: {
      ar: 'الوصول إلى المرحلة الرابعة من مسار المتطوّع.',
      en: 'Reached the fourth stage of the volunteer journey.',
    },
  },
  {
    code: 'stage-five',
    kind: 'stages',
    threshold: 5,
    icon: '🗂️',
    title: { ar: 'صانع مبادرة', en: 'Making things happen' },
    description: {
      ar: 'الوصول إلى المرحلة الخامسة من مسار المتطوّع.',
      en: 'Reached the fifth stage of the volunteer journey.',
    },
  },
  {
    code: 'stage-six',
    kind: 'stages',
    threshold: 6,
    icon: '🕯️',
    title: { ar: 'مرشد وخريج', en: 'Mentor and graduate' },
    description: {
      ar: 'الوصول إلى المرحلة السادسة، آخر مراحل المسار.',
      en: 'Reached the sixth stage, the last of the journey.',
    },
  },

  // ---- staying
  {
    code: 'year-1',
    kind: 'membership',
    threshold: 1,
    icon: '🌿',
    title: { ar: 'عام من الأثر', en: 'A year of it' },
    description: {
      ar: 'مرّ عام كامل على انتسابك إلى الجمعية.',
      en: 'A full year since joining the association.',
    },
  },
  {
    code: 'years-3',
    kind: 'membership',
    threshold: 3,
    icon: '🌳',
    title: { ar: 'ثلاثة أعوام من العطاء', en: 'Three years of giving' },
    description: {
      ar: 'ثلاثة أعوام كاملة مع الجمعية.',
      en: 'Three full years with the association.',
    },
  },
  {
    code: 'years-5',
    kind: 'membership',
    threshold: 5,
    icon: '🏵️',
    title: { ar: 'خمسة أعوام من الاستمرارية', en: 'Five years of continuity' },
    description: {
      ar: 'خمسة أعوام كاملة مع الجمعية.',
      en: 'Five full years with the association.',
    },
  },
  {
    code: 'continuity-maker',
    kind: 'continuity',
    threshold: 1,
    icon: '🕊️',
    title: { ar: 'صانع الاستمرارية', en: 'Maker of continuity' },
    description: {
      ar: 'انتسبتَ في أو قبل نهاية ٢٠٢٣، وما زلت مع الجمعية.',
      en: 'Joined on or before the end of 2023, and still here.',
    },
  },

  // ---- the two that read more than one figure at once
  {
    code: 'reliable-attendance',
    kind: 'reliability',
    threshold: 1,
    icon: '📌',
    title: { ar: 'حضور موثوق', en: 'Someone who turns up' },
    description: {
      ar: 'سجّلت على عشرة أنشطة على الأقل، وحضرت تسعة من كل عشرة.',
      en: 'Signed up for at least ten activities, and turned up to nine in ten.',
    },
  },
  {
    code: 'balanced-impact',
    kind: 'balanced',
    threshold: 1,
    icon: '⚖️',
    title: { ar: 'إنجاز متوازن', en: 'Balanced' },
    description: {
      ar: 'خمسون ساعة موثّقة، وخمسة أنشطة، وخمس شهادات فعّالة — تعلّم وميدان معاً.',
      en: 'Fifty verified hours, five activities and five valid certificates — the field and the learning together.',
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
 *
 * `activities` is NOT a row count. It is `activitiesCredited` in lib/impact.ts:
 * confirmed attendance plus what the carried-over hours are credited for, at
 * the association's own rate of one activity per two hours. So the query hands
 * back the two ingredients and the figure is assembled below, in the one place
 * the rest of the platform already gets it from — a second rate written into
 * this SQL is exactly how the badge wall and the dashboard would come to
 * disagree about the same person.
 */
type StandingRow = Omit<Standing, 'activities' | 'balanced'> & {
  /** Rows on activity_attendance. The raw figure, before crediting. */
  activities_recorded: number;
  /** Verified minutes flagged carried_over. A subset of `hours`, not an addition. */
  carried_minutes: number;
};

export async function standingFor(userId: string): Promise<Standing> {
  const rows = await query<StandingRow>(
    `SELECT
       COALESCE((SELECT SUM(minutes) FROM hour_entries
                  WHERE user_id = $1 AND status = 'verified'), 0)::INTEGER   AS hours,
       (SELECT count(DISTINCT course_slug) FROM course_attempts
         WHERE user_id = $1 AND passed)::INTEGER                             AS courses,
       (SELECT count(*) FROM activity_attendance
         WHERE user_id = $1 AND attended)::INTEGER                           AS activities_recorded,

       /* The carried half of the participation figure. Kept separate from the
        * hours column on purpose: these minutes are already inside that total,
        * and a reader who added the two would count one lump of service twice.
        *
        * (No backticks in this comment. It lives inside a template literal and
        * one would end the string here - which it already did once.) */
       COALESCE((SELECT SUM(minutes) FROM hour_entries
                  WHERE user_id = $1 AND status = 'verified' AND carried_over), 0)::INTEGER
                                                                             AS carried_minutes,
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
       ), 0)::INTEGER                                                        AS levels,

       /* Certificates that still stand. Not the same question as the courses figure:
        * revoking one leaves the passed attempt behind it, and a badge that
        * counted attempts would survive a revocation it should not. */
       (SELECT count(*) FROM certificates
         WHERE user_id = $1 AND kind = 'course' AND revoked_at IS NULL)::INTEGER
                                                                             AS certificates,

       /*
        * Whole years since the association's own join date.
        *
        * COALESCE onto the account's creation, exactly as the membership card
        * does: for the four hundred people recognised from the roster the
        * account is weeks old and the membership is years old, and the years
        * badges are about the second. A line with no join date at all yields
        * the account date, which is the honest floor rather than a guess.
        *
        * AGE and EXTRACT rather than dividing days: a year is not 365 days and
        * the difference shows up on somebody's anniversary.
        */
       COALESCE(EXTRACT(YEAR FROM age(
         CURRENT_DATE,
         COALESCE((SELECT r.joined_on FROM volunteer_roster r
                    WHERE r.claimed_by = $1 AND r.approved_at IS NOT NULL LIMIT 1),
                  (SELECT u.created_at::date FROM users u WHERE u.id = $1))
       )), 0)::INTEGER                                                       AS membership,

       (CASE WHEN is_volunteer($1) THEN 1 ELSE 0 END)::INTEGER               AS accepted,

       /* Joined on or before the end of 2023 AND still a volunteer. Both
        * halves matter: this is a badge for continuing, so somebody whose
        * standing has lapsed does not hold it until it returns. A roster line
        * with no join date is not eligible — it must not be guessed at. */
       (CASE WHEN is_volunteer($1) AND EXISTS (
          SELECT 1 FROM volunteer_roster r
           WHERE r.claimed_by = $1 AND r.approved_at IS NOT NULL
             AND r.joined_on IS NOT NULL AND r.joined_on <= DATE '2023-12-31'
        ) THEN 1 ELSE 0 END)::INTEGER                                        AS continuity,

       /*
        * Turned up to at least nine in ten of what they signed up for, over at
        * least ten registrations.
        *
        * Activities the association itself called off are out of the
        * denominator — nobody's record suffers because a thing was cancelled.
        * Ten is the floor because two out of two is not a record of
        * reliability, it is a coincidence.
        *
        * Only ever read to award. The ratio is never displayed and the
        * absences behind it are never shown: this badge says what somebody
        * did, and there is no counterpart saying what they missed.
        */
       (CASE WHEN (
          SELECT count(*) FROM activity_registrations ar
            JOIN activities a ON a.id = ar.activity_id
           WHERE ar.user_id = $1 AND ar.status <> 'cancelled' AND a.cancelled_at IS NULL
        ) >= 10 AND (
          SELECT count(*) FILTER (WHERE aa.attended)::numeric
                 / NULLIF(count(*), 0)
            FROM activity_registrations ar
            JOIN activities a ON a.id = ar.activity_id
            LEFT JOIN activity_attendance aa
                   ON aa.activity_id = ar.activity_id AND aa.user_id = ar.user_id
           WHERE ar.user_id = $1 AND ar.status <> 'cancelled' AND a.cancelled_at IS NULL
        ) >= 0.9 THEN 1 ELSE 0 END)::INTEGER                                 AS reliability`,
    [userId],
  );
  const row = rows[0];
  if (!row) {
    return {
      hours: 0, courses: 0, activities: 0, stages: 0, levels: 0,
      certificates: 0, membership: 0, accepted: 0,
      continuity: 0, balanced: 0, reliability: 0,
    };
  }

  /*
   * The one place the participation figure is assembled, and it is the same
   * call every page that PRINTS a count already makes. A volunteer reading 151
   * activities on their dashboard and being refused «أول نشاط» was the platform
   * declining to believe a register its own administrator wrote.
   */
  const activities = activitiesCredited(row.activities_recorded, row.carried_minutes);

  /*
   * Fifty hours, five activities and five live certificates together. Moved out
   * of the SQL when activities stopped being a row count: leaving it there
   * would have been a second definition of "five activities", and the two would
   * have parted company the first time either rate was touched.
   *
   * Still one figure rather than three, because the combination is the point —
   * nothing here can half-award it.
   */
  const balanced =
    row.hours >= 3000 && activities >= 5 && row.certificates >= 5 ? 1 : 0;

  return {
    hours: row.hours,
    courses: row.courses,
    activities,
    stages: row.stages,
    levels: row.levels,
    certificates: row.certificates,
    membership: row.membership,
    accepted: row.accepted,
    continuity: row.continuity,
    balanced,
    /*
     * Reliability is deliberately left as it was: it is a RATIO of attendance
     * to registration, and carried-over hours have no registrations behind
     * them. Feeding credited activities into the numerator alone would put 151
     * over a denominator of nine and hand the badge to somebody who has not
     * turned up to anything the platform ever scheduled.
     */
    reliability: row.reliability,
  };
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
    const rows = (
      await client.query<{ code: string; revoked_at: Date | null; automatic: boolean }>(
        'SELECT code, revoked_at, automatic FROM achievements WHERE user_id = $1 FOR UPDATE',
        [userId],
      )
    ).rows;
    const held = new Map(rows.map((r) => [r.code, r.revoked_at]));

    /*
     * A badge a person granted is a badge this engine does not touch.
     *
     * The association gives a badge by hand for something the ledgers cannot
     * see — years of work before the platform existed, a job nobody logged.
     * Recomputing must not then look at the figures, find them short, and take
     * it back: that would withdraw a decision a named person made, with a
     * generic reason, weeks later, and the volunteer would have no way to tell
     * why. The grant is not a claim about the ledger, so the ledger does not
     * get a vote.
     *
     * Only rows still standing. A manual badge that was withdrawn by hand
     * leaves the code free again, so somebody who later earns it honestly gets
     * it from the engine in the ordinary way.
     */
    const byHand = new Set(
      rows.filter((r) => !r.automatic && r.revoked_at === null).map((r) => r.code),
    );

    /*
     * Badges out of circulation are dropped from this pass, NOT treated as
     * unmet.
     *
     * That distinction is the whole of migration 039. Below, a definition whose
     * figure has fallen short of its threshold is withdrawn — correct, it means
     * the ledger changed. A retired badge sent down that same path would be
     * withdrawn from every person holding it, with the engine's generic reason,
     * on a day unconnected to anything they did. Removing the definition
     * instead means nothing is granted and no row is touched.
     */
    const retired = retiredCodesFrom(
      (
        await client.query<{ code: string; lifted_at: Date | null }>(
          'SELECT code, lifted_at FROM badge_retirements',
        )
      ).rows,
    );

    for (const def of inCirculation(ACHIEVEMENTS, retired)) {
      if (byHand.has(def.code)) continue;
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
  /*
   * The counting kinds only.
   *
   * A hint reads "42 of 50 hours — eight to go", which needs a figure that
   * climbs. The yes-or-no kinds have nothing to count towards: "0 of 1
   * balanced" tells nobody anything they can act on, and a bar towards
   * continuity would be a bar towards a date in 2023 that has already gone.
   * Those appear on the page with their condition written out instead.
   *
   * Derived from the definitions rather than listed, so a kind added above is
   * either counted here or deliberately named as an exception — never
   * silently missing, which is what the hardcoded list allowed.
   */
  const NOT_COUNTABLE: AchievementKind[] = ['accepted', 'continuity', 'balanced', 'reliability'];
  const countable = [...new Set(ACHIEVEMENTS.map((a) => a.kind))].filter(
    (k) => !NOT_COUNTABLE.includes(k),
  );

  for (const kind of countable) {
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
