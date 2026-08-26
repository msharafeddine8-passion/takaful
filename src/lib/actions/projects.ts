'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isDbConfigured } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability, type Capability } from '@/lib/authz';
import { isLocale, locales, type Locale } from '@/lib/i18n';
import {
  archiveProject,
  createProject,
  projectById,
  setPublished,
  updateProject,
  type ProjectPatch,
} from '@/lib/projects';
import { createRole } from '@/lib/volunteer-roles';
import { isPrecision, isVisibility, type DatePrecision, type Visibility } from '@/lib/volunteer-role-view';
import type { ProjectAdminStrings } from '@/lib/dictionaries/projects-admin';

/**
 * An administrator describing what the association runs, and recording who has
 * taken charge of it.
 *
 * ── THE PERMISSION CHECK IS HERE, AND NOWHERE IN A COMPONENT ───────────────
 *
 * A check in JSX hides a button and leaves the POST working. On this feature
 * that would mean anybody with a session writing «مسؤول مشروع مسارك» onto their
 * own record — a title the association's own paperwork treats as a fact — or
 * publishing a project onto the association's public homepage.
 *
 * Every function below asserts a capability against the SESSION before it reads
 * a single field, and requireCapability throws rather than returning a boolean a
 * caller can forget to look at.
 *
 * EVERY FIELD ARRIVING IN FormData IS A CLAIM. The project id, the person, the
 * dates, the precision, the visibility, the slug: each is parsed and checked,
 * and the project id is looked up against the database rather than trusted. The
 * only thing taken from the session rather than from the form is who the actor
 * is — which is the one thing a form may never say, because a form that could
 * name its own author could name somebody else.
 *
 * ── WHICH CAPABILITY, AND WHY IT IS members.manage ─────────────────────────
 *
 * `members.manage` — program_admin and super_admin. The same capability
 * lib/actions/org-groups.ts and lib/actions/volunteer-roles.ts assert, for all
 * six actions here.
 *
 * addProjectPersonAction has no choice about it and settles the question for the
 * others. It writes a `volunteer_roles` row through the same createRole() the
 * member page calls: it IS that act, reached from a different screen. Gating it
 * more loosely would mean the capability protecting somebody's record depended
 * on which door an administrator came in through, which is not a rule at all.
 *
 * The other five have a real alternative and it is worth naming so nobody
 * "corrects" this later. A project is public-facing, so `programme.publish`
 * looks like the natural gate for the publish toggle at least. Three reasons it
 * is not taken:
 *
 *   1. IT WOULD CHANGE NOTHING AND LOOK LIKE IT DID. `programme.publish` and
 *      `members.manage` name the identical two roles today — program_admin and
 *      super_admin — so the split would be a distinction with no effect on who
 *      may do what, while implying to the next reader that somebody somewhere is
 *      gated differently.
 *
 *   2. `programme.publish` IS ABOUT A DIFFERENT NOUN. authz.ts introduces it for
 *      the course/draft/review split, guarding the moment a volunteer may act on
 *      what a course says. A project row is not teaching material.
 *
 *   3. THE ROW IS THE OTHER HALF OF EVERY ROLE POINTING AT IT — the same
 *      argument org-groups.ts makes for a committee, and it is stronger here.
 *      Rename «مسارك» and you have rewritten a line on the record of everybody
 *      who ran it; archive it and their history disappears from the list. That
 *      is an edit to people's records made through a different noun, so it
 *      belongs with the capability that governs their records.
 *
 * Splitting the two would also produce exactly the failure authz.ts's isStaff()
 * comment warns about: a screen on which a project is editable but nobody can be
 * recorded as running it — a page of controls, half of which could only fail.
 *
 * ── HOW A REFUSAL REACHES THE SCREEN WITHOUT ANY JAVASCRIPT ────────────────
 *
 * These actions return `void` and are used as plain `<form action={…}>` on
 * server components, so there is no useActionState to carry an error back. A
 * refusal therefore redirects to the same page with `?error=…`, and the page
 * renders the sentence from the dictionary. That matters most for 'slug-taken'
 * and 'bad-slug', which are the refusals an administrator can hit by working
 * normally and which would otherwise look like a button that does nothing.
 *
 * `back()` types its argument as a key of the dictionary's own `errors`, so a
 * refusal the strings do not answer to fails to compile rather than reaching a
 * URL as an unreadable code.
 */

/** Named once so the reasoning above has something to point at. */
const PROJECTS: Capability = 'members.manage';

/** Exactly the refusals the dictionary has a sentence for. */
type ScreenError = keyof ProjectAdminStrings['errors'];

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
 * A display order, or undefined.
 *
 * Undefined rather than 0 for a blank box, so that clearing the field by
 * accident does not silently move a project to the top of the public page. A
 * value that is not a number at all is treated the same way: absent.
 */
const orderOf = (formData: FormData, name: string): number | undefined => {
  const raw = text(formData, name);
  if (raw === '') return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.trunc(value) : undefined;
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
 * `?error=slug-taken` would succeed and leave the refusal on screen.
 */
function back(lang: Locale, projectId: string | null, error?: ScreenError): never {
  const path = projectId
    ? `/${lang}/staff/projects/${projectId}`
    : `/${lang}/staff/projects`;
  redirect(error ? `${path}?error=${error}` : path);
}

/**
 * Every page a project is read from — INCLUDING THE PUBLIC ONE, IN BOTH
 * LANGUAGES.
 *
 * /[lang]/projects now reads this table, and it reads it in Arabic and in
 * English from the same rows: correcting the Arabic name changes the English
 * page too, because `name_en` falls back to it. Revalidating only the language
 * the administrator happened to be working in would leave the other one showing
 * yesterday's wording, which reads as the site disagreeing with itself.
 */
function refresh(lang: Locale, projectId: string | null): void {
  revalidatePath(`/${lang}/staff/projects`);
  if (projectId) revalidatePath(`/${lang}/staff/projects/${projectId}`);
  for (const locale of locales) revalidatePath(`/${locale}/projects`);
}

// -------------------------------------------------------------------- create

/**
 * Adds a project.
 *
 * The status is not checked against anything, and neither is the tag. There is
 * no list of permitted statuses in this file, in lib/projects.ts, in the
 * dictionary or in the schema — see the head of migration 055. The one word the
 * public page reads specially is 'soon', and reading a string specially is not
 * the same as refusing every other one.
 *
 * It is created unpublished unless the form says otherwise, which is the safer
 * default in one direction only: a project that should be on the site and is not
 * is a page somebody fixes, and a half-written project that appeared on the
 * association's public page is a page the public already read.
 */
export async function createProjectAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) back(lang, null, 'unavailable');

  const actor = await requireCapability(PROJECTS);

  const result = await createProject(
    {
      slug: text(formData, 'slug'),
      nameAr: text(formData, 'nameAr'),
      nameEn: text(formData, 'nameEn'),
      tagAr: text(formData, 'tagAr') || null,
      tagEn: text(formData, 'tagEn') || null,
      summaryAr: text(formData, 'summaryAr'),
      summaryEn: text(formData, 'summaryEn'),
      status: text(formData, 'status'),
      startedOn: text(formData, 'startedOn') || null,
      startedPrec: precision(formData, 'startedPrec'),
      endedOn: text(formData, 'endedOn') || null,
      endedPrec: precision(formData, 'endedPrec'),
      isPublished: flag(formData, 'isPublished'),
      sortOrder: orderOf(formData, 'sortOrder'),
    },
    actor.id,
  );

  if (!result.ok) back(lang, null, result.reason);

  await audit({
    actorId: actor.id,
    action: 'project.created',
    /* The project, not a person: this row is about what the association runs and
     * names nobody. addProjectPersonAction below is the one that targets a user,
     * and it says why there. */
    targetType: 'project',
    targetId: result.id,
    newValue: {
      slug: text(formData, 'slug'),
      nameAr: text(formData, 'nameAr'),
      status: text(formData, 'status') || 'live',
      isPublished: flag(formData, 'isPublished'),
    },
  });

  refresh(lang, result.id);
  back(lang, result.id);
}

// -------------------------------------------------------------------- update

/**
 * Corrects a project.
 *
 * The patch carries only the fields the form actually sent, so a partial form
 * cannot blank a summary by omission. `has()` on the field rather than a
 * truthiness test, because an empty string from a field that IS on the form is a
 * deliberate clearing.
 *
 * `is_published` is NOT here. It has an action of its own, so that saving a
 * spelling correction from a stale tab cannot quietly put a withdrawn project
 * back on the association's public page.
 *
 * The previous values go into the audit line beside the new ones. Renaming a
 * project rewrites how every role pointing at it reads on its holder's page, and
 * changing the slug changes a public URL people have already shared — "what was
 * it before?" has to be answerable.
 */
export async function updateProjectAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const projectId = text(formData, 'projectId');
  if (!isDbConfigured()) back(lang, null, 'unavailable');
  if (!projectId) back(lang, null, 'not-found');

  const actor = await requireCapability(PROJECTS);

  const before = await projectById(projectId);
  if (!before) back(lang, null, 'not-found');

  const has = (name: string) => formData.get(name) !== null;
  const patch: ProjectPatch = {};
  if (has('slug')) patch.slug = text(formData, 'slug');
  if (has('nameAr')) patch.nameAr = text(formData, 'nameAr');
  if (has('nameEn')) patch.nameEn = text(formData, 'nameEn');
  if (has('tagAr')) patch.tagAr = text(formData, 'tagAr') || null;
  if (has('tagEn')) patch.tagEn = text(formData, 'tagEn') || null;
  if (has('summaryAr')) patch.summaryAr = text(formData, 'summaryAr');
  if (has('summaryEn')) patch.summaryEn = text(formData, 'summaryEn');
  if (has('status')) patch.status = text(formData, 'status');
  if (has('startedOn')) patch.startedOn = text(formData, 'startedOn') || null;
  if (has('startedPrec')) patch.startedPrec = precision(formData, 'startedPrec');
  if (has('endedOn')) patch.endedOn = text(formData, 'endedOn') || null;
  if (has('endedPrec')) patch.endedPrec = precision(formData, 'endedPrec');
  if (has('sortOrder')) {
    const order = orderOf(formData, 'sortOrder');
    if (order !== undefined) patch.sortOrder = order;
  }

  const result = await updateProject(projectId, patch, actor.id);
  if (!result.ok) back(lang, projectId, result.reason);

  await audit({
    actorId: actor.id,
    action: 'project.updated',
    targetType: 'project',
    targetId: projectId,
    previousValue: {
      slug: before.slug,
      nameAr: before.nameAr,
      nameEn: before.nameEn,
      status: before.status,
      sortOrder: before.sortOrder,
    },
    newValue: {
      slug: patch.slug ?? before.slug,
      nameAr: patch.nameAr ?? before.nameAr,
      nameEn: patch.nameEn ?? before.nameEn,
      status: patch.status ?? before.status,
      sortOrder: patch.sortOrder ?? before.sortOrder,
    },
  });

  refresh(lang, projectId);
  back(lang, projectId);
}

// -------------------------------------------------------- on the site, or not

/**
 * Puts a project on the public page, or takes it off.
 *
 * ONE COLUMN, AND IT REMOVES NOTHING. Every role pointing at the project is
 * untouched, everybody who ran it goes on saying so on their own record, and the
 * project stays on this list. Migration 055's delete trigger names this as the
 * way to take a project off the site, precisely so that nobody reaches for a
 * DELETE and takes the history with it.
 */
export async function setProjectPublishedAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const projectId = text(formData, 'projectId');
  if (!isDbConfigured()) back(lang, null, 'unavailable');
  if (!projectId) back(lang, null, 'not-found');

  const actor = await requireCapability(PROJECTS);

  const before = await projectById(projectId);
  if (!before) back(lang, null, 'not-found');

  const published = flag(formData, 'published');
  const result = await setPublished(projectId, published, actor.id);
  if (!result.ok) back(lang, projectId, result.reason);

  await audit({
    actorId: actor.id,
    action: published ? 'project.published' : 'project.unpublished',
    targetType: 'project',
    targetId: projectId,
    previousValue: { nameAr: before.nameAr, isPublished: before.isPublished },
    newValue: { nameAr: before.nameAr, isPublished: published },
  });

  refresh(lang, projectId);
  back(lang, projectId);
}

// ------------------------------------------------------------------- archive

/**
 * Takes a project off the list without taking it out of the record.
 *
 * A reason is required and is stored on the ROW as well as on the audit line,
 * the same rule migration 050 established for a volunteer role and for the same
 * reason: "why did this disappear?" is asked while looking at the list, and an
 * answer living only in a table few people can read is not an answer.
 *
 * The roles pointing at the project are left exactly as they are. The database
 * refuses a DELETE outright (trg_projects_no_delete), so nothing here is ever
 * the last copy of anything.
 */
export async function archiveProjectAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const projectId = text(formData, 'projectId');
  if (!isDbConfigured()) back(lang, null, 'unavailable');
  if (!projectId) back(lang, null, 'not-found');

  const actor = await requireCapability(PROJECTS);

  const before = await projectById(projectId);
  if (!before) back(lang, null, 'not-found');

  const reason = text(formData, 'reason');
  const result = await archiveProject(projectId, actor.id, reason);
  if (!result.ok) back(lang, projectId, result.reason);

  await audit({
    actorId: actor.id,
    action: 'project.archived',
    targetType: 'project',
    targetId: projectId,
    previousValue: { slug: before.slug, nameAr: before.nameAr },
    newValue: { archived: true },
    reason,
  });

  refresh(lang, projectId);
  /* Back to the list rather than to the project: the page just archived would
   * otherwise re-render as a row the list no longer shows. */
  back(lang, null);
}

// ---------------------------------------------------------------- a role on it

/**
 * Puts somebody in charge of a project — WHICH IS TO SAY, RECORDS A ROLE.
 *
 * THERE IS NO project_manager_id AND THIS ACTION DOES NOT WRITE ONE. It calls
 * createRole() from lib/volunteer-roles.ts, the same function the member page
 * calls, with `entity = { kind: 'project', id }`. That single row is the
 * appointment, the period, the visibility, the soft delete, the line on the
 * volunteer's own profile and the entry under «من تولّاه سابقاً» — migration 055
 * argues at length why it must be one row and not a column, and the shortest
 * form of the argument is that a column cannot hold a predecessor.
 *
 * ADDING A SUCCESSOR IS THIS, PLUS endRoleAction ON THE OUTGOING ROW. There is
 * deliberately no action that does both, and none that names a new holder on an
 * existing row: a single call that could do the two is one edit away from doing
 * only the second, and «أحمد — المسؤول السابق للمشروع» would be deleted by the
 * act of appointing his successor.
 *
 * THE PROJECT ID IS VERIFIED AGAINST THE DATABASE. volunteer_roles.entity_id
 * carries no foreign key — migration 046 explains that one column cannot
 * reference four tables and says plainly that the application is then the only
 * thing that may write it. chk_vr_entity_resolvable, extended by migration 055,
 * checks that the KIND is one of three tables; it cannot check that the id is a
 * row. This is where that promise is kept: a posted id that is not a live
 * project is refused here rather than stored as a dangling pointer.
 */
export async function addProjectPersonAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const projectId = text(formData, 'projectId');
  if (!isDbConfigured()) back(lang, null, 'unavailable');
  if (!projectId) back(lang, null, 'not-found');

  const actor = await requireCapability(PROJECTS);

  const project = await projectById(projectId);
  // An archived project is refused too: a role pointing at a row that has been
  // withdrawn would appear on somebody's profile attached to nothing visible.
  if (!project || project.archivedOn !== null) back(lang, null, 'not-found');

  const userId = text(formData, 'userId');
  if (!userId) back(lang, projectId, 'no-person');

  /*
   * "Still holds it" is read from the form when the form says anything about it.
   * It is not derived from the absence of an end date, because this form has no
   * end date at all: a role starts current here and is closed later by
   * endRoleAction, which is what a succession is made of.
   */
  const isCurrent = formData.get('isCurrent') !== null ? flag(formData, 'isCurrent') : true;

  const result = await createRole({
    userId,
    titleAr: text(formData, 'titleAr'),
    titleEn: text(formData, 'titleEn'),
    roleType: text(formData, 'roleType') || null,
    entity: { kind: 'project', id: projectId },
    startedOn: text(formData, 'startedOn') || null,
    startedPrec: precision(formData, 'startedPrec'),
    isCurrent,
    visibility: visibilityOf(formData),
    actorId: actor.id,
  });

  if (!result.ok) back(lang, projectId, result.reason);

  await audit({
    actorId: actor.id,
    action: 'volunteer-role.created',
    /*
     * THE PERSON, not the project — the same target lib/actions/volunteer-roles.ts
     * uses for the identical write. audit_logs is read as "who has been doing
     * what to whom", and a role recorded from this screen must land on the same
     * line of that log as one recorded from the member's own page. The project
     * travels in the value so the entry reads as a sentence without a second
     * query.
     */
    targetType: 'user',
    targetId: userId,
    newValue: {
      roleId: result.role.id,
      titleAr: result.role.titleAr,
      titleEn: result.role.titleEn,
      projectId,
      projectSlug: project.slug,
      projectNameAr: project.nameAr,
      startedOn: result.role.startedOn,
      isCurrent: result.role.isCurrent,
      visibility: result.role.visibility,
    },
  });

  refresh(lang, projectId);
  // The role is on this person's record as much as on the project's page.
  revalidatePath(`/${lang}/staff/members/${userId}`);
  revalidatePath(`/${lang}/staff/members/${userId}/profile`);
  back(lang, projectId);
}
