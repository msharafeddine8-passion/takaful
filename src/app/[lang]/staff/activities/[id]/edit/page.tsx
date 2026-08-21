import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured, queryOne } from '@/lib/db';
import { ActivityForm, type ActivityDraft } from '@/components/activities/ActivityForm';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function EditActivityPage(
  props: PageProps<'/[lang]/staff/activities/[id]/edit'>,
) {
  await connection();
  const { lang, id } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.activityForm;

  if (!isDbConfigured()) notFound();

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);
  // Asked here and again in the action: a page that hides a form is not a
  // permission check.
  if (!can(user, 'activities.manage')) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.staff.forbidden}
        </p>
      </Container></Section>
    );
  }

  const draft = await queryOne<ActivityDraft>(
    `SELECT id, title_ar, title_en, description_ar, description_en, location, map_url,
            image_url, activity_type, audience, starts_at, ends_at,
            registration_closes_at, capacity, min_stage, credited_minutes,
            requires_approval, is_published
       FROM activities WHERE id = $1`,
    [id],
  );
  if (!draft) notFound();

  return (
    <Section>
      <Container className="max-w-3xl">
        <Kicker>{dict.account.staff.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.5rem,1.25rem+1.3vw,2.1rem)] font-extrabold tracking-tight">
          {t.editTitle}
        </h1>
        <p className="mb-8 mt-3 text-[1rem] leading-relaxed text-ink-2">{t.lede}</p>

        <ActivityForm lang={lang} t={t} draft={draft} mode="edit" />

        <Link
          href={`/${lang}/staff/activities/${id}`}
          className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {dict.account.activities.actions.details}
        </Link>
      </Container>
    </Section>
  );
}
