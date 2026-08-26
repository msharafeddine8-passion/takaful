'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isDbConfigured } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability, type Capability } from '@/lib/authz';
import { isLocale, locales, type Locale } from '@/lib/i18n';
import {
  archivePartner,
  createPartner,
  linkPartner,
  partnerById,
  setPublished,
  unlinkPartner,
  updatePartner,
  type PartnerPatch,
} from '@/lib/partners';
import { isPrecision, type DatePrecision } from '@/lib/volunteer-role-view';
import type { PartnerStrings } from '@/lib/dictionaries/partners';

/**
 * An administrator recording who the association works with, and saying so on a
 * page the public reads.
 *
 * ── THE PERMISSION CHECK IS HERE, AND NOWHERE IN A COMPONENT ───────────────
 *
 * A check in JSX hides a button and leaves the POST working. On this feature
 * that would mean anybody with a session publishing an organisation's name onto
 * the association's public page — a claim about that organisation as much as
 * about the association — with a link to a site of their choosing. Every
 * function below asserts a capability against the SESSION before it reads a
 * single field, and requireCapability throws rather than returning a boolean a
 * caller can forget to look at.
 *
 * EVERY FIELD ARRIVING IN FormData IS A CLAIM. The partner id, the project id,
 * the slug, the URL, the date, the precision: each is parsed and checked, and
 * the two ids are looked up against the database rather than trusted. The only
 * thing taken from the session rather than from the form is who the actor is —
 * which is the one thing a form may never say, because a form that could name
 * its own author could name somebody else.
 *
 * ── WHICH CAPABILITY, AND WHY IT IS NOT members.manage ─────────────────────
 *
 * `challenges.manage` — project_coordinator, program_admin and super_admin. Not
 * `members.manage`, and the difference is worth stating so nobody "corrects" it
 * later.
 *
 * lib/actions/org-groups.ts puts committees behind `members.manage`, and its
 * reasoning is exactly what rules it out here. A committee is gated with
 * people's records BECAUSE IT IS HALF OF ONE: membership of a group is a
 * `volunteer_roles` row, so renaming لجنة الإعلام rewrites a line on eleven
 * volunteers' records and archiving it hides the leadership history those lines
 * make up. A partner has none of that shape. Migration 057 is explicit about it:
 * a partnership is between two ORGANISATIONS, which is why it got a join table
 * instead of the volunteer_roles trick — reusing roles for it would have meant
 * an organisation with a row in a table of people. Nothing in this file writes,
 * reads or invalidates a single volunteer's record, and no query behind these
 * screens names a person at all.
 *
 * What a partner IS, is public content about the association: a statement, on
 * the open web, that these are the organisations we work with. The nearest
 * precedent in this codebase is lib/actions/admin-profile.ts, which put profile
 * FIELD DEFINITIONS behind `challenges.manage` on the argument that a definition
 * is "on nobody's file in particular and on everybody's profile in general". A
 * partner is the same kind of object one step further out: on nobody's file at
 * all, and on the association's public page.
 *
 * The role list settles it in the other direction too. `project_coordinator` is
 * the person who actually brings a partner to a project and knows what they
 * gave — «دعم دورة صيف ٢٠٢٤» is their sentence to write. members.manage excludes
 * them, so gating this there would put the linking form in front of the two
 * people least likely to know the answer, and produce exactly the failure
 * authz.ts's isStaff() comment warns about in reverse: a coordinator who can
 * schedule the activity a partner funds and cannot record the partner.
 *
 * No change to isStaff() was needed. Every role holding challenges.manage
 * already holds applications.review, so all three can reach /staff today; a new
 * capability in that list would have widened the staff area for nobody.
 *
 * ── HOW A REFUSAL REACHES THE SCREEN WITHOUT ANY JAVASCRIPT ────────────────
 *
 * These actions return `void` and are used as plain `<form action={…}>` on
 * server components, so there is no useActionState to carry an error back. A
 * refusal therefore redirects to the same page with `?error=…`, and the page
 * renders the sentence from the dictionary. That matters most for 'bad-url' and
 * 'slug-taken', which are the two refusals an administrator can hit by working
 * normally and the ones that would otherwise look like a button that does
 * nothing.
 *
 * `back()` types its argument as a key of the dictionary's own `errors`, so a
 * refusal the strings do not answer to fails to compile rather than reaching a
 * URL as an unreadable code.
 */

/** Named once so the reasoning above has something to point at. */
const PARTNERS: Capability = 'challenges.manage';

/** Exactly the refusals the dictionary has a sentence for. */
type ScreenError = keyof PartnerStrings['errors'];

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
 * `?error=bad-url` would succeed and leave the refusal on screen.
 */
function back(lang: Locale, error?: ScreenError): never {
  const path = `/${lang}/staff/partners`;
  redirect(error ? `${path}?error=${error}` : path);
}

/**
 * The staff list, and the public page IN BOTH LANGUAGES.
 *
 * Publishing a partner from the Arabic screen changes the English page too —
 * they are one row read twice — so revalidating only the locale the form was
 * submitted from would leave the other language showing yesterday's list until
 * something else happened to touch it.
 */
function refresh(lang: Locale): void {
  revalidatePath(`/${lang}/staff/partners`);
  for (const locale of locales) revalidatePath(`/${locale}/partners`);
}

// -------------------------------------------------------------------- create

/**
 * Records a partner.
 *
 * The kind is not checked against anything. There is no list of permitted kinds
 * in this file, in lib/partners.ts, in the dictionary, on the public page or in
 * the schema — see the head of migration 057. Whatever the administrator types
 * is what the association calls this organisation, and it is the same word that
 * becomes a heading on the public page.
 */
export async function createPartnerAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) back(lang, 'unavailable');

  const actor = await requireCapability(PARTNERS);

  const result = await createPartner(
    {
      slug: text(formData, 'slug'),
      nameAr: text(formData, 'nameAr'),
      nameEn: text(formData, 'nameEn'),
      kind: text(formData, 'kind') || null,
      summaryAr: text(formData, 'summaryAr'),
      summaryEn: text(formData, 'summaryEn'),
      websiteUrl: text(formData, 'websiteUrl') || null,
      sinceOn: text(formData, 'sinceOn') || null,
      sincePrec: precision(formData, 'sincePrec'),
      isPublished: flag(formData, 'isPublished'),
      sortOrder: order(formData, 'sortOrder'),
    },
    actor.id,
  );

  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: 'partner.created',
    /* The organisation, not a person. Nothing in this feature targets a user,
     * because nothing in it is about one — see the head of this file. */
    targetType: 'partner',
    targetId: result.id,
    newValue: {
      slug: text(formData, 'slug'),
      nameAr: text(formData, 'nameAr'),
      kind: text(formData, 'kind') || null,
      websiteUrl: text(formData, 'websiteUrl') || null,
      isPublished: flag(formData, 'isPublished'),
    },
  });

  refresh(lang);
  back(lang);
}

// -------------------------------------------------------------------- update

/**
 * Corrects a partner.
 *
 * The patch carries only the fields the form actually sent, so a partial form
 * cannot blank a summary by omission. An empty string from a field that IS on
 * the form is a deliberate clearing — hence `has()` on the field rather than a
 * truthiness test.
 *
 * `is_published` is NOT here. It has an action of its own, so that saving a
 * spelling correction from a stale tab cannot quietly put a withdrawn partner
 * back on the public page.
 *
 * The previous values go into the audit line beside the new ones. Changing what
 * an organisation is called, or where its link points, changes a public
 * statement about somebody else, and "what did it say before?" has to be
 * answerable.
 */
export async function updatePartnerAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const partnerId = text(formData, 'partnerId');
  if (!isDbConfigured()) back(lang, 'unavailable');
  if (!partnerId) back(lang, 'not-found');

  const actor = await requireCapability(PARTNERS);

  const before = await partnerById(partnerId);
  if (!before) back(lang, 'not-found');

  const has = (name: string) => formData.get(name) !== null;
  const patch: PartnerPatch = {};
  if (has('slug')) patch.slug = text(formData, 'slug');
  if (has('nameAr')) patch.nameAr = text(formData, 'nameAr');
  if (has('nameEn')) patch.nameEn = text(formData, 'nameEn');
  if (has('kind')) patch.kind = text(formData, 'kind') || null;
  if (has('summaryAr')) patch.summaryAr = text(formData, 'summaryAr');
  if (has('summaryEn')) patch.summaryEn = text(formData, 'summaryEn');
  if (has('websiteUrl')) patch.websiteUrl = text(formData, 'websiteUrl') || null;
  if (has('sinceOn')) patch.sinceOn = text(formData, 'sinceOn') || null;
  if (has('sincePrec')) patch.sincePrec = precision(formData, 'sincePrec');
  if (has('sortOrder')) patch.sortOrder = order(formData, 'sortOrder');

  const result = await updatePartner(partnerId, patch, actor.id);
  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: 'partner.updated',
    targetType: 'partner',
    targetId: partnerId,
    previousValue: {
      slug: before.slug,
      nameAr: before.nameAr,
      nameEn: before.nameEn,
      kind: before.kind,
      websiteUrl: before.websiteUrl,
      sinceOn: before.sinceOn,
    },
    newValue: {
      slug: patch.slug ?? before.slug,
      nameAr: patch.nameAr ?? before.nameAr,
      nameEn: patch.nameEn ?? before.nameEn,
      kind: patch.kind === undefined ? before.kind : patch.kind,
      websiteUrl: patch.websiteUrl === undefined ? before.websiteUrl : patch.websiteUrl,
      sinceOn: patch.sinceOn === undefined ? before.sinceOn : patch.sinceOn,
    },
  });

  refresh(lang);
  back(lang);
}

// ------------------------------------------------------ on the page, or not

/**
 * Puts a partner on the public page, or takes it off.
 *
 * ONE COLUMN, AND IT REMOVES NOTHING. The row stays with its date, the projects
 * it backs stay linked to it, and the staff list goes on showing it. Migration
 * 057 keeps this apart from archiving for exactly that reason: a partnership
 * that has run its course really happened, and taking it off the page is not a
 * claim that it did not.
 */
export async function setPartnerPublishedAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const partnerId = text(formData, 'partnerId');
  if (!isDbConfigured()) back(lang, 'unavailable');
  if (!partnerId) back(lang, 'not-found');

  const actor = await requireCapability(PARTNERS);

  const before = await partnerById(partnerId);
  if (!before) back(lang, 'not-found');

  const published = flag(formData, 'published');
  const result = await setPublished(partnerId, published, actor.id);
  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: published ? 'partner.published' : 'partner.unpublished',
    targetType: 'partner',
    targetId: partnerId,
    previousValue: { nameAr: before.nameAr, isPublished: before.isPublished },
    newValue: { nameAr: before.nameAr, isPublished: published },
  });

  refresh(lang);
  back(lang);
}

// ------------------------------------------------------------------- archive

/**
 * Takes a partner off the list without taking it out of the record.
 *
 * A reason is required and is stored on the ROW as well as on the audit line,
 * the same rule migration 050 established for a volunteer role and for the same
 * reason: "why did this disappear?" is asked while looking at the list, and an
 * answer living only in a table few people can read is not an answer.
 *
 * The project links are left exactly as they are. The database refuses a DELETE
 * on this table outright (trg_partners_no_delete), so nothing here is ever the
 * last copy of anything.
 */
export async function archivePartnerAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const partnerId = text(formData, 'partnerId');
  if (!isDbConfigured()) back(lang, 'unavailable');
  if (!partnerId) back(lang, 'not-found');

  const actor = await requireCapability(PARTNERS);

  const before = await partnerById(partnerId);
  if (!before) back(lang, 'not-found');

  const reason = text(formData, 'reason');
  const result = await archivePartner(partnerId, actor.id, reason);
  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: 'partner.archived',
    targetType: 'partner',
    targetId: partnerId,
    previousValue: { slug: before.slug, nameAr: before.nameAr, kind: before.kind },
    newValue: { archived: true },
    reason,
  });

  refresh(lang);
  back(lang);
}

// --------------------------------------------------- which project it backs

/**
 * Records that this partner backs this project.
 *
 * BOTH IDS ARE VERIFIED AGAINST THE DATABASE, inside linkPartner(). The foreign
 * keys would catch a bad one, but as a constraint violation rather than as a
 * sentence — and a stale tab holding a project that has since been archived is
 * an ordinary thing rather than an attack.
 *
 * The audit line names the PARTNER as its target and carries the project in the
 * value. A partnership has two ends and audit_logs has one target column; the
 * partner is the row this screen is about, and the project is the fact recorded
 * against it.
 */
export async function linkPartnerAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const partnerId = text(formData, 'partnerId');
  const projectId = text(formData, 'projectId');
  if (!isDbConfigured()) back(lang, 'unavailable');
  if (!partnerId) back(lang, 'not-found');
  if (!projectId) back(lang, 'no-project');

  const actor = await requireCapability(PARTNERS);

  const partner = await partnerById(partnerId);
  if (!partner || partner.archivedOn !== null) back(lang, 'not-found');

  const result = await linkPartner(
    projectId,
    partnerId,
    { ar: text(formData, 'noteAr') || null, en: text(formData, 'noteEn') || null },
    actor.id,
  );
  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: 'partner.linked',
    targetType: 'partner',
    targetId: partnerId,
    newValue: {
      projectId,
      partnerNameAr: partner.nameAr,
      noteAr: text(formData, 'noteAr') || null,
      noteEn: text(formData, 'noteEn') || null,
    },
  });

  refresh(lang);
  back(lang);
}

/**
 * Removes the link, and only the link.
 *
 * The one real DELETE in this feature, and migration 057 argues for it at
 * length: the row is a connection between two rows that both survive it, so
 * unlinking a partner from a project it never actually backed is a correction
 * rather than an erasure. It is still audited, with the note it removed carried
 * into the previous value — otherwise "supported the 2024 summer round" would be
 * gone with nothing anywhere saying it had ever been written.
 */
export async function unlinkPartnerAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const partnerId = text(formData, 'partnerId');
  const projectId = text(formData, 'projectId');
  if (!isDbConfigured()) back(lang, 'unavailable');
  if (!partnerId) back(lang, 'not-found');
  if (!projectId) back(lang, 'no-project');

  const actor = await requireCapability(PARTNERS);

  const result = await unlinkPartner(projectId, partnerId);
  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: 'partner.unlinked',
    targetType: 'partner',
    targetId: partnerId,
    previousValue: {
      projectId,
      noteAr: text(formData, 'noteAr') || null,
      noteEn: text(formData, 'noteEn') || null,
    },
    newValue: { linked: false },
  });

  refresh(lang);
  back(lang);
}
