'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute } from '@/lib/db';
import { audit, currentUser } from '@/lib/auth';
import { isLocale, type Locale } from '@/lib/i18n';
import type { FormState } from './types';

const MAX_PHOTO_BYTES = 300 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function localeOf(f: FormData): Locale {
  const v = String(f.get('lang') ?? 'ar');
  return isLocale(v) ? v : 'ar';
}
const text = (f: FormData, n: string) => String(f.get(n) ?? '').trim();

export async function updateProfileAction(prev: FormState, formData: FormData): Promise<FormState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'dbUnavailable' };

  const user = await currentUser();
  if (!user) return { error: 'generic' };

  const fullName = text(formData, 'fullName');
  if (fullName.length < 3) return { fields: { fullName: 'required' } };

  await execute(
    `UPDATE profiles
        SET full_name = $1, display_name = $2, bio = $3,
            interests = $4, skills = $5, languages = $6
      WHERE user_id = $7`,
    [
      fullName,
      text(formData, 'displayName') || null,
      text(formData, 'bio') || null,
      text(formData, 'interests') || null,
      text(formData, 'skills') || null,
      text(formData, 'languages') || null,
      user.id,
    ],
  );

  await audit({ actorId: user.id, action: 'profile.updated', targetType: 'user', targetId: user.id });

  revalidatePath(`/${lang}/account/profile`);
  return { attempt: (prev.attempt ?? 0) + 1 };
}

export type PhotoResult = { ok: true } | { ok: false; reason: 'too_large' | 'bad_type' | 'error' };

/**
 * Stores a profile photo.
 *
 * The browser resizes and re-encodes before sending, so what arrives is
 * already small. This still checks type and size, because the browser is not
 * where the rule lives - anyone can call this action directly.
 */
export async function uploadPhotoAction(dataUrl: string, lang: Locale): Promise<PhotoResult> {
  if (!isDbConfigured()) return { ok: false, reason: 'error' };
  const user = await currentUser();
  if (!user) return { ok: false, reason: 'error' };

  const match = /^data:([a-z/+-]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) return { ok: false, reason: 'bad_type' };

  const [, contentType, base64] = match;
  if (!ALLOWED_TYPES.includes(contentType)) return { ok: false, reason: 'bad_type' };

  const bytes = Buffer.from(base64, 'base64');
  if (bytes.byteLength === 0) return { ok: false, reason: 'error' };
  if (bytes.byteLength > MAX_PHOTO_BYTES) return { ok: false, reason: 'too_large' };

  // A magic-number check, because a caller can claim any content type. This
  // does not make an image safe - nothing here executes it - but it stops the
  // table filling with files that are not pictures.
  const looksLikeImage =
    (bytes[0] === 0xff && bytes[1] === 0xd8) ||                 // JPEG
    (bytes[0] === 0x89 && bytes[1] === 0x50) ||                 // PNG
    bytes.subarray(8, 12).toString('ascii') === 'WEBP';         // WEBP
  if (!looksLikeImage) return { ok: false, reason: 'bad_type' };

  try {
    await execute(
      `INSERT INTO profile_photos (user_id, content_type, bytes, byte_size, version)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         content_type = EXCLUDED.content_type,
         bytes = EXCLUDED.bytes,
         byte_size = EXCLUDED.byte_size,
         version = EXCLUDED.version,
         uploaded_at = now()`,
      [user.id, contentType, bytes, bytes.byteLength, randomUUID()],
    );
  } catch {
    return { ok: false, reason: 'error' };
  }

  await audit({
    actorId: user.id, action: 'profile.photo_updated', targetType: 'user', targetId: user.id,
  });

  revalidatePath(`/${lang}/account/profile`);
  revalidatePath(`/${lang}/account/card`);
  return { ok: true };
}

export async function removePhotoAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return;
  const user = await currentUser();
  if (!user) return;

  await execute('DELETE FROM profile_photos WHERE user_id = $1', [user.id]);
  await audit({
    actorId: user.id, action: 'profile.photo_removed', targetType: 'user', targetId: user.id,
  });

  revalidatePath(`/${lang}/account/profile`);
  revalidatePath(`/${lang}/account/card`);
}
