/**
 * What happened between one volunteer and one activity.
 *
 * Four different things were reading the same on /account/activities, and one
 * of them was cruel. An activity the association called off sat in the "past"
 * list with «لم تحضر» under it — the volunteer was told they had failed to turn
 * up to something that never took place, because the page read
 * `attended = false` and never asked whether the activity had been cancelled at
 * all. A registration the volunteer withdrew from themselves was filed under a
 * heading that also said "cancelled", so their own decision and the
 * association's were one word. And a past activity nobody had got round to
 * recording yet was indistinguishable from one where the record said absent.
 *
 * So the verdict is reached once, here, from the registration, the attendance
 * and the activity's own cancellation together. Pure and free of `server-only`
 * so scripts/probe-my-activities.mts can hold the ordering — which is the part
 * that matters, and the part an `if` moved by a later hand would quietly break.
 */

export type RegistrationOutcome =
  | 'called-off'       // the association cancelled it; it happened to nobody
  | 'withdrawn'        // the volunteer cancelled their own place
  | 'attended'         // a supervisor recorded them there
  | 'absence-recorded' // a supervisor recorded that they were not
  | 'awaiting-record'  // it is over and nobody has recorded anything yet
  | 'registered'       // still to come, place held
  | 'waitlisted';      // still to come, waiting for a place

/** Which list on the page the row belongs in. */
export type RegistrationGroup = 'upcoming' | 'past' | 'called-off' | 'withdrawn';

export type RegistrationFacts = {
  /** activity_registrations.status — 'cancelled' means the volunteer withdrew. */
  registrationStatus: string;
  /** Null until a supervisor records the sheet. False is a recorded absence. */
  attended: boolean | null;
  /** activities.cancelled_at — set when the association calls the activity off. */
  cancelledAt: Date | string | null;
  endsAt: Date | string | null;
};

function at(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const t = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

/**
 * The one verdict, in the order it is checked.
 *
 * Cancellation by the association comes first, and outranks even a recorded
 * absence. That is the whole point: once an activity is called off there is
 * nothing for anybody to have attended, so an `attended = false` left on the
 * sheet from before the cancellation says nothing about the person and must not
 * be shown as if it did. It matches activityState(), where cancellation already
 * outranks the clock, so the two cannot disagree about what a cancelled
 * activity is.
 *
 * A withdrawal comes next and before any attendance reading, because somebody
 * who gave up their place was not expected and is not absent.
 */
export function registrationOutcome(
  f: RegistrationFacts,
  now: number = Date.now(),
): RegistrationOutcome {
  if (at(f.cancelledAt) !== null) return 'called-off';
  if (f.registrationStatus === 'cancelled') return 'withdrawn';

  if (f.attended === true) return 'attended';
  if (f.attended === false) return 'absence-recorded';

  const ends = at(f.endsAt);
  if (ends !== null && now >= ends) return 'awaiting-record';

  return f.registrationStatus === 'waitlisted' ? 'waitlisted' : 'registered';
}

/**
 * Whether the volunteer had also given up their place.
 *
 * Only ever true alongside 'called-off', and it exists because the ordering
 * above would otherwise swallow somebody's own decision: a person who withdrew
 * on Tuesday from an activity the association cancelled on Wednesday would be
 * shown one sentence about the association and nothing about themselves. The
 * cancellation stays the headline — it is why nothing happened — and this lets
 * the page keep the other half of the record on the row underneath it.
 */
export function alsoWithdrew(f: RegistrationFacts): boolean {
  return f.registrationStatus === 'cancelled' && at(f.cancelledAt) !== null;
}

const GROUP: Record<RegistrationOutcome, RegistrationGroup> = {
  'called-off': 'called-off',
  withdrawn: 'withdrawn',
  attended: 'past',
  'absence-recorded': 'past',
  'awaiting-record': 'past',
  registered: 'upcoming',
  waitlisted: 'upcoming',
};

export function groupOf(outcome: RegistrationOutcome): RegistrationGroup {
  return GROUP[outcome];
}

/**
 * Whether the volunteer may still give up their place.
 *
 * Only where there is a place to give up. Offering "withdraw" on an activity
 * the association has already called off asks somebody to undo a thing that is
 * already undone, and the action would refuse it anyway.
 */
export function canWithdraw(outcome: RegistrationOutcome): boolean {
  return outcome === 'registered' || outcome === 'waitlisted';
}

/**
 * The pill tone per outcome. Tokens only, and the reading colours for text —
 * --color-ok and --color-danger are surface colours and fall under 4.5:1 as
 * small type on their own tint; see the note above TONE in lib/credential-view.ts.
 *
 * 'called-off' is amber and not red. Red is the colour this site uses for
 * something wrong with your record; an activity the association called off is
 * news about the association, and painting it as a failure of the volunteer's
 * is the same mistake in a different medium.
 *
 * 'absence-recorded' is neutral grey for the same reason. It is a fact on a
 * sheet, not a verdict, and it is never counted or totalled anywhere.
 */
export const OUTCOME_TONE: Record<RegistrationOutcome, string> = {
  'called-off': 'border-warn/40 bg-warn/10 text-warn-text',
  withdrawn: 'border-line bg-surface-2 text-ink-2',
  attended: 'border-ok/40 bg-ok/10 text-ok-text',
  'absence-recorded': 'border-line bg-surface-2 text-ink-2',
  'awaiting-record': 'border-line bg-surface-2 text-ink-2',
  registered: 'border-brand-blue/40 bg-brand-blue/10 text-brand-blue dark:text-sky-300',
  waitlisted: 'border-warn/40 bg-warn/10 text-warn-text',
};
