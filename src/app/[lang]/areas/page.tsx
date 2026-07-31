import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, SectionHead } from '@/components/ui';
import { AREA_PHOTOS, HERO_PHOTO } from '@/lib/photos';

export async function generateMetadata(props: PageProps<'/[lang]/areas'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.nav.areas, description: dict.home.areasLede, alternates: alternatesFor(lang, '/areas') };
}

export default async function AreasPage(props: PageProps<'/[lang]/areas'>) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <Section>
      <Container>
        <SectionHead
          kicker={dict.nav.areas}
          title={dict.home.areasTitle}
          lede={dict.home.areasLede}
        />

        <div className="flex flex-col gap-5">
          {dict.areas.map((area, i) => (
            <article
              key={area.slug}
              className="grid items-center gap-6 overflow-hidden rounded-2xl border border-line bg-surface md:grid-cols-2"
            >
              <div
                className={`relative aspect-[16/10] bg-surface-2 md:aspect-auto md:h-full md:min-h-[260px] ${
                  i % 2 === 1 ? 'md:order-2' : ''
                }`}
              >
                <Image
                  src={AREA_PHOTOS[area.slug] ?? HERO_PHOTO}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col gap-3 p-6 md:p-8">
                <span className="text-[0.72rem] font-extrabold tracking-[0.13em] text-brand-orange-dark dark:text-brand-orange">
                  {area.tag}
                </span>
                <h2 className="text-[clamp(1.25rem,1.05rem+0.9vw,1.7rem)] font-extrabold tracking-tight">
                  {area.title}
                </h2>
                <p className="text-[1rem] leading-relaxed text-ink-2">{area.short}</p>
                <p className="text-[0.93rem] leading-relaxed text-ink-3">{area.long}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
