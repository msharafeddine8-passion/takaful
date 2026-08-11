import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { ResetForm } from '@/components/auth/ResetForm';

export async function generateMetadata(props: PageProps<'/[lang]/reset'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.recovery.resetTitle,
    alternates: alternatesFor(lang, '/reset'),
    robots: { index: false, follow: false },
  };
}

/**
 * The token arrives in the query string because that is where a link can carry
 * it. It is never rendered into the page's visible text, and the page is
 * marked noindex so a crawler that somehow follows one does not publish it.
 */
export default async function ResetPage(props: PageProps<'/[lang]/reset'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const { token: raw } = await props.searchParams;
  const dict = getDictionary(lang);
  const t = dict.account.recovery;
  const token = typeof raw === 'string' ? raw.trim() : '';

  return (
    <Section>
      <Container className="max-w-md">
        <Kicker>{dict.meta.siteName}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.resetTitle}
        </h1>

        {token ? (
          <>
            <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.resetLede}</p>
            <ResetForm lang={lang} dict={dict} token={token} />
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-[1.1rem] font-extrabold">{t.resetInvalidTitle}</h2>
            <p className="mt-2 leading-relaxed text-ink-2">{t.resetInvalidBody}</p>
            <Link
              href={`/${lang}/forgot`}
              className="mt-4 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
            >
              {t.forgotTitle} →
            </Link>
          </div>
        )}
      </Container>
    </Section>
  );
}
