/*
 * Apply a migration inside a transaction and roll it back.
 *
 * Proves the SQL parses, every constraint is satisfiable against the data that
 * is actually there, and nothing in it conflicts with the existing schema —
 * without leaving anything behind. Postgres runs DDL transactionally, so the
 * rollback is complete.
 *
 * There is one production database and it holds real volunteers. This is the
 * cheapest way to be sure before writing to it.
 *
 *   npx tsx --env-file=.env.local scripts/try-migration.mts 017_training_programme.sql
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';

const file = process.argv[2];
if (!file) {
  console.error('Usage: try-migration.mts <filename.sql>');
  process.exit(1);
}

const sql = await readFile(path.join(process.cwd(), 'migrations', file), 'utf8');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const RELATIONS = `
  SELECT c.relname AS name, c.relkind AS kind
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind IN ('r', 'v', 'i')
`;

await client.connect();
try {
  // Snapshot before, compare after. Comparing oids does not work: an oid is
  // not monotonic and a rebuilt index reuses the range.
  const before = new Set(
    (await client.query<{ name: string; kind: string }>(RELATIONS)).rows.map(
      (r) => `${r.kind}:${r.name}`,
    ),
  );

  await client.query('BEGIN');
  await client.query(sql);

  const after = (await client.query<{ name: string; kind: string }>(RELATIONS)).rows;
  const added = after.filter((r) => !before.has(`${r.kind}:${r.name}`));
  const tables = added.filter((r) => r.kind === 'r').map((r) => r.name);
  const indexes = added.filter((r) => r.kind === 'i').length;

  console.log(`${file} applies cleanly.`);
  if (tables.length) console.log(`  new tables (${tables.length}): ${tables.join(', ')}`);
  if (indexes) console.log(`  new indexes: ${indexes}`);
  if (!added.length) console.log('  no new relations (column or constraint changes only)');

  await client.query('ROLLBACK');
  console.log('Rolled back. Nothing was written.');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error(`\n${file} FAILED:\n  ${(error as Error).message}`);
  const pos = (error as { position?: string }).position;
  if (pos) {
    const at = Number(pos);
    console.error(`  near: ${JSON.stringify(sql.slice(Math.max(0, at - 90), at + 60))}`);
  }
  process.exitCode = 1;
} finally {
  await client.end();
}
