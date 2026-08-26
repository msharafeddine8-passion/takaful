-- ---------------------------------------------------------------------------
-- Takaful platform - migration 049
-- The audit log becomes append-only, which is the only thing an audit log is.
--
-- Additive and safe to run twice.
--
-- audit_logs has carried no trigger since migration 001. Every other table
-- worth protecting got one — achievements and impact_points in 044, decision
-- runs in 042, roles and notes in 046 and 048 — and the table whose entire
-- purpose is to say what happened was the one thing anybody could rewrite.
--
-- UPDATE IS REFUSED TOO, AND THAT IS THE MORE IMPORTANT HALF.
--
-- A deleted audit row is a gap: somebody looking at the sequence can see that
-- ids or timestamps skip, and a gap invites the question. An edited row is
-- worse in the way that matters — it reads as a complete, ordinary record and
-- says something that did not happen. There is no way to notice it later and
-- no way to recover what it said before.
--
-- This is the table that answers "who granted that role", "who revoked that
-- certificate", "who changed that person's status". It is read precisely when
-- somebody is being asked to account for something, which is precisely when
-- somebody has a reason to want it different. A log that the interested party
-- can edit is not evidence of anything.
--
-- WHAT ABOUT RETENTION
--
-- A real reason to remove old rows will come. It goes through the same named
-- hatch as everything else — SET LOCAL takaful.allow_delete = 'on' inside a
-- transaction — so pruning is a deliberate, findable act by somebody who knew
-- what they were doing, and not a stray DELETE that happened to match.
--
-- The hatch does not weaken this. It was never a defence against somebody with
-- database access who has decided; it is a defence against the UPDATE that was
-- meant for another table, and against application code reaching this one at
-- all. Nothing in src/ may write here except the append in lib/auth.ts.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION refuse_rewriting_audit_logs()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF takaful_delete_allowed() THEN
    RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'The audit log is append-only; this row may not be deleted (id %)', OLD.id
      USING HINT = 'If this is a deliberate retention prune, say so: '
                   'SET LOCAL takaful.allow_delete = ''on'' inside a transaction.';
  END IF;

  RAISE EXCEPTION 'The audit log is append-only; this row may not be edited (id %)', OLD.id
    USING HINT = 'A record that was wrong is corrected by appending what is right, '
                 'never by rewriting what was said. The original stays.';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_logs_append_only ON audit_logs;
CREATE TRIGGER trg_audit_logs_append_only
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION refuse_rewriting_audit_logs();

COMMENT ON TABLE audit_logs IS
  'Append-only. trg_audit_logs_append_only refuses UPDATE and DELETE. A record '
  'that was wrong is corrected by appending what is right; the original stays.';
