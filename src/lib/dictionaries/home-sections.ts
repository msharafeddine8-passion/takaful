import type { Locale } from '@/lib/i18n';

/**
 * The four strings the reordered homepage needed and nowhere else already had.
 *
 * ── WHY THIS FILE IS FOUR STRINGS LONG ────────────────────────────────────
 *
 * Section 54 of the brief reorders the front page into ten bands, and seven of
 * them now stand for a page one level down: opportunities, the volunteer path,
 * the academy, the projects, the stories, the partners. A band that stands for
 * a page should be *worded* by that page — so every kicker, heading and lede on
 * the new homepage is read out of the dictionary the destination already owns:
 *
 *   Impact          dict.home.statsTitle / statsNote
 *   What we do      dict.nav.areas, dict.home.areasTitle / areasLede
 *   Opportunities   dict.account.activities.kicker / title / lede
 *   Volunteer path  dict.journey.kicker / title / lede
 *   Academy         dict.home.academyTitle / academyLede / academyCta
 *   Projects        dict.projects.kicker / title / lede
 *   Stories         dictionaries/stories.ts sectionKicker / sectionTitle / sectionLede
 *   Partners        dictionaries/partners.ts kicker / title / lede
 *   Join            dict.home.joinTitle / joinLede / joinCta / joinCtaAlt
 *
 * Nothing above was rewritten for the homepage. A band that says one thing on
 * the front page and another on the page it links to is two descriptions of one
 * activity, and the second one a visitor reads makes them wonder which is
 * current. The only thing genuinely missing was the label on the button at the
 * foot of each band, because none of those pages has a link back to itself.
 *
 * Its own module rather than four splices into types.ts / ar.ts / en.ts,
 * following dictionaries/partners.ts and dictionaries/stories.ts for the reason
 * they give: those three files are edited in lockstep by other work, and new
 * keys landing in the middle of them are a conflict nobody learns anything from
 * resolving. To fold it in later, add `homeSections: HomeSectionStrings` to the
 * Dictionary type and spread these two objects into ar.ts and en.ts.
 *
 * ── THE FOUR ARE SEPARATE KEYS AND NOT ONE TEMPLATE ───────────────────────
 *
 * «كلّ الفرص المتاحة» agrees with «الفرص» and «كلّ الشركاء» with «الشركاء»; a
 * single «كلّ {thing}» would be correct in English and wrong in Arabic as soon
 * as the noun changed number or gender. Four keys, four sentences, each written
 * whole in the language it is read in.
 */
export type HomeSectionStrings = {
  /** Under «الفرص المتاحة». Leads to /opportunities, which lists the undated ones too. */
  allOpportunities: string;
  /** Under «مشاريعنا الاستراتيجية». Leads to /projects. */
  allProjects: string;
  /** Under «قصص من الميدان». Leads to /gallery. */
  allStories: string;
  /** Under «شركاؤنا». Leads to /partners. */
  allPartners: string;

  /*
   * The opportunities band when nothing has a date yet, which is the state the
   * association is actually in.
   *
   * The band was going to be dropped entirely in that case, and the reasoning
   * was sound — «الفرص المتاحة» over eight cards reading «لم يُحدَّد التاريخ»
   * promises what is not on. But dropping it leaves a volunteering
   * association's front page with nothing a visitor can act on at all, and the
   * eight are real activities with people already waiting on each. So the
   * heading changes with the contents instead: what is on, or what is being
   * prepared.
   */
  comingTitle: string;
  comingLede: string;
  /** On a card with no date. Says what is true, then what to do about it. */
  dateUnset: string;
};

const homeSectionsAr: HomeSectionStrings = {
  allOpportunities: 'كلّ الفرص المتاحة',
  allProjects: 'كلّ المشاريع',
  allStories: 'كلّ القصص',
  allPartners: 'كلّ الشركاء',
  comingTitle: 'أنشطة قيد التحضير',
  comingLede:
    'مواعيدها لم تُحدَّد بعد. أبدِ اهتمامك بما يعنيك منها، ونُعلمك أوّل ما يُثبَّت موعده.',
  dateUnset: 'الموعد قيد التحديد',
};

const homeSectionsEn: HomeSectionStrings = {
  allOpportunities: 'All open opportunities',
  allProjects: 'All projects',
  allStories: 'All stories',
  allPartners: 'All partners',
  comingTitle: 'Activities being arranged',
  comingLede:
    'None of these has a date yet. Say you are interested in the ones that matter to you, and we will tell you the moment one is settled.',
  dateUnset: 'A date is being settled',
};

export const homeSectionDictionaries: Record<Locale, HomeSectionStrings> = {
  ar: homeSectionsAr,
  en: homeSectionsEn,
};

export function homeSections(lang: Locale): HomeSectionStrings {
  return homeSectionDictionaries[lang];
}
