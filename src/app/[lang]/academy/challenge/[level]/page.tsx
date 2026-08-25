import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { countPhrase } from '@/lib/when';
import { courseBySlug } from '@/lib/courses';
import { challengeLevels } from '@/lib/dictionaries/challenge-levels';
import {
  challengeForLevel,
  coursesTouched,
  shownChoices,
  uniformDepth,
  walk,
  type Outcome,
  type Walked,
} from '@/lib/programme/level-challenge';
import { levelIsComplete, openRun, finishedRuns } from '@/lib/level-challenge-runs';
import { startRunAction, decideAction } from '@/lib/actions/level-challenge';

/**
 * The decision run for one level, on its own screen.
 *
 * Server-rendered end to end, with a plain form per option and no client
 * component anywhere. That is not minimalism for its own sake: the option order
 * is decided by the server from the stored seed, and the server has to be the
 * thing that reads a decision back against the arrangement it actually showed.
 * A client component holding the choices in state would be a second copy of the
 * paper, and the two would eventually disagree.
 *
 * It is also the reason a reload is safe. Every screen here is a pure function
 * of a stored row, so refreshing, reopening on a different phone, or coming
 * back next week all land on the same situation with the same options in the
 * same places.
 *
 * NOTHING ON THIS PAGE IS A WALL. It is reachable only for a level the learner
 * has already completed, it awards nothing, and not opening it changes no
 * certificate, no badge and no stage.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/academy/challenge/[level]'>,
): Promise<Metadata> {
  const { lang, level } = await props.params;
  if (!isLocale(lang)) return {};
  const def = challengeForLevel(Number(level));
  if (!def) return {};
  return {
    title: def.title[lang],
    alternates: alternatesFor(lang, `/academy/challenge/${level}`),
    // A learner's own rehearsal. Nothing here belongs in a search index.
    robots: { index: false, follow: false },
  };
}

export default async function LevelChallengePage(
  props: PageProps<'/[lang]/academy/challenge/[level]'>,
) {
  await connection();
  const { lang, level: levelParam } = await props.params;
  if (!isLocale(lang)) notFound();

  /* A level that is not 1-6, or one with no run authored, is a 404 rather than
     an empty screen — a stale link should say so. */
  if (!/^[1-6]$/.test(levelParam)) notFound();
  const level = Number(levelParam);
  const def = challengeForLevel(level);
  if (!def) notFound();

  const dict = getDictionary(lang);
  const t = challengeLevels(lang);
  const total = uniformDepth(def) ?? def.steps.length;

  const shell = (children: React.ReactNode) => (
    <Section>
      <Container className="max-w-3xl">
        <Kicker>{t.screenTitle}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {def.title[lang]}
        </h1>
        {children}
      </Container>
    </Section>
  );

  if (!isDbConfigured()) {
    return shell(
      <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
        {dict.account.errors.dbUnavailable}
      </p>,
    );
  }

  const user = await currentUser();
  if (!user) {
    return shell(
      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <p className="text-[1rem] leading-relaxed text-ink-2">{t.signIn}</p>
        <Link
          href={`/${lang}/login` as Parameters<typeof Link>[0]['href']}
          className="mt-3 inline-flex min-h-11 items-center font-extrabold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {dict.account.academy.signInCta} →
        </Link>
      </div>,
    );
  }

  /*
   * The gate, before anything else is fetched. It is not a new rule — it reads
   * the same passes gate.ts reads — and it sits behind an achievement rather
   * than in front of one, so refusing here takes nothing away from anybody.
   */
  if (!(await levelIsComplete(user.id, level))) {
    return shell(
      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <p className="text-[1.05rem] font-extrabold">{t.notYet}</p>
        <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-2">{t.notYetBody}</p>
        <Link
          href={`/${lang}/academy` as Parameters<typeof Link>[0]['href']}
          className="mt-4 inline-flex min-h-11 items-center font-extrabold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {dict.nav.academy} →
        </Link>
      </div>,
    );
  }

  const [open, done] = await Promise.all([
    openRun(user.id, level),
    finishedRuns(user.id, level),
  ]);
  const latest = done[0] ?? null;

  // ---------------------------------------------------------------- running
  if (open) {
    const path = walk(def, open.seed, open.decisions);
    if (path.ok && path.current) {
      const step = path.current;
      /*
       * The arrangement comes from the engine, seeded by the stored run, so the
       * options sit where they sat when the page was last opened — and where
       * the server will expect them when the decision comes back.
       */
      const shown = shownChoices(step, open.seed);
      return shell(
        <>
          <OptionalNote t={t} />
          <p className="mt-6 text-[0.85rem] font-bold tracking-[0.12em] text-ink-3">
            {t.decisionOf
              .replace('{n}', String(open.decisions.length + 1))
              .replace('{total}', String(total))}
          </p>

          {/* What has already happened, so the situation reads in context. */}
          {path.walked.length > 0 && <SoFar walked={path.walked} lang={lang} t={t} />}

          <div className="mt-5 rounded-2xl border border-line bg-surface p-6">
            <p className="text-[0.82rem] font-extrabold tracking-[0.13em] text-brand-blue dark:text-brand-orange">
              {t.situationHeading}
            </p>
            <p className="mt-3 text-[1.02rem] leading-relaxed">{step.situation[lang]}</p>
            <p className="mt-5 text-[1.05rem] font-extrabold">{step.question[lang]}</p>
          </div>

          <ul className="mt-5 space-y-3">
            {shown.map((choice) => (
              <li key={choice.id}>
                {/*
                 * One form per option rather than a radio group and a single
                 * submit. It is one tap instead of two on a phone, and the
                 * posted value cannot drift from the button that was pressed.
                 */}
                <form action={decideAction}>
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="level" value={level} />
                  <input type="hidden" name="step" value={step.id} />
                  <input type="hidden" name="choice" value={choice.id} />
                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-line bg-surface p-5 text-start transition-colors hover:border-brand-orange hover:bg-brand-orange/[0.06]"
                  >
                    <span className="block text-[1rem] leading-relaxed">{choice.text[lang]}</span>
                    <span className="mt-2 block text-[0.85rem] font-extrabold text-brand-blue dark:text-brand-orange">
                      {t.choose} →
                    </span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </>,
      );
    }

    /* Stored decisions that no longer describe a walk — the content was edited
       under a run in flight. Said plainly, and the old run is kept. */
    return shell(
      <>
        <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {t.errors.broken}
        </p>
        <StartForm lang={lang} level={level} label={t.cardRetake} />
      </>,
    );
  }

  // --------------------------------------------------------------- debrief
  if (latest) {
    const path = walk(def, latest.seed, latest.decisions);
    const walked = path.ok ? path.walked : [];
    return shell(
      <>
        <OptionalNote t={t} />
        <Verdict outcome={latest.outcome} t={t} />
        <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-2">{t.debriefLede}</p>

        <Drawn walked={walked} lang={lang} t={t} />

        <h2 className="mt-10 text-[1.15rem] font-extrabold">{t.yourDecisionsHeading}</h2>
        <p className="mt-1 text-[0.85rem] font-bold text-ink-3">
          {countPhrase(walked.length, t.decisionCount)}
        </p>
        <ol className="mt-4 space-y-4">
          {walked.map((w, i) => (
            <li key={w.step.id} className="rounded-2xl border border-line bg-surface p-5">
              <p className="text-[0.82rem] font-extrabold tracking-[0.13em] text-ink-3">
                {t.decisionOf.replace('{n}', String(i + 1)).replace('{total}', String(total))}
              </p>
              <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-2">
                {w.step.situation[lang]}
              </p>
              <p className="mt-3 text-[0.95rem]">
                <span className="font-extrabold">{t.youChose}: </span>
                {w.chosen.text[lang]}
              </p>
              <p className="mt-3 border-t border-line pt-3 text-[0.95rem] leading-relaxed">
                <span className="block text-[0.8rem] font-extrabold tracking-[0.12em] text-ink-3">
                  {t.consequenceHeading}
                </span>
                <span className="mt-1.5 block">{w.chosen.consequence[lang]}</span>
              </p>
            </li>
          ))}
        </ol>

        <StartForm lang={lang} level={level} label={t.againCta} />
        <Link
          href={`/${lang}/account/journey` as Parameters<typeof Link>[0]['href']}
          className="mt-6 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {t.backToJourney}
        </Link>
      </>,
    );
  }

  // ----------------------------------------------------------- never taken
  return shell(
    <>
      <OptionalNote t={t} />
      <p className="mt-6 text-[1.02rem] leading-relaxed text-ink-2">{def.lede[lang]}</p>
      <p className="mt-3 text-[0.9rem] font-bold text-ink-3">
        {countPhrase(total, t.decisionCount)}
      </p>
      <StartForm lang={lang} level={level} label={t.start} />
    </>,
  );
}

/* ------------------------------------------------------------------ pieces */

function OptionalNote({ t }: { t: ReturnType<typeof challengeLevels> }) {
  return (
    <div className="mt-5 rounded-2xl border border-brand-blue/30 bg-brand-blue/[0.05] p-5">
      <p className="text-[0.82rem] font-extrabold tracking-[0.13em] text-brand-blue dark:text-sky-300">
        {t.optional}
      </p>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{t.optionalBody}</p>
    </div>
  );
}

function StartForm({ lang, level, label }: { lang: Locale; level: number; label: string }) {
  return (
    <form action={startRunAction} className="mt-6">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="level" value={level} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-brand-orange-ink hover:bg-brand-orange-dark"
      >
        {label} →
      </button>
    </form>
  );
}

/** The decisions already taken in the run now on screen, briefly. */
function SoFar({
  walked,
  lang,
  t,
}: {
  walked: Walked[];
  lang: Locale;
  t: ReturnType<typeof challengeLevels>;
}) {
  const last = walked[walked.length - 1];
  return (
    <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-5">
      <p className="text-[0.8rem] font-extrabold tracking-[0.12em] text-ink-3">
        {t.consequenceHeading}
      </p>
      <p className="mt-2 text-[0.95rem]">
        <span className="font-extrabold">{t.youChose}: </span>
        {last.chosen.text[lang]}
      </p>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">
        {last.chosen.consequence[lang]}
      </p>
    </div>
  );
}

/**
 * The three words a finished run says.
 *
 * Carried by the words themselves, with the tint only reinforcing them — a
 * reader who cannot distinguish the colours loses nothing, and there is no
 * number here for anybody to compare with somebody else's.
 */
function Verdict({
  outcome,
  t,
}: {
  outcome: Outcome | null;
  t: ReturnType<typeof challengeLevels>;
}) {
  const map = {
    clear: { title: t.outcomeClear, body: t.outcomeClearBody, tone: 'ok' },
    held: { title: t.outcomeHeld, body: t.outcomeHeldBody, tone: 'warn' },
    review: { title: t.outcomeReview, body: t.outcomeReviewBody, tone: 'danger' },
  } as const;
  const it = map[outcome ?? 'clear'];
  const skin =
    it.tone === 'ok'
      ? 'border-ok/40 bg-ok/10'
      : it.tone === 'warn'
        ? 'border-warn/40 bg-warn/10'
        : 'border-danger/40 bg-danger/10';
  const ink =
    it.tone === 'ok' ? 'text-ok-text' : it.tone === 'warn' ? 'text-warn-text' : 'text-danger-text';

  return (
    <div className={`mt-6 rounded-2xl border-2 p-6 ${skin}`}>
      <h2 className={`text-[1.2rem] font-extrabold ${ink}`}>{it.title}</h2>
      <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-2">{it.body}</p>
    </div>
  );
}

/** Which courses this particular path leaned on — named, not scored. */
function Drawn({
  walked,
  lang,
  t,
}: {
  walked: Walked[];
  lang: Locale;
  t: ReturnType<typeof challengeLevels>;
}) {
  const slugs = coursesTouched(walked);
  if (slugs.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="text-[1.05rem] font-extrabold">{t.drewOnHeading}</h2>
      <p className="mt-1 text-[0.85rem] font-bold text-ink-3">
        {countPhrase(slugs.length, t.courseCount)}
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {slugs.map((slug) => {
          const course = courseBySlug(slug);
          return (
            <li
              key={slug}
              className="rounded-full border border-line bg-surface-2 px-3.5 py-1.5 text-[0.88rem] font-bold"
            >
              {course ? course.title[lang] : slug}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
