import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import {
  opportunities, scheduledMinutes, isAwaitingDate, interestsOf,
  type OpportunityRow,
} from '@/lib/activities';
import { formatDuration } from '@/lib/hours';
import { formatDateTime } from '@/lib/when';
import { JoinButton } from '@/components/activities/JoinButton';
import { InterestButton } from '@/components/activities/InterestButton';

export async function generateMetadata(props: PageProps<'/[lang]/opportunities'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.activities.title,
    description: dict.account.activities.lede,
    alternates: alternatesFor(lang, '/opportunities'),
  };
}

export default async function OpportunitiesPage(props: PageProps<'/[lang]/opportunities'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.activities;

  if (!isDbConfigured()) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.errors.dbUnavailable}
        </p>
      </Container></Section>
    );
  }

  // Browsable signed out: someone deciding whether to volunteer should be able
  // to see what volunteering here actually involves before making an account.
  const user = await currentUser();
  const rows = await opportunities(user?.id ?? null);

  /*
   * Which of these the viewer is already waiting on, in one query rather than
   * one per card. Signed out there is nobody to have interests, so it stays
   * empty and no query runs at all.
   */
  const interestedIds = user ? await interestsOf(user.id) : new Set<string>();

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[60ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        {rows.length === 0 ? (
          <p className="mt-8 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.none}
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {rows.map((a) => (
              <ActivityCard
                key={a.id}
                a={a}
                lang={lang}
                dict={dict}
                signedIn={Boolean(user)}
                interested={interestedIds.has(a.id)}
              />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

function ActivityCard({
  a, lang, dict, signedIn, interested,
}: {
  a: OpportunityRow;
  lang: Locale;
  dict: Dictionary;
  signedIn: boolean;
  interested: boolean;
}) {
  const t = dict.account.activities;
  const minutes = scheduledMinutes(a);
  const full = a.capacity !== null && a.taken >= a.capacity;
  const awaiting = isAwaitingDate(a);

  return (
    <article className="flex flex-col rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-start gap-2">
        <h2 className="flex-1 text-[1.1rem] font-extrabold">
          {lang === 'ar' ? a.title_ar : a.title_en}
        </h2>
        {awaiting && (
          <span className="shrink-0 rounded-full border border-brand-blue/40 bg-brand-blue/10 px-3 py-1 text-[0.78rem] font-extrabold text-brand-blue dark:border-sky-300/40 dark:text-sky-300">
            {t.interest.badge}
          </span>
        )}
      </div>

      {(lang === 'ar' ? a.description_ar : a.description_en) && (
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">
          {lang === 'ar' ? a.description_ar : a.description_en}
        </p>
      )}

      <dl className="mt-4 space-y-1.5 text-[0.92rem] text-ink-2">
        {/* Says the date is not set rather than leaving a gap where a date
            should be. A missing line reads as an oversight; this reads as a
            fact about the activity. */}
        {a.starts_at ? (
          <div className="flex gap-2">
            <dt aria-hidden>📅</dt>
            <dd>{formatDateTime(a.starts_at, lang)}</dd>
          </div>
        ) : (
          <div className="flex gap-2">
            <dt aria-hidden>📅</dt>
            <dd className="font-bold">{t.interest.dateUnknown}</dd>
          </div>
        )}
        {a.location && (
          <div className="flex gap-2">
            <dt aria-hidden>📍</dt>
            <dd>{a.location}</dd>
          </div>
        )}
        {minutes && (
          <div className="flex gap-2">
            <dt aria-hidden>⏱</dt>
            <dd>{formatDuration(minutes, lang)} {t.hoursValue}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt aria-hidden>👥</dt>
          <dd>
            {a.capacity === null
              ? `${a.taken}`
              : `${a.taken} / ${a.capacity} ${t.spots}`}
            {full && <span className="ms-2 font-bold text-ink-3">({t.full})</span>}
            {a.waiting > 0 && (
              <span className="ms-2 text-ink-3">
                {t.waitlist}: {a.waiting}
              </span>
            )}
          </dd>
        </div>
        {a.min_stage !== null && (
          <div className="flex gap-2">
            <dt aria-hidden>🔒</dt>
            <dd>{t.requiresStage} {a.min_stage}</dd>
          </div>
        )}
      </dl>

      <div className="mt-5 pt-1">
        {/*
          * No date, no registration — there is nothing to turn up to. The
          * offer is to be told when there is. isAwaitingDate is the single
          * definition of that state, shared with the action, so the button on
          * offer here and the action behind it cannot disagree.
          */}
        {awaiting ? (
          <InterestButton
            activityId={a.id}
            lang={lang}
            dict={dict}
            interested={interested}
          />
        ) : (
          <JoinButton
            activityId={a.id}
            lang={lang}
            dict={dict}
            signedIn={signedIn}
            current={a.my_status}
          />
        )}
      </div>
    </article>
  );
}
