/**
 * Parsing what a person typed into a duration.
 *
 * Lives outside the actions file because a module marked 'use server' may
 * only export async functions, and this is worth calling from anywhere.
 */

/**
 * Accepts the four things people actually type:
 *   "2:30"  -> 150   (hours and minutes)
 *   "2.5"   -> 150   (decimal hours, comma or dot)
 *   "150m"  -> 150   (explicit minutes)
 *   "2h"    -> 120
 * Returns null when it cannot tell, rather than guessing at someone's hours.
 */
export function parseDuration(raw: string): number | null {
  const value = raw.trim().replace(/\s+/g, '');
  if (!value) return null;

  const colon = /^(\d{1,2}):([0-5]\d)$/.exec(value);
  if (colon) return Number(colon[1]) * 60 + Number(colon[2]);

  const minutes = /^(\d{1,4})m$/i.exec(value);
  if (minutes) return Number(minutes[1]);

  const decimal = /^(\d{1,2})(?:[.,](\d{1,2}))?h?$/i.exec(value);
  if (decimal) {
    const whole = Number(decimal[1]);
    const frac = decimal[2] ? Number(`0.${decimal[2]}`) : 0;
    return Math.round((whole + frac) * 60);
  }

  return null;
}
