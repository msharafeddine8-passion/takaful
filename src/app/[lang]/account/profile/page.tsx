import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
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
import { PreferencesForm } from '@/components/account/PreferencesForm';
import { milestoneDictionaries } from '@/lib/dictionaries/milestones';
import { topicsFrom } from '@/lib/preferences';
/* The ring's arithmetic already existed and nothing had ever called it. Reused
 * rather than reimplemented here: a second copy is the one that disagrees with
 * probe-account-state about what "complete" means. */
import { listFrom, profileCompleteness } from '@/lib/account-state';
import { ProgressRing } from '@/components/lms/ProgressRing';

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

  const [profile, photo, volunteer, preferences] = await Promise.all([
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
    /* Which subjects they switched off. No row is the ordinary case and means
     * everything is on — see migration 010. */
    queryOne<{ muted_topics: string[] | null }>(
      'SELECT muted_topics FROM notification_preferences WHERE user_id = $1',
      [user.id],
    ),
  ]);
  if (!profile) notFound();

  /*
   * How much of the profile is filled in.
   *
   * The three list fields are one free-text box each, so they are split before
   * they get here — a blank box and a box holding only spaces both have to
   * count as missing, which is what listFrom and profileCompleteness between
   * them already decide.
   */
  const filled = profileCompleteness({
    photoRef: photo?.version ?? null,
    bio: profile.bio,
    interests: listFrom(profile.interests),
    skills: listFrom(profile.skills),
    languages: listFrom(profile.languages),
  });

  return (
    <Section>
      <Container className="max-w-2xl">
        <Kicker>{dict.account.dashboard.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        {/*
          * Shown only while something is genuinely missing.
          *
          * A ring sitting at five of five is decoration, and a card headed
          * "complete your profile" above a complete profile teaches somebody
          * that this site nags regardless — after which they stop reading the
          * prompts that do mean something.
          */}
        {filled.missing.length > 0 && (
          <CompletenessRing
            lang={lang}
            done={filled.done}
            total={filled.total}
            missing={filled.missing}
            t={t}
          />
        )}

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
              {/* danger-text, not red-600 with a dark: variant. The token already
                  flips with the theme *and* with the site's own toggle, which a
                  prefers-color-scheme variant ignores. */}
              <button type="submit" className="min-h-11 text-[0.88rem] font-bold text-danger-text hover:underline">
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

        {/*
          * Directly after the visibility section, and deliberately not folded
          * into it. They look alike because a volunteer should not have to
          * learn two layouts, but they answer different questions: the one
          * above is consent to be published, which the association may have to
          * produce evidence of, and this is a preference about what arrives in
          * this person's own bell. Saving one must never restamp the other —
          * see the note at the head of lib/actions/preferences.ts.
          */}
        <section className="mt-5 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[0.8rem] font-bold tracking-[0.12em] text-ink-3">
            {milestoneDictionaries[lang].preferences.title}
          </h2>
          <p className="mt-2 max-w-[52ch] text-[0.94rem] leading-relaxed text-ink-2">
            {milestoneDictionaries[lang].preferences.lede}
          </p>
          <PreferencesForm
            lang={lang}
            t={milestoneDictionaries[lang].preferences}
            errors={dict.account.errors}
            muted={topicsFrom(preferences?.muted_topics)}
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

/**
 * How much of the profile is filled in, and what is left.
 *
 * A ring rather than a bar because it is a small whole out of a small whole —
 * five things, not a percentage of an unbounded quantity — and because "three
 * of five" is a sentence and "60%" is not. Both are given: the fraction inside
 * the ring for the eye, and the missing fields named underneath, because a
 * progress indicator that will not say what is missing is a scolding rather
 * than a prompt.
 */
function CompletenessRing({
  lang, done, total, missing, t,
}: {
  lang: Locale;
  done: number;
  total: number;
  missing: string[];
  t: Dictionary['account']['profile'];
}) {
  const count = t.completeness.count
    .replace('{done}', String(done))
    .replace('{total}', String(total));

  return (
    <section className="mt-6 flex items-center gap-5 rounded-2xl border border-line bg-surface p-5">
      {/*
        * The map's ring, not a second one drawn here.
        *
        * It already carries the two things a hand-rolled SVG gets wrong: a
        * required label with aria-valuetext, so the figure is never left to the
        * arc alone, and an arc mirrored under Arabic so it grows in the
        * reading direction rather than backwards.
        */}
      <div className="shrink-0">
        <ProgressRing
          lang={lang}
          percent={total > 0 ? (done / total) * 100 : 0}
          label={t.completeness.title}
          valueText={count}
          size="sm"
        >
          {/* dir="ltr": "3/5" is a ratio, not prose, and mirrors wrongly under
              the page's own dir="rtl". */}
          <span dir="ltr">{done}/{total}</span>
        </ProgressRing>
      </div>

      <div>
        <h2 className="text-[1rem] font-extrabold">{t.completeness.title}</h2>
        <p className="mt-1 max-w-[46ch] text-[0.92rem] leading-relaxed text-ink-2">
          {t.completeness.lede}
        </p>
        {/* Named, not counted. "2 fields missing" sends somebody hunting. */}
        <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-3">
          <span className="font-bold">{t.completeness.missingLabel}: </span>
          {missing
            .map((field) => t.completeness.fields[field as keyof typeof t.completeness.fields])
            .filter(Boolean)
            /* Arabic's own comma. «الصورة, النبذة» with a Latin comma sits on
               the wrong side of the word and reads as a typo in Arabic. */
            .join(lang === 'ar' ? '، ' : ', ')}
        </p>
      </div>
    </section>
  );
}
