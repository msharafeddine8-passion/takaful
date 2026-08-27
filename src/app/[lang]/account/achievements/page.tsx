import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Arrow, Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { formatDuration } from '@/lib/format';
import { credentialView } from '@/lib/credential-view';
import { plural, type PluralForms } from '@/lib/dictionaries/lms';
import { awardBadgeFor } from '@/lib/dictionaries/awards';
import { leaderboardStrings } from '@/lib/dictionaries/leaderboard';
import { emptyStates } from '@/lib/dictionaries/empty-states';
import {
  recomputeAchievements,
  achievementHistory,
  achievementByCode,
  standingFor,
  nextUp,
  type AchievementKind,
} from '@/lib/achievements';
import { rolesFor, viewerOf } from '@/lib/volunteer-roles';
import { roleTitle } from '@/lib/volunteer-role-view';
import { volunteerRoleStrings } from '@/lib/dictionaries/volunteer-roles';
import { RoleChips } from '@/components/RoleChips';

/**
 * The badge wall, and — since the client asked for it — what the volunteer
 * currently IS, in the same shapes, at the top of it.
 *
 * A role is not an achievement and must never become one: nothing recomputes
 * it, nothing thresholds it, and lib/achievements.ts knows nothing about the
 * roles table. What the two share is the question a volunteer opens this page
 * to ask — "what does the association hold about me?" — and answering half of
 * it here and the other half on a page they have to go and find is how the
 * roles feature ended up feeling like a separate product.
 *
 * The chips go ABOVE the badge grid rather than under it. A responsibility
 * somebody was handed outranks a figure an engine reached, and the first thing
 * on the page should be the thing the association would say about them out
 * loud.
 *
 * viewerOf(user) and never ANONYMOUS: this is the reader's own record, so they
 * get the volunteer tier — the same answer /account/roles gives, from the same
 * function, so the two screens cannot disagree about which of their roles they
 * are allowed to know about.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/account/achievements'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.achievements.title,
    alternates: alternatesFor(lang, '/account/achievements'),
    robots: { index: false, follow: false },
  };
}

export default async function AchievementsPage(
  props: PageProps<'/[lang]/account/achievements'>,
) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.achievements;
  const nothing = emptyStates(lang).achievements;

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
   * Recomputed on the way in. There is no scheduler in this project, and a
   * badge that waits for a background job nobody runs is a badge that arrives
   * whenever somebody happens to log hours next. It is one query and a write
   * only when something changed.
   */
  await recomputeAchievements(user.id).catch(() => {});

  const [history, standing, roles] = await Promise.all([
    achievementHistory(user.id),
    standingFor(user.id),
    rolesFor(user.id, viewerOf(user)),
  ]);

  /* Current only. What somebody held before is a timeline and belongs on the
     page that is one — a row of chips cannot say «من ٢٠٢١ حتى ٢٠٢٣», and a past
     role rendered without its dates is a claim about the present. `filter` and
     never `sort`: rolesFor already returned current first. */
  const roleNames = roles
    .filter((role) => role.isCurrent)
    .map((role) => roleTitle(role, lang));
  const roleText = volunteerRoleStrings(lang);

  const live = history.filter((a) => a.revoked_at === null);
  const withdrawn = history.filter((a) => a.revoked_at !== null);
  const heldCodes = new Set(live.map((a) => a.code));
  const coming = nextUp(standing, heldCodes);

  return (
    <Section>
      <Container className="max-w-3xl">
        <Kicker>{dict.account.dashboard.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[60ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        {/* Renders nothing at all when there is nothing held — see RoleChips.
            Most volunteers hold no role, and «لا مناصب» above a wall of badges
            would mark them rather than inform them. */}
        <RoleChips
          titles={roleNames}
          heading={roleText.mine.currentHeading}
          className="mt-6"
        />

        {live.length === 0 ? (
          /*
           * A wall with nothing on it, said as a mechanism rather than as a
           * score. «لم تحصل على أي إنجاز بعد» makes the emptiness a property of
           * the reader; this names the three things that grant a badge and says
           * they arrive without being asked for.
           *
           * The «القادم» list below is left exactly as it is and is the reason
           * this sentence can stay short: for somebody with no badges it is
           * already a list of what the first ones take, each with its own bar
           * at the bottom. Those bars sitting at zero are honest — they are
           * counters that climb, and reading «باقي {n}» is worth more than a
           * second paragraph here.
           */
          <div className="mt-8">
            <p className="max-w-[70ch] rounded-xl border border-line bg-surface-2 px-5 py-4 leading-relaxed text-ink-2">
              {nothing.never}
            </p>
            <Link
              href={`/${lang}/opportunities`}
              className="mt-4 inline-flex min-h-11 items-center font-bold text-brand-blue hover:underline dark:text-brand-orange"
            >
              {nothing.browse}
              <Arrow lang={lang} />
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {live.map((a) => {
              /*
               * The catalogue first, then the monthly awards.
               *
               * A badge like `award-volunteer-2026-08` is granted by a person
               * deciding, not by the engine, so it is deliberately not in
               * ACHIEVEMENTS — a recompute must never withdraw a decision. It
               * still belongs on the wall of the volunteer who was chosen, and
               * without this fallback it rendered as nothing at all: the
               * catalogue does not know the code, and the branch below quietly
               * returned null for the one badge somebody was told about.
               *
               * awardBadgeFor returns the same three fields this template
               * reads, so neither module learns the other's internals.
               */
              const def = achievementByCode(a.code) ?? awardBadgeFor(a.code);
              if (!def) return null;
              return (
                <li
                  key={a.code}
                  className="rounded-2xl border border-line bg-surface p-5"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-[2rem] leading-none" aria-hidden>
                      {def.icon}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-[1.05rem] font-extrabold">{def.title[lang]}</h2>
                      <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink-2">
                        {def.description[lang]}
                      </p>
                      <p className="mt-2.5 text-[0.82rem] text-ink-3">
                        {t.earnedOn}{' '}
                        <span dir="ltr">
                          {new Date(a.earned_at).toISOString().slice(0, 10)}
                        </span>
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {coming.length > 0 && (
          <section className="mt-10">
            <h2 className="text-[0.82rem] font-extrabold tracking-[0.12em] text-ink-3">
              {t.nextTitle}
            </h2>
            <ul className="mt-4 space-y-3">
              {coming.map((n) => {
                const percent = Math.min(
                  100,
                  Math.round((n.current / n.def.threshold) * 100),
                );
                return (
                  <li key={n.def.code} className="rounded-2xl border border-line bg-surface p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-extrabold">
                        <span aria-hidden>{n.def.icon}</span> {n.def.title[lang]}
                      </span>
                      <span className="text-[0.85rem] font-bold text-ink-3">
                        {remaining(n.def.kind, n.remaining, lang, {
                          ...t,
                          remainingLevels: dict.account.map.remainingLevels,
                        })}
                      </span>
                    </div>
                    <div
                      className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-surface-2"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={n.def.title[lang]}
                    >
                      <div
                        className="h-full rounded-full bg-brand-blue"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Kept visible rather than hidden. A badge that was held and then lost
            is part of someone's record, and quietly disappearing it is how a
            volunteer stops trusting the rest of the numbers. */}
        {withdrawn.length > 0 && (
          <section className="mt-10">
            <h2 className="text-[0.82rem] font-extrabold tracking-[0.12em] text-ink-3">
              {t.showRevoked}
            </h2>
            <p className="mt-2 max-w-[58ch] text-[0.88rem] leading-relaxed text-ink-3">
              {t.revokedNote}
            </p>
            <ul className="mt-4 space-y-2">
              {withdrawn.map((a) => {
                // Same fallback as the live list above. A monthly award that
                // was withdrawn has to be visible here for the same reason
                // every other withdrawn badge is: history is part of the
                // record, and a badge that vanishes makes the rest suspect.
                const def = achievementByCode(a.code) ?? awardBadgeFor(a.code);
                if (!def) return null;
                /*
                 * The same presenter the map, /verify and /verify/[code] use,
                 * so "withdrawn" is one word with one spelling everywhere. An
                 * EarnedAchievement carries revoked_at and revoke_reason under
                 * exactly the names credentialView reads.
                 *
                 * The strike-through stays, but it is no longer carrying the
                 * meaning on its own: a line through text is invisible to a
                 * screen reader and easy to miss at small sizes, so the state
                 * is now also a word.
                 */
                const view = credentialView(a, dict.account.map, lang);
                return (
                  <li
                    key={a.code}
                    className="flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-xl border border-line bg-surface-2 px-5 py-3.5 text-[0.92rem] text-ink-3"
                  >
                    <span aria-hidden>{def.icon}</span>
                    <span className="font-bold line-through">{def.title[lang]}</span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[0.8rem] font-extrabold ${view.tone}`}
                    >
                      {view.statusLabel}
                    </span>
                    {view.revokedOn && <span>{view.revokedOn}</span>}
                    {a.revoke_reason && <span>— {a.revoke_reason}</span>}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/*
          * The way in to the impact boards.
          *
          * Here rather than in the account navigation because the nav's labels
          * live in dictionaries/ar.ts and en.ts, and this feature carries its
          * own strings on purpose — see the header of dictionaries/leaderboard.ts.
          * A badge wall and a ranking answer the same question a volunteer is
          * asking, so this is where somebody already is when they want it.
          */}
        <p className="mt-10 text-[0.95rem] text-ink-2">
          <Link
            href={`/${lang}/account/leaderboard` as Parameters<typeof Link>[0]['href']}
            className="inline-flex min-h-11 items-center rounded-full border border-line px-5 font-extrabold transition-colors hover:border-brand-orange hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
          >
            {leaderboardStrings(lang).title}
          </Link>
        </p>
      </Container>
    </Section>
  );
}

/**
 * Hours read as a duration; the others need their own noun. "4 to go" says
 * nothing about what four of, and in Arabic a bare number reads worse still.
 */
function remaining(
  kind: AchievementKind,
  value: number,
  lang: Locale,
  t: {
    remainingHours: string;
    /* Declined per number rather than held as one template: "1 levels to go"
       is what the last-level case used to render, and Arabic needs four more
       forms than English does. See the plural() header in dictionaries/lms.ts.

       Every kind below is now declined the same way, and for the same reason:
       these badges have thresholds of 1, 3, 5, 10 and 20, so the remainder is
       as often one or two as it is many, and «باقي 1 دورات» was rendering at
       the commonest value of all. `remainingLevels` is authored in
       dictionaries/lms.ts alongside the rest of the level-badge copy; the
       other five live in the achievements namespace with their siblings. */
    remainingCourses: PluralForms;
    remainingActivities: PluralForms;
    remainingCertificates: PluralForms;
    remainingYears: PluralForms;
    remainingStages: PluralForms;
    remainingLevels: PluralForms;
  },
): string {
  if (kind === 'hours') return t.remainingHours.replace('{n}', formatDuration(value, lang));

  /*
   * A switch rather than a chain ending in a catch-all.
   *
   * It fell through to the stages wording for anything it did not recognise,
   * so the moment certificate and membership badges arrived, somebody four
   * certificates short was told they were four stages short. A default that
   * guesses is worse than one that says nothing: a wrong sentence is believed,
   * a missing one is asked about.
   */
  switch (kind) {
    // The Arabic one/two forms spell the count as a word and carry no {n} at
    // all; replace() on a template without the placeholder is a no-op.
    case 'courses':
      return plural(t.remainingCourses, value, lang).replace('{n}', String(value));
    case 'activities':
      return plural(t.remainingActivities, value, lang).replace('{n}', String(value));
    case 'certificates':
      return plural(t.remainingCertificates, value, lang).replace('{n}', String(value));
    case 'membership':
      return plural(t.remainingYears, value, lang).replace('{n}', String(value));
    case 'stages':
      return plural(t.remainingStages, value, lang).replace('{n}', String(value));
    case 'levels':
      return plural(t.remainingLevels, value, lang).replace('{n}', String(value));
    default:
      /* The yes-or-no kinds. nextUp produces no hint for them — there is
       * nothing to count towards — so this is unreachable by design, and says
       * nothing rather than inventing a unit if it is ever reached. */
      return '';
  }
}
