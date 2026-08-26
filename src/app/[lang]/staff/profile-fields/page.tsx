import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured, query } from '@/lib/db';
import { countPhrase } from '@/lib/when';
import { fieldDefs } from '@/lib/profile-fields';
import type { FieldDef } from '@/lib/profile-field-kinds';
import { archiveFieldDefAction, updateFieldDefAction } from '@/lib/actions/admin-profile';
import { adminProfile, type AdminProfileStrings } from '@/lib/dictionaries/admin-profile';
import { ProfileFieldForm, type FieldFormValues } from '@/components/staff/ProfileFieldForm';

/**
 * The columns nobody has to ship a migration for: declaring them, correcting
 * them, ordering them and retiring them.
 *
 * ── WHY challenges.manage AND NOT members.manage ───────────────────────────
 *
 * The capability is asserted in the actions, not here, and the head of
 * lib/actions/admin-profile.ts argues the choice at length: a definition is on
 * nobody's file in particular and on everybody's profile in general, which is
 * the same act as announcing a challenge to every volunteer. The gate on this
 * page is the same capability, so the screen a person can reach matches the
 * writes the server will accept for them. A `can()` that disagreed with the
 * action would produce a page full of controls that could only fail.
 *
 * ── WHAT IS DELIBERATELY NOT HERE ──────────────────────────────────────────
 *
 * A way to un-archive. archiveFieldDef has no opposite in lib/profile-fields.ts
 * and no action exposes one, so the drawer at the bottom is a reading room: a
 * retired field is listed with its key so an old stored answer can still be
 * traced to the question it answered. Offering a restore button that posted to
 * nothing would be worse than not offering one.
 *
 * And a delete. trg_field_defs_no_delete refuses one outright, because deleting
 * a definition would take everybody's answers with it.
 *
 * ── ORDERING ───────────────────────────────────────────────────────────────
 *
 * `sort_order` is a number on the row and the list is ordered by it, then by the
 * Arabic label. The two arrows do not swap two rows: each posts the moving row
 * ALONE, with its sort_order set to one either side of its neighbour's. One
 * UPDATE, no transaction spanning two rows, and no renumbering pass that could
 * half-apply — and because a new field is offered the next free multiple of ten,
 * the numbers stay distinct and a move lands exactly one place.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/profile-fields'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: adminProfile(lang).defs.title,
    alternates: alternatesFor(lang, '/staff/profile-fields'),
    robots: { index: false, follow: false },
  };
}

/** The order a new field is offered, so the arrows below behave predictably. */
const STEP = 10;

/* The same summary pill as VolunteerRoles and AdminNotes — these screens belong
 * to one product. `inline-flex` is what removes the disclosure triangle: a
 * summary is a list-item by default and stops being one the moment its display
 * changes, in every engine including the WebKit one that ignores
 * `list-style: none` here. */
const PILL =
  'inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line' +
  ' bg-surface-2 px-4 text-[0.88rem] font-extrabold text-ink-2 transition-colors hover:bg-surface';

/** orderOf() in the action reads at most six digits; anything else becomes 0. */
const clampOrder = (value: number): number => Math.max(-99999, Math.min(99999, value));

function toFormValues(def: FieldDef): FieldFormValues {
  return {
    id: def.id,
    key: def.key,
    labelAr: def.labelAr,
    labelEn: def.labelEn,
    helpAr: def.helpAr,
    helpEn: def.helpEn,
    kind: def.kind,
    options: def.options,
    required: def.required,
    visibility: def.visibility,
    sortOrder: def.sortOrder,
  };
}

/**
 * Every field of a definition, as hidden inputs.
 *
 * updateFieldDefAction takes a whole patch or nothing — patchOf() returns null
 * without a label, a kind and a visibility — so a form that only wants to nudge
 * `sortOrder` still has to carry the rest of the row. Written once here rather
 * than twice in the two arrow forms, because two copies is how one of them ends
 * up missing `helpEn` and quietly clears it.
 */
function DefinitionFields({ def, sortOrder }: { def: FieldDef; sortOrder: number }) {
  return (
    <>
      <input type="hidden" name="fieldId" value={def.id} />
      <input type="hidden" name="kind" value={def.kind} />
      <input type="hidden" name="labelAr" value={def.labelAr} />
      <input type="hidden" name="labelEn" value={def.labelEn} />
      <input type="hidden" name="helpAr" value={def.helpAr ?? ''} />
      <input type="hidden" name="helpEn" value={def.helpEn ?? ''} />
      {/* Always posted, and empty for the six kinds that take none — optionsOf()
          reads '[]' as no options and checkDef refuses a non-choice field that
          carries any. */}
      <input type="hidden" name="options" value={JSON.stringify(def.options)} />
      {/* flag() reads 'on' / 'true' / '1' as true and everything else as false,
          so an explicit 'off' is safer than omitting the field. */}
      <input type="hidden" name="required" value={def.required ? 'on' : 'off'} />
      <input type="hidden" name="visibility" value={def.visibility} />
      <input type="hidden" name="sortOrder" value={String(sortOrder)} />
    </>
  );
}

function MoveButton({
  lang,
  def,
  sortOrder,
  label,
  title,
}: {
  lang: Locale;
  def: FieldDef;
  sortOrder: number;
  label: string;
  title: string;
}) {
  return (
    <form action={updateFieldDefAction}>
      <input type="hidden" name="lang" value={lang} />
      <DefinitionFields def={def} sortOrder={sortOrder} />
      <button
        type="submit"
        title={title}
        aria-label={title}
        className="min-h-11 rounded-full border border-line bg-surface-2 px-4 text-[0.85rem] font-extrabold text-ink-2 transition-colors hover:bg-surface"
      >
        {label}
      </button>
    </form>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.78rem] font-bold text-ink-2 break-words">
      {children}
    </span>
  );
}

function Definition({
  lang,
  def,
  above,
  below,
  answers,
  t,
}: {
  lang: Locale;
  def: FieldDef;
  /** The row before it in the list, if any. */
  above: FieldDef | null;
  below: FieldDef | null;
  answers: number;
  t: AdminProfileStrings['defs'];
}) {
  const label = lang === 'ar' ? def.labelAr : def.labelEn.trim() || def.labelAr;

  return (
    <li className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
        <h3 className="text-[1.02rem] font-extrabold break-words">{label}</h3>
        <span className="text-[0.8rem] font-bold text-ink-3">
          {countPhrase(answers, t.answers)}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <Badge>
          {t.keyBadge}: <span dir="ltr" className="font-mono">{def.key}</span>
        </Badge>
        <Badge>
          {t.kindBadge}: {t.kinds[def.kind]}
        </Badge>
        <Badge>{def.required ? t.requiredBadge : t.optionalBadge}</Badge>
      </div>

      {/* The one property worth a line of its own rather than a pill: it decides
          who reads every answer counted above. */}
      <p className="mt-2.5 text-[0.85rem] font-bold text-ink-2">
        {t.visibilityLabel}: {t.visibility[def.visibility]}
      </p>

      {def.options.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {def.options.map((option) => (
            <li
              key={option.value}
              className="rounded-full bg-surface-2 px-2.5 py-1 text-[0.78rem] text-ink-3 break-words"
            >
              {lang === 'ar' ? option.ar : option.en.trim() || option.ar}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-2 border-t border-line pt-4">
        {/* Only offered where it could do something: the first row has nothing
            above it and the last has nothing below. */}
        {(above || below) && (
          <div className="flex flex-wrap gap-2">
            {above && (
              <MoveButton
                lang={lang}
                def={def}
                sortOrder={clampOrder(above.sortOrder - 1)}
                label={t.moveUp}
                title={t.moveUpOf.replace('{label}', label)}
              />
            )}
            {below && (
              <MoveButton
                lang={lang}
                def={def}
                sortOrder={clampOrder(below.sortOrder + 1)}
                label={t.moveDown}
                title={t.moveDownOf.replace('{label}', label)}
              />
            )}
          </div>
        )}

        <details>
          <summary className={PILL}>{t.editCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <h4 className="mb-4 text-[0.95rem] font-extrabold">{t.editHeading}</h4>
            <ProfileFieldForm
              lang={lang}
              def={toFormValues(def)}
              answers={answers}
              nextSortOrder={def.sortOrder}
              t={t}
            />
          </div>
        </details>

        <details>
          <summary className={PILL}>{t.archiveCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <h4 className="text-[0.95rem] font-extrabold">{t.archiveHeading}</h4>
            <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-2">{t.archiveNote}</p>
            <form action={archiveFieldDefAction} className="mt-4">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="fieldId" value={def.id} />
              <button
                type="submit"
                className="min-h-11 w-full rounded-full bg-danger px-6 text-[0.9rem] font-extrabold text-white transition-opacity hover:opacity-90 sm:w-auto"
              >
                {t.archiveSubmit}
              </button>
            </form>
          </div>
        </details>
      </div>
    </li>
  );
}

export default async function ProfileFieldsPage(
  props: PageProps<'/[lang]/staff/profile-fields'>,
) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = adminProfile(lang).defs;

  if (!isDbConfigured()) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.errors.dbUnavailable}
        </p>
      </Container></Section>
    );
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);
  /* The same capability the actions assert. See the head of this file. */
  if (!can(user, 'challenges.manage')) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.staff.forbidden}
        </p>
      </Container></Section>
    );
  }

  const [all, counts] = await Promise.all([
    fieldDefs({ includeArchived: true }),
    /*
     * How many answers each definition already holds. This is the number the
     * visibility warning is built on — "moving this field to public publishes
     * these answers" is a sentence about people, and without the count it is a
     * sentence about a setting. Grouped in SQL over idx_pfv_field rather than
     * counted per row in a loop.
     */
    query<{ field_id: string; answers: string }>(
      'SELECT field_id, count(*) AS answers FROM profile_field_values GROUP BY field_id',
    ),
  ]);

  const answersOf = new Map(counts.map((row) => [row.field_id, Number(row.answers)]));
  const live = all.filter((def) => def.archivedOn === null);
  const archived = all.filter((def) => def.archivedOn !== null);

  /* The next free step, so the arrows move a row exactly one place. Ties are
     broken by the Arabic label, which is correct but is not what somebody
     pressing an arrow expects. */
  const nextSortOrder = clampOrder(
    live.length === 0 ? 0 : Math.max(...live.map((def) => def.sortOrder)) + STEP,
  );

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{dict.account.staff.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        {/*
         * Migration 048 asks for both of these on this screen, and they are the
         * reason the feature is safe to hand to a coordinator: a custom field is
         * not a back door around profiles_sensitive, and nothing in the platform
         * ever reads one to decide anything.
         */}
        <div className="mt-6 rounded-2xl border-2 border-warn bg-warn/10 p-4 sm:p-5">
          <p className="max-w-[62ch] text-[0.9rem] leading-relaxed text-ink-2">{t.notSensitive}</p>
          <p className="mt-3 max-w-[62ch] text-[0.9rem] leading-relaxed text-ink-2">{t.notRules}</p>
        </div>

        <details className="mt-6">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-full bg-brand-orange px-5 text-[0.92rem] font-extrabold text-brand-orange-ink transition-colors hover:bg-brand-orange-dark">
            {t.addCta}
          </summary>
          <div className="mt-4 rounded-2xl border border-line bg-surface p-4 sm:p-6">
            <h2 className="mb-4 text-[1rem] font-extrabold">{t.addHeading}</h2>
            <ProfileFieldForm lang={lang} answers={0} nextSortOrder={nextSortOrder} t={t} />
          </div>
        </details>

        {live.length === 0 ? (
          <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.empty}
          </p>
        ) : (
          <ol className="mt-6 space-y-4">
            {live.map((def, i) => (
              <Definition
                key={def.id}
                lang={lang}
                def={def}
                above={i > 0 ? live[i - 1] : null}
                below={i < live.length - 1 ? live[i + 1] : null}
                answers={answersOf.get(def.id) ?? 0}
                t={t}
              />
            ))}
          </ol>
        )}

        {archived.length > 0 && (
          <details className="mt-8">
            <summary className={PILL}>
              {t.archivedShow.replace('{n}', String(archived.length))}
            </summary>
            <p className="mt-3 max-w-[62ch] text-[0.86rem] leading-relaxed text-ink-3">
              {t.archivedNote}
            </p>
            <ul className="mt-3 space-y-3">
              {archived.map((def) => (
                <li key={def.id} className="rounded-2xl border border-line bg-surface-2 p-4">
                  <p className="text-[0.98rem] font-extrabold text-ink-2 break-words">
                    {lang === 'ar' ? def.labelAr : def.labelEn.trim() || def.labelAr}
                  </p>
                  <p className="mt-1.5 text-[0.82rem] text-ink-3">
                    {t.keyBadge}: <span dir="ltr" className="font-mono">{def.key}</span>
                    {' · '}
                    {t.kinds[def.kind]}
                    {' · '}
                    {countPhrase(answersOf.get(def.id) ?? 0, t.answers)}
                  </p>
                  {/* archivedOn is already Beirut 'YYYY-MM-DD' text. */}
                  <p className="mt-1 text-[0.82rem] text-ink-3" dir="ltr">
                    {t.archivedOn.replace('{date}', def.archivedOn ?? '')}
                  </p>
                </li>
              ))}
            </ul>
          </details>
        )}

        <Link
          href={`/${lang}/staff`}
          className="mt-9 inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {t.back}
        </Link>
      </Container>
    </Section>
  );
}
