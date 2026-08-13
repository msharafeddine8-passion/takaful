import type { CourseContent } from './types';

export const psychologicalFirstAid: CourseContent = {
  slug: 'psychological-first-aid',
  level: 0,
  minutes: 35,
  passMark: 80,
  title: {
    ar: 'الإسعاف النفسي الأوّلي والعناية الذاتية',
    en: 'Psychological First Aid and Self-Care',
  },
  lede: {
    ar: 'الإسعافات النفسية الأولية ليست علاجاً نفسياً — بل استجابة إنسانية مُنظَّمة في اللحظات الأولى بعد الصدمة. يمكنك تقديمها إن تعلّمت متى تستمع ومتى تصمت ومتى تُحيل.',
    en: 'Psychological first aid is not psychological therapy — it is an organised human response in the first moments after trauma. You can provide it if you learn when to listen, when to be silent, and when to refer.',
  },
  outcomes: {
    ar: [
      'تُطبّق المبادئ الثلاثة للإسعافات النفسية: الأمان والهدوء والاتّصال',
      'تتعرّف على علامات الضائقة النفسية الحادّة وتتجنّب التدخّل الضارّ',
      'تُقدّم الدعم الأوّلي المناسب في المواقف الصادمة الميدانية',
      'تُحدّد حدود دورك وتُحيل للمتخصّصين في الوقت الصحيح',
    ],
    en: [
      'Apply the three principles of psychological first aid: safety, calm, and connection',
      'Recognise signs of acute psychological distress and avoid harmful intervention',
      'Provide appropriate initial support in traumatic field situations',
      'Identify the limits of your role and refer to specialists at the right time',
    ],
  },
  sources: [
    'WHO / IASC — Psychological First Aid: Guide for Field Workers (2011)',
    'Sphere Project — The Sphere Handbook: Humanitarian Charter and Minimum Standards (2018)',
    'UNFPA — Mental Health and Psychosocial Support in Humanitarian Settings',
    'IFRC — Caring for Volunteers: A Psychosocial Support Toolkit',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'pfa-principles',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'ما هي الإسعافات النفسية وما ليست', en: 'What psychological first aid is and is not' },
      lede: {
        ar: 'أكثر الأخطاء الشائعة في الدعم النفسي هو المحاولة الحسنة بأسلوب ضارّ — الضغط على الشخص لـ"يتكلّم" قبل أن يكون مستعداً.',
        en: 'The most common mistake in psychological support is the well-intentioned attempt with a harmful method — pressuring the person to "talk" before they are ready.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الإسعافات النفسية الأولية (PFA) هي مجموعة من الاستجابات العملية التي تُقدَّم للأشخاص الذين مرّوا بحدث صادم في مرحلة الأزمة الحادّة — الساعات والأيام الأولى. الهدف ليس "شفاء" الشخص ولا التشخيص، بل تقليل الضيق الحادّ وتعزيز القدرة على التكيّف الطبيعي.\n\nما ليست عليه: ليست علاجاً نفسياً، وليست استشارة، وليست إجبار الشخص على استعادة الحادثة. الاستجابة الضارّة تفرض حديثاً عن الصدمة قبل أن يكون الشخص مستعداً، أو تُعطي وعوداً لا يمكن الوفاء بها.',
            en: 'Psychological First Aid (PFA) is a set of practical responses offered to people who have experienced a traumatic event in the acute crisis phase — the first hours and days. The goal is not to "heal" the person or diagnose them, but to reduce acute distress and strengthen the capacity for natural adaptation.\n\nWhat it is not: it is not psychological therapy, counselling, or forcing the person to relive the incident. A harmful response forces discussion of the trauma before the person is ready, or makes promises that cannot be kept.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'الأمان: أمّن المكان وأزِل المثيرات المباشرة للضيق قدر الإمكان',
              'الهدوء: كن هادئاً بنفسك — هدوءك عدوى إيجابية للشخص المتأثّر',
              'الاتّصال: كن حاضراً بجانب الشخص دون ضغط على الكلام',
              'الفاعلية الذاتية: ساعد الشخص على استعادة إحساسه بالتحكّم في شيء صغير',
              'الاتّصال الاجتماعي: سهِّل تواصله مع عائلته أو شبكة دعمه',
            ],
            en: [
              'Safety: secure the place and remove immediate distress triggers as much as possible',
              'Calm: be calm yourself — your calm is a positive contagion for the affected person',
              'Connection: be present beside the person without pressure to speak',
              'Self-efficacy: help the person regain a sense of control over something small',
              'Social connection: facilitate their contact with family or their support network',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الفرق بين الدعم النفسي والعلاج النفسي ليس تقنياً فحسب — بل هو الخطّ الفاصل الذي يحمي المتطوّع والمستفيد معاً. الإسعافات النفسية الأولية تُقدَّم من إنسان إلى إنسان في اللحظة الحادّة، وهدفها تقليل الضيق المؤقّت وتعزيز القدرة الطبيعية على التكيّف. أما العلاج النفسي فيُقدَّم من متخصّص مرخَّص، ويشمل تشخيص اضطرابات نفسية ومعالجة جذور الصدمة وتطبيق بروتوكولات علاجية محدّدة كالعلاج المعرفي السلوكي.\n\nما لا يجوز للمتطوّع فعله مطلقاً في إطار PFA:\n\nأوّلاً — لا تشخيص: لا تقل لأحد "أنت مصاب باضطراب ما بعد الصدمة" أو أي مصطلح تشخيصي آخر. التشخيص حقّ المتخصّص المرخَّص وحده، وإطلاقه بغير مهارة يُلحق ضرراً حتى حين يكون دقيقاً.\n\nثانياً — لا استعادة مُجبَرة للصدمة: لا تطلب من الشخص أن يعيد رواية تفاصيل ما حدث "لتخليص" ما يحمله — بعض أساليب استعادة الصدمة بدون تأهيل متخصّص تُعمّق الجرح لا تُخفّفه.\n\nثالثاً — لا وعود زائفة: تجنّب عبارات مثل "ستتعافى قريباً" أو "الوقت يشفي كل شيء" — هذه وعود تتجاوز ما تستطيع ضمانه، وحين لا تتحقّق تكسر الثقة التي بنيتها.\n\nرابعاً — لا جلسات استبطان مطوَّلة: الجلسات التي تستهدف تفسير المشاعر العميقة وكشف الطبقات النفسية تتجاوز نطاق PFA وقد تفتح أبواباً ليس لديك أدوات لإغلاقها بأمان. الوعي بهذه الحدود لا يُصغّر دورك — بل يُحدّده بدقّة ويجعل دعمك أكثر أماناً وأثراً.',
            en: 'The difference between psychological support and psychological therapy is not just technical — it is the dividing line that protects both volunteer and beneficiary. Psychological first aid is provided from one person to another at the acute moment, with the goal of reducing temporary distress and strengthening the natural capacity for adaptation. Psychological therapy, by contrast, is provided by a licensed specialist, and involves diagnosing psychological disorders, treating the roots of trauma, and applying specific therapeutic protocols such as cognitive-behavioural therapy.\n\nWhat the volunteer must never do within the PFA framework:\n\nFirst — no diagnosis: do not tell anyone "you have post-traumatic stress disorder" or any other diagnostic term. Diagnosis is the right of the licensed specialist alone, and labelling without expertise causes harm even when it is accurate.\n\nSecond — no forced trauma re-evocation: do not ask the person to retell the details of what happened to "release" what they carry — some trauma re-evocation methods without specialist training deepen the wound rather than ease it.\n\nThird — no false promises: avoid phrases like "you will recover soon" or "time heals everything" — these are promises beyond what you can guarantee, and when they do not materialise they break the trust you built.\n\nFourth — no extended introspection sessions: sessions targeting interpretation of deep emotions and uncovering psychological layers exceed PFA scope and may open doors you have no tools to safely close. Awareness of these boundaries does not diminish your role — it defines it precisely and makes your support safer and more genuinely impactful.',
          },
        },
        {
          type: 'quiz',
          id: 'pfa-q1',
          label: { ar: 'سؤال ١', en: 'Question 1' },
          question: {
            ar: 'شخص تعرّض لحادثة مؤلمة يجلس صامتاً ويرفض الكلام. ما الاستجابة الصحيحة؟',
            en: 'A person who experienced a painful incident is sitting silently and refusing to speak. What is the correct response?',
          },
          options: [
            { ar: 'اجلس بجانبه بهدوء، أخبره أنك هنا إن أراد التحدّث، ولا تُلحّ', en: 'Sit beside them calmly, tell them you are here if they want to talk, and do not insist' },
            { ar: 'شجّعه على التحدّث لأن التعبير عن المشاعر يُساعد في التعافي', en: 'Encourage them to talk because expressing feelings helps recovery' },
            { ar: 'اتصل بمتخصّص نفسي فوراً لأن الصمت علامة خطيرة', en: 'Call a mental health specialist immediately because silence is a serious sign' },
          ],
          correct: 0,
          feedback: {
            ar: 'الصمت بعد الصدمة طبيعي ولا يستوجب ملء فوري. الحضور الهادئ دون ضغط هو ذاته شكل من الدعم. الإلحاح على الكلام قد يُزيد الضيق ويكسر الثقة.',
            en: 'Silence after trauma is natural and does not require immediate filling. Calm presence without pressure is itself a form of support. Insisting on speech may increase distress and break trust.',
          },
        },
        {
          type: 'quiz',
          id: 'pfa-q2',
          label: { ar: 'سؤال ٢', en: 'Question 2' },
          question: {
            ar: 'أيّ مما يلي يُمثّل تدخّلاً ضارّاً في الإسعافات النفسية؟',
            en: 'Which of the following represents a harmful intervention in psychological first aid?',
          },
          options: [
            { ar: 'إخبار الشخص "سيكون كل شيء على ما يرام" لتهدئته', en: 'Telling the person "everything will be fine" to calm them' },
            { ar: 'تأمين مكان آمن وهادئ للشخص', en: 'Providing a safe and quiet place for the person' },
            { ar: 'توفير ماء وطعام وحاجات أساسية', en: 'Providing water, food, and basic needs' },
          ],
          correct: 0,
          feedback: {
            ar: 'وعود التطمين الزائفة ("كل شيء سيكون تمام") تُقوّض الثقة حين لا تتحقّق، وتُنكر واقع الشخص المؤلم. الدعم الصادق يُقرّ بالألم دون ادّعاء السيطرة على المستقبل.',
            en: 'False reassurance promises ("everything will be fine") undermine trust when they do not materialise and deny the person\'s painful reality. Honest support acknowledges pain without claiming control over the future.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'pfa-recognition',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'التعرّف على الضائقة الحادّة وعلامات الخطر', en: 'Recognising acute distress and danger signs' },
      lede: {
        ar: 'ليس كل من يبدو هادئاً بخير، وليس كل من يبكي في خطر. قراءة الحالة بدقّة تحدّد نوع الاستجابة المطلوبة.',
        en: 'Not everyone who appears calm is fine, and not everyone who cries is in danger. Reading the situation accurately determines the type of response needed.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'ردود فعل الصدمة النفسية متنوّعة: بعض الناس يبكون بقوّة، وبعضهم يتجمّدون في صمت تامّ، وبعضهم يضحكون بشكل غير ملائم، وبعضهم يتصرّفون كأن شيئاً لم يحدث. كل هذا طبيعي في المدى القصير — وليس مؤشّراً على الخطورة بحدّ ذاته.\n\nعلامات الخطر التي تستوجب إحالة فورية لمتخصّص: التفكير في إيذاء النفس أو الآخرين، الانفصال التامّ عن الواقع (لا يعرف أين هو أو ما حدث)، العنف أو التهديد، والعجز الكامل عن تلبية الاحتياجات الأساسية بسبب الحالة النفسية.',
            en: 'Reactions to psychological trauma are varied: some people cry intensely, some freeze in complete silence, some laugh inappropriately, some act as if nothing happened. All of this is normal in the short term — and not in itself an indicator of danger.\n\nDanger signs requiring immediate referral to a specialist: thoughts of harming oneself or others, complete disconnection from reality (does not know where they are or what happened), violence or threats, and complete inability to meet basic needs due to psychological state.',
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'علامات تستوجب الإحالة الفورية', en: 'Signs requiring immediate referral' },
          content: {
            ar: 'التحدّث عن إيذاء النفس أو الانتحار. الهلوسة أو الأوهام. العنف الموجَّه نحو الآخرين. الانفصال الكامل عن الواقع. استهلاك مفرط للكحول أو الأدوية كاستجابة للصدمة.',
            en: 'Speaking about self-harm or suicide. Hallucinations or delusions. Violence directed toward others. Complete disconnection from reality. Excessive alcohol or medication use as a trauma response.',
          },
        },
        {
          type: 'quiz',
          id: 'pfa-q3',
          label: { ar: 'سؤال ٣', en: 'Question 3' },
          question: {
            ar: 'شخص مرّ بحادثة صعبة يضحك بشكل لا يتلاءم مع الموقف. هل هذا مقلق؟',
            en: 'A person who went through a difficult incident is laughing in a way that does not fit the situation. Is this concerning?',
          },
          options: [
            { ar: 'قد يكون ردّ فعل صدمة طبيعياً — راقبه وكن حاضراً دون إصدار حكم، وانتبه لعلامات خطر أخرى', en: 'It may be a normal trauma response — observe and be present without judgment, and watch for other danger signs' },
            { ar: 'نعم، الضحك غير المناسب دليل قاطع على ضائقة خطيرة', en: 'Yes, inappropriate laughter is definitive evidence of serious distress' },
            { ar: 'لا، الضحك دليل أنه تعامل مع الموقف بشكل جيّد', en: 'No, laughter is evidence that they handled the situation well' },
          ],
          correct: 0,
          feedback: {
            ar: 'الضحك غير المناسب آلية دفاع شائعة — لا يعني بالضرورة خطورة ولا يعني أن الشخص بخير. الراصد الحكيم يُلاحظ دون حكم ويبحث عن نمط كامل لا علامة منفردة.',
            en: 'Inappropriate laughter is a common defence mechanism — it does not necessarily mean danger, nor does it mean the person is fine. The wise observer watches without judgment and looks for a complete pattern, not a single sign.',
          },
        },
        {
          type: 'quiz',
          id: 'pfa-q4',
          label: { ar: 'سؤال ٤', en: 'Question 4' },
          question: {
            ar: 'شخص تعرّض لحادثة صادمة يقول: "لا معنى لأي شيء. حياتي خلصت". كيف تستجيب؟',
            en: 'A person who experienced a traumatic incident says: "Nothing means anything. My life is over." How do you respond?',
          },
          options: [
            { ar: 'خذ الكلام بجدية، اسأل بشكل مباشر وهادئ: "هل تُفكّر في إيذاء نفسك؟"، وإن أجاب بنعم أو غموض أحِله فوراً للمتخصّص', en: 'Take the words seriously, ask directly and calmly: "Are you thinking of harming yourself?" and if they answer yes or vaguely refer them immediately to a specialist' },
            { ar: 'طمئنه أن هذه المشاعر عادية وستمرّ', en: 'Reassure them that these feelings are normal and will pass' },
            { ar: 'تجنّب السؤال عن الانتحار خشية أن توحي بالفكرة', en: 'Avoid asking about suicide for fear of suggesting the idea' },
          ],
          correct: 0,
          feedback: {
            ar: 'الخوف من السؤال عن الأذى الذاتي أسطورة شائعة — السؤال المباشر والهادئ لا يُوحي بالفكرة، بل يُعطي الشخص إذناً للتعبير ويُمكّنك من الاستجابة الصحيحة. الصمت يُبقيك أعمى.',
            en: 'Fear of asking about self-harm is a common myth — a direct, calm question does not suggest the idea; rather it gives the person permission to express themselves and enables you to respond correctly. Silence keeps you blind.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'pfa-field',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'تطبيق الإسعافات النفسية في الحقل', en: 'Applying psychological first aid in the field' },
      lede: {
        ar: 'الإسعافات النفسية الميدانية تحدث في ظروف ضاغطة بأدوات محدودة — وهذا لا يُلغيها، بل يُشكّل تحدّي تطبيقها.',
        en: 'Field psychological first aid happens under stressful conditions with limited tools — and this does not nullify it, it shapes its application challenge.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'في الحقل، ليس لديك مكتب أو خصوصية أو وقت كافٍ في أحيان كثيرة. لكن يمكنك دائماً:\n\n**الحضور الفيزيائي:** كن في نفس مستوى الشخص (اجلس إن جلس، اقف إن وقف). تجنّب النظر من الأعلى.\n\n**اللغة البسيطة:** "أنا هنا. أنت في أمان الآن. كيف أقدر أساعدك؟" — أسئلة بسيطة مفتوحة لا محاضرات.\n\n**الاحتياجات الأساسية أولاً:** ماء، دفء، مكان جالس — قبل أي كلام عن المشاعر.\n\n**الإحالة ليست فشلاً:** إحالة الشخص لمتخصّص حين يتجاوز الأمر نطاق PFA هي الاستجابة الصحيحة، لا الاستسلام.',
            en: 'In the field, you often do not have an office, privacy, or enough time. But you can always:\n\n**Physical presence:** be at the same level as the person (sit if they sit, stand if they stand). Avoid looking down at them.\n\n**Simple language:** "I am here. You are safe now. How can I help you?" — simple open questions, not lectures.\n\n**Basic needs first:** water, warmth, a place to sit — before any talk about feelings.\n\n**Referral is not failure:** referring the person to a specialist when the situation exceeds PFA scope is the correct response, not surrender.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'التعرّض المتكرّر لمواقف صادمة في الحقل يُراكم ما يُعرف بـ"الصدمة البديلة" أو "إرهاق التعاطف" — وهي حالة يتأثّر فيها المتطوّع بمعاناة الآخرين بشكل تراكمي يؤثّر على صحّته النفسية وقدرته على الاستمرار في العطاء. الوقاية ليست رفاهية بل شرط مهني لاستدامة الخدمة.\n\n**قبل التدخّل:** تأكّد أن لديك نقطة دعم شخصية واضحة — شخص تُبلّغه بوضعك العاطفي وترجع إليه. الذهاب إلى مواقع الأزمات دون شبكة دعم شخصية ليس شجاعة بل خطأ منهجي. اعرف حدودك العاطفية قبل الدخول واتّفق مع نفسك متى ستطلب المساعدة.\n\n**أثناء التدخّل:** راقب إشارات جسدك: التوتّر العضلي المستمرّ، والصداع المتكرّر، والقلق الحادّ — هذه مؤشّرات تستحقّ التوقّف والراحة. خذ فترات راحة قصيرة منتظمة حتى حين تبدو الظروف لا تسمح بذلك. الراحة ليست تخلّياً عن المستفيدين بل استمرارية في الخدمة تحميها من الانهيار.\n\n**بعد التدخّل:** افصل بوعي بين بيئة العمل الميداني وحياتك الشخصية. لا تنقل تفاصيل قصص المستفيدين إلى منزلك، وخصّص وقتاً لأنشطة تمنحك هدوءاً ومسافة من الثقل. تحدّث مع زملائك المتطوّعين عن تجربتك — المحادثة مع من شاركوا الموقف تُحرّر الثقل دون استيجاب متخصّص.\n\nحين تظهر عليك أعراض الصدمة البديلة — كوابيس متكرّرة، أو حساسية مفرطة، أو عزلة اجتماعية، أو فقدان الشعور بالمعنى في العمل — تواصل مع متخصّص نفسي. هذه ليست أعراض ضعف، بل مؤشّرات على جهاز عاطفي بشري يحتاج صيانة مقصودة ليستمرّ في العطاء.',
            en: 'Repeated exposure to traumatic situations in the field accumulates what is known as "vicarious trauma" or "compassion fatigue" — a condition where the volunteer is cumulatively affected by others\' suffering, impacting their mental health and ability to continue giving. Prevention is not a luxury but a professional requirement for service sustainability.\n\n**Before intervention:** ensure you have a clear personal support point — someone you inform of your emotional state and return to. Going to crisis sites without a personal support network is not courage but a systematic error. Know your emotional limits before entering and agree with yourself when you will ask for help.\n\n**During intervention:** monitor your body\'s signals: persistent muscle tension, recurring headaches, and acute anxiety — these are indicators worth stopping and resting for. Take regular short breaks even when circumstances seem not to allow it. Rest is not abandoning beneficiaries — it is service continuity that protects it from collapse.\n\n**After intervention:** consciously separate the field work environment from your personal life. Do not bring the details of beneficiaries\' stories home, and dedicate time to activities that give you calm and distance from the weight. Talk with fellow volunteers about your experience — conversation with those who shared the situation releases the weight without requiring a specialist.\n\nWhen vicarious trauma symptoms appear — recurring nightmares, excessive sensitivity, social withdrawal, or loss of meaning in work — contact a mental health specialist. These are not weakness symptoms; they are indicators of a human emotional system requiring deliberate maintenance to continue giving.',
          },
        },
        {
          type: 'quiz',
          id: 'pfa-q5',
          label: { ar: 'سؤال ٥', en: 'Question 5' },
          question: {
            ar: 'في موقع حادثة مزدحم، شخص يبكي بشدّة ولا يستجيب لكلامك. ما الخطوة الأولى؟',
            en: 'At a crowded incident site, a person is crying intensely and not responding to your words. What is the first step?',
          },
          options: [
            { ar: 'ابتعد به عن الازدحام لمكان أهدأ — الجلبة تُضاعف الضيق قبل أي تدخّل لفظي', en: 'Move them away from the crowd to a quieter place — noise amplifies distress before any verbal intervention' },
            { ar: 'اطلب منه أن يهدأ وأن يتنفّس بعمق', en: 'Ask them to calm down and breathe deeply' },
            { ar: 'اتصل بالإسعاف فوراً', en: 'Call emergency services immediately' },
          ],
          correct: 0,
          feedback: {
            ar: 'البيئة تؤثّر في الحالة النفسية. نقل الشخص لمكان أهدأ يُقلّل المثيرات الحسية ويُمكّن من أي تدخّل لاحق. طلب الهدوء دون تغيير البيئة إحباط مضمون.',
            en: 'The environment affects psychological state. Moving the person to a quieter place reduces sensory stimuli and enables any subsequent intervention. Requesting calm without changing the environment is guaranteed frustration.',
          },
        },
        {
          type: 'quiz',
          id: 'pfa-q6',
          label: { ar: 'سؤال ٦', en: 'Question 6' },
          question: {
            ar: 'بعد يومين من العمل في موقع أزمة، لاحظت أنك أنت نفسك تشعر بإرهاق عاطفي وصعوبة في النوم. ما الإجراء المناسب؟',
            en: 'After two days of working at a crisis site, you notice you yourself feel emotional exhaustion and difficulty sleeping. What is the appropriate action?',
          },
          options: [
            { ar: 'أبلغ مشرفك، خذ استراحة مقصودة، ولا تستمرّ في تقديم PFA أنت بحاجة لدعم — تعبك الصادق ليس ضعفاً', en: 'Inform your supervisor, take a deliberate break, and do not continue providing PFA while you need support — your honest exhaustion is not weakness' },
            { ar: 'استمرّ في العمل — المتأثّرون يحتاجونك أكثر مما تحتاج أنت', en: 'Continue working — those affected need you more than you need yourself' },
            { ar: 'خذ مسكّن نوم وتابع عملك في الصباح', en: 'Take a sleep aid and continue your work in the morning' },
          ],
          correct: 0,
          feedback: {
            ar: 'العامل المُرهَق عاطفياً يُقدّم دعماً أقلّ جودة ويُعرّض نفسه لصدمة ثانوية دائمة. رعاية الذات ليست رفاهية — هي شرط لاستمرار العطاء. بلاغك لمشرفك يحمي المستفيدين وأنت معاً.',
            en: 'An emotionally exhausted worker provides lower quality support and risks permanent secondary trauma. Self-care is not luxury — it is a condition for continued giving. Reporting to your supervisor protects both beneficiaries and yourself.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'pfa-limits',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'حدود الدور والإحالة الصحيحة', en: 'Role limits and correct referral' },
      lede: {
        ar: 'معرفة حدود دورك ليست إقراراً بالعجز — بل علامة على الكفاءة المهنية. الإحالة في الوقت المناسب تُنقذ حياة.',
        en: 'Knowing the limits of your role is not an admission of incapacity — it is a sign of professional competence. Timely referral saves lives.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الإسعافات النفسية الأولية مُصمَّمة للمرحلة الحادّة — الساعات والأيام الأولى. بعد ذلك، من يحتاج دعماً مستمرّاً يستوجب متخصّصاً في الصحة النفسية. الإحالة المناسبة تحتاج إلى معرفة الموارد المتاحة مسبقاً: من هو المتخصّص المتاح في المنطقة؟ ما الخدمات النفسية التي تُتيحها الجمعية أو شركاؤها؟\n\nالإحالة تتطلّب ثلاثة أشياء: شرح سبب الإحالة للشخص بصدق وبدون وصمة، الحصول على موافقته قدر الإمكان، وضمان انتقال المعلومات الضرورية للمتخصّص (مع الحفاظ على السريّة).',
            en: 'Psychological first aid is designed for the acute phase — the first hours and days. After that, those who need ongoing support require a mental health specialist. Appropriate referral requires knowing available resources in advance: who is the available specialist in the area? What psychological services do the organisation or its partners offer?\n\nReferral requires three things: explaining the reason for referral to the person honestly and without stigma, obtaining their consent as much as possible, and ensuring necessary information transfer to the specialist (while maintaining confidentiality).',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'تقنيات التأريض (Grounding) هي أدوات عملية تُساعد الشخص على استعادة حضوره في اللحظة الراهنة حين تطغى المشاعر الشديدة أو الذكريات الصادمة على وعيه. الأكثر استخداماً هو تمرين ٥-٤-٣-٢-١: اطلب من الشخص تسمية خمسة أشياء يراها، أربعة أشياء يستطيع لمسها، ثلاثة أصوات يسمعها، شيئين يشمّهما، وشيئاً واحداً يتذوّقه. يُعيد هذا التمرين انتباه الدماغ من المعالجة العاطفية المكثّفة إلى الحواس الجسدية المحسوسة.\n\nتمرين التأريض الجسدي مفيد أيضاً: اطلب من الشخص وضع قدميه بثبات على الأرض والتركيز على إحساس ثقل جسمه. يمكن إضافة جملة هادئة مثل: "أنا هنا الآن، وهذه اللحظة ستمرّ". هذه التقنيات آمنة تماماً وتُستخدم مع الكبار والأطفال، وتُستخدم قبل الإحالة للمتخصّص أو خلال المتابعة.',
            en: 'Grounding techniques are practical tools that help a person regain their presence in the current moment when intense emotions or traumatic memories overwhelm their awareness. The most widely used is the 5-4-3-2-1 exercise: ask the person to name five things they can see, four things they can touch, three sounds they can hear, two things they can smell, and one thing they can taste. This exercise redirects the brain\'s attention from intense emotional processing to concrete physical senses.\n\nPhysical grounding is also helpful: ask the person to place their feet firmly on the ground and focus on the sensation of their body\'s weight. A quiet phrase can be added such as: "I am here now, and this moment will pass." These techniques are completely safe and used with adults and children alike, and can be used before specialist referral or during follow-up.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'التنفّس العميق من أبسط الأدوات وأكثرها فاعلية في الإسعاف النفسي الأوّلي. تقنية التنفّس المربّع (Box Breathing): أربع ثوانٍ شهيقاً، أربع ثوانٍ حبس النفس، أربع ثوانٍ زفيراً، أربع ثوانٍ توقّفاً — ثم التكرار. هذه الدورة تُنشّط الجهاز العصبي السمبثاوي وتُخفّف استجابة "القتال أو الفرار" في الجسم.\n\nتقنية التنفّس 4-7-8 أعمق: شهيق أربع ثوانٍ، حبس سبع ثوانٍ، زفير ثماني ثوانٍ. الزفير الأطول يُرسل إشارة للجهاز العصبي بأن الخطر انتهى. حين تُعلّم شخصاً في أزمة هذه التقنية، اجلس بجانبه وانفّذها معه — مشاركتك العملية تُقلّل المقاومة وتُسرّع التهدئة. ثلاث دورات تنفّس كافية عادةً لبدء الشعور بالتخفيف.',
            en: 'Deep breathing is one of the simplest and most effective tools in psychological first aid. The Box Breathing technique: four seconds inhale, four seconds holding, four seconds exhale, four seconds pause — then repeat. This cycle activates the sympathetic nervous system and reduces the body\'s "fight or flight" response.\n\nThe 4-7-8 technique is deeper: four seconds inhale, seven seconds holding, eight seconds exhale. The longer exhale sends a signal to the nervous system that the danger has passed. When teaching this technique to someone in crisis, sit beside them and practise it with them — your practical participation reduces resistance and speeds calming. Three breathing cycles are usually enough to begin feeling relief.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'دوائر الدعم النظيري (Peer Support Circles) هي مجموعات صغيرة من المتطوّعين يلتقون بانتظام للحديث عن تجاربهم العاطفية في العمل الميداني. ليست جلسات علاج — بل مساحة محفوظة للاستماع المتبادل دون حكم، ومشاركة استراتيجيات التكيّف.\n\nكيفية تشكيل دائرة دعم ناجحة: ٤-٦ متطوّعين يلتقون كل أسبوعين، مُيسّر معيّن يُدار بالتناوب، قواعد واضحة (السرية، عدم التوجيه غير المطلوب، حق الجميع في الصمت). البحث يُثبت أن المتطوّعين الذين يشاركون في دوائر الدعم النظيري يعانون أقلّ من الإرهاق العاطفي ويستمرّون في التطوّع مدة أطول مقارنة بمن يعملون بمعزل عاطفي.',
            en: 'Peer Support Circles are small groups of volunteers who meet regularly to talk about their emotional experiences in fieldwork. They are not therapy sessions — but a preserved space for mutual listening without judgment, and sharing coping strategies.\n\nHow to form a successful support circle: 4-6 volunteers who meet every two weeks, a designated facilitator who rotates, clear rules (confidentiality, no unsolicited direction, everyone\'s right to silence). Research confirms that volunteers who participate in peer support circles suffer less from emotional burnout and continue volunteering longer compared to those who work in emotional isolation.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'خطّة الرعاية الذاتية ليست رفاهية — بل أداة مهنية تُعيّن كيف تُجدّد طاقتك بعد كل جلسة دعم مكثّفة. تتضمّن ثلاثة أنواع من العناصر: جسدية (نوم كافٍ، نشاط بدني، تغذية منتظمة)، اجتماعية (وقت مع أشخاص لا يُطلبون منك شيئاً)، ونفسية (أنشطة تُعيد معنى الحياة وتُجدّد الفرح).\n\nكمزوّد للإسعاف النفسي، حدّد مسبقاً: ما الثلاثة أشياء التي تُعيد شحن طاقتك بسرعة؟ من الشخص الذي تتصل به حين تشعر بالثقل؟ ما العلامات الجسدية الأولى التي تُشير إلى أنك تُنفق أكثر ممّا تستطيع؟ الوعي المبكّر بهذه العلامات يُمكّنك من التوقّف للراحة قبل الوصول لحالة الإرهاق الكامل.',
            en: 'A self-care plan is not a luxury — it is a professional tool that determines how you renew your energy after each intensive support session. It includes three types of elements: physical (adequate sleep, physical activity, regular nutrition), social (time with people who ask nothing of you), and psychological (activities that restore meaning to life and renew joy).\n\nAs a psychological first aid provider, identify in advance: what are the three things that quickly recharge your energy? Who is the person you call when you feel heavy? What are the first physical signals that indicate you are spending more than you can? Early awareness of these signals allows you to stop for rest before reaching full burnout.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'المرونة النفسية طويلة المدى لا تُبنى في يوم واحد — بل عبر عادات يومية صغيرة تُراكم احتياطياً عاطفياً. ثلاث ممارسات يُثبت البحث فاعليتها للعاملين في الإسعاف والدعم النفسي: (١) الكتابة التأمّلية: خمس دقائق يومياً تكتب فيها ما شعرت به دون رقابة — هذا يُخرج الضغط من داخلك إلى الورق ويُقلّل تأثيره على نومك وتفكيرك. (٢) إيجاد المعنى في العمل: ذكّر نفسك كل أسبوع بقصّة واحدة أثّرت فيها إيجابياً — هذا يُحافظ على الدافعية. (٣) الحدود الزمنية الواضحة: متى تبدأ جلسة الدعم ومتى تنتهي — الغموض الزمني يُطيل الضغط النفسي عليك أكثر من الجلسة نفسها.',
            en: 'Long-term psychological resilience is not built in one day — but through small daily habits that accumulate an emotional reserve. Three practices that research confirms are effective for workers in first aid and psychological support: (1) Reflective writing: five minutes daily writing what you felt without censorship — this releases pressure from inside you onto paper and reduces its effect on your sleep and thinking. (2) Finding meaning in work: remind yourself each week of one story where you made a positive impact — this maintains motivation. (3) Clear time boundaries: when a support session begins and when it ends — time ambiguity prolongs psychological pressure on you more than the session itself.',
          },
        },
        {
          type: 'quiz',
          id: 'pfa-q7',
          label: { ar: 'سؤال ٧', en: 'Question 7' },
          question: {
            ar: 'شخص تدعمه لثلاثة أيام ما زال غير قادر على النوم أو الأكل، ومشتّت الذهن بشكل كامل. ماذا تفعل؟',
            en: 'A person you have been supporting for three days is still unable to sleep or eat, and is completely distracted. What do you do?',
          },
          options: [
            { ar: 'هذا يتجاوز نطاق PFA الأولية — أبلغ مشرفك وأحِله لمتخصّص في الصحة النفسية في أقرب وقت', en: 'This is beyond initial PFA scope — inform your supervisor and refer them to a mental health specialist as soon as possible' },
            { ar: 'استمرّ في دعمه — الجسم يتكيّف تدريجياً', en: 'Continue supporting them — the body adapts gradually' },
            { ar: 'اقترح عليه زيارة طبيب عام للحصول على حبوب نوم', en: 'Suggest he visit a general practitioner for sleeping pills' },
          ],
          correct: 0,
          feedback: {
            ar: 'ثلاثة أيام من العجز عن النوم والأكل مؤشّر واضح على ضائقة حادّة تتجاوز المرحلة الطبيعية. المتخصّص النفسي — لا PFA ولا طبيب عام وحده — هو المسار المناسب.',
            en: 'Three days of inability to sleep or eat is a clear indicator of acute distress beyond the normal phase. A mental health specialist — not PFA or a general practitioner alone — is the appropriate path.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الصحّة النفسية للمتطوّع نفسه ليست رفاهية ثانوية — بل شرط لاستدامة قدرته على مساعدة الآخرين. الإرهاق الرحيمي (Compassion Fatigue) هو حالة استنزاف عاطفي وجسدي تُصيب من يُقدّمون الرعاية والدعم بشكل مستمرّ. علاماته الأولى: فقدان القدرة على التعاطف الذي كان طبيعياً، الإرهاق المستمرّ حتى بعد الراحة، التفكير المتكرّر في حالات العمل خارج أوقات الدوام، وصعوبة فصل نفسك عاطفياً عن الحالات التي تدعمها.\n\nالوقاية تبدأ بالوعي المبكّر: راقب هذه العلامات في نفسك وفي زملائك، وكن الأوّل في طلب الدعم حين تحتاجه. طلب المساعدة ليس ضعفاً في هذا السياق — بل دليل على النضج المهني والوعي الذاتي.',
            en: 'The mental health of the volunteer themselves is not a secondary luxury — but a condition for sustaining their capacity to help others. Compassion Fatigue is a state of emotional and physical exhaustion affecting those who continuously provide care and support. Its early signs: loss of the empathy capacity that was natural, persistent fatigue even after rest, repeated thinking about work cases outside of working hours, and difficulty emotionally separating yourself from the cases you are supporting.\n\nPrevention begins with early awareness: monitor these signs in yourself and your colleagues, and be the first to seek support when you need it. Asking for help is not weakness in this context — it is evidence of professional maturity and self-awareness.',
          },
        },
        {
          type: 'quiz',
          id: 'pfa-q8',
          label: { ar: 'سؤال ٨', en: 'Question 8' },
          question: {
            ar: 'تريد إحالة شخص لمتخصّص لكنه يرفض الفكرة قائلاً "أنا مش مجنون". كيف تتعامل مع هذا؟',
            en: 'You want to refer a person to a specialist but they refuse saying "I am not crazy." How do you handle this?',
          },
          options: [
            { ar: 'أقرّ بمشاعره، أشرح أن المتخصّص ليس للمجانين بل لمن مرّ بظرف صعب وتجاوز ما يمكن لأي إنسان تحمّله وحده', en: 'Acknowledge their feelings, explain that a specialist is not for the "crazy" but for someone who went through a difficult circumstance beyond what any person can bear alone' },
            { ar: 'أبلّغ الأسرة ليُقنعوه بالذهاب', en: 'Inform the family to convince them to go' },
            { ar: 'احترم رفضه وتوقّف عن الإلحاح', en: 'Respect their refusal and stop insisting' },
          ],
          correct: 0,
          feedback: {
            ar: 'الوصمة الاجتماعية للعلاج النفسي حقيقية ومفهومة. معالجتها تحتاج صدقاً لا إجباراً: تطبيع الطلب (هذا لأي شخص مرّ بما مررت به) أفضل من الإحالة للأسرة التي قد تُضاعف الوصمة.',
            en: 'The social stigma of psychological treatment is real and understandable. Addressing it requires honesty, not coercion: normalising the request (this is for anyone who went through what you went through) is better than referral to the family which may amplify the stigma.',
          },
        },
      ],
    },
  ],
};
