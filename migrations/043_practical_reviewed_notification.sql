-- ---------------------------------------------------------------------------
-- Takaful platform - migration 043
-- Telling a learner that a trainer has read their work.
--
-- Additive and safe to run twice.
--
-- Migration 041 built practical submissions and deliberately stopped short of
-- a notification, for a reason worth recording: chk_notification_kind is a
-- shared CHECK and NotificationKind is a shared union, migration 040 did not
-- exist in the tree at the time, and a later migration that rewrote this
-- constraint the way 037 did would have silently dropped a kind added ahead of
-- it. Numbering has settled since, so the missing half is finished here.
--
-- Without it a volunteer submits an activity plan and then has to guess. The
-- only way to learn that a trainer sent it back is to open the course page and
-- look — so the ones who check are told, and the ones who assume no news means
-- no verdict wait indefinitely for a message that was never coming.
--
-- ONE KIND FOR BOTH OUTCOMES.
--
-- Not 'practical.approved' and 'practical.returned'. The mute list works by
-- kind, and two kinds would let somebody switch off the bad news and keep the
-- good, which is not a setting anybody should be offered about their own
-- assessed work. The title says which happened; the switch treats them as one
-- subject because they are one subject.
--
-- src/lib/notify.ts also lists this in ALWAYS_SEND, beside hours.rejected. It
-- is the same category of message: something the association needs the person
-- to act on, where silence would be read as approval.
-- ---------------------------------------------------------------------------

-- Both names dropped, and this is not defensive coding.
--
-- Migration 029 found the constraint living under Postgres's default name,
-- `notifications_kind_check`, while the code dropped only the name it had
-- given it. The drop succeeded, did nothing, and the old constraint went on
-- rejecting the new kind — a migration that applies cleanly and changes
-- nothing.
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS chk_notification_kind;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_kind_check;

ALTER TABLE notifications ADD CONSTRAINT chk_notification_kind CHECK (kind IN (
  'application.accepted', 'application.waitlisted', 'application.rejected',
  'hours.verified', 'hours.rejected', 'hours.corrected',
  'stage.unlocked', 'stage.completed',
  'certificate.issued',
  'activity.reminder', 'activity.registered', 'activity.attended',
  'activity.scheduled',
  'course.available', 'account.welcome',
  'badge.earned', 'milestone.reached',
  'birthday.greeting',
  -- The one this migration adds. Sent to the learner when a named trainer has
  -- read their practical work, whichever way it went.
  'practical.reviewed'
));
