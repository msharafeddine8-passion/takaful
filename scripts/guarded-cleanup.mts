/**
 * The one place a probe is allowed to delete rows the database refuses to let
 * it delete.
 *
 * WHY THIS EXISTS. Migrations 042/044/045/046/047/048 made a growing list of
 * tables refuse a plain DELETE, and migration 049 did the same to `audit_logs`
 * — the table every probe writes to without meaning to, because logging in,
 * registering, granting a role or changing a status all append a row. There is
 * exactly one way through, named in 045:
 *
 *     BEGIN;
 *     SET LOCAL takaful.allow_delete = 'on';
 *     ...
 *     COMMIT;
 *
 * THE TWO TRAPS, BOTH OF WHICH HAVE ALREADY COST REAL ACCOUNTS.
 *
 * 1. `SET LOCAL` outside a transaction is a silent no-op. Postgres warns and
 *    carries on; the client sees success. A cleanup loop running statement by
 *    statement on a bare connection puts each one in its own implicit
 *    transaction, so the setting has expired before the next line runs and the
 *    hatch is never open at all.
 *
 * 2. It must never be sent as a parameterised statement. `c.query(SET_LOCAL,
 *    [id])` supplies one bind parameter for a statement with no placeholder,
 *    which Postgres refuses outright — "bind message supplies 1 parameters,
 *    but prepared statement requires 0". Putting the hatch line inside a
 *    per-user loop of parameterised deletes is how this happens.
 *
 * `scripts/probe-achievements.mts` had *both* halves at once, so its hatch had
 * never opened once. `DELETE FROM achievements` was refused, `achievements`
 * holds the user down by foreign key, and the per-statement `.catch()` printed
 * the failure into output nobody read. SEVEN `ach-*@example.test` ACCOUNTS
 * ACCUMULATED IN THE PRODUCTION DATABASE BEFORE ANYBODY NOTICED. `sweep.mts`
 * had been bitten by trap 1 on its own a month earlier.
 *
 * THIS IS NOT CEREMONY. Deleting the transaction, or inlining the hatch back
 * into a loop, restores a bug that leaks real rows into the live database of an
 * association that works with children. Leave it.
 *
 * A SAVEPOINT per statement, because one refusal must not abandon the rest: a
 * table that does not exist at this migration level, or a foreign key hit in an
 * unlucky order, would otherwise abort the transaction and silently skip every
 * delete after it — which is the failure mode that hid all of the above.
 */
import type { Client } from 'pg';

/** A statement, or a statement carrying its own bind parameters. */
export type CleanupStatement = string | readonly [sql: string, params: readonly unknown[]];

export interface GuardedCleanupOptions {
  /**
   * Bind parameters for the bare-string statements — the usual "same user id
   * for every DELETE" shape.
   *
   * Applied only to statements that actually contain a `$n` placeholder. A
   * cleanup list that mixes `DELETE ... WHERE user_id = $1` with an unfiltered
   * `DELETE FROM auth_attempts ...` would otherwise walk straight into trap 2
   * on the second kind.
   */
  params?: readonly unknown[];
  /** How this probe reports a statement that failed. Default keeps the
   *  familiar `  table: message` line the scripts printed before. */
  onError?: (sql: string, error: Error) => void;
}

const defaultOnError = (sql: string, error: Error) =>
  console.error(`  ${sql.split(' ')[3]}: ${error.message}`);

/**
 * Runs `statements` in one transaction with the delete hatch open, each under
 * its own savepoint. Returns the number that failed; the errors are reported
 * through `onError` as they happen, exactly as the per-statement `.catch()`
 * they replace did.
 */
export async function guardedCleanup(
  c: Client,
  statements: readonly CleanupStatement[],
  options: GuardedCleanupOptions = {},
): Promise<number> {
  const { params, onError = defaultOnError } = options;
  let failures = 0;

  await c.query('BEGIN');
  try {
    // No parameters here, ever. See trap 2 at the head of this file.
    await c.query("SET LOCAL takaful.allow_delete = 'on'");

    for (const statement of statements) {
      const sql = typeof statement === 'string' ? statement : statement[0];
      const bind: readonly unknown[] =
        typeof statement === 'string'
          ? /\$\d/.test(statement)
            ? (params ?? [])
            : []
          : statement[1];
      try {
        await c.query('SAVEPOINT one');
        await c.query(sql, bind as unknown[]);
        await c.query('RELEASE SAVEPOINT one');
      } catch (error) {
        await c.query('ROLLBACK TO SAVEPOINT one').catch(() => {});
        const e = error as { code?: string; message?: string };
        // A table that does not exist at this migration level is not a
        // failure — these scripts run against databases at different levels.
        if (e.code === '42P01') continue;
        onError(sql, error as Error);
        failures += 1;
      }
    }
    await c.query('COMMIT');
  } catch (error) {
    await c.query('ROLLBACK').catch(() => {});
    console.error(`  cleanup transaction: ${(error as Error).message}`);
    failures += 1;
  }
  return failures;
}
