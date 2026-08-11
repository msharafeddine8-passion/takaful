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
import { roster, scheduledMinutes } from '@/lib/activities';
import { formatDuration } from '@/lib/hours';
import { confirmAttendanceAction } from '@/lib/actions/activities';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ActivityRosterPage(props: PageProps<'/[lang]/staff/activities/[id]'>) {
  await connection();
  const { lang, id } = await props.params;
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
  }>(
    'SELECT title_ar, title_en, location, starts_at, ends_at FROM activities WHERE id = $1',
    [id],
  );
  if (!activity) notFound();

  const [people, settings] = await Promise.all([
    roster(id),
    queryOne<{ second: boolean }>(
      'SELECT hours_require_second_check AS second FROM org_settings LIMIT 1',
    ),
  ]);

  // Pre-filled from the activity's own schedule: the supervisor confirms a
  // number rather than computing one, and corrects it when someone left early.
  const defaultMinutes = scheduledMinutes(activity) ?? 60;

  return (
    <Section>
      <Container className="max-w-3xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.5rem,1.25rem+1.3vw,2.1rem)] font-extrabold tracking-tight">
          {lang === 'ar' ? activity.title_ar : activity.title_en}
        </h1>
        <p className="mt-2 text-[0.95rem] text-ink-2" dir="ltr">
          {activity.starts_at &&
            new Date(activity.starts_at).toISOString().slice(0, 16).replace('T', ' ')}
          {activity.location ? ` · ${activity.location}` : ''}
        </p>

        {/* Say what confirming will do, before they confirm. */}
        {settings?.second && (
          <p className="mt-5 rounded-xl border border-amber-400 bg-amber-50 px-5 py-3.5 text-[0.93rem] text-ink-2 dark:border-amber-800 dark:bg-amber-950/30">
            {a.secondCheckOn}
          </p>
        )}

        <h2 className="mt-9 text-[0.8rem] font-bold tracking-[0.12em] text-ink-3">
          {a.roster} ({people.length})
        </h2>

        {people.length === 0 ? (
          <p className="mt-3 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {a.mineNone}
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {people.map((p) => (
              <li key={p.user_id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="text-[1.02rem] font-bold">{p.full_name}</span>
                  {p.registration_status === 'waitlisted' && (
                    <span className="text-[0.85rem] text-ink-3">{a.waitlist}</span>
                  )}
                </div>

                {p.attended === null ? (
                  <form action={confirmAttendanceAction} className="mt-3 flex flex-wrap items-end gap-3">
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="activityId" value={id} />
                    <input type="hidden" name="userId" value={p.user_id} />

                    <label className="block">
                      <span className="mb-1.5 block text-[0.85rem] font-bold">{a.minutesField}</span>
                      <input
                        name="minutes"
                        type="number"
                        min="1"
                        max="1440"
                        defaultValue={defaultMinutes}
                        dir="ltr"
                        className="w-28 rounded-xl border border-line bg-surface px-3 py-2 text-[0.95rem] outline-none focus:border-brand-blue"
                      />
                    </label>

                    <button
                      type="submit"
                      name="attended"
                      value="yes"
                      className="rounded-full bg-emerald-600 px-5 py-2.5 text-[0.9rem] font-extrabold text-white hover:bg-emerald-700"
                    >
                      {a.markAttended}
                    </button>
                    <button
                      type="submit"
                      name="attended"
                      value="no"
                      className="rounded-full border border-line px-5 py-2.5 text-[0.9rem] font-bold hover:bg-surface-2"
                    >
                      {a.markNoShow}
                    </button>
                  </form>
                ) : (
                  <p className="mt-2.5 text-[0.93rem] font-bold">
                    {p.attended ? (
                      <span className="text-emerald-700 dark:text-emerald-400">
                        ✅ {a.attended}
                        {p.attended_minutes
                          ? ` — ${formatDuration(p.attended_minutes, lang)}`
                          : ''}
                      </span>
                    ) : (
                      <span className="text-ink-3">{a.noShow}</span>
                    )}
                    <span className="ms-2 text-[0.82rem] font-normal text-ink-3">
                      ({a.alreadyRecorded})
                    </span>
                  </p>
                )}
              </li>
            ))}
          </ul>
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
