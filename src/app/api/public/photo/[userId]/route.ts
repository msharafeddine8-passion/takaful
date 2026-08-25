import { NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import { publicPhoto } from '@/lib/public-photo';

/**
 * A profile photograph on a page anybody can read.
 *
 * Separate from /api/photo/[userId] rather than a branch inside it, and the
 * separation is the safety. That route answers a session: the holder, or staff
 * who manage members. This one answers nobody, and therefore has to satisfy a
 * different question entirely — not "may you see this person" but "did this
 * person agree to be seen". Two questions with two answers in one handler is
 * how the wrong one gets asked after a refactor.
 *
 * Under /api/public/ so that the audience is in the path. A route whose whole
 * property is that it serves strangers should say so where it is filed.
 *
 * EVERY REFUSAL IS THE SAME 404, with no body and no header to tell them
 * apart: opted out, a minor, an age the association does not hold, no
 * photograph, no such account, a malformed id. Any difference between those —
 * a 403 for one, a 401 for another, a slower answer for a third — is a way to
 * ask this endpoint questions about people, and "is this account a child" is
 * one of the questions it would answer.
 */

/*
 * Never cached at the framework level. Consent is read from the database on
 * every request precisely so that withdrawing it takes effect at once; a
 * cached response would keep serving the photograph of somebody who has just
 * asked to stop appearing.
 */
export const dynamic = 'force-dynamic';

/** Rejected before the database is touched — see the note below. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  if (!isDbConfigured()) return refuse();

  const { userId } = await params;
  /*
   * Postgres raises 22P02 on a malformed uuid, which Next renders as a 500.
   * That is a different answer from a 404, so a stranger could tell a
   * well-formed id that matched nobody from a badly-formed one — and, worse,
   * every crawler hitting a stale link would fill the error log. Checked
   * before the query so the shape of the id is never a signal.
   */
  if (!UUID.test(userId)) return refuse();

  const photo = await publicPhoto(userId).catch(() => null);
  if (!photo) return refuse();

  return new NextResponse(new Uint8Array(photo.bytes), {
    headers: {
      'Content-Type': photo.contentType,
      'Content-Length': String(photo.bytes.byteLength),
      /*
       * Public, because the whole point is that shared caches may serve it —
       * but minutes rather than the year the private route uses. The version
       * in the query string changes when the PHOTOGRAPH changes; nothing in
       * the URL changes when the CONSENT changes, so an immutable response
       * would outlive the decision it was based on by up to a year. Five
       * minutes is short enough that withdrawing consent is felt within one
       * cup of coffee and long enough that a page of ten faces is one round
       * trip rather than ten.
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
