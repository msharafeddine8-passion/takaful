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
const LOCK_TIMEOUT_SECONDS = 30;

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
  });
}

export async function runMigrations(): Promise<void> {
  if (!isDbConfigured()) {
    console.warn('[migrate] Database not configured — skipping migrations.');
    return;
  }

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
      await conn.query('SELECT RELEASE_LOCK(?)', [LOCK_NAME]);
    }
  } catch (error) {
    // A failed migration must not take the public site down with it. The
    // pages that need the database already degrade on their own; the rest
    // of the site — which is most of it — has no reason to stop serving.
    console.error('[migrate] Migration failed:', error);
  } finally {
    await conn?.end().catch(() => {});
  }
}
