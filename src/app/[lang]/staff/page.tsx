import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can, isStaff } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import { overview } from '@/lib/admin';
import { formatDuration } from '@/lib/hours';

export async function generateMetadata(props: PageProps<'/[lang]/staff'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.staff.dashboard.title,
    alternates: alternatesFor(lang, '/staff'),
    robots: { index: false, follow: false },
  };
}

export default async function StaffHomePage(props: PageProps<'/[lang]/staff'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.staff;
  const d = t.dashboard;

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

  if (!isStaff(user)) {
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

  const o = await overview();
  const waiting = o.applicationsOpen + o.hoursPending;

  return (
    <Section>
      <Container className="max-w-5xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {d.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{d.lede}</p>

        {/* What needs a decision comes first. Everything else is context. */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <QueueCard
            href={`/${lang}/staff/applications`}
            label={d.goApplications}
            count={o.applicationsOpen}
            caption={d.applicationsOpen}
            urgent={o.applicationsOpen > 0}
            show={can(user, 'applications.review')}
          />
          <QueueCard
            href={`/${lang}/staff/hours`}
            label={d.goHours}
            count={o.hoursPending}
            caption={`${d.hoursPending} · ${formatDuration(o.hoursPendingMinutes, lang)}`}
            urgent={o.hoursPending > 0}
            show={can(user, 'hours.verify')}
          />
        </div>

        {waiting === 0 && (
          <p className="mt-4 rounded-xl border border-line bg-surface-2 px-5 py-3.5 text-ink-2">
            {d.nothingWaiting}
          </p>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label={d.members} value={String(o.members)} />
          <Stat label={d.volunteers} value={String(o.volunteers)} />
          <Stat label={d.newThisMonth} value={String(o.newThisMonth)} />
          <Stat label={d.verifiedHours} value={formatDuration(o.verifiedMinutes, lang)} />
          <Stat label={d.coursesPassed} value={String(o.coursesPassed)} />
          <Stat label={d.certificates} value={String(o.certificates)} />
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {can(user, 'members.manage') && (
            <Link
              href={`/${lang}/staff/members`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {d.goMembers}
            </Link>
          )}
          {can(user, 'activities.manage') && (
            <Link
              href={`/${lang}/staff/activities`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {dict.account.activities.manageTitle}
            </Link>
          )}
          {can(user, 'members.manage') && (
            <Link
              href={`/${lang}/staff/journey`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {t.journeyBuilder.title}
            </Link>
          )}
          {can(user, 'reports.read') && (
            <Link
              href={`/${lang}/staff/reports`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {dict.account.reports.title}
            </Link>
          )}
          {can(user, 'audit.read') && (
            <Link
              href={`/${lang}/staff/audit`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {d.goAudit}
            </Link>
          )}
        </div>
      </Container>
    </Section>
  );
}

function QueueCard({
  href,
  label,
  count,
  caption,
  urgent,
  show,
}: {
  href: string;
  label: string;
  count: number;
  caption: string;
  urgent: boolean;
  show: boolean;
}) {
  if (!show) return null;
  return (
    <Link
      href={href as Parameters<typeof Link>[0]['href']}
      className={`block rounded-2xl border p-6 transition-transform hover:-translate-y-0.5 ${
        urgent
          ? 'border-brand-orange bg-brand-orange/10'
          : 'border-line bg-surface'
      }`}
    >
      <p className="text-[0.8rem] font-bold tracking-[0.12em] text-ink-3">{caption}</p>
      <p className="mt-2 text-[2.2rem] font-extrabold leading-none">{count}</p>
      <p className="mt-3 font-bold text-brand-blue dark:text-brand-orange">{label} →</p>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-[0.78rem] font-bold tracking-[0.12em] text-ink-3">{label}</p>
      <p className="mt-1.5 text-[1.5rem] font-extrabold">{value}</p>
    </div>
  );
}
