import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, SectionHead, Kicker } from '@/components/ui';
import { GALLERY_PHOTOS } from '@/lib/photos';
import { isDbConfigured } from '@/lib/db';
import { formatDuration, formatNumber } from '@/lib/format';
import {
  photoAlt,
  projectNameOf,
  publishedStories,
  storyDate,
  storyLocation,
  storyTitle,
  type StoryCard,
} from '@/lib/stories';
import { stories, type StoryStrings } from '@/lib/dictionaries/stories';

/**
 * «قصص من الميدان» — section 55 of the brief — and the photograph archive that
 * was already here.
 *
 * ── THE TABLE IS EMPTY, AND THAT IS WHAT THIS PAGE IS DESIGNED AROUND ─────
 *
 * There is not one row in `stories` today. A page built the ordinary way —
 * heading, grid, cards — would ship as a heading with a void under it, or worse
 * a row of grey placeholder cards implying stories exist and are merely
 * loading. Either one is the association saying "here is our work" and showing
 * nothing.
 *
 * So the order is inverted, exactly as app/[lang]/partners/page.tsx inverts it:
 * THE ARCHIVE IS THE PAGE, and the stories grid is what appears above it once
 * there is something to show. With zero rows a visitor gets the title, the
 * lede, one honest line saying no story has been written yet, and then the
 * photographs occupying the rest of the screen under a heading of their own —
 * a page that is complete rather than a page that is waiting. With rows, the
 * same photographs are still there, still the last thing read, now as an
 * archive beneath the stories themselves. Nothing about them is conditional
 * except how much of the screen they take, which is what `alone` governs below.
 *
 * ── WHAT A CARD MAY SAY ABOUT A PERSON: NOTHING ───────────────────────────
 *
 * No name appears anywhere on this page or on a story's own page. The two
 * figures are integers aggregated inside `story_figures` — lib/stories.ts never
 * selects a user id, a profile or a display name — so there is no individual
 * here for publicIdentity() to have been asked about and got wrong.
 *
 * The one person-shaped thing a story can carry is a photograph, and the
 * <img> below is drawn only for a cover the query has already filtered through
 * PUBLISHABLE_FACES. /api/public/story-photo checks the same rule again before
 * it sends a byte: a URL is a request and not a permission.
 *
 * A plain <img> rather than next/image for the covers, and deliberately. The
 * image optimiser caches the bytes under a URL that does not change when a
 * photograph is withdrawn, which would keep serving the face of somebody who
 * has just asked for it to come down; the route holds a five-minute cache for
 * that reason and the optimiser would undo it. The ARCHIVE photographs below
 * are static files in /public that nobody can withdraw, so they keep next/image
 * as they always had.
 */

export async function generateMetadata(props: PageProps<'/[lang]/gallery'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.nav.gallery,
    description: dict.gallery.lede,
    alternates: alternatesFor(lang, '/gallery'),
  };
}

/**
 * One story, as a card.
 *
 * The whole card is the link, so the tap target on a phone is the card and not
 * a five-word phrase at the bottom of it. `readMore` stays as the visible
 * affordance because a card with no verb on it reads as an illustration.
 */
function StoryTile({ lang, card, t }: { lang: Locale; card: StoryCard; t: StoryStrings }) {
  const { story, project, figures, cover } = card;
  const when = storyDate(card, lang);
  const where = storyLocation(story, lang);

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-brand-orange">
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

          <h3 className="text-[1.1rem] font-extrabold tracking-tight break-words">
            {storyTitle(story, lang)}
          </h3>

          {(when || where) && (
            <p className="text-[0.85rem] text-ink-3">
              {[when, where].filter(Boolean).join(' · ')}
            </p>
          )}

          {figures && (
            <p className="text-[0.85rem] text-ink-2">
              {t.participantsLabel}: {formatNumber(figures.participants, lang)}
              {' · '}
              {t.hoursLabel}: {formatDuration(figures.volunteerMinutes, lang)}
            </p>
          )}

          <span className="mt-auto pt-3 text-[0.88rem] font-bold text-brand-blue dark:text-brand-orange">
            {t.readMore}
          </span>
        </div>
      </Link>
    </article>
  );
}

/**
 * The photographs that were this page, and still are when nothing is written.
 *
 * `alone` changes how much room they take and nothing else: the same pictures,
 * the same heading, the same note. There is no second archive written for the
 * empty case, because a page that says something different depending on whether
 * a table is full is a page with two voices.
 */
function Archive({ alone, t }: { alone: boolean; t: StoryStrings }) {
  return (
    <section className={alone ? 'mt-10' : 'mt-16 border-t border-line pt-12'}>
      <Kicker>{t.archiveKicker}</Kicker>
      <h2
        className={`mt-2.5 font-extrabold tracking-tight ${
          alone
            ? 'text-[clamp(1.5rem,1.2rem+1.4vw,2.2rem)]'
            : 'text-[clamp(1.25rem,1.05rem+1vw,1.7rem)]'
        }`}
      >
        {t.archiveTitle}
      </h2>
      <p className="mt-3 max-w-[62ch] text-[0.95rem] leading-relaxed text-ink-2">{t.archiveLede}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {GALLERY_PHOTOS.map((photo, i) => (
          <figure
            key={photo.key}
            className="relative aspect-square overflow-hidden rounded-xl bg-surface-2"
          >
            <Image
              src={photo.src}
              alt=""
              fill
              loading={alone && i < 4 ? 'eager' : 'lazy'}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}

export default async function GalleryPage(props: PageProps<'/[lang]/gallery'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = stories(lang);

  /*
   * No database configured is the same state as nothing published: the page has
   * a complete thing to say either way, which is the point of building it
   * around the archive. A visitor never meets an error here.
   */
  const list = isDbConfigured() ? await publishedStories() : [];

  return (
    <Section>
      <Container>
        <SectionHead
          kicker={dict.gallery.kicker}
          title={dict.gallery.title}
          lede={dict.gallery.lede}
        />

        <section>
          <Kicker>{t.sectionKicker}</Kicker>
          <h2 className="mt-2.5 text-[clamp(1.35rem,1.1rem+1.1vw,1.9rem)] font-extrabold tracking-tight">
            {t.sectionTitle}
          </h2>
          <p className="mt-3 max-w-[62ch] text-[0.98rem] leading-relaxed text-ink-2">
            {t.sectionLede}
          </p>

          {list.length === 0 ? (
            <p className="mt-5 max-w-[62ch] rounded-xl border border-line bg-surface-2 px-5 py-4 text-[0.96rem] leading-relaxed text-ink-2">
              {t.nothingYet}
            </p>
          ) : (
            /* The grid, and only once there is something in it. One column at
               375px, splitting at sm — nothing carries a min-width, so the page
               never scrolls sideways. */
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((card) => (
                <StoryTile key={card.story.id} lang={lang} card={card} t={t} />
              ))}
            </div>
          )}
        </section>

        <Archive alone={list.length === 0} t={t} />
      </Container>
    </Section>
  );
}
