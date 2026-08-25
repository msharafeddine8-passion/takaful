/**
 * Which badges the engine is still allowed to hand out.
 *
 * Small enough to look pointless and separate for a reason: it is a rule about
 * people, and `achievements.ts` is `server-only` so nothing there can be
 * probed. The rule is one line and the consequence of getting it backwards is
 * that four hundred volunteers lose a badge overnight.
 *
 * THE DISTINCTION THIS FILE EXISTS FOR.
 *
 * A retired badge is not an unmet badge. The recompute withdraws a badge whose
 * figure has fallen below its threshold — that is correct, it means the ledger
 * changed. If retirement were expressed as "nobody meets it any more", the very
 * same code would withdraw it from every single holder, with the engine's
 * generic reason, on a day unconnected to anything they did.
 *
 * So retirement removes the definition from the pass altogether. No grant, no
 * withdrawal, no row touched. The people who hold it go on holding it, because
 * they did the thing and the association's second thoughts about the badge are
 * not their fault.
 */

/** A definition, reduced to what this rule needs. */
export type Circulating = { code: string };

/**
 * The definitions the recompute may act on.
 *
 * Takes the retired codes rather than fetching them, so the caller reads them
 * once per pass instead of once per person, and so a probe can hold the rule
 * without a database.
 */
export function inCirculation<T extends Circulating>(
  defs: readonly T[],
  retiredCodes: readonly string[],
): T[] {
  if (retiredCodes.length === 0) return [...defs];
  const out = new Set(retiredCodes);
  return defs.filter((def) => !out.has(def.code));
}

/**
 * Whether a badge may be handed out right now.
 *
 * A row with `lifted_at` set is history — the badge was out of circulation and
 * came back — so it does not count. The table keeps those rows deliberately:
 * deleting them would make a badge that stopped for eight months look as though
 * it never stopped.
 */
export function isRetired(
  row: { lifted_at: unknown } | null | undefined,
): boolean {
  return Boolean(row) && (row as { lifted_at: unknown }).lifted_at == null;
}

/**
 * Codes that are out of circulation, from the table's rows.
 *
 * `== null` above and `!= null` here rather than a truthiness test: the driver
 * hands back a Date, and every Date is truthy, but so is the string 'null' if
 * somebody ever selects this column as text. Comparing against null says what
 * is meant.
 */
export function retiredCodesFrom(
  rows: ReadonlyArray<{ code: string; lifted_at: unknown }>,
): string[] {
  return rows.filter((row) => row.lifted_at == null).map((row) => row.code);
}
