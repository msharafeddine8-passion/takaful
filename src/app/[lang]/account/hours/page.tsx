import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import {
  entriesFor,
  verifiedMinutes,
  pendingMinutes,
  pendingEntryCount,
  currentStage,
  openActivities,
  type HourStatus,
} from '@/lib/hours';
import {
  ledgerRows, activityTitle, LEDGER_TONE, type LedgerRow,
} from '@/lib/hours-ledger';
/*
 * The counted-noun formatter, not the one lib/hours re-exports.
 *
 * There are two formatDuration in this repository. lib/format's writes «2 ساعة»
 * — the shape Arabic uses from eleven upwards — for a two-hour session, where
 * the word is «ساعتان». On the one page in the product that is entirely about
 * durations that is not a detail. countPhrase comes from here for the same
 * reason: «1 قيد» is not a sentence anybody says.
 */
import { beirutToday, countPhrase, formatDuration } from '@/lib/when';
import { HoursForm } from '@/components/account/HoursForm';

export async function generateMetadata(props: PageProps<'/[lang]/account/hours'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.hours.title,
    alternates: alternatesFor(lang, '/account/hours'),
    robots: { index: false, follow: false },
  };
}

export default async function HoursPage(props: PageProps<'/[lang]/account/hours'>) {
  // Never prerender: what this shows depends on who is asking.
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.hours;

  if (!isDbConfigured()) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {dict.account.errors.dbUnavailable}
          </p>
        </Container>
      </Section>
    );
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  const [verified, pending, awaiting, stage, activities, entries] = await Promise.all([
    verifiedMinutes(user.id),
    pendingMinutes(user.id),
    /* How many, not only how long. "3h 30m awaiting review" does not answer
     * the question somebody actually has, which is whether anyone has looked
     * yet — and one entry sitting for a fortnight is a different situation
     * from six logged this morning. */
    pendingEntryCount(user.id),
    currentStage(user.id),
    openActivities(),
    entriesFor(user.id),
  ]);

  const statusLabel: Record<HourStatus, string> = {
    pending: t.statusPending,
    verified: t.statusVerified,
    rejected: t.statusRejected,
    corrected: t.statusCorrected,
  };

  /*
   * Today in Beirut, and from the same function the action uses.
   *
   * This was `new Date().toISOString().slice(0, 10)`, which is today in GMT:
   * between midnight and two in the morning Beirut time it is still yesterday,
   * so somebody logging an evening's work late got the wrong day filled in for
   * them — and it was checked against beirutToday() on submit, so the form and
   * the rule were reading two different calendars.
   */
  const today = beirutToday();

  const rows = ledgerRows(entries);

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[60ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        {/*
          * Three figures, each with the sentence that makes it mean something.
          *
          * They were three bare numerals. "2h 30m" under the words "awaiting
          * review" does not say that those hours are not in the total yet, and
          * that is the single most common thing a volunteer gets wrong about
          * this page.
          */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Tile
            label={t.verifiedLabel}
            value={verified > 0 ? formatDuration(verified, lang) : null}
            note={verified > 0 ? t.verifiedNote : undefined}
            strong
          />
          <Tile
            label={t.pendingLabel}
            value={pending > 0 ? formatDuration(pending, lang) : null}
            // The sentence carries the count in the form Arabic takes; the
            // zero form is a complete answer on its own, which is why the
            // figure above it is dropped rather than shown as a dash.
            sentence={countPhrase(awaiting, t.awaiting)}
            note={awaiting > 0 ? t.pendingNote : undefined}
          />
          <Tile
            label={t.stageLabel}
            value={stage === 0 ? null : String(stage)}
            sentence={stage === 0 ? t.notStarted : t.stageOf}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[1.1rem] font-extrabold">{t.logTitle}</h2>
          <HoursForm
            lang={lang}
            dict={dict}
            today={today}
            activities={activities.map((a) => ({
              id: a.id,
              title: lang === 'ar' ? a.title_ar : a.title_en,
            }))}
          />
        </div>

        <h2 className="mt-10 text-[1.1rem] font-extrabold">{t.historyTitle}</h2>
        {/* Said before the table rather than discovered from it: a volunteer
            who sees an entry they remember logging sitting there marked
            "corrected" should already know why it is still on the page. Not
            said above an empty ledger, where a promise about what it keeps is
            a promise about nothing. */}
        {rows.length > 0 && (
          <p className="mt-2 max-w-[70ch] text-[0.95rem] leading-relaxed text-ink-2">
            {t.historyLede}
          </p>
        )}

        {rows.length === 0 ? (
          <p className="mt-3 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">{t.empty}</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[38rem] border-collapse bg-surface text-start">
              <thead>
                <tr className="border-b border-line text-[0.8rem] font-bold tracking-[0.08em] text-ink-3">
                  <th className="px-4 py-3 text-start">{t.colDate}</th>
                  <th className="px-4 py-3 text-start">{t.colActivity}</th>
                  <th className="px-4 py-3 text-start">{t.colDuration}</th>
                  <th className="px-4 py-3 text-start">{t.colStatus}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line/60 text-[0.95rem] last:border-0"
                  >
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      {/*
                        * A carry-over is counted UP TO this day and was not
                        * worked on it. Printed bare, the ledger told somebody
                        * they had volunteered a hundred and twenty hours on one
                        * Tuesday. The date itself keeps dir="ltr" — it is an
                        * ISO-shaped string, not prose — and the label does not,
                        * because it is Arabic.
                        */}
                      {row.dateMeaning === 'counted-up-to' && (
                        <span className="block text-[0.78rem] font-bold text-ink-3">
                          {t.countedUpToLabel}
                        </span>
                      )}
                      <span dir="ltr" className="inline-block">{row.date}</span>
                    </td>

                    <td className="px-4 py-3 align-top text-ink-2">
                      <Detail row={row} lang={lang} dict={dict} />
                    </td>

                    <td className="px-4 py-3 align-top whitespace-nowrap font-semibold">
                      {/*
                        * A reversal is stored as negative minutes. formatDuration
                        * answers «—» for anything at or below zero, so the row
                        * that had just taken hours off somebody's total showed an
                        * em dash and no figure at all. The amount is rendered
                        * from its absolute value and the direction is said in
                        * words above it — a bare "-2h" is easy to read past.
                        */}
                      {row.direction === 'removed' && (
                        <span className="block text-[0.78rem] font-bold text-danger-text">
                          {t.removedLabel}
                        </span>
                      )}
                      {formatDuration(row.minutes, lang)}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-1 text-[0.8rem] font-bold ${LEDGER_TONE[row.status]}`}
                      >
                        {statusLabel[row.status]}
                      </span>
                      {row.superseded && (
                        <p className="mt-1.5 max-w-[26ch] text-[0.8rem] leading-relaxed text-ink-3">
                          {t.supersededNote}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link
          href={`/${lang}/account`}
          className="mt-8 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {t.backToAccount}
        </Link>
      </Container>
    </Section>
  );
}

/**
 * What this line of the ledger is: an activity, an afternoon somebody wrote
 * down themselves, service from before the platform, or a staff correction.
 *
 * All four used to render as one cell, and three of them rendered as «—».
 */
function Detail({ row, lang, dict }: { row: LedgerRow; lang: Locale; dict: Dictionary }) {
  const t = dict.account.hours;
  const title = activityTitle(row, lang);

  return (
    <>
      {row.kind === 'carried' && (
        <>
          <span className="inline-block rounded-full bg-brand-blue/10 px-2.5 py-1 text-[0.8rem] font-extrabold text-brand-blue dark:bg-sky-300/10 dark:text-sky-300">
            {t.carriedOver}
          </span>
          <p className="mt-1.5 max-w-[42ch] text-[0.82rem] leading-relaxed text-ink-3">
            {t.carriedExplain}
          </p>
        </>
      )}

      {row.kind === 'correction' && (
        <span className="inline-block rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[0.8rem] font-extrabold text-ink-2">
          {t.correctionTitle}
        </span>
      )}

      {/* Where the hours came from. An entry logged by hand against no activity
          used to show an em dash even when the volunteer had written a whole
          sentence about their afternoon into the note. */}
      {row.kind === 'logged' && (
        <span className="block font-semibold text-ink">{title ?? t.activityNone}</span>
      )}
      {row.kind === 'logged' && row.ownNote && (
        <p className="mt-1 max-w-[42ch] text-[0.88rem] leading-relaxed">
          <span className="font-bold text-ink-3">{t.yourNoteLabel}: </span>
          {row.ownNote}
        </p>
      )}

      {/*
        * Attributed, always.
        *
        * This is the sentence a member of staff wrote about somebody else's
        * record — the grounds for a correction, the period a carry-over covers,
        * or why an entry was not verified. Unlabelled under a volunteer's own
        * hours it reads as the site's verdict on them rather than as one
        * person's note, which is the difference between being told something
        * and being judged.
        */}
      {row.staffNote && (
        <p className="mt-1 max-w-[42ch] text-[0.88rem] leading-relaxed">
          <span className="font-bold text-ink-3">{t.staffNoteLabel}: </span>
          {row.staffNote}
        </p>
      )}
    </>
  );
}

/** One figure with the sentence that makes it mean something. */
function Tile({
  label, value, sentence, note, strong = false,
}: {
  label: string;
  /** Null where there is nothing yet — the sentence says so instead, and an em
   *  dash reads as a value that failed to load rather than as a nought. */
  value: string | null;
  sentence?: string;
  note?: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-[0.82rem] font-bold tracking-[0.13em] text-ink-3">{label}</p>
      {value && (
        <p
          className={`mt-1.5 text-[1.6rem] font-extrabold leading-tight ${
            strong ? 'text-brand-blue dark:text-brand-orange' : ''
          }`}
        >
          {value}
        </p>
      )}
      {sentence && (
        <p className={`text-[0.95rem] font-bold text-ink-2 ${value ? 'mt-1' : 'mt-1.5'}`}>
          {sentence}
        </p>
      )}
      {note && <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-3">{note}</p>}
    </div>
  );
}
