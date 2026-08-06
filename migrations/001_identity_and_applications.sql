-- ---------------------------------------------------------------------------
-- Takaful platform — migration 001
-- Identity, membership history, and the volunteer application workflow.
--
-- Target: PostgreSQL 14+.
--
-- Design rules carried over from the specification:
--   * One identity per person, never duplicated, never hard-deleted.
--   * Status changes INSERT into history; they never overwrite it.
--   * Anything that could appear in an external report is append-only.
--
-- Enumerations are CHECK constraints rather than native enum types: adding a
-- value later is a one-line constraint swap instead of an ALTER TYPE that
-- takes a lock on every table using it.
--
-- Every statement is safe to run twice. This file must never drop anything.
-- ---------------------------------------------------------------------------

-- --------------------------------------------------------------------- users
-- Identity only. Profile data lives in separate tables split by sensitivity.
CREATE TABLE IF NOT EXISTS users (
  id                UUID        NOT NULL PRIMARY KEY,
  email             TEXT        NOT NULL,
  password_hash     TEXT        NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'active',
  locale            TEXT        NOT NULL DEFAULT 'ar',
  email_verified_at TIMESTAMPTZ NULL,
  last_login_at     TIMESTAMPTZ NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_users_email_lower CHECK (email = lower(email)),
  CONSTRAINT chk_users_status CHECK (status IN ('active','suspended','deactivated')),
  CONSTRAINT chk_users_locale CHECK (locale IN ('ar','en'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

-- ------------------------------------------------------------------ profiles
-- Non-sensitive, safe to read for ordinary profile display.
CREATE TABLE IF NOT EXISTS profiles (
  user_id      UUID        NOT NULL PRIMARY KEY REFERENCES users(id) ON DELETE RESTRICT,
  full_name    TEXT        NOT NULL,
  display_name TEXT        NULL,
  photo_ref    TEXT        NULL,
  bio          TEXT        NULL,
  is_public    BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------- profiles_sensitive
-- Separated deliberately: different access rules, different retention.
-- Never read for ordinary display.
CREATE TABLE IF NOT EXISTS profiles_sensitive (
  user_id                 UUID        NOT NULL PRIMARY KEY REFERENCES users(id) ON DELETE RESTRICT,
  date_of_birth           DATE        NULL,
  phone                   TEXT        NULL,
  city                    TEXT        NULL,
  emergency_contact_name  TEXT        NULL,
  emergency_contact_phone TEXT        NULL,
  accessibility_needs     TEXT        NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------- user_roles
-- Capability grants. A person may hold several at once, each with a scope.
CREATE TABLE IF NOT EXISTS user_roles (
  id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  role        TEXT        NOT NULL,
  scope_type  TEXT        NOT NULL DEFAULT 'self',
  scope_id    UUID        NULL,
  granted_by  UUID        NULL REFERENCES users(id) ON DELETE RESTRICT,
  valid_from  TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_user_roles_role CHECK (role IN (
    'registered_user','volunteer','team_leader','instructor',
    'field_supervisor','project_coordinator','content_manager',
    'program_admin','super_admin')),
  CONSTRAINT chk_user_roles_scope CHECK (scope_type IN ('self','assigned','program','global')),
  -- Nobody may grant themselves a role.
  CONSTRAINT chk_user_roles_no_self_grant CHECK (granted_by IS NULL OR granted_by <> user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles (user_id, role);
CREATE INDEX IF NOT EXISTS idx_user_roles_scope ON user_roles (role, scope_id);

-- ------------------------------------------------- membership_status_history
-- APPEND-ONLY. The current status is derived from the newest row.
-- Reconstructing "what was true in March" must always be possible.
CREATE TABLE IF NOT EXISTS membership_status_history (
  id              BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  previous_status TEXT        NULL,
  new_status      TEXT        NOT NULL,
  changed_by      UUID        NULL REFERENCES users(id) ON DELETE RESTRICT, -- NULL means the system
  actor_role      TEXT        NULL,
  reason          TEXT        NULL,
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_msh_new_status CHECK (new_status IN (
    'registered_user','course_participant','volunteer_applicant',
    'volunteer_candidate','accepted_volunteer','active_volunteer',
    'inactive_volunteer','volunteer_alumni','suspended','rejected'))
);

CREATE INDEX IF NOT EXISTS idx_msh_user_time
  ON membership_status_history (user_id, changed_at DESC, id DESC);

-- ------------------------------------------------------------------ sessions
-- Server-side sessions. The cookie carries only an opaque token hash.
CREATE TABLE IF NOT EXISTS sessions (
  id           UUID        NOT NULL PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT        NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent   TEXT        NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sessions_token ON sessions (token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions (expires_at);

-- --------------------------------------------------------- guardian_consents
-- Required before anyone under 18 may take part. Blocks submission.
CREATE TABLE IF NOT EXISTS guardian_consents (
  id                UUID        NOT NULL PRIMARY KEY,
  minor_user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  guardian_name     TEXT        NOT NULL,
  guardian_relation TEXT        NOT NULL,
  guardian_phone    TEXT        NOT NULL,
  consent_scope     TEXT[]      NOT NULL,
  granted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  withdrawn_at      TIMESTAMPTZ NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_gc_scope CHECK (
    consent_scope <@ ARRAY['participation','media','communications']::TEXT[]
  )
);

CREATE INDEX IF NOT EXISTS idx_gc_minor ON guardian_consents (minor_user_id);

-- ---------------------------------------------------- volunteer_applications
-- A person may apply more than once over the years, so this is 1:N.
-- Answers are snapshotted on submission and never edited afterwards.
CREATE TABLE IF NOT EXISTS volunteer_applications (
  id                      UUID        NOT NULL PRIMARY KEY,
  user_id                 UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status                  TEXT        NOT NULL DEFAULT 'draft',
  motivation              TEXT        NULL,
  availability            TEXT        NULL,
  interests               TEXT        NULL,
  experience              TEXT        NULL,
  answers_snapshot        JSONB       NULL,  -- frozen copy taken at submission
  submitted_at            TIMESTAMPTZ NULL,
  decided_at              TIMESTAMPTZ NULL,
  decided_by              UUID        NULL REFERENCES users(id) ON DELETE RESTRICT,
  decision_reason         TEXT        NULL,
  previous_application_id UUID        NULL REFERENCES volunteer_applications(id) ON DELETE RESTRICT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_va_status CHECK (status IN (
    'draft','submitted','under_review','interview_required',
    'interview_scheduled','accepted','waitlisted','rejected','withdrawn')),
  -- A decision must name who made it and when.
  CONSTRAINT chk_va_decision CHECK (
    status NOT IN ('accepted','waitlisted','rejected')
    OR (decided_by IS NOT NULL AND decided_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_va_status ON volunteer_applications (status, submitted_at);
CREATE INDEX IF NOT EXISTS idx_va_user ON volunteer_applications (user_id, created_at DESC);

-- One open application per person. On MySQL this was a read-then-write in the
-- application, which two concurrent submissions could both pass. Here the
-- database refuses the second one outright.
CREATE UNIQUE INDEX IF NOT EXISTS uq_va_one_open_per_user
  ON volunteer_applications (user_id)
  WHERE status IN ('submitted','under_review','interview_required','interview_scheduled');

-- ---------------------------------------------------------------- audit_logs
-- APPEND-ONLY accountability record. Never contains passwords or tokens.
CREATE TABLE IF NOT EXISTS audit_logs (
  id             BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id       UUID        NULL REFERENCES users(id) ON DELETE RESTRICT, -- NULL means the system
  actor_role     TEXT        NULL,
  action         TEXT        NOT NULL,
  target_type    TEXT        NULL,
  target_id      TEXT        NULL,
  previous_value JSONB       NULL,
  new_value      JSONB       NULL,
  reason         TEXT        NULL,
  ip_hash        TEXT        NULL,  -- hashed, never the raw address
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_logs (target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs (action, created_at DESC);

-- ---------------------------------------------------------------- updated_at
-- MySQL had ON UPDATE CURRENT_TIMESTAMP; Postgres needs a trigger.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','profiles','profiles_sensitive','volunteer_applications'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;
