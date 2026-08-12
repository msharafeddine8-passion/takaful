'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Tracks how far through a course's questions someone is.
 *
 * Each Quiz is rendered deep inside the content blocks and knows nothing
 * about the others, so they report in here and the finish bar at the bottom
 * reads the total.
 *
 * It holds which questions have been answered — not what was answered, and
 * not whether it was right. Both of those live on the server: the answer key
 * is never sent to the browser, and the score that decides a certificate is
 * computed from what the database recorded, never from anything this
 * component says.
 *
 * `answered` starts from what the server already knows, so someone who closed
 * the tab halfway comes back to a page that remembers.
 */

type Ctx = {
  markAnswered: (questionId: string) => void;
  answered: Set<string>;
  total: number;
};

const CourseCtx = createContext<Ctx | null>(null);

export function CourseProgressProvider({
  children,
  totalQuestions,
  initiallyAnswered = [],
}: {
  children: ReactNode;
  totalQuestions: number;
  initiallyAnswered?: string[];
}) {
  const [answered, setAnswered] = useState<Set<string>>(() => new Set(initiallyAnswered));

  const markAnswered = useCallback((questionId: string) => {
    setAnswered((prev) => {
      if (prev.has(questionId)) return prev;
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({ markAnswered, answered, total: totalQuestions }),
    [markAnswered, answered, totalQuestions],
  );

  return <CourseCtx.Provider value={value}>{children}</CourseCtx.Provider>;
}

/** Returns null outside a provider, so a Quiz can still render on its own. */
export function useCourseProgress(): Ctx | null {
  return useContext(CourseCtx);
}
