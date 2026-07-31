import type { Metadata } from 'next';
import { locales, type Locale } from './i18n';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takafullb.com';

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
