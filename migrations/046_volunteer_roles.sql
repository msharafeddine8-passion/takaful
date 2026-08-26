-- ---------------------------------------------------------------------------
-- Takaful platform - migration 046
-- What somebody has been inside Takaful, and when — kept, not overwritten.
--
-- Additive and safe to run twice.
--
-- WHY THIS IS A TABLE AND NOT A COLUMN ON THE PROFILE
--
-- The obvious cheap version of this feature is a `current_role TEXT` on
-- profiles. It is wrong twice over, and both ways are the point of the brief.
--
-- First, one person holds several roles at once. Somebody can be running a
-- project, sitting on the media committee and mentoring, all this month. A
-- single column forces whoever edits it to pick the one that sounds biggest
-- and silently throw the others away.
--
-- Second, and worse: a column is overwritten. The day a new committee
-- president is appointed, the old one stops ever having been president. That
-- is the association deleting its own history one promotion at a time — and it
-- is exactly what the brief says must not happen. A row per role, with dates,
-- means appointing a successor ADDS a row and closes one; it removes nothing.
--
-- NOTHING HERE IS A FIXED LIST
--
-- `title_ar`, `title_en` and `role_type` are free text on purpose. There is no
-- enum of President / Project Manager / Committee Leader, no lookup table of
-- permitted titles, and no CHECK constraint naming any role. An association
-- invents responsibilities faster than anybody ships a migration, and every
-- title that has to be added by a developer is a title that does not get
-- recorded. The admin screens offer what has been used before as suggestions,
-- read from this table — never as the permitted set.
--
-- This is a data model, not a permission model. `user_roles` is what somebody
-- may DO in the software; this is what they ARE in the association. A person
-- can be titled "رئيس لجنة الإعلام" here and hold no extra permission at all,
-- and someone can be a super_admin here titled nothing. Conflating the two
-- would mean an honorific quietly handing out access.
--
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS volunteer_roles (
  id            UUID        NOT NULL PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Free text, both languages. The Arabic is what the association actually
  -- says; the English is for the passport and the CV a volunteer exports, and
  -- may be left empty rather than machine-translated badly.
  title_ar      TEXT        NOT NULL,
  title_en      TEXT        NOT NULL DEFAULT '',

  -- "منصب", "لجنة", "مشروع", "مهمة خاصة", or anything else somebody types.
  -- Free text, and nullable: a title with no category is still worth keeping.
  role_type     TEXT        NULL,

  -- What the role was attached to. Polymorphic on purpose: committees, teams
  -- and projects do not all exist as tables yet, and a role must be
  -- recordable today for a committee that becomes a row next month.
  --
  -- No foreign key, because one column cannot reference four tables. The
  -- application resolves it and is the only thing that may write it. That is a
  -- real cost, stated plainly rather than hidden: an entity deleted out from
  -- under a role leaves a dangling id, so entity deletion is soft everywhere
  -- this points.
  entity_kind   TEXT        NULL,
  entity_id     UUID        NULL,
  -- Or just a name, typed by hand, when the thing has no row anywhere.
  entity_name   TEXT        NULL,

  /*
   * Dates, and how much of each one is actually known.
   *
   * DATE and not TIMESTAMPTZ: this is a calendar fact about a person, not an
   * instant. The session runs GMT and the association is in Beirut, and a
   * timestamp would put a role that started on the 1st into the previous
   * month for anybody rendering it through a Date.
   *
   * Precision, because the brief asks for "Month / Year أو Full Date". Nobody
   * remembers the day they joined the activities committee in 2022, and a
   * schema that demands one gets a made-up day it then displays as fact. The
   * precision column is what lets the timeline print "2022" honestly instead.
   */
  started_on    DATE        NULL,
  started_prec  TEXT        NOT NULL DEFAULT 'day',
  ended_on      DATE        NULL,
  ended_prec    TEXT        NOT NULL DEFAULT 'day',

  /*
   * Current, held separately from ended_on rather than derived from it.
   *
   * "No end date" and "still doing it" are different facts. A role that ended
   * in 2023 on a date nobody wrote down is past with a null ended_on, and
   * deriving current-ness from the null would resurrect it. chk_vr_current
   * below stops the one combination that is genuinely contradictory: a role
   * that is current and also ended.
   */
  is_current    BOOLEAN     NOT NULL DEFAULT TRUE,

  description   TEXT        NULL,

  /*
   * Achievements, as an ordered list of {ar, en}.
   *
   * JSONB rather than a child table: they are read only with their role, never
   * queried across people, and never counted — a table would invite exactly
   * the "who has the most achievements" query this platform keeps refusing to
   * make possible. `en` may be an empty string and the reader falls back.
   */
  achievements  JSONB       NOT NULL DEFAULT '[]'::jsonb,

  /*
   * Who may see this role. Per role, not per person: somebody may be happy to
   * have "متطوّع" on a public page and want an internal safeguarding
   * responsibility seen by staff only.
   *
   * Defaults to 'volunteers' — signed-in members — rather than 'public'.
   * Migration 038 made appearing publicly the default for a NAME AND PHOTO,
   * which the person chose to publish. A list of who ran what is a different
   * thing to put on the open web, and the safe default for it is inward.
   */
  visibility    TEXT        NOT NULL DEFAULT 'volunteers',

  /*
   * Soft delete. The brief asks for it by name, and the reason is the same one
   * this whole table exists for: a role removed by mistake is a piece of
   * somebody's history that nothing else in the system remembers.
   */
  archived_at   TIMESTAMPTZ NULL,
  archived_by   UUID        NULL REFERENCES users(id) ON DELETE SET NULL,

  created_by    UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by    UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_vr_title       CHECK (length(btrim(title_ar)) > 0),
  CONSTRAINT chk_vr_prec        CHECK (started_prec IN ('day','month','year')
                                   AND ended_prec   IN ('day','month','year')),
  -- A role cannot be current and finished at the same time.
  CONSTRAINT chk_vr_current     CHECK (NOT is_current OR ended_on IS NULL),
  -- Nor can it have ended before it began.
  CONSTRAINT chk_vr_order       CHECK (started_on IS NULL OR ended_on IS NULL
                                   OR ended_on >= started_on),
  -- Either it points at a row, or it names something by hand. Not both: two
  -- answers to "what was this attached to" is one answer too many.
  CONSTRAINT chk_vr_entity      CHECK (entity_id IS NULL OR entity_name IS NULL),
  CONSTRAINT chk_vr_entity_kind CHECK (entity_id IS NULL OR entity_kind IS NOT NULL),
  CONSTRAINT chk_vr_visibility  CHECK (visibility IN ('public','volunteers','staff')),
  CONSTRAINT chk_vr_achievements CHECK (jsonb_typeof(achievements) = 'array'),
  CONSTRAINT chk_vr_archived    CHECK ((archived_at IS NULL) = (archived_by IS NULL))
);

-- One person's roles, newest first — the timeline query, and the common one.
--
-- `is_current DESC` is what puts current roles at the top; the NULLS LAST is
-- about started_on, so a role whose start nobody recorded sorts to the bottom
-- of the past rather than the top of it.
--
-- (This comment claimed NULLS FIRST "because a current role has no end date"
-- when it was written, which described neither this index nor any sensible
-- one — the null being ordered here is a START date. The SQL was right and the
-- sentence was wrong; corrected rather than preserved, because it was never
-- true of anything.)
CREATE INDEX IF NOT EXISTS idx_vr_person
  ON volunteer_roles (user_id, is_current DESC, started_on DESC NULLS LAST)
  WHERE archived_at IS NULL;

-- "Everyone who has ever been attached to project X."
CREATE INDEX IF NOT EXISTS idx_vr_entity
  ON volunteer_roles (entity_kind, entity_id)
  WHERE archived_at IS NULL AND entity_id IS NOT NULL;

/*
 * Searching by title.
 *
 * The brief's own examples are searches: "everyone who was once a committee
 * president", "everyone who took charge of a project". Those are text matches
 * over a free-text column, so they are trigram matches or they are sequential
 * scans over the whole table. pg_trgm ships with Postgres and Neon has it.
 *
 * Guarded, because a missing extension must not take the migration down with
 * it — the roles still work without the index, only slower.
 */
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  CREATE INDEX IF NOT EXISTS idx_vr_title_ar
    ON volunteer_roles USING gin (title_ar gin_trgm_ops);
  CREATE INDEX IF NOT EXISTS idx_vr_title_en
    ON volunteer_roles USING gin (title_en gin_trgm_ops);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_trgm unavailable; role title search will scan (%)', SQLERRM;
END $$;

/*
 * Deleting a role is refused, the way earnings are.
 *
 * Same argument as migration 044, and the same deliberate escape hatch from
 * 045 for the sweep and the probes: BEGIN; SET LOCAL takaful.allow_delete =
 * 'on'; DELETE ...; COMMIT.
 *
 * Archiving is the supported way to remove one, and it keeps the row.
 */
CREATE OR REPLACE FUNCTION refuse_deleting_volunteer_roles()
RETURNS TRIGGER AS $$
BEGIN
  IF current_setting('takaful.allow_delete', true) = 'on' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION
    'A volunteer role is archived, never deleted (id %). Set archived_at instead.',
    OLD.id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_volunteer_roles_no_delete ON volunteer_roles;
CREATE TRIGGER trg_volunteer_roles_no_delete
  BEFORE DELETE ON volunteer_roles
  FOR EACH ROW EXECUTE FUNCTION refuse_deleting_volunteer_roles();
