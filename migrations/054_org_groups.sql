-- ---------------------------------------------------------------------------
-- Takaful platform - migration 054
-- Committees and teams — and NOT a second table of who is in them.
--
-- Additive and safe to run twice.
--
-- WHY THERE IS NO committee_members TABLE
--
-- The obvious build is two tables per thing: committees and committee_members,
-- teams and team_members, each with a person, a title and two dates. The brief
-- lists them that way.
--
-- It would be a second history of the same fact. Somebody who chaired the
-- media committee from 2024 to 2025 has a volunteer_role saying exactly that,
-- with a title, a period, a precision, achievements, a visibility and a soft
-- delete — all of which committee_members would have to grow too, and one of
-- the two would then be the stale one. The brief itself asks in section 39 for
-- a project role to appear in the volunteer's own role history; one source is
-- the only way that is true rather than copied.
--
-- So membership IS a volunteer_role whose entity_kind = 'group' and whose
-- entity_id is a row below. Nothing new records who is in a committee.
--
-- AND THIS IS WHERE THE LEADERSHIP HISTORY COMES FROM FOR FREE
--
-- Section 43 asks for سجلّ القيادات: 2026 محمد, 2025 أحمد, 2024 سارة. That is
-- already a query — the roles pointing at this group, ordered by their own
-- dates — and it needs no new mechanism, no "current president" column, and
-- above all no UPDATE that overwrites a predecessor. Appointing a successor
-- adds a role and closes one, which is the rule migration 046 exists for.
--
-- A "current_president_id" column would have undone all of it in one line.
--
-- ONE TABLE FOR COMMITTEES AND TEAMS
--
-- They have the same shape and the same rules, and the brief's own examples
-- blur them (a "media team" and a "media committee" are the same people in
-- most associations). `kind` is free text so the association can call a thing
-- what it calls it, and so a new sort of group needs no migration.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS org_groups (
  id           UUID        NOT NULL PRIMARY KEY,

  -- 'لجنة', 'فريق', 'وحدة', anything. Free, for the reason role titles are.
  kind         TEXT        NULL,

  name_ar      TEXT        NOT NULL,
  name_en      TEXT        NOT NULL DEFAULT '',
  description_ar TEXT      NULL,
  description_en TEXT      NULL,

  /*
   * A group inside a group: a media team under the media committee.
   *
   * ON DELETE RESTRICT rather than CASCADE — deleting is refused outright
   * below, and a cascade would be a promise this table does not keep.
   * chk_og_parent stops the one-row cycle; a longer cycle is the
   * application's to refuse, and it is cheap there and impossible here.
   */
  parent_id    UUID        NULL REFERENCES org_groups(id) ON DELETE RESTRICT,

  /*
   * Whether the group is still meeting.
   *
   * Separate from archived_at: a committee that finished its work in 2023 is
   * not a mistake to be hidden. It stays listed, its leadership history stays
   * readable, and the people who served on it keep saying so on their own
   * records. Archiving is for a row that should not have existed.
   */
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,

  archived_at  TIMESTAMPTZ NULL,
  archived_by  UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  archive_reason TEXT      NULL,

  created_by   UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by   UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_og_name   CHECK (length(btrim(name_ar)) > 0),
  CONSTRAINT chk_og_parent CHECK (parent_id IS NULL OR parent_id <> id),
  CONSTRAINT chk_og_archived CHECK (
    (archived_at IS NULL) = (archived_by IS NULL)
    AND (archived_at IS NULL
         OR (archive_reason IS NOT NULL AND length(btrim(archive_reason)) > 0))
  )
);

CREATE INDEX IF NOT EXISTS idx_og_listed
  ON org_groups (is_active DESC, kind, name_ar) WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_og_parent
  ON org_groups (parent_id) WHERE parent_id IS NOT NULL;

/*
 * A linked role must point at something this schema can resolve.
 *
 * entity_kind is free text, which is right for a hand-typed entity name — the
 * association can say a role was "for the Ramadan campaign" with no row
 * anywhere. But when entity_id IS set, the kind is a discriminator naming a
 * TABLE, and a row saying kind = 'لجنة' with an id resolves to nothing at all.
 *
 * This is not the closed list the feature exists to avoid. Role titles and
 * types stay free; this constrains only which tables a foreign key may mean,
 * which is a fact about the code and not about the association.
 *
 * 'project' is deliberately absent: there is no projects table yet. When there
 * is one, this constraint is where it gets added — and a migration that forgets
 * will fail loudly on the first linked project role rather than store a
 * dangling pointer.
 */
ALTER TABLE volunteer_roles DROP CONSTRAINT IF EXISTS chk_vr_entity_resolvable;
ALTER TABLE volunteer_roles ADD CONSTRAINT chk_vr_entity_resolvable CHECK (
  entity_id IS NULL OR entity_kind IN ('group', 'activity')
);

/*
 * Roles pointing at one group, which is the whole membership and leadership
 * history query. Partial on the kind so the index stays about this join.
 */
CREATE INDEX IF NOT EXISTS idx_vr_group
  ON volunteer_roles (entity_id, is_current DESC, started_on DESC NULLS LAST)
  WHERE archived_at IS NULL AND entity_kind = 'group';

CREATE OR REPLACE FUNCTION refuse_deleting_org_groups()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF takaful_delete_allowed() THEN RETURN OLD; END IF;
  RAISE EXCEPTION 'A committee or team is archived, never deleted (id %)', OLD.id
    USING HINT = 'Roles point at it, and those roles are people''s records. '
                 'To say it no longer meets, set is_active = false — that keeps '
                 'its leadership history readable, which is the point of it.';
END;
$$;

DROP TRIGGER IF EXISTS trg_org_groups_no_delete ON org_groups;
CREATE TRIGGER trg_org_groups_no_delete
  BEFORE DELETE ON org_groups
  FOR EACH ROW EXECUTE FUNCTION refuse_deleting_org_groups();

DROP TRIGGER IF EXISTS trg_org_groups_touch ON org_groups;
CREATE TRIGGER trg_org_groups_touch
  BEFORE UPDATE ON org_groups
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
