import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import { photoBytes } from '@/lib/stories';

/**
 * Serves a story photograph to the people who manage stories.
 *
 * ANY picture on ANY story, including one marked 'restricted' and one on a
 * story nobody has published — which is precisely the point. A coordinator who
 * has just uploaded a photograph has to be able to look at it, and the one
 * they most need to look at is the one that may not be published. A staff
 * screen that could not show its own withheld pictures would be a screen where
 * the safeguarding answer is chosen blind.
 *
 * Separate from /api/public/story-photo/[photoId] rather than a branch inside
 * it, and the separation is the safety — the same split migration-era
 * /api/photo and /api/public/photo already draw for a profile picture. This
 * route answers a session; that one answers nobody and therefore has to satisfy
 * a different question entirely. Two questions with two answers in one handler
 * is how the wrong one gets asked after a refactor.
 *
 * The capability is the one every action on /staff/stories asserts. A route
 * that disagreed with them would either show a picture to somebody who cannot
 * edit it or hide one from somebody who can.
 */

/** Rejected before the database is touched — see the note below. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ photoId: string }> },
) {
  if (!isDbConfigured()) return new NextResponse(null, { status: 404 });

  const { photoId } = await params;
  const viewer = await currentUser();
  if (!viewer) return new NextResponse(null, { status: 401 });

  // 404 rather than 403: whether a given id names a picture at all is not
  // something a signed-in stranger has any business learning.
  if (!can(viewer, 'challenges.manage')) return new NextResponse(null, { status: 404 });

  /* Postgres raises 22P02 on a malformed uuid, which Next renders as a 500 —
   * a different answer from a 404, and one that fills the error log with every
   * stale link a crawler follows. */
  if (!UUID.test(photoId)) return new NextResponse(null, { status: 404 });

  const photo = await photoBytes(photoId, { publicOnly: false }).catch(() => null);
  if (!photo) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(photo.bytes), {
    headers: {
      'Content-Type': photo.contentType,
      'Content-Length': String(photo.bytes.byteLength),
      'Cache-Control': 'private, max-age=31536000, immutable',
      // Belt and braces: never let a stored file be interpreted as anything
      // other than the image type we recorded.
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}
