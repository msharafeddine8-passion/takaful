import { countPhrase } from '@/lib/when';
import {
  bestScoreOf,
  lastScoreOf,
  numberSittings,
  type AttemptSummary,
} from '@/lib/academy';
import { attemptsDict, type AttemptStrings } from '@/lib/dictionaries/attempts';
import type { Locale } from '@/lib/i18n';

/**
 * A learner's own sittings of one paper, listed.
 *
 * `course_attempts` has held every attempt anybody ever made since migration
 * 012 — the date, the score, the pass mark as it stood that day, and how many
 * questions were answered — and until now not one of those rows reached the
 * person who made it. The account page could say "best score" and "3
 * attempts"; it could not say when, or what any of the three were.
 *
 * ── WHAT THIS IS NOT ───────────────────────────────────────────────────────
 *
 * It is a log, not a scoreboard, and the difference is enforced here rather
 * than left to good intentions:
 *
 *   · The rows are in the order they happened and can be in no other. Sorting
 *     by score would rank somebody's own attempts against each other, which is
 *     the instrument migrations 034 and 041 refused to build between people.
 *     Pointing it inward does not make it kinder.
 *   · There is no chart. A line of scores over time reads as a shape, and a
 *     dip in that shape is a bad afternoon rendered as a decline. The brief
 *     asked for a history, and a list is one.
 *   · A sitting below the pass mark is drawn exactly like every other row:
 *     same border, same background, same size, no red. The status line names
 *     where the mark stood and where the score fell, which is a fact. The
 *     danger tokens say "something is wrong here", and about a person's second
 *     try at a paper, nothing is.
 *
 * The heading is left to the caller. On the account page these sit inside a
 * `<details>` whose `<summary>` is the heading; on the assessment screen they
 * sit under an `<h2>`. A component that insisted on its own heading element
 * would be wrong in one of those two places.
 *
 * A server component. Nothing here is interactive, and the rows are somebody's
 * own record — no reason for any of it to travel to the browser as props on a
 * client component.
 */
export function AttemptHistory({
  lang,
  history,
  /**
   * True for a level's paper, which no longer closes the level — the decision
   * run does. See gate.ts:levelClosed and the note at the head of migration
   * 042. What an attempt is *for* differs entirely between the two, and
   * getting it wrong sends somebody back to revise for a gate that was
   * removed.
   */
  revision,
}: {
  lang: Locale;
  history: readonly AttemptSummary[];
  revision: boolean;
}) {
  const t = attemptsDict(lang);

  if (history.length === 0) {
    return <p className="text-[0.92rem] leading-relaxed text-ink-2">{t.empty}</p>;
  }

  const numbers = numberSittings(history);
  const best = bestScoreOf(history);
  const last = lastScoreOf(history);
  const sittings = numbers.size;

  return (
    <div>
      <p className="text-[0.92rem] leading-relaxed text-ink-2">{t.lede}</p>

      {/*
        * Best and most recent, side by side, and nothing between them.
        *
        * Section 28 asks for both. They are printed as two facts and are never
        * subtracted, compared, arrowed or captioned — see the tone note in
        * dictionaries/attempts.ts for why a third string joining them is the
        * one thing this panel must not grow.
        */}
      {(best !== null || last !== null) && (
        <dl className="mt-4 flex flex-wrap gap-x-7 gap-y-3 text-[0.88rem]">
          {best !== null && <Fact label={t.bestScore} value={`${best}%`} />}
          {last !== null && <Fact label={t.lastScore} value={`${last}%`} />}
        </dl>
      )}

      {sittings > 0 && (
        <p className="mt-3 text-[0.86rem] font-bold text-ink-3">
          {countPhrase(sittings, t.sittings)}
        </p>
      )}

      <ol className="mt-4 space-y-2.5">
        {history.map((attempt, i) => (
          <Sitting
            // Only one attempt per course may be open at a time
            // (uq_open_attempt), but two finished ones can share a day, so the
            // day alone is not a key. The list never reorders, so the index is.
            key={`${attempt.started_on}-${i}`}
            t={t}
            attempt={attempt}
            n={numbers.get(attempt) ?? null}
          />
        ))}
      </ol>

      <p className="mt-5 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.88rem] leading-relaxed text-ink-2">
        {revision ? t.noteRevision : t.notePaper}
      </p>
      <p className="mt-2.5 text-[0.85rem] leading-relaxed text-ink-3">{t.kept}</p>
    </div>
  );
}

function Sitting({
  t,
  attempt,
  n,
}: {
  t: AttemptStrings;
  attempt: AttemptSummary;
  n: number | null;
}) {
  const recognised = attempt.source === 'recognised';
  const migrated = attempt.source === 'migrated';
  const open = attempt.submitted_on === null;

  /*
   * The day, in Beirut, as text out of Postgres. Never `new Date(...)`: a
   * paper submitted at 01:00 Beirut is 22:00 GMT the previous day, and the
   * session runs GMT. See the DATES note in lib/academy.ts.
   */
  const day = attempt.submitted_on ?? attempt.started_on;

  const status = recognised
    ? null
    : open
      ? { label: t.notFinished, tone: 'text-brand-orange-text dark:text-brand-orange' }
      : attempt.passed
        ? { label: t.reachedMark, tone: 'text-ok-text' }
        : /* Neutral, and deliberately so. This row is a step somebody took,
             not an error state, and the danger tokens would say otherwise. */
          { label: t.belowMark, tone: 'text-ink-2' };

  return (
    <li className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-[0.92rem] font-extrabold">
          {n === null ? t.recognisedRow : t.sittingLabel.replace('{n}', String(n))}
        </span>
        {/* Latin digits in ISO order, so the date reads the same way in an RTL
            page as in an LTR one — `text-start` keeps it aligned to whichever
            edge the page starts at. */}
        <span dir="ltr" className="text-start text-[0.85rem] font-bold text-ink-3">
          {day}
        </span>
      </div>

      {status && (
        <p className={`mt-1.5 text-[0.88rem] font-bold ${status.tone}`}>{status.label}</p>
      )}

      {/* A recognised pass carries no score, no mark and no answers, because
          there was no paper. Saying so beats printing three dashes. */}
      {recognised ? (
        <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink-3">{t.recognisedRow}</p>
      ) : (
        <>
          <dl className="mt-2.5 flex flex-wrap gap-x-6 gap-y-2 text-[0.85rem]">
            {attempt.score !== null && (
              <Fact label={t.scoreLabel} value={`${attempt.score}%`} />
            )}
            {attempt.pass_mark !== null && (
              <Fact label={t.passMarkLabel} value={`${attempt.pass_mark}%`} />
            )}
          </dl>
          {/* Only where the questions were recorded. A migrated row has an
              empty question_ids array by design, and "answered 0 of 0" about
              a paper somebody passed years ago is worse than silence. */}
          {attempt.asked > 0 && (
            <p className="mt-2 text-[0.83rem] text-ink-3">
              {t.answeredOf
                .replace('{n}', String(attempt.answered))
                .replace('{total}', String(attempt.asked))}
            </p>
          )}
        </>
      )}

      {migrated && (
        <p className="mt-2 text-[0.83rem] leading-relaxed text-ink-3">{t.migratedRow}</p>
      )}
    </li>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.79rem] font-bold tracking-[0.1em] text-ink-3">{label}</dt>
      <dd className="mt-0.5 font-extrabold" dir="auto">
        {value}
      </dd>
    </div>
  );
}
