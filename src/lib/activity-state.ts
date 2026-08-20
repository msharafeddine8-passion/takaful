/**
 * What state an activity is in, and whether it can still be joined.
 *
 * Deliberately pure and free of `server-only`: the listing, the detail page,
 * the public opportunities page and the registration check all have to reach
 * the same verdict, and the only way to guarantee that is for all of them to
 * call the same function rather than each re-deriving it from is_open,
 * starts_at and a count.
 *
 * The bug this replaces was of exactly that kind. The staff listing showed
 * "1 / 20 مقعد" beside the words "اكتمل العدد" — which was never a status at
 * all, but the label on the button that closes registration. Two different
 * meanings wearing one string.
 */

export type ActivityState = 'cancelled' | 'ended' | 'running' | 'upcoming';

/** Why someone cannot join, when they cannot. */
export type RegistrationState =
  | 'open'
  | 'almost-full'
  | 'full'
  | 'deadline-passed'
  | 'closed'
  | 'ended'
  | 'cancelled';

export type ActivityTiming = {
  starts_at: Date | string | null;
  ends_at: Date | string | null;
  cancelled_at?: Date | string | null;
  registration_closes_at?: Date | string | null;
  is_open?: boolean;
};

function at(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const t = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

/**
 * Where the activity sits in time. Cancellation outranks the clock: a cancelled
 * activity does not quietly become "ended" once its start time passes, because
 * the two mean different things to the person who was going to attend.
 */
export function activityState(a: ActivityTiming, now: number = Date.now()): ActivityState {
  if (at(a.cancelled_at)) return 'cancelled';
  const starts = at(a.starts_at);
  const ends = at(a.ends_at);
  if (ends !== null && now >= ends) return 'ended';
  if (starts !== null && now >= starts) return ends === null ? 'ended' : 'running';
  return 'upcoming';
}

/** Seats left, or null when the activity has no capacity limit. */
export function seatsLeft(capacity: number | null, taken: number): number | null {
  if (capacity === null) return null;
  return Math.max(0, capacity - taken);
}

/**
 * Whether registration is open, and if not, why.
 *
 * Order matters and is not arbitrary: a cancelled activity is cancelled even
 * if it is also full, and an activity that has ended cannot be joined even if
 * seats remain. The first true reason is the one worth telling somebody.
 */
export function registrationState(
  a: ActivityTiming & { capacity: number | null },
  taken: number,
  now: number = Date.now(),
): RegistrationState {
  const state = activityState(a, now);
  if (state === 'cancelled') return 'cancelled';
  if (state === 'ended') return 'ended';

  if (a.is_open === false) return 'closed';

  const deadline = at(a.registration_closes_at);
  if (deadline !== null && now >= deadline) return 'deadline-passed';

  const left = seatsLeft(a.capacity, taken);
  if (left !== null) {
    if (left <= 0) return 'full';
    // A quiet nudge rather than an alarm: few seats left is still open.
    if (left <= 3 || left / a.capacity! <= 0.15) return 'almost-full';
  }
  return 'open';
}

export function canRegister(state: RegistrationState): boolean {
  return state === 'open' || state === 'almost-full';
}

/**
 * Tone for each state, mapped to the palette the site already uses. Kept here
 * so a status never looks green on one page and grey on the next.
 */
export type Tone = 'ok' | 'warn' | 'info' | 'muted' | 'bad';

export const ACTIVITY_TONE: Record<ActivityState, Tone> = {
  running: 'ok',
  upcoming: 'info',
  ended: 'muted',
  cancelled: 'bad',
};

export const REGISTRATION_TONE: Record<RegistrationState, Tone> = {
  open: 'ok',
  'almost-full': 'warn',
  full: 'muted',
  'deadline-passed': 'muted',
  closed: 'muted',
  ended: 'muted',
  cancelled: 'bad',
};

/** Minutes as something a person reads: 61 becomes "ساعة ودقيقة". */
export function splitMinutes(total: number): { hours: number; minutes: number } {
  const safe = Math.max(0, Math.floor(total || 0));
  return { hours: Math.floor(safe / 60), minutes: safe % 60 };
}

/** The activity's own length, used for "count the whole activity" and as the
 *  ceiling on how long anyone can be marked present for. */
export function activityMinutes(a: ActivityTiming): number | null {
  const s = at(a.starts_at);
  const e = at(a.ends_at);
  if (s === null || e === null || e <= s) return null;
  return Math.round((e - s) / 60000);
}
