-- 012: learning progress that survives a closed tab, and attempts that leave a record.
--
-- Until now a course kept one row per person: the best score, and whether they
-- passed. That answered "did they pass" and nothing else. It could not say how
-- many times someone tried, what they answered, where they stopped reading, or
-- what the pass mark was on the day they earned a certificate.
--
-- So attempts become a ledger, the same shape the hours and membership
-- histories already use: rows are appended, never edited. course_progress
-- stops being a table and becomes a view over that ledger, so every existing
-- reader keeps working and there is exactly one place the truth lives.

-- No BEGIN/COMMIT in this file: the runner wraps each migration in its own
-- transaction, and a COMMIT here would close it early and leave the rest
-- running unprotected.

-- --------------------------------------------------------------- attempts
CREATE TABLE IF NOT EXISTS course_attempts (
  id           UUID        PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  course_slug  TEXT        NOT NULL,

  -- The questions this attempt asked, in the order asked, and the order the
  -- options were shown in. Both are frozen when the attempt opens: a reload
  -- must not reshuffle, or someone could reroll a question they disliked.
  question_ids TEXT[]      NOT NULL,
  option_order JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- {questionId: originalOptionIndex}. Original, not displayed: the shuffle is
  -- a presentation detail and grading must not depend on it.
  answers      JSONB       NOT NULL DEFAULT '{}'::jsonb,

  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ NULL,
  score        SMALLINT    NULL,
  passed       BOOLEAN     NOT NULL DEFAULT false,

  -- The bar as it stood for this attempt. If the association later raises the
  -- pass mark, a certificate earned under the old one keeps its meaning.
  pass_mark    SMALLINT    NULL,

  source       TEXT        NOT NULL DEFAULT 'web',

  CONSTRAINT chk_attempt_score   CHECK (score IS NULL OR score BETWEEN 0 AND 100),
  CONSTRAINT chk_attempt_mark    CHECK (pass_mark IS NULL OR pass_mark BETWEEN 1 AND 100),
  -- An attempt still open has no result yet.
  CONSTRAINT chk_attempt_open    CHECK (submitted_at IS NOT NULL OR (score IS NULL AND NOT passed)),
  -- A pass has to be supported by the numbers. This is what stops a bug, or a
  -- hand-written UPDATE, from recording a pass nobody earned.
  CONSTRAINT chk_attempt_passed  CHECK (
    NOT passed OR (
      score IS NOT NULL AND submitted_at IS NOT NULL
      AND (pass_mark IS NULL OR score >= pass_mark)
    )
  ),
  -- pass_mark may only be unknown for rows carried over from the old table,
  -- where it genuinely was never recorded.
  CONSTRAINT chk_attempt_mark_known CHECK (source = 'migrated' OR pass_mark IS NOT NULL),
  CONSTRAINT chk_attempt_questions  CHECK (source = 'migrated' OR cardinality(question_ids) > 0)
);

COMMENT ON TABLE course_attempts IS
  'Append-only. Correct an attempt by recording another one, never by editing this.';
COMMENT ON COLUMN course_attempts.source IS
  'web = taken through the site. migrated = carried over from the old course_progress table, where the questions, answers and pass mark were never recorded.';

-- Someone may have many finished attempts but only one in progress.
CREATE UNIQUE INDEX IF NOT EXISTS uq_open_attempt
  ON course_attempts (user_id, course_slug) WHERE submitted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_attempt_user ON course_attempts (user_id, course_slug, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempt_passed ON course_attempts (user_id) WHERE passed;

-- ------------------------------------------------------- where they stopped
-- One row per module finished. A ninety-minute course read on a phone will be
-- interrupted; coming back to the top of it every time is how a course gets
-- abandoned.
CREATE TABLE IF NOT EXISTS course_module_progress (
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  course_slug  TEXT        NOT NULL,
  module_id    TEXT        NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_slug, module_id)
);

CREATE INDEX IF NOT EXISTS idx_module_progress_course
  ON course_module_progress (user_id, course_slug);

-- ----------------------------------------------- carry the old table across
-- Nothing is thrown away. Each old row becomes one finished attempt, marked
-- as migrated so nobody later mistakes a back-filled row for a real sitting.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = current_schema() AND table_name = 'course_progress'
       AND table_type = 'BASE TABLE'
  ) THEN
    INSERT INTO course_attempts
      (id, user_id, course_slug, question_ids, option_order, answers,
       started_at, submitted_at, score, passed, pass_mark, source)
    SELECT gen_random_uuid(), user_id, course_slug, '{}'::TEXT[], '{}'::jsonb, '{}'::jsonb,
           started_at,
           -- An old row with no completed_at was only ever "opened". Keeping it
           -- open would collide with the one-open-attempt rule the moment the
           -- person starts again, so it is closed with no score.
           completed_at,
           CASE WHEN completed_at IS NULL THEN NULL ELSE score END,
           passed,
           NULL,
           'migrated'
      FROM course_progress;

    DROP TABLE course_progress;
  END IF;
END $$;

-- --------------------------------------------------------- the same reads
-- Same name, same columns the callers already select. score is the best
-- finished attempt and passed is true if any attempt passed, which is exactly
-- what the old ON CONFLICT ... GREATEST() write produced.
CREATE OR REPLACE VIEW course_progress AS
SELECT
  user_id,
  course_slug,
  MAX(score) FILTER (WHERE submitted_at IS NOT NULL)              AS score,
  COALESCE(bool_or(passed), false)                                AS passed,
  MIN(submitted_at) FILTER (WHERE passed)                         AS completed_at,
  MIN(started_at)                                                 AS started_at,
  -- count(*) is bigint, which the driver hands back as a string. Cast it here
  -- so nobody downstream does arithmetic on '3'.
  (count(*) FILTER (WHERE submitted_at IS NOT NULL))::INTEGER      AS attempts,
  MAX(submitted_at)                                               AS last_attempt_at
FROM course_attempts
GROUP BY user_id, course_slug;

COMMENT ON VIEW course_progress IS
  'Derived from course_attempts. Read-only: record an attempt, do not write here.';
