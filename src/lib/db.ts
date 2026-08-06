import 'server-only';
import { Pool, type PoolClient } from 'pg';

/**
 * One shared pool per process. Next.js hot-reloads modules in development,
 * so the pool is cached on globalThis to avoid exhausting connections.
 *
 * Connection details come from a single DATABASE_URL, which is what every
 * managed Postgres provider hands you and what Vercel injects automatically.
 */
const globalForDb = globalThis as unknown as { __takafulPool?: Pool };

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('Database is not configured. Set DATABASE_URL.');
  }

  return new Pool({
    connectionString,
    max: 8,
    // Serverless platforms recycle instances; idle sockets should not outlive
    // the instance holding them.
    idleTimeoutMillis: 30_000,
    // Never sit on a connection that will not answer.
    connectionTimeoutMillis: 8_000,
  });
}

export function pool(): Pool {
  if (!globalForDb.__takafulPool) {
    globalForDb.__takafulPool = createPool();
  }
  return globalForDb.__takafulPool;
}

/** True when the database is configured, so pages can degrade gracefully. */
export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Anything Postgres can bind to a `$n` placeholder. */
export type Param = string | number | boolean | Date | Buffer | null | string[];

export async function query<T = Record<string, unknown>>(
  sql: string,
  params: Param[] = [],
): Promise<T[]> {
  const result = await pool().query(sql, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: Param[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(sql: string, params: Param[] = []): Promise<void> {
  await pool().query(sql, params);
}

/**
 * Run several statements atomically. Used wherever a write must not be
 * half-applied — a status change plus its history row, for instance.
 */
export async function transaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
