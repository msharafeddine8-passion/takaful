import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { ForgotForm } from '@/components/auth/ForgotForm';
import { isEmailConfigured } from '@/lib/email';

export async function generateMetadata(props: PageProps<'/[lang]/forgot'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.recovery.forgotTitle,
    alternates: alternatesFor(lang, '/forgot'),
    robots: { index: false, follow: false },
  };
}

export default async function ForgotPage(props: PageProps<'/[lang]/forgot'>) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.recovery;

  return (
    <Section>
      <Container className="max-w-md">
        <Kicker>{dict.meta.siteName}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.forgotTitle}
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.forgotLede}</p>

        {/* Said plainly rather than letting someone wait for an email that was
            never going to arrive. */}
        {!isEmailConfigured() && (
          <p className="mt-5 rounded-xl border border-brand-orange/40 bg-brand-orange/[0.1] px-4 py-3 text-[0.9rem] font-bold text-brand-orange-dark dark:text-brand-orange">
            {t.noProvider}
          </p>
        )}

        <ForgotForm lang={lang} dict={dict} />
      </Container>
    </Section>
  );
}
