import { Quiz } from '@/components/Quiz';
import type { Block } from '@/lib/course-content/types';
import type { Locale } from '@/lib/i18n';

/**
 * The content blocks a module is made of.
 *
 * Lifted out of the course page when the player was added, so that the
 * overview and the player cannot drift into rendering the same authored
 * content two different ways. It was already 830 lines in one file with the
 * gate, the hero and the catalogue links; the blocks were the part both
 * routes needed.
 */

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
export type QuizContext = {
  slug: string;
  /** Display order of the options, per question id. */
  order: Record<string, number[]>;
  /** What the server has already recorded, keyed by question id. */
  previous: Record<string, { displayedIndex: number; correct: boolean; feedback: string }>;
};

export function renderBlock(block: Block, lang: Locale, key: number, quiz: QuizContext) {
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
        <div key={key} className="my-6 grid gap-3 sm:grid-cols-2">
          {block.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface p-4">
              {/*
               * h2, because in the player the module title is the h1.
               *
               * These were h3 when a course was one page and every module
               * title was an h2 under the page's single h1. Splitting the
               * course promoted the module to h1 and left these behind, so
               * the outline ran h1 → h3 and a screen reader announced a level
               * that was never there.
               */}
              <h2 className="mb-1.5 text-[1rem] font-extrabold text-brand-blue dark:text-sky-300">
                {item.title[lang]}
              </h2>
              <p className="text-[0.9rem] leading-relaxed text-ink-2">{item.text[lang]}</p>
            </div>
          ))}
        </div>
      );

    case 'compare':
      return (
        <div key={key} className="my-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-ok/30 bg-ok/[0.08] p-5">
            <h2 className="mb-2.5 text-[0.98rem] font-extrabold text-ok">{block.yesTitle[lang]}</h2>
            <ul className="flex list-disc flex-col gap-1.5 ps-5 text-[0.92rem] text-ink-2">
              {block.yes[lang].map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-danger/30 bg-danger/[0.07] p-5">
            <h2 className="mb-2.5 text-[0.98rem] font-extrabold text-danger">
              {block.noTitle[lang]}
            </h2>
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
