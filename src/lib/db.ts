import 'server-only';
import mysql from 'mysql2/promise';

/**
 * One shared pool per process. Next.js hot-reloads modules in development,
 * so the pool is cached on globalThis to avoid exhausting connections.
 */
const globalForDb = globalThis as unknown as { __takafulPool?: mysql.Pool };

function createPool(): mysql.Pool {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error(
      'Database is not configured. Set DB_HOST, DB_USER, DB_PASSWORD and DB_NAME.',
    );
  }

  return mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT ?? 3306),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 8,
    charset: 'utf8mb4',
    timezone: 'Z',
    // Never interpolate values into SQL — everything goes through placeholders.
    namedPlaceholders: false,
  });
}

export function pool(): mysql.Pool {
  if (!globalForDb.__takafulPool) {
    globalForDb.__takafulPool = createPool();
  }
  return globalForDb.__takafulPool;
}

/** True when the database credentials are present, so pages can degrade gracefully. */
export function isDbConfigured(): boolean {
  return Boolean(
    process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME,
  );
}

/** Anything MySQL can bind to a `?` placeholder. */
export type Param = string | number | boolean | Date | Buffer | null;

export async function query<T = Record<string, unknown>>(
  sql: string,
  params: Param[] = [],
): Promise<T[]> {
  const [rows] = await pool().execute(sql, params);
  return rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: Param[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(sql: string, params: Param[] = []): Promise<void> {
  await pool().execute(sql, params);
}

/**
 * Run several statements atomically. Used wherever a write must not be
 * half-applied — a status change plus its history row, for instance.
 */
export async function transaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await pool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
