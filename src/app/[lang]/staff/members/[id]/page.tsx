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
} from '@/lib/actions/members';
import { issueHoursCertificateAction } from '@/lib/actions/certificates';
import { ConfirmSubmit } from '@/components/staff/ConfirmSubmit';
import { CarriedHoursForm, RecogniseCourseForm } from '@/components/staff/PriorCreditForms';
import { COURSES } from '@/lib/courses';

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
  }>(
    `SELECT p.full_name, u.email, u.created_at, u.status
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

        {/* The database refuses a self-grant, so saying so is honest rather
            than decorative: the buttons below genuinely would not work. */}
        {isSelf && (
          <p className="mt-5 rounded-xl border border-amber-400 bg-amber-50 px-5 py-3.5 text-[0.93rem] text-ink-2 dark:border-amber-800 dark:bg-amber-950/30">
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
                  <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
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
                  <span className="ms-3 font-bold text-red-600 dark:text-red-400">{mm.revoked}</span>
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
                      {new Date(e.worked_on).toISOString().slice(0, 10)}
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
