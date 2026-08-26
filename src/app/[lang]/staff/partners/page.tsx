import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import {
  allPartners,
  linkableProjects,
  partnerKinds,
  partnerName,
  partnerSince,
  partnerSummary,
  partnershipNote,
  partnershipsByPartner,
  projectChoiceName,
  type Partner,
  type PartnerProject,
  type ProjectChoice,
} from '@/lib/partners';
import {
  archivePartnerAction,
  createPartnerAction,
  linkPartnerAction,
  setPartnerPublishedAction,
  unlinkPartnerAction,
  updatePartnerAction,
} from '@/lib/actions/partners';
import { partners, isPartnerError, type PartnerStrings } from '@/lib/dictionaries/partners';

/**
 * «الشركاء»: who the association works with, what each one backs, and whether it
 * is said publicly yet.
 *
 * ── A SERVER COMPONENT, ALL THE WAY DOWN ──────────────────────────────────
 *
 * There is no client component in this feature. Every control is a plain
 * `<form action={serverAction}>` and every panel is a `<details>`, so adding a
 * partner, editing one, publishing one, archiving one or linking one to a
 * project costs no JavaScript at all and works before hydration.
 *
 * The one thing a server-only form normally cannot do is show WHY a write was
 * refused, and this feature has two refusals an administrator can genuinely
 * hit — a website that is not http or https, and a slug another partner already
 * holds. So the actions redirect back with `?error=…` and the banner below
 * renders the sentence. That is why this page reads searchParams at all.
 *
 * ── THE KIND BOX IS AN INPUT WITH A DATALIST, NEVER A SELECT ──────────────
 *
 * A datalist is a typeahead: the browser offers the options and accepts
 * anything else. The options are the kinds already recorded, read back out of
 * the table by partnerKinds(). There is no `pattern` and nothing compares what
 * was typed against what was offered — see the head of migration 057.
 *
 * ── MOBILE FIRST ──────────────────────────────────────────────────────────
 *
 * One column at 375px, splitting at `sm`. Nothing carries a min-width, so the
 * page never scrolls sideways; every control is `min-h-11`, which is 44px; and
 * the logical properties (`ms-`/`me-`/`text-start`) mean the same markup reads
 * right-to-left in Arabic and left-to-right in English.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/partners'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: partners(lang).staffTitle,
    alternates: alternatesFor(lang, '/staff/partners'),
    robots: { index: false, follow: false },
  };
}

/* The same summary pill as the committees screen — these pages belong to one
 * product. `inline-flex` is what removes the disclosure triangle: a summary is a
 * list-item by default and stops being one the moment its display changes, in
 * every engine including the WebKit one that ignores `list-style: none` here. */
const PILL =
  'inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line' +
  ' bg-surface-2 px-4 text-[0.88rem] font-extrabold text-ink-2 transition-colors hover:bg-surface';

const FIELD =
  'min-h-11 w-full rounded-xl border border-line bg-ground px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue';

const LABEL = 'mb-1.5 block text-[0.88rem] font-bold';

const HINT = 'mt-1.5 text-[0.82rem] leading-relaxed text-ink-3';

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.78rem] font-bold text-ink-2 break-words">
      {children}
    </span>
  );
}

/** The one form a partner is typed into, for both adding and correcting. */
function PartnerForm({
  lang,
  partner,
  kindSuggestions,
  t,
}: {
  lang: Locale;
  /** Absent for «+ إضافة شريك»; present when correcting one. */
  partner?: Partner;
  kindSuggestions: string[];
  t: PartnerStrings;
}) {
  const editing = partner !== undefined;
  const uid = editing ? partner.id : 'new';
  const kindList = `partner-kinds-${uid}`;

  return (
    <form action={editing ? updatePartnerAction : createPartnerAction} className="space-y-5">
      <input type="hidden" name="lang" value={lang} />
      {editing && <input type="hidden" name="partnerId" value={partner.id} />}

      <div>
        <label className={LABEL} htmlFor={`nameAr-${uid}`}>
          {t.nameArLabel}
        </label>
        <input
          id={`nameAr-${uid}`}
          name="nameAr"
          type="text"
          required
          defaultValue={partner?.nameAr ?? ''}
          className={FIELD}
        />
        <p className={HINT}>{t.nameArHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`nameEn-${uid}`}>
          {t.nameEnLabel}
        </label>
        <input
          id={`nameEn-${uid}`}
          name="nameEn"
          type="text"
          dir="ltr"
          defaultValue={partner?.nameEn ?? ''}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.nameEnHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`slug-${uid}`}>
          {t.slugLabel}
        </label>
        <input
          id={`slug-${uid}`}
          name="slug"
          type="text"
          required
          dir="ltr"
          /* The same shape as chk_pa_slug. The browser refuses the obvious
             mistakes; lib/partners.ts refuses them again, because a `pattern`
             is a courtesy and not a check. */
          pattern="[a-z0-9][a-z0-9\-]{1,60}"
          defaultValue={partner?.slug ?? ''}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.slugHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`kind-${uid}`}>
          {t.kindLabel}
        </label>
        <input
          id={`kind-${uid}`}
          name="kind"
          type="text"
          list={kindList}
          autoComplete="off"
          defaultValue={partner?.kind ?? ''}
          className={FIELD}
        />
        {/* Suggestions, never a permitted set. See the head of this page. */}
        <datalist id={kindList}>
          {kindSuggestions.map((kind) => (
            <option key={kind} value={kind} />
          ))}
        </datalist>
        <p className={HINT}>{t.kindHint}</p>
      </div>

      <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.84rem] leading-relaxed text-ink-2">
        {t.suggestionsNote}
      </p>

      <div>
        <label className={LABEL} htmlFor={`website-${uid}`}>
          {t.websiteLabel}
        </label>
        <input
          id={`website-${uid}`}
          name="websiteUrl"
          type="url"
          dir="ltr"
          inputMode="url"
          placeholder="https://"
          defaultValue={partner?.websiteUrl ?? ''}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.websiteHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`summaryAr-${uid}`}>
          {t.summaryArLabel}
        </label>
        <textarea
          id={`summaryAr-${uid}`}
          name="summaryAr"
          rows={3}
          defaultValue={partner?.summaryAr ?? ''}
          className={`${FIELD} leading-relaxed`}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor={`summaryEn-${uid}`}>
          {t.summaryEnLabel}
        </label>
        <textarea
          id={`summaryEn-${uid}`}
          name="summaryEn"
          rows={3}
          dir="ltr"
          defaultValue={partner?.summaryEn ?? ''}
          className={`${FIELD} text-start leading-relaxed`}
        />
        <p className={HINT}>{t.summaryHint}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor={`since-${uid}`}>
            {t.sinceDateLabel}
          </label>
          {/* Sent and stored as 'YYYY-MM-DD' text. Nothing anywhere builds a
              Date from it — see the head of lib/partners.ts. */}
          <input
            id={`since-${uid}`}
            name="sinceOn"
            type="date"
            dir="ltr"
            defaultValue={partner?.sinceOn ?? ''}
            className={`${FIELD} text-start`}
          />
          <p className={HINT}>{t.sinceDateHint}</p>
        </div>

        <div>
          <label className={LABEL} htmlFor={`prec-${uid}`}>
            {t.precisionLabel}
          </label>
          <select
            id={`prec-${uid}`}
            name="sincePrec"
            defaultValue={partner?.sincePrec ?? 'day'}
            className={FIELD}
          >
            <option value="day">{t.precision.day}</option>
            <option value="month">{t.precision.month}</option>
            <option value="year">{t.precision.year}</option>
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor={`sort-${uid}`}>
          {t.sortLabel}
        </label>
        <input
          id={`sort-${uid}`}
          name="sortOrder"
          type="number"
          step={1}
          dir="ltr"
          defaultValue={String(partner?.sortOrder ?? 0)}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.sortHint}</p>
      </div>

      {/* Only on the add form. An edit must not carry is_published — see the
          head of lib/actions/partners.ts for why it has an action of its own. */}
      {!editing && (
        <label className="flex items-start gap-3 text-[0.92rem]">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked
            className="mt-1 h-5 w-5 shrink-0 accent-brand-blue"
          />
          <span className="leading-relaxed text-ink-2">{t.publishCta}</span>
        </label>
      )}

      <button
        type="submit"
        className="min-h-11 w-full rounded-full bg-brand-blue px-6 py-2.5 text-[0.92rem] font-extrabold text-white transition-opacity hover:opacity-90 sm:w-auto"
      >
        {editing ? t.saveEdit : t.save}
      </button>
    </form>
  );
}

/** Why a partner is being taken off the list. A reason is required twice. */
function ArchiveForm({
  lang,
  partner,
  t,
}: {
  lang: Locale;
  partner: Partner;
  t: PartnerStrings;
}) {
  return (
    <form action={archivePartnerAction}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="partnerId" value={partner.id} />

      <h4 className="text-[0.95rem] font-extrabold">{t.archiveHeading}</h4>
      <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-2">{t.archiveNote}</p>

      <label className="mt-4 mb-1.5 block text-[0.88rem] font-bold" htmlFor={`why-${partner.id}`}>
        {t.reasonLabel}
      </label>
      <input
        id={`why-${partner.id}`}
        name="reason"
        type="text"
        required
        minLength={2}
        placeholder={t.reasonPlaceholder}
        className={FIELD}
      />
      <button
        type="submit"
        className="mt-3 min-h-11 w-full rounded-full bg-danger px-6 text-[0.9rem] font-extrabold text-white transition-opacity hover:opacity-90 sm:w-auto"
      >
        {t.archiveSubmit}
      </button>
    </form>
  );
}

/**
 * What this partner backs, and the form that says so.
 *
 * The project select offers every unarchived project. The note is on the
 * PAIRING — «دعم دورة صيف ٢٠٢٤» belongs to neither side alone — which is the
 * shape migration 057 gave project_partners.
 */
function ProjectLinks({
  lang,
  partner,
  links,
  projects,
  t,
}: {
  lang: Locale;
  partner: Partner;
  links: PartnerProject[];
  projects: ProjectChoice[];
  t: PartnerStrings;
}) {
  return (
    <div>
      <h4 className="text-[0.95rem] font-extrabold">{t.linkedHeading}</h4>

      {links.length === 0 ? (
        <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-3">{t.linkedEmpty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {links.map((link) => {
            const note = partnershipNote(link, lang);
            return (
              <li
                key={link.projectId}
                className="rounded-xl border border-line bg-ground p-3 sm:p-4"
              >
                <p className="text-[0.95rem] font-extrabold break-words">
                  {projectChoiceName(link, lang)}
                </p>
                {note && (
                  <p className="mt-1 text-[0.88rem] leading-relaxed text-ink-2 break-words">
                    {note}
                  </p>
                )}
                <form action={unlinkPartnerAction} className="mt-3">
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="partnerId" value={partner.id} />
                  <input type="hidden" name="projectId" value={link.projectId} />
                  {/* Carried so the audit line keeps what the note said. */}
                  <input type="hidden" name="noteAr" value={link.noteAr ?? ''} />
                  <input type="hidden" name="noteEn" value={link.noteEn ?? ''} />
                  <button
                    type="submit"
                    className="min-h-11 rounded-full border border-line bg-surface-2 px-5 text-[0.86rem] font-extrabold text-ink-2 transition-colors hover:bg-surface"
                  >
                    {t.unlinkCta}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-[0.82rem] leading-relaxed text-ink-3">{t.unlinkNote}</p>

      <form action={linkPartnerAction} className="mt-5 space-y-4 border-t border-line pt-5">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="partnerId" value={partner.id} />

        <h4 className="text-[0.95rem] font-extrabold">{t.linkHeading}</h4>
        <p className="text-[0.86rem] leading-relaxed text-ink-2">{t.linkNote}</p>

        <div>
          <label className={LABEL} htmlFor={`project-${partner.id}`}>
            {t.projectLabel}
          </label>
          <select id={`project-${partner.id}`} name="projectId" required className={FIELD}>
            <option value="">{t.projectNone}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {projectChoiceName(project, lang)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL} htmlFor={`noteAr-${partner.id}`}>
            {t.noteArLabel}
          </label>
          <input
            id={`noteAr-${partner.id}`}
            name="noteAr"
            type="text"
            className={FIELD}
          />
        </div>

        <div>
          <label className={LABEL} htmlFor={`noteEn-${partner.id}`}>
            {t.noteEnLabel}
          </label>
          <input
            id={`noteEn-${partner.id}`}
            name="noteEn"
            type="text"
            dir="ltr"
            className={`${FIELD} text-start`}
          />
          <p className={HINT}>{t.noteHint}</p>
        </div>

        <button
          type="submit"
          className="min-h-11 w-full rounded-full border-2 border-brand-blue px-6 text-[0.9rem] font-extrabold text-brand-blue transition-colors hover:bg-brand-blue/10 sm:w-auto dark:border-brand-orange dark:text-brand-orange"
        >
          {t.linkSubmit}
        </button>
      </form>
    </div>
  );
}

function PartnerCard({
  lang,
  partner,
  links,
  projects,
  kindSuggestions,
  t,
}: {
  lang: Locale;
  partner: Partner;
  links: PartnerProject[];
  projects: ProjectChoice[];
  kindSuggestions: string[];
  t: PartnerStrings;
}) {
  const summary = partnerSummary(partner, lang);
  // Formatted from text by formatRoleDate. Never a Date.
  const since = partnerSince(partner, lang);

  return (
    <li
      /* The start-side rule is the only thing separating a partner that is on
         the public page from one that is not. `border-s-*` and not `border-l-*`,
         so it lands on the right in Arabic and the left in English. */
      className={`rounded-2xl border border-line bg-surface p-4 sm:p-5 ${
        partner.isPublished ? 'border-s-4 border-s-brand-orange' : ''
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
        <h3 className="text-[1.02rem] font-extrabold break-words">{partnerName(partner, lang)}</h3>
        <span
          className={`rounded-full px-3 py-1 text-[0.78rem] font-extrabold ${
            partner.isPublished
              ? 'bg-brand-orange/15 text-brand-orange-text dark:text-brand-orange'
              : 'bg-surface-2 text-ink-3'
          }`}
        >
          {partner.isPublished ? t.publishedBadge : t.unpublishedBadge}
        </span>
      </div>

      {(partner.kind || since) && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {partner.kind && (
            <Badge>
              {t.kindBadge}: {partner.kind}
            </Badge>
          )}
          {since && (
            <Badge>
              {t.sinceBadge}: {since}
            </Badge>
          )}
        </div>
      )}

      {summary && (
        <p className="mt-3 whitespace-pre-line text-[0.93rem] leading-relaxed text-ink-2">
          {summary}
        </p>
      )}

      {partner.websiteUrl && (
        /* Already parsed and reduced to http or https by lib/partners.ts, and
           rendered exactly as it was validated. A plain <a>, not next/link:
           this leaves the site. */
        <a
          href={partner.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className="mt-3 inline-block text-[0.88rem] font-bold break-all text-brand-blue hover:underline dark:text-sky-300"
        >
          {partner.websiteUrl}
        </a>
      )}

      {/* Already 'YYYY-MM-DD' in Beirut, as text from the query. */}
      <p className="mt-3 text-[0.8rem] text-ink-3" dir="ltr">
        {t.recordedOn.replace('{date}', partner.createdOn)}
      </p>

      <div className="mt-4 space-y-2 border-t border-line pt-4">
        <details>
          <summary className={PILL}>{t.editCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <h4 className="mb-4 text-[0.95rem] font-extrabold">{t.editHeading}</h4>
            <PartnerForm
              lang={lang}
              partner={partner}
              kindSuggestions={kindSuggestions}
              t={t}
            />
          </div>
        </details>

        <details>
          <summary className={PILL}>
            {t.linkCta}
            {links.length > 0 && ` (${links.length})`}
          </summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <ProjectLinks
              lang={lang}
              partner={partner}
              links={links}
              projects={projects}
              t={t}
            />
          </div>
        </details>

        <details>
          <summary className={PILL}>
            {partner.isPublished ? t.unpublishCta : t.publishCta}
          </summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <p className="text-[0.86rem] leading-relaxed text-ink-2">{t.publishNote}</p>
            <form action={setPartnerPublishedAction} className="mt-4">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="partnerId" value={partner.id} />
              {/* flag() reads 'true' as true and everything else as false, so an
                  explicit value is safer than omitting the field. */}
              <input
                type="hidden"
                name="published"
                value={partner.isPublished ? 'false' : 'true'}
              />
              <button
                type="submit"
                className="min-h-11 w-full rounded-full border-2 border-brand-blue px-6 text-[0.9rem] font-extrabold text-brand-blue transition-colors hover:bg-brand-blue/10 sm:w-auto dark:border-brand-orange dark:text-brand-orange"
              >
                {partner.isPublished ? t.unpublishCta : t.publishCta}
              </button>
            </form>
          </div>
        </details>

        <details>
          <summary className={PILL}>{t.archiveCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <ArchiveForm lang={lang} partner={partner} t={t} />
          </div>
        </details>
      </div>
    </li>
  );
}

export default async function StaffPartnersPage(props: PageProps<'/[lang]/staff/partners'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = partners(lang);

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
  /* The same capability every action on this page asserts. A `can()` that
   * disagreed with them would produce a screen full of controls that could
   * only fail. Why it is challenges.manage and not members.manage is argued at
   * the head of lib/actions/partners.ts. */
  if (!can(user, 'challenges.manage')) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.staff.forbidden}
        </p>
      </Container></Section>
    );
  }

  const params = await props.searchParams;
  const asked = String(params.error ?? '');
  // Read off a URL, so it is checked against the strings that answer to it
  // rather than rendered as whatever a stranger typed.
  const problem = isPartnerError(asked) ? asked : null;

  const [all, kindSuggestions, projects, linksByPartner] = await Promise.all([
    allPartners({ includeArchived: true }),
    partnerKinds(),
    linkableProjects(),
    partnershipsByPartner(),
  ]);

  const live = all.filter((partner) => partner.archivedOn === null);
  const archived = all.filter((partner) => partner.archivedOn !== null);

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{dict.account.staff.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.staffTitle}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.staffLede}</p>

        {problem && (
          <p
            role="status"
            className="mt-6 rounded-xl border-2 border-warn bg-warn/10 px-5 py-4 text-[0.93rem] leading-relaxed text-ink-2"
          >
            {t.errors[problem]}
          </p>
        )}

        <details className="mt-6">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-full bg-brand-orange px-5 text-[0.92rem] font-extrabold text-brand-orange-ink transition-colors hover:bg-brand-orange-dark">
            {t.addCta}
          </summary>
          <div className="mt-4 rounded-2xl border border-line bg-surface p-4 sm:p-6">
            <h2 className="mb-4 text-[1rem] font-extrabold">{t.addHeading}</h2>
            <PartnerForm lang={lang} kindSuggestions={kindSuggestions} t={t} />
          </div>
        </details>

        {live.length === 0 ? (
          <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.empty}
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {live.map((partner) => (
              <PartnerCard
                key={partner.id}
                lang={lang}
                partner={partner}
                links={linksByPartner.get(partner.id) ?? []}
                projects={projects}
                kindSuggestions={kindSuggestions}
                t={t}
              />
            ))}
          </ul>
        )}

        {/*
         * Archived rows: kept, hidden by default. The database refuses a DELETE
         * outright (trg_partners_no_delete), so nothing in this drawer is ever
         * the last copy of anything.
         */}
        {archived.length > 0 && (
          <details className="mt-8">
            <summary className={PILL}>
              {t.archivedShow.replace('{n}', String(archived.length))}
            </summary>
            <p className="mt-3 max-w-[62ch] text-[0.86rem] leading-relaxed text-ink-3">
              {t.archivedNote}
            </p>
            <ul className="mt-3 space-y-3">
              {archived.map((partner) => (
                <li key={partner.id} className="rounded-2xl border border-line bg-surface-2 p-4">
                  <p className="text-[0.98rem] font-extrabold text-ink-2 break-words">
                    {partnerName(partner, lang)}
                  </p>
                  {partner.kind && (
                    <p className="mt-1 text-[0.82rem] text-ink-3">
                      {t.kindBadge}: {partner.kind}
                    </p>
                  )}
                  {/* archivedOn is already Beirut 'YYYY-MM-DD' text. */}
                  <p className="mt-1 text-[0.82rem] text-ink-3" dir="ltr">
                    {t.archivedOn.replace('{date}', partner.archivedOn ?? '')}
                  </p>
                  {partner.archiveReason && (
                    <p className="mt-2 text-[0.88rem] text-ink-2 break-words">
                      {t.archivedReason}: {partner.archiveReason}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="mt-9 flex flex-wrap gap-5">
          <Link
            href={`/${lang}/staff`}
            className="inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
          >
            ← {dict.account.staff.dashboard.title}
          </Link>
          <Link
            href={`/${lang}/partners`}
            className="inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
          >
            {t.title} →
          </Link>
        </div>
      </Container>
    </Section>
  );
}
