'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isDbConfigured, execute, queryOne, transaction } from '@/lib/db';
import { audit, currentUser } from '@/lib/auth';
import { requireCapability, Forbidden } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';
import { parseDuration } from '@/lib/duration';
import type { FormState } from './types';

const MAX_MINUTES_PER_ENTRY = 1440; // one day
const MIN_MINUTES_PER_ENTRY = 5;

function localeOf(formData: FormData): Locale {
  const value = String(formData.get('lang') ?? 'ar');
  return isLocale(value) ? value : 'ar';
}

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim();
}

// ------------------------------------------------------------- logging hours

export async function logHoursAction(prev: FormState, formData: FormData): Promise<FormState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'dbUnavailable' };

  let user;
  try {
    user = await requireCapability('hours.log');
  } catch (error) {
    if (error instanceof Forbidden) redirect(`/${lang}/login`);
    throw error;
  }

  const fields: FormState['fields'] = {};

  const workedOn = text(formData, 'workedOn');
  const durationRaw = text(formData, 'duration');
  const note = text(formData, 'note');
  const activityId = text(formData, 'activityId');

  const minutes = parseDuration(durationRaw);
  if (!workedOn) fields.workedOn = 'required';
  if (minutes === null) fields.duration = 'durationInvalid';
  else if (minutes < MIN_MINUTES_PER_ENTRY || minutes > MAX_MINUTES_PER_ENTRY) {
    fields.duration = 'durationRange';
  }

  // Tomorrow is allowed - time zones - but next week is a typo.
  const day = workedOn ? new Date(`${workedOn}T00:00:00Z`) : null;
  if (day && !Number.isNaN(day.getTime())) {
    const tomorrow = new Date(Date.now() + 86_400_000);
    if (day.getTime() > tomorrow.getTime()) fields.workedOn = 'dateFuture';
  } else if (workedOn) {
    fields.workedOn = 'required';
  }

  const kept = { values: { workedOn, duration: durationRaw, note }, attempt: (prev.attempt ?? 0) + 1 };
  if (Object.keys(fields).length > 0) return { ...kept, fields };

  try {
    await execute(
      `INSERT INTO hour_entries (id, user_id, activity_id, worked_on, minutes, note)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), user.id, activityId || null, workedOn, minutes, note || null],
    );
    await audit({
      actorId: user.id,
      action: 'hours.logged',
      targetType: 'hour_entry',
      newValue: { workedOn, minutes },
    });
  } catch {
    return { ...kept, error: 'generic' };
  }

  revalidatePath(`/${lang}/account/hours`);
  redirect(`/${lang}/account/hours`);
}

// -------------------------------------------------------------- verification

export async function verifyHoursAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const entryId = text(formData, 'entryId');
  const decision = text(formData, 'decision');
  const reason = text(formData, 'reason');

  if (!isDbConfigured()) return;

  const reviewer = await requireCapability('hours.verify');

  const entry = await queryOne<{ user_id: string; minutes: number; status: string }>(
    'SELECT user_id, minutes, status FROM hour_entries WHERE id = $1',
    [entryId],
  );
  if (!entry || entry.status !== 'pending') {
    revalidatePath(`/${lang}/staff/hours`);
    return;
  }

  // The CHECK constraint enforces this too; refusing here gives a clean path
  // rather than a database error surfacing as a 500.
  if (entry.user_id === reviewer.id) return;

  if (decision === 'reject') {
    if (!reason) return; // the form marks it required; a rejection must say why
    await execute(
      `UPDATE hour_entries
          SET status = 'rejected', verified_by = $1, verified_at = now(), reject_reason = $2
        WHERE id = $3 AND status = 'pending'`,
      [reviewer.id, reason, entryId],
    );
    await audit({
      actorId: reviewer.id,
      action: 'hours.rejected',
      targetType: 'hour_entry',
      targetId: entryId,
      reason,
    });
  } else {
    await execute(
      `UPDATE hour_entries
          SET status = 'verified', verified_by = $1, verified_at = now()
        WHERE id = $2 AND status = 'pending'`,
      [reviewer.id, entryId],
    );
    await audit({
      actorId: reviewer.id,
      action: 'hours.verified',
      targetType: 'hour_entry',
      targetId: entryId,
      newValue: { minutes: entry.minutes },
    });
  }

  revalidatePath(`/${lang}/staff/hours`);
}

/**
 * Corrects a verified entry by inserting a reversing one. The original is
 * never edited: a total must always be explainable line by line.
 */
export async function correctHoursAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const entryId = text(formData, 'entryId');
  const reason = text(formData, 'reason');

  if (!isDbConfigured() || !reason) return;

  const reviewer = await requireCapability('hours.verify');

  const entry = await queryOne<{ user_id: string; minutes: number; status: string; worked_on: Date }>(
    'SELECT user_id, minutes, status, worked_on FROM hour_entries WHERE id = $1',
    [entryId],
  );
  if (!entry || entry.status !== 'verified') return;
  if (entry.user_id === reviewer.id) return;

  await transaction(async (client) => {
    await client.query(
      `INSERT INTO hour_entries
         (id, user_id, worked_on, minutes, note, status, verified_by, verified_at, corrects_id)
       VALUES ($1, $2, $3, $4, $5, 'verified', $6, now(), $7)`,
      [randomUUID(), entry.user_id, entry.worked_on, -entry.minutes, reason, reviewer.id, entryId],
    );
    await client.query(`UPDATE hour_entries SET status = 'corrected' WHERE id = $1`, [entryId]);
  });

  await audit({
    actorId: reviewer.id,
    action: 'hours.corrected',
    targetType: 'hour_entry',
    targetId: entryId,
    previousValue: { minutes: entry.minutes },
    reason,
  });

  revalidatePath(`/${lang}/staff/hours`);
}
