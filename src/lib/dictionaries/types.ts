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
  account: Account;
};

/** Membership statuses, mirrored from `lib/auth`. Every one needs a label in both locales. */
export type StatusLabels = {
  registered_user: string;
  course_participant: string;
  volunteer_applicant: string;
  volunteer_candidate: string;
  accepted_volunteer: string;
  active_volunteer: string;
  inactive_volunteer: string;
  volunteer_alumni: string;
  suspended: string;
  rejected: string;
};

export type Account = {
  join: {
    kicker: string;
    title: string;
    lede: string;
    fullName: string;
    email: string;
    password: string;
    passwordHint: string;
    confirm: string;
    submit: string;
    haveAccount: string;
    loginLink: string;
  };
  login: {
    kicker: string;
    title: string;
    lede: string;
    email: string;
    password: string;
    submit: string;
    noAccount: string;
    joinLink: string;
  };
  dashboard: {
    kicker: string;
    title: string;
    greeting: string;
    statusLabel: string;
    nextStep: string;
    applyCta: string;
    applyPending: string;
    coursesTitle: string;
    coursesLede: string;
    coursesCta: string;
    applicationTitle: string;
    logout: string;
  };
  apply: {
    kicker: string;
    title: string;
    lede: string;
    aboutYou: string;
    dateOfBirth: string;
    dateOfBirthHint: string;
    phone: string;
    city: string;
    emergencyName: string;
    emergencyPhone: string;
    guardianTitle: string;
    guardianLede: string;
    guardianName: string;
    guardianRelation: string;
    guardianPhone: string;
    guardianConsent: string;
    yourInterest: string;
    motivation: string;
    motivationHint: string;
    availability: string;
    availabilityHint: string;
    interests: string;
    interestsHint: string;
    experience: string;
    experienceHint: string;
    commitments: string;
    codeOfConduct: string;
    safeguarding: string;
    dataConsent: string;
    submit: string;
    submitted: string;
    submittedLede: string;
    alreadyTitle: string;
    optional: string;
  };
  errors: {
    required: string;
    invalidEmail: string;
    passwordTooShort: string;
    passwordMismatch: string;
    emailTaken: string;
    invalidCredentials: string;
    suspended: string;
    tooYoung: string;
    guardianRequired: string;
    commitmentsRequired: string;
    durationInvalid: string;
    durationRange: string;
    dateFuture: string;
    reasonRequired: string;
    dbUnavailable: string;
    generic: string;
  };
  hours: {
    kicker: string;
    title: string;
    lede: string;
    verifiedLabel: string;
    pendingLabel: string;
    stageLabel: string;
    notStarted: string;
    stageOf: string;
    logTitle: string;
    dateLabel: string;
    durationLabel: string;
    durationHint: string;
    activityLabel: string;
    activityNone: string;
    noteLabel: string;
    submit: string;
    historyTitle: string;
    empty: string;
    colDate: string;
    colActivity: string;
    colDuration: string;
    colStatus: string;
    statusPending: string;
    statusVerified: string;
    statusRejected: string;
    statusCorrected: string;
    correctionOf: string;
    backToAccount: string;
  };
  statuses: StatusLabels;
  /** What the person should do next, keyed by status. */
  nextSteps: StatusLabels;
};
