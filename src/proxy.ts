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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, the API surface, and anything with a file extension.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
