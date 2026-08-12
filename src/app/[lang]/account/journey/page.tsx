import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { journeyFor, type StageView, type RequirementView, type StageStatus } from '@/lib/journey';
import { formatDuration } from '@/lib/hours';

export async function generateMetadata(props: PageProps<'/[lang]/account/journey'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.journey.title,
    alternates: alternatesFor(lang, '/account/journey'),
    robots: { index: false, follow: false },
  };
}

export default async function JourneyPage(props: PageProps<'/[lang]/account/journey'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.journey;

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

  const journey = await journeyFor(user.id);

  // A learner. Not an error, and not a locked door — the academy is genuinely
  // open to them, so say that rather than showing six padlocks.
  if (!journey) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <Kicker>{t.kicker}</Kicker>
          <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
            {t.title}
          </h1>
          <p className="mt-4 rounded-2xl border border-line bg-surface p-6 text-[1.02rem] leading-relaxed text-ink-2">
            {t.notVolunteer}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/${lang}/account/apply`}
              className="rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
            >
              {t.notVolunteerCta}
            </Link>
            <Link
              href={`/${lang}/academy`}
              className="rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold hover:bg-surface-2"
            >
              {dict.nav.academy}
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

  const statusLabel: Record<StageStatus, string> = {
    locked: t.statusLocked,
    available: t.statusAvailable,
    in_progress: t.statusInProgress,
    requirements_completed: t.statusRequirementsCompleted,
    awaiting_approval: t.statusAwaitingApproval,
    completed: t.statusCompleted,
  };

  return (
    <Section>
      <Container className="max-w-3xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        {/* One next step, stated plainly, before the map. Someone who opens
            this page wants to know what to do, not to read a diagram. */}
        {journey.nextAction && (
          <div className="mt-8 rounded-2xl border-2 border-brand-orange bg-brand-orange/10 p-6">
            <p className="text-[0.82rem] font-extrabold tracking-[0.13em] text-brand-orange-text dark:text-brand-orange">
              {t.nextStep}
            </p>
            <p className="mt-2 text-[1.15rem] font-extrabold">
              {lang === 'ar'
                ? journey.nextAction.requirement.labelAr
                : journey.nextAction.requirement.labelEn}
            </p>
            <RequirementRemainder r={journey.nextAction.requirement} lang={lang} dict={dict} />
            <NextActionLink r={journey.nextAction.requirement} lang={lang} dict={dict} />
          </div>
        )}

        {journey.stages.length === 0 ? (
          <p className="mt-8 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.noStages}
          </p>
        ) : (
          <ol className="mt-10">
            {journey.stages.map((stage, i) => (
              <StageBlock
                key={stage.id}
                stage={stage}
                lang={lang}
                dict={dict}
                statusLabel={statusLabel[stage.status]}
                isLast={i === journey.stages.length - 1}
                isCurrent={journey.currentStage?.id === stage.id}
              />
            ))}
          </ol>
        )}

        <Link
          href={`/${lang}/account`}
          className="mt-10 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {dict.account.hours.backToAccount}
        </Link>
      </Container>
    </Section>
  );
}

function StageBlock({
  stage, lang, dict, statusLabel, isLast, isCurrent,
}: {
  stage: StageView;
  lang: Locale;
  dict: Dictionary;
  statusLabel: string;
  isLast: boolean;
  isCurrent: boolean;
}) {
  const t = dict.account.journey;
  const done = stage.status === 'completed';
  const locked = stage.status === 'locked';

  return (
    <li className="relative ps-12">
      {/* The line joining the stages. Not drawn past the last one. */}
      {!isLast && (
        <span
          aria-hidden
          className={`absolute start-[1.15rem] top-10 bottom-0 w-[2px] ${
            done ? 'bg-brand-orange' : 'bg-line'
          }`}
        />
      )}

      <span
        aria-hidden
        className={`absolute start-0 top-1 flex h-10 w-10 items-center justify-center rounded-full text-[0.95rem] font-extrabold ${
          done
            ? 'bg-brand-orange text-[#241503]'
            : locked
              ? 'border border-line bg-surface text-ink-3'
              : 'border-2 border-brand-blue bg-surface text-brand-blue dark:border-brand-orange dark:text-brand-orange'
        }`}
      >
        {done ? '✓' : locked ? '🔒' : stage.number}
      </span>

      <div className={`pb-10 ${locked ? 'opacity-60' : ''}`}>
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="text-[1.15rem] font-extrabold">
            {lang === 'ar' ? stage.titleAr : stage.titleEn}
          </h2>
          <span className="text-[0.82rem] font-bold text-ink-3">{statusLabel}</span>
          {isCurrent && (
            <span className="rounded-full bg-brand-blue px-2.5 py-0.5 text-[0.82rem] font-bold text-white dark:bg-brand-orange dark:text-[#241503]">
              {t.currentlyHere}
            </span>
          )}
        </div>

        {stage.completedAt && (
          <p className="mt-1 text-[0.85rem] text-ink-3">
            {t.completedOn} {new Date(stage.completedAt).toISOString().slice(0, 10)}
          </p>
        )}

        {!done && stage.requirements.length > 0 && (
          <>
            <div
              className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2"
              role="progressbar"
              aria-valuenow={stage.percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-brand-orange transition-[width]"
                style={{ width: `${stage.percent}%` }}
              />
            </div>
            <p className="mt-1.5 text-[0.85rem] font-bold text-ink-2">{stage.percent}%</p>
          </>
        )}

        {stage.requirements.length > 0 && (
          <>
            <p className="mt-5 text-[0.82rem] font-bold tracking-[0.12em] text-ink-3">
              {locked ? t.toUnlock : t.requirements}
            </p>
            <ul className="mt-2.5 space-y-2">
              {stage.requirements.map((r) => (
                <RequirementRow key={r.id} r={r} lang={lang} dict={dict} />
              ))}
            </ul>
          </>
        )}
      </div>
    </li>
  );
}

function RequirementRow({ r, lang, dict }: { r: RequirementView; lang: Locale; dict: Dictionary }) {
  const t = dict.account.journey;
  const partial = !r.satisfied && r.progress !== null && r.progress.current > 0;

  return (
    <li className="flex items-start gap-2.5 text-[0.96rem]">
      <span aria-hidden className="mt-0.5">
        {r.satisfied ? '✅' : partial ? '🟠' : '⬜'}
      </span>
      <span className={r.satisfied ? 'text-ink-2' : ''}>
        {lang === 'ar' ? r.labelAr : r.labelEn}
        {!r.isRequired && <span className="ms-1.5 text-ink-3">({t.optional})</span>}
        {!r.satisfied && <RequirementRemainder r={r} lang={lang} dict={dict} inline />}
      </span>
    </li>
  );
}

/** How much is left, in the unit the person thinks in. */
function RequirementRemainder({
  r, lang, dict, inline = false,
}: {
  r: RequirementView;
  lang: Locale;
  dict: Dictionary;
  inline?: boolean;
}) {
  if (!r.progress) return null;
  const { current, target, unit } = r.progress;
  const left = Math.max(0, target - current);
  if (left === 0) return null;

  const text =
    unit === 'minutes'
      ? `${formatDuration(current, lang)} / ${formatDuration(target, lang)} — ${formatDuration(left, lang)} ${dict.account.journey.remaining}`
      : `${current}% / ${target}%`;

  return inline ? (
    <span className="ms-2 text-[0.88rem] font-bold text-ink-2">{text}</span>
  ) : (
    <p className="mt-2 text-[0.95rem] font-bold text-ink-2">{text}</p>
  );
}

function NextActionLink({ r, lang, dict }: { r: RequirementView; lang: Locale; dict: Dictionary }) {
  const t = dict.account.journey;

  if (r.courseSlug) {
    return (
      <Link
        href={`/${lang}/academy/${r.courseSlug}`}
        className="mt-4 inline-block rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
      >
        {t.goToCourse} →
      </Link>
    );
  }

  if (r.kind === 'hours') {
    return (
      <Link
        href={`/${lang}/account/hours`}
        className="mt-4 inline-block rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
      >
        {t.logHours} →
      </Link>
    );
  }

  return null;
}
