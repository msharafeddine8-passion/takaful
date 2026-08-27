import type { Locale } from '@/lib/i18n';

/**
 * Strings for the recognition control panel.
 *
 * Its own module rather than three splices into types.ts / ar.ts / en.ts,
 * following dictionaries/lms.ts. Several parts of the recognition system were
 * built in parallel and every one of them would otherwise have been editing
 * the same three files at the same time.
 *
 * To fold it into the main dictionary later: add `recognitionAdmin:
 * RecognitionAdminStrings` to the Dictionary type, then `...` these two
 * objects into ar.ts and en.ts. Nothing else has to move.
 */

export type RecognitionAdminStrings = {
  title: string;
  lede: string;
  recomputeTitle: string;
  recomputeLede: string;
  recomputeOne: string;
  recomputeAll: string;
  recomputeAllHint: string;
  preview: string;
  pointsTitle: string;
  pointsLede: string;
  pointsPreview: string;
  pointsApply: string;
  pointsSummary: string;
  pointsNothing: string;
  pointsMore: string;
  previewHint: string;
  previewSummary: string;
  previewNothing: string;
  previewEarn: string;
  previewWithdraw: string;
  previewMore: string;
  emailLabel: string;
  searchLabel: string;
  search: string;
  holdsCount: string;
  holdsNothing: string;
  holdsEverything: string;
  chooseBadges: string;
  codeLabel: string;
  reasonLabel: string;
  grantTitle: string;
  grantLede: string;
  grant: string;
  withdrawTitle: string;
  withdrawLede: string;
  withdraw: string;
  working: string;
  done: string;
  catalogueTitle: string;
  catalogueLede: string;
  colCode: string;
  colKind: string;
  colThreshold: string;
  colHolders: string;
  colStatus: string;
  retireTitle: string;
  retireLede: string;
  retire: string;
  lift: string;
  retiredBadge: string;
  inCirculation: string;
  standingTitle: string;
  standingLede: string;
  logTitle: string;
  logLede: string;
  logEmpty: string;
  someone: string;
  bySystem: string;
  actions: Record<string, string>;
  errors: Record<string, string>;
};

export const recognitionAdminAr: RecognitionAdminStrings = {
  title: 'إدارة التقدير',
  lede:
    'الشارات تُحتسب تلقائياً من بيانات موثّقة. هذه الصفحة لما لا يراه الحساب التلقائي: '
    + 'إعادة احتساب بعد إدخال يدوي، ومنح أو سحب شارة بقرار من شخص.',

  recomputeTitle: 'إعادة الاحتساب',
  recomputeLede:
    'تقرأ ما فعله الشخص فعلاً وتوائم شاراته: تمنح ما استحقّه وتسحب ما لم يعد ينطبق. '
    + 'آمنة ويمكن تكرارها — النتيجة نفسها مهما أُعيد تشغيلها. شغّلها بعد إدخال ساعات '
    + 'قديمة أو اعتماد دورة سابقة.',
  recomputeOne: 'أعد احتساب شخص',
  recomputeAll: 'أعد الاحتساب للجميع',
  recomputeAllHint: 'يمرّ على كل الحسابات واحداً واحداً. قد يستغرق دقيقة.',
  preview: 'اعرض ما سيتغيّر أولاً',

  pointsTitle: 'إعادة احتساب النقاط',
  pointsLede:
    'النقاط تُمنح لحظة وقوع ما استحقّها، وهذا يعني أن ما لم تشهده المنصّة لا يترك أثراً: '
    + 'ساعات أُدخلت من دفتر ورقي، أو سجلّ حضور مُلئ بعد أسابيع. هذا يسدّ تلك الفجوة وحدها. '
    + 'لا يسحب نقطة أبداً — السحب تصحيح يوقّعه شخص، لا كنسة تُنقص رصيداً بلا تفسير.',
  pointsPreview: 'اعرض ما سيُضاف',
  pointsApply: 'نفّذ الاحتساب',
  /* Label first, number after — the convention dictionaries/impact-admin.ts
     and dictionaries/leaderboard.ts both keep. «{n} شخصاً» is the singular
     accusative and belongs to eleven and above; a preview that finds three
     people printed «3 شخصاً», which is the same error as "3 person". */
  pointsSummary: 'الأشخاص: {people} · الأسطر: {rows} · النقاط: {points}',
  pointsNothing: 'السجلّ مطابق أصلاً. لا شيء ليُضاف.',
  pointsMore: 'وثمّة أسطر أخرى لم تُعرض هنا، عددها {n}.',
  previewHint:
    'يقرأ ما يقرأه الاحتساب ويطبّق المقارنة نفسها، ولا يكتب شيئاً: لا سجلّ ولا إشعار '
    + 'ولا أثر في التدقيق. اعرضه قبل أن تشغّل الاحتساب على الجميع.',
  previewSummary: 'الحسابات: {accounts} · سيُمنح {earn} · سيُسحب {withdraw}',
  previewNothing: 'كل شيء مطابق أصلاً. تشغيل الاحتساب لن يغيّر شيئاً.',
  previewEarn: 'سيُمنح',
  previewWithdraw: 'سيُسحب',
  previewMore: 'و{n} غيرها لم تُعرض هنا.',

  emailLabel: 'بريد الحساب',
  searchLabel: 'ابحث بالاسم أو البريد',
  search: 'ابحث',
  holdsCount: 'يحمل {n}',
  holdsNothing: 'لا يحمل أي شارة يمكن سحبها.',
  holdsEverything: 'يحمل كل الشارات المعرَّفة.',
  chooseBadges: 'اختر شارة أو أكثر',
  codeLabel: 'رمز الشارة',
  reasonLabel: 'السبب',

  grantTitle: 'امنح شارة بقرار',
  grantLede:
    'ابحث عن الشخص، ثم اختر ما يستحقّه — واحدة أو أكثر بالمرّة نفسها. تُسجَّل باسمك ومع '
    + 'سببك وتظهر على أنها ممنوحة بقرار لا محتسَبة، وإعادة الاحتساب لا تلمسها بعدها: '
    + 'الشارة الممنوحة بقرار ليست ادّعاءً عن السجلّات، فلا رأي للسجلّات فيها.',
  grant: 'امنحها',

  withdrawTitle: 'اسحب شارة',
  withdrawLede:
    'تبقى في السجلّ مع سبب السحب ولا تُحذف. صفحة الإنجازات تعرض المسحوبة صراحةً: '
    + 'شارة اختفت بلا أثر هي ما يجعل المتطوّع يشكّ في باقي الأرقام.',
  withdraw: 'اسحبها',

  working: 'جارٍ التنفيذ…',
  done: 'تمّ',

  catalogueTitle: 'الشارات المعرَّفة',
  catalogueLede: 'ما يعرفه الحساب التلقائي، وكم شخصاً يحملها الآن.',
  colCode: 'الرمز',
  colKind: 'يُقاس بـ',
  colThreshold: 'العتبة',
  colHolders: 'يحملها',
  colStatus: 'الحالة',

  retireTitle: 'سحب شارة من التداول',
  retireLede:
    'تتوقّف الشارة عن المنح لأي أحد جديد، ويبقى كل من يحملها حاملاً لها — هو فعل ما فعله، '
    + 'وتراجُع الجمعية عن الشارة ليس ذنبه. لهذا لا تُعدَّل العتبات من هنا: العتبة هي تعريف '
    + 'ما تكرّمه الجمعية، وخفضها من خانة يمنح الشارة بأثر رجعي لكل من تجاوز الخط الجديد، '
    + 'ورفعها يسحبها ممّن نالها بجدارة تحت الخط القديم.',
  retire: 'اسحبها من التداول',
  lift: 'أعِدها إلى التداول',
  retiredBadge: 'مسحوبة من التداول',
  inCirculation: 'تُمنح',

  standingTitle: 'الصفات التي تُحتسب',
  standingLede:
    'الشارات والنقاط تُحتسب لمن يحمل إحدى هذه الصفات. من كان خارجها — منتسب موقوف أو '
    + 'طلب مرفوض — لا يخسر ما ناله، بل يتوقّف الاحتساب فقط. تغييرها تغيير في الكود يُراجَع، '
    + 'لا خانة في صفحة.',

  logTitle: 'سجلّ التعديلات',
  logLede:
    'كل منح أو سحب أو إعادة احتساب، بمن قام به ولماذا. هو نفسه سجلّ التدقيق العام، '
    + 'مقصوراً على هذا الموضوع ومعروضاً حيث الأزرار — فالسجلّ الذي يُقرأ فعلاً هو الذي '
    + 'يظهر في مكان الفعل.',
  logEmpty: 'لم يجرِ أي تعديل بعد.',
  someone: 'غير معروف',
  bySystem: 'النظام',
  actions: {
    'achievement.granted': 'منح بقرار',
    'achievement.revoked': 'سحب',
    'achievements.recomputed': 'إعادة احتساب',
    'achievements.recomputed_all': 'إعادة احتساب للجميع',
  },

  errors: {
    needEmail: 'أدخل بريد الحساب.',
    needTerm: 'اكتب حرفين على الأقل للبحث.',
    noMatches: 'لا أحد بهذا الاسم أو البريد.',
    tooMany: 'النتائج أكثر من أن تُعرض. ابحث بشيء أضيق.',
    needPerson: 'اختر الشخص أولاً.',
    needBadge: 'اختر شارة واحدة على الأقل.',
    needBoth: 'أدخل البريد ورمز الشارة معاً.',
    needReason: 'اكتب سبباً يمكن مراجعته لاحقاً، لا كلمة واحدة.',
    noAccount: 'لا يوجد حساب بهذا البريد.',
    notYourself: 'لا يمكنك منح نفسك أو سحب شارة من نفسك.',
    alreadyHeld: 'هذه الشارة محفوظة له أصلاً.',
    notHeld: 'لا يحمل هذه الشارة.',
    ruleOwnsIt:
      'هذه الشارة يحتسبها النظام تلقائياً. امنحها بإعادة الاحتساب لا يدوياً، '
      + 'وإلا سحبها أوّل احتساب تالٍ من دون أن ينتبه أحد.',
    needCode: 'أدخل رمز الشارة.',
    noSuchBadge: 'لا توجد شارة بهذا الرمز في القائمة المعرَّفة.',
    alreadyRetired: 'هذه الشارة مسحوبة من التداول أصلاً.',
    notRetired: 'هذه الشارة ليست مسحوبة من التداول.',
    unavailable: 'تعذّر التنفيذ. حاول مرة أخرى.',
  },
};

export const recognitionAdminEn: RecognitionAdminStrings = {
  title: 'Recognition admin',
  lede:
    'Badges are worked out automatically from verified data. This page is for what the '
    + 'automatic pass cannot see: recomputing after something was entered by hand, and '
    + 'granting or withdrawing a badge by decision.',

  recomputeTitle: 'Recompute',
  recomputeLede:
    'Reads what somebody has actually done and brings their badges into line, granting '
    + 'what is owed and withdrawing what no longer applies. Safe and repeatable — the '
    + 'answer does not change however often it runs. Use it after entering historical '
    + 'hours or recognising a prior course.',
  recomputeOne: 'Recompute one person',
  recomputeAll: 'Recompute everybody',
  recomputeAllHint: 'Walks every account in turn. May take a minute.',
  preview: 'Show what would change',

  pointsTitle: 'Recompute points',
  pointsLede:
    'Points are granted at the moment the thing that earned them happens, which means '
    + 'anything the platform did not witness leaves no trace — hours entered from a paper '
    + 'ledger, a register filled in weeks late. This closes that gap and nothing else. It '
    + 'never takes a point away: that is a correction somebody signs, not a sweep that '
    + 'quietly lowers a total with nothing to explain it.',
  pointsPreview: 'Show what would be added',
  pointsApply: 'Run the recompute',
  pointsSummary: '{people} people · {rows} rows · {points} points',
  pointsNothing: 'The ledger already matches. There is nothing to add.',
  pointsMore: 'and {n} more rows not listed here.',
  previewHint:
    'Reads what the recompute reads and applies the same comparison, and writes nothing: '
    + 'no row, no notification, no audit line. Run it before recomputing everybody.',
  previewSummary: '{accounts} accounts · {earn} to grant · {withdraw} to withdraw',
  previewNothing: 'Everything already matches. Recomputing would change nothing.',
  previewEarn: 'Would be granted',
  previewWithdraw: 'Would be withdrawn',
  previewMore: 'and {n} more not listed here.',

  emailLabel: 'Account email',
  searchLabel: 'Search by name or email',
  search: 'Search',
  holdsCount: 'Holds {n}',
  holdsNothing: 'Holds no badge that could be withdrawn.',
  holdsEverything: 'Holds every defined badge.',
  chooseBadges: 'Choose one or more badges',
  codeLabel: 'Badge code',
  reasonLabel: 'Reason',

  grantTitle: 'Grant a badge by decision',
  grantLede:
    'Search for the person, then pick what they are owed — one badge or several at once. '
    + 'Recorded against your name and your reason and shown as granted rather than earned, '
    + 'and the recompute leaves it alone afterwards: a badge given by decision is not a '
    + 'claim about the ledgers, so the ledgers get no vote.',
  grant: 'Grant it',

  withdrawTitle: 'Withdraw a badge',
  withdrawLede:
    'Kept on the record with the reason rather than deleted. The achievements page shows '
    + 'withdrawn badges plainly: one that vanished without trace is what makes a volunteer '
    + 'doubt the rest of the numbers.',
  withdraw: 'Withdraw it',

  working: 'Working…',
  done: 'Done',

  catalogueTitle: 'Defined badges',
  catalogueLede: 'What the automatic pass knows about, and how many people hold each now.',
  colCode: 'Code',
  colKind: 'Measured on',
  colThreshold: 'Threshold',
  colHolders: 'Held by',
  colStatus: 'Status',

  retireTitle: 'Take a badge out of circulation',
  retireLede:
    'The badge stops being granted to anybody new, and everybody who holds it goes on '
    + 'holding it — they did the thing, and the association\x27s second thoughts about the '
    + 'badge are not their fault. This is also why thresholds are not editable here: a '
    + 'threshold is the definition of what the association honours, and lowering one from a '
    + 'form grants the badge retroactively to everybody past the new line while raising one '
    + 'withdraws it from people who earned it under the old.',
  retire: 'Take it out of circulation',
  lift: 'Put it back',
  retiredBadge: 'Out of circulation',
  inCirculation: 'Granted',

  standingTitle: 'Standings that count',
  standingLede:
    'Badges and points are worked out for anybody holding one of these standings. '
    + 'Somebody outside them — a suspended member, a rejected application — does not lose '
    + 'what they earned; the counting simply stops. Changing this list is a code change that '
    + 'gets reviewed, not a box on a page.',

  logTitle: 'Edit log',
  logLede:
    'Every grant, withdrawal and recompute, with who did it and why. The same rows as the '
    + 'general audit log, narrowed to this subject and shown where the buttons are — the log '
    + 'people actually read is the one on the page where they did the thing.',
  logEmpty: 'Nothing has been changed yet.',
  someone: 'Unknown',
  bySystem: 'The system',
  actions: {
    'achievement.granted': 'Granted by decision',
    'achievement.revoked': 'Withdrawn',
    'achievements.recomputed': 'Recomputed',
    'achievements.recomputed_all': 'Recomputed for everybody',
  },

  errors: {
    needEmail: 'Enter the account email.',
    needTerm: 'Type at least two characters to search.',
    noMatches: 'Nobody by that name or email.',
    tooMany: 'Too many matches to show. Search for something narrower.',
    needPerson: 'Choose the person first.',
    needBadge: 'Choose at least one badge.',
    needBoth: 'Enter both the email and the badge code.',
    needReason: 'Write a reason somebody could review later, not one word.',
    noAccount: 'No account with that email.',
    notYourself: 'You cannot grant to, or withdraw from, yourself.',
    alreadyHeld: 'They already hold that badge.',
    notHeld: 'They do not hold that badge.',
    ruleOwnsIt:
      'That badge is worked out automatically. Grant it by recomputing rather than by hand, '
      + 'or the next recompute takes it back and nobody notices.',
    needCode: 'Enter the badge code.',
    noSuchBadge: 'No badge with that code is defined.',
    alreadyRetired: 'That badge is already out of circulation.',
    notRetired: 'That badge is not out of circulation.',
    unavailable: 'Could not complete. Try again.',
  },
};

export const recognitionAdmin = (lang: Locale): RecognitionAdminStrings =>
  lang === 'ar' ? recognitionAdminAr : recognitionAdminEn;
