-- ---------------------------------------------------------------------------
-- Takaful platform - migration 053
-- The figures on the front page, out of the code and into a table.
--
-- Additive and safe to run twice.
--
-- They have been literals in src/lib/dictionaries/ar.ts and en.ts, which means
-- correcting "300+ active volunteers" needs a developer, a commit and a
-- deploy. Nobody does that for a number, so the number goes stale and the
-- front page slowly stops being true.
--
-- WRITTEN, NOT COMPUTED, AND THAT IS DELIBERATE
--
-- The tempting version derives these from the platform: count the activities,
-- sum the verified hours, count the volunteers. It would be wrong here, and
-- badly.
--
-- The association is far older than this software. It has 39 accounts and a
-- roster of 457 people, ten activities recorded and years of work that
-- predates anything in this database. A derived figure would not be a truer
-- claim — it would be the association describing itself by how much of its own
-- history happens to have been typed in yet.
--
-- So a figure is a claim somebody makes, `value_text` is text ("4,000+" is not
-- a number), and two columns keep it honest:
--
--   `source_note` — where this figure comes from. Not published; it exists so
--   that in two years somebody can ask "where did 4,000 come from?" and get an
--   answer better than a shrug.
--
--   `updated_by` — who last said so. A public claim about an association
--   should have somebody's name behind it, even internally.
--
-- The staff screen shows, beside each figure, what the platform itself can
-- evidence right now. Not to overwrite the claim — to let whoever edits it see
-- how far the claim has drifted from anything the system could stand behind.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS impact_numbers (
  id           UUID        NOT NULL PRIMARY KEY,
  -- Stable machine name, so a figure keeps its identity when its wording is
  -- corrected. Referenced by the staff screen to pair it with a computed hint.
  key          TEXT        NOT NULL UNIQUE,
  label_ar     TEXT        NOT NULL,
  label_en     TEXT        NOT NULL DEFAULT '',
  -- "300+", "4,000+", "7". Text because every one of those is text.
  value_text   TEXT        NOT NULL,
  -- Internal. Where the figure comes from; never rendered publicly.
  source_note  TEXT        NULL,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  is_published BOOLEAN     NOT NULL DEFAULT TRUE,

  updated_by   UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_in_key   CHECK (key ~ '^[a-z][a-z0-9_]{1,48}$'),
  CONSTRAINT chk_in_label CHECK (length(btrim(label_ar)) > 0),
  CONSTRAINT chk_in_value CHECK (length(btrim(value_text)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_in_shown
  ON impact_numbers (sort_order, key) WHERE is_published;

/*
 * Seeded with exactly what the front page says today.
 *
 * Not with zeroes, and not with anything derived. The deploy that ships this
 * must change nothing a visitor sees: a migration whose side effect is the
 * home page suddenly claiming different numbers is a migration that edited the
 * association's public statements about itself without anybody deciding to.
 *
 * ON CONFLICT DO NOTHING so re-running never overwrites a figure somebody has
 * since corrected through the admin screen.
 */
INSERT INTO impact_numbers (id, key, label_ar, label_en, value_text, sort_order, source_note)
VALUES
  (gen_random_uuid(), 'active_volunteers', 'متطوّع نشط', 'active volunteers', '300+', 1,
   'Carried over from the hard-coded front page, August 2026. Origin unrecorded.'),
  (gen_random_uuid(), 'families_supported', 'عائلة تلقّت دعماً', 'families supported', '4,000+', 2,
   'Carried over from the hard-coded front page, August 2026. Origin unrecorded.'),
  (gen_random_uuid(), 'activities_run', 'نشاط اجتماعي وثقافي', 'social and cultural activities', '500+', 3,
   'Carried over from the hard-coded front page, August 2026. Origin unrecorded.'),
  (gen_random_uuid(), 'youth_trained', 'شاب وشابة تدرّبوا', 'young people trained', '1,200+', 4,
   'Carried over from the hard-coded front page, August 2026. Origin unrecorded.'),
  (gen_random_uuid(), 'sustained_projects', 'مشاريع مستدامة', 'sustained projects', '7', 5,
   'Carried over from the hard-coded front page, August 2026. Origin unrecorded.')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION touch_impact_numbers()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_impact_numbers_touch ON impact_numbers;
CREATE TRIGGER trg_impact_numbers_touch
  BEFORE UPDATE ON impact_numbers
  FOR EACH ROW EXECUTE FUNCTION touch_impact_numbers();
