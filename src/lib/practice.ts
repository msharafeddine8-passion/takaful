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
