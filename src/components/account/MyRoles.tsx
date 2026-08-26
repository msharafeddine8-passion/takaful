import Link from 'next/link';
import { Arrow } from '@/components/ui';
import type { Locale } from '@/lib/i18n';
import { formatRolePeriod } from '@/lib/volunteer-role-view';
import type { VolunteerRole } from '@/lib/volunteer-roles';
import type { VolunteerRoleStrings } from '@/lib/dictionaries/volunteer-roles';

/**
 * «مهامي ومناصبي» — the same rows as components/staff/VolunteerRoles.tsx, seen
 * from the other side.
 *
 * The administrator's timeline is a working surface: it carries an add form, an
 * edit panel, an end-this-role form, an archive form and a drawer of archived
 * rows. This carries none of them, because a volunteer does not appoint
 * themselves. What is left is the record itself, in the same shapes and with
 * the same start-side rule marking a role somebody still holds — so that
 * somebody who has seen their record on a staff screen recognises it here.
 *
 * SERVER COMPONENTS, both of them. There is nothing to interact with: no form,
 * no disclosure, no state. A 'use client' on either would ship the whole
 * timeline to the browser to render text that never changes.
 *
 * ── NOTHING HERE DERIVES A DATE, AN ORDER OR A VISIBILITY ──────────────────
 *
 * The period is formatRolePeriod, which slices 'YYYY-MM-DD' as text and never
 * builds a Date — the association is in Beirut, the session runs GMT, and a
 * role starting 2025-01-01 reads as كانون الأول ٢٠٢٤ the moment anything
 * constructs one. «حتى الآن» / 'present' comes out of that same function, so a
 * current role cannot print an end date here even from a hand-edited row.
 *
 * The ordering is the one rolesFor already applied — current first, then newest
 * start, nulls last, matching idx_vr_person. `MyRolesTimeline` splits the list
 * under two headings with `filter` and NEVER with `sort`: filtering a list on
 * `isCurrent` and concatenating the halves reproduces the query's own sequence
 * exactly, because is_current DESC is already its first ordering term. A sort
 * here would be a second statement of the rule, free to drift from the index.
 *
 * The visibility filter was applied by the query, against visibleTo(viewer).
 * Neither component takes a viewer and neither compares a visibility to decide
 * whether to render a row: by the time a role reaches this file the question
 * has been answered, and answering it twice is how the two answers disagree.
 *
 * ── MOBILE FIRST ──────────────────────────────────────────────────────────
 *
 * Single column at 375px throughout. No min-width anywhere, so the page never
 * scrolls sideways; free text a member of staff typed — a long title, a pasted
 * entity name — wraps rather than clipping. Every link is `min-h-11`, 44px.
 */

/**
 * The title in the page's language, falling back to the Arabic.
 *
 * The same three lines as titleOf() in components/staff/VolunteerRoles.tsx, and
 * deliberately a copy rather than an import: nothing volunteer-facing should
 * have to reach into the staff tree to render, and the fallback is one branch
 * whose behaviour is fixed by the column's own default (title_en is '' and
 * never null — see toRole in lib/volunteer-roles.ts).
 */
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
 * A role pointing at a row shows its KIND and not its id, exactly as the staff
 * timeline does: committees, teams and projects do not all exist as tables yet
 * (migration 046), so there is nothing to join for a name, and a bare UUID on
 * somebody's own record is noise that looks like data.
 */
function entityOf(role: VolunteerRole): string | null {
  const entity = role.entity;
  if (!entity) return null;
  return 'name' in entity ? entity.name : entity.kind || null;
}

/** The chips under the title: the kind, and the thing it was attached to. */
function RoleTags({
  role,
  t,
}: {
  role: VolunteerRole;
  t: VolunteerRoleStrings;
}) {
  const attachedTo = entityOf(role);
  if (!role.roleType && !attachedTo) return null;
  return (
    <div className="mt-2.5 flex flex-wrap gap-2">
      {role.roleType && (
        <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.8rem] font-bold text-ink-2 break-words">
          {t.typeLabel}: {role.roleType}
        </span>
      )}
      {attachedTo && (
        <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.8rem] font-bold text-ink-2 break-words">
          {t.entityLabel}: {attachedTo}
        </span>
      )}
    </div>
  );
}

/**
 * One entry on the volunteer's own timeline.
 *
 * Everything the brief asks for and in the order somebody reads it: the title,
 * the period, the kind, what it was attached to, what the role involved, and
 * what was achieved in it.
 *
 * `seenByLabel` is shown here and nowhere else in this file. A volunteer has a
 * real use for it — «الجميع، حتى من خارج المنصّة» beside a line is how they
 * find out that a role of theirs is on the open web — and the dashboard panel
 * has no room for it. It is the role's own setting being read back to the
 * person it is about, not a control: changing it is an administrator's action
 * and there is no button for it here.
 */
function RoleEntry({
  role,
  lang,
  t,
}: {
  role: VolunteerRole;
  lang: Locale;
  t: VolunteerRoleStrings;
}) {
  return (
    <li
      /* The start-side rule is the only thing separating a role somebody holds
         now from one they held — the same mark as the staff timeline, so the
         two screens agree about which of these is live. `border-s-*` and never
         `border-l-*`, so it lands on the right in Arabic and the left in
         English. */
      className={`rounded-2xl border border-line bg-surface p-4 sm:p-5 ${
        role.isCurrent ? 'border-s-4 border-s-brand-orange' : ''
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
        <h3 className="text-[1.02rem] font-extrabold break-words">{titleOf(role, lang)}</h3>
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

      {/* «من كانون الثاني ٢٠٢٥ حتى الآن» / 'January 2025 – present'. Built by
          formatRolePeriod from text, never from a Date. */}
      <p className="mt-1.5 text-[0.92rem] font-bold text-ink-2">{formatRolePeriod(role, lang)}</p>

      <RoleTags role={role} t={t} />

      {role.description && (
        <p className="mt-3 whitespace-pre-line text-[0.93rem] leading-relaxed text-ink-2">
          {role.description}
        </p>
      )}

      {role.achievements.length > 0 && (
        <>
          <p className="mt-4 text-[0.8rem] font-extrabold text-ink-3">{t.achievementsHeading}</p>
          <ul className="mt-1.5 space-y-1.5 text-[0.92rem] text-ink-2">
            {role.achievements.map((a, i) => (
              /* Keyed by index: the list is read-only, never reordered and
                 never filtered in place, and an achievement has no id of its
                 own — the column is a JSONB array, deliberately (046). */
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
      </p>
    </li>
  );
}

/**
 * The whole record, under two headings.
 *
 * The headings are the reason this is not one flat list: «ما أشغله الآن» and
 * «ما شغلته سابقاً» are the two questions a volunteer opens this page with, and
 * a single stream of cards makes them count badges to answer either one.
 *
 * `filter`, twice, and no sort anywhere — see the header. Concatenating the two
 * halves in this order yields the exact sequence rolesFor returned.
 */
export function MyRolesTimeline({
  roles,
  lang,
  t,
}: {
  /** Already ordered and already filtered by rolesFor. Not re-sorted here. */
  roles: VolunteerRole[];
  lang: Locale;
  t: VolunteerRoleStrings;
}) {
  const current = roles.filter((role) => role.isCurrent);
  const past = roles.filter((role) => !role.isCurrent);

  if (roles.length === 0) {
    return (
      <p className="mt-8 max-w-[62ch] rounded-2xl border border-line bg-surface px-5 py-5 text-[1rem] leading-relaxed text-ink-2">
        {t.mine.pageEmpty}
      </p>
    );
  }

  return (
    <>
      {current.length > 0 && (
        <section className="mt-9">
          <h2 className="text-[0.82rem] font-extrabold tracking-[0.12em] text-ink-3">
            {t.mine.currentHeading}
          </h2>
          <ol className="mt-3 space-y-4">
            {current.map((role) => (
              <RoleEntry key={role.id} role={role} lang={lang} t={t} />
            ))}
          </ol>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-9">
          <h2 className="text-[0.82rem] font-extrabold tracking-[0.12em] text-ink-3">
            {t.mine.pastHeading}
          </h2>
          <ol className="mt-3 space-y-4">
            {past.map((role) => (
              <RoleEntry key={role.id} role={role} lang={lang} t={t} />
            ))}
          </ol>
        </section>
      )}
    </>
  );
}

/**
 * The dashboard panel: what they hold NOW, and a way to the rest.
 *
 * Short on purpose. This sits among the impact tiles and the shared challenge
 * on a page somebody opens to find out what to do next, so it shows the current
 * roles and stops; the past ones are one tap away and belong to a different
 * question.
 *
 * ── THREE STATES, AND THE MIDDLE ONE IS THE POINT ─────────────────────────
 *
 * Nothing ever recorded is not the same fact as nothing held right now, and the
 * client's section 58 rules out answering either with a zero. So:
 *
 *   no roles at all      → a sentence naming what would put a line here, and
 *                          NO link, because a link to an empty page is a
 *                          second way of saying the same nothing;
 *   none current, some
 *   in the past          → says so, and keeps the link — their record exists
 *                          and telling them it does not would be false;
 *   holding something    → the list, and the link.
 */
export function MyRolesPanel({
  roles,
  lang,
  t,
}: {
  /** ALL of the viewer's readable roles, ordered by rolesFor. Filtered here. */
  roles: VolunteerRole[];
  lang: Locale;
  t: VolunteerRoleStrings;
}) {
  const current = roles.filter((role) => role.isCurrent);
  const hasRecord = roles.length > 0;

  return (
    <section className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-[1.05rem] font-extrabold">{t.mine.panelTitle}</h2>
        {hasRecord && (
          <Link
            href={`/${lang}/account/roles` as Parameters<typeof Link>[0]['href']}
            className="inline-flex min-h-11 items-center text-[0.9rem] font-extrabold text-brand-blue hover:underline dark:text-brand-orange"
          >
            {t.mine.seeAll}
            {/* U+2192 does not mirror under dir="rtl": <Arrow> picks per locale. */}
            <Arrow lang={lang} />
          </Link>
        )}
      </div>

      {current.length === 0 ? (
        <p className="mt-1.5 max-w-[62ch] text-[0.95rem] leading-relaxed text-ink-2">
          {hasRecord ? t.mine.panelNoneCurrent : t.mine.panelEmpty}
        </p>
      ) : (
        <>
          <p className="mt-1 text-[0.88rem] text-ink-3">{t.mine.panelLede}</p>
          <ul className="mt-3.5 space-y-3">
            {current.map((role) => {
              const attachedTo = entityOf(role);
              return (
                <li
                  key={role.id}
                  className="rounded-xl border border-line border-s-4 border-s-brand-orange bg-surface-2 px-4 py-3"
                >
                  <p className="text-[0.98rem] font-extrabold break-words">
                    {titleOf(role, lang)}
                  </p>
                  {/* «من كانون الثاني ٢٠٢٥ حتى الآن». Text in, text out. */}
                  <p className="mt-0.5 text-[0.86rem] font-bold text-ink-2">
                    {formatRolePeriod(role, lang)}
                  </p>
                  {attachedTo && (
                    <p className="mt-0.5 text-[0.82rem] text-ink-3 break-words">
                      {t.entityLabel}: {attachedTo}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
