import { LEVELS } from './definition';
import type { Locale } from '../i18n';
import type { ProgrammeStanding } from './standing';

/**
 * The level badges — the missing half of `program_levels.badge_code`.
 *
 * Seven badge codes have been authored in `LEVELS` since the programme was
 * written, seeded into `program_levels.badge_code`, loaded into
 * `LevelStanding.badgeCode` by `programmeStanding` — and then dropped on the
 * floor. Nothing resolved them to a title, nothing rendered them, and the
 * achievements catalogue in `src/lib/achievements.ts` has no entry for any of
 * them. This file closes that loop.
 *
 * It is deliberately NOT an entry in `ACHIEVEMENTS`, and it deliberately does
 * not widen `AchievementKind`. The achievements engine awards from ledger
 * counts compared against a threshold; a level badge is earned by passing
 * every course in a level, which `ProgrammeStanding` already knows exactly.
 * Deriving it here keeps one source of truth and forks nothing. When the
 * achievements engine does gain a 'levels' kind, `highestLevelEarned` below is
 * precisely the figure its `standing[kind] >= def.threshold` comparison wants.
 *
 * PURE. `LEVELS` is a value import from the authored definition;
 * `ProgrammeStanding` is a type-only import. No database, no `server-only`,
 * so a probe and a client component can both read this.
 *
 * THE FAILURE MODE IS A TYPO. `code` must equal `LEVELS[n].badgeCode`
 * character for character or the badge silently resolves to nothing. The
 * codes are copied literally rather than derived so that a change to either
 * side shows up as a diff somebody reads; `scripts/probe-path.mts` asserts the
 * two lists agree in both directions.
 */

export type LevelBadgeDef = {
  /** MUST equal LEVELS[n].badgeCode exactly. */
  code: string;
  /** 0 is the orientation; 1-6 are the levels. */
  levelNumber: number;
  /** One emoji. Always rendered aria-hidden beside real text, never alone. */
  icon: string;
  title: Record<Locale, string>;
  /** What the volunteer did. Second person, past tense: it already happened. */
  description: Record<Locale, string>;
};

export const LEVEL_BADGES: LevelBadgeDef[] = [
  {
    code: 'level-0-oriented',
    levelNumber: 0,
    icon: '🧭',
    // Named for the orientation, not for a level number: level 0 is not a
    // level a learner ever sees called "zero".
    title: { ar: 'وسام التهيئة', en: 'Orientation badge' },
    description: {
      ar: 'أتممت التهيئة: مدوّنة السلوك، والحماية، وآلية الإبلاغ حين يحدث شيء.',
      en: 'You completed the orientation: the code of conduct, safeguarding, and how to report when something happens.',
    },
  },
  {
    code: 'level-1-foundations',
    levelNumber: 1,
    icon: '🌿',
    title: { ar: 'وسام الأساسيات', en: 'Foundations badge' },
    description: {
      ar: 'أتممت المستوى الأول: أسس التطوّع، والتواصل، والعمل ضمن فريق.',
      en: 'You completed level one: the foundations of volunteering, communication and teamwork.',
    },
  },
  {
    code: 'level-2-core',
    levelNumber: 2,
    icon: '🧰',
    title: { ar: 'وسام المهارات الأساسية', en: 'Core skills badge' },
    description: {
      ar: 'أتممت المستوى الثاني: إدارة الوقت والضغط، وتوثيق ما جرى، والسلامة في الميدان.',
      en: 'You completed level two: managing time and pressure, documenting what happened, and safety in the field.',
    },
  },
  {
    code: 'level-3-specialist',
    levelNumber: 3,
    icon: '🎯',
    title: { ar: 'وسام التخصص', en: 'Specialisation badge' },
    description: {
      ar: 'أتممت المستوى الثالث: قيادة فريق، وتنظيم فعالية آمنة، وقراءة احتياج المجتمع كما هو.',
      en: 'You completed level three: leading a team, running a safe event, and reading what a community actually needs.',
    },
  },
  {
    code: 'level-4-advanced',
    levelNumber: 4,
    icon: '🧩',
    title: { ar: 'وسام الممارسة المتقدّمة', en: 'Advanced practice badge' },
    description: {
      ar: 'أتممت المستوى الرابع: تيسير الاجتماعات، والتفاوض، وحلّ النزاع، والدمج.',
      en: 'You completed level four: facilitation, negotiation, conflict resolution and inclusion.',
    },
  },
  {
    code: 'level-5-leader',
    levelNumber: 5,
    icon: '⭐',
    title: { ar: 'وسام القيادة', en: 'Leadership badge' },
    description: {
      ar: 'أتممت المستوى الخامس: قيادة التغيير، وإدارة مشروع، والقرار الأخلاقي، وقياس الأثر بصدق.',
      en: 'You completed level five: leading change, running a project, deciding ethically and measuring impact honestly.',
    },
  },
  {
    code: 'level-6-steward',
    levelNumber: 6,
    icon: '🌳',
    title: { ar: 'وسام الاستدامة', en: 'Stewardship badge' },
    description: {
      ar: 'أتممت المستوى السادس: تدريب المدرّبين، والشراكات، والحوكمة التي تحفظ ثقة المجتمع.',
      en: 'You completed level six: training trainers, partnerships, and the governance that keeps a community’s trust.',
    },
  },
];

/** The authored levels, for callers that want to check the two lists agree. */
export const LEVEL_BADGE_CODES: readonly string[] = LEVELS.map((l) => l.badgeCode);

const BY_CODE = new Map(LEVEL_BADGES.map((b) => [b.code, b]));
const BY_LEVEL = new Map(LEVEL_BADGES.map((b) => [b.levelNumber, b]));

export function levelBadgeByCode(code: string): LevelBadgeDef | undefined {
  return BY_CODE.get(code);
}

export function levelBadgeByLevel(levelNumber: number): LevelBadgeDef | undefined {
  return BY_LEVEL.get(levelNumber);
}

export type LevelBadgeStanding = LevelBadgeDef & {
  earned: boolean;
  /**
   * The level credential, when one has been issued and stands.
   *
   * `programmeStanding` selects certificates with `revoked_at IS NULL`, so a
   * withdrawn credential arrives here as null rather than as a revoked one —
   * the badge stops offering a certificate the moment the certificate stops
   * existing. `earned` is not cleared by that: the learner did pass the
   * courses, and a credential can be withdrawn for reasons that have nothing
   * to do with whether they sat the assessment.
   */
  certificateCode: string | null;
  /** When that credential was issued. Null when there is no live credential. */
  earnedAt: Date | null;
};

/**
 * The seven badges in reading order, orientation first, each with its state.
 *
 * Earned means: level 0 -> the orientation level is complete; levels 1-6 ->
 * that level is complete. Complete is `LevelStanding.complete`, which the
 * gate derives from passes rather than from `level_progress` — the latter is
 * written by nothing in the running application and would award nothing.
 */
export function levelBadgeStanding(standing: ProgrammeStanding): LevelBadgeStanding[] {
  const byNumber = new Map(standing.levels.map((l) => [l.number, l]));
  const issuedAt = new Map(standing.certificates.map((c) => [c.code, c.issuedAt]));

  return LEVEL_BADGES.map((badge) => {
    const level = byNumber.get(badge.levelNumber);
    const certificateCode = level?.certificateCode ?? null;
    return {
      ...badge,
      earned: level?.complete ?? false,
      certificateCode,
      earnedAt: certificateCode ? (issuedAt.get(certificateCode) ?? null) : null,
    };
  });
}

/**
 * The highest level N such that every level from 1 to N is complete.
 *
 * Consecutive, not maximum. A learner who somehow passed every course in
 * level 3 while level 2 sits unfinished earns nothing — which is the honest
 * reading of a path, and the only reading a `>=` threshold comparison can
 * express without lying. Level 0 is not counted: the orientation is a
 * prerequisite for level 1, not a rung of its own.
 *
 * Returns 0 when no level is complete.
 */
export function highestLevelEarned(standing: ProgrammeStanding): number {
  return highestLevelIn(levelBadgeStanding(standing));
}

/** The same rule, for a caller that already holds the badge list. */
export function highestLevelIn(badges: readonly LevelBadgeStanding[]): number {
  const earned = new Set(badges.filter((b) => b.earned).map((b) => b.levelNumber));
  let highest = 0;
  for (let n = 1; n <= 6; n += 1) {
    if (!earned.has(n)) break;
    highest = n;
  }
  return highest;
}
