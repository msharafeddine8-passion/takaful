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
import { PasswordForm } from '@/components/account/PasswordForm';
import { VisibilityForm } from '@/components/account/VisibilityForm';
import { removePhotoAction } from '@/lib/actions/profile';
import { getRecognition } from '@/lib/dictionaries/recognition';
import { visibilityFrom } from '@/lib/visibility';

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
  /* Straight from its own module rather than through the dictionary, so this
   * feature does not have to edit types.ts, ar.ts and en.ts while somebody
   * else is in them. See the header of dictionaries/recognition.ts. */
  const rt = getRecognition(lang);

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
      public_visibility: string | null; birthday_greetings: boolean | null;
      visibility_chosen_at: Date | null;
    }>(
      /* No date of birth here, and none anywhere on this page. What the person
       * may choose is not affected by how old they are — the age question is
       * asked once, by the public page, at the moment it renders. A profile
       * page that held the answer would be a screenshot away from telling
       * somebody which of their volunteers are children. */
      `SELECT full_name, display_name, bio, interests, skills, languages, member_number,
              public_visibility, birthday_greetings, visibility_chosen_at
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
          <h2 className="text-[0.8rem] font-bold tracking-[0.12em] text-ink-3">
            {dict.account.password.title}
          </h2>
          <p className="mt-2 max-w-[52ch] text-[0.94rem] leading-relaxed text-ink-2">
            {dict.account.password.lede}
          </p>
          <PasswordForm lang={lang} t={dict.account.password} errors={dict.account.errors} />
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

        {/* Directly below the profile form on purpose: "show my display name
            only" is meaningless until you can see which display name it means,
            and the field that sets it is the one immediately above. */}
        <section className="mt-5 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[0.8rem] font-bold tracking-[0.12em] text-ink-3">{rt.title}</h2>
          <p className="mt-2 max-w-[52ch] text-[0.94rem] leading-relaxed text-ink-2">{rt.lede}</p>
          <VisibilityForm
            lang={lang}
            t={rt}
            errors={dict.account.errors}
            values={{
              choice: visibilityFrom(profile.public_visibility),
              birthdayGreetings: profile.birthday_greetings === true,
              everChosen: profile.visibility_chosen_at !== null,
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
