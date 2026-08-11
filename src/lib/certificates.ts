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
const GROUPS = 2;
const GROUP_LENGTH = 4;

export type CertificateKind = 'course' | 'hours';

export type CertificateSnapshot = {
  fullName: string;
  titleAr: string;
  titleEn: string;
  /** Verified minutes at the moment of issue, for an hours certificate. */
  minutes?: number;
};

export type Certificate = {
  id: string;
  code: string;
  user_id: string;
  kind: CertificateKind;
  course_slug: string | null;
  hours_at_issue: number | null;
  issued_at: Date;
  revoked_at: Date | null;
  revoke_reason: string | null;
  snapshot: CertificateSnapshot;
};

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
    `SELECT id, code, user_id, kind, course_slug, hours_at_issue,
            issued_at, revoked_at, revoke_reason, snapshot
       FROM certificates
      WHERE code = $1`,
    [normaliseCode(code)],
  );
}

export async function certificatesFor(userId: string): Promise<Certificate[]> {
  return query<Certificate>(
    `SELECT id, code, user_id, kind, course_slug, hours_at_issue,
            issued_at, revoked_at, revoke_reason, snapshot
       FROM certificates
      WHERE user_id = $1
      ORDER BY issued_at DESC`,
    [userId],
  );
}
