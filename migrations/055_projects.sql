-- ---------------------------------------------------------------------------
-- Takaful platform - migration 055
-- The four projects, out of the dictionary and into a table.
--
-- Additive and safe to run twice.
--
-- They have been literals in ar.ts and en.ts, which means launching a project
-- needs a developer, a commit and a deploy — and means nothing else in the
-- platform can point at one. No role can say "ran مسارك", no activity can
-- belong to a project, no figure can be about one.
--
-- THERE IS NO project_manager_id, AND THAT IS THE WHOLE DESIGN
--
-- The brief asks for a project manager and for FORMER project managers, and
-- names the case exactly: «أحمد — المسؤول السابق للمشروع».
--
-- A manager column cannot hold both. Appointing a successor would be an UPDATE
-- that erases a predecessor — one line that quietly deletes the fact that
-- somebody ran this project for two years. Migration 046 exists to stop that,
-- and migration 054 refused the same column for committees.
--
-- So who runs a project is a volunteer_role with entity_kind = 'project' and
-- entity_id pointing here, exactly as committee membership is. Appointing a
-- successor adds a role and closes one, and «المسؤولون السابقون» is a query
-- over the rows nobody deleted.
--
-- chk_vr_entity_resolvable, added by 054, deliberately did not list 'project'
-- because there was no table to point at. Extending it is the last thing this
-- migration does — and doing it here rather than earlier is why the first
-- linked project role could not have been written against nothing.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS projects (
  id           UUID        NOT NULL PRIMARY KEY,
  -- Stable, and the public URL. /projects lists these today by array index.
  slug         TEXT        NOT NULL UNIQUE,

  name_ar      TEXT        NOT NULL,
  name_en      TEXT        NOT NULL DEFAULT '',
  -- The short label above the name on the cards: 'تعليم وإرشاد', 'تشغيل'.
  tag_ar       TEXT        NULL,
  tag_en       TEXT        NULL,
  summary_ar   TEXT        NOT NULL DEFAULT '',
  summary_en   TEXT        NOT NULL DEFAULT '',

  /*
   * 'live' or 'soon' today, because that is the distinction the page already
   * draws. TEXT and not an enum: a project that paused, or finished and is
   * worth still showing, is a state this association will meet before anybody
   * ships a migration for it.
   */
  status       TEXT        NOT NULL DEFAULT 'live',

  /*
   * When it ran. Nullable and with the same precision idea as a role, because
   * a project that started "sometime in 2021" is the normal case and a schema
   * demanding a day gets an invented one it then prints as fact.
   */
  started_on   DATE        NULL,
  started_prec TEXT        NOT NULL DEFAULT 'day',
  ended_on     DATE        NULL,
  ended_prec   TEXT        NOT NULL DEFAULT 'day',

  -- A stored image reference, like profile_photos. Null until one is uploaded.
  logo_ref     TEXT        NULL,

  is_published BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order   INTEGER     NOT NULL DEFAULT 0,

  archived_at  TIMESTAMPTZ NULL,
  archived_by  UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  archive_reason TEXT      NULL,

  created_by   UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by   UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_pr_slug  CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,60}$'),
  CONSTRAINT chk_pr_name  CHECK (length(btrim(name_ar)) > 0),
  CONSTRAINT chk_pr_prec  CHECK (started_prec IN ('day','month','year')
                             AND ended_prec   IN ('day','month','year')),
  CONSTRAINT chk_pr_order CHECK (started_on IS NULL OR ended_on IS NULL
                             OR ended_on >= started_on),
  CONSTRAINT chk_pr_archived CHECK (
    (archived_at IS NULL) = (archived_by IS NULL)
    AND (archived_at IS NULL
         OR (archive_reason IS NOT NULL AND length(btrim(archive_reason)) > 0))
  )
);

CREATE INDEX IF NOT EXISTS idx_pr_shown
  ON projects (sort_order, name_ar) WHERE is_published AND archived_at IS NULL;

/*
 * Seeded with exactly what /projects shows today, in its order.
 *
 * Same rule as migration 053: the deploy that ships this must change nothing a
 * visitor sees. A migration whose side effect is the association's project
 * list quietly changing is a migration that edited a public statement without
 * anybody deciding to.
 *
 * The English is carried across from en.ts alongside the Arabic — the two
 * files are edited in lockstep and the seed has to be too, or the English page
 * silently falls back to Arabic names.
 */
INSERT INTO projects (id, slug, name_ar, name_en, tag_ar, tag_en, summary_ar, summary_en, status, sort_order)
VALUES
  (gen_random_uuid(), 'masarak', 'مسارك', 'Masarak',
   'تعليم وإرشاد', 'Education and guidance',
   'إرشاد أكاديمي ومهني لطلاب الثانوية: استكشاف الجامعات والاختصاصات، التوجيه الأكاديمي، معلومات المنح، بناء السيرة الذاتية، وروابط مباشرة مع جامعات موثّقة.',
   '', 'live', 1),
  (gen_random_uuid(), 'skillsup', 'SkillsUp', 'SkillsUp',
   'تدريب مهني', 'Vocational training',
   'تدريب مهني يزوّد الشباب بمهارات عملية تتوافق مع حاجات سوق العمل: مهارات رقمية، جاهزية مهنية، وتجارب تعلّم تطبيقية.',
   '', 'soon', 2),
  (gen_random_uuid(), 'welink', 'WeLink', 'WeLink',
   'تشغيل', 'Employment',
   'جسر بين الخرّيجين وسوق العمل عبر التدريب والإرشاد المهني ودعم الجاهزية للتوظيف — يربط التعليم بالفرص والمهارات بحاجات السوق.',
   '', 'soon', 3),
  (gen_random_uuid(), 'passion', 'Passion', 'Passion',
   'تمكين اقتصادي', 'Economic empowerment',
   'شركة تسويق رقمي يقودها الشباب: تدريب على التسويق وصناعة المحتوى والتصوير والإنتاج، وخلق وظائف حقيقية، ودعم استدامة مشاريع الجمعية.',
   '', 'live', 4)
ON CONFLICT (slug) DO NOTHING;

/*
 * A figure can now be about one project rather than about the association.
 *
 * Reusing impact_numbers rather than adding project_impact_numbers, for the
 * reason 054 refused committee_members: a second table would be a second set
 * of the same columns with the same rules, and one of them would go stale.
 * NULL means the association as a whole, which is every row seeded by 053.
 */
ALTER TABLE impact_numbers
  ADD COLUMN IF NOT EXISTS project_id UUID NULL REFERENCES projects(id) ON DELETE RESTRICT;

/*
 * `key` was UNIQUE across the whole table, which stops two projects each
 * having a figure called 'beneficiaries'. Unique per project instead, with a
 * partial index for the association-wide rows because NULL is not equal to
 * itself and a plain unique constraint would let duplicates through.
 */
ALTER TABLE impact_numbers DROP CONSTRAINT IF EXISTS impact_numbers_key_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_in_key_project
  ON impact_numbers (project_id, key) WHERE project_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_in_key_association
  ON impact_numbers (key) WHERE project_id IS NULL;

/*
 * And now a role may point at a project.
 *
 * 054 wrote this constraint without 'project' because there was no table. This
 * is the extension it named — and the reason it was worth constraining at all:
 * had the kind been free, roles pointing at projects would have been written
 * for a year against nothing, and this migration would have had no way to tell
 * which strings were meant to be this table.
 */
ALTER TABLE volunteer_roles DROP CONSTRAINT IF EXISTS chk_vr_entity_resolvable;
ALTER TABLE volunteer_roles ADD CONSTRAINT chk_vr_entity_resolvable CHECK (
  entity_id IS NULL OR entity_kind IN ('group', 'activity', 'project')
);

CREATE OR REPLACE FUNCTION refuse_deleting_projects()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF takaful_delete_allowed() THEN RETURN OLD; END IF;
  RAISE EXCEPTION 'A project is archived, never deleted (slug %)', OLD.slug
    USING HINT = 'Roles point at it, and those roles are people''s records of '
                 'having run it. To take it off the site, set is_published = false.';
END;
$$;

DROP TRIGGER IF EXISTS trg_projects_no_delete ON projects;
CREATE TRIGGER trg_projects_no_delete
  BEFORE DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION refuse_deleting_projects();

DROP TRIGGER IF EXISTS trg_projects_touch ON projects;
CREATE TRIGGER trg_projects_touch
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
