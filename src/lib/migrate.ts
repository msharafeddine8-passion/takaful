import 'server-only';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';
import { isDbConfigured } from './db';

/**
 * Applies pending SQL migrations at server start.
 *
 * Next.js awaits register() before the server accepts a single request, so
 * everything here is bounded. On 5 August 2026 a deploy took the whole site
 * down and this step was the prime suspect; it was later cleared, but the
 * lesson stands - nothing on the startup path may be unbounded.
 */

const MIGRATIONS_DIR = 'migrations';

/**
 * Postgres advisory locks are keyed by a bigint, not a name. This constant is
 * arbitrary but must never change, or two versions would take different locks
 * and both migrate at once. Passed as a string so the driver sends it as a
 * bigint without going through a lossy JavaScript number.
 */
const LOCK_KEY = '8274134092837';

/** Refuse to sit on a TCP connect that will never answer. */
const CONNECT_TIMEOUT_MS = 8_000;

/**
 * The whole run is bounded. Anything unbounded on the startup path is an
 * outage waiting to happen.
 */
export const MIGRATION_BUDGET_MS = 25_000;

/** Reject if `promise` has not settled within `ms`. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} exceeded ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** Files are applied in filename order, so they must be numbered. */
async function pendingFiles(applied: Set<string>): Promise<string[]> {
  const dir = path.join(process.cwd(), MIGRATIONS_DIR);
  const entries = await readdir(dir);
  return entries
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .filter((name) => !applied.has(name));
}

/**
 * A connection of its own, never the application pool: migrations hold an
 * advisory lock for their whole run, and that lock is tied to the session.
 */
function migrationClient(): Client {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
  });
}

/**
 * Applies pending migrations, bounded in total. Never rejects: a database
 * that is unreachable, slow, or broken must not stop the site from serving
 * the pages that do not need it, which is most of them.
 */
export async function runMigrations(): Promise<void> {
  if (!isDbConfigured()) {
    console.warn('[migrate] DATABASE_URL is not set, skipping migrations.');
    return;
  }

  try {
    await withTimeout(applyMigrations(), MIGRATION_BUDGET_MS, '[migrate] run');
  } catch (error) {
    console.error('[migrate] Migrations did not complete:', error);
    console.error('[migrate] Serving anyway; the next start will try again.');
  }
}

async function applyMigrations(): Promise<void> {
  const client = migrationClient();

  try {
    await client.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT        NOT NULL PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // Two instances starting at once must not apply the same file twice.
    // try_ rather than the blocking form: if someone else is migrating,
    // there is nothing useful for this instance to wait around for.
    const lock = await client.query<{ locked: boolean }>(
      'SELECT pg_try_advisory_lock($1) AS locked',
      [LOCK_KEY],
    );
    if (!lock.rows[0]?.locked) {
      console.warn('[migrate] Another instance holds the migration lock, skipping.');
      return;
    }

    try {
      const applied = new Set(
        (
          await client.query<{ filename: string }>('SELECT filename FROM schema_migrations')
        ).rows.map((r) => r.filename),
      );
      const pending = await pendingFiles(applied);

      if (pending.length === 0) {
        console.log('[migrate] Schema is up to date.');
        return;
      }

      for (const filename of pending) {
        const sql = await readFile(path.join(process.cwd(), MIGRATIONS_DIR, filename), 'utf8');
        console.log(`[migrate] Applying ${filename}`);

        // Postgres runs DDL transactionally, so a file that fails halfway
        // leaves nothing behind, unlike MySQL, where it would have.
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK').catch(() => {});
          throw error;
        }

        console.log(`[migrate] Applied ${filename}.`);
      }
    } finally {
      // Best effort: the lock is tied to this session and Postgres drops it
      // when the connection goes away regardless.
      await client.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY]).catch(() => {});
    }
  } finally {
    // end() can wait on a socket that is already hung, and by this point the
    // budget may have run out and nobody is awaiting us any more.
    client.end().catch(() => {});
  }
}
