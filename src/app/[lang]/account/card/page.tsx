import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import QRCode from 'qrcode';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured, queryOne } from '@/lib/db';
import { journeyFor } from '@/lib/journey';
import { ORG } from '@/lib/org';
import { SITE_URL } from '@/lib/seo';
import { PrintButton } from '@/components/PrintButton';
import { formatMemberNumber } from '@/lib/roster';
import { verifiedMinutes, formatDuration } from '@/lib/hours';
import { cardStatusOf, monthOf } from '@/lib/card-view';

export async function generateMetadata(props: PageProps<'/[lang]/account/card'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.card.title,
    alternates: alternatesFor(lang, '/account/card'),
    robots: { index: false, follow: false },
  };
}

export default async function MembershipCardPage(props: PageProps<'/[lang]/account/card'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.card;

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

  const [profile, photo, journey, minutes] = await Promise.all([
    queryOne<{
      full_name: string; member_number: number | null; created_at: Date;
      card_token: string | null;
    }>(
      `SELECT p.full_name, p.member_number, p.card_token, u.created_at
         FROM profiles p JOIN users u ON u.id = p.user_id
        WHERE p.user_id = $1`,
      [user.id],
    ),
    queryOne<{ version: string }>('SELECT version FROM profile_photos WHERE user_id = $1', [user.id]),
    journeyFor(user.id),
    verifiedMinutes(user.id),
  ]);

  // A card identifies a member. A learner is welcome here but is not one, and
  // being told that plainly is better than being handed a card that says
  // nothing.
  if (!profile?.member_number) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <Kicker>{dict.account.dashboard.kicker}</Kicker>
          <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
            {t.title}
          </h1>
          <p className="mt-4 rounded-2xl border border-line bg-surface p-6 text-[1.02rem] leading-relaxed text-ink-2">
            {t.notMember}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/${lang}/account/apply`}
              className="rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
            >
              {t.notMemberCta}
            </Link>
            <Link
              href={`/${lang}/academy`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold hover:bg-surface-2"
            >
              {dict.nav.academy}
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

  /*
   * The QR used to carry `?member=NNNN`. Membership numbers run in sequence,
   * so that made every card a key to every other one — see migration 026. It
   * carries the card's own token now, which means nothing and cannot be
   * counted to. A card with no token yet simply shows no QR rather than
   * falling back to the number.
   */
  const verifyUrl = profile.card_token
    ? `${SITE_URL}/${lang}/verify/card/${profile.card_token}`
    : null;
  const qr = verifyUrl
    ? await QRCode.toString(verifyUrl, {
        type: 'svg',
        margin: 0,
        // H, not M: this is printed small and read off a phone screen at an
        // angle, often creased. The extra redundancy costs nothing here.
        errorCorrectionLevel: 'H',
        color: { dark: '#0d2b45', light: '#0000' },
      })
    : null;

  const stage = journey?.currentStage ?? null;
  const since = monthOf(profile.created_at) ?? '';
  const status = cardStatusOf({
    accountStatus: user.status,
    membershipStatus: user.membershipStatus,
    hasMemberNumber: true,
  });

  return (
    <>
      <style>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          @page { size: A4; margin: 20mm; }
          body { background: #fff !important; }
          .member-card { box-shadow: none !important; break-inside: avoid; }
        }
      `}</style>

      <Section>
        <Container className="max-w-2xl">
          <Kicker>{dict.account.dashboard.kicker}</Kicker>
          <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
            {t.title}
          </h1>
          <p className="no-print mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

          {/* Proportioned like a real card, so it prints and photographs as one. */}
          <article className="member-card mt-8 overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="bg-brand-blue-deep px-7 py-5 text-white">
              <p className="text-[0.82rem] font-extrabold tracking-[0.2em] text-[#9dbbd2]">
                {dict.meta.siteName}
              </p>
              <p className="mt-0.5 text-[0.82rem] text-[#9dbbd2]">
                {dict.account.certificate.registration} {ORG.registrationNumber}
              </p>
            </div>

            <div className="flex flex-wrap items-start gap-6 p-7">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/photo/${user.id}?v=${photo.version}`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[1.8rem] text-ink-3" aria-hidden>
                    🙂
                  </span>
                )}
              </div>

              <div className="min-w-[12rem] flex-1">
                <p className="text-[1.3rem] font-extrabold leading-tight">{profile.full_name}</p>

                <dl className="mt-3 space-y-1 text-[0.88rem]">
                  <div className="flex gap-2">
                    <dt className="font-bold text-ink-3">{t.memberNumber}:</dt>
                    {/* T014, the way the association writes it and the way it
                        appears everywhere else. This printed a bare "14". */}
                    <dd className="font-mono font-bold tracking-wider" dir="ltr">
                      {formatMemberNumber(profile.member_number)}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-bold text-ink-3">{t.hoursLabel}:</dt>
                    <dd>{formatDuration(minutes, lang)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-bold text-ink-3">{t.statusLabel}:</dt>
                    <dd className="font-bold">
                      <span aria-hidden className="me-1">{status === 'active' ? '●' : '○'}</span>
                      {status === 'active' ? t.statusActive : t.statusInactive}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-bold text-ink-3">{t.memberSince}:</dt>
                    <dd dir="ltr">{since}</dd>
                  </div>
                  {stage && (
                    <div className="flex gap-2">
                      <dt className="font-bold text-ink-3">{t.stage}:</dt>
                      <dd>
                        {stage.number} — {lang === 'ar' ? stage.titleAr : stage.titleEn}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {qr && (
                <div className="shrink-0 text-center">
                  <div
                    className="h-20 w-20 [&>svg]:h-full [&>svg]:w-full"
                    aria-hidden
                    dangerouslySetInnerHTML={{ __html: qr }}
                  />
                  <p className="mt-1.5 text-[0.82rem] text-ink-3">{t.scanHint}</p>
                </div>
              )}
            </div>

            <p className="border-t border-line px-7 py-3 text-[0.82rem] text-ink-3">
              {t.validNote}
            </p>
          </article>

          <div className="no-print mt-8 flex flex-wrap gap-3">
            <PrintButton label={t.print} />
            <Link
              href={`/${lang}/account/profile`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold hover:bg-surface-2"
            >
              {dict.account.profile.title}
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
