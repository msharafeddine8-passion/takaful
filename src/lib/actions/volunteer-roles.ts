'use server';

import { revalidatePath } from 'next/cache';
import { isDbConfigured } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';
import {
  archiveRole,
  createRole,
  endRole,
  restoreRole,
  roleSubject,
  updateRole,
  type RoleEntity,
  type RolePatch,
  type WriteProblem,
} from '@/lib/volunteer-roles';
import {
  isPrecision,
  isVisibility,
  type DatePrecision,
  type RoleAchievement,
  type Visibility,
} from '@/lib/volunteer-role-view';

/**
 * An administrator recording what somebody is, and has been, in Takaful.
 *
 * ── THE PERMISSION CHECK IS HERE AND IN THE MODULE, AND NOWHERE IN A
 *    COMPONENT ─────────────────────────────────────────────────────────────
 *
 * A check in JSX hides a button and leaves the POST working. On this feature
 * that would mean anybody with a session writing «رئيس الجمعية» onto their own
 * profile — a title the association's own paperwork treats as a fact — or
 * quietly ending somebody else's. Every one of these functions asserts
 * members.manage against the SESSION before it reads a single field, and
 * requireCapability throws rather than returning a boolean a caller can forget
 * to look at.
 *
 * EVERY FIELD ARRIVING IN FormData IS A CLAIM. The user id, the role id, the
 * dates, the precision, the visibility: all of them are parsed and checked, and
 * the merged result is validated against what is actually stored before any
 * write. The only thing taken from the session rather than from the form is who
 * the actor is — which is the one thing a form may never say, because a form
 * that could name its own author could name somebody else.
 *
 * ── WHICH CAPABILITY, AND WHY ──────────────────────────────────────────────
 *
 * `members.manage` — program_admin and super_admin.
 *
 * It is the existing capability for administering a person's standing in the
 * association: granting and revoking a role in user_roles, suspending an
 * account, and everything else on /staff/members/[id]. Writing what somebody IS
 * in the association is the same act on the same screen about the same person,
 * and it is held by the same two roles the brief describes as the admin.
 *
 * No new capability is invented, and the two near misses are worth naming so
 * that nobody adds one later:
 *
 *   `stages.award` is the closest in spirit — a judgement about a person, held
 *   by the same two roles — but it advances somebody through the six stages of
 *   the journey, which the platform confers. A committee presidency is not
 *   conferred by this software; it is recorded by it.
 *
 *   `members.manage` is emphatically NOT the same thing as the role being
 *   written. Migration 046 is explicit: user_roles is what somebody may DO in
 *   the software, volunteer_roles is what they ARE in the association. Somebody
 *   titled «رئيس لجنة الإعلام» here holds no extra permission at all, and this
 *   file must never grant one. Nothing below touches user_roles.
 *
 * ── AUDIT ──────────────────────────────────────────────────────────────────
 *
 * Every create, update, end and archive writes a line. The brief asks for it by
 * name: "Admin Layal assigned رئيس لجنة الإعلام to Mohammad". So the target is
 * the PERSON — targetType 'user', targetId their user id — because audit_logs
 * is read as "who has been doing what to whom", and a log keyed on a role id
 * would answer "what happened to row 7f3a…" instead. The title travels in the
 * value so the line reads as a sentence without a second query.
 */

function localeOf(formData: FormData): Locale {
  const value = String(formData.get('lang') ?? 'ar');
  return isLocale(value) ? value : 'ar';
}

const text = (formData: FormData, name: string): string =>
  String(formData.get(name) ?? '').trim();

/** A checkbox is present or it is not; 'false' is included for a hidden field. */
const flag = (formData: FormData, name: string): boolean => {
  const raw = text(formData, name).toLowerCase();
  return raw === 'on' || raw === 'true' || raw === '1' || raw === 'yes';
};

/** Anything unrecognised becomes 'day' — the column's own default. */
const precision = (formData: FormData, name: string): DatePrecision => {
  const raw = text(formData, name);
  return isPrecision(raw) ? raw : 'day';
};

/**
 * The visibility, defaulting inward.
 *
 * A form field that arrives misspelled must not become 'public'. The default is
 * the column's — 'volunteers' — for the reason migration 046 gives: a list of
 * who ran what is a different thing to put on the open web from a name and a
 * photograph somebody chose to publish.
 */
const visibilityOf = (formData: FormData): Visibility => {
  const raw = text(formData, 'visibility');
  return isVisibility(raw) ? raw : 'volunteers';
};

/**
 * What the role was attached to, as one value.
 *
 * The form may send an id or a name and must not send both — chk_vr_entity
 * refuses that row, and two answers to "what was this attached to" is one
 * answer too many. The id wins if a crafted post sends both, because it is the
 * more specific claim and because silently taking the free-text one would be
 * the wrong half to trust.
 */
function entityOf(formData: FormData): RoleEntity | null {
  const kind = text(formData, 'entityKind');
  const id = text(formData, 'entityId');
  const name = text(formData, 'entityName');
  if (kind && id) return { kind, id };
  if (name) return { name };
  return null;
}

/**
 * Achievements, as parallel lists from the form.
 *
 * getAll rather than one field per index, so adding a row in the browser does
 * not require the server to know how many there are. The two lists are zipped
 * and anything empty in both languages is dropped by cleanAchievements.
 */
function achievementsOf(formData: FormData): RoleAchievement[] {
  const ar = formData.getAll('achievementAr').map((v) => String(v ?? '').trim());
  const en = formData.getAll('achievementEn').map((v) => String(v ?? '').trim());
  const out: RoleAchievement[] = [];
  for (let i = 0; i < Math.max(ar.length, en.length); i++) {
    out.push({ ar: ar[i] ?? '', en: en[i] ?? '' });
  }
  return out;
}

/**
 * What the form is told when a write is refused.
 *
 * The reasons come straight back from the module rather than being flattened
 * into one 'failed': "the end date is before the start date" and "this role is
 * marked current and given an end date" are two different typos, and an
 * administrator who is told only that something went wrong retypes the same
 * form and gets the same nothing.
 */
export type RoleFormState = {
  ok?: boolean;
  id?: string;
  error?: WriteProblem | 'unavailable' | 'no-person';
  /*
   * What was typed, handed back so a refusal does not empty the form. Somebody
   * who fills in eight fields and gets one date wrong should not lose the other
   * seven — that is how a role ends up never being recorded.
   */
  values?: Record<string, string>;
};

const FORM_FIELDS = [
  'userId', 'roleId', 'titleAr', 'titleEn', 'roleType',
  'entityKind', 'entityId', 'entityName',
  'startedOn', 'startedPrec', 'endedOn', 'endedPrec',
  'isCurrent', 'description', 'visibility',
];

function echo(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of FORM_FIELDS) {
    const value = formData.get(name);
    if (typeof value === 'string' && value !== '') out[name] = value;
  }
  return out;
}

/** Both places a role is read from. The public profile follows when it exists. */
function refresh(lang: Locale, userId: string): void {
  revalidatePath(`/${lang}/staff/members/${userId}`);
  revalidatePath(`/${lang}/staff/members/${userId}/profile`);
}

// ------------------------------------------------------------------- create

/**
 * Records a role against somebody.
 *
 * ADDS A ROW. It touches no other role, which is how appointing a successor
 * works here: end the outgoing one, add the incoming one, and the association
 * keeps both facts. There is deliberately no action that does the two together.
 *
 * The title is not checked against anything. There is no list of permitted
 * titles in this file, in the module, or in the schema — see the head of
 * migration 046. Whatever the administrator types is what the association
 * calls it.
 */
export async function createRoleAction(
  _prev: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'unavailable', values: echo(formData) };

  const userId = text(formData, 'userId');
  if (!userId) return { error: 'no-person', values: echo(formData) };

  const actor = await requireCapability('members.manage');

  const titleAr = text(formData, 'titleAr');
  const titleEn = text(formData, 'titleEn');
  const endedOn = text(formData, 'endedOn') || null;

  /*
   * "Still doing it" is read from the form when the form says anything about
   * it, and inferred from the absence of an end date otherwise.
   *
   * It is NOT derived from `endedOn === null` unconditionally, because that is
   * the derivation migration 046 refuses: a role that finished in 2023 on a day
   * nobody wrote down has no end date and is not current, and inferring
   * otherwise resurrects it. A form that ticks "current" AND gives an end date
   * is a contradiction, and checkPeriod refuses it rather than this quietly
   * picking a winner.
   */
  const isCurrent =
    formData.get('isCurrent') !== null ? flag(formData, 'isCurrent') : endedOn === null;

  const result = await createRole({
    userId,
    titleAr,
    titleEn,
    roleType: text(formData, 'roleType') || null,
    entity: entityOf(formData),
    startedOn: text(formData, 'startedOn') || null,
    startedPrec: precision(formData, 'startedPrec'),
    endedOn,
    endedPrec: precision(formData, 'endedPrec'),
    isCurrent,
    description: text(formData, 'description') || null,
    achievements: achievementsOf(formData),
    visibility: visibilityOf(formData),
    actorId: actor.id,
  });

  if (!result.ok) return { error: result.reason, values: echo(formData) };

  await audit({
    actorId: actor.id,
    action: 'volunteer-role.created',
    targetType: 'user',
    targetId: userId,
    newValue: {
      roleId: result.role.id,
      titleAr: result.role.titleAr,
      titleEn: result.role.titleEn,
      roleType: result.role.roleType,
      startedOn: result.role.startedOn,
      endedOn: result.role.endedOn,
      isCurrent: result.role.isCurrent,
      visibility: result.role.visibility,
    },
  });

  refresh(lang, userId);
  return { ok: true, id: result.role.id };
}

// ------------------------------------------------------------------- update

/**
 * Corrects a role.
 *
 * The patch carries only the fields the form actually sent, so a partial form
 * cannot blank a description or a title by omission. What is stored is re-read
 * under a lock inside updateRole and the merged result validated there; nothing
 * here trusts the copy the page was rendered from.
 *
 * The previous values go into the audit line beside the new ones. A correction
 * that silently replaced a date would leave the log saying an edit happened and
 * not what it changed, which is the half of the record somebody actually needs
 * when they ask why their start date moved.
 */
export async function updateRoleAction(
  _prev: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'unavailable', values: echo(formData) };

  const roleId = text(formData, 'roleId');
  if (!roleId) return { error: 'not-found', values: echo(formData) };

  const actor = await requireCapability('members.manage');

  const before = await roleSubject(roleId);
  if (!before) return { error: 'not-found', values: echo(formData) };

  /* Only what the form sent. `has` and not a truthiness test: an empty string
   * from a field that IS on the form is a deliberate clearing, and treating it
   * as absent would make "remove the description" impossible. */
  const has = (name: string) => formData.get(name) !== null;
  const patch: RolePatch = {};
  if (has('titleAr')) patch.titleAr = text(formData, 'titleAr');
  if (has('titleEn')) patch.titleEn = text(formData, 'titleEn');
  if (has('roleType')) patch.roleType = text(formData, 'roleType') || null;
  if (has('entityKind') || has('entityId') || has('entityName')) {
    patch.entity = entityOf(formData);
  }
  if (has('startedOn')) patch.startedOn = text(formData, 'startedOn') || null;
  if (has('startedPrec')) patch.startedPrec = precision(formData, 'startedPrec');
  if (has('endedOn')) patch.endedOn = text(formData, 'endedOn') || null;
  if (has('endedPrec')) patch.endedPrec = precision(formData, 'endedPrec');
  if (has('isCurrent')) patch.isCurrent = flag(formData, 'isCurrent');
  if (has('description')) patch.description = text(formData, 'description') || null;
  if (has('visibility')) patch.visibility = visibilityOf(formData);
  if (formData.getAll('achievementAr').length || formData.getAll('achievementEn').length) {
    patch.achievements = achievementsOf(formData);
  }

  const result = await updateRole(roleId, patch, actor.id);
  if (!result.ok) return { error: result.reason, values: echo(formData) };

  await audit({
    actorId: actor.id,
    action: 'volunteer-role.updated',
    targetType: 'user',
    targetId: before.userId,
    previousValue: { roleId, titleAr: before.titleAr, titleEn: before.titleEn },
    newValue: {
      roleId,
      titleAr: result.role.titleAr,
      titleEn: result.role.titleEn,
      startedOn: result.role.startedOn,
      endedOn: result.role.endedOn,
      isCurrent: result.role.isCurrent,
      visibility: result.role.visibility,
    },
  });

  refresh(lang, before.userId);
  return { ok: true, id: roleId };
}

// ---------------------------------------------------------------------- end

/**
 * Ends a role, on a date or with none.
 *
 * The action a new appointment is made of, and the reason there is no
 * "transfer": the outgoing president's row is closed and the incoming
 * president's row is created, so both facts survive. This clears nothing —
 * endRole writes is_current and the two end columns and touches no other.
 *
 * A blank end date is allowed and means "it finished, on a day nobody wrote
 * down". That is a real state in this schema, not a missing field.
 */
export async function endRoleAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const roleId = text(formData, 'roleId');
  if (!isDbConfigured() || !roleId) return;

  const actor = await requireCapability('members.manage');

  const before = await roleSubject(roleId);
  if (!before) return;

  const result = await endRole(
    roleId,
    text(formData, 'endedOn') || null,
    precision(formData, 'endedPrec'),
    actor.id,
  );
  if (!result.ok) return;

  await audit({
    actorId: actor.id,
    action: 'volunteer-role.ended',
    targetType: 'user',
    targetId: before.userId,
    /* The title in both halves, because a log line saying only "ended" leaves
     * the reader to guess which of somebody's four roles it was about. */
    previousValue: { roleId, titleAr: before.titleAr, isCurrent: true },
    newValue: {
      roleId,
      titleAr: result.role.titleAr,
      endedOn: result.role.endedOn,
      endedPrec: result.role.endedPrec,
      isCurrent: false,
    },
  });

  refresh(lang, before.userId);
}

// ------------------------------------------------------------------ archive

/**
 * Takes a role off the profile without taking it out of the record.
 *
 * A reason is required, and stored on the ROW as well as the audit line.
 *
 * This file argued the other way first, and the argument was good: require a
 * reason and an administrator leaves a wrong role sitting on somebody's
 * profile rather than write an essay to remove it. But that is an argument
 * against an essay. Migration 050 added archive_reason and the form offers the
 * three ordinary reasons as one tap each — added by mistake, wrong person,
 * duplicate — with a free field for anything else.
 *
 * On the row and not only in the log, because "why did this disappear from my
 * record?" is asked while looking at the record, and an answer that lives only
 * in a table staff can read is not an answer the person affected can reach.
 */
export async function archiveRoleAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const roleId = text(formData, 'roleId');
  if (!isDbConfigured() || !roleId) return;

  const actor = await requireCapability('members.manage');

  const before = await roleSubject(roleId);
  if (!before) return;

  const result = await archiveRole(roleId, actor.id, text(formData, 'reason'));
  if (!result.ok) return;

  await audit({
    actorId: actor.id,
    action: 'volunteer-role.archived',
    targetType: 'user',
    targetId: before.userId,
    previousValue: { roleId, titleAr: before.titleAr, titleEn: before.titleEn },
    newValue: { roleId, archived: true },
    reason: text(formData, 'reason') || undefined,
  });

  refresh(lang, before.userId);
}

/**
 * Puts an archived role back, for the archive made in error.
 *
 * Logged as its own action rather than as an update, because "who removed this
 * and who put it back" is a different question from "who edited it" and the
 * two should not have to be told apart by reading a diff.
 */
export async function restoreRoleAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const roleId = text(formData, 'roleId');
  if (!isDbConfigured() || !roleId) return;

  const actor = await requireCapability('members.manage');

  const before = await roleSubject(roleId);
  if (!before) return;

  const result = await restoreRole(roleId, actor.id);
  if (!result.ok) return;

  await audit({
    actorId: actor.id,
    action: 'volunteer-role.restored',
    targetType: 'user',
    targetId: before.userId,
    newValue: { roleId, titleAr: result.role.titleAr, archived: false },
    reason: text(formData, 'reason') || undefined,
  });

  refresh(lang, before.userId);
}
