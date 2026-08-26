import 'server-only';
import { randomUUID } from 'node:crypto';
import { query, queryOne, transaction } from './db';
import {
  calendarDay,
  cleanAchievements,
  precisionFrom,
  visibilityFrom,
  visibleTo,
  type DatePrecision,
  type Viewer,
} from './volunteer-role-view';
import type { PersonWithRole, RoleEntity, VolunteerRole } from './volunteer-roles';
import type { Locale } from './i18n';

/**
 * The association's projects — and reading who runs one WITHOUT a manager column.
 *
 * ── THERE IS NO project_manager_id IN THIS FILE, AND THERE MUST NEVER BE ────
 *
 * Migration 055 says it at length and it is the one sentence worth repeating on
 * every file that touches this feature: WHO RUNS A PROJECT IS A `volunteer_roles`
 * ROW whose entity_kind = 'project' and whose entity_id is a row in `projects`.
 * The brief asks for a project manager AND for «أحمد — المسؤول السابق للمشروع»,
 * and a manager column cannot hold both: appointing a successor would be an
 * UPDATE that erases a predecessor — one line that quietly deletes the fact that
 * somebody ran this project for two years.
 *
 * So peopleOn() below is a READ over volunteer_roles, exactly as membersOf() is
 * in lib/org-groups.ts one level up. Writing a project role is createRole() in
 * lib/volunteer-roles.ts — the same function the member page calls, reached from
 * the project page through lib/actions/projects.ts. One write path, not two.
 *
 * Appointing a successor is endRole() on the outgoing row plus createRole() for
 * the incoming one. Both survive, and «المسؤولون السابقون» is a query over the
 * rows nobody deleted. There is no function here that names a holder and none
 * that could overwrite one.
 *
 * ── NOTHING HERE COUNTS OR RANKS ANYBODY ───────────────────────────────────
 *
 * No count(*) over the people on a project, no "most projects run", no GROUP BY
 * user_id, and no ORDER BY that puts one person above another for any reason but
 * the dates on their own row. The same invariant lib/org-groups.ts carries, and
 * peopleWithRole() in lib/volunteer-roles.ts before it.
 *
 * ── DATES ──────────────────────────────────────────────────────────────────
 *
 * archived_at and created_at on `projects` are TIMESTAMPTZ and take the Beirut
 * correction. started_on and ended_on — on a project as on a role — are DATEs
 * and must NEVER be given one: `AT TIME ZONE` on a DATE invents midnight for it
 * and then moves it, turning 2025-01-01 into 2024-12-31 while looking careful.
 * See the head of lib/volunteer-role-view.ts. Both come back as text and stay
 * text.
 */

/** A TIMESTAMPTZ as the day it happened in Beirut. The usual correction. */
const beirutDay = (column: string) =>
  `to_char(${column} AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')`;

/** A DATE as text, and pointedly WITHOUT `AT TIME ZONE`. See above. */
const calendarCol = (column: string) => `to_char(${column}, 'YYYY-MM-DD')`;

// ------------------------------------------------------------- the projects

/**
 * `status` IS FREE TEXT AND THERE IS NO LIST OF STATUSES in this file, in the
 * actions, in the dictionary or in the schema. Migration 055 says why: 'live'
 * and 'soon' are the distinction /projects already draws, and a project that
 * paused, or finished and is worth still showing, is a state this association
 * will meet before anybody ships a migration for it.
 *
 * The public page reads exactly ONE word specially — see COMING_SOON below —
 * and treats every other value as a project that is running. That is a
 * presentation rule about one string, not a permitted set.
 */
export type Project = {
  id: string;
  /** Stable, and the public URL. */
  slug: string;
  nameAr: string;
  /** May be '' — the reader falls back to the Arabic. */
  nameEn: string;
  /** The short label above the name on the cards. May be absent. */
  tagAr: string | null;
  tagEn: string | null;
  summaryAr: string;
  summaryEn: string;
  /** Free text. 'live' / 'soon' today. */
  status: string;
  /** 'YYYY-MM-DD' as text, or null. Never reconstruct a Date from it. */
  startedOn: string | null;
  startedPrec: DatePrecision;
  endedOn: string | null;
  endedPrec: DatePrecision;
  logoRef: string | null;
  /** Whether the public page shows it. Separate from archived — see below. */
  isPublished: boolean;
  sortOrder: number;
  /** 'YYYY-MM-DD' in Beirut, or null. */
  archivedOn: string | null;
  archiveReason: string | null;
  createdOn: string;
};

/**
 * The one status the public page reads specially.
 *
 * Named here rather than written as `'soon'` in a page, because the string is
 * shared between the card that draws a dashed border and the admin screen that
 * explains what typing it does. It is NOT a validated set: `status` is free
 * text and anything else at all is stored and treated as a running project.
 */
export const COMING_SOON = 'soon';

export function isComingSoon(project: Project): boolean {
  return project.status.trim().toLowerCase() === COMING_SOON;
}

/**
 * The name, the tag and the summary in one language, falling back to the Arabic.
 *
 * Here rather than in a page, because the public page, both staff screens and
 * the role picker all have to answer the same question, and four copies of
 * `nameEn.trim() || nameAr` is four chances to render an empty heading.
 * `name_en` and `summary_en` default to '' in the schema precisely so this
 * fallback has something to test — migration 056 exists because an English page
 * of four names and no descriptions looks like a rendering bug rather than like
 * a seed written in one language.
 */
export function projectName(project: Project, lang: Locale): string {
  if (lang === 'ar') return project.nameAr;
  return project.nameEn.trim() || project.nameAr;
}

export function projectTag(project: Project, lang: Locale): string | null {
  const wanted = lang === 'ar' ? project.tagAr : project.tagEn;
  const fallback = project.tagAr;
  return wanted?.trim() || fallback?.trim() || null;
}

export function projectSummary(project: Project, lang: Locale): string {
  if (lang === 'ar') return project.summaryAr;
  return project.summaryEn.trim() || project.summaryAr;
}

const PROJECT_COLUMNS = `p.id, p.slug, p.name_ar, p.name_en, p.tag_ar, p.tag_en,
  p.summary_ar, p.summary_en, p.status,
  ${calendarCol('p.started_on')} AS started_on, p.started_prec,
  ${calendarCol('p.ended_on')} AS ended_on, p.ended_prec,
  p.logo_ref, p.is_published, p.sort_order,
  ${beirutDay('p.archived_at')} AS archived_on, p.archive_reason,
  ${beirutDay('p.created_at')} AS created_on`;

type ProjectRow = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string | null;
  tag_ar: string | null;
  tag_en: string | null;
  summary_ar: string | null;
  summary_en: string | null;
  status: string;
  started_on: string | null;
  started_prec: string;
  ended_on: string | null;
  ended_prec: string;
  logo_ref: string | null;
  is_published: boolean;
  sort_order: number;
  archived_on: string | null;
  archive_reason: string | null;
  created_on: string;
};

const toProject = (row: ProjectRow): Project => ({
  id: row.id,
  slug: row.slug,
  nameAr: row.name_ar,
  // '' rather than null, matching the columns' own defaults: "not written yet"
  // and "written as nothing" are not two different facts about a name.
  nameEn: row.name_en ?? '',
  tagAr: row.tag_ar,
  tagEn: row.tag_en,
  summaryAr: row.summary_ar ?? '',
  summaryEn: row.summary_en ?? '',
  status: row.status,
  // Already text from to_char; calendarDay() refuses anything that is not a
  // plain day, so a driver that starts handing back timestamps reads as missing
  // rather than as the wrong date.
  startedOn: calendarDay(row.started_on),
  startedPrec: precisionFrom(row.started_prec),
  endedOn: calendarDay(row.ended_on),
  endedPrec: precisionFrom(row.ended_prec),
  logoRef: row.logo_ref,
  isPublished: row.is_published === true,
  sortOrder: Number(row.sort_order),
  archivedOn: row.archived_on,
  archiveReason: row.archive_reason,
  createdOn: row.created_on,
});

/**
 * What the public page shows: published, unarchived, in the association's order.
 *
 * The ordering matches idx_pr_shown — `(sort_order, name_ar) WHERE is_published
 * AND archived_at IS NULL` — which is why this is the cheap query it looks like.
 * The seeded rows carry sort_order 1..4, which is the order /projects has always
 * listed them in.
 */
export async function publishedProjects(): Promise<Project[]> {
  const rows = await query<ProjectRow>(
    `SELECT ${PROJECT_COLUMNS}
       FROM projects p
      WHERE p.is_published AND p.archived_at IS NULL
      ORDER BY p.sort_order, p.name_ar`,
  );
  return rows.map(toProject);
}

/**
 * Every project an administrator may see, published or not.
 *
 * Unpublished rows are LISTED BY DEFAULT and archived ones are not, and the two
 * defaults disagree on purpose — the same distinction lib/org-groups.ts draws
 * between is_active and archived_at. A project taken off the public page is
 * still the association's project and the roles pointing at it are still
 * people's records; an archived row is one that should not have existed.
 */
export async function allProjects(
  options: { includeArchived?: boolean } = {},
): Promise<Project[]> {
  const rows = await query<ProjectRow>(
    `SELECT ${PROJECT_COLUMNS}
       FROM projects p
      WHERE ($1::boolean OR p.archived_at IS NULL)
      ORDER BY p.sort_order, p.name_ar`,
    [options.includeArchived === true],
  );
  return rows.map(toProject);
}

/**
 * One project by its public slug.
 *
 * Not published-filtered and not archive-filtered: the caller decides what to
 * draw for a withdrawn one, exactly as groupById() leaves that decision to its
 * caller. A public page that uses this must test `isPublished` itself.
 */
export async function projectBySlug(slug: string): Promise<Project | null> {
  const row = await queryOne<ProjectRow>(
    `SELECT ${PROJECT_COLUMNS} FROM projects p WHERE p.slug = $1`,
    [slug.trim().toLowerCase()],
  );
  return row ? toProject(row) : null;
}

/**
 * One project by id, archived or not.
 *
 * An edit form and the page that undoes a mistaken archive both have to be able
 * to load the row they are about.
 */
export async function projectById(id: string): Promise<Project | null> {
  const row = await queryOne<ProjectRow>(
    `SELECT ${PROJECT_COLUMNS} FROM projects p WHERE p.id = $1`,
    [id],
  );
  return row ? toProject(row) : null;
}

// --------------------------------------------------------------- the people

/*
 * The columns of a role, qualified, for the read below.
 *
 * Written here rather than imported because lib/volunteer-roles.ts keeps its
 * column list and its row mapper private, and that file is not this feature's to
 * change — lib/org-groups.ts restated the same shape for the same reason.
 *
 * What is NOT restated is the one rule that would be dangerous to hold in three
 * places: THE VISIBILITY FILTER IS BOUND FROM visibleTo(viewer) — the identical
 * function rolesFor() binds on a profile page and membersOf() binds on a group
 * page, not a second `visibility IN (...)` written out in SQL. So a project page
 * can never show a staff-only role to a volunteer while a profile page correctly
 * hides it. Everything else here is shape: the same `to_char` on the DATE
 * columns and the Beirut correction on created_at, then the same pure helpers
 * from volunteer-role-view.ts to read them back.
 */
const ROLE_COLUMNS = `r.id, r.user_id, r.title_ar, r.title_en, r.role_type,
  r.entity_kind, r.entity_id, r.entity_name,
  ${calendarCol('r.started_on')} AS started_on, r.started_prec,
  ${calendarCol('r.ended_on')} AS ended_on, r.ended_prec,
  r.is_current, r.description, r.achievements, r.visibility,
  ${beirutDay('r.created_at')} AS created_on`;

type RoleRow = {
  id: string;
  user_id: string;
  title_ar: string;
  title_en: string | null;
  role_type: string | null;
  entity_kind: string | null;
  entity_id: string | null;
  entity_name: string | null;
  started_on: string | null;
  started_prec: string;
  ended_on: string | null;
  ended_prec: string;
  is_current: boolean;
  description: string | null;
  achievements: unknown;
  visibility: string;
  created_on: string;
  full_name: string | null;
};

/** The three entity columns as one value. chk_vr_entity makes both impossible. */
function entityOf(row: RoleRow): RoleEntity | null {
  if (row.entity_id) return { kind: row.entity_kind ?? '', id: row.entity_id };
  const name = row.entity_name?.trim();
  return name ? { name } : null;
}

const toPerson = (r: RoleRow): PersonWithRole => ({
  userId: r.user_id,
  // '' rather than the id. A UUID on a screen is noise that looks like data.
  fullName: r.full_name ?? '',
  role: {
    id: r.id,
    userId: r.user_id,
    titleAr: r.title_ar,
    titleEn: r.title_en ?? '',
    roleType: r.role_type,
    entity: entityOf(r),
    startedOn: calendarDay(r.started_on),
    startedPrec: precisionFrom(r.started_prec),
    endedOn: calendarDay(r.ended_on),
    endedPrec: precisionFrom(r.ended_prec),
    isCurrent: r.is_current === true,
    description: r.description,
    achievements: cleanAchievements(r.achievements),
    visibility: visibilityFrom(r.visibility),
    createdOn: r.created_on,
  } satisfies VolunteerRole,
});

/*
 * One ordering, this file's own literal and never anything from a form.
 *
 * Current first, then the newest start — a project's people are read as "who is
 * running this today, and who ran it". NULLS LAST is about the START date:
 * somebody whose start nobody wrote down sits at the bottom rather than the top.
 * Nothing in it mentions a person, a count or a rank.
 */
const ORDER_PEOPLE = 'r.is_current DESC, r.started_on DESC NULLS LAST, r.created_at DESC';

/**
 * The roles pointing at this project: the manager, the former managers and the
 * team, in ONE list, current first then past.
 *
 * ── THIS IS THE WHOLE FEATURE, AND IT IS ONE QUERY ────────────────────────
 *
 * It does not filter for managers, because it cannot and must not: that would
 * need a fixed list of leadership titles, which is the closed list migration 046
 * and migration 055 both exist to avoid. «المسؤول الحالي» and «المسؤول السابق
 * للمشروع» are the same rows with different dates on them, and the caller draws
 * the line at `isCurrent` — which is a fact on each row, not a judgement about
 * which title counts as running something.
 *
 * `full_name` is the only column taken from profiles, by LEFT JOIN so a missing
 * profile row cannot make somebody vanish from the list. The date of birth and
 * the safeguarding fields live in profiles_sensitive, which nothing here touches.
 *
 * THE VIEWER IS REQUIRED AND HAS NO DEFAULT, exactly as rolesFor() and
 * membersOf() require one: the tempting default is the permissive one, and a
 * call site that forgot the argument would look identical to one that got it
 * right while publishing a staff-only role to a volunteer.
 *
 * NOTE ON THE INDEX. membersOf() is served by idx_vr_group, which migration 054
 * created partial on `entity_kind = 'group'`. Migration 055 added no matching
 * index for 'project', so this is a scan of volunteer_roles. That is stated
 * rather than quietly relied on: it is fine at this association's size and on
 * one project page at a time, and the fix when it stops being fine is one more
 * partial index in a later migration — not a shape change here.
 */
export async function peopleOn(projectId: string, viewer: Viewer): Promise<PersonWithRole[]> {
  const rows = await query<RoleRow>(
    `SELECT ${ROLE_COLUMNS}, pr.full_name
       FROM volunteer_roles r
       LEFT JOIN profiles pr ON pr.user_id = r.user_id
      WHERE r.entity_kind = 'project'
        AND r.entity_id = $1
        AND r.archived_at IS NULL
        AND r.visibility = ANY($2::text[])
      ORDER BY ${ORDER_PEOPLE}`,
    /* The rule, bound rather than restated. visibleTo() is the same function
     * rolesFor() and membersOf() bind and the probe checks, so there is one
     * statement of who may read a role and not three that can drift apart. */
    [projectId, visibleTo(viewer)],
  );
  return rows.map(toPerson);
}

// -------------------------------------------------------------- the writing

export type ProjectProblem =
  | 'no-name'
  | 'no-slug'
  /** chk_pr_slug: lowercase letters, digits and hyphens, 2–61 characters. */
  | 'bad-slug'
  /** The slug is UNIQUE, and it is the public URL. */
  | 'slug-taken'
  | 'bad-date'
  /** chk_pr_order: it cannot have finished before it started. */
  | 'out-of-order'
  | 'no-archive-reason'
  | 'not-found'
  | 'db';

export type ProjectResult = { ok: true; id: string } | { ok: false; reason: ProjectProblem };

export type ProjectInput = {
  slug: string;
  nameAr: string;
  nameEn?: string;
  tagAr?: string | null;
  tagEn?: string | null;
  summaryAr?: string;
  summaryEn?: string;
  /** Free text. There is no list of statuses. */
  status?: string;
  startedOn?: string | null;
  startedPrec?: DatePrecision;
  endedOn?: string | null;
  endedPrec?: DatePrecision;
  isPublished?: boolean;
  sortOrder?: number;
};

/** Mirrors chk_pr_name, so a blank name is a message rather than a 500. */
const hasName = (value: string): boolean => value.trim().length > 0;

/**
 * Mirrors chk_pr_slug exactly.
 *
 * Character-for-character the constraint's own pattern, so that a slug the
 * database would refuse comes back as a sentence the form can show rather than
 * as a constraint violation an administrator meets as a 500.
 */
const SLUG = /^[a-z0-9][a-z0-9-]{1,60}$/;

/**
 * The two things chk_pr_order and the DATE columns refuse, checked first.
 *
 * Compared as TEXT, which works because 'YYYY-MM-DD' sorts lexically exactly as
 * it sorts chronologically — and because comparing them as Dates is the bug the
 * whole of volunteer-role-view.ts is arranged to avoid.
 */
function checkRun(
  startedOn: string | null,
  endedOn: string | null,
): { ok: true } | { ok: false; reason: ProjectProblem } {
  if (startedOn !== null && calendarDay(startedOn) === null) return { ok: false, reason: 'bad-date' };
  if (endedOn !== null && calendarDay(endedOn) === null) return { ok: false, reason: 'bad-date' };
  if (startedOn !== null && endedOn !== null && endedOn < startedOn) {
    return { ok: false, reason: 'out-of-order' };
  }
  return { ok: true };
}

/** Postgres's unique_violation, so a taken slug reads as a taken slug. */
const isUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { code?: unknown }).code === '23505';

/**
 * Adds a project. Adds — it touches no other row and no role.
 *
 * The status is not checked against anything, and neither is the tag. There is
 * no list of permitted statuses in this file, in the actions, in the dictionary
 * or in the schema — see the head of migration 055.
 */
export async function createProject(input: ProjectInput, by: string): Promise<ProjectResult> {
  const nameAr = input.nameAr.trim();
  if (!hasName(nameAr)) return { ok: false, reason: 'no-name' };

  const slug = input.slug.trim().toLowerCase();
  if (!slug) return { ok: false, reason: 'no-slug' };
  if (!SLUG.test(slug)) return { ok: false, reason: 'bad-slug' };

  const startedOn = input.startedOn?.trim() || null;
  const endedOn = input.endedOn?.trim() || null;
  const run = checkRun(startedOn, endedOn);
  if (!run.ok) return { ok: false, reason: run.reason };

  try {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO projects
         (id, slug, name_ar, name_en, tag_ar, tag_en, summary_ar, summary_en,
          status, started_on, started_prec, ended_on, ended_prec,
          is_published, sort_order, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
               $9, $10::date, $11, $12::date, $13,
               $14, $15, $16, $16)
       RETURNING id`,
      [
        randomUUID(),
        slug,
        nameAr,
        input.nameEn?.trim() ?? '',
        input.tagAr?.trim() || null,
        input.tagEn?.trim() || null,
        input.summaryAr?.trim() ?? '',
        input.summaryEn?.trim() ?? '',
        input.status?.trim() || 'live',
        startedOn,
        precisionFrom(input.startedPrec),
        endedOn,
        precisionFrom(input.endedPrec),
        input.isPublished ?? true,
        Number.isFinite(input.sortOrder) ? Math.trunc(input.sortOrder as number) : 0,
        by,
      ],
    );
    return row ? { ok: true, id: row.id } : { ok: false, reason: 'db' };
  } catch (error) {
    return { ok: false, reason: isUniqueViolation(error) ? 'slug-taken' : 'db' };
  }
}

/**
 * Everything an edit may change. Absent means "leave it alone", and `null` is a
 * value rather than a synonym for absent: clearing a tag and not mentioning it
 * are different edits.
 *
 * `isPublished` is deliberately NOT here. It has setPublished() of its own,
 * because "this project comes off the public site" is a decision somebody takes
 * about what the association says in public and not a side effect of correcting
 * a spelling — and because a whole-row form that carried it would flip it back
 * every time an edit was saved from a stale tab. The same argument org-groups.ts
 * makes for keeping is_active out of GroupPatch.
 */
export type ProjectPatch = {
  slug?: string;
  nameAr?: string;
  nameEn?: string;
  tagAr?: string | null;
  tagEn?: string | null;
  summaryAr?: string;
  summaryEn?: string;
  status?: string;
  startedOn?: string | null;
  startedPrec?: DatePrecision;
  endedOn?: string | null;
  endedPrec?: DatePrecision;
  sortOrder?: number;
};

/**
 * Corrects a project.
 *
 * The row is locked and re-read inside the transaction, and the dates are merged
 * onto what is actually stored rather than onto what the form was rendered from
 * — two administrators with the same edit screen open is the ordinary case, and
 * a patch validated against a five-minute-old copy is how a project ends up
 * having finished before it began. The merged pair is checked before the UPDATE
 * so chk_pr_order comes back as a sentence rather than as a 500.
 *
 * Only the columns present in the patch are written: an UPDATE listing every
 * column would blank a summary the moment somebody built a partial patch.
 */
export async function updateProject(
  id: string,
  patch: ProjectPatch,
  by: string,
): Promise<ProjectResult> {
  if (patch.nameAr !== undefined && !hasName(patch.nameAr)) {
    return { ok: false, reason: 'no-name' };
  }

  const slug = patch.slug === undefined ? undefined : patch.slug.trim().toLowerCase();
  if (slug !== undefined) {
    if (!slug) return { ok: false, reason: 'no-slug' };
    if (!SLUG.test(slug)) return { ok: false, reason: 'bad-slug' };
  }

  try {
    return await transaction(async (client) => {
      const { rows } = await client.query<ProjectRow>(
        `SELECT ${PROJECT_COLUMNS} FROM projects p WHERE p.id = $1 FOR UPDATE`,
        [id],
      );
      const before = rows[0];
      if (!before) return { ok: false as const, reason: 'not-found' as const };
      const current = toProject(before);

      const startedOn =
        patch.startedOn === undefined ? current.startedOn : patch.startedOn?.trim() || null;
      const endedOn =
        patch.endedOn === undefined ? current.endedOn : patch.endedOn?.trim() || null;
      const run = checkRun(startedOn, endedOn);
      if (!run.ok) return { ok: false as const, reason: run.reason };

      /* The SET clause is built from a fixed map of column names — the keys are
       * this file's own literals and never anything that arrived from a form, so
       * there is no path by which a caller names a column. */
      const sets: string[] = [];
      const params: unknown[] = [id, by];
      const set = (column: string, value: unknown) => {
        params.push(value);
        sets.push(`${column} = $${params.length}`);
      };

      if (slug !== undefined) set('slug', slug);
      if (patch.nameAr !== undefined) set('name_ar', patch.nameAr.trim());
      if (patch.nameEn !== undefined) set('name_en', patch.nameEn.trim());
      if (patch.tagAr !== undefined) set('tag_ar', patch.tagAr?.trim() || null);
      if (patch.tagEn !== undefined) set('tag_en', patch.tagEn?.trim() || null);
      if (patch.summaryAr !== undefined) set('summary_ar', patch.summaryAr.trim());
      if (patch.summaryEn !== undefined) set('summary_en', patch.summaryEn.trim());
      if (patch.status !== undefined) set('status', patch.status.trim() || 'live');
      if (patch.startedOn !== undefined) {
        params.push(startedOn);
        sets.push(`started_on = $${params.length}::date`);
      }
      if (patch.startedPrec !== undefined) set('started_prec', precisionFrom(patch.startedPrec));
      if (patch.endedOn !== undefined) {
        params.push(endedOn);
        sets.push(`ended_on = $${params.length}::date`);
      }
      if (patch.endedPrec !== undefined) set('ended_prec', precisionFrom(patch.endedPrec));
      if (patch.sortOrder !== undefined && Number.isFinite(patch.sortOrder)) {
        set('sort_order', Math.trunc(patch.sortOrder));
      }

      // An empty patch is a no-op and not an error: a form saved unchanged
      // should leave updated_at alone rather than record an edit nobody made.
      if (sets.length === 0) return { ok: true as const, id };

      await client.query(
        `UPDATE projects SET ${sets.join(', ')}, updated_by = $2 WHERE id = $1`,
        params,
      );
      return { ok: true as const, id };
    });
  } catch (error) {
    return { ok: false, reason: isUniqueViolation(error) ? 'slug-taken' : 'db' };
  }
}

/**
 * Says whether the public page shows this project.
 *
 * ONE COLUMN, AND IT IS NOT A DELETE. Every role pointing at the project is
 * untouched, the people who ran it go on saying so on their own records, and the
 * project stays on the staff list. Migration 055's trigger refuses a real DELETE
 * outright, and its hint names this as the way to take a project off the site.
 */
export async function setPublished(
  id: string,
  published: boolean,
  by: string,
): Promise<ProjectResult> {
  try {
    const row = await queryOne<{ id: string }>(
      `UPDATE projects SET is_published = $2, updated_by = $3
        WHERE id = $1 AND archived_at IS NULL
        RETURNING id`,
      [id, published, by],
    );
    return row ? { ok: true, id: row.id } : { ok: false, reason: 'not-found' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Takes a project off the list without taking it out of the record.
 *
 * For the row that should not have existed — a duplicate, a typo, a project
 * entered twice. NOT for one that finished: that is a project with an end date
 * and, if it should come off the public page, setPublished(false). The two are
 * kept apart because archiving a project hides the record of everybody who ran
 * it.
 *
 * A reason is required, and chk_pr_archived requires the three columns together,
 * so `by` is mandatory too: an archive with no archiver is a row nobody can be
 * asked about. Refused here as well as by the constraint, so an empty reason is
 * a result the caller can show rather than a 500.
 *
 * The roles pointing at the project are NOT touched. They stay on their holders'
 * records with their dates, which is the whole reason the delete trigger exists.
 */
export async function archiveProject(
  id: string,
  by: string,
  reason: string,
): Promise<ProjectResult> {
  const why = reason.trim();
  if (!why) return { ok: false, reason: 'no-archive-reason' };
  try {
    const row = await queryOne<{ id: string }>(
      `UPDATE projects
          SET archived_at = now(), archived_by = $2, archive_reason = $3, updated_by = $2
        WHERE id = $1 AND archived_at IS NULL
        RETURNING id`,
      [id, by, why],
    );
    return row ? { ok: true, id: row.id } : { ok: false, reason: 'not-found' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}
