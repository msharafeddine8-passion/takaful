-- ---------------------------------------------------------------------------
-- Takaful platform - migration 047
-- The same named escape hatch for decision runs, so the rule can be tested.
--
-- Additive and safe to run twice.
--
-- WHY THIS IS NEEDED NOW AND WAS NOT BEFORE
--
-- Migration 042 gave level_challenge_runs a BEFORE DELETE trigger that refuses
-- unconditionally, and that was right while a run was an optional rehearsal
-- that gated nothing: the only thing at stake was a volunteer's own record of
-- what they chose, and nobody had any business removing it.
--
-- A finished run now closes a programme level. That makes it load-bearing, and
-- a load-bearing rule with no end-to-end test is worse than an inconvenient
-- one. The probe suite could assert everything about the gate's pure functions
-- and nothing at all about a stored run actually closing a level — because
-- writing one test run would have put a permanent row in production, on top of
-- a throwaway learner that ON DELETE RESTRICT then made undeletable too.
--
-- So the choice was: leave the newest and most important rule untested, or
-- give this table the same hatch achievements and impact_points already have.
--
-- THE HATCH IS NOT A WEAKENING
--
-- Same mechanism as migration 045, deliberately reused rather than reinvented:
--
--   BEGIN;
--   SET LOCAL takaful.allow_delete = 'on';
--   DELETE FROM level_challenge_runs WHERE user_id = ...;
--   COMMIT;
--
-- It has to be asked for by name, in the same transaction, every time. SET
-- LOCAL is discarded when the transaction ends however it ends, so it cannot
-- be switched on once and left on for a connection that returns to the pool
-- and then serves a page. And SET LOCAL outside a transaction is a silent
-- no-op — which is a trap this codebase has already been caught by once, so:
-- if a cleanup appears to do nothing, that is the first thing to check.
--
-- The guard was never against somebody who has decided to remove a row and
-- knows how. It is against the accidental DELETE in a script that meant to
-- write an UPDATE. That protection is untouched.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION refuse_deleting_level_challenge_runs()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF takaful_delete_allowed() THEN RETURN OLD; END IF;
  RAISE EXCEPTION 'A level decision run is kept, never deleted (id %)', OLD.id
    USING HINT = 'A run is the record of what somebody met and what they chose, '
                 'and a level was closed on it. If this is test data, say so: '
                 'SET LOCAL takaful.allow_delete = ''on'' first, inside a transaction.';
END;
$$;

/*
 * Repoint the trigger 042 created.
 *
 * DROP and CREATE rather than CREATE OR REPLACE TRIGGER: the original names
 * its function inline, and replacing only the function would leave the old
 * one still bound if the trigger were ever recreated from 042 again.
 */
DROP TRIGGER IF EXISTS trg_level_challenge_runs_no_delete ON level_challenge_runs;
CREATE TRIGGER trg_level_challenge_runs_no_delete
  BEFORE DELETE ON level_challenge_runs
  FOR EACH ROW EXECUTE FUNCTION refuse_deleting_level_challenge_runs();

/*
 * And the same for volunteer roles, added in 046 an hour before this.
 *
 * 046 wrote its own copy of the check instead of calling takaful_delete_allowed(),
 * which worked but left a second definition of one rule free to drift from the
 * first. One function, called from every refusing trigger.
 */
CREATE OR REPLACE FUNCTION refuse_deleting_volunteer_roles()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF takaful_delete_allowed() THEN RETURN OLD; END IF;
  RAISE EXCEPTION 'A volunteer role is archived, never deleted (id %)', OLD.id
    USING HINT = 'UPDATE volunteer_roles SET archived_at = now(), archived_by = <who>. '
                 'What somebody has been in the association is not a row to drop. '
                 'If this is test data: SET LOCAL takaful.allow_delete = ''on'' first.';
END;
$$;

COMMENT ON FUNCTION takaful_delete_allowed() IS
  'The one named escape hatch past every delete guard. Set takaful.allow_delete '
  'to ''on'' with SET LOCAL, inside a transaction, immediately before the DELETE. '
  'Guards achievements, impact_points, level_challenge_runs and volunteer_roles.';
