-- ---------------------------------------------------------------------------
-- Takaful platform — migration 001
-- Identity, membership history, and the volunteer application workflow.
--
-- Target: MySQL 8.0+ (Hostinger). CHECK constraints require 8.0.16+.
-- Charset utf8mb4 throughout so Arabic text and emoji are stored correctly.
--
-- Design rules carried over from the specification:
--   * One identity per person, never duplicated, never hard-deleted.
--   * Status changes INSERT into history; they never overwrite it.
--   * Anything that could appear in an external report is append-only.
-- ---------------------------------------------------------------------------

SET NAMES utf8mb4;

-- --------------------------------------------------------------------- users
-- Identity only. Profile data lives in separate tables split by sensitivity.
CREATE TABLE IF NOT EXISTS users (
  id                CHAR(36)     NOT NULL PRIMARY KEY,
  email             VARCHAR(255) NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  status            ENUM('active','suspended','deactivated') NOT NULL DEFAULT 'active',
  locale            ENUM('ar','en') NOT NULL DEFAULT 'ar',
  email_verified_at DATETIME     NULL,
  last_login_at     DATETIME     NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------ profiles
-- Non-sensitive, safe to read for ordinary profile display.
CREATE TABLE IF NOT EXISTS profiles (
  user_id      CHAR(36)     NOT NULL PRIMARY KEY,
  full_name    VARCHAR(160) NOT NULL,
  display_name VARCHAR(80)  NULL,
  photo_ref    VARCHAR(255) NULL,
  bio          TEXT         NULL,
  is_public    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------- profiles_sensitive
-- Separated deliberately: different access rules, different retention.
-- Never read for ordinary display.
CREATE TABLE IF NOT EXISTS profiles_sensitive (
  user_id                 CHAR(36)     NOT NULL PRIMARY KEY,
  date_of_birth           DATE         NULL,
  phone                   VARCHAR(40)  NULL,
  city                    VARCHAR(120) NULL,
  emergency_contact_name  VARCHAR(160) NULL,
  emergency_contact_phone VARCHAR(40)  NULL,
  accessibility_needs     TEXT         NULL,
  created_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_sensitive_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------- user_roles
-- Capability grants. A person may hold several at once, each with a scope.
CREATE TABLE IF NOT EXISTS user_roles (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    CHAR(36) NOT NULL,
  role       ENUM('registered_user','volunteer','team_leader','instructor',
                  'field_supervisor','project_coordinator','content_manager',
                  'program_admin','super_admin') NOT NULL,
  scope_type ENUM('self','assigned','program','global') NOT NULL DEFAULT 'self',
  scope_id   CHAR(36) NULL,
  granted_by CHAR(36) NULL,
  valid_from DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_until DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_user_roles_granter FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE RESTRICT,
  -- Nobody may grant themselves a role.
  CONSTRAINT chk_user_roles_no_self_grant CHECK (granted_by IS NULL OR granted_by <> user_id),
  KEY idx_user_roles_user (user_id, role),
  KEY idx_user_roles_scope (role, scope_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------- membership_status_history
-- APPEND-ONLY. The current status is derived from the newest row.
-- Reconstructing "what was true in March" must always be possible.
CREATE TABLE IF NOT EXISTS membership_status_history (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id         CHAR(36) NOT NULL,
  previous_status VARCHAR(40) NULL,
  new_status      ENUM('registered_user','course_participant','volunteer_applicant',
                       'volunteer_candidate','accepted_volunteer','active_volunteer',
                       'inactive_volunteer','volunteer_alumni','suspended','rejected')
                  NOT NULL,
  changed_by      CHAR(36) NULL,          -- NULL means the system changed it
  actor_role      VARCHAR(40) NULL,
  reason          TEXT NULL,
  changed_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_msh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_msh_actor FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT,
  KEY idx_msh_user_time (user_id, changed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------ sessions
-- Server-side sessions. The cookie carries only an opaque token hash.
CREATE TABLE IF NOT EXISTS sessions (
  id           CHAR(36)    NOT NULL PRIMARY KEY,
  user_id      CHAR(36)    NOT NULL,
  token_hash   CHAR(64)    NOT NULL,
  expires_at   DATETIME    NOT NULL,
  created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_agent   VARCHAR(255) NULL,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_sessions_token (token_hash),
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------ guardian_consents
-- Required before anyone under 18 may take part. Blocks submission.
CREATE TABLE IF NOT EXISTS guardian_consents (
  id                  CHAR(36)     NOT NULL PRIMARY KEY,
  minor_user_id       CHAR(36)     NOT NULL,
  guardian_name       VARCHAR(160) NOT NULL,
  guardian_relation   VARCHAR(80)  NOT NULL,
  guardian_phone      VARCHAR(40)  NOT NULL,
  consent_scope       SET('participation','media','communications') NOT NULL,
  granted_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  withdrawn_at        DATETIME     NULL,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_gc_minor FOREIGN KEY (minor_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  KEY idx_gc_minor (minor_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------- volunteer_applications
-- A person may apply more than once over the years, so this is 1:N.
-- Answers are snapshotted on submission and never edited afterwards.
CREATE TABLE IF NOT EXISTS volunteer_applications (
  id                CHAR(36) NOT NULL PRIMARY KEY,
  user_id           CHAR(36) NOT NULL,
  status            ENUM('draft','submitted','under_review','interview_required',
                         'interview_scheduled','accepted','waitlisted','rejected','withdrawn')
                    NOT NULL DEFAULT 'draft',
  motivation        TEXT NULL,
  availability      VARCHAR(255) NULL,
  interests         VARCHAR(255) NULL,
  experience        TEXT NULL,
  answers_snapshot  JSON NULL,           -- frozen copy taken at submission
  submitted_at      DATETIME NULL,
  decided_at        DATETIME NULL,
  decided_by        CHAR(36) NULL,
  decision_reason   TEXT NULL,
  previous_application_id CHAR(36) NULL, -- links a reapplication to its predecessor
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_va_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_va_decider FOREIGN KEY (decided_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_va_previous FOREIGN KEY (previous_application_id) REFERENCES volunteer_applications(id) ON DELETE RESTRICT,
  -- A decision must name who made it and why.
  CONSTRAINT chk_va_decision CHECK (
    status NOT IN ('accepted','waitlisted','rejected')
    OR (decided_by IS NOT NULL AND decided_at IS NOT NULL)
  ),
  KEY idx_va_status (status, submitted_at),
  KEY idx_va_user (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------- audit_logs
-- APPEND-ONLY accountability record. Never contains passwords or tokens.
CREATE TABLE IF NOT EXISTS audit_logs (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_id       CHAR(36) NULL,           -- NULL means the system acted
  actor_role     VARCHAR(40) NULL,
  action         VARCHAR(80) NOT NULL,
  target_type    VARCHAR(60) NULL,
  target_id      VARCHAR(64) NULL,
  previous_value JSON NULL,
  new_value      JSON NULL,
  reason         TEXT NULL,
  ip_hash        CHAR(64) NULL,           -- hashed, never the raw address
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_actor (actor_id, created_at DESC),
  KEY idx_audit_target (target_type, target_id, created_at DESC),
  KEY idx_audit_action (action, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
