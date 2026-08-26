import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Arrow, Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { certificatesFor, type CertificateKind } from '@/lib/certificates';
import { credentialView } from '@/lib/credential-view';
/* The certificate's own date formatter, deliberately the UTC one: this list
 * has to name the same day the printed sheet and the public verification page
 * name, and those both go through lib/format. */
import { formatDate } from '@/lib/format';
import { unissuedCourseCertificates, ensureCourseCertificate } from '@/lib/academy';
import { emptyStates } from '@/lib/dictionaries/empty-states';

export async function generateMetadata(props: PageProps<'/[lang]/account/certificates'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.certificate.myCertificates,
    alternates: alternatesFor(lang, '/account/certificates'),
    robots: { index: false, follow: false },
  };
}

export default async function MyCertificatesPage(props: PageProps<'/[lang]/account/certificates'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.certificate;
  const nothing = emptyStates(lang).certificates;

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

  /*
   * Issue anything that is owed but missing before listing.
   *
   * A certificate is normally minted the moment someone passes. If that write
   * fails — a dropped connection, a deploy mid-request — the pass is still in
   * the ledger, and nobody should have to retake a ninety-minute course to
   * get the paper for it. Almost always this finds nothing and costs one
   * indexed query.
   */
  for (const slug of await unissuedCourseCertificates(user.id)) {
    await ensureCourseCertificate(user.id, slug, user.fullName).catch(() => {});
  }

  const certificates = await certificatesFor(user.id);
  /* Said once, above the list, and only where it applies. A withdrawn
   * certificate keeping its row is deliberate and looks like a bug otherwise. */
  const anyRevoked = certificates.some((c) => c.revoked_at !== null);

  const kindLabel: Record<CertificateKind, string> = {
    course: t.kindCourse,
    orientation: t.kindOrientation,
    level: t.kindLevel,
    program: t.kindProgram,
    hours: t.kindHours,
  };

  return (
    <Section>
      <Container className="max-w-2xl">
        <Kicker>{dict.account.dashboard.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.myCertificates}
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.myCertificatesLede}</p>
        {anyRevoked && (
          <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{t.revokedKept}</p>
        )}

        {certificates.length === 0 ? (
          /*
           * «أنهِ دورة لتحصل على أولى شهاداتك» was an instruction; this says how
           * the association issues one and what it carries, which is the same
           * information without the imperative. Word for word the sentence the
           * printed record uses (passport.ts, certificatesEmpty) — a volunteer
           * meets both, and two accounts of how a certificate is earned would
           * make each of them look like a guess.
           *
           * The filled button is a plain link now. The academy is genuinely
           * open and worth pointing at; it is not worth shouting at somebody on
           * the day they signed up.
           */
          <div className="mt-8">
            <p className="max-w-[70ch] rounded-xl border border-line bg-surface-2 px-5 py-4 leading-relaxed text-ink-2">
              {nothing.never}
            </p>
            <Link
              href={`/${lang}/academy`}
              className="mt-4 inline-flex min-h-11 items-center font-bold text-brand-blue hover:underline dark:text-brand-orange"
            >
              {nothing.browse}
              <Arrow lang={lang} />
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {certificates.map((c) => {
              /*
               * The one place that decides what "revoked" looks like.
               *
               * This page used to answer it for itself — dim the row to 70% and
               * drop the link — which made four surfaces with four answers and
               * left this the only one that never showed the reason. See the
               * header of lib/credential-view.ts.
               */
              const view = credentialView(c, dict.account.map, lang);

              return (
                <li
                  key={c.id}
                  className="rounded-2xl border border-line bg-surface p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[0.78rem] font-extrabold text-ink-2">
                      {kindLabel[c.kind] ?? t.kindCourse}
                    </span>
                    {/* Words, never a tint alone — the row is no longer dimmed,
                        so this pill is the whole signal. */}
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[0.78rem] font-extrabold ${view.tone}`}
                    >
                      {view.statusLabel}
                    </span>
                  </div>

                  <p className="mt-2.5 text-[1.05rem] font-extrabold">
                    {lang === 'ar' ? c.snapshot.titleAr : c.snapshot.titleEn}
                  </p>
                  {/* A code is a Latin identifier inside Arabic prose: dir="ltr"
                      belongs here. The date below is localised text and must not
                      have it — see the note at the head of lib/format.ts. */}
                  <p className="mt-1.5 font-mono text-[0.9rem] tracking-wider text-ink-2" dir="ltr">
                    {c.code}
                  </p>
                  <p className="mt-1 text-[0.85rem] text-ink-3">
                    {t.issuedOn} {formatDate(c.issued_at, lang)}
                  </p>

                  {view.status === 'revoked' ? (
                    /*
                     * The row stays, and so does the reason. A certificate that
                     * quietly vanished would leave its holder unable even to ask
                     * what happened — and an employer who has the code will be
                     * shown the revocation whether this page mentions it or not.
                     *
                     * surfaceTone, not tone: border and tint only. A container
                     * that sets a text colour repaints every line inside it.
                     */
                    <div className={`mt-3 rounded-xl border px-4 py-3 ${view.surfaceTone}`}>
                      <p className="text-[0.92rem] font-bold">{t.revokedBanner}</p>
                      {view.revokedOn && (
                        <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-2">
                          {view.revokedOn}
                        </p>
                      )}
                      {view.reason && (
                        <p className="mt-1 text-[0.9rem] leading-relaxed text-ink-2">
                          {view.reason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={`/${lang}/verify/${c.code}`}
                      className="mt-3 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
                    >
                      {t.view} →
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <Link
          href={`/${lang}/account`}
          className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {t.backToAccount}
        </Link>
      </Container>
    </Section>
  );
}
