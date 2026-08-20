import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Container, Section } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { claimForUser, formatMemberNumber } from '@/lib/roster';
import { ClaimForm } from './ClaimForm';

export async function generateMetadata(
  props: PageProps<'/[lang]/account/claim'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.account.claim.title, robots: { index: false, follow: false } };
}

export default async function ClaimPage(props: PageProps<'/[lang]/account/claim'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.claim;

  if (!isDbConfigured()) notFound();
  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  // Someone who has already claimed sees where it stands, not the form again.
  const existing = await claimForUser(user.id);

  return (
    <Section>
      <Container className="max-w-2xl">
        <p className="text-[0.82rem] font-extrabold tracking-[0.16em] text-brand-orange">
          {t.kicker}
        </p>
        <h1 className="mt-3 text-[clamp(1.8rem,1.4rem+1.8vw,2.6rem)] font-black tracking-tight">
          {t.title}
        </h1>

        {existing ? (
          <div className="mt-6 rounded-2xl border-2 border-brand-orange bg-brand-orange/10 p-6">
            <p className="text-[1.15rem] font-extrabold">
              {existing.approved_at ? t.approvedTitle : t.pendingTitle}
            </p>
            <p className="mt-2 text-[1.02rem] leading-relaxed text-ink-2">
              {(existing.approved_at ? t.approvedBody : t.pendingBody).replace(
                '{number}',
                formatMemberNumber(existing.member_number),
              )}
            </p>
            <Link
              href={`/${lang}/account`}
              className="mt-5 inline-flex rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
            >
              {t.backToAccount} →
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-4 max-w-[52ch] text-[1.05rem] leading-relaxed text-ink-2">{t.lede}</p>
            <ClaimForm lang={lang} t={t} />
            <p className="mt-6 text-[0.92rem] leading-relaxed text-ink-2">
              {t.notListed}{' '}
              <Link href={`/${lang}/account/apply`} className="font-bold text-brand-blue underline dark:text-sky-300">
                {t.applyInstead}
              </Link>
            </p>
          </>
        )}
      </Container>
    </Section>
  );
}
