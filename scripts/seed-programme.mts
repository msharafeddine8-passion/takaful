/*
 * Write the authored programme into Postgres. Idempotent, and safe to run
 * against production repeatedly.
 *
 * THE CONFLICT RULE
 *
 * Every content row carries `origin`. A row the seed created is 'seed' and the
 * seed keeps it in step with the definition file. The moment a person edits it
 * through the admin screens, `origin` becomes 'admin' and this script never
 * touches that row again — not its title, not its pass mark, not its order.
 * That is the whole rule, and it is what lets content be authored in code and
 * still be editable by a programme manager.
 *
 * WHAT IT WILL NOT DO
 *
 * It never deletes a course, because `course_attempts` and `certificates`
 * reference courses by slug and a deleted course silently orphans a
 * volunteer's history. A course dropped from the definition is reported and
 * left alone for a human to archive deliberately.
 *
 *   npx tsx --env-file=.env.local scripts/seed-programme.mts          # apply
 *   npx tsx --env-file=.env.local scripts/seed-programme.mts --dry    # report
 */
import { Client } from 'pg';
import {
  PROGRAM,
  LEVELS,
  COURSES,
  type CourseDef,
} from '../src/lib/programme/definition';

const DRY = process.argv.includes('--dry');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

type Counts = { created: number; updated: number; skipped: number };
const tally: Record<string, Counts> = {};
function note(entity: string, kind: keyof Counts) {
  (tally[entity] ??= { created: 0, updated: 0, skipped: 0 })[kind]++;
}

await client.connect();
await client.query('BEGIN');

try {
  // ------------------------------------------------------------- programme
  const program = await client.query<{ id: string; origin?: string }>(
    `INSERT INTO programs (slug, title_ar, title_en, description_ar, description_en,
                           is_default, published_at)
     VALUES ($1, $2, $3, $4, $5, TRUE, now())
     ON CONFLICT (slug) DO UPDATE SET
       title_ar = EXCLUDED.title_ar, title_en = EXCLUDED.title_en,
       description_ar = EXCLUDED.description_ar, description_en = EXCLUDED.description_en,
       updated_at = now()
     RETURNING id`,
    [PROGRAM.slug, PROGRAM.title.ar, PROGRAM.title.en, PROGRAM.description.ar, PROGRAM.description.en],
  );
  const programId = program.rows[0].id;
  note('program', 'created');

  // ---------------------------------------------------------------- levels
  const levelIdByNumber = new Map<number, string>();
  for (const level of LEVELS) {
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO program_levels (program_id, number, title_ar, title_en,
                                   description_ar, description_en, badge_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (program_id, number) DO UPDATE SET
         title_ar = EXCLUDED.title_ar, title_en = EXCLUDED.title_en,
         description_ar = EXCLUDED.description_ar, description_en = EXCLUDED.description_en,
         badge_code = EXCLUDED.badge_code, updated_at = now()
       RETURNING id`,
      [programId, level.number, level.title.ar, level.title.en,
       level.description.ar, level.description.en, level.badgeCode],
    );
    levelIdByNumber.set(level.number, rows[0].id);
    note('level', 'created');
  }

  // --------------------------------------------------------------- courses
  const courseIdBySlug = new Map<string, string>();

  for (const course of COURSES) {
    const levelId = course.level === null ? null : levelIdByNumber.get(course.level) ?? null;

    // Read first, so the conflict rule is a decision and not a side effect of
    // an ON CONFLICT clause.
    const existing = await client.query<{ id: string; origin: string }>(
      'SELECT id, origin FROM courses WHERE slug = $1',
      [course.slug],
    );

    if (existing.rowCount && existing.rows[0].origin === 'admin') {
      courseIdBySlug.set(course.slug, existing.rows[0].id);
      note('course', 'skipped');
      continue;
    }

    const values = [
      course.slug, programId, levelId, course.kind, course.order,
      course.title.ar, course.title.en, course.summary.ar, course.summary.en,
      course.minutes, course.difficulty, course.passMark, course.icon,
    ];

    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO courses (slug, program_id, level_id, kind, sort_order,
                            title_ar, title_en, summary_ar, summary_en,
                            minutes, difficulty, pass_mark, icon, origin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'seed')
       ON CONFLICT (slug) DO UPDATE SET
         program_id = EXCLUDED.program_id, level_id = EXCLUDED.level_id,
         kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order,
         title_ar = EXCLUDED.title_ar, title_en = EXCLUDED.title_en,
         summary_ar = EXCLUDED.summary_ar, summary_en = EXCLUDED.summary_en,
         minutes = EXCLUDED.minutes, difficulty = EXCLUDED.difficulty,
         pass_mark = EXCLUDED.pass_mark, icon = EXCLUDED.icon,
         updated_at = now()
       RETURNING id`,
      values,
    );
    courseIdBySlug.set(course.slug, rows[0].id);
    note('course', existing.rowCount ? 'updated' : 'created');

    // Outcomes are a list, not a set: replacing them wholesale is correct and
    // simpler than diffing, and nothing references an outcome row by id.
    await client.query('DELETE FROM course_outcomes WHERE course_id = $1', [rows[0].id]);
    for (const [i, ar] of course.outcomes.ar.entries()) {
      await client.query(
        'INSERT INTO course_outcomes (course_id, sort_order, text_ar, text_en) VALUES ($1,$2,$3,$4)',
        [rows[0].id, i, ar, course.outcomes.en[i]],
      );
    }
  }

  // --------------------------------------------------- prerequisite edges
  // Second pass: every course id now exists, so an edge can be resolved.
  for (const course of COURSES) {
    const id = courseIdBySlug.get(course.slug);
    if (!id) continue;
    await client.query('DELETE FROM course_prerequisites WHERE course_id = $1', [id]);
    const edges: [string, 'requires' | 'recommends'][] = [
      ...course.requires.map((s) => [s, 'requires'] as [string, 'requires']),
      ...course.recommends.map((s) => [s, 'recommends'] as [string, 'recommends']),
    ];
    for (const [slug, kind] of edges) {
      const target = courseIdBySlug.get(slug);
      if (!target) throw new Error(`${course.slug} ${kind} ${slug}, which is not in the definition`);
      await client.query(
        `INSERT INTO course_prerequisites (course_id, requires_course_id, kind)
         VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [id, target, kind],
      );
      note('prerequisite', 'created');
    }
  }

  // ------------------------------------------------------------- reporting
  // A course in the database that the definition no longer lists. Never
  // deleted here: it may hold attempts, and archiving is a human decision.
  const orphans = await client.query<{ slug: string; status: string }>(
    `SELECT slug, status FROM courses WHERE slug <> ALL($1::text[])`,
    [COURSES.map((c) => c.slug)],
  );

  console.log(`\n${DRY ? 'Would apply' : 'Applied'}:`);
  for (const [entity, c] of Object.entries(tally)) {
    console.log(`  ${entity.padEnd(14)} ${c.created} created, ${c.updated} updated, ${c.skipped} left to admin`);
  }

  if (orphans.rowCount) {
    console.log(`\n  ${orphans.rowCount} course(s) in the database are not in the definition.`);
    console.log('  Not deleted — they may hold attempts. Archive them deliberately:');
    for (const r of orphans.rows) console.log(`    ${r.slug} (${r.status})`);
  }

  // The check that matters most: no volunteer's history was orphaned.
  const stranded = await client.query<{ course_slug: string; n: string }>(
    `SELECT course_slug, count(*)::text AS n FROM course_attempts
     WHERE course_slug NOT IN (SELECT slug FROM courses) GROUP BY 1`,
  );
  if (stranded.rowCount) {
    throw new Error(
      `Refusing to commit: ${stranded.rows.map((r) => `${r.n} attempt(s) on ${r.course_slug}`).join(', ')} ` +
        'would have no course row.',
    );
  }
  console.log('\n  Every existing attempt still resolves to a course.');

  if (DRY) {
    await client.query('ROLLBACK');
    console.log('\nDry run. Nothing was written.');
  } else {
    await client.query('COMMIT');
    console.log('\nCommitted.');
  }
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error(`\nSeed failed, nothing written:\n  ${(error as Error).message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}

// Referenced for its type only; keeps the import meaningful to a reader.
export type { CourseDef };
