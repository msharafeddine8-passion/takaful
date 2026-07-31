import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, SectionHead, Kicker } from '@/components/ui';
import { ABOUT_PHOTO } from '@/lib/photos';

export async function generateMetadata(props: PageProps<'/[lang]/about'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.nav.about, description: dict.about.lede, alternates: alternatesFor(lang, '/about') };
}

export default async function AboutPage(props: PageProps<'/[lang]/about'>) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <Section>
        <Container>
          <SectionHead kicker={dict.nav.about} title={dict.about.title} lede={dict.about.lede} />

          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-2">
              <Image
                src={ABOUT_PHOTO}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-7">
              <div>
                <h2 className="text-[clamp(1.3rem,1.1rem+0.9vw,1.75rem)] font-extrabold text-brand-blue dark:text-sky-300">
                  {dict.about.visionTitle}
                </h2>
                <p className="mt-3 text-[1.05rem] leading-relaxed text-ink-2">{dict.about.vision}</p>
              </div>
              <div>
                <h2 className="text-[clamp(1.3rem,1.1rem+0.9vw,1.75rem)] font-extrabold text-brand-blue dark:text-sky-300">
                  {dict.about.missionTitle}
                </h2>
                <p className="mt-3 text-[1.05rem] leading-relaxed text-ink-2">{dict.about.mission}</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-surface">
        <Container>
          <Kicker>{dict.about.valuesKicker}</Kicker>
          <h2 className="mt-2.5 text-[clamp(1.5rem,1.2rem+1.3vw,2.2rem)] font-extrabold tracking-tight">
            {dict.about.valuesTitle}
          </h2>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dict.values.map((v) => (
              <div key={v.title} className="rounded-xl border border-line bg-ground p-5">
                <h3 className="text-[1.02rem] font-extrabold">{v.title}</h3>
                <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink-2">{v.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
