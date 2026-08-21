-- ---------------------------------------------------------------------------
-- Takaful platform - migration 025
-- What each of the six stages actually asks for.
--
-- The stages have existed since the journey engine was built, and every one of
-- them was empty. That is not a cosmetic gap: a stage with no requirements
-- computes as 100% — nought of nought met — so the engine carries an
-- `isConfigured` flag purely so screens can say "not set yet" instead of
-- announcing six finished stages. It also meant `nextAction` was null for
-- everybody, and the dashboard's most important card had nothing to say.
--
-- These are a STARTING POINT, written to be edited. Every one of them can be
-- changed in the Journey Builder without touching code, and the association
-- should expect to change them — this migration exists so there is something
-- coherent to argue with rather than an empty table.
--
-- The shape of the ladder:
--   1  التعرّف والانضمام   join, learn what the association is, meet the rules
--   2  التواصل والمشاركة   the people skills, and turn up to something
--   3  العمل الميداني      safety first, then real field work and real hours
--   4  قيادة الفريق        lead a small team, be signed off by a supervisor
--   5  تنسيق المشاريع      run something end to end
--   6  الإرشاد والتخرّج    teach the next intake
--
-- Hours climb 10 → 25 → 50 → 100 across stages 3-6 (stored as minutes). Course
-- requirements name a real slug from the 41 in src/lib/course-content, so they
-- link straight through. Every stage past the first ends with an `approval`,
-- because a stage is something the association awards, not something a person
-- awards themselves — and the engine reports that as `awaiting_approval`
-- rather than pretending the stage is done.
--
-- Runs once and only once. The guard at the bottom is `NOT EXISTS (any
-- requirement at all)`, not a per-row conflict key: once the association has
-- touched this in the Journey Builder — added one, removed one, reworded one —
-- a seed re-inserting its own opinion would be vandalism, and a per-row upsert
-- would quietly undo their edits. Empty table, seed it. Otherwise, leave it
-- entirely alone.
-- ---------------------------------------------------------------------------

WITH v AS (
  SELECT id FROM journey_versions ORDER BY created_at LIMIT 1
),
s AS (
  SELECT number, id FROM journey_stages WHERE version_id = (SELECT id FROM v)
),
spec(stage, sort_order, kind, label_ar, label_en, config, is_required) AS (
  VALUES
    -- ---------------------------------------------------------------- 1
    (1, 1, 'course', 'دورة: أسس العمل التطوّعي', 'Course: Foundations of volunteering',
     '{"courseSlug":"volunteering-foundations"}'::jsonb, true),
    (1, 2, 'course', 'دورة: ميثاق السلوك والإبلاغ', 'Course: Code of conduct and reporting',
     '{"courseSlug":"code-of-conduct-and-reporting"}'::jsonb, true),
    (1, 3, 'course', 'دورة: دورة حياة المتطوّع', 'Course: The volunteer lifecycle',
     '{"courseSlug":"volunteer-lifecycle"}'::jsonb, false),

    -- ---------------------------------------------------------------- 2
    (2, 1, 'course', 'دورة: مهارات التواصل', 'Course: Communication skills',
     '{"courseSlug":"communication-skills"}'::jsonb, true),
    (2, 2, 'course', 'دورة: العمل ضمن فريق', 'Course: Teamwork',
     '{"courseSlug":"teamwork"}'::jsonb, true),
    (2, 3, 'activity', 'حضور نشاط واحد على الأقل', 'Attend at least one activity',
     '{"count":"1"}'::jsonb, true),
    -- Each approval names the capability that may give it. The schema insists
    -- on one, which is the schema being right: "someone approves this" without
    -- saying who is how an approval ends up meaning whoever got there first.
    (2, 4, 'approval', 'تأكيد المشرف على جاهزيتك للميدان', 'Supervisor confirms you are ready for the field',
     '{"capability":"stages.award"}'::jsonb, true),

    -- ---------------------------------------------------------------- 3
    (3, 1, 'course', 'دورة: السلامة الميدانية', 'Course: Field safety',
     '{"courseSlug":"field-safety"}'::jsonb, true),
    (3, 2, 'course', 'دورة: حماية الفئات الأكثر عرضة', 'Course: Protecting vulnerable people',
     '{"courseSlug":"protecting-vulnerable"}'::jsonb, true),
    (3, 3, 'course', 'دورة: الإسعافات الأولية', 'Course: First aid basics',
     '{"courseSlug":"first-aid-basics"}'::jsonb, false),
    (3, 4, 'activity', 'حضور ثلاثة أنشطة ميدانية', 'Attend three field activities',
     '{"count":"3"}'::jsonb, true),
    (3, 5, 'hours', 'عشر ساعات تطوّع موثّقة', 'Ten verified volunteering hours',
     '{"minutes":"600"}'::jsonb, true),
    (3, 6, 'approval', 'تقييم المشرف بعد العمل الميداني', 'Supervisor review after field work',
     '{"capability":"stages.award"}'::jsonb, true),

    -- ---------------------------------------------------------------- 4
    (4, 1, 'course', 'دورة: قيادة الفريق', 'Course: Team leadership',
     '{"courseSlug":"team-leadership"}'::jsonb, true),
    (4, 2, 'course', 'دورة: حلّ النزاعات', 'Course: Conflict resolution',
     '{"courseSlug":"conflict-resolution"}'::jsonb, true),
    (4, 3, 'course', 'دورة: الذكاء العاطفي', 'Course: Emotional intelligence',
     '{"courseSlug":"emotional-intelligence"}'::jsonb, false),
    (4, 4, 'activity', 'المشاركة في ستة أنشطة', 'Take part in six activities',
     '{"count":"6"}'::jsonb, true),
    (4, 5, 'hours', 'خمس وعشرون ساعة موثّقة', 'Twenty-five verified hours',
     '{"minutes":"1500"}'::jsonb, true),
    (4, 6, 'approval', 'ترشيح من منسّق لقيادة فريق', 'Nominated by a coordinator to lead a team',
     '{"capability":"stages.award"}'::jsonb, true),

    -- ---------------------------------------------------------------- 5
    (5, 1, 'course', 'دورة: إدارة المشاريع المجتمعية', 'Course: Community project management',
     '{"courseSlug":"community-project-management"}'::jsonb, true),
    (5, 2, 'course', 'دورة: التخطيط والمتابعة والتقييم', 'Course: Monitoring and evaluation',
     '{"courseSlug":"monitoring-and-evaluation"}'::jsonb, true),
    (5, 3, 'course', 'دورة: قراءة احتياجات المجتمع', 'Course: Reading community needs',
     '{"courseSlug":"community-needs"}'::jsonb, true),
    (5, 4, 'hours', 'خمسون ساعة موثّقة', 'Fifty verified hours',
     '{"minutes":"3000"}'::jsonb, true),
    (5, 5, 'document', 'خطة مشروع مكتوبة ومعتمدة', 'A written project plan, approved',
     '{"documentKind":"project-plan"}'::jsonb, true),
    (5, 6, 'approval', 'اعتماد إدارة البرامج', 'Signed off by programme management',
     '{"capability":"programme.edit"}'::jsonb, true),

    -- ---------------------------------------------------------------- 6
    (6, 1, 'course', 'دورة: تدريب المدرّبين', 'Course: Training of trainers',
     '{"courseSlug":"training-of-trainers"}'::jsonb, true),
    (6, 2, 'course', 'دورة: القيادة التحويلية', 'Course: Transformational leadership',
     '{"courseSlug":"transformational-leadership"}'::jsonb, true),
    (6, 3, 'course', 'دورة: الحوكمة والمساءلة', 'Course: Governance and accountability',
     '{"courseSlug":"governance-and-accountability"}'::jsonb, false),
    (6, 4, 'hours', 'مئة ساعة موثّقة', 'One hundred verified hours',
     '{"minutes":"6000"}'::jsonb, true),
    (6, 5, 'evaluation', 'إرشاد متطوّع جديد حتى المرحلة الثانية',
     'Mentor a new volunteer as far as stage two', '{}'::jsonb, true),
    (6, 6, 'approval', 'قرار التخرّج من مجلس الإدارة', 'Graduation decided by the board',
     '{"capability":"members.manage"}'::jsonb, true)
)
-- The id column carries no default — the Journey Builder supplies one from the
-- application — so the seed has to as well.
INSERT INTO stage_requirements (id, stage_id, kind, label_ar, label_en, config, is_required, sort_order)
SELECT gen_random_uuid(), s.id, spec.kind, spec.label_ar, spec.label_en,
       spec.config, spec.is_required, spec.sort_order
  FROM spec JOIN s ON s.number = spec.stage
 WHERE NOT EXISTS (SELECT 1 FROM stage_requirements);
