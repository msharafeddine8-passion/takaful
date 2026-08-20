import type { Dictionary } from '@/lib/dictionaries';

/**
 * The thirteen strings the header shows, and nothing else.
 *
 * The header is a client component on every page. When it took the whole
 * Dictionary as a prop, React serialised the entire dictionary into every
 * response — about 55KB of the 91KB an academy page weighed — carrying staff
 * labels, hour statuses and report headings to a visitor reading a course.
 * On a phone on a weak connection that is the difference between a page
 * arriving and a page being abandoned.
 *
 * This lives in its own module rather than beside the component because the
 * component file is marked 'use client', and a server layout cannot call a
 * function exported from a client module.
 */
export type HeaderStrings = {
  siteName: string;
  switchTo: string;
  account: string;
  volunteer: string;
  menu: string;
  home: string;
  about: string;
  areas: string;
  academy: string;
  opportunities: string;
  journey: string;
  projects: string;
  gallery: string;
  contact: string;
};

export function headerStrings(dict: Dictionary): HeaderStrings {
  return {
    siteName: dict.meta.siteName,
    switchTo: dict.common.switchTo,
    account: dict.account.dashboard.kicker,
    // The header CTA now opens the volunteer-or-learner chooser, so it is
    // labelled for what it does rather than for one of the two outcomes.
    volunteer: dict.nav.createAccount,
    menu: dict.nav.menu,
    home: dict.nav.home,
    about: dict.nav.about,
    areas: dict.nav.areas,
    academy: dict.nav.academy,
    opportunities: dict.account.activities.kicker,
    journey: dict.nav.journey,
    projects: dict.nav.projects,
    gallery: dict.nav.gallery,
    contact: dict.nav.contact,
  };
}
