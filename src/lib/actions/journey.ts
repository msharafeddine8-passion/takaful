'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { isDbConfigured, execute, queryOne } from '@/lib/db';
import { audit } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';

/**
 * The Journey Builder's writes.
 *
 * The whole point is that changing what Stage 3 requires needs an admin and a
 * form, not a developer and a deploy. So validation lives here, close to the
 * form, with the database refusing anything malformed underneath.
 */

const KINDS = ['course', 'hours', 'assessment', 'activity', 'evaluation', 'document', 'approval'] as const;
type Kind = (typeof KINDS)[number];

function localeOf(f: FormData): Locale {
  const v = String(f.get('lang') ?? 'ar');
  return isLocale(v) ? v : 'ar';
}
const text = (f: FormData, n: string) => String(f.get(n) ?? '').trim();

/** Builds the config for a kind, keeping out anything that kind does not use. */
function buildConfig(kind: Kind, f: FormData): Record<string, string> | null {
  switch (kind) {
    case 'hours': {
      // The form asks for hours because that is how people think; the database
      // stores minutes because that is how the ledger counts.
      const hours = Number.parseFloat(text(f, 'hours'));
      if (!Number.isFinite(hours) || hours <= 0) return null;
      return { minutes: String(Math.round(hours * 60)) };
    }
    case 'course': {
      const slug = text(f, 'courseSlug');
      if (!slug) return null;
      const min = text(f, 'minScore');
      return min ? { courseSlug: slug, minScore: min } : { courseSlug: slug };
    }
    case 'assessment': {
      const slug = text(f, 'courseSlug');
      const mark = Number.parseInt(text(f, 'passMark'), 10);
      if (!slug || !Number.isInteger(mark) || mark < 0 || mark > 100) return null;
      return { courseSlug: slug, passMark: String(mark) };
    }
    case 'document': {
      const kindName = text(f, 'documentKind');
      return kindName ? { documentKind: kindName } : null;
    }
    case 'approval': {
      const cap = text(f, 'capability') || 'members.manage';
      return { capability: cap };
    }
    case 'activity':
    case 'evaluation':
      return {};
  }
}

export async function addRequirementAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const stageId = text(formData, 'stageId');
  const kind = text(formData, 'kind') as Kind;
  const labelAr = text(formData, 'labelAr');
  const labelEn = text(formData, 'labelEn');

  if (!isDbConfigured() || !stageId || !KINDS.includes(kind) || !labelAr || !labelEn) return;

  const actor = await requireCapability('members.manage');
  const config = buildConfig(kind, formData);
  // A requirement nobody could ever satisfy is worse than no requirement, so
  // a malformed one is refused rather than saved half-configured.
  if (config === null) return;

  const next = await queryOne<{ n: string }>(
    'SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM stage_requirements WHERE stage_id = $1',
    [stageId],
  );

  await execute(
    `INSERT INTO stage_requirements
       (id, stage_id, kind, label_ar, label_en, config, is_required, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      randomUUID(), stageId, kind, labelAr, labelEn,
      JSON.stringify(config),
      formData.get('isRequired') !== 'off',
      Number.parseInt(next?.n ?? '1', 10),
    ],
  );

  await audit({
    actorId: actor.id,
    action: 'journey.requirement_added',
    targetType: 'journey_stage',
    targetId: stageId,
    newValue: { kind, config },
  });

  revalidatePath(`/${lang}/staff/journey`);
}

/**
 * Retires a requirement. Never deletes: deleting would erase the record of
 * what someone was asked to do, and anyone who already satisfied it keeps
 * their progress.
 */
export async function archiveRequirementAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const id = text(formData, 'requirementId');
  if (!isDbConfigured() || !id) return;

  const actor = await requireCapability('members.manage');

  const before = await queryOne<{ kind: string; stage_id: string }>(
    'SELECT kind, stage_id FROM stage_requirements WHERE id = $1 AND archived_at IS NULL',
    [id],
  );
  if (!before) return;

  await execute('UPDATE stage_requirements SET archived_at = now() WHERE id = $1', [id]);
  await audit({
    actorId: actor.id,
    action: 'journey.requirement_archived',
    targetType: 'journey_stage',
    targetId: before.stage_id,
    previousValue: { kind: before.kind },
  });

  revalidatePath(`/${lang}/staff/journey`);
}

export async function updateStageAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const id = text(formData, 'stageId');
  const titleAr = text(formData, 'titleAr');
  const titleEn = text(formData, 'titleEn');
  if (!isDbConfigured() || !id || !titleAr || !titleEn) return;

  const actor = await requireCapability('members.manage');

  await execute(
    `UPDATE journey_stages
        SET title_ar = $1, title_en = $2, description_ar = $3, description_en = $4
      WHERE id = $5`,
    [titleAr, titleEn, text(formData, 'descriptionAr') || null, text(formData, 'descriptionEn') || null, id],
  );
  await audit({
    actorId: actor.id,
    action: 'journey.stage_updated',
    targetType: 'journey_stage',
    targetId: id,
  });

  revalidatePath(`/${lang}/staff/journey`);
}
