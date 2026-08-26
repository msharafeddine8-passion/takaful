import type { CourseContent } from './types';

/**
 * Level 3 challenge: build a complete community initiative from scratch.
 *
 * Five phases that mirror a real project cycle — needs assessment, proposal,
 * team formation, delivery, evaluation — with a safeguarding disclosure
 * arriving mid-event that forces an immediate referral while everything else
 * keeps running.
 *
 * Nothing new is taught here. Every question requires two or more of the
 * level-3 courses to answer correctly, and every wrong option is something a
 * sincere volunteer would plausibly do.
 */

export const levelThreeChallenge: CourseContent = {
  slug: 'level-3-challenge',
  level: 3,
  minutes: 50,
  passMark: 70,
  title: {
    ar: 'مراجعة المستوى الثالث: بناء مبادرة مجتمعية',
    en: 'Level 3 Review: Build a Community Initiative',
  },
  lede: {
    ar: 'من تقييم احتياج إلى مقترح إلى فريق إلى فعالية — مع حالة حماية تظهر في منتصف الطريق وتفرض عليك إحالة.',
    en: 'From a needs assessment to a proposal to a team to an event — with a safeguarding case appearing halfway through that forces a referral.',
  },
  outcomes: {
    ar: [
      'تصمّم مبادرة كاملة من الاحتياج حتى التقييم',
      'تتعامل مع حالة حماية أثناء إدارة مشروع قائم',
      'تبرّر كل قرار بالمبدأ والدليل لا بالرأي',
    ],
    en: [
      'Design a complete initiative from need through to evaluation',
      'Handle a safeguarding case while running an ongoing project',
      'Justify every decision with a principle and evidence rather than an opinion',
    ],
  },
  sources: [
    'IFRC — Community Engagement and Accountability Guidelines (2023)',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
    'Keeping Children Safe — International Child Safeguarding Standards (4th edition)',
    'UNDP Community Development and Volunteer Engagement Toolkit',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'l3ch-needs',
      tag: { ar: 'المرحلة الأولى', en: 'Phase 1' },
      title: { ar: 'تقييم الاحتياج', en: 'Needs Assessment' },
      lede: {
        ar: 'قبل أي مبادرة، لا بدّ من فهم ما يحتاجه المجتمع فعلاً — لا ما نفترض أنه يحتاجه.',
        en: 'Before any initiative, you must understand what the community actually needs — not what you assume it needs.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'تعمل في جمعية تطوّعية وكلّفك المنسّق ببدء مبادرة لفئة الشباب في الحي. لا توجد معطيات جاهزة، ولا ميزانية محدّدة بعد، والموعد النهائي للمقترح بعد ثلاثة أسابيع.\n\nتقييم الاحتياج ليس استطلاعاً للرأي ولا جلسة عصف ذهني داخلية. هو عملية منهجية لجمع معلومات من مصادر متعدّدة: أفراد المجتمع المعنيّون، والشركاء العاملون في المنطقة، والبيانات الموجودة إن وُجدت. والفرق بين الاحتياج والطلب مهمّ: الشباب قد يطلبون نشاطاً ترفيهياً، لكن الاحتياج الحقيقي قد يكون مهارات توظيف أو دعم نفسي أو مساحة آمنة للحوار البنّاء.\n\nخطوات تقييم الاحتياج في هذا السياق تشمل: أولاً تحديد من هم الشباب المستهدفون وما الفئات المختلفة داخلهم — إناث وذكور، ذوو إعاقة، داخل المدرسة وخارجها، متزوّجون وغير متزوّجين. ثانياً اختيار أدوات جمع المعلومات المناسبة للسياق والوقت المتاح: مقابلات فردية مع ممثّلين، مجموعات بؤرية، أو ملاحظة ميدانية مباشرة. ثالثاً تحليل ما جُمع وترتيب الاحتياجات بحسب الأثر المتوقّع والجدوى في ضوء الموارد المتاحة. رابعاً التحقّق من النتائج مع المجتمع نفسه قبل البناء عليها حتى لا يُفاجأ الناس بمبادرة لم يُسهموا في تشكيلها.\n\nالمبدأ الأساسي: لا تُخطّط للناس بل معهم. كل قرار تتّخذه في هذه المرحلة سيؤثّر على كل ما يأتي بعده — والانحياز في التقييم ينتج انحيازاً في التصميم ينتج فشلاً في التنفيذ.',
            en: 'You work at a volunteer association and your coordinator has asked you to launch an initiative for young people in the neighbourhood. There is no ready data, no confirmed budget yet, and the proposal deadline is in three weeks.\n\nA needs assessment is not an opinion poll or an internal brainstorm. It is a systematic process of gathering information from multiple sources: affected community members, partners working in the area, and any existing data. The gap between need and demand matters: young people may ask for recreational activities, but the real need might be employability skills, psychosocial support, or a safe space for constructive dialogue.\n\nThe steps in this context include: first, identifying who the target young people are and what different groups exist within them — female and male, people with disabilities, in school and out, married or not. Second, choosing information-gathering tools suited to the context and time available: individual interviews with representatives, focus groups, or direct field observation. Third, analysing what was gathered and ranking needs by expected impact and feasibility given available resources. Fourth, checking findings with the community itself before building on them, so that people are not surprised by an initiative they had no hand in shaping.\n\nThe core principle: plan with people, not for them. Every decision at this stage shapes everything that follows — and bias in the assessment produces bias in design, which produces failure in delivery.',
          },
        },
        {
          type: 'quiz',
          id: 'l3ch-q1',
          label: { ar: 'قرار التقييم', en: 'Assessment decision' },
          scenario: {
            ar: 'تحدّثت مع خمسة شباب تعرفهم من أنشطة سابقة. كلّهم قالوا إنهم يريدون ورشة تصوير. المنسّق يستعجل: «لديك معلومة كافية، ابدأ المقترح».',
            en: 'You spoke with five young people you know from previous activities. All said they want a photography workshop. The coordinator is pushing: "You have enough information, start the proposal."',
          },
          question: {
            ar: 'كيف تتصرّف؟',
            en: 'What do you do?',
          },
          options: [
            {
              ar: 'تكتب المقترح فوراً — عندك رأي واضح من المجتمع، والمنسّق أدرى بالمنطقة منك، وأي تأخير قد يفوّت موعد التمويل الذي لن يتكرّر هذا العام',
              en: 'Write the proposal immediately — you have a clear community view, the coordinator knows the area better than you, and any delay risks missing a funding window that will not come again this year',
            },
            {
              ar: 'تشرح للمنسّق أن خمسة أشخاص من معارفك لا يمثّلون المجتمع المستهدف، وتطلب يومين إضافيين لمقابلة فئات أخرى على الأقل قبل أي مقترح',
              en: 'Explain to the coordinator that five people you already know do not represent the target community, and ask for two more days to reach other groups before any proposal',
            },
            {
              ar: 'تكتب في المقترح «بناءً على استشارة المجتمع» وتمضي دون توضيح',
              en: 'Write "based on community consultation" in the proposal and proceed without clarification',
            },
            {
              ar: 'تستبدل التقييم باستطلاع على وسائل التواصل الاجتماعي لتوسيع العيّنة بسرعة',
              en: 'Replace the assessment with a social media poll to quickly broaden the sample',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الخيار الأول يخلط بين السرعة والجودة، والسرعة دون جودة تنتج مبادرة لا تخدم المستهدفين. كتابة «استشارة مجتمعية» على ما لم يكن استشارة حقيقية هي غشّ موثّق لا عمل قائم على دليل. أما استطلاع التواصل الاجتماعي فيستبعد من لا يملك هاتفاً ذكياً أو إنترنت أو حساباً — وهم غالباً الأكثر احتياجاً. المبدأ: العيّنة المتحيّزة تنتج قراراً متحيّزاً. يومان إضافيان ثمن مقبول تماماً لتجنّب مبادرة مصمّمة لأشخاص خاطئين.',
            en: 'The first option confuses speed with quality, and speed without quality produces an initiative that does not serve the intended beneficiaries. Writing "community consultation" over what was not one is documented fabrication, not evidence-based practice. A social media poll excludes those without a smartphone, internet, or an account — often those most in need. The principle: a biased sample produces a biased decision. Two extra days is a perfectly acceptable price for avoiding an initiative designed for the wrong people.',
          },
        },
        {
          type: 'quiz',
          id: 'l3ch-q2',
          label: { ar: 'قرار التقييم', en: 'Assessment decision' },
          scenario: {
            ar: 'بعد يومين جمعت آراء متنوّعة: الشباب الذكور يريدون تصويراً وكرة قدم، والشابات يطلبن مساحة نقاش آمنة بعيدة عن بيئة العائلة، والشباب خارج المدرسة يحتاجون مهارات عملية للتوظيف. ميزانيتك لا تكفي للاحتياجات الثلاثة معاً.',
            en: 'After two days you have varied responses: young men want photography and football, young women ask for a safe discussion space away from family, and out-of-school youth need practical employability skills. Your budget covers only one.',
          },
          question: {
            ar: 'أيّ الاحتياجات تبني عليه المقترح؟',
            en: 'Which need do you build the proposal around?',
          },
          options: [
            {
              ar: 'تختار ما تراه شخصياً أهمّ وتبرّر ذلك بخبرتك في العمل مع الشباب',
              en: 'Choose what you personally find most important and justify it with your experience working with youth',
            },
            {
              ar: 'تختار الاحتياج الأكثر ظهوراً في التقييم بحسب عدد من ذكروه وعمقه، وتذكر الاحتياجات الأخرى في المقترح كتوصيات لمراحل مستقبلية',
              en: 'Choose the need that appeared most prominently in the assessment by frequency and depth, and note the other needs in the proposal as recommendations for future phases',
            },
            {
              ar: 'تختار الاحتياج الأسهل تنفيذاً لضمان نجاح المبادرة الأولى',
              en: 'Choose the easiest need to implement to guarantee the first initiative succeeds',
            },
            {
              ar: 'ترفع تقرير التقييم وتترك اختيار الأولوية كلياً للمنسّق',
              en: 'Submit the assessment report and leave the priority choice entirely to the coordinator',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الاختيار الشخصي يعيد المسألة إلى نقطة البداية: قرار بلا دليل يحلّ محلّ تقييم. ومعيار «الأسهل تنفيذاً» لا علاقة له بالاحتياج الحقيقي وقد يُنتج مبادرة ناجحة تشغيلياً وفارغة أثراً. أما التفويض الكامل للمنسّق فتخلٍّ عن دورك كحامل للمعلومة الميدانية الوحيدة المتاحة. الصحيح هو اتّخاذ القرار بناءً على ما أظهره التقييم مع الإقرار الصادق بما لم تستطع تغطيته — وهذا الإقرار جزء لا يتجزّأ من النزاهة المهنية.',
            en: 'The personal choice returns us to the start: a decision without evidence replacing an assessment. "Easiest to implement" has no connection to real need and may produce an initiative that succeeds operationally but has no impact. Full delegation to the coordinator is an abdication of your role as holder of the only available field information. The right approach is to decide based on what the assessment revealed, while honestly acknowledging what could not be covered — and that acknowledgement is an inseparable part of professional integrity.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'l3ch-proposal',
      tag: { ar: 'المرحلة الثانية', en: 'Phase 2' },
      title: { ar: 'كتابة المقترح', en: 'Writing the Proposal' },
      lede: {
        ar: 'المقترح ليس حلماً مكتوباً — هو اتفاق مع نفسك بشأن ما ستفعله وكيف وبماذا وكيف ستعرف إن نجحت.',
        en: 'A proposal is not a written dream — it is a contract with yourself about what you will do, how, with what, and how you will know if it worked.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'بعد أن حدّدت الاحتياج الرئيسي، يجب أن تُحوّله إلى مقترح مشروع يمكن تقييمه وتموينه والمساءلة عنه. المقترح الجيّد يجيب على ستة أسئلة بوضوح: لماذا هذا المشروع (المشكلة الموثّقة)، ولمن (المستفيدون المباشرون وصفاتهم)، وماذا سنفعل بالتحديد (الأنشطة والجدول الزمني)، وبماذا (الموارد المطلوبة)، وكيف سنعرف إن نجحنا (مؤشّرات قابلة للقياس)، ومن المسؤول عن كل جزء (هيكل المساءلة).\n\nالخطأ الأكثر شيوعاً في مقترحات المتطوّعين هو كتابة أهداف جميلة بلا مؤشّرات. الهدف «تمكين الشباب» أو «تعزيز الثقة بالنفس» بدون قياس محدّد يعني أن أي نتيجة ستبدو نجاحاً. المؤشّر الجيّد يجيب على: كم؟ بحلول متى؟ قياساً بماذا؟ ويرتبط مباشرةً بالاحتياج الذي بدأت منه.\n\nالخطأ الثاني هو الوعود غير المحدودة: «سنحلّ مشكلة البطالة في الحيّ» أو «سنضمن نجاح كل مشارك». الوعد الذي يتجاوز الموارد المتاحة يضرّ بثقة المجتمع أكثر مما تضرّ به الصراحة. الالتزام الصادق بما يمكنك تقديمه فعلاً — حتى لو كان أقل مما يُريد الناس — هو أساس الثقة طويلة الأمد مع المجتمع الذي تخدمه.',
            en: 'After identifying the main need, you must turn it into a project proposal that can be evaluated, resourced, and held accountable. A good proposal answers six questions clearly: why this project (the documented problem), for whom (the direct beneficiaries and their characteristics), what exactly will be done (activities and timeline), with what (resources required), how we will know if it worked (measurable indicators), and who is responsible for each part (accountability structure).\n\nThe most common mistake in volunteer proposals is writing beautiful goals without indicators. A goal like "empower youth" or "build self-confidence" without a defined measure means any outcome will look like success. A good indicator answers: how many? By when? Against what baseline? And it connects directly to the need you started with.\n\nThe second mistake is unlimited promises: "we will solve unemployment in the neighbourhood" or "we will guarantee every participant succeeds." A commitment that exceeds available resources damages community trust more than honesty does. A sincere commitment to what you can actually deliver — even if less than what people want — is the foundation of long-term trust with the community you serve.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'المؤشّر مقابل النشاط', en: 'Indicator vs Activity' },
          content: {
            ar: 'النشاط هو ما تفعله: «ننفّذ ثلاث ورش». المؤشّر هو ما يتغيّر بسببه: «٧٠٪ من المشاركين يُكملون تمرين التقييم بدرجة ٦٠ فأكثر». المقترح الذي يقيس النشاط فقط يعرف أنه حدث شيء، لا أن أحداً استفاد.',
            en: 'An activity is what you do: "deliver three workshops." An indicator is what changes because of it: "70% of participants complete the assessment exercise with 60 or above." A proposal that only measures activities knows something happened, not that anyone benefited.',
          },
        },
        {
          type: 'quiz',
          id: 'l3ch-q3',
          label: { ar: 'قرار المقترح', en: 'Proposal decision' },
          scenario: {
            ar: 'كتبت المقترح، وفي خانة «كيف سنقيس النجاح» كتبت: «سيشعر المشاركون بالرضا ويمدحون النشاط في تقييم نهائي». زميلك يقول إن هذا ليس مؤشّراً.',
            en: 'You wrote the proposal and in the "how we measure success" field wrote: "Participants will feel satisfied and praise the activity in a final evaluation." A colleague says this is not an indicator.',
          },
          question: {
            ar: 'ما المؤشّر الأدق الذي يجب أن يحلّ محلّه؟',
            en: 'What more precise indicator should replace it?',
          },
          options: [
            {
              ar: 'عدد المشاركين الذين يحضرون النشاط التالي بناءً على هذه التجربة',
              en: 'The number of participants who attend the next activity based on this experience',
            },
            {
              ar: 'نسبة المشاركين الذين يُظهرون إتقان المهارة المستهدفة في تمرين تقييمي موحّد في نهاية المبادرة، مقاساً بمعيار محدّد مسبقاً',
              en: 'The proportion of participants who demonstrate mastery of the target skill in a standardised assessment exercise at the end of the initiative, measured against a pre-defined benchmark',
            },
            {
              ar: 'متوسّط درجة الرضا في استبيان مختصر بعد كل جلسة',
              en: 'Average satisfaction score in a brief post-session survey',
            },
            {
              ar: 'العدد الكلّي للمشاركين مقارنةً بالهدف العددي',
              en: 'Total participant numbers compared to the numerical target',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الحضور في النشاط التالي يقيس الولاء والتفضيل لا الأثر الفعلي على المهارة. الرضا مؤشّر وجداني مفيد لكنه لا يقول شيئاً عمّا تعلّمه المشارك أو تغيّر في سلوكه أو قدراته. والعدد الكلّي يقيس الوصول لا الفائدة — يمكن أن يحضر خمسون شخصاً ولا يستفيد أحد. المؤشّر الجيّد مرتبط مباشرةً بالهدف المعلن في المقترح: إن كان الهدف اكتساب مهارة، فالمؤشّر هو المهارة المكتسبة قياساً بمعيار، لا الشعور الذي تولّده.',
            en: 'Attendance at the next activity measures loyalty and preference, not actual impact on skill. Satisfaction is a useful affective indicator but says nothing about what the participant learned or how their behaviour or capabilities changed. Total numbers measure reach, not benefit — fifty people can attend and no one benefits. A good indicator is directly tied to the stated objective: if the goal is skill acquisition, the indicator is the measured acquired skill against a benchmark, not the feeling it generates.',
          },
        },
        {
          type: 'quiz',
          id: 'l3ch-q4',
          label: { ar: 'قرار المقترح', en: 'Proposal decision' },
          scenario: {
            ar: 'المنسّق يقترح إضافة الجملة التالية: «سنُنجز ما يتطلّبه المجتمع مهما كلّف الأمر وبغضّ النظر عن الظروف». يقول إنها تُعطي انطباعاً قوياً بالالتزام.',
            en: 'The coordinator suggests adding the sentence: "We will deliver whatever the community requires regardless of cost and no matter the circumstances." He says it gives a strong impression of commitment.',
          },
          question: {
            ar: 'ما ردّك؟',
            en: 'What is your response?',
          },
          options: [
            {
              ar: 'توافق — الالتزام القوي يبني ثقة المجتمع ويميّز الجمعية',
              en: 'Agree — strong commitment builds community trust and distinguishes the association',
            },
            {
              ar: 'تعتذر بأدب عن الجملة وتقترح بديلاً: «سنعمل وفق الموارد المتّفق عليها والإطار الزمني المحدّد وسنوثّق أي تغيير ونُبلّغ المعنيّين»',
              en: 'Politely decline the sentence and propose a replacement: "We will work within agreed resources and the defined timeline, and will document and communicate any changes"',
            },
            {
              ar: 'تقبل الجملة لأن المنسّق أعلى منك ولا يصحّ لك الاعتراض على خياراته اللغوية',
              en: 'Accept the sentence because the coordinator outranks you and it is not your place to object to his language choices',
            },
            {
              ar: 'تُزيل خانة الالتزامات من المقترح بأكملها لتجنّب الإشكال',
              en: 'Remove the commitments section from the proposal entirely to avoid the problem',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'وعد لا يمكن الوفاء به يُسبّب ضرراً أكبر للثقة مما تُسبّبه الصراحة من البداية — وحين تتغيّر الظروف وتعجز الجمعية عن التسليم، يصبح الضرر أضعافاً مقارنةً بما لو لم يُعطَ أي وعد مفتوح. الاعتراض المهني المقرون بعرض بديل أفضل ليس تحدّياً للسلطة، بل مساهمة في جودة المؤسّسة. وحذف الخانة لا يحلّ التوتر بل يُخفيه إلى ما هو أسوأ.',
            en: 'A promise that cannot be kept causes greater damage to trust than honesty from the start — and when circumstances change and the association cannot deliver, the harm is far greater than if no open-ended promise had been made. A professional objection paired with a better alternative is not challenging authority; it is contributing to institutional quality. Removing the section does not resolve the tension; it hides it until something worse.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'l3ch-team',
      tag: { ar: 'المرحلة الثالثة', en: 'Phase 3' },
      title: { ar: 'بناء الفريق وتوزيع الأدوار', en: 'Building the Team' },
      lede: {
        ar: 'قُبل المقترح. الآن تحتاج إلى ثلاثة متطوّعين إضافيين لتنفيذ الفعالية، وأسبوعان فقط للتحضير.',
        en: 'The proposal is approved. You now need three more volunteers for the event, with only two weeks to prepare.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'اختيار الفريق وتوزيع الأدوار هما المرحلة التي تحدّد إن كان المقترح الجيّد سيُنفَّذ بجودة أم سيتعثّر. الخطأ الأكثر شيوعاً هنا هو الاختيار بناءً على القرب الشخصي — «أعرفه وأثق به» — بدلاً من الكفاءة والتوافر. الثقة الشخصية قيمة، لكنها لا تحلّ محلّ المهارة المطلوبة لدور بعينه.\n\nقبل اختيار الأشخاص، يجب أن تُعرّف الأدوار: ما هي المهام الضرورية لتنفيذ هذه الفعالية؟ من يتولّى التسجيل والاستقبال؟ من يُيسّر الجلسات؟ من يتابع السلامة والحضور؟ من ينسّق مع المكان؟ كل دور له مسؤوليات واضحة ومساءلة محدّدة — وما لا يُسمَّى لن يُنجَز.\n\nبعد الاختيار، الوضوح شرط لا ترف: كل متطوّع يجب أن يعرف بالضبط ما هو مسؤول عنه، وما الذي لا يُفعل إلا بتنسيق، وإلى من يُبلّغ إن واجه موقفاً خارج نطاق دوره. الغموض في البداية يُنتج ازدواجاً وفجوات وتوتّرات يصعب حلّها وقت التنفيذ.',
            en: 'Choosing the team and assigning roles is the phase that determines whether a good proposal will be delivered with quality or will stumble. The most common mistake here is selecting based on personal closeness — "I know them and trust them" — rather than the competence and availability needed for a specific role. Personal trust is valuable, but it cannot substitute for the skill a given role demands.\n\nBefore choosing people, define the roles: what tasks are necessary to deliver this event? Who handles registration and reception? Who facilitates sessions? Who monitors safety and attendance? Who coordinates with the venue? Each role has clear responsibilities and defined accountability — and what is not named will not get done.\n\nAfter selection, clarity is a requirement, not a luxury: every volunteer must know exactly what they are responsible for, what requires coordination, and to whom they report if they face a situation outside their role. Ambiguity at the start produces duplication, gaps, and tensions that are hard to resolve during delivery.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'حدّد الأدوار الضرورية قبل اختيار الأشخاص، واربط كلّ دور بمهارة يحتاجها',
              'اختر بناءً على الكفاءة والتوافر الفعلي، لا القرب الشخصي وحده',
              'وضّح لكل متطوّع مسؤوليته بالتفصيل: ما يُفعل، ما لا يُفعل، ومن يُبلَّغ عند الحاجة',
              'ضع قناة تواصل مشتركة وتوقيتات اجتماعات وآليةً لتغطية الغياب المفاجئ',
              'تأكّد من الفهم: اطلب من كل شخص أن يعيد صياغة دوره بكلماته الخاصة',
            ],
            en: [
              'Define the necessary roles before choosing people, and tie each role to a skill it requires',
              'Select based on competence and actual availability, not personal closeness alone',
              'Clarify each volunteer\'s responsibility in detail: what to do, what not to do, and who to tell when needed',
              'Set a shared communication channel, meeting times, and a mechanism to cover unexpected absences',
              'Confirm understanding: ask each person to restate their role in their own words',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'l3ch-q5',
          label: { ar: 'قرار الفريق', en: 'Team decision' },
          scenario: {
            ar: 'اخترت ثلاثة متطوّعين. أحدهم — ماهر — أكّد مشاركته، لكنه لم يحضر اجتماعَي التحضير الاثنين ولا أكمل المواد التي أُرسلت له. يقول في كل مرة: «سأكون في الفعالية بالتأكيد». الفعالية بعد أسبوع.',
            en: 'You chose three volunteers. One of them — Maher — confirmed his participation but has not attended either of the two preparation meetings and has not completed the materials sent to him. He says each time: "I will definitely be at the event." The event is in one week.',
          },
          question: {
            ar: 'ما الذي تفعله مع ماهر؟',
            en: 'What do you do about Maher?',
          },
          options: [
            {
              ar: 'تثق بوعده وتحتسبه ضمن الفريق — الناس أحياناً مشغولون وينتظمون عند التنفيذ',
              en: 'Trust his word and count him in the team — people are sometimes busy and pull together at delivery',
            },
            {
              ar: 'تتحدّث إليه مباشرةً: إن لم يستطع الالتزام بما تبقّى من تحضير، تتفق معه على تقليص دوره أو استبداله الآن — قبل أن يضيق الوقت',
              en: 'Speak to him directly: if he cannot commit to the remaining preparation, agree to reduce his role or replace him now — before time runs out',
            },
            {
              ar: 'تُبلّغ المنسّق وتتركه يقرّر ما يفعل مع ماهر',
              en: 'Inform the coordinator and leave them to decide what to do about Maher',
            },
            {
              ar: 'تُقسّم دوره سرّاً على الآخرين دون إعلامه لتجنّب الإحراج',
              en: 'Quietly divide his role among the others without telling him to avoid embarrassment',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الثقة العمياء بالوعد مع غياب ملموس هي مجازفة بالفريق كله ومقامرة بجودة التنفيذ. وترك القرار للمنسّق في موضوع ميداني تملك فيه المعلومة الأدق تفويض في غير محلّه. أما تقسيم الدور سرّاً فيحرم ماهر من فرصة تصحيح مساره ويصنع توتّراً مخفياً ينفجر في لحظة خاطئة. المحادثة المباشرة مع وضوح العواقب — قبل الفعالية لا خلالها — هي الأمانة نفسها مع الشخص ومع المهمّة.',
            en: 'Blind trust in a commitment with concrete absence is gambling with the whole team and wagering on delivery quality. Leaving the decision to the coordinator on a field matter where you hold more precise information is misplaced delegation. Quietly dividing the role deprives Maher of a chance to correct course and creates hidden tension that explodes at the wrong moment. A direct conversation with clear consequences — before the event, not during it — is honesty with both the person and the task.',
          },
        },
        {
          type: 'quiz',
          id: 'l3ch-q6',
          label: { ar: 'قرار الفريق', en: 'Team decision' },
          scenario: {
            ar: 'في اجتماع التحضير الأخير تختلف مع زميلة حول ترتيب جلسات الفعالية: هي تريد البدء بالنشاط التفاعلي، وأنت تريد تقديم المحتوى النظري أولاً. كلّ منكما لديه مبرّرات تربوية وجيهة.',
            en: 'In the last preparation meeting you and a colleague disagree on session order: she wants to open with the interactive activity, you want to cover the theoretical content first. Both of you have valid pedagogical justifications.',
          },
          question: {
            ar: 'كيف تحسم الخلاف؟',
            en: 'How do you resolve the disagreement?',
          },
          options: [
            {
              ar: 'تصوّتون في الفريق والأغلبية تحسم الأمر',
              en: 'The team votes and the majority decides',
            },
            {
              ar: 'تعودون إلى مؤشّر النجاح المتّفق عليه في المقترح: أيّ الترتيبَين أكثر احتمالاً لتحقيقه بناءً على الأدلة أو تجارب سابقة مشابهة؟',
              en: 'Return to the agreed success indicator in the proposal: which order is more likely to achieve it based on evidence or comparable past experience?',
            },
            {
              ar: 'تقسمان: تبدأ الجلسة الأولى بطريقتك والثانية بطريقتها ثم تقيسان',
              en: 'Split it: the first session runs your way, the second hers, then you measure',
            },
            {
              ar: 'تتركان القرار للمنسّق الذي لم يحضر الاجتماع لأنه الأعلى سلطةً',
              en: 'Leave the decision to the coordinator who was not at the meeting because he has the highest authority',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'التصويت يحلّ التوتر دون أن يحلّ السؤال — الأغلبية في الرأي التربوي ليست دليلاً. والتقسيم يجعل كل جلسة تجربة منفصلة بدلاً من خطة متّسقة. والمنسّق الغائب لا يملك من السياق ما يملكه من حضر. العودة إلى الهدف المتّفق عليه مسبقاً هي الطريقة الوحيدة للفصل بين رأيَين متساويَي القيمة بدليل بدلاً من قوّة.',
            en: 'Voting resolves tension without resolving the question — a majority on a pedagogical matter is not evidence. Splitting makes each session a separate experiment rather than a coherent plan. The absent coordinator lacks the context of those who were present. Returning to the pre-agreed objective is the only way to decide between two equally valid views with evidence rather than power.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'l3ch-event',
      tag: { ar: 'المرحلة الرابعة', en: 'Phase 4' },
      title: { ar: 'تنفيذ الفعالية وحالة حماية مفاجئة', en: 'Running the Event and an Unexpected Safeguarding Case' },
      lede: {
        ar: 'الفعالية تسير وفق الخطة. ثم يحدث شيء لم يكن في أي خطة.',
        en: 'The event is running according to plan. Then something happens that was in no plan.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'وصل ثلاثون مشاركاً. الجلسة الأولى انتهت بشكل جيد وبدت ردود الفعل إيجابية. في الاستراحة، تُقاربك فتاة في السادسة عشرة تُدعى ليلى وتقول لك بصوت منخفض: «في شخص بالغ يراسلني على التطبيق ويطلب صوري الشخصية. قلت له لا، لكنه يصرّ ومش وقّف». تبدو مرتبكة وقلقة، وتضيف: «ما حكيت لحدا لأني ما بعرف إذا هاد موضوع كبير ولا بسيط».\n\nهذا الموقف يشمل ثلاثة أبعاد في آنٍ واحد: حماية ليلى في اللحظة الراهنة بإشعارها بالأمان وعدم إعادتها إلى التجربة بالأسئلة، وضمان تدوين ما قالته بكلماتها الدقيقة دون إضافة أو حذف، وإحالة الموضوع فوراً إلى القناة المعنية — كل ذلك دون أن تتوقّف الفعالية أو يشعر بقية المشاركين بأن شيئاً استثنائياً يحدث. إدارة هذه الأبعاد الثلاثة معاً أثناء تشغيل فعالية قائمة هو بالضبط ما يمتحنك عليه هذا التحدّي في هذه المرحلة.',
            en: 'Thirty participants have arrived. The first session ended well and reactions seemed positive. During the break, a sixteen-year-old called Layla approaches you and says quietly: "There is an adult messaging me on the app asking for my personal photos. I told him no but he keeps insisting and won\'t stop." She looks confused and anxious, adding: "I haven\'t told anyone because I didn\'t know if this is a big deal or not."\n\nThis situation has three dimensions at once: protecting Layla right now by making her feel safe and not returning her to the experience with questions; ensuring that what she said is recorded in her exact words without addition or omission; and referring the matter immediately to the appropriate channel — all without stopping the event or making the other participants feel that something exceptional is happening. Managing these three dimensions together while running an ongoing event is exactly what this challenge tests at this phase.',
          },
        },
        {
          type: 'quiz',
          id: 'l3ch-q7',
          label: { ar: 'حالة حماية', en: 'Safeguarding case' },
          question: {
            ar: 'ليلى تنتظر ردّك. ما أوّل شيء تفعله؟',
            en: 'Layla is waiting for your response. What is the first thing you do?',
          },
          options: [
            {
              ar: 'تسألها عن اسم الشخص وما طلبه بالتحديد لتقدير خطورة الوضع قبل أن تقرّر الإبلاغ',
              en: 'Ask her the person\'s name and exactly what he requested in order to assess the seriousness before deciding whether to report',
            },
            {
              ar: 'تشكرها على ثقتها، تُطمئنها أنك ستتابع الأمر، تدوّن ما قالته بكلماتها بدون أسئلة إضافية، وتبلّغ مسؤول الحماية قبل نهاية الفعالية',
              en: 'Thank her for trusting you, reassure her you will follow up, write down exactly what she said in her own words without extra questions, and report to the safeguarding focal point before the event ends',
            },
            {
              ar: 'توقف الفعالية فوراً وتجمع الفريق لمناقشة الموضوع والتقرير ما يجب فعله',
              en: 'Stop the event immediately and gather the team to discuss the matter and decide what to do',
            },
            {
              ar: 'تتّصل بوالديها الآن لإعلامهم بما أخبرتك به',
              en: 'Call her parents now to inform them of what she told you',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'السؤال عن التفاصيل — مهما بدت نيّته جيدة — يحوّل المتطوّع إلى محقّق، وهو ليس دوره ولم يتدرّب عليه، وقد يُلحق أذىً نفسياً إضافياً بليلى بإعادتها إلى التجربة. إيقاف الفعالية ينشر الخبر على المشاركين ويُعرّض خصوصيتها للخطر. الاتصال بالوالدين قد يُعقّد الوضع تعقيداً بالغاً إن كان أحدهم مصدر الخطر أو مرتبطاً بالشخص المعني. ما على المتطوّع: الاستماع بلطف، التدوين الدقيق، الإحالة الفورية — والبقاء متاحاً لليلى.',
            en: 'Asking for details — however well-intentioned — turns the volunteer into an investigator, which is not their role and for which they have no training, and may cause Layla additional psychological harm by making her relive the experience. Stopping the event shares the matter with participants and risks her privacy. Calling the parents may seriously complicate matters if one of them is the source of danger or connected to the person in question. What the volunteer should do: listen calmly, record accurately, refer immediately — and remain available to Layla.',
          },
        },
        {
          type: 'quiz',
          id: 'l3ch-q8',
          label: { ar: 'حالة حماية', en: 'Safeguarding case' },
          scenario: {
            ar: 'بعد أن أبلغت مسؤول الحماية، زميلتك في الفريق سمعت جزءاً من حديثك مع ليلى وتسألك بقلق: «ما اللي صار؟ في مشكلة؟ أقدر أساعد؟»',
            en: 'After you have reported to the safeguarding focal point, a teammate overheard part of your conversation with Layla and asks you with concern: "What happened? Is there a problem? Can I help?"',
          },
          question: {
            ar: 'ماذا تقول لها؟',
            en: 'What do you tell her?',
          },
          options: [
            {
              ar: 'تشرح لها القصة كاملة — هي زميلة ثقة وتستحق أن تعلم حتى تكون في صورة الوضع',
              en: 'Explain the full situation — she is a trusted colleague and deserves to know to stay informed',
            },
            {
              ar: 'تقول لها: «هناك موضوع أحلته إلى الجهة المعنية وسيُتابَع — هذا كل ما أستطيع قوله الآن»',
              en: 'Tell her: "There is a matter I have referred to the right person and it will be followed up — that is all I can say right now"',
            },
            {
              ar: 'تنكر أن شيئاً حدث لإبقاء الأجواء مريحة وتجنّب القلق في الفريق',
              en: 'Deny that anything happened to maintain comfort and avoid anxiety in the team',
            },
            {
              ar: 'تطلب منها أن تذهب وتسأل ليلى مباشرةً لأنها ربما تفيد في التحقيق',
              en: 'Ask her to go speak directly to Layla because she might help in the investigation',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الإفصاح الكامل لزميلة ليس لديها صلاحية الاطّلاع على الموضوع ينتهك سرية ليلى — ولو كانت النية المساعدة. الإنكار كذب سيُكشف لاحقاً ويضرّ بالثقة. وإرسال الزميلة لتسأل ليلى يُعيدها إلى التجربة التي حاولت مشاركتها بشكل آمن واحد فقط. العبارة المختصرة تُقرّ بوجود موضوع يُعالَج دون كشف تفاصيله — وهي الاستجابة التي تحفظ سرية المُبلِّغة وتُبقي الفريق هادئاً في آنٍ واحد.',
            en: 'Full disclosure to a colleague without authority over the matter violates Layla\'s confidentiality — even with helpful intentions. Denial is a lie that will be uncovered and damages trust. Sending the colleague to ask Layla returns her to the experience she tried to share safely in only one conversation. The brief phrase acknowledges that a matter is being handled without revealing its details — and that is the response that protects the reporter\'s confidentiality and keeps the team calm at the same time.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'l3ch-eval',
      tag: { ar: 'المرحلة الخامسة', en: 'Phase 5' },
      title: { ar: 'التقييم والمساءلة', en: 'Evaluation and Accountability' },
      lede: {
        ar: 'انتهت الفعالية. المبادرة لم تنتهِ — ما يحدث الآن يحدّد إن كانت تستحقّ التكرار والبناء عليها.',
        en: 'The event is over. The initiative is not — what happens now determines whether it deserves to be repeated and built upon.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التقييم ليس خطوة إجبارية لإغلاق الملف الورقي — هو الأداة التي تُعيد الجمعية إلى المجتمع بسؤال حقيقي وصادق: هل فعلنا ما قلنا سنفعله، وهل أحدثنا الأثر الذي وعدنا به لمن وعدناهم؟\n\nالتقييم الجيّد يبدأ قبل الفعالية بتوثيق خطّ الأساس: ما مستوى المشارك قبل التدخّل؟ وينتهي بعدها بقياس التغيير: ما الذي تغيّر فعلاً ولمن وبأي درجة ولماذا؟ وبينهما يتابع التنفيذ بحثاً عن الفجوات: ما الذي لم ينجح كما خُطِّط وهل يمكن التصحيح في الوقت الفعلي؟\n\nمساءلة المتطوّع أمام المجتمع تعني الإجابة بأمانة على ثلاثة أسئلة: هل وصلنا فعلاً إلى من أردنا الوصول إليه أم وصلنا إلى الأسهل وصولاً؟ هل قدّمنا ما وعدنا به أم تراجعنا عن جزء منه دون إبلاغ؟ وهل أضرّت مبادرتنا بأحد من حيث لم نتوقّع؟ السؤال الثالث هو الأصعب لأن الإجابة عليه بـ«لا» تتطلّب جهداً استقصائياً حقيقياً لا مجرّد غياب الشكاوى الرسمية. وقبل أن تُغلق الملف، المجتمع الذي مُثِّل في التقييم الأولي يجب أن يُشارك في قراءة النتائج — لأنه الطرف الوحيد الذي يستطيع أن يُخبرك إن كانت ما تُسمّيه «نجاحاً» يتطابق مع ما عاشه.',
            en: 'Evaluation is not a mandatory step to close a paper file — it is the tool that returns the association to the community with a genuine and honest question: did we do what we said we would, and did we produce the impact we promised to those we promised it to?\n\nGood evaluation begins before the event by documenting a baseline: what was the participant\'s level before the intervention? It ends afterwards by measuring change: what actually changed, for whom, to what degree, and why? Between those two points it monitors delivery for gaps: what did not go as planned and can it be corrected in real time?\n\nVolunteer accountability to the community means honestly answering three questions: did we actually reach who we intended to reach, or did we reach whoever was easiest to reach? Did we deliver what we promised, or did we step back from part of it without communicating? And did our initiative harm anyone in ways we did not anticipate? The third is the hardest, because answering it with "no" requires genuine investigative effort, not merely the absence of formal complaints. And before closing the file, the community represented in the initial assessment must participate in reading the findings — because they are the only party who can tell you whether what you call "success" matches what they experienced.',
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'خطأ شائع في تقارير المبادرات', en: 'A common mistake in initiative reports' },
          content: {
            ar: 'كثير من التقارير تحسب «النجاح» بعدد الحاضرين وعدد الجلسات المنجزة. هذان رقمان للعمليات، لا للأثر. التقرير الذي يقتصر عليهما يُثبت أن شيئاً حدث — لا أن أحداً استفاد. والفرق بين الاثنين هو الفرق بين المساءلة والإدارة.',
            en: 'Many reports count "success" by number of attendees and sessions delivered. These are operational figures, not impact figures. A report limited to them proves that something happened — not that anyone benefited. The difference between the two is the difference between accountability and administration.',
          },
        },
        {
          type: 'quiz',
          id: 'l3ch-q9',
          label: { ar: 'قرار التقييم', en: 'Evaluation decision' },
          scenario: {
            ar: 'تكتب التقرير النهائي. حضر ثمانية وعشرون من أصل ثلاثين مستهدَفاً. لكن في جلستَي المهارات العملية لم يُكمل تمارين التقييم الختامي إلا خمسة عشر منهم. المنسّق يقول: «اكتب أن المبادرة حقّقت أهدافها — الحضور كان ممتازاً».',
            en: 'You are writing the final report. Twenty-eight of thirty targets attended. But in the practical skills sessions only fifteen completed the final assessment exercises. The coordinator says: "Write that the initiative achieved its objectives — attendance was excellent."',
          },
          question: {
            ar: 'ماذا تكتب في التقرير؟',
            en: 'What do you write in the report?',
          },
          options: [
            {
              ar: 'تكتب ما طلبه المنسّق — الحضور فعلاً كان جيداً وهو المؤشّر الأساسي',
              en: 'Write what the coordinator asked — attendance genuinely was good and is the main indicator',
            },
            {
              ar: 'تكتب الأرقام الحقيقية: حضور مرتفع (٢٨/٣٠)، اكتمال تمرين التقييم جزئي (١٥/٣٠)، وتُحلّل الفجوة وتقترح معالجتها في الجولة القادمة',
              en: 'Write the real numbers: high attendance (28/30), partial assessment completion (15/30), analyse the gap and suggest addressing it in the next round',
            },
            {
              ar: 'تؤجّل كتابة التقرير حتى تتّضح أسباب عدم إكمال الخمسة عشر',
              en: 'Delay writing the report until the reasons the fifteen did not complete are clear',
            },
            {
              ar: 'تُرسل التقرير بدون أرقام التقييم «تجنّباً للالتباس»',
              en: 'Submit the report without the assessment numbers "to avoid confusion"',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'التقرير الذي يُخفي فجوة المهارات يحرم الجمعية من المعلومة التي تُحسّن المبادرة التالية — والمستفيدين الخمسة عشر الذين لم يُكملوا سيخسرون مرة ثانية. تأجيل الكتابة يُفقد الذاكرة الحية لما حدث بالفعل. وحذف أرقام التقييم تحت أي مسمّى تضليل متعمّد. الأرقام الحقيقية مع التحليل هي ما يجعل التقرير أداة مؤسّسية لا مجرّد وثيقة تُثبت أن المشروع نُفِّذ.',
            en: 'A report that hides the skills gap deprives the association of the information that improves the next initiative — and the fifteen who did not complete will lose out a second time. Delaying writing loses the living memory of what actually happened. Omitting evaluation numbers under any label is deliberate misleading. Real numbers with analysis are what turn a report into an institutional tool rather than a document proving that a project was run.',
          },
        },
        {
          type: 'quiz',
          id: 'l3ch-q10',
          label: { ar: 'قرار التقييم', en: 'Evaluation decision' },
          scenario: {
            ar: 'بعد رفع التقرير، يُقدّم أحد المشاركين شكوى رسمية: يقول إن الجلسة الثانية كانت بعيدة عن احتياجه وأن الوقت الثمين ضاع. أنت تعتقد شخصياً أن الجلسة كانت جيدة وأن الشكوى مبالغ فيها، وأن بقية المشاركين كانوا راضين.',
            en: 'After submitting the report, one participant files a formal complaint: he says the second session was irrelevant to his needs and wasted his valuable time. You personally believe the session was good and the complaint is exaggerated, and that the rest of the participants were satisfied.',
          },
          question: {
            ar: 'كيف تتعامل مع الشكوى؟',
            en: 'How do you handle the complaint?',
          },
          options: [
            {
              ar: 'تردّ عليه أن التقييمات الأخرى كانت إيجابية وأن رأيه لا يمثّل الأغلبية',
              en: 'Reply that other evaluations were positive and his view does not represent the majority',
            },
            {
              ar: 'تُسجّل الشكوى في النظام الرسمي، تشكره على ملاحظته، تتحقّق إن كانت تكشف عن فجوة في التقييم الأولي لم تنتبه لها، وتُدرجها في توصيات الجولة القادمة',
              en: 'Log the complaint in the formal system, thank him for his feedback, check whether it reveals a gap in the initial assessment you missed, and include it in the next round\'s recommendations',
            },
            {
              ar: 'تتجاهلها لأن المبادرة انتهت ولا شيء يمكن تغييره في هذه المرحلة',
              en: 'Ignore it because the initiative is over and nothing can be changed at this stage',
            },
            {
              ar: 'تعتذر منه وتعده بجلسة تعويضية خاصة به في أقرب وقت',
              en: 'Apologise and promise him a personal compensatory session as soon as possible',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الردّ بالأغلبية يُسكت الصوت بدلاً من أن يُجيب عليه — وهذا بالضبط ما تهدف آلية الشكاوى إلى منعه. التجاهل يُفقد الشكوى قيمتها المؤسّسية كاملةً. والوعد بجلسة شخصية تعويضية خارج ما تملك صلاحية تقديمه وعدٌ لا يمكنك الوفاء به وحدك. آلية الشكاوى لا توجد للدفاع عمّا أُنجز — بل للاستماع لما لم يُنجَز وتحويله إلى تحسين. شكوى واحدة تُقرأ بعناية تساوي أحياناً أكثر من خمسة تقييمات إيجابية من حيث ما تُعلّمك إيّاه.',
            en: 'Responding with the majority silences the voice rather than answering it — and that is exactly what a complaints mechanism is designed to prevent. Ignoring it strips the complaint of its entire institutional value. Promising a personal compensatory session is a promise outside your authority to deliver alone. A complaints mechanism does not exist to defend what was done — but to hear what was not and turn it into improvement. One carefully read complaint is sometimes worth more than five positive evaluations in terms of what it teaches you.',
          },
        },
        {
          type: 'quiz',
          id: 'l3c-q11',
          label: { ar: 'قرار متكامل', en: 'Integrated decision' },
          scenario: {
            ar: 'أنت منسّق الفعالية وأحد المتطوّعين الجدد يُظهر تصرّفات غير ملائمة مع مشاركين صغار السن — لمسات غير ضرورية أثناء الألعاب والتواجد قريباً منهم أكثر مما يستدعي الموقف. لم يشكُ أحد بعد. الفعالية مستمرة ولا تزال أمامك ساعتان.',
            en: 'You are the event coordinator and a new volunteer is displaying inappropriate behaviour with younger participants — unnecessary physical contact during games and staying closer to them than the situation requires. No one has complained yet. The event is still running with two hours remaining.',
          },
          question: {
            ar: 'ماذا تفعل؟',
            en: 'What do you do?',
          },
          options: [
            {
              ar: 'تنتظر حتى تتأكّد أكثر أو تصلك شكوى رسمية قبل التحرّك',
              en: 'Wait until you are more certain or receive a formal complaint before acting',
            },
            {
              ar: 'تُبعد المتطوّع بهدوء عن تلك المجموعة فوراً، تُدوّن ما لاحظته بدقة، وتُبلّغ مسؤول الحماية قبل نهاية الفعالية — بصرف النظر عن غياب الشكوى الرسمية',
              en: 'Quietly move the volunteer away from that group immediately, record what you observed precisely, and report to the safeguarding focal point before the event ends — regardless of the absence of a formal complaint',
            },
            {
              ar: 'تتكلّم مع المتطوّع بشكل غير مباشر وتُنبّهه دون تدوين أي شيء',
              en: 'Talk to the volunteer indirectly and warn them without recording anything',
            },
            {
              ar: 'تسأل الأطفال أنفسهم إن كانوا يشعرون بعدم الارتياح قبل أن تتحرّك',
              en: 'Ask the children themselves whether they feel uncomfortable before taking action',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'انتظار الشكوى الرسمية في حالات الحماية معيار خاطئ لبدء الإجراء — الحماية تعمل على أساس الخطر المحتمل لا الضرر الموثّق. التنبيه غير الرسمي دون توثيق يترك الموقف بلا سجل إن تكرّر لاحقاً. وسؤال الأطفال مباشرةً يُعيد عليهم العبء ويتحوّل إلى استجواب غير مُدرَّب. الإجراء الصحيح يجمع الثلاثة: إبعاد فوري صامت، توثيق دقيق، وإبلاغ مسؤول الحماية — مبدأ تعلّمته من الحماية والتوثيق وإدارة الفريق في المستوى الثالث.',
            en: 'Waiting for a formal complaint in safeguarding cases is the wrong threshold for action — safeguarding operates on potential risk, not documented harm. An informal warning without documentation leaves no record if the situation recurs. Asking the children directly transfers the burden back to them and becomes an untrained interrogation. The correct response combines all three: an immediate quiet removal, precise documentation, and reporting to the safeguarding focal point — applying safeguarding, documentation, and team management principles from level three.',
          },
        },
        {
          type: 'quiz',
          id: 'l3c-q12',
          label: { ar: 'قرار متكامل', en: 'Integrated decision' },
          scenario: {
            ar: 'بعد انتهاء المبادرة بشهر، التقيت بمجموعة من السكان الذين شاركوا في تقييم الاحتياج الأوّل. أفادوا أن البرنامج لا يعكس ما طلبوه في التقييم — وأن بعض الأنشطة كانت مُصمَّمة لفئة مختلفة عنهم. عند مراجعة السجلّات اكتشفت أن قرار تغيير التصميم اتُّخذ في مرحلة كتابة المقترح دون العودة إليهم.',
            en: 'A month after the initiative ended, you met residents who participated in the original needs assessment. They reported that the programme delivered did not reflect what they requested — and that some activities were designed for a different group. Reviewing your records, you found that the decision to change the design was made during the proposal-writing stage without returning to them.',
          },
          question: {
            ar: 'ما الذي يجب أن يتغيّر في الدورة القادمة؟',
            en: 'What must change in the next cycle?',
          },
          options: [
            {
              ar: 'تُضيف خطوة تحقّق مع المجتمع بعد كتابة المقترح مباشرةً — قبل تقديمه — للتأكّد من أن التصميم النهائي يعكس ما أُفيد به في التقييم',
              en: 'Add a community verification step immediately after writing the proposal — before submitting it — to confirm the final design reflects what was reported in the assessment',
            },
            {
              ar: 'تُجري تقييم احتياج أطول في المرة القادمة لجمع بيانات أكثر',
              en: 'Conduct a longer needs assessment next time to gather more data',
            },
            {
              ar: 'تُعطي المجتمع دوراً في تحرير المقترح النهائي كاملاً',
              en: 'Give the community a role in editing the full final proposal',
            },
            {
              ar: 'تبدأ التنفيذ من تقييم الاحتياج مباشرةً بلا مقترح مكتوب لتجنّب الانفصال بين المرحلتين',
              en: 'Begin implementation directly from the needs assessment without a written proposal to avoid the disconnect between stages',
            },
          ],
          correct: 0,
          feedback: {
            ar: 'جمع بيانات أكثر لا يحلّ المشكلة إذا كان التصميم تغيّر بعد جمعها دون إبلاغ المجتمع. وإشراك المجتمع في تحرير المقترح كاملاً خطوة غير عملية في معظم السياقات وتتجاوز الدور المناسب له. وإلغاء المقترح المكتوب يُفقد الفريق الإطار المحاسبي الضروري. الخلل كان في الانقطاع بين التقييم والتصميم النهائي — والحلّ خطوة تحقّق مع المجتمع في نهاية مرحلة المقترح لا تغيير المراحل كلياً. هذا ما يكشفه التكامل بين تقييم الاحتياج والمقترح والتقييم النهائي في المستوى الثالث.',
            en: 'Gathering more data does not solve the problem if the design changed after gathering it without informing the community. Involving the community in editing the full proposal is impractical in most contexts and exceeds the appropriate role for this stage. Eliminating the written proposal removes the accountability framework the team needs. The flaw was in the disconnection between assessment and final design — the solution is a community verification step at the end of the proposal stage, not a complete overhaul of phases. This is what integration between needs assessment, proposal design, and final evaluation at level three reveals.',
          },
        },
      ],
    },
  ],
};
