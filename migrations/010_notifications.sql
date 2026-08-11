-- ---------------------------------------------------------------------------
-- Takaful platform - migration 010
-- Notifications.
--
-- Target: PostgreSQL 14+. Additive. Safe to run twice.
--
-- The platform currently tells people nothing. An applicant who is rejected
-- finds out by logging in and noticing; a volunteer whose hours were verified
-- has no idea unless they go looking. For an organisation whose whole product
-- is a relationship with young volunteers, that is the largest gap in it.
--
-- Architecture decision 8: the in-app notification is the source of truth and
-- is written in the same transaction as the event it describes. Email is a
-- copy, queued and retried, and a failure to send never rolls back the thing
-- that happened. A volunteer's stage does not stay locked because an SMTP
-- server was down.
--
-- Email is not wired yet - that needs a provider and credentials the
-- association has to choose. The delivery table exists now so the shape is
-- settled and turning it on is configuration rather than a migration.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID        NOT NULL PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  kind       TEXT        NOT NULL,
  -- Both languages are stored, not a key resolved at read time: what a person
  -- was told should not change because the copy was later edited.
  title_ar   TEXT        NOT NULL,
  title_en   TEXT        NOT NULL,
  body_ar    TEXT        NULL,
  body_en    TEXT        NULL,
  -- Relative, so it survives the site moving domain. Which it just did.
  link       TEXT        NULL,
  read_at    TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_notification_kind CHECK (kind IN (
    'application.accepted','application.waitlisted','application.rejected',
    'hours.verified','hours.rejected','hours.corrected',
    'stage.unlocked','stage.completed',
    'certificate.issued',
    'activity.reminder','activity.registered','activity.attended',
    'course.available','account.welcome'
  )),
  CONSTRAINT chk_notification_link CHECK (link IS NULL OR link LIKE '/%')
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications (user_id, created_at DESC);
-- The bell only ever counts unread, so index only those.
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications (user_id) WHERE read_at IS NULL;

-- --------------------------------------------------- notification_preferences
-- Absence means the defaults, so nobody needs a row to receive anything.
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id       UUID        NOT NULL PRIMARY KEY REFERENCES users(id) ON DELETE RESTRICT,
  email_enabled BOOLEAN     NOT NULL DEFAULT true,
  -- Kinds this person has opted out of. Consequential ones ignore it: being
  -- told your application was decided is not marketing.
  muted_kinds   TEXT[]      NOT NULL DEFAULT '{}',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------ email_deliveries
-- So "was Ahmad actually told?" has an answer.
CREATE TABLE IF NOT EXISTS email_deliveries (
  id              UUID        NOT NULL PRIMARY KEY,
  notification_id UUID        NULL REFERENCES notifications(id) ON DELETE SET NULL,
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  to_email        TEXT        NOT NULL,
  subject         TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'queued',
  attempts        SMALLINT    NOT NULL DEFAULT 0,
  last_error      TEXT        NULL,
  queued_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at         TIMESTAMPTZ NULL,

  CONSTRAINT chk_delivery_status CHECK (status IN ('queued','sent','failed','skipped')),
  CONSTRAINT chk_delivery_sent CHECK (status <> 'sent' OR sent_at IS NOT NULL),
  CONSTRAINT chk_delivery_failed CHECK (status <> 'failed' OR last_error IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_deliveries_pending
  ON email_deliveries (queued_at) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_deliveries_user
  ON email_deliveries (user_id, queued_at DESC);

DO $$
BEGIN
  EXECUTE 'DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON notification_preferences';
  EXECUTE 'CREATE TRIGGER trg_notification_preferences_updated_at
             BEFORE UPDATE ON notification_preferences
             FOR EACH ROW EXECUTE FUNCTION set_updated_at()';
END $$;
