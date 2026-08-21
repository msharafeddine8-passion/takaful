/**
 * What a stranger holding a scanned card is allowed to learn.
 *
 * A membership card gets shown at a checkpoint, photographed, forwarded, and
 * scanned by people the volunteer has never met. The question a verification
 * page answers is narrow — "is this card genuine, and is this person who they
 * say they are" — and everything beyond that answer is a leak with a
 * respectable-looking wrapper.
 *
 * So the public view is built by an allowlist, not by hiding columns in CSS
 * and not by selecting a row and trusting the template. A field that is not
 * named here cannot reach the browser, because nothing else is ever put in the
 * object that gets serialised.
 *
 * Never public, and each for its own reason rather than as a blanket rule:
 *   - date of birth, and anything computed from it. The platform has minors on
 *     it. A page that reveals a volunteer is fifteen, to anybody who scans a
 *     card they found, is the single worst thing this system could do.
 *   - emergency contact, guardian name, guardian phone. These exist so the
 *     association can reach somebody in a crisis, not so a stranger can.
 *   - medical notes. Obvious, and worth writing down anyway.
 *   - phone and email. A card is shown to prove identity, not to hand out
 *     contact details to whoever is holding it.
 *   - the user id, the roster id, the card token itself. Internal handles; a
 *     public page that prints one teaches people to try them elsewhere.
 *   - anything from the audit log, and any administrative reason or note.
 *
 * Pure: no database, no `server-only`, so probe-card holds the allowlist
 * directly rather than through a page that might be rendering something else.
 */

/** The state a card is in, as somebody checking it needs to understand it. */
export type CardStatus = 'active' | 'inactive' | 'suspended' | 'unknown';

/** Exactly what the public verification page may render. Nothing else exists. */
export type PublicCard = {
  status: CardStatus;
  /** Absent unless the card is genuine and the holder's profile is public. */
  fullName: string | null;
  /** «T014». Shown because it is what the card itself displays. */
  memberNumber: string | null;
  /** The stage's name, never a number that implies a rank ladder. */
  stageLabel: string | null;
  /** Month precision — «2026-08». A day would be a birthday-shaped detail. */
  memberSince: string | null;
  /** Whether a photograph may be shown, decided by the holder's own setting. */
  showPhoto: boolean;
  /** When the record behind this card last changed, month precision. */
  updated: string | null;
};

/** The fields a row must never carry into a PublicCard. Asserted by probe-card. */
export const NEVER_PUBLIC = [
  'date_of_birth', 'age', 'is_minor', 'guardian_name', 'guardian_phone',
  'guardian_relation', 'emergency_name', 'emergency_phone', 'emergency_relation',
  'medical_notes', 'phone', 'email', 'user_id', 'id', 'card_token',
  'reason', 'note', 'decision_reason', 'reject_reason', 'password_hash',
] as const;

/**
 * How the association's own words about a member become a card state.
 *
 * Deliberately collapses ten membership statuses into four. A checkpoint does
 * not need to know the difference between `volunteer_alumni` and
 * `inactive_volunteer` — both mean "genuine card, not currently on duty" — and
 * spelling out which one is a small disclosure with no purpose.
 */
export function cardStatusOf(opts: {
  accountStatus: string | null;
  membershipStatus: string | null;
  hasMemberNumber: boolean;
}): CardStatus {
  if (!opts.hasMemberNumber) return 'unknown';
  if (opts.accountStatus === 'suspended' || opts.membershipStatus === 'suspended') return 'suspended';
  if (opts.accountStatus !== 'active') return 'inactive';
  switch (opts.membershipStatus) {
    case 'accepted_volunteer':
    case 'active_volunteer':
      return 'active';
    case 'inactive_volunteer':
    case 'volunteer_alumni':
      return 'inactive';
    default:
      return 'unknown';
  }
}

/** Month precision, in Beirut. A full date is a detail nobody scanning needs. */
export function monthOf(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const p = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Beirut', year: 'numeric', month: '2-digit',
  }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}`;
}

/**
 * The only way a database row becomes something the public page can render.
 *
 * Takes whatever the query returned and returns a PublicCard built field by
 * field. Anything the row happens to carry — and a `SELECT *` carries a great
 * deal — is dropped here rather than downstream, because "the template does
 * not print it" is not the same as "it never left the server".
 */
export function toPublicCard(row: {
  full_name?: string | null;
  member_number?: number | null;
  is_public?: boolean | null;
  account_status?: string | null;
  membership_status?: string | null;
  stage_label?: string | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
} | null): PublicCard {
  const notFound: PublicCard = {
    status: 'unknown', fullName: null, memberNumber: null,
    stageLabel: null, memberSince: null, showPhoto: false, updated: null,
  };
  if (!row) return notFound;

  const status = cardStatusOf({
    accountStatus: row.account_status ?? null,
    membershipStatus: row.membership_status ?? null,
    hasMemberNumber: typeof row.member_number === 'number',
  });

  /*
   * A card that is not genuine and current reveals nothing but that. Naming
   * the holder of a suspended card would tell whoever scanned it something
   * about that person that the association has not chosen to say.
   */
  if (status !== 'active' && status !== 'inactive') {
    return { ...notFound, status };
  }

  return {
    status,
    fullName: row.full_name ?? null,
    memberNumber:
      typeof row.member_number === 'number'
        ? `T${String(row.member_number).padStart(3, '0')}`
        : null,
    stageLabel: row.stage_label ?? null,
    memberSince: monthOf(row.created_at ?? null),
    // The holder's own privacy setting decides this, not the page.
    showPhoto: row.is_public === true,
    updated: monthOf(row.updated_at ?? null),
  };
}
