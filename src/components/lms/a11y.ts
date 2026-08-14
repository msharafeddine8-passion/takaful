'use client';

/**
 * The JavaScript side of motion preference.
 *
 * globals.css already flattens animation, transition and scroll-behavior under
 * `@media (prefers-reduced-motion: reduce)`, and for anything drawn purely in
 * CSS that is the whole answer — the stylesheet wins and no component has to
 * think about it.
 *
 * It is not the answer for motion a component *schedules*. A stylesheet cannot
 * cancel a setTimeout, stop a requestAnimationFrame loop, unmount a particle
 * canvas, or prevent a card from auto-dismissing itself four seconds after it
 * appeared. CSS strips the visual smoothing off that work and leaves the work
 * running — so a reader who asked for less motion still gets things moving and
 * disappearing under them, just without the easing.
 *
 * So the rule for LMS components is: anything that schedules, animates in JS,
 * or auto-advances must read `useReducedMotion()` and render a genuinely
 * static branch when it returns true. Do not schedule and then hide; do not
 * rely on the stylesheet to undo something JavaScript is still doing.
 *
 * This file is `.ts` and holds no JSX on purpose, so it can be imported by any
 * client module — including ones that are themselves imported by server
 * components — without dragging a component tree along with it.
 */

import { useSyncExternalStore } from 'react';

/** The one media query. Written once so the hook and the probe agree on it. */
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

/** Politeness of a live-region announcement. Consumed by <Announcer />. */
export type Politeness = 'polite' | 'assertive';

/**
 * Does this reader want less motion?
 *
 * SSR-safe: with no `window` there is no preference to read, and the honest
 * answer for markup that has not reached a browser yet is `false`. Callers
 * that need the real value on the client should use the hook below, which
 * re-renders when the answer arrives; this function is for one-shot reads
 * inside event handlers, where the component has already mounted.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(REDUCE_QUERY).matches;
}

/**
 * Subscribe to changes of the preference.
 *
 * `addEventListener('change')` rather than the deprecated `addListener`, and
 * the returned function unsubscribes — React calls it on unmount and whenever
 * the store identity changes, so a component that mounts and unmounts a
 * hundred times leaves no listeners behind.
 */
function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const query = window.matchMedia(REDUCE_QUERY);
  query.addEventListener('change', onStoreChange);
  return () => query.removeEventListener('change', onStoreChange);
}

/**
 * The snapshot React uses while rendering on the server, and for the first
 * client render that has to match it.
 *
 * It is deliberately `false` — not "unknown", not the real value. The server
 * cannot know the preference, so if the client's first render disagreed with
 * the server's, React 19 would report a hydration mismatch. Returning `false`
 * on both sides makes the markup agree, and the real value arrives in the
 * effect that follows immediately after hydration, before any scheduled
 * motion could have started.
 */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * `true` when the reader has asked for reduced motion.
 *
 * Re-renders the component if the preference changes mid-session, which does
 * happen: a system-wide accessibility toggle flips it live, and a card that
 * only checked once at mount would keep animating.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, getServerSnapshot);
}
