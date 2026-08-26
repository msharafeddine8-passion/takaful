import type { Locale } from '@/lib/i18n';
import type { FieldKind, Visibility } from '@/lib/profile-field-kinds';

/**
 * Every string the private notes and the custom profile fields need, in one
 * file.
 *
 * Its own module rather than three splices into types.ts / ar.ts / en.ts,
 * following dictionaries/challenge-levels.ts, member-profile.ts and
 * volunteer-roles.ts for the reason they give: those three files are edited in
 * lockstep by other work, and a feature's worth of new keys landing in the
 * middle of them is a conflict nobody learns anything from resolving. To fold it
 * in later, add `adminProfile: AdminProfileStrings` to the Dictionary type and
 * spread these two objects into ar.ts and en.ts. Nothing else has to move.
 *
 * Placeholders are filled with String.replace — {n}, {name}, {date}, {answers},
 * {label} — which is the convention the rest of the dictionary uses. There is no
 * ICU here.
 *
 * ── THE TWO SENTENCES THIS FILE EXISTS FOR ─────────────────────────────────
 *
 * Migration 048 makes two arguments the schema cannot enforce, and says in as
 * many words that the screen has to carry them. Both live here, and both are on
 * the note screen next to the box somebody is about to type into rather than in
 * a help page nobody opens.
 *
 *   `notes.privateHeading` / `notes.privateBody`. The subject can never read
 *   these and can never answer them. An administrator who does not realise that
 *   writes differently from one who does, so the screen says it plainly and
 *   then says what follows from it: your name stays on the note.
 *
 *   `notes.safeguardingHeading` / `notes.safeguardingBody`. A SAFEGUARDING
 *   CONCERN DOES NOT BELONG IN A NOTE. Not because notes are untidy, but
 *   because safeguarding_records has a named handler, a retention rule and a
 *   route to the focal point, and a free-text box has none of the three. A
 *   disclosure typed here would sit in a text box with nobody owning it. The
 *   wording names those three missing things rather than saying "use the proper
 *   channel", because the reason is what makes somebody stop.
 *
 * The safeguarding line names no URL. There is no in-app disclosure route to
 * link to — /account/safeguarding is the volunteer's OWN record — and a link
 * that went somewhere unhelpful would be worse than the sentence alone.
 *
 * ── AND THE THIRD, ON THE DEFINITIONS SCREEN ───────────────────────────────
 *
 * `defs.visibilityHint`, `defs.visibilityWarn` and `defs.visibilityWarnEmpty`.
 * `visibility` is a property of the DEFINITION, so it decides who sees every
 * answer anybody has already given. Moving a field from staff to public
 * publishes all of them at once, to people who were never asked. Naming the
 * three options is not enough — the warning counts the answers actually on the
 * field and says they move together, now.
 *
 * ── COUNTED NOUNS ──────────────────────────────────────────────────────────
 *
 * One count reaches a sentence rather than a pair of brackets: how many answers
 * a definition already holds. Arabic inflects a counted noun in bands and
 * English in two, so «3 إجابة» and «2 answers» are both wrong. `defs.answers` is
 * `CountForms` and the caller passes it to countPhrase() from lib/when.ts —
 * bands zero / one / two / few (3–10) / many (11+), and only the last two carry
 * {n}, because «إجابتان» does not want a numeral in front of it.
 *
 * The bracketed counts on the two archive disclosures stay plain «({n})»,
 * matching VolunteerRoles exactly. These panels sit on the same screen and a
 * disclosure that counted differently from the one above it would read as a
 * different product.
 */

/** The shape countPhrase() in lib/when.ts expects. Only few/many carry {n}. */
export type CountForms = {
  zero: string;
  one: string;
  two: string;
  few: string;
  many: string;
};

export type AdminProfileStrings = {
  /** «ملاحظات إدارية» on a member's page. */
  notes: {
    sectionTitle: string;
    lede: string;

    /* The two warnings. Rendered beside the box, never behind a link. */
    privateHeading: string;
    privateBody: string;
    safeguardingHeading: string;
    safeguardingBody: string;

    addCta: string;
    addHeading: string;
    bodyLabel: string;
    /** Carries {n}, the character cap. */
    bodyHint: string;
    bodyPlaceholder: string;
    addSubmit: string;

    empty: string;
    /** Shown to a viewer whose account cannot write here. */
    readOnly: string;

    /** Carries {name}. */
    authorLine: string;
    /** No profile row for the author. Never a user id on the screen. */
    unknownAuthor: string;
    /** Carries {date}. */
    writtenOn: string;
    editedBadge: string;
    /** Carries {date}. */
    editedOn: string;

    editCta: string;
    editHeading: string;
    editNote: string;
    editSubmit: string;

    archiveCta: string;
    archiveHeading: string;
    archiveNote: string;
    archiveSubmit: string;

    /** Carries {n}. */
    archivedShow: string;
    archivedNote: string;
    /** Carries {date}. */
    archivedOn: string;
  };

  /** The answers to the custom fields, on a member's page. */
  values: {
    sectionTitle: string;
    lede: string;
    empty: string;
    emptyManage: string;
    save: string;
    saved: string;
    readOnly: string;
    requiredMark: string;
    seenByLabel: string;
    seenBy: Record<Visibility, string>;
    /** The blank entry on a single-choice field. */
    noAnswer: string;
    clearHint: string;
    multiHint: string;
    /** Carries {date}. */
    answeredOn: string;
  };

  /** The definitions screen at /[lang]/staff/profile-fields. */
  defs: {
    title: string;
    lede: string;
    notSensitive: string;
    notRules: string;
    back: string;
    empty: string;

    addCta: string;
    addHeading: string;
    editCta: string;
    editHeading: string;

    /* The fixed-after-creation rule, said before it can be hit. */
    fixedRuleNew: string;
    fixedRuleEdit: string;
    fixedBadge: string;

    keyLabel: string;
    keyHint: string;
    kindLabel: string;
    kindHint: string;
    kinds: Record<FieldKind, string>;

    labelArLabel: string;
    labelArHint: string;
    labelEnLabel: string;
    labelEnHint: string;
    helpArLabel: string;
    helpEnLabel: string;
    helpHint: string;

    requiredLabel: string;
    requiredHint: string;

    visibilityLabel: string;
    visibility: Record<Visibility, string>;
    visibilityHint: string;
    /** Carries {answers}, already inflected by countPhrase. */
    visibilityWarn: string;
    visibilityWarnEmpty: string;

    optionsLabel: string;
    optionsHint: string;
    optionsValueWarn: string;
    optionValueLabel: string;
    optionArLabel: string;
    optionEnLabel: string;
    optionAdd: string;
    optionRemove: string;
    /** Carries {n}. */
    optionRow: string;
    optionsOnlyFor: string;

    sortLabel: string;
    sortHint: string;
    moveUp: string;
    moveDown: string;
    /** Carries {label}. */
    moveUpOf: string;
    /** Carries {label}. */
    moveDownOf: string;

    save: string;
    saveEdit: string;

    archiveCta: string;
    archiveHeading: string;
    archiveNote: string;
    archiveSubmit: string;
    /** Carries {n}. */
    archivedShow: string;
    archivedNote: string;
    /** Carries {date}. */
    archivedOn: string;

    /** Counted noun, for countPhrase(). */
    answers: CountForms;
    keyBadge: string;
    kindBadge: string;
    requiredBadge: string;
    optionalBadge: string;
  };
};

export const adminProfileAr: AdminProfileStrings = {
  notes: {
    sectionTitle: 'ملاحظات إدارية',
    lede:
      'ما يدوّنه الطاقم عن متابعة هذا المتطوّع: ما اتُّفق عليه في لقاء، أو ما ينبغي أن يعرفه من يعمل معه بعدك. كلّ ملاحظة باسم كاتبها وتاريخها، والتعديل يُبقي السطر نفسه ويُسجَّل.',

    privateHeading: 'لا يرى المتطوّع هذه الملاحظات',
    /* The rule, and then what follows from it. An administrator who knows the
       subject can never answer writes a different sentence. */
    privateBody:
      'لا تظهر في حسابه ولا في ملفّه ولا في أيّ صفحة يفتحها، ولا تُرسَل إليه. يقرؤها الطاقم الإداري وحده. اكتب على هذا الأساس: هذه ملاحظة لا يستطيع صاحبها الردّ عليها، واسمك يبقى عليها.',

    safeguardingHeading: 'شبهة أو إخبار عن الحماية؟ ليس هنا مكانه',
    safeguardingBody:
      'إن كان ما تنوي كتابته يمسّ سلامة طفل أو سلامة شخص — شكوى أو شبهة أو ما أُفصح لك به — فلا يُكتب في هذا المربّع. الملاحظة نصّ حرّ لا مسؤول يتولّاه ولا مدّة حفظ له ولا طريق منه إلى مسؤول الحماية؛ وسجلّ الحماية فيه هذه الثلاثة. أبلغ مسؤول الحماية عبر مسار الحماية المعتمد في الجمعية، واترك التفاصيل خارج هذا الحقل.',

    addCta: '+ إضافة ملاحظة',
    addHeading: 'ملاحظة جديدة',
    bodyLabel: 'نصّ الملاحظة',
    bodyHint: 'ما جرى وما اتُّفق عليه. حتّى {n} حرف.',
    bodyPlaceholder: 'ما ينبغي أن يعرفه من يتابع معه لاحقاً',
    addSubmit: 'سجّل الملاحظة',

    empty: 'لا ملاحظات مدوّنة عن هذا المتطوّع.',
    readOnly: 'تقرأ هذا القسم ولا تكتب فيه.',

    authorLine: 'كتبها {name}',
    unknownAuthor: 'كاتب غير مسجَّل',
    writtenOn: 'في {date}',
    editedBadge: 'عُدِّلت',
    editedOn: 'آخر تعديل في {date}',

    editCta: 'تعديل',
    editHeading: 'تعديل نصّ الملاحظة',
    editNote:
      'يبقى السطر نفسه ويصير النصّ الجديد هو ما تقوله الملاحظة الآن. يُسجَّل أنّها عُدِّلت ومن عدّلها، ولا يبقى النصّ القديم في مكان آخر.',
    editSubmit: 'احفظ التعديل',

    archiveCta: 'أرشفة',
    archiveHeading: 'أرشفة هذه الملاحظة',
    archiveNote:
      'الأرشفة تُخفيها عن هذه الصفحة ولا تحذفها: تبقى في السجلّ بكاتبها وتاريخها، وقاعدة البيانات ترفض حذفها أصلاً. لا تُعاد من هنا.',
    archiveSubmit: 'أرشف الملاحظة',

    archivedShow: 'إظهار المؤرشَف ({n})',
    archivedNote: 'أُخفيت عن الصفحة وبقيت في السجلّ. لا شيء ممّا هنا محذوف.',
    archivedOn: 'أُرشِفت في {date}',
  },

  values: {
    sectionTitle: 'حقول الملفّ',
    lede:
      'حقول تعرّفها الجمعية بنفسها وتظهر في ملفّ كلّ متطوّع. ما يُكتب هنا يُحفَظ في ملفّ هذا المتطوّع، ويراه من يسمح به إعداد كلّ حقل على حدة.',
    empty:
      'لم يُعرَّف بعد أيّ حقل. يُعرَّف الحقل مرّة واحدة فيظهر في ملفّ كلّ متطوّع، ولا يحتاج تعريفه إلى مبرمج.',
    emptyManage: 'تعريف حقول الملفّ',
    save: 'احفظ الحقول',
    saved: 'حُفظت الحقول.',
    readOnly: 'تقرأ هذه الحقول ولا تعدّلها.',
    requiredMark: 'مطلوب',
    seenByLabel: 'من يرى الجواب',
    seenBy: {
      public: 'الجميع، حتى من خارج المنصّة',
      volunteers: 'المتطوّعون داخل المنصّة',
      staff: 'الطاقم الإداري وحده',
    },
    noAnswer: 'بلا جواب',
    clearHint: 'أفرِغ الحقل ليُمحى الجواب من الملفّ.',
    multiHint: 'أشِّر ما ينطبق. إن لم تؤشّر شيئاً مُحي الجواب.',
    answeredOn: 'حُفظ في {date}',
  },

  defs: {
    title: 'حقول الملفّ',
    lede:
      'الحقول التي يحملها ملفّ المتطوّع إلى جانب الحقول الأساسية: القسم، الاختصاص، الجامعة، سنة التخرّج، وما تحتاجه الجمعية بعدها. تُعرَّف من هنا، ولا يحتاج الحقل التالي إلى مبرمج.',
    notSensitive:
      'ليس هذا مكاناً للبيانات الحسّاسة. تاريخ الميلاد والهاتف وبيانات وليّ الأمر وبيانات الحماية لها جداولها وقواعدها الخاصّة، وحقلٌ اسمه «ملاحظات صحّية» يمرّر معلومات طبّية من حول كلّ حماية بُنيت لها.',
    notRules:
      'ولا يُبنى على هذه الحقول قرار: لا المراحل ولا الشهادات ولا الساعات ولا مسار الحماية يقرأ منها شيئاً. هي للتسجيل والعرض وحدهما — قاعدة تعتمد على حقل يُؤرشَف عند منتصف الليل هي قاعدة تتوقّف عند منتصف الليل.',
    back: 'العودة إلى لوحة الطاقم',
    empty: 'لا حقول معرَّفة بعد.',

    addCta: '+ تعريف حقل جديد',
    addHeading: 'حقل جديد',
    editCta: 'تعديل',
    editHeading: 'تعديل تعريف الحقل',

    fixedRuleNew:
      'النوع والمفتاح يُثبَّتان لحظة الحفظ ولا يتغيّران بعدها. راجعهما قبل أن تحفظ. أمّا التسمية والشرح والترتيب ومن يرى الحقل فتبقى قابلة للتعديل في أيّ وقت.',
    fixedRuleEdit:
      'النوع والمفتاح مثبَّتان منذ إنشاء الحقل ولا يُعدَّلان: الإجابات المحفوظة تشير إلى هذا المفتاح، وتُقرأ على أنّها أجوبة عن سؤال من هذا النوع، ولا شيء يعيد فحصها بعد حفظها. إن كان أحدهما خطأ فأرشِف هذا الحقل وعرّف غيره؛ تبقى الأجوبة السابقة معلَّقة بتعريفها الأوّل، وهي القراءة الصحيحة الوحيدة لها.',
    fixedBadge: 'مثبَّت',

    keyLabel: 'المفتاح',
    keyHint:
      'حروف إنكليزية صغيرة وأرقام وشرطة سفلية، ويبدأ بحرف: university، graduation_year. لا يراه المتطوّع، والإجابات المحفوظة تشير إليه.',
    kindLabel: 'نوع الحقل',
    kindHint: 'يقرّر شكل المربّع وما يُقبَل فيه. الأنواع ثمانية وهي مغلقة.',
    kinds: {
      text: 'سطر نصّ',
      longtext: 'نصّ طويل',
      number: 'رقم',
      date: 'تاريخ',
      select: 'اختيار واحد من قائمة',
      multiselect: 'اختيار متعدّد من قائمة',
      checkbox: 'مربّع تأشير — نعم أو لا',
      url: 'رابط',
    },

    labelArLabel: 'التسمية بالعربية',
    labelArHint: 'ما يقرؤه من يملأ الحقل. تُصحَّح متى شئت، وتصحيحها لا يمسّ جواباً واحداً.',
    labelEnLabel: 'التسمية بالإنكليزية — اختيارية',
    labelEnHint: 'تُستعمَل حين تُفتَح الصفحة بالإنكليزية. تركُها فارغة أفضل من ترجمة غير دقيقة.',
    helpArLabel: 'شرح تحت الحقل بالعربية — اختياري',
    helpEnLabel: 'شرح تحت الحقل بالإنكليزية — اختياري',
    helpHint: 'سطر يوضّح المطلوب، إن لم تكفِ التسمية وحدها.',

    requiredLabel: 'الجواب مطلوب',
    requiredHint:
      'الحقل المطلوب لا يُحفَظ فارغاً. الأجوبة المسجَّلة قبل اليوم لا تُمَسّ، لكنّ أوّل حفظ لملفٍّ ينقصه هذا الحقل سيُرفَض كاملاً حتى يُملأ.',

    visibilityLabel: 'من يرى إجابات هذا الحقل',
    visibility: {
      public: 'الجميع، حتى من خارج المنصّة',
      volunteers: 'المتطوّعون داخل المنصّة',
      staff: 'الطاقم الإداري وحده',
    },
    /* Not "three options". What the choice DOES, to whom. */
    visibilityHint:
      'هذا الاختيار ليس عن الحقل بل عن كلّ جواب فيه: يسري على إجابات كلّ متطوّع ملأ هذا الحقل أو سيملؤه، دفعةً واحدة، ولا يُستثنى منه شخص ولا يُضبَط لملفّ واحد. الوضع الافتراضي «الطاقم الإداري وحده»، وتوسيعه قرار يُتَّخذ مرّة واحدة عن الجميع.',
    visibilityWarn:
      'في هذا الحقل {answers} الآن. تغيير من يراه يسري عليها كلّها في اللحظة نفسها، لا على ما يُكتب بعد اليوم وحده: نقلُه إلى «الجميع» ينشر {answers} على الويب المفتوح فوراً، من غير أن يُسأل أصحابها ومن غير أن يعلموا.',
    visibilityWarnEmpty:
      'لا جواب في هذا الحقل بعد، فالاختيار يسري على أوّل جواب يُسجَّل فيه وعلى كلّ ما بعده.',

    optionsLabel: 'الخيارات',
    optionsHint:
      'خيار في كلّ سطر. «القيمة» هي ما يُحفَظ في قاعدة البيانات ولا يراها أحد، والتسمية العربية هي ما يُقرأ على الشاشة. لا يُقبَل حقل اختيار بلا خيار واحد على الأقلّ، ولا يتكرّر خياران بالقيمة نفسها.',
    optionsValueWarn:
      'تغيير قيمة خيار بعد أن أجاب بها أحد يترك جوابه مشيراً إلى قيمة لم تعد موجودة. صحّح التسمية لا القيمة.',
    optionValueLabel: 'القيمة',
    optionArLabel: 'بالعربية',
    optionEnLabel: 'بالإنكليزية — اختيارية',
    optionAdd: '+ إضافة خيار',
    optionRemove: 'حذف هذا الخيار',
    optionRow: 'الخيار {n}',
    optionsOnlyFor: 'الخيارات لنوعَي الاختيار وحدهما.',

    sortLabel: 'الترتيب',
    sortHint: 'الأصغر أوّلاً. وعند التساوي تُرتَّب الحقول بالتسمية العربية.',
    moveUp: '↑ أعلى',
    moveDown: '↓ أسفل',
    moveUpOf: 'رفع «{label}» درجة',
    moveDownOf: 'خفض «{label}» درجة',

    save: 'عرِّف الحقل',
    saveEdit: 'احفظ التعديل',

    archiveCta: 'أرشفة',
    archiveHeading: 'أرشفة هذا الحقل',
    archiveNote:
      'الأرشفة تُخرج الحقل من كلّ نموذج ومن كلّ ملفّ، وتُبقي كلّ جواب سُجِّل فيه كما هو. الحقل لا يُحذف: حذفه كان سيأخذ معه أجوبة أصحابها. ولا يُعاد من هذه الصفحة.',
    archiveSubmit: 'أرشف الحقل',
    archivedShow: 'إظهار المؤرشَف ({n})',
    archivedNote:
      'خارج النماذج والملفّات، وأجوبتها محفوظة كما هي. تُعرَض هنا ليُعرَف إلى أيّ سؤال كان يعود جواب قديم.',
    archivedOn: 'أُرشِف في {date}',

    answers: {
      zero: 'لا أجوبة',
      one: 'جواب واحد',
      two: 'جوابان',
      few: '{n} أجوبة',
      many: '{n} جواباً',
    },
    keyBadge: 'المفتاح',
    kindBadge: 'النوع',
    requiredBadge: 'مطلوب',
    optionalBadge: 'اختياري',
  },
};

export const adminProfileEn: AdminProfileStrings = {
  notes: {
    sectionTitle: 'Administrative notes',
    lede:
      'What staff write down about following this volunteer up: what was agreed in a conversation, or what the next person working with them needs to know. Every note carries its author and its date, and editing keeps the line and is recorded.',

    privateHeading: 'The volunteer never sees these notes',
    privateBody:
      'They do not appear in their account, on their profile, or on any page they can open, and they are never sent to them. Staff are the only readers. Write with that in mind: this is a note its subject can never answer, and your name stays on it.',

    safeguardingHeading: 'A safeguarding concern or disclosure does not belong here',
    safeguardingBody:
      'If what you are about to write touches a child’s safety or a person’s safety — a complaint, a suspicion, or something disclosed to you — it does not go in this box. A note is free text with no named handler, no retention rule and no route from it to the safeguarding focal point; a safeguarding record has all three. Report it to the safeguarding focal point through the association’s safeguarding route, and leave the details out of this field.',

    addCta: '+ Add a note',
    addHeading: 'A new note',
    bodyLabel: 'The note',
    bodyHint: 'What happened and what was agreed. Up to {n} characters.',
    bodyPlaceholder: 'What the next person following up needs to know',
    addSubmit: 'Save the note',

    empty: 'No notes have been written about this volunteer.',
    readOnly: 'You are reading this section, not writing in it.',

    authorLine: 'Written by {name}',
    unknownAuthor: 'Author not on record',
    writtenOn: 'on {date}',
    editedBadge: 'Edited',
    editedOn: 'Last edited on {date}',

    editCta: 'Edit',
    editHeading: 'Editing the note',
    editNote:
      'The line stays and the new text becomes what the note says now. That it was edited, and by whom, is recorded — and the old wording is not kept anywhere else.',
    editSubmit: 'Save the change',

    archiveCta: 'Archive',
    archiveHeading: 'Archiving this note',
    archiveNote:
      'Archiving hides it from this page without deleting it: it stays on the record with its author and its date, and the database refuses to delete it at all. It is not put back from here.',
    archiveSubmit: 'Archive the note',

    archivedShow: 'Show archived ({n})',
    archivedNote: 'Hidden from the page and kept on the record. Nothing here is deleted.',
    archivedOn: 'Archived on {date}',
  },

  values: {
    sectionTitle: 'Profile fields',
    lede:
      'Fields the association defines for itself, carried by every volunteer’s profile. What is written here is saved to this volunteer’s record, and each field’s own setting decides who can see it.',
    empty:
      'No field has been defined yet. A field is defined once and then appears on every volunteer’s profile — no developer needed.',
    emptyManage: 'Define profile fields',
    save: 'Save the fields',
    saved: 'The fields have been saved.',
    readOnly: 'You are reading these fields, not editing them.',
    requiredMark: 'Required',
    seenByLabel: 'Who can see the answer',
    seenBy: {
      public: 'Everyone, including outside the platform',
      volunteers: 'Volunteers signed in to the platform',
      staff: 'Staff only',
    },
    noAnswer: 'No answer',
    clearHint: 'Empty the field to clear the answer from the record.',
    multiHint: 'Tick whatever applies. Ticking nothing clears the answer.',
    answeredOn: 'Saved on {date}',
  },

  defs: {
    title: 'Profile fields',
    lede:
      'The fields a volunteer’s profile carries alongside the built-in ones: department, specialty, university, graduation year, and whatever the association needs next. They are defined here, and the next one does not need a developer.',
    notSensitive:
      'This is not a home for sensitive personal data. Date of birth, phone, guardian details and safeguarding data have their own tables and their own rules, and a field called “Health notes” would route medical information around every protection built for it.',
    notRules:
      'Nor does anything decide anything on these fields: not the stages, not the certificates, not the hours, not the safeguarding path. They are for recording and displaying only — a rule that depends on a field somebody can retire at 11pm is a rule that stops working at 11pm.',
    back: 'Back to the staff dashboard',
    empty: 'No fields have been defined yet.',

    addCta: '+ Define a new field',
    addHeading: 'A new field',
    editCta: 'Edit',
    editHeading: 'Editing the definition',

    fixedRuleNew:
      'The kind and the key are fixed the moment this is saved and do not change afterwards. Check them before you save. The label, the help text, the order and who can see it stay editable at any time.',
    fixedRuleEdit:
      'The kind and the key have been fixed since the field was created and cannot be edited: stored answers reference this key, and they are read as answers to a question of this kind, with nothing ever re-examining them after they are saved. If either is wrong, archive this field and define another; the earlier answers stay attached to the definition they were given under, which is the only true reading of them.',
    fixedBadge: 'Fixed',

    keyLabel: 'Key',
    keyHint:
      'Lower-case letters, digits and underscores, starting with a letter: university, graduation_year. The volunteer never sees it, and stored answers reference it.',
    kindLabel: 'Kind of field',
    kindHint: 'It decides the shape of the input and what is accepted in it. There are eight kinds and the set is closed.',
    kinds: {
      text: 'A line of text',
      longtext: 'Long text',
      number: 'A number',
      date: 'A date',
      select: 'Choose one from a list',
      multiselect: 'Choose several from a list',
      checkbox: 'A tick-box — yes or no',
      url: 'A link',
    },

    labelArLabel: 'Label in Arabic',
    labelArHint: 'What the person filling the field reads. Correct it whenever you like; correcting it touches no answer.',
    labelEnLabel: 'Label in English — optional',
    labelEnHint: 'Used when the page is opened in English. Leaving it empty beats an inaccurate translation.',
    helpArLabel: 'Help text under the field, in Arabic — optional',
    helpEnLabel: 'Help text under the field, in English — optional',
    helpHint: 'A line explaining what is being asked for, if the label alone is not enough.',

    requiredLabel: 'An answer is required',
    requiredHint:
      'A required field is not saved empty. Answers recorded before today are untouched, but the first save of a record missing this field will be refused in full until it is filled in.',

    visibilityLabel: 'Who can see the answers to this field',
    visibility: {
      public: 'Everyone, including outside the platform',
      volunteers: 'Volunteers signed in to the platform',
      staff: 'Staff only',
    },
    visibilityHint:
      'This choice is not about the field but about every answer in it: it applies to the answers of every volunteer who has filled this field in or ever will, all at once, and nobody can be excepted and no single record can be set differently. The default is staff only, and widening it is one decision taken on everybody’s behalf.',
    visibilityWarn:
      'This field holds {answers} right now. Changing who can see it applies to all of them the same instant, not only to what is written after today: moving it to “everyone” publishes {answers} to the open web immediately, without their authors being asked and without their knowing.',
    visibilityWarnEmpty:
      'There are no answers in this field yet, so the choice applies to the first answer recorded in it and to every one after that.',

    optionsLabel: 'Options',
    optionsHint:
      'One option per line. The “value” is what is stored in the database and nobody sees it; the Arabic label is what is read on screen. A choice field with no options is refused, and no two options may share a value.',
    optionsValueWarn:
      'Changing an option’s value after somebody has answered with it leaves their answer pointing at a value that no longer exists. Correct the label, not the value.',
    optionValueLabel: 'Value',
    optionArLabel: 'In Arabic',
    optionEnLabel: 'In English — optional',
    optionAdd: '+ Add an option',
    optionRemove: 'Remove this option',
    optionRow: 'Option {n}',
    optionsOnlyFor: 'Options belong to the two choice kinds and to nothing else.',

    sortLabel: 'Order',
    sortHint: 'Smallest first. Fields with the same number are ordered by their Arabic label.',
    moveUp: '↑ Up',
    moveDown: '↓ Down',
    moveUpOf: 'Move “{label}” up one place',
    moveDownOf: 'Move “{label}” down one place',

    save: 'Define the field',
    saveEdit: 'Save the change',

    archiveCta: 'Archive',
    archiveHeading: 'Archiving this field',
    archiveNote:
      'Archiving takes the field off every form and every profile, and keeps every answer already given exactly as it is. The field is not deleted: deleting it would take those answers with it. It is not put back from this page.',
    archiveSubmit: 'Archive the field',
    archivedShow: 'Show archived ({n})',
    archivedNote:
      'Off the forms and off the profiles, with their answers kept. They are listed here so an old answer can still be traced to the question it was given to.',
    archivedOn: 'Archived on {date}',

    answers: {
      zero: 'no answers',
      one: 'one answer',
      two: 'two answers',
      few: '{n} answers',
      many: '{n} answers',
    },
    keyBadge: 'Key',
    kindBadge: 'Kind',
    requiredBadge: 'Required',
    optionalBadge: 'Optional',
  },
};

export const adminProfileDictionaries: Record<Locale, AdminProfileStrings> = {
  ar: adminProfileAr,
  en: adminProfileEn,
};

export function adminProfile(lang: Locale): AdminProfileStrings {
  return adminProfileDictionaries[lang];
}
