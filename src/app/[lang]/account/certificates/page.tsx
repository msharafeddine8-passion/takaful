import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { certificatesFor } from '@/lib/certificates';

export async function generateMetadata(props: PageProps<'/[lang]/account/certificates'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.certificate.myCertificates,
    alternates: alternatesFor(lang, '/account/certificates'),
    robots: { index: false, follow: false },
  };
}

export default async function MyCertificatesPage(props: PageProps<'/[lang]/account/certificates'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.certificate;

  if (!isDbConfigured()) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.errors.dbUnavailable}
        </p>
      </Container></Section>
    );
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  const certificates = await certificatesFor(user.id);

  return (
    <Section>
      <Container className="max-w-2xl">
        <Kicker>{dict.account.dashboard.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.myCertificates}
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.myCertificatesLede}</p>

        {certificates.length === 0 ? (
          <div className="mt-8">
            <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
              {t.none}
            </p>
            <Link
              href={`/${lang}/academy`}
              className="mt-4 inline-block rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
            >
              {dict.account.dashboard.coursesCta} →
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {certificates.map((c) => (
              <li
                key={c.id}
                className={`rounded-2xl border p-5 ${
                  c.revoked_at ? 'border-line bg-surface-2 opacity-70' : 'border-line bg-surface'
                }`}
              >
                <p className="text-[1.05rem] font-extrabold">
                  {lang === 'ar' ? c.snapshot.titleAr : c.snapshot.titleEn}
                </p>
                <p className="mt-1.5 font-mono text-[0.9rem] tracking-wider text-ink-2" dir="ltr">
                  {c.code}
                </p>
                <p className="mt-1 text-[0.85rem] text-ink-3" dir="ltr">
                  {new Date(c.issued_at).toISOString().slice(0, 10)}
                </p>

                {c.revoked_at ? (
                  <p className="mt-2.5 text-[0.9rem] font-bold text-red-600 dark:text-red-400">
                    {t.revokedBanner}
                  </p>
                ) : (
                  <Link
                    href={`/${lang}/certificates/${c.code}`}
                    className="mt-3 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
                  >
                    {t.view} →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}

        <Link
          href={`/${lang}/account`}
          className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {t.backToAccount}
        </Link>
      </Container>
    </Section>
  );
}
