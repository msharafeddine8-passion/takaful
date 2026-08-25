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

      /*
       * ONE TRANSACTION PER FILE, AND THE LOCK LIVES INSIDE IT.
       *
       * This used to take one session-level pg_try_advisory_lock around the
       * whole run and release it in a finally. That is correct against a
       * Postgres you are talking to directly, and wrong against this one:
       * DATABASE_URL points at Neon's pooler, which is PgBouncer in
       * transaction mode. Every statement may land on a different server
       * connection.
       *
       * So the lock was taken on one server connection and the unlock was sent
       * down another, where it did nothing but return false. The lock stayed —
       * on a connection that went straight back into the pool and carried on
       * serving ordinary page queries while holding it. Every later migration
       * run then found the lock held and skipped, which on this project means
       * every deploy silently ships code whose schema never arrived. It
       * happened twice; the second time the holder had been idle for four
       * minutes with a certificates query as its last statement.
       *
       * pg_try_advisory_xact_lock cannot leak, because Postgres releases it at
       * COMMIT or ROLLBACK whatever the pooler does with the connection
       * afterwards. Per file rather than per run because a transaction-scoped
       * lock cannot outlive its transaction, and the guarantee that actually
       * matters is the narrow one: two instances must never apply the same
       * file twice.
       *
       * DDL is transactional in Postgres, so a file that fails halfway leaves
       * nothing behind. A migration needing CREATE INDEX CONCURRENTLY cannot
       * be written here at all — that was already true, and 016 says so.
       */
      await client.query('BEGIN');
      try {
        const lock = await client.query<{ locked: boolean }>(
          'SELECT pg_try_advisory_xact_lock($1) AS locked',
          [LOCK_KEY],
        );
        if (!lock.rows[0]?.locked) {
          await client.query('ROLLBACK');
          console.warn('[migrate] Another instance holds the migration lock, skipping.');
          return;
        }

        /*
         * Asked again inside the lock. The pending list was read before it,
         * and between the two another instance may have applied this very
         * file — which is precisely the collision the lock exists to prevent
         * and which the outer read cannot see.
         */
        const already = await client.query(
          'SELECT 1 FROM schema_migrations WHERE filename = $1',
          [filename],
        );
        if (already.rowCount) {
          await client.query('ROLLBACK');
          console.log(`[migrate] ${filename} was applied by another instance.`);
          continue;
        }

        console.log(`[migrate] Applying ${filename}`);
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
    // end() can wait on a socket that is already hung, and by this point the
    // budget may have run out and nobody is awaiting us any more.
    client.end().catch(() => {});
  }
}
