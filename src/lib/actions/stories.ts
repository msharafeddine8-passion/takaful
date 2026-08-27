'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isDbConfigured } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability, type Capability } from '@/lib/authz';
import { isLocale, locales, type Locale } from '@/lib/i18n';
import {
  addPhoto,
  archiveStory,
  createStory,
  isFacesAnswer,
  photoById,
  removePhoto,
  setPhotoFaces,
  setPhotoOrder,
  setPublished,
  storyById,
  updateStory,
  MAX_STORY_PHOTO_BYTES,
  type StoryPatch,
} from '@/lib/stories';
import { isPrecision, type DatePrecision } from '@/lib/volunteer-role-view';
import type { StoryStrings } from '@/lib/dictionaries/stories';

/**
 * A member of staff writing up what the association did, and putting it — with
 * photographs of people — on a page anybody can read.
 *
 * ── THE PERMISSION CHECK IS HERE, AND NOWHERE IN A COMPONENT ───────────────
 *
 * A check in JSX hides a button and leaves the POST working. On this feature
 * that would mean anybody with a session publishing a photograph of a volunteer
 * onto the open web. Every function below asserts a capability against the
 * SESSION before it reads a single field, and requireCapability throws rather
 * than returning a boolean a caller can forget to look at.
 *
 * EVERY FIELD ARRIVING IN FormData IS A CLAIM. The story id, the project id,
 * the activity id, the slug, the date, the precision, the answer about who is
 * in a photograph: each is parsed and checked, and the ids are looked up
 * against the database rather than trusted. The only thing taken from the
 * session rather than from the form is who the actor is — which is the one
 * thing a form may never say, because a form that could name its own author
 * could name somebody else. `uploaded_by` on a picture is NOT NULL for exactly
 * that reason: the affirmation about who is in it belongs to a person.
 *
 * ── WHICH CAPABILITY, AND WHY IT IS THE SAME ONE PARTNERS USE ──────────────
 *
 * `challenges.manage` — project_coordinator, program_admin and super_admin —
 * following lib/actions/partners.ts, whose header argues the choice in full.
 * The argument transfers, and where it does not the difference points the same
 * way:
 *
 * members.manage is the gate for committees and for projects because those
 * screens are HALF OF A PERSON'S RECORD: membership of a group is a
 * volunteer_roles row, so renaming لجنة الإعلام rewrites a line on eleven
 * volunteers' records. A story has none of that shape. Nothing in this file or
 * in lib/stories.ts writes, reads or invalidates a volunteer_roles row, and no
 * query behind these screens selects a name, a user id or a profile — the two
 * figures are aggregated inside `story_figures` and arrive as integers.
 *
 * What a story IS, is public content about the association: a statement, on the
 * open web, about work it did. That is the class lib/actions/partners.ts placed
 * behind challenges.manage, and it is why the staff hub files both under
 * «الصفحات العامّة» rather than among the members' screens.
 *
 * The role list settles it in the same direction. `project_coordinator` is the
 * person who was actually there on the day, who knows which activity the story
 * is about and whether the people in the photograph were asked. members.manage
 * excludes them, so gating this there would put the write-up form in front of
 * the two people least likely to have been in the room.
 *
 * ── WHAT IT DOES NOT GRANT ─────────────────────────────────────────────────
 *
 * Nothing here can widen who is visible anywhere else. A story publishes no
 * name, and the only person-shaped thing it can publish is a photograph, which
 * passes `faces` before any read a stranger can reach returns it. A coordinator
 * with this capability cannot make a hidden volunteer appear, cannot read a
 * profile, and cannot alter an attendance register — the figures are read from
 * the register and never written to it.
 *
 * ── HOW A REFUSAL REACHES THE SCREEN WITHOUT ANY JAVASCRIPT ────────────────
 *
 * These actions return `void` and are used as plain `<form action={…}>` on
 * server components, so there is no useActionState to carry an error back. A
 * refusal redirects to the same page with `?error=…` and the page renders the
 * sentence. That matters most for 'image-too-large' and 'no-faces', which are
 * the two refusals a coordinator will meet while working normally and the ones
 * that would otherwise look like a button that does nothing.
 *
 * `back()` types its argument as a key of the dictionary's own `errors`, so a
 * refusal the strings do not answer to fails to compile rather than reaching a
 * URL as an unreadable code.
 */

/** Named once so the reasoning above has something to point at. */
const STORIES: Capability = 'challenges.manage';

/** Exactly the refusals the dictionary has a sentence for. */
type ScreenError = keyof StoryStrings['errors'];

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
 * The sort order, as a whole number.
 *
 * A field that arrives as 'abc' becomes 0 rather than NaN: the column is
 * `INTEGER NOT NULL DEFAULT 0` and NaN reaching a bind parameter is a 500 for a
 * field nobody meant to fill in. Clamped so a pasted 1e30 cannot overflow an
 * int4 on the way in.
 */
const order = (formData: FormData, name: string): number => {
  const parsed = Number.parseInt(text(formData, name), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(Math.max(parsed, -100000), 100000);
};

/**
 * Back to the list, with a sentence if something was refused.
 *
 * redirect() signals by throwing, so every call sits outside a try block and
 * after the audit line. A successful write redirects to the CLEAN path on
 * purpose: without it, a form submitted from a page still carrying
 * `?error=no-faces` would succeed and leave the refusal on screen.
 */
function back(lang: Locale, error?: ScreenError): never {
  const path = `/${lang}/staff/stories`;
  redirect(error ? `${path}?error=${error}` : path);
}

/**
 * The staff list, the gallery and the story's own page, IN BOTH LANGUAGES.
 *
 * Publishing from the Arabic screen changes the English page too — one row read
 * twice — so revalidating only the locale the form was submitted from would
 * leave the other language showing yesterday's list until something else
 * happened to touch it.
 *
 * The story's own path is revalidated by slug when there is one, because
 * /gallery/[slug] is a page of its own and taking a story off the site has to
 * empty that address as well as the list it was linked from.
 */
function refresh(lang: Locale, slug?: string | null): void {
  revalidatePath(`/${lang}/staff/stories`);
  for (const locale of locales) {
    revalidatePath(`/${locale}/gallery`);
    if (slug) revalidatePath(`/${locale}/gallery/${slug}`);
  }
}

// -------------------------------------------------------------------- create

/**
 * Records a story.
 *
 * THERE IS NO PARTICIPANT FIELD READ HERE AND THERE MUST NEVER BE. Both figures
 * come from the attendance register of the activity this story names — see the
 * head of lib/stories.ts and of migration 060. What this form collects is the
 * prose, the place and the two links.
 *
 * `isPublished` is read from the form and defaults to false in the schema, so a
 * coordinator who has written the text but not yet chosen the photographs
 * records the row unpublished and finishes it later.
 */
export async function createStoryAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) back(lang, 'unavailable');

  const actor = await requireCapability(STORIES);

  const result = await createStory(
    {
      slug: text(formData, 'slug'),
      titleAr: text(formData, 'titleAr'),
      titleEn: text(formData, 'titleEn'),
      locationAr: text(formData, 'locationAr') || null,
      locationEn: text(formData, 'locationEn') || null,
      happenedOn: text(formData, 'happenedOn') || null,
      happenedPrec: precision(formData, 'happenedPrec'),
      projectId: text(formData, 'projectId') || null,
      activityId: text(formData, 'activityId') || null,
      descriptionAr: text(formData, 'descriptionAr'),
      descriptionEn: text(formData, 'descriptionEn'),
      impactAr: text(formData, 'impactAr'),
      impactEn: text(formData, 'impactEn'),
      isPublished: flag(formData, 'isPublished'),
      sortOrder: order(formData, 'sortOrder'),
    },
    actor.id,
  );

  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: 'story.created',
    /* The story, not a person. Nothing in this feature targets a user, because
     * nothing in it is about one — see the head of this file. */
    targetType: 'story',
    targetId: result.id,
    newValue: {
      slug: text(formData, 'slug'),
      titleAr: text(formData, 'titleAr'),
      projectId: text(formData, 'projectId') || null,
      activityId: text(formData, 'activityId') || null,
      isPublished: flag(formData, 'isPublished'),
    },
  });

  refresh(lang, text(formData, 'slug'));
  back(lang);
}

// -------------------------------------------------------------------- update

/**
 * Corrects a story.
 *
 * The patch carries only the fields the form actually sent, so a partial form
 * cannot blank a description by omission. An empty string from a field that IS
 * on the form is a deliberate clearing — hence `has()` on the field rather than
 * a truthiness test.
 *
 * `is_published` is NOT here. It has an action of its own, so that saving a
 * spelling correction from a stale tab cannot quietly put a withdrawn story —
 * and its photographs — back on the open web.
 *
 * Both slugs go into the audit line and both are revalidated, because changing
 * a slug moves a public page: the old address has to stop answering.
 */
export async function updateStoryAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const storyId = text(formData, 'storyId');
  if (!isDbConfigured()) back(lang, 'unavailable');
  if (!storyId) back(lang, 'not-found');

  const actor = await requireCapability(STORIES);

  const before = await storyById(storyId);
  if (!before) back(lang, 'not-found');

  const has = (name: string) => formData.get(name) !== null;
  const patch: StoryPatch = {};
  if (has('slug')) patch.slug = text(formData, 'slug');
  if (has('titleAr')) patch.titleAr = text(formData, 'titleAr');
  if (has('titleEn')) patch.titleEn = text(formData, 'titleEn');
  if (has('locationAr')) patch.locationAr = text(formData, 'locationAr') || null;
  if (has('locationEn')) patch.locationEn = text(formData, 'locationEn') || null;
  if (has('happenedOn')) patch.happenedOn = text(formData, 'happenedOn') || null;
  if (has('happenedPrec')) patch.happenedPrec = precision(formData, 'happenedPrec');
  if (has('projectId')) patch.projectId = text(formData, 'projectId') || null;
  if (has('activityId')) patch.activityId = text(formData, 'activityId') || null;
  if (has('descriptionAr')) patch.descriptionAr = text(formData, 'descriptionAr');
  if (has('descriptionEn')) patch.descriptionEn = text(formData, 'descriptionEn');
  if (has('impactAr')) patch.impactAr = text(formData, 'impactAr');
  if (has('impactEn')) patch.impactEn = text(formData, 'impactEn');
  if (has('sortOrder')) patch.sortOrder = order(formData, 'sortOrder');

  const result = await updateStory(storyId, patch, actor.id);
  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: 'story.updated',
    targetType: 'story',
    targetId: storyId,
    previousValue: {
      slug: before.story.slug,
      titleAr: before.story.titleAr,
      projectId: before.story.projectId,
      activityId: before.story.activityId,
      happenedOn: before.story.happenedOn,
    },
    newValue: {
      slug: patch.slug ?? before.story.slug,
      titleAr: patch.titleAr ?? before.story.titleAr,
      projectId: patch.projectId === undefined ? before.story.projectId : patch.projectId,
      activityId: patch.activityId === undefined ? before.story.activityId : patch.activityId,
      happenedOn: patch.happenedOn === undefined ? before.story.happenedOn : patch.happenedOn,
    },
  });

  refresh(lang, before.story.slug);
  if (patch.slug && patch.slug !== before.story.slug) refresh(lang, patch.slug);
  back(lang);
}

// ------------------------------------------------------ on the page, or not

/**
 * Puts a story on the public page, or takes it off.
 *
 * ONE COLUMN, AND IT REMOVES NOTHING. The row stays, its photographs stay, and
 * the activity it names is untouched. Migration 060 keeps this apart from
 * archiving for that reason: the afternoon happened, and taking the write-up
 * off the page is not a claim that it did not.
 *
 * It is NOT how a photograph comes down either. Somebody who has asked for
 * their picture to be removed wants it gone, not hidden behind a flag somebody
 * can flip back — that is removeStoryPhotoAction, which really deletes.
 */
export async function setStoryPublishedAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const storyId = text(formData, 'storyId');
  if (!isDbConfigured()) back(lang, 'unavailable');
  if (!storyId) back(lang, 'not-found');

  const actor = await requireCapability(STORIES);

  const before = await storyById(storyId);
  if (!before) back(lang, 'not-found');

  const published = flag(formData, 'published');
  const result = await setPublished(storyId, published, actor.id);
  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: published ? 'story.published' : 'story.unpublished',
    targetType: 'story',
    targetId: storyId,
    previousValue: { slug: before.story.slug, isPublished: before.story.isPublished },
    newValue: { slug: before.story.slug, isPublished: published },
  });

  refresh(lang, before.story.slug);
  back(lang);
}

// ------------------------------------------------------------------- archive

/**
 * Takes a story off the list without taking it out of the record.
 *
 * A reason is required and is stored on the ROW as well as on the audit line,
 * the same rule migration 050 established for a volunteer role and for the same
 * reason: "why did this disappear?" is asked while looking at the list, and an
 * answer living only in a table few people can read is not an answer.
 */
export async function archiveStoryAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const storyId = text(formData, 'storyId');
  if (!isDbConfigured()) back(lang, 'unavailable');
  if (!storyId) back(lang, 'not-found');

  const actor = await requireCapability(STORIES);

  const before = await storyById(storyId);
  if (!before) back(lang, 'not-found');

  const reason = text(formData, 'reason');
  const result = await archiveStory(storyId, actor.id, reason);
  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: 'story.archived',
    targetType: 'story',
    targetId: storyId,
    previousValue: { slug: before.story.slug, titleAr: before.story.titleAr },
    newValue: { archived: true },
    reason,
  });

  refresh(lang, before.story.slug);
  back(lang);
}

// ------------------------------------------------------------- the pictures

/**
 * How many bytes this action will read off a request before giving up.
 *
 * A little over the column's own cap, so that a file just above the limit is
 * read, measured and refused with the sentence that names the limit — rather
 * than truncated into something that fails the magic-number check and comes
 * back as "that is not an image", which would send a coordinator looking for
 * the wrong problem.
 */
const READ_CEILING = MAX_STORY_PHOTO_BYTES + 64 * 1024;

/**
 * Adds a photograph to a story.
 *
 * ── `faces` IS READ FIRST AND REFUSED IF IT IS NOT ONE OF THE THREE ────────
 *
 * Before the file is touched. There is no default and no fallback to a
 * permissive value: a form that did not send the answer is refused outright
 * with 'no-faces'. isFacesAnswer, not a cast — a value invented by a hand-built
 * POST must not reach the column, and while chk_sp_faces would refuse it as
 * well, that arrives as a 500 rather than as a sentence.
 *
 * ── THE FILE IS TAKEN AS BYTES AND MEASURED, NEVER TRUSTED ─────────────────
 *
 * `file.type` is whatever the browser said; lib/stories.ts checks it against
 * the three permitted types AND checks the leading bytes, which is the same
 * magic-number test lib/actions/profile.ts applies to a profile photograph. The
 * size is measured from the buffer rather than read from `file.size`, because
 * the number a client reports and the number of bytes that arrived are two
 * different facts.
 *
 * A plain `<input type="file">` in a plain `<form action={…}>` — no client
 * component, no JavaScript, no base64 round trip.
 */
export async function addStoryPhotoAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const storyId = text(formData, 'storyId');
  if (!isDbConfigured()) back(lang, 'unavailable');
  if (!storyId) back(lang, 'not-found');

  const actor = await requireCapability(STORIES);

  const faces = text(formData, 'faces');
  if (!isFacesAnswer(faces)) back(lang, 'no-faces');

  const file = formData.get('image');
  if (!(file instanceof File) || file.size === 0) back(lang, 'no-image');
  if (file.size > READ_CEILING) back(lang, 'image-too-large');

  const bytes = Buffer.from(await file.arrayBuffer());

  const story = await storyById(storyId);
  if (!story) back(lang, 'not-found');

  const result = await addPhoto(
    {
      storyId,
      contentType: file.type,
      bytes,
      altAr: text(formData, 'altAr'),
      altEn: text(formData, 'altEn'),
      faces,
      sortOrder: order(formData, 'sortOrder'),
    },
    actor.id,
  );
  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: 'story.photo_added',
    targetType: 'story_photo',
    targetId: result.id,
    /* The affirmation, recorded against the person who made it. The bytes are
     * not in the audit line and never will be — an audit table is not a second
     * copy of a photograph somebody may later ask to have deleted. */
    newValue: {
      storyId,
      faces,
      byteSize: bytes.byteLength,
      contentType: file.type,
      altAr: text(formData, 'altAr'),
    },
  });

  refresh(lang, story.story.slug);
  back(lang);
}

/**
 * Corrects what was said about who is in a photograph.
 *
 * Its own action rather than a field on the edit form, for the reason
 * setPublished has one: this is the safeguarding answer, and changing it must
 * be something somebody did on purpose rather than a side effect of fixing a
 * caption. Moving a picture to 'restricted' takes it off the public page and
 * off its own direct URL on the next request — nothing is precomputed and no
 * cached response outlives it by more than the route's five minutes.
 *
 * Both answers go into the audit line. "Who said this picture was fine, and
 * when?" has to be answerable.
 */
export async function setStoryPhotoFacesAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const photoId = text(formData, 'photoId');
  if (!isDbConfigured()) back(lang, 'unavailable');
  if (!photoId) back(lang, 'not-found');

  const actor = await requireCapability(STORIES);

  const faces = text(formData, 'faces');
  if (!isFacesAnswer(faces)) back(lang, 'no-faces');

  const before = await photoById(photoId);
  if (!before) back(lang, 'not-found');

  const result = await setPhotoFaces(photoId, faces);
  if (!result.ok) back(lang, result.reason);

  const story = await storyById(before.storyId);

  await audit({
    actorId: actor.id,
    action: 'story.photo_faces_changed',
    targetType: 'story_photo',
    targetId: photoId,
    previousValue: { storyId: before.storyId, faces: before.faces },
    newValue: { storyId: before.storyId, faces },
  });

  refresh(lang, story?.story.slug ?? null);
  back(lang);
}

/** Moves a picture within its story. The card shows whichever comes first. */
export async function setStoryPhotoOrderAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const photoId = text(formData, 'photoId');
  if (!isDbConfigured()) back(lang, 'unavailable');
  if (!photoId) back(lang, 'not-found');

  await requireCapability(STORIES);

  const before = await photoById(photoId);
  if (!before) back(lang, 'not-found');

  const result = await setPhotoOrder(photoId, order(formData, 'sortOrder'));
  if (!result.ok) back(lang, result.reason);

  const story = await storyById(before.storyId);
  refresh(lang, story?.story.slug ?? null);
  back(lang);
}

/**
 * Removes a photograph. A REAL DELETE, and the only one in this feature.
 *
 * Migration 060 argues it in full: every other guard in this schema protects a
 * record OF something somebody did, and a photograph is the opposite object —
 * not a record of anybody's work but their face on the open web. «انزعوا تلك
 * الصورة», from the volunteer in it or from a parent, is the one request this
 * association must be able to honour at once and without a psql prompt.
 *
 * The audit line keeps the caption, the answer about who was in it and who
 * uploaded it — the part that matters and the part that is nobody's face. The
 * bytes are gone.
 */
export async function removeStoryPhotoAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const photoId = text(formData, 'photoId');
  if (!isDbConfigured()) back(lang, 'unavailable');
  if (!photoId) back(lang, 'not-found');

  const actor = await requireCapability(STORIES);

  const before = await photoById(photoId);
  if (!before) back(lang, 'not-found');

  const story = await storyById(before.storyId);

  const result = await removePhoto(photoId);
  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: 'story.photo_removed',
    targetType: 'story_photo',
    targetId: photoId,
    previousValue: {
      storyId: before.storyId,
      faces: before.faces,
      altAr: before.altAr,
      byteSize: before.byteSize,
      uploadedOn: before.uploadedOn,
    },
    newValue: { removed: true },
    reason: text(formData, 'reason') || undefined,
  });

  refresh(lang, story?.story.slug ?? null);
  back(lang);
}
