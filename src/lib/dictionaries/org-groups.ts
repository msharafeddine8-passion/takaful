import type { Locale } from '@/lib/i18n';

/**
 * Every string the committees-and-teams screens need, in one file.
 *
 * Its own module rather than three splices into types.ts / ar.ts / en.ts,
 * following dictionaries/challenge-levels.ts and dictionaries/volunteer-roles.ts
 * for the reason they give: those three files are edited in lockstep by other
 * work, and a screen's worth of new keys landing in the middle of them is a
 * conflict nobody learns anything from resolving. To fold it in later, add
 * `orgGroups: OrgGroupStrings` to the Dictionary type and spread these two
 * objects into ar.ts and en.ts. Nothing else has to move.
 *
 * Placeholders are filled with String.replace — {n}, {date}, {name} — which is
 * the convention the rest of the dictionary uses. There is no ICU here.
 *
 * ── THERE IS NO LIST OF KINDS IN THIS FILE ────────────────────────────────
 *
 * Not as a select's options, not as an examples array, and not as a
 * placeholder reading «لجنة». `kind` on a group is free text (migration 054),
 * for the same reason role titles are free text (migration 046): an
 * association invents ways of organising itself faster than anybody ships a
 * migration. `kindHint` therefore says what the box is for without teaching
 * four permitted words — a placeholder listing «لجنة، فريق، وحدة» would be a
 * fixed list wearing a hint's clothes, offering three and discouraging a
 * fourth. The only kinds anybody is ever offered are the ones already recorded,
 * read back out of the table as a typeahead.
 *
 * ── AND NOTHING HERE COUNTS PEOPLE ────────────────────────────────────────
 *
 * There is no string for "members: 12", no counted noun for people, and
 * nothing that could order two groups by how many volunteers are in them.
 * `archivedShow` counts ARCHIVED GROUPS, which are rows and not people. The
 * queries behind these screens produce no per-person figure at all — see the
 * invariant at the head of lib/org-groups.ts.
 *
 * ── WHY THE HEADINGS NAME ROLES AND NOT "MEMBERS" ─────────────────────────
 *
 * «من يشغل منصباً الآن» rather than «الأعضاء»: there is no members table, and
 * the heading says what the rows below it actually are. It also sidesteps a
 * real grammatical problem — «لجنة» is feminine and «فريق» is masculine, so
 * every pronoun agreeing with "the group" would be wrong half the time. The
 * Arabic here is written around that with definite nouns and «من», not with a
 * gender picked and quietly imposed on the other half of the table.
 */

export type OrgGroupStrings = {
  // ---- the list
  title: string;
  lede: string;
  empty: string;
  addCta: string;
  addHeading: string;
  openCta: string;
  kindBadge: string;
  parentBadge: string;
  activeBadge: string;
  concludedBadge: string;
  recordedOn: string;

  // ---- the form behind «إضافة» and «تعديل»
  editCta: string;
  editHeading: string;
  nameArLabel: string;
  nameArHint: string;
  nameEnLabel: string;
  nameEnHint: string;
  kindLabel: string;
  kindHint: string;
  suggestionsNote: string;
  parentLabel: string;
  parentHint: string;
  parentNone: string;
  descriptionArLabel: string;
  descriptionEnLabel: string;
  descriptionHint: string;
  save: string;
  saveEdit: string;

  // ---- still meeting, or finished
  concludeCta: string;
  resumeCta: string;
  concludeNote: string;

  // ---- archiving
  archiveCta: string;
  archiveHeading: string;
  archiveNote: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  archiveSubmit: string;
  archivedShow: string;
  archivedNote: string;
  archivedOn: string;
  archivedReason: string;

  // ---- one group
  notFound: string;
  aboutHeading: string;
  currentHeading: string;
  currentEmpty: string;
  pastHeading: string;
  pastEmpty: string;
  nobodyYet: string;
  seenByLabel: string;
  seenBy: { public: string; volunteers: string; staff: string };
  openPerson: string;
  back: string;

  /** The leadership record. Section 43 of the brief, and its own reasoning. */
  leadershipHeading: string;
  leadershipLede: string;
  leadershipEmpty: string;

  // ---- putting somebody in it, which writes a volunteer_role and nothing else
  addMemberCta: string;
  addMemberHeading: string;
  addMemberNote: string;
  personLabel: string;
  personHint: string;
  personNone: string;
  titleArLabel: string;
  titleArHint: string;
  titleEnLabel: string;
  roleTypeLabel: string;
  roleTypeHint: string;
  startLabel: string;
  precisionLabel: string;
  precision: { day: string; month: string; year: string };
  currentLabel: string;
  currentHint: string;
  visibilityLabel: string;
  visibilityHint: string;
  addMemberSubmit: string;

  // ---- closing one, which is the other half of a succession
  endCta: string;
  endHeading: string;
  endNote: string;
  endDateLabel: string;
  endDateNote: string;
  endPrecisionLabel: string;
  endSubmit: string;

  /**
   * The three strings the role form on a member's page needs once groups are
   * rows. They live here rather than in dictionaries/volunteer-roles.ts because
   * they are about this feature; the form takes them as a small separate prop.
   */
  roleForm: {
    chooseLabel: string;
    chooseNone: string;
    chooseHint: string;
  };

  errors: {
    'no-name': string;
    'parent-self': string;
    'parent-missing': string;
    'parent-cycle': string;
    'no-archive-reason': string;
    'not-found': string;
    'no-title': string;
    'no-person': string;
    'bad-date': string;
    'out-of-order': string;
    'current-and-ended': string;
    unavailable: string;
    db: string;
  };
};

export const orgGroupsAr: OrgGroupStrings = {
  title: 'اللجان والفرق',
  lede:
    'ما تتوزّع عليه الجمعية من لجان وفرق ووحدات، وسجلّ من تولّى المسؤولية في كلٍّ منها. العضوية ليست جدولاً ثانياً: من يُسنَد إليه عمل هنا يُسجَّل له منصب في سجلّه الشخصي بتواريخه، والصفحتان تقرآن السطر نفسه.',
  empty: 'لم تُسجَّل بعد أيّ لجنة أو فريق.',
  addCta: '+ إضافة لجنة أو فريق',
  addHeading: 'لجنة أو فريق جديد',
  openCta: 'افتح السجلّ',
  kindBadge: 'النوع',
  parentBadge: 'يتبع',
  activeBadge: 'قائم',
  concludedBadge: 'انتهى عمله',
  recordedOn: 'سُجِّل في {date}',

  editCta: 'تعديل',
  editHeading: 'تعديل البيانات',
  nameArLabel: 'الاسم بالعربية',
  nameArHint: 'الاسم كما تستعمله الجمعية في مراسلاتها ومحاضرها.',
  nameEnLabel: 'الاسم بالإنكليزية — اختياري',
  nameEnHint: 'يظهر في النسخة الإنكليزية من الصفحات. تركُه فارغاً أفضل من ترجمة غير دقيقة.',
  kindLabel: 'النوع — اختياري',
  kindHint:
    'الكلمة التي تصف هذا الكيان في الجمعية، إن كانت له كلمة. لا قائمة محدَّدة هنا ولا حاجة إلى مبرمج: ما تكتبه هو ما يُحفَظ.',
  suggestionsNote:
    'الاقتراحات في هذا الحقل مأخوذة ممّا سبق تسجيله، وليست قائمةً مغلقة — اكتب ما شئت ولو لم يَرِد فيها.',
  parentLabel: 'يتبع — اختياري',
  parentHint:
    'اختر ما يندرج هذا تحته، إن كان يندرج تحت شيء: فريق الإعلام مثلاً تحت لجنة الإعلام. لا يتبع الكيان نفسه، ولا يتبع ما يتبعه أصلاً.',
  parentNone: 'لا يتبع شيئاً',
  descriptionArLabel: 'الوصف بالعربية — اختياري',
  descriptionEnLabel: 'الوصف بالإنكليزية — اختياري',
  descriptionHint: 'سطران يشرحان طبيعة العمل هنا.',
  save: 'سجّل',
  saveEdit: 'احفظ التعديل',

  concludeCta: 'تسجيل انتهاء العمل',
  resumeCta: 'تسجيل استئناف العمل',
  concludeNote:
    'انتهاء العمل ليس حذفاً ولا أرشفة: يبقى الاسم في القائمة، ويبقى سجلّ القيادات مقروءاً، ويظلّ كلّ من خدم هنا يذكر ذلك في سجلّه. لجنةٌ أنجزت ما أُنشئت له ليست خطأً يُخفى.',

  archiveCta: 'أرشفة',
  archiveHeading: 'لماذا يُزال هذا السطر؟',
  archiveNote:
    'الأرشفة للسطر الذي ما كان ينبغي أن يُسجَّل أصلاً: تكرارٌ، أو خطأٌ في الإدخال. أمّا ما أنهى عمله فيُسجَّل منتهياً لا مؤرشَفاً، لأنّ الأرشفة تُخفي معه سجلّ كلّ من خدم فيه. لا يُحذف شيء في الحالتين، والمناصب المرتبطة تبقى في سجلّات أصحابها كما هي.',
  reasonLabel: 'سبب الأرشفة',
  reasonPlaceholder: 'كلمتان تكفيان',
  archiveSubmit: 'أرشف',
  archivedShow: 'إظهار المؤرشَف ({n})',
  archivedNote: 'أُزيلت من القائمة وبقيت في السجلّ. لا شيء ممّا هنا محذوف.',
  archivedOn: 'أُرشِف في {date}',
  archivedReason: 'السبب',

  notFound: 'لم يُعثر على هذه اللجنة أو هذا الفريق.',
  aboutHeading: 'التعريف',
  currentHeading: 'من يشغل منصباً الآن',
  currentEmpty: 'لا أحد يشغل منصباً هنا الآن.',
  pastHeading: 'من شغل منصباً سابقاً',
  pastEmpty: 'لا مناصب سابقة مسجَّلة.',
  nobodyYet: 'لم يُسجَّل بعد أيّ منصب هنا.',
  seenByLabel: 'من يراه',
  seenBy: {
    public: 'الجميع، حتى من خارج المنصّة',
    volunteers: 'المتطوّعون داخل المنصّة',
    staff: 'الطاقم الإداري وحده',
  },
  openPerson: 'صفحة المتطوّع',
  back: 'العودة إلى اللجان والفرق',

  leadershipHeading: 'سجلّ القيادات',
  leadershipLede:
    'من تولّى المسؤولية هنا، بتواريخه، من الأحدث إلى الأقدم. لا يُستبدل أحد بأحد: حين يخلف شخصٌ آخر يُقفَل سطر السابق بتاريخه ويُفتح للاحق سطرٌ جديد، فيبقى الاثنان في السجلّ.',
  leadershipEmpty:
    'لا شيء في هذا السجلّ بعد. يمتلئ حين يُسجَّل أوّل من تولّى مسؤوليةً هنا بتاريخ توليه، ولا يُمحى منه أحد بعد ذلك.',

  addMemberCta: '+ تسجيل منصب هنا',
  addMemberHeading: 'تسجيل منصب جديد',
  addMemberNote:
    'ما يُسجَّل هنا منصبٌ في سجلّ صاحبه، يظهر في صفحته كما يظهر في هذه الصفحة. ليس للعضوية جدولٌ ثانٍ: هذا سجلّها الوحيد، ومنه يُقرأ سجلّ القيادات أدناه.',
  personLabel: 'صاحب المنصب',
  personHint: 'القائمة مرتّبة بالأسماء وحدها. لا شيء فيها يعدّ أحداً ولا يقارن بين اثنين.',
  personNone: 'اختر متطوّعاً',
  titleArLabel: 'اسم المنصب بالعربية',
  titleArHint:
    'اكتب ما تسمّيه الجمعية فعلاً. لا قائمة محدَّدة للمناصب: ما تكتبه هو ما يُحفَظ ويظهر في سجلّ صاحبه.',
  titleEnLabel: 'اسم المنصب بالإنكليزية — اختياري',
  roleTypeLabel: 'نوع المنصب — اختياري',
  roleTypeHint: 'كلمة واحدة تصنّف هذا السطر، إن كانت له كلمة.',
  startLabel: 'تاريخ البداية',
  precisionLabel: 'ما تعرفه من التاريخ',
  precision: { day: 'اليوم كاملاً', month: 'الشهر والسنة', year: 'السنة وحدها' },
  currentLabel: 'ما زال يشغله حتى الآن',
  currentHint:
    'إن رفعت هذه العلامة، يُسجَّل المنصب منتهياً في يوم لم يُدوَّن — وهي حالة صحيحة لا حقل ناقص.',
  visibilityLabel: 'من يرى هذا السطر',
  visibilityHint:
    'الوضع المعتاد أن يراه المتطوّعون داخل المنصّة. نشرُه للعموم قرار منفصل يُتَّخذ لكلّ سطر على حدة.',
  addMemberSubmit: 'سجّل المنصب',

  endCta: 'إنهاء',
  endHeading: 'إنهاء هذا المنصب',
  endNote:
    'الإنهاء لا يحذف شيئاً: يبقى المنصب في سجلّ صاحبه كما هو ويُضاف إليه تاريخ انتهائه. ومن يخلفه يُسجَّل له سطرٌ جديد بالنموذج أعلاه — لا يُستبدل اسمٌ باسم.',
  endDateLabel: 'تاريخ الانتهاء',
  endDateNote: 'اتركه فارغاً إن كان قد انتهى في يوم لم يُدوَّن؛ يُسجَّل سابقاً بلا تاريخ.',
  endPrecisionLabel: 'ما تعرفه من التاريخ',
  endSubmit: 'أنهِ المنصب',

  roleForm: {
    chooseLabel: 'أو اختر من اللجان والفرق المسجَّلة',
    chooseNone: 'لا شيء من هذه',
    chooseHint:
      'اختيار واحدٍ من هنا يربط السطر بسجلّه، فيظهر صاحبه في صفحة تلك اللجنة أو ذاك الفريق. وإن كانت الجهة بلا سجلّ في المنصّة — حملةٌ أو مهمّةٌ عابرة — فاكتب اسمها في الحقل أعلاه؛ الاختيار من هنا يَجُبّ ما كُتب هناك.',
  },

  errors: {
    'no-name': 'الاسم بالعربية مطلوب.',
    'parent-self': 'لا يتبع الكيان نفسه.',
    'parent-missing': 'الجهة المختارة لم تعد موجودة.',
    'parent-cycle':
      'هذا الاختيار يُغلق حلقة: الجهة المختارة تتبع هذا الكيان أصلاً، مباشرةً أو بواسطة.',
    'no-archive-reason': 'اذكر سبب الأرشفة.',
    'not-found': 'لم يُعثر على هذا السطر.',
    'no-title': 'اسم المنصب بالعربية مطلوب.',
    'no-person': 'لم يُحدَّد صاحب المنصب.',
    'bad-date': 'التاريخ غير صالح.',
    'out-of-order': 'تاريخ الانتهاء يسبق تاريخ البداية.',
    'current-and-ended':
      'لا يكون المنصب قائماً وله تاريخ انتهاء في آن. ارفع علامة «ما زال يشغله» أو امحُ تاريخ الانتهاء.',
    unavailable: 'قاعدة البيانات غير متاحة الآن.',
    db: 'تعذّر الحفظ الآن. حاول مرّة أخرى.',
  },
};

export const orgGroupsEn: OrgGroupStrings = {
  title: 'Committees & teams',
  lede:
    'How the association divides its work into committees, teams and units, and the record of who has taken charge of each. Membership is not a second table: somebody given work here has a role recorded on their own file with its dates, and both pages read the same line.',
  empty: 'No committee or team has been recorded yet.',
  addCta: '+ Add a committee or team',
  addHeading: 'A new committee or team',
  openCta: 'Open the record',
  kindBadge: 'Kind',
  parentBadge: 'Part of',
  activeBadge: 'Meeting',
  concludedBadge: 'Work finished',
  recordedOn: 'Recorded on {date}',

  editCta: 'Edit',
  editHeading: 'Editing the details',
  nameArLabel: 'Name in Arabic',
  nameArHint: 'The name as the association uses it in its own letters and minutes.',
  nameEnLabel: 'Name in English — optional',
  nameEnHint: 'It appears on the English pages. Leaving it empty beats an inaccurate translation.',
  kindLabel: 'Kind — optional',
  kindHint:
    'The word the association uses for this sort of thing, if it has one. There is no fixed list here and no developer needed: what you type is what is saved.',
  suggestionsNote:
    'The suggestions in this field come from what has already been recorded. They are not a closed list — type anything you like, even if it is not among them.',
  parentLabel: 'Part of — optional',
  parentHint:
    'Choose what this sits under, if it sits under anything: a media team under the media committee, for instance. Nothing may sit under itself, or under something that already sits under it.',
  parentNone: 'Not part of anything',
  descriptionArLabel: 'Description in Arabic — optional',
  descriptionEnLabel: 'Description in English — optional',
  descriptionHint: 'A line or two on what the work here actually is.',
  save: 'Record it',
  saveEdit: 'Save the change',

  concludeCta: 'Record that the work is finished',
  resumeCta: 'Record that it is meeting again',
  concludeNote:
    'Finishing is neither deleting nor archiving: the name stays on the list, the leadership history stays readable, and everyone who served here goes on saying so on their own record. A committee that achieved what it was set up for is not a mistake to be hidden.',

  archiveCta: 'Archive',
  archiveHeading: 'Why is this line being removed?',
  archiveNote:
    'Archiving is for a line that should never have been recorded: a duplicate, or a mistyped entry. Something that has finished its work is recorded as finished rather than archived, because archiving would hide the record of everyone who served in it along with it. Nothing is deleted either way, and the roles attached to it stay on their holders’ records exactly as they are.',
  reasonLabel: 'Reason for archiving',
  reasonPlaceholder: 'A few words is enough',
  archiveSubmit: 'Archive it',
  archivedShow: 'Show archived ({n})',
  archivedNote: 'Removed from the list and kept on the record. Nothing here is deleted.',
  archivedOn: 'Archived on {date}',
  archivedReason: 'Reason',

  notFound: 'That committee or team could not be found.',
  aboutHeading: 'About',
  currentHeading: 'Who holds a role now',
  currentEmpty: 'Nobody holds a role here right now.',
  pastHeading: 'Who held one before',
  pastEmpty: 'No past roles recorded.',
  nobodyYet: 'No role has been recorded here yet.',
  seenByLabel: 'Who can see it',
  seenBy: {
    public: 'Everyone, including outside the platform',
    volunteers: 'Volunteers signed in to the platform',
    staff: 'Staff only',
  },
  openPerson: 'Open their record',
  back: 'Back to committees and teams',

  leadershipHeading: 'Leadership history',
  leadershipLede:
    'Who has taken charge here, with their dates, newest first. Nobody replaces anybody: when one person succeeds another, the predecessor’s line is closed with its date and a new line is opened for the successor, and both stay on the record.',
  leadershipEmpty:
    'There is nothing on this record yet. It fills the first time somebody is recorded as taking charge here, with the date they took it, and nobody is erased from it afterwards.',

  addMemberCta: '+ Record a role here',
  addMemberHeading: 'Recording a new role',
  addMemberNote:
    'What is recorded here is a role on its holder’s own file, and it appears on their page exactly as it appears on this one. Membership has no second table: this is its only record, and the leadership history below is read from it.',
  personLabel: 'Who holds it',
  personHint: 'The list is ordered by name and by nothing else. Nothing in it counts anybody or compares two people.',
  personNone: 'Choose a volunteer',
  titleArLabel: 'Title in Arabic',
  titleArHint:
    'Write what the association actually calls it. There is no fixed list of titles: what you type is what is saved, and what appears on their record.',
  titleEnLabel: 'Title in English — optional',
  roleTypeLabel: 'Kind of role — optional',
  roleTypeHint: 'One word that classifies this line, if it has one.',
  startLabel: 'Start date',
  precisionLabel: 'How much of the date is known',
  precision: { day: 'The full date', month: 'Month and year', year: 'Year only' },
  currentLabel: 'Still holds it now',
  currentHint:
    'Untick this and the role is recorded as finished on a day nobody wrote down — a real state, not a missing field.',
  visibilityLabel: 'Who can see this line',
  visibilityHint:
    'The usual setting is volunteers signed in to the platform. Publishing it to the open web is a separate decision, taken line by line.',
  addMemberSubmit: 'Record the role',

  endCta: 'End',
  endHeading: 'Ending this role',
  endNote:
    'Ending deletes nothing: the role stays on its holder’s record exactly as it is, with an end date added to it. Whoever succeeds them gets a new line from the form above — no name is ever written over another.',
  endDateLabel: 'End date',
  endDateNote: 'Leave it empty if it ended on a day nobody wrote down; it is recorded as past with no date.',
  endPrecisionLabel: 'How much of the date is known',
  endSubmit: 'End the role',

  roleForm: {
    chooseLabel: 'Or choose one of the recorded committees and teams',
    chooseNone: 'None of these',
    chooseHint:
      'Choosing one here links the line to its record, so its holder appears on that committee’s or team’s own page. If the thing has no record in the platform — a campaign, a one-off task — type its name in the box above instead; a choice made here overrides whatever is typed there.',
  },

  errors: {
    'no-name': 'The Arabic name is required.',
    'parent-self': 'Nothing may sit under itself.',
    'parent-missing': 'The one you chose is no longer there.',
    'parent-cycle':
      'That choice would close a loop: the one you chose already sits under this one, directly or through another.',
    'no-archive-reason': 'Say why it is being archived.',
    'not-found': 'That line could not be found.',
    'no-title': 'The Arabic title is required.',
    'no-person': 'No holder was named.',
    'bad-date': 'That is not a valid date.',
    'out-of-order': 'The end date falls before the start date.',
    'current-and-ended':
      'A role cannot be current and carry an end date at once. Untick “still holds it now”, or clear the end date.',
    unavailable: 'The database is not available right now.',
    db: 'That could not be saved just now. Try again.',
  },
};

export const orgGroupDictionaries: Record<Locale, OrgGroupStrings> = {
  ar: orgGroupsAr,
  en: orgGroupsEn,
};

export function orgGroups(lang: Locale): OrgGroupStrings {
  return orgGroupDictionaries[lang];
}

/** The keys `errors` above answers to, so a page can read one off a URL safely. */
export function isGroupError(value: string): value is keyof OrgGroupStrings['errors'] {
  return Object.prototype.hasOwnProperty.call(orgGroupsAr.errors, value);
}
