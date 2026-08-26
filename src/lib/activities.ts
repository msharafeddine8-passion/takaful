import 'server-only';
import { query, queryOne } from './db';

/**
 * Reading activities.
 *
 * Places taken come from the activity_places view rather than being counted
 * here, so the listing, the registration check and the roster can never
 * disagree about whether an activity is full.
 */

export type OpportunityRow = {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  location: string | null;
  starts_at: Date | null;
  ends_at: Date | null;
  capacity: number | null;
  min_stage: number | null;
  taken: number;
  waiting: number;
  /** This viewer's live registration, if any. */
  my_status: 'registered' | 'waitlisted' | null;
};

/**
 * The public listing's row: an opportunity, plus how many people are waiting on
 * it.
 *
 * Its own type rather than a field on OpportunityRow because MyActivityRow and
 * ManagedActivity both extend that one and neither of their queries selects the
 * figure — widening the base would have those two claim a number they never
 * fetched, which type-checks (query<T> casts) and is undefined at runtime.
 */
export type OpportunityListRow = OpportunityRow & {
  /**
   * How many people have asked to be told when this one is scheduled.
   *
   * Needed because `taken` is not a usable figure on an activity with no date:
   * nothing can be registered for one, so that count is structurally zero and
   * the public page printed «👥 0» beside every card waiting on a coordinator —
   * ten of them down a phone screen. A headcount that cannot yet be anything
   * but nought is not a count. This is the number that does move on those
   * cards, and the invitation the client's section 22 asks for is an invitation
   * to be the first entry in it.
   */
  interested: number;
};

/**
 * Upcoming, open activities, soonest first.
 *
 * `is_published` was the whole point of the draft/published choice on the
 * activity form, and this listing never asked about it. Every half-written
 * activity a coordinator saved as a draft was on the public page immediately —
 * seven of them, when this was found.
 *
 * It surfaced as something else entirely: the interest button refused with
 * "this activity is no longer waiting for a date", because the action *does*
 * check is_published and the listing did not. The card and the action
 * disagreed about which activities exist, and the volunteer got a button that
 * could not work and a reason that was not the reason.
 *
 * Cancelled activities are excluded here too. `is_open` is about registration
 * being open, not about the activity still being on.
 */
export async function opportunities(viewerId: string | null): Promise<OpportunityListRow[]> {
  return query<OpportunityListRow>(
    /*
     * The interest count is a scalar subquery rather than a JOIN on purpose: a
     * join to activity_interest would multiply the row once per interested
     * person and inflate p.taken along with it, and an activity nobody has
     * asked about must come back as 0 rather than vanish from the listing.
     */
    `SELECT a.id, a.title_ar, a.title_en, a.description_ar, a.description_en,
            a.location, a.starts_at, a.ends_at, a.capacity, a.min_stage,
            p.taken, p.waiting,
            (SELECT count(*)::INT FROM activity_interest i
              WHERE i.activity_id = a.id) AS interested,
            r.status AS my_status
       FROM activities a
       JOIN activity_places p ON p.activity_id = a.id
       LEFT JOIN activity_registrations r
         ON r.activity_id = a.id AND r.user_id = $1 AND r.status <> 'cancelled'
      WHERE a.is_published
        AND a.cancelled_at IS NULL
        AND a.is_open
        AND NOT a.is_archived
        AND (a.ends_at IS NULL OR a.ends_at > now())
      ORDER BY a.starts_at ASC NULLS LAST, a.title_ar ASC`,
    [viewerId],
  );
}

export type MyActivityRow = OpportunityRow & {
  registration_status: string;
  attended: boolean | null;
  attended_minutes: number | null;
  /*
   * The association's own cancellation, which this query did not ask for.
   *
   * Without it /account/activities could not tell an activity that was called
   * off from one somebody failed to attend, and drew both as an absence. The
   * reason comes with it because a cancellation the volunteer is not given a
   * reason for is the association going quiet on them.
   */
  cancelled_at: Date | null;
  cancel_reason: string | null;
};

export async function myActivities(userId: string): Promise<MyActivityRow[]> {
  return query<MyActivityRow>(
    `SELECT a.id, a.title_ar, a.title_en, a.description_ar, a.description_en,
            a.location, a.starts_at, a.ends_at, a.capacity, a.min_stage,
            a.cancelled_at, a.cancel_reason,
            p.taken, p.waiting,
            r.status AS registration_status,
            r.status AS my_status,
            att.attended,
            att.minutes AS attended_minutes
       FROM activity_registrations r
       JOIN activities a ON a.id = r.activity_id
       JOIN activity_places p ON p.activity_id = a.id
       LEFT JOIN activity_attendance att
         ON att.activity_id = a.id AND att.user_id = r.user_id
      WHERE r.user_id = $1
      ORDER BY a.starts_at DESC NULLS LAST`,
    [userId],
  );
}

export type RosterRow = {
  user_id: string;
  full_name: string;
  /** Shown beside the name so two volunteers called the same thing can be told
   *  apart before anyone's hours are credited to the wrong one. */
  member_number: number | null;
  email: string;
  registration_status: string;
  attended: boolean | null;
  attended_minutes: number | null;
  note: string | null;
};

/** Everyone signed up for one activity, with whatever the supervisor recorded. */
export async function roster(activityId: string): Promise<RosterRow[]> {
  return query<RosterRow>(
    /*
     * The membership number and email come along because two volunteers really
     * can share a name, and a supervisor ticking the wrong «محمد علي» credits
     * the wrong person's hours. One of the two is always enough to tell them
     * apart on the sheet.
     */
    `SELECT r.user_id, pr.full_name, pr.member_number, u.email,
            r.status AS registration_status,
            att.attended, att.minutes AS attended_minutes, att.note
       FROM activity_registrations r
       JOIN profiles pr ON pr.user_id = r.user_id
       JOIN users u     ON u.id = r.user_id
       LEFT JOIN activity_attendance att
         ON att.activity_id = r.activity_id AND att.user_id = r.user_id
      WHERE r.activity_id = $1 AND r.status <> 'cancelled'
      ORDER BY r.status, pr.full_name`,
    [activityId],
  );
}

export type ManagedActivity = OpportunityRow & {
  is_archived: boolean;
  /** Whether volunteers can see it at all — see the note in opportunities(). */
  is_published: boolean;
  is_open: boolean;
  cancelled_at: Date | null;
  cancel_reason: string | null;
  registration_closes_at: Date | null;
  attended_count: number;
};

export async function allActivities(): Promise<ManagedActivity[]> {
  return query<ManagedActivity>(
    /*
     * Everything the card states, fetched once. The attendance count is a
     * sub-select rather than another JOIN so that an activity nobody attended
     * still comes back with 0 instead of vanishing, and so the registration
     * count from activity_places is not multiplied by the attendance rows.
     */
    `SELECT a.id, a.title_ar, a.title_en, a.description_ar, a.description_en,
            a.location, a.starts_at, a.ends_at, a.capacity, a.min_stage,
            a.is_archived, a.is_open, a.is_published,
            a.cancelled_at, a.cancel_reason, a.registration_closes_at,
            p.taken, p.waiting, NULL::TEXT AS my_status,
            (SELECT count(*)::INT FROM activity_attendance att
              WHERE att.activity_id = a.id AND att.attended) AS attended_count
       FROM activities a
       JOIN activity_places p ON p.activity_id = a.id
      ORDER BY a.starts_at DESC NULLS LAST`,
  );
}

export type InterestedRow = {
  user_id: string;
  full_name: string;
  member_number: number | null;
  email: string;
  created_at: Date;
  notified_at: Date | null;
};

/**
 * Who has asked to be told when this activity opens.
 *
 * The coordinator needs this to decide whether the activity is worth
 * scheduling at all — twenty names is a different decision from two — and
 * afterwards to see that the message actually went out. Ordered by when people
 * put their names down, because that is the order they asked in.
 */
export async function interestedIn(activityId: string): Promise<InterestedRow[]> {
  return query<InterestedRow>(
    `SELECT i.user_id, p.full_name, p.member_number, u.email, i.created_at, i.notified_at
       FROM activity_interest i
       JOIN users u ON u.id = i.user_id
       JOIN profiles p ON p.user_id = i.user_id
      WHERE i.activity_id = $1
      ORDER BY i.created_at`,
    [activityId],
  );
}

/**
 * Every activity this person is waiting on, as a set.
 *
 * One query for a whole listing rather than one per card — the opportunities
 * page renders every open activity, and asking the database once per card is
 * how a page that was fast at ten becomes slow at fifty.
 */
export async function interestsOf(userId: string): Promise<Set<string>> {
  const rows = await query<{ activity_id: string }>(
    'SELECT activity_id FROM activity_interest WHERE user_id = $1',
    [userId],
  );
  return new Set(rows.map((r) => r.activity_id));
}

/** Whether this person is already waiting on this activity. */
export async function hasInterest(activityId: string, userId: string): Promise<boolean> {
  const row = await queryOne<{ ok: boolean }>(
    'SELECT true AS ok FROM activity_interest WHERE activity_id = $1 AND user_id = $2',
    [activityId, userId],
  );
  return Boolean(row?.ok);
}

/* isAwaitingDate lives in lib/activity-state.ts with the other pure state
 * rules — this module is `server-only`, and a rule the probes cannot import is
 * a rule nothing holds. */
export { isAwaitingDate } from './activity-state';

/** Minutes an activity is worth, from its own start and end. */
export function scheduledMinutes(a: { starts_at: Date | null; ends_at: Date | null }): number | null {
  if (!a.starts_at || !a.ends_at) return null;
  const ms = new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime();
  return ms > 0 ? Math.round(ms / 60_000) : null;
}
