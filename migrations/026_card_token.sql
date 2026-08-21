-- ---------------------------------------------------------------------------
-- Takaful platform - migration 026
-- A membership card needs a secret, not a serial number.
--
-- The card's QR pointed at /verify?member=NNNN, and membership numbers run in
-- sequence from T014 to T473. Anybody who scanned one card — or simply counted
-- from one — could walk the whole range and collect the full name and stage of
-- every volunteer in the association. Four hundred and thirty-nine people, a
-- third of them recognisable young women, enumerable by a for-loop. The card
-- was not the leak; the identifier was.
--
-- So verification moves to a token nobody can guess. 16 random bytes, hex, from
-- pgcrypto's CSPRNG: 128 bits, which is not enumerable at any rate and never
-- will be. It carries no meaning — it is not derived from the member number,
-- the name or anything else, so possessing one tells you nothing about the
-- next.
--
-- The token identifies a card, not a person: it is what somebody standing in
-- front of the volunteer scans. What that scan is allowed to reveal is decided
-- separately, in the verification page's allowlist, and is deliberately much
-- less than this row holds.
--
-- Backfilled for everyone who already has a membership number, and issued to
-- everyone who gets one later. Idempotent: only ever fills a NULL.
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_token TEXT;

-- Unique so a collision is impossible rather than merely unlikely, and so a
-- lookup by token is an index hit rather than a scan of four hundred rows.
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_card_token
  ON profiles (card_token) WHERE card_token IS NOT NULL;

/*
 * gen_random_bytes rather than gen_random_uuid: a v4 UUID carries 122 bits and
 * announces its own format, and a token that looks like a UUID invites being
 * treated as an internal id. This is 32 hex characters and nothing else.
 */
UPDATE profiles
   SET card_token = encode(gen_random_bytes(16), 'hex')
 WHERE member_number IS NOT NULL
   AND card_token IS NULL;

-- A card token is only meaningful for somebody who has a membership number.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS chk_profiles_card_token;
ALTER TABLE profiles ADD CONSTRAINT chk_profiles_card_token
  CHECK (card_token IS NULL OR length(card_token) >= 32);

-- Issuing the token alongside every new number is migration 027.
