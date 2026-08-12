'use client';

import { useRef, useState, useTransition } from 'react';
import { uploadPhotoAction } from '@/lib/actions/profile';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';

const MAX_EDGE = 512;
const TARGET_BYTES = 280 * 1024;

/**
 * Picking a profile photo.
 *
 * The image is resized and re-encoded in the browser before it is sent. A
 * phone camera produces four or five megabytes; sending that over a Lebanese
 * mobile connection to store a picture displayed at 128 pixels would be rude,
 * and the server would only have to shrink it anyway.
 *
 * Quality steps down until the result fits, rather than failing and telling
 * someone to go and resize their own photograph.
 */
async function toSquareDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);

  // Centre crop to a square: a card and an avatar are both square, and
  // cropping here means the same picture is never squashed later.
  const edge = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - edge) / 2;
  const sy = (bitmap.height - edge) / 2;
  const size = Math.min(edge, MAX_EDGE);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  ctx.drawImage(bitmap, sx, sy, edge, edge, 0, 0, size, size);
  bitmap.close();

  for (const quality of [0.85, 0.7, 0.55, 0.4]) {
    const url = canvas.toDataURL('image/jpeg', quality);
    // A data URL is base64: four characters per three bytes.
    const bytes = Math.ceil((url.length - url.indexOf(',') - 1) * 0.75);
    if (bytes <= TARGET_BYTES) return url;
  }
  return canvas.toDataURL('image/jpeg', 0.3);
}

export function PhotoUpload({
  lang,
  dict,
  userId,
  hasPhoto,
  version,
}: {
  lang: Locale;
  dict: Dictionary;
  userId: string;
  hasPhoto: boolean;
  version: string | null;
}) {
  const t = dict.account.profile;
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const src = preview ?? (hasPhoto ? `/api/photo/${userId}?v=${version ?? ''}` : null);

  async function choose(file: File) {
    setError(null);
    try {
      const dataUrl = await toSquareDataUrl(file);
      setPreview(dataUrl);
      start(async () => {
        const result = await uploadPhotoAction(dataUrl, lang);
        if (!result.ok) {
          setPreview(null);
          setError(result.reason === 'too_large' ? t.photoTooLarge : t.photoBadType);
        }
      });
    } catch {
      setError(t.photoBadType);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="h-28 w-28 overflow-hidden rounded-full border border-line bg-surface-2">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[2rem] text-ink-3" aria-hidden>
            🙂
          </span>
        )}
      </div>

      <div>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void choose(file);
          }}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => input.current?.click()}
          className="rounded-full border border-line px-5 py-2.5 text-[0.92rem] font-bold transition-colors hover:bg-surface-2 disabled:opacity-60"
        >
          {pending ? t.photoSaving : hasPhoto ? t.photoChange : t.photoAdd}
        </button>
        <p className="mt-2 text-[0.83rem] text-ink-3">{t.photoHint}</p>
        {error && (
          <p role="alert" className="mt-1.5 text-[0.86rem] font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
