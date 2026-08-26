import 'server-only';
import { randomUUID } from 'node:crypto';
import { query, queryOne, transaction } from './db';
import {
  calendarDay,
  cleanAchievements,
  precisionFrom,
  visibilityFrom,
  visibleTo,
  type Viewer,
} from './volunteer-role-view';
import type { PersonWithRole, RoleEntity, VolunteerRole } from './volunteer-roles';
import type { Locale } from './i18n';

/**
 * Committees and teams — and reading who is in one WITHOUT a second table of it.
 *
 * ── THERE IS NO MEMBERSHIP IN THIS FILE, AND THERE MUST NEVER BE ───────────
 *
 * Nothing here inserts, updates or deletes a membership, because there is
 * nothing to insert it into. Migration 054 says it at length and it is the one
 * sentence worth repeating on every file that touches this feature: MEMBERSHIP
 * OF A GROUP IS A `volunteer_roles` ROW whose entity_kind = 'group' and whose
 * entity_id is a row in org_groups. Title, period, precision, achievements,
 * visibility, soft delete and audit already exist there, and a committee_members
 * table would be a second copy of every one of them — with one of the two
 * always the stale one.
 *
 * So membersOf() and leadershipOf() below are READS over volunteer_roles.
 * Writing a membership is createRole() in lib/volunteer-roles.ts, which is the
 * same function the member page calls, reached from the group page through
 * lib/actions/org-groups.ts. One write path, not two.
 *
 * ── AND THAT IS WHERE THE LEADERSHIP HISTORY COMES FROM ────────────────────
 *
 * «سجلّ القيادات» — ٢٠٢٦ محمد، ٢٠٢٥ أحمد، ٢٠٢٤ سارة — is leadershipOf(), which
 * is the same rows read as a chronology. There is no current_president_id
 * column on org_groups and this file contains no UPDATE that would overwrite a
 * predecessor: appointing a successor is endRole() on the outgoing row and
 * createRole() for the incoming one, and both survive. A column would have
 * undone the whole design in one line.
 *
 * ── NOTHING HERE COUNTS OR RANKS ANYBODY ──────────────────────────────────
 *
 * No count(*) over members, no "largest committee", no GROUP BY user_id, and
 * no ORDER BY that puts one person above another for any reason but the dates
 * on their own row. The same invariant peopleWithRole() carries in
 * lib/volunteer-roles.ts and reviewQueue() carries in level-challenge-runs.ts.
 *
 * ── DATES ─────────────────────────────────────────────────────────────────
 *
 * archived_at and created_at on org_groups are TIMESTAMPTZ and take the Beirut
 * correction. started_on and ended_on on volunteer_roles are DATEs and must
 * NEVER be given one — see the head of lib/volunteer-role-view.ts. Both come
 * back as text and stay text.
 */

/** A TIMESTAMPTZ as the day it happened in Beirut. The usual correction. */
const beirutDay = (column: string) =>
  `to_char(${column} AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')`;

/**
 * A DATE as text, and pointedly WITHOUT `AT TIME ZONE`.
 *
 * The same distinction lib/volunteer-roles.ts draws beside its own copy of this
 * line: `AT TIME ZONE` on a DATE invents midnight for it and then moves it,
 * turning 2025-01-01 into 2024-12-31 while looking careful.
 */
const calendarCol = (column: string) => `to_char(${column}, 'YYYY-MM-DD')`;

// --------------------------------------------------------------- the groups

/**
 * One committee, team, unit — or whatever the association calls it.
 *
 * `kind` IS FREE TEXT AND THERE IS NO LIST OF KINDS in this file, in the
 * actions, in the dictionary or in the schema. Migration 054 explains why in
 * the same terms migration 046 argues for free role titles: a new sort of group
 * must not need a migration, and the association's own word for a thing must
 * not have to be approved by a developer first.
 */
export type OrgGroup = {
  id: string;
  /** 'لجنة', 'فريق', 'وحدة', anything at all. May be absent. */
  kind: string | null;
  nameAr: string;
  /** May be '' — the reader falls back to the Arabic. */
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  /** A group inside a group. Null for a top-level one. */
  parentId: string | null;
  /**
   * Whether it still meets. Separate from archived, and the difference matters:
   * a committee that finished its work in 2023 is not a mistake to be hidden.
   */
  isActive: boolean;
  /** 'YYYY-MM-DD' in Beirut, or null. Never reconstruct a Date from it. */
  archivedOn: string | null;
  archiveReason: string | null;
  createdOn: string;
};

/**
 * The name in one language, falling back to the Arabic.
 *
 * Here rather than in a page, because both screens and the role form all have
 * to answer the same question and three copies of `nameEn.trim() || nameAr` is
 * three chances to render an empty heading. `name_en` defaults to '' in the
 * schema precisely so this fallback has something to test.
 */
export function groupName(group: OrgGroup, lang: Locale): string {
  if (lang === 'ar') return group.nameAr;
  return group.nameEn.trim() || group.nameAr;
}

const GROUP_COLUMNS = `g.id, g.kind, g.name_ar, g.name_en,
  g.description_ar, g.description_en, g.parent_id, g.is_active,
  ${beirutDay('g.archived_at')} AS archived_on, g.archive_reason,
  ${beirutDay('g.created_at')} AS created_on`;

type GroupRow = {
  id: string;
  kind: string | null;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  parent_id: string | null;
  is_active: boolean;
  archived_on: string | null;
  archive_reason: string | null;
  created_on: string;
};

const toGroup = (row: GroupRow): OrgGroup => ({
  id: row.id,
  kind: row.kind,
  nameAr: row.name_ar,
  // '' rather than null, matching the column's own default: "not written yet"
  // and "written as nothing" are not two different facts about a name.
  nameEn: row.name_en ?? '',
  descriptionAr: row.description_ar,
  descriptionEn: row.description_en,
  parentId: row.parent_id,
  isActive: row.is_active === true,
  archivedOn: row.archived_on,
  archiveReason: row.archive_reason,
  createdOn: row.created_on,
});

/**
 * Every group, still meeting first, then by kind and by Arabic name.
 *
 * The ordering matches idx_og_listed — `(is_active DESC, kind, name_ar) WHERE
 * archived_at IS NULL` — which is why this is the cheap query it looks like.
 * `kind` is left to the index's own ASC ordering rather than given an explicit
 * NULLS LAST, because that IS the default for ASC and spelling it differently
 * from the index would quietly stop the index serving the sort.
 *
 * Inactive groups are LISTED BY DEFAULT and archived ones are not, and the two
 * defaults disagree on purpose. A committee that finished its work is part of
 * the association's history and its leadership record stays readable; an
 * archived row is one that should not have existed.
 */
export async function groups(
  options: { includeArchived?: boolean; includeInactive?: boolean } = {},
): Promise<OrgGroup[]> {
  const rows = await query<GroupRow>(
    `SELECT ${GROUP_COLUMNS}
       FROM org_groups g
      WHERE ($1::boolean OR g.archived_at IS NULL)
        AND ($2::boolean OR g.is_active)
      ORDER BY g.is_active DESC, g.kind, g.name_ar`,
    [options.includeArchived === true, options.includeInactive !== false],
  );
  return rows.map(toGroup);
}

/**
 * One group by id, archived or not.
 *
 * Not archive-filtered, because an edit form and the page that undoes a
 * mistaken archive both have to be able to load the row they are about. The
 * caller decides what to draw for one.
 */
export async function groupById(id: string): Promise<OrgGroup | null> {
  const row = await queryOne<GroupRow>(
    `SELECT ${GROUP_COLUMNS} FROM org_groups g WHERE g.id = $1`,
    [id],
  );
  return row ? toGroup(row) : null;
}

// ------------------------------------------------------------- the members

/*
 * The columns of a role, qualified, for the two reads below.
 *
 * Written here rather than imported because lib/volunteer-roles.ts keeps its
 * column list and its row mapper private, and that file is not this feature's
 * to change. What is NOT restated is the one rule that would be dangerous to
 * hold in two places: the visibility filter is bound from visibleTo(viewer) —
 * the identical function, not a second `visibility IN (...)` written out in
 * SQL — so a group page can never show a staff-only role to a volunteer while
 * a profile page correctly hides it. Everything else here is shape: the same
 * `to_char` on the DATE columns and the Beirut correction on created_at, then
 * the same pure helpers from volunteer-role-view.ts to read them back.
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
    // Already text from to_char; calendarDay() refuses anything that is not a
    // plain day, so a driver that starts handing back timestamps reads as
    // missing rather than as the wrong date.
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
 * Two orderings, both this file's own literals and never anything from a form.
 *
 * MEMBERS is the one idx_vr_group is built for — current first, then newest
 * start — because a member list is read as "who is on this today, and who was".
 *
 * HISTORY is a straight chronology, and it is genuinely different rather than
 * the same query twice. Section 43 wants ٢٠٢٦ محمد ٢٠٢٥ أحمد ٢٠٢٤ سارة: a
 * descending list of dates. Current-first would put a member who joined in 2020
 * and never left above a president who served through 2025, and the years on
 * the page would then not descend — which reads as a bug in the record rather
 * than as a sort order.
 *
 * NULLS LAST is about the START date: somebody whose start nobody wrote down
 * sits at the bottom rather than the top. Neither ordering mentions a person.
 */
const ORDER_MEMBERS = 'r.is_current DESC, r.started_on DESC NULLS LAST, r.created_at DESC';
const ORDER_HISTORY = 'r.started_on DESC NULLS LAST, r.is_current DESC, r.created_at DESC';

/**
 * The roles pointing at this group. There is no other membership anywhere.
 *
 * `full_name` is the only column taken from profiles, by LEFT JOIN so a missing
 * profile row cannot make a membership vanish from the list. The date of birth
 * and the safeguarding fields live in profiles_sensitive, which nothing in this
 * file touches.
 *
 * THE VIEWER IS REQUIRED AND HAS NO DEFAULT, exactly as rolesFor() requires
 * one: the tempting default is the permissive one, and a call site that forgot
 * the argument would look identical to a call site that got it right while
 * publishing a staff-only role to a volunteer.
 */
export async function membersOf(groupId: string, viewer: Viewer): Promise<PersonWithRole[]> {
  return rolesPointingAt(groupId, viewer, ORDER_MEMBERS);
}

/**
 * The same rows, as the leadership history.
 *
 * «سجلّ القيادات» is not a new mechanism, a new table or a new column — it is
 * this query, which is the entire argument at the head of migration 054. There
 * is nothing here that names a current holder and nothing that could overwrite
 * a predecessor: a person appears once for each period they served, and closing
 * one row and opening another is what a succession looks like.
 *
 * It does not filter for presidents, because it cannot and must not: that would
 * need a fixed list of leadership titles, which is the closed list this whole
 * feature exists to avoid. Every role attached to the group is part of its
 * history, and the page prints each with its own dates.
 */
export async function leadershipOf(groupId: string, viewer: Viewer): Promise<PersonWithRole[]> {
  return rolesPointingAt(groupId, viewer, ORDER_HISTORY);
}

/**
 * The one statement behind both readings.
 *
 * `order` is one of the two constants above and never a caller's string — the
 * two exported functions are the only callers and neither takes it from
 * anywhere. Nothing is interpolated into this SQL but that literal.
 *
 * The WHERE clause matches idx_vr_group, which migration 054 added for exactly
 * this: partial on `entity_kind = 'group'` and `archived_at IS NULL`.
 */
async function rolesPointingAt(
  groupId: string,
  viewer: Viewer,
  order: typeof ORDER_MEMBERS | typeof ORDER_HISTORY,
): Promise<PersonWithRole[]> {
  const rows = await query<RoleRow>(
    `SELECT ${ROLE_COLUMNS}, p.full_name
       FROM volunteer_roles r
       LEFT JOIN profiles p ON p.user_id = r.user_id
      WHERE r.entity_kind = 'group'
        AND r.entity_id = $1
        AND r.archived_at IS NULL
        AND r.visibility = ANY($2::text[])
      ORDER BY ${order}`,
    /* The rule, bound rather than restated. visibleTo() is the same function
     * rolesFor() binds and the probe checks, so there is one statement of who
     * may read a role and not two that can drift apart. */
    [groupId, visibleTo(viewer)],
  );
  return rows.map(toPerson);
}

// -------------------------------------------------------------- the writing

export type GroupProblem =
  | 'no-name'
  /** chk_og_parent: a group cannot be inside itself. */
  | 'parent-self'
  /** The proposed parent is not a row. */
  | 'parent-missing'
  /** A→B→A. See wouldCycle() below for why the database cannot refuse it. */
  | 'parent-cycle'
  | 'no-archive-reason'
  | 'not-found'
  | 'db';

export type GroupResult = { ok: true; id: string } | { ok: false; reason: GroupProblem };

export type GroupInput = {
  nameAr: string;
  nameEn?: string;
  /** Free text. There is no list of kinds. */
  kind?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  parentId?: string | null;
  isActive?: boolean;
};

/** Mirrors chk_og_name, so a blank name is a message rather than a 500. */
const hasName = (value: string): boolean => value.trim().length > 0;

/**
 * WHY THE LONGER CYCLE IS REFUSED HERE AND NOT BY POSTGRES.
 *
 * `chk_og_parent` catches `parent_id = id` because that is a fact about the one
 * row being written, which is all a CHECK constraint may look at: its body has
 * to be immutable and single-row, so it cannot follow parent_id to a second row
 * and ask what ITS parent is. A→B→A is a property of a SET of rows, and no
 * CHECK and no foreign key can express reachability.
 *
 * A trigger could walk the chain — but it would be walking rows it has not
 * locked. Two administrators setting A's parent to B and B's parent to A at the
 * same instant would each see an acyclic graph, each pass, and commit a cycle
 * between them; making that impossible means SERIALIZABLE isolation on every
 * write to this table, which is a large price for a field that is edited a
 * handful of times a year.
 *
 * So it is checked here, inside the same transaction as the UPDATE and after
 * the row has been locked FOR UPDATE. That closes the ordinary case — one
 * administrator, one form — and the residual race is named rather than
 * pretended away: two simultaneous re-parentings could still meet in the
 * middle. The consequence is bounded, because nothing in this codebase recurses
 * through parent_id; the list page reads one level of parent name and stops.
 *
 * The walk is capped at 64 rather than trusting the data, so a cycle that got
 * in some other way — a hand-run UPDATE — makes this return an answer instead
 * of spinning.
 */
const ANCESTORS_REACH = `
  WITH RECURSIVE up AS (
    SELECT id, parent_id, 1 AS depth FROM org_groups WHERE id = $1
    UNION ALL
    SELECT g.id, g.parent_id, up.depth + 1
      FROM org_groups g
      JOIN up ON g.id = up.parent_id
     WHERE up.depth < 64
  )
  SELECT 1 AS one FROM up WHERE id = $2 LIMIT 1`;

/**
 * Adds a group. Adds — it touches no other row and no membership.
 *
 * A brand-new id cannot be anybody's ancestor, so only the parent's existence
 * is checked here; the reachability walk belongs to updateGroup, which is the
 * only way an existing row's parent changes.
 */
export async function createGroup(input: GroupInput, by: string): Promise<GroupResult> {
  const nameAr = input.nameAr.trim();
  if (!hasName(nameAr)) return { ok: false, reason: 'no-name' };

  const parentId = input.parentId?.trim() || null;
  if (parentId !== null) {
    const parent = await queryOne<{ one: number }>(
      'SELECT 1 AS one FROM org_groups WHERE id = $1',
      [parentId],
    );
    if (!parent) return { ok: false, reason: 'parent-missing' };
  }

  try {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO org_groups
         (id, kind, name_ar, name_en, description_ar, description_en,
          parent_id, is_active, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
       RETURNING id`,
      [
        randomUUID(),
        input.kind?.trim() || null,
        nameAr,
        input.nameEn?.trim() ?? '',
        input.descriptionAr?.trim() || null,
        input.descriptionEn?.trim() || null,
        parentId,
        input.isActive ?? true,
        by,
      ],
    );
    return row ? { ok: true, id: row.id } : { ok: false, reason: 'db' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Everything an edit may change. Absent means "leave it alone", and `null` is a
 * value rather than a synonym for absent: clearing a description and not
 * mentioning it are different edits.
 *
 * `isActive` is deliberately NOT here. It has setActive() of its own, because
 * "this committee no longer meets" is a decision somebody takes about the
 * association and not a side effect of correcting a spelling — and because a
 * whole-row form that carried it would flip it back every time an edit was
 * saved from a stale tab.
 */
export type GroupPatch = {
  nameAr?: string;
  nameEn?: string;
  kind?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  parentId?: string | null;
};

/**
 * Corrects a group.
 *
 * The row is locked and the parent chain is walked inside the same transaction,
 * so the graph the check saw is the graph the UPDATE writes into. Only the
 * columns present in the patch are written: an UPDATE listing every column
 * would blank a description the moment somebody built a partial patch.
 */
export async function updateGroup(
  id: string,
  patch: GroupPatch,
  by: string,
): Promise<GroupResult> {
  if (patch.nameAr !== undefined && !hasName(patch.nameAr)) {
    return { ok: false, reason: 'no-name' };
  }

  try {
    return await transaction(async (client) => {
      const { rows } = await client.query<{ id: string }>(
        'SELECT id FROM org_groups WHERE id = $1 FOR UPDATE',
        [id],
      );
      if (!rows[0]) return { ok: false as const, reason: 'not-found' as const };

      const parentId = patch.parentId === undefined ? undefined : patch.parentId?.trim() || null;

      if (parentId) {
        // chk_og_parent would refuse this too; refused here so it comes back as
        // a sentence the form can show rather than as a constraint violation.
        if (parentId === id) return { ok: false as const, reason: 'parent-self' as const };

        /* Read, not locked. `FOR SHARE` here would buy almost nothing — the
         * walk below does not lock the ancestors it crosses either — while
         * introducing a real deadlock: two administrators re-parenting two rows
         * into each other would take the two locks in opposite orders. */
        const parent = await client.query(
          'SELECT 1 FROM org_groups WHERE id = $1',
          [parentId],
        );
        if (!parent.rowCount) return { ok: false as const, reason: 'parent-missing' as const };

        /* Would putting this group under that one close a loop? It would if
         * this group is already somewhere above the proposed parent. See
         * ANCESTORS_REACH for why Postgres cannot be asked to decide it. */
        const reaches = await client.query(ANCESTORS_REACH, [parentId, id]);
        if (reaches.rowCount) return { ok: false as const, reason: 'parent-cycle' as const };
      }

      /* The SET clause is built from a fixed map of column names — the keys are
       * this file's own literals and never anything that arrived from a form,
       * so there is no path by which a caller names a column. */
      const sets: string[] = [];
      const params: unknown[] = [id, by];
      const set = (column: string, value: unknown) => {
        params.push(value);
        sets.push(`${column} = $${params.length}`);
      };

      if (patch.nameAr !== undefined) set('name_ar', patch.nameAr.trim());
      if (patch.nameEn !== undefined) set('name_en', patch.nameEn.trim());
      if (patch.kind !== undefined) set('kind', patch.kind?.trim() || null);
      if (patch.descriptionAr !== undefined) {
        set('description_ar', patch.descriptionAr?.trim() || null);
      }
      if (patch.descriptionEn !== undefined) {
        set('description_en', patch.descriptionEn?.trim() || null);
      }
      if (parentId !== undefined) set('parent_id', parentId);

      // An empty patch is a no-op and not an error: a form saved unchanged
      // should leave updated_at alone rather than record an edit nobody made.
      if (sets.length === 0) return { ok: true as const, id };

      await client.query(
        `UPDATE org_groups SET ${sets.join(', ')}, updated_by = $2 WHERE id = $1`,
        params,
      );
      return { ok: true as const, id };
    });
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Says whether the group still meets.
 *
 * ONE COLUMN, AND IT IS NOT A DELETE. A committee that finished its work in
 * 2023 stays listed, its leadership history stays readable, and the people who
 * served on it go on saying so on their own records — every role pointing at it
 * is untouched by this. That is the difference migration 054 draws between
 * is_active and archived_at, and the trigger refuses a real DELETE outright.
 */
export async function setActive(id: string, active: boolean, by: string): Promise<GroupResult> {
  try {
    const row = await queryOne<{ id: string }>(
      `UPDATE org_groups SET is_active = $2, updated_by = $3
        WHERE id = $1 AND archived_at IS NULL
        RETURNING id`,
      [id, active, by],
    );
    return row ? { ok: true, id: row.id } : { ok: false, reason: 'not-found' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Takes a group off the list without taking it out of the record.
 *
 * For the row that should not have existed — a duplicate, a typo, a committee
 * entered twice. Not for one that finished its work: that is setActive(false),
 * and the two are kept apart because hiding a committee hides the record of
 * everybody who served on it.
 *
 * A reason is required, and chk_og_archived requires the three columns
 * together, so `by` is mandatory too: an archive with no archiver is a row
 * nobody can be asked about. Refused here as well as by the constraint, so an
 * empty reason is a result the caller can show rather than a 500.
 *
 * The roles pointing at the group are NOT touched. They stay on their holders'
 * records with their dates, which is the whole reason the delete trigger exists.
 */
export async function archiveGroup(
  id: string,
  by: string,
  reason: string,
): Promise<GroupResult> {
  const why = reason.trim();
  if (!why) return { ok: false, reason: 'no-archive-reason' };
  try {
    const row = await queryOne<{ id: string }>(
      `UPDATE org_groups
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
