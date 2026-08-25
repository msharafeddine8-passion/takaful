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
import { issueEarnedCredentials } from '@/lib/programme/credentials';
import { practicalTaskFor, courseOutcome } from '@/lib/programme/practical';
import { historyFor, holdsCourseCredential } from '@/lib/practical-submissions';
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
  | {
      ok: true;
      score: number;
      passed: boolean;
      certificateCode: string | null;
      /**
       * The paper is passed and the course also asks for written work that no
       * trainer has accepted yet, so the certificate is owed but not issued.
       *
       * Its own flag rather than an absent certificateCode, which already
       * means three other things — a course sat before certificates existed, a
       * credential that failed to mint, a learner who already held one. The
       * finish screen has to tell this case apart from those, because it is
       * the only one where the answer is "somebody is reading it" rather than
       * "check your certificates page".
       */
      awaitingPractical: boolean;
    }
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

  /*
   * The last gate: written work, on the courses that ask for it.
   *
   * Deliberately AFTER submitAttempt. The score is recorded, `passed` is
   * written, gate.ts unlocks the next level from exactly the row it always
   * did, and the ledger says what the learner actually scored. Nothing about
   * the paper changes. What waits is the paper certificate.
   *
   * courseOutcome() returns complete for the thirty-eight courses that set no
   * task, which is the whole of the behaviour that existed before this, and
   * for anybody who already holds the credential — a task added to a course
   * next month must not put last March's volunteers back in a queue.
   */
  const task = practicalTaskFor(slug);
  let awaitingPractical = false;
  if (graded.passed && task) {
    const [history, held] = await Promise.all([
      historyFor(user.id, slug),
      holdsCourseCredential(user.id, slug),
    ]);
    awaitingPractical = !courseOutcome({
      task,
      paperPassed: true,
      history,
      alreadyCertified: held,
    }).complete;
  }

  if (graded.passed && !awaitingPractical) {
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

    /*
     * The level and programme credentials this pass has just earned.
     *
     * ensureCourseCertificate above mints the paper for THIS course. Nothing
     * was issuing the layer above it, so LevelStanding.certificateCode was
     * null for every learner in production and the map's "next certificate"
     * promised a document that would never arrive.
     *
     * Before recomputeAchievements, deliberately: a level badge is derived
     * from a live credential, so the badge engine has to run after the
     * credential exists or it awards nothing until the next pass.
     *
     * Same .catch(() => {}) as below — the pass is already in the ledger and
     * a failure to mint must never cost the learner their result. The
     * certificates page calls the same function on their next visit.
     */
    await issueEarnedCredentials(user.id).catch(() => {});

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
    newValue: {
      score: graded.score,
      passMark: passMarkFor(slug),
      answered: graded.answered,
      ...(awaitingPractical ? { awaitingPractical: true } : {}),
    },
  });

  revalidatePath(`/${locale}/account`);
  /* 'layout' so the player's unit pages under this course go with it. The
   * course path on its own leaves the contents list inside the player still
   * showing the assessment unfinished after it has been passed. */
  revalidatePath(`/${locale}/academy/${slug}`, 'layout');
  return {
    ok: true,
    score: graded.score,
    passed: graded.passed,
    certificateCode,
    awaitingPractical,
  };
}

// ------------------------------------------------------------------- reading

/** Marks a module read, so returning to the course lands where they stopped. */
export async function markModuleReadAction(slug: string, moduleId: string): Promise<void> {
  if (!isDbConfigured()) return;
  const user = await currentUser();
  if (!user) return;
  await markModuleRead(user.id, slug, moduleId);
}
