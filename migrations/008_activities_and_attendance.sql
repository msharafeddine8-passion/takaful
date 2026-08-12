-- ---------------------------------------------------------------------------
-- Takaful platform - migration 008
-- Activities, registration, attendance, and attendance that becomes hours.
--
-- Target: PostgreSQL 14+. Additive. Safe to run twice.
--
-- The activities table has existed since 002 with no way to register for one.
-- This adds the rest of the loop: a volunteer joins an activity, attends, a
-- supervisor confirms, and the hours land in the ledger where the journey
-- engine can already see them.
--
-- It also settles a conflict I created. Architecture decision 7 said nobody
-- may verify hours for an activity they led. That is the right instinct
-- against inflating your own activity's numbers, but taken literally it
-- forbids the only workable flow: the supervisor who was there is the person
-- who knows who turned up. The rule becomes organisation policy - either a
-- supervisor's confirmation verifies, or it produces pending hours needing a
-- second pair of eyes. Small associations can run the first; the second exists
-- for when that stops being appropriate.
-- ---------------------------------------------------------------------------

-- ------------------------------------------------------------- org_settings
-- Policy an admin can change without a deploy. One row.
CREATE TABLE IF NOT EXISTS org_settings (
  id                          BOOLEAN     NOT NULL PRIMARY KEY DEFAULT true,
  hours_require_second_check  BOOLEAN     NOT NULL DEFAULT false,
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_org_settings_singleton CHECK (id)
);

INSERT INTO org_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

COMMENT ON COLUMN org_settings.hours_require_second_check IS
  'When true, a supervisor confirming attendance produces pending hours that someone else must verify. When false, confirmation verifies them.';

-- --------------------------------------------------------------- activities
-- Extend what 002 created rather than replacing it.
ALTER TABLE activities ADD COLUMN IF NOT EXISTS description_ar TEXT NULL;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS description_en TEXT NULL;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS location TEXT NULL;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ NULL;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ NULL;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS capacity INTEGER NULL;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS min_stage SMALLINT NULL;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS led_by UUID NULL REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS is_open BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE activities DROP CONSTRAINT IF EXISTS chk_activities_times;
ALTER TABLE activities ADD CONSTRAINT chk_activities_times
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at);

ALTER TABLE activities DROP CONSTRAINT IF EXISTS chk_activities_capacity;
ALTER TABLE activities ADD CONSTRAINT chk_activities_capacity
  CHECK (capacity IS NULL OR capacity > 0);

ALTER TABLE activities DROP CONSTRAINT IF EXISTS chk_activities_min_stage;
ALTER TABLE activities ADD CONSTRAINT chk_activities_min_stage
  CHECK (min_stage IS NULL OR min_stage BETWEEN 1 AND 20);

CREATE INDEX IF NOT EXISTS idx_activities_upcoming
  ON activities (starts_at) WHERE is_open AND NOT is_archived;

-- ------------------------------------------------- activity_registrations
-- Who signed up, and what became of it.
CREATE TABLE IF NOT EXISTS activity_registrations (
  id            UUID        NOT NULL PRIMARY KEY,
  activity_id   UUID        NOT NULL REFERENCES activities(id) ON DELETE RESTRICT,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status        TEXT        NOT NULL DEFAULT 'registered',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at  TIMESTAMPTZ NULL,
  cancel_reason TEXT        NULL,
  CONSTRAINT chk_registration_status CHECK (status IN ('registered','waitlisted','cancelled')),
  CONSTRAINT chk_registration_cancelled CHECK (
    status <> 'cancelled' OR cancelled_at IS NOT NULL
  )
);

-- One live registration per person per activity. Cancelled ones do not block
-- signing up again, so someone who changes their mind twice is not stuck.
CREATE UNIQUE INDEX IF NOT EXISTS uq_registration_live
  ON activity_registrations (activity_id, user_id)
  WHERE status <> 'cancelled';

CREATE INDEX IF NOT EXISTS idx_registration_activity
  ON activity_registrations (activity_id, status);
CREATE INDEX IF NOT EXISTS idx_registration_user
  ON activity_registrations (user_id, registered_at DESC);

-- Places taken, so the listing and the registration check read one number.
CREATE OR REPLACE VIEW activity_places AS
  SELECT a.id AS activity_id,
         a.capacity,
         count(r.id) FILTER (WHERE r.status = 'registered')::INT AS taken,
         count(r.id) FILTER (WHERE r.status = 'waitlisted')::INT AS waiting
    FROM activities a
    LEFT JOIN activity_registrations r ON r.activity_id = a.id
   GROUP BY a.id, a.capacity;

-- ---------------------------------------------------- activity_attendance
-- What the supervisor recorded on the day. APPEND-ONLY in spirit: a mistake
-- is corrected through the hours ledger, which already knows how.
CREATE TABLE IF NOT EXISTS activity_attendance (
  id            UUID        NOT NULL PRIMARY KEY,
  activity_id   UUID        NOT NULL REFERENCES activities(id) ON DELETE RESTRICT,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  attended      BOOLEAN     NOT NULL,
  minutes       INTEGER     NULL,
  confirmed_by  UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  confirmed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  note          TEXT        NULL,
  -- The hours this produced, so the two can never be reconciled by guesswork.
  hour_entry_id UUID        NULL REFERENCES hour_entries(id) ON DELETE SET NULL,

  CONSTRAINT chk_attendance_minutes CHECK (
    (NOT attended AND minutes IS NULL) OR (attended AND minutes > 0 AND minutes <= 1440)
  ),
  -- Nobody records their own attendance.
  CONSTRAINT chk_attendance_no_self CHECK (confirmed_by <> user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_once
  ON activity_attendance (activity_id, user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_activity ON activity_attendance (activity_id);

-- ---------------------------------------------------------- hour_entries
-- Times, so overlapping entries can be detected. 002 recorded a date only,
-- which meant the same afternoon could be logged twice and nothing noticed.
ALTER TABLE hour_entries ADD COLUMN IF NOT EXISTS started_at TIME NULL;
ALTER TABLE hour_entries ADD COLUMN IF NOT EXISTS ended_at   TIME NULL;

ALTER TABLE hour_entries DROP CONSTRAINT IF EXISTS chk_hours_times;
ALTER TABLE hour_entries ADD CONSTRAINT chk_hours_times
  CHECK (
    (started_at IS NULL AND ended_at IS NULL)
    OR (started_at IS NOT NULL AND ended_at IS NOT NULL AND ended_at > started_at)
  );

-- Overlap is a warning, not a refusal: a volunteer may genuinely have run two
-- things at once, and refusing outright would have them log nothing at all.
-- The function tells the caller; the caller decides what to say.
CREATE OR REPLACE FUNCTION overlapping_hours(
  p_user_id UUID, p_date DATE, p_start TIME, p_end TIME, p_exclude UUID DEFAULT NULL
) RETURNS TABLE (id UUID, started_at TIME, ended_at TIME, minutes INTEGER) AS $$
  SELECT h.id, h.started_at, h.ended_at, h.minutes
    FROM hour_entries h
   WHERE h.user_id = p_user_id
     AND h.worked_on = p_date
     AND h.status IN ('pending', 'verified')
     AND h.started_at IS NOT NULL
     AND (p_exclude IS NULL OR h.id <> p_exclude)
     AND h.started_at < p_end
     AND h.ended_at   > p_start;
$$ LANGUAGE sql STABLE;
