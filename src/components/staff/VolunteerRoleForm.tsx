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
import type { ProjectAdminStrings } from '@/lib/dictionaries/projects-admin';

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
 * ── FOUR BOXES, AND THEN A `<details>` ─────────────────────────────────────
 *
 * The client looked at this form and said the feature was too complicated. They
 * were right: it asked for the Arabic title, the English title, the kind, the
 * entity, the start date, the start precision, the end date, the end precision,
 * whether it is current, a description, any number of achievements and a
 * visibility — twelve decisions to record the sentence «كانت رئيسة لجنة
 * الإعلام». That is not a form, it is a filing.
 *
 * So the default is now the four things the client actually asked for: the
 * title, whether they still hold it, from, and to. Everything else is inside
 * one collapsed `<details>` labelled «تفاصيل إضافية (اختياري)».
 *
 * NOTHING WAS REMOVED AND NOTHING CHANGED MEANING. Every field still exists,
 * still carries the same `name`, still posts on every submit — a collapsed
 * `<details>` is still in the DOM and its inputs are still in the FormData — and
 * createRoleAction / updateRoleAction read the identical contract they always
 * did. FORM_FIELDS in lib/actions/volunteer-roles.ts is untouched, which is the
 * check to run if this is ever doubted.
 *
 * TWO ORDERING RULES SURVIVE THE MOVE, and both are load-bearing:
 *
 *   The hidden `isCurrent=false` still sits IMMEDIATELY AFTER the checkbox, and
 *   both stayed in the default section together. The action reads
 *   formData.get(), which returns the first entry in tree order; splitting the
 *   pair across the `<details>` boundary, or putting the hidden field above the
 *   box, would make every role current or every role past.
 *
 *   The free-text entity box still comes BEFORE the picker inside the details,
 *   for the reason the next section gives.
 *
 * WHY `<details>` AND NOT STATE. This component is already a client component
 * for three reasons named below, so a `useState` toggle would have cost
 * nothing — and it would still have been the wrong choice. A `<details>` works
 * before hydration, is a disclosure to a screen reader without anybody writing
 * aria-expanded, and cannot get into a state where a field is unmounted and
 * therefore silently not submitted. React's own `<details>` is the whole
 * mechanism; there is no handler on it.
 *
 * ── THE ENTITY PICKER IS AN ADDITION, NEVER A REPLACEMENT ──────────────────
 *
 * Migration 054 made committees and teams rows and migration 055 made projects
 * rows, so a role can now point at either instead of naming it by hand.
 * `entityChoices` is that list — both kinds, under two `<optgroup>` headings —
 * and it is offered BESIDE the free-text box rather than in place of it: both
 * controls are on the form at once, always.
 *
 * That is not a courtesy. Migration 046 keeps entity_kind free text precisely
 * so a role can say it was «لحملة رمضان» when the campaign has no row anywhere;
 * a select would make every one of those unrecordable until somebody shipped a
 * migration, which is the failure this whole feature is arranged against. So:
 * pick a committee, pick a project, type a name, or none of the three. If both
 * a pick and a typed name arrive, entityOf() in the action takes the id,
 * because it is the more specific claim.
 *
 * ── WHY THE TWO KINDS SHARE ONE SELECT ─────────────────────────────────────
 *
 * Because a role has ONE entity, and because the action reads one pair of
 * fields. `entityOf(formData)` calls `formData.get('entityId')`, which returns
 * the FIRST entry in tree order — so two selects both named `entityId` would
 * mean the second one could never be chosen, silently. One select cannot have
 * that bug: the question "what was this attached to?" has one answer box, and
 * the `<optgroup>` headings say which sort each row is.
 *
 * `entityKind` therefore cannot be a fixed `value="group"` any more. It is
 * derived from whichever choice is selected, which is why the selection is held
 * in state. Before hydration the hidden field still carries the kind of the
 * option the server rendered as selected; a selection changed in that window
 * would post a mismatched pair, and the consequence is bounded on purpose — the
 * role is recorded with its title, dates, person and visibility all correct, and
 * a link that resolves on no page, which is the same severity as no link at all.
 * Nothing about anybody's record is corrupted by it.
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
 * One committee, team or project as this form offers it.
 *
 * An id and a name already resolved into the page's language by the server
 * component that renders this — not the OrgGroup or Project row, because
 * lib/org-groups.ts and lib/projects.ts are both 'server-only' and nothing from
 * them may cross into the browser bundle.
 */
export type EntityChoice = {
  /**
   * What `entity_kind` this choice writes: 'group' or 'project'.
   *
   * Carried per choice rather than fixed on the form, because one select now
   * offers both and chk_vr_entity_resolvable (migration 055) refuses an
   * entity_id whose kind resolves to nothing.
   */
  kind: string;
  id: string;
  label: string;
  /** The `<optgroup>` heading this sits under, already in the page's language. */
  section: string;
};

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
  entityChoices,
  entityText,
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
  /**
   * The committees, teams and projects that have rows, offered BESIDE the
   * free-text box — never instead of it.
   */
  entityChoices?: EntityChoice[];
  entityText?: ProjectAdminStrings['roleForm'];
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
        entityChoices={entityChoices}
        entityText={entityText}
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
  entityChoices,
  entityText,
  echoed,
  t,
}: {
  role?: RoleFormValues;
  titleSuggestions: { titleAr: string; titleEn: string }[];
  kindSuggestions: string[];
  entityChoices?: EntityChoice[];
  entityText?: ProjectAdminStrings['roleForm'];
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
   * The entity picker, or nothing.
   *
   * It is offered when there is something to offer AND it can represent
   * whatever this role already points at. A role linked to something the list
   * does not contain — an activity, or a project archived since — keeps the
   * read-only branch below instead, so that saving an edit cannot silently
   * demote a linked entity to a typed string or re-point it at the wrong table.
   *
   * Held as the strings themselves rather than as a boolean, because a boolean
   * would not narrow `entityText` for the JSX that needs its labels.
   */
  const choices = entityChoices ?? [];
  const picker =
    entityText !== undefined &&
    choices.length > 0 &&
    (!linked || choices.some((choice) => choice.id === role?.entityId))
      ? entityText
      : null;

  /*
   * Which row is picked, and therefore which `entity_kind` is posted.
   *
   * State rather than an uncontrolled select, because the hidden `entityKind`
   * beside it has to follow the choice: one select now offers committees and
   * projects, and a fixed kind would file half of them under the wrong table.
   * The initial value is the echoed one if the action refused, then the role's
   * own, then nothing — the same precedence `was()` uses for every other field.
   */
  const [entityId, setEntityId] = useState<string>(
    () => echoed?.entityId ?? role?.entityId ?? '',
  );

  /* '' when nothing is picked, which is exactly what entityOf() in the action
   * needs in order to fall through to the typed name: it reads `kind && id`. */
  const entityKind = choices.find((choice) => choice.id === entityId)?.kind ?? '';

  /* The `<optgroup>`s, in the order the sections first appear in the list. Built
   * from the choices themselves rather than from a fixed pair of arrays, so a
   * third sort of entity arrives here needing nothing but a `section`. */
  const sections: { label: string; choices: EntityChoice[] }[] = [];
  for (const choice of choices) {
    const existing = sections.find((section) => section.label === choice.section);
    if (existing) existing.choices.push(choice);
    else sections.push({ label: choice.section, choices: [choice] });
  }

  /*
   * The details opens itself on an edit that has something in it.
   *
   * Collapsing by default is right for «+ إضافة منصب أو مهمة» — a new role is
   * four boxes and the rest is an offer. It is wrong for a correction: a member
   * of staff who opens a role with a description and three achievements and
   * meets a closed word has been shown less of the record than the timeline
   * above already shows them, and would reasonably conclude the detail was lost.
   *
   * Fully controlled — `open` with `onToggle` — rather than a bare `open`
   * attribute. This component re-renders whenever an achievement row is added
   * or an entity picked, and an uncontrolled `open={true}` would spring the
   * section back open under somebody who had just closed it.
   *
   * The visibility is compared against the column's own default rather than
   * against 'public', so a role somebody deliberately set to staff-only also
   * opens the section that says so.
   */
  const carriesDetail =
    role !== undefined &&
    Boolean(
      role.titleEn.trim() ||
        role.roleType ||
        role.entityName ||
        role.entityId ||
        role.description ||
        role.achievements.length > 0 ||
        role.visibility !== 'volunteers',
    );
  const [detailOpen, setDetailOpen] = useState(carriesDetail);

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
      {/* ==================================================================
          THE FOUR. What it is called, whether they still hold it, from, to.
          ================================================================== */}

      {/* ----------------------------------------------------------- title */}
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
         *
         * The pair also stays OUT of the `<details>` below, and together. It is
         * one of the four the client asked for, and splitting the two halves
         * across a disclosure boundary would reorder the FormData entries.
         */}
        <input type="hidden" name="isCurrent" value="false" />
        <p className={HINT}>{t.currentHint}</p>
      </div>

      {/* ----------------------------------------------------------- dates */}
      {/* One column on a phone, two from `sm` up. Nothing here has a min-width,
          so 375px never produces a horizontal scrollbar.

          The two precision selects used to sit under these boxes, one each. They
          are inside the details now: «ما تعرفه من التاريخ» is a real question
          and it is not one of the four, and asking it twice before the form has
          even been saved once is most of why this screen felt like paperwork.
          They still post, still default to 'day', and still mean exactly what
          they meant. */}
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
        </div>
      </div>

      {/* ==================================================================
          EVERYTHING ELSE. Collapsed, never removed — see the head of this
          file. A closed `<details>` is still in the DOM, so every field below
          is still in the FormData on every submit and the actions read the
          contract they always did.
          ================================================================== */}
      <details
        open={detailOpen}
        onToggle={(e) => setDetailOpen(e.currentTarget.open)}
        className="rounded-2xl border border-line bg-surface-2 px-4 py-3.5 sm:px-5"
      >
        <summary className="min-h-11 cursor-pointer select-none py-2 text-[0.92rem] font-extrabold">
          {t.moreDetail}
        </summary>

        <div className="mt-3 space-y-5 border-t border-line pt-4">
          <p className="text-[0.84rem] leading-relaxed text-ink-2">{t.moreDetailHint}</p>

          {/* ------------------------------------------------ English title */}
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

          {/* -------------------------------------------------------- kind */}
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

          <p className="rounded-xl border border-line bg-surface px-4 py-3 text-[0.84rem] leading-relaxed text-ink-2">
            {t.suggestionsNote}
          </p>

          {/* ------------------------------------------------------ entity */}
          {linked && picker === null ? (
            /*
             * The role points at a row this form cannot offer as a choice. The
             * two columns travel as hidden fields so that saving an edit cannot
             * quietly demote a linked entity to a typed string — entityOf() in
             * the action rebuilds {kind, id} from exactly these two. They are
             * inside the collapsed section and still post, which is the whole
             * reason this is a `<details>` and not conditional rendering.
             */
            <div>
              <p className={LABEL}>{t.entityNameLabel}</p>
              <input type="hidden" name="entityKind" value={role.entityKind ?? ''} />
              <input type="hidden" name="entityId" value={role.entityId ?? ''} />
              <p className="rounded-xl border border-line bg-surface px-4 py-3 text-[0.88rem] text-ink-2">
                <span className="font-bold">{role.entityKind}</span>
              </p>
              <p className={HINT}>{t.entityLinkedNote}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/*
               * The free-text box comes FIRST and is always here. A role for
               * something with no row anywhere — a campaign, a one-off task, a
               * project in a table that does not exist yet — has to stay
               * recordable; see the head of this file and of migration 046.
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

              {/*
               * And the picker only when there is something in it.
               *
               * `picker` is already null when `choices` is empty, so an
               * association that has recorded no committee, no team and no
               * project sees the free-text box and nothing else — no select
               * offering «لا شيء من هذه» and nothing else, which is a control
               * that asks a question with one answer. The `<optgroup>`s are
               * built from the choices themselves, so a groups table with no
               * rows produces no «اللجان والفرق» heading either, rather than an
               * empty one. Both of those are properties of the data flow above
               * rather than of a flag somebody has to remember to set.
               */}
              {picker && (
                <div>
                  <label className={LABEL} htmlFor={`${uid}-entityId`}>
                    {picker.chooseLabel}
                  </label>
                  {/*
                   * `entityKind` follows the selection instead of being fixed,
                   * and chk_vr_entity_resolvable in migration 055 is why it has
                   * to: it permits 'group', 'activity' and 'project', and a
                   * project id filed as a group is a pointer that resolves on no
                   * page.
                   *
                   * It posts unconditionally: with the select left on «لا شيء من
                   * هذه» the id is '' and the kind is '', and entityOf() in the
                   * action reads `kind && id` and falls through to the typed
                   * name.
                   */}
                  <input type="hidden" name="entityKind" value={entityKind} />
                  <select
                    id={`${uid}-entityId`}
                    name="entityId"
                    value={entityId}
                    onChange={(e) => setEntityId(e.target.value)}
                    className={FIELD}
                  >
                    <option value="">{picker.chooseNone}</option>
                    {/* Two headings — «اللجان والفرق» and «المشاريع» — inside one
                        answer box, because a role has one entity. */}
                    {sections.map((section) => (
                      <optgroup key={section.label} label={section.label}>
                        {section.choices.map((choice) => (
                          <option key={choice.id} value={choice.id}>
                            {choice.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <p className={HINT}>{picker.chooseHint}</p>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------- precisions */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor={`${uid}-startedPrec`}>
                {t.startLabel} — {t.precisionLabel}
              </label>
              <select
                id={`${uid}-startedPrec`}
                name="startedPrec"
                defaultValue={was('startedPrec', role?.startedPrec) || 'day'}
                className={FIELD}
              >
                <option value="day">{t.precision.day}</option>
                <option value="month">{t.precision.month}</option>
                <option value="year">{t.precision.year}</option>
              </select>
            </div>

            <div>
              <label className={LABEL} htmlFor={`${uid}-endedPrec`}>
                {t.endLabel} — {t.precisionLabel}
              </label>
              <select
                id={`${uid}-endedPrec`}
                name="endedPrec"
                defaultValue={was('endedPrec', role?.endedPrec) || 'day'}
                className={FIELD}
              >
                <option value="day">{t.precision.day}</option>
                <option value="month">{t.precision.month}</option>
                <option value="year">{t.precision.year}</option>
              </select>
            </div>
          </div>
          <p className={HINT}>{t.precisionHint}</p>

          {/* ------------------------------------------------- description */}
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

          {/* ------------------------------------------------ achievements */}
          <div>
            <p className={LABEL}>{t.achievementsLabel}</p>
            <p className={HINT}>{t.achievementsHint}</p>

            <ul className="mt-3 space-y-3">
              {rows.map((row, i) => (
                <li key={row.key} className="rounded-xl border border-line bg-surface p-3">
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
              className="mt-3 min-h-11 rounded-full border border-line bg-surface px-5 text-[0.88rem] font-extrabold text-brand-blue hover:bg-ground dark:text-brand-orange"
            >
              {t.achievementAdd}
            </button>
          </div>

          {/* -------------------------------------------------- visibility */}
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
      </details>
    </div>
  );
}
