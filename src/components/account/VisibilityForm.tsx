'use client';

import { useActionState } from 'react';
import { updateVisibilityAction } from '@/lib/actions/visibility';
import { emptyState } from '@/lib/actions/types';
import type { Dictionary } from '@/lib/dictionaries';
import type { RecognitionStrings } from '@/lib/dictionaries/recognition';
import { VISIBILITY_CHOICES, type VisibilityChoice } from '@/lib/visibility';
import type { Locale } from '@/lib/i18n';

/**
 * The three choices, in the order the module lists them: most private first.
 *
 * Ordering matters more here than on an ordinary form. The first option in a
 * list is the one people take when they are skimming, and on this page that
 * option should be the one that publishes nothing. The order is taken from
 * VISIBILITY_CHOICES rather than written out again, so it cannot drift from
 * the order the rest of the system reasons about.
 */
const LABELS: Record<VisibilityChoice, { label: keyof RecognitionStrings; hint: keyof RecognitionStrings }> = {
  hidden: { label: 'hidden', hint: 'hiddenHint' },
  display_name: { label: 'displayName', hint: 'displayNameHint' },
  name_and_photo: { label: 'nameAndPhoto', hint: 'nameAndPhotoHint' },
};

export function VisibilityForm({
  lang, t, errors, values,
}: {
  lang: Locale;
  t: RecognitionStrings;
  errors: Dictionary['account']['errors'];
  values: {
    choice: VisibilityChoice;
    birthdayGreetings: boolean;
    /** False when nobody has ever answered and the default is standing in. */
    everChosen: boolean;
  };
}) {
  const [state, action, pending] = useActionState(updateVisibilityAction, emptyState);
  const saved = (state.attempt ?? 0) > 0 && !state.error;

  return (
    <form action={action} className="mt-6">
      <input type="hidden" name="lang" value={lang} />

      {!values.everChosen && (
        <p className="mb-5 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.9rem] leading-relaxed text-ink-2">
          {t.neverChosen}
        </p>
      )}

      <fieldset className="mb-6 border-0 p-0">
        <legend className="mb-3 text-[0.92rem] font-bold text-ink">{t.choiceLegend}</legend>

        <div className="grid gap-2.5">
          {VISIBILITY_CHOICES.map((choice) => {
            const keys = LABELS[choice];
            return (
              <label
                key={choice}
                htmlFor={`visibility-${choice}`}
                /* The whole card is the target, and it clears 44px on its own
                   at 320px wide — where the hint wraps to three lines and the
                   radio would otherwise be the only thing worth aiming at. */
                className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3.5 transition-colors hover:border-brand-blue/50 has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5"
              >
                <input
                  id={`visibility-${choice}`}
                  type="radio"
                  name="visibility"
                  value={choice}
                  defaultChecked={values.choice === choice}
                  aria-describedby={`visibility-${choice}-hint`}
                  className="mt-0.5 size-[1.15rem] shrink-0 accent-brand-orange"
                />
                <span className="min-w-0">
                  <span className="block text-[0.95rem] font-bold leading-snug text-ink">
                    {t[keys.label]}
                  </span>
                  <span
                    id={`visibility-${choice}-hint`}
                    className="mt-1 block text-[0.86rem] leading-relaxed text-ink-2"
                  >
                    {t[keys.hint]}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <h3 className="mb-2 text-[0.92rem] font-bold text-ink">{t.birthdayTitle}</h3>
      <label
        htmlFor="birthdayGreetings"
        className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3.5"
      >
        <input
          id="birthdayGreetings"
          name="birthdayGreetings"
          type="checkbox"
          defaultChecked={values.birthdayGreetings}
          aria-describedby="birthdayGreetings-hint"
          className="mt-0.5 size-[1.15rem] shrink-0 accent-brand-orange"
        />
        <span className="min-w-0">
          <span className="block text-[0.95rem] font-bold leading-snug text-ink">{t.birthday}</span>
          <span id="birthdayGreetings-hint" className="mt-1 block text-[0.86rem] leading-relaxed text-ink-2">
            {t.birthdayHint}
          </span>
        </span>
      </label>

      {/* Both notes are shown to every account, in the same words, whatever is
          selected above. The first is the only honest way to say that choosing
          to appear does not guarantee appearing without a page ever telling
          its reader why a particular person does not. */}
      <p className="mt-5 text-[0.86rem] leading-relaxed text-ink-2">{t.safeguardingNote}</p>
      <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-2">{t.ownStandingNote}</p>

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
