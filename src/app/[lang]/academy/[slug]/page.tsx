import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section } from '@/components/ui';
import { CourseLd } from '@/components/StructuredData';
import { COURSE_CONTENT } from '@/lib/course-content';
import { CATEGORIES, DIFFICULTY_LABEL, courseBySlug } from '@/lib/courses';
import { isDbConfigured } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import {
  questionsIn,
  completedModules,
  eligibilityFor,
  passedCourseSlugs,
} from '@/lib/academy';
import {
  ProgressBar,
  PrimaryAction,
  Fact,
  type Standing,
} from '@/components/academy/parts';
import { decideAccess } from '@/lib/programme/access';
import { CourseLocked } from '@/components/academy/CourseLocked';
import { unitsOf, resumeUnitId, ASSESSMENT_ID, PRACTICAL_ID } from '@/lib/programme/player';
import { practicalTaskFor, practicalState } from '@/lib/programme/practical';
import { historyFor } from '@/lib/practical-submissions';
import { practical } from '@/lib/dictionaries/practical';

/*
 * The course, described. The course itself is at ./learn/[unit].
 *
 * This page used to carry both: the description and every module body, quiz
 * and the finish bar, in one document. The bodies moved to the player when
 * the academy went one-unit-per-screen, and they moved rather than being
 * copied — the same authored paragraphs on two routes would be duplicate
 * content to a search engine and two places to fix a typo.
 *
 * What is left is the page somebody lands on from a search or from the
 * catalogue: what the course covers, who it is for, what it needs first, and
 * one button into it. That is also why it stopped opening an attempt. Reading
 * the description is not sitting the paper, and every visit used to record
 * one.
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
  const user = isDbConfigured() ? await currentUser() : null;

  /*
   * The gate, before anything is built.
   *
   * This page used to load the questions, open an attempt and render every
   * module — and then print a padlock over the top. The lock was decoration: a
   * locked course sent 123KB of lessons to anybody with the URL, signed in or
   * not, and offered a "start the course" button underneath the sentence
   * saying they could not. It computed the right answer and ignored it.
   *
   * Deciding here means the refusal happens before `questionsIn`, before
   * `startOrResumeAttempt`, and before a single module is touched. The page
   * cannot leak content it never fetched, which is the only version of this
   * that survives somebody later adding an endpoint over the same objects.
   */
  const gate = await eligibilityFor(user?.id ?? null, slug);
  const access = decideAccess({
    kind: meta.kind,
    signedIn: Boolean(user),
    prerequisitesMet: gate.allowed,
    published: isApproved,
  });

  if (!access.canRead) {
    return (
      <CourseLocked lang={lang} dict={dict} meta={meta} state={access.state} missing={gate.missing} />
    );
  }

  const questionCount = questionsIn(slug).length;

  /*
   * Where this volunteer stands, worked out once and used by the hero, the
   * contents list and the call to action — so the three cannot disagree.
   */
  const task = practicalTaskFor(slug);
  const [readModules, passed, practicalHistory] = await Promise.all([
    user ? completedModules(user.id, slug) : Promise.resolve([] as string[]),
    user ? passedCourseSlugs(user.id) : Promise.resolve(new Set<string>()),
    /* Only for the handful of courses that set written work, and only for
     * somebody who could have done any. An extra query on every course page
     * to answer "no" for thirty-eight of them is a page that gets slower
     * because of a feature it does not use. */
    user && task ? historyFor(user.id, slug) : Promise.resolve([]),
  ]);
  const practicalDone = practicalState(practicalHistory) === 'approved';
  const eligibility = gate;
  const modulesRead = readModules.length;
  const hasPassed = passed.has(slug);
  const standing: Standing = hasPassed
    ? 'completed'
    : modulesRead > 0
      ? 'in-progress'
      : 'not-started';
  const percent = hasPassed
    ? 100
    : course.modules.length === 0
      ? 0
      : (modulesRead / course.modules.length) * 100;

  /*
   * Where the main button goes: into the player, at the unit they stopped on.
   * The resume rule lives in lib/programme/player.ts and is the same one
   * ./learn uses, so this button and that redirect cannot point at different
   * modules for the same reader.
   */
  const units = unitsOf({
    moduleIds: course.modules.map((m) => m.id),
    hasQuestions: questionCount > 0,
    hasPractical: task !== null,
  });
  const resumeId = resumeUnitId(units, readModules);
  const enterHref = `/${lang}/academy/${slug}/learn${resumeId ? `/${resumeId}` : ''}`;

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
              {meta.level === null ? a.electiveWord : `${a.level} ${meta.level}`}
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
              <PrimaryAction href={enterHref}>
                {standing === 'completed'
                  ? a.review
                  : standing === 'in-progress'
                    ? a.player.openResume
                    : a.player.open}
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
                <Fact
                  label={a.level}
                  value={meta.level === null ? a.electiveWord : String(meta.level)}
                />
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
          {/* Every row is a way in, not an anchor down the page. A reader who
              wants the module on disclosure can go straight to it instead of
              entering at the top and scrolling. */}
          <section id="contents" className="mb-12 scroll-mt-24 rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-[1.15rem] font-extrabold">{a.contentsTitle}</h2>
            <ol className="mt-4 space-y-2">
              {course.modules.map((mod, i) => {
                const done = readModules.includes(mod.id);
                const isCurrent = !done && course.modules.slice(0, i).every((m) => readModules.includes(m.id));
                return (
                  <li key={mod.id}>
                    <Link
                      href={`/${lang}/academy/${slug}/learn/${mod.id}` as Parameters<typeof Link>[0]['href']}
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
                    </Link>
                  </li>
                );
              })}

              {/* Written work is a step the reader takes too, and the same
                  argument applies to it as to the assessment below: a course
                  whose contents list stops at the last module looks finished
                  one step early. The tick follows a trainer's acceptance, not
                  a submission — see unitStates() in lib/programme/player.ts
                  for why those are not the same thing. */}
              {task && (
                <li>
                  <Link
                    href={`/${lang}/academy/${slug}/learn/${PRACTICAL_ID}` as Parameters<typeof Link>[0]['href']}
                    className="flex items-center gap-3 rounded-xl border border-line p-3.5 transition-colors hover:bg-surface-2"
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[0.9rem] font-extrabold ${
                        practicalDone ? 'bg-ok text-white' : 'border border-line text-ink-3'
                      }`}
                      aria-hidden
                    >
                      {practicalDone ? '✓' : course.modules.length + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold leading-snug">
                        {practical(lang).screenTitle}
                      </span>
                      <span className="mt-0.5 block text-[0.82rem] text-ink-3">
                        {task.title[lang]}
                      </span>
                    </span>
                  </Link>
                </li>
              )}

              {/* The assessment is a step the reader takes, so it belongs in
                  the list they are counting. Leaving it out made a seven
                  module course look finished at the seventh. */}
              {questionCount > 0 && (
                <li>
                  <Link
                    href={`/${lang}/academy/${slug}/learn/${ASSESSMENT_ID}` as Parameters<typeof Link>[0]['href']}
                    className="flex items-center gap-3 rounded-xl border border-line p-3.5 transition-colors hover:bg-surface-2"
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[0.9rem] font-extrabold ${
                        hasPassed ? 'bg-ok text-white' : 'border border-line text-ink-3'
                      }`}
                      aria-hidden
                    >
                      {/* Counted after the practical row above, when there is
                          one. Two rows both numbered 8 is the sort of thing
                          nobody reports and everybody notices. */}
                      {hasPassed ? '✓' : course.modules.length + (task ? 2 : 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold leading-snug">{a.player.assessmentTitle}</span>
                      <span className="mt-0.5 block text-[0.82rem] text-ink-3">
                        {a.questionsWord}: {questionCount} · {a.passMark} {course.passMark}%
                      </span>
                    </span>
                  </Link>
                </li>
              )}
            </ol>

            {isApproved && (
              <div className="mt-5">
                <PrimaryAction href={enterHref}>
                  {standing === 'completed'
                    ? a.review
                    : standing === 'in-progress'
                      ? a.player.openResume
                      : a.player.open}
                </PrimaryAction>
              </div>
            )}
          </section>

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
              {meta.level === null ? a.electiveWord : `${a.level} ${meta.level}`}
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

