import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import QRCode from 'qrcode';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Container, Section } from '@/components/ui';
import { isDbConfigured } from '@/lib/db';
import { findByCode, normaliseCode } from '@/lib/certificates';
import { ORG } from '@/lib/org';
import { SITE_URL } from '@/lib/seo';
import { PrintButton } from '@/components/PrintButton';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * A certificate someone can actually hand to an employer.
 *
 * Print rather than a generated PDF: every browser prints to PDF, it works on
 * a phone, it needs no rendering service, and the page stays readable and
 * selectable rather than becoming an image of text. The print rules below
 * strip the page furniture so what comes out is the certificate.
 */
export default async function CertificatePage(props: PageProps<'/[lang]/certificates/[code]'>) {
  await connection();
  const { lang, code } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.certificate;

  if (!isDbConfigured()) notFound();

  const certificate = await findByCode(decodeURIComponent(code));
  if (!certificate) {
    return (
      <Section>
        <Container className="max-w-xl">
          <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.notFound}
          </p>
          <p className="mt-3 font-mono text-[0.9rem] text-ink-3" dir="ltr">
            {normaliseCode(decodeURIComponent(code))}
          </p>
        </Container>
      </Section>
    );
  }

  const verifyUrl = `${SITE_URL}/${lang}/verify?code=${certificate.code}`;
  // Generated server-side into an inline SVG: no external request, so it
  // prints even offline and cannot leak a page view to a third party.
  const qr = await QRCode.toString(verifyUrl, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#205B8B', light: '#0000' },
  });

  const title = lang === 'ar' ? certificate.snapshot.titleAr : certificate.snapshot.titleEn;
  const issued = new Date(certificate.issued_at).toISOString().slice(0, 10);

  return (
    <>
      {/* Scoped to this page so the rest of the site keeps its own print behaviour. */}
      <style>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 12mm; }
          body { background: #fff !important; }
          .certificate {
            border-color: #205B8B !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
        }
      `}</style>

      <Section>
        <Container className="max-w-3xl">
          {certificate.revoked_at && (
            <p className="mb-6 rounded-xl border border-red-400 bg-red-50 px-5 py-4 font-bold text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {t.revokedBanner}
            </p>
          )}

          <article className="certificate rounded-3xl border-4 border-brand-blue bg-surface p-10 text-center sm:p-14">
            <p className="text-[0.8rem] font-extrabold tracking-[0.2em] text-brand-orange-text dark:text-brand-orange">
              {dict.meta.siteName}
            </p>
            <p className="mt-1.5 text-[0.75rem] text-ink-3">
              {t.registration} {ORG.registrationNumber}
            </p>

            <p className="mt-10 text-[0.95rem] text-ink-2">{t.awardedTo}</p>
            {/* The name is read from the snapshot, never live: an already
                issued certificate must not change when a profile is edited. */}
            <p className="mt-2.5 text-[clamp(1.6rem,1.2rem+2vw,2.6rem)] font-extrabold tracking-tight">
              {certificate.snapshot.fullName}
            </p>

            <div className="mx-auto mt-8 h-px w-24 bg-line" />

            <p className="mt-8 text-[clamp(1.05rem,0.95rem+0.7vw,1.4rem)] font-bold leading-relaxed text-ink">
              {title}
            </p>

            <dl className="mt-10 flex flex-wrap items-start justify-center gap-x-12 gap-y-6 text-[0.9rem]">
              <div>
                <dt className="font-bold tracking-[0.1em] text-ink-3">{t.issuedOn}</dt>
                <dd className="mt-1 font-mono" dir="ltr">{issued}</dd>
              </div>
              <div>
                <dt className="font-bold tracking-[0.1em] text-ink-3">{t.codeLabel}</dt>
                <dd className="mt-1 font-mono font-bold tracking-wider" dir="ltr">
                  {certificate.code}
                </dd>
              </div>
              <div>
                <dt className="font-bold tracking-[0.1em] text-ink-3">{t.scanToVerify}</dt>
                <dd
                  className="mt-2 inline-block h-24 w-24 [&>svg]:h-full [&>svg]:w-full"
                  aria-hidden
                  dangerouslySetInnerHTML={{ __html: qr }}
                />
              </div>
            </dl>

            <p className="mt-8 text-[0.78rem] text-ink-3" dir="ltr">
              {t.verifyAt}: {verifyUrl}
            </p>
          </article>

          <div className="no-print mt-8 flex flex-wrap gap-3">
            <PrintButton label={t.print} />
            <Link
              href={`/${lang}/verify?code=${certificate.code}`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold hover:bg-surface-2"
            >
              {dict.account.verify.check}
            </Link>
            <Link
              href={`/${lang}/account/certificates`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold hover:bg-surface-2"
            >
              {t.myCertificates}
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}

