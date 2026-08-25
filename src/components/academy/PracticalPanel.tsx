'use client';

import { useActionState } from 'react';
import { submitPracticalAction, type PracticalFormState } from '@/lib/actions/practical';
import type { PracticalStrings } from '@/lib/dictionaries/practical';
import type { Attempt, PracticalState } from '@/lib/programme/practical';
import type { Locale } from '@/lib/i18n';

/**
 * The practical screen: the brief, the box, and everything already said.
 *
 * The history is not an accordion and not behind a link. A learner who was
 * sent back is reading this screen precisely because they want to know what
 * they were told, and putting that behind a press means the commonest reason
 * anybody opens the page is the one thing the page hides. Migration 041 keeps
 * every attempt forever; this is what that promise looks like on a screen.
 *
 * There is no character counter racing the typist and no progress bar. The
 * limits are stated once, in words, above the box.
 */

const field =
  'w-full rounded-xl border border-line bg-ground px-4 py-3 text-[0.97rem] leading-relaxed outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25';

/* Declared here rather than exported from the action: a 'use server' file may
 * export async functions and nothing else. */
const empty: PracticalFormState = { attempt: 0 };

/** Tint, border and reading colour for each of the four states. */
const BANNER: Record<PracticalState, { box: string; text: string }> = {
  'not-started': { box: 'border-line bg-surface-2', text: 'text-ink-2' },
  'awaiting-review': { box: 'border-warn/40 bg-warn/[0.09]', text: 'text-warn-text' },
  'changes-requested': { box: 'border-brand-orange/45 bg-brand-orange/[0.09]', text: 'text-ink-2' },
  approved: { box: 'border-ok/35 bg-ok/[0.08]', text: 'text-ok-text' },
};

export function PracticalPanel({
  lang,
  slug,
  t,
  title,
  brief,
  looksLike,
  state,
  history,
  canWrite,
  signedIn,
}: {
  lang: Locale;
  slug: string;
  t: PracticalStrings;
  title: string;
  brief: string;
  looksLike: string[];
  state: PracticalState;
  /** Newest first — ordered by attempt number on the server, never by date. */
  history: Attempt[];
  /** False while a trainer holds the work, or once it has been accepted. */
  canWrite: boolean;
  signedIn: boolean;
}) {
  const [result, formAction, pending] = useActionState<PracticalFormState, FormData>(
    submitPracticalAction,
    empty,
  );

  const banner = BANNER[state];
  const stateLabel = {
    'not-started': t.stateNotStarted,
    'awaiting-review': t.stateAwaiting,
    'changes-requested': t.stateChanges,
    approved: t.stateApproved,
  }[state];
  const stateBody = {
    'not-started': t.screenLede,
    'awaiting-review': t.awaitingBody,
    'changes-requested': t.changesBody,
    approved: t.approvedBody,
  }[state];

  return (
    <div>
      <h2 className="text-[1.15rem] font-extrabold">{title}</h2>

      {signedIn && (
        <div className={`mt-4 rounded-2xl border p-5 ${banner.box}`}>
          <p className={`text-[0.95rem] font-extrabold ${banner.text}`}>{stateLabel}</p>
          <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-2">{stateBody}</p>
        </div>
      )}

      <section className="mt-7">
        <h3 className="text-[1rem] font-extrabold">{t.briefHeading}</h3>
        <p className="mt-2 max-w-[68ch] whitespace-pre-line text-[0.98rem] leading-relaxed text-ink-2">
          {brief}
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-surface-2 p-5">
        <h3 className="text-[0.98rem] font-extrabold">{t.looksLikeHeading}</h3>
        <ul className="mt-2.5 flex max-w-[68ch] flex-col gap-2">
          {looksLike.map((item, i) => (
            <li
              key={i}
              className="relative ps-5 text-[0.94rem] leading-relaxed text-ink-2 before:absolute before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-brand-orange before:content-[''] before:start-0"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      {signedIn && canWrite && (
        <form action={formAction} className="mt-7" key={result.attempt ?? 0}>
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="slug" value={slug} />

          {result.error && (
            <p
              role="alert"
              className="mb-4 rounded-xl border-2 border-danger bg-danger/10 p-4 text-[0.94rem] font-bold text-danger-text"
            >
              {t.errors[result.error]}
            </p>
          )}

          <label htmlFor="practical-body" className="mb-1.5 block text-[0.92rem] font-extrabold">
            {t.writeLabel}
          </label>
          <p className="mb-2 text-[0.86rem] text-ink-3">{t.writeHint}</p>
          <textarea
            id="practical-body"
            name="body"
            rows={14}
            required
            defaultValue={result.values?.body ?? ''}
            className={field}
          />

          <button
            type="submit"
            disabled={pending}
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-brand-orange px-7 py-3 text-[0.95rem] font-extrabold text-brand-orange-ink transition-opacity disabled:opacity-60"
          >
            {pending ? t.submitting : history.length > 0 ? t.resubmit : t.submit}
          </button>
        </form>
      )}

      {history.length > 0 && (
        <section className="mt-10 border-t border-line pt-7">
          <h3 className="text-[1rem] font-extrabold">{t.historyHeading}</h3>
          <p className="mt-2 max-w-[68ch] text-[0.9rem] leading-relaxed text-ink-3">
            {t.keptForever}
          </p>

          <ol className="mt-5 space-y-4">
            {history.map((a) => (
              <li key={a.attemptNo} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h4 className="text-[0.95rem] font-extrabold">
                    {t.attemptLabel.replace('{n}', String(a.attemptNo))}
                  </h4>
                  {/* Already 'YYYY-MM-DD' in Beirut, as text from the query.
                      Rebuilding a Date here would show work sent at half past
                      midnight as the day before. */}
                  <p className="text-[0.83rem] text-ink-3" dir="ltr">
                    {t.submittedOn} {a.submittedOn}
                  </p>
                </div>

                <p className="mt-3 whitespace-pre-line text-[0.94rem] leading-relaxed text-ink-2">
                  {a.body}
                </p>

                {a.decision !== null && (
                  <div
                    className={`mt-4 rounded-xl border p-4 ${
                      a.decision === 'approved'
                        ? 'border-ok/35 bg-ok/[0.08]'
                        : 'border-brand-orange/45 bg-brand-orange/[0.09]'
                    }`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <p
                        className={`text-[0.9rem] font-extrabold ${
                          a.decision === 'approved' ? 'text-ok-text' : 'text-ink'
                        }`}
                      >
                        {a.decision === 'approved' ? t.stateApproved : t.stateChanges}
                      </p>
                      {a.reviewedOn && (
                        <p className="text-[0.83rem] text-ink-3" dir="ltr">
                          {t.reviewedOn} {a.reviewedOn}
                        </p>
                      )}
                    </div>
                    <p className="mt-2 text-[0.88rem] font-bold text-ink-3">{t.feedbackHeading}</p>
                    <p className="mt-1 whitespace-pre-line text-[0.94rem] leading-relaxed text-ink-2">
                      {a.feedback ?? t.noFeedback}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
