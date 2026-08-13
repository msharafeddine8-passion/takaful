'use server';

import { revalidatePath } from 'next/cache';
import { queryOne, transaction } from '../db';
import { currentUser, audit } from '../auth';
import { can } from '../authz';

/**
 * Editing the programme.
 *
 * Every export in this file is a network endpoint. That is worth saying at the
 * top because an unused export here would still be callable, and one already
 * cost this codebase a bug that promoted people's membership without their
 * doing anything.
 *
 * WHAT AN EDIT DOES, IN ORDER
 *
 *   1. Checks the capability. Server side, every time, before reading input.
 *   2. Validates. Nothing reaches the database on trust.
 *   3. Writes the previous state to content_revisions.
 *   4. Applies the change and sets origin = 'admin'.
 *   5. Writes an audit row.
 *
 * Step 3 is the one that is easy to skip and expensive to add later: without
 * it, a bad edit to a safeguarding course cannot be read back or undone, and
 * "who changed this, and what did it say before" has no answer. Step 4 is what
 * stops the seed reverting the edit on its next run.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

const MAX = { title: 160, summary: 400 } as const;

function clean(value: FormDataEntryValue | null, limit: number): string {
  return String(value ?? '').trim().slice(0, limit);
}

/**
 * Update a course's own fields. Not its modules or questions — those are
 * separate surfaces with their own revisions.
 */
export async function updateCourseAction(form: FormData): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, error: 'unauthorised' };
  if (!can(user, 'programme.edit')) return { ok: false, error: 'forbidden' };

  const slug = clean(form.get('slug'), 80);
  const titleAr = clean(form.get('titleAr'), MAX.title);
  const titleEn = clean(form.get('titleEn'), MAX.title);
  const summaryAr = clean(form.get('summaryAr'), MAX.summary);
  const summaryEn = clean(form.get('summaryEn'), MAX.summary);
  const minutes = Number(form.get('minutes'));
  const passMark = Number(form.get('passMark'));

  // Both languages, always. A course that exists in one is a course that is
  // broken for half the volunteers, and the site treats a missing string as a
  // compile error everywhere else.
  if (!titleAr || !titleEn || !summaryAr || !summaryEn) {
    return { ok: false, error: 'bothLanguages' };
  }
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 240) {
    return { ok: false, error: 'minutesRange' };
  }
  if (!Number.isInteger(passMark) || passMark < 50 || passMark > 100) {
    return { ok: false, error: 'passMarkRange' };
  }

  const changed = await transaction(async (client) => {
    // FOR UPDATE: two editors saving at once would otherwise interleave, and
    // the revision written would not be the state either of them saw.
    const before = await client.query<Record<string, unknown>>(
      `SELECT id, slug, title_ar, title_en, summary_ar, summary_en, minutes,
              pass_mark, status, content_version, origin
         FROM courses WHERE slug = $1 FOR UPDATE`,
      [slug],
    );
    if (before.rowCount === 0) return null;
    const row = before.rows[0];
    const version = Number(row.content_version) + 1;

    await client.query(
      `INSERT INTO content_revisions (entity_type, entity_id, version, data, note, author_id)
       VALUES ('course', $1, $2, $3::jsonb, $4, $5)`,
      [row.id, version, JSON.stringify(row), clean(form.get('note'), 300) || null, user.id],
    );

    await client.query(
      `UPDATE courses
          SET title_ar = $2, title_en = $3, summary_ar = $4, summary_en = $5,
              minutes = $6, pass_mark = $7,
              content_version = $8, origin = 'admin', updated_at = now()
        WHERE id = $1`,
      [row.id, titleAr, titleEn, summaryAr, summaryEn, minutes, passMark, version],
    );
    return { id: row.id as string, version };
  });

  if (!changed) return { ok: false, error: 'notFound' };

  await audit({
    actorId: user.id,
    action: 'programme.course.updated',
    targetType: 'course',
    targetId: slug,
    newValue: { titleAr, titleEn, minutes, passMark, version: changed.version },
    reason: clean(form.get('note'), 300) || undefined,
  });

  revalidatePath('/[lang]/staff/programme', 'page');
  revalidatePath('/[lang]/academy', 'page');
  return { ok: true };
}

/**
 * Move a course between draft, review and published.
 *
 * Publishing is a separate capability from editing, so the person who wrote a
 * course is not necessarily the person who decides volunteers may act on it.
 */
export async function setCourseStatusAction(form: FormData): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, error: 'unauthorised' };

  const slug = clean(form.get('slug'), 80);
  const status = clean(form.get('status'), 20);
  if (!['draft', 'review', 'published', 'archived'].includes(status)) {
    return { ok: false, error: 'badStatus' };
  }

  // Moving *to* published is the consequential direction. Sending something
  // back to draft is a correction and should not need the higher capability —
  // otherwise a content manager who spots a mistake in a live course has to go
  // find an admin before they can take it down.
  const needsPublish = status === 'published';
  if (needsPublish ? !can(user, 'programme.publish') : !can(user, 'programme.edit')) {
    return { ok: false, error: 'forbidden' };
  }

  const course = await queryOne<{ id: string; status: string; modules: string }>(
    `SELECT c.id, c.status,
            (SELECT count(*) FROM modules m WHERE m.course_id = c.id)::text AS modules
       FROM courses c WHERE c.slug = $1`,
    [slug],
  );
  if (!course) return { ok: false, error: 'notFound' };

  /*
   * A course with no content cannot be published.
   *
   * Not a nicety: the catalogue links to every published course, and a
   * published course with nothing in it is a volunteer who clicks through to
   * an empty page and concludes the academy is broken. The thirty-six unwritten
   * courses stay drafts precisely because this holds.
   */
  if (status === 'published' && Number(course.modules) === 0) {
    return { ok: false, error: 'noContent' };
  }

  await transaction(async (client) => {
    await client.query('UPDATE courses SET status = $2, updated_at = now() WHERE id = $1', [
      course.id,
      status,
    ]);
    await client.query(
      `INSERT INTO content_revisions (entity_type, entity_id, version, data, note, author_id)
       SELECT 'course.status', $1, COALESCE(MAX(version), 0) + 1, $2::jsonb, $3, $4
         FROM content_revisions WHERE entity_type = 'course.status' AND entity_id = $1`,
      [
        course.id,
        JSON.stringify({ from: course.status, to: status }),
        clean(form.get('note'), 300) || null,
        user.id,
      ],
    );
  });

  await audit({
    actorId: user.id,
    action: 'programme.course.status',
    targetType: 'course',
    targetId: slug,
    previousValue: { status: course.status },
    newValue: { status },
    reason: clean(form.get('note'), 300) || undefined,
  });
  revalidatePath('/[lang]/staff/programme', 'page');
  revalidatePath('/[lang]/academy', 'page');
  return { ok: true };
}

/**
 * Mark a course as reviewed by a named person, now.
 *
 * Separate from publishing because they answer different questions: published
 * means volunteers can read it, reviewed means somebody checked it is still
 * true. Safeguarding and first-aid material can be correct the day it is
 * written and out of date two years later, and a course carrying a review date
 * makes that visible instead of leaving it to be assumed.
 */
export async function markReviewedAction(form: FormData): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, error: 'unauthorised' };
  if (!can(user, 'programme.edit')) return { ok: false, error: 'forbidden' };

  const slug = clean(form.get('slug'), 80);
  const course = await queryOne<{ id: string }>('SELECT id FROM courses WHERE slug = $1', [slug]);
  if (!course) return { ok: false, error: 'notFound' };

  await queryOne(
    'UPDATE courses SET reviewed_at = now(), reviewed_by = $2, updated_at = now() WHERE id = $1 RETURNING id',
    [course.id, user.id],
  );

  await audit({
    actorId: user.id,
    action: 'programme.course.reviewed',
    targetType: 'course',
    targetId: slug,
  });
  revalidatePath('/[lang]/staff/programme', 'page');
  return { ok: true };
}
