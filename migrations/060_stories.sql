-- ---------------------------------------------------------------------------
-- Takaful platform - migration 060
-- «قصص من الميدان» — what actually happened, once, with the photographs.
--
-- Additive and safe to run twice.
--
-- Section 55 of the brief asks for a story per piece of work: a title, a date,
-- a place, the project it belongs to, pictures, how many people took part, how
-- many volunteer hours went into it, what was done and what it changed.
--
-- Everything in that list is already somewhere in this database except the
-- prose and the pictures. So this migration adds the prose and the pictures,
-- POINTS AT THE REST, and takes some trouble not to add a second copy of it.
--
-- ── PARTICIPANTS AND VOLUNTEER HOURS ARE NOT COLUMNS ON THIS TABLE ──────────
--
-- THERE IS NO participants COLUMN AND NO volunteer_minutes COLUMN HERE, AND
-- NEITHER MAY BE ADDED. This is the whole reason `activity_id` exists below.
--
-- The obvious version of this feature gives a story two integers a coordinator
-- types in. It is wrong for a reason that has nothing to do with tidiness.
--
-- A field activity already has an attendance register: activity_attendance,
-- one row per person, written by a named supervisor who is forbidden by
-- chk_attendance_no_self from recording their own, carrying the minutes that
-- became that volunteer's hours in hour_entries. That register is the record
-- the association credits people's hours from, argues about, and would defend
-- to a funder.
--
-- A number typed into a story box is a SECOND ANSWER to a question the register
-- has already answered. On the day it is typed the two agree, which is exactly
-- what makes it dangerous — nobody looks again. Then somebody who turned up
-- without registering is added to the sheet six weeks later (the Mawlid case
-- that lib/activities.ts documents), or a duration is corrected, or an
-- attendance row is put right. The register moves. The story does not, because
-- nothing in the platform knows the story was ever about those rows. The
-- association is then publishing «شارك ٤٠ متطوّعاً» on the open web while its
-- own register says thirty-seven, and the public number is the one that is
-- wrong and the one that is quoted.
--
-- Two truths about one afternoon is not redundancy that costs storage; it is a
-- fact that will drift, silently, in the direction of whichever copy nobody
-- maintains. So the story names the activity and the figures are DERIVED —
-- `story_figures` below, a view for the same reason activity_places is one, so
-- the story page, the staff screen and the register can never disagree about
-- how many people were there.
--
-- A story with no activity behind it therefore has NO figures, and shows none.
-- That is the honest outcome: the participant count of an afternoon nobody kept
-- a register for is not a number this platform holds, and inviting somebody to
-- supply one from memory is inviting exactly the fiction above.
--
-- ── A STORY IS ABOUT PEOPLE, AND THE SCHEMA ONLY GETS TO PROTECT THE PHOTOS ─
--
-- Nothing here stores a person. There is no participant list, no named
-- volunteer, no user_id anywhere on a story — the count is aggregated in the
-- view and lib/stories.ts never selects a name. That is deliberate and it is
-- the strongest of the gates: a page that publishes no individual cannot
-- publish the wrong individual.
--
-- What is left is the photographs, and `story_photos.faces` is the only thing
-- in this schema that can be made to hold a rule about them. See its comment.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS stories (
  id           UUID        NOT NULL PRIMARY KEY,
  -- Stable, and the public URL under /gallery.
  slug         TEXT        NOT NULL UNIQUE,

  title_ar     TEXT        NOT NULL,
  title_en     TEXT        NOT NULL DEFAULT '',

  -- Where it happened, in the association's own words: 'المنية', 'طرابلس —
  -- التبانة'. Free text and nullable, like an activity's `location`.
  location_ar  TEXT        NULL,
  location_en  TEXT        NULL,

  /*
   * When it happened — a DATE, and never a TIMESTAMPTZ.
   *
   * The same rule migration 046 states for a role and 055 for a project: this
   * is a calendar fact, not an instant. The session runs GMT and the
   * association is in Beirut, so a timestamp puts a story dated the 1st into
   * the previous month for anything that builds a Date from it, and «قصة من
   * كانون الثاني» is published as كانون الأول with nothing about it looking
   * wrong.
   *
   * The precision column is 046's idea applied here, and it earns its place:
   * «الرحلة الشتوية، شباط ٢٠٢٤» is how this work is actually remembered, and a
   * schema demanding a day gets an invented day it then prints as fact. NULL
   * for a story nobody dated at all, rather than a made-up one.
   */
  happened_on  DATE        NULL,
  happened_prec TEXT       NOT NULL DEFAULT 'day',

  /*
   * The project it belongs to.
   *
   * NULL means the association itself rather than any one project — the same
   * meaning migration 055 gave impact_numbers.project_id, and for the same
   * reason: a توزيع شتوي is real work that belongs to no project on the list,
   * and a NOT NULL column would have it filed under whichever project sounded
   * closest.
   *
   * RESTRICT, not CASCADE. A project cannot be deleted at all
   * (trg_projects_no_delete), and if it ever could, taking its stories with it
   * would be the deletion this whole schema is arranged to refuse.
   */
  project_id   UUID        NULL REFERENCES projects(id) ON DELETE RESTRICT,

  /*
   * The activity this story is about, and where its two figures come from.
   *
   * NOT a copy of the activity. The title, the date, the place and the prose
   * are the story's own, because a story is written afterwards and says things
   * an activity record never held — what changed, and for whom. What is NOT
   * duplicated is the register: see the head of this file.
   */
  activity_id  UUID        NULL REFERENCES activities(id) ON DELETE RESTRICT,

  -- What happened, and what it changed. Two fields rather than one, because
  -- the brief asks for both and because they answer different questions: the
  -- description is the afternoon, the impact is what was different afterwards.
  description_ar TEXT      NOT NULL DEFAULT '',
  description_en TEXT      NOT NULL DEFAULT '',
  impact_ar    TEXT        NOT NULL DEFAULT '',
  impact_en    TEXT        NOT NULL DEFAULT '',

  /*
   * DEFAULT FALSE, and this is the one place this feature disagrees with
   * partners and projects, which both default TRUE.
   *
   * Those tables hold an organisation's name and a programme's summary. This
   * one holds photographs of people. A row that reaches this table by any route
   * that is not the staff form — an import, a restore, a hand-run INSERT at two
   * in the morning — must not be on the open web because nobody said otherwise.
   * The form sends the value explicitly, so nothing about the ordinary path
   * changes; what changes is what silence means.
   */
  is_published BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order   INTEGER     NOT NULL DEFAULT 0,

  archived_at  TIMESTAMPTZ NULL,
  archived_by  UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  archive_reason TEXT      NULL,

  created_by   UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by   UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_st_slug  CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,60}$'),
  CONSTRAINT chk_st_title CHECK (length(btrim(title_ar)) > 0),
  CONSTRAINT chk_st_prec  CHECK (happened_prec IN ('day','month','year')),
  CONSTRAINT chk_st_archived CHECK (
    (archived_at IS NULL) = (archived_by IS NULL)
    AND (archived_at IS NULL
         OR (archive_reason IS NOT NULL AND length(btrim(archive_reason)) > 0))
  )
);

/*
 * The public ordering, and the index that serves it.
 *
 * `sort_order` first so the association can pin one story to the top, then the
 * most recent — a field story is read newest-first, unlike a project list,
 * which is why this ordering differs from idx_pr_shown. NULLS LAST puts the
 * undated stories at the bottom rather than at the top, where an undated row
 * would otherwise sit above everything that has a date.
 */
CREATE INDEX IF NOT EXISTS idx_st_shown
  ON stories (sort_order, happened_on DESC NULLS LAST)
  WHERE is_published AND archived_at IS NULL;

-- Both foreign keys are read the other way round — "the stories about this
-- project", "does anything point at this activity" — and migration 016's rule
-- is that a foreign key nothing indexes is a sequential scan waiting to happen.
CREATE INDEX IF NOT EXISTS idx_st_project  ON stories (project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_st_activity ON stories (activity_id) WHERE activity_id IS NOT NULL;

-- ------------------------------------------------------------- story_photos
/*
 * The pictures, stored the way profile_photos stores a picture.
 *
 * BYTES IN POSTGRES, and deliberately not a second scheme. Migration 011 made
 * this choice for profile photographs and gave the reason: the alternative is
 * another paid service and another set of credentials for an association that
 * had just been moved off one provider for reachability. Nothing about that has
 * changed, and a story feature that reached for object storage would leave this
 * platform with two ways to hold an image, one of which nobody maintains.
 *
 * So the column shape is 011's, line for line — content_type, bytes, byte_size,
 * version, and the three CHECKs including the one that keeps byte_size honest
 * against length(bytes). `logo_ref` on projects and partners is TEXT because
 * nothing uploads one yet; this feature does upload, so it follows the scheme
 * that actually serves bytes rather than the placeholder.
 *
 * The cap is larger than a profile photo's 300KB because a scene needs more
 * detail than a face, and it is still a cap rather than a courtesy: there is no
 * image resizer in this codebase and adding a dependency to get one is out of
 * scope, so THE CONSTRAINT IS THE RESIZER. A phone photograph pasted in
 * untouched is refused, and the form says to export it small — which is the
 * difference between a card grid a volunteer can open on a Lebanese mobile
 * connection and one they cannot.
 */
CREATE TABLE IF NOT EXISTS story_photos (
  id           UUID        NOT NULL PRIMARY KEY,
  story_id     UUID        NOT NULL REFERENCES stories(id) ON DELETE RESTRICT,

  content_type TEXT        NOT NULL,
  bytes        BYTEA       NOT NULL,
  byte_size    INTEGER     NOT NULL,
  -- Changes whenever the picture does, so a cached URL stops being served.
  version      UUID        NOT NULL,

  -- What the picture shows, for somebody who cannot see it. Both languages,
  -- English falling back to the Arabic exactly as every other pair here does.
  alt_ar       TEXT        NOT NULL DEFAULT '',
  alt_en       TEXT        NOT NULL DEFAULT '',

  /*
   * WHO IS IN IT, AND WHETHER THEY AGREED. THE ONE SAFEGUARDING GATE THIS
   * SCHEMA CAN ACTUALLY HOLD.
   *
   * Three values, and unlike `kind` on a partner or `status` on a project this
   * one IS a closed CHECK — on purpose, and the difference is worth stating so
   * nobody "frees" it later for consistency. Those columns are free text
   * because an association invents a ninth kind of partner before anybody ships
   * a migration. This is not a word the association invents; it is a consent
   * decision, and the set of answers that may be published is fixed the way
   * visibility_choices is fixed in lib/visibility.ts.
   *
   *   'none'       No individual face is identifiable. A room at work seen from
   *                the doorway, hands, a distance shot, backs. This is the
   *                option lib/photos.ts's standing rule about the hero asks for
   *                and the one the form offers first.
   *   'adults'     Every identifiable person in it is an adult who agreed to
   *                this photograph being published.
   *   'restricted' ANYTHING ELSE. An identifiable child, somebody who has not
   *                agreed, somebody nobody asked.
   *
   * 'restricted' is stored rather than refused, and that is the point of having
   * three values instead of two: a table that only accepted publishable
   * photographs would be a table people record 'none' into, because the upload
   * is already done and the alternative is losing it. It is kept, it is
   * reviewable, and it is never served to anybody without a session — the
   * public read filters it out and /api/public/story-photo checks it again,
   * for the reason migration 057 checks a URL in two places: a rule that
   * decides what a stranger is shown is worth stating twice.
   *
   * WHAT THIS IS NOT. It is not treatAsMinor(). That function needs a person's
   * id and a birth date, and a photograph has neither — the platform cannot ask
   * a JPEG who is in it. Pretending otherwise would be a gate that looks like
   * one and checks nothing, which is worse than a human answer honestly
   * recorded against a named uploader. uploaded_by is NOT NULL for that reason:
   * an affirmation nobody made is not an affirmation.
   */
  faces        TEXT        NOT NULL,

  sort_order   INTEGER     NOT NULL DEFAULT 0,
  uploaded_by  UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_sp_type CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp')),
  CONSTRAINT chk_sp_size CHECK (byte_size > 0 AND byte_size <= 800 * 1024),
  -- byte_size is what every query reads; keeping it honest matters more than
  -- saving the length() call. Migration 011's line, unchanged.
  CONSTRAINT chk_sp_size_matches CHECK (byte_size = length(bytes)),
  CONSTRAINT chk_sp_faces CHECK (faces IN ('none', 'adults', 'restricted'))
);

/*
 * The read is always "the pictures for this story, in order" — never a picture
 * on its own except by primary key from the serving route. Partial on the two
 * publishable answers, because that is the query a stranger's request runs and
 * the one that has to stay cheap while `restricted` rows accumulate.
 */
CREATE INDEX IF NOT EXISTS idx_sp_story
  ON story_photos (story_id, sort_order, uploaded_at)
  WHERE faces <> 'restricted';

CREATE INDEX IF NOT EXISTS idx_sp_story_all ON story_photos (story_id, sort_order, uploaded_at);

COMMENT ON COLUMN story_photos.faces IS
  'Who is identifiable in this photograph and whether they agreed: none (no identifiable individual), adults (every identifiable person is a consenting adult), restricted (a child, or anybody who did not agree). Only the first two are ever served without a session. Recorded by uploaded_by, who is NOT NULL because an affirmation nobody made is not an affirmation.';

-- ------------------------------------------------------------ story_figures
/*
 * How many took part, and how many volunteer hours it took — READ FROM THE
 * REGISTER, never stored.
 *
 * A view for the same reason activity_places is one: the story page, the staff
 * screen and the attendance sheet must not be able to disagree about how many
 * people were at the same afternoon. Correcting a duration on the register
 * changes what the public story says, at once, with nobody remembering to.
 *
 * `attended` is the filter on both figures, not merely on the count. Somebody
 * marked absent is on the register and did not take part, and chk_attendance_
 * minutes already guarantees their minutes are NULL — so the FILTER is belt and
 * braces rather than the load-bearing part, and it is written out so that the
 * two figures are visibly about the same set of rows.
 *
 * A story with no activity_id gets 0 and 0, which is NOT the same fact as an
 * activity nobody attended. lib/stories.ts resolves that: it returns null
 * figures when there is no activity to derive them from, and the page then
 * prints nothing rather than «٠ مشارك». The view cannot tell the difference and
 * is not asked to.
 */
CREATE OR REPLACE VIEW story_figures AS
  SELECT s.id AS story_id,
         count(att.user_id) FILTER (WHERE att.attended)::INT AS participants,
         COALESCE(sum(att.minutes) FILTER (WHERE att.attended), 0)::INT AS volunteer_minutes
    FROM stories s
    LEFT JOIN activity_attendance att ON att.activity_id = s.activity_id
   GROUP BY s.id;

-- ------------------------------------------------------------------ guards
/*
 * A story is archived, never deleted — takaful_delete_allowed() from migration
 * 045 and NOT a second copy of that check.
 *
 * What is being protected is not the prose. It is that a story names an
 * activity and a project, was published on the open web, and was read; and that
 * archiving requires somebody to say why, in a column, where the person asking
 * "what happened to that story about المنية?" is looking.
 */
CREATE OR REPLACE FUNCTION refuse_deleting_stories()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF takaful_delete_allowed() THEN RETURN OLD; END IF;
  RAISE EXCEPTION 'A story is archived, never deleted (slug %)', OLD.slug
    USING HINT = 'It was published, and it names an activity people''s hours '
                 'came from. To take it off the site set is_published = false; '
                 'archiving needs a reason.';
END;
$$;

DROP TRIGGER IF EXISTS trg_stories_no_delete ON stories;
CREATE TRIGGER trg_stories_no_delete
  BEFORE DELETE ON stories
  FOR EACH ROW EXECUTE FUNCTION refuse_deleting_stories();

DROP TRIGGER IF EXISTS trg_stories_touch ON stories;
CREATE TRIGGER trg_stories_touch
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

/*
 * story_photos IS DELIBERATELY NOT DELETE-GUARDED, AND THIS IS THE ONE PLACE IN
 * THIS SCHEMA WHERE THAT IS A SAFEGUARDING DECISION RATHER THAN A CONVENIENCE.
 *
 * Every guard in this database protects a record OF something somebody did: a
 * badge earned, hours verified, a role held, a decision walked. Removing one of
 * those is the association erasing a person's history, and the triggers are
 * there to make it impossible to do by accident.
 *
 * A photograph is the opposite object. It is not a record of anybody's work; it
 * is their face on the open web. And the one request this association must
 * always be able to honour, immediately and without an escape hatch, is «انزعوا
 * تلك الصورة» — from the volunteer in it, or from a parent. lib/photos.ts has
 * the association's own history with this: the homepage photograph has had to
 * change three times because a volunteer who appears in it, recognisable and
 * posed, has since started wearing hijab, and a picture taken years ago was
 * still introducing her to strangers.
 *
 * Making that removal require SET LOCAL takaful.allow_delete would put a
 * withdrawal of consent behind a line only a developer with a psql prompt can
 * type. So the row is deletable, the deletion is audited, and the audit line
 * keeps the caption and who uploaded it — which is the record that matters and
 * the one part that is nobody's face.
 */
