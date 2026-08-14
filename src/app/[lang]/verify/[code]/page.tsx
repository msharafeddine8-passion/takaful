import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import QRCode from 'qrcode';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Container, Section } from '@/components/ui';
import { isDbConfigured } from '@/lib/db';
import { findByCode, normaliseCode } from '@/lib/certificates';
import { credentialView } from '@/lib/credential-view';
import { formatDate, formatDuration } from '@/lib/format';
import { SITE_URL } from '@/lib/seo';
import { PrintButton } from '@/components/PrintButton';
import { ShareCredential } from '@/components/ShareCredential';
import {
  CertificateDocument,
  DOC,
  type CertificateDocumentData,
} from '@/components/CertificateDocument';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * A certificate someone can hand to an employer.
 *
 * The sheet itself is CertificateDocument; this page looks the row up,
 * freezes the strings, renders the QR and decides what a revoked credential
 * may still do.
 *
 * Print rather than a generated PDF: every browser prints to PDF, it works on
 * a phone, it needs no rendering service, and the text stays selectable
 * vector type rather than an image. The print rules pin the document to a
 * full A4 landscape sheet; `@page margin: 0` also suppresses the browser's
 * own header/footer (URL and date), which have no business on a certificate.
 * The sheet's safe margins are its own frame insets, well clear of any
 * printer's unprintable edge.
 */
export default async function CertificatePage(props: PageProps<'/[lang]/verify/[code]'>) {
  await connection();
  const { lang, code } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.certificate;
  // The document is bilingual by design — an official paper carries its
  // title in both scripts — so the page's language drives the main text and
  // the other language supplies the small subtitle.
  const other: Locale = lang === 'ar' ? 'en' : 'ar';
  const tOther = getDictionary(other).account.certificate;

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

  /*
   * The QR encodes this page, not a form with the code in a query string.
   * Someone scanning a printed certificate lands on the credential itself.
   * The URL carries no personal data — only the code. Generated server-side
   * into an inline SVG: vector at any print size, no external request, scans
   * offline. Only the host is printed on the sheet; the full URL stays in
   * the QR, because a long URL in small type is clutter and the host is what
   * a human would type.
   */
  const verifyUrl = `${SITE_URL}/${lang}/verify/${certificate.code}`;
  const verifyHost = new URL(SITE_URL).host;
  const qr = await QRCode.toString(verifyUrl, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: DOC.navy, light: '#0000' },
  });

  const title = lang === 'ar' ? certificate.snapshot.titleAr : certificate.snapshot.titleEn;

  /*
   * One source for the word "Revoked", its date, its reason and the decision
   * about what a withdrawn credential may still do.
   */
  const view = credentialView(certificate, dict.account.map, lang);

  const learningMinutes = certificate.learning_minutes ?? certificate.snapshot.learningMinutes ?? 0;
  const volunteerMinutes = certificate.kind === 'hours' ? (certificate.snapshot.minutes ?? 0) : 0;

  const kinds: CertificateDocumentData['kind'][] = [
    'course',
    'orientation',
    'level',
    'program',
    'hours',
  ];
  const data: CertificateDocumentData = {
    code: certificate.code,
    kind: kinds.includes(certificate.kind as CertificateDocumentData['kind'])
      ? (certificate.kind as CertificateDocumentData['kind'])
      : 'course',
    // From the snapshot, never live: an issued certificate must not change
    // when a profile is edited.
    fullName: certificate.snapshot.fullName,
    title,
    // «١٤ آب ٢٠٢٦», never an ISO string: the ISO form belongs to the
    // database, not to a document a person reads.
    issued: formatDate(certificate.issued_at, lang),
    learningTime: learningMinutes > 0 ? formatDuration(learningMinutes, lang) : '',
    volunteerTime: volunteerMinutes > 0 ? formatDuration(volunteerMinutes, lang) : '',
  };

  const skills =
    (lang === 'ar' ? certificate.snapshot.skillsAr : certificate.snapshot.skillsEn) ?? [];

  return (
    <>
      {/* Scoped to this page so the rest of the site keeps its own print
          behaviour. */}
      <style>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 0; }
          html, body { background: #fff !important; }
          .cert-section { padding: 0 !important; margin: 0 !important; }
          .cert-container { max-width: none !important; padding: 0 !important; margin: 0 !important; }
          .certificate {
            width: 297mm !important;
            height: 210mm !important;
            max-width: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            break-inside: avoid;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      <Section className="cert-section">
        <Container className="cert-container max-w-5xl">
          {view.status === 'revoked' && (
            /*
             * surfaceTone, not tone: border and tint only. The pill keeps its
             * own reading colour; the sentences below keep the ink they are
             * legible in.
             */
            <div className={`mb-6 rounded-xl border px-5 py-4 ${view.surfaceTone}`}>
              <p>
                <span
                  className={`inline-block rounded-full border px-3 py-1 text-[0.8rem] font-extrabold ${view.tone}`}
                >
                  {view.statusLabel}
                </span>
              </p>
              <p className="mt-2 font-bold">{t.revokedBanner}</p>
              {view.revokedOn && (
                <p className="mt-2 text-[0.92rem] text-ink-2">{view.revokedOn}</p>
              )}
              {view.reason && <p className="mt-1 text-[0.92rem] text-ink-2">{view.reason}</p>}
            </div>
          )}

          <CertificateDocument
            lang={lang}
            t={t}
            tOther={tOther}
            siteName={dict.meta.siteName}
            cert={data}
            qr={qr}
            verifyHost={verifyHost}
          />

          {/* Skills stay on the verify page — an employer opening the link
              should see them — but off the printed document, which lists only
              what an official certificate lists. Read from the snapshot, like
              everything else: the course's outcomes may be reworded next year
              and this certificate must keep claiming what it claimed. */}
          {skills.length > 0 && (
            <div className="no-print mt-8 rounded-2xl border border-line bg-surface p-6">
              <p className="text-[0.85rem] font-bold tracking-[0.12em] text-ink-3">{t.skills}</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {skills.map((skill, i) => (
                  <li
                    key={i}
                    className="relative ps-5 text-[0.92rem] leading-relaxed text-ink-2 before:absolute before:top-[0.62em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-brand-orange before:content-[''] before:start-0"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="no-print mt-8 flex flex-wrap gap-3">
            {/* Printing a withdrawn certificate is the one thing this page
                must not offer: the print stylesheet strips the page furniture,
                so what came out of the printer would be a clean certificate
                with no trace of the banner saying it no longer stands. */}
            {view.shareable && <PrintButton label={t.print} />}
            <Link
              href={`/${lang}/account/certificates`}
              className="inline-flex min-h-11 items-center rounded-full border border-line px-6 text-[0.95rem] font-bold hover:bg-surface-2"
            >
              {t.myCertificates}
            </Link>
          </div>

          {/* Only for a credential that still stands. Offering to share a
              revoked certificate would be helping somebody make a claim that
              is no longer true. */}
          {view.shareable && (
            <div className="no-print mt-4">
              <ShareCredential
                url={verifyUrl}
                text={`${t.shareText} — ${title}`}
                labels={{ share: t.share, copy: t.copyLink, copied: t.copied }}
              />
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
