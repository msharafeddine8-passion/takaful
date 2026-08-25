/**
 * The decision run: what a level asks of somebody once the courses are behind
 * them, and why no two people answer the same paper.
 *
 * ── WHAT THIS IS, AND WHAT IT IS NOT ───────────────────────────────────────
 *
 * Every level already ends in a course of kind `challenge` — eight marked
 * questions, the same eight for everybody, sat once and scored. That course is
 * untouched by any of this and keeps its slug, its questions, its pass mark
 * and its fingerprint.
 *
 * This is the other thing. One situation belonging to the whole level, walked a
 * decision at a time, where the decision you take is what decides the situation
 * you meet next. Nothing here is marked out of a hundred, nothing is compared
 * with anybody, and nothing it produces unlocks a door.
 *
 * ── THE THREE PROPERTIES IT IS BUILT AROUND ────────────────────────────────
 *
 * 1. IT CANNOT REACH A SCORE, A CERTIFICATE OR A FINGERPRINT.
 *
 *    courseFingerprint() hashes a CourseContent — its slug, its pass mark, its
 *    module ids and its `quiz` blocks. A decision run is not a CourseContent,
 *    holds no `quiz` block and no `correct`, and lives in src/lib/challenge-
 *    content rather than in src/lib/course-content. There is no import path by
 *    which one could reach the other, which is a stronger guarantee than a rule
 *    somebody has to remember. probe-level-challenge asserts it across all
 *    forty-one courses — and asserts a control, that the fingerprint still
 *    moves when a question actually changes, because three green assertions
 *    against a hash that had quietly stopped working would look identical.
 *
 * 2. IT IS NOT A GATE.
 *
 *    Levels unlock from passed rows in `course_attempts`, and this writes to
 *    `level_challenge_runs` and nowhere else. A run cannot be passed and cannot
 *    be failed, and gate.ts, credentials.ts and level-badges.ts do not know it
 *    exists. A volunteer two courses from the end of level 3 is in exactly the
 *    position this morning that they were in last night.
 *
 *    The one condition on opening a run is the level being open to the learner
 *    at all — the rule that already existed, reused rather than restated, so
 *    there is no second copy of it to drift.
 *
 * 3. IT IS REPRODUCIBLE.
 *
 *    A run stores its seed and the decisions taken, in order. Everything else —
 *    which situation it opened on, which options were on the screen and in what
 *    order, which situation followed each decision — is recomputed from those
 *    two facts by the functions below. Math.random() would have made a disputed
 *    result unanswerable, and "what was this person actually asked?" is the
 *    only question worth asking about one. It has to have an answer next year
 *    as well as this afternoon.
 *
 *    The shuffle is seeded exactly the way lib/practice.ts seeds its exercises,
 *    and by literally the same function, so this codebase has one shuffle
 *    rather than two that could disagree.
 *
 * PURE. No `server-only`, no database, no React — the probe drives every rule
 * here without a server, and lib/db.ts is server-only and poisons importers.
 */

import { createHash } from 'node:crypto';
import { hashSeed, shuffleIndices } from '../practice';
import { LEVEL_CHALLENGES } from '../challenge-content';
import type { Choice, Decision, LevelChallenge, Step } from '../challenge-content/types';
import { coursesInLevel } from './definition';

export type { Choice, Decision, LevelChallenge, Step, Weight, L } from '../challenge-content/types';

// --------------------------------------------------------------- the catalogue

export function challengeForLevel(level: number): LevelChallenge | null {
  return LEVEL_CHALLENGES.find((c) => c.level === level) ?? null;
}

export function allChallenges(): LevelChallenge[] {
  return LEVEL_CHALLENGES;
}

export function stepById(def: LevelChallenge, id: string): Step | null {
  return def.steps.find((s) => s.id === id) ?? null;
}

/** The core courses of a level, by slug — what `draws` is allowed to name. */
export function coursesBehind(level: number): string[] {
  return coursesInLevel(level)
    .filter((c) => c.kind === 'core')
    .map((c) => c.slug);
}

// ------------------------------------------------------------------ the seed

/**
 * A run's seed, from the two things that identify it.
 *
 * The run id is generated once when the run opens, so the same person starting
 * a second run walks a different path — which is what makes taking it again
 * worth anything. The value is also written to the row, so nothing downstream
 * depends on this function still computing it the same way in two years: this
 * is how a seed is chosen, not how one is recovered.
 */
export function seedFor(userId: string, runId: string): number {
  return hashSeed(`${userId}:${runId}`);
}

/**
 * One of n, chosen by a seed.
 *
 * Not shuffleIndices(n, seed)[0]. That function guarantees it never returns the
 * authored order, which for n = 2 means it always returns [1, 0] — so the first
 * opening could never be picked and every run in the association would begin on
 * the second situation. Re-hashing decorrelates the value from whatever the
 * caller used the same seed for elsewhere, and the modulo is then honest.
 */
export function pickIndex(n: number, seed: number): number {
  if (n <= 1) return 0;
  return hashSeed(`pick:${seed}`) % n;
}

/** The situation a run opens on. Deterministic in the seed, and only in it. */
export function openingFor(def: LevelChallenge, seed: number): Step | null {
  if (def.openings.length === 0) return null;
  return stepById(def, def.openings[pickIndex(def.openings.length, seed)]);
}

/**
 * The order the options are shown in, as indices into `step.choices`.
 *
 * Seeded per step as well as per run, so one volunteer does not meet the same
 * arrangement three times over, and so the authored order — in which the sound
 * option tends to come first, because that is the order it is easiest to write
 * in — is never the order anybody sees. shuffleIndices refuses to return the
 * identity, which is what makes that last part true rather than merely likely.
 */
export function choiceOrderFor(step: Step, seed: number): number[] {
  return shuffleIndices(step.choices.length, hashSeed(`${seed}:${step.id}`));
}

/** The options of a step, in the order this run puts them on the screen. */
export function shownChoices(step: Step, seed: number): Choice[] {
  return choiceOrderFor(step, seed).map((i) => step.choices[i]);
}

// -------------------------------------------------------------- walking a run

/** One decision, rebuilt: what was asked, what was on offer, what was taken. */
export type Walked = {
  step: Step;
  /** Exactly what was on the screen, in the order it was on the screen. */
  shown: Choice[];
  chosen: Choice;
};

export type Path =
  | {
      ok: true;
      /** The decisions already taken, oldest first. */
      walked: Walked[];
      /** The situation now on the screen, or null when the run is over. */
      current: Step | null;
      done: boolean;
    }
  | {
      ok: false;
      /**
       * The stored decisions do not describe a walk through this challenge.
       *
       * Returned rather than thrown. It means the content was edited under a
       * run in flight, or a row was written by hand — both of which are things
       * a person has to look at, and neither of which should take a page down
       * for everybody else.
       */
      reason: 'no-opening' | 'unknown-step' | 'unknown-choice' | 'out-of-order';
      /** How far the walk got before it stopped making sense. */
      walked: Walked[];
    };

/**
 * The whole run, rebuilt from the seed and the decisions and nothing else.
 *
 * This is the function the reproducibility promise rests on. A reviewer holding
 * a stored row can call it and read back, in order, every situation the
 * volunteer met, every option in the position it appeared in, and which one
 * they took. None of that depends on when it is called or on which machine.
 */
export function walk(def: LevelChallenge, seed: number, decisions: readonly Decision[]): Path {
  const opening = openingFor(def, seed);
  if (!opening) return { ok: false, reason: 'no-opening', walked: [] };

  const walked: Walked[] = [];
  let current: Step | null = opening;

  for (const decision of decisions) {
    if (!current) return { ok: false, reason: 'out-of-order', walked };
    /*
     * A decision naming a different situation than the one the walk is standing
     * on is not a recoverable ordering problem — it means these decisions were
     * not taken in this run, and guessing which one they belong to would be
     * inventing a history for somebody.
     */
    if (decision.step !== current.id) return { ok: false, reason: 'out-of-order', walked };

    const chosen = current.choices.find((c) => c.id === decision.choice);
    if (!chosen) return { ok: false, reason: 'unknown-choice', walked };

    walked.push({ step: current, shown: shownChoices(current, seed), chosen });

    if (chosen.next === null) {
      current = null;
      break;
    }
    const next: Step | null = stepById(def, chosen.next);
    if (!next) return { ok: false, reason: 'unknown-step', walked };
    current = next;
  }

  return { ok: true, walked, current, done: current === null };
}

export type MoveCheck =
  | { ok: true; step: Step; choice: Choice }
  | { ok: false; reason: 'finished' | 'broken' | 'wrong-step' | 'unknown-choice' };

/**
 * Whether an option may be recorded against the run as it stands.
 *
 * The server calls this before writing, and everything it needs is already in
 * the stored row. A submitted step id and choice id that do not match where the
 * run actually is are refused rather than appended, which is what stops a
 * crafted request from jumping to the last situation — and what stops the same
 * situation being answered twice after its consequence has been read.
 */
export function checkMove(
  def: LevelChallenge,
  seed: number,
  decisions: readonly Decision[],
  move: Decision,
): MoveCheck {
  const path = walk(def, seed, decisions);
  if (!path.ok) return { ok: false, reason: 'broken' };
  if (path.done || !path.current) return { ok: false, reason: 'finished' };
  if (path.current.id !== move.step) return { ok: false, reason: 'wrong-step' };
  const choice = path.current.choices.find((c) => c.id === move.choice);
  if (!choice) return { ok: false, reason: 'unknown-choice' };
  return { ok: true, step: path.current, choice };
}

// ----------------------------------------------------------------- the outcome

/**
 * What a finished run says.
 *
 * THERE IS NO SCORE HERE, AND NOWHERE TO PUT ONE.
 *
 * Not a percentage, not a band, not a mark out of the number of decisions. The
 * moment a number exists somebody puts it on a screen beside somebody else's —
 * the same argument migrations 034 and 041 make, and the same reason
 * practical_submissions has no grade column. What this returns is three words
 * about the decisions, and the decisions are all it can be built from.
 *
 * `review` is deliberately not called failure. A volunteer who took a harmful
 * option took it here rather than in a hall with thirty children in it, which
 * is the entire value of the exercise.
 */
export type Outcome =
  /** Every decision was the one the association would take. */
  | 'clear'
  /** Nothing crossed a line; something cost more than it needed to. */
  | 'held'
  /** At least one decision crossed a line. Worth sitting with somebody over. */
  | 'review';

export function outcomeOf(walked: readonly Walked[]): Outcome {
  if (walked.some((w) => w.chosen.weight === 'harmful')) return 'review';
  if (walked.some((w) => w.chosen.weight === 'costly')) return 'held';
  return 'clear';
}

/** The courses a particular walk actually leaned on, deduplicated, in order. */
export function coursesTouched(walked: readonly Walked[]): string[] {
  const seen: string[] = [];
  for (const w of walked) {
    for (const slug of w.step.draws) if (!seen.includes(slug)) seen.push(slug);
  }
  return seen;
}

// ------------------------------------------------------------ the fingerprint

/**
 * A short, stable identifier for the branching shape of a challenge.
 *
 * The same idea as courseFingerprint and deliberately a different function over
 * a different type: there is no argument you could hand to one that the other
 * would accept, so no edit to a challenge can reach a course's hash even by
 * accident.
 *
 * It covers the shape a run walked — the situations, the options, how each was
 * read, and where each one led. Not the prose: rewording a consequence does not
 * change which decisions were on offer, and a fingerprint that churned on every
 * copy-edit would stop meaning anything inside a month.
 */
export function challengeFingerprint(def: LevelChallenge): string {
  const canonical = JSON.stringify({
    level: def.level,
    openings: [...def.openings].sort(),
    steps: [...def.steps]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((s) => ({
        id: s.id,
        round: s.round,
        draws: [...s.draws].sort(),
        choices: [...s.choices]
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((c) => ({ id: c.id, weight: c.weight, next: c.next })),
      })),
  });
  return createHash('sha256').update(canonical).digest('hex').slice(0, 12);
}

// ------------------------------------------------------------------ the shape

/**
 * How many decisions a run takes, or null when the challenge is not uniform.
 *
 * Every path has to be the same length. A branch that ended a decision early
 * would mean two volunteers walked out with runs that cannot be read against
 * each other — and worse, that the short path was the one available to whoever
 * answered in a particular way, which is a reward for an answer that nobody
 * authored on purpose.
 *
 * Returns null rather than a guess when the paths disagree, and
 * probe-level-challenge fails on a null.
 */
export function uniformDepth(def: LevelChallenge): number | null {
  const depths = new Set<number>();

  const descend = (stepId: string, sofar: number, seen: readonly string[]): boolean => {
    // A cycle makes the walk infinite and there is no honest depth for it.
    // Reported as a disagreement rather than hanging the probe.
    if (seen.includes(stepId)) return false;
    const step = stepById(def, stepId);
    if (!step) return false;
    for (const choice of step.choices) {
      if (choice.next === null) depths.add(sofar + 1);
      else if (!descend(choice.next, sofar + 1, [...seen, stepId])) return false;
    }
    return true;
  };

  for (const opening of def.openings) {
    if (!descend(opening, 0, [])) return null;
  }
  return depths.size === 1 ? [...depths][0] : null;
}

/** Every step id that some path can actually reach. */
export function reachableSteps(def: LevelChallenge): Set<string> {
  const found = new Set<string>();
  const visit = (id: string) => {
    if (found.has(id)) return;
    const step = stepById(def, id);
    if (!step) return;
    found.add(id);
    for (const choice of step.choices) if (choice.next) visit(choice.next);
  };
  for (const opening of def.openings) visit(opening);
  return found;
}

/**
 * Every distinct sequence of situations a run can meet, as lists of step ids.
 *
 * For the probe, which uses it to assert that the openings genuinely lead
 * somewhere different and that every path leans on enough of the level to be a
 * level challenge rather than a course question wearing one's clothes. Distinct
 * papers, not distinct answers: several ways of arriving at the same three
 * situations are one paper.
 */
export function everyPath(def: LevelChallenge): string[][] {
  const out: string[][] = [];
  const descend = (id: string, sofar: string[]) => {
    const step = stepById(def, id);
    if (!step) return;
    const here = [...sofar, id];
    for (const choice of step.choices) {
      if (choice.next === null) out.push(here);
      else descend(choice.next, here);
    }
  };
  for (const opening of def.openings) descend(opening, []);

  const seen = new Set<string>();
  return out.filter((p) => {
    const key = p.join('>');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
