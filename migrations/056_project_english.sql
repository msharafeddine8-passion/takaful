-- ---------------------------------------------------------------------------
-- Takaful platform - migration 056
-- The English summaries 055 left empty.
--
-- Additive and safe to run twice.
--
-- 055 seeded summary_en as '' for all four projects. Nothing broke, because
-- the page still reads the dictionary — but the moment it reads this table
-- instead, the English site would show four projects with names and no
-- description, and the fault would look like a rendering bug rather than a
-- seed that was written in one language.
--
-- Carried across from en.ts verbatim, the way the Arabic was from ar.ts.
--
-- Guarded on emptiness rather than run unconditionally: if somebody has since
-- edited a summary through an admin screen, a migration re-running must not
-- overwrite their words with the ones that were in the code.
-- ---------------------------------------------------------------------------

UPDATE projects SET summary_en =
  'Academic and career guidance for high-school students: university and major exploration, academic orientation, scholarship information, CV building, and direct links to verified universities.'
 WHERE slug = 'masarak' AND btrim(summary_en) = '';

UPDATE projects SET summary_en =
  'Professional training that equips young people with practical skills aligned to the needs of today''s job market: digital skills, career readiness, and applied learning.'
 WHERE slug = 'skillsup' AND btrim(summary_en) = '';

UPDATE projects SET summary_en =
  'A bridge between graduates and the labour market through training, mentoring and job-readiness support — connecting education to opportunity and skills to real market needs.'
 WHERE slug = 'welink' AND btrim(summary_en) = '';

UPDATE projects SET summary_en =
  'A youth-led digital marketing company: training in marketing, content creation, photography and production, creating real jobs and supporting the sustainability of Takaful''s work.'
 WHERE slug = 'passion' AND btrim(summary_en) = '';
