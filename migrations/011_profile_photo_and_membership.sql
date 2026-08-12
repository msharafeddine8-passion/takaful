-- ---------------------------------------------------------------------------
-- Takaful platform - migration 011
-- Profile photos, and a membership number the card can carry.
--
-- Target: PostgreSQL 14+. Additive. Safe to run twice.
--
-- Photos are stored in the database rather than an object store. That is not
-- the textbook answer, but the alternative is another paid service and another
-- set of credentials for an association that has just been moved off one
-- provider for reachability. A profile photo capped at 300KB, for a few
-- thousand volunteers, is well within what Postgres handles comfortably, and
-- moving to object storage later is a background job rather than a redesign.
--
-- The cap is enforced here, not only in the upload form. A form is a
-- suggestion; a constraint is a rule.
-- ---------------------------------------------------------------------------

-- ------------------------------------------------------------ profile_photos
-- Separate table, not a column on profiles: a photo is large and rarely read,
-- and every existing query that selects a profile would otherwise start
-- dragging a few hundred kilobytes across for no reason.
CREATE TABLE IF NOT EXISTS profile_photos (
  user_id      UUID        NOT NULL PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT        NOT NULL,
  bytes        BYTEA       NOT NULL,
  byte_size    INTEGER     NOT NULL,
  -- Changes whenever the photo does, so a cached URL stops being served
  -- after someone replaces their picture.
  version      UUID        NOT NULL,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_photo_type CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp')),
  CONSTRAINT chk_photo_size CHECK (byte_size > 0 AND byte_size <= 300 * 1024),
  -- byte_size is what every query reads; keeping it honest matters more than
  -- saving the length() call.
  CONSTRAINT chk_photo_size_matches CHECK (byte_size = length(bytes))
);

-- ---------------------------------------------------------------- profiles
-- A membership number for the card. Sequential and human-readable, because it
-- gets read aloud at a door and typed into a form.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS member_number INTEGER NULL;

CREATE SEQUENCE IF NOT EXISTS member_number_seq START WITH 1001;

CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_member_number
  ON profiles (member_number) WHERE member_number IS NOT NULL;

-- Profile fields a volunteer maintains themselves.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages TEXT NULL;

/*
 * A number is issued on acceptance, not on registration: it identifies a
 * member of the association, and a learner taking a course is not one. Issued
 * once and never reused, so an old card can always be traced to the person it
 * was given to.
 */
CREATE OR REPLACE FUNCTION issue_member_number() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.new_status <> 'accepted_volunteer' THEN
    RETURN NEW;
  END IF;

  UPDATE profiles
     SET member_number = nextval('member_number_seq')
   WHERE user_id = NEW.user_id
     AND member_number IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_membership_issue_number ON membership_status_history;
CREATE TRIGGER trg_membership_issue_number
  AFTER INSERT ON membership_status_history
  FOR EACH ROW EXECUTE FUNCTION issue_member_number();

-- Anyone already accepted before this migration gets a number now.
UPDATE profiles p
   SET member_number = nextval('member_number_seq')
 WHERE p.member_number IS NULL
   AND is_volunteer(p.user_id);
