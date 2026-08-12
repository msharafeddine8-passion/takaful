-- ---------------------------------------------------------------------------
-- Takaful platform - migration 007
-- An hour may be split across requirements, but never counted twice.
--
-- Target: PostgreSQL 14+. Safe to run twice.
--
-- 003 allowed one allocation per hour entry. The intent was right - one hour
-- must not satisfy every stage at once - but the rule was too blunt.
--
-- If Stage 1 needs one more hour and the volunteer logs four, all four are
-- consumed by Stage 1 and three are lost. The volunteer did four hours of
-- work and the system credits them with one. Nobody would accept that from a
-- payroll system and it should not be accepted here.
--
-- The invariant that actually matters is not "one allocation per entry" but
-- "allocated minutes never exceed the minutes worked". That permits splitting
-- and still makes double-counting impossible.
-- ---------------------------------------------------------------------------

DROP INDEX IF EXISTS uq_allocation_one_per_entry;

-- Still at most one allocation from a given entry to a given requirement:
-- two rows for the same pair would be a bug, not a split.
CREATE UNIQUE INDEX IF NOT EXISTS uq_allocation_entry_requirement
  ON hour_allocations (hour_entry_id, requirement_id);

-- A sum cannot be expressed as a CHECK, so a trigger enforces it. Deferred
-- would be nicer, but allocation happens one row at a time and this catches
-- the mistake at the moment it is made.
CREATE OR REPLACE FUNCTION check_allocation_within_entry() RETURNS TRIGGER AS $$
DECLARE
  worked    INTEGER;
  allocated INTEGER;
BEGIN
  SELECT minutes INTO worked FROM hour_entries WHERE id = NEW.hour_entry_id;

  SELECT COALESCE(SUM(minutes), 0) INTO allocated
    FROM hour_allocations
   WHERE hour_entry_id = NEW.hour_entry_id
     AND (TG_OP = 'INSERT' OR id <> NEW.id);

  IF allocated + NEW.minutes > worked THEN
    RAISE EXCEPTION
      'Allocating % minutes would exceed the % minutes worked (% already allocated)',
      NEW.minutes, worked, allocated
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_allocation_within_entry ON hour_allocations;
CREATE TRIGGER trg_allocation_within_entry
  BEFORE INSERT OR UPDATE ON hour_allocations
  FOR EACH ROW EXECUTE FUNCTION check_allocation_within_entry();

-- What is left of an entry to give. The allocator reads this rather than
-- recomputing the arithmetic, so the rule lives in one place.
CREATE OR REPLACE VIEW unallocated_hours AS
  SELECT h.id            AS hour_entry_id,
         h.user_id,
         h.worked_on,
         h.minutes       AS worked_minutes,
         h.minutes - COALESCE(a.allocated, 0) AS remaining_minutes
    FROM hour_entries h
    LEFT JOIN (
      SELECT hour_entry_id, SUM(minutes) AS allocated
        FROM hour_allocations GROUP BY hour_entry_id
    ) a ON a.hour_entry_id = h.id
   WHERE h.status = 'verified'
     AND h.minutes > 0
     AND h.minutes - COALESCE(a.allocated, 0) > 0;
