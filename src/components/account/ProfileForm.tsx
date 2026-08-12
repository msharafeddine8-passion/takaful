'use client';

import { useActionState } from 'react';
import { updateProfileAction } from '@/lib/actions/profile';
import { emptyState } from '@/lib/actions/types';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { FieldShell } from './fields';

const input =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-[0.98rem] text-ink outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25';

export type ProfileValues = {
  fullName: string;
  displayName: string;
  bio: string;
  interests: string;
  skills: string;
  languages: string;
};

export function ProfileForm({
  lang, dict, values,
}: {
  lang: Locale;
  dict: Dictionary;
  values: ProfileValues;
}) {
  const [state, action, pending] = useActionState(updateProfileAction, emptyState);
  const t = dict.account.profile;
  const errors = dict.account.errors;
  const saved = (state.attempt ?? 0) > 0 && !state.error && !state.fields;

  return (
    <form action={action} className="mt-6">
      <input type="hidden" name="lang" value={lang} />

      <FieldShell
        label={t.fullName}
        htmlFor="fullName"
        error={state.fields?.fullName ? errors[state.fields.fullName] : undefined}
      >
        {/* Defaults, not values: the form stays uncontrolled so typing is
            never interrupted by a round trip. */}
        <input id="fullName" name="fullName" required defaultValue={values.fullName} className={input} />
      </FieldShell>

      <FieldShell label={t.displayName} htmlFor="displayName">
        <input id="displayName" name="displayName" defaultValue={values.displayName} className={input} />
      </FieldShell>

      <FieldShell label={t.bio} htmlFor="bio">
        <textarea id="bio" name="bio" rows={3} defaultValue={values.bio} className={input} />
      </FieldShell>

      <div className="grid gap-x-5 sm:grid-cols-2">
        <FieldShell label={t.interests} htmlFor="interests">
          <input id="interests" name="interests" defaultValue={values.interests} className={input} />
        </FieldShell>
        <FieldShell label={t.skills} htmlFor="skills">
          <input id="skills" name="skills" defaultValue={values.skills} className={input} />
        </FieldShell>
      </div>

      <FieldShell label={t.languages} htmlFor="languages">
        <input id="languages" name="languages" defaultValue={values.languages} className={input} />
      </FieldShell>

      {state.error && (
        <p role="alert" className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[0.92rem] font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {errors[state.error]}
        </p>
      )}

      {saved && (
        <p role="status" className="mb-4 text-[0.93rem] font-bold text-emerald-700 dark:text-emerald-400">
          {t.saved}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
      >
        {t.save}
      </button>
    </form>
  );
}
