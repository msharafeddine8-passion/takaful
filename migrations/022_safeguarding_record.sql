-- ---------------------------------------------------------------------------
-- Takaful platform - migration 022
-- The safeguarding record a volunteer must have, however they arrived.
--
-- Additive and safe to run twice.
--
-- Someone recognised from the association's roster never fills in the
-- application form, and the application form was where the emergency contact,
-- the guardian's consent and the agreement to the code of conduct were
-- collected. Skipping the queue was the point; skipping those was not. A
-- fifteen-year-old on a field activity needs an emergency contact on file
-- whether they joined last week or in 2018.
--
-- Kept apart from volunteer_applications on purpose. An application is a
-- request that was decided once; this is a standing record that is renewed,
-- corrected and — for a minor who turns eighteen — outgrown.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS safeguarding_records (
  user_id             UUID        NOT NULL PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  date_of_birth       DATE        NOT NULL,
  emergency_name      TEXT        NOT NULL,
  emergency_phone     TEXT        NOT NULL,
  emergency_relation  TEXT        NULL,

  -- Required only of a minor, and enforced below rather than trusted to a form.
  guardian_name       TEXT        NULL,
  guardian_relation   TEXT        NULL,
  guardian_phone      TEXT        NULL,
  guardian_consent_at TIMESTAMPTZ NULL,

  -- The three agreements, stamped when they were given rather than as a flag,
  -- so "when did they agree to this?" has an answer.
  code_of_conduct_at  TIMESTAMPTZ NOT NULL,
  safeguarding_at     TIMESTAMPTZ NOT NULL,
  data_consent_at     TIMESTAMPTZ NOT NULL,

  medical_notes       TEXT        NULL,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_safeguarding_emergency CHECK (
    length(btrim(emergency_name)) > 0 AND length(btrim(emergency_phone)) > 0
  ),

  /*
   * A minor's record is incomplete without a named guardian who consented.
   * Age is computed from the birth date held on this same row, so the rule
   * cannot be sidestepped by sending a different age with the form.
   */
  CONSTRAINT chk_safeguarding_guardian CHECK (
    -- Eighteen or over: no guardian needed.
    date_of_birth <= (CURRENT_DATE - INTERVAL '18 years')::DATE
    OR (
      guardian_name IS NOT NULL AND length(btrim(guardian_name)) > 0
      AND guardian_phone IS NOT NULL AND length(btrim(guardian_phone)) > 0
      AND guardian_consent_at IS NOT NULL
    )
  )
);

COMMENT ON TABLE safeguarding_records IS
  'Emergency contact, guardian consent and the three agreements. Required of every volunteer, including those recognised from the roster who never made an application.';

CREATE INDEX IF NOT EXISTS idx_safeguarding_dob ON safeguarding_records (date_of_birth);
