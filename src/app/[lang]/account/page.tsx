import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured, queryOne } from '@/lib/db';
import { isStaff } from '@/lib/authz';
import { portalSummary } from '@/lib/portal';
import { formatDuration } from '@/lib/hours';
import { COURSES } from '@/lib/courses';
import { logoutAction } from '@/lib/actions/account';
import { VerifyBanner } from '@/components/account/VerifyBanner';
import { isEmailConfigured } from '@/lib/email';

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
  const p = dict.account.portal;

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

  const [summary, application, account] = await Promise.all([
    portalSummary(user.id),
    queryOne<{ id: string; status: string; submitted_at: Date | null }>(
      `SELECT id, status, submitted_at FROM volunteer_applications
        WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [user.id],
    ),
    queryOne<{ verified: Date | null }>(
      'SELECT email_verified_at AS verified FROM users WHERE id = $1',
      [user.id],
    ),
  ]);

  const hasOpenApplication = application ? APPLICATION_OPEN.includes(application.status) : false;
  const journey = summary.journey;
  const stage = journey?.currentStage ?? null;
  const next = journey?.nextAction ?? null;

  return (
    <Section>
      <Container className="max-w-3xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {p.greeting} {user.fullName} 👋
        </h1>

        {account && !account.verified && (
          <VerifyBanner lang={lang} dict={dict} emailConfigured={isEmailConfigured()} />
        )}

        {/* Where they stand, in one line, before anything else. */}
        {stage ? (
          <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
            <p className="text-[0.95rem] text-ink-2">
              {p.youAreIn}{' '}
              <span className="font-extrabold text-ink">
                {p.stage} {stage.number} — {lang === 'ar' ? stage.titleAr : stage.titleEn}
              </span>
            </p>
            {/* A stage nobody has configured computes as 100% — nought of
                nought required items met — and telling a volunteer they have
                finished a stage that was never defined is worse than telling
                them nothing. */}
            {stage.isConfigured && (
              <>
                <div
                  className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface-2"
                  role="progressbar"
                  aria-valuenow={stage.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={lang === 'ar' ? stage.titleAr : stage.titleEn}
                >
                  <div
                    className="h-full rounded-full bg-brand-orange"
                    style={{ width: `${stage.percent}%` }}
                  />
                </div>
                <p className="mt-2 text-[0.88rem] font-bold text-ink-2">{stage.percent}%</p>
              </>
            )}
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-line bg-surface p-6 text-[1rem] leading-relaxed text-ink-2">
            {p.learnerNote}
          </p>
        )}

        {/* One next step. Not fifteen cards someone has to triage. */}
        <div className="mt-5 rounded-2xl border-2 border-brand-orange bg-brand-orange/10 p-6">
          <p className="text-[0.78rem] font-extrabold tracking-[0.13em] text-brand-orange-text dark:text-brand-orange">
            {p.nextStepTitle}
          </p>
          {next ? (
            <>
              <p className="mt-2 text-[1.15rem] font-extrabold">
                {lang === 'ar' ? next.requirement.labelAr : next.requirement.labelEn}
              </p>
              <NextLink lang={lang} dict={dict} req={next.requirement} />
            </>
          ) : hasOpenApplication ? (
            <p className="mt-2 text-[1.02rem] leading-relaxed">{t.applyPending}</p>
          ) : !journey ? (
            <>
              <p className="mt-2 text-[1.02rem] leading-relaxed">{t.nextStep}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/${lang}/academy`}
                  className="rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
                >
                  {t.coursesCta} →
                </Link>
                <Link
                  href={`/${lang}/account/apply`}
                  className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold hover:bg-surface-2"
                >
                  {t.applyCta}
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-2 text-[1.02rem] leading-relaxed">{p.nothingNext}</p>
          )}
        </div>

        {/* Four figures. Enough to feel progress, few enough to read at a glance. */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label={p.summaryHours}
            value={formatDuration(summary.verifiedMinutes, lang)}
            note={
              summary.pendingMinutes > 0
                ? p.pendingNote.replace('{n}', formatDuration(summary.pendingMinutes, lang))
                : undefined
            }
          />
          <Stat label={p.summaryCourses} value={`${summary.coursesPassed} / ${summary.coursesTotal}`} />
          <Stat label={p.summaryActivities} value={String(summary.activitiesAttended)} />
          <Stat label={p.summaryCertificates} value={String(summary.certificates)} />
        </div>

        {summary.nextActivity && (
          <Panel title={p.upcomingTitle}>
            <p className="text-[1.05rem] font-extrabold">
              {lang === 'ar' ? summary.nextActivity.title_ar : summary.nextActivity.title_en}
            </p>
            <p className="mt-1.5 text-[0.92rem] text-ink-2" dir="ltr">
              {summary.nextActivity.starts_at &&
                new Date(summary.nextActivity.starts_at).toISOString().slice(0, 16).replace('T', ' ')}
              {summary.nextActivity.location ? ` · ${summary.nextActivity.location}` : ''}
            </p>
            <Arrow href={`/${lang}/account/activities`} label={dict.account.activities.mineTitle} />
          </Panel>
        )}

        {summary.coursesInProgress && (
          <Panel title={p.continueLearningTitle}>
            <p className="text-[1.05rem] font-extrabold">
              {COURSES.find((c) => c.slug === summary.coursesInProgress!.slug)?.title[lang] ??
                summary.coursesInProgress.slug}
            </p>
            <Arrow
              href={`/${lang}/academy/${summary.coursesInProgress.slug}`}
              label={p.continueCta}
            />
          </Panel>
        )}

        {summary.latestCertificateCode && (
          <Panel title={p.latestCertificate}>
            <p className="font-mono text-[1.05rem] font-bold tracking-wider" dir="ltr">
              {summary.latestCertificateCode}
            </p>
            <Arrow
              href={`/${lang}/certificates/${summary.latestCertificateCode}`}
              label={dict.account.certificate.view}
            />
          </Panel>
        )}

        <nav className="mt-8 flex flex-wrap gap-3">
          {[
            journey ? { href: `/${lang}/account/journey`, label: dict.account.journey.title } : null,
            { href: `/${lang}/account/learning`, label: dict.account.learning.title },
            { href: `/${lang}/account/achievements`, label: dict.account.achievements.title },
            { href: `/${lang}/account/hours`, label: dict.account.hours.title },
            { href: `/${lang}/account/activities`, label: dict.account.activities.mineTitle },
            { href: `/${lang}/opportunities`, label: dict.account.activities.title },
            { href: `/${lang}/account/certificates`, label: dict.account.certificate.myCertificates },
            { href: `/${lang}/account/profile`, label: dict.account.profile.title },
            journey ? { href: `/${lang}/account/card`, label: dict.account.card.title } : null,
            {
              href: `/${lang}/account/notifications`,
              // The count sits in the label rather than a floating badge: it
              // survives text zoom and reads correctly to a screen reader.
              label:
                summary.unreadNotifications > 0
                  ? `${dict.account.notifications.title} (${summary.unreadNotifications})`
                  : dict.account.notifications.title,
            },
            isStaff(user) ? { href: `/${lang}/staff`, label: dict.account.staff.dashboard.title } : null,
          ]
            .filter((l) => l !== null)
            .map((l) => (
              <Link
                key={l.href}
                href={l.href as Parameters<typeof Link>[0]['href']}
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

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-[0.75rem] font-bold tracking-[0.11em] text-ink-3">{label}</p>
      <p className="mt-1.5 text-[1.35rem] font-extrabold">{value}</p>
      {note && <p className="mt-1 text-[0.8rem] text-ink-3">{note}</p>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-[0.78rem] font-bold tracking-[0.12em] text-ink-3">{title}</h2>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function Arrow({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href as Parameters<typeof Link>[0]['href']}
      className="mt-3 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
    >
      {label} →
    </Link>
  );
}

function NextLink({
  lang, dict, req,
}: {
  lang: Locale;
  dict: Dictionary;
  req: { kind: string; courseSlug: string | null };
}) {
  const j = dict.account.journey;
  const href = req.courseSlug
    ? `/${lang}/academy/${req.courseSlug}`
    : req.kind === 'hours'
      ? `/${lang}/opportunities`
      : null;
  if (!href) return null;

  return (
    <Link
      href={href as Parameters<typeof Link>[0]['href']}
      className="mt-4 inline-block rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
    >
      {req.courseSlug ? j.goToCourse : dict.account.activities.title} →
    </Link>
  );
}
