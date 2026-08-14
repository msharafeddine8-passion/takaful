import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section } from '@/components/ui';
import { Quiz } from '@/components/Quiz';
import { CourseProgressProvider } from '@/components/CourseProgress';
import { CourseFinish } from '@/components/CourseFinish';
import { ModuleRead } from '@/components/ModuleRead';
import { CourseLd } from '@/components/StructuredData';
import { COURSE_CONTENT } from '@/lib/course-content';
import { CATEGORIES, DIFFICULTY_LABEL, courseBySlug } from '@/lib/courses';
import { isDbConfigured } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import {
  startOrResumeAttempt,
  questionsIn,
  completedModules,
  eligibilityFor,
  passedCourseSlugs,
  type Attempt,
} from '@/lib/academy';
import {
  ProgressBar,
  PrimaryAction,
  Fact,
  type Standing,
} from '@/components/academy/parts';
import type { Block } from '@/lib/course-content/types';

/*
 * This page used to be prerendered for both languages. It no longer can be:
 * the order the quiz options appear in belongs to the reader's attempt, and
 * the answers they have already given have to come back with the page. The
 * catalogue at /academy is still static, which is where the search engines
 * and the newcomers land.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/academy/[slug]'>,
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  if (!isLocale(lang)) return {};
  const course = COURSE_CONTENT[slug];
  const meta = courseBySlug(slug);
  if (!meta) return {};
  /*
   * Fall back to the catalogue when the content is not written yet. Without
   * this the eight planned courses inherited the site-wide title and — worse —
   * a canonical pointing at the home page, which tells a search engine that
   * eight distinct pages are duplicates of /ar.
   */
  return {
    title: course?.title[lang] ?? meta.title[lang],
    description: course?.lede[lang] ?? meta.summary[lang],
    alternates: alternatesFor(lang, `/academy/${slug}`),
  };
}

const CALLOUT_STYLE = {
  info: 'border-brand-blue/30 bg-brand-blue/[0.07]',
  warn: 'border-brand-orange/40 bg-brand-orange/[0.09]',
  stop: 'border-danger/30 bg-danger/[0.07]',
} as const;

const CALLOUT_TITLE = {
  info: 'text-brand-blue dark:text-sky-300',
  warn: 'text-brand-orange-text dark:text-brand-orange',
  stop: 'text-danger',
} as const;

/** Everything the quiz blocks need that the content itself cannot supply. */
type QuizContext = {
  slug: string;
  /** Display order of the options, per question id. */
  order: Record<string, number[]>;
  /** What the server has already recorded, keyed by question id. */
  previous: Record<string, { displayedIndex: number; correct: boolean; feedback: string }>;
};

function renderBlock(block: Block, lang: Locale, key: number, quiz: QuizContext) {
  switch (block.type) {
    case 'text':
      return (
        <p key={key} className="mb-4 max-w-[70ch] text-[1.02rem] leading-relaxed text-ink-2">
          {block.content[lang]}
        </p>
      );

    case 'list':
      return (
        <ul key={key} className="mb-5 flex max-w-[70ch] flex-col gap-2">
          {block.items[lang].map((item, i) => (
            <li
              key={i}
              className="relative ps-5 text-[0.97rem] leading-relaxed text-ink-2 before:absolute before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-brand-orange before:content-[''] before:start-0"
            >
              {item}
            </li>
          ))}
        </ul>
      );

    case 'ordered':
      return (
        <ol key={key} className="mb-5 flex max-w-[70ch] list-decimal flex-col gap-2 ps-6">
          {block.items[lang].map((item, i) => (
            <li key={i} className="text-[0.97rem] leading-relaxed text-ink-2">
              {item}
            </li>
          ))}
        </ol>
      );

    case 'callout':
      return (
        <div key={key} className={`my-6 rounded-2xl border p-5 ${CALLOUT_STYLE[block.variant]}`}>
          <p className={`mb-2 text-[0.95rem] font-extrabold ${CALLOUT_TITLE[block.variant]}`}>
            {block.title[lang]}
          </p>
          <p className="text-[0.96rem] leading-relaxed text-ink-2">{block.content[lang]}</p>
        </div>
      );

    case 'grid':
      return (
        <div key={key} className="my-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {block.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface p-4">
              {/* h3, not h4: these sit directly under the module's h2, and a
                  skipped level tells a screen-reader user a heading is
                  missing between them. */}
              <h3 className="mb-1.5 text-[1rem] font-extrabold text-brand-blue dark:text-sky-300">
                {item.title[lang]}
              </h3>
              <p className="text-[0.9rem] leading-relaxed text-ink-2">{item.text[lang]}</p>
            </div>
          ))}
        </div>
      );

    case 'compare':
      return (
        <div key={key} className="my-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-ok/30 bg-ok/[0.08] p-5">
            <h3 className="mb-2.5 text-[0.98rem] font-extrabold text-ok">{block.yesTitle[lang]}</h3>
            <ul className="flex list-disc flex-col gap-1.5 ps-5 text-[0.92rem] text-ink-2">
              {block.yes[lang].map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-danger/30 bg-danger/[0.07] p-5">
            <h3 className="mb-2.5 text-[0.98rem] font-extrabold text-danger">
              {block.noTitle[lang]}
            </h3>
            <ul className="flex list-disc flex-col gap-1.5 ps-5 text-[0.92rem] text-ink-2">
              {block.no[lang].map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      );

    case 'quiz': {
      // Fall back to the authored order for a visitor with no attempt open.
      const order = quiz.order[block.id] ?? block.options.map((_, i) => i);
      return (
        <Quiz
          key={key}
          lang={lang}
          slug={quiz.slug}
          id={block.id}
          label={block.label[lang]}
          question={block.question[lang]}
          scenario={block.scenario?.[lang]}
          options={order.map((original) => block.options[original][lang])}
          previous={quiz.previous[block.id]}
        />
      );
    }
  }
}

export default async function CoursePage(props: PageProps<'/[lang]/academy/[slug]'>) {
  await connection();
  const { lang, slug } = await props.params;
  if (!isLocale(lang)) notFound();
  const course = COURSE_CONTENT[slug];
  const meta = courseBySlug(slug);
  if (!meta) notFound();
  const dict = getDictionary(lang);
  const a = dict.account.academy;

  /*
   * A course on the roadmap whose content is not written yet.
   *
   * It gets a real page rather than a 404, because the catalogue links to it
   * and a volunteer who taps a card deserves to be told what is coming rather
   * than shown an error. Nothing here is invented: the audience and outcomes
   * are the ones recorded in the catalogue, and the page says plainly that the
   * content does not exist.
   */
  if (!course) {
    return <PlannedCourse lang={lang} dict={dict} meta={meta} />;
  }
  const isApproved = meta.status === 'available';
  const questions = questionsIn(slug);
  // The finish bar needs to know how many answers make a complete attempt.
  const questionCount = questions.length;

  const user = isDbConfigured() ? await currentUser() : null;

  /*
   * Opening the page opens the attempt. It has to happen here rather than on
   * the first tap, because the option order shown must be the order the
   * server grades against. startOrResumeAttempt returns the attempt already
   * in progress if there is one, and a unique index makes a double render
   * harmless, so this stays safe to repeat.
   */
  let attempt: Attempt | null = null;
  let readModules: string[] = [];
  if (user && isApproved && questionCount > 0) {
    [attempt, readModules] = await Promise.all([
      startOrResumeAttempt(user.id, slug),
      completedModules(user.id, slug),
    ]);
  } else if (user) {
    readModules = await completedModules(user.id, slug);
  }

  const quizContext: QuizContext = { slug, order: {}, previous: {} };
  if (attempt) {
    quizContext.order = attempt.option_order;
    for (const q of questions) {
      const original = attempt.answers[q.id];
      if (original === undefined) continue;
      const order = attempt.option_order[q.id] ?? q.options.map((_, i) => i);
      quizContext.previous[q.id] = {
        displayedIndex: Math.max(0, order.indexOf(original)),
        correct: original === q.correct,
        feedback: q.feedback[lang],
      };
    }
  }
  const answeredIds = Object.keys(quizContext.previous);

  /*
   * Where this volunteer stands, worked out once and used by the hero, the
   * contents list and the call to action — so the three cannot disagree.
   */
  const [eligibility, passed] = await Promise.all([
    eligibilityFor(user?.id ?? null, slug),
    user ? passedCourseSlugs(user.id) : Promise.resolve(new Set<string>()),
  ]);
  const modulesRead = readModules.length;
  const hasPassed = passed.has(slug);
  const standing: Standing = hasPassed
    ? 'completed'
    : modulesRead > 0 || answeredIds.length > 0
      ? 'in-progress'
      : 'not-started';
  const percent = hasPassed
    ? 100
    : course.modules.length === 0
      ? 0
      : (modulesRead / course.modules.length) * 100;

  /*
   * Where the main button goes. Somebody part-way through wants the module
   * they stopped on, not the top of the page they have already read.
   */
  const firstUnread = course.modules.find((m) => !readModules.includes(m.id));
  const startTargetId =
    standing === 'in-progress' && firstUnread ? firstUnread.id : (course.modules[0]?.id ?? 'contents');

  const t = {
    ar: {
      draft: 'مسوّدة محتوى للمراجعة والاعتماد — غير منشورة للمتطوعين بعد',
      outcomes: 'ماذا ستتعلّم؟',
      minutes: 'دقيقة',
      modules: 'وحدات',
      pass: 'درجة النجاح',
      sources: 'المراجع التي بُني عليها المحتوى',
      back: 'كل الدورات',
    },
    en: {
      draft: 'Draft content for review and approval — not yet published to volunteers',
      outcomes: 'What you will learn',
      minutes: 'min',
      modules: 'modules',
      pass: 'Pass mark',
      sources: 'Standards this content is built on',
      back: 'All courses',
    },
  }[lang];

  return (
    <>
      <CourseLd lang={lang} course={course} slug={slug} />

      {!isApproved && (
        <p className="bg-brand-orange px-4 py-2.5 text-center text-[0.83rem] font-extrabold text-[#241503]">
          {t.draft}
        </p>
      )}

      {/* ------------------------------------------------------------ hero */}
      <div className="bg-brand-blue-deep text-white">
        <Container className="py-10 sm:py-14">
          <nav
            // Authored in both locales in dictionaries/lms.ts. It was the last
            // English-only user-facing string in the codebase.
            aria-label={dict.account.map.breadcrumb}
            className="flex flex-wrap items-center text-[0.88rem] text-on-deep-2"
          >
            <Link
              href={`/${lang}/academy`}
              className="inline-flex min-h-11 items-center font-bold hover:text-white"
            >
              {a.breadcrumbAcademy}
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span>{CATEGORIES[meta.category][lang]}</span>
          </nav>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-white/10 px-3.5 py-1 text-[0.82rem] font-extrabold">
              {a.level} {meta.level}
            </span>
            <span className="rounded-full bg-white/10 px-3.5 py-1 text-[0.82rem] font-extrabold">
              {DIFFICULTY_LABEL[meta.difficulty][lang]}
            </span>
            {standing !== 'not-started' && (
              <span
                className={`rounded-full px-3.5 py-1 text-[0.82rem] font-extrabold ${
                  standing === 'completed' ? 'bg-ok text-white' : 'bg-brand-orange text-[#241503]'
                }`}
              >
                {standing === 'completed' ? `✓ ${a.completed}` : a.inProgress}
              </span>
            )}
          </div>

          <h1 className="mt-4 flex flex-wrap items-center gap-3 text-[clamp(1.7rem,1.3rem+2vw,2.7rem)] font-black leading-tight tracking-tight text-white">
            <span aria-hidden>{meta.icon}</span>
            {course.title[lang]}
          </h1>
          <p className="mt-3.5 max-w-[62ch] text-[1.05rem] leading-relaxed text-[#c4daea]">
            {course.lede[lang]}
          </p>

          <dl className="mt-7 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <HeroFact label={a.duration} value={`${course.minutes} ${t.minutes}`} />
            <HeroFact label={a.modulesWord} value={String(course.modules.length)} />
            <HeroFact label={a.questionsWord} value={String(questionCount)} />
            <HeroFact label={a.passMark} value={`${course.passMark}%`} />
          </dl>

          {/* Progress before the call to action: somebody returning wants to
              see where they were, not be asked to start again. */}
          {user && modulesRead > 0 && (
            <div className="mt-7 max-w-md">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-[0.85rem] font-bold text-[#c4daea]">
                <span>{a.progressTitle}</span>
                <span dir="ltr">{Math.round(percent)}%</span>
              </div>
              <ProgressBar
                percent={percent}
                label={course.title[lang]}
                tone={standing === 'completed' ? 'ok' : 'orange'}
              />
              <p className="mt-2 text-[0.85rem] text-[#9dbbd2]">
                {a.modulesDone
                  .replace('{done}', String(modulesRead))
                  .replace('{total}', String(course.modules.length))}
              </p>
            </div>
          )}

          {isApproved && (
            <div className="mt-7 flex flex-wrap gap-3">
              <PrimaryAction href={`#${startTargetId}`}>
                {standing === 'completed'
                  ? a.review
                  : standing === 'in-progress'
                    ? a.resume
                    : a.start}
              </PrimaryAction>
              {!user && (
                <Link
                  href={`/${lang}/login`}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 text-[0.95rem] font-bold text-white transition-colors hover:bg-white/10"
                >
                  {a.signInCta}
                </Link>
              )}
            </div>
          )}
        </Container>
      </div>

      <Section>
        <Container>
          {!user && isApproved && (
            <p className="mb-8 rounded-xl border border-line bg-surface-2 px-5 py-4 text-[0.95rem] leading-relaxed text-ink-2">
              {a.signInToTrack}
            </p>
          )}

          {/* --------------------------------------------- requirements */}
          <section className="mb-10 rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-[1.1rem] font-extrabold">{a.requirementsTitle}</h2>
            {meta.requires.length === 0 && meta.recommends.length === 0 ? (
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-2">{a.noRequirements}</p>
            ) : (
              <div className="mt-4 space-y-5">
                {meta.requires.length > 0 && (
                  <CourseList
                    lang={lang}
                    label={a.requiresLabel}
                    slugs={meta.requires}
                    done={passed}
                    required
                  />
                )}
                {meta.recommends.length > 0 && (
                  <CourseList
                    lang={lang}
                    label={a.recommendsLabel}
                    slugs={meta.recommends}
                    done={passed}
                    required={false}
                  />
                )}
              </div>
            )}
            {!eligibility.allowed && (
              <div className="mt-5 rounded-xl border border-danger/30 bg-danger/[0.07] p-4">
                <p className="font-extrabold text-danger">🔒 {a.lockedTitle}</p>
                <p className="mt-1.5 text-[0.94rem] leading-relaxed text-ink-2">{a.lockedBody}</p>
              </div>
            )}
          </section>

          {/* ------------------------------------------ course information */}
          <div className="mb-10 grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="mb-4 text-[1.1rem] font-extrabold">{a.aboutTitle}</h2>
              <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
                <Fact label={a.level} value={String(meta.level)} />
                <Fact label={a.difficulty} value={DIFFICULTY_LABEL[meta.difficulty][lang]} />
                <Fact label={a.duration} value={`${course.minutes} ${t.minutes}`} />
                <Fact label={a.modulesWord} value={String(course.modules.length)} />
                <Fact label={a.questionsWord} value={String(questionCount)} />
                <Fact label={a.passMark} value={`${course.passMark}%`} />
                <Fact label={a.language} value={lang === 'ar' ? 'العربية / English' : 'Arabic / English'} />
                <Fact label={a.certificate} value={a.certificateYes} />
              </dl>
            </section>

            <section className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="mb-4 text-[1.1rem] font-extrabold">{a.audienceTitle}</h2>
              <ul className="space-y-2.5">
                {meta.audience[lang].map((item) => (
                  <li key={item} className="flex gap-2.5 text-[0.96rem] leading-relaxed text-ink-2">
                    <span className="text-brand-blue dark:text-sky-300" aria-hidden>
                      ●
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <h2 className="mb-4 mt-7 text-[1.1rem] font-extrabold">{a.rewardsTitle}</h2>
              <ul className="space-y-2.5">
                {meta.outcomes[lang].map((item) => (
                  <li key={item} className="flex gap-2.5 text-[0.96rem] leading-relaxed text-ink-2">
                    <span className="text-ok" aria-hidden>
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* ------------------------------------------------- what you learn */}
          <h2 className="mb-4 text-[1.25rem] font-extrabold">{a.outcomesTitle}</h2>
          <div className="mb-10 grid gap-2.5 sm:grid-cols-2">
            {course.outcomes[lang].map((o, i) => (
              <div
                key={i}
                className="rounded-xl border border-line border-s-[3px] border-s-brand-blue bg-surface p-4 text-[0.93rem] text-ink-2"
              >
                {o}
              </div>
            ))}
          </div>

          {/* ------------------------------------------------------ contents */}
          <section id="contents" className="mb-12 scroll-mt-24 rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-[1.15rem] font-extrabold">{a.contentsTitle}</h2>
            <ol className="mt-4 space-y-2">
              {course.modules.map((mod, i) => {
                const done = readModules.includes(mod.id);
                const isCurrent = !done && course.modules.slice(0, i).every((m) => readModules.includes(m.id));
                return (
                  <li key={mod.id}>
                    <a
                      href={`#${mod.id}`}
                      className={`flex items-center gap-3 rounded-xl border p-3.5 transition-colors hover:bg-surface-2 ${
                        isCurrent ? 'border-brand-orange bg-brand-orange/[0.06]' : 'border-line'
                      }`}
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[0.9rem] font-extrabold ${
                          done
                            ? 'bg-ok text-white'
                            : isCurrent
                              ? 'bg-brand-orange text-[#241503]'
                              : 'border border-line text-ink-3'
                        }`}
                        aria-hidden
                      >
                        {done ? '✓' : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold leading-snug">{mod.title[lang]}</span>
                        {(done || isCurrent) && (
                          <span
                            className={`mt-0.5 block text-[0.82rem] font-bold ${
                              done ? 'text-ok' : 'text-brand-orange-text dark:text-brand-orange'
                            }`}
                          >
                            {done ? a.moduleDone : a.moduleCurrent}
                          </span>
                        )}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </section>

          <CourseProgressProvider totalQuestions={questionCount} initiallyAnswered={answeredIds}>
            {course.modules.map((mod, i) => (
              <section key={mod.id} className="mb-14 scroll-mt-24" id={mod.id}>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-[0.82rem] font-extrabold text-brand-blue dark:bg-sky-300/10 dark:text-sky-300">
                    {a.moduleOf
                      .replace('{n}', String(i + 1))
                      .replace('{total}', String(course.modules.length))}
                  </span>
                  {readModules.includes(mod.id) && (
                    <span className="text-[0.82rem] font-extrabold text-ok">✓ {a.moduleDone}</span>
                  )}
                </div>

                <h2 className="text-[clamp(1.4rem,1.15rem+1.2vw,2rem)] font-extrabold tracking-tight">
                  {mod.title[lang]}
                </h2>
                <p className="mb-7 mt-3 max-w-[64ch] text-[1.05rem] leading-relaxed text-ink-2">
                  {mod.lede[lang]}
                </p>

                {mod.blocks.map((b, bi) => renderBlock(b, lang, bi, quizContext))}

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                  {user && (
                    <ModuleRead
                      lang={lang}
                      slug={slug}
                      moduleId={mod.id}
                      done={readModules.includes(mod.id)}
                    />
                  )}
                  {/* min-h-11 on both: these are the two links a volunteer uses
                      most on a phone, and a 26px-tall inline link is a miss. */}
                  <a
                    href={i + 1 < course.modules.length ? `#${course.modules[i + 1].id}` : '#finish'}
                    className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-[0.92rem] font-extrabold text-brand-blue transition-colors hover:bg-surface-2 dark:text-brand-orange"
                  >
                    {i + 1 < course.modules.length ? `${a.nextModule} →` : `${dict.account.learning.title} →`}
                  </a>
                  <a
                    href="#contents"
                    className="inline-flex min-h-11 items-center px-1 text-[0.9rem] font-bold text-ink-3 hover:underline"
                  >
                    {a.backToContents}
                  </a>
                </div>
              </section>
            ))}

            {isApproved && questionCount > 0 && (
              <div id="finish" className="scroll-mt-24">
                <CourseFinish lang={lang} slug={slug} passMark={course.passMark} />
              </div>
            )}
          </CourseProgressProvider>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="mb-3 text-[0.86rem] font-extrabold tracking-[0.1em] text-ink-3">
              {a.referencesTitle}
            </h2>
            <ul className="flex flex-col gap-1.5">
              {course.sources.map((s) => (
                <li key={s} dir="ltr" className="text-start text-[0.88rem] text-ink-2">
                  • {s}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>
    </>
  );
}

/** The page for a course that is planned but not yet written. */
function PlannedCourse({
  lang,
  dict,
  meta,
}: {
  lang: Locale;
  dict: Dictionary;
  meta: NonNullable<ReturnType<typeof courseBySlug>>;
}) {
  const a = dict.account.academy;
  return (
    <>
      <div className="bg-brand-blue-deep text-white">
        <Container className="py-10 sm:py-14">
          <nav
            // Authored in both locales in dictionaries/lms.ts. It was the last
            // English-only user-facing string in the codebase.
            aria-label={dict.account.map.breadcrumb}
            className="flex flex-wrap items-center text-[0.88rem] text-on-deep-2"
          >
            <Link
              href={`/${lang}/academy`}
              className="inline-flex min-h-11 items-center font-bold hover:text-white"
            >
              {a.breadcrumbAcademy}
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span>{CATEGORIES[meta.category][lang]}</span>
          </nav>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-white/10 px-3.5 py-1 text-[0.82rem] font-extrabold">
              {a.level} {meta.level}
            </span>
            <span className="rounded-full bg-white/10 px-3.5 py-1 text-[0.82rem] font-extrabold">
              {DIFFICULTY_LABEL[meta.difficulty][lang]}
            </span>
            <span className="rounded-full border border-white/25 px-3.5 py-1 text-[0.82rem] font-extrabold text-[#c4daea]">
              {a.statusSoon}
            </span>
          </div>

          <h1 className="mt-4 flex flex-wrap items-center gap-3 text-[clamp(1.7rem,1.3rem+2vw,2.7rem)] font-black leading-tight tracking-tight text-white">
            <span aria-hidden>{meta.icon}</span>
            {meta.title[lang]}
          </h1>
          <p className="mt-3.5 max-w-[62ch] text-[1.05rem] leading-relaxed text-[#c4daea]">
            {meta.summary[lang]}
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <p className="mb-8 rounded-xl border border-brand-orange/40 bg-brand-orange/[0.08] px-5 py-4 text-[0.98rem] leading-relaxed text-ink-2">
            {a.soonBody}
          </p>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="mb-4 text-[1.1rem] font-extrabold">{a.audienceTitle}</h2>
              <ul className="space-y-2.5">
                {meta.audience[lang].map((item) => (
                  <li key={item} className="flex gap-2.5 text-[0.96rem] leading-relaxed text-ink-2">
                    <span className="text-brand-blue dark:text-sky-300" aria-hidden>
                      ●
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="mb-4 text-[1.1rem] font-extrabold">{a.requirementsTitle}</h2>
              {meta.requires.length === 0 && meta.recommends.length === 0 ? (
                <p className="text-[0.96rem] leading-relaxed text-ink-2">{a.noRequirements}</p>
              ) : (
                <ul className="space-y-2">
                  {[...meta.requires, ...meta.recommends].map((s) => {
                    const c = courseBySlug(s);
                    return (
                      <li key={s}>
                        <Link
                          href={`/${lang}/academy/${s}` as Parameters<typeof Link>[0]['href']}
                          className="block rounded-xl border border-line p-3 font-bold transition-colors hover:bg-surface-2"
                        >
                          {c ? c.title[lang] : s}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <div className="mt-8">
            <Link
              href={`/${lang}/academy`}
              className="inline-flex min-h-11 items-center font-extrabold text-brand-blue hover:underline dark:text-brand-orange"
            >
              ← {a.breadcrumbAcademy}
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}

function HeroFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.82rem] font-bold tracking-[0.1em] text-[#9dbbd2]">{label}</dt>
      <dd className="mt-1 text-[1.15rem] font-extrabold text-white" dir="auto">
        {value}
      </dd>
    </div>
  );
}

/** The prerequisite and recommendation lists, with what is already done ticked. */
function CourseList({
  lang,
  label,
  slugs,
  done,
  required,
}: {
  lang: Locale;
  label: string;
  slugs: string[];
  done: Set<string>;
  required: boolean;
}) {
  return (
    <div>
      <p className="text-[0.82rem] font-bold tracking-[0.09em] text-ink-3">{label}</p>
      <ul className="mt-2.5 space-y-2">
        {slugs.map((s) => {
          const c = courseBySlug(s);
          const met = done.has(s);
          return (
            <li key={s}>
              <Link
                href={`/${lang}/academy/${s}` as Parameters<typeof Link>[0]['href']}
                className="flex items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:bg-surface-2"
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[0.82rem] font-extrabold ${
                    met ? 'bg-ok text-white' : required ? 'bg-danger/15 text-danger' : 'bg-surface-2 text-ink-3'
                  }`}
                  aria-hidden
                >
                  {met ? '✓' : required ? '!' : '·'}
                </span>
                <span className="font-bold">{c ? c.title[lang] : s}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

