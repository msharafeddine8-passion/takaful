import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Button, Container, Section, SectionHead } from '@/components/ui';

export async function generateMetadata(props: PageProps<'/[lang]/journey'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.nav.journey, description: dict.journey.lede, alternates: alternatesFor(lang, '/journey') };
}

/** Levels 1–2 grey, 3–4 blue, 5–6 orange: the ascent is legible at a glance. */
function levelTone(n: number) {
  if (n <= 2) return { bar: 'bg-brand-grey', chip: 'bg-brand-grey text-white' };
  if (n <= 4) return { bar: 'bg-brand-blue', chip: 'bg-brand-blue text-white' };
  return { bar: 'bg-brand-orange', chip: 'bg-brand-orange text-[#241503]' };
}

export default async function JourneyPage(props: PageProps<'/[lang]/journey'>) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <Section className="bg-surface">
      <Container>
        <SectionHead
          kicker={dict.journey.kicker}
          title={dict.journey.title}
          lede={dict.journey.lede}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dict.journey.levels.map((lv) => {
            const tone = levelTone(lv.n);
            return (
              <article
                key={lv.n}
                className="relative overflow-hidden rounded-2xl border border-line bg-ground p-6"
              >
                <span className={`absolute inset-x-0 top-0 h-1 ${tone.bar}`} aria-hidden="true" />

                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`tabular grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[1rem] font-bold ${tone.chip}`}
                  >
                    {lv.n}
                  </span>
                  <div>
                    <div className="text-[0.72rem] font-bold tracking-[0.1em] text-ink-3">
                      {dict.journey.levelWord} {lv.n}
                    </div>
                    <h2 className="text-[1.12rem] font-extrabold leading-tight">{lv.title}</h2>
                  </div>
                </div>

                <ul className="flex flex-col gap-2">
                  {lv.items.map((item) => (
                    <li
                      key={item}
                      className="relative ps-4 text-[0.92rem] leading-relaxed text-ink-2 before:absolute before:top-[0.62em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-brand-orange before:content-[''] before:start-0"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button href={`/${lang}/academy`}>{dict.home.academyCta}</Button>
          <Button href={`/${lang}/contact`} variant="ghost">
            {dict.contact.ctaVolunteer}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
