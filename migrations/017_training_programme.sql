-- 017: the academy becomes the volunteer journey.
--
-- Until now there were two separate things. `journey_stages` described six
-- stages a volunteer moves through, configured by staff. `COURSES` in
-- TypeScript listed courses with no relationship to those stages. A volunteer
-- read the journey page, read the academy page, and could not tell how one
-- produced the other. This makes them one structure: a programme of levels,
-- each level a set of courses and a challenge, each completion a credential.
--
-- WHY CONTENT MOVES INTO THE DATABASE
--
-- The courses live in TypeScript today and that has been right: a missing
-- translation is a compile error, the probe suite can read the catalogue, and
-- nothing reaches a volunteer that a reviewer did not read in a diff. What it
-- cannot do is let a programme manager fix a sentence, retire a question, or
-- move a course between levels without a deploy.
--
-- So content is authored in TypeScript and seeded here, and the application
-- reads from here. The seed is idempotent and keyed on slug. The `origin`
-- column on every content table records whether a row came from the seed or
-- from a person: once a person edits a row, `origin` becomes 'admin' and the
-- seed will never overwrite it again. That is the whole conflict rule.
--
-- REVERSIBILITY
--
-- Everything below is additive. No existing table is dropped, no column is
-- removed, no row is deleted or rewritten. The two existing course attempts
-- and every module read keep working untouched, because `course_attempts` and
-- `course_module_progress` still key on `course_slug` TEXT and the slugs do
-- not change. 018_training_programme_down.sql reverses this file exactly.
--
-- NAMING
--
-- `learning_activities`, not `activities`: `activities` already exists and
-- means a volunteering event with attendance and hours. Two different things
-- with one name would be a bug waiting to happen.

-- ---------------------------------------------------------------- programme

CREATE TABLE IF NOT EXISTS programs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        NOT NULL UNIQUE,
  title_ar        TEXT        NOT NULL,
  title_en        TEXT        NOT NULL,
  description_ar  TEXT        NULL,
  description_en  TEXT        NULL,

  -- Exactly one programme is the default. The partial unique index below is
  -- what enforces it; a boolean alone would allow two.
  is_default      BOOLEAN     NOT NULL DEFAULT FALSE,

  published_at    TIMESTAMPTZ NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS programs_one_default
  ON programs ((TRUE)) WHERE is_default;

-- Level 0 is the orientation. It is a level rather than a special case so that
-- "you cannot start level N until level N-1 is done" is one rule, not two.
CREATE TABLE IF NOT EXISTS program_levels (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      UUID        NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  number          SMALLINT    NOT NULL CHECK (number BETWEEN 0 AND 20),
  title_ar        TEXT        NOT NULL,
  title_en        TEXT        NOT NULL,
  description_ar  TEXT        NULL,
  description_en  TEXT        NULL,

  -- The badge earned for finishing the level. A key into the TypeScript
  -- catalogue, like achievements.
  badge_code      TEXT        NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (program_id, number)
);

-- ------------------------------------------------------------------ courses

CREATE TABLE IF NOT EXISTS courses (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The join to every existing row of user progress. `course_attempts`,
  -- `course_module_progress` and `certificates` all key on this text, and they
  -- hold real attempts today. Changing a slug orphans a volunteer's history,
  -- so slugs are treated as permanent identifiers, not labels.
  slug            TEXT        NOT NULL UNIQUE,

  program_id      UUID        NULL REFERENCES programs(id) ON DELETE SET NULL,
  level_id        UUID        NULL REFERENCES program_levels(id) ON DELETE SET NULL,

  kind            TEXT        NOT NULL DEFAULT 'core'
                  CHECK (kind IN ('orientation', 'core', 'elective', 'challenge')),

  sort_order      SMALLINT    NOT NULL DEFAULT 0,

  title_ar        TEXT        NOT NULL,
  title_en        TEXT        NOT NULL,
  summary_ar      TEXT        NOT NULL,
  summary_en      TEXT        NOT NULL,

  -- Measured from the content, not aspired to. A card promising ninety minutes
  -- that delivers thirty is broken before anyone starts reading.
  minutes         SMALLINT    NOT NULL CHECK (minutes BETWEEN 5 AND 240),

  difficulty      TEXT        NOT NULL DEFAULT 'beginner'
                  CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

  -- 70 normally, 80 for the courses where being wrong hurts somebody:
  -- orientation, child safeguarding, people at risk, first aid, field safety.
  pass_mark       SMALLINT    NOT NULL DEFAULT 70 CHECK (pass_mark BETWEEN 50 AND 100),

  status          TEXT        NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'review', 'published', 'archived')),

  icon            TEXT        NULL,
  category        TEXT        NULL,

  -- Content governance. `content_version` increments on every substantive
  -- edit; `reviewed_at` and `reviewed_by` record that a person read it. A
  -- course can be published with reviewed_at NULL — that is a fact worth
  -- showing staff, not a state worth forbidding.
  content_version INTEGER     NOT NULL DEFAULT 1,
  reviewed_at     TIMESTAMPTZ NULL,
  reviewed_by     UUID        NULL REFERENCES users(id) ON DELETE SET NULL,

  -- 'seed' while the seed still owns this row; 'admin' once a person has
  -- edited it, after which the seed leaves it alone forever.
  origin          TEXT        NOT NULL DEFAULT 'seed'
                  CHECK (origin IN ('seed', 'admin')),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- A course inside the programme must sit in a level. An elective must not.
  CONSTRAINT courses_level_matches_kind CHECK (
    (kind IN ('core', 'orientation', 'challenge') AND level_id IS NOT NULL)
    OR (kind = 'elective' AND level_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS courses_level_idx   ON courses (level_id, sort_order);
CREATE INDEX IF NOT EXISTS courses_program_idx ON courses (program_id);
CREATE INDEX IF NOT EXISTS courses_status_idx  ON courses (status);

-- Exactly one challenge per level, and exactly one orientation per programme.
CREATE UNIQUE INDEX IF NOT EXISTS courses_one_challenge_per_level
  ON courses (level_id) WHERE kind = 'challenge';
CREATE UNIQUE INDEX IF NOT EXISTS courses_one_orientation_per_program
  ON courses (program_id) WHERE kind = 'orientation';

CREATE TABLE IF NOT EXISTS course_outcomes (
  id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID     NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  text_ar     TEXT     NOT NULL,
  text_en     TEXT     NOT NULL
);
CREATE INDEX IF NOT EXISTS course_outcomes_course_idx ON course_outcomes (course_id, sort_order);

-- 'requires' locks the door. 'recommends' only advises and never blocks.
-- Kept distinct because conflating them is how a volunteer ends up staring at
-- a course they are not allowed to open with no way to find out why.
CREATE TABLE IF NOT EXISTS course_prerequisites (
  course_id          UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  requires_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  kind               TEXT NOT NULL DEFAULT 'requires'
                     CHECK (kind IN ('requires', 'recommends')),
  PRIMARY KEY (course_id, requires_course_id, kind),
  CONSTRAINT course_prerequisites_not_self CHECK (course_id <> requires_course_id)
);
CREATE INDEX IF NOT EXISTS course_prerequisites_requires_idx
  ON course_prerequisites (requires_course_id);

-- --------------------------------------------------------- modules & lessons

CREATE TABLE IF NOT EXISTS modules (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Stable within the course and never regenerated: `course_module_progress`
  -- records reads against (course_slug, module_id) and those rows are real.
  slug        TEXT        NOT NULL,

  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  title_ar    TEXT        NOT NULL,
  title_en    TEXT        NOT NULL,
  lede_ar     TEXT        NOT NULL,
  lede_en     TEXT        NOT NULL,

  -- An optional module does not hold up course completion.
  is_required BOOLEAN     NOT NULL DEFAULT TRUE,

  origin      TEXT        NOT NULL DEFAULT 'seed' CHECK (origin IN ('seed', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug)
);
CREATE INDEX IF NOT EXISTS modules_course_idx ON modules (course_id, sort_order);

-- A lesson is one microlearning step: concept, example, decision, feedback,
-- application, summary. `body` holds the typed block array the renderer
-- already understands, so the existing renderer keeps working unchanged.
CREATE TABLE IF NOT EXISTS lessons (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id   UUID        NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  slug        TEXT        NOT NULL,
  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  title_ar    TEXT        NULL,
  title_en    TEXT        NULL,
  body        JSONB       NOT NULL DEFAULT '[]'::jsonb,
  origin      TEXT        NOT NULL DEFAULT 'seed' CHECK (origin IN ('seed', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (module_id, slug),
  CONSTRAINT lessons_body_is_array CHECK (jsonb_typeof(body) = 'array')
);
CREATE INDEX IF NOT EXISTS lessons_module_idx ON lessons (module_id, sort_order);

-- Interactive work that is not a quiz question: ordering steps, matching,
-- spot-the-error, checklists, risk assessment, timeline building. `config`
-- holds the shape for the kind; the renderer switches on `kind`.
--
-- Every kind that can be done by dragging must also be completable from the
-- keyboard. That is enforced in the component, not here, but it is the reason
-- `config` always carries an ordered list rather than pixel positions.
CREATE TABLE IF NOT EXISTS learning_activities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id   UUID        NULL REFERENCES modules(id) ON DELETE CASCADE,
  course_id   UUID        NULL REFERENCES courses(id) ON DELETE CASCADE,
  slug        TEXT        NOT NULL,
  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  kind        TEXT        NOT NULL CHECK (kind IN (
                'order_steps', 'match_pairs', 'spot_error', 'checklist',
                'reflection', 'case_study', 'risk_assessment', 'timeline',
                'meeting_sim', 'project_plan', 'pick_indicators', 'analyse_report'
              )),
  title_ar    TEXT        NOT NULL,
  title_en    TEXT        NOT NULL,
  prompt_ar   TEXT        NULL,
  prompt_en   TEXT        NULL,
  config      JSONB       NOT NULL DEFAULT '{}'::jsonb,
  is_required BOOLEAN     NOT NULL DEFAULT FALSE,
  origin      TEXT        NOT NULL DEFAULT 'seed' CHECK (origin IN ('seed', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- It belongs to a module or to a course, not to both and not to neither.
  CONSTRAINT learning_activities_one_owner CHECK (
    (module_id IS NOT NULL AND course_id IS NULL)
    OR (module_id IS NULL AND course_id IS NOT NULL)
  )
);
CREATE UNIQUE INDEX IF NOT EXISTS learning_activities_module_slug
  ON learning_activities (module_id, slug) WHERE module_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS learning_activities_course_slug
  ON learning_activities (course_id, slug) WHERE course_id IS NOT NULL;

-- ---------------------------------------------------------------- scenarios

CREATE TABLE IF NOT EXISTS scenarios (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id   UUID        NULL REFERENCES modules(id) ON DELETE CASCADE,
  slug        TEXT        NOT NULL,
  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  title_ar    TEXT        NOT NULL,
  title_en    TEXT        NOT NULL,
  setup_ar    TEXT        NOT NULL,
  setup_en    TEXT        NOT NULL,
  origin      TEXT        NOT NULL DEFAULT 'seed' CHECK (origin IN ('seed', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug)
);
CREATE INDEX IF NOT EXISTS scenarios_course_idx ON scenarios (course_id, sort_order);

CREATE TABLE IF NOT EXISTS scenario_steps (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID        NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  slug        TEXT        NOT NULL,
  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  prompt_ar   TEXT        NOT NULL,
  prompt_en   TEXT        NOT NULL,

  -- A step with no choices is where the branch ends.
  is_ending   BOOLEAN     NOT NULL DEFAULT FALSE,
  UNIQUE (scenario_id, slug)
);
CREATE INDEX IF NOT EXISTS scenario_steps_scenario_idx ON scenario_steps (scenario_id, sort_order);

-- Every choice explains itself: what happened, what it did to the team, what
-- it did to the person being served, and which principle it touches. A branch
-- that only says "wrong" teaches nothing.
CREATE TABLE IF NOT EXISTS scenario_choices (
  id             UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id        UUID     NOT NULL REFERENCES scenario_steps(id) ON DELETE CASCADE,
  sort_order     SMALLINT NOT NULL DEFAULT 0,
  text_ar        TEXT     NOT NULL,
  text_en        TEXT     NOT NULL,

  -- Not a binary right/wrong: 'best' is the one to take, 'acceptable' works
  -- but costs something, 'harmful' causes damage. Middle ground is where the
  -- learning is.
  quality        TEXT     NOT NULL DEFAULT 'acceptable'
                 CHECK (quality IN ('best', 'acceptable', 'harmful')),

  result_ar      TEXT     NOT NULL,
  result_en      TEXT     NOT NULL,
  team_effect_ar TEXT     NULL,
  team_effect_en TEXT     NULL,
  person_effect_ar TEXT   NULL,
  person_effect_en TEXT   NULL,
  principle_ar   TEXT     NULL,
  principle_en   TEXT     NULL,

  -- NULL ends the scenario here.
  next_step_id   UUID     NULL REFERENCES scenario_steps(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS scenario_choices_step_idx ON scenario_choices (step_id, sort_order);

-- --------------------------------------------------------- questions & banks

CREATE TABLE IF NOT EXISTS question_banks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  slug        TEXT        NOT NULL,
  title_ar    TEXT        NOT NULL,
  title_en    TEXT        NOT NULL,

  -- How many to draw for one attempt. NULL means every question in the bank.
  draw_count  SMALLINT    NULL CHECK (draw_count IS NULL OR draw_count > 0),

  origin      TEXT        NOT NULL DEFAULT 'seed' CHECK (origin IN ('seed', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug)
);

CREATE TABLE IF NOT EXISTS questions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id        UUID        NOT NULL REFERENCES question_banks(id) ON DELETE CASCADE,

  -- Stable: `course_attempts.question_ids` stores these and those rows exist.
  slug           TEXT        NOT NULL,

  sort_order     SMALLINT    NOT NULL DEFAULT 0,
  kind           TEXT        NOT NULL DEFAULT 'single'
                 CHECK (kind IN ('single', 'multiple', 'true_false')),
  prompt_ar      TEXT        NOT NULL,
  prompt_en      TEXT        NOT NULL,
  scenario_ar    TEXT        NULL,
  scenario_en    TEXT        NULL,
  explanation_ar TEXT        NOT NULL,
  explanation_en TEXT        NOT NULL,

  -- Which outcome this question tests. Lets the learner dashboard say "revise
  -- module 3" rather than "you scored 60%".
  topic          TEXT        NULL,

  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  origin         TEXT        NOT NULL DEFAULT 'seed' CHECK (origin IN ('seed', 'admin')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bank_id, slug)
);
CREATE INDEX IF NOT EXISTS questions_bank_idx ON questions (bank_id, sort_order);

-- `is_correct` lives here and is never sent to the browser. Grading happens in
-- a server action; the answer key leaked once already through a prop on a
-- client component and that is not repeating.
CREATE TABLE IF NOT EXISTS question_options (
  id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID     NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  text_ar     TEXT     NOT NULL,
  text_en     TEXT     NOT NULL,
  is_correct  BOOLEAN  NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS question_options_question_idx
  ON question_options (question_id, sort_order);

-- ------------------------------------------------------ progress & unlocking

-- Completing a level is a fact worth recording rather than recomputing on
-- every page load: the certificate is issued from it, and it must not change
-- underneath a volunteer because a course was later edited.
CREATE TABLE IF NOT EXISTS level_progress (
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  level_id     UUID        NOT NULL REFERENCES program_levels(id) ON DELETE RESTRICT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- What was true at the moment it was earned, frozen.
  snapshot     JSONB       NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (user_id, level_id)
);
CREATE INDEX IF NOT EXISTS level_progress_level_idx ON level_progress (level_id);

-- What a learner submitted for a level challenge. Reviewed by a person, since
-- a challenge is a piece of work and not a multiple-choice score.
CREATE TABLE IF NOT EXISTS challenge_submissions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  course_id    UUID        NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  answers      JSONB       NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NULL,
  status       TEXT        NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft', 'submitted', 'returned', 'accepted')),
  reviewed_by  UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at  TIMESTAMPTZ NULL,
  feedback     TEXT        NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- A decision needs a reviewer and a time, the same rule the volunteer
  -- application queue already follows.
  CONSTRAINT challenge_decision_needs_reviewer CHECK (
    status NOT IN ('returned', 'accepted')
    OR (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
  ),
  CONSTRAINT challenge_return_needs_feedback CHECK (
    status <> 'returned' OR (feedback IS NOT NULL AND length(btrim(feedback)) >= 3)
  )
);
CREATE UNIQUE INDEX IF NOT EXISTS challenge_submissions_one_open
  ON challenge_submissions (user_id, course_id)
  WHERE status IN ('draft', 'submitted');
CREATE INDEX IF NOT EXISTS challenge_submissions_queue
  ON challenge_submissions (status, submitted_at);

-- Where a learner stopped inside a module, so "continue where you left off"
-- can name a lesson rather than a course. Small and overwritten in place.
CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  lesson_id   UUID        NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  seen_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS activity_responses (
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  activity_id UUID        NOT NULL REFERENCES learning_activities(id) ON DELETE CASCADE,
  response    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  is_complete BOOLEAN     NOT NULL DEFAULT FALSE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, activity_id)
);

CREATE TABLE IF NOT EXISTS scenario_runs (
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  scenario_id  UUID        NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,

  -- The path taken, as an ordered list of choice ids. Kept so a learner can be
  -- shown what they chose and offered the other branch.
  path         JSONB       NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, scenario_id)
);

-- ---------------------------------------------------------- credentials

-- `certificates` already exists and its code path works. Extending it beats a
-- parallel table: one verification page, one revocation rule, one code format.
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS level_id   UUID NULL REFERENCES program_levels(id) ON DELETE SET NULL;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS program_id UUID NULL REFERENCES programs(id)       ON DELETE SET NULL;

-- The learning hours the credential represents, frozen at issue. Distinct from
-- `hours_at_issue`, which is verified volunteering hours.
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS learning_minutes INTEGER NULL;

-- Skills named on the certificate, frozen: the course may be edited later and
-- a printed claim must not change after the fact.
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS skills JSONB NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  -- Widen the kind check to the four credential layers. Dropping and
  -- recreating rather than adding a second constraint, so there is one place
  -- that says what a kind may be.
  ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_kind_check;
  ALTER TABLE certificates ADD CONSTRAINT certificates_kind_check
    CHECK (kind IN ('course', 'hours', 'orientation', 'level', 'program'));

  ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_level_needs_level;
  ALTER TABLE certificates ADD CONSTRAINT certificates_level_needs_level
    CHECK (kind <> 'level' OR level_id IS NOT NULL);
END $$;

-- One live credential of a kind per user per subject. Revoked ones stay, so
-- the index has to ignore them or a reissue after revocation would fail.
CREATE UNIQUE INDEX IF NOT EXISTS certificates_one_live_level
  ON certificates (user_id, level_id) WHERE kind = 'level' AND revoked_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS certificates_one_live_program
  ON certificates (user_id, program_id) WHERE kind = 'program' AND revoked_at IS NULL;

-- A badge is a mark of doing, shown to the learner; a certificate is a claim
-- made to a stranger. `achievements` already models the first, so badges reuse
-- it rather than adding a fourth near-identical table.

-- ------------------------------------------------------------ governance

-- Every substantive edit to content, kept. Not a diff: the whole row as it was
-- after the edit, so a bad change can be read and restored without replaying
-- history. `entity_type` is text rather than an enum so adding a content table
-- is not a migration.
CREATE TABLE IF NOT EXISTS content_revisions (
  id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entity_type TEXT        NOT NULL,
  entity_id   UUID        NOT NULL,
  version     INTEGER     NOT NULL,
  data        JSONB       NOT NULL,
  note        TEXT        NULL,
  author_id   UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, version)
);
CREATE INDEX IF NOT EXISTS content_revisions_entity_idx
  ON content_revisions (entity_type, entity_id, version DESC);

-- Where a course's material came from, and when someone last checked it was
-- still current. A reference with no access date ages invisibly.
CREATE TABLE IF NOT EXISTS source_references (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id      UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  sort_order     SMALLINT    NOT NULL DEFAULT 0,
  title          TEXT        NOT NULL,
  publisher      TEXT        NULL,
  url            TEXT        NULL,
  accessed_on    DATE        NULL,

  -- Marks a reference a subject-matter expert should confirm. First aid and
  -- safeguarding material needs a named human behind it, not a good-faith
  -- summary.
  needs_review   BOOLEAN     NOT NULL DEFAULT FALSE,
  origin         TEXT        NOT NULL DEFAULT 'seed' CHECK (origin IN ('seed', 'admin'))
);
CREATE INDEX IF NOT EXISTS source_references_course_idx
  ON source_references (course_id, sort_order);
