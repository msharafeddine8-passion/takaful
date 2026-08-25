/*
 * Every colour utility used in the source, checked against the tokens
 * globals.css actually defines.
 *
 * This exists because of a real defect that shipped and sat unnoticed. Twenty
 * places across the app — the cancel-activity button, the safeguarding form's
 * error lines, the attendance sheet's absent marks, the roster's name-mismatch
 * caution — were written with `border-bad`, `bg-bad/10`, `text-bad-text`,
 * `border-warn`. No token by any of those names was ever defined.
 *
 * Tailwind v4 does not warn about an unknown utility. It emits no rule at all.
 * So every one of those elements rendered with a currentColor border and no
 * tint: an error message that did not look like an error, a destructive button
 * that did not look destructive. The build passed, the types passed, the probes
 * passed, and the only way to find it was to read the generated stylesheet.
 *
 * A name is legitimate here if globals.css defines --color-<name>, or if it is
 * on the ALLOWED list below — Tailwind's own keywords and the non-colour
 * utilities that share these prefixes. The list is deliberately explicit: a new
 * entry is a decision somebody makes on purpose, which is the whole point.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';

const css = readFileSync('src/app/globals.css', 'utf8');

/*
 * Both @theme blocks at once. The plain block holds the fixed brand colours and
 * the inline block holds the ones that flip with the theme; a utility does not
 * care which it came from, and reading only one of them would report half the
 * palette as undefined.
 */
const defined = new Set([...css.matchAll(/--color-([a-z0-9-]+)\s*:/g)].map((m) => m[1]));

/*
 * The prefixes that take a colour. `text-` and `border-` also take sizes,
 * alignments and widths, and `bg-` takes positions and gradients — hence the
 * allowlist rather than a bare prefix match.
 */
const PREFIXES = [
  'bg', 'text', 'border', 'ring', 'fill', 'stroke', 'divide',
  'outline', 'shadow', 'accent', 'caret', 'decoration', 'placeholder',
];

/*
 * `from-`, `via-` and `to-` are gradient stops and are deliberately NOT checked.
 *
 * They are also ordinary English. Scanning for them turned up `to-do`,
 * `to-face`, `from-the-minute` and `from-address` out of course content and
 * comments — eight false reports to cover the two gradient stops this codebase
 * actually has (both on the membership card, both already using defined
 * tokens). A check that cries wolf is a check somebody deletes. If gradients
 * spread, the fix is to scan className attributes rather than whole files, not
 * to put these back and live with the noise.
 */

const ALLOWED = new Set([
  // Tailwind's universal colour keywords.
  'white', 'black', 'transparent', 'current', 'inherit', 'none',
  /*
   * Sides and axes: border-b, border-t, border-s, divide-y. These share the
   * prefix and are not colours at all — `border-b-line` is a bottom border in
   * the line colour, and the regex below sees only the `b`.
   */
  'b', 't', 'l', 'r', 'x', 'y', 's', 'e',
  // text-<size> and the rest of the type scale.
  'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl',
  // text-<alignment> and text-<wrapping>.
  'start', 'end', 'center', 'left', 'right', 'justify',
  'wrap', 'nowrap', 'balance', 'pretty', 'ellipsis', 'clip',
  // border-<side-less width or style>, divide/outline styles.
  'solid', 'dashed', 'dotted', 'double', 'hidden', 'collapse', 'separate',
  // bg-<attachment/position/repeat/size>.
  'fixed', 'local', 'scroll', 'cover', 'contain', 'repeat', 'top', 'bottom',
  'origin', 'padding', 'content',
  // decoration-<style/thickness> and text-decoration keywords.
  'underline', 'overline', 'auto', 'from-font',
  // stroke/fill keywords.
  'round', 'butt', 'square', 'miter', 'bevel',
  /*
   * Plain CSS, not a utility. The certificate and card pages carry a print
   * stylesheet as a literal string, and `border-radius: 0 !important` inside
   * it has the same shape as a class name.
   */
  'radius',
]);

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = `${dir}/${entry}`;
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(ts|tsx)$/.test(path)) files.push(path);
  }
})('src');

/*
 * Matches `border-danger`, `bg-danger/10`, `dark:hover:text-ok-text`. The name
 * stops at a slash (an opacity modifier), which is why the capture excludes it.
 *
 * Numeric tails are dropped before the check: `border-2` and `text-3xl` are a
 * width and a size, and `bg-brand-orange/[0.08]` is an arbitrary opacity, none
 * of which name a colour.
 */
const RE = new RegExp(String.raw`\b(?:${PREFIXES.join('|')})-([a-z][a-z0-9-]*)`, 'g');

/*
 * Tailwind's own palette, which is real and does emit rules.
 *
 * These are not what this check is for. The house rule is that components read
 * the design tokens and never a raw palette colour — but a `bg-emerald-100`
 * that ignores the rule still renders, and a checker that cannot tell "wrong
 * colour" from "no colour at all" reports several hundred lines of the former
 * and buries the one instance of the latter. That is how a check gets turned
 * off. This one answers exactly one question: does this class paint anything?
 */
const PALETTE = new Set([
  'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber',
  'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue',
  'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
]);
const SHADE = /^(?:50|9[05]0|[1-8]00)$/;

function isRealTailwindColour(name) {
  // bg-gradient-to-r and friends: a gradient direction, not a colour.
  if (name.startsWith('gradient-to-')) return true;
  const cut = name.lastIndexOf('-');
  if (cut < 0) return false;
  return PALETTE.has(name.slice(0, cut)) && SHADE.test(name.slice(cut + 1));
}

const unknown = new Map();
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  for (const match of src.matchAll(RE)) {
    /*
     * A side or axis segment is stripped before the check: `border-s-brand-blue`
     * is an inline-start border in a defined colour, and without this the check
     * sees the name as `s-brand-blue` and reports a colour that does not exist.
     */
    let name = match[1];
    const head = name.split('-')[0];
    if (name.includes('-') && ALLOWED.has(head) && head.length === 1) {
      name = name.slice(head.length + 1);
    }
    if (!name) continue;                       // `border-s-[3px]`: an arbitrary value
    if (defined.has(name) || ALLOWED.has(name) || isRealTailwindColour(name)) continue;
    // What is left of `border-s-4` after the strip: a width, not a colour.
    if (/^\d+(\.\d+)?$/.test(name)) continue;
    /*
     * A name whose leading segment is itself a defined token is a longer
     * utility on the same family and not a colour — there is none of those
     * today, but `border-line-through` would be one.
     */
    if (defined.has(name.split('-')[0])) continue;
    if (!unknown.has(name)) unknown.set(name, []);
    if (!unknown.get(name).includes(file)) unknown.get(name).push(file);
  }
}

if (unknown.size === 0) {
  console.log(`Every colour utility resolves to a defined token (${files.length} files).`);
} else {
  for (const [name, where] of unknown) {
    console.error(
      `UNKNOWN COLOUR  ${name}\n                used in ${where.length} file(s), first: ${where[0]}`,
    );
  }
  console.error(
    `\n${unknown.size} colour name(s) with no --color-<name> in globals.css.` +
      ' Tailwind emits no rule for these, so the element renders unstyled and' +
      ' nothing fails. Define the token, or use an existing one, or — if this is' +
      ' not a colour at all — add the keyword to ALLOWED in this file.',
  );
  process.exitCode = 1;
}
