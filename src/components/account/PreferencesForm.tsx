'use client';

import { useActionState } from 'react';
import { updatePreferencesAction } from '@/lib/actions/preferences';
import { emptyState } from '@/lib/actions/types';
import type { Dictionary } from '@/lib/dictionaries';
import type { MilestoneStrings } from '@/lib/dictionaries/milestones';
import { NOTIFICATION_TOPICS, type NotificationTopic } from '@/lib/preferences';
import type { Locale } from '@/lib/i18n';

/**
 * The four things a volunteer may switch off.
 *
 * Written as "tell me about this", ticked, rather than "do not tell me about
 * this", unticked. Both are the same setting and only one of them can be read
 * at a glance: a page of unticked negatives makes somebody work out that
 * unticking «لا تخبرني» means they will be told, and people get that wrong on
 * a form about their own privacy. The action stores the inverse — see the note
 * at the head of lib/actions/preferences.ts for why the column holds what is
 * off while the form sends what is on.
 *
 * The order comes from NOTIFICATION_TOPICS rather than being written again, so
 * a subject added there cannot be silently missing from the only page that
 * sets it.
 *
 * Matches the visibility section immediately above it deliberately: same card,
 * same 44px rows, same accent, same save button. The two answer different
 * questions and a volunteer should not have to learn two layouts to answer
 * them.
 */
export function PreferencesForm({
  lang, t, errors, muted,
}: {
  lang: Locale;
  t: MilestoneStrings['preferences'];
  errors: Dictionary['account']['errors'];
  /** The subjects currently switched off. Everything else is on. */
  muted: NotificationTopic[];
}) {
  const [state, action, pending] = useActionState(updatePreferencesAction, emptyState);
  const saved = (state.attempt ?? 0) > 0 && !state.error;

  return (
    <form action={action} className="mt-6">
      <input type="hidden" name="lang" value={lang} />

      <fieldset className="border-0 p-0">
        <legend className="mb-3 text-[0.92rem] font-bold text-ink">{t.legend}</legend>

        <div className="grid gap-2.5">
          {NOTIFICATION_TOPICS.map((topic) => (
            <label
              key={topic}
              htmlFor={`topic-${topic}`}
              /* The whole card is the target and clears 44px on its own at
                 320px, where the hint wraps to three lines and the checkbox
                 would otherwise be the only thing worth aiming at. */
              className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3.5 transition-colors hover:border-brand-blue/50 has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5"
            >
              <input
                id={`topic-${topic}`}
                type="checkbox"
                name="topic"
                value={topic}
                defaultChecked={!muted.includes(topic)}
                aria-describedby={`topic-${topic}-hint`}
                className="mt-0.5 size-[1.15rem] shrink-0 accent-brand-orange"
              />
              <span className="min-w-0">
                <span className="block text-[0.95rem] font-bold leading-snug text-ink">
                  {t.topics[topic].label}
                </span>
                <span
                  id={`topic-${topic}-hint`}
                  className="mt-1 block text-[0.86rem] leading-relaxed text-ink-2"
                >
                  {t.topics[topic].hint}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Always shown, whatever is ticked. Somebody switching everything off
          should be able to see, without asking, that the messages about their
          own application and hours are not among the things they just lost. */}
      <p className="mt-5 text-[0.86rem] leading-relaxed text-ink-2">{t.alwaysNote}</p>

      {state.error && (
        <p role="alert" className="mt-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[0.92rem] font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {errors[state.error]}
        </p>
      )}

      {saved && (
        <p role="status" className="mt-5 text-[0.93rem] font-bold text-emerald-700 dark:text-emerald-400">
          {t.saved}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 min-h-[44px] rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
      >
        {t.save}
      </button>
    </form>
  );
}
