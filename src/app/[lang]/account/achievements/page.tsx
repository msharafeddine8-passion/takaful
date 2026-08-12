import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { formatDuration } from '@/lib/hours';
import {
  recomputeAchievements,
  achievementHistory,
  achievementByCode,
  standingFor,
  nextUp,
  type AchievementKind,
} from '@/lib/achievements';

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

  const [history, standing] = await Promise.all([
    achievementHistory(user.id),
    standingFor(user.id),
  ]);

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

        {live.length === 0 ? (
          <div className="mt-8">
            <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 leading-relaxed text-ink-2">
              {t.empty}
            </p>
            <Link
              href={`/${lang}/opportunities`}
              className="mt-4 inline-block rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
            >
              {t.emptyCta} →
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {live.map((a) => {
              const def = achievementByCode(a.code);
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
                      <p className="mt-2.5 text-[0.78rem] text-ink-3">
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
                        {remaining(n.def.kind, n.remaining, lang, t)}
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
                const def = achievementByCode(a.code);
                if (!def) return null;
                return (
                  <li
                    key={a.code}
                    className="rounded-xl border border-line bg-surface-2 px-5 py-3.5 text-[0.92rem] text-ink-3"
                  >
                    <span aria-hidden>{def.icon}</span>{' '}
                    <span className="font-bold line-through">{def.title[lang]}</span>
                    {a.revoke_reason && <span className="ms-2">— {a.revoke_reason}</span>}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
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
    remainingCourses: string;
    remainingActivities: string;
    remainingStages: string;
  },
): string {
  if (kind === 'hours') return t.remainingHours.replace('{n}', formatDuration(value, lang));
  const template =
    kind === 'courses'
      ? t.remainingCourses
      : kind === 'activities'
        ? t.remainingActivities
        : t.remainingStages;
  return template.replace('{n}', String(value));
}
