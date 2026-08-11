import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { isDbConfigured } from '@/lib/db';
import { confirmEmail, type VerifyOutcome } from '@/lib/recovery';

export async function generateMetadata(props: PageProps<'/[lang]/verify-email'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.recovery.verifyTitle,
    alternates: alternatesFor(lang, '/verify-email'),
    robots: { index: false, follow: false },
  };
}

export default async function VerifyEmailPage(props: PageProps<'/[lang]/verify-email'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const { token: raw } = await props.searchParams;
  const dict = getDictionary(lang);
  const t = dict.account.recovery;

  const token = typeof raw === 'string' ? raw.trim() : '';

  /*
   * Spending the token on a GET is unusual, and it is what a link in an email
   * has to do — there is no other way for someone to act on one. The token is
   * single use and short lived, and a mail client that prefetches the link
   * only confirms the address the recipient was going to confirm anyway.
   */
  let outcome: VerifyOutcome = 'invalid';
  if (token && isDbConfigured()) {
    outcome = await confirmEmail(token).catch(() => 'invalid' as const);
  }

  const body = {
    ok: t.verifiedBody,
    already: t.verifyAlreadyBody,
    address_changed: t.verifyChangedBody,
    invalid: t.verifyInvalidBody,
  }[outcome];
  const good = outcome === 'ok' || outcome === 'already';

  return (
    <Section>
      <Container className="max-w-md">
        <Kicker>{dict.meta.siteName}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.verifyTitle}
        </h1>

        <div
          className={`mt-6 rounded-2xl border p-6 ${
            good ? 'border-ok/40 bg-ok/[0.08]' : 'border-line bg-surface'
          }`}
        >
          <p className="leading-relaxed text-ink-2">{body}</p>
          <Link
            href={`/${lang}/account`}
            className="mt-4 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
          >
            {dict.account.certificate.backToAccount} →
          </Link>
        </div>
      </Container>
    </Section>
  );
}
