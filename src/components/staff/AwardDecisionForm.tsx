'use client';

import { useActionState } from 'react';
import { decideAwardAction, type AwardDecisionState } from '@/lib/actions/awards';
import type { AwardKind } from '@/lib/awards';
import type { AwardStrings } from '@/lib/dictionaries/awards';
import type { Locale } from '@/lib/i18n';

/**
 * The press that turns a name on a shortlist into an award.
 *
 * ONE FORM PER NOMINEE, and no dropdown. A single form with a menu of five
 * names is one mis-click away from announcing the wrong person, and the
 * mistake is not correctable — the volunteer has already been notified and the
 * record is not deletable. Each nominee carries their own form with their own
 * id fixed in a hidden field, so the thing that is submitted is the thing that
 * was read.
 *
 * The form lives inside a closed <details>, so approving is deliberately two
 * actions rather than one: open the panel, write the reason, press. A button
 * sitting open beside every name invites the top row to be pressed.
 *
 * The reason is `required` and the submit is disabled while pending. Both are
 * checked again on the server and again by a CHECK constraint in migration
 * 036 — a rule this consequential should not rest on an attribute the browser
 * is free to ignore.
 */

const empty: AwardDecisionState = {};

export function AwardDecisionForm({
  lang, t, period, award, userId, team, label,
}: {
  lang: Locale;
  t: AwardStrings;
  period: string;
  award: AwardKind;
  /** The person being chosen. Empty for the team award. */
  userId?: string;
  /** The committee being chosen. Empty for the three person awards. */
  team?: string;
  /** What the button says it is choosing, for the accessible name. */
  label: string;
}) {
  const [state, formAction, pending] = useActionState(decideAwardAction, empty);

  const reasonId = `reason-${award}-${userId ?? team}`;

  return (
    <details className="mt-3 rounded-xl border border-line bg-surface-2">
      <summary className="flex min-h-11 cursor-pointer items-center px-4 py-2.5 text-[0.9rem] font-extrabold text-brand-blue dark:text-brand-orange">
        {t.approve}
      </summary>

      <form action={formAction} className="space-y-3 border-t border-line p-4">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="period" value={period} />
        <input type="hidden" name="award" value={award} />
        {userId && <input type="hidden" name="userId" value={userId} />}
        {team && <input type="hidden" name="team" value={team} />}

        {state.error && (
          <p
            role="alert"
            className="rounded-xl border-2 border-danger bg-danger/10 p-3.5 text-[0.92rem] font-bold"
          >
            {t.errors[state.error]}
          </p>
        )}
        {state.ok && (
          <p
            role="status"
            className="rounded-xl border-2 border-ok bg-ok/10 p-3.5 text-[0.92rem] font-bold"
          >
            {t.decided} · {state.ok}
          </p>
        )}

        <label className="block" htmlFor={reasonId}>
          <span className="mb-1 block text-[0.88rem] font-bold">{t.reasonLabel}</span>
          {/* Said on the field, not in a footnote below the button. Somebody
              writing "a stronger month than the others on the list" needs to
              know this is published before they type it. */}
          <span className="mb-1.5 block text-[0.82rem] leading-relaxed text-ink-2">
            {t.reasonPublished}
          </span>
          <textarea
            id={reasonId}
            name="reason"
            required
            minLength={10}
            rows={3}
            className="w-full rounded-xl border border-line bg-ground px-4 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
          />
        </label>

        <p className="text-[0.82rem] leading-relaxed text-ink-3">{t.confirmHint}</p>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-full bg-brand-blue px-6 text-[0.92rem] font-extrabold text-white transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
        >
          {t.approve}
          {/* The name is in the accessible label rather than on the button
              face: five buttons all reading «اعتمد» are indistinguishable to
              a screen reader moving between them. */}
          <span className="sr-only"> — {label}</span>
        </button>
      </form>
    </details>
  );
}
