'use server';

import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute, queryOne, transaction } from '@/lib/db';
import { audit, setMembershipStatus, type MembershipStatus } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { notifyIn, type NotificationKind } from '@/lib/notify';
import { isLocale, type Locale } from '@/lib/i18n';

function localeOf(formData: FormData): Locale {
  const value = String(formData.get('lang') ?? 'ar');
  return isLocale(value) ? value : 'ar';
}

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim();
}

/** What each decision means for the applicant's standing. */
const NEXT_STATUS: Record<string, MembershipStatus> = {
  accepted: 'accepted_volunteer',
  waitlisted: 'volunteer_candidate',
  rejected: 'rejected',
};

const OPEN = ['submitted', 'under_review', 'interview_required', 'interview_scheduled'];

/**
 * What the applicant reads. Written plainly and in both languages, because a
 * rejection delivered badly is worse than a rejection.
 */
const DECISION_MESSAGES: Record<string, { titleAr: string; titleEn: string }> = {
  accepted: {
    titleAr: 'تهانينا — قُبل طلب تطوّعك 🎉',
    titleEn: 'Congratulations — your volunteering application was accepted 🎉',
  },
  waitlisted: {
    titleAr: 'طلبك على قائمة الانتظار',
    titleEn: 'Your application is on the waiting list',
  },
  rejected: {
    titleAr: 'قرار بشأن طلب تطوّعك',
    titleEn: 'A decision on your volunteering application',
  },
};

/**
 * Records a decision on a volunteer application.
 *
 * Accepting, waitlisting and rejecting all require a reason. That is not
 * bureaucracy: months later someone will ask why, and "we don't know" is not
 * an answer a youth organisation should have to give a 16-year-old.
 */
export async function decideApplicationAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const applicationId = text(formData, 'applicationId');
  const decision = text(formData, 'decision');
  const reason = text(formData, 'reason');

  if (!isDbConfigured()) return;
  if (!(decision in NEXT_STATUS) || !reason) return;

  const reviewer = await requireCapability('applications.review');

  const application = await queryOne<{ user_id: string; status: string }>(
    'SELECT user_id, status FROM volunteer_applications WHERE id = $1',
    [applicationId],
  );
  if (!application || !OPEN.includes(application.status)) return;

  // Nobody decides their own application.
  if (application.user_id === reviewer.id) return;

  await transaction(async (client) => {
    await client.query(
      `UPDATE volunteer_applications
          SET status = $1, decided_by = $2, decided_at = now(), decision_reason = $3
        WHERE id = $4 AND status = ANY($5)`,
      [decision, reviewer.id, reason, applicationId, OPEN],
    );

    // Told in the same transaction as decided. A decision recorded without
    // the person being told is how someone waits three weeks for an answer
    // that was given on day one.
    await notifyIn(client, {
      userId: application.user_id,
      kind: `application.${decision}` as NotificationKind,
      ...DECISION_MESSAGES[decision],
      // The reason is shown to them: they are entitled to know why, and it
      // was written knowing they would see it.
      bodyAr: reason,
      bodyEn: reason,
      link: '/account',
    });
  });

  await setMembershipStatus({
    userId: application.user_id,
    next: NEXT_STATUS[decision],
    changedBy: reviewer.id,
    actorRole: 'applications.review',
    reason,
  });

  // An accepted applicant becomes a volunteer, and gains the role that goes
  // with it. granted_by is the reviewer, never themselves.
  if (decision === 'accepted') {
    await execute(
      `INSERT INTO user_roles (user_id, role, scope_type, granted_by)
       VALUES ($1, 'volunteer', 'self', $2)`,
      [application.user_id, reviewer.id],
    );
    await execute(
      `INSERT INTO stage_progress (user_id, stage, awarded_by, note)
       VALUES ($1, 1, $2, $3)
       ON CONFLICT (user_id, stage) DO NOTHING`,
      [application.user_id, reviewer.id, 'Application accepted'],
    );
  }

  await audit({
    actorId: reviewer.id,
    action: `application.${decision}`,
    targetType: 'volunteer_application',
    targetId: applicationId,
    previousValue: { status: application.status },
    newValue: { status: decision },
    reason,
  });

  revalidatePath(`/${lang}/staff/applications`);
}

/** Moves an application into review so two people do not work it at once. */
export async function claimApplicationAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const applicationId = text(formData, 'applicationId');
  if (!isDbConfigured()) return;

  const reviewer = await requireCapability('applications.review');

  await execute(
    `UPDATE volunteer_applications
        SET status = 'under_review'
      WHERE id = $1 AND status = 'submitted'`,
    [applicationId],
  );
  await audit({
    actorId: reviewer.id,
    action: 'application.claimed',
    targetType: 'volunteer_application',
    targetId: applicationId,
  });

  revalidatePath(`/${lang}/staff/applications`);
}
