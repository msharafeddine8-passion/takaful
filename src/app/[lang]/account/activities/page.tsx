import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { myActivities, scheduledMinutes, type MyActivityRow } from '@/lib/activities';
import { formatDuration } from '@/lib/hours';
import { leaveActivityAction } from '@/lib/actions/activities';

export async function generateMetadata(props: PageProps<'/[lang]/account/activities'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.activities.mineTitle,
    alternates: alternatesFor(lang, '/account/activities'),
    robots: { index: false, follow: false },
  };
}

export default async function MyActivitiesPage(props: PageProps<'/[lang]/account/activities'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.activities;

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

  const rows = await myActivities(user.id);
  const now = Date.now();

  const cancelled = rows.filter((r) => r.registration_status === 'cancelled');
  const live = rows.filter((r) => r.registration_status !== 'cancelled');
  const upcoming = live.filter((r) => !r.ends_at || new Date(r.ends_at).getTime() > now);
  const past = live.filter((r) => r.ends_at && new Date(r.ends_at).getTime() <= now);

  return (
    <Section>
      <Container className="max-w-3xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.mineTitle}
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.mineLede}</p>

        {rows.length === 0 ? (
          <div className="mt-8">
            <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
              {t.mineNone}
            </p>
            <Link
              href={`/${lang}/opportunities`}
              className="mt-4 inline-block rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
            >
              {t.title} →
            </Link>
          </div>
        ) : (
          <>
            <Group title={t.upcoming} rows={upcoming} lang={lang} dict={dict} canLeave />
            <Group title={t.past} rows={past} lang={lang} dict={dict} />
            <Group title={t.cancelled} rows={cancelled} lang={lang} dict={dict} muted />
          </>
        )}

        <Link
          href={`/${lang}/account`}
          className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {dict.account.hours.backToAccount}
        </Link>
      </Container>
    </Section>
  );
}

function Group({
  title, rows, lang, dict, canLeave = false, muted = false,
}: {
  title: string;
  rows: MyActivityRow[];
  lang: Locale;
  dict: Dictionary;
  canLeave?: boolean;
  muted?: boolean;
}) {
  const t = dict.account.activities;
  if (rows.length === 0) return null;

  return (
    <section className="mt-9">
      <h2 className="text-[0.8rem] font-bold tracking-[0.12em] text-ink-3">{title}</h2>
      <ul className={`mt-3 space-y-3 ${muted ? 'opacity-60' : ''}`}>
        {rows.map((a) => {
          const minutes = a.attended_minutes ?? scheduledMinutes(a);
          return (
            <li key={a.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-[1.05rem] font-extrabold">
                  {lang === 'ar' ? a.title_ar : a.title_en}
                </h3>
                {a.starts_at && (
                  <p className="text-[0.85rem] text-ink-3" dir="ltr">
                    {new Date(a.starts_at).toISOString().slice(0, 10)}
                  </p>
                )}
              </div>

              {a.location && <p className="mt-1 text-[0.9rem] text-ink-2">📍 {a.location}</p>}

              <p className="mt-2.5 text-[0.92rem]">
                {a.registration_status === 'waitlisted' && (
                  <span className="font-bold text-ink-2">{t.onWaitlist}</span>
                )}
                {/* Attendance is the honest signal here: registered-but-absent
                    should not read the same as attended. */}
                {a.attended === true && (
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    ✅ {t.attended}
                    {minutes ? ` — ${formatDuration(minutes, lang)}` : ''}
                  </span>
                )}
                {a.attended === false && (
                  <span className="font-bold text-ink-3">{t.noShow}</span>
                )}
                {a.attended === null && a.registration_status === 'registered' && (
                  <span className="text-ink-3">{t.awaitingAttendance}</span>
                )}
              </p>

              {canLeave && a.registration_status !== 'cancelled' && (
                <form action={leaveActivityAction} className="mt-3">
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="activityId" value={a.id} />
                  <button
                    type="submit"
                    className="text-[0.88rem] font-bold text-red-600 hover:underline dark:text-red-400"
                  >
                    {t.leave}
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
