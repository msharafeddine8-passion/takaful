-- ---------------------------------------------------------------------------
-- Takaful platform - migration 021
-- The rest of what an activity is: how to find it, who it is for, and whether
-- anybody is meant to see it yet.
--
-- Additive and safe to run twice. Every existing activity comes out with the
-- new columns NULL and published = true — which is what they already are: real
-- activities that volunteers can see. Nothing is hidden by this migration.
-- ---------------------------------------------------------------------------

-- What kind of thing it is. Free text rather than an enum: an association
-- invents a new kind of activity faster than anyone deploys a migration.
ALTER TABLE activities ADD COLUMN IF NOT EXISTS activity_type TEXT NULL;

-- Who it is aimed at, in the organisation's own words.
ALTER TABLE activities ADD COLUMN IF NOT EXISTS audience TEXT NULL;

/*
 * A link to the place on a map. Stored as given but constrained to http(s):
 * this is rendered as an anchor a volunteer will tap, and `javascript:` in an
 * href is a script running in their session.
 */
ALTER TABLE activities ADD COLUMN IF NOT EXISTS map_url TEXT NULL;
ALTER TABLE activities DROP CONSTRAINT IF EXISTS chk_activities_map_url;
ALTER TABLE activities ADD CONSTRAINT chk_activities_map_url
  CHECK (map_url IS NULL OR map_url ~* '^https?://');

ALTER TABLE activities ADD COLUMN IF NOT EXISTS image_url TEXT NULL;
ALTER TABLE activities DROP CONSTRAINT IF EXISTS chk_activities_image_url;
ALTER TABLE activities ADD CONSTRAINT chk_activities_image_url
  CHECK (image_url IS NULL OR image_url ~* '^(https?://|/)');

/*
 * The hours an attendee is credited with, when that is fixed by the activity
 * rather than by how long each person stayed. NULL means "use the clock",
 * which is what the attendance sheet already does.
 */
ALTER TABLE activities ADD COLUMN IF NOT EXISTS credited_minutes INTEGER NULL;
ALTER TABLE activities DROP CONSTRAINT IF EXISTS chk_activities_credited;
ALTER TABLE activities ADD CONSTRAINT chk_activities_credited
  CHECK (credited_minutes IS NULL OR (credited_minutes > 0 AND credited_minutes <= 1440));

-- Some activities are applied for rather than simply joined.
ALTER TABLE activities ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN NOT NULL DEFAULT false;

/*
 * Draft or published. Default true so that every activity written before this
 * migration stays visible: a column added as false would have silently emptied
 * the opportunities page.
 */
ALTER TABLE activities ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

-- The listing reads "published, not cancelled, not archived" on every request.
CREATE INDEX IF NOT EXISTS idx_activities_published
  ON activities (starts_at)
  WHERE is_published AND cancelled_at IS NULL AND NOT is_archived;

COMMENT ON COLUMN activities.credited_minutes IS
  'Fixed credit for attending, when the organisation sets one. NULL means the attendance sheet uses the activity''s own length.';
COMMENT ON COLUMN activities.is_published IS
  'False keeps a half-written activity off the public listing. Existing rows default to true so nothing already visible disappears.';
