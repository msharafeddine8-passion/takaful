-- ---------------------------------------------------------------------------
-- Takaful platform - migration 058
-- Four English strings 055 and 056 got wrong.
--
-- Additive and safe to run twice.
--
-- The seed was supposed to carry the dictionary across verbatim so that
-- reading projects from the table changed nothing a visitor sees. The Arabic
-- did. The English did not, in four places, and none of them was noticed until
-- the page was rendered side by side against the old one:
--
--   masarak.tag_en      'Education and guidance'  should be 'Education & guidance'
--   skillsup.tag_en     'Vocational training'     should be 'Professional training'
--   skillsup.summary_en ASCII apostrophe          should be U+2019
--   passion.summary_en  ASCII apostrophe          should be U+2019
--
-- The two tags are editorial changes to a public page that nobody decided to
-- make; they arrived as a side effect of a seed being retyped instead of
-- copied. The two apostrophes are 056 escaping '' for SQL and losing the
-- typographic character in the process — the same word rendered two ways on
-- one page, which is the sort of thing a reader feels without being able to
-- name.
--
-- Guarded on the wrong value rather than run unconditionally, so a migration
-- re-running cannot overwrite an edit somebody has since made deliberately.
-- ---------------------------------------------------------------------------

UPDATE projects SET tag_en = 'Education & guidance'
 WHERE slug = 'masarak' AND tag_en = 'Education and guidance';

UPDATE projects SET tag_en = 'Professional training'
 WHERE slug = 'skillsup' AND tag_en = 'Vocational training';

UPDATE projects SET summary_en =
  'Professional training that equips young people with practical skills aligned to the needs of today’s job market: digital skills, career readiness, and applied learning.'
 WHERE slug = 'skillsup' AND summary_en LIKE '%today''s job market%';

UPDATE projects SET summary_en =
  'A youth-led digital marketing company: training in marketing, content creation, photography and production, creating real jobs and supporting the sustainability of Takaful’s work.'
 WHERE slug = 'passion' AND summary_en LIKE '%Takaful''s work%';
