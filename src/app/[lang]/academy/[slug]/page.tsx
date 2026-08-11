import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section } from '@/components/ui';
import { Quiz } from '@/components/Quiz';
import { CourseProgressProvider } from '@/components/CourseProgress';
import { CourseFinish } from '@/components/CourseFinish';
import { ModuleRead } from '@/components/ModuleRead';
import { COURSE_CONTENT } from '@/lib/course-content';
import { COURSES } from '@/lib/courses';
import { isDbConfigured } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { startOrResumeAttempt, questionsIn, completedModules, type Attempt } from '@/lib/academy';
import type { Block, CourseContent } from '@/lib/course-content/types';

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
  if (!course) return {};
  return {
    title: course.title[lang],
    description: course.lede[lang],
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
  warn: 'text-brand-orange-dark dark:text-brand-orange',
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
              <h4 className="mb-1.5 text-[1rem] font-extrabold text-brand-blue dark:text-sky-300">
                {item.title[lang]}
              </h4>
              <p className="text-[0.9rem] leading-relaxed text-ink-2">{item.text[lang]}</p>
            </div>
          ))}
        </div>
      );

    case 'compare':
      return (
        <div key={key} className="my-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-ok/30 bg-ok/[0.08] p-5">
            <h4 className="mb-2.5 text-[0.98rem] font-extrabold text-ok">{block.yesTitle[lang]}</h4>
            <ul className="flex list-disc flex-col gap-1.5 ps-5 text-[0.92rem] text-ink-2">
              {block.yes[lang].map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-danger/30 bg-danger/[0.07] p-5">
            <h4 className="mb-2.5 text-[0.98rem] font-extrabold text-danger">
              {block.noTitle[lang]}
            </h4>
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
  if (!course) notFound();
  const dict = getDictionary(lang);
  const isApproved = COURSES.find((c) => c.slug === slug)?.status === 'available';
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
      {!isApproved && (
        <p className="bg-brand-orange px-4 py-2.5 text-center text-[0.83rem] font-extrabold text-[#241503]">
          {t.draft}
        </p>
      )}

      <div className="bg-brand-blue-deep text-white">
        <Container className="py-12">
          <p className="text-[0.83rem] font-semibold text-[#9dbbd2]">
            {dict.home.academyTitle} · {dict.journey.levelWord} {course.level}
          </p>
          <h1 className="mt-3 text-[clamp(1.7rem,1.3rem+2vw,2.7rem)] font-extrabold tracking-tight text-white">
            {course.title[lang]}
          </h1>
          <p className="mt-3.5 max-w-[62ch] text-[1.05rem] leading-relaxed text-[#c4daea]">
            {course.lede[lang]}
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {[
              `⏱ ${course.minutes} ${t.minutes}`,
              `📚 ${course.modules.length} ${t.modules}`,
              `🎓 ${t.pass}: ${course.passMark}%`,
            ].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[0.85rem] font-bold"
              >
                {chip}
              </span>
            ))}
          </div>
        </Container>
      </div>

      <Section>
        <Container>
          <h2 className="mb-4 text-[1.3rem] font-extrabold">{t.outcomes}</h2>
          <div className="mb-12 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {course.outcomes[lang].map((o, i) => (
              <div
                key={i}
                className="rounded-xl border border-line border-s-[3px] border-s-brand-blue bg-surface p-4 text-[0.93rem] text-ink-2"
              >
                {o}
              </div>
            ))}
          </div>

          {/* Quizzes report their answers up to this provider so the finish
              bar below can send them all at once for server-side scoring. */}
          {/* Where they stopped last time, so a ninety-minute course read on a
              phone does not start from the top every evening. */}
          {user && readModules.length > 0 && readModules.length < course.modules.length && (
            <ResumeBar lang={lang} course={course} read={readModules} />
          )}

          <CourseProgressProvider totalQuestions={questionCount} initiallyAnswered={answeredIds}>
          {course.modules.map((mod) => (
            <section key={mod.id} className="mb-14 scroll-mt-24" id={mod.id}>
              <p className="text-[0.76rem] font-extrabold tracking-[0.14em] text-brand-orange-dark dark:text-brand-orange">
                {mod.tag[lang]}
              </p>
              <h2 className="mt-2 text-[clamp(1.4rem,1.15rem+1.2vw,2rem)] font-extrabold tracking-tight">
                {mod.title[lang]}
              </h2>
              <p className="mb-7 mt-3 max-w-[64ch] text-[1.05rem] leading-relaxed text-ink-2">
                {mod.lede[lang]}
              </p>
              {mod.blocks.map((b, i) => renderBlock(b, lang, i, quizContext))}
              {user && (
                <ModuleRead
                  lang={lang}
                  slug={slug}
                  moduleId={mod.id}
                  done={readModules.includes(mod.id)}
                />
              )}
            </section>
          ))}

          {isApproved && questionCount > 0 && (
            <CourseFinish lang={lang} slug={slug} passMark={course.passMark} />
          )}
          </CourseProgressProvider>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="mb-3 text-[0.86rem] font-extrabold tracking-[0.1em] text-ink-3">
              {t.sources}
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

function ResumeBar({
  lang,
  course,
  read,
}: {
  lang: Locale;
  course: CourseContent;
  read: string[];
}) {
  const next = course.modules.find((m) => !read.includes(m.id));
  if (!next) return null;

  const t = {
    ar: {
      title: 'أكملت',
      of: 'من',
      unit: 'وحدات',
      cta: 'تابع من',
    },
    en: { title: 'You finished', of: 'of', unit: 'modules', cta: 'Continue from' },
  }[lang];

  return (
    <div className="mb-10 rounded-2xl border-2 border-brand-blue/30 bg-brand-blue/[0.06] p-5">
      <p className="text-[0.94rem] font-bold text-ink-2">
        {t.title} {read.length} {t.of} {course.modules.length} {t.unit}
      </p>
      <a
        href={`#${next.id}`}
        className="mt-2 inline-block text-[1.02rem] font-extrabold text-brand-blue hover:underline dark:text-sky-300"
      >
        {t.cta}: {next.title[lang]} →
      </a>
    </div>
  );
}
