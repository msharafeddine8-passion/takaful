'use server';

import { revalidatePath } from 'next/cache';
import { isDbConfigured } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability, type Capability } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';
import { addNote, editNote, archiveNote } from '@/lib/admin-notes';
import {
  archiveFieldDef,
  createFieldDef,
  fieldDef,
  fieldDefs,
  setValues,
  updateFieldDef,
  type DefInput,
  type ValueEntry,
} from '@/lib/profile-fields';
import { isFieldKind, isVisibility, type FieldOption } from '@/lib/profile-field-kinds';

/**
 * Writing a note about somebody, and declaring the fields a profile carries.
 *
 * THE PERMISSION CHECKS ARE HERE AND IN THE MODULES BELOW, AND NOWHERE IN A
 * COMPONENT. A check in JSX hides a button and leaves the POST working, and on
 * this feature that would mean anybody with a session writing a note onto
 * anybody's file, or adding a public field to every profile in the association.
 *
 * Everything arriving in the FormData is a claim. The subject, the note id, the
 * field id, the kind, the options and the values are all re-checked against the
 * database or against the closed sets in profile-field-kinds.ts. The only thing
 * taken from the session rather than from the form is who this is, which is the
 * one thing a form may never say.
 *
 * ── WHICH CAPABILITIES, AND WHY THEY ARE NOT THE SAME ONE ──────────────────
 *
 * Two different acts with two different audiences, so two capabilities. The
 * temptation is to put both behind members.manage because the same people hold
 * it today; authz.ts's own rule is that a capability is named after the act, so
 * that a role can be re-scoped later without hunting for checks.
 *
 * NOTES -> `members.manage`.
 *
 *   A note is an entry on one member's administrative file, read by staff and
 *   never by its subject. Every other write to a member's file already sits
 *   here: membership status, journey stage, volunteer roles, recognition. Its
 *   holders are program_admin and super_admin — and, just as importantly, it is
 *   narrower than hours.verify and practical.review, so a field supervisor who
 *   may verify an evening's hours cannot open somebody's private file. That is
 *   the right line for a record the person can never answer.
 *
 * FIELD DEFINITIONS -> `challenges.manage`.
 *
 *   A definition is on nobody's file in particular and on everybody's profile
 *   in general. authz.ts already draws exactly that distinction once: it gave
 *   challenges its own capability rather than reusing activities.manage,
 *   because "a challenge is an announcement to every volunteer about what the
 *   association is asking of them collectively — a different act from
 *   scheduling a field activity, even though the same people do both today."
 *   Adding a field called "الجامعة" is that same kind of announcement: every
 *   volunteer is now asked to record one more thing about themselves. So the
 *   act matches, and the holders — project_coordinator, program_admin,
 *   super_admin — are the people who run the volunteer programme, while
 *   content_manager, instructor, team_leader and field_supervisor are left out.
 *
 *   It is the wider of the two lists, and that is worth saying out loud: it
 *   widens who may declare a field, not who may read one. Migration 048's guard
 *   against a field called "ملاحظات صحية" is a warning on the screen, an
 *   inward-facing default and a closed set of kinds — never a narrow
 *   capability — and none of that is weakened here.
 *
 * VALUES ON A PERSON -> `members.manage`.
 *
 *   Filling in somebody's department is editing that person's record, which is
 *   the notes half rather than the definitions half.
 *
 * ── WHAT THE AUDIT LOG MAY SAY ABOUT A NOTE ────────────────────────────────
 *
 * That one was written, about whom, by whom, and when. NOT WHAT IT SAYS. The
 * argument is on each audit() call below and it is the sharpest rule in this
 * file, so it is also here: audit_logs is read by more people than a note is,
 * and copying the body into it would hand the wider audience the narrower
 * record while looking like diligence.
 */

/** Named once so the reasoning above has something to point at. */
const NOTES: Capability = 'members.manage';
const FIELDS: Capability = 'challenges.manage';

function localeOf(formData: FormData): Locale {
  const value = String(formData.get('lang') ?? 'ar');
  return isLocale(value) ? value : 'ar';
}

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim();
}

function flag(formData: FormData, name: string): boolean {
  const value = text(formData, name).toLowerCase();
  return value === 'on' || value === 'true' || value === '1';
}

/**
 * A sort order, as an integer or zero.
 *
 * Parsed rather than cast: a form saying "1e400" or "3; DROP" must become a
 * number here and stop, not reach a query as NaN and surface as a 500.
 */
function orderOf(formData: FormData): number {
  const raw = text(formData, 'sortOrder');
  if (!/^-?\d{1,6}$/.test(raw)) return 0;
  return Number(raw);
}

function refreshMember(lang: Locale, userId: string): void {
  revalidatePath(`/${lang}/staff/members/${userId}`);
  revalidatePath(`/${lang}/staff/members/${userId}/profile`);
}

// -------------------------------------------------------------------- notes

export async function addNoteAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const userId = text(formData, 'userId');
  const body = text(formData, 'body');
  if (!isDbConfigured() || !userId || !body) return;

  const actor = await requireCapability(NOTES);

  /*
   * The author is the actor. The form has no say in it, which is what makes
   * migration 048's argument work: a note somebody has to put their name to is
   * written differently from one that appears from nowhere.
   */
  const result = await addNote(userId, actor.id, body);
  if (!result.ok) return;

  await audit({
    actorId: actor.id,
    action: 'admin-note.added',
    targetType: 'user',
    targetId: userId,
    /*
     * THE ID, NEVER THE BODY.
     *
     * The log has to be able to answer "who has been writing notes about this
     * volunteer, and when" — that is the whole reason a note is attributable.
     * It must not become a second copy of what the note says. audit_logs is
     * read by whoever holds audit.read and is exported and kept; a note is read
     * on one member page by whoever holds members.manage. Copying the text
     * across would quietly publish the narrower record to the wider audience,
     * and would do it in the name of accountability.
     */
    newValue: { noteId: result.id },
  });

  refreshMember(lang, userId);
}

export async function editNoteAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const noteId = text(formData, 'noteId');
  const body = text(formData, 'body');
  if (!isDbConfigured() || !noteId || !body) return;

  const actor = await requireCapability(NOTES);

  const result = await editNote(noteId, actor.id, body);
  if (!result.ok) return;

  await audit({
    actorId: actor.id,
    action: 'admin-note.edited',
    targetType: 'user',
    /*
     * The subject comes back from the UPDATE rather than from the form. A form
     * that named both a note and a person could name a note about somebody else
     * and have the log record the wrong name against the right row.
     */
    targetId: result.subjectId,
    // Neither the old text nor the new one. Same argument as above, and it
    // bites harder here: previousValue would make audit_logs the only place
    // the withdrawn wording still exists.
    newValue: { noteId: result.id },
  });

  refreshMember(lang, result.subjectId);
}

export async function archiveNoteAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const noteId = text(formData, 'noteId');
  if (!isDbConfigured() || !noteId) return;

  const actor = await requireCapability(NOTES);

  const result = await archiveNote(noteId, actor.id);
  if (!result.ok) return;

  await audit({
    actorId: actor.id,
    action: 'admin-note.archived',
    targetType: 'user',
    targetId: result.subjectId,
    newValue: { noteId: result.id },
  });

  refreshMember(lang, result.subjectId);
}

// ------------------------------------------------------------- definitions

/**
 * The options for a select, as posted.
 *
 * One JSON array in a hidden field, because the alternative — options[0][ar],
 * options[0][en] — is a parser in a server action, and this one is three lines.
 * Malformed JSON is an empty list, which checkDef then refuses with 'no-options'
 * rather than a 500.
 */
function optionsOf(formData: FormData): FieldOption[] {
  const raw = text(formData, 'options');
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
      .map((entry) => ({
        value: String(entry.value ?? '').trim(),
        ar: String(entry.ar ?? '').trim(),
        en: String(entry.en ?? '').trim(),
      }));
  } catch {
    return [];
  }
}

/** Everything but the key, which only createFieldDefAction may set. */
function patchOf(formData: FormData): Omit<DefInput, 'key'> | null {
  const kind = text(formData, 'kind');
  const visibility = text(formData, 'visibility');
  // Checked against the closed sets rather than passed through to the CHECK
  // constraint, so a hand-built request is a no-op instead of a 500.
  if (!isFieldKind(kind) || !isVisibility(visibility)) return null;

  const labelAr = text(formData, 'labelAr');
  if (!labelAr) return null;

  const helpAr = text(formData, 'helpAr');
  const helpEn = text(formData, 'helpEn');

  return {
    labelAr,
    labelEn: text(formData, 'labelEn'),
    // Empty help is stored as NULL rather than as an empty string, so "there is
    // no help text" and "the help text is blank" are not two different facts.
    helpAr: helpAr || null,
    helpEn: helpEn || null,
    kind,
    options: optionsOf(formData),
    required: flag(formData, 'required'),
    visibility,
    sortOrder: orderOf(formData),
  };
}

function refreshFields(lang: Locale): void {
  // A definition changes every profile form and every profile page, so this is
  // the section rather than one member.
  revalidatePath(`/${lang}/staff/members`);
  revalidatePath(`/${lang}/account/profile`);
}

export async function createFieldDefAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const key = text(formData, 'key').toLowerCase();
  const patch = patchOf(formData);
  if (!isDbConfigured() || !key || !patch) return;

  const actor = await requireCapability(FIELDS);

  const result = await createFieldDef({ ...patch, key }, actor.id);
  if (!result.ok) return;

  await audit({
    actorId: actor.id,
    action: 'profile-field.created',
    targetType: 'profile_field',
    targetId: result.id,
    /*
     * The shape of the field, which is association configuration and about
     * nobody. `visibility` in particular belongs in the log: a field moving
     * outward is the change worth being able to find afterwards.
     */
    newValue: {
      key,
      kind: patch.kind,
      visibility: patch.visibility,
      required: patch.required,
    },
  });

  refreshFields(lang);
}

export async function updateFieldDefAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const fieldId = text(formData, 'fieldId');
  const patch = patchOf(formData);
  if (!isDbConfigured() || !fieldId || !patch) return;

  const actor = await requireCapability(FIELDS);

  /*
   * Read before the write so the log can say what the field used to be. Worth
   * the extra query for this one table: a field quietly moved from 'staff' to
   * 'public' is the change with the largest blast radius in the feature, and
   * "it was staff-only last week" has to be answerable.
   */
  const before = await fieldDef(fieldId);
  if (!before) return;

  const result = await updateFieldDef(fieldId, patch, actor.id);
  if (!result.ok) return;

  await audit({
    actorId: actor.id,
    action: 'profile-field.updated',
    targetType: 'profile_field',
    targetId: fieldId,
    previousValue: {
      key: before.key,
      kind: before.kind,
      visibility: before.visibility,
      required: before.required,
    },
    newValue: {
      key: before.key,
      kind: patch.kind,
      visibility: patch.visibility,
      required: patch.required,
    },
  });

  refreshFields(lang);
}

export async function archiveFieldDefAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const fieldId = text(formData, 'fieldId');
  if (!isDbConfigured() || !fieldId) return;

  const actor = await requireCapability(FIELDS);

  const result = await archiveFieldDef(fieldId, actor.id);
  if (!result.ok) return;

  await audit({
    actorId: actor.id,
    action: 'profile-field.archived',
    targetType: 'profile_field',
    targetId: fieldId,
  });

  refreshFields(lang);
}

// ----------------------------------------------------------------- answers

/**
 * Records somebody's answers to the custom fields.
 *
 * The definitions are read from the database first, so the form is never asked
 * what kind a field is — only which fields it is answering. A checkbox is read
 * by presence, because that is how every browser posts an unticked one; a
 * multiselect is read with getAll(), because that is how more than one arrives.
 *
 * A field the form did not mention at all is left alone rather than cleared. A
 * page that shows half the fields must not silently empty the other half, and
 * "the input was not on this form" and "somebody emptied the box" arrive
 * looking identical unless this is checked.
 */
export async function setFieldValuesAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const userId = text(formData, 'userId');
  if (!isDbConfigured() || !userId) return;

  const actor = await requireCapability(NOTES);

  const defs = await fieldDefs();
  const entries: ValueEntry[] = [];
  const keys: string[] = [];
  for (const def of defs) {
    const name = `value:${def.id}`;
    if (def.kind === 'checkbox') {
      entries.push({ fieldId: def.id, raw: formData.has(name) });
      keys.push(def.key);
      continue;
    }
    if (!formData.has(name)) continue;
    /*
     * String() rather than a cast: a FormData entry is a string or a File, and
     * a File coerced here becomes text that validateValue then refuses by kind.
     * Casting would have handed a File object to JSON.stringify instead.
     */
    const raw =
      def.kind === 'multiselect'
        ? formData.getAll(name).map((entry) => String(entry))
        : String(formData.get(name) ?? '');
    entries.push({ fieldId: def.id, raw });
    keys.push(def.key);
  }
  if (entries.length === 0) return;

  const result = await setValues(userId, actor.id, entries);
  if (!result.ok) return;

  await audit({
    actorId: actor.id,
    action: 'profile-field.values-set',
    targetType: 'user',
    targetId: userId,
    /*
     * WHICH FIELDS, NEVER THE ANSWERS.
     *
     * The same rule as the note body one floor up, and for the same reason: an
     * answer is the volunteer's own data, sitting behind a visibility the
     * definition sets, and copying it into audit_logs would route it around
     * that visibility to a different audience entirely. The log says that
     * somebody's fields were edited, by whom, and how many changed.
     */
    newValue: { fields: keys, written: result.written, cleared: result.cleared },
  });

  refreshMember(lang, userId);
}
