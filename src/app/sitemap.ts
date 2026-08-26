import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';
import { SITE_URL } from '@/lib/seo';
import { COURSES } from '@/lib/courses';
import { printableTemplates } from '@/lib/templates/catalogue';
import { isDbConfigured, query } from '@/lib/db';

/**
 * The sitemap listed eight static pages and stopped there, which left out the
 * two kinds of page most worth finding: the five course pages - the richest
 * content on the site - and the opportunities page a volunteer searches for.
 *
 * Everything behind a sign-in stays out. Those pages also carry noindex, but a
 * sitemap is an invitation and there is no reason to issue one.
 */

const STATIC = [
  '', '/about', '/areas', '/academy', '/journey', '/projects', '/gallery', '/contact', '/resources',
  /* The partners page. Listed even while no partner has been published, because
   * with nothing recorded that page IS «كن شريكًا» — an invitation addressed to
   * organisations who do not know the association yet, which is precisely the
   * page worth being findable. It gains a list later without changing address. */
  '/partners',
  /* The honours board. Listed because it is deliberately indexable: somebody
   * who consented to public thanks consented to a public page, and a public
   * page a search engine cannot find is a private page with extra steps. It
   * names only people whose consent still permits it, re-resolved on every
   * render — see src/app/[lang]/honours/page.tsx. If the association ever
   * decides that consent is to its own site rather than to the open web, this
   * entry comes out at the same time as the robots line on that page. */
  '/honours',
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = [
    ...STATIC,
    '/opportunities',
    // Draft courses are not published, so they are not advertised.
    ...COURSES.filter((c) => c.status === 'available').map((c) => `/academy/${c.slug}`),
    /* Only the forms that print. The four held for specialist review have
     * real pages, but the page is an explanation of why there is nothing to
     * download yet, and inviting a search engine to it would put the
     * association's unapproved safeguarding drafts in front of people
     * searching for a safeguarding form. */
    ...printableTemplates().map((t) => `/resources/${t.slug}`),
  ];

  /*
   * A live activity is a real page with a date on it. Failing to reach the
   * database must not take the whole sitemap down with it - a partial sitemap
   * is worth far more than a 500.
   */
  let activityCount = 0;
  if (isDbConfigured()) {
    try {
      const rows = await query<{ n: number }>(
        `SELECT count(*)::INTEGER AS n FROM activities
          WHERE NOT is_archived AND is_open AND (ends_at IS NULL OR ends_at > now())`,
      );
      activityCount = rows[0]?.n ?? 0;
    } catch {
      activityCount = 0;
    }
  }

  const now = new Date();
  return locales.flatMap((lang) =>
    paths.map((path) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified: now,
      // The opportunities page changes whenever an activity opens or closes.
      changeFrequency:
        path === '/opportunities' && activityCount > 0 ? ('daily' as const) : ('monthly' as const),
      priority: path === '' ? 1 : path.startsWith('/academy/') ? 0.9 : 0.8,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`])),
      },
    })),
  );
}
