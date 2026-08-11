import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured, queryOne } from '@/lib/db';

/**
 * Serves a profile photo.
 *
 * A photo of a volunteer - many of whom are fifteen - is personal data, so it
 * is not public. The holder may see their own; staff who manage members may
 * see one they need to identify someone by. Nobody else, and never by
 * guessing a URL.
 *
 * Cached privately and revalidated by the version in the query string, so
 * replacing a photo takes effect immediately rather than after an hour.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  if (!isDbConfigured()) return new NextResponse(null, { status: 404 });

  const { userId } = await params;
  const viewer = await currentUser();
  if (!viewer) return new NextResponse(null, { status: 401 });

  const isSelf = viewer.id === userId;
  if (!isSelf && !can(viewer, 'members.manage')) {
    // 404 rather than 403: whether a given account has a photo is itself
    // something a stranger has no business learning.
    return new NextResponse(null, { status: 404 });
  }

  const photo = await queryOne<{ content_type: string; bytes: Buffer }>(
    'SELECT content_type, bytes FROM profile_photos WHERE user_id = $1',
    [userId],
  );
  if (!photo) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(photo.bytes), {
    headers: {
      'Content-Type': photo.content_type,
      'Content-Length': String(photo.bytes.byteLength),
      'Cache-Control': 'private, max-age=31536000, immutable',
      // Belt and braces: never let a stored file be interpreted as anything
      // other than the image type we recorded.
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}
