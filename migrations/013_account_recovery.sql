-- 013: getting back into an account, and making guessing expensive.
--
-- Three gaps this closes.
--
-- A forgotten password meant a lost account. There was no recovery of any
-- kind, so the only fix was an administrator editing the database by hand,
-- which is both a support burden and a way for anyone who can talk their way
-- past a volunteer coordinator to take over an account.
--
-- Nothing checked that an address belonged to the person who typed it. An
-- account is how someone is contacted about a shift and how a certificate is
-- traced back to them, so the address has to be theirs.
--
-- And nothing slowed down guessing. A password can be tried as fast as the
-- server will answer, and Argon2 makes each answer slow but not slow enough.
--
-- No BEGIN/COMMIT: the runner wraps each migration in its own transaction.

-- ------------------------------------------------------------ verified email
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN users.email_verified_at IS
  'Null means unproven, not invalid. Accounts that existed before verification was introduced are unproven, and must not be locked out for it.';

-- ------------------------------------------------------------------- tokens
-- One table for both jobs. They have the same shape - a single-use secret with
-- an expiry - and two tables would mean two chances to get the rules wrong.
CREATE TABLE IF NOT EXISTS auth_tokens (
  id          UUID        NOT NULL PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose     TEXT        NOT NULL,

  -- Only the hash. A leak of this table must not hand anyone a working reset
  -- link, the same reason sessions store a hash and not the cookie.
  token_hash  TEXT        NOT NULL,

  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- What the token was issued for, so a reset link cannot be used to confirm
  -- an address the requester has since changed it to.
  target      TEXT        NULL,

  CONSTRAINT chk_token_purpose CHECK (purpose IN ('password_reset', 'email_verify')),
  CONSTRAINT chk_token_window  CHECK (expires_at > created_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_auth_token_hash ON auth_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_token_user ON auth_tokens (user_id, purpose, created_at DESC);
-- Only unused, unexpired tokens are ever looked up by anything but cleanup.
CREATE INDEX IF NOT EXISTS idx_auth_token_live
  ON auth_tokens (expires_at) WHERE used_at IS NULL;

COMMENT ON TABLE auth_tokens IS
  'Single use. Spending a token sets used_at; it is never deleted on use, so "was this link already used" has an answer.';

-- ---------------------------------------------------------- login throttling
-- One row per attempt, so both "this address is being guessed at" and "this
-- machine is guessing at many addresses" can be asked of the same data.
--
-- Neither the address nor the IP is stored. Both are hashed, because the only
-- question ever asked of them is "the same as this one?", and a table of who
-- tried to sign in from where is a liability nobody needs. Failed attempts on
-- addresses that have no account would otherwise collect the addresses of
-- people who are not even users here.
CREATE TABLE IF NOT EXISTS auth_attempts (
  id         BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email_hash TEXT        NULL,
  ip_hash    TEXT        NULL,
  succeeded  BOOLEAN     NOT NULL,
  at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_attempt_identifies CHECK (email_hash IS NOT NULL OR ip_hash IS NOT NULL)
);

-- The only reads are "failures in the last few minutes", so the indexes carry
-- the timestamp and skip the successes.
CREATE INDEX IF NOT EXISTS idx_auth_attempt_email
  ON auth_attempts (email_hash, at DESC) WHERE NOT succeeded;
CREATE INDEX IF NOT EXISTS idx_auth_attempt_ip
  ON auth_attempts (ip_hash, at DESC) WHERE NOT succeeded;
CREATE INDEX IF NOT EXISTS idx_auth_attempt_age ON auth_attempts (at);

COMMENT ON TABLE auth_attempts IS
  'Prunable. Rows older than the longest throttling window carry no information and are deleted by prune_auth_attempts().';

-- Old attempts answer no question anyone asks. Called opportunistically rather
-- than on a schedule, because this project has no scheduler and a table that
-- needs one is a table that will grow until someone notices.
CREATE OR REPLACE FUNCTION prune_auth_attempts(older_than INTERVAL DEFAULT INTERVAL '24 hours')
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE removed INTEGER;
BEGIN
  DELETE FROM auth_attempts WHERE at < now() - older_than;
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END $$;

-- Expired and spent tokens likewise: an unused token past its expiry can never
-- be spent, and a used one has already done its work.
CREATE OR REPLACE FUNCTION prune_auth_tokens()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE removed INTEGER;
BEGIN
  DELETE FROM auth_tokens
   WHERE (used_at IS NOT NULL AND used_at < now() - INTERVAL '30 days')
      OR (used_at IS NULL AND expires_at < now() - INTERVAL '7 days');
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END $$;
