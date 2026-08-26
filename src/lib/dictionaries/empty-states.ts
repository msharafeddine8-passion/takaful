import type { Locale } from '@/lib/i18n';

/**
 * The sentences that stand where a zero used to.
 *
 * Its own module rather than three splices into types.ts / ar.ts / en.ts, for
 * the reason dictionaries/passport.ts, dictionaries/volunteer-roles.ts and
 * dictionaries/partners.ts all give: those three files are edited in lockstep
 * by other work, and a feature's worth of new keys landing in the middle of
 * them is a conflict nobody learns anything from resolving. To fold it in
 * later, add `emptyStates: EmptyStateStrings` to the Dictionary type and spread
 * these two objects into ar.ts and en.ts. Nothing else has to move.
 *
 * Placeholders are filled with String.replace — {n} — which is the convention
 * the rest of the dictionary uses. There is no ICU here.
 *
 * ── WHY THESE STRINGS EXIST AT ALL ─────────────────────────────────────────
 *
 * The client's section 58: never render "0 certificates" — say what would put
 * something there. That is not a polish item on this platform today. There are
 * no upcoming activities, no recorded roles, no partners, and three profiles in
 * thirty-nine carry a skill. Almost every screen a volunteer opens is empty, so
 * the empty states ARE the product, and each of them is the only sentence about
 * the association that particular person is going to read that day.
 *
 * ── THE FOUR RULES EVERY STRING BELOW KEEPS ────────────────────────────────
 *
 * 1. It names the thing that would fill the space. «لا ساعات» is a measurement;
 *    «تُوثَّق ساعتك الأولى فتظهر هنا» is a mechanism, and a mechanism can be
 *    acted on.
 *
 * 2. It does not blame the reader. "You have not logged any hours" makes the
 *    emptiness a property of the person; "no hours have been verified for you
 *    yet" makes it a property of the record. Both are true. Only the second is
 *    a beginning. Where Arabic would naturally open with «لم تفعل», the subject
 *    is moved off the reader — «لم تُوثَّق لك» rather than «لم تسجّل».
 *
 * 3. It points at the next real step, and only where one exists. No string here
 *    invites somebody to a page that has nothing on it either: the activities
 *    empty state says where openings are announced and that a notice will
 *    reach them, because the opportunities page cannot promise a list today.
 *
 * 4. It is quiet. One or two sentences of body text. The loud orange buttons
 *    that used to sit under three of these are now plain links — an empty
 *    screen shouting a call to action at somebody who signed up an hour ago is
 *    worse than a sentence.
 *
 * ── «NEVER» AND «NOT NOW» ARE DIFFERENT SENTENCES ──────────────────────────
 *
 * The distinction dictionaries/volunteer-roles.ts draws between `panelEmpty`
 * and `panelNoneCurrent`, kept wherever it applies. `activities.never` and
 * `activities.noneUpcoming` are the same pair: somebody who volunteered for two
 * years and has nothing in the diary this month must not be told they have
 * never attended anything. That is false, and it reads as the association
 * having forgotten them.
 *
 * ── AND WHERE A ZERO IS LEFT ALONE ─────────────────────────────────────────
 *
 * Deliberately not every zero. «0 / 20 مقعد» on an activity with a date is a
 * counter with a denominator: it says twenty places are free, which is exactly
 * what a reader wants and what a sentence would say worse. A dashboard of five
 * sentences where five numbers belong is a worse page than one with the
 * numbers. The rule is that a zero which cannot yet be anything else — a
 * headcount on an activity nobody can register for — is not a count, and the
 * ones that can climb are left to climb.
 */

/** The shape countPhrase() in lib/when.ts expects. Only few/many carry {n}. */
export type CountForms = {
  zero: string;
  one: string;
  two: string;
  few: string;
  many: string;
};

export type EmptyStateStrings = {
  /**
   * The four dashboard tiles, at zero.
   *
   * Short on purpose: these sit four-up on a laptop and stacked at 375px, under
   * a label and where a numeral would be. A paragraph here would turn the one
   * band of the dashboard that is meant to be scanned into something to read.
   */
  tiles: {
    hours: string;
    courses: string;
    activities: string;
    certificates: string;
  };

  hours: {
    /** Under «ساعات معتمدة», which rendered a label and then nothing at all. */
    verifiedNone: string;
    /** The ledger, with no rows in it yet. */
    ledgerEmpty: string;
    /** The stage tile before any stage has been recorded. */
    stageNone: string;
  };

  activities: {
    /** Nothing has ever been registered for. */
    never: string;
    /** Nothing upcoming, but there is a record behind them. */
    noneUpcoming: string;
    /** A plain link, not a filled button. */
    browse: string;
  };

  certificates: {
    never: string;
    browse: string;
  };

  achievements: {
    never: string;
    browse: string;
  };

  notifications: {
    never: string;
  };

  journey: {
    /** No stages configured — the association's state, not the reader's. */
    noStages: string;
  };

  opportunities: {
    /** Nothing published to register for or wait on. */
    none: string;
    /**
     * An activity with no date yet: how many people have asked to be told.
     *
     * Never a registration count. Nobody can register for something with no
     * date, so `taken` on those cards was a figure that could not be anything
     * but zero — a measurement of nothing, printed as «👥 0» ten times down a
     * public page.
     */
    waitingCount: CountForms;
    /** An activity with a date and no capacity set, at zero. */
    registeredCount: CountForms;
  };
};

export const emptyStatesAr: EmptyStateStrings = {
  tiles: {
    hours: 'تظهر هنا أوّل ساعة يوثّقها مشرفك.',
    courses: 'الأكاديمية مفتوحة لك — أوّل دورة تجتازها تُحسب هنا.',
    activities: 'أوّل نشاط يؤكّد مشرفه حضورك فيه يُحسب هنا.',
    certificates: 'تصدر أوّل شهادة باسمك حين تجتاز أوّل دورة.',
  },

  hours: {
    verifiedNone:
      'لم تُوثَّق لك ساعات بعد. سجّل مشاركتك في النموذج أدناه، ويوثّقها مشرفها، فتُضاف إلى هذا المجموع.',
    ledgerEmpty:
      'سجلّك خالٍ إلى الآن. كلّ مشاركة تسجّلها في النموذج أعلاه تظهر هنا فور تسجيلها — قيد المراجعة أوّلاً، ثمّ موثّقة حين يعتمدها مشرفها.',
    /* Not «لم تبدأ بعد». That is a verdict on the reader where the fact is
       about the record: the first stage opens on its own the moment an hour is
       verified, and saying so is the difference between a gate and a door. */
    stageNone: 'تُفتح مرحلتك الأولى مع أوّل ساعة تُوثَّق لك.',
  },

  activities: {
    never:
      'لم يُسجَّل لك اشتراك في نشاط بعد. تُعلن الجمعية أنشطتها على صفحة الفرص، وأوّل نشاط تشترك فيه يظهر هنا بموعده ومكانه، ويبقى في هذه الصفحة بعد انتهائه.',
    noneUpcoming:
      'لا نشاط قادم باسمك الآن. ما اشتركت فيه سابقاً باقٍ في هذه الصفحة كما هو.',
    browse: 'صفحة الفرص',
  },

  certificates: {
    /* Deliberately the same sentence as passport.ts's certificatesEmpty. A
       volunteer meets both — one on screen, one on the sheet they print — and
       two different accounts of how a certificate is earned would make each
       of them look like a guess. */
    never:
      'لا شهادات في سجلّك بعد. تصدر الجمعية شهادةً باسمها عند اجتيازك أوّل دورة في الأكاديمية، وتحمل رمز تحقّق يقرأه من شئت من موقع الجمعية.',
    browse: 'دورات الأكاديمية',
  },

  achievements: {
    never:
      'لا شارات في سجلّك بعد. تُمنح الشارات تلقائياً عمّا تفعله — أوّل ساعة موثّقة، أوّل نشاط تحضره، أوّل دورة تجتازها — فتظهر هنا من دون أن تطلبها.',
    browse: 'صفحة الفرص',
  },

  notifications: {
    never:
      'لم يصلك إشعار بعد. يصلك هنا ما يخصّ سجلّك وحده: اعتماد ساعاتك، وتأكيد اشتراكك في نشاط، وصدور شهادة باسمك، وما تُبلغك به الجمعية.',
  },

  journey: {
    /* The association has not configured its stages. Said as what it is —
       something on the association's side — because «لم تُضبط مراحل بعد» above
       an empty page reads to a volunteer as their own path having been lost. */
    noStages:
      'لم تُعتمد مراحل المسار بعد. حين تعتمدها الجمعية تظهر هنا بترتيبها وبما تتطلّبه كلّ مرحلة، وما وُثِّق لك من ساعات ودورات إلى ذلك الحين يُحسب لك فيها.',
  },

  opportunities: {
    none:
      'لا نشاط مفتوح على هذه الصفحة الآن. تُنشر الأنشطة هنا حال تحديدها، ويظهر مع كلٍّ منها موعدها ومكانها وما تُحتسب به من ساعات.',
    /*
     * «كن أوّل من يبدي اهتمامه» — the client's section 22, and it is an
     * invitation rather than a softened zero because the invitation is real:
     * activity_interest takes the name, the coordinator reads the list to
     * decide whether the activity is worth scheduling, and everybody on it is
     * written to once a date is set.
     *
     * The button underneath carries the action and says plainly that it is not
     * a registration, so this line does not repeat either.
     */
    waitingCount: {
      zero: 'كن أوّل من يبدي اهتمامه بهذا النشاط.',
      one: 'شخص واحد ينتظر موعد هذا النشاط.',
      two: 'شخصان ينتظران موعد هذا النشاط.',
      few: '{n} أشخاص ينتظرون موعد هذا النشاط.',
      many: '{n} شخصاً ينتظرون موعد هذا النشاط.',
    },
    registeredCount: {
      zero: 'كن أوّل المشتركين.',
      one: 'اشترك شخص واحد.',
      two: 'اشترك شخصان.',
      few: 'اشترك {n} أشخاص.',
      many: 'اشترك {n} شخصاً.',
    },
  },
};

export const emptyStatesEn: EmptyStateStrings = {
  tiles: {
    hours: 'Your first hour appears here once your supervisor verifies it.',
    courses: 'The academy is open to you — the first course you pass is counted here.',
    activities: 'The first activity whose supervisor confirms you were there is counted here.',
    certificates: 'Your first certificate is issued in your name when you pass your first course.',
  },

  hours: {
    verifiedNone:
      'No hours have been verified for you yet. Log a session in the form below, its supervisor verifies it, and it joins this total.',
    ledgerEmpty:
      'Your ledger is empty so far. Everything you log in the form above appears here straight away — awaiting review first, then verified once its supervisor approves it.',
    stageNone: 'Your first stage opens with the first hour verified for you.',
  },

  activities: {
    never:
      'No place on an activity is recorded for you yet. The association announces its activities on the openings page; the first one you take a place on appears here with its date and where it is, and stays on this page after it is over.',
    noneUpcoming:
      'Nothing upcoming is in your name right now. What you took part in before stays on this page exactly as it is.',
    browse: 'The openings page',
  },

  certificates: {
    never:
      'There are no certificates on your record yet. The association issues one in its own name when you pass your first course in the academy, and it carries a verification code anybody you choose can read from the association’s site.',
    browse: 'The academy’s courses',
  },

  achievements: {
    never:
      'There are no badges on your record yet. Badges are granted automatically for what you do — a first verified hour, a first activity attended, a first course passed — and appear here without your having to ask.',
    browse: 'The openings page',
  },

  notifications: {
    never:
      'Nothing has reached you yet. What arrives here concerns your record alone: your hours being verified, your place on an activity confirmed, a certificate issued in your name, and anything the association needs to tell you.',
  },

  journey: {
    noStages:
      'The stages of the path have not been settled yet. Once the association settles them they appear here in order, with what each one asks for — and the hours and courses recorded for you in the meantime count towards them.',
  },

  opportunities: {
    none:
      'Nothing is open on this page right now. Activities are published here as soon as they are settled, each with its date, where it is, and the hours it is worth.',
    waitingCount: {
      zero: 'Be the first to say you are interested in this one.',
      one: 'One person is waiting to hear when this one is scheduled.',
      two: '2 people are waiting to hear when this one is scheduled.',
      few: '{n} people are waiting to hear when this one is scheduled.',
      many: '{n} people are waiting to hear when this one is scheduled.',
    },
    registeredCount: {
      zero: 'Be the first to take a place.',
      one: 'One person has taken a place.',
      two: '2 people have taken a place.',
      few: '{n} people have taken a place.',
      many: '{n} people have taken a place.',
    },
  },
};

export const emptyStateDictionaries: Record<Locale, EmptyStateStrings> = {
  ar: emptyStatesAr,
  en: emptyStatesEn,
};

export function emptyStates(lang: Locale): EmptyStateStrings {
  return emptyStateDictionaries[lang];
}
