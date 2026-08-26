import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import type { FieldAnswer } from '@/lib/profile-fields';
import type { FieldDef, FieldValue } from '@/lib/profile-field-kinds';
import { MAX_LONGTEXT, MAX_TEXT, MAX_URL } from '@/lib/profile-field-kinds';
import { setFieldValuesAction } from '@/lib/actions/admin-profile';
import type { AdminProfileStrings } from '@/lib/dictionaries/admin-profile';

/**
 * The answers to the association's own profile fields, on a member's page.
 *
 * A SERVER COMPONENT and one plain `<form action={setFieldValuesAction}>`. There
 * is nothing to add or remove in the browser here — the number of inputs is the
 * number of live definitions — so nothing crosses the client boundary.
 *
 * ── ONE INPUT PER LIVE DEFINITION, BY KIND ─────────────────────────────────
 *
 * Every input is named `value:<definition id>`, which is the contract the head
 * of lib/actions/admin-profile.ts documents. The action re-reads every
 * definition from the database and never asks the form what kind a field is, so
 * what is rendered below decides what somebody can type and nothing else.
 *
 * Three of the eight kinds need care, and each is the shape of a real bug:
 *
 *   MULTISELECT carries a hidden empty entry BEFORE its boxes. An unticked
 *   checkbox posts nothing at all, so a multiselect with everything unticked
 *   would post no `value:<id>` entry — and the action reads a missing entry as
 *   "this field was not on the form, leave it alone", which is right for a
 *   partial form and would make clearing a multiselect impossible. The empty
 *   entry makes the field always present; validateValue drops empty strings, so
 *   an untouched set arrives as [] and clears the answer.
 *
 *   SELECT carries a blank option, for the same reason said differently: a
 *   select always posts something, and the something that means "no answer" has
 *   to exist as a choice or the answer can never be taken back.
 *
 *   CHECKBOX needs neither. The action reads it by presence — `formData.has` —
 *   because that is how every browser posts an unticked box, so an ordinary
 *   checkbox is exactly right and a hidden companion field would make every box
 *   read as ticked.
 *
 * ── THE VALIDATION HERE IS A COURTESY ──────────────────────────────────────
 *
 * `required`, `maxLength` and `type="url"` are the browser catching the ordinary
 * mistake before a round trip. They are not the check: profile-field-kinds.ts's
 * validateValue is, it runs on the server against a definition re-read from the
 * database, and migration 048 says plainly that there is nothing underneath it.
 * The action writes all the answers or none of them, so a single refused field
 * leaves the record exactly as it was.
 *
 * ── WHAT IS SHOWN NEXT TO EACH ANSWER ──────────────────────────────────────
 *
 * Who can see it. A member of staff typing somebody's university into a field
 * whose visibility is 'public' is publishing it, and the only honest place to
 * say so is beside the box. The wording matches the roles section above, because
 * they are the same three audiences on the same screen.
 *
 * ── MOBILE FIRST ──────────────────────────────────────────────────────────
 *
 * One column at 375px, `min-h-11` on every control, and no min-width anywhere.
 */

const FIELD =
  'min-h-11 w-full rounded-xl border border-line bg-ground px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue';

const LABEL = 'mb-1.5 block text-[0.88rem] font-bold';

const HINT = 'mt-1.5 text-[0.82rem] leading-relaxed text-ink-3';

/** The label in the page's language, falling back to the Arabic. */
function labelOf(def: FieldDef, lang: Locale): string {
  if (lang === 'ar') return def.labelAr;
  return def.labelEn.trim() || def.labelAr;
}

/** The help line in the page's language, falling back to the other. */
function helpOf(def: FieldDef, lang: Locale): string {
  const own = lang === 'ar' ? def.helpAr : def.helpEn;
  const other = lang === 'ar' ? def.helpEn : def.helpAr;
  return (own ?? '').trim() || (other ?? '').trim();
}

/** One option's label in the page's language, falling back to the Arabic. */
function optionLabel(option: { ar: string; en: string; value: string }, lang: Locale): string {
  if (lang === 'ar') return option.ar || option.value;
  return option.en.trim() || option.ar || option.value;
}

/**
 * The stored answer as text for a single-line input.
 *
 * A stored value is a string, a number, a boolean or an array — the four things
 * migration 048's JSONB column may hold. Only the scalar shapes reach the inputs
 * that call this; anything else would mean a row whose value no longer matches
 * its definition, and rendering '' is what keeps the page up while the answer
 * stays untouched in the table.
 */
function asText(value: FieldValue | undefined): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function chosen(value: FieldValue | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

function Input({
  def,
  value,
  lang,
  t,
}: {
  def: FieldDef;
  value: FieldValue | undefined;
  lang: Locale;
  t: AdminProfileStrings['values'];
}) {
  const name = `value:${def.id}`;
  const id = `field-${def.id}`;

  switch (def.kind) {
    case 'longtext':
      return (
        <textarea
          id={id}
          name={name}
          rows={3}
          required={def.required}
          maxLength={MAX_LONGTEXT}
          defaultValue={asText(value)}
          className={`${FIELD} leading-relaxed`}
        />
      );

    case 'number':
      return (
        <input
          id={id}
          name={name}
          type="number"
          /* Decimals and negatives are valid numbers to validateValue, so the
             input must not narrow what the validator accepts. */
          step="any"
          required={def.required}
          defaultValue={asText(value)}
          className={FIELD}
        />
      );

    case 'date':
      return (
        <input
          id={id}
          name={name}
          type="date"
          required={def.required}
          /* Already 'YYYY-MM-DD' text, which is exactly what a date input wants.
             Never a Date: the association is in Beirut and the session is GMT. */
          defaultValue={asText(value)}
          className={FIELD}
        />
      );

    case 'url':
      return (
        <input
          id={id}
          name={name}
          type="url"
          dir="ltr"
          required={def.required}
          maxLength={MAX_URL}
          defaultValue={asText(value)}
          className={`${FIELD} text-start`}
        />
      );

    case 'select':
      return (
        <select
          id={id}
          name={name}
          required={def.required}
          defaultValue={asText(value)}
          className={FIELD}
        >
          {/* The way back to no answer. Without it a select can be answered and
              never un-answered. */}
          <option value="">{t.noAnswer}</option>
          {def.options.map((option) => (
            <option key={option.value} value={option.value}>
              {optionLabel(option, lang)}
            </option>
          ))}
        </select>
      );

    case 'multiselect': {
      const picked = new Set(chosen(value));
      return (
        <>
          {/* BEFORE the boxes. See the head of this file: without it, ticking
              nothing posts nothing and the answer could never be cleared. */}
          <input type="hidden" name={name} value="" />
          <ul className="space-y-1.5">
            {def.options.map((option) => (
              <li key={option.value}>
                <label className="flex min-h-11 items-center gap-3 text-[0.93rem]">
                  <input
                    type="checkbox"
                    name={name}
                    value={option.value}
                    defaultChecked={picked.has(option.value)}
                    className="h-5 w-5 shrink-0 accent-brand-blue"
                  />
                  <span className="break-words">{optionLabel(option, lang)}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className={HINT}>{t.multiHint}</p>
        </>
      );
    }

    case 'checkbox':
      return (
        <label className="flex min-h-11 items-center gap-3 text-[0.95rem] font-bold">
          <input
            id={id}
            name={name}
            type="checkbox"
            value="on"
            required={def.required}
            defaultChecked={value === true}
            className="h-5 w-5 shrink-0 accent-brand-blue"
          />
          {labelOf(def, lang)}
        </label>
      );

    case 'text':
      return (
        <input
          id={id}
          name={name}
          type="text"
          required={def.required}
          maxLength={MAX_TEXT}
          defaultValue={asText(value)}
          className={FIELD}
        />
      );
  }
}

export function ProfileFieldValues({
  lang,
  userId,
  defs,
  answers,
  canManage,
  t,
}: {
  lang: Locale;
  /** Whose record these answers belong to. */
  userId: string;
  /** Live definitions, already in sort order from `fieldDefs()`. */
  defs: FieldDef[];
  /** This person's answers as this viewer may see them, from `valuesFor()`. */
  answers: FieldAnswer[];
  canManage: boolean;
  t: AdminProfileStrings['values'];
}) {
  const stored = new Map(answers.map((answer) => [answer.fieldId, answer]));

  return (
    <section className="mt-10">
      <h2 className="text-[1.1rem] font-extrabold">{t.sectionTitle}</h2>
      <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-ink-2">{t.lede}</p>

      {defs.length === 0 ? (
        <div className="mt-4 rounded-xl border border-line bg-surface-2 px-5 py-4">
          <p className="max-w-[62ch] text-[0.92rem] leading-relaxed text-ink-2">{t.empty}</p>
          {canManage && (
            <Link
              href={`/${lang}/staff/profile-fields`}
              className="mt-3 inline-block min-h-11 py-2.5 text-[0.9rem] font-extrabold text-brand-blue hover:underline dark:text-brand-orange"
            >
              {t.emptyManage} →
            </Link>
          )}
        </div>
      ) : (
        <form action={setFieldValuesAction} className="mt-4">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="userId" value={userId} />

          <div className="space-y-5 rounded-2xl border border-line bg-surface p-4 sm:p-5">
            {defs.map((def) => {
              const answer = stored.get(def.id);
              const help = helpOf(def, lang);
              return (
                <div key={def.id}>
                  {/* A tick-box carries its own label inside the control, so a
                      second one above it would be the same words twice and a
                      label pointing at nothing. */}
                  {def.kind !== 'checkbox' && (
                    <label className={LABEL} htmlFor={`field-${def.id}`}>
                      {labelOf(def, lang)}
                      {def.required && (
                        <span className="ms-2 font-extrabold text-warn-text">
                          {t.requiredMark}
                        </span>
                      )}
                    </label>
                  )}

                  <fieldset disabled={!canManage} className="border-0 p-0">
                    <Input def={def} value={answer?.value} lang={lang} t={t} />
                  </fieldset>

                  {help && <p className={HINT}>{help}</p>}

                  <p className="mt-1.5 text-[0.8rem] text-ink-3">
                    {t.seenByLabel}: {t.seenBy[def.visibility]}
                    {answer && (
                      <>
                        {' · '}
                        {/* Already Beirut 'YYYY-MM-DD' text from the query. */}
                        <span dir="ltr">{t.answeredOn.replace('{date}', answer.updatedOn)}</span>
                      </>
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          {canManage ? (
            <>
              <p className={HINT}>{t.clearHint}</p>
              <button
                type="submit"
                className="mt-3 min-h-11 w-full rounded-full bg-brand-blue px-6 text-[0.92rem] font-extrabold text-white transition-opacity hover:opacity-90 sm:w-auto"
              >
                {t.save}
              </button>
            </>
          ) : (
            <p className="mt-3 text-[0.88rem] text-ink-3">{t.readOnly}</p>
          )}
        </form>
      )}
    </section>
  );
}
