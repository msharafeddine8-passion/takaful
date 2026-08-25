import type { Locale } from './i18n';

/**
 * Locale-aware formatting that a client component may import.
 *
 * Two things pushed this into its own module. The only locale-aware formatter
 * the codebase had — formatDuration — lives in src/lib/hours.ts, which is
 * marked `import 'server-only'`, so nothing on the client could reach it. And
 * dates were rendered everywhere as `new Date(x).toISOString().slice(0, 10)`,
 * which is a UTC ISO string, not a date in anybody's language: an Arabic page
 * showed "2026-03-14" beside prose that writes ٢٠٢٠.
 *
 * So: no 'server-only', no database, no React. Pure functions, importable by a
 * server page, a client component and a probe alike.
 *
 * DIRECTION — the distinction the rest of the repo gets wrong.
 * `dir="ltr"` belongs on a bare code, an ISO-shaped string, a raw ratio like
 * "3 / 7", or a Latin identifier sitting inside Arabic text. It does NOT
 * belong on the output of the functions below: a localised date and a
 * localised percentage are already written in the reading direction of their
 * own locale, and forcing them to LTR pushes the Arabic-Indic digits and the
 * ٪ sign to the wrong side of the number. Wrap the counter, not the sentence.
 */

/**
 * A date a reader can read. Arabic gets Arabic-Indic digits, matching the
 * register ar.ts already uses in prose.
 *
 * UTC deliberately: every timestamp in this product is stored in UTC and a
 * certificate issued at 23:30 Beirut time must not show yesterday's date to a
 * verifier in another timezone.
 */
export function formatDate(value: Date | string, lang: Locale): string {
  const date = value instanceof Date ? value : new Date(value);
  // An unparseable date is a bug upstream, not something to render as
  // "Invalid Date" in the middle of a sentence.
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-LB-u-nu-arab' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * «ساعتان ونصف» shaped properly, and '2 h 30 min'.
 *
 * THIS WROTE UNGRAMMATICAL ARABIC ON MOST OF THE SITE.
 *
 * It was copied verbatim from src/lib/hours.ts, which used «{n} ساعة» for every
 * count. Arabic does not count that way: it has five bands — nothing, one, a
 * pair, a few (3–10) and many (11+) — and the noun changes shape in each.
 * «2 ساعة» is wrong the way "2 hour" is wrong, and it was rendering on the
 * membership card, the journey page, the dashboard, the honours board and the
 * achievements page.
 *
 * There is a second formatDuration in src/lib/when.ts which always had this
 * right. The two are NOT merged, because their contracts differ where it
 * matters: this one keeps a sign, since an hours reversal is stored as negative
 * minutes and the ledger has to show it, and it renders a zero rather than a
 * dash, since a tile reading «0 دقيقة» is a figure while «—» is a gap. Merging
 * them would silently change what the hours ledger prints for a correction.
 */
export function formatDuration(minutes: number, lang: Locale): string {
  const sign = minutes < 0 ? '-' : '';
  const total = Math.abs(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;

  if (lang === 'ar') {
    /* countPhrase is not used here: it lives in when.ts, which this module must
     * not depend on, and its zero form would hide the «0 دقيقة» this one has to
     * keep. Same five bands, stated once. */
    const band = (n: number, one: string, two: string, few: string, many: string) =>
      n === 1 ? one : n === 2 ? two : n <= 10 ? `${n} ${few}` : `${n} ${many}`;
    const hours = band(h, 'ساعة', 'ساعتان', 'ساعات', 'ساعة');
    const mins = band(m, 'دقيقة', 'دقيقتان', 'دقائق', 'دقيقة');

    if (h === 0) return `${sign}${m === 0 ? '0 دقيقة' : mins}`;
    if (m === 0) return `${sign}${hours}`;
    return `${sign}${hours} و${mins}`;
  }

  if (h === 0) return `${sign}${m} min`;
  if (m === 0) return `${sign}${h} h`;
  return `${sign}${h} h ${m} min`;
}

/**
 * '٤٥٪' / '45%'. For display only — anything that needs the number itself
 * (aria-valuenow, a bar width) uses the integer, never this string.
 */
export function formatPercent(n: number, lang: Locale): string {
  const clamped = Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)));
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-LB-u-nu-arab' : 'en-GB', {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(clamped / 100);
}

/**
 * A count in the reader's digits — '٣' / '3'. Useful inside a template like
 * 'تبقّى {n} من الدورات', where a Latin digit in Arabic prose reads as a
 * foreign body even though it is legible.
 */
export function formatNumber(n: number, lang: Locale): string {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-LB-u-nu-arab' : 'en-GB').format(n);
}
