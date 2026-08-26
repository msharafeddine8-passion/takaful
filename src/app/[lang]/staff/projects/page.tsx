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
import { isDbConfigured, query } from '@/lib/db';
import {
  allProjects,
  isComingSoon,
  projectName,
  projectSummary,
  projectTag,
  type Project,
} from '@/lib/projects';
import {
  archiveProjectAction,
  createProjectAction,
  setProjectPublishedAction,
  updateProjectAction,
} from '@/lib/actions/projects';
import { formatRolePeriod } from '@/lib/volunteer-role-view';
import {
  projectsAdmin,
  isProjectError,
  type ProjectAdminStrings,
} from '@/lib/dictionaries/projects-admin';

/**
 * «المشاريع»: what the association runs, and the five things an administrator
 * can do to one.
 *
 * ── A SERVER COMPONENT, ALL THE WAY DOWN ──────────────────────────────────
 *
 * There is no client component in this feature. Every control is a plain
 * `<form action={serverAction}>` and every panel is a `<details>`, so opening
 * the add form, editing a project, publishing one or archiving one costs no
 * JavaScript at all and works before hydration.
 *
 * The one thing a server-only form normally cannot do is show WHY a write was
 * refused, and this feature has two refusals an administrator can genuinely hit
 * — a slug already taken and a slug of the wrong shape. So the actions redirect
 * back with `?error=…` and the banner below renders the sentence. That is why
 * this page reads searchParams at all.
 *
 * ── WHAT THIS PAGE DOES NOT DO ────────────────────────────────────────────
 *
 * It does not count anybody. There is no "5 people" on a card, no ordering by
 * how many volunteers a project has had, and no figure anywhere that could be
 * compared between two projects — the query behind it produces none. Who runs a
 * project is a `volunteer_roles` row and this page never reads one; the
 * project's own page does, to show the record.
 *
 * It also offers no delete. trg_projects_no_delete refuses one outright, because
 * roles point at these rows and those roles are people's records of having run
 * them.
 *
 * ── MOBILE FIRST ──────────────────────────────────────────────────────────
 *
 * One column at 375px, splitting at `sm`. Nothing carries a min-width, so the
 * page never scrolls sideways; every control is `min-h-11`, which is 44px; and
 * the logical properties (`ms-`/`me-`/`text-start`) mean the same markup reads
 * right-to-left in Arabic and left-to-right in English.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/projects'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: projectsAdmin(lang).title,
    alternates: alternatesFor(lang, '/staff/projects'),
    robots: { index: false, follow: false },
  };
}

/* The same summary pill as the committees screen, VolunteerRoles and AdminNotes
 * — these pages belong to one product. `inline-flex` is what removes the
 * disclosure triangle: a summary is a list-item by default and stops being one
 * the moment its display changes, in every engine including the WebKit one that
 * ignores `list-style: none` here. */
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

/**
 * The one form a project is typed into, for both adding and correcting.
 *
 * ── THE STATUS BOX IS AN INPUT WITH A DATALIST, NEVER A SELECT ────────────
 *
 * A datalist is a typeahead: the browser offers the options and accepts anything
 * else. The options are the statuses already recorded, read back out of the
 * table by the page below. There is no `pattern` and nothing compares what was
 * typed against what was offered — see the head of migration 055, which makes
 * the same argument migration 054 makes for a group's kind and migration 046 for
 * a role's title.
 *
 * The public page reads exactly one of those words specially ('soon'), and the
 * hint says so. Reading a string specially is not the same as refusing every
 * other one: a project marked «متوقّف» stores that word and renders as running,
 * which is a truer page than one that refused to store it at all.
 *
 * ── THE SLUG IS EDITABLE, AND THAT IS DELIBERATE ──────────────────────────
 *
 * It is a public URL, so changing it breaks links that have already been shared
 * — the hint says exactly that. It is still offered, because the alternative is
 * that a typo made once is a typo for ever, and because the audit line carries
 * the previous value so the old address is recoverable.
 */
function ProjectForm({
  lang,
  project,
  statusSuggestions,
  t,
}: {
  lang: Locale;
  /** Absent for «+ إضافة مشروع»; present when correcting one. */
  project?: Project;
  statusSuggestions: string[];
  t: ProjectAdminStrings;
}) {
  const editing = project !== undefined;
  const uid = editing ? project.id : 'new';
  const statusList = `statuses-${uid}`;

  return (
    <form action={editing ? updateProjectAction : createProjectAction} className="space-y-5">
      <input type="hidden" name="lang" value={lang} />
      {editing && <input type="hidden" name="projectId" value={project.id} />}

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
          autoComplete="off"
          defaultValue={project?.slug ?? ''}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.slugHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`nameAr-${uid}`}>
          {t.nameArLabel}
        </label>
        <input
          id={`nameAr-${uid}`}
          name="nameAr"
          type="text"
          required
          defaultValue={project?.nameAr ?? ''}
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
          defaultValue={project?.nameEn ?? ''}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.nameEnHint}</p>
      </div>

      {/* One column on a phone, two from `sm` up. Nothing here has a min-width,
          so 375px never produces a horizontal scrollbar. */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor={`tagAr-${uid}`}>
            {t.tagArLabel}
          </label>
          <input
            id={`tagAr-${uid}`}
            name="tagAr"
            type="text"
            defaultValue={project?.tagAr ?? ''}
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor={`tagEn-${uid}`}>
            {t.tagEnLabel}
          </label>
          <input
            id={`tagEn-${uid}`}
            name="tagEn"
            type="text"
            dir="ltr"
            defaultValue={project?.tagEn ?? ''}
            className={`${FIELD} text-start`}
          />
        </div>
      </div>
      <p className={HINT}>{t.tagHint}</p>

      <div>
        <label className={LABEL} htmlFor={`summaryAr-${uid}`}>
          {t.summaryArLabel}
        </label>
        <textarea
          id={`summaryAr-${uid}`}
          name="summaryAr"
          rows={4}
          defaultValue={project?.summaryAr ?? ''}
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
          rows={4}
          dir="ltr"
          defaultValue={project?.summaryEn ?? ''}
          className={`${FIELD} text-start leading-relaxed`}
        />
        <p className={HINT}>{t.summaryHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`status-${uid}`}>
          {t.statusLabel}
        </label>
        <input
          id={`status-${uid}`}
          name="status"
          type="text"
          list={statusList}
          dir="ltr"
          autoComplete="off"
          defaultValue={project?.status ?? 'live'}
          className={`${FIELD} text-start`}
        />
        {/* Suggestions, never a permitted set. See the head of this component. */}
        <datalist id={statusList}>
          {statusSuggestions.map((status) => (
            <option key={status} value={status} />
          ))}
        </datalist>
        <p className={HINT}>{t.statusHint}</p>
      </div>

      <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.84rem] leading-relaxed text-ink-2">
        {t.suggestionsNote}
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor={`startedOn-${uid}`}>
            {t.startLabel}
          </label>
          <input
            id={`startedOn-${uid}`}
            name="startedOn"
            type="date"
            defaultValue={project?.startedOn ?? ''}
            className={FIELD}
          />
          <label
            className="mt-2 block text-[0.82rem] font-bold text-ink-3"
            htmlFor={`startedPrec-${uid}`}
          >
            {t.precisionLabel}
          </label>
          <select
            id={`startedPrec-${uid}`}
            name="startedPrec"
            defaultValue={project?.startedPrec ?? 'day'}
            className={`${FIELD} mt-1`}
          >
            <option value="day">{t.precision.day}</option>
            <option value="month">{t.precision.month}</option>
            <option value="year">{t.precision.year}</option>
          </select>
        </div>

        <div>
          <label className={LABEL} htmlFor={`endedOn-${uid}`}>
            {t.endLabel}
          </label>
          <input
            id={`endedOn-${uid}`}
            name="endedOn"
            type="date"
            defaultValue={project?.endedOn ?? ''}
            className={FIELD}
          />
          <label
            className="mt-2 block text-[0.82rem] font-bold text-ink-3"
            htmlFor={`endedPrec-${uid}`}
          >
            {t.precisionLabel}
          </label>
          <select
            id={`endedPrec-${uid}`}
            name="endedPrec"
            defaultValue={project?.endedPrec ?? 'day'}
            className={`${FIELD} mt-1`}
          >
            <option value="day">{t.precision.day}</option>
            <option value="month">{t.precision.month}</option>
            <option value="year">{t.precision.year}</option>
          </select>
        </div>
      </div>
      <p className={HINT}>{t.runHint}</p>

      <div>
        <label className={LABEL} htmlFor={`sortOrder-${uid}`}>
          {t.orderLabel}
        </label>
        <input
          id={`sortOrder-${uid}`}
          name="sortOrder"
          type="number"
          step={1}
          dir="ltr"
          defaultValue={String(project?.sortOrder ?? 0)}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.orderHint}</p>
      </div>

      {/*
        `isPublished` is on the ADD form only. Editing it lives in its own form
        below, so that saving a spelling correction from a stale tab cannot
        quietly put a withdrawn project back on the association's public page —
        the same separation lib/projects.ts keeps between updateProject and
        setPublished.
      */}
      {!editing && (
        <div>
          <label className="flex min-h-11 items-center gap-3 text-[0.95rem] font-bold">
            <input
              name="isPublished"
              type="checkbox"
              value="true"
              className="h-5 w-5 accent-brand-blue"
            />
            {t.publishCta}
          </label>
          {/* AFTER the checkbox, and that order is load-bearing. An unticked
              checkbox posts nothing at all; the action reads formData.get(),
              which returns the FIRST entry in tree order, so ticked posts
              ['true','false'] and reads true while unticked posts ['false'] and
              reads false. Putting this line above would publish nothing, ever. */}
          <input type="hidden" name="isPublished" value="false" />
          <p className={HINT}>{t.publishNote}</p>
        </div>
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

/**
 * Why a project is being taken off the list.
 *
 * The reason is required by the form and again by chk_pr_archived, and it is
 * stored on the row rather than only in the log — the same rule migration 050
 * established for a volunteer role: the question is asked while looking at the
 * list.
 */
function ArchiveForm({
  lang,
  project,
  t,
}: {
  lang: Locale;
  project: Project;
  t: ProjectAdminStrings;
}) {
  return (
    <form action={archiveProjectAction}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="projectId" value={project.id} />

      <h4 className="text-[0.95rem] font-extrabold">{t.archiveHeading}</h4>
      <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-2">{t.archiveNote}</p>

      <label className="mt-4 mb-1.5 block text-[0.88rem] font-bold" htmlFor={`why-${project.id}`}>
        {t.reasonLabel}
      </label>
      <input
        id={`why-${project.id}`}
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

function ProjectCard({
  lang,
  project,
  statusSuggestions,
  t,
}: {
  lang: Locale;
  project: Project;
  statusSuggestions: string[];
  t: ProjectAdminStrings;
}) {
  const summary = projectSummary(project, lang);
  const tag = projectTag(project, lang);
  /* The run, written to the precision that is actually known — «من ٢٠٢١ حتى
     الآن» / '2021 – present'. formatRolePeriod slices text and never builds a
     Date, which is the whole point; a project with no dates at all renders as
     «—» and is not printed. `isCurrent` is false because a project has no such
     column: an unfinished one has no end date and reads as «من ٢٠٢١», which is
     honest, where 'present' would be this page asserting something no column
     says. */
  const period = formatRolePeriod(
    {
      startedOn: project.startedOn,
      startedPrec: project.startedPrec,
      endedOn: project.endedOn,
      endedPrec: project.endedPrec,
      isCurrent: false,
    },
    lang,
  );

  return (
    <li
      /* The start-side rule is the only thing separating a published project
         from one that is not on the site. `border-s-*` and not `border-l-*`, so
         it lands on the right in Arabic and the left in English. */
      className={`rounded-2xl border border-line bg-surface p-4 sm:p-5 ${
        project.isPublished ? 'border-s-4 border-s-brand-orange' : ''
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
        <h3 className="text-[1.02rem] font-extrabold break-words">{projectName(project, lang)}</h3>
        <span
          className={`rounded-full px-3 py-1 text-[0.78rem] font-extrabold ${
            project.isPublished
              ? 'bg-brand-orange/15 text-brand-orange-text dark:text-brand-orange'
              : 'bg-surface-2 text-ink-3'
          }`}
        >
          {project.isPublished ? t.publishedBadge : t.unpublishedBadge}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <Badge>
          <span dir="ltr">{project.slug}</span>
        </Badge>
        {tag && (
          <Badge>
            {t.tagBadge}: {tag}
          </Badge>
        )}
        <Badge>
          {t.statusBadge}: {isComingSoon(project) ? t.comingSoonBadge : project.status}
        </Badge>
        {period !== '—' && (
          <Badge>
            {t.runsLabel}: {period}
          </Badge>
        )}
      </div>

      {summary && (
        <p className="mt-3 whitespace-pre-line text-[0.93rem] leading-relaxed text-ink-2">
          {summary}
        </p>
      )}

      {/* Already 'YYYY-MM-DD' in Beirut, as text from the query. */}
      <p className="mt-3 text-[0.8rem] text-ink-3" dir="ltr">
        {t.recordedOn.replace('{date}', project.createdOn)}
      </p>

      <Link
        href={`/${lang}/staff/projects/${project.id}`}
        className="mt-4 inline-block min-h-11 rounded-full border border-line bg-surface-2 px-5 py-2.5 text-[0.9rem] font-extrabold text-brand-blue transition-colors hover:bg-surface dark:text-brand-orange"
      >
        {t.openCta} →
      </Link>

      <div className="mt-4 space-y-2 border-t border-line pt-4">
        <details>
          <summary className={PILL}>{t.editCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <h4 className="mb-4 text-[0.95rem] font-extrabold">{t.editHeading}</h4>
            <ProjectForm
              lang={lang}
              project={project}
              statusSuggestions={statusSuggestions}
              t={t}
            />
          </div>
        </details>

        <details>
          <summary className={PILL}>
            {project.isPublished ? t.unpublishCta : t.publishCta}
          </summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <p className="text-[0.86rem] leading-relaxed text-ink-2">{t.publishNote}</p>
            <form action={setProjectPublishedAction} className="mt-4">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="projectId" value={project.id} />
              {/* flag() reads 'true' as true and everything else as false, so an
                  explicit value is safer than omitting the field. */}
              <input
                type="hidden"
                name="published"
                value={project.isPublished ? 'false' : 'true'}
              />
              <button
                type="submit"
                className="min-h-11 w-full rounded-full border-2 border-brand-blue px-6 text-[0.9rem] font-extrabold text-brand-blue transition-colors hover:bg-brand-blue/10 sm:w-auto dark:border-brand-orange dark:text-brand-orange"
              >
                {project.isPublished ? t.unpublishCta : t.publishCta}
              </button>
            </form>
          </div>
        </details>

        <details>
          <summary className={PILL}>{t.archiveCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <ArchiveForm lang={lang} project={project} t={t} />
          </div>
        </details>
      </div>
    </li>
  );
}

export default async function StaffProjectsPage(props: PageProps<'/[lang]/staff/projects'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = projectsAdmin(lang);

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
   * disagreed with them would produce a screen full of controls that could only
   * fail. */
  if (!can(user, 'members.manage')) {
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
  const problem = isProjectError(asked) ? asked : null;

  const [all, statusRows] = await Promise.all([
    allProjects({ includeArchived: true }),
    /*
     * The statuses already in use, for the typeahead. A COUNT OF NOTHING AND OF
     * NOBODY: it is a `DISTINCT` over one text column, and there is no GROUP BY
     * user_id anywhere near this page.
     */
    query<{ status: string }>(
      `SELECT DISTINCT status FROM projects
        WHERE archived_at IS NULL AND btrim(status) <> ''
        ORDER BY status
        LIMIT 50`,
    ),
  ]);

  const live = all.filter((project) => project.archivedOn === null);
  const archived = all.filter((project) => project.archivedOn !== null);
  const statusSuggestions = statusRows.map((row) => row.status);

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{dict.account.staff.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

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
            <ProjectForm lang={lang} statusSuggestions={statusSuggestions} t={t} />
          </div>
        </details>

        {live.length === 0 ? (
          <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.empty}
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {live.map((project) => (
              <ProjectCard
                key={project.id}
                lang={lang}
                project={project}
                statusSuggestions={statusSuggestions}
                t={t}
              />
            ))}
          </ul>
        )}

        {/*
         * Archived rows: kept, hidden by default. The database refuses a DELETE
         * outright (trg_projects_no_delete), so nothing in this drawer is ever
         * the last copy of anything — and the roles that pointed at these rows
         * are still on their holders' records, untouched.
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
              {archived.map((project) => (
                <li key={project.id} className="rounded-2xl border border-line bg-surface-2 p-4">
                  <p className="text-[0.98rem] font-extrabold text-ink-2 break-words">
                    {projectName(project, lang)}
                  </p>
                  <p className="mt-1 text-[0.82rem] text-ink-3" dir="ltr">
                    {project.slug}
                  </p>
                  {/* archivedOn is already Beirut 'YYYY-MM-DD' text. */}
                  <p className="mt-1 text-[0.82rem] text-ink-3" dir="ltr">
                    {t.archivedOn.replace('{date}', project.archivedOn ?? '')}
                  </p>
                  {project.archiveReason && (
                    <p className="mt-2 text-[0.88rem] text-ink-2 break-words">
                      {t.archivedReason}: {project.archiveReason}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            href={`/${lang}/staff`}
            className="inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
          >
            ← {dict.account.staff.dashboard.title}
          </Link>
          <Link
            href={`/${lang}/projects`}
            className="inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
          >
            {t.viewPublic}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
