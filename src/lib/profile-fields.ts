import 'server-only';
import { randomUUID } from 'node:crypto';
import { query, queryOne, transaction } from './db';
import { isStaff } from './authz';
import type { SessionUser } from './auth';
import {
  isFieldKind,
  isVisibility,
  validateValue,
  visibleTo,
  type Audience,
  type FieldDef,
  type FieldKind,
  type FieldOption,
  type FieldValue,
  type ValueRefusal,
  type Visibility,
} from './profile-field-kinds';

/**
 * Reading and writing the columns nobody has to ship a migration for.
 *
 * The rules are next door in profile-field-kinds.ts, where a probe can reach
 * them without a database. This file is the part that cannot be pure: the
 * queries, the transaction that writes a person's answers, and the one place
 * that decides which of them a given viewer is allowed to see.
 *
 * ── WHAT THIS DELIBERATELY IS NOT ──────────────────────────────────────────
 *
 * A way to add fields the platform then reasons about. Migration 048 says it
 * plainly and it is repeated here because this is the file an import would be
 * added to: nothing in the gate, the certificates, the hours or the
 * safeguarding path may read a custom field. A rule that depends on a column an
 * admin can retire at 11pm is a rule that stops working at 11pm. These are for
 * recording and displaying, and this module exports nothing that would let one
 * be turned into a condition.
 *
 * It is also not a home for sensitive personal data. Date of birth, phone,
 * guardian details and the safeguarding fields have profiles_sensitive, which
 * no query here touches.
 *
 * ── THE VISIBILITY FILTER IS A WHERE CLAUSE, NOT A RENDER DECISION ─────────
 *
 * valuesFor() takes the viewer as a required argument with no default, and
 * filters in SQL. Both halves of that are deliberate.
 *
 * No default, because the tempting default is the permissive one — a call site
 * that forgot the argument would then quietly serve staff-only answers to a
 * public profile page, and it would look exactly like a call site that got it
 * right. TypeScript refuses to compile the forgetful version instead.
 *
 * In SQL, because a page that fetches everything and renders some of it is one
 * careless line away from rendering all of it, and the careless line is usually
 * added by somebody who never knew the filter existed.
 *
 * ── DATES ──────────────────────────────────────────────────────────────────
 *
 * The session runs GMT and the association is in Beirut. Every day handed
 * upward is produced by Postgres as 'YYYY-MM-DD' text, already shifted to
 * Asia/Beirut, and is text from there on.
 */

const beirutDay = (column: string) =>
  `to_char(${column} AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')`;

/*
 * Aliased snake_case and unquoted, because Postgres folds an unquoted alias to
 * lower case and `AS sortOrder` would arrive as `sortorder`. The mappers below
 * do the renaming, in one place each.
 */
const DEF_COLUMNS = `d.id, d.key, d.label_ar, d.label_en, d.help_ar, d.help_en,
  d.kind, d.options, d.required, d.visibility, d.sort_order,
  ${beirutDay('d.archived_at')} AS archived_on`;

type DefRow = {
  id: string;
  key: string;
  label_ar: string;
  label_en: string;
  help_ar: string | null;
  help_en: string | null;
  kind: string;
  options: unknown;
  required: boolean;
  sort_order: number;
  visibility: string;
  archived_on: string | null;
};

/**
 * JSONB arrives from the driver already parsed, and as whatever was stored —
 * which is not necessarily the shape this code expects. A row written by a
 * hand-run UPDATE must not take a page down for everybody, so every entry is
 * checked rather than cast.
 */
const toOptions = (raw: unknown): FieldOption[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
    .map((entry) => ({
      value: String(entry.value ?? ''),
      ar: String(entry.ar ?? ''),
      en: String(entry.en ?? ''),
    }))
    .filter((option) => option.value !== '');
};

const toDef = (row: DefRow): FieldDef => ({
  id: row.id,
  key: row.key,
  labelAr: row.label_ar,
  labelEn: row.label_en,
  helpAr: row.help_ar,
  helpEn: row.help_en,
  // The CHECK constraint already limits this column, so a row that fails the
  // guard means the constraint was dropped or the set grew without this file.
  // Falling back to 'text' keeps a page up; the probe is what notices.
  kind: isFieldKind(row.kind) ? row.kind : 'text',
  options: toOptions(row.options),
  required: row.required,
  // The inward default, matching the column's. A row that somehow says
  // something else must not be read as more public than it is.
  visibility: isVisibility(row.visibility) ? row.visibility : 'staff',
  sortOrder: Number(row.sort_order),
  archivedOn: row.archived_on,
});

/**
 * Every definition, in the order the forms and the profile show them.
 *
 * Retired definitions are left out unless asked for. Migration 048's rule is
 * that retiring a field hides it from forms and keeps every answer already
 * given, so the answers are still in the table — this is how somebody goes and
 * finds which field a stored answer belonged to.
 */
export async function fieldDefs(
  options: { includeArchived?: boolean } = {},
): Promise<FieldDef[]> {
  const rows = await query<DefRow>(
    `SELECT ${DEF_COLUMNS}
       FROM profile_field_defs d
      WHERE $1::boolean OR d.archived_at IS NULL
      ORDER BY d.sort_order, d.label_ar`,
    [options.includeArchived === true],
  );
  return rows.map(toDef);
}

/** One definition by id, archived or not, for the edit form and for writes. */
export async function fieldDef(id: string): Promise<FieldDef | null> {
  const row = await queryOne<DefRow>(
    `SELECT ${DEF_COLUMNS} FROM profile_field_defs d WHERE d.id = $1`,
    [id],
  );
  return row ? toDef(row) : null;
}

export type DefInput = {
  key: string;
  labelAr: string;
  labelEn: string;
  helpAr: string | null;
  helpEn: string | null;
  kind: FieldKind;
  options: FieldOption[];
  required: boolean;
  visibility: Visibility;
  sortOrder: number;
};

export type DefRefusal =
  | 'bad-key'
  | 'key-taken'
  | 'kind-locked'
  | 'bad-kind'
  | 'bad-visibility'
  | 'no-label'
  | 'no-options'
  | 'bad-options'
  | 'not-found'
  | 'db';

export type DefResult = { ok: true; id: string } | { ok: false; reason: DefRefusal };

/** The key rule, mirroring chk_pfd_key so a typo is a message, not a 500. */
const KEY = /^[a-z][a-z0-9_]{1,48}$/;

/**
 * Checks a definition against the same rules the CHECK constraints hold.
 *
 * Duplicated on purpose, and the duplication is not the usual mistake: the
 * constraints are the guarantee and this is the error message. Without it a
 * mistyped key surfaces as a 500 from a failed INSERT, which tells whoever
 * typed it nothing at all.
 */
function checkDef(input: DefInput): DefRefusal | null {
  if (!KEY.test(input.key)) return 'bad-key';
  if (!isFieldKind(input.kind)) return 'bad-kind';
  if (!isVisibility(input.visibility)) return 'bad-visibility';
  if (input.labelAr.trim() === '') return 'no-label';

  const needsOptions = input.kind === 'select' || input.kind === 'multiselect';
  if (needsOptions && input.options.length === 0) return 'no-options';
  if (!needsOptions && input.options.length > 0) return 'bad-options';
  if (needsOptions) {
    const values = input.options.map((option) => option.value.trim());
    // An option with no value cannot be stored, and two with the same value
    // make an answer ambiguous about which one somebody picked.
    if (values.some((value) => value === '')) return 'bad-options';
    if (new Set(values).size !== values.length) return 'bad-options';
    if (input.options.some((option) => option.ar.trim() === '')) return 'bad-options';
  }
  return null;
}

/**
 * Declares a new field.
 *
 * `by` is the actor from the session, written to created_by, so "who added the
 * field that asks every volunteer for their university" has an answer on the
 * row rather than only in the log.
 */
export async function createFieldDef(input: DefInput, by: string): Promise<DefResult> {
  const refusal = checkDef(input);
  if (refusal) return { ok: false, reason: refusal };

  try {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO profile_field_defs
         (id, key, label_ar, label_en, help_ar, help_en, kind, options,
          required, visibility, sort_order, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12)
       RETURNING id`,
      [
        randomUUID(),
        input.key,
        input.labelAr.trim(),
        input.labelEn.trim(),
        input.helpAr,
        input.helpEn,
        input.kind,
        JSON.stringify(input.options),
        input.required,
        input.visibility,
        input.sortOrder,
        by,
      ],
    );
    return row ? { ok: true, id: row.id } : { ok: false, reason: 'db' };
  } catch (error) {
    // key is UNIQUE, and a key already in use is a thing to say rather than a
    // stack trace: it is the one refusal somebody hits by working normally.
    if ((error as { code?: string }).code === '23505') return { ok: false, reason: 'key-taken' };
    return { ok: false, reason: 'db' };
  }
}

/** Everything about a definition that may change after answers exist. */
export type DefPatch = Omit<DefInput, 'key'>;

/**
 * Revises a definition.
 *
 * THE KEY IS NOT IN THE PATCH. Stored answers reference the definition by id
 * and people reference it by key; migration 048 says it may not change once
 * used, and the label is what gets corrected when the wording is wrong. Leaving
 * it out of the type is how that stops being a rule somebody has to remember.
 *
 * THE KIND IS FROZEN ONCE SOMEBODY HAS ANSWERED. Everything else may change
 * freely. A definition turned from `select` into `number` after fifty people
 * answered it leaves fifty stored values that no longer match their kind, and
 * migration 048 is explicit that Postgres cannot notice — validateValue only
 * runs on write, so nothing would ever re-examine them. They would simply
 * render as whatever they are, on profiles, indefinitely. The retype exists for
 * exactly this: retire the field and declare a new one, which keeps the old
 * answers readable as answers to the old question.
 *
 * `by` is recorded on the row.
 *
 * It was left out while profile_field_defs had created_by and archived_by and
 * no updated_by — a parameter with nowhere to go would have been a signature
 * promising what the schema did not keep. That was the right call about the
 * wrong schema. Migration 052 added the column, because the highest-blast-
 * radius edit in this whole feature is moving a field from 'staff' to
 * 'public', which puts every answer already given on the open web, and it was
 * the one change that left no trace on the row at all.
 *
 * The kind and key locks are now also enforced by trg_field_defs_before_update
 * rather than only here. The check below stays: it can say WHY, and it can say
 * it before the write instead of as an exception afterwards.
 */
export async function updateFieldDef(
  id: string,
  patch: DefPatch,
  by: string,
): Promise<DefResult> {
  try {
    return await transaction(async (client) => {
      const { rows } = await client.query<{
        key: string;
        kind: string;
        archived_at: string | null;
      }>(
        'SELECT key, kind, archived_at FROM profile_field_defs WHERE id = $1 FOR UPDATE',
        [id],
      );
      const existing = rows[0];
      if (!existing) return { ok: false as const, reason: 'not-found' as const };

      if (patch.kind !== existing.kind) {
        // Inside the same transaction as the row lock, so an answer arriving
        // between the check and the UPDATE cannot slip past it.
        const answered = await client.query(
          'SELECT 1 FROM profile_field_values WHERE field_id = $1 LIMIT 1',
          [id],
        );
        if (answered.rowCount && answered.rowCount > 0) {
          return { ok: false as const, reason: 'kind-locked' as const };
        }
      }

      // Checked with the row's own key, so the key rule is applied to what will
      // actually be stored rather than to whatever the form happened to carry.
      const refusal = checkDef({ ...patch, key: existing.key });
      if (refusal) return { ok: false as const, reason: refusal };

      await client.query(
        `UPDATE profile_field_defs
            SET label_ar = $2, label_en = $3, help_ar = $4, help_en = $5,
                kind = $6, options = $7::jsonb, required = $8,
                visibility = $9, sort_order = $10, updated_by = $11,
                updated_at = now()
          WHERE id = $1`,
        [
          id,
          patch.labelAr.trim(),
          patch.labelEn.trim(),
          patch.helpAr,
          patch.helpEn,
          patch.kind,
          JSON.stringify(patch.options),
          patch.required,
          patch.visibility,
          patch.sortOrder,
          by,
        ],
      );
      return { ok: true as const, id };
    });
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Retires a field.
 *
 * Hides it from every form and from valuesFor(), and keeps every answer already
 * given — the delete trigger in migration 048 refuses anything stronger, and
 * deleting the definition would take somebody's answer with it.
 */
export async function archiveFieldDef(id: string, by: string): Promise<DefResult> {
  try {
    const row = await queryOne<{ id: string }>(
      `UPDATE profile_field_defs
          SET archived_at = now(), archived_by = $2, updated_at = now()
        WHERE id = $1 AND archived_at IS NULL
        RETURNING id`,
      [id, by],
    );
    return row ? { ok: true, id: row.id } : { ok: false, reason: 'not-found' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

// --------------------------------------------------------------- the answers

export type FieldAnswer = {
  fieldId: string;
  key: string;
  labelAr: string;
  labelEn: string;
  helpAr: string | null;
  helpEn: string | null;
  kind: FieldKind;
  options: FieldOption[];
  visibility: Visibility;
  sortOrder: number;
  value: FieldValue;
  /** 'YYYY-MM-DD' in Beirut, as text. Never reconstruct a Date from it. */
  updatedOn: string;
};

/**
 * Which rung of the ladder this viewer stands on.
 *
 * `null` is a stranger and gets 'public'. Anybody signed in and active is a
 * volunteer. Staff are whoever isStaff() says, which is the same list the staff
 * area itself uses — one rule, not two.
 *
 * Suspended sessions never arrive here: currentUser() resolves them to null so
 * that a suspension takes effect immediately. The status test is repeated
 * anyway, because this function must be safe to call with any SessionUser
 * somebody happens to be holding.
 */
export function audienceOf(viewer: SessionUser | null): Audience {
  if (!viewer) return 'public';
  if (isStaff(viewer)) return 'staff';
  return viewer.status === 'active' ? 'volunteers' : 'public';
}

/**
 * A person's answers, as this viewer may see them.
 *
 * THE VIEWER IS REQUIRED AND HAS NO DEFAULT. See the header — a default here
 * would be the permissive one, and a forgotten argument would serve staff-only
 * answers to a public page while looking exactly like correct code. Pass `null`
 * for a signed-out reader; that is the narrowest audience, and saying it is one
 * word.
 *
 * Retired definitions are left out for everybody. A field the association has
 * withdrawn is not part of anybody's profile any more; the answer survives in
 * the table, and fieldDefs({ includeArchived: true }) is how it is found again.
 */
export async function valuesFor(userId: string, viewer: SessionUser | null): Promise<FieldAnswer[]> {
  const allowed = [...visibleTo(audienceOf(viewer))];

  const rows = await query<DefRow & { value: unknown; updated_on: string }>(
    /*
     * The filter is here rather than in the caller. `= ANY($2)` over the
     * audience's own list, so widening the ladder is a change to one array in
     * profile-field-kinds.ts and not a hunt through every read.
     *
     * Cast to text[] explicitly: an array parameter with nothing around it to
     * infer from makes Postgres refuse the statement outright with "could not
     * determine data type of parameter".
     */
    `SELECT ${DEF_COLUMNS}, v.value, ${beirutDay('v.updated_at')} AS updated_on
       FROM profile_field_values v
       JOIN profile_field_defs d ON d.id = v.field_id
      WHERE v.user_id = $1
        AND d.archived_at IS NULL
        AND d.visibility = ANY($2::text[])
      ORDER BY d.sort_order, d.label_ar`,
    [userId, allowed],
  );

  return rows.map((row) => {
    const def = toDef(row);
    return {
      fieldId: def.id,
      key: def.key,
      labelAr: def.labelAr,
      labelEn: def.labelEn,
      helpAr: def.helpAr,
      helpEn: def.helpEn,
      kind: def.kind,
      options: def.options,
      visibility: def.visibility,
      sortOrder: def.sortOrder,
      value: row.value as FieldValue,
      updatedOn: row.updated_on,
    };
  });
}

export type ValueEntry = { fieldId: string; raw: unknown };

export type SetResult =
  | { ok: true; written: number; cleared: number }
  | {
      ok: false;
      reason: 'unknown-field' | 'archived-field' | 'invalid' | 'db';
      /** Which answers were refused and why. Empty for the other reasons. */
      problems: { fieldId: string; refusal: ValueRefusal }[];
    };

/**
 * Records somebody's answers.
 *
 * All or nothing, inside one transaction. A form that submits six answers with
 * one bad date must not leave five of them written and the person wondering
 * which — and a half-written form re-rendered from the database looks like it
 * saved.
 *
 * EVERY DEFINITION IS RE-READ FROM THE DATABASE. The kind, the options and the
 * required flag are never taken from what was posted: a form is a claim about
 * what was on the screen, and the whole point of validateValue is lost if the
 * definition it validates against arrives from the same request as the value.
 *
 * A retired field is refused rather than ignored. It is not on any form, so a
 * write against one is either a stale tab or somebody hand-building a request,
 * and both are worth saying no to out loud.
 */
export async function setValues(
  userId: string,
  by: string,
  entries: ValueEntry[],
): Promise<SetResult> {
  if (entries.length === 0) return { ok: true, written: 0, cleared: 0 };

  const ids = [...new Set(entries.map((entry) => entry.fieldId))];

  try {
    return await transaction(async (client) => {
      const { rows } = await client.query<DefRow>(
        // ::uuid[] for the same reason as the text[] cast in valuesFor.
        `SELECT ${DEF_COLUMNS} FROM profile_field_defs d WHERE d.id = ANY($1::uuid[])`,
        [ids],
      );
      const defs = new Map(rows.map((row) => [row.id, toDef(row)]));

      if (defs.size !== ids.length) {
        return { ok: false as const, reason: 'unknown-field' as const, problems: [] };
      }
      for (const def of defs.values()) {
        if (def.archivedOn !== null) {
          return { ok: false as const, reason: 'archived-field' as const, problems: [] };
        }
      }

      /*
       * Validated in full before anything is written, so `problems` can name
       * every refused answer at once. Stopping at the first one makes somebody
       * fix a form field at a time and resubmit for each.
       */
      const problems: { fieldId: string; refusal: ValueRefusal }[] = [];
      const checked: { fieldId: string; value: FieldValue | null }[] = [];
      for (const entry of entries) {
        const found = defs.get(entry.fieldId);
        if (!found) continue;
        const verdict = validateValue(found, entry.raw);
        if (!verdict.ok) problems.push({ fieldId: entry.fieldId, refusal: verdict.reason });
        else checked.push({ fieldId: entry.fieldId, value: verdict.value });
      }
      if (problems.length > 0) {
        return { ok: false as const, reason: 'invalid' as const, problems };
      }

      let written = 0;
      let cleared = 0;
      for (const answer of checked) {
        if (answer.value === null) {
          /*
           * A cleared answer removes the row rather than storing a null, so
           * "never answered" and "answered and then cleared" are not two
           * different facts about somebody.
           *
           * profile_field_values is the one table in migration 048 with no
           * delete-refusing trigger, and that is the reason: an answer is a
           * person's own data and taking it back has to be possible. The
           * definitions and the notes are the rows that may not be deleted.
           */
          const result = await client.query(
            'DELETE FROM profile_field_values WHERE user_id = $1 AND field_id = $2',
            [userId, answer.fieldId],
          );
          cleared += result.rowCount ?? 0;
        } else {
          await client.query(
            `INSERT INTO profile_field_values (user_id, field_id, value, updated_by)
             VALUES ($1, $2, $3::jsonb, $4)
             ON CONFLICT (user_id, field_id)
             DO UPDATE SET value = EXCLUDED.value,
                           updated_by = EXCLUDED.updated_by,
                           updated_at = now()`,
            [userId, answer.fieldId, JSON.stringify(answer.value), by],
          );
          written += 1;
        }
      }
      return { ok: true as const, written, cleared };
    });
  } catch {
    return { ok: false, reason: 'db', problems: [] };
  }
}

/** Re-exported so a caller needs one import for the shapes and the queries. */
export { FIELD_KINDS, VISIBILITIES } from './profile-field-kinds';
export type {
  Audience,
  FieldDef,
  FieldKind,
  FieldOption,
  FieldValue,
  ValueRefusal,
  Visibility,
} from './profile-field-kinds';
