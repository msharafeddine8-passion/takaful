import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Button, Container, Section, SectionHead } from '@/components/ui';
import { AREA_PHOTOS, HERO_PHOTO, JOIN_PHOTO } from '@/lib/photos';
import { isDbConfigured } from '@/lib/db';
import { impactLabel, publishedNumbers } from '@/lib/impact-numbers';
import {
  isComingSoon,
  projectName,
  projectSummary,
  projectTag,
  publishedProjects,
} from '@/lib/projects';
import { publishedPartners, partnerName, partnerSummary, type Partner } from '@/lib/partners';
import {
  photoAlt,
  projectNameOf,
  publishedStories,
  storyDate,
  storyLocation,
  storyTitle,
  type StoryCard,
} from '@/lib/stories';
import { opportunities } from '@/lib/activities';
import { formatDateTime } from '@/lib/when';
import { partners as partnerStrings } from '@/lib/dictionaries/partners';
import { stories as storyStrings, type StoryStrings } from '@/lib/dictionaries/stories';
import { homeSections } from '@/lib/dictionaries/home-sections';

/**
 * The front page, in the order section 54 of the brief asks for:
 *
 *   Hero → Impact → What We Do → Current Opportunities → Volunteer Journey →
 *   Academy → Projects → Stories From The Field → Partners → Join Takaful
 *
 * ═══ THE RULE THIS PAGE IS BUILT ON: A BAND WITH NOTHING IN IT IS NOT DRAWN ══
 *
 * Three of those ten have nothing behind them today. `partners` is empty,
 * `stories` is empty, and every published activity is undated — so there is not
 * one *current* opportunity to put on a front page, only eight waiting on a
 * coordinator to fix a date.
 *
 * A band with nothing in it therefore renders NOTHING AT ALL. Not a heading,
 * not a bordered "nothing here yet" panel, not a «قريباً». The homepage is the
 * one page on this site where an empty band reads as a broken site rather than
 * as an invitation: nobody arrived at «/» to ask about partners, so a partners
 * heading over a void is the association announcing a subject and then failing
 * to speak. Three of those in a row and the front door looks half-deployed.
 *
 * ── AND WHY /partners AND /gallery DO EXACTLY THE OPPOSITE ────────────────
 *
 * Both of those pages are built so that the empty state IS the page: /partners
 * makes «كن شريكًا» the whole screen when nothing is recorded, /gallery makes the
 * photograph archive the whole screen when no story is written. That is not an
 * inconsistency with the rule above, it is the same rule read against a
 * different visitor. Somebody who clicked "Partners" asked a question and is
 * owed an answer, even when the answer is "none yet, and here is how to be the
 * first". Somebody scrolling the homepage asked nothing. An honest empty state
 * answers a question that was put; on the front page there was no question, and
 * the band is simply not part of today's page.
 *
 * Nothing is lost by leaving them out. Every one of the ten bands corresponds
 * to a page in the header, on every page of the site — /opportunities included,
 * which is where all eight undated activities are listed with the «أبدِ اهتمامك»
 * button that suits them. The homepage is a route in, not the only one.
 *
 * ── SO EVERY BAND IS CONDITIONAL, AND THE ORDER HOLDS FOR ANY SUBSET ──────
 *
 * The bands between the figures and «انضم إلى تكافل» are pushed onto one array in
 * the client's order and rendered from it, so the sequence is written down once
 * and cannot drift as sections appear. Adding the first partner tomorrow slots
 * a partners band between stories and the join panel and moves nothing else.
 *
 * That is also why the band background is NOT hard-coded per section. It used to
 * be — areas on --ground, the academy teaser on --surface — and with sections
 * coming and going that assignment produces two identical bands butted together
 * on exactly the days when three are missing. The tone now alternates over the
 * bands that actually rendered (see TONES), which is the same rhythm the page
 * has always had and survives any subset. `tone.card` is the other half of it: a
 * bordered card must not be painted the same colour as the band it sits in.
 *
 * ── WHAT DELIBERATELY DID NOT CHANGE ──────────────────────────────────────
 *
 * The hero, the figures band and the join panel are the markup that was already
 * here, moved but not restyled, and every heading and paragraph on the page is
 * a string that already existed — read out of the dictionary belonging to the
 * page each band stands for. See dictionaries/home-sections.ts, which is four
 * button labels long for that reason. No animation was added. The one thing
 * removed is the second button on the academy band, which pointed at /journey:
 * the volunteer path is its own band now, directly above, with its own link.
 *
 * ── AND IT MUST NOT 500 ───────────────────────────────────────────────────
 *
 * Five reads happen here, on the association's front door. Every one of them
 * goes through fromTable() below, which treats "no DATABASE_URL", "the query
 * threw" and "the query returned nothing" as one answer: an empty list, and a
 * band that is not drawn.
 *
 * Two bands are exceptions and fall back to the dictionary rather than
 * disappearing — the figures and the projects — because those are the two whose
 * content ar.ts and en.ts still hold, and because /projects falls back the same
 * way one level down. The rest have nothing to fall back to. See
 * figuresFromTable() and the note beside `projects` in the component.
 */

/* ───────────────────────────────────────────────────────── the figures band ─
 *
 * «تكافل بالأرقام» comes out of `impact_numbers` and still falls back to
 * ar.ts/en.ts, exactly as it did before this reordering. Repeating the argument
 * in full here would put it out of date the first time somebody edits one copy,
 * so: the five figures were literals in `dict.stats` until migration 053 moved
 * them into a table an administrator can correct without a deploy, and
 * `dict.stats` MUST NOT BE DELETED, because it is what the band shows when the
 * database is unreachable, unconfigured, or has every row unpublished.
 *
 * This is the ONE band on the page that draws itself from a fallback rather than
 * disappearing, and the difference from partners and stories is a real one. An
 * administrator who unpublishes the last figure has not said "the association
 * has no figures"; there is a true, previously-published answer to fall back on
 * and the dictionary is holding it. There is no such answer for a partner that
 * was never recorded. Somebody who really wants the figures band gone removes
 * the section, which is a code change and should be.
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
 * remember.
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

/**
 * Any of the other four reads, reduced to a list the page can count.
 *
 * One helper rather than four try/catches, because the three failure modes are
 * the same for all of them and the page's answer to all three is the same: an
 * empty list, and therefore no band. A visitor never meets an error on the front
 * door, and never meets a heading with a void under it either.
 *
 * The failure is swallowed rather than surfaced because there is nothing a
 * visitor could do with it. It is not silent to us: the staff write path is
 * where somebody learns the database is unreachable, and it says so.
 */
async function fromTable<T>(read: () => Promise<T[]>): Promise<T[]> {
  if (!isDbConfigured()) return [];
  try {
    return await read();
  } catch {
    return [];
  }
}

/* ────────────────────────────────────────────────────────── the band rhythm ─ */

/**
 * The two alternating band treatments.
 *
 * `card` is not decoration: a bordered card painted the same colour as the band
 * behind it is a rectangle of hairline, which is what happens the moment a
 * section that hard-codes `bg-surface` cards lands on a `bg-surface` band. Both
 * halves are chosen together and applied together, so they cannot disagree.
 *
 * These are exactly the two treatments the page already used — areas on
 * --ground with --surface cards, the academy teaser on --surface with --ground
 * rows. Nothing new was introduced; the assignment merely became positional.
 */
type Tone = { section: string; card: string };

const TONES: Tone[] = [
  { section: '', card: 'bg-surface' },
  { section: 'bg-surface', card: 'bg-ground' },
];

/**
 * One project card, whichever of its two sources it came from.
 *
 * Both are mapped to this before anything renders, exactly as
 * app/[lang]/projects/page.tsx maps them, so the JSX has one shape to draw and
 * cannot end up with two nearly-identical branches that drift. `status` is the
 * field that needs translating between them: the dictionary says
 * `status?: 'live' | 'soon'` with absent meaning live, and the column is free
 * text with 'soon' read specially — isComingSoon() is the single place that
 * decides, so the row and the literal answer the same question the same way.
 */
type ProjectCard = {
  /** Stable within the list. The slug for a row, the name for a literal. */
  key: string;
  tag: string | null;
  name: string;
  text: string;
  comingSoon: boolean;
};

/** One band between the figures and «انضم إلى تكافل», and its position-independent body. */
type Band = { key: string; body: (tone: Tone) => ReactNode };

/**
 * A bordered card that reads on whichever band it landed in.
 *
 * The background arrives as `tone.card` and is the ONLY background utility on
 * the element — deliberately, rather than layering an override on top of a
 * component that already carries one. Two `bg-*` utilities of equal specificity
 * are resolved by their order in the generated stylesheet, not by their order in
 * the class attribute, so "the later one wins" is not something this file gets
 * to decide. One class, no contest.
 */
function Tile({
  tone,
  className = '',
  children,
}: {
  tone: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={`overflow-hidden rounded-2xl border border-line ${tone.card} ${className}`}
    >
      {children}
    </article>
  );
}

/** The button at the foot of a band, sending the reader to the page it stands for. */
function BandLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-8">
      <Button href={href} variant="ghost">
        {label}
      </Button>
    </div>
  );
}

export default async function HomePage(props: PageProps<'/[lang]'>) {
  /* This page reads tables now, so it is rendered per request rather than baked
     at build time — the same opt-in every other database-backed public page here
     makes. Without it a build run while the database is unreachable would
     prerender the fallback and serve it until the next deploy. */
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const acts = dict.account.activities;
  const tStories = storyStrings(lang);
  const tPartners = partnerStrings(lang);
  const tHome = homeSections(lang);

  /*
   * Five reads, together rather than in sequence. They are independent, and the
   * front page is the one that must answer fastest; run one after another the
   * band that happens to be listed last would wait on four round trips before
   * its own began.
   *
   * `opportunities(null)` and not the signed-in viewer's id on purpose. The
   * homepage bands are signposts, not controls — no join or interest button is
   * drawn here — so the only thing a viewer id buys is a per-visitor variation
   * of the front page, which is a cost with nothing bought.
   */
  const [figuresFromDb, projectRows, storyRows, partnerRows, activityRows] = await Promise.all([
    figuresFromTable(lang),
    fromTable(() => publishedProjects()),
    fromTable(() => publishedStories()),
    fromTable(() => publishedPartners()),
    fromTable(() => opportunities(null)),
  ]);

  const figures: Figure[] =
    figuresFromDb ??
    dict.stats.map((s) => ({ id: s.label, value: s.value, label: s.label }));

  /*
   * «الفرص المتاحة» — and only the ones that have a date.
   *
   * Every published activity is undated today, so this list is empty and the
   * band is not drawn at all. That is the correct reading of the section the
   * client asked for rather than a shortcut around a thin table: the band is
   * CURRENT opportunities, and an activity with no date is not something a
   * visitor can turn up to. Eight cards each reading «لم يُحدَّد التاريخ بعد»
   * under a heading promising what is on would be the front page announcing
   * eight things that are not happening.
   *
   * OVERRULED, AND THE REASONING ABOVE IS STILL WORTH READING.
   *
   * It is right that eight cards reading «لم يُحدَّد التاريخ بعد» under a
   * heading promising what is on would be the front page announcing eight
   * things that are not happening. The mistake is in the fix, not the
   * diagnosis: dropping the band leaves the front page of a volunteering
   * association with nowhere at all for a visitor to act. Everything above it
   * is something to read.
   *
   * And the eight are not nothing. They are real activities with three to five
   * people already waiting on each to be scheduled — a fact the opportunities
   * page now prints and this page was throwing away.
   *
   * So the band is drawn whenever there is anything to show, and the HEADING
   * tells the truth about which kind it is: what is on, when something is on,
   * and what is being prepared when nothing has a date yet. An honest heading
   * over eight real things beats an empty space, and «كن أوّل المهتمّين» is an
   * invitation rather than an apology.
   *
   * Dated first when both exist, because somebody who can turn up on Saturday
   * should not have to scroll past what is still being arranged. Three,
   * because a band is a sample and the button under it is the list.
   */
  const dated = activityRows.filter((a) => a.starts_at !== null);
  const undated = activityRows.filter((a) => a.starts_at === null);
  const shown = [...dated, ...undated].slice(0, 3);
  const anyDated = dated.length > 0;

  /*
   * The projects, and the ONE band besides the figures that falls back to the
   * dictionary rather than disappearing.
   *
   * That is not an exception to the rule at the head of this file, it is the
   * same distinction the figures band draws. A table that answers "no projects"
   * during an outage is not the association saying it has none: ar.ts and en.ts
   * are holding the four it has published for years, /projects falls back to
   * exactly those four for exactly this reason, and a front page that dropped
   * its projects band while the page it links to still listed four would have
   * the site disagreeing with itself about what the association does.
   *
   * Partners and stories get no such treatment because there is nothing to fall
   * back TO. No partner and no story was ever a literal in the dictionary, so an
   * empty table there is the whole truth and the band is not drawn.
   *
   * Four is what is published and four fits the grid; the cap is here so that a
   * fifth appearing does not silently lengthen the front page. /projects is the
   * list.
   */
  const projects: ProjectCard[] = (
    projectRows.length > 0
      ? projectRows.map((project) => ({
          key: project.slug,
          tag: projectTag(project, lang),
          name: projectName(project, lang),
          text: projectSummary(project, lang),
          comingSoon: isComingSoon(project),
        }))
      : dict.projects.items.map((p) => ({
          key: p.name,
          tag: p.tag,
          name: p.name,
          text: p.text,
          comingSoon: p.status === 'soon',
        }))
  ).slice(0, 4);

  const stories = storyRows.slice(0, 3);
  /* Partner cards carry a name and a line, so more of them fit before the band
     stops being a sample. */
  const partners = partnerRows.slice(0, 6);

  /*
   * The client's order, written down once.
   *
   * Each entry is conditional on having something to say. `dict`-backed bands
   * are guarded on the same terms as the database-backed ones even though their
   * arrays are literals and never empty — the point of the rule is that no band
   * is special, and a dictionary emptied by a bad merge should drop a section
   * rather than draw a heading over nothing.
   */
  const bands: Band[] = [];

  if (dict.areas.length > 0) {
    bands.push({
      key: 'areas',
      body: (tone) => (
        <>
          <SectionHead
            kicker={dict.nav.areas}
            title={dict.home.areasTitle}
            lede={dict.home.areasLede}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dict.areas.map((area) => (
              <Tile
                key={area.slug}
                tone={tone}
                className="transition-transform duration-200 hover:-translate-y-1"
              >
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
              </Tile>
            ))}
          </div>
        </>
      ),
    });
  }

  if (shown.length > 0) {
    bands.push({
      key: 'opportunities',
      body: (tone) => (
        <>
          {/* The heading follows what is actually in the band. Nothing dated
              yet means these are being prepared, and saying so is the whole
              difference between an honest invitation and a false promise. */}
          <SectionHead
            kicker={acts.kicker}
            title={anyDated ? acts.title : tHome.comingTitle}
            lede={anyDated ? acts.lede : tHome.comingLede}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((a) => (
              <Tile key={a.id} tone={tone} className="flex flex-col gap-2 p-6">
                <h3 className="text-[1.1rem] font-extrabold">
                  {lang === 'ar' ? a.title_ar : a.title_en}
                </h3>
                {/* The date first and in the accent colour, because it is the
                    fact that earns the card its place on this page. */}
                {/* An undated activity says so plainly and then says what a
                    reader can do about it, rather than leaving a gap where a
                    date belongs. */}
                <p className="text-[0.92rem] font-bold text-brand-blue dark:text-sky-300">
                  {a.starts_at !== null ? formatDateTime(a.starts_at, lang) : tHome.dateUnset}
                </p>
                {a.location && <p className="text-[0.9rem] text-ink-2">{a.location}</p>}
                {/*
                  * Places, only where there is a denominator. «0 / 20 مقعد» is
                  * twenty free places; a bare «0» is not a count of anything, and
                  * that exact bare numeral is what the client's section 22 was
                  * about. An activity with no capacity simply says nothing here.
                  *
                  * «اكتمل العدد» is not decoration either. A front page that
                  * advertises a full activity without saying so sends somebody to
                  * /opportunities to find that out for themselves, and «20 / 20»
                  * is a sum the reader should not have to do.
                  */}
                {a.capacity !== null && (
                  <p className="text-[0.85rem] text-ink-3">
                    {acts.spots
                      .replace('{taken}', String(a.taken))
                      .replace('{capacity}', String(a.capacity))}
                    {a.taken >= a.capacity && (
                      <span className="ms-2 font-bold">({acts.full})</span>
                    )}
                  </p>
                )}
              </Tile>
            ))}
          </div>
          <BandLink href={`/${lang}/opportunities`} label={tHome.allOpportunities} />
        </>
      ),
    });
  }

  if (dict.journey.levels.length > 0) {
    bands.push({
      key: 'journey',
      body: (tone) => (
        <>
          <SectionHead
            kicker={dict.journey.kicker}
            title={dict.journey.title}
            lede={dict.journey.lede}
          />
          <ol className="flex flex-col gap-2">
            {dict.journey.levels.map((lv) => (
              <li
                key={lv.n}
                className={`flex items-center gap-3 rounded-xl border border-line p-3.5 ${tone.card}`}
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
          <BandLink href={`/${lang}/journey`} label={dict.nav.journey} />
        </>
      ),
    });
  }

  bands.push({
    key: 'academy',
    body: () => (
      <>
        <SectionHead title={dict.home.academyTitle} lede={dict.home.academyLede} />
        {/* One button, not two. The second used to point at /journey, which is
            now the band directly above this one with a link of its own. */}
        <Button href={`/${lang}/academy`}>{dict.home.academyCta}</Button>
      </>
    ),
  });

  if (projects.length > 0) {
    bands.push({
      key: 'projects',
      body: (tone) => (
        <>
          <SectionHead
            kicker={dict.projects.kicker}
            title={dict.projects.title}
            lede={dict.projects.lede}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <Tile
                key={p.key}
                tone={tone}
                className={`flex flex-col gap-3 p-7 ${p.comingSoon ? 'border-dashed' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  {p.tag && (
                    <span className="text-[0.82rem] font-extrabold tracking-[0.13em] text-brand-blue dark:text-sky-300">
                      {p.tag}
                    </span>
                  )}
                  {p.comingSoon && (
                    <span className="shrink-0 rounded-full bg-brand-orange px-3 py-1 text-[0.82rem] font-extrabold text-[#241503]">
                      {dict.projects.comingSoon}
                    </span>
                  )}
                </div>
                <h3
                  className={`text-[clamp(1.25rem,1.05rem+0.8vw,1.6rem)] font-extrabold tracking-tight ${
                    p.comingSoon ? 'text-ink-2' : ''
                  }`}
                >
                  {p.name}
                </h3>
                <p
                  className={`text-[0.95rem] leading-relaxed ${p.comingSoon ? 'text-ink-3' : 'text-ink-2'}`}
                >
                  {p.text}
                </p>
              </Tile>
            ))}
          </div>
          <BandLink href={`/${lang}/projects`} label={tHome.allProjects} />
        </>
      ),
    });
  }

  if (stories.length > 0) {
    bands.push({
      key: 'stories',
      body: (tone) => (
        <>
          <SectionHead
            kicker={tStories.sectionKicker}
            title={tStories.sectionTitle}
            lede={tStories.sectionLede}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((card) => (
              <StoryTile key={card.story.id} lang={lang} card={card} tone={tone} t={tStories} />
            ))}
          </div>
          <BandLink href={`/${lang}/gallery`} label={tHome.allStories} />
        </>
      ),
    });
  }

  if (partners.length > 0) {
    bands.push({
      key: 'partners',
      body: (tone) => (
        <>
          <SectionHead
            kicker={tPartners.kicker}
            title={tPartners.title}
            lede={tPartners.lede}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <PartnerTile key={partner.id} lang={lang} partner={partner} tone={tone} />
            ))}
          </div>
          <BandLink href={`/${lang}/partners`} label={tHome.allPartners} />
        </>
      ),
    });
  }

  return (
    <>
      {/* ── 1. Hero — a real field photograph, not a stock gradient ────────── */}
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

      {/* ── 2. Impact — verified figures, straight from the institutional profile
             ── The one band with a fallback rather than a disappearing act. ── */}
      {figures.length > 0 && (
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
                <div key={s.id} className="rounded-xl border border-white/15 bg-white/[0.07] p-5">
                  <div className="tabular text-[clamp(1.7rem,1.2rem+1.8vw,2.6rem)] font-bold leading-tight text-brand-orange">
                    {s.value}
                  </div>
                  <div className="mt-1.5 text-[0.86rem] font-semibold text-[#bcd3e3]">{s.label}</div>
                </div>
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* ── 3–9. Everything between the figures and the invitation, in the
             client's order, tone alternating over whatever actually rendered ── */}
      {bands.map((band, i) => {
        const tone = TONES[i % TONES.length];
        return (
          <Section key={band.key} className={tone.section}>
            <Container>{band.body(tone)}</Container>
          </Section>
        );
      })}

      {/* ── 10. Join Takaful ───────────────────────────────────────────────── */}
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

/* ───────────────────────────────────────────────────── the two card shapes ─
 *
 * Out of the component above only because they are long, not because they are
 * shared: nothing else renders them. Everything they need arrives as a prop, so
 * neither reaches back into the page's scope.
 */

/**
 * One story.
 *
 * The whole card is the link, so the tap target on a phone is the card and not
 * a five-word phrase at the bottom of it — the same shape /gallery uses, and
 * `readMore` stays as the visible affordance because a card with no verb on it
 * reads as an illustration.
 *
 * A plain <img> for the cover rather than next/image, and deliberately: the
 * image optimiser caches the bytes under a URL that does not change when a
 * photograph is withdrawn, which would keep serving the face of somebody who
 * has just asked for it to come down. /api/public/story-photo holds a
 * five-minute cache for that reason and the optimiser would undo it. The full
 * argument, and the face rules the query has already applied to `cover`, are at
 * the head of app/[lang]/gallery/page.tsx.
 */
function StoryTile({
  lang,
  card,
  tone,
  t,
}: {
  lang: Locale;
  card: StoryCard;
  tone: Tone;
  t: StoryStrings;
}) {
  /*
   * `figures` is deliberately not destructured and not drawn. A front page that
   * prints a participant count beside a headline invites the reader to rank the
   * stories by it, and these two numbers are read out of an attendance register
   * rather than chosen to impress. They stay on /gallery and on the story
   * itself, where the note explaining where they come from is beside them.
   */
  const { story, project, cover } = card;
  const when = storyDate(card, lang);
  const where = storyLocation(story, lang);

  return (
    <Tile tone={tone} className="transition-colors hover:border-brand-orange">
      <Link
        href={`/${lang}/gallery/${story.slug}` as Parameters<typeof Link>[0]['href']}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/public/story-photo/${cover.id}?v=${cover.version}`}
              alt={photoAlt(cover, lang)}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <span className="text-[0.78rem] font-extrabold tracking-[0.13em] text-brand-blue dark:text-sky-300">
            {project ? projectNameOf(project, lang) : t.associationWide}
          </span>

          <h3 className="break-words text-[1.1rem] font-extrabold tracking-tight">
            {storyTitle(story, lang)}
          </h3>

          {(when || where) && (
            <p className="text-[0.85rem] text-ink-3">{[when, where].filter(Boolean).join(' · ')}</p>
          )}

          <span className="mt-auto pt-3 text-[0.88rem] font-bold text-brand-blue dark:text-brand-orange">
            {t.readMore}
          </span>
        </div>
      </Link>
    </Tile>
  );
}

/**
 * One partner: the kind it is, its name, and the line the association wrote
 * about what it actually contributed.
 *
 * No website link and no «شريك منذ» here — both belong on /partners, where the
 * reader came to look a partner up. On the front page the card is an answer to
 * "who works with them", and the button under the band is the way to the rest.
 *
 * `kind` is free text read straight back out of the row, and there is
 * deliberately no fallback word for a partner nobody typed one for: "Other"
 * becomes a kind the moment it is printed, and it is the one kind nobody chose.
 * See the head of lib/dictionaries/partners.ts.
 */
function PartnerTile({
  lang,
  partner,
  tone,
}: {
  lang: Locale;
  partner: Partner;
  tone: Tone;
}) {
  const summary = partnerSummary(partner, lang);

  return (
    <Tile tone={tone} className="flex flex-col gap-3 p-6">
      {partner.kind && (
        <span className="text-[0.82rem] font-extrabold tracking-[0.13em] text-brand-blue dark:text-sky-300">
          {partner.kind}
        </span>
      )}
      <h3 className="break-words text-[1.15rem] font-extrabold tracking-tight">
        {partnerName(partner, lang)}
      </h3>
      {summary && (
        <p className="whitespace-pre-line text-[0.95rem] leading-relaxed text-ink-2">{summary}</p>
      )}
    </Tile>
  );
}
