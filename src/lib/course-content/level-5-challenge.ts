import type { CourseContent } from './types';

/**
 * The level 5 challenge: leading a single field project from design to honest
 * reporting.
 *
 * At level five the courses covered project design and logframes, ethical
 * decision-making, budget and risk management, community participation, and
 * monitoring and evaluation. A challenge at this level does not teach any of
 * those subjects again. It finds out whether a volunteer can run all five at
 * once — because a real project does not separate them by module.
 *
 * The scenario runs in chronological order: month one (design under donor
 * pressure), month three (an ethics breach by a local partner), month four
 * (a budget cut and a supply-chain risk), month five (community rejection of
 * an approved plan), and month six (the honest final report). Every question
 * requires at least two of the level's courses. A volunteer who treated the
 * five courses as five separate fact sheets will struggle here; one who
 * connected them will not.
 *
 * Wrong answers are written to be plausible. Each one satisfies something
 * real — speed, loyalty to the partner, keeping the donor happy, avoiding
 * awkwardness — while breaking something else. The feedback names the
 * collision rather than just marking the answer wrong.
 */

export const levelFiveChallenge: CourseContent = {
  slug: 'level-5-challenge',
  level: 5,
  minutes: 50,
  passMark: 70,
  title: {
    ar: 'مراجعة المستوى الخامس: قيادة مشروع',
    en: 'Level 5 Review: Leading a Project',
  },
  lede: {
    ar: 'مشروع واحد من التصميم حتى التقرير النهائي. كل قرار يختبر ما إذا كانت دورات المستوى الخامس قد وُظِّفت معاً في آنٍ واحد لا كل واحدة على حدة.',
    en: 'One project, from design through to the final report. Every decision tests whether the level-five courses have been put to work together, not each one in isolation.',
  },
  outcomes: {
    ar: [
      'تقود مشروعاً من التصميم حتى قياس الأثر',
      'تتّخذ قراراً أخلاقياً تحت ضغط الوقت وتوثّق سببه',
      'تعرض النتائج على شريك بصدق يشمل ما لم ينجح',
    ],
    en: [
      'Lead a project from design through to impact measurement',
      'Make an ethical decision under time pressure and record the reasoning',
      'Present results to a partner honestly, including what did not work',
    ],
  },
  sources: [
    'PMD Pro — Project Management for Development Professionals (APMG International, 2nd edition)',
    'OECD DAC Criteria for Evaluating Development Assistance (2019 revision)',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'l5ch-design',
      tag: { ar: 'الشهر الأول', en: 'Month one' },
      title: {
        ar: 'المنح لا تنتظر والمجتمع لم يُستشر بعد',
        en: 'The grant will not wait, and the community has not been consulted yet',
      },
      lede: {
        ar: 'تقود مشروعاً لتحسين الوصول إلى مياه الشرب في ثماني قرى. الممول يريد الإطار المنطقي الكامل خلال ثمانية وأربعين ساعة. جلسة التشاور المجتمعي مجدولة بعد خمسة أيام.',
        en: 'You are leading a project to improve drinking-water access in eight villages. The donor wants the full logical framework within forty-eight hours. The community consultation is scheduled five days from now.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: `أنت تقود مشروعاً لتحسين الوصول إلى مياه الشرب في ثماني قرى في منطقة ريفية. مدّة المشروع ستة أشهر، والميزانية الإجمالية مئتا ألف دولار. وصلك صباح هذا اليوم بريد إلكتروني من الممول: يريد الإطار المنطقي الكامل — بمؤشّرات خط الأساس، وأهداف كمية قابلة للقياس، وجدول زمني مفصّل — خلال ثمانية وأربعين ساعة. جلسة التشاور المجتمعي الأولى مجدولة بعد خمسة أيام ولم تُعقد بعد.

الإطار المنطقي وثيقة تربط بين أربعة مستويات: المدخلات والأنشطة والمخرجات والنتائج، وفي آخرها الأثر على حياة الناس الفعلية. هذا الربط لا يمكن أن يكون صحيحاً إذا لم يُستند إلى معرفة حقيقية بما يُعانيه المجتمع، وما يعتبره أولوية، وما هي العقبات التي أفشلت مشاريع سابقة في هذه البيئة بالذات. التشاور المجتمعي في مشاريع المياه والصرف الصحي ليس خطوة شكلية تُضاف في نهاية الوثيقة لاستيفاء شرط؛ هو جمع بيانات أساسي لا يمكن استبداله بافتراضات شخصية أو ببيانات مشاريع مشابهة من مناطق أخرى.

حين تُبنى مؤشّرات الأثر على افتراضات لا على بيانات، تبدو الوثيقة مقبولة في الشهر الأول، ثم تنكشف في الشهر الرابع: المؤشّرات لا تعكس واقعاً يمكن قياسه في هذه القرى تحديداً، والأهداف لا تأخذ في الاعتبار الديناميكيات الاجتماعية ولا المواسم الزراعية، والجداول الزمنية تتجاهل أن بعض المجتمعات تُفضّل التحشيد في مواسم بعينها. عندها تجد نفسك أمام فجوة بين ما وُعد به وما يمكن تسليمه.

قائد المشروع في هذا الموقف لا يختار بين الاستجابة للممول والحفاظ على جودة التصميم — يُدير الاثنين معاً من خلال التواصل المبكّر والمباشر. الممول الذي يطلب إطاراً في ثمانية وأربعين ساعة ليس دائماً على علم بأن هذا لا يكفي لتشاور مجتمعي حقيقي. المؤسسة التي تُبادر بشرح السياق وتُقدّم إطاراً مؤقّتاً واضح المعالم — يُشير بدقة إلى ما هو مؤكّد وما ينتظر التحقّق من الميدان بعد خمسة أيام — تُظهر لممولها أنها تعرف الفرق بين ما تعرفه وما لا تعرفه بعد. هذا في حدّ ذاته دليل نزاهة.

المؤشّرات الجيّدة لمشروع مياه لا تقيس ما بنيناه بل ما تغيّر في حياة الناس. عدد نقاط المياه المنشأة مؤشّر مخرجات — يقول ما فعله الفريق. نسبة الأسر التي انتقلت من مصدر مياه غير آمن إلى آمن مؤشّر نتيجة — يقول ما تغيّر بالنسبة للمستفيدين. هل استمرّ هذا التغيّر بعد انسحاب الفريق؟ هذا هو مؤشّر الأثر الحقيقي وفق معايير التقييم التي تعلّمتها في المستوى الخامس — لأن المشروع الذي ينتهي ومعه النتيجة لم يحقّق استدامة بل حقّق تسليماً.

اختيار المؤشّر الصحيح منذ البداية هو الذي يحدّد ما ستقيسه طوال ستة أشهر وما ستعرضه في التقرير النهائي. المؤشّر الخاطئ لا يقود فقط إلى تقرير مُضلل — يقود إلى قرارات تشغيلية خاطئة أثناء التنفيذ لأن الفريق يُتابع ما يقيسه الإطار لا ما يهمّ فعلاً.`,
            en: `You are leading a project to improve drinking-water access in eight villages in a rural region. The project runs for six months with a total budget of two hundred thousand dollars. This morning you received an email from the donor: they want the full logical framework — baseline indicators, measurable quantitative targets, and a detailed timeline — within forty-eight hours. Your first community consultation is scheduled five days from now and has not yet taken place.

The logical framework is a document linking four levels: inputs to activities, outputs to results, and finally impact on people's actual lives. That chain cannot be accurate if it is not based on real knowledge of what the community is experiencing, what they see as priorities, and what has caused previous projects in this particular setting to fail. Community consultation in water and sanitation projects is not a formality added at the end of a document to meet a requirement; it is a fundamental data-gathering step that cannot be replaced by personal assumptions or data from similar projects in other areas.

When impact indicators are built on assumptions rather than data, the document looks acceptable in month one, then unravels in month four: the indicators do not reflect a reality that can actually be measured in these specific villages, targets do not account for the social dynamics or agricultural seasons, and timelines ignore that some communities prefer mobilisation at particular times of year. At that point you find yourself facing a gap between what was promised and what can be delivered.

A project leader in this situation does not choose between responding to the donor and maintaining design quality — they manage both through early and direct communication. A donor asking for a framework within forty-eight hours is not always aware that this is insufficient time for genuine community consultation. An organisation that takes the initiative to explain the context and presents a provisional framework with clear markings — indicating precisely what is confirmed and what awaits field verification in five days — shows its donor that it knows the difference between what it knows and what it does not yet know. That in itself is evidence of integrity.

Good indicators for a water project do not measure what was built but what changed in people's lives. The number of water points established is an output indicator — it says what the team did. The percentage of households that moved from an unsafe to a safe water source is an outcome indicator — it says what changed for the beneficiaries. Did that change persist after the team withdrew? That is the true impact indicator according to the evaluation criteria you learned at level five — because a project whose results end when the project ends has achieved delivery, not sustainability.

Choosing the right indicator from the outset determines what you will measure over six months and what you will present in the final report. The wrong indicator does not only lead to a misleading report — it leads to incorrect operational decisions during implementation because the team monitors what the framework measures rather than what actually matters.`,
          },
        },
        {
          type: 'quiz',
          id: 'l5ch-q1',
          label: { ar: 'قرارك', en: 'Your decision' },
          question: {
            ar: 'الممول يُصرّ على الإطار المنطقي الكامل خلال ثمانية وأربعين ساعة. جلسة التشاور مجدولة بعد خمسة أيام. ما خطوتك؟',
            en: 'The donor insists on the full logical framework within forty-eight hours. Your consultation is scheduled five days from now. What is your move?',
          },
          options: [
            {
              ar: 'تُسلّم الإطار كاملاً الآن مستنداً إلى افتراضاتك وبيانات مشاريع مشابهة في المنطقة نفسها، وتعدّل الأرقام لاحقاً إن أظهرت جلسة التشاور خلاف ذلك، فمهلة الممول هي القيد المُلزم',
              en: 'Submit the full framework now based on your assumptions and data from similar projects in the same area, and revise the figures later if the consultation shows otherwise, since the donor deadline is the binding constraint',
            },
            {
              ar: 'تتواصل مع الممول، تشرح أن الإطار بلا تشاور سيُضعف جودة المشروع، وتقترح تسليم إطار مؤقّت الآن يُستكمل بعد جلسة التشاور',
              en: 'Contact the donor, explain that a framework without consultation will weaken project quality, and propose submitting a provisional framework now to be completed after the consultation session',
            },
            {
              ar: 'تؤجّل التسليم من جانبك دون إخبار الممول ريثما تنتهي جلسة التشاور',
              en: 'Delay submission on your own without telling the donor until the consultation is done',
            },
            {
              ar: 'تُسلّم الإطار وترفق ملاحظة داخلية تقول إن الأرقام تقريبية',
              en: 'Submit the framework and attach an internal note saying the figures are approximate',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'تسليم الإطار الكامل على افتراضات يخلق عقداً مع الممول على أرقام لا تعكس الواقع — وسيظهر ذلك حين تُقارَن بالنتائج الفعلية. التأجيل من دون إخطار إخلال بالتزام صريح وقد يُنهي الشراكة. الملاحظة الداخلية لا تصل إلى الممول ولا تحمي أحداً. الخيار الصحيح يعترف صراحةً بالتوتّر الحقيقي بين الجودة والوقت: إطار مؤقّت يُشير بوضوح إلى ما هو مؤكّد وما ينتظر التحقّق من الميدان، مع موعد محدّد للاستكمال. هذا ما يُبني العلاقة على الثقة لا على الامتثال الشكلي.',
            en: 'Submitting a full framework on assumptions creates a contract with the donor on figures that do not reflect reality — this will show when compared with actual results. Delaying without notice breaks an explicit commitment and may end the partnership. An internal note does not reach the donor and protects nobody. The correct option names the real tension between quality and time openly: a provisional framework that clearly marks what is confirmed and what awaits field verification, with a fixed date for completion. That is what builds the relationship on trust rather than formal compliance.',
          },
        },
        {
          type: 'quiz',
          id: 'l5ch-q2',
          label: { ar: 'المؤشّرات', en: 'Indicators' },
          question: {
            ar: 'بعد التشاور المجتمعي، تختار المؤشّر الرئيسي لقياس أثر مشروع المياه. أيّ الخيارات الآتية يقيس الأثر الحقيقي لا المخرجات؟',
            en: 'After the community consultation, you choose the main indicator for measuring the water project\'s impact. Which of the following measures real impact rather than outputs?',
          },
          options: [
            {
              ar: 'عدد نقاط المياه التي أُنشئت في نهاية المشروع',
              en: 'Number of water points established by the end of the project',
            },
            {
              ar: 'نسبة الأسر التي انتقلت من مصدر مياه غير آمن إلى مصدر آمن بعد ستة أشهر من انتهاء المشروع',
              en: 'Percentage of households that shifted from an unsafe to a safe water source six months after project end',
            },
            {
              ar: 'عدد ساعات التدريب على النظافة التي قدّمها الفريق للمجتمع',
              en: 'Number of hygiene training hours delivered by the team to the community',
            },
            {
              ar: 'مستوى رضا المستفيدين عن أنشطة المشروع وجودة المياه في استبيان الختام الذي يُوزَّع على كل أسرة مشاركة',
              en: 'Level of beneficiary satisfaction with project activities and water quality in the closing survey distributed to every participating household',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'عدد نقاط المياه مؤشّر مخرجات لا أثر — يقيس ما بُني لا ما تغيّر. ساعات التدريب مؤشّر نشاط. الرضا قياس إدراكي مفيد لكنه لا يُثبت تغيّراً فعلياً في سلوك أو وصول. المؤشّر الذي يقيس التحوّل الفعلي في مصدر المياه بعد انتهاء المشروع يختبر الاستدامة — هل الأثر استمرّ بعد انسحاب الفريق؟ هذا هو السؤال الجوهري في معايير التقييم التي تعلّمتها: لأن المشروع الجيّد يترك أثراً يستمرّ حين يغادر الفريق.',
            en: 'The number of water points is an output indicator, not impact — it measures what was built rather than what changed. Training hours are an activity indicator. Satisfaction is a useful perceptual measure but does not prove an actual change in behaviour or access. The indicator that measures the real shift in water source after the project ends tests sustainability — did the impact continue after the team withdrew? That is the core question in the evaluation criteria you were taught: because a good project leaves an effect that continues when the team departs.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'l5ch-ethics',
      tag: { ar: 'الشهر الثالث', en: 'Month three' },
      title: {
        ar: 'الشريك يستخدم بيانات المستفيدين في نشاط لم يُتّفق عليه',
        en: 'The partner is using beneficiary data in an activity that was not agreed',
      },
      lede: {
        ar: 'تكتشف في الشهر الثالث أن المنظمة الشريكة المحلية تستخدم قوائم المستفيدين في نشاط سياسي انتخابي لم يكن ضمن اتفاقية الشراكة. لديك اجتماع مع الممول الرئيسي غداً الصباح.',
        en: 'In month three you discover that the local partner organisation is using the beneficiary lists in an electoral political activity that was not included in the partnership agreement. You have a meeting with the main donor tomorrow morning.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: `اكتشاف انتهاك أخلاقي من شريك في منتصف تنفيذ المشروع يضعك أمام تعارض حاد بين أولويتين حقيقيتين: الحفاظ على علاقة الشراكة التي بنيتها على مدى ثلاثة أشهر وتحتاجها لإكمال المشروع، والتصرّف وفق مبادئ حماية البيانات والمعيار الإنساني الأساسي الذي تُلزم به مؤسستك. الضغط نحو تأجيل المواجهة أو تصغير المشكلة حقيقي ومفهوم — لكنه خطير تحديداً لأنه يبدو معقولاً.

استخدام بيانات المستفيدين في نشاط سياسي ينتهك ثلاثة مبادئ في آنٍ واحد. أولاً: مبدأ الموافقة المُستنيرة — المستفيدون وافقوا على مشاركة بياناتهم لأغراض مشروع المياه تحديداً لا لأغراض خارجه، وإعادة استخدامها في سياق مختلف بلا موافقتهم انتهاك صريح لهذا العقد. ثانياً: مبدأ عدم الإضرار — استخدام بيانات الأفراد في نشاط سياسي قد يُعرّض بعضهم لمخاطر اجتماعية أو مهنية أو أمنية في سياقات متعدّدة، وهم لم يُقدّروا ذلك الخطر حين وقّعوا موافقتهم. ثالثاً: معيار الثقة في المعيار الإنساني الأساسي — الثقة التي يمنحها المستفيد للمنظمة هي رأس المال الوحيد الذي لا يعوَّض، وانتهاكها يُفقد المنظمة قدرتها على العمل مع المجتمع في المستقبل.

توثيق القرار الأخلاقي لا يعني فقط كتابة ما قرّرت فعله — يعني كتابة لماذا اخترت هذا الخيار بالذات دون غيره من الخيارات المتاحة. الوثيقة الجيّدة تتضمّن: تاريخ ووصف الاكتشاف بلغة موضوعية خالية من أحكام النوايا، المبادئ أو البنود التعاقدية التي تتعارض مع ما حدث، الخيارات التي درستها وأسباب استبعاد كل منها، القرار الذي اتّخذته مع مبرّره، وخطوات المتابعة المقرّرة مع جداولها الزمنية.

هذا النوع من التوثيق يخدم غرضاً مزدوجاً: يحمي القائد الذي اتّخذ قراراً صعباً من التشكيك اللاحق في دوافعه، ويُتيح للمنظمة أن تتعلّم من الحادثة لمراجعة آليات اختيار الشركاء وبنود حماية البيانات في اتفاقيات الشراكة المستقبلية. القائد الذي يوثّق جيّداً لا يُقيّد نفسه — يبني الذاكرة المؤسسية التي تحمي المنظمة على المدى البعيد.

اجتماع الممول غداً الصباح ليس عائقاً — هو فرصة للشفافية المبكّرة إذا تصرّفت الليلة وفق الترتيب الصحيح: اتصال بالشريك يطلب الوقف الفوري، ثم توثيق كتابي للاكتشاف والإجراء المتّخذ، ثم إبلاغ الممول في الاجتماع بما حدث وما فعلته. الترتيب مهمّ: الوقف أولاً لأن الانتهاك لا يستطيع الانتظار، والتوثيق قبل الاجتماع لأن الممول يستحق أن يرى وثيقة لا مجرّد رواية شفهية.`,
            en: `Discovering an ethical breach by a partner mid-project places you in a sharp conflict between two genuine priorities: preserving the partnership relationship you have built over three months and need to complete the project, and acting in accordance with the data-protection principles and Core Humanitarian Standard your organisation is committed to. The pressure to postpone the confrontation or minimise the problem is real and understandable — but it is dangerous precisely because it appears reasonable.

Using beneficiary data in a political activity violates three principles at once. First: the principle of informed consent — beneficiaries agreed to share their data for the water project specifically, not for purposes outside it, and reusing it in a different context without their consent is an explicit violation of that agreement. Second: the do-no-harm principle — using individuals' data in a political activity may expose some of them to social, professional, or security risks in various contexts, risks they did not assess when they signed their consent. Third: the trust standard in the Core Humanitarian Standard — the trust a beneficiary extends to an organisation is the only capital that cannot be replaced, and violating it removes the organisation's ability to work with the community in the future.

Documenting an ethical decision does not only mean writing what you decided to do — it means writing why you chose that particular option over the other available ones. A good document includes: the date and description of the discovery in objective language free of judgements about intentions, the principles or contractual clauses that conflict with what happened, the options you examined and reasons for ruling each out, the decision taken with its justification, and the planned follow-up steps with their timelines.

This type of documentation serves a dual purpose: it protects the leader who took a difficult decision from later questioning of their motives, and it allows the organisation to learn from the incident to review partner-selection mechanisms and data-protection clauses in future partnership agreements. A leader who documents well is not constraining themselves — they are building the institutional memory that protects the organisation over the long term.

Tomorrow morning's donor meeting is not an obstacle — it is an opportunity for early transparency if you act tonight in the correct sequence: a call to the partner requesting an immediate halt, then a written record of the discovery and the action taken, then telling the donor at the meeting what happened and what you did. The sequence matters: the halt comes first because the violation cannot wait, and documentation comes before the meeting because the donor deserves to see a document rather than just an oral account.`,
          },
        },
        {
          type: 'quiz',
          id: 'l5ch-q3',
          label: { ar: 'القرار الأخلاقي', en: 'Ethical decision' },
          scenario: {
            ar: 'اكتشفت أن الشريك المحلي يستخدم قائمة المستفيدين في حملة انتخابية. لديك اجتماع مع الممول غداً الصباح.',
            en: 'You discover the local partner is using the beneficiary list in an electoral campaign. You have a donor meeting tomorrow morning.',
          },
          question: {
            ar: 'ما إجراؤك هذه الليلة؟',
            en: 'What is your action tonight?',
          },
          options: [
            {
              ar: 'تنتظر حتى تتأكّد أكثر — لا تريد الإضرار بعلاقة شراكة بنيتها على مدى أشهر بناءً على معلومة ناقصة وصلتك في آخر اللّيل',
              en: 'Wait until you are more certain — you do not want to damage a partnership built over months on incomplete information that reached you late at night',
            },
            {
              ar: 'تتصل بالشريك وتطلب وقف الاستخدام فوراً، توثّق الاكتشاف والخطوات كتابياً، وتُبلغ الممول غداً بشفافية',
              en: 'Call the partner and require an immediate halt, document the discovery and steps in writing, and inform the donor transparently tomorrow',
            },
            {
              ar: 'لا تذكر الموضوع في اجتماع الممول غداً — ستحلّه أولاً مع الشريك بهدوء',
              en: 'Do not mention the matter in tomorrow\'s donor meeting — you will resolve it quietly with the partner first',
            },
            {
              ar: 'ترفع تقريراً فورياً لإنهاء اتفاقية الشراكة قبل اجتماع الغد',
              en: 'File an immediate report to terminate the partnership agreement before tomorrow\'s meeting',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الانتظار يترك الانتهاك مستمراً ويصعب تبريره لاحقاً — "كنت أتأكّد" ليس إجراءً بل هو تأخير. إخفاء الأمر عن الممول في اجتماع الغد يُفقدك المصداقية حين يكتشفه بطريقة أخرى، والممولون يكتشفون دائماً. إنهاء الشراكة قبل إعطاء الشريك فرصة تصحيح قد يكون تصعيداً غير متناسب يضرّ بالمستفيدين الذين ما زال المشروع يخدمهم. الخيار الصحيح يجمع الوقف الفوري والتوثيق والشفافية — وبالترتيب الصحيح هذا.',
            en: 'Waiting leaves the violation running and becomes hard to justify later — "I was verifying" is not an action but a delay. Hiding the matter from the donor in tomorrow\'s meeting loses you credibility when they find out through other means, and donors always do. Terminating the partnership before giving the partner a chance to correct may be disproportionate escalation that harms the beneficiaries the project is still serving. The correct option combines immediate halt, documentation, and transparency — in exactly that sequence.',
          },
        },
        {
          type: 'quiz',
          id: 'l5ch-q4',
          label: { ar: 'التوثيق', en: 'Documentation' },
          question: {
            ar: 'توثّق قرارك الأخلاقي. أيّ العناصر الآتية يجب أن يغيب عن الوثيقة؟',
            en: 'You are documenting your ethical decision. Which of the following elements should be absent from the document?',
          },
          options: [
            {
              ar: 'وصف موضوعي للوقائع كما اكتشفتها مع تحديد تاريخ الاكتشاف',
              en: 'An objective description of the facts as you discovered them, with the date of discovery',
            },
            {
              ar: 'تقديرك الشخصي لنوايا الشريك ودوافعه وراء الانتهاك',
              en: 'Your personal assessment of the partner\'s intentions and motives behind the violation',
            },
            {
              ar: 'المبادئ أو البنود التعاقدية التي تتعارض مع ما حدث',
              en: 'The principles or contractual clauses that conflict with what happened',
            },
            {
              ar: 'الخيارات التي نظرت فيها وأسباب استبعاد كل منها',
              en: 'The options you considered and the reasons for ruling each out',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الوثيقة تصف الوقائع ولا تحكم على النوايا. تقدير نوايا الشريك — "فعل ذلك عمداً" أو "يسعى إلى مكسب سياسي" — استنتاج لا يمكن إثباته وقد يُفسد الوثيقة قانونياً ومؤسسياً إذا نُزع سياقها. الوثيقة الجيّدة تُثبت ما حدث وما انتُهك وما اتُّخذ من قرار — وتترك الحكم على الدوافع للتحقيق المؤسسي إن قرّرت المنظمة إجراءه. هذا التمييز بين الوقائع والاستنتاجات هو ما يجعل الوثيقة قابلة للاحتجاج بها لاحقاً.',
            en: 'The document describes facts and does not judge intentions. Assessing the partner\'s motives — "they did this deliberately" or "they are seeking political gain" — is an inference that cannot be proven and may compromise the document legally and institutionally if taken out of context. A good document records what happened, what was violated, and what decision was taken — and leaves judging motives to an institutional investigation if the organisation decides to conduct one. This distinction between facts and inferences is what makes the document usable as evidence later.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'l5ch-budget',
      tag: { ar: 'الشهر الرابع', en: 'Month four' },
      title: {
        ar: 'قطع الميزانية وسجل المخاطر',
        en: 'Budget cut and the risk register',
      },
      lede: {
        ar: 'المنظمة تُبلّغك بأن الممول قلّص التمويل الكلّي بنسبة خمسة وعشرين بالمئة بسبب أزمة تمويل داخلية. في الوقت نفسه، المورّد الرئيسي للأنابيب يُخبرك بتأخير ثلاثة أسابيع في التسليم.',
        en: 'The organisation tells you the donor has cut total funding by twenty-five percent due to an internal funding crisis. At the same time, the main pipe supplier notifies you of a three-week delivery delay.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: `قطع الميزانية في منتصف التنفيذ ليس استثناءً نادراً في العمل الإنساني — هو سيناريو يواجهه كثير من مديري المشاريع في الميدان، وما يُفرّق بين الاستجابة الجيّدة والسيئة ليس غياب المشكلة بل طريقة التعامل معها.

الخيارات المتاحة حين تُقطع الميزانية بنسبة كبيرة عادةً أربعة: أولاً، تضييق النطاق الجغرافي — تقليل عدد القرى المستهدفة من ثماني إلى ستّ مثلاً، مع الحفاظ على جودة العمل الكاملة في النطاق الأصغر. ثانياً، تقليل الجودة التقنية — الإبقاء على كل القرى مع استخدام مواد أو خدمات أرخص مستوىً. ثالثاً، تمديد الجدول الزمني — الإبطاء في الأنشطة الشهرية والمضيّ بجدول أبطأ ضمن التمويل المتاح. رابعاً، إيجاد تمويل بديل طارئ — البحث عن شريك تمويلي آخر أو حشد موارد مجتمعية تكميلية.

المعيار الأول في الاختيار بين هذه الخيارات هو: أيّها يُلحق أقلّ ضرر بالمستفيدين؟ في مشروع مياه بالتحديد، تضييق النطاق مع الحفاظ على الجودة التقنية عادةً أفضل من توسيع النطاق مع تدهور الجودة — لأن نقطة مياه آمنة وتعمل لعشر سنوات لخمسمئة شخص أفضل من نقطة مياه غير موثوقة لألف شخص. لكن هذا المعيار وحده غير كافٍ: القرار النهائي لا يُتخذ من مكتب المدير وحده.

آلية تغيير نطاق المشروع التي تعلّمتها في المستوى الخامس تمرّ بثلاث محطات: أولاً، تُعدّ تحليلاً للخيارات المتاحة بتكاليفها وأثرها على المستفيدين. ثانياً، تعرض هذا التحليل على فريقك والمجتمع لأخذ رأيهم. ثالثاً، تحصل على موافقة الممول خطياً قبل تطبيق أي تغيير. تغيير النطاق من جانبك من دون إبلاغ الممول وانتظار موافقته قد يُعدّ خرقاً لشروط المنحة بصرف النظر عن حُسن النية.

في الوقت نفسه، المورّد الرئيسي يُبلّغك بتأخير ثلاثة أسابيع. هذا هو اللحظة التي تُثبت فيها قيمة سجل المخاطر كوثيقة حيّة. إذا كان خطر تأخير التوريد مدرجاً في السجل بخطة استجابة محدّدة — موردون بديلون محدّدون مسبقاً، ومواعيد تشغيل بديلة — فالإجراء الآن هو تفعيل هذه الخطة لا التفكير من الصفر. إذا لم يكن مدرجاً، فهذا بحدّ ذاته درس يجب توثيقه: سجل المخاطر الذي لا يُحدَّث شهرياً لا يخدم غرضه.

الفرق بين قائد يُطبّق إدارة المخاطر بشكل فعلي وآخر يكتبها للاستيفاء يظهر في هذه اللحظة بالذات: الأول يفتح السجل، يجد الخطر والخطة، ويُفعّل الخطة فوراً ويُبلغ الممول. الثاني يفتح السجل، يجد الخطر بلا خطة، ويبدأ من الصفر.`,
            en: `A budget cut mid-implementation is not a rare exception in humanitarian work — it is a scenario many project managers face in the field, and what distinguishes a good response from a poor one is not the absence of the problem but the way it is handled.

The options available when the budget is cut significantly are usually four: first, narrowing the geographic scope — reducing the target villages from eight to six for example, while maintaining full work quality in the smaller scope. Second, reducing technical quality — keeping all villages while using lower-standard materials or services. Third, extending the timeline — slowing monthly activities and proceeding at a reduced pace within the available funding. Fourth, finding emergency alternative funding — seeking another funding partner or mobilising supplementary community resources.

The first criterion for choosing among these options is: which causes the least harm to beneficiaries? In a water project specifically, narrowing scope while maintaining technical quality is usually better than expanding scope while degrading quality — because a safe and functional water point lasting ten years for five hundred people is better than an unreliable one for a thousand. But this criterion alone is insufficient: the final decision is not taken from the project manager's office alone.

The process for changing project scope that you learned at level five passes through three stages: first, you prepare an options analysis with costs and impact on beneficiaries. Second, you present this analysis to your team and the community for their input. Third, you obtain written donor approval before implementing any change. Changing scope on your own without notifying the donor and waiting for approval may be considered a breach of grant conditions regardless of good intentions.

At the same time, the main supplier notifies you of a three-week delay. This is the moment that proves the value of the risk register as a living document. If the risk of supply delay was logged in the register with a specific response plan — pre-identified alternative suppliers, alternative implementation timelines — then the action now is to activate that plan rather than think from scratch. If it was not logged, that in itself is a lesson to document: a risk register that is not updated monthly does not serve its purpose.

The difference between a leader who applies risk management in practice and one who writes it for compliance shows at exactly this moment: the first opens the register, finds the risk and the plan, activates the plan immediately and notifies the donor. The second opens the register, finds the risk without a plan, and starts from scratch.`,
          },
        },
        {
          type: 'quiz',
          id: 'l5ch-q5',
          label: { ar: 'قرار الميزانية', en: 'Budget decision' },
          question: {
            ar: 'الميزانية قُطعت بنسبة ٢٥٪ في الشهر الرابع. أيّ الإجراءات الآتية يتوافق مع مبادئ الجودة والمساءلة؟',
            en: 'The budget has been cut by 25% in month four. Which of the following procedures aligns with quality and accountability principles?',
          },
          options: [
            {
              ar: 'تُكمل الخطة الأصلية كاملة بالتمويل المتبقّي عبر تخفيض جودة المواد في كل نقاط المياه',
              en: 'Complete the original plan in full with remaining funding by reducing material quality at all water points',
            },
            {
              ar: 'تُعدّ تحليلاً للخيارات، تعرضه على فريقك والمجتمع، وتحصل على موافقة الممول كتابياً قبل تطبيق أي تغيير في النطاق',
              en: 'Prepare an options analysis, present it to your team and the community, and get written donor approval before implementing any change in scope',
            },
            {
              ar: 'تُضيّق النطاق من جانبك فوراً بالتوقّف عن خدمة القرى الأبعد دون إخبار أحد، لأن الوقت لا يتّسع لدورة موافقات جديدة',
              en: 'Narrow the scope immediately on your own by stopping service to the more remote villages without telling anyone, because there is no time for a fresh approval cycle',
            },
            {
              ar: 'تُوقف المشروع كلياً وتُعيد المبلغ المتبقّي للممول لحين حلّ مشكلة التمويل',
              en: 'Suspend the project entirely and return the remaining funds to the donor until the funding issue is resolved',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'تخفيض الجودة التقنية بلا إبلاغ الممول خرق لشروط المنحة، وفي مشروع مياه قد يُنشئ بنية تحتية غير آمنة صحياً. والتضييق الأحادي للنطاق لا يختلف من حيث المساءلة المالية. والتوقّف الكامل يضرّ بمن بدأوا يعتمدون على المشروع. الإجراء الصحيح يحافظ على المساءلة تجاه الممول ويحترم المجتمع — الفرق بينه وبين التضييق الأحادي هو فقط الإذن المسبق، وهو فرق يحمي المشروع والمنظمة كليهما.',
            en: 'Reducing technical quality without notifying the donor is a breach of grant conditions, and in a water project may create infrastructure that fails health standards. Unilateral narrowing of scope is no different from a financial accountability perspective. Full suspension harms those who have begun to depend on the project. The correct procedure maintains accountability to the donor and respects the community — the difference between it and unilateral narrowing is only prior authorisation, and that difference protects both the project and the organisation.',
          },
        },
        {
          type: 'quiz',
          id: 'l5ch-q6',
          label: { ar: 'سجل المخاطر', en: 'Risk register' },
          scenario: {
            ar: 'المورّد الرئيسي للأنابيب يُبلّغك بتأخير ثلاثة أسابيع. هذا الخطر مدرج في سجل المخاطر برتبة «احتمال مرتفع — أثر عالٍ» مع خطة استجابة محدّدة تشمل موردين بديلين.',
            en: 'The main pipe supplier notifies you of a three-week delay. This risk is logged in the risk register as "high probability – high impact" with a defined response plan including alternative suppliers.',
          },
          question: {
            ar: 'ما خطوتك الأولى؟',
            en: 'What is your first step?',
          },
          options: [
            {
              ar: 'تُسجّله في محضر الاجتماع الشهري القادم وتنتظر لترى ما سيحدث',
              en: 'Log it in next month\'s meeting minutes and wait to see what happens',
            },
            {
              ar: 'تُفعّل خطة الاستجابة المحدّدة مسبقاً: تتواصل مع الموردين البديلين وتُبلغ الممول فوراً بالتعديل المحتمل في الجدول الزمني',
              en: 'Activate the pre-defined response plan: contact the alternative suppliers and notify the donor immediately of the possible schedule adjustment',
            },
            {
              ar: 'تطلب من الفريق العمل بجهد مضاعف لتعويض التأخير عند وصول المواد',
              en: 'Ask the team to work twice as hard to make up for the delay when the materials arrive',
            },
            {
              ar: 'تُعيد رسم الجدول الزمني من جانبك وتمتصّ التأخير في المدة المتبقية دون إخبار الممول، على أن تشرح الأمر في التقرير الربعي',
              en: 'Redraw the timeline on your own and absorb the delay into the remaining duration without informing the donor, explaining it in the quarterly report instead',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'وجود هذا الخطر في السجل بخطة استجابة مسبقة هو ما يُفرّق بين من طبّق إدارة المخاطر فعلياً ومن قرأها نظرياً. الانتظار والرسم الأحادي للجدول وطلب الجهد الإضافي من الفريق — كلّها تتجاهل أن الممول طرف في عقد له شروط محدّدة بشأن المواعيد. وطلب الجهد المضاعف من الفريق ليس خطة إدارة مخاطر. تفعيل خطة الاستجابة فور تحقّق الخطر وإبلاغ الممول المبكّر يمنحهما خياراً — التأخير يُزيله.',
            en: 'Having this risk in the register with a pre-defined response plan is what separates someone who has applied risk management in practice from someone who has studied it theoretically. Waiting, unilateral rescheduling, and asking the team for extra effort all ignore that the donor is a party to a contract with specific conditions about timelines. Asking the team to work twice as hard is not a risk management plan. Activating the response plan as soon as the risk materialises and providing the donor with early notification gives both an option — delay removes it.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'l5ch-adaptation',
      tag: { ar: 'الشهر الخامس', en: 'Month five' },
      title: {
        ar: 'المجتمع يرفض الخطة المعتمدة — ولديه سبب وجيه',
        en: 'The community rejects the approved plan — and has a good reason',
      },
      lede: {
        ar: 'تجتمع نساء المنطقة ويُبلّغنك أن مواقع نقاط المياه المخطّطة غير آمنة للنساء في ساعات المساء. لم يُذكر هذا في جلسة التشاور الأولى. التصميم حاصل على موافقة الممول.',
        en: 'The women of the area meet with you and inform you that the planned water point locations are unsafe for women in the evening hours. This was not raised in the first consultation. The design has donor approval.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: `المشاركة المجتمعية في مشاريع المياه والصرف الصحي ليست فعالية إحسانية أو إجراءً لرفع درجة التقييم — هي شرط تشغيلي يحدّد ما إذا كانت البنية التحتية ستُستخدم فعلاً أم ستبقى موجودة على الورق. نقطة مياه في موقع غير آمن لا تُستخدم ليلاً هي نقطة فشلت في غرضها الأساسي، حتى لو كانت تقنياً ممتازة ومُسلَّمة في الموعد.

المخاوف الأمنية الخاصة بالنساء في الوصول إلى البنية التحتية موثّقة في معايير القطاع الإنساني. كثير من الفشل في مشاريع المياه يُعزى تحديداً إلى أن المواقع اختيرت بناءً على معايير تقنية — قرب المصدر، سهولة التركيب، انخفاض التكلفة — دون أخذ معطيات الاستخدام الاجتماعي في الاعتبار: من يستخدم نقطة المياه، ومتى، وباي مسارات يصل إليها، وما المخاطر الأمنية في تلك المسارات وأوقات الاستخدام.

أن يُكتشف هذا في الشهر الخامس لا الأول يعني أن جلسة التشاور الأولى لم تكن شاملة كافياً. على الأرجح، لم تتضمّن نقاشاً منفصلاً مع النساء، أو لم تُطرح الأسئلة الصحيحة عن أوقات الاستخدام ومسارات الوصول والمخاوف الأمنية. هذا خطأ في المنهج لا في النية — وعلاجه الاعتراف الصريح والتصحيح الفوري، لا الدفاع عن الخطة لأنها مُعتمدة من الممول.

قائد المشروع في هذا الموقف يواجه تعارضاً بين التصميم المعتمد والحاجة الميدانية الفعلية المُكتشفة. الموافقة الممول ليست وثيقة منع من التعلّم — هي إذن لتنفيذ ما اتُّفق عليه بناءً على ما كان معروفاً وقت التصميم. حين تظهر معطيات جديدة جوهرية، الخيار ليس بين "أنفّذ الخطة" و"أُغيّر الخطة" — الخيار هو "كيف أُبلّغ الممول بالمعطى الجديد وأطلب مراجعة محدودة للتصميم بما يخدم المستفيدين أفضل؟"

التكيّف الميداني الجيّد يبدأ بالتوثيق: كم امرأة أبلغت عن المشكلة، وما هي المواقع بالتحديد، وما هي البدائل التي اقترحنها. ثم يمرّ بتقييم تقني للبدائل: هل يمكن نقل الموقع تقنياً؟ ما التكلفة الإضافية؟ ثم يصل إلى الممول بطلب مدعوم بالتوثيق والمبرّر. المجتمع الذي يرى قائداً يصغي لمخاوفه ويُعدّل خطته بناءً عليها هو المجتمع الذي سيصون البنية التحتية بعد انسحاب الفريق ويحرص على استمراريتها.`,
            en: `Community participation in water and sanitation projects is not a charitable exercise or a checklist item for evaluation scores — it is an operational requirement that determines whether infrastructure will actually be used or remain on paper. A water point in an unsafe location that is not used at night has failed its core purpose, even if technically excellent and delivered on time.

Women's security concerns regarding access to infrastructure are documented in humanitarian sector standards. Much of the failure in water projects is attributed specifically to sites being chosen on technical criteria — proximity to the source, ease of installation, low cost — without taking social usage data into account: who uses the water point, when, along which routes they reach it, and what security risks exist on those routes and at those times.

Discovering this in month five rather than month one means the first consultation was not sufficiently inclusive. It likely did not include a separate discussion with women, or did not ask the right questions about usage times, access routes, and security concerns. This is a methodological error rather than one of intent — and its remedy is explicit acknowledgement and immediate correction, not defending the plan because it has donor approval.

The project leader in this situation faces a tension between the approved design and the actual field need that has been discovered. Donor approval is not a document preventing learning — it is authorisation to implement what was agreed based on what was known at the time of design. When substantial new information emerges, the choice is not between "implement the plan" and "change the plan" — the choice is "how do I notify the donor of the new information and request a limited revision to the design that better serves the beneficiaries?"

Good field adaptation begins with documentation: how many women reported the problem, which locations specifically, and what alternatives they suggested. It then moves to a technical assessment of the alternatives: can the location be moved technically? What is the additional cost? Then it reaches the donor with a request supported by documentation and justification. The community that sees a leader who listens to its concerns and adjusts the plan accordingly is the community that will maintain the infrastructure after the team withdraws and care about its continuity.`,
          },
        },
        {
          type: 'quiz',
          id: 'l5ch-q7',
          label: { ar: 'التكيّف', en: 'Adaptation' },
          question: {
            ar: 'نساء المجتمع يُبلّغنك أن مواقع نقاط المياه غير آمنة في المساء. التصميم معتمد من الممول. ما خطواتك؟',
            en: 'Community women inform you that the water point locations are unsafe in the evening. The design has donor approval. What are your steps?',
          },
          options: [
            {
              ar: 'تُكمل التنفيذ وفق الخطة المعتمدة — التعديل بعد الموافقة معقّد جداً ويهدّد موعد الإنجاز، وطلب أي تغيير الآن سيُقرأ كضعف في التخطيط الأوّلي ويُضعف فرص التمويل المستقبلي',
              en: 'Complete implementation according to the approved plan — adjusting after approval is too complicated and threatens the completion date, and requesting any change now would be read as weakness in the initial planning and would harm future funding chances',
            },
            {
              ar: 'توثّق المخاوف بتفاصيل دقيقة، تُقيّم البدائل التقنية التي اقترحتها النساء، وتطلب من الممول موافقة على تعديل محدود مع مبرّر موثّق',
              en: 'Document the concerns in precise detail, assess the technical alternatives the women suggested, and request donor approval for a limited adjustment with documented justification',
            },
            {
              ar: 'تُعدّل المواقع من جانبك فوراً بحجّة أن سلامة المستفيدين أهم من الموافقة الإدارية، وأن الممول سيقبل الأمر الواقع لاحقاً ما دام المبرّر الإنساني واضحاً وموثّقاً',
              en: 'Adjust the locations on your own immediately, arguing that beneficiary safety is more important than administrative approval and that the donor will accept the fait accompli later as long as the humanitarian justification is clear and documented',
            },
            {
              ar: 'تعقد جلسة إضافية لإقناع النساء بأن المواقع الأصلية آمنة كافياً',
              en: 'Hold an additional session to convince the women that the original sites are safe enough',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'إكمال الخطة بعد مخاوف أمنية موثّقة يضع المشروع في تعارض مع مبدأ عدم الإضرار ومع مفهوم المشاركة الحقيقية. التعديل الأحادي — حتى لو دوافعه سليمة — يُعدّ خرقاً للاتفاقية من منظور المساءلة المالية. وإقناع النساء بقبول موقع يشعرن أنه غير آمن ليس تشاوراً بل إقصاء لصوتهن. الخيار الصحيح يحافظ على المساءلة مع الممول ويحترم المعطى الجديد — الفرق بينه وبين التعديل الأحادي هو فقط الإذن المسبق، وذلك الفرق يحمي المشروع كله.',
            en: 'Completing the plan after documented security concerns puts the project in conflict with the do-no-harm principle and the concept of genuine participation. Unilateral adjustment — even with correct motives — is treated as a breach of the agreement from a financial accountability perspective. Convincing women to accept a location they feel is unsafe is not consultation but exclusion of their voice. The correct option maintains accountability to the donor and respects the new information — the difference between it and unilateral adjustment is only prior authorisation, and that difference protects the entire project.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'l5ch-reporting',
      tag: { ar: 'الشهر السادس', en: 'Month six' },
      title: {
        ar: 'ستون بالمئة — التقرير الصادق والعرض للشريك الجديد',
        en: 'Sixty percent — the honest report and the pitch to a new partner',
      },
      lede: {
        ar: 'انتهى المشروع. بلغت ستين بالمئة من الأهداف الكمية — بسبب قطع الميزانية والتعديل الميداني. الممول يريد التقرير النهائي. شريك محتمل جديد يريد عرضاً لمشروع ثانٍ.',
        en: 'The project is over. You achieved sixty percent of the quantitative targets — because of the budget cut and the field adjustment. The donor wants the final report. A prospective new partner wants a pitch for a second project.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: `عرض النتائج بصدق — بما فيها ما لم ينجح — هو الاختبار الأصعب لقيادة المستوى الخامس. الضغط نحو تضخيم الصورة موجود دائماً من اتجاهات متعدّدة: الممول يريد أن يُبرّر استثماره أمام مؤسسته، والمنظمة تريد حماية علاقة التمويل للمشاريع القادمة، والشريك الجديد المحتمل يتوقّع قصة نجاح تدفعه للشراكة، والفريق نفسه يريد أن يشعر أن جهده السداسي أثمر. كل هذه الضغوط حقيقية ومشروعة في مصادرها — لكن الاستجابة لها بتضخيم النتائج تُنتج ثلاث مشاكل جسيمة.

أولاً: تمنع التعلّم المؤسسي. ما لم يُكتب بوضوح على أنه مشكلة لن يُصحَّح في المشروع القادم. إذا كتبنا أن المشروع "حقّق أهدافه" دون توضيح أن ذلك كان ستين بالمئة منها فقط، الفريق القادم الذي سيعمل على مشروع مماثل لن يعرف أن التصميم الأول كان يفتقر إلى التشاور الكافي مع النساء، ولن يعرف أن سجل المخاطر لم يشمل خطة لتأخيرات التوريد، ولن يعرف أن التشاور المجتمعي الأول كان يحتاج جلسات منفصلة.

ثانياً: يُشوّه قاعدة المعرفة القطاعية. إذا كتبت كل منظمة تقارير تُحسّن فيها نسب الإنجاز، تتراكم في القطاع توقّعات غير واقعية عن ما يمكن تحقيقه بميزانية محدودة في ستة أشهر في بيئة ريفية. وبعد خمس سنوات، يتساءل المموّلون لماذا المشاريع تُحقّق أقل مما تعد به — والجواب أن التقارير الجيّدة بنت توقّعات خاطئة.

ثالثاً: يخلق وعداً ضمنياً للشريك القادم بنتائج لا يمكن ضمانها. حين تعرض على شريك جديد مشروعاً بنتائج مُضخَّمة، هو يدخل الشراكة على أساس توقّعات لا تعكس الواقع. وحين تكون النتائج الفعلية أقل، يشعر بأنه أُضلّل — وهذا بالضبط ما يحدث.

ستون بالمئة مع توثيق الأسباب وخطط التعلّم المستفادة أقوى بكثير من مئة بالمئة مبنيّة على أرقام منقوصة أو مُعاد تعريفها. الممول الذي يقرأ تقريراً يشرح بصدق أن الميزانية قُطعت، وأن التعديل الميداني كان ضرورياً لحماية النساء، وأن الفريق اتّخذ كل القرارات الصحيحة في مواجهة هذه التحدّيات — هو ممول يرى إدارة مسؤولة وجديرة بالثقة في المشاريع القادمة.

الشريك الجديد الذي يسمع عرضاً يشمل ما لم يُنجز مع تفسير موضوعي وتوصيات واضحة يثق بأن ما يُقدَّم له يعكس الحقيقة. والشريك الذي يثق هو الشريك الذي يستثمر على المدى البعيد. الصدق في العرض ليس ضعفاً ولا اعترافاً بالفشل — هو الدليل على النضج المهني والثقة بالنفس والمؤسسة.`,
            en: `Presenting results honestly — including what did not work — is the hardest test of level-five leadership. Pressure to inflate the picture comes from multiple directions: the donor wants to justify their investment to their own institution, the organisation wants to protect the funding relationship for future projects, the prospective new partner expects a success story that will move them to partner, and the team itself wants to feel that six months of effort bore fruit. All of these pressures are real and legitimate in their sources — but responding to them by inflating results produces three serious problems.

First: it prevents institutional learning. What is not written clearly as a problem will not be corrected in the next project. If we write that the project "achieved its objectives" without clarifying that was only sixty percent of them, the next team working on a similar project will not know that the first design lacked sufficient consultation with women, will not know that the risk register did not include a plan for supply delays, and will not know that the first community consultation needed separate sessions.

Second: it distorts the sector knowledge base. If every organisation writes reports that improve achievement ratios, the sector accumulates unrealistic expectations about what can be achieved with a limited budget in six months in a rural environment. And after five years, donors wonder why projects deliver less than they promise — and the answer is that good-looking reports built wrong expectations.

Third: it creates an implicit promise to the next partner of results that cannot be guaranteed. When you present to a new partner a project with inflated results, they enter the partnership on the basis of expectations that do not reflect reality. When actual results fall short, they feel misled — and that is precisely what happens.

Sixty percent with documented reasons and lessons learned is far stronger than one hundred percent built on incomplete or redefined figures. A donor who reads a report that honestly explains the budget was cut, that the field adjustment was necessary to protect women, and that the team made all the right decisions in facing these challenges — that donor sees responsible management worthy of trust in future projects.

A new partner who hears a pitch that includes what was not achieved, with objective explanation and clear recommendations, trusts that what they are being shown reflects reality. And the partner who trusts is the partner who invests for the long term. Honesty in the pitch is not weakness or an admission of failure — it is evidence of professional maturity and confidence in oneself and the organisation.`,
          },
        },
        {
          type: 'quiz',
          id: 'l5ch-q8',
          label: { ar: 'العرض والتقرير', en: 'Pitch and report' },
          scenario: {
            ar: 'انتهى مشروعك بنسبة إنجاز ستين بالمئة. السبب موثّق: قطع الميزانية والتعديل الميداني. شريك محتمل جديد سيسمع عرضك غداً.',
            en: 'Your project ended at sixty percent completion. The reason is documented: budget cut and field adjustment. A prospective new partner hears your pitch tomorrow.',
          },
          question: {
            ar: 'كيف تبني عرضك للشريك الجديد؟',
            en: 'How do you structure your pitch to the new partner?',
          },
          options: [
            {
              ar: 'تُقدّم فقط الستين بالمئة التي أُنجزت كنتائج ناجحة وتتفادى ذكر الأسباب التي أثّرت في النتائج، لأن ذكر النواقص أمام شريك محتمل سيُضعف موقفك التفاوضي ويدفعه إلى منظمة أخرى',
              en: 'Present only the sixty percent achieved as successful results and avoid mentioning the reasons that affected the results, because raising shortfalls in front of a prospective partner would weaken your negotiating position and push them towards another organisation',
            },
            {
              ar: 'تُقدّم النتائج كاملة بما فيها ما لم يُنجز، مع سرد موضوعي للأسباب والقرارات المتّخذة، والدروس المستفادة، وتوصيات للمشروع القادم',
              en: 'Present all results including what was not achieved, with an objective account of the reasons and decisions made, lessons learned, and recommendations for the next project',
            },
            {
              ar: 'تُعيد حساب المؤشّرات بطريقة تجعل الستين بالمئة تبدو أقرب إلى المئة',
              en: 'Recalculate the indicators in a way that makes sixty percent appear closer to one hundred',
            },
            {
              ar: 'تُحيل الشريك إلى التقرير النهائي فقط وتمتنع عن أي عرض شفهي لتفادي الأسئلة المحرجة، معتبراً أن الوثيقة المكتوبة تكفي وحدها وأن النقاش المباشر يفتح باب تأويلات لا تخدم المنظمة',
              en: 'Refer the partner to the final report only and refrain from any verbal presentation to avoid uncomfortable questions, considering the written document sufficient on its own and that direct discussion opens the door to interpretations that do not serve the organisation',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'تقديم الستين بالمئة كنجاح كامل أو إعادة حساب المؤشّرات تضليل سيُكتشف في مرحلة التحقّق أو في أي مشروع مشترك قادم. الإحالة إلى التقرير فقط دون عرض يُشعر الشريك بعدم الشفافية ويمنعه من طرح الأسئلة التي يحتاجها لاتخاذ قرار مستنير. العرض الذي يشمل ما لم ينجح مع تفسير موضوعي ودروس واضحة هو الذي يبني ثقة حقيقية ومستدامة — وهو أيضاً الذي يُظهر للشريك الجديد أن هذه المنظمة ستكون صادقة معه في المشاريع القادمة كما كانت مع نفسها في هذا المشروع.',
            en: 'Presenting sixty percent as full success or recalculating indicators is misrepresentation that will be discovered in the verification stage or in any future joint project. Referring only to the report without a presentation makes the partner feel a lack of transparency and prevents them from asking the questions they need to make an informed decision. A pitch that includes what did not work with objective explanation and clear lessons is what builds real and lasting trust — and it also shows the new partner that this organisation will be honest with them in future projects, just as it was with itself in this one.',
          },
        },
        {
          type: 'quiz',
          id: 'l5c-q9',
          label: { ar: 'قرار متكامل', en: 'Integrated decision' },
          scenario: {
            ar: 'في العرض النهائي أمام الممول، يتدخّل أحد أعضاء فريقك علناً ويُصحّح رقماً ذكرته عن نسبة إنجاز المؤشّر الرئيسي — مؤكّداً أن الرقم الحقيقي أقلّ مما قلته. الممول ينظر إليكما. لم تكن على علم بالفارق قبل الاجتماع.',
            en: 'During the final presentation to the donor, a team member publicly intervenes and corrects a figure you cited about the main indicator\'s achievement rate — stating the real figure is lower than what you said. The donor is watching both of you. You were not aware of the discrepancy before the meeting.',
          },
          question: {
            ar: 'كيف تتعامل مع هذا الموقف في اللحظة ذاتها؟',
            en: 'How do you handle this situation in the moment?',
          },
          options: [
            {
              ar: 'تُعلّق على الفارق في وجه الممول فوراً لتحمي موقفك وتُقلّل من شأن ملاحظة الزميل، لأن الاعتراف بالخطأ في هذه اللحظة سيُفقدك هيبة القيادة أمام الممول وأمام بقية الفريق الحاضر',
              en: 'Comment on the discrepancy in front of the donor immediately to protect your position and minimise the colleague\'s remark, because admitting an error at this moment would cost you leadership authority in front of the donor and the rest of the team present',
            },
            {
              ar: 'تشكر الزميل بلغة هادئة، تعترف بالفارق أمام الممول، وتعد بمراجعة كاملة لبيانات الأداء ترفعها بعد الاجتماع خلال أربع وعشرين ساعة',
              en: 'Thank the colleague calmly, acknowledge the discrepancy in front of the donor, and commit to a full review of the performance data to be submitted after the meeting within twenty-four hours',
            },
            {
              ar: 'تقول إن الرقمين كليهما صحيحان لأنهما يقيسان جانبين مختلفين من المؤشّر',
              en: 'Say both figures are correct because they measure different aspects of the indicator',
            },
            {
              ar: 'تُنهي العرض بسرعة وتتفادى الموضوع ريثما تتحقّق من البيانات خارج الاجتماع، معتبراً أن مناقشة الأرقام أمام الممول الآن ستُطيل الاجتماع وتفتح ملفات أخرى لا داعي لفتحها',
              en: 'End the presentation quickly and avoid the subject until you can verify the data outside the meeting, considering that discussing the figures in front of the donor now would prolong the meeting and open other files that need not be opened',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الدفاع الفوري في وجه الممول يُحوّل خلافاً داخلياً إلى مشهد يُضعف مصداقية الفريق بأكمله — وهو العكس من الذكاء العاطفي في مواقف الضغط. ادّعاء أن الرقمين يقيسان جانبين مختلفين دون تحقّق تضليل محتمل. والهروب من الموضوع يترك الممول بلا إجابة ويُعمّق القلق. الذكاء العاطفي في القيادة يعني قبول التصحيح علناً بهدوء وثقة — هذا يُظهر للممول نزاهةً لا ضعفاً. الالتزام بمراجعة موثّقة خلال أربع وعشرين ساعة يُبقي الثقة قائمة ويُغلق الفارق بأسلوب مهني يعكس تكامل إدارة المشروع والمساءلة وحلّ النزاع الذي تعلّمته في المستوى الخامس.',
            en: 'Immediate defence in front of the donor turns an internal disagreement into a scene that undermines the entire team\'s credibility — the opposite of emotional intelligence under pressure. Claiming both figures measure different aspects without verification is potential misrepresentation. Avoiding the subject leaves the donor without an answer and deepens concern. Emotional intelligence in leadership means accepting a public correction calmly and confidently — this shows the donor integrity, not weakness. Committing to a documented review within twenty-four hours maintains trust and closes the gap professionally, reflecting the integration of project management, accountability, and conflict resolution learned at level five.',
          },
        },
      ],
    },
  ],
};
