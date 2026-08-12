import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import {
  entriesFor,
  verifiedMinutes,
  pendingMinutes,
  currentStage,
  openActivities,
  formatDuration,
  type HourStatus,
} from '@/lib/hours';
import { HoursForm } from '@/components/account/HoursForm';

export async function generateMetadata(props: PageProps<'/[lang]/account/hours'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.hours.title,
    alternates: alternatesFor(lang, '/account/hours'),
    robots: { index: false, follow: false },
  };
}

const STATUS_STYLES: Record<HourStatus, string> = {
  pending: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
  verified: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
  rejected: 'bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200',
  corrected: 'bg-surface-2 text-ink-2',
};

export default async function HoursPage(props: PageProps<'/[lang]/account/hours'>) {
  // Never prerender: what this shows depends on who is asking.
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.hours;

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

  const [verified, pending, stage, activities, entries] = await Promise.all([
    verifiedMinutes(user.id),
    pendingMinutes(user.id),
    currentStage(user.id),
    openActivities(),
    entriesFor(user.id),
  ]);

  const statusLabel: Record<HourStatus, string> = {
    pending: t.statusPending,
    verified: t.statusVerified,
    rejected: t.statusRejected,
    corrected: t.statusCorrected,
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[60ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-[0.82rem] font-bold tracking-[0.13em] text-ink-3">{t.verifiedLabel}</p>
            <p className="mt-1.5 text-[1.6rem] font-extrabold text-brand-blue dark:text-brand-orange">
              {formatDuration(verified, lang)}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-[0.82rem] font-bold tracking-[0.13em] text-ink-3">{t.pendingLabel}</p>
            <p className="mt-1.5 text-[1.6rem] font-extrabold">{formatDuration(pending, lang)}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-[0.82rem] font-bold tracking-[0.13em] text-ink-3">{t.stageLabel}</p>
            <p className="mt-1.5 text-[1.6rem] font-extrabold">
              {stage === 0 ? (
                <span className="text-[1.05rem] font-bold text-ink-2">{t.notStarted}</span>
              ) : (
                <>
                  {stage} <span className="text-[0.95rem] font-bold text-ink-2">{t.stageOf}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[1.1rem] font-extrabold">{t.logTitle}</h2>
          <HoursForm
            lang={lang}
            dict={dict}
            today={today}
            activities={activities.map((a) => ({
              id: a.id,
              title: lang === 'ar' ? a.title_ar : a.title_en,
            }))}
          />
        </div>

        <h2 className="mt-10 text-[1.1rem] font-extrabold">{t.historyTitle}</h2>
        {entries.length === 0 ? (
          <p className="mt-3 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">{t.empty}</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[34rem] border-collapse bg-surface text-start">
              <thead>
                <tr className="border-b border-line text-[0.8rem] font-bold tracking-[0.08em] text-ink-3">
                  <th className="px-4 py-3 text-start">{t.colDate}</th>
                  <th className="px-4 py-3 text-start">{t.colActivity}</th>
                  <th className="px-4 py-3 text-start">{t.colDuration}</th>
                  <th className="px-4 py-3 text-start">{t.colStatus}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-line/60 last:border-0 text-[0.95rem]">
                    <td className="px-4 py-3 whitespace-nowrap" dir="ltr">
                      {new Date(e.worked_on).toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-ink-2">
                      {(lang === 'ar' ? e.activity_title_ar : e.activity_title_en) ?? '—'}
                      {e.corrects_id && (
                        <span className="ms-2 text-[0.8rem] text-ink-3">({t.correctionOf})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold">
                      {formatDuration(e.minutes, lang)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[0.8rem] font-bold ${STATUS_STYLES[e.status]}`}
                      >
                        {statusLabel[e.status]}
                      </span>
                      {e.status === 'rejected' && e.reject_reason && (
                        <p className="mt-1 text-[0.82rem] leading-relaxed text-ink-2">{e.reject_reason}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link
          href={`/${lang}/account`}
          className="mt-8 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {t.backToAccount}
        </Link>
      </Container>
    </Section>
  );
}
