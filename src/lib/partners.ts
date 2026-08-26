import 'server-only';
import { randomUUID } from 'node:crypto';
import { query, queryOne, transaction } from './db';
import { formatRoleDate, precisionFrom, type DatePrecision } from './volunteer-role-view';
import { safeUrl } from './profile-field-kinds';
import type { Locale } from './i18n';

/**
 * Who the association works with, and which project each one backs.
 *
 * ── THERE IS NO LIST OF KINDS IN THIS FILE ────────────────────────────────
 *
 * `kind` is free text and nothing here compares it against anything. Migration
 * 057 gives the argument in full and it is the same one migration 054 makes for
 * a group's kind and 046 makes for a role title: section 56 of the brief lists
 * eight kinds of partner, an association meets a ninth before anybody ships a
 * migration, and a partner who does not fit the list is a partner who does not
 * get recorded. The staff form offers the kinds ALREADY RECORDED as a typeahead
 * and accepts anything else; the public page groups by the kinds already
 * recorded and draws exactly as many headings as there are. Neither reads a
 * list, because there is none to read.
 *
 * ── WHY THE URL IS CHECKED HERE WHEN THE DATABASE ALREADY CHECKS IT ───────
 *
 * `chk_pa_url` refuses anything but http and https, and it is the real
 * guarantee: it is the one place no future form, import script or admin console
 * can go around, which is exactly why migration 057 put it there. A partner's
 * website is rendered into an href on a public page, and a `javascript:` URL in
 * an href is stored cross-site scripting that fires for every visitor.
 *
 * This module checks the same rule again for a different purpose. A constraint
 * violation arrives as a 500 with a Postgres error string in it; an
 * administrator who pasted a `data:` URI out of a rich-text editor deserves a
 * sentence telling them what is wrong with it. So the database decides whether
 * the row may exist and this decides what the person is told — two statements of
 * one rule, which is usually a smell and is cheap insurance for the rule that
 * decides what a browser is asked to execute.
 *
 * The check is `safeUrl` from profile-field-kinds.ts rather than a second regex.
 * That function PARSES the URL and returns what the parser produced, which is
 * what a browser will do with the href; a regex hunting for a leading
 * "javascript:" misses `java\tscript:` and a dozen other spellings the parser
 * folds back to the same scheme. What is stored is the parser's output, so
 * nothing downstream renders a different URL from the one that was checked.
 *
 * ── DATES ──────────────────────────────────────────────────────────────────
 *
 * `since_on` is a DATE and must NEVER be given `AT TIME ZONE` and never become a
 * JS `Date` — see the head of lib/volunteer-role-view.ts. `new Date('2022-01-01')`
 * is midnight UTC, so a partner recorded as being with us since 2022 renders as
 * 2021 the moment anything builds a Date from it, and nothing about the result
 * looks wrong. The text arrives as text from Postgres and stays text, and
 * formatRoleDate — the same function a role period uses, not a second copy of
 * it — turns it into «منذ ٢٠٢٢» / 'since 2022' at whatever precision is known.
 *
 * `archived_at` and `created_at` are TIMESTAMPTZ and do take the Beirut
 * correction, exactly as they do in lib/org-groups.ts.
 */

/** A TIMESTAMPTZ as the day it happened in Beirut. The usual correction. */
const beirutDay = (column: string) =>
  `to_char(${column} AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')`;

/**
 * A DATE as text, and pointedly WITHOUT `AT TIME ZONE`.
 *
 * The same distinction lib/org-groups.ts draws beside its own copy of this line:
 * `AT TIME ZONE` on a DATE invents midnight for it and then moves it, turning
 * 2022-01-01 into 2021-12-31 while looking careful.
 */
const calendarCol = (column: string) => `to_char(${column}, 'YYYY-MM-DD')`;

// --------------------------------------------------------------- the partner

/** One organisation the association works with. */
export type Partner = {
  id: string;
  /** Stable, and the identifier in any URL that ever names one. */
  slug: string;
  /** 'شركة', 'جامعة', 'بلدية', anything at all. May be absent. */
  kind: string | null;
  nameAr: string;
  /** May be '' — the reader falls back to the Arabic. */
  nameEn: string;
  summaryAr: string;
  summaryEn: string;
  /** http or https, as the parser produced it, or null. Safe to put in an href. */
  websiteUrl: string | null;
  logoRef: string | null;
  /** 'YYYY-MM-DD' as text, or null. Never build a Date from it. */
  sinceOn: string | null;
  sincePrec: DatePrecision;
  /** Whether it appears on the public page. Separate from archived. */
  isPublished: boolean;
  sortOrder: number;
  /** 'YYYY-MM-DD' in Beirut, or null. */
  archivedOn: string | null;
  archiveReason: string | null;
  createdOn: string;
};

/**
 * The name in one language, falling back to the Arabic.
 *
 * Here rather than in a page, for the reason groupName() is: the public page,
 * the staff list and the project picker all have to answer the same question,
 * and three copies of `nameEn.trim() || nameAr` is three chances to render an
 * empty heading. `name_en` defaults to '' in the schema precisely so this
 * fallback has something to test.
 */
export function partnerName(partner: Partner, lang: Locale): string {
  if (lang === 'ar') return partner.nameAr;
  return partner.nameEn.trim() || partner.nameAr;
}

/** The summary in one language, falling back to the Arabic. Empty means none. */
export function partnerSummary(partner: Partner, lang: Locale): string {
  const chosen = lang === 'ar' ? partner.summaryAr : partner.summaryEn.trim() || partner.summaryAr;
  return chosen.trim();
}

/**
 * «منذ ٢٠٢٢» / 'since 2022', to the precision actually known.
 *
 * formatRoleDate and not a second date formatter. A partner's start date has
 * exactly the shape a role's does — a DATE column with a precision column beside
 * it, because "since 2022" is the honest answer far more often than a day — and
 * a second formatter would be a second place for the timezone bug to be
 * reintroduced. It returns null for an unreadable date, so the caller decides
 * what missing looks like rather than having 'Invalid Date' appear mid-sentence.
 */
export function partnerSince(partner: Partner, lang: Locale): string | null {
  return formatRoleDate(partner.sinceOn, partner.sincePrec, lang);
}

const PARTNER_COLUMNS = `p.id, p.slug, p.kind, p.name_ar, p.name_en,
  p.summary_ar, p.summary_en, p.website_url, p.logo_ref,
  ${calendarCol('p.since_on')} AS since_on, p.since_prec,
  p.is_published, p.sort_order,
  ${beirutDay('p.archived_at')} AS archived_on, p.archive_reason,
  ${beirutDay('p.created_at')} AS created_on`;

type PartnerRow = {
  id: string;
  slug: string;
  kind: string | null;
  name_ar: string;
  name_en: string | null;
  summary_ar: string | null;
  summary_en: string | null;
  website_url: string | null;
  logo_ref: string | null;
  since_on: string | null;
  since_prec: string;
  is_published: boolean;
  sort_order: number;
  archived_on: string | null;
  archive_reason: string | null;
  created_on: string;
};

const toPartner = (row: PartnerRow): Partner => ({
  id: row.id,
  slug: row.slug,
  kind: row.kind,
  nameAr: row.name_ar,
  // '' rather than null, matching the columns' own defaults: "not written yet"
  // and "written as nothing" are not two different facts about a name.
  nameEn: row.name_en ?? '',
  summaryAr: row.summary_ar ?? '',
  summaryEn: row.summary_en ?? '',
  /* Checked on the way out as well as on the way in. The column is guarded by
   * chk_pa_url, but this value goes into an href and a row that reached the
   * table some other way — a restore, a hand-run UPDATE by a superuser — must
   * not be the one exception. A refused URL reads as "no website", which is a
   * true statement about a partner whose URL cannot be trusted. */
  websiteUrl: row.website_url ? safeUrl(row.website_url) : null,
  logoRef: row.logo_ref,
  sinceOn: row.since_on,
  sincePrec: precisionFrom(row.since_prec),
  isPublished: row.is_published === true,
  sortOrder: Number(row.sort_order ?? 0),
  archivedOn: row.archived_on,
  archiveReason: row.archive_reason,
  createdOn: row.created_on,
});

/**
 * Everything on the public page, in the association's own order.
 *
 * The WHERE and the ORDER BY match idx_pa_shown — `(sort_order, name_ar) WHERE
 * is_published AND archived_at IS NULL` — which is why this is the cheap query
 * it looks like.
 *
 * It does NOT order by kind. The public page groups by kind, and could have
 * asked for the rows pre-grouped; ordering by a free-text column would have
 * sorted the headings by the alphabet of whichever language the kind happened to
 * be typed in, and stopped the partial index serving the sort. So the rows come
 * back in the order the association put them in, and the page takes the headings
 * in the order they first appear — which means moving a partner up also moves
 * its heading up, and one control governs both.
 */
export async function publishedPartners(): Promise<Partner[]> {
  const rows = await query<PartnerRow>(
    `SELECT ${PARTNER_COLUMNS}
       FROM partners p
      WHERE p.is_published AND p.archived_at IS NULL
      ORDER BY p.sort_order, p.name_ar`,
  );
  return rows.map(toPartner);
}

/**
 * Every partner for the staff screen, unpublished ones included.
 *
 * Unpublished rows are LISTED BY DEFAULT and archived ones are not, and the two
 * defaults disagree on purpose — the same distinction lib/org-groups.ts draws
 * between inactive and archived. A partnership that has run its course is part
 * of the association's history and is taken off the public page; an archived row
 * is one that should not have existed.
 */
export async function allPartners(
  options: { includeArchived?: boolean } = {},
): Promise<Partner[]> {
  const rows = await query<PartnerRow>(
    `SELECT ${PARTNER_COLUMNS}
       FROM partners p
      WHERE ($1::boolean OR p.archived_at IS NULL)
      ORDER BY p.is_published DESC, p.sort_order, p.name_ar`,
    [options.includeArchived === true],
  );
  return rows.map(toPartner);
}

/**
 * One partner by its slug, archived or not.
 *
 * Not archive-filtered, because an edit form and the page that undoes a mistaken
 * archive both have to be able to load the row they are about. The caller
 * decides what to draw for one — and the public page reads publishedPartners()
 * rather than this, so an archived row cannot reach it by way of a guessed URL.
 */
export async function partnerBySlug(slug: string): Promise<Partner | null> {
  const row = await queryOne<PartnerRow>(
    `SELECT ${PARTNER_COLUMNS} FROM partners p WHERE p.slug = $1`,
    [slug.trim().toLowerCase()],
  );
  return row ? toPartner(row) : null;
}

/** One partner by id. Same rule as above: not archive-filtered. */
export async function partnerById(id: string): Promise<Partner | null> {
  const row = await queryOne<PartnerRow>(
    `SELECT ${PARTNER_COLUMNS} FROM partners p WHERE p.id = $1`,
    [id],
  );
  return row ? toPartner(row) : null;
}

/**
 * The kinds already recorded, for the staff form's typeahead.
 *
 * A DISTINCT over one text column — suggestions, never a permitted set. The
 * staff form feeds these to a `<datalist>`, which offers them and accepts
 * anything else; nothing compares what was typed against what was offered.
 */
export async function partnerKinds(): Promise<string[]> {
  const rows = await query<{ kind: string }>(
    `SELECT DISTINCT kind FROM partners
      WHERE archived_at IS NULL AND kind IS NOT NULL AND btrim(kind) <> ''
      ORDER BY kind
      LIMIT 50`,
  );
  return rows.map((row) => row.kind);
}

// -------------------------------------------------------- partner ↔ project

/** A partnership on one project: the partner, plus the note about the pairing. */
export type ProjectPartner = {
  partner: Partner;
  /** Belongs to the pairing rather than to either side. May be absent. */
  noteAr: string | null;
  noteEn: string | null;
};

/**
 * The note in one language, falling back to the Arabic. Empty means none.
 *
 * Typed on the two columns rather than on ProjectPartner, so the same function
 * answers for a link read from either end — the project's list of partners and
 * the partner's list of projects carry the identical pair of notes, and two
 * copies of this fallback is two chances to render an empty line.
 */
export function partnershipNote(
  link: { noteAr: string | null; noteEn: string | null },
  lang: Locale,
): string {
  const chosen = lang === 'ar' ? link.noteAr : link.noteEn?.trim() || link.noteAr;
  return (chosen ?? '').trim();
}

/**
 * Which partners back one project.
 *
 * Archived partners are filtered out, unpublished ones are not: the staff screen
 * needs to see a link to a partner it has not published yet, and the caller
 * decides what a visitor may be shown. idx_pp_partner covers the other
 * direction; this one walks the primary key.
 */
export async function partnersOnProject(projectId: string): Promise<ProjectPartner[]> {
  const rows = await query<PartnerRow & { note_ar: string | null; note_en: string | null }>(
    `SELECT ${PARTNER_COLUMNS}, pp.note_ar, pp.note_en
       FROM project_partners pp
       JOIN partners p ON p.id = pp.partner_id
      WHERE pp.project_id = $1
        AND p.archived_at IS NULL
      ORDER BY p.sort_order, p.name_ar`,
    [projectId],
  );
  return rows.map((row) => ({
    partner: toPartner(row),
    noteAr: row.note_ar,
    noteEn: row.note_en,
  }));
}

/** The other direction: which projects one partner backs. */
export type PartnerProject = {
  projectId: string;
  nameAr: string;
  nameEn: string;
  noteAr: string | null;
  noteEn: string | null;
};

export async function projectsOfPartner(partnerId: string): Promise<PartnerProject[]> {
  const rows = await query<{
    project_id: string;
    name_ar: string;
    name_en: string | null;
    note_ar: string | null;
    note_en: string | null;
  }>(
    `SELECT pp.project_id, pr.name_ar, pr.name_en, pp.note_ar, pp.note_en
       FROM project_partners pp
       JOIN projects pr ON pr.id = pp.project_id
      WHERE pp.partner_id = $1
      ORDER BY pr.sort_order, pr.name_ar`,
    [partnerId],
  );
  return rows.map((row) => ({
    projectId: row.project_id,
    nameAr: row.name_ar,
    nameEn: row.name_en ?? '',
    noteAr: row.note_ar,
    noteEn: row.note_en,
  }));
}

/**
 * Every link there is, grouped by partner.
 *
 * One statement rather than projectsOfPartner() once per card. The staff screen
 * draws every partner on one page, and a query per card is an N+1 that is
 * invisible while the table holds four rows and is the reason the page is slow
 * when it holds forty. The grouping is done here, in memory, over rows already
 * ordered — nothing counts and nothing ranks: it is a list per key.
 */
export async function partnershipsByPartner(): Promise<Map<string, PartnerProject[]>> {
  const rows = await query<{
    partner_id: string;
    project_id: string;
    name_ar: string;
    name_en: string | null;
    note_ar: string | null;
    note_en: string | null;
  }>(
    `SELECT pp.partner_id, pp.project_id, pr.name_ar, pr.name_en, pp.note_ar, pp.note_en
       FROM project_partners pp
       JOIN projects pr ON pr.id = pp.project_id
      ORDER BY pr.sort_order, pr.name_ar`,
  );

  const byPartner = new Map<string, PartnerProject[]>();
  for (const row of rows) {
    const list = byPartner.get(row.partner_id) ?? [];
    list.push({
      projectId: row.project_id,
      nameAr: row.name_ar,
      nameEn: row.name_en ?? '',
      noteAr: row.note_ar,
      noteEn: row.note_en,
    });
    byPartner.set(row.partner_id, list);
  }
  return byPartner;
}

/**
 * The projects a partner may be linked to, as a name and an id.
 *
 * Two columns and a filter, read here rather than imported from lib/projects.ts.
 * That module owns the projects feature and is being written alongside this one;
 * this is deliberately not a second implementation of it — there is no project
 * type, no status, no period and no write path here, and nothing in this feature
 * reads a project for any purpose but putting its name in a `<select>`. Taking a
 * dependency on a module for a two-column picker would couple this feature's
 * shape to that one's, and the day it grows a `Project` type with fields this
 * form does not want, this file would be carrying them.
 */
export type ProjectChoice = { id: string; nameAr: string; nameEn: string };

export async function linkableProjects(): Promise<ProjectChoice[]> {
  const rows = await query<{ id: string; name_ar: string; name_en: string | null }>(
    `SELECT id, name_ar, name_en
       FROM projects
      WHERE archived_at IS NULL
      ORDER BY sort_order, name_ar`,
  );
  return rows.map((row) => ({
    id: row.id,
    nameAr: row.name_ar,
    nameEn: row.name_en ?? '',
  }));
}

/** The project name in one language, falling back to the Arabic. */
export function projectChoiceName(project: { nameAr: string; nameEn: string }, lang: Locale): string {
  if (lang === 'ar') return project.nameAr;
  return project.nameEn.trim() || project.nameAr;
}

// -------------------------------------------------------------- the writing

export type PartnerProblem =
  | 'no-name'
  /** chk_pa_slug: lowercase, digits and hyphens, two characters or more. */
  | 'bad-slug'
  /** The slug is UNIQUE and another partner holds it. */
  | 'slug-taken'
  /** chk_pa_url: http and https only. See the head of this file. */
  | 'bad-url'
  /** Not a real calendar day. */
  | 'bad-date'
  | 'no-archive-reason'
  | 'not-found'
  | 'no-project'
  | 'already-linked'
  | 'db';

export type PartnerResult = { ok: true; id: string } | { ok: false; reason: PartnerProblem };

export type PartnerInput = {
  slug: string;
  nameAr: string;
  nameEn?: string;
  /** Free text. There is no list of kinds. */
  kind?: string | null;
  summaryAr?: string;
  summaryEn?: string;
  websiteUrl?: string | null;
  sinceOn?: string | null;
  sincePrec?: DatePrecision;
  isPublished?: boolean;
  sortOrder?: number;
};

/** Mirrors chk_pa_name, so a blank name is a message rather than a 500. */
const hasName = (value: string): boolean => value.trim().length > 0;

/** Mirrors chk_pa_slug character for character. Same argument as the URL. */
const SLUG = /^[a-z0-9][a-z0-9-]{1,60}$/;

/** A plain calendar day, checked the way volunteer-role-view.ts checks one. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const isLeap = (y: number): boolean => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

function isCalendarDay(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  if (month < 1 || month > 12) return false;
  const last = month === 2 && isLeap(year) ? 29 : DAYS_IN_MONTH[month - 1];
  return day >= 1 && day <= last;
}

/**
 * The three things a partner form can get wrong, refused before Postgres has to.
 *
 * Returned as a reason rather than thrown, so the action can redirect with a
 * sentence the administrator can act on. Every one of these is also a CHECK
 * constraint — see the head of this file for why both exist.
 */
type Cleaned = { slug: string; nameAr: string; websiteUrl: string | null; sinceOn: string | null };

function clean(
  input: { slug: string; nameAr: string; websiteUrl?: string | null; sinceOn?: string | null },
): { ok: true; value: Cleaned } | { ok: false; reason: PartnerProblem } {
  const nameAr = input.nameAr.trim();
  if (!hasName(nameAr)) return { ok: false, reason: 'no-name' };

  const slug = input.slug.trim().toLowerCase();
  if (!SLUG.test(slug)) return { ok: false, reason: 'bad-slug' };

  const rawUrl = input.websiteUrl?.trim() ?? '';
  let websiteUrl: string | null = null;
  if (rawUrl) {
    // Parsed, not pattern-matched, and what is stored is what the parser
    // produced — see the head of this file.
    websiteUrl = safeUrl(rawUrl);
    if (websiteUrl === null) return { ok: false, reason: 'bad-url' };
  }

  const rawDate = input.sinceOn?.trim() ?? '';
  if (rawDate && !isCalendarDay(rawDate)) return { ok: false, reason: 'bad-date' };

  return { ok: true, value: { slug, nameAr, websiteUrl, sinceOn: rawDate || null } };
}

/** Postgres' unique_violation, so a taken slug reads as itself. */
const isUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { code?: string }).code === '23505';

/**
 * Adds a partner. Adds — it touches no other row and no project link.
 *
 * `is_published` defaults to TRUE in the schema and the form sends it
 * explicitly, so an administrator who has typed a name but not yet checked the
 * website can record the row unpublished and finish it later.
 */
export async function createPartner(input: PartnerInput, by: string): Promise<PartnerResult> {
  const checked = clean(input);
  if (!checked.ok) return checked;
  const { slug, nameAr, websiteUrl, sinceOn } = checked.value;

  try {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO partners
         (id, slug, name_ar, name_en, kind, summary_ar, summary_en,
          website_url, since_on, since_prec, is_published, sort_order,
          created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::date, $10, $11, $12, $13, $13)
       RETURNING id`,
      [
        randomUUID(),
        slug,
        nameAr,
        input.nameEn?.trim() ?? '',
        input.kind?.trim() || null,
        input.summaryAr?.trim() ?? '',
        input.summaryEn?.trim() ?? '',
        websiteUrl,
        sinceOn,
        input.sincePrec ?? 'day',
        input.isPublished ?? true,
        input.sortOrder ?? 0,
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
 * value rather than a synonym for absent: clearing a website and not mentioning
 * it are different edits.
 *
 * `isPublished` is deliberately NOT here. It has setPublished() of its own, for
 * the reason lib/org-groups.ts keeps `isActive` out of GroupPatch: whether an
 * organisation's name appears on a public page is a decision somebody takes and
 * not a side effect of correcting a spelling — and a whole-row form carrying it
 * would put a withdrawn partner back on the public page every time an edit was
 * saved from a stale tab.
 */
export type PartnerPatch = {
  slug?: string;
  nameAr?: string;
  nameEn?: string;
  kind?: string | null;
  summaryAr?: string;
  summaryEn?: string;
  websiteUrl?: string | null;
  sinceOn?: string | null;
  sincePrec?: DatePrecision;
  sortOrder?: number;
};

/**
 * Corrects a partner.
 *
 * The row is locked for the duration, and only the columns present in the patch
 * are written: an UPDATE listing every column would blank a summary the moment
 * somebody built a partial patch. The SET clause is assembled from this file's
 * own column literals and never from anything that arrived on a form.
 */
export async function updatePartner(
  id: string,
  patch: PartnerPatch,
  by: string,
): Promise<PartnerResult> {
  if (patch.nameAr !== undefined && !hasName(patch.nameAr)) {
    return { ok: false, reason: 'no-name' };
  }

  let slug: string | undefined;
  if (patch.slug !== undefined) {
    slug = patch.slug.trim().toLowerCase();
    if (!SLUG.test(slug)) return { ok: false, reason: 'bad-slug' };
  }

  let websiteUrl: string | null | undefined;
  if (patch.websiteUrl !== undefined) {
    const raw = patch.websiteUrl?.trim() ?? '';
    if (!raw) {
      websiteUrl = null;
    } else {
      websiteUrl = safeUrl(raw);
      if (websiteUrl === null) return { ok: false, reason: 'bad-url' };
    }
  }

  let sinceOn: string | null | undefined;
  if (patch.sinceOn !== undefined) {
    const raw = patch.sinceOn?.trim() ?? '';
    if (raw && !isCalendarDay(raw)) return { ok: false, reason: 'bad-date' };
    sinceOn = raw || null;
  }

  try {
    return await transaction(async (client) => {
      const { rows } = await client.query<{ id: string }>(
        'SELECT id FROM partners WHERE id = $1 FOR UPDATE',
        [id],
      );
      if (!rows[0]) return { ok: false as const, reason: 'not-found' as const };

      const sets: string[] = [];
      const params: unknown[] = [id, by];
      const set = (column: string, value: unknown) => {
        params.push(value);
        sets.push(`${column} = $${params.length}`);
      };

      if (slug !== undefined) set('slug', slug);
      if (patch.nameAr !== undefined) set('name_ar', patch.nameAr.trim());
      if (patch.nameEn !== undefined) set('name_en', patch.nameEn.trim());
      if (patch.kind !== undefined) set('kind', patch.kind?.trim() || null);
      if (patch.summaryAr !== undefined) set('summary_ar', patch.summaryAr.trim());
      if (patch.summaryEn !== undefined) set('summary_en', patch.summaryEn.trim());
      if (websiteUrl !== undefined) set('website_url', websiteUrl);
      if (sinceOn !== undefined) {
        params.push(sinceOn);
        // Cast, because a null bound to a bare parameter has no type Postgres
        // can match against a DATE column.
        sets.push(`since_on = $${params.length}::date`);
      }
      if (patch.sincePrec !== undefined) set('since_prec', patch.sincePrec);
      if (patch.sortOrder !== undefined) set('sort_order', patch.sortOrder);

      // An empty patch is a no-op and not an error: a form saved unchanged
      // should leave updated_at alone rather than record an edit nobody made.
      if (sets.length === 0) return { ok: true as const, id };

      await client.query(
        `UPDATE partners SET ${sets.join(', ')}, updated_by = $2 WHERE id = $1`,
        params,
      );
      return { ok: true as const, id };
    });
  } catch (error) {
    return { ok: false, reason: isUniqueViolation(error) ? 'slug-taken' : 'db' };
  }
}

/**
 * Says whether a partner appears on the public page.
 *
 * ONE COLUMN, AND IT IS NOT A DELETE. The row stays, its start date stays, and
 * the projects it backs stay linked to it — a partnership that has run its
 * course really happened, and taking it off the page is not a claim that it did
 * not. That is the difference migration 057 draws between is_published and
 * archived_at, and the trigger refuses a real DELETE outright.
 */
export async function setPublished(
  id: string,
  published: boolean,
  by: string,
): Promise<PartnerResult> {
  try {
    const row = await queryOne<{ id: string }>(
      `UPDATE partners SET is_published = $2, updated_by = $3
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
 * Takes a partner off the list without taking it out of the record.
 *
 * For the row that should not have existed — a duplicate, a typo, an
 * organisation entered before any partnership with it began. Not for one whose
 * partnership has ended: that is setPublished(false).
 *
 * A reason is required, and chk_pa_archived requires the three columns together,
 * so `by` is mandatory too: an archive with no archiver is a row nobody can be
 * asked about. Refused here as well as by the constraint, so an empty reason is
 * a result the caller can show rather than a 500.
 *
 * The project links are NOT touched. project_partners has a RESTRICT foreign key
 * to this table, so a real DELETE could not happen anyway — and an archived
 * partner simply stops being returned by partnersOnProject().
 */
export async function archivePartner(
  id: string,
  by: string,
  reason: string,
): Promise<PartnerResult> {
  const why = reason.trim();
  if (!why) return { ok: false, reason: 'no-archive-reason' };
  try {
    const row = await queryOne<{ id: string }>(
      `UPDATE partners
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

// ------------------------------------------------- linking, and unlinking

/** What a partner gave one project, in both languages. Either may be absent. */
export type PartnershipNotes = { ar?: string | null; en?: string | null };

/**
 * Records that a partner backs a project.
 *
 * Both ids are verified against the database before the insert rather than left
 * to the foreign keys, so a stale form comes back as a sentence instead of a
 * constraint violation. An ARCHIVED partner is refused: a link to a row that has
 * been withdrawn would sit on a project pointing at nothing anybody can see.
 *
 * `ON CONFLICT DO NOTHING` and then a look at what came back, rather than a
 * SELECT first: the primary key is `(project_id, partner_id)` and two
 * administrators linking the same pair at once would both pass a prior check.
 * Nothing returned means the pair was already there, which is not an error the
 * database needs to raise but is worth telling the administrator about — they
 * are about to wonder why their note did not appear.
 */
export async function linkPartner(
  projectId: string,
  partnerId: string,
  notes: PartnershipNotes,
  by: string,
): Promise<PartnerResult> {
  if (!projectId.trim()) return { ok: false, reason: 'no-project' };
  if (!partnerId.trim()) return { ok: false, reason: 'not-found' };

  try {
    const project = await queryOne<{ id: string }>(
      'SELECT id FROM projects WHERE id = $1 AND archived_at IS NULL',
      [projectId],
    );
    if (!project) return { ok: false, reason: 'no-project' };

    const partner = await queryOne<{ id: string }>(
      'SELECT id FROM partners WHERE id = $1 AND archived_at IS NULL',
      [partnerId],
    );
    if (!partner) return { ok: false, reason: 'not-found' };

    const row = await queryOne<{ partner_id: string }>(
      `INSERT INTO project_partners (project_id, partner_id, note_ar, note_en, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (project_id, partner_id) DO NOTHING
       RETURNING partner_id`,
      [projectId, partnerId, notes.ar?.trim() || null, notes.en?.trim() || null, by],
    );
    return row ? { ok: true, id: partnerId } : { ok: false, reason: 'already-linked' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Removes the link, and only the link.
 *
 * A REAL DELETE, and the only one in this feature. Migration 057 says why in as
 * many words: every other guard in this schema protects a record of something
 * that happened to somebody — a badge earned, a role held, a decision walked —
 * whereas this row is a connection between two rows that both survive it.
 * Unlinking a partner from a project it never actually backed is an ordinary
 * correction, not the erasure of anybody's history. The partner row itself
 * cannot be deleted: trg_partners_no_delete refuses it.
 */
export async function unlinkPartner(
  projectId: string,
  partnerId: string,
): Promise<PartnerResult> {
  try {
    const row = await queryOne<{ partner_id: string }>(
      `DELETE FROM project_partners
        WHERE project_id = $1 AND partner_id = $2
        RETURNING partner_id`,
      [projectId, partnerId],
    );
    return row ? { ok: true, id: partnerId } : { ok: false, reason: 'not-found' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}
