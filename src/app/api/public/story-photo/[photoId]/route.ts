import { NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import { photoBytes } from '@/lib/stories';

/**
 * A story photograph on a page anybody can read.
 *
 * Under /api/public/ so that the audience is in the path, exactly as
 * /api/public/photo/[userId] is: a route whose whole property is that it serves
 * strangers should say so where it is filed.
 *
 * THE DECISION IS NOT MADE HERE, AND IT IS NOT MADE BY THE PAGE EITHER.
 * `photoBytes(id, { publicOnly: true })` in lib/stories.ts binds
 * PUBLISHABLE_FACES and adds the story's own state, which is the same rule
 * publishedStories() binds for the cards. So the gallery decides whether to
 * render an <img> and this decides whether to answer it, and because both go
 * through one exported constant they cannot disagree about a picture. A URL is
 * a request and not a permission: anybody may type this address, and only
 * `faces` answers it.
 *
 * Three things have to hold before any bytes leave: the picture is 'none' or
 * 'adults' — never 'restricted', which is where an identifiable child or
 * anybody nobody asked is recorded — and the story it belongs to is published
 * and not archived. The third matters on its own: a draft's photographs are not
 * public merely because somebody guessed the id.
 *
 * EVERY REFUSAL IS THE SAME 404, with no body and no header to tell them apart:
 * restricted, unpublished, archived, deleted, no such picture, a malformed id.
 * Any difference between those is a way to ask this endpoint questions about
 * photographs it has decided not to show.
 */

/*
 * Never cached at the framework level. The answer is read from the database on
 * every request precisely so that removing a photograph, or moving it to
 * 'restricted', takes effect at once; a cached response would keep serving the
 * picture of somebody who has just asked for it to come down.
 */
export const dynamic = 'force-dynamic';

/** Rejected before the database is touched — see the note below. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ photoId: string }> },
) {
  if (!isDbConfigured()) return refuse();

  const { photoId } = await params;
  /*
   * Postgres raises 22P02 on a malformed uuid, which Next renders as a 500.
   * That is a different answer from a 404, so a stranger could tell a
   * well-formed id that matched nothing from a badly-formed one — and every
   * crawler following a stale link would fill the error log.
   */
  if (!UUID.test(photoId)) return refuse();

  const photo = await photoBytes(photoId, { publicOnly: true }).catch(() => null);
  if (!photo) return refuse();

  return new NextResponse(new Uint8Array(photo.bytes), {
    headers: {
      'Content-Type': photo.contentType,
      'Content-Length': String(photo.bytes.byteLength),
      /*
       * Public, because the whole point is that shared caches may serve it —
       * but minutes rather than the year the staff route uses, and for the
       * reason /api/public/photo gives. The version in the query string changes
       * when the PICTURE changes; nothing in the URL changes when the story is
       * withdrawn, so an immutable response would outlive the decision it was
       * based on by up to a year. Five minutes is short enough that a removal
       * is felt within one cup of coffee and long enough that a gallery of
       * twelve cards is one round trip rather than twelve.
       */
      'Cache-Control': 'public, max-age=300, must-revalidate',
      // Belt and braces: never let a stored file be interpreted as anything
      // other than the image type we recorded.
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}

/** One refusal, reused, so no two of them can drift apart. */
function refuse(): NextResponse {
  return new NextResponse(null, { status: 404 });
}
