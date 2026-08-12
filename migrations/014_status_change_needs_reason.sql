-- 014: a decision about a person has to say why.
--
-- setMembershipStatus() has always refused an admin-initiated change with no
-- reason. It refused it in TypeScript, which means it held for every path that
-- happened to go through that function and for nothing else — a probe writing
-- the row directly walked straight past it.
--
-- Every other rule of this weight in this schema is a constraint: hours cannot
-- be verified by the person who logged them, nobody marks their own
-- attendance, a decided application names its decider. This one belongs with
-- them. Someone reading the history a year from now needs "who decided, and
-- why" to be answerable for every row, not for most of them.
--
-- changed_by NULL means the system did it — registering an account, being
-- accepted by the acceptance flow — and those rows carry their reason in the
-- transition itself.

ALTER TABLE membership_status_history
  ADD CONSTRAINT chk_status_reason
  CHECK (changed_by IS NULL OR (reason IS NOT NULL AND length(btrim(reason)) >= 3));

COMMENT ON CONSTRAINT chk_status_reason ON membership_status_history IS
  'A status change made by a person must record why. Automatic changes (changed_by NULL) need no reason.';
