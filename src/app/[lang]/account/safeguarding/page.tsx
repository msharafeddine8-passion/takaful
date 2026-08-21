import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured, queryOne } from '@/lib/db';
import { SafeguardingForm } from '@/components/account/SafeguardingForm';

export async function generateMetadata(
  props: PageProps<'/[lang]/account/safeguarding'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.account.safeguarding.title, robots: { index: false, follow: false } };
}

export default async function SafeguardingPage(
  props: PageProps<'/[lang]/account/safeguarding'>,
) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.safeguarding;

  if (!isDbConfigured()) notFound();
  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  /*
   * Prefilled from whatever is already on file, so a volunteer correcting one
   * line does not retype the rest. The birth date comes back as a plain string
   * because <input type="date"> wants YYYY-MM-DD and nothing else.
   */
  const record = await queryOne<{
    date_of_birth: string;
    emergency_name: string;
    emergency_phone: string;
    emergency_relation: string | null;
    guardian_name: string | null;
    guardian_relation: string | null;
    guardian_phone: string | null;
    medical_notes: string | null;
  }>(
    `SELECT to_char(date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
            emergency_name, emergency_phone, emergency_relation,
            guardian_name, guardian_relation, guardian_phone, medical_notes
       FROM safeguarding_records WHERE user_id = $1`,
    [user.id],
  );

  return (
    <Section>
      <Container className="max-w-2xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.6rem,1.3rem+1.4vw,2.2rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mb-8 mt-3 text-[1.02rem] leading-relaxed text-ink-2">
          {record ? t.ledeExisting : t.lede}
        </p>

        <SafeguardingForm lang={lang} t={t} errors={dict.account.errors} record={record} />

        <Link
          href={`/${lang}/account`}
          className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {t.backToAccount}
        </Link>
      </Container>
    </Section>
  );
}
