import Link from 'next/link';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import {
  activityState,
  registrationState,
  seatsLeft,
  activityMinutes,
  ACTIVITY_TONE,
  REGISTRATION_TONE,
  type Tone,
} from '@/lib/activity-state';
import { formatDate, formatTimeRange, formatDuration } from '@/lib/when';

/**
 * One activity, told in full.
 *
 * The listing this replaces printed "1 / 20 مقعد" and, underneath it, the word
 * "اكتمل العدد" — which was the label on the button that closes registration,
 * not a status. Anyone reading the card saw a count and a contradiction. So
 * seats, activity state and registration state are now three separate,
 * labelled things, and every action is a button that says what it does.
 */

type T = Dictionary['account']['activities'];

export type ActivityCardRow = {
  id: string;
  title_ar: string;
  title_en: string;
  location: string | null;
  starts_at: Date | string | null;
  ends_at: Date | string | null;
  cancelled_at?: Date | string | null;
  cancel_reason?: string | null;
  registration_closes_at?: Date | string | null;
  capacity: number | null;
  taken: number;
  waiting: number;
  min_stage: number | null;
  is_open?: boolean;
  /** Only known once the day has happened. */
  attended_count?: number | null;
};

const TONE_CLASS: Record<Tone, string> = {
  ok: 'bg-ok/15 text-ok-text',
  warn: 'bg-brand-orange/20 text-brand-orange-text dark:text-brand-orange',
  info: 'bg-brand-blue/10 text-brand-blue dark:text-sky-300',
  muted: 'bg-surface-2 text-ink-2',
  bad: 'bg-danger/15 text-danger-text',
};

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`rounded-full px-3 py-1 text-[0.82rem] font-extrabold ${TONE_CLASS[tone]}`}>
      {children}
    </span>
  );
}

/* Wording lives in lib/when.ts so the card, the detail page and the volunteer's
 * own list all say a date the same way. */

export function ActivityCard({
  row,
  lang,
  t,
  now = Date.now(),
  children,
}: {
  row: ActivityCardRow;
  lang: Locale;
  t: T;
  now?: number;
  /** The action buttons, which differ between staff and volunteer views. */
  children?: React.ReactNode;
}) {
  const state = activityState(row, now);
  const reg = registrationState(row, row.taken, now);
  const left = seatsLeft(row.capacity, row.taken);
  const mins = activityMinutes(row);

  const regLabel = {
    open: t.regState.open,
    'almost-full': t.regState.almostFull,
    full: t.regState.full,
    'deadline-passed': t.regState.deadlinePassed,
    closed: t.regState.closed,
    ended: t.regState.ended,
    cancelled: t.regState.cancelled,
  }[reg];

  return (
    <li className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {/*
          * Draft, said first.
          *
          * The staff listing showed no publish state at all, so a coordinator
          * could not tell a draft from a live activity — and because the
          * public listing was ignoring is_published too, drafts appeared to
          * volunteers anyway and the distinction never surfaced. Now that the
          * public page honours it, activities saved as drafts stop being
          * visible, and the only humane way to do that is to say which ones.
          */}
        {'is_published' in row && row.is_published === false && (
          <Badge tone="warn">
            {t.draftBadge}
          </Badge>
        )}
        <Badge tone={ACTIVITY_TONE[state]}>{t.state[state]}</Badge>
        <Badge tone={REGISTRATION_TONE[reg]}>{regLabel}</Badge>
      </div>

      <h3 className="mt-3 text-[1.15rem] font-extrabold leading-snug">
        {lang === 'ar' ? row.title_ar : row.title_en}
      </h3>

      {/* The facts a supervisor needs, close together rather than strewn across
          the width of a screen. */}
      <dl className="mt-4 grid gap-x-6 gap-y-3 text-[0.92rem] sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="font-bold text-ink-2">{t.location}</dt>
          <dd>{row.location || '—'}</dd>
        </div>
        <div>
          <dt className="font-bold text-ink-2">{t.date}</dt>
          <dd>{formatDate(row.starts_at, lang)}</dd>
        </div>
        <div>
          <dt className="font-bold text-ink-2">{t.time}</dt>
          <dd>{formatTimeRange(row.starts_at, row.ends_at, lang)}</dd>
        </div>
        <div>
          <dt className="font-bold text-ink-2">{t.durationLabel}</dt>
          <dd>{formatDuration(mins, lang)}</dd>
        </div>
        <div>
          <dt className="font-bold text-ink-2">{t.seatsHeading}</dt>
          <dd>
            {row.capacity === null
              ? `${row.taken} · ${t.noCapacity}`
              : t.seatsTaken
                  .replace('{taken}', String(row.taken))
                  .replace('{capacity}', String(row.capacity))}
          </dd>
        </div>
        {row.capacity !== null && (
          <div>
            <dt className="font-bold text-ink-2">{t.seatsLeftHeading}</dt>
            <dd className={left !== null && left <= 3 ? 'font-extrabold text-brand-orange-text dark:text-brand-orange' : ''}>
              {t.seatsLeftLabel.replace('{left}', String(left ?? 0))}
            </dd>
          </div>
        )}
        {row.waiting > 0 && (
          <div>
            <dt className="font-bold text-ink-2">{t.waitlist}</dt>
            <dd>{row.waiting}</dd>
          </div>
        )}
        {/* Only once it has happened is an attendance figure meaningful. */}
        {state === 'ended' && row.attended_count != null && (
          <div>
            <dt className="font-bold text-ink-2">{t.attendedCount}</dt>
            <dd>{row.attended_count}</dd>
          </div>
        )}
        {row.min_stage !== null && (
          <div>
            <dt className="font-bold text-ink-2">{t.requiresStage}</dt>
            <dd>{row.min_stage}</dd>
          </div>
        )}
      </dl>

      {row.cancelled_at && row.cancel_reason && (
        <p className="mt-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-[0.9rem] font-bold">
          {t.cancelReasonLabel}: {row.cancel_reason}
        </p>
      )}

      {children && <div className="mt-5 flex flex-wrap gap-2">{children}</div>}
    </li>
  );
}

export function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href as Parameters<typeof Link>[0]['href']}
      className="min-h-11 rounded-full border border-line px-5 py-2.5 text-[0.9rem] font-bold transition-colors hover:bg-surface-2"
    >
      {children}
    </Link>
  );
}
