import type { CourseContent } from './types';

/**
 * Level 6 — Advanced Volunteer Lifecycle Management. Pass mark 70.
 *
 * Covers the full arc: writing a role description that serves both recruitment
 * and review, designing an onboarding that makes someone useful in week one,
 * supervising without micromanaging, building recognition that does not depend
 * on who the coordinator likes, and ending a volunteering relationship with
 * the respect and documentation it deserves.
 *
 * The central thread: every tool in volunteer management is only as good as
 * the moment at which it is used. A role description written after someone
 * starts is not a role description — it is a defence document. Onboarding done
 * at the end of month one is not onboarding — it is an apology. The course
 * argues for doing the right thing at the right moment, and not improvising.
 */

export const volunteerLifecycle: CourseContent = {
  slug: 'volunteer-lifecycle',
  level: 6,
  minutes: 45,
  passMark: 70,
  title: {
    ar: 'الإدارة المتقدّمة لدورة حياة المتطوّع',
    en: 'Advanced Volunteer Lifecycle Management',
  },
  lede: {
    ar: 'من الاستقطاب إلى الوداع: كيف تختار، وتُهيّئ، وتُشرف، وتُقدّر، وكيف تُنهي علاقة تطوّعية باحترام ووضوح.',
    en: 'From recruitment to farewell: selecting, onboarding, supervising, recognising — and how to end a volunteering relationship with respect and clarity.',
  },
  outcomes: {
    ar: [
      'تكتب وصف دور تطوّعي واضح يُستخدم في الاستقطاب والتقييم معاً',
      'تصمّم تهيئة تجعل المتطوّع الجديد نافعاً وآمناً من أسبوعه الأول',
      'تبني نظام تقدير لا يعتمد على العلاقات الشخصية',
      'تُنهي علاقة تطوّعية باحترام وتوثيق وسبب مفهوم',
    ],
    en: [
      'Write a volunteer role description usable for both recruitment and review',
      'Design an onboarding that makes a new volunteer useful and safe in their first week',
      'Build recognition that does not run on personal relationships',
      'End a volunteering relationship with respect, documentation and a reason that makes sense',
    ],
  },
  sources: [
    'IFRC Volunteering Policy (August 2022) — standards and volunteer management frameworks',
    'UN Volunteers — Insights on Volunteer Management and the State of the World\'s Volunteerism Report',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'vl-m1',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'كتابة وصف الدور التطوّعي', en: 'Writing the Volunteer Role Description' },
      lede: {
        ar: 'وصف الدور ليس إعلاناً يجذب الناس — إنه عقد ضمني يُحدّد ما يُعطى وما يُطلب، ويُصبح مرجعاً عند الاستقطاب وعند التقييم.',
        en: 'A role description is not an advertisement to attract people — it is an implicit contract that sets out what is given and what is asked, and becomes the reference at recruitment and at review.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'كثير من المنظمات تكتب وصف الدور مرّة واحدة عند إطلاق فرصة تطوّعية ثم لا تعود إليه. ينتهي الأمر بمتطوّع يتوقّع شيئاً والمنظمة تتوقّع شيئاً آخر، والخلاف يظهر في الشهر الثاني أو الثالث حين يصعب تداركه دون توتّر. وصف الدور الجيّد يحلّ مشكلتين في آنٍ معاً: فعند الاستقطاب يُساعد الشخص المناسب على أن يتعرّف على نفسه في الدور قبل أن يتقدّم، فيُقلّل من حالات عدم التطابق بين التوقّعات. وعند المراجعة الدورية يُعطي مرجعاً موضوعياً بدلاً من الاعتماد على انطباع المنسّق أو ما يتذكّره من محادثات قديمة. الوصف الجيّد يُجيب على سؤال واحد قبل كل شيء: لو قرأ شخص هذا الوصف بعيون شخص يُفكّر في التقدّم، هل سيعرف بدقّة ما ينتظره في الأسبوع الأول والشهر الأول وبعد ستة أشهر؟',
            en: 'Many organisations write a role description once, at the launch of a volunteering opportunity, and never return to it. The result is a volunteer who expects one thing while the organisation expects another, and the disagreement surfaces in the second or third month when it is hard to address without tension. A good role description solves two problems at once: at recruitment it helps the right person recognise themselves in the role before applying, reducing expectation mismatches. At periodic review it gives an objective reference rather than relying on the coordinator\'s impression or memories of old conversations. A good description answers one question above all: if a person read this through the eyes of someone thinking about applying, would they know precisely what awaits them in week one, month one and after six months?',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'اسم الدور ومكانه في الهيكل التنظيمي — من يُشرف على المتطوّع مباشرةً ومع من يتنسّق بشكل منتظم',
              'الهدف من الدور في جملة واحدة — ما الذي يتغيّر في حياة المستفيدين لأن هذا الشخص يقوم بهذا العمل تحديداً',
              'المهام الأساسية — ما يُفعل فعلاً أسبوعياً أو شهرياً، لا ما يُفترض فعله نظرياً في أحسن الأحوال',
              'المهارات المطلوبة مقابل المهارات المفضّلة بصدق — لا تُدرج كل شيء كمطلوب وإلا ضيّقت الباب بوجه أشخاص كفوئين',
              'الوقت المطلوب بالساعات الفعلية لا بالتعبيرات الفضفاضة — «وقت جزئي» و«حسب الحاجة» لا تعنيان شيئاً',
              'ما يحصل عليه المتطوّع فعلاً — تدريب، شهادة خبرة، إشراف احترافي، فرصة للنمو — بصراحة وليس بوعود مُبهمة',
              'شروط إنهاء الدور من الطرفين ومدّة الإشعار المطلوبة — يُقرأ هذا البند فقط حين يلزم ويُراد حينها أن يكون موجوداً',
            ],
            en: [
              'The name of the role and its place in the structure — who supervises the volunteer directly and with whom they coordinate regularly',
              'The purpose of the role in one sentence — what changes in the lives of those served because this person does this specific work',
              'Core tasks — what is actually done weekly or monthly, not what might theoretically be expected in the best of circumstances',
              'Required versus preferred skills, honestly — do not list everything as required or you narrow the door on capable people',
              'Time commitment in actual hours not loose expressions — "part time" and "as needed" mean nothing',
              'What the volunteer actually receives — training, an experience reference, professional supervision, a growth opportunity — frankly, not as vague promises',
              'Exit terms for both parties and the notice period required — this clause is only read when it is needed, and at that moment you want it to exist',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'الغموض يُكلّف أكثر مما يُوفّره', en: 'Vagueness costs more than it saves' },
          content: {
            ar: 'وصف الدور الذي يقول «المساعدة في أنشطة متنوّعة حسب الحاجة» يستقطب كل شخص لأنه لا يقول شيئاً، وحين يصل المتطوّع يكتشف أن المنظمة تحتاج شيئاً محدّداً هو لا يريده أو لا يستطيعه. الصياغة الصادقة قد تُقلّل عدد المتقدّمين في البداية، لكن من يتقدّم يعرف ما يدخل عليه، وهذا أوفر للطرفين بكثير من جذب الجميع ثم خسارة معظمهم بعد شهر.',
            en: 'A role description that says "assisting with various activities as required" attracts everyone because it says nothing, and when the volunteer arrives they find the organisation needs something specific they neither want nor can do. Honest wording may reduce initial applicants, but whoever applies knows what they are walking into — far more efficient for both parties than attracting everyone and then losing most of them after a month.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'المهام الأساسية', en: 'Core tasks' },
              text: {
                ar: 'ما يُفعل كل أسبوع فعلاً: لا «دعم الفريق»، ولا «المشاركة في الأنشطة» — فعل محدّد ونتيجة قابلة للقياس في وقت معلوم.',
                en: 'What is actually done each week: not "supporting the team" or "participating in activities" — a specific action with a measurable result in a known timeframe.',
              },
            },
            {
              title: { ar: 'ساعات واقعية لا مثالية', en: 'Realistic not ideal hours' },
              text: {
                ar: 'إن كان الدور يتطلّب في الواقع ثماني ساعات أسبوعياً، اكتب ثماني ساعات. المتطوّع الذي يكتشف لاحقاً أن التوقّعات ضعف ما كُتب يشعر بالغدر، وهذا الشعور لا يُصلح.',
                en: 'If the role actually requires eight hours a week, write eight hours. A volunteer who discovers later that expectations are double what was written feels deceived, and that feeling does not repair itself.',
              },
            },
            {
              title: { ar: 'ما يحصل عليه المتطوّع', en: 'What the volunteer gains' },
              text: {
                ar: 'تدريب يتلقّاه بوضوح، مرجع خبرة يحصل عليه عند النهاية، مهارة تنمو معه في الأثناء. وعد «تجربة غنيّة» ليس شيئاً يمكن قياسه أو المطالبة به لاحقاً.',
                en: 'Training clearly received, an experience reference obtained at the end, a skill growing throughout. Promising "a rich experience" is something that can be neither measured nor later claimed.',
              },
            },
          ],
        },
        {
          type: 'text',
          content: {
            ar: 'وصف الدور وثيقة حيّة لا نصّاً يُكتب ويُنسى. ينبغي مراجعته في نهاية كل دورة تطوّعية بناءً على ما اكتشفه المتطوّع والمنسّق معاً: هل توافقت التوقّعات؟ هل ثمة مهام ظهرت في الواقع ولم تُذكر؟ هل الوقت المُقدَّر كان دقيقاً؟ المراجعة لا تستغرق أكثر من ثلاثين دقيقة، وتُوفّر على المنظمة شهوراً من سوء التفاهم مع الدفعة القادمة. المنظمة التي تُراجع وصف الدور بانتظام تتعلّم من خبرة متطوّعيها وتُحسّن باستمرار؛ والتي تتركه ثابتاً تبدأ كل دورة بمعطيات قديمة لا تعكس الواقع.',
            en: 'A role description is a living document, not a text written once and forgotten. It should be reviewed at the end of every volunteering cycle based on what the volunteer and coordinator discovered together: did expectations align? Were there tasks that appeared in practice but were not mentioned? Was the estimated time accurate? A review takes no more than thirty minutes, and saves the organisation months of misunderstanding with the next cohort. An organisation that regularly reviews its role descriptions learns from its volunteers\' experience and improves continuously; one that leaves it unchanged starts every cycle with outdated information that does not reflect reality.',
          },
        },
        {
          type: 'quiz',
          id: 'vl-q1',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'منظمتك تستعدّ لاستقطاب متطوّعين لبرنامج دعم أسري. أيّ الصياغتين تُعبّر عن الوقت المطلوب بشكل صحيح؟',
            en: 'Your organisation is preparing to recruit volunteers for a family support programme. Which of the two wordings correctly describes the time commitment?',
          },
          options: [
            {
              ar: '«وقت جزئي مرن يناسب الجداول المزدحمة»',
              en: '"Flexible part time to fit busy schedules"',
            },
            {
              ar: '«ست ساعات أسبوعياً: أربع ساعات جلسات أسرية يومَي الثلاثاء والخميس، وساعتان توثيق وإعداد»',
              en: '"Six hours a week: four hours of family sessions on Tuesdays and Thursdays, and two hours of documentation and preparation"',
            },
            {
              ar: '«حضور منتظم حسب البرنامج الأسبوعي»',
              en: '"Regular attendance according to the weekly programme"',
            },
            {
              ar: '«ثلاث إلى عشر ساعات أسبوعياً تقريباً حسب الحاجة»',
              en: '"Three to ten hours a week approximately, as needed"',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الصياغة الثانية وحدها تُعطي المتقدّم معلومة قابلة للتحقّق قبل التقدّم: أيام محدّدة وساعات فعلية وتوزيع واضح بين أنواع العمل. كل الصياغات الأخرى تترك الغموض بيد المنظمة وتجعل المتطوّع يكتشف الحقيقة بعد الانضمام — وهو أسوأ وقت للاكتشاف.',
            en: 'Only the second wording gives the applicant verifiable information before applying: specific days, actual hours and a clear breakdown between types of work. All other wordings leave the ambiguity in the organisation\'s hands and make the volunteer discover the truth after joining — the worst time for discovery.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'vl-m2',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'التهيئة: الأسبوع الأول ومابعده', en: 'Onboarding: the First Week and Beyond' },
      lede: {
        ar: 'المتطوّع الذي لا يُهيَّأ جيداً لا يفشل وحده — يُثقّل الفريق ويُعرّض الفئة التي جاء ليخدمها للخطر.',
        en: 'A poorly onboarded volunteer does not fail alone — they burden the team and put the people they came to serve at risk.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التهيئة ليست توقيع أوراق وجولة سريعة في المقرّ. إنها العملية الممتدّة التي يتحوّل فيها شخص متحمّس يعرف القليل إلى متطوّع يُنجز مهمّة بأمان وجودة دون أن يُعبّئ الفريق بأسئلة في كل خطوة. المشكلة أن منظمات كثيرة تستثمر وقتاً في استقطاب المتطوّعين ثم تترك التهيئة لمن استقبلهم بالصدفة: متطوّع متمرّس يُكلَّف الاستقبال في آخر لحظة، أو ورقة مطبوعة تُترك على الطاولة، أو ترحيب عامّ في اجتماع أسبوعي مزدحم. النتيجة في حالات كثيرة أن المتطوّع الجديد يشعر بالضياع في الأسبوع الأول، يتردّد في السؤال خشية الظهور بمظهر غير مؤهّل، ويُقرّر الانسحاب بهدوء في الأسبوع الثاني أو الثالث دون أن يُخبر أحداً بالسبب الحقيقي.',
            en: 'Onboarding is not signing papers and a quick tour of the office. It is the extended process by which an enthusiastic person who knows little becomes a volunteer who completes a task safely and with quality, without loading the team with questions at every step. The problem is that many organisations invest time in recruiting volunteers and then leave onboarding to whoever happened to receive them: an experienced volunteer tasked with reception at the last minute, a printed sheet left on the table, or a general welcome in a busy weekly meeting. The result in many cases is that the new volunteer feels lost in week one, hesitates to ask for fear of appearing unqualified, and quietly withdraws in week two or three without telling anyone the real reason.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'اليوم الأول — استقبال شخصي لا ورقة على الطاولة: تعريف بالفريق وجهاً لوجه أو بمكالمة فيديو، جولة في المساحة أو المنصّة الرقمية، وتسليم دليل الدور المكتوب الذي يُجيب على الأسئلة الأولى',
              'الأيام الثلاثة الأولى — مراقبة لا تنفيذ: يجلس المتطوّع الجديد مع متطوّع متمرّس ويرى كيف يُنجز العمل فعلاً، لا فقط ما يقوله الدليل المكتوب',
              'الأسبوع الأول — مهام صغيرة ذات تغذية راجعة فورية: لا تُترك المتطوّعة أسبوعاً كاملاً دون أن تسمع «فعلتِ ذلك بالشكل الصحيح» أو «في المرة القادمة جرّبي هكذا»',
              'نهاية الأسبوع الأول — لقاء قصير للاطمئنان لا للتقييم: «كيف كان الأسبوع؟ ما الذي فاجأك؟ ما الذي لم يُشرح لك بالقدر الكافي؟»',
              'نهاية الشهر الأول — مراجعة رسمية مع المشرف المباشر تُقارن ما أُنجز فعلاً بما هو مكتوب في وصف الدور، وتُفتح فيها فرصة لتعديل التوقّعات من الطرفين',
            ],
            en: [
              'Day one — personal reception not a paper on the table: face-to-face introductions or a video call, a walk through the space or digital platform, and handover of the written role guide that answers the first questions',
              'First three days — observation not execution: the new volunteer sits with an experienced one and sees how the work is actually done, not just what the written guide says',
              'First week — small tasks with immediate feedback: do not leave a volunteer a whole week without hearing "you did that correctly" or "next time try it this way"',
              'End of week one — a short check-in meeting, not an assessment: "how was the week? what surprised you? what was not explained well enough?"',
              'End of month one — a formal review with the direct supervisor comparing what was actually done against what is written in the role description, with an opening for adjusting expectations on both sides',
            ],
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'تهيئة فعّالة', en: 'Effective onboarding' },
          noTitle: { ar: 'تهيئة ناقصة', en: 'Inadequate onboarding' },
          yes: {
            ar: [
              'شخص مسمّى معيَّن مسبقاً يستقبل المتطوّع الجديد في اليوم الأول',
              'مهام واضحة بتعليمات خطوة خطوة لأيام الأسبوع الأول',
              'رفيق من الفريق يُجيب على الأسئلة التشغيلية اليومية الصغيرة',
              'لقاء أسبوعي قصير في الشهر الأول للاطمئنان لا للتقييم',
              'توثيق رسمي للتدريب الذي تلقّاه المتطوّع',
            ],
            en: [
              'A pre-assigned named person receives the new volunteer on day one',
              'Clear tasks with step-by-step instructions for the days of the first week',
              'A team buddy who answers small daily operational questions',
              'A short weekly check-in during the first month — for reassurance not evaluation',
              'Formal documentation of training received by the volunteer',
            ],
          },
          no: {
            ar: [
              'إرسال رابط أو ورقة والانتظار أن يُفهم الدور من دونها',
              'إعطاء مهمة كاملة في اليوم الأول دون توجيه مسبق أو إشراف',
              'الافتراض بأن المتطوّع سيسأل وحده إن احتاج شيئاً',
              'انتظار نهاية الشهر لمعرفة إن كان المتطوّع يسير بالطريق الصحيح',
              'اعتبار التدريب الشفهي العرضي كافياً دون توثيق',
            ],
            en: [
              'Sending a link or a sheet and expecting the role to be understood from it alone',
              'Giving a full task on day one with no prior guidance or supervision',
              'Assuming the volunteer will ask on their own if they need something',
              'Waiting until month\'s end to know if the volunteer is on the right track',
              'Considering incidental verbal training sufficient without documentation',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'رفيق التهيئة: تكليف بسيط وأثر كبير', en: 'An onboarding buddy: a simple assignment with significant effect' },
          content: {
            ar: 'نظام الرفيق بمعناه البسيط هو تكليف رسمي لمتطوّع متمرّس لمدة أربعة أسابيع: يكون المرجع الأول للمتطوّع الجديد في الأسئلة التشغيلية اليومية الصغيرة. هذا يُريح المشرف من الأسئلة التي تستهلك وقته في المهام الكبرى، ويُعطي الجديد شخصاً يسأله دون أن يشعر بالحرج من كثرة الأسئلة. الرفيق الجيّد لا يُجيب فقط — بل يُلاحظ ما لا يُسأل عنه ويُشارك المشرف ما لاحظه.',
            en: 'A buddy system in its simplest form is a formal assignment to an experienced volunteer for four weeks: they are the new volunteer\'s first reference for small daily operational questions. This frees the supervisor from questions that consume their time on major tasks, and gives the newcomer someone to ask without feeling embarrassed about how many questions they have. A good buddy does not only answer — they notice what is not asked about and share their observations with the supervisor.',
          },
        },
        {
          type: 'quiz',
          id: 'vl-q2',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'متطوّعة جديدة انضمت منذ أسبوعين. لم تتأخّر ولم تُقصّر في المهام الصغيرة، لكنها لم تبادر بأيّ سؤال منذ اليوم الأول ولا تتواصل مع الفريق خارج المهام الرسمية. ما الخطوة الصحيحة؟',
            en: 'A new volunteer joined two weeks ago. She has not been late and has not underperformed on small tasks, but has not asked a single question since day one and does not engage with the team outside formal tasks. What is the right step?',
          },
          options: [
            {
              ar: 'لا شيء — الأداء الجيّد دليل كافٍ على أنها تسير بشكل صحيح',
              en: 'Nothing — good performance is sufficient evidence she is on track',
            },
            {
              ar: 'اجلس معها في لقاء قصير غير رسمي واسألها مباشرة ما الذي فاجأها، وما الذي يبدو مختلفاً عمّا توقّعت، وما الذي تحتاج توضيحاً',
              en: 'Sit with her in a short informal meeting and ask directly what surprised her, what seems different from what she expected, and what needs clarifying',
            },
            {
              ar: 'أخبر رفيقها أن يبادر بالحديث معها أكثر',
              en: 'Tell her buddy to initiate more conversation with her',
            },
            {
              ar: 'انتظر مراجعة نهاية الشهر الرسمية',
              en: 'Wait for the formal end-of-month review',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'غياب الأسئلة ليس دائماً علامة فهم — كثيراً ما يعني خوفاً من الظهور بمظهر غير مؤهّل، أو أن المتطوّعة تُحلّ المشكلات بطريقتها الخاصة وقد تكون خاطئة دون أن يعرف أحد. اللقاء القصير غير الرسمي يكسر الجليد ويُعطيك معلومة حقيقية عن تجربتها. إخبار الرفيق مفيد لكنه لا يُغني عن تدخّل المشرف المباشر في لحظة كهذه. وانتظار المراجعة الرسمية يُؤجّل الاكتشاف أسبوعين إضافيتين قد تترسّخ فيهما عادات خاطئة.',
            en: 'No questions is not always a sign of understanding — it often means fear of appearing unqualified, or that the volunteer is solving problems in her own way which may be wrong without anyone knowing. A short informal meeting breaks the ice and gives you real information about her experience. Telling the buddy is useful but does not substitute for the direct supervisor\'s involvement at a moment like this. Waiting for the formal review delays discovery by two more weeks, during which wrong habits may become established.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'vl-m3',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'الإشراف الفعّال والمتابعة المستمرّة', en: 'Effective Supervision and Ongoing Follow-up' },
      lede: {
        ar: 'الإشراف الجيّد يحدث في وقت الهدوء لا وقت الأزمة — إنه علاقة مبنيّة قبل الحاجة إليها لا استجابة لطارئ.',
        en: 'Good supervision happens in calm not in crisis — it is a relationship built before it is needed, not a response to an emergency.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'مشرف المتطوّعين الضعيف لا يُشرف إلا حين تكون هناك مشكلة. يختفي في الأوقات الهادئة ثم يظهر بمطالب عند أول عثرة. هذا النمط يُعطي المتطوّع انطباعاً مُدمّراً: التواصل مع المشرف يعني أن شيئاً سار خطأ. فيتوقّف المتطوّع تدريجياً عن مشاركة المشكلات الصغيرة قبل أن تكبر، ويتوقّف عن ذكر ما يجد صعباً خشية أن يُفسَّر على أنه شكوى أو ضعف. الإشراف الجيّد يعمل بشكل مختلف تماماً: يُحدّد نقاط تواصل منتظمة تحدث بصرف النظر عن وجود مشكلة أم لا، ويُعطي المتطوّع مساحة لذكر ما يجد صعباً أو أكثر مما توقّع دون أن يخشى أن يبدو وكأنه يتذمّر. الفرق بين الإشرافين هو الفرق بين منظمة تعرف ما يجري في الداخل ومنظمة تكتشف المشكلة حين تكبر.',
            en: 'A weak volunteer supervisor only supervises when there is a problem. They disappear during quiet periods and then appear with demands at the first stumble. This pattern gives the volunteer a destructive impression: communicating with the supervisor means something went wrong. So the volunteer gradually stops sharing small problems before they grow, and stops mentioning what they find difficult for fear it will be interpreted as complaint or weakness. Good supervision works quite differently: it sets regular touch points that happen regardless of whether there is a problem, and gives the volunteer space to mention what they find hard or more than expected without fearing they will appear to be complaining. The difference between the two kinds of supervision is the difference between an organisation that knows what is happening inside and one that discovers a problem only when it has grown.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'لقاء فردي قصير مرّة كل أسبوعين على الأقل في الشهور الأولى — خمس عشرة دقيقة منتظمة تُغني عن ساعة نقاش متأخّر في وقت الأزمة',
              'أسئلة مفتوحة لا أسئلة نعم أو لا — «ما الذي أخذ وقتاً أطول مما توقّعت هذا الأسبوع؟» أكثر إفادة من «هل كان الأسبوع جيّداً؟»',
              'توثيق ما يُقال في اللقاءات — ليس لملفّ الأداء بل لكي لا يُنسى الوعد أو الإجراء المتّفق عليه بين لقاء وآخر',
              'ملاحظات إيجابية محدّدة لا عامّة — «طريقتك في إنهاء الجلسة حين اشتدّ التوتّر كانت ممتازة» لا «أديت عملك بشكل جيّد»',
              'ملاحظات تصحيحية في وقتها بصياغة سلوكية محدّدة — ما فُعل وما كان أثره وما المطلوب، لا وصف لشخصية المتطوّع أو نيّاته',
              'الاتّفاق على الخطوات التالية بنهاية كل لقاء وكتابتها — حتى تُصبح المحاسبة عن الفعل لا عن النيّة',
            ],
            en: [
              'A short one-to-one at least every two weeks in the first months — fifteen regular minutes spares an hour of late-stage crisis discussion',
              'Open questions not yes-or-no — "what took longer than you expected this week?" is more useful than "was the week good?"',
              'Documentation of what is said in meetings — not for the performance file but so a promise or agreed action is not forgotten between one meeting and the next',
              'Specific positive observations not general — "the way you closed the session when tension rose was excellent" not "you did your work well"',
              'Corrective observations at the time in specific behavioural wording — what was done, what its effect was and what is needed — not a description of the volunteer\'s personality or intentions',
              'Agreement on next steps at the end of every meeting and writing them down — so accountability is about action not intention',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'الإشراف الزائد يُفقد المتطوّع حافزه', en: 'Over-supervision kills a volunteer\'s motivation' },
          content: {
            ar: 'المتطوّعون يعطون وقتهم لأنهم يريدون ذلك، لا لأنهم مضطرّون. المشرف الذي يُراجع كل بريد إلكتروني قبل إرساله، ويطلب موافقة على كل قرار صغير، ويتّصل بعد كل نشاط يُحوّل تجربة التطوّع إلى وظيفة مُضنية بلا راتب. الإشراف الجيّد يُعطي استقلالية في إطار واضح: هذه المهمة، هذا المعيار، هذه الطريقة التي تُخبرني فيها حين تحتاج شيئاً — وما عدا ذلك فثقتي بك.',
            en: 'Volunteers give their time because they want to, not because they must. A supervisor who reviews every email before it is sent, asks approval for every small decision and calls after every activity turns the volunteering experience into an exhausting unpaid job. Good supervision gives autonomy within a clear frame: this is the task, this is the standard, this is how you tell me when you need something — and beyond that, you have my trust.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'صياغة الملاحظة التصحيحية ليست نقداً شخصياً — إنها تصف ما جرى في سياق محدّد وتُوضح الأثر ثم تسأل أو تقترح. «في جلسة الأسرة الأسبوع الماضي، حين قاطعت الأمّ أكثر من مرّة، لاحظت أنها انسحبت من الحوار في النهاية. ما رأيك في كيف أدرنا ذلك الجزء؟» هذه الصيغة تُشرك المتطوّع في التفكير ولا تضعه في موقف الدفاع، وهي أكثر احتمالاً أن تُؤدّي لتغيير السلوك من «يجب أن تكون أكثر صبراً مع الأهل في المستقبل». الملاحظة العامّة تُولّد مقاومة لأن المتطوّع لا يعرف بالضبط ما يُغيّر؛ والملاحظة المحدّدة تُعطيه نقطة تعلّم واضحة وقابلة للتطبيق.',
            en: 'Framing a corrective observation is not personal criticism — it describes what happened in a specific context, clarifies the effect, then asks or suggests. "In the family session last week, when you interrupted the mother more than once, I noticed she withdrew from the conversation by the end. What do you think about how we handled that part?" This form involves the volunteer in thinking rather than putting them on the defensive, and is more likely to produce behaviour change than "you need to be more patient with parents in future." A general observation generates resistance because the volunteer does not know exactly what to change; a specific one gives a clear and actionable learning point.',
          },
        },
        {
          type: 'quiz',
          id: 'vl-q3',
          label: { ar: 'سيناريو إشرافي', en: 'Supervision scenario' },
          question: {
            ar: 'لاحظت أن متطوّعاً يصل متأخّراً بصورة شبه منتظمة — مرّة أو مرّتين كل شهر بفارق خمس عشرة دقيقة. لم يؤثّر التأخّر على الأنشطة حتى الآن. ما تصرّفك؟',
            en: 'You notice a volunteer arriving late with some regularity — once or twice a month by fifteen minutes. The lateness has not affected activities so far. What do you do?',
          },
          options: [
            {
              ar: 'لا تذكره الآن ما دام لم يُحدث ضرراً فعلياً — ستتدخّل حين يكون هناك أثر ملموس',
              en: 'Do not raise it now since it has caused no actual harm — you will intervene when there is a tangible effect',
            },
            {
              ar: 'اذكره في اللقاء الفردي القريب: «لاحظت تأخّرك في بعض الأوقات — هل ثمة صعوبة في الوصول في الوقت المحدّد؟»',
              en: 'Raise it in the next one-to-one: "I noticed you are sometimes late — is there a difficulty arriving on time?"',
            },
            {
              ar: 'أرسل له تنبيهاً كتابياً رسمياً عن الالتزام بالمواعيد',
              en: 'Send him a formal written note about punctuality',
            },
            {
              ar: 'اذكر الأمر أمام الفريق في الاجتماع القادم كتذكير عامّ للجميع',
              en: 'Raise the matter before the team at the next meeting as a general reminder to everyone',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الانتظار حتى يكون هناك ضرر يعني الانتظار حتى تصبح المشكلة أصعب حلاً. التنبيه الكتابي الرسمي مناسب لمشكلة متكرّرة أو خطيرة لا لتأخّر بسيط حدث مرّتين — وهو يُوتّر العلاقة قبل وقتها. والإشارة أمام الفريق إحراج علني غير مبرّر ويُفسد جوّ الثقة. اللقاء الفردي يُعطيك معلومة — ربما ثمة صعوبة مواصلات حقيقية يمكن حلّها — ويُعطي المتطوّع فرصة للتغيير دون أن يشعر بالمحاكمة على خطأ بسيط.',
            en: 'Waiting for harm means waiting until the problem is harder to solve. A formal written note is appropriate for a repeated or serious problem, not for minor lateness that happened twice — and it strains the relationship prematurely. Raising it before the team is unjustified public embarrassment and damages a climate of trust. A one-to-one gives you information — there may be a real transport difficulty that can be solved — and gives the volunteer a chance to change without feeling put on trial over a minor slip.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'vl-m4',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'بناء نظام تقدير عادل ومنصف', en: 'Building a Fair and Equitable Recognition System' },
      lede: {
        ar: 'التقدير الذي يُمنح بناءً على من تعرف المنسّقة لا على ما أنجزه المتطوّع يُعطّل حافز كلّ من لا يعرفها.',
        en: 'Recognition granted on the basis of who the coordinator knows rather than what the volunteer achieved kills the motivation of everyone she does not know.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التقدير في بيئة التطوّع مسألة عدالة قبل أن يكون مسألة تحفيز. حين يرى متطوّع زميلاً يُقدَّر باستمرار دون سبب واضح ومعلن، هو لا يشعر بالحسد فحسب — بل يستنتج أن العمل الجيّد لا قيمة حقيقية له هنا، وما يهمّ هو العلاقة الشخصية مع المنسّق. ويسري هذا الاستنتاج بسرعة في الفريق. ينتهي الأمر بأن الأكثر تحمّساً للعمل يتوقّفون عن الاجتهاد الإضافي لأن ثمرته تذهب لمن يحظى بالحظوة بصرف النظر عن جودة أدائه. نظام التقدير المنصف لا يعني تقدير الجميع بالتساوي بصرف النظر عن جودة العمل — يعني أن معايير التقدير واضحة ومُعلنة لكل المتطوّعين ومطبّقة بالاتّساق ذاته على الجميع بغضّ النظر عن قُرب الشخص من المنسّق أو مدّة وجوده في المنظمة.',
            en: 'Recognition in a volunteering environment is a matter of fairness before it is a matter of motivation. When a volunteer repeatedly sees a peer recognised for no clear or announced reason, they do not only feel envious — they conclude that good work has no real value here and what matters is the personal relationship with the coordinator. And this conclusion spreads quickly through the team. The result is that the most dedicated eventually stop exerting extra effort because its fruit goes to the favoured regardless of performance quality. A fair recognition system does not mean recognising everyone equally regardless of work quality — it means recognition criteria are clear, announced to all volunteers and applied with the same consistency to everyone, regardless of closeness to the coordinator or length of time in the organisation.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'التقدير اللحظي', en: 'In-the-moment recognition' },
              text: {
                ar: 'كلمة محدّدة تُقال في الوقت المناسب مباشرةً بعد الفعل: «طريقتك في إدارة ذلك الموقف حين اشتدّ التوتّر كانت ممتازة». فعّالة لأنها ربط مباشر وفوري بين السلوك الجيّد والتقدير.',
                en: 'A specific word said at the right moment immediately after the act: "the way you managed that situation when tension rose was excellent". Effective because it is a direct and immediate link between good behaviour and recognition.',
              },
            },
            {
              title: { ar: 'التقدير الدوري', en: 'Periodic recognition' },
              text: {
                ar: 'مراجعة دورية تُسمّي إنجازات المتطوّعين بالاسم أمام الفريق — ليس «الجميع أبدعوا هذا الشهر» بل «أكمل أحمد الجلسات الخمس كاملةً هذا الشهر وبتقييم وسطي ٤.٣ من ٥».',
                en: 'A periodic review that names volunteers\' achievements in front of the team — not "everyone excelled this month" but "Ahmad completed all five sessions this month with a mean rating of 4.3 out of 5".',
              },
            },
            {
              title: { ar: 'التقدير الرسمي', en: 'Formal recognition' },
              text: {
                ar: 'شهادة خبرة مكتوبة وموقّعة، خطاب تشكّر رسمي، أو فرصة مدفوعة للمشاركة في تدريب متقدّم. قابل للتوثيق ومُفيد للمتطوّع في مسيرته المهنية.',
                en: 'A written signed experience reference, a formal letter of thanks, or a funded opportunity to attend advanced training. Documentable and useful to the volunteer in their professional career.',
              },
            },
          ],
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'حدّد مسبقاً وبوضوح ما الذي يستحقّ التقدير — حضور منتظم، إتمام مهمّة بجودة موثّقة، تدريب متطوّع آخر، تجاوز متطلّبات الدور في موقف محدّد وموثّق',
              'اجعل المعايير مرئية للمتطوّعين أنفسهم منذ البداية حتى يعرفوا على أيّ أساس يُقدَّرون',
              'طبّق المعايير نفسها على الجميع بصرف النظر عن الصداقة أو مدّة الوجود في المنظمة أو شخصية المتطوّع',
              'أتح للفريق أن يُرشّح بعضه بعضاً وفق المعايير المحدّدة مع ذكر سبب محدّد — التقدير الأفقي من الزملاء له وزن مختلف عن التقدير من المشرف',
              'وثّق التقدير الممنوح في ملف المتطوّع حتى لا يُنسى ولا يُنكر ولا يُقلَّل منه لاحقاً حين يُطلب مرجع الخبرة',
            ],
            en: [
              'Define clearly in advance what merits recognition — regular attendance, task completion with documented quality, training another volunteer, exceeding role requirements in a specific documented situation',
              'Make the criteria visible to volunteers themselves from the start so they know the basis on which they are recognised',
              'Apply the same criteria to everyone regardless of friendship, length of time in the organisation or the volunteer\'s personality',
              'Allow the team to nominate each other under the defined criteria with a specific reason given — horizontal recognition from peers carries a different weight from recognition by the supervisor',
              'Document recognition given in the volunteer\'s file so it is not forgotten, denied or later minimised when an experience reference is requested',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'شهادة الخبرة حقّ وليست مكافأة', en: 'An experience reference is a right, not a reward' },
          content: {
            ar: 'المتطوّع الذي أتمّ دوره يستحقّ توثيقاً موضوعياً لما قام به، بغضّ النظر عن طبيعة علاقته بالمنسّق. الشهادة الجيّدة تُسمّي الدور والمدة والمهام الفعلية التي أُنجزت والمهارات التي تطوّرت. لا تكتب «كان رائعاً ومتعاوناً» — اكتب «أدار اثنتي عشرة جلسة دعم أسري بحضور منتظم بلغت نسبته 92% ومتوسّط تقييم 4.2 من 5». الأولى رأي شخصي والثانية حقيقة قابلة للتحقّق.',
            en: 'A volunteer who completes their role deserves objective documentation of what they did, regardless of the nature of their relationship with the coordinator. A good reference names the role, duration, actual tasks completed and skills developed. Do not write "they were wonderful and cooperative" — write "they ran twelve family support sessions with an attendance rate of 92% and a mean rating of 4.2 out of 5". The first is personal opinion; the second is a verifiable fact.',
          },
        },
        {
          type: 'quiz',
          id: 'vl-q4',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'في نهاية الفصل تريد تكريم المتطوّعين المتميّزين. أيّ المقاربات تعتمد؟',
            en: 'At the end of the term you want to recognise outstanding volunteers. Which approach do you use?',
          },
          options: [
            {
              ar: 'تختار من عاينتهم شخصياً وتعرف مجهودهم من تجربتك المباشرة معهم',
              en: 'You choose those you personally observed and whose effort you know from your direct experience with them',
            },
            {
              ar: 'تطلب من كل متطوّع ترشيح زميل مع ذكر سبب محدّد، ثم تُراجع الترشيحات مع المشرفين وفق معايير معلنة مسبقاً لاختيار من يستحقّ',
              en: 'You ask each volunteer to nominate a colleague with a specific reason, then review nominations with supervisors according to pre-announced criteria to select who merits recognition',
            },
            {
              ar: 'تُكرّم من أتمّ أعلى عدد من ساعات التطوّع فقط لأن ذلك موضوعي',
              en: 'You recognise whoever completed the highest number of volunteer hours only, because it is objective',
            },
            {
              ar: 'لا تُكرّم أحداً بالاسم تفادياً للمقارنة وما تُسبّبه من توتّر في الفريق',
              en: 'You recognise nobody by name to avoid comparison and the team tension it causes',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الاختيار الشخصي يُعيد إنتاج الحظوة لمن يكون في نظر المنسّق. الساعات وحدها تُكافئ من يستطيع تخصيص الوقت لا من يُنجز بجودة. وعدم التكريم يُفقد المتطوّعين حافزاً حقيقياً ويُرسل رسالة بأن التميّز لا أثر له. الترشيح من الزملاء مع معايير واضحة يُوزّع المعرفة ويُشرك الفريق كلّه ويُقلّل من التحيّز الواحد ويجعل النتيجة مقبولة لأن مصدرها شفّاف.',
            en: 'Personal selection reproduces favouritism towards whoever is in the coordinator\'s field of view. Hours alone reward those who can spare time, not those who perform with quality. No recognition removes real motivation and sends a message that distinction has no effect. Peer nomination with clear criteria distributes knowledge, involves the whole team, reduces single-source bias and makes the outcome acceptable because its source is transparent.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'vl-m5',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'إنهاء علاقة التطوّع باحترام وتوثيق', en: 'Ending the Volunteering Relationship with Respect and Documentation' },
      lede: {
        ar: 'آخر لقاء مع متطوّع يُشكّل ما يرويه عن منظمتك لمن يعرفهم — وما يروّج له في مجتمعه من متطوّعين محتملين.',
        en: 'The last meeting with a volunteer shapes what they tell the people they know about your organisation — and what they promote among potential volunteers in their community.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'إنهاء العلاقة التطوّعية يمرّ في ثلاثة سياقات مختلفة: المتطوّع الذي ينتهي دوره بشكل طبيعي بعد إتمام المدة المحدّدة، والمتطوّع الذي يقرّر الانسحاب بإرادته لأيّ سبب، والمتطوّع الذي تُنهي المنظمة علاقتها به بسبب انتهاك أو قصور. كل سياق يستدعي تعاملاً مختلفاً في الشكل والمحتوى، لكنها تشترك جميعاً في مبدأ واحد لا يُساوَم عليه: المتطوّع يستحقّ أن يعرف ما يحدث ولماذا، بصيغة مباشرة وإنسانية، وأن يخرج بشعور يليق بما قدّمه. منظمات كثيرة تُحسن استقبال المتطوّع وتُسيء توديعه — توديع بالتجاهل أو بالبريد الإلكتروني المقتضب أو بالاختفاء التدريجي — والتوديع السيّئ يهدم كل الحسن الذي بُني طوال العلاقة.',
            en: 'Ending a volunteering relationship occurs in three different contexts: the volunteer whose role ends naturally after completing the agreed period, the volunteer who decides to withdraw of their own will for any reason, and the volunteer whose relationship the organisation ends because of a violation or shortfall. Each context calls for different handling in form and content, but they all share one non-negotiable principle: the volunteer deserves to know what is happening and why, directly and humanely, and to leave with a feeling befitting what they gave. Many organisations receive a volunteer well and see them off badly — a farewell through neglect, a brief email or gradual disappearance — and a bad farewell undoes all the good built throughout the relationship.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'انتهاء المدة المحدّدة في اتفاقية التطوّع — نهاية طبيعية لا تحتاج تبريراً خاصاً بل احتفاءً يناسب ما قُدِّم',
              'انتهاء المشروع أو البرنامج الذي كان المتطوّع جزءاً منه وانتفت الحاجة إلى دوره',
              'قرار المتطوّع الشخصي بالانسحاب لأيّ سبب كان — حقّه غير مشروط ولا يُناقَش إن لم يكن يُريد تفسيراً',
              'انتهاك موثّق لسياسات المنظمة أو لميثاق السلوك بعد إجراء رسمي شمل التوثيق والإنذار',
              'عجز موثّق عن أداء الدور بعد تقديم دعم كافٍ وإعطاء فترة تحسّن معقولة وواضحة المعايير',
              'تصرّف يُضرّ بالفئة المستفيدة أو بالمتطوّعين الآخرين أو بسمعة المنظمة وجدّية عملها',
            ],
            en: [
              'The end of the period set in the volunteering agreement — a natural ending that needs no special justification but a celebration befitting what was given',
              'The end of the project or programme of which the volunteer was part and whose need for their role has now gone',
              'The volunteer\'s personal decision to withdraw for any reason — an unconditional right that need not be discussed if they do not want to explain it',
              'A documented violation of organisational policies or the code of conduct after a formal process including documentation and a warning',
              'Documented inability to perform the role after adequate support and a clear improvement period with explicit criteria',
              'An action that harms the people served, other volunteers, or the reputation and seriousness of the organisation',
            ],
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'أجرِ محادثة مباشرة — لا رسالة نصّية، ولا بريد إلكتروني قصير، ولا إخبار عبر وسيط حتى لو كان الإنهاء مؤلماً للطرفين',
              'قُل بوضوح ما الذي يحدث ولماذا، في لغة لا تُلمّح ولا تتهرّب من الواقع خوفاً من الحرج',
              'أعطِ المتطوّع فرصة حقيقية للردّ والتعبير — المحادثة ليست إخطاراً واحد الاتجاه بل حوار ثنائي',
              'وضّح ما يحدث بعد ذلك عملياً: من يتسلّم مهامه، ومتى يكون آخر يوم فعلي، وما الإجراءات الإدارية',
              'اسأله عن تجربته الكاملة وما الذي يريد أن تعرفه المنظمة لتتحسّن — الاستماع في هذه اللحظة ليس للديكور',
              'سلّمه شهادة خبرة موضوعية في أقرب وقت ممكن — لا تُؤجّلها وكأنها أداة ضغط أو عقاب مُبطَّن',
              'وثّق المحادثة في ملفّه — التاريخ والسبب المذكور وما اتُّفق عليه من إجراءات تسليم',
            ],
            en: [
              'Hold a direct conversation — no text message, no brief email, no telling through a third party even if the ending is painful for both sides',
              'State clearly what is happening and why, in language that does not hint or shy away from reality out of fear of awkwardness',
              'Give the volunteer a genuine opportunity to respond and express themselves — the conversation is a two-way dialogue not a one-directional notification',
              'Clarify what happens next practically: who takes over their tasks, when their actual last day is and what the administrative steps are',
              'Ask about their full experience and what they want the organisation to know in order to improve — listening at this moment is not decorative',
              'Deliver an objective experience reference as soon as possible — do not delay it as if it were a pressure tool or veiled punishment',
              'Document the conversation in their file — the date, the stated reason and what was agreed regarding handover',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'إنهاء بلا توثيق سابق يُعرّض المنظمة للطعن', en: 'An ending without prior documentation exposes the organisation to challenge' },
          content: {
            ar: 'حين تُنهي المنظمة علاقة تطوّعية بسبب انتهاك أو قصور في الأداء دون توثيق سابق للتحذيرات والدعم المقدَّم وفترة التحسّن، يصبح القرار عرضة للطعن وللروايات المتضاربة. المتطوّع الذي يتحدّث لاحقاً عن إنهاء تعسّفي قد يُصدَّق في مجتمعه إن لم يكن هناك سجلّ موضوعي وسلسلة إجراءات موثّقة. التوثيق ليس سلاحاً ضدّ المتطوّع — إنه حماية موضوعية للطرفين ويُثبت أن المنظمة تصرّفت بإنصاف.',
            en: 'When an organisation ends a volunteering relationship because of a violation or performance shortfall without prior documentation of warnings, support given and the improvement period, the decision becomes open to challenge and conflicting accounts. A volunteer who later speaks of arbitrary dismissal may be believed in their community if there is no objective record and documented sequence of steps. Documentation is not a weapon against the volunteer — it is objective protection for both parties and proves the organisation acted fairly.',
          },
        },
        {
          type: 'quiz',
          id: 'vl-q5',
          label: { ar: 'سيناريو الإنهاء', en: 'Exit scenario' },
          question: {
            ar: 'متطوّع أخلّ بسرية بيانات أسرة مستفيدة بطريقة غير مقصودة لكنها موثّقة وأحدثت ضرراً ملموساً. هذه المرّة الأولى ولا يوجد سجلّ سابق. ما الإجراء المناسب؟',
            en: 'A volunteer breached the confidentiality of a beneficiary family\'s data unintentionally but in a documented way that caused tangible harm. This is the first time and there is no prior record. What is the appropriate action?',
          },
          options: [
            {
              ar: 'تُنهي علاقته فوراً لأن السرية خطّ أحمر لا استثناء له',
              en: 'End his relationship immediately because confidentiality is a red line with no exceptions',
            },
            {
              ar: 'تتجاوز الأمر بهدوء لأنه غير مقصود ولا داعي لرفع التوتّر',
              en: 'Quietly overlook it because it was unintentional and there is no need to raise tension',
            },
            {
              ar: 'تُجري محادثة فردية موثّقة تُوضّح فيها ما جرى وأثره والتوقّعات المستقبلية، وتُخضعه لإشراف أوثق في مناطق السرية، وتُوثّق الإنذار في ملفّه',
              en: 'Hold a documented one-to-one clarifying what happened, its effect and future expectations, increase supervision in confidentiality areas, and document the warning in his file',
            },
            {
              ar: 'تُخبر بقيّة الفريق حتى يكونوا على حذر معه في التعامل',
              en: 'Tell the rest of the team so they are careful in dealing with him',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الإنهاء الفوري لأول خطأ غير مقصود يتجاوز مبدأ التناسب ويُضيّع فرصة تعلّم حقيقية. التجاوز الصامت يُرسل رسالة بأن السرية تُذكر لكنها لا تُطبَّق جدياً وقد يتكرّر الخطأ. إخبار الفريق تعدٍّ على خصوصيته ويخلق جواً من انعدام الثقة. الإجراء المتوازن يُواجه الخطأ بوضوح دون مبالغة، يُوثّقه ليكون له وجود رسمي، ويُعطي الفرصة للتصحيح — وإن تكرّر لاحقاً يكون أي إنهاء مبرّراً وموثّقاً ومفهوماً للجميع.',
            en: 'Immediate termination for a first unintentional mistake violates proportionality and wastes a genuine learning opportunity. Silent overlooking sends a message that confidentiality is mentioned but not seriously enforced and the mistake may recur. Telling the team is a breach of his privacy and creates an atmosphere of distrust. The balanced response confronts the mistake clearly without excess, documents it so it has formal existence, and gives the chance for correction — and if it recurs, any termination will be justified, documented and understandable to all.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 6
    {
      id: 'vl-m6',
      tag: { ar: 'الوحدة السادسة', en: 'Module 6' },
      title: { ar: 'التوثيق وذاكرة المنظمة', en: 'Documentation and Organisational Memory' },
      lede: {
        ar: 'منظمة لا تُوثّق تبدأ من الصفر مع كل منسّق جديد وكل متطوّع جديد، وتدفع ثمن النسيان مراراً ومن مصادر مختلفة.',
        en: 'An organisation that does not document starts from zero with every new coordinator and every new volunteer, and pays the price of forgetting repeatedly and from different sources.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التوثيق في إدارة المتطوّعين ليس بيروقراطية إضافية — إنه ذاكرة المنظمة. حين تنتقل المنسّقة إلى مؤسّسة أخرى أو تنتهي مدّة عملها، ما الذي يبقى؟ إن كانت المعلومات في ذاكرتها وحدها، فالإجابة هي: لا شيء. كل متطوّع جديد يبدأ من الصفر لأن لا أحد يعرف ما جرى تجربته من قبل أو ما نجح وما فشل. وكل مشرف جديد يُعيد اكتشاف ما اكتشفه سابقوه بالتجربة والخطأ. التوثيق الجيّد يعني أن المنظمة نفسها تتعلّم وتتراكم لديها حكمة مؤسّسية، لا أن الأفراد فيها يتعلّمون ثم يرحلون حاملين معهم كل ما اكتسبوه من فهم. وهذا الفرق هو ما يُميّز منظمة تتحسّن مع الوقت من منظمة تعيش تجربة الأسبوع الأول كل مرّة تتغيّر فيها قيادتها.',
            en: 'Documentation in volunteer management is not additional bureaucracy — it is the organisation\'s memory. When the coordinator moves to another institution or their time ends, what remains? If the information is only in their memory, the answer is: nothing. Every new volunteer starts from zero because nobody knows what was tried before or what succeeded and what failed. Every new supervisor rediscovers what their predecessors discovered through trial and error. Good documentation means the organisation itself learns and accumulates institutional wisdom, not that individuals within it learn and then leave taking all their understanding with them. And this difference is what distinguishes an organisation that improves over time from one that experiences the first week again every time its leadership changes.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'ملف المتطوّع: وصف الدور الذي وافق عليه، تواريخ الانضمام والإنهاء الفعلية، التدريب الذي تلقّاه بالتفصيل، ملاحظات المراجعات الدورية',
              'الحوادث والإنذارات إن وُجدت: ما جرى بالتفصيل، التاريخ الدقيق، الإجراء المتّخذ، توقيع الطرفين واطّلاعهما',
              'شهادات الخبرة الصادرة وتاريخها ونسختها الكاملة في ملف المنظمة',
              'نتائج مقابلة التوديع: لماذا أنهى المتطوّع دوره، ما الذي أعجبه في التجربة، ما الذي أعاق عمله ولم يُذكر من قبل',
              'عدد ساعات التطوّع الفعلية موزّعة على أنواع الأنشطة للرجوع إليها في التخطيط المستقبلي',
              'ملاحظات لمن يتولّى هذا الدور بعد ذلك: ما الذي يُسهّل العمل فيه وما الذي يُصعّبه وما الدعم الذي يحتاجه هذا الدور تحديداً',
            ],
            en: [
              'The volunteer\'s file: the role description they agreed to, actual joining and exit dates, training received in detail, notes from periodic reviews',
              'Incidents and warnings if any: what happened in detail, the exact date, action taken, both parties\' signatures and acknowledgement',
              'Experience references issued, their dates and the full copy kept in the organisation\'s file',
              'Exit interview findings: why the volunteer ended their role, what they valued about the experience, what hindered their work and was never previously mentioned',
              'Actual volunteer hours broken down by type of activity for reference in future planning',
              'Notes for whoever takes on this role next: what makes the work easier and harder, and what specific support this particular role needs',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'مقابلة التوديع: أرخص مصدر للمعرفة المؤسّسية', en: 'The exit interview: the cheapest source of institutional knowledge' },
          content: {
            ar: 'المتطوّع الذي يغادر يرى المنظمة بعيون لن تراها مرّة أخرى بنفس الحدّة والجدّة. مقابلة توديع قصيرة — عشرون دقيقة بأسئلة مفتوحة — تُعطيك معلومات لا تحصل عليها من أي مصدر آخر: أين كانت الفجوة الفعلية بين وصف الدور والواقع اليومي، ما الذي كان يُعيق الأداء ولم يُذكر طوال فترة التطوّع، وما الذي جعل التجربة ذات قيمة وكان يمكن تعميمه. هذه الأسئلة تُسأل ليُستخدم جوابها في تحسين التجربة القادمة، لا لمجرّد الإيحاء بالاهتمام.',
            en: 'The volunteer who leaves sees the organisation with eyes that will not see it again with the same sharpness and freshness. A short exit interview — twenty minutes with open questions — gives you information available from no other source: where the actual gap between the role description and daily reality was, what was hindering performance and was never mentioned throughout the volunteering period, and what gave the experience its value and could have been extended. These questions are asked so that the answers are used to improve the next experience — not merely to give the impression of caring.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'المنظمات التي تُغلق دورة حياة المتطوّع بمراجعة حقيقية تراكم معرفة يصعب شراؤها بأيّ وسيلة أخرى. كل متطوّع يمرّ يُضيف معطىً إلى الفهم المؤسّسي: هذا الدور يستقطب بشكل غير متناسب أشخاصاً بدون خبرة ميدانية في الفئة المستهدفة فيجب مراجعة وصفه، هذا التدريب كان نظرياً أكثر ممّا يحتاجه الواقع، هذا الشهر يشهد استنزافاً أعلى للمتطوّعين بسبب ضغط الامتحانات أو الموسم. المنظمة التي تسمع وتُوثّق وتُعدّل تُحسّن مع كل جيل من المتطوّعين. والتي لا تفعل تُعيد الأخطاء ذاتها مع وجوه جديدة كل موسم، دون أن تعرف أنها كانت أخطاءً. ولهذا تُعدّ مراجعة دورة حياة المتطوّع الاستثمار الأقل كلفةً والأعلى عائداً في منظومة العمل التطوّعي.',
            en: 'Organisations that close the volunteer lifecycle with a genuine review accumulate knowledge that is difficult to buy by any other means. Every volunteer who passes through adds a data point to institutional understanding: this role disproportionately attracts people without field experience with the target group and its description needs reviewing, this training was more theoretical than the real situation requires, this month sees higher volunteer burnout because of exam pressure or the season. An organisation that listens, documents and adjusts improves with every generation of volunteers. One that does not repeats the same mistakes with new faces every season — without knowing they were mistakes. For this reason, reviewing the volunteer lifecycle is the lowest-cost, highest-return investment in a volunteering management system.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'مراجعة دورة حياة المتطوّع عند الانتهاء ليست إجراءً شكلياً — بل أداة تعلّم مؤسّسية تُحدّد ما نجح وما يحتاج تحسيناً لتُطوَّر قدرة المنظّمة على استقطاب المتطوّعين وإشراكهم والاحتفاظ بهم. كل متطوّع يُغادر يُتيح فرصة فهم أعمق للبرنامج — شريطة أن تُستثمَر هذه الفرصة بمقابلة توديع منظّمة وتوثيق فوري للملاحظات.\n\nالأنماط التي تكشفها مراجعات دورة الحياة بمرور الوقت تُعطي المنظّمة مؤشّرات قيمة: هل يُغادر المتطوّعون في فترات معيّنة من السنة بشكل غير متناسب؟ هل المتطوّعون في أدوار بعينها أقل استمراراً من غيرهم؟ هل هناك نمط في أسباب المغادرة يُشير إلى مشكلة في التصميم لا في الأفراد؟ هذه الأسئلة لا تُجاب إلا بتوثيق ممنهج على مدى دورات متعدّدة.',
            en: 'Reviewing the volunteer lifecycle at the end is not a formal procedure — but an institutional learning tool that identifies what worked and what needs improvement, to develop the organisation\'s capacity to attract, engage, and retain volunteers. Every departing volunteer offers a deeper understanding opportunity for the programme — provided this opportunity is invested in an organised exit interview and immediate documentation of observations.',
          },
        },
        {
          type: 'quiz',
          id: 'vl-q6',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'انتهى دور متطوّعة بعد ستة أشهر ناجحة وانتهت اتفاقيتها. أيّ الإجراءات لا يجوز تأجيله؟',
            en: 'A volunteer\'s role ends after six successful months and her agreement has concluded. Which procedure must not be delayed?',
          },
          options: [
            {
              ar: 'إرسال رسالة شكر بالبريد الإلكتروني',
              en: 'Sending a thank-you message by email',
            },
            {
              ar: 'تسليمها شهادة خبرة موضوعية وإجراء مقابلة توديع وإغلاق ملفّها بالتوثيق الكامل',
              en: 'Delivering an objective experience reference, conducting an exit interview and closing her file with full documentation',
            },
            {
              ar: 'الإعلان عن نجاح البرنامج على وسائل التواصل الاجتماعي',
              en: 'Announcing the success of the programme on social media',
            },
            {
              ar: 'استقطاب متطوّعة بديلة في أقرب وقت',
              en: 'Recruiting a replacement volunteer as soon as possible',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'رسالة الشكر لطيفة لكنها لا تُغني عن التوثيق ولا عن حقوق المتطوّعة. الإعلان على التواصل الاجتماعي قد يكون لاحقاً وله وقته. والاستقطاب الفوري ضروري لاستمرارية البرنامج لكن ليس له صلة بإغلاق ملف المتطوّعة المنتهية. ما لا يُؤجَّل هو الشهادة لأنها تُفيد المتطوّعة فوراً في مسيرتها، ومقابلة التوديع لأن التفاصيل تتلاشى مع الوقت، والتوثيق لأن كل يوم تأجير يُضعف دقّة السجلّ ويُرسّخ فجوات في ذاكرة المنظمة.',
            en: 'A thank-you message is kind but does not substitute for documentation or the volunteer\'s rights. A social media announcement may come later and has its own time. Immediate recruitment is necessary for programme continuity but has no connection to closing the outgoing volunteer\'s file. What cannot be delayed is the reference because it benefits the volunteer immediately in her career, the exit interview because details fade with time, and documentation because every day of delay weakens the accuracy of the record and entrenches gaps in the organisation\'s memory.',
          },
        },
      ],
    },
  ],
};
