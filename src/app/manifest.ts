import type { MetadataRoute } from 'next';

/**
 * What the platform is when it is installed on a phone.
 *
 * Most of the people this is for reach it on a mid-range Android over a
 * patchy connection, and several of them open it every week — the card, the
 * next activity, a course they are half way through. Installed, it starts from
 * the home screen without the browser furniture, and the shell is already on
 * the device.
 *
 * ARABIC IS THE INSTALLED IDENTITY. There is one manifest and it cannot be
 * per-locale, so it names the association as its own people name it and starts
 * at /ar. An English reader who installs from /en still lands on the Arabic
 * home page once, and the language switch is in the header; the alternative is
 * that everybody's home screen says "Takaful Association" in Latin script,
 * which is the wrong trade for this association.
 *
 * `id` is fixed and separate from start_url. Without it a browser identifies
 * the app by its start URL, so changing where it opens would install a second
 * copy beside the first rather than updating the one already there.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'جمعية تكافل',
    short_name: 'تكافل',
    description: 'منصّة متطوّعي جمعية تكافل: بطاقتك، أنشطتك، ساعاتك، وأكاديمية التدريب.',
    lang: 'ar',
    dir: 'rtl',
    start_url: '/ar',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',

    /*
     * Both are the light theme's --ground, and they have to agree with the
     * themeColor viewport export in [lang]/layout.tsx — the manifest tints the
     * installed app's title bar and the meta tag tints the browser's, and a
     * platform that sets them to different colours gets a bar that changes
     * colour when somebody installs it.
     *
     * background_color fills the screen before the first paint, so anything
     * other than --ground is a flash of the wrong colour on every cold start.
     * Not the brand blue: a blue bar above a white page reads as a piece of
     * furniture belonging to something else. Not the orange either — it is
     * 1.9:1 against white, and the clock sits on it.
     */
    background_color: '#ffffff',
    theme_color: '#ffffff',

    icons: [
      {
        /*
         * One SVG rather than a ladder of PNGs. It is the association's actual
         * logo file, it scales to whatever a launcher asks for, and there is no
         * rasteriser in this project's dependencies — a hand-cut set of PNGs
         * would drift from the logo the first time it is revised.
         */
        src: '/logo-mark.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        /*
         * Maskable is a different picture, not the same one tagged twice. A
         * launcher crops a maskable icon to its own shape and can cut 20% off
         * every edge, so a logo declared maskable without padding loses its
         * outer ring on exactly the devices that crop hardest. This is the mark
         * inside its own safe area — see the route for the arithmetic.
         */
        src: '/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
