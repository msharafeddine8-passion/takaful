import type { CourseContent } from './types';

export const governanceAndAccountability: CourseContent = {
  slug: 'governance-and-accountability',
  level: 6,
  minutes: 45,
  passMark: 70,
  title: {
    ar: 'الحوكمة والشفافية والمساءلة',
    en: 'Governance, Transparency and Accountability',
  },
  lede: {
    ar: 'الحوكمة ليست لوائح تعيق العمل — بل إطار يُوزّع السلطة بشفافية ويحمي الجمعية من قرارات فردية قد تُطيح بها.',
    en: 'Governance is not rules that hinder work — it is a framework that distributes authority transparently and protects an organisation from individual decisions that could bring it down.',
  },
  outcomes: {
    ar: [
      'تشرح الفرق بين صلاحيات مجلس الإدارة والإدارة التنفيذية',
      'تُعدّ سياسات حوكمة رئيسية: تضارب المصالح، وحماية البيانات، والتبليغ',
      'تُصمّم دورة مساءلة من التقرير إلى التعلّم',
      'تُميّز علامات ضعف الحوكمة وتتخذ إجراءات تصحيحية مبكّرة',
    ],
    en: [
      'Explain the difference between the board\'s authority and executive management\'s authority',
      'Prepare key governance policies: conflict of interest, data protection, and reporting',
      'Design an accountability cycle from reporting to learning',
      'Identify signs of weak governance and take early corrective action',
    ],
  },
  sources: [
    'Charities Aid Foundation — Good Governance: A Code for the Voluntary and Community Sector',
    'CIVICUS — Governance in Civil Society Organisations: A Practical Guide',
    'Accountable Now — Transparency and Accountability Framework for CSOs',
    'الاتحاد العربي للتطوّع — معايير الحوكمة في منظّمات المجتمع المدني',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'gov-foundations',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'ما الحوكمة ولماذا تُهمّ', en: 'What governance is and why it matters' },
      lede: {
        ar: 'منظّمة بلا حوكمة مثل سفينة بلا دفّة — تسير ما دامت المياه هادئة، وتغرق في أول عاصفة.',
        en: 'An organisation without governance is like a ship without a rudder — it moves as long as the water is calm, and sinks at the first storm.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الحوكمة هي منظومة القواعد والممارسات والإجراءات التي تُحدّد كيف تتّخذ المنظّمة قراراتها وكيف تُوزَّع الصلاحيات بين أطرافها المختلفة. في العمل التطوّعي والمجتمعي، يزداد أهميتها لأن المنظّمات غير الربحية تعمل بثقة المجتمع، وثقة المانحين، وثقة المستفيدين — والثقة تتآكل بسرعة حين تُتخذ قرارات مصيرية دون شفافية أو محاسبة.\n\nمعظم أزمات المنظّمات التي نسمع عنها — فساد، تمييز، إهدار موارد — لا تنشأ من سوء نيّة الجميع. تنشأ من غياب بنية تُوقف الشخص قبل أن يُخطئ، أو تكشف الخطأ بعد أن يقع. الحوكمة الجيّدة هي هذه البنية.',
            en: 'Governance is the system of rules, practices, and procedures that determines how an organisation makes decisions and how authority is distributed among its different parties. In voluntary and community work, its importance increases because non-profit organisations operate on the trust of the community, funders, and beneficiaries — and trust erodes quickly when fateful decisions are made without transparency or accountability.\n\nMost organisation crises we hear about — corruption, discrimination, resource waste — do not arise from universal bad intent. They arise from the absence of a structure that stops the person before they err, or exposes the error after it occurs. Good governance is that structure.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'الوضوح', en: 'Clarity' },
              text: { ar: 'من يُقرّر ماذا — مجلس الإدارة، المدير التنفيذي، الفريق — وما حدود كل صلاحية', en: 'Who decides what — board, executive director, team — and the limits of each authority' },
            },
            {
              title: { ar: 'الشفافية', en: 'Transparency' },
              text: { ar: 'القرارات والأموال والأداء قابلة للفحص من المستفيدين والمانحين وأصحاب المصلحة', en: 'Decisions, finances, and performance are open to scrutiny by beneficiaries, funders, and stakeholders' },
            },
            {
              title: { ar: 'المساءلة', en: 'Accountability' },
              text: { ar: 'من يتّخذ قراراً يتحمّل مسؤوليته — وهناك آلية لتتبّع ذلك وتصحيحه', en: 'Whoever makes a decision bears its responsibility — and there is a mechanism to track and correct it' },
            },
            {
              title: { ar: 'المشاركة', en: 'Participation' },
              text: { ar: 'أصحاب المصلحة — خاصّة المستفيدين — يُشاركون في قرارات تمسّ حياتهم', en: 'Stakeholders — especially beneficiaries — participate in decisions that affect their lives' },
            },
          ],
        },
        {
          type: 'quiz',
          id: 'gov-q1',
          label: { ar: 'سؤال ١', en: 'Question 1' },
          question: {
            ar: 'منظّمة يُدير فيها المؤسّس كل شيء — التوظيف، المالية، البرامج — دون مجلس إدارة فعلي. ما المخاطرة الجوهرية؟',
            en: 'An organisation where the founder manages everything — hiring, finance, programmes — without an actual board. What is the core risk?',
          },
          options: [
            { ar: 'لا فصل بين صلاحيات الإشراف والتنفيذ، فإذا أخطأ المؤسّس لا أحد بصلاحية تصحيحه', en: 'No separation between oversight and execution authorities — if the founder errs, no one has the authority to correct them' },
            { ar: 'البيروقراطية تُبطئ العمل الميداني', en: 'Bureaucracy slows field work' },
            { ar: 'المانحون لا يُفضّلون المؤسسات التي يُديرها مؤسّسها', en: 'Funders dislike institutions managed by their founder' },
          ],
          correct: 0,
          feedback: {
            ar: 'مبدأ الفصل بين الإشراف والتنفيذ هو قلب الحوكمة الجيّدة. المجلس يُشرف على المدير التنفيذي، والمدير التنفيذي يُشرف على الفريق. غياب المجلس أو ضعفه يُلغي حلقة التحقّق الأولى.',
            en: 'The principle of separating oversight from execution is the heart of good governance. The board oversees the executive director; the executive director oversees the team. Absence or weakness of the board eliminates the first verification loop.',
          },
        },
        {
          type: 'quiz',
          id: 'gov-q2',
          label: { ar: 'سؤال ٢', en: 'Question 2' },
          question: {
            ar: 'ما الفرق الجوهري بين صلاحيات مجلس الإدارة وصلاحيات المدير التنفيذي؟',
            en: 'What is the fundamental difference between the board\'s authority and the executive director\'s authority?',
          },
          options: [
            { ar: 'المجلس يُحدّد الاتجاه الاستراتيجي والرقابة؛ المدير التنفيذي ينفّذ ويُدير العمليات اليومية', en: 'The board sets strategic direction and oversight; the executive director implements and manages daily operations' },
            { ar: 'المجلس يُدير المال والمدير التنفيذي يُدير الناس', en: 'The board manages money and the executive director manages people' },
            { ar: 'المجلس له صلاحية أعلى في كل القرارات بلا استثناء', en: 'The board has higher authority over all decisions without exception' },
          ],
          correct: 0,
          feedback: {
            ar: 'الفصل الصحيح: المجلس يُحدّد "ماذا نريد أن نكون وإلى أين نتجه"، والمدير التنفيذي يُحدّد "كيف نصل". تجاوز هذا الحدّ في أي اتجاه يُخلّ بالحوكمة.',
            en: 'The correct separation: the board determines "what we want to be and where we\'re going"; the executive director determines "how we get there." Overstepping this boundary in either direction disrupts governance.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'gov-policies',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'السياسات الحوكمية الأساسية', en: 'Core governance policies' },
      lede: {
        ar: 'ثلاث سياسات لا يجوز لأي منظّمة جادّة الاستغناء عنها: تضارب المصالح، حماية البيانات، والتبليغ عن المخاوف.',
        en: 'Three policies no serious organisation can do without: conflict of interest, data protection, and concern reporting.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'السياسات الحوكمية ليست وثائق تُكتب لمرّة واحدة وتُنسى — بل أُطر حيّة تُجيب على أسئلة صعبة قبل أن تنشأ. ثلاث سياسات أثبتت أهميّتها في معظم الأدلة الدولية:\n\n**سياسة تضارب المصالح:** تحدّد من هو مُلزَم بالإفصاح، ومتى، وما الإجراء حين يوجد تضارب. تغطي أعضاء المجلس والموظّفين والمتطوّعين في المواقف القيادية. المبدأ: الإفصاح لا يعني التنحّي بالضرورة — بل إبعاد المتضارب عن القرار المحدّد.\n\n**سياسة حماية البيانات:** تُحدّد ما البيانات التي تجمعها الجمعية، لماذا، كيف تُحفظ، من يصل إليها، وكيف تُدمَّر آمناً عند انتهاء الغرض. تحمي المستفيدين والموظّفين والمتطوّعين.\n\n**سياسة التبليغ عن المخاوف (Whistleblowing):** تُعطي أي شخص — موظّف، متطوّع، مستفيد — قناة آمنة للإبلاغ عن مخاوف جدية دون خوف من الانتقام. غيابها يُسكت الشهود الداخليين.',
            en: 'Governance policies are not documents written once and forgotten — they are living frameworks that answer difficult questions before they arise. Three policies have proven their importance in most international evidence:\n\n**Conflict of interest policy:** defines who is obligated to declare, when, and what procedure applies when a conflict exists. Covers board members, employees, and volunteers in leadership positions. Principle: declaration does not necessarily mean recusal — it means removing the conflicted party from the specific decision.\n\n**Data protection policy:** defines what data the organisation collects, why, how it is stored, who accesses it, and how it is securely destroyed when the purpose ends. Protects beneficiaries, employees, and volunteers.\n\n**Whistleblowing policy:** gives any person — employee, volunteer, beneficiary — a safe channel to report serious concerns without fear of retaliation. Its absence silences internal witnesses.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'السياسات المكتوبة لا تُطبَّق تلقائياً لمجرّد وجودها. الجمعية التي تملك سياسة تضارب مصالح لكن لا أحد يُحيل إليها في اللحظة المناسبة تملك ورقة لا أداة. الفجوة بين السياسة المكتوبة والتطبيق الفعلي هي إحدى أشيوع الفجوات في الحوكمة المؤسّسية، وردمها يحتاج مهارة محدّدة لا مجرّد توفّر الوثيقة.\n\nقراءة السياسة وتطبيقها تتضمّن ثلاثة عناصر عملية. أولاً فهم نطاق التطبيق: السياسة تُحدّد لمن وفي أي الحالات تسري — سياسة تضارب المصالح قد تشمل أعضاء المجلس فقط أو تمتدّ للموظّفين والمتطوّعين في المواقع القيادية، ومعرفة هذا النطاق بدقّة هي نقطة البداية. ثانياً تحديد لحظة التطبيق: السياسة لا تُطبَّق بعد وقوع الخطأ بل قبله — الممارسة الجيّدة هي أن يسأل المسؤول نفسه قبل أي قرار مؤثّر: "هل ثمة سياسة تحكم هذا الموقف؟". ثالثاً الرجوع للجهة المختصّة عند الغموض: السياسات لا تُغطّي كل حالة بدقّة، وحين تكون الحالة في منطقة رمادية فالخطوة الصحيحة ليست التصرّف بناءً على التفسير الشخصي بل الرجوع لرئيس المجلس أو المستشار المحدَّد في السياسة.\n\nالقاعدة الذهبية: السياسة ليست عائقاً أمام القرار — بل إطار يجعل القرار أكثر أماناً للفرد وللمنظّمة ولمن يخدمونهم.',
            en: 'Written policies do not apply themselves simply by existing. An organisation that has a conflict of interest policy but where nobody refers to it at the right moment has a document, not a tool. The gap between a written policy and actual application is one of the most common gaps in institutional governance, and bridging it requires a specific skill, not merely possessing the document.\n\nReading and applying a policy involves three practical elements. First, understanding scope: the policy defines who it applies to and in which situations — a conflict of interest policy may cover only board members or extend to employees and volunteers in leadership positions, and knowing this scope precisely is the starting point. Second, identifying the moment of application: the policy is not applied after an error occurs but before — good practice means a responsible person asks themselves before any consequential decision: "Is there a policy that governs this situation?" Third, referring to the designated authority when uncertain: policies do not cover every case precisely, and when a situation falls in a grey area the correct step is not acting on personal interpretation but referring to the board chair or the advisor designated in the policy.\n\nThe golden rule: a policy is not an obstacle to decision-making — it is a framework that makes the decision safer for the individual, the organisation, and those they serve.',
          },
        },
        {
          type: 'quiz',
          id: 'gov-q3',
          label: { ar: 'سؤال ٣', en: 'Question 3' },
          question: {
            ar: 'متطوّع في المشتريات أخبرك بشكل سري أن مورّداً قدّم هدايا لمدير التوريد. ليس لديكم سياسة تبليغ. ماذا تفعل؟',
            en: 'A volunteer in procurement tells you confidentially that a supplier gave gifts to the procurement manager. You have no whistleblowing policy. What do you do?',
          },
          options: [
            { ar: 'حافظ على سريّة المُبلِّغ وأحِل الأمر للمجلس أو أعلى سلطة متاحة، مع توثيق ما بلّغت به', en: 'Maintain the reporter\'s confidentiality and refer the matter to the board or highest available authority, documenting what was reported' },
            { ar: 'واجه مدير التوريد مباشرة لأن الغموض أسوأ', en: 'Confront the procurement manager directly because ambiguity is worse' },
            { ar: 'أخبر المتطوّع أنك لا تستطيع التصرّف دون سياسة رسمية', en: 'Tell the volunteer you cannot act without a formal policy' },
          ],
          correct: 0,
          feedback: {
            ar: 'غياب السياسة لا يُعفيك من المسؤوليّة الأخلاقية. الحدّ الأدنى: سريّة المُبلِّغ + الإحالة للمجلس + التوثيق. ثم تُعالج الفجوة السياسية.',
            en: 'Absence of policy does not relieve you of ethical responsibility. The minimum: reporter\'s confidentiality + board referral + documentation. Then address the policy gap.',
          },
        },
        {
          type: 'quiz',
          id: 'gov-q4',
          label: { ar: 'سؤال ٤', en: 'Question 4' },
          question: {
            ar: 'عضو في مجلس الإدارة أفصح عن تضارب مصالح في قرار شراء. ما الخطوة الصحيحة التالية؟',
            en: 'A board member declared a conflict of interest in a procurement decision. What is the correct next step?',
          },
          options: [
            { ar: 'يغادر العضو غرفة النقاش والتصويت للقرار المحدّد فقط، ويُدوَّن ذلك في المحضر', en: 'The member leaves the discussion and voting room for that specific decision only, and this is recorded in the minutes' },
            { ar: 'يستقيل من المجلس فوراً', en: 'Resign from the board immediately' },
            { ar: 'يبقى في الاجتماع لكن يمتنع عن التصويت فقط', en: 'Remain in the meeting but only abstain from voting' },
          ],
          correct: 0,
          feedback: {
            ar: 'الإفصاح + المغادرة من النقاش والتصويت + التوثيق في المحضر — هذا المثلّث يُعيد الحياد لعملية القرار دون الحاجة لاستقالة كاملة. الاستقالة تُطلَب حين يكون التضارب بنيوياً وليس معزولاً.',
            en: 'Declaration + departure from discussion and voting + documentation in minutes — this triangle restores neutrality to the decision process without requiring full resignation. Resignation is required when the conflict is structural, not isolated.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'gov-accountability-cycle',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'دورة المساءلة: من التقرير إلى التعلّم', en: 'The accountability cycle: from reporting to learning' },
      lede: {
        ar: 'المساءلة التي تتوقّف عند العقاب لا تمنع التكرار. المساءلة الكاملة تُغلق الحلقة بتحليل السبب الجذري وتغيير النظام.',
        en: 'Accountability that stops at punishment does not prevent recurrence. Complete accountability closes the loop by analysing the root cause and changing the system.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'دورة المساءلة في المنظّمات الجيّدة لها أربعة أضلاع: الإبلاغ (ماذا حدث؟)، التحليل (لماذا حدث؟)، الاستجابة (ماذا نُغيّر؟)، والتحقّق (هل التغيير أثّر؟). كثير من المنظّمات تُتقن الضلع الأول وتُضعف الثلاثة الباقية.\n\nالتقارير الداخلية التي تُكتب ثم تُوضَع في درج لا تُحسّن أداءً. المساءلة الفعلية تعني: أن المدير يجلس مع فريقه لمراجعة ما حدث، أن يسأل عمّا كان يمكن فعله بشكل مختلف، وأن يُعدّل العمليات بناء على الجواب — لا أن يُوثّق الخطأ ثم يكرّره.',
            en: 'The accountability cycle in good organisations has four sides: Reporting (what happened?), Analysis (why did it happen?), Response (what do we change?), and Verification (did the change have an effect?). Many organisations master the first side and weaken the remaining three.\n\nInternal reports written then placed in a drawer improve no performance. Real accountability means: the manager sits with their team to review what happened, asks what could have been done differently, and adjusts processes based on the answer — not documenting the error and then repeating it.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'الإبلاغ: يكتب المسؤول تقريراً موضوعياً بالوقائع والأرقام',
              'التحليل: الفريق يُحدّد السبب الجذري — هل هو بشري، تنظيمي، أم ظرفي؟',
              'الاستجابة: تُعدَّل السياسة أو الإجراء أو التدريب بناء على السبب الجذري',
              'التحقّق: في الدورة التالية يُقاس هل تكرّر الخطأ أم لا',
            ],
            en: [
              'Reporting: the responsible person writes an objective report of facts and figures',
              'Analysis: the team identifies the root cause — is it human, organisational, or circumstantial?',
              'Response: policy, procedure, or training is adjusted based on the root cause',
              'Verification: in the next cycle, measurement checks whether the error recurred',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الشفافية المالية ليست مجرّد إفصاح عن الأرقام — بل نظام يُمكّن الأطراف المعنية من قراءة هذه الأرقام وفهمها والتحقّق منها. في المنظّمات التطوّعية الصغيرة والمتوسّطة، يعني هذا في الغالب تجاوز إرسال كشوف حسابية دورية إلى بناء ممارسات تُجسّد الشفافية في الروتين اليومي لا في لحظات الأزمات.\n\nأربع أدوات عملية تُرسّخ الشفافية المالية في الجمعيات. أولاً الموازنة المفصَّلة المعتمَدة من المجلس: لا تكفي موازنة سنوية عامّة — بل موازنة مُبوَّبة توضح كيف خُصّص كل مصدر تمويل لكل نشاط، تُمكّن المجلس من المقارنة بين المخطَّط والفعلي. ثانياً التقرير المالي الشهري: ملخّص مالي (إيرادات، مصروفات، رصيد) يُوزَّع على أعضاء المجلس بانتظام يُحوّل النقاش المالي من حدث سنوي إلى عادة دورية. ثالثاً الفصل بين الصلاحيات المالية: من يُجيز الصرف يختلف عن من يُنفّذه ويختلف عن من يراجع الحسابات — هذا الفصل الثلاثي يُضيّق فجوات التلاعب المحتمل. رابعاً التدقيق الخارجي السنوي: حتى في الجمعيات الصغيرة، مراجعة سنوية من جهة مستقلّة تُضيف طبقة ثقة لا يمكن للتدقيق الداخلي وحده توفيرها.\n\nالأدوات الأربع معاً تُكوّن منظومة شفافية تحمي الجمعية من الأخطاء والتجاوزات وتبني ثقة دائمة مع مانحيها ومجتمعها.',
            en: 'Financial transparency is not merely disclosing numbers — it is a system that enables relevant parties to read, understand, and verify those numbers. In small and medium volunteering organisations, this typically means going beyond sending periodic account statements to building practices that embody transparency in daily routine, not just in moments of crisis.\n\nFour practical tools reinforce financial transparency in organisations. First, a detailed budget approved by the board: a general annual budget is not sufficient — a categorised budget that shows how each funding source was allocated to each activity enables the board to compare planned against actual. Second, monthly financial report: a financial summary (revenues, expenditures, balance) distributed regularly to board members transforms financial discussion from an annual event into a periodic habit. Third, separation of financial authorities: the person who authorises expenditure differs from the one who executes it, who differs from the one who reviews the accounts — this three-way separation narrows gaps for potential manipulation. Fourth, annual external audit: even in small organisations, an annual review by an independent body adds a layer of trust that internal audit alone cannot provide.\n\nThe four tools together form a transparency system that protects the organisation from errors and violations and builds lasting trust with its funders and community.',
          },
        },
        {
          type: 'quiz',
          id: 'gov-q5',
          label: { ar: 'سؤال ٥', en: 'Question 5' },
          question: {
            ar: 'فريقك تأخّر عن تقديم تقرير للمانح في الموعد ثلاث مرات متتالية. حدّد المشكلة الجذرية.',
            en: 'Your team missed a donor report deadline three consecutive times. Identify the root problem.',
          },
          scenario: {
            ar: 'في الحالات الثلاث، تبيّن أن المسؤول عن التقرير يعلم بالموعد لكن مهام أخرى تشغله. المشرف يُذكّره بالموعد عادةً.',
            en: 'In all three cases, it turned out the person responsible for the report knew the deadline but was occupied with other tasks. The supervisor usually reminds them.',
          },
          options: [
            { ar: 'المشكلة تنظيمية — التقرير لا يُدار كمشروع مستقل بجدول واضح، والمسؤوليّة موزّعة بشكل غير محكَم', en: 'Organisational problem — the report is not managed as an independent project with a clear schedule, and responsibility is loosely distributed' },
            { ar: 'المشكلة شخصية — الموظّف غير مؤهّل', en: 'Personal problem — the employee is not competent' },
            { ar: 'المشكلة خارجية — حجم العمل زاد هذه الفترة', en: 'External problem — workload increased this period' },
          ],
          correct: 0,
          feedback: {
            ar: 'التكرار في ثلاث دورات يشير لمشكلة نظامية لا شخصية. الحلّ: جدول مشروع للتقرير مع مراحل وسيطة وشخص واضح المسؤولية — لا مجرّد تذكير شفهي قبل يوم.',
            en: 'Repetition across three cycles points to a systemic, not personal, problem. Solution: a project schedule for the report with intermediate milestones and a clearly responsible person — not just a verbal reminder a day before.',
          },
        },
        {
          type: 'quiz',
          id: 'gov-q6',
          label: { ar: 'سؤال ٦', en: 'Question 6' },
          question: {
            ar: 'مجلس الإدارة يُلاحظ أن التقارير الداخلية المقدَّمة له دائماً إيجابية ولا تُذكر المشكلات. ماذا يعني ذلك غالباً؟',
            en: 'The board notices that internal reports presented to it are always positive with no problems mentioned. What does this usually mean?',
          },
          options: [
            { ar: 'ثقافة التبليغ الداخلي ضعيفة — لا يشعر الفريق بالأمان الكافي لرفع المشكلات للمجلس', en: 'Internal reporting culture is weak — the team does not feel safe enough to escalate problems to the board' },
            { ar: 'المنظّمة تُؤدّي بشكل مثالي فعلاً', en: 'The organisation is actually performing perfectly' },
            { ar: 'المجلس لا يُطرح أمامه تقارير بالتفصيل الكافي', en: 'The board is not presented with reports in sufficient detail' },
          ],
          correct: 0,
          feedback: {
            ar: 'التقارير التي تبدو مثالية دائماً علامة تحذيرية لا مؤشّر صحّة. المنظّمة السليمة تُشارك مشكلاتها بأمان — لأنها تعرف أن المجلس سيساعد في الحلّ لا في العقاب.',
            en: 'Reports that always appear perfect are a warning sign, not a health indicator. A healthy organisation shares its problems safely — because it knows the board will help with solutions, not punishment.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'gov-warning-signs',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'علامات ضعف الحوكمة وكيف تواجهها', en: 'Signs of weak governance and how to address them' },
      lede: {
        ar: 'ضعف الحوكمة نادراً ما يأتي فجأة — له علامات تُرسَل قبل الأزمة بوقت كافٍ لمن يعرف أين يُدقّق.',
        en: 'Weak governance rarely comes suddenly — it sends signals before the crisis with enough time for those who know where to look.',
      },
      blocks: [
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'خمس علامات تحذير مبكّرة', en: 'Five early warning signs' },
          content: {
            ar: '١. شخص واحد يتحكّم في القرارات الماليّة والتشغيلية دون رقابة. ٢. اجتماعات المجلس تُعقد نادراً أو قراراتها شكلية. ٣. غياب سياسة مكتوبة لتضارب المصالح. ٤. الموظّفون يخشون الإبلاغ عن مشكلات داخلية. ٥. التقارير للمانحين والتقارير الداخلية تتعارض في أرقامها.',
            en: '1. One person controls financial and operational decisions without oversight. 2. Board meetings are held rarely or their decisions are ceremonial. 3. Absence of a written conflict of interest policy. 4. Employees fear reporting internal problems. 5. Donor reports and internal reports have contradicting figures.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'فشل الحوكمة لا يعني انهيار المنظّمة — لكنه يعني وجود مشكلة جوهرية تتطلّب استجابة منظّمة لا تصعيداً عاطفياً ولا إنكاراً. التعرّف على لحظة الفشل وامتلاك بروتوكول للاستجابة هو نفسه جزء من الحوكمة الجيّدة، لأن المنظّمات التي تُفكّر مسبقاً فيما تفعله حين تُخطئ تُخطئ بشكل أقل تدميراً.\n\nفشل الحوكمة له مستويات متدرّجة تستوجب استجابات متدرّجة. الفشل المعزول هو قرار خاطئ اتُّخذ خارج الصلاحيات أو إجراء لم يُحترَم — والاستجابة: اعتراف بما حدث، تصحيح فوري، توثيق في السجل الرسمي، ومراجعة ما أفضى إلى هذا الانزلاق. النمط المتكرّر هو إجراء يُخترَق باستمرار أو سياسة لا يُلتزم بها — والاستجابة تستلزم تحليل السبب الجذري: هل السياسة غير عملية؟ هل الفريق لم يُدرَّب كفاية؟ هل هناك ضغط ثقافي لتجاهلها؟ ثم معالجة السبب لا عرَضه. الفشل الهيكلي هو غياب فعلي لأدوار المجلس أو سيطرة فرد على قرارات جماعية دون رقابة — وهنا الاستجابة تتجاوز الفريق التنفيذي وتستلزم تدخّل المجلس كاملاً أو جمعية عمومية طارئة.\n\nالدرس المشترك في كل المستويات: الفشل الذي يُعترف به ويُعالَج بشفافية أقلّ ضرراً على المدى البعيد من الفشل الذي يُخفى ويتراكم حتى يُطيح بالمنظّمة.',
            en: 'Governance failure does not mean the collapse of the organisation — but it does mean a fundamental problem requiring an organised response, not emotional escalation or denial. Recognising the moment of failure and having a response protocol is itself part of good governance, because organisations that think in advance about what to do when they err make less destructive mistakes.\n\nGovernance failure has graduated levels requiring graduated responses. Isolated failure is a wrong decision made outside the defined authority or a procedure that was not followed — the response: acknowledge what happened, correct immediately, document in the official record, and review what led to this slip. A recurring pattern is a procedure consistently breached or a policy consistently ignored — the response requires root cause analysis: is the policy impractical? Was the team insufficiently trained? Is there cultural pressure to ignore it? Then address the cause, not the symptom. Structural failure is the actual absence of board roles or one individual dominating collective decisions without oversight — here the response goes beyond the executive team and requires full board intervention or an emergency general assembly.\n\nThe shared lesson across all levels: failure that is acknowledged and addressed transparently causes less long-term harm than failure that is concealed and accumulates until it brings the organisation down.',
          },
        },
        {
          type: 'quiz',
          id: 'gov-q7',
          label: { ar: 'سؤال ٧', en: 'Question 7' },
          question: {
            ar: 'انتبهت أن أرقام التقرير المقدَّم للمانح تختلف عن أرقام الميزانية الداخلية للربع نفسه. ماذا تفعل؟',
            en: 'You noticed that figures in the donor report differ from the internal budget figures for the same quarter. What do you do?',
          },
          options: [
            { ar: 'طلب تفسير خطّي من المسؤول المالي، وإن لم يُقنع أحِل الأمر للمجلس', en: 'Request a written explanation from the financial officer; if not convincing, refer to the board' },
            { ar: 'افترض أن الفرق خطأ محاسبي وأبلغ المانح بالتصحيح', en: 'Assume the difference is an accounting error and inform the funder of the correction' },
            { ar: 'تجاوز الأمر إن كان الفرق صغيراً دون 5%', en: 'Overlook the matter if the difference is small under 5%' },
          ],
          correct: 0,
          feedback: {
            ar: 'التعارض في الأرقام بين تقريرين — داخلي وخارجي — لنفس الفترة لا يُتجاوَز بغضّ النظر عن حجمه. قد يكون خطأً، وقد يكون أعمق. التفسير الخطّي أولاً، ثم التصعيد إذا لزم.',
            en: 'Contradiction in figures between two reports — internal and external — for the same period is not overlooked regardless of size. It may be an error, or it may be deeper. Written explanation first, then escalation if needed.',
          },
        },
        {
          type: 'quiz',
          id: 'gov-q8',
          label: { ar: 'سؤال ٨', en: 'Question 8' },
          question: {
            ar: 'المجلس لم يجتمع منذ سبعة أشهر وقراراته تُؤخَذ عبر رسائل إلكترونية بين رئيسه والمدير التنفيذي. ما الإجراء التصحيحي؟',
            en: 'The board has not met for seven months and its decisions are made via emails between its chair and the executive director. What is the corrective action?',
          },
          options: [
            { ar: 'عقد اجتماع طارئ للمجلس لمراجعة القرارات الماضية وإعادة ضبط جدول الاجتماعات الدورية', en: 'Hold an emergency board meeting to review past decisions and reset the regular meetings schedule' },
            { ar: 'الاستمرار بالنمط الحالي لأنه أسرع وأكثر مرونة', en: 'Continue the current pattern as it is faster and more flexible' },
            { ar: 'استبدال رئيس المجلس بشخص أكثر التزاماً', en: 'Replace the board chair with a more committed person' },
          ],
          correct: 0,
          feedback: {
            ar: 'المراسلات الثنائية بين الرئيس والمدير التنفيذي لا تحلّ محل اجتماع المجلس — لأن الهيئة هي التي تتّخذ القرار، لا فردان. الاجتماع الطارئ لإعادة ضبط الدورة هو الإجراء التصحيحي المناسب.',
            en: 'Bilateral correspondence between the chair and executive director does not replace a board meeting — because the body makes decisions, not two individuals. An emergency meeting to reset the cycle is the appropriate corrective action.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'gov-external-accountability',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'المساءلة الخارجية: المانحون والمستفيدون والمجتمع', en: 'External accountability: funders, beneficiaries, and community' },
      lede: {
        ar: 'المساءلة الداخلية وحدها لا تكفي — المنظّمة تحاسَب أيضاً أمام من تخدمهم ومن يموّلها ومن تعيش في محيطه.',
        en: 'Internal accountability alone is not enough — the organisation is also accountable to those it serves, those who fund it, and the community in which it operates.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'المساءلة الخارجية في العمل غير الربحي تُغطّي ثلاث دوائر: المانحون (يُريدون معرفة أن أموالهم استُخدمت كما وُعدوا)، المستفيدون (يستحقّون أن يعرفوا ما الذي تعود عليهم من الخدمة ولهم حق الشكوى)، والمجتمع الأوسع (الذي تؤثّر فيه أنشطة الجمعية سلباً أو إيجاباً).\n\nالمستفيدون خاصّة كثيراً ما يُهمَلون في مسار المساءلة — تُكتب التقارير عنهم لا لهم. الممارسة الجيّدة تُشرك المستفيدين في تقييم الخدمة وفي قنوات الشكوى وأحياناً في القرارات الاستراتيجية.',
            en: 'External accountability in non-profit work covers three circles: funders (who want to know their money was used as promised), beneficiaries (who deserve to know what service they receive and have the right to complain), and the wider community (which is positively or negatively affected by the organisation\'s activities).\n\nBeneficiaries especially are often neglected in the accountability chain — reports are written about them, not for them. Good practice involves beneficiaries in service evaluation, complaint channels, and sometimes strategic decisions.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'مساءلة المجلس للإدارة التنفيذية ضرورية لكنها غير كافية وحدها. المجتمع الذي تخدمه الجمعية — المستفيدون، الأسر، السكّان المحيطون — هو الطرف الأكثر تأثّراً بقراراتها وفي الوقت نفسه الأقلّ صوتاً في مساراتها التقليدية. الحوكمة الحديثة تُعيد تعريف المساءلة لتشمل هذا الطرف المغيَّب لا أن تكتفي بالدوائر الرسمية الداخلية.\n\nالمساءلة أمام المجتمع تتجلّى في أربعة مستويات متصاعدة. الأوّل الإبلاغ: إعلام المجتمع بما تفعله الجمعية وما أنجزته — يكفي هنا نشرة دورية أو لقاء مجتمعي سنوي. الثاني الاستماع: إتاحة قناة منتظمة لمعرفة ما يراه المجتمع في الجمعية وما يُقلقه — الاستبيانات وجلسات الحوار المجتمعي أدوات شائعة ومجدية. الثالث الاستجابة: وجود آلية علنية تُوضّح كيف أخذت الجمعية بالتغذية الراجعة — "سمعنا اهتمامكم بهذا الأمر وإليكم ما فعلناه" جملة بسيطة لكن أثرها في بناء الثقة كبير. الرابع المشاركة في القرار: في أعلى درجات المساءلة، يُمثَّل المستفيدون في لجان أو هيئات تشاورية تُأثّر فعلياً على قرارات الجمعية لا مجرّد تُستمَع آراؤها.\n\nالمنظّمة التي تُحاسَب فقط أمام مجلسها تُدار من أعلى إلى أسفل. المنظّمة التي تُحاسَب أيضاً أمام مجتمعها تبني شراكة حقيقية تُعزّز أثرها وتُضفي على عملها شرعية اجتماعية تحميها في الأوقات الصعبة.',
            en: 'The board\'s accountability over executive management is necessary but not sufficient on its own. The community the organisation serves — beneficiaries, families, surrounding residents — is the party most affected by its decisions and at the same time the least heard in its traditional processes. Modern governance redefines accountability to include this marginalised party rather than confining itself to internal formal circles.\n\nAccountability to the community manifests at four ascending levels. First, reporting: informing the community what the organisation does and what it has accomplished — a periodic bulletin or annual community gathering suffices. Second, listening: providing a regular channel to learn what the community sees in the organisation and what concerns it — questionnaires and community dialogue sessions are common and useful tools. Third, responding: having a public mechanism that shows how the organisation acted on feedback — "we heard your concern about this matter and here is what we did" is a simple sentence with a large impact on building trust. Fourth, participation in decision-making: at the highest level of accountability, beneficiaries are represented in committees or consultative bodies that genuinely influence the organisation\'s decisions rather than merely having their opinions heard.\n\nThe organisation accountable only to its board is managed top-down. The organisation also accountable to its community builds a genuine partnership that amplifies its impact and grants its work a social legitimacy that protects it in difficult times.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الفصل بين السلطات داخل الجمعية — بين من يُخطّط ومن يُنفّذ ومن يُراجع — ليس ترفاً إدارياً بل ضمان هيكلي ضد الأخطاء والانتهاكات. حين يملك شخص واحد صلاحية الموافقة على الصرف والتوقيع والمراجعة في آنٍ واحد، لا يوجد فعلياً نظام رقابة — حتى لو كان الشخص نفسه أميناً تمام الأمانة. الأنظمة لا تُبنى على الثقة في الأفراد بل على إجراءات تُصعّب الانتهاك وتُيسّر اكتشافه.\n\nمبدأ التوقيعات المزدوجة في المعاملات المالية الكبرى، وفصل من يأذن بالصرف عمّن يُنفّذه، وآلية تقارير الرقابة الدورية — كلّها تطبيقات عملية لهذا المبدأ. الجمعية التي تقول "نحن نثق ببعض ولا نحتاج كل هذه الإجراءات" تخلط بين الثقة الشخصية ومتطلّبات الحوكمة: الثقة تُبنى في العلاقات، والإجراءات تحمي المؤسّسة من الأخطاء غير المتعمّدة قبل الانتهاكات المتعمّدة.',
            en: 'The separation of powers within the organisation — between those who plan, execute, and review — is not an administrative luxury but a structural safeguard against errors and violations. When one person holds the authority to approve spending, sign off, and conduct review simultaneously, there is effectively no oversight system — even if that person is completely trustworthy. Systems are not built on trust in individuals but on procedures that make violations difficult and their detection easy.\n\nThe principle of dual signatures on major financial transactions, separating who authorises spending from who executes it, and periodic oversight reporting mechanisms — these are all practical applications of this principle. The organisation that says "we trust each other and do not need all these procedures" confuses personal trust with governance requirements: trust is built in relationships, and procedures protect the institution from unintentional errors before intentional violations.',
          },
        },
        {
          type: 'quiz',
          id: 'gov-q9',
          label: { ar: 'سؤال ٩', en: 'Question 9' },
          question: {
            ar: 'مانح كبير يطلب زيادة في وتيرة التقارير من ربع سنوي إلى شهري. هل توافق؟',
            en: 'A major funder requests increasing the reporting frequency from quarterly to monthly. Do you agree?',
          },
          options: [
            { ar: 'ناقش التأثير على الطاقة التشغيلية وحاول التفاوض على وسط، مثل تقرير شهري مختصر وربعي مفصَّل', en: 'Discuss the operational capacity impact and try to negotiate a middle ground, such as a brief monthly report and a detailed quarterly one' },
            { ar: 'وافق فوراً لأن رضا المانح الكبير أولوية', en: 'Agree immediately because satisfying the major funder is a priority' },
            { ar: 'ارفض لأن وتيرة التقارير مُحدَّدة في العقد الأصلي', en: 'Refuse because the reporting frequency is specified in the original contract' },
          ],
          correct: 0,
          feedback: {
            ar: 'التقارير الشهرية التفصيلية تستهلك طاقة تشغيلية حقيقية. النقاش المفتوح مع المانح عن الأثر والتفاوض على حل وسط يحترم الطرفين أفضل من قبول أعمى أو رفض جامد.',
            en: 'Detailed monthly reports consume real operational capacity. Open discussion with the funder about the impact and negotiating a middle ground that respects both parties is better than blind acceptance or rigid refusal.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'بناء الشكاوى وآليات المساءلة في المنظّمة ليس استجابةً لأزمة — بل استثمار وقائي يُجنّب الأزمات الكبرى. الجمعية التي تمتلك آلية شكاوى واضحة ومُفعَّلة تُرسل رسالة ضمنية لمستفيديها ومتطوّعيها: "صوتكم مسموع وسنتصرّف حيال ما تُبلّغون به". هذه الثقة لا يمكن شراؤها بالإعلانات.\n\nالآلية الفعّالة تُجيب على أربعة أسئلة بشكل واضح: كيف أُقدّم شكوى؟ من سيعالجها؟ في كم من الوقت ستُعالَج؟ وكيف ستعرف النتيجة؟ غياب أيٍّ من هذه الإجابات يُقلّل من فاعلية الآلية ويُرسّخ شعوراً بأن الشكاوى تُودَع في درج لا يُفتح.\n\nآليات المساءلة الداخلية تشمل أيضاً المراجعة الدورية لقرارات الإدارة والمالية: من يُراجع القرارات الكبرى؟ وكيف تعرف المنظّمة أن ما يُقرَّر يُنفَّذ فعلاً؟ مجلس الإدارة أو الهيئة المختصّة يُفترض بها أن تُوازن بين الإشراف والثقة — الإشراف المفرط يُشلّ، والثقة العمياء تُعرّض للفساد.\n\nتوثيق قرارات الحوكمة وأسبابها يُوفّر ذاكرة مؤسّسية تحمي الجمعية من التضارب في الروايات حين تتعاقب قيادات مختلفة. قرار اتُّخذ لأسباب وجيهة قبل سنوات قد يبدو غير مفهوم بعد أن يتغيّر نصف المجلس — ما لم يكن موثَّقاً بسياقه الكامل. حوكمة قوية تعني أن الذاكرة المؤسّسية محفوظة في الوثائق، لا في رؤوس الأفراد.',
            en: 'Building complaints and accountability mechanisms in the organisation is not a crisis response — but a preventive investment that averts larger crises. An organisation with a clear, activated complaints mechanism sends an implicit message to its beneficiaries and volunteers: "your voice is heard and we will act on what you report." This trust cannot be purchased with announcements.\n\nAn effective mechanism answers four questions clearly: how do I submit a complaint? Who will process it? In how much time will it be processed? And how will I know the outcome? The absence of any of these answers reduces the mechanism\'s effectiveness and entrenches a feeling that complaints are filed in a drawer that is never opened.',
          },
        },
        {
          type: 'quiz',
          id: 'gov-q10',
          label: { ar: 'سؤال ١٠', en: 'Question 10' },
          question: {
            ar: 'مستفيد قدّم شكوى بأن خدمة الجمعية أضرّت به دون قصد. ليس لديكم آلية شكاوى رسمية. ما الخطوات الفورية؟',
            en: 'A beneficiary complained that the organisation\'s service inadvertently harmed them. You have no formal complaints mechanism. What are the immediate steps?',
          },
          options: [
            { ar: 'استمع للشاكي بجدية، سجّل الشكوى، أجرِ تحقيقاً داخلياً صادقاً، أبلغه بالنتائج والإجراءات المتّخذة، ثم صمّم آلية شكاوى رسمية فوراً', en: 'Listen to the complainant seriously, record the complaint, conduct an honest internal investigation, inform them of findings and actions taken, then design a formal complaints mechanism immediately' },
            { ar: 'وضّح للمستفيد أن الضرر لم يكن مقصوداً واعتذر شفهياً', en: 'Clarify to the beneficiary that the harm was unintentional and apologise verbally' },
            { ar: 'أحل الأمر لمحامي الجمعية لتجنّب أي مسؤولية قانونية', en: 'Refer the matter to the organisation\'s lawyer to avoid any legal liability' },
          ],
          correct: 0,
          feedback: {
            ar: 'الشكوى المُقدَّمة — حتى دون آلية رسمية — تستوجب استجابة جادة ومنظّمة. الاستماع + التحقيق + الإبلاغ بالنتائج = حدّ أدنى غير قابل للتفاوض. ثم يأتي بناء الآلية الدائمة.',
            en: 'A submitted complaint — even without a formal mechanism — requires a serious and organised response. Listening + Investigation + Reporting findings = a non-negotiable minimum. Then building the permanent mechanism comes next.',
          },
        },
      ],
    },
  ],
};
