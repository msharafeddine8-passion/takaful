import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured, query } from '@/lib/db';
import { learningStanding, type CourseStanding } from '@/lib/academy';
import { COURSES } from '@/lib/courses';
import { COURSE_CONTENT } from '@/lib/course-content';

export async function generateMetadata(
  props: PageProps<'/[lang]/account/learning'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.learning.title,
    alternates: alternatesFor(lang, '/account/learning'),
    robots: { index: false, follow: false },
  };
}

export default async function LearningPage(props: PageProps<'/[lang]/account/learning'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.learning;

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

  const [standing, certificates] = await Promise.all([
    learningStanding(user.id),
    query<{ course_slug: string; code: string }>(
      `SELECT course_slug, code FROM certificates
        WHERE user_id = $1 AND kind = 'course' AND revoked_at IS NULL AND course_slug IS NOT NULL`,
      [user.id],
    ),
  ]);
  const certificateFor = new Map(certificates.map((c) => [c.course_slug, c.code]));

  return (
    <Section>
      <Container className="max-w-3xl">
        <Kicker>{dict.account.dashboard.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        <ul className="mt-8 space-y-4">
          {COURSES.map((course) => (
            <CourseRow
              key={course.slug}
              lang={lang}
              dict={dict}
              slug={course.slug}
              title={course.title[lang]}
              summary={course.summary[lang]}
              published={course.status === 'available'}
              standing={standing.get(course.slug) ?? null}
              certificateCode={certificateFor.get(course.slug) ?? null}
            />
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function CourseRow({
  lang,
  dict,
  slug,
  title,
  summary,
  published,
  standing,
  certificateCode,
}: {
  lang: Locale;
  dict: Dictionary;
  slug: string;
  title: string;
  summary: string;
  published: boolean;
  standing: CourseStanding | null;
  certificateCode: string | null;
}) {
  const t = dict.account.learning;
  const content = COURSE_CONTENT[slug];
  const totalModules = content?.modules.length ?? 0;
  const passMark = content?.passMark ?? 70;

  const touched = standing !== null;
  const passed = standing?.passed ?? false;
  const open = standing?.open_answered !== null && standing?.open_answered !== undefined;

  const state = !published
    ? { label: t.draft, tone: 'bg-surface-2 text-ink-3' }
    : passed
      ? { label: t.passed, tone: 'bg-ok/15 text-ok' }
      : standing && standing.attempts > 0
        ? { label: t.failed, tone: 'bg-danger/12 text-danger' }
        : touched
          ? { label: t.inProgress, tone: 'bg-brand-blue/12 text-brand-blue dark:text-sky-300' }
          : { label: t.notStarted, tone: 'bg-surface-2 text-ink-3' };

  // A passed course invites review, an untouched one invites a start, and one
  // left half-read invites picking it back up. Only one of those is the point.
  const cta = passed ? t.review : touched ? t.resume : t.start;

  return (
    <li className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-[1.12rem] font-extrabold">{title}</h2>
        <span className={`rounded-full px-3 py-1 text-[0.82rem] font-extrabold ${state.tone}`}>
          {state.label}
        </span>
      </div>
      <p className="mt-2 max-w-[60ch] text-[0.94rem] leading-relaxed text-ink-2">{summary}</p>

      {touched && (
        <dl className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-[0.88rem]">
          {standing.best_score !== null && (
            <Fact label={t.bestScore} value={`${standing.best_score}%`} />
          )}
          <Fact label={t.passMark} value={`${passMark}%`} />
          {standing.attempts > 0 && <Fact label={t.attempts} value={String(standing.attempts)} />}
          {totalModules > 0 && (
            <Fact label={t.modulesRead} value={`${standing.modules_read} / ${totalModules}`} />
          )}
          {standing.last_attempt_at && (
            <Fact
              label={t.lastAttempt}
              value={new Date(standing.last_attempt_at).toISOString().slice(0, 10)}
              ltr
            />
          )}
        </dl>
      )}

      {open && (
        <p className="mt-3 rounded-lg border border-brand-orange/40 bg-brand-orange/[0.09] px-4 py-2.5 text-[0.88rem] font-bold text-brand-orange-text dark:text-brand-orange">
          {t.ongoing} — {t.answeredOf.replace('{n}', String(standing!.open_answered))}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Link
          href={`/${lang}/academy/${slug}` as Parameters<typeof Link>[0]['href']}
          className="rounded-full bg-brand-orange px-5 py-2.5 text-[0.9rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
        >
          {cta} →
        </Link>
        {certificateCode && (
          <Link
            href={`/${lang}/certificates/${certificateCode}` as Parameters<typeof Link>[0]['href']}
            className="font-bold text-brand-blue hover:underline dark:text-brand-orange"
          >
            {t.certificate} →
          </Link>
        )}
      </div>
    </li>
  );
}

function Fact({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div>
      <dt className="text-[0.82rem] font-bold tracking-[0.1em] text-ink-3">{label}</dt>
      <dd className="mt-0.5 font-extrabold" dir={ltr ? 'ltr' : undefined}>
        {value}
      </dd>
    </div>
  );
}
