-- 018: finish what 017 started — the certificate kind check.
--
-- WHAT WENT WRONG
--
-- 017 meant to widen `certificates.kind` from ('course','hours') to the five
-- kinds the programme needs. It wrote:
--
--   ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_kind_check;
--   ALTER TABLE certificates ADD  CONSTRAINT certificates_kind_check CHECK (...);
--
-- The constraint it dropped does not exist. 002 named it `chk_cert_kind`, and
-- IF EXISTS turned the mistake into a silent no-op: the ADD succeeded, so the
-- table ended up with two check constraints on the same column — a wide one
-- that 017 added and the original narrow one, still enforcing ('course',
-- 'hours'). Postgres requires every check to pass, so the narrow one won and
-- nothing could be issued.
--
-- It surfaced the first time a credential was issued, in a probe rather than
-- for a volunteer, because the probe issues all four kinds.
--
-- THE LESSON, WHICH IS THE REASON FOR THIS COMMENT
--
-- `DROP CONSTRAINT IF EXISTS` on a guessed name cannot fail and cannot warn.
-- It is only safe when the name has been read from the database first. The
-- statement below drops the real name; the DO block after it is the belt to
-- that brace — it drops any *other* check on `kind` whatever it is called, so
-- a third constraint arriving from somewhere else cannot reproduce this.

ALTER TABLE certificates DROP CONSTRAINT IF EXISTS chk_cert_kind;

DO $$
DECLARE
  con RECORD;
BEGIN
  FOR con IN
    SELECT conname, pg_get_constraintdef(oid) AS def
    FROM pg_constraint
    WHERE conrelid = 'certificates'::regclass
      AND contype = 'c'
      AND conname <> 'certificates_kind_check'
      AND pg_get_constraintdef(oid) LIKE '%kind = ANY%'
  LOOP
    RAISE NOTICE 'dropping a narrower kind check: % — %', con.conname, con.def;
    EXECUTE format('ALTER TABLE certificates DROP CONSTRAINT %I', con.conname);
  END LOOP;
END $$;

-- Recreate the intended one idempotently, so this migration also repairs a
-- database where 017 was never applied.
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_kind_check;
ALTER TABLE certificates ADD CONSTRAINT certificates_kind_check
  CHECK (kind IN ('course', 'hours', 'orientation', 'level', 'program'));

-- `chk_cert_course` requires a course_slug whenever kind = 'course'. An
-- orientation credential is a course credential in every respect that matters,
-- so it carries a slug too and the rule should cover it.
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS chk_cert_course;
ALTER TABLE certificates ADD CONSTRAINT chk_cert_course
  CHECK (kind NOT IN ('course', 'orientation') OR course_slug IS NOT NULL);

-- A programme credential must name the programme, for the same reason a level
-- one must name the level: without it the certificate cannot say what it is
-- for, and the verification page would have to guess.
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS chk_cert_program;
ALTER TABLE certificates ADD CONSTRAINT chk_cert_program
  CHECK (kind <> 'program' OR program_id IS NOT NULL);
