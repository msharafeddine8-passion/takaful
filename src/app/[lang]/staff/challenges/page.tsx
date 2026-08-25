import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import { beirutToday, formatDate } from '@/lib/when';
import { beirutMonthWindow } from '@/lib/challenges';
import { challengeAdminList } from '@/lib/challenge-progress';
import { archiveChallengeAction } from '@/lib/actions/challenges';
import { challengeDictionaries, challengePlural, unitFormsFor } from '@/lib/dictionaries/challenges';
import { ChallengeForm } from '@/components/staff/ChallengeForm';

/**
 * Setting and retiring the association's shared goals.
 *
 * The listing shows every challenge with its community total and nothing else.
 * A coordinator has no business seeing who contributed what — that is the
 * report they would then be asked to read out at a meeting, and reading it out
 * is the harm the whole feature was designed to avoid. So there is no
 * per-person figure on this page, and no query behind it that could produce
 * one.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/challenges'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: challengeDictionaries[lang].manageTitle,
    alternates: alternatesFor(lang, '/staff/challenges'),
    robots: { index: false, follow: false },
  };
}

export default async function StaffChallengesPage(props: PageProps<'/[lang]/staff/challenges'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = challengeDictionaries[lang];

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
  if (!can(user, 'challenges.manage')) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.staff.forbidden}
        </p>
      </Container></Section>
    );
  }

  /* The month boundary is worked out here, on the server, from Beirut's own
   * today — not in the browser, where a coordinator abroad would be handed
   * their own month, and not from the database session, which runs GMT and
   * would start the month two hours late. */
  const today = beirutToday();
  const defaultWindow = beirutMonthWindow(today) ?? { startsOn: today, endsOn: today };

  const rows = await challengeAdminList();

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{dict.account.staff.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.manageTitle}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.manageLede}</p>

        <details className="mt-8 rounded-2xl border border-line bg-surface p-6">
          <summary className="min-h-11 cursor-pointer py-2 text-[1rem] font-extrabold text-brand-blue dark:text-brand-orange">
            {t.newChallenge}
          </summary>
          <div className="mt-5">
            <ChallengeForm lang={lang} t={t} defaultWindow={defaultWindow} />
          </div>
        </details>

        <p className="mt-8 rounded-xl border border-line bg-surface-2 px-5 py-3.5 text-[0.9rem] leading-relaxed text-ink-2">
          {t.privacyNote}
        </p>

        {rows.length === 0 ? (
          <p className="mt-6 text-ink-2">{t.emptyStaff}</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {rows.map((row) => {
              const forms = unitFormsFor(t, row.metric);
              return (
                <li key={row.id} className="rounded-2xl border border-line bg-surface p-6">
                  <p className="text-[0.78rem] font-extrabold tracking-[0.12em] text-ink-3">
                    {t.statuses[row.view.status]} · {t.metrics[row.metric]}
                  </p>
                  <p className="mt-1.5 text-[1.05rem] font-extrabold">
                    {lang === 'ar' ? row.name_ar : row.name_en}
                  </p>
                  <p className="mt-1.5 text-[0.9rem] text-ink-2">
                    {t.communityDone}{' '}
                    <span className="font-extrabold text-ink">
                      {challengePlural(forms, row.view.totalDisplay, lang)}
                    </span>{' '}
                    {t.ofTarget.replace(
                      '{target}',
                      challengePlural(forms, row.view.targetDisplay, lang),
                    )}{' '}
                    <span dir="ltr">({row.view.percent}%)</span>
                  </p>
                  {/*
                    * Anchored at midday UTC, not midnight.
                    *
                    * formatDate renders in Beirut, and a bare '2026-08-01' is
                    * parsed as midnight GMT — which is 02:00 on the 1st in
                    * Beirut in winter but would be the 31st of July for any
                    * zone behind GMT, and is one careless refactor away from
                    * being off by a day here. Midday is three hours clear of
                    * both edges, so the calendar day survives the round trip.
                    */}
                  <p className="mt-1 text-[0.85rem] text-ink-3">
                    {formatDate(`${row.starts_on}T12:00:00Z`, lang)}
                    {' — '}
                    {formatDate(`${row.ends_on}T12:00:00Z`, lang)}
                  </p>

                  {row.archived_at ? (
                    <p className="mt-3 text-[0.85rem] text-ink-3">
                      {t.archivedOn.replace('{date}', formatDate(row.archived_at, lang))}
                      {row.archive_reason ? ` — ${row.archive_reason}` : ''}
                    </p>
                  ) : (
                    /* Archiving asks for the reason in the same breath, because
                       the reason is the only account anybody will have later of
                       why a goal the association announced was withdrawn. */
                    <form
                      action={archiveChallengeAction}
                      className="mt-4 flex flex-wrap items-center gap-2"
                    >
                      <input type="hidden" name="lang" value={lang} />
                      <input type="hidden" name="challengeId" value={row.id} />
                      <input
                        name="reason"
                        required
                        minLength={3}
                        placeholder={t.archiveReason}
                        className="min-h-11 w-56 rounded-xl border border-line bg-ground px-4 text-[0.9rem]"
                      />
                      <button
                        type="submit"
                        className="min-h-11 rounded-full border-2 border-danger px-5 py-2.5 text-[0.9rem] font-extrabold text-danger-text transition-colors hover:bg-danger/10"
                      >
                        {t.archive}
                      </button>
                      <span className="w-full text-[0.8rem] text-ink-3">{t.archiveNote}</span>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <Link
          href={`/${lang}/staff`}
          className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {dict.account.staff.dashboard.title}
        </Link>
      </Container>
    </Section>
  );
}
