import Link from 'next/link';
import { formatDate } from '@/lib/format';
import { credentialView } from '@/lib/credential-view';
import type { Certificate } from '@/lib/certificates';
import type { Locale } from '@/lib/i18n';
import type { LmsStrings } from '@/lib/dictionaries/lms';
import type { LevelBadgeStanding } from '@/lib/programme/level-badges';

/**
 * One level badge, as a medallion.
 *
 * Server component. Nothing here holds state and nothing here needs to run on
 * the phone — the whole badge wall ships zero JavaScript.
 *
 * STATE IS NEVER CONVEYED BY DIMMING ALONE. The achievements page already
 * makes that mistake: a withdrawn badge there is signalled with `line-through`
 * and nothing else, so a screen reader announces an earned badge. Every
 * medallion below therefore carries its state as real text — visible at `md`,
 * `sr-only` at `sm` where a 56px circle has no room for a sentence. The emoji
 * is decoration and is always `aria-hidden`; it never carries meaning on its
 * own.
 *
 * ON REVOCATION. There are two paths, and neither invents anything.
 *
 * The ordinary one: `programmeStanding` selects certificates with
 * `revoked_at IS NULL` (see both queries in src/lib/programme/standing.ts), so
 * a withdrawn level credential arrives as `certificateCode === null` and the
 * link simply disappears. The badge cannot outlive the credential it claims,
 * because it stops claiming one.
 *
 * The explicit one: a caller that has actually loaded the certificate row —
 * a staff view, or any surface reading `certificatesFor` rather than
 * `programmeStanding` — passes it as `certificate`, and it is routed through
 * `credentialView` like every other credential surface. A revoked one then
 * shows the `certRevoked` pill with its tone, its date and its reason, drops
 * the earned styling, and withholds the public verify link (`shareable`).
 * No certificate is fabricated to force that branch: a `{ revoked_at: null }`
 * stub would always come back valid and would be theatre.
 */

type Size = 'sm' | 'md';

const MEDALLION: Record<Size, string> = {
  sm: 'h-14 w-14 text-2xl',
  md: 'h-20 w-20 text-3xl',
};

/**
 * Fallback only. The page should pass `dict.account.path.viewCertificate`,
 * which is the string every other certificate surface already uses; this pair
 * exists so a badge rendered outside a page that holds the dictionary is still
 * bilingual rather than English-only.
 */
const VIEW_CERTIFICATE: Record<Locale, string> = {
  ar: 'عرض الشهادة',
  en: 'View certificate',
};

export function LevelBadge({
  badge,
  lang,
  t,
  size = 'md',
  viewCertificateLabel,
  certificate,
}: {
  badge: LevelBadgeStanding;
  lang: Locale;
  t: LmsStrings;
  size?: Size;
  /** Pass `dict.account.path.viewCertificate`. */
  viewCertificateLabel?: string;
  /**
   * The credential row, when the caller holds one. Omit on the
   * `programmeStanding` path, which never returns a revoked certificate.
   */
  certificate?: Pick<Certificate, 'revoked_at' | 'revoke_reason'> | null;
}) {
  const title = badge.title[lang];
  const detail = size === 'md';
  const view = certificate ? credentialView(certificate, t, lang) : null;
  const revoked = view?.status === 'revoked';
  // A withdrawn credential takes the medal back with it.
  const showEarned = badge.earned && !revoked;

  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      <span
        className={`grid shrink-0 place-items-center rounded-full ${MEDALLION[size]} ${
          showEarned
            ? 'bg-brand-blue-deep text-white ring-2 ring-brand-orange'
            : 'border border-line bg-surface-2 text-ink-3'
        }`}
      >
        <span aria-hidden="true" className={showEarned ? undefined : 'opacity-60'}>
          {badge.icon}
        </span>
      </span>

      <span className={detail ? 'text-[0.95rem] font-extrabold text-ink' : 'sr-only'}>{title}</span>

      {revoked && view ? (
        <>
          <span
            className={`rounded-full border px-3 py-1 text-[0.8rem] font-extrabold ${view.tone}`}
          >
            {view.statusLabel}
          </span>
          {detail && view.revokedOn && (
            <p className="text-[0.82rem] text-ink-2">{view.revokedOn}</p>
          )}
          {detail && view.reason && <p className="text-[0.82rem] text-ink-2">{view.reason}</p>}
        </>
      ) : (
        <BadgeState badge={badge} lang={lang} t={t} detail={detail} />
      )}

      {detail && (
        <p className="max-w-[26ch] text-[0.85rem] leading-relaxed text-ink-2">
          {badge.description[lang]}
        </p>
      )}

      {badge.certificateCode && view?.shareable !== false && (
        <Link
          href={
            `/${lang}/verify/${badge.certificateCode}` as Parameters<typeof Link>[0]['href']
          }
          // min-h-12 is the touch target: below roughly 44px a thumb misses it.
          className="inline-flex min-h-12 items-center justify-center rounded-full px-4 text-[0.9rem] font-extrabold text-brand-blue underline underline-offset-4 transition-colors hover:bg-surface-2 dark:text-sky-300"
        >
          {viewCertificateLabel ?? VIEW_CERTIFICATE[lang]}
          <span className="sr-only"> — {title}</span>
        </Link>
      )}
    </div>
  );
}

/**
 * The state sentence. Split around the placeholder rather than replaced into
 * it, because the date is Latin-digit and needs `dir="ltr"` of its own inside
 * an Arabic paragraph.
 */
function BadgeState({
  badge,
  lang,
  t,
  detail,
}: {
  badge: LevelBadgeStanding;
  lang: Locale;
  t: LmsStrings;
  detail: boolean;
}) {
  // text-ok-text: --color-ok is a surface colour. As 0.8rem text over its own
  // bg-ok/15 pill it measures 4.33:1 light / 2.97:1 dark, both short of 4.5:1.
  const tone = detail
    ? badge.earned
      ? 'rounded-full bg-ok/15 px-3 py-1 text-[0.8rem] font-extrabold text-ok-text'
      : 'rounded-full bg-surface-2 px-3 py-1 text-[0.8rem] font-extrabold text-ink-3'
    : 'sr-only';

  if (!badge.earned) return <span className={tone}>{t.badgeLocked}</span>;
  if (!badge.earnedAt) return <span className={tone}>{t.badgeEarned}</span>;

  const [before = '', ...rest] = t.badgeEarnedOn.split('{date}');
  return (
    <span className={tone}>
      {before}
      <span dir="ltr" className="tabular">
        {formatDate(badge.earnedAt, lang)}
      </span>
      {rest.join('{date}')}
    </span>
  );
}
