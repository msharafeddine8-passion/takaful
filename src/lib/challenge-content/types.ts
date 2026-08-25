import type { Locale } from '../i18n';

/**
 * The shape of a level's decision run.
 *
 * A leaf: it imports a locale type and nothing else, so the six authored
 * challenges, the engine in lib/programme/level-challenge.ts and the probe can
 * all depend on it without any of them depending on each other.
 *
 * ── WHY THIS IS NOT IN src/lib/course-content ──────────────────────────────
 *
 * Deliberately a separate tree, and the separation is the safety property
 * rather than tidiness.
 *
 * questionsIn() collects `quiz` blocks out of a CourseContent, and
 * courseFingerprint() hashes that same list. Nothing below is a Block, nothing
 * below is reachable from COURSE_CONTENT, and there is no `correct` field
 * anywhere in this file to be mistaken for a marked answer. So authoring a
 * decision run for a level that four hundred volunteers have already worked
 * through changes no score, invalidates no certificate and moves no
 * fingerprint — not because somebody remembered to be careful, but because
 * there is no path from here to there.
 *
 * The same argument the practice blocks make in course-content/types.ts, taken
 * one step further: those had to live inside CourseContent and stay out of the
 * hash by being a different block type. These do not have to live there at all.
 */

export type L = Record<Locale, string>;

/**
 * How the association reads a decision — not how many marks it is worth.
 *
 * Three words rather than a number, and the words are about the decision rather
 * than about the person who took it. `costly` is the important one: most field
 * decisions that go wrong are not wrong, they are expensive, and a scale with
 * only "right" and "wrong" on it would have to file them as one or the other
 * and would teach the wrong lesson either way.
 */
export type Weight =
  /** What the association would do. */
  | 'sound'
  /** Defensible, and it costs somebody something — time, trust, a relationship. */
  | 'costly'
  /** Crosses a line that is not ours to cross. */
  | 'harmful';

export type Choice = {
  /**
   * Stable for the life of the challenge — it is what a stored decision names.
   * Rewording an option is free. Renaming its id orphans every run that took
   * it, and a run nobody can read back is a run nobody can review.
   */
  id: string;
  text: L;
  weight: Weight;
  /**
   * What this decision actually costs or buys. The teaching is here, not in
   * the word `sound` — a volunteer who is told only that they were wrong keeps
   * the wrong idea and loses the confidence as well.
   */
  consequence: L;
  /** The situation this leads to, or null where the run ends. */
  next: string | null;
};

export type Step = {
  /** Stable, for the same reason a choice id is. */
  id: string;
  /** 1-based. Every path through a challenge passes through every round. */
  round: number;
  /**
   * The courses this situation leans on, by slug.
   *
   * At least two, and never one. A situation that can be answered out of a
   * single course is a course question, and the whole point of a level
   * challenge is the collision between two things that were taught apart.
   */
  draws: string[];
  situation: L;
  question: L;
  choices: Choice[];
};

export type LevelChallenge = {
  /** 1-6. Level 0 is the orientation and sets no challenge of its own. */
  level: number;
  title: L;
  lede: L;
  /**
   * The situations a run may open on. The seed picks one, so two volunteers
   * sitting down in the same minute do not begin in the same place.
   */
  openings: string[];
  steps: Step[];
};

/** One decision, as it is stored: which situation, and which option. */
export type Decision = { step: string; choice: string };
