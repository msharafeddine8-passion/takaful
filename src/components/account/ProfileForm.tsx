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

      {/*
        * Every optional field now says who reads it and what it is used for.
        *
        * They were five bare labels. A box headed «اهتماماتك» with nothing else
        * beside it is a box nobody fills in — not because people are unwilling
        * but because there is no way to tell whether anyone will ever look, and
        * writing into a void is the least appealing thing a form can ask for.
        * These are the fields the completeness ring counts, so an unexplained
        * one is also a prompt the reader cannot act on.
        */}
      <FieldShell label={t.displayName} htmlFor="displayName" hint={t.displayNameHint}>
        <input
          id="displayName"
          name="displayName"
          defaultValue={values.displayName}
          aria-describedby="displayName-hint"
          className={input}
        />
      </FieldShell>

      <FieldShell label={t.bio} htmlFor="bio" hint={t.bioHint}>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={values.bio}
          aria-describedby="bio-hint"
          className={input}
        />
      </FieldShell>

      <div className="grid gap-x-5 sm:grid-cols-2">
        <FieldShell label={t.interests} htmlFor="interests" hint={t.interestsHint}>
          <input
            id="interests"
            name="interests"
            defaultValue={values.interests}
            aria-describedby="interests-hint"
            className={input}
          />
        </FieldShell>
        <FieldShell label={t.skills} htmlFor="skills" hint={t.skillsHint}>
          <input
            id="skills"
            name="skills"
            defaultValue={values.skills}
            aria-describedby="skills-hint"
            className={input}
          />
        </FieldShell>
      </div>

      <FieldShell label={t.languages} htmlFor="languages" hint={t.languagesHint}>
        <input
          id="languages"
          name="languages"
          defaultValue={values.languages}
          aria-describedby="languages-hint"
          className={input}
        />
      </FieldShell>

      {/* Tokens, not a fourth pair of raw reds and greens. danger-text and
          ok-text are the reading colours measured against their own tint, and
          they flip with the site's theme toggle — a `dark:` variant is a
          prefers-color-scheme query and ignores it. See globals.css. */}
      {state.error && (
        <p role="alert" className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-[0.92rem] font-semibold text-danger-text">
          {errors[state.error]}
        </p>
      )}

      {saved && (
        <p role="status" className="mb-4 text-[0.93rem] font-bold text-ok-text">
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
