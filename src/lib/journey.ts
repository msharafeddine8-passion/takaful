import 'server-only';
import { query, queryOne } from './db';

/**
 * The progression engine.
 *
 * One function decides whether a requirement is met and whether a stage is
 * open. Nothing else in the codebase may decide that, or two screens will
 * eventually disagree about whether someone has finished Stage 3 — and the
 * person will be told both.
 *
 * Evaluation is computed on read (architecture decision 5). No progress
 * percentage is stored, because a stored one drifts the moment anything
 * writes without going through the single path, and something always does.
 *
 * A learner — anyone who registered to take courses — has no journey at all.
 * `journeyFor()` returns null for them, and that is a normal state, not an
 * error.
 */

export type RequirementKind =
  | 'course' | 'hours' | 'assessment' | 'activity'
  | 'evaluation' | 'document' | 'approval';

export type StageStatus =
  | 'locked' | 'available' | 'in_progress'
  | 'requirements_completed' | 'awaiting_approval' | 'completed';

export type RequirementView = {
  id: string;
  kind: RequirementKind;
  labelAr: string;
  labelEn: string;
  isRequired: boolean;
  satisfied: boolean;
  /** Where a requirement is a quantity, how far along it is. */
  progress: { current: number; target: number; unit: 'minutes' | 'count' | 'percent' } | null;
  /** Slug of the course this points at, for linking straight to it. */
  courseSlug: string | null;
};

export type StageView = {
  id: string;
  number: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  status: StageStatus;
  /** 0–100 across required requirements only. */
  percent: number;
  /**
   * False when nobody has said what this stage takes yet.
   *
   * A stage with no requirements computes as 100% — nought of nought required
   * items are met — and that is arithmetically right and completely
   * misleading. Every stage of the association's journey is unconfigured
   * today, so without this flag every screen would report six finished
   * stages. Screens must say "not set yet" rather than show a figure.
   */
  isConfigured: boolean;
  requirements: RequirementView[];
  completedAt: Date | null;
};

export type JourneyView = {
  versionId: string;
  versionName: string;
  stages: StageView[];
  currentStage: StageView | null;
  /** The single most useful thing this person could do next, or null. */
  nextAction: { stageNumber: number; requirement: RequirementView } | null;
};

type RequirementRow = {
  id: string;
  stage_id: string;
  kind: RequirementKind;
  label_ar: string;
  label_en: string;
  is_required: boolean;
  config: Record<string, string>;
};

/** Signals gathered once, so evaluating twelve requirements is not twelve trips. */
type Signals = {
  passedCourses: Map<string, number>;      // slug -> best score
  allocatedByRequirement: Map<string, number>;
  manualProgress: Set<string>;             // requirement ids satisfied by a recorded row
  completedStages: Map<number, Date>;      // stage number -> when
};

export async function journeyFor(userId: string): Promise<JourneyView | null> {
  const assignment = await queryOne<{ version_id: string; name: string }>(
    `SELECT a.version_id, v.name
       FROM current_journey_assignment a
       JOIN journey_versions v ON v.id = a.version_id
      WHERE a.user_id = $1`,
    [userId],
  );
  // Not a volunteer. Nothing has gone wrong.
  if (!assignment) return null;

  const [stages, requirements, signals] = await Promise.all([
    query<{
      id: string; number: number; title_ar: string; title_en: string;
      description_ar: string | null; description_en: string | null;
    }>(
      `SELECT id, number, title_ar, title_en, description_ar, description_en
         FROM journey_stages WHERE version_id = $1 ORDER BY number`,
      [assignment.version_id],
    ),
    query<RequirementRow>(
      `SELECT r.id, r.stage_id, r.kind, r.label_ar, r.label_en, r.is_required, r.config
         FROM active_stage_requirements r
         JOIN journey_stages s ON s.id = r.stage_id
        WHERE s.version_id = $1
        ORDER BY s.number, r.sort_order, r.id`,
      [assignment.version_id],
    ),
    gatherSignals(userId),
  ]);

  const byStage = new Map<string, RequirementRow[]>();
  for (const r of requirements) {
    const list = byStage.get(r.stage_id) ?? [];
    list.push(r);
    byStage.set(r.stage_id, list);
  }

  const views: StageView[] = [];
  let previousCompleted = true; // stage 1 is open to a volunteer from the start

  for (const s of stages) {
    const rows = byStage.get(s.id) ?? [];
    const reqs = rows.map((r) => evaluate(r, signals));

    const required = reqs.filter((r) => r.isRequired);
    const met = required.filter((r) => r.satisfied).length;
    const percent = required.length === 0 ? 100 : Math.round((met / required.length) * 100);

    // Decision 3: a completed stage is read from history, never recomputed.
    // Adding a requirement later must not un-complete someone's spring.
    const completedAt = signals.completedStages.get(s.number) ?? null;

    let status: StageStatus;
    if (completedAt) {
      status = 'completed';
    } else if (!previousCompleted) {
      status = 'locked';
    } else if (required.length > 0 && met === required.length) {
      // Requirements are done but nobody has recorded the stage as complete.
      status = required.some((r) => r.kind === 'approval')
        ? 'awaiting_approval'
        : 'requirements_completed';
    } else if (reqs.some((r) => r.satisfied) || met > 0) {
      status = 'in_progress';
    } else {
      status = 'available';
    }

    views.push({
      id: s.id,
      number: s.number,
      titleAr: s.title_ar,
      titleEn: s.title_en,
      descriptionAr: s.description_ar,
      descriptionEn: s.description_en,
      status,
      percent: completedAt ? 100 : percent,
      isConfigured: reqs.length > 0,
      requirements: reqs,
      completedAt,
    });

    previousCompleted = Boolean(completedAt);
  }

  const current =
    views.find((v) => v.status !== 'completed' && v.status !== 'locked') ?? null;

  // One next step, not fifteen. The first unmet required item on the stage
  // they are actually on.
  const nextRequirement =
    current?.requirements.find((r) => r.isRequired && !r.satisfied) ?? null;

  return {
    versionId: assignment.version_id,
    versionName: assignment.name,
    stages: views,
    currentStage: current,
    nextAction:
      current && nextRequirement
        ? { stageNumber: current.number, requirement: nextRequirement }
        : null,
  };
}

async function gatherSignals(userId: string): Promise<Signals> {
  const [courses, allocations, manual, completed] = await Promise.all([
    query<{ course_slug: string; score: number | null }>(
      'SELECT course_slug, score FROM course_progress WHERE user_id = $1 AND passed',
      [userId],
    ),
    query<{ requirement_id: string; minutes: string }>(
      'SELECT requirement_id, minutes FROM allocated_minutes WHERE user_id = $1',
      [userId],
    ),
    query<{ requirement_id: string }>(
      'SELECT requirement_id FROM stage_requirement_progress WHERE user_id = $1',
      [userId],
    ),
    query<{ stage: number; reached_at: Date }>(
      'SELECT stage, reached_at FROM stage_progress WHERE user_id = $1',
      [userId],
    ),
  ]);

  return {
    passedCourses: new Map(courses.map((c) => [c.course_slug, c.score ?? 0])),
    allocatedByRequirement: new Map(
      allocations.map((a) => [a.requirement_id, Number.parseInt(a.minutes, 10)]),
    ),
    manualProgress: new Set(manual.map((m) => m.requirement_id)),
    completedStages: new Map(completed.map((s) => [s.stage, s.reached_at])),
  };
}

function evaluate(r: RequirementRow, signals: Signals): RequirementView {
  const base = {
    id: r.id,
    kind: r.kind,
    labelAr: r.label_ar,
    labelEn: r.label_en,
    isRequired: r.is_required,
    courseSlug: r.config.courseSlug ?? null,
  };

  // A requirement a human confirmed is satisfied whatever else is true —
  // this is how an admin override, an evaluation and an approval all land.
  if (signals.manualProgress.has(r.id)) {
    return { ...base, satisfied: true, progress: null };
  }

  switch (r.kind) {
    case 'course': {
      const slug = r.config.courseSlug;
      const min = Number.parseInt(r.config.minScore ?? '', 10);
      const score = slug ? signals.passedCourses.get(slug) : undefined;
      const passed = score !== undefined && (Number.isNaN(min) || score >= min);
      return {
        ...base,
        satisfied: passed,
        progress: Number.isNaN(min)
          ? null
          : { current: score ?? 0, target: min, unit: 'percent' },
      };
    }

    case 'assessment': {
      const slug = r.config.courseSlug;
      const mark = Number.parseInt(r.config.passMark ?? '0', 10);
      const score = slug ? signals.passedCourses.get(slug) : undefined;
      return {
        ...base,
        satisfied: score !== undefined && score >= mark,
        progress: { current: score ?? 0, target: mark, unit: 'percent' },
      };
    }

    case 'hours': {
      const target = Number.parseInt(r.config.minutes ?? '0', 10);
      const current = signals.allocatedByRequirement.get(r.id) ?? 0;
      return {
        ...base,
        satisfied: current >= target,
        progress: { current, target, unit: 'minutes' },
      };
    }

    // These have no automatic signal: something records a row when they are
    // met, and the manualProgress check above catches it.
    case 'activity':
    case 'evaluation':
    case 'document':
    case 'approval':
      return { ...base, satisfied: false, progress: null };
  }
}

/** True once someone has been accepted; learners have no journey. */
export async function isVolunteer(userId: string): Promise<boolean> {
  const row = await queryOne<{ v: boolean }>('SELECT is_volunteer($1) AS v', [userId]);
  return row?.v ?? false;
}
