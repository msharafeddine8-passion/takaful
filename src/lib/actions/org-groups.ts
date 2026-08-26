'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isDbConfigured } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability, type Capability } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';
import {
  archiveGroup,
  createGroup,
  groupById,
  setActive,
  updateGroup,
  type GroupPatch,
} from '@/lib/org-groups';
import { createRole } from '@/lib/volunteer-roles';
import { isPrecision, isVisibility, type DatePrecision, type Visibility } from '@/lib/volunteer-role-view';
import type { OrgGroupStrings } from '@/lib/dictionaries/org-groups';

/**
 * An administrator describing how the association is organised, and recording
 * who has taken charge of what inside it.
 *
 * ── THE PERMISSION CHECK IS HERE, AND NOWHERE IN A COMPONENT ───────────────
 *
 * A check in JSX hides a button and leaves the POST working. On this feature
 * that would mean anybody with a session writing «رئيس لجنة الإعلام» onto their
 * own record — a title the association's own paperwork treats as a fact — or
 * archiving a committee out from under everybody who served on it. Every
 * function below asserts a capability against the SESSION before it reads a
 * single field, and requireCapability throws rather than returning a boolean a
 * caller can forget to look at.
 *
 * EVERY FIELD ARRIVING IN FormData IS A CLAIM. The group id, the parent id, the
 * person, the dates, the precision, the visibility: each is parsed and checked,
 * and the two ids are looked up against the database rather than trusted. The
 * only thing taken from the session rather than from the form is who the actor
 * is — which is the one thing a form may never say, because a form that could
 * name its own author could name somebody else.
 *
 * ── WHICH CAPABILITY, AND WHY IT IS THE ROLES' ONE ─────────────────────────
 *
 * `members.manage` — program_admin and super_admin. The same capability
 * lib/actions/volunteer-roles.ts asserts, for all five actions here.
 *
 * The membership action has no choice about it and settles the question.
 * addGroupMemberAction writes a `volunteer_roles` row through the same
 * createRole() the member page calls: it IS that act, reached from a different
 * screen. Gating it more loosely would mean the capability protecting somebody's
 * record depended on which door an administrator came in through, which is not a
 * rule at all.
 *
 * The other four — creating, editing, concluding and archiving a group — have a
 * real alternative, and it is worth naming so that nobody "corrects" this later.
 * lib/actions/admin-profile.ts put profile FIELD DEFINITIONS behind
 * `challenges.manage` on the argument that a definition is "on nobody's file in
 * particular and on everybody's profile in general". A committee looks like
 * that at first glance. It is not, and the difference is what these screens are
 * for: a field definition adds a question to every profile and touches no
 * existing record, whereas a group's name, its kind and its very existence are
 * the OTHER HALF of every role that points at it. Rename لجنة الإعلام and you
 * have rewritten a line on eleven volunteers' records; archive it and the
 * leadership history those lines make up disappears from the list. That is an
 * edit to people's records made through a different noun, so it belongs with
 * the capability that governs their records.
 *
 * Splitting the two would also produce exactly the failure authz.ts's isStaff()
 * comment warns about: a project_coordinator with a screen on which every
 * committee is creatable and no member is addable — a page of controls, half of
 * which could only fail.
 *
 * ── HOW A REFUSAL REACHES THE SCREEN WITHOUT ANY JAVASCRIPT ────────────────
 *
 * These actions return `void` and are used as plain `<form action={…}>` on
 * server components, so there is no useActionState to carry an error back. A
 * refusal therefore redirects to the same page with `?error=…`, and the page
 * renders the sentence from the dictionary. That matters most for
 * 'parent-cycle', which is the one refusal an administrator can hit by working
 * normally and the one that would otherwise look like a button that does
 * nothing.
 *
 * `back()` types its argument as a key of the dictionary's own `errors`, so a
 * refusal the strings do not answer to fails to compile rather than reaching a
 * URL as an unreadable code.
 */

/** Named once so the reasoning above has something to point at. */
const GROUPS: Capability = 'members.manage';

/** Exactly the refusals the dictionary has a sentence for. */
type ScreenError = keyof OrgGroupStrings['errors'];

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
 * A field that arrives misspelled must not become 'public'. The default is the
 * column's — 'volunteers' — for the reason migration 046 gives: a list of who
 * ran what is a different thing to put on the open web from a name and a
 * photograph somebody chose to publish.
 */
const visibilityOf = (formData: FormData): Visibility => {
  const raw = text(formData, 'visibility');
  return isVisibility(raw) ? raw : 'volunteers';
};

/**
 * Back where the form was, with a sentence if something was refused.
 *
 * redirect() signals by throwing, so every call sits outside a try block and
 * after the audit line. A successful write redirects to the CLEAN path on
 * purpose: without it, a form submitted from a page still carrying
 * `?error=parent-cycle` would succeed and leave the refusal on screen.
 */
function back(lang: Locale, groupId: string | null, error?: ScreenError): never {
  const path = groupId
    ? `/${lang}/staff/groups/${groupId}`
    : `/${lang}/staff/groups`;
  redirect(error ? `${path}?error=${error}` : path);
}

/** Both places a group is read from. */
function refresh(lang: Locale, groupId: string | null): void {
  revalidatePath(`/${lang}/staff/groups`);
  if (groupId) revalidatePath(`/${lang}/staff/groups/${groupId}`);
}

// -------------------------------------------------------------------- create

/**
 * Adds a committee, a team, or whatever the association calls this one.
 *
 * The kind is not checked against anything. There is no list of permitted kinds
 * in this file, in lib/org-groups.ts, in the dictionary or in the schema — see
 * the head of migration 054. Whatever the administrator types is what the
 * association calls it.
 */
export async function createGroupAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) back(lang, null, 'unavailable');

  const actor = await requireCapability(GROUPS);

  const result = await createGroup(
    {
      nameAr: text(formData, 'nameAr'),
      nameEn: text(formData, 'nameEn'),
      kind: text(formData, 'kind') || null,
      descriptionAr: text(formData, 'descriptionAr') || null,
      descriptionEn: text(formData, 'descriptionEn') || null,
      parentId: text(formData, 'parentId') || null,
    },
    actor.id,
  );

  if (!result.ok) back(lang, null, result.reason);

  await audit({
    actorId: actor.id,
    action: 'org-group.created',
    /* The group, not a person: this row is about how the association is
     * organised and names nobody. The membership action below is the one that
     * targets a user, and it says why there. */
    targetType: 'org_group',
    targetId: result.id,
    newValue: {
      nameAr: text(formData, 'nameAr'),
      kind: text(formData, 'kind') || null,
      parentId: text(formData, 'parentId') || null,
    },
  });

  refresh(lang, result.id);
  back(lang, result.id);
}

// -------------------------------------------------------------------- update

/**
 * Corrects a group.
 *
 * The patch carries only the fields the form actually sent, so a partial form
 * cannot blank a description by omission. `parentId` is sent as an empty string
 * by the select's «لا يتبع شيئاً» option, which is a deliberate clearing rather
 * than an absence — hence `has()` on the field rather than a truthiness test.
 *
 * `is_active` is NOT here. It has an action of its own, so that saving a
 * spelling correction from a stale tab cannot quietly bring a concluded
 * committee back to life.
 *
 * The previous values go into the audit line beside the new ones. Renaming a
 * committee rewrites how every role pointing at it reads on its holder's page,
 * and "what was it called before?" has to be answerable.
 */
export async function updateGroupAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const groupId = text(formData, 'groupId');
  if (!isDbConfigured()) back(lang, null, 'unavailable');
  if (!groupId) back(lang, null, 'not-found');

  const actor = await requireCapability(GROUPS);

  const before = await groupById(groupId);
  if (!before) back(lang, null, 'not-found');

  /* `has` and not a truthiness test: an empty string from a field that IS on
   * the form is a deliberate clearing, and treating it as absent would make
   * "remove the description" impossible. */
  const has = (name: string) => formData.get(name) !== null;
  const patch: GroupPatch = {};
  if (has('nameAr')) patch.nameAr = text(formData, 'nameAr');
  if (has('nameEn')) patch.nameEn = text(formData, 'nameEn');
  if (has('kind')) patch.kind = text(formData, 'kind') || null;
  if (has('descriptionAr')) patch.descriptionAr = text(formData, 'descriptionAr') || null;
  if (has('descriptionEn')) patch.descriptionEn = text(formData, 'descriptionEn') || null;
  if (has('parentId')) patch.parentId = text(formData, 'parentId') || null;

  const result = await updateGroup(groupId, patch, actor.id);
  if (!result.ok) back(lang, groupId, result.reason);

  await audit({
    actorId: actor.id,
    action: 'org-group.updated',
    targetType: 'org_group',
    targetId: groupId,
    previousValue: {
      nameAr: before.nameAr,
      nameEn: before.nameEn,
      kind: before.kind,
      parentId: before.parentId,
    },
    newValue: {
      nameAr: patch.nameAr ?? before.nameAr,
      nameEn: patch.nameEn ?? before.nameEn,
      kind: patch.kind === undefined ? before.kind : patch.kind,
      parentId: patch.parentId === undefined ? before.parentId : patch.parentId,
    },
  });

  refresh(lang, groupId);
  back(lang, groupId);
}

// ------------------------------------------------------- meeting, or finished

/**
 * Records that a group has finished its work, or that it is meeting again.
 *
 * ONE COLUMN, AND IT REMOVES NOTHING. Every role pointing at the group is
 * untouched, the leadership history stays readable, and the group stays on the
 * list. Migration 054 keeps this apart from archiving for exactly that reason:
 * a committee that achieved what it was set up for is not a mistake to hide.
 */
export async function setGroupActiveAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const groupId = text(formData, 'groupId');
  if (!isDbConfigured()) back(lang, null, 'unavailable');
  if (!groupId) back(lang, null, 'not-found');

  const actor = await requireCapability(GROUPS);

  const before = await groupById(groupId);
  if (!before) back(lang, null, 'not-found');

  const active = flag(formData, 'active');
  const result = await setActive(groupId, active, actor.id);
  if (!result.ok) back(lang, groupId, result.reason);

  await audit({
    actorId: actor.id,
    action: active ? 'org-group.resumed' : 'org-group.concluded',
    targetType: 'org_group',
    targetId: groupId,
    previousValue: { nameAr: before.nameAr, isActive: before.isActive },
    newValue: { nameAr: before.nameAr, isActive: active },
  });

  refresh(lang, groupId);
  back(lang, groupId);
}

// ------------------------------------------------------------------- archive

/**
 * Takes a group off the list without taking it out of the record.
 *
 * A reason is required and is stored on the ROW as well as on the audit line,
 * the same rule migration 050 established for a volunteer role and for the same
 * reason: "why did this disappear?" is asked while looking at the list, and an
 * answer living only in a table few people can read is not an answer.
 *
 * The roles pointing at the group are left exactly as they are. The database
 * refuses a DELETE outright (trg_org_groups_no_delete), so nothing here is ever
 * the last copy of anything.
 */
export async function archiveGroupAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const groupId = text(formData, 'groupId');
  if (!isDbConfigured()) back(lang, null, 'unavailable');
  if (!groupId) back(lang, null, 'not-found');

  const actor = await requireCapability(GROUPS);

  const before = await groupById(groupId);
  if (!before) back(lang, null, 'not-found');

  const reason = text(formData, 'reason');
  const result = await archiveGroup(groupId, actor.id, reason);
  if (!result.ok) back(lang, groupId, result.reason);

  await audit({
    actorId: actor.id,
    action: 'org-group.archived',
    targetType: 'org_group',
    targetId: groupId,
    previousValue: { nameAr: before.nameAr, kind: before.kind },
    newValue: { archived: true },
    reason,
  });

  refresh(lang, groupId);
  /* Back to the list rather than to the group: the page just archived would
   * otherwise re-render as a row the list no longer shows. */
  back(lang, null);
}

// -------------------------------------------------------------- a membership

/**
 * Puts somebody in a committee — WHICH IS TO SAY, RECORDS A ROLE.
 *
 * There is no committee_members table and this action does not write to one.
 * It calls createRole() from lib/volunteer-roles.ts, the same function the
 * member page calls, with `entity = { kind: 'group', id }`. That single row is
 * the membership, the period, the visibility, the soft delete, the line on the
 * volunteer's own profile and the entry in the leadership history below —
 * migration 054 argues at length why it must be one row and not two, and the
 * shortest form of the argument is that two would drift.
 *
 * ADDING A SUCCESSOR IS THIS, PLUS endRoleAction ON THE OUTGOING ROW. There is
 * deliberately no action that does both, and none that names a new holder on an
 * existing row: a single call that could do the two is one edit away from doing
 * only the second, and the association would be deleting its own history one
 * appointment at a time.
 *
 * THE GROUP ID IS VERIFIED AGAINST THE DATABASE. volunteer_roles.entity_id
 * carries no foreign key — migration 046 explains that one column cannot
 * reference four tables and says plainly that the application is then the only
 * thing that may write it. This is where that promise is kept: a posted id that
 * is not a live group is refused here rather than stored as a dangling pointer.
 */
export async function addGroupMemberAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const groupId = text(formData, 'groupId');
  if (!isDbConfigured()) back(lang, null, 'unavailable');
  if (!groupId) back(lang, null, 'not-found');

  const actor = await requireCapability(GROUPS);

  const group = await groupById(groupId);
  // An archived group is refused too: a role pointing at a row that has been
  // withdrawn would appear on somebody's profile attached to nothing visible.
  if (!group || group.archivedOn !== null) back(lang, null, 'not-found');

  const userId = text(formData, 'userId');
  if (!userId) back(lang, groupId, 'no-person');

  /*
   * "Still holds it" is read from the form when the form says anything about
   * it. It is not derived from the absence of an end date, because this form
   * has no end date at all: a role starts current here and is closed later by
   * endRoleAction, which is what a succession is made of.
   */
  const isCurrent = formData.get('isCurrent') !== null ? flag(formData, 'isCurrent') : true;

  const result = await createRole({
    userId,
    titleAr: text(formData, 'titleAr'),
    titleEn: text(formData, 'titleEn'),
    roleType: text(formData, 'roleType') || null,
    entity: { kind: 'group', id: groupId },
    startedOn: text(formData, 'startedOn') || null,
    startedPrec: precision(formData, 'startedPrec'),
    isCurrent,
    visibility: visibilityOf(formData),
    actorId: actor.id,
  });

  if (!result.ok) back(lang, groupId, result.reason);

  await audit({
    actorId: actor.id,
    action: 'volunteer-role.created',
    /*
     * THE PERSON, not the group — the same target lib/actions/volunteer-roles.ts
     * uses for the identical write. audit_logs is read as "who has been doing
     * what to whom", and a role recorded from this screen must land on the same
     * line of that log as one recorded from the member's own page. The group
     * travels in the value so the entry reads as a sentence without a second
     * query.
     */
    targetType: 'user',
    targetId: userId,
    newValue: {
      roleId: result.role.id,
      titleAr: result.role.titleAr,
      titleEn: result.role.titleEn,
      groupId,
      groupNameAr: group.nameAr,
      startedOn: result.role.startedOn,
      isCurrent: result.role.isCurrent,
      visibility: result.role.visibility,
    },
  });

  refresh(lang, groupId);
  // The role is on this person's record as much as on the group's page.
  revalidatePath(`/${lang}/staff/members/${userId}`);
  revalidatePath(`/${lang}/staff/members/${userId}/profile`);
  back(lang, groupId);
}
