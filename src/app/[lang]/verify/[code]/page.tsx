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
import { ShareCredential } from '@/components/ShareCredential';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * A certificate someone can actually hand to an employer.
 *
 * Print rather than a generated PDF: every browser prints to PDF, it works on
 * a phone, it needs no rendering service, and the page stays readable and
 * selectable rather than becoming an image of text. The print rules below
 * strip the page furniture so what comes out is the certificate.
 */
export default async function CertificatePage(props: PageProps<'/[lang]/verify/[code]'>) {
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

  /*
   * The QR encodes this page, not a form with the code in a query string.
   *
   * Someone scanning a printed certificate should land on the credential
   * itself rather than on a lookup box they have to use. It also keeps the
   * code out of a query parameter, which is where URLs get logged, forwarded
   * and expanded into chat previews.
   */
  const verifyUrl = `${SITE_URL}/${lang}/verify/${certificate.code}`;
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

  const KIND_LABEL: Record<string, string> = {
    orientation: t.kindOrientation,
    course: t.kindCourse,
    level: t.kindLevel,
    program: t.kindProgram,
    hours: t.kindHours,
  };
  const kindLabel = KIND_LABEL[certificate.kind] ?? t.kindCourse;

  const skills =
    (lang === 'ar' ? certificate.snapshot.skillsAr : certificate.snapshot.skillsEn) ?? [];
  const learningMinutes = certificate.learning_minutes ?? certificate.snapshot.learningMinutes ?? 0;

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
            <p className="mt-1.5 text-[0.82rem] text-ink-3">
              {t.registration} {ORG.registrationNumber}
            </p>

            <p className="mt-10 text-[0.95rem] text-ink-2">{t.awardedTo}</p>
            {/* The name is read from the snapshot, never live: an already
                issued certificate must not change when a profile is edited. */}
            <p className="mt-2.5 text-[clamp(1.6rem,1.2rem+2vw,2.6rem)] font-extrabold tracking-tight">
              {certificate.snapshot.fullName}
            </p>

            <div className="mx-auto mt-8 h-px w-24 bg-line" />

            <p className="text-[0.85rem] font-bold tracking-[0.14em] text-ink-3">{kindLabel}</p>
            <p className="mt-2 text-[clamp(1.05rem,0.95rem+0.7vw,1.4rem)] font-bold leading-relaxed text-ink">
              {title}
            </p>

            {/* Read from the snapshot, like everything else on this document:
                the course's outcomes may be reworded next year and this
                certificate must keep claiming what it claimed. */}
            {skills.length > 0 && (
              <div className="mx-auto mt-8 max-w-xl text-start">
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
              {learningMinutes > 0 && (
                <div>
                  <dt className="font-bold tracking-[0.1em] text-ink-3">{t.learningTime}</dt>
                  <dd className="mt-1 font-bold" dir="ltr">
                    {Math.round((learningMinutes / 60) * 10) / 10}
                  </dd>
                </div>
              )}
              <div>
                <dt className="font-bold tracking-[0.1em] text-ink-3">{t.scanToVerify}</dt>
                <dd
                  className="mt-2 inline-block h-24 w-24 [&>svg]:h-full [&>svg]:w-full"
                  aria-hidden
                  dangerouslySetInnerHTML={{ __html: qr }}
                />
              </div>
            </dl>

            {/* The claim, stated on the document itself so nobody has to infer
                it. This association holds no accreditation, and a certificate
                that implied otherwise would put the volunteer in the position
                of defending it. */}
            <p className="mt-8 text-[0.86rem] font-bold text-ink-2">{t.completionOnly}</p>

            <p className="mt-3 text-[0.82rem] text-ink-3" dir="ltr">
              {t.verifyAt}: {verifyUrl}
            </p>
          </article>

          <div className="no-print mt-8 flex flex-wrap gap-3">
            <PrintButton label={t.print} />
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
          {!certificate.revoked_at && (
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

