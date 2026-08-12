'use server';

import { revalidatePath } from 'next/cache';
import { isDbConfigured } from '@/lib/db';
import { audit, currentUser, setMembershipStatus } from '@/lib/auth';
import {
  questionsIn,
  passMarkFor,
  isCoursePublished,
  recordAnswer,
  submitAttempt,
  markModuleRead,
  ensureCourseCertificate,
} from '@/lib/academy';
import { recomputeAchievements } from '@/lib/achievements';
import { isLocale, type Locale } from '@/lib/i18n';

/**
 * Taking a course.
 *
 * Two things the browser is never trusted with: the answer key, and the
 * score. It sends which option was tapped; everything else happens here.
 */

// ------------------------------------------------------------------ answering

export type AnswerResult =
  | { ok: true; correct: boolean; feedback: string; recorded: boolean }
  | { ok: false; reason: 'unknown_question' | 'bad_choice' | 'no_attempt' | 'db' };

/**
 * Checks one answer.
 *
 * A signed-in learner's first answer is recorded and stands. A visitor with
 * no account still gets to try the questions and read the explanation —
 * nothing is being scored, so there is nothing to protect — but the correct
 * option is still never sent to their browser.
 */
export async function answerQuestionAction(
  slug: string,
  questionId: string,
  displayedIndex: number,
  lang: Locale,
): Promise<AnswerResult> {
  const locale: Locale = isLocale(lang) ? lang : 'ar';
  const question = questionsIn(slug).find((q) => q.id === questionId);
  if (!question) return { ok: false, reason: 'unknown_question' };

  const user = isDbConfigured() ? await currentUser() : null;

  if (!user) {
    // No attempt, so no shuffle: what was shown is the authored order.
    if (
      !Number.isInteger(displayedIndex) ||
      displayedIndex < 0 ||
      displayedIndex >= question.options.length
    ) {
      return { ok: false, reason: 'bad_choice' };
    }
    return {
      ok: true,
      correct: displayedIndex === question.correct,
      feedback: question.feedback[locale],
      recorded: false,
    };
  }

  try {
    const verdict = await recordAnswer(user.id, slug, questionId, displayedIndex, locale);
    if (!verdict.ok) return verdict;
    return { ok: true, correct: verdict.correct, feedback: verdict.feedback, recorded: true };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

// ------------------------------------------------------------------ finishing

export type CompleteResult =
  | { ok: true; score: number; passed: boolean; certificateCode: string | null }
  | {
      ok: false;
      reason: 'unauthenticated' | 'unknown_course' | 'no_questions' | 'no_attempt' | 'db';
    };

export async function completeCourseAction(
  slug: string,
  lang: Locale,
): Promise<CompleteResult> {
  const locale: Locale = isLocale(lang) ? lang : 'ar';
  if (!isDbConfigured()) return { ok: false, reason: 'db' };

  const user = await currentUser();
  if (!user) return { ok: false, reason: 'unauthenticated' };

  // A draft course can be read but not completed: no score, no certificate.
  if (!isCoursePublished(slug)) return { ok: false, reason: 'unknown_course' };
  if (questionsIn(slug).length === 0) return { ok: false, reason: 'no_questions' };

  let graded: Awaited<ReturnType<typeof submitAttempt>>;
  try {
    graded = await submitAttempt(user.id, slug);
  } catch {
    return { ok: false, reason: 'db' };
  }
  if (!graded) return { ok: false, reason: 'no_attempt' };

  let certificateCode: string | null = null;

  if (graded.passed) {
    try {
      certificateCode = await ensureCourseCertificate(user.id, slug, user.fullName);
    } catch {
      // The pass is already in the ledger. Failing to mint the paper here must
      // not cost the learner their result — the certificates page calls the
      // same function and will issue it on their next visit.
      certificateCode = null;
    }

    // Finishing a course moves someone off the bare registered_user status.
    if (user.membershipStatus === 'registered_user') {
      await setMembershipStatus({ userId: user.id, next: 'course_participant' });
    }

    // A badge should be waiting when they get to the page, not computed only
    // when they happen to open it. Failing here costs nothing: the page
    // recomputes too.
    await recomputeAchievements(user.id).catch(() => {});
  }

  await audit({
    actorId: user.id,
    action: graded.passed ? 'course.passed' : 'course.attempted',
    targetType: 'course',
    targetId: slug,
    newValue: { score: graded.score, passMark: passMarkFor(slug), answered: graded.answered },
  });

  revalidatePath(`/${locale}/account`);
  revalidatePath(`/${locale}/academy/${slug}`);
  return { ok: true, score: graded.score, passed: graded.passed, certificateCode };
}

// ------------------------------------------------------------------- reading

/** Marks a module read, so returning to the course lands where they stopped. */
export async function markModuleReadAction(slug: string, moduleId: string): Promise<void> {
  if (!isDbConfigured()) return;
  const user = await currentUser();
  if (!user) return;
  await markModuleRead(user.id, slug, moduleId);
}
