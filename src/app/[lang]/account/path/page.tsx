import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { programmeStanding, type CourseStanding, type LevelStanding } from '@/lib/programme/standing';
import type { Missing } from '@/lib/programme/gate';
import { ProgressBar, PrimaryAction } from '@/components/academy/parts';

export async function generateMetadata(props: PageProps<'/[lang]/account/path'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.path.title,
    alternates: alternatesFor(lang, '/account/path'),
    // A learner's own progress. Nothing here belongs in a search index.
    robots: { index: false, follow: false },
  };
}

/**
 * The learner's whole path on one page.
 *
 * The order answers the questions a volunteer actually asks, in the order they
 * ask them: where am I, what do I do next, what have I finished, what is shut
 * and why. A dashboard that opens with statistics answers none of them.
 */
export default async function PathPage(props: PageProps<'/[lang]/account/path'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.path;

  if (!isDbConfigured()) notFound();
  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  const standing = await programmeStanding(user.id);
  const levels = standing.levels;
  const orientation = levels.find((l) => l.number === 0);
  const mainLevels = levels.filter((l) => l.number >= 1);
  const levelsDone = mainLevels.filter((l) => l.complete).length;

  return (
    <>
      <div className="border-b border-line bg-brand-blue-deep text-white">
        <Container className="py-10 sm:py-14">
          <p className="text-[0.82rem] font-extrabold tracking-[0.16em] text-[#9dbbd2]">
            {dict.meta.siteName}
          </p>
          <h1 className="mt-3 text-[clamp(1.8rem,1.4rem+2.2vw,2.8rem)] font-black leading-tight tracking-tight">
            {t.title}
          </h1>
          <p className="mt-4 max-w-[58ch] text-[1.05rem] leading-relaxed text-[#c4daea]">{t.lede}</p>

          <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
            <Stat label={t.levelsDone} value={`${levelsDone} / ${mainLevels.length}`} />
            <Stat label={t.coursesDone} value={`${standing.passedCourses} / ${standing.totalCourses}`} />
            <Stat
              label={t.learningTime}
              value={String(Math.round((standing.learningMinutes / 60) * 10) / 10)}
            />
          </dl>
        </Container>
      </div>

      <Section>
        <Container className="max-w-4xl">
          {/* The single most useful thing on the page. */}
          {standing.next && (
            <div className="mb-10 rounded-2xl border-2 border-brand-orange bg-brand-orange/[0.08] p-6">
              <p className="text-[0.82rem] font-extrabold tracking-[0.13em] text-brand-orange-text dark:text-brand-orange">
                {standing.passedCourses > 0 ? t.continueTitle : t.startTitle}
              </p>
              <h2 className="mt-2 text-[1.25rem] font-extrabold">{standing.next.title[lang]}</h2>
              <div className="mt-5">
                <PrimaryAction href={`/${lang}/academy/${standing.next.slug}`}>
                  {t.continueCta} →
                </PrimaryAction>
              </div>
            </div>
          )}

          {orientation && (
            <LevelBlock lang={lang} t={t} level={orientation} current={standing.currentLevel} isOrientation />
          )}

          {mainLevels.map((level) => (
            <LevelBlock
              key={level.number}
              lang={lang}
              t={t}
              level={level}
              current={standing.currentLevel}
            />
          ))}

          {standing.revise.length > 0 && (
            <section className="mt-12 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-[1.15rem] font-extrabold">{t.reviseTitle}</h2>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{t.reviseLede}</p>
              <ul className="mt-4 flex flex-col gap-2">
                {standing.revise.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/${lang}/academy/${r.slug}` as Parameters<typeof Link>[0]['href']}
                      className="flex min-h-11 flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-2 hover:bg-surface-2"
                    >
                      <span className="font-bold">{r.title[lang]}</span>
                      <span className="text-[0.88rem] text-ink-3" dir="ltr">
                        {t.reviseScore}: {r.bestScore}%
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {standing.electives.length > 0 && (
            <section className="mt-12">
              <h2 className="text-[1.3rem] font-extrabold">{t.electivesTitle}</h2>
              <p className="mt-2 max-w-[60ch] text-[0.98rem] leading-relaxed text-ink-2">
                {t.electivesLede}
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {standing.electives.map((course) => (
                  <li key={course.slug}>
                    <CourseRow lang={lang} t={t} course={course} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Container>
      </Section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.82rem] font-bold tracking-[0.1em] text-[#9dbbd2]">{label}</dt>
      <dd className="mt-1 text-[1.5rem] font-extrabold" dir="ltr">
        {value}
      </dd>
    </div>
  );
}

function LevelBlock({
  lang,
  t,
  level,
  current,
  isOrientation = false,
}: {
  lang: Locale;
  t: Dictionary['account']['path'];
  level: LevelStanding;
  current: number;
  isOrientation?: boolean;
}) {
  const here = level.number === current;
  return (
    <section
      className={`mb-8 rounded-2xl border p-6 ${
        here ? 'border-brand-blue bg-brand-blue/[0.05]' : 'border-line bg-surface'
      } ${level.open ? '' : 'opacity-75'}`}
      aria-label={level.title[lang]}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-full bg-brand-blue px-3.5 py-1 text-[0.82rem] font-extrabold text-white">
          {isOrientation ? t.orientationTitle : `${t.levelWord} ${level.number}`}
        </span>
        {here && (
          <span className="rounded-full bg-brand-orange px-3.5 py-1 text-[0.82rem] font-extrabold text-[#241503]">
            {t.youAreHere}
          </span>
        )}
        {!level.open && (
          <span className="rounded-full border border-line px-3.5 py-1 text-[0.82rem] font-extrabold text-ink-3">
            🔒 {t.locked}
          </span>
        )}
        {level.complete && (
          <span className="rounded-full bg-ok px-3.5 py-1 text-[0.82rem] font-extrabold text-white">
            ✓ {t.complete}
          </span>
        )}
      </div>

      <h2 className="mt-3 text-[1.25rem] font-extrabold">{level.title[lang]}</h2>
      <p className="mt-2 max-w-[62ch] text-[0.98rem] leading-relaxed text-ink-2">
        {isOrientation ? t.orientationLede : level.description[lang]}
      </p>

      {level.total > 0 && (
        <div className="mt-5 max-w-md">
          <ProgressBar
            percent={(level.done / level.total) * 100}
            label={level.title[lang]}
            tone={level.complete ? 'ok' : 'orange'}
          />
          <p className="mt-2 text-[0.88rem] font-bold text-ink-3" dir="ltr">
            {level.done} / {level.total}
          </p>
        </div>
      )}

      {level.certificateCode && (
        <p className="mt-4 text-[0.95rem] font-bold text-ok">
          ✓ {t.certificateEarned} —{' '}
          <Link
            href={`/${lang}/verify/${level.certificateCode}` as Parameters<typeof Link>[0]['href']}
            className="underline"
          >
            {t.viewCertificate}
          </Link>
        </p>
      )}

      <ul className="mt-5 flex flex-col gap-2.5">
        {level.courses.map((course) => (
          <li key={course.slug}>
            <CourseRow lang={lang} t={t} course={course} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * One course. A locked course is still shown, with the reason — a hidden
 * course teaches the learner nothing about where the path goes, and a bare
 * padlock teaches them nothing about how to open it.
 */
function CourseRow({
  lang,
  t,
  course,
}: {
  lang: Locale;
  t: Dictionary['account']['path'];
  course: CourseStanding;
}) {
  const openable = !course.locked && course.hasContent;

  const body = (
    <div
      className={`flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border px-4 py-3 ${
        openable ? 'border-line bg-ground hover:border-brand-orange' : 'border-dashed border-line'
      }`}
    >
      <span aria-hidden className="text-[1.15rem] leading-none">
        {course.standing === 'passed' ? '✓' : course.locked ? '🔒' : (course.icon ?? '•')}
      </span>
      <span className={`flex-1 font-bold ${openable ? '' : 'text-ink-2'}`}>
        {course.title[lang]}
        {course.kind === 'challenge' && (
          <span className="ms-2 text-[0.82rem] font-bold text-brand-orange-text dark:text-brand-orange">
            {t.challengeWord}
          </span>
        )}
      </span>

      {course.standing === 'passed' ? (
        <span className="text-[0.85rem] font-extrabold text-ok">{t.complete}</span>
      ) : course.locked ? (
        <span className="text-[0.85rem] text-ink-3">
          {t.lockedBecause} {reasonText(course.missing, t, lang)}
        </span>
      ) : !course.hasContent ? (
        <span className="text-[0.85rem] text-ink-3">{t.notWrittenYet}</span>
      ) : course.percent > 0 ? (
        <span className="text-[0.85rem] font-bold text-brand-orange-text dark:text-brand-orange" dir="ltr">
          {course.percent}%
        </span>
      ) : (
        <span className="text-[0.85rem] text-ink-3">{t.notStarted}</span>
      )}
    </div>
  );

  return openable ? (
    <Link href={`/${lang}/academy/${course.slug}` as Parameters<typeof Link>[0]['href']}>{body}</Link>
  ) : (
    body
  );
}

/** Turns the gate's structured refusal into a sentence a learner can act on. */
function reasonText(
  missing: Missing[],
  t: Dictionary['account']['path'],
  lang: Locale,
): string {
  const first = missing[0];
  if (!first) return '';
  switch (first.kind) {
    case 'sign-in':
      return t.needSignIn;
    case 'orientation':
      return t.needOrientation;
    case 'challenge':
      return t.needChallenge;
    case 'course':
      // Naming the course is the whole point: "finish Teamwork" is a route,
      // "finish a prerequisite" is a shrug.
      return `${t.needCourse} ${first.title[lang]}`;
    case 'level':
      return `${t.levelWord} ${first.number}`;
  }
}
