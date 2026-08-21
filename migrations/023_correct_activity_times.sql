-- ---------------------------------------------------------------------------
-- Takaful platform - migration 023
-- Put back the hour that was actually typed.
--
-- Every activity created before the Beirut fix stored the form's wall clock as
-- if it were GMT. `<input type="datetime-local">` sends a bare
-- "2026-08-25T12:00" with no zone at all, that string went straight into a
-- timestamptz column, and the database session runs on GMT — so a coordinator
-- typing noon scheduled an activity for three in the afternoon.
--
-- The intended hour is not guessed here. `activity.created` recorded the raw
-- form string at creation, so this reads it back and re-reads it as Beirut,
-- which is the one thing every layer failed to do at the time. The end time
-- and the registration deadline move by the same amount, because the bug moved
-- them by the same amount and the duration was never wrong.
--
-- Safe to run twice: a row already sitting at the hour that was typed does not
-- match, and rows written after the fix are excluded by the shape of their
-- audit entry — those record a full ISO instant ending in Z, and only the old
-- zone-less "YYYY-MM-DDTHH:MM" form is touched. That regex is the whole
-- safeguard, so it is deliberately anchored at both ends.
-- ---------------------------------------------------------------------------

CREATE TEMP TABLE _typed_times ON COMMIT DROP AS
SELECT DISTINCT ON (l.target_id)
       l.target_id::uuid AS id,
       -- Reads the naive wall clock as Beirut and yields a real instant,
       -- daylight saving included. This is parseLocalInput, said in SQL.
       ((l.new_value ->> 'startsAt')::timestamp AT TIME ZONE 'Asia/Beirut') AS meant
  FROM audit_logs l
 WHERE l.target_type = 'activity'
   AND l.action = 'activity.created'
   AND l.new_value ->> 'startsAt' ~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$'
 ORDER BY l.target_id, l.created_at;

-- Captured before the update, so the log can say what the times used to be.
CREATE TEMP TABLE _corrections ON COMMIT DROP AS
SELECT a.id,
       a.starts_at AS old_starts, a.ends_at AS old_ends,
       t.meant AS new_starts,
       a.ends_at + (t.meant - a.starts_at) AS new_ends,
       t.meant - a.starts_at AS delta
  FROM activities a
  JOIN _typed_times t ON t.id = a.id
 WHERE a.starts_at IS DISTINCT FROM t.meant;

UPDATE activities a
   SET starts_at = c.new_starts,
       ends_at = c.new_ends,
       registration_closes_at = a.registration_closes_at + c.delta
  FROM _corrections c
 WHERE c.id = a.id;

/*
 * These two date columns predate the timestamps and are still constrained
 * against each other, so they follow — read in Beirut, since that is the
 * calendar day a volunteer means when they say which day an activity is on.
 */
UPDATE activities a
   SET starts_on = (a.starts_at AT TIME ZONE 'Asia/Beirut')::date,
       ends_on   = (a.ends_at   AT TIME ZONE 'Asia/Beirut')::date
  FROM _corrections c
 WHERE c.id = a.id
   AND (a.starts_on IS NOT NULL OR a.ends_on IS NOT NULL);

/*
 * Nobody did this, so no actor signs it. An activity's start time moving on
 * its own is exactly the kind of thing someone will need explained in a year,
 * and an unexplained shift in the record is worse than the original bug.
 */
INSERT INTO audit_logs (actor_id, action, target_type, target_id, previous_value, new_value, reason)
SELECT NULL,
       'activity.time_corrected',
       'activity',
       c.id::text,
       jsonb_build_object('startsAt', c.old_starts, 'endsAt', c.old_ends),
       jsonb_build_object('startsAt', c.new_starts, 'endsAt', c.new_ends),
       'أُعيد الوقت إلى الساعة التي كُتبت في النموذج عند الإنشاء؛ كان يُخزَّن بتوقيت غرينتش بدل توقيت بيروت'
  FROM _corrections c;
