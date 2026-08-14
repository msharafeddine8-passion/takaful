/**
 * Accessibility, as a standing rule rather than a one-off audit.
 *
 * A survey found the good news — no drag-and-drop anywhere, a real skip link,
 * a global reduced-motion block, contrast-corrected ink tokens — and the
 * failure mode of good news is that nobody notices when it stops being true.
 * This probe turns each survey finding into an assertion, so the day someone
 * adds a draggable list, an unlabelled progress bar, a `pl-4`, or a status
 * conveyed only by an emoji, the build says so and names the file.
 *
 * It is a PURE probe: no database, no pg, no network. It also may not import
 * any .tsx module — scripts/tsconfig.json sets no `jsx` option, so importing a
 * component would fail `tsc -p scripts --noEmit` inside `npm run check`.
 * Component source is therefore read as text and asserted against as text,
 * which is blunt but honest: it checks what actually ships in the file.
 *
 * The one thing it does import is the LMS dictionary, because that is plain
 * TypeScript, and because the survey found there is no probe anywhere checking
 * that the Arabic and English key sets agree or that the Arabic is actually
 * Arabic. Section 9 is that missing probe.
 *
 *   npx tsx --env-file=.env.local scripts/probe-a11y.mts
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { lmsAr, lmsEn } from '../src/lib/dictionaries/lms.ts';

/* ------------------------------------------------------------------ *
 * Harness — identical in shape to probe-courses.mts, except holes are
 * kept rather than counted, so the summary can name every offender.
 * ------------------------------------------------------------------ */

let ok = 0;
const holes: string[] = [];

function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1;
  else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

/* ------------------------------------------------------------------ *
 * Filesystem helpers
 * ------------------------------------------------------------------ */

/** Repo root, derived from this file rather than from cwd. */
const ROOT = fileURLToPath(new URL('..', import.meta.url));

const SRC = join(ROOT, 'src');
const SCRIPTS = join(ROOT, 'scripts');
const LMS_DIR = join(SRC, 'components', 'lms');
const MAP_DIR = join(SRC, 'app', '[lang]', 'account', 'map');

/** Path as it should be spoken about: repo-relative, forward slashes. */
function rel(file: string): string {
  return file.slice(ROOT.length).split('\\').join('/');
}

function walk(dir: string, extensions: string[]): string[] {
  if (!existsSync(dir)) return [];
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full, extensions));
    else if (extensions.some((ext) => entry.name.endsWith(ext))) found.push(full);
  }
  return found;
}

function read(file: string): string {
  return readFileSync(file, 'utf8');
}

/** Same length, same newlines, no content — so offsets and line numbers hold. */
function blank(text: string): string {
  return text.replace(/[^\n]/g, ' ');
}

/**
 * Source with comments blanked out.
 *
 * Every text assertion below is about code, not prose. Without this, a header
 * comment explaining "mirrors correctly under RTL" trips the physical
 * direction check, and the fix a developer reaches for is to delete the
 * explanation — the exact opposite of what is wanted.
 *
 * Comments are replaced with spaces rather than removed so that every offset
 * still points at the same line of the real file; a probe that reports the
 * wrong line number is worse than one that reports none.
 *
 * The `//` rule deliberately ignores a slash pair preceded by a colon so that
 * `https://` survives.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (match: string) => blank(match))
    .replace(/(^|[^:])\/\/[^\n]*/g, (match: string, lead: string) => lead + blank(match.slice(lead.length)));
}

/** Line number of a character offset, 1-based, for messages a human can act on. */
function lineOf(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

/** matchAll's index is optional in the standard lib types; it never is in practice. */
function at(match: { index?: number }): number {
  return match.index ?? 0;
}

/** The files this probe governs: the new LMS components plus the map route. */
const OWNED = [...walk(LMS_DIR, ['.ts', '.tsx']), ...walk(MAP_DIR, ['.ts', '.tsx'])];

/** A file that must exist for the feature to be whole. Reports its own absence. */
function requireFile(path: string, why: string): string | null {
  if (existsSync(path)) return read(path);
  check(why, false, `${rel(path)} does not exist`);
  return null;
}

/* ================================================================== *
 * 1. DRAG AFFORDANCES — the standing answer to "is every activity
 *    keyboard operable?"
 * ================================================================== */

console.log('\n--- 1. nothing drags, and if anything ever does it types too ---');

const DRAG =
  /draggable|onDragStart|onDragOver|onDragEnd|onDrop|dataTransfer|setPointerCapture|onPointerDown/;
const KEYBOARD = /onKeyDown/;

/*
 * This file is skipped: it contains the pattern above as a literal, and a
 * guard that flags itself teaches developers to disable guards.
 */
const SELF = fileURLToPath(import.meta.url);

const scanned = [...walk(SRC, ['.ts', '.tsx']), ...walk(SCRIPTS, ['.mts', '.ts'])].filter(
  (file) => file !== SELF,
);

const draggy = scanned.filter((file) => DRAG.test(stripComments(read(file))));

if (draggy.length === 0) {
  /*
   * Printed rather than skipped. The survey's finding was that zero drag
   * affordances exist in src, scripts, migrations or docs and no drag library
   * is installed; recording that as a passing behaviour is what turns it from
   * a note in a document into something the build defends.
   */
  check(
    `no drag affordance exists anywhere in the repository (${scanned.length} files read)`,
    true,
    'so every activity is keyboard-operable by construction',
  );
} else {
  for (const file of draggy) {
    const source = stripComments(read(file));
    const trigger = DRAG.exec(source);
    check(
      `${rel(file)} drags, so it also handles keys`,
      KEYBOARD.test(source),
      `found ${trigger ? trigger[0] : 'a drag handler'} with no onKeyDown in the same file`,
    );
  }
}

/* --- 2. no drag library --- */

const DRAG_LIBS = ['@dnd-kit/core', 'dnd-kit', 'react-beautiful-dnd', 'react-dnd', 'sortablejs'];

function dependencyNames(): string[] {
  const parsed: unknown = JSON.parse(read(join(ROOT, 'package.json')));
  if (typeof parsed !== 'object' || parsed === null) return [];
  const names: string[] = [];
  for (const field of ['dependencies', 'devDependencies']) {
    const block: unknown = (parsed as Record<string, unknown>)[field];
    if (typeof block === 'object' && block !== null) names.push(...Object.keys(block));
  }
  return names;
}

const installed = dependencyNames();
const dragLibs = installed.filter((name) =>
  DRAG_LIBS.some((lib) => name === lib || name.startsWith(`${lib}/`) || name.includes(lib)),
);
check('no drag library is installed', dragLibs.length === 0, dragLibs.join(', ') || 'none of ' + DRAG_LIBS.join(', '));

/* ================================================================== *
 * 2. LOGICAL DIRECTION — Arabic is the default locale, and a single
 *    physical utility breaks it silently.
 * ================================================================== */

console.log('\n--- 2. no physical-direction utilities in the new files ---');

const PHYSICAL =
  /\b(?:pl|pr|ml|mr|text-left|text-right|border-l|border-r|rounded-l|rounded-r)-|\b(?:left|right)-(?:0|\d|\[|auto|full)/g;

if (OWNED.length === 0) {
  check('there are LMS component or map files to check', false, `${rel(LMS_DIR)} and ${rel(MAP_DIR)} are both empty`);
}

for (const file of OWNED) {
  const raw = read(file);
  /*
   * An SVG `transform` attribute is exempt: `translate(...)` and `rotate(...)`
   * are geometry, not layout, and a ring drawn in SVG mirrors with the
   * document because the whole element does.
   */
  const source = stripComments(raw).replace(
    /transform=(?:"[^"]*"|'[^']*'|\{[^}]*\})/g,
    (match: string) => blank(match),
  );
  const hits = [...source.matchAll(PHYSICAL)];
  check(
    `${rel(file)} uses logical properties only`,
    hits.length === 0,
    hits.map((hit) => `"${hit[0]}" on line ${lineOf(source, at(hit))}`).join('; ') ||
      'ms/me/ps/pe/start/end throughout',
  );
}

/* ================================================================== *
 * 3. PROGRESS BARS CARRY A NAME
 * ================================================================== */

console.log('\n--- 3. every progress indicator is named ---');

const NAMED = /aria-label|aria-labelledby/;

for (const file of OWNED) {
  const source = read(file);
  for (const hit of source.matchAll(/role="progressbar"/g)) {
    const window = source.slice(Math.max(0, at(hit) - 400), at(hit) + 400);
    const named = NAMED.test(window);
    check(
      `${rel(file)}: the progressbar on line ${lineOf(source, at(hit))} has a name`,
      named,
      named ? '' : 'no aria-label or aria-labelledby within 400 characters of it',
    );
  }
}

const ring = requireFile(
  join(LMS_DIR, 'ProgressRing.tsx'),
  'ProgressRing exposes its value to assistive technology',
);
if (ring !== null) {
  for (const attribute of ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-label']) {
    check(`ProgressRing.tsx sets ${attribute}`, ring.includes(attribute));
  }
}

/* ================================================================== *
 * 4. NO STATE CONVEYED BY GLYPH ALONE
 * ================================================================== */

console.log('\n--- 4. no state told only by an emoji ---');

/*
 * Pictographs, dingbats, arrows, geometric shapes and the variation selector.
 * Deliberately wide: a false positive costs one `aria-hidden`, a false
 * negative costs a reader the meaning of the row.
 */
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2190}-\u{2BFF}\u{2600}-\u{27BF}\u{FE0F}]/gu;

/** Files allowed to hold a bare glyph, by name, with a reason. */
const GLYPH_EXEMPT = new Set<string>([]);

for (const file of walk(LMS_DIR, ['.ts', '.tsx'])) {
  if (GLYPH_EXEMPT.has(basename(file))) continue;
  const source = read(file);
  const bare: string[] = [];
  for (const hit of source.matchAll(EMOJI)) {
    const window = source.slice(Math.max(0, at(hit) - 200), at(hit) + 200);
    if (!window.includes('aria-hidden')) {
      bare.push(`"${hit[0]}" on line ${lineOf(source, at(hit))}`);
    }
  }
  check(
    `${rel(file)}: every glyph is decorative and hidden, or has words beside it`,
    bare.length === 0,
    bare.join('; ') || 'no unhidden glyph',
  );
}

const badge = requireFile(
  join(LMS_DIR, 'LevelBadge.tsx'),
  'a locked or earned badge says so in words, not only in colour',
);
if (badge !== null) {
  check('LevelBadge.tsx names the locked state from the dictionary', badge.includes('badgeLocked'));
  check('LevelBadge.tsx names the earned state from the dictionary', badge.includes('badgeEarned'));
}

/* ================================================================== *
 * 5. REDUCED MOTION IS READ IN JAVASCRIPT, NOT LEFT TO THE STYLESHEET
 * ================================================================== */

console.log('\n--- 5. motion asks first ---');

const a11y = requireFile(join(LMS_DIR, 'a11y.ts'), 'the reduced-motion hook exists');
if (a11y !== null) {
  check(
    'a11y.ts reads the real media query',
    a11y.includes('prefers-reduced-motion: reduce'),
    'the hook must consult matchMedia, not guess',
  );
  check('a11y.ts exports useReducedMotion', /export function useReducedMotion/.test(a11y));
}

const celebration = requireFile(
  join(LMS_DIR, 'Celebration.tsx'),
  'the celebration component exists',
);
if (celebration !== null) {
  // Either spelling of the same module — the relative path or the `@/` alias
  // the rest of the repo prefers. What matters is that the hook is consulted.
  check(
    'Celebration.tsx imports useReducedMotion from the a11y module',
    /useReducedMotion/.test(celebration) &&
      /from\s+['"](?:\.\/|@\/components\/lms\/)a11y['"]/.test(celebration),
  );

  /*
   * Order matters, and this is the cheap way to assert it without parsing:
   * the identifier `reduced` must appear before anything that animates or
   * schedules. A component that mounts a timer and *then* checks the
   * preference has already started the thing the reader asked it not to do.
   */
  const reduced = /\breduced\b/.exec(celebration);
  check(
    'Celebration.tsx binds the preference to a `reduced` value',
    reduced !== null,
    'expected `const reduced = useReducedMotion()`',
  );
  if (reduced !== null) {
    const early: string[] = [];
    for (const hit of celebration.matchAll(/animate-|transition-|setTimeout|requestAnimationFrame/g)) {
      if (at(hit) < reduced.index) {
        early.push(`"${hit[0]}" on line ${lineOf(celebration, at(hit))}`);
      }
    }
    check(
      'Celebration.tsx reads the preference before it schedules or animates anything',
      early.length === 0,
      early.join('; ') || 'nothing moves before the check',
    );
  }
}

/* ================================================================== *
 * 6. LIVE REGIONS
 * ================================================================== */

console.log('\n--- 6. announcements come from a region, not from a control ---');

const announcer = requireFile(join(LMS_DIR, 'Announcer.tsx'), 'the shared live region exists');
if (announcer !== null) {
  check('Announcer.tsx declares aria-live', announcer.includes('aria-live'));
  check('Announcer.tsx is visually hidden with sr-only', announcer.includes('sr-only'));
  check(
    'Announcer.tsx renders the region even when there is nothing to say',
    /message \?\? ''/.test(announcer),
    'a region inserted together with its text is not reliably announced',
  );
}

for (const file of walk(LMS_DIR, ['.ts', '.tsx'])) {
  const source = read(file);
  const offenders: string[] = [];
  for (const tag of source.matchAll(/<button\b[^>]*>/g)) {
    if (tag[0].includes('aria-live')) {
      offenders.push(`the <button> on line ${lineOf(source, at(tag))}`);
    }
  }
  check(
    `${rel(file)}: no aria-live on an interactive control`,
    offenders.length === 0,
    offenders.join('; ') || 'announcements go through <Announcer />',
  );

  /*
   * Announcer.tsx rendering an empty region is only half the contract: the
   * caller has to mount that region in a commit *before* the one that fills
   * it. A component that returns null while it is still deciding what to say
   * defeats it — no region exists on the first commit, so the region and its
   * text arrive together and assistive technology, which watches regions it
   * already knows about rather than rescanning the document, says nothing.
   *
   * Celebration.tsx shipped exactly that bug and this probe did not catch it,
   * because it only ever read Announcer.tsx. Cheap structural proxy: in a file
   * that mounts <Announcer>, no `return null` may appear above it.
   */
  const mount = source.indexOf('<Announcer');
  if (mount !== -1) {
    const early = [...source.matchAll(/return null\b/g)].filter((hit) => at(hit) < mount);
    check(
      `${rel(file)}: mounts <Announcer> unconditionally, before it has anything to say`,
      early.length === 0,
      early.length === 0
        ? 'the region is in the tree and empty before it is filled'
        : `"return null" on line ${early.map((hit) => lineOf(source, at(hit))).join(', ')} runs before the region mounts, so the region and its text arrive in the same commit`,
    );
  }
}

/* ================================================================== *
 * 7. TARGET SIZE (WCAG 2.2 AA, 2.5.8)
 * ================================================================== */

console.log('\n--- 7. everything tappable is big enough to tap ---');

const BIG_ENOUGH = /min-h-11|min-h-12|py-3/;

for (const file of OWNED) {
  const source = read(file);
  const small: string[] = [];
  for (const tag of source.matchAll(/<(?:button|Link)\b/g)) {
    // Forward window mostly: the class list follows the tag name. A little
    // behind it too, for a control whose classes come from a const above it.
    const window = source.slice(Math.max(0, at(tag) - 100), at(tag) + 300);
    if (!BIG_ENOUGH.test(window)) {
      small.push(`${tag[0]}> on line ${lineOf(source, at(tag))}`);
    }
  }
  check(
    `${rel(file)}: every control clears the 44px target`,
    small.length === 0,
    small.join('; ') || 'min-h-11 / min-h-12 / py-3 throughout',
  );
}

/* ================================================================== *
 * 8. THE DICTIONARY — the probe-i18n the repo never had.
 * ================================================================== */

console.log('\n--- 8. the LMS strings exist, in both languages, and differ ---');

/** Flattens the nested string tree to `a.b.c` keys. Non-strings are reported. */
function flatten(value: unknown, prefix: string, into: Map<string, string>, bad: string[]): void {
  if (typeof value === 'string') {
    into.set(prefix, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${prefix}[${index}]`, into, bad));
    return;
  }
  if (typeof value === 'object' && value !== null) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix === '' ? key : `${prefix}.${key}`, into, bad);
    }
    return;
  }
  bad.push(`${prefix} is ${typeof value}, not a string`);
}

const badAr: string[] = [];
const badEn: string[] = [];
const ar = new Map<string, string>();
const en = new Map<string, string>();
flatten(lmsAr, '', ar, badAr);
flatten(lmsEn, '', en, badEn);

check('every Arabic entry is a string', badAr.length === 0, badAr.join('; ') || `${ar.size} strings`);
check('every English entry is a string', badEn.length === 0, badEn.join('; ') || `${en.size} strings`);

const missingEn = [...ar.keys()].filter((key) => !en.has(key));
const missingAr = [...en.keys()].filter((key) => !ar.has(key));
check('lmsAr and lmsEn hold exactly the same keys', missingEn.length === 0 && missingAr.length === 0,
  [
    missingEn.length ? `missing from lmsEn: ${missingEn.join(', ')}` : '',
    missingAr.length ? `missing from lmsAr: ${missingAr.join(', ')}` : '',
  ].filter(Boolean).join(' | ') || `${ar.size} keys each`);

const empty = [...ar.entries(), ...en.entries()]
  .filter(([, value]) => value.trim() === '')
  .map(([key]) => key);
check('no string is empty or blank', empty.length === 0, empty.join(', ') || 'none');

/*
 * A key whose two locales are byte-identical is almost always an English
 * string pasted into ar.ts — the exact failure the shared Dictionary type
 * cannot catch, and the one the project's rules forbid outright.
 */
const identical = [...ar.entries()]
  .filter(([key, value]) => en.get(key) === value)
  .map(([key, value]) => `${key} = "${value}"`);
check('no key carries the same text in both languages', identical.length === 0,
  identical.join('; ') || 'every string is translated');

const ARABIC = /[؀-ۿ]/;
const notArabic = [...ar.entries()]
  .filter(([, value]) => !ARABIC.test(value))
  .map(([key, value]) => `${key} = "${value}"`);
check('every Arabic string actually contains Arabic script', notArabic.length === 0,
  notArabic.join('; ') || `${ar.size} strings checked`);

/*
 * Interpolation here is `.replace('{n}', …)` done by the caller, so a
 * placeholder present in one locale and absent in the other means one language
 * silently drops a number.
 */
const PLACEHOLDER = /\{[a-zA-Z0-9_]+\}/g;
function placeholders(value: string): string[] {
  return [...new Set(value.match(PLACEHOLDER) ?? [])].sort();
}
const mismatched: string[] = [];
for (const [key, arabic] of ar) {
  const english = en.get(key);
  if (english === undefined) continue;
  const a = placeholders(arabic).join(',');
  const e = placeholders(english).join(',');
  if (a !== e) mismatched.push(`${key}: ar has [${a || 'none'}], en has [${e || 'none'}]`);
}
check('placeholders match across both locales', mismatched.length === 0,
  mismatched.join('; ') || 'no placeholder is dropped');

/* ================================================================== *
 * 9. THE ROUTE ITSELF
 * ================================================================== */

console.log('\n--- 9. the map route behaves like the rest of /account ---');

const mapPage = requireFile(join(MAP_DIR, 'page.tsx'), 'the map route exists');
if (mapPage !== null) {
  const flat = mapPage.replace(/\s+/g, ' ');
  check(
    'the map is a private page and says so to crawlers',
    flat.includes('robots: { index: false'),
    'an account page must not be indexed',
  );
  check(
    'the map emits canonical and hreflang through alternatesFor',
    mapPage.includes('alternatesFor'),
  );
}

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
