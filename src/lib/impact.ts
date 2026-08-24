/**
 * Impact points: what a point is worth, and what earns one.
 *
 * Recognition, not assessment. Nothing here knows about acceptance,
 * suspension or discipline, and nothing here can subtract a point for an
 * absence — a ledger that could would eventually be used to embarrass
 * somebody, whatever the intention when it was written.
 *
 * Every rule reads one verified fact. Hours that are pending or rejected earn
 * nothing, an activity somebody registered for but did not attend earns
 * nothing, and a revoked certificate earns nothing. The point is not that
 * these are hard to fake; it is that a figure nobody can trace back is a
 * figure nobody should be ranked by.
 *
 * Pure on purpose. The apportioning rule below is the kind of arithmetic that
 * is wrong by a few points in a way nobody notices for months, and it is
 * testable here without a database.
 */

export const POINTS = {
  /** Per whole hour of verified volunteering. */
  perHour: 10,
  /** One confirmed attendance at an activity. */
  attendance: 20,
  /** One active course certificate. Once per course, ever. */
  certificate: 25,
  /** A level challenge passed. */
  levelChallenge: 50,
  /** Reaching a new stage of the six. */
  stage: 100,
  /** Finishing the whole volunteer path. */
  programme: 250,
  /** A month with any verified hours or attendance in it. */
  activeMonth: 10,
  /** Attended everything registered for that month, with at least two. */
  commitment: 40,
} as const;

/** Below this many registrations, "attended everything" means nothing. */
export const COMMITMENT_MIN_ACTIVITIES = 2;

/**
 * Points for a month's verified minutes.
 *
 * Apportioned over the month's total rather than rounded per entry, which is
 * the whole reason this is a function. Three separate forty-minute entries are
 * two hours of work: rounding each one down awards nothing at all, and
 * rounding each one up awards thirty points for two hours. Summing first and
 * dividing once gives twenty, which is what the person did.
 *
 * Floor rather than round, so a part-hour is never paid for twice — the
 * remainder stays in the month it was worked and is simply not yet an hour.
 */
export function pointsForMinutes(totalMinutes: number): number {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return 0;
  return Math.floor(totalMinutes / 60) * POINTS.perHour;
}

/** YYYY-MM, from a YYYY-MM-DD date. The period key the ledger uses. */
export function periodOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export type MonthFacts = {
  /** Verified minutes worked in the month. */
  minutes: number;
  /** Activities attended in the month. */
  attended: number;
  /** Activities registered for whose date fell in the month, cancellations excluded. */
  registered: number;
};

/**
 * Whether a month counts as active.
 *
 * Hours or attendance. Deliberately not "logged in", "read a course" or
 * "updated a profile": those are use of a website, and this is meant to
 * recognise volunteering.
 */
export function isActiveMonth(f: MonthFacts): boolean {
  return f.minutes > 0 || f.attended > 0;
}

/**
 * Whether the commitment award is earned for a month.
 *
 * Everything registered for was attended, and there were at least two. One
 * activity attended is not a pattern, and awarding for it would hand forty
 * points to somebody who signed up once.
 *
 * Activities the association itself cancelled are expected to have been
 * removed from `registered` before this is called — a volunteer must never
 * lose an award because the association called something off.
 */
export function earnsCommitment(f: MonthFacts): boolean {
  return (
    f.registered >= COMMITMENT_MIN_ACTIVITIES &&
    f.attended >= f.registered
  );
}

export type SourceKind =
  | 'hours' | 'attendance' | 'certificate' | 'level_challenge'
  | 'stage' | 'programme' | 'active_month' | 'commitment' | 'manual';

export type Award = {
  kind: SourceKind;
  /** The record it came from. Null for the two period-based kinds. */
  sourceId: string | null;
  /** YYYY-MM for period-based kinds, null otherwise. */
  period: string | null;
  points: number;
  /** YYYY-MM-DD — when the person earned it, not when the row was written. */
  earnedOn: string;
};

/**
 * Everything a month's facts earn, as ledger rows.
 *
 * Returned rather than written, so the caller can show them before saving
 * any — which is what the backfill preview needs, and what stops a rule
 * change being discovered after it has already run over four hundred people.
 *
 * The month's hours are one row, not one per entry: they were apportioned as
 * a month, and a ledger row that claimed otherwise could not be reconciled
 * against the figure it came from.
 */
export function awardsForMonth(period: string, f: MonthFacts): Award[] {
  const out: Award[] = [];
  /* The last day is not knowable here without a calendar, and the first is
   * always right: the award belongs to the month, and any day inside it puts
   * it in the correct period for every report. */
  const earnedOn = `${period}-01`;

  const hourPoints = pointsForMinutes(f.minutes);
  if (hourPoints > 0) {
    out.push({ kind: 'hours', sourceId: null, period, points: hourPoints, earnedOn });
  }
  if (isActiveMonth(f)) {
    out.push({ kind: 'active_month', sourceId: null, period, points: POINTS.activeMonth, earnedOn });
  }
  if (earnsCommitment(f)) {
    out.push({ kind: 'commitment', sourceId: null, period, points: POINTS.commitment, earnedOn });
  }
  return out;
}

/**
 * The key the unique index is built on, as the application sees it.
 *
 * Kept here so a caller can ask "have I already awarded this?" without
 * guessing at the shape, and so the probe can hold the application's idea of
 * uniqueness against the database's.
 */
export function awardKey(userId: string, kind: SourceKind, sourceId: string | null, period: string | null): string {
  return `${userId}|${kind}|${sourceId ?? ''}|${period ?? ''}`;
}

/**
 * Removes awards that have already been made.
 *
 * The engine is meant to be safe to re-run — over one person, or over
 * everybody, or twice by accident — and this is what makes that true before
 * the database has to refuse anything. The unique index is still the
 * guarantee; this is what stops every re-run being a wall of caught errors.
 */
export function newAwardsOnly(
  userId: string,
  proposed: readonly Award[],
  alreadyHeld: ReadonlySet<string>,
): Award[] {
  const seen = new Set(alreadyHeld);
  const out: Award[] = [];
  for (const a of proposed) {
    const key = awardKey(userId, a.kind, a.sourceId, a.period);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}
