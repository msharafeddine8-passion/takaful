import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, locales, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section } from '@/components/ui';
import { Quiz } from '@/components/Quiz';
import { COURSE_CONTENT } from '@/lib/course-content';
import type { Block } from '@/lib/course-content/types';

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    Object.keys(COURSE_CONTENT).map((slug) => ({ lang, slug })),
  );
}

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

function renderBlock(block: Block, lang: Locale, key: number) {
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

    case 'quiz':
      return (
        <Quiz
          key={key}
          lang={lang}
          label={block.label[lang]}
          question={block.question[lang]}
          scenario={block.scenario?.[lang]}
          options={block.options.map((o) => o[lang])}
          correct={block.correct}
          feedback={block.feedback[lang]}
        />
      );
  }
}

export default async function CoursePage(props: PageProps<'/[lang]/academy/[slug]'>) {
  const { lang, slug } = await props.params;
  if (!isLocale(lang)) notFound();
  const course = COURSE_CONTENT[slug];
  if (!course) notFound();
  const dict = getDictionary(lang);

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
      <p className="bg-brand-orange px-4 py-2.5 text-center text-[0.83rem] font-extrabold text-[#241503]">
        {t.draft}
      </p>

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
              {mod.blocks.map((b, i) => renderBlock(b, lang, i))}
            </section>
          ))}

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
