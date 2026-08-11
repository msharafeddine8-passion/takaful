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
import { grantRoleAction, revokeRoleAction, awardStageAction } from '@/lib/actions/members';
import { issueHoursCertificateAction } from '@/lib/actions/certificates';

export const metadata: Metadata = { robots: { index: false, follow: false } };

const GRANTABLE: Role[] = [
  'volunteer', 'team_leader', 'instructor', 'field_supervisor',
  'project_coordinator', 'content_manager', 'program_admin', 'super_admin',
];

export default async function MemberPage(props: PageProps<'/[lang]/staff/members/[id]'>) {
  await connection();
  const { lang, id } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.staff;
  const mm = t.member;

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

  const person = await queryOne<{ full_name: string; email: string; created_at: Date }>(
    `SELECT p.full_name, u.email, u.created_at
       FROM users u JOIN profiles p ON p.user_id = u.id WHERE u.id = $1`,
    [id],
  );
  if (!person) notFound();

  const [roles, stages, minutes, entries, certs] = await Promise.all([
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
          <form action={awardStageAction} className="mt-4 flex flex-wrap gap-3">
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
