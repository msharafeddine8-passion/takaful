/*
 * The service worker.
 *
 * WHAT IT IS FOR: the association's volunteers are on mid-range Android phones
 * and Lebanese mobile data. A cold start that re-downloads the whole shell over
 * a bad connection is the difference between checking your next activity on the
 * bus and giving up. This keeps the static shell on the device and shows an
 * honest page when the network is gone.
 *
 * WHAT IT MUST NEVER DO, AND WHY THIS FILE IS MOSTLY ABOUT THAT.
 *
 * It never caches a page. Not one. Every HTML response on this platform is
 * either personal or one step from personal: /account is somebody's hours and
 * certificates, /staff is other people's records, and even a public page
 * carries the signed-in header with a name in it. A cached page is a page that
 * can be served to the next person holding the phone — and these phones are
 * shared. Volunteers hand them to colleagues, families share one device, and a
 * coordinator's phone goes round a room.
 *
 * That is not a theoretical risk on a platform that shows safeguarding status
 * and suspends members. So the rule is absolute and stated as a rule rather
 * than as a list of exceptions: only immutable, public, non-personal build
 * assets are cached, matched by path, and everything else goes to the network
 * every time.
 *
 * It also never caches an API response, never caches anything that is not a GET,
 * and never caches a cross-origin request.
 *
 * NO BACKGROUND SYNC AND NO WRITE QUEUE. Holding a volunteer's hour entry on
 * the device to send later means a person who thinks they logged their hours
 * and a database that never heard of it. Everything that writes needs the
 * network and says so.
 */

/*
 * Bumping this name is how an old cache is dropped: the activate handler
 * deletes every cache that is not this one. Changing it is the whole update
 * mechanism, so it carries a date rather than a number nobody can place.
 */
const CACHE = 'takaful-shell-2026-08-25';

/* Shown when a navigation fails and there is nothing to fall back on. */
const OFFLINE_URL = '/offline.html';

/*
 * Only these prefixes are ever cached.
 *
 * /_next/static is build output with a content hash in the filename — a given
 * URL's bytes never change, so a cache hit cannot be stale. The rest are the
 * association's own fixed assets. Nothing here varies by who is signed in,
 * because nothing here is generated per request.
 */
const CACHEABLE = ['/_next/static/', '/photos/', '/logo-mark.svg', '/logo-full.svg'];

function mayCache(url) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith('/api/')) return false;
  return CACHEABLE.some((prefix) => url.pathname.startsWith(prefix));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([OFFLINE_URL])),
  );
  /*
   * Take over without waiting for every tab to close. The alternative is a
   * fixed worker that does not run until the volunteer closes an app they
   * never close.
   */
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(
        names.filter((name) => name !== CACHE).map((name) => caches.delete(name)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  /*
   * Navigations: always the network, and the offline page if it fails.
   *
   * Deliberately no cached fallback to a previously-visited page. Serving
   * yesterday's dashboard to somebody who is offline shows them figures that
   * may have changed and, on a shared phone, may not be theirs at all. A page
   * that says plainly there is no connection is worth more than a page that
   * looks right and is not.
   */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL)),
    );
    return;
  }

  if (!mayCache(url)) return;

  /*
   * Cache first for the hashed build assets: the URL changes when the bytes
   * change, so there is nothing to revalidate. A miss falls through to the
   * network and is stored — but only if the response is a clean, same-origin
   * 200. An opaque response has a status of 0 and could be an error page from
   * a captive portal, and caching one of those pins a Wi-Fi login screen in
   * place of a stylesheet until the cache name changes.
   */
  event.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((response) => {
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })),
  );
});
