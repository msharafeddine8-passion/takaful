import 'server-only';
import { randomUUID } from 'node:crypto';
import { query, queryOne } from './db';

/**
 * Private notes the association keeps about a volunteer.
 *
 * Ordinary volunteer management: a supervisor writes down what was agreed in a
 * conversation, and the next person to work with that volunteer can read it.
 * The permission that opens this is resolved once by the action next door in
 * actions/admin-profile.ts, against the signed-in session. This file does not
 * decide who anybody is.
 *
 * ── THE SUBJECT MAY NEVER READ THEIR OWN NOTES ─────────────────────────────
 *
 * THERE IS NO FUNCTION IN THIS FILE THAT RETURNS NOTES TO THE PERSON THEY ARE
 * ABOUT, AND NO ARGUMENT ANYWHERE THAT COULD BE FLIPPED TO PRODUCE ONE.
 *
 * That is the rule the feature was asked for, and it is worth being deliberate
 * about rather than merely implementing: it means the association can hold an
 * opinion about somebody that they can never answer. Migration 048 says the
 * same thing at more length, and names the thing that makes it survivable —
 * every row carries the author, because a note somebody has to put their name
 * to is written differently from one that appears from nowhere.
 *
 * Structurally, the way that rule is kept here is by absence. `notesAbout` takes
 * one user id — the subject — and nothing else. It has no viewer, no audience,
 * no `includeOwn`, no boolean of any kind. There is deliberately no second read
 * function. So there is no call site anywhere in this codebase that can be
 * pointed at a reader instead of a subject, and adding one would mean adding a
 * function rather than passing a different argument to an existing one — which
 * is a change somebody has to write on purpose and a reviewer can see.
 *
 * probe-admin-profile reads this file as text and asserts exactly that: the
 * exported surface is four functions, the reader takes one parameter, and no
 * exported signature carries a flag.
 *
 * ── WHAT DOES NOT BELONG HERE ──────────────────────────────────────────────
 *
 * A safeguarding concern. It goes to safeguarding_records, which has a defined
 * handler, a retention rule and a route to the focal point; a note has none of
 * those and would leave a disclosure sitting in a text box with nobody owning
 * it. The schema cannot enforce that, so it is said on the note screen in both
 * languages and repeated here.
 *
 * ── DATES ──────────────────────────────────────────────────────────────────
 *
 * The session runs GMT and the association is in Beirut. Every day this file
 * hands upward is produced by Postgres as 'YYYY-MM-DD' text, already shifted to
 * Asia/Beirut, and is text from there on. Nothing downstream rebuilds a Date
 * from it: a note written at 00:30 Beirut on the 5th would read as the 4th the
 * moment anything did.
 */

/*
 * to_char over AT TIME ZONE, not the bare timestamp. Named once and reused,
 * because the correction is easy to leave out of exactly one query and
 * impossible to notice afterwards — the same note as in practical-submissions
 * and level-challenge-runs, and for the same reason.
 */
const beirutDay = (column: string) =>
  `to_char(${column} AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')`;

/*
 * Qualified with the table alias, because the join below reaches a second table
 * that also has a user_id and an unqualified column name in a join is a bug
 * waiting for somebody to add a column to the other one.
 *
 * Aliases are snake_case and unquoted on purpose: Postgres folds an unquoted
 * alias to lower case, so `AS createdOn` would arrive as `createdon` and read
 * as undefined. The mapper below does the renaming.
 */
const NOTE_COLUMNS = `n.id, n.user_id, n.author_id, n.body,
  ${beirutDay('n.created_at')} AS created_on,
  ${beirutDay('n.updated_at')} AS updated_on,
  (n.updated_by IS NOT NULL) AS edited`;

type NoteRow = {
  id: string;
  user_id: string;
  author_id: string;
  author_name: string | null;
  body: string;
  created_on: string;
  updated_on: string;
  edited: boolean;
};

export type AdminNote = {
  id: string;
  /** Who the note is about. */
  subjectId: string;
  authorId: string;
  /** The author's name, or '' when no profile row exists. Never a user id. */
  authorName: string;
  body: string;
  /** 'YYYY-MM-DD' in Beirut, as text. Never reconstruct a Date from it. */
  writtenOn: string;
  /** The same, for the last edit. Equal to writtenOn until somebody edits. */
  editedOn: string;
  /** Whether this text has been revised since it was written. */
  edited: boolean;
};

const toNote = (row: NoteRow): AdminNote => ({
  id: row.id,
  subjectId: row.user_id,
  authorId: row.author_id,
  authorName: row.author_name ?? '',
  body: row.body,
  writtenOn: row.created_on,
  editedOn: row.updated_on,
  edited: row.edited,
});

/** Body caps, so one paste cannot make a member page unreadable. */
export const MAX_NOTE = 4000;

/**
 * Every live note about this person, newest first.
 *
 * ONE PARAMETER, AND IT IS THE SUBJECT. See the header: there is no reader
 * argument here, which is what makes "the subject may never read their own
 * notes" a property of the shape of this function rather than a rule somebody
 * has to remember at every call site.
 *
 * Archived notes are excluded. Archiving is this feature's removal — the row
 * survives, because a note is somebody's record of a conversation and the
 * trigger in migration 048 refuses a DELETE outright.
 */
export async function notesAbout(userId: string): Promise<AdminNote[]> {
  const rows = await query<NoteRow>(
    /*
     * LEFT JOIN, not JOIN. A missing profile row must not make a note
     * disappear: an unattributed note a reader has to chase is far better than
     * a note that silently is not there, and the author_id column is still on
     * the row either way.
     *
     * One column is taken from profiles, and it is the name. Not p.* — the date
     * of birth and the safeguarding fields live in profiles_sensitive, which no
     * query in this file touches, and a convenience SELECT would put one a
     * single careless JSX line from a screen.
     */
    `SELECT ${NOTE_COLUMNS}, a.full_name AS author_name
       FROM admin_notes n
       LEFT JOIN profiles a ON a.user_id = n.author_id
      WHERE n.user_id = $1 AND n.archived_at IS NULL
      ORDER BY n.created_at DESC`,
    [userId],
  );
  return rows.map(toNote);
}

export type NoteResult =
  | { ok: true; id: string; subjectId: string }
  | { ok: false; reason: 'empty' | 'too-long' | 'not-found' | 'db' };

/**
 * Writes a note about somebody.
 *
 * `authorId` comes from the session by way of the action and never from a form.
 * The column is NOT NULL because an unattributable note is the failure mode
 * this table was shaped to avoid.
 */
export async function addNote(
  userId: string,
  authorId: string,
  body: string,
): Promise<NoteResult> {
  const text = body.trim();
  if (text === '') return { ok: false, reason: 'empty' };
  if (text.length > MAX_NOTE) return { ok: false, reason: 'too-long' };

  try {
    const row = await queryOne<{ id: string; user_id: string }>(
      `INSERT INTO admin_notes (id, user_id, author_id, body)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id`,
      [randomUUID(), userId, authorId, text],
    );
    return row
      ? { ok: true, id: row.id, subjectId: row.user_id }
      : { ok: false, reason: 'db' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Replaces what a note says.
 *
 * The row is kept and `body` becomes what it says now — that is migration 048's
 * choice, not this file's. `updated_by` records who revised it, so a note that
 * changed after a conversation still says whose hand changed it.
 *
 * Returns the subject as well as the id, so the caller can write an audit line
 * naming who the note is about without a second query for it.
 */
export async function editNote(id: string, by: string, body: string): Promise<NoteResult> {
  const text = body.trim();
  if (text === '') return { ok: false, reason: 'empty' };
  if (text.length > MAX_NOTE) return { ok: false, reason: 'too-long' };

  try {
    const row = await queryOne<{ id: string; user_id: string }>(
      // An archived note is not edited back into life. Un-archiving is a
      // separate act nobody has asked for, and doing it by accident through
      // the edit form would be indistinguishable from the note never having
      // been withdrawn.
      `UPDATE admin_notes
          SET body = $3, updated_at = now(), updated_by = $2
        WHERE id = $1 AND archived_at IS NULL
        RETURNING id, user_id`,
      [id, by, text],
    );
    return row
      ? { ok: true, id: row.id, subjectId: row.user_id }
      : { ok: false, reason: 'not-found' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Withdraws a note.
 *
 * Archiving, never deleting — the trigger in migration 048 refuses a DELETE and
 * the only way past it is a deliberate transaction with
 * `SET LOCAL takaful.allow_delete = 'on'` in it. Nothing in the application
 * takes that hatch.
 */
export async function archiveNote(id: string, by: string): Promise<NoteResult> {
  try {
    const row = await queryOne<{ id: string; user_id: string }>(
      // archived_at and archived_by move together; the CHECK constraint refuses
      // a row where one is set and the other is not.
      `UPDATE admin_notes
          SET archived_at = now(), archived_by = $2
        WHERE id = $1 AND archived_at IS NULL
        RETURNING id, user_id`,
      [id, by],
    );
    return row
      ? { ok: true, id: row.id, subjectId: row.user_id }
      : { ok: false, reason: 'not-found' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}
