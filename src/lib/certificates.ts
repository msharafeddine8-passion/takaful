import 'server-only';
import { randomInt } from 'node:crypto';
import { query, queryOne } from './db';

/**
 * Certificates and their public verification.
 *
 * A certificate is a claim made to strangers - an employer, a university,
 * another organisation - so two things matter more than anything else:
 *
 *   1. It must be checkable by someone with no account, from the code alone.
 *   2. What it says must be frozen at the moment of issue. If a volunteer
 *      later corrects the spelling of their name, an already-issued
 *      certificate keeps saying what it said. Otherwise a verifier who
 *      checked it in March and again in June sees two different documents
 *      and rightly stops trusting any of them.
 */

/**
 * No 0/O, 1/I/L, 5/S, 8/B. People read these off paper and over the phone,
 * and a confusable pair turns a valid certificate into a support request.
 */
const ALPHABET = '234679ACDEFGHJKMNPQRTUVWXYZ';
/*
 * Three groups, not two.
 *
 * Two groups is eight characters from a 27-symbol alphabet — about 2.8×10^11,
 * or 38 bits. That is thin for a value the only protection on a public
 * verification endpoint, where an attacker can guess as fast as the network
 * allows. Three groups is roughly 10^17, and the cost is four more characters
 * on a printed line.
 *
 * Safe to change: the format is not parsed anywhere, normaliseCode handles any
 * number of groups, and no certificate has been issued yet.
 */
const GROUPS = 3;
const GROUP_LENGTH = 4;

/**
 * The four layers of the programme, plus the hours certificate that predates
 * it. 'course' covers both a core course and an elective — what distinguishes
 * them is the course, not the credential.
 */
export type CertificateKind = 'course' | 'hours' | 'orientation' | 'level' | 'program';

export type CertificateSnapshot = {
  fullName: string;
  titleAr: string;
  titleEn: string;
  /** Verified volunteering minutes at issue, for an hours certificate. */
  minutes?: number;
  /** Learning minutes the credential represents. */
  learningMinutes?: number;
  /** Named skills, frozen: the course may be edited after this is printed. */
  skillsAr?: string[];
  skillsEn?: string[];
  /** For a level credential: which level, and the courses it covered. */
  levelNumber?: number;
  courses?: string[];
  /**
   * For a level credential: what actually closed the level when it was issued.
   *
   * The recognition sentence is read from the dictionary at view time rather
   * than frozen with the rest of this snapshot — so changing what closes a
   * level silently rewords every certificate ever issued, the old ones
   * included. Two people closed level 1 by sitting the marked paper, and the
   * new wording would have their certificate say they walked a decision run:
   * a document making a claim about somebody that is not true.
   *
   * Absent on anything issued before this field existed, and absent means
   * `paper`, because that is what closed a level then.
   */
  closedBy?: 'run' | 'paper';
};

export type Certificate = {
  id: string;
  code: string;
  user_id: string;
  kind: CertificateKind;
  course_slug: string | null;
  hours_at_issue: number | null;
  level_id: string | null;
  program_id: string | null;
  learning_minutes: number | null;
  issued_at: Date;
  revoked_at: Date | null;
  revoke_reason: string | null;
  snapshot: CertificateSnapshot;
};

/**
 * The columns every read of a certificate needs. One constant so a new column
 * cannot be added to one query and forgotten in the other two.
 */
const COLUMNS = `id, code, user_id, kind, course_slug, hours_at_issue,
                 level_id, program_id, learning_minutes,
                 issued_at, revoked_at, revoke_reason, snapshot`;

/** e.g. TKF-4H7K-QM29 */
export function generateCode(): string {
  const groups: string[] = [];
  for (let g = 0; g < GROUPS; g += 1) {
    let group = '';
    for (let i = 0; i < GROUP_LENGTH; i += 1) {
      // randomInt, not Math.random: this is the only thing standing between
      // a stranger and a forged verification.
      group += ALPHABET[randomInt(ALPHABET.length)];
    }
    groups.push(group);
  }
  return `TKF-${groups.join('-')}`;
}

/** Normalises what someone typed: case, spacing, and a missing prefix. */
export function normaliseCode(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/[\s‐-―]/g, '-').replace(/-+/g, '-');
  const withoutPrefix = cleaned.replace(/^TKF-?/, '');
  return `TKF-${withoutPrefix.replace(/^-/, '')}`;
}

/**
 * Look up a certificate for the public verification page.
 * Deliberately returns the holder's name and nothing else identifying:
 * a verifier needs to confirm a claim, not read a profile.
 */
export async function findByCode(code: string): Promise<Certificate | null> {
  return queryOne<Certificate>(
    `SELECT ${COLUMNS} FROM certificates WHERE code = $1`,
    [normaliseCode(code)],
  );
}

export type CardRow = {
  full_name: string;
  member_number: number | null;
  is_public: boolean | null;
  account_status: string | null;
  membership_status: string | null;
  stage_label: string | null;
  created_at: Date;
  updated_at: Date | null;
};

/**
 * Confirms a membership card, by the token printed in its QR.
 *
 * This replaced a lookup by membership number, which was a mistake with a
 * reassuring comment on it: the old function claimed it returned "not enough
 * to learn anything about the person from a number they guessed" while
 * returning their full name, and membership numbers run in sequence from T014
 * to T473. Anyone could count to five hundred and collect the association's
 * entire roster. The numbers had to stop being the key.
 *
 * The token is 128 bits of CSPRNG output and means nothing. It is looked up
 * whole — no prefix matching, no partial, nothing that would let somebody
 * narrow it down a character at a time.
 *
 * What comes back is still a database row. It becomes something safe to render
 * only by going through toPublicCard in lib/card-view.ts, which builds the
 * public object field by field from an allowlist.
 */
export async function findCardByToken(token: string): Promise<CardRow | null> {
  // Shape-checked before it reaches SQL: 32 hex characters, nothing else.
  if (!/^[0-9a-f]{32,}$/.test(token)) return null;

  return queryOne<CardRow>(
    `SELECT p.full_name,
            p.member_number,
            p.is_public,
            u.status AS account_status,
            (SELECT h.new_status FROM membership_status_history h
              WHERE h.user_id = u.id ORDER BY h.changed_at DESC LIMIT 1) AS membership_status,
            (SELECT js.title_ar FROM stage_progress sp
               JOIN journey_stages js ON js.number = sp.stage
              WHERE sp.user_id = u.id
              ORDER BY sp.stage DESC LIMIT 1) AS stage_label,
            u.created_at,
            p.updated_at
       FROM profiles p
       JOIN users u ON u.id = p.user_id
      WHERE p.card_token = $1`,
    [token],
  );
}

export async function certificatesFor(userId: string): Promise<Certificate[]> {
  return query<Certificate>(
    `SELECT ${COLUMNS} FROM certificates WHERE user_id = $1 ORDER BY issued_at DESC`,
    [userId],
  );
}
