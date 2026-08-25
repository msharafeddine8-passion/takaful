/**
 * The rules behind the practice blocks: shuffling, moving, and knowing when a
 * reader has it right.
 *
 * Pure, and therefore probe-testable without a browser. Which matters more
 * than usual here, because the failure these can have is invisible: an
 * "arrange these in order" exercise that hands the reader the steps already in
 * order is not a broken widget, it is a widget that looks like it works and
 * teaches nothing.
 *
 * The shuffle is deterministic on purpose. These render inside client
 * components, which Next also renders on the server — so a Math.random()
 * shuffle produces one order in the HTML and a different one when React takes
 * over, and the page hydrates into a mismatch. Seeding from the content means
 * both sides compute the same arrangement, and it means the same exercise
 * looks the same to a reader coming back to it.
 */

/** FNV-1a. Small, fast, and stable across runtimes — which is the whole job. */
export function hashSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** A seeded generator. mulberry32 — enough for shuffling four list items. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The positions 0…n-1, shuffled, and never left in their original order.
 *
 * A Fisher-Yates on a small list lands on the identity often — one time in six
 * for three items — and when it does, the reader is shown the answer and asked
 * to produce it. So an identity result is rotated by one, which cannot itself
 * be the identity for n > 1.
 */
export function shuffleIndices(n: number, seed: number): number[] {
  const out = Array.from({ length: n }, (_, i) => i);
  if (n < 2) return out;

  const rand = rng(seed);
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (out.every((v, i) => v === i)) return [...out.slice(1), out[0]];
  return out;
}

/** True when the arrangement is the authored order. */
export function isOrdered(indices: readonly number[]): boolean {
  return indices.every((v, i) => v === i);
}

/**
 * One item moved up or down, as a new array.
 *
 * Buttons rather than dragging. Drag-and-drop is awkward on a phone, which is
 * where most of these courses are read, and it is close to unusable with a
 * keyboard or a screen reader. Two buttons per row are neither.
 *
 * Out-of-range moves return the list unchanged rather than throwing, so the
 * component never has to guard the ends of the list in two places.
 */
export function moveBy(list: readonly number[], index: number, delta: number): number[] {
  const to = index + delta;
  if (index < 0 || index >= list.length || to < 0 || to >= list.length) return [...list];
  const out = [...list];
  [out[index], out[to]] = [out[to], out[index]];
  return out;
}

/**
 * A shuffle for an exercise whose right answer is authored first.
 *
 * `order` hands the reader a whole list to rearrange, so a fixed point in the
 * permutation costs nothing. `build` is different: every slot puts its correct
 * option at index 0, and shuffleIndices only promises that the list as a whole
 * is not the authored one — it is free to leave 0 exactly where it was. Across
 * four slots that happens often enough that "press the first button in every
 * row" becomes a winning strategy, which is the same invisible failure as
 * handing over an already-ordered list.
 *
 * So the answer is displaced, deterministically: it swaps with a position
 * picked from the seed rather than always the last, because an answer that is
 * never first but always last is the same tell wearing a different hat.
 */
export function shuffleAnswers(n: number, seed: number): number[] {
  const out = shuffleIndices(n, seed);
  if (n < 2 || out[0] !== 0) return out;
  const j = 1 + (seed % (n - 1));
  [out[0], out[j]] = [out[j], out[0]];
  return out;
}

export type SortProgress = { placed: number; correct: number; total: number; done: boolean };

/**
 * How far through a sorting exercise the reader is.
 *
 * `done` is every item placed, right or wrong — not every item placed
 * correctly. The block shows which ones are wrong and lets them be moved, and
 * a "done" that only arrives on a perfect answer would leave somebody who put
 * one item in the wrong bucket with no acknowledgement that they had finished.
 */
export function sortProgress(
  assignment: Readonly<Record<number, string>>,
  items: readonly { bucket: string }[],
): SortProgress {
  let placed = 0;
  let correct = 0;
  items.forEach((item, i) => {
    const chosen = assignment[i];
    if (chosen === undefined) return;
    placed += 1;
    if (chosen === item.bucket) correct += 1;
  });
  return { placed, correct, total: items.length, done: placed === items.length };
}

/**
 * The same count for the exercises that take one choice per row.
 *
 * Matching and building are the same arithmetic wearing two different faces:
 * a row is answered or it is not, and the answer is right or it is not. What
 * differs is only what "right" means, so the caller passes it — the identity
 * for a match, where left i belongs with right i, and all zeroes for a build,
 * where every slot authors its correct option first.
 *
 * A choice for a row that does not exist is ignored rather than counted, for
 * the reason sortProgress ignores one: state keyed by index outlives the list
 * it was keyed against the moment an author deletes a row.
 */
export function pickProgress(
  chosen: Readonly<Record<number, number>>,
  expected: readonly number[],
): SortProgress {
  let placed = 0;
  let correct = 0;
  expected.forEach((want, i) => {
    const got = chosen[i];
    if (got === undefined) return;
    placed += 1;
    if (got === want) correct += 1;
  });
  return { placed, correct, total: expected.length, done: placed === expected.length };
}

export type ReviewTally = {
  /** Lines the reader marked, right or wrong. */
  flagged: number;
  /** Marked, and genuinely a problem. */
  found: number;
  /** A problem, and not marked. */
  missed: number;
  /** Marked, and actually fine. */
  falseAlarms: number;
  /** How many problems the document holds. */
  problems: number;
  total: number;
};

/**
 * What a reader found in a document, and what they did not.
 *
 * Four numbers rather than a score, because the two ways of being wrong are
 * not the same mistake and must not be added together. Missing the line that
 * names a child is a safeguarding failure; flagging a line that was fine is
 * over-reading, which is a habit worth correcting and not a harm. A single
 * "3 out of 5" would hide which one happened.
 *
 * Nothing here counts toward anything. It is a mirror, not a mark.
 */
export function reviewTally(
  flagged: Readonly<Record<number, boolean>>,
  lines: readonly { wrong?: boolean }[],
): ReviewTally {
  const out: ReviewTally = {
    flagged: 0,
    found: 0,
    missed: 0,
    falseAlarms: 0,
    problems: 0,
    total: lines.length,
  };
  lines.forEach((line, i) => {
    const marked = flagged[i] === true;
    if (line.wrong) out.problems += 1;
    if (marked) out.flagged += 1;
    if (marked && line.wrong) out.found += 1;
    else if (marked) out.falseAlarms += 1;
    else if (line.wrong) out.missed += 1;
  });
  return out;
}

/**
 * Where a conversation goes after a reply, or null when it is over.
 *
 * Two ways to reach the end and only one of them is finishing. `ends` is the
 * reply that shuts the conversation down — the promise of secrecy, the
 * question that leads the child — and it stops the exercise where a real
 * conversation would have stopped, which is the whole lesson. Running out of
 * turns is the other, and it means the reader got through.
 *
 * Kept out of the component so both endings are one expression rather than a
 * condition written twice, once for the transcript and once for the footer.
 */
export function nextTurn(current: number, total: number, ends: boolean): number | null {
  if (ends) return null;
  const next = current + 1;
  return next < total ? next : null;
}
