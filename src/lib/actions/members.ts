'use server';

import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute, queryOne, transaction } from '@/lib/db';
import { audit, setMembershipStatus, type Role } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';

const ROLES: Role[] = [
  'registered_user', 'volunteer', 'team_leader', 'instructor',
  'field_supervisor', 'project_coordinator', 'content_manager',
  'program_admin', 'super_admin',
];

function localeOf(formData: FormData): Locale {
  const value = String(formData.get('lang') ?? 'ar');
  return isLocale(value) ? value : 'ar';
}

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim();
}

/**
 * Grants a role.
 *
 * granted_by is always the actor, and the database refuses a grant where that
 * equals the recipient. So the checks below are for a clean redirect, not for
 * safety - safety is one layer down and cannot be bypassed by a bug up here.
 */
export async function grantRoleAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const userId = text(formData, 'userId');
  const role = text(formData, 'role') as Role;
  if (!isDbConfigured() || !userId || !ROLES.includes(role)) return;

  /*
   * Standing is not a job, and this is said on the server rather than only in
   * the page's list of buttons. The list is what somebody sees; this is what
   * is true.
   *
   * Granting 'volunteer' wrote the row and moved nothing else — is_volunteer()
   * reads the membership history — so the member came out looking approved and
   * still unable to register for anything. It happened to a real person. The
   * two paths that actually confer it, /staff/roster and /staff/applications,
   * set the status and the role together.
   */
  if (role === 'volunteer') return;

  const actor = await requireCapability('members.manage');
  if (actor.id === userId) return;

  await execute(
    `INSERT INTO user_roles (user_id, role, scope_type, granted_by)
     VALUES ($1, $2, 'self', $3)`,
    [userId, role, actor.id],
  );
  await audit({
    actorId: actor.id,
    action: 'role.granted',
    targetType: 'user',
    targetId: userId,
    newValue: { role },
  });

  revalidatePath(`/${lang}/staff/members/${userId}`);
}

/**
 * Ends a role. The row is kept and given an end date rather than deleted, so
 * "who was a supervisor last spring" stays an answerable question.
 */
export async function revokeRoleAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const roleId = text(formData, 'roleId');
  const userId = text(formData, 'userId');
  if (!isDbConfigured() || !roleId) return;

  const actor = await requireCapability('members.manage');

  const row = await queryOne<{ role: string; user_id: string }>(
    'SELECT role, user_id FROM user_roles WHERE id = $1',
    [roleId],
  );
  if (!row) return;

  await execute(
    'UPDATE user_roles SET valid_until = now() WHERE id = $1 AND valid_until IS NULL',
    [roleId],
  );
  await audit({
    actorId: actor.id,
    action: 'role.revoked',
    targetType: 'user',
    targetId: row.user_id,
    previousValue: { role: row.role },
  });

  revalidatePath(`/${lang}/staff/members/${userId}`);
}

/**
 * Suspends an account.
 *
 * The sessions go with it. Without that, a suspension takes effect whenever
 * the person next signs in — which, for the reason someone is usually
 * suspended from an organisation that works with children, is exactly the
 * wrong moment. Their access ends when the decision is made.
 *
 * A reason is required. This is a decision about a person, and the record has
 * to say why it was taken and by whom.
 */
export async function suspendMemberAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const userId = text(formData, 'userId');
  const reason = text(formData, 'reason');
  if (!isDbConfigured() || !userId || reason.length < 3) return;

  const actor = await requireCapability('members.manage');

  // Suspending yourself is a way to lock everyone out by accident, and there
  // is no version of it that is what someone meant to do.
  if (actor.id === userId) return;

  const target = await queryOne<{ status: string }>('SELECT status FROM users WHERE id = $1', [
    userId,
  ]);
  if (!target || target.status !== 'active') return;

  /*
   * Never leave the platform with nobody who can administer it. Suspending the
   * only remaining super_admin would need a database edit to undo, which is
   * precisely the situation the dashboard exists to avoid.
   */
  const others = await queryOne<{ n: number }>(
    `SELECT count(*)::INTEGER AS n
       FROM user_roles r JOIN users u ON u.id = r.user_id
      WHERE r.role = 'super_admin' AND r.user_id <> $1
        AND u.status = 'active'
        AND (r.valid_until IS NULL OR r.valid_until > now())`,
    [userId],
  );
  const isAdmin = await queryOne<{ n: number }>(
    `SELECT count(*)::INTEGER AS n FROM user_roles
      WHERE user_id = $1 AND role = 'super_admin'
        AND (valid_until IS NULL OR valid_until > now())`,
    [userId],
  );
  if ((isAdmin?.n ?? 0) > 0 && (others?.n ?? 0) === 0) return;

  await transaction(async (client) => {
    await client.query(`UPDATE users SET status = 'suspended' WHERE id = $1`, [userId]);
    await client.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
  });

  await setMembershipStatus({
    userId,
    next: 'suspended',
    changedBy: actor.id,
    actorRole: 'members.manage',
    reason,
  });

  await audit({
    actorId: actor.id,
    action: 'member.suspended',
    targetType: 'user',
    targetId: userId,
    previousValue: { status: 'active' },
    newValue: { status: 'suspended' },
    reason,
  });

  revalidatePath(`/${lang}/staff/members/${userId}`);
}

/**
 * Lifts a suspension.
 *
 * The membership status returns to inactive_volunteer rather than to whatever
 * it was before: someone coming back after a suspension is returning, not
 * carrying on, and the difference matters to whoever schedules them next.
 */
export async function reactivateMemberAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const userId = text(formData, 'userId');
  const reason = text(formData, 'reason');
  if (!isDbConfigured() || !userId || reason.length < 3) return;

  const actor = await requireCapability('members.manage');

  const target = await queryOne<{ status: string }>('SELECT status FROM users WHERE id = $1', [
    userId,
  ]);
  // Deliberately not offered for 'deactivated'. That is someone who left, and
  // bringing their account back is a conversation, not a button.
  if (!target || target.status !== 'suspended') return;

  await execute(`UPDATE users SET status = 'active' WHERE id = $1`, [userId]);

  await setMembershipStatus({
    userId,
    next: 'inactive_volunteer',
    changedBy: actor.id,
    actorRole: 'members.manage',
    reason,
  });

  await audit({
    actorId: actor.id,
    action: 'member.reactivated',
    targetType: 'user',
    targetId: userId,
    previousValue: { status: 'suspended' },
    newValue: { status: 'active' },
    reason,
  });

  revalidatePath(`/${lang}/staff/members/${userId}`);
}

export async function awardStageAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const userId = text(formData, 'userId');
  const stage = Number.parseInt(text(formData, 'stage'), 10);
  const note = text(formData, 'note');
  if (!isDbConfigured() || !userId || !Number.isInteger(stage) || stage < 1 || stage > 6) return;

  const actor = await requireCapability('stages.award');
  if (actor.id === userId) return;

  await execute(
    `INSERT INTO stage_progress (user_id, stage, awarded_by, note)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, stage) DO NOTHING`,
    [userId, stage, actor.id, note || null],
  );
  await audit({
    actorId: actor.id,
    action: 'stage.awarded',
    targetType: 'user',
    targetId: userId,
    newValue: { stage },
    reason: note || undefined,
  });

  revalidatePath(`/${lang}/staff/members/${userId}`);
}
