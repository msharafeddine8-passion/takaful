/**
 * Applies pending migrations from the command line.
 *
 * The server applies them at start-up too (src/lib/migrate.ts). This exists so
 * a migration can be applied and inspected before a deploy, rather than being
 * discovered as a broken boot.
 *
 *   npx tsx --env-file=.env.local scripts/migrate.mts
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';

const LOCK_KEY = '8274134092837';
const DIR = path.join(process.cwd(), 'migrations');

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15_000,
});
await c.connect();

await c.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename   TEXT        NOT NULL PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);

const applied = new Set(
  (await c.query<{ filename: string }>('SELECT filename FROM schema_migrations')).rows.map(
    (r) => r.filename,
  ),
);
const pending = (await readdir(DIR))
  .filter((n) => n.endsWith('.sql'))
  .sort()
  .filter((n) => !applied.has(n));

if (pending.length === 0) console.log('Schema is up to date.');

let failed = false;
for (const filename of pending) {
  const sql = await readFile(path.join(DIR, filename), 'utf8');
  process.stdout.write(`applying ${filename} ... `);
  await c.query('BEGIN');
  try {
    /*
     * The lock is taken inside the transaction, per file, and released by the
     * COMMIT or ROLLBACK — see the long note in src/lib/migrate.ts. The short
     * version: DATABASE_URL is Neon's pooler, PgBouncer in transaction mode,
     * where a session-level advisory lock is taken on one server connection
     * and unlocked on another. The lock survived, on a pooled connection that
     * went back to serving page queries, and every later migration run found
     * it held and applied nothing.
     */
    const lock = await c.query<{ locked: boolean }>(
      'SELECT pg_try_advisory_xact_lock($1) AS locked',
      [LOCK_KEY],
    );
    if (!lock.rows[0]?.locked) {
      await c.query('ROLLBACK');
      console.log('SKIPPED');
      console.error('  Another process holds the migration lock. Nothing applied.');
      failed = true;
      break;
    }
    // Asked again inside the lock: another instance may have applied this file
    // since the pending list was read, which is the collision the lock is for.
    const already = await c.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [
      filename,
    ]);
    if (already.rowCount) {
      await c.query('ROLLBACK');
      console.log('already applied elsewhere');
      continue;
    }
    await c.query(sql);
    await c.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
    await c.query('COMMIT');
    console.log('ok');
  } catch (error) {
    await c.query('ROLLBACK').catch(() => {});
    const e = error as { code?: string; message?: string; hint?: string };
    console.log(`FAILED (${e.code ?? '?'})`);
    console.error('  ' + (e.message ?? String(error)));
    if (e.hint) console.error('  hint: ' + e.hint);
    failed = true;
    break;
  }
}

await c.end();
process.exit(failed ? 1 : 0);
