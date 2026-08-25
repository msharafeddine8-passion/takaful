-- ---------------------------------------------------------------------------
-- Takaful platform - migration 037
-- Birthday greetings, personal milestones, and what a volunteer may switch off.
--
-- Additive and safe to run twice.
--
-- THE ONE REQUIREMENT EVERYTHING HERE IS SHAPED BY
--
-- Nothing in this migration may fire twice. A birthday greeting sent again an
-- hour later is not a smaller version of a nice message - it is the platform
-- telling somebody it does not know them. A milestone re-announced every time
-- a page is rendered is worse: «مبروك أول نشاط» arriving forty times is the
-- reason people turn notifications off and never turn them back on.
--
-- So neither of the two tables below has a flag that code has to remember to
-- set. Each has a PRIMARY KEY that IS the rule, and the sending path is an
-- INSERT ... ON CONFLICT DO NOTHING RETURNING: a row comes back only the first
-- time, and the notification is written in the same transaction as the row.
-- A job that re-runs, two dashboards rendered at once, a retry after a timeout
-- - all of them race into the same unique index and exactly one wins. The
-- correctness does not depend on the job being run once, because it will not
-- be: there is no cron here, and these run when a page is opened.
--
-- NO POINTS, NO RANKING
--
-- Nothing in this file touches impact_points, achievements or any figure that
-- is ordered against anybody else's. A birthday is not an accomplishment and
-- must not move somebody up a list; a milestone is a private word of thanks.
-- Both are deliberately unconnected to the ledger - there is no source_kind
-- for either in chk_points_kind, and none may be added.
--
-- NO DATE OF BIRTH IS COPIED HERE
--
-- birthday_greetings_sent stores the YEAR a greeting was sent and nothing
-- else. Not the birth date, not the day, not an age. The three tables that
-- hold a date of birth - profiles_sensitive, safeguarding_records and
-- volunteer_roster - stay the only places it exists, exactly as migration 033
-- argued: a birth date copied into a table that a greeting job selects from is
-- a birth date one careless join away from a page.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------- milestone_events

-- One row per person per milestone, forever.
--
-- The primary key is the whole feature. There is no `sent` boolean, no
-- `notified_at` that a second code path could forget to write, and no
-- timestamp uniqueness that two requests in the same millisecond could slip
-- past. A milestone is either in this table or it has never happened.
CREATE TABLE IF NOT EXISTS milestone_events (
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- The code from src/lib/milestones.ts: 'first-activity', 'hours-50',
  -- 'stage-3', 'first-year', 'returned', 'path-complete'.
  --
  -- Deliberately NOT constrained to a list of values. The catalogue is
  -- authored in TypeScript, where a missing translation stops a build; a CHECK
  -- here would be a second copy of it that has to be widened by migration
  -- every time somebody adds a milestone, and the failure when it is forgotten
  -- lands at the worst moment - inside the transaction that is congratulating
  -- somebody. The shape is checked instead, so a code cannot be blank or be
  -- something a template would render oddly.
  code       TEXT        NOT NULL,

  -- The Beirut calendar day it was recognised on, as a DATE. Written by the
  -- application from beirutToday(), never from now() or CURRENT_DATE: the
  -- session runs GMT, so a milestone reached at half past midnight in Beirut
  -- would otherwise be recorded as yesterday.
  --
  -- Nothing renders this. It exists so that "when did we tell them?" has an
  -- answer, which is the question asked when somebody says they were never
  -- told.
  reached_on DATE        NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, code),

  CONSTRAINT chk_milestone_code CHECK (code ~ '^[a-z][a-z0-9-]{1,60}$')
);

-- For the account page, which reads this person's milestones and nobody
-- else's. There is deliberately no index on `code` alone: a query that reads
-- every account holding one milestone is the first half of a ranking, and this
-- table has no business making one cheap.
CREATE INDEX IF NOT EXISTS idx_milestone_user
  ON milestone_events (user_id, created_at DESC);

COMMENT ON TABLE milestone_events IS
  'One row per person per personal milestone, ever. The primary key is the idempotency rule: the sender inserts ON CONFLICT DO NOTHING and notifies only for rows that came back. Carries no points and no ranking.';

-- --------------------------------------------------- birthday_greetings_sent

-- One greeting per person per year.
--
-- The year rather than the date, for two reasons that both matter.
--
-- Somebody born on 29 February is greeted on 28 February in the three years
-- out of four that have no 29th - see birthdayKeys() in src/lib/milestones.ts.
-- Keyed by date, the leap year itself would then let them be greeted twice:
-- once on the 28th by the fallback and again on the 29th. Keyed by year, the
-- second attempt hits the primary key and does nothing.
--
-- And it makes the rule readable as English. «مرّة واحدة في السنة» is what the
-- association asked for, and (user_id, greeting_year) is that sentence.
CREATE TABLE IF NOT EXISTS birthday_greetings_sent (
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- The Beirut calendar year. Not derived in SQL from now(): between midnight
  -- and two in the morning Beirut time the GMT year is still the old one, so
  -- on 1 January a greeting would be filed against the year before and a
  -- second one could be sent the same day.
  greeting_year SMALLINT    NOT NULL,

  -- The day the greeting actually went out, which is the 28th for the leap-day
  -- volunteers. Recorded rather than rendered.
  greeted_on    DATE        NOT NULL,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, greeting_year),

  -- A year outside this range is a bug in whatever computed it - a GMT clock
  -- read as a number, a parse of an empty string - and it should be refused
  -- here rather than quietly filed.
  CONSTRAINT chk_birthday_year CHECK (greeting_year BETWEEN 2000 AND 2200)
);

COMMENT ON TABLE birthday_greetings_sent IS
  'Which years a person has already been greeted in. Holds no date of birth, no day and no age - only the year, which is what makes "once a year, never twice" a primary key.';

-- ------------------------------------------------------- notification kinds

-- 'birthday.greeting' joins the list.
--
-- This is the half of the rule that migration 032 forgot in the other
-- direction: it widened the constraint and left the TypeScript union alone, so
-- the database accepted rows the code did not know existed and only
-- `tsc -p scripts` noticed. The union in src/lib/notify.ts gains the same
-- value in the same change. Either one drifting means the other is not
-- enforcing what it appears to.
--
-- Dropped by its real name, and the stray default name as well - migration 028
-- dropped `notifications_kind_check`, which has never existed, reported
-- success, and left the true constraint rejecting the new kind for a whole
-- release. See migration 029.
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
  -- The one this migration adds. Sent to the person whose birthday it is, in
  -- private, once in a year; it says nothing about a date and never names
  -- anybody else.
  'birthday.greeting'
));

-- --------------------------------------------- what a volunteer may switch off

-- Four subjects, not four kinds.
--
-- notification_preferences.muted_kinds already exists and already works, and
-- it is the wrong thing to put on a settings page. A person does not think «لا
-- أريد badge.earned»; they think «لا أريد شيئاً عن الشارات». A kind is an
-- implementation detail that gets renamed and split, and a preference stored
-- against one is a preference that silently stops applying the day it does.
-- A subject survives that: src/lib/preferences.ts maps each to the kinds it
-- covers, and a kind added later joins the subject it belongs to in one edit
-- rather than requiring four hundred stored rows to be rewritten.
--
-- 'ranking' currently covers no kind at all, and that is deliberate rather
-- than an oversight. Nothing on this platform sends a notification about a
-- leaderboard position - migration 032 says why, and it is right: a place that
-- moves whenever somebody else logs an hour is not news. The switch is
-- recorded now for the same reason migration 033 recorded consent before the
-- leaderboard existed: the ranking work is under way, and it must not be able
-- to ship without having asked.
ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS muted_topics TEXT[] NOT NULL DEFAULT '{}';

-- Containment rather than a per-element trigger: `<@` is one operator, it
-- covers the empty array, and it rejects the whole update rather than storing
-- three good values and one typo that would then read as "not muted".
ALTER TABLE notification_preferences DROP CONSTRAINT IF EXISTS chk_muted_topics;
ALTER TABLE notification_preferences ADD CONSTRAINT chk_muted_topics CHECK (
  muted_topics <@ ARRAY['ranking', 'badges', 'challenges', 'birthdays']::TEXT[]
);

COMMENT ON COLUMN notification_preferences.muted_topics IS
  'Subjects this person has switched off: ranking, badges, challenges, birthdays. Empty means everything is on, so nobody needs a row to receive anything. src/lib/preferences.ts maps a subject to the notification kinds it covers.';
