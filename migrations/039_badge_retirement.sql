-- ---------------------------------------------------------------------------
-- Takaful platform - migration 039
-- Taking a badge out of circulation without taking it off anybody.
--
-- Additive and safe to run twice.
--
-- The gamification brief asked for a way to enable and disable a badge and to
-- edit its thresholds from the staff page. Half of that is refused here and
-- the reason belongs in the schema rather than in a commit message.
--
-- A threshold is the definition of what the association honours. Fifty hours
-- means fifty hours, and a page that can change it to forty means it never
-- meant anything in particular. Worse, it changes retroactively: the engine
-- recomputes from the ledgers, so lowering a threshold grants the badge to
-- everybody who was already past the new line, and raising it withdraws the
-- badge from people who earned it honestly under the old one — silently, in a
-- loop, with the engine's generic reason. That is why the definitions live in
-- TypeScript, get reviewed like code, and are not editable from here.
--
-- Retirement is the half that is real. A badge can turn out to be a mistake —
-- it honours something the association no longer does, or it says something
-- that reads badly, or it was written wrong. What staff need then is for it to
-- stop being handed out. What they must NOT do is take it off the people who
-- already hold it: those people did the thing, and the association's second
-- thoughts about the badge are not their fault.
--
-- So a retired badge is skipped entirely by the engine. Not granted to anybody
-- new, and not withdrawn from anybody at all — src/lib/achievements.ts drops
-- the definition from the pass rather than treating it as unmet, which is the
-- distinction the whole feature rests on.
--
-- Codes rather than ids, because a badge has no row. The catalogue is in
-- src/lib/achievements.ts and this table names entries in it. A code here that
-- no definition matches is not an error: it is a badge that was retired and
-- then removed from the source, and the row is the only remaining account of
-- why it went.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS badge_retirements (
  code           TEXT        NOT NULL PRIMARY KEY,

  retired_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  retired_by     UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  -- Long enough to be an account of the decision. Somebody will read this
  -- years from now wondering why a badge on their wall is no longer offered.
  retire_reason  TEXT        NOT NULL,

  -- Bringing it back. The row stays either way: a badge that was withdrawn
  -- from circulation for eight months and then restored has a history, and
  -- deleting the row would leave the restoration looking like it never
  -- stopped.
  lifted_at      TIMESTAMPTZ NULL,
  lifted_by      UUID        NULL REFERENCES users(id) ON DELETE RESTRICT,
  lift_reason    TEXT        NULL,

  CONSTRAINT chk_badge_retire_reason
    CHECK (length(btrim(retire_reason)) >= 10),

  -- Lifted means all three, or none of them. A lifted_at with no reason is a
  -- badge that came back and nobody can say why.
  CONSTRAINT chk_badge_lift_complete CHECK (
    (lifted_at IS NULL AND lifted_by IS NULL AND lift_reason IS NULL)
    OR (lifted_at IS NOT NULL AND lifted_by IS NOT NULL
        AND lift_reason IS NOT NULL AND length(btrim(lift_reason)) >= 10)
  )
);

-- The engine's question, asked on every recompute: which codes are out of
-- circulation right now. Partial, because the answer is almost always a very
-- short list and the lifted rows are history rather than state.
CREATE INDEX IF NOT EXISTS idx_badge_retirements_active
  ON badge_retirements (code) WHERE lifted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_badge_retirements_by ON badge_retirements (retired_by);

-- Modelled on migration 034. Lifting is an UPDATE, not a DELETE, and the hint
-- says so rather than leaving somebody to guess.
CREATE OR REPLACE FUNCTION badge_retirements_refuse_delete() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'A badge retirement is lifted, never deleted (code %)', OLD.code
    USING HINT = 'UPDATE badge_retirements SET lifted_at = now(), '
                 'lifted_by = <actor>, lift_reason = <why> WHERE code = <code>';
END;
$$;

DROP TRIGGER IF EXISTS trg_badge_retirements_no_delete ON badge_retirements;
CREATE TRIGGER trg_badge_retirements_no_delete
  BEFORE DELETE ON badge_retirements
  FOR EACH ROW EXECUTE FUNCTION badge_retirements_refuse_delete();

COMMENT ON TABLE badge_retirements IS
  'Badges taken out of circulation. A retired badge is skipped by the recompute entirely: not granted to anybody new, and not withdrawn from anybody who holds it. Thresholds are deliberately not editable here - they are the definition of what the association honours and live in src/lib/achievements.ts under code review.';
COMMENT ON COLUMN badge_retirements.code IS
  'Names an entry in the ACHIEVEMENTS catalogue in TypeScript. A code no definition matches is a badge retired and later removed from the source, and this row is the only account of why.';
COMMENT ON COLUMN badge_retirements.lifted_at IS
  'Null while the badge is out of circulation. Set when it is brought back; the row is never deleted, so a badge that stopped and restarted keeps both dates.';
