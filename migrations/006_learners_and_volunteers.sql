-- ---------------------------------------------------------------------------
-- Takaful platform - migration 006
-- Two kinds of participant, and four defects found by reviewing 003-005.
--
-- Target: PostgreSQL 14+. Additive. Safe to run twice.
-- ---------------------------------------------------------------------------

-- ===========================================================================
-- PART A - learners and volunteers
--
-- Anyone may register and take courses. The academy is universal content,
-- written for any volunteer anywhere, and earning a course certificate has
-- never required belonging to Takaful.
--
-- The journey is different. Stages, verified hours and stage certificates
-- describe someone's standing *inside this association*, and only make sense
-- for an accepted volunteer.
--
-- Migration 004 assigned a journey to everyone on registration. That was
-- wrong: it told a person who only ever wanted a course that they were on
-- Stage 1 of a volunteering path they never applied to. The trigger is
-- replaced below.
--
-- Participation is NOT a new column. It is derived from membership status,
-- which already records exactly this and is already append-only history.
-- A second source of truth would be a second thing to get out of step.
-- ===========================================================================

CREATE OR REPLACE FUNCTION is_volunteer(p_user_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
      FROM membership_status_history h
     WHERE h.user_id = p_user_id
     ORDER BY h.changed_at DESC, h.id DESC
     LIMIT 1
  ) AND (
    SELECT h.new_status IN (
      'accepted_volunteer','active_volunteer','inactive_volunteer','volunteer_alumni'
    )
      FROM membership_status_history h
     WHERE h.user_id = p_user_id
     ORDER BY h.changed_at DESC, h.id DESC
     LIMIT 1
  );
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION is_volunteer(UUID) IS
  'True once someone has been accepted as a volunteer. Learners - anyone who registered to take courses - are not volunteers and have no journey.';

-- A journey begins on acceptance, not on registration.
CREATE OR REPLACE FUNCTION assign_journey_on_acceptance() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF NEW.new_status <> 'accepted_volunteer' THEN
    RETURN NEW;
  END IF;

  -- Already walking a journey: an earlier acceptance, or an admin placed them.
  IF EXISTS (SELECT 1 FROM user_journey_assignments WHERE user_id = NEW.user_id) THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_id FROM journey_versions WHERE is_default LIMIT 1;
  IF v_id IS NOT NULL THEN
    INSERT INTO user_journey_assignments (user_id, version_id) VALUES (NEW.user_id, v_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_membership_assign_journey ON membership_status_history;
CREATE TRIGGER trg_membership_assign_journey
  AFTER INSERT ON membership_status_history
  FOR EACH ROW EXECUTE FUNCTION assign_journey_on_acceptance();

-- Remove the registration trigger from 004 and its function.
DROP TRIGGER IF EXISTS trg_users_assign_journey ON users;
DROP FUNCTION IF EXISTS assign_default_journey();

-- Withdraw journeys handed out by 004/005 to people who never applied.
-- Only assignments the system made are removed; anything an admin decided
-- (assigned_by NOT NULL) is left exactly where it is.
DELETE FROM user_journey_assignments a
 WHERE a.assigned_by IS NULL
   AND NOT is_volunteer(a.user_id);

-- ===========================================================================
-- PART B - defects found reviewing 003-005
-- ===========================================================================

-- B1. hour_allocations.user_id was copied from hour_entries with nothing
-- keeping the two in step. A wrong user_id would corrupt every stage total
-- silently. A composite foreign key makes the pair impossible to mismatch.
CREATE UNIQUE INDEX IF NOT EXISTS uq_hour_entries_id_user ON hour_entries (id, user_id);

ALTER TABLE hour_allocations DROP CONSTRAINT IF EXISTS fk_allocation_entry_user;
ALTER TABLE hour_allocations
  ADD CONSTRAINT fk_allocation_entry_user
  FOREIGN KEY (hour_entry_id, user_id) REFERENCES hour_entries (id, user_id)
  ON DELETE CASCADE;

-- B2. An allocation survived its entry being corrected.
-- hour_entries are never deleted - a correction sets the original to
-- 'corrected' and inserts a reversing row - so ON DELETE CASCADE never fired
-- and a stage requirement stayed satisfied by hours that had been reversed.
-- Releasing the allocation is the whole point of correcting the entry.
CREATE OR REPLACE FUNCTION release_allocation_on_correction() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('corrected', 'rejected') THEN
    DELETE FROM hour_allocations WHERE hour_entry_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hours_release_allocation ON hour_entries;
CREATE TRIGGER trg_hours_release_allocation
  AFTER UPDATE ON hour_entries
  FOR EACH ROW EXECUTE FUNCTION release_allocation_on_correction();

-- B3. Only verified hours may be allocated. Nothing said so, so a pending or
-- rejected entry could have counted toward a stage.
CREATE OR REPLACE FUNCTION check_allocation_is_verified() RETURNS TRIGGER AS $$
DECLARE
  s TEXT;
BEGIN
  SELECT status INTO s FROM hour_entries WHERE id = NEW.hour_entry_id;
  IF s <> 'verified' THEN
    RAISE EXCEPTION 'Only verified hours may be allocated (entry status: %)', s
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_allocation_verified_only ON hour_allocations;
CREATE TRIGGER trg_allocation_verified_only
  BEFORE INSERT ON hour_allocations
  FOR EACH ROW EXECUTE FUNCTION check_allocation_is_verified();

-- B4. A requirement could never be removed. stage_requirement_progress and
-- hour_allocations both reference it ON DELETE RESTRICT, so the moment one
-- volunteer satisfied a requirement the admin was stuck with it forever -
-- in a Journey Builder whose entire purpose is editing requirements.
--
-- Archiving is the right answer anyway: deleting a requirement would erase
-- the record of what someone was asked to do.
ALTER TABLE stage_requirements ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN stage_requirements.archived_at IS
  'Set instead of deleting. An archived requirement stops applying to new progress but stays readable, so a completed stage can still be explained.';

-- Active requirements, which is what the evaluator and the Journey Builder
-- should read almost everywhere.
CREATE OR REPLACE VIEW active_stage_requirements AS
  SELECT * FROM stage_requirements WHERE archived_at IS NULL;
