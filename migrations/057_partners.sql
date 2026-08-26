-- ---------------------------------------------------------------------------
-- Takaful platform - migration 057
-- Who the association works with, and which project each one backs.
--
-- Additive and safe to run twice.
--
-- Section 56 of the brief lists eight kinds — companies, CSR, universities,
-- NGOs, municipalities, donors, training partners, media partners. `kind` is
-- free text anyway, for the reason role titles and group kinds are: an
-- association meets a ninth kind long before anybody ships a migration, and a
-- partner who does not fit the list is a partner who does not get recorded.
--
-- WHY THE URL IS CHECKED IN THE SCHEMA AND NOT ONLY IN A FORM
--
-- A partner's website is rendered into an href on a public page. A
-- `javascript:` URL there is stored cross-site scripting, and the person who
-- eventually types one will not be an attacker — it will be a paste from a
-- rich-text editor, or a `data:` URI somebody thought was an image.
--
-- src/lib/profile-field-kinds.ts already refuses anything but http and https
-- for the same reason, in TypeScript. This says it again in the one place no
-- future form, import script or admin console can go around. Two statements of
-- one rule is usually a smell; for the rule that decides what a browser is
-- told to execute, it is cheap insurance.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS partners (
  id           UUID        NOT NULL PRIMARY KEY,
  slug         TEXT        NOT NULL UNIQUE,

  name_ar      TEXT        NOT NULL,
  name_en      TEXT        NOT NULL DEFAULT '',
  -- 'شركة', 'جامعة', 'بلدية', 'شريك إعلامي', anything the association says.
  kind         TEXT        NULL,
  summary_ar   TEXT        NOT NULL DEFAULT '',
  summary_en   TEXT        NOT NULL DEFAULT '',

  website_url  TEXT        NULL,
  logo_ref     TEXT        NULL,

  /*
   * Since when. Same precision idea as roles and projects: "since 2022" is the
   * honest answer far more often than a day, and a schema that demands a day
   * gets an invented one it then prints as fact.
   */
  since_on     DATE        NULL,
  since_prec   TEXT        NOT NULL DEFAULT 'day',

  is_published BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order   INTEGER     NOT NULL DEFAULT 0,

  archived_at  TIMESTAMPTZ NULL,
  archived_by  UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  archive_reason TEXT      NULL,

  created_by   UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by   UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_pa_slug CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,60}$'),
  CONSTRAINT chk_pa_name CHECK (length(btrim(name_ar)) > 0),
  CONSTRAINT chk_pa_prec CHECK (since_prec IN ('day','month','year')),
  -- http and https only. Nothing else may reach an href on a public page.
  CONSTRAINT chk_pa_url  CHECK (
    website_url IS NULL OR website_url ~* '^https?://[^\s]+$'
  ),
  CONSTRAINT chk_pa_archived CHECK (
    (archived_at IS NULL) = (archived_by IS NULL)
    AND (archived_at IS NULL
         OR (archive_reason IS NOT NULL AND length(btrim(archive_reason)) > 0))
  )
);

CREATE INDEX IF NOT EXISTS idx_pa_shown
  ON partners (sort_order, name_ar) WHERE is_published AND archived_at IS NULL;

/*
 * Which partner backs which project.
 *
 * A join table here rather than the volunteer_roles trick used for committee
 * and project membership, and the difference is real: a role is about a PERSON
 * and carries a period, achievements and a visibility that belong to them. A
 * partnership is between two organisations and has none of that shape. Reusing
 * roles for it would mean an organisation with a row in a table of people.
 *
 * `note` because "supported the 2024 summer round" is the useful fact, and it
 * belongs to the pairing rather than to either side of it.
 */
CREATE TABLE IF NOT EXISTS project_partners (
  project_id UUID        NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  partner_id UUID        NOT NULL REFERENCES partners(id) ON DELETE RESTRICT,
  note_ar    TEXT        NULL,
  note_en    TEXT        NULL,
  created_by UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, partner_id)
);

CREATE INDEX IF NOT EXISTS idx_pp_partner ON project_partners (partner_id);

CREATE OR REPLACE FUNCTION refuse_deleting_partners()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF takaful_delete_allowed() THEN RETURN OLD; END IF;
  RAISE EXCEPTION 'A partner is archived, never deleted (slug %)', OLD.slug
    USING HINT = 'A partnership that ended still happened. To take it off the '
                 'site set is_published = false; archiving needs a reason.';
END;
$$;

DROP TRIGGER IF EXISTS trg_partners_no_delete ON partners;
CREATE TRIGGER trg_partners_no_delete
  BEFORE DELETE ON partners
  FOR EACH ROW EXECUTE FUNCTION refuse_deleting_partners();

DROP TRIGGER IF EXISTS trg_partners_touch ON partners;
CREATE TRIGGER trg_partners_touch
  BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

/*
 * project_partners is deliberately NOT delete-guarded.
 *
 * Every other guard in this schema protects a record OF something that
 * happened to somebody: a badge earned, a decision walked, a role held, a note
 * written. This row is a link between two rows that both survive it, and
 * unlinking a partner from a project that it never actually backed is an
 * ordinary correction rather than the erasure of anybody's history.
 */
