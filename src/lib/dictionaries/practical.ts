/**
 * Every string practical tasks introduce, in one file.
 *
 * The dictionary proper is three large files edited in lockstep — types.ts
 * declares the shape, ar.ts and en.ts fill it — and adding a namespace by
 * hand-editing all three at once is how two people working in parallel
 * collide. So this namespace owns its strings here and the pages import it
 * directly, exactly as challenges.ts, awards.ts and lms.ts already do.
 * Splicing it into the main dictionary later is three one-line edits:
 *
 *   types.ts   practical: PracticalStrings;   (inside Account, plus the import)
 *   ar.ts      practical: practicalAr,
 *   en.ts      practical: practicalEn,
 *
 * Placeholders are filled with String.replace — {n}, {name} — which is the
 * convention the rest of the dictionary uses. There is no ICU here.
 *
 * ── COUNTED NOUNS ──────────────────────────────────────────────────────────
 *
 * Two counts reach a screen: how many pieces of work are waiting in a
 * trainer's queue, and how many times a learner has already submitted. Arabic
 * inflects the counted noun in bands and English in two, so «2 محاولات» and
 * «3 محاولة» are both wrong. Both counted strings are `CountForms` and the
 * caller passes them to countPhrase() from lib/when.ts — the helper this
 * codebase already uses for hours, activities, badges and certificates. Its
 * bands are zero / one / two / few (3–10) / many (11+), and only the last two
 * carry {n}, because «محاولتان» does not want a numeral in front of it.
 *
 * ── TONE ───────────────────────────────────────────────────────────────────
 *
 * Nothing here grades. There is no string for a mark, no string comparing one
 * learner with another, and no string that calls returned work a failure —
 * «يحتاج إلى تعديل» is what happened, and «رسبت» is not. The feedback heading
 * is «ملاحظات على العمل»: notes on the work, which is what the trainer was
 * asked to write and what the schema comment on practical_submissions.feedback
 * says the column holds.
 */

/** 'ar' | 'en', spelled out rather than imported, so this file stays a leaf. */
type PracticalLocale = 'ar' | 'en';

/** The shape countPhrase() in lib/when.ts expects. Only few/many carry {n}. */
export type CountForms = {
  zero: string;
  one: string;
  two: string;
  few: string;
  many: string;
};

export type PracticalStrings = {
  // ---- the learner's screen
  screenTitle: string;
  screenLede: string;
  briefHeading: string;
  looksLikeHeading: string;
  writeLabel: string;
  writeHint: string;
  submit: string;
  submitting: string;
  resubmit: string;

  // ---- where they stand
  stateNotStarted: string;
  stateAwaiting: string;
  stateChanges: string;
  stateApproved: string;
  awaitingBody: string;
  changesBody: string;
  approvedBody: string;

  // ---- the record
  historyHeading: string;
  attemptLabel: string;
  submittedOn: string;
  reviewedOn: string;
  feedbackHeading: string;
  noFeedback: string;
  keptForever: string;

  // ---- refusals, keyed by the reason the server returns
  errors: {
    empty: string;
    'too-short': string;
    'too-long': string;
    'already-open': string;
    'no-task': string;
    db: string;
    'not-permitted': string;
    self: string;
    'already-decided': string;
    'no-feedback': string;
    'not-found': string;
  };

  // ---- the finish screen, when the paper is passed and the work is not
  holdingCertificate: string;
  goToPractical: string;

  // ---- the trainer's queue
  queueTitle: string;
  queueLede: string;
  queueEmpty: string;
  queueWaiting: CountForms;
  previousAttempts: CountForms;
  workHeading: string;
  approve: string;
  requestChanges: string;
  feedbackLabel: string;
  feedbackRequired: string;
  ownWorkHidden: string;
  forbidden: string;
  goQueue: string;

  /*
   * The notification, in both languages, written into the row when a trainer
   * decides. Which one a reader sees is settled at render time — somebody can
   * change their language after the message was sent.
   *
   * The bodies carry no feedback text. That lives on the submission beside the
   * work it is about, and a paragraph about somebody's writing lifted out of
   * its context is both harder to read and a second copy of a trainer's words
   * to keep correct.
   */
  notifyApprovedTitle: string;
  notifyApprovedBody: string;
  notifyReturnedTitle: string;
  notifyReturnedBody: string;
};

export const practicalAr: PracticalStrings = {
  screenTitle: 'المهمّة العمليّة',
  screenLede:
    'هذه الدورة تطلب منك أن تكتب شيئاً، لا أن تختار إجابة. يقرأه مدرّب ويردّ عليك بما ينقصه أو يعتمده.',
  briefHeading: 'المطلوب',
  looksLikeHeading: 'ما الذي سيبحث عنه المدرّب',
  writeLabel: 'اكتب عملك هنا',
  writeHint: 'نصّ فقط. لا حاجة إلى ملفّ ولا إلى تنسيق.',
  submit: 'أرسِل للمراجعة',
  submitting: 'يُرسَل…',
  resubmit: 'أرسِل نسخة جديدة',

  stateNotStarted: 'لم تُرسِل شيئاً بعد',
  stateAwaiting: 'بانتظار المراجعة',
  stateChanges: 'يحتاج إلى تعديل',
  stateApproved: 'مُعتمَد',
  awaitingBody: 'وصل عملك وهو في انتظار مدرّب يقرأه. لا شيء عليك الآن.',
  changesBody: 'قرأ المدرّب ما كتبته وأعاده إليك مع ملاحظات. اقرأها ثمّ أرسِل نسخة جديدة.',
  approvedBody: 'اعتُمد عملك. لم يبقَ من هذه الدورة شيء من هذا الجانب.',

  historyHeading: 'ما أرسلتَه سابقاً',
  attemptLabel: 'المحاولة {n}',
  submittedOn: 'أُرسلت في',
  reviewedOn: 'روجعت في',
  feedbackHeading: 'ملاحظات على العمل',
  noFeedback: 'اعتُمد من دون ملاحظات إضافية.',
  keptForever:
    'كلّ نسخة أرسلتها وكلّ ملاحظة تلقّيتها تبقى هنا. لا يُحذف منها شيء، حتّى تعود إليها متى شئت.',

  errors: {
    empty: 'اكتب شيئاً قبل الإرسال.',
    'too-short': 'ما كتبته أقصر من أن يكون المطلوب. راجع «ما الذي سيبحث عنه المدرّب» أعلاه.',
    'too-long': 'النصّ أطول من الحدّ المسموح. اختصره في نقاطه الأساسيّة.',
    'already-open': 'لديك نسخة قيد المراجعة. انتظر ردّ المدرّب قبل إرسال نسخة أخرى.',
    'no-task': 'هذه الدورة لا تطلب مهمّة عمليّة.',
    db: 'تعذّر الحفظ الآن. حاول مرّة أخرى.',
    'not-permitted': 'لا تملك صلاحيّة مراجعة الأعمال.',
    self: 'لا أحد يراجع عمله بنفسه.',
    'already-decided': 'راجَع هذا العملَ شخصٌ آخر قبل قليل.',
    'no-feedback': 'إعادة العمل تحتاج إلى سطر يقول ما الذي يجب تغييره.',
    'not-found': 'لم يُعثر على هذا الإرسال.',
  },

  holdingCertificate:
    'اجتزتَ الأسئلة. تصدر الشهادة بعد أن يعتمد مدرّب مهمّتك العمليّة.',
  goToPractical: 'اذهب إلى المهمّة العمليّة',

  queueTitle: 'مراجعة المهامّ العمليّة',
  queueLede:
    'أعمال كتبها متطوّعون في دورات تطلب ذلك. اقرأ العمل، ثمّ اعتمده أو أعِده مع ما يجب تغييره. ملاحظتك موجَّهة إلى العمل لا إلى صاحبه.',
  queueEmpty: 'لا شيء ينتظر المراجعة.',
  queueWaiting: {
    zero: 'لا أعمال تنتظر',
    one: 'عمل واحد ينتظر',
    two: 'عملان ينتظران',
    few: '{n} أعمال تنتظر',
    many: '{n} عملاً ينتظر',
  },
  previousAttempts: {
    zero: 'أوّل نسخة',
    one: 'نسخة سابقة واحدة',
    two: 'نسختان سابقتان',
    few: '{n} نسخ سابقة',
    many: '{n} نسخة سابقة',
  },
  workHeading: 'العمل المُرسَل',
  approve: 'اعتماد',
  requestChanges: 'إعادة مع ملاحظات',
  feedbackLabel: 'ملاحظاتك على العمل',
  feedbackRequired: 'مطلوبة عند الإعادة، واختياريّة عند الاعتماد.',
  ownWorkHidden: 'أعمالك أنت لا تظهر هنا؛ يراجعها غيرك.',
  forbidden: 'هذه الصفحة ليست ضمن صلاحيّاتك.',
  goQueue: 'المهامّ العمليّة',

  notifyApprovedTitle: 'اعتُمدت مهمّتك العمليّة',
  notifyApprovedBody:
    'قرأ مدرّب ما كتبته واعتمده. شهادة الدورة صارت في طريقها إليك.',
  /* «يحتاج إلى إضافة» لا «مرفوض». العمل رجع ليكتمل، والصياغة تقول ذلك: من قرأه
     يريده أن ينجح، ولم يحكم عليه. */
  notifyReturnedTitle: 'عادت إليك مهمّتك العمليّة',
  notifyReturnedBody:
    'قرأ مدرّب ما كتبته وكتب لك ما يحتاج إلى إضافة. افتح الدورة لتقرأ ملاحظته وترسل نسخة جديدة.',
};

export const practicalEn: PracticalStrings = {
  screenTitle: 'Practical task',
  screenLede:
    'This course asks you to write something rather than pick an answer. A trainer reads it and either accepts it or tells you what is missing.',
  briefHeading: 'What to produce',
  looksLikeHeading: 'What the trainer will look for',
  writeLabel: 'Write your work here',
  writeHint: 'Text only. No file and no formatting needed.',
  submit: 'Send for review',
  submitting: 'Sending…',
  resubmit: 'Send a new version',

  stateNotStarted: 'Nothing sent yet',
  stateAwaiting: 'Waiting for review',
  stateChanges: 'Needs changes',
  stateApproved: 'Accepted',
  awaitingBody: 'Your work has arrived and is waiting for a trainer to read it. Nothing to do now.',
  changesBody:
    'A trainer read what you wrote and sent it back with notes. Read them, then send a new version.',
  approvedBody: 'Your work was accepted. There is nothing left of this course on that side.',

  historyHeading: 'What you sent before',
  attemptLabel: 'Attempt {n}',
  submittedOn: 'Sent on',
  reviewedOn: 'Reviewed on',
  feedbackHeading: 'Notes on the work',
  noFeedback: 'Accepted with no further notes.',
  keptForever:
    'Every version you sent and every note you were given stays here. Nothing is deleted, so you can always read back what you were told.',

  errors: {
    empty: 'Write something before sending.',
    'too-short':
      'What you wrote is shorter than the task asks for. Look again at what the trainer will be reading for.',
    'too-long': 'That is longer than the limit. Cut it back to the parts that matter.',
    'already-open':
      'You already have a version under review. Wait for the trainer before sending another.',
    'no-task': 'This course sets no practical task.',
    db: 'That could not be saved just now. Try again.',
    'not-permitted': 'You do not hold the capability to review work.',
    self: 'Nobody reviews their own work.',
    'already-decided': 'Somebody else reviewed this a moment ago.',
    'no-feedback': 'Sending work back needs a line saying what to change.',
    'not-found': 'That submission could not be found.',
  },

  holdingCertificate:
    'You passed the questions. The certificate is issued once a trainer accepts your practical task.',
  goToPractical: 'Go to the practical task',

  queueTitle: 'Practical task review',
  queueLede:
    'Work written by volunteers on the courses that ask for it. Read it, then accept it or send it back with what to change. Your note is addressed to the work, not to the person who wrote it.',
  queueEmpty: 'Nothing is waiting for review.',
  queueWaiting: {
    zero: 'Nothing waiting',
    one: 'One piece waiting',
    two: '2 pieces waiting',
    few: '{n} pieces waiting',
    many: '{n} pieces waiting',
  },
  previousAttempts: {
    zero: 'First version',
    one: 'One earlier version',
    two: '2 earlier versions',
    few: '{n} earlier versions',
    many: '{n} earlier versions',
  },
  workHeading: 'The work submitted',
  approve: 'Accept',
  requestChanges: 'Send back with notes',
  feedbackLabel: 'Your notes on the work',
  feedbackRequired: 'Required when sending back, optional when accepting.',
  ownWorkHidden: 'Your own work is not listed here; somebody else reviews it.',
  forbidden: 'This page is not within your capabilities.',
  goQueue: 'Practical tasks',

  notifyApprovedTitle: 'Your practical work was accepted',
  notifyApprovedBody:
    'A trainer has read what you wrote and accepted it. Your course certificate is on its way.',
  /* "Come back to you", not "rejected". The work returned to be finished, and
     the wording says so: the person who read it wants it to succeed. */
  notifyReturnedTitle: 'Your practical work has come back to you',
  notifyReturnedBody:
    'A trainer has read what you wrote and noted what still needs adding. Open the course to read their note and send a new version.',
};

export const practicalDictionaries: Record<PracticalLocale, PracticalStrings> = {
  ar: practicalAr,
  en: practicalEn,
};

export function practical(lang: PracticalLocale): PracticalStrings {
  return practicalDictionaries[lang];
}
