import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { programmeStanding } from '@/lib/programme/standing';
import { buildMapModel } from '@/lib/programme/journey-map';
import { skillMap } from '@/lib/programme/skills';
import { levelBadgeStanding } from '@/lib/programme/level-badges';
import { formatPercent } from '@/lib/format';
import { ProgressRing } from '@/components/lms/ProgressRing';
import { JourneyMap } from '@/components/lms/JourneyMap';
import { SkillMap } from '@/components/lms/SkillMap';
import { NextCertificate } from '@/components/lms/NextCertificate';
import { BadgeWall } from '@/components/lms/BadgeWall';
import { Celebration } from '@/components/lms/Celebration';

export async function generateMetadata(props: PageProps<'/[lang]/account/map'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.map.title,
    alternates: alternatesFor(lang, '/account/map'),
    // A learner's own progress. Nothing here belongs in a search index.
    robots: { index: false, follow: false },
  };
}

/**
 * The path map.
 *
 * Built on the programme — orientation station plus levels 1-6 — and not on
 * the six journey stages. Those are a different progression: the association
 * awards them, and they move on hours, attendance and a supervisor's
 * signature. They live at /account/journey and always will.
 *
 * (The original reason given here was that the stages had no requirements and
 * so all computed 100%. That was true and is not any more — migration 025
 * filled them in. The separation stands on its own merits: courses are not
 * what moves a volunteer through the ranks, and one page implying they are
 * would teach four hundred people something false.)
 *
 * One database call. programmeStanding() already assembles levels, per-course
 * lock reasons and certificates from a single gate snapshot; the map model,
 * the skill map and the badge standing are all pure functions over it.
 *
 * The order answers the questions a volunteer actually asks, in the order they
 * ask them: how far am I, what just happened, what am I working towards, where
 * does the path go, what have I built, what have I been given.
 */
export default async function MapPage(props: PageProps<'/[lang]/account/map'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.map;

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

  const standing = await programmeStanding(user.id);
  const model = buildMapModel(standing);
  const skills = skillMap(standing);
  const badges = levelBadgeStanding(standing);

  /*
   * What to celebrate: the highest level whose badge has just been earned.
   * The component itself decides whether it has already been dismissed — it
   * remembers that per badge code in localStorage — so this only has to name
   * the most recent thing worth marking.
   */
  const celebrate = [...badges].filter((b) => b.earned).sort((a, b) => b.levelNumber - a.levelNumber)[0] ?? null;

  const overallValue = t.ringValue
    .replace('{done}', String(model.overall.passed))
    .replace('{total}', String(model.overall.total));

  return (
    <>
      <div className="border-b border-line bg-brand-blue-deep text-white">
        <Container className="py-10 sm:py-14">
          {/* Points at the volunteer journey now. It used to point at
              /account/path, which redirects here — the breadcrumb led back to
              the page you were already on. */}
          <nav aria-label={t.breadcrumb}>
            <Link
              href={`/${lang}/account/journey` as Parameters<typeof Link>[0]['href']}
              className="inline-flex min-h-11 items-center text-[0.88rem] font-bold text-on-deep-2 hover:text-white"
            >
              {dict.account.nav.journey}
            </Link>
          </nav>

          {/* Ring under the text on a phone, beside it from sm up. No fixed
              widths — the text column simply takes what is left. */}
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              {/* The tracking is for the Latin wordmark. globals.css drops
                  letter-spacing entirely under html[lang="ar"] — 0.16em on the
                  Arabic organisation name would break the joins between its
                  letters, which is a spelling error, not a style. */}
              <p className="text-[0.82rem] font-extrabold tracking-[0.16em] text-on-deep-2">
                {dict.meta.siteName}
              </p>
              <h1 className="mt-3 text-[clamp(1.8rem,1.4rem+2.2vw,2.8rem)] font-black leading-tight tracking-tight">
                {t.title}
              </h1>
              <p className="mt-4 max-w-[58ch] text-[1.05rem] leading-relaxed text-on-deep">
                {t.lede}
              </p>
              <p className="mt-4 text-[0.95rem] font-bold text-on-deep">
                {t.overallLabel}: <span dir="ltr" className="tabular">{overallValue}</span>
              </p>
            </div>

            <ProgressRing
              percent={model.overall.percent}
              label={t.overallLabel}
              valueText={overallValue}
              size="lg"
              tone="orange"
              lang={lang}
            >
              {/* A localised percentage. Not wrapped in dir="ltr": it is
                  already written in the direction of its own locale, and
                  forcing it would put ٪ on the wrong side. */}
              <span className="tabular">{formatPercent(model.overall.percent, lang)}</span>
            </ProgressRing>
          </div>
        </Container>
      </div>

      <Section>
        <Container className="max-w-4xl">
          <Celebration
            badge={celebrate}
            lang={lang}
            strings={{
              celebrationTitle: t.celebrationTitle,
              celebrationBody: t.celebrationBody,
              celebrationDismiss: t.celebrationDismiss,
              celebrationViewCertificate: t.celebrationViewCertificate,
              badgeEarned: t.badgeEarned,
            }}
            certificateHref={
              celebrate?.certificateCode ? `/${lang}/verify/${celebrate.certificateCode}` : null
            }
          />

          <div className="mt-8">
            <NextCertificate next={model.nextCertificate} lang={lang} t={t} />
          </div>

          <div className="mt-12">
            <JourneyMap
              model={model}
              lang={lang}
              t={t}
              tPath={dict.account.path}
              badges={badges}
            />
          </div>

          <div className="mt-12">
            <SkillMap skills={skills} lang={lang} t={t} />
          </div>

          {/* BadgeWall carries its own top margin. */}
          <BadgeWall
            badges={badges}
            lang={lang}
            t={t}
            viewCertificateLabel={dict.account.path.viewCertificate}
          />
        </Container>
      </Section>
    </>
  );
}
