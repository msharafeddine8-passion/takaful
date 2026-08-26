import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can, isStaff } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import { overview } from '@/lib/admin';
import { formatDuration } from '@/lib/hours';
import { challengeDictionaries } from '@/lib/dictionaries/challenges';
import { recognitionAdmin } from '@/lib/dictionaries/recognition-admin';
import { awardDictionaries } from '@/lib/dictionaries/awards';
import { learningAnalytics } from '@/lib/dictionaries/learning-analytics';
import { practical } from '@/lib/dictionaries/practical';
import { challengeLevels } from '@/lib/dictionaries/challenge-levels';
import { adminProfile } from '@/lib/dictionaries/admin-profile';
import { orgGroups } from '@/lib/dictionaries/org-groups';

export async function generateMetadata(props: PageProps<'/[lang]/staff'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.staff.dashboard.title,
    alternates: alternatesFor(lang, '/staff'),
    robots: { index: false, follow: false },
  };
}

export default async function StaffHomePage(props: PageProps<'/[lang]/staff'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.staff;
  const d = t.dashboard;

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

  if (!isStaff(user)) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.forbidden}
          </p>
        </Container>
      </Section>
    );
  }

  const o = await overview();
  const waiting = o.applicationsOpen + o.hoursPending;

  return (
    <Section>
      <Container className="max-w-5xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {d.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{d.lede}</p>

        {/* What needs a decision comes first. Everything else is context. */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <QueueCard
            href={`/${lang}/staff/applications`}
            label={d.goApplications}
            count={o.applicationsOpen}
            caption={d.applicationsOpen}
            urgent={o.applicationsOpen > 0}
            show={can(user, 'applications.review')}
          />
          <QueueCard
            href={`/${lang}/staff/hours`}
            label={d.goHours}
            count={o.hoursPending}
            caption={`${d.hoursPending} · ${formatDuration(o.hoursPendingMinutes, lang)}`}
            urgent={o.hoursPending > 0}
            show={can(user, 'hours.verify')}
          />
        </div>

        {waiting === 0 && (
          <p className="mt-4 rounded-xl border border-line bg-surface-2 px-5 py-3.5 text-ink-2">
            {d.nothingWaiting}
          </p>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label={d.members} value={String(o.members)} />
          <Stat label={d.volunteers} value={String(o.volunteers)} />
          <Stat label={d.newThisMonth} value={String(o.newThisMonth)} />
          <Stat label={d.verifiedHours} value={formatDuration(o.verifiedMinutes, lang)} />
          <Stat label={d.coursesPassed} value={String(o.coursesPassed)} />
          <Stat label={d.certificates} value={String(o.certificates)} />
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {can(user, 'applications.review') && (
            <Link
              href={`/${lang}/staff/roster`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {dict.account.staff.roster.title}
            </Link>
          )}
          {can(user, 'members.manage') && (
            <Link
              href={`/${lang}/staff/members`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {d.goMembers}
            </Link>
          )}
          {can(user, 'activities.manage') && (
            <Link
              href={`/${lang}/staff/activities`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {dict.account.activities.manageTitle}
            </Link>
          )}
          {can(user, 'challenges.manage') && (
            <Link
              href={`/${lang}/staff/challenges`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {/* Imported from the challenges dictionary directly rather than
                  spliced into types.ts/ar.ts/en.ts — see the header of
                  src/lib/dictionaries/challenges.ts. */}
              {challengeDictionaries[lang].manageTitle}
            </Link>
          )}
          {can(user, 'members.manage') && (
            <Link
              href={`/${lang}/staff/recognition`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {/* Same reason as the challenges link above — its own dictionary
                  module, not a splice into types.ts/ar.ts/en.ts. */}
              {recognitionAdmin(lang).title}
            </Link>
          )}
          {/* Deliberately not gated. The monthly shortlist is meant to be
              argued over in a room, and a field supervisor who cannot press
              the button can still say whose month it was. The decision forms
              themselves are gated on awards.decide inside the page. */}
          <Link
            href={`/${lang}/staff/awards`}
            className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
          >
            {/* Its own dictionary module, like the two links above — see the
                header of src/lib/dictionaries/awards.ts. */}
            {awardDictionaries[lang].manageTitle}
          </Link>
          {/*
            The one link an `instructor` can follow. They hold neither
            members.manage nor hours.verify, so before practical tasks existed
            there was nothing under /staff for them at all — see the note on
            isStaff() in lib/authz.ts.
          */}
          {can(user, 'practical.review') && (
            <Link
              href={`/${lang}/staff/practical`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {/* Its own dictionary module, like the links above — see the
                  header of src/lib/dictionaries/practical.ts. */}
              {practical(lang).goQueue}
            </Link>
          )}
          {/*
            Decision runs that ended in `review`. Same capability as the
            practical queue and for the same reason — reading a learner's work
            and forming a judgement about it — so the trainer, supervisor or
            coordinator who would actually have the conversation can reach it.
            Without a link here the page would exist and nobody would arrive at
            it, which is the failure isStaff() is annotated against in authz.ts.
          */}
          {can(user, 'practical.review') && (
            <Link
              href={`/${lang}/staff/decision-runs`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {/* Its own dictionary module, like the links above — see the
                  header of src/lib/dictionaries/challenge-levels.ts. */}
              {challengeLevels(lang).staff.goQueue}
            </Link>
          )}
          {/*
            The definitions behind «حقول الملفّ» on every member page. Gated on
            challenges.manage rather than members.manage, matching the actions:
            a definition is on nobody's file in particular and on everybody's
            profile in general, which is the same act as announcing a challenge
            to every volunteer — see the head of lib/actions/admin-profile.ts.
            Without a link here the page would exist and nobody would arrive at
            it.
          */}
          {can(user, 'challenges.manage') && (
            <Link
              href={`/${lang}/staff/profile-fields`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {/* Its own dictionary module, like the links above — see the
                  header of src/lib/dictionaries/admin-profile.ts. */}
              {adminProfile(lang).defs.title}
            </Link>
          )}
          {/*
            The committees and teams, and the leadership history read off the
            roles that point at them. Gated on members.manage, matching every
            action behind the screen — the head of lib/actions/org-groups.ts
            argues why it is the roles' capability and not challenges.manage.
            Without a link here the page would exist and nobody would arrive at
            it, which is the failure isStaff() is annotated against in authz.ts.
          */}
          {can(user, 'members.manage') && (
            <Link
              href={`/${lang}/staff/groups`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {/* Its own dictionary module, like the links above — see the
                  header of src/lib/dictionaries/org-groups.ts. */}
              {orgGroups(lang).title}
            </Link>
          )}
          {can(user, 'members.manage') && (
            <Link
              href={`/${lang}/staff/journey`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {t.journeyBuilder.title}
            </Link>
          )}
          {can(user, 'reports.read') && (
            <Link
              href={`/${lang}/staff/reports`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {dict.account.reports.title}
            </Link>
          )}
          {can(user, 'programme.edit') && (
            <Link
              href={`/${lang}/staff/learning`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {/* Its own dictionary module, like the links above. Gated on
                  programme.edit rather than reports.read because the page is a
                  list of things to go and rewrite — see the header of
                  src/app/[lang]/staff/learning/page.tsx. */}
              {learningAnalytics(lang).title}
            </Link>
          )}
          {can(user, 'audit.read') && (
            <Link
              href={`/${lang}/staff/audit`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
            >
              {d.goAudit}
            </Link>
          )}
        </div>
      </Container>
    </Section>
  );
}

function QueueCard({
  href,
  label,
  count,
  caption,
  urgent,
  show,
}: {
  href: string;
  label: string;
  count: number;
  caption: string;
  urgent: boolean;
  show: boolean;
}) {
  if (!show) return null;
  return (
    <Link
      href={href as Parameters<typeof Link>[0]['href']}
      className={`block rounded-2xl border p-6 transition-transform hover:-translate-y-0.5 ${
        urgent
          ? 'border-brand-orange bg-brand-orange/10'
          : 'border-line bg-surface'
      }`}
    >
      <p className="text-[0.8rem] font-bold tracking-[0.12em] text-ink-3">{caption}</p>
      <p className="mt-2 text-[2.2rem] font-extrabold leading-none">{count}</p>
      <p className="mt-3 font-bold text-brand-blue dark:text-brand-orange">{label} →</p>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-[0.82rem] font-bold tracking-[0.12em] text-ink-3">{label}</p>
      <p className="mt-1.5 text-[1.5rem] font-extrabold">{value}</p>
    </div>
  );
}
