-- ---------------------------------------------------------------------------
-- Takaful platform - migration 038
-- The association answers a question it had been leaving to silence.
--
-- Additive and safe to run twice.
--
-- Migration 033 made 'hidden' the default and gave a good reason: consent is
-- given, never assumed. That was right for a platform that had not asked
-- anybody yet, and it produced exactly what it was built to produce — four
-- hundred and fifty-seven accounts, not one of which has ever answered, and
-- therefore recognition pages with nobody on them at all. Nobody chose to stay
-- private. Nobody chose anything.
--
-- The association has now decided, as the body that holds the relationship
-- with these volunteers and enrolled every one of them in person: appearing on
-- its own honour board and volunteer listings is the ordinary state, and not
-- appearing is the choice a person makes. That is a decision about people
-- rather than a technical default, so it is written out here in full instead
-- of being left as one changed word.
--
-- WHAT THIS DOES NOT DO, and must never be edited into doing:
--
--   visibility_chosen_at stays NULL for every row it touches. That column
--   exists to tell "this person chose privacy" apart from "nobody ever asked
--   this person", and this migration does not turn the second into the first.
--   Afterwards a NULL still means what it always meant: the association is
--   standing in for them. It is the only honest answer to "did they agree to
--   this?", a question asked exactly once and always about somebody upset.
--
--   Anybody who has actually answered is untouched. Both statements key on
--   visibility_chosen_at IS NULL, so a person who opened the settings page and
--   chose 'hidden' keeps it. A default may stand in for silence. It may never
--   overrule an answer.
--
--   Minors are unaffected. src/lib/visibility.ts decides who may be shown, and
--   it reads the birth date from the tables that hold it and refuses when the
--   age is unknown. A stored 'name_and_photo' is permission from the person,
--   not a decision about them; the child-protection rule runs after it and
--   wins. Nothing in this file touches that.
--
--   No photograph appears that the person did not upload themselves. Most of
--   these accounts have none, and those rows resolve to a name.
--
-- The people this touches are told. scripts/announce-visibility.mts sends one
-- notification each, naming the change and pointing at the switch, and the
-- settings copy no longer says "nothing is published unless you choose it" —
-- which would have become a lie the moment this ran. A default changed quietly
-- is a default nobody knows they can refuse.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------- new accounts

ALTER TABLE profiles
  ALTER COLUMN public_visibility SET DEFAULT 'name_and_photo';

ALTER TABLE profiles
  ALTER COLUMN birthday_greetings SET DEFAULT TRUE;

COMMENT ON COLUMN profiles.public_visibility IS
  'What a public ranking or recognition page may show of this person. Defaults to name_and_photo since migration 038: the association treats appearing as the ordinary state and not appearing as the choice. src/lib/visibility.ts decides what this permits, and a minor is protected there regardless of what is stored here.';

COMMENT ON COLUMN profiles.birthday_greetings IS
  'Whether the person wants a birthday greeting. On unless they switched it off. Never implies the greeting may be public: src/lib/visibility.ts decides that, and never for a minor.';

-- ------------------------------------------------ the accounts already here

-- Only rows where nobody has answered. The IS NULL is the whole safety of this
-- statement: it is the difference between standing in for silence and
-- overwriting a decision somebody made.
UPDATE profiles
   SET public_visibility = 'name_and_photo'
 WHERE visibility_chosen_at IS NULL
   AND public_visibility = 'hidden';

UPDATE profiles
   SET birthday_greetings = TRUE
 WHERE visibility_chosen_at IS NULL
   AND birthday_greetings = FALSE;

-- ---------------------------------------------------------------- the index

-- Migration 033 indexed the rows that could be listed, which was then a small
-- minority. It is now almost every row, and a partial index over almost
-- everything is a whole index wearing a disguise. The predicate is inverted so
-- the short side is the indexed side again.
DROP INDEX IF EXISTS idx_profiles_visible;

CREATE INDEX IF NOT EXISTS idx_profiles_hidden
  ON profiles (user_id) WHERE public_visibility = 'hidden';
