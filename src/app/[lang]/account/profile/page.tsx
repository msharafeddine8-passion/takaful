import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured, queryOne } from '@/lib/db';
import { isVolunteer } from '@/lib/journey';
import { PhotoUpload } from '@/components/account/PhotoUpload';
import { ProfileForm } from '@/components/account/ProfileForm';
import { removePhotoAction } from '@/lib/actions/profile';

export async function generateMetadata(props: PageProps<'/[lang]/account/profile'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.profile.title,
    alternates: alternatesFor(lang, '/account/profile'),
    robots: { index: false, follow: false },
  };
}

export default async function ProfilePage(props: PageProps<'/[lang]/account/profile'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.profile;

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

  const [profile, photo, volunteer] = await Promise.all([
    queryOne<{
      full_name: string; display_name: string | null; bio: string | null;
      interests: string | null; skills: string | null; languages: string | null;
      member_number: number | null;
    }>(
      `SELECT full_name, display_name, bio, interests, skills, languages, member_number
         FROM profiles WHERE user_id = $1`,
      [user.id],
    ),
    queryOne<{ version: string }>(
      'SELECT version FROM profile_photos WHERE user_id = $1',
      [user.id],
    ),
    isVolunteer(user.id),
  ]);
  if (!profile) notFound();

  return (
    <Section>
      <Container className="max-w-2xl">
        <Kicker>{dict.account.dashboard.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        <section className="mt-8 rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-4 text-[0.8rem] font-bold tracking-[0.12em] text-ink-3">{t.photo}</h2>
          <PhotoUpload
            lang={lang}
            dict={dict}
            userId={user.id}
            hasPhoto={Boolean(photo)}
            version={photo?.version ?? null}
          />
          {photo && (
            <form action={removePhotoAction} className="mt-4">
              <input type="hidden" name="lang" value={lang} />
              <button type="submit" className="text-[0.88rem] font-bold text-red-600 hover:underline dark:text-red-400">
                {t.photoRemove}
              </button>
            </form>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[0.8rem] font-bold tracking-[0.12em] text-ink-3">{t.memberNumber}</h2>
          {profile.member_number ? (
            <>
              <p className="mt-2 font-mono text-[1.5rem] font-extrabold tracking-wider" dir="ltr">
                {profile.member_number}
              </p>
              <Link
                href={`/${lang}/account/card`}
                className="mt-3 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
              >
                {t.cardCta} →
              </Link>
            </>
          ) : (
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">
              {t.noMemberNumber}
              {!volunteer && (
                <Link
                  href={`/${lang}/account/apply`}
                  className="ms-2 font-bold text-brand-blue hover:underline dark:text-brand-orange"
                >
                  {dict.account.dashboard.applyCta} →
                </Link>
              )}
            </p>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-line bg-surface p-6">
          <ProfileForm
            lang={lang}
            dict={dict}
            values={{
              fullName: profile.full_name,
              displayName: profile.display_name ?? '',
              bio: profile.bio ?? '',
              interests: profile.interests ?? '',
              skills: profile.skills ?? '',
              languages: profile.languages ?? '',
            }}
          />
        </section>

        <Link
          href={`/${lang}/account`}
          className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {dict.account.hours.backToAccount}
        </Link>
      </Container>
    </Section>
  );
}
