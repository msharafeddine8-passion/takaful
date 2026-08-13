import type { CourseContent } from './types';

export const professionalIdentity: CourseContent = {
  slug: 'professional-identity',
  level: 0,
  minutes: 30,
  passMark: 70,
  title: {
    ar: 'الهوية المهنية وبناء ملف المتطوّع',
    en: 'Professional Identity and Your Volunteer Profile',
  },
  lede: {
    ar: 'التطوّع ليس مجرّد وقت فراغ تقدّمه — بل هوية مهنية تُبنى بمهارات وقيم وأسلوب عمل. هذه الدورة تُساعدك على تعريف نفسك متطوّعاً محترفاً وتقديم هذه الهوية بثقة.',
    en: 'Volunteering is not simply free time you offer — it is a professional identity built with skills, values, and a work style. This course helps you define yourself as a professional volunteer and present this identity with confidence.',
  },
  outcomes: {
    ar: [
      'تُعرِّف هويتك المهنية كمتطوّع بمهاراتك وقيمك وأسلوبك',
      'تُقدّم تجربتك التطوّعية في السيرة الذاتية وفي المقابلات الوظيفية',
      'تُحدّد نقاط قوّتك الفريدة كمتطوّع في سياق مهني',
      'تضع خطّة لتطوير هويتك المهنية التطوّعية على المدى البعيد',
    ],
    en: [
      'Define your professional identity as a volunteer with your skills, values, and style',
      'Present your volunteer experience in your CV and job interviews',
      'Identify your unique strengths as a volunteer in a professional context',
      'Set a plan for developing your volunteer professional identity in the long term',
    ],
  },
  sources: [
    'Points of Light Institute — Volunteer Recognition and Professional Development Framework',
    'UNV — State of the World\'s Volunteerism Report: Building Equitable and Inclusive Societies',
    'IAVE — World Volunteer Profile: Professional Skills and Development',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'pi-identity',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'ما الهوية المهنية وكيف تُبنى', en: 'What professional identity is and how it is built' },
      lede: {
        ar: 'هويتك المهنية ليست ما تكتبه في السيرة الذاتية — بل ما يصفك به الناس حين لا تكون في الغرفة.',
        en: 'Your professional identity is not what you write in your CV — it is what people say about you when you are not in the room.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الهوية المهنية للمتطوّع تتشكّل من ثلاثة عناصر: المهارات التي يُتقنها (الفنية والشخصية)، والقيم التي تُوجّه قراراته، وأسلوبه في التعامل مع الآخرين والمهام. كثير من المتطوّعين يُطوّرون هذه العناصر دون أن يُسمّوها أو يُوظّفوها بوعي — وهذا يُفوّت عليهم فرصاً حقيقية سواء في استمرار التطوّع أو في سوق العمل.\n\nالمتطوّع الذي يقول "أنا بس بساعد" يُقدّم صورة ناقصة عن نفسه. المتطوّع الذي يقول "أنا أُدير علاقات المتطوّعين وأبني برامج توجيه لمتطوّعين جدد" يُقدّم هوية مهنية كاملة. الفرق في الوعي والصياغة لا في العمل الفعلي.',
            en: 'A volunteer\'s professional identity is shaped by three elements: the skills they master (technical and interpersonal), the values guiding their decisions, and their style in dealing with others and tasks. Many volunteers develop these elements without naming them or deploying them consciously — and this costs them real opportunities, whether in continuing to volunteer or in the job market.\n\nThe volunteer who says "I just help out" presents an incomplete picture. The volunteer who says "I manage volunteer relations and build orientation programmes for new volunteers" presents a full professional identity. The difference is in awareness and framing, not in the actual work.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'المهارات', en: 'Skills' },
              text: { ar: 'ما تُجيد فعله: التخطيط، التنسيق، التدريب، التواصل، حل المشكلات', en: 'What you do well: planning, coordination, training, communication, problem-solving' },
            },
            {
              title: { ar: 'القيم', en: 'Values' },
              text: { ar: 'ما يُوجّه قراراتك: العدالة، الخدمة، الشفافية، الاحترام، الاستدامة', en: 'What guides your decisions: justice, service, transparency, respect, sustainability' },
            },
            {
              title: { ar: 'الأسلوب', en: 'Style' },
              text: { ar: 'كيف تعمل: هادئ تحت الضغط، مُبادر، تعاوني، منظّم، إبداعي', en: 'How you work: calm under pressure, proactive, collaborative, organised, creative' },
            },
            {
              title: { ar: 'الأثر', en: 'Impact' },
              text: { ar: 'ما الذي تغيّر بسببك: أرقام ومستفيدون وقرارات أُثّر فيها', en: 'What changed because of you: numbers, beneficiaries, decisions influenced' },
            },
          ],
        },
        {
          type: 'quiz',
          id: 'pi-q1',
          label: { ar: 'سؤال ١', en: 'Question 1' },
          question: {
            ar: 'صاحب عمل يسألك: "ماذا تعلّمت من التطوّع؟" أيّ إجابة تُقدّم هويتك المهنية بشكل أفضل؟',
            en: 'An employer asks you: "What did you learn from volunteering?" Which answer best presents your professional identity?',
          },
          options: [
            { ar: '"تعلّمت إدارة الوقت تحت الضغط حين نظّمت ثلاث دورات تدريبية بشكل متزامن لثمانين متطوّعاً"', en: '"I learned time management under pressure when I simultaneously organised three training sessions for eighty volunteers"' },
            { ar: '"تعلّمت كثيراً عن أنفسنا وكيف نُساعد الناس"', en: '"I learned a lot about ourselves and how to help people"' },
            { ar: '"تعلّمت أن العمل التطوّعي يختلف كثيراً عن العمل المدفوع"', en: '"I learned that volunteer work differs greatly from paid work"' },
          ],
          correct: 0,
          feedback: {
            ar: 'الإجابة المحدّدة بمهارة + سياق + أثر (إدارة الوقت + ثلاث دورات + ثمانون متطوّعاً) تُقدّم هوية مهنية ملموسة. الإجابات العامّة تُظهر تجربة، لا كفاءة محدّدة.',
            en: 'The specific answer with skill + context + impact (time management + three sessions + eighty volunteers) presents a tangible professional identity. General answers show experience, not a specific competency.',
          },
        },
        {
          type: 'quiz',
          id: 'pi-q2',
          label: { ar: 'سؤال ٢', en: 'Question 2' },
          question: {
            ar: 'تُعدّ سيرتك الذاتية وتريد تضمين تجربتك التطوّعية. أيّ الصياغات أكثر فاعلية؟',
            en: 'You are preparing your CV and want to include your volunteer experience. Which phrasing is most effective?',
          },
          options: [
            { ar: '"منسّق تطوّع — الجمعية X: صمّمت برنامج توجيه أقصر تدريب الجدد من أسبوعين إلى خمسة أيام مع الحفاظ على مستوى الجودة"', en: '"Volunteer Coordinator — Organisation X: Designed an orientation programme that shortened new volunteers\' training from two weeks to five days while maintaining quality levels"' },
            { ar: '"متطوّع في الجمعية X لمدة سنتين، شاركت في أنشطة متعدّدة"', en: '"Volunteer at Organisation X for two years, participated in various activities"' },
            { ar: '"خدمة مجتمعية في الجمعية X"', en: '"Community service at Organisation X"' },
          ],
          correct: 0,
          feedback: {
            ar: 'الصياغة الأولى: لقب + جمعية + إنجاز محدّد قابل للقياس. هذا ما يبحث عنه أصحاب العمل. الصياغات العامّة تُدرج في الذاكرة وتُنسى بسرعة.',
            en: 'First phrasing: title + organisation + specific measurable achievement. This is what employers look for. General phrasings are filed in memory and quickly forgotten.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'pi-strengths',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'نقاط القوّة الفريدة للمتطوّع المحترف', en: 'The professional volunteer\'s unique strengths' },
      lede: {
        ar: 'المتطوّع يعمل بلا ضغط راتب — وهذا يُطوّر نوعاً من الدافعية والمرونة يندر في بيئات العمل التقليدية.',
        en: 'The volunteer works without salary pressure — and this develops a type of motivation and flexibility rare in traditional work environments.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'للمتطوّع المحترف ميزة تنافسية حقيقية في سوق العمل: الدافعية الداخلية. حين يختار شخص العمل دون راتب في بيئة غالباً ما تكون غير مستقرة، يُطوّر مهارات تتجاوز التخصّص — القدرة على تحديد الأولوية دون تعليمات، والعمل بشكل جماعي دون إطار هرمي صارم، والتكيّف السريع مع ظروف متغيّرة.\n\nهذه المهارات لا تُعلَّم في الفصول الدراسية — تُكتسب من الميدان. والمتطوّع الذي يُدرك قيمتها يُقدّم نفسه بثقة لا بتواضع مُقلِّل.',
            en: 'The professional volunteer has a genuine competitive advantage in the job market: internal motivation. When a person chooses to work without salary in an environment that is often unstable, they develop skills beyond their specialisation — the ability to prioritise without instructions, work collectively without a rigid hierarchy, and quickly adapt to changing circumstances.\n\nThese skills are not taught in classrooms — they are acquired from the field. And the volunteer who understands their value presents themselves with confidence, not diminishing modesty.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'تحويل التجربة التطوّعية إلى إجابات مقابلة وظيفية مقنعة يتطلّب إطاراً محدّداً. الأوسع استخداماً هو إطار STAR: الموقف، المهمّة، الإجراء، والنتيجة — وهو ما تبحث عنه معظم أسئلة الكفاءة السلوكية تحديداً. كل تجربة تطوّعية محدّدة يمكن تحويلها إلى هذا الإطار، مهما بدت بسيطة في ظاهرها.\n\nالخطأ الشائع هو تقديم قيم عامّة ("أحبّ المساعدة") بدلاً من أدلّة محدّدة. المحاور يُصدّق الأدلّة لا الوعود: "في مشروع إغاثة مدّته شهرين، نسّقت بين أربعة فرق ميدانية، وحللت نزاعاً حول توزيع الموارد باجتماع هيكلي أسفر عن بروتوكول موزَّع ما زال الفريق يستخدمه" — هذا المستوى من التحديد هو ما يُميّز المرشّح في المقابلة.',
            en: 'Converting volunteer experience into convincing job interview answers requires a specific framework. The most widely used is the STAR framework: Situation, Task, Action, and Result — which is exactly what most behavioural competency questions seek. Any specific volunteer experience can be converted to this framework, however simple it may appear on the surface.\n\nThe common error is presenting general values ("I love helping") instead of specific evidence. Interviewers believe evidence, not promises: "In a two-month relief project, I coordinated between four field teams and resolved a resource allocation dispute through a structured meeting that produced a protocol the team is still using" — that level of specificity is what distinguishes a candidate in an interview.',
          },
        },
        {
          type: 'quiz',
          id: 'pi-q3',
          label: { ar: 'سؤال ٣', en: 'Question 3' },
          question: {
            ar: 'زميل في الفريق يقول: "العمل التطوّعي ما له قيمة حقيقية في سوق العمل". كيف تردّ؟',
            en: 'A team colleague says: "Volunteer work has no real value in the job market." How do you respond?',
          },
          options: [
            { ar: 'التطوّع يُطوّر مهارات قابلة للقياس والنقل — إدارة مشاريع، تنسيق فرق، تواصل متعدّد الثقافات — وتجربة حقيقية في بيئة عمل غير مضمونة الموارد', en: 'Volunteering develops measurable and transferable skills — project management, team coordination, cross-cultural communication — and real experience in a resource-uncertain work environment' },
            { ar: 'التطوّع قيمة إنسانية وليس للتوظيف أصلاً', en: 'Volunteering is a human value and not intended for employment' },
            { ar: 'يعتمد على نوع التطوّع ومستواه', en: 'It depends on the type and level of volunteering' },
          ],
          correct: 0,
          feedback: {
            ar: 'الردّ الأول يُقدّم التطوّع بلغة سوق العمل: مهارات قابلة للقياس والنقل. الردّ الثاني صحيح لكنه يتخلّى عن الحجّة المهنية. الثالث تهرّب.',
            en: 'The first response presents volunteering in job market language: measurable and transferable skills. The second is correct but abandons the professional argument. The third evades.',
          },
        },
        {
          type: 'quiz',
          id: 'pi-q4',
          label: { ar: 'سؤال ٤', en: 'Question 4' },
          question: {
            ar: 'خلال مقابلة عمل، طُلب منك وصف موقف أدرت فيه صراعاً. لديك مثال من عملك التطوّعي فقط. هل تذكره؟',
            en: 'During a job interview, you are asked to describe a situation where you managed a conflict. You only have an example from your volunteer work. Do you mention it?',
          },
          options: [
            { ar: 'نعم — التجارب التطوّعية صالحة تماماً للإجابة على أسئلة الكفاءة السلوكية، خاصّة إن كانت مُحدّدة ولها أثر قابل للوصف', en: 'Yes — volunteer experiences are fully valid for answering behavioural competency questions, especially if they are specific and have a describable impact' },
            { ar: 'لا — المقابلة تتوقّع تجارب مهنية مدفوعة', en: 'No — the interview expects paid professional experiences' },
            { ar: 'نعم لكن أذكر أنه تطوّعي لتجنّب سوء الفهم', en: 'Yes but I mention it is voluntary to avoid misunderstanding' },
          ],
          correct: 0,
          feedback: {
            ar: 'التجربة التطوّعية المحدّدة والقابلة للوصف هي دليل كفاءة — مثلها مثل أي تجربة مهنية. الإطار المناسب للتقديم هو إطار STAR: الموقف، المهمّة، الإجراء، النتيجة.',
            en: 'A specific, describable volunteer experience is a competency proof — just like any professional experience. The appropriate presentation framework is STAR: Situation, Task, Action, Result.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'pi-plan',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'بناء خطّة لتطوير هويتك المهنية', en: 'Building a plan for your professional identity development' },
      lede: {
        ar: 'الهوية المهنية لا تُبنى بالصدفة — بل بقرارات مقصودة حول ما تتعلّمه وما تُسهم فيه وكيف تُقدّم نفسك.',
        en: 'Professional identity is not built by accident — but through deliberate decisions about what you learn, what you contribute, and how you present yourself.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'تطوير الهوية المهنية كمتطوّع لا يحدث بالانتظار — بل بثلاثة قرارات مقصودة:\n\n**ما تتعلّمه:** اختر تجارب تطوّعية تُكسبك مهارات تريد بناءها، لا فقط ما هو متاح. إن أردت بناء مهارة الإدارة المالية، تطوّع في دور يُتيحها.\n\n**ما تُسهم فيه:** الأثر الموثَّق أهمّ من الساعات. خمسون ساعة على مشروع أثّر في مئتَي مستفيد أقوى من مئة ساعة بلا نتيجة موثَّقة.\n\n**كيف تُقدّم نفسك:** الشبكة المهنية، اللينكد إن، مجتمعات المتطوّعين — هذه منصّات لبناء هويتك، لا فقط للبحث عن فرص.',
            en: 'Developing a professional identity as a volunteer does not happen by waiting — but through three deliberate decisions:\n\n**What you learn:** Choose volunteer experiences that build skills you want to develop, not just what is available. If you want to build financial management skills, volunteer in a role that allows it.\n\n**What you contribute:** Documented impact is more important than hours. Fifty hours on a project that affected two hundred beneficiaries is stronger than a hundred hours with no documented outcome.\n\n**How you present yourself:** Professional network, LinkedIn, volunteer communities — these are platforms for building your identity, not just for seeking opportunities.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'توثيق الإنجازات بشكل احترافي يعني تحويل التجربة الميدانية إلى سجل قابل للاستشهاد به. أفضل طريقة هي بناء ملفّ إنجازات حيّ يُحدَّث خلال التجربة لا بعدها — لأن التفاصيل تتلاشى بالوقت، والمشرف المباشر قد يغادر المؤسّسة.\n\nلكل إنجاز: سجّل السياق (ما كان الوضع قبلك)، والدور المحدّد الذي أدّيته، والنتيجة بأرقام أو مؤشّرات قابلة للقياس. احصل على توصية مكتوبة من مشرفك أثناء المشروع لا بعد إنهائه. الملفّ المبني هكذا يُصبح أداة مزدوجة: مرجع شخصي للتطوير الذاتي، وورقة قوّة في أي تقديم وظيفي أو تطوّعي مستقبلي.',
            en: 'Documenting achievements professionally means converting field experience into a citable record. The best method is building a living achievement portfolio updated during the experience, not after it — because details fade with time and the direct supervisor may leave the organisation.\n\nFor each achievement: record the context (what the situation was before you), the specific role you played, and the outcome in measurable numbers or indicators. Obtain a written recommendation from your supervisor during the project, not after it ends. A portfolio built this way becomes a dual tool: a personal self-development reference, and a strong asset in any future job or volunteer application.',
          },
        },
        {
          type: 'quiz',
          id: 'pi-q5',
          label: { ar: 'سؤال ٥', en: 'Question 5' },
          question: {
            ar: 'تريد تطوير مهارة الميزانية والإدارة المالية عبر التطوّع. أيّ الفرص تختار؟',
            en: 'You want to develop budgeting and financial management skills through volunteering. Which opportunity do you choose?',
          },
          options: [
            { ar: 'منسّق شراكات في جمعية صغيرة يُدير ميزانية صغيرة بنفسه وله صلاحية توقيع', en: 'Partnerships coordinator at a small organisation who manages a small budget himself and has signing authority' },
            { ar: 'متطوّع ميداني في برنامج توزيع كبير', en: 'Field volunteer in a large distribution programme' },
            { ar: 'عضو في لجنة بدون حقيبة عمل محدّدة', en: 'Member of a committee without a specific work portfolio' },
          ],
          correct: 0,
          feedback: {
            ar: 'المهارات تُكتسب بالممارسة الحقيقية لا بالحضور. منسّق شراكات يُدير ميزانية فعلياً يُعطي خبرة مالية ملموسة — مختلفة جذرياً عن الحضور في لجنة أو العمل الميداني غير المالي.',
            en: 'Skills are acquired through real practice, not attendance. A partnerships coordinator who actually manages a budget gains tangible financial experience — fundamentally different from attending a committee or non-financial field work.',
          },
        },
        {
          type: 'quiz',
          id: 'pi-q6',
          label: { ar: 'سؤال ٦', en: 'Question 6' },
          question: {
            ar: 'أنهيت مشروعاً تطوّعياً ناجحاً. ما أفضل طريقة للاستفادة منه في بناء هويتك المهنية؟',
            en: 'You completed a successful volunteer project. What is the best way to leverage it in building your professional identity?',
          },
          options: [
            { ar: 'وثّق الأثر بأرقام محدّدة، احصل على توصية مكتوبة من المشرف، وأضفه لسيرتك الذاتية بلغة الإنجاز', en: 'Document the impact with specific numbers, obtain a written recommendation from your supervisor, and add it to your CV with achievement language' },
            { ar: 'شارك خبرك مع المتطوّعين الجدد شفهياً', en: 'Share your experience with new volunteers verbally' },
            { ar: 'اذكره في المقابلات القادمة حين يُسأل عنك', en: 'Mention it in future interviews when asked about yourself' },
          ],
          correct: 0,
          feedback: {
            ar: 'التوثيق المباشر بعد المشروع هو الأذكى — الأرقام طازجة والمشرف لا يزال في السياق. الاعتماد على الذاكرة أو المقابلة وحدها يُضيّع تفاصيل قيّمة.',
            en: 'Direct documentation immediately after the project is the smartest — numbers are fresh and the supervisor is still in context. Relying on memory or the interview alone loses valuable details.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'pi-long-term',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'الهوية المهنية على المدى البعيد', en: 'Professional identity in the long term' },
      lede: {
        ar: 'هويتك المهنية اليوم ليست نهائية — بل نقطة انطلاق لمسار يتطوّر مع كل تجربة جديدة تضيفها.',
        en: 'Your professional identity today is not final — it is a starting point for a path that develops with every new experience you add.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الهوية المهنية للمتطوّع ليست ثابتة — هي محصّلة كل ما اخترته من تجارب وما طوّرته من مهارات وما وثّقته من أثر. وما يجعلها تنمو هو التأمّل المنتظم: كل ستة أشهر، هل أنت تمارس ما تُجيد؟ هل تُطوّر شيئاً جديداً؟ هل تُقدّم نفسك بطريقة تعكس ما أصبحت عليه؟\n\nالتطوّع المديد الذي يُشكّل هوية مهنية ثريّة لا يحدث بالاستمرار وحده — بل بالاستمرار مع الوعي الذاتي.',
            en: 'A volunteer\'s professional identity is not fixed — it is the sum of all experiences you chose, skills you developed, and impact you documented. What makes it grow is regular reflection: every six months, are you practising what you do well? Are you developing something new? Are you presenting yourself in a way that reflects what you have become?\n\nLong-term volunteering that forms a rich professional identity does not happen through continuation alone — but through continuation with self-awareness.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'أسئلة للمراجعة الذاتية كل ستة أشهر', en: 'Questions for self-review every six months' },
          content: {
            ar: '١. ما المهارة الجديدة التي اكتسبتها في هذه الفترة؟ ٢. ما الأثر الأكبر الذي أحدثته ويمكن توثيقه؟ ٣. هل دوري التطوّعي الحالي يُقرّبني من هدفي المهني؟ ٤. ما الفجوة في مهاراتي أريد معالجتها في الفترة القادمة؟',
            en: '1. What new skill did I acquire this period? 2. What is the greatest impact I made that can be documented? 3. Does my current volunteer role bring me closer to my professional goal? 4. What skill gap do I want to address in the coming period?',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'توثيق تجربتك التطوّعية رقمياً يُحوّل ما أنجزته إلى رصيد مهني حقيقي. ملفّك على LinkedIn يُتيح لك إدراج كل دور تطوّعي كخبرة مهنية كاملة: المسمّى الوظيفي الدقيق (مدير برنامج، مدرّب، منسّق لجان، قائد فريق)، اسم الجمعية أو المنظّمة، فترة العمل، والإنجازات المحدّدة القابلة للقياس. لا تكتفِ بكلمة "متطوّع" فقط — بل "مدير مشروع تطوّعي للتدريب المجتمعي" أو "مدرّب في مهارات التواصل الفعّال".\n\nأضف قسم "التطوّع والخدمة المجتمعية" مع الشهادات والدورات التدريبية التي أكملتها. اطلب توصيات مكتوبة ومفصّلة من مشرفيك ومن زملائك الذين شهدوا عملك في مواقف حقيقية — التوصية التفصيلية من مشرف تطوّعي تُعادل تأثيرها توصية صاحب عمل مدفوع حين تتضمّن أمثلة محدّدة على مهاراتك ومواقفك.',
            en: 'Documenting your volunteering experience digitally turns what you have achieved into real professional capital. Your LinkedIn profile allows you to list every volunteer role as full professional experience: the precise job title (programme manager, trainer, committee coordinator, team leader), the organisation name, the period, and specific measurable achievements. Do not settle for the word "volunteer" alone — say "volunteer programme manager for community training" or "volunteer trainer in effective communication skills".\n\nAdd a "Volunteering and Community Service" section with certificates and training courses you completed. Request detailed written references from supervisors and colleagues who witnessed your work in real situations — a detailed reference from a volunteer supervisor equals the impact of a paid employer reference when it includes specific examples of your skills and conduct.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'ملفّ الإنجازات (Portfolio) هو مجموعة وثائق وشواهد مُنظَّمة تُبرهن على كفاءتك — تقارير نفّذتها، خطط تدريبية صمّمتها، نتائج برامج وصلت إلى مستفيدين حقيقيين، شهادات تقدير وتزكيات. ابدأ بمجلّد رقمي (مثل Google Drive أو Notion) تُضيف إليه كل إنجاز فور اكتماله قبل أن تُنسى التفاصيل.\n\nلكل مشروع أو دور: وثّق الهدف الذي بدأت به، والأساليب التي اتّبعتها، والنتائج الفعلية المُقاسة. الأرقام تُحدث فرقاً كبيراً: "رفعنا معدّل الحضور من 60% إلى 85% خلال فصل واحد" أقوى بكثير من "حسّنت معدّلات الحضور". هذا الملفّ يُميّزك في أي مقابلة مهنية مستقبلية لأنك تُقدّم دليلاً لا مجرّد وعود.',
            en: 'A Portfolio is an organised collection of documents and evidence that proves your competence — reports you produced, training plans you designed, programme results that reached real beneficiaries, appreciation certificates and references. Start with a digital folder (such as Google Drive or Notion) that you add each achievement to immediately upon completion, before details are forgotten.\n\nFor each project or role: document the goal you started with, the methods you followed, and the actual measured results. Numbers make a big difference: "we raised attendance rates from 60% to 85% in one semester" is far stronger than "improved attendance rates." This portfolio sets you apart in any future professional interview because you present evidence, not just promises.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'بيئة التطوّع حاضنة طبيعية لعلاقات مهنية أصيلة — زملاء شاركوك ضغط العمل الميداني، مشرفون رأوك تعمل في ظروف حقيقية وتتعامل مع تحدّيات فعلية، شركاء من منظّمات أخرى التقيتهم في فعاليات مشتركة. هذه علاقات أعمق من التواصل الرقمي السطحي لأنها بُنيت على تجربة مشتركة واختبار حقيقي.\n\nاستثمر كل فعالية تطوّعية في بناء علاقات مهنية مدروسة: تحدّث مع مشرفيك عن مسارك المهني بصدق، شارك في نقاشات المنظّمة حول التحدّيات لا فقط المهام التنفيذية، واطلب المعلومات والتوجيه والتوصيات بوضوح. المتطوّع الذي يُعرف بكفاءته وأسلوبه التعاوني ونزاهته يحصل في الغالب على فرص عمل وشراكات لم يُعلَن عنها علناً.',
            en: 'The volunteering environment is a natural incubator for genuine professional relationships — colleagues who shared the pressure of fieldwork with you, supervisors who saw you work in real conditions and handle actual challenges, partners from other organisations you met at joint events. These relationships are deeper than superficial digital networking because they were built on shared experience and real testing.\n\nInvest every volunteering event in building thoughtful professional relationships: speak honestly with your supervisors about your career path, participate in the organisation\'s discussions about challenges not just implementation tasks, and clearly ask for information, guidance, and references. A volunteer known for competence, collaborative spirit, and integrity typically receives job opportunities and partnerships that were never publicly announced.',
          },
        },
        {
          type: 'quiz',
          id: 'pi-q7',
          label: { ar: 'سؤال ٧', en: 'Question 7' },
          question: {
            ar: 'تتطوّع في نفس الدور منذ ثلاث سنوات وتُتقنه جيّداً. لكن لا تشعر أنك تتطوّر. ماذا تفعل؟',
            en: 'You have been volunteering in the same role for three years and do it well. But you do not feel you are developing. What do you do?',
          },
          options: [
            { ar: 'ناقش مع مشرفك إضافة مسؤوليات تُطوّر مهارة جديدة، أو فكّر في الانتقال لدور مختلف يُبقي تجربتك الحالية ثروة لا ثقلاً', en: 'Discuss with your supervisor adding responsibilities that develop a new skill, or consider transitioning to a different role that keeps your current experience an asset, not a burden' },
            { ar: 'استمرّ لأن الإتقان نفسه قيمة ويصعب بناؤه', en: 'Continue because mastery itself is valuable and hard to build' },
            { ar: 'اترك التطوّع وابحث عن وظيفة في المجال تدفع راتباً', en: 'Leave volunteering and look for a paid job in the field' },
          ],
          correct: 0,
          feedback: {
            ar: 'الإتقان بلا نموّ يُحوّل الكفاءة إلى ركود. إضافة تحدٍّ جديد ضمن نفس السياق أو الانتقال لدور مختلف كلاهما مسار صحيح — المهمّ أن يكون القرار مقصوداً لا تلقائياً.',
            en: 'Mastery without growth turns competence into stagnation. Adding a new challenge within the same context or transitioning to a different role are both valid paths — what matters is that the decision is deliberate, not automatic.',
          },
        },
        {
          type: 'quiz',
          id: 'pi-q8',
          label: { ar: 'سؤال ٨', en: 'Question 8' },
          question: {
            ar: 'صديق يسألك: "لماذا تستمرّ في التطوّع وأنت تعمل بوظيفة مدفوعة الآن؟". ما الإجابة التي تعكس هوية مهنية ناضجة؟',
            en: 'A friend asks: "Why do you continue volunteering when you now have a paid job?" What answer reflects a mature professional identity?',
          },
          options: [
            { ar: '"التطوّع يُبقيني متّصلاً بقيمي، يُطوّر مهارات لا يُتيحها عملي المدفوع، ويُوسّع شبكتي المهنية في مجالات تكمّل مسيرتي"', en: '"Volunteering keeps me connected to my values, develops skills my paid work doesn\'t offer, and expands my professional network in areas that complement my career"' },
            { ar: '"بحبّ المساعدة ومش قادر أوقف"', en: '"I love helping and cannot stop"' },
            { ar: '"بساعد الجمعية لأنهم محتاجين ناس متطوّعة"', en: '"I help the organisation because they need volunteers"' },
          ],
          correct: 0,
          feedback: {
            ar: 'الإجابة الأولى تُقدّم التطوّع كقرار مهني استراتيجي — لا خيّرية ولا التزاماً اجتماعياً. هذه هي الهوية المهنية الناضجة: وعي بما تُعطيه وما تأخذه من أي دور تختاره.',
            en: 'The first answer presents volunteering as a strategic professional decision — not charity or social obligation. This is the mature professional identity: awareness of what you give and what you take from every role you choose.',
          },
        },
      ],
    },
  ],
};
