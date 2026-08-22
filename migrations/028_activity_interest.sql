-- ---------------------------------------------------------------------------
-- Takaful platform - migration 028
-- "Tell me when this one opens."
--
-- A coordinator often knows an activity is coming long before they know when.
-- Until now the choice was to invent a date and correct it later — which sends
-- people to the wrong place — or to say nothing until the date exists, by
-- which point the volunteers who would have come have made other plans.
--
-- So an activity may be published with no start time at all. It appears, it
-- describes itself, and instead of "register" it offers "tell me when I can".
-- Registering for something with no date is meaningless; registering interest
-- in it is not.
--
-- When the coordinator later sets a time, everybody who put their name down is
-- notified once. `notified_at` is what makes that once rather than every time
-- the activity is edited afterwards — a volunteer who gets the same "it is
-- open now" message four times stops reading them.
--
-- Interest is not a registration and deliberately does not behave like one: it
-- holds no seat, respects no capacity, and converts to nothing automatically.
-- The volunteer still chooses, once they know the date, whether the day suits
-- them. Turning interest into an automatic booking would fill an activity with
-- people who never agreed to attend it.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS activity_interest (
  id           UUID PRIMARY KEY,
  activity_id  UUID NOT NULL REFERENCES activities (id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- When the "a date has been set" message went out. NULL means still waiting.
  notified_at  TIMESTAMPTZ NULL,

  -- One person, one mark of interest. Pressing the button twice is not two
  -- people, and the staff list counts rows.
  CONSTRAINT uq_activity_interest UNIQUE (activity_id, user_id)
);

-- The two questions asked of this table: "who is interested in this activity"
-- for the staff list, and "what am I waiting on" for the volunteer.
CREATE INDEX IF NOT EXISTS idx_activity_interest_activity
  ON activity_interest (activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_interest_user
  ON activity_interest (user_id);

/*
 * The notification kind for "a date has been set".
 *
 * notifications.kind is a CHECK list rather than a free string, which is the
 * schema being right — a typo in a kind would otherwise create a category of
 * notification nothing renders. Adding to it means restating it.
 */
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_kind_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_kind_check
  CHECK (kind = ANY (ARRAY[
    'application.accepted', 'application.waitlisted', 'application.rejected',
    'hours.verified', 'hours.rejected', 'hours.corrected',
    'stage.unlocked', 'stage.completed',
    'certificate.issued',
    'activity.reminder', 'activity.registered', 'activity.attended',
    'activity.scheduled',
    'course.available', 'account.welcome'
  ]));
