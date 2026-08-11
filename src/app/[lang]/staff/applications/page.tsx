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
import { queuedApplications } from '@/lib/applications';
import { claimApplicationAction, decideApplicationAction } from '@/lib/actions/applications';

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/applications'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.staff.applicationsTitle,
    alternates: alternatesFor(lang, '/staff/applications'),
    robots: { index: false, follow: false },
  };
}

export default async function StaffApplicationsPage(
  props: PageProps<'/[lang]/staff/applications'>,
) {
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

  // Every administrative page asks authz, never a role comparison of its own.
  if (!can(user, 'applications.review')) {
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

  const applications = await queuedApplications();

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.applicationsTitle}
        </h1>
        <p className="mt-3 max-w-[60ch] text-[1.02rem] leading-relaxed text-ink-2">
          {t.applicationsLede}
        </p>

        {applications.length === 0 ? (
          <p className="mt-8 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.queueEmpty}
          </p>
        ) : (
          <div className="mt-8 space-y-5">
            {applications.map((a) => (
              <article key={a.id} className="rounded-2xl border border-line bg-surface p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-[1.15rem] font-extrabold">{a.full_name}</h2>
                  <p className="text-[0.85rem] text-ink-3" dir="ltr">
                    {a.submitted_at ? new Date(a.submitted_at).toISOString().slice(0, 10) : '—'}
                  </p>
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-2 text-[0.94rem] sm:grid-cols-2">
                  <Row label={t.age} value={a.age !== null ? String(a.age) : t.none} />
                  <Row label={t.city} value={a.city ?? t.none} />
                  <Row label={t.availability} value={a.availability ?? t.none} />
                  <Row label={t.interests} value={a.interests ?? t.none} />
                </dl>

                {/* A minor's application cannot be judged without seeing that a
                    guardian consented, so it sits beside the rest, not buried. */}
                {a.guardian_name && (
                  <p className="mt-4 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.92rem]">
                    <span className="font-bold">{t.guardian}:</span> {a.guardian_name}
                    {a.guardian_relation ? ` — ${a.guardian_relation}` : ''}
                  </p>
                )}

                {a.motivation && (
                  <div className="mt-4">
                    <p className="text-[0.8rem] font-bold tracking-[0.1em] text-ink-3">
                      {t.motivation}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-[0.96rem] leading-relaxed text-ink-2">
                      {a.motivation}
                    </p>
                  </div>
                )}

                {a.experience && (
                  <div className="mt-4">
                    <p className="text-[0.8rem] font-bold tracking-[0.1em] text-ink-3">
                      {t.experience}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-[0.96rem] leading-relaxed text-ink-2">
                      {a.experience}
                    </p>
                  </div>
                )}

                {a.status === 'submitted' ? (
                  <form action={claimApplicationAction} className="mt-5">
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="applicationId" value={a.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-line px-5 py-2.5 text-[0.92rem] font-bold text-ink-2 transition-colors hover:bg-surface-2"
                    >
                      {t.claim}
                    </button>
                  </form>
                ) : (
                  <p className="mt-5 text-[0.85rem] font-bold text-brand-blue dark:text-brand-orange">
                    {t.open}
                  </p>
                )}

                {/* Every decision carries a reason. The field is required in
                    the markup and again in the action, because this is the
                    part someone will ask about years from now. */}
                <form action={decideApplicationAction} className="mt-4 border-t border-line pt-4">
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="applicationId" value={a.id} />

                  <label
                    htmlFor={`reason-${a.id}`}
                    className="mb-1.5 block text-[0.9rem] font-bold"
                  >
                    {t.reasonLabel}
                  </label>
                  <p className="mb-2 text-[0.83rem] text-ink-2">{t.reasonHint}</p>
                  <textarea
                    id={`reason-${a.id}`}
                    name="reason"
                    rows={2}
                    required
                    className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-[0.96rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
                  />

                  <div className="mt-3 flex flex-wrap gap-2.5">
                    <Decision value="accepted" label={t.accept} tone="accept" />
                    <Decision value="waitlisted" label={t.waitlist} tone="waitlist" />
                    <Decision value="rejected" label={t.reject} tone="reject" />
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="font-bold text-ink-3">{label}:</dt>
      <dd className="text-ink-2">{value}</dd>
    </div>
  );
}

function Decision({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: 'accept' | 'waitlist' | 'reject';
}) {
  const styles = {
    accept: 'bg-emerald-600 text-white hover:bg-emerald-700',
    waitlist: 'border border-line text-ink hover:bg-surface-2',
    reject: 'bg-red-600 text-white hover:bg-red-700',
  }[tone];

  return (
    <button
      type="submit"
      name="decision"
      value={value}
      className={`rounded-full px-5 py-2.5 text-[0.92rem] font-extrabold transition-colors ${styles}`}
    >
      {label}
    </button>
  );
}
