import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * The launcher icon, for the launchers that cut a shape out of it.
 *
 * A maskable icon is not the logo with a flag on it. Android crops it to
 * whatever shape the launcher uses — circle, squircle, teardrop — and the
 * guaranteed-visible region is a circle of 80% diameter, so up to 20% of every
 * edge can be cut away. A logo declared maskable without padding loses its
 * edges on exactly the devices that crop hardest.
 *
 * So: a full-bleed brand field with the association's own mark inside the safe
 * circle. The mark is NOT square — its viewBox is 575x278, near enough 2:1 —
 * and the first version boxed it at 300x300, which squashed the logo into a
 * shape the association does not use. 360x174 keeps the ratio, and the
 * diagonal of that box is 400px against the 410px safe circle, so the crop
 * cannot reach it whatever shape the launcher cuts.
 *
 * THE .png IN THE ROUTE NAME IS LOAD-BEARING. src/proxy.ts redirects every path
 * without a file extension to a locale, so /icon-maskable answered 307 to
 * /ar/icon-maskable and then 404 — a manifest pointing at a dead URL, which no
 * build step checks and no page ever shows. The extension is what the matcher
 * skips on, exactly as it skips /sw.js and /manifest.webmanifest.
 *
 * IT IS THE REAL LOGO, and that took a second attempt. The first version drew a
 * ring and a dot in the brand colours from memory. It rendered, it looked like
 * a logo, and it was not this association's logo. An icon that is merely
 * plausible is worse than none — it goes on a volunteer's home screen and
 * quietly stands in for the association. The file is read from disk and
 * rasterised, so the icon follows the logo whenever the logo is revised.
 *
 * Generated rather than committed as a PNG because there is no rasteriser among
 * this project's dependencies, and next/og is already part of Next. Note the
 * history that library has here: an og:image route built on it was abandoned
 * because Satori could not parse the site's Arabic typeface. That failure was
 * about TEXT. There is no text on this icon, which is why this works — and why
 * adding any would break it.
 */

export const runtime = 'nodejs';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

/*
 * White, not the brand blue.
 *
 * The blue field was tried and rejected on looking at it: the mark's figure is
 * --color-brand-grey #6b6d6e, which is 1.6:1 against #205b8b, so the logo
 * dissolved into the background and left an orange dot floating on blue. The
 * logo is drawn for a light ground and this is that ground. It also matches
 * the header, which is where everybody has already seen it.
 */
const FIELD = '#ffffff';

export async function GET() {
  const svg = await readFile(path.join(process.cwd(), 'public', 'logo-mark.svg'), 'utf8');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: FIELD,
        }}
      >
        {/*
          * base64 rather than a percent-encoded data URI. The file opens with a
          * quoted XML declaration and is quoted attributes throughout, every
          * one of which would have to survive being placed inside another
          * attribute value. base64 has nothing left to escape.
          */}
        <img
          src={`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`}
          width={360}
          height={174}
          alt=""
        />
      </div>
    ),
    size,
  );
}
