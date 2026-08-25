import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured, queryOne } from '@/lib/db';
import { roster, scheduledMinutes, interestedIn } from '@/lib/activities';
import { formatMemberNumber } from '@/lib/roster';
import { activityState, registrationState, seatsLeft } from '@/lib/activity-state';
import { formatDate, formatTimeRange, formatDuration } from '@/lib/when';
import { AttendanceSheet } from '@/components/activities/AttendanceSheet';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ActivityRosterPage(props: PageProps<'/[lang]/staff/activities/[id]'>) {
  await connection();
  const { lang, id } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.staff;
  const a = dict.account.activities;
  const att = dict.account.attendance;

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
  // Asked of authz, and asked again inside the action: hiding a form is not a
  // permission check.
  if (!can(user, 'hours.verify')) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">{t.forbidden}</p>
      </Container></Section>
    );
  }

  const activity = await queryOne<{
    title_ar: string; title_en: string; location: string | null;
    starts_at: Date | null; ends_at: Date | null;
    capacity: number | null; is_open: boolean;
    cancelled_at: Date | null; cancel_reason: string | null;
    registration_closes_at: Date | null;
  }>(
    `SELECT title_ar, title_en, location, starts_at, ends_at, capacity, is_open,
            cancelled_at, cancel_reason, registration_closes_at
       FROM activities WHERE id = $1`,
    [id],
  );
  if (!activity) notFound();

  const [people, settings, waiting] = await Promise.all([
    roster(id),
    queryOne<{ second: boolean }>(
      'SELECT hours_require_second_check AS second FROM org_settings LIMIT 1',
    ),
    interestedIn(id),
  ]);

  const scheduled = scheduledMinutes(activity);
  const state = activityState(activity);
  const reg = registrationState(activity, people.filter((p) => p.registration_status === 'registered').length);
  const left = seatsLeft(activity.capacity, people.filter((p) => p.registration_status === 'registered').length);

  // The figures the sheet has already produced, for the summary underneath it.
  const attended = people.filter((p) => p.attended === true);
  const absent = people.filter((p) => p.attended === false);
  const undecided = people.filter((p) => p.attended === null);
  const earnedMinutes = attended.reduce((sum, p) => sum + (p.attended_minutes ?? 0), 0);
  const rate = people.length ? Math.round((attended.length / people.length) * 100) : 0;

  const regLabel = {
    open: a.regState.open,
    'almost-full': a.regState.almostFull,
    full: a.regState.full,
    'deadline-passed': a.regState.deadlinePassed,
    closed: a.regState.closed,
    ended: a.regState.ended,
    cancelled: a.regState.cancelled,
  }[reg];

  return (
    <Section>
      {/* Narrow enough to read, wide enough for the sheet — the old page left
          the facts stranded at opposite edges of a wide screen. */}
      <Container className="max-w-4xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.5rem,1.25rem+1.3vw,2.1rem)] font-extrabold tracking-tight">
          {lang === 'ar' ? activity.title_ar : activity.title_en}
        </h1>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-surface-2 px-3 py-1 text-[0.82rem] font-extrabold">
            {a.state[state]}
          </span>
          <span className="rounded-full bg-surface-2 px-3 py-1 text-[0.82rem] font-extrabold">
            {regLabel}
          </span>
        </div>

        <dl className="mt-5 grid gap-x-6 gap-y-3 rounded-2xl border border-line bg-surface p-5 text-[0.95rem] sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="font-bold text-ink-2">{a.location}</dt>
            <dd>{activity.location || '—'}</dd>
          </div>
          <div>
            <dt className="font-bold text-ink-2">{a.date}</dt>
            <dd>{formatDate(activity.starts_at, lang)}</dd>
          </div>
          <div>
            <dt className="font-bold text-ink-2">{a.time}</dt>
            <dd>{formatTimeRange(activity.starts_at, activity.ends_at, lang)}</dd>
          </div>
          <div>
            <dt className="font-bold text-ink-2">{a.durationLabel}</dt>
            <dd>{formatDuration(scheduled, lang)}</dd>
          </div>
          <div>
            <dt className="font-bold text-ink-2">{a.seatsHeading}</dt>
            <dd>
              {activity.capacity === null
                ? `${people.length} · ${a.noCapacity}`
                : a.seatsTaken
                    .replace('{taken}', String(people.length))
                    .replace('{capacity}', String(activity.capacity))}
            </dd>
          </div>
          {activity.capacity !== null && (
            <div>
              <dt className="font-bold text-ink-2">{a.seatsLeftHeading}</dt>
              <dd>{a.seatsLeftLabel.replace('{left}', String(left ?? 0))}</dd>
            </div>
          )}
        </dl>

        {activity.cancelled_at && activity.cancel_reason && (
          <p className="mt-4 rounded-xl border-2 border-danger bg-danger/10 p-4 text-[0.95rem] font-bold">
            {a.cancelReasonLabel}: {activity.cancel_reason}
          </p>
        )}

        {settings?.second && (
          <p className="mt-5 rounded-xl border border-brand-orange bg-brand-orange/10 px-5 py-3.5 text-[0.93rem] text-ink-2">
            {a.secondCheckOn}
          </p>
        )}

        {/*
          * Who is waiting on this one.
          *
          * Shown whenever anybody has asked, including after the date is set —
          * the coordinator needs it beforehand to judge whether the activity
          * is worth scheduling at all (twenty names is a different decision
          * from two), and afterwards to see that the message actually went
          * out. Hiding it once scheduled would remove the evidence at exactly
          * the moment somebody asks "did they get told?".
          */}
        {waiting.length > 0 && (
          <section className="mt-9">
            <h2 className="text-[1.15rem] font-extrabold">
              {a.interest.staffTitle} ({waiting.length})
            </h2>
            <p className="mt-1.5 text-[0.93rem] leading-relaxed text-ink-2">
              {a.interest.staffLede}
            </p>
            <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
              {waiting.map((w) => (
                <li key={w.user_id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
                  <span className="font-bold">{w.full_name}</span>
                  {w.member_number !== null && (
                    <span className="font-mono text-[0.86rem] text-ink-3" dir="ltr">
                      {formatMemberNumber(w.member_number)}
                    </span>
                  )}
                  <span
                    className={`ms-auto rounded-full px-2.5 py-0.5 text-[0.78rem] font-bold ${
                      w.notified_at
                        ? 'bg-ok/15 text-ok-text'
                        : 'bg-surface-2 text-ink-3'
                    }`}
                  >
                    {/* A tick as well as the colour. */}
                    {w.notified_at ? `✓ ${a.interest.staffNotified}` : a.interest.staffWaiting}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <h2 className="mt-9 text-[1.15rem] font-extrabold">
          {a.roster} ({people.length})
        </h2>

        {people.length === 0 ? (
          <p className="mt-3 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {a.mineNone}
          </p>
        ) : activity.cancelled_at ? (
          // A cancelled activity keeps its record and gains no more.
          <p className="mt-3 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {att.errors.cancelled}
          </p>
        ) : (
          <div className="mt-4">
            <AttendanceSheet
              lang={lang}
              activityId={id}
              people={people}
              scheduledMinutes={scheduled}
              t={a}
              att={att}
            />
          </div>
        )}

        {/* What the register adds up to, once any of it has been recorded. */}
        {attended.length + absent.length > 0 && (
          <section className="mt-10 rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-[1.05rem] font-extrabold">{a.summaryTitle}</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-3 text-[0.95rem] sm:grid-cols-2 lg:grid-cols-3">
              <Fact label={att.registered} value={String(people.length)} />
              <Fact label={att.attendedCount} value={String(attended.length)} />
              <Fact label={att.absentCount} value={String(absent.length)} />
              <Fact label={att.unsetCount} value={String(undecided.length)} />
              <Fact label={att.rate} value={`${rate}%`} />
              <Fact label={att.totalHours} value={formatDuration(earnedMinutes, lang)} />
            </dl>
            <a
              href={`/api/export/attendance?activity=${id}&lang=${lang}`}
              className="mt-5 inline-flex min-h-11 items-center rounded-full border border-line px-5 text-[0.92rem] font-bold hover:bg-surface-2"
            >
              {att.exportCsv}
            </a>
          </section>
        )}

        <Link
          href={`/${lang}/staff/activities`}
          className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {a.manageTitle}
        </Link>
      </Container>
    </Section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-bold text-ink-2">{label}</dt>
      <dd className="text-[1.1rem] font-extrabold">{value}</dd>
    </div>
  );
}
