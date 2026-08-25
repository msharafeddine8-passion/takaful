import 'server-only';
import { query, queryOne } from './db';

/**
 * Reading the hours ledger.
 *
 * Every total in the product comes from here. If the dashboard, a certificate
 * and an export ever disagree about how many hours someone has given, it is
 * because someone computed a total somewhere else - so don't.
 */

/* Declared in lib/hours-ledger.ts and re-exported, not declared twice. That
 * module is pure and this one is `server-only`, so a second declaration here
 * would be the copy a probe cannot reach and therefore the copy that drifts. */
export type { HourStatus } from './hours-ledger';
import type { HourStatus } from './hours-ledger';

export type HourEntry = {
  id: string;
  /**
   * 'YYYY-MM-DD', as text and never as a Date.
   *
   * `worked_on` is a DATE — a day somebody wrote down, carrying no time and no
   * zone. Handed to pg it arrives as a Date at the *server's* local midnight,
   * and every render of it in this repository was
   * `new Date(x).toISOString().slice(0, 10)`, which reads that back in GMT: on
   * any machine east of London the day comes out one earlier. Text in, text
   * out, and there is no instant for a zone to be wrong about.
   */
  worked_on: string;
  minutes: number;
  note: string | null;
  status: HourStatus;
  activity_title_ar: string | null;
  activity_title_en: string | null;
  verified_at: Date | null;
  reject_reason: string | null;
  corrects_id: string | null;
  /*
   * Hours carried forward from before the platform. Not a day of work: one
   * row covering a period, with the note saying which period.
   *
   * Read here so the ledger can say that, rather than printing a hundred and
   * twenty hours against a single Tuesday and leaving the volunteer to work
   * out what happened to them.
   */
  carried_over: boolean;
};

/** Verified minutes only. Pending hours are not hours yet. */
export async function verifiedMinutes(userId: string): Promise<number> {
  const row = await queryOne<{ minutes: string }>(
    'SELECT minutes FROM verified_minutes WHERE user_id = $1',
    [userId],
  );
  // COUNT/SUM come back as strings from pg: they are bigint, and bigint does
  // not fit a JavaScript number in general. These do, but parse explicitly
  // rather than relying on coercion.
  return row ? Number.parseInt(row.minutes, 10) : 0;
}

export async function pendingMinutes(userId: string): Promise<number> {
  const row = await queryOne<{ minutes: string }>(
    `SELECT COALESCE(SUM(minutes), 0)::BIGINT AS minutes
       FROM hour_entries WHERE user_id = $1 AND status = 'pending'`,
    [userId],
  );
  return row ? Number.parseInt(row.minutes, 10) : 0;
}

/**
 * How many entries are sitting with a supervisor, not how long they add up to.
 *
 * A duration on its own does not answer the question somebody actually has,
 * which is whether anybody has looked yet. Counted over the whole ledger rather
 * than over the fifty rows the page lists, so the sentence cannot quietly
 * disagree with the figure beside it.
 */
export async function pendingEntryCount(userId: string): Promise<number> {
  const row = await queryOne<{ n: string }>(
    `SELECT count(*)::BIGINT AS n
       FROM hour_entries WHERE user_id = $1 AND status = 'pending'`,
    [userId],
  );
  return row ? Number.parseInt(row.n, 10) : 0;
}

export async function entriesFor(userId: string, limit = 50): Promise<HourEntry[]> {
  return query<HourEntry>(
    /* to_char, not the DATE itself — see the note on HourEntry.worked_on. */
    `SELECT h.id, to_char(h.worked_on, 'YYYY-MM-DD') AS worked_on,
            h.minutes, h.note, h.status, h.carried_over,
            a.title_ar AS activity_title_ar, a.title_en AS activity_title_en,
            h.verified_at, h.reject_reason, h.corrects_id
       FROM hour_entries h
       LEFT JOIN activities a ON a.id = h.activity_id
      WHERE h.user_id = $1
      ORDER BY h.worked_on DESC, h.created_at DESC
      LIMIT $2`,
    [userId, limit],
  );
}

export type PendingReview = HourEntry & {
  user_id: string;
  full_name: string;
};

/** The verification queue, oldest first: nobody should wait longer than anyone else. */
export async function awaitingVerification(limit = 100): Promise<PendingReview[]> {
  return query<PendingReview>(
    `SELECT h.id, h.user_id, p.full_name,
            to_char(h.worked_on, 'YYYY-MM-DD') AS worked_on,
            h.minutes, h.note, h.status, h.carried_over,
            a.title_ar AS activity_title_ar, a.title_en AS activity_title_en,
            h.verified_at, h.reject_reason, h.corrects_id
       FROM hour_entries h
       JOIN profiles p ON p.user_id = h.user_id
       LEFT JOIN activities a ON a.id = h.activity_id
      WHERE h.status = 'pending'
      ORDER BY h.created_at ASC
      LIMIT $1`,
    [limit],
  );
}

/** Highest stage reached, or 0 for someone who has not started. */
export async function currentStage(userId: string): Promise<number> {
  const row = await queryOne<{ stage: number }>(
    'SELECT MAX(stage) AS stage FROM stage_progress WHERE user_id = $1',
    [userId],
  );
  return row?.stage ?? 0;
}

export type Activity = {
  id: string;
  title_ar: string;
  title_en: string;
  starts_on: Date | null;
};

export async function openActivities(): Promise<Activity[]> {
  return query<Activity>(
    `SELECT id, title_ar, title_en, starts_on
       FROM activities
      WHERE is_archived = false
      ORDER BY starts_on DESC NULLS LAST, title_ar ASC`,
  );
}

/**
 * Minutes to a display string, in the reader's language.
 *
 * The implementation moved to `@/lib/format`, byte-identical, and is
 * re-exported here so every existing caller keeps working unchanged.
 *
 * The move is the point: this module is `import 'server-only'`, so for as long
 * as the only locale-aware formatter in the codebase lived here, no client
 * component could reach it — and each one grew its own inline arithmetic
 * instead. `@/lib/format` carries no such marker, so a server page, a client
 * component and a probe can all import the same function.
 *
 * Prefer importing from '@/lib/format' in new code.
 */
export { formatDuration } from './format';
