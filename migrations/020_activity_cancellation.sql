-- ---------------------------------------------------------------------------
-- Takaful platform - migration 020
-- Cancelling an activity, and a deadline for registering for one.
--
-- Additive and safe to run twice. No existing column changes meaning and no
-- row is rewritten: every activity that exists today comes out of this
-- migration with cancelled_at NULL, which reads as "not cancelled" — exactly
-- what it is.
--
-- Until now the only way to stop an activity was is_open = false, which says
-- "you can no longer register" and nothing about whether the thing is still
-- happening. Those are different facts and volunteers need both: registration
-- closing early is ordinary, an activity being called off is not.
-- ---------------------------------------------------------------------------

ALTER TABLE activities ADD COLUMN IF NOT EXISTS cancelled_at   TIMESTAMPTZ NULL;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS cancel_reason  TEXT        NULL;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS cancelled_by   UUID        NULL
  REFERENCES users(id) ON DELETE SET NULL;

/*
 * A cancellation without a reason is how a volunteer is left guessing whether
 * the activity moved, was called off, or they were dropped from it. The reason
 * is shown to them, so it is required at the database level and not merely
 * asked for by a form.
 */
ALTER TABLE activities DROP CONSTRAINT IF EXISTS chk_activities_cancel_reason;
ALTER TABLE activities ADD CONSTRAINT chk_activities_cancel_reason
  CHECK (cancelled_at IS NULL OR (cancel_reason IS NOT NULL AND length(btrim(cancel_reason)) > 0));

-- When registration shuts, distinct from when the activity starts.
ALTER TABLE activities ADD COLUMN IF NOT EXISTS registration_closes_at TIMESTAMPTZ NULL;

-- A deadline after the activity has begun is not a deadline.
ALTER TABLE activities DROP CONSTRAINT IF EXISTS chk_activities_reg_deadline;
ALTER TABLE activities ADD CONSTRAINT chk_activities_reg_deadline
  CHECK (
    registration_closes_at IS NULL
    OR starts_at IS NULL
    OR registration_closes_at <= starts_at
  );

-- The listing filters on "not cancelled" on every read.
CREATE INDEX IF NOT EXISTS idx_activities_live
  ON activities (starts_at) WHERE cancelled_at IS NULL AND NOT is_archived;

COMMENT ON COLUMN activities.cancelled_at IS
  'Set when the activity is called off. Distinct from is_open = false, which only closes registration.';
COMMENT ON COLUMN activities.registration_closes_at IS
  'When sign-ups stop. NULL means registration stays open until the activity starts.';

/*
 * Capacity is enforced here as well as in the action that registers people.
 * Two volunteers pressing "join" on the last seat within the same instant is
 * not hypothetical on a phone-shared link, and the application-level count
 * cannot see the other transaction. This trigger can.
 */
CREATE OR REPLACE FUNCTION enforce_activity_capacity() RETURNS TRIGGER AS $$
DECLARE
  cap   INTEGER;
  taken INTEGER;
BEGIN
  IF NEW.status <> 'registered' THEN
    RETURN NEW;
  END IF;

  SELECT capacity INTO cap FROM activities WHERE id = NEW.activity_id;
  IF cap IS NULL THEN
    RETURN NEW;
  END IF;

  -- FOR UPDATE on the activity row serialises would-be registrants, so the
  -- count below cannot be stale by the time it is compared.
  PERFORM 1 FROM activities WHERE id = NEW.activity_id FOR UPDATE;

  SELECT count(*) INTO taken
    FROM activity_registrations
   WHERE activity_id = NEW.activity_id
     AND status = 'registered'
     AND (TG_OP = 'INSERT' OR id <> NEW.id);

  IF taken >= cap THEN
    RAISE EXCEPTION 'activity % is full (% of %)', NEW.activity_id, taken, cap
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_activity_capacity ON activity_registrations;
CREATE TRIGGER trg_activity_capacity
  BEFORE INSERT OR UPDATE OF status ON activity_registrations
  FOR EACH ROW EXECUTE FUNCTION enforce_activity_capacity();

-- Nobody joins an activity that has been called off.
CREATE OR REPLACE FUNCTION refuse_cancelled_activity() RETURNS TRIGGER AS $$
DECLARE
  cancelled TIMESTAMPTZ;
BEGIN
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;
  SELECT cancelled_at INTO cancelled FROM activities WHERE id = NEW.activity_id;
  IF cancelled IS NOT NULL THEN
    RAISE EXCEPTION 'activity % was cancelled', NEW.activity_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_registration_not_cancelled ON activity_registrations;
CREATE TRIGGER trg_registration_not_cancelled
  BEFORE INSERT ON activity_registrations
  FOR EACH ROW EXECUTE FUNCTION refuse_cancelled_activity();

-- Nor is attendance recorded against one.
CREATE OR REPLACE FUNCTION refuse_attendance_on_cancelled() RETURNS TRIGGER AS $$
DECLARE
  cancelled TIMESTAMPTZ;
BEGIN
  SELECT cancelled_at INTO cancelled FROM activities WHERE id = NEW.activity_id;
  IF cancelled IS NOT NULL THEN
    RAISE EXCEPTION 'activity % was cancelled', NEW.activity_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_attendance_not_cancelled ON activity_attendance;
CREATE TRIGGER trg_attendance_not_cancelled
  BEFORE INSERT OR UPDATE ON activity_attendance
  FOR EACH ROW EXECUTE FUNCTION refuse_attendance_on_cancelled();
