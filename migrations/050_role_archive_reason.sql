-- ---------------------------------------------------------------------------
-- Takaful platform - migration 050
-- Two things 046 should have had. Cheap now, expensive once there are rows.
--
-- Additive and safe to run twice.
--
-- 1. WHY A ROLE WAS ARCHIVED
--
-- 046 gave volunteer_roles a soft delete and put the reason on the audit line
-- instead of in the row. That is thinner than it looks: the question "why did
-- this disappear from my record?" is asked while looking at the record, and an
-- answer that lives in a table only staff can read is not an answer the person
-- affected can ever get to.
--
-- migrations/034 already made this decision the other way for challenges —
-- archive_reason plus a CHECK that it is not empty — and one table in this
-- schema should not disagree with another about whether removing something
-- requires saying why.
--
-- Nullable, because 046 is already applied and there are no rows to backfill a
-- reason for. Enforced together with archived_at, so anything archived from
-- here on carries one.
--
-- 2. A KIND THAT NAMES NOTHING
--
-- chk_vr_entity_kind refuses an entity_id without an entity_kind. It does not
-- refuse the other shape: a row saying kind = 'committee' with neither an id
-- nor a name — "a committee, unnamed", which is not information. The
-- application already drops that to null when reading, but a row that has to
-- be repaired on the way out should not have got in.
-- ---------------------------------------------------------------------------

ALTER TABLE volunteer_roles
  ADD COLUMN IF NOT EXISTS archive_reason TEXT NULL;

ALTER TABLE volunteer_roles
  DROP CONSTRAINT IF EXISTS chk_vr_archive_reason;
ALTER TABLE volunteer_roles
  ADD CONSTRAINT chk_vr_archive_reason CHECK (
    archived_at IS NULL
    OR (archive_reason IS NOT NULL AND length(btrim(archive_reason)) > 0)
  );

ALTER TABLE volunteer_roles
  DROP CONSTRAINT IF EXISTS chk_vr_entity_named;
ALTER TABLE volunteer_roles
  ADD CONSTRAINT chk_vr_entity_named CHECK (
    entity_kind IS NULL OR entity_id IS NOT NULL OR entity_name IS NOT NULL
  );
