'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker, and unregisters it where it must not run.
 *
 * Renders nothing. It is a client component only because registration is a
 * browser API and there is no server equivalent — the alternative is an inline
 * script tag, which the Content-Security-Policy work in next.config is trying
 * to make possible to forbid.
 *
 * WHY REGISTRATION IS DELAYED UNTIL AFTER LOAD.
 *
 * Installing a worker downloads and parses it, and on the phones this is for
 * that competes with the first paint of the page somebody is actually waiting
 * to read. The benefit of a service worker is entirely on the SECOND visit, so
 * it can wait for the first one to finish. `load` rather than a timer, because
 * a timer guesses and this does not.
 *
 * WHY IT IS SKIPPED IN DEVELOPMENT.
 *
 * A worker caching /_next/static across a dev server that rebuilds those files
 * constantly serves yesterday's chunk into today's page, and the failure looks
 * like a bug in the code rather than a stale cache. It has cost hours on other
 * projects; it costs nothing to leave it out here.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      /*
       * Not merely skipping registration: actively removing one that is
       * already installed. A developer who ran a production build locally has
       * a worker registered against localhost, and it will go on serving
       * cached chunks into every dev session afterwards. Leaving it there is
       * how somebody spends an afternoon debugging a file they already fixed.
       */
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((r) => void r.unregister()))
        .catch(() => {});
      return;
    }

    const register = () => {
      /*
       * Failure is swallowed on purpose. A service worker is an improvement to
       * a site that works without one; a registration that fails — private
       * browsing, an unsupported browser, a policy that blocks it — must be
       * invisible to the volunteer rather than an error in their face about a
       * thing they did not ask for.
       */
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    };

    if (document.readyState === 'complete') register();
    else {
      window.addEventListener('load', register, { once: true });
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
}
