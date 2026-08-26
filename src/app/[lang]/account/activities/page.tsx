import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Arrow, Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { myActivities, scheduledMinutes, type MyActivityRow } from '@/lib/activities';
import {
  registrationOutcome, alsoWithdrew, groupOf, canWithdraw, OUTCOME_TONE,
  type RegistrationOutcome, type RegistrationGroup,
} from '@/lib/registration-view';
// The counted-noun formatter and the Beirut-zone date writer. lib/format's
// formatDuration writes «2 ساعة» where Arabic says «ساعتان», and an activity's
// date printed as a raw ISO string is the database's way of saying it.
import { formatDate, formatDuration } from '@/lib/when';
import { emptyStates } from '@/lib/dictionaries/empty-states';
import { leaveActivityAction } from '@/lib/actions/activities';

export async function generateMetadata(props: PageProps<'/[lang]/account/activities'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.activities.mineTitle,
    alternates: alternatesFor(lang, '/account/activities'),
    robots: { index: false, follow: false },
  };
}

export default async function MyActivitiesPage(props: PageProps<'/[lang]/account/activities'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.activities;
  const nothing = emptyStates(lang).activities;

  if (!isDbConfigured()) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.errors.dbUnavailable}
        </p>
      </Container></Section>
    );
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  const rows = await myActivities(user.id);
  // Reading the clock in a component body is impure, and the rule is right to
  // flag it — except here. This is an async server component that has already
  // called connection(), so it renders once per request and "now" is the
  // request time. Splitting past from upcoming activities needs exactly that.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  /*
   * One verdict per registration, reached in lib/registration-view.ts.
   *
   * The page used to sort on `registration_status` and `attended` alone and
   * never asked whether the activity itself had been called off — so an
   * activity the association cancelled landed in "past" with «لم تحضر» under
   * it, telling the volunteer they had failed to turn up to something that
   * never happened. Four states now, decided in one place, so the headings and
   * the labels cannot drift apart from each other.
   */
  const decided = rows.map((row) => {
    const facts = {
      registrationStatus: row.registration_status,
      attended: row.attended,
      cancelledAt: row.cancelled_at,
      endsAt: row.ends_at,
    };
    return {
      row,
      outcome: registrationOutcome(facts, now),
      /* The half of the record the headline would otherwise swallow — see
       * alsoWithdrew. Nothing on this page is allowed to disappear. */
      withdrewToo: alsoWithdrew(facts),
    };
  });

  const inGroup = (group: RegistrationGroup) => decided.filter((d) => groupOf(d.outcome) === group);

  return (
    <Section>
      <Container className="max-w-3xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.mineTitle}
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.mineLede}</p>

        {rows.length === 0 ? (
          /*
           * A sentence and a link, where there used to be a sentence and a
           * filled orange button.
           *
           * The button was the loudest thing on an empty page, and it led to a
           * listing that is itself empty most days — an emphatic invitation to
           * a room with nobody in it. The sentence says where openings are
           * announced and that a notice reaches them, which is the part that is
           * actually true today; the link stays because the page is real and
           * somebody may want to look.
           */
          <div className="mt-8">
            <p className="max-w-[70ch] rounded-xl border border-line bg-surface-2 px-5 py-4 leading-relaxed text-ink-2">
              {nothing.never}
            </p>
            <Link
              href={`/${lang}/opportunities`}
              className="mt-4 inline-flex min-h-11 items-center font-bold text-brand-blue hover:underline dark:text-brand-orange"
            >
              {nothing.browse}
              <Arrow lang={lang} />
            </Link>
          </div>
        ) : (
          <>
            {/*
              * «لا شيء الآن» and «لا شيء أبداً» are different sentences.
              *
              * The upcoming group used to render nothing at all when it was
              * empty, so a volunteer of two years with a quiet month met a page
              * that began at «سابقة» — their own record reading as though the
              * association had stopped inviting them. Said out loud instead,
              * and said as a fact about the diary rather than about them.
              */}
            {inGroup('upcoming').length === 0 ? (
              <section className="mt-9">
                <h2 className="text-[0.8rem] font-bold tracking-[0.12em] text-ink-3">
                  {t.upcoming}
                </h2>
                <p className="mt-3 max-w-[70ch] rounded-xl border border-line bg-surface-2 px-5 py-4 leading-relaxed text-ink-2">
                  {nothing.noneUpcoming}
                </p>
              </section>
            ) : (
              <Group title={t.upcoming} rows={inGroup('upcoming')} lang={lang} dict={dict} />
            )}
            <Group title={t.past} rows={inGroup('past')} lang={lang} dict={dict} />
            {/*
              * Its own list, with its own heading, and never dimmed.
              *
              * These used to be scattered through "past" as absences. An
              * activity the association called off is the association's news,
              * not the volunteer's failing, and greying it out would say the
              * row hardly matters — when it is the one row on the page a person
              * is most likely to want an explanation for.
              */}
            <Group title={t.calledOffTitle} rows={inGroup('called-off')} lang={lang} dict={dict} />
            {/* Separate from the above, because "I changed my mind" and "the
                association cancelled" were sharing one word. */}
            <Group
              title={t.withdrawnTitle}
              rows={inGroup('withdrawn')}
              lang={lang}
              dict={dict}
              muted
            />
          </>
        )}

        <Link
          href={`/${lang}/account`}
          className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {dict.account.hours.backToAccount}
        </Link>
      </Container>
    </Section>
  );
}

function Group({
  title, rows, lang, dict, muted = false,
}: {
  title: string;
  rows: Array<{ row: MyActivityRow; outcome: RegistrationOutcome; withdrewToo: boolean }>;
  lang: Locale;
  dict: Dictionary;
  muted?: boolean;
}) {
  const t = dict.account.activities;
  if (rows.length === 0) return null;

  return (
    <section className="mt-9">
      <h2 className="text-[0.8rem] font-bold tracking-[0.12em] text-ink-3">{title}</h2>
      <ul className="mt-3 space-y-3">
        {rows.map(({ row: a, outcome, withdrewToo }) => {
          const minutes = a.attended_minutes ?? scheduledMinutes(a);
          return (
            <li
              key={a.id}
              className={`rounded-2xl border border-line p-5 ${muted ? 'bg-surface-2' : 'bg-surface'}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-[1.05rem] font-extrabold">
                  {lang === 'ar' ? a.title_ar : a.title_en}
                </h3>
                {a.starts_at && (
                  /* «الثلاثاء في 25 - 8 - 2026», not "2026-08-25T06:00Z". The
                     ISO form is the database's way of saying it, and read back
                     in GMT it can name the day before. */
                  <p className="text-[0.85rem] text-ink-3">{formatDate(a.starts_at, lang)}</p>
                )}
              </div>

              {a.location && <p className="mt-1 text-[0.9rem] text-ink-2">📍 {a.location}</p>}

              {/* The pill says which of the seven things this is. Never colour
                  alone: the words carry it, and the tint only agrees. */}
              <p className="mt-2.5">
                <span
                  className={`inline-block rounded-full border px-3 py-1 text-[0.82rem] font-extrabold ${OUTCOME_TONE[outcome]}`}
                >
                  {t.outcome[OUTCOME_KEY[outcome]]}
                </span>
                {outcome === 'attended' && minutes ? (
                  <span className="ms-2 text-[0.9rem] font-bold text-ink-2">
                    {t.hoursCounted.replace('{duration}', formatDuration(minutes, lang))}
                  </span>
                ) : null}
              </p>

              {/*
                * A sentence, not only a pill.
                *
                * Two words in a coloured oval is enough to distinguish states
                * from each other and not enough to explain one. The three that
                * a volunteer would otherwise have to guess at get a line of
                * prose; "your place is held" needs none.
                */}
              {outcome === 'called-off' && (
                <>
                  <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-2">{t.calledOffNote}</p>
                  {/* Never hidden. A cancellation the volunteer is given no
                      reason for is the association going quiet on them. */}
                  {a.cancel_reason?.trim() && (
                    <p className="mt-1 text-[0.92rem] leading-relaxed text-ink-2">
                      {t.calledOffReason.replace('{reason}', a.cancel_reason.trim())}
                    </p>
                  )}
                </>
              )}
              {/* Also on a called-off row where the volunteer had already given
                  up their place: the cancellation is why nothing happened, and
                  their own decision is still part of the record. */}
              {(outcome === 'withdrawn' || withdrewToo) && (
                <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-2">{t.withdrawnNote}</p>
              )}
              {outcome === 'awaiting-record' && (
                <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-2">
                  {t.awaitingRecordNote}
                </p>
              )}

              {/*
                * Offered only where there is a place to give up.
                *
                * A called-off activity whose end time has not passed used to sit
                * in the upcoming list wearing this button, and leaveActivityAction
                * would have honoured it: the registration would go to 'cancelled'
                * and the row would move to the withdrawn list. The association
                * called the activity off, and the record would then say the
                * volunteer pulled out of it.
                */}
              {canWithdraw(outcome) && (
                <form action={leaveActivityAction} className="mt-3">
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="activityId" value={a.id} />
                  <button
                    type="submit"
                    className="min-h-11 text-[0.88rem] font-bold text-danger-text hover:underline"
                  >
                    {t.leave}
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** The outcome names as the dictionary spells them. Kept beside the only thing
 *  that reads it, so a new outcome fails the build here rather than rendering
 *  an empty pill. */
const OUTCOME_KEY: Record<RegistrationOutcome, keyof Dictionary['account']['activities']['outcome']> = {
  'called-off': 'calledOff',
  withdrawn: 'withdrawn',
  attended: 'attended',
  'absence-recorded': 'absenceRecorded',
  'awaiting-record': 'awaitingRecord',
  registered: 'registered',
  waitlisted: 'waitlisted',
};
