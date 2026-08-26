-- ---------------------------------------------------------------------------
-- Takaful platform - migration 044
-- The two tables that said nothing is ever deleted, and did not enforce it.
--
-- Additive and safe to run twice.
--
-- Migration 032 opens with "Nothing is ever deleted. The total is a view." That
-- is the rule the whole recognition system rests on: a badge somebody held and
-- lost keeps its row and gains a reason, and a point taken back is a reversal
-- row that says who and why. It is stated in the schema, honoured everywhere in
-- the application, and — until now — enforced nowhere.
--
-- An audit found it. Five tables in this database refuse a DELETE with a
-- trigger: challenges (034), recognition_awards (036), badge_retirements (039),
-- practical_submissions (041) and level_challenge_runs (042). The two the rule
-- was written for were not among them. DELETE FROM impact_points succeeded.
--
-- The pattern already existed here; it was simply never applied to the tables
-- it came from. That is the whole of this migration.
--
-- WHY A TRIGGER AND NOT A REVIEW HABIT. The application never deletes these
-- rows today — every path was read and they all update. The risk is not this
-- code; it is the console at two in the morning, the cleanup script written in
-- a hurry, and the future refactor by somebody who reads "revoked_at" as a soft
-- delete and decides to tidy up. A comment does not survive any of those. The
-- HINT names the correct repair so the person who hits it is told what to do
-- instead, rather than left to work around a refusal.
-- ---------------------------------------------------------------------------

-- ------------------------------------------------------------- achievements

CREATE OR REPLACE FUNCTION achievements_refuse_delete() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'An achievement is withdrawn, never deleted (user %, code %)',
    OLD.user_id, OLD.code
    USING HINT = 'UPDATE achievements SET revoked_at = now(), revoke_reason = <why> '
                 'WHERE user_id = <user> AND code = <code>. A badge somebody held '
                 'and lost is part of their record; making it vanish is how a '
                 'volunteer stops believing the rest of the figures.';
END;
$$;

DROP TRIGGER IF EXISTS trg_achievements_no_delete ON achievements;
CREATE TRIGGER trg_achievements_no_delete
  BEFORE DELETE ON achievements
  FOR EACH ROW EXECUTE FUNCTION achievements_refuse_delete();

-- ------------------------------------------------------------ impact_points

CREATE OR REPLACE FUNCTION impact_points_refuse_delete() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'A points row is reversed, never deleted (id %, user %)',
    OLD.id, OLD.user_id
    USING HINT = 'INSERT a row with entry_kind = ''reversal'' and corrects_id = <id>, '
                 'carrying the negative of the original. The ledger is meant to be '
                 'readable back to front: a total that changed with nothing to '
                 'explain it is not a ledger.';
END;
$$;

DROP TRIGGER IF EXISTS trg_impact_points_no_delete ON impact_points;
CREATE TRIGGER trg_impact_points_no_delete
  BEFORE DELETE ON impact_points
  FOR EACH ROW EXECUTE FUNCTION impact_points_refuse_delete();

COMMENT ON TABLE achievements IS
  'Badges, earned by doing rather than awarded by clicking. Rows are never deleted - a badge that no longer stands is marked revoked with a reason and kept, and migration 044 enforces that with a trigger rather than leaving it to habit.';
COMMENT ON TABLE impact_points IS
  'The points ledger. Append only: a point taken back is a reversal row naming the row it reverses, never a delete, and migration 044 enforces that with a trigger.';
