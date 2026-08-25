-- ---------------------------------------------------------------------------
-- Takaful platform - migration 042
-- Level decision runs: a branching rehearsal at the end of a level.
--
-- Additive and safe to run twice.
--
-- WHY A TABLE OF ITS OWN, AND NOT course_attempts
--
-- This is the whole reason the migration exists, and it is a safety decision
-- rather than a modelling preference.
--
-- src/lib/programme/gate.ts unlocks a level from rows in course_attempts where
-- passed is true, and src/lib/programme/credentials.ts issues certificates from
-- the same rows. A decision run stored there - even with passed = FALSE - would
-- put this feature one boolean away from unlocking levels and minting
-- certificates, and a later "let us just mark the good ones as passed" would be
-- a one-word change that nobody would read as dangerous. Storing runs somewhere
-- else makes that impossible rather than discouraged: there is no column here
-- that any gate or issuer reads, and no foreign key joining the two.
--
-- The second reason is the fingerprint. An attempt carries content_version, a
-- hash over a course's quiz questions and pass mark. A run is not a course and
-- has no quiz questions; it carries challenge_version, a hash over a different
-- shape computed by a different function. Two version columns in one table
-- meaning two different things is how one gets written into the other.
--
-- NO SCORE, NO MARK, NO RANK
--
-- There is deliberately no score column, no percentage, no band and no
-- position, and `outcome` holds one of three words rather than a number.
-- Nothing in this table can be ordered to produce "who handled the level best",
-- because the moment such a number exists somebody puts it on a screen beside
-- somebody else's - the same argument migrations 034 and 041 make. A run tells
-- one volunteer about their own decisions and is not comparative evidence about
-- anybody.
--
-- IT GATES NOTHING
--
-- Not taking a run must never block a level, a certificate, a badge or a
-- journey stage. Nothing outside src/lib/level-challenge-runs.ts reads this
-- table, and the level it names is one the learner has already completed - so a
-- row here can only ever be added to a finished level, never required before
-- one. A volunteer who never opens it is in exactly the position they were in
-- before it existed.
--
-- REPRODUCIBLE, WHICH IS WHY THE SEED IS STORED
--
-- Which situation a run opened on, and the order the options appeared in, are
-- recomputed from `seed` by src/lib/programme/level-challenge.ts. The seed is
-- written down rather than re-derived so that the answer to "what was this
-- person actually asked?" does not depend on a function still choosing seeds
-- the same way in two years. seed and decisions together are the complete
-- record; everything else on the screen is a pure function of them.
--
-- NOTHING HERE IS EVER DELETED
--
-- A run that went badly is exactly the run somebody may need to read back, and
-- the trigger at the bottom says so at the moment somebody reaches for DELETE.
-- Modelled on migrations 034, 039 and 041.
--
-- DATES
--
-- started_at and finished_at are TIMESTAMPTZ, the database session runs GMT and
-- the association is in Beirut. No calendar-day column is stored, because a
-- stored day and a stored instant are two facts that can disagree. Every read
-- that needs a day asks for
--   to_char(started_at AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')
-- and compares it as text - see src/lib/level-challenge-runs.ts.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS level_challenge_runs (
  id                UUID        NOT NULL PRIMARY KEY,

  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- 1-6. Level 0 is the orientation and sets no run; it is one course, and a
  -- rehearsal drawing on "everything in the level" would be drawing on it.
  level_number      INTEGER     NOT NULL,

  -- The branching shape at the moment the run opened - see
  -- challengeFingerprint() in src/lib/programme/level-challenge.ts. Deliberately
  -- NOT the course fingerprint and deliberately not called content_version:
  -- different function, different input type, different column name, so no
  -- amount of copy-and-paste puts one where the other belongs.
  challenge_version TEXT        NOT NULL,

  -- The integer the whole arrangement is recomputed from. BIGINT because
  -- hashSeed returns a 32-bit unsigned value and INTEGER tops out below it -
  -- a seed above 2147483647 would have failed the insert about half the time.
  seed              BIGINT      NOT NULL,

  -- [{"step": "l1-list", "choice": "l1-list-a"}, ...] in the order taken.
  -- Appended to, never rewritten: the server refuses a decision that does not
  -- match where the run actually stands, so an answer cannot be changed after
  -- its consequence has been read.
  decisions         JSONB       NOT NULL DEFAULT '[]'::jsonb,

  -- One of three words, and null while the run is still open. Never a mark.
  outcome           TEXT        NULL,

  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at       TIMESTAMPTZ NULL,

  CONSTRAINT chk_lcr_level CHECK (level_number BETWEEN 1 AND 6),

  CONSTRAINT chk_lcr_outcome CHECK (
    outcome IS NULL OR outcome IN ('clear', 'held', 'review')
  ),

  -- A run is finished, or it is not. A finished_at with no outcome is a run
  -- that stopped without saying anything, and an outcome with no finished_at is
  -- a verdict on something still in progress.
  CONSTRAINT chk_lcr_finished_together CHECK (
    (finished_at IS NULL AND outcome IS NULL)
    OR (finished_at IS NOT NULL AND outcome IS NOT NULL)
  ),

  -- The decisions are a list, not an object or a bare value. Without this a
  -- malformed write would surface much later, as a run that cannot be walked.
  CONSTRAINT chk_lcr_decisions_array CHECK (jsonb_typeof(decisions) = 'array'),

  -- A finished run made at least one decision. A row claiming an outcome over
  -- an empty list is a verdict about nothing.
  CONSTRAINT chk_lcr_finished_has_decisions CHECK (
    finished_at IS NULL OR jsonb_array_length(decisions) > 0
  ),

  CONSTRAINT chk_lcr_seed CHECK (seed >= 0)
);

-- One run open at a time per level. Without this, two tabs produce two runs
-- with two different seeds and the learner's decisions land in whichever row
-- the request happened to reach - which is exactly the state that makes a run
-- unreadable afterwards.
CREATE UNIQUE INDEX IF NOT EXISTS uq_lcr_open_once
  ON level_challenge_runs (user_id, level_number)
  WHERE finished_at IS NULL;

-- The learner's own history for a level, which is what the screen renders.
-- Finished runs are NOT unique per level: taking it again is the point, and a
-- second run seeds differently and therefore walks a different path.
CREATE INDEX IF NOT EXISTS idx_lcr_learner
  ON level_challenge_runs (user_id, level_number, started_at DESC);

-- Migration 016's rule: every foreign key gets an index. Covered by the index
-- above, whose leading column is user_id.

/*
 * Kept, never deleted.
 *
 * The pressure to break this arrives as a favour: a volunteer who took a
 * harmful option and would rather it were not on the record. But a run is not a
 * judgement that follows anybody - it awards nothing, blocks nothing and is
 * visible to nobody else - and the row is the only thing that can answer "what
 * was I actually asked?" if a conversation about it ever happens. Taking it
 * again is free and writes a new row; that is the remedy, not DELETE.
 */
CREATE OR REPLACE FUNCTION level_challenge_runs_refuse_delete() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'A level decision run is kept, never deleted (id %)', OLD.id
    USING HINT = 'A run awards nothing and blocks nothing, and it is the only '
                 'record of what this person was asked. Start a new run instead.';
END;
$$;

DROP TRIGGER IF EXISTS trg_level_challenge_runs_no_delete ON level_challenge_runs;
CREATE TRIGGER trg_level_challenge_runs_no_delete
  BEFORE DELETE ON level_challenge_runs
  FOR EACH ROW EXECUTE FUNCTION level_challenge_runs_refuse_delete();

COMMENT ON TABLE level_challenge_runs IS
  'A volunteer walking the branching rehearsal at the end of a level they have already completed. Deliberately not stored in course_attempts: the gate unlocks levels and the issuer mints certificates from that table, and nothing here may ever be one boolean away from doing either. There is no score, grade, percentage or rank column, so nothing in this table can be ordered to compare one learner with another. Rows are never deleted and never rewritten - taking the challenge again writes a new row with a new seed and therefore a different path.';

COMMENT ON COLUMN level_challenge_runs.level_number IS
  '1-6. The level whose five courses the run draws on. Level 0 is the orientation, which is a single course, so it sets no run.';
COMMENT ON COLUMN level_challenge_runs.challenge_version IS
  'The branching shape when the run opened - challengeFingerprint() in src/lib/programme/level-challenge.ts. NOT the course fingerprint and not named content_version: a different function over a different type, so the two can never be written into each other.';
COMMENT ON COLUMN level_challenge_runs.seed IS
  'The integer the opening situation and every option ordering are recomputed from. Stored rather than re-derived so a run stays readable even if seeds are later chosen differently. BIGINT because the hash is 32-bit unsigned and would overflow INTEGER about half the time.';
COMMENT ON COLUMN level_challenge_runs.decisions IS
  'The decisions taken, oldest first, as [{"step": ..., "choice": ...}]. Append-only: the server refuses a decision that does not match where the run stands, so nothing can be re-answered after its consequence has been read. With seed, this is the complete record - every situation and every option position is a pure function of the two.';
COMMENT ON COLUMN level_challenge_runs.outcome IS
  'clear, held or review - three words about the decisions, never a mark. Null while the run is open. "review" is not a failure: it means a decision crossed a line here rather than in a hall with thirty children in it, which is the entire value of the exercise.';
COMMENT ON COLUMN level_challenge_runs.started_at IS
  'An instant, not a day. The session runs GMT and the association is in Beirut, so any read needing a calendar day asks for it AT TIME ZONE ''Asia/Beirut'' and compares it as YYYY-MM-DD text.';
COMMENT ON COLUMN level_challenge_runs.finished_at IS
  'Set together with outcome, or both null. A run left open is simply unfinished; nothing expires it and nothing chases the learner about it.';
