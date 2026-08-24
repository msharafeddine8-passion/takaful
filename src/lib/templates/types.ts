import type { Locale } from '@/lib/i18n';

/**
 * The shape of a printable form.
 *
 * Templates are authored as data rather than as JSX because the same
 * description has to produce three things that must not drift apart: the
 * sheet a volunteer prints, the summary in the library, and the probe's
 * account of what exists. A form written directly as markup can only produce
 * the first, and the other two go stale the day somebody edits it.
 */

export type Bilingual = { ar: string; en: string };

/** One row of ruled line, or several. Everything a paper form is made of. */
export type Field =
  /** A short answer on a ruled line. `width` is out of 12 columns. */
  | { kind: 'line'; label: Bilingual; width?: number; hint?: Bilingual }
  /** A long answer in a box `lines` tall. */
  | { kind: 'box'; label: Bilingual; lines: number; hint?: Bilingual }
  /** A table: headers across, `rows` blank rows down. */
  | { kind: 'grid'; label?: Bilingual; columns: { head: Bilingual; width: number }[]; rows: number }
  /** Tick boxes. Printed, not interactive — this is a sheet of paper. */
  | { kind: 'checklist'; label?: Bilingual; items: Bilingual[] }
  /** Printed guidance. Not somewhere to write. */
  | { kind: 'note'; text: Bilingual }
  /** Name, signature and date, side by side. */
  | { kind: 'signoff'; roles: Bilingual[] };

export type Section = {
  title: Bilingual;
  /** Shown under the section heading, in small print. */
  lede?: Bilingual;
  fields: Field[];
};

/**
 * Whether the association can hand this to a volunteer today.
 *
 * 'ready' is an operational form — an agenda, an attendance sheet — where
 * getting it wrong wastes time and nothing else.
 *
 * 'needs-review' is the rest: child protection, consent, safety, anything
 * with a legal edge. Those are drafted here as a starting point for the
 * specialist who has to approve them, and the library refuses to print them
 * until somebody with the standing to do so has said yes. A downloadable
 * incident-report form is a policy document whatever it says at the top of
 * it, and a volunteer filling one in has no way to know it was never signed
 * off.
 */
export type ReviewState = 'ready' | 'needs-review';

/**
 * A form somebody could be harmed by.
 *
 * Not a severity label — a structural requirement. A form that records a
 * child protection concern, takes consent for a photograph, or certifies that
 * a place was checked before people were taken to it, has to end with a named
 * person putting their name to it and a note of when the association adopted
 * the wording. An anonymous incident report is a document nobody stands
 * behind, and an anonymous safety checklist is a tick nobody made.
 *
 * `problemsWith` enforces the sign-off; probe-templates asserts the four that
 * carry a duty are still marked as carrying one.
 */
export type CarriesDuty = true;

export type Template = {
  slug: string;
  title: Bilingual;
  /** One line, in the library card and under the heading on the sheet. */
  purpose: Bilingual;
  /** Which course teaches the thing this form is for. Slug, or null. */
  course: string | null;
  review: ReviewState;
  /** Why a specialist has to see it. Required when review is 'needs-review'. */
  reviewBecause?: Bilingual;
  /** See CarriesDuty. Forces a sign-off at the end of the form. */
  carriesDuty?: CarriesDuty;
  orientation: 'portrait' | 'landscape';
  sections: Section[];
};

export function pick(b: Bilingual, lang: Locale): string {
  return lang === 'ar' ? b.ar : b.en;
}
