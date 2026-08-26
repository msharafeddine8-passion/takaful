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
import { projectsAdmin } from '@/lib/dictionaries/projects-admin';
import { partners } from '@/lib/dictionaries/partners';
import { staffHub } from '@/lib/dictionaries/staff-hub';

/**
 * Where a member of staff arrives, and what they can see from it.
 *
 * ── THE ROW OF EIGHTEEN PILLS IS GONE ──────────────────────────────────────
 *
 * It was a flat `flex-wrap` of identical rounded buttons, and eighteen things
 * of equal weight is a list nobody reads: people found a screen by remembering
 * where its button sat, which is not navigation — it is recall, and it fails the
 * moment a nineteenth arrives and shifts the row. The volunteer side had exactly
 * this problem and exactly this fix; components/account/AccountNav.tsx is the
 * precedent and its header carries the argument in full.
 *
 * So the page now reads in three tiers, in the order somebody actually needs
 * them: what is WAITING FOR A DECISION (the two queue cards, unchanged), then
 * the figures, then everything else grouped under six headings named for what
 * the reader came looking for. The groups are built as data below rather than
 * written out as JSX, so a screen added to the association appears in one array
 * entry and cannot land in the wrong place by being pasted in the wrong div.
 *
 * ── TWO SCREENS ARE DELIBERATELY NOT LISTED ────────────────────────────────
 *
 * /staff/groups (committees and teams) and /staff/profile-fields (the custom
 * field definitions) HAVE BEEN REMOVED FROM THIS HUB ON PURPOSE. DO NOT ADD
 * THEM BACK because they look missing — they are missing, and that is the fix.
 *
 * The client, who is the administrator this page is for, said in as many words
 * that committees, teams and custom fields were the parts of this platform that
 * had become complicated and confusing, and asked for less. Nothing was deleted
 * to answer that: both routes still exist, still work, still enforce the same
 * capabilities, and everything either of them ever wrote is still in the
 * database and still rendered wherever it was rendered before. A role attached
 * to a committee still shows its link; a custom field with a value still shows
 * on the member page. They simply stopped being advertised on the one screen
 * every member of staff opens first, so that the fourteen things people use are
 * not sitting beside two things one person configured once.
 *
 * They remain reachable by URL — /staff/groups and /staff/profile-fields — and
 * that is the whole of the change. If the association later wants either back
 * on the hub, the right move is to ask the client first and then add an entry to
 * the `groups` array below, not to conclude from an empty-looking hub that
 * somebody forgot.
 */

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

  /*
   * The hub, as data.
   *
   * Every entry carries its own `show`, which is the same capability check the
   * links carried when they were a flat row — nothing was loosened and nothing
   * was tightened by the regrouping. Empty groups are dropped below, so a
   * trainer who holds only `practical.review` sees one heading and one link
   * rather than six headings and five empty columns.
   *
   * Labels come from each feature's own dictionary module, exactly as before;
   * only the six GROUP headings are new, and they live in
   * dictionaries/staff-hub.ts for the reason its header gives.
   */
  const g = staffHub(lang).groups;
  const at = (path: string) => `/${lang}/staff${path}`;
  const groups: { title: string; items: { href: string; label: string; show: boolean }[] }[] = [
    {
      /* The people, and the two lists of them. The applications queue is not
         here: it is a decision waiting, and it is a card at the top. */
      title: g.volunteers,
      items: [
        {
          href: at('/roster'),
          label: dict.account.staff.roster.title,
          show: can(user, 'applications.review'),
        },
        { href: at('/members'), label: d.goMembers, show: can(user, 'members.manage') },
      ],
    },
    {
      /* Where the volunteering actually happens. Projects sits here rather than
         under the public pages because the screen's subject is who has taken
         charge of what — the same roles table read against a different noun,
         which is why lib/actions/projects.ts gates it on members.manage — and
         putting a project on the public site is a consequence of running one. */
      title: g.field,
      items: [
        {
          href: at('/activities'),
          label: dict.account.activities.manageTitle,
          show: can(user, 'activities.manage'),
        },
        {
          href: at('/projects'),
          label: projectsAdmin(lang).title,
          show: can(user, 'members.manage'),
        },
      ],
    },
    {
      /* Five screens, three capabilities, one heading — because «الأكاديمية» is
         what the association calls the whole of its training and a coordinator
         looking for any of these is looking for that. The two `practical.review`
         entries are the only things under /staff an `instructor` can reach at
         all; see the note on isStaff() in lib/authz.ts for why losing them from
         this page would mean losing them entirely. */
      title: g.academy,
      items: [
        {
          href: at('/challenges'),
          label: challengeDictionaries[lang].manageTitle,
          show: can(user, 'challenges.manage'),
        },
        {
          href: at('/practical'),
          label: practical(lang).goQueue,
          show: can(user, 'practical.review'),
        },
        {
          href: at('/decision-runs'),
          label: challengeLevels(lang).staff.goQueue,
          show: can(user, 'practical.review'),
        },
        {
          href: at('/journey'),
          label: t.journeyBuilder.title,
          show: can(user, 'members.manage'),
        },
        {
          /* Gated on programme.edit rather than reports.read because the page is
             a list of things to go and rewrite — see the header of
             app/[lang]/staff/learning/page.tsx. */
          href: at('/learning'),
          label: learningAnalytics(lang).title,
          show: can(user, 'programme.edit'),
        },
      ],
    },
    {
      title: g.recognition,
      items: [
        {
          href: at('/recognition'),
          label: recognitionAdmin(lang).title,
          show: can(user, 'members.manage'),
        },
        {
          /* Deliberately not gated. The monthly shortlist is meant to be argued
             over in a room, and a field supervisor who cannot press the button
             can still say whose month it was. The decision forms themselves are
             gated on awards.decide inside the page. */
          href: at('/awards'),
          label: awardDictionaries[lang].manageTitle,
          show: true,
        },
      ],
    },
    {
      /* One entry, and it earns its own heading. A partner is public content
         about the association and not a record about a person — nothing in that
         feature writes or reads a volunteer_role, which is why
         lib/actions/partners.ts gates it on challenges.manage and not on
         members.manage. Filing it with the members' screens would put the one
         button on this page that publishes to strangers in among the ones that
         do not. */
      title: g.publicPages,
      items: [
        {
          href: at('/partners'),
          label: partners(lang).staffTitle,
          show: can(user, 'challenges.manage'),
        },
      ],
    },
    {
      title: g.records,
      items: [
        { href: at('/reports'), label: dict.account.reports.title, show: can(user, 'reports.read') },
        { href: at('/audit'), label: d.goAudit, show: can(user, 'audit.read') },
      ],
    },
  ];

  const visible = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => item.show) }))
    .filter((group) => group.items.length > 0);

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

        {/*
          * The rest of the hub, grouped and named.
          *
          * A <nav> with a heading per group, laid out the same way
          * AccountGroups does it on the volunteer dashboard — one column at
          * 375px, two from sm, three from lg — so the two halves of this
          * platform navigate alike. Each link is min-h-11 (44px) and the
          * groups collapse to a single readable column on a phone; nothing
          * here has a min-width, so the page never scrolls sideways.
          *
          * Rendered from `visible`, which has already dropped the entries this
          * reader has no capability for and then dropped any heading left with
          * nothing under it.
          */}
        <nav aria-label={staffHub(lang).navLabel} className="mt-12">
          <p className="max-w-[62ch] text-[0.92rem] text-ink-3">{staffHub(lang).groupsLede}</p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((group) => (
              <div key={group.title}>
                <h2 className="mb-2 text-[0.74rem] font-extrabold tracking-[0.14em] text-ink-3">
                  {group.title}
                </h2>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href as Parameters<typeof Link>[0]['href']}
                        className="flex min-h-11 items-center rounded-xl px-3.5 py-2.5 text-[0.94rem] font-semibold text-ink-2 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
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
