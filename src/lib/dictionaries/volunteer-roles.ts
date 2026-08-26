import type { Locale } from '@/lib/i18n';

/**
 * Every string the «المناصب والمهام» panel needs, in one file.
 *
 * Its own module rather than three splices into types.ts / ar.ts / en.ts,
 * following dictionaries/challenge-levels.ts and dictionaries/member-profile.ts
 * for the same reason they give: those three files are edited in lockstep by
 * other work, and a panel's worth of new keys landing in the middle of them is
 * a conflict nobody learns anything from resolving. To fold it in later, add
 * `volunteerRoles: VolunteerRoleStrings` to the Dictionary type and spread
 * these two objects into ar.ts and en.ts. Nothing else has to move.
 *
 * Placeholders are filled with String.replace — {n}, {date}, {title} — which is
 * the convention the rest of the dictionary uses. There is no ICU here.
 *
 * ── THERE IS NO LIST OF ROLE TITLES IN THIS FILE ───────────────────────────
 *
 * Not as a select's options, not as an examples array, not as a placeholder
 * reading «رئيس لجنة الإعلام». The head of migration 046 argues why at length:
 * an association invents responsibilities faster than anybody ships a
 * migration, and every title a developer has to add is a title that does not
 * get recorded. The only titles and kinds a user ever sees offered are the ones
 * roleTitleSuggestions() reads back out of the table, and `suggestionsNote`
 * below exists so the administrator is told, in words, that the box is not a
 * menu. A string here that named even one role would be the first step back to
 * the closed list.
 *
 * Even the hints avoid enumerating kinds. Writing «منصب، لجنة، مشروع» into a
 * placeholder would be a fixed list wearing a hint's clothes: it teaches the
 * four words the association is expected to use and quietly discourages a
 * fifth.
 *
 * ── ON THE THREE ONE-TAP ARCHIVE REASONS ───────────────────────────────────
 *
 * «انضاف بالخطأ» is the association's own spoken phrasing rather than the
 * bookish «أُضيف عن طريق الخطأ», and it is kept as the client wrote it. These
 * three buttons are the point of the archive form: a required essay would end
 * with administrators leaving wrong roles sitting on people's profiles rather
 * than writing one. A reason always, an essay never — the same argument the
 * head of lib/actions/volunteer-roles.ts makes.
 *
 * ── THREE AUDIENCES, ONE FILE ──────────────────────────────────────────────
 *
 * The keys above are the administrator's screen. `mine` below is the volunteer
 * reading their OWN record, and `publicHeading` is the one line the open web
 * gets. They are in one file rather than three because they are one subject
 * said three ways, and a role that is called «منصب» to staff and «مهمّة» to its
 * holder is two features wearing one name.
 *
 * The wording changes with the audience even where the fact does not. The
 * administrator's lede is about the table («ما شغله هذا المتطوّع… لا يُستبدل
 * منصب بآخر»); the volunteer's is addressed to them and says what will not be
 * taken away from them. Same rule, different person being spoken to.
 *
 * ── THE EMPTY STATE SAYS WHAT WOULD FILL IT ────────────────────────────────
 *
 * The client's section 58, and it is the reason `mine.panelEmpty` is a sentence
 * rather than a zero. A volunteer who has never been given a responsibility and
 * meets «٠» on their own dashboard has been marked rather than informed. The
 * three states are kept apart deliberately: nothing ever recorded
 * (`panelEmpty`), nothing held right now but a record behind them
 * (`panelNoneCurrent`), and something held now. Collapsing the middle one into
 * the first would tell somebody who ran a committee for two years that no role
 * has ever been recorded for them, which is false and reads as the association
 * having forgotten.
 */

export type VolunteerRoleStrings = {
  // ---- the section itself
  sectionTitle: string;
  lede: string;
  empty: string;
  /** Shown to a viewer whose account cannot write here. */
  readOnly: string;

  // ---- one entry on the timeline
  currentBadge: string;
  pastBadge: string;
  typeLabel: string;
  entityLabel: string;
  descriptionLabel: string;
  achievementsHeading: string;
  seenByLabel: string;
  seenBy: { public: string; volunteers: string; staff: string };
  recordedOn: string;

  // ---- ending a role
  endCta: string;
  endHeading: string;
  endNote: string;
  endDateLabel: string;
  endDateNote: string;
  endPrecisionLabel: string;
  endSubmit: string;

  // ---- archiving one
  archiveCta: string;
  archiveHeading: string;
  archiveNote: string;
  reasonMistake: string;
  reasonWrongPerson: string;
  reasonDuplicate: string;
  reasonOtherLabel: string;
  reasonOtherPlaceholder: string;
  archiveSubmit: string;

  // ---- the archive drawer
  archivedShow: string;
  archivedNote: string;
  archivedOn: string;
  archivedReason: string;
  archivedNoReason: string;
  restore: string;

  // ---- the form
  addCta: string;
  addHeading: string;
  editCta: string;
  editHeading: string;
  titleArLabel: string;
  titleArHint: string;
  titleEnLabel: string;
  titleEnHint: string;
  kindLabel: string;
  kindHint: string;
  suggestionsNote: string;
  entityNameLabel: string;
  entityNameHint: string;
  entityLinkedNote: string;
  startLabel: string;
  endLabel: string;
  precisionLabel: string;
  precision: { day: string; month: string; year: string };
  precisionHint: string;
  currentLabel: string;
  currentHint: string;
  descriptionFieldLabel: string;
  descriptionHint: string;
  achievementsLabel: string;
  achievementsHint: string;
  achievementArLabel: string;
  achievementEnLabel: string;
  achievementAdd: string;
  achievementRemove: string;
  achievementRow: string;
  visibilityLabel: string;
  visibilityHint: string;
  save: string;
  saveEdit: string;
  saving: string;
  savedCreate: string;
  savedEdit: string;

  errors: {
    'no-title': string;
    'bad-date': string;
    'out-of-order': string;
    'current-and-ended': string;
    'no-archive-reason': string;
    'not-found': string;
    'no-person': string;
    unavailable: string;
    db: string;
  };

  /**
   * The volunteer reading their own record: the dashboard panel and the page
   * behind it. Addressed to «أنت», never to «هذا المتطوّع».
   */
  mine: {
    kicker: string;
    // ---- the dashboard panel, which shows CURRENT roles only
    panelTitle: string;
    panelLede: string;
    /** Nothing has ever been recorded. Says what would fill the panel. */
    panelEmpty: string;
    /** Nothing held right now, but there is a record behind them. */
    panelNoneCurrent: string;
    seeAll: string;

    // ---- the full timeline
    pageTitle: string;
    pageLede: string;
    pageEmpty: string;
    currentHeading: string;
    pastHeading: string;
    /** Who writes this record, and what to do when it is wrong. */
    recordedNote: string;
    back: string;
  };

  /**
   * The heading over a volunteer's roles on «صنّاع الاستمرارية» — the one
   * surface a stranger reads. Short, because it sits on a card.
   */
  publicHeading: string;
};

export const volunteerRolesAr: VolunteerRoleStrings = {
  sectionTitle: 'المناصب والمهام',
  lede:
    'ما شغله هذا المتطوّع داخل الجمعية، بتواريخه. لا يُستبدل منصب بآخر: من يخلف أحداً يُضاف له سطر جديد ويُقفَل السطر السابق، فيبقى الاثنان في السجلّ.',
  empty: 'لم يُسجَّل بعد أيّ منصب أو مهمّة لهذا المتطوّع.',
  readOnly: 'تقرأ هذا القسم ولا تعدّله.',

  currentBadge: 'قائم',
  pastBadge: 'سابق',
  typeLabel: 'النوع',
  entityLabel: 'الجهة',
  descriptionLabel: 'الوصف',
  achievementsHeading: 'ما أُنجز فيه',
  seenByLabel: 'من يراه',
  seenBy: {
    public: 'الجميع، حتى من خارج المنصّة',
    volunteers: 'المتطوّعون داخل المنصّة',
    staff: 'الطاقم الإداري وحده',
  },
  recordedOn: 'سُجِّل في {date}',

  endCta: 'إنهاء',
  endHeading: 'إنهاء هذا المنصب',
  endNote:
    'الإنهاء لا يحذف شيئاً: يبقى المنصب في سجلّ صاحبه كما هو، ويُضاف إليه تاريخ انتهائه. من يخلفه يُسجَّل له سطر جديد.',
  endDateLabel: 'تاريخ الانتهاء',
  endDateNote: 'اتركه فارغاً إن كان قد انتهى في يوم لم يُدوَّن؛ يُسجَّل سابقاً بلا تاريخ.',
  endPrecisionLabel: 'ما تعرفه من التاريخ',
  endSubmit: 'أنهِ المنصب',

  archiveCta: 'أرشفة',
  archiveHeading: 'لماذا يُزال هذا السطر؟',
  archiveNote:
    'الأرشفة تُخفي المنصب عن الملفّ ولا تحذفه من السجلّ، ويمكن إرجاعه في أيّ وقت. السبب مطلوب ويُحفَظ مع السطر نفسه، ليعرفه صاحبه لا الطاقم وحده.',
  reasonMistake: 'انضاف بالخطأ',
  reasonWrongPerson: 'الشخص الخطأ',
  reasonDuplicate: 'مكرّر',
  reasonOtherLabel: 'أو سبب آخر',
  reasonOtherPlaceholder: 'كلمتان تكفيان',
  archiveSubmit: 'أرشف',

  archivedShow: 'إظهار المؤرشَف ({n})',
  archivedNote: 'أُزيلت من الملفّ وبقيت في السجلّ. لا شيء ممّا هنا محذوف.',
  archivedOn: 'أُرشِف في {date}',
  archivedReason: 'السبب',
  archivedNoReason: 'أُرشِف قبل أن يصير ذكر السبب مطلوباً.',
  restore: 'إرجاع إلى الملفّ',

  addCta: '+ إضافة منصب أو مهمة',
  addHeading: 'منصب أو مهمّة جديدة',
  editCta: 'تعديل',
  editHeading: 'تعديل هذا السطر',
  titleArLabel: 'الاسم بالعربية',
  titleArHint:
    'اكتب ما تسمّيه الجمعية فعلاً. لا قائمة محدَّدة هنا ولا حاجة إلى مبرمج: ما تكتبه هو ما يُحفَظ.',
  titleEnLabel: 'الاسم بالإنكليزية — اختياري',
  titleEnHint: 'يظهر في السيرة الذاتية التي يصدّرها المتطوّع. تركُه فارغاً أفضل من ترجمة غير دقيقة.',
  kindLabel: 'النوع — اختياري',
  kindHint: 'كلمة واحدة تصنّف هذا السطر، إن كانت له كلمة.',
  suggestionsNote:
    'الاقتراحات في هذه الحقول مأخوذة ممّا سبق تسجيله في الجمعية، وليست قائمةً مغلقة — اكتب ما شئت ولو لم يَرِد فيها.',
  entityNameLabel: 'الجهة المرتبط بها — اختياري',
  entityNameHint: 'اسم اللجنة أو المشروع أو الفريق كما يُعرف. اتركه فارغاً إن لم يكن مرتبطاً بشيء.',
  entityLinkedNote: 'هذا السطر مرتبط بسجلّ قائم في المنصّة، ولا يُحرَّر اسمه من هنا.',
  startLabel: 'تاريخ البداية',
  endLabel: 'تاريخ الانتهاء',
  precisionLabel: 'ما تعرفه من التاريخ',
  precision: { day: 'اليوم كاملاً', month: 'الشهر والسنة', year: 'السنة وحدها' },
  precisionHint:
    'لا أحد يتذكّر يوم انضمامه إلى لجنة قبل ثلاث سنوات. اختر ما تعرفه فعلاً، ويُكتب على الصفحة بهذه الدقّة وحدها بدل يومٍ مخترَع.',
  currentLabel: 'ما زال يشغله حتى الآن',
  currentHint:
    'إن رفعت هذه العلامة ولم تكتب تاريخ انتهاء، يُسجَّل المنصب منتهياً في يوم لم يُدوَّن — وهي حالة صحيحة لا حقل ناقص.',
  descriptionFieldLabel: 'وصف المهمّة — اختياري',
  descriptionHint: 'سطران يشرحان ما كان يفعله فيه.',
  achievementsLabel: 'ما أُنجز فيه — اختياري',
  achievementsHint:
    'سطر لكلّ إنجاز. الإنكليزية اختيارية، ويكفي أن يُكتب السطر بلغة واحدة. السطر الفارغ يُهمَل.',
  achievementArLabel: 'بالعربية',
  achievementEnLabel: 'بالإنكليزية',
  achievementAdd: '+ إضافة سطر',
  achievementRemove: 'حذف هذا السطر',
  achievementRow: 'الإنجاز {n}',
  visibilityLabel: 'من يرى هذا السطر',
  visibilityHint:
    'الوضع المعتاد أن يراه المتطوّعون داخل المنصّة. نشرُه للعموم قرار منفصل يُتَّخذ لكلّ سطر على حدة.',
  save: 'سجّل المنصب',
  saveEdit: 'احفظ التعديل',
  saving: 'يُحفَظ…',
  savedCreate: 'سُجِّل المنصب.',
  savedEdit: 'حُفظ التعديل.',

  errors: {
    'no-title': 'الاسم بالعربية مطلوب.',
    'bad-date': 'أحد التاريخين غير صالح.',
    'out-of-order': 'تاريخ الانتهاء يسبق تاريخ البداية.',
    'current-and-ended':
      'لا يكون المنصب قائماً وله تاريخ انتهاء في آن. ارفع علامة «ما زال يشغله» أو امحُ تاريخ الانتهاء.',
    'no-archive-reason': 'اذكر سبب الأرشفة.',
    'not-found': 'لم يُعثر على هذا السطر.',
    'no-person': 'لم يُحدَّد صاحب المنصب.',
    unavailable: 'قاعدة البيانات غير متاحة الآن.',
    db: 'تعذّر الحفظ الآن. حاول مرّة أخرى.',
  },

  mine: {
    kicker: 'سجلّي في الجمعية',

    panelTitle: 'مهامي ومناصبي',
    panelLede: 'ما تشغله الآن داخل الجمعية.',
    /* Not «٠ مناصب». It names the thing that would put a line here, so the
       emptiness reads as a beginning rather than as a shortfall. */
    panelEmpty:
      'لم يُسجَّل لك بعد منصب أو مهمّة. يظهر هنا أوّل ما تتولّى مسؤوليةً في لجنة أو مشروع أو فريق ويدوّنها الطاقم الإداري في سجلّك.',
    panelNoneCurrent:
      'لا تشغل الآن منصباً أو مهمّة. ما شغلته سابقاً باقٍ في سجلّك كما هو.',
    seeAll: 'السجلّ الكامل',

    pageTitle: 'مهامي ومناصبي',
    pageLede:
      'ما شغلته داخل الجمعية بتواريخه: ما تشغله الآن أوّلاً، ثمّ ما سبق، من الأحدث إلى الأقدم. لا يُمحى من هنا شيء — حين يخلفك أحد في منصب يُقفَل سطرك بتاريخه ويبقى في سجلّك.',
    pageEmpty:
      'لا شيء في هذا السجلّ بعد. يمتلئ حين تُسنَد إليك مسؤولية في لجنة أو مشروع أو فريق، فيدوّنها الطاقم الإداري بتواريخها وتظهر لك هنا.',
    currentHeading: 'ما أشغله الآن',
    pastHeading: 'ما شغلته سابقاً',
    recordedNote:
      'يُدوَّن هذا السجلّ من قِبَل الطاقم الإداري. إن نقص منه شيء أو ورد فيه ما ليس بصحيح، راسل الجمعية ليُصحَّح.',
    back: 'العودة إلى حسابي',
  },

  publicHeading: 'مناصب ومهام',
};

export const volunteerRolesEn: VolunteerRoleStrings = {
  sectionTitle: 'Roles & Responsibilities',
  lede:
    'What this volunteer has been inside Takaful, with dates. No role replaces another: a successor gets a new line and the previous one is closed, so both stay on the record.',
  empty: 'No role or responsibility has been recorded for this volunteer yet.',
  readOnly: 'You are reading this section, not editing it.',

  currentBadge: 'Current',
  pastBadge: 'Past',
  typeLabel: 'Kind',
  entityLabel: 'Attached to',
  descriptionLabel: 'Description',
  achievementsHeading: 'What was achieved',
  seenByLabel: 'Who can see it',
  seenBy: {
    public: 'Everyone, including outside the platform',
    volunteers: 'Volunteers signed in to the platform',
    staff: 'Staff only',
  },
  recordedOn: 'Recorded on {date}',

  endCta: 'End',
  endHeading: 'Ending this role',
  endNote:
    'Ending deletes nothing: the role stays on its holder’s record exactly as it is, with an end date added to it. Whoever succeeds them gets a line of their own.',
  endDateLabel: 'End date',
  endDateNote: 'Leave it empty if it ended on a day nobody wrote down; it is recorded as past with no date.',
  endPrecisionLabel: 'How much of the date is known',
  endSubmit: 'End the role',

  archiveCta: 'Archive',
  archiveHeading: 'Why is this line being removed?',
  archiveNote:
    'Archiving hides the role from the profile without deleting it from the record, and it can be put back at any time. A reason is required and is kept on the line itself, so the person it is about can be told, not only staff.',
  reasonMistake: 'Added by mistake',
  reasonWrongPerson: 'Wrong person',
  reasonDuplicate: 'Duplicate',
  reasonOtherLabel: 'Or another reason',
  reasonOtherPlaceholder: 'A few words is enough',
  archiveSubmit: 'Archive it',

  archivedShow: 'Show archived ({n})',
  archivedNote: 'Removed from the profile and kept on the record. Nothing here is deleted.',
  archivedOn: 'Archived on {date}',
  archivedReason: 'Reason',
  archivedNoReason: 'Archived before a reason was required.',
  restore: 'Put back on the profile',

  addCta: '+ Add a role or responsibility',
  addHeading: 'A new role or responsibility',
  editCta: 'Edit',
  editHeading: 'Editing this line',
  titleArLabel: 'Title in Arabic',
  titleArHint:
    'Write what the association actually calls it. There is no fixed list here and no developer needed: what you type is what is saved.',
  titleEnLabel: 'Title in English — optional',
  titleEnHint: 'It appears on the CV a volunteer exports. Leaving it empty beats an inaccurate translation.',
  kindLabel: 'Kind — optional',
  kindHint: 'One word that classifies this line, if it has one.',
  suggestionsNote:
    'The suggestions in these fields come from what has already been recorded in the association. They are not a closed list — type anything you like, even if it is not among them.',
  entityNameLabel: 'What it was attached to — optional',
  entityNameHint: 'The name of the committee, project or team as it is known. Leave it empty if it was attached to nothing.',
  entityLinkedNote: 'This line points at a record held in the platform, so its name is not edited here.',
  startLabel: 'Start date',
  endLabel: 'End date',
  precisionLabel: 'How much of the date is known',
  precision: { day: 'The full date', month: 'Month and year', year: 'Year only' },
  precisionHint:
    'Nobody remembers the day they joined a committee three years ago. Choose what is actually known, and the page prints it to that precision and no further, rather than inventing a day.',
  currentLabel: 'Still holds it now',
  currentHint:
    'Untick this without giving an end date and the role is recorded as finished on a day nobody wrote down — a real state, not a missing field.',
  descriptionFieldLabel: 'What the role involved — optional',
  descriptionHint: 'A line or two on what they actually did in it.',
  achievementsLabel: 'What was achieved — optional',
  achievementsHint:
    'One line each. The English is optional and one language is enough; a line empty in both is dropped.',
  achievementArLabel: 'In Arabic',
  achievementEnLabel: 'In English',
  achievementAdd: '+ Add a line',
  achievementRemove: 'Remove this line',
  achievementRow: 'Achievement {n}',
  visibilityLabel: 'Who can see this line',
  visibilityHint:
    'The usual setting is volunteers signed in to the platform. Publishing it to the open web is a separate decision, taken line by line.',
  save: 'Record the role',
  saveEdit: 'Save the change',
  saving: 'Saving…',
  savedCreate: 'The role has been recorded.',
  savedEdit: 'The change has been saved.',

  errors: {
    'no-title': 'The Arabic title is required.',
    'bad-date': 'One of the two dates is not a valid date.',
    'out-of-order': 'The end date falls before the start date.',
    'current-and-ended':
      'A role cannot be current and carry an end date at once. Untick “still holds it now”, or clear the end date.',
    'no-archive-reason': 'Say why it is being archived.',
    'not-found': 'That line could not be found.',
    'no-person': 'No holder was named.',
    unavailable: 'The database is not available right now.',
    db: 'That could not be saved just now. Try again.',
  },

  mine: {
    kicker: 'My record',

    panelTitle: 'My roles and responsibilities',
    panelLede: 'What you hold inside Takaful right now.',
    /* Not "0 roles". It names the thing that would put a line here, so the
       emptiness reads as a beginning rather than as a shortfall. */
    panelEmpty:
      'No role or responsibility is recorded for you yet. One appears here the first time you take charge of something in a committee, a project or a team and a member of staff writes it onto your record.',
    panelNoneCurrent:
      'You are not holding a role or a responsibility right now. What you held before stays on your record exactly as it is.',
    seeAll: 'The full record',

    pageTitle: 'My roles and responsibilities',
    pageLede:
      'What you have been inside Takaful, with dates: what you hold now first, then what you held before, newest first. Nothing is erased from here — when somebody succeeds you, your line is closed with its date and stays on your record.',
    pageEmpty:
      'There is nothing on this record yet. It fills up as the association hands you responsibility in a committee, a project or a team, and a member of staff writes each one down with its dates.',
    currentHeading: 'What I hold now',
    pastHeading: 'What I held before',
    recordedNote:
      'This record is written by the association’s staff. If something is missing from it, or something on it is not right, write to the association and it will be corrected.',
    back: 'Back to my account',
  },

  publicHeading: 'Roles and responsibilities',
};

export const volunteerRoleDictionaries: Record<Locale, VolunteerRoleStrings> = {
  ar: volunteerRolesAr,
  en: volunteerRolesEn,
};

export function volunteerRoleStrings(lang: Locale): VolunteerRoleStrings {
  return volunteerRoleDictionaries[lang];
}
