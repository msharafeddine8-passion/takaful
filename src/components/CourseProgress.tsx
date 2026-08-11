'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Collects quiz answers across a whole course page.
 *
 * Each Quiz is rendered deep inside the content blocks and knows nothing
 * about the others, so they report into this context and the finish bar at
 * the bottom reads the total.
 *
 * What is stored is which option the person picked, not whether it was right.
 * The client marks answers only to show feedback; the server recomputes the
 * score from the course content before recording anything, because a score
 * that decides whether a certificate is issued cannot be taken on the
 * browser's word.
 */

export type Picks = Record<string, number>;

type Ctx = {
  pick: (questionId: string, optionIndex: number) => void;
  picks: Picks;
  total: number;
};

const CourseCtx = createContext<Ctx | null>(null);

export function CourseProgressProvider({
  children,
  totalQuestions,
}: {
  children: ReactNode;
  totalQuestions: number;
}) {
  const [picks, setPicks] = useState<Picks>({});

  const pick = useCallback((questionId: string, optionIndex: number) => {
    // The first answer stands. Answering again after seeing the feedback
    // would make the score meaningless.
    setPicks((prev) => (questionId in prev ? prev : { ...prev, [questionId]: optionIndex }));
  }, []);

  const value = useMemo<Ctx>(() => ({ pick, picks, total: totalQuestions }), [pick, picks, totalQuestions]);

  return <CourseCtx.Provider value={value}>{children}</CourseCtx.Provider>;
}

/** Returns null outside a provider, so a Quiz can still render on its own. */
export function useCourseProgress(): Ctx | null {
  return useContext(CourseCtx);
}
