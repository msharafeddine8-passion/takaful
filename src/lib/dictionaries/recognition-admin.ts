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
  previewHint: string;
  previewSummary: string;
  previewNothing: string;
  previewEarn: string;
  previewWithdraw: string;
  previewMore: string;
  emailLabel: string;
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
  standingTitle: string;
  standingLede: string;
  logTitle: string;
  logLede: string;
  logEmpty: string;
  someone: string;
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
  previewHint:
    'يقرأ ما يقرأه الاحتساب ويطبّق المقارنة نفسها، ولا يكتب شيئاً: لا سجلّ ولا إشعار '
    + 'ولا أثر في التدقيق. اعرضه قبل أن تشغّل الاحتساب على الجميع.',
  previewSummary: '{accounts} حساباً · سيُمنح {earn} · سيُسحب {withdraw}',
  previewNothing: 'كل شيء مطابق أصلاً. تشغيل الاحتساب لن يغيّر شيئاً.',
  previewEarn: 'سيُمنح',
  previewWithdraw: 'سيُسحب',
  previewMore: 'و{n} غيرها لم تُعرض هنا.',

  emailLabel: 'بريد الحساب',
  codeLabel: 'رمز الشارة',
  reasonLabel: 'السبب',

  grantTitle: 'امنح شارة بقرار',
  grantLede:
    'لما لا تستطيع القواعد رؤيته. تُسجَّل باسمك ومع سببك، وتظهر على أنها ممنوحة بقرار '
    + 'لا محتسَبة. لا تقبل رمز شارة يملكها الحساب التلقائي — تلك تُمنح بإعادة الاحتساب.',
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
  actions: {
    'achievement.granted': 'منح بقرار',
    'achievement.revoked': 'سحب',
    'achievements.recomputed': 'إعادة احتساب',
    'achievements.recomputed_all': 'إعادة احتساب للجميع',
  },

  errors: {
    needEmail: 'أدخل بريد الحساب.',
    needBoth: 'أدخل البريد ورمز الشارة معاً.',
    needReason: 'اكتب سبباً يمكن مراجعته لاحقاً، لا كلمة واحدة.',
    noAccount: 'لا يوجد حساب بهذا البريد.',
    notYourself: 'لا يمكنك منح نفسك أو سحب شارة من نفسك.',
    alreadyHeld: 'هذه الشارة محفوظة له أصلاً.',
    notHeld: 'لا يحمل هذه الشارة.',
    ruleOwnsIt:
      'هذه الشارة يحتسبها النظام تلقائياً. امنحها بإعادة الاحتساب لا يدوياً، '
      + 'وإلا سحبها أوّل احتساب تالٍ من دون أن ينتبه أحد.',
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
  previewHint:
    'Reads what the recompute reads and applies the same comparison, and writes nothing: '
    + 'no row, no notification, no audit line. Run it before recomputing everybody.',
  previewSummary: '{accounts} accounts · {earn} to grant · {withdraw} to withdraw',
  previewNothing: 'Everything already matches. Recomputing would change nothing.',
  previewEarn: 'Would be granted',
  previewWithdraw: 'Would be withdrawn',
  previewMore: 'and {n} more not listed here.',

  emailLabel: 'Account email',
  codeLabel: 'Badge code',
  reasonLabel: 'Reason',

  grantTitle: 'Grant a badge by decision',
  grantLede:
    'For what the rules cannot see. Recorded against your name and your reason, and shown '
    + 'as granted rather than earned. It refuses a code the automatic pass owns — those are '
    + 'granted by recomputing.',
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
  actions: {
    'achievement.granted': 'Granted by decision',
    'achievement.revoked': 'Withdrawn',
    'achievements.recomputed': 'Recomputed',
    'achievements.recomputed_all': 'Recomputed for everybody',
  },

  errors: {
    needEmail: 'Enter the account email.',
    needBoth: 'Enter both the email and the badge code.',
    needReason: 'Write a reason somebody could review later, not one word.',
    noAccount: 'No account with that email.',
    notYourself: 'You cannot grant to, or withdraw from, yourself.',
    alreadyHeld: 'They already hold that badge.',
    notHeld: 'They do not hold that badge.',
    ruleOwnsIt:
      'That badge is worked out automatically. Grant it by recomputing rather than by hand, '
      + 'or the next recompute takes it back and nobody notices.',
    unavailable: 'Could not complete. Try again.',
  },
};

export const recognitionAdmin = (lang: Locale): RecognitionAdminStrings =>
  lang === 'ar' ? recognitionAdminAr : recognitionAdminEn;
