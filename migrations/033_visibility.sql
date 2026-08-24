-- ---------------------------------------------------------------------------
-- Takaful platform - migration 033
-- Who agreed to be named on a public page, and how much of them may be named.
--
-- Additive and safe to run twice.
--
-- This exists ahead of the leaderboard and the recognition page rather than
-- alongside them. A ranking built first and made optional afterwards has, for
-- however long that takes, published four hundred people who were never asked
-- — and there is no way to unpublish a page somebody has already read.
--
-- Two rules the shape of these columns is meant to make hard to get wrong:
--
--   Silence is a no. The default is the most private of the three values, so a
--   person who never opens this page, never reads the notice, or registered
--   two years before the page existed is not listed. An opt-out default would
--   have been one word different here and would have meant the opposite.
--
--   Age is not stored here and is never copied here. The platform has minors
--   on it, birth dates live in profiles_sensitive and safeguarding_records,
--   and the public pages read them only to decide. A boolean on profiles
--   saying "this one is a child" would be a far easier thing to leak than a
--   date in a table nothing renders from — and every join that has to reach
--   for the date is a join somebody has to justify.
--
-- Not reusing profiles.is_public. That flag governs the card verification
-- page — whether a stranger holding a scanned card sees a name — which is a
-- different surface, a different audience and a different decision. Folding
-- the two together would mean somebody who wanted their card to verify was
-- silently entered into a public ranking, which is exactly the kind of
-- consent nobody gave.
-- ---------------------------------------------------------------------------

-- ------------------------------------------------------- the three choices

-- 'hidden'          not listed on any public ranking or recognition page
-- 'display_name'    listed under the display name they chose, no photograph
-- 'name_and_photo'  listed under their name, with their photograph
--
-- Text rather than an enum type, matching every other controlled vocabulary in
-- this schema: a CHECK constraint can be widened in one statement, and an enum
-- cannot be narrowed at all.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS public_visibility TEXT NOT NULL DEFAULT 'hidden';

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS chk_profiles_public_visibility;
ALTER TABLE profiles ADD CONSTRAINT chk_profiles_public_visibility CHECK (
  public_visibility IN ('hidden', 'display_name', 'name_and_photo')
);

COMMENT ON COLUMN profiles.public_visibility IS
  'What a public ranking or recognition page may show of this person. Defaults to hidden: consent is given, never assumed. src/lib/visibility.ts decides what this permits, and a minor is protected there regardless of what is stored here.';

-- When they chose, which is not the same as what they chose.
--
-- Null means nobody has ever answered. Without it, a person who deliberately
-- chose to stay private is indistinguishable from four hundred people who were
-- defaulted into privacy, and the association cannot tell how many of its
-- volunteers have actually been asked. It is also the only honest way to
-- answer "did this person consent?" later, which is a question that gets asked
-- exactly once and always about somebody who is upset.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS visibility_chosen_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN profiles.visibility_chosen_at IS
  'When the person last set their own visibility. Null means they never have, and the default is standing in for them.';

-- ---------------------------------------------------- birthday greetings

-- Separate from the three choices on purpose. Being willing to appear in a
-- ranking of hours worked is not the same as being willing to have the date of
-- your birth announced, and a single setting covering both would collect
-- consent for the second by asking about the first.
--
-- Off by default, for the same reason as above, and with a sharper edge: a
-- public greeting is a birth date, and a birth date is the one field this
-- platform is most careful with.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS birthday_greetings BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN profiles.birthday_greetings IS
  'Whether the person agreed to a birthday greeting. Off unless they turned it on. Never implies the greeting may be public: src/lib/visibility.ts decides that, and never for a minor.';

-- The leaderboard's only filter. Partial, because the rows it must never
-- return are the ones it will spend its life excluding, and an index that
-- holds them is an index that invites a plan which reads them.
CREATE INDEX IF NOT EXISTS idx_profiles_visible
  ON profiles (user_id) WHERE public_visibility <> 'hidden';
