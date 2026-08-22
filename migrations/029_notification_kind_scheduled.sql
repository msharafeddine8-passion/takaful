-- ---------------------------------------------------------------------------
-- Takaful platform - migration 029
-- Actually allow 'activity.scheduled'.
--
-- Migration 028 tried to, and quietly failed. It dropped
-- `notifications_kind_check` — Postgres's default name for such a constraint,
-- and not the name this one has — and then added a second constraint under
-- that default name. `DROP CONSTRAINT IF EXISTS` on a name that does not exist
-- succeeds silently, so the migration reported ok while the real constraint,
-- `chk_notification_kind`, sat untouched and went on rejecting the new kind.
--
-- The failure mode was the worst available: nothing broke at write time in
-- development, because nothing had sent one of these yet. The first time it
-- would have mattered is the first time a coordinator scheduled an activity
-- somebody was waiting for — the notification would have thrown, inside the
-- transaction that marks people as notified, and the whole edit would have
-- rolled back. The coordinator would have seen a save that failed for no
-- visible reason.
--
-- probe-interest caught it by trying to insert the row rather than trusting
-- that the migration which claimed to allow it had.
-- ---------------------------------------------------------------------------

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS chk_notification_kind;
-- The stray one 028 added under the default name, so there is exactly one.
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_kind_check;

ALTER TABLE notifications ADD CONSTRAINT chk_notification_kind
  CHECK (kind = ANY (ARRAY[
    'application.accepted', 'application.waitlisted', 'application.rejected',
    'hours.verified', 'hours.rejected', 'hours.corrected',
    'stage.unlocked', 'stage.completed',
    'certificate.issued',
    'activity.reminder', 'activity.registered', 'activity.attended',
    'activity.scheduled',
    'course.available', 'account.welcome'
  ]));
