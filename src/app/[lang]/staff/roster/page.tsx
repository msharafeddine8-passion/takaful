import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Container, Section } from '@/components/ui';
import { can } from '@/lib/authz';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { pendingClaims, formatMemberNumber } from '@/lib/roster';
import { approveClaimAction, rejectClaimAction } from '@/lib/actions/roster';

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/roster'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.account.staff.roster.title, robots: { index: false, follow: false } };
}

export default async function StaffRosterPage(props: PageProps<'/[lang]/staff/roster'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.staff.roster;

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
            {dict.account.staff.forbidden}
          </p>
        </Container>
      </Section>
    );
  }

  const claims = await pendingClaims();

  return (
    <Section>
      <Container>
        <h1 className="text-[clamp(1.6rem,1.3rem+1.4vw,2.2rem)] font-black tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        {claims.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-line bg-surface p-6 text-[1rem] text-ink-2">
            {t.empty}
          </p>
        ) : (
          <ul className="mt-8 space-y-4">
            {claims.map((c) => (
              <li key={c.id} className="rounded-2xl border border-line bg-surface p-6">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-[0.85rem] font-extrabold text-brand-blue dark:text-sky-300">
                    {formatMemberNumber(c.member_number)}
                  </span>
                  <span className="text-[1.15rem] font-extrabold">{c.full_name}</span>
                  {c.joined_on ? (
                    <span className="text-[0.9rem] font-bold text-ink-2">
                      {t.volunteerSince.replace('{date}', c.joined_on)}
                    </span>
                  ) : null}
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-2 text-[0.95rem] sm:grid-cols-2">
                  <div>
                    <dt className="font-bold text-ink-2">{t.accountName}</dt>
                    <dd>{c.account_name}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-ink-2">{t.accountEmail}</dt>
                    <dd className="break-all">{c.account_email}</dd>
                  </div>
                  {c.committee ? (
                    <div>
                      <dt className="font-bold text-ink-2">{t.committee}</dt>
                      <dd>{c.committee}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="font-bold text-ink-2">{t.claimedAt}</dt>
                    <dd>{c.claimed_at}</dd>
                  </div>
                </dl>

                {/* Said out loud rather than buried: the reviewer is the only
                    check that the person claiming is the person listed. */}
                {!c.name_agrees ? (
                  <p className="mt-4 rounded-xl border-2 border-warn bg-warn/10 p-4 text-[0.95rem] font-bold">
                    {t.nameMismatch}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap items-start gap-3">
                  <form action={approveClaimAction}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="rosterId" value={c.id} />
                    <button
                      type="submit"
                      className="rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
                    >
                      {t.approve}
                    </button>
                  </form>

                  {/* A rejection needs a reason, because the claimant is shown
                      it and "no" without a why is not an answer. */}
                  <form action={rejectClaimAction} className="flex flex-wrap items-start gap-2">
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="rosterId" value={c.id} />
                    <input
                      name="reason"
                      required
                      placeholder={t.rejectReason}
                      className="min-h-11 w-64 rounded-xl border border-line bg-ground px-4 text-[0.95rem]"
                    />
                    <button
                      type="submit"
                      className="min-h-11 rounded-full border border-line px-5 text-[0.95rem] font-bold hover:bg-surface-2"
                    >
                      {t.reject}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
