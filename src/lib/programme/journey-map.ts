import { LEVELS, ORIENTATION_SLUG } from './definition';
import type { Missing } from './gate';
import type { CourseStanding, L, LevelStanding, ProgrammeStanding } from './standing';

/**
 * The learner's path, turned into something drawable.
 *
 * WHY THIS IS BUILT ON THE PROGRAMME AND NOT ON journeyFor().
 *
 * There are two progression systems here and they are not the same axis. The
 * PROGRAMME is levels 0-6 and forty-one courses, defined in definition.ts,
 * gated by gate.ts, with real pass data per course. The JOURNEY is six
 * volunteer *stages* that exist only as rows seeded by migration 003.
 *
 * A map drawn on the journey stages would be a lie, three times over:
 *
 *   1. All six seeded stages have zero requirement rows, so journeyFor()
 *      computes percent = 100 for every one of them. Six full rings.
 *   2. Their description_ar / description_en and icon are seeded NULL, so
 *      there is nothing bilingual to write inside a node.
 *   3. A stage only ever advances when a staff member runs awardStageAction.
 *      Nothing promotes a stage automatically, so a path that appeared to move
 *      as the learner worked would be showing progress that had not happened.
 *
 * The programme side has per-course pass data, bilingual titles and
 * descriptions authored in definition.ts, and a structured reason on every
 * lock. So that is what the map renders, and the word used throughout is
 * "level" — never "stage". If you are here to "fix" this by wiring the six
 * stages in, read the three points above first: none of them has changed
 * unless stage_requirements has rows and something advances a stage without a
 * human.
 *
 * The module is pure. ProgrammeStanding is imported as a TYPE ONLY so no pg
 * pool is ever pulled in, which is what lets a probe and a client component
 * both import this. Layout is computed here from level.number rather than
 * stored anywhere — there is no positional data in the schema and there does
 * not need to be.
 */

export type StationKind = 'orientation' | 'level';
export type StationState = 'complete' | 'current' | 'open' | 'locked';

export type Station = {
  /** 'orientation' | 'level-1' … 'level-6'. Stable React key and anchor id. */
  key: string;
  kind: StationKind;
  number: number;
  title: L;
  description: L;
  state: StationState;
  /** True on exactly one station in the model, always. */
  youAreHere: boolean;
  done: number;
  total: number;
  /** Integer 0-100. Zero when the station holds no courses — never 100. */
  percent: number;
  /** total > 0. The guard the journey engine lacks, under its own name. */
  hasCourses: boolean;
  badgeCode: string | null;
  certificateCode: string | null;
  /** First open, unpassed course here — where "open station" should land. */
  nextSlug: string | null;
  courses: CourseStanding[];
  /** Empty unless state === 'locked'. A lock always ships its reason. */
  lockedBy: Missing[];
};

export type NextCertificate = {
  levelNumber: number;
  title: L;
  badgeCode: string | null;
  done: number;
  total: number;
  remaining: { slug: string; title: L }[];
  /** Everything is passed but no credential has been issued yet. */
  ready: boolean;
} | null;

export type MapModel = {
  /** Length 7: orientation first, then levels 1-6 in order. */
  stations: Station[];
  youAreHere: Station;
  overall: {
    percent: number;
    passed: number;
    total: number;
    levelsDone: number;
    levelsTotal: number;
  };
  nextCertificate: NextCertificate;
  next: { slug: string; title: L } | null;
};

/**
 * The one place a percentage is allowed to be computed.
 *
 * total === 0 yields 0, not 100. This is the exact bug the journey engine has
 * — an unconfigured stage divides nothing by nothing and reports itself
 * finished — and the reason no component below is permitted to divide.
 */
function percentOf(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

/** Dedupe by kind plus whatever identifies the thing, so one reason shows once. */
function dedupeMissing(missing: Missing[]): Missing[] {
  const seen = new Set<string>();
  const out: Missing[] = [];
  for (const m of missing) {
    const id =
      m.kind === 'sign-in'
        ? 'sign-in'
        : m.kind === 'level'
          ? `level:${m.number}`
          : m.kind === 'decision-run'
            ? `decision-run:${m.level}`
            : `${m.kind}:${m.slug}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(m);
  }
  return out;
}

function stateOf(level: LevelStanding, currentLevel: number): StationState {
  if (level.complete) return 'complete';
  if (!level.open) return 'locked';
  if (level.number === currentLevel) return 'current';
  return 'open';
}

/** An empty stand-in, so the map is seven stations even if a row is missing. */
function emptyLevel(number: number): LevelStanding {
  const def = LEVELS.find((l) => l.number === number);
  return {
    number,
    title: def?.title ?? { ar: `المستوى ${number}`, en: `Level ${number}` },
    description: def?.description ?? { ar: '', en: '' },
    badgeCode: def?.badgeCode ?? null,
    open: false,
    done: 0,
    total: 0,
    complete: false,
    certificateCode: null,
    courses: [],
  };
}

function buildStation(level: LevelStanding, currentLevel: number): Station {
  const kind: StationKind = level.number === 0 ? 'orientation' : 'level';
  const state = stateOf(level, currentLevel);

  /*
   * Descriptions come from the database, which staff can edit. When a row was
   * seeded but never filled, fall back to the authored definition rather than
   * rendering an empty paragraph.
   */
  const def = LEVELS.find((l) => l.number === level.number);
  const description: L = {
    ar: level.description.ar?.trim() ? level.description.ar : (def?.description.ar ?? ''),
    en: level.description.en?.trim() ? level.description.en : (def?.description.en ?? ''),
  };

  /*
   * Where "open station" should take someone. The orientation station has one
   * course and it is the orientation itself, so prefer it explicitly rather
   * than relying on the ordering of a query.
   */
  const openable = level.courses.filter((c) => !c.locked && c.standing !== 'passed');
  const next =
    (kind === 'orientation' ? openable.find((c) => c.slug === ORIENTATION_SLUG) : undefined) ??
    openable.find((c) => c.standing === 'in-progress') ??
    openable.find((c) => c.hasContent) ??
    openable[0] ??
    null;

  const firstLocked = level.courses.find((c) => c.locked && c.missing.length > 0);

  return {
    key: level.number === 0 ? 'orientation' : `level-${level.number}`,
    kind,
    number: level.number,
    title: level.title,
    description,
    state,
    youAreHere: false, // decided once, below, so exactly one station carries it
    done: level.done,
    total: level.total,
    percent: percentOf(level.done, level.total),
    hasCourses: level.total > 0,
    badgeCode: level.badgeCode,
    /*
     * Level 0 issues no level credential by design — the orientation course
     * carries its own, and programmeStanding already hand-maps it onto level 0.
     * So this reads whatever standing put there and never asks for more.
     */
    certificateCode: level.certificateCode,
    nextSlug: next?.slug ?? null,
    courses: level.courses,
    lockedBy: state === 'locked' && firstLocked ? dedupeMissing(firstLocked.missing) : [],
  };
}

export function buildMapModel(standing: ProgrammeStanding): MapModel {
  const byNumber = new Map(standing.levels.map((l) => [l.number, l]));

  const stations: Station[] = LEVELS.map((def) =>
    buildStation(byNumber.get(def.number) ?? emptyLevel(def.number), standing.currentLevel),
  ).sort((a, b) => a.number - b.number);

  /*
   * You are here, decided in one pass.
   *
   * Normally the station whose number is standing.currentLevel — the lowest
   * level not yet finished. Two edges: a learner who has not passed the
   * orientation is at the orientation whatever the level arithmetic says, and
   * a learner who has finished everything stands on the last station rather
   * than falling off the end of the list.
   */
  const orientation = stations.find((s) => s.kind === 'orientation');
  const orientationPassed =
    orientation !== undefined &&
    orientation.courses.some((c) => c.slug === ORIENTATION_SLUG && c.standing === 'passed');

  const allComplete = stations.filter((s) => s.number >= 1).every((s) => s.state === 'complete');

  const chosen =
    (!orientationPassed ? orientation : undefined) ??
    (allComplete ? stations[stations.length - 1] : undefined) ??
    stations.find((s) => s.number === standing.currentLevel) ??
    stations[0];

  // Defensive: the flag is a promise the components rely on ("exactly one"),
  // so it is set from a single decision rather than tested per station.
  for (const station of stations) station.youAreHere = station === chosen;
  const youAreHere = chosen ?? stations[0];

  const mainLevels = stations.filter((s) => s.number >= 1);

  /*
   * The next certificate. First level from 1 upwards that has no credential
   * standing — which is also, and deliberately, a level the learner may have
   * already finished: LevelStanding.certificateCode is null in production
   * because credentials.ts is imported by nothing under src/, so `ready` names
   * that state honestly instead of the preview promising a document the
   * platform has not issued.
   */
  const target = mainLevels.find((s) => s.certificateCode === null);
  const nextCertificate: NextCertificate = target
    ? {
        levelNumber: target.number,
        title: target.title,
        badgeCode: target.badgeCode,
        done: target.done,
        total: target.total,
        remaining: target.courses
          .filter((c) => c.standing !== 'passed')
          .map((c) => ({ slug: c.slug, title: c.title })),
        /*
         * The level being CLOSED, not its courses being counted off.
         *
         * This read `done === total` until the decision run became what closes
         * a level. `total` stopped counting the level's marked paper on the
         * same day, so the two together started saying a certificate was ready
         * the moment the five courses were passed — while issueLevelCredential
         * went on refusing it for want of a finished run. The map promised a
         * document the platform would not issue, which is the exact failure
         * this preview's own header says it exists to avoid.
         *
         * `state === 'complete'` comes from LevelStanding.complete, which is
         * levelClosed() — the same function the gate and the issuer ask. One
         * rule, asked once.
         */
        ready: target.state === 'complete',
      }
    : null;

  return {
    stations,
    youAreHere,
    overall: {
      percent: percentOf(standing.passedCourses, standing.totalCourses),
      passed: standing.passedCourses,
      total: standing.totalCourses,
      levelsDone: mainLevels.filter((s) => s.state === 'complete').length,
      levelsTotal: mainLevels.length,
    },
    nextCertificate,
    next: standing.next ? { slug: standing.next.slug, title: standing.next.title } : null,
  };
}
