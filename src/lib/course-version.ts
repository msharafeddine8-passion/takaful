import { createHash } from 'node:crypto';
import type { CourseContent } from './course-content/types';

/**
 * Which version of a course somebody actually sat.
 *
 * Content gets edited. A question is reworded, an option is corrected, a pass
 * mark moves. Without a record of what was on the screen at the time, an
 * attempt from March is indistinguishable from one taken today, and nobody can
 * answer the only question that matters when a result is disputed: *what was
 * this person actually asked?*
 *
 * Certificates are already safe — they carry a frozen snapshot taken at issue
 * — but attempts carried nothing.
 *
 * ── Why a fingerprint rather than a version number ──────────────────────────
 *
 * A declared `version: 3` on each course would need an author to remember to
 * bump it, across 41 courses, every time they touch one. They will not, and
 * the failure is silent: two different papers both labelled version 3, which
 * is worse than no label because it looks authoritative.
 *
 * A fingerprint cannot be forgotten. It is computed from the content itself,
 * so it changes exactly when the content changes and never when it does not.
 *
 * ── What goes into it ───────────────────────────────────────────────────────
 *
 * Only what changes the meaning of a result: the questions asked, the answers
 * counted correct, the order-independent set of options, the pass mark, and
 * which modules existed. Deliberately NOT the prose, the summaries or the
 * translations — fixing a typo in a paragraph does not make somebody's pass a
 * different pass, and a fingerprint that churns on every copy-edit would make
 * the field meaningless within a month.
 */

/**
 * A short, stable identifier for the gradeable shape of a course.
 *
 * Pure and deterministic: the same content always gives the same string, on
 * any machine, in any order of iteration. probe-version holds that.
 */
export function courseFingerprint(content: CourseContent): string {
  /*
   * Built from a canonical structure rather than from JSON.stringify of the
   * whole object — key order in a literal is an accident of authoring, and a
   * fingerprint that changed when somebody reordered two fields would report
   * edits that never happened.
   */
  const questions = content.modules
    .flatMap((m) => m.blocks)
    .filter((b): b is Extract<typeof b, { type: 'quiz' }> => b.type === 'quiz')
    .map((q) => ({
      id: q.id,
      // The correct answer, and how many options it hid among. Not the option
      // text: rewording "a supervisor" to "your supervisor" does not change
      // what was being tested.
      correct: q.correct,
      options: q.options.length,
    }))
    // Sorted, so authoring order does not masquerade as a content change.
    .sort((a, b) => a.id.localeCompare(b.id));

  const canonical = JSON.stringify({
    slug: content.slug,
    passMark: content.passMark,
    modules: content.modules.map((m) => m.id).sort(),
    questions,
  });

  // Twelve hex characters: ~48 bits. Enough that two of the association's 41
  // courses colliding is not a thing that happens, short enough to read in a
  // log line or an admin table.
  return createHash('sha256').update(canonical).digest('hex').slice(0, 12);
}

/**
 * How an attempt with no recorded version should be described.
 *
 * Existing attempts are NOT back-filled with today's fingerprint. That would
 * assert something untrue — that an attempt from before versioning was sat
 * against the content as it stands now — and the whole point of this field is
 * to stop guessing. They stay null, and null means "before this was recorded",
 * which is honest and is a fact somebody can act on.
 */
export const UNVERSIONED = null;
