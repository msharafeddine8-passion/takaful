import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takafullb.com';

const ROUTES = ['', '/about', '/areas', '/academy', '/journey', '/projects', '/gallery', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((lang) =>
    ROUTES.map((route) => ({
      url: `${BASE}/${lang}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${BASE}/${l}${route}`])),
      },
    })),
  );
}
