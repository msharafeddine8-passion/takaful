/**
 * The one sentence that explains a credited activities figure, in one file.
 *
 * Its own module rather than three splices into types.ts / ar.ts / en.ts,
 * following recognition-admin.ts, role-search.ts and member-profile.ts. Those
 * three files are large, edited in lockstep and edited by other work; a
 * namespace landing in the middle of all three at once is a conflict nobody
 * learns anything from resolving. Folding it in later is three one-line edits.
 *
 * ── WHY THERE IS A SENTENCE AT ALL ────────────────────────────────────────
 *
 * `activitiesCredited` in lib/impact.ts turns 300 carried hours into 151
 * activities. That is arithmetic the association chose, not a register anybody
 * filled in, and printing it bare — beside figures that ARE registers — would
 * be the platform claiming something it cannot show. So every surface that
 * shows a volunteer their own credited figure says where part of it came from
 * and at what rate, in one sentence, in the language they are reading.
 *
 * ── AND WHY IT IS NOT ON THE PUBLIC CARD ──────────────────────────────────
 *
 * «صنّاع الاستمرارية» and the boards print the figure and nothing else. A
 * thank-you page is not the place to explain the association's own bookkeeping
 * to strangers, and a footnote about how somebody's number was arrived at,
 * attached to their name in public, reads as a caveat about the person. The
 * explanation belongs where the person can act on it: their own pages, and the
 * staff file where a coordinator may have to answer for the number.
 *
 * Two voices, because they are read by different people. `mine` speaks to the
 * volunteer about their own record; `file` speaks about somebody else's, and
 * is the wording staff see.
 */

/** 'ar' | 'en', spelled out rather than imported, so this file stays a leaf. */
type PriorActivitiesLocale = 'ar' | 'en';

/** The five forms `countPhrase` in lib/when.ts asks for. Only few/many take {n}. */
export type CountForms = {
  zero: string;
  one: string;
  two: string;
  few: string;
  many: string;
};

export type PriorActivitiesStrings = {
  /** To the volunteer, about their own figure. Dashboard tile and passport. */
  mine: CountForms;
  /** To staff, about somebody else's. The member file. */
  file: CountForms;
};

const ar: PriorActivitiesStrings = {
  /*
   * «بواقع» is the register the association's own paperwork uses for a rate,
   * and «لكلّ ساعتين» keeps the dual rather than reaching for «٢ ساعات».
   * The zero form is never rendered — the callers ask only when the derived
   * count is above nought — and is written plainly rather than left empty so
   * that a caller which forgets to check prints a true sentence.
   */
  mine: {
    zero: 'لا شيء في هذا الرقم محتسب من ساعات ما قبل إطلاق الموقع.',
    one: 'منها نشاط واحد محتسب من تطوّعك قبل إطلاق الموقع، بواقع نشاط لكلّ ساعتين.',
    two: 'منها نشاطان محتسبان من تطوّعك قبل إطلاق الموقع، بواقع نشاط لكلّ ساعتين.',
    few: 'منها {n} أنشطة محتسبة من تطوّعك قبل إطلاق الموقع، بواقع نشاط لكلّ ساعتين.',
    many: 'منها {n} نشاطاً محتسباً من تطوّعك قبل إطلاق الموقع، بواقع نشاط لكلّ ساعتين.',
  },
  file: {
    zero: 'لا شيء في هذا الرقم محتسب من الساعات المحمولة من قبل الموقع.',
    one: 'منها نشاط واحد محتسب من الساعات المحمولة من قبل الموقع، بواقع نشاط لكلّ ساعتين.',
    two: 'منها نشاطان محتسبان من الساعات المحمولة من قبل الموقع، بواقع نشاط لكلّ ساعتين.',
    few: 'منها {n} أنشطة محتسبة من الساعات المحمولة من قبل الموقع، بواقع نشاط لكلّ ساعتين.',
    many: 'منها {n} نشاطاً محتسباً من الساعات المحمولة من قبل الموقع، بواقع نشاط لكلّ ساعتين.',
  },
};

const en: PriorActivitiesStrings = {
  mine: {
    zero: 'None of this figure is credited from hours predating the site.',
    one: 'One of these is credited from your volunteering before the site, at one activity for every two hours.',
    two: 'Two of these are credited from your volunteering before the site, at one activity for every two hours.',
    few: '{n} of these are credited from your volunteering before the site, at one activity for every two hours.',
    many: '{n} of these are credited from your volunteering before the site, at one activity for every two hours.',
  },
  file: {
    zero: 'None of this figure is credited from hours carried over from before the site.',
    one: 'One of these is credited from hours carried over from before the site, at one activity for every two hours.',
    two: 'Two of these are credited from hours carried over from before the site, at one activity for every two hours.',
    few: '{n} of these are credited from hours carried over from before the site, at one activity for every two hours.',
    many: '{n} of these are credited from hours carried over from before the site, at one activity for every two hours.',
  },
};

export function priorActivities(lang: PriorActivitiesLocale): PriorActivitiesStrings {
  return lang === 'ar' ? ar : en;
}
