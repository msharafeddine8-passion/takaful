import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured, query } from '@/lib/db';
import {
  isComingSoon,
  peopleOn,
  projectById,
  projectName,
  projectSummary,
  projectTag,
} from '@/lib/projects';
import { roleTitleSuggestions, viewerOf, type PersonWithRole } from '@/lib/volunteer-roles';
import { formatRolePeriod } from '@/lib/volunteer-role-view';
import { addProjectPersonAction } from '@/lib/actions/projects';
import { endRoleAction } from '@/lib/actions/volunteer-roles';
import {
  projectsAdmin,
  isProjectError,
  type ProjectAdminStrings,
} from '@/lib/dictionaries/projects-admin';

/**
 * One project: what it is, who runs it now, and who ran it before.
 *
 * ── EVERY PERSON ON THIS PAGE IS A volunteer_role ─────────────────────────
 *
 * The two lists below are one table read once and split on `isCurrent`. There is
 * no project_manager_id on `projects`, no former_managers table, and this page
 * could not read either if there were: peopleOn() queries `volunteer_roles WHERE
 * entity_kind = 'project'`, and the form that adds somebody calls the same
 * createRole() the member page calls. Migration 055's header argues why at
 * length; the short version is that a manager column cannot hold a predecessor,
 * so appointing a successor would be an UPDATE that deletes one.
 *
 * «المسؤول السابق للمشروع» is therefore not a feature that had to be built. It
 * is the same rows with an end date on them, which is why appointing a successor
 * here is «تسجيل منصب» on the new holder plus «إنهاء» on the outgoing one — two
 * rows, both kept — and why there is no control on this page that writes one
 * person's name over another's.
 *
 * ── NOTHING HERE DERIVES A DATE, AN ORDER OR A VISIBILITY ─────────────────
 *
 * The period is `formatRolePeriod`, which slices text and never builds a Date:
 * the association is in Beirut, the session runs GMT, and a role starting
 * 2025-01-01 reads as كانون الأول ٢٠٢٤ the moment anything constructs one. The
 * ordering is the one the module applied; the visibility filter was applied in
 * SQL from visibleTo(viewer). This file re-sorts nothing and re-filters nothing
 * except the `isCurrent` split, which is a fact on each row.
 *
 * ── AND IT COUNTS NOBODY ──────────────────────────────────────────────────
 *
 * No "5 people", no ordering of people by anything but the dates on their own
 * rows, and no figure that could be compared with another project's. The query
 * produces none.
 */

export const metadata: Metadata = { robots: { index: false, follow: false } };

const PILL =
  'inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line' +
  ' bg-surface-2 px-4 text-[0.88rem] font-extrabold text-ink-2 transition-colors hover:bg-surface';

const FIELD =
  'min-h-11 w-full rounded-xl border border-line bg-ground px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue';

const LABEL = 'mb-1.5 block text-[0.88rem] font-bold';

const HINT = 'mt-1.5 text-[0.82rem] leading-relaxed text-ink-3';

/* A project id is a UUID. Validated rather than handed to Postgres as text: an
   id of the wrong shape is a stale or guessed link, and it should read as "not
   found" rather than as a 500 from a failed cast. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The role's title in the page's language, falling back to the Arabic. */
function titleOf(entry: PersonWithRole, lang: Locale): string {
  if (lang === 'ar') return entry.role.titleAr;
  return entry.role.titleEn.trim() || entry.role.titleAr;
}

/**
 * One person and the role that puts them on this project.
 *
 * The name links to their own staff page, because "who is this?" is the next
 * question somebody asks and the answer is a whole record rather than a row.
 * `fullName` may be '' when the profile row is missing — the LEFT JOIN in
 * peopleOn keeps the role visible rather than dropping it — so the title carries
 * the line and the link still works.
 */
function Entry({
  lang,
  entry,
  showEnd,
  t,
}: {
  lang: Locale;
  entry: PersonWithRole;
  /** Only for a role somebody still holds: ending a past one does nothing. */
  showEnd: boolean;
  t: ProjectAdminStrings;
}) {
  return (
    <li className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
        <h3 className="text-[1.02rem] font-extrabold break-words">{titleOf(entry, lang)}</h3>
        {/* «من كانون الثاني ٢٠٢٥ حتى الآن» / 'January 2025 – present'. Built by
            formatRolePeriod from text, never from a Date. */}
        <span className="text-[0.9rem] font-bold text-ink-2">
          {formatRolePeriod(entry.role, lang)}
        </span>
      </div>

      <Link
        href={`/${lang}/staff/members/${entry.userId}`}
        className="mt-1.5 inline-block min-h-11 py-2 font-bold break-words text-brand-blue hover:underline dark:text-brand-orange"
      >
        {entry.fullName || t.openPerson}
      </Link>

      {entry.role.description && (
        <p className="mt-2 whitespace-pre-line text-[0.92rem] leading-relaxed text-ink-2">
          {entry.role.description}
        </p>
      )}

      <p className="mt-2 text-[0.8rem] text-ink-3">
        {t.seenByLabel}: {t.seenBy[entry.role.visibility]}
      </p>

      {showEnd && (
        <details className="mt-4 border-t border-line pt-4">
          <summary className={PILL}>{t.endCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <h4 className="text-[0.95rem] font-extrabold">{t.endHeading}</h4>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-2">{t.endNote}</p>
            {/*
             * endRoleAction, unchanged and imported from the roles feature.
             * Closing a role is the same act wherever it is done from, and a
             * second action that also set is_current = false would be a second
             * place for the rule to be got wrong.
             */}
            <form action={endRoleAction} className="mt-4">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="roleId" value={entry.role.id} />

              <label className={LABEL} htmlFor={`end-date-${entry.role.id}`}>
                {t.endDateLabel}
              </label>
              <input id={`end-date-${entry.role.id}`} name="endedOn" type="date" className={FIELD} />
              <p className={HINT}>{t.endDateNote}</p>

              <label className={`mt-3 ${LABEL}`} htmlFor={`end-prec-${entry.role.id}`}>
                {t.endPrecisionLabel}
              </label>
              <select
                id={`end-prec-${entry.role.id}`}
                name="endedPrec"
                defaultValue="day"
                className={FIELD}
              >
                <option value="day">{t.precision.day}</option>
                <option value="month">{t.precision.month}</option>
                <option value="year">{t.precision.year}</option>
              </select>

              <button
                type="submit"
                className="mt-4 min-h-11 w-full rounded-full border-2 border-brand-blue px-6 text-[0.9rem] font-extrabold text-brand-blue transition-colors hover:bg-brand-blue/10 sm:w-auto dark:border-brand-orange dark:text-brand-orange"
              >
                {t.endSubmit}
              </button>
            </form>
          </div>
        </details>
      )}
    </li>
  );
}

export default async function StaffProjectPage(props: PageProps<'/[lang]/staff/projects/[id]'>) {
  await connection();
  const { lang, id } = await props.params;
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
  /* The same capability every action on this page asserts, re-checked here
   * rather than trusted from the list it was reached from: a page decides what
   * to draw, it does not decide who somebody is. */
  if (!can(user, 'members.manage')) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.staff.forbidden}
        </p>
      </Container></Section>
    );
  }

  const project = UUID.test(id) ? await projectById(id) : null;
  if (!project) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {t.notFound}
        </p>
        <Link
          href={`/${lang}/staff/projects`}
          className="mt-6 inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {t.back}
        </Link>
      </Container></Section>
    );
  }

  const params = await props.searchParams;
  const asked = String(params.error ?? '');
  const problem = isProjectError(asked) ? asked : null;

  /*
   * The viewer is passed rather than assumed. peopleOn() filters in SQL against
   * visibleTo(viewer) — the same function rolesFor() binds on a profile page and
   * membersOf() binds on a committee page — so a role marked 'staff' is readable
   * here by exactly the people who can read it there, and this page states the
   * rule nowhere.
   */
  const viewer = viewerOf(user);

  const [people, titleSuggestions, kindRows, volunteers] = await Promise.all([
    peopleOn(project.id, viewer),
    /* Titles used before, as a TYPEAHEAD and never a permitted set — the same
     * function the member page calls, and the head of migration 046 says why the
     * distinction is the whole feature. There is NO list of project role titles
     * anywhere: «مسؤول المشروع» is a string somebody typed, not an enum. */
    roleTitleSuggestions('', 30),
    query<{ role_type: string }>(
      `SELECT DISTINCT role_type FROM volunteer_roles
        WHERE archived_at IS NULL AND role_type IS NOT NULL AND btrim(role_type) <> ''
        ORDER BY role_type
        LIMIT 50`,
    ),
    /*
     * Who a role can be recorded against. Ordered by name and by nothing else:
     * no count, no ranking, no "most projects run first". Capped, because a
     * select is not a directory — and if the association ever outgrows the cap,
     * the fix is a search box rather than a longer list.
     */
    query<{ id: string; full_name: string }>(
      `SELECT u.id, p.full_name
         FROM users u
         JOIN profiles p ON p.user_id = u.id
        WHERE u.status = 'active'
        ORDER BY p.full_name
        LIMIT 500`,
    ),
  ]);

  const current = people.filter((entry) => entry.role.isCurrent);
  const past = people.filter((entry) => !entry.role.isCurrent);
  const summary = projectSummary(project, lang);
  const tag = projectTag(project, lang);

  const titleOptions = [
    ...new Set(
      titleSuggestions
        .map((s) => (lang === 'ar' ? s.titleAr : s.titleEn || s.titleAr))
        .map((value) => value.trim())
        .filter((value) => value !== ''),
    ),
  ];

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{t.title}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.6rem,1.3rem+1.4vw,2.2rem)] font-extrabold tracking-tight break-words">
          {projectName(project, lang)}
        </h1>

        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[0.78rem] font-extrabold ${
              project.isPublished
                ? 'bg-brand-orange/15 text-brand-orange-text dark:text-brand-orange'
                : 'bg-surface-2 text-ink-3'
            }`}
          >
            {project.isPublished ? t.publishedBadge : t.unpublishedBadge}
          </span>
          <span
            className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.78rem] font-bold text-ink-2 break-words"
            dir="ltr"
          >
            {project.slug}
          </span>
          {tag && (
            <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.78rem] font-bold text-ink-2 break-words">
              {t.tagBadge}: {tag}
            </span>
          )}
          <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.78rem] font-bold text-ink-2 break-words">
            {t.statusBadge}: {isComingSoon(project) ? t.comingSoonBadge : project.status}
          </span>
        </div>

        {project.archivedOn !== null && (
          <p className="mt-5 rounded-xl border-2 border-warn bg-warn/10 px-5 py-3.5 text-[0.93rem] leading-relaxed text-ink-2">
            <span dir="ltr">{t.archivedOn.replace('{date}', project.archivedOn)}</span>
            {project.archiveReason ? ` · ${t.archivedReason}: ${project.archiveReason}` : ''}
          </p>
        )}

        {problem && (
          <p
            role="status"
            className="mt-5 rounded-xl border-2 border-warn bg-warn/10 px-5 py-4 text-[0.93rem] leading-relaxed text-ink-2"
          >
            {t.errors[problem]}
          </p>
        )}

        {summary && (
          <>
            <h2 className="mt-8 text-[1.1rem] font-extrabold">{t.aboutHeading}</h2>
            <p className="mt-2 max-w-[62ch] whitespace-pre-line text-[1rem] leading-relaxed text-ink-2">
              {summary}
            </p>
          </>
        )}

        {/*
         * Recording a role, which is the only way somebody comes to be running
         * this project. Offered only while the project is unarchived: the action
         * refuses it either way, and a control that could only fail is worse
         * than no control.
         */}
        {project.archivedOn === null && (
          <details className="mt-8">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-full bg-brand-orange px-5 text-[0.92rem] font-extrabold text-brand-orange-ink transition-colors hover:bg-brand-orange-dark">
              {t.addPersonCta}
            </summary>
            <div className="mt-4 rounded-2xl border border-line bg-surface p-4 sm:p-6">
              <h2 className="text-[1rem] font-extrabold">{t.addPersonHeading}</h2>
              <p className="mt-2 max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-2">
                {t.addPersonNote}
              </p>

              <form action={addProjectPersonAction} className="mt-5 space-y-5">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="projectId" value={project.id} />

                <div>
                  <label className={LABEL} htmlFor="person">
                    {t.personLabel}
                  </label>
                  <select id="person" name="userId" required defaultValue="" className={FIELD}>
                    <option value="" disabled>
                      {t.personNone}
                    </option>
                    {volunteers.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.full_name}
                      </option>
                    ))}
                  </select>
                  <p className={HINT}>{t.personHint}</p>
                </div>

                <div>
                  <label className={LABEL} htmlFor="person-titleAr">
                    {t.titleArLabel}
                  </label>
                  <input
                    id="person-titleAr"
                    name="titleAr"
                    type="text"
                    required
                    list="project-role-titles"
                    autoComplete="off"
                    className={FIELD}
                  />
                  {/* A datalist and not a select: the browser offers these and
                      accepts anything else, which is the entire point. There is
                      no fixed list of project role titles anywhere. */}
                  <datalist id="project-role-titles">
                    {titleOptions.map((title) => (
                      <option key={title} value={title} />
                    ))}
                  </datalist>
                  <p className={HINT}>{t.titleArHint}</p>
                </div>

                <div>
                  <label className={LABEL} htmlFor="person-titleEn">
                    {t.titleEnLabel}
                  </label>
                  <input
                    id="person-titleEn"
                    name="titleEn"
                    type="text"
                    dir="ltr"
                    className={`${FIELD} text-start`}
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="person-roleType">
                    {t.roleTypeLabel}
                  </label>
                  <input
                    id="person-roleType"
                    name="roleType"
                    type="text"
                    list="project-role-kinds"
                    autoComplete="off"
                    className={FIELD}
                  />
                  <datalist id="project-role-kinds">
                    {kindRows.map((row) => (
                      <option key={row.role_type} value={row.role_type} />
                    ))}
                  </datalist>
                  <p className={HINT}>{t.roleTypeHint}</p>
                </div>

                {/* One column on a phone, two from `sm` up. Nothing here has a
                    min-width, so 375px never produces a horizontal scrollbar. */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={LABEL} htmlFor="person-startedOn">
                      {t.roleStartLabel}
                    </label>
                    <input id="person-startedOn" name="startedOn" type="date" className={FIELD} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="person-startedPrec">
                      {t.precisionLabel}
                    </label>
                    <select
                      id="person-startedPrec"
                      name="startedPrec"
                      defaultValue="day"
                      className={FIELD}
                    >
                      <option value="day">{t.precision.day}</option>
                      <option value="month">{t.precision.month}</option>
                      <option value="year">{t.precision.year}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex min-h-11 items-center gap-3 text-[0.95rem] font-bold">
                    <input
                      name="isCurrent"
                      type="checkbox"
                      value="true"
                      defaultChecked
                      className="h-5 w-5 accent-brand-blue"
                    />
                    {t.currentLabel}
                  </label>
                  {/*
                   * AFTER the checkbox, and that order is load-bearing. An
                   * unticked checkbox posts nothing at all; the action reads
                   * formData.get(), which returns the FIRST entry in tree order,
                   * so ticked posts ['true','false'] and reads true while
                   * unticked posts ['false'] and reads false. Putting this line
                   * above the checkbox would make every role a past one.
                   */}
                  <input type="hidden" name="isCurrent" value="false" />
                  <p className={HINT}>{t.currentHint}</p>
                </div>

                <div>
                  <label className={LABEL} htmlFor="person-visibility">
                    {t.visibilityLabel}
                  </label>
                  <select
                    id="person-visibility"
                    name="visibility"
                    defaultValue="volunteers"
                    className={FIELD}
                  >
                    {/* The three values chk_vr_visibility permits, and nothing
                        about what the role is called. */}
                    <option value="public">{t.seenBy.public}</option>
                    <option value="volunteers">{t.seenBy.volunteers}</option>
                    <option value="staff">{t.seenBy.staff}</option>
                  </select>
                  <p className={HINT}>{t.visibilityHint}</p>
                </div>

                <button
                  type="submit"
                  className="min-h-11 w-full rounded-full bg-brand-blue px-6 py-2.5 text-[0.92rem] font-extrabold text-white transition-opacity hover:opacity-90 sm:w-auto"
                >
                  {t.addPersonSubmit}
                </button>
              </form>
            </div>
          </details>
        )}

        <h2 className="mt-10 text-[1.1rem] font-extrabold">{t.currentHeading}</h2>
        <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-ink-2">
          {t.currentLede}
        </p>
        {current.length === 0 ? (
          <p className="mt-3 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {people.length === 0 ? t.nobodyYet : t.currentEmpty}
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {current.map((entry) => (
              <Entry key={entry.role.id} lang={lang} entry={entry} showEnd t={t} />
            ))}
          </ul>
        )}

        {/*
         * «من تولّاه سابقاً» — the brief's «أحمد — المسؤول السابق للمشروع».
         *
         * The same rows as the list above, with an end date on them. There is no
         * project_manager_id on `projects` and no query here that could find
         * one: a person appears once for each period they served, and their
         * successor is an extra row rather than a replacement.
         */}
        <h2 className="mt-10 text-[1.1rem] font-extrabold">{t.pastHeading}</h2>
        <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-ink-2">{t.pastLede}</p>
        {past.length === 0 ? (
          <p className="mt-3 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.pastEmpty}
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {past.map((entry) => (
              <Entry key={entry.role.id} lang={lang} entry={entry} showEnd={false} t={t} />
            ))}
          </ul>
        )}

        <Link
          href={`/${lang}/staff/projects`}
          className="mt-10 inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {t.back}
        </Link>
      </Container>
    </Section>
  );
}
