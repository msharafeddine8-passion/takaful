/*
 * The programme editing rules, checked where they are enforced.
 *
 * The server actions cannot be called from here — they need a request context
 * — so this probe drives the two things underneath them that carry the weight:
 * the capability grants, and the invariants the actions rely on. What it
 * cannot reach is stated at the end rather than left looking covered.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import { can } from '../src/lib/authz.ts';

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail?: unknown) {
  if (passed) { ok++; console.log(`  ok       ${what}${detail === undefined ? '' : `  — ${detail}`}`); }
  else { holes.push(what); console.log(`  HOLE     ${what}${detail === undefined ? '' : `  — ${detail}`}`); }
}

/*
 * The shape `can()` actually takes: a flat array of role strings, and a status
 * that must be 'active'. The first version of this probe passed objects and
 * reported six holes in a grant table that was correct — the fixture was
 * wrong, not the code. Worth the comment, because a probe that lies about the
 * authorisation layer is worse than no probe at all.
 */
const asRole = (role: string) =>
  ({ id: 'probe', email: 'probe@example.invalid', status: 'active', roles: [role] });

await c.connect();

try {
  console.log('\n--- who may edit, and who may publish ---');
  // The split is the point: writing a course and deciding volunteers may act
  // on it are different acts with different consequences.
  for (const role of ['content_manager', 'instructor', 'program_admin', 'super_admin']) {
    check(`${role} may edit the programme`,
      can(asRole(role) as never, 'programme.edit'));
  }
  for (const role of ['volunteer', 'registered_user', 'team_leader', 'field_supervisor']) {
    check(`${role} may not edit the programme`,
      !can(asRole(role) as never, 'programme.edit'));
  }

  check('a content manager may NOT publish',
    !can(asRole('content_manager') as never, 'programme.publish'));
  check('an instructor may NOT publish',
    !can(asRole('instructor') as never, 'programme.publish'));
  check('a programme admin may publish',
    can(asRole('program_admin') as never, 'programme.publish'));
  check('a super admin may publish',
    can(asRole('super_admin') as never, 'programme.publish'));

  console.log('\n--- what the database allows ---');
  const statuses = await c.query<{ def: string }>(`
    SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint
     WHERE conrelid = 'courses'::regclass AND contype = 'c'
       AND pg_get_constraintdef(oid) LIKE '%status%'`);
  check('status is constrained to the four states in the database, not only in code',
    statuses.rows.some((r) => ['draft', 'review', 'published', 'archived']
      .every((s) => r.def.includes(s))),
    statuses.rowCount);

  const marks = await c.query<{ def: string }>(`
    SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint
     WHERE conrelid = 'courses'::regclass AND contype = 'c'
       AND pg_get_constraintdef(oid) LIKE '%pass_mark%'`);
  check('the pass mark is bounded in the database too', (marks.rowCount ?? 0) > 0);

  console.log('\n--- nothing empty is published ---');
  // The action refuses it; this asserts the state it is protecting is true
  // right now, which is the thing a volunteer would actually hit.
  const emptyPublished = await c.query<{ slug: string }>(`
    SELECT c.slug FROM courses c
     WHERE c.status = 'published'
       AND (SELECT count(*) FROM modules m WHERE m.course_id = c.id) = 0`);
  check('no published course has zero modules',
    emptyPublished.rowCount === 0,
    emptyPublished.rows.map((r) => r.slug).join(',') || 'none');

  console.log('\n--- revisions are recorded against a real course ---');
  const orphanRevisions = await c.query<{ n: string }>(`
    SELECT count(*)::text AS n FROM content_revisions r
     WHERE r.entity_type = 'course'
       AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.id = r.entity_id)`);
  check('no course revision points at a course that does not exist',
    orphanRevisions.rows[0].n === '0', orphanRevisions.rows[0].n);

  // A version is unique per entity, so two editors saving at once cannot both
  // claim version 4 and lose one of the two records.
  const dupe = await c.query<{ n: string }>(`
    SELECT count(*)::text AS n FROM (
      SELECT entity_type, entity_id, version FROM content_revisions
      GROUP BY 1,2,3 HAVING count(*) > 1) x`);
  check('a revision version is unique per entity', dupe.rows[0].n === '0', dupe.rows[0].n);

  console.log('\n--- an edit survives the seed (the whole architecture) ---');
  const target = 'digital-basics';
  const before = await c.query<{ id: string; title_ar: string; origin: string; content_version: number }>(
    'SELECT id, title_ar, origin, content_version FROM courses WHERE slug = $1', [target]);
  const row = before.rows[0];
  const marker = `PROBE ${randomUUID().slice(0, 8)}`;

  // Exactly what updateCourseAction does: revision first, then the edit,
  // then origin = 'admin'.
  await c.query(
    `INSERT INTO content_revisions (entity_type, entity_id, version, data, note, author_id)
     VALUES ('course', $1, $2, $3::jsonb, 'probe', NULL)`,
    [row.id, row.content_version + 1, JSON.stringify(row)]);
  await c.query(
    `UPDATE courses SET title_ar = $2, origin = 'admin', content_version = $3 WHERE id = $1`,
    [row.id, marker, row.content_version + 1]);

  const { execSync } = await import('node:child_process');
  execSync('npx tsx --env-file=.env.local scripts/seed-programme.mts', { stdio: 'pipe' });

  const after = await c.query<{ title_ar: string; origin: string }>(
    'SELECT title_ar, origin FROM courses WHERE slug = $1', [target]);
  check('the edit is still there after a re-seed', after.rows[0].title_ar === marker);
  check('and the row is still the admin’s', after.rows[0].origin === 'admin');

  const revision = await c.query<{ data: { title_ar: string } }>(
    `SELECT data FROM content_revisions
      WHERE entity_type = 'course' AND entity_id = $1 ORDER BY version DESC LIMIT 1`, [row.id]);
  check('the previous wording can be read back from the revision',
    revision.rows[0].data.title_ar === row.title_ar,
    revision.rows[0].data.title_ar);

  // Restore, including origin, so the seed owns this row again.
  await c.query('UPDATE courses SET title_ar = $2, origin = $3, content_version = $4 WHERE id = $1',
    [row.id, row.title_ar, row.origin, row.content_version]);
  await c.query(`DELETE FROM content_revisions WHERE entity_id = $1 AND note = 'probe'`, [row.id]);

  const restored = await c.query<{ title_ar: string; origin: string }>(
    'SELECT title_ar, origin FROM courses WHERE slug = $1', [target]);
  check('the probe restored what it changed',
    restored.rows[0].title_ar === row.title_ar && restored.rows[0].origin === row.origin);
} finally {
  await c.end();
}

console.log('\n--- not covered here ---');
console.log('  The server actions themselves need a request context, so their');
console.log('  capability checks are exercised through the grants above rather');
console.log('  than by calling them. An end-to-end test signed in as each role');
console.log('  is the thing that would close that gap.');

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
