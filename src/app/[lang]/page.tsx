import Image from 'next/image';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Button, Card, Container, Section, SectionHead, Kicker } from '@/components/ui';
import { AREA_PHOTOS, HERO_PHOTO, JOIN_PHOTO } from '@/lib/photos';

export default async function HomePage(props: PageProps<'/[lang]'>) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      {/* Hero — a real field photograph, not a stock gradient */}
      <div className="relative flex min-h-[520px] items-end overflow-hidden sm:min-h-[640px]">
        <Image
          src={HERO_PHOTO}
          alt=""
          fill
          priority
          sizes="100vw"
          /* 65%, not center: the crowd in this photo sits in the lower half,
             and on wide screens the visible band must keep the front rows. */
          className="object-cover object-[center_65%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#091a28]/95 via-[#091a28]/75 to-[#091a28]/40" />
        <Container className="relative pb-12 pt-24 sm:pb-20">
          <span className="inline-flex items-center rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-[0.83rem] font-bold text-white backdrop-blur">
            {dict.home.kicker}
          </span>
          <h1 className="mt-5 max-w-[19ch] text-[clamp(2.2rem,1.5rem+3.2vw,4rem)] font-black leading-[1.15] tracking-tight text-white">
            {dict.home.title} <span className="text-brand-orange">{dict.home.titleAccent}</span>
          </h1>
          <p className="mt-4 max-w-[46ch] text-[1.08rem] leading-relaxed text-[#d3e2ee]">
            {dict.home.lede}
          </p>
          {/* Straight to the account, not to a contact form. This button was
              pointed at /contact from before there was anywhere else to send
              anyone, and it stayed there after the whole registration →
              application → review pipeline was built — so every prospective
              volunteer was being routed into somebody's inbox instead. */}
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href={`/${lang}/join`}>{dict.home.ctaPrimary}</Button>
            <Button href={`/${lang}/projects`} variant="onDark">
              {dict.home.ctaSecondary}
            </Button>
          </div>
        </Container>
      </div>

      {/* Verified figures, straight from the institutional profile */}
      <div className="bg-brand-blue-deep text-white">
        <Container className="py-12 sm:py-16">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-[clamp(1.4rem,1.1rem+1vw,2rem)] font-extrabold">
              {dict.home.statsTitle}
            </h2>
            <p className="max-w-[44ch] text-[0.88rem] text-[#9dbbd2]">{dict.home.statsNote}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {dict.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/15 bg-white/[0.07] p-5"
              >
                <div className="tabular text-[clamp(1.7rem,1.2rem+1.8vw,2.6rem)] font-bold leading-tight text-brand-orange">
                  {s.value}
                </div>
                <div className="mt-1.5 text-[0.86rem] font-semibold text-[#bcd3e3]">{s.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Areas of work */}
      <Section>
        <Container>
          <SectionHead
            kicker={dict.nav.areas}
            title={dict.home.areasTitle}
            lede={dict.home.areasLede}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dict.areas.map((area) => (
              <Card key={area.slug}>
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
                  <Image
                    src={AREA_PHOTOS[area.slug] ?? HERO_PHOTO}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <span className="text-[0.82rem] font-extrabold tracking-[0.13em] text-brand-orange-text dark:text-brand-orange">
                    {area.tag}
                  </span>
                  <h3 className="text-[1.15rem] font-extrabold">{area.title}</h3>
                  <p className="text-[0.94rem] leading-relaxed text-ink-2">{area.short}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Academy teaser */}
      <Section className="bg-surface">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <Kicker>{dict.home.academyTitle}</Kicker>
              <h2 className="mt-2.5 text-[clamp(1.6rem,1.2rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
                {dict.journey.title}
              </h2>
              <p className="mt-3.5 text-[1.06rem] leading-relaxed text-ink-2">
                {dict.home.academyLede}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={`/${lang}/academy`}>{dict.home.academyCta}</Button>
                <Button href={`/${lang}/journey`} variant="ghost">
                  {dict.nav.journey}
                </Button>
              </div>
            </div>
            <ol className="flex flex-col gap-2">
              {dict.journey.levels.map((lv) => (
                <li
                  key={lv.n}
                  className="flex items-center gap-3 rounded-xl border border-line bg-ground p-3.5"
                >
                  <span
                    className={`tabular grid h-10 w-10 shrink-0 place-items-center rounded-lg font-bold ${
                      lv.n <= 2
                        ? 'bg-brand-grey text-white'
                        : lv.n <= 4
                          ? 'bg-brand-blue text-white'
                          : 'bg-brand-orange text-[#241503]'
                    }`}
                  >
                    {lv.n}
                  </span>
                  <div>
                    <div className="text-[0.98rem] font-bold leading-tight">{lv.title}</div>
                    <div className="text-[0.8rem] text-ink-3">{lv.items.slice(0, 3).join(' · ')}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      {/* Join */}
      <div className="relative overflow-hidden">
        <Image src={JOIN_PHOTO} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[#123651]/93" />
        <Container className="relative py-16 sm:py-20">
          <h2 className="text-[clamp(1.7rem,1.3rem+1.8vw,2.6rem)] font-extrabold tracking-tight text-white">
            {dict.home.joinTitle}
          </h2>
          <p className="mt-4 max-w-[46ch] text-[1.06rem] leading-relaxed text-[#c4daea]">
            {dict.home.joinLede}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href={`/${lang}/join`}>{dict.home.joinCta}</Button>
            <Button href={`/${lang}/journey`} variant="onDark">
              {dict.home.joinCtaAlt}
            </Button>
          </div>
        </Container>
      </div>
    </>
  );
}
