import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { isDbConfigured } from '@/lib/db';
import { findByCode, normaliseCode } from '@/lib/certificates';
import { credentialView } from '@/lib/credential-view';
import { formatDate } from '@/lib/format';

export async function generateMetadata(props: PageProps<'/[lang]/verify'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.verify.title,
    description: dict.account.verify.lede,
    alternates: alternatesFor(lang, '/verify'),
  };
}

/**
 * Public certificate verification.
 *
 * The code travels in the query string on purpose: an employer given a link
 * can open it, and the page is the same whether it is typed or followed. It
 * carries no personal data of the visitor, only the certificate code.
 */
export default async function VerifyPage(props: PageProps<'/[lang]/verify'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const { code: rawCode } = await props.searchParams;
  const dict = getDictionary(lang);
  const t = dict.account.verify;

  const submitted = typeof rawCode === 'string' ? rawCode.trim() : '';
  const certificate =
    submitted && isDbConfigured() ? await findByCode(submitted) : null;


  return (
    <Section>
      <Container className="max-w-2xl">
        <Kicker>{dict.meta.siteName}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        <form method="get" className="mt-8">
          <label htmlFor="code" className="mb-1.5 block text-[0.92rem] font-bold">
            {t.codeLabel}
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              id="code"
              name="code"
              type="text"
              required
              dir="ltr"
              autoCapitalize="characters"
              spellCheck={false}
              defaultValue={submitted}
              placeholder={t.codePlaceholder}
              className="min-w-[14rem] flex-1 rounded-xl border border-line bg-surface px-4 py-3 font-mono text-[1rem] tracking-wider outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
            />
            <button
              type="submit"
              className="rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark"
            >
              {t.check}
            </button>
          </div>
        </form>

        {/*
          * The `?member=NNNN` card lookup that used to live here is gone.
          *
          * It confirmed a card by membership number and returned the holder's
          * full name and stage. Membership numbers run in sequence from T014
          * to T473, so a loop counting to five hundred collected the name and
          * standing of every volunteer in the association — four hundred and
          * thirty-nine people, from a public page, with no login. The comment
          * sitting on it promised that a stranger "should not learn anything
          * else about a volunteer", which was true of everything except the
          * part that mattered.
          *
          * Cards verify at /verify/card/{token} now, on 128 bits of CSPRNG
          * output that cannot be counted to. Certificate codes above are
          * unaffected: those are random as well, and a certificate is a thing
          * its holder chooses to show.
          */}

        {submitted && !certificate && (
          <div className="mt-8 rounded-2xl border border-line bg-surface-2 p-6">
            <h2 className="text-[1.1rem] font-extrabold">{t.notFoundTitle}</h2>
            <p className="mt-2 leading-relaxed text-ink-2">{t.notFound}</p>
            <p className="mt-3 font-mono text-[0.9rem] text-ink-3" dir="ltr">
              {normaliseCode(submitted)}
            </p>
          </div>
        )}

        {certificate && (() => {
          /*
           * The same presenter /verify/[code], the achievements page and the
           * map read. This card used to say it in amber while the certificate
           * page said it in red and neither showed the reason — one question,
           * one answer, in both locales.
           */
          const view = credentialView(certificate, dict.account.map, lang);
          return (
            /*
             * `surfaceTone`, not `tone`: the container takes the border and the
             * tint, and no text colour. A text colour set here is inherited by
             * the h2, the holder's name, the issue date and the certificate
             * code — red prose at 3.1:1, and the deliberate `text-ink-2` on the
             * revocation paragraph silently overwritten. The status is said in
             * the pill, which is the one place the colour was measured.
             */
            <div className={`mt-8 rounded-2xl border p-6 ${
              view.status === 'revoked'
                ? view.surfaceTone
                : 'border-emerald-400 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
            }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[1.15rem] font-extrabold">
                  {view.status === 'revoked' ? t.revokedTitle : t.validTitle}
                </h2>
                <span
                  className={`rounded-full border px-3 py-1 text-[0.8rem] font-extrabold ${view.tone}`}
                >
                  {view.statusLabel}
                </span>
              </div>

              {view.status === 'revoked' && (
                <>
                  <p className="mt-2 leading-relaxed text-ink-2">{t.revoked}</p>
                  {/* Stored on the row since revocation was built, and shown
                      on no surface until now. A holder who cannot see why
                      cannot correct it. */}
                  {view.reason && (
                    <p className="mt-1.5 leading-relaxed text-ink-2">{view.reason}</p>
                  )}
                </>
              )}

              <p className="mt-4 text-[1.15rem] font-extrabold">
                {lang === 'ar' ? certificate.snapshot.titleAr : certificate.snapshot.titleEn}
              </p>

              <dl className="mt-4 space-y-1.5 text-[0.96rem]">
                <Row label={t.holder} value={certificate.snapshot.fullName} />
                {/* A date in the reader's own language and digits, not a UTC
                    ISO string sitting inside Arabic prose. */}
                <Row label={t.issued} value={formatDate(certificate.issued_at, lang)} />
                {certificate.revoked_at && (
                  <Row label={t.revokedOn} value={formatDate(certificate.revoked_at, lang)} />
                )}
                <Row label={t.codeLabelShort} value={certificate.code} ltr mono />
              </dl>
            </div>
          );
        })()}

        <p className="mt-8 text-[0.88rem] leading-relaxed text-ink-3">{t.disclaimer}</p>
      </Container>
    </Section>
  );
}

function Row({
  label,
  value,
  ltr,
  mono,
}: {
  label: string;
  value: string;
  ltr?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <dt className="font-bold text-ink-3">{label}:</dt>
      <dd className={mono ? 'font-mono tracking-wider' : ''} dir={ltr ? 'ltr' : undefined}>
        {value}
      </dd>
    </div>
  );
}
