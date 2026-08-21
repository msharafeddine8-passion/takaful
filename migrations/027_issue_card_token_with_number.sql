-- ---------------------------------------------------------------------------
-- Takaful platform - migration 027
-- Issue the card token wherever the membership number is issued.
--
-- Migration 026 added the token and backfilled everybody who already had a
-- number. That left the other half: everybody who gets one from now on.
--
-- A membership number comes into existence two ways — the roster recognition
-- path in lib/actions/roster.ts, and this trigger, which fires whenever
-- anybody reaches 'accepted_volunteer' by any route at all, including an
-- accepted application and an admin acting directly on the record. Issuing the
-- token in the application code alone would leave those people with a number
-- and no token: a membership card with no QR on it, and nothing anywhere would
-- notice, because every screen would still look right.
--
-- So it happens here as well, at the one point the database itself guarantees
-- runs. Belt and braces on purpose: the two paths cannot disagree, because
-- both use COALESCE and neither overwrites.
--
-- COALESCE rather than assignment matters more than it looks. Re-accepting a
-- returning volunteer must not hand them a fresh token, because that would
-- silently invalidate the card already in their wallet — the same reason the
-- existing trigger guards the number with `member_number IS NULL`.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION issue_member_number() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.new_status <> 'accepted_volunteer' THEN
    RETURN NEW;
  END IF;

  UPDATE profiles
     SET member_number = nextval('member_number_seq'),
         card_token = COALESCE(card_token, encode(gen_random_bytes(16), 'hex'))
   WHERE user_id = NEW.user_id
     AND member_number IS NULL;

  -- Already numbered — by the roster path, or before 026 — but never given a
  -- token. Without this they would keep a card that cannot be verified.
  UPDATE profiles
     SET card_token = encode(gen_random_bytes(16), 'hex')
   WHERE user_id = NEW.user_id
     AND member_number IS NOT NULL
     AND card_token IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Anyone numbered between 026 running and this migration.
UPDATE profiles
   SET card_token = encode(gen_random_bytes(16), 'hex')
 WHERE member_number IS NOT NULL
   AND card_token IS NULL;
