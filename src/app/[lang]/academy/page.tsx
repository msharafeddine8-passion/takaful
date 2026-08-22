import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section } from '@/components/ui';
import { COURSES, coursesInLevel, electiveCourses, type Course } from '@/lib/courses';
import { LEVELS } from '@/lib/programme/definition';
import { COURSE_CONTENT } from '@/lib/course-content';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { learningStanding, passedCourseSlugs } from '@/lib/academy';
import {
  CourseCard,
  LevelHeading,
  ProgressBar,
  PrimaryAction,
  courseCountLabel,
  type Standing,
} from '@/components/academy/parts';

export async function generateMetadata(props: PageProps<'/[lang]/academy'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.academy.heroTitle,
    description: dict.account.academy.heroLede,
    alternates: alternatesFor(lang, '/academy'),
  };
}

export default async function AcademyPage(props: PageProps<'/[lang]/academy'>) {
  // The page differs for a signed-in volunteer — it knows where they stopped —
  // so it cannot be prerendered.
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.academy;

  const user = isDbConfigured() ? await currentUser() : null;
  const [standing, passed] = user
    ? await Promise.all([learningStanding(user.id), passedCourseSlugs(user.id)])
    : [new Map(), new Set<string>()];

  /** What the volunteer is part-way through, if anything. */
  const inProgress = COURSES.filter((c) => {
    if (c.status !== 'available') return false;
    const s = standing.get(c.slug);
    return s !== undefined && !s.passed;
  });
  const resume = inProgress[0] ?? null;

  function standingOf(slug: string): Standing {
    const s = standing.get(slug);
    if (!s) return 'not-started';
    return s.passed ? 'completed' : 'in-progress';
  }

  /** Modules read out of the course's total: the honest completion figure. */
  function percentOf(slug: string): number | null {
    const s = standing.get(slug);
    if (!s) return null;
    if (s.passed) return 100;
    const total = COURSE_CONTENT[slug]?.modules.length ?? 0;
    if (total === 0) return null;
    return (s.modules_read / total) * 100;
  }

  const passedCount = COURSES.filter((c) => standingOf(c.slug) === 'completed').length;
  const publishedCount = COURSES.filter((c) => c.status === 'available').length;

  return (
    <>
      <div className="border-b border-line bg-brand-blue-deep text-white">
        <Container className="py-12 sm:py-16">
          <p className="text-[0.82rem] font-extrabold tracking-[0.16em] text-[#9dbbd2]">
            {dict.meta.siteName}
          </p>
          <h1 className="mt-3 text-[clamp(1.9rem,1.4rem+2.4vw,3rem)] font-black leading-tight tracking-tight text-white">
            {t.heroTitle}
          </h1>
          <p className="mt-4 max-w-[58ch] text-[1.05rem] leading-relaxed text-[#c4daea]">
            {t.heroLede}
          </p>

          {user && publishedCount > 0 && (
            <div className="mt-7 max-w-md">
              <p className="mb-2 text-[0.88rem] font-bold text-[#c4daea]">
                {passedCount} / {publishedCount}
              </p>
              <ProgressBar
                percent={(passedCount / publishedCount) * 100}
                label={t.heroTitle}
                tone={passedCount === publishedCount ? 'ok' : 'orange'}
              />
            </div>
          )}
        </Container>
      </div>

      <Section>
        <Container>
          {/* The single most useful thing on the page for somebody returning. */}
          {resume && (
            <div className="mb-10 rounded-2xl border-2 border-brand-orange bg-brand-orange/[0.08] p-6">
              <p className="text-[0.82rem] font-extrabold tracking-[0.13em] text-brand-orange-text dark:text-brand-orange">
                {t.continueTitle}
              </p>
              <h2 className="mt-2 text-[1.25rem] font-extrabold">
                <span aria-hidden>{resume.icon}</span> {resume.title[lang]}
              </h2>
              {(() => {
                const p = percentOf(resume.slug);
                const s = standing.get(resume.slug);
                const total = COURSE_CONTENT[resume.slug]?.modules.length ?? 0;
                return (
                  <>
                    {p !== null && (
                      <div className="mt-3 max-w-md">
                        <ProgressBar percent={p} label={resume.title[lang]} />
                        <p className="mt-2 text-[0.85rem] font-bold text-ink-2">
                          {t.modulesDone
                            .replace('{done}', String(s?.modules_read ?? 0))
                            .replace('{total}', String(total))}
                        </p>
                      </div>
                    )}
                    <div className="mt-5">
                      {/* Straight into the player, at the unit they stopped
                          on. This card says "continue"; sending it to the
                          description of a course somebody is half way through
                          is a tap to get past a page they have already read. */}
                      <PrimaryAction href={`/${lang}/academy/${resume.slug}/learn`}>
                        {t.continueCta} →
                      </PrimaryAction>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* The forms the courses refer to. A volunteer who has just read the
              module on documentation needs the attendance sheet, and until now
              there was nowhere to send them. */}
          <Link
            href={`/${lang}/resources` as Parameters<typeof Link>[0]['href']}
            className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-line bg-surface-2 p-5 transition-colors hover:bg-surface"
          >
            <span className="text-[1.6rem]" aria-hidden>
              📄
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-extrabold">{dict.resources.title}</span>
              <span className="mt-0.5 block text-[0.9rem] leading-relaxed text-ink-2">
                {dict.resources.lede}
              </span>
            </span>
            <span aria-hidden className="text-[1.2rem] font-extrabold text-brand-blue dark:text-brand-orange">
              {lang === 'ar' ? '←' : '→'}
            </span>
          </Link>

          <h2 className="sr-only">{t.allCourses}</h2>

          {/* The catalogue in path order, not by subject: a volunteer takes a
              level together, as one stage of training, so the page shows the
              stages the way the path defines them — 0 to 6, then the elective
              shelf that belongs to no level. */}
          {(() => {
            const grid = (courses: Course[]) => (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard
                    key={course.slug}
                    lang={lang}
                    t={t}
                    course={course}
                    standing={standingOf(course.slug)}
                    percent={percentOf(course.slug)}
                    locked={course.requires.some((r) => !passed.has(r))}
                  />
                ))}
              </div>
            );

            const electives = electiveCourses();

            return (
              <>
                {LEVELS.map((level) => {
                  const inLevel = coursesInLevel(level.number);
                  if (inLevel.length === 0) return null;
                  const done = user
                    ? inLevel.filter((c) => standingOf(c.slug) === 'completed').length
                    : null;
                  return (
                    <section key={level.number} aria-label={level.title[lang]}>
                      <LevelHeading
                        lang={lang}
                        level={level}
                        count={inLevel.length}
                        done={done}
                        t={t}
                      />
                      {grid(inLevel)}
                    </section>
                  );
                })}

                {electives.length > 0 && (
                  <section aria-label={t.electivesTitle}>
                    <div className="mb-5 mt-12 border-b border-line pb-4">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h2 className="text-[1.35rem] font-extrabold">{t.electivesTitle}</h2>
                        <span className="text-[0.85rem] font-bold text-ink-3">
                          {courseCountLabel(electives.length, t)}
                        </span>
                      </div>
                      <p className="mt-2 max-w-[70ch] text-[0.95rem] leading-relaxed text-ink-2">
                        {t.electivesLede}
                      </p>
                    </div>
                    {grid(electives)}
                  </section>
                )}
              </>
            );
          })()}

          {!user && (
            <div className="mt-10 rounded-2xl border border-line bg-surface p-6">
              <p className="text-[1rem] leading-relaxed text-ink-2">{t.signInToTrack}</p>
              <Link
                href={`/${lang}/login`}
                className="mt-3 inline-flex min-h-11 items-center font-extrabold text-brand-blue hover:underline dark:text-brand-orange"
              >
                {t.signInCta} →
              </Link>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
