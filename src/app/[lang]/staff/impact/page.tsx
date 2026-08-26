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
import { isDbConfigured } from '@/lib/db';
import {
  allNumbers,
  evidenceFor,
  impactLabel,
  type Evidence,
  type ImpactNumber,
} from '@/lib/impact-numbers';
import {
  createImpactNumberAction,
  setImpactNumberPublishedAction,
  updateImpactNumberAction,
} from '@/lib/actions/impact-numbers';
import {
  impactAdmin,
  isImpactError,
  type ImpactAdminStrings,
} from '@/lib/dictionaries/impact-admin';

/**
 * «الأرقام على الصفحة الأولى»: the five figures under «تكافل بالأرقام», and
 * beside each of them what this platform could actually show a sceptic today.
 *
 * ── A SERVER COMPONENT, ALL THE WAY DOWN ──────────────────────────────────
 *
 * There is no client component in this feature. Every control is a plain
 * `<form action={serverAction}>` and every panel is a `<details>`, so opening
 * the add form, correcting a figure or taking one off the front page costs no
 * JavaScript at all and works before hydration.
 *
 * The one thing a server-only form normally cannot do is show WHY a write was
 * refused, and this feature has two refusals an administrator can genuinely hit
 * — a key already in use and a key of the wrong shape. So the actions redirect
 * back with `?error=…` and the banner below renders the sentence. That is why
 * this page reads searchParams at all.
 *
 * ── THE EVIDENCE HINT IS THE POINT OF THIS SCREEN ─────────────────────────
 *
 * Beside each figure the page prints what the database can count, and where it
 * can count nothing it prints a sentence saying so — NEVER A ZERO. The whole
 * argument lives at the head of evidenceFor() in lib/impact-numbers.ts and is
 * not repeated here, but the two consequences that are this page's own:
 *
 *   THE HINT IS TYPOGRAPHICALLY QUIET AND CARRIES NO WARNING COLOUR. It is not
 *   `border-warn`, not `bg-danger`, not a badge. A figure the platform cannot
 *   evidence is not a problem with the figure, and a red rule beside «٤٬٠٠٠+
 *   عائلة تلقّت دعماً» would say it was — to somebody holding the authority to
 *   edit that claim. The only coloured rule on a card is the orange one that
 *   marks a figure as being on the front page, which is a fact about the page
 *   and not a judgement about the number.
 *
 *   THE HINT IS NOWHERE NEAR A FORM CONTROL. It is printed under the value and
 *   outside every `<details>`, so no edit form ever has a count sitting next to
 *   the box the value is typed into. A form that put 33 beside «300+» with a
 *   cursor between them would be inviting the correction that this whole
 *   feature exists to argue against.
 *
 * ── MOBILE FIRST ──────────────────────────────────────────────────────────
 *
 * One column at 375px, splitting at `sm`. Nothing carries a min-width, so the
 * page never scrolls sideways; every control is `min-h-11`, which is 44px; and
 * the logical properties (`ms-`/`me-`/`text-start`) mean the same markup reads
 * right-to-left in Arabic and left-to-right in English.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/impact'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: impactAdmin(lang).title,
    alternates: alternatesFor(lang, '/staff/impact'),
    robots: { index: false, follow: false },
  };
}

/* The same summary pill as the projects and committees screens — these pages
 * belong to one product. `inline-flex` is what removes the disclosure triangle:
 * a summary is a list-item by default and stops being one the moment its
 * display changes, in every engine including the WebKit one that ignores
 * `list-style: none` here. */
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
 * The one form a figure is typed into, for both adding and correcting.
 *
 * ── THE KEY BOX APPEARS ONLY WHEN ADDING ──────────────────────────────────
 *
 * On an edit it is printed as a badge on the card and is not a field at all, so
 * there is no input whose value the update action could read even if somebody
 * added one to the POST — `updateImpactNumberAction` never looks at `key`. The
 * reason is at the head of ImpactPatch in lib/impact-numbers.ts: the key is what
 * pairs a row with its evidence line, and a renamed key would put "this platform
 * does not track that" beside a figure the platform tracks perfectly well.
 *
 * ── AND THE VALUE BOX IS A TEXT BOX, NOT A NUMBER BOX ─────────────────────
 *
 * `type="text"` deliberately. `type="number"` would refuse «4,000+» outright and
 * would offer spinner arrows to increment a claim about four thousand families,
 * which is not a thing that increments. The column is TEXT for the same reason
 * — migration 053 says so in one line — and the hint tells the administrator
 * that what they type is what appears, character for character.
 */
function ImpactForm({
  lang,
  row,
  t,
}: {
  lang: Locale;
  /** Absent for «+ إضافة رقم»; present when correcting one. */
  row?: ImpactNumber;
  t: ImpactAdminStrings;
}) {
  const editing = row !== undefined;
  const uid = editing ? row.id : 'new';

  return (
    <form action={editing ? updateImpactNumberAction : createImpactNumberAction} className="space-y-5">
      <input type="hidden" name="lang" value={lang} />
      {editing && <input type="hidden" name="numberId" value={row.id} />}

      {editing ? (
        <p className="rounded-xl border border-line bg-surface px-4 py-3 text-[0.84rem] leading-relaxed text-ink-2">
          {t.keyFixedHint}
        </p>
      ) : (
        <div>
          <label className={LABEL} htmlFor={`key-${uid}`}>
            {t.keyLabel}
          </label>
          <input
            id={`key-${uid}`}
            name="key"
            type="text"
            required
            dir="ltr"
            autoComplete="off"
            className={`${FIELD} text-start`}
          />
          <p className={HINT}>{t.keyHint}</p>
        </div>
      )}

      <div>
        <label className={LABEL} htmlFor={`valueText-${uid}`}>
          {t.valueLabel}
        </label>
        <input
          id={`valueText-${uid}`}
          name="valueText"
          type="text"
          required
          dir="ltr"
          autoComplete="off"
          defaultValue={row?.valueText ?? ''}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.valueHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`labelAr-${uid}`}>
          {t.labelArLabel}
        </label>
        <input
          id={`labelAr-${uid}`}
          name="labelAr"
          type="text"
          required
          defaultValue={row?.labelAr ?? ''}
          className={FIELD}
        />
        <p className={HINT}>{t.labelArHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`labelEn-${uid}`}>
          {t.labelEnLabel}
        </label>
        <input
          id={`labelEn-${uid}`}
          name="labelEn"
          type="text"
          dir="ltr"
          defaultValue={row?.labelEn ?? ''}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.labelEnHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`sourceNote-${uid}`}>
          {t.sourceNoteLabel}
        </label>
        <textarea
          id={`sourceNote-${uid}`}
          name="sourceNote"
          rows={3}
          defaultValue={row?.sourceNote ?? ''}
          className={`${FIELD} leading-relaxed`}
        />
        <p className={HINT}>{t.sourceNoteHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`sortOrder-${uid}`}>
          {t.orderLabel}
        </label>
        <input
          id={`sortOrder-${uid}`}
          name="sortOrder"
          type="number"
          step={1}
          dir="ltr"
          defaultValue={String(row?.sortOrder ?? 0)}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.orderHint}</p>
      </div>

      {/*
        `isPublished` is on the ADD form only. Changing it lives in its own form
        below, so that saving a spelling correction from a stale tab cannot
        quietly put a withdrawn claim back on the association's front page — the
        same separation lib/impact-numbers.ts keeps between updateNumber and
        setPublished.
      */}
      {!editing && (
        <div>
          <label className="flex min-h-11 items-center gap-3 text-[0.95rem] font-bold">
            <input
              name="isPublished"
              type="checkbox"
              value="true"
              className="h-5 w-5 accent-brand-blue"
            />
            {t.publishCta}
          </label>
          {/* AFTER the checkbox, and that order is load-bearing. An unticked
              checkbox posts nothing at all; the action reads formData.get(),
              which returns the FIRST entry in tree order, so ticked posts
              ['true','false'] and reads true while unticked posts ['false'] and
              reads false. Putting this line above would publish nothing, ever. */}
          <input type="hidden" name="isPublished" value="false" />
          <p className={HINT}>{t.publishNote}</p>
        </div>
      )}

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
 * What the platform can stand behind, beside the claim.
 *
 * THE THREE STATES ARE THREE BRANCHES AND THERE IS NO FOURTH. `not-tracked`
 * carries no number, so there is no expression in this component that could
 * render a zero for it — the union in lib/impact-numbers.ts makes that a compile
 * error rather than a code review. `unreadable` is kept apart from it for the
 * same reason one step out: a dead connection is not evidence of absence, and
 * printing «لا تسجّل هذه المنصّة…» for one would be the identical lie.
 *
 * Every branch renders at the same weight, in the same box, with no colour.
 * A counted figure is not "better news" than an uncounted one; it is a different
 * fact about the database, and nothing on this screen may rank the five figures
 * by how well the software happens to know them.
 */
function EvidenceLine({ evidence, t }: { evidence: Evidence; t: ImpactAdminStrings }) {
  if (evidence.kind === 'counted') {
    return (
      <>
        <p className="text-[0.9rem] leading-relaxed font-bold text-ink-2">
          {t.evidence[evidence.measure].replace('{n}', String(evidence.count))}
        </p>
        <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-3">
          {t.evidenceNote[evidence.measure]}
        </p>
      </>
    );
  }

  if (evidence.kind === 'unreadable') {
    return <p className="text-[0.9rem] leading-relaxed text-ink-2">{t.unreadable}</p>;
  }

  /* Not tracked. No number appears in this branch at all — see above, and see
     the head of evidenceFor(). The second line is not decoration: without it the
     first reads as "disproved" to the one person on the site with the authority
     to delete the claim. */
  return (
    <>
      <p className="text-[0.9rem] leading-relaxed font-bold text-ink-2">{t.notTracked}</p>
      <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-3">{t.notTrackedNote}</p>
    </>
  );
}

function ImpactCard({
  lang,
  row,
  evidence,
  t,
}: {
  lang: Locale;
  row: ImpactNumber;
  evidence: Evidence;
  t: ImpactAdminStrings;
}) {
  return (
    <li
      /* The start-side rule marks a figure that is on the front page. `border-s-*`
         and not `border-l-*`, so it lands on the right in Arabic and the left in
         English. It is the ONLY coloured rule on this card, and it says nothing
         about the evidence below. */
      className={`rounded-2xl border border-line bg-surface p-4 sm:p-5 ${
        row.isPublished ? 'border-s-4 border-s-brand-orange' : ''
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
        <h3 className="text-[1.02rem] font-extrabold break-words">{impactLabel(row, lang)}</h3>
        <span
          className={`rounded-full px-3 py-1 text-[0.78rem] font-extrabold ${
            row.isPublished
              ? 'bg-brand-orange/15 text-brand-orange-text dark:text-brand-orange'
              : 'bg-surface-2 text-ink-3'
          }`}
        >
          {row.isPublished ? t.publishedBadge : t.unpublishedBadge}
        </span>
      </div>

      {/* The claim itself, at the size it is read at. `tabular` and `dir="ltr"`
          for the same reason the front page uses them: «4,000+» is a Latin
          string with a comma in it and must not be reflowed by the paragraph
          direction. */}
      <p
        dir="ltr"
        className="tabular mt-2 text-start text-[clamp(1.6rem,1.2rem+1.6vw,2.2rem)] font-bold leading-tight text-brand-blue dark:text-brand-orange"
      >
        {row.valueText}
      </p>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <Badge>
          {t.keyBadge}: <span dir="ltr">{row.key}</span>
        </Badge>
        <Badge>
          {t.orderBadge}: <span dir="ltr">{row.sortOrder}</span>
        </Badge>
        {/* The label in the other language, so both are visible without
            switching the whole site. Absent rather than empty when it was never
            written — the front page falls back to the Arabic. */}
        {lang === 'ar' && row.labelEn.trim() !== '' && (
          <Badge>
            <span dir="ltr">{row.labelEn}</span>
          </Badge>
        )}
        {lang === 'en' && <Badge>{row.labelAr}</Badge>}
      </div>

      {/* The evidence. Outside every form, and with no colour on it. */}
      <div className="mt-4 rounded-xl border border-line bg-surface-2 p-3.5">
        <h4 className="text-[0.8rem] font-extrabold tracking-wide text-ink-3">
          {t.evidenceHeading}
        </h4>
        <div className="mt-2">
          <EvidenceLine evidence={evidence} t={t} />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-[0.8rem] font-extrabold tracking-wide text-ink-3">
          {t.sourceHeading}
        </h4>
        <p className="mt-1.5 whitespace-pre-line text-[0.9rem] leading-relaxed text-ink-2">
          {row.sourceNote ?? t.sourceEmpty}
        </p>
      </div>

      {/* Already 'YYYY-MM-DD' in Beirut, as text from the query. */}
      <p className="mt-3 text-[0.8rem] text-ink-3" dir="ltr">
        {t.updatedOn.replace('{date}', row.updatedOn)}
      </p>

      <div className="mt-4 space-y-2 border-t border-line pt-4">
        <details>
          <summary className={PILL}>{t.editCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <h4 className="mb-4 text-[0.95rem] font-extrabold">{t.editHeading}</h4>
            <ImpactForm lang={lang} row={row} t={t} />
          </div>
        </details>

        <details>
          <summary className={PILL}>{row.isPublished ? t.unpublishCta : t.publishCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <p className="text-[0.86rem] leading-relaxed text-ink-2">{t.publishNote}</p>
            <form action={setImpactNumberPublishedAction} className="mt-4">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="numberId" value={row.id} />
              {/* flag() reads 'true' as true and everything else as false, so an
                  explicit value is safer than omitting the field. */}
              <input type="hidden" name="published" value={row.isPublished ? 'false' : 'true'} />
              <button
                type="submit"
                className="min-h-11 w-full rounded-full border-2 border-brand-blue px-6 text-[0.9rem] font-extrabold text-brand-blue transition-colors hover:bg-brand-blue/10 sm:w-auto dark:border-brand-orange dark:text-brand-orange"
              >
                {row.isPublished ? t.unpublishCta : t.publishCta}
              </button>
            </form>
          </div>
        </details>
      </div>
    </li>
  );
}

export default async function StaffImpactPage(props: PageProps<'/[lang]/staff/impact'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = impactAdmin(lang);

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
  /* The same capability every action on this page asserts, and the same one the
   * projects and committees screens assert. A `can()` that disagreed with them
   * would produce a screen full of controls that could only fail. */
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
  const problem = isImpactError(asked) ? asked : null;

  const rows = await allNumbers();
  /*
   * One evidence read per figure, in parallel.
   *
   * Each is a single count and two of the five do not touch the database at all
   * — evidenceFor() answers 'not-tracked' without a query, which is the cheap
   * half of being honest. They are gathered here rather than inside the card so
   * that the component stays synchronous and the page makes one round of reads
   * rather than one per render pass.
   */
  const evidence = await Promise.all(rows.map((row) => evidenceFor(row.key)));

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

        {/*
         * The standing note about what the counts below are and are not. It sits
         * ABOVE the list, once, rather than being repeated on every card: the
         * sentence an administrator has to have read before they act on a hint
         * is the one about the association being older than its database, and a
         * paragraph printed five times is a paragraph read none.
         */}
        <div className="mt-6 rounded-2xl border border-line bg-surface-2 p-4 sm:p-5">
          <h2 className="text-[0.95rem] font-extrabold">{t.evidenceHeading}</h2>
          <p className="mt-2 max-w-[62ch] text-[0.9rem] leading-relaxed text-ink-2">
            {t.evidenceLede}
          </p>
          <p className="mt-2 max-w-[62ch] text-[0.86rem] leading-relaxed text-ink-3">
            {t.fallbackNote}
          </p>
        </div>

        <details className="mt-6">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-full bg-brand-orange px-5 text-[0.92rem] font-extrabold text-brand-orange-ink transition-colors hover:bg-brand-orange-dark">
            {t.addCta}
          </summary>
          <div className="mt-4 rounded-2xl border border-line bg-surface p-4 sm:p-6">
            <h2 className="mb-4 text-[1rem] font-extrabold">{t.addHeading}</h2>
            <ImpactForm lang={lang} t={t} />
          </div>
        </details>

        {rows.length === 0 ? (
          <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.empty}
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {rows.map((row, index) => (
              <ImpactCard
                key={row.id}
                lang={lang}
                row={row}
                /* Same array, same order — `evidence` is built by mapping over
                   `rows` immediately above, so the index is the pairing and no
                   second lookup by key can drift from it. */
                evidence={evidence[index]}
                t={t}
              />
            ))}
          </ul>
        )}

        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            href={`/${lang}/staff`}
            className="inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
          >
            ← {dict.account.staff.dashboard.title}
          </Link>
          <Link
            href={`/${lang}`}
            className="inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
          >
            {t.viewPublic}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
