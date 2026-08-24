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
import { CardPrintButtons } from '@/components/account/CardPrintButtons';
import { formatMemberNumber } from '@/lib/roster';
import { LogoFull } from '@/components/Logo';
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
      full_name: string; member_number: number | null; joined_at: Date;
      card_token: string | null;
    }>(
      /*
       * `joined_on` first, `created_at` only as a fallback.
       *
       * The card said "member since 2026-08" to a volunteer carrying T133,
       * because it was reading when the *account* was made rather than when
       * the person joined the association. Those are the same date only for
       * somebody who signed up today. For the four hundred people recognised
       * from the roster — the ones the whole feature exists for — the account
       * is weeks old and the membership is years old, and printing the wrong
       * one on a membership card erases exactly the seniority the roster was
       * imported to preserve.
       *
       * The roster carries the real date. Where it does not, the account's
       * own creation is the honest answer rather than a blank.
       */
      `SELECT p.full_name, p.member_number, p.card_token,
              COALESCE(r.joined_on::timestamptz, u.created_at) AS joined_at
         FROM profiles p
         JOIN users u ON u.id = p.user_id
         LEFT JOIN volunteer_roster r
                ON r.claimed_by = p.user_id AND r.approved_at IS NOT NULL
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
  const since = monthOf(profile.joined_at) ?? '';
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
          body { background: #fff !important; }
          /*
           * The real thing, at the real size. Fixing the width in millimetres
           * rather than letting it fill the page is what makes a print
           * cuttable: 85.6mm wide, and the aspect-ratio on the element gives
           * the 54mm height without stating it twice.
           *
           * print-color-adjust because the header is a dark navy block with
           * white text on it, and browsers strip background colours from
           * printouts by default — which would leave white text on white
           * paper.
           */
          .member-card {
            width: 85.6mm !important;
            max-width: 85.6mm !important;
            box-shadow: none !important;
            break-inside: avoid;
            border: 0.2mm solid #94a3b8 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/*
        * The page size lives in its own style element because it is the one
        * rule that changes between the two buttons — a card-shaped page for a
        * PDF, an A4 sheet for a home printer — and `@page` cannot be switched
        * with a class. CardPrintButtons rewrites this and puts it back.
        */}
      <style id="card-page-rule">{'@media print { @page { size: A4; margin: 18mm; } }'}</style>

      <Section>
        <Container className="max-w-2xl">
          <Kicker>{dict.account.dashboard.kicker}</Kicker>
          <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
            {t.title}
          </h1>
          <p className="no-print mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

          {/*
            * An ID card, at the size of one.
            *
            * 85.6 × 54 mm is the ISO/IEC 7810 ID-1 format — a bank card, a
            * Lebanese ID, the thing already in the volunteer's wallet. Holding
            * that ratio is not decoration: a card that photographs and prints
            * at the size people expect reads as issued rather than as a web
            * page about a person. Everything inside is sized in `cqw`
            * (percentages of the card's own width) rather than rem, so the
            * whole thing scales as one object — on a phone, on a desktop, and
            * at exactly 85.6mm on paper — instead of the text reflowing out of
            * a fixed frame.
            */}
          <article
            className="member-card mt-8 w-full max-w-[30rem] overflow-hidden rounded-[4cqw] border border-line bg-surface text-ink shadow-sm"
            style={{ aspectRatio: '85.6 / 54', containerType: 'inline-size' }}
          >
            <div className="flex h-full flex-col">
              {/*
                * The logo whole, the way the association drew it.
                *
                * This was LogoMark beside the words «جمعية تكافل» set in
                * letter-spaced type — the symbol and the wordmark pulled apart
                * and reassembled in a different typeface. A logo is one thing;
                * taking it to pieces on the association's own membership card
                * is the one place that should never happen.
                *
                * It sits in a light chip because the full lockup's wordmark is
                * #205B8B, which on this navy is very nearly invisible. Putting
                * the real logo on a ground it was drawn for beats recolouring
                * it to survive the background.
                */}
              {/* A thin brand rule along the top edge, the way an issued card
                  carries a band. It gives the navy somewhere to live now that
                  the header is light. */}
              <div aria-hidden className="h-[1.2cqw] bg-gradient-to-l from-brand-orange to-brand-blue" />

              <div className="flex items-center gap-[3cqw] border-b border-line bg-surface-2 px-[4cqw] py-[2.5cqw]">
                {/* No white chip. The logo used to sit in one because the full
                    lockup's wordmark is #205B8B and vanishes on navy — but a
                    white rectangle pasted onto a dark header is a patch, not a
                    design. The header is light instead, so the logo sits on the
                    kind of ground it was drawn for and needs nothing around it. */}
                <LogoFull siteName={dict.meta.siteName} className="h-[12cqw] w-auto shrink-0" />

                <p className="min-w-0 truncate text-[2.6cqw] text-ink-3" dir="ltr">
                  {ORG.registrationNumber}
                </p>

                <span
                  className={`ms-auto shrink-0 rounded-full px-[2.5cqw] py-[1cqw] text-[2.6cqw] font-extrabold ${
                    status === 'active'
                      ? 'bg-ok text-[#04240f]'
                      : 'bg-surface text-ink-2 ring-1 ring-line'
                  }`}
                >
                  {status === 'active' ? t.statusActive : t.statusInactive}
                </span>
              </div>

              <div className="flex flex-1 items-stretch gap-[4cqw] px-[5cqw] py-[3.5cqw]">
                {/*
                  * Width first, height from the ratio.
                  *
                  * This was `aspect-[3/4] h-full`, which reads as reasonable
                  * and destroyed the card. `h-full` inside an `items-stretch`
                  * row has no resolved height to measure against, so the box
                  * fell back to the photograph's intrinsic size — and
                  * `shrink-0` then refused to give any of it back. The
                  * portrait filled the entire card and pushed the name, the
                  * membership number, the hours and the QR out of the frame.
                  * A membership card showing nothing but a face.
                  *
                  * Sizing from the card's own width instead, on the same cqw
                  * basis as everything else, the height follows from the 3:4
                  * ratio and cannot run away.
                  */}
                <div className="aspect-[3/4] w-[19cqw] shrink-0 self-center overflow-hidden rounded-[2cqw] border border-line bg-surface-2">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/photo/${user.id}?v=${photo.version}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      className="flex h-full w-full items-center justify-center text-[8cqw] text-ink-3"
                      aria-hidden
                    >
                      🙂
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-[5cqw] font-extrabold leading-tight">
                    {profile.full_name}
                  </p>
                  {/* The number is the card's real subject, so it is the
                      largest thing after the name and set in tabular figures
                      that stay Latin under html[lang="ar"]. */}
                  <p
                    className="mt-[0.5cqw] font-mono text-[6cqw] font-black leading-none tracking-[0.08em] text-brand-blue"
                    dir="ltr"
                  >
                    {formatMemberNumber(profile.member_number)}
                  </p>

                  <dl className="mt-auto grid grid-cols-2 gap-x-[3cqw] gap-y-[0.8cqw] text-[2.8cqw]">
                    <Field label={t.memberSince} value={since} ltr />
                    <Field label={t.hoursLabel} value={formatDuration(minutes, lang)} />
                    {stage && (
                      <div className="col-span-2 min-w-0">
                        <dt className="font-bold text-ink-3">{t.stage}</dt>
                        <dd className="truncate font-bold">
                          {lang === 'ar' ? stage.titleAr : stage.titleEn}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {qr && (
                  <div className="flex shrink-0 flex-col items-center justify-end">
                    <div
                      className="aspect-square w-[17cqw] [&>svg]:h-full [&>svg]:w-full"
                      aria-hidden
                      dangerouslySetInnerHTML={{ __html: qr }}
                    />
                    <p className="mt-[1cqw] text-[2.3cqw] text-ink-3">{t.scanHint}</p>
                  </div>
                )}
              </div>
            </div>
          </article>

          <p className="no-print mt-4 max-w-[30rem] text-[0.85rem] leading-relaxed text-ink-3">
            {t.validNote}
          </p>

          <div className="no-print mt-8 flex flex-wrap gap-3">
            {/* Two, because they want different paper: a PDF whose page IS the
                card, and an A4 sheet to cut one out of. */}
            <CardPrintButtons pdfLabel={t.savePdf} sheetLabel={t.print} />
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

/** One labelled fact on the card. Sized by the card, like everything else. */
function Field({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="truncate font-bold text-ink-3">{label}</dt>
      <dd className="truncate font-bold" dir={ltr ? 'ltr' : undefined}>{value}</dd>
    </div>
  );
}
