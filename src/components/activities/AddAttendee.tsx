'use client';

import { useActionState } from 'react';
import { addAttendeeAction, type AddAttendeeState } from '@/lib/actions/attendance';
import type { AddAttendeeStrings } from '@/lib/dictionaries/add-attendee';
import type { AddableVolunteer } from '@/lib/activities';
import type { Locale } from '@/lib/i18n';

/**
 * Putting somebody on the register who never signed up for the activity.
 *
 * People came to the Mawlid, took part, and were never marked present — nobody
 * had registered them, so the sheet had no line for them at all and their
 * hours were simply lost. This is the line.
 *
 * ── THE SEARCH IS A PLAIN GET, AND NOTHING IS SHOWN UNASKED ───────────────
 *
 * The box is a `method="get"` form that reloads the page with `?attendee=`,
 * and the server decides what comes back — the same shape the role search on
 * /staff/members uses, and for the same reason. There is no fetch here, no
 * typeahead, no list held in the browser. The consequence that matters is that
 * an empty term returns nothing at all: `searchAddableVolunteers` refuses it,
 * so this control cannot become a way to page through four hundred and thirty
 * nine real people's names and membership numbers from a screen whose job is
 * to tick a register. `prompt` says so on the screen rather than leaving the
 * emptiness looking like a failure.
 *
 * ── ONE FORM, AND THE BUTTON CARRIES THE PERSON ───────────────────────────
 *
 * Every result is a submit button named `userId` inside ONE action form, not a
 * form each. A form per row would mean a state per row, and a screen that can
 * report "added" beside one name while another row still shows a stale result
 * from a minute ago. One state, one message, and it names who it is about.
 *
 * ── AND THE MESSAGE NEVER OVERSTATES ──────────────────────────────────────
 *
 * Three different outcomes, three different sentences: added, corrected
 * because they were already on the register, or nothing at all because the
 * record already said exactly this. The action distinguishes them — see
 * addAttendeeAction — and this screen must not flatten them into "done", which
 * is how somebody presses twice and believes they credited two people.
 */

const empty: AddAttendeeState = {};

export function AddAttendee({
  lang,
  activityId,
  term,
  results,
  limit,
  t,
}: {
  lang: Locale;
  activityId: string;
  /** Whatever is in the URL. Empty means nothing has been searched for yet. */
  term: string;
  results: AddableVolunteer[];
  limit: number;
  t: AddAttendeeStrings;
}) {
  const [state, formAction, pending] = useActionState(addAttendeeAction, empty);
  const searched = term.trim() !== '';

  return (
    <section className="mt-10 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-[1.05rem] font-extrabold">{t.sectionTitle}</h2>
      <p className="mt-2 max-w-[68ch] text-[0.92rem] leading-relaxed text-ink-2">{t.lede}</p>

      {/* The search. A separate GET form, and deliberately not nested inside
          the action form below — one form may not contain another. */}
      <form method="get" className="mt-5 flex flex-wrap items-end gap-3">
        <label className="block w-full sm:w-auto">
          <span className="mb-1.5 block text-[0.85rem] font-bold">{t.searchLabel}</span>
          <input
            type="search"
            name="attendee"
            defaultValue={term}
            placeholder={t.searchPlaceholder}
            className="min-h-11 w-full rounded-xl border border-line bg-ground px-4 text-[0.95rem] sm:w-72"
          />
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-full border border-line px-5 text-[0.92rem] font-bold hover:bg-surface-2"
        >
          {t.searchGo}
        </button>
      </form>

      {!searched && (
        <p className="mt-4 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.9rem] leading-relaxed text-ink-2">
          {t.prompt}
        </p>
      )}

      {searched && results.length === 0 && (
        <p className="mt-4 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.9rem] text-ink-2">
          {t.none.replace('{q}', term)}
        </p>
      )}

      {searched && results.length > 0 && (
        <form action={formAction} className="mt-4">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="activityId" value={activityId} />

          <ul className="divide-y divide-line rounded-xl border border-line">
            {results.map((r) => {
              /* Already recorded: the sheet above owns them, and the button is
                 not offered. The row is still shown — somebody already on the
                 register is exactly who a confused coordinator searches for,
                 and "they are already there" is a better answer than silence. */
              const alreadyOnRegister = r.on_register;
              return (
                <li key={r.user_id} className="px-4 py-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-bold">{r.full_name}</span>
                    <span className="font-mono text-[0.84rem] text-ink-3" dir="ltr">
                      {r.member_number !== null
                        ? `T${String(r.member_number).padStart(3, '0')}`
                        : r.email}
                    </span>
                    {r.registered && (
                      <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[0.76rem] font-bold text-ink-2">
                        {t.registered}
                      </span>
                    )}
                    {alreadyOnRegister && (
                      <span className="rounded-full bg-ok/15 px-2.5 py-0.5 text-[0.76rem] font-bold text-ok-text">
                        {t.onRegister}
                      </span>
                    )}
                  </div>

                  {alreadyOnRegister ? (
                    <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-3">
                      {t.onRegisterNote}
                    </p>
                  ) : (
                    <button
                      type="submit"
                      name="userId"
                      value={r.user_id}
                      disabled={pending}
                      className="mt-3 min-h-11 rounded-full bg-brand-orange px-5 text-[0.9rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
                    >
                      {t.addButton}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="mt-2.5 text-[0.82rem] leading-relaxed text-ink-3">
            {t.limitNote.replace('{n}', String(limit))}
          </p>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-[0.85rem] font-bold text-ink-2">{t.noteField}</span>
            <input
              name="note"
              className="min-h-11 w-full rounded-xl border border-line bg-ground px-4 text-[0.92rem]"
            />
          </label>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-3">{t.durationNote}</p>

          {/* One message, naming the person, and saying which of the three
              things actually happened. */}
          {state.added && !state.error && (
            <p
              role="status"
              className="mt-4 rounded-xl border-2 border-ok bg-ok/10 p-4 text-[0.93rem] font-bold"
            >
              {(state.amended ? t.amended : t.added).replace('{name}', state.added)}
            </p>
          )}
          {state.error === 'unchanged' && (
            <p
              role="status"
              className="mt-4 rounded-xl border border-line bg-surface-2 p-4 text-[0.93rem] font-bold text-ink-2"
            >
              {t.unchanged.replace('{name}', state.added ?? '')}
            </p>
          )}
          {state.error && state.error !== 'unchanged' && (
            <p
              role="alert"
              className="mt-4 rounded-xl border-2 border-danger bg-danger/10 p-4 text-[0.93rem] font-bold"
            >
              {t.errors[state.error] ?? t.errors.unavailable}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
