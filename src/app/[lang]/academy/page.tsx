import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section } from '@/components/ui';
import { COURSES, coursesInLevel, electiveCourses, type Course } from '@/lib/courses';
import { LEVELS } from '@/lib/programme/definition';
import { challengeForLevel } from '@/lib/programme/level-challenge';
import { countsTowardsLevel } from '@/lib/programme/gate';
import { decideAccess, prerequisitesMet } from '@/lib/programme/access';
import { challengeLevels } from '@/lib/dictionaries/challenge-levels';
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

  /**
   * One state per card, decided here, by the same function the course page
   * decides with.
   *
   * This used to be `locked={course.requires.some((r) => !passed.has(r))}` next
   * to a badge derived from `course.status` — one asking whether the content
   * had been written, the other whether this visitor had earned it. Both are
   * real questions and neither is "may I open this", so a signed-out visitor
   * got thirty-seven cards reading «متاحة», «هذه الدورة مقفلة» and «ابدأ
   * الدورة» at once. Now the card is handed the decision and renders it three
   * ways, which is the only arrangement in which the three cannot disagree.
   *
   * No extra query: `passed` is already loaded above, and this is the same set
   * `eligibilityFor` would go and fetch for each of forty-one cards.
   */
  function accessOf(course: Course) {
    return decideAccess({
      kind: course.kind,
      signedIn: user !== null,
      prerequisitesMet: prerequisitesMet(course.requires, passed),
      published: course.status === 'available',
    });
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
                    access={accessOf(course)}
                    passed={passed}
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
                  /*
                   * The decision run — what closes the level, offered once its
                   * courses are behind the learner.
                   *
                   * It used to be optional and this comment used to say so.
                   * Finishing it is now what opens the next level and earns the
                   * level certificate, so a volunteer who never opens it stays
                   * where they are.
                   *
                   * It still sits after the courses rather than among them,
                   * because it is still not a seventh course: nothing in it is
                   * marked and there is no way to fail it. Required and
                   * unmarked is a real thing to be, and the placement says so.
                   *
                   * `countsTowardsLevel` excludes the level's marked paper,
                   * which is revision now. Requiring it here would have made it
                   * compulsory in order to reach the thing that replaced it.
                   *
                   * Computed from the passes already loaded above, so this adds
                   * no query to a page that renders forty cards.
                   */
                  const runnable =
                    user !== null
                    && challengeForLevel(level.number) !== null
                    && inLevel.filter(countsTowardsLevel).every((c) => passed.has(c.slug));
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
                      {runnable && <LevelRunLink lang={lang} level={level.number} />}
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

/**
 * The way into a level's decision run.
 *
 * Rendered once the level's courses are behind the volunteer. It is the step
 * that closes the level, and the kicker says so rather than making somebody
 * click to find out — it used to say the opposite, back when this was an offer.
 *
 * Still styled as a link rather than a seventh course card. The card shape
 * carries a promise this thing cannot keep: a score, a pass mark, a retake
 * that means something went wrong. This is required and unmarked, and the two
 * facts have to arrive together or the first one drags the second along.
 */
function LevelRunLink({ lang, level }: { lang: Locale; level: number }) {
  const t = challengeLevels(lang);
  return (
    <Link
      href={`/${lang}/academy/challenge/${level}` as Parameters<typeof Link>[0]['href']}
      className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-brand-blue/30 bg-brand-blue/[0.04] p-5 transition-colors hover:bg-brand-blue/[0.08]"
    >
      <span className="text-[1.6rem]" aria-hidden>
        🧭
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.78rem] font-extrabold tracking-[0.13em] text-brand-blue dark:text-sky-300">
          {t.cardKicker}
        </span>
        <span className="mt-1 block font-extrabold">
          {t.cardTitle.replace('{level}', String(level))}
        </span>
        <span className="mt-1 block text-[0.9rem] leading-relaxed text-ink-2">{t.cardBody}</span>
      </span>
      <span aria-hidden className="text-[1.2rem] font-extrabold text-brand-blue dark:text-brand-orange">
        {lang === 'ar' ? '←' : '→'}
      </span>
    </Link>
  );
}
