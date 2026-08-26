import type { Locale } from '@/lib/i18n';

/**
 * Every string the projects screens need, in one file.
 *
 * Its own module rather than three splices into types.ts / ar.ts / en.ts,
 * following dictionaries/org-groups.ts and dictionaries/challenge-levels.ts for
 * the reason they give: those three files are edited in lockstep by other work,
 * and a screen's worth of new keys landing in the middle of them is a conflict
 * nobody learns anything from resolving. To fold it in later, add
 * `projectsAdmin: ProjectAdminStrings` to the Dictionary type and spread these
 * two objects into ar.ts and en.ts. Nothing else has to move.
 *
 * `dict.projects` in ar.ts and en.ts is a DIFFERENT thing and is deliberately
 * left alone: it is the public page's own kicker, title, lede and — until the
 * table is reachable — its four cards. See the head of app/[lang]/projects.
 *
 * Placeholders are filled with String.replace — {n}, {date} — which is the
 * convention the rest of the dictionary uses. There is no ICU here.
 *
 * ── THERE IS NO LIST OF STATUSES IN THIS FILE ─────────────────────────────
 *
 * Not as a select's options and not as an examples array. `status` on a project
 * is free text (migration 055), for the same reason role titles are free text
 * (migration 046): an association meets a new state — paused, finished,
 * handed over — faster than anybody ships a migration. `statusHint` therefore
 * explains the ONE word the public page reads specially, «قريباً», without
 * teaching a closed set; the only statuses anybody is ever offered are the ones
 * already recorded, read back out of the table as a typeahead.
 *
 * ── AND NOTHING HERE COUNTS PEOPLE ────────────────────────────────────────
 *
 * There is no string for "5 people on this project", no counted noun for
 * volunteers, and nothing that could order two projects by how many ran them.
 * `archivedShow` counts ARCHIVED PROJECTS, which are rows and not people.
 *
 * ── WHY THE HEADINGS SAY «المسؤول» AND NOT «المدير» ───────────────────────
 *
 * The brief's own case is «أحمد — المسؤول السابق للمشروع», and «مسؤول» is the
 * word a Lebanese association actually uses for the person answerable for a
 * file. More to the point, the headings name PERIODS and not posts — «من يتولّى
 * المشروع الآن» / «من تولّاه سابقاً» — because there is no manager column and no
 * fixed list of titles: whoever holds a role here appears under one heading or
 * the other by the dates on their own row, whatever that role is called.
 */

export type ProjectAdminStrings = {
  // ---- the list
  title: string;
  lede: string;
  empty: string;
  addCta: string;
  addHeading: string;
  openCta: string;
  tagBadge: string;
  statusBadge: string;
  publishedBadge: string;
  unpublishedBadge: string;
  comingSoonBadge: string;
  runsLabel: string;
  recordedOn: string;

  // ---- the form behind «إضافة» and «تعديل»
  editCta: string;
  editHeading: string;
  slugLabel: string;
  slugHint: string;
  nameArLabel: string;
  nameArHint: string;
  nameEnLabel: string;
  nameEnHint: string;
  tagArLabel: string;
  tagEnLabel: string;
  tagHint: string;
  summaryArLabel: string;
  summaryEnLabel: string;
  summaryHint: string;
  statusLabel: string;
  statusHint: string;
  suggestionsNote: string;
  startLabel: string;
  endLabel: string;
  precisionLabel: string;
  precision: { day: string; month: string; year: string };
  runHint: string;
  orderLabel: string;
  orderHint: string;
  save: string;
  saveEdit: string;

  // ---- on the public site, or not
  publishCta: string;
  unpublishCta: string;
  publishNote: string;

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

  // ---- one project
  notFound: string;
  aboutHeading: string;
  currentHeading: string;
  currentLede: string;
  currentEmpty: string;
  pastHeading: string;
  pastLede: string;
  pastEmpty: string;
  nobodyYet: string;
  seenByLabel: string;
  seenBy: { public: string; volunteers: string; staff: string };
  openPerson: string;
  back: string;
  viewPublic: string;

  // ---- putting somebody on it, which writes a volunteer_role and nothing else
  addPersonCta: string;
  addPersonHeading: string;
  addPersonNote: string;
  personLabel: string;
  personHint: string;
  personNone: string;
  titleArLabel: string;
  titleArHint: string;
  titleEnLabel: string;
  roleTypeLabel: string;
  roleTypeHint: string;
  roleStartLabel: string;
  currentLabel: string;
  currentHint: string;
  visibilityLabel: string;
  visibilityHint: string;
  addPersonSubmit: string;

  // ---- closing one, which is the other half of a succession
  endCta: string;
  endHeading: string;
  endNote: string;
  endDateLabel: string;
  endDateNote: string;
  endPrecisionLabel: string;
  endSubmit: string;

  /**
   * The entity picker on a member's role form, once projects are rows too.
   *
   * ── WHY THE WHOLE PICKER'S VOCABULARY MOVED HERE ──────────────────────
   *
   * dictionaries/org-groups.ts has a `roleForm` block of its own, written when
   * committees were the only rows a role could point at. Its label says «أو
   * اختر من اللجان والفرق المسجَّلة», which stopped being true the moment
   * projects became rows: the picker now offers two kinds under two headings,
   * and a label naming one of them would be wrong half the time.
   *
   * So the picker takes its five strings from here instead. The org-groups
   * block is left exactly where it is — that file belongs to the committees
   * feature and this one does not get to delete its strings — and whoever next
   * edits it can drop the three keys nothing reads any more.
   *
   * The hint below is the one that matters and it says the thing this whole
   * design rests on: choosing from the list is an ADDITION to the free-text
   * box, never a replacement for it. A campaign, a one-off task, a partner with
   * no row anywhere must stay recordable — see the head of migration 046.
   */
  roleForm: {
    chooseLabel: string;
    chooseNone: string;
    chooseHint: string;
    /** The two <optgroup> headings inside the one select. */
    groupsOptgroup: string;
    projectsOptgroup: string;
  };

  errors: {
    'no-name': string;
    'no-slug': string;
    'bad-slug': string;
    'slug-taken': string;
    'bad-date': string;
    'out-of-order': string;
    'no-archive-reason': string;
    'not-found': string;
    'no-title': string;
    'no-person': string;
    'current-and-ended': string;
    unavailable: string;
    db: string;
  };
};

export const projectsAdminAr: ProjectAdminStrings = {
  title: 'المشاريع',
  lede:
    'مشاريع الجمعية كما تظهر على الموقع، ومن تولّى كلّاً منها. لا حقل اسمه «مدير المشروع» هنا: من يتولّى مشروعاً يُسجَّل له منصب في سجلّه الشخصي بتواريخه، فإذا خلفه غيره أُقفل سطره وفُتح للاحق سطر جديد، ويبقى الاثنان.',
  empty: 'لم يُسجَّل بعد أيّ مشروع.',
  addCta: '+ إضافة مشروع',
  addHeading: 'مشروع جديد',
  openCta: 'افتح السجلّ',
  tagBadge: 'المجال',
  statusBadge: 'الحالة',
  publishedBadge: 'منشور',
  unpublishedBadge: 'غير منشور',
  comingSoonBadge: 'قريباً',
  runsLabel: 'مدّة العمل',
  recordedOn: 'سُجِّل في {date}',

  editCta: 'تعديل',
  editHeading: 'تعديل بيانات المشروع',
  slugLabel: 'المُعرّف في الرابط',
  slugHint:
    'حروف إنكليزية صغيرة وأرقام وشرطات، من حرفين إلى واحد وستّين. هو عنوان المشروع في الموقع، فتغييره يكسر الروابط التي شاركها الناس من قبل.',
  nameArLabel: 'الاسم بالعربية',
  nameArHint: 'الاسم كما تستعمله الجمعية في مراسلاتها ومنشوراتها.',
  nameEnLabel: 'الاسم بالإنكليزية — اختياري',
  nameEnHint: 'يظهر في النسخة الإنكليزية من الصفحات. تركُه فارغاً يعني عرض الاسم العربي مكانه.',
  tagArLabel: 'المجال بالعربية — اختياري',
  tagEnLabel: 'المجال بالإنكليزية — اختياري',
  tagHint: 'الكلمتان فوق اسم المشروع في الصفحة العامّة: «تعليم وإرشاد»، «تشغيل».',
  summaryArLabel: 'التعريف بالعربية',
  summaryEnLabel: 'التعريف بالإنكليزية',
  summaryHint:
    'الفقرة التي تُقرأ في بطاقة المشروع. اكتبها في اللغتين: تركُ الإنكليزية فارغةً يعني أن تظهر العربية في الصفحة الإنكليزية.',
  statusLabel: 'الحالة',
  statusHint:
    'كلمة واحدة تصف حال المشروع. لا قائمة محدَّدة هنا ولا حاجة إلى مبرمج، وكلمة واحدة فقط تُقرأ قراءةً خاصّة: «soon» تجعل البطاقة تظهر بإطار متقطّع وعليها «قريباً». ما عداها يُعرض مشروعاً قائماً.',
  suggestionsNote:
    'الاقتراحات في هذا الحقل مأخوذة ممّا سبق تسجيله، وليست قائمةً مغلقة — اكتب ما شئت ولو لم يَرِد فيها.',
  startLabel: 'تاريخ الانطلاق — اختياري',
  endLabel: 'تاريخ الانتهاء — اختياري',
  precisionLabel: 'ما تعرفه من التاريخ',
  precision: { day: 'اليوم كاملاً', month: 'الشهر والسنة', year: 'السنة وحدها' },
  runHint:
    'اترك ما لا تعرفه فارغاً. مشروعٌ انطلق «في مكانٍ ما من ٢٠٢١» يُسجَّل بالسنة وحدها، وهذا أصدق من يوم مُختَرع يُعرض بعد ذلك بوصفه واقعاً.',
  orderLabel: 'ترتيب العرض',
  orderHint: 'الأصغر أوّلاً في الصفحة العامّة. رقم عن المشروع، لا عن أحد.',
  save: 'سجّل',
  saveEdit: 'احفظ التعديل',

  publishCta: 'إظهار على الموقع',
  unpublishCta: 'إخفاء عن الموقع',
  publishNote:
    'الإخفاء يزيل المشروع من الصفحة العامّة وحدها. يبقى هنا، ويبقى كلّ من تولّاه يذكر ذلك في سجلّه، ولا يُحذف شيء.',

  archiveCta: 'أرشفة',
  archiveHeading: 'لماذا يُزال هذا السطر؟',
  archiveNote:
    'الأرشفة للسطر الذي ما كان ينبغي أن يُسجَّل أصلاً: تكرارٌ، أو خطأٌ في الإدخال. أمّا مشروعٌ انتهى عمله فيُسجَّل له تاريخ انتهاء ويُخفى عن الموقع إن لزم، لأنّ الأرشفة تُخفي معه سجلّ كلّ من تولّاه. لا يُحذف شيء في الحالتين، والمناصب المرتبطة تبقى في سجلّات أصحابها كما هي.',
  reasonLabel: 'سبب الأرشفة',
  reasonPlaceholder: 'كلمتان تكفيان',
  archiveSubmit: 'أرشف',
  archivedShow: 'إظهار المؤرشَف ({n})',
  archivedNote: 'أُزيلت من القائمة وبقيت في السجلّ. لا شيء ممّا هنا محذوف.',
  archivedOn: 'أُرشِف في {date}',
  archivedReason: 'السبب',

  notFound: 'لم يُعثر على هذا المشروع.',
  aboutHeading: 'التعريف',
  currentHeading: 'من يتولّى المشروع الآن',
  currentLede:
    'كلّ منصب مسجَّل على هذا المشروع ولم يُقفل بعد، بالاسم الذي سمّته به الجمعية. لا يميّز هذا السطر بين «مسؤول» و«عضو فريق»: ما يميّزهما هو ما كُتب في اسم المنصب نفسه.',
  currentEmpty: 'لا أحد يشغل منصباً على هذا المشروع الآن.',
  pastHeading: 'من تولّاه سابقاً',
  pastLede:
    '«المسؤول السابق للمشروع» ليس ميزةً مستقلّة: هو السطر نفسه بعد أن أُقفل بتاريخه. لا يُستبدل أحد بأحد، ولا يُمحى من هنا أحد.',
  pastEmpty: 'لا مناصب سابقة مسجَّلة على هذا المشروع.',
  nobodyYet: 'لم يُسجَّل بعد أيّ منصب على هذا المشروع.',
  seenByLabel: 'من يراه',
  seenBy: {
    public: 'الجميع، حتى من خارج المنصّة',
    volunteers: 'المتطوّعون داخل المنصّة',
    staff: 'الطاقم الإداري وحده',
  },
  openPerson: 'صفحة المتطوّع',
  back: 'العودة إلى المشاريع',
  viewPublic: 'الصفحة العامّة للمشاريع',

  addPersonCta: '+ تسجيل منصب على هذا المشروع',
  addPersonHeading: 'تسجيل منصب جديد',
  addPersonNote:
    'ما يُسجَّل هنا منصبٌ في سجلّ صاحبه، يظهر في صفحته كما يظهر في هذه الصفحة. وهذا هو سجلّ تولّي المشروع الوحيد: لا عمود باسم المسؤول في مكانٍ آخر، ولا جدول ثانٍ يُقرأ منه.',
  personLabel: 'صاحب المنصب',
  personHint: 'القائمة مرتّبة بالأسماء وحدها. لا شيء فيها يعدّ أحداً ولا يقارن بين اثنين.',
  personNone: 'اختر متطوّعاً',
  titleArLabel: 'اسم المنصب بالعربية',
  titleArHint:
    'اكتب ما تسمّيه الجمعية فعلاً: «مسؤول المشروع»، «منسّقة الميدان»، أو غير ذلك. لا قائمة محدَّدة للمناصب هنا.',
  titleEnLabel: 'اسم المنصب بالإنكليزية — اختياري',
  roleTypeLabel: 'نوع المنصب — اختياري',
  roleTypeHint: 'كلمة واحدة تصنّف هذا السطر، إن كانت له كلمة.',
  roleStartLabel: 'تاريخ تولّي المنصب',
  currentLabel: 'ما زال يشغله حتى الآن',
  currentHint:
    'إن رفعت هذه العلامة، يُسجَّل المنصب منتهياً في يوم لم يُدوَّن — وهي حالة صحيحة لا حقل ناقص.',
  visibilityLabel: 'من يرى هذا السطر',
  visibilityHint:
    'الوضع المعتاد أن يراه المتطوّعون داخل المنصّة. نشرُه للعموم قرار منفصل يُتَّخذ لكلّ سطر على حدة.',
  addPersonSubmit: 'سجّل المنصب',

  endCta: 'إنهاء',
  endHeading: 'إنهاء هذا المنصب',
  endNote:
    'الإنهاء لا يحذف شيئاً: يبقى المنصب في سجلّ صاحبه كما هو ويُضاف إليه تاريخ انتهائه، فينتقل إلى «من تولّاه سابقاً». ومن يخلفه يُسجَّل له سطرٌ جديد بالنموذج أعلاه — لا يُستبدل اسمٌ باسم.',
  endDateLabel: 'تاريخ الانتهاء',
  endDateNote: 'اتركه فارغاً إن كان قد انتهى في يوم لم يُدوَّن؛ يُسجَّل سابقاً بلا تاريخ.',
  endPrecisionLabel: 'ما تعرفه من التاريخ',
  endSubmit: 'أنهِ المنصب',

  roleForm: {
    chooseLabel: 'أو اختر من المسجَّل في المنصّة',
    chooseNone: 'لا شيء من هذه',
    chooseHint:
      'اختيار واحدٍ من هنا يربط السطر بسجلّه، فيظهر صاحبه في صفحة تلك اللجنة أو ذاك المشروع. وإن كانت الجهة بلا سجلّ في المنصّة — حملةٌ أو مهمّةٌ عابرة — فاكتب اسمها في الحقل أعلاه؛ الاختيار من هنا يَجُبّ ما كُتب هناك.',
    groupsOptgroup: 'اللجان والفرق',
    projectsOptgroup: 'المشاريع',
  },

  errors: {
    'no-name': 'الاسم بالعربية مطلوب.',
    'no-slug': 'المُعرّف في الرابط مطلوب.',
    'bad-slug':
      'المُعرّف يقبل الحروف الإنكليزية الصغيرة والأرقام والشرطات فقط، ويبدأ بحرف أو رقم، وطوله بين حرفين وواحد وستّين.',
    'slug-taken': 'هذا المُعرّف مستعمل في مشروع آخر.',
    'bad-date': 'التاريخ غير صالح.',
    'out-of-order': 'تاريخ الانتهاء يسبق تاريخ الانطلاق.',
    'no-archive-reason': 'اذكر سبب الأرشفة.',
    'not-found': 'لم يُعثر على هذا السطر.',
    'no-title': 'اسم المنصب بالعربية مطلوب.',
    'no-person': 'لم يُحدَّد صاحب المنصب.',
    'current-and-ended':
      'لا يكون المنصب قائماً وله تاريخ انتهاء في آن. ارفع علامة «ما زال يشغله» أو امحُ تاريخ الانتهاء.',
    unavailable: 'قاعدة البيانات غير متاحة الآن.',
    db: 'تعذّر الحفظ الآن. حاول مرّة أخرى.',
  },
};

export const projectsAdminEn: ProjectAdminStrings = {
  title: 'Projects',
  lede:
    'The association’s projects as the public site shows them, and who has taken charge of each. There is no “project manager” field here: whoever runs a project has a role recorded on their own file with its dates, and when somebody succeeds them their line is closed and a new one opened, so both survive.',
  empty: 'No project has been recorded yet.',
  addCta: '+ Add a project',
  addHeading: 'A new project',
  openCta: 'Open the record',
  tagBadge: 'Area',
  statusBadge: 'Status',
  publishedBadge: 'Published',
  unpublishedBadge: 'Not published',
  comingSoonBadge: 'Coming soon',
  runsLabel: 'Running',
  recordedOn: 'Recorded on {date}',

  editCta: 'Edit',
  editHeading: 'Editing the project',
  slugLabel: 'Identifier in the URL',
  slugHint:
    'Lowercase letters, digits and hyphens, between 2 and 61 characters. It is the project’s address on the site, so changing it breaks links people have already shared.',
  nameArLabel: 'Name in Arabic',
  nameArHint: 'The name as the association uses it in its own letters and posts.',
  nameEnLabel: 'Name in English — optional',
  nameEnHint: 'It appears on the English pages. Leaving it empty shows the Arabic name in its place.',
  tagArLabel: 'Area in Arabic — optional',
  tagEnLabel: 'Area in English — optional',
  tagHint: 'The two words above the project’s name on the public page: “Employment”, “Education and guidance”.',
  summaryArLabel: 'Description in Arabic',
  summaryEnLabel: 'Description in English',
  summaryHint:
    'The paragraph read on the project’s card. Write it in both languages: leaving the English empty means the Arabic appears on the English page.',
  statusLabel: 'Status',
  statusHint:
    'One word for how the project stands. There is no fixed list here and no developer needed, and exactly one word is read specially: “soon” gives the card a dashed border and a “Coming soon” badge. Anything else is shown as a project that is running.',
  suggestionsNote:
    'The suggestions in this field come from what has already been recorded. They are not a closed list — type anything you like, even if it is not among them.',
  startLabel: 'Start date — optional',
  endLabel: 'End date — optional',
  precisionLabel: 'How much of the date is known',
  precision: { day: 'The full date', month: 'Month and year', year: 'Year only' },
  runHint:
    'Leave what you do not know empty. A project that began “sometime in 2021” is recorded to the year, which is truer than an invented day that is then displayed as fact.',
  orderLabel: 'Display order',
  orderHint: 'Lowest first on the public page. A number about the project, not about anybody.',
  save: 'Record it',
  saveEdit: 'Save the change',

  publishCta: 'Show on the site',
  unpublishCta: 'Hide from the site',
  publishNote:
    'Hiding removes the project from the public page and from nowhere else. It stays here, everyone who ran it goes on saying so on their own record, and nothing is deleted.',

  archiveCta: 'Archive',
  archiveHeading: 'Why is this line being removed?',
  archiveNote:
    'Archiving is for a line that should never have been recorded: a duplicate, or a mistyped entry. A project that has finished gets an end date instead, and is hidden from the site if that is wanted, because archiving would hide the record of everyone who ran it along with it. Nothing is deleted either way, and the roles attached to it stay on their holders’ records exactly as they are.',
  reasonLabel: 'Reason for archiving',
  reasonPlaceholder: 'A few words is enough',
  archiveSubmit: 'Archive it',
  archivedShow: 'Show archived ({n})',
  archivedNote: 'Removed from the list and kept on the record. Nothing here is deleted.',
  archivedOn: 'Archived on {date}',
  archivedReason: 'Reason',

  notFound: 'That project could not be found.',
  aboutHeading: 'About',
  currentHeading: 'Who is running it now',
  currentLede:
    'Every role recorded on this project that has not been closed yet, under the name the association gave it. This list does not tell a “lead” from a “team member”: what tells them apart is what the title itself says.',
  currentEmpty: 'Nobody holds a role on this project right now.',
  pastHeading: 'Who ran it before',
  pastLede:
    'A “former project lead” is not a separate feature: it is the same line after it was closed with its date. Nobody replaces anybody, and nobody is erased from here.',
  pastEmpty: 'No past roles recorded on this project.',
  nobodyYet: 'No role has been recorded on this project yet.',
  seenByLabel: 'Who can see it',
  seenBy: {
    public: 'Everyone, including outside the platform',
    volunteers: 'Volunteers signed in to the platform',
    staff: 'Staff only',
  },
  openPerson: 'Open their record',
  back: 'Back to projects',
  viewPublic: 'The public projects page',

  addPersonCta: '+ Record a role on this project',
  addPersonHeading: 'Recording a new role',
  addPersonNote:
    'What is recorded here is a role on its holder’s own file, and it appears on their page exactly as it appears on this one. This is the only record of who has run this project: there is no manager column anywhere else, and no second table to read it from.',
  personLabel: 'Who holds it',
  personHint: 'The list is ordered by name and by nothing else. Nothing in it counts anybody or compares two people.',
  personNone: 'Choose a volunteer',
  titleArLabel: 'Title in Arabic',
  titleArHint:
    'Write what the association actually calls it — «مسؤول المشروع», «منسّقة الميدان», anything. There is no fixed list of titles here.',
  titleEnLabel: 'Title in English — optional',
  roleTypeLabel: 'Kind of role — optional',
  roleTypeHint: 'One word that classifies this line, if it has one.',
  roleStartLabel: 'Date they took it on',
  currentLabel: 'Still holds it now',
  currentHint:
    'Untick this and the role is recorded as finished on a day nobody wrote down — a real state, not a missing field.',
  visibilityLabel: 'Who can see this line',
  visibilityHint:
    'The usual setting is volunteers signed in to the platform. Publishing it to the open web is a separate decision, taken line by line.',
  addPersonSubmit: 'Record the role',

  endCta: 'End',
  endHeading: 'Ending this role',
  endNote:
    'Ending deletes nothing: the role stays on its holder’s record exactly as it is, with an end date added, and moves down to “who ran it before”. Whoever succeeds them gets a new line from the form above — no name is ever written over another.',
  endDateLabel: 'End date',
  endDateNote: 'Leave it empty if it ended on a day nobody wrote down; it is recorded as past with no date.',
  endPrecisionLabel: 'How much of the date is known',
  endSubmit: 'End the role',

  roleForm: {
    chooseLabel: 'Or choose one of the records already in the platform',
    chooseNone: 'None of these',
    chooseHint:
      'Choosing one here links the line to its record, so its holder appears on that committee’s or that project’s own page. If the thing has no record in the platform — a campaign, a one-off task — type its name in the box above instead; a choice made here overrides whatever is typed there.',
    groupsOptgroup: 'Committees & teams',
    projectsOptgroup: 'Projects',
  },

  errors: {
    'no-name': 'The Arabic name is required.',
    'no-slug': 'The URL identifier is required.',
    'bad-slug':
      'The identifier takes lowercase letters, digits and hyphens only, starts with a letter or digit, and is between 2 and 61 characters long.',
    'slug-taken': 'Another project is already using that identifier.',
    'bad-date': 'That is not a valid date.',
    'out-of-order': 'The end date falls before the start date.',
    'no-archive-reason': 'Say why it is being archived.',
    'not-found': 'That line could not be found.',
    'no-title': 'The Arabic title is required.',
    'no-person': 'No holder was named.',
    'current-and-ended':
      'A role cannot be current and carry an end date at once. Untick “still holds it now”, or clear the end date.',
    unavailable: 'The database is not available right now.',
    db: 'That could not be saved just now. Try again.',
  },
};

export const projectAdminDictionaries: Record<Locale, ProjectAdminStrings> = {
  ar: projectsAdminAr,
  en: projectsAdminEn,
};

export function projectsAdmin(lang: Locale): ProjectAdminStrings {
  return projectAdminDictionaries[lang];
}

/** The keys `errors` above answers to, so a page can read one off a URL safely. */
export function isProjectError(value: string): value is keyof ProjectAdminStrings['errors'] {
  return Object.prototype.hasOwnProperty.call(projectsAdminAr.errors, value);
}
