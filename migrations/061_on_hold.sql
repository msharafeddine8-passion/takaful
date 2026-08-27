-- ---------------------------------------------------------------------------
-- Takaful platform - migration 061
-- «معلَّق» — a decision to pause somebody, which is not the same as their
-- having gone quiet.
--
-- Additive and safe to run twice.
--
-- Section 13 of the brief lists eight standings and nine of ours already
-- answer them. The missing one is On Hold, and it is easy to mistake for
-- inactive_volunteer, which is why the difference is worth writing down before
-- the column exists.
--
--   inactive_volunteer is a DESCRIPTION. Somebody stopped turning up. Nobody
--   decided anything; the platform noticed an absence.
--
--   on_hold is a DECISION. The association has paused this person — at their
--   own request, or while something is being looked at. Somebody made it, and
--   membership_status_history records who and why.
--
-- Collapsing the two loses the state the association most needs during a
-- safeguarding question: a person who is neither active nor accused of
-- anything, whose participation is stopped while it is looked into. Filing
-- that as "inactive" says they drifted away, which is both untrue and unfair
-- to them if it turns out there was nothing in it.
--
-- WHAT IT MEANS FOR ACCESS, AND WHY is_volunteer IS NOT WIDENED
--
-- is_volunteer() decides who may register for an activity, and it is
-- deliberately NOT changed here. A paused volunteer must not be able to sign
-- up for anything — that is the entire point of pausing them. They keep their
-- record, their hours, their badges and their membership number; what stops is
-- taking part.
--
-- That is also why on_hold is not suspended. Suspension shuts the account and
-- ends every session (see setMembershipStatus and the suspend path). A pause
-- leaves somebody able to sign in and read their own record, which matters:
-- being paused should not feel like being erased, and somebody at their own
-- request has done nothing wrong at all.
-- ---------------------------------------------------------------------------

ALTER TABLE membership_status_history DROP CONSTRAINT IF EXISTS chk_msh_new_status;
ALTER TABLE membership_status_history DROP CONSTRAINT IF EXISTS membership_status_history_new_status_check;

/*
 * Both names dropped before the constraint is rebuilt.
 *
 * Migration 029 records why: a constraint added by an early migration can be
 * carrying Postgres's own default name rather than the one the code expects,
 * and dropping only the expected name leaves the real one in place, silently
 * rejecting the new value while the migration reports success. That has
 * happened in this repository twice.
 */
ALTER TABLE membership_status_history ADD CONSTRAINT chk_msh_new_status
  CHECK (new_status IN (
    'registered_user',
    'course_participant',
    'volunteer_applicant',
    'volunteer_candidate',
    'accepted_volunteer',
    'active_volunteer',
    'inactive_volunteer',
    'on_hold',
    'volunteer_alumni',
    'suspended',
    'rejected'
  ));

/*
 * previous_status carries the same values and the same constraint, or a person
 * moved INTO on_hold could be recorded and a person moved OUT of it could not.
 */
ALTER TABLE membership_status_history DROP CONSTRAINT IF EXISTS chk_msh_previous_status;
ALTER TABLE membership_status_history ADD CONSTRAINT chk_msh_previous_status
  CHECK (previous_status IS NULL OR previous_status IN (
    'registered_user',
    'course_participant',
    'volunteer_applicant',
    'volunteer_candidate',
    'accepted_volunteer',
    'active_volunteer',
    'inactive_volunteer',
    'on_hold',
    'volunteer_alumni',
    'suspended',
    'rejected'
  ));

COMMENT ON FUNCTION is_volunteer(UUID) IS
  'Whether this account may take part. Deliberately excludes on_hold: a pause '
  'is a decision to stop somebody taking part while they keep everything they '
  'have earned. It also excludes suspended and rejected, and includes alumni, '
  'who keep the standing they earned.';
