import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { isDbConfigured } from '@/lib/db';
import { continuityStrings, type ContinuityStrings } from '@/lib/dictionaries/continuity';
import { continuityRows } from '@/lib/continuity-data';
import {
  beirutToday, buildRoll, filterRoll, joiningYears, parseFilter, parseSort, sortRoll,
  stageOptions, type ContinuityPerson, type ContinuitySort,
} from '@/lib/continuity';
import { achievementByCode } from '@/lib/achievements';
import { formatNumber } from '@/lib/format';

/**
 * صنّاع الاستمرارية — a page of thanks.
 *
 * The people named here joined on or before the end of 2023 and are still
 * volunteers. That is the whole membership rule, and this page does not
 * restate it: it reads the `continuity-maker` badge, which already encodes it
 * and is already granted. See lib/continuity-data.ts for why.
 *
 * IT IS NOT A LEADERBOARD, and that is a structural claim rather than a
 * stylistic one. The list is a <ul> and never an <ol>. No callback here takes
 * an index. `sortRoll` returns people, not placed people, so there is no
 * position for a template to print even by accident. The sort control exists
 * because forty cards need a reading order — the page says so in as many
 * words, above the control, so nobody reads the first card as a winner.
 *
 * CONSENT. Nothing about anybody is published unless `consentFor` in
 * lib/continuity.ts says it may be, and that function asks lib/visibility.ts.
 * The stored default is 'hidden', so until people answer the form on their own
 * profile page this renders its empty state — which explains that, rather than
 * looking broken. Nothing on this page decides visibility for itself; every
 * field reads a flag consentFor set.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/continuity'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const t = continuityStrings(lang);
  return {
    title: t.title,
    description: t.lede,
    alternates: alternatesFor(lang, '/continuity'),
    /*
     * Indexable, unlike every other page in this codebase that names a
     * volunteer. Those exist to answer a stranger's question about one person;
     * this one exists to be read. Somebody who consents to public thanks has
     * consented to a public page, and a public page that search engines cannot
     * see is a private page with extra steps.
     *
     * If the association decides consent is to the association's own site and
     * not to the open web, this is the one line to flip:
     *   robots: { index: false, follow: true }
     */
  };
}

export default async function ContinuityPage(props: PageProps<'/[lang]/continuity'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const t = continuityStrings(lang);
  const params = await props.searchParams;

  if (!isDbConfigured()) return <Frame lang={lang} t={t}><Notice text={t.unavailable} /></Frame>;

  // One clock reading for the whole page. beirutToday, not the server's own
  // date: whether somebody is still seventeen is decided by the calendar the
  // association lives in, and the server runs in GMT.
  const roll = buildRoll(await continuityRows(), lang, beirutToday());

  /*
   * The menus are built from the roll, not from the whole badge holding.
   * Offering a year that only somebody withheld joined in would say that they
   * exist and roughly when they arrived — the option list is a disclosure in
   * its own right.
   */
  const sort: ContinuitySort = parseSort(params.sort);
  const filter = parseFilter(roll, params.year, params.stage);
  const years = joiningYears(roll);
  const stages = stageOptions(roll);
  const shown = sortRoll(filterRoll(roll, filter), sort, lang);

  if (roll.length === 0) {
    return (
      <Frame lang={lang} t={t}>
        <div className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-7">
          <h2 className="text-[1.15rem] font-extrabold">{t.emptyTitle}</h2>
          <p className="mt-3 max-w-[62ch] text-[0.98rem] leading-relaxed text-ink-2">
            {t.emptyBody}
          </p>
        </div>
      </Frame>
    );
  }

  return (
    <Frame lang={lang} t={t}>
      {/* A plain GET form. No JavaScript anywhere on this page: the filters are
          a query string, so a shared link shows what the sender was looking at
          and the page works on a phone with the network half gone. */}
      <form method="get" className="mt-8 rounded-2xl border border-line bg-surface-2 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="sort" label={t.sortLabel}>
            <select id="sort" name="sort" defaultValue={sort} className={CONTROL}>
              <option value="longest">{t.sortLongest}</option>
              <option value="hours">{t.sortHours}</option>
              <option value="name">{t.sortName}</option>
            </select>
          </Field>

          <Field id="year" label={t.yearLabel}>
            <select id="year" name="year" defaultValue={filter.year ?? ''} className={CONTROL}>
              <option value="">{t.yearAll}</option>
              {/* The year is left in Latin digits and never localised here.
                  An <option> cannot carry direction of its own, and a menu
                  entry that reads ٢٠١٩ while the query string says 2019 is a
                  value the form then has to translate back. */}
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </Field>

          <Field id="stage" label={t.stageLabel}>
            <select id="stage" name="stage" defaultValue={filter.stage ?? ''} className={CONTROL}>
              <option value="">{t.stageAll}</option>
              {stages.map((stage) => (
                <option key={stage.label} value={stage.label}>{stage.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-full bg-brand-blue px-6 text-[0.92rem] font-extrabold text-white transition-colors hover:bg-brand-blue-dark"
          >
            {t.apply}
          </button>
          {(filter.year || filter.stage || sort !== 'longest') && (
            // A plain link back to the bare route. `a` and not `Link`: this
            // clears a query string on the page it is already on, and a client
            // navigation for that is machinery for nothing.
            <a
              href={`/${lang}/continuity`}
              className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-[0.92rem] font-bold transition-colors hover:bg-surface"
            >
              {t.clear}
            </a>
          )}
          <p className="ms-auto text-[0.88rem] font-bold text-ink-3">
            {t.showing.replace('{n}', formatNumber(shown.length, lang))}
          </p>
        </div>
      </form>

      {shown.length === 0 ? (
        <Notice text={t.noMatch} />
      ) : (
        <ul className="mt-6 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* No index in this callback, and none available to one: the list is
              unordered markup holding unplaced people. */}
          {shown.map((person) => (
            <li key={person.id}>
              <PersonCard person={person} lang={lang} t={t} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-3">
        {t.privacyNote}
      </p>
    </Frame>
  );
}

/* ------------------------------------------------------------------ pieces */

const CONTROL =
  'min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-[0.95rem] ' +
  'outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25';

/** The heading and lede, shared by every state the page can be in. */
function Frame({
  lang, t, children,
}: {
  lang: Locale;
  t: ContinuityStrings;
  children: ReactNode;
}) {
  return (
    <Section>
      <Container className="max-w-6xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        {/* Said before the sort control is reached, not in a footnote after
            it. A reader who meets an ordered list of people first has already
            decided it is a ranking by the time a disclaimer arrives. */}
        <p
          lang={lang}
          className="mt-5 max-w-[62ch] rounded-2xl border border-brand-orange/40 bg-brand-orange/[0.07] px-5 py-4 text-[0.95rem] font-bold leading-relaxed text-brand-orange-text dark:text-ink"
        >
          {t.notRanked}
        </p>

        {children}
      </Container>
    </Section>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">{text}</p>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[0.84rem] font-extrabold text-ink-3">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function PersonCard({
  person, lang, t,
}: {
  person: ContinuityPerson;
  lang: Locale;
  t: ContinuityStrings;
}) {
  const badges = person.badges
    .map((code) => achievementByCode(code))
    .filter((def): def is NonNullable<typeof def> => Boolean(def));

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center gap-3.5">
        <Portrait person={person} />
        <div className="min-w-0">
          <h2 className="truncate text-[1.02rem] font-extrabold leading-snug">
            {person.name ?? t.unnamed}
          </h2>
          {person.memberNumber && (
            <p className="mt-0.5 font-mono text-[0.85rem] font-bold text-brand-blue dark:text-brand-orange" dir="ltr">
              {person.memberNumber}
            </p>
          )}
        </div>
      </div>

      {/* The year, never the date. A page thanking somebody for staying needs
          to say how long; it has no use for the day they walked in, and a full
          date beside a name is a birthday-shaped detail about a real person.

          Latin digits and dir="ltr", unlike every other figure on this card.
          The year is the value in the filter menu above and in the query
          string — a card reading «٢٠٢١» under a menu offering 2021 makes the
          reader match two spellings of the same thing. The membership card
          sets «مع الجمعية منذ» the same way, for the same reason. */}
      <p className="mt-4 text-[0.88rem] text-ink-2">
        <span className="font-bold text-ink-3">{t.since}</span>{' '}
        <span className="font-extrabold text-ink" dir="ltr">{person.joinedYear}</span>
      </p>

      {/*
        * A figure appears only when there is one.
        *
        * Two things were wrong with printing them unconditionally. «ساعات
        * موثّقة: ٠» beside somebody's name on a page thanking them for eleven
        * years reads as a mark against them, and it is not even the thing
        * being thanked — the hours ledger only started when this platform
        * did. And a zero and a withheld figure would look identical anyway,
        * which is the honest reason not to labour the difference.
        *
        * Whole hours through formatNumber like the other two, not
        * formatDuration: the card would otherwise set the hours in Latin
        * digits and the activities beside them in Arabic-Indic, on the same
        * four lines.
        */}
      {person.stage && <Fact label={t.stage} value={person.stage} />}
      {!!person.hours && <Fact label={t.hours} value={formatNumber(person.hours, lang)} />}
      {!!person.activities && (
        <Fact label={t.activities} value={formatNumber(person.activities, lang)} />
      )}
      {!!person.certificates && (
        <Fact label={t.certificates} value={formatNumber(person.certificates, lang)} />
      )}

      {badges.length > 0 && (
        <div className="mt-4 border-t border-line pt-3.5">
          <p className="text-[0.78rem] font-extrabold tracking-[0.08em] text-ink-3">{t.badges}</p>
          <ul className="mt-2 flex list-none flex-wrap gap-1.5">
            {badges.map((def) => (
              <li
                key={def.code}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[0.78rem] font-bold ring-1 ring-line"
              >
                <span aria-hidden>{def.icon}</span>
                {def.title[lang]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

/**
 * The photograph, or the initial.
 *
 * TWO INDEPENDENT ANSWERS TO THE SAME QUESTION, and that is the design rather
 * than a duplication. `person.showPhoto` decides whether this page asks for an
 * image; /api/public/photo/[userId] decides, from the database and on every
 * request, whether to send one. Both go through consentFor in
 * lib/continuity.ts, so they cannot disagree about a person — and the second
 * one is what actually protects the photograph, because a URL is a request and
 * not a permission. Anybody may type that address; only consent answers it.
 *
 * NOT /api/photo/[userId]. That route serves the holder and staff who manage
 * members, asks nothing about consent, and refuses anonymous requests — so
 * pointing this page at it would render a broken image for exactly the people
 * who opted in, which reads to a volunteer as the association having lost
 * their picture.
 *
 * The version is a cache-buster and never a permission: replacing a photograph
 * changes it, so the new one appears at once instead of after the response's
 * five minutes. Removing consent changes nothing in the URL, which is why the
 * route holds the caching short rather than marking the bytes immutable.
 */
function Portrait({ person }: { person: ContinuityPerson }) {
  // aria-hidden either way: the name is already the heading beside it, so an
  // alt text or a spoken initial would announce the same person twice. The
  // photograph is decoration here — it carries nothing the name does not.
  return (
    <div
      aria-hidden
      className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-surface-2"
    >
      {person.showPhoto && person.photoVersion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/public/photo/${person.id}?v=${person.photoVersion}`}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-[1.15rem] font-extrabold text-ink-3">
          {person.name ? [...person.name][0] : '·'}
        </span>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <p className="mt-1.5 text-[0.88rem] text-ink-2">
      <span className="font-bold text-ink-3">{label}</span>{' '}
      <span className="font-extrabold text-ink">{value}</span>
    </p>
  );
}
