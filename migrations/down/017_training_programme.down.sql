-- Reverses 017_training_programme.sql exactly.
--
-- It lives in migrations/down/ and not in migrations/, because the runner
-- applies every .sql file it finds in that directory in name order. A down
-- file sitting next to its up file would drop the schema it had just built.
--
-- This is never run automatically. To reverse:
--
--   psql "$DATABASE_URL" -f migrations/down/017_training_programme.down.sql
--   psql "$DATABASE_URL" -c "DELETE FROM schema_migrations WHERE filename = '017_training_programme.sql'"
--
-- WHAT IS LOST
--
-- Content, and only content: courses, modules, lessons, activities, scenarios
-- and question banks, all of which are reproducible by re-running the seed.
--
-- WHAT IS NOT TOUCHED
--
-- Everything a volunteer did. `course_attempts`, `course_module_progress` and
-- `certificates` are not dropped and not emptied, because they key on
-- `course_slug` TEXT and never on these tables' ids. The columns added to
-- `certificates` are dropped, so a level or programme certificate would lose
-- its link — which is why the DELETE for those rows is written out below but
-- left commented. Read it, decide, then run it deliberately.

BEGIN;

-- Progress against programme content. Dropped before the content they
-- reference, since the foreign keys are RESTRICT on users but CASCADE here.
DROP TABLE IF EXISTS scenario_runs;
DROP TABLE IF EXISTS activity_responses;
DROP TABLE IF EXISTS lesson_progress;
DROP TABLE IF EXISTS challenge_submissions;
DROP TABLE IF EXISTS level_progress;

-- Governance.
DROP TABLE IF EXISTS source_references;
DROP TABLE IF EXISTS content_revisions;

-- Assessment.
DROP TABLE IF EXISTS question_options;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS question_banks;

-- Scenarios. Choices reference steps twice (owner and next_step_id), so the
-- child goes first.
DROP TABLE IF EXISTS scenario_choices;
DROP TABLE IF EXISTS scenario_steps;
DROP TABLE IF EXISTS scenarios;

-- Content.
DROP TABLE IF EXISTS learning_activities;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS modules;
DROP TABLE IF EXISTS course_prerequisites;
DROP TABLE IF EXISTS course_outcomes;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS program_levels;
DROP TABLE IF EXISTS programs;

-- Undo the certificate widening. The indexes reference the columns, so they
-- go first.
DROP INDEX IF EXISTS certificates_one_live_level;
DROP INDEX IF EXISTS certificates_one_live_program;

ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_level_needs_level;

-- If any level or programme certificate was issued, restoring the narrower
-- check will fail until those rows are dealt with. Uncomment deliberately —
-- this deletes issued credentials.
-- DELETE FROM certificates WHERE kind IN ('orientation', 'level', 'program');

ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_kind_check;
ALTER TABLE certificates ADD CONSTRAINT certificates_kind_check
  CHECK (kind IN ('course', 'hours'));

ALTER TABLE certificates DROP COLUMN IF EXISTS skills;
ALTER TABLE certificates DROP COLUMN IF EXISTS learning_minutes;
ALTER TABLE certificates DROP COLUMN IF EXISTS program_id;
ALTER TABLE certificates DROP COLUMN IF EXISTS level_id;

COMMIT;
