import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { isDbConfigured } from '@/lib/db';
import { formatDuration, formatNumber } from '@/lib/format';
import {
  photoAlt,
  photosOf,
  projectNameOf,
  storyBySlug,
  storyDate,
  storyDescription,
  storyImpact,
  storyLocation,
  storyTitle,
  type StoryCard,
  type StoryPhoto,
} from '@/lib/stories';
import { stories, type StoryStrings } from '@/lib/dictionaries/stories';

/**
 * One story from the field.
 *
 * ── WHAT MAKES THIS PAGE EXIST, AND WHAT MAKES IT A 404 ───────────────────
 *
 * storyBySlug() is deliberately NOT published-filtered — the same choice
 * projectBySlug() makes, so that a staff screen and an unpublish-undo can load
 * the row they are about. That puts the decision here, and it is made in one
 * place at the top: a story that is unpublished, archived, or simply absent is
 * notFound(). Three states, one answer, no page that half-renders a draft.
 *
 * ── NOBODY IS NAMED ON THIS PAGE ──────────────────────────────────────────
 *
 * Not in a participant list, not in a credit, not under a photograph. The two
 * figures are integers that came out of `story_figures`, aggregated in SQL over
 * the attendance register; lib/stories.ts selects no user id, no profile and no
 * display name, so nothing individual reaches this template and nothing can be
 * leaked from it by a later edit to a card. That is the strongest form of the
 * gate lib/visibility.ts exists to apply: a page that publishes no person
 * cannot publish the wrong person.
 *
 * The photographs are the one exposure, and they are filtered twice: photosOf
 * is called with `includeRestricted: false`, which binds PUBLISHABLE_FACES, and
 * /api/public/story-photo binds it again before sending bytes and adds the
 * story's own published state. A picture marked 'restricted' — an identifiable
 * child, or anybody nobody asked — is not merely unrendered here; it does not
 * leave the database, and its direct URL answers 404 to everyone without a
 * session.
 *
 * A plain <img> rather than next/image, for the reason the gallery page gives:
 * the optimiser would cache the bytes under a URL that does not change when a
 * photograph is withdrawn, which is precisely the caching the route's five
 * minutes exist to prevent.
 *
 * ── THE FIGURES ARE STATED WITH THEIR SOURCE ──────────────────────────────
 *
 * `figuresNote` sits under them and says where they came from. A number on a
 * public page with no provenance is a claim; the same number with "read from
 * the attendance register the volunteers' own hours are credited from" beside
 * it is a fact somebody can check — and it is the sentence that stops anybody
 * later suggesting the two be typed in by hand.
 */

async function load(langRaw: string, slug: string): Promise<StoryCard | null> {
  if (!isLocale(langRaw) || !isDbConfigured()) return null;
  const card = await storyBySlug(slug);
  if (!card) return null;
  // Published only. Archived is not a lesser state of published — it is a row
  // that should not have existed, and it has no public address either.
  if (!card.story.isPublished || card.story.archivedOn !== null) return null;
  return card;
}

export async function generateMetadata(
  props: PageProps<'/[lang]/gallery/[slug]'>,
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  if (!isLocale(lang)) return {};
  const card = await load(lang, slug);
  if (!card) return { title: stories(lang).notFoundTitle, robots: { index: false } };

  const description = storyDescription(card.story, lang);
  return {
    title: storyTitle(card.story, lang),
    // The first line of the prose, trimmed. Never the impact, which is written
    // as a conclusion and reads as a boast out of context.
    description: description.slice(0, 200),
    alternates: alternatesFor(lang, `/gallery/${card.story.slug}`),
  };
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-[0.78rem] font-extrabold tracking-[0.12em] text-ink-3">{label}</p>
      <p className="mt-1.5 text-[1.05rem] font-extrabold break-words">{value}</p>
    </div>
  );
}

function Gallery({ lang, photos, t }: { lang: Locale; photos: StoryPhoto[]; t: StoryStrings }) {
  if (photos.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="text-[1.15rem] font-extrabold tracking-tight">{t.morePhotos}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {photos.map((photo) => {
          const caption = photoAlt(photo, lang);
          return (
            <figure
              key={photo.id}
              className="overflow-hidden rounded-2xl border border-line bg-surface-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/public/story-photo/${photo.id}?v=${photo.version}`}
                alt={caption}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
              {caption && (
                <figcaption className="px-4 py-3 text-[0.85rem] leading-relaxed text-ink-2">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </section>
  );
}

export default async function StoryPage(props: PageProps<'/[lang]/gallery/[slug]'>) {
  await connection();
  const { lang, slug } = await props.params;
  if (!isLocale(lang)) notFound();

  const card = await load(lang, slug);
  if (!card) notFound();

  const t = stories(lang);
  const { story, project, figures } = card;
  const when = storyDate(card, lang);
  const where = storyLocation(story, lang);
  const description = storyDescription(story, lang);
  const impact = storyImpact(story, lang);

  /* Restricted pictures never leave the database for this page. The flag has no
   * default in photosOf() for the reason its header gives: a call site that
   * forgot the argument would look identical to one that got it right. */
  const photos = await photosOf(story.id, { includeRestricted: false });
  const [lead, ...rest] = photos;

  return (
    <Section>
      <Container className="max-w-3xl">
        <Kicker>{project ? projectNameOf(project, lang) : t.associationWide}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.8vw,2.6rem)] font-extrabold tracking-tight break-words">
          {storyTitle(story, lang)}
        </h1>

        {lead && (
          <figure className="mt-7 overflow-hidden rounded-2xl border border-line bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/public/story-photo/${lead.id}?v=${lead.version}`}
              alt={photoAlt(lead, lang)}
              decoding="async"
              className="aspect-[16/10] w-full object-cover"
            />
          </figure>
        )}

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {when && <Fact label={t.onDate} value={when} />}
          {where && <Fact label={t.atPlace} value={where} />}
          {figures && (
            <Fact
              label={t.participantsLabel}
              value={formatNumber(figures.participants, lang)}
            />
          )}
          {figures && (
            <Fact
              label={t.hoursLabel}
              value={formatDuration(figures.volunteerMinutes, lang)}
            />
          )}
        </div>

        {figures && (
          <p className="mt-3 max-w-[62ch] text-[0.85rem] leading-relaxed text-ink-3">
            {t.figuresNote}
          </p>
        )}

        {description && (
          <section className="mt-10">
            <h2 className="text-[1.15rem] font-extrabold tracking-tight">{t.whatHappened}</h2>
            <p className="mt-3 whitespace-pre-line text-[1.02rem] leading-relaxed text-ink-2">
              {description}
            </p>
          </section>
        )}

        {impact && (
          <section className="mt-10 rounded-2xl bg-brand-blue-deep p-6 text-white sm:p-8">
            <h2 className="text-[0.82rem] font-extrabold tracking-[0.16em] text-on-deep-2">
              {t.whatChanged}
            </h2>
            <p className="mt-3 max-w-[58ch] whitespace-pre-line text-[1.05rem] leading-relaxed text-on-deep">
              {impact}
            </p>
          </section>
        )}

        <Gallery lang={lang} photos={rest} t={t} />

        <div className="mt-10">
          <Link
            href={`/${lang}/gallery`}
            className="inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
          >
            ← {t.backToGallery}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
