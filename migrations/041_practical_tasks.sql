-- ---------------------------------------------------------------------------
-- Takaful platform - migration 041
-- Practical tasks: work a learner writes, and a trainer reads.
--
-- Additive and safe to run twice.
--
-- WHY THIS TABLE EXISTS
--
-- Several courses teach something a multiple-choice question cannot test.
-- «اكتب تقييم مخاطر لنشاط» has no right answer among four options; either the
-- volunteer produced a risk note somebody could act on, or they did not, and
-- the only way to find out is for a person who knows the work to read it. The
-- academy could ask questions and nothing else, so those courses were being
-- assessed on the half of themselves that fits in a radio button.
--
-- TEXT, AND ONLY TEXT
--
-- `body` is the whole submission. There is no attachment table, no file id, no
-- URL column and no place to put one. The association has no file store, and
-- adding one is a decision about hosting, retention, virus scanning, consent
-- and who may download what - a much larger decision than this table. A
-- volunteer types their activity plan, and that is the submission.
--
-- NOTHING HERE IS EVER DELETED
--
-- A rejected submission and the feedback that rejected it stay on the record
-- forever, and the trigger at the bottom says so at the moment somebody
-- reaches for DELETE. This is not tidiness. A learner who was told to redo
-- something must be able to read what they were told, next week and next year,
-- and a trainer's judgement about a person's work is not a draft. Resubmitting
-- writes a NEW row with the next attempt_no; it never edits the old one.
--
-- NO MARK, NO RANK
--
-- There is deliberately no score column, no grade, no band and no position.
-- A practical task is approved, or returned with what to change. Nothing in
-- this table can be ordered to produce "whose activity plan was best", because
-- the moment such a number exists somebody puts it on a screen next to
-- somebody else's - see the same argument in migration 034. `feedback` is
-- addressed to the work, never to the person.
--
-- DATES
--
-- submitted_at and reviewed_at are TIMESTAMPTZ and the database session runs
-- GMT while the association is in Beirut. No calendar-day column is stored,
-- because a stored day and a stored instant are two facts that can disagree.
-- Every read that needs a day asks for
--   to_char(submitted_at AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')
-- and compares it as text - see src/lib/practical-submissions.ts. Reading the
-- bare timestamp back through a Date would show 01:30 on the 5th in Beirut as
-- the 4th, which is the same defect migration 034 documents for challenge
-- windows and the staff hours page documents for worked_on.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS practical_submissions (
  id               UUID        NOT NULL PRIMARY KEY,

  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- The course and the task within it, by slug and authored id rather than by
  -- foreign key. Course content lives in TypeScript under code review - see
  -- src/lib/course-content - so there is no row to point at. A task_id that no
  -- definition matches is not corruption: it is a task that was retired from
  -- the source, and this row is the only remaining account of the work
  -- somebody did for it.
  course_slug      TEXT        NOT NULL,
  task_id          TEXT        NOT NULL,

  -- 1, 2, 3 ... in the order the learner submitted. Never reused, never
  -- renumbered when an earlier attempt is superseded. This is what orders the
  -- history on screen; the timestamps are not, because two attempts made in
  -- the same minute must still read in the order they happened.
  attempt_no       INTEGER     NOT NULL,

  -- The work itself, as typed. Plain text, no markup, no attachment.
  body             TEXT        NOT NULL,

  -- The course fingerprint at the moment of submission - see
  -- src/lib/course-version.ts. Stamped for the same reason course_attempts
  -- stamps it: when a verdict is disputed, the only useful question is what
  -- this person was actually asked, and the brief can be reworded after the
  -- fact. Null for a submission made against a course with no content.
  content_version  TEXT        NULL,

  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- ------------------------------------------------------------ the judgement
  --
  -- All four are null while the work is waiting, and all of them are set
  -- together when it is judged - chk_practical_review_complete below. There is
  -- no separate reviews table: keeping the verdict on the row is what makes
  -- the two constraints that actually protect the learner expressible at all,
  -- namely one open submission at a time (uq_practical_awaiting) and no
  -- self-review (chk_practical_no_self_review). Neither can be written across
  -- two tables without a trigger.
  decision         TEXT        NULL,
  reviewed_by      UUID        NULL REFERENCES users(id) ON DELETE RESTRICT,
  reviewed_at      TIMESTAMPTZ NULL,
  feedback         TEXT        NULL,

  CONSTRAINT chk_practical_decision CHECK (
    decision IS NULL OR decision IN ('approved', 'changes_requested')
  ),

  CONSTRAINT chk_practical_attempt CHECK (attempt_no >= 1),

  -- An absolute floor, not the task's own rule. Each task declares its own
  -- minimum in TypeScript and the server checks it; this is the line below
  -- which a row is not a submission at all - a stray keypress, a form posted
  -- by accident - and it belongs here so it holds whoever writes the INSERT.
  CONSTRAINT chk_practical_body CHECK (length(btrim(body)) >= 40),

  -- A judgement is a person, a verdict and a time, or it is nothing yet.
  -- Half of one - a decision with no reviewer - is a verdict nobody signed.
  CONSTRAINT chk_practical_review_complete CHECK (
    (decision IS NULL AND reviewed_by IS NULL AND reviewed_at IS NULL AND feedback IS NULL)
    OR (decision IS NOT NULL AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
  ),

  -- Sending work back says what to change. "Not accepted" with no words is the
  -- thing that makes a volunteer stop submitting anything at all, and ten
  -- characters is the shortest sentence that could be one.
  CONSTRAINT chk_practical_rejection_says_why CHECK (
    decision IS DISTINCT FROM 'changes_requested'
    OR (feedback IS NOT NULL AND length(btrim(feedback)) >= 10)
  ),

  -- Nobody marks their own work. Trainers take these courses too, and the
  -- staff page and the server action both refuse it; this is the third place,
  -- and the only one that still holds when somebody has psql open. Same
  -- reasoning as the self-verification rule on hour_entries.
  CONSTRAINT chk_practical_no_self_review CHECK (
    reviewed_by IS NULL OR reviewed_by <> user_id
  ),

  -- Attempt numbers are per learner, per task. Two tabs submitting at once
  -- race for this and one of them loses, which is correct: the winner's
  -- attempt is the attempt.
  CONSTRAINT uq_practical_attempt UNIQUE (user_id, course_slug, task_id, attempt_no)
);

-- One piece of work waiting at a time. Without this a learner who submits
-- twice puts the same task in the review queue twice, and two trainers spend
-- their evening reading two versions of the same activity plan.
CREATE UNIQUE INDEX IF NOT EXISTS uq_practical_awaiting
  ON practical_submissions (user_id, course_slug, task_id)
  WHERE decision IS NULL;

-- And approved at most once, for the same reason a certificate is issued once.
-- Approving a second attempt after the first was already approved would leave
-- two rows both claiming to be the accepted work.
CREATE UNIQUE INDEX IF NOT EXISTS uq_practical_approved_once
  ON practical_submissions (user_id, course_slug, task_id)
  WHERE decision = 'approved';

-- The trainer's queue: everything unjudged, oldest first, so the person who
-- has been waiting longest is read first.
CREATE INDEX IF NOT EXISTS idx_practical_queue
  ON practical_submissions (submitted_at) WHERE decision IS NULL;

-- The learner's own history for one course, which is what the practical screen
-- renders in full - every attempt and every piece of feedback.
CREATE INDEX IF NOT EXISTS idx_practical_learner
  ON practical_submissions (user_id, course_slug);

-- Migration 016's rule: every foreign key gets an index.
CREATE INDEX IF NOT EXISTS idx_practical_reviewed_by
  ON practical_submissions (reviewed_by);

/*
 * Kept, never deleted - and not merely by convention.
 *
 * The pressure to break this comes later and in a hurry: a submission with a
 * name in it that should not be there, a learner asking for an early draft to
 * be taken down, a trainer who typed the wrong feedback. Every one of those is
 * a new attempt or a redaction, and this trigger is what says so at the moment
 * somebody reaches for DELETE. Modelled on migrations 034 and 039.
 */
CREATE OR REPLACE FUNCTION practical_submissions_refuse_delete() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'A practical submission is kept, never deleted (id %)', OLD.id
    USING HINT = 'A learner who was told to redo something must be able to read '
                 'what they were told. Submit a new attempt instead.';
END;
$$;

DROP TRIGGER IF EXISTS trg_practical_submissions_no_delete ON practical_submissions;
CREATE TRIGGER trg_practical_submissions_no_delete
  BEFORE DELETE ON practical_submissions
  FOR EACH ROW EXECUTE FUNCTION practical_submissions_refuse_delete();

COMMENT ON TABLE practical_submissions IS
  'Work a learner wrote for a course practical task, and the trainer judgement on it. Text only - there is no attachment column and no file store behind it. Rows are never deleted and never edited: resubmitting after a rejection writes a new attempt, so the earlier work and the feedback that returned it both survive. There is deliberately no score, grade or rank column - a task is approved or returned, and nothing here can be ordered to compare one learner with another.';

COMMENT ON COLUMN practical_submissions.course_slug IS
  'Names a course in src/lib/course-content. No foreign key: course content is TypeScript under code review, so there is no row to reference.';
COMMENT ON COLUMN practical_submissions.task_id IS
  'Names the practical task authored on that course. A value no definition matches is a task retired from the source, and this row is the only account of the work done for it.';
COMMENT ON COLUMN practical_submissions.attempt_no IS
  'Per learner, per task, from 1. Never reused and never renumbered - it is what orders the history, because two attempts in the same minute must still read in the order they happened.';
COMMENT ON COLUMN practical_submissions.body IS
  'The submission, as typed. Plain text; there is no attachment and no upload path anywhere in this feature.';
COMMENT ON COLUMN practical_submissions.content_version IS
  'The course fingerprint when the work was submitted - see src/lib/course-version.ts. Null when the course had no written content. Stamped so a disputed verdict can be checked against the brief that was actually on the screen.';
COMMENT ON COLUMN practical_submissions.decision IS
  'Null while waiting. Then approved, or changes_requested - never a mark. Set together with reviewed_by and reviewed_at, which is what makes a verdict a judgement by a named person rather than a status.';
COMMENT ON COLUMN practical_submissions.reviewed_by IS
  'The person who read the work. Never the learner - chk_practical_no_self_review. Not null once a decision exists, so every verdict on this platform has somebody standing behind it.';
COMMENT ON COLUMN practical_submissions.feedback IS
  'What the trainer said, addressed to the work and not to the person: what is missing from this plan, what to change, what to add. Required when returning work and optional when approving. It is never a mark out of ten and never a comparison with another learner - there is no column here that could hold either.';
COMMENT ON COLUMN practical_submissions.submitted_at IS
  'An instant, not a day. The session runs GMT and the association is in Beirut, so any read that needs a calendar day asks for it AT TIME ZONE ''Asia/Beirut'' and compares it as YYYY-MM-DD text.';
