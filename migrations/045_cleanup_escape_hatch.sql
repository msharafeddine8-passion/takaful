-- ---------------------------------------------------------------------------
-- Takaful platform - migration 045
-- One deliberate way past the delete guards, for removing test rows.
--
-- Additive and safe to run twice.
--
-- Migration 044 gave achievements and impact_points the delete-refusing
-- triggers the schema had been claiming since 032. That was right, and it broke
-- something real: scripts/sweep.mts and two probes remove the rows they created
-- against this database, and they do it with DELETE.
--
-- Leaving that broken would trade one fault for a worse one. The probe suite
-- writes to production — that is its own problem, recorded elsewhere — and a
-- cleanup that cannot clean up leaves test badges on real accounts. Today's
-- session already found a probe activity published on the live site because a
-- cleanup path failed and reported it in a line nobody read.
--
-- So: one escape hatch, and it has to be asked for by name, in the same
-- transaction, every time.
--
--   BEGIN;
--   SET LOCAL takaful.allow_delete = 'on';
--   DELETE FROM achievements WHERE user_id = ...;
--   COMMIT;
--
-- SET LOCAL, not SET: it is discarded at the end of the transaction whatever
-- happens, so it cannot be switched on once and left on for a connection that
-- then goes back into the pool and serves a page.
--
-- This is not a weaker guard. The guard was never against somebody who has
-- decided to delete a row and written it down — it is against the console at
-- two in the morning, the cleanup script written in a hurry, and the refactor
-- by somebody who reads revoked_at as a soft delete. All three of those write
-- a plain DELETE and none of them writes this line.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION takaful_delete_allowed() RETURNS BOOLEAN
LANGUAGE plpgsql STABLE AS $$
BEGIN
  -- current_setting with missing_ok, because the parameter does not exist on a
  -- connection that never set it and the strict form would raise there.
  RETURN COALESCE(current_setting('takaful.allow_delete', TRUE), 'off') = 'on';
END;
$$;

CREATE OR REPLACE FUNCTION achievements_refuse_delete() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF takaful_delete_allowed() THEN RETURN OLD; END IF;
  RAISE EXCEPTION 'An achievement is withdrawn, never deleted (user %, code %)',
    OLD.user_id, OLD.code
    USING HINT = 'UPDATE achievements SET revoked_at = now(), revoke_reason = <why>. '
                 'A badge somebody held and lost is part of their record. If this is '
                 'test data, say so: SET LOCAL takaful.allow_delete = ''on'' first.';
END;
$$;

CREATE OR REPLACE FUNCTION impact_points_refuse_delete() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF takaful_delete_allowed() THEN RETURN OLD; END IF;
  RAISE EXCEPTION 'A points row is reversed, never deleted (id %, user %)',
    OLD.id, OLD.user_id
    USING HINT = 'INSERT a reversal row naming this one in corrects_id. If this is '
                 'test data, say so: SET LOCAL takaful.allow_delete = ''on'' first.';
END;
$$;

COMMENT ON FUNCTION takaful_delete_allowed() IS
  'True only when the current transaction has asked for it with SET LOCAL takaful.allow_delete = ''on''. Read by the delete-refusing triggers so test cleanup has one deliberate, transaction-scoped way through. SET LOCAL rather than SET, so it cannot outlive the transaction and reach a pooled connection serving a page.';
