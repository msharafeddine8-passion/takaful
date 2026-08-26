import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, locales } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section } from '@/components/ui';
import { PrintButton } from '@/components/PrintButton';
import { TemplateSheet } from '@/components/templates/TemplateSheet';
import { TEMPLATES, templateBySlug } from '@/lib/templates/catalogue';
import { pick } from '@/lib/templates/types';
import { courseBySlug } from '@/lib/courses';

/**
 * One form, ready to print.
 *
 * Print rather than a generated PDF, the same choice the certificate makes:
 * every browser prints to PDF, the type stays vector at any size, and there
 * is no rendering library to keep alive for the sake of a sheet of A4.
 *
 * Prerendered for both languages. The content is authored, not per-person,
 * so there is nothing here to wait for a database about.
 */

export function generateStaticParams() {
  return locales.flatMap((lang) => TEMPLATES.map((t) => ({ lang, slug: t.slug })));
}

export async function generateMetadata(
  props: PageProps<'/[lang]/resources/[slug]'>,
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  if (!isLocale(lang)) return {};
  const t = templateBySlug(slug);
  if (!t) return {};
  return {
    title: pick(t.title, lang),
    description: pick(t.purpose, lang),
    alternates: alternatesFor(lang, `/resources/${slug}`),
  };
}

export default async function TemplatePage(props: PageProps<'/[lang]/resources/[slug]'>) {
  const { lang, slug } = await props.params;
  if (!isLocale(lang)) notFound();
  const template = templateBySlug(slug);
  if (!template) notFound();

  const dict = getDictionary(lang);
  const t = dict.resources;
  const held = template.review === 'needs-review';
  const course = template.course ? courseBySlug(template.course) : null;

  return (
    <>
      {/*
        * Scoped to this page, as the certificate's rules are, so the rest of
        * the site keeps its own print behaviour.
        *
        * The margin is zero and the padding is inside the sheet. A browser
        * margin plus the sheet's own would push a landscape table past the
        * printer's unprintable edge, and the column that falls off is always
        * the last one — the signature.
        */}
      <style>{`
        /*
         * The sheet holds its paper width, so the column around it is what
         * decides whether there is anything to scroll. Asked as a container
         * query rather than guessed at a breakpoint: a landscape sheet is
         * 297mm and does not fit this column on any screen, a portrait one
         * fits from about 834px up, and a hint that appears when it is untrue
         * is how people learn to stop reading hints.
         */
        .sheet-container { container-type: inline-size; }
        @container (min-width: ${template.orientation === 'landscape' ? '297mm' : '210mm'}) {
          .sheet-pan-hint { display: none; }
        }

        @media print {
          header, footer, .no-print { display: none !important; }
          @page { size: ${template.orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait'}; margin: 0; }
          html, body { background: #fff !important; }
          .sheet-section { padding: 0 !important; margin: 0 !important; }
          .sheet-container { max-width: none !important; padding: 0 !important; margin: 0 !important; }
          /*
           * Width only. Pinning the height to one sheet is what silently
           * clipped six rows off the bottom of the attendance list: the box
           * stopped at 210mm and the rest of the table was simply not drawn.
           * A form runs onto a second page when it has to, and the sheet
           * itself keeps sections and table rows from splitting across the
           * break.
           */
          .template-sheet {
            width: ${template.orientation === 'landscape' ? '297mm' : '210mm'} !important;
            max-width: none !important;
            /*
             * The sheet carries a min-width of its own paper size so it stays
             * at printed scale on a phone instead of shrinking to 3px type.
             * Cleared here so the width above is the only thing deciding what
             * the printer gets — the two agree today, and this is what keeps
             * them agreeing if either ever changes.
             */
            min-width: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 0 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      <Section className="sheet-section">
        <Container className="sheet-container max-w-4xl">
          <div className="no-print">
            <Link
              href={`/${lang}/resources` as Parameters<typeof Link>[0]['href']}
              className="inline-flex min-h-11 items-center text-[0.92rem] font-extrabold text-brand-blue hover:underline dark:text-brand-orange"
            >
              <span aria-hidden className="me-2">
                {lang === 'ar' ? '→' : '←'}
              </span>
              {t.backToLibrary}
            </Link>

            <h1 className="mt-3 text-[clamp(1.5rem,1.2rem+1.4vw,2.1rem)] font-extrabold tracking-tight">
              {pick(template.title, lang)}
            </h1>
            <p className="mt-2.5 max-w-[62ch] text-[1rem] leading-relaxed text-ink-2">
              {pick(template.purpose, lang)}
            </p>

            {course && (
              <p className="mt-3 text-[0.9rem] text-ink-3">
                {t.forCourse}{' '}
                <Link
                  href={`/${lang}/academy/${template.course}` as Parameters<typeof Link>[0]['href']}
                  className="font-bold text-brand-blue hover:underline dark:text-brand-orange"
                >
                  {course.title[lang]}
                </Link>
              </p>
            )}

            {held ? (
              /*
               * No print button, and no blank form underneath it.
               *
               * The reason is the page. Somebody who came here for an incident
               * report needs to know who to ask, not a sheet with a warning
               * printed on it that will be photocopied without the warning.
               */
              <div className="mt-7 rounded-2xl border-2 border-brand-orange/50 bg-brand-orange/[0.07] p-6">
                <p className="inline-flex rounded-full bg-brand-orange px-3.5 py-1 text-[0.78rem] font-extrabold text-[#241503]">
                  {t.heldBadge}
                </p>
                <h2 className="mt-4 text-[1.1rem] font-extrabold">{t.whyHeld}</h2>
                <p className="mt-2.5 max-w-[64ch] text-[0.98rem] leading-relaxed text-ink-2">
                  {template.reviewBecause ? pick(template.reviewBecause, lang) : t.heldOnSheet}
                </p>
              </div>
            ) : (
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <PrintButton label={t.printCta} />
                <p className="max-w-[42ch] text-[0.86rem] leading-relaxed text-ink-3">
                  {t.printHint}
                </p>
              </div>
            )}
          </div>

          {!held && (
            <>
              {/*
                * The sheet is a fixed piece of paper and this is the window
                * onto it.
                *
                * It used to be `overflow-hidden`, which was fine while the
                * sheet was whatever width the column happened to be — and that
                * was the bug: everything on the sheet is sized as a fraction of
                * its own width, so on a phone the labels came out at 3px. The
                * sheet now holds its paper width, and what changes on a narrow
                * screen is this box, which pans across it.
                *
                * Focusable and named, because a region that only scrolls with a
                * finger or a trackpad is not reachable by keyboard at all.
                */}
              <div
                role="group"
                tabIndex={0}
                aria-label={pick(template.title, lang)}
                className="mt-8 overflow-x-auto rounded-xl border border-line shadow-sm print:mt-0 print:overflow-visible print:rounded-none print:border-0 print:shadow-none"
              >
                <TemplateSheet template={template} lang={lang} siteName={dict.meta.siteName} />
              </div>
              {/* Hidden by the container query above wherever the whole sheet
                  already fits, so it only ever says something true. */}
              <p className="sheet-pan-hint no-print mt-3 text-[0.84rem] text-ink-3">
                {t.sheetPanHint}
              </p>
            </>
          )}
        </Container>
      </Section>
    </>
  );
}
