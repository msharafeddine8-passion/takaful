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

export type MemberCheck = {
  member_number: number;
  full_name: string;
  status: string;
  stage: number | null;
};

/**
 * Confirms a membership number, for the QR on a membership card.
 *
 * Returns the holder's name and standing and nothing else — enough for
 * someone at a door to confirm the card is genuine, not enough to learn
 * anything about the person from a number they guessed.
 */
export async function findMember(memberNumber: number): Promise<MemberCheck | null> {
  return queryOne<MemberCheck>(
    `SELECT p.member_number, p.full_name, u.status,
            (SELECT MAX(s.stage) FROM stage_progress s WHERE s.user_id = u.id) AS stage
       FROM profiles p
       JOIN users u ON u.id = p.user_id
      WHERE p.member_number = $1`,
    [memberNumber],
  );
}

export async function certificatesFor(userId: string): Promise<Certificate[]> {
  return query<Certificate>(
    `SELECT ${COLUMNS} FROM certificates WHERE user_id = $1 ORDER BY issued_at DESC`,
    [userId],
  );
}
