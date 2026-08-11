'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute, queryOne } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { generateCode, type CertificateSnapshot } from '@/lib/certificates';
import { verifiedMinutes } from '@/lib/hours';
import { isLocale, type Locale } from '@/lib/i18n';

function localeOf(formData: FormData): Locale {
  const value = String(formData.get('lang') ?? 'ar');
  return isLocale(value) ? value : 'ar';
}

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim();
}

/** Codes are unguessable, but a collision is still possible. Retry, briefly. */
const CODE_ATTEMPTS = 5;

/**
 * Issues an hours certificate for a volunteer.
 *
 * The figure and the name are copied into the snapshot at this moment and
 * never read live afterwards: a verifier who checks the same code twice must
 * see the same document both times.
 */
export async function issueHoursCertificateAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const userId = text(formData, 'userId');
  if (!isDbConfigured() || !userId) return;

  const issuer = await requireCapability('certificates.issue');

  const holder = await queryOne<{ full_name: string }>(
    'SELECT full_name FROM profiles WHERE user_id = $1',
    [userId],
  );
  if (!holder) return;

  const minutes = await verifiedMinutes(userId);
  // A certificate for nothing is worse than no certificate.
  if (minutes <= 0) return;

  const hours = Math.floor(minutes / 60);
  const snapshot: CertificateSnapshot = {
    fullName: holder.full_name,
    titleAr: `شهادة تطوّع — ${hours} ساعة معتمدة`,
    titleEn: `Certificate of volunteering — ${hours} verified hours`,
    minutes,
  };

  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
    const code = generateCode();
    try {
      await execute(
        `INSERT INTO certificates (id, code, user_id, kind, hours_at_issue, snapshot)
         VALUES ($1, $2, $3, 'hours', $4, $5)`,
        [randomUUID(), code, userId, minutes, JSON.stringify(snapshot)],
      );
      await audit({
        actorId: issuer.id,
        action: 'certificate.issued',
        targetType: 'certificate',
        targetId: code,
        newValue: { kind: 'hours', minutes },
      });
      revalidatePath(`/${lang}/staff`);
      return;
    } catch (error) {
      // 23505 on this table is the code index; anything else is real.
      const isCollision =
        typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
      if (!isCollision) throw error;
    }
  }

  throw new Error('Could not allocate a unique certificate code.');
}

/**
 * Revokes a certificate. The row stays and the code keeps resolving, so the
 * verification page can say "this was revoked" rather than "no such
 * certificate" - which would look like a typo and invite a second try.
 */
export async function revokeCertificateAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const code = text(formData, 'code');
  const reason = text(formData, 'reason');
  if (!isDbConfigured() || !code || !reason) return;

  const actor = await requireCapability('certificates.revoke');

  await execute(
    `UPDATE certificates
        SET revoked_at = now(), revoke_reason = $1
      WHERE code = $2 AND revoked_at IS NULL`,
    [reason, code],
  );

  await audit({
    actorId: actor.id,
    action: 'certificate.revoked',
    targetType: 'certificate',
    targetId: code,
    reason,
  });

  revalidatePath(`/${lang}/verify/${code}`);
}
