import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import {
  funnel,
  stageStandings,
  courseStandings,
  monthlyHours,
  attendanceStanding,
  stalledVolunteers,
} from '@/lib/analytics';
import { COURSES } from '@/lib/courses';
import { formatDuration } from '@/lib/hours';

export async function generateMetadata(props: PageProps<'/[lang]/staff/reports'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.reports.title,
    alternates: alternatesFor(lang, '/staff/reports'),
    robots: { index: false, follow: false },
  };
}

export default async function ReportsPage(props: PageProps<'/[lang]/staff/reports'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.reports;

  if (!isDbConfigured()) {
    return (
      <Section>
        <Container>
          <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {dict.account.errors.dbUnavailable}
          </p>
        </Container>
      </Section>
    );
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);
  if (!can(user, 'reports.read')) notFound();

  const [steps, stages, courses, hours, attendance, quiet] = await Promise.all([
    funnel(),
    stageStandings(),
    courseStandings(),
    monthlyHours(12),
    attendanceStanding(),
    stalledVolunteers(),
  ]);

  const top = steps[0]?.count ?? 0;
  const peak = Math.max(1, ...hours.map((h) => h.minutes));
  const stepLabel: Record<string, string> = {
    registered: t.registered,
    learning: t.learning,
    passed: t.passedCourse,
    applied: t.applied,
    accepted: t.accepted,
    contributing: t.contributing,
  };

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{dict.account.staff.dashboard.title}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        <Panel title={t.funnelTitle} lede={t.funnelLede}>
          <ol className="space-y-3">
            {steps.map((step, i) => {
              const previous = i === 0 ? null : steps[i - 1].count;
              // Share of the step before, which is where a drop actually shows.
              // Share of the total would flatten every later step into noise.
              const share =
                previous && previous > 0 ? Math.round((step.count / previous) * 100) : null;
              return (
                <li key={step.key}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[0.95rem] font-bold">{stepLabel[step.key]}</span>
                    <span className="text-[0.95rem] font-extrabold" dir="ltr">
                      {step.count}
                      {share !== null && (
                        <span className="ms-2 text-[0.8rem] font-bold text-ink-3">
                          {share}% {t.ofPrevious}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-brand-blue"
                      style={{ width: `${top > 0 ? (step.count / top) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </Panel>

        <Panel title={t.stagesTitle} lede={t.stagesLede}>
          <Table
            head={[t.stageWord, t.inStage, t.completedStage, t.medianDays]}
            rows={stages.map((s) => [
              `${s.stage} — ${lang === 'ar' ? s.title_ar : s.title_en}`,
              String(s.in_stage),
              String(s.completed),
              s.median_days === null ? t.noneYet : String(s.median_days),
            ])}
            empty={t.empty}
          />
        </Panel>

        <Panel title={t.coursesTitle} lede={t.coursesLede}>
          <Table
            head={['', t.started, t.finished, t.passedCount, t.averageBest]}
            rows={courses.map((c) => [
              COURSES.find((x) => x.slug === c.course_slug)?.title[lang] ?? c.course_slug,
              String(c.started),
              String(c.finished),
              String(c.passed),
              c.average_best === null ? t.noneYet : `${c.average_best}%`,
            ])}
            empty={t.empty}
          />
        </Panel>

        <Panel title={t.hoursTitle} lede={t.hoursLede}>
          {hours.length === 0 ? (
            <p className="text-ink-3">{t.empty}</p>
          ) : (
            <ul className="space-y-2.5">
              {hours.map((h) => (
                <li key={h.month} className="flex flex-wrap items-center gap-3">
                  <span className="w-[5.5rem] shrink-0 font-mono text-[0.85rem] text-ink-3" dir="ltr">
                    {h.month}
                  </span>
                  <span className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <span
                      className="block h-full rounded-full bg-brand-orange"
                      style={{ width: `${(h.minutes / peak) * 100}%` }}
                    />
                  </span>
                  <span className="w-[9rem] shrink-0 text-end text-[0.85rem] font-bold">
                    {formatDuration(h.minutes, lang)}
                    <span className="ms-2 font-normal text-ink-3">
                      · {h.people} {t.peopleWord}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t.attendanceTitle} lede={t.attendanceLede}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label={t.registeredCount} value={String(attendance.registered)} />
            <Stat label={t.attendedCount} value={String(attendance.attended)} />
            <Stat
              label={t.noShows}
              value={String(attendance.no_shows)}
              tone={attendance.no_shows > attendance.attended ? 'warn' : undefined}
            />
          </div>
        </Panel>

        <Panel title={t.exportTitle} lede={t.exportLede}>
          {/* Plain anchors, not Link: these are file downloads, and a client
              navigation would try to render a CSV as a page. */}
          <div className="flex flex-wrap gap-3">
            {can(user, 'members.manage') && (
              <a href="/api/export/members" className={DOWNLOAD}>
                {t.exportMembers} · CSV
              </a>
            )}
            {can(user, 'hours.verify') && (
              <a href="/api/export/hours" className={DOWNLOAD}>
                {t.exportHours} · CSV
              </a>
            )}
            {can(user, 'activities.manage') && (
              <a href="/api/export/activities" className={DOWNLOAD}>
                {t.exportActivities} · CSV
              </a>
            )}
          </div>
        </Panel>

        <Panel title={t.quietTitle} lede={t.quietLede}>
          <div className="grid gap-4 sm:grid-cols-3">
            {quiet.map((q) => (
              <Stat
                key={q.days}
                label={t.quietDays.replace('{n}', String(q.days))}
                value={String(q.count)}
                tone={q.count > 0 ? 'warn' : undefined}
              />
            ))}
          </div>
        </Panel>
      </Container>
    </Section>
  );
}

const DOWNLOAD =
  'rounded-full border border-line bg-ground px-5 py-2.5 text-[0.92rem] font-bold transition-colors hover:bg-surface-2';

function Panel({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-[1.12rem] font-extrabold">{title}</h2>
      <p className="mb-5 mt-1.5 max-w-[64ch] text-[0.9rem] leading-relaxed text-ink-3">{lede}</p>
      {children}
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'warn' }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        tone === 'warn' ? 'border-brand-orange/40 bg-brand-orange/[0.08]' : 'border-line bg-ground'
      }`}
    >
      <p className="text-[0.74rem] font-bold tracking-[0.1em] text-ink-3">{label}</p>
      <p className="mt-1 text-[1.4rem] font-extrabold" dir="ltr">
        {value}
      </p>
    </div>
  );
}

function Table({
  head,
  rows,
  empty,
}: {
  head: string[];
  rows: string[][];
  empty: string;
}) {
  if (rows.length === 0) return <p className="text-ink-3">{empty}</p>;
  return (
    // Wide tables scroll inside their own box rather than pushing the page sideways.
    <div className="overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-[0.92rem]">
        <thead>
          <tr className="border-b border-line text-start">
            {head.map((h, i) => (
              <th
                key={i}
                className={`px-3 py-2 text-[0.74rem] font-bold tracking-[0.09em] text-ink-3 ${
                  i === 0 ? 'text-start' : 'text-end'
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line/60 last:border-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-3 py-2.5 ${
                    j === 0 ? 'font-bold' : 'text-end font-extrabold'
                  }`}
                  dir={j === 0 ? undefined : 'ltr'}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
