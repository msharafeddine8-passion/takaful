import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Arrow, Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured, queryOne } from '@/lib/db';
import { isStaff } from '@/lib/authz';
import { portalSummary } from '@/lib/portal';
import { formatDuration } from '@/lib/hours';
import { countPhrase, formatDateTime } from '@/lib/when';
import { COURSES } from '@/lib/courses';
import { logoutAction } from '@/lib/actions/account';
import { VerifyBanner } from '@/components/account/VerifyBanner';
import { AccountGroups, AccountBottomBar } from '@/components/account/AccountNav';
import {
  audienceOf, nextStepOf, otherTasksOf, VOLUNTEER_STANDING,
  type AccountFacts, type Audience, type Step, type StepKey,
} from '@/lib/account-state';
import { claimForUser, formatMemberNumber } from '@/lib/roster';
import { isEmailConfigured } from '@/lib/email';
import { DashboardHero, StageRail } from '@/components/account/DashboardHero';
import { ImpactTiles } from '@/components/account/ImpactTiles';
import { cardStatusOf } from '@/lib/card-view';
import { challengeBoard } from '@/lib/challenge-progress';
import { ChallengePanel } from '@/components/account/ChallengePanel';
import { challengeDictionaries } from '@/lib/dictionaries/challenges';
import { runBirthdays, runMilestones } from '@/lib/milestones-data';
import { BirthdayBanner } from '@/components/account/BirthdayBanner';
import { milestoneDictionaries } from '@/lib/dictionaries/milestones';
import { hidesPanel } from '@/lib/preferences';

export async function generateMetadata(props: PageProps<'/[lang]/account'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.dashboard.title,
    alternates: alternatesFor(lang, '/account'),
    robots: { index: false, follow: false },
  };
}

const APPLICATION_OPEN = ['submitted', 'under_review', 'interview_required', 'interview_scheduled'];

/* VOLUNTEER_STANDING lives in lib/account-state.ts. It was declared here too
 * until the two were one edit away from disagreeing about who counts as a
 * volunteer — which is the sort of disagreement that shows one screen a
 * volunteer and another screen a learner, for the same person. */

export default async function AccountPage(props: PageProps<'/[lang]/account'>) {
  // Never prerender an account page: what it shows depends on who is asking.
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.dashboard;
  const p = dict.account.portal;

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

  /*
   * The greetings and the milestones, before the rest of the page is gathered
   * rather than alongside it.
   *
   * This is where they run, because there is no cron on this platform and a
   * scheduled job that quietly stops is discovered by a volunteer saying
   * nobody wished them a happy birthday. Both are idempotent against a primary
   * key — see migration 037 — so running them on every render of every
   * dashboard is safe by construction rather than by luck.
   *
   * Sequenced ahead of portalSummary so that the unread count the bell shows
   * includes anything they have just been sent. Run in parallel with it, the
   * count would be read before the notification was written and today's
   * greeting would appear to arrive tomorrow.
   *
   * Both are caught. They are the kindest thing on the page and the least
   * important: a failure here must never turn somebody's dashboard into an
   * error, and the next render tries again.
   */
  const [birthdays] = await Promise.all([
    runBirthdays(user.id).catch((error) => {
      console.error('[account] birthdays', error);
      return { names: [] as string[] };
    }),
    runMilestones(user.id).catch((error) => console.error('[account] milestones', error)),
  ]);

  const [
    summary, application, account, rosterClaim, safeguarding, profile, photo, challenges,
    preferences,
  ] = await Promise.all([
    portalSummary(user.id),
    queryOne<{ id: string; status: string; submitted_at: Date | null }>(
      `SELECT id, status, submitted_at FROM volunteer_applications
        WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [user.id],
    ),
    queryOne<{ verified: Date | null }>(
      'SELECT email_verified_at AS verified FROM users WHERE id = $1',
      [user.id],
    ),
    claimForUser(user.id),
    queryOne<{ user_id: string }>(
      'SELECT user_id FROM safeguarding_records WHERE user_id = $1',
      [user.id],
    ),
    // For the hero: the membership number and the photograph that make the
    // page about a person rather than about an account.
    queryOne<{ member_number: number | null }>(
      'SELECT member_number FROM profiles WHERE user_id = $1',
      [user.id],
    ),
    queryOne<{ version: string }>(
      'SELECT version FROM profile_photos WHERE user_id = $1',
      [user.id],
    ),
    /* The shared goals, with this person's own part in each. The id goes in so
     * that the private line can be worked out; nothing comes back that names
     * anybody, here or anywhere else. */
    challengeBoard(user.id),
    /* What they asked not to hear about. Absence of a row means everything is
     * on — migration 010 settled that, and four hundred accounts rely on it. */
    queryOne<{ muted_topics: string[] | null }>(
      'SELECT muted_topics FROM notification_preferences WHERE user_id = $1',
      [user.id],
    ),
  ]);

  const hasOpenApplication = application ? APPLICATION_OPEN.includes(application.status) : false;

  /*
   * The prompt only makes sense for someone who is not a volunteer yet and has
   * not already claimed a roster line. Showing it to an accepted volunteer
   * would be inviting them to apply for what they already have.
   */
  const offerRosterClaim =
    !rosterClaim && !hasOpenApplication && !VOLUNTEER_STANDING.includes(user.membershipStatus);

  /*
   * A volunteer recognised from the roster never filled in an application, and
   * that is where the emergency contact used to be collected. Asked for here,
   * once they are actually a volunteer — not before, because a learner
   * browsing courses has no field activity to be safe at.
   */
  const needsSafeguarding =
    !safeguarding && VOLUNTEER_STANDING.includes(user.membershipStatus);
  const journey = summary.journey;
  const stage = journey?.currentStage ?? null;
  const next = journey?.nextAction ?? null;

  /*
   * Everything the page needs to decide what it is about, gathered in one
   * object and handed to a pure function. The page renders the answer; it does
   * not work it out itself — see lib/account-state.ts.
   */
  const facts: AccountFacts = {
    accountStatus: user.status as AccountFacts['accountStatus'],
    membershipStatus: user.membershipStatus,
    rosterClaimPending: Boolean(rosterClaim && !rosterClaim.approved_at),
    rosterOffered: offerRosterClaim,
    applicationOpen: hasOpenApplication,
    applicationRejected: application?.status === 'rejected',
    hasSafeguarding: Boolean(safeguarding),
    stageRequirement: next
      ? {
          stageNumber: next.stageNumber,
          label: lang === 'ar' ? next.requirement.labelAr : next.requirement.labelEn,
          courseSlug: next.requirement.courseSlug,
        }
      : null,
    courseInProgress: summary.coursesInProgress?.slug ?? null,
    coursesPassed: summary.coursesPassed,
    nextActivityId: summary.nextActivity?.id ?? null,
    isVolunteer: VOLUNTEER_STANDING.includes(user.membershipStatus),
  };
  const cardStatus = cardStatusOf({
    accountStatus: user.status,
    membershipStatus: user.membershipStatus,
    hasMemberNumber: profile?.member_number != null,
  });
  const audience = audienceOf(facts);
  const step = nextStepOf(facts);
  const otherTasks = otherTasksOf(facts);

  return (
    <Section>
      {/*
        * Wider than it was. At max-w-3xl the four impact tiles could never sit
        * in a row, so on a laptop the page was one narrow column of stacked
        * boxes with half the screen empty beside it.
        */}
      <Container className="max-w-5xl">
        {/* The hero carries the greeting, so there is no separate heading
            above it repeating the same name in a larger size. */}
        <DashboardHero
          lang={lang}
          dict={dict}
          userId={user.id}
          fullName={user.fullName}
          memberNumber={profile?.member_number ?? null}
          photoVersion={photo?.version ?? null}
          statusLabel={dict.account.statuses[user.membershipStatus as keyof typeof dict.account.statuses] ?? ''}
          cardStatus={cardStatus}
          stageNumber={stage?.number ?? null}
          stageTitle={stage ? (lang === 'ar' ? stage.titleAr : stage.titleEn) : null}
          stageTotal={journey?.stages.length ?? 6}
        />

        {account && !account.verified && (
          <VerifyBanner lang={lang} dict={dict} emailConfigured={isEmailConfigured()} />
        )}

        {/*
          * Whose day it is, on the day itself, and only for people who agreed
          * to be named. Renders nothing on every other day of the year, and
          * nothing for a volunteer who switched birthdays off.
          *
          * The names arriving here have already been through
          * publicBirthdayIdentity: no minor is among them whatever they chose,
          * and this page could not tell which of them is which if it tried.
          */}
        {!hidesPanel(preferences?.muted_topics, 'birthdays') && (
          <BirthdayBanner t={milestoneDictionaries[lang]} names={birthdays.names} />
        )}

        {/*
          * One card, not five.
          *
          * This used to render a safeguarding banner, a roster-claim offer and
          * a pending-claim notice independently, each deciding for itself
          * whether it applied — so somebody newly recognised from the roster
          * met three of them stacked, all shouting. account-state.ts picks the
          * one that actually blocks them; everything else drops to the quiet
          * list underneath.
          */}
        <PrimaryStep
          lang={lang}
          dict={dict}
          step={step}
          audience={audience}
          others={otherTasks}
          stageLabel={
            next ? (lang === 'ar' ? next.requirement.labelAr : next.requirement.labelEn) : null
          }
        />

        {/* Claimed but not yet confirmed keeps its own line, because the
            membership number is the reassuring part and the step card has no
            room for it. */}
        {rosterClaim && !rosterClaim.approved_at && (
          <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-2">
            {dict.account.claim.pendingBody.replace(
              '{number}',
              formatMemberNumber(rosterClaim.member_number),
            )}
          </p>
        )}

        {/*
          * Where they stand on a path that has an end.
          *
          * Was a thin bar and a bare percentage inside another identical box.
          * Six segments say something a percentage cannot: how far along a
          * journey of six stages this is, and that there is an end to reach.
          */}
        <div className="mt-6">
          <StageRail
            current={stage?.number ?? null}
            total={journey?.stages.length ?? 6}
            percent={stage?.percent ?? 0}
            isConfigured={stage?.isConfigured ?? false}
            label={stage ? (lang === 'ar' ? stage.titleAr : stage.titleEn) : null}
            dict={dict}
          />
          {!journey && (
            <p className="rounded-2xl border border-line bg-surface p-5 text-[0.98rem] leading-relaxed text-ink-2">
              {p.learnerNote}
            </p>
          )}
        </div>

        {/*
          * The four figures, as four things you can open.
          *
          * They were static boxes: the page said "3 activities" and gave
          * nowhere to go and look at the three.
          */}
        <div className="mt-6">
          <ImpactTiles
            lang={lang}
            dict={dict}
            verifiedMinutes={summary.verifiedMinutes}
            pendingMinutes={summary.pendingMinutes}
            coursesPassed={summary.coursesPassed}
            activitiesAttended={summary.activitiesAttended}
            certificates={summary.certificates}
          />
        </div>

        {/*
          * What the association is working towards, under what this one person
          * has done. Deliberately in that order: the tiles above are "you", and
          * this is "us" — and a volunteer who had a thin month should meet the
          * shared goal after their own figures, not instead of them.
          *
          * Renders nothing at all when no challenge is running. An empty box
          * saying there is nothing to work towards makes the page look broken.
          */}
        {/* Switched off on the settings page means switched off here. A
            preference that visibly does nothing teaches somebody that their
            preferences are decorative, and the next one they set they will not
            believe. */}
        {!hidesPanel(preferences?.muted_topics, 'challenges') && (
          <ChallengePanel lang={lang} t={challengeDictionaries[lang]} cards={challenges} />
        )}

        {summary.nextActivity && (
          <Panel title={p.upcomingTitle}>
            <p className="text-[1.05rem] font-extrabold">
              {lang === 'ar' ? summary.nextActivity.title_ar : summary.nextActivity.title_en}
            </p>
            {/*
              * Joined rather than concatenated, and no `dir="ltr"`.
              *
              * This printed a raw UTC ISO string — the wrong time, in the
              * wrong format, forced left-to-right inside Arabic prose. And
              * when an activity had no date yet, the ` · ` in front of the
              * location was still emitted, so the line read «مدينة طرابلس ·»
              * with a separator separating nothing.
              */}
            <p className="mt-1.5 text-[0.92rem] text-ink-2">
              {[
                summary.nextActivity.starts_at
                  ? formatDateTime(summary.nextActivity.starts_at, lang)
                  : dict.account.activities.interest.dateUnknown,
                summary.nextActivity.location,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <ArrowLink
              lang={lang}
              href={`/${lang}/account/activities`}
              label={dict.account.activities.mineTitle}
            />
          </Panel>
        )}

        {summary.coursesInProgress && (
          <Panel title={p.continueLearningTitle}>
            <p className="text-[1.05rem] font-extrabold">
              {COURSES.find((c) => c.slug === summary.coursesInProgress!.slug)?.title[lang] ??
                summary.coursesInProgress.slug}
            </p>
            {/* The player, at the unit they stopped on — /learn works that
                out. A course already in progress does not need re-describing. */}
            <ArrowLink
              lang={lang}
              href={`/${lang}/academy/${summary.coursesInProgress.slug}/learn`}
              label={p.continueCta}
            />
          </Panel>
        )}

        {summary.latestCertificateCode && (
          <Panel title={p.latestCertificate}>
            <p className="font-mono text-[1.05rem] font-bold tracking-wider" dir="ltr">
              {summary.latestCertificateCode}
            </p>
            <ArrowLink
              lang={lang}
              href={`/${lang}/verify/${summary.latestCertificateCode}`}
              label={dict.account.certificate.view}
            />
          </Panel>
        )}

        {/*
          The map, one tap from the landing page and carrying its own lede —
          the pills below are labels only, and "Your path map" on its own does
          not tell a volunteer what they would be opening.
        */}
        <Link
          href={`/${lang}/account/map` as Parameters<typeof Link>[0]['href']}
          className="mt-8 block rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-brand-orange hover:bg-surface-2"
        >
          <span className="block text-[1.05rem] font-extrabold">
            {dict.account.map.title}
            {/* U+2192 does not mirror: the bidi algorithm leaves it pointing
                right under dir="rtl", i.e. backwards. <Arrow> picks per locale. */}
            <Arrow lang={lang} />
          </span>
          <span className="mt-1.5 block max-w-[58ch] text-[0.92rem] leading-relaxed text-ink-2">
            {dict.account.map.lede}
          </span>
        </Link>

        {/*
          * Was a flat row of thirteen identical pills. Thirteen things of equal
          * weight is a list nobody reads — people were finding pages by
          * remembering where the button sat. Grouped by the question being
          * asked, with the two links that are not part of the account proper
          * (public opportunities, the staff area) kept out of the groups.
          */}
        <AccountGroups lang={lang} dict={dict} unread={summary.unreadNotifications} />

        <nav className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/${lang}/opportunities` as Parameters<typeof Link>[0]['href']}
            className="rounded-full border border-line px-5 py-2.5 text-[0.92rem] font-bold transition-colors hover:bg-surface-2"
          >
            {dict.account.activities.title}
          </Link>
          {isStaff(user) && (
            <Link
              href={`/${lang}/staff` as Parameters<typeof Link>[0]['href']}
              className="rounded-full border border-line px-5 py-2.5 text-[0.92rem] font-bold transition-colors hover:bg-surface-2"
            >
              {dict.account.staff.dashboard.title}
            </Link>
          )}
        </nav>

        <form action={logoutAction} className="mt-8">
          <input type="hidden" name="lang" value={lang} />
          <button
            type="submit"
            className="rounded-full border border-line px-5 py-2.5 text-[0.92rem] font-bold text-ink-2 transition-colors hover:bg-surface-2"
          >
            {t.logout}
          </button>
        </form>

        {/* Clears the fixed bottom bar on a phone, so the sign-out button is
            not sitting underneath it. */}
        <div aria-hidden className="h-20 lg:hidden" />
      </Container>

      <AccountBottomBar
        lang={lang}
        dict={dict}
        current="dashboard"
        unread={summary.unreadNotifications}
      />
    </Section>
  );
}

/**
 * The one thing being asked for, and the quiet list of everything else.
 *
 * Deliberately the loudest object on the page and the only one with a filled
 * button: when six cards all had a border and a call to action, none of them
 * was the answer to "what should I do?". The other tasks are links, not
 * buttons, because they are available rather than expected.
 */
function PrimaryStep({
  lang, dict, step, audience, others, stageLabel,
}: {
  lang: Locale;
  dict: Dictionary;
  step: Step;
  audience: Audience;
  others: StepKey[];
  stageLabel: string | null;
}) {
  const t = dict.account.step;

  // A stopped account is told so plainly, with nothing from the internal
  // record and no cheerful button underneath.
  if (audience === 'suspended' || audience === 'rejected') {
    return (
      <div className="mt-6 rounded-2xl border border-line bg-surface-2 p-6">
        <p className="text-[1rem] leading-relaxed text-ink-2">
          {audience === 'suspended' ? t.suspended : t.rejected}
        </p>
      </div>
    );
  }

  const title = t.titles[step.key].replace('{label}', stageLabel ?? '');

  return (
    <section
      aria-labelledby="next-step"
      className="mt-6 rounded-2xl border-2 border-brand-orange bg-brand-orange/10 p-6"
    >
      <h2 id="next-step" className="text-[0.78rem] font-extrabold tracking-[0.14em] text-ink-3">
        {t.heading}
      </h2>
      <p className="mt-2 text-[1.15rem] font-extrabold leading-snug">{title}</p>
      <Link
        href={`/${lang}${step.href}` as Parameters<typeof Link>[0]['href']}
        className="mt-4 inline-flex min-h-11 items-center rounded-full bg-brand-orange px-6 py-2.5 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
      >
        {t.ctas[step.key]} <Arrow lang={lang} />
      </Link>

      {others.length > 0 && (
        <div className="mt-5 border-t border-brand-orange/25 pt-4">
          <h3 className="text-[0.78rem] font-extrabold tracking-[0.14em] text-ink-3">
            {t.otherTasks}
          </h3>
          <ul className="mt-2 space-y-1">
            {others.map((key) => (
              <li key={key}>
                <Link
                  href={`/${lang}${nextStepHrefFor(key)}` as Parameters<typeof Link>[0]['href']}
                  className="inline-flex min-h-11 items-center text-[0.95rem] font-bold text-ink-2 underline decoration-line underline-offset-4 hover:text-ink"
                >
                  {t.titles[key].replace('{label}', stageLabel ?? '')}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** Where each secondary task goes. Kept beside the card that renders them. */
function nextStepHrefFor(key: StepKey): string {
  switch (key) {
    case 'safeguarding': return '/account/safeguarding';
    case 'claim-roster': return '/account/claim';
    case 'apply': return '/account/apply';
    case 'finish-course': return '/academy';
    case 'attend-activity': return '/account/activities';
    case 'find-activity': return '/account/activities';
    case 'start-learning': return '/academy';
    default: return '/account/notifications';
  }
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-[0.82rem] font-bold tracking-[0.11em] text-ink-3">{label}</p>
      <p className="mt-1.5 text-[1.35rem] font-extrabold">{value}</p>
      {note && <p className="mt-1 text-[0.8rem] text-ink-3">{note}</p>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-[0.82rem] font-bold tracking-[0.12em] text-ink-3">{title}</h2>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

/**
 * A panel's "go here" link. Named for what it is — a link — so it no longer
 * collides with the directional `<Arrow>` glyph imported from '@/components/ui',
 * which is what actually draws the mark now: the literal U+2192 that used to be
 * typed here does not mirror under dir="rtl", so it pointed away from the link
 * target in Arabic on all three panels.
 */
function ArrowLink({ lang, href, label }: { lang: Locale; href: string; label: string }) {
  return (
    <Link
      href={href as Parameters<typeof Link>[0]['href']}
      className="mt-3 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
    >
      {label}
      <Arrow lang={lang} />
    </Link>
  );
}

function NextLink({
  lang, dict, req,
}: {
  lang: Locale;
  dict: Dictionary;
  req: { kind: string; courseSlug: string | null };
}) {
  const j = dict.account.journey;
  const href = req.courseSlug
    ? `/${lang}/academy/${req.courseSlug}`
    : req.kind === 'hours'
      ? `/${lang}/opportunities`
      : null;
  if (!href) return null;

  return (
    <Link
      href={href as Parameters<typeof Link>[0]['href']}
      className="mt-4 inline-block rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
    >
      {req.courseSlug ? j.goToCourse : dict.account.activities.title} →
    </Link>
  );
}
