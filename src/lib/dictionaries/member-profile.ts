import type { Locale } from '@/lib/i18n';

/**
 * Strings for the member file — the one page that gathers everything the
 * association knows about a person.
 *
 * Its own module rather than three splices into types.ts / ar.ts / en.ts,
 * following dictionaries/recognition-admin.ts. Those three files are being
 * edited by other work, and a page's worth of new keys landing in the middle
 * of them is a conflict nobody learns anything from resolving.
 *
 * To fold it into the main dictionary later: add `memberProfile:
 * MemberProfileStrings` to the Dictionary type, then `...` these two objects
 * into ar.ts and en.ts. Nothing else has to move.
 *
 * On the Arabic: nothing here says how old anybody is, and nothing names an
 * emergency contact, a guardian or a medical note. Where the page has to speak
 * about those it speaks about the RECORD — that one exists, that a consent is
 * stamped on it — and the wording is written to make that distinction audible
 * rather than to hedge it.
 */

/** The five forms `countPhrase` in lib/when.ts asks for. */
export type CountForms = {
  zero: string;
  one: string;
  two: string;
  /** 3–10. Must carry {n}. */
  few: string;
  /** 11 and up. Must carry {n}. */
  many: string;
};

export type MemberProfileStrings = {
  title: string;
  lede: string;
  back: string;

  standingTitle: string;
  accountStatus: Record<string, string>;
  membershipTitle: string;
  membership: Record<string, string>;
  membershipNone: string;
  rolesTitle: string;
  rolesNone: string;
  volunteerYes: string;
  volunteerNo: string;
  ageTitle: string;
  ageMinor: string;
  ageAdult: string;
  ageUnknown: string;
  ageNote: string;
  lastSeenTitle: string;
  lastSeen: string;
  lastSeenNever: string;

  sinceTitle: string;
  since: string;
  accountSince: string;
  predates: string;
  sinceNone: string;

  rosterTitle: string;
  rosterNone: string;
  rosterNumber: string;
  rosterCommittee: string;
  rosterClaimed: string;
  rosterApproved: string;
  rosterHow: string;
  rosterHowNone: string;
  strengths: Record<string, string>;
  recognition: Record<string, string>;
  rosterWaiting: string;

  hoursTitle: string;
  hoursVerified: string;
  hoursPending: string;
  hoursCarried: string;
  hoursOnPlatform: string;
  hoursNote: string;

  activitiesTitle: string;
  activitiesRegistered: string;
  activitiesAttended: string;
  activitiesMissed: string;
  activitiesRate: string;
  activitiesRateNone: string;
  activitiesNote: string;

  coursesTitle: string;
  coursesPassed: string;
  coursesOpen: string;
  coursesNone: string;

  certificatesTitle: string;
  certificatesHeld: string;
  certificatesRevoked: string;
  certificatesNone: string;
  revokeReason: string;

  badgesTitle: string;
  badgesHeld: string;
  badgesWithdrawn: string;
  badgesNone: string;
  badgeByHand: string;
  badgeUnknown: string;
  withdrawReason: string;

  pointsTitle: string;
  pointsNote: string;

  stagesTitle: string;
  stagesNone: string;
  stageReached: string;

  safeguardingTitle: string;
  safeguardingOnFile: string;
  safeguardingNone: string;
  guardianConsent: string;
  guardianConsentNone: string;
  agreements: string;
  agreementsNone: string;
  medicalNote: string;
  medicalNoteNone: string;
  safeguardingPrivacy: string;
  minorWithoutRecord: string;

  visibilityTitle: string;
  visibility: Record<string, string>;
  visibilityChose: string;
  visibilityNeverChose: string;
  visibilityUnexplained: string;
  visibilityMinor: string;

  auditTitle: string;
  auditLede: string;
  auditEmpty: string;
  auditSystem: string;
  auditNoActor: string;
  actions: Record<string, string>;

  linksTitle: string;
  linksLede: string;
  linkMember: string;
  linkHours: string;
  linkRoster: string;
  linkRecognition: string;
  linkAudit: string;
  linkSafeguarding: string;

  counts: {
    activities: CountForms;
    attended: CountForms;
    courses: CountForms;
    attempts: CountForms;
    certificates: CountForms;
    badges: CountForms;
    points: CountForms;
    stages: CountForms;
    entries: CountForms;
  };
};

export const memberProfileAr: MemberProfileStrings = {
  title: 'ملفّ العضو',
  lede:
    'كل ما تعرفه الجمعية عن هذا الشخص في صفحة واحدة، للقراءة وحدها. لا زرّ هنا يغيّر شيئاً — '
    + 'الأزرار في الصفحات التي تملك كل باب، وروابطها في آخر الصفحة.',
  back: 'عد إلى صفحة العضو',

  standingTitle: 'الوضع',
  accountStatus: {
    active: 'الحساب فعّال',
    suspended: 'الحساب موقوف',
    deactivated: 'الحساب مُعطَّل',
  },
  membershipTitle: 'حالة العضوية',
  membership: {
    registered_user: 'مستخدم مسجَّل',
    course_participant: 'مشارك في دورة',
    volunteer_applicant: 'مقدّم طلب تطوّع',
    volunteer_candidate: 'مرشّح',
    accepted_volunteer: 'متطوّع مقبول',
    active_volunteer: 'متطوّع نشط',
    inactive_volunteer: 'متطوّع غير نشط',
    volunteer_alumni: 'خرّيج',
    suspended: 'موقوف',
    rejected: 'مرفوض',
  },
  membershipNone: 'لم تُسجَّل له حالة عضوية بعد.',
  rolesTitle: 'الأدوار',
  rolesNone: 'لا أدوار.',
  volunteerYes: 'متطوّع',
  volunteerNo: 'ليس متطوّعاً',
  ageTitle: 'الفئة',
  ageMinor: 'قاصر',
  ageAdult: 'راشد',
  ageUnknown: 'العمر غير مسجَّل',
  ageNote:
    'واقعة لا تاريخ. تاريخ الولادة لا يُعرض على هذه الصفحة، و«غير مسجَّل» تعني أن الجمعية '
    + 'لا تملك تاريخاً لا أنّ الشخص راشد.',
  lastSeenTitle: 'آخر دخول',
  lastSeen: 'آخر دخول في {date}',
  lastSeenNever: 'لم يسجّل دخوله بعد إنشاء الحساب.',

  sinceTitle: 'الانتساب',
  since: 'مع الجمعية منذ {date}',
  accountSince: 'الحساب أُنشئ في {date}',
  predates: 'كان يتطوّع قبل أن توجد هذه المنصّة — لا تقرأ تاريخ الحساب على أنه تاريخ انتسابه.',
  sinceNone: 'لا تاريخ انتساب لدى الجمعية، فتاريخ الحساب هو كل ما يوجد.',

  rosterTitle: 'سجلّ الجمعية',
  rosterNone:
    'غير مرتبط بأي سطر في سجلّ الجمعية: إمّا شخص جديد فعلاً، وإمّا سطرٌ لم يُطالَب به بعد.',
  rosterNumber: 'الرقم',
  rosterCommittee: 'اللجنة',
  rosterClaimed: 'طالب به في',
  rosterApproved: 'أُقرّ في',
  rosterHow: 'كيف طوبق',
  rosterHowNone: 'لم تُسجَّل طريقة المطابقة — مطالبة أقدم من تسجيلها.',
  strengths: {
    'phone-and-name': 'اتّفق الهاتف والاسم',
    'phone-and-dob': 'اتّفق الهاتف وتاريخ الولادة',
    'number-and-name': 'اتّفق رقم العضوية والاسم',
    'number-and-dob': 'اتّفق رقم العضوية وتاريخ الولادة',
    'phone-only': 'الهاتف وحده — لا شيء آخر عضّده',
    'number-only': 'رقم العضوية وحده — لا شيء آخر عضّده',
  },
  recognition: {
    rule: 'اعترف به النظام تلقائياً لتطابق واقعتين مستقلّتين',
    staff: 'أقرّ المطالبة موظّف',
    'staff-link': 'ربطه موظّف بالسطر يدوياً، من دون مطالبة من صاحب الحساب',
    awaiting: 'المطالبة ما تزال بانتظار قرار',
  },
  rosterWaiting:
    'مطالبة لم يُبتّ فيها. المتطوّع ينتظر ولا يعرف أنُسي أم رُدَّ طلبه — القرار يُتَّخذ في صفحة '
    + 'سجلّ التطوّع.',

  hoursTitle: 'الساعات',
  hoursVerified: 'موثّقة',
  hoursPending: 'قيد المراجعة',
  hoursCarried: 'محمولة من قبل المنصّة',
  hoursOnPlatform: 'على المنصّة',
  hoursNote:
    'المحمولة جزءٌ من الموثّقة لا إضافةٌ إليها، و«على المنصّة» هو ما بقي منها. '
    + 'وما هو قيد المراجعة ليس ساعاتٍ بعد، فلا يُجمع إلى شيء.',

  activitiesTitle: 'الأنشطة',
  activitiesRegistered: 'سجَّل على',
  activitiesAttended: 'حضر',
  activitiesMissed: 'تخلّف عن',
  activitiesRate: 'نسبة الحضور {n}%',
  activitiesRateNone: 'لم يسجّل على شيء بعد، فلا نسبة تُحتسب.',
  activitiesNote:
    'ما ألغته الجمعية وما ألغاه هو قبل موعده غير محسوبٍ في الاثنين — لا هذا ولا ذاك تخلّفٌ عن الحضور.',

  coursesTitle: 'الدورات',
  coursesPassed: 'اجتازها',
  coursesOpen: 'بدأها ولم يُنهها',
  coursesNone: 'لم يفتح أي دورة.',

  certificatesTitle: 'الشهادات',
  certificatesHeld: 'سارية',
  certificatesRevoked: 'مسحوبة',
  certificatesNone: 'لا شهادات.',
  revokeReason: 'سبب السحب',

  badgesTitle: 'الشارات',
  badgesHeld: 'يحملها',
  badgesWithdrawn: 'سُحبت منه',
  badgesNone: 'لا شارات.',
  badgeByHand: 'مُنحت بقرار',
  badgeUnknown: 'رمز لا تعرفه قائمة الشارات',
  withdrawReason: 'سبب السحب',

  pointsTitle: 'النقاط',
  pointsNote: 'مجموع دفتر النقاط. لكل نقطة سطرٌ يعود إلى واقعة موثّقة، ولا تُحذف نقطة.',

  stagesTitle: 'المراحل',
  stagesNone: 'لم يبلغ أي مرحلة بعد.',
  stageReached: 'المرحلة {n} في {date}',

  safeguardingTitle: 'بيانات السلامة',
  safeguardingOnFile: 'السجلّ موجود.',
  safeguardingNone: 'لا سجلّ سلامة لهذا الحساب.',
  guardianConsent: 'موافقة وليّ الأمر مسجَّلة.',
  guardianConsentNone: 'لا موافقة وليّ أمر على السجلّ.',
  agreements: 'التعهّدات الثلاثة مسجَّلة.',
  agreementsNone: 'التعهّدات الثلاثة غير مكتملة.',
  medicalNote: 'توجد ملاحظة طبّية على السجلّ.',
  medicalNoteNone: 'لا ملاحظة طبّية.',
  safeguardingPrivacy:
    'وجود السجلّ فقط. لا تُعرض هنا جهة الطوارئ ولا وليّ الأمر ولا الملاحظات الطبّية ولا تاريخ '
    + 'الولادة، ولا تُقرأ من لوحة الموظّفين أصلاً: يحتفظ بها المتطوّع في صفحته، وتحتفظ بها '
    + 'الجمعية في مكتبها.',
  minorWithoutRecord:
    'قاصر بلا سجلّ سلامة. هذا يعني قاصراً يذهب إلى نشاط ميداني ولا جهة طوارئ يمكن الاتّصال بها.',

  visibilityTitle: 'الظهور العلني',
  visibility: {
    hidden: 'لا يظهر على أي صفحة عامة',
    display_name: 'يظهر باسم العرض، بلا صورة',
    name_and_photo: 'يظهر باسمه وصورته',
  },
  visibilityChose: 'اختار هذا بنفسه في {date}.',
  /* «والافتراضي هو الإخفاء» was true until migration 038 and is now the
     opposite of what happens: the association decided that appearing is the
     ordinary state, the default became name_and_photo, and every account that
     had never answered was moved to it. Staff reading this line have to know
     which way the silence falls, because it is the line they will be looking
     at the day somebody asks why their name is on the internet. */
  visibilityNeverChose:
    'لم يُسأل قطّ. القيمة الافتراضية هي التي تتكلّم عنه، لا هو — والافتراضي منذ قرار الجمعية '
    + 'هو الظهور، فسكوتُه ليس موافقةً منه.',
  visibilityUnexplained:
    'يظهر علنياً ولا سجلّ لموافقته. هذا لا ينبغي أن يحدث: كل مسار يكتب الاختيار يكتب وقته معه.',
  visibilityMinor:
    'قاصر: لا يُنشر اسمه القانوني ولا صورته على صفحة عامة مهما كان اختياره. القرار في '
    + 'lib/visibility.ts، لا في هذه الخانة.',

  auditTitle: 'ما جرى على هذا الحساب',
  auditLede:
    'من فعل ماذا ولماذا: الأدوار والإيقاف والمراحل والساعات والشهادات وسطر السجلّ، مجموعةً '
    + 'في مكان واحد بدل أربعة أنواع من الأثر في سجلّ التدقيق العام.',
  auditEmpty: 'لم يُسجَّل أي إجراء على هذا الحساب.',
  auditSystem: 'النظام',
  auditNoActor: 'فاعل غير معروف',
  actions: {
    'user.registered': 'أنشأ حسابه',
    'role.granted': 'منح دوراً',
    'role.revoked': 'سحب دوراً',
    'member.suspended': 'أوقف الحساب',
    'member.reactivated': 'أعاد تفعيل الحساب',
    'stage.awarded': 'منح مرحلة',
    'volunteer.accepted_directly': 'قبله متطوّعاً مباشرةً',
    'application.submitted': 'قدّم طلب تطوّع',
    'application.claimed': 'استلم الطلب للمراجعة',
    'roster.claimed': 'طالب بسطر في السجلّ',
    'roster.auto_approved': 'اعتراف تلقائي بالسطر',
    'roster.approved': 'أقرّ المطالبة',
    'roster.rejected': 'ردّ المطالبة',
    'roster.linked_by_staff': 'ربط الحساب بالسطر',
    'hours.logged': 'سجّل ساعات',
    'hours.verified': 'وثّق ساعات',
    'hours.rejected': 'ردّ ساعات',
    'hours.corrected': 'صحّح ساعات',
    'hours.carried_over': 'اعتمد ساعات سابقة',
    'course.recognised': 'اعتمد دورة سابقة',
    /* السطران التاليان يذكران صراحةً أنّ الشخص لم يكن مسجَّلاً في النشاط وأُدرج
       فيه بقرار من موظّف، وهذه هي الواقعة التي قد يُسأل عنها بعد حين. */
    'attendance.added_unregistered': 'أدرجه حاضراً دون تسجيل مسبق',
    'attendance.amended_unregistered': 'عدّل حضور من أُدرج دون تسجيل',
    'certificate.issued': 'أصدر شهادة',
    'certificate.revoked': 'سحب شهادة',
    'achievement.granted': 'منح شارة بقرار',
    'achievement.revoked': 'سحب شارة',
    'achievements.recomputed': 'أعاد احتساب الشارات',
    'profile.updated': 'عدّل الملف الشخصي',
    'profile.visibility_changed': 'غيّر إعداد الظهور',
    'account.password_changed': 'غيّر كلمة المرور',
    'award.decided': 'قرار تكريم',
  },

  linksTitle: 'أين الأزرار',
  linksLede: 'هذه الصفحة تقرأ ولا تكتب. كل تغيير يجري في الصفحة التي تملكه:',
  linkMember: 'الأدوار والإيقاف واعتماد ما سبق المنصّة',
  linkHours: 'مراجعة الساعات',
  linkRoster: 'سجلّ التطوّع والمطالبات',
  linkRecognition: 'إدارة التقدير والشارات',
  linkAudit: 'سجلّ التدقيق كاملاً',
  linkSafeguarding:
    'بيانات السلامة ليست لها صفحة موظّفين، وهذا مقصود: يملأها المتطوّع في صفحته، '
    + 'وتُراجَع في المكتب.',

  counts: {
    /* Nominative, like the eight sets below it. These two were accusative —
       «نشاطاً واحداً» — which reads correctly only after «حضر». They are also
       shown under «سجَّل على» and «تخلّف عن», where a preposition governs the
       genitive and an accusative is a case error; and each figure stands in
       its own box under its label rather than continuing the label's sentence,
       so the bare nominative is what the layout wants anyway. The tamyiz forms
       (few/many) are accusative in every frame and are unchanged. */
    activities: {
      zero: 'لا أنشطة',
      one: 'نشاط واحد',
      two: 'نشاطان',
      few: '{n} أنشطة',
      many: '{n} نشاطاً',
    },
    attended: {
      zero: 'لا شيء',
      one: 'نشاط واحد',
      two: 'نشاطان',
      few: '{n} أنشطة',
      many: '{n} نشاطاً',
    },
    courses: {
      zero: 'لا دورات',
      one: 'دورة واحدة',
      two: 'دورتان',
      few: '{n} دورات',
      many: '{n} دورة',
    },
    attempts: {
      zero: 'بلا محاولات',
      one: 'محاولة واحدة',
      two: 'محاولتان',
      few: '{n} محاولات',
      many: '{n} محاولة',
    },
    certificates: {
      zero: 'لا شهادات',
      one: 'شهادة واحدة',
      two: 'شهادتان',
      few: '{n} شهادات',
      many: '{n} شهادة',
    },
    badges: {
      zero: 'لا شارات',
      one: 'شارة واحدة',
      two: 'شارتان',
      few: '{n} شارات',
      many: '{n} شارة',
    },
    points: {
      zero: 'لا نقاط',
      one: 'نقطة واحدة',
      two: 'نقطتان',
      few: '{n} نقاط',
      many: '{n} نقطة',
    },
    stages: {
      zero: 'لا مراحل',
      one: 'مرحلة واحدة',
      two: 'مرحلتان',
      few: '{n} مراحل',
      many: '{n} مرحلة',
    },
    entries: {
      zero: 'لا إجراءات',
      one: 'إجراء واحد',
      two: 'إجراءان',
      few: '{n} إجراءات',
      many: '{n} إجراءً',
    },
  },
};

export const memberProfileEn: MemberProfileStrings = {
  title: 'Member file',
  lede:
    'Everything the association knows about this person, on one page, for reading only. '
    + 'Nothing here changes anything — the buttons stay on the pages that own each part, '
    + 'and those are linked at the foot.',
  back: 'Back to the member page',

  standingTitle: 'Standing',
  accountStatus: {
    active: 'Account active',
    suspended: 'Account suspended',
    deactivated: 'Account deactivated',
  },
  membershipTitle: 'Membership status',
  membership: {
    registered_user: 'Registered user',
    course_participant: 'Course participant',
    volunteer_applicant: 'Applied to volunteer',
    volunteer_candidate: 'Candidate',
    accepted_volunteer: 'Accepted volunteer',
    active_volunteer: 'Active volunteer',
    inactive_volunteer: 'Inactive volunteer',
    volunteer_alumni: 'Alumni',
    suspended: 'Suspended',
    rejected: 'Rejected',
  },
  membershipNone: 'No membership status has been recorded yet.',
  rolesTitle: 'Roles',
  rolesNone: 'No roles.',
  volunteerYes: 'A volunteer',
  volunteerNo: 'Not a volunteer',
  ageTitle: 'Age band',
  ageMinor: 'A minor',
  ageAdult: 'An adult',
  ageUnknown: 'Age not on record',
  ageNote:
    'The fact, not the date. No birth date appears on this page, and "not on record" means '
    + 'the association holds no date — not that the person is an adult.',
  lastSeenTitle: 'Last signed in',
  lastSeen: 'Last signed in {date}',
  lastSeenNever: 'Has not signed in since the account was made.',

  sinceTitle: 'Joined',
  since: 'With the association since {date}',
  accountSince: 'Account created {date}',
  predates: 'Volunteering before this platform existed — do not read the account date as a join date.',
  sinceNone: 'No association join date on record, so the account date is all there is.',

  rosterTitle: 'Association roster',
  rosterNone:
    'Not attached to any roster line: either genuinely new, or a line nobody has claimed yet.',
  rosterNumber: 'Number',
  rosterCommittee: 'Committee',
  rosterClaimed: 'Claimed on',
  rosterApproved: 'Approved on',
  rosterHow: 'How it was matched',
  rosterHowNone: 'No match strength recorded — a claim older than the recording of it.',
  strengths: {
    'phone-and-name': 'Phone and name agreed',
    'phone-and-dob': 'Phone and date of birth agreed',
    'number-and-name': 'Membership number and name agreed',
    'number-and-dob': 'Membership number and date of birth agreed',
    'phone-only': 'Phone alone — nothing corroborated it',
    'number-only': 'Membership number alone — nothing corroborated it',
  },
  recognition: {
    rule: 'Recognised automatically: two independent facts agreed',
    staff: 'A member of staff approved the claim',
    'staff-link': 'A member of staff attached the account by hand, with no claim from them',
    awaiting: 'The claim is still waiting on a decision',
  },
  rosterWaiting:
    'A claim nobody has decided. The volunteer is waiting with no way to tell whether they were '
    + 'forgotten or refused — the decision is made on the roster page.',

  hoursTitle: 'Hours',
  hoursVerified: 'Verified',
  hoursPending: 'Awaiting review',
  hoursCarried: 'Carried forward from before the platform',
  hoursOnPlatform: 'On the platform',
  hoursNote:
    'Carried-forward hours are part of the verified figure rather than an addition to it, and '
    + '"on the platform" is what is left. Hours awaiting review are not hours yet and are added '
    + 'to nothing.',

  activitiesTitle: 'Activities',
  activitiesRegistered: 'Signed up for',
  activitiesAttended: 'Attended',
  activitiesMissed: 'Did not attend',
  activitiesRate: 'Attendance {n}%',
  activitiesRateNone: 'Nothing signed up for yet, so there is no rate to give.',
  activitiesNote:
    'Activities the association called off, and registrations cancelled in time, count in '
    + 'neither figure — neither is a failure to turn up.',

  coursesTitle: 'Courses',
  coursesPassed: 'Passed',
  coursesOpen: 'Started, not finished',
  coursesNone: 'No course opened.',

  certificatesTitle: 'Certificates',
  certificatesHeld: 'Standing',
  certificatesRevoked: 'Revoked',
  certificatesNone: 'No certificates.',
  revokeReason: 'Reason for revoking',

  badgesTitle: 'Badges',
  badgesHeld: 'Held',
  badgesWithdrawn: 'Withdrawn',
  badgesNone: 'No badges.',
  badgeByHand: 'Granted by decision',
  badgeUnknown: 'A code the badge catalogue does not know',
  withdrawReason: 'Reason for withdrawing',

  pointsTitle: 'Points',
  pointsNote: 'The ledger total. Every point has a row behind it tracing to a verified fact, and none is ever deleted.',

  stagesTitle: 'Stages',
  stagesNone: 'No stage reached yet.',
  stageReached: 'Stage {n} on {date}',

  safeguardingTitle: 'Safeguarding',
  safeguardingOnFile: 'A record exists.',
  safeguardingNone: 'No safeguarding record for this account.',
  guardianConsent: "A guardian's consent is stamped on it.",
  guardianConsentNone: 'No guardian consent on the record.',
  agreements: 'All three agreements are stamped.',
  agreementsNone: 'The three agreements are incomplete.',
  medicalNote: 'There is a medical note on the record.',
  medicalNoteNone: 'No medical note.',
  safeguardingPrivacy:
    'Presence only. The emergency contact, the guardian, the medical note and the birth date are '
    + 'not shown here and are not read from the staff area at all: the volunteer keeps them on '
    + 'their own page, and the association keeps them in the office.',
  minorWithoutRecord:
    'A minor with no safeguarding record. That is a child going to a field activity with no '
    + 'emergency contact anybody can reach.',

  visibilityTitle: 'Public visibility',
  visibility: {
    hidden: 'Not listed on any public page',
    display_name: 'Listed under their display name, no photograph',
    name_and_photo: 'Listed under their name, with their photograph',
  },
  visibilityChose: 'They chose this themselves on {date}.',
  visibilityNeverChose:
    'Never asked. The default is speaking for them rather than they for themselves — and since '
    + 'the association decided, the default is to appear. Their silence is not their consent.',
  visibilityUnexplained:
    'Listed publicly with no record of consent. This should not be possible: every path that '
    + 'writes the choice writes the time with it.',
  visibilityMinor:
    'A minor: their legal name and photograph stay off every public page whatever they chose. '
    + 'That is decided in lib/visibility.ts, not by this setting.',

  auditTitle: 'What has been done to this account',
  auditLede:
    'Who did what and why: roles, suspensions, stages, hours, certificates and the roster line, '
    + 'gathered in one place instead of four kinds of trace scattered through the general audit log.',
  auditEmpty: 'Nothing has been recorded against this account.',
  auditSystem: 'The system',
  auditNoActor: 'Actor not recorded',
  actions: {
    'user.registered': 'Created their account',
    'role.granted': 'Granted a role',
    'role.revoked': 'Revoked a role',
    'member.suspended': 'Suspended the account',
    'member.reactivated': 'Reactivated the account',
    'stage.awarded': 'Awarded a stage',
    'volunteer.accepted_directly': 'Accepted as a volunteer directly',
    'application.submitted': 'Applied to volunteer',
    'application.claimed': 'Took the application to review',
    'roster.claimed': 'Claimed a roster line',
    'roster.auto_approved': 'Recognised automatically',
    'roster.approved': 'Approved the claim',
    'roster.rejected': 'Refused the claim',
    'roster.linked_by_staff': 'Attached the account to the line',
    'hours.logged': 'Logged hours',
    'hours.verified': 'Verified hours',
    'hours.rejected': 'Rejected hours',
    'hours.corrected': 'Corrected hours',
    'hours.carried_over': 'Recognised prior hours',
    'course.recognised': 'Recognised a prior course',
    'attendance.added_unregistered': 'Marked present without a registration',
    'attendance.amended_unregistered': 'Corrected attendance added without a registration',
    'certificate.issued': 'Issued a certificate',
    'certificate.revoked': 'Revoked a certificate',
    'achievement.granted': 'Granted a badge by decision',
    'achievement.revoked': 'Withdrew a badge',
    'achievements.recomputed': 'Recomputed badges',
    'profile.updated': 'Edited the profile',
    'profile.visibility_changed': 'Changed the visibility setting',
    'account.password_changed': 'Changed the password',
    'award.decided': 'An award decision',
  },

  linksTitle: 'Where the buttons are',
  linksLede: 'This page reads and never writes. Every change happens on the page that owns it:',
  linkMember: 'Roles, suspension and prior credit',
  linkHours: 'Hours review',
  linkRoster: 'Roster and claims',
  linkRecognition: 'Recognition and badges',
  linkAudit: 'The full audit log',
  linkSafeguarding:
    'Safeguarding has no staff page, and that is deliberate: the volunteer fills it in on their '
    + 'own page, and it is checked in the office.',

  counts: {
    activities: {
      zero: 'nothing',
      one: 'one activity',
      two: 'two activities',
      few: '{n} activities',
      many: '{n} activities',
    },
    attended: {
      zero: 'none',
      one: 'one activity',
      two: 'two activities',
      few: '{n} activities',
      many: '{n} activities',
    },
    courses: {
      zero: 'no courses',
      one: 'one course',
      two: 'two courses',
      few: '{n} courses',
      many: '{n} courses',
    },
    attempts: {
      zero: 'no attempts',
      one: 'one attempt',
      two: 'two attempts',
      few: '{n} attempts',
      many: '{n} attempts',
    },
    certificates: {
      zero: 'no certificates',
      one: 'one certificate',
      two: 'two certificates',
      few: '{n} certificates',
      many: '{n} certificates',
    },
    badges: {
      zero: 'no badges',
      one: 'one badge',
      two: 'two badges',
      few: '{n} badges',
      many: '{n} badges',
    },
    points: {
      zero: 'no points',
      one: 'one point',
      two: 'two points',
      few: '{n} points',
      many: '{n} points',
    },
    stages: {
      zero: 'no stages',
      one: 'one stage',
      two: 'two stages',
      few: '{n} stages',
      many: '{n} stages',
    },
    entries: {
      zero: 'nothing',
      one: 'one action',
      two: 'two actions',
      few: '{n} actions',
      many: '{n} actions',
    },
  },
};

export const memberProfile = (lang: Locale): MemberProfileStrings =>
  lang === 'ar' ? memberProfileAr : memberProfileEn;
