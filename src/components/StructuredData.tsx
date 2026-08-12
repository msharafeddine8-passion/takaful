import { ORG } from '@/lib/org';
import { SITE_URL } from '@/lib/seo';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/dictionaries';
import type { CourseContent } from '@/lib/course-content/types';

/**
 * JSON-LD, so a search engine is told what this is rather than left to guess.
 *
 * Only facts that are already stated on the page go in here. Structured data
 * that claims more than the page shows is the kind of thing that gets a site
 * penalised, and for an association the credibility cost is worse than the
 * ranking one.
 *
 * Nothing here is user input, so there is no injection surface — but it is
 * still serialised with JSON.stringify and the closing-tag sequence escaped,
 * because that is one line and the alternative is trusting that it stays that
 * way.
 */
function Ld({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

export function OrganizationLd({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'NGO',
        name: dict.meta.siteName,
        url: `${SITE_URL}/${lang}`,
        description: dict.meta.description,
        foundingDate: String(ORG.founded),
        email: ORG.email,
        telephone: ORG.phone,
        address: {
          '@type': 'PostalAddress',
          addressLocality: lang === 'ar' ? 'طرابلس' : 'Tripoli',
          addressRegion: lang === 'ar' ? 'شمال لبنان' : 'North Lebanon',
          addressCountry: 'LB',
        },
        // The Lebanese "علم وخبر" number, which is what identifies the
        // association to anyone checking that it is real.
        identifier: ORG.registrationNumber,
        sameAs: [ORG.instagramHref, ORG.facebookHref],
      }}
    />
  );
}

export function CourseLd({
  lang,
  course,
  slug,
}: {
  lang: Locale;
  course: CourseContent;
  slug: string;
}) {
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title[lang],
        description: course.lede[lang],
        url: `${SITE_URL}/${lang}/academy/${slug}`,
        inLanguage: lang === 'ar' ? 'ar-LB' : 'en',
        provider: { '@type': 'NGO', name: lang === 'ar' ? 'جمعية تكافل' : 'Takaful Association' },
        // Free, and saying so plainly: a volunteer should not have to wonder.
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', category: 'Free' },
        teaches: course.outcomes[lang],
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: `PT${course.minutes}M`,
        },
      }}
    />
  );
}
