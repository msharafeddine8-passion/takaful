import type { NextConfig } from 'next';

/**
 * Deliberately minimal, apart from response headers.
 *
 * Hostinger auto-detects Next.js and runs the framework defaults
 * (`next build` then `next start`). An `output: 'standalone'` build
 * is NOT compatible with that: it emits `.next/standalone/server.js`
 * and requires `.next/static` and `public/` to be copied in manually.
 * Setting it here started the server but left the app unreachable.
 * The site runs on Vercel now, but the note stays: it cost an outage once.
 */
const nextConfig: NextConfig = {
  /*
   * Headers the live responses were missing entirely. Vercel supplies HSTS;
   * everything below had to be asked for, and none of it shows up in local
   * development or in a build log — only in a response from the real site.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // A browser must not guess that an uploaded photo is really a script.
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          /*
           * The site could be framed by any other page. On a site whose
           * authenticated screens suspend members and verify hours, that is a
           * clickjacking route: overlay an invisible frame, and a staff member
           * clicks a button they cannot see. frame-ancestors is the modern
           * rule; X-Frame-Options is kept for browsers that predate it.
           *
           * Still no script-src, and the reason is now known rather than
           * suspected. A per-request nonce was built, verified and shipped on
           * 12 August, and it took the live site down: every script on every
           * page was refused, so the pages rendered and nothing worked.
           *
           * A nonce cannot exist in a page rendered at build time. Next stamps
           * its script tags with the nonce from the request, so a statically
           * generated page — which is most of this site — is served from a
           * prebuilt file carrying no nonce, while the middleware attaches a
           * fresh one to the header. The two can never agree, and
           * 'strict-dynamic' then switches off the host allow-list that would
           * otherwise have caught the fall.
           *
           * It passed local testing because the page I checked was one of the
           * few dynamic ones. The check that would have caught it is a request
           * to a *statically generated* page from a production build.
           *
           * Doing it properly means either accepting dynamic rendering
           * everywhere — losing static generation on exactly the marketing
           * pages that benefit most — or applying the nonce policy only to the
           * dynamic routes that carry forms and user data, with a weaker one
           * elsewhere. That is a change of its own, shipped alone and watched.
           */
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Frame-Options', value: 'DENY' },

          /*
           * Without this, the full URL travels to any external site a visitor
           * clicks through to. /verify?member=1001 would hand a member number
           * to a stranger's analytics, and a certificate link would hand over
           * its code.
           */
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          // Nothing here needs a camera, a microphone or a location.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

/*
 * Not set, deliberately: a full Content-Security-Policy covering script-src.
 * Next.js inlines bootstrap scripts, so a strict policy needs per-request
 * nonces threaded through the middleware, and getting it wrong takes the
 * whole site down rather than degrading. frame-ancestors above is the part
 * that carries real risk today and cannot break rendering. The rest is worth
 * doing carefully, on its own, with the site watched afterwards.
 */

export default nextConfig;
