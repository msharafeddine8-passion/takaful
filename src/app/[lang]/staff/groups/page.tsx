import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured, query } from '@/lib/db';
import { groupName, groups, type OrgGroup } from '@/lib/org-groups';
import {
  archiveGroupAction,
  createGroupAction,
  setGroupActiveAction,
  updateGroupAction,
} from '@/lib/actions/org-groups';
import { orgGroups, isGroupError, type OrgGroupStrings } from '@/lib/dictionaries/org-groups';

/**
 * «اللجان والفرق»: the committees and teams the association divides its work
 * into, and the four things an administrator can do to one.
 *
 * ── A SERVER COMPONENT, ALL THE WAY DOWN ──────────────────────────────────
 *
 * There is no client component in this feature. Every control is a plain
 * `<form action={serverAction}>` and every panel is a `<details>`, so opening
 * the add form, editing a group, concluding one or archiving one costs no
 * JavaScript at all and works before hydration.
 *
 * The one thing a server-only form normally cannot do is show WHY a write was
 * refused, and this feature has a refusal an administrator can genuinely hit —
 * choosing a parent that would close a loop. So the actions redirect back with
 * `?error=…` and the banner below renders the sentence. That is why this page
 * reads searchParams at all.
 *
 * ── WHAT THIS PAGE DOES NOT DO ────────────────────────────────────────────
 *
 * It does not count anybody. There is no "12 members" on a card, no ordering by
 * how many volunteers a committee has, and no figure anywhere that could be
 * compared between two groups — the query behind it produces none. Membership
 * is a `volunteer_roles` row and this page never reads one; the group's own
 * page does, to show the record.
 *
 * It also offers no delete. trg_org_groups_no_delete refuses one outright,
 * because roles point at these rows and those roles are people's records.
 *
 * ── MOBILE FIRST ──────────────────────────────────────────────────────────
 *
 * One column at 375px, splitting at `sm`. Nothing carries a min-width, so the
 * page never scrolls sideways; every control is `min-h-11`, which is 44px; and
 * the logical properties (`ms-`/`me-`/`text-start`) mean the same markup reads
 * right-to-left in Arabic and left-to-right in English.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/groups'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: orgGroups(lang).title,
    alternates: alternatesFor(lang, '/staff/groups'),
    robots: { index: false, follow: false },
  };
}

/* The same summary pill as VolunteerRoles, AdminNotes and the profile-field
 * screen — these pages belong to one product. `inline-flex` is what removes the
 * disclosure triangle: a summary is a list-item by default and stops being one
 * the moment its display changes, in every engine including the WebKit one that
 * ignores `list-style: none` here. */
const PILL =
  'inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line' +
  ' bg-surface-2 px-4 text-[0.88rem] font-extrabold text-ink-2 transition-colors hover:bg-surface';

const FIELD =
  'min-h-11 w-full rounded-xl border border-line bg-ground px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue';

const LABEL = 'mb-1.5 block text-[0.88rem] font-bold';

const HINT = 'mt-1.5 text-[0.82rem] leading-relaxed text-ink-3';

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.78rem] font-bold text-ink-2 break-words">
      {children}
    </span>
  );
}

/**
 * The one form a group is typed into, for both adding and correcting.
 *
 * ── THE KIND BOX IS AN INPUT WITH A DATALIST, NEVER A SELECT ──────────────
 *
 * A datalist is a typeahead: the browser offers the options and accepts
 * anything else. The options are the kinds already recorded, read back out of
 * the table by the page below. There is no `pattern` and nothing compares what
 * was typed against what was offered — see the head of migration 054, which
 * makes the same argument migration 046 makes for role titles.
 *
 * ── THE PARENT SELECT OFFERS EVERY OTHER GROUP ────────────────────────────
 *
 * Including ones that would close a loop. Hiding them would mean walking the
 * whole tree here to work out which, and then the page and the server would
 * hold two statements of the same rule — with the page's one the easier to get
 * wrong. So the select offers everything but the group itself (which
 * chk_og_parent refuses anyway), the server decides, and 'parent-cycle' comes
 * back as a sentence at the top of the page.
 */
function GroupForm({
  lang,
  group,
  parents,
  kindSuggestions,
  t,
}: {
  lang: Locale;
  /** Absent for «+ إضافة لجنة أو فريق»; present when correcting one. */
  group?: OrgGroup;
  parents: OrgGroup[];
  kindSuggestions: string[];
  t: OrgGroupStrings;
}) {
  const editing = group !== undefined;
  const uid = editing ? group.id : 'new';
  const kindList = `kinds-${uid}`;

  return (
    <form action={editing ? updateGroupAction : createGroupAction} className="space-y-5">
      <input type="hidden" name="lang" value={lang} />
      {editing && <input type="hidden" name="groupId" value={group.id} />}

      <div>
        <label className={LABEL} htmlFor={`nameAr-${uid}`}>
          {t.nameArLabel}
        </label>
        <input
          id={`nameAr-${uid}`}
          name="nameAr"
          type="text"
          required
          defaultValue={group?.nameAr ?? ''}
          className={FIELD}
        />
        <p className={HINT}>{t.nameArHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`nameEn-${uid}`}>
          {t.nameEnLabel}
        </label>
        <input
          id={`nameEn-${uid}`}
          name="nameEn"
          type="text"
          dir="ltr"
          defaultValue={group?.nameEn ?? ''}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.nameEnHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`kind-${uid}`}>
          {t.kindLabel}
        </label>
        <input
          id={`kind-${uid}`}
          name="kind"
          type="text"
          list={kindList}
          autoComplete="off"
          defaultValue={group?.kind ?? ''}
          className={FIELD}
        />
        {/* Suggestions, never a permitted set. See the head of this component. */}
        <datalist id={kindList}>
          {kindSuggestions.map((kind) => (
            <option key={kind} value={kind} />
          ))}
        </datalist>
        <p className={HINT}>{t.kindHint}</p>
      </div>

      <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.84rem] leading-relaxed text-ink-2">
        {t.suggestionsNote}
      </p>

      <div>
        <label className={LABEL} htmlFor={`parent-${uid}`}>
          {t.parentLabel}
        </label>
        <select
          id={`parent-${uid}`}
          name="parentId"
          defaultValue={group?.parentId ?? ''}
          className={FIELD}
        >
          <option value="">{t.parentNone}</option>
          {parents
            .filter((candidate) => candidate.id !== group?.id)
            .map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {groupName(candidate, lang)}
              </option>
            ))}
        </select>
        <p className={HINT}>{t.parentHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`descAr-${uid}`}>
          {t.descriptionArLabel}
        </label>
        <textarea
          id={`descAr-${uid}`}
          name="descriptionAr"
          rows={3}
          defaultValue={group?.descriptionAr ?? ''}
          className={`${FIELD} leading-relaxed`}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor={`descEn-${uid}`}>
          {t.descriptionEnLabel}
        </label>
        <textarea
          id={`descEn-${uid}`}
          name="descriptionEn"
          rows={3}
          dir="ltr"
          defaultValue={group?.descriptionEn ?? ''}
          className={`${FIELD} text-start leading-relaxed`}
        />
        <p className={HINT}>{t.descriptionHint}</p>
      </div>

      <button
        type="submit"
        className="min-h-11 w-full rounded-full bg-brand-blue px-6 py-2.5 text-[0.92rem] font-extrabold text-white transition-opacity hover:opacity-90 sm:w-auto"
      >
        {editing ? t.saveEdit : t.save}
      </button>
    </form>
  );
}

/**
 * Why a group is being taken off the list.
 *
 * The reason is required by the form and again by chk_og_archived, and it is
 * stored on the row rather than only in the log — the same rule migration 050
 * established for a volunteer role, for the same reason: the question is asked
 * while looking at the list.
 *
 * There are no one-tap reasons here, unlike the role archive form. The three
 * offered there — added by mistake, wrong person, duplicate — are the ordinary
 * reasons a line about a PERSON is wrong. A committee is archived rarely and
 * almost always for a reason particular to it, and three buttons guessing at it
 * would mostly be three wrong guesses somebody taps to get past.
 */
function ArchiveForm({
  lang,
  group,
  t,
}: {
  lang: Locale;
  group: OrgGroup;
  t: OrgGroupStrings;
}) {
  return (
    <form action={archiveGroupAction}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="groupId" value={group.id} />

      <h4 className="text-[0.95rem] font-extrabold">{t.archiveHeading}</h4>
      <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-2">{t.archiveNote}</p>

      <label className="mt-4 mb-1.5 block text-[0.88rem] font-bold" htmlFor={`why-${group.id}`}>
        {t.reasonLabel}
      </label>
      <input
        id={`why-${group.id}`}
        name="reason"
        type="text"
        required
        minLength={2}
        placeholder={t.reasonPlaceholder}
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

function GroupCard({
  lang,
  group,
  parent,
  live,
  kindSuggestions,
  t,
}: {
  lang: Locale;
  group: OrgGroup;
  /** The row it sits under, already resolved. One level, never a walk. */
  parent: OrgGroup | null;
  /** Every unarchived group, for the parent select inside the edit form. */
  live: OrgGroup[];
  kindSuggestions: string[];
  t: OrgGroupStrings;
}) {
  const description = lang === 'ar' ? group.descriptionAr : group.descriptionEn;

  return (
    <li
      /* The start-side rule is the only thing separating a group that still
         meets from one that has finished. `border-s-*` and not `border-l-*`, so
         it lands on the right in Arabic and the left in English. */
      className={`rounded-2xl border border-line bg-surface p-4 sm:p-5 ${
        group.isActive ? 'border-s-4 border-s-brand-orange' : ''
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
        <h3 className="text-[1.02rem] font-extrabold break-words">{groupName(group, lang)}</h3>
        <span
          className={`rounded-full px-3 py-1 text-[0.78rem] font-extrabold ${
            group.isActive
              ? 'bg-brand-orange/15 text-brand-orange-text dark:text-brand-orange'
              : 'bg-surface-2 text-ink-3'
          }`}
        >
          {group.isActive ? t.activeBadge : t.concludedBadge}
        </span>
      </div>

      {(group.kind || parent) && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {group.kind && (
            <Badge>
              {t.kindBadge}: {group.kind}
            </Badge>
          )}
          {parent && (
            <Badge>
              {t.parentBadge}: {groupName(parent, lang)}
            </Badge>
          )}
        </div>
      )}

      {description && (
        <p className="mt-3 whitespace-pre-line text-[0.93rem] leading-relaxed text-ink-2">
          {description}
        </p>
      )}

      {/* Already 'YYYY-MM-DD' in Beirut, as text from the query. */}
      <p className="mt-3 text-[0.8rem] text-ink-3" dir="ltr">
        {t.recordedOn.replace('{date}', group.createdOn)}
      </p>

      <Link
        href={`/${lang}/staff/groups/${group.id}`}
        className="mt-4 inline-block min-h-11 rounded-full border border-line bg-surface-2 px-5 py-2.5 text-[0.9rem] font-extrabold text-brand-blue transition-colors hover:bg-surface dark:text-brand-orange"
      >
        {t.openCta} →
      </Link>

      <div className="mt-4 space-y-2 border-t border-line pt-4">
        <details>
          <summary className={PILL}>{t.editCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <h4 className="mb-4 text-[0.95rem] font-extrabold">{t.editHeading}</h4>
            <GroupForm
              lang={lang}
              group={group}
              parents={live}
              kindSuggestions={kindSuggestions}
              t={t}
            />
          </div>
        </details>

        <details>
          <summary className={PILL}>{group.isActive ? t.concludeCta : t.resumeCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <p className="text-[0.86rem] leading-relaxed text-ink-2">{t.concludeNote}</p>
            <form action={setGroupActiveAction} className="mt-4">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="groupId" value={group.id} />
              {/* flag() reads 'true' as true and everything else as false, so an
                  explicit value is safer than omitting the field. */}
              <input type="hidden" name="active" value={group.isActive ? 'false' : 'true'} />
              <button
                type="submit"
                className="min-h-11 w-full rounded-full border-2 border-brand-blue px-6 text-[0.9rem] font-extrabold text-brand-blue transition-colors hover:bg-brand-blue/10 sm:w-auto dark:border-brand-orange dark:text-brand-orange"
              >
                {group.isActive ? t.concludeCta : t.resumeCta}
              </button>
            </form>
          </div>
        </details>

        <details>
          <summary className={PILL}>{t.archiveCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <ArchiveForm lang={lang} group={group} t={t} />
          </div>
        </details>
      </div>
    </li>
  );
}

export default async function StaffGroupsPage(props: PageProps<'/[lang]/staff/groups'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = orgGroups(lang);

  if (!isDbConfigured()) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.errors.dbUnavailable}
        </p>
      </Container></Section>
    );
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);
  /* The same capability every action on this page asserts. A `can()` that
   * disagreed with them would produce a screen full of controls that could
   * only fail. */
  if (!can(user, 'members.manage')) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.staff.forbidden}
        </p>
      </Container></Section>
    );
  }

  const params = await props.searchParams;
  const asked = String(params.error ?? '');
  // Read off a URL, so it is checked against the strings that answer to it
  // rather than rendered as whatever a stranger typed.
  const problem = isGroupError(asked) ? asked : null;

  const [all, kindRows] = await Promise.all([
    groups({ includeArchived: true, includeInactive: true }),
    /*
     * The kinds already in use, for the typeahead. A COUNT OF KINDS AND NEVER
     * OF PEOPLE: it is a `DISTINCT` over one text column and there is no
     * GROUP BY user_id anywhere near this page.
     */
    query<{ kind: string }>(
      `SELECT DISTINCT kind FROM org_groups
        WHERE archived_at IS NULL AND kind IS NOT NULL AND btrim(kind) <> ''
        ORDER BY kind
        LIMIT 50`,
    ),
  ]);

  const live = all.filter((group) => group.archivedOn === null);
  const archived = all.filter((group) => group.archivedOn !== null);
  /* One level of parent, resolved from the list already in memory rather than
   * by a join or a recursive walk. Nothing in this feature reads further up the
   * chain, which is what bounds the cost of the cycle the database cannot
   * refuse — see the head of lib/org-groups.ts. */
  const byId = new Map(all.map((group) => [group.id, group]));

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{dict.account.staff.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        {problem && (
          <p
            role="status"
            className="mt-6 rounded-xl border-2 border-warn bg-warn/10 px-5 py-4 text-[0.93rem] leading-relaxed text-ink-2"
          >
            {t.errors[problem]}
          </p>
        )}

        <details className="mt-6">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-full bg-brand-orange px-5 text-[0.92rem] font-extrabold text-brand-orange-ink transition-colors hover:bg-brand-orange-dark">
            {t.addCta}
          </summary>
          <div className="mt-4 rounded-2xl border border-line bg-surface p-4 sm:p-6">
            <h2 className="mb-4 text-[1rem] font-extrabold">{t.addHeading}</h2>
            <GroupForm
              lang={lang}
              parents={live}
              kindSuggestions={kindRows.map((row) => row.kind)}
              t={t}
            />
          </div>
        </details>

        {live.length === 0 ? (
          <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.empty}
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {live.map((group) => (
              <GroupCard
                key={group.id}
                lang={lang}
                group={group}
                parent={group.parentId ? byId.get(group.parentId) ?? null : null}
                live={live}
                kindSuggestions={kindRows.map((row) => row.kind)}
                t={t}
              />
            ))}
          </ul>
        )}

        {/*
         * Archived rows: kept, hidden by default. The database refuses a DELETE
         * outright (trg_org_groups_no_delete), so nothing in this drawer is ever
         * the last copy of anything — and the roles that pointed at these rows
         * are still on their holders' records, untouched.
         */}
        {archived.length > 0 && (
          <details className="mt-8">
            <summary className={PILL}>
              {t.archivedShow.replace('{n}', String(archived.length))}
            </summary>
            <p className="mt-3 max-w-[62ch] text-[0.86rem] leading-relaxed text-ink-3">
              {t.archivedNote}
            </p>
            <ul className="mt-3 space-y-3">
              {archived.map((group) => (
                <li key={group.id} className="rounded-2xl border border-line bg-surface-2 p-4">
                  <p className="text-[0.98rem] font-extrabold text-ink-2 break-words">
                    {groupName(group, lang)}
                  </p>
                  {group.kind && (
                    <p className="mt-1 text-[0.82rem] text-ink-3">
                      {t.kindBadge}: {group.kind}
                    </p>
                  )}
                  {/* archivedOn is already Beirut 'YYYY-MM-DD' text. */}
                  <p className="mt-1 text-[0.82rem] text-ink-3" dir="ltr">
                    {t.archivedOn.replace('{date}', group.archivedOn ?? '')}
                  </p>
                  {group.archiveReason && (
                    <p className="mt-2 text-[0.88rem] text-ink-2 break-words">
                      {t.archivedReason}: {group.archiveReason}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}

        <Link
          href={`/${lang}/staff`}
          className="mt-9 inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {dict.account.staff.dashboard.title}
        </Link>
      </Container>
    </Section>
  );
}
