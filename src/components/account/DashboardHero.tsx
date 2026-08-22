import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/dictionaries';
import { formatMemberNumber } from '@/lib/roster';
import type { CardStatus } from '@/lib/card-view';

/**
 * Who this person is inside the association, in one band.
 *
 * The dashboard used to open with a large greeting and then eight boxes of
 * identical weight — same border, same radius, same padding, stacked. Nothing
 * was more important than anything else, so the eye had nowhere to land and
 * the page read as a list of containers rather than as somebody's standing.
 *
 * This answers three of the five questions before any scrolling: who am I,
 * what am I here, and where have I got to. It is the only dark surface on the
 * page, which is what makes everything below it read as detail rather than as
 * more of the same.
 */

export function DashboardHero({
  lang, dict, fullName, memberNumber, photoVersion, userId,
  statusLabel, cardStatus, stageNumber, stageTitle, stageTotal,
}: {
  lang: Locale;
  dict: Dictionary;
  fullName: string;
  memberNumber: number | null;
  photoVersion: string | null;
  userId: string;
  statusLabel: string;
  cardStatus: CardStatus;
  stageNumber: number | null;
  stageTitle: string | null;
  stageTotal: number;
}) {
  const n = dict.account.nav;
  // The first name is what somebody is greeted by. A four-part Arabic name in
  // a greeting reads like a summons.
  const firstName = fullName.trim().split(/\s+/)[0];

  return (
    <div className="overflow-hidden rounded-3xl bg-brand-blue-deep text-white">
      {/* Tighter on a phone. The point of this band is to answer three
          questions and get out of the way — at 375px tall it was taking half
          the screen and pushing the next-step card below the fold, which is
          the one thing it must never do. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-5 sm:gap-x-5 sm:gap-y-4 sm:p-7">
        <Avatar userId={userId} photoVersion={photoVersion} fullName={fullName} />

        <div className="min-w-0 flex-1">
          <p className="text-[0.8rem] font-bold tracking-[0.12em] text-[#9dbbd2]">
            {dict.account.dashboard.kicker}
          </p>
          {/* Sized to sit under the page heading, not to replace it. The old
              greeting took a third of the screen on a phone. */}
          <h1 className="mt-1 truncate text-[clamp(1.3rem,1.1rem+1vw,1.75rem)] font-black tracking-tight">
            {dict.account.portal.greeting} {firstName}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {memberNumber !== null && (
              <span
                className="rounded-full bg-white/15 px-3 py-1 font-mono text-[0.82rem] font-extrabold tracking-wider"
                dir="ltr"
              >
                {formatMemberNumber(memberNumber)}
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-[0.82rem] font-extrabold ${
                cardStatus === 'active' ? 'bg-ok text-[#04240f]' : 'bg-white/20 text-white'
              }`}
            >
              {/* A dot as well as the colour, so the state survives being read
                  without colour vision or in a photograph. */}
              <span aria-hidden className="me-1">{cardStatus === 'active' ? '●' : '○'}</span>
              {statusLabel}
            </span>
            {stageNumber !== null && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-[0.82rem] font-bold">
                {dict.account.portal.stage} {stageNumber}/{stageTotal}
                {/* The stage's name only where there is room for it. StageRail
                    sits directly below and names it in full, so on a phone
                    this chip repeating it just pushed the card that matters
                    off the first screen. */}
                {stageTitle && <span className="hidden sm:inline"> — {stageTitle}</span>}
              </span>
            )}
          </div>
        </div>

        {memberNumber !== null && (
          <Link
            href={`/${lang}/account/card` as Parameters<typeof Link>[0]['href']}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-white px-5 py-2.5 text-[0.9rem] font-extrabold text-brand-blue-deep transition-opacity hover:opacity-90"
          >
            {n.card}
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * The photograph, or the initial.
 *
 * An initial rather than the smiling-face emoji the rest of the account uses:
 * at this size the emoji reads as a placeholder for a broken image, where a
 * letter reads as a deliberate stand-in for a photograph nobody has uploaded.
 */
function Avatar({
  userId, photoVersion, fullName,
}: { userId: string; photoVersion: string | null; fullName: string }) {
  const initial = fullName.trim().charAt(0) || '؟';
  return (
    <div className="size-14 shrink-0 overflow-hidden rounded-2xl border-2 border-white/25 bg-white/10 sm:size-20">
      {photoVersion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/photo/${userId}?v=${photoVersion}`}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex h-full w-full items-center justify-center text-[1.6rem] font-black text-white/80"
        >
          {initial}
        </span>
      )}
    </div>
  );
}

/**
 * The six stages as six segments, not a percentage.
 *
 * A bar at 40% tells a volunteer nothing they can act on. Six marks, with the
 * one they are standing on named, tells them where they are on a path that has
 * an end — which is the thing the association's whole progression is for.
 *
 * Stages already completed are filled, the current one is outlined and
 * labelled, and the rest are quiet. Under RTL the row mirrors on its own
 * because it is a plain flex row of equal children.
 */
export function StageRail({
  current, total, percent, isConfigured, label, dict,
}: {
  current: number | null;
  total: number;
  percent: number;
  isConfigured: boolean;
  label: string | null;
  dict: Dictionary;
}) {
  if (current === null) return null;
  const p = dict.account.portal;

  return (
    <section aria-label={p.stage} className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-[0.95rem] font-extrabold">
          {p.stage} {current} — {label}
        </p>
        {/* Only when somebody has actually said what the stage takes. A stage
            with no requirements computes as 100%, and announcing that to a
            volunteer who has done nothing is worse than saying nothing. */}
        {isConfigured && (
          <p className="text-[0.86rem] font-bold text-ink-2" dir="ltr">{percent}%</p>
        )}
      </div>

      <ol className="mt-3 flex gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const done = n < current;
          const here = n === current;
          return (
            <li
              key={n}
              className={`h-2 flex-1 overflow-hidden rounded-full ${
                done ? 'bg-brand-orange' : here ? 'bg-brand-orange/25' : 'bg-surface-2'
              }`}
            >
              {/* The current stage fills in proportion to its own progress, so
                  the rail shows movement inside a stage as well as between
                  them. */}
              {here && isConfigured && (
                <span
                  className="block h-full rounded-full bg-brand-orange"
                  style={{ width: `${percent}%` }}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* The same information the rail carries, for a screen reader, which
          cannot see six coloured bars. */}
      <p className="sr-only" role="status">
        {p.stage} {current} / {total}
        {isConfigured ? ` — ${percent}%` : ''}
      </p>
    </section>
  );
}
