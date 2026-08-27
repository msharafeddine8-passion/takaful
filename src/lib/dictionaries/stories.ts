import type { Locale } from '@/lib/i18n';

/**
 * Every string «قصص من الميدان» needs — the gallery, the story page and the
 * staff screen.
 *
 * Its own module rather than three splices into types.ts / ar.ts / en.ts,
 * following dictionaries/partners.ts and dictionaries/org-groups.ts for the
 * reason they give: those three files are edited in lockstep by other work, and
 * a screen's worth of new keys landing in the middle of them is a conflict
 * nobody learns anything from resolving. To fold it in later, add
 * `stories: StoryStrings` to the Dictionary type and spread these two objects
 * into ar.ts and en.ts. Nothing else has to move.
 *
 * Placeholders are filled with String.replace — {n}, {date} — which is the
 * convention the rest of the dictionary uses. There is no ICU here.
 *
 * ── THERE IS NO PARTICIPANT-COUNT LABEL FOR A FIELD, BECAUSE THERE IS NO FIELD
 *
 * `figuresNote` and `derivedNote` below are the only strings about the two
 * figures, and both of them say the same thing in their own register: the
 * numbers come from the attendance register and nobody types them. There is no
 * `participantsLabel` on a form here, no placeholder reading «٤٠», and no hint
 * explaining how to count. A dictionary that offered those words would be the
 * first half of a feature migration 060 exists to refuse.
 *
 * ── THE THREE ANSWERS ABOUT A PHOTOGRAPH ARE WRITTEN OUT IN FULL ──────────
 *
 * `faces` is a closed set — unlike a partner's kind or a project's status,
 * which are free text precisely because an association invents a ninth of them
 * before anybody ships a migration. This is not a word the association invents;
 * it is a consent decision, and it has exactly three answers.
 *
 * Each one carries a sentence rather than a label, and the sentences are
 * deliberately concrete — «مشهد من باب القاعة», not «صورة عامّة». The person
 * choosing is a coordinator with forty pictures on a phone and ten minutes, and
 * an abstraction is what gets clicked past. lib/photos.ts records what this
 * association has already lived through: the homepage photograph has had to
 * change three times because a volunteer in it, recognisable and posed, has
 * since started wearing hijab, and a picture taken years ago was still
 * introducing her to strangers.
 */

/** One of the three answers about who is in a picture, as a person reads it. */
export type FacesStrings = { label: string; hint: string };

export type StoryStrings = {
  // ---- the stories block on /gallery
  sectionKicker: string;
  sectionTitle: string;
  sectionLede: string;
  /** Shown, as the page's own content, when nothing is published. */
  nothingYet: string;
  readMore: string;

  // ---- the photographs already on /gallery, now under their own heading
  archiveKicker: string;
  archiveTitle: string;
  archiveLede: string;

  // ---- one story
  onDate: string;
  atPlace: string;
  withinProject: string;
  associationWide: string;
  participantsLabel: string;
  hoursLabel: string;
  /** Why those two numbers are trustworthy. Public wording. */
  figuresNote: string;
  whatHappened: string;
  whatChanged: string;
  morePhotos: string;
  backToGallery: string;
  notFoundTitle: string;

  // ---- the staff list
  staffTitle: string;
  staffLede: string;
  empty: string;
  addCta: string;
  addHeading: string;
  publishedBadge: string;
  unpublishedBadge: string;
  projectBadge: string;
  activityBadge: string;
  noActivityBadge: string;
  participantsBadge: string;
  hoursBadge: string;
  photosBadge: string;
  recordedOn: string;
  viewPublic: string;

  // ---- the form
  editCta: string;
  editHeading: string;
  titleArLabel: string;
  titleArHint: string;
  titleEnLabel: string;
  titleEnHint: string;
  slugLabel: string;
  slugHint: string;
  locationArLabel: string;
  locationEnLabel: string;
  locationHint: string;
  dateLabel: string;
  dateHint: string;
  precisionLabel: string;
  precision: { day: string; month: string; year: string };
  projectLabel: string;
  projectNone: string;
  projectHint: string;
  activityLabel: string;
  activityNone: string;
  activityHint: string;
  /** How an activity reads in the picker: «{title} — {date} · {n}». */
  activityOption: string;
  activityOptionUndated: string;
  /** THE reason there is no participant box. Staff wording. */
  derivedNote: string;
  descriptionArLabel: string;
  descriptionEnLabel: string;
  descriptionHint: string;
  impactArLabel: string;
  impactEnLabel: string;
  impactHint: string;
  peopleNote: string;
  sortLabel: string;
  sortHint: string;
  save: string;
  saveEdit: string;

  // ---- on the page, or not
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

  // ---- the pictures
  photosCta: string;
  photosHeading: string;
  photosEmpty: string;
  photoConsentNote: string;
  fileLabel: string;
  fileHint: string;
  altArLabel: string;
  altEnLabel: string;
  altHint: string;
  facesLabel: string;
  faces: { none: FacesStrings; adults: FacesStrings; restricted: FacesStrings };
  photoOrderLabel: string;
  photoOrderHint: string;
  uploadSubmit: string;
  uploadedOn: string;
  photoSize: string;
  restrictedBadge: string;
  coverBadge: string;
  facesChangeCta: string;
  facesChangeNote: string;
  facesSubmit: string;
  removeCta: string;
  removeNote: string;

  errors: {
    'no-title': string;
    'no-slug': string;
    'bad-slug': string;
    'slug-taken': string;
    'bad-date': string;
    'no-project': string;
    'no-activity': string;
    'no-archive-reason': string;
    'no-image': string;
    'bad-image': string;
    'image-too-large': string;
    'no-faces': string;
    'not-found': string;
    unavailable: string;
    db: string;
  };
};

export const storiesAr: StoryStrings = {
  sectionKicker: 'من الميدان',
  sectionTitle: 'قصص من الميدان',
  sectionLede:
    'ما جرى فعلاً في يومٍ بعينه: أين كان، ومَن شارك فيه، وكم من الوقت بُذل، وما الذي تغيّر بعده. لا نكتب هنا ما ننوي فعله، بل ما فعلناه.',
  nothingYet:
    'لم تُروَ بعد أيّ قصّة على هذه الصفحة. حين تُكتب الأولى تجدونها هنا: تاريخها ومكانها والمشروع الذي تنتمي إليه، وعدد المشاركين وساعات تطوّعهم كما هي في سجلّ الحضور، لا كما نقدّرها.',
  readMore: 'اقرأ القصّة',

  archiveKicker: 'الأرشيف',
  archiveTitle: 'صور من سنوات العمل',
  archiveLede:
    'لقطات مختارة من أرشيف الجمعية. ما يُنشر منها لا يُظهر وجهاً بعينه إلّا بعلم صاحبه.',

  onDate: 'التاريخ',
  atPlace: 'المكان',
  withinProject: 'ضمن مشروع',
  associationWide: 'عمل عامّ للجمعية',
  participantsLabel: 'المشاركون',
  hoursLabel: 'ساعات التطوّع',
  figuresNote:
    'العددان أعلاه مقروءان من سجلّ الحضور نفسه الذي تُحتسب منه ساعات المتطوّعين، لا من رقم يُكتب مع القصّة. إن صُحِّح السجلّ تغيّرا معه.',
  whatHappened: 'ما جرى',
  whatChanged: 'الأثر',
  morePhotos: 'صور من اليوم',
  backToGallery: 'إلى كلّ القصص',
  notFoundTitle: 'لا توجد قصّة بهذا العنوان',

  staffTitle: 'قصص من الميدان',
  staffLede:
    'ما تقوله الجمعية عن عملها، وصوره. ما يُنشر هنا يقرأه الناس على صفحة مفتوحة، وفيه صور أشخاص لا يستطيعون سحبها بأنفسهم — فاقرأ ما تكتبه مرّةً كأنّك من خارج الجمعية قبل أن تنشره.',
  empty: 'لم تُسجَّل بعد أيّ قصّة.',
  addCta: '+ إضافة قصّة',
  addHeading: 'قصّة جديدة',
  publishedBadge: 'منشورة',
  unpublishedBadge: 'غير منشورة',
  projectBadge: 'المشروع',
  activityBadge: 'النشاط',
  noActivityBadge: 'بلا نشاط — لا أرقام',
  participantsBadge: 'مشاركون',
  hoursBadge: 'ساعات',
  photosBadge: 'صور',
  recordedOn: 'سُجِّلت في {date}',
  viewPublic: 'عرض الصفحة العامّة',

  editCta: 'تعديل',
  editHeading: 'تعديل القصّة',
  titleArLabel: 'العنوان بالعربية',
  titleArHint: 'جملة تقول ما جرى، لا اسم النشاط وحده: «يوم في مدرسة المنية» أوضح من «نشاط تعليمي».',
  titleEnLabel: 'العنوان بالإنكليزية — اختياري',
  titleEnHint: 'يظهر في النسخة الإنكليزية. تركُه فارغاً أفضل من ترجمة غير دقيقة.',
  slugLabel: 'المُعرِّف في الرابط',
  slugHint:
    'حروف لاتينية صغيرة وأرقام وشُرَط فقط، مثل: mounia-school-2025. يدخل في الرابط ويبقى ثابتاً بعد النشر، فاختره مرّة واحدة.',
  locationArLabel: 'المكان بالعربية — اختياري',
  locationEnLabel: 'المكان بالإنكليزية — اختياري',
  locationHint: 'البلدة أو الحيّ كما يسمّيه أهله. لا حاجة إلى عنوان مفصَّل.',
  dateLabel: 'التاريخ — اختياري',
  dateHint:
    'اتركه فارغاً إن كانت القصّة مرتبطة بنشاط: يُؤخَذ تاريخه هو، فلا يبقى تاريخان لليوم نفسه. املأه حين تجمع القصّة أكثر من يوم، أو حين لا نشاط خلفها.',
  precisionLabel: 'ما تعرفه من التاريخ',
  precision: { day: 'اليوم كاملاً', month: 'الشهر والسنة', year: 'السنة وحدها' },
  projectLabel: 'المشروع — اختياري',
  projectNone: 'عمل عامّ للجمعية',
  projectHint: 'اتركه على «عمل عامّ» إن لم تكن القصّة ضمن مشروع بعينه؛ ذلك أصدق من نسبتها إلى أقربها شبهاً.',
  activityLabel: 'النشاط — اختياري',
  activityNone: 'بلا نشاط',
  activityHint:
    'اختيار النشاط هو ما يجلب عدد المشاركين وساعات التطوّع. الرقم بين قوسين هو عدد من سُجِّل حضورهم فعلاً، فإن بدا صفراً فالسجلّ لم يُملأ بعد ولن تظهر أرقام.',
  activityOption: '{title} — {date} · {n} حاضراً',
  activityOptionUndated: '{title} — بلا تاريخ · {n} حاضراً',
  derivedNote:
    'لا حقل هنا لعدد المشاركين ولا لساعات التطوّع، وهذا مقصود. إن رُبطت القصّة بنشاط جاء الرقمان من سجلّ حضوره: من حضر فعلاً، وكم دقيقة سُجِّلت له. أمّا رقمٌ يُكتب باليد إلى جانب سجلّ حقيقي فهو حقيقة ثانية عن اليوم نفسه: يوافق الأولى يوم يُكتب، ثمّ يفترق عنها بصمت حين يُصحَّح السجلّ أو يُضاف إليه اسم — ويبقى المنشور على الإنترنت هو الرقم الخطأ.',
  descriptionArLabel: 'ما جرى — بالعربية',
  descriptionEnLabel: 'ما جرى — بالإنكليزية (اختياري)',
  descriptionHint: 'فقرة أو فقرتان: ماذا فعلنا، وكيف مضى اليوم.',
  impactArLabel: 'الأثر — بالعربية',
  impactEnLabel: 'الأثر — بالإنكليزية (اختياري)',
  impactHint: 'ما الذي صار مختلفاً بعد هذا اليوم. جملةٌ محدَّدة أنفع من كلام عامّ عن الأثر.',
  peopleNote:
    'لا تذكر أسماء المتطوّعين ولا أسماء المستفيدين في النصّ. صفحة الاستمرارية وحدها تنشر الأسماء، وهي تفعل ذلك بعد سؤال أصحابها؛ اسمٌ يمرّ في قصّة لم يمرّ على ذلك السؤال.',
  sortLabel: 'الترتيب في الصفحة',
  sortHint: 'رقم أصغر يعني موضعاً أسبق. المتساوون تُرتّبهم تواريخهم، والأحدث أوّلاً.',
  save: 'سجّل',
  saveEdit: 'احفظ التعديل',

  publishCta: 'نشر على الصفحة العامّة',
  unpublishCta: 'سحب من الصفحة العامّة',
  publishNote:
    'السحب من الصفحة ليس أرشفةً ولا حذفاً: تبقى القصّة هنا بصورها وبما ربطته من نشاط، وتختفي من الصفحة التي يقرأها الناس. أمّا صورةٌ طلب صاحبها إزالتها فتُزال من قائمة الصور أدناه، لا بسحب القصّة كلّها.',

  archiveCta: 'أرشفة',
  archiveHeading: 'لماذا تُزال هذه القصّة؟',
  archiveNote:
    'الأرشفة للسطر الذي ما كان ينبغي أن يُسجَّل: تكرارٌ، أو مسوّدة أُدخلت مرّتين، أو قصّة عن النشاط الخطأ. أمّا قصّةٌ حصلت فعلاً وانقضى وقت عرضها فتُسحَب من الصفحة ولا تُؤرشَف. لا يُحذف شيء في الحالتين؛ قاعدة البيانات ترفض حذف القصّة رفضاً.',
  reasonLabel: 'سبب الأرشفة',
  reasonPlaceholder: 'كلمتان تكفيان',
  archiveSubmit: 'أرشف',
  archivedShow: 'إظهار المؤرشَف ({n})',
  archivedNote: 'أُزيلت من القائمة وبقيت في السجلّ. لا شيء ممّا هنا محذوف.',
  archivedOn: 'أُرشِفت في {date}',
  archivedReason: 'السبب',

  photosCta: 'الصور',
  photosHeading: 'صور هذه القصّة',
  photosEmpty: 'لا صورة بعد. تظهر القصّة على الصفحة العامّة من دون صورة.',
  photoConsentNote:
    'الصورة تُنشر على الإنترنت، ومن فيها لا يستطيع سحبها بنفسه. فضِّل الصور التي لا يُعرف فيها وجه بعينه: مشهدٌ من باب القاعة يقول عن عمل الجمعية أكثر ممّا يقوله صفٌّ من الوجوه، ولا يضع ماضي أحد على صفحة عامّة. والصورة التي يُعرف فيها أشخاص لا تُنشر إلّا إن كانوا بالغين ووافقوا. وكلّ صورة يُعرف فيها وجه طفل تُحفَظ هنا ولا تُنشر أبداً — لا بموافقة أحد.',
  fileLabel: 'ملف الصورة',
  fileHint:
    'JPEG أو PNG أو WebP، وبحدّ أقصى ٨٠٠ كيلوبايت. صدِّر الصورة بعرض ١٢٠٠ بكسل تقريباً قبل الرفع: لا يوجد هنا ما يصغّرها عنك، والصورة الثقيلة يدفع ثمنها من يفتح الصفحة على شبكة الهاتف.',
  altArLabel: 'وصف الصورة بالعربية — اختياري',
  altEnLabel: 'وصف الصورة بالإنكليزية — اختياري',
  altHint: 'سطر يصف ما في الصورة لمن لا يراها. صِف المشهد لا الأشخاص.',
  facesLabel: 'مَن يظهر في الصورة؟',
  faces: {
    none: {
      label: 'لا يُعرف فيها وجه بعينه',
      hint: 'مشهد من بعيد، أو من باب القاعة، أو أيادٍ تعمل، أو ظهور. هذا هو الخيار الأوّل حين يصحّ.',
    },
    adults: {
      label: 'كلّ من يُعرف فيها بالغ ووافق على النشر',
      hint: 'اخترها فقط إن سألتَهم فعلاً واحداً واحداً. «لن يمانعوا» ليست موافقة.',
    },
    restricted: {
      label: 'غير ذلك — فيها طفل يُعرف، أو شخص لم يُسأل',
      hint: 'تُحفَظ الصورة هنا ولا تظهر على أيّ صفحة عامّة، ولا في رابطها المباشر. اخترها متى ترددت.',
    },
  },
  photoOrderLabel: 'ترتيب الصورة',
  photoOrderHint: 'الصورة الأولى في الترتيب هي التي تظهر على البطاقة في صفحة القصص.',
  uploadSubmit: 'ارفع الصورة',
  uploadedOn: 'رُفعت في {date}',
  photoSize: '{n} كيلوبايت',
  restrictedBadge: 'محجوبة — لا تُنشر',
  coverBadge: 'صورة البطاقة',
  facesChangeCta: 'تعديل الإجابة',
  facesChangeNote:
    'إن طلب أحدهم إزالة صورته فالإزالة أدناه هي الجواب، لا تغيير هذه الإجابة. تُستعمل هذه هنا حين تكون الإجابة الأولى خاطئة.',
  facesSubmit: 'احفظ',
  removeCta: 'إزالة الصورة',
  removeNote:
    'الإزالة حذفٌ فعليّ ونهائيّ للصورة وحدها؛ القصّة وبقيّة صورها تبقى. هذا هو الشيء الوحيد الذي تُحذف بياناته في هذا النظام، لأنّ طلب «انزعوا صورتي» يجب أن يُنفَّذ في الحال لا أن يُؤجَّل إلى من يملك صلاحية أعمق.',

  errors: {
    'no-title': 'العنوان بالعربية مطلوب.',
    'no-slug': 'المُعرِّف في الرابط مطلوب.',
    'bad-slug': 'المُعرِّف يقبل الحروف اللاتينية الصغيرة والأرقام والشُرَط فقط، ويبدأ بحرف أو رقم.',
    'slug-taken': 'هذا المُعرِّف مستعمَل لقصّة أخرى.',
    'bad-date': 'التاريخ غير صالح.',
    'no-project': 'لم يُعثر على هذا المشروع، أو أُرشِف.',
    'no-activity': 'لم يُعثر على هذا النشاط.',
    'no-archive-reason': 'اذكر سبب الأرشفة.',
    'no-image': 'لم يصل ملف صورة.',
    'bad-image': 'الملف ليس صورة من نوع مقبول. المقبول: JPEG أو PNG أو WebP.',
    'image-too-large': 'الصورة أكبر من ٨٠٠ كيلوبايت. صدِّرها بحجم أصغر ثمّ أعد الرفع.',
    'no-faces': 'حدِّد مَن يظهر في الصورة قبل رفعها.',
    'not-found': 'لم يُعثر على هذا السطر.',
    unavailable: 'قاعدة البيانات غير متاحة الآن.',
    db: 'تعذّر الحفظ الآن. حاول مرّة أخرى.',
  },
};

export const storiesEn: StoryStrings = {
  sectionKicker: 'From the field',
  sectionTitle: 'Stories from the field',
  sectionLede:
    'What actually happened on a particular day: where it was, who took part, how much time went into it, and what was different afterwards. Not what we intend to do — what we did.',
  nothingYet:
    'No story has been told on this page yet. The first one written will appear here with its date, its place and the project it belongs to, and with the number of people who took part and the hours they gave as the attendance register has them — not as we estimate them.',
  readMore: 'Read the story',

  archiveKicker: 'Archive',
  archiveTitle: 'Photographs from the years of work',
  archiveLede:
    'A selection from the association’s own archive. What is published shows no particular face without its owner knowing.',

  onDate: 'Date',
  atPlace: 'Place',
  withinProject: 'Part of',
  associationWide: 'Association-wide work',
  participantsLabel: 'People taking part',
  hoursLabel: 'Volunteer hours',
  figuresNote:
    'Both figures above are read from the same attendance register the volunteers’ own hours are credited from, not from a number typed alongside the story. Correct the register and they change with it.',
  whatHappened: 'What happened',
  whatChanged: 'The impact',
  morePhotos: 'Photographs from the day',
  backToGallery: 'All the stories',
  notFoundTitle: 'There is no story at this address',

  staffTitle: 'Stories from the field',
  staffLede:
    'What the association says about its own work, and the pictures of it. What is published here is read by anybody on an open page, and it carries photographs of people who cannot take them down themselves — so read what you have written once as an outsider before you publish it.',
  empty: 'No story has been recorded yet.',
  addCta: '+ Add a story',
  addHeading: 'A new story',
  publishedBadge: 'Published',
  unpublishedBadge: 'Not published',
  projectBadge: 'Project',
  activityBadge: 'Activity',
  noActivityBadge: 'No activity — no figures',
  participantsBadge: 'took part',
  hoursBadge: 'hours',
  photosBadge: 'photographs',
  recordedOn: 'Recorded on {date}',
  viewPublic: 'View the public page',

  editCta: 'Edit',
  editHeading: 'Editing the story',
  titleArLabel: 'Title in Arabic',
  titleArHint:
    'A line that says what happened, rather than the activity’s name on its own: “A day at the Mounia school” tells a reader more than “Educational activity”.',
  titleEnLabel: 'Title in English — optional',
  titleEnHint: 'It appears on the English page. Leaving it empty beats an inaccurate translation.',
  slugLabel: 'Identifier in the URL',
  slugHint:
    'Lowercase Latin letters, digits and hyphens only — mounia-school-2025, for instance. It goes into the address and stays fixed once published, so choose it once.',
  locationArLabel: 'Place, in Arabic — optional',
  locationEnLabel: 'Place, in English — optional',
  locationHint: 'The town or the neighbourhood as the people there call it. No full address needed.',
  dateLabel: 'Date — optional',
  dateHint:
    'Leave it empty when the story is linked to an activity: the activity’s own date is used, so one afternoon does not end up with two dates. Fill it in when a story covers more than one day, or when there is no activity behind it.',
  precisionLabel: 'How much of the date is known',
  precision: { day: 'The full date', month: 'Month and year', year: 'Year only' },
  projectLabel: 'Project — optional',
  projectNone: 'Association-wide work',
  projectHint:
    'Leave it on “association-wide” when the story does not belong to one project. That is truer than filing it under whichever project sounds closest.',
  activityLabel: 'Activity — optional',
  activityNone: 'No activity',
  activityHint:
    'Choosing an activity is what brings in the participant count and the volunteer hours. The figure in brackets is how many people are actually marked present, so a zero means the register has not been filled in yet and no figures will appear.',
  activityOption: '{title} — {date} · {n} present',
  activityOptionUndated: '{title} — undated · {n} present',
  derivedNote:
    'There is no box here for a participant count and none for volunteer hours, and that is deliberate. Link the story to an activity and both figures come from its attendance register: who actually came, and how many minutes were recorded for them. A number typed by hand beside a real register is a second truth about the same afternoon — it agrees on the day it is written, then parts company in silence when the register is corrected or a name is added to it, and the one published on the open web is the one that is wrong.',
  descriptionArLabel: 'What happened — in Arabic',
  descriptionEnLabel: 'What happened — in English (optional)',
  descriptionHint: 'A paragraph or two: what we did, and how the day went.',
  impactArLabel: 'The impact — in Arabic',
  impactEnLabel: 'The impact — in English (optional)',
  impactHint:
    'What was different after this day. One specific sentence is worth more than a general claim about impact.',
  peopleNote:
    'Do not name volunteers or beneficiaries in the text. The continuity page is the only place that publishes names, and it does so having asked the people concerned; a name that slips into a story has been through no such question.',
  sortLabel: 'Order on the page',
  sortHint: 'A lower number comes first. Ties are settled by date, most recent first.',
  save: 'Record it',
  saveEdit: 'Save the change',

  publishCta: 'Publish on the public page',
  unpublishCta: 'Take off the public page',
  publishNote:
    'Taking a story off the page is neither archiving nor deleting: it stays here with its photographs and its linked activity, and disappears from the page the public reads. A photograph whose subject has asked for it to come down is removed from the list of photographs below, not by withdrawing the whole story.',

  archiveCta: 'Archive',
  archiveHeading: 'Why is this story being removed?',
  archiveNote:
    'Archiving is for a line that should never have been recorded: a duplicate, a draft entered twice, a story about the wrong activity. A story about something that really happened and has had its time on the page is taken off instead. Nothing is deleted either way; the database refuses to delete a story outright.',
  reasonLabel: 'Reason for archiving',
  reasonPlaceholder: 'A few words is enough',
  archiveSubmit: 'Archive it',
  archivedShow: 'Show archived ({n})',
  archivedNote: 'Removed from the list and kept on the record. Nothing here is deleted.',
  archivedOn: 'Archived on {date}',
  archivedReason: 'Reason',

  photosCta: 'Photographs',
  photosHeading: 'Photographs for this story',
  photosEmpty: 'No photograph yet. The story appears on the public page without one.',
  photoConsentNote:
    'A photograph goes onto the open web, and the people in it cannot take it down themselves. Prefer pictures in which no particular face can be recognised: a room at work seen from the doorway says more about the association than a row of faces, and it puts nobody’s past on a public page. A picture in which people are recognisable is published only if they are adults and have agreed. And any picture in which a child’s face can be recognised is kept here and never published — not with anybody’s permission.',
  fileLabel: 'Image file',
  fileHint:
    'JPEG, PNG or WebP, and at most 800KB. Export it around 1200 pixels wide before uploading: there is nothing here that will shrink it for you, and a heavy picture is paid for by whoever opens the page on a mobile connection.',
  altArLabel: 'Description of the picture, in Arabic — optional',
  altEnLabel: 'Description of the picture, in English — optional',
  altHint: 'One line describing the picture for somebody who cannot see it. Describe the scene, not the people.',
  facesLabel: 'Who appears in this photograph?',
  faces: {
    none: {
      label: 'No particular face is recognisable',
      hint: 'A distance shot, a room seen from the doorway, hands at work, backs. This is the first option whenever it is true.',
    },
    adults: {
      label: 'Everyone recognisable is an adult who agreed to it being published',
      hint: 'Choose this only if you actually asked them, one by one. “They would not mind” is not consent.',
    },
    restricted: {
      label: 'Anything else — a recognisable child, or somebody nobody asked',
      hint: 'The picture is kept here and appears on no public page, not even at its direct link. Choose it whenever you hesitate.',
    },
  },
  photoOrderLabel: 'Order of the picture',
  photoOrderHint: 'The first picture in the order is the one shown on the card in the stories list.',
  uploadSubmit: 'Upload the picture',
  uploadedOn: 'Uploaded on {date}',
  photoSize: '{n} KB',
  restrictedBadge: 'Withheld — never published',
  coverBadge: 'Card picture',
  facesChangeCta: 'Correct the answer',
  facesChangeNote:
    'If somebody asks for their picture to come down, removing it below is the answer, not changing this. This is for when the first answer was simply wrong.',
  facesSubmit: 'Save',
  removeCta: 'Remove the picture',
  removeNote:
    'Removing really deletes the picture, and only the picture; the story and its other photographs stay. It is the one thing in this system whose data is deleted, because “take my picture down” has to be acted on at once rather than passed to whoever holds a deeper permission.',

  errors: {
    'no-title': 'The Arabic title is required.',
    'no-slug': 'The identifier in the URL is required.',
    'bad-slug':
      'The identifier takes lowercase Latin letters, digits and hyphens only, and must start with a letter or a digit.',
    'slug-taken': 'That identifier is already used by another story.',
    'bad-date': 'That is not a valid date.',
    'no-project': 'That project could not be found, or it has been archived.',
    'no-activity': 'That activity could not be found.',
    'no-archive-reason': 'Say why it is being archived.',
    'no-image': 'No image file arrived.',
    'bad-image': 'That file is not an image of an accepted kind. JPEG, PNG or WebP.',
    'image-too-large': 'The picture is larger than 800KB. Export it smaller and upload it again.',
    'no-faces': 'Say who appears in the photograph before uploading it.',
    'not-found': 'That line could not be found.',
    unavailable: 'The database is not available right now.',
    db: 'That could not be saved just now. Try again.',
  },
};

export const storyDictionaries: Record<Locale, StoryStrings> = {
  ar: storiesAr,
  en: storiesEn,
};

export function stories(lang: Locale): StoryStrings {
  return storyDictionaries[lang];
}

/** The keys `errors` above answers to, so a page can read one off a URL safely. */
export function isStoryError(value: string): value is keyof StoryStrings['errors'] {
  return Object.prototype.hasOwnProperty.call(storiesAr.errors, value);
}
