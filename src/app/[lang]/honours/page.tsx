import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { isDbConfigured } from '@/lib/db';
import { beirutToday } from '@/lib/when';
import { formatDuration, formatNumber } from '@/lib/format';
import { honoursView, type HonourMonth, type PublicAward } from '@/lib/awards';
import { honoursRecords } from '@/lib/awards-data';
import {
  AWARD_ICONS, awardDictionaries, formatPeriod, type AwardStrings,
} from '@/lib/dictionaries/awards';

/**
 * لوحة الشرف — the months the association stopped and said a name out loud.
 *
 * ONE NAME PER AWARD, AND NEVER A SECOND. Five people were shortlisted and one
 * was chosen; the other four did nothing wrong, and there is nothing on this
 * page, in the query behind it or in the schema underneath that could name
 * them. `honoursView` takes decided awards and cannot be handed a shortlist —
 * see src/lib/awards.ts, and migration 036 for why no shortlist is ever
 * written down at all. The page says so in as many words, above the first
 * name, so the absence reads as a decision rather than as missing data.
 *
 * NOT A RANKING, structurally and not only visually. The lists are <ul> and
 * never <ol>, no callback here takes an index, and the four awards inside a
 * month are ordered by a fixed catalogue order rather than by any figure —
 * there is no position for a template to print even by accident.
 *
 * CONSENT IS ASKED AGAIN, HERE. Somebody may agree to be named in August and
 * change their mind in October; when they do, this page falls silent about
 * them on the very next render. `honoursRecords` resolves the question through
 * src/lib/visibility.ts on every read, and a winner who may no longer be named
 * is dropped from the month entirely rather than shown as "withheld" — a
 * withheld line still says a specific month had a winner who wanted privacy,
 * and in an association of four hundred that narrows to one person.
 *
 * NO USER ID REACHES THIS FILE. `AwardRecord` and `PublicAward` have no field
 * for one, so nothing here can put an identifier in a link, a key or a data
 * attribute however this page is later edited.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/honours'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const t = awardDictionaries[lang];
  return {
    title: t.title,
    description: t.lede,
    alternates: alternatesFor(lang, '/honours'),
    /*
     * Indexable, on the same reasoning as /continuity: somebody who consents
     * to public thanks has consented to a public page, and a public page
     * search engines cannot see is a private page with extra steps. If the
     * association decides consent is to its own site rather than to the open
     * web, this is the one line to add:
     *   robots: { index: false, follow: true }
     */
  };
}

export default async function HonoursPage(props: PageProps<'/[lang]/honours'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const t = awardDictionaries[lang];

  if (!isDbConfigured()) return <Frame t={t} lang={lang}><Notice text={t.unavailable} /></Frame>;

  /* One clock reading for the whole page, and it is Beirut's. Whether a winner
   * is still seventeen is decided by the calendar the association lives in,
   * and the server runs GMT — see visibility.ts. */
  const { current, archive } = honoursView(await honoursRecords(beirutToday()));

  if (!current) {
    return (
      <Frame t={t} lang={lang}>
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
    <Frame t={t} lang={lang}>
      <section className="mt-8">
        <h2 className="text-[0.78rem] font-extrabold tracking-[0.12em] text-ink-3">
          {t.currentTitle}
        </h2>
        <p className="mt-1 text-[1.3rem] font-extrabold" dir="auto">
          {formatPeriod(current.period, lang)}
        </p>
        {/* No index in this callback, and none available to one. */}
        <ul className="mt-4 grid list-none gap-4 sm:grid-cols-2">
          {current.awards.map((award) => (
            <li key={award.award}>
              <AwardCard award={award} lang={lang} t={t} featured />
            </li>
          ))}
        </ul>
      </section>

      {archive.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[0.78rem] font-extrabold tracking-[0.12em] text-ink-3">
            {t.archiveTitle}
          </h2>
          <div className="mt-4 space-y-8">
            {archive.map((month) => (
              <PastMonth key={month.period} month={month} lang={lang} t={t} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-12 max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-3">
        {t.privacyNote}
      </p>
    </Frame>
  );
}

/* ------------------------------------------------------------------ pieces */

/** The heading, the lede and the one note the page must make before any name. */
function Frame({ t, lang, children }: { t: AwardStrings; lang: Locale; children: ReactNode }) {
  return (
    <Section>
      <Container className="max-w-5xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        {/* Before the first name, not in a footnote under the last one. A
            reader who meets a list of people first has already decided what
            kind of page it is by the time an explanation arrives. */}
        <p
          lang={lang}
          className="mt-5 max-w-[62ch] rounded-2xl border border-brand-orange/40 bg-brand-orange/[0.07] px-5 py-4 text-[0.95rem] font-bold leading-relaxed text-brand-orange-text dark:text-ink"
        >
          {t.oneNameNote}
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

function PastMonth({
  month, lang, t,
}: {
  month: HonourMonth;
  lang: Locale;
  t: AwardStrings;
}) {
  return (
    <div>
      <h3 className="text-[1.02rem] font-extrabold text-ink-2" dir="auto">
        {formatPeriod(month.period, lang)}
      </h3>
      <ul className="mt-3 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {month.awards.map((award) => (
          <li key={award.award}>
            <AwardCard award={award} lang={lang} t={t} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * One award, one name.
 *
 * The reason is rendered in full, in the words the decider typed. That is the
 * whole difference between this page and a leaderboard: the figures explain
 * what somebody did, and the sentence explains why the association stopped at
 * them. The staff form says plainly that the text is published, on the field
 * itself, so nobody writes a comparison here by accident.
 *
 * NO PHOTOGRAPH, and this is a choice rather than a missing feature.
 * `award.photo` is decided correctly by visibility.ts and carried faithfully,
 * and /api/public/photo/[userId] now exists and resolves the same consent
 * server-side per request — so the picture COULD be shown. What it would cost
 * is the guarantee above: the URL needs a user id, so the page would have to
 * hold one, and the one property that makes this page structurally incapable
 * of naming a person it should not would be gone to gain a portrait.
 *
 * The trade is worth making the other way round on a page like /continuity,
 * where the whole content is faces and names. Here the content is four
 * decisions a month and the sentences behind them, and a card without a
 * portrait costs the reader nothing. If the association wants faces, the
 * change is to carry an id into PublicAward — and the probe's
 * "the published shape has no field an id could live in" check is the alarm
 * that will go off when somebody does it without meaning to.
 */
function AwardCard({
  award, lang, t, featured = false,
}: {
  award: PublicAward;
  lang: Locale;
  t: AwardStrings;
  featured?: boolean;
}) {
  return (
    <article
      className={
        'flex h-full flex-col rounded-2xl border bg-surface p-5 ' +
        (featured ? 'border-brand-orange/50' : 'border-line')
      }
    >
      <p className="flex items-center gap-2 text-[0.78rem] font-extrabold tracking-[0.08em] text-ink-3">
        <span aria-hidden className="text-[1.05rem]">{AWARD_ICONS[award.award]}</span>
        {t.names[award.award]}
      </p>

      <h4
        className={
          'mt-2 font-extrabold leading-snug ' + (featured ? 'text-[1.25rem]' : 'text-[1.05rem]')
        }
        dir="auto"
      >
        {award.name}
      </h4>

      {/* The decider's own sentence. `dir="auto"` because a reason written in
          English about an Arabic-named volunteer must not be forced right to
          left by the page's own direction. */}
      {award.reason && (
        <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-2" dir="auto">
          <span className="font-bold text-ink-3">{t.citation}</span> {award.reason}
        </p>
      )}

      {/*
        * Figures appear only when there are any.
        *
        * «ساعات موثّقة: ٠» beside the name of the volunteer of the month reads
        * as a mark against them, and a nought and a missing figure would look
        * identical anyway. The team card shows the size of the group it was
        * measured over, because an average nobody can divide back is a number
        * the reader has to take on trust.
        */}
      <dl className="mt-auto pt-4 text-[0.86rem]">
        {!!award.minutes && (
          <Fact label={t.hours} value={formatDuration(award.minutes, lang)} />
        )}
        {!!award.attendances && (
          <Fact label={t.attendances} value={formatNumber(award.attendances, lang)} />
        )}
        {!!award.activeMembers && (
          <Fact label={t.activeMembers} value={formatNumber(award.activeMembers, lang)} />
        )}
      </dl>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-1 flex items-baseline gap-1.5">
      <dt className="font-bold text-ink-3">{label}</dt>
      <dd className="font-extrabold text-ink" dir="ltr">{value}</dd>
    </div>
  );
}
