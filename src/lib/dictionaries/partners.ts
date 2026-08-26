import type { Locale } from '@/lib/i18n';

/**
 * Every string the partners screens need — the public page and the staff one.
 *
 * Its own module rather than three splices into types.ts / ar.ts / en.ts,
 * following dictionaries/org-groups.ts and dictionaries/challenge-levels.ts for
 * the reason they give: those three files are edited in lockstep by other work,
 * and a screen's worth of new keys landing in the middle of them is a conflict
 * nobody learns anything from resolving. To fold it in later, add
 * `partners: PartnerStrings` to the Dictionary type and spread these two objects
 * into ar.ts and en.ts. Nothing else has to move.
 *
 * Placeholders are filled with String.replace — {n}, {date} — which is the
 * convention the rest of the dictionary uses. There is no ICU here.
 *
 * ── THERE IS NO LIST OF KINDS IN THIS FILE ────────────────────────────────
 *
 * Not as a select's options, not as an examples array, not as a placeholder
 * reading «شركة»، and not as prose in the invitation that quietly enumerates
 * the same eight words the brief happens to list. `kind` on a partner is free
 * text (migration 057), for the same reason a group's kind is (054) and a role
 * title is (046): an association meets a ninth kind of partner long before
 * anybody ships a migration, and a partner who does not fit the list is a
 * partner who does not get recorded.
 *
 * That rule reaches further here than it does on the committees screen, because
 * this feature has a page the public reads. `kindHint` says what the box is for
 * without teaching four permitted words; `becomeLede` invites an organisation to
 * work with the association without listing the sorts of organisation that may
 * apply — a paragraph naming companies, universities and municipalities would be
 * a closed list wearing prose's clothes, and the reader who is none of the three
 * would correctly conclude the invitation was not addressed to them. The only
 * kinds anybody is ever shown are the ones already recorded: as a typeahead on
 * the staff form, and as the headings on the public page, both read back out of
 * the table.
 *
 * ── AND THERE IS NO PSEUDO-KIND FOR THE PARTNERS WITHOUT ONE ──────────────
 *
 * No «أخرى» / "Other" string, deliberately. A partner whose kind nobody wrote
 * down is rendered under no heading at all, rather than under a heading that
 * invents a category the association never used. "Other" is a kind the moment it
 * is printed, and it is the one kind nobody chose.
 */

export type PartnerStrings = {
  // ---- the public page
  kicker: string;
  title: string;
  lede: string;
  /** «شريك منذ {date}». The date is already formatted to its own precision. */
  since: string;
  visitSite: string;
  /** Shown only when the table has nothing published in it. */
  nothingYet: string;

  // ---- «كن شريكًا», which is the whole page while there is nothing to list
  becomeKicker: string;
  becomeTitle: string;
  becomeLede: string;
  becomeDetail: string;
  becomeCta: string;

  // ---- the staff list
  staffTitle: string;
  staffLede: string;
  empty: string;
  addCta: string;
  addHeading: string;
  kindBadge: string;
  publishedBadge: string;
  unpublishedBadge: string;
  sinceBadge: string;
  recordedOn: string;
  openSite: string;

  // ---- the form behind «إضافة» and «تعديل»
  editCta: string;
  editHeading: string;
  nameArLabel: string;
  nameArHint: string;
  nameEnLabel: string;
  nameEnHint: string;
  slugLabel: string;
  slugHint: string;
  kindLabel: string;
  kindHint: string;
  suggestionsNote: string;
  summaryArLabel: string;
  summaryEnLabel: string;
  summaryHint: string;
  websiteLabel: string;
  websiteHint: string;
  sinceDateLabel: string;
  sinceDateHint: string;
  precisionLabel: string;
  precision: { day: string; month: string; year: string };
  sortLabel: string;
  sortHint: string;
  save: string;
  saveEdit: string;

  // ---- on the page, or not yet
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

  // ---- which project a partner backs
  linkCta: string;
  linkHeading: string;
  linkNote: string;
  projectLabel: string;
  projectNone: string;
  noteArLabel: string;
  noteEnLabel: string;
  noteHint: string;
  linkSubmit: string;
  linkedHeading: string;
  linkedEmpty: string;
  unlinkCta: string;
  unlinkNote: string;

  errors: {
    'no-name': string;
    'bad-slug': string;
    'slug-taken': string;
    'bad-url': string;
    'bad-date': string;
    'no-archive-reason': string;
    'not-found': string;
    'no-project': string;
    'already-linked': string;
    unavailable: string;
    db: string;
  };
};

export const partnersAr: PartnerStrings = {
  kicker: 'شراكات',
  title: 'شركاؤنا',
  lede:
    'الجهات التي تعمل معها الجمعية، وما أسهمت به فعلاً. لا تُذكر جهة هنا مجاملةً: يُسجَّل الشريك حين تقوم شراكة قائمة، ويُذكر معه المشروع الذي دعمه إن كان دعمه مشروعاً بعينه.',
  since: 'شريك منذ {date}',
  visitSite: 'الموقع الإلكتروني',
  nothingYet:
    'لم تُنشر بعد أيّ شراكة على هذه الصفحة. حين تُسجَّل الشراكة الأولى تظهر هنا باسمها وبما أسهمت به.',

  becomeKicker: 'دعوة',
  becomeTitle: 'كن شريكًا',
  becomeLede:
    'تعمل الجمعية مع كلّ جهة تجد في شبابنا ما يستحقّ الاستثمار: من يفتح باباً لتدريب، أو يموّل برنامجاً، أو يمنح خبرته وقتاً، أو يوفّر مكاناً يلتقي فيه الناس. لا شكل واحد للشراكة، ولا حجم أدنى لها.',
  becomeDetail:
    'إن كان لديكم ما تقدّمونه، أو أردتم أن تسمعوا أوّلاً كيف تعمل برامجنا وأين تقف اليوم، فتواصلوا معنا. نردّ على كلّ رسالة، ونبدأ بالحديث لا بالطلب.',
  becomeCta: 'تواصلوا معنا',

  staffTitle: 'الشركاء',
  staffLede:
    'من تعمل معه الجمعية، وما يدعمه من مشاريعها. ما يُنشر هنا يظهر على صفحة عامّة يقرأها الناس، فاسم الجهة ورابط موقعها يُكتبان كما تكتبهما هي عن نفسها.',
  empty: 'لم يُسجَّل بعد أيّ شريك.',
  addCta: '+ إضافة شريك',
  addHeading: 'شريك جديد',
  kindBadge: 'النوع',
  publishedBadge: 'منشور',
  unpublishedBadge: 'غير منشور',
  sinceBadge: 'منذ',
  recordedOn: 'سُجِّل في {date}',
  openSite: 'فتح الموقع',

  editCta: 'تعديل',
  editHeading: 'تعديل البيانات',
  nameArLabel: 'الاسم بالعربية',
  nameArHint: 'اسم الجهة كما تكتبه هي عن نفسها، لا كما نختصره في مراسلاتنا.',
  nameEnLabel: 'الاسم بالإنكليزية — اختياري',
  nameEnHint: 'يظهر في النسخة الإنكليزية من الصفحة. تركُه فارغاً أفضل من ترجمة غير دقيقة.',
  slugLabel: 'المُعرِّف في الرابط',
  slugHint:
    'حروف لاتينية صغيرة وأرقام وشُرَط فقط، مثل: al-safa-2020. يدخل في الرابط ويبقى ثابتاً بعد النشر، فاختره مرّة واحدة.',
  kindLabel: 'النوع — اختياري',
  kindHint:
    'الكلمة التي تصف هذه الجهة، إن كانت لها كلمة. لا قائمة محدَّدة هنا ولا حاجة إلى مبرمج: ما تكتبه هو ما يُحفَظ، وهو نفسه ما يصير عنواناً في الصفحة العامّة.',
  suggestionsNote:
    'الاقتراحات في هذا الحقل مأخوذة ممّا سبق تسجيله، وليست قائمةً مغلقة — اكتب ما شئت ولو لم يَرِد فيها.',
  summaryArLabel: 'التعريف بالعربية — اختياري',
  summaryEnLabel: 'التعريف بالإنكليزية — اختياري',
  summaryHint: 'سطران يقولان ما هذه الجهة وما طبيعة الشراكة معها.',
  websiteLabel: 'الموقع الإلكتروني — اختياري',
  websiteHint:
    'يبدأ بـ https:// أو http:// ولا يُقبل سواهما. الرابط يُفتح من صفحة عامّة، ولذلك تُرفَض هنا كلّ صيغة أخرى وترفضها قاعدة البيانات بعدنا.',
  sinceDateLabel: 'الشراكة قائمة منذ — اختياري',
  sinceDateHint: 'اتركه فارغاً إن لم يكن للشراكة تاريخ بداية مدوَّن.',
  precisionLabel: 'ما تعرفه من التاريخ',
  precision: { day: 'اليوم كاملاً', month: 'الشهر والسنة', year: 'السنة وحدها' },
  sortLabel: 'الترتيب في الصفحة',
  sortHint: 'رقم أصغر يعني موضعاً أسبق. المتساوون يُرتَّبون بأسمائهم.',
  save: 'سجّل',
  saveEdit: 'احفظ التعديل',

  publishCta: 'نشر على الصفحة العامّة',
  unpublishCta: 'سحب من الصفحة العامّة',
  publishNote:
    'السحب من الصفحة ليس أرشفةً ولا حذفاً: يبقى السطر هنا بتاريخه وبما ارتبط به من مشاريع، ويختفي من الصفحة التي يقرأها الناس. شراكةٌ انتهت مدّتها تُسحَب ولا تُؤرشَف، لأنّها حصلت فعلاً.',

  archiveCta: 'أرشفة',
  archiveHeading: 'لماذا يُزال هذا السطر؟',
  archiveNote:
    'الأرشفة للسطر الذي ما كان ينبغي أن يُسجَّل أصلاً: تكرارٌ، أو خطأٌ في الإدخال، أو جهةٌ سُجِّلت قبل أن تقوم شراكة معها. أمّا الشراكة التي انتهت فتُسحَب من الصفحة العامّة لا تُؤرشَف. لا يُحذف شيء في الحالتين؛ قاعدة البيانات ترفض الحذف رفضاً.',
  reasonLabel: 'سبب الأرشفة',
  reasonPlaceholder: 'كلمتان تكفيان',
  archiveSubmit: 'أرشف',
  archivedShow: 'إظهار المؤرشَف ({n})',
  archivedNote: 'أُزيلت من القائمة وبقيت في السجلّ. لا شيء ممّا هنا محذوف.',
  archivedOn: 'أُرشِف في {date}',
  archivedReason: 'السبب',

  linkCta: 'ربط بمشروع',
  linkHeading: 'ما الذي دعمه هذا الشريك؟',
  linkNote:
    'الربط يقول إنّ هذه الجهة دعمت هذا المشروع بعينه. الملاحظة تصف ما قدّمته فعلاً — «دعم دورة صيف ٢٠٢٤» أوضح من كلمة «شريك» — وهي ملك للعلاقة بين الاثنين لا لأحدهما.',
  projectLabel: 'المشروع',
  projectNone: 'اختر مشروعاً',
  noteArLabel: 'الملاحظة بالعربية — اختياري',
  noteEnLabel: 'الملاحظة بالإنكليزية — اختياري',
  noteHint: 'سطر واحد يصف ما قدّمته هذه الجهة لهذا المشروع.',
  linkSubmit: 'اربط',
  linkedHeading: 'المشاريع المرتبطة',
  linkedEmpty: 'لم يُربط هذا الشريك بمشروع بعد.',
  unlinkCta: 'فكّ الربط',
  unlinkNote:
    'فكّ الربط يمحو سطر الوصل وحده. الشريك يبقى والمشروع يبقى، وليس في هذا محوٌ لسجلّ أحد: ربطٌ خاطئ بين جهتين تصحيحه عاديّ.',

  errors: {
    'no-name': 'الاسم بالعربية مطلوب.',
    'bad-slug':
      'المُعرِّف يقبل الحروف اللاتينية الصغيرة والأرقام والشُرَط فقط، ويبدأ بحرف أو رقم.',
    'slug-taken': 'هذا المُعرِّف مستعمَل لشريك آخر.',
    'bad-url': 'الرابط يجب أن يبدأ بـ https:// أو http://. لا تُقبل صيغة أخرى.',
    'bad-date': 'التاريخ غير صالح.',
    'no-archive-reason': 'اذكر سبب الأرشفة.',
    'not-found': 'لم يُعثر على هذا السطر.',
    'no-project': 'لم يُحدَّد المشروع.',
    'already-linked': 'هذا الشريك مرتبط بهذا المشروع أصلاً.',
    unavailable: 'قاعدة البيانات غير متاحة الآن.',
    db: 'تعذّر الحفظ الآن. حاول مرّة أخرى.',
  },
};

export const partnersEn: PartnerStrings = {
  kicker: 'Partnerships',
  title: 'Our partners',
  lede:
    'The organisations the association works with, and what each has actually contributed. Nobody is listed here as a courtesy: a partner is recorded once a real partnership exists, and named alongside the project it backed where it backed a particular one.',
  since: 'Partner since {date}',
  visitSite: 'Website',
  nothingYet:
    'No partnership has been published on this page yet. The first one recorded will appear here, by name and with what it contributed.',

  becomeKicker: 'An invitation',
  becomeTitle: 'Become a partner',
  becomeLede:
    'The association works with anyone who sees something in our young people worth investing in: whoever opens a door to training, funds a programme, gives their expertise the time it takes, or offers a room where people can meet. Partnership has no single shape and no minimum size.',
  becomeDetail:
    'If you have something to offer, or would rather first hear how our programmes work and where they stand today, get in touch. Every message is answered, and we start with a conversation rather than a request.',
  becomeCta: 'Get in touch',

  staffTitle: 'Partners',
  staffLede:
    'Who the association works with, and which of its projects they back. What is published here appears on a public page that people read, so an organisation’s name and the link to its site are written the way it writes them itself.',
  empty: 'No partner has been recorded yet.',
  addCta: '+ Add a partner',
  addHeading: 'A new partner',
  kindBadge: 'Kind',
  publishedBadge: 'Published',
  unpublishedBadge: 'Not published',
  sinceBadge: 'Since',
  recordedOn: 'Recorded on {date}',
  openSite: 'Open the site',

  editCta: 'Edit',
  editHeading: 'Editing the details',
  nameArLabel: 'Name in Arabic',
  nameArHint: 'The organisation’s name as it writes it itself, not as we shorten it in our own letters.',
  nameEnLabel: 'Name in English — optional',
  nameEnHint: 'It appears on the English page. Leaving it empty beats an inaccurate translation.',
  slugLabel: 'Identifier in the URL',
  slugHint:
    'Lowercase Latin letters, digits and hyphens only — al-safa-2020, for instance. It goes into the address and stays fixed once published, so choose it once.',
  kindLabel: 'Kind — optional',
  kindHint:
    'The word that describes this organisation, if it has one. There is no fixed list here and no developer needed: what you type is what is saved, and it is the same word that becomes a heading on the public page.',
  suggestionsNote:
    'The suggestions in this field come from what has already been recorded. They are not a closed list — type anything you like, even if it is not among them.',
  summaryArLabel: 'Description in Arabic — optional',
  summaryEnLabel: 'Description in English — optional',
  summaryHint: 'A line or two on what this organisation is and what the partnership involves.',
  websiteLabel: 'Website — optional',
  websiteHint:
    'It must begin with https:// or http://; nothing else is accepted. The link is opened from a public page, which is why every other form is refused here and refused again by the database behind us.',
  sinceDateLabel: 'Partnership running since — optional',
  sinceDateHint: 'Leave it empty if no start date for the partnership was ever written down.',
  precisionLabel: 'How much of the date is known',
  precision: { day: 'The full date', month: 'Month and year', year: 'Year only' },
  sortLabel: 'Order on the page',
  sortHint: 'A lower number comes first. Ties are settled by name.',
  save: 'Record it',
  saveEdit: 'Save the change',

  publishCta: 'Publish on the public page',
  unpublishCta: 'Take off the public page',
  publishNote:
    'Taking something off the page is neither archiving nor deleting: the line stays here with its date and its linked projects, and disappears from the page the public reads. A partnership that has run its course is taken off rather than archived, because it really happened.',

  archiveCta: 'Archive',
  archiveHeading: 'Why is this line being removed?',
  archiveNote:
    'Archiving is for a line that should never have been recorded: a duplicate, a mistyped entry, or an organisation entered before any partnership with it existed. A partnership that has ended is taken off the public page instead. Nothing is deleted either way; the database refuses a delete outright.',
  reasonLabel: 'Reason for archiving',
  reasonPlaceholder: 'A few words is enough',
  archiveSubmit: 'Archive it',
  archivedShow: 'Show archived ({n})',
  archivedNote: 'Removed from the list and kept on the record. Nothing here is deleted.',
  archivedOn: 'Archived on {date}',
  archivedReason: 'Reason',

  linkCta: 'Link to a project',
  linkHeading: 'What did this partner back?',
  linkNote:
    'A link says this organisation backed this particular project. The note describes what it actually gave — “supported the 2024 summer round” says more than the word “partner” — and it belongs to the pairing rather than to either side of it.',
  projectLabel: 'Project',
  projectNone: 'Choose a project',
  noteArLabel: 'Note in Arabic — optional',
  noteEnLabel: 'Note in English — optional',
  noteHint: 'One line on what this organisation gave this project.',
  linkSubmit: 'Link them',
  linkedHeading: 'Linked projects',
  linkedEmpty: 'This partner is not linked to any project yet.',
  unlinkCta: 'Unlink',
  unlinkNote:
    'Unlinking removes the connecting line and nothing else. The partner stays, the project stays, and nobody’s record is erased: a wrong link between two organisations is an ordinary thing to correct.',

  errors: {
    'no-name': 'The Arabic name is required.',
    'bad-slug':
      'The identifier takes lowercase Latin letters, digits and hyphens only, and must start with a letter or a digit.',
    'slug-taken': 'That identifier is already used by another partner.',
    'bad-url': 'The link must begin with https:// or http://. No other form is accepted.',
    'bad-date': 'That is not a valid date.',
    'no-archive-reason': 'Say why it is being archived.',
    'not-found': 'That line could not be found.',
    'no-project': 'No project was chosen.',
    'already-linked': 'This partner is already linked to that project.',
    unavailable: 'The database is not available right now.',
    db: 'That could not be saved just now. Try again.',
  },
};

export const partnerDictionaries: Record<Locale, PartnerStrings> = {
  ar: partnersAr,
  en: partnersEn,
};

export function partners(lang: Locale): PartnerStrings {
  return partnerDictionaries[lang];
}

/** The keys `errors` above answers to, so a page can read one off a URL safely. */
export function isPartnerError(value: string): value is keyof PartnerStrings['errors'] {
  return Object.prototype.hasOwnProperty.call(partnersAr.errors, value);
}
