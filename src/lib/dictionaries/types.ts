export type Stat = { value: string; label: string };

export type Area = {
  slug: string;
  tag: string;
  title: string;
  short: string;
  long: string;
};

export type Value = { title: string; text: string };

export type Project = { tag: string; name: string; text: string; status?: 'live' | 'soon' };

export type Level = { n: number; title: string; items: string[] };

export type Dictionary = {
  meta: { siteName: string; tagline: string; description: string };
  nav: {
    home: string;
    about: string;
    areas: string;
    academy: string;
    journey: string;
    projects: string;
    gallery: string;
    contact: string;
    volunteer: string;
    menu: string;
  };
  home: {
    kicker: string;
    title: string;
    titleAccent: string;
    lede: string;
    ctaPrimary: string;
    ctaSecondary: string;
    statsTitle: string;
    statsNote: string;
    areasTitle: string;
    areasLede: string;
    academyTitle: string;
    academyLede: string;
    academyCta: string;
    joinTitle: string;
    joinLede: string;
    joinCta: string;
    joinCtaAlt: string;
  };
  stats: Stat[];
  areas: Area[];
  about: {
    title: string;
    lede: string;
    visionTitle: string;
    vision: string;
    missionTitle: string;
    mission: string;
    valuesTitle: string;
    valuesKicker: string;
  };
  values: Value[];
  projects: { kicker: string; title: string; lede: string; comingSoon: string; items: Project[] };
  journey: { kicker: string; title: string; lede: string; levelWord: string; levels: Level[] };
  gallery: { kicker: string; title: string; lede: string };
  contact: {
    kicker: string;
    title: string;
    lede: string;
    phone: string;
    email: string;
    address: string;
    addressValue: string;
    social: string;
    registration: string;
    registrationValue: string;
    registrationNote: string;
    ctaVolunteer: string;
    ctaPartner: string;
  };
  footer: { orgTitle: string; volunteersTitle: string; rights: string };
  common: { readMore: string; backHome: string; switchTo: string; skipToContent: string };
};
