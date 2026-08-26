import type { Locale } from '@/lib/i18n';
import type { EvidenceMeasure } from '@/lib/impact-numbers';

/**
 * Every string the front-page-figures screen needs, in one file.
 *
 * Its own module rather than three splices into types.ts / ar.ts / en.ts,
 * following dictionaries/org-groups.ts and dictionaries/projects-admin.ts for
 * the reason they give: those three files are edited in lockstep by other work,
 * and a screen's worth of new keys landing in the middle of them is a conflict
 * nobody learns anything from resolving.
 *
 * `stats` in ar.ts and en.ts is NOT touched by this file and must not be
 * deleted. It is the front page's fallback for a database that cannot be
 * reached — see the head of app/[lang]/page.tsx.
 *
 * Placeholders are filled with String.replace — {n}, {date} — which is the
 * convention the rest of the dictionary uses. There is no ICU here.
 *
 * ── HOW THE ARABIC HANDLES A NUMBER IT CANNOT SEE ─────────────────────────
 *
 * Arabic counts nouns four different ways depending on the number in front of
 * them, and {n} is filled at render time with a figure this file has never
 * seen. «{n} متطوّعاً» is right at 33 and wrong at 1, 2 and 11. So every
 * sentence carrying a count below is built as «عدد … : {n}» — the number lands
 * after a colon, agreeing with nothing, and reads correctly whatever it turns
 * out to be. The same construction dictionaries/org-groups.ts reaches for when
 * it writes «إظهار المؤرشَف ({n})».
 *
 * ── AND WHY THE «لا تُسجَّل» SENTENCE IS TWO SENTENCES ────────────────────
 *
 * `notTracked` says the platform holds no record; `notTrackedNote` says that
 * this is not a verdict on the figure. The second is not padding. The whole
 * hazard this screen exists around is an administrator reading "no evidence" as
 * "disproved" and quietly cutting a true claim about their own association, and
 * a bare «لا تُسجَّل» invites exactly that reading. See the head of
 * evidenceFor() in lib/impact-numbers.ts.
 */

export type ImpactAdminStrings = {
  // ---- the list
  title: string;
  lede: string;
  empty: string;
  addCta: string;
  addHeading: string;
  publishedBadge: string;
  unpublishedBadge: string;
  keyBadge: string;
  orderBadge: string;
  sourceHeading: string;
  sourceEmpty: string;
  updatedOn: string;
  viewPublic: string;

  // ---- the form behind «إضافة» and «تعديل»
  editCta: string;
  editHeading: string;
  keyLabel: string;
  keyHint: string;
  keyFixedHint: string;
  labelArLabel: string;
  labelArHint: string;
  labelEnLabel: string;
  labelEnHint: string;
  valueLabel: string;
  valueHint: string;
  sourceNoteLabel: string;
  sourceNoteHint: string;
  orderLabel: string;
  orderHint: string;
  save: string;
  saveEdit: string;

  // ---- on the front page, or not
  publishCta: string;
  unpublishCta: string;
  publishNote: string;
  fallbackNote: string;

  // ---- what the platform can stand behind
  evidenceHeading: string;
  evidenceLede: string;
  /** One sentence per measure, each ending in «: {n}». */
  evidence: Record<EvidenceMeasure, string>;
  /** What the count does not say. Rendered under it, quieter. */
  evidenceNote: Record<EvidenceMeasure, string>;
  /** THE SENTENCE THIS FEATURE EXISTS FOR. Never a zero, in either language. */
  notTracked: string;
  notTrackedNote: string;
  /** A failed read is not an absence of evidence either. */
  unreadable: string;

  errors: {
    'bad-key': string;
    'key-taken': string;
    'no-label': string;
    'no-value': string;
    'not-found': string;
    unavailable: string;
    db: string;
  };
};

export const impactAdminAr: ImpactAdminStrings = {
  title: 'الأرقام على الصفحة الأولى',
  lede:
    'الأرقام الخمسة التي تظهر على الصفحة الأولى تحت عنوان «تكافل بالأرقام». كلّ واحد منها قولٌ تقوله الجمعية عن نفسها، يُكتَب بيدٍ ولا يُحسَب من قاعدة البيانات: «٤٬٠٠٠+» نصٌّ لا عدد. وإلى جانب كلّ رقم ما تستطيع هذه المنصّة إثباته اليوم — لا لتصحيحه، بل ليرى من يعدّله كم يبعد ما يُعلَن عمّا يقوم عليه هنا دليل.',
  empty: 'لم يُسجَّل بعد أيّ رقم.',
  addCta: '+ إضافة رقم',
  addHeading: 'رقم جديد',
  publishedBadge: 'معروض',
  unpublishedBadge: 'غير معروض',
  keyBadge: 'المفتاح',
  orderBadge: 'الترتيب',
  sourceHeading: 'من أين هذا الرقم',
  sourceEmpty: 'لم يُدوَّن مصدر لهذا الرقم بعد.',
  updatedOn: 'آخر تعديل في {date}',
  viewPublic: 'افتح الصفحة الأولى',

  editCta: 'تعديل',
  editHeading: 'تعديل الرقم',
  keyLabel: 'المفتاح',
  keyHint:
    'اسمٌ ثابت بالأحرف اللاتينية الصغيرة والأرقام والشرطة السفلية، مثل active_volunteers. لا يراه زائر، ولا يُعدَّل بعد الحفظ: هو ما يبقى ثابتاً حين تُصحَّح صياغة الرقم، وهو ما يُربَط به سطر الدليل أدناه.',
  keyFixedHint:
    'المفتاح لا يُعدَّل. تغييره يفصل الرقم عن سطر الدليل الخاصّ به، فيقرأ القارئ «لا تسجّل هذه المنصّة ما يقيس هذا الرقم» إلى جانب رقمٍ تسجّله المنصّة جيّداً. إن كُتب خطأً، فأضف السطر الصحيح وأخفِ الخطأ؛ يبقى الاثنان في السجلّ.',
  labelArLabel: 'التسمية بالعربية',
  labelArHint: 'ما يُكتَب تحت الرقم على الصفحة الأولى — «متطوّع نشط»، «عائلة تلقّت دعماً».',
  labelEnLabel: 'التسمية بالإنكليزية — اختياري',
  labelEnHint:
    'تظهر في النسخة الإنكليزية من الصفحة الأولى. تركُها فارغة يُظهر العربية مكانها، وهو أفضل من ترجمة غير دقيقة.',
  valueLabel: 'الرقم كما يُكتَب',
  valueHint:
    'نصٌّ لا عدد: «300+» و«4,000+» و«7» كلّها صحيحة، وما تكتبه هنا هو ما يُعرَض حرفاً بحرف. لا شيء يُحسَب ولا يُقرَّب ولا تُضاف إليه علامة لم تكتبها.',
  sourceNoteLabel: 'من أين هذا الرقم؟ — داخليّ',
  sourceNoteHint:
    'لا يظهر للزوّار. اكتب ما يُجيب بعد سنتين عن سؤال «من أين جاء ٤٬٠٠٠؟» بأحسن من هزّة كتف: تقريرٌ، أو محضرٌ، أو من أحصاه ومتى.',
  orderLabel: 'الترتيب',
  orderHint: 'الأصغر أوّلاً، من جهة البداية على الصفحة الأولى. المتساويان يُرتَّبان بالمفتاح.',
  save: 'سجّل',
  saveEdit: 'احفظ التعديل',

  publishCta: 'أظهِره على الصفحة الأولى',
  unpublishCta: 'أخفِه عن الصفحة الأولى',
  publishNote:
    'الإظهار والإخفاء لا يحذفان شيئاً: يبقى السطر وصياغته ومصدره واسم آخر من عدّله كما هي. ورقمٌ كفّت الجمعية عن إعلانه يبقى جزءاً من سجلّ ما أعلنَته يوماً.',
  fallbackNote:
    'إن لم يبقَ رقمٌ واحد معروضاً، تعود الصفحة الأولى إلى الأرقام المكتوبة في ملفّات الموقع ولا تظهر فارغة. إخفاء القسم كلّه ليس ممّا يُفعَل من هنا.',

  evidenceHeading: 'ما تستطيع المنصّة إثباته الآن',
  evidenceLede:
    'ما يلي هو ما في قاعدة البيانات، لا ما فعلته الجمعية. الجمعية أقدم من هذه المنصّة بسنوات، وجُلّ عملها سبق أوّل سطر أُدخِل فيها؛ فالعدد المحسوب حدٌّ أدنى مؤكَّد، لا تصحيحاً للرقم المُعلَن ولا سبباً لخفضه.',
  evidence: {
    'active-volunteer-accounts': 'عدد الحسابات التي تحمل صفة متطوّع في المنصّة اليوم: {n}',
    'recorded-activities': 'عدد الأنشطة المسجَّلة في المنصّة، عدا المؤرشَف منها: {n}',
    'course-passers': 'عدد من اجتاز دورةً واحدة على الأقلّ في الأكاديمية: {n}',
  },
  evidenceNote: {
    'active-volunteer-accounts':
      'كشف المتطوّعين المحفوظ في المنصّة أوسع من عدد الحسابات بكثير: كثيرون يتطوّعون منذ سنوات ولا حساب لهم هنا.',
    'recorded-activities':
      'تسجيل الأنشطة بدأ مع المنصّة نفسها؛ ما جرى قبلها ليس فيها، وهو أكثره.',
    'course-passers':
      'هذا عدٌّ لدورات الأكاديمية وحدها، ولا يعرف أعمار من اجتازوها: فهو يشهد على التدريب لا على أنّهم شباب، ولا يشمل برامج الجمعية التدريبية التي تجري خارج المنصّة.',
  },
  notTracked: 'لا تسجّل هذه المنصّة ما يقيس هذا الرقم.',
  notTrackedNote:
    'وهذا ليس حكماً على الرقم. ما لم يُدخَل في قاعدة البيانات لا يصير غير صحيح، ولا يُخفَّض رقمٌ لأنّ برنامجاً لا يرى من أين جاء.',
  unreadable:
    'تعذّرت قراءة هذا من قاعدة البيانات الآن. عطلٌ في القراءة، لا قولٌ في الرقم.',

  errors: {
    'bad-key':
      'المفتاح يبدأ بحرف لاتينيّ صغير، ويتكوّن من أحرف لاتينية صغيرة وأرقام وشرطة سفلية، بطول حرفين إلى تسعة وأربعين.',
    'key-taken': 'هذا المفتاح مستعمَل في رقم آخر.',
    'no-label': 'التسمية بالعربية مطلوبة.',
    'no-value': 'اكتب الرقم كما تريده أن يظهر.',
    'not-found': 'لم يُعثر على هذا السطر.',
    unavailable: 'قاعدة البيانات غير متاحة الآن.',
    db: 'تعذّر الحفظ الآن. حاول مرّة أخرى.',
  },
};

export const impactAdminEn: ImpactAdminStrings = {
  title: 'The figures on the front page',
  lede:
    'The five figures that appear on the front page under “Takaful in numbers”. Each one is something the association says about itself — written by hand, not computed from the database: “4,000+” is text, not a number. Beside each is what this platform can evidence today, put there not to correct it but so that whoever edits it can see how far the published claim stands from anything the system could stand behind.',
  empty: 'No figure has been recorded yet.',
  addCta: '+ Add a figure',
  addHeading: 'A new figure',
  publishedBadge: 'Showing',
  unpublishedBadge: 'Not showing',
  keyBadge: 'Key',
  orderBadge: 'Order',
  sourceHeading: 'Where this figure comes from',
  sourceEmpty: 'No source has been recorded for this figure yet.',
  updatedOn: 'Last edited on {date}',
  viewPublic: 'Open the front page',

  editCta: 'Edit',
  editHeading: 'Editing the figure',
  keyLabel: 'Key',
  keyHint:
    'A stable name in lowercase latin letters, digits and underscores — active_volunteers, for instance. No visitor sees it, and it cannot be changed after saving: it is what stays fixed when the wording is corrected, and it is what the evidence line below is matched on.',
  keyFixedHint:
    'The key cannot be changed. Changing it would detach the figure from its own evidence line, so the screen would read “this platform does not track that” beside a figure the platform tracks perfectly well. If one was typed wrongly, add the right row and hide the wrong one; both stay on the record.',
  labelArLabel: 'Label in Arabic',
  labelArHint:
    'What is printed under the number on the front page — “Active volunteers”, “Families supported”.',
  labelEnLabel: 'Label in English — optional',
  labelEnHint:
    'It appears on the English front page. Leaving it empty shows the Arabic in its place, which beats an inaccurate translation.',
  valueLabel: 'The figure, as written',
  valueHint:
    'Text, not a number: “300+”, “4,000+” and “7” are all valid, and what you type is what is displayed, character for character. Nothing is computed, rounded, or given a sign you did not type.',
  sourceNoteLabel: 'Where does this figure come from? — internal',
  sourceNoteHint:
    'Never shown to visitors. Write what will answer “where did 4,000 come from?” two years from now with something better than a shrug: a report, a set of minutes, or who counted it and when.',
  orderLabel: 'Order',
  orderHint:
    'Smallest first, from the start side of the front page. Two figures given the same order fall back to the key.',
  save: 'Record it',
  saveEdit: 'Save the change',

  publishCta: 'Show it on the front page',
  unpublishCta: 'Take it off the front page',
  publishNote:
    'Showing and hiding delete nothing: the row, its wording, its source and the name of whoever last edited it all stay exactly as they are. A figure the association has stopped claiming is still part of the record of what it once claimed.',
  fallbackNote:
    'If no figure is left showing, the front page falls back to the figures written into the site’s own files rather than appearing empty. Emptying this list is not the way to remove the section.',

  evidenceHeading: 'What this platform can evidence right now',
  evidenceLede:
    'What follows is what is in the database, not what the association has done. The association is years older than this platform and most of its work predates the first row in it, so a computed count is a confirmed floor — not a correction to the published figure, and not a reason to lower it.',
  evidence: {
    'active-volunteer-accounts': 'Accounts standing as volunteers on this platform today: {n}',
    'recorded-activities': 'Activities recorded on this platform, archived ones aside: {n}',
    'course-passers': 'People who have passed at least one Academy course here: {n}',
  },
  evidenceNote: {
    'active-volunteer-accounts':
      'The volunteer roster held on this platform is far larger than the number of accounts: many people have volunteered here for years without one.',
    'recorded-activities':
      'Activities have only been recorded since the platform itself opened; what happened before it — which is most of it — is not in here.',
    'course-passers':
      'This counts the Academy alone, and it knows nobody’s age: it evidences training, not youth, and it does not include the association’s own training programmes run away from this platform.',
  },
  notTracked: 'This platform does not track that.',
  notTrackedNote:
    'That is not a verdict on the figure. What was never typed into the database does not thereby become untrue, and no claim should be lowered because a piece of software cannot see where it came from.',
  unreadable:
    'That could not be read from the database just now. A failed read, not a statement about the figure.',

  errors: {
    'bad-key':
      'A key starts with a lowercase latin letter and is made of lowercase latin letters, digits and underscores, between two and forty-nine characters long.',
    'key-taken': 'That key already belongs to another figure.',
    'no-label': 'The Arabic label is required.',
    'no-value': 'Write the figure as you want it to appear.',
    'not-found': 'That line could not be found.',
    unavailable: 'The database is not available right now.',
    db: 'That could not be saved just now. Try again.',
  },
};

export const impactAdminDictionaries: Record<Locale, ImpactAdminStrings> = {
  ar: impactAdminAr,
  en: impactAdminEn,
};

export function impactAdmin(lang: Locale): ImpactAdminStrings {
  return impactAdminDictionaries[lang];
}

/** The keys `errors` above answers to, so a page can read one off a URL safely. */
export function isImpactError(value: string): value is keyof ImpactAdminStrings['errors'] {
  return Object.prototype.hasOwnProperty.call(impactAdminAr.errors, value);
}
