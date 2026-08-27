import 'server-only';
import { randomUUID } from 'node:crypto';
import { query, queryOne, execute, transaction } from './db';
import { calendarDay, formatRoleDate, precisionFrom, type DatePrecision } from './volunteer-role-view';
import type { Locale } from './i18n';

/**
 * «قصص من الميدان» — the association's own account of what it did, and the
 * pictures of it.
 *
 * ── NOTHING HERE COUNTS A PERSON BY HAND, AND NOTHING HERE NAMES ONE ───────
 *
 * THERE IS NO participants FIELD ON `StoryInput` AND THERE MUST NEVER BE, for
 * the reason migration 060 gives at length. A field activity already has an
 * attendance register — one row per person, written by a named supervisor,
 * carrying the minutes that became that volunteer's hours. A number typed into
 * a story box is a SECOND answer to a question that register has answered, and
 * on the day it is typed the two agree, which is exactly what makes it
 * dangerous. Then somebody is added to the sheet six weeks later, or a duration
 * is corrected, and the register moves while the story does not. The
 * association is then publishing «شارك ٤٠ متطوّعاً» while its own record says
 * thirty-seven, and the public number is the wrong one.
 *
 * So both figures come from `story_figures`, the view migration 060 created for
 * the same reason `activity_places` exists: the story page, the staff screen
 * and the attendance sheet cannot disagree about one afternoon. A story with no
 * activity behind it has `figures: null` and prints none — see the note on
 * `toFigures` below, because 0 and "no register" are not the same fact.
 *
 * And nothing in this module SELECTs a name, a user id or a profile. The count
 * is aggregated inside the view. A public page that publishes no individual
 * cannot publish the wrong individual, and that is the first of this feature's
 * gates rather than an accident of the query.
 *
 * ── THE PHOTOGRAPHS, AND THE ONE ANSWER THAT MAY NOT BE GUESSED ───────────
 *
 * `faces` says who is identifiable in a picture and whether they agreed. The
 * two publishable answers are bound from PUBLISHABLE_FACES into every read that
 * a stranger can reach — `= ANY($n)`, the same shape `visibleTo(viewer)` is
 * bound with in lib/projects.ts, and for the identical reason: one statement of
 * the rule that the route and the page share, rather than two `faces <> ...`
 * clauses written out in SQL that can drift apart.
 *
 * `facesFrom` resolves anything unreadable to 'restricted'. That is
 * lib/visibility.ts's rule about DEFAULT_VISIBILITY applied here: handed a
 * value it cannot read, the only safe answer is to publish nothing. Failing
 * closed about consent is a refusal, not a default.
 *
 * ── DATES ─────────────────────────────────────────────────────────────────
 *
 * `happened_on` is a DATE and NEVER takes `AT TIME ZONE`: that would invent
 * midnight for it and then move it, turning 2025-01-01 into 2024-12-31 while
 * looking careful. `created_at`, `archived_at` and an ACTIVITY'S `starts_at`
 * are TIMESTAMPTZ and do take the Beirut correction — they are instants, and
 * the distinction is the whole of the head of lib/volunteer-role-view.ts.
 * Everything comes back as text from to_char and stays text.
 */

/** A TIMESTAMPTZ as the day it happened in Beirut. The usual correction. */
const beirutDay = (column: string) =>
  `to_char(${column} AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')`;

/** A DATE as text, and pointedly WITHOUT `AT TIME ZONE`. See above. */
const calendarCol = (column: string) => `to_char(${column}, 'YYYY-MM-DD')`;

// ------------------------------------------------------------ the pictures

/** What may be in a picture, and whether it may be published. */
export type FacesAnswer = 'none' | 'adults' | 'restricted';

export const FACES_ANSWERS: readonly FacesAnswer[] = ['none', 'adults', 'restricted'];

export function isFacesAnswer(value: unknown): value is FacesAnswer {
  return typeof value === 'string' && (FACES_ANSWERS as readonly string[]).includes(value);
}

/**
 * A stored or submitted value, as an answer this code can act on.
 *
 * Anything unexpected — a null from a row written before the column, a typo, a
 * value from a later migration this build has not been taught — becomes
 * 'restricted' rather than throwing. Throwing would take a public page down and
 * somebody would fix it by loosening the check; resolving to the answer that is
 * never served is the same decision lib/visibility.ts makes for an unreadable
 * visibility, and for the same reason.
 */
export function facesFrom(value: unknown): FacesAnswer {
  return isFacesAnswer(value) ? value : 'restricted';
}

/**
 * The answers a stranger may be shown, bound into SQL rather than restated in
 * it.
 *
 * Every public read below binds this array — `faces = ANY($n)` — and so does
 * /api/public/story-photo/[photoId]. One statement of the rule, in one place a
 * probe could hold, instead of a `faces <> 'restricted'` written out in three
 * queries where the fourth is the one somebody forgets.
 */
export const PUBLISHABLE_FACES: readonly FacesAnswer[] = ['none', 'adults'];

/** The picture formats migration 060 accepts, matching chk_sp_type exactly. */
export const PHOTO_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * chk_sp_size, restated so an oversized file is a sentence rather than a 500.
 *
 * There is no image resizer in this codebase and no dependency is being added
 * to get one, so this cap IS the resizer: a phone photograph pasted in
 * untouched is refused, and the form says to export it small. That is the
 * difference between a grid of cards a volunteer can open on a mobile
 * connection and one they cannot.
 */
export const MAX_STORY_PHOTO_BYTES = 800 * 1024;

export type StoryPhoto = {
  id: string;
  storyId: string;
  /** A cache-buster, never a permission. See the serving routes. */
  version: string;
  altAr: string;
  altEn: string;
  faces: FacesAnswer;
  sortOrder: number;
  byteSize: number;
  /** 'YYYY-MM-DD' in Beirut. */
  uploadedOn: string;
};

/** The caption in one language, falling back to the Arabic. Empty means none. */
export function photoAlt(photo: { altAr: string; altEn: string }, lang: Locale): string {
  const chosen = lang === 'ar' ? photo.altAr : photo.altEn.trim() || photo.altAr;
  return chosen.trim();
}

// --------------------------------------------------------------- the story

export type Story = {
  id: string;
  /** Stable, and the public URL under /gallery. */
  slug: string;
  titleAr: string;
  /** May be '' — the reader falls back to the Arabic. */
  titleEn: string;
  locationAr: string | null;
  locationEn: string | null;
  /**
   * THE COLUMN, which is what an edit form has to render. What the PAGE prints
   * is `StoryCard.shownOn`, which may have come from the linked activity — see
   * the note there. 'YYYY-MM-DD' as text, or null. Never build a Date from it.
   */
  happenedOn: string | null;
  happenedPrec: DatePrecision;
  projectId: string | null;
  activityId: string | null;
  descriptionAr: string;
  descriptionEn: string;
  impactAr: string;
  impactEn: string;
  /** Whether the public page shows it. Separate from archived. */
  isPublished: boolean;
  sortOrder: number;
  /** 'YYYY-MM-DD' in Beirut, or null. */
  archivedOn: string | null;
  archiveReason: string | null;
  createdOn: string;
};

/** The project a story belongs to, as much of it as a story card needs. */
export type StoryProject = { id: string; nameAr: string; nameEn: string };

/** Derived from the attendance register. Never typed, never stored. */
export type StoryFigures = { participants: number; volunteerMinutes: number };

/** The first publishable picture, for the card. */
export type StoryCover = { id: string; version: string; altAr: string; altEn: string };

/**
 * A story with the three things read alongside it.
 *
 * `figures` is null when there is nothing to derive them from, which is a
 * different fact from zero — see `toFigures`.
 */
export type StoryCard = {
  story: Story;
  /** null means the association itself rather than any one project. */
  project: StoryProject | null;
  figures: StoryFigures | null;
  cover: StoryCover | null;
  /**
   * The date to PRINT, which may not be the story's own.
   *
   * A story linked to an activity that already carries a date does not need one
   * typed again — that is the same second-truth this feature refuses for the
   * participant count, one field along: moving the activity would leave the
   * story dated to the day it used to be on. So a story with no date of its own
   * shows the activity's, and a story that sets `happened_on` overrides it,
   * because «الرحلة الشتوية» written up as one story about three weekends has a
   * date of its own that no single activity holds.
   */
  shownOn: string | null;
  shownPrec: DatePrecision;
};

export function storyTitle(story: Story, lang: Locale): string {
  if (lang === 'ar') return story.titleAr;
  return story.titleEn.trim() || story.titleAr;
}

export function storyLocation(story: Story, lang: Locale): string | null {
  const wanted = lang === 'ar' ? story.locationAr : story.locationEn;
  return wanted?.trim() || story.locationAr?.trim() || null;
}

export function storyDescription(story: Story, lang: Locale): string {
  const chosen = lang === 'ar' ? story.descriptionAr : story.descriptionEn.trim() || story.descriptionAr;
  return chosen.trim();
}

export function storyImpact(story: Story, lang: Locale): string {
  const chosen = lang === 'ar' ? story.impactAr : story.impactEn.trim() || story.impactAr;
  return chosen.trim();
}

export function projectNameOf(project: StoryProject, lang: Locale): string {
  if (lang === 'ar') return project.nameAr;
  return project.nameEn.trim() || project.nameAr;
}

/**
 * «١٤ آذار ٢٠٢٣» / '14 March 2023', to the precision actually known.
 *
 * formatRoleDate and not a second date formatter, exactly as lib/partners.ts
 * reuses it: a story's date has the same shape a role's has — a DATE with a
 * precision beside it — and a second formatter would be a second place for the
 * timezone bug to come back. Returns null for an unreadable date so the caller
 * decides what missing looks like.
 */
export function storyDate(card: StoryCard, lang: Locale): string | null {
  return formatRoleDate(card.shownOn, card.shownPrec, lang);
}

const STORY_COLUMNS = `s.id, s.slug, s.title_ar, s.title_en,
  s.location_ar, s.location_en,
  ${calendarCol('s.happened_on')} AS happened_on, s.happened_prec,
  s.project_id, s.activity_id,
  s.description_ar, s.description_en, s.impact_ar, s.impact_en,
  s.is_published, s.sort_order,
  ${beirutDay('s.archived_at')} AS archived_on, s.archive_reason,
  ${beirutDay('s.created_at')} AS created_on`;

/*
 * Everything a card needs beyond the row itself, in one statement.
 *
 * The cover is a LATERAL rather than a query per card: the gallery draws every
 * published story on one page, and asking the database once per card is the
 * N+1 that is invisible at four rows and is why the page is slow at forty — the
 * same argument partnershipsByPartner() makes for its single grouped read.
 *
 * `a.starts_at` IS a TIMESTAMPTZ and DOES take the Beirut correction; `s.
 * happened_on` and `a.starts_on` are DATEs and must not. Both appear in the
 * same COALESCE, which is precisely why the distinction is spelled out here
 * rather than assumed.
 *
 * $1 IS ALWAYS THE PUBLISHABLE_FACES ARRAY. Every query that splices these
 * joins in binds it first and starts its own parameters at $2 — see the four
 * reads below. Written as a fixed position rather than passed in, because a
 * caller that could choose the number is a caller that could choose a different
 * array, and the one thing this clause must not become is negotiable.
 */
const CARD_JOINS = `
  LEFT JOIN projects pr ON pr.id = s.project_id
  LEFT JOIN activities a ON a.id = s.activity_id
  LEFT JOIN story_figures f ON f.story_id = s.id
  LEFT JOIN LATERAL (
    SELECT ph.id, ph.version, ph.alt_ar, ph.alt_en
      FROM story_photos ph
     WHERE ph.story_id = s.id
       AND ph.faces = ANY($1::text[])
     ORDER BY ph.sort_order, ph.uploaded_at
     LIMIT 1
  ) cover ON TRUE`;

const CARD_COLUMNS = `pr.id AS project_id_j, pr.name_ar AS project_name_ar,
  pr.name_en AS project_name_en,
  f.participants, f.volunteer_minutes,
  cover.id AS cover_id, cover.version AS cover_version,
  cover.alt_ar AS cover_alt_ar, cover.alt_en AS cover_alt_en,
  COALESCE(${calendarCol('s.happened_on')},
           ${beirutDay('a.starts_at')},
           ${calendarCol('a.starts_on')}) AS shown_on,
  CASE WHEN s.happened_on IS NOT NULL THEN s.happened_prec ELSE 'day' END AS shown_prec`;

type StoryRow = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  location_ar: string | null;
  location_en: string | null;
  happened_on: string | null;
  happened_prec: string;
  project_id: string | null;
  activity_id: string | null;
  description_ar: string | null;
  description_en: string | null;
  impact_ar: string | null;
  impact_en: string | null;
  is_published: boolean;
  sort_order: number;
  archived_on: string | null;
  archive_reason: string | null;
  created_on: string;
};

type CardRow = StoryRow & {
  project_id_j: string | null;
  project_name_ar: string | null;
  project_name_en: string | null;
  participants: number | null;
  volunteer_minutes: number | null;
  cover_id: string | null;
  cover_version: string | null;
  cover_alt_ar: string | null;
  cover_alt_en: string | null;
  shown_on: string | null;
  shown_prec: string;
};

const toStory = (row: StoryRow): Story => ({
  id: row.id,
  slug: row.slug,
  titleAr: row.title_ar,
  // '' rather than null, matching the columns' own defaults: "not written yet"
  // and "written as nothing" are not two different facts about a title.
  titleEn: row.title_en ?? '',
  locationAr: row.location_ar,
  locationEn: row.location_en,
  // Already text from to_char; calendarDay() refuses anything that is not a
  // plain day, so a driver that starts handing back timestamps reads as missing
  // rather than as the wrong date.
  happenedOn: calendarDay(row.happened_on),
  happenedPrec: precisionFrom(row.happened_prec),
  projectId: row.project_id,
  activityId: row.activity_id,
  descriptionAr: row.description_ar ?? '',
  descriptionEn: row.description_en ?? '',
  impactAr: row.impact_ar ?? '',
  impactEn: row.impact_en ?? '',
  isPublished: row.is_published === true,
  sortOrder: Number(row.sort_order ?? 0),
  archivedOn: row.archived_on,
  archiveReason: row.archive_reason,
  createdOn: row.created_on,
});

/**
 * The two derived figures, or null.
 *
 * NULL WHEN THERE IS NO ACTIVITY, and that is not the same as zero. The view
 * cannot tell the two apart — a story with no activity_id joins to nothing and
 * aggregates to 0 — so the distinction is drawn here, against the column, and
 * the page then prints nothing instead of «٠ مشارك» under a story about an
 * afternoon that forty people came to and nobody kept a register for.
 *
 * Zero with an activity linked is also returned as null: an activity whose
 * register is empty has not yet been marked up, and a published «٠ مشارك» is a
 * statement about the association's own work that is false in the only
 * direction that matters.
 */
function toFigures(row: CardRow): StoryFigures | null {
  if (!row.activity_id) return null;
  const participants = Number(row.participants ?? 0);
  if (!Number.isFinite(participants) || participants <= 0) return null;
  return { participants, volunteerMinutes: Number(row.volunteer_minutes ?? 0) };
}

const toCard = (row: CardRow): StoryCard => ({
  story: toStory(row),
  project: row.project_id_j
    ? {
        id: row.project_id_j,
        nameAr: row.project_name_ar ?? '',
        nameEn: row.project_name_en ?? '',
      }
    : null,
  figures: toFigures(row),
  cover: row.cover_id
    ? {
        id: row.cover_id,
        version: row.cover_version ?? '',
        altAr: row.cover_alt_ar ?? '',
        altEn: row.cover_alt_en ?? '',
      }
    : null,
  shownOn: calendarDay(row.shown_on),
  shownPrec: precisionFrom(row.shown_prec),
});

/*
 * One ordering, this file's own literal and never anything from a form.
 *
 * `sort_order` first so a story can be pinned, then the most recent — field
 * stories are read newest-first, which is why this differs from the project
 * list's `(sort_order, name)`. It matches idx_st_shown, which is why the public
 * read is the cheap query it looks like.
 */
const ORDER_SHOWN = 's.sort_order, s.happened_on DESC NULLS LAST, s.title_ar';

/**
 * What the gallery shows: published, unarchived, in the association's order.
 *
 * The cover is filtered by PUBLISHABLE_FACES, so a story whose only picture is
 * marked 'restricted' comes back with `cover: null` and draws as a card without
 * an image rather than as a card with a photograph nobody agreed to.
 */
export async function publishedStories(): Promise<StoryCard[]> {
  const rows = await query<CardRow>(
    `SELECT ${STORY_COLUMNS}, ${CARD_COLUMNS}
       FROM stories s ${CARD_JOINS}
      WHERE s.is_published AND s.archived_at IS NULL
      ORDER BY ${ORDER_SHOWN}`,
    [[...PUBLISHABLE_FACES]],
  );
  return rows.map(toCard);
}

/**
 * Every story an administrator may see, published or not.
 *
 * Unpublished rows are LISTED BY DEFAULT and archived ones are not, and the two
 * defaults disagree on purpose — the same distinction lib/projects.ts draws. A
 * story taken off the public page is still the association's record of an
 * afternoon; an archived row is one that should not have existed.
 */
export async function allStories(
  options: { includeArchived?: boolean } = {},
): Promise<StoryCard[]> {
  const rows = await query<CardRow>(
    `SELECT ${STORY_COLUMNS}, ${CARD_COLUMNS}
       FROM stories s ${CARD_JOINS}
      WHERE ($2::boolean OR s.archived_at IS NULL)
      ORDER BY s.is_published DESC, ${ORDER_SHOWN}`,
    [[...PUBLISHABLE_FACES], options.includeArchived === true],
  );
  return rows.map(toCard);
}

/**
 * One story by its public slug, published or not.
 *
 * Not published-filtered and not archive-filtered, exactly as projectBySlug()
 * is not: the caller decides what to draw for a withdrawn one. THE PUBLIC PAGE
 * MUST TEST `isPublished` AND `archivedOn` ITSELF — see app/[lang]/gallery/
 * [slug]/page.tsx, which turns both into a 404.
 */
export async function storyBySlug(slug: string): Promise<StoryCard | null> {
  const row = await queryOne<CardRow>(
    `SELECT ${STORY_COLUMNS}, ${CARD_COLUMNS}
       FROM stories s ${CARD_JOINS}
      WHERE s.slug = $2`,
    [[...PUBLISHABLE_FACES], slug.trim().toLowerCase()],
  );
  return row ? toCard(row) : null;
}

/** One story by id, archived or not. The edit form has to be able to load it. */
export async function storyById(id: string): Promise<StoryCard | null> {
  const row = await queryOne<CardRow>(
    `SELECT ${STORY_COLUMNS}, ${CARD_COLUMNS}
       FROM stories s ${CARD_JOINS}
      WHERE s.id = $2`,
    [[...PUBLISHABLE_FACES], id],
  );
  return row ? toCard(row) : null;
}

const PHOTO_COLUMNS = `ph.id, ph.story_id, ph.version, ph.alt_ar, ph.alt_en,
  ph.faces, ph.sort_order, ph.byte_size,
  ${beirutDay('ph.uploaded_at')} AS uploaded_on`;

type PhotoRow = {
  id: string;
  story_id: string;
  version: string;
  alt_ar: string | null;
  alt_en: string | null;
  faces: string;
  sort_order: number;
  byte_size: number;
  uploaded_on: string;
};

const toPhoto = (row: PhotoRow): StoryPhoto => ({
  id: row.id,
  storyId: row.story_id,
  version: row.version,
  altAr: row.alt_ar ?? '',
  altEn: row.alt_en ?? '',
  faces: facesFrom(row.faces),
  sortOrder: Number(row.sort_order ?? 0),
  byteSize: Number(row.byte_size ?? 0),
  uploadedOn: row.uploaded_on,
});

/**
 * The pictures for one story.
 *
 * `includeRestricted` HAS NO DEFAULT, and that is the same discipline
 * rolesFor() applies to its viewer: the tempting default is the permissive one,
 * and a call site that forgot the argument would look identical to one that got
 * it right while publishing a photograph of a child. The public page passes
 * false; the staff screen passes true because a picture that cannot be
 * published is exactly the one somebody has to look at and decide about.
 *
 * The bytes are NOT selected. They are served by the two routes and nothing
 * else, so no page ever holds a megabyte of image it is not going to render.
 */
export async function photosOf(
  storyId: string,
  options: { includeRestricted: boolean },
): Promise<StoryPhoto[]> {
  const rows = await query<PhotoRow>(
    `SELECT ${PHOTO_COLUMNS}
       FROM story_photos ph
      WHERE ph.story_id = $1
        AND ($2::boolean OR ph.faces = ANY($3::text[]))
      ORDER BY ph.sort_order, ph.uploaded_at`,
    [storyId, options.includeRestricted, [...PUBLISHABLE_FACES]],
  );
  return rows.map(toPhoto);
}

/**
 * Every picture there is, grouped by story.
 *
 * One statement rather than photosOf() once per card. The staff screen draws
 * every story on one page, and a query per card is an N+1 that is invisible
 * while the table holds four rows and is the reason the page is slow when it
 * holds forty — the same argument partnershipsByPartner() makes for its single
 * grouped read. The grouping is done here, in memory, over rows the database
 * already ordered: it is a list per key, and nothing counts or ranks.
 *
 * `includeRestricted` has no default here either. See photosOf().
 */
export async function photosByStory(
  options: { includeRestricted: boolean },
): Promise<Map<string, StoryPhoto[]>> {
  const rows = await query<PhotoRow>(
    `SELECT ${PHOTO_COLUMNS}
       FROM story_photos ph
      WHERE ($1::boolean OR ph.faces = ANY($2::text[]))
      ORDER BY ph.sort_order, ph.uploaded_at`,
    [options.includeRestricted, [...PUBLISHABLE_FACES]],
  );

  const byStory = new Map<string, StoryPhoto[]>();
  for (const row of rows) {
    const photo = toPhoto(row);
    const list = byStory.get(photo.storyId) ?? [];
    list.push(photo);
    byStory.set(photo.storyId, list);
  }
  return byStory;
}

/**
 * The bytes of one picture, and whether a stranger may have them.
 *
 * `publicOnly` binds PUBLISHABLE_FACES and adds the story's own state, because
 * a picture on an unpublished or archived story is not public either — a URL
 * guessed from a draft is still a request from the open web. The staff route
 * passes false and gets any picture on any story, which is what its session
 * check has already earned.
 *
 * Returns null for every refusal without distinction, exactly as publicPhoto()
 * does: the caller turns all of them into the same 404, so the response cannot
 * be read as an answer to "does this story exist" or "is that picture
 * restricted".
 */
export async function photoBytes(
  photoId: string,
  options: { publicOnly: boolean },
): Promise<{ contentType: string; bytes: Buffer } | null> {
  const row = await queryOne<{ content_type: string; bytes: Buffer }>(
    `SELECT ph.content_type, ph.bytes
       FROM story_photos ph
       JOIN stories s ON s.id = ph.story_id
      WHERE ph.id = $1
        AND (NOT $2::boolean
             OR (ph.faces = ANY($3::text[]) AND s.is_published AND s.archived_at IS NULL))`,
    [photoId, options.publicOnly, [...PUBLISHABLE_FACES]],
  );
  return row ? { contentType: row.content_type, bytes: row.bytes } : null;
}

// ------------------------------------------------------------- the pickers

/**
 * The projects a story may belong to, as a name and an id.
 *
 * Two columns and a filter, read here rather than imported from lib/projects.ts
 * — the same choice lib/partners.ts made and for the argument its header gives:
 * nothing in this feature reads a project for any purpose but putting its name
 * in a `<select>`, and taking a dependency on that module for a two-column
 * picker would couple this feature's shape to its.
 */
export type ProjectChoice = { id: string; nameAr: string; nameEn: string };

export async function linkableProjects(): Promise<ProjectChoice[]> {
  const rows = await query<{ id: string; name_ar: string; name_en: string | null }>(
    `SELECT id, name_ar, name_en
       FROM projects
      WHERE archived_at IS NULL
      ORDER BY sort_order, name_ar`,
  );
  return rows.map((row) => ({ id: row.id, nameAr: row.name_ar, nameEn: row.name_en ?? '' }));
}

/**
 * The activities a story may be about, newest first.
 *
 * `attended` comes back with each one, because it is the number that will
 * appear on the public page and a coordinator choosing between two activities
 * with similar names should be able to see which register they are attaching.
 * It is a scalar sub-select rather than a JOIN so an activity nobody attended
 * comes back with 0 instead of vanishing from the list.
 *
 * The date is text: `starts_at` is a TIMESTAMPTZ and takes the Beirut
 * correction, `starts_on` is a DATE and does not. Neither becomes a Date here
 * or anywhere downstream.
 */
export type ActivityChoice = {
  id: string;
  titleAr: string;
  titleEn: string;
  /** 'YYYY-MM-DD' or null. Text in, text out. */
  onDate: string | null;
  attended: number;
};

export async function linkableActivities(): Promise<ActivityChoice[]> {
  const rows = await query<{
    id: string;
    title_ar: string;
    title_en: string | null;
    on_date: string | null;
    attended: number;
  }>(
    `SELECT a.id, a.title_ar, a.title_en,
            COALESCE(${beirutDay('a.starts_at')}, ${calendarCol('a.starts_on')}) AS on_date,
            (SELECT count(*)::INT FROM activity_attendance att
              WHERE att.activity_id = a.id AND att.attended) AS attended
       FROM activities a
      WHERE NOT a.is_archived
      ORDER BY a.starts_at DESC NULLS LAST, a.title_ar
      LIMIT 200`,
  );
  return rows.map((row) => ({
    id: row.id,
    titleAr: row.title_ar,
    titleEn: row.title_en ?? '',
    onDate: calendarDay(row.on_date),
    attended: Number(row.attended ?? 0),
  }));
}

export function activityChoiceName(choice: ActivityChoice, lang: Locale): string {
  if (lang === 'ar') return choice.titleAr;
  return choice.titleEn.trim() || choice.titleAr;
}

// -------------------------------------------------------------- the writing

export type StoryProblem =
  | 'no-title'
  | 'no-slug'
  /** chk_st_slug: lowercase letters, digits and hyphens, 2–61 characters. */
  | 'bad-slug'
  /** The slug is UNIQUE, and it is the public URL. */
  | 'slug-taken'
  | 'bad-date'
  | 'no-project'
  | 'no-activity'
  | 'no-archive-reason'
  /** No file arrived, or it was empty. */
  | 'no-image'
  /** chk_sp_type: JPEG, PNG or WebP, and the bytes have to agree. */
  | 'bad-image'
  /** chk_sp_size. See MAX_STORY_PHOTO_BYTES. */
  | 'image-too-large'
  /** The uploader did not say who is in the picture. */
  | 'no-faces'
  | 'not-found'
  | 'db';

export type StoryResult = { ok: true; id: string } | { ok: false; reason: StoryProblem };

export type StoryInput = {
  slug: string;
  titleAr: string;
  titleEn?: string;
  locationAr?: string | null;
  locationEn?: string | null;
  happenedOn?: string | null;
  happenedPrec?: DatePrecision;
  projectId?: string | null;
  activityId?: string | null;
  descriptionAr?: string;
  descriptionEn?: string;
  impactAr?: string;
  impactEn?: string;
  isPublished?: boolean;
  sortOrder?: number;
};

/** Mirrors chk_st_title, so a blank title is a message rather than a 500. */
const hasTitle = (value: string): boolean => value.trim().length > 0;

/** Mirrors chk_st_slug character for character. Same argument as the title. */
const SLUG = /^[a-z0-9][a-z0-9-]{1,60}$/;

/** Postgres's unique_violation, so a taken slug reads as a taken slug. */
const isUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { code?: unknown }).code === '23505';

/**
 * The two ids checked against the database rather than left to the foreign keys.
 *
 * A stale tab holding a project archived since the form was rendered is an
 * ordinary thing rather than an attack, and a constraint violation reaches an
 * administrator as a 500 with a Postgres string in it. Both are optional: null
 * means "the association itself" for a project and "no register" for an
 * activity, which are real answers rather than missing ones.
 */
async function checkLinks(
  projectId: string | null,
  activityId: string | null,
): Promise<{ ok: true } | { ok: false; reason: StoryProblem }> {
  if (projectId) {
    const found = await queryOne<{ id: string }>(
      'SELECT id FROM projects WHERE id = $1 AND archived_at IS NULL',
      [projectId],
    );
    if (!found) return { ok: false, reason: 'no-project' };
  }
  if (activityId) {
    const found = await queryOne<{ id: string }>(
      'SELECT id FROM activities WHERE id = $1',
      [activityId],
    );
    if (!found) return { ok: false, reason: 'no-activity' };
  }
  return { ok: true };
}

/**
 * Records a story. Records — it touches no activity, no register and no hours.
 *
 * There is no participant count and no hours figure in `StoryInput`, and adding
 * one is the change this whole feature exists to refuse. See the head of this
 * file and of migration 060.
 */
export async function createStory(input: StoryInput, by: string): Promise<StoryResult> {
  const titleAr = input.titleAr.trim();
  if (!hasTitle(titleAr)) return { ok: false, reason: 'no-title' };

  const slug = input.slug.trim().toLowerCase();
  if (!slug) return { ok: false, reason: 'no-slug' };
  if (!SLUG.test(slug)) return { ok: false, reason: 'bad-slug' };

  const happenedOn = input.happenedOn?.trim() || null;
  if (happenedOn !== null && calendarDay(happenedOn) === null) {
    return { ok: false, reason: 'bad-date' };
  }

  const projectId = input.projectId?.trim() || null;
  const activityId = input.activityId?.trim() || null;
  const links = await checkLinks(projectId, activityId);
  if (!links.ok) return links;

  try {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO stories
         (id, slug, title_ar, title_en, location_ar, location_en,
          happened_on, happened_prec, project_id, activity_id,
          description_ar, description_en, impact_ar, impact_en,
          is_published, sort_order, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6,
               $7::date, $8, $9, $10,
               $11, $12, $13, $14,
               $15, $16, $17, $17)
       RETURNING id`,
      [
        randomUUID(),
        slug,
        titleAr,
        input.titleEn?.trim() ?? '',
        input.locationAr?.trim() || null,
        input.locationEn?.trim() || null,
        happenedOn,
        precisionFrom(input.happenedPrec),
        projectId,
        activityId,
        input.descriptionAr?.trim() ?? '',
        input.descriptionEn?.trim() ?? '',
        input.impactAr?.trim() ?? '',
        input.impactEn?.trim() ?? '',
        input.isPublished ?? false,
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
 * value rather than a synonym for absent: clearing a location and not mentioning
 * it are different edits.
 *
 * `isPublished` is deliberately NOT here. It has setPublished() of its own, for
 * the reason lib/partners.ts keeps it out of PartnerPatch and one reason more:
 * this feature publishes PHOTOGRAPHS OF PEOPLE, and a whole-row form carrying
 * the flag would put a withdrawn story back on the open web every time a
 * spelling correction was saved from a stale tab.
 */
export type StoryPatch = {
  slug?: string;
  titleAr?: string;
  titleEn?: string;
  locationAr?: string | null;
  locationEn?: string | null;
  happenedOn?: string | null;
  happenedPrec?: DatePrecision;
  projectId?: string | null;
  activityId?: string | null;
  descriptionAr?: string;
  descriptionEn?: string;
  impactAr?: string;
  impactEn?: string;
  sortOrder?: number;
};

/**
 * Corrects a story.
 *
 * The row is locked and re-read inside the transaction, and only the columns
 * present in the patch are written: an UPDATE listing every column would blank
 * a description the moment somebody built a partial patch. The SET clause is
 * assembled from this file's own column literals and never from anything that
 * arrived on a form.
 */
export async function updateStory(
  id: string,
  patch: StoryPatch,
  by: string,
): Promise<StoryResult> {
  if (patch.titleAr !== undefined && !hasTitle(patch.titleAr)) {
    return { ok: false, reason: 'no-title' };
  }

  const slug = patch.slug === undefined ? undefined : patch.slug.trim().toLowerCase();
  if (slug !== undefined) {
    if (!slug) return { ok: false, reason: 'no-slug' };
    if (!SLUG.test(slug)) return { ok: false, reason: 'bad-slug' };
  }

  let happenedOn: string | null | undefined;
  if (patch.happenedOn !== undefined) {
    const raw = patch.happenedOn?.trim() || null;
    if (raw !== null && calendarDay(raw) === null) return { ok: false, reason: 'bad-date' };
    happenedOn = raw;
  }

  const projectId = patch.projectId === undefined ? undefined : patch.projectId?.trim() || null;
  const activityId = patch.activityId === undefined ? undefined : patch.activityId?.trim() || null;
  const links = await checkLinks(projectId ?? null, activityId ?? null);
  if (!links.ok) return links;

  try {
    return await transaction(async (client) => {
      const { rows } = await client.query<{ id: string }>(
        'SELECT id FROM stories WHERE id = $1 FOR UPDATE',
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
      if (patch.titleAr !== undefined) set('title_ar', patch.titleAr.trim());
      if (patch.titleEn !== undefined) set('title_en', patch.titleEn.trim());
      if (patch.locationAr !== undefined) set('location_ar', patch.locationAr?.trim() || null);
      if (patch.locationEn !== undefined) set('location_en', patch.locationEn?.trim() || null);
      if (happenedOn !== undefined) {
        params.push(happenedOn);
        // Cast, because a null bound to a bare parameter has no type Postgres
        // can match against a DATE column.
        sets.push(`happened_on = $${params.length}::date`);
      }
      if (patch.happenedPrec !== undefined) set('happened_prec', precisionFrom(patch.happenedPrec));
      if (projectId !== undefined) set('project_id', projectId);
      if (activityId !== undefined) set('activity_id', activityId);
      if (patch.descriptionAr !== undefined) set('description_ar', patch.descriptionAr.trim());
      if (patch.descriptionEn !== undefined) set('description_en', patch.descriptionEn.trim());
      if (patch.impactAr !== undefined) set('impact_ar', patch.impactAr.trim());
      if (patch.impactEn !== undefined) set('impact_en', patch.impactEn.trim());
      if (patch.sortOrder !== undefined && Number.isFinite(patch.sortOrder)) {
        set('sort_order', Math.trunc(patch.sortOrder));
      }

      // An empty patch is a no-op and not an error: a form saved unchanged
      // should leave updated_at alone rather than record an edit nobody made.
      if (sets.length === 0) return { ok: true as const, id };

      await client.query(
        `UPDATE stories SET ${sets.join(', ')}, updated_by = $2 WHERE id = $1`,
        params,
      );
      return { ok: true as const, id };
    });
  } catch (error) {
    return { ok: false, reason: isUniqueViolation(error) ? 'slug-taken' : 'db' };
  }
}

/**
 * Says whether the public page shows this story.
 *
 * ONE COLUMN, AND IT IS NOT A DELETE. The row stays, its pictures stay, and the
 * activity it names is untouched. Migration 060's trigger refuses a real DELETE
 * outright and its hint names this as the way to take a story off the site.
 */
export async function setPublished(
  id: string,
  published: boolean,
  by: string,
): Promise<StoryResult> {
  try {
    const row = await queryOne<{ id: string }>(
      `UPDATE stories SET is_published = $2, updated_by = $3
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
 * Takes a story off the list without taking it out of the record.
 *
 * For the row that should not have existed — a duplicate, a draft entered
 * twice, a story about the wrong activity. NOT for one whose moment has passed:
 * that is setPublished(false), because the afternoon still happened.
 *
 * A reason is required, and chk_st_archived requires the three columns
 * together, so `by` is mandatory too: an archive with no archiver is a row
 * nobody can be asked about.
 *
 * The PICTURES ARE NOT TOUCHED, and archiving is not how a photograph comes
 * down. Somebody who wants their face off the site wants it gone, not filed —
 * that is removePhoto(), which really deletes. See migration 060.
 */
export async function archiveStory(
  id: string,
  by: string,
  reason: string,
): Promise<StoryResult> {
  const why = reason.trim();
  if (!why) return { ok: false, reason: 'no-archive-reason' };
  try {
    const row = await queryOne<{ id: string }>(
      `UPDATE stories
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

// ---------------------------------------------------------- adding a picture

export type PhotoInput = {
  storyId: string;
  contentType: string;
  bytes: Buffer;
  altAr?: string;
  altEn?: string;
  /** Who is identifiable, and whether they agreed. Never guessed. */
  faces: FacesAnswer;
  sortOrder?: number;
};

/**
 * A magic-number check, because a caller can claim any content type.
 *
 * Lifted from lib/actions/profile.ts, where it guards the profile photo, and it
 * does the same job here: this does not make an image safe — nothing executes
 * it, and the serving routes send `X-Content-Type-Options: nosniff` and a
 * sandbox CSP — but it stops the table filling with files that are not
 * pictures, and it stops a claimed `image/png` that is really something else
 * from being served with a PNG content type.
 */
function looksLikeImage(bytes: Buffer): boolean {
  return (
    (bytes[0] === 0xff && bytes[1] === 0xd8) || // JPEG
    (bytes[0] === 0x89 && bytes[1] === 0x50) || // PNG
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  );
}

/**
 * Adds a picture to a story.
 *
 * `faces` is required and has no default. A default here would be the whole
 * safeguarding gate quietly answering itself, and whichever value it defaulted
 * to would be wrong: 'restricted' silently loses pictures people meant to
 * publish, and either other value publishes a face nobody was asked about. The
 * action refuses a form that did not send one — see 'no-faces'.
 */
export async function addPhoto(input: PhotoInput, by: string): Promise<StoryResult> {
  if (!PHOTO_TYPES.includes(input.contentType)) return { ok: false, reason: 'bad-image' };
  if (input.bytes.byteLength === 0) return { ok: false, reason: 'no-image' };
  if (input.bytes.byteLength > MAX_STORY_PHOTO_BYTES) {
    return { ok: false, reason: 'image-too-large' };
  }
  if (!looksLikeImage(input.bytes)) return { ok: false, reason: 'bad-image' };

  try {
    const story = await queryOne<{ id: string }>(
      'SELECT id FROM stories WHERE id = $1 AND archived_at IS NULL',
      [input.storyId],
    );
    if (!story) return { ok: false, reason: 'not-found' };

    const row = await queryOne<{ id: string }>(
      `INSERT INTO story_photos
         (id, story_id, content_type, bytes, byte_size, version,
          alt_ar, alt_en, faces, sort_order, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        randomUUID(),
        input.storyId,
        input.contentType,
        input.bytes,
        input.bytes.byteLength,
        randomUUID(),
        input.altAr?.trim() ?? '',
        input.altEn?.trim() ?? '',
        input.faces,
        Number.isFinite(input.sortOrder) ? Math.trunc(input.sortOrder as number) : 0,
        by,
      ],
    );
    return row ? { ok: true, id: row.id } : { ok: false, reason: 'db' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Reads one picture's own row, without the bytes, for the audit line.
 *
 * Called before removePhoto so that what is deleted is recorded: the caption,
 * the answer about who was in it and who uploaded it. That is the part worth
 * keeping and the part that is nobody's face.
 */
export async function photoById(photoId: string): Promise<StoryPhoto | null> {
  const row = await queryOne<PhotoRow>(
    `SELECT ${PHOTO_COLUMNS} FROM story_photos ph WHERE ph.id = $1`,
    [photoId],
  );
  return row ? toPhoto(row) : null;
}

/**
 * Removes a picture. A REAL DELETE, and the only one in this feature.
 *
 * Migration 060 argues it in full and it is the one place in this schema where
 * deletability is a safeguarding decision rather than a convenience: every
 * other guard protects a record OF something somebody did, and a photograph is
 * the opposite object — not a record of anybody's work but their face on the
 * open web. «انزعوا تلك الصورة», from the volunteer in it or from a parent, is
 * the one request the association must be able to honour immediately and
 * without a psql prompt.
 *
 * The story is untouched and every other picture on it stays.
 */
export async function removePhoto(photoId: string): Promise<StoryResult> {
  try {
    const row = await queryOne<{ id: string }>(
      'DELETE FROM story_photos WHERE id = $1 RETURNING id',
      [photoId],
    );
    return row ? { ok: true, id: row.id } : { ok: false, reason: 'not-found' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Corrects what was said about who is in a picture.
 *
 * Its own function rather than a field on an edit form, for the reason
 * setPublished() is its own: this is the safeguarding answer, and changing it
 * must be a thing somebody did on purpose rather than a side effect of fixing a
 * caption. Moving a picture to 'restricted' takes it off the public page on the
 * next request — nothing is precomputed and no cached URL outlives the setting.
 */
export async function setPhotoFaces(
  photoId: string,
  faces: FacesAnswer,
): Promise<StoryResult> {
  try {
    const row = await queryOne<{ id: string }>(
      // The version changes too, so any cache holding the old bytes under the
      // old URL is not the thing standing between a person and their request.
      'UPDATE story_photos SET faces = $2, version = $3 WHERE id = $1 RETURNING id',
      [photoId, faces, randomUUID()],
    );
    return row ? { ok: true, id: row.id } : { ok: false, reason: 'not-found' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/** Re-orders one picture within its story. The cover is simply the first. */
export async function setPhotoOrder(photoId: string, sortOrder: number): Promise<StoryResult> {
  const value = Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0;
  try {
    await execute('UPDATE story_photos SET sort_order = $2 WHERE id = $1', [photoId, value]);
    return { ok: true, id: photoId };
  } catch {
    return { ok: false, reason: 'db' };
  }
}
