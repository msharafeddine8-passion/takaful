-- ---------------------------------------------------------------------------
-- Takaful platform - migration 030
-- Record which version of a course an attempt was sat against.
--
-- Content gets edited: a question reworded, an option corrected, a pass mark
-- moved. Attempts carried no record of what was on the screen at the time, so
-- an attempt from March is indistinguishable from one taken today and nobody
-- can answer the question that matters when a result is disputed — what was
-- this person actually asked?
--
-- Certificates were already safe; they carry a frozen snapshot taken at issue.
-- Attempts carried nothing. This is the missing half.
--
-- The value is a fingerprint of the gradeable shape of the course — the
-- question ids, the correct answers, how many options each hid among, the pass
-- mark, and which modules existed. See lib/course-version.ts for why it is
-- derived rather than a version number an author has to remember to bump.
--
-- ── Deliberately nullable, and deliberately not back-filled ─────────────────
--
-- Every attempt that already exists keeps NULL. Stamping them with today's
-- fingerprint would assert something untrue: that they were sat against the
-- content as it stands now. NULL means "taken before this was recorded",
-- which is a fact somebody can act on; a wrong version string is not.
--
-- Nothing reads this to decide whether an attempt counts. It changes no
-- result, revokes no certificate and gates nothing. It is provenance, and
-- adding it must not alter a single existing outcome.
-- ---------------------------------------------------------------------------

ALTER TABLE course_attempts ADD COLUMN IF NOT EXISTS content_version TEXT NULL;

-- The shape the fingerprint function produces, so a stray value cannot get in.
ALTER TABLE course_attempts DROP CONSTRAINT IF EXISTS chk_attempt_content_version;
ALTER TABLE course_attempts ADD CONSTRAINT chk_attempt_content_version
  CHECK (content_version IS NULL OR content_version ~ '^[0-9a-f]{12}$');

-- "Which attempts were sat against the version we have just replaced?" is the
-- question this exists to answer, and it is asked per course.
CREATE INDEX IF NOT EXISTS idx_course_attempts_version
  ON course_attempts (course_slug, content_version);
