import type { LmsStrings } from './lms';

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
    /** The header button. It says «create an account» rather than «volunteer
     *  with us», because that door now opens onto a choice between the two. */
    createAccount: string;
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
  /** The printable forms library. */
  resources: {
    kicker: string;
    title: string;
    lede: string;
    printCta: string;
    openCta: string;
    backToLibrary: string;
    forCourse: string;
    readyTitle: string;
    readyCount: string;
    heldTitle: string;
    heldLede: string;
    heldBadge: string;
    heldOnSheet: string;
    whyHeld: string;
    printHint: string;
    notFound: string;
  };
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
  /**
   * Getting around the account. Kept separate from each page's own title
   * because a page heading and a navigation label are different jobs — a
   * heading can explain itself, a label in a phone's bottom bar has room for
   * about two words.
   */
  nav: {
    label: string;
    groupWhereIStand: string;
    groupWhatIDo: string;
    groupWhatIEarned: string;
    groupMe: string;
    dashboard: string;
    journey: string;
    learning: string;
    activities: string;
    hours: string;
    achievements: string;
    certificates: string;
    card: string;
    notifications: string;
    profile: string;
    safeguarding: string;
  };
  /**
   * The one card that matters, and the small list under it. One entry per
   * StepKey in lib/account-state.ts — if a step is added there without a
   * string here, this type stops the build rather than the page rendering a
   * blank card.
   */
  step: {
    heading: string;
    otherTasks: string;
    titles: Record<
      'safeguarding' | 'claim-roster' | 'apply' | 'await-decision'
      | 'stage-requirement' | 'finish-course' | 'attend-activity'
      | 'find-activity' | 'start-learning' | 'nothing',
      string
    >;
    ctas: Record<
      'safeguarding' | 'claim-roster' | 'apply' | 'await-decision'
      | 'stage-requirement' | 'finish-course' | 'attend-activity'
      | 'find-activity' | 'start-learning' | 'nothing',
      string
    >;
    /** Said to a stopped account. Never carries an internal reason. */
    suspended: string;
    rejected: string;
  };
  /**
   * The four figures, phrased as sentences. «1 / 41» is not something a person
   * says, and Arabic counts in five bands rather than two — see countPhrase.
   */
  impact: {
    hours: { zero: string; one: string; two: string; few: string; many: string };
    courses: { zero: string; one: string; two: string; few: string; many: string };
    activities: { zero: string; one: string; two: string; few: string; many: string };
    certificates: { zero: string; one: string; two: string; few: string; many: string };
  };
  /** The fork at the front door: volunteer, or here for the courses. */
  chooser: {
    title: string;
    lede: string;
    volunteerTitle: string;
    volunteerBody: string;
    volunteerLede: string;
    learnerTitle: string;
    learnerBody: string;
    learnerLede: string;
    continueCta: string;
    changeChoice: string;
  };
  /** Recognising someone the association already has on its roster. */
  claim: {
    kicker: string;
    title: string;
    lede: string;
    phoneLabel: string;
    phoneHint: string;
    numberLabel: string;
    numberHint: string;
    dobLabel: string;
    dobHint: string;
    submit: string;
    notFoundTitle: string;
    notFoundBody: string;
    notListed: string;
    applyInstead: string;
    pendingTitle: string;
    pendingBody: string;
    approvedTitle: string;
    approvedBody: string;
    backToAccount: string;
    errNeedIdentifier: string;
    errAlreadyClaimed: string;
    errUnavailable: string;
    /** The prompt on the account page that sends people here. */
    bannerTitle: string;
    bannerBody: string;
    bannerCta: string;
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
    passwordUnchanged: string;
    emailTaken: string;
    invalidCredentials: string;
    tooManyAttempts: string;
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
    carriedOver: string;
    backToAccount: string;
  };
  profile: {
    title: string;
    lede: string;
    photo: string;
    photoAdd: string;
    photoChange: string;
    photoSaving: string;
    photoHint: string;
    photoTooLarge: string;
    photoBadType: string;
    photoRemove: string;
    fullName: string;
    displayName: string;
    bio: string;
    interests: string;
    skills: string;
    languages: string;
    save: string;
    saved: string;
    memberNumber: string;
    noMemberNumber: string;
    cardCta: string;
  };
  password: {
    title: string;
    lede: string;
    current: string;
    next: string;
    confirm: string;
    submit: string;
    saving: string;
    done: string;
    doneNote: string;
  };
  card: {
    title: string;
    lede: string;
    memberSince: string;
    memberNumber: string;
    stage: string;
    notMember: string;
    notMemberCta: string;
    print: string;
    savePdf: string;
    fullScreen: string;
    fullScreenClose: string;
    validNote: string;
    /* The public page somebody reaches by scanning the card's QR. Its wording
     * is deliberately thin — see lib/card-view.ts for what it may show. */
    verifyTitle: string;
    verifyValid: string;
    verifyUnknown: string;
    verifyUnknownBody: string;
    verifyFooter: string;
    holder: string;
    statusLabel: string;
    statusActive: string;
    statusInactive: string;
    updatedLabel: string;
    hoursLabel: string;
    scanHint: string;
  };
  certificate: {
    awardedTo: string;
    issuedOn: string;
    codeLabel: string;
    verifyAt: string;
    scanToVerify: string;
    print: string;
    copyLink: string;
    backToAccount: string;
    revokedBanner: string;
    notFound: string;
    registration: string;
    myCertificates: string;
    myCertificatesLede: string;
    none: string;
    view: string;
    skills: string;
    learningTime: string;
    /** The claim the association may actually make. Never "accredited". */
    completionOnly: string;
    share: string;
    shareText: string;
    copied: string;
    kindOrientation: string;
    kindCourse: string;
    kindLevel: string;
    kindProgram: string;
    kindHours: string;
    /** Document titles, one per kind. Orientation uses the course title. */
    docTitleCourse: string;
    docTitleLevel: string;
    docTitleProgram: string;
    docTitleHours: string;
    /** The recognition sentence under the course/path name. Gender-neutral by
        construction: the system does not store gender, so no إتمامه/إتمامها. */
    bodyCourse: string;
    bodyLevel: string;
    bodyProgram: string;
    bodyHours: string;
    /** The distinction mark only the full-path certificate carries. */
    programBadge: string;
    verifiedMark: string;
    /** QR caption on the certificate document. The membership card keeps
        `scanToVerify`; this one names the certificate specifically. */
    scanQr: string;
  };
  path: {
    title: string;
    lede: string;
    youAreHere: string;
    continueTitle: string;
    continueCta: string;
    startTitle: string;
    orientationTitle: string;
    orientationLede: string;
    levelWord: string;
    levelsDone: string;
    coursesDone: string;
    learningTime: string;
    locked: string;
    lockedBecause: string;
    needOrientation: string;
    needCourse: string;
    needChallenge: string;
    needSignIn: string;
    challengeWord: string;
    electivesTitle: string;
    electivesLede: string;
    certificateEarned: string;
    viewCertificate: string;
    nextCertificate: string;
    reviseTitle: string;
    reviseLede: string;
    reviseScore: string;
    notWrittenYet: string;
    complete: string;
    inProgress: string;
    notStarted: string;
    attemptsMade: string;
  };
  /** The path map. Every string authored in ./lms.ts, so this stays one line. */
  map: LmsStrings;
  programme: {
    title: string;
    lede: string;
    courseCount: string;
    statusDraft: string;
    statusReview: string;
    statusPublished: string;
    statusArchived: string;
    contentWritten: string;
    contentMissing: string;
    reviewedOn: string;
    neverReviewed: string;
    markReviewed: string;
    editedByAdmin: string;
    fromSeed: string;
    save: string;
    saved: string;
    noteLabel: string;
    cannotPublishEmpty: string;
    bothLanguagesNeeded: string;
    minutesLabel: string;
    passMarkLabel: string;
    titleArLabel: string;
    titleEnLabel: string;
    summaryArLabel: string;
    summaryEnLabel: string;
    version: string;
    edit: string;
    forbidden: string;
  };
  reports: {
    title: string;
    lede: string;
    funnelTitle: string;
    funnelLede: string;
    registered: string;
    learning: string;
    passedCourse: string;
    applied: string;
    accepted: string;
    contributing: string;
    ofPrevious: string;
    stagesTitle: string;
    stagesLede: string;
    stageWord: string;
    inStage: string;
    completedStage: string;
    medianDays: string;
    noneYet: string;
    coursesTitle: string;
    coursesLede: string;
    started: string;
    finished: string;
    passedCount: string;
    averageBest: string;
    hoursTitle: string;
    hoursLede: string;
    month: string;
    peopleWord: string;
    attendanceTitle: string;
    attendanceLede: string;
    registeredCount: string;
    attendedCount: string;
    noShows: string;
    quietTitle: string;
    quietLede: string;
    quietDays: string;
    empty: string;
    exportTitle: string;
    exportLede: string;
    exportMembers: string;
    exportHours: string;
    exportActivities: string;
  };
  recovery: {
    forgotLink: string;
    forgotTitle: string;
    forgotLede: string;
    emailLabel: string;
    sendLink: string;
    sending: string;
    /** Shown whether or not the address has an account. */
    sentTitle: string;
    sentBody: string;
    resetTitle: string;
    resetLede: string;
    newPassword: string;
    confirmPassword: string;
    setPassword: string;
    resetDoneTitle: string;
    resetDoneBody: string;
    resetInvalidTitle: string;
    resetInvalidBody: string;
    signIn: string;
    verifyTitle: string;
    verifiedBody: string;
    verifyInvalidBody: string;
    verifyChangedBody: string;
    verifyAlreadyBody: string;
    unverifiedBanner: string;
    resend: string;
    resent: string;
    noProvider: string;
  };
  academy: {
    /**
     * The page a locked course shows instead of its content. Every string here
     * has to work as the *whole* answer — the modules are not on that page at
     * all, so this is all the reader gets.
     */
    locked: {
      title: string;
      reasonSignIn: string;
      reasonPrerequisite: string;
      reasonUnpublished: string;
      reasonStaff: string;
      requiredTitle: string;
      signInCta: string;
      goToRequirement: string;
      backToAcademy: string;
      /** Said where content is readable but the certificate is not. */
      readableNotCertified: string;
    };
    /** Index page */
    heroTitle: string;
    heroLede: string;
    continueTitle: string;
    continueCta: string;
    allCourses: string;
    filterAll: string;
    filterLevel: string;
    noneInFilter: string;
    /**
     * Four forms because Arabic counts that way: one, two, three-to-ten, and
     * eleven-plus each take a different noun form. English fills all four.
     */
    coursesCount: string;
    coursesCountOne: string;
    coursesCountTwo: string;
    coursesCountFew: string;
    /** Per-level progress on the index, e.g. «أنجزت 3 من 6 دورات». */
    levelDoneOf: string;
    /** The shelf after the path for courses that sit in no level. */
    electivesTitle: string;
    electivesLede: string;
    /** Replaces the level number on an elective's card. */
    electiveWord: string;
    /** Course card + hero */
    statusAvailable: string;
    statusSoon: string;
    statusDraft: string;
    notStarted: string;
    inProgress: string;
    completed: string;
    start: string;
    resume: string;
    retake: string;
    review: string;
    /** Course page */
    breadcrumbAcademy: string;
    level: string;
    difficulty: string;
    duration: string;
    modulesWord: string;
    questionsWord: string;
    passMark: string;
    language: string;
    certificate: string;
    certificateYes: string;
    aboutTitle: string;
    outcomesTitle: string;
    audienceTitle: string;
    rewardsTitle: string;
    requirementsTitle: string;
    noRequirements: string;
    requiresLabel: string;
    recommendsLabel: string;
    lockedTitle: string;
    lockedBody: string;
    signInToTrack: string;
    signInCta: string;
    /** The course player: one unit to a screen. */
    player: {
      open: string;
      openResume: string;
      contents: string;
      contentsShow: string;
      contentsHide: string;
      unitOf: string;
      next: string;
      prev: string;
      markAndNext: string;
      saving: string;
      savedJust: string;
      overview: string;
      assessmentTitle: string;
      assessmentLede: string;
      stateDone: string;
      stateCurrent: string;
      stateAhead: string;
      progressAria: string;
    };
    /** Module navigation */
    contentsTitle: string;
    moduleOf: string;
    moduleDone: string;
    moduleCurrent: string;
    backToContents: string;
    nextModule: string;
    prevModule: string;
    progressTitle: string;
    modulesDone: string;
    questionsAnswered: string;
    soonBody: string;
    referencesTitle: string;
  };
  achievements: {
    title: string;
    lede: string;
    empty: string;
    emptyCta: string;
    earnedOn: string;
    nextTitle: string;
    /** One per kind: a bare number leaves "4 to go" meaning nothing. */
    remainingHours: string;
    remainingCourses: string;
    remainingActivities: string;
    remainingStages: string;
    revokedNote: string;
    showRevoked: string;
  };
  learning: {
    title: string;
    lede: string;
    notStarted: string;
    inProgress: string;
    passed: string;
    failed: string;
    draft: string;
    bestScore: string;
    recognisedNote: string;
    passMark: string;
    attempts: string;
    modulesRead: string;
    lastAttempt: string;
    start: string;
    resume: string;
    retake: string;
    review: string;
    certificate: string;
    historyTitle: string;
    ongoing: string;
    answeredOf: string;
    empty: string;
  };
  portal: {
    greeting: string;
    youAreIn: string;
    stage: string;
    nextStepTitle: string;
    nothingNext: string;
    summaryHours: string;
    summaryCourses: string;
    summaryActivities: string;
    summaryCertificates: string;
    pendingNote: string;
    upcomingTitle: string;
    continueLearningTitle: string;
    continueCta: string;
    latestCertificate: string;
    exploreTitle: string;
    exploreLede: string;
    learnerNote: string;
  };
  notifications: {
    title: string;
    lede: string;
    empty: string;
    markAllRead: string;
    unread: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
  };
  /** The short record every volunteer must have, however they arrived. */
  safeguarding: {
    kicker: string;
    title: string;
    lede: string;
    ledeExisting: string;
    aboutYou: string;
    dateOfBirth: string;
    dateOfBirthHint: string;
    emergencyTitle: string;
    emergencyLede: string;
    emergencyName: string;
    emergencyPhone: string;
    emergencyRelation: string;
    guardianTitle: string;
    guardianLede: string;
    guardianName: string;
    guardianRelation: string;
    guardianPhone: string;
    guardianConsent: string;
    commitments: string;
    codeOfConduct: string;
    safeguarding: string;
    dataConsent: string;
    medicalNotes: string;
    submit: string;
    saving: string;
    saved: string;
    backToAccount: string;
    bannerTitle: string;
    bannerBody: string;
    bannerCta: string;
  };
  /** Writing an activity, and correcting one. */
  activityForm: {
    createTitle: string;
    editTitle: string;
    lede: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    activityType: string;
    audience: string;
    location: string;
    mapUrl: string;
    mapUrlHint: string;
    imageUrl: string;
    imageUrlHint: string;
    startsAt: string;
    endsAt: string;
    registrationClosesAt: string;
    registrationClosesHint: string;
    datesOptionalHint: string;
    capacity: string;
    capacityHint: string;
    minStage: string;
    minStageHint: string;
    creditedMinutes: string;
    creditedMinutesHint: string;
    requiresApproval: string;
    status: string;
    statusDraft: string;
    statusPublished: string;
    create: string;
    saveEdit: string;
    saving: string;
    savedCreate: string;
    savedEdit: string;
    errors: {
      required: string;
      endsBeforeStarts: string;
      capacityInvalid: string;
      deadlineAfterStart: string;
      badUrl: string;
      unavailable: string;
    };
  };
  /** Recording who turned up. */
  attendance: {
    registered: string;
    attendedCount: string;
    absentCount: string;
    unsetCount: string;
    rate: string;
    totalHours: string;
    searchPlaceholder: string;
    noMatches: string;
    filters: { all: string; attended: string; absent: string; unset: string };
    markAllPresent: string;
    present: string;
    absent: string;
    statusLegend: string;
    alreadySaved: string;
    hoursField: string;
    minutesField: string;
    wholeActivity: string;
    noteField: string;
    save: string;
    saving: string;
    confirmSave: string;
    saved: string;
    cappedToActivity: string;
    warnUnset: string;
    warnEditing: string;
    exportCsv: string;
    errors: {
      forbidden: string;
      cancelled: string;
      notFound: string;
      unavailable: string;
      overLong: string;
    };
  };
  activities: {
    /*
     * Seats and states. `full` below is the old label on the button that
     * closes registration, which is why it read as a status on the staff
     * listing beside "1 / 20". Statuses now live in `state` and `regState`,
     * and the button says what it does.
     */
    seatsTaken: string;
    seatsLeftLabel: string;
    noCapacity: string;
    seatsHeading: string;
    seatsLeftHeading: string;
    /** Shown on the staff listing for an activity volunteers cannot see. */
    draftBadge: string;
    location: string;
    date: string;
    time: string;
    durationLabel: string;
    attendedCount: string;
    cancelReasonLabel: string;
    summaryTitle: string;
    cancelReasonPlaceholder: string;
    state: {
      upcoming: string;
      running: string;
      ended: string;
      cancelled: string;
    };
    regState: {
      open: string;
      almostFull: string;
      full: string;
      deadlinePassed: string;
      closed: string;
      ended: string;
      cancelled: string;
    };
    actions: {
      manageAttendance: string;
      edit: string;
      details: string;
      cancel: string;
      closeRegistration: string;
      reopenRegistration: string;
      deleteEmpty: string;
    };
    kicker: string;
    title: string;
    lede: string;
    none: string;
    spots: string;
    full: string;
    waitlist: string;
    hoursValue: string;
    requiresStage: string;
    join: string;
    joined: string;
    onWaitlist: string;
    leave: string;
    signInToJoin: string;
    refusedStage: string;
    refusedClosed: string;
    refusedNotVolunteer: string;
    refusedAlready: string;
    /**
     * An activity published before its date is known. It offers "tell me when"
     * rather than "register", because registering for something with no date
     * is meaningless — see lib/actions/interest.ts.
     */
    interest: {
      badge: string;
      dateUnknown: string;
      notifyMe: string;
      notifyMeHint: string;
      waiting: string;
      waitingHint: string;
      saving: string;
      signInToBeTold: string;
      staffTitle: string;
      staffLede: string;
      staffEmpty: string;
      staffNotified: string;
      staffWaiting: string;
      errors: { unavailable: string; notVolunteer: string; notWaiting: string };
    };
    mineTitle: string;
    mineLede: string;
    upcoming: string;
    past: string;
    cancelled: string;
    mineNone: string;
    attended: string;
    noShow: string;
    awaitingAttendance: string;
    manageTitle: string;
    manageLede: string;
    roster: string;
    confirmAttendance: string;
    minutesField: string;
    markAttended: string;
    markNoShow: string;
    alreadyRecorded: string;
    newActivity: string;
    titleArField: string;
    titleEnField: string;
    locationField: string;
    startsField: string;
    endsField: string;
    capacityField: string;
    minStageField: string;
    create: string;
    secondCheckOn: string;
  };
  journey: {
    kicker: string;
    title: string;
    lede: string;
    notVolunteer: string;
    notVolunteerCta: string;
    noStages: string;
    currentlyHere: string;
    statusLocked: string;
    statusAvailable: string;
    statusInProgress: string;
    statusRequirementsCompleted: string;
    statusAwaitingApproval: string;
    statusCompleted: string;
    requirements: string;
    toUnlock: string;
    nextStep: string;
    remaining: string;
    completedOn: string;
    optional: string;
    goToCourse: string;
    logHours: string;
  };
  staff: {
    /** The queue of people claiming a place on the association's roster. */
    prior: {
      title: string;
      lede: string;
      hoursHeading: string;
      hoursLabel: string;
      upToLabel: string;
      noteLabel: string;
      hoursNoteHint: string;
      hoursSubmit: string;
      hoursDone: string;
      courseHeading: string;
      courseLabel: string;
      coursePlaceholder: string;
      courseNoteHint: string;
      courseSubmit: string;
      courseDone: string;
      saving: string;
      errors: {
        "hours-missing": string;
        "hours-not-a-number": string;
        "hours-not-positive": string;
        "hours-too-many": string;
        "date-missing": string;
        "date-malformed": string;
        "date-future": string;
        "date-before-founding": string;
        "note-missing": string;
        "course-missing": string;
        "course-unknown": string;
        "note-too-short": string;
        alreadyPassed: string;
        notYourself: string;
        noMember: string;
        unavailable: string;
      };
    };
    roster: {
      title: string;
      lede: string;
      empty: string;
      volunteerSince: string;
      accountName: string;
      accountEmail: string;
      committee: string;
      rosterDob: string;
      linkTitle: string;
      linkLede: string;
      linkEmail: string;
      linkNumber: string;
      linkSubmit: string;
      linkSaving: string;
      linkDone: string;
      linkErrors: {
        needBoth: string;
        noAccount: string;
        noLine: string;
        lineTaken: string;
        alreadyNumbered: string;
        notYourself: string;
        unavailable: string;
      };
      claimedAt: string;
      nameMismatch: string;
      approve: string;
      reject: string;
      rejectReason: string;
    };
    kicker: string;
    title: string;
    lede: string;
    forbidden: string;
    applicationsTitle: string;
    applicationsLede: string;
    hoursTitle: string;
    hoursLede: string;
    queueEmpty: string;
    applicant: string;
    submitted: string;
    age: string;
    city: string;
    motivation: string;
    availability: string;
    interests: string;
    experience: string;
    guardian: string;
    claim: string;
    accept: string;
    waitlist: string;
    reject: string;
    reasonLabel: string;
    reasonHint: string;
    decide: string;
    verify: string;
    rejectHours: string;
    open: string;
    none: string;
    dashboard: {
      title: string;
      lede: string;
      members: string;
      volunteers: string;
      applicationsOpen: string;
      hoursPending: string;
      verifiedHours: string;
      certificates: string;
      coursesPassed: string;
      newThisMonth: string;
      goApplications: string;
      goHours: string;
      goMembers: string;
      goAudit: string;
      nothingWaiting: string;
      waitingOn: string;
    };
    membersPage: {
      title: string;
      lede: string;
      search: string;
      searchGo: string;
      colName: string;
      colStatus: string;
      colRoles: string;
      colHours: string;
      colStage: string;
      colJoined: string;
      noResults: string;
      showing: string;
      noRoles: string;
    };
    member: {
      back: string;
      roles: string;
      grantRole: string;
      grant: string;
      revokeRole: string;
      stages: string;
      awardStage: string;
      award: string;
      hoursTitle: string;
      certificatesTitle: string;
      issueHoursCert: string;
      noCertificates: string;
      revoked: string;
      selfNote: string;
      accessTitle: string;
      accessActive: string;
      accessSuspended: string;
      accessDeactivated: string;
      suspend: string;
      suspendNote: string;
      reactivate: string;
      reactivateNote: string;
      reasonLabel: string;
      reasonPlaceholder: string;
      lastAdminNote: string;
      confirmSuspend: string;
      journeyTitle: string;
      journeyLede: string;
      noJourney: string;
      blockedBy: string;
      requirementMet: string;
      requirementUnmet: string;
      stageDone: string;
      stageCurrent: string;
      stageLocked: string;
      notConfigured: string;
      overrideNote: string;
    };
    journeyBuilder: {
      title: string;
      lede: string;
      version: string;
      stage: string;
      noRequirements: string;
      addRequirement: string;
      kind: string;
      labelAr: string;
      labelEn: string;
      required: string;
      add: string;
      archive: string;
      hoursField: string;
      courseField: string;
      minScoreField: string;
      passMarkField: string;
      documentField: string;
      kindCourse: string;
      kindHours: string;
      kindAssessment: string;
      kindActivity: string;
      kindEvaluation: string;
      kindDocument: string;
      kindApproval: string;
      affects: string;
      hint: string;
    };
    audit: {
      title: string;
      lede: string;
      filterAll: string;
      colWhen: string;
      colWho: string;
      colAction: string;
      colTarget: string;
      colReason: string;
      system: string;
      empty: string;
    };
  };
  verify: {
    title: string;
    lede: string;
    codeLabel: string;
    codePlaceholder: string;
    check: string;
    validTitle: string;
    holder: string;
    issued: string;
    codeLabelShort: string;
    notFoundTitle: string;
    notFound: string;
    revokedTitle: string;
    revoked: string;
    revokedOn: string;
    disclaimer: string;
  };
  statuses: StatusLabels;
  /** What the person should do next, keyed by status. */
  nextSteps: StatusLabels;
};
