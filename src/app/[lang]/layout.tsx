import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import '../globals.css';
import { locales, localeConfig, isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Header } from '@/components/Header';
import { headerStrings } from '@/components/header-strings';
import { Footer } from '@/components/Footer';
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
      </body>
    </html>
  );
}
