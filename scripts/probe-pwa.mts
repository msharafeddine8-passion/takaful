/*
 * What the service worker is allowed to keep on the device.
 *
 * This is the only probe in the suite that reads a file the browser executes
 * rather than a module the app imports, and it earns that because of what the
 * mistake would cost.
 *
 * These phones are shared. Volunteers hand them to colleagues, families share
 * one device, a coordinator's phone goes round a room. Every HTML page on this
 * platform is personal or one step from it — /account is somebody's hours and
 * certificates, /staff is other people's records, and even a public page
 * carries a signed-in header with a name in it. A service worker that cached
 * one page could serve it to the next person holding the phone, and nothing in
 * the build, the types or the browser would object.
 *
 * So the rule is absolute: only immutable, public, non-personal build assets
 * are cached, and it is asserted here against the real file rather than
 * trusted to a comment. The cheapest way for this to break is somebody adding
 * a prefix to CACHEABLE in a hurry.
 *
 * A PURE probe: no database, no network. It reads two files from disk.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

let ok = 0;
const holes: string[] = [];

function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1;
  else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

const read = (...parts: string[]) => {
  try {
    return readFileSync(path.join(process.cwd(), ...parts), 'utf8');
  } catch {
    return '';
  }
};

const sw = read('public', 'sw.js');
const manifest = read('src', 'app', 'manifest.ts');
const layout = read('src', 'app', '[lang]', 'layout.tsx');
const config = read('next.config.ts');

/* ------------------------------------------------------------------ *
 * 1. The worker exists and its rule can be read
 * ------------------------------------------------------------------ */
console.log('\n1. the file');

check('the service worker is there', sw.length > 0);

/*
 * The allow-list is lifted out of the source and evaluated, rather than
 * matched as a string. A probe that greps for '/_next/static/' passes whether
 * that prefix is in the list or in a comment saying it was removed.
 */
const listed = [...sw.matchAll(/const CACHEABLE = \[([^\]]*)\]/g)]
  .flatMap((m) => [...m[1].matchAll(/'([^']+)'/g)].map((q) => q[1]));

check('and it declares exactly one allow-list', listed.length > 0, listed.join(', '));

/* ------------------------------------------------------------------ *
 * 2. What may be cached, and what must never be
 * ------------------------------------------------------------------ */
console.log('\n2. the allow-list');

/*
 * Every entry has to be something whose bytes cannot differ between two
 * people. /_next/static carries a content hash in the filename; the rest are
 * fixed files in public/. Anything generated per request fails this by being
 * a path that is not one of those.
 */
const PUBLIC_PREFIXES = ['/_next/static/', '/photos/', '/logo-', '/icon-', '/offline.html'];
for (const entry of listed) {
  check(`'${entry}' is a build asset, not a page`,
    PUBLIC_PREFIXES.some((prefix) => entry.startsWith(prefix)));
}

/* The paths that would be catastrophic, named individually so a failure says
 * which one somebody added rather than "the list changed". */
for (const forbidden of ['/account', '/staff', '/api', '/ar', '/en', '/']) {
  check(`'${forbidden}' is not cacheable`,
    !listed.includes(forbidden) && !listed.some((e) => e === forbidden + '/'));
}

check('the API is refused explicitly as well as by omission',
  /pathname\.startsWith\('\/api\/'\)[\s\S]{0,40}return false/.test(sw));
check('cross-origin requests are refused',
  /url\.origin !== self\.location\.origin[\s\S]{0,40}return false/.test(sw));
check('anything that is not a GET is left alone',
  /request\.method !== 'GET'/.test(sw));

/*
 * THE ONE THAT MATTERS MOST.
 *
 * A navigation must go to the network and fall back to the offline page — not
 * to a cached copy of wherever the person went last. Showing somebody
 * yesterday's dashboard offline is showing figures that may have changed and,
 * on a shared phone, may not be theirs. `caches.match` inside the navigate
 * branch pointing anywhere but OFFLINE_URL is the shape of that mistake.
 */
const navigateBranch = sw.slice(sw.indexOf("request.mode === 'navigate'"));
const navigateBody = navigateBranch.slice(0, navigateBranch.indexOf('return;'));
check('a navigation is always fetched, never served from the cache',
  /fetch\(request\)/.test(navigateBody));
check('and its only fallback is the offline page',
  (navigateBody.match(/caches\.match\(/g) ?? []).length === 1
  && /caches\.match\(OFFLINE_URL\)/.test(navigateBody));

/* No write queue. A held-back hour entry means a volunteer who believes they
 * logged their hours and a database that never heard of it. */
check('there is no background sync and no write queue',
  !/\bsync\b|backgroundSync|IndexedDB|indexedDB/.test(sw));

/* An opaque response has status 0 and may be a captive portal's login page.
 * Caching one pins a Wi-Fi splash screen in place of a stylesheet. */
check('only clean same-origin responses are stored',
  /response\.ok && response\.type === 'basic'/.test(sw));

/* ------------------------------------------------------------------ *
 * 3. The pieces around it
 * ------------------------------------------------------------------ */
console.log('\n3. manifest, icon and headers');

check('the offline page exists', read('public', 'offline.html').length > 0);
check('and carries both languages, because the request never reached the server '
  + 'and there is no way to know which was wanted',
  /lang="en"/.test(read('public', 'offline.html')));

/*
 * The icon route's name must keep its extension: src/proxy.ts redirects every
 * path without one to a locale, so /icon-maskable answered 307 and then 404 —
 * a manifest pointing at a dead URL, which nothing in the build checks.
 */
check('the maskable icon is behind a path the locale proxy skips',
  /icon-maskable\.png/.test(manifest),
  (manifest.match(/src: '([^']+)'/g) ?? []).join(' '));

/*
 * The manifest's theme_color tints an installed app's title bar and the
 * viewport export tints the browser's. Different values give a bar that
 * changes colour the moment somebody installs, which looks like a fault.
 */
const manifestTheme = /theme_color: '(#[0-9a-f]{6})'/.exec(manifest)?.[1];
check('the manifest theme colour matches the light-theme viewport colour',
  manifestTheme === '#ffffff' && /color: '#ffffff'/.test(layout),
  manifestTheme ?? 'not set');

/*
 * A worker is only replaced when the browser fetches /sw.js and finds
 * different bytes. A CDN holding a copy means a mistake in this file is pinned
 * on every installed device with no way to push a correction.
 */
check('the worker itself is served no-store',
  /source: '\/sw\.js'[\s\S]{0,200}no-store/.test(config));

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
