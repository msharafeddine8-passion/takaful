import 'server-only';
import { query, queryOne, transaction } from '../db';
import { randomUUID } from 'node:crypto';
import { generateCode, type CertificateSnapshot } from '../certificates';
import { RUN_REQUIRED_FROM } from './gate';

/**
 * Issuing the programme's credentials.
 *
 * Four layers: the orientation, each course, each level, and the whole path.
 * They differ in what they claim, not in how they behave — one code format,
 * one verification page, one revocation rule.
 *
 * THREE RULES THAT ARE NOT NEGOTIABLE
 *
 * 1. Nothing is issued that has not been earned. Every function here re-checks
 *    the underlying facts against the database rather than trusting a caller.
 *    The brief asks specifically that a certificate cannot be conjured through
 *    the API, and the only way to mean it is to make the earning condition the
 *    same query that issues.
 *
 * 2. Issuing is idempotent. A partial unique index makes a second live
 *    credential for the same subject impossible at the database level, and
 *    every function returns the existing one rather than failing. A learner
 *    who double-clicks gets one certificate.
 *
 * 3. What it says is frozen. The snapshot holds the holder's name, the title
 *    in both languages, the skills and the hours as they were at issue. A
 *    course edited next year does not rewrite a certificate printed today —
 *    a verifier who checks the same code twice must see the same document.
 *
 * WHAT THE WORDING MAY CLAIM
 *
 * "شهادة إتمام صادرة عن جمعية تكافل" — a certificate of completion issued by
 * the association. Never accredited, never internationally recognised: the
 * association holds no such accreditation, and a claim like that on a
 * volunteer's CV is a claim they would have to defend.
 */

export type IssueResult = {
  code: string;
  /** False when a live credential already existed. */
  created: boolean;
};

/** The holder's name as it should appear, or null if they have no profile. */
async function holderName(userId: string): Promise<string | null> {
  const row = await queryOne<{ full_name: string }>(
    'SELECT full_name FROM profiles WHERE user_id = $1',
    [userId],
  );
  return row?.full_name ?? null;
}

/**
 * The orientation and every course share one shape, so they share one
 * function. `kind` differs only so the verification page can say "الدورة
 * التمهيدية" rather than listing it among the ordinary courses.
 */
export async function issueCourseCredential(
  userId: string,
  slug: string,
): Promise<IssueResult | null> {
  return transaction(async (client) => {
    // The earning condition IS the query. A caller cannot assert a pass.
    const earned = await client.query<{
      id: string;
      kind: string;
      title_ar: string;
      title_en: string;
      minutes: number;
    }>(
      `SELECT c.id, c.kind, c.title_ar, c.title_en, c.minutes
         FROM courses c
        WHERE c.slug = $1
          AND EXISTS (
            SELECT 1 FROM course_attempts a
             WHERE a.user_id = $2 AND a.course_slug = c.slug AND a.passed
          )`,
      [slug, userId],
    );
    if (earned.rowCount === 0) return null;
    const course = earned.rows[0];

    // A challenge is not a credential of its own; it earns the level.
    if (course.kind === 'challenge') return null;

    const live = await client.query<{ code: string }>(
      `SELECT code FROM certificates
        WHERE user_id = $1 AND kind IN ('course','orientation')
          AND course_slug = $2 AND revoked_at IS NULL`,
      [userId, slug],
    );
    if (live.rowCount) return { code: live.rows[0].code, created: false };

    const skills = await client.query<{ text_ar: string; text_en: string }>(
      'SELECT text_ar, text_en FROM course_outcomes WHERE course_id = $1 ORDER BY sort_order',
      [course.id],
    );
    const name = await holderName(userId);

    const snapshot: CertificateSnapshot = {
      fullName: name ?? '',
      titleAr: course.title_ar,
      titleEn: course.title_en,
      learningMinutes: course.minutes,
      skillsAr: skills.rows.map((s) => s.text_ar),
      skillsEn: skills.rows.map((s) => s.text_en),
    };

    const code = generateCode();
    await client.query(
      `INSERT INTO certificates (id, code, user_id, kind, course_slug,
                                 learning_minutes, skills, snapshot)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb)`,
      [
        randomUUID(),
        code,
        userId,
        course.kind === 'orientation' ? 'orientation' : 'course',
        slug,
        course.minutes,
        JSON.stringify(skills.rows),
        JSON.stringify(snapshot),
      ],
    );
    return { code, created: true };
  });
}

/**
 * A level credential. Earned only when every course in the level is passed —
 * the five courses and the challenge.
 *
 * `level_progress` is not consulted as the authority: it is the record written
 * when the level was finished, and reading it here would mean a credential
 * could be issued from a row rather than from the work. It is written by the
 * same flow, but the check below stands on its own.
 */
export async function issueLevelCredential(
  userId: string,
  levelNumber: number,
): Promise<IssueResult | null> {
  return transaction(async (client) => {
    const level = await client.query<{
      id: string;
      program_id: string;
      title_ar: string;
      title_en: string;
    }>(
      `SELECT l.id, l.program_id, l.title_ar, l.title_en
         FROM program_levels l
         JOIN programs p ON p.id = l.program_id AND p.is_default
        WHERE l.number = $1`,
      [levelNumber],
    );
    if (level.rowCount === 0) return null;
    const lvl = level.rows[0];

    /*
     * Level 0 earns no level credential.
     *
     * It holds one course — the orientation — and that already issues its own
     * credential. A level certificate on top would be the same claim twice,
     * and a volunteer holding two certificates for one 45-minute course has
     * something that looks inflated to whoever reads it.
     */
    if (levelNumber === 0) return null;

    /*
     * Every course of the level that counts towards it, and none unpassed.
     *
     * `kind <> 'challenge'` because the level's marked paper stopped closing
     * the level — the decision run does that now, and the paper is revision.
     * Without this line the certificate would still be withheld until somebody
     * sat a paper nothing else asks of them.
     */
    const outstanding = await client.query<{ slug: string }>(
      `SELECT c.slug FROM courses c
        WHERE c.level_id = $1
          AND c.kind <> 'challenge'
          AND NOT EXISTS (
            SELECT 1 FROM course_attempts a
             WHERE a.user_id = $2 AND a.course_slug = c.slug AND a.passed
          )`,
      [lvl.id, userId],
    );
    if (outstanding.rowCount !== 0) return null;

    /*
     * And the decision run, which is what the certificate now attests.
     *
     * Finished, not cleared. A `review` verdict earns the certificate exactly
     * as a `clear` one does: the level asks the volunteer to walk a real
     * situation to its end and see what their decisions cost, and withholding
     * the certificate on the verdict would turn that into a mark — the one
     * thing this exercise was built never to produce.
     */
    const closed = await client.query<{ by_run: boolean; by_paper: boolean }>(
      `SELECT EXISTS (
                SELECT 1 FROM level_challenge_runs r
                 WHERE r.user_id = $1 AND r.level_number = $2
                   AND r.finished_at IS NOT NULL) AS by_run,
              EXISTS (
                SELECT 1 FROM course_attempts a
                  JOIN courses c ON c.slug = a.course_slug
                 WHERE a.user_id = $1 AND a.passed AND c.kind = 'challenge'
                   AND c.level_id = $3
                   AND a.submitted_at IS NOT NULL AND a.submitted_at < $4) AS by_paper`,
      [userId, levelNumber, lvl.id, RUN_REQUIRED_FROM],
    );
    const how = closed.rows[0];
    if (!how.by_run && !how.by_paper) return null;
    /*
     * Which one, frozen into the snapshot, because the sheet says different
     * words for each and says them at view time. `run` wins a tie: somebody who
     * was grandfathered and then walked the run anyway did both, and the run is
     * the larger claim.
     */
    const closedBy: 'run' | 'paper' = how.by_run ? 'run' : 'paper';

    const live = await client.query<{ code: string }>(
      `SELECT code FROM certificates
        WHERE user_id = $1 AND kind = 'level' AND level_id = $2 AND revoked_at IS NULL`,
      [userId, lvl.id],
    );
    if (live.rowCount) return { code: live.rows[0].code, created: false };

    const covered = await client.query<{
      slug: string;
      minutes: number;
      text_ar: string | null;
      text_en: string | null;
    }>(
      /*
       * The same filter as the outstanding check above, and it has to be.
       *
       * This builds what the certificate CLAIMS — the courses named on it, the
       * skills listed, the learning minutes totalled. The paper is optional
       * now, so counting its minutes would print a figure for study the holder
       * may never have done, on a document whose whole value is that a stranger
       * can trust what it says.
       */
      `SELECT c.slug, c.minutes, o.text_ar, o.text_en
         FROM courses c
         LEFT JOIN course_outcomes o ON o.course_id = c.id
        WHERE c.level_id = $1 AND c.kind <> 'challenge'
        ORDER BY c.sort_order, o.sort_order`,
      [lvl.id],
    );

    const slugs = [...new Set(covered.rows.map((r) => r.slug))];
    const minutes = [...new Set(covered.rows.map((r) => `${r.slug}:${r.minutes}`))]
      .reduce((total, pair) => total + Number(pair.split(':')[1]), 0);

    const name = await holderName(userId);
    const snapshot: CertificateSnapshot = {
      fullName: name ?? '',
      titleAr: lvl.title_ar,
      titleEn: lvl.title_en,
      levelNumber,
      closedBy,
      courses: slugs,
      learningMinutes: minutes,
      skillsAr: covered.rows.map((r) => r.text_ar).filter((s): s is string => Boolean(s)),
      skillsEn: covered.rows.map((r) => r.text_en).filter((s): s is string => Boolean(s)),
    };

    const code = generateCode();
    await client.query(
      `INSERT INTO certificates (id, code, user_id, kind, level_id, program_id,
                                 learning_minutes, skills, snapshot)
       VALUES ($1, $2, $3, 'level', $4, $5, $6, $7::jsonb, $8::jsonb)`,
      [randomUUID(), code, userId, lvl.id, lvl.program_id, minutes,
       JSON.stringify(slugs), JSON.stringify(snapshot)],
    );
    return { code, created: true };
  });
}

/**
 * The whole path. Earned when every level of the default programme has a live
 * level credential — which transitively means the orientation, all thirty
 * courses, and a finished decision run at each of the six levels.
 *
 * Nothing in this function changed when the decision run replaced the marked
 * paper, and that is the point: it asks whether the six level certificates
 * stand, and what it takes to earn one of those is stated once, next door.
 *
 * Checked against live credentials rather than against passes, because this
 * one claims that the six level certificates stand. If a level is revoked, the
 * path credential should not have been issued.
 */
export async function issueProgrammeCredential(userId: string): Promise<IssueResult | null> {
  return transaction(async (client) => {
    const programme = await client.query<{ id: string; title_ar: string; title_en: string }>(
      'SELECT id, title_ar, title_en FROM programs WHERE is_default',
    );
    if (programme.rowCount === 0) return null;
    const prog = programme.rows[0];

    /*
     * Levels 1-6 need a level credential; level 0 needs the orientation one.
     *
     * `number >= 1` is the whole point of this filter. Without it the query
     * demanded a level credential for level 0 too — one that is deliberately
     * never issued, because the orientation carries its own — so the path
     * credential could never be earned by anybody. The probe found it by
     * completing all six levels and getting nothing.
     */
    const missing = await client.query<{ number: number }>(
      `SELECT l.number FROM program_levels l
        WHERE l.program_id = $1 AND l.number >= 1
          AND NOT EXISTS (
            SELECT 1 FROM certificates c
             WHERE c.user_id = $2 AND c.kind = 'level'
               AND c.level_id = l.id AND c.revoked_at IS NULL
          )`,
      [prog.id, userId],
    );
    if (missing.rowCount !== 0) return null;

    // And the orientation itself, which is the one thing the whole path rests
    // on: nobody completes this programme without having been told the rules.
    const oriented = await client.query<{ code: string }>(
      `SELECT c.code FROM certificates c
        WHERE c.user_id = $1 AND c.kind = 'orientation' AND c.revoked_at IS NULL`,
      [userId],
    );
    if (oriented.rowCount === 0) return null;

    const live = await client.query<{ code: string }>(
      `SELECT code FROM certificates
        WHERE user_id = $1 AND kind = 'program' AND program_id = $2 AND revoked_at IS NULL`,
      [userId, prog.id],
    );
    if (live.rowCount) return { code: live.rows[0].code, created: false };

    const total = await client.query<{ minutes: string }>(
      `SELECT COALESCE(SUM(minutes), 0)::text AS minutes FROM courses WHERE program_id = $1`,
      [prog.id],
    );

    const name = await holderName(userId);
    const snapshot: CertificateSnapshot = {
      fullName: name ?? '',
      // The name the brief specified, not a description of it.
      titleAr: 'شهادة إتمام مسار المتطوّع المتكامل',
      titleEn: 'Certificate of Completion — The Complete Volunteer Path',
      learningMinutes: Number(total.rows[0].minutes),
    };

    const code = generateCode();
    await client.query(
      `INSERT INTO certificates (id, code, user_id, kind, program_id,
                                 learning_minutes, snapshot)
       VALUES ($1, $2, $3, 'program', $4, $5, $6::jsonb)`,
      [randomUUID(), code, userId, prog.id, Number(total.rows[0].minutes), JSON.stringify(snapshot)],
    );
    return { code, created: true };
  });
}

/**
 * Called after any pass. Issues everything now earned, in order, and returns
 * what was newly created — so a single request can take a learner from
 * finishing a challenge to holding a level certificate.
 *
 * Order matters: the programme credential depends on the level ones existing.
 */
export async function issueEarnedCredentials(userId: string): Promise<string[]> {
  const issued: string[] = [];

  const passed = await query<{ course_slug: string }>(
    'SELECT DISTINCT course_slug FROM course_attempts WHERE user_id = $1 AND passed',
    [userId],
  );
  for (const { course_slug } of passed) {
    const result = await issueCourseCredential(userId, course_slug);
    if (result?.created) issued.push(result.code);
  }

  const levels = await query<{ number: number }>(
    `SELECT l.number FROM program_levels l
       JOIN programs p ON p.id = l.program_id AND p.is_default
      ORDER BY l.number`,
  );
  for (const { number } of levels) {
    const result = await issueLevelCredential(userId, number);
    if (result?.created) issued.push(result.code);
  }

  const path = await issueProgrammeCredential(userId);
  if (path?.created) issued.push(path.code);

  return issued;
}

/**
 * Revoke, with a reason. Never deleted: a verifier who saw a certificate last
 * month must be able to find out that it no longer stands, and a row that
 * vanished would look to them like a code that was never real.
 */
export async function revokeCredential(code: string, reason: string): Promise<boolean> {
  if (reason.trim().length < 3) return false;
  const rows = await query<{ id: string }>(
    `UPDATE certificates SET revoked_at = now(), revoke_reason = $2
      WHERE code = $1 AND revoked_at IS NULL
      RETURNING id`,
    [code, reason.trim()],
  );
  return rows.length > 0;
}
