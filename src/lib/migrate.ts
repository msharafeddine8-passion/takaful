import 'server-only';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { isDbConfigured } from './db';

/**
 * Applies pending SQL migrations at server start.
 *
 * Hostinger's phpMyAdmin sits on a host our network cannot reach, so
 * migrations cannot be applied by hand from here. The application server,
 * however, reaches its own database over localhost — so it applies them
 * itself. Every file runs at most once; the record lives in the database.
 */

const MIGRATIONS_DIR = 'migrations';
const LOCK_NAME = 'takaful_migrations';
const LOCK_TIMEOUT_SECONDS = 10;

/** Refuse to sit on a TCP connect that will never answer. */
const CONNECT_TIMEOUT_MS = 8_000;

/**
 * The whole run is bounded. Next.js awaits register() before the server
 * accepts requests, so anything unbounded here is an outage waiting to
 * happen — which is exactly what took the site down on 5 August 2026.
 */
export const MIGRATION_BUDGET_MS = 25_000;

/** Reject if `promise` has not settled within `ms`. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} exceeded ${ms}ms`)),
      ms,
    );
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
 * A connection of its own, with multiple statements enabled so a migration
 * file can run as written. This is deliberately NOT the application pool:
 * multi-statement mode turns any injected string into an injected script,
 * and the only input here is our own committed files.
 */
async function migrationConnection(): Promise<mysql.Connection> {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    multipleStatements: true,
    // A host that accepts the connection but never completes the handshake
    // would otherwise hang here forever.
    connectTimeout: CONNECT_TIMEOUT_MS,
  });
}

/**
 * Applies pending migrations, bounded in total. Never rejects: a database
 * that is unreachable, slow, or broken must not stop the site from serving
 * the pages that do not need it — which is most of them.
 */
export async function runMigrations(): Promise<void> {
  if (!isDbConfigured()) {
    console.warn('[migrate] Database not configured — skipping migrations.');
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
  let conn: mysql.Connection | undefined;

  try {
    conn = await migrationConnection();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename    VARCHAR(255) NOT NULL PRIMARY KEY,
        applied_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Two instances starting at once must not apply the same file twice.
    const [lockRows] = await conn.query<mysql.RowDataPacket[]>(
      'SELECT GET_LOCK(?, ?) AS acquired',
      [LOCK_NAME, LOCK_TIMEOUT_SECONDS],
    );
    if (lockRows[0]?.acquired !== 1) {
      console.warn('[migrate] Another instance holds the migration lock — skipping.');
      return;
    }

    try {
      const [rows] = await conn.query<mysql.RowDataPacket[]>(
        'SELECT filename FROM schema_migrations',
      );
      const applied = new Set(rows.map((r) => String(r.filename)));
      const pending = await pendingFiles(applied);

      if (pending.length === 0) {
        console.log('[migrate] Schema is up to date.');
        return;
      }

      for (const filename of pending) {
        const sql = await readFile(path.join(process.cwd(), MIGRATIONS_DIR, filename), 'utf8');
        console.log(`[migrate] Applying ${filename}…`);
        await conn.query(sql);
        await conn.query('INSERT INTO schema_migrations (filename) VALUES (?)', [filename]);
        console.log(`[migrate] Applied ${filename}.`);
      }
    } finally {
      // Releasing is best effort: the lock is tied to this connection and
      // MySQL drops it when the connection goes away regardless.
      await conn.query('SELECT RELEASE_LOCK(?)', [LOCK_NAME]).catch(() => {});
    }
  } finally {
    // destroy(), not end(): end() waits for a graceful close, and a socket
    // that is already hung would hang here too — after the budget has run
    // out and this function is no longer being awaited by anyone.
    conn?.destroy();
  }
}
