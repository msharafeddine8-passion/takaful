import 'server-only';
import { randomUUID } from 'node:crypto';
import { query, queryOne, transaction } from './db';
import { isStaff } from './authz';
import type { SessionUser } from './auth';
import {
  DEFAULT_ROLE_VISIBILITY,
  calendarDay,
  checkPeriod,
  checkTitle,
  cleanAchievements,
  precisionFrom,
  visibilityFrom,
  visibleTo,
  type DatePrecision,
  type PeriodProblem,
  type RoleAchievement,
  type Viewer,
  type Visibility,
} from './volunteer-role-view';

/**
 * Reading and writing what somebody has been inside Takaful.
 *
 * The rules are next door in volunteer-role-view.ts, where a probe can reach
 * them without a database: how a period is written, who may read a role, and
 * the three contradictions migration 046 refuses. This file is the part that
 * cannot be pure — the queries, and the one transaction that merges an edit
 * onto a row it has locked.
 *
 * ── THERE IS NO LIST OF ROLES IN THIS FILE, AND THERE MUST NEVER BE ────────
 *
 * No enum, no union of titles, no constant array of «رئيس لجنة» / «منسّق
 * مشروع», no CHECK constraint naming one and no lookup table behind it. The
 * head of migration 046 argues it at length and the argument is short: an
 * association invents responsibilities faster than anybody ships a migration,
 * and every title that has to be added by a developer is a title that does not
 * get recorded. `title_ar`, `title_en` and `role_type` are free text.
 *
 * roleTitleSuggestions() below reads back what has been used before. That is a
 * TYPEAHEAD AND NOT A PERMITTED SET — the distinction is the whole feature, and
 * it is restated on the function itself because the day somebody "tidies it up"
 * into a validated list is the day the model stops being the one this migration
 * argued for.
 *
 * ── A SUCCESSOR IS AN EXTRA ROW, NEVER AN OVERWRITE ────────────────────────
 *
 * Nothing here updates one person's role to name another. Appointing a new
 * committee president is endRole() on the outgoing one and createRole() for the
 * incoming one — two rows, both kept. There is deliberately no `replaceRole`,
 * because a single call that did both would be one call away from doing only
 * the second, and the association would be deleting its own history one
 * promotion at a time.
 *
 * endRole() sets is_current = false and, at most, writes the end date it was
 * given. It clears no title, no start date and no description; archiveRole()
 * stamps two columns and removes nothing. The database refuses DELETE outright
 * (trg_volunteer_roles_no_delete), so a bug here is a bug that fails loudly
 * rather than one that loses a person's history.
 *
 * ── WHO MAY READ, AND WHY IT IS A PARAMETER ────────────────────────────────
 *
 * Every read takes a `Viewer` and there is no default. `rolesFor(userId)` with
 * an optional viewer would have exactly one easy call — the one that shows a
 * staff-only role to the open web — and the filter would be forgotten on the
 * page written in a hurry rather than on the one written carefully. viewerOf()
 * is provided so that getting it right is less work than getting it wrong.
 *
 * ── DATES ──────────────────────────────────────────────────────────────────
 *
 * started_on and ended_on are DATE columns: calendar facts, not instants. They
 * are read as 'YYYY-MM-DD' TEXT and compared and rendered as text from there
 * on. NOTHING downstream rebuilds a Date from them — the session runs GMT, the
 * association is in Beirut, and a role starting 2025-01-01 reads as كانون
 * الأول ٢٠٢٤ the moment anything does. See the head of volunteer-role-view.ts.
 */

/*
 * A DATE as text, and pointedly WITHOUT `AT TIME ZONE`.
 *
 * The two neighbouring modules — level-challenge-runs and practical-submissions
 * — define beirutDay() as `to_char(col AT TIME ZONE 'Asia/Beirut', ...)` and
 * they are right, because their columns are TIMESTAMPTZ and an instant has to
 * be told which day it belongs to. These columns are DATE. There is no instant
 * to shift, and `AT TIME ZONE` on a DATE would first invent midnight for it and
 * then move it — turning 2025-01-01 into 2024-12-31 while looking like the
 * careful thing to do. Named here so the difference is stated once rather than
 * rediscovered by whoever copies a line from next door.
 */
const calendarCol = (column: string) => `to_char(${column}, 'YYYY-MM-DD')`;

/** A TIMESTAMPTZ as the day it happened in Beirut. The usual correction. */
const beirutDay = (column: string) =>
  `to_char(${column} AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')`;

const ROLE_COLUMNS = `id, user_id, title_ar, title_en, role_type,
  entity_kind, entity_id, entity_name,
  ${calendarCol('started_on')} AS started_on, started_prec,
  ${calendarCol('ended_on')} AS ended_on, ended_prec,
  is_current, description, achievements, visibility,
  ${beirutDay('created_at')} AS created_on`;

/*
 * The same columns, qualified, for the reads that join `profiles`. Written out
 * rather than derived from the string above, because both tables carry a
 * user_id and an unqualified name in a join is a bug waiting for somebody to
 * add a column to the other table.
 */
const ROLE_COLUMNS_JOINED = `r.id, r.user_id, r.title_ar, r.title_en, r.role_type,
  r.entity_kind, r.entity_id, r.entity_name,
  ${calendarCol('r.started_on')} AS started_on, r.started_prec,
  ${calendarCol('r.ended_on')} AS ended_on, r.ended_prec,
  r.is_current, r.description, r.achievements, r.visibility,
  ${beirutDay('r.created_at')} AS created_on`;

/**
 * What the role was attached to.
 *
 * One shape with three states rather than three loose nullable columns, so that
 * a caller cannot read `entityName` and `entityId` in the same breath and
 * render a committee that is half a row and half a typed string. The database
 * says the same thing with chk_vr_entity (`entity_id IS NULL OR entity_name IS
 * NULL`); this says it in a way a page cannot get wrong.
 *
 * `kind` is free text too — 'committee', 'project', 'team', anything. Migration
 * 046 explains why there is no foreign key: committees and teams do not all
 * exist as tables yet, and a role must be recordable today for a thing that
 * becomes a row next month.
 */
export type RoleEntity =
  /** It points at a row somewhere. `kind` says at which table. */
  | { kind: string; id: string }
  /** It names something that has no row anywhere. */
  | { name: string };

export type VolunteerRole = {
  id: string;
  userId: string;
  /** Free text. Required. */
  titleAr: string;
  /** Free text. May be '' — the reader falls back to the Arabic. */
  titleEn: string;
  /** «منصب», «لجنة», «مشروع» — or anything else somebody typed. Free text. */
  roleType: string | null;
  entity: RoleEntity | null;
  /** 'YYYY-MM-DD' as text. Never reconstruct a Date from it. */
  startedOn: string | null;
  startedPrec: DatePrecision;
  endedOn: string | null;
  endedPrec: DatePrecision;
  isCurrent: boolean;
  description: string | null;
  achievements: RoleAchievement[];
  visibility: Visibility;
  /** The day the row was made, in Beirut. About the record, not the role. */
  createdOn: string;
};

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
};

/**
 * The three entity columns as one value.
 *
 * A row carrying an id AND a name is impossible — chk_vr_entity refuses it —
 * so the id wins here rather than the function throwing: a hand-edited row
 * should render as the more specific of the two answers, not take a page down.
 * A kind with no id is dropped, because "committee, unnamed" is not information.
 */
function entityOf(row: RoleRow): RoleEntity | null {
  if (row.entity_id) return { kind: row.entity_kind ?? '', id: row.entity_id };
  const name = row.entity_name?.trim();
  return name ? { name } : null;
}

const toRole = (r: RoleRow): VolunteerRole => ({
  id: r.id,
  userId: r.user_id,
  titleAr: r.title_ar,
  // '' rather than null: "not written yet" and "written as nothing" are not
  // two different facts, and the column's own default is ''.
  titleEn: r.title_en ?? '',
  roleType: r.role_type,
  entity: entityOf(r),
  // Already text from to_char; calendarDay() refuses anything that is not a
  // plain day, so a driver or a migration that starts handing back timestamps
  // reads as missing rather than as the wrong date.
  startedOn: calendarDay(r.started_on),
  startedPrec: precisionFrom(r.started_prec),
  endedOn: calendarDay(r.ended_on),
  endedPrec: precisionFrom(r.ended_prec),
  isCurrent: r.is_current === true,
  description: r.description,
  achievements: cleanAchievements(r.achievements),
  visibility: visibilityFrom(r.visibility),
  createdOn: r.created_on,
});

/**
 * The signed-in user as a Viewer.
 *
 * Here rather than in the pure module because deciding who counts as staff is
 * authz.ts's job and nobody else's — isStaff() is the same function that opens
 * the staff area, so a role marked 'staff' is readable by exactly the people
 * who can reach the pages that write it.
 *
 * Everyone signed in and active is a 'volunteer' for this purpose, including a
 * registered_user who has not applied yet. The tier is about being inside the
 * association's own walls rather than on the open web; the narrower question of
 * who has been approved as a volunteer is membership status, and answering it
 * here would give one word two meanings.
 */
export function viewerOf(user: SessionUser | null): Viewer {
  if (!user || user.status !== 'active') return { kind: 'anonymous' };
  return isStaff(user)
    ? { kind: 'staff', userId: user.id }
    : { kind: 'volunteer', userId: user.id };
}

// ------------------------------------------------------------------ reading

/**
 * One person's roles: current first, then newest start.
 *
 * Unarchived only. Archived rows are kept forever — that is what the soft
 * delete is for — but a role removed by an administrator is not a role the
 * profile still asserts.
 *
 * `NULLS LAST` on the start date, so a role whose start nobody wrote down sits
 * at the bottom of the past rather than above everything. The ordering matches
 * idx_vr_person, which is why this is the cheap query it looks like.
 *
 * The visibility filter is bound from visibleTo(viewer) rather than written out
 * in SQL, so the rule the database applies is the identical rule the probe
 * holds — one function, not two statements of it that drift apart.
 */
export async function rolesFor(userId: string, viewer: Viewer): Promise<VolunteerRole[]> {
  const rows = await query<RoleRow>(
    `SELECT ${ROLE_COLUMNS} FROM volunteer_roles
      WHERE user_id = $1
        AND archived_at IS NULL
        AND visibility = ANY($2::text[])
      ORDER BY is_current DESC, started_on DESC NULLS LAST, created_at DESC`,
    [userId, visibleTo(viewer)],
  );
  return rows.map(toRole);
}

/** One role, by id, or null when the viewer may not read it. */
export async function roleById(id: string, viewer: Viewer): Promise<VolunteerRole | null> {
  const row = await queryOne<RoleRow>(
    `SELECT ${ROLE_COLUMNS} FROM volunteer_roles
      WHERE id = $1 AND archived_at IS NULL AND visibility = ANY($2::text[])`,
    [id, visibleTo(viewer)],
  );
  return row ? toRole(row) : null;
}

/**
 * Everything an administrator may edit about a role, archived rows included.
 *
 * Separate from roleById and NOT viewer-filtered, because an edit form has to
 * be able to load the row it is about to change — including one whose
 * visibility is 'staff' and one that was archived by mistake. The caller is the
 * action, which has already asserted members.manage; nothing that renders to a
 * volunteer calls this.
 */
export async function roleForAdmin(id: string): Promise<VolunteerRole | null> {
  const row = await queryOne<RoleRow>(
    `SELECT ${ROLE_COLUMNS} FROM volunteer_roles WHERE id = $1`,
    [id],
  );
  return row ? toRole(row) : null;
}

/**
 * Titles that have been used before, for a typeahead.
 *
 * THESE ARE SUGGESTIONS AND NEVER A PERMITTED SET. Nothing in this module, in
 * the actions, or in the schema checks a submitted title against this list, and
 * nothing ever may. The point of reading them back is that an administrator
 * typing «رئيس لجنة الإعلام» for the fourth time gets offered the spelling the
 * other three used — so the free-text column stays searchable — and not that
 * the fifth kind of responsibility this association invents is refused because
 * no developer has heard of it yet.
 *
 * The unanchored ILIKE is what idx_vr_title_ar and idx_vr_title_en exist for:
 * gin_trgm_ops is the only index type that can serve `%foo%`, and without it
 * this is a sequential scan of every role ever recorded. The migration creates
 * them inside an exception block, so a database without pg_trgm still answers —
 * only slower.
 *
 * Admin-only by contract: no visibility filter, because the caller has asserted
 * members.manage and the string is a job title being offered back to the person
 * who is authorised to type it.
 */
export type TitleSuggestion = { titleAr: string; titleEn: string; used: number };

export async function roleTitleSuggestions(q: string, limit = 20): Promise<TitleSuggestion[]> {
  const term = q.trim();
  const cap = Math.min(Math.max(Math.trunc(limit) || 0, 1), 50);

  /*
   * `%`, `_` and `\` escaped before the wildcards are added. Without it an
   * administrator typing a single `%` matches every title in the table, and one
   * typing `_` matches every title of any length — which looks like the
   * typeahead being broken rather than like the input being taken literally.
   */
  const pattern = term === '' ? null : `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

  const rows = await query<{ title_ar: string; title_en: string | null; used: string }>(
    `SELECT title_ar, title_en, count(*)::TEXT AS used
       FROM volunteer_roles
      WHERE archived_at IS NULL
        AND ($1::text IS NULL OR title_ar ILIKE $1 OR title_en ILIKE $1)
      GROUP BY title_ar, title_en
      ORDER BY count(*) DESC, title_ar
      LIMIT $2`,
    [pattern, cap],
  );
  return rows.map((r) => ({
    titleAr: r.title_ar,
    titleEn: r.title_en ?? '',
    /* A count of TITLES, not of people. It orders the suggestion list so the
     * association's usual words come first; it is never shown against a name
     * and there is no GROUP BY user_id anywhere in this file. */
    used: Number(r.used),
  }));
}

/**
 * Everyone whose role matches a phrase.
 *
 * These are the brief's own two examples, and both are text searches over a
 * free-text column because there is nothing else they could be: "everyone who
 * was once a committee president" is peopleWithRole('رئيس لجنة', { held:
 * 'past' }), and "everyone who took charge of a project" is
 * peopleWithRole('مشروع'). No enumerated role means no `WHERE role_type =
 * 'president'`, and that is the trade migration 046 made deliberately.
 *
 * ── THE INVARIANT THIS SHARES WITH THE OTHER CROSS-PERSON QUERIES ──────────
 *
 * IT MAY READ ACROSS PEOPLE. IT MAY NOT RANK THEM. The ORDER BY is the role's
 * own chronology and nothing else: no count of roles per volunteer, no "most
 * titles first", no GROUP BY user_id. The same argument as reviewQueue() in
 * level-challenge-runs.ts — sorting people is how a list quietly becomes a
 * league table, and «من جمع أكبر عدد من المناصب» is not a question this
 * platform is willing to answer.
 *
 * `full_name` is the only column taken from profiles, by LEFT JOIN so that a
 * missing profile row cannot make a role vanish from a search. The date of
 * birth and the safeguarding fields live in profiles_sensitive, which nothing
 * in this file touches.
 *
 * The viewer filter applies here exactly as it does to a profile: a search is
 * not a way around a role's visibility.
 */
export type PersonWithRole = {
  userId: string;
  /** The name somebody needs in order to go and find a person. Nothing else. */
  fullName: string;
  role: VolunteerRole;
};

export async function peopleWithRole(
  /* Named `phrase` rather than `query`, which is what db.ts's own function is
   * called two lines up. One of them shadowing the other inside this file is a
   * confusion nobody needs while reading a search. */
  phrase: string,
  opts: {
    viewer: Viewer;
    /** 'current' for who holds it now, 'past' for who once did, 'any' for both. */
    held?: 'current' | 'past' | 'any';
    limit?: number;
  },
): Promise<PersonWithRole[]> {
  const term = phrase.trim();
  // An empty search returns nobody rather than everybody. A blank box is not a
  // request for the whole association.
  if (term === '') return [];

  const pattern = `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const held = opts.held ?? 'any';
  const cap = Math.min(Math.max(Math.trunc(opts.limit ?? 100) || 0, 1), 200);

  /* Bound as a nullable boolean rather than concatenated into the SQL: three
   * call sites, one statement, and no string building anywhere near a query. */
  const wantCurrent = held === 'any' ? null : held === 'current';

  const rows = await query<RoleRow & { full_name: string | null }>(
    `SELECT ${ROLE_COLUMNS_JOINED}, p.full_name
       FROM volunteer_roles r
       LEFT JOIN profiles p ON p.user_id = r.user_id
      WHERE r.archived_at IS NULL
        AND r.visibility = ANY($1::text[])
        AND (r.title_ar ILIKE $2 OR r.title_en ILIKE $2)
        AND ($3::boolean IS NULL OR r.is_current = $3::boolean)
      ORDER BY r.is_current DESC, r.started_on DESC NULLS LAST, r.created_at DESC
      LIMIT $4`,
    [visibleTo(opts.viewer), pattern, wantCurrent, cap],
  );
  return rows.map((r) => ({
    userId: r.user_id,
    fullName: r.full_name ?? '',
    role: toRole(r),
  }));
}

// ------------------------------------------------------------------ writing

/**
 * What a role is made of, as a caller supplies it.
 *
 * `actorId` is who is doing this, and it is separate from `userId`, who it is
 * about. The two are almost never the same person and the column names
 * (created_by against user_id) are one letter apart in a hurry.
 */
export type RoleInput = {
  /** The person the role is about. */
  userId: string;
  titleAr: string;
  titleEn?: string;
  roleType?: string | null;
  entity?: RoleEntity | null;
  startedOn?: string | null;
  startedPrec?: DatePrecision;
  endedOn?: string | null;
  endedPrec?: DatePrecision;
  isCurrent?: boolean;
  description?: string | null;
  achievements?: readonly RoleAchievement[];
  visibility?: Visibility;
  /** The administrator doing this. Never taken from a form — see the action. */
  actorId: string;
};

export type WriteProblem =
  | PeriodProblem
  | 'no-title'
  | 'not-found'
  /*
   * Archiving without saying why.
   *
   * The counter-argument is real and was made here first: require a reason and
   * an administrator leaves a wrong role sitting on somebody's profile rather
   * than write an essay to remove it. But that is an argument against an ESSAY,
   * not against a reason. The form offers the three ordinary ones — added by
   * mistake, wrong person, duplicate — as one tap each, and a free field for
   * anything else. A reason always, an essay never.
   */
  | 'no-archive-reason'
  | 'db';

export type RoleResult =
  | { ok: true; role: VolunteerRole }
  | { ok: false; reason: WriteProblem };

/** The three entity columns, from the one value. Keeps chk_vr_entity satisfiable. */
function entityColumns(entity: RoleEntity | null | undefined): {
  kind: string | null;
  id: string | null;
  name: string | null;
} {
  if (!entity) return { kind: null, id: null, name: null };
  if ('id' in entity) {
    // chk_vr_entity_kind: an id with no kind is an id into nothing.
    const kind = entity.kind.trim();
    return kind ? { kind, id: entity.id, name: null } : { kind: null, id: null, name: null };
  }
  const name = entity.name.trim();
  return { kind: null, id: null, name: name || null };
}

/**
 * Adds a role. Adds — this is the only way a role comes into existence, and it
 * never touches any other row.
 *
 * Appointing a successor means calling endRole() on the outgoing one and this
 * on the incoming one. Two rows, both kept, and the old president goes on
 * having been president.
 */
export async function createRole(input: RoleInput): Promise<RoleResult> {
  const titleAr = input.titleAr.trim();
  if (!checkTitle(titleAr)) return { ok: false, reason: 'no-title' };

  const startedOn = input.startedOn?.trim() || null;
  const endedOn = input.endedOn?.trim() || null;
  /* Defaults to "still doing it" only when no end date was given. A caller that
   * supplies both is refused by checkPeriod rather than quietly corrected. */
  const isCurrent = input.isCurrent ?? (endedOn === null);

  const period = checkPeriod({
    startedOn,
    startedPrec: precisionFrom(input.startedPrec),
    endedOn,
    endedPrec: precisionFrom(input.endedPrec),
    isCurrent,
  });
  if (!period.ok) return { ok: false, reason: period.reason };

  const entity = entityColumns(input.entity);

  try {
    const row = await queryOne<RoleRow>(
      `INSERT INTO volunteer_roles
         (id, user_id, title_ar, title_en, role_type,
          entity_kind, entity_id, entity_name,
          started_on, started_prec, ended_on, ended_prec,
          is_current, description, achievements, visibility, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
               $9::date, $10, $11::date, $12,
               $13, $14, $15::jsonb, $16, $17, $17)
       RETURNING ${ROLE_COLUMNS}`,
      [
        randomUUID(),
        input.userId,
        titleAr,
        input.titleEn?.trim() ?? '',
        input.roleType?.trim() || null,
        entity.kind,
        entity.id,
        entity.name,
        startedOn,
        precisionFrom(input.startedPrec),
        endedOn,
        precisionFrom(input.endedPrec),
        isCurrent,
        input.description?.trim() || null,
        JSON.stringify(cleanAchievements(input.achievements ?? [])),
        input.visibility ?? DEFAULT_ROLE_VISIBILITY,
        input.actorId,
      ],
    );
    return row ? { ok: true, role: toRole(row) } : { ok: false, reason: 'db' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Everything an edit may change. Absent means "leave it alone" — which is why
 * every field is optional and `null` is a value rather than a synonym for
 * absent: clearing a description and not mentioning it are different edits.
 */
export type RolePatch = {
  titleAr?: string;
  titleEn?: string;
  roleType?: string | null;
  entity?: RoleEntity | null;
  startedOn?: string | null;
  startedPrec?: DatePrecision;
  endedOn?: string | null;
  endedPrec?: DatePrecision;
  isCurrent?: boolean;
  description?: string | null;
  achievements?: readonly RoleAchievement[];
  visibility?: Visibility;
};

/**
 * Corrects a role.
 *
 * The row is locked and re-read inside the transaction, and the patch is merged
 * onto what is actually stored rather than onto what the form was rendered
 * from. Two administrators with the same edit screen open is the ordinary case,
 * and a patch validated against a five-minute-old copy is how a role ends up
 * current with an end date on it.
 *
 * The merged result is checked by checkPeriod() before the UPDATE, so a typo
 * comes back as 'out-of-order' for the form to show rather than as a constraint
 * violation the administrator meets as a 500.
 *
 * Only the columns present in the patch are written. This is not tidiness: an
 * UPDATE that listed every column would blank a title the moment somebody built
 * a partial patch, and the whole subject of this table is not losing things.
 */
export async function updateRole(
  id: string,
  patch: RolePatch,
  actorId: string,
): Promise<RoleResult> {
  if (patch.titleAr !== undefined && !checkTitle(patch.titleAr)) {
    return { ok: false, reason: 'no-title' };
  }

  try {
    return await transaction(async (client) => {
      const { rows } = await client.query<RoleRow>(
        `SELECT ${ROLE_COLUMNS} FROM volunteer_roles WHERE id = $1 FOR UPDATE`,
        [id],
      );
      const before = rows[0];
      if (!before) return { ok: false as const, reason: 'not-found' as const };
      const current = toRole(before);

      const merged = {
        startedOn:
          patch.startedOn === undefined ? current.startedOn : patch.startedOn?.trim() || null,
        startedPrec:
          patch.startedPrec === undefined ? current.startedPrec : precisionFrom(patch.startedPrec),
        endedOn: patch.endedOn === undefined ? current.endedOn : patch.endedOn?.trim() || null,
        endedPrec:
          patch.endedPrec === undefined ? current.endedPrec : precisionFrom(patch.endedPrec),
        isCurrent: patch.isCurrent === undefined ? current.isCurrent : patch.isCurrent,
      };
      const period = checkPeriod(merged);
      if (!period.ok) return { ok: false as const, reason: period.reason };

      /*
       * The SET clause is built from a fixed map of column names — the keys are
       * this file's own literals and never anything that arrived from a form,
       * so there is no path by which a caller names a column.
       */
      const sets: string[] = [];
      const params: unknown[] = [id, actorId];
      const set = (sql: string, value: unknown) => {
        params.push(value);
        sets.push(`${sql} = $${params.length}`);
      };

      if (patch.titleAr !== undefined) set('title_ar', patch.titleAr.trim());
      if (patch.titleEn !== undefined) set('title_en', patch.titleEn.trim());
      if (patch.roleType !== undefined) set('role_type', patch.roleType?.trim() || null);
      if (patch.entity !== undefined) {
        // All three together, always: writing one of them alone is how a row
        // ends up naming a committee and pointing at a different one.
        const entity = entityColumns(patch.entity);
        set('entity_kind', entity.kind);
        set('entity_id', entity.id);
        set('entity_name', entity.name);
      }
      if (patch.startedOn !== undefined) {
        params.push(merged.startedOn);
        sets.push(`started_on = $${params.length}::date`);
      }
      if (patch.startedPrec !== undefined) set('started_prec', merged.startedPrec);
      if (patch.endedOn !== undefined) {
        params.push(merged.endedOn);
        sets.push(`ended_on = $${params.length}::date`);
      }
      if (patch.endedPrec !== undefined) set('ended_prec', merged.endedPrec);
      if (patch.isCurrent !== undefined) set('is_current', merged.isCurrent);
      if (patch.description !== undefined) set('description', patch.description?.trim() || null);
      if (patch.achievements !== undefined) {
        params.push(JSON.stringify(cleanAchievements(patch.achievements)));
        sets.push(`achievements = $${params.length}::jsonb`);
      }
      if (patch.visibility !== undefined) set('visibility', patch.visibility);

      // An empty patch is a no-op and not an error: a form saved unchanged
      // should leave updated_at alone rather than record an edit nobody made.
      if (sets.length === 0) return { ok: true as const, role: current };

      const updated = await client.query<RoleRow>(
        `UPDATE volunteer_roles
            SET ${sets.join(', ')}, updated_by = $2, updated_at = now()
          WHERE id = $1
          RETURNING ${ROLE_COLUMNS}`,
        params,
      );
      const after = updated.rows[0];
      return after
        ? { ok: true as const, role: toRole(after) }
        : { ok: false as const, reason: 'db' as const };
    });
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Closes a role. The person went on having held it.
 *
 * THIS DELETES NOTHING AND OVERWRITES NOTHING. It writes is_current = false and
 * the two end columns, and it does not touch the title, the start date, the
 * description, the achievements or the entity. That is the entire point of the
 * table: the day a new committee president is appointed, the old one must not
 * stop ever having been president.
 *
 * `endedOn` may be null, and that is a real case rather than a lazy default —
 * migration 046 says so. A role that finished in 2023 on a day nobody wrote
 * down is past with no end date, and is_current is what says so; deriving
 * current-ness from the null instead would resurrect it.
 *
 * The order check is in the WHERE clause as well as in checkPeriod(), so two
 * administrators racing cannot slip an end date in front of a start date that
 * moved between the read and the write. No row matched means the date was
 * refused, not that the role vanished.
 */
export async function endRole(
  id: string,
  endedOn: string | null,
  precision: DatePrecision = 'day',
  by?: string | null,
): Promise<RoleResult> {
  const ended = endedOn?.trim() || null;
  if (ended !== null && calendarDay(ended) === null) return { ok: false, reason: 'bad-date' };

  try {
    const row = await queryOne<RoleRow>(
      `UPDATE volunteer_roles
          SET is_current = false,
              ended_on = $2::date,
              ended_prec = $3,
              updated_by = COALESCE($4, updated_by),
              updated_at = now()
        WHERE id = $1
          AND archived_at IS NULL
          AND ($2::date IS NULL OR started_on IS NULL OR $2::date >= started_on)
        RETURNING ${ROLE_COLUMNS}`,
      [id, ended, precisionFrom(precision), by ?? null],
    );
    if (row) return { ok: true, role: toRole(row) };

    /* Nothing matched. Which of the two reasons it was matters to the person
     * reading the message, so it is looked up rather than guessed. */
    const exists = await queryOne<{ one: number }>(
      'SELECT 1 AS one FROM volunteer_roles WHERE id = $1 AND archived_at IS NULL',
      [id],
    );
    return { ok: false, reason: exists ? 'out-of-order' : 'not-found' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Removes a role from the profile without removing it from the record.
 *
 * Two columns stamped and nothing else changed, so an archive made in error is
 * undone by clearing them — which is why the soft delete exists at all. The
 * database refuses a real DELETE (trg_volunteer_roles_no_delete) precisely
 * because a role removed by mistake is a piece of somebody's history that
 * nothing else in the system remembers.
 *
 * chk_vr_archived requires the two columns to be set together, so `by` is
 * required rather than optional: an archive with no archiver is a row nobody
 * can be asked about.
 */
export async function archiveRole(
  id: string,
  by: string,
  /*
   * Why, and it is not optional.
   *
   * Migration 050 added chk_vr_archive_reason, for the reason this parameter
   * now exists: "why did this disappear from my record?" is a question asked
   * while looking at the record, and an answer living only on an audit line
   * that staff can read is not an answer the person affected can reach.
   *
   * Refused here as well as by the constraint, so an empty reason comes back
   * as a result the caller can show rather than as a 500.
   */
  reason: string,
): Promise<RoleResult> {
  const why = reason.trim();
  if (!why) return { ok: false, reason: 'no-archive-reason' };
  try {
    const row = await queryOne<RoleRow>(
      `UPDATE volunteer_roles
          SET archived_at = now(), archived_by = $2, archive_reason = $3,
              updated_by = $2, updated_at = now()
        WHERE id = $1 AND archived_at IS NULL
        RETURNING ${ROLE_COLUMNS}`,
      [id, by, why],
    );
    return row ? { ok: true, role: toRole(row) } : { ok: false, reason: 'not-found' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Puts an archived role back.
 *
 * The counterpart archiveRole needs in order to be the reversible thing it
 * claims to be. Without it the "soft" delete is a delete with extra steps, and
 * an administrator who archived the wrong row has to ask somebody with database
 * access to undo it.
 */
export async function restoreRole(id: string, by: string): Promise<RoleResult> {
  try {
    const row = await queryOne<RoleRow>(
      `UPDATE volunteer_roles
          SET archived_at = NULL, archived_by = NULL, updated_by = $2, updated_at = now()
        WHERE id = $1 AND archived_at IS NOT NULL
        RETURNING ${ROLE_COLUMNS}`,
      [id, by],
    );
    return row ? { ok: true, role: toRole(row) } : { ok: false, reason: 'not-found' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * The user a role is about, for the audit line and for revalidation.
 *
 * Read before the write, so that an action can name the person in the log even
 * when the write then refuses. Not viewer-filtered and not archive-filtered:
 * the caller is an action that has asserted members.manage.
 */
export async function roleSubject(
  id: string,
): Promise<{ userId: string; titleAr: string; titleEn: string } | null> {
  const row = await queryOne<{ user_id: string; title_ar: string; title_en: string | null }>(
    'SELECT user_id, title_ar, title_en FROM volunteer_roles WHERE id = $1',
    [id],
  );
  return row
    ? { userId: row.user_id, titleAr: row.title_ar, titleEn: row.title_en ?? '' }
    : null;
}
