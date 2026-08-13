'use client';

import { useState } from 'react';

/**
 * Sharing a credential.
 *
 * Every destination here is a plain link that opens the other service's own
 * composer, which means no third-party script runs on this page, nothing is
 * loaded before the volunteer chooses to share, and no share button reports a
 * page view back to a network the reader never visited. On a site whose
 * visitors include minors that is not a small thing.
 *
 * Web Share comes first where the browser has it — on a phone it offers every
 * app the person actually uses, rather than the four somebody guessed.
 */
export function ShareCredential({
  url,
  text,
  labels,
}: {
  url: string;
  text: string;
  labels: { share: string; copy: string; copied: string };
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      // Long enough to read, short enough that the button does not look stuck.
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // A clipboard the browser refuses is not worth an error dialog — the URL
      // is printed on the page directly above this.
    }
  }

  async function nativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: text, text, url });
    } catch {
      // Cancelling a share sheet throws. That is not a failure.
    }
  }

  const encoded = encodeURIComponent(url);
  const message = encodeURIComponent(`${text} — ${url}`);

  const style =
    'inline-flex min-h-11 items-center rounded-full border border-line px-5 text-[0.92rem] font-bold transition-colors hover:bg-surface-2';

  return (
    <div className="flex flex-wrap gap-2.5">
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button type="button" onClick={nativeShare} className={style}>
          {labels.share}
        </button>
      )}

      <button type="button" onClick={copy} className={style} aria-live="polite">
        {copied ? labels.copied : labels.copy}
      </button>

      {/* rel="noopener": these open in a new tab, and without it the opened
          page gets a handle on this one through window.opener. */}
      <a
        href={`https://wa.me/?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className={style}
      >
        WhatsApp
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className={style}
      >
        LinkedIn
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className={style}
      >
        Facebook
      </a>
    </div>
  );
}
