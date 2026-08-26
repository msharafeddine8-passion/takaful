import type { Locale } from '@/lib/i18n';

/**
 * The six headings the staff hub is grouped under, and nothing else.
 *
 * ── WHY THIS IS ITS OWN MODULE ─────────────────────────────────────────────
 *
 * The same reason challenges.ts, awards.ts, practical.ts, org-groups.ts,
 * partners.ts and volunteer-roles.ts are their own modules, stated once more
 * because this is the seventh: types.ts, ar.ts and en.ts are three files edited
 * in lockstep by every other piece of work, and a handful of new keys landing in
 * the middle of them is a conflict nobody learns anything from resolving. None
 * of those three is touched by this file. To fold it in later, add
 * `staffHub: StaffHubStrings` to the Dictionary type and spread these two
 * objects into ar.ts and en.ts; nothing else has to move.
 *
 * ── WHY THE GROUPS ARE NAMED THIS WAY ──────────────────────────────────────
 *
 * The hub was a flat row of eighteen identical pills. Eighteen things of equal
 * weight is a list nobody reads: people found a screen by remembering where the
 * button sat, which is not navigation. It is the same failure
 * components/account/AccountNav.tsx was written to fix on the volunteer side,
 * and these headings follow its rule — a group is named for what the reader
 * came looking for, in the association's own words, never for the part of the
 * system it belongs to.
 *
 * So «المتطوّعون» and not «إدارة المستخدمين». «الميدان» and not «إدارة
 * الأنشطة». «الأكاديمية» is what the association already calls its training,
 * and it is one heading over five screens that a coordinator, a trainer and an
 * instructor reach for at different times. «صفحات الجمعية العامة» says the one
 * thing that actually distinguishes what is under it: press the button and a
 * stranger sees the result.
 *
 * ── THERE IS NO GROUP FOR «اللجان والفرق» OR «حقول الملفّ» ─────────────────
 *
 * Those two screens are deliberately unlisted — see the comment beside the
 * groups in src/app/[lang]/staff/page.tsx, which is where the decision lives.
 * There is no heading here for them because a heading is an invitation, and the
 * point is that neither is being offered.
 */

export type StaffHubStrings = {
  /** The aria-label on the grouped navigation, for a screen reader. */
  navLabel: string;
  /** One line above the groups, saying what the rest of the page is. */
  groupsLede: string;
  groups: {
    volunteers: string;
    field: string;
    academy: string;
    recognition: string;
    publicPages: string;
    records: string;
  };
};

export const staffHubAr: StaffHubStrings = {
  navLabel: 'أقسام الإدارة',
  groupsLede: 'بقيّة الشاشات، مرتّبة بحسب ما تبحث عنه.',
  groups: {
    volunteers: 'المتطوّعون',
    field: 'الميدان',
    academy: 'الأكاديمية',
    /* «التقدير» وحدها كلمة إدارية؛ الجمعية تقول «تكريم» حين تسمّي أحداً في
       اجتماع. الكلمتان معاً تغطّيان الشاشتين: الشارات، وجائزة الشهر. */
    recognition: 'التقدير والتكريم',
    publicPages: 'صفحات الجمعية العامة',
    records: 'التقارير والسجلّ',
  },
};

export const staffHubEn: StaffHubStrings = {
  navLabel: 'Staff sections',
  groupsLede: 'The rest of the screens, grouped by what you came looking for.',
  groups: {
    volunteers: 'The volunteers',
    field: 'The field',
    academy: 'The academy',
    recognition: 'Recognition',
    publicPages: 'The association’s public pages',
    records: 'Reports and audit',
  },
};

export const staffHubDictionaries: Record<Locale, StaffHubStrings> = {
  ar: staffHubAr,
  en: staffHubEn,
};

export function staffHub(lang: Locale): StaffHubStrings {
  return staffHubDictionaries[lang];
}
