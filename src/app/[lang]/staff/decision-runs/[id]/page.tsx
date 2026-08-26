import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { challengeLevels } from '@/lib/dictionaries/challenge-levels';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import { countPhrase } from '@/lib/when';
import { courseBySlug } from '@/lib/courses';
import {
  challengeForLevel,
  coursesTouched,
  uniformDepth,
  walk,
  type Walked,
} from '@/lib/programme/level-challenge';
import { runForReview } from '@/lib/level-challenge-runs';

/**
 * One decision run, read back by the person who will have the conversation.
 *
 * ── EVERYTHING HERE IS REBUILT, NOTHING IS RECONSTRUCTED BY HAND ───────────
 *
 * walk(def, seed, decisions) returns every situation the volunteer met, the
 * options exactly as they were arranged on their screen, and which one they
 * took. This page renders that and derives nothing of its own: it does not
 * re-shuffle the choices, does not re-read the authored order, and does not
 * decide anywhere what the run "meant".
 *
 * That matters more here than on the volunteer's own debrief. A reviewer is
 * about to sit down with somebody and ask why they chose what they chose, and
 * the options must be in the position they were actually in — the authored
 * order tends to put the sound answer first, and a screen that quietly restored
 * it would have the reviewer asking about a paper nobody sat.
 *
 * ── IT DECIDES NOTHING ─────────────────────────────────────────────────────
 *
 * There is no form on this page and no action behind it. Reading a run records
 * nothing, notifies nobody, and changes no state — the level closed when the
 * run finished. The page is a way for a person to be informed before a
 * conversation, not a step in a procedure.
 *
 * Gated on `practical.review`, like the list it is reached from, and re-checked
 * here rather than trusted from that list: a page decides what to draw, it does
 * not decide who somebody is.
 */

export const metadata: Metadata = { robots: { index: false, follow: false } };

/* A run id is a UUID. Validated rather than handed to Postgres as text: an id
   of the wrong shape is a stale or guessed link, and it should read as "not
   found" rather than as a 500 from a failed cast. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function StaffDecisionRunPage(
  props: PageProps<'/[lang]/staff/decision-runs/[id]'>,
) {
  await connection();
  const { lang, id } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = challengeLevels(lang);
  const s = t.staff;

  const shell = (children: React.ReactNode) => (
    <Section>
      <Container className="max-w-3xl">
        <Kicker>{s.readTitle}</Kicker>
        {children}
        <Link
          href={`/${lang}/staff/decision-runs` as Parameters<typeof Link>[0]['href']}
          className="mt-8 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {s.backToQueue}
        </Link>
      </Container>
    </Section>
  );

  if (!isDbConfigured()) {
    return shell(
      <p className="mt-4 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
        {dict.account.errors.dbUnavailable}
      </p>,
    );
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  /* The capability before the row is read, not before the JSX — otherwise
     somebody's rehearsal is already in the response. */
  if (!can(user, 'practical.review')) {
    return shell(
      <p className="mt-4 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
        {s.forbidden}
      </p>,
    );
  }

  if (!UUID.test(id)) notFound();

  /* Only runs the queue would have listed can be opened here — the query
     refuses anything else, so a guessed id reads as "not found" rather than
     opening a `clear` run that is nobody's business but its author's. */
  const found = await runForReview(id);
  if (!found) {
    return shell(
      <p className="mt-4 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
        {s.notFound}
      </p>,
    );
  }

  const def = challengeForLevel(found.level);
  const path = def ? walk(def, found.run.seed, found.run.decisions) : null;
  const walked: Walked[] = path?.ok ? path.walked : [];
  const total = def ? (uniformDepth(def) ?? def.steps.length) : walked.length;
  const drawn = coursesTouched(walked);

  return shell(
    <>
      <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
        {found.fullName}
      </h1>
      <p className="mt-2 text-[0.98rem] font-bold text-brand-blue dark:text-brand-orange">
        {s.levelLabel.replace('{level}', String(found.level))}
      </p>
      {/* 'YYYY-MM-DD' in Beirut, as text from the query. Never rebuilt. */}
      <p className="mt-1 text-[0.85rem] text-ink-3" dir="ltr">
        {s.finishedOn} {found.finishedOn}
      </p>

      {/* The tone this screen is read in, said before anything else on it. */}
      <div className="mt-6 rounded-2xl border border-brand-blue/30 bg-brand-blue/[0.05] p-5">
        <p className="text-[0.82rem] font-extrabold tracking-[0.13em] text-brand-blue dark:text-sky-300">
          {s.conversationTitle}
        </p>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{s.conversationBody}</p>
      </div>

      {walked.length === 0 ? (
        <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {s.unreadable}
        </p>
      ) : (
        <>
          <p className="mt-6 text-[0.98rem] leading-relaxed text-ink-2">{s.readLede}</p>

          {drawn.length > 0 && (
            <div className="mt-6">
              <h2 className="text-[1.05rem] font-extrabold">{s.drewOnHeading}</h2>
              <p className="mt-1 text-[0.85rem] font-bold text-ink-3">
                {countPhrase(drawn.length, t.courseCount)}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {drawn.map((slug) => {
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
          )}

          <p className="mt-8 text-[0.85rem] font-bold text-ink-3">
            {countPhrase(walked.length, t.decisionCount)}
          </p>
          <ol className="mt-3 space-y-5">
            {walked.map((w, i) => (
              <Decision key={w.step.id} walked={w} index={i} total={total} lang={lang} t={t} />
            ))}
          </ol>
        </>
      )}
    </>,
  );
}

/* ------------------------------------------------------------------ pieces */

/**
 * One situation, the options as they were arranged, and the one taken.
 *
 * `w.shown` comes from the engine and is rendered in the order it arrives. The
 * chosen option is marked where it stood rather than lifted to the top: a
 * reviewer asking "why this one" needs to see what it was sitting next to.
 *
 * The marking is carried by the words, with the tint only reinforcing them, so
 * a reader who cannot distinguish the colours loses nothing.
 */
function Decision({
  walked,
  index,
  total,
  lang,
  t,
}: {
  walked: Walked;
  index: number;
  total: number;
  lang: Locale;
  t: ReturnType<typeof challengeLevels>;
}) {
  const s = t.staff;
  return (
    <li className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-[0.82rem] font-extrabold tracking-[0.13em] text-ink-3">
        {t.decisionOf.replace('{n}', String(index + 1)).replace('{total}', String(total))}
      </p>

      <p className="mt-3 text-[0.8rem] font-extrabold tracking-[0.12em] text-brand-blue dark:text-brand-orange">
        {t.situationHeading}
      </p>
      <p className="mt-1.5 text-[0.98rem] leading-relaxed">{walked.step.situation[lang]}</p>
      <p className="mt-3 text-[1rem] font-extrabold">{walked.step.question[lang]}</p>

      <p className="mt-5 text-[0.8rem] font-extrabold tracking-[0.12em] text-ink-3">
        {s.optionsHeading}
      </p>
      <ul className="mt-2 space-y-2">
        {walked.shown.map((choice) => {
          const taken = choice.id === walked.chosen.id;
          return (
            <li
              key={choice.id}
              className={`rounded-xl border p-4 text-[0.95rem] leading-relaxed ${
                taken ? 'border-brand-orange bg-brand-orange/[0.08]' : 'border-line bg-surface-2'
              }`}
            >
              {taken && (
                <span className="mb-1.5 block text-[0.78rem] font-extrabold tracking-[0.12em] text-brand-blue dark:text-brand-orange">
                  {s.tookThis}
                </span>
              )}
              <span className={taken ? 'font-bold' : 'text-ink-2'}>{choice.text[lang]}</span>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 border-t border-line pt-3 text-[0.95rem] leading-relaxed">
        <span className="block text-[0.8rem] font-extrabold tracking-[0.12em] text-ink-3">
          {s.consequenceHeading}
        </span>
        <span className="mt-1.5 block text-ink-2">{walked.chosen.consequence[lang]}</span>
      </p>
    </li>
  );
}
