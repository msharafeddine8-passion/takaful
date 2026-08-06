-- ---------------------------------------------------------------------------
-- Takaful platform - migration 002
-- Volunteer hours, the six-stage journey, and certificates.
--
-- Target: PostgreSQL 14+. Every statement is safe to run twice.
--
-- The hours ledger is the reason this schema is careful. Hours become
-- certificates, certificates go on CVs, and a volunteer may one day ask us to
-- prove a figure years after the fact. So: nothing is ever edited in place,
-- every entry names who verified it, and a correction is a new row that
-- points at the one it corrects.
-- ---------------------------------------------------------------------------

-- ------------------------------------------------------------------ activities
-- What hours are logged against. Kept deliberately thin: this is not a
-- project management system, it is a label with a date on it.
CREATE TABLE IF NOT EXISTS activities (
  id          UUID        NOT NULL PRIMARY KEY,
  title_ar    TEXT        NOT NULL,
  title_en    TEXT        NOT NULL,
  area        TEXT        NULL,     -- matches the site's five areas, loosely
  starts_on   DATE        NULL,
  ends_on     DATE        NULL,
  is_archived BOOLEAN     NOT NULL DEFAULT false,
  created_by  UUID        NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_activities_dates CHECK (ends_on IS NULL OR starts_on IS NULL OR ends_on >= starts_on)
);

CREATE INDEX IF NOT EXISTS idx_activities_open ON activities (is_archived, starts_on DESC);

-- -------------------------------------------------------------- hour_entries
-- APPEND-ONLY. A mistake is corrected by inserting a reversing entry, never
-- by editing or deleting, so a total can always be recomputed from scratch
-- and explained line by line.
CREATE TABLE IF NOT EXISTS hour_entries (
  id            UUID        NOT NULL PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  activity_id   UUID        NULL REFERENCES activities(id) ON DELETE RESTRICT,
  worked_on     DATE        NOT NULL,
  minutes       INTEGER     NOT NULL,
  note          TEXT        NULL,
  status        TEXT        NOT NULL DEFAULT 'pending',
  verified_by   UUID        NULL REFERENCES users(id) ON DELETE RESTRICT,
  verified_at   TIMESTAMPTZ NULL,
  reject_reason TEXT        NULL,
  -- A correction points at the entry it reverses. Both rows stay.
  corrects_id   UUID        NULL REFERENCES hour_entries(id) ON DELETE RESTRICT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_hours_status CHECK (status IN ('pending','verified','rejected','corrected')),
  -- Ordinary entries are positive; only a correction may be negative.
  CONSTRAINT chk_hours_minutes CHECK (
    (corrects_id IS NULL AND minutes > 0 AND minutes <= 1440)
    OR (corrects_id IS NOT NULL AND minutes <> 0 AND minutes >= -1440 AND minutes <= 1440)
  ),
  -- Nobody may verify their own hours.
  CONSTRAINT chk_hours_no_self_verify CHECK (verified_by IS NULL OR verified_by <> user_id),
  -- A decision must say who made it and when.
  CONSTRAINT chk_hours_decision CHECK (
    status NOT IN ('verified','rejected')
    OR (verified_by IS NOT NULL AND verified_at IS NOT NULL)
  ),
  -- A rejection must say why.
  CONSTRAINT chk_hours_reject_reason CHECK (status <> 'rejected' OR reject_reason IS NOT NULL),
  CONSTRAINT chk_hours_not_future CHECK (worked_on <= CURRENT_DATE + 1)
);

CREATE INDEX IF NOT EXISTS idx_hours_user ON hour_entries (user_id, worked_on DESC);
CREATE INDEX IF NOT EXISTS idx_hours_queue ON hour_entries (status, created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_hours_activity ON hour_entries (activity_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_hours_one_correction ON hour_entries (corrects_id) WHERE corrects_id IS NOT NULL;

-- A volunteer's verified total, in minutes. One place computes it, so the
-- dashboard, the certificate and any report can never disagree.
CREATE OR REPLACE VIEW verified_minutes AS
  SELECT user_id, COALESCE(SUM(minutes), 0)::BIGINT AS minutes
    FROM hour_entries
   WHERE status = 'verified'
   GROUP BY user_id;

-- -------------------------------------------------------------- stage_progress
-- The six-stage volunteer journey. APPEND-ONLY, same reasoning as the
-- membership history: we must be able to say what was true last spring.
CREATE TABLE IF NOT EXISTS stage_progress (
  id         BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  stage      SMALLINT    NOT NULL,
  reached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  awarded_by UUID        NULL REFERENCES users(id) ON DELETE RESTRICT, -- NULL means the system
  note       TEXT        NULL,
  CONSTRAINT chk_stage_range CHECK (stage BETWEEN 1 AND 6),
  CONSTRAINT chk_stage_no_self_award CHECK (awarded_by IS NULL OR awarded_by <> user_id)
);

-- A stage is reached once.
CREATE UNIQUE INDEX IF NOT EXISTS uq_stage_once ON stage_progress (user_id, stage);
CREATE INDEX IF NOT EXISTS idx_stage_user ON stage_progress (user_id, stage DESC);

-- ------------------------------------------------------------- certificates
-- Issued for a finished course or an hours milestone. The code is what a
-- third party types into the public verification page, so it is short,
-- unguessable, and unique.
CREATE TABLE IF NOT EXISTS certificates (
  id            UUID        NOT NULL PRIMARY KEY,
  code          TEXT        NOT NULL,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  kind          TEXT        NOT NULL,
  course_slug   TEXT        NULL,
  hours_at_issue INTEGER    NULL,
  issued_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at    TIMESTAMPTZ NULL,
  revoke_reason TEXT        NULL,
  -- Frozen at issue: the holder's name and the title, so a later profile
  -- edit cannot change what a already-issued certificate says.
  snapshot      JSONB       NOT NULL,

  CONSTRAINT chk_cert_kind CHECK (kind IN ('course','hours')),
  CONSTRAINT chk_cert_course CHECK (kind <> 'course' OR course_slug IS NOT NULL),
  CONSTRAINT chk_cert_hours CHECK (kind <> 'hours' OR hours_at_issue IS NOT NULL),
  CONSTRAINT chk_cert_revoke_reason CHECK (revoked_at IS NULL OR revoke_reason IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_cert_code ON certificates (code);
CREATE INDEX IF NOT EXISTS idx_cert_user ON certificates (user_id, issued_at DESC);
-- A course certificate is issued once per person per course.
CREATE UNIQUE INDEX IF NOT EXISTS uq_cert_course_once
  ON certificates (user_id, course_slug) WHERE kind = 'course';

-- ------------------------------------------------------------- course_progress
-- Which courses someone has completed, and with what score.
CREATE TABLE IF NOT EXISTS course_progress (
  id           BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  course_slug  TEXT        NOT NULL,
  score        SMALLINT    NULL,
  passed       BOOLEAN     NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ NULL,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_course_score CHECK (score IS NULL OR (score BETWEEN 0 AND 100)),
  CONSTRAINT chk_course_passed CHECK (NOT passed OR (score IS NOT NULL AND completed_at IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_course_progress ON course_progress (user_id, course_slug);
CREATE INDEX IF NOT EXISTS idx_course_progress_user ON course_progress (user_id);

-- ---------------------------------------------------------------- updated_at
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['activities'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;
