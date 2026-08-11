import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured, queryOne } from '@/lib/db';
import { unreadCount } from '@/lib/notify';
import { logoutAction } from '@/lib/actions/account';

export async function generateMetadata(props: PageProps<'/[lang]/account'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.dashboard.title,
    alternates: alternatesFor(lang, '/account'),
    robots: { index: false, follow: false },
  };
}

const APPLICATION_OPEN = ['submitted', 'under_review', 'interview_required', 'interview_scheduled'];

export default async function AccountPage(props: PageProps<'/[lang]/account'>) {
  // Never prerender an account page: what it shows depends on who is asking.
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.dashboard;

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

  const unread = await unreadCount(user.id);

  const application = await queryOne<{ id: string; status: string; submitted_at: Date | null }>(
    `SELECT id, status, submitted_at FROM volunteer_applications
      WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [user.id],
  );

  const hasOpenApplication = application ? APPLICATION_OPEN.includes(application.status) : false;

  return (
    <Section>
      <Container className="max-w-3xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.greeting} {user.fullName}
        </h1>

        {/* Status is the one thing a volunteer always wants to see first. */}
        <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[0.78rem] font-bold tracking-[0.13em] text-ink-3">{t.statusLabel}</h2>
          <p className="mt-2 text-[1.35rem] font-extrabold text-brand-blue dark:text-brand-orange">
            {dict.account.statuses[user.membershipStatus]}
          </p>
          <h3 className="mt-5 text-[0.78rem] font-bold tracking-[0.13em] text-ink-3">{t.nextStep}</h3>
          <p className="mt-2 text-[1rem] leading-relaxed text-ink-2">
            {dict.account.nextSteps[user.membershipStatus]}
          </p>

          {!hasOpenApplication && (
            <Link
              href={`/${lang}/account/apply`}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark"
            >
              {t.applyCta}
            </Link>
          )}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-[1.05rem] font-extrabold">{t.coursesTitle}</h2>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{t.coursesLede}</p>
            <Link
              href={`/${lang}/academy`}
              className="mt-4 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
            >
              {t.coursesCta} →
            </Link>
          </div>

          {application && (
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-[1.05rem] font-extrabold">{t.applicationTitle}</h2>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">
                {hasOpenApplication ? t.applyPending : dict.account.apply.alreadyTitle}
              </p>
              {application.submitted_at && (
                <p className="mt-2 text-[0.88rem] text-ink-3" dir="ltr">
                  {new Date(application.submitted_at).toISOString().slice(0, 10)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Everything the portal can do, in one place. A volunteer should not
            have to remember a URL to reach their own hours. */}
        <nav className="mt-8 flex flex-wrap gap-3">
          {[
            { href: `/${lang}/account/journey`, label: dict.account.journey.title },
            { href: `/${lang}/account/hours`, label: dict.account.hours.title },
            { href: `/${lang}/account/activities`, label: dict.account.activities.mineTitle },
            { href: `/${lang}/opportunities`, label: dict.account.activities.title },
            {
              href: `/${lang}/account/notifications`,
              // The count sits in the label rather than a floating badge: it
              // survives text zoom and reads correctly to a screen reader.
              label:
                unread > 0
                  ? `${dict.account.notifications.title} (${unread})`
                  : dict.account.notifications.title,
            },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-line px-5 py-2.5 text-[0.92rem] font-bold transition-colors hover:bg-surface-2"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <form action={logoutAction} className="mt-8">
          <input type="hidden" name="lang" value={lang} />
          <button
            type="submit"
            className="rounded-full border border-line px-5 py-2.5 text-[0.92rem] font-bold text-ink-2 transition-colors hover:bg-surface-2"
          >
            {t.logout}
          </button>
        </form>
      </Container>
    </Section>
  );
}
