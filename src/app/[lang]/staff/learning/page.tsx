import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import { countPhrase } from '@/lib/when';
import { isSuppressed, type Figure } from '@/lib/learning-analytics';
import { academyReport, type CourseReport } from '@/lib/learning-analytics-data';
import {
  learningAnalytics, type LearningAnalyticsStrings,
} from '@/lib/dictionaries/learning-analytics';

/**
 * Where the academy loses people.
 *
 * The association can already see that a course has a low pass rate. What it
 * could not see is the thing that decides whether anybody fixes anything:
 * which module they stopped at, which question is failed by four in five, and
 * whether the ninety minutes on the card is anywhere near ninety minutes of
 * this course.
 *
 * ── This page is about content, and stays about content ────────────────────
 *
 * There is no list of learners here, no ranking, no per-person score, and no
 * link that leads to one. A figure whose cohort is small enough to identify
 * somebody is withheld and *said* to be withheld — see MIN_COHORT in
 * lib/learning-analytics.ts, where the rule lives so that a probe can hold it.
 *
 * That is not caution for its own sake. The one thing that would make this
 * page harmful is the reading «Fatima failed question 6», and the distance
 * between that and «question 6 is failed by 78%» is one column of names that
 * would be trivial to add and impossible to take back. So the queries never
 * select a user id into a returned row, and there is nowhere on this page a
 * name could be rendered even by mistake.
 *
 * ── The capability ─────────────────────────────────────────────────────────
 *
 * `programme.edit` rather than `reports.read`, and the difference is the
 * audience rather than the sensitivity. Everything here is a finding about a
 * course that somebody then has to go and rewrite, and programme.edit names
 * exactly the people who can do that — content managers, instructors and
 * programme leadership. reports.read is broader in one direction and narrower
 * in the other: it admits project coordinators and field supervisors, who
 * cannot change a word of a course, and it excludes instructors, who teach
 * these courses and are the readers most likely to recognise why a question is
 * failing. A page whose whole purpose is «go and fix this» belongs with the
 * people who can.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/learning'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: learningAnalytics(lang).title,
    alternates: alternatesFor(lang, '/staff/learning'),
    robots: { index: false, follow: false },
  };
}

export default async function StaffLearningPage(
  props: PageProps<'/[lang]/staff/learning'>,
) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = learningAnalytics(lang);

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
  // notFound rather than a refusal, as /staff/programme does: a staff URL
  // should not confirm to a volunteer that it exists.
  if (!can(user, 'programme.edit')) notFound();

  const report = await academyReport();
  const opened = report.courses.filter((c) => c.totals.started > 0);

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{dict.account.staff.dashboard.title}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        {/* Stated on the page, not only in the code. Staff who know what the
            page refuses to do stop asking for it, and the ones who would have
            asked learn why the answer is no. */}
        <div className="mt-7 rounded-2xl border border-line bg-surface-2 p-5">
          <h2 className="text-[0.95rem] font-extrabold">{t.ethicTitle}</h2>
          <p className="mt-2 max-w-[62ch] text-[0.9rem] leading-relaxed text-ink-2">
            {t.ethicBody}
          </p>
        </div>

        <section className="mt-10">
          <h2 className="text-[1.15rem] font-extrabold">{t.overviewTitle}</h2>
          <p className="mt-1.5 max-w-[62ch] text-[0.9rem] leading-relaxed text-ink-3">
            {t.overviewLede}
          </p>
          <p className="mt-4 text-[0.95rem] text-ink-2">
            <span className="font-extrabold" dir="ltr">{report.touched}</span>
            {' '}
            {t.coursesTouched}
            {' · '}
            {countPhrase(report.courses.length, t.forms.courses)}
          </p>
        </section>

        <Panel title={t.worstTitle} lede={t.worstLede}>
          {report.worst.length === 0 ? (
            <p className="text-ink-3">{t.nothingYet}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-[0.92rem]">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className={HEAD + ' text-start'}>{t.colCourse}</th>
                    <th scope="col" className={HEAD + ' text-end'}>{t.colStarted}</th>
                    <th scope="col" className={HEAD + ' text-end'}>{t.colFinished}</th>
                    <th scope="col" className={HEAD + ' text-end'}>{t.colPassed}</th>
                    <th scope="col" className={HEAD + ' text-end'}>{t.colCompletion}</th>
                    <th scope="col" className={HEAD + ' text-end'}>{t.colAttempts}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.worst.map((row) => {
                    const course = report.courses.find((c) => c.slug === row.slug);
                    return (
                      <tr key={row.slug} className="border-b border-line/60 last:border-0">
                        <td className="px-3 py-2.5 font-bold">
                          {course ? course.title[lang] : row.slug}
                        </td>
                        <td className="px-3 py-2.5 text-end font-extrabold" dir="ltr">
                          {row.started}
                        </td>
                        <td className="px-3 py-2.5 text-end" dir="ltr">
                          <Show figure={row.finished} t={t} />
                        </td>
                        <td className="px-3 py-2.5 text-end" dir="ltr">
                          <Show figure={row.passed} t={t} />
                        </td>
                        <td className="px-3 py-2.5 text-end font-extrabold" dir="ltr">
                          <Show figure={row.completion} t={t} suffix="%" />
                        </td>
                        <td className="px-3 py-2.5 text-end" dir="ltr">
                          <Show figure={row.attemptsToPass} t={t} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="grid gap-5 sm:grid-cols-2">
          <Panel title={t.unopenedTitle} lede={t.unopenedLede}>
            <SlugList
              slugs={report.unopened.map((c) => c.slug)}
              courses={report.courses}
              lang={lang}
              empty={t.unopenedNone}
            />
          </Panel>
          <Panel title={t.unwrittenTitle} lede={t.unwrittenLede}>
            <SlugList
              slugs={report.unwritten.map((c) => c.slug)}
              courses={report.courses}
              lang={lang}
              empty={t.unwrittenNone}
            />
          </Panel>
        </div>

        <section className="mt-12">
          <h2 className="text-[1.15rem] font-extrabold">{t.courseTitle}</h2>
          <p className="mt-1.5 max-w-[62ch] text-[0.9rem] leading-relaxed text-ink-3">
            {t.courseLede}
          </p>
          {opened.length === 0 ? (
            <p className="mt-5 text-ink-3">{t.nothingYet}</p>
          ) : (
            <ul className="mt-5 flex flex-col gap-5">
              {opened.map((course) => (
                <li key={course.slug}>
                  <CourseCard course={course} lang={lang} t={t} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link
          href={`/${lang}/staff/programme`}
          className="mt-10 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {dict.account.programme.title}
        </Link>
      </Container>
    </Section>
  );
}

const HEAD = 'px-3 py-2 text-[0.8rem] font-bold tracking-[0.09em] text-ink-3';

/**
 * One figure, in whichever of its three states it is in.
 *
 * The withheld state gets a word and a title rather than a dash. A blank cell
 * teaches a reader that the page has gaps; a cell that says so teaches them
 * why, and stops the next person asking for the number to be added.
 */
function Show({
  figure, t, suffix = '',
}: {
  figure: Figure;
  t: LearningAnalyticsStrings;
  suffix?: string;
}) {
  if (figure.state === 'known') return <>{figure.value}{suffix}</>;
  if (figure.state === 'empty') return <span className="text-ink-3">—</span>;
  return (
    <span className="text-[0.82rem] font-bold text-warn-text" title={t.withheldWhy}>
      {t.withheld}
    </span>
  );
}

function Panel({
  title, lede, children,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-[1.05rem] font-extrabold">{title}</h2>
      <p className="mb-5 mt-1.5 max-w-[64ch] text-[0.88rem] leading-relaxed text-ink-3">{lede}</p>
      {children}
    </section>
  );
}

function SlugList({
  slugs, courses, lang, empty,
}: {
  slugs: string[];
  courses: CourseReport[];
  lang: Locale;
  empty: string;
}) {
  if (slugs.length === 0) return <p className="text-ink-3">{empty}</p>;
  return (
    <ul className="flex flex-col gap-1.5 text-[0.9rem]">
      {slugs.map((slug) => (
        <li key={slug}>
          <span className="font-bold">
            {courses.find((c) => c.slug === slug)?.title[lang] ?? slug}
          </span>
          <span className="block text-[0.76rem] text-ink-3" dir="ltr">{slug}</span>
        </li>
      ))}
    </ul>
  );
}

function CourseCard({
  course, lang, t,
}: {
  course: CourseReport;
  lang: Locale;
  t: LearningAnalyticsStrings;
}) {
  /*
   * A course only one or two people have opened gets its head count and
   * nothing else — no module ladder, no questions, no pace.
   *
   * Suppressing each figure one at a time would not be enough here: a ladder
   * reading 2, 2, 1, 1 over a cohort of two is a description of two people's
   * afternoons however carefully each cell is worded. Below the floor the
   * course simply has nothing to say yet, and saying so is the whole answer.
   */
  const thin = isSuppressed(course.totals.started);
  const peak = Math.max(1, ...course.modules.map((m) => m.reached));

  return (
    <article className="rounded-2xl border border-line bg-surface p-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="text-[1.05rem] font-extrabold">{course.title[lang]}</h3>
        <p className="text-[0.78rem] font-bold tracking-[0.08em] text-ink-3">
          {course.level === null
            ? t.electiveWord
            : `${t.levelWord} ${course.level}`}
          {' · '}
          {t.statuses[course.status] ?? course.status}
        </p>
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-5">
        <Cell label={t.colStarted}>
          <span dir="ltr">{course.totals.started}</span>
        </Cell>
        <Cell label={t.colFinished}><Show figure={course.totals.finished} t={t} /></Cell>
        <Cell label={t.colPassed}><Show figure={course.totals.passed} t={t} /></Cell>
        <Cell label={t.colCompletion}>
          <Show figure={course.totals.completion} t={t} suffix="%" />
        </Cell>
        <Cell label={t.colAttempts}>
          <Show figure={course.totals.attemptsToPass} t={t} />
        </Cell>
      </dl>

      {thin ? (
        <p className="mt-5 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.88rem] leading-relaxed text-ink-2">
          {t.withheldWhy}
        </p>
      ) : (
        <>
          <section className="mt-6 border-t border-line pt-5">
            <h4 className="text-[0.92rem] font-extrabold">{t.modulesTitle}</h4>
            {course.modules.length === 0 ? (
              <p className="mt-2 text-[0.88rem] text-ink-3">{t.noModules}</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {course.modules.map((m) => (
                  <li key={m.moduleId} className="flex flex-wrap items-center gap-3">
                    <span className="min-w-[9rem] flex-1 text-[0.88rem] font-bold">
                      {m.title[lang]}
                    </span>
                    <span className="h-2.5 w-24 shrink-0 overflow-hidden rounded-full bg-surface-2 sm:w-40">
                      <span
                        className="block h-full rounded-full bg-brand-blue"
                        style={{ width: `${(m.reached / peak) * 100}%` }}
                      />
                    </span>
                    <span className="w-[9rem] shrink-0 text-end text-[0.82rem] text-ink-2">
                      <span dir="ltr" className="font-extrabold">{m.reached}</span>
                      {' '}
                      {t.reachedLabel}
                      {/* Only when it clears the floor on its own count — one
                          person stopped at one module is one person. */}
                      {m.stranded.state === 'known' && (
                        <span className="block text-[0.76rem] font-bold text-warn-text">
                          {m.stranded.value} · {t.strandedHere}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 rounded-xl border border-line bg-ground px-4 py-3">
              <p className="text-[0.78rem] font-bold tracking-[0.09em] text-ink-3">
                {t.dropOffTitle}
              </p>
              <p className="mt-1 text-[0.88rem] leading-relaxed">
                {course.dropOff === null ? (
                  <span className="text-ink-2">{t.dropOffNone}</span>
                ) : course.dropOff.reportable ? (
                  <span className="text-warn-text">
                    {t.dropOffLine
                      .replace('{from}', titleOfModule(course, course.dropOff.moduleId, lang))
                      .replace('{to}', titleOfModule(course, course.dropOff.nextModuleId, lang))
                      .replace('{lost}', countPhrase(course.dropOff.lost, t.forms.learners))
                      .replace('{reached}', String(reachedAt(course, course.dropOff.moduleId)))
                      .replace('{share}', String(course.dropOff.share ?? 0))}
                  </span>
                ) : (
                  <span className="text-ink-2">{t.dropOffThin}</span>
                )}
              </p>
              {course.stranded.state === 'known' && course.stranded.value > 0 && (
                <p className="mt-1.5 text-[0.85rem] text-ink-2">
                  {countPhrase(course.stranded.value, t.forms.learners)} · {t.strandedTotal}
                </p>
              )}
            </div>
          </section>

          <section className="mt-6 border-t border-line pt-5">
            <h4 className="text-[0.92rem] font-extrabold">{t.questionsTitle}</h4>
            <p className="mt-1 max-w-[60ch] text-[0.84rem] leading-relaxed text-ink-3">
              {t.questionsLede}
            </p>
            {course.hardest.length === 0 ? (
              <p className="mt-3 text-[0.88rem] text-ink-3">{t.questionsNone}</p>
            ) : (
              <ol className="mt-3 space-y-2.5">
                {course.hardest.map((q) => (
                  <li
                    key={q.questionId}
                    className="rounded-xl border border-line bg-ground px-4 py-3"
                  >
                    <p className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-[0.78rem] font-bold tracking-[0.08em] text-ink-3">
                        {q.label[lang]}
                      </span>
                      <span
                        className={`text-[0.88rem] font-extrabold ${
                          q.failure.state === 'known' && q.failure.value >= 50
                            ? 'text-danger-text'
                            : 'text-warn-text'
                        }`}
                        dir="ltr"
                      >
                        <Show figure={q.failure} t={t} suffix={`% ${t.failureRate}`} />
                      </span>
                    </p>
                    <p className="mt-1 text-[0.88rem] leading-relaxed" dir="auto">
                      {q.question[lang]}
                    </p>
                    <p className="mt-1 text-[0.78rem] text-ink-3">
                      {countPhrase(q.answeredBy, t.forms.learners)}
                      {' · '}
                      {titleOfModule(course, q.moduleId, lang)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
            {course.unjudged > 0 && (
              <p className="mt-2.5 text-[0.8rem] text-ink-3">
                {t.unjudged.replace('{n}', String(course.unjudged))}
              </p>
            )}
          </section>

          <section className="mt-6 border-t border-line pt-5">
            <h4 className="text-[0.92rem] font-extrabold">{t.paceTitle}</h4>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[0.88rem]">
              <span className="text-ink-2">
                {t.claimed}{' '}
                <span className="font-extrabold" dir="ltr">
                  {countPhrase(course.pace.claimed, t.forms.minutes)}
                </span>
              </span>
              <span className="text-ink-2">
                {t.inPractice}{' '}
                <span className="font-extrabold" dir="ltr">
                  {course.pace.median.state === 'known' ? (
                    countPhrase(course.pace.median.value, t.forms.minutes)
                  ) : (
                    <Show figure={course.pace.median} t={t} />
                  )}
                </span>
              </span>
              <span
                className={`font-bold ${
                  course.pace.verdict === 'slower' ? 'text-warn-text' : 'text-ink-3'
                }`}
              >
                {t.verdicts[course.pace.verdict]}
              </span>
            </p>
            {/* Not a fault, and labelled so. Reading a course across three
                evenings is a normal way to take a course. */}
            {course.spreadOut > 0 && (
              <p className="mt-1.5 text-[0.8rem] text-ink-3">
                <span dir="ltr">{course.spreadOut}</span> {t.spreadOut}
              </p>
            )}
          </section>
        </>
      )}
    </article>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.74rem] font-bold tracking-[0.08em] text-ink-3">{label}</dt>
      <dd className="mt-0.5 text-[1.05rem] font-extrabold">{children}</dd>
    </div>
  );
}

/** The module's own title, falling back to its slug when the two sources disagree. */
function titleOfModule(course: CourseReport, moduleId: string, lang: Locale): string {
  return course.modules.find((m) => m.moduleId === moduleId)?.title[lang] ?? moduleId;
}

function reachedAt(course: CourseReport, moduleId: string): number {
  return course.modules.find((m) => m.moduleId === moduleId)?.reached ?? 0;
}
