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
  const c = dict.account.chooser;

  if (isDbConfigured() && (await currentUser())) redirect(`/${lang}/account`);

  const { as } = await props.searchParams;
  const path = as === 'volunteer' ? 'volunteer' : as === 'learner' ? 'learner' : null;

  /*
   * The question was being asked in the wrong order. Everyone registered the
   * same way, and only afterwards — buried on the account page — did an
   * existing volunteer discover there was a way to be recognised rather than
   * to apply. So the fork comes first, at the door, in the words people use
   * about themselves.
   */
  if (!path) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <Kicker>{t.kicker}</Kicker>
          <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
            {c.title}
          </h1>
          <p className="mb-8 mt-3 text-[1.02rem] leading-relaxed text-ink-2">{c.lede}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href={`/${lang}/join?as=volunteer`}
              className="group rounded-2xl border-2 border-brand-orange bg-brand-orange/5 p-6 transition-colors hover:bg-brand-orange/10"
            >
              <p className="text-[1.15rem] font-extrabold">{c.volunteerTitle}</p>
              <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-2">{c.volunteerBody}</p>
              <span className="mt-4 inline-block font-extrabold text-brand-orange-text dark:text-brand-orange">
                {c.continueCta} ←
              </span>
            </Link>

            <Link
              href={`/${lang}/join?as=learner`}
              className="group rounded-2xl border-2 border-line bg-surface p-6 transition-colors hover:bg-surface-2"
            >
              <p className="text-[1.15rem] font-extrabold">{c.learnerTitle}</p>
              <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-2">{c.learnerBody}</p>
              <span className="mt-4 inline-block font-extrabold text-brand-blue dark:text-sky-300">
                {c.continueCta} ←
              </span>
            </Link>
          </div>

          <p className="mt-8 text-center text-[0.94rem] text-ink-2">
            {t.haveAccount}{' '}
            <Link href={`/${lang}/login`} className="font-bold text-brand-blue hover:underline dark:text-brand-orange">
              {t.loginLink}
            </Link>
          </p>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container className="max-w-lg">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {path === 'volunteer' ? c.volunteerTitle : c.learnerTitle}
        </h1>
        <p className="mb-2 mt-3 text-[1.02rem] leading-relaxed text-ink-2">
          {path === 'volunteer' ? c.volunteerLede : c.learnerLede}
        </p>
        <Link
          href={`/${lang}/join`}
          className="mb-8 inline-block text-[0.9rem] font-bold text-brand-blue hover:underline dark:text-sky-300"
        >
          {c.changeChoice}
        </Link>

        <RegisterForm lang={lang} t={dict.account.join} errors={dict.account.errors} next={path} />

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
