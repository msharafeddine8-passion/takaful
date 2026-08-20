/*
 * The association's own roster of people who already volunteer with it.
 *
 * Before this, the only way in was the application form: register, fill in why
 * you want to volunteer and what your experience is, then wait for a reviewer.
 * For someone who has been turning up since 2018 that is both insulting and
 * pointless — the answer to "should we take this person?" was settled years
 * ago. This table holds the answer, so the platform can recognise them instead
 * of interviewing them.
 *
 * It is not an account and cannot sign anybody in. It is a list of names the
 * association vouches for, and a claim against it still has to be approved by
 * a human who knows the person. That matters: a name alone is not proof, and
 * this is a platform with minors on it.
 */

CREATE TABLE IF NOT EXISTS volunteer_roster (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The number the association already uses, shown as T047. Stored as the
  -- integer it is so it can be compared and sequenced; the T and the padding
  -- are presentation, applied in one place in the UI.
  member_number  INTEGER     NOT NULL UNIQUE,

  full_name      TEXT        NOT NULL,
  /*
   * Spelling drifts — أ/ا, ة/ه, spacing — so the same person is written three
   * ways across two spreadsheets. Matching on the raw name found 38 people;
   * matching on a folded form and the phone found 178. This column holds the
   * folded form so lookups do not have to fold on every query.
   */
  name_folded    TEXT        NOT NULL,
  -- Last 8 digits only: 03xxxxxx, +9613xxxxxx and 009613xxxxxx are one line.
  phone_tail     TEXT        NULL,
  date_of_birth  DATE        NULL,
  joined_on      DATE        NULL,
  committee      TEXT        NULL,

  /*
   * Set when a real account claims this entry. UNIQUE, so one roster line can
   * never be claimed twice — two people cannot both become volunteer T047.
   */
  claimed_by     UUID        NULL UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  claimed_at     TIMESTAMPTZ NULL,
  approved_by    UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  approved_at    TIMESTAMPTZ NULL,

  source         TEXT        NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_roster_name_folded ON volunteer_roster (name_folded);
CREATE INDEX IF NOT EXISTS ix_roster_phone_tail  ON volunteer_roster (phone_tail)
  WHERE phone_tail IS NOT NULL;
-- The staff queue reads exactly this: claimed, not yet approved.
CREATE INDEX IF NOT EXISTS ix_roster_pending ON volunteer_roster (claimed_at)
  WHERE claimed_by IS NOT NULL AND approved_at IS NULL;

/*
 * member_number_seq issued 1001, 1002, … in the order people happened to sign
 * up. The association's real numbers run from 1 to roughly 473 and mean
 * something — they record who joined first. Once the roster is imported, a new
 * volunteer must continue after the highest roster number, not collide with
 * it, so the sequence is moved above the roster on every import (see
 * scripts/import-roster.mts). This statement only guarantees the sequence is
 * never behind the numbers already handed out.
 */
SELECT setval(
  'member_number_seq',
  GREATEST(
    (SELECT COALESCE(MAX(member_number), 0) FROM profiles),
    (SELECT COALESCE(MAX(member_number), 0) FROM volunteer_roster),
    1
  ),
  true
);
