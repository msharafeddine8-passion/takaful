-- ---------------------------------------------------------------------------
-- Takaful platform - migration 036
-- Monthly recognition: Volunteer of the Month, Rising Star, Continuity Maker
-- and Team of the Month.
--
-- Additive and safe to run twice.
--
-- THE ONE RULE THIS TABLE EXISTS TO ENCODE
--
-- The system nominates, a person decides. Nobody wins on points alone. So
-- every row here carries `decided_by` and `reason`, both NOT NULL, and there
-- is no path that writes one without them. A recognition the platform awarded
-- by arithmetic would be a leaderboard with a rosette on it, and the whole
-- point of the four awards is that somebody who knows the volunteers looked at
-- a shortlist and chose.
--
-- The shortlist is computed on read - see src/lib/awards.ts - and is never
-- stored. That is deliberate and it is the most important absence in this
-- file.
--
-- THERE IS NO NOMINEE TABLE, AND THERE MUST NEVER BE ONE
--
-- Four people are shortlisted for each award every month and one is chosen.
-- The other four did nothing wrong; they are simply not the person the
-- committee picked. A `recognition_nominations` table would put "considered
-- and passed over" on somebody's record forever, and the day it exists it ends
-- up joined into a staff listing, a CSV export or an email, and a volunteer
-- reads that the association thought about them and said no.
--
-- So the shortlist lives for the length of one HTTP request, is rendered to
-- the people making the decision, and is gone. Nothing in this schema can
-- reproduce it, which is the only guarantee worth having.
--
-- PERIODS ARE TEXT, 'YYYY-MM'
--
-- Not a DATE, not a month boundary computed from a timestamp. The database
-- session runs GMT and the association is in Beirut: a month worked out from a
-- GMT clock begins at 02:00 on the 1st and hands the first two hours of every
-- month to the month before. Every comparison here and in src/lib/awards.ts is
-- a string comparison, and 'YYYY-MM' sorts correctly as text for every month
-- this association will ever see.
--
-- The three-month cooling-off is answered from this column too: "did this
-- person win in the last three periods" is `period > <p minus 3>`, which is
-- arithmetic on text and has no timezone in it at all.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS recognition_awards (
  id              UUID        NOT NULL PRIMARY KEY,

  -- The month being recognised, 'YYYY-MM'. Not the month somebody clicked:
  -- August's award is August's award whether it was decided on the 31st or in
  -- the middle of October, and a cooling-off measured from the click would
  -- punish a volunteer for how late the committee met.
  period          TEXT        NOT NULL,

  award           TEXT        NOT NULL,

  -- ---------------------------------------------------------- who won
  --
  -- Exactly one of these two, decided by the award kind and enforced below.
  -- Two columns rather than one polymorphic "subject" text: a UUID that
  -- REFERENCES users is a promise the database keeps, and a committee name is
  -- a label with no row behind it. Collapsing them would give up the first to
  -- accommodate the second.

  user_id         UUID        NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- The committee label, copied from volunteer_roster.committee at the moment
  -- of the decision rather than referenced.
  --
  -- IT IS A HISTORICAL LABEL, NOT LIVE MEMBERSHIP. The column it comes from
  -- was filled by the 2024 roster import - 337 of 457 lines carry one - and
  -- nothing in this platform maintains it. It records which committee somebody
  -- was on when the association last wrote its spreadsheet. Copying the text
  -- here means an award to «لجنة الإغاثة» in August 2026 still reads as that
  -- committee in 2029, after the roster has been re-imported and the label
  -- renamed or dropped.
  team            TEXT        NULL,

  -- ------------------------------------------------------- who decided
  --
  -- NOT NULL, unlike volunteer_roster.approved_by, and that difference is the
  -- design. A roster claim can be recognised by a rule because the evidence
  -- speaks for itself; an award cannot, because there is no evidence that
  -- speaks for itself about who gave the most of themselves this month.
  decided_by      UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Why this person, in the decider's own words. Required, and required to be
  -- a sentence rather than a keystroke: it is read out when the award is
  -- announced, it is what the volunteer is told, and it is the only answer to
  -- "why them and not somebody else" that will still exist next year.
  reason          TEXT        NOT NULL,

  decided_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- ------------------------------------------------- what was in front of them
  --
  -- The winner's own figures for that month, frozen. Not the shortlist - see
  -- the note at the top - just the figures belonging to the person who won, so
  -- the award can explain itself after the hours ledger has been corrected
  -- half a dozen times. Nullable because a Team of the Month has no personal
  -- figures and a very early award may predate the columns being filled.
  minutes         INTEGER     NULL,
  attendances     INTEGER     NULL,

  -- For a team: how many of its members were actually active that month. The
  -- ranking is by average per active member and this is the divisor, so
  -- without it the published figure cannot be checked.
  active_members  INTEGER     NULL,

  -- The badge this award granted, e.g. 'award-volunteer-2026-08'. Points at a
  -- row in `achievements`. Stored rather than recomputed so that a badge later
  -- withdrawn can still be traced back to the decision that granted it.
  badge_code      TEXT        NULL,

  CONSTRAINT chk_award_period CHECK (period ~ '^\d{4}-(0[1-9]|1[0-2])$'),

  -- Text with a CHECK rather than an enum, matching every other controlled
  -- vocabulary in this schema: a CHECK can be widened in one statement and an
  -- enum cannot be narrowed at all. The list mirrors AWARD_KINDS in
  -- src/lib/awards.ts, and the two are one rule written twice.
  CONSTRAINT chk_award_kind CHECK (award IN (
    'volunteer_of_the_month',
    'rising_star',
    'continuity_maker',
    'team_of_the_month'
  )),

  -- A person award names a person; the team award names a team. Never both,
  -- never neither. Without this a bug could write an award nobody holds, and
  -- the honours page would render a month with a blank winner.
  CONSTRAINT chk_award_subject CHECK (
    (award = 'team_of_the_month' AND team IS NOT NULL AND length(btrim(team)) > 0
                                 AND user_id IS NULL)
    OR (award <> 'team_of_the_month' AND user_id IS NOT NULL AND team IS NULL)
  ),

  -- Ten characters, the same floor the manual badge grant and the direct
  -- volunteer acceptance already use. "ok" is not a reason.
  CONSTRAINT chk_award_reason CHECK (length(btrim(reason)) >= 10),

  -- Nobody gives themselves an award. The same rule roster approval and manual
  -- badge grants already carry, written into the table for the same reason
  -- they are: the application check is one refactor away from being skipped.
  CONSTRAINT chk_award_no_self CHECK (user_id IS NULL OR user_id <> decided_by),

  -- Counts are counts.
  CONSTRAINT chk_award_figures CHECK (
    (minutes IS NULL OR minutes >= 0)
    AND (attendances IS NULL OR attendances >= 0)
    AND (active_members IS NULL OR active_members > 0)
  )
);

-- ONE WINNER PER AWARD PER PERIOD.
--
-- Not a nicety: two coordinators reading the same shortlist and pressing
-- Approve within a few seconds of each other is the ordinary case, not the
-- exotic one, and without this the honours page would show August with two
-- Volunteers of the Month and no way to say which was meant. Total rather than
-- partial - there is no soft-delete here, because there is no delete at all.
CREATE UNIQUE INDEX IF NOT EXISTS uq_award_once
  ON recognition_awards (period, award);

-- The honours page reads newest month first, and the archive reads the same
-- way with an older cut-off. One index serves both.
CREATE INDEX IF NOT EXISTS idx_award_period ON recognition_awards (period DESC, award);

-- The cooling-off query: "when did this person last win this award?" It runs
-- once per candidate per shortlist, which is the hottest read in the feature.
CREATE INDEX IF NOT EXISTS idx_award_winner
  ON recognition_awards (user_id, award, period DESC) WHERE user_id IS NOT NULL;

/*
 * Never deleted, and not merely by convention.
 *
 * The archive of past months IS this table - there is no second table it gets
 * copied into, and no `archived` flag, because an award does not stop being
 * true. What the association needs to protect against is the ordinary,
 * well-meant DELETE: an award given to the wrong person, a name spelled wrong,
 * a coordinator with psql open and an apology to make.
 *
 * Erasing the row is exactly the wrong repair. The volunteer was told, the
 * badge is on their wall, and the announcement was read out in a meeting;
 * deleting the record leaves all of that standing with nothing behind it, and
 * the next person to ask who won August finds silence. A mistake is corrected
 * by withdrawing the badge with a reason - which leaves both the mistake and
 * the correction on the record - and by giving the next month's award
 * properly.
 *
 * Modelled on the same trigger in migration 034.
 */
CREATE OR REPLACE FUNCTION recognition_awards_refuse_delete() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'A recognition award is permanent (id %, % for %)', OLD.id, OLD.award, OLD.period
    USING HINT = 'An award given in error is corrected by withdrawing the badge with a '
                 'reason (achievements.revoked_at / revoke_reason), never by deleting the '
                 'decision. The volunteer was already told.';
END;
$$;

DROP TRIGGER IF EXISTS trg_recognition_awards_no_delete ON recognition_awards;
CREATE TRIGGER trg_recognition_awards_no_delete
  BEFORE DELETE ON recognition_awards
  FOR EACH ROW EXECUTE FUNCTION recognition_awards_refuse_delete();

COMMENT ON TABLE recognition_awards IS
  'One decided award per month per kind. The shortlist that produced it is computed on read and never stored: there is deliberately no record anywhere of who was nominated and not chosen.';
COMMENT ON COLUMN recognition_awards.period IS
  'The month recognised, YYYY-MM as text. Never derived from a timestamp - the session runs GMT and the association is in Beirut.';
COMMENT ON COLUMN recognition_awards.team IS
  'A committee label copied from volunteer_roster.committee at the moment of the decision. That column is a HISTORICAL label from the 2024 roster import, not live membership, and nothing maintains it.';
COMMENT ON COLUMN recognition_awards.reason IS
  'Why this winner, in the decider''s own words. Required: the system nominates, a person decides.';
COMMENT ON COLUMN recognition_awards.badge_code IS
  'The month-and-year badge this award granted, e.g. award-volunteer-2026-08. Points at achievements.code.';
