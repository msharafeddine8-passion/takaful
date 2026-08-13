import type { CourseContent } from './types';

/**
 * Level 6 — Building and Managing Partnerships.
 *
 * The premise: a partnership built on personal rapport does not survive
 * a staff change. A partnership built on written shared interest can outlast
 * both parties who wrote it. This course is about building the second kind.
 *
 * The recurring distinction throughout is between alliance and partnership:
 * two organisations that cooperate on one activity are allies, not partners.
 * A partnership has a shared problem statement, a written agreement, clear
 * accountability on both sides, and a defined way to end.
 */

export const partnerships: CourseContent = {
  slug: 'partnerships',
  level: 6,
  minutes: 40,
  passMark: 70,
  title: {
    ar: 'بناء الشراكات وإدارتها',
    en: 'Building and Managing Partnerships',
  },
  lede: {
    ar: 'شراكة تقوم على مصلحة مشتركة مكتوبة، لا على علاقة شخصية — وكيف تُنهيها من دون أن تحرق جسراً.',
    en: 'A partnership built on a written shared interest rather than a personal relationship — and how to end one without burning a bridge.',
  },
  outcomes: {
    ar: [
      'تحلّل مصلحة مشتركة قبل عرض شراكة',
      'تكتب مذكّرة تفاهم تحدّد الأدوار والالتزامات',
      'تدير توقّعات الشريك وتتعامل مع تضارب المصالح',
      'تُقيّم شراكة وتُنهيها مع الحفاظ على العلاقة',
    ],
    en: [
      'Analyse a shared interest before proposing a partnership',
      'Write a memorandum of understanding that fixes roles and commitments',
      'Manage a partner\'s expectations and handle a conflict of interest',
      'Evaluate a partnership and end it while keeping the relationship',
    ],
  },
  sources: [
    'UNHCR — Partnership: An Operations Management Handbook for UNHCR\'s Partners (2003)',
    'IFRC — Partnership Strategy and Framework for Cooperation with Civil Society',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'part-foundations',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'ما الشراكة وما ليس شراكة', en: 'What partnership is and is not' },
      lede: {
        ar: 'مجرّد التعاون في نشاط لا يجعل منظّمتين شريكتين. الشراكة الحقيقية لها بنية وكتابة والتزام متبادل.',
        en: 'Cooperating on one activity does not make two organisations partners. Real partnership has structure, writing, and mutual commitment.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الشراكة في العمل الإنساني والمجتمعي كلمة مُحمَّلة أكثر مما تحتمل. في الواقع اليومي، يُطلق عليها كل علاقة تعاون، من المشاركة في نشاط واحد إلى اتفاقيات تنفيذية بعشرات الآلاف من الدولارات. هذا الغموض يُضرّ بالطرفين: يرفع التوقّعات أكثر مما تحتمله العلاقة، ويُفضي إلى خيبة أمل حين تُوزَن بمعيار لم يتّفق عليه أحد.\n\nالشراكة الحقيقية لها أربعة عناصر: مشكلة مشتركة يتّفق عليها الطرفان (لا مجرّد قضية متداخلة)، مساهمة من كلا الطرفين (ليس أحدهم يُنفّذ والآخر يُرخّص)، اتفاقية مكتوبة (لا اتفاق شفهي يتغيّر مع الأشخاص)، وآلية للمراجعة وللإنهاء. ما دون ذلك تعاون، وإطاره مختلف.',
            en: 'Partnership in humanitarian and community work is a word carrying more weight than it should. In daily reality, every form of cooperation is called partnership, from sharing one activity to implementation agreements worth tens of thousands. This ambiguity harms both parties: it raises expectations beyond what the relationship can hold, leading to disappointment when weighed against a standard nobody agreed on.\n\nReal partnership has four elements: a shared problem both parties agree on (not merely overlapping agendas), a contribution from each side (not one executing while the other licences), a written agreement (not a verbal understanding that shifts with personnel), and a mechanism for review and for ending. Anything less is cooperation, and its frame is different.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'شراكة حقيقية', en: 'Real partnership' },
          noTitle: { ar: 'تعاون مؤقت', en: 'Temporary cooperation' },
          yes: {
            ar: ['مشكلة مشتركة مُعرَّفة ومكتوبة', 'مساهمة من كلا الطرفين', 'اتفاقية مكتوبة بأدوار وجداول', 'آلية للتقييم والخروج'],
            en: ['A shared problem defined and written', 'Contribution from both parties', 'Written agreement with roles and timelines', 'Mechanism for review and exit'],
          },
          no: {
            ar: ['نشاط مشترك واحد دون اتفاقية', 'أحد الطرفين يُنفّذ والآخر يُعير اسمه', 'اتفاق شفهي قائم على علاقة شخصية', 'بلا تقييم ولا آلية خروج'],
            en: ['One joint activity with no agreement', 'One party executes, the other lends their name', 'Verbal agreement built on personal relationship', 'No review and no exit mechanism'],
          },
        },
        {
          type: 'quiz',
          id: 'part-q1',
          label: { ar: 'سؤال ١', en: 'Question 1' },
          question: {
            ar: 'جمعية أخرى تريد "الشراكة" معك في توزيع مستلزمات. هم يوفّرون المستلزمات وأنت تُوزّع. ما الوصف الأدق لهذه العلاقة؟',
            en: 'Another organisation wants to "partner" with you on distributing supplies. They provide supplies and you distribute. What is the most accurate description of this relationship?',
          },
          options: [
            { ar: 'ترتيب تنفيذي: أنت تُقدّم خدمة لهم — وهذا يحتاج اتفاقية تنفيذية لا مذكّرة تفاهم', en: 'An implementation arrangement: you are providing a service — this needs an implementation agreement, not a memorandum of understanding' },
            { ar: 'شراكة كاملة لأن كلاً منكما يُساهم بشيء', en: 'A full partnership because each of you contributes something' },
            { ar: 'تعاون غير رسمي لا يحتاج أي توثيق', en: 'Informal cooperation that requires no documentation' },
          ],
          correct: 0,
          feedback: {
            ar: 'حين تكون المساهمة غير متكافئة (واحد يموّل والآخر ينفّذ)، يُسمّى الترتيب "تنفيذياً" لا "شراكة". التسمية تُحدّد طبيعة الاتفاقية والحقوق والمسؤوليات.',
            en: 'When the contribution is unequal (one funds and the other executes), the arrangement is called "implementation" not "partnership." The name determines the nature of the agreement and the rights and responsibilities.',
          },
        },
        {
          type: 'quiz',
          id: 'part-q2',
          label: { ar: 'سؤال ٢', en: 'Question 2' },
          question: {
            ar: 'قبل عرض شراكة على جمعية أخرى، ما السؤال الأهم الذي تجيب عنه أولاً؟',
            en: 'Before proposing a partnership to another organisation, what is the most important question to answer first?',
          },
          options: [
            { ar: 'ما المشكلة المشتركة التي لا نستطيع أياً منا حلّها منفرداً بكفاءة مماثلة؟', en: 'What is the shared problem neither of us can solve alone with equal efficiency?' },
            { ar: 'هل للجمعية الأخرى سمعة جيّدة في المجال؟', en: 'Does the other organisation have a good reputation in the field?' },
            { ar: 'هل لديهم تمويل يمكن الاستفادة منه عبر الشراكة؟', en: 'Do they have funding that can be accessed through partnership?' },
          ],
          correct: 0,
          feedback: {
            ar: 'الشراكة التي تبدأ بالتمويل أو السمعة لا بالمشكلة المشتركة تفقد بوصلتها أول ما يتغيّر الوضع. المشكلة المشتركة هي عمود فقرة أي شراكة ناجحة.',
            en: 'A partnership that starts with funding or reputation rather than a shared problem loses its compass at the first change. The shared problem is the backbone of any successful partnership.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'part-mou',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'مذكّرة التفاهم: الحدّ الأدنى الضروري', en: 'Memorandum of understanding: the necessary minimum' },
      lede: {
        ar: 'مذكّرة التفاهم ليست ورقة بيروقراطية — بل حصيلة نقاش صريح حول من يفعل ماذا وبأي جدول.',
        en: 'A memorandum of understanding is not a bureaucratic formality — it is the outcome of an honest discussion about who does what and on what timeline.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'أكثر شيء يُدمّر الشراكات في العمل المجتمعي هو الغموض — ليس سوء النيّة. حين لا تُكتب الأدوار، كل طرف يتوقّع من الآخر ما لم يُصرَّح به. وحين تتراكم خيبات الأمل هذه دون قناة للحوار، تتحوّل علاقة بدأت بحماس إلى علاقة تُمشَّى.\n\nمذكّرة التفاهم ليست عقداً قانونياً في الغالب — بل إطار يُرسَم فيه ما يتّفق عليه الطرفان بالتحديد. ويمكن تعديلها. لكن وجودها أفضل من غيابها بكثير، لأنها تُجبر الطرفين على خوض المحادثات الصعبة قبل البدء لا بعده.',
            en: 'The most destructive force in community partnerships is ambiguity — not bad intent. When roles are not written, each party expects from the other what was never stated. When these disappointments accumulate without a channel for dialogue, a relationship that started with enthusiasm turns into one that merely survives.\n\nA memorandum of understanding is not usually a legal contract — it is a framework where both parties draw precisely what they agree on. It can be amended. But its presence is far better than its absence, because it forces both parties to have the difficult conversations before the start, not after.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'الطرفان وصفاتهما القانونية والتشغيلية',
              'الهدف المشترك والمشكلة المُعرَّفة التي تعالجها الشراكة',
              'مساهمة كل طرف: مالية، بشرية، لوجستية، معرفية',
              'آلية اتخاذ القرار وحل الخلافات',
              'المدة وشروط التجديد أو الإنهاء',
              'الملكية الفكرية والبيانات: من يملك ماذا',
              'توقيعا ممثّلي الطرفين وتاريخ النفاذ',
            ],
            en: [
              'Both parties and their legal and operational descriptions',
              'The shared goal and defined problem the partnership addresses',
              'Each party\'s contribution: financial, human, logistical, knowledge-based',
              'Decision-making mechanism and dispute resolution',
              'Duration and renewal or termination conditions',
              'Intellectual property and data: who owns what',
              'Signatures of both parties\' representatives and effective date',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'part-q3',
          label: { ar: 'سؤال ٣', en: 'Question 3' },
          question: {
            ar: 'خلال صياغة مذكّرة التفاهم، الشريك يرفض إدراج بند حول ملكية البيانات قائلاً: "الثقة بيننا تكفي". ماذا تفعل؟',
            en: 'During drafting of the MOU, the partner refuses to include a clause on data ownership saying: "Trust between us is enough." What do you do?',
          },
          options: [
            { ar: 'تصرّ بلطف: الثقة لا تلغي الوضوح، وبند الملكية يحمي الطرفين معاً عند أي تغيير مستقبلي', en: 'Insist politely: trust does not replace clarity, and an ownership clause protects both parties at any future change' },
            { ar: 'توافق لأن إصرارك يُشير إلى عدم الثقة وقد يُخرب العلاقة', en: 'Agree because insisting signals distrust and may ruin the relationship' },
            { ar: 'تُرجئ الموضوع حتى تتّضح الشراكة بعد أول نشاط مشترك', en: 'Defer the issue until the partnership clarifies itself after the first joint activity' },
          ],
          correct: 0,
          feedback: {
            ar: 'بنود الملكية والخصوصية ليست تعبيراً عن عدم الثقة — بل حماية للطرفين من نزاعات محتملة في المستقبل. الشريك الجيّد يفهم هذا.',
            en: 'Ownership and privacy clauses are not an expression of distrust — they protect both parties from potential future disputes. A good partner understands this.',
          },
        },
        {
          type: 'quiz',
          id: 'part-q4',
          label: { ar: 'سؤال ٤', en: 'Question 4' },
          question: {
            ar: 'شريكك يريد أن يكون قرار الإنهاء بالتراضي فقط دون آلية فردية. ما المشكلة مع هذا البند؟',
            en: 'Your partner wants the termination decision to require mutual agreement only, with no unilateral mechanism. What is the problem with this clause?',
          },
          options: [
            { ar: 'يُعطي أي طرف حق النقض الدائم ويحوّل الشراكة إلى علاقة يصعب الخروج منها', en: 'It gives either party permanent veto power and turns the partnership into a relationship that is difficult to exit' },
            { ar: 'لا مشكلة — التراضي أفضل دائماً من القرار الفردي', en: 'No problem — mutual agreement is always better than unilateral decision' },
            { ar: 'المشكلة هي أن التراضي بطيء في حالات الطوارئ', en: 'The problem is that mutual agreement is slow in emergencies' },
          ],
          correct: 0,
          feedback: {
            ar: 'شراكة لا يمكن إنهاؤها إلا بالتراضي تصبح قفصاً إن تدهورت العلاقة. آلية الإنهاء الفردية مع إشعار كافٍ تحمي كلا الطرفين وتُبقي الخروج منظّماً ومحترماً.',
            en: 'A partnership that can only be ended by mutual agreement becomes a cage if the relationship deteriorates. A unilateral termination mechanism with sufficient notice protects both parties and keeps the exit organised and respectful.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'part-expectations',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'إدارة التوقّعات وتضارب المصالح', en: 'Managing expectations and conflicts of interest' },
      lede: {
        ar: 'توقّع غير معلَن هو خيبة أمل في انتظار موعدها. المحادثة الصعبة مبكّراً تُوفّر أزمة متأخّرة.',
        en: 'An unstated expectation is a disappointment waiting for its moment. The difficult conversation early saves a crisis later.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'إدارة توقّعات الشريك لا تعني تخفيض سقف طموحاته — بل التأكّد من أن ما يتوقّعه هو بالضبط ما تعهّد به عقد الشراكة. هناك ثلاثة توقّعات شائعة لم يُناقَش أي منها في أغلب الشراكات: من يُقرّر في الأزمة؟ ماذا يحدث إن لم يُسلَّم أحد الطرفين في الموعد؟ وكيف يُتعامَل مع ما هو خارج الاتفاقية؟\n\nتضارب المصالح أمر مختلف: يحدث حين تكون لأحد أطراف الشراكة مصلحة شخصية أو مؤسّسية في قرار يُفترض أن يتّخذه بحيادية. الإفصاح عن تضارب المصالح ليس اعترافاً بالفساد — بل معياراً أخلاقياً يحمي الشريك والعلاقة والمستفيدين.',
            en: 'Managing a partner\'s expectations does not mean lowering their ambitions — it means ensuring that what they expect is exactly what the partnership agreement committed to. There are three common expectations not discussed in most partnerships: who decides in a crisis? What happens if one party does not deliver on time? And how is something outside the agreement handled?\n\nConflict of interest is different: it occurs when one party in a partnership has a personal or institutional interest in a decision they are supposed to make impartially. Declaring a conflict of interest is not an admission of corruption — it is an ethical standard that protects the partner, the relationship, and the beneficiaries.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'رصد صحّة الشراكة عمليّة مستمرّة لا يجب الانتظار حتى نهاية العام لإجرائها. معظم الشراكات التي تنهار تُرسل إشارات تحذيرية مبكّرة لا يلتقطها أحد: انخفاض وتيرة التواصل، تأخّر متكرّر في الالتزامات، قرارات تُتّخذ أحادياً دون تشاور. الرصد الدوري يعني بناء عادة مؤسّسية لقراءة هذه الإشارات قبل أن تتحوّل إلى أزمة.\n\nأبسط أدوات الرصد هي اجتماع دوري — شهري أو كل ربع سنة — يُراجَع فيه تقدّم الالتزامات مقابل الخطة الموضوعة. يُضاف إليه سؤال مفتوح يُطرح في كل لقاء: "هل هناك شيء يُقلقك في الشراكة لم تذكره بعد؟". هذا السؤال البسيط يُطلق محادثات مكبوتة كثيراً ما تحمل في طيّاتها فرصاً حقيقية للتحسين قبل أن تتحوّل إلى خيبات متراكمة تُضرّ بالعلاقة.\n\nحين تُشير مؤشّرات الرصد إلى توتّر أو تراجع، الخطوة الأولى ليست إعداد وثيقة إنهاء — بل استدعاء محادثة صريحة بين ممثّلي الطرفين. كثير من الشراكات القيّمة انهارت لأن أحداً لم يُبادر للحديث في الوقت المناسب. الرصد المنتظم يُحوّل هذه المبادرة من شجاعة فردية استثنائية إلى إجراء مؤسّسي متّفق عليه ومُدوَّن في آلية عمل الشراكة.',
            en: 'Monitoring partnership health is an ongoing process — do not wait until year-end to do it. Most partnerships that collapse send early warning signals that nobody picks up: declining communication frequency, recurring delays in commitments, decisions taken unilaterally without consultation. Regular monitoring means building an institutional habit of reading these signals before they become a crisis.\n\nThe simplest monitoring tool is a periodic meeting — monthly or quarterly — that reviews commitment progress against the agreed plan. Add to it an open question asked at every meeting: "Is there anything worrying you about the partnership that you haven\'t mentioned yet?" This simple question unlocks suppressed conversations that often carry real improvement opportunities before they accumulate into disappointments that harm the relationship.\n\nWhen monitoring indicators point to tension or decline, the first step is not drafting a termination document — it is convening a frank conversation between both parties\' representatives. Many valuable partnerships collapsed because no one initiated the dialogue at the right time. Regular monitoring transforms this initiative from an exceptional act of individual courage into an agreed institutional procedure written into the partnership\'s working mechanism.',
          },
        },
        {
          type: 'quiz',
          id: 'part-q5',
          label: { ar: 'سؤال ٥', en: 'Question 5' },
          question: {
            ar: 'شريكك الذي أسّست معه مبادرة مجتمعية يريد الآن أن تؤهّل ابنه لوظيفة في الجمعية. ما الإجراء الصحيح؟',
            en: 'Your partner who co-founded a community initiative with you now wants you to favour his son for a position at the organisation. What is the correct procedure?',
          },
          options: [
            { ar: 'أُفصح عن وجود تضارب مصالح محتمل وأُحيل القرار لشخص محايد مع الالتزام بالإجراءات المعتادة', en: 'Declare the potential conflict of interest and refer the decision to a neutral person while following normal procedures' },
            { ar: 'تمنحه الأولوية لأن الشراكة تستوجب التكافل المتبادل', en: 'Give him priority because partnership requires mutual solidarity' },
            { ar: 'ترفض الطلب رفضاً قاطعاً وتُبلّغ المجلس فوراً', en: 'Firmly refuse and immediately report to the board' },
          ],
          correct: 0,
          feedback: {
            ar: 'تضارب المصالح لا يعني الفساد بالضرورة — لكنه يتطلّب الإفصاح والإحالة. رفض الطلب مباشرة دون إجراء قد يكون مبالغاً. الإفصاح + الإجراء النظامي هو المسار.',
            en: 'A conflict of interest does not necessarily mean corruption — but it requires declaration and referral. A flat refusal without proper procedure may be disproportionate. Declaration + systematic procedure is the path.',
          },
        },
        {
          type: 'quiz',
          id: 'part-q6',
          label: { ar: 'سؤال ٦', en: 'Question 6' },
          question: {
            ar: 'شريكك يطلب تمديد الاتفاقية ثلاثة أشهر بسبب ظرف طارئ. مذكّرة التفاهم لا تتضمّن بنداً للتمديد. ماذا تفعل؟',
            en: 'Your partner requests a three-month extension due to an emergency. The MOU contains no extension clause. What do you do?',
          },
          options: [
            { ar: 'ناقش الطلب بجدية، وثّق الاتفاق الجديد كملحق مكتوب للمذكّرة الأصلية، وأبلغ أصحاب المصلحة', en: 'Discuss the request seriously, document the new agreement as a written annex to the original MOU, and inform stakeholders' },
            { ar: 'وافق شفهياً لأن الظرف طارئ والكتابة تنتظر', en: 'Agree verbally because the situation is urgent and writing can wait' },
            { ar: 'ارفض لأن المذكّرة لا تُجيز التمديد', en: 'Refuse because the MOU does not permit extension' },
          ],
          correct: 0,
          feedback: {
            ar: 'المرونة في الظروف الطارئة مطلوبة، لكن الاتفاق الشفهي يُعيد الغموض الذي أزالته المذكّرة. الملحق المكتوب يجمع بين المرونة والوضوح.',
            en: 'Flexibility in emergencies is required, but a verbal agreement reintroduces the ambiguity the MOU removed. A written annex combines flexibility with clarity.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'part-evaluation',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'تقييم الشراكة وتجديدها أو إنهائها', en: 'Evaluating a partnership: renewing or ending it' },
      lede: {
        ar: 'الشراكة التي تستمرّ بالزخم لا بالقيمة تستهلك الطاقة ولا تُنتج أثراً يستحق.',
        en: 'A partnership that continues on momentum rather than value consumes energy and produces no impact worth the cost.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'تقييم الشراكة يختلف عن تقييم المشروع: لا يسأل فقط "ما الذي أُنجز؟" بل "هل ما زال وجود هذه الشراكة ضرورياً؟". الشراكات التي تفقد مبرّرها لكنها تستمرّ بحكم العادة والأسبقية تُثقل كاهل الجمعيتين دون مقابل.\n\nإنهاء الشراكة ليس فشلاً — في الغالب هو نضوج. مشروع انتهى، احتياج تغيّر، أولويات تحوّلت — هذه أسباب مشروعة لإنهاء علاقة احترافية بشكل منظّم. الإنهاء الجيّد يشمل: إبلاغاً مسبقاً كافياً، توثيقاً لما أُنجز، إغلاقاً للالتزامات المشتركة، واعتراضاً مُوثَّقاً إن كان هناك نزاع.',
            en: 'Evaluating a partnership differs from evaluating a project: it does not only ask "what was accomplished?" but "is this partnership\'s existence still necessary?" Partnerships that lose their rationale but continue by habit and precedent burden both organisations without return.\n\nEnding a partnership is not failure — usually it is maturity. A project ended, a need changed, priorities shifted — these are legitimate reasons to close a professional relationship in an organised manner. A good closure includes: adequate prior notice, documentation of what was accomplished, closing of shared commitments, and a documented objection if there is a dispute.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'إنهاء الشراكة بشكل محترم فن يستحق الإعداد المسبق. الإنهاء المتسرّع أو العدواني يُلحق ضرراً بالسمعة، ويُربك المستفيدين الذين اعتمدوا على هذه الشراكة، وقد يُحوّل شريكاً سابقاً إلى جهة تحمل ضغينة في وسط مجتمعي ضيّق. في المقابل، الإنهاء المُنظَّم يُثبت نضجاً مؤسّسياً ويُبقي الأبواب مفتوحة للتعاون المستقبلي.\n\nالإنهاء الجيّد يمرّ بثلاث مراحل متتالية. أولاً الإعلام الرسمي: إبلاغ الشريك خطّياً بنيّة الإنهاء في المدة المنصوص عليها في الاتفاقية. ثانياً الإغلاق الكامل للالتزامات: التأكّد من أن كل ما التزم به الطرفان قد نُفِّذ أو تُسوِّيَ بطريقة مكتوبة متّفق عليها — بما يشمل البيانات المشتركة والملكية الفكرية وأي أصول مشتركة. ثالثاً التوثيق: كتابة ملخّص يُعدَّل في سجلّات كلتا المنظّمتين يحفظ ما أُنجز بوضوح ويُشكّل مرجعاً لأي نزاع مستقبلي.\n\nإبلاغ المستفيدين والمانحين المشتركين يجب أن يأتي في التوقيت والأسلوب المناسبَين. الشراكة قد تنتهي، لكن العلاقة بين المنظّمتين لا تنتهي بالضرورة — وكثيراً ما يعود الطرفان للتعاون غير الرسمي أو لشراكة جديدة في سياق مختلف وبشروط أنضج.',
            en: 'Ending a partnership respectfully is an art that merits advance preparation. A hasty or hostile ending damages reputation, disorients beneficiaries who depended on the partnership, and may turn a former partner into one who holds a grudge in a tight community space. By contrast, an organised ending demonstrates institutional maturity and keeps doors open for future cooperation.\n\nA good ending passes through three consecutive stages. First, formal notification: informing the partner in writing of the intention to terminate within the period specified in the agreement. Second, full closure of commitments: ensuring everything both parties committed to has been delivered or settled in a written agreed manner — covering shared data, intellectual property, and any joint assets. Third, documentation: writing a summary updated in both organisations\' records that clearly captures what was accomplished and forms a reference for any future dispute.\n\nInforming shared beneficiaries and funders should come at the right time and in the appropriate manner. The partnership may end, but the relationship between the two organisations does not necessarily end — and the parties often return to informal cooperation or a new partnership in a different context under more mature terms.',
          },
        },
        {
          type: 'quiz',
          id: 'part-q7',
          label: { ar: 'سؤال ٧', en: 'Question 7' },
          question: {
            ar: 'بعد ثلاث سنوات، تُقيّم شراكتك مع جمعية أخرى. وجدت أن المصلحة المشتركة الأصلية حُلّت، لكن الشريك يريد الاستمرار. ماذا تفعل؟',
            en: 'After three years, you evaluate your partnership with another organisation. You find the original shared interest has been resolved, but the partner wants to continue. What do you do?',
          },
          options: [
            { ar: 'ناقش صراحةً وحدّد: هل هناك مشكلة مشتركة جديدة تستوجب الشراكة؟ إن لا، أنهِ بأدب واحترام', en: 'Discuss openly and define: is there a new shared problem warranting partnership? If not, close politely and respectfully' },
            { ar: 'استمرّ لأن العلاقة الجيّدة بحد ذاتها قيمة', en: 'Continue because the good relationship is a value in itself' },
            { ar: 'أنهِ الشراكة فوراً لأن مبرّرها الأصلي انتفى', en: 'End the partnership immediately because its original rationale is gone' },
          ],
          correct: 0,
          feedback: {
            ar: 'الشراكة مبنية على مشكلة لا على علاقة. العلاقة قد تستمرّ دون شراكة رسمية — بالتنسيق والتحويل والتعاون غير الرسمي. الإنهاء المحترم يحفظ كليهما.',
            en: 'Partnership is built on a problem, not a relationship. The relationship may continue without formal partnership — through coordination, referrals, and informal cooperation. Respectful closure preserves both.',
          },
        },
        {
          type: 'quiz',
          id: 'part-q8',
          label: { ar: 'سؤال ٨', en: 'Question 8' },
          question: {
            ar: 'تريد إنهاء شراكة لكن شريكك يتهمك بـ"خيانة الثقة". كيف تتعامل مع هذا؟',
            en: 'You want to end a partnership but your partner accuses you of "betraying trust." How do you handle this?',
          },
          options: [
            { ar: 'أعد للاتفاقية الأصلية: ما المبرّر الذي تمّت الشراكة من أجله وهل هو قائم؟ الحوار المبني على الحقائق أفضل من الردّ على الاتهام', en: 'Return to the original agreement: what was the rationale for the partnership and does it still exist? A fact-based dialogue is better than responding to an accusation' },
            { ar: 'اعتذر وأجّل الإنهاء لتفادي التوتّر', en: 'Apologise and postpone the closure to avoid tension' },
            { ar: 'أبلغ المجلس لإدارة النزاع', en: 'Notify the board to manage the dispute' },
          ],
          correct: 0,
          feedback: {
            ar: 'الاتهام العاطفي يُواجَه بالحقائق لا بالاعتذار ولا بالتصعيد. الاتفاقية الأصلية هي المرجع المحايد الذي يعود إليه كلا الطرفين.',
            en: 'An emotional accusation is met with facts, not apology or escalation. The original agreement is the neutral reference both parties return to.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'part-ecosystem',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'الشراكات في ضوء المنظومة الأوسع', en: 'Partnerships in the wider ecosystem' },
      lede: {
        ar: 'جمعيتك ليست وحيدة في المشهد — وخارطة شراكاتها تُشكّل هوية عملها وأولوياتها في نظر الشركاء والجمهور.',
        en: 'Your organisation is not alone in the landscape — and its partnership map shapes its identity and priorities in the eyes of partners and public alike.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'كثرة الشراكات ليست نجاحاً بالضرورة. شراكة واحدة عميقة وعاملة تُحقّق أثراً أكبر من خمس شراكات اسمية. معيار صحّة منظومة شراكات الجمعية ليس العدد — بل مدى ارتباطها بالأهداف الاستراتيجية وقدرتها الفعلية على التنفيذ.\n\nخارطة الشراكات أيضاً رسالة للعالم الخارجي: من تختار الشراكة معه يُعبّر عن قيمك ومجالك. جمعية تنشر شراكات مع جهات متناقضة القيم تُربك المستفيدين والمانحين على حدٍّ سواء. لذا يستحقّ الاختيار تدقيقاً بالمعايير: التوافق القيمي، القدرة التشغيلية، والأثر المرجوّ.',
            en: 'Many partnerships are not necessarily success. One deep, functioning partnership achieves greater impact than five nominal ones. The measure of an organisation\'s partnership ecosystem health is not the count — but how closely tied it is to strategic goals and its actual delivery capacity.\n\nA partnership map is also a message to the outside world: who you choose to partner with expresses your values and field. An organisation that publicises partnerships with entities holding contradictory values confuses beneficiaries and funders alike. So the selection deserves scrutiny against criteria: value alignment, operational capacity, and desired impact.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'ثلاثة أسئلة قبل أي شراكة جديدة', en: 'Three questions before any new partnership' },
          content: {
            ar: '١. هل هذه الشراكة تُقرّبنا من هدف استراتيجي محدّد؟ ٢. هل لدينا الطاقة التشغيلية لإدارتها بجدية دون إهمال شراكاتنا الحالية؟ ٣. هل قيم الشريك وسياساته (الحماية، المساواة، الشفافية) متوافقة مع قيمنا؟',
            en: '1. Does this partnership bring us closer to a specific strategic goal? 2. Do we have the operational capacity to manage it seriously without neglecting our current partnerships? 3. Are the partner\'s values and policies (protection, equality, transparency) aligned with ours?',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'المنظومة التطوّعية الإقليمية هي مجموع المنظّمات والمبادرات والشبكات العاملة في منطقة جغرافية أو قطاع موضوعاتي مشترك. فهم هذه المنظومة وموقع جمعيّتك فيها شرط أساسي لاتخاذ قرارات شراكة استراتيجية مبنيّة على الأدلة، لا مجرّد على الفرصة المتاحة أو التعرّف الشخصي.\n\nفهم المنظومة يُفيد في ثلاثة أمور حاسمة: أولاً تحديد الشريك الأنسب — من يتخصّص تحديداً في ما نحتاجه؟ ومن هو تكاملياً بطبيعة عمله لا منافساً؟ ثانياً تجنّب الازدواجية — هل هناك جمعية تقدّم هذه الخدمة أصلاً ونحن نُعيد ابتكار ما وُجد بموارد شحيحة؟ ثالثاً الكشف عن الفجوات — ما الخدمات أو الفئات التي لا تُغطّيها أي جهة حالياً، وأين يمكن لشراكة جديدة أن تُحدث فرقاً حقيقياً غير مُكرَّر؟\n\nرسم خارطة المنظومة الإقليمية لا يتطلّب موارد ضخمة. يبدأ بسجل بسيط يُحدَّث دورياً: من يعمل في نفس المجال؟ ما تخصّصاتهم ونطاق خدماتهم؟ هل سبق أن تعاونّا معهم وكيف جرت التجربة؟ ما نوع العلاقة الأمثل — شراكة استراتيجية، تنسيق دوري، إحالة مشتركة، أم تجنّب احترافي؟ هذا السجل يُصبح مرجعاً حيّاً يُعلّم قرارات الشراكة بالحقائق لا بالانطباعات، ويُجنّب الجمعية التشتّت في علاقات لا تُسهم في أهدافها الاستراتيجية.',
            en: 'The regional volunteering ecosystem is the sum of organisations, initiatives, and networks working in a shared geographical area or thematic sector. Understanding this ecosystem and your organisation\'s position within it is an essential prerequisite for making strategic partnership decisions built on evidence, not merely on available opportunity or personal acquaintance.\n\nUnderstanding the ecosystem is useful for three decisive matters: first, identifying the best partner — who specialises exactly in what we need, and who is complementary by the nature of their work rather than a competitor? Second, avoiding duplication — is there an organisation already providing this service and we are reinventing the wheel with scarce resources? Third, uncovering gaps — what services or groups are currently covered by no party, and where could a new partnership make a real, non-duplicated difference?\n\nMapping the regional ecosystem does not require large resources. It begins with a simple register updated periodically: who works in the same field? What are their specialisations and service scope? Have we cooperated with them before and how did the experience go? What is the best type of relationship — strategic partnership, periodic coordination, mutual referral, or professional avoidance? This register becomes a living reference that informs partnership decisions with facts rather than impressions, and keeps the organisation from scattering itself across relationships that do not serve its strategic goals.',
          },
        },
        {
          type: 'quiz',
          id: 'part-q9',
          label: { ar: 'سؤال ٩', en: 'Question 9' },
          question: {
            ar: 'شريك محتمل لديه تمويل وفير لكن سياسة الحماية لديه ضعيفة. هل تدخل في شراكة معه؟',
            en: 'A potential partner has ample funding but a weak protection policy. Do you enter a partnership with them?',
          },
          options: [
            { ar: 'لا — ضعف سياسة الحماية يُعرّض المستفيدين للخطر ويعني أنك قد تكون شريكاً في ضرر', en: 'No — weak protection policy puts beneficiaries at risk and means you may become a partner in harm' },
            { ar: 'نعم، بشرط إضافة بند حماية في مذكّرة التفاهم', en: 'Yes, provided a protection clause is added to the MOU' },
            { ar: 'نعم، التمويل الوفير يُمكّن من تعزيز الحماية داخل الشراكة', en: 'Yes, ample funding enables strengthening protection within the partnership' },
          ],
          correct: 0,
          feedback: {
            ar: 'سياسة الحماية ليست بنداً إضافياً يمكن حلّه بعقد — بل مؤشّر على ثقافة مؤسّسية. الشريك الذي لا يأخذها بجدية الآن لن يلتزم بها في عقد ملحق.',
            en: 'A protection policy is not an add-on clause solvable by contract — it is an indicator of institutional culture. A partner who does not take it seriously now will not commit to it in an annexed agreement.',
          },
        },
        {
          type: 'quiz',
          id: 'part-q10',
          label: { ar: 'سؤال ١٠', en: 'Question 10' },
          question: {
            ar: 'جمعيتك تُدير سبع شراكات حالياً. مديرها يريد إضافة شراكة ثامنة لأنها "فرصة ذهبية". ما الاعتراض المبرَّر؟',
            en: 'Your organisation currently manages seven partnerships. The director wants to add an eighth because it is a "golden opportunity." What is the justified objection?',
          },
          options: [
            { ar: 'إضافة شراكة جديدة دون مراجعة القدرة التشغيلية الحالية يُضعف جودة إدارة جميع الشراكات', en: 'Adding a new partnership without reviewing current operational capacity weakens the quality of managing all partnerships' },
            { ar: 'سبع شراكات الحدّ الأقصى المقبول في العمل المجتمعي', en: 'Seven partnerships is the maximum acceptable in community work' },
            { ar: 'الفرص الذهبية دائماً مشكوك في أمرها ويجب الحذر منها', en: 'Golden opportunities are always suspect and should be treated with caution' },
          ],
          correct: 0,
          feedback: {
            ar: 'العدد ليس المشكلة — القدرة التشغيلية هي الميزان. سبع شراكات مُدارة بجدية أفضل من ثماني مُدارة بنصف الانتباه. السؤال: هل لدينا فريق وعمليات لشراكة إضافية؟',
            en: 'The number is not the problem — operational capacity is the scale. Seven partnerships managed seriously is better than eight managed at half attention. The question: do we have a team and processes for an additional partnership?',
          },
        },
      ],
    },
  ],
};
