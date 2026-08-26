import Image from 'next/image';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Button, Card, Container, Section, SectionHead, Kicker } from '@/components/ui';
import { AREA_PHOTOS, HERO_PHOTO, JOIN_PHOTO } from '@/lib/photos';
import { isDbConfigured } from '@/lib/db';
import { impactLabel, publishedNumbers } from '@/lib/impact-numbers';

/**
 * «تكافل بالأرقام» NOW COMES OUT OF A TABLE, AND STILL FALLS BACK TO ar.ts/en.ts.
 *
 * ── WHAT CHANGED, AND WHAT DELIBERATELY DID NOT ───────────────────────────
 *
 * The five figures used to be `dict.stats`, which meant correcting «٣٠٠+
 * متطوّع نشط» needed a developer, a commit and a deploy. Nobody does that for a
 * number, so the number goes stale and the front page slowly stops being true.
 * They now come from `impact_numbers`, seeded by migration 053 with exactly the
 * five the page was already showing, in the same order and with the same values.
 *
 * THE MARKUP BELOW IS UNCHANGED. Same grid, same borders, same clamp on the
 * figure, same colours. That is the test migration 053 set for itself: the
 * deploy that ships this must change nothing a visitor sees, because a change
 * whose side effect is the association's public figures quietly differing is a
 * change that edited its public statements without anybody deciding to.
 *
 * ── THE FALLBACK, AND WHY IT MUST STAY ────────────────────────────────────
 *
 * `dict.stats` is still in ar.ts and en.ts and MUST NOT BE DELETED. This is the
 * association's front page — the first thing a donor, a partner or a ministry
 * sees — and a database unreachable for ten minutes must not turn its headline
 * band into a heading with a blank strip under it. So:
 *
 *   - DATABASE_URL not set at all (a preview build, a contributor's checkout)
 *   - the query throws (the pool is down, the migration has not run here)
 *   - the query succeeds and returns nothing (every row unpublished, or a fresh
 *     database)
 *
 * all fall back to the dictionary. The third case is the arguable one and it is
 * deliberate, for a reason particular to THESE rows: an administrator who
 * unpublishes the last figure has not said "the association has no figures", and
 * an empty band would read as a broken site rather than as a decision. The staff
 * screen says so where the decision is taken. Somebody who really wants the band
 * gone removes the section, which is a code change and should be.
 *
 * The failure is swallowed rather than surfaced, because there is nothing a
 * visitor can do with it. It is not silent to us: the write path is where an
 * administrator learns the database is unreachable, and it says so.
 *
 * The same shape and the same three cases as the projects page one level down —
 * see the head of app/[lang]/projects/page.tsx, which made this argument first.
 *
 * ── ONE SHAPE, TWO SOURCES ────────────────────────────────────────────────
 *
 * Both are mapped to `Figure` before anything renders, so the JSX has one shape
 * to draw and cannot end up with two nearly-identical branches that drift.
 */

/** One figure in the band, whichever of the two sources it came from. */
type Figure = {
  /** Stable within the list. The key for a row, the label for a literal. */
  id: string;
  value: string;
  label: string;
};

/**
 * The published rows as figures, or null when the page should use the dictionary.
 *
 * Null and not an empty array, so that "nothing to show" and "show the fallback"
 * are one decision taken here rather than a length check the JSX has to
 * remember. Every failure mode listed at the head of this file returns null.
 */
async function figuresFromTable(lang: Locale): Promise<Figure[] | null> {
  if (!isDbConfigured()) return null;
  try {
    const rows = await publishedNumbers();
    if (rows.length === 0) return null;
    return rows.map((row) => ({
      id: row.key,
      value: row.valueText,
      label: impactLabel(row, lang),
    }));
  } catch {
    /* The front page never renders an empty figures band. See above. */
    return null;
  }
}

export default async function HomePage(props: PageProps<'/[lang]'>) {
  /* This page reads a table now, so it is rendered per request rather than baked
     at build time — the same opt-in every other database-backed public page here
     makes. Without it a build run while the database is unreachable would
     prerender the fallback and serve it until the next deploy. */
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const figures: Figure[] =
    (await figuresFromTable(lang)) ??
    dict.stats.map((s) => ({ id: s.label, value: s.value, label: s.label }));

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
          /*
           * 35%, favouring the upper half of the room.
           *
           * It was 65%, which suited the previous photograph — a posed group
           * whose front rows sat low in the frame. This one is a working
           * session shot from the doorway, and its lower band is the nearest
           * table, where faces are largest and most recognisable. Framing
           * higher keeps the room, the light and the Takaful sign on the wall,
           * and keeps individual people small. See the note in lib/photos.ts:
           * the hero is not a place for identifiable faces.
           */
          className="object-cover object-[center_35%]"
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
            {figures.map((s) => (
              <div
                key={s.id}
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
