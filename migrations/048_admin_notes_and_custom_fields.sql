-- ---------------------------------------------------------------------------
-- Takaful platform - migration 048
-- Two things the admin screens need: private notes, and columns nobody has to
-- ship a migration for.
--
-- Additive and safe to run twice.
-- ---------------------------------------------------------------------------
--
-- PART 1: ADMIN NOTES, AND THE ONE THING THEY MUST NOT BECOME
--
-- The brief asks for a note on a volunteer that the volunteer does not see,
-- carrying who wrote it and when. That is ordinary volunteer management and
-- this builds it.
--
-- It is also, structurally, the place where an informal file on a person
-- accumulates — so three things are fixed here rather than left to habit.
--
--   The author and the time are columns, not a convention. A note nobody can
--   attribute is a rumour with a timestamp.
--
--   Editing keeps the row. `body` is what it says now; edits bump updated_at
--   and updated_by. Removing is archiving.
--
--   A SAFEGUARDING CONCERN DOES NOT BELONG HERE, and the application must send
--   it to safeguarding_records instead. That is not tidiness. safeguarding
--   records have a defined handler, a retention rule and a route to the focal
--   point; a free-text note has none of those, is visible to anybody who can
--   open the profile, and would leave a disclosure sitting in a text box with
--   nobody owning it. The note screen says so in both languages, and the
--   comment is here because the schema cannot enforce it.
--
-- The subject cannot read these. That is what was asked for, and it is worth
-- being deliberate about: it means the association can hold an opinion about
-- somebody that they can never answer. Keeping the author on every row is the
-- part that makes that survivable — a note somebody has to put their name to
-- is written differently from one that appears from nowhere.

CREATE TABLE IF NOT EXISTS admin_notes (
  id          UUID        NOT NULL PRIMARY KEY,
  -- Who the note is about.
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  -- Who wrote it. NOT NULL: an unattributable note is the failure mode.
  author_id   UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  body        TEXT        NOT NULL,

  archived_at TIMESTAMPTZ NULL,
  archived_by UUID        NULL REFERENCES users(id) ON DELETE SET NULL,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID        NULL REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT chk_an_body     CHECK (length(btrim(body)) > 0),
  CONSTRAINT chk_an_archived CHECK ((archived_at IS NULL) = (archived_by IS NULL))
);

CREATE INDEX IF NOT EXISTS idx_an_subject
  ON admin_notes (user_id, created_at DESC)
  WHERE archived_at IS NULL;

-- ---------------------------------------------------------------------------
--
-- PART 2: CUSTOM PROFILE FIELDS
--
-- The brief's example list is Mentor, Founding Member, Trainer, Department,
-- Specialty, University, Graduation Year — and the point is explicitly that
-- the next one should not need a developer.
--
-- Two tables and not a JSONB blob on profiles: a definition has to be listed,
-- ordered, labelled in two languages, given a visibility and retired without
-- touching anybody's stored answer. A blob makes "what fields exist?" a scan
-- of every row, and makes retiring one a rewrite of all of them.
--
-- WHAT THIS DELIBERATELY IS NOT
--
-- It is not a way to add fields the platform then reasons about. Nothing in
-- the gate, the certificates, the hours or the safeguarding path may read a
-- custom field: a rule that depends on a column an admin can retire at 11pm is
-- a rule that stops working at 11pm. These are for recording and displaying.
--
-- And it is not a place for sensitive personal data. Date of birth, phone,
-- guardian details and safeguarding fields have their own homes with their own
-- rules — profiles_sensitive exists precisely so those are not sitting in a
-- general-purpose bag. A custom field called "ملاحظات صحية" would quietly
-- route medical information around every protection built for it, so the admin
-- screen warns, and `visibility` defaults inward.

CREATE TABLE IF NOT EXISTS profile_field_defs (
  id          UUID        NOT NULL PRIMARY KEY,
  -- Stable machine name. Referenced by stored values, so it may not change
  -- once used — the label is what gets corrected when the wording is wrong.
  key         TEXT        NOT NULL UNIQUE,
  label_ar    TEXT        NOT NULL,
  label_en    TEXT        NOT NULL DEFAULT '',
  help_ar     TEXT        NULL,
  help_en     TEXT        NULL,

  -- The eight kinds the brief lists, and no more: each one needs an input, a
  -- validator and a renderer, so this IS a closed set and adding to it is a
  -- code change. Unlike a role title, which is just words.
  kind        TEXT        NOT NULL,

  -- For select / multiselect: [{value, ar, en}], ordered. Empty otherwise.
  options     JSONB       NOT NULL DEFAULT '[]'::jsonb,

  required    BOOLEAN     NOT NULL DEFAULT FALSE,
  visibility  TEXT        NOT NULL DEFAULT 'staff',
  sort_order  INTEGER     NOT NULL DEFAULT 0,

  -- Retiring a field hides it from forms and keeps every answer already given.
  archived_at TIMESTAMPTZ NULL,
  archived_by UUID        NULL REFERENCES users(id) ON DELETE SET NULL,

  created_by  UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_pfd_key   CHECK (key ~ '^[a-z][a-z0-9_]{1,48}$'),
  CONSTRAINT chk_pfd_label CHECK (length(btrim(label_ar)) > 0),
  CONSTRAINT chk_pfd_kind  CHECK (kind IN ('text','longtext','number','date',
                                           'select','multiselect','checkbox','url')),
  CONSTRAINT chk_pfd_vis   CHECK (visibility IN ('public','volunteers','staff')),
  CONSTRAINT chk_pfd_opts  CHECK (jsonb_typeof(options) = 'array'),
  -- A select with nothing to select from is a form that cannot be filled in.
  CONSTRAINT chk_pfd_has_opts CHECK (
    kind NOT IN ('select','multiselect') OR jsonb_array_length(options) > 0),
  CONSTRAINT chk_pfd_archived CHECK ((archived_at IS NULL) = (archived_by IS NULL))
);

CREATE TABLE IF NOT EXISTS profile_field_values (
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  field_id   UUID        NOT NULL REFERENCES profile_field_defs(id) ON DELETE RESTRICT,
  /*
   * The answer, as JSONB: a string, a number, a boolean, or an array for a
   * multiselect. One column rather than eight typed ones, because the kind is
   * already declared next door and duplicating it here would let the two
   * disagree about the same answer.
   *
   * Postgres cannot check the value against the def's kind — that would need a
   * cross-row constraint — so the application validates on write. Stated
   * plainly because "the database will catch it" is exactly the assumption
   * this shape invites.
   */
  value      JSONB       NOT NULL,
  updated_by UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, field_id)
);

CREATE INDEX IF NOT EXISTS idx_pfv_field ON profile_field_values (field_id);

/*
 * Both tables get the same delete refusal as roles and earnings, through the
 * one function migration 045 established and 047 pointed everything at.
 *
 * A note is somebody's record of a conversation and an answer is somebody's
 * own data; neither should vanish because a script wrote DELETE where it meant
 * UPDATE. Archiving is the supported removal, and the hatch is
 * SET LOCAL takaful.allow_delete = 'on' inside a transaction.
 */
CREATE OR REPLACE FUNCTION refuse_deleting_admin_notes()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF takaful_delete_allowed() THEN RETURN OLD; END IF;
  RAISE EXCEPTION 'An admin note is archived, never deleted (id %)', OLD.id
    USING HINT = 'UPDATE admin_notes SET archived_at = now(), archived_by = <who>.';
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_notes_no_delete ON admin_notes;
CREATE TRIGGER trg_admin_notes_no_delete
  BEFORE DELETE ON admin_notes
  FOR EACH ROW EXECUTE FUNCTION refuse_deleting_admin_notes();

CREATE OR REPLACE FUNCTION refuse_deleting_field_defs()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF takaful_delete_allowed() THEN RETURN OLD; END IF;
  RAISE EXCEPTION 'A profile field is archived, never deleted (key %)', OLD.key
    USING HINT = 'Archiving hides it from every form and keeps the answers '
                 'people already gave. Deleting it would take those with it.';
END;
$$;

DROP TRIGGER IF EXISTS trg_field_defs_no_delete ON profile_field_defs;
CREATE TRIGGER trg_field_defs_no_delete
  BEFORE DELETE ON profile_field_defs
  FOR EACH ROW EXECUTE FUNCTION refuse_deleting_field_defs();
