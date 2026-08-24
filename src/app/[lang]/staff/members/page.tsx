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

const PAGE_SIZE = 50;

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
  const { q } = await props.searchParams;
  const dict = getDictionary(lang);
  const t = dict.account.staff;
  const m = t.membersPage;

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
  const [rows, total] = await Promise.all([
    members(search, PAGE_SIZE),
    memberCount(search),
  ]);

  return (
    <Section>
      <Container className="max-w-6xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {m.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{m.lede}</p>

        <form method="get" className="mt-7 flex flex-wrap gap-3">
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
