-- ---------------------------------------------------------------------------
-- Takaful platform - migration 003
-- The journey engine: configurable stages, requirements, and progress.
--
-- Target: PostgreSQL 14+. Additive only. Every statement is safe to run twice.
--
-- This is the change that stops the six-stage journey being a number in a
-- column and makes it a thing an administrator configures. Nothing here is
-- hard-coded: how many stages there are, what each requires, and how much it
-- requires are all rows.
--
-- Decisions encoded here are recorded in docs/ARCHITECTURE-DECISIONS.md.
-- ---------------------------------------------------------------------------

-- ------------------------------------------------------- journey_versions
-- A whole set of stages and requirements, frozen under a name.
--
-- Decision 2: a volunteer is pinned to one version for their whole journey.
-- If Stage 3 needs 20 hours today and 30 next year, nobody already walking
-- the path finds the ground moved under them.
CREATE TABLE IF NOT EXISTS journey_versions (
  id           UUID        NOT NULL PRIMARY KEY,
  name         TEXT        NOT NULL,
  description  TEXT        NULL,
  is_default   BOOLEAN     NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ NULL,
  created_by   UUID        NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_journey_version_name UNIQUE (name)
);

-- Exactly one version is the default that new volunteers are pinned to.
-- A partial unique index says so; two defaults is not a state to handle in
-- code, it is a state to make impossible.
CREATE UNIQUE INDEX IF NOT EXISTS uq_journey_one_default
  ON journey_versions ((true)) WHERE is_default;

-- --------------------------------------------------------- journey_stages
-- The stages of one version. Six today, because that is what the association
-- runs - not because the number is written anywhere in the code.
CREATE TABLE IF NOT EXISTS journey_stages (
  id             UUID        NOT NULL PRIMARY KEY,
  version_id     UUID        NOT NULL REFERENCES journey_versions(id) ON DELETE RESTRICT,
  number         SMALLINT    NOT NULL,
  title_ar       TEXT        NOT NULL,
  title_en       TEXT        NOT NULL,
  description_ar TEXT        NULL,
  description_en TEXT        NULL,
  icon           TEXT        NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_stage_number CHECK (number BETWEEN 1 AND 20)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_stage_number_per_version
  ON journey_stages (version_id, number);

-- ---------------------------------------------------- stage_requirements
-- What a stage demands. One row per requirement, configured by an admin.
--
-- `config` is JSONB because each kind needs different fields - a course
-- requirement names a course and a minimum score; an hours requirement names
-- a number of minutes. A column per field across every kind would be a table
-- of mostly-NULLs, and a new kind would need a migration, which is exactly
-- what this design exists to avoid.
--
-- The shape of config per kind is validated in application code and asserted
-- by the CHECK below for the fields that must always be present.
CREATE TABLE IF NOT EXISTS stage_requirements (
  id          UUID        NOT NULL PRIMARY KEY,
  stage_id    UUID        NOT NULL REFERENCES journey_stages(id) ON DELETE RESTRICT,
  kind        TEXT        NOT NULL,
  label_ar    TEXT        NOT NULL,
  label_en    TEXT        NOT NULL,
  config      JSONB       NOT NULL DEFAULT '{}'::JSONB,
  is_required BOOLEAN     NOT NULL DEFAULT true,
  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_requirement_kind CHECK (kind IN (
    'course',            -- config: { courseSlug, minScore? , minCourseVersion? }
    'hours',             -- config: { minutes }
    'assessment',        -- config: { courseSlug, passMark }
    'activity',          -- config: { activityId? , count? , area? }
    'evaluation',        -- config: { formSlug? }
    'document',          -- config: { documentKind }
    'approval'           -- config: { capability }
  )),

  -- An hours requirement without a number, or a course requirement without a
  -- course, is a configuration mistake that would silently never be satisfied.
  CONSTRAINT chk_requirement_config CHECK (
    CASE kind
      WHEN 'hours'      THEN (config ? 'minutes')
                             AND (config->>'minutes') ~ '^[0-9]+$'
                             AND (config->>'minutes')::INT > 0
      WHEN 'course'     THEN (config ? 'courseSlug')
      WHEN 'assessment' THEN (config ? 'courseSlug') AND (config ? 'passMark')
      WHEN 'document'   THEN (config ? 'documentKind')
      WHEN 'approval'   THEN (config ? 'capability')
      ELSE true
    END
  )
);

CREATE INDEX IF NOT EXISTS idx_requirements_stage
  ON stage_requirements (stage_id, sort_order, id);

-- ------------------------------------------------ user_journey_assignment
-- Which version a volunteer walks. Decision 2: set once, movable only by an
-- admin with a reason.
CREATE TABLE IF NOT EXISTS user_journey_assignment (
  user_id     UUID        NOT NULL PRIMARY KEY REFERENCES users(id) ON DELETE RESTRICT,
  version_id  UUID        NOT NULL REFERENCES journey_versions(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID        NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason      TEXT        NULL,
  -- Moving someone between versions is a decision about a person, so it
  -- carries a reason for the same reason every other such decision does.
  CONSTRAINT chk_assignment_reason CHECK (assigned_by IS NULL OR reason IS NOT NULL)
);

-- ------------------------------------------- stage_requirement_progress
-- APPEND-ONLY record of a requirement being satisfied.
--
-- Decision 3: a satisfied requirement stays satisfied. Adding a requirement
-- to a stage never un-completes what someone already finished.
--
-- Most requirements are satisfied by deriving from other tables - a course
-- pass, an hours total. This table records the moment it became true, so the
-- journey can be reconstructed as it was, and so an approval or an evaluation
-- (which have no other home) have somewhere to live.
CREATE TABLE IF NOT EXISTS stage_requirement_progress (
  id             BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  requirement_id UUID        NOT NULL REFERENCES stage_requirements(id) ON DELETE RESTRICT,
  satisfied_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Who confirmed it, where a human did. NULL means the system derived it.
  confirmed_by   UUID        NULL REFERENCES users(id) ON DELETE RESTRICT,
  evidence       JSONB       NULL,
  note           TEXT        NULL,
  CONSTRAINT chk_srp_no_self_confirm CHECK (confirmed_by IS NULL OR confirmed_by <> user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_srp_once
  ON stage_requirement_progress (user_id, requirement_id);
CREATE INDEX IF NOT EXISTS idx_srp_user ON stage_requirement_progress (user_id);

-- --------------------------------------------------------- hour_allocations
-- Decision 1: a verified hour is allocated to at most one hours-requirement.
--
-- Without this, one hour could satisfy every stage at once and the journey
-- would mean nothing. The unique index on hour_entry_id is what makes
-- "at most one" true rather than merely intended.
CREATE TABLE IF NOT EXISTS hour_allocations (
  id             BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hour_entry_id  UUID        NOT NULL REFERENCES hour_entries(id) ON DELETE CASCADE,
  requirement_id UUID        NOT NULL REFERENCES stage_requirements(id) ON DELETE RESTRICT,
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  minutes        INTEGER     NOT NULL,
  allocated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_allocation_positive CHECK (minutes > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_allocation_one_per_entry
  ON hour_allocations (hour_entry_id);
CREATE INDEX IF NOT EXISTS idx_allocation_requirement
  ON hour_allocations (requirement_id, user_id);
CREATE INDEX IF NOT EXISTS idx_allocation_user ON hour_allocations (user_id);

-- Minutes allocated per requirement, so the evaluator and the progress bar
-- read the same number from the same place.
CREATE OR REPLACE VIEW allocated_minutes AS
  SELECT user_id, requirement_id, COALESCE(SUM(minutes), 0)::BIGINT AS minutes
    FROM hour_allocations
   GROUP BY user_id, requirement_id;

-- ------------------------------------------------------------- updated_at
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['journey_versions','journey_stages','stage_requirements'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Seed: the association's current six stages, as Journey Version 2026.
--
-- Requirements are deliberately left empty. They are configured by an admin in
-- the Journey Builder - inventing hour thresholds here would hard-code exactly
-- what this migration exists to make configurable.
--
-- Guarded so re-running changes nothing.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_id UUID;
  stage_titles TEXT[][] := ARRAY[
    ARRAY['التعرّف والانضمام',       'Joining and orientation'],
    ARRAY['التواصل والمشاركة',       'Communication and participation'],
    ARRAY['العمل الميداني',          'Field work'],
    ARRAY['قيادة الفريق',            'Team leadership'],
    ARRAY['تنسيق المشاريع',          'Project coordination'],
    ARRAY['الإرشاد والتخرّج',        'Mentoring and graduation']
  ];
  i INT;
BEGIN
  IF EXISTS (SELECT 1 FROM journey_versions) THEN
    RETURN;
  END IF;

  v_id := gen_random_uuid();
  INSERT INTO journey_versions (id, name, description, is_default, published_at)
  VALUES (
    v_id,
    'Journey 2026',
    'The six-stage volunteer journey as run by the association in 2026.',
    true,
    now()
  );

  FOR i IN 1..6 LOOP
    INSERT INTO journey_stages (id, version_id, number, title_ar, title_en)
    VALUES (gen_random_uuid(), v_id, i, stage_titles[i][1], stage_titles[i][2]);
  END LOOP;

  -- Everyone who already exists walks this version. Nobody is left without a
  -- journey just because they registered before the engine did.
  INSERT INTO user_journey_assignment (user_id, version_id)
  SELECT id, v_id FROM users
  ON CONFLICT (user_id) DO NOTHING;
END $$;
