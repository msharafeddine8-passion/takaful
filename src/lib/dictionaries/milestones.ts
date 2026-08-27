/**
 * Every word the birthday greeting, the milestones and the notification
 * settings put in front of a person.
 *
 * Owned here rather than spliced into the dictionary proper, exactly as
 * lms.ts, challenges.ts and recognition.ts are, and for the same reason: the
 * dictionary is three large files edited in lockstep — types.ts declares the
 * shape, ar.ts and en.ts fill it — and a namespace added by hand-editing all
 * three is how two people working in parallel collide. The pages import
 * `milestoneDictionaries[lang]` directly. Splicing it in later is three
 * one-line edits.
 *
 * THE RULE THE BIRTHDAY HALF OF THIS FILE IS WRITTEN UNDER
 *
 * Not one string in `birthday` below contains a digit, a month, a weekday, an
 * age, or the word "born". Not «عيد ميلادك الثلاثون», not «تبلغ اليوم», not
 * "turns 30 today", and no «بعد ثلاثة أيام» anywhere, because there is no
 * upcoming birthday in this system to write words for.
 *
 * That is a stricter rule than it looks. A birth date is the field this
 * platform is most careful with — migration 033 says so — and the association
 * has minors on it. A greeting is read by everybody who opens the account
 * page, and «عيد ميلاد محمد الخامس عشر» on a page that anybody in the
 * association can screenshot is a child's age published, from a feature that
 * was meant to be kind. The absence is enforced twice: here by writing the
 * strings without numbers, and in scripts/probe-milestones by scanning every
 * one of them for a digit and for the words that would carry one.
 *
 * The wish itself is the association's own line and is not to be improved:
 * «كل عام وأنت جزء من أثر تكافل». It says the thing the association actually
 * wants to say — that this person is part of what it has done — rather than
 * the generic «كل عام وأنت بخير», which any shop sends.
 *
 * THE MILESTONE HALF
 *
 * Warm and brief, past tense, second person, and never comparative. Nothing
 * says "before most volunteers", "faster than", or "you are among the". A
 * milestone arriving on the same day for two people must read identically to
 * both. Numbers appear here — ten hours is ten hours — and that is fine: they
 * are figures about work, not about a person's age.
 */

import type { MilestoneCode } from '@/lib/milestones';
import type { NotificationTopic } from '@/lib/preferences';

/** 'ar' | 'en', spelled out so this file stays a leaf. */
type StringsLocale = 'ar' | 'en';

export type MilestoneCopy = {
  /** The notification title. Short: it is read in a list. */
  title: string;
  /** One sentence underneath. Says what they did, not what to do next. */
  body: string;
};

export type MilestoneStrings = {
  birthday: {
    /**
     * The banner other people see. `{name}` is filled with a name that
     * src/lib/visibility.ts has already agreed may be published, never with a
     * name read straight from a row.
     */
    headline: string;
    /** The association's wish, under the headline and in the notification. */
    wish: string;
    /** The notification the person whose day it is receives, in private. */
    greetingTitle: string;
    /** Between two names in the banner, and before the last of several. */
    listJoin: string;
    listFinalJoin: string;
  };
  milestones: Record<MilestoneCode, MilestoneCopy>;
  /**
   * One message for somebody who crossed several milestones at once.
   *
   * The loop that sends these fired once per code, which is right for the
   * ordinary case — you reach one thing, you are told about that thing. It is
   * wrong for the case it actually meets most often: a volunteer of several
   * years opens their account for the first time and the platform, catching up
   * on everything at once, sends them eleven separate messages in a minute
   * about work they did in 2022. That is not eleven congratulations, it is
   * being shouted at by a bookkeeping job.
   *
   * `{list}` is filled with the milestone titles, joined with `birthday.listJoin`
   * and `birthday.listFinalJoin` — the same joins the birthday banner uses,
   * because Arabic joins a list one way and there is no reason for this file to
   * hold two answers.
   */
  several: {
    title: string;
    /** Carries {list}. */
    body: string;
  };
  preferences: {
    title: string;
    lede: string;
    legend: string;
    topics: Record<NotificationTopic, { label: string; hint: string }>;
    /** Shown always: the messages nobody can switch off, and why. */
    alwaysNote: string;
    save: string;
    saved: string;
  };
};

/* ------------------------------------------------------------------ Arabic */

export const milestonesAr: MilestoneStrings = {
  birthday: {
    headline: 'اليوم عيد ميلاد {name} 🎂',
    wish: 'كل عام وأنت جزء من أثر تكافل',
    greetingTitle: 'اليوم عيد ميلادك 🎂',
    /* Arabic repeats the conjunction rather than using a comma series:
     * «محمد وأحمد وعلي», not «محمد، أحمد وعلي». And the و attaches to the word
     * after it with no space, which is why the space sits before it. */
    listJoin: ' و',
    listFinalJoin: ' و',
  },
  several: {
    title: 'محطّات في سجلّك',
    /* Addressed to somebody who did the work long ago and is only now being
     * told, so it thanks rather than congratulates a surprise. */
    body: 'سجّلنا لك: {list}. بعضها عن عمل قديم لم يكن مسجّلاً هنا من قبل، وهذه المرة الأولى التي يظهر فيها.',
  },
  milestones: {
    'first-activity': {
      title: 'أول نشاط',
      body: 'شاركت في أول نشاط ميداني مع الجمعية. البداية هي الجزء الأصعب، وقد تجاوزتها.',
    },
    'first-certificate': {
      title: 'أول شهادة',
      body: 'نلت أول شهادة لك من أكاديمية تكافل، وهي شهادة يمكنك أن تُريها لمن تشاء.',
    },
    'hours-10': {
      title: 'عشر ساعات',
      body: 'أتممت عشر ساعات تطوّع موثّقة. عشر ساعات من وقتك ذهبت إلى من يحتاجها.',
    },
    'hours-50': {
      title: 'خمسون ساعة',
      body: 'أتممت خمسين ساعة تطوّع موثّقة. هذا التزام طويل، ونحن نراه.',
    },
    'hours-100': {
      title: 'مئة ساعة',
      body: 'أتممت مئة ساعة تطوّع موثّقة مع الجمعية. شكراً لك على كل واحدة منها.',
    },
    'first-year': {
      title: 'سنة معنا',
      body: 'مرّت سنة كاملة على انضمامك إلى الجمعية. سنة من الحضور والاستمرار.',
    },
    'stage-1': {
      title: 'المرحلة الأولى',
      body: 'بلغت المرحلة الأولى من مسار المتطوّع. الطريق أمامك واضح.',
    },
    'stage-2': {
      title: 'المرحلة الثانية',
      body: 'بلغت المرحلة الثانية من مسار المتطوّع.',
    },
    'stage-3': {
      title: 'المرحلة الثالثة',
      body: 'بلغت المرحلة الثالثة من مسار المتطوّع.',
    },
    'stage-4': {
      title: 'المرحلة الرابعة',
      body: 'بلغت المرحلة الرابعة من مسار المتطوّع.',
    },
    'stage-5': {
      title: 'المرحلة الخامسة',
      body: 'بلغت المرحلة الخامسة من مسار المتطوّع.',
    },
    'stage-6': {
      title: 'المرحلة السادسة',
      body: 'بلغت المرحلة السادسة من مسار المتطوّع.',
    },
    returned: {
      title: 'أهلاً بعودتك',
      body: 'سعدنا بعودتك إلى الميدان بعد انقطاع. مكانك محفوظ كما تركته.',
    },
    'path-complete': {
      title: 'أتممت المسار',
      body: 'أتممت مسار المتطوّع في تكافل من أوّله إلى آخره. هذا إنجاز قليلون يبلغونه.',
    },
  },
  preferences: {
    title: 'ما الذي تحبّ أن نُخبرك به؟',
    lede: 'كلّ ما في هذه القائمة مُشغّل ما لم تُطفئه، ويمكنك تغييره في أيّ وقت. إطفاء أيّ منها لا يؤثّر على ساعاتك ولا على شهاداتك ولا على مكانك في الجمعية.',
    legend: 'المواضيع التي تصلك إشعارات عنها',
    topics: {
      ranking: {
        label: 'الترتيب بين المتطوّعين',
        hint: 'أي صفحة أو إشعار يضعك في ترتيب إلى جانب غيرك.',
      },
      badges: {
        label: 'الشارات',
        hint: 'الإشعار الذي يصلك عند نيل شارة جديدة.',
      },
      challenges: {
        label: 'التحدّيات الجماعية',
        hint: 'لوحة الهدف المشترك التي تظهر في حسابك.',
      },
      birthdays: {
        label: 'أعياد الميلاد',
        hint: 'تهنئتك في عيد ميلادك، وتهاني زملائك التي تظهر في حسابك.',
      },
    },
    alwaysNote: 'تبقى الرسائل المتعلّقة بطلبك وبساعاتك وبشهاداتك وبمراحلك واصلةً إليك دائماً. ما يخصّك مباشرةً ليس خياراً نُطفئه.',
    save: 'حفظ',
    saved: 'حُفظ اختيارك.',
  },
};

/* ----------------------------------------------------------------- English */

export const milestonesEn: MilestoneStrings = {
  birthday: {
    headline: "Today is {name}'s birthday 🎂",
    wish: 'Another year, and still part of what Takaful has done',
    greetingTitle: 'Today is your birthday 🎂',
    listJoin: ', ',
    listFinalJoin: ' and ',
  },
  several: {
    title: 'Milestones on your record',
    body: 'Recorded for you: {list}. Some of it is for work from before it was kept here, and this is the first time it has shown.',
  },
  milestones: {
    'first-activity': {
      title: 'A first activity',
      body: 'You took part in your first activity with the association. Starting is the hard part, and it is behind you.',
    },
    'first-certificate': {
      title: 'A first certificate',
      body: 'You have earned your first certificate from the Takaful academy, and it is yours to show whoever you like.',
    },
    'hours-10': {
      title: 'Ten hours',
      body: 'Ten verified hours of volunteering. Ten hours of your time went to people who needed it.',
    },
    'hours-50': {
      title: 'Fifty hours',
      body: 'Fifty verified hours of volunteering. That is a long commitment, and we see it.',
    },
    'hours-100': {
      title: 'A hundred hours',
      body: 'A hundred verified hours with the association. Thank you for every one of them.',
    },
    'first-year': {
      title: 'A year with us',
      body: 'A full year since you joined the association. A year of showing up and staying.',
    },
    'stage-1': {
      title: 'Stage one',
      body: 'You have reached the first stage of the volunteer path. The road ahead is marked out.',
    },
    'stage-2': {
      title: 'Stage two',
      body: 'You have reached the second stage of the volunteer path.',
    },
    'stage-3': {
      title: 'Stage three',
      body: 'You have reached the third stage of the volunteer path.',
    },
    'stage-4': {
      title: 'Stage four',
      body: 'You have reached the fourth stage of the volunteer path.',
    },
    'stage-5': {
      title: 'Stage five',
      body: 'You have reached the fifth stage of the volunteer path.',
    },
    'stage-6': {
      title: 'Stage six',
      body: 'You have reached the sixth stage of the volunteer path.',
    },
    returned: {
      title: 'Welcome back',
      body: 'It is good to have you back in the field after a while away. Your place was kept as you left it.',
    },
    'path-complete': {
      title: 'The whole path',
      body: 'You have completed the Takaful volunteer path from beginning to end. Few people get this far.',
    },
  },
  preferences: {
    title: 'What would you like to hear about?',
    lede: 'Everything in this list is on unless you turn it off, and you can change it whenever you like. Turning something off does not affect your hours, your certificates or your standing in the association.',
    legend: 'Subjects you receive notifications about',
    topics: {
      ranking: {
        label: 'Standing among volunteers',
        hint: 'Any page or message that places you in an order beside other people.',
      },
      badges: {
        label: 'Badges',
        hint: 'The message you get when you earn a new badge.',
      },
      challenges: {
        label: 'Group challenges',
        hint: 'The shared-goal panel that appears in your account.',
      },
      birthdays: {
        label: 'Birthdays',
        hint: 'Your own greeting, and the greetings for colleagues shown in your account.',
      },
    },
    alwaysNote: 'Messages about your application, your hours, your certificates and your stages always reach you. What happens to you directly is not a preference we switch off.',
    save: 'Save',
    saved: 'Your choice has been saved.',
  },
};

export const milestoneDictionaries: Record<StringsLocale, MilestoneStrings> = {
  ar: milestonesAr,
  en: milestonesEn,
};

/**
 * «اليوم عيد ميلاد محمد وأحمد 🎂» — one line, however many people.
 *
 * A line per person would stack four boxes on a small screen for something
 * that is one sentence, and on the day two volunteers share a birthday the
 * second one reads as an afterthought. One line, and the names in the order
 * they were given.
 *
 * The names arriving here have already been through publicBirthdayIdentity;
 * this function neither knows nor can find out whose they are. It returns an
 * empty string for an empty list so that a caller with nobody to greet renders
 * nothing rather than «اليوم عيد ميلاد 🎂».
 *
 * No digit is produced. There is no «و٣ آخرون» overflow, because a count of
 * how many people share a birthday today is one more thing a reader can work
 * backwards from than the association needs to publish.
 */
export function birthdayHeadline(strings: MilestoneStrings, names: readonly string[]): string {
  const clean = names.map((n) => String(n ?? '').trim()).filter(Boolean);
  if (clean.length === 0) return '';

  const joined =
    clean.length === 1
      ? clean[0]
      : clean.slice(0, -1).join(strings.birthday.listJoin) +
        strings.birthday.listFinalJoin +
        clean[clean.length - 1];

  return strings.birthday.headline.replace('{name}', joined);
}
