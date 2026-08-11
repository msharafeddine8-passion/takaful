-- ---------------------------------------------------------------------------
-- Takaful platform - migration 009
-- unallocated_hours.remaining_minutes was a bigint, and arrived as a string.
--
-- SUM() returns bigint, so `minutes - COALESCE(SUM(...), 0)` was bigint too,
-- and the pg driver hands bigint to JavaScript as a string rather than a
-- number - correctly, since a bigint does not always fit in a double.
--
-- The allocator declared it as a number and worked anyway, because Math.min
-- coerces. It would have stopped working the first time someone wrote
-- `remaining + x` and got '60' + 5 = '605' instead of 65, with no error and a
-- wrong number of volunteering hours on someone's certificate.
--
-- Minutes in a day fit in an integer with room to spare, so the cast is safe
-- and the type now says what it means.
--
-- Found by a probe assertion failing on 60 !== '60'. The value was right; the
-- type was not, and only comparing strictly showed it.
-- ---------------------------------------------------------------------------

-- CREATE OR REPLACE cannot change a column's type (42P16), so the view is
-- dropped and rebuilt. Safe: a view holds no data, and nothing depends on it
-- except application code that is deployed with this migration.
DROP VIEW IF EXISTS unallocated_hours;

CREATE VIEW unallocated_hours AS
  SELECT h.id      AS hour_entry_id,
         h.user_id,
         h.worked_on,
         h.minutes AS worked_minutes,
         (h.minutes - COALESCE(a.allocated, 0))::INTEGER AS remaining_minutes
    FROM hour_entries h
    LEFT JOIN (
      SELECT hour_entry_id, SUM(minutes) AS allocated
        FROM hour_allocations GROUP BY hour_entry_id
    ) a ON a.hour_entry_id = h.id
   WHERE h.status = 'verified'
     AND h.minutes > 0
     AND h.minutes - COALESCE(a.allocated, 0) > 0;

-- allocated_minutes is deliberately left as bigint: a lifetime total genuinely
-- could exceed an integer one day, and every caller already parses it.
COMMENT ON VIEW unallocated_hours IS
  'Verified hours with minutes still to allocate. remaining_minutes is a true integer, unlike the bigint that SUM() would otherwise produce.';
