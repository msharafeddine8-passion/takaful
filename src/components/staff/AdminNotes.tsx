import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
import type { AdminNote } from '@/lib/admin-notes';
import { MAX_NOTE } from '@/lib/admin-notes';
import {
  addNoteAction,
  editNoteAction,
  archiveNoteAction,
} from '@/lib/actions/admin-profile';
import type { AdminProfileStrings } from '@/lib/dictionaries/admin-profile';

/**
 * «ملاحظات إدارية» on a member's page: what staff have written down about
 * following this volunteer up, and the three things that can be done to it.
 *
 * A SERVER COMPONENT, and every control is a plain `<form action={serverAction}>`
 * — adding a note, editing one, archiving one. The disclosures are `<details>`
 * elements, so opening the add panel, an edit panel or the archive drawer costs
 * no JavaScript at all and works before hydration. Nothing in this feature needs
 * a row added in the browser, so nothing here crosses the client boundary; the
 * sibling section's VolunteerRoleForm is the only client component on this
 * screen and its own header says why.
 *
 * ── THE TWO SENTENCES ON THIS SCREEN ARE THE FEATURE ───────────────────────
 *
 * Migration 048 makes two arguments the schema cannot hold, and both are
 * rendered here beside the box rather than behind a link.
 *
 *   THE SUBJECT NEVER READS THESE, and can therefore never answer them. That
 *   changes how a note gets written, so it is said before the textarea and not
 *   after it. lib/admin-notes.ts keeps the rule structurally — there is no
 *   reader function that takes a viewer — and this is the half of it a person
 *   has to be told.
 *
 *   A SAFEGUARDING CONCERN DOES NOT BELONG IN A NOTE. safeguarding_records has
 *   a named handler, a retention rule and a route to the focal point; a note has
 *   none of the three, so a disclosure typed here would sit in a text box with
 *   nobody owning it. The warning names those three missing things, because the
 *   reason is what makes somebody stop — and it sits immediately above the
 *   textarea on both the add form and every edit form, since an edit is just as
 *   good a place to type one.
 *
 * ── DATES ──────────────────────────────────────────────────────────────────
 *
 * Every day on this screen is 'YYYY-MM-DD' text produced by Postgres already
 * shifted to Asia/Beirut. Nothing here builds a Date from one: the session runs
 * GMT and the association is in Beirut, so a note written at 00:30 on the 5th
 * would render as the 4th the moment anything did.
 *
 * ── THE CONTROLS ARE HIDDEN, AND THAT IS NOT THE CHECK ─────────────────────
 *
 * `canManage` decides whether the forms render, so the screen is honest about
 * what it offers. It is NOT the permission check: every action asserts
 * members.manage against the session before it reads a field. Hiding a form here
 * changes what is on the page and nothing about what the server accepts.
 *
 * ── MOBILE FIRST ──────────────────────────────────────────────────────────
 *
 * One column at 375px throughout; nothing carries a min-width, so the page
 * itself never scrolls sideways. A pasted note body is wrapped rather than
 * clipped. Every control is `min-h-11`, which is 44px.
 */

/* The same pill, field and hint as VolunteerRoles — these two sections sit on
 * one screen and must read as one product. `inline-flex` is what removes the
 * disclosure triangle: a summary is a list-item by default and stops being one
 * the moment its display changes. */
const PILL =
  'inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line' +
  ' bg-surface-2 px-4 text-[0.88rem] font-extrabold text-ink-2 transition-colors hover:bg-surface';

const FIELD =
  'min-h-11 w-full rounded-xl border border-line bg-ground px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue';

const LABEL = 'mb-1.5 block text-[0.88rem] font-bold';

const HINT = 'mt-1.5 text-[0.82rem] leading-relaxed text-ink-3';

/**
 * One archived note.
 *
 * Declared here rather than in lib/admin-notes.ts, which deliberately has no
 * archived-list reader: its exported surface is four functions and a probe
 * asserts exactly that. The member page owns the query, the same way it owns the
 * archived-roles one next door.
 */
export type ArchivedNote = {
  id: string;
  body: string;
  authorName: string;
  /** 'YYYY-MM-DD' in Beirut, as text. Never a Date. */
  writtenOn: string;
  archivedOn: string;
};

function Disclosure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details>
      <summary className={PILL}>{label}</summary>
      {/* p-3 on a phone: this box already sits inside the card's own p-4, and
          two 16px insets stacked leave a 375px screen with very little middle. */}
      <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">{children}</div>
    </details>
  );
}

/**
 * The safeguarding warning, rendered wherever a body can be typed.
 *
 * A component rather than a copy on each form, because two copies is how one of
 * them ends up on the add form only — and the edit form is exactly as good a
 * place to type a disclosure into.
 */
function SafeguardingWarning({ t }: { t: AdminProfileStrings['notes'] }) {
  return (
    <div className="mt-4 rounded-xl border-2 border-warn bg-warn/10 p-4">
      <p className="text-[0.9rem] font-extrabold text-warn-text">{t.safeguardingHeading}</p>
      <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-2">{t.safeguardingBody}</p>
    </div>
  );
}

function NoteBody({
  id,
  defaultValue,
  t,
}: {
  id: string;
  defaultValue?: string;
  t: AdminProfileStrings['notes'];
}) {
  return (
    <>
      <label className={`${LABEL} mt-4`} htmlFor={id}>
        {t.bodyLabel}
      </label>
      <textarea
        id={id}
        name="body"
        rows={4}
        required
        maxLength={MAX_NOTE}
        placeholder={t.bodyPlaceholder}
        defaultValue={defaultValue}
        className={`${FIELD} leading-relaxed`}
      />
      {/* The cap is the module's MAX_NOTE rather than a number retyped here, so
          the sentence and the refusal cannot drift apart. */}
      <p className={HINT}>{t.bodyHint.replace('{n}', String(MAX_NOTE))}</p>
    </>
  );
}

export function AdminNotes({
  lang,
  userId,
  notes,
  archived,
  canManage,
  t,
}: {
  lang: Locale;
  /** Who the notes are about. Never the reader. */
  userId: string;
  /** Already newest-first from `notesAbout`. Not re-sorted here. */
  notes: AdminNote[];
  archived: ArchivedNote[];
  canManage: boolean;
  t: AdminProfileStrings['notes'];
}) {
  return (
    <section className="mt-10">
      <h2 className="text-[1.1rem] font-extrabold">{t.sectionTitle}</h2>
      <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-ink-2">{t.lede}</p>

      {/*
       * THE FIRST OF THE TWO SENTENCES, and it is above everything else in the
       * section on purpose — including the add button. Somebody who scrolls
       * past the heading straight to the button has still passed this.
       */}
      <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4 sm:p-5">
        <p className="text-[0.95rem] font-extrabold">{t.privateHeading}</p>
        <p className="mt-1.5 max-w-[62ch] text-[0.9rem] leading-relaxed text-ink-2">
          {t.privateBody}
        </p>
      </div>

      {canManage ? (
        <details className="mt-4">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-full bg-brand-orange px-5 text-[0.92rem] font-extrabold text-brand-orange-ink transition-colors hover:bg-brand-orange-dark">
            {t.addCta}
          </summary>
          <div className="mt-4 rounded-2xl border border-line bg-surface p-4 sm:p-6">
            <h3 className="text-[1rem] font-extrabold">{t.addHeading}</h3>
            {/* Above the textarea, not below it. */}
            <SafeguardingWarning t={t} />
            <form action={addNoteAction}>
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="userId" value={userId} />
              <NoteBody id="note-new" t={t} />
              <button
                type="submit"
                className="mt-4 min-h-11 w-full rounded-full bg-brand-blue px-6 text-[0.92rem] font-extrabold text-white transition-opacity hover:opacity-90 sm:w-auto"
              >
                {t.addSubmit}
              </button>
            </form>
          </div>
        </details>
      ) : (
        <p className="mt-4 text-[0.88rem] text-ink-3">{t.readOnly}</p>
      )}

      {notes.length === 0 ? (
        <p className="mt-5 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {t.empty}
        </p>
      ) : (
        <ol className="mt-5 space-y-4">
          {notes.map((note) => (
            <li key={note.id} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
              {/* `whitespace-pre-line` keeps the paragraphs somebody typed, and
                  `break-words` keeps a pasted URL inside the card at 375px. */}
              <p className="whitespace-pre-line text-[0.95rem] leading-relaxed break-words">
                {note.body}
              </p>

              <p className="mt-3 text-[0.82rem] text-ink-3">
                {/* An author with no profile row is named as unattributed rather
                    than as a UUID — the LEFT JOIN in notesAbout exists so the
                    note survives a missing profile, not so an id reaches a
                    screen. */}
                {t.authorLine.replace('{name}', note.authorName || t.unknownAuthor)}
                {' · '}
                <span dir="ltr">{t.writtenOn.replace('{date}', note.writtenOn)}</span>
              </p>

              {/* Only once it has actually been revised. `edited` is
                  (updated_by IS NOT NULL) from the query, so a row whose
                  updated_at moved for any other reason does not claim an edit. */}
              {note.edited && (
                <p className="mt-1 text-[0.82rem] font-bold text-ink-3">
                  <span className="rounded-full bg-surface-2 px-2.5 py-0.5">{t.editedBadge}</span>
                  {' · '}
                  <span dir="ltr">{t.editedOn.replace('{date}', note.editedOn)}</span>
                </p>
              )}

              {canManage && (
                <div className="mt-4 space-y-2 border-t border-line pt-4">
                  <Disclosure label={t.editCta}>
                    <h4 className="text-[0.95rem] font-extrabold">{t.editHeading}</h4>
                    <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-2">{t.editNote}</p>
                    <SafeguardingWarning t={t} />
                    <form action={editNoteAction}>
                      <input type="hidden" name="lang" value={lang} />
                      <input type="hidden" name="noteId" value={note.id} />
                      <NoteBody id={`note-body-${note.id}`} defaultValue={note.body} t={t} />
                      <button
                        type="submit"
                        className="mt-4 min-h-11 w-full rounded-full border-2 border-brand-blue px-6 text-[0.9rem] font-extrabold text-brand-blue transition-colors hover:bg-brand-blue/10 sm:w-auto dark:border-brand-orange dark:text-brand-orange"
                      >
                        {t.editSubmit}
                      </button>
                    </form>
                  </Disclosure>

                  <Disclosure label={t.archiveCta}>
                    <h4 className="text-[0.95rem] font-extrabold">{t.archiveHeading}</h4>
                    <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-2">
                      {t.archiveNote}
                    </p>
                    <form action={archiveNoteAction} className="mt-4">
                      <input type="hidden" name="lang" value={lang} />
                      <input type="hidden" name="noteId" value={note.id} />
                      <button
                        type="submit"
                        className="min-h-11 w-full rounded-full bg-danger px-6 text-[0.9rem] font-extrabold text-white transition-opacity hover:opacity-90 sm:w-auto"
                      >
                        {t.archiveSubmit}
                      </button>
                    </form>
                  </Disclosure>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      {/*
       * Archived notes: kept, hidden by default, one tap from being readable.
       * The database refuses a DELETE outright (trg_admin_notes_no_delete), so
       * nothing in this drawer is ever the last copy of anything — and there is
       * no restore, because nothing in the module offers one.
       */}
      {archived.length > 0 && (
        <details className="mt-6">
          <summary className={PILL}>
            {t.archivedShow.replace('{n}', String(archived.length))}
          </summary>
          <p className="mt-3 max-w-[62ch] text-[0.86rem] leading-relaxed text-ink-3">
            {t.archivedNote}
          </p>
          <ol className="mt-3 space-y-3">
            {archived.map((note) => (
              <li key={note.id} className="rounded-2xl border border-line bg-surface-2 p-4">
                <p className="whitespace-pre-line text-[0.92rem] leading-relaxed text-ink-2 break-words">
                  {note.body}
                </p>
                <p className="mt-2.5 text-[0.82rem] text-ink-3">
                  {t.authorLine.replace('{name}', note.authorName || t.unknownAuthor)}
                  {' · '}
                  <span dir="ltr">{t.writtenOn.replace('{date}', note.writtenOn)}</span>
                </p>
                <p className="mt-1 text-[0.82rem] text-ink-3" dir="ltr">
                  {t.archivedOn.replace('{date}', note.archivedOn)}
                </p>
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}
