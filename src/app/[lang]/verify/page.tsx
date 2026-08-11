import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { isDbConfigured } from '@/lib/db';
import { findByCode, normaliseCode } from '@/lib/certificates';

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

        {submitted && !certificate && (
          <div className="mt-8 rounded-2xl border border-line bg-surface-2 p-6">
            <h2 className="text-[1.1rem] font-extrabold">{t.notFoundTitle}</h2>
            <p className="mt-2 leading-relaxed text-ink-2">{t.notFound}</p>
            <p className="mt-3 font-mono text-[0.9rem] text-ink-3" dir="ltr">
              {normaliseCode(submitted)}
            </p>
          </div>
        )}

        {certificate && (
          <div
            className={`mt-8 rounded-2xl border p-6 ${
              certificate.revoked_at
                ? 'border-amber-400 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
                : 'border-emerald-400 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
            }`}
          >
            <h2 className="text-[1.15rem] font-extrabold">
              {certificate.revoked_at ? t.revokedTitle : t.validTitle}
            </h2>

            {certificate.revoked_at && (
              <p className="mt-2 leading-relaxed text-ink-2">{t.revoked}</p>
            )}

            <p className="mt-4 text-[1.15rem] font-extrabold">
              {lang === 'ar' ? certificate.snapshot.titleAr : certificate.snapshot.titleEn}
            </p>

            <dl className="mt-4 space-y-1.5 text-[0.96rem]">
              <Row label={t.holder} value={certificate.snapshot.fullName} />
              <Row
                label={t.issued}
                value={new Date(certificate.issued_at).toISOString().slice(0, 10)}
                ltr
              />
              {certificate.revoked_at && (
                <Row
                  label={t.revokedOn}
                  value={new Date(certificate.revoked_at).toISOString().slice(0, 10)}
                  ltr
                />
              )}
              <Row label={t.codeLabelShort} value={certificate.code} ltr mono />
            </dl>
          </div>
        )}

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
