'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute, transaction } from '@/lib/db';
import { audit, currentUser, setMembershipStatus } from '@/lib/auth';
import { COURSE_CONTENT } from '@/lib/course-content';
import { COURSES } from '@/lib/courses';
import { generateCode, type CertificateSnapshot } from '@/lib/certificates';
import { isLocale, type Locale } from '@/lib/i18n';

/**
 * Recording a finished course.
 *
 * The browser sends which option was picked for each question. It does NOT
 * send a score, and the score it computed for its own feedback is ignored:
 * this decides whether a certificate is issued, so it is recomputed here
 * against the course content.
 */

export type CompleteResult =
  | { ok: true; score: number; passed: boolean; certificateCode: string | null }
  | { ok: false; reason: 'unauthenticated' | 'unknown_course' | 'no_questions' | 'db' };

type QuizBlock = { type: 'quiz'; id: string; correct: number };

function quizzesIn(slug: string): QuizBlock[] {
  const course = COURSE_CONTENT[slug];
  if (!course) return [];

  const found: QuizBlock[] = [];
  for (const mod of course.modules) {
    for (const block of mod.blocks) {
      if (block.type === 'quiz' && typeof block.id === 'string') {
        found.push({ type: 'quiz', id: block.id, correct: block.correct });
      }
    }
  }
  return found;
}

export async function completeCourseAction(
  slug: string,
  picks: Record<string, number>,
  lang: Locale,
): Promise<CompleteResult> {
  const locale: Locale = isLocale(lang) ? lang : 'ar';
  if (!isDbConfigured()) return { ok: false, reason: 'db' };

  const user = await currentUser();
  if (!user) return { ok: false, reason: 'unauthenticated' };

  const meta = COURSES.find((c) => c.slug === slug);
  const content = COURSE_CONTENT[slug];
  const quizzes = quizzesIn(slug);
  if (!meta || !content || meta.status !== 'available') {
    return { ok: false, reason: 'unknown_course' };
  }
  if (quizzes.length === 0) return { ok: false, reason: 'no_questions' };

  // Unanswered counts as wrong. Skipping a question is not a way to raise a score.
  const right = quizzes.filter((q) => picks[q.id] === q.correct).length;
  const score = Math.round((right / quizzes.length) * 100);
  const passed = score >= content.passMark;

  let certificateCode: string | null = null;

  try {
    await transaction(async (client) => {
      await client.query(
        `INSERT INTO course_progress (user_id, course_slug, score, passed, completed_at)
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (user_id, course_slug) DO UPDATE SET
           -- Keep the best attempt: a later worse run should not take away
           -- a pass someone already earned.
           score = GREATEST(course_progress.score, EXCLUDED.score),
           passed = course_progress.passed OR EXCLUDED.passed,
           completed_at = COALESCE(course_progress.completed_at, EXCLUDED.completed_at)`,
        [user.id, slug, score, passed],
      );

      if (!passed) return;

      const title = meta.title;
      const snapshot: CertificateSnapshot = {
        fullName: user.fullName,
        titleAr: `شهادة إتمام — ${title.ar}`,
        titleEn: `Certificate of completion — ${title.en}`,
      };

      const code = generateCode();
      // uq_cert_course_once means a second pass simply does not issue again.
      const inserted = await client.query(
        `INSERT INTO certificates (id, code, user_id, kind, course_slug, snapshot)
         VALUES ($1, $2, $3, 'course', $4, $5)
         ON CONFLICT (user_id, course_slug) WHERE kind = 'course' DO NOTHING
         RETURNING code`,
        [randomUUID(), code, user.id, slug, JSON.stringify(snapshot)],
      );
      if (inserted.rows.length > 0) certificateCode = code;
    });
  } catch {
    return { ok: false, reason: 'db' };
  }

  // Finishing a course moves someone off the bare registered_user status.
  if (user.membershipStatus === 'registered_user') {
    await setMembershipStatus({ userId: user.id, next: 'course_participant' });
  }

  await audit({
    actorId: user.id,
    action: passed ? 'course.passed' : 'course.attempted',
    targetType: 'course',
    targetId: slug,
    newValue: { score },
  });

  revalidatePath(`/${locale}/account`);
  return { ok: true, score, passed, certificateCode };
}

/** Records that someone opened a course, without waiting for a result. */
export async function markCourseStartedAction(slug: string): Promise<void> {
  if (!isDbConfigured()) return;
  const user = await currentUser();
  if (!user) return;

  await execute(
    `INSERT INTO course_progress (user_id, course_slug)
     VALUES ($1, $2)
     ON CONFLICT (user_id, course_slug) DO NOTHING`,
    [user.id, slug],
  );
}
