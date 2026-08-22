import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { Container } from '@/components/ui';
import { CourseProgressProvider } from '@/components/CourseProgress';
import { CourseFinish } from '@/components/CourseFinish';
import { COURSE_CONTENT } from '@/lib/course-content';
import { courseBySlug } from '@/lib/courses';
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
import { decideAccess } from '@/lib/programme/access';
import { CourseLocked } from '@/components/academy/CourseLocked';
import { renderBlock, type QuizContext } from '@/components/academy/Blocks';
import { PlayerShell } from '@/components/academy/PlayerShell';
import { UnitFooter } from '@/components/academy/UnitFooter';
import {
  unitsOf,
  findUnit,
  neighbours,
  unitStates,
  unitProgress,
  ASSESSMENT_ID,
  type Unit,
  type UnitState,
} from '@/lib/programme/player';

/**
 * One unit of a course, on its own screen.
 *
 * The academy was one page per course: every module, every quiz and the
 * finish bar in a single document. Safeguarding is seven modules and, on a
 * phone, a scroll long enough that the only way to find where you stopped was
 * to remember roughly how far down it had been. Progress was recorded by a
 * button most readers never pressed, because the link to the next module sat
 * beside it and did the thing they actually wanted.
 *
 * Splitting it means the reader's position is a URL. The back button works.
 * A bookmark works. "Read the module on disclosure" is a link somebody can be
 * sent. And moving on is the same action as recording that you got this far,
 * so the two cannot come apart.
 *
 * The overview page at /academy/[slug] keeps the hero, the outcomes and the
 * contents; it no longer renders the module bodies. Two routes serving the
 * same authored paragraphs would be duplicate content to a search engine and
 * two places to fix a typo.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/academy/[slug]/learn/[unit]'>,
): Promise<Metadata> {
  const { lang, slug, unit } = await props.params;
  if (!isLocale(lang)) return {};
  const course = COURSE_CONTENT[slug];
  const meta = courseBySlug(slug);
  if (!course || !meta) return {};

  /*
   * The gate again, for the title.
   *
   * Naming the module in the tab looked harmless until a locked course was
   * opened: the page correctly refused to show a word of the content, and the
   * browser tab read "Leading teams and assigning roles — Team leadership".
   * The overview page hides the module list of a locked course entirely, so
   * the title was the one place a stranger could read it back.
   *
   * An extra gate check per page view is the price. The alternative — never
   * naming the module — makes browser history useless for the reader who is
   * allowed to be there, and they are the majority.
   */
  const user = isDbConfigured() ? await currentUser() : null;
  const gate = await eligibilityFor(user?.id ?? null, slug);
  const readable = decideAccess({
    kind: meta.kind,
    signedIn: Boolean(user),
    prerequisitesMet: gate.allowed,
    published: meta.status === 'available',
  }).canRead;

  if (!readable) {
    return {
      title: course.title[lang],
      description: course.lede[lang],
      alternates: { canonical: `/${lang}/academy/${slug}` },
      robots: { index: false, follow: true },
    };
  }

  const mod = course.modules.find((m) => m.id === unit);
  const dict = getDictionary(lang);
  const title = mod
    ? `${mod.title[lang]} — ${course.title[lang]}`
    : `${dict.account.academy.player.assessmentTitle} — ${course.title[lang]}`;
  return {
    title,
    description: mod ? mod.lede[lang] : course.lede[lang],
    /*
     * Canonical to the overview, and out of the index.
     *
     * These pages are a reading position, not a document: the same unit shows
     * different quiz state to different people, and the assessment screen is
     * a form. Letting a search engine rank forty of them per course would
     * bury the one page that actually describes the course.
     */
    alternates: { canonical: `/${lang}/academy/${slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function UnitPage(
  props: PageProps<'/[lang]/academy/[slug]/learn/[unit]'>,
) {
  await connection();
  const { lang, slug, unit: unitId } = await props.params;
  if (!isLocale(lang)) notFound();
  const course = COURSE_CONTENT[slug];
  const meta = courseBySlug(slug);
  if (!course || !meta) notFound();

  const dict = getDictionary(lang);
  const a = dict.account.academy;
  const p = a.player;
  const isApproved = meta.status === 'available';
  const user = isDbConfigured() ? await currentUser() : null;

  /*
   * The gate first, exactly as on the overview page and for the same reason:
   * a locked course must not fetch the content it is about to refuse. This
   * route is the one that carries the module bodies, so getting the order
   * wrong here is the whole leak rather than part of it.
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
      <Container className="py-10">
        <CourseLocked
          lang={lang}
          dict={dict}
          meta={meta}
          state={access.state}
          missing={gate.missing}
        />
      </Container>
    );
  }

  const questions = questionsIn(slug);
  const units = unitsOf({
    moduleIds: course.modules.map((m) => m.id),
    hasQuestions: questions.length > 0,
  });
  const unit = findUnit(units, unitId);
  /* An id that is not a unit of this course is a 404, not a silent fallback
   * to the first one. A stale bookmark should say so rather than quietly
   * reopen a course from the top. */
  if (!unit) notFound();

  const mod = unit.kind === 'module' ? course.modules.find((m) => m.id === unit.id) : undefined;
  if (unit.kind === 'module' && !mod) notFound();

  /*
   * Opening the page opens the attempt, as it did before — the order the
   * options appear in belongs to the attempt, and the server has to grade
   * against the order it showed.
   */
  let attempt: Attempt | null = null;
  let readModules: string[] = [];
  let passed = false;
  if (user) {
    const [at, read, done] = await Promise.all([
      isApproved && questions.length > 0
        ? startOrResumeAttempt(user.id, slug)
        : Promise.resolve(null),
      completedModules(user.id, slug),
      passedCourseSlugs(user.id),
    ]);
    attempt = at;
    readModules = read;
    passed = done.has(slug);
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

  const { prev, next } = neighbours(units, unit.id);
  const states = unitStates(units, readModules, unit.id, passed);
  const progress = unitProgress(units, readModules);
  const href = (u: Unit) => `/${lang}/academy/${slug}/learn/${u.id}`;

  const nav = (
    <UnitList
      units={units}
      states={states}
      course={course}
      lang={lang}
      p={p}
      href={href}
    />
  );

  return (
    <div className="pb-16">
      {/* --------------------------------------------------------- top bar */}
      <div className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <Container className="py-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href={`/${lang}/academy/${slug}` as Parameters<typeof Link>[0]['href']}
              className="inline-flex min-h-11 min-w-0 items-center gap-2 text-[0.92rem] font-extrabold hover:underline"
            >
              <span aria-hidden>{lang === 'ar' ? '→' : '←'}</span>
              <span className="truncate">{course.title[lang]}</span>
            </Link>
            {/*
             * Counted in modules, not screens.
             *
             * The first version put "unit 1 of 7" here — screens, assessment
             * included — directly above the module's own "unit 1 of 6". Two
             * numbers with the same label on one screen, and no way for the
             * reader to tell which was wrong. The assessment is not a unit of
             * the course to anybody reading it, so it says what it is instead
             * of claiming a number.
             */}
            <span className="ms-auto shrink-0 text-[0.85rem] font-bold text-ink-3" dir="auto">
              {unit.kind === 'assessment'
                ? p.assessmentTitle
                : p.unitOf
                    .replace('{n}', String(unit.position))
                    .replace('{total}', String(course.modules.length))}
            </span>
          </div>

          {/* The bar is the only thing on the page that says how much is left.
              It carries its own accessible name and value so it is not just a
              coloured rectangle to a screen reader. */}
          <div
            role="progressbar"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={p.progressAria}
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className="h-full rounded-full bg-ok transition-[width] duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </Container>
      </div>

      <Container className="pt-7">
        <PlayerShell
          nav={nav}
          showLabel={p.contentsShow}
          hideLabel={p.contentsHide}
          contentsLabel={p.contents}
        >
          <article className="mt-5 lg:mt-0">
            {unit.kind === 'module' && mod ? (
              <>
                {/* The position is in the bar above, once. It used to be here
                    as well, with a different total. */}
                <h1 className="text-[clamp(1.5rem,1.2rem+1.4vw,2.1rem)] font-extrabold leading-tight tracking-tight">
                  {mod.title[lang]}
                </h1>
                <p className="mb-8 mt-3 max-w-[64ch] text-[1.05rem] leading-relaxed text-ink-2">
                  {mod.lede[lang]}
                </p>
                {mod.blocks.map((b, bi) => renderBlock(b, lang, bi, quizContext))}
              </>
            ) : (
              <>
                <h1 className="text-[clamp(1.5rem,1.2rem+1.4vw,2.1rem)] font-extrabold leading-tight tracking-tight">
                  {p.assessmentTitle}
                </h1>
                <p className="mb-8 mt-3 max-w-[64ch] text-[1.05rem] leading-relaxed text-ink-2">
                  {p.assessmentLede}
                </p>
                {/*
                 * The provider is seeded from what the server recorded, not
                 * from what this screen has seen. The questions are answered
                 * on the module screens, several navigations ago — client
                 * state from those pages is long gone, and the database is
                 * the only thing that knows.
                 */}
                <CourseProgressProvider
                  totalQuestions={questions.length}
                  initiallyAnswered={Object.keys(quizContext.previous)}
                >
                  <CourseFinish lang={lang} slug={slug} passMark={course.passMark} />
                </CourseProgressProvider>
              </>
            )}

            {/* Signed out there is nothing to save, so the footer offers the
                way forward without pretending to record anything. */}
            <UnitFooter
              lang={lang}
              slug={slug}
              moduleId={user && unit.kind === 'module' ? unit.id : null}
              done={readModules.includes(unit.id)}
              prevHref={prev ? href(prev) : null}
              nextHref={next ? href(next) : null}
              labels={{
                next: p.next,
                prev: p.prev,
                markAndNext: p.markAndNext,
                saving: p.saving,
                savedJust: p.savedJust,
              }}
            />

            {!user && (
              <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-[0.95rem] leading-relaxed text-ink-2">
                {a.signInToTrack}{' '}
                <Link
                  href={`/${lang}/login` as Parameters<typeof Link>[0]['href']}
                  className="font-extrabold text-brand-blue hover:underline dark:text-brand-orange"
                >
                  {a.signInCta}
                </Link>
              </p>
            )}
          </article>
        </PlayerShell>
      </Container>
    </div>
  );
}

const DOT: Record<UnitState, string> = {
  done: 'bg-ok text-white',
  current: 'bg-brand-orange text-[#241503]',
  ahead: 'border border-line text-ink-3',
};

function UnitList({
  units,
  states,
  course,
  lang,
  p,
  href,
}: {
  units: Unit[];
  states: Map<string, UnitState>;
  course: (typeof COURSE_CONTENT)[string];
  lang: Locale;
  p: Dictionary['account']['academy']['player'];
  href: (u: Unit) => string;
}) {
  const label: Record<UnitState, string> = {
    done: p.stateDone,
    current: p.stateCurrent,
    ahead: p.stateAhead,
  };
  return (
    <ol className="space-y-1.5">
      {units.map((u) => {
        const state = states.get(u.id) ?? 'ahead';
        const title =
          u.id === ASSESSMENT_ID
            ? p.assessmentTitle
            : (course.modules.find((m) => m.id === u.id)?.title[lang] ?? u.id);
        return (
          <li key={u.id}>
            <Link
              href={href(u) as Parameters<typeof Link>[0]['href']}
              aria-current={state === 'current' ? 'page' : undefined}
              className={`flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-surface-2 ${
                state === 'current'
                  ? 'border-brand-orange bg-brand-orange/[0.07]'
                  : 'border-transparent'
              }`}
            >
              <span
                className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[0.8rem] font-extrabold ${DOT[state]}`}
                aria-hidden
              >
                {state === 'done' ? '✓' : u.position}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-[0.92rem] leading-snug ${
                    state === 'current' ? 'font-extrabold' : 'font-bold text-ink-2'
                  }`}
                >
                  {title}
                </span>
                {/* The tick and the orange fill both carry meaning that colour
                    alone would lose. This is the text version of them. */}
                <span className="sr-only">{label[state]}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
