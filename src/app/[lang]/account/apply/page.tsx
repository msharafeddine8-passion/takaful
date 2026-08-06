import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { ApplyForm } from '@/components/account/ApplyForm';
import { currentUser } from '@/lib/auth';
import { isDbConfigured, queryOne } from '@/lib/db';

export async function generateMetadata(
  props: PageProps<'/[lang]/account/apply'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.apply.title,
    alternates: alternatesFor(lang, '/account/apply'),
    robots: { index: false, follow: false },
  };
}

export default async function ApplyPage(props: PageProps<'/[lang]/account/apply'>) {
  // Never prerender an account page: what it shows depends on who is asking.
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.apply;

  if (!isDbConfigured()) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {dict.account.errors.dbUnavailable}
          </p>
        </Container>
      </Section>
    );
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  // Someone with a live application should be reading its status, not filing another.
  const open = await queryOne<{ id: string }>(
    `SELECT id FROM volunteer_applications
      WHERE user_id = ?
        AND status IN ('submitted','under_review','interview_required','interview_scheduled')
      LIMIT 1`,
    [user.id],
  );
  if (open) redirect(`/${lang}/account`);

  return (
    <Section>
      <Container className="max-w-2xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mb-9 mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        <ApplyForm lang={lang} dict={dict} />
      </Container>
    </Section>
  );
}
