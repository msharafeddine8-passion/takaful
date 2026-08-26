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
import { groupById, groupName, leadershipOf, membersOf } from '@/lib/org-groups';
import { roleTitleSuggestions, viewerOf, type PersonWithRole } from '@/lib/volunteer-roles';
import { formatRolePeriod } from '@/lib/volunteer-role-view';
import { addGroupMemberAction } from '@/lib/actions/org-groups';
import { endRoleAction } from '@/lib/actions/volunteer-roles';
import { orgGroups, isGroupError, type OrgGroupStrings } from '@/lib/dictionaries/org-groups';

/**
 * One committee or team: what it is, who holds a role in it, who held one
 * before, and «سجلّ القيادات».
 *
 * ── EVERY ROW ON THIS PAGE IS A volunteer_role ────────────────────────────
 *
 * The three lists below — current, past, and the leadership history — are the
 * same table read three ways. There is no committee_members table anywhere in
 * this codebase and this page could not read one if there were: membersOf() and
 * leadershipOf() both query `volunteer_roles WHERE entity_kind = 'group'`, and
 * the form that adds somebody calls the same createRole() the member page
 * calls. Migration 054's header argues why at length; the short version is that
 * a second table would be a second history of one fact, and one of the two
 * would always be the stale one.
 *
 * The leadership history is therefore not a feature that had to be built. It is
 * the same rows in date order, which is why appointing a successor here is
 * «تسجيل منصب» on the new holder plus «إنهاء» on the outgoing one — two rows,
 * both kept — and why there is no control on this page that writes one person's
 * name over another's.
 *
 * ── NOTHING HERE DERIVES A DATE, AN ORDER OR A VISIBILITY ─────────────────
 *
 * The period is `formatRolePeriod`, which slices text and never builds a Date:
 * the association is in Beirut, the session runs GMT, and a role starting
 * 2025-01-01 reads as كانون الأول ٢٠٢٤ the moment anything constructs one. The
 * two orderings are the ones the module applied, matching idx_vr_group; the
 * visibility filter was applied in SQL from visibleTo(viewer). This file
 * re-sorts nothing and re-filters nothing.
 *
 * ── AND IT COUNTS NOBODY ──────────────────────────────────────────────────
 *
 * No "12 members", no ordering of people by anything but the dates on their own
 * rows, and no figure that could be compared with another group's. The two
 * queries produce none.
 */

export const metadata: Metadata = { robots: { index: false, follow: false } };

const PILL =
  'inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line' +
  ' bg-surface-2 px-4 text-[0.88rem] font-extrabold text-ink-2 transition-colors hover:bg-surface';

const FIELD =
  'min-h-11 w-full rounded-xl border border-line bg-ground px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue';

const LABEL = 'mb-1.5 block text-[0.88rem] font-bold';

const HINT = 'mt-1.5 text-[0.82rem] leading-relaxed text-ink-3';

/* A group id is a UUID. Validated rather than handed to Postgres as text: an id
   of the wrong shape is a stale or guessed link, and it should read as "not
   found" rather than as a 500 from a failed cast. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The role's title in the page's language, falling back to the Arabic. */
function titleOf(entry: PersonWithRole, lang: Locale): string {
  if (lang === 'ar') return entry.role.titleAr;
  return entry.role.titleEn.trim() || entry.role.titleAr;
}

/**
 * One person and the role that puts them here.
 *
 * The name links to their own staff page, because "who is this?" is the next
 * question somebody asks and the answer is a whole record rather than a row.
 * `fullName` may be '' when the profile row is missing — the LEFT JOIN in
 * membersOf keeps the role visible rather than dropping it — so the title
 * carries the line and the link still works.
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
  t: OrgGroupStrings;
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
              <input
                id={`end-date-${entry.role.id}`}
                name="endedOn"
                type="date"
                className={FIELD}
              />
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

export default async function StaffGroupPage(props: PageProps<'/[lang]/staff/groups/[id]'>) {
  await connection();
  const { lang, id } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = orgGroups(lang);

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

  const group = UUID.test(id) ? await groupById(id) : null;
  if (!group) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {t.notFound}
        </p>
        <Link
          href={`/${lang}/staff/groups`}
          className="mt-6 inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {t.back}
        </Link>
      </Container></Section>
    );
  }

  const params = await props.searchParams;
  const asked = String(params.error ?? '');
  const problem = isGroupError(asked) ? asked : null;

  /*
   * The viewer is passed rather than assumed. Both reads filter in SQL against
   * visibleTo(viewer) — the same function rolesFor() binds on a profile page —
   * so a role marked 'staff' is readable here by exactly the people who can
   * read it there, and this page states the rule nowhere.
   */
  const viewer = viewerOf(user);

  const [members, leadership, people, titleSuggestions, kindRows, parent] = await Promise.all([
    membersOf(group.id, viewer),
    /* The same rows, ordered as a chronology rather than current-first. Two
     * cheap reads of idx_vr_group rather than one array sorted twice, so the
     * ordering each list shows is the ordering the database produced. */
    leadershipOf(group.id, viewer),
    /*
     * Who a role can be recorded against. Ordered by name and by nothing else:
     * no count, no ranking, no "most active volunteer first". Capped, because a
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
    /* Titles used before, as a TYPEAHEAD and never a permitted set — the same
     * function the member page calls, and the head of migration 046 says why
     * the distinction is the whole feature. */
    roleTitleSuggestions('', 30),
    query<{ role_type: string }>(
      `SELECT DISTINCT role_type FROM volunteer_roles
        WHERE archived_at IS NULL AND role_type IS NOT NULL AND btrim(role_type) <> ''
        ORDER BY role_type
        LIMIT 50`,
    ),
    group.parentId ? groupById(group.parentId) : Promise.resolve(null),
  ]);

  const current = members.filter((entry) => entry.role.isCurrent);
  const past = members.filter((entry) => !entry.role.isCurrent);
  const description = lang === 'ar' ? group.descriptionAr : group.descriptionEn;

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
          {groupName(group, lang)}
        </h1>

        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[0.78rem] font-extrabold ${
              group.isActive
                ? 'bg-brand-orange/15 text-brand-orange-text dark:text-brand-orange'
                : 'bg-surface-2 text-ink-3'
            }`}
          >
            {group.isActive ? t.activeBadge : t.concludedBadge}
          </span>
          {group.kind && (
            <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.78rem] font-bold text-ink-2 break-words">
              {t.kindBadge}: {group.kind}
            </span>
          )}
          {parent && (
            <Link
              href={`/${lang}/staff/groups/${parent.id}`}
              className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.78rem] font-bold text-brand-blue break-words hover:bg-surface dark:text-brand-orange"
            >
              {t.parentBadge}: {groupName(parent, lang)}
            </Link>
          )}
        </div>

        {group.archivedOn !== null && (
          <p className="mt-5 rounded-xl border-2 border-warn bg-warn/10 px-5 py-3.5 text-[0.93rem] leading-relaxed text-ink-2">
            <span dir="ltr">{t.archivedOn.replace('{date}', group.archivedOn)}</span>
            {group.archiveReason ? ` · ${t.archivedReason}: ${group.archiveReason}` : ''}
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

        {description && (
          <>
            <h2 className="mt-8 text-[1.1rem] font-extrabold">{t.aboutHeading}</h2>
            <p className="mt-2 max-w-[62ch] whitespace-pre-line text-[1rem] leading-relaxed text-ink-2">
              {description}
            </p>
          </>
        )}

        {/*
         * Recording a role, which is the only way somebody comes to be in a
         * committee. Offered only while the group is unarchived: the action
         * refuses it either way, and a control that could only fail is worse
         * than no control.
         */}
        {group.archivedOn === null && (
          <details className="mt-8">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-full bg-brand-orange px-5 text-[0.92rem] font-extrabold text-brand-orange-ink transition-colors hover:bg-brand-orange-dark">
              {t.addMemberCta}
            </summary>
            <div className="mt-4 rounded-2xl border border-line bg-surface p-4 sm:p-6">
              <h2 className="text-[1rem] font-extrabold">{t.addMemberHeading}</h2>
              <p className="mt-2 max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-2">
                {t.addMemberNote}
              </p>

              <form action={addGroupMemberAction} className="mt-5 space-y-5">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="groupId" value={group.id} />

                <div>
                  <label className={LABEL} htmlFor="member-person">
                    {t.personLabel}
                  </label>
                  <select id="member-person" name="userId" required defaultValue="" className={FIELD}>
                    <option value="" disabled>
                      {t.personNone}
                    </option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.full_name}
                      </option>
                    ))}
                  </select>
                  <p className={HINT}>{t.personHint}</p>
                </div>

                <div>
                  <label className={LABEL} htmlFor="member-titleAr">
                    {t.titleArLabel}
                  </label>
                  <input
                    id="member-titleAr"
                    name="titleAr"
                    type="text"
                    required
                    list="group-role-titles"
                    autoComplete="off"
                    className={FIELD}
                  />
                  {/* A datalist and not a select: the browser offers these and
                      accepts anything else, which is the entire point. */}
                  <datalist id="group-role-titles">
                    {titleOptions.map((title) => (
                      <option key={title} value={title} />
                    ))}
                  </datalist>
                  <p className={HINT}>{t.titleArHint}</p>
                </div>

                <div>
                  <label className={LABEL} htmlFor="member-titleEn">
                    {t.titleEnLabel}
                  </label>
                  <input
                    id="member-titleEn"
                    name="titleEn"
                    type="text"
                    dir="ltr"
                    className={`${FIELD} text-start`}
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="member-roleType">
                    {t.roleTypeLabel}
                  </label>
                  <input
                    id="member-roleType"
                    name="roleType"
                    type="text"
                    list="group-role-kinds"
                    autoComplete="off"
                    className={FIELD}
                  />
                  <datalist id="group-role-kinds">
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
                    <label className={LABEL} htmlFor="member-startedOn">
                      {t.startLabel}
                    </label>
                    <input id="member-startedOn" name="startedOn" type="date" className={FIELD} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="member-startedPrec">
                      {t.precisionLabel}
                    </label>
                    <select
                      id="member-startedPrec"
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
                  <label className={LABEL} htmlFor="member-visibility">
                    {t.visibilityLabel}
                  </label>
                  <select
                    id="member-visibility"
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
                  {t.addMemberSubmit}
                </button>
              </form>
            </div>
          </details>
        )}

        <h2 className="mt-10 text-[1.1rem] font-extrabold">{t.currentHeading}</h2>
        {current.length === 0 ? (
          <p className="mt-3 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {members.length === 0 ? t.nobodyYet : t.currentEmpty}
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {current.map((entry) => (
              <Entry key={entry.role.id} lang={lang} entry={entry} showEnd t={t} />
            ))}
          </ul>
        )}

        <h2 className="mt-10 text-[1.1rem] font-extrabold">{t.pastHeading}</h2>
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

        {/*
         * «سجلّ القيادات» — section 43 of the brief.
         *
         * The same rows as the two lists above, in date order. There is no
         * current_president_id on org_groups and no query here that could find
         * one: a person appears once for each period they served, and the entry
         * above them is their successor rather than their replacement.
         */}
        <h2 className="mt-12 text-[1.1rem] font-extrabold">{t.leadershipHeading}</h2>
        <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-ink-2">
          {t.leadershipLede}
        </p>

        {leadership.length === 0 ? (
          <p className="mt-4 max-w-[62ch] rounded-xl border border-line bg-surface-2 px-5 py-4 leading-relaxed text-ink-2">
            {t.leadershipEmpty}
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {leadership.map((entry) => (
              <li
                key={entry.role.id}
                className="rounded-2xl border border-line bg-surface-2 p-4 sm:p-5"
              >
                {/* The period first, because this list is read as a chronology:
                    «٢٠٢٦ محمد ٢٠٢٥ أحمد ٢٠٢٤ سارة». One column at 375px. */}
                <p className="text-[0.9rem] font-extrabold text-ink-3">
                  {formatRolePeriod(entry.role, lang)}
                </p>
                <p className="mt-1 text-[1rem] font-extrabold break-words">
                  {titleOf(entry, lang)}
                </p>
                <Link
                  href={`/${lang}/staff/members/${entry.userId}`}
                  className="mt-1 inline-block min-h-11 py-2 font-bold break-words text-brand-blue hover:underline dark:text-brand-orange"
                >
                  {entry.fullName || t.openPerson}
                </Link>
              </li>
            ))}
          </ol>
        )}

        <Link
          href={`/${lang}/staff/groups`}
          className="mt-10 inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {t.back}
        </Link>
      </Container>
    </Section>
  );
}
