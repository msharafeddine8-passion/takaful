'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isDbConfigured } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability, type Capability } from '@/lib/authz';
import { isLocale, locales, type Locale } from '@/lib/i18n';
import {
  createNumber,
  numberById,
  setPublished,
  updateNumber,
  type ImpactPatch,
} from '@/lib/impact-numbers';
import type { ImpactAdminStrings } from '@/lib/dictionaries/impact-admin';

/**
 * An administrator editing what the association says about itself on its own
 * front page.
 *
 * ── THE PERMISSION CHECK IS HERE, AND NOWHERE IN A COMPONENT ───────────────
 *
 * A check in JSX hides a button and leaves the POST working. On this feature
 * that would mean anybody with a session rewriting «٤٬٠٠٠+ عائلة تلقّت دعماً»
 * on the association's front page — a sentence read by donors, partners and the
 * ministry — or taking the section down to one figure. Every function below
 * asserts a capability against the SESSION before it reads a single field, and
 * requireCapability throws rather than returning a boolean a caller can forget
 * to look at.
 *
 * EVERY FIELD ARRIVING IN FormData IS A CLAIM. The row id, the key, the label,
 * the value, the order: each is parsed and checked, and the id is looked up
 * against the database rather than trusted. The only thing taken from the
 * session rather than from the form is who the actor is — which is the one thing
 * a form may never say, because a form that could name its own author could name
 * somebody else. `impact_numbers.updated_by` exists precisely to hold that name.
 *
 * ── WHICH CAPABILITY, AND WHY IT IS members.manage ─────────────────────────
 *
 * `members.manage` — program_admin and super_admin.
 *
 * The act being gated is "restating, in public, what this association is". The
 * two existing screens that do the nearest thing — /staff/projects, which
 * decides which projects appear on the public projects page, and /staff/groups,
 * which decides how the association describes its own structure — both assert
 * `members.manage`. The front page is the most public of the three surfaces, so
 * it cannot reasonably be gated more loosely than either.
 *
 * The two real alternatives are worth naming so that nobody "corrects" this
 * later:
 *
 *   `challenges.manage` is the tempting one, and lib/actions/admin-profile.ts
 *   sets the precedent: it put profile FIELD DEFINITIONS there on the argument
 *   that a definition is "on nobody's file in particular and on everybody's
 *   profile in general", and an impact number has exactly that shape — it names
 *   nobody and no role points at it. It is still wrong here, for two reasons.
 *   The act differs: a challenge is an announcement INWARD, asking volunteers
 *   for something, and it is undone by announcing something else next month; a
 *   figure is a statement OUTWARD that a stranger may quote back years later.
 *   And the set differs: `challenges.manage` includes project_coordinator, so
 *   choosing it would WIDEN who may restate the association's public claims —
 *   a change to who holds real authority, made as a side effect of picking a
 *   name. Widening is a decision the association takes, not a decision a file
 *   like this one takes on its behalf.
 *
 *   `programme.publish` fails for the reason lib/actions/projects.ts already
 *   gives at length: it names the identical two roles, so the split would change
 *   nothing while implying to the next reader that somebody is gated
 *   differently — and it is about a different noun altogether, guarding the
 *   moment a volunteer may act on what a COURSE says.
 *
 * ── EVERY WRITE IS AUDITED WITH BOTH SIDES ─────────────────────────────────
 *
 * A public claim changing has to be answerable, so each action below reads the
 * row first and puts the before and the after on the same audit line. "It used
 * to say 300+" is the question this table will actually be asked, and
 * `updated_by` alone answers only who, never what.
 *
 * ── HOW A REFUSAL REACHES THE SCREEN WITHOUT ANY JAVASCRIPT ────────────────
 *
 * These actions return `void` and are used as plain `<form action={…}>` on
 * server components, so there is no useActionState to carry an error back. A
 * refusal therefore redirects to the same page with `?error=…`, and the page
 * renders the sentence from the dictionary. That matters most for 'key-taken'
 * and 'bad-key', which are the refusals an administrator can hit by working
 * normally and which would otherwise look like a button that does nothing.
 *
 * `back()` types its argument as a key of the dictionary's own `errors`, so a
 * refusal the strings do not answer to fails to compile rather than reaching a
 * URL as an unreadable code.
 */

/** Named once so the reasoning above has something to point at. */
const IMPACT: Capability = 'members.manage';

/** Exactly the refusals the dictionary has a sentence for. */
type ScreenError = keyof ImpactAdminStrings['errors'];

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

/**
 * A display order, or undefined.
 *
 * Undefined rather than 0 for a blank box, so that clearing the field by
 * accident does not silently move a figure to the front of the row. A value
 * that is not a number at all is treated the same way: absent.
 */
const orderOf = (formData: FormData, name: string): number | undefined => {
  const raw = text(formData, name);
  if (raw === '') return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.trunc(value) : undefined;
};

/**
 * Back where the form was, with a sentence if something was refused.
 *
 * redirect() signals by throwing, so every call sits outside a try block and
 * after the audit line. A successful write redirects to the CLEAN path on
 * purpose: without it, a form submitted from a page still carrying
 * `?error=key-taken` would succeed and leave the refusal on screen.
 */
function back(lang: Locale, error?: ScreenError): never {
  const path = `/${lang}/staff/impact`;
  redirect(error ? `${path}?error=${error}` : path);
}

/**
 * The staff screen, AND THE FRONT PAGE IN BOTH LANGUAGES.
 *
 * / [lang] reads this table now, and it reads it in Arabic and in English from
 * the same rows: correcting the Arabic label changes the English page too,
 * because `label_en` falls back to it. Revalidating only the language the
 * administrator happened to be working in would leave the other one stating
 * yesterday's figure — which, on a page of claims about the association, reads
 * as the site contradicting itself.
 */
function refresh(lang: Locale): void {
  revalidatePath(`/${lang}/staff/impact`);
  for (const locale of locales) revalidatePath(`/${locale}`);
}

// -------------------------------------------------------------------- create

/**
 * Adds a figure.
 *
 * It is created hidden unless the form says otherwise, which is safer in one
 * direction only: a figure that should be on the front page and is not is a page
 * somebody fixes in a minute, and a half-typed figure that appeared on the front
 * page is a claim the public has already read.
 *
 * NOTHING HERE CHECKS THE VALUE AGAINST WHAT THE PLATFORM CAN COUNT. No warning,
 * no confirmation, no refusal for disagreeing with evidenceFor(). The figure is
 * the association's claim and the count is a floor under it — see the head of
 * lib/impact-numbers.ts — and a form that argued with the number would be this
 * software telling an association it is wrong about its own history.
 */
export async function createImpactNumberAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) back(lang, 'unavailable');

  const actor = await requireCapability(IMPACT);

  const result = await createNumber(
    {
      key: text(formData, 'key'),
      labelAr: text(formData, 'labelAr'),
      labelEn: text(formData, 'labelEn'),
      valueText: text(formData, 'valueText'),
      sourceNote: text(formData, 'sourceNote') || null,
      sortOrder: orderOf(formData, 'sortOrder'),
      isPublished: flag(formData, 'isPublished'),
    },
    actor.id,
  );

  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: 'impact-number.created',
    /* The figure, not a person: this row is a statement about the association
     * and names nobody. */
    targetType: 'impact_number',
    targetId: result.id,
    newValue: {
      key: text(formData, 'key').toLowerCase(),
      labelAr: text(formData, 'labelAr'),
      labelEn: text(formData, 'labelEn'),
      valueText: text(formData, 'valueText'),
      sourceNote: text(formData, 'sourceNote') || null,
      isPublished: flag(formData, 'isPublished'),
    },
  });

  refresh(lang);
  back(lang);
}

// -------------------------------------------------------------------- update

/**
 * Corrects a figure.
 *
 * The patch carries only the fields the form actually sent, so a partial form
 * cannot blank a source note by omission. An empty string from a field that IS
 * on the form is a deliberate clearing — hence `has()` on the field rather than
 * a truthiness test.
 *
 * `key` is not read from this form at all and `is_published` has an action of
 * its own, so saving a spelling correction from a stale tab can neither detach
 * the row from its evidence line nor put a withdrawn claim back on the front
 * page. lib/impact-numbers.ts argues both at the head of ImpactPatch.
 *
 * THE PREVIOUS VALUE GOES ON THE AUDIT LINE BESIDE THE NEW ONE. This is the one
 * table in the codebase whose rows are quoted by strangers, and "it used to say
 * 300+" has to be answerable from the log alone.
 */
export async function updateImpactNumberAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const numberId = text(formData, 'numberId');
  if (!isDbConfigured()) back(lang, 'unavailable');
  if (!numberId) back(lang, 'not-found');

  const actor = await requireCapability(IMPACT);

  const before = await numberById(numberId);
  if (!before) back(lang, 'not-found');

  const has = (name: string) => formData.get(name) !== null;
  const patch: ImpactPatch = {};
  if (has('labelAr')) patch.labelAr = text(formData, 'labelAr');
  if (has('labelEn')) patch.labelEn = text(formData, 'labelEn');
  if (has('valueText')) patch.valueText = text(formData, 'valueText');
  if (has('sourceNote')) patch.sourceNote = text(formData, 'sourceNote') || null;
  if (has('sortOrder')) {
    const order = orderOf(formData, 'sortOrder');
    if (order !== undefined) patch.sortOrder = order;
  }

  const result = await updateNumber(numberId, patch, actor.id);
  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: 'impact-number.updated',
    targetType: 'impact_number',
    targetId: numberId,
    /* The key travels on both sides even though it cannot change, so the line
     * reads as a sentence — "active_volunteers went from 300+ to 350+" —
     * without a second query against a row that may have moved on since. */
    previousValue: {
      key: before.key,
      labelAr: before.labelAr,
      labelEn: before.labelEn,
      valueText: before.valueText,
      sourceNote: before.sourceNote,
      sortOrder: before.sortOrder,
    },
    newValue: {
      key: before.key,
      labelAr: patch.labelAr ?? before.labelAr,
      labelEn: patch.labelEn ?? before.labelEn,
      valueText: patch.valueText ?? before.valueText,
      sourceNote: patch.sourceNote === undefined ? before.sourceNote : patch.sourceNote,
      sortOrder: patch.sortOrder ?? before.sortOrder,
    },
  });

  refresh(lang);
  back(lang);
}

// ------------------------------------------------- on the front page, or not

/**
 * Puts a figure on the association's front page, or takes it off.
 *
 * ONE COLUMN, AND IT REMOVES NOTHING. The row, its wording, its source note and
 * the name of whoever last touched it are all untouched, which is what makes the
 * decision reversible — and a figure the association has stopped claiming is
 * still part of the record of what it once claimed.
 */
export async function setImpactNumberPublishedAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const numberId = text(formData, 'numberId');
  if (!isDbConfigured()) back(lang, 'unavailable');
  if (!numberId) back(lang, 'not-found');

  const actor = await requireCapability(IMPACT);

  const before = await numberById(numberId);
  if (!before) back(lang, 'not-found');

  const published = flag(formData, 'published');
  const result = await setPublished(numberId, published, actor.id);
  if (!result.ok) back(lang, result.reason);

  await audit({
    actorId: actor.id,
    action: published ? 'impact-number.published' : 'impact-number.unpublished',
    targetType: 'impact_number',
    targetId: numberId,
    /* The value is on both sides as well as the flag: what came off the front
     * page matters as much as that something did. */
    previousValue: {
      key: before.key,
      valueText: before.valueText,
      isPublished: before.isPublished,
    },
    newValue: { key: before.key, valueText: before.valueText, isPublished: published },
  });

  refresh(lang);
  back(lang);
}
