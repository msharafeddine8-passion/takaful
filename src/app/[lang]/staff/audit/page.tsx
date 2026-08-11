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
import { auditLog, auditActions } from '@/lib/admin';

export async function generateMetadata(props: PageProps<'/[lang]/staff/audit'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.staff.audit.title,
    alternates: alternatesFor(lang, '/staff/audit'),
    robots: { index: false, follow: false },
  };
}

export default async function StaffAuditPage(props: PageProps<'/[lang]/staff/audit'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const { action } = await props.searchParams;
  const dict = getDictionary(lang);
  const t = dict.account.staff;
  const a = t.audit;

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

  // The audit log records what staff did, so reading it is the narrowest
  // capability in the system.
  if (!can(user, 'audit.read')) {
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

  const filter = typeof action === 'string' ? action : '';
  const [rows, actions] = await Promise.all([auditLog(200, filter), auditActions()]);

  return (
    <Section>
      <Container className="max-w-5xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {a.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{a.lede}</p>

        <form method="get" className="mt-7 flex flex-wrap gap-3">
          <select
            name="action"
            defaultValue={filter}
            className="rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-brand-blue"
          >
            <option value="">{a.filterAll}</option>
            {actions.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold hover:bg-surface-2"
          >
            {t.membersPage.searchGo}
          </button>
        </form>

        {rows.length === 0 ? (
          <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {a.empty}
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[48rem] border-collapse bg-surface">
              <thead>
                <tr className="border-b border-line text-[0.78rem] font-bold tracking-[0.08em] text-ink-3">
                  <th className="px-4 py-3 text-start">{a.colWhen}</th>
                  <th className="px-4 py-3 text-start">{a.colWho}</th>
                  <th className="px-4 py-3 text-start">{a.colAction}</th>
                  <th className="px-4 py-3 text-start">{a.colTarget}</th>
                  <th className="px-4 py-3 text-start">{a.colReason}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line/60 text-[0.9rem] last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap text-ink-3" dir="ltr">
                      {new Date(r.created_at).toISOString().slice(0, 16).replace('T', ' ')}
                    </td>
                    {/* A null actor is the system, not an unknown person. */}
                    <td className="px-4 py-3">{r.actor_name ?? a.system}</td>
                    <td className="px-4 py-3 font-mono text-[0.85rem]" dir="ltr">
                      {r.action}
                    </td>
                    <td className="px-4 py-3 text-ink-3" dir="ltr">
                      {r.target_type ?? '—'}
                    </td>
                    <td className="max-w-[22rem] px-4 py-3 text-ink-2">{r.reason ?? '—'}</td>
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
