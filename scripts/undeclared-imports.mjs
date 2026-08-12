/*
 * Every bare package imported in the source, checked against what package.json
 * declares.
 *
 * This exists because of a real outage. Two imports — @vercel/analytics and
 * @vercel/speed-insights — were added to the layout without being added to
 * package.json. Every local build passed, because both were sitting in
 * node_modules from an earlier `npm install` that never wrote them down. On
 * Vercel, `npm ci` installs strictly from the lockfile, could not resolve
 * either, and failed every deploy for a day while the live site stayed
 * silently on an older commit.
 *
 * `npm ci` followed by a build catches this too, but two minutes later and as
 * a module-resolution error that does not name the actual mistake. This names
 * it in about a second.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { builtinModules } from 'node:module';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const declared = new Set([
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
]);
const builtin = new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)]);

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue;
    const path = `${dir}/${entry}`;
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(ts|tsx|mts|mjs|js)$/.test(path)) files.push(path);
  }
})('.');

const missing = new Map();
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  for (const match of src.matchAll(/(?:from\s+|require\()\s*['"]([^'".][^'"]*)['"]/g)) {
    const spec = match[1];
    if (spec.startsWith('@/') || spec.startsWith('.')) continue;
    // A scoped package is two segments; everything else is one.
    const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
    if (builtin.has(name) || builtin.has(spec) || declared.has(name)) continue;
    if (!missing.has(name)) missing.set(name, []);
    missing.get(name).push(file);
  }
}

if (missing.size === 0) {
  console.log(`Every imported package is declared (${files.length} files).`);
} else {
  for (const [name, where] of missing) {
    console.error(`UNDECLARED  ${name}\n            imported by ${where[0]}`);
  }
  console.error(
    `\n${missing.size} package(s) imported but not in package.json. A clean` +
      ' `npm ci` cannot install them, so the deploy will fail even though the' +
      ' local build passes. Run: npm install --save <package>',
  );
  process.exitCode = 1;
}
