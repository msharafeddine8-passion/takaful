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
import { allActivities } from '@/lib/activities';
import {
  createActivityAction,
  closeActivityAction,
  reopenActivityAction,
  cancelActivityAction,
  deleteActivityAction,
} from '@/lib/actions/activity-admin';
import { ActivityCard, CardLink } from '@/components/activities/ActivityCard';
import { activityState } from '@/lib/activity-state';

export async function generateMetadata(props: PageProps<'/[lang]/staff/activities'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.activities.manageTitle,
    alternates: alternatesFor(lang, '/staff/activities'),
    robots: { index: false, follow: false },
  };
}

const field =
  'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25';

export default async function StaffActivitiesPage(props: PageProps<'/[lang]/staff/activities'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.staff;
  const a = dict.account.activities;

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
  if (!can(user, 'activities.manage')) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">{t.forbidden}</p>
      </Container></Section>
    );
  }

  const rows = await allActivities();

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {a.manageTitle}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{a.manageLede}</p>

        <details className="mt-8 rounded-2xl border border-line bg-surface p-6">
          <summary className="cursor-pointer text-[1rem] font-extrabold text-brand-blue dark:text-brand-orange">
            {a.newActivity}
          </summary>

          <form action={createActivityAction} className="mt-5 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="lang" value={lang} />

            <label className="block">
              <span className="mb-1.5 block text-[0.88rem] font-bold">{a.titleArField}</span>
              <input name="titleAr" required dir="rtl" className={field} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[0.88rem] font-bold">{a.titleEnField}</span>
              <input name="titleEn" required dir="ltr" className={field} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[0.88rem] font-bold">{a.locationField}</span>
              <input name="location" className={field} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[0.88rem] font-bold">{a.startsField}</span>
              <input name="startsAt" type="datetime-local" required className={field} dir="ltr" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[0.88rem] font-bold">{a.endsField}</span>
              <input name="endsAt" type="datetime-local" required className={field} dir="ltr" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[0.88rem] font-bold">{a.capacityField}</span>
              <input name="capacity" type="number" min="1" className={field} dir="ltr" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[0.88rem] font-bold">{a.minStageField}</span>
              <input name="minStage" type="number" min="1" max="6" className={field} dir="ltr" />
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-brand-blue px-6 py-2.5 text-[0.92rem] font-extrabold text-white hover:bg-brand-blue-dark"
              >
                {a.create}
              </button>
            </div>
          </form>
        </details>

        <ul className="mt-8 space-y-4">
          {rows.map((row) => (
            <ActivityCard key={row.id} row={row} lang={lang} t={a}>
              <CardLink href={`/${lang}/staff/activities/${row.id}`}>
                {a.actions.manageAttendance}
              </CardLink>
              <CardLink href={`/${lang}/staff/activities/${row.id}`}>{a.actions.details}</CardLink>
              {/* Closing registration is an action, so it is a button with a
                  verb on it. It used to be labelled "اكتمل العدد", which read
                  as a status and contradicted the seat count beside it. */}
              {!row.cancelled_at && activityState(row) === 'upcoming' && (
                <form action={row.is_open ? closeActivityAction : reopenActivityAction}>
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="activityId" value={row.id} />
                  <button
                    type="submit"
                    className="min-h-11 rounded-full border border-line px-5 py-2.5 text-[0.9rem] font-bold transition-colors hover:bg-surface-2"
                  >
                    {row.is_open ? a.actions.closeRegistration : a.actions.reopenRegistration}
                  </button>
                </form>
              )}

              {/* Cancelling asks for a reason in the same breath, because the
                  reason is shown to everyone who signed up. */}
              {!row.cancelled_at && activityState(row) !== 'ended' && (
                <form action={cancelActivityAction} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="activityId" value={row.id} />
                  <input
                    name="reason"
                    required
                    placeholder={a.cancelReasonPlaceholder}
                    className="min-h-11 w-56 rounded-xl border border-line bg-ground px-4 text-[0.9rem]"
                  />
                  <button
                    type="submit"
                    className="min-h-11 rounded-full border-2 border-bad px-5 py-2.5 text-[0.9rem] font-extrabold text-bad-text transition-colors hover:bg-bad/10 dark:text-bad"
                  >
                    {a.actions.cancel}
                  </button>
                </form>
              )}

              {/* Deleting outright is offered only for an activity nobody has
                  touched — anything else keeps its history and gets cancelled. */}
              {row.taken === 0 && row.waiting === 0 && row.attended_count === 0 && (
                <form action={deleteActivityAction}>
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="activityId" value={row.id} />
                  <button
                    type="submit"
                    className="min-h-11 rounded-full px-4 py-2.5 text-[0.86rem] font-bold text-ink-3 underline transition-colors hover:text-bad-text dark:hover:text-bad"
                  >
                    {a.actions.deleteEmpty}
                  </button>
                </form>
              )}
            </ActivityCard>
          ))}
        </ul>

        <Link
          href={`/${lang}/staff`}
          className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {t.dashboard.title}
        </Link>
      </Container>
    </Section>
  );
}
