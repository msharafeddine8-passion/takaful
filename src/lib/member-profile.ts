/**
 * One person's whole record, reduced to what a member of staff may read.
 *
 * The question this answers is an ordinary one — "why is this volunteer stuck?"
 * — and answering it meant opening the member page, the hours queue, the roster
 * queue, the recognition panel, the audit log and the person's own achievements
 * page, then holding six half-answers in your head. So the reading is gathered
 * into one file. Nothing here is new information; it is the same rows, arranged
 * so that a coordinator can see them together.
 *
 * Two rules shape every type below, and both are about a platform that has
 * minors on it:
 *
 *   No birth date and no age leaves this module. Not in a field, not in a
 *   tooltip, not in a debugging aid. Whether somebody is a child is a fact the
 *   staff page needs; the date behind it is not, and a date that is available
 *   is a date that ends up in a table, an export or a log line. `minorStatus`
 *   reads three birth dates and returns one of three words.
 *
 *   No safeguarding, medical, guardian or emergency-contact VALUE leaves it
 *   either. `safeguardingPresence` accepts a whole row and returns four
 *   booleans, so the guarantee holds even if somebody later widens the query
 *   that feeds it. What a page may show is that a record exists and that the
 *   consents are on it; who the guardian is belongs to the page that owns it.
 *
 * The redaction is why `memberFile` exists at all rather than the page reading
 * the query result directly: the sensitive columns go in, they do not come out,
 * and the page is handed something that cannot render them.
 *
 * PURE. No database, no `server-only`, no clock — the caller passes today in.
 * scripts/probe-member-profile holds the two rules above directly, which is the
 * point: they must be provably true without a server or a fixture.
 */

import { formatMemberNumber, type MatchStrength } from './roster-match';
import { isMinorOn, visibilityFrom, DEFAULT_VISIBILITY, type VisibilityChoice } from './visibility';

/** A plain calendar day. Never a timestamp — see `calendarDate`. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A value as a calendar day, or null.
 *
 * A timestamp is refused rather than trimmed to its first ten characters. The
 * database session runs GMT and the association is in Beirut, so the first ten
 * characters of an instant recorded after ten in the evening name the previous
 * day — and this page compares a join date against an account date to decide
 * whether somebody predates the platform. Every date here is selected with
 * to_char and arrives as text already; anything else is a mistake upstream and
 * should read as missing rather than as the wrong day.
 */
export function calendarDate(value: unknown): string | null {
  const s = typeof value === 'string' ? value.trim() : '';
  return ISO_DATE.test(s) ? s : null;
}

// ------------------------------------------------------------------- age

/**
 * Whether this person is a child, as a staff page may state it.
 *
 * Three-valued, and deliberately not `treatAsMinor` from lib/visibility.ts.
 * That function protects a public page and so answers an unknown age with
 * "child", which is the only safe answer when the alternative is publishing a
 * fifteen-year-old. Here the reader is a coordinator deciding what to do about
 * a real person, and printing «قاصر» beside somebody whose birth date the
 * association simply never recorded is not caution — it is the record saying
 * something false. Seven accounts have no date anywhere, and 'unknown' is the
 * true thing to say about them.
 *
 * Where the sources disagree the younger answer still wins: a disagreement
 * means one of the records is wrong, and the safeguarding consequence of
 * treating a child as an adult is not symmetrical with the embarrassment of
 * the reverse.
 */
export type MinorStatus = 'minor' | 'adult' | 'unknown';

export function minorStatus(opts: {
  /** profiles_sensitive.date_of_birth, as YYYY-MM-DD text. */
  sensitiveDob?: string | null;
  /** safeguarding_records.date_of_birth, as YYYY-MM-DD text. */
  safeguardingDob?: string | null;
  /** volunteer_roster.date_of_birth from a claimed, approved line. */
  rosterDob?: string | null;
  /** Today in Beirut, as YYYY-MM-DD. The caller owns the clock. */
  today: string;
}): MinorStatus {
  const answers = [
    isMinorOn(opts.sensitiveDob, opts.today),
    isMinorOn(opts.safeguardingDob, opts.today),
    isMinorOn(opts.rosterDob, opts.today),
  ];
  if (answers.some((a) => a === true)) return 'minor';
  if (answers.some((a) => a === false)) return 'adult';
  return 'unknown';
}

// --------------------------------------------------------- safeguarding

/**
 * A safeguarding row as the database holds it.
 *
 * Every field is optional because the query that feeds this deliberately
 * selects almost none of them. They are named here anyway, and that is the
 * point: `safeguardingPresence` is written against the whole row, so widening
 * the query later cannot start leaking a guardian's telephone number onto a
 * staff page by accident.
 */
export type SafeguardingRow = {
  date_of_birth?: string | null;
  emergency_name?: string | null;
  emergency_phone?: string | null;
  emergency_relation?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  guardian_relation?: string | null;
  guardian_consent_at?: string | null;
  code_of_conduct_at?: string | null;
  safeguarding_at?: string | null;
  data_consent_at?: string | null;
  medical_notes?: string | null;
  /** Computed in SQL, so the note itself is never read into this process. */
  medical_note_on_file?: boolean | null;
};

/** Everything this page is allowed to know about a safeguarding record. */
export type SafeguardingPresence = {
  onFile: boolean;
  /** A guardian's consent is stamped on the row. Required of a minor. */
  guardianConsentRecorded: boolean;
  /** All three agreements — conduct, safeguarding, data — are stamped. */
  agreementsRecorded: boolean;
  /** There is a medical note. What it says is none of this page's business. */
  medicalNoteOnFile: boolean;
};

const filled = (v: unknown): boolean => typeof v === 'string' && v.trim().length > 0;

export function safeguardingPresence(row: SafeguardingRow | null | undefined): SafeguardingPresence {
  if (!row) {
    return {
      onFile: false,
      guardianConsentRecorded: false,
      agreementsRecorded: false,
      medicalNoteOnFile: false,
    };
  }
  return {
    onFile: true,
    guardianConsentRecorded: filled(row.guardian_consent_at),
    agreementsRecorded:
      filled(row.code_of_conduct_at) && filled(row.safeguarding_at) && filled(row.data_consent_at),
    medicalNoteOnFile: row.medical_note_on_file === true || filled(row.medical_notes),
  };
}

// ------------------------------------------------------------ visibility

/**
 * What this person agreed to appear as publicly, and whether they were ever
 * asked.
 *
 * The second half is the reason this is a type rather than a string. The
 * column defaults to `hidden`, so four hundred people who have never opened
 * the setting are indistinguishable from the one person who read it and chose
 * privacy — unless the timestamp is carried alongside. "Did this person
 * consent?" gets asked exactly once and always about somebody who is upset,
 * and «لم يُسأل» is a different answer from «اختار الإخفاء».
 */
export type VisibilityState = {
  choice: VisibilityChoice;
  /** They set it themselves. False means the default is standing in for them. */
  everChose: boolean;
  /** When they last set it. A timestamp about a setting, not about a person. */
  chosenAt: string | null;
  /**
   * Listed publicly with no record of anybody asking.
   *
   * Should be impossible — the only path that writes the choice writes the
   * timestamp with it — so it means either a hand-edited row or a bug in that
   * path. Either way it is a person appearing on a public page without
   * recorded consent, which is the one fault on this page worth interrupting
   * somebody about.
   */
  unexplained: boolean;
};

export function visibilityState(
  stored: string | null | undefined,
  chosenAt: string | null | undefined,
): VisibilityState {
  const choice = visibilityFrom(stored);
  const everChose = filled(chosenAt);
  return {
    choice,
    everChose,
    chosenAt: everChose ? String(chosenAt).trim() : null,
    unexplained: choice !== DEFAULT_VISIBILITY && !everChose,
  };
}

// -------------------------------------------------------------- standing

/**
 * When the association has known them, against when the platform has.
 *
 * Two dates rather than one, because for most of this roster they are years
 * apart and either one alone tells a lie. Compared as text: see `calendarDate`.
 */
export type MembershipSpan = {
  /** The association's own join date, from an approved roster line. */
  joinedOn: string | null;
  /** When the account was made. */
  accountFrom: string | null;
  /** They were volunteering before this platform existed. */
  predatesAccount: boolean;
};

export function membershipSpan(raw: { joinedOn?: unknown; accountFrom?: unknown }): MembershipSpan {
  const joinedOn = calendarDate(raw.joinedOn);
  const accountFrom = calendarDate(raw.accountFrom);
  return {
    joinedOn,
    accountFrom,
    predatesAccount: joinedOn !== null && accountFrom !== null && joinedOn < accountFrom,
  };
}

/**
 * The hours, split so the three figures do not overlap.
 *
 * Carried-over hours are already verified — the schema refuses a carry-over in
 * any other state — so a page showing "verified" and "carried forward" side by
 * side is showing the same minutes twice and inviting somebody to add them up.
 * `onPlatform` is what the split exists for: what this system actually watched
 * happen, which is the figure a coordinator is usually after.
 *
 * Pending minutes are never folded in anywhere. Hours awaiting a decision are
 * not hours, and the page that verifies them is one link away.
 */
export type HoursStanding = {
  verified: number;
  pending: number;
  carried: number;
  /** Verified minutes that were not carried forward. Never negative. */
  onPlatform: number;
};

const whole = (n: unknown): number => {
  const v = typeof n === 'number' ? n : Number.parseInt(String(n ?? '0'), 10);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
};

export function hoursStanding(raw: {
  verifiedMinutes?: unknown;
  pendingMinutes?: unknown;
  carriedMinutes?: unknown;
}): HoursStanding {
  const verified = whole(raw.verifiedMinutes);
  const carried = Math.min(whole(raw.carriedMinutes), verified);
  return { verified, pending: whole(raw.pendingMinutes), carried, onPlatform: verified - carried };
}

/**
 * Turning up, against signing up.
 *
 * `rate` is null when nothing was ever registered for. Nought attendances out
 * of nought registrations is arithmetically a hundred per cent and reads as a
 * perfect record, which is the same trap the journey card avoids by refusing to
 * put a percentage on an unconfigured stage.
 *
 * Registrations the volunteer cancelled, and activities the association called
 * off, are expected to have been excluded before this is called. Neither is a
 * failure to attend, and counting them as one would show a volunteer a figure
 * that punishes them for the association's own cancellation.
 */
export type ActivityStanding = {
  registered: number;
  attended: number;
  missed: number;
  /** 0–100, or null when there is nothing to be a fraction of. */
  rate: number | null;
};

export function activityStanding(raw: { registered?: unknown; attended?: unknown }): ActivityStanding {
  const registered = whole(raw.registered);
  const attended = Math.min(whole(raw.attended), registered);
  return {
    registered,
    attended,
    missed: registered - attended,
    rate: registered === 0 ? null : Math.round((attended / registered) * 100),
  };
}

// ------------------------------------------------------------ the roster

/**
 * How this account came to be attached to a name the association already knew.
 *
 * Worth recording separately from the fact of the link, because the four
 * answers carry different weight. A rule recognised them on two independent
 * facts; a person looked at the claim and decided; a person attached an account
 * to a line nobody claimed; or the claim is sitting in the queue. A year from
 * now, "who decided this?" has to have an answer, and «النظام» is one.
 */
export type Recognition = 'rule' | 'staff' | 'staff-link' | 'awaiting' | null;

export function rosterRecognition(actions: readonly string[]): Recognition {
  const seen = new Set(actions);
  /* A human decision outranks the rule when both are on the record: the
   * accountable party is the one who can be asked why. */
  if (seen.has('roster.linked_by_staff')) return 'staff-link';
  if (seen.has('roster.approved')) return 'staff';
  if (seen.has('roster.auto_approved')) return 'rule';
  if (seen.has('roster.claimed')) return 'awaiting';
  return null;
}

export type RosterLink = {
  /** T047 — the number the association has used for years. */
  label: string;
  memberNumber: number;
  committee: string | null;
  claimedOn: string | null;
  approvedOn: string | null;
  recognition: Recognition;
  /** Which two facts agreed, from the claim that was recorded at the time. */
  strength: MatchStrength | null;
};

export type RawRoster = {
  member_number: number;
  committee?: string | null;
  /** The association's own join date, which is not when the account was made. */
  joined_on?: unknown;
  claimed_on?: unknown;
  approved_on?: unknown;
  /** Every roster action recorded against this line, for `rosterRecognition`. */
  actions?: readonly string[];
  strength?: string | null;
  /** Never carried out of this module — see `memberFile`. */
  date_of_birth?: string | null;
};

const STRENGTHS: readonly MatchStrength[] = [
  'phone-and-name', 'phone-and-dob', 'number-and-name',
  'number-and-dob', 'phone-only', 'number-only',
];

export function rosterLink(raw: RawRoster | null | undefined): RosterLink | null {
  if (!raw) return null;
  const strength = STRENGTHS.find((s) => s === raw.strength) ?? null;
  return {
    label: formatMemberNumber(raw.member_number),
    memberNumber: raw.member_number,
    committee: filled(raw.committee) ? String(raw.committee).trim() : null,
    claimedOn: calendarDate(raw.claimed_on),
    approvedOn: calendarDate(raw.approved_on),
    recognition: rosterRecognition(raw.actions ?? []),
    strength,
  };
}

// ------------------------------------------------------------ the trail

/**
 * One line of the audit trail, as this page reads it.
 *
 * `byRule` is separated from a missing name on purpose. audit_logs.actor_id is
 * null when the system did something and only when the system did something —
 * a recognition granted by the matching rule, an achievement recomputed by a
 * nightly pass. Rendering that as "unknown" tells a reader the platform has
 * lost track of who acted, which is both false and the sort of thing that
 * makes somebody distrust the rest of the log.
 */
export type AuditEntry = {
  at: string;
  action: string;
  actor: string | null;
  reason: string | null;
  /** No human actor, because a rule did it. Not the same as an unknown one. */
  byRule: boolean;
};

export type RawAudit = {
  at: unknown;
  action: string;
  actor_name?: string | null;
  actor_id?: string | null;
  reason?: string | null;
};

export function auditEntry(row: RawAudit): AuditEntry {
  const byRule = !filled(row.actor_id);
  return {
    at: typeof row.at === 'string' ? row.at : '',
    action: row.action,
    actor: byRule ? null : (filled(row.actor_name) ? String(row.actor_name).trim() : null),
    reason: filled(row.reason) ? String(row.reason).trim() : null,
    byRule,
  };
}

// --------------------------------------------------------------- the file

/** A course this person has sat, named rather than counted. */
export type CourseMark = { slug: string; passedOn: string | null; attempts: number };

export type CertificateMark = {
  code: string;
  titleAr: string;
  titleEn: string;
  issuedOn: string | null;
  revokedOn: string | null;
  revokeReason: string | null;
};

export type BadgeMark = {
  code: string;
  earnedOn: string | null;
  withdrawnOn: string | null;
  /** Why it was taken back. A badge that vanished without one is the fault. */
  withdrawReason: string | null;
  /** A person granted it rather than the rules working it out. */
  byHand: boolean;
};

export type StageMark = { stage: number; reachedOn: string | null };

/**
 * The facts, as the queries hand them over — birth dates and all.
 *
 * This type exists so that the redaction has something to redact. Nothing
 * outside `memberFile` should hold one: lib/member-profile-data.ts builds it
 * and passes it straight through, so the page is given a `MemberFile` and has
 * no birth date to render even by mistake.
 */
export type RawMemberFile = {
  /** Today in Beirut, as YYYY-MM-DD. */
  today: string;
  account: {
    status: string;
    /** The newest row of membership_status_history, or null for a new account. */
    membershipStatus: string | null;
    createdOn?: unknown;
    lastSeenAt?: string | null;
  };
  roles: readonly string[];
  isVolunteer: boolean;
  roster: RawRoster | null;
  /** profiles_sensitive.date_of_birth. Read to decide, never carried out. */
  sensitiveDob?: string | null;
  safeguarding: SafeguardingRow | null;
  visibility: { stored: string | null; chosenAt: string | null };
  hours: { verifiedMinutes?: unknown; pendingMinutes?: unknown; carriedMinutes?: unknown };
  activities: { registered?: unknown; attended?: unknown };
  courses: { passed: readonly CourseMark[]; inProgress: readonly CourseMark[] };
  certificates: readonly CertificateMark[];
  badges: readonly BadgeMark[];
  points: number;
  stages: readonly StageMark[];
  audit: readonly RawAudit[];
};

/** What the page renders. Contains no birth date and no safeguarding value. */
export type MemberFile = {
  account: { status: string; membershipStatus: string | null; lastSeenAt: string | null };
  roles: readonly string[];
  isVolunteer: boolean;
  minor: MinorStatus;
  span: MembershipSpan;
  roster: RosterLink | null;
  safeguarding: SafeguardingPresence;
  visibility: VisibilityState;
  hours: HoursStanding;
  activities: ActivityStanding;
  courses: { passed: readonly CourseMark[]; inProgress: readonly CourseMark[] };
  certificates: { held: readonly CertificateMark[]; revoked: readonly CertificateMark[] };
  badges: { held: readonly BadgeMark[]; withdrawn: readonly BadgeMark[] };
  points: number;
  stages: readonly StageMark[];
  /** The highest stage reached, or 0. */
  stage: number;
  audit: readonly AuditEntry[];
};

/**
 * The one door between the queries and the page.
 *
 * Everything sensitive enters here and nothing sensitive leaves. That is a
 * property a probe can hold: give it a row full of birth dates, a guardian's
 * telephone number and a medical note, and none of them appear anywhere in the
 * result.
 */
export function memberFile(raw: RawMemberFile): MemberFile {
  const certificates = raw.certificates ?? [];
  const badges = raw.badges ?? [];
  const stages = raw.stages ?? [];

  return {
    account: {
      status: raw.account.status,
      membershipStatus: raw.account.membershipStatus,
      lastSeenAt: filled(raw.account.lastSeenAt) ? String(raw.account.lastSeenAt) : null,
    },
    roles: raw.roles ?? [],
    isVolunteer: raw.isVolunteer,
    minor: minorStatus({
      sensitiveDob: raw.sensitiveDob,
      safeguardingDob: raw.safeguarding?.date_of_birth,
      rosterDob: raw.roster?.date_of_birth,
      today: raw.today,
    }),
    /* The roster's own join date, not the claim date. The difference between
     * "with us since 2018" and "linked their account last March" is most of
     * what this page is for. */
    span: membershipSpan({ joinedOn: raw.roster?.joined_on, accountFrom: raw.account.createdOn }),
    roster: rosterLink(raw.roster),
    safeguarding: safeguardingPresence(raw.safeguarding),
    visibility: visibilityState(raw.visibility.stored, raw.visibility.chosenAt),
    hours: hoursStanding(raw.hours),
    activities: activityStanding(raw.activities),
    courses: { passed: raw.courses.passed ?? [], inProgress: raw.courses.inProgress ?? [] },
    certificates: {
      held: certificates.filter((c) => !c.revokedOn),
      /* Kept and shown rather than filtered away. A certificate that disappeared
       * silently is what makes somebody doubt the ones still on the page. */
      revoked: certificates.filter((c) => Boolean(c.revokedOn)),
    },
    badges: {
      held: badges.filter((b) => !b.withdrawnOn),
      withdrawn: badges.filter((b) => Boolean(b.withdrawnOn)),
    },
    points: whole(raw.points),
    stages,
    stage: stages.reduce((max, s) => Math.max(max, s.stage), 0),
    audit: (raw.audit ?? []).map(auditEntry),
  };
}
