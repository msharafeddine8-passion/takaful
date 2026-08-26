'use client';

import { useId, useState } from 'react';
import { countPhrase } from '@/lib/when';
import {
  FIELD_KINDS,
  VISIBILITIES,
  type FieldKind,
  type FieldOption,
  type Visibility,
} from '@/lib/profile-field-kinds';
import { createFieldDefAction, updateFieldDefAction } from '@/lib/actions/admin-profile';
import type { Locale } from '@/lib/i18n';
import type { AdminProfileStrings } from '@/lib/dictionaries/admin-profile';

/**
 * The one form a field definition is typed into — new or being corrected.
 *
 * ── WHY THIS IS THE ONLY CLIENT COMPONENT IN THE FEATURE ───────────────────
 *
 * Everything else is a server component and a plain `<form action={serverAction}>`:
 * the notes, the answers, archiving a field, moving one up or down. Two things
 * force this one across the boundary, and they are named here so nobody has to
 * guess whether the line could be moved back.
 *
 *   1. OPTION ROWS ARE ADDED AND REMOVED IN THE BROWSER. A select with no
 *      options is a form that cannot be filled in — migration 048 refuses one
 *      with chk_pfd_has_opts — so authoring them is part of declaring the field,
 *      and there is no server round trip that adds an empty row. They are held
 *      in state rather than as uncontrolled inputs because removing row 2 of 4
 *      must not shift row 3's text up into row 2, which is exactly what happens
 *      when defaultValue is keyed by index.
 *
 *   2. THE OPTIONS EDITOR APPEARS AND DISAPPEARS WITH THE KIND. Options belong
 *      to `select` and `multiselect` and to nothing else — checkDef refuses a
 *      `text` field that carries any — so the editor has to follow the kind
 *      select, and on the create form the kind is not known until it is chosen.
 *
 * ── AND NOT FOR VALIDATION ─────────────────────────────────────────────────
 *
 * Nothing here decides whether a write is allowed. The capability is asserted in
 * the action against the session before a field is read, the key rule and the
 * option rules are checked again in checkDef, and the CHECK constraints in
 * migrations 048 and 052 sit underneath all of it. `pattern` on the key box is
 * the browser saying so early.
 *
 * ── THE KIND AND THE KEY ARE FIXED, AND THE FORM SAYS SO BEFORE IT REFUSES ──
 *
 * trg_field_defs_before_update (migration 052) raises on any change to either,
 * and updateFieldDef refuses a kind change with 'kind-locked' before that. A
 * rejection somebody meets after typing is a worse teacher than a rule they read
 * first, so:
 *
 *   ON THE CREATE FORM, both are ordinary editable inputs and the rule is stated
 *   above them — they are fixed the moment this is saved.
 *
 *   ON THE EDIT FORM, neither is an input at all. The key is printed as text and
 *   is not posted (DefPatch does not carry it). The kind is printed as text and
 *   travels as a hidden field, because patchOf() needs a kind in the FormData
 *   and the only honest value is the one the row already has. Both carry a
 *   «مثبَّت» badge, and the paragraph above says what to do instead: archive the
 *   field and declare another, so the old answers stay answers to the old
 *   question.
 *
 * ── THE VISIBILITY WARNING ─────────────────────────────────────────────────
 *
 * `visibility` is a property of the DEFINITION, so it decides who sees every
 * answer already given. The control therefore does not merely name three
 * audiences: `answers` is the number of answers on this field right now, and the
 * warning underneath says those answers move together, immediately, without
 * their authors being asked. On a field with none, it says the choice governs
 * the first answer and every one after it.
 */

const FIELD =
  'min-h-11 w-full rounded-xl border border-line bg-ground px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue';

const LABEL = 'mb-1.5 block text-[0.88rem] font-bold';

const HINT = 'mt-1.5 text-[0.82rem] leading-relaxed text-ink-3';

/** One option row, as the form holds it. `key` is React's, not the field's. */
type OptionRow = { key: number; value: string; ar: string; en: string };

/**
 * A definition flattened for the form.
 *
 * Built by the server component that renders this, so nothing from a
 * `server-only` module is imported into the browser bundle.
 */
export type FieldFormValues = {
  id: string;
  key: string;
  labelAr: string;
  labelEn: string;
  helpAr: string | null;
  helpEn: string | null;
  kind: FieldKind;
  options: FieldOption[];
  required: boolean;
  visibility: Visibility;
  sortOrder: number;
};

function blankRow(key: number): OptionRow {
  return { key, value: '', ar: '', en: '' };
}

export function ProfileFieldForm({
  lang,
  def,
  /** How many answers are stored against this definition right now. */
  answers,
  /** Where a new field lands in the order, so moves between rows behave. */
  nextSortOrder,
  t,
}: {
  lang: Locale;
  /** Absent when declaring a new field; present when correcting one. */
  def?: FieldFormValues;
  answers: number;
  nextSortOrder: number;
  t: AdminProfileStrings['defs'];
}) {
  const uid = useId();
  const editing = def !== undefined;

  const [kind, setKind] = useState<FieldKind>(def?.kind ?? 'text');
  const [rows, setRows] = useState<OptionRow[]>(() => {
    const existing = def?.options ?? [];
    if (existing.length === 0) return [blankRow(0)];
    return existing.map((option, i) => ({ key: i, ...option }));
  });
  const [nextKey, setNextKey] = useState(() => (def?.options.length ?? 0) + 1);

  const needsOptions = kind === 'select' || kind === 'multiselect';
  const answersPhrase = countPhrase(answers, t.answers);

  const setRow = (key: number, patch: Partial<OptionRow>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const addRow = () => {
    setRows((current) => [...current, blankRow(nextKey)]);
    setNextKey((n) => n + 1);
  };

  const removeRow = (key: number) =>
    setRows((current) => {
      const left = current.filter((row) => row.key !== key);
      return left.length === 0 ? [blankRow(nextKey)] : left;
    });

  return (
    <form action={editing ? updateFieldDefAction : createFieldDefAction} className="space-y-5">
      <input type="hidden" name="lang" value={lang} />
      {editing && <input type="hidden" name="fieldId" value={def.id} />}

      {/* The fixed-after-creation rule, before the two inputs it governs. */}
      <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.86rem] leading-relaxed text-ink-2">
        {editing ? t.fixedRuleEdit : t.fixedRuleNew}
      </p>

      {/* ------------------------------------------------------------- key */}
      <div>
        <p className={LABEL}>
          {t.keyLabel}
          {editing && (
            <span className="ms-2 rounded-full bg-surface-2 px-2.5 py-0.5 text-[0.78rem] font-extrabold text-ink-3">
              {t.fixedBadge}
            </span>
          )}
        </p>
        {editing ? (
          /* Not an input, and not posted either: DefPatch has no key, so there
             is nothing this box could change. Printing it as text is the honest
             version of a disabled field. */
          <p
            dir="ltr"
            className="rounded-xl border border-line bg-surface-2 px-4 py-3 font-mono text-[0.9rem] font-bold break-words"
          >
            {def.key}
          </p>
        ) : (
          <>
            <input
              id={`${uid}-key`}
              name="key"
              type="text"
              dir="ltr"
              required
              /* chk_pfd_key, said to the browser. The action lower-cases and
                 checkDef checks the same rule again before any write. */
              pattern="[a-z][a-z0-9_]{1,48}"
              autoComplete="off"
              className={`${FIELD} text-start font-mono`}
            />
            <p className={HINT}>{t.keyHint}</p>
          </>
        )}
      </div>

      {/* ------------------------------------------------------------ kind */}
      <div>
        <p className={LABEL}>
          {t.kindLabel}
          {editing && (
            <span className="ms-2 rounded-full bg-surface-2 px-2.5 py-0.5 text-[0.78rem] font-extrabold text-ink-3">
              {t.fixedBadge}
            </span>
          )}
        </p>
        {editing ? (
          <>
            {/* Printed, and posted as a hidden field because patchOf() needs a
                kind in the FormData and this row's own kind is the only value
                that can be correct. */}
            <input type="hidden" name="kind" value={def.kind} />
            <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.92rem] font-bold">
              {t.kinds[def.kind]}
            </p>
          </>
        ) : (
          <>
            <select
              id={`${uid}-kind`}
              name="kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as FieldKind)}
              className={FIELD}
            >
              {/* The eight the migration's CHECK constraint permits, from the
                  closed set itself rather than retyped here. */}
              {FIELD_KINDS.map((one) => (
                <option key={one} value={one}>
                  {t.kinds[one]}
                </option>
              ))}
            </select>
            <p className={HINT}>{t.kindHint}</p>
          </>
        )}
      </div>

      {/* ---------------------------------------------------------- labels */}
      <div>
        <label className={LABEL} htmlFor={`${uid}-labelAr`}>
          {t.labelArLabel}
        </label>
        <input
          id={`${uid}-labelAr`}
          name="labelAr"
          type="text"
          required
          defaultValue={def?.labelAr}
          className={FIELD}
        />
        <p className={HINT}>{t.labelArHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`${uid}-labelEn`}>
          {t.labelEnLabel}
        </label>
        <input
          id={`${uid}-labelEn`}
          name="labelEn"
          type="text"
          dir="ltr"
          defaultValue={def?.labelEn}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.labelEnHint}</p>
      </div>

      {/* ------------------------------------------------------------ help */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor={`${uid}-helpAr`}>
            {t.helpArLabel}
          </label>
          <input
            id={`${uid}-helpAr`}
            name="helpAr"
            type="text"
            defaultValue={def?.helpAr ?? ''}
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor={`${uid}-helpEn`}>
            {t.helpEnLabel}
          </label>
          <input
            id={`${uid}-helpEn`}
            name="helpEn"
            type="text"
            dir="ltr"
            defaultValue={def?.helpEn ?? ''}
            className={`${FIELD} text-start`}
          />
        </div>
      </div>
      <p className={HINT}>{t.helpHint}</p>

      {/* --------------------------------------------------------- options */}
      {needsOptions ? (
        <div>
          <p className={LABEL}>{t.optionsLabel}</p>
          <p className={HINT}>{t.optionsHint}</p>
          {/* Only once somebody has answered. Before that a value is free to
              change and the sentence would be noise. */}
          {answers > 0 && (
            <p className="mt-2 rounded-xl border border-warn bg-warn/10 px-4 py-3 text-[0.84rem] leading-relaxed text-ink-2">
              {t.optionsValueWarn}
            </p>
          )}

          {/*
           * One JSON array in a hidden field, which is the contract the head of
           * lib/actions/admin-profile.ts documents: the alternative is
           * options[0][ar] and a parser inside a server action. Rebuilt on every
           * render from state, so what is posted is what is on the screen.
           */}
          <input
            type="hidden"
            name="options"
            value={JSON.stringify(
              rows.map((row) => ({ value: row.value, ar: row.ar, en: row.en })),
            )}
          />

          <ul className="mt-3 space-y-3">
            {rows.map((row, i) => (
              <li key={row.key} className="rounded-xl border border-line bg-surface-2 p-3">
                <p className="mb-2 text-[0.8rem] font-extrabold text-ink-3">
                  {t.optionRow.replace('{n}', String(i + 1))}
                </p>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-1 block text-[0.8rem] font-bold text-ink-3">
                      {t.optionValueLabel}
                    </span>
                    <input
                      type="text"
                      dir="ltr"
                      value={row.value}
                      onChange={(event) => setRow(row.key, { value: event.target.value })}
                      className={`${FIELD} text-start font-mono`}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[0.8rem] font-bold text-ink-3">
                      {t.optionArLabel}
                    </span>
                    <input
                      type="text"
                      value={row.ar}
                      onChange={(event) => setRow(row.key, { ar: event.target.value })}
                      className={FIELD}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[0.8rem] font-bold text-ink-3">
                      {t.optionEnLabel}
                    </span>
                    <input
                      type="text"
                      dir="ltr"
                      value={row.en}
                      onChange={(event) => setRow(row.key, { en: event.target.value })}
                      className={`${FIELD} text-start`}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  className="mt-2 min-h-11 rounded-full px-3 text-[0.85rem] font-bold text-danger-text hover:underline"
                >
                  {t.optionRemove}
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={addRow}
            className="mt-3 min-h-11 rounded-full border border-line bg-surface px-5 text-[0.88rem] font-extrabold text-brand-blue hover:bg-surface-2 dark:text-brand-orange"
          >
            {t.optionAdd}
          </button>
        </div>
      ) : (
        /* No hidden `options` field at all when the kind takes none. checkDef
           refuses a non-choice field that carries any, so an empty array left
           behind by a kind the author changed their mind about would be a
           refusal nobody could see the cause of. */
        <p className={HINT}>{t.optionsOnlyFor}</p>
      )}

      {/* -------------------------------------------------------- required */}
      <div>
        <label className="flex min-h-11 items-center gap-3 text-[0.95rem] font-bold">
          <input
            name="required"
            type="checkbox"
            value="on"
            defaultChecked={def?.required ?? false}
            className="h-5 w-5 shrink-0 accent-brand-blue"
          />
          {t.requiredLabel}
        </label>
        <p className={HINT}>{t.requiredHint}</p>
      </div>

      {/* ------------------------------------------------------ visibility */}
      <div>
        <label className={LABEL} htmlFor={`${uid}-visibility`}>
          {t.visibilityLabel}
        </label>
        <select
          id={`${uid}-visibility`}
          name="visibility"
          /* The column's own default, and the migration's argument for it: a
             field that appears public by default is a field somebody publishes
             by accident. */
          defaultValue={def?.visibility ?? 'staff'}
          className={FIELD}
        >
          {VISIBILITIES.map((one) => (
            <option key={one} value={one}>
              {t.visibility[one]}
            </option>
          ))}
        </select>
        <p className={HINT}>{t.visibilityHint}</p>
        <p className="mt-2 rounded-xl border-2 border-warn bg-warn/10 px-4 py-3 text-[0.86rem] leading-relaxed text-ink-2">
          {answers > 0
            ? t.visibilityWarn.split('{answers}').join(answersPhrase)
            : t.visibilityWarnEmpty}
        </p>
      </div>

      {/* ----------------------------------------------------------- order */}
      <div>
        <label className={LABEL} htmlFor={`${uid}-sortOrder`}>
          {t.sortLabel}
        </label>
        <input
          id={`${uid}-sortOrder`}
          name="sortOrder"
          type="number"
          step="1"
          /* Six digits, matching orderOf()'s own rule in the action — anything
             longer is read as 0 there rather than reaching a query. */
          min={-99999}
          max={99999}
          defaultValue={def ? def.sortOrder : nextSortOrder}
          className={FIELD}
        />
        <p className={HINT}>{t.sortHint}</p>
      </div>

      <button
        type="submit"
        className="min-h-11 w-full rounded-full bg-brand-blue px-6 text-[0.92rem] font-extrabold text-white transition-opacity hover:opacity-90 sm:w-auto"
      >
        {editing ? t.saveEdit : t.save}
      </button>
    </form>
  );
}
