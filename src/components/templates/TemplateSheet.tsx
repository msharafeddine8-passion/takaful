import { ORG } from '@/lib/org';
import { pick, type Template, type Field, type Bilingual } from '@/lib/templates/types';
import type { Locale } from '@/lib/i18n';

/**
 * One template, as printable paper.
 *
 * Everything is sized in `var(--u)` against a container query, so the same
 * component is a legible preview on a phone and a real sheet at the printer
 * without a second set of rules — the way the membership card and the
 * certificate already work.
 *
 * `--u` is not simply `1cqw`, and that is the part worth reading.
 *
 * A container-query unit tracks the width of the page, so the same `3.4cqw`
 * row was 7.1mm on portrait A4 and 10.1mm on landscape — the same form with
 * rows half again as tall depending on which way round the paper went. `--u`
 * is scaled by the ratio between the two widths, which makes one unit the
 * same physical distance on both, and makes the whole sheet tunable from one
 * number when a form needs to be squeezed onto one page.
 *
 * WHY THE SHEET CARRIES ITS PAPER WIDTH AS A MINIMUM
 *
 * Because a unit is a fraction of the container, the sheet is only legible
 * while the container is about as wide as the paper. On a 375px phone the
 * column is 333px, one unit collapsed to 2.4mm-worth of nothing — 3.3px — and
 * the whole form rendered as grey texture: field labels at 3.3px, the title at
 * 9px, a landscape attendance sheet down to 2.4px. Not small. Unreadable.
 *
 * So the sheet never narrows below the paper it is drawn for, and the page
 * scrolls it sideways instead. The alternative — reflowing to one column on
 * screen — would mean a second layout to keep true, and the thing a volunteer
 * is looking at would stop being the thing that comes out of the printer.
 * A form is a fixed piece of paper; showing it at its real size and letting
 * the phone pan across it is the honest presentation, and it makes the preview
 * and the print byte-for-byte the same drawing.
 *
 * The full lockup at the top, on the sheet's own white — not the symbol
 * alone. A form that comes back filled in has to be identifiable as the
 * association's while sitting in a folder months later with nothing around
 * it. The wordmark is #205B8B and wants a light ground, which is what paper
 * is; this is the one place the logo needs nothing done to it at all.
 */

const RULE = '#c9d3dc';
const NAVY = '#134074';
const INK = '#1d2b36';
const MUTED = '#5d7080';

/** N units, as CSS. */
const u = (n: number) => `calc(${n} * var(--u))`;

/** Tall enough to write a name in by hand: about 6.3mm on real paper. */
const ROW = 3;

function Label({ text }: { text: string }) {
  return (
    <span className="font-bold" style={{ fontSize: u(1.3), lineHeight: 1.4, color: MUTED }}>
      {text}
    </span>
  );
}

function renderField(f: Field, lang: Locale, key: number) {
  switch (f.kind) {
    case 'line':
      return (
        <div key={key} style={{ gridColumn: `span ${f.width ?? 12}` }}>
          <Label text={pick(f.label, lang)} />
          <div
            style={{ marginTop: u(0.3), height: u(ROW), borderBottom: `1px solid ${RULE}` }}
          />
          {f.hint && (
            <p style={{ marginTop: u(0.25), fontSize: u(1), lineHeight: 1.4, color: MUTED, fontStyle: 'italic' }}>
              {pick(f.hint, lang)}
            </p>
          )}
        </div>
      );

    case 'box':
      return (
        <div key={key} className="col-span-12">
          <Label text={pick(f.label, lang)} />
          {f.hint && (
            <p style={{ marginTop: u(0.2), fontSize: u(1), lineHeight: 1.4, color: MUTED, fontStyle: 'italic' }}>
              {pick(f.hint, lang)}
            </p>
          )}
          {/* Ruled lines, not an empty rectangle. People write straight on
              lines and crooked in boxes, and it is the crooked handwriting
              that somebody has to read back off a scan. */}
          <div style={{ marginTop: u(0.3) }}>
            {Array.from({ length: f.lines }, (_, i) => (
              <div key={i} style={{ height: u(2.9), borderBottom: `1px solid ${RULE}` }} />
            ))}
          </div>
        </div>
      );

    case 'grid':
      return (
        <div key={key} className="col-span-12">
          {f.label && <Label text={pick(f.label, lang)} />}
          <table
            className="w-full border-collapse"
            style={{ marginTop: u(0.4) }}
          >
            {/* table-header-group repeats the headings on every page a long
                table runs onto. Without it the second sheet of an attendance
                list is six unlabelled columns of empty boxes. */}
            <thead style={{ display: 'table-header-group' }}>
              <tr>
                {f.columns.map((c, i) => (
                  <th
                    key={i}
                    className="text-start align-bottom font-extrabold"
                    style={{
                      width: `${(c.width / 12) * 100}%`,
                      border: `1px solid ${RULE}`,
                      color: NAVY,
                      padding: u(0.55),
                      fontSize: u(1.2),
                      lineHeight: 1.3,
                    }}
                  >
                    {pick(c.head, lang)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: f.rows }, (_, r) => (
                /* A table may split across pages — an eighteen-row attendance
                   list has to — but never through a row. */
                <tr key={r} style={{ breakInside: 'avoid' }}>
                  {f.columns.map((_, i) => (
                    <td key={i} style={{ height: u(ROW), border: `1px solid ${RULE}` }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'checklist':
      return (
        <div key={key} className="col-span-12">
          {f.label && <Label text={pick(f.label, lang)} />}
          <ul style={{ marginTop: u(0.4) }}>
            {f.items.map((item, i) => (
              <li key={i} className="flex items-start" style={{ gap: u(1.1), marginTop: u(0.8) }}>
                <span
                  aria-hidden
                  className="shrink-0"
                  style={{ marginTop: u(0.2), height: u(1.7), width: u(1.7), border: `1px solid ${NAVY}` }}
                />
                <span style={{ fontSize: u(1.3), lineHeight: 1.45, color: INK }}>
                  {pick(item, lang)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'note':
      return (
        <p
          key={key}
          className="col-span-12"
          style={{
            borderInlineStart: `${u(0.3)} solid ${NAVY}`,
            paddingInlineStart: u(1),
            fontSize: u(1.15),
            lineHeight: 1.55,
            color: MUTED,
          }}
        >
          {pick(f.text, lang)}
        </p>
      );

    case 'signoff':
      return (
        <div key={key} className="col-span-12 flex flex-wrap" style={{ gap: u(2.6), marginTop: u(0.6) }}>
          {f.roles.map((role, i) => (
            <div key={i} className="flex-1" style={{ minWidth: '26%' }}>
              <Label text={pick(role, lang)} />
              <div style={{ marginTop: u(2.2), borderBottom: `1px solid ${RULE}` }} />
              <div className="flex" style={{ marginTop: u(0.4), gap: u(1.2), fontSize: u(1), color: MUTED }}>
                <span className="flex-1">
                  {lang === 'ar' ? 'الاسم والتوقيع' : 'Name and signature'}
                </span>
                <span className="w-[30%]" style={{ borderBottom: `1px solid ${RULE}` }} />
                <span>{lang === 'ar' ? 'التاريخ' : 'Date'}</span>
              </div>
            </div>
          ))}
        </div>
      );
  }
}

export function TemplateSheet({
  template,
  lang,
  siteName,
}: {
  template: Template;
  lang: Locale;
  siteName: string;
}) {
  const t = template;
  const foot: Bilingual = {
    ar: `${siteName} — علم وخبر رقم ${ORG.registrationNumber}`,
    en: `${siteName} — registration no. ${ORG.registrationNumber}`,
  };

  /*
   * 210/297 for the wide sheet, so one unit is the same number of
   * millimetres whichever way the paper is turned.
   */
  const unit = t.orientation === 'landscape' ? '0.7071cqw' : '1cqw';

  /*
   * The sheet's own width on paper, and the width it refuses to go below on a
   * screen. `--u` is a fraction of it, so this one number is what keeps the
   * preview at printed size instead of at phone size.
   */
  const paper = t.orientation === 'landscape' ? '297mm' : '210mm';

  return (
    /*
     * As tall as the form is, not as tall as one sheet.
     *
     * This was a fixed `aspect-[210/297]`, which looked right in preview and
     * cut ten of the twelve forms off at the printer — the attendance sheet
     * lost six of its eighteen rows, silently, because a fixed-ratio box just
     * clips what will not fit. A form is a document: it runs onto a second
     * page when it needs one, and the rules above keep sections and table
     * rows whole across the break.
     */
    <div
      className="template-sheet mx-auto w-full bg-white"
      style={
        {
          containerType: 'inline-size',
          /*
           * Wider than its column on a narrow screen, on purpose — the page
           * puts it in a container that scrolls. Print overrides this back to
           * 0 and fixes the width in millimetres, so nothing here reaches the
           * paper.
           */
          minWidth: paper,
          color: INK,
          '--u': unit,
        } as React.CSSProperties
      }
    >
      <div
        className="flex min-h-full flex-col"
        style={{ paddingInline: u(5.5), paddingBlock: u(3.4) }}
      >
        {/* -------------------------------------------------------- head */}
        <div
          className="flex items-start"
          style={{ gap: u(2.6), borderBottom: `1px solid ${NAVY}`, paddingBottom: u(1.6) }}
        >
          {/* The full lockup, on paper — the ground it was drawn for. No white
              chip behind it and no recolouring: both are ways of admitting the
              logo has been put somewhere it does not belong. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.svg" alt={siteName} className="w-auto shrink-0" style={{ height: u(8.6) }} />

          <div className="min-w-0 flex-1">
            {/* h2, not h1. The page around this already has one, and two on
                a page leaves a screen reader with no single answer to "what
                is this?". Print has no heading levels, so the sheet loses
                nothing. */}
            <h2 className="font-extrabold" style={{ fontSize: u(2.7), lineHeight: 1.2, color: NAVY }}>
              {pick(t.title, lang)}
            </h2>
            <p style={{ marginTop: u(0.5), fontSize: u(1.25), lineHeight: 1.5, color: MUTED }}>
              {pick(t.purpose, lang)}
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------- body */}
        <div className="flex-1" style={{ paddingTop: u(2) }}>
          {t.sections.map((s, si) => (
            <section
              key={si}
              /* A section that splits across a page leaves its heading
                 stranded at the bottom of one sheet and its fields at the top
                 of the next. */
              style={{ breakInside: 'avoid', marginTop: si > 0 ? u(1.8) : 0 }}
            >
              <h3 className="font-extrabold" style={{ fontSize: u(1.6), lineHeight: 1.3, color: NAVY }}>
                {pick(s.title, lang)}
              </h3>
              {s.lede && (
                <p style={{ marginTop: u(0.3), fontSize: u(1.1), lineHeight: 1.5, color: MUTED, fontStyle: 'italic' }}>
                  {pick(s.lede, lang)}
                </p>
              )}
              <div
                className="grid grid-cols-12"
                style={{ marginTop: u(0.9), columnGap: u(1.8), rowGap: u(1.05) }}
              >
                {s.fields.map((f, fi) => renderField(f, lang, fi))}
              </div>
            </section>
          ))}
        </div>

        {/* ------------------------------------------------------- foot */}
        <div
          className="flex items-center justify-between"
          style={{
            marginTop: u(1.8),
            borderTop: `1px solid ${RULE}`,
            paddingTop: u(1),
            gap: u(1.8),
            fontSize: u(1),
            color: MUTED,
          }}
        >
          <span>{pick(foot, lang)}</span>
          {/* The slug, so a filled-in sheet found in a folder later can be
              traced back to which form it was. */}
          <span dir="ltr">{t.slug}</span>
        </div>
      </div>
    </div>
  );
}
