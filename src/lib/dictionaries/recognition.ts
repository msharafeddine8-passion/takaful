/**
 * Every user-facing string the visibility settings introduce, in one file.
 *
 * The dictionary is three large files edited in lockstep — types.ts declares
 * the shape, ar.ts and en.ts fill it — so a namespace added by hand-editing
 * all three is how two people working in parallel collide. This owns its
 * strings here, exactly as dictionaries/lms.ts does, and the integrator
 * splices it in with three one-line edits:
 *
 *   types.ts   recognition: RecognitionStrings;   (inside Account, plus the import)
 *   ar.ts      recognition: recognitionAr,
 *   en.ts      recognition: recognitionEn,
 *
 * Until then the profile page reaches for `getRecognition(lang)` directly,
 * which is why that helper exists and why it can be deleted the moment the
 * splice happens.
 *
 * Two of these strings are load-bearing rather than decorative, and both are
 * about what is NOT said:
 *
 *   `safeguardingNote` is shown to everybody, in the same words, always. It is
 *   how the page can be honest that choosing to appear does not guarantee
 *   appearing, without any individual page saying anything about the person
 *   reading it. A message that appeared only for some accounts would announce
 *   which accounts belong to children, which is the disclosure the entire
 *   feature is built to prevent — see src/lib/visibility.ts.
 *
 *   `ownStandingNote` exists because the most private option reads like
 *   giving something up, and it is not: the person's own hours, points and
 *   position stay visible to them whatever they choose here. People opt into
 *   publicity they did not want rather than lose sight of their own record.
 *
 * No string here mentions age, birth dates, guardians or safeguarding status
 * in the second person. Nothing on this page may be worded so that a
 * screenshot of it tells the reader how old its owner is.
 */

import type { Locale } from '@/lib/i18n';

export type RecognitionStrings = {
  title: string;
  lede: string;
  /** The legend of the radio group. Read out before the three options. */
  choiceLegend: string;
  hidden: string;
  hiddenHint: string;
  displayName: string;
  displayNameHint: string;
  nameAndPhoto: string;
  nameAndPhotoHint: string;
  /** Shown when nobody has ever answered — the default is standing in. */
  neverChosen: string;
  birthdayTitle: string;
  birthday: string;
  birthdayHint: string;
  /** Identical for every account, always rendered. See the note above. */
  safeguardingNote: string;
  ownStandingNote: string;
  save: string;
  saved: string;
};

export const recognitionAr: RecognitionStrings = {
  title: 'ظهورك في الصفحات العامة',
  lede: 'أنت من يقرّر ما إذا كان اسمك يظهر في صفحات التقدير ولوائح المتطوّعين، وبأيّ قدر. لا يُنشر شيء ما لم تختره بنفسك، ويمكنك تغيير اختيارك متى شئت.',
  choiceLegend: 'ما الذي يمكن للصفحات العامة أن تُظهره عنك؟',
  hidden: 'لا تُظهرني في اللوائح العامة',
  hiddenHint: 'لا يظهر اسمك ولا صورتك في أيّ صفحة عامة.',
  displayName: 'أظهر اسم الظهور فقط',
  displayNameHint: 'يظهر اسم الظهور المكتوب في ملفّك، من دون صورة. وإن تركته فارغًا فلن تظهر.',
  nameAndPhoto: 'أظهر اسمي وصورتي',
  nameAndPhotoHint: 'يظهر اسمك الكامل مع صورة ملفّك في صفحات التقدير.',
  neverChosen: 'لم تختر بعد، ونحن نعتبرك حتى الآن ممّن لا يرغبون بالظهور.',
  birthdayTitle: 'تهنئة عيد الميلاد',
  birthday: 'أرحّب بتلقّي تهنئة في عيد ميلادي',
  birthdayHint: 'مُطفأة ما لم تُشغّلها، ويمكنك إطفاؤها في أيّ وقت.',
  safeguardingNote: 'تُطبّق الجمعية قواعد حماية الأطفال على كلّ صفحة عامة، ولذلك قد لا يظهر بعض الحسابات فيها حتى لو اختار أصحابها الظهور.',
  ownStandingNote: 'مهما كان اختيارك هنا، تبقى ساعاتك ونقاطك وموقعك بين المتطوّعين ظاهرة لك في حسابك.',
  save: 'حفظ الاختيار',
  saved: 'حُفظ اختيارك.',
};

export const recognitionEn: RecognitionStrings = {
  title: 'How you appear on public pages',
  lede: 'You decide whether your name appears on recognition pages and volunteer listings, and how much of it. Nothing is published unless you choose it, and you can change your mind at any time.',
  choiceLegend: 'What may public pages show about you?',
  hidden: 'Do not show me in public listings',
  hiddenHint: 'Neither your name nor your photograph appears on any public page.',
  displayName: 'Show my display name only',
  displayNameHint: 'The display name from your profile, with no photograph. If you leave it blank, you will not appear.',
  nameAndPhoto: 'Show my name and photograph',
  nameAndPhotoHint: 'Your full name and your profile photograph appear on recognition pages.',
  neverChosen: 'You have not chosen yet, so for now we treat you as someone who would rather not appear.',
  birthdayTitle: 'Birthday greetings',
  birthday: 'I would like a greeting on my birthday',
  birthdayHint: 'Off unless you turn it on, and you can turn it off again whenever you like.',
  safeguardingNote: 'The association applies its child protection rules to every public page, so some accounts do not appear there even when their owners have asked to.',
  ownStandingNote: 'Whatever you choose here, your own hours, points and standing among the volunteers stay visible to you in your account.',
  save: 'Save choice',
  saved: 'Your choice has been saved.',
};

const byLocale: Record<Locale, RecognitionStrings> = { ar: recognitionAr, en: recognitionEn };

/** Temporary, until the three-line splice above lands. */
export function getRecognition(locale: Locale): RecognitionStrings {
  return byLocale[locale];
}
