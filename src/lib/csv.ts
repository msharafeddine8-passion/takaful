import 'server-only';

/**
 * Building a CSV that survives being opened.
 *
 * Two things break exports in practice, and neither is obvious until someone
 * sends the file back saying it looks wrong.
 *
 * Arabic names come out as mojibake in Excel unless the file starts with a
 * byte order mark. Excel guesses the encoding otherwise, and on a Windows
 * machine in Lebanon it guesses wrong.
 *
 * And a cell beginning with =, +, - or @ is treated as a formula. A name or a
 * note that starts with one of those turns a roster into something that runs
 * when opened. Prefixing with an apostrophe is what stops it.
 */

function cell(value: unknown): string {
  if (value === null || value === undefined) return '';

  /*
   * A Date arriving here is a bug upstream, and this is only the backstop.
   *
   * Every query in api/export now hands its dates over as 'YYYY-MM-DD' text
   * built by to_char in Beirut, because the round trip through a JS Date is
   * where a calendar day goes missing: pg parses a DATE at the Node process's
   * local midnight and toISOString reads it back in GMT, so the 1st of August
   * exports as the 31st of July on any machine east of London. That is a
   * spreadsheet reaching a donor with every date one day early, and nobody
   * checks a date they did not doubt.
   *
   * Deliberately left in GMT rather than guessed into Beirut. Making the
   * backstop clever would make a wrong value look right in the one place
   * nobody would think to look.
   */
  let text = value instanceof Date ? value.toISOString().slice(0, 10) : String(value);

  // Formula injection: the cell is data, and must stay data.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;

  if (/["\n\r,;]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(cell).join(','), ...rows.map((r) => r.map(cell).join(','))];
  // CRLF, because that is what every spreadsheet on Windows expects.
  return `﻿${lines.join('\r\n')}\r\n`;
}

/** A filename that is safe on every platform and says what and when. */
export function csvFilename(base: string, today: Date): string {
  const stamp = today.toISOString().slice(0, 10);
  return `${base.replace(/[^a-z0-9-]/gi, '-')}-${stamp}.csv`;
}

export function csvResponse(body: string, filename: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      // A roster is about real people. It does not belong in any cache.
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
