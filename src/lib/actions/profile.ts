'use server';

import { randomUUID, createHash } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { isDbConfigured, execute, queryOne, transaction } from '@/lib/db';
import {
  audit,
  currentUser,
  hashPassword,
  verifyPassword,
  SESSION_COOKIE,
} from '@/lib/auth';
import { isLocale, type Locale } from '@/lib/i18n';
import type { FormState } from './types';

const MAX_PHOTO_BYTES = 300 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
/** Matches the minimum enforced at registration and at reset. */
const MIN_PASSWORD = 10;

function localeOf(f: FormData): Locale {
  const v = String(f.get('lang') ?? 'ar');
  return isLocale(v) ? v : 'ar';
}
const text = (f: FormData, n: string) => String(f.get(n) ?? '').trim();

/**
 * Changing a password while signed in.
 *
 * There was no way to do this at all. The only route to a new password ran
 * through the forgotten-password email, and email is not configured — so
 * somebody who thought their password had been seen had no action available
 * to them whatsoever.
 *
 * Three things this does that a naive version would not:
 *
 *   It asks for the current password. Otherwise anyone who finds an unlocked
 *   laptop owns the account permanently rather than until it locks.
 *
 *   It ends every other session. A password change is usually a response to
 *   suspicion, and the intruder's session is the one thing a new password
 *   alone would leave working.
 *
 *   It leaves the current session alive, so the person is not thrown out of
 *   the page they are standing on for having done the right thing.
 */
export async function changePasswordAction(
  prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'dbUnavailable' };

  const user = await currentUser();
  if (!user) return { error: 'generic' };

  const current = String(formData.get('currentPassword') ?? '');
  const next = String(formData.get('newPassword') ?? '');
  const confirm = String(formData.get('confirmPassword') ?? '');

  const fields: FormState['fields'] = {};
  if (!current) fields.currentPassword = 'required';
  if (next.length < MIN_PASSWORD) fields.newPassword = 'passwordTooShort';
  else if (next !== confirm) fields.confirmPassword = 'passwordMismatch';
  if (Object.keys(fields).length > 0) return { fields, attempt: (prev.attempt ?? 0) + 1 };

  const row = await queryOne<{ password_hash: string }>(
    'SELECT password_hash FROM users WHERE id = $1',
    [user.id],
  );
  if (!row) return { error: 'generic' };

  if (!(await verifyPassword(row.password_hash, current))) {
    return { fields: { currentPassword: 'invalidCredentials' }, attempt: (prev.attempt ?? 0) + 1 };
  }

  // Refusing a no-op is not pedantry: someone who believes they have changed
  // their password and has not is worse off than someone told to pick another.
  if (await verifyPassword(row.password_hash, next)) {
    return { fields: { newPassword: 'passwordUnchanged' }, attempt: (prev.attempt ?? 0) + 1 };
  }

  const hashed = await hashPassword(next);
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  await transaction(async (client) => {
    await client.query('UPDATE users SET password_hash = $2 WHERE id = $1', [user.id, hashed]);
    if (token) {
      await client.query(
        'DELETE FROM sessions WHERE user_id = $1 AND token_hash <> $2',
        [user.id, createHash('sha256').update(token).digest('hex')],
      );
    } else {
      await client.query('DELETE FROM sessions WHERE user_id = $1', [user.id]);
    }
  });

  await audit({
    actorId: user.id,
    action: 'account.password_changed',
    targetType: 'user',
    targetId: user.id,
  });

  revalidatePath(`/${lang}/account/profile`);
  return { done: true };
}

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
