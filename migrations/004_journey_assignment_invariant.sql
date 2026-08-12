-- ---------------------------------------------------------------------------
-- Takaful platform - migration 004
-- Every user is on a journey, guaranteed by the database.
--
-- Migration 003 seeded the users who existed at the time, but nothing assigned
-- a journey to anyone registering afterwards - so "My Journey" would have been
-- undefined for every new volunteer. Found by probing, not by reading.
--
-- The fix is a trigger rather than a line in registerUser(), because the
-- invariant should hold no matter which path creates a user: registration, an
-- admin import, a fixture, a psql session at 2am.
--
-- This also settles a contradiction in decision 2. It said a volunteer is
-- pinned when their application is accepted, which would leave everyone before
-- that point with no journey at all - yet they can already take courses and
-- log hours. Pinning now happens at registration, to whichever version is
-- default at that moment. Someone dormant for two years who is then accepted
-- can be moved by an admin, with a reason, using the mechanism that already
-- exists for exactly this.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION assign_default_journey() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM journey_versions WHERE is_default LIMIT 1;

  -- No default version configured yet is a legitimate state during setup, and
  -- must not stop someone registering.
  IF v_id IS NOT NULL THEN
    INSERT INTO user_journey_assignment (user_id, version_id)
    VALUES (NEW.id, v_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_assign_journey ON users;
CREATE TRIGGER trg_users_assign_journey
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION assign_default_journey();

-- Catch anyone created between 003 and this migration.
INSERT INTO user_journey_assignment (user_id, version_id)
SELECT u.id, v.id
  FROM users u
 CROSS JOIN (SELECT id FROM journey_versions WHERE is_default LIMIT 1) v
 WHERE NOT EXISTS (SELECT 1 FROM user_journey_assignment a WHERE a.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;
