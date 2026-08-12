import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { RegisterForm } from '@/components/account/AuthForms';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';

export async function generateMetadata(props: PageProps<'/[lang]/join'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.join.title,
    description: dict.account.join.lede,
    alternates: alternatesFor(lang, '/join'),
    robots: { index: false },
  };
}

export default async function JoinPage(props: PageProps<'/[lang]/join'>) {
  // Never prerender an account page: what it shows depends on who is asking.
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.join;

  if (isDbConfigured() && (await currentUser())) redirect(`/${lang}/account`);

  return (
    <Section>
      <Container className="max-w-lg">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mb-8 mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        <RegisterForm lang={lang} t={dict.account.join} errors={dict.account.errors} />

        <p className="mt-6 text-center text-[0.94rem] text-ink-2">
          {t.haveAccount}{' '}
          <Link href={`/${lang}/login`} className="font-bold text-brand-blue hover:underline dark:text-brand-orange">
            {t.loginLink}
          </Link>
        </p>
      </Container>
    </Section>
  );
}
