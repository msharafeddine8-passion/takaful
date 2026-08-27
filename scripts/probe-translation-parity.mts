/*
 * Where a course teaches less in English than it teaches in Arabic.
 *
 * THE DEFECT THIS EXISTS FOR was live on the platform and nothing saw it.
 * Sixteen text blocks across seven courses had English that stopped short of
 * the Arabic — whole paragraphs absent in some, closing sentences dropped in
 * others. The worst were in the safeguarding course, where the English reader
 * was missing what good documentation contains, what never to say to somebody
 * disclosing, what confidentiality actually permits, and the extra care needed
 * when reporting a risk to a disabled person who depends on a carer.
 *
 * The existing course probes could not catch it. They assert that both sides
 * are non-empty, which is a different question from whether they say the same
 * thing — and an English reader has nothing to compare against, so nobody
 * complains. Content can only go missing in one direction here, silently, and
 * stay missing.
 *
 * TWO MEASURES, because one is not enough.
 *
 * Paragraph count catches whole paragraphs dropped. It cannot see the
 * commoner shape: the same paragraphs with the last sentence or two gone.
 * Those read as complete.
 *
 * So also length. English translated from this Arabic runs roughly 1.2 to 1.45
 * times the Arabic by character count, because the script is denser and Arabic
 * carries more in fewer characters. Judged against each FILE's own median
 * rather than a fixed number, because some authors write tersely in English
 * throughout and a global threshold would report a whole course.
 *
 * Only the paragraph count is asserted. Length is a screen that prints a list
 * for somebody to read, and it stays a screen because calibrating it showed
 * that real losses and faithful compact translations overlap on that axis —
 * see the note on FLOOR. One measure is exact and fails the run; the other
 * points, and says so.
 *
 * A PURE probe: no database, no network. It reads the course files as text
 * rather than importing them, so it cannot be fooled by a re-export.
 */

import { readFileSync as readFileSyncRaw, readdirSync } from 'node:fs';
import { normaliseNewlines } from './source-text.mts';
/* readFileSync is shadowed with a normalising wrapper: git checks src/ out
 * with CRLF on Windows, which turns a newline-anchored regex below into a silent
 * pass and once made four negative assertions read an empty string. One
 * shadow covers every call site in this file. See scripts/source-text.mts. */
const readFileSync = (p: Parameters<typeof readFileSyncRaw>[0], enc: 'utf8'): string =>
  normaliseNewlines(readFileSyncRaw(p, enc));
import path from 'node:path';

let ok = 0;
const holes: string[] = [];

function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1;
  else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

const DIR = path.join(process.cwd(), 'src', 'lib', 'course-content');
const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.ts') && !['types.ts', 'index.ts'].includes(f))
  .sort();

/** Matches an `ar: '…'` immediately followed by its `en: '…'`. */
const PAIR = /ar:\s*'((?:[^'\\]|\\.)*)'\s*,\s*\n\s*en:\s*'((?:[^'\\]|\\.)*)'/g;

/*
 * Short strings are headings, labels and list items, where the ratio is noise
 * — a two-word label can be half the length in either language for no reason
 * worth reporting. Prose is where content hides.
 */
const MIN_CHARS = 200;

/*
 * WHERE THE LENGTH MEASURE STOPS BEING A TEST.
 *
 * It was going to be asserted, and calibrating it honestly showed that it
 * cannot be. A genuine truncation in sustainability-and-resources sat at 0.77
 * of its file's median, and a complete, faithful translation in
 * level-3-challenge sat at 0.80 — a scenario prompt, short and factual by
 * nature, with nothing missing from it at all. Real defects and correct text
 * overlap on this axis, so any threshold either lets a defect through or calls
 * correct work broken.
 *
 * So the length measure reports and does not fail. The paragraph count is
 * exact and is asserted; this is a list of places worth a human's eye. A check
 * that cries wolf is one somebody switches off, and then the assertion sitting
 * beside it stops being read too.
 */
const FLOOR = 0.8;

/** A file needs enough prose for a median to mean anything. */
const MIN_BLOCKS = 3;

console.log(`\n1. every Arabic paragraph has an English one (${files.length} courses)`);

let scanned = 0;
let thin = 0;
const missingParagraphs: string[] = [];
const cutShort: string[] = [];

for (const file of files) {
  const src = readFileSync(path.join(DIR, file), 'utf8');
  const blocks: Array<{ ar: string; en: string; arP: number; enP: number; ratio: number }> = [];

  for (const m of src.matchAll(PAIR)) {
    const [, ar, en] = m;
    if (ar.length < MIN_CHARS) continue;
    blocks.push({
      ar,
      en,
      arP: (ar.match(/\\n\\n/g) ?? []).length + 1,
      enP: (en.match(/\\n\\n/g) ?? []).length + 1,
      ratio: en.length / ar.length,
    });
  }
  scanned += blocks.length;
  if (blocks.length < MIN_BLOCKS) {
    thin += 1;
    continue;
  }

  const ratios = blocks.map((b) => b.ratio).sort((a, b) => a - b);
  const median = ratios[Math.floor(ratios.length / 2)];

  for (const b of blocks) {
    const head = b.ar.slice(0, 40);
    if (b.arP > b.enP) {
      missingParagraphs.push(`${file}: ${b.arP} Arabic paragraphs, ${b.enP} English — ${head}…`);
    } else if (b.ratio < median * FLOOR) {
      cutShort.push(
        `${file}: ratio ${b.ratio.toFixed(2)} against a median of ${median.toFixed(2)} — ${head}…`,
      );
    }
  }
}

check('there is prose to check at all', scanned > 100, `${scanned} blocks over ${MIN_CHARS} chars`);
check('no block has more Arabic paragraphs than English ones',
  missingParagraphs.length === 0, missingParagraphs.join(' | ') || 'none');
/*
 * Reported, never asserted — see the note on FLOOR for why it cannot be a
 * test. Printed even when the list is empty, because "the screen ran and found
 * nothing" and "the screen did not run" must not look the same.
 */
console.log(`\n  ${cutShort.length} block(s) worth a second look on length:`);
for (const line of cutShort) console.log(`    ${line}`);

/*
 * The detector has to be able to fail, or it proves nothing. Both measures are
 * run against fabricated pairs whose defect is known — a probe that always
 * passes is indistinguishable from a probe that is broken, and that is exactly
 * the trap the codebase has hit before with fingerprint invariance checks.
 */
console.log('\n2. the detector can actually detect');

const arSample = 'ا'.repeat(400) + '\\n\\n' + 'ب'.repeat(400);
const enFull = 'a'.repeat(520) + '\\n\\n' + 'b'.repeat(520);

const paragraphsOf = (s: string) => (s.match(/\\n\\n/g) ?? []).length + 1;
check('a dropped paragraph is seen',
  paragraphsOf(arSample) > paragraphsOf('a'.repeat(520)));
check('a full translation is not', paragraphsOf(arSample) === paragraphsOf(enFull));
check('a truncated paragraph is seen by length',
  ('a'.repeat(260) + '\\n\\n' + 'b'.repeat(260)).length / arSample.length < 1.35 * FLOOR);
check('a faithful one is not', enFull.length / arSample.length >= 1.35 * FLOOR);

/*
 * Reported rather than asserted. A course with one or two prose blocks has no
 * meaningful median, so it is skipped — and a skip nobody is told about is how
 * a check quietly stops covering half of what it claims to.
 */
console.log(`\n  note: ${thin} course file(s) had fewer than ${MIN_BLOCKS} prose blocks and were skipped.`);

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
