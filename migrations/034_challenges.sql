-- ---------------------------------------------------------------------------
-- Takaful platform - migration 034
-- Group challenges: one goal the whole association works towards.
--
-- WHAT THIS IS NOT
--
-- It is not a leaderboard. There is no column here for a person's share, no
-- table of contributors, and nothing that could be ordered by who did most.
-- That absence is the design: the moment a per-person figure exists in a row
-- somebody can select, it ends up on a screen next to somebody else's, and a
-- volunteer who gave the four hours they had is shown to be behind. What the
-- association asked for is a community total, and a community total is all
-- this table can produce.
--
-- NO COUNTER COLUMN
--
-- There is deliberately no `progress` or `current_total` column. A counter has
-- to be written by every path that could move it - verifying hours, correcting
-- them, revoking a certificate, cancelling an activity - and the day one path
-- forgets, the figure is wrong and nothing says so. Progress is a SELECT over
-- the source tables, computed on read, so it cannot drift from the facts it
-- claims to summarise. The tables are small (hundreds of volunteers, thousands
-- of rows) and the indexes below are the ones those reads need.
--
-- EVERY METRIC IS ALREADY VERIFIED
--
-- The four metrics below each read a fact somebody checked: hours a supervisor
-- verified, attendance a supervisor confirmed, a certificate that has not been
-- revoked, an activity the association actually ran. Nothing self-reported
-- counts, because a shared goal that can be inflated by typing is a goal the
-- association cannot stand behind when it reports the number to a donor.
--
-- DATES
--
-- starts_on and ends_on are DATE, inclusive at both ends, and they mean
-- calendar days in Beirut. The database session runs GMT, so every read that
-- turns a timestamp into a day must say `AT TIME ZONE 'Asia/Beirut'` first -
-- see src/lib/challenge-progress.ts. A challenge running "this month" gets
-- Beirut month boundaries from beirutMonthWindow() in src/lib/challenges.ts;
-- computing them from a GMT clock would start the month at 02:00 on the 1st
-- and hand the first two hours of every month to the month before.
--
-- Additive and safe to run twice.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS challenges (
  id              UUID        NOT NULL PRIMARY KEY,

  -- Both languages, both required. A challenge with one side missing renders
  -- as a blank card to half the association, and the card is the whole thing.
  name_ar         TEXT        NOT NULL,
  name_en         TEXT        NOT NULL,
  -- Optional: the name usually says it. When it does not, this is where the
  -- association explains why the goal was set.
  description_ar  TEXT        NULL,
  description_en  TEXT        NULL,

  -- What is being counted. Text with a CHECK rather than an enum, so adding a
  -- fifth metric is one migration and not a type rewrite - but the list is
  -- closed on purpose: every value here must be backed by a verified fact that
  -- already exists, and the read module has a query for each one.
  metric          TEXT        NOT NULL,

  -- The goal, in the metric's own base unit: minutes for verified_minutes,
  -- a plain count for the other three. Minutes rather than hours because that
  -- is what hour_entries stores, and a target in a different unit from the
  -- source is an arithmetic mistake waiting for someone in a hurry. The staff
  -- form asks for hours and multiplies - see targetFromInput().
  target          INTEGER     NOT NULL,

  -- Inclusive at both ends, read as Beirut calendar days.
  starts_on       DATE        NOT NULL,
  ends_on         DATE        NOT NULL,

  -- Whether the association is running it now. Separate from archiving: a
  -- challenge can be paused and resumed, and archiving is final.
  is_active       BOOLEAN     NOT NULL DEFAULT true,

  -- ------------------------------------------------------------ audit trail
  created_by      UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Retirement, which is the only way a challenge leaves. Volunteers were
  -- shown this goal and some of them worked towards it; deleting the row would
  -- mean the association had asked for something and then had no record of
  -- ever asking.
  archived_at     TIMESTAMPTZ NULL,
  archived_by     UUID        NULL REFERENCES users(id) ON DELETE RESTRICT,
  archive_reason  TEXT        NULL,

  CONSTRAINT chk_challenge_metric CHECK (metric IN (
    'verified_minutes',  -- hour_entries.minutes where status = 'verified'
    'attendances',       -- activity_attendance where attended
    'certificates',      -- certificates where revoked_at IS NULL
    'activities'         -- activities the association ran
  )),

  -- A target of zero is complete before it starts, and a negative one cannot
  -- be reached at all. Either way the bar means nothing.
  CONSTRAINT chk_challenge_target CHECK (target > 0),

  CONSTRAINT chk_challenge_names CHECK (
    length(btrim(name_ar)) > 0 AND length(btrim(name_en)) > 0
  ),

  -- A single-day challenge is legitimate; a window that ends before it opens
  -- is a typo that would show a volunteer a goal nobody can contribute to.
  CONSTRAINT chk_challenge_window CHECK (ends_on >= starts_on),

  -- Archiving says who and why, for the same reason cancelling an activity
  -- does: the next coordinator to ask "what happened to the hours challenge?"
  -- should find the answer in the row rather than in somebody's memory.
  CONSTRAINT chk_challenge_archived CHECK (
    archived_at IS NULL
    OR (archived_by IS NOT NULL
        AND archive_reason IS NOT NULL
        AND length(btrim(archive_reason)) >= 3)
  ),

  -- An archived challenge is not running. Enforced here so that "is it live?"
  -- has one answer and not two that can disagree.
  CONSTRAINT chk_challenge_archived_inactive CHECK (archived_at IS NULL OR NOT is_active)
);

-- One live challenge per goal. A coordinator double-tapping Create otherwise
-- publishes the same goal twice, and the community then sees its own effort
-- split across two half-full bars.
CREATE UNIQUE INDEX IF NOT EXISTS uq_challenge_live
  ON challenges (metric, starts_on, ends_on, lower(btrim(name_en)))
  WHERE archived_at IS NULL;

-- The account panel's read: live challenges whose window covers today.
CREATE INDEX IF NOT EXISTS idx_challenge_live_window
  ON challenges (starts_on, ends_on) WHERE archived_at IS NULL AND is_active;

-- The staff listing, newest first, archived ones included.
CREATE INDEX IF NOT EXISTS idx_challenge_created ON challenges (created_at DESC);

/*
 * Archived, never deleted - and not merely by convention.
 *
 * The rule is written into the table because the pressure to break it comes
 * later and in a hurry: a challenge created by mistake, a name spelled wrong,
 * a coordinator with psql open. Every one of those is an UPDATE, and this
 * trigger is what says so at the moment somebody reaches for DELETE.
 */
CREATE OR REPLACE FUNCTION challenges_refuse_delete() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'A challenge is archived, never deleted (id %)', OLD.id
    USING HINT = 'UPDATE challenges SET is_active = false, archived_at = now(), '
                 'archived_by = <actor>, archive_reason = <why>';
END;
$$;

DROP TRIGGER IF EXISTS trg_challenges_no_delete ON challenges;
CREATE TRIGGER trg_challenges_no_delete
  BEFORE DELETE ON challenges
  FOR EACH ROW EXECUTE FUNCTION challenges_refuse_delete();

COMMENT ON TABLE challenges IS
  'Shared community goals. Progress is derived from hour_entries, activity_attendance, certificates and activities on read - there is no counter column, and no per-person figure is ever stored or ranked.';
COMMENT ON COLUMN challenges.target IS
  'In the metric base unit: minutes for verified_minutes, a count otherwise.';
COMMENT ON COLUMN challenges.starts_on IS
  'Inclusive. A Beirut calendar day, not a GMT one.';
COMMENT ON COLUMN challenges.ends_on IS
  'Inclusive. A Beirut calendar day, not a GMT one.';
