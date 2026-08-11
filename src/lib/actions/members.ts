'use server';

import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute, queryOne } from '@/lib/db';
import { audit, type Role } from '@/lib/auth';
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
