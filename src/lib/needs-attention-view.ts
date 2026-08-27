import { countPhrase } from '@/lib/when';
/* The duration formatter the MEMBER TABLE on this same screen already uses —
 * lib/hours re-exports this one, and when.ts has a second, differently-worded
 * implementation of the same idea. Two spellings of «ساعتان» on one page read
 * as two different figures. Imported from format.ts directly because hours.ts
 * is server-only and this file is deliberately not. */
import { formatDuration } from '@/lib/format';
/* The pure half of the roster rules — roster.ts itself is server-only, and
 * this file is not. One definition of "T375", never a second padStart here. */
import { formatMemberNumber } from '@/lib/roster-match';
import type { Locale } from '@/lib/i18n';
import type { AttentionCheck, AttentionFinding } from '@/lib/needs-attention';
import type { NeedsAttentionStrings } from '@/lib/dictionaries/needs-attention';
import type { StatusLabels } from '@/lib/dictionaries/types';

/**
 * What one finding LOOKS like: its facts, and the screen that fixes it.
 *
 * The queries are next door in lib/needs-attention.ts, where they need a
 * database. Everything here is the part that does not — which is the reason it
 * is a separate file, exactly as volunteer-role-view.ts sits beside
 * volunteer-roles.ts. PURE: no 'server-only', no database, no clock, no React.
 *
 * ── THE FIX LINK IS A DESTINATION, AND IT IS CHOSEN CAREFULLY ─────────────
 *
 * Two of the three headings land on /staff/roster with no anchor, and that is
 * deliberate rather than lazy. That screen deliberately puts two boxes side by
 * side — link an account to an existing roster line, or accept somebody as a
 * NEW volunteer — because the two do opposite things to a person's seniority
 * and choosing wrongly cannot be undone by editing a field afterwards. Its own
 * comment says "side by side is how a reviewer sees there is a choice at all".
 * Deep-linking past that choice would be this panel making it on the
 * reviewer's behalf, from a check that does not know which is right.
 *
 * The one heading that DOES carry an anchor is the roster-line match, because
 * there the answer is already known: that person has a number and must keep
 * it. So it points at the linking box, which is the box that keeps it.
 *
 * ── NOTHING HERE IS A COUNT OF A PERSON ───────────────────────────────────
 *
 * The facts below are the platform's own record — hours it verified, activities
 * it confirmed, courses it marked passed. They are printed because the sentence
 * "this account has taken part" is worthless without them, and they are printed
 * as a list of things that happened rather than as a score. There is no total
 * across the three, no comparison between two people, and no ordering.
 */

/** One labelled fact under a line. `dir` is 'auto' unless the value is a number. */
export type AttentionFact = {
  label: string;
  value: string;
  /** 'ltr' for figures and dates, so they read correctly on the Arabic page. */
  dir: 'auto' | 'ltr';
};

export type FindingView = {
  facts: AttentionFact[];
  fixHref: string;
  fixLabel: string;
};

/**
 * Where each heading sends a reader. Paths only, joined to the locale below.
 *
 * A record keyed by AttentionCheck rather than a switch with a default: a
 * fourth check added to the union without a destination here is a type error,
 * which is the point. A panel whose new heading quietly linked nowhere would
 * be the same defect as the one it exists to report.
 */
const FIX_PATH: Record<AttentionCheck, string> = {
  volunteer_role_without_standing: '/staff/roster',
  account_matches_unclaimed_line: '/staff/roster#link-roster',
  taking_part_undecided: '/staff/roster',
};

/**
 * One finding, ready to render.
 *
 * The membership status is resolved through `dict.account.statuses`, which
 * already holds a label for every one of the ten — so a status shows as
 * «مستخدم مسجَّل» and never as `registered_user`, and a status with no history
 * row behind it says so in words rather than printing an em dash that reads
 * like a missing column.
 */
export function describeFinding(
  finding: AttentionFinding,
  lang: Locale,
  t: NeedsAttentionStrings,
  statuses: StatusLabels,
): FindingView {
  const statusFact = (status: keyof StatusLabels | null): AttentionFact => ({
    label: t.factStatus,
    value: status ? statuses[status] : t.factStatusMissing,
    dir: 'auto',
  });

  const facts: AttentionFact[] = [];

  switch (finding.check) {
    case 'volunteer_role_without_standing':
      facts.push(statusFact(finding.membershipStatus));
      break;

    case 'account_matches_unclaimed_line':
      facts.push(
        /* T375, not 375: the T and the padding are how the association writes
         * its own numbers, and formatMemberNumber owns them. */
        { label: t.factRosterLine, value: formatMemberNumber(finding.memberNumber), dir: 'ltr' },
        { label: t.factRosterName, value: finding.rosterName, dir: 'auto' },
      );
      /* Text sliced from to_char, never a Date — the session runs GMT and the
       * association is in Beirut, so an instant renders as the day before. */
      if (finding.rosterJoinedOn) {
        facts.push({ label: t.factRosterJoined, value: finding.rosterJoinedOn, dir: 'ltr' });
      }
      break;

    case 'taking_part_undecided': {
      facts.push(statusFact(finding.membershipStatus));
      /* Only what is actually true of this record. A row reading "0 activities"
       * beside "1 course" invites the eye to add them up, which is the one
       * thing this panel must not teach anybody to do. */
      if (finding.verifiedMinutes > 0) {
        facts.push({
          label: t.factVerifiedHours,
          value: formatDuration(finding.verifiedMinutes, lang),
          dir: 'auto',
        });
      }
      if (finding.attendedCount > 0) {
        facts.push({
          label: t.factAttendance,
          value: countPhrase(finding.attendedCount, t.activityCount),
          dir: 'auto',
        });
      }
      if (finding.coursesPassed > 0) {
        facts.push({
          label: t.factCourses,
          value: countPhrase(finding.coursesPassed, t.courseCount),
          dir: 'auto',
        });
      }
      break;
    }
  }

  return {
    facts,
    fixHref: `/${lang}${FIX_PATH[finding.check]}`,
    fixLabel: t.checks[finding.check].fixLabel,
  };
}
