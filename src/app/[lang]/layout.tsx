import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import '../globals.css';
import { locales, localeConfig, isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Header } from '@/components/Header';
import { headerStrings } from '@/components/header-strings';
import { Footer } from '@/components/Footer';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { OrganizationLd } from '@/components/StructuredData';
import { HERO_PHOTO } from '@/lib/photos';
import { alternatesFor, SITE_URL } from '@/lib/seo';

/**
 * A real Arabic typeface, self-hosted by next/font — no CDN request at runtime.
 * It carries Latin too, so both locales share one family and one vertical rhythm.
 */
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(props: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.meta.siteName, template: `%s · ${dict.meta.siteName}` },
    description: dict.meta.description,
    openGraph: {
      siteName: dict.meta.siteName,
      title: dict.meta.siteName,
      description: dict.meta.description,
      locale: lang === 'ar' ? 'ar_LB' : 'en_US',
      type: 'website',
      /*
       * There was no image at all, so every link shared to WhatsApp or
       * Facebook — the two channels this association actually recruits
       * through — arrived as a bare grey rectangle.
       *
       * A real photograph of the association's volunteers rather than a
       * generated card. A generated one was built first and abandoned:
       * next/og renders through Satori, which could not parse the site's own
       * Arabic face ("lookupType: 5 - substFormat: 3 is not yet supported"),
       * and with a font it could parse, sharp then refused the result
       * ("Input buffer contains unsupported image format"). The route
       * answered 500 every time, and a 500 on a URL that crawlers and social
       * platforms fetch is worse than no image. A static file cannot fail.
       */
      images: [
        {
          url: HERO_PHOTO,
          width: 1200,
          height: 630,
          alt: dict.meta.siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.meta.siteName,
      description: dict.meta.description,
      images: [HERO_PHOTO],
    },
    alternates: alternatesFor(lang),
  };
}

export default async function LangLayout(props: LayoutProps<'/[lang]'>) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const { dir, htmlLang } = localeConfig[lang];

  return (
    <html lang={htmlLang} dir={dir} suppressHydrationWarning>
      <body className={`${plexArabic.variable} font-sans antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-lg focus:bg-brand-orange focus:px-4 focus:py-2 focus:font-bold focus:text-[#241503]"
        >
          {dict.common.skipToContent}
        </a>
        {/* Only the strings it shows cross into the client bundle. Passing the
            whole dictionary here put ~55KB of unrelated text in every page. */}
        <Header lang={lang} strings={headerStrings(dict)} />
        <main id="main">{props.children}</main>
        <Footer lang={lang} dict={dict} />
        <OrganizationLd lang={lang} dict={dict} />
        {/* Nothing was measuring the live site. When it broke in August nobody
            knew until a person opened it. Both of these are first-party, set
            no cookies and carry no identifiers, which matters on a site whose
            visitors include minors. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
