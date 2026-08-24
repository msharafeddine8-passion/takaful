-- Impact points: a ledger, not a counter.
--
-- The requirement that shapes everything here is that a point must never be
-- awarded twice for the same thing, and must never be quietly removed when the
-- thing it came from changes. A running total in a column can do neither: it
-- cannot say what it is made of, so it cannot be checked, and a correction to
-- somebody's hours would either be missed or would silently rewrite history.
--
-- So every point has a row saying where it came from, and corrections are new
-- rows pointing at the old ones. Nothing is ever deleted. The total is a view.
--
-- Points are recognition, not assessment. Nothing here reads or writes
-- anything about acceptance, suspension or discipline, and no row may ever be
-- created without a source that can be audited back to a verified fact.

CREATE TABLE IF NOT EXISTS impact_points (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Positive to award, negative to take back. Never zero: a row that changes
  -- nothing is noise in a ledger somebody has to read.
  points        INTEGER NOT NULL,

  -- What earned it. 'manual' is the only kind a person may create directly.
  source_kind   TEXT NOT NULL,
  -- The row in that source. Null only for the kinds that are about a period
  -- rather than a record — an active month has no single row behind it.
  source_id     TEXT,
  -- The period a period-based award belongs to, as YYYY-MM. Part of the
  -- uniqueness rule, so a month cannot be counted twice.
  period        TEXT,

  -- 'award' is the ordinary case. 'correction' adjusts an earlier row when its
  -- source changed; 'reversal' takes one back entirely — a revoked
  -- certificate, hours that turned out not to have been worked.
  entry_kind    TEXT NOT NULL DEFAULT 'award',
  -- Which row this corrects or reverses. Required for both, refused otherwise.
  corrects_id   BIGINT REFERENCES impact_points(id),

  -- When the person earned it, which is not when the row was written. A
  -- backfill run today for hours verified in March belongs to March, or every
  -- monthly table would show one enormous month.
  earned_on     DATE NOT NULL,

  reason        TEXT,
  -- Null when a rule did it. A person's id when a person did.
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_points_nonzero CHECK (points <> 0),

  CONSTRAINT chk_points_kind CHECK (source_kind IN (
    'hours',            -- verified minutes, apportioned per month
    'attendance',       -- one confirmed attendance
    'certificate',      -- one active course certificate
    'level_challenge',  -- a level challenge passed
    'stage',            -- reaching a stage
    'programme',        -- finishing the whole path
    'active_month',     -- a month with any verified activity or hours
    'commitment',       -- attended everything registered for, in a month
    'manual'            -- a person, with a reason
  )),

  CONSTRAINT chk_points_entry CHECK (entry_kind IN ('award', 'correction', 'reversal')),

  -- A correction or a reversal has to say what it is correcting; an award
  -- must not, or the ledger stops being readable as a chain.
  CONSTRAINT chk_points_corrects CHECK (
    (entry_kind = 'award' AND corrects_id IS NULL)
    OR (entry_kind IN ('correction', 'reversal') AND corrects_id IS NOT NULL)
  ),

  -- Anything a person did by hand carries their name and their reason. This is
  -- the only kind that can be created without a source record, so it is the
  -- only one where the reason IS the evidence.
  CONSTRAINT chk_points_manual CHECK (
    source_kind <> 'manual'
    OR (created_by IS NOT NULL AND reason IS NOT NULL AND length(btrim(reason)) >= 10)
  ),

  -- Nobody awards themselves.
  CONSTRAINT chk_points_no_self_award CHECK (created_by IS NULL OR created_by <> user_id),

  -- The period-based kinds need a period; the record-based kinds need an id.
  CONSTRAINT chk_points_period CHECK (
    (source_kind IN ('active_month', 'commitment') AND period ~ '^\d{4}-\d{2}$')
    OR (source_kind NOT IN ('active_month', 'commitment'))
  ),
  CONSTRAINT chk_points_source_id CHECK (
    source_kind IN ('active_month', 'commitment', 'manual') OR source_id IS NOT NULL
  )
);

-- The rule that makes double-counting impossible.
--
-- One award per source record per person. Corrections and reversals are
-- excluded because there can be several of those against one original — an
-- hours figure can be revised more than once — and they are already tied to
-- the row they adjust.
--
-- COALESCE rather than a partial index per shape: a null in a unique index is
-- distinct from every other null, so two 'active_month' rows with no source_id
-- would both be allowed.
CREATE UNIQUE INDEX IF NOT EXISTS uq_points_source_once
  ON impact_points (user_id, source_kind, COALESCE(source_id, ''), COALESCE(period, ''))
  WHERE entry_kind = 'award';

CREATE INDEX IF NOT EXISTS ix_points_user_earned ON impact_points (user_id, earned_on);
CREATE INDEX IF NOT EXISTS ix_points_earned ON impact_points (earned_on);

-- The total, and the only place anything should read it from.
CREATE OR REPLACE VIEW impact_totals AS
  SELECT user_id, COALESCE(SUM(points), 0)::BIGINT AS points
    FROM impact_points GROUP BY user_id;

-- ------------------------------------------------------------------ badges

-- The existing achievements table already carries earned_at, revoked_at and a
-- revoke reason, which is most of what a badge needs. What it cannot say is
-- where a badge came from, or whether a rule or a person granted it.
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS granted_by UUID REFERENCES users(id);
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS grant_reason TEXT;
-- True when the rules engine granted it, false when a person did. Existing
-- rows are all from the engine, which is what the default records.
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS automatic BOOLEAN NOT NULL DEFAULT TRUE;

-- A badge a person granted carries their name and their reason, for the same
-- reason a manual point does.
ALTER TABLE achievements DROP CONSTRAINT IF EXISTS chk_achievement_manual;
ALTER TABLE achievements ADD CONSTRAINT chk_achievement_manual CHECK (
  automatic
  OR (granted_by IS NOT NULL AND granted_by <> user_id
      AND grant_reason IS NOT NULL AND length(btrim(grant_reason)) >= 10)
);

-- One live badge of each code per person. Revoked ones stay, which is why the
-- index is partial: history is kept, and re-earning after a revocation is a
-- new row rather than an edit to the old one.
CREATE UNIQUE INDEX IF NOT EXISTS uq_achievement_live_once
  ON achievements (user_id, code) WHERE revoked_at IS NULL;

-- ----------------------------------------------------------- notifications

-- Two new kinds. Nothing else may be announced by this system: a leaderboard
-- position that moves every time somebody else logs an hour is not news.
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS chk_notification_kind;
ALTER TABLE notifications ADD CONSTRAINT chk_notification_kind CHECK (kind IN (
  'application.accepted', 'application.waitlisted', 'application.rejected',
  'hours.verified', 'hours.rejected', 'hours.corrected',
  'stage.unlocked', 'stage.completed',
  'certificate.issued',
  'activity.reminder', 'activity.registered', 'activity.attended', 'activity.scheduled',
  'course.available', 'account.welcome',
  'badge.earned', 'milestone.reached'
));
