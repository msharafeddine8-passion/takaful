import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import { awaitingVerification, formatDuration } from '@/lib/hours';
import { verifyHoursAction } from '@/lib/actions/hours';

export async function generateMetadata(props: PageProps<'/[lang]/staff/hours'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.staff.hoursTitle,
    alternates: alternatesFor(lang, '/staff/hours'),
    robots: { index: false, follow: false },
  };
}

export default async function StaffHoursPage(props: PageProps<'/[lang]/staff/hours'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.staff;

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

  if (!can(user, 'hours.verify')) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.forbidden}
          </p>
        </Container>
      </Section>
    );
  }

  const queue = await awaitingVerification();

  // Nobody verifies their own hours. The database refuses it and the action
  // refuses it; hiding them here means a reviewer never sees a button that
  // would only fail.
  const reviewable = queue.filter((e) => e.user_id !== user.id);

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.hoursTitle}
        </h1>
        <p className="mt-3 max-w-[60ch] text-[1.02rem] leading-relaxed text-ink-2">{t.hoursLede}</p>

        {reviewable.length === 0 ? (
          <p className="mt-8 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.queueEmpty}
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {reviewable.map((e) => (
              <article key={e.id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-[1.05rem] font-extrabold">{e.full_name}</h2>
                  <p className="text-[0.85rem] text-ink-3" dir="ltr">
                    {new Date(e.worked_on).toISOString().slice(0, 10)}
                  </p>
                </div>

                <p className="mt-2 text-[1.2rem] font-extrabold text-brand-blue dark:text-brand-orange">
                  {formatDuration(e.minutes, lang)}
                </p>

                <p className="mt-1 text-[0.94rem] text-ink-2">
                  {(lang === 'ar' ? e.activity_title_ar : e.activity_title_en) ?? t.none}
                </p>

                {e.note && (
                  <p className="mt-2 whitespace-pre-line text-[0.94rem] leading-relaxed text-ink-2">
                    {e.note}
                  </p>
                )}

                <form action={verifyHoursAction} className="mt-4 border-t border-line pt-4">
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="entryId" value={e.id} />

                  <label htmlFor={`reason-${e.id}`} className="mb-1.5 block text-[0.88rem] font-bold">
                    {t.reasonLabel}
                  </label>
                  {/* Required only for a rejection. The action refuses a
                      rejection without one, so an accidental empty reject
                      changes nothing rather than silently going through. */}
                  <textarea
                    id={`reason-${e.id}`}
                    name="reason"
                    rows={2}
                    className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-[0.94rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
                  />

                  <div className="mt-3 flex flex-wrap gap-2.5">
                    <button
                      type="submit"
                      name="decision"
                      value="verify"
                      className="rounded-full bg-emerald-600 px-5 py-2.5 text-[0.92rem] font-extrabold text-white transition-colors hover:bg-emerald-700"
                    >
                      {t.verify}
                    </button>
                    <button
                      type="submit"
                      name="decision"
                      value="reject"
                      className="rounded-full bg-red-600 px-5 py-2.5 text-[0.92rem] font-extrabold text-white transition-colors hover:bg-red-700"
                    >
                      {t.rejectHours}
                    </button>
                  </div>
                </form>
              </article>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
