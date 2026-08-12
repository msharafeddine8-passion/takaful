import { NextResponse, type NextRequest } from 'next/server';
import { locales, defaultLocale, type Locale } from '@/lib/i18n';

/**
 * Locale routing. Renamed from `middleware` to `proxy` in Next.js 16.
 * Runtime is nodejs and cannot be configured.
 */

function pickLocale(request: NextRequest): Locale {
  // An explicit choice always wins over the browser header.
  const saved = request.cookies.get('takaful-locale')?.value;
  if (saved && (locales as readonly string[]).includes(saved)) {
    return saved as Locale;
  }

  const header = request.headers.get('accept-language');
  if (header) {
    // "ar-LB,ar;q=0.9,en;q=0.8" -> ordered base tags
    const ranked = header
      .split(',')
      .map((part) => {
        const [tag, q] = part.trim().split(';q=');
        return { tag: tag.split('-')[0].toLowerCase(), q: q ? Number(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { tag } of ranked) {
      if ((locales as readonly string[]).includes(tag)) return tag as Locale;
    }
  }

  return defaultLocale;
}

/**
 * A Content-Security-Policy that actually restricts scripts.
 *
 * next.config.ts carries `frame-ancestors 'none'` for every response,
 * including the ones this proxy does not see. What it deliberately did not
 * carry was `script-src`, because a static policy cannot express it: Next
 * inlines its own bootstrap script on every page, so the only ways to allow it
 * are `'unsafe-inline'` — which permits every injected script too and is worth
 * nothing — or a fresh nonce per request, which is what this does.
 *
 * `'strict-dynamic'` lets the nonced bootstrap load the chunks it needs
 * without each chunk URL being listed, and makes the host allow-list
 * irrelevant to modern browsers, which is the point: an injected `<script
 * src>` is refused because it has no nonce, not because its host is missing
 * from a list somebody has to maintain.
 *
 * Two deliberate loosenings:
 *
 *   `style-src 'unsafe-inline'`. Next injects inline styles for fonts and
 *   Tailwind's critical CSS. Nonces cannot cover them all, and CSS injection
 *   is a far smaller problem than script injection.
 *
 *   `'unsafe-eval'` in development only. The dev bundler needs it; production
 *   does not, and shipping it would give away most of the benefit.
 */
function contentSecurityPolicy(nonce: string): string {
  const dev = process.env.NODE_ENV !== 'production';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    /*
     * Vercel Analytics and Speed Insights report to the site's own origin.
     *
     * `ws:` in development only. CSP treats a scheme as part of the source,
     * and `'self'` does not cover `ws://` — so without this the hot-reload
     * socket is refused and every save silently stops updating the browser.
     * Production has no such socket.
     */
    `connect-src 'self'${dev ? ' ws: wss:' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    // Nothing here posts anywhere but here. This is what stops an injected
    // form quietly sending a volunteer's details to somebody else.
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (!hasLocale) {
    const locale = pickLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  /*
   * The nonce travels to the renderer on the request, which is how Next finds
   * it and stamps its own script tags with it. It has to be unguessable and
   * new every time: a reused nonce is an allow-list entry an attacker can aim
   * at.
   */
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const policy = contentSecurityPolicy(nonce);

  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', policy);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', policy);
  return response;
}

export const config = {
  // Skip Next internals, the API surface, and anything with a file extension.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
