import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import { members, memberCount } from '@/lib/admin';
import { formatDuration } from '@/lib/hours';
import { countPhrase } from '@/lib/when';
import { formatRolePeriod } from '@/lib/volunteer-role-view';
import {
  peopleWithRole,
  roleTitleSuggestions,
  viewerOf,
  type PersonWithRole,
  type VolunteerRole,
} from '@/lib/volunteer-roles';
import { roleSearch } from '@/lib/dictionaries/role-search';

const PAGE_SIZE = 50;

/*
 * ── SEARCHING BY ROLE, WHICH IS WHAT THE TABLE WAS BUILT FOR ────────────────
 *
 * Brief sections 44–45: "I want to find everyone who was once a committee
 * president. Or everyone who took charge of a project. Or every volunteer who
 * was part of the مسارك project." That sentence is why volunteer_roles is a
 * table of rows with dates rather than a `current_role TEXT` on the profile,
 * and this panel is the question finally being asked out loud.
 *
 * The query is peopleWithRole() in lib/volunteer-roles.ts and there is exactly
 * one of it. Nothing here re-filters, re-sorts or re-groups what it returns:
 * the visibility rule, the ILIKE against both title columns that the trigram
 * indexes from migration 046 exist to serve, and the ordering are all its, and
 * a second statement of any of them on this page is a statement that can drift.
 *
 * ── NO LIST OF TITLES REACHES THIS FILE ────────────────────────────────────
 *
 * There is no array of titles here, no <select> of the association's usual
 * responsibilities, and not one title written into a placeholder either — the
 * dictionary file argues it at length, and the shortest form of the argument is
 * that a title a developer types is a menu somebody else stops typing past.
 * The chips and the <datalist> below are whatever
 * roleTitleSuggestions() reads back out of the table this request, which is a
 * typeahead and never a permitted set: the box takes a word no chip shows.
 *
 * ── THE RESULTS ARE ROLES, AND NOBODY IS COUNTED ───────────────────────────
 *
 * peopleWithRole() returns ONE ROW PER MATCHING ROLE and deliberately does not
 * GROUP BY user_id. This page renders it that way: a volunteer who held two
 * matching roles gets two lines, each with its own title and its own period.
 *
 * Merging the two into one card would mean choosing which of a person's roles
 * leads — an ordering of their roles against each other — and would put a
 * visibly two-deep cluster under one name, which is a count of roles per person
 * drawn instead of written. `repeatNote` says so on the screen so the repeat
 * reads as two facts rather than as a bug. The only ordering is the one the
 * query applied, which is the role's own chronology.
 *
 * ── WHY THIS PANEL SITS ABOVE THE MEMBER TABLE ─────────────────────────────
 *
 * A plain GET form lands the browser at the top of the document. A search box
 * placed under fifty table rows would put its own results off-screen after
 * every single submit, on a phone especially. So the panel is first and the
 * member search below it keeps its structure exactly as it was.
 *
 * Two <form method="get"> on one screen would otherwise erase each other's
 * terms, so each carries the other's parameters as hidden inputs. Everything
 * stays in the URL: linkable, shareable, and back-button-safe, with no client
 * component anywhere on this route.
 */

/** How many matching roles one screen will show. Passed explicitly, never defaulted. */
const ROLE_MATCH_LIMIT = 100;

/** How many previously-used titles to offer. Read from the table, never written here. */
const SUGGESTION_LIMIT = 12;

export async function generateMetadata(props: PageProps<'/[lang]/staff/members'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.staff.membersPage.title,
    alternates: alternatesFor(lang, '/staff/members'),
    robots: { index: false, follow: false },
  };
}

export default async function StaffMembersPage(props: PageProps<'/[lang]/staff/members'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const { q, role, held } = await props.searchParams;
  const dict = getDictionary(lang);
  const t = dict.account.staff;
  const m = t.membersPage;
  const rs = roleSearch(lang);

  if (!isDbConfigured()) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {dict.account.errors.dbUnavailable}
          </p>
        </Container>
      </Section>
    );
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);
  if (!can(user, 'members.manage')) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.forbidden}
          </p>
        </Container>
      </Section>
    );
  }

  const search = typeof q === 'string' ? q : '';
  const rolePhrase = typeof role === 'string' ? role.trim() : '';
  /* Anything unreadable becomes 'any'. A hand-edited `held=` in the URL should
   * widen the answer rather than narrow it silently to the wrong half. */
  const heldFilter: 'current' | 'past' | 'any' =
    held === 'current' || held === 'past' ? held : 'any';

  /*
   * The viewer, stated. peopleWithRole() has no default and must not gain one —
   * a search is not a way around a role's visibility, and staff reading this
   * screen see exactly what visibleTo({kind:'staff'}) allows and no more.
   */
  const viewer = viewerOf(user);

  /* An empty box is not a request for the whole association. peopleWithRole()
   * refuses it too; short-circuiting here saves the round trip. */
  const matchesPromise: Promise<PersonWithRole[]> = rolePhrase
    ? peopleWithRole(rolePhrase, { viewer, held: heldFilter, limit: ROLE_MATCH_LIMIT })
    : Promise.resolve([]);

  const [rows, total, roleMatches, suggestions] = await Promise.all([
    members(search, PAGE_SIZE),
    memberCount(search),
    matchesPromise,
    /*
     * Read with an empty term rather than with `rolePhrase`, on purpose. Filtered
     * suggestions are empty exactly when the search found nothing — the moment
     * somebody most needs to be shown what the association actually calls things.
     * The `used` figure that comes back is a count of TITLES and is never
     * rendered: it orders this list and nothing else.
     */
    roleTitleSuggestions('', SUGGESTION_LIMIT),
  ]);

  /*
   * Suggestions group by (title_ar, title_en), so one Arabic title recorded
   * against two different English spellings arrives twice and would draw two
   * identical chips on the Arabic screen. De-duplicated on the label actually
   * shown, keeping the order the query gave.
   */
  const chips: string[] = [];
  for (const s of suggestions) {
    const label = (lang === 'ar' ? s.titleAr : s.titleEn.trim() || s.titleAr).trim();
    if (label && !chips.includes(label)) chips.push(label);
  }

  /** The whole screen's state as a URL. Every control is a link or a GET form. */
  const hrefFor = (nextRole: string) => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (nextRole) params.set('role', nextRole);
    if (heldFilter !== 'any') params.set('held', heldFilter);
    const qs = params.toString();
    return `/${lang}/staff/members${qs ? `?${qs}` : ''}`;
  };

  /** The title in the page's language, falling back to the Arabic. As the timeline. */
  const titleOf = (r: VolunteerRole) =>
    lang === 'ar' ? r.titleAr : r.titleEn.trim() || r.titleAr;

  /*
   * The other language's title, when there is a different one.
   *
   * Both title columns are searched, so an English screen can match on an Arabic
   * phrase and then show an English title that does not contain a word of what
   * was typed. Showing the other spelling underneath is what keeps the match
   * legible instead of looking like a wrong result.
   */
  const otherTitleOf = (r: VolunteerRole) => {
    const other = (lang === 'ar' ? r.titleEn : r.titleAr).trim();
    return other && other !== titleOf(r) ? other : null;
  };

  /* What the role was attached to. The KIND and not the id when it points at a
   * row: committees and projects are not all tables yet (migration 046), so
   * there is nothing to join for a name and a bare UUID is noise. */
  const entityOf = (r: VolunteerRole) => {
    if (!r.entity) return null;
    return 'name' in r.entity ? r.entity.name : r.entity.kind || null;
  };

  return (
    <Section>
      <Container className="max-w-6xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {m.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{m.lede}</p>

        {/* ---------------------------------------------------- search by role */}
        <section
          id="role-search"
          className="mt-7 rounded-2xl border border-line bg-surface-2 p-4 sm:p-6"
        >
          <h2 className="text-[1.15rem] font-extrabold">{rs.sectionTitle}</h2>
          <p className="mt-2 max-w-[62ch] text-[0.94rem] leading-relaxed text-ink-2">{rs.lede}</p>

          <form method="get" className="mt-5">
            {/* The member table's own term, carried so the two boxes on this
                screen do not wipe each other out on submit. */}
            {search && <input type="hidden" name="q" value={search} />}

            <label htmlFor="role-phrase" className="mb-1.5 block text-[0.9rem] font-bold">
              {rs.searchLabel}
            </label>
            <input
              id="role-phrase"
              name="role"
              type="search"
              defaultValue={rolePhrase}
              placeholder={rs.searchPlaceholder}
              /* The typeahead, from the table. It suggests and never constrains:
                 a <datalist> leaves the input free text, which is the whole
                 difference between this and the dropdown migration 046 refuses. */
              list="role-title-suggestions"
              className="min-h-11 w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
            />
            <datalist id="role-title-suggestions">
              {chips.map((label) => (
                <option key={label} value={label} />
              ))}
            </datalist>

            <label htmlFor="role-held" className="mt-4 mb-1.5 block text-[0.9rem] font-bold">
              {rs.heldLabel}
            </label>
            <select
              id="role-held"
              name="held"
              defaultValue={heldFilter}
              className="min-h-11 w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-brand-blue sm:max-w-sm"
            >
              <option value="any">{rs.heldAny}</option>
              <option value="current">{rs.heldCurrent}</option>
              <option value="past">{rs.heldPast}</option>
            </select>

            <button
              type="submit"
              className="mt-4 min-h-11 w-full rounded-full bg-brand-blue px-6 text-[0.95rem] font-extrabold text-white hover:bg-brand-blue-dark sm:w-auto"
            >
              {rs.searchGo}
            </button>
          </form>

          {rolePhrase === '' ? (
            <p className="mt-5 rounded-xl border border-line bg-surface px-4 py-3.5 text-[0.93rem] text-ink-2">
              {rs.prompt}
            </p>
          ) : roleMatches.length === 0 ? (
            <p className="mt-5 rounded-xl border border-line bg-surface px-4 py-3.5 text-[0.93rem] text-ink-2 break-words">
              {rs.noResults.replace('{q}', rolePhrase)}
            </p>
          ) : (
            <div className="mt-6">
              <h3 className="text-[1rem] font-extrabold">{rs.resultsHeading}</h3>
              {/* A count of MATCHING ROLES — the length of this one list. It is
                  never shown against a name, and there is no per-person figure
                  on this screen because the query produces none. */}
              <p className="mt-1 text-[0.92rem] font-bold text-ink-2">
                {countPhrase(roleMatches.length, rs.resultCount)}
              </p>
              <p className="mt-2 max-w-[62ch] text-[0.84rem] leading-relaxed text-ink-3">
                {rs.orderNote}
              </p>
              <p className="mt-1.5 max-w-[62ch] text-[0.84rem] leading-relaxed text-ink-3">
                {rs.repeatNote}
              </p>
              {roleMatches.length === ROLE_MATCH_LIMIT && (
                <p className="mt-1.5 text-[0.84rem] leading-relaxed text-ink-3">
                  {rs.capped.replace('{n}', String(ROLE_MATCH_LIMIT))}
                </p>
              )}

              {/* One <li> per matching ROLE, in the order peopleWithRole gave
                  them. Keyed by the role id, which is why a person appearing
                  twice is two well-formed lines rather than a key collision. */}
              <ol className="mt-4 space-y-3">
                {roleMatches.map(({ userId, fullName, role: match }) => {
                  const other = otherTitleOf(match);
                  const attachedTo = entityOf(match);
                  return (
                    <li
                      key={match.id}
                      /* `border-s-*`, so the rule marking a role somebody still
                         holds lands on the right in Arabic and the left in
                         English. Nothing carries a min-width: this list is a
                         single column at 375px and never scrolls the page. */
                      className={`rounded-2xl border border-line bg-surface p-4 ${
                        match.isCurrent ? 'border-s-4 border-s-brand-orange' : ''
                      }`}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
                        <Link
                          href={`/${lang}/staff/members/${userId}`}
                          title={rs.openProfile}
                          className="text-[1rem] font-extrabold break-words text-brand-blue hover:underline dark:text-brand-orange"
                        >
                          {/* LEFT JOIN: a missing profile row must not make a
                              role vanish, so the name can be empty. */}
                          {fullName.trim() || rs.nameMissing}
                        </Link>
                        <span
                          className={`rounded-full px-3 py-1 text-[0.78rem] font-extrabold ${
                            match.isCurrent
                              ? 'bg-brand-orange/15 text-brand-orange-text dark:text-brand-orange'
                              : 'bg-surface-2 text-ink-3'
                          }`}
                        >
                          {match.isCurrent ? rs.badgeCurrent : rs.badgePast}
                        </span>
                      </div>

                      {/* Free text in either language on a page in the other, so
                          the direction is resolved from the text itself. */}
                      <p className="mt-1.5 text-[0.96rem] font-bold break-words" dir="auto">
                        {titleOf(match)}
                      </p>
                      {other && (
                        <p className="mt-0.5 text-[0.84rem] text-ink-3 break-words" dir="auto">
                          {rs.alsoWritten.replace('{title}', other)}
                        </p>
                      )}

                      {/* «من كانون الثاني ٢٠٢٥ حتى الآن» / 'January 2025 – present'.
                          formatRolePeriod slices text and never builds a Date. */}
                      <p className="mt-1 text-[0.9rem] text-ink-2">
                        {formatRolePeriod(match, lang)}
                      </p>

                      {(match.roleType || attachedTo) && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {match.roleType && (
                            <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.8rem] font-bold break-words text-ink-2">
                              {rs.typeLabel}: {match.roleType}
                            </span>
                          )}
                          {attachedTo && (
                            <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.8rem] font-bold break-words text-ink-2">
                              {rs.entityLabel}: {attachedTo}
                            </span>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/*
           * What the association has actually called things, as links.
           *
           * Links and not buttons: each one is a whole URL for this screen, so a
           * suggestion can be shared, bookmarked and reached with the back
           * button, and none of it needs a line of JavaScript.
           */}
          <div className="mt-6 border-t border-line pt-5">
            <h3 className="text-[0.95rem] font-extrabold">{rs.suggestionsHeading}</h3>
            <p className="mt-1.5 max-w-[62ch] text-[0.85rem] leading-relaxed text-ink-3">
              {rs.suggestionsNote}
            </p>
            {chips.length === 0 ? (
              <p className="mt-3 text-[0.9rem] text-ink-2">{rs.suggestionsEmpty}</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {chips.map((label) => (
                  <li key={label} className="max-w-full">
                    <Link
                      href={hrefFor(label)}
                      dir="auto"
                      className="inline-flex min-h-11 max-w-full items-center rounded-full border border-line bg-surface px-4 text-start text-[0.86rem] font-bold break-words text-ink-2 transition-colors hover:bg-surface-2"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ------------------------------------------------- the member roster */}
        <form method="get" className="mt-8 flex flex-wrap gap-3">
          {/* The role search's state, carried for the same reason. */}
          {rolePhrase && <input type="hidden" name="role" value={rolePhrase} />}
          {heldFilter !== 'any' && <input type="hidden" name="held" value={heldFilter} />}
          <input
            name="q"
            type="search"
            defaultValue={search}
            placeholder={m.search}
            className="min-w-[16rem] flex-1 rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
          />
          <button
            type="submit"
            className="rounded-full bg-brand-blue px-6 py-3 text-[0.95rem] font-extrabold text-white hover:bg-brand-blue-dark"
          >
            {m.searchGo}
          </button>
        </form>

        <p className="mt-4 text-[0.9rem] text-ink-3">
          {m.showing} {rows.length} / {total}
        </p>

        {rows.length === 0 ? (
          <p className="mt-4 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {m.noResults}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[52rem] border-collapse bg-surface">
              <thead>
                <tr className="border-b border-line text-[0.82rem] font-bold tracking-[0.08em] text-ink-3">
                  <th className="px-4 py-3 text-start">{m.colName}</th>
                  <th className="px-4 py-3 text-start">{m.colStatus}</th>
                  <th className="px-4 py-3 text-start">{m.colRoles}</th>
                  <th className="px-4 py-3 text-start">{m.colHours}</th>
                  <th className="px-4 py-3 text-start">{m.colStage}</th>
                  <th className="px-4 py-3 text-start">{m.colJoined}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line/60 text-[0.93rem] last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/${lang}/staff/members/${r.id}`}
                        className="font-bold text-brand-blue hover:underline dark:text-brand-orange"
                      >
                        {r.full_name}
                      </Link>
                      <span className="block text-[0.82rem] text-ink-3" dir="ltr">
                        {r.email}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-2">
                      {r.membership_status
                        ? dict.account.statuses[
                            r.membership_status as keyof typeof dict.account.statuses
                          ] ?? r.membership_status
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-[0.85rem] text-ink-2">
                      {r.roles.filter((x) => x !== 'registered_user').join('، ') || m.noRoles}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDuration(Number.parseInt(r.verified_minutes, 10), lang)}
                    </td>
                    <td className="px-4 py-3">{r.stage ?? '—'}</td>
                    {/*
                      * The association's date first, the account's underneath
                      * and only where they differ.
                      *
                      * This showed created_at alone under a heading that says
                      * "joined", so a volunteer recognised from the roster
                      * after five years read as having arrived the day they
                      * signed up. Both are facts and staff need the first;
                      * keeping the second is what stops the fix hiding a
                      * different question — "why is this account so new" has
                      * an answer, and it belongs on the same row.
                      */}
                    <td className="px-4 py-3 whitespace-nowrap text-ink-2" dir="ltr">
                      {r.joined_on ? (
                        <>
                          <span className="font-bold">{r.joined_on}</span>
                          <span className="block text-[0.78rem] text-ink-3">
                            {m.accountSince} {new Date(r.created_at).toISOString().slice(0, 10)}
                          </span>
                        </>
                      ) : (
                        new Date(r.created_at).toISOString().slice(0, 10)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link
          href={`/${lang}/staff`}
          className="mt-8 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {t.dashboard.title}
        </Link>
      </Container>
    </Section>
  );
}
