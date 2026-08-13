import type { CourseContent } from './types';

export const levelSixChallenge: CourseContent = {
  slug: 'level-6-challenge',
  level: 6,
  minutes: 55,
  passMark: 70,
  title: {
    ar: 'تحدّي المستوى السادس: نظام تطوّع مستدام',
    en: 'Level 6 Challenge: A Sustainable Volunteering System',
  },
  lede: {
    ar: 'هذا التحدّي يقيس قدرتك على تكامل المفاهيم القيادية العليا: الاستراتيجية والشراكات والحوكمة والمساءلة — في سيناريوهات تعكس تعقيد العمل الميداني الحقيقي.',
    en: 'This challenge measures your ability to integrate advanced leadership concepts: strategy, partnerships, governance, and accountability — in scenarios reflecting real field complexity.',
  },
  outcomes: {
    ar: [
      'تُطبّق مبادئ الحوكمة في سيناريوهات قيادية معقّدة',
      'تتخذ قرارات استراتيجية تُوازن الشراكات والموارد والمساءلة',
      'تُدير أزمات مؤسّسية تشمل تضارب صلاحيات ومخاوف أخلاقية',
    ],
    en: [
      'Apply governance principles in complex leadership scenarios',
      'Make strategic decisions balancing partnerships, resources, and accountability',
      'Manage organisational crises involving authority conflicts and ethical concerns',
    ],
  },
  sources: [
    'IFRC — Leadership in Humanitarian Organisations: Standards and Practice',
    'Accountable Now — Leading for Accountability: A Framework for Senior Leaders',
    'CIVICUS — Advanced Governance in Civil Society: Case Studies',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'l6c-strategy',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'الاستراتيجية والقرار المؤسّسي', en: 'Strategy and organisational decision-making' },
      lede: {
        ar: 'القيادة الاستراتيجية لا تعني اتّخاذ كل القرارات — بل اتّخاذ القرارات الصحيحة في الوقت الصحيح بالمعلومات الصحيحة.',
        en: 'Strategic leadership does not mean making all decisions — it means making the right decisions at the right time with the right information.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'في المستوى السادس من برنامج التكافل، أنت في موقع قيادي يجمع بين رؤية المنظّمة وتفاصيلها التشغيلية. المهارة المطلوبة ليست فقط معرفة المبادئ — بل القدرة على تطبيقها حين تتشابك الضغوط: مانح يُلحّ، شريك ينسحب، أزمة ميدانية تتطلّب قراراً في ساعات، وفريق يحتاج قيادة واضحة.\n\nهذا التحدّي يُقدّم سيناريوهات مركّبة من العناصر الثلاثة للمستوى السادس: الشراكات، والحوكمة والمساءلة، وصنع القرار الاستراتيجي. كل سؤال له سياق يتطلّب تحليلاً — لا مجرّد تذكّر قاعدة.',
            en: 'At Level 6 of the Takaful programme, you are in a leadership position combining the organisation\'s vision with its operational details. The skill required is not just knowing the principles — but the ability to apply them when pressures intertwine: an insistent funder, a withdrawing partner, a field crisis demanding a decision within hours, and a team needing clear leadership.\n\nThis challenge presents composite scenarios from the three Level 6 elements: partnerships, governance and accountability, and strategic decision-making. Each question has a context requiring analysis — not just rule recall.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q1',
          label: { ar: 'سؤال ١', en: 'Question 1' },
          question: {
            ar: 'جمعيتك تواجه خياراً استراتيجياً: التوسّع الجغرافي لمنطقة جديدة أو التعمّق في منطقتك الحالية. مانحك الرئيسي يُفضّل التوسّع. الفريق الميداني يُفضّل التعمّق. الميزانية لا تسمح بكليهما. كيف تُقرّر؟',
            en: 'Your organisation faces a strategic choice: geographic expansion to a new area or deepening work in your current area. Your main funder prefers expansion. The field team prefers deepening. The budget does not allow both. How do you decide?',
          },
          options: [
            { ar: 'ابن القرار على الأدلّة والمهمة المؤسّسية: أيّ الخيارين يُحقّق أكبر أثر على المستفيدين بالموارد المتاحة — وإن خالف تفضيل المانح ناقشه بالأرقام', en: 'Build the decision on evidence and institutional mission: which option achieves the greatest impact on beneficiaries with available resources — and if it contradicts the funder\'s preference, discuss it with data' },
            { ar: 'وافق المانح لأن فقدانه يعني فقدان الموارد الكافية للتعمّق أيضاً', en: 'Agree with the funder because losing them means losing resources for deepening too' },
            { ar: 'وافق الفريق الميداني لأنهم أعلم بالواقع', en: 'Agree with the field team because they know the reality best' },
          ],
          correct: 0,
          feedback: {
            ar: 'القرار الاستراتيجي يُبنى على الأثر والمهمة، لا على رغبة المانح أو تفضيل الفريق. المانح يموّل مهمّتك — إذا اقتنع بحجّتك فسيوافق، وإن لم يقتنع، هذه بداية حوار محترم حول قيم الشراكة.',
            en: 'Strategic decisions are built on impact and mission, not funder preference or team opinion. The funder finances your mission — if persuaded by your argument they will agree; if not, this is the beginning of a respectful dialogue about partnership values.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q2',
          label: { ar: 'سؤال ٢', en: 'Question 2' },
          question: {
            ar: 'قبل أسبوعين انتهى برنامج أساسي وتسعة موظّفين ستنتهي عقودهم خلال شهر. ليس لديك تمويل لتجديد. المدير المالي يقترح تمديد العقود من الاحتياطي. ما الإجراء الصحيح؟',
            en: 'Two weeks ago a core programme ended and nine employees\' contracts will expire within a month. You have no funding for renewal. The CFO proposes extending contracts from reserves. What is the correct procedure?',
          },
          options: [
            { ar: 'احتجاز الاحتياطي لحالات الطوارئ الحقيقية وإجراء تخطيط انتقالي صريح للموظّفين مع البحث الحثيث عن تمويل بديل', en: 'Preserve reserves for genuine emergencies and conduct honest transition planning for employees while actively seeking alternative funding' },
            { ar: 'استخدم الاحتياطي كاملاً لأن الموظّفين أصحاب حق وفقدانهم يُضعف الجمعية', en: 'Use the full reserve because employees have a right and losing them weakens the organisation' },
            { ar: 'استشر المانح السابق عن إمكانية تمديد قصير وإلا أنهِ العقود في موعدها', en: 'Consult the previous funder about a short extension possibility, otherwise end contracts on schedule' },
          ],
          correct: 2,
          feedback: {
            ar: 'استشارة المانح خطوة منطقية قبل كل قرار آخر — قد يكون لديه مرونة لم تُعرَض. إن لم يكن، إنهاء العقود في موعدها مع دعم انتقالي صادق أفضل من استنزاف الاحتياطي. استخدام الاحتياطي كاملاً بلا تمويل بديل يُعرّض الجمعية ذاتها للخطر.',
            en: 'Consulting the funder is a logical first step — they may have flexibility not yet offered. If not, ending contracts on schedule with honest transition support is better than depleting reserves. Using the full reserve without alternative funding endangers the organisation itself.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q3',
          label: { ar: 'سؤال ٣', en: 'Question 3' },
          question: {
            ar: 'شريكك الأقدم في منطقتك يوسّع نطاقه ليشمل خدمات كانت حكراً على جمعيتك. هل هذا تهديد أم فرصة؟',
            en: 'Your longest-standing partner in your area is expanding their scope to include services previously exclusive to your organisation. Is this a threat or an opportunity?',
          },
          options: [
            { ar: 'يمكن أن يكون كلاهما — يتوقّف على ما إذا كانت احتياجات المستفيدين تستوجب توسيع العرض أم لا. الحوار مع الشريك أولاً لفهم الدافع', en: 'It can be both — it depends on whether beneficiary needs warrant expanded services. Dialogue with the partner first to understand the motivation' },
            { ar: 'تهديد واضح يستوجب اتّخاذ موقف تنافسي وتعزيز حضورك في المنطقة', en: 'A clear threat requiring a competitive stance and strengthening your presence in the area' },
            { ar: 'فرصة ممتازة للتوسّع المشترك — كلّما زاد المزوّدون قلّت الفجوات', en: 'An excellent opportunity for joint expansion — the more providers, the fewer gaps' },
          ],
          correct: 0,
          feedback: {
            ar: 'الشراكة مبنية على المصلحة المشتركة، والمصالح تتغيّر. قبل أي تأطير تنافسي، الحوار المباشر يُوضّح الدوافع. إذا كانت الاحتياجات تستوجب خدمات إضافية — تعاونا. إذا كانت المسألة غزواً للمجال — تفاوضا.',
            en: 'Partnership is built on shared interest, and interests change. Before any competitive framing, direct dialogue clarifies motivations. If needs warrant additional services — cooperate. If the matter is territory invasion — negotiate.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q13',
          label: { ar: 'سؤال ١٣', en: 'Question 13' },
          scenario: {
            ar: 'أرسلت مدرّباً أقدم من فريقك لقيادة برنامج تدريب المدرّبين في أربع منظّمات شريكة. بعد ستة أشهر، منظّمة واحدة فقط من الأربع تُطبّق ما تعلّمته بشكل فعلي. المدرّب يقول: «درّبناهم — المسؤولية الآن عليهم».',
            en: 'You sent a senior trainer from your team to lead a training-of-trainers programme in four partner organisations. Six months later, only one of the four is actively applying what they learned. The trainer says: "We trained them — the responsibility is theirs now."',
          },
          question: {
            ar: 'ما الذي يكشفه هذا الوضع وماذا يجب أن تفعل؟',
            en: 'What does this situation reveal and what must you do?',
          },
          options: [
            { ar: 'قيّم أسباب ضعف النقل: هل كان الدعم اللاحق كافياً؟ هل أُتيحت فرص التطبيق؟ دور المدرّب لا ينتهي بالتسليم بل يشمل المتابعة ودعم نقل التعلّم', en: 'Assess the reasons for weak transfer: was follow-up support adequate? Were application opportunities created? The trainer\'s role does not end with delivery — it includes follow-through and learning-transfer support' },
            { ar: 'اقبل النتيجة — نجاح تدريب المدرّبين يعتمد على إرادة المتدرّبين أنفسهم', en: 'Accept the result — training-of-trainers success depends on the trainees\' own will' },
            { ar: 'ألغِ منهجية تدريب المدرّبين وارجع إلى التدريب المباشر فقط', en: 'Cancel the training-of-trainers methodology and revert to direct training only' },
          ],
          correct: 0,
          feedback: {
            ar: 'قبول النتيجة دون تحليل يُفوّت فرصة التعلّم المؤسّسي ويُكرّر الفشل في الدورة التالية. وإلغاء منهجية تدريب المدرّبين استجابة غير متناسبة تتجاهل قيمتها الاستراتيجية في بناء استدامة الأثر. المشكلة الحقيقية غالباً ليست في المحتوى بل في غياب دعم التطبيق بعد التدريب: اجتماعات متابعة، مجتمعات ممارسة، فرص تدريب موجَّه. المدرّب القيادي في المستوى السادس مسؤول عن الأثر الكامل للبرنامج — لا عن التسليم وحده.',
            en: 'Accepting the result without analysis misses the institutional learning opportunity and repeats the failure in the next cycle. Cancelling the training-of-trainers methodology is a disproportionate response that ignores its strategic value for building sustainable impact. The real problem is usually not the content but the absence of post-training application support: follow-up meetings, communities of practice, coaching opportunities. A level-six leadership trainer is responsible for the programme\'s full impact — not just delivery.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q14',
          label: { ar: 'سؤال ١٤', en: 'Question 14' },
          scenario: {
            ar: 'برنامجك الرئيسي سينتهي بعد ثمانية عشر شهراً حين يخرج الممول. ثمانون بالمئة من موظّفيك يعملون على هذا البرنامج حصراً. لا يوجد تمويل بديل مؤكّد حتى الآن.',
            en: 'Your main programme will end in eighteen months when the donor exits. Eighty percent of your staff work exclusively on this programme. There is no confirmed alternative funding yet.',
          },
          question: {
            ar: 'متى يجب أن تبدأ تخطيط الانتقال؟',
            en: 'When should you start transition planning?',
          },
          options: [
            { ar: 'الآن — ثمانية عشر شهراً هي أمد الانتقال نفسه لا هامش احتياطي. ابدأ فوراً برسم خريطة الأدوار والأنظمة والشراكات التي يمكن إبقاؤها وتلك التي تحتاج دعم خروج', en: 'Now — eighteen months is the transition timeline itself, not a buffer. Begin immediately by mapping which roles, systems, and partnerships can survive and which need exit support' },
            { ar: 'بعد اثني عشر شهراً حين يصبح الوضع أوضح', en: 'In twelve months when the situation becomes clearer' },
            { ar: 'بعد تحديد التمويل البديل أولاً — التخطيط قبل ذلك يُحبط الفريق', en: 'After identifying alternative funding first — planning before that demoralises the team' },
          ],
          correct: 0,
          feedback: {
            ar: 'انتظار اثني عشر شهراً يُقلّص إطار العمل إلى النصف ويجعل القرارات الصعبة تُتّخذ تحت ضغط حادّ. وانتظار التمويل البديل قبل التخطيط يُفترض أن الأمان ضروري للتفكير — وهو العكس: التخطيط المبكّر هو ما يفتح خيارات التمويل البديل. الاستدامة المؤسّسية لا تحدث من تلقاء نفسها — القائد في المستوى السادس يُدير نهاية البرامج بنفس الصرامة التي يُدير بها بدايتها.',
            en: 'Waiting twelve months halves the working window and forces difficult decisions under acute pressure. Waiting for alternative funding before planning assumes security is needed to think — the opposite is true: early planning is what opens alternative funding options. Institutional sustainability does not happen by itself — a level-six leader manages programme endings with the same rigour as beginnings.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'l6c-governance-crisis',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'أزمات الحوكمة: قرارات تحت الضغط', en: 'Governance crises: decisions under pressure' },
      lede: {
        ar: 'الحوكمة الجيّدة لا تُختبر في الأيام الهادئة — بل حين يتعارض طلب المانح مع السياسة المؤسّسية، وحين تتضارب الصلاحيات في وقت غير مناسب.',
        en: 'Good governance is not tested in quiet days — but when a funder\'s request contradicts institutional policy, and when authorities conflict at the wrong time.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'أزمات الحوكمة نادراً ما تُعلن عن نفسها بوضوح — تأتي في شكل طلبات تبدو معقولة، وقرارات تبدو عاجلة، وضغوط تبدو لا مفرّ منها. المفتاح هو التعرّف عليها بوصفها أزمة حوكمة قبل أن تُصبح أزمة علاقات عامّة أو قانونية.\n\nثلاثة أنواع شائعة: (١) مانح يطلب تجاوز إجراء داخلي "استثنائياً" بحجّة الإلحاح — وكلّ إلحاح سيكون استثنائياً إن قبلت. (٢) عضو مجلس يتدخّل في قرارات تشغيلية يجب أن تبقى للمدير التنفيذي. (٣) موظّف كبير ينفّذ اتفاقية غير مُفوَّض بها على أساس "سأُبلغ المجلس لاحقاً".',
            en: 'Governance crises rarely announce themselves clearly — they come in the form of requests that seem reasonable, decisions that seem urgent, and pressures that seem unavoidable. The key is recognising them as governance crises before they become PR or legal crises.\n\nThree common types: (1) A funder requesting to bypass an internal procedure "exceptionally" citing urgency — and every urgency will be exceptional once you accept. (2) A board member intervening in operational decisions that should remain with the executive director. (3) A senior employee executing an unauthorised agreement on the basis of "I\'ll inform the board later."',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q4',
          label: { ar: 'سؤال ٤', en: 'Question 4' },
          question: {
            ar: 'مانح يطلب صرف دفعة مالية كبيرة قبل توقيع الاتفاقية الرسمية "لأن نهاية السنة المالية تقترب". ماذا تفعل؟',
            en: 'A funder requests disbursing a large payment before signing the formal agreement "because the fiscal year-end is approaching." What do you do?',
          },
          options: [
            { ar: 'ارفض باحترام وأسرع في إنجاز الاتفاقية — الصرف دون عقد يُعرّضك لمخاطر قانونية وتدقيقية خطيرة', en: 'Decline respectfully and expedite completing the agreement — disbursement without a contract exposes you to serious legal and audit risks' },
            { ar: 'قبل الأموال بإيصال مؤقّت ووقّع الاتفاقية لاحقاً', en: 'Accept the funds with a temporary receipt and sign the agreement later' },
            { ar: 'استشر المحامي أولاً وإن لم يردّ في يومين وافق', en: 'Consult the lawyer first and if no reply within two days, agree' },
          ],
          correct: 0,
          feedback: {
            ar: 'إلحاح المانح — مهما كان حقيقياً — لا يُشكّل مبرّراً لتجاوز إجراء حماية جوهري. المانح الجيّد يفهم هذا. المانح الذي يُلحّ على الصرف دون عقد يستحق أسئلة إضافية لا تسهيلاً إضافياً.',
            en: 'The funder\'s urgency — however genuine — does not justify bypassing a fundamental protection procedure. A good funder understands this. A funder who insists on disbursement without a contract deserves additional questions, not additional facilitation.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q5',
          label: { ar: 'سؤال ٥', en: 'Question 5' },
          question: {
            ar: 'رئيس مجلس الإدارة يُعطي تعليمات مباشرة لمدير برامج تتجاوز صلاحياتك كمدير تنفيذي. كيف تتعامل مع ذلك؟',
            en: 'The board chair gives direct instructions to a programme manager that bypass your authority as executive director. How do you handle this?',
          },
          options: [
            { ar: 'تحدَّث مع الرئيس بشكل خاص: وضّح الإشكال الهيكلي بلغة بناءة واتّفقا على آلية للتواصل تحترم الصلاحيات', en: 'Speak with the chair privately: explain the structural problem in constructive language and agree on a communication mechanism that respects authorities' },
            { ar: 'أبلغ المجلس كاملاً فوراً لوضع حدٍّ للتدخّل', en: 'Inform the full board immediately to put a stop to the interference' },
            { ar: 'اقبل الوضع لأن رئيس المجلس له صلاحية أعلى', en: 'Accept the situation because the board chair has higher authority' },
          ],
          correct: 0,
          feedback: {
            ar: 'هذا تدخّل في صلاحيات تنفيذية — وهو خلل في الحوكمة. لكن التصعيد الفوري للمجلس قد يُوتّر علاقة يمكن حلّها بحوار مباشر. المحادثة الخاصة أولاً، ثم التصعيد إن لم تُحَل.',
            en: 'This is interference in executive authority — a governance dysfunction. But immediate escalation to the full board may strain a relationship solvable by direct dialogue. Private conversation first, then escalation if unresolved.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q6',
          label: { ar: 'سؤال ٦', en: 'Question 6' },
          question: {
            ar: 'اكتشفت أن مدير برامج وقّع اتفاقية خدمات بـ ٢٠,٠٠٠ دولار دون تفويض — "لأن الفرصة كانت ستُفوَّت". ماذا تفعل؟',
            en: 'You discover a programme manager signed a $20,000 service agreement without authorisation — "because the opportunity would have been missed." What do you do?',
          },
          options: [
            { ar: 'وثّق الواقعة، أبلّغ مجلس الإدارة، ابحث عن حلّ للاتفاقية المُبرَمة، وعالج مسألة التفويض مع الموظّف بإجراء رسمي', en: 'Document the incident, notify the board, find a resolution for the concluded agreement, and address the authorisation issue with the employee through a formal procedure' },
            { ar: 'دعها تمر هذه المرة وأصدر تذكيراً بسياسة التفويض لكل الفريق', en: 'Let it pass this time and issue a reminder about the authorisation policy to the whole team' },
            { ar: 'أنهِ عقد الموظّف فوراً كرسالة رادعة', en: 'Terminate the employee\'s contract immediately as a deterrent message' },
          ],
          correct: 0,
          feedback: {
            ar: 'تجاوز التفويض — مهما كانت النيّة حسنة — سابقة خطيرة إن تُرك دون معالجة رسمية. التوثيق + إبلاغ المجلس + معالجة الاتفاقية + إجراء رسمي مع الموظّف: هذا المسار يُوازن المساءلة والتصحيح.',
            en: 'Bypassing authorisation — however good the intent — is a dangerous precedent if left without formal treatment. Documentation + board notification + addressing the agreement + formal procedure with the employee: this path balances accountability and correction.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q15',
          label: { ar: 'سؤال ١٥', en: 'Question 15' },
          scenario: {
            ar: 'موظّف من المستوى الجونيور يُقدّم شكوى رسمية بشأن سلوك أحد أعضاء مجلس الإدارة خلال زيارة ميدانية. رئيس المجلس يطلب منك معالجة الأمر «بتكتّم» دون إشراك المجلس كاملاً.',
            en: 'A junior staff member submits a formal complaint about a board member\'s behaviour during a field visit. The board chair asks you to handle the matter "discreetly" without involving the full board.',
          },
          question: {
            ar: 'ما موقفك؟',
            en: 'What is your position?',
          },
          options: [
            { ar: 'اتّبع إجراء الشكاوى الرسمي بصرف النظر عن هوية المشكوّ عليه — حماية مُقدّم الشكوى تستوجب أن تُعالَج شكاوى أعضاء المجلس عبر مسار لا يعود إلى شبكة المتّهم', en: 'Follow the formal complaints procedure regardless of who the complaint is against — whistleblower protection requires that complaints about board members go through a process that does not loop back through the accused party\'s network' },
            { ar: 'تعامل مع الأمر بتكتّم كما طلب الرئيس — تريد تجنّب توتّر غير ضروري في المجلس', en: 'Handle it discreetly as the chair requested — you want to avoid unnecessary board tension' },
            { ar: 'أبلّغ المجلس كاملاً فوراً دون أي تحقيق أوّلي', en: 'Notify the full board immediately without any preliminary investigation' },
          ],
          correct: 0,
          feedback: {
            ar: 'طلب التكتّم من رئيس المجلس — مهما كانت نيّته — يضع المدير التنفيذي في موقف تضارب مصالح مع التزامه بحماية مُقدّم الشكوى. معالجة شكوى عضو مجلس عبر رئيسه إجراء هيكلياً معيب لأنه يُخضع الجهة الحامية للشكوى لنفوذ المشكوّ عليه. وإبلاغ المجلس كاملاً دون تحقيق أوّلي قد يُضرّ بالعضو ومُقدّم الشكوى معاً. الإجراء الصحيح يتّبع سياسة الحماية المؤسّسية الموجودة — وهذا بالذات ما تُغطّيه حوكمة المستوى السادس.',
            en: 'The chair\'s request for discretion — however well-intentioned — places the executive director in a conflict of interest with their obligation to protect the complainant. Handling a board member complaint through the chair is structurally flawed because it subjects the protective body to the influence of the accused. Notifying the full board without preliminary investigation may harm both the member and the complainant. The correct procedure follows the existing institutional protection policy — and that is precisely what level-six governance covers.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'l6c-partnerships-advanced',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'الشراكات في المواقف الحرجة', en: 'Partnerships in critical situations' },
      lede: {
        ar: 'شراكة ناجحة في الأيام العادية ليست ضماناً لأدائها في الأزمة. الاختبار الحقيقي يأتي حين تتعارض مصالح الشريكين في لحظة حرجة.',
        en: 'A partnership successful in ordinary days is no guarantee of its performance in crisis. The real test comes when partners\' interests conflict at a critical moment.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'في المستوى السادس، تتعامل مع شراكات متعدّدة في وقت واحد، وتُدير تعارضات بين متطلّبات الشراكة ومتطلّبات الحوكمة. المثال الشائع: شريك يطلب بيانات مستفيدين بحجّة "الدعم المشترك" — لكن بيانات المستفيدين مُقيَّدة بسياسة حماية البيانات. أو مانح يُهدّد بسحب التمويل إذا دخلت في شراكة مع منظّمة يعتبرها منافسة.\n\nهذه المواقف تتطلّب قراراً يُوازن العلاقة والسياسة والمبدأ — وهذا بالضبط ما تُعدّ له هذه الوحدة.',
            en: 'At Level 6, you manage multiple partnerships simultaneously and handle conflicts between partnership requirements and governance requirements. A common example: a partner requesting beneficiary data under the guise of "joint support" — but beneficiary data is restricted by the data protection policy. Or a funder threatening to withdraw funding if you enter a partnership with an organisation they consider a competitor.\n\nThese situations require a decision balancing the relationship, the policy, and the principle — and this is exactly what this module prepares you for.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q7',
          label: { ar: 'سؤال ٧', en: 'Question 7' },
          question: {
            ar: 'شريك يطلب قائمة بأسماء وأعداد المستفيدين في منطقتهم المشتركة معك "لتنسيق التدخّل". ما موقفك؟',
            en: 'A partner requests a list of beneficiary names and numbers in your shared area "to coordinate intervention." What is your position?',
          },
          options: [
            { ar: 'ارفض إعطاء بيانات الهوية وعرض بيانات مجمَّعة مجهولة الهوية — هذا يُحقّق هدف التنسيق دون انتهاك الخصوصية', en: 'Decline to share identity data and offer anonymised aggregate data — this achieves the coordination goal without privacy violation' },
            { ar: 'وافق لأن الشريك جزء من المنظومة المشتركة وله حق المعرفة', en: 'Agree because the partner is part of the shared ecosystem and has a right to know' },
            { ar: 'اطلب موافقة المستفيدين أولاً ثم أرسل البيانات', en: 'Request beneficiary consent first then send the data' },
          ],
          correct: 0,
          feedback: {
            ar: 'البيانات المجمَّعة المجهولة تُحقّق هدف التنسيق دون انتهاك الخصوصية. الحصول على موافقة المستفيدين ليس دائماً ممكناً أو عملياً. المبدأ: شارك ما يُحقّق الهدف بأقلّ تعرّض للخصوصية.',
            en: 'Anonymised aggregate data achieves the coordination goal without privacy violation. Obtaining beneficiary consent is not always possible or practical. The principle: share what achieves the goal with minimum privacy exposure.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q8',
          label: { ar: 'سؤال ٨', en: 'Question 8' },
          question: {
            ar: 'مانحك الرئيسي يشترط عدم الشراكة مع منظّمة بعينها. هذه المنظّمة هي الأنسب لتلبية احتياج محدّد في المجتمع. ما قرارك؟',
            en: 'Your main funder conditions no partnership with a specific organisation. This organisation is the most suitable to meet a specific community need. What is your decision?',
          },
          options: [
            { ar: 'ناقش الشرط مع المانح بوضوح: ما المبرّر؟ هل هو قيمي أم تنافسي؟ وقرّر على أساس مهمّتك وليس على أساس الضغط', en: 'Discuss the condition with the funder clearly: what is the rationale? Is it values-based or competitive? Decide based on your mission, not on pressure' },
            { ar: 'وافق الشرط لأن التمويل يُمكّنك من خدمة المجتمع بطرق أخرى', en: 'Accept the condition because funding enables you to serve the community through other means' },
            { ar: 'ادخل الشراكة دون إبلاغ المانح', en: 'Enter the partnership without informing the funder' },
          ],
          correct: 0,
          feedback: {
            ar: 'شرط "لا تتشارك مع X" قد يكون مشروعاً (تعارض قيمي موثّق) أو إشكالياً (منافسة تجارية). فهم الدافع ضروري قبل القبول أو الرفض. الدخول في الشراكة دون إبلاغ المانح يُعرّض الثقة كلياً.',
            en: 'The condition "do not partner with X" may be legitimate (documented values conflict) or problematic (commercial competition). Understanding the motivation is necessary before accepting or refusing. Entering the partnership without informing the funder completely destroys trust.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q16',
          label: { ar: 'سؤال ١٦', en: 'Question 16' },
          scenario: {
            ar: 'تُدير برنامج تدريب مدرّبين بالشراكة مع ثلاث منظّمات. خلال التدريب، إحدى المنظّمات الشريكة تبدأ باستقطاب مدرّبيك المتدرّبين بعروض رواتب أعلى. لا توجد بنود تحظر ذلك في اتفاقية الشراكة.',
            en: 'You are running a training-of-trainers programme in partnership with three organisations. During the training, one partner organisation begins recruiting your trained trainers with offers of higher salaries. There are no clauses prohibiting this in the partnership agreement.',
          },
          question: {
            ar: 'ما استجابتك؟',
            en: 'What is your response?',
          },
          options: [
            { ar: 'ناقش الوضع مع الشريك مباشرةً: هذا السلوك يضرّ بالاستثمار الشبكي كله. اقترح بنداً لتنقّل الكوادر في الاتفاقيات المستقبلية وعالج الوضع الراهن بالحوار قبل التصعيد', en: 'Discuss the situation with the partner directly: this behaviour undermines the whole network\'s investment. Propose a staff-mobility clause for future agreements and address the current situation through dialogue before escalating' },
            { ar: 'أبلّغ الممول فوراً بأن الشريك ينتهك روح حسن النية', en: 'Report the partner to the funder immediately for violating the spirit of good faith' },
            { ar: 'امنع مدرّبيك المتدرّبين من القبول — يجب عليهم تسديد فترة خدمة للبرنامج أولاً', en: 'Prevent your trained trainers from accepting — they owe the programme a return-service period first' },
          ],
          correct: 0,
          feedback: {
            ar: 'إبلاغ الممول فوراً دون محاولة حوار مع الشريك تصعيد غير متناسب يُفجّر شراكة قد تُحلّ بمحادثة مباشرة. ومنع المدرّبين من القبول — إن لم يكن منصوصاً عليه في عقودهم — يُعرّضك لمشكلة قانونية وأخلاقية. الخلاف الناشئ من غياب البند لا يُحلّ بعقوبة بل بحوار ثم بتصميم أفضل للاتفاقيات المستقبلية. القائد في المستوى السادس يرى في هذا الموقف فرصة لتحسين منظومة الشراكة وليس مجرّد تهديداً يستوجب رداً انتقامياً.',
            en: 'Reporting the partner to the funder immediately without attempting dialogue is disproportionate escalation that may fracture a partnership solvable by a direct conversation. Preventing trainers from accepting — if not stipulated in their contracts — exposes you to a legal and ethical problem. A dispute arising from a missing clause is not resolved by punishment but by dialogue and then better future agreement design. A level-six leader sees this situation as an opportunity to improve the partnership system, not merely a threat requiring a reactive response.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'l6c-accountability-advanced',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'المساءلة القيادية: حين أنت المسؤول', en: 'Leadership accountability: when you are the one responsible' },
      lede: {
        ar: 'القيادة تعني المساءلة ليس فقط عمّا تفعله أنت — بل عمّا يفعله فريقك وشركاؤك باسم مؤسّستك.',
        en: 'Leadership means accountability not only for what you do — but for what your team and partners do in the name of your organisation.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'أحد أصعب جوانب المساءلة القيادية هو تحمّل مسؤولية قرارات لم تتّخذها شخصياً — بل تأثّرت بها مؤسّستك أو المستفيدون. المدير التنفيذي مسؤول أمام المجلس عن أداء الفريق. المجلس مسؤول أمام المجتمع عن أداء المنظّمة. هذه المسؤولية المتتالية لا تُقلَّص بالإشارة إلى الآخرين.\n\nالمساءلة القيادية العميقة تعني: حين تحدث مشكلة، السؤال الأول ليس "من يُلام؟" بل "ما الذي أوجد الظرف الذي مكّن هذه المشكلة؟" — والعمل على ذلك.',
            en: 'One of the hardest aspects of leadership accountability is bearing responsibility for decisions you did not personally make — but that affected your organisation or beneficiaries. The executive director is accountable to the board for the team\'s performance. The board is accountable to the community for the organisation\'s performance. This cascading responsibility is not reduced by pointing to others.\n\nDeep leadership accountability means: when a problem occurs, the first question is not "who is to blame?" but "what created the condition that enabled this problem?" — and working on that.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q9',
          label: { ar: 'سؤال ٩', en: 'Question 9' },
          question: {
            ar: 'موظّف في فريقك أساء التعامل مع مستفيد. لم تكن حاضراً. المستفيد يريد تعويضاً ويُهدّد بشكوى علنية. ما موقفك الأوّل؟',
            en: 'An employee on your team mistreated a beneficiary. You were not present. The beneficiary wants compensation and threatens a public complaint. What is your first position?',
          },
          options: [
            { ar: 'تقبّل المسؤولية الإجمالية كمسؤول تنفيذي، تواصل مع المستفيد بجدية، وابدأ تحقيقاً داخلياً مستقلاً', en: 'Accept overall responsibility as executive officer, engage the beneficiary seriously, and begin an independent internal investigation' },
            { ar: 'أوضح للمستفيد أن الأمر يتعلّق بموظّف وليس بالمنظّمة', en: 'Clarify to the beneficiary that the matter involves an employee, not the organisation' },
            { ar: 'أحِل الأمر فوراً للمحامي لتجنّب الشكوى العلنية', en: 'Immediately refer the matter to the lawyer to avoid a public complaint' },
          ],
          correct: 0,
          feedback: {
            ar: 'تصرّف الموظّف باسم المنظّمة — والمنظّمة مسؤولة. القول "هذا موظّف لا المنظّمة" يُخلّ بالمساءلة. قبول المسؤولية + جدية التعامل مع المستفيد + تحقيق داخلي حقيقي = المسار الصحيح.',
            en: 'The employee acted in the organisation\'s name — and the organisation is responsible. Saying "this is an employee, not the organisation" undermines accountability. Accepting responsibility + serious engagement with the beneficiary + genuine internal investigation = the correct path.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q10',
          label: { ar: 'سؤال ١٠', en: 'Question 10' },
          question: {
            ar: 'بعد تحقيق داخلي، وجدت أن خطأ الموظّف نشأ جزئياً من غياب تدريب كافٍ أنت مسؤول عن توفيره. ما الخطوات؟',
            en: 'After an internal investigation, you find that the employee\'s error partly arose from absence of adequate training you were responsible for providing. What are the steps?',
          },
          options: [
            { ar: 'اعترف بالثغرة التدريبية للمجلس والمستفيد، أنجز التدريب الناقص فوراً، وعالج الموقف مع الموظّف بعدالة تأخذ الغياب التدريبي بعين الاعتبار', en: 'Acknowledge the training gap to the board and beneficiary, complete the missing training immediately, and address the situation with the employee fairly, taking the training absence into account' },
            { ar: 'أنجز التدريب الناقص وأنهِ عقد الموظّف لأنه أساء رغم ذلك', en: 'Complete the missing training and end the employee\'s contract because they erred regardless' },
            { ar: 'لا تُشر إلى غياب التدريب علناً لأنه يُضعف موقف الجمعية', en: 'Do not publicly mention the training absence as it weakens the organisation\'s position' },
          ],
          correct: 0,
          feedback: {
            ar: 'المساءلة الصادقة تعني الاعتراف بأخطائك أنت أيضاً — لا التستّر عليها خوفاً من إضعاف الموقف. الاعتراف + التصحيح + العدالة في تعامل الموظّف = نموذج قيادي يبني الثقة ولا يهدمها.',
            en: 'Honest accountability means acknowledging your own errors too — not concealing them for fear of weakening your position. Acknowledgement + Correction + Fair treatment of the employee = a leadership model that builds trust rather than eroding it.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q17',
          label: { ar: 'سؤال ١٧', en: 'Question 17' },
          scenario: {
            ar: 'بعد ثلاث سنوات من بناء شبكة متطوّعين مجتمعية، أنت على وشك الانتقال إلى دور جديد. الشبكة لا تملك عمليات موثّقة ولا خطة خلافة، وكل شيء يسير على أساس العلاقات الشخصية غير الرسمية. خليفتك لن يجد أي مواد تسليم.',
            en: 'After three years of building a community volunteer network, you are about to transition to a new role. The network has no documented processes, no succession plan, and everything runs on informal personal relationships. Your successor will find no handover materials.',
          },
          question: {
            ar: 'ما الذي يكشفه هذا الوضع عن نهجك القيادي وما الذي يجب أن يحدث الآن؟',
            en: 'What does this situation reveal about your leadership approach and what must happen now?',
          },
          options: [
            { ar: 'يكشف عن إخفاق في الاستدامة المؤسّسية — الشبكة المبنية على علاقات شخصية لا على أنظمة موثّقة مشخصَنة لا مؤسَّسة. وثّق العمليات الأساسية والعلاقات وهياكل القرار فوراً، وصمّم خطة تسليم تشاركية مع خليفتك', en: 'It reveals an institutional sustainability failure — a network built on personal relationships rather than documented systems is personalised, not institutionalised. Immediately document core processes, relationships, and decision structures, and co-design a handover plan with your successor' },
            { ar: 'هذا طبيعي — الشبكات المجتمعية مبنية على الثقة الشخصية وليس على الأنظمة', en: 'This is normal — community networks are built on personal trust, not systems' },
            { ar: 'اطلب من المجلس تأجيل انتقالك حتى يتعلّم الخليفة الدور بالعمل إلى جانبك', en: 'Ask the board to delay your transition until the successor learns the role by working alongside you' },
          ],
          correct: 0,
          feedback: {
            ar: 'القول «هذا طبيعي» يُطبّع غياب التوثيق ويترك الشبكة هشّة أمام أي تغيير في القيادة — وهو بالضبط عكس ما تعنيه الاستدامة. وتأجيل الانتقال يؤجّل المشكلة ولا يحلّها إذا لم يُرفق بتوثيق حقيقي. القائد المسؤول يُدرك أن الارتباط الشخصي بالشبكة أصل وليس ضماناً للاستمرار، وأن مهمّته تشمل تحويل ما بناه من رأس مال شخصي إلى بنية مؤسّسية قابلة للنقل. هذا جوهر المساءلة القيادية في المستوى السادس.',
            en: 'Saying "this is normal" normalises the absence of documentation and leaves the network fragile before any leadership change — the exact opposite of what sustainability means. Delaying the transition postpones rather than solves the problem if not paired with genuine documentation. A responsible leader recognises that personal attachment to the network is an asset but not a continuity guarantee, and that their responsibility includes converting what they built from personal capital into a transferable institutional structure. This is the essence of leadership accountability at level six.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'l6c-synthesis',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'سيناريوهات تكاملية', en: 'Integrated scenarios' },
      lede: {
        ar: 'القرار الجيّد في القيادة نادراً ما يكون واضح الإجابة — بل يتطلّب تكامل مبادئ متعدّدة في آنٍ واحد.',
        en: 'A good leadership decision is rarely clear-cut — it requires integrating multiple principles at once.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الوحدات السابقة قدّمت كل مبدأ بشكل منفصل — الاستراتيجية، الحوكمة، الشراكة، المساءلة. في الواقع، هذه المبادئ تتشابك وتتعارض أحياناً. المدير التنفيذي المتمرّس يعرف أن المسألة ليست تطبيق مبدأ واحد — بل إيجاد القرار الذي يُعظّم الالتزام بمجموع المبادئ في ظل الموارد والوقت المتاحين.\n\nالسؤالان التاليان يطرحان سيناريوهات مركّبة تتشابك فيها الاعتبارات.',
            en: 'Previous modules presented each principle separately — strategy, governance, partnership, accountability. In reality, these principles intertwine and sometimes conflict. The seasoned executive director knows that the issue is not applying one principle — but finding the decision that maximises commitment to the total of principles given available resources and time.\n\nThe following two questions present compound scenarios where considerations intertwine.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q11',
          label: { ar: 'سؤال ١١', en: 'Question 11' },
          question: {
            ar: 'مانحك يعرض تمديد تمويل مشروط: تُضيف مكوّن جديد (التدريب المهني) لم يكن في خطّتك الاستراتيجية ولا خبرة فريقك فيه. الرفض يعني فقدان الجزء الحالي من التمويل أيضاً. كيف تفكّر في هذا القرار؟',
            en: 'Your funder offers conditional funding renewal: add a new component (vocational training) not in your strategic plan and your team has no expertise in it. Refusal means losing the current funding portion too. How do you think about this decision?',
          },
          options: [
            { ar: 'قيّم بصدق: هل يمكن بناء خبرة حقيقية أو شراكة تُكمّل النقص في وقت معقول؟ إن لا، الرفض مع شرح الأثر على المستفيدين أفضل من تقديم خدمة ضعيفة الجودة تضرّهم', en: 'Assess honestly: can genuine expertise or a complementary partnership be built in reasonable time? If not, refusal with explanation of impact on beneficiaries is better than delivering poor-quality service that harms them' },
            { ar: 'قبل العرض وأضف المكوّن — يمكن تعلّم التدريب المهني أثناء التنفيذ', en: 'Accept the offer and add the component — vocational training can be learned during implementation' },
            { ar: 'ارفض بحزم لأن الشرط ينتهك استقلاليتك الاستراتيجية', en: 'Firmly refuse because the condition violates your strategic independence' },
          ],
          correct: 0,
          feedback: {
            ar: 'الجواب الوسط هو الأدقّ لأن الخيارين الآخرين يُقدّمان مسؤولية مطلقة (الرفض الحازم) أو استسلاماً أعمى (القبول دون تقييم). القيادة الناضجة تُقيّم جدوى البناء الحقيقي للقدرة قبل القرار.',
            en: 'The middle answer is most accurate because the other two options present absolute responsibility (firm refusal) or blind submission (acceptance without assessment). Mature leadership assesses the feasibility of genuine capacity building before deciding.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q12',
          label: { ar: 'سؤال ١٢', en: 'Question 12' },
          question: {
            ar: 'في اجتماع مجلس الإدارة، عضو يقترح شراكة مع شركة خاصة ذات تأثير إيجابي. لاحقاً علمت أن لهذا العضو مصلحة مالية في الشركة ولم يُفصح. ماذا تفعل؟',
            en: 'In a board meeting, a member proposes a partnership with a private company with positive impact. You later learn this member has a financial interest in the company and did not declare it. What do you do?',
          },
          options: [
            { ar: 'أبلّغ رئيس المجلس فوراً، أطلب تعليق القرار، وادعُ لاجتماع طارئ لمراجعة الاقتراح مع إفصاح كامل من العضو المعني', en: 'Immediately notify the board chair, request suspension of the decision, and call an emergency meeting to review the proposal with full disclosure from the member concerned' },
            { ar: 'تجاوز الأمر إذا كانت الشراكة تبدو جيّدة للمنظّمة فعلاً', en: 'Overlook the matter if the partnership genuinely looks good for the organisation' },
            { ar: 'واجه العضو بشكل خاص وأعطه فرصة للإفصاح قبل إبلاغ أحد', en: 'Confront the member privately and give them a chance to declare before informing anyone' },
          ],
          correct: 0,
          feedback: {
            ar: 'الإشكال ليس جودة الشراكة — بل انتهاك سياسة الإفصاح. الشراكة الجيّدة التي تمّ اقتراحها بتضارب مصالح غير مُعلَن تستوجب إعادة تقييم نظيف بعد الإفصاح الكامل. الجمع بين حسن النيّة ومخالفة الإجراء لا يُلغي الإجراء.',
            en: 'The issue is not the quality of the partnership — but violation of the declaration policy. A good partnership proposed with an undeclared conflict of interest requires a clean re-evaluation after full disclosure. Combining good intent with procedural violation does not eliminate the procedure.',
          },
        },
        {
          type: 'quiz',
          id: 'l6c-q18',
          label: { ar: 'سؤال ١٨', en: 'Question 18' },
          scenario: {
            ar: 'ممول يقترح تمويل توسّع خمس سنوات لبرنامجك، مشروطاً بـ: (أ) تخفيض مجلس إدارتك من تسعة إلى خمسة أعضاء، و(ب) منح الممول صفة مراقب في جميع اجتماعات المجلس. الشرطان جديدان ولم يُناقَشا مع المجلس.',
            en: 'A donor proposes funding a five-year expansion of your programme, conditional on: (a) reducing your board from nine to five members, and (b) granting the donor observer status at all board meetings. Both conditions are new and have not been discussed with the board.',
          },
          question: {
            ar: 'كيف تتعامل مع هذا العرض؟',
            en: 'How do you approach this offer?',
          },
          options: [
            { ar: 'قبل قبول أي شرط أو رفضه، اعرض كليهما على المجلس كاملاً. تكوين المجلس مسألة حوكمة تستوجب موافقة المجلس، ومنح الممول صفة مراقب يمسّ استقلالية المنظّمة. دورك تقديم الشرطين مع تحليلك — لا التفاوض بالنيابة عن المجلس', en: 'Before accepting or rejecting any condition, present both to the full board. Board composition is a governance matter requiring board approval, and granting donor observer status touches organisational independence. Your role is to present both conditions with your analysis — not to negotiate on the board\'s behalf' },
            { ar: 'اقبل الشرطين — توسّع خمس سنوات فرصة استراتيجية كبرى تستوجب مرونة في الحوكمة', en: 'Accept both conditions — a five-year expansion is a major strategic opportunity that warrants governance flexibility' },
            { ar: 'ارفض الشرطين كلياً — أي اشتراط من المانح على الحوكمة انتهاك غير مقبول للحدود', en: 'Reject both conditions outright — any funder conditions on governance are an unacceptable boundary violation' },
          ],
          correct: 0,
          feedback: {
            ar: 'قبول الشرطين مباشرةً يتجاوز صلاحياتك التنفيذية في مسألة هي في جوهرها قرار حوكمي — تكوين المجلس وحضور الممول باجتماعاته مسألتان يقرّرهما المجلس لا المدير التنفيذي. والرفض الحازم الأحادي يُغلق باب حوار ربما ينتهي بتعديل معقول للشروط. المدير التنفيذي في المستوى السادس يُدرك الفرق بين دوره في التفاوض ودور المجلس في القرار الحوكمي — وهذا بالضبط ما تتكامل فيه الاستراتيجية والشراكات والحوكمة والمساءلة في آنٍ واحد.',
            en: 'Accepting the conditions directly exceeds your executive authority on a matter that is fundamentally a governance decision — board composition and donor presence at its meetings are decisions for the board, not the executive director. Outright unilateral refusal closes the door on a dialogue that might end with reasonable adjustments. A level-six executive director understands the difference between their negotiating role and the board\'s governance decision role — and this is precisely where strategy, partnerships, governance, and accountability integrate at once.',
          },
        },
      ],
    },
  ],
};
