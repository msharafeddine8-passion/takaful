import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { alternatesFor } from '@/lib/seo';
import { Button, Container, Section, SectionHead, Kicker } from '@/components/ui';
import { isDbConfigured } from '@/lib/db';
import {
  publishedPartners,
  partnerName,
  partnerSince,
  partnerSummary,
  type Partner,
} from '@/lib/partners';
import { partners, type PartnerStrings } from '@/lib/dictionaries/partners';

/**
 * «شركاؤنا» — the organisations the association works with.
 *
 * ── THE TABLE IS EMPTY, AND THAT IS WHAT THIS PAGE IS DESIGNED AROUND ─────
 *
 * There is not one row in `partners` today. A page built the ordinary way —
 * heading, grid, cards — would therefore ship as a heading with a void under it,
 * or worse, a row of grey placeholder cards implying partners exist and are
 * merely loading. Either one is the association saying "we have partners" and
 * showing none, which reads as a site half-built.
 *
 * So the order is inverted: THE INVITATION IS THE PAGE, and the grid is what
 * appears above it once there is something to show. With zero rows a visitor
 * gets the title, the lede, one honest line saying nothing is published yet, and
 * then «كن شريكًا» as the full-width panel that occupies the rest of the screen —
 * a page that is complete rather than a page that is waiting. With rows, the
 * same invitation is still there, still the last thing read, now as a closing
 * call to action under the partners themselves. Nothing about it is conditional
 * except how much of the screen it takes.
 *
 * ── THE HEADINGS ARE THE KINDS THAT EXIST, AND THERE IS NO LIST OF THEM ───
 *
 * Section 56 of the brief names eight kinds of partner. NONE OF THE EIGHT IS
 * WRITTEN DOWN ANYWHERE — not here, not in lib/partners.ts, not in the actions,
 * not in the dictionary, not in the schema. `groupByKind` below builds the
 * headings by walking the rows and collecting the distinct values of a free-text
 * column, so if three kinds have been recorded, three headings appear; if a
 * ninth kind is typed into the staff form this afternoon, a ninth heading
 * appears this afternoon and nobody deploys anything. Migration 057 gives the
 * argument: a partner who does not fit a fixed list is a partner who does not
 * get recorded.
 *
 * The groups come out in the order the kinds FIRST APPEAR in the association's
 * own ordering, rather than alphabetically — see publishedPartners(), which
 * explains why sorting a free-text column would sort the headings by the
 * alphabet of whichever language somebody happened to type the kind in.
 *
 * A partner whose kind nobody wrote down is rendered under NO heading at all,
 * last. There is deliberately no «أخرى» / "Other" heading: "Other" becomes a
 * kind the moment it is printed, and it is the one kind nobody chose.
 *
 * ── EXTERNAL LINKS ────────────────────────────────────────────────────────
 *
 * A plain `<a>` with `target="_blank"` and `rel="noopener noreferrer"`, and the
 * URL is rendered exactly as lib/partners.ts validated it. That value has been
 * through the URL parser and reduced to http or https twice over — once on the
 * way in and once on the way out — because this is the one field on this page
 * that a browser is asked to act on. See the head of lib/partners.ts and of
 * migration 057.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/partners'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const t = partners(lang);
  return {
    title: t.title,
    description: t.lede,
    alternates: alternatesFor(lang, '/partners'),
  };
}

/** One heading and the partners under it. `kind` null means: no heading. */
type KindGroup = { kind: string | null; items: Partner[] };

/**
 * The rows, grouped by the kinds that are actually in them.
 *
 * A Map, because it preserves insertion order — which is the order the kinds
 * first appear in the list the query already sorted, so moving a partner up the
 * page moves its heading up too and one control governs both. Nothing here
 * counts, ranks or compares the groups: a group is a list under a word.
 */
function groupByKind(list: Partner[]): KindGroup[] {
  const named = new Map<string, Partner[]>();
  const unnamed: Partner[] = [];

  for (const partner of list) {
    const kind = partner.kind?.trim();
    if (!kind) {
      unnamed.push(partner);
      continue;
    }
    const bucket = named.get(kind);
    if (bucket) bucket.push(partner);
    else named.set(kind, [partner]);
  }

  const groups: KindGroup[] = [...named].map(([kind, items]) => ({ kind, items }));
  // Last, and headingless. See the head of this file.
  if (unnamed.length > 0) groups.push({ kind: null, items: unnamed });
  return groups;
}

function PartnerCard({ lang, partner, t }: { lang: Locale; partner: Partner; t: PartnerStrings }) {
  const summary = partnerSummary(partner, lang);
  // Text in, text out. formatRoleDate never builds a Date — see lib/partners.ts.
  const since = partnerSince(partner, lang);

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-brand-orange">
      {partner.kind && (
        <span className="text-[0.82rem] font-extrabold tracking-[0.13em] text-brand-blue dark:text-sky-300">
          {partner.kind}
        </span>
      )}

      <h3 className="text-[1.15rem] font-extrabold tracking-tight break-words">
        {partnerName(partner, lang)}
      </h3>

      {since && <p className="text-[0.85rem] text-ink-3">{t.since.replace('{date}', since)}</p>}

      {summary && (
        <p className="text-[0.95rem] leading-relaxed text-ink-2 whitespace-pre-line">{summary}</p>
      )}

      {partner.websiteUrl && (
        <a
          href={partner.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex min-h-11 items-center text-[0.9rem] font-bold text-brand-blue hover:underline dark:text-sky-300"
        >
          {t.visitSite}
        </a>
      )}
    </article>
  );
}

/**
 * «كن شريكًا» — and with nothing recorded, the whole page.
 *
 * `alone` changes how much room it takes and nothing else: the same heading, the
 * same words, the same one link to the contact page the footer already sends
 * would-be partners to. There is no second invitation written for the empty
 * case, because a page that says something different depending on whether the
 * table is full is a page with two voices.
 *
 * The prose does not enumerate the sorts of organisation that may write in. See
 * the head of dictionaries/partners.ts: a paragraph naming companies,
 * universities and municipalities is a closed list wearing prose's clothes, and
 * the reader who is none of the three would correctly conclude the invitation
 * was not addressed to them.
 */
function Invitation({ lang, alone, t }: { lang: Locale; alone: boolean; t: PartnerStrings }) {
  return (
    <div
      className={`rounded-3xl bg-brand-blue-deep text-white ${
        alone ? 'mt-8 p-7 sm:p-12' : 'mt-12 p-6 sm:p-9'
      }`}
    >
      <p className="text-[0.82rem] font-extrabold tracking-[0.16em] text-on-deep-2">
        {t.becomeKicker}
      </p>
      <h2
        className={`mt-3 font-extrabold tracking-tight ${
          alone
            ? 'text-[clamp(1.8rem,1.3rem+2vw,2.9rem)]'
            : 'text-[clamp(1.4rem,1.1rem+1.2vw,2rem)]'
        }`}
      >
        {t.becomeTitle}
      </h2>
      <p
        className={`mt-4 max-w-[58ch] leading-relaxed text-on-deep ${
          alone ? 'text-[1.08rem]' : 'text-[1rem]'
        }`}
      >
        {t.becomeLede}
      </p>
      <p className="mt-3 max-w-[58ch] text-[0.95rem] leading-relaxed text-on-deep-2">
        {t.becomeDetail}
      </p>
      <div className="mt-7">
        <Button href={`/${lang}/contact`} variant="onDark">
          {t.becomeCta}
        </Button>
      </div>
    </div>
  );
}

export default async function PartnersPage(props: PageProps<'/[lang]/partners'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const t = partners(lang);

  /*
   * No database configured is the same state as nothing published: the page has
   * a complete thing to say either way, which is the point of building it around
   * the invitation. A visitor never meets an error here.
   */
  const list = isDbConfigured() ? await publishedPartners() : [];
  const groups = groupByKind(list);

  return (
    <Section>
      <Container>
        <SectionHead kicker={t.kicker} title={t.title} lede={t.lede} />

        {list.length === 0 ? (
          <p className="max-w-[62ch] rounded-xl border border-line bg-surface-2 px-5 py-4 text-[0.98rem] leading-relaxed text-ink-2">
            {t.nothingYet}
          </p>
        ) : (
          /* The grid, above the invitation, and only once there is something in
             it. `space-y` between groups rather than one flat grid, so each
             heading owns the cards under it. */
          <div className="space-y-12">
            {groups.map((group) => (
              <section key={group.kind ?? ' none'}>
                {group.kind && (
                  <Kicker>{group.kind}</Kicker>
                )}
                <div
                  className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
                    group.kind ? 'mt-4' : ''
                  }`}
                >
                  {group.items.map((partner) => (
                    <PartnerCard key={partner.id} lang={lang} partner={partner} t={t} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <Invitation lang={lang} alone={list.length === 0} t={t} />
      </Container>
    </Section>
  );
}
