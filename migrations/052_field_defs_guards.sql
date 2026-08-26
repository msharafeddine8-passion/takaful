-- ---------------------------------------------------------------------------
-- Takaful platform - migration 052
-- Five holes in 048, found while writing the code against it.
--
-- Additive and safe to run twice. There are no rows in either table yet, so
-- every constraint below can be added without a backfill — which is the only
-- reason this is cheap today and would not be next month.
-- ---------------------------------------------------------------------------
--
-- 1. NOBODY IS RECORDED CHANGING A DEFINITION
--
-- 048 gave profile_field_defs created_by and archived_by, and made admin_notes
-- insist on attribution to the point of author_id NOT NULL. Then it left the
-- single highest-blast-radius change in the feature — moving a field from
-- 'staff' to 'public', which puts every answer already given on the open web —
-- leaving no trace on the row at all.

ALTER TABLE profile_field_defs
  ADD COLUMN IF NOT EXISTS updated_by UUID NULL REFERENCES users(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
--
-- 2. `value JSONB NOT NULL` DOES NOT MEAN WHAT IT LOOKS LIKE
--
-- The JSON scalar 'null'::jsonb satisfies NOT NULL. So "no answer" was
-- storable as an answer, in the column the migration itself admits Postgres
-- cannot check against its definition. Clearing an answer removes the row.

ALTER TABLE profile_field_values
  DROP CONSTRAINT IF EXISTS chk_pfv_not_json_null;
ALTER TABLE profile_field_values
  ADD CONSTRAINT chk_pfv_not_json_null CHECK (jsonb_typeof(value) <> 'null');

-- ---------------------------------------------------------------------------
--
-- 3. THE OPTIONS SHAPE WAS A COMMENT, NOT A CONSTRAINT
--
-- chk_pfd_opts only asked for an array, so [1,2,3] was storable, and so were
-- two options sharing a value — which makes an answer ambiguous about which
-- one was chosen. A CHECK cannot hold a subquery, but it can call an IMMUTABLE
-- function, and jsonb_array_elements over a handful of options is cheap.

CREATE OR REPLACE FUNCTION valid_field_options(opts JSONB)
RETURNS BOOLEAN
LANGUAGE sql IMMUTABLE AS $$
  SELECT jsonb_typeof(opts) = 'array'
     AND NOT EXISTS (
           SELECT 1 FROM jsonb_array_elements(opts) AS o
            WHERE jsonb_typeof(o) <> 'object'
               OR o->>'value' IS NULL
               OR length(btrim(o->>'value')) = 0
               OR o->>'ar' IS NULL
               OR length(btrim(o->>'ar')) = 0)
     AND (SELECT count(DISTINCT o->>'value') FROM jsonb_array_elements(opts) AS o)
       = (SELECT count(*) FROM jsonb_array_elements(opts) AS o);
$$;

ALTER TABLE profile_field_defs
  DROP CONSTRAINT IF EXISTS chk_pfd_opts_shape;
ALTER TABLE profile_field_defs
  ADD CONSTRAINT chk_pfd_opts_shape CHECK (valid_field_options(options));

-- ---------------------------------------------------------------------------
--
-- 4. AND 5. TWO THINGS A CHECK CANNOT SAY
--
-- updated_at was set by a DEFAULT and never moved again, on the one table
-- whose whole design premise is that editing keeps the row: "what it says now"
-- and "when it last changed" could disagree for ever, silently.
--
-- And `kind` was frozen nowhere. 048 froze `key` in a comment and said nothing
-- about kind — but turning a `select` into a `number` after fifty people have
-- answered leaves fifty stored values that no longer match their definition,
-- in a column nothing ever re-validates. The application already refuses it;
-- the schema should not be relying on the application to remember.
--
-- A field whose kind was wrong is archived and replaced. The answers already
-- given stay attached to the definition they were given under, which is the
-- only reading of them that is true.

CREATE OR REPLACE FUNCTION field_defs_before_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.kind IS DISTINCT FROM OLD.kind THEN
    RAISE EXCEPTION
      'A profile field''s kind is fixed once created (% -> %, key %)',
      OLD.kind, NEW.kind, OLD.key
      USING HINT = 'Archive this field and create another. Answers already given '
                   'stay attached to the definition they were given under, which '
                   'is the only reading of them that is true.';
  END IF;

  IF NEW.key IS DISTINCT FROM OLD.key THEN
    RAISE EXCEPTION 'A profile field''s key is fixed once created (% -> %)',
      OLD.key, NEW.key
      USING HINT = 'Stored answers reference it. Correct the label instead.';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_field_defs_before_update ON profile_field_defs;
CREATE TRIGGER trg_field_defs_before_update
  BEFORE UPDATE ON profile_field_defs
  FOR EACH ROW EXECUTE FUNCTION field_defs_before_update();

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_notes_touch ON admin_notes;
CREATE TRIGGER trg_admin_notes_touch
  BEFORE UPDATE ON admin_notes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_volunteer_roles_touch ON volunteer_roles;
CREATE TRIGGER trg_volunteer_roles_touch
  BEFORE UPDATE ON volunteer_roles
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
