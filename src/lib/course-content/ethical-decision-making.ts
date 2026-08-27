import type { CourseContent } from './types';

/**
 * Level 5 core — Ethical Decision-Making and Risk. Pass mark 70.
 *
 * Written around one uncomfortable fact: most volunteers who make decisions
 * they later regret were not careless or indifferent. They were busy, they
 * were sure, and they were human. Speed collapses the gap between instinct
 * and judgement and leaves the instinct standing. This course does not try
 * to eliminate instinct — it builds a practice of slowing the first two
 * seconds, naming the actual decision, and recording why you chose as you did.
 *
 * The five modules follow the arc of a single decision: identifying what is
 * actually being asked, finding and evaluating alternatives, catching your own
 * biases before they catch you, acting under pressure without eliminating
 * reflection, and writing the reason down so that the next decision-maker —
 * including your future self — benefits from what you learned.
 */

export const ethicalDecisionMaking: CourseContent = {
  slug: 'ethical-decision-making',
  level: 5,
  minutes: 40,
  passMark: 70,
  title: {
    ar: 'اتّخاذ القرار الأخلاقي وإدارة المخاطر',
    en: 'Ethical Decision-Making and Risk',
  },
  lede: {
    ar: 'حين تتعارض السرعة مع الدقّة، والمصلحة مع المبدأ. كيف تقرّر تحت الضغط، وكيف توثّق سبب قرارك.',
    en: 'When speed conflicts with accuracy, and interest with principle. How to decide under pressure, and how to record why you decided.',
  },
  outcomes: {
    ar: [
      'تحدّد القرار المطلوب فعلاً وتجمع ما يكفي من المعلومات',
      'تُقيّم بدائل وتفهم أثر كل منها على أصحاب المصلحة',
      'تتعرّف على تحيّزاتك في القرار تحت الضغط',
      'توثّق سبب القرار وتراجعه بعد التنفيذ',
    ],
    en: [
      'Identify the decision actually being asked and gather enough to make it',
      'Weigh alternatives and understand each one\'s effect on the people involved',
      'Recognise your own biases when deciding under pressure',
      'Record why you decided, and review it after delivery',
    ],
  },
  sources: [
    'ICRC — Professional Standards for Protection Work (2018)',
    'Core Humanitarian Standard on Quality and Accountability (2024)',
    'UN Volunteers — Ethical Framework for Volunteer Engagement',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'edm-m1',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'تحديد القرار الصحيح وجمع ما يكفي', en: 'Defining the right decision and gathering enough' },
      lede: {
        ar: 'أكثر القرارات خطأً لا تبدأ بخيار سيّئ — تبدأ بسؤال خاطئ أو بمعلومة واحدة ناقصة.',
        en: 'Most wrong decisions do not start with a bad choice — they start with the wrong question or one missing piece of information.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'قبل أن تقرّر أيّ بديل تختار، عليك أن تتأكّد أنك تعرف ما القرار المطلوب منك فعلاً. هذا يبدو بديهياً، لكنه في الممارسة اليومية أحد أكثر الأخطاء شيوعاً في بيئات العمل الإنساني والتطوّعي. حين يقترب منك شخص بمشكلة، ما تسمعه في الجملة الأولى هو في الغالب عَرَض من أعراض القرار الحقيقي، وليس القرار نفسه. عائلة تطلب مساعدة عاجلة في السكن قد تكون في الواقع بحاجة إلى قرار يخصّ وضعها القانوني أولاً، وتوفير السكن من دون معالجة الوضع القانوني قد يُعرّضها لخطر أكبر مما كانت فيه. متطوّع يُبلّغ عن خلاف داخل الفريق قد يكون ما يحتاجه فعلاً ليس وساطةً اجتماعية بل قراراً مؤسّسياً يخصّ حدود الأدوار والمسؤوليات. الفجوة بين «ما طُلب مني» وبين «ما القرار الفعلي الذي يحتاجه الوضع» هي المكان الذي تُرتكب فيه أكثر أخطاء المتطوّعين ذوي النيّة الحسنة.',
            en: 'Before deciding which alternative to choose, you need to be sure you know what decision is actually being asked of you. This sounds obvious but is in daily practice one of the most common errors in humanitarian and volunteer settings. When someone approaches you with a problem, what you hear in the first sentence is usually a symptom of the real decision, not the decision itself. A family asking for urgent housing support may actually need a decision about their legal status first, and providing housing without addressing that may expose them to greater risk than before. A volunteer reporting a team conflict may need not social mediation but an institutional decision about role boundaries and responsibilities. The gap between "what was asked of me" and "what decision this situation actually needs" is where most errors from well-intentioned volunteers occur.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'اسأل نفسك: «ما الذي يتغيّر فعلاً بحسب ما أقرّره؟» — إن كانت الإجابة غير واضحة، فالقرار لم يُحدَّد بعد وأنت تخطو قبل أن تعرف إلى أين',
              'افرّق بين القرار الفوري الذي يقع ضمن صلاحياتك وبين قرار يستوجب رفعه لمرجع أعلى أو استشارة زميل متخصّص — ليس كل موقف يتوقّع منك أن تُحسمه وحدك',
              'اسأل الشخص أمامك: «ما الذي تحتاج أن يحدث بالضبط ومتى؟» — الإجابة على هذين السؤالين كثيراً ما تُعيد تعريف القرار بأكمله وتُغيّر من ينبغي أن يتّخذه',
              'تأكّد أنك تملك صلاحية هذا القرار قبل أن تبدأ في تحليل خياراته — اتّخاذ قرار خارج الصلاحية لا يُحلّ المشكلة بل يُضيف مشكلة جديدة',
              'إن كان القرار يخصّ أكثر من شخص أو أكثر من فريق أو يُلزم المنظمة بالتزام لم يُفوَّض إليك، لا تقرّره منفرداً حتى لو ضغط الوقت',
            ],
            en: [
              'Ask yourself: "What actually changes based on what I decide?" — if the answer is unclear the decision has not been defined yet and you are moving before you know where',
              'Distinguish between an immediate decision within your authority and one requiring escalation or consultation with a specialist — not every situation expects you to resolve it alone',
              'Ask the person in front of you: "What exactly do you need to happen, and when?" — answers to both often redefine the decision entirely and change who should make it',
              'Confirm you have authority over this decision before analysing its options — deciding outside your authority does not solve the problem but adds a new one',
              'If the decision involves more than one person or team, or commits the organisation to something not delegated to you, do not make it alone even if time is pressing',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'جمع المعلومات لا يعني الانتظار اللانهائي', en: 'Gathering information does not mean waiting indefinitely' },
          content: {
            ar: 'هناك حدّ أدنى من المعلومات بدونه أي قرار هو مجرّد قمار مُموَّه بيقين، وهناك حدّ فوقه مزيد من المعلومات لا يُغيّر الخيار الذي ستختاره بل يُعطّله ويمنحك شعوراً بالفاعلية الكاذبة. المهارة هي معرفة أيّ المعلومات حاسمة وأيّها هامشي يمكن الاستغناء عنه. حين يضيق الوقت، اسأل: «هل ما أفتقر إليه الآن سيُغيّر قراري إن حصلت عليه؟» إن كانت الإجابة لا، تقدّم بما لديك.',
            en: 'There is a minimum of information below which any decision is a gamble disguised as certainty, and a level above which more information does not change the option you would choose but delays and grants a false sense of activity. The skill is knowing which information is decisive and which is marginal. When time narrows, ask: "Would what I am missing right now change my decision if I had it?" If the answer is no, move with what you have.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'جمع المعلومات الكافية لا يعني جمع كل المعلومات الممكنة، ولا يعني تأجيل القرار حتى تُزال كل حالة غموض. في بيئات العمل الإنساني والتطوّعي تحديداً، كثيراً ما تتعامل مع وضع يتغيّر بسرعة والناس أمامك بحاجة ماسّة إلى استجابة الآن وليس غداً. المعلومة الحاسمة هي تلك التي لو حصلت عليها لاخترت خياراً مختلفاً: معرفة أن عائلة تملك جنسية مزدوجة قد يُغيّر كلياً الخيارات المتاحة أمامها؛ معرفة لون الوثيقة التي تحملها لن يُغيّر شيئاً. تمرّن على التفريق بين هذين النوعين من المعلومات لأنك في الميدان ستُغرق بكم هائل من المعلومات في آنٍ واحد. ما يُميّز المقرِّر الجيّد ليس أنه يعرف أكثر — بل أنه يُحدّد بسرعة ما هو جوهري ويتّخذ القرار بناءً عليه، ويُدوّن ما ظلّ غامضاً ليراجعه لاحقاً بدل أن يتظاهر بأنه عرف كل شيء.',
            en: 'Gathering enough information does not mean gathering every possible piece, nor postponing the decision until every ambiguity is removed. In humanitarian and volunteer settings especially, you often deal with situations that change quickly and the people before you need a response now not tomorrow. The decisive piece of information is the one whose possession would lead you to choose differently: knowing a family holds dual nationality may completely change the options available; knowing the colour of the document they carry changes nothing. Train yourself to distinguish these two kinds of information, because in the field you will be flooded with vast quantities of data at once. What marks a good decision-maker is not knowing more — it is quickly identifying what is essential, deciding on it, and noting what remained unclear rather than pretending they knew everything.',
          },
        },
        {
          type: 'quiz',
          id: 'edm-q1',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'يُبلّغك متطوّع عن أن مستفيدَيْن في البرنامج يتشاجران بشكل متكرّر ويطلب منك اتّخاذ قرار فوري. ما أول خطوة؟',
            en: 'A volunteer tells you two programme beneficiaries are repeatedly arguing and asks you for an immediate decision. What is your first step?',
          },
          options: [
            {
              ar: 'تُقرّر فصل المستفيدَيْن عن بعضهما في الأنشطة فوراً لتهدئة الموقف، فإيقاف الاحتكاك بينهما أسرع ما يُعيد النشاط إلى مساره ويمنع تصاعد الخلاف أمام بقية المشاركين',
              en: 'Immediately decide to separate the two beneficiaries in activities to calm things down, since stopping the friction between them is the fastest way to get the activity back on track and prevent the dispute escalating in front of the other participants',
            },
            {
              ar: 'تُحدّد أولاً ما القرار المطلوب منك فعلاً: هل هو قرار تشغيلي يومي أم حالة تحتاج تقييماً اجتماعياً متخصّصاً بصلاحية مختلفة',
              en: 'First identify what decision is actually being asked: is it a daily operational call or a situation needing specialist social assessment with different authority',
            },
            { ar: 'تُبلّغ الإدارة فوراً وتتجنّب الدخول في الموضوع', en: 'Report immediately to management and avoid getting involved' },
            {
              ar: 'تتحدّث إلى كل مستفيد على انفراد وتحاول التوصّل إلى حلّ، فالاستماع لكل طرف على حدة يكشف جذر الخلاف ويسمح بتسويته ودّياً قبل أن يصبح ملفّاً رسمياً',
              en: 'Speak privately to each beneficiary and try to reach a solution, since hearing each side separately reveals the root of the dispute and lets you settle it amicably before it becomes a formal case',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'التدخّل الفوري بقرار تشغيلي قد يُحلّ العَرَض ويُغطّي المشكلة الأعمق. والإبلاغ الفوري دون تحديد طبيعة الحالة يضع الإدارة في المعضلة نفسها. التحدّث إليهما مفيد لجمع المعلومات لكنه ليس القرار. تحديد ما القرار المطلوب أولاً يُحدّد من يملك الصلاحية لاتّخاذه وبأيّ معلومات وفي أيّ وقت.',
            en: 'Immediate operational intervention may resolve the symptom and conceal the deeper problem. Reporting immediately without defining the nature of the situation puts management in the same dilemma. Speaking to them is useful for gathering information but it is not the decision. Identifying what decision is needed first determines who has the authority to make it, with what information, and at what point.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'edm-m2',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'تقييم البدائل وأثرها على أصحاب المصلحة', en: 'Weighing alternatives and their effect on stakeholders' },
      lede: {
        ar: 'البديل الذي لا يبدو بديلاً هو عادةً الأهمّ — وهو أوّل ما يُستبعد تحت الضغط.',
        en: 'The alternative that does not look like one is usually the most important — and the first to be dismissed under pressure.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'القرار الأخلاقي لا يعني دائماً اختيار البديل الأقلّ سوءاً من بين خيارَيْن سيّئَيْن — وإن كان هذا أحياناً ما تصل إليه بعد التفكير الجادّ. يعني في المقام الأول التأكّد من أنك عرضت على نفسك كل البدائل الممكنة قبل أن تُقلّص القائمة. الميل الطبيعي تحت الضغط هو الانتقال سريعاً إلى أول بديلَيْن يخطران على البال ومقارنتهما فحسب. هذا الميل لا يُفضي دائماً إلى خطأ، لكنه يُغفل بانتظام البدائل الأكثر إبداعاً والأقل وضوحاً التي كانت ستُجنّبك الكلفة كلياً. كثيراً ما يكون البديل المُغفَل هو «لا أقرّر الآن وأجمع معلومة ناقصة» أو «أُحيل هذا الأمر لشخص يملك صلاحية أوسع» أو «أطلب من طرف ثالث محايد المشاركة». هذه ليست تهرّباً من المسؤولية — هي بدائل مشروعة تُقيَّم كالبدائل الأخرى.',
            en: 'An ethical decision does not always mean choosing the least bad option from two bad ones — even though that is sometimes where you arrive after serious thought. It means first making sure you have laid out all possible alternatives before narrowing the list. The natural tendency under pressure is to quickly move to the first two alternatives that come to mind and compare only those. This tendency does not always lead to error, but it regularly overlooks the more creative or less obvious alternatives that would have avoided the cost entirely. Often the overlooked alternative is "I do not decide now and gather a missing piece", "I refer this to someone with broader authority", or "I ask a neutral third party to participate". These are not evasions of responsibility — they are legitimate alternatives to be evaluated like any other.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'أصحاب المصلحة المباشرون', en: 'Direct stakeholders' },
              text: {
                ar: 'من يتأثّر مباشرةً بنتيجة قرارك: المستفيد، أسرته، الفريق المنفّذ. أثر قرارك عليهم هو الأكثر وضوحاً وعادةً الأسهل في القياس والتوقّع، لكنه لا يُمثّل الصورة كاملة.',
                en: 'Those directly affected by your decision outcome: the beneficiary, their family, the implementing team. The effect on them is the most visible and usually the easiest to measure and anticipate, but it does not represent the full picture.',
              },
            },
            {
              title: { ar: 'أصحاب المصلحة غير المباشرين', en: 'Indirect stakeholders' },
              text: {
                ar: 'من يتأثّر بنتيجتك دون أن يكون طرفاً في القرار: المجتمع المحلّي، المنظمات الشريكة، الجهات الممولة، والمستفيدون الآخرون في البرنامج. إغفالهم يُنشئ مخاطر ثانوية تظهر لاحقاً ولا يُمكن التنبّؤ بها بسهولة.',
                en: 'Those affected by your outcome without being party to the decision: the local community, partner organisations, donors, and other programme beneficiaries. Overlooking them creates secondary risks that appear later and cannot be easily anticipated.',
              },
            },
            {
              title: { ar: 'البُعد الزمني للأثر', en: 'The time dimension of impact' },
              text: {
                ar: 'ما يبدو صحيحاً ومريحاً اليوم قد يُنشئ تعارضاً أو ضرراً بعد أسبوع أو شهر. في كل تقييم للبدائل، اسأل: ما الذي سيكون أصعب تغييره لاحقاً إن اخترنا هذا البديل الآن؟',
                en: 'What looks right and comfortable today may create conflict or harm in a week or a month. In every alternative evaluation, ask: what will be harder to change later if we choose this alternative now?',
              },
            },
          ],
        },
        {
          type: 'compare',
          yesTitle: { ar: 'سؤال يُوسّع التفكير', en: 'A question that broadens thinking' },
          noTitle: { ar: 'سؤال يُضيّق التفكير', en: 'A question that narrows thinking' },
          yes: {
            ar: [
              'من الذي لا نسمع صوته في هذا القرار وينبغي أن نسمعه قبل المضيّ؟',
              'ما الذي يحدث لمن لا يملكون خياراً حقيقياً في هذا الموقف؟',
              'إن اخترنا هذا البديل، ما الذي سيكون أصعب تغييره لاحقاً؟',
              'هل هذا القرار يحلّ المشكلة الجذرية أم يُؤجّل الاصطدام بها؟',
            ],
            en: [
              'Whose voice are we not hearing in this decision that we should hear before proceeding?',
              'What happens to those who have no real choice in this situation?',
              'If we choose this alternative, what will be harder to change later?',
              'Does this decision solve the root problem or postpone a collision with it?',
            ],
          },
          no: {
            ar: [
              'ما الذي سيُريحنا نحن من هذا الضغط الآن وفي أسرع وقت ممكن؟',
              'ما الذي يتوقّع الجهة الممولة أو الإدارة أن نفعله في هذا الموقف؟',
              'ما الذي فعله الفريق الآخر في موقف يبدو مشابهاً؟',
              'أيّ الخيارات يحتاج أقلّ شرح وتبرير أمام الآخرين؟',
            ],
            en: [
              'What will relieve our own pressure as quickly as possible right now?',
              'What does the donor or management expect us to do in this situation?',
              'What did the other team do in a situation that looks similar?',
              'Which option requires the least explanation and justification to others?',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'حين تُقيّم البدائل، الخطوة الأكثر صعوبةً وأهمّيةً في الوقت نفسه هي الاستماع لأصوات من لا يملكون موقعاً قوياً في غرفة القرار. المستفيد نادراً ما يكون حاضراً حين يُتّخذ قرار يخصّه مباشرةً. الأسرة التي ستتأثّر بقرار إعادة توطين أو تغيير إجراءات لا تُستشار دائماً. المجتمع المحلّي الذي سيستقبل برنامجاً جديداً لم يُشرك في تصميمه في أغلب الأحيان. القرار الأخلاقي لا يعني أن تُجري استشارة رسمية شاملة قبل كل قرار — فبعض القرارات فورية والظرف لا يتّسع — لكنه يعني أن تسأل نفسك بصدق: «هل أفهم بما يكفي أثر هذا الخيار على من لا أسمع صوتهم في هذه اللحظة؟ وهل اخترت هذا البديل لأنه الأنسب لهم أم لأنه الأسهل بالنسبة لي؟» الفرق بين هذين السؤالين هو الفرق بين القرار الإنساني المهني وبين القرار الحسن النيّة الذي يُلحق الضرر.',
            en: 'When evaluating alternatives, the most difficult and important step together is listening to voices from those who do not hold a strong position in the decision room. The beneficiary is rarely present when a decision directly concerning them is being made. The family that will be affected by a resettlement or procedure change is not always consulted. The local community that will receive a new programme is most often not involved in designing it. Ethical decision-making does not mean running a full formal consultation before every decision — some are immediate and the situation does not allow it — but it does mean honestly asking yourself: "Do I understand enough about the impact of this choice on those whose voices I am not hearing right now? And did I choose this alternative because it is most appropriate for them, or because it is easiest for me?" The difference between those two questions is the difference between professional humanitarian decision-making and well-intentioned decision-making that causes harm.',
          },
        },
        {
          type: 'quiz',
          id: 'edm-q2',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'ميزانيّتك تكفي لدعم عائلة واحدة فقط من بين ثلاث عائلات مؤهَّلة ومتعادلة في المعايير الرسمية. كيف تُقيّم البدائل قبل أن تقرّر؟',
            en: 'Your budget covers only one family from three equally eligible families by formal criteria. How do you evaluate the alternatives before deciding?',
          },
          options: [
            {
              ar: 'تختار العائلة الأقدم في قائمة الانتظار لأن ذلك المعيار الأوضح والأعدل، فالانتظار الأطول يستحقّ الأولوية ويُجنّبك اتّهاماً بالمحاباة حين تُسأل عن أساس اختيارك',
              en: 'Choose the family that has waited longest because that is the clearest and fairest criterion, since longer waiting deserves priority and shields you from any accusation of favouritism when you are asked how you chose',
            },
            {
              ar: 'تُقيّم الوضع الفوري لكل عائلة، وتفحص إن كانت إحداها تملك إمكانية إحالة لمصدر تمويل آخر، ثم توثّق أساس قرارك بما فيه ما لم تستطع تقييمه',
              en: 'Assess each family\'s immediate situation, check whether any can be referred to another funding source, then document the basis of your decision including what you could not assess',
            },
            {
              ar: 'تُوزّع المبلغ بالتساوي على الثلاث لأن ذلك الأكثر عدالةً وأقلّ إحراجاً، فتقسيمه يمنع أن تخرج أيّ عائلة بلا شيء ويُبقي ثقة العائلات الثلاث بالبرنامج',
              en: 'Divide the amount equally among the three as the most equitable and least awkward approach, since splitting it means no family leaves with nothing and all three keep their trust in the programme',
            },
            { ar: 'ترفع الأمر للمدير لأن القرار حسّاس ويتجاوز مستواك', en: 'Escalate to your manager because the decision is sensitive and exceeds your level' },
          ],
          correct: 1,
          feedback: {
            ar: 'الأقدم في القائمة معيار مجرّد يتجاهل الوضع الفعلي للعائلات: عائلة انتظرت أسبوعاً وظروفها مستقرّة قد تكون أقل إلحاحاً من عائلة انتظرت يوماً واحداً وأوضاعها حرجة. التوزيع المتساوي قد لا يُعين أحداً على تجاوز أزمته. رفع كل قرار حسّاس للمدير يُعطّل العمل وينقل مسؤوليتك. تقييم الوضع الفعلي وفحص البدائل المتاحة بما فيها الإحالة، ثم التوثيق الأمين لأساس القرار، هو ما يُميّز القرار المهني الأخلاقي.',
            en: 'Longest on the list is an abstract criterion that ignores each family\'s actual situation: a family waiting a week whose circumstances are stable may be less urgent than one waiting one day in a critical state. Equal distribution may help nobody address their crisis. Escalating every sensitive decision stalls work and transfers responsibility. Assessing the actual situation, examining alternatives including referral, and documenting honestly the basis of the decision is what marks an ethical professional decision.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'edm-m3',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'التحيّزات تحت الضغط', en: 'Biases under pressure' },
      lede: {
        ar: 'تحيّزك لا يختفي حين تصبح المسؤولية أكبر — يصبح أشدّ تأثيراً وأصعب رؤيةً.',
        en: 'Your bias does not disappear when the stakes grow — it becomes more influential and harder to see.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التحيّز ليس ضعفاً أخلاقياً أو علامة سوء نيّة. هو نتاج طبيعي لطريقة عمل الدماغ تحت الضغط. حين تزيد المعلومات وتضيق الفترة الزمنية، يلجأ الدماغ إلى اختصارات معرفية — يُسمّيها علماء النفس أحياناً «الاستدلال التجريبي» أو heuristics — للوصول إلى قرار بأقل استهلاك ممكن للطاقة العقلية. هذه الاختصارات تخدمك في كثير من الحالات اليومية وتُمكّنك من الاستجابة بسرعة مقبولة لمواقف مألوفة. لكنها في بيئات العمل الإنساني والتطوّعي — حيث الناس أمامك يختلفون في ثقافتهم ولغتهم وظروفهم وخبراتهم — يمكن أن تُفضي إلى قرارات تضرّ من تقصد مساعدتهم، أو تُقصي من لا يشبهونك، أو تُعيد إنتاج معاملة غير عادلة بالنيّة الحسنة.',
            en: 'Bias is not a moral failing or a sign of bad faith. It is a natural product of how the brain works under pressure. When information increases and the time window narrows, the brain turns to cognitive shortcuts — sometimes called heuristics by psychologists — to reach a decision with the least possible mental energy expenditure. These shortcuts serve you in many daily situations and allow you to respond with acceptable speed to familiar circumstances. But in humanitarian and volunteer settings — where the people before you differ in culture, language, circumstances, and experience — they can lead to decisions that harm those you intend to help, exclude those who do not resemble you, or reproduce unfair treatment with the best of intentions.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'تحيّز التأكيد: الميل إلى البحث عن معلومات تؤكّد ما قرّرته سلفاً وتجاهل أو تقليص ما يناقضه — خطير بشكل خاص حين يحمل الوضع أمامك أمارات تُذكّرك بموقف سبق أن واجهته فتُسارع إلى نفس الاستجابة دون التحقّق من أن الوضعَيْن فعلاً مماثلان',
              'تحيّز التوفّر: الميل إلى تضخيم احتمال ما يخطر بالبال بسهولة، عادةً لأنه حديث الحدوث أو مثير عاطفياً — يُفضي إلى المبالغة في الاستجابة لنوع معيّن من الأزمات وإغفال نوع آخر أقل تميّزاً أو أقل تأثيراً في الذاكرة',
              'تحيّز المجموعة الداخلية: الميل إلى التعامل بحسن نيّة أكبر ومرونة أعلى مع من ينتمون إلى مجموعتنا الثقافية أو الجنسية أو المهنية، وبتشكيك أعلى مع من يختلفون — يُنشئ عدم عدالة فعلي في توزيع الخدمات والمعلومات والفرص حتى حين لا يُشعر مَن يمارسه بأي تحيّز',
              'تحيّز الارتساء: الميل إلى إعطاء المعلومة الأولى التي نسمعها وزناً غير متناسب في قرارنا النهائي، حتى حين تتوفّر لاحقاً معلومات أكثر دقّةً وأكثر اكتمالاً — يجعلنا نُفسّر الشواهد الجديدة لتأكيد الانطباع الأوّل بدل قراءتها بعين مستقلّة',
              'تحيّز الحاضر: الميل نحو الراحة الفورية وتجنّب الانزعاج الآني على حساب الأثر البعيد — أحد أكثر أسباب القرارات الإنسانية العاجلة التي تُنشئ اعتماديّة أو تُدمّر مسارات استقلالية بُنيت على مدى سنوات',
            ],
            en: [
              'Confirmation bias: the tendency to seek information that confirms what you have already decided and ignore or minimise what contradicts it — particularly dangerous when the situation shows signs reminding you of one you faced before and you rush to the same response without checking whether the two situations are actually alike',
              'Availability bias: the tendency to overestimate the probability of what comes readily to mind, usually because it happened recently or is emotionally vivid — leads to overresponding to one type of crisis while overlooking another that is less distinctive or less present in memory',
              'In-group bias: the tendency to extend greater good faith and flexibility to those who belong to our own cultural, national, or professional group, and greater scepticism to those who differ — creates real inequity in the distribution of services, information, and opportunities even when those who practise it feel no bias',
              'Anchoring bias: the tendency to give the first piece of information we hear disproportionate weight in our final decision, even when more accurate and complete information becomes available later — causing us to interpret new evidence as confirming the first impression rather than reading it independently',
              'Present bias: the tendency towards immediate comfort and avoiding present discomfort at the cost of longer-term impact — one of the most common causes of urgent humanitarian decisions that create dependency or undermine independence built over years',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'التحيّز الذي لا تراه هو الأخطر', en: 'The bias you cannot see is the most dangerous' },
          content: {
            ar: 'القرارات التي أخطأت في حياتك المهنية نادراً ما كنت تعرف وقت اتّخاذها أنها خطأ — وإلا ما اتّخذتها. الوعي بأنواع التحيّزات لا يُلغيها تلقائياً، لكنه يُبطئ ردّ الفعل الأوّل ويمنحك لحظة للتساؤل: «هل أتّخذ هذا القرار لأسباب موضوعية؟ أم لأن كل ما يخطر ببالي الآن يُشير نحو نفس الخيار ويجعله يبدو واضحاً وبديهياً؟»',
            en: 'The decisions that went wrong in your professional life were rarely ones you knew were wrong at the time — otherwise you would not have made them. Awareness of types of bias does not automatically eliminate them, but it slows the first reaction and gives you a moment to ask: "Am I making this decision for objective reasons? Or because everything that comes to mind right now points towards the same option and makes it look obvious and self-evident?"',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'ثمّة فحوصات بسيطة تساعدك على اكتشاف ما إذا كنت تعمل تحت تأثير تحيّز. الأول هو فحص «النقيض»: اسأل نفسك «ماذا كنت سأقرّر إن كان الشخص أمامي من خلفية مختلفة — جنسية أخرى، جنس آخر، أسلوب كلام مختلف؟». إن كان جوابك مختلفاً، فثمّة تحيّز يعمل في هذا القرار بصرف النظر عن نيّتك. الفحص الثاني هو «المحاسب»: اسأل «كيف سأُبرّر هذا القرار كتابةً لشخص لا يعرف الوضع ولا يعرفني؟». إن كان التبرير صعباً أو يبدو دفاعياً، فالقرار يحتاج مراجعة قبل التنفيذ. الفحص الثالث هو التوقّف لخمس ثوانٍ قبل القرارات التي تبدو بديهية، وتسمية ما تشعر به بصوت داخلي صريح: «أشعر بضغط خارجي»، «أشعر بتعاطف مفرط مع هذا الشخص»، «أشعر بتوتّر من الموقف». إدراك الحالة الانفعالية الراهنة هو الخطوة الأولى في الحدّ من تأثيرها على منطق القرار.',
            en: 'There are simple checks that help you discover whether you are working under the influence of a bias. The first is the "opposite" check: ask yourself "What would I have decided if the person in front of me came from a different background — a different nationality, gender, or way of speaking?" If your answer differs, there is a bias operating in this decision regardless of your intention. The second is the "auditor" check: ask "How would I justify this decision in writing to someone who does not know the situation and does not know me?" If justification is difficult or sounds defensive, the decision needs reviewing before action. The third is pausing five seconds before decisions that feel obvious, and naming what you feel in an honest inner voice: "I feel external pressure", "I feel excessive sympathy for this person", "I feel tension from the situation". Awareness of your current emotional state is the first step in limiting its effect on the logic of the decision.',
          },
        },
        {
          type: 'quiz',
          id: 'edm-q3',
          label: { ar: 'تعرّف على التحيّز', en: 'Recognise the bias' },
          question: {
            ar: 'سمعت للتوّ أن عائلة جديدة تقدّمت للحصول على الدعم. بمجرّد ما سمعت اسمها، وقبل أن تقرأ أيّ معلومة أخرى، وجدت نفسك تفترض أن وضعها «على الأرجح أقل إلحاحاً» من الأسر الأخرى. أيّ تحيّز يعمل هنا؟',
            en: 'You have just heard that a new family has applied for support. As soon as you heard their name, before reading any other information, you found yourself assuming their situation is "probably less urgent" than others. Which bias is at work here?',
          },
          options: [
            {
              ar: 'تحيّز التوفّر — لأن اسمهم يُذكّرك بعائلة مشابهة سبق أن تعاملت معها وكان وضعها أقلّ إلحاحاً ممّا بدا في البداية',
              en: 'Availability bias — because their name reminds you of a similar family you dealt with before whose situation turned out to be less urgent than it first appeared',
            },
            { ar: 'تحيّز الحاضر — لأنك تميل لتأجيل التعامل معهم', en: 'Present bias — because you are inclined to postpone dealing with them' },
            {
              ar: 'تحيّز المجموعة الداخلية — تقييم أوّلي مبنيّ على إشارة هويّة لا على معلومات فعلية عن الوضع',
              en: 'In-group bias — an initial assessment built on an identity signal rather than actual information about the situation',
            },
            { ar: 'تحيّز الارتساء — لأن اسمهم أعطاك انطباعاً أولياً ثابتاً', en: 'Anchoring bias — because their name gave you a fixed initial impression' },
          ],
          correct: 2,
          feedback: {
            ar: 'الحكم على الإلحاحية قبل أي معلومة فعلية، استناداً إلى الاسم وحده، هو تحيّز المجموعة الداخلية في أوضح صوره: تصنيف غير مدروس مبنيّ على إشارة هويّة بدل المعلومة الفعلية. الخطر المضاعف هنا أن القرار التالي — تحديد الأولوية — سيُبنى على هذا التقييم الأوّلي المشوَّه حتى لو جُمعت معلومات أدقّ لاحقاً. الفحص الصحيح هو تطبيق نفس إجراء تقييم الوضع لكل أسرة بصرف النظر عن الاسم أو الجنسية أو أيّ إشارة هويّة أخرى.',
            en: 'Judging urgency before any actual information, based on name alone, is in-group bias in its clearest form: an unconsidered classification built on an identity signal rather than actual information. The compounded danger is that the next decision — setting priority — will be built on this initial distorted assessment even if more accurate information is gathered later. The correct check is to apply the same situation-assessment procedure to every family regardless of name, nationality, or any other identity signal.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'edm-m4',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'القرار تحت الضغط: أطر وفحوصات عملية', en: 'Deciding under pressure: frameworks and practical checks' },
      lede: {
        ar: 'الإطار لا يُفكّر عنك — لكنه يحول دون أن تتخطّى خطوةً حاسمة لا تعرف أنك تخطّيتها.',
        en: 'A framework does not think for you — but it prevents you from skipping a decisive step without knowing you have skipped it.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'كثيراً ما يُتناول الإطار الأخلاقي للقرار على أنه أداة للمواقف الكبرى المعقّدة: كيف يُوزَّع اللقاح في وباء، أو كيف تُحدَّد الأولوية حين تتجاوز الاحتياجات الموارد المتاحة بمرّات. لكنه في الواقع أكثر قيمةً في القرارات اليومية الصغيرة التي تبدو روتينية وعادية: من يُدرَّب هذا الأسبوع، كيف تُوزَّع المهام بين أعضاء الفريق، كيف يُعالَج تعارض بين مستفيدَيْن في موعد مشترك. في القرارات الكبرى عادةً ما يتوفّر وقت للتشاور الجماعي وإشراك متخصّصين؛ في القرارات اليومية الصغيرة تقرّر وحدك وبسرعة ومن دون الشعور بأن ما تفعله يستحق إطاراً. وهذا هو بالضبط المكان الذي تتراكم فيه أكثر الأخطاء الأخلاقية أثراً على المدى البعيد.',
            en: 'The ethical decision-making framework is often treated as a tool for big, complex situations: how to distribute vaccines in a pandemic, or how to prioritise when needs exceed available resources many times over. But it is actually more valuable in the small daily decisions that seem routine and ordinary: who to train this week, how to distribute tasks among team members, how to handle a conflict between two beneficiaries at a shared appointment. For big decisions there is usually time for collective consultation and involving specialists; for small daily decisions you decide alone, quickly, without feeling that what you are doing warrants a framework. And that is precisely where the most cumulatively impactful ethical errors accumulate over time.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'توقّف وسمّ القرار بوضوح: «القرار الذي أواجهه الآن هو…» — الجملة الغامضة أو غير المكتملة هنا تعني أن القرار لم يُحدَّد وأنت تُسرع قبل أن تعرف إلى أين',
              'عدّد من يتأثّر: اكتبهم أو عدّدهم في ذهنك بمن فيهم من لا يحضرون الآن ومن لا يملكون صوتاً في اللحظة',
              'ابحث عن ثلاثة بدائل على الأقل — لا بديلَيْن فحسب. «لا أقرّر الآن» و«أطلب مساعدة» و«أُحيل» كلها بدائل مشروعة يجب أن تُقيَّم كالبدائل الأخرى لا أن تُستبعد مسبقاً',
              'لكل بديل: ما أثره على كل مجموعة متأثّرة؟ ابدأ بمن يملكون الأقل قوّةً في الموقف لا بمن يملكون الأكثر صوتاً',
              'اسأل: أيّ البدائل يمكنني الدفاع عنه بصدق أمام شخص لا أعرفه ولا يعرف السياق، دون حاجة إلى اعتذار أو تبرير تكتيكي؟',
              'اتّخذ القرار، سجّل سببه في جملة واحدة صريحة، ثم نفّذه. التسجيل ليس بيروقراطية — هو جزء من القرار نفسه',
            ],
            en: [
              'Stop and name the decision clearly: "The decision I am facing now is…" — a vague or incomplete sentence here means the decision has not been defined and you are moving before you know where',
              'List those affected: write them down or enumerate them in your mind, including those not present and those without a voice in this moment',
              'Find at least three alternatives — not just two. "I do not decide now", "I ask for help", and "I refer" are all legitimate alternatives that must be evaluated alongside others, not ruled out in advance',
              'For each alternative: what is its effect on each affected group? Start with those who have least power in the situation, not those with the most voice',
              'Ask: which alternative can I honestly defend to someone I do not know who does not know the context, without needing to apologise or give tactical justification?',
              'Make the decision, record its reason in one clear sentence, then act. The recording is not bureaucracy — it is part of the decision itself',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'قاعدة الصحفي الأمين', en: 'The honest journalist rule' },
          content: {
            ar: 'قبل اتّخاذ قرار حسّاس، اسأل نفسك: «هل أرتاح لو نُشر ما قرّرته ولماذا قرّرته في صحيفة غداً؟» هذا السؤال لا يعني الخوف من الرأي العام أو المسؤولية القانونية — يعني التحقّق من أن منطق قرارك صامد أمام تدقيق خارجي نزيه لشخص لا يعرفك ولا يحمل انطباعاً مسبقاً. إن كانت الإجابة «لا»، فثمّة شيء في القرار أو في دوافعه يحتاج مراجعة قبل التنفيذ.',
            en: 'Before making a sensitive decision, ask yourself: "Would I be comfortable if what I decided and why I decided it were published in a newspaper tomorrow?" This question is not about fear of public opinion or legal liability — it is about checking whether your decision\'s logic holds up to honest external scrutiny from someone who does not know you and carries no prior impression. If the answer is no, there is something in the decision or its motives that needs reviewing before acting.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'القرار تحت الضغط الحقيقي — حين يضغط الوقت وحين الجميع ينظر إليك وحين التوقّعات واضحة ومتعارضة في آنٍ واحد — يتطلّب تدريباً على إبطاء الاستجابة الأولى لا تسريعها. هذا لا يعني التردّد ولا يعني طلب دقائق من الناس في كل موقف. يعني ممارسة تسمية ما تشعر به لحظة الضغط قبل أن تتحدّث، وممارسة قول «أحتاج لحظة قصيرة» حين يبدو الموقف بديهياً أكثر مما ينبغي، وممارسة السؤال الهادئ «من الذي لا أسمعه في هذه اللحظة؟». الأشخاص الذين يتّخذون قرارات أفضل في بيئات الضغط ليسوا بالضرورة أكثر ذكاءً أو أكثر خبرة — هم تدرّبوا على إبطاء الثانيتين الأوليين وتحويلهما من استجابة انعكاسية إلى خطوة واعية.',
            en: 'Real decision-making under pressure — when time presses, when everyone is looking at you, and when expectations are clear and contradictory at the same time — requires training yourself to slow the initial response, not speed it. This does not mean hesitation, and it does not mean asking people for minutes in every situation. It means practising naming what you feel at the moment of pressure before you speak, practising saying "I need a brief moment" when the situation seems more obvious than it should, and practising the quiet question "Who am I not hearing right now?" People who make better decisions in high-pressure environments are not necessarily more intelligent or experienced — they have trained themselves to slow the first two seconds and turn them from a reflexive response into a conscious step.',
          },
        },
        {
          type: 'quiz',
          id: 'edm-q4',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'وسط نشاط مزدحم يُبلّغك متطوّع أن مشاركاً رفض الجلوس جانب مشارك آخر ويطلب منك قراراً فورياً. الجميع ينتظر. ماذا تفعل؟',
            en: 'In the middle of a busy activity a volunteer tells you a participant has refused to sit next to another and is asking for an immediate decision. Everyone is waiting. What do you do?',
          },
          options: [
            {
              ar: 'تقرّر فوراً بناءً على أول فكرة تخطر ببالك لأن التردّد أمام الجميع سيُضعف ثقتهم بك، وقرار سريع ولو كان ناقصاً أهون من صمت أمام مجموعة تنتظر',
              en: 'Decide immediately based on the first idea that comes to mind because hesitating in front of everyone will undermine their confidence in you, and a quick decision even if incomplete is better than silence in front of a waiting group',
            },
            {
              ar: 'تترك الأمر للمتطوّع الذي أبلغك لأنه أقرب للموقف ويعرف التفاصيل، وهو من سيتابع الأمر معهما بعد انتهاء النشاط على أيّ حال',
              en: 'Leave the matter to the volunteer who told you because they are closer to the situation and know the details, and they are the one who will follow it up with them after the activity anyway',
            },
            {
              ar: 'تقول «لحظة» وتمشي خطوتين جانباً لتسمّي ما تشعر به وتُحدّد القرار الفعلي قبل أن تستجيب بصوت مرتبك',
              en: 'Say "one moment" and step two steps aside to name what you feel and identify the actual decision before responding with a flustered voice',
            },
            { ar: 'تطلب من الجميع التوقّف وتجلس مع الفريق لمناقشة الأمر', en: 'Ask everyone to stop and sit with the team to discuss the matter' },
          ],
          correct: 2,
          feedback: {
            ar: 'السرعة تحت الضغط الظاهري ليست فضيلة — هي في الغالب مصدر الخطأ الذي يبدو لاحقاً كان يمكن تفاديه. خطوتان وخمس ثوانٍ تكفيان لتحديد: ما القرار الفعلي، من الأنسب لاتّخاذه، ما أول إجراء منطقي بلا ضجّة. «لحظة» لا تُضعف سلطتك — إعطاء قرار خاطئ بثقة يُضعفها. وترك الأمر للمتطوّع دون توجيه يُحوّل المسؤولية لمن لا يملك صلاحيتها. واجتماع الفريق وقت النشاط غير مناسب للمواقف العاجلة.',
            en: 'Speed under apparent pressure is not a virtue — it is usually the source of the error that later looks avoidable. Two steps and five seconds are enough to identify: what is the actual decision, who is best placed to make it, what is the first logical action without commotion. "One moment" does not undermine your authority — giving a wrong decision confidently does. Leaving it to the volunteer without guidance transfers responsibility to someone without the authority for it. A team meeting during an activity is not appropriate for urgent situations.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'edm-m5',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'توثيق القرار ومراجعته بعد التنفيذ', en: 'Recording and reviewing after delivery' },
      lede: {
        ar: 'القرار الذي لا تُسجّل سببه لن تتعلّم منه — وخطؤه قد يتكرّر على يد شخص آخر لم يعرف.',
        en: 'The decision you do not record the reason for is one you will not learn from — and its error may be repeated by someone who never knew.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'توثيق القرار لا يعني كتابة تقرير مطوَّل عن كل خطوة اتّخذتها ولا تعبئة نموذج بيروقراطي معقّد. يعني تسجيل أربعة أشياء محدّدة في جملة واحدة أو جملتين: أولاً ما القرار الذي اتّخذته بصيغة فعل واضح لا صيغة مبهمة، ثانياً ما الذي جعله ضرورياً في هذه اللحظة تحديداً، ثالثاً ما البديل الرئيسي الذي استبعدته ولماذا استبعدته بجملة واحدة صريحة، ورابعاً ما الذي كنت لا تعرفه وقت القرار وظلّ غامضاً. هذه الجمل الأربع تستغرق دقيقتين في الكتابة، لكنها تُغيّر بشكل جذري ما يمكنك استخلاصه من الخبرة لاحقاً — وما يمكن لفريقك وللمنظمة استخلاصه جماعياً. المنظمات التي لا توثّق قراراتها تعيد ارتكاب الأخطاء نفسها لأن المعرفة تبقى في رأس الأشخاص وتغادر حين يُنهون عملهم أو يتنقّلون.',
            en: 'Documenting a decision does not mean writing a lengthy report on every step you took, or filling in a complex bureaucratic form. It means recording four specific things in one sentence or two: first, what decision you made in a clear active form not a vague passive one; second, what made it necessary at this particular moment; third, what main alternative you set aside and why in one direct sentence; and fourth, what you did not know at the time and remained unclear. These four sentences take two minutes to write but they radically change what you can draw from the experience later — and what your team and organisation can collectively learn. Organisations that do not document their decisions repeat the same errors because the knowledge stays in people\'s heads and leaves when they finish or move on.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'اكتب القرار بصيغة فعل واضح: «قرّرت أن…» أو «اخترت أن…» — لا «كانت الخطة أن…» ولا «تمّ اتّخاذ قرار بأن…» — الصيغة الفاعلة تُحدّد من المسؤول وتجعل المراجعة ممكنة',
              'اكتب الظرف الذي جعل القرار ضرورياً: ما المعلومة أو الحدث أو القيد الذي فرضه في هذا التوقيت',
              'اكتب البديل الرئيسي الذي رفضته وسبب رفضه في جملة واحدة — هذا الجزء هو الأكثر قيمةً في المراجعة اللاحقة لأنه يُظهر التفكير لا فقط الاختيار',
              'اكتب ما لم تكن تعرفه: ما الغموض أو المعلومة الناقصة التي بقيت حين قرّرت وكان يمكن أن تُغيّر المسار',
              'ضع تاريخ مراجعة محدّد: متى ستنظر في النتيجة لتتعلّم منها — أسبوع، شهر، نهاية البرنامج. التاريخ المفتوح لا يُراجَع',
            ],
            en: [
              'Write the decision as a clear active form: "I decided to…" or "I chose to…" — not "the plan was to…" or "it was decided to…" — the active form identifies who is accountable and makes review possible',
              'Write the circumstance that made the decision necessary: what information, event, or constraint required it at this timing',
              'Write the main alternative you rejected and the reason in one sentence — this part is the most valuable in later review because it shows the thinking, not only the choice',
              'Write what you did not know: what uncertainty or missing information remained when you decided and could have changed the course',
              'Set a specific review date: when you will examine the outcome to learn — a week, a month, end of programme. An open date is never reviewed',
            ],
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'توثيق يُعلَّم منه', en: 'Documentation worth learning from' },
          noTitle: { ar: 'توثيق يُغلق الملف فقط', en: 'Documentation that only closes the file' },
          yes: {
            ar: [
              '«قرّرت تأجيل نشاط السبت لأن تقييم الموقع أشار إلى خطر أمني لم نستطع تخفيفه. بديل تغيير المكان استُبعد لأن ميزانية النقل غير متوفّرة هذا الأسبوع. لم أكن متأكّداً إن كان الخطر مؤقّتاً — قرار إعادة الجدولة يُراجع الثلاثاء المقبل»',
              '«اخترت أن تتولّى رنا ملف هذه العائلة لأن لغتها تتطابق مع لغة الأسرة وكانت متاحة. البديل كان ليلى لكنها مثقلة بستّة ملفّات. ما لا أعرفه بعد: هل سيبقى الحمل متوازناً على المدى البعيد — أراجع مع رنا نهاية الشهر»',
            ],
            en: [
              '"I decided to postpone Saturday\'s activity because the venue assessment flagged a security risk we could not mitigate. The venue-change alternative was ruled out because the transport budget is unavailable this week. I was not certain the risk was temporary — the rescheduling decision will be reviewed next Tuesday."',
              '"I chose Rana to handle this family\'s file because her language matches theirs and she was available. The alternative was Layla but she is carrying six files. What I still do not know: whether the workload will remain balanced over time — I will review with Rana at end of month."',
            ],
          },
          no: {
            ar: [
              '«تمّ تأجيل النشاط وفق الإجراءات المعتمدة»',
              '«وُزّعت الملفّات على المتطوّعين بشكل متوازن ومناسب»',
            ],
            en: [
              '"The activity was postponed in accordance with approved procedures."',
              '"Files were distributed to volunteers in a balanced and appropriate manner."',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'المراجعة بعد التنفيذ ليست جلسة محاسبة على الأخطاء ولا مناسبة للدفاع عن القرار الذي اتُّخذ. هي جلسة تعلّم منظّمة تقوم على سؤال محدّد: «ما الذي تغيّر بين ما افترضناه حين قرّرنا وما وجدناه بعد التنفيذ؟». ومن هذا السؤال تتفرّع أسئلة أخرى: هل كانت افتراضاتنا معقولة بناءً على ما كنّا نعلمه وقتها؟ ما الذي كنّا سنقرّر لو عرفنا ما نعرفه الآن؟ هل ما تعلّمناه يُغيّر الطريقة التي سنتعامل بها مع موقف مشابه في المستقبل؟ هذه الأسئلة تبني ثقافة تعلّم حقيقية لا ثقافة عقاب، وتُشجّع المتطوّعين على التوثيق بصدق بدل اختيار الصياغات التي تحمي موقفهم في حالة المراجعة. والفرق بين المنظمة التي تتعلّم من أخطائها والتي لا تتعلّم ليس في وجود الأخطاء — كلتيهما تُخطئ — بل في وجود نظام للتوثيق والمراجعة الصادقة.',
            en: 'Review after delivery is not an accountability session for errors, nor an occasion for defending the decision that was made. It is an organised learning session built on one specific question: "What changed between what we assumed when we decided and what we found after delivery?" From that question come others: were our assumptions reasonable based on what we knew at the time? What would we have decided had we known what we know now? Does what we learned change how we will approach a similar situation in future? These questions build a genuine learning culture rather than a punishment culture, and encourage volunteers to document honestly rather than choosing wordings that protect their position in case of review. The difference between an organisation that learns from its errors and one that does not is not the presence of errors — both make them — but the existence of a system for honest documentation and review.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'القرار الأخلاقي لا يؤثّر في لحظته وحدها — تأثيره الأعمق يتجلّى في ما يأتي بعدها: في ثقافة الفريق التي تتشكّل شيئاً فشيئاً من تراكم القرارات اليومية، وفي سمعة المنظمة التي يُبنيها المجتمع من مراقبة كيف يُتصرَّف في لحظات الضغط لا في لحظات الرخاء. كل قرار يُتّخذ بصدق وشجاعة، حتى حين يكون مكلفاً أو مؤخّراً للعمل، يُرسّخ في الفريق رسالة واضحة: الطريق الصحيح ممكن حتى تحت الضغط. وكل استثناء يُمنح بلا مبرّر كافٍ يُرسّخ رسالة أخرى: أن القيم مرنة حين يكون الثمن عالياً. المتطوّعون الجدد لا يتعلّمون ثقافة المنظمة من الوثائق الرسمية بل من مراقبة ما يجري فعلاً: من يُقدَّر حين يُخطئ؟ من يُحاسَب وعلى أيّ أساس؟ وما الذي يُمرَّر بصمت دون أن يُلفت إليه أحد؟ وسمعة المنظمة في المجتمع المحلّي لا تُبنى بالإعلانات ولا بالتقارير السنوية — تُبنى من هذه التراكمات اليومية الصغيرة التي يُلاحظها الناس ويحتفظون بها.',
            en: 'An ethical decision does not only affect its own moment — its deeper impact shows in what follows: in the team culture that forms gradually from the accumulation of daily decisions, and in the organisation\'s reputation that the community builds by observing how it behaves in moments of pressure rather than ease. Every decision taken honestly and with courage, even when it is costly or delays work, reinforces a clear message in the team: the right path is possible even under pressure. Every exception granted without sufficient justification reinforces a different message: that values are flexible when the price is high. New volunteers do not learn an organisation\'s culture from official documents but from watching what actually happens: who is appreciated when they make mistakes? Who is held accountable and on what basis? And what passes in silence without anyone drawing attention to it? An organisation\'s reputation in the local community is not built through announcements or annual reports — it is built from these small daily accumulations that people notice and remember.',
          },
        },
        {
          type: 'quiz',
          id: 'edm-q5',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'الأسبوع الماضي قرّرت تخصيص موارد إضافية لمنطقة جغرافية معيّنة. النتائج جاءت مختلفةً عمّا توقّعت. ما الهدف الرئيسي لجلسة المراجعة؟',
            en: 'Last week you decided to allocate extra resources to a specific geographic area. The results were different from what you expected. What is the main purpose of the review session?',
          },
          options: [
            { ar: 'تحديد من يتحمّل مسؤولية النتائج التي جاءت دون التوقّعات وما العواقب المترتّبة', en: 'Identify who bears responsibility for the results that fell below expectations and what consequences follow' },
            {
              ar: 'إثبات أن القرار كان صحيحاً في ضوء ما كان متاحاً وقتها ودفع أي نقد محتمل، حتى لا تتردّد الإدارة في تفويضك بقرارات مشابهة لاحقاً',
              en: 'Demonstrate that the decision was correct in light of what was available at the time and deflect potential criticism, so that management does not hesitate to delegate similar decisions to you later',
            },
            {
              ar: 'فهم الفجوة بين الافتراضات وقت القرار والواقع بعد التنفيذ، واستخلاص ما يُغيَّر في المرّة القادمة',
              en: 'Understand the gap between assumptions at decision time and reality after delivery, and draw out what to change next time',
            },
            { ar: 'تأكيد أن الإجراءات والمعايير اتُّبعت بشكل صحيح وإغلاق الملف رسمياً', en: 'Confirm that procedures and standards were followed correctly and close the file formally' },
          ],
          correct: 2,
          feedback: {
            ar: 'المراجعة ليست محاكمة ولا دفاعاً ولا تأكيد الامتثال — هي تعلّم. الهدف هو فهم الفجوة بين ما افترضناه وما وجدناه: هل كانت افتراضاتنا خاطئة أصلاً؟ هل البيانات التي بنينا عليها كانت ناقصة؟ هل تغيّر الظرف بعد القرار بشكل لم نتوقّعه؟ هذه الأسئلة تبني مقرّراً أفضل في المرّة القادمة. أمّا تحديد المسؤول والتبرير وإغلاق الملف فكلها تُدمّر ثقافة التوثيق الصادق وتمنع التعلّم المؤسّسي.',
            en: 'A review is neither a trial, nor a defence, nor a compliance check — it is learning. The purpose is to understand the gap between what we assumed and what we found: were our assumptions wrong from the start? Were the data we built on incomplete? Did circumstances change after the decision in a way we did not anticipate? These questions build a better decision-maker next time. Identifying responsibility, justifying, and closing the file all destroy a culture of honest documentation and prevent institutional learning.',
          },
        },
      ],
    },
  ],
};
