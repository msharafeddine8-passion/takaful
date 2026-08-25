/**
 * What each line of the hours ledger actually says.
 *
 * The ledger holds three different kinds of row that the page was drawing as
 * one. An ordinary logged session; a carry-over, which is one staff decision
 * covering years of service and belongs to no single day; and a correction,
 * which is a *negative* row inserted beside the entry it reverses because the
 * original is never edited — see lib/actions/hours.ts.
 *
 * Drawn as one they lied in three ways at once. A carry-over printed a hundred
 * and twenty hours against a single Tuesday. A correction printed the word
 * «تصحيح» in brackets and a negative duration, and nothing else: the note
 * carrying the grounds for it was never rendered, because the page only ever
 * showed `reject_reason`, and only on a rejected row — so the volunteer whose
 * hours had just been reduced was shown the reduction and not the reason. And a
 * session logged by hand with a note but no activity printed «—», so what the
 * person wrote about their own afternoon was on the screen nowhere.
 *
 * Separating the magnitude from the direction is deliberate rather than tidy:
 * lib/when's formatDuration — the counted-noun one, which this page needs for
 * «ساعتان» — answers «—» for anything at or below zero, so a reversal handed to
 * it whole renders as an em dash and no figure at all.
 *
 * Deciding that here rather than in JSX is what lets a probe hold it. Pure, and
 * no `server-only`, so scripts/probe-hours-ledger.mts can import it.
 */

import type { Locale } from './i18n';

export type HourStatus = 'pending' | 'verified' | 'rejected' | 'corrected';

/** One row as the database keeps it. `worked_on` is text, never a Date: the
 *  session runs GMT and the association is in Beirut. */
export type LedgerEntry = {
  id: string;
  worked_on: string;
  minutes: number;
  note: string | null;
  status: HourStatus;
  carried_over: boolean;
  corrects_id: string | null;
  reject_reason: string | null;
  activity_title_ar: string | null;
  activity_title_en: string | null;
};

export type LedgerKind =
  | 'logged'      // a session somebody wrote down
  | 'carried'     // service from before this platform, credited by staff
  | 'correction'; // a reversal of an earlier row, written by staff

export type LedgerRow = {
  id: string;
  kind: LedgerKind;
  /**
   * How the date is to be read. A carry-over is counted *up to* its date and
   * was not worked on it, and a page that prints the bare day is telling
   * somebody they did six years of volunteering on one Tuesday.
   */
  dateMeaning: 'worked-on' | 'counted-up-to';
  date: string;
  /** Always positive. The sign the database keeps lives in `direction`. */
  minutes: number;
  direction: 'added' | 'removed';
  status: HourStatus;
  /**
   * A later correction reversed this row. It stays in the list and says so —
   * nothing is ever removed from a ledger a person may be asked to explain.
   */
  superseded: boolean;
  /** What the volunteer wrote about their own session, if anything. */
  ownNote: string | null;
  /**
   * What a member of staff wrote: the period a carry-over covers, the grounds
   * for a correction, or why an entry was not verified. Named for who wrote it
   * rather than for the decision, so the page can attribute it — an unattributed
   * sentence under somebody's own hours reads as the site's verdict on them.
   */
  staffNote: string | null;
  /** The named activity, when the entry came from one. */
  activity: { ar: string; en: string } | null;
  /** Whether this row is in the verified total today. */
  counts: boolean;
};

/**
 * Every entry, in the order given, as rows that say what they are.
 *
 * Deliberately total: the output has exactly one row per entry and drops
 * nothing. A ledger that hides a line is a ledger nobody can reconcile, and a
 * volunteer disputing a figure needs to see the row that moved it.
 */
export function ledgerRows(entries: readonly LedgerEntry[]): LedgerRow[] {
  return entries.map((e) => {
    const kind: LedgerKind = e.corrects_id ? 'correction' : e.carried_over ? 'carried' : 'logged';

    /*
     * The note means different things depending on who wrote it. On a logged
     * session it is the volunteer's own; on a carry-over and on a correction it
     * is the staff member's account of a decision they made about somebody
     * else's record.
     */
    const note = e.note?.trim() ? e.note.trim() : null;
    const reject = e.reject_reason?.trim() ? e.reject_reason.trim() : null;

    return {
      id: e.id,
      kind,
      dateMeaning: kind === 'carried' ? 'counted-up-to' : 'worked-on',
      date: e.worked_on,
      minutes: Math.abs(e.minutes),
      direction: e.minutes < 0 ? 'removed' : 'added',
      status: e.status,
      superseded: e.status === 'corrected',
      ownNote: kind === 'logged' ? note : null,
      staffNote: kind === 'logged' ? reject : note,
      activity:
        e.activity_title_ar || e.activity_title_en
          ? { ar: e.activity_title_ar ?? '', en: e.activity_title_en ?? '' }
          : null,
      counts: e.status === 'verified',
    };
  });
}

/** The activity's title in the reader's language, or null when there was none. */
export function activityTitle(row: LedgerRow, lang: Locale): string | null {
  if (!row.activity) return null;
  const title = lang === 'ar' ? row.activity.ar : row.activity.en;
  return title || row.activity.ar || row.activity.en || null;
}

/**
 * The tone of each status pill.
 *
 * Tokens only, and the *reading* colours for the text: --color-ok and
 * --color-danger are surface colours and fall under 4.5:1 as small text on
 * their own tint. See the note above TONE in lib/credential-view.ts, which
 * chose these same pairs for the same measured reason.
 *
 * 'corrected' is deliberately neutral rather than red. The row was superseded
 * by a staff decision; it is not the volunteer's error and must not be coloured
 * as one.
 */
export const LEDGER_TONE: Record<HourStatus, string> = {
  pending: 'border-warn/40 bg-warn/10 text-warn-text',
  verified: 'border-ok/40 bg-ok/10 text-ok-text',
  rejected: 'border-danger/40 bg-danger/10 text-danger-text',
  corrected: 'border-line bg-surface-2 text-ink-2',
};
