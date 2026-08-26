-- ---------------------------------------------------------------------------
-- Takaful platform - migration 051
-- Make last_seen_at mean something, without logging anybody out to do it.
--
-- Additive and safe to run twice.
--
-- The column has existed since migration 001 and nothing has ever written to
-- it or read it. Every session is valid for thirty days from the moment it was
-- created, whatever happens in between — so a phone left on a bus, or borrowed
-- and handed back, stays signed in to somebody's volunteer record for a month.
-- This platform holds children's safeguarding material behind that cookie.
--
-- WHY THE BACKFILL IS THE WHOLE POINT OF THIS FILE
--
-- The code change is small. Shipping it alone is not, because there are live
-- sessions whose last_seen_at is still the DEFAULT now() from the day they
-- were created — some of them weeks ago. Turning on an idle rule against those
-- values would sign out everybody whose session predates the idle window, all
-- at once, the moment it deployed.
--
-- Which would normally be an annoyance and is currently worse than that: no
-- email provider is configured, so `RESEND_API_KEY` is unset, forty
-- confirmation emails are sitting in email_deliveries marked `skipped`, and
-- password reset therefore does not work at all. Anybody signed out who does
-- not remember their password has no way back in without somebody editing the
-- database by hand.
--
-- So: every live session is treated as seen now. Nobody is signed out by this
-- change; the rule starts counting from here.
--
-- Sessions already past expires_at are left alone. They are already dead and
-- touching them would resurrect nothing.
-- ---------------------------------------------------------------------------

UPDATE sessions
   SET last_seen_at = now()
 WHERE expires_at > now()
   AND last_seen_at < now();

/*
 * The index the idle check reads through.
 *
 * currentUser() runs on every authenticated request and now filters on both
 * columns, so the pair is worth having together rather than leaving the
 * planner to combine idx_sessions_expiry with a heap fetch on the busiest
 * query in the application.
 */
CREATE INDEX IF NOT EXISTS idx_sessions_alive
  ON sessions (token_hash, expires_at, last_seen_at);

COMMENT ON COLUMN sessions.last_seen_at IS
  'Touched by currentUser() at most once every few minutes, not on every '
  'request: a write per page view on a pooled connection is a real cost for a '
  'column read to the minute. A session idle longer than the window in '
  'lib/auth.ts is refused even while expires_at is still in the future.';
