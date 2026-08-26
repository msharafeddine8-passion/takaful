import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, SectionHead } from '@/components/ui';
import { isDbConfigured } from '@/lib/db';
import {
  isComingSoon,
  projectName,
  projectSummary,
  projectTag,
  publishedProjects,
} from '@/lib/projects';

/**
 * «مشاريعنا الاستراتيجية» — the public projects page, now reading the table.
 *
 * ── WHAT CHANGED, AND WHAT DELIBERATELY DID NOT ───────────────────────────
 *
 * The cards used to come from `dict.projects.items`, which meant launching a
 * project needed a developer, a commit and a deploy. They now come from
 * `projects`, seeded by migration 055 with exactly the four rows this page was
 * already showing, in the same order and with the same statuses.
 *
 * THE MARKUP BELOW IS UNCHANGED. Same grid, same borders, same clamp on the
 * heading, same badge. That is the test migration 055 set for itself: the deploy
 * that ships this must change nothing a visitor sees, because a change whose
 * side effect is the association's project list quietly differing is a change
 * that edited a public statement without anybody deciding to.
 *
 * ── THE FALLBACK, AND WHY IT EXISTS ───────────────────────────────────────
 *
 * `dict.projects.items` is still here and must stay. This page is the
 * association's answer to "what do you actually do", and it is linked from the
 * header of every page on the site; a database that is unreachable for ten
 * minutes must not turn it into a heading with nothing under it. So:
 *
 *   - DATABASE_URL not set at all (a preview build, a contributor's checkout)
 *   - the query throws (the pool is down, the migration has not run here)
 *   - the query succeeds and returns nothing (an administrator has unpublished
 *     every row, or this is a fresh database)
 *
 * all fall back to the dictionary. The third case is the arguable one and it is
 * deliberate: four cards nobody has updated are a better public page than an
 * empty section that reads as a broken site, and an administrator who really
 * wants the section gone removes the page rather than emptying the table.
 *
 * The failure is swallowed rather than surfaced, because there is nothing a
 * visitor can do with it. It is not silent to us: the write path is where an
 * administrator learns the database is unreachable, and it says so.
 *
 * The dictionary arrays therefore stay in ar.ts and en.ts as this fallback, and
 * are not deleted.
 *
 * ── ONE SHAPE, TWO SOURCES ────────────────────────────────────────────────
 *
 * Both are mapped to `Card` below before anything renders, so the JSX has one
 * shape to draw and cannot end up with two nearly-identical branches that drift.
 * `status` is the one field that needs translating between them: the dictionary
 * says `status?: 'live' | 'soon'` with absent meaning live, and the column is
 * free text with 'soon' read specially — isComingSoon() is the single place that
 * decides, so the row and the literal answer the same question the same way.
 */

export async function generateMetadata(props: PageProps<'/[lang]/projects'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.nav.projects, description: dict.projects.lede, alternates: alternatesFor(lang, '/projects') };
}

/** One card, whichever of the two sources it came from. */
type Card = {
  /** Stable within the list. The slug for a row, the name for a literal. */
  key: string;
  tag: string | null;
  name: string;
  text: string;
  comingSoon: boolean;
};

/**
 * The published rows as cards, or null when the page should use the dictionary.
 *
 * Null and not an empty array, so that "nothing to show" and "show the fallback"
 * are one decision taken here rather than a length check the JSX has to
 * remember. Every failure mode listed at the head of this file returns null.
 */
async function cardsFromTable(lang: Locale): Promise<Card[] | null> {
  if (!isDbConfigured()) return null;
  try {
    const rows = await publishedProjects();
    if (rows.length === 0) return null;
    return rows.map((project) => ({
      key: project.slug,
      tag: projectTag(project, lang),
      name: projectName(project, lang),
      text: projectSummary(project, lang),
      comingSoon: isComingSoon(project),
    }));
  } catch {
    /* The public page never renders an empty projects section. See above. */
    return null;
  }
}

export default async function ProjectsPage(props: PageProps<'/[lang]/projects'>) {
  /* This page reads a table now, so it is rendered per request rather than
     baked at build time — the same opt-in every other database-backed public
     page here makes. Without it a build run while the database is unreachable
     would prerender the fallback and serve it until the next deploy. */
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const cards: Card[] =
    (await cardsFromTable(lang)) ??
    dict.projects.items.map((p) => ({
      key: p.name,
      tag: p.tag,
      name: p.name,
      text: p.text,
      comingSoon: p.status === 'soon',
    }));

  return (
    <Section>
      <Container>
        <SectionHead
          kicker={dict.projects.kicker}
          title={dict.projects.title}
          lede={dict.projects.lede}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((p) => {
            const soon = p.comingSoon;
            return (
              <article
                key={p.key}
                className={`relative flex flex-col gap-3 rounded-2xl border p-7 transition-colors ${
                  soon
                    ? 'border-dashed border-line bg-surface/60'
                    : 'border-line bg-surface hover:border-brand-orange'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[0.82rem] font-extrabold tracking-[0.13em] text-brand-blue dark:text-sky-300">
                    {p.tag}
                  </span>
                  {soon && (
                    <span className="shrink-0 rounded-full bg-brand-orange px-3 py-1 text-[0.82rem] font-extrabold text-[#241503]">
                      {dict.projects.comingSoon}
                    </span>
                  )}
                </div>

                <h2
                  className={`text-[clamp(1.4rem,1.1rem+1vw,1.9rem)] font-extrabold tracking-tight ${
                    soon ? 'text-ink-2' : ''
                  }`}
                >
                  {p.name}
                </h2>

                <p className={`text-[0.95rem] leading-relaxed ${soon ? 'text-ink-3' : 'text-ink-2'}`}>
                  {p.text}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
