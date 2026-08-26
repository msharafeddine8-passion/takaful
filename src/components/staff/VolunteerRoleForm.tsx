'use client';

import { useActionState, useId, useState } from 'react';
import {
  createRoleAction,
  updateRoleAction,
  type RoleFormState,
} from '@/lib/actions/volunteer-roles';
import type { DatePrecision, Visibility } from '@/lib/volunteer-role-view';
import type { Locale } from '@/lib/i18n';
import type { VolunteerRoleStrings } from '@/lib/dictionaries/volunteer-roles';
import type { OrgGroupStrings } from '@/lib/dictionaries/org-groups';

/**
 * The one form an administrator types a role into.
 *
 * ── WHY THIS IS THE PAGE'S ONLY CLIENT COMPONENT ───────────────────────────
 *
 * Everything else in this feature is a server component and a plain
 * `<form action={serverAction}>`: the timeline, ending a role, archiving one,
 * restoring one. Three things force this one across the boundary, and they are
 * named here so that nobody has to guess whether the line could be moved back.
 *
 *   1. ACHIEVEMENT ROWS ARE ADDED AND REMOVED IN THE BROWSER. The brief asks
 *      for it, and there is no server round trip that adds an empty text box.
 *      The rows are held in state rather than as uncontrolled inputs because
 *      removing row 2 of 4 must not shift row 3's text up into row 2, which is
 *      exactly what happens when defaultValue is keyed by index.
 *
 *   2. createRoleAction AND updateRoleAction TAKE (prevState, formData). That
 *      is the useActionState signature; a bare `action={createRoleAction}`
 *      does not type-check against it, and more importantly it would throw
 *      away the `error` the action returns — which is the difference between
 *      "the end date is before the start date" and a form that silently does
 *      nothing.
 *
 *   3. `pending`. These forms are long, and a save that shows nothing while it
 *      runs gets pressed twice, which on a table with no unique constraint
 *      means the role is recorded twice.
 *
 * ── AND NOT FOR VALIDATION ─────────────────────────────────────────────────
 *
 * Nothing here decides whether a write is allowed. The capability is asserted
 * in the action against the session before a single field is read, the period
 * rules are checked in lib/volunteer-role-view.ts and again by migration 046's
 * CHECK constraints. What this file does with `error` is show a sentence.
 *
 * ── AND THERE IS NO LIST OF ROLE TITLES IN IT ──────────────────────────────
 *
 * The title and kind boxes are `<input>` with a `<datalist>`. A datalist is a
 * typeahead: the browser offers the options and accepts anything else, and the
 * options here are what roleTitleSuggestions() read back out of the table.
 * They are never a `<select>`, there is no `pattern`, and nothing below
 * compares what was typed against what was offered. See the head of migration
 * 046 for why that is the feature rather than an oversight.
 *
 * ── THE GROUP PICKER IS AN ADDITION, NEVER A REPLACEMENT ───────────────────
 *
 * Migration 054 made committees and teams rows, so a role can now point at one
 * instead of naming it by hand. `groupChoices` is that list, and it is offered
 * BESIDE the free-text box rather than in place of it — both controls are on
 * the form at once, always.
 *
 * That is not a courtesy. Migration 046 keeps entity_kind free text precisely
 * so a role can say it was «لحملة رمضان» when the campaign has no row anywhere,
 * and there is no projects table yet at all; a select would make every one of
 * those unrecordable until somebody shipped a migration, which is the failure
 * this whole feature is arranged against. So: pick a group, or type a name, or
 * neither. If both arrive, entityOf() in the action takes the id, because it is
 * the more specific claim.
 */

/** One achievement row, as the form holds it. */
type AchievementRow = { key: number; ar: string; en: string };

/**
 * A role flattened for the form.
 *
 * The three entity columns are separate here rather than the `RoleEntity`
 * union lib/volunteer-roles.ts exposes, because a form posts three fields and
 * the union has to be taken apart to fill them. Flattened by the server
 * component that renders this, so nothing from a 'server-only' module is
 * imported into the browser bundle.
 */
export type RoleFormValues = {
  id: string;
  titleAr: string;
  titleEn: string;
  roleType: string | null;
  /** Set together, and only when the role points at a row somewhere. */
  entityKind: string | null;
  entityId: string | null;
  /** Set only when the role names something with no row anywhere. */
  entityName: string | null;
  startedOn: string | null;
  startedPrec: DatePrecision;
  endedOn: string | null;
  endedPrec: DatePrecision;
  isCurrent: boolean;
  description: string | null;
  achievements: { ar: string; en: string }[];
  visibility: Visibility;
};

/**
 * One committee or team as this form offers it.
 *
 * An id and a name already resolved into the page's language by the server
 * component that renders this — not the OrgGroup row, because lib/org-groups.ts
 * is 'server-only' and nothing from it may cross into the browser bundle.
 */
export type GroupChoice = { id: string; label: string };

const EMPTY: RoleFormState = {};

const FIELD =
  'min-h-11 w-full rounded-xl border border-line bg-ground px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue';

const LABEL = 'mb-1.5 block text-[0.88rem] font-bold';

const HINT = 'mt-1.5 text-[0.82rem] leading-relaxed text-ink-3';

function blankRow(key: number): AchievementRow {
  return { key, ar: '', en: '' };
}

/**
 * The distinct non-empty values, in the order they arrived.
 *
 * roleTitleSuggestions groups by (title_ar, title_en), so one Arabic title that
 * has been paired with two different English ones comes back twice — which is a
 * duplicate `<option>` and a duplicate React key. Order is preserved because
 * the query returns the association's most-used wording first, and that is the
 * suggestion an administrator should meet at the top of the list.
 */
function distinct(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed === '' || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export function VolunteerRoleForm({
  lang,
  userId,
  role,
  titleSuggestions,
  kindSuggestions,
  groupChoices,
  groupText,
  t,
}: {
  lang: Locale;
  /** Who the role is about. Sent for a new role; the row already knows for an edit. */
  userId: string;
  /** Absent for «+ إضافة منصب أو مهمة»; present when correcting a line. */
  role?: RoleFormValues;
  /** Titles used before, for the typeahead. Suggestions, never a permitted set. */
  titleSuggestions: { titleAr: string; titleEn: string }[];
  /** Kinds used before. Same rule. */
  kindSuggestions: string[];
  /** The groups that have rows, offered BESIDE the free-text box — never instead. */
  groupChoices?: GroupChoice[];
  groupText?: OrgGroupStrings['roleForm'];
  t: VolunteerRoleStrings;
}) {
  const editing = role !== undefined;
  const [state, action, pending] = useActionState(
    editing ? updateRoleAction : createRoleAction,
    EMPTY,
  );

  /*
   * Remounting the fields is how a create form empties itself.
   *
   * `state.id` changes only when a role has actually been written, so a fresh
   * key on success resets every uncontrolled input and the achievement rows in
   * one move — without an effect that has to be told when not to fire. An edit
   * form keeps its key, because its fields should go on showing what was just
   * saved rather than snapping back to a stale prop mid-revalidation.
   */
  const bodyKey = !editing && state.ok && state.id ? state.id : 'draft';

  return (
    <form action={action}>
      <input type="hidden" name="lang" value={lang} />
      {editing ? (
        <input type="hidden" name="roleId" value={role.id} />
      ) : (
        <input type="hidden" name="userId" value={userId} />
      )}

      <Fields
        key={bodyKey}
        role={role}
        titleSuggestions={titleSuggestions}
        kindSuggestions={kindSuggestions}
        groupChoices={groupChoices}
        groupText={groupText}
        echoed={state.values}
        t={t}
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-full bg-brand-blue px-6 py-2.5 text-[0.92rem] font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? t.saving : editing ? t.saveEdit : t.save}
        </button>

        {state.error && (
          <p role="status" className="text-[0.9rem] font-bold text-danger-text">
            {t.errors[state.error]}
          </p>
        )}
        {state.ok && !state.error && (
          <p role="status" className="text-[0.9rem] font-bold text-ok-text">
            ✓ {editing ? t.savedEdit : t.savedCreate}
          </p>
        )}
      </div>
    </form>
  );
}

/**
 * Every field, and the one piece of state.
 *
 * Split out so the parent can remount it with a `key` after a successful
 * create. `echoed` is what the action handed back when it refused — somebody
 * who fills in eight fields and gets one date wrong should not lose the other
 * seven.
 */
function Fields({
  role,
  titleSuggestions,
  kindSuggestions,
  groupChoices,
  groupText,
  echoed,
  t,
}: {
  role?: RoleFormValues;
  titleSuggestions: { titleAr: string; titleEn: string }[];
  kindSuggestions: string[];
  groupChoices?: GroupChoice[];
  groupText?: OrgGroupStrings['roleForm'];
  echoed?: Record<string, string>;
  t: VolunteerRoleStrings;
}) {
  const uid = useId();
  const titleArList = `${uid}-titles-ar`;
  const titleEnList = `${uid}-titles-en`;
  const kindList = `${uid}-kinds`;

  const arOptions = distinct(titleSuggestions.map((s) => s.titleAr));
  const enOptions = distinct(titleSuggestions.map((s) => s.titleEn));
  const kindOptions = distinct(kindSuggestions);

  const [rows, setRows] = useState<AchievementRow[]>(() => {
    const existing = role?.achievements ?? [];
    // Always at least one row: a form with none sends no achievement field at
    // all, and updateRoleAction reads that as "leave them alone" — which would
    // make clearing the last achievement impossible.
    if (existing.length === 0) return [blankRow(0)];
    return existing.map((a, i) => ({ key: i, ar: a.ar, en: a.en }));
  });
  const [nextKey, setNextKey] = useState(() => (role?.achievements.length ?? 0) + 1);

  const was = (name: string, fallback: string | null | undefined): string =>
    echoed?.[name] ?? fallback ?? '';

  const linked = role?.entityId != null && role.entityKind != null;

  /*
   * The group picker, or nothing.
   *
   * It is offered when there are groups to offer AND it can represent whatever
   * this role already points at. A role linked to something the list does not
   * contain — an activity, or a group archived since — keeps the read-only
   * branch below instead, so that saving an edit cannot silently demote a
   * linked entity to a typed string or re-point it at the wrong table.
   *
   * Held as the strings themselves rather than as a boolean, because a boolean
   * would not narrow `groupText` for the JSX that needs its three labels.
   */
  const choices = groupChoices ?? [];
  const picker =
    groupText !== undefined &&
    choices.length > 0 &&
    (!linked || choices.some((choice) => choice.id === role?.entityId))
      ? groupText
      : null;

  const setRow = (key: number, patch: Partial<AchievementRow>) =>
    setRows((current) => current.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const addRow = () => {
    setRows((current) => [...current, blankRow(nextKey)]);
    setNextKey((n) => n + 1);
  };

  const removeRow = (key: number) =>
    setRows((current) => {
      const left = current.filter((r) => r.key !== key);
      return left.length === 0 ? [blankRow(nextKey)] : left;
    });

  return (
    <div className="space-y-5">
      {/* ---------------------------------------------------------- titles */}
      <div>
        <label className={LABEL} htmlFor={`${uid}-titleAr`}>
          {t.titleArLabel}
        </label>
        <input
          id={`${uid}-titleAr`}
          name="titleAr"
          type="text"
          required
          list={titleArList}
          autoComplete="off"
          defaultValue={was('titleAr', role?.titleAr)}
          className={FIELD}
        />
        {/*
         * A datalist and not a select. The browser offers these and accepts
         * anything else, which is the entire point — see the head of this file
         * and of migration 046.
         */}
        <datalist id={titleArList}>
          {arOptions.map((title) => (
            <option key={title} value={title} />
          ))}
        </datalist>
        <p className={HINT}>{t.titleArHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`${uid}-titleEn`}>
          {t.titleEnLabel}
        </label>
        <input
          id={`${uid}-titleEn`}
          name="titleEn"
          type="text"
          dir="ltr"
          list={titleEnList}
          autoComplete="off"
          defaultValue={was('titleEn', role?.titleEn)}
          className={`${FIELD} text-start`}
        />
        <datalist id={titleEnList}>
          {enOptions.map((title) => (
            <option key={title} value={title} />
          ))}
        </datalist>
        <p className={HINT}>{t.titleEnHint}</p>
      </div>

      {/* ------------------------------------------------------------ kind */}
      <div>
        <label className={LABEL} htmlFor={`${uid}-roleType`}>
          {t.kindLabel}
        </label>
        <input
          id={`${uid}-roleType`}
          name="roleType"
          type="text"
          list={kindList}
          autoComplete="off"
          defaultValue={was('roleType', role?.roleType)}
          className={FIELD}
        />
        <datalist id={kindList}>
          {kindOptions.map((kind) => (
            <option key={kind} value={kind} />
          ))}
        </datalist>
        <p className={HINT}>{t.kindHint}</p>
      </div>

      <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.84rem] leading-relaxed text-ink-2">
        {t.suggestionsNote}
      </p>

      {/* ---------------------------------------------------------- entity */}
      {linked && picker === null ? (
        /*
         * The role points at a row this form cannot offer as a choice. The two
         * columns travel as hidden fields so that saving an edit cannot quietly
         * demote a linked entity to a typed string — entityOf() in the action
         * rebuilds {kind, id} from exactly these two.
         */
        <div>
          <p className={LABEL}>{t.entityNameLabel}</p>
          <input type="hidden" name="entityKind" value={role.entityKind ?? ''} />
          <input type="hidden" name="entityId" value={role.entityId ?? ''} />
          <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.88rem] text-ink-2">
            <span className="font-bold">{role.entityKind}</span>
          </p>
          <p className={HINT}>{t.entityLinkedNote}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/*
           * The free-text box comes FIRST and is always here. A role for
           * something with no row anywhere — a campaign, a one-off task, a
           * project in a table that does not exist yet — has to stay recordable;
           * see the head of this file and of migration 046.
           */}
          <div>
            <label className={LABEL} htmlFor={`${uid}-entityName`}>
              {t.entityNameLabel}
            </label>
            <input
              id={`${uid}-entityName`}
              name="entityName"
              type="text"
              defaultValue={was('entityName', role?.entityName)}
              className={FIELD}
            />
            <p className={HINT}>{t.entityNameHint}</p>
          </div>

          {picker && (
            <div>
              <label className={LABEL} htmlFor={`${uid}-entityId`}>
                {picker.chooseLabel}
              </label>
              {/*
               * `entityKind` is fixed at 'group' because that is the only table
               * this select names, and chk_vr_entity_resolvable in migration 054
               * refuses an entity_id whose kind resolves to nothing. It posts
               * unconditionally: with the select left on «لا شيء من هذه» the id
               * is empty, and entityOf() in the action reads `kind && id` and
               * falls through to the typed name.
               */}
              <input type="hidden" name="entityKind" value="group" />
              <select
                id={`${uid}-entityId`}
                name="entityId"
                defaultValue={was('entityId', role?.entityId)}
                className={FIELD}
              >
                <option value="">{picker.chooseNone}</option>
                {choices.map((choice) => (
                  <option key={choice.id} value={choice.id}>
                    {choice.label}
                  </option>
                ))}
              </select>
              <p className={HINT}>{picker.chooseHint}</p>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------- dates */}
      {/* One column on a phone, two from `sm` up. Nothing here has a min-width,
          so 375px never produces a horizontal scrollbar. */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor={`${uid}-startedOn`}>
            {t.startLabel}
          </label>
          <input
            id={`${uid}-startedOn`}
            name="startedOn"
            type="date"
            defaultValue={was('startedOn', role?.startedOn)}
            className={FIELD}
          />
          <label className="mt-2 block text-[0.82rem] font-bold text-ink-3" htmlFor={`${uid}-startedPrec`}>
            {t.precisionLabel}
          </label>
          <select
            id={`${uid}-startedPrec`}
            name="startedPrec"
            defaultValue={was('startedPrec', role?.startedPrec) || 'day'}
            className={`${FIELD} mt-1`}
          >
            <option value="day">{t.precision.day}</option>
            <option value="month">{t.precision.month}</option>
            <option value="year">{t.precision.year}</option>
          </select>
        </div>

        <div>
          <label className={LABEL} htmlFor={`${uid}-endedOn`}>
            {t.endLabel}
          </label>
          <input
            id={`${uid}-endedOn`}
            name="endedOn"
            type="date"
            defaultValue={was('endedOn', role?.endedOn)}
            className={FIELD}
          />
          <label className="mt-2 block text-[0.82rem] font-bold text-ink-3" htmlFor={`${uid}-endedPrec`}>
            {t.precisionLabel}
          </label>
          <select
            id={`${uid}-endedPrec`}
            name="endedPrec"
            defaultValue={was('endedPrec', role?.endedPrec) || 'day'}
            className={`${FIELD} mt-1`}
          >
            <option value="day">{t.precision.day}</option>
            <option value="month">{t.precision.month}</option>
            <option value="year">{t.precision.year}</option>
          </select>
        </div>
      </div>
      <p className={HINT}>{t.precisionHint}</p>

      {/* --------------------------------------------------------- current */}
      <div>
        <label className="flex min-h-11 items-center gap-3 text-[0.95rem] font-bold">
          <input
            name="isCurrent"
            type="checkbox"
            value="true"
            defaultChecked={role ? role.isCurrent : true}
            className="h-5 w-5 accent-brand-blue"
          />
          {t.currentLabel}
        </label>
        {/*
         * AFTER the checkbox, and that order is load-bearing.
         *
         * An unticked checkbox posts nothing at all, and updateRoleAction reads
         * a missing `isCurrent` as "leave it alone" — so without this, unticking
         * the box on an edit form would save nothing and the role would stay
         * current. The action reads formData.get(), which returns the FIRST
         * entry in tree order: ticked posts ['true', 'false'] and reads true,
         * unticked posts ['false'] and reads false. Putting this line above the
         * checkbox would make every role past.
         */}
        <input type="hidden" name="isCurrent" value="false" />
        <p className={HINT}>{t.currentHint}</p>
      </div>

      {/* ----------------------------------------------------- description */}
      <div>
        <label className={LABEL} htmlFor={`${uid}-description`}>
          {t.descriptionFieldLabel}
        </label>
        <textarea
          id={`${uid}-description`}
          name="description"
          rows={3}
          defaultValue={was('description', role?.description)}
          className={`${FIELD} leading-relaxed`}
        />
        <p className={HINT}>{t.descriptionHint}</p>
      </div>

      {/* ---------------------------------------------------- achievements */}
      <div>
        <p className={LABEL}>{t.achievementsLabel}</p>
        <p className={HINT}>{t.achievementsHint}</p>

        <ul className="mt-3 space-y-3">
          {rows.map((row, i) => (
            <li key={row.key} className="rounded-xl border border-line bg-surface-2 p-3">
              <p className="mb-2 text-[0.8rem] font-extrabold text-ink-3">
                {t.achievementRow.replace('{n}', String(i + 1))}
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[0.8rem] font-bold text-ink-3">
                    {t.achievementArLabel}
                  </span>
                  <input
                    name="achievementAr"
                    type="text"
                    value={row.ar}
                    onChange={(e) => setRow(row.key, { ar: e.target.value })}
                    className={FIELD}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[0.8rem] font-bold text-ink-3">
                    {t.achievementEnLabel}
                  </span>
                  <input
                    name="achievementEn"
                    type="text"
                    dir="ltr"
                    value={row.en}
                    onChange={(e) => setRow(row.key, { en: e.target.value })}
                    className={`${FIELD} text-start`}
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                className="mt-2 min-h-11 rounded-full px-3 text-[0.85rem] font-bold text-danger-text hover:underline"
              >
                {t.achievementRemove}
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={addRow}
          className="mt-3 min-h-11 rounded-full border border-line bg-surface px-5 text-[0.88rem] font-extrabold text-brand-blue hover:bg-surface-2 dark:text-brand-orange"
        >
          {t.achievementAdd}
        </button>
      </div>

      {/* ------------------------------------------------------ visibility */}
      <div>
        <label className={LABEL} htmlFor={`${uid}-visibility`}>
          {t.visibilityLabel}
        </label>
        <select
          id={`${uid}-visibility`}
          name="visibility"
          defaultValue={was('visibility', role?.visibility) || 'volunteers'}
          className={FIELD}
        >
          {/* The three values migration 046's chk_vr_visibility permits, and
              nothing about what the role is called. */}
          <option value="public">{t.seenBy.public}</option>
          <option value="volunteers">{t.seenBy.volunteers}</option>
          <option value="staff">{t.seenBy.staff}</option>
        </select>
        <p className={HINT}>{t.visibilityHint}</p>
      </div>
    </div>
  );
}
