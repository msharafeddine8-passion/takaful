-- 015: badges that are earned by doing, not awarded by clicking.
--
-- Achievements are not certificates. A certificate is a claim made to a
-- stranger and its wording is frozen at issue; an achievement is a mark of
-- something a volunteer did, shown to them and to staff, and it is derived
-- from the same ledgers everything else reads.
--
-- Architecture decision 9 settles the hard part. An achievement is recomputed
-- from state. If the state later falls below the threshold — an hour entry
-- corrected downward, a certificate revoked — the row is marked revoked with a
-- reason and kept. Deleting it would mean a volunteer who saw a badge
-- yesterday finds no trace of it today, and leaving it standing while wrong
-- would make every other figure on the page suspect.
--
-- The catalogue lives in TypeScript, like the courses: an achievement's
-- meaning is authored and translated, and a missing translation should be a
-- compile error rather than a blank badge. What lives here is who earned what,
-- and when.

CREATE TABLE IF NOT EXISTS achievements (
  id            BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Matches a key in the TypeScript catalogue. Text rather than an enum so a
  -- new badge is a code change and not a migration.
  code          TEXT        NOT NULL,

  -- The figure that earned it, frozen: 50 hours, 3 courses, 10 activities.
  -- Without this, a badge cannot explain itself a year later.
  value         INTEGER     NULL,

  earned_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at    TIMESTAMPTZ NULL,
  revoke_reason TEXT        NULL,

  CONSTRAINT chk_achievement_revoked
    CHECK (revoked_at IS NULL OR (revoke_reason IS NOT NULL AND length(btrim(revoke_reason)) >= 3)),
  CONSTRAINT chk_achievement_value CHECK (value IS NULL OR value >= 0)
);

-- Earned once. Falling below the threshold and climbing back revokes and then
-- un-revokes the same row rather than minting a second one, so the date on a
-- badge stays the date it was first earned.
CREATE UNIQUE INDEX IF NOT EXISTS uq_achievement_once ON achievements (user_id, code);
CREATE INDEX IF NOT EXISTS idx_achievement_user
  ON achievements (user_id, earned_at DESC) WHERE revoked_at IS NULL;

COMMENT ON TABLE achievements IS
  'Derived from the hours, course and activity ledgers by recomputeAchievements(). Never awarded by hand; never deleted.';
COMMENT ON COLUMN achievements.value IS
  'The figure that earned the badge at the moment it was earned, so it can explain itself later.';
