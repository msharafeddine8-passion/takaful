-- ---------------------------------------------------------------------------
-- Takaful platform - migration 005
-- Journey assignment becomes append-only history.
--
-- 003 stored one row per user, so moving someone between journey versions
-- overwrote the record of which version they had been on. That breaks a
-- principle this codebase holds everywhere else: anything that could appear in
-- an external report is append-only.
--
-- Journey version is squarely that. A certificate says "Stage 3 completed";
-- the obvious next question is "under which requirements?" - and with an
-- overwritten row there is no answer. Membership status already works this
-- way. So does the hours ledger. This now matches.
--
-- Caught by probing rather than by review: the probe tried to move someone and
-- hit a primary key, which is what a design mistake looks like from the
-- outside.
-- ---------------------------------------------------------------------------

-- The new shape: many rows per user, current is the newest.
CREATE TABLE IF NOT EXISTS user_journey_assignments (
  id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  version_id  UUID        NOT NULL REFERENCES journey_versions(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID        NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason      TEXT        NULL,
  -- A move decided by a person carries a reason. The first assignment is made
  -- by the system on registration and has neither.
  CONSTRAINT chk_assignment_reason CHECK (assigned_by IS NULL OR reason IS NOT NULL),
  CONSTRAINT chk_assignment_no_self CHECK (assigned_by IS NULL OR assigned_by <> user_id)
);

CREATE INDEX IF NOT EXISTS idx_journey_assignment_user
  ON user_journey_assignments (user_id, assigned_at DESC, id DESC);

-- Carry over whatever 003 and 004 recorded.
INSERT INTO user_journey_assignments (user_id, version_id, assigned_at, assigned_by, reason)
SELECT user_id, version_id, assigned_at, assigned_by, reason
  FROM user_journey_assignment
 WHERE NOT EXISTS (
   SELECT 1 FROM user_journey_assignments n WHERE n.user_id = user_journey_assignment.user_id
 );

-- The current assignment, in one place, so no caller has to remember the
-- "newest row wins" rule.
CREATE OR REPLACE VIEW current_journey_assignment AS
  SELECT DISTINCT ON (user_id)
         user_id, version_id, assigned_at, assigned_by, reason
    FROM user_journey_assignments
   ORDER BY user_id, assigned_at DESC, id DESC;

-- Point the registration trigger at the new table.
CREATE OR REPLACE FUNCTION assign_default_journey() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM journey_versions WHERE is_default LIMIT 1;
  IF v_id IS NOT NULL THEN
    INSERT INTO user_journey_assignments (user_id, version_id) VALUES (NEW.id, v_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_assign_journey ON users;
CREATE TRIGGER trg_users_assign_journey
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION assign_default_journey();

-- The old single-row table is left in place, empty of purpose but not dropped:
-- a migration that destroys a table is a migration that cannot be undone by
-- deploying the previous release. It is removed in a later migration once this
-- one has been running unremarkably.
COMMENT ON TABLE user_journey_assignment IS
  'Superseded by user_journey_assignments (migration 005). Retained until the next release; do not write to it.';
