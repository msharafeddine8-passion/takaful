'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';

function localeOf(f: FormData): Locale {
  const v = String(f.get('lang') ?? 'ar');
  return isLocale(v) ? v : 'ar';
}
const text = (f: FormData, n: string) => String(f.get(n) ?? '').trim();

function optionalInt(raw: string, min: number, max: number): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

export async function createActivityAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const titleAr = text(formData, 'titleAr');
  const titleEn = text(formData, 'titleEn');
  const startsAt = text(formData, 'startsAt');
  const endsAt = text(formData, 'endsAt');

  if (!isDbConfigured() || !titleAr || !titleEn || !startsAt || !endsAt) return;
  // The database refuses this too; stopping here keeps the admin on the form
  // rather than on an error page.
  if (new Date(endsAt) <= new Date(startsAt)) return;

  const actor = await requireCapability('activities.manage');
  const id = randomUUID();

  await execute(
    `INSERT INTO activities
       (id, title_ar, title_en, description_ar, description_en, location,
        starts_at, ends_at, capacity, min_stage, led_by, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11)`,
    [
      id, titleAr, titleEn,
      text(formData, 'descriptionAr') || null,
      text(formData, 'descriptionEn') || null,
      text(formData, 'location') || null,
      startsAt, endsAt,
      optionalInt(text(formData, 'capacity'), 1, 10_000),
      optionalInt(text(formData, 'minStage'), 1, 20),
      actor.id,
    ],
  );

  await audit({
    actorId: actor.id,
    action: 'activity.created',
    targetType: 'activity',
    targetId: id,
    newValue: { titleEn, startsAt },
  });

  revalidatePath(`/${lang}/staff/activities`);
  revalidatePath(`/${lang}/opportunities`);
}

/** Closes registration without hiding the activity or losing its roster. */
export async function closeActivityAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const id = text(formData, 'activityId');
  if (!isDbConfigured() || !id) return;

  const actor = await requireCapability('activities.manage');
  await execute('UPDATE activities SET is_open = false WHERE id = $1', [id]);
  await audit({
    actorId: actor.id,
    action: 'activity.closed',
    targetType: 'activity',
    targetId: id,
  });

  revalidatePath(`/${lang}/staff/activities`);
  revalidatePath(`/${lang}/opportunities`);
}
