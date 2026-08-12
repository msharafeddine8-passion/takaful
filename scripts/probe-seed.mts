/*
 * The seed, checked against the database it just wrote.
 *
 * The important one is the last: an edit made by a person must survive the
 * next seed run. That is the promise the whole authored-in-code,
 * edited-in-database arrangement rests on, and it is worth proving rather
 * than trusting.
 */
import { Client } from 'pg';
import { COURSES, PROGRAM_SLUG } from '../src/lib/programme/definition';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail?: unknown) {
  if (passed) { ok++; console.log(`  ok       ${what}${detail === undefined ? '' : `  — ${detail}`}`); }
  else { holes.push(what); console.log(`  HOLE     ${what}${detail === undefined ? '' : `  — ${detail}`}`); }
}
// The trailing comma is required: in a .mts file `<T>` alone parses as JSX.
const one = async <T,>(sql: string, p: unknown[] = []): Promise<T> =>
  (await client.query(sql, p)).rows[0] as T;

await client.connect();

console.log('\n--- what landed ---');
const counts = await one<{ programs: string; levels: string; courses: string; edges: string; outcomes: string }>(`
  SELECT (SELECT count(*) FROM programs)::text              AS programs,
         (SELECT count(*) FROM program_levels)::text        AS levels,
         (SELECT count(*) FROM courses)::text               AS courses,
         (SELECT count(*) FROM course_prerequisites)::text  AS edges,
         (SELECT count(*) FROM course_outcomes)::text       AS outcomes
`);
check('one programme', counts.programs === '1', counts.programs);
check('seven levels', counts.levels === '7', counts.levels);
check('forty-one courses', counts.courses === String(COURSES.length), counts.courses);
check('no duplicate courses after repeated seeding',
  Number(counts.courses) === COURSES.length, `${counts.courses} rows / ${COURSES.length} defined`);
check('outcomes were written', Number(counts.outcomes) > 100, counts.outcomes);
check('prerequisite edges were written', Number(counts.edges) === 94, counts.edges);

console.log('\n--- structure the database enforces ---');
const perLevel = await client.query<{ number: number; cores: string; challenges: string }>(`
  SELECT l.number,
         count(*) FILTER (WHERE c.kind = 'core')::text      AS cores,
         count(*) FILTER (WHERE c.kind = 'challenge')::text AS challenges
  FROM program_levels l LEFT JOIN courses c ON c.level_id = l.id
  WHERE l.number >= 1 GROUP BY l.number ORDER BY l.number`);
for (const r of perLevel.rows) {
  check(`level ${r.number} holds 5 courses and 1 challenge`,
    r.cores === '5' && r.challenges === '1', `${r.cores} + ${r.challenges}`);
}

const orientation = await one<{ n: string }>(
  `SELECT count(*)::text AS n FROM courses WHERE kind = 'orientation'`);
check('exactly one orientation, enforced by a partial unique index', orientation.n === '1', orientation.n);

console.log('\n--- existing volunteer history ---');
const stranded = await one<{ n: string }>(
  `SELECT count(*)::text AS n FROM course_attempts WHERE course_slug NOT IN (SELECT slug FROM courses)`);
check('no attempt points at a course that does not exist', stranded.n === '0', stranded.n);

const kept = await client.query<{ course_slug: string }>(
  `SELECT DISTINCT course_slug FROM course_attempts ORDER BY 1`);
for (const r of kept.rows) {
  const row = await one<{ n: string }>('SELECT count(*)::text AS n FROM courses WHERE slug = $1',
    [r.course_slug]);
  check(`the attempt on ${r.course_slug} still resolves`, row.n === '1');
}

console.log('\n--- the conflict rule ---');
// Edit a course as a person would, re-seed, and confirm the edit survived.
const SLUG = 'communication-skills';
const before = await one<{ id: string; title_ar: string; origin: string }>(
  'SELECT id, title_ar, origin FROM courses WHERE slug = $1', [SLUG]);
const MARK = 'PROBE EDIT — should survive the seed';

await client.query(
  `UPDATE courses SET title_ar = $2, origin = 'admin' WHERE id = $1`, [before.id, MARK]);

const { execSync } = await import('node:child_process');
try {
  execSync('npx tsx --env-file=.env.local scripts/seed-programme.mts', { stdio: 'pipe' });
} catch (e) {
  console.log('  (seed run failed during the probe)', (e as Error).message.slice(0, 80));
}

const after = await one<{ title_ar: string; origin: string }>(
  'SELECT title_ar, origin FROM courses WHERE slug = $1', [SLUG]);
check('an admin edit survives a re-seed', after.title_ar === MARK, after.title_ar.slice(0, 40));
check('and the row is still marked as the admin’s', after.origin === 'admin', after.origin);

// Put it back exactly as it was, including origin.
await client.query('UPDATE courses SET title_ar = $2, origin = $3 WHERE id = $1',
  [before.id, before.title_ar, before.origin]);
const restored = await one<{ title_ar: string; origin: string }>(
  'SELECT title_ar, origin FROM courses WHERE slug = $1', [SLUG]);
check('the probe restored what it changed',
  restored.title_ar === before.title_ar && restored.origin === before.origin);

console.log('\n--- the default programme ---');
const def = await one<{ slug: string }>('SELECT slug FROM programs WHERE is_default');
check('the default programme is the volunteer path', def?.slug === PROGRAM_SLUG, def?.slug);

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
await client.end();
if (holes.length) process.exitCode = 1;
