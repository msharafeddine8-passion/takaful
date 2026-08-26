import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
import { formatRolePeriod } from '@/lib/volunteer-role-view';
import type { VolunteerRole } from '@/lib/volunteer-roles';
import {
  archiveRoleAction,
  endRoleAction,
  restoreRoleAction,
} from '@/lib/actions/volunteer-roles';
import type { VolunteerRoleStrings } from '@/lib/dictionaries/volunteer-roles';
import type { ProjectAdminStrings } from '@/lib/dictionaries/projects-admin';
import { VolunteerRoleForm, type EntityChoice, type RoleFormValues } from './VolunteerRoleForm';

/**
 * «المناصب والمهام» on a member's page: the timeline, and the four things an
 * administrator can do to it.
 *
 * A SERVER COMPONENT, and everything on it except the add/edit form is a plain
 * `<form action={serverAction}>` — ending a role, archiving one, restoring one.
 * The disclosures are `<details>` elements, so opening the archive drawer or an
 * edit panel costs no JavaScript at all and works before hydration. Only
 * VolunteerRoleForm crosses the boundary, and the head of that file says why.
 *
 * ── NOTHING HERE DERIVES A DATE, AN ORDER OR A VISIBILITY ──────────────────
 *
 * The period is `formatRolePeriod`, which slices text and never builds a Date —
 * the association is in Beirut, the session runs GMT, and a role starting
 * 2025-01-01 reads as كانون الأول ٢٠٢٤ the moment anything constructs one. The
 * ordering is the one `rolesFor` already applied (current first, then newest
 * start, nulls last), matching idx_vr_person; re-sorting the array here would
 * be a second statement of the rule that could drift from the index. The
 * visibility filter was applied by the query against `visibleTo(viewer)`.
 *
 * ── THE CONTROLS ARE HIDDEN, AND THAT IS NOT THE CHECK ─────────────────────
 *
 * `canManage` decides whether the buttons render, so the screen is honest about
 * what it offers rather than showing controls that could only fail. It is NOT
 * the permission check: every action asserts members.manage against the session
 * before it reads a field, and the archive constraint and the delete trigger sit
 * behind that. Hiding a button here changes what is on the page and nothing
 * about what the server will accept.
 *
 * ── MOBILE FIRST ──────────────────────────────────────────────────────────
 *
 * The client's section 53 names this screen. Every row is a single column at
 * 375px and splits into two only from `sm` up; nothing carries a min-width, so
 * the page itself never scrolls sideways. Long free text — a title somebody
 * pasted, an entity name — is wrapped rather than clipped. Every control is
 * `min-h-11`, which is 44px.
 */

/*
 * A <summary> styled as a pill.
 *
 * `inline-flex` is what removes the disclosure triangle: a summary is a
 * list-item by default and stops being one the moment its display changes, in
 * every engine including the WebKit one that ignores `list-style: none` here.
 * `list-none` stays as the declaration of intent for anything that keeps the
 * list-item box.
 */
const PILL =
  'inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line' +
  ' bg-surface-2 px-4 text-[0.88rem] font-extrabold text-ink-2 transition-colors hover:bg-surface';

const FIELD =
  'min-h-11 w-full rounded-xl border border-line bg-ground px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue';

/** The title in the page's language, falling back to the Arabic. */
function titleOf(role: VolunteerRole, lang: Locale): string {
  if (lang === 'ar') return role.titleAr;
  return role.titleEn.trim() || role.titleAr;
}

/** One achievement in the page's language, falling back to the other. */
function lineOf(item: { ar: string; en: string }, lang: Locale): string {
  return lang === 'ar' ? item.ar || item.en : item.en || item.ar;
}

/**
 * What a role was attached to, as one readable string.
 *
 * A role that points at a row shows that row's NAME when the page could resolve
 * one — migration 054 made committees and teams rows and migration 055 made
 * projects rows, so «لجنة الإعلام» and «مسارك» are both available where only
 * the words «group» and «project» used to be. Anything else still falls back to
 * the kind: an activity has no list passed to this page, and a bare UUID on a
 * profile is noise that looks like data.
 */
function entityOf(role: VolunteerRole, names: Map<string, string>): string | null {
  const entity = role.entity;
  if (!entity) return null;
  if ('name' in entity) return entity.name;
  return names.get(entity.id) ?? entity.kind ?? null;
}

/** The three entity columns, from the union, for the edit form. */
function toFormValues(role: VolunteerRole): RoleFormValues {
  const entity = role.entity;
  const linked = entity !== null && 'id' in entity;
  return {
    id: role.id,
    titleAr: role.titleAr,
    titleEn: role.titleEn,
    roleType: role.roleType,
    entityKind: linked ? entity.kind : null,
    entityId: linked ? entity.id : null,
    entityName: entity !== null && 'name' in entity ? entity.name : null,
    startedOn: role.startedOn,
    startedPrec: role.startedPrec,
    endedOn: role.endedOn,
    endedPrec: role.endedPrec,
    isCurrent: role.isCurrent,
    description: role.description,
    achievements: role.achievements.map((a) => ({ ar: a.ar, en: a.en })),
    visibility: role.visibility,
  };
}

/** One archived row, with the two facts that only matter once it is archived. */
export type ArchivedRole = {
  role: VolunteerRole;
  /** Required from migration 050 on; null only for rows archived before it. */
  reason: string | null;
  /** 'YYYY-MM-DD' in Beirut, as text. Never a Date. */
  archivedOn: string;
};

function Disclosure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details>
      <summary className={PILL}>{label}</summary>
      {/* p-3 on a phone: this box is already inside the card's own p-4, and two
          16px insets stacked leave a 375px screen with very little middle. */}
      <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">{children}</div>
    </details>
  );
}

function PrecisionSelect({
  id,
  name,
  t,
}: {
  id: string;
  name: string;
  t: VolunteerRoleStrings;
}) {
  return (
    <select id={id} name={name} defaultValue="day" className={FIELD}>
      <option value="day">{t.precision.day}</option>
      <option value="month">{t.precision.month}</option>
      <option value="year">{t.precision.year}</option>
    </select>
  );
}

export function VolunteerRoles({
  lang,
  userId,
  roles,
  archived,
  titleSuggestions,
  kindSuggestions,
  entityChoices,
  entityText,
  canManage,
  t,
}: {
  lang: Locale;
  userId: string;
  /** Already ordered and already filtered by `rolesFor`. Not re-sorted here. */
  roles: VolunteerRole[];
  archived: ArchivedRole[];
  titleSuggestions: { titleAr: string; titleEn: string }[];
  kindSuggestions: string[];
  /**
   * The committees, teams and projects that have rows, with their names already
   * in this page's language. Offered by the form BESIDE the free-text box, never
   * in place of it, and used here to print a linked role's entity as a name.
   */
  entityChoices: EntityChoice[];
  entityText: ProjectAdminStrings['roleForm'];
  canManage: boolean;
  t: VolunteerRoleStrings;
}) {
  /* Built once for the whole list rather than searched per row: a volunteer
   * with nine roles would otherwise scan the list nine times. Ids from the two
   * tables share one map safely because they are UUIDs. */
  const entityNames = new Map(entityChoices.map((choice) => [choice.id, choice.label]));

  return (
    <section className="mt-10">
      <h2 className="text-[1.1rem] font-extrabold">{t.sectionTitle}</h2>
      <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-ink-2">{t.lede}</p>

      {canManage ? (
        <details className="mt-4">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-full bg-brand-orange px-5 text-[0.92rem] font-extrabold text-brand-orange-ink transition-colors hover:bg-brand-orange-dark">
            {t.addCta}
          </summary>
          <div className="mt-4 rounded-2xl border border-line bg-surface p-4 sm:p-6">
            <h3 className="mb-4 text-[1rem] font-extrabold">{t.addHeading}</h3>
            <VolunteerRoleForm
              lang={lang}
              userId={userId}
              titleSuggestions={titleSuggestions}
              kindSuggestions={kindSuggestions}
              entityChoices={entityChoices}
              entityText={entityText}
              t={t}
            />
          </div>
        </details>
      ) : (
        <p className="mt-4 text-[0.88rem] text-ink-3">{t.readOnly}</p>
      )}

      {roles.length === 0 ? (
        <p className="mt-5 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {t.empty}
        </p>
      ) : (
        <ol className="mt-5 space-y-4">
          {roles.map((role) => {
            const attachedTo = entityOf(role, entityNames);
            return (
            <li
              key={role.id}
              /* The start-side rule is the only thing separating a role somebody
                 holds now from one they held. `border-s-*` and not `border-l-*`,
                 so it lands on the right in Arabic and the left in English. */
              className={`rounded-2xl border border-line bg-surface p-4 sm:p-5 ${
                role.isCurrent ? 'border-s-4 border-s-brand-orange' : ''
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
                <h3 className="text-[1.02rem] font-extrabold break-words">
                  {titleOf(role, lang)}
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-[0.78rem] font-extrabold ${
                    role.isCurrent
                      ? 'bg-brand-orange/15 text-brand-orange-text dark:text-brand-orange'
                      : 'bg-surface-2 text-ink-3'
                  }`}
                >
                  {role.isCurrent ? t.currentBadge : t.pastBadge}
                </span>
              </div>

              {/* «من كانون الثاني ٢٠٢٥ حتى الآن» / 'January 2025 – present'.
                  Built by formatRolePeriod from text, never from a Date. */}
              <p className="mt-1.5 text-[0.92rem] font-bold text-ink-2">
                {formatRolePeriod(role, lang)}
              </p>

              {(role.roleType || attachedTo) && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {role.roleType && (
                    <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.8rem] font-bold text-ink-2">
                      {t.typeLabel}: {role.roleType}
                    </span>
                  )}
                  {attachedTo && (
                    <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.8rem] font-bold text-ink-2 break-words">
                      {t.entityLabel}: {attachedTo}
                    </span>
                  )}
                </div>
              )}

              {role.description && (
                <p className="mt-3 whitespace-pre-line text-[0.93rem] leading-relaxed text-ink-2">
                  {role.description}
                </p>
              )}

              {role.achievements.length > 0 && (
                <>
                  <p className="mt-4 text-[0.8rem] font-extrabold text-ink-3">
                    {t.achievementsHeading}
                  </p>
                  <ul className="mt-1.5 space-y-1.5 text-[0.92rem] text-ink-2">
                    {role.achievements.map((a, i) => (
                      /* Keyed by index: the list is read-only here, never
                         reordered and never filtered in place, and an
                         achievement has no id of its own — the column is a JSONB
                         array, deliberately (migration 046). */
                      <li key={i} className="flex gap-2">
                        <span aria-hidden="true" className="font-bold text-ink-3">
                          ·
                        </span>
                        <span className="break-words">{lineOf(a, lang)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <p className="mt-3 text-[0.8rem] text-ink-3">
                {t.seenByLabel}: {t.seenBy[role.visibility]}
                {' · '}
                {/* Already 'YYYY-MM-DD' in Beirut, as text from the query. */}
                <span dir="ltr">{t.recordedOn.replace('{date}', role.createdOn)}</span>
              </p>

              {canManage && (
                <div className="mt-4 space-y-2 border-t border-line pt-4">
                  <Disclosure label={t.editCta}>
                    <h4 className="mb-4 text-[0.95rem] font-extrabold">{t.editHeading}</h4>
                    <VolunteerRoleForm
                      lang={lang}
                      userId={userId}
                      role={toFormValues(role)}
                      titleSuggestions={titleSuggestions}
                      kindSuggestions={kindSuggestions}
                      entityChoices={entityChoices}
                      entityText={entityText}
                      t={t}
                    />
                  </Disclosure>

                  {/* Only for a role somebody still holds. Ending a past role is
                      a control that could do nothing, so it is not offered. */}
                  {role.isCurrent && (
                    <Disclosure label={t.endCta}>
                      <h4 className="text-[0.95rem] font-extrabold">{t.endHeading}</h4>
                      <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-2">{t.endNote}</p>
                      <form action={endRoleAction} className="mt-4">
                        <input type="hidden" name="lang" value={lang} />
                        <input type="hidden" name="roleId" value={role.id} />

                        <label
                          className="mb-1.5 block text-[0.88rem] font-bold"
                          htmlFor={`end-date-${role.id}`}
                        >
                          {t.endDateLabel}
                        </label>
                        <input
                          id={`end-date-${role.id}`}
                          name="endedOn"
                          type="date"
                          className={FIELD}
                        />
                        <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-3">
                          {t.endDateNote}
                        </p>

                        <label
                          className="mt-3 mb-1.5 block text-[0.88rem] font-bold"
                          htmlFor={`end-prec-${role.id}`}
                        >
                          {t.endPrecisionLabel}
                        </label>
                        <PrecisionSelect
                          id={`end-prec-${role.id}`}
                          name="endedPrec"
                          t={t}
                        />

                        <button
                          type="submit"
                          className="mt-4 min-h-11 w-full rounded-full border-2 border-brand-blue px-6 text-[0.9rem] font-extrabold text-brand-blue transition-colors hover:bg-brand-blue/10 sm:w-auto dark:border-brand-orange dark:text-brand-orange"
                        >
                          {t.endSubmit}
                        </button>
                      </form>
                    </Disclosure>
                  )}

                  <Disclosure label={t.archiveCta}>
                    <ArchiveForm lang={lang} roleId={role.id} t={t} />
                  </Disclosure>
                </div>
              )}
            </li>
            );
          })}
        </ol>
      )}

      {/*
       * Archived rows: kept, hidden by default, one tap from being visible and
       * one more from being back on the profile. The database refuses a DELETE
       * outright (trg_volunteer_roles_no_delete), so nothing in this drawer is
       * ever the last copy of anything.
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
            {archived.map(({ role, reason, archivedOn }) => (
              <li key={role.id} className="rounded-2xl border border-line bg-surface-2 p-4">
                <p className="text-[0.98rem] font-extrabold text-ink-2 break-words">
                  {titleOf(role, lang)}
                </p>
                <p className="mt-1 text-[0.88rem] text-ink-3">{formatRolePeriod(role, lang)}</p>
                <p className="mt-1 text-[0.82rem] text-ink-3" dir="ltr">
                  {t.archivedOn.replace('{date}', archivedOn)}
                </p>
                <p className="mt-2 text-[0.88rem] text-ink-2">
                  {reason
                    ? `${t.archivedReason}: ${reason}`
                    : t.archivedNoReason}
                </p>
                {canManage && (
                  <form action={restoreRoleAction} className="mt-3">
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="roleId" value={role.id} />
                    <button
                      type="submit"
                      className="min-h-11 w-full rounded-full border border-line bg-surface px-5 text-[0.88rem] font-extrabold text-brand-blue transition-colors hover:bg-surface-2 sm:w-auto dark:text-brand-orange"
                    >
                      {t.restore}
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}

/**
 * Why a role is being taken off the profile — in one tap, or in a sentence.
 *
 * ── THE THREE BUTTONS ARE THE FEATURE ──────────────────────────────────────
 *
 * Migration 050 made a reason mandatory, and the counter-argument was real: an
 * administrator asked to write an essay leaves the wrong role sitting on
 * somebody's profile instead. So the three ordinary reasons are one tap each
 * and the free field is for everything else. A reason always, an essay never.
 *
 * ── HOW ONE `reason` FIELD SERVES BOTH, WITH NO JAVASCRIPT ─────────────────
 *
 * archiveRoleAction reads `formData.get('reason')`, which is the FIRST entry
 * with that name in tree order. The three buttons carry `name="reason"` and sit
 * ABOVE the text input, so tapping one wins over whatever is (or is not) in the
 * box. The final button carries no name at all, so pressing it leaves the typed
 * text as the only `reason` entry.
 *
 * That ordering is load-bearing, and so is `formNoValidate` on the three: the
 * text input is `required` — which is what stops the free path submitting an
 * empty reason the action would refuse in silence — and without the attribute
 * the browser would block the one-tap path on an empty box it is not using.
 */
function ArchiveForm({
  lang,
  roleId,
  t,
}: {
  lang: Locale;
  roleId: string;
  t: VolunteerRoleStrings;
}) {
  const reasons = [t.reasonMistake, t.reasonWrongPerson, t.reasonDuplicate];

  return (
    <form action={archiveRoleAction}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="roleId" value={roleId} />

      <h4 className="text-[0.95rem] font-extrabold">{t.archiveHeading}</h4>
      <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-2">{t.archiveNote}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {reasons.map((reason) => (
          <button
            key={reason}
            type="submit"
            name="reason"
            value={reason}
            formNoValidate
            /* Full width on a phone, so «انضاف بالخطأ» is a 44px-tall bar
               across the screen rather than three pills fighting for 270px. */
            className="min-h-11 w-full rounded-full border-2 border-warn px-4 text-[0.88rem] font-extrabold text-warn-text transition-colors hover:bg-warn/10 sm:w-auto sm:flex-1"
          >
            {reason}
          </button>
        ))}
      </div>

      <label className="mt-4 mb-1.5 block text-[0.88rem] font-bold" htmlFor={`why-${roleId}`}>
        {t.reasonOtherLabel}
      </label>
      <input
        id={`why-${roleId}`}
        name="reason"
        type="text"
        required
        minLength={2}
        placeholder={t.reasonOtherPlaceholder}
        className={FIELD}
      />
      <button
        type="submit"
        className="mt-3 min-h-11 w-full rounded-full bg-danger px-6 text-[0.9rem] font-extrabold text-white transition-opacity hover:opacity-90 sm:w-auto"
      >
        {t.archiveSubmit}
      </button>
    </form>
  );
}
