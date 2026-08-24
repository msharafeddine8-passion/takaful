-- What people did before this platform existed.
--
-- The association has been running since 2020 and the site is weeks old. Every
-- hour worked and every course sat before it is invisible here, which means a
-- volunteer of six years shows zero hours and is blocked from a course they
-- taught. Both are recorded from now on, and both are marked as what they are
-- rather than dressed up as ordinary records.
--
-- The alternative — a separate table for prior credit — was rejected because
-- every gate, total and report already reads these two tables. A credit the
-- gate did not know about would block somebody from a course they are credited
-- for, which is a worse failure than the one being fixed.

-- ------------------------------------------------------------------- hours

ALTER TABLE hour_entries ADD COLUMN IF NOT EXISTS carried_over BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN hour_entries.carried_over IS
  'Hours worked before the platform. One staff decision covering a period, not one day''s work.';

-- The 24-hour ceiling is right for a day of work and wrong for a carry-over,
-- which covers years. Ten thousand hours is the new ceiling for those: high
-- enough for anybody real, low enough that a slipped decimal point stops here
-- rather than in a report.
ALTER TABLE hour_entries DROP CONSTRAINT IF EXISTS chk_hours_minutes;
ALTER TABLE hour_entries ADD CONSTRAINT chk_hours_minutes CHECK (
  (corrects_id IS NULL AND NOT carried_over AND minutes > 0 AND minutes <= 1440)
  OR (corrects_id IS NULL AND carried_over AND minutes > 0 AND minutes <= 600000)
  OR (corrects_id IS NOT NULL AND minutes <> 0 AND minutes >= -1440 AND minutes <= 1440)
);

-- A carry-over belongs to no activity on this platform, is a decision rather
-- than a submission awaiting review, and has to say what period it covers.
-- Without the note it is a number in a ledger with no account of itself.
ALTER TABLE hour_entries DROP CONSTRAINT IF EXISTS chk_hours_carried;
ALTER TABLE hour_entries ADD CONSTRAINT chk_hours_carried CHECK (
  NOT carried_over
  OR (activity_id IS NULL AND status = 'verified' AND note IS NOT NULL AND length(btrim(note)) > 0)
);

-- ----------------------------------------------------------------- courses

-- 'recognised' joins 'migrated' as a source that did not come through the
-- question bank. A recognised pass has no score, because there was no paper:
-- inventing one would put a mark on a certificate that nobody ever earned.
ALTER TABLE course_attempts DROP CONSTRAINT IF EXISTS chk_attempt_mark_known;
ALTER TABLE course_attempts ADD CONSTRAINT chk_attempt_mark_known CHECK (
  source IN ('migrated', 'recognised') OR pass_mark IS NOT NULL
);

ALTER TABLE course_attempts DROP CONSTRAINT IF EXISTS chk_attempt_questions;
ALTER TABLE course_attempts ADD CONSTRAINT chk_attempt_questions CHECK (
  source IN ('migrated', 'recognised') OR cardinality(question_ids) > 0
);

ALTER TABLE course_attempts DROP CONSTRAINT IF EXISTS chk_attempt_passed;
ALTER TABLE course_attempts ADD CONSTRAINT chk_attempt_passed CHECK (
  NOT passed
  OR (source = 'recognised' AND submitted_at IS NOT NULL AND score IS NULL)
  OR (score IS NOT NULL AND submitted_at IS NOT NULL AND (pass_mark IS NULL OR score >= pass_mark))
);

-- Who recognised it and on what grounds. The same standard the hours ledger
-- already holds: a decision about somebody's record carries the name of whoever
-- made it, and nobody recognises their own.
ALTER TABLE course_attempts ADD COLUMN IF NOT EXISTS recognised_by UUID REFERENCES users(id);
ALTER TABLE course_attempts ADD COLUMN IF NOT EXISTS recognised_note TEXT;

ALTER TABLE course_attempts DROP CONSTRAINT IF EXISTS chk_attempt_recognised;
ALTER TABLE course_attempts ADD CONSTRAINT chk_attempt_recognised CHECK (
  source <> 'recognised'
  OR (recognised_by IS NOT NULL
      AND recognised_by <> user_id
      AND recognised_note IS NOT NULL
      AND length(btrim(recognised_note)) > 0)
);

-- One recognition per course per person. A second would show as two passes in
-- the standings and could issue a second certificate.
CREATE UNIQUE INDEX IF NOT EXISTS uq_attempt_recognised_once
  ON course_attempts (user_id, course_slug)
  WHERE source = 'recognised';
