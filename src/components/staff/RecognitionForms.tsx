'use client';

import { useActionState } from 'react';
import {
  recomputeOneAction, recomputeAllAction, previewAllAction,
  grantBadgeAction, withdrawBadgeAction,
  type AdminState, type PreviewState,
} from '@/lib/actions/recognition-admin';
import { MIN_REASON } from '@/lib/recognition-check';
import type { RecognitionAdminStrings } from '@/lib/dictionaries/recognition-admin';
import type { Locale } from '@/lib/i18n';

/**
 * The four controls of the recognition panel.
 *
 * Each is its own form with its own state, deliberately. One shared state would
 * mean a refusal from the grant form appearing above the recompute button, and
 * a staff member reading "that reason is too short" next to a button they did
 * not press.
 *
 * Everything is typed in rather than picked from a list of people. There is no
 * dropdown of volunteers here and there should not be: a select of every member
 * is a list of who exists, sorted, on a page whose whole subject is who
 * deserves what. Typing an email means you already know whose record you are
 * about to change.
 */

const field =
  'w-full rounded-xl border border-line bg-ground px-4 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25';

const empty: AdminState = {};
const noPreview: PreviewState = {};

function Outcome({ state, t }: { state: AdminState; t: RecognitionAdminStrings }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-xl border-2 border-danger bg-danger/10 p-4 text-[0.92rem] font-bold">
        {t.errors[state.error] ?? t.errors.unavailable}
      </p>
    );
  }
  if (state.ok) {
    return (
      /* Polite, not assertive: this follows a button the person just pressed,
         so a screen reader interrupting them mid-sentence to say "done" is
         worse than telling them when they pause. */
      <p role="status" className="rounded-xl border-2 border-ok bg-ok/10 p-4 text-[0.92rem] font-bold">
        {t.done} — <span dir="ltr">{state.ok}</span>
      </p>
    );
  }
  return null;
}

function Submit({ pending, label, t, tone = 'normal' }: {
  pending: boolean;
  label: string;
  t: RecognitionAdminStrings;
  tone?: 'normal' | 'grave';
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        tone === 'grave'
          ? 'min-h-11 rounded-full border-2 border-danger px-6 py-2.5 text-[0.92rem] font-extrabold text-danger-text transition-colors hover:bg-danger/10 disabled:opacity-60'
          : 'min-h-11 rounded-full bg-brand-blue px-6 py-2.5 text-[0.92rem] font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-brand-orange dark:text-ink'
      }
    >
      {pending ? t.working : label}
    </button>
  );
}

export function RecomputeOne({ lang, t }: { lang: Locale; t: RecognitionAdminStrings }) {
  const [state, formAction, pending] = useActionState(recomputeOneAction, empty);
  const keep = state.values ?? {};
  return (
    <form action={formAction} className="mt-5 space-y-4">
      <input type="hidden" name="lang" value={lang} />
      <Outcome state={state} t={t} />
      <label className="block" htmlFor="recompute-email">
        <span className="mb-1.5 block text-[0.88rem] font-bold">{t.emailLabel}</span>
        <input
          id="recompute-email" name="email" type="email" required dir="ltr"
          defaultValue={keep.email ?? ''}
          className={field}
        />
      </label>
      <Submit pending={pending} label={t.recomputeOne} t={t} />
    </form>
  );
}

/**
 * What the recompute would do, before it does it.
 *
 * Sits above the recompute-everybody button on purpose: the association's rule
 * is that nothing is backfilled against real data before somebody has looked at
 * what it would change, and a preview placed after the button it guards is a
 * preview nobody presses first.
 */
export function PreviewAll({ lang, t }: { lang: Locale; t: RecognitionAdminStrings }) {
  const [state, formAction, pending] = useActionState(previewAllAction, noPreview);
  const p = state.preview;
  return (
    <form action={formAction} className="mt-5 space-y-4">
      <input type="hidden" name="lang" value={lang} />
      {state.error && (
        <p role="alert" className="rounded-xl border-2 border-danger bg-danger/10 p-4 text-[0.92rem] font-bold">
          {t.errors[state.error] ?? t.errors.unavailable}
        </p>
      )}
      <Submit pending={pending} label={t.preview} t={t} />
      {p && (
        <div role="status" className="rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-[0.95rem] font-extrabold">
            {t.previewSummary
              .replace('{accounts}', String(p.accounts))
              .replace('{earn}', String(p.earnTotal))
              .replace('{withdraw}', String(p.withdrawTotal))}
          </p>
          {p.earnTotal === 0 && p.withdrawTotal === 0 && (
            <p className="mt-2 text-[0.9rem] text-ink-2">{t.previewNothing}</p>
          )}
          <PreviewList title={t.previewEarn} rows={p.wouldEarn} total={p.earnTotal} t={t} />
          <PreviewList
            title={t.previewWithdraw} rows={p.wouldWithdraw} total={p.withdrawTotal} t={t}
          />
        </div>
      )}
    </form>
  );
}

function PreviewList({ title, rows, total, t }: {
  title: string;
  rows: Array<{ name: string; code: string }>;
  total: number;
  t: RecognitionAdminStrings;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="text-[0.8rem] font-extrabold tracking-[0.1em] text-ink-3">{title}</p>
      <ul className="mt-2 space-y-1 text-[0.88rem]">
        {rows.map((r) => (
          <li key={`${r.name}:${r.code}`}>
            {r.name} <span className="text-ink-3" dir="ltr">· {r.code}</span>
          </li>
        ))}
      </ul>
      {/* Said out loud rather than left to a list that simply stops. */}
      {total > rows.length && (
        <p className="mt-2 text-[0.82rem] text-ink-3">
          {t.previewMore.replace('{n}', String(total - rows.length))}
        </p>
      )}
    </div>
  );
}

export function RecomputeAll({ lang, t }: { lang: Locale; t: RecognitionAdminStrings }) {
  const [state, formAction, pending] = useActionState(recomputeAllAction, empty);
  return (
    <form action={formAction} className="mt-5 space-y-3">
      <input type="hidden" name="lang" value={lang} />
      <Outcome state={state} t={t} />
      <Submit pending={pending} label={t.recomputeAll} t={t} />
      <p className="text-[0.82rem] text-ink-3">{t.recomputeAllHint}</p>
    </form>
  );
}

/**
 * Grant and withdraw share every field, so they share a body.
 *
 * The reason box carries `minLength` as well as the server check. The server
 * check is the one that counts — a form attribute is a courtesy to the person
 * typing, not a control — but being told before you press is the difference
 * between a hint and a rebuke.
 */
function BadgeForm({
  lang, t, action, label, tone,
}: {
  lang: Locale;
  t: RecognitionAdminStrings;
  action: (prev: AdminState, formData: FormData) => Promise<AdminState>;
  label: string;
  tone: 'normal' | 'grave';
}) {
  const [state, formAction, pending] = useActionState(action, empty);
  const keep = state.values ?? {};
  const id = tone === 'grave' ? 'withdraw' : 'grant';
  return (
    <form action={formAction} className="mt-5 space-y-4">
      <input type="hidden" name="lang" value={lang} />
      <Outcome state={state} t={t} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block" htmlFor={`${id}-email`}>
          <span className="mb-1.5 block text-[0.88rem] font-bold">{t.emailLabel}</span>
          <input
            id={`${id}-email`} name="email" type="email" required dir="ltr"
            defaultValue={keep.email ?? ''} className={field}
          />
        </label>
        <label className="block" htmlFor={`${id}-code`}>
          <span className="mb-1.5 block text-[0.88rem] font-bold">{t.codeLabel}</span>
          <input
            id={`${id}-code`} name="code" required dir="ltr"
            defaultValue={keep.code ?? ''} className={field}
          />
        </label>
      </div>
      <label className="block" htmlFor={`${id}-reason`}>
        <span className="mb-1.5 block text-[0.88rem] font-bold">{t.reasonLabel}</span>
        <textarea
          id={`${id}-reason`} name="reason" required minLength={MIN_REASON} rows={2}
          defaultValue={keep.reason ?? ''} className={field}
        />
      </label>
      <Submit pending={pending} label={label} t={t} tone={tone} />
    </form>
  );
}

export function GrantBadge({ lang, t }: { lang: Locale; t: RecognitionAdminStrings }) {
  return <BadgeForm lang={lang} t={t} action={grantBadgeAction} label={t.grant} tone="normal" />;
}

export function WithdrawBadge({ lang, t }: { lang: Locale; t: RecognitionAdminStrings }) {
  return <BadgeForm lang={lang} t={t} action={withdrawBadgeAction} label={t.withdraw} tone="grave" />;
}
