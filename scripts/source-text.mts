/*
 * ONE READER FOR EVERY PROBE THAT ASSERTS OVER APPLICATION SOURCE.
 *
 * Seventeen probes in this directory hold invariants a type cannot — "the gate
 * does not read the outcome", "endRole does not touch the title" — by reading a
 * file from src/ as TEXT and asserting over it. Every one of them was reading
 * whatever git happened to check out, and on Windows git checks these files out
 * with CRLF. Thirty of the seventy-six files in src/lib are CRLF on disk right
 * now, and another converts every time somebody touches one.
 *
 * DO NOT DELETE THIS AS REDUNDANT. It is one `.replace()` and it has already
 * cost this repository two failures, one of them silent:
 *
 *   1. scripts/probe-volunteer-roles.mts sliced a function body out with
 *      `indexOf('\n}\n')`. Under CRLF that returns −1, `slice(0, 0)` returned
 *      the EMPTY STRING, and the whole of section 7 ran against nothing. Two
 *      positive assertions failed and said so. FOUR NEGATIVE ONES — "endRole
 *      does NOT touch the title" and its siblings — PASSED, because
 *      `!/title_ar/.test('')` is true. The half of that section protecting a
 *      person's history from erasure was green while reading nothing at all.
 *
 *   2. scripts/probe-level-challenge.mts captured `ORDER BY ([^\n]*)` and then
 *      stripped from the first quote with `.replace(/[`'"].*$/, '')`. Under
 *      CRLF the capture ends `...DESC`,\r` — `.` does not match `\r` and `$`
 *      will not match before it, so the strip silently did nothing and a
 *      perfectly correct ORDER BY was reported as a hole.
 *
 * The second kind is noise. The FIRST kind is the reason this file exists: a
 * red probe is an annoyance, but a green probe reading an empty string is a
 * guarantee that has quietly stopped existing, and nothing anywhere says so.
 *
 * Which is also why every probe that slices a REGION out of a file and asserts
 * over the region carries a CONTROL — placed before the dependent checks —
 * that the region was actually found and read. Normalising fixes today. The
 * control catches the next one.
 *
 * ── WHY THIS FILE IS NOT CALLED probe-something ────────────────────────────
 *
 * scripts/probe-all.mts runs every file matching `probe-*.mts`. A helper
 * named probe-source.mts would be spawned as a probe, print nothing, and be
 * counted as a result. The name is deliberate.
 */

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/** The repository root, derived from this file rather than from cwd. */
export const REPO: string = fileURLToPath(new URL('..', import.meta.url));

/**
 * CRLF and CR collapsed to LF.
 *
 * Exported on its own because a few probes build text from somewhere other
 * than a file — a spawned command's output, a JSON blob — and want the same
 * treatment before a regex with `\n`, `$` or `[^\n]` in it goes near them.
 */
export function normaliseNewlines(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * A source file as text, with LF line endings.
 *
 * Throws when the file is not there, which is what a probe naming an exact
 * path wants: a missing file is a fact worth stopping for, not an empty string
 * for every later assertion to pass vacuously against.
 */
export function readSource(path: string | URL): string {
  return normaliseNewlines(readFileSync(path, 'utf8'));
}

/**
 * The same, for a path a probe expects may legitimately be absent.
 *
 * Returns '' rather than throwing — so the caller MUST assert the length
 * before asserting anything else about the contents. Every existing caller
 * does; keep it that way.
 */
export function readSourceIfPresent(path: string | URL): string {
  return existsSync(path) ? readSource(path) : '';
}

/**
 * Join path segments under the repository root and read, '' when not there.
 *
 * The shape most probes want: `repoSource('src', 'lib', 'programme', 'gate.ts')`
 * rather than a template literal that has to get the separator right.
 */
export function repoSource(...parts: string[]): string {
  return readSourceIfPresent(join(REPO, ...parts));
}
