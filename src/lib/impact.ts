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
/**
 * The minutes a month may claim presence for.
 *
 * Carried-over hours are a lump: years of service recorded against a single
 * date because that is the only date anybody has. One entry can be a hundred
 * hours dated January 2024.
 *
 * They count fully towards hours points — service given before the platform
 * existed is still service, and the association entered it on purpose. They
 * must not count towards the awards that are about a MONTH: "you were active
 * in January 2024" and "you kept every commitment you made that month" are
 * claims about a month somebody worked, and a carry-over is a filing decision
 * rather than a month.
 *
 * Separated out here, rather than left as a subtraction inside the recompute,
 * so a probe can hold it without a database.
 */
export function presentMinutes(totalMinutes: number, carriedMinutes: number): number {
  return Math.max(0, totalMinutes - carriedMinutes);
}

/* ------------------------------------------ activities credited from hours */

/**
 * How many hours the association counts as one activity, for service given
 * before this platform existed. Two, by the director's instruction.
 */
export const MINUTES_PER_CREDITED_ACTIVITY = 120;

/**
 * Participation credited from carried-over hours.
 *
 * ── WHY `carried_over` AND NOT A DATE ──────────────────────────────────────
 *
 * The instruction was "before 20-08-2026", and a literal date cut would be
 * wrong here — it would exclude precisely the case it was asked for. A
 * carry-over's `worked_on` is the day the period is counted up to, or in
 * practice the day an administrator typed the row in: the live example is 300
 * hours noted «المشاركة في العديد من الأنشطة» carrying worked_on 2026-08-22,
 * two days the wrong side of the line, for work done over years before it.
 *
 * `carried_over` is already the flag for "this predates the platform" — see
 * addCarriedHoursAction in lib/actions/prior-credit.ts, which is the only
 * thing that sets it, and only ever for exactly that. It says the right thing
 * whenever the row was typed, so it does not need a cut-off date beside it and
 * must not be given one. Hours recorded by the platform itself are not carried
 * and are therefore never credited twice: they already have their own
 * attendance rows.
 *
 * ── WHY THIS IS A DERIVED FIGURE AND NOT 150 ROWS ─────────────────────────
 *
 * An `activity_attendance` row says a named person was at a named activity on
 * a named day, confirmed by a named supervisor. Writing a hundred and fifty of
 * them from one lump of hours would invent all four of those facts, and every
 * badge, report and register that reads that table would then be reading an
 * invention it cannot tell from a record. So nothing is written. The count is
 * computed where it is shown, from the hours themselves, by this function and
 * only by this function.
 *
 * ── IT IS AN ESTIMATE, AND THE PAGES SAY SO ───────────────────────────────
 *
 * 300 hours becoming 151 activities is arithmetic, not a headcount. Every
 * surface a volunteer reads about themselves — the dashboard tile, the
 * passport, the staff file — states in one sentence that participation from
 * before the platform is credited at one activity for every two hours.
 *
 * Floor, so a part is never rounded up into a whole activity nobody attended.
 */
export function activitiesFromCarriedMinutes(carriedMinutes: number): number {
  if (!Number.isFinite(carriedMinutes) || carriedMinutes <= 0) return 0;
  return Math.floor(carriedMinutes / MINUTES_PER_CREDITED_ACTIVITY);
}

/**
 * The activities figure a page should print: what was recorded, plus what the
 * carried hours are credited for.
 *
 * The single definition. Everywhere this platform states how many activities
 * somebody took part in — portalSummary, the passport, the staff member file,
 * «صنّاع الاستمرارية», the boards — calls this, so the figures cannot drift
 * apart into an argument the volunteer would be right to have.
 *
 * ── IT NOW GRANTS, AND NOT ONLY PRINTS ───────────────────────────────────
 *
 * This function used to be for display only: lib/achievements.ts,
 * lib/journey.ts and lib/milestones.ts kept counting rows, so a volunteer whose
 * page said 151 activities did not hold the «أول نشاط» badge and sat blocked on
 * a stage asking for one. That was the platform disbelieving its own register.
 * The two-hours-per-activity rate is the association's rule about the
 * association's records — an administrator entered those hours deliberately,
 * noting «المشاركة في العديد من الأنشطة» — so the three now call this too.
 *
 * TWO THINGS STILL DO NOT, and both are deliberate:
 *
 *   The impact-point ledger. Carried minutes already earn their hours points in
 *   full through pointsForMinutes, so crediting them again as activities would
 *   pay twice for one lump of service. See lib/points-recompute.ts, which never
 *   counted activities and still does not.
 *
 *   Anything scoped to a MONTH — the monthly recognition awards in
 *   lib/awards.ts, and active_month and commitment here. A carry-over is years
 *   of service filed against one date; letting it into a month would hand
 *   somebody a volunteer-of-the-month for work done in 2019. presentMinutes
 *   above is the same rule for the same reason.
 */
export function activitiesCredited(recorded: number, carriedMinutes: number): number {
  const rows = Number.isFinite(recorded) && recorded > 0 ? Math.floor(recorded) : 0;
  return rows + activitiesFromCarriedMinutes(carriedMinutes);
}

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
