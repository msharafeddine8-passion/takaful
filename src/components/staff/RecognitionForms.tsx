'use client';

import { useActionState, useState } from 'react';
import {
  recomputeOneAction, recomputeAllAction, previewAllAction,
  grantBadgesAction, withdrawBadgesAction, retireBadgeAction, liftRetirementAction,
  findPeopleAction, previewPointsAction, applyPointsAction,
  type AdminState, type PreviewState, type SearchState, type Found, type PointsState,
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
 * People are found by searching, not chosen from a list. A select of all four
 * hundred volunteers would be a roster of who exists, sorted, on a page whose
 * subject is who deserves what — and it invites picking a name because it sits
 * near the top. Searching means you already know who you are looking for.
 *
 * This is the second arrangement. The first asked for an email typed from
 * memory and a badge code typed from memory, and told you nothing until after
 * you pressed. That was not caution about the roster; it was a form for
 * somebody who already had the database open in another window.
 */

const field =
  'w-full rounded-xl border border-line bg-ground px-4 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25';

const empty: AdminState = {};
const noPreview: PreviewState = {};
const noSearch: SearchState = {};
const noPoints: PointsState = {};

/**
 * One badge as the picker needs it.
 *
 * Built on the server and passed down, because the catalogue lives in
 * achievements.ts, which is `server-only` — importing it here would drag the
 * database into the browser bundle. Only the four fields a checkbox needs cross
 * the boundary.
 */
export type BadgeChoice = {
  code: string;
  title: string;
  icon: string;
  retired: boolean;
};

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

/**
 * The points ledger, previewed and then written.
 *
 * Two separate forms with two separate states rather than one with a mode.
 * Pressing "show me" and pressing "do it" are different acts, and a single
 * control that changes meaning after the first press is how somebody applies
 * something they meant to look at.
 */
export function RecomputePoints({ lang, t }: { lang: Locale; t: RecognitionAdminStrings }) {
  const [preview, previewForm, previewing] = useActionState(previewPointsAction, noPoints);
  const [applied, applyForm, applying] = useActionState(applyPointsAction, noPoints);
  const plan = preview.plan;
  const shown = applied.error || applied.ok ? applied : preview;

  return (
    <div className="mt-5 space-y-4">
      {shown.error && (
        <p role="alert" className="rounded-xl border-2 border-danger bg-danger/10 p-4 text-[0.92rem] font-bold">
          {t.errors[shown.error] ?? t.errors.unavailable}
        </p>
      )}
      {applied.ok && (
        <p role="status" className="rounded-xl border-2 border-ok bg-ok/10 p-4 text-[0.92rem] font-bold">
          {t.done} — <span dir="ltr">{applied.ok}</span>
        </p>
      )}

      <form action={previewForm}>
        <input type="hidden" name="lang" value={lang} />
        <Submit pending={previewing} label={t.pointsPreview} t={t} />
      </form>

      {plan && (
        <div role="status" className="rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-[0.95rem] font-extrabold">
            {t.pointsSummary
              .replace('{people}', String(plan.people))
              .replace('{rows}', String(plan.rows))
              .replace('{points}', String(plan.points))}
          </p>
          {plan.rows === 0 ? (
            <p className="mt-2 text-[0.9rem] text-ink-2">{t.pointsNothing}</p>
          ) : (
            <>
              <ul className="mt-3 space-y-1 text-[0.88rem]">
                {plan.sample.map((row) => (
                  <li key={row.key}>
                    {row.name}
                    <span className="text-ink-3" dir="ltr">
                      {' '}· {row.period} · {row.kind} · +{row.points}
                    </span>
                  </li>
                ))}
              </ul>
              {/* Said out loud. The totals above are the whole figure; this
                  list is not, and a preview read as complete when it is not is
                  the one mistake a preview cannot afford. */}
              {plan.rows > plan.sample.length && (
                <p className="mt-2 text-[0.82rem] text-ink-3">
                  {t.pointsMore.replace('{n}', String(plan.rows - plan.sample.length))}
                </p>
              )}
              <form action={applyForm} className="mt-4">
                <input type="hidden" name="lang" value={lang} />
                <Submit pending={applying} label={t.pointsApply} t={t} />
              </form>
            </>
          )}
        </div>
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
 * Choosing a person, then choosing badges.
 *
 * This replaced two text boxes — an email typed from memory and a badge code
 * typed from memory — that told you nothing until after you pressed. Now you
 * search, you see who matched and what each of them already holds, and you tick
 * what you mean.
 *
 * Several at once, because that is how the decision is actually made: somebody
 * reads a volunteer's record and concludes they are owed three things, not one
 * thing three times. One reason covers the decision; each badge still gets its
 * own row and its own audit line.
 *
 * The `key` on the fieldset is load-bearing. Picking a different person must
 * clear the ticks — carrying them over would mean the boxes you ticked for one
 * volunteer are sitting armed when you select the next, and the mistake would
 * look exactly like a deliberate grant.
 */
function BadgePicker({
  lang, t, badges, mode,
}: {
  lang: Locale;
  t: RecognitionAdminStrings;
  badges: BadgeChoice[];
  mode: 'grant' | 'withdraw';
}) {
  const [search, searchAction, searching] = useActionState(findPeopleAction, noSearch);
  const [state, formAction, pending] = useActionState(
    mode === 'grant' ? grantBadgesAction : withdrawBadgesAction,
    empty,
  );
  const [chosen, setChosen] = useState<Found | null>(null);

  /*
   * Withdrawing offers only what they hold; granting offers only what they do
   * not. Showing the full catalogue in both and refusing afterwards is how a
   * form teaches people to guess.
   */
  const offered = chosen
    ? badges.filter((b) =>
      mode === 'withdraw' ? chosen.held.includes(b.code) : !chosen.held.includes(b.code))
    : [];

  return (
    <div className="mt-5 space-y-5">
      <form action={searchAction} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="lang" value={lang} />
        <label className="min-w-[16rem] flex-1" htmlFor={`${mode}-term`}>
          <span className="mb-1.5 block text-[0.88rem] font-bold">{t.searchLabel}</span>
          <input
            id={`${mode}-term`} name="term" required minLength={2}
            defaultValue={search.term ?? ''} className={field}
          />
        </label>
        <Submit pending={searching} label={t.search} t={t} />
      </form>

      {search.error && (
        <p role="alert" className="rounded-xl border-2 border-warn bg-warn/10 p-4 text-[0.9rem] font-bold text-warn-text">
          {t.errors[search.error] ?? t.errors.unavailable}
        </p>
      )}

      {search.people && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {search.people.map((person) => {
            const active = chosen?.id === person.id;
            return (
              <li key={person.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setChosen(active ? null : person)}
                  className={`w-full rounded-xl border px-4 py-3 text-start transition-colors ${
                    active
                      ? 'border-brand-blue bg-brand-blue/10 dark:border-brand-orange dark:bg-brand-orange/10'
                      : 'border-line bg-ground hover:bg-surface-2'
                  }`}
                >
                  <span className="block font-extrabold" dir="auto">{person.name}</span>
                  <span className="block text-[0.8rem] text-ink-3" dir="ltr">{person.email}</span>
                  <span className="mt-1 block text-[0.8rem] text-ink-3">
                    {t.holdsCount.replace('{n}', String(person.held.length))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {chosen && (
        <form action={formAction} className="space-y-4 rounded-2xl border border-line bg-ground p-5">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="userId" value={chosen.id} />
          <Outcome state={state} t={t} />

          <p className="text-[0.95rem] font-extrabold" dir="auto">{chosen.name}</p>

          {offered.length === 0 ? (
            <p className="text-[0.9rem] text-ink-2">
              {mode === 'withdraw' ? t.holdsNothing : t.holdsEverything}
            </p>
          ) : (
            <fieldset key={chosen.id} className="space-y-2">
              <legend className="mb-1.5 text-[0.88rem] font-bold">{t.chooseBadges}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {offered.map((badge) => (
                  <label
                    key={badge.code}
                    className="flex items-start gap-2.5 rounded-xl border border-line bg-surface px-4 py-3"
                  >
                    <input
                      type="checkbox" name="codes" value={badge.code}
                      className="mt-1 size-4 accent-brand-blue"
                    />
                    <span>
                      <span className="block text-[0.92rem] font-bold">
                        <span aria-hidden="true">{badge.icon}</span> {badge.title}
                      </span>
                      <span className="block text-[0.78rem] text-ink-3" dir="ltr">{badge.code}</span>
                      {/* Said where the decision is made, not on a page nobody
                          opens: a badge out of circulation may still be given
                          by hand, and somebody should know that is what they
                          are doing. */}
                      {badge.retired && (
                        <span className="block text-[0.78rem] font-bold text-warn-text">
                          {t.retiredBadge}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <label className="block" htmlFor={`${mode}-reason`}>
            <span className="mb-1.5 block text-[0.88rem] font-bold">{t.reasonLabel}</span>
            <textarea
              id={`${mode}-reason`} name="reason" required minLength={MIN_REASON} rows={2}
              defaultValue={state.values?.reason ?? ''} className={field}
            />
          </label>

          <Submit
            pending={pending}
            label={mode === 'grant' ? t.grant : t.withdraw}
            t={t}
            tone={mode === 'grant' ? 'normal' : 'grave'}
          />
        </form>
      )}
    </div>
  );
}

/**
 * Retiring a badge, and bringing one back.
 *
 * Two independent forms with the same two fields, rather than one form with two
 * submit buttons. The clever version — one set of inputs, a second button
 * posting them elsewhere — needs the fields to be readable from outside their
 * own form, and every way of arranging that is a way of submitting the wrong
 * thing. Retiring a badge and restoring one are not the same act and do not
 * share a form.
 */
function CodeAndReasonForm({
  lang, t, action, label, tone, id,
}: {
  lang: Locale;
  t: RecognitionAdminStrings;
  action: (prev: AdminState, formData: FormData) => Promise<AdminState>;
  label: string;
  tone: 'normal' | 'grave';
  id: string;
}) {
  const [state, formAction, pending] = useActionState(action, empty);
  const keep = state.values ?? {};
  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-line bg-ground p-5">
      <input type="hidden" name="lang" value={lang} />
      <Outcome state={state} t={t} />
      <label className="block" htmlFor={`${id}-code`}>
        <span className="mb-1.5 block text-[0.88rem] font-bold">{t.codeLabel}</span>
        <input
          id={`${id}-code`} name="code" required dir="ltr"
          defaultValue={keep.code ?? ''} className={field}
        />
      </label>
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

export function BadgeCirculation({ lang, t }: { lang: Locale; t: RecognitionAdminStrings }) {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <CodeAndReasonForm
        lang={lang} t={t} id="retire" action={retireBadgeAction}
        label={t.retire} tone="grave"
      />
      <CodeAndReasonForm
        lang={lang} t={t} id="lift" action={liftRetirementAction}
        label={t.lift} tone="normal"
      />
    </div>
  );
}

export function GrantBadge(
  { lang, t, badges }: { lang: Locale; t: RecognitionAdminStrings; badges: BadgeChoice[] },
) {
  return <BadgePicker lang={lang} t={t} badges={badges} mode="grant" />;
}

export function WithdrawBadge(
  { lang, t, badges }: { lang: Locale; t: RecognitionAdminStrings; badges: BadgeChoice[] },
) {
  return <BadgePicker lang={lang} t={t} badges={badges} mode="withdraw" />;
}
