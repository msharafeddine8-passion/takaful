import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { TEMPLATES } from '@/lib/templates/catalogue';
import { pick, type Template } from '@/lib/templates/types';
import { courseBySlug } from '@/lib/courses';

/**
 * The forms library.
 *
 * Static. Nothing here depends on who is looking — a form is a form, and a
 * volunteer about to run their first activity should be able to find the
 * attendance sheet without an account. That is the whole reason attendance
 * has been coming back as photographs of unlined paper.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/resources'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.resources.title,
    description: dict.resources.lede,
    alternates: alternatesFor(lang, '/resources'),
  };
}

export default async function ResourcesPage(props: PageProps<'/[lang]/resources'>) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.resources;

  const ready = TEMPLATES.filter((x) => x.review === 'ready');
  const held = TEMPLATES.filter((x) => x.review === 'needs-review');

  return (
    <Section>
      <Container className="max-w-5xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>
        {/* The ready grid needs a heading of its own. Without it the page ran
            h1 straight to the h3 on every card, and a screen reader announced
            a level that was not there. */}
        <h2 className="mt-9 text-[1.2rem] font-extrabold">{t.readyTitle}</h2>
        <p className="mt-1.5 text-[0.88rem] font-bold text-ink-3">
          {t.readyCount
            .replace('{n}', String(ready.length))
            .replace('{total}', String(TEMPLATES.length))}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {ready.map((x) => (
            <Card key={x.slug} template={x} lang={lang} dict={dict} />
          ))}
        </div>

        {/* ------------------------------------------------------- held */}
        {held.length > 0 && (
          <section className="mt-14">
            <h2 className="text-[1.2rem] font-extrabold">{t.heldTitle}</h2>
            <p className="mt-2.5 max-w-[62ch] text-[0.97rem] leading-relaxed text-ink-2">
              {t.heldLede}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {held.map((x) => (
                <Card key={x.slug} template={x} lang={lang} dict={dict} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </Section>
  );
}

function Card({
  template,
  lang,
  dict,
}: {
  template: Template;
  lang: Locale;
  dict: Dictionary;
}) {
  const t = dict.resources;
  const course = template.course ? courseBySlug(template.course) : null;
  const heldBack = template.review === 'needs-review';

  return (
    <article
      className={`flex flex-col rounded-2xl border p-5 ${
        heldBack ? 'border-brand-orange/40 bg-brand-orange/[0.05]' : 'border-line bg-surface'
      }`}
    >
      {heldBack && (
        <p className="mb-2.5 inline-flex w-fit rounded-full bg-brand-orange px-3 py-1 text-[0.75rem] font-extrabold text-[#241503]">
          {t.heldBadge}
        </p>
      )}

      <h3 className="text-[1.05rem] font-extrabold leading-snug">{pick(template.title, lang)}</h3>
      <p className="mt-2 flex-1 text-[0.92rem] leading-relaxed text-ink-2">
        {pick(template.purpose, lang)}
      </p>

      {course && (
        <p className="mt-3 text-[0.84rem] text-ink-3">
          {t.forCourse}{' '}
          <Link
            href={`/${lang}/academy/${template.course}` as Parameters<typeof Link>[0]['href']}
            className="font-bold text-brand-blue hover:underline dark:text-brand-orange"
          >
            {course.title[lang]}
          </Link>
        </p>
      )}

      <div className="mt-4">
        <Link
          href={`/${lang}/resources/${template.slug}` as Parameters<typeof Link>[0]['href']}
          className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-[0.9rem] font-extrabold transition-colors hover:bg-surface-2"
        >
          {/* Held forms still open — the page explains what is missing and
              who has to sign it off. A card that leads nowhere just gets
              clicked twice. */}
          {t.openCta}
        </Link>
      </div>
    </article>
  );
}
