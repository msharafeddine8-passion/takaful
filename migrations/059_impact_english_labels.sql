-- ---------------------------------------------------------------------------
-- Takaful platform - migration 059
-- The five English labels 053 got wrong.
--
-- Additive and safe to run twice.
--
-- 053 promised its seed carried the front page across verbatim so that reading
-- the figures from a table changed nothing a visitor sees. The Arabic did. The
-- English did not: all five labels were seeded lower-case, and two were quietly
-- reworded — 'Social and cultural activities' for 'Social & cultural
-- activities', and 'sustained projects' for 'Sustainable projects'.
--
-- The values and the order were right, which is exactly why this survived a
-- reading: the numbers matched, so the seed looked correct.
--
-- This is the second time in one day a seed I wrote retyped a public string
-- instead of copying it (see 058, four project strings). The lesson is worth
-- more than the fix: a seed that claims to reproduce a page must be checked
-- against that page in BOTH languages, because the language nobody is reading
-- while they work is the one that drifts.
--
-- 'sustained projects' → 'Sustainable projects' is not a spelling correction.
-- Sustained says the association kept them going; sustainable says they can
-- keep themselves going. The association chose the second word about its own
-- work and a seed changed it to the first.
--
-- The `key` stays `sustained_projects`: it is a machine name that stored
-- answers and screens reference, and 053 says a figure keeps its identity when
-- its wording is corrected.
--
-- Guarded on the wrong value, so a re-run cannot overwrite an edit somebody has
-- since made through /staff/impact — which now exists, and is the reason a
-- correction like this will never need a migration again.
-- ---------------------------------------------------------------------------

UPDATE impact_numbers SET label_en = 'Active volunteers'
 WHERE key = 'active_volunteers'  AND label_en = 'active volunteers';

UPDATE impact_numbers SET label_en = 'Families supported'
 WHERE key = 'families_supported' AND label_en = 'families supported';

UPDATE impact_numbers SET label_en = 'Social & cultural activities'
 WHERE key = 'activities_run'     AND label_en = 'social and cultural activities';

UPDATE impact_numbers SET label_en = 'Young people trained'
 WHERE key = 'youth_trained'      AND label_en = 'young people trained';

UPDATE impact_numbers SET label_en = 'Sustainable projects'
 WHERE key = 'sustained_projects' AND label_en = 'sustained projects';
