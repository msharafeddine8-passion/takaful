/**
 * Runs the migrations and reports the resulting schema.
 *
 * Reads DATABASE_URL from the environment (node --env-file=.env.local) and
 * never prints it. Temporary developer tooling, not part of the app.
 */
import { Client } from 'pg';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = new Client({ connectionString: url, connectionTimeoutMillis: 15_000 });
await client.connect();

const version = await client.query('SELECT version()');
console.log('connected:', String(version.rows[0].version).split(',')[0]);

await client.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename   TEXT        NOT NULL PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

const applied = new Set(
  (await client.query<{ filename: string }>('SELECT filename FROM schema_migrations')).rows.map(
    (r) => r.filename,
  ),
);

const dir = path.join(process.cwd(), 'migrations');
const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

for (const file of files) {
  if (applied.has(file)) {
    console.log(`skip    ${file} (already applied)`);
    continue;
  }
  const sql = await readFile(path.join(dir, file), 'utf8');
  process.stdout.write(`apply   ${file} ... `);
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
    await client.query('COMMIT');
    console.log('OK');
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('FAILED');
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

const tables = await client.query<{ table_name: string; n: string }>(`
  SELECT c.relname AS table_name, obj_description(c.oid) AS n
    FROM pg_class c JOIN pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r'
   ORDER BY c.relname
`);
console.log(`\ntables (${tables.rows.length}):`);
for (const t of tables.rows) console.log('  -', t.table_name);

const checks = await client.query<{ conname: string }>(`
  SELECT conname FROM pg_constraint
   WHERE contype = 'c' AND connamespace = 'public'::regnamespace
   ORDER BY conname
`);
console.log(`\nCHECK constraints (${checks.rows.length}):`);
for (const c of checks.rows) console.log('  -', c.conname);

const views = await client.query<{ viewname: string }>(
  `SELECT viewname FROM pg_views WHERE schemaname = 'public' ORDER BY viewname`,
);
console.log(`\nviews (${views.rows.length}):`);
for (const v of views.rows) console.log('  -', v.viewname);

await client.end();
