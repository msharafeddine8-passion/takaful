import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can, isStaff } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import { beirutToday, formatDateTime } from '@/lib/when';
import { formatDuration, formatNumber } from '@/lib/format';
import {
  PERSON_AWARDS, isPeriod, periodOf, previousPeriod,
  shortlist, shortlistTeams, type AwardKind, type NomineeFacts,
} from '@/lib/awards';
import {
  candidateRows, decidedForPeriod, teamRows, toFacts, type CandidateRow, type DecidedRow,
} from '@/lib/awards-data';
import {
  AWARD_ICONS, awardDictionaries, formatPeriod, type AwardStrings,
} from '@/lib/dictionaries/awards';
import { AwardDecisionForm } from '@/components/staff/AwardDecisionForm';

/**
 * Where the decision is made.
 *
 * THE SHORTLIST IS AN ORDERING, NOT A RESULT, and the page has to say so in as
 * many words before the first name is read — `nominatedNote` is rendered above
 * every list, not in a footnote under it. Five names sorted by a figure look
 * exactly like a leaderboard, and a coordinator in a hurry approves the top
 * row. The whole feature exists to stop that.
 *
 * So: no position numbers, no medals, no «الأول». The lists are <ul> and never
 * <ol>, and no callback here takes an index — there is nothing for a template
 * to print even by accident. The figures ARE shown, because a decision made
 * without them is a popularity contest, but they are shown as facts about
 * somebody's month rather than as a score to beat.
 *
 * WHAT LEAVES THIS PAGE. Nothing. The shortlist is built per request from
 * lib/awards-data and discarded with the response; migration 036 has no table
 * it could be written to, and the audit line for a decision records how many
 * names were considered but never which. The four people not chosen are not
 * recorded anywhere, here or afterwards.
 *
 * WHO SEES WHAT. Any member of staff may read the shortlist and argue for a
 * name in the room. Only `awards.decide` gets the forms, because
 * recognition_awards.decided_by is NOT NULL and never deletable, and that
 * record is the point.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/awards'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: awardDictionaries[lang].manageTitle,
    alternates: alternatesFor(lang, '/staff/awards'),
    robots: { index: false, follow: false },
  };
}

export default async function StaffAwardsPage(props: PageProps<'/[lang]/staff/awards'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = awardDictionaries[lang];

  if (!isDbConfigured()) {
    return <Frame><Notice text={dict.account.errors.dbUnavailable} /></Frame>;
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);
  if (!isStaff(user)) return <Frame><Notice text={dict.account.staff.forbidden} /></Frame>;

  const mayDecide = can(user, 'awards.decide');

  /*
   * The month defaults to the one just finished.
   *
   * You judge a month once it is over: opening on the current month would show
   * a shortlist built from a fortnight and invite an award for half a month's
   * work. `beirutToday` and not the server's own date — the association's
   * calendar decides which month has ended, and the server runs GMT.
   */
  const today = beirutToday();
  const thisMonth = periodOf(today) ?? '';
  const params = await props.searchParams;
  const asked = String(params.period ?? '');
  const period = isPeriod(asked) ? asked : (previousPeriod(thisMonth) ?? thisMonth);

  const rows = await candidateRows(period);
  const facts: NomineeFacts[] = rows.map((r) => toFacts(r, today));
  const byId = new Map<string, CandidateRow>(rows.map((r) => [r.user_id, r]));

  const teams = await teamRows(period);
  const teamList = shortlistTeams(teams, period);

  const decided = await decidedForPeriod(period);
  const settled = new Map<AwardKind, DecidedRow>(decided.map((d) => [d.award, d]));

  return (
    <Frame>
      <Kicker>{dict.account.staff.kicker}</Kicker>
      <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
        {t.manageTitle}
      </h1>
      <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.manageLede}</p>

      {/* Said before any name is reached. A reader who meets five names sorted
          by a figure has already decided it is a ranking by the time a
          disclaimer arrives underneath it. */}
      <p
        lang={lang}
        className="mt-5 max-w-[62ch] rounded-2xl border border-brand-orange/40 bg-brand-orange/[0.07] px-5 py-4 text-[0.95rem] font-bold leading-relaxed text-brand-orange-text dark:text-ink"
      >
        {t.nominatedNote}
      </p>

      {/* A plain GET form. The month is a query string, so a link shared in a
          meeting shows the sender's month and the page needs no JavaScript. */}
      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <label className="block" htmlFor="period">
          <span className="mb-1.5 block text-[0.84rem] font-extrabold text-ink-3">
            {t.periodLabel}
          </span>
          <input
            id="period"
            name="period"
            type="month"
            defaultValue={period}
            max={thisMonth}
            className="min-h-11 rounded-xl border border-line bg-surface px-3 text-[0.95rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
          />
        </label>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-[0.92rem] font-bold transition-colors hover:bg-surface"
        >
          {t.periodApply}
        </button>
        <p className="ms-auto text-[0.9rem] font-extrabold text-ink-2" dir="auto">
          {formatPeriod(period, lang)}
        </p>
      </form>

      {!mayDecide && <Notice text={t.forbidden} />}

      <div className="mt-8 space-y-8">
        {PERSON_AWARDS.map((award) => {
          const list = shortlist(award, facts, period);
          const already = settled.get(award);
          return (
            <section key={award} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <AwardHead award={award} lang={lang} />

              {already ? (
                <Settled row={already} lang={lang} t={t} />
              ) : list.length === 0 ? (
                <p className="mt-4 text-[0.95rem] text-ink-2">{t.noCandidates}</p>
              ) : (
                /* <ul>, never <ol>, and no index in the callback: there is no
                   position for a template to print even by accident. */
                <ul className="mt-4 list-none space-y-3">
                  {list.map((n) => {
                    const row = byId.get(n.userId);
                    const name = row?.full_name ?? n.userId;
                    return (
                      <li key={n.userId} className="rounded-xl border border-line bg-ground p-4">
                        <p className="text-[1rem] font-extrabold" dir="auto">{name}</p>
                        <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.86rem]">
                          <Fact label={t.hours} value={formatDuration(n.verifiedMinutes, lang)} />
                          <Fact label={t.attendances} value={formatNumber(n.attendances, lang)} />
                          <Fact label={t.points} value={formatNumber(n.score, lang)} />
                        </dl>
                        {mayDecide && (
                          <AwardDecisionForm
                            lang={lang}
                            t={t}
                            period={period}
                            award={award}
                            userId={n.userId}
                            label={name}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}

        {/* ------------------------------------------------------- the team */}
        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <AwardHead award="team_of_the_month" lang={lang} />
          {(() => {
            const already = settled.get('team_of_the_month');
            if (already) return <Settled row={already} lang={lang} t={t} />;
            if (teamList.length === 0) {
              return <p className="mt-4 text-[0.95rem] text-ink-2">{t.noCandidates}</p>;
            }
            return (
              <ul className="mt-4 list-none space-y-3">
                {teamList.map((team) => (
                  <li key={team.committee} className="rounded-xl border border-line bg-ground p-4">
                    <p className="text-[1rem] font-extrabold" dir="auto">{team.committee}</p>
                    <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.86rem]">
                      <Fact label={t.activeMembers} value={formatNumber(team.activeMembers, lang)} />
                      <Fact label={t.hours} value={formatDuration(team.verifiedMinutes, lang)} />
                      <Fact label={t.attendances} value={formatNumber(team.attendances, lang)} />
                      {/* Rounded to print, never to compare — see teamAverage. */}
                      <Fact label={t.perMember} value={formatNumber(Math.round(team.average), lang)} />
                    </dl>
                    {mayDecide && (
                      <AwardDecisionForm
                        lang={lang}
                        t={t}
                        period={period}
                        award="team_of_the_month"
                        team={team.committee}
                        label={team.committee}
                      />
                    )}
                  </li>
                ))}
              </ul>
            );
          })()}
        </section>
      </div>

      {/* Where the decision ends up. Whoever chooses a name should be one tap
          from the page the association's visitors read, because that page — not
          this one — is what the choice actually was. */}
      <Link
        href={`/${lang}/honours`}
        className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
      >
        {t.title} →
      </Link>
    </Frame>
  );
}

/* ------------------------------------------------------------------ pieces */

function Frame({ children }: { children: ReactNode }) {
  return (
    <Section>
      <Container className="max-w-4xl">{children}</Container>
    </Section>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">{text}</p>
  );
}

function AwardHead({ award, lang }: { award: AwardKind; lang: Locale }) {
  const t = awardDictionaries[lang];
  return (
    <>
      <h2 className="flex items-center gap-2.5 text-[1.1rem] font-extrabold">
        <span aria-hidden>{AWARD_ICONS[award]}</span>
        {t.names[award]}
      </h2>
      <p className="mt-1.5 max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-2">
        {t.meanings[award]}
      </p>
    </>
  );
}

/**
 * A month that has been decided.
 *
 * The shortlist is not rendered underneath. Once the choice is made the other
 * names have no further reason to be on a screen, and leaving them there turns
 * the page into a record of who was passed over — which is the one thing this
 * feature must never produce.
 */
function Settled({
  row, lang, t,
}: {
  row: DecidedRow;
  lang: Locale;
  t: AwardStrings;
}) {
  return (
    <div className="mt-4 rounded-xl border-2 border-ok bg-ok/10 p-4">
      <p className="text-[0.78rem] font-extrabold tracking-[0.12em] text-ink-3">{t.decided}</p>
      <p className="mt-1 text-[1.05rem] font-extrabold" dir="auto">
        {row.winner_name ?? row.team ?? '—'}
      </p>
      <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-2" dir="auto">
        <span className="font-bold text-ink-3">{t.citation}</span> {row.reason}
      </p>
      <p className="mt-2 text-[0.82rem] text-ink-3" dir="auto">
        {t.decidedBy} {row.decided_by_name ?? '—'} · {formatDateTime(row.decided_at, lang)}
      </p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="font-bold text-ink-3">{label}</dt>
      <dd className="font-extrabold text-ink" dir="ltr">{value}</dd>
    </div>
  );
}
