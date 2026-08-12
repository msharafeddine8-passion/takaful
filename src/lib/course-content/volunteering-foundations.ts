import type { CourseContent } from './types';

/**
 * Level 1 · Course 1 — Foundations of Volunteering.
 * Universal content: written for any volunteer in any organisation, anywhere.
 * Grounded in IFRC, Keeping Children Safe, CHS and UNV frameworks.
 */
export const volunteeringFoundations: CourseContent = {
  slug: 'volunteering-foundations',
  level: 1,
  // Measured from the content, not aspired to. Every course here claimed
  // roughly three times what it held, and a card promising ninety minutes
  // that delivers thirty is broken before anyone starts reading.
  minutes: 30,
  passMark: 70,
  title: {
    ar: 'أساسيات العمل التطوعي',
    en: 'Foundations of Volunteering',
  },
  lede: {
    ar: 'ما هو التطوّع، ولماذا نقوم به، وما المبادئ التي تحكمه — وكيف تحمي نفسك ومَن تخدمهم منذ يومك الأول. محتوى مبنيّ على معايير دولية، صالح لأي متطوّع في أي منظمة وأي بلد.',
    en: 'What volunteering is, why we do it, and the principles that govern it — and how to protect yourself and those you serve from day one. Built on international standards, for any volunteer in any organisation, anywhere.',
  },
  outcomes: {
    ar: [
      'تُعرّف العمل التطوعي وتميّزه عمّا ليس تطوّعاً',
      'تشرح قيمة التطوّع للفرد والمجتمع بأمثلة واقعية',
      'تطبّق المبادئ الإنسانية السبعة على مواقف ميدانية',
      'تعدّد حقوقك وواجباتك كمتطوّع في أي منظمة',
      'تتصرّف بأمان وتعرف متى وكيف تُبلّغ',
      'تلتزم بقواعد حماية الطفل غير القابلة للتفاوض',
    ],
    en: [
      'Define volunteering and distinguish it from what it is not',
      'Explain the value of volunteering to individuals and communities',
      'Apply the seven humanitarian principles to real field situations',
      'State your rights and responsibilities as a volunteer in any organisation',
      'Act safely and know when and how to report',
      'Follow the non-negotiable rules of child safeguarding',
    ],
  },
  sources: [
    'IFRC Volunteering Policy (August 2022)',
    'The seven Fundamental Principles of the International Red Cross and Red Crescent Movement',
    'International Child Safeguarding Standards — Keeping Children Safe',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
    'State of the World’s Volunteerism Report — UN Volunteers',
    'Do No Harm principle in humanitarian action',
    'UN Sustainable Development Goals',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'what',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'ما هو العمل التطوعي؟', en: 'What is volunteering?' },
      lede: {
        ar: 'تعريف دقيق يفصل التطوّع عن غيره — لأن الخلط هنا يسبّب مشكلات لاحقاً.',
        en: 'A precise definition that separates volunteering from everything else — because confusion here causes problems later.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التطوّع نشاط يقوم به الإنسان بإرادته الحرة، دون هدف الربح المادي، ولمنفعة الآخرين أو المجتمع. هذه المعايير الثلاثة متلازمة: إذا سقط أحدها، لا يُعدّ العمل تطوّعاً.',
            en: 'Volunteering is an activity undertaken of a person’s own free will, without the aim of material gain, for the benefit of others or the community. These three criteria go together: if one fails, the activity is not volunteering.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: '١· الإرادة الحرة', en: '1 · Free will' },
              text: {
                ar: 'اختيار نابع منك، بلا إجبار أو ضغط اجتماعي أو شرط دراسي.',
                en: 'A choice that comes from you — no coercion, social pressure, or academic requirement.',
              },
            },
            {
              title: { ar: '٢· دون ربح مادي', en: '2 · No material gain' },
              text: {
                ar: 'لا أجر مقابل الوقت. تعويض المصاريف الفعلية لا يُبطل صفة التطوّع.',
                en: 'No payment for your time. Reimbursing genuine expenses does not cancel volunteer status.',
              },
            },
            {
              title: { ar: '٣· منفعة للآخرين', en: '3 · Benefit to others' },
              text: {
                ar: 'الفائدة تتجاوز نفسك وأسرتك المباشرة إلى المجتمع.',
                en: 'The benefit extends beyond you and your immediate family to the wider community.',
              },
            },
          ],
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ تطوّع', en: '✔ Volunteering' },
          noTitle: { ar: '✘ ليس تطوّعاً', en: '✘ Not volunteering' },
          yes: {
            ar: [
              'المشاركة في توزيع حصص غذائية مع منظمة إنسانية',
              'تنظيم نشاط ترفيهي لأطفال نازحين',
              'تدريب زملائك على مهارة تتقنها',
              'تصميم منشورات توعوية لجمعية',
            ],
            en: [
              'Helping distribute food parcels with a humanitarian organisation',
              'Running a recreational activity for displaced children',
              'Training peers in a skill you have mastered',
              'Designing awareness materials for an association',
            ],
          },
          no: {
            ar: [
              'تدريب جامعي إلزامي لنيل شهادة',
              'عمل بأجر ولو كان الأجر رمزياً',
              'خدمة تُفرض كعقوبة أو شرط',
              'مساعدة أفراد أسرتك المباشرة',
            ],
            en: [
              'A mandatory university placement required to graduate',
              'Paid work, even at a token rate',
              'Service imposed as a penalty or condition',
              'Helping your own immediate family',
            ],
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'الخدمة المباشرة: تعمل وجهاً لوجه مع المستفيدين',
              'الدعم غير المباشر: تنظيم وتوثيق ولوجستيات',
              'المناصرة والتوعية: ترفع الوعي وتدافع عن قضية',
              'التطوّع الرقمي: عن بُعد — ترجمة، برمجة، محتوى',
              'التطوّع القيادي: تقود فريقاً أو تدير مبادرة',
            ],
            en: [
              'Direct service: working face to face with people',
              'Indirect support: coordination, documentation, logistics',
              'Advocacy and awareness: raising a cause',
              'Digital volunteering: remote translation, coding, content',
              'Leadership volunteering: leading a team or initiative',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'q1',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'طلبت جامعة من طالب إنجاز ٤٠ ساعة خدمة مجتمعية كشرط للتخرّج، فاختار قضاءها مع إحدى الجمعيات. هل هذا تطوّع؟',
            en: 'A university requires a student to complete 40 hours of community service to graduate, and they choose to spend it with an association. Is this volunteering?',
          },
          options: [
            { ar: 'نعم، لأن العمل نفسه خدمة للمجتمع', en: 'Yes — the work itself serves the community' },
            { ar: 'نعم، لأنه لم يتقاضَ أجراً', en: 'Yes — they were not paid' },
            {
              ar: 'لا، لأن معيار الإرادة الحرة غير متحقّق — الخدمة شرط للتخرّج',
              en: 'No — the free-will criterion fails; the service is a graduation requirement',
            },
            { ar: 'لا، لأن الطلاب لا يُعدّون متطوعين', en: 'No — students cannot be volunteers' },
          ],
          correct: 2,
          feedback: {
            ar: 'الإرادة الحرة شرط جوهري. عندما تكون الخدمة شرطاً للتخرّج يسقط هذا الشرط، ويصبح العمل «خدمة مجتمعية إلزامية» — وهي نافعة لكنها ليست تطوّعاً بالتعريف الدقيق.',
            en: 'Free will is essential. When service is a graduation condition that criterion fails, and it becomes “mandatory community service” — valuable, but not volunteering by the strict definition.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'why',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'لماذا نتطوّع؟', en: 'Why do we volunteer?' },
      lede: {
        ar: 'الأثر مزدوج: على المجتمع، وعليك أنت. الاعتراف بالثاني ليس أنانية — بل واقعية تجعل التزامك أطول.',
        en: 'The impact runs both ways: on the community, and on you. Acknowledging the second is not selfish — it is realistic, and it makes commitment last.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التطوّع يسدّ فجوات لا تصل إليها المؤسسات الرسمية دائماً، ويبني رأس المال الاجتماعي — أي شبكة الثقة والتعاون بين الناس. وفي المجتمعات التي تمرّ بأزمات، يصبح العمل التطوعي المنظّم أحد أهم أدوات الصمود.',
            en: 'Volunteering fills gaps that formal institutions do not always reach, and builds social capital — the network of trust and cooperation between people. In communities under strain, organised volunteering becomes one of the most important tools of resilience.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: '📊 حجم التطوّع في العالم', en: '📊 The scale of volunteering worldwide' },
          content: {
            ar: 'تُجمع تقارير الأمم المتحدة عن حالة التطوّع في العالم على أمرين: أن أغلب التطوّع في العالم يحدث خارج المؤسسات — جار يساعد جاراً، لا متطوّعاً مسجّلاً في جمعية — وأن هذا الجزء الأكبر هو الأقل ظهوراً في الإحصاءات الرسمية. أنت جزء من أوسع عمل يقوم به البشر لبعضهم، وأقلّه توثيقاً.',
            en: 'The UN’s State of the World’s Volunteerism reports agree on two things: most volunteering in the world happens outside institutions — a neighbour helping a neighbour, not someone registered with an association — and that larger share is the least visible in official statistics. You are part of the widest thing people do for each other, and the least recorded.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'مهارات قابلة للنقل: التواصل، القيادة، إدارة الوقت، حل المشكلات',
              'شبكة علاقات تفتح فرصاً لاحقة',
              'سجلّ موثّق: ساعاتك وشهاداتك تُسجَّل رسمياً',
              'وضوح في الاتجاه: تجرّب مجالات قبل اختيار مسارك',
              'صحة نفسية أفضل: المعنى والانتماء من أقوى عوامل الرفاه',
            ],
            en: [
              'Transferable skills: communication, leadership, time management, problem solving',
              'A network that opens later opportunities',
              'A documented record: your hours and certificates are formally logged',
              'Direction: you test fields before choosing a career path',
              'Better wellbeing: meaning and belonging are among the strongest protective factors',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: '🔁 مهارات تتجاوز التطوّع', en: '🔁 Skills that go beyond volunteering' },
          content: {
            ar: 'ما تتعلّمه هنا ليس محصوراً بالعمل التطوعي. الإصغاء دون حكم ينفعك في علاقاتك، والحدود المهنية تحميك في عملك، واتخاذ قرار تحت ضغط مهارة حياتية كاملة. المتطوّع الذي يتقن هذه الأمور يصبح إنساناً أكثر نضجاً، لا متطوّعاً أفضل فحسب.',
            en: 'What you learn here is not confined to volunteering. Listening without judgement helps your relationships, professional boundaries protect you at work, and deciding under pressure is a life skill in its own right. A volunteer who masters these becomes a more capable person, not just a better volunteer.',
          },
        },
        {
          type: 'quiz',
          id: 'q2',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أيّ العبارات التالية يعكس فهماً صحيحاً للدافع إلى التطوّع؟',
            en: 'Which statement reflects a correct understanding of volunteer motivation?',
          },
          options: [
            {
              ar: 'المتطوّع الحقيقي لا ينتظر أي فائدة لنفسه إطلاقاً',
              en: 'A true volunteer expects no personal benefit whatsoever',
            },
            {
              ar: 'الاستفادة الشخصية مشروعة ما دامت لا تُقدَّم على مصلحة المستفيد',
              en: 'Personal benefit is legitimate as long as it never outranks the beneficiary’s interest',
            },
            {
              ar: 'التطوّع وسيلة أساسية للحصول على وظيفة، وهذا هدفه الأول',
              en: 'Volunteering is primarily a route to employment, and that is its main purpose',
            },
            {
              ar: 'الدوافع الشخصية تُضعف جودة العمل التطوعي دائماً',
              en: 'Personal motives always weaken the quality of volunteer work',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الاعتراف بالمنفعة المتبادلة واقعي وصحّي، ويجعل الالتزام أطول. الخلل يبدأ فقط حين تُقدَّم مصلحتك على مصلحة المستفيد.',
            en: 'Acknowledging mutual benefit is realistic and healthy, and it makes commitment last. The problem begins only when your interest is placed above the beneficiary’s.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'principles',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'المبادئ التي تحكم عملنا', en: 'The principles that govern our work' },
      lede: {
        ar: 'هذه ليست شعارات. كل مبدأ منها يجيب عن سؤال عملي يواجهك في الميدان.',
        en: 'These are not slogans. Each principle answers a practical question you will face in the field.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'اعتمدت الحركة الدولية للصليب الأحمر والهلال الأحمر سبعة مبادئ أساسية، صارت مرجعاً لمعظم العمل الإنساني في العالم:',
            en: 'The International Red Cross and Red Crescent Movement adopted seven Fundamental Principles, now a reference for most humanitarian work worldwide:',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'الإنسانية', en: 'Humanity' },
              text: {
                ar: 'غايتنا تخفيف معاناة الإنسان أينما وُجدت، وحماية الحياة والكرامة.',
                en: 'To relieve human suffering wherever it is found, and protect life and dignity.',
              },
            },
            {
              title: { ar: 'عدم التحيّز', en: 'Impartiality' },
              text: {
                ar: 'لا تمييز بسبب الجنسية أو العرق أو الدين أو الرأي. الأولوية للأشدّ حاجة — لا للأقرب إلينا.',
                en: 'No discrimination by nationality, race, religion or opinion. Priority to the most urgent need — not the closest relationship.',
              },
            },
            {
              title: { ar: 'الحياد', en: 'Neutrality' },
              text: {
                ar: 'لا ننحاز في النزاعات السياسية أو الطائفية، حتى نبقى مقبولين لدى الجميع.',
                en: 'We do not take sides in political or sectarian conflict, so that we remain accepted by all.',
              },
            },
            {
              title: { ar: 'الاستقلال', en: 'Independence' },
              text: {
                ar: 'قرارنا يبقى لنا، ولا يخضع لأجندة جهة ممولة أو سياسية.',
                en: 'Our decisions remain ours, not subject to a funder’s or a political agenda.',
              },
            },
            {
              title: { ar: 'الخدمة التطوعية', en: 'Voluntary service' },
              text: {
                ar: 'عملنا لا يقوم على الرغبة في الربح.',
                en: 'Our work is not prompted by desire for gain.',
              },
            },
            {
              title: { ar: 'الوحدة', en: 'Unity' },
              text: {
                ar: 'جمعية واحدة مفتوحة للجميع في نطاق عملها.',
                en: 'One organisation, open to all within its area of work.',
              },
            },
            {
              title: { ar: 'العالمية', en: 'Universality' },
              text: {
                ar: 'جميع الجمعيات متساوية وتتقاسم المسؤولية في مساعدة بعضها.',
                en: 'All societies are equal and share responsibility in helping one another.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: '🔑 مبدأ «لا ضرر» — Do No Harm', en: '🔑 The Do No Harm principle' },
          content: {
            ar: 'النية الحسنة لا تكفي. توزيع عشوائي قد يثير النزاع بين العائلات، ونشر صورة طفل قد يعرّضه للخطر، ووعد لا نستطيع الوفاء به يكسر ثقة مجتمع بأكمله. قبل أي تصرّف اسأل: «ما أسوأ ما يمكن أن ينتج عن هذا؟» — إن لم تعرف الجواب، اسأل مشرفك قبل أن تتصرّف.',
            en: 'Good intentions are not enough. A disorganised distribution can spark conflict between families, publishing a child’s photograph can expose them to danger, and a promise you cannot keep can break a whole community’s trust. Before acting, ask: “What is the worst thing that could come of this?” If you do not know, ask your supervisor before you act.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الكرامة: المساعدة حقّ لا صدقة. هذا جوهر المعيار الإنساني الأساسي (CHS، إصدار ٢٠٢٤): الناس المتأثرون بالأزمات أصحاب حقوق، لا متلقّون سلبيون للإحسان. عملياً هذا يعني: نستشيرهم، ونحترم خصوصيتهم، ونتيح لهم تقديم شكوى، ولا نطلب منهم إظهار الامتنان أمام الكاميرا.',
            en: 'Dignity: assistance is a right, not charity. This is the heart of the Core Humanitarian Standard (2024 edition): people affected by crisis are rights-holders, not passive recipients of goodwill. In practice: we consult them, respect their privacy, give them a way to complain, and never ask them to perform gratitude for a camera.',
          },
        },
        {
          type: 'quiz',
          id: 'q3',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'أثناء توزيع حصص غذائية في أحد الأحياء، يقترب منك أحد الوجهاء ويطلب أن تُعطى الحصص أولاً لعائلات من عشيرته «لأنهم أهل المنطقة»، ملمّحاً إلى أن ذلك سيسهّل عملكم مستقبلاً.',
            en: 'During a food distribution in a neighbourhood, a local notable asks you to serve families from his clan first “because they are from here”, hinting that it would make your future work easier.',
          },
          options: [
            {
              ar: 'توافق لتفادي المشكلات وضمان استمرار العمل في المنطقة',
              en: 'Agree, to avoid trouble and keep working in the area',
            },
            { ar: 'ترفض علناً وبحدّة أمام الحاضرين', en: 'Refuse sharply and publicly in front of everyone' },
            {
              ar: 'توضّح بهدوء أن التوزيع يتم وفق معايير حاجة معلنة، وتُبلّغ مشرفك فوراً',
              en: 'Calmly explain that distribution follows published need-based criteria, and inform your supervisor immediately',
            },
            { ar: 'توقف التوزيع وتنسحب من الحيّ', en: 'Stop the distribution and withdraw from the area' },
          ],
          correct: 2,
          feedback: {
            ar: 'مبدأ عدم التحيّز يوجب أن تكون الأولوية للأشدّ حاجة وفق معايير معلنة. الرفض الحادّ علناً قد يصعّد الموقف، والانسحاب يحرم المحتاجين. التوضيح الهادئ + إبلاغ المشرف هو الجمع بين المبدأ والحكمة.',
            en: 'Impartiality requires priority by severity of need, against published criteria. A sharp public refusal may escalate the situation, and withdrawing deprives those in need. Calm explanation plus informing your supervisor combines principle with judgement.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'rights',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'حقوقك وواجباتك', en: 'Your rights and responsibilities' },
      lede: {
        ar: 'علاقة التطوّع ليست من طرف واحد. لك حقوق على المنظمة، وعليك واجبات تجاهها وتجاه من تخدمهم.',
        en: 'Volunteering is not a one-way relationship. You have rights the organisation owes you, and duties towards it and towards those you serve.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'وفق سياسة التطوّع للاتحاد الدولي (IFRC 2022)، يقع على المنظمة «واجب الرعاية» تجاه متطوعيها:',
            en: 'Under the IFRC Volunteering Policy (2022), the organisation carries a “duty of care” towards its volunteers:',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'أن تتلقّى تدريباً كافياً قبل المهمة وأثناءها وبعدها',
              'أن تُعرَّف بدورك ومسؤولياتك بوضوح',
              'أن تعمل في بيئة آمنة، مع معدّات حماية مناسبة',
              'أن تُحمى من التحرّش والاستغلال، وأن تتوفّر آلية شكوى',
              'أن تُعوَّض عن مصاريفك الفعلية وفق سياسة المنظمة',
              'أن تُعامَل كشريك لا كأداة، وأن يكون لصوتك موضع في القرار',
              'أن يُوثَّق عملك ويُعترف به — ساعات وشهادات',
              'أن تعتذر عن مهمة تتجاوز قدرتك أو تعرّضك لخطر',
            ],
            en: [
              'To receive adequate training before, during and after the assignment',
              'To have your role and responsibilities clearly defined',
              'To work in a safe environment with appropriate protective equipment',
              'To be protected from harassment and exploitation, with a complaints mechanism available',
              'To be reimbursed for genuine expenses under the organisation’s policy',
              'To be treated as a partner, not a tool, with a voice in decisions',
              'To have your work documented and recognised — hours and certificates',
              'To decline a task beyond your capacity or that puts you at risk',
            ],
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'الالتزام: إن وعدت بالحضور فاحضر. غيابك المفاجئ يُحمّل زملاءك عبئك',
              'احترام المبادئ: تطبّق المبادئ السبعة و«لا ضرر» في كل تصرّف',
              'السرية: ما تعرفه عن المستفيدين أمانة — لا يُنشر ولا يُروى',
              'السلوك الأخلاقي: لا تستغل موقعك لمصلحة شخصية',
              'الصدق في التوثيق: تسجّل ساعاتك بدقّة. المبالغة تفسد بيانات المنظمة كلها',
              'الالتزام بالتعليمات، خصوصاً في مواقف السلامة والطوارئ',
              'الإبلاغ عن أي حادث أو مخالفة أو خطر تلاحظه',
            ],
            en: [
              'Commitment: if you promise to attend, attend. A sudden absence shifts your load onto colleagues',
              'Respect for principles: apply the seven principles and Do No Harm in every action',
              'Confidentiality: what you learn about people is held in trust — never published or retold',
              'Ethical conduct: never use your position for personal advantage',
              'Honest record-keeping: log your hours accurately. Inflation corrupts the organisation’s entire dataset',
              'Following instructions, especially in safety and emergency situations',
              'Reporting any incident, breach or hazard you notice',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: {
            ar: '💡 لماذا الصدق في الساعات مهم إلى هذا الحد؟',
            en: '💡 Why does honesty about hours matter so much?',
          },
          content: {
            ar: 'ساعاتك المعتمدة تُستخدم في تقارير المنظمة للجهات المانحة والرسمية. رقم واحد مبالغ فيه يضع مصداقية المنظمة كلها موضع شكّ. لهذا يعتمد المشرف كل ساعة قبل احتسابها.',
            en: 'Your approved hours feed the organisation’s reports to donors and authorities. A single inflated figure puts the credibility of the whole organisation in doubt. That is why a supervisor approves every hour before it counts.',
          },
        },
        {
          type: 'quiz',
          id: 'q4',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'كُلّفت بمهمة تتطلّب حمل صناديق ثقيلة على درج مرتفع. أنت تعاني من إصابة قديمة في ظهرك، وتشعر أن المهمة قد تؤذيك. زملاؤك بدأوا العمل بالفعل.',
            en: 'You are assigned to carry heavy boxes up a steep staircase. You have an old back injury and feel the task could harm you. Your colleagues have already started.',
          },
          options: [
            {
              ar: 'تشارك رغم الألم حتى لا تبدو متهرّباً أمام الفريق',
              en: 'Join in despite the pain, so you do not look like you are avoiding work',
            },
            {
              ar: 'تبلغ المشرف بوضعك وتطلب مهمة بديلة — هذا حقّك وواجبك معاً',
              en: 'Tell your supervisor and request an alternative task — this is both your right and your duty',
            },
            { ar: 'تنسحب من النشاط بصمت', en: 'Quietly withdraw from the activity' },
            {
              ar: 'تشارك جزئياً دون إخبار أحد بإصابتك',
              en: 'Participate partially without telling anyone about your injury',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'العمل في بيئة آمنة حقّ لك، والإبلاغ عن وضعك واجب عليك. إخفاء الإصابة قد يؤدي إلى أذى دائم ويحمّل المنظمة مسؤولية كان يمكن تفاديها.',
            en: 'A safe working environment is your right, and disclosing your condition is your duty. Concealing an injury risks lasting harm and exposes the organisation to a liability that was avoidable.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'safety',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'سلامتك وحدودك المهنية', en: 'Your safety and professional boundaries' },
      lede: {
        ar: 'لا يمكنك مساعدة أحد إن تعرّضت للأذى. سلامتك ليست ترفاً.',
        en: 'You cannot help anyone if you are harmed. Your safety is not a luxury.',
      },
      blocks: [
        {
          type: 'list',
          items: {
            ar: [
              'لا تذهب وحدك: الأنشطة الميدانية تُنفَّذ بفريق لا فرداً',
              'أعلِم مشرفك بمكانك ووقت انتهائك المتوقع',
              'ارتدِ ما يُعرّفك: البطاقة والزيّ يحميانك ويوضّحان صفتك',
              'قيّم قبل أن تدخل: إن شعرت أن المكان غير آمن، انسحب أولاً واسأل لاحقاً',
              'لا تنقل أشخاصاً في سيارتك الخاصة دون إذن مسبق',
              'لا تقدّم مالاً من جيبك للمستفيدين',
            ],
            en: [
              'Never go alone: field activities are done as a team, not individually',
              'Tell your supervisor where you are and when you expect to finish',
              'Wear your identification: badge and vest protect you and make your role clear',
              'Assess before entering: if a place feels unsafe, withdraw first and ask afterwards',
              'Do not transport people in your private vehicle without prior permission',
              'Do not give money from your own pocket to beneficiaries',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'أنت متطوّع، لا صديق شخصي ولا معالج نفسي ولا مموّل. تجاوز هذه الحدود — ولو بحسن نيّة — يضرّ بك وبالمستفيد وبالمنظمة.',
            en: 'You are a volunteer — not a personal friend, a therapist, or a funder. Crossing these boundaries, even with good intentions, harms you, the person you serve, and the organisation.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ ضمن حدودك', en: '✔ Within your role' },
          noTitle: { ar: '✘ خارج حدودك', en: '✘ Outside your role' },
          yes: {
            ar: [
              'الإصغاء باحترام',
              'تقديم الخدمة المتفق عليها',
              'إحالة الحالة إلى مشرفك أو جهة مختصّة',
              'التواصل عبر قنوات المنظمة',
            ],
            en: [
              'Listening respectfully',
              'Providing the agreed service',
              'Referring the case to your supervisor or a specialist',
              'Communicating through the organisation’s channels',
            ],
          },
          no: {
            ar: [
              'إعطاء رقمك الشخصي للمستفيدين',
              'تقديم استشارة نفسية أو طبية',
              'وعود بمساعدات لا تملك سلطة إقرارها',
              'زيارات فردية خارج إطار النشاط',
            ],
            en: [
              'Giving your personal number to beneficiaries',
              'Offering psychological or medical advice',
              'Promising aid you have no authority to approve',
              'Individual visits outside the activity framework',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'السرية وحماية البيانات: أسماء المستفيدين وظروفهم وصورهم أمانة. لا تُنشر على وسائل التواصل، ولا تُروى في مجالس خاصة، ولا تُصوَّر دون إذن صريح ومسبق. نشر صورة عائلة تتلقّى مساعدة قد يعرّضها للوصم في مجتمعها.',
            en: 'Confidentiality and data protection: people’s names, circumstances and images are held in trust. Never post them on social media, never retell them in private company, and never photograph without explicit prior consent. Publishing an image of a family receiving aid can expose them to stigma in their own community.',
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: {
            ar: '🛑 خاص بالمتطوعين دون سنّ ١٨',
            en: '🛑 For volunteers under 18',
          },
          content: {
            ar: 'في المنظمات التي تستقبل متطوعين دون سنّ الرشد: لا تشارك في أنشطة ميدانية دون موافقة خطية من وليّ أمرك، ولا تُكلَّف بمهام ليلية أو في مناطق مصنّفة عالية الخطورة، ويجب أن يرافقك دائماً متطوّع بالغ مسؤول. إن طُلب منك خلاف ذلك — أبلغ إدارة المنظمة فوراً.',
            en: 'In organisations that accept volunteers below the age of majority: do not take part in field activities without written consent from your guardian, do not accept night assignments or work in areas classified as high risk, and a responsible adult volunteer must always accompany you. If you are asked to do otherwise, inform the organisation’s management immediately.',
          },
        },
        {
          type: 'quiz',
          id: 'q5',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'بعد نشاط، تطلب منك سيدة مستفيدة رقم هاتفك الشخصي «لتتواصل معك مباشرة عند الحاجة»، وتشرح أن وضعها صعب وأنها تثق بك أنت تحديداً.',
            en: 'After an activity, a woman you have been assisting asks for your personal phone number “to reach you directly when needed”, explaining that her situation is hard and that she trusts you in particular.',
          },
          options: [
            {
              ar: 'تعطيها رقمك لأن رفضك سيجرح مشاعرها',
              en: 'Give her your number, because refusing would hurt her feelings',
            },
            { ar: 'تعطيها رقماً خاطئاً لتتجنّب الإحراج', en: 'Give a wrong number to avoid embarrassment' },
            {
              ar: 'تعتذر بلطف وتعطيها قناة التواصل الرسمية للمنظمة، وتُعلم مشرفك بحالتها',
              en: 'Decline kindly, give her the organisation’s official contact channel, and tell your supervisor about her situation',
            },
            {
              ar: 'تعطيها رقمك وتطلب منها عدم إخبار أحد',
              en: 'Give her your number and ask her not to tell anyone',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الحدود المهنية تحمي الطرفين. القناة الرسمية تضمن متابعة الحالة حتى لو غبتَ أنت، وإبلاغ المشرف يفتح لها باب مساعدة حقيقية بدل اعتمادها على شخص واحد.',
            en: 'Professional boundaries protect both sides. The official channel ensures her case is followed up even if you are away, and informing your supervisor opens a route to real help rather than dependence on one individual.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 6
    {
      id: 'safeguarding',
      tag: { ar: 'الوحدة السادسة · إلزامية', en: 'Module 6 · Mandatory' },
      title: { ar: 'حماية الطفل', en: 'Child safeguarding' },
      lede: {
        ar: 'إن كان عملك التطوعي يقترب من الأطفال بأي شكل، فهذه الوحدة غير قابلة للتفاوض. وإن كان العمل مع الأطفال أساس دورك، فدورة «التعامل مع الأطفال» مطلوبة منك بعدها.',
        en: 'If your volunteering brings you anywhere near children, this module is non-negotiable. And if working with children is central to your role, the “Working with Children” course is required of you after this one.',
      },
      blocks: [
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: '🛑 القاعدة الذهبية', en: '🛑 The golden rule' },
          content: {
            ar: 'لا تبقَ منفرداً مع طفل في مكان مغلق أو بعيد عن أنظار الآخرين — أبداً. إن اضطرّتك الظروف، ابقَ في مكان مرئي وأبلغ زميلاً فوراً. هذه القاعدة تحمي الطفل، وتحميك أنت من أي اتهام.',
            en: 'Never be alone with a child in a closed space or out of sight of others — ever. If circumstances force it, stay in view and tell a colleague immediately. This rule protects the child, and protects you from any accusation.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'تعتمد المنظمات حول العالم المعايير الدولية لحماية الطفل الصادرة عن Keeping Children Safe (إصدار ٢٠٢٤)، وهي مبنية على اتفاقية الأمم المتحدة لحقوق الطفل، وتقوم على أربعة أركان:',
            en: 'Organisations worldwide follow the International Child Safeguarding Standards published by Keeping Children Safe (2024 edition), built on the UN Convention on the Rights of the Child and resting on four pillars:',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: '١· السياسة', en: '1 · Policy' },
              text: {
                ar: 'وثيقة مكتوبة تلتزم بها المنظمة لمنع الأذى، وتوضّح ما يجب فعله عند وقوع حادث.',
                en: 'A written commitment to preventing harm, setting out what must happen if an incident occurs.',
              },
            },
            {
              title: { ar: '٢· الأشخاص', en: '2 · People' },
              text: {
                ar: 'مسؤوليات واضحة لكل عامل ومتطوّع، وتدريب يجعلهم يفهمون ويتصرّفون.',
                en: 'Clear responsibilities for every member of staff and volunteer, and training so they understand and act.',
              },
            },
            {
              title: { ar: '٣· الإجراءات', en: '3 · Procedures' },
              text: {
                ar: 'بيئة آمنة عبر إجراءات تُطبَّق في كل البرامج والأنشطة.',
                en: 'A child-safe environment through procedures applied across all programmes and activities.',
              },
            },
            {
              title: { ar: '٤· المساءلة', en: '4 · Accountability' },
              text: {
                ar: 'آليات متابعة تضمن التطبيق الفعلي لا الشكلي.',
                en: 'Monitoring that ensures the standards are genuinely applied, not merely declared.',
              },
            },
          ],
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ سلوك آمن', en: '✔ Safe behaviour' },
          noTitle: { ar: '✘ ممنوع منعاً باتاً', en: '✘ Absolutely prohibited' },
          yes: {
            ar: [
              'التعامل في مجموعات وأماكن مفتوحة',
              'لغة محترمة ومناسبة لعمر الطفل',
              'احترام خصوصية الطفل وجسده',
              'إحالة أي قلق إلى مسؤول الحماية في منظمتك',
              'أخذ إذن مكتوب قبل أي تصوير',
            ],
            en: [
              'Working in groups and open spaces',
              'Respectful language appropriate to the child’s age',
              'Respecting the child’s privacy and body',
              'Referring any concern to your organisation’s safeguarding focal point',
              'Obtaining written permission before any photography',
            ],
          },
          no: {
            ar: [
              'الانفراد بطفل بعيداً عن الأنظار',
              'أي تلامس جسدي غير ضروري',
              'التواصل الشخصي مع طفل خارج إطار النشاط',
              'تصوير طفل أو نشر صورته دون إذن وليّ أمره',
              'وعد الطفل بكتمان سرّ عنك',
              'معاملة تفضيلية لطفل دون غيره',
            ],
            en: [
              'Being alone with a child out of sight',
              'Any unnecessary physical contact',
              'Personal contact with a child outside the activity',
              'Photographing a child or publishing their image without guardian consent',
              'Promising a child you will keep a secret',
              'Showing favouritism towards one child',
            ],
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'أصغِ بهدوء ولا تُظهر صدمة أو حكماً',
              'لا تَعِد بالسرّية: قل «سأساعدك، وسأخبر شخصاً مسؤولاً يستطيع حمايتك»',
              'لا تحقّق ولا تستجوب: لا تسأل أسئلة تفصيلية أو موجِّهة',
              'وثّق فوراً ما قاله الطفل بكلماته هو، بدقّة، دون تفسير منك',
              'أبلغ مسؤول الحماية في منظمتك في اليوم نفسه',
              'لا تتحدّث عن الأمر مع أحد آخر إطلاقاً',
            ],
            en: [
              'Listen calmly, showing neither shock nor judgement',
              'Do not promise secrecy: say “I will help you, and I will tell someone responsible who can protect you”',
              'Do not investigate or interrogate: ask no detailed or leading questions',
              'Record immediately what the child said, in their own words, accurately and without your interpretation',
              'Report to your organisation’s safeguarding focal point the same day',
              'Never discuss the matter with anyone else',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: '⚠️ حقل تخصيص لكل منظمة', en: '⚠️ Organisation-specific field' },
          content: {
            ar: 'كل منظمة تعرض هذه الدورة يجب أن تُدرج هنا اسم مسؤول حماية الطفل لديها ورقم تواصله المباشر.',
            en: 'Every organisation delivering this course must insert here the name and direct contact of its own child safeguarding focal point.',
          },
        },
        {
          type: 'quiz',
          id: 'q6',
          label: { ar: 'سيناريو حساس', en: 'Sensitive scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'خلال نشاط صيفي، يقترب منك طفل عمره ٩ سنوات ويقول هامساً: «بدي احكيلك شي بس ما تحكي لحدا، بيتضربني بالبيت». ينظر إليك منتظراً وعدك.',
            en: 'During a summer activity, a nine-year-old whispers: “I want to tell you something, but don’t tell anyone — I get hit at home.” He looks at you, waiting for your promise.',
          },
          options: [
            {
              ar: 'تعده بالكتمان حتى يشعر بالأمان ويكمل حديثه',
              en: 'Promise secrecy so he feels safe and keeps talking',
            },
            {
              ar: 'تصغي بهدوء، وتوضّح أنك لن تعده بالسرّية لكنك ستساعده وستُبلغ مَن يحميه',
              en: 'Listen calmly and explain that you cannot promise secrecy, but you will help him and tell someone who can protect him',
            },
            {
              ar: 'تسأله أسئلة تفصيلية لتتأكد من صحة كلامه قبل الإبلاغ',
              en: 'Ask detailed questions to verify his account before reporting',
            },
            {
              ar: 'تنصحه بالتحدّث إلى أهله وتغيّر الموضوع',
              en: 'Advise him to talk to his family and change the subject',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'لا يجوز إطلاقاً وعد الطفل بالسرّية — لأنك ملزم بالإبلاغ لحمايته. والاستجواب التفصيلي قد يضرّ بالطفل وبأي إجراء لاحق. أصغِ، اشرح بصدق، وثّق بكلماته، وأبلغ في اليوم نفسه.',
            en: 'You must never promise a child secrecy — you are obliged to report in order to protect them. Detailed questioning can harm the child and any later process. Listen, explain honestly, record their words, and report the same day.',
          },
        },
        {
          type: 'quiz',
          id: 'q7',
          label: { ar: 'سيناريو حساس', en: 'Sensitive scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'التقطت صورة جميلة لأطفال يضحكون خلال نشاط، وتريد نشرها على حسابك الشخصي لتوثيق تجربتك التطوعية.',
            en: 'You took a lovely photograph of children laughing during an activity, and want to post it on your personal account to document your volunteering experience.',
          },
          options: [
            {
              ar: 'تنشرها لأن الصورة إيجابية ولا تُظهر أي أذى',
              en: 'Post it — the image is positive and shows no harm',
            },
            {
              ar: 'تنشرها بعد إخفاء وجوه الأطفال بالتشويش',
              en: 'Post it after blurring the children’s faces',
            },
            {
              ar: 'لا تنشرها؛ الصور تُسلَّم للمنظمة، ولا تُنشر إلا بإذن خطّي من أولياء الأمور',
              en: 'Do not post it; images are handed to the organisation and published only with written guardian consent',
            },
            { ar: 'تنشرها في حساب مغلق للأصدقاء فقط', en: 'Post it to a private, friends-only account' },
          ],
          correct: 2,
          feedback: {
            ar: 'صور الأطفال لا تُنشر على الحسابات الشخصية مطلقاً، ولو كانت إيجابية أو الحساب مغلقاً. التشويش لا يكفي. الصور تعود للمنظمة وتُنشر فقط بإذن خطّي من وليّ الأمر.',
            en: 'Children’s images are never posted to personal accounts, however positive the photo or private the account. Blurring is not sufficient. Images belong to the organisation and are published only with written guardian consent.',
          },
        },
      ],
    },
  ],
};
