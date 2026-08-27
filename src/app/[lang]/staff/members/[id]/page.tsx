import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser, type Role } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured, query, queryOne } from '@/lib/db';
import { entriesFor, verifiedMinutes, formatDuration } from '@/lib/hours';
import { certificatesFor } from '@/lib/certificates';
import { journeyFor } from '@/lib/journey';
import {
  grantRoleAction,
  revokeRoleAction,
  awardStageAction,
  suspendMemberAction,
  reactivateMemberAction,
  pauseMemberAction,
} from '@/lib/actions/members';
import { issueHoursCertificateAction } from '@/lib/actions/certificates';
import { ConfirmSubmit } from '@/components/staff/ConfirmSubmit';
import { CarriedHoursForm, RecogniseCourseForm } from '@/components/staff/PriorCreditForms';
import { COURSES } from '@/lib/courses';
import { memberProfile } from '@/lib/dictionaries/member-profile';
import { volunteerRoleStrings } from '@/lib/dictionaries/volunteer-roles';
import {
  rolesFor,
  roleForAdmin,
  roleTitleSuggestions,
  viewerOf,
} from '@/lib/volunteer-roles';
import { VolunteerRoles, type ArchivedRole } from '@/components/staff/VolunteerRoles';
import { groupName, groups } from '@/lib/org-groups';
import { allProjects, projectName } from '@/lib/projects';
import { projectsAdmin } from '@/lib/dictionaries/projects-admin';
import { adminProfile } from '@/lib/dictionaries/admin-profile';
import { notesAbout } from '@/lib/admin-notes';
import { fieldDefs, valuesFor } from '@/lib/profile-fields';
import { AdminNotes, type ArchivedNote } from '@/components/staff/AdminNotes';
import { ProfileFieldValues } from '@/components/staff/ProfileFieldValues';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/*
 * Jobs, not standing. 'volunteer' is deliberately not on this list.
 *
 * It used to be, and pressing it did not do what it looked like it did. A row
 * went into user_roles and nothing else moved — `is_volunteer()` reads the
 * membership history, not the roles — so the page then showed "volunteer"
 * against somebody who still could not register for a single activity. It
 * happened to a real person: an administrator pressed it twenty-seven minutes
 * after they signed up, and the account sat there looking approved and
 * behaving as though it were not.
 *
 * Volunteer standing comes from the two paths that set the status and the role
 * together, each recording who decided and why: recognising a roster line in
 * /staff/roster, or accepting an application in /staff/applications. This page
 * hands out the jobs a volunteer can hold on top of that.
 */
const GRANTABLE: Role[] = [
  'team_leader', 'instructor', 'field_supervisor',
  'project_coordinator', 'content_manager', 'program_admin', 'super_admin',
];

export default async function MemberPage(props: PageProps<'/[lang]/staff/members/[id]'>) {
  await connection();
  const { lang, id } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.staff;
  const mm = t.member;
  const pr = t.prior;
  /* Only courses whose content exists — recognising a course nobody can open
   * would leave a certificate pointing at a page that says "coming soon". */
  const courseChoices = COURSES
    .filter((c) => c.status === 'available')
    .map((c) => ({ slug: c.slug, title: c.title[lang] }));

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
  if (!can(user, 'members.manage')) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">{t.forbidden}</p>
      </Container></Section>
    );
  }

  const person = await queryOne<{
    full_name: string;
    email: string;
    created_at: Date;
    status: string;
    /* The membership standing, which is a different fact from users.status:
     * the first says whether somebody may take part, the second whether the
     * account is open at all. Pausing moves the first and leaves the second
     * alone, so this page needs both to know which control to offer. */
    membership_status: string | null;
  }>(
    /* joined_on is the association's date and created_at is the account's.
     * They are the same only for somebody who signed up today; for the
     * volunteers recognised from the roster the second is weeks old and the
     * first is years old, and this is the page decisions get made on. */
    `SELECT p.full_name, u.email, u.created_at, u.status,
            (SELECT to_char(r.joined_on, 'YYYY-MM-DD') FROM volunteer_roster r
              WHERE r.claimed_by = u.id AND r.approved_at IS NOT NULL LIMIT 1) AS joined_on,
            (SELECT h.new_status FROM membership_status_history h
              WHERE h.user_id = u.id
              ORDER BY h.changed_at DESC, h.id DESC LIMIT 1) AS membership_status
       FROM users u JOIN profiles p ON p.user_id = u.id WHERE u.id = $1`,
    [id],
  );
  if (!person) notFound();

  const [roles, stages, minutes, entries, certs, journey] = await Promise.all([
    query<{ id: string; role: string; valid_until: Date | null }>(
      `SELECT id::TEXT, role, valid_until FROM user_roles
        WHERE user_id = $1 AND (valid_until IS NULL OR valid_until > now())
        ORDER BY role`,
      [id],
    ),
    query<{ stage: number; reached_at: Date }>(
      'SELECT stage, reached_at FROM stage_progress WHERE user_id = $1 ORDER BY stage',
      [id],
    ),
    verifiedMinutes(id),
    entriesFor(id, 20),
    certificatesFor(id),
    // Null for a learner, which is a normal state rather than a gap.
    journeyFor(id),
  ]);

  /*
   * What this person has BEEN in the association, which is a different subject
   * from what they may DO in the software — migration 046 is explicit about it,
   * and `roles` above is the other one. Read in its own block so the split
   * stays visible.
   *
   * Three of these four are the module's, and they do all the work: rolesFor
   * applies the visibility rule and the current-first ordering that matches
   * idx_vr_person, roleTitleSuggestions reads back the titles that have been
   * used before as a TYPEAHEAD and never a permitted set, and roleForAdmin maps
   * an archived row with the same date handling as a live one.
   *
   * The fourth is the one query this page owns: which of a person's rows are
   * archived, why, and when. lib/volunteer-roles.ts deliberately has no
   * archived-list reader — every function there filters archives out — so the
   * ids are collected here and handed back to roleForAdmin rather than mapped a
   * second time. archived_at is a TIMESTAMPTZ, so it takes the Beirut
   * correction; started_on and ended_on are DATEs and must never be given one.
   */
  const [roleTimeline, titleSuggestions, kindRows, archivedRows, liveGroups, liveProjects] = await Promise.all([
    rolesFor(id, viewerOf(user)),
    roleTitleSuggestions('', 30),
    query<{ role_type: string }>(
      `SELECT DISTINCT role_type FROM volunteer_roles
        WHERE archived_at IS NULL AND role_type IS NOT NULL AND btrim(role_type) <> ''
        ORDER BY role_type
        LIMIT 50`,
    ),
    query<{ id: string; archive_reason: string | null; archived_on: string }>(
      `SELECT id, archive_reason,
              to_char(archived_at AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD') AS archived_on
         FROM volunteer_roles
        WHERE user_id = $1 AND archived_at IS NOT NULL
        ORDER BY archived_at DESC`,
      [id],
    ),
    /*
     * The committees and teams a role may be attached to, since migration 054
     * made them rows. Offered by the form BESIDE the free-text box and never in
     * place of it — a role for something with no row anywhere has to stay
     * recordable, which is the whole reason entity_kind is free text.
     *
     * Archived groups are left out (the default), because a role should not be
     * newly attached to a row that has been withdrawn. A role already pointing
     * at one keeps its link: VolunteerRoleForm falls back to the read-only
     * branch when the list cannot represent what a role points at.
     */
    groups({ includeInactive: true }),
    /*
     * And the projects, since migration 055 made them rows too. Same rule, same
     * reason: offered BESIDE the free-text box and never in place of it.
     *
     * Unpublished projects are included on purpose — a project not yet on the
     * public site is still a project somebody is running, and refusing to record
     * that until it launches is exactly the developer-shaped delay this feature
     * exists to remove. Archived ones are left out (the default), because a role
     * should not be newly attached to a row that has been withdrawn.
     */
    allProjects(),
  ]);

  /*
   * Names resolved here, in this page's language, so that nothing from the
   * 'server-only' org-groups and projects modules reaches the client component
   * below. `kind` is what the role's entity_kind will be written as, and
   * `section` is the <optgroup> heading — the picker is one select with two
   * headings, because a role has one entity.
   */
  const entityChoices = [
    ...liveGroups.map((group) => ({
      kind: 'group',
      id: group.id,
      label: groupName(group, lang),
      section: projectsAdmin(lang).roleForm.groupsOptgroup,
    })),
    ...liveProjects.map((project) => ({
      kind: 'project',
      id: project.id,
      label: projectName(project, lang),
      section: projectsAdmin(lang).roleForm.projectsOptgroup,
    })),
  ];

  const archivedRoles: ArchivedRole[] = (
    await Promise.all(
      archivedRows.map(async (row) => {
        const role = await roleForAdmin(row.id);
        return role
          ? { role, reason: row.archive_reason, archivedOn: row.archived_on }
          : null;
      }),
    )
  ).filter((entry): entry is ArchivedRole => entry !== null);

  /*
   * The private file and the association's own columns.
   *
   * Three of these four are the modules': notesAbout takes ONE argument and it
   * is the subject — lib/admin-notes.ts has no reader that takes a viewer, and
   * that absence is what keeps "the subject never reads their own notes" a
   * property of the code rather than of this page. fieldDefs() returns the live
   * definitions in the order the forms show them, and valuesFor() filters the
   * answers in SQL against `user`'s own audience rather than fetching everything
   * and declining to render some of it.
   *
   * The fourth is the one query this page owns: which notes are archived, and
   * when. admin-notes.ts deliberately has no archived-list reader — its exported
   * surface is four functions and probe-admin-profile asserts exactly that — so
   * the drawer's rows are read here, the same way the archived roles above are.
   * archived_at and created_at are TIMESTAMPTZ and take the Beirut correction;
   * nothing downstream rebuilds a Date from the text they produce.
   */
  const [notes, archivedNotes, customDefs, customAnswers] = await Promise.all([
    notesAbout(id),
    query<{
      id: string;
      body: string;
      author_name: string | null;
      written_on: string;
      archived_on: string;
    }>(
      /* Aliases snake_case and unquoted, like every other query on this page:
       * Postgres folds an unquoted alias to lower case, so `AS writtenOn` would
       * arrive as `writtenon` and read as undefined. The mapping is below.
       *
       * LEFT JOIN and one column from profiles, matching notesAbout — a missing
       * profile row must not make a note vanish, and a convenience SELECT would
       * put profiles_sensitive one careless JSX line from a screen. */
      `SELECT n.id, n.body, a.full_name AS author_name,
              to_char(n.created_at  AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD') AS written_on,
              to_char(n.archived_at AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD') AS archived_on
         FROM admin_notes n
         LEFT JOIN profiles a ON a.user_id = n.author_id
        WHERE n.user_id = $1 AND n.archived_at IS NOT NULL
        ORDER BY n.archived_at DESC`,
      [id],
    ),
    fieldDefs(),
    valuesFor(id, user),
  ]);

  const archivedNoteList: ArchivedNote[] = archivedNotes.map((row) => ({
    id: row.id,
    body: row.body,
    // '' rather than the id, exactly as toNote does. A UUID on a screen is
    // noise that looks like data.
    authorName: row.author_name ?? '',
    writtenOn: row.written_on,
    archivedOn: row.archived_on,
  }));

  const held = new Set(roles.map((r) => r.role));
  const heldStages = new Set(stages.map((s) => s.stage));
  const isSelf = user.id === id;

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.6rem,1.3rem+1.4vw,2.2rem)] font-extrabold tracking-tight">
          {person.full_name}
        </h1>
        <p className="mt-1.5 text-ink-3" dir="ltr">{person.email}</p>
        <p className="mt-1 text-[0.9rem] text-ink-3">
          {formatDuration(minutes, lang)} · {t.membersPage.colHours}
        </p>

        {/* The whole record, read-only, in one place. This page keeps the
            buttons; the file answers the questions that used to take six pages
            to answer, and it is linked from the top because that is where
            somebody arrives already wondering. */}
        <Link
          href={`/${lang}/staff/members/${id}/profile`}
          className="mt-4 inline-block rounded-full border border-line bg-surface px-5 py-2.5 text-[0.9rem] font-extrabold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {memberProfile(lang).title} →
        </Link>

        {/* The database refuses a self-grant, so saying so is honest rather
            than decorative: the buttons below genuinely would not work. */}
        {isSelf && (
          <p className="mt-5 rounded-xl border border-warn bg-warn/10 px-5 py-3.5 text-[0.93rem] text-ink-2">
            {mm.selfNote}
          </p>
        )}

        <section className="mt-8 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[1.1rem] font-extrabold">{mm.accessTitle}</h2>
          <p
            className={`mt-2 inline-block rounded-full px-3.5 py-1.5 text-[0.85rem] font-extrabold ${
              person.status === 'active'
                ? 'bg-ok/15 text-ok'
                : person.status === 'suspended'
                  ? 'bg-danger/12 text-danger'
                  : 'bg-surface-2 text-ink-3'
            }`}
          >
            {person.status === 'active'
              ? mm.accessActive
              : person.status === 'suspended'
                ? mm.accessSuspended
                : mm.accessDeactivated}
          </p>

          {/* Not offered for a closed account. Someone who left is a
              conversation, not a button. */}
          {!isSelf && person.status === 'active' && (
            <form action={suspendMemberAction} className="mt-4">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="userId" value={id} />
              <p className="mb-3 max-w-[58ch] text-[0.9rem] leading-relaxed text-ink-2">
                {mm.suspendNote}
              </p>
              <label htmlFor="suspend-reason" className="mb-1.5 block text-[0.88rem] font-bold">
                {mm.reasonLabel}
              </label>
              <input
                id="suspend-reason"
                name="reason"
                type="text"
                required
                minLength={3}
                placeholder={mm.reasonPlaceholder}
                className="w-full max-w-[34rem] rounded-xl border border-line bg-ground px-4 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
              />
              {/* The one action here that takes effect against a person the
                  instant it is clicked. Reversible, but the volunteer has
                  already been signed out of whatever they were doing. */}
              <ConfirmSubmit
                message={mm.confirmSuspend.replace('{name}', person.full_name)}
                className="mt-3 block rounded-full bg-danger px-6 py-2.5 text-[0.92rem] font-extrabold text-white hover:opacity-90"
              >
                {mm.suspend}
              </ConfirmSubmit>
              <p className="mt-2.5 text-[0.82rem] text-ink-3">{mm.lastAdminNote}</p>
            </form>
          )}

          {/*
            * Pausing, which is neither suspension nor a description.
            *
            * `on_hold` is a decision — a volunteer asked for a break, or a
            * question about them is being looked at. The account stays open
            * and the sessions stay alive; is_volunteer() simply stops
            * returning true, so taking part stops on its own and nothing here
            * has to remember to block anything.
            *
            * Offered beside suspension rather than on a screen of its own,
            * because the moment somebody is choosing between the two is the
            * only moment the difference matters.
            */}
          {!isSelf && person.status === 'active' && person.membership_status !== 'on_hold' && (
            <form action={pauseMemberAction} className="mt-6 border-t border-line pt-5">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="userId" value={id} />
              <p className="mb-3 max-w-[58ch] text-[0.9rem] leading-relaxed text-ink-2">
                {mm.pauseNote}
              </p>
              <label htmlFor="pause-reason" className="mb-1.5 block text-[0.88rem] font-bold">
                {mm.reasonLabel}
              </label>
              <input
                id="pause-reason"
                name="reason"
                type="text"
                required
                minLength={10}
                placeholder={mm.pauseReasonPlaceholder}
                className="w-full max-w-[34rem] rounded-xl border border-line bg-ground px-4 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
              />
              <button
                type="submit"
                className="mt-3 block min-h-11 rounded-full border-2 border-line px-6 py-2.5 text-[0.92rem] font-extrabold hover:bg-surface-2"
              >
                {mm.pause}
              </button>
            </form>
          )}

          {!isSelf && person.membership_status === 'on_hold' && (
            <form action={pauseMemberAction} className="mt-6 border-t border-line pt-5">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="userId" value={id} />
              <input type="hidden" name="resume" value="yes" />
              <p className="mb-3 max-w-[58ch] text-[0.9rem] leading-relaxed text-ink-2">
                {mm.resumeNote}
              </p>
              <label htmlFor="resume-reason" className="mb-1.5 block text-[0.88rem] font-bold">
                {mm.reasonLabel}
              </label>
              <input
                id="resume-reason"
                name="reason"
                type="text"
                required
                minLength={10}
                className="w-full max-w-[34rem] rounded-xl border border-line bg-ground px-4 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
              />
              <button
                type="submit"
                className="mt-3 block min-h-11 rounded-full bg-brand-blue px-6 py-2.5 text-[0.92rem] font-extrabold text-white hover:opacity-90"
              >
                {mm.resume}
              </button>
            </form>
          )}

          {person.status === 'suspended' && (
            <form action={reactivateMemberAction} className="mt-4">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="userId" value={id} />
              <p className="mb-3 max-w-[58ch] text-[0.9rem] leading-relaxed text-ink-2">
                {mm.reactivateNote}
              </p>
              <label htmlFor="reactivate-reason" className="mb-1.5 block text-[0.88rem] font-bold">
                {mm.reasonLabel}
              </label>
              <input
                id="reactivate-reason"
                name="reason"
                type="text"
                required
                minLength={3}
                placeholder={mm.reasonPlaceholder}
                className="w-full max-w-[34rem] rounded-xl border border-line bg-ground px-4 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
              />
              <button
                type="submit"
                className="mt-3 block rounded-full bg-brand-orange px-6 py-2.5 text-[0.92rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
              >
                {mm.reactivate}
              </button>
            </form>
          )}
        </section>

        <h2 className="mt-9 text-[1.1rem] font-extrabold">{mm.roles}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {roles.length === 0 && <span className="text-ink-3">—</span>}
          {roles.map((r) => (
            <form key={r.id} action={revokeRoleAction} className="inline">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="roleId" value={r.id} />
              <input type="hidden" name="userId" value={id} />
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[0.88rem] font-bold">
                {r.role}
                {r.role !== 'registered_user' && (
                  <button type="submit" className="text-danger-text hover:underline">
                    {mm.revokeRole}
                  </button>
                )}
              </span>
            </form>
          ))}
        </div>

        {!isSelf && (
          <form action={grantRoleAction} className="mt-4 flex flex-wrap gap-3">
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="userId" value={id} />
            <select
              name="role"
              className="rounded-xl border border-line bg-surface px-4 py-2.5 outline-none focus:border-brand-blue"
            >
              {GRANTABLE.filter((r) => !held.has(r)).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-full bg-brand-blue px-5 py-2.5 text-[0.9rem] font-extrabold text-white hover:bg-brand-blue-dark"
            >
              {mm.grant}
            </button>
          </form>
        )}

        <h2 className="mt-10 text-[1.1rem] font-extrabold">{mm.journeyTitle}</h2>
        <p className="mt-1.5 max-w-[58ch] text-[0.9rem] leading-relaxed text-ink-3">
          {mm.journeyLede}
        </p>

        {/* A row of numbered circles said which stages were awarded and
            nothing about why the person is standing still. This says what is
            actually missing, which is the only thing a coordinator can act
            on. */}
        {journey === null ? (
          <p className="mt-4 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {mm.noJourney}
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {journey.stages.map((s) => {
              const state = s.completedAt
                ? { label: mm.stageDone, tone: 'bg-ok/15 text-ok' }
                : journey.currentStage?.number === s.number
                  ? { label: mm.stageCurrent, tone: 'bg-brand-orange/15 text-brand-orange-text dark:text-brand-orange' }
                  : { label: mm.stageLocked, tone: 'bg-surface-2 text-ink-3' };
              const unmet = s.requirements.filter((r) => r.isRequired && !r.satisfied);

              return (
                <li key={s.number} className="rounded-2xl border border-line bg-surface p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-extrabold">
                      {s.number} — {lang === 'ar' ? s.titleAr : s.titleEn}
                    </h3>
                    {/* No percentage for a stage nobody has configured. Nought
                        of nought required items is arithmetically 100% and
                        reads as "finished", which it is not. */}
                    <span className={`rounded-full px-3 py-1 text-[0.82rem] font-extrabold ${state.tone}`}>
                      {s.isConfigured ? `${state.label} · ${s.percent}%` : state.label}
                    </span>
                  </div>

                  {!s.isConfigured && (
                    <p className="mt-2 text-[0.86rem] text-ink-3">{mm.notConfigured}</p>
                  )}

                  {s.requirements.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-[0.9rem]">
                      {s.requirements.map((r) => (
                        <li key={r.id} className="flex flex-wrap items-baseline gap-2">
                          <span
                            className={r.satisfied ? 'font-bold text-ok' : 'font-bold text-ink-3'}
                            aria-label={r.satisfied ? mm.requirementMet : mm.requirementUnmet}
                          >
                            {r.satisfied ? '✓' : '○'}
                          </span>
                          <span className={r.satisfied ? 'text-ink-3 line-through' : 'text-ink-2'}>
                            {lang === 'ar' ? r.labelAr : r.labelEn}
                          </span>
                          {r.progress && !r.satisfied && (
                            <span className="text-[0.82rem] font-bold text-ink-3" dir="ltr">
                              {r.progress.unit === 'minutes'
                                ? `${formatDuration(r.progress.current, lang)} / ${formatDuration(r.progress.target, lang)}`
                                : `${r.progress.current} / ${r.progress.target}`}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {unmet.length > 0 && !s.completedAt && (
                    <p className="mt-3 text-[0.86rem] font-bold text-ink-3">
                      {mm.blockedBy}:{' '}
                      {unmet.map((r) => (lang === 'ar' ? r.labelAr : r.labelEn)).join('، ')}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        <h2 className="mt-10 text-[1.1rem] font-extrabold">{mm.stages}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <span
              key={s}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-[0.95rem] font-extrabold ${
                heldStages.has(s)
                  ? 'bg-brand-orange text-[#241503]'
                  : 'border border-line text-ink-3'
              }`}
            >
              {s}
            </span>
          ))}
        </div>

        {!isSelf && can(user, 'stages.award') && heldStages.size < 6 && (
          <>
            <p className="mt-4 max-w-[58ch] text-[0.86rem] leading-relaxed text-ink-3">
              {mm.overrideNote}
            </p>
            <form action={awardStageAction} className="mt-3 flex flex-wrap gap-3">
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="userId" value={id} />
            <select
              name="stage"
              className="rounded-xl border border-line bg-surface px-4 py-2.5 outline-none focus:border-brand-blue"
            >
              {[1, 2, 3, 4, 5, 6].filter((s) => !heldStages.has(s)).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              name="note"
              placeholder={t.reasonLabel}
              className="min-w-[14rem] flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 outline-none focus:border-brand-blue"
            />
            <button
              type="submit"
              className="rounded-full bg-brand-blue px-5 py-2.5 text-[0.9rem] font-extrabold text-white hover:bg-brand-blue-dark"
            >
              {mm.award}
            </button>
            </form>
          </>
        )}

        <h2 className="mt-10 text-[1.1rem] font-extrabold">{mm.certificatesTitle}</h2>
        {certs.length === 0 ? (
          <p className="mt-3 text-ink-3">{mm.noCertificates}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {certs.map((c) => (
              <li key={c.id} className="rounded-xl border border-line bg-surface px-4 py-3">
                <span className="font-mono font-bold tracking-wider" dir="ltr">{c.code}</span>
                <span className="ms-3 text-ink-2">
                  {lang === 'ar' ? c.snapshot.titleAr : c.snapshot.titleEn}
                </span>
                {c.revoked_at && (
                  <span className="ms-3 font-bold text-danger-text">{mm.revoked}</span>
                )}
              </li>
            ))}
          </ul>
        )}

        {can(user, 'certificates.issue') && minutes > 0 && (
          <form action={issueHoursCertificateAction} className="mt-4">
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="userId" value={id} />
            <button
              type="submit"
              className="rounded-full bg-brand-orange px-5 py-2.5 text-[0.9rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
            >
              {mm.issueHoursCert}
            </button>
          </form>
        )}

        {/*
          * What this person has been inside the association, with dates.
          *
          * Placed after the certificates and before the carried-forward panel,
          * which is where the client's own description puts it: the record of
          * the person first, then the corrections staff make to it.
          *
          * `canManage` is true here by construction — the page returned
          * `t.forbidden` above for anybody without members.manage — and it is
          * passed anyway rather than hardcoded, so that the section stays
          * honest if this page is ever opened to a reader who cannot write.
          */}
        <VolunteerRoles
          lang={lang}
          userId={id}
          roles={roleTimeline}
          archived={archivedRoles}
          titleSuggestions={titleSuggestions}
          kindSuggestions={kindRows.map((r) => r.role_type)}
          entityChoices={entityChoices}
          entityText={projectsAdmin(lang).roleForm}
          canManage={can(user, 'members.manage')}
          t={volunteerRoleStrings(lang)}
        />

        {/*
          * The private file, under the roles it belongs beside.
          *
          * `canManage` is true here by construction — the page returned
          * `t.forbidden` above for anybody without members.manage, which is the
          * same capability the three note actions assert — and it is passed
          * rather than hardcoded so the section stays honest if this page is
          * ever opened to a reader who cannot write.
          *
          * The two warnings the schema cannot hold are in the component, beside
          * the box somebody types into: the volunteer never reads these, and a
          * safeguarding concern goes to safeguarding_records instead.
          */}
        <AdminNotes
          lang={lang}
          userId={id}
          notes={notes}
          archived={archivedNoteList}
          canManage={can(user, 'members.manage')}
          t={adminProfile(lang).notes}
        />

        {/*
          * The association's own columns, filled in for this person.
          *
          * The definitions are declared in /staff/profile-fields behind
          * challenges.manage; filling one in for somebody is editing that
          * person's record, so it sits here behind members.manage — which is
          * exactly the split setFieldValuesAction makes.
          */}
        <ProfileFieldValues
          lang={lang}
          userId={id}
          defs={customDefs}
          answers={customAnswers}
          canManage={can(user, 'members.manage')}
          t={adminProfile(lang).values}
        />

        {/*
          * What the association knows and this platform never saw.
          *
          * Placed with the hours and the stages rather than in a page of its
          * own, because it is the same job: a member of staff correcting what
          * the record says about a person. Both forms demand a reason, and
          * both mark what they write as carried forward so a report can always
          * separate it from what happened here.
          */}
        {can(user, 'hours.verify') || can(user, 'stages.award') ? (
          <section className="mt-12 rounded-2xl border border-line bg-surface-2 p-6">
            <h2 className="text-[1.1rem] font-extrabold">{pr.title}</h2>
            <p className="mt-2 max-w-[64ch] text-[0.94rem] leading-relaxed text-ink-2">{pr.lede}</p>

            {can(user, 'hours.verify') && (
              <div className="mt-6">
                <h3 className="text-[0.95rem] font-extrabold">{pr.hoursHeading}</h3>
                <CarriedHoursForm lang={lang} userId={id} t={pr} />
              </div>
            )}

            {can(user, 'stages.award') && (
              <div className="mt-8">
                <h3 className="text-[0.95rem] font-extrabold">{pr.courseHeading}</h3>
                <RecogniseCourseForm lang={lang} userId={id} courses={courseChoices} t={pr} />
              </div>
            )}
          </section>
        ) : null}

        <h2 className="mt-10 text-[1.1rem] font-extrabold">{mm.hoursTitle}</h2>
        {entries.length === 0 ? (
          <p className="mt-3 text-ink-3">{dict.account.hours.empty}</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[30rem] border-collapse bg-surface text-[0.92rem]">
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-2.5 whitespace-nowrap text-ink-3" dir="ltr">
                      {/* Text from the query, not a Date — see HourEntry.worked_on. */}
                      {e.worked_on}
                    </td>
                    <td className="px-4 py-2.5 font-semibold">{formatDuration(e.minutes, lang)}</td>
                    <td className="px-4 py-2.5 text-ink-2">{e.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link
          href={`/${lang}/staff/members`}
          className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {mm.back}
        </Link>
      </Container>
    </Section>
  );
}
