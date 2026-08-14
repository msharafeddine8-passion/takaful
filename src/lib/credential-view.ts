import type { Certificate } from '@/lib/certificates';
import type { Locale } from '@/lib/i18n';
import type { LmsStrings } from '@/lib/dictionaries/lms';
import { formatDate } from '@/lib/format';

/**
 * How a credential presents itself — decided once, in one place.
 *
 * Revocation is rendered four different ways today: /verify/[code] shows a red
 * banner and hides the share button but keeps the print button; /verify turns
 * the card amber and adds a date; /account/certificates dims the row and drops
 * the link; the achievements page is the only surface that shows the reason.
 * Four surfaces, four answers to one question.
 *
 * This is also what makes "a revoked credential renders as Revoked" assertable
 * from a probe. scripts/tsconfig.json sets no `jsx` option, so a probe cannot
 * import a .tsx component — but it can import this, and check both locales.
 *
 * Pure: no database, no React, no 'server-only'.
 */

export type CredentialStatus = 'valid' | 'revoked';

export type CredentialView = {
  status: CredentialStatus;
  /** t.certValid | t.certRevoked. Always real text — never colour alone. */
  statusLabel: string;
  /** t.certRevokedOn with {date}, or null when the credential stands. */
  revokedOn: string | null;
  /** t.certRevokedReason with {reason}, or null when valid or none recorded. */
  reason: string | null;
  /**
   * The STATUS PILL only: border, tint and the reading colour of the one or
   * two words inside it. Never put this on a card or a banner — see
   * `surfaceTone`.
   */
  tone: string;
  /**
   * A card, a banner, any container. Border and tint, and deliberately NO text
   * colour: a container that sets one repaints every heading, date and
   * paragraph it holds, which is how `t.revokedBanner`, the holder's name and
   * the certificate code all ended up red at 3.1:1 on /verify and
   * /verify/[code]. Colour the pill, not the prose.
   */
  surfaceTone: string;
  /** False when revoked: one decision for share, print and public linking. */
  shareable: boolean;
};

/*
 * The tokens, not raw red-600 — form errors already diverged from
 * --color-danger and a third red would settle the drift as normal.
 *
 * The text colour is --color-ok-text / --color-danger-text rather than
 * --color-ok / --color-danger. Those two are surface colours: measured as text
 * over their own /10 tint they reach 3.14:1 (red, dark theme), 2.61:1 (red on
 * --surface-2, dark), 4.16:1 (red, light) and 3.12:1 (green, dark) — all under
 * the 4.5:1 that the 0.8rem pill needs. The -text pair is the same hue chosen
 * against the composited tint, and flips with the theme; see globals.css.
 */
const TONE: Record<CredentialStatus, string> = {
  valid: 'border-ok/40 bg-ok/10 text-ok-text',
  revoked: 'border-danger/40 bg-danger/10 text-danger-text',
};

const SURFACE_TONE: Record<CredentialStatus, string> = {
  valid: 'border-ok/40 bg-ok/10',
  revoked: 'border-danger/40 bg-danger/10',
};

export function credentialView(
  cert: Pick<Certificate, 'revoked_at' | 'revoke_reason'>,
  t: LmsStrings,
  lang: Locale,
): CredentialView {
  if (!cert.revoked_at) {
    return {
      status: 'valid',
      statusLabel: t.certValid,
      revokedOn: null,
      reason: null,
      tone: TONE.valid,
      surfaceTone: SURFACE_TONE.valid,
      shareable: true,
    };
  }

  const on = formatDate(cert.revoked_at, lang);

  /*
   * The reason is passed through untranslated, and that is a known rough edge
   * rather than an oversight: recomputeAchievements writes free Arabic text
   * ('المعطيات تغيّرت') straight into revoke_reason, so an English reader can
   * be shown Arabic here. Translating it is not this function's job — the
   * eventual fix is to store a reason *code* and resolve it through the
   * dictionary, at which point only this line changes. Silently dropping the
   * reason meanwhile would be worse: it is the one thing that tells a holder
   * what happened.
   */
  const reason = cert.revoke_reason?.trim() ? cert.revoke_reason.trim() : null;

  return {
    status: 'revoked',
    statusLabel: t.certRevoked,
    revokedOn: on ? t.certRevokedOn.replace('{date}', on) : null,
    reason: reason ? t.certRevokedReason.replace('{reason}', reason) : null,
    tone: TONE.revoked,
    surfaceTone: SURFACE_TONE.revoked,
    shareable: false,
  };
}
