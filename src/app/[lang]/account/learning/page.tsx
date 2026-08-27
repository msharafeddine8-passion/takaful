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
import {
  learningStanding,
  attemptHistoryByCourse,
  type AttemptSummary,
  type CourseStanding,
} from '@/lib/academy';
import { COURSES } from '@/lib/courses';
import { COURSE_CONTENT } from '@/lib/course-content';
import { AttemptHistory } from '@/components/academy/AttemptHistory';
import { attemptsDict } from '@/lib/dictionaries/attempts';

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

  const [standing, certificates, history] = await Promise.all([
    learningStanding(user.id),
    query<{ course_slug: string; code: string }>(
      `SELECT course_slug, code FROM certificates
        WHERE user_id = $1 AND kind = 'course' AND revoked_at IS NULL AND course_slug IS NOT NULL`,
      [user.id],
    ),
    /* Every sitting of every course, in one query. One per course would be
     * forty round trips on a page that already renders the whole catalogue —
     * and the catalogue is the thing that grows. */
    attemptHistoryByCourse(user.id),
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
              history={history.get(course.slug) ?? []}
              /* A level's paper is revision now — the decision run closes the
                 level. The attempt panel says something different about what
                 an attempt means depending on which of the two this is. */
              revision={course.kind === 'challenge'}
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
  history,
  revision,
}: {
  lang: Locale;
  dict: Dictionary;
  slug: string;
  title: string;
  summary: string;
  published: boolean;
  standing: CourseStanding | null;
  certificateCode: string | null;
  history: readonly AttemptSummary[];
  revision: boolean;
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
      /*
       * «لم تجتز بعد» is not a failure and stops being coloured like one.
       *
       * The label was already gentle; the tone was `danger` — the same red this
       * codebase uses for a revoked certificate and a suspended account. On a
       * page listing forty courses that painted a wall of red at somebody who
       * has simply not reached them yet, hardest for the person furthest
       * behind.
       *
       * It matters more since the level's paper became revision: a red chip on
       * an unpassed paper says something stands between the learner and their
       * certificate, and nothing does. Neutral, like the draft chip, and the
       * words carry the meaning.
       */
      : standing && standing.attempts > 0
        ? { label: t.failed, tone: 'bg-surface-2 text-ink-2' }
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

      {/*
        * Recognised, not sat.
        *
        * The association credited this course from prior learning, so there is
        * no score and there never was a paper. Said in a sentence rather than
        * left to the facts below, where it would show as a pass with the score
        * line simply missing — and a missing score on a passed course reads as
        * something having gone wrong.
        */}
      {standing?.recognised && (
        <p className="mt-3 rounded-xl border border-brand-blue/30 bg-brand-blue/[0.06] px-4 py-3 text-[0.92rem] leading-relaxed text-ink-2">
          {t.recognisedNote}
        </p>
      )}

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
          {/*
            * Already 'YYYY-MM-DD' in Beirut, straight out of Postgres.
            *
            * This line used to be `new Date(...).toISOString().slice(0, 10)`.
            * The session runs GMT: an attempt submitted at 01:00 Beirut is
            * 22:00 GMT the day before, so every sitting made after midnight
            * Beirut was reported here as having happened the previous day.
            * The column is text now — see the DATES note in lib/academy.ts —
            * and nothing may rebuild a Date from it.
            */}
          {standing.last_attempt_on && (
            <Fact label={t.lastAttempt} value={standing.last_attempt_on} ltr />
          )}
        </dl>
      )}

      {open && (
        <p className="mt-3 rounded-lg border border-brand-orange/40 bg-brand-orange/[0.09] px-4 py-2.5 text-[0.88rem] font-bold text-brand-orange-text dark:text-brand-orange">
          {t.ongoing} — {t.answeredOf.replace('{n}', String(standing!.open_answered))}
        </p>
      )}

      {/*
        * Every sitting, behind a disclosure.
        *
        * Folded rather than open, and this is the deliberate part. The card
        * above already answers the question somebody comes to this page with —
        * where am I, what is my best, when did I last try. Unfolding forty
        * courses' worth of scores by default would turn a page about progress
        * into a wall of marks, and the row somebody sees first would be
        * whichever attempt went worst.
        *
        * `<details>` and not a toggle: this page is a server component, the
        * markup is already on the page, and the browser opens it with no
        * JavaScript at all. It also means the rows are in the document for a
        * screen reader and for Ctrl-F.
        */}
      {history.length > 0 && (
        <details className="mt-4 rounded-xl border border-line bg-surface-2 px-4 py-1">
          {/* The native marker is kept and `min-h-11` gives it a 44px target,
              exactly as staff/challenges does. A disclosure that does not look
              like one is a disclosure nobody opens. */}
          <summary className="min-h-11 cursor-pointer py-2 text-[0.9rem] font-extrabold text-brand-blue dark:text-brand-orange">
            {attemptsDict(lang).heading}
          </summary>
          <div className="mb-4 mt-2">
            <AttemptHistory lang={lang} history={history} revision={revision} />
          </div>
        </details>
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
            href={`/${lang}/verify/${certificateCode}` as Parameters<typeof Link>[0]['href']}
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
