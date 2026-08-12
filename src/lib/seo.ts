import type { Metadata } from 'next';
import { locales, type Locale } from './i18n';

/**
 * The origin the site is actually served from.
 *
 * This said `https://takafullb.com` while Vercel serves `www` and redirects
 * the apex to it — so every page declared a canonical URL that redirected
 * somewhere else, and every hreflang and sitemap entry pointed at the wrong
 * host. Aligned to what is served.
 *
 * If the association would rather use the bare domain, the change is: flip the
 * redirect in Vercel so `www` points at the apex, then change this one line.
 * Both halves have to move together, which is why it is one constant.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.takafullb.com';

/**
 * Build canonical + hreflang for a specific page.
 * hreflang must be absolute and must point at the equivalent page in each
 * language — not at the homepage.
 */
export function alternatesFor(lang: Locale, path = ''): Metadata['alternates'] {
  return {
    canonical: `${SITE_URL}/${lang}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`])),
      'x-default': `${SITE_URL}/ar${path}`,
    },
  };
}
