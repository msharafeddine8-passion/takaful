import type { CourseContent } from './types';

/**
 * Level 6 — Sustainability and Resource Mobilisation. Pass mark 70.
 *
 * Built around the question every volunteer project eventually faces: what
 * happens when the funding letter arrives with a "final instalment" line?
 * If the answer is "it ends", the project was a service, not a change. This
 * course draws the line between the two and gives practical tools for crossing
 * it: diversifying income, converting community goodwill into in-kind
 * resources, documenting everything a successor needs, and asking for support
 * in ways that do not create promises nobody can keep.
 */

export const sustainabilityAndResources: CourseContent = {
  slug: 'sustainability-and-resources',
  level: 6,
  minutes: 40,
  passMark: 70,
  title: {
    ar: 'الاستدامة وتعبئة الموارد',
    en: 'Sustainability and Resource Mobilisation',
  },
  lede: {
    ar: 'كيف يستمرّ الأثر بعد انتهاء التمويل: تنويع المصادر، الموارد المحلية، التطوّع المهني، وخطة استدامة مكتوبة.',
    en: 'How impact continues after funding ends: diversifying sources, local resources, skilled volunteering, and a written sustainability plan.',
  },
  outcomes: {
    ar: [
      'تميّز بين الاستدامة المالية والبشرية والتشغيلية',
      'تعبّئ موارد محلية وعينية بدل الاعتماد على مانح واحد',
      'تبني خطة استدامة تُبقي الأثر بعد انتهاء المشروع',
      'تجمع الدعم بطريقة أخلاقية لا تَعِد بما لا يُنفَّذ',
    ],
    en: [
      'Distinguish financial, human and operational sustainability',
      'Mobilise local and in-kind resources rather than depending on one funder',
      'Build a sustainability plan that keeps impact alive after a project ends',
      'Raise support ethically, without promising what cannot be delivered',
    ],
  },
  sources: [
    'IFRC — Resource Mobilisation Guidance for National Societies (2022)',
    'UNDP — Sustainability of Development Projects: Principles and Practice',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'sr-m1',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: {
        ar: 'مفهوم الاستدامة ومكوّناتها الثلاثة',
        en: 'What Sustainability Means and Its Three Components',
      },
      lede: {
        ar: 'الاستدامة ليست هدفاً بعيداً نضعه في آخر خطّة المشروع؛ هي قرارات تُتّخذ في أولى الخطوات.',
        en: 'Sustainability is not a distant goal saved for the end of a project plan; it is decisions made in the very first steps.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'المشروع الذي ينهار بمجرّد انتهاء عقد التمويل لم يبنِ استدامةً — بنى اعتماداً. والفرق بين الاثنين يظهر في تصميم المشروع من اليوم الأوّل: هل أوجدنا قدرةً تبقى في المجتمع أم قدّمنا خدمةً تنتهي بمغادرة الفريق؟ الاستدامة في العمل التطوّعي والإنساني تعني أن الأثر الذي أحدثته المنظمة يستمرّ بعد انتهاء تمويلها أو حضورها، وأن المجتمع المستفيد قادر على المضيّ دون الحاجة الدائمة إلى طرف خارجي. هذا لا يعني إيقاف الدعم الخارجي فجأةً، بل بناءه بحيث يتناقص الاعتماد عليه تدريجياً بينما تنمو القدرة الداخلية للمجتمع والمنظمة معاً. والمنظمات التي تفكّر في الاستدامة منذ البداية تجد أن الخروج الكريم ممكن — والتي لا تفكّر فيه تجد أنها بنت هشاشةً وعلّقت آمالاً لا تستطيع الوفاء بها.',
            en: 'A project that collapses the moment a funding contract ends has not built sustainability — it has built dependence. The difference between the two shows up in how a project is designed from day one: did we create capacity that stays in the community, or did we deliver a service that ends when the team leaves? Sustainability in volunteer and humanitarian work means that the impact an organisation creates continues after its funding or presence ends, and that the beneficiary community can carry on without permanently depending on an outside party. This does not mean withdrawing external support suddenly; it means building it so that dependence decreases gradually while the internal capacity of the community and organisation grows together.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'الاستدامة المالية', en: 'Financial Sustainability' },
              text: {
                ar: 'قدرة المنظمة على توليد أو تنويع الموارد الكافية لتغطية تكاليفها دون الاعتماد الكامل على مصدر واحد. تشمل التمويل الحكومي والمانحين الدوليين والتبرّعات المحلية وأيّ إيرادات ذاتية يمكن توليدها.',
                en: 'The organisation\'s capacity to generate or diversify enough resources to cover its costs without depending entirely on a single source. It covers government funding, international donors, local donations and any earned income the organisation can generate itself.',
              },
            },
            {
              title: { ar: 'الاستدامة البشرية', en: 'Human Sustainability' },
              text: {
                ar: 'قدرة الفريق على الاستمرار ونقل المعرفة والمهارات إلى أعضاء جدد بانتظام، بحيث لا يتوقّف العمل كلّه حين يغادر شخص واحد — مهما كان دوره حيوياً.',
                en: 'The team\'s capacity to continue and regularly pass knowledge and skills to new members, so that the work does not stop when one person leaves — however vital their role.',
              },
            },
            {
              title: { ar: 'الاستدامة التشغيلية', en: 'Operational Sustainability' },
              text: {
                ar: 'وجود أنظمة وإجراءات موثّقة تتيح للمنظمة الاستمرار عند تغيّر الفريق أو الظروف، بما فيها سياسات واضحة وأدوات عمل متاحة لأكثر من شخص وغير مخزّنة في ذاكرة فرد واحد.',
                en: 'Documented systems and procedures that allow the organisation to continue when the team or circumstances change, including clear policies and tools accessible to more than one person.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'warn',
          title: {
            ar: 'الاستدامة تُبنى من البداية لا تُضاف في النهاية',
            en: 'Sustainability is built from the start, not added at the end',
          },
          content: {
            ar: 'أشيع خطأ في التخطيط للاستدامة هو تركها لآخر ستة أشهر من المشروع، حين تكون الموارد قد نفدت والفريق مرهقاً والتوثيق لم يكتمل. المشروع الذي لم يضع سؤال «ماذا سيبقى بعدنا؟» في خطّته الأولى يجد الإجابة في الغالب: لا شيء يُذكر. والأصعب من ذلك هو أن المجتمعات التي اعتمدت على مشروع من هذا النوع تعاني من فجوة مضاعفة: حُرمت من بناء قدرتها الخاصة طوال سنوات الدعم، ثم خُيِّرت فجأةً بين لا شيء أو الاعتماد على مشروع آخر بنفس النمط.',
            en: 'The most common mistake in sustainability planning is leaving it to the last six months of a project, when resources are exhausted, the team is tired and documentation is incomplete. A project that did not build the question "what will remain after us?" into its first plan usually finds the answer: very little. Harder still, communities that came to rely on a project of this kind suffer a double gap: denied the chance to build their own capacity throughout the years of support, then suddenly left to choose between nothing and dependence on another project built the same way.',
          },
        },
        {
          type: 'quiz',
          id: 'sr-q1',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'مشروع قدّم دروساً في محو الأمية للبالغين بتمويل من منظمة دولية. بعد سنتين، انتهى التمويل وأُغلق المشروع وتوقّفت الدروس تماماً. أيّ نوع من الاستدامة كان الأضعف في هذا المشروع؟',
            en: 'A project delivered adult literacy classes funded by an international organisation. After two years the funding ended, the project closed and classes stopped entirely. Which type of sustainability was weakest in this project?',
          },
          options: [
            {
              ar: 'المالية — لأنه اعتمد على مصدر واحد وانتهى بانتهائه',
              en: 'Financial — because it depended on one source and ended when it did',
            },
            {
              ar: 'البشرية — لأن المعلّمين المدرَّبين غادروا جميعاً مع انتهاء العقد ولم يبقَ من يواصل',
              en: 'Human — because the trained teachers all left when the contract ended and nobody was left to carry on',
            },
            {
              ar: 'التشغيلية — لأن الأنظمة لم تكن موثّقة',
              en: 'Operational — because the systems were not documented',
            },
            {
              ar: 'كلّها بالتساوي، فأنواع الاستدامة الثلاثة مترابطة ولا يمكن تحديد الأضعف منها',
              en: 'All equally — the three types of sustainability are interlinked, so the weakest cannot be identified',
            },
          ],
          correct: 0,
          feedback: {
            ar: 'التوقّف الكامل عند انتهاء التمويل هو علامة ضعف مالي في المقام الأوّل: لم يُبنَ أيّ مصدر بديل ولم تنتقل ملكية النشاط إلى المجتمع بأيّ شكل. الضعف البشري والتشغيلي ممكن أيضاً — لكن أصل المشكلة في عدم تنويع مصادر التمويل وعدم وضع آلية انتقال مالي من البداية. المشروع الذي لا يعيش إلا بعقد واحد لم يخطّط للاستدامة أصلاً.',
            en: 'Total cessation when funding ends is primarily a sign of financial weakness: no alternative source was built and ownership of the activity was not transferred to the community in any form. Human and operational weakness may also exist — but the root problem is the absence of funding diversification and a financial transition mechanism from the start.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'sr-m2',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: {
        ar: 'الاستدامة المالية وتنويع مصادر الدعم',
        en: 'Financial Sustainability and Diversifying Support Sources',
      },
      lede: {
        ar: 'الاعتماد على مانح واحد ليس استراتيجية — هو قرار بتسليم مفاتيح المشروع لطرف خارج سيطرتك.',
        en: 'Depending on a single funder is not a strategy — it is a decision to hand the project keys to a party outside your control.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'كثير من المنظمات الصغيرة تقضي سنواتها الأولى تبحث عن المانح الكبير الذي سيحلّ كل مشاكلها — وحين تجده، تبني كل شيء حول عقده: ميزانيتها وفريقها وبرامجها وجدولها الزمني. ثم يأتي يوم يُبلَّغون فيه أن الأولويات تغيّرت أو الميزانية قُطعت أو الشراكة لن تُجدَّد. في تلك اللحظة، تكتشف المنظمة أنها لم تبنِ قاعدة مالية — بنت اعتماداً. الاستدامة المالية لا تعني رفض التمويل الكبير؛ تعني ألّا يكون أيّ مصدر واحد أكثر من أربعين أو خمسين بالمئة من إجمالي الميزانية. عندما تنوّع، يصبح كلّ مصدر جزءاً يمكن التكيّف مع فقدانه أو تراجعه، بدلاً من أن يكون هو الكلّ الذي يسقط كل شيء معه.',
            en: 'Many small organisations spend their early years looking for the large funder who will solve all their problems — and when they find them, they build everything around their contract: budget, team, programmes, and schedule. Then a day comes when they are told that priorities have shifted, the budget has been cut, or the partnership will not be renewed. At that moment the organisation discovers it did not build a financial base — it built dependence. Financial sustainability does not mean refusing large funding; it means no single source should account for more than forty or fifty per cent of the total budget.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'التمويل الحكومي المحلي: وزارات ومجالس بلدية وصناديق تنمية، وهو غالباً مستقرّ وطويل الأمد إذا بُنيت العلاقة بشكل صحيح',
              'المانحون الدوليون المتعدّدون: بدلاً من مانح واحد بمبلغ كبير، فكّر في ثلاثة مانحين بمبالغ أصغر لأنك إذا خسرت أحدهم لا تخسر كلّ شيء',
              'التبرّعات المحلية من الأفراد: حتى المبالغ الصغيرة تبني ملكية المجتمع وتقلّل الاعتماد الخارجي، والأهم أنها لا تأتي بشروط برامجية',
              'الدعم من القطاع الخاص والشركات: المسؤولية الاجتماعية للشركات وبرامج الشراكة، وهي غير متوقّعة لكنها تكمّل الصورة',
              'الإيرادات الذاتية إن أمكن: رسوم رمزية على بعض الخدمات أو مبيعات منتجات تُنتجها المجموعات المستفيدة أو أتعاب تدريب تُقدّمه لمنظمات أخرى',
              'الموارد العينية التي تُحسب في الميزانية: مساحة مجّانية، تطوّع مهني، معدّات مُعارة — كل هذا يقلّل الحاجة للنقد',
            ],
            en: [
              'Local government funding: ministries, municipal councils and development funds — usually stable and long-term when the relationship is built correctly',
              'Multiple international funders: rather than one funder with a large sum, consider three funders with smaller amounts so losing one does not mean losing everything',
              'Local individual donations: even small amounts build community ownership and reduce external dependence, and — crucially — they come without programmatic conditions',
              'Private sector and corporate support: corporate social responsibility and partnership programmes are unpredictable but fill gaps',
              'Earned income where possible: nominal fees for some services, products made by beneficiary groups, or training fees charged to other organisations',
              'In-kind resources counted in the budget: free space, skilled volunteering, loaned equipment — all reduce the need for cash',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'تنويع مصادر التمويل يستغرق وقتاً وجهداً — وكثير من الفرق تتجنّبه لأنه أصعب من كتابة مقترح واحد ضخم. لكن قاعدة الأربعين بالمئة تستحق الجهد: إذا لم يتجاوز أيّ مصدر أربعين بالمئة من ميزانيتك، فإن فقدانه مؤلم لكنه لا يوقف عملك. والإحصاءات الإقليمية تُظهر باستمرار أن المنظمات ذات المصادر المتعدّدة تعيش ضعف عمر تلك المعتمدة على مصدر واحد في ظروف متشابهة. التنويع ليس ترفاً — هو الحدّ الفاصل بين منظمة تخطّط لعقد ومنظمة تتمنّى ألّا ينتهي العقد الحالي.',
            en: 'Diversifying funding sources takes time and effort — and many teams avoid it because it is harder than writing one large proposal. But the forty per cent rule is worth the effort: if no source exceeds forty per cent of your budget, losing it hurts but does not stop your work. Regional figures consistently show that organisations with multiple sources survive twice as long as those depending on a single source in comparable circumstances. Diversification is not a luxury — it is the line between an organisation planning for the next decade and an organisation hoping its current contract does not end.',
          },
        },
        {
          type: 'quiz',
          id: 'sr-q2',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: {
            ar: 'منظمتك تتلقّى ثمانية وثمانين بالمئة من ميزانيتها من مانح أوروبي واحد. أبلغكم مسؤول البرامج أن التجديد للعام القادم غير مضمون بسبب إعادة توزيع داخلية. ما أول خطوة؟',
            en: 'Your organisation receives 88% of its budget from one European funder. The programme officer has told you that renewal next year is not guaranteed due to an internal reallocation. What is the first step?',
          },
          options: [
            {
              ar: 'انتظار القرار النهائي قبل اتخاذ أيّ إجراء لتجنّب الإنذار الكاذب',
              en: 'Wait for the final decision before taking any action, to avoid a false alarm',
            },
            {
              ar: 'إرسال خطاب للمانح يطلب التجديد الفوري والتهديد بإغلاق البرنامج وما يترتّب عليه من انقطاع الخدمة عن المستفيدين',
              en: 'Send the funder a letter demanding immediate renewal and threatening to close the programme and the interruption of service to beneficiaries that would follow',
            },
            {
              ar: 'البدء فوراً بمراجعة التكاليف الأساسية وتحديد مصادر بديلة محتملة وخطة تقليص إن لزم',
              en: 'Begin immediately reviewing core costs, identifying potential alternative sources, and drafting a contingency plan if needed',
            },
            {
              ar: 'إعلام الفريق بالتوقّف المحتمل حفاظاً على الشفافية',
              en: 'Inform the team of the possible closure to maintain transparency',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الانتظار يتلف الوقت الذي تحتاجه لبناء البدائل. والتهديد يضرّ بالعلاقة ويُظهر المنظمة بصورة ضعيفة. وإعلام الفريق بالتوقّف قبل وجود خطّة يرفع القلق دون فائدة. الخطوة الصحيحة هي مراجعة فورية وهادئة: كم هي التكاليف التي لا يمكن تخفيضها، وما المصادر الممكن تفعيلها في ثلاثة أشهر، وما شكل الخطة أ وخطة ب. هذا هو العمل الذي يصون البرنامج.',
            en: 'Waiting wastes the time needed to build alternatives. Threatening damages the relationship and makes the organisation look weak. Informing the team of closure before a plan exists raises anxiety without purpose. The right step is an immediate, calm review: what costs cannot be reduced, what sources can be activated in three months, and what does plan A and plan B look like.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'sr-m3',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: {
        ar: 'الموارد المحلية والعينية والتطوّع المهني',
        en: 'Local, In-Kind Resources and Skilled Volunteering',
      },
      lede: {
        ar: 'المجتمع حول كل مشروع يحمل موارد لم تُسأل عنها بعد — والسؤال الصحيح يفتح أبواباً كثيرة.',
        en: 'Every community around a project carries resources that have not yet been asked for — and the right question opens many doors.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين نقول «نحتاج موارد»، الذهن يذهب مباشرةً إلى المال. لكن كثيراً من ما يكلّف النقد يمكن الحصول عليه بطريقة أخرى: مكان مجّاني يقدّمه مسجد أو مدرسة، خبير محاسب يتطوّع بمراجعة حسابات المنظمة، محامٍ يقدّم استشارة قانونية، مطبعة تطبع المواد بسعر التكلفة، تاجر يتبرّع بالمواد الغذائية لفعالية. كل هذه موارد عينية — أي موارد ذات قيمة مالية تُقدَّم دون تحويل نقدي — وهي تقلّل الحاجة إلى التمويل النقدي وتبني في الوقت نفسه علاقات مجتمعية حقيقية. المنظمة التي تعمل وسط مجتمع دون أن تطلب موارده المحلية تفوّت فرصتين في آنٍ واحد: الفرصة المادية وفرصة بناء الملكية المجتمعية.',
            en: 'When we say "we need resources", the mind goes straight to money. But much of what costs cash can be obtained another way: a free space offered by a mosque or school, an accountant volunteering to review the organisation\'s books, a lawyer giving legal advice, a printer producing materials at cost, a merchant donating food supplies for an event. These are all in-kind resources — resources with monetary value offered without a cash transfer — and they reduce the need for financial funding while simultaneously building genuine community relationships. An organisation working inside a community without ever asking for its local resources misses two opportunities at once: the material one, and the chance to build community ownership.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'الموارد المادية العينية', en: 'Physical In-Kind Resources' },
              text: {
                ar: 'المساحات والمباني والمعدّات والسيارات والمواد الخام والمستلزمات. يمكن تقييمها بسعر السوق وإدراجها في ميزانية المشروع كمساهمة المجتمع.',
                en: 'Spaces, buildings, equipment, vehicles, raw materials and supplies. They can be valued at market rate and included in the project budget as a community contribution.',
              },
            },
            {
              title: { ar: 'التطوّع المهني', en: 'Skilled Volunteering' },
              text: {
                ar: 'محاسبون وأطباء ومهندسون ومصمّمون وإعلاميون يقدّمون وقتهم ومهاراتهم. يُحسب وقتهم بسعر السوق في وثيقة المشروع ويُعدّ مساهمةً حقيقية لا مجرّد تبرّع رمزي.',
                en: 'Accountants, doctors, engineers, designers and media professionals giving their time and skills. Their time is valued at market rate in project documents and counts as a real contribution.',
              },
            },
            {
              title: { ar: 'الدعم التشغيلي من المجتمع', en: 'Community Operational Support' },
              text: {
                ar: 'سكّان يفتحون بيوتهم للاجتماعات، ونساء يعدّون الطعام لفعاليات، وشباب يساعدون في النقل والترتيب. هذا دعم تشغيلي حقيقي يعكس انتماء المجتمع للمشروع.',
                en: 'Residents opening their homes for meetings, women preparing food for events, youth helping with transport and setup. This is real operational support that reflects community ownership of the project.',
              },
            },
          ],
        },
        {
          type: 'text',
          content: {
            ar: 'التطوّع المهني يستحق اهتماماً خاصاً لأنه يُحلّ مشكلتين في آنٍ واحد: الخبرة والتمويل. المنظمة الصغيرة التي لا تستطيع توظيف محاسب قانوني يمكنها أن تطلب تطوّع أحد أعضاء نقابة المحاسبين. المدرسة التي لا تملك معلّمي لغات أجنبية يمكنها التواصل مع جمعيات المغتربين. الجمعية التي تحتاج مواقع إلكترونية يمكنها التواصل مع كلية الحاسوب في الجامعة القريبة. المفتاح هو أن تُحدّد ما تحتاجه بدقّة، وأن تبحث في المجتمع المحيط عمّن يملكه ويرغب في المساهمة، وأن تجعل المساهمة سهلة ومُقدَّرة ومُوثَّقة. الخبير الذي يتطوّع ولا يرى اسمه في تقرير ولا تقديراً رسمياً لن يتطوّع مرّة ثانية. الذي يرى أثره موثّقاً وعمله مُقدَّراً يصبح سفيراً للمنظمة.',
            en: 'Skilled volunteering deserves special attention because it solves two problems at once: expertise and funding. A small organisation that cannot afford a licensed accountant can ask a member of the accounting association to volunteer. A school with no foreign-language teachers can approach diaspora associations. An association that needs a website can approach the computing faculty at a nearby university. The key is to define exactly what is needed, search the surrounding community for whoever has it and wants to contribute, and make that contribution easy, valued and documented. An expert who volunteers and never sees their name in a report or any formal acknowledgement will not volunteer a second time. One who sees their contribution documented and their work valued becomes an ambassador for the organisation.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'كيف تقيّم الموارد العينية وتُدرجها؟', en: 'How to value and record in-kind resources' },
          content: {
            ar: 'الموارد العينية لا تكون موارد حقيقية في وثائق المشروع إلا إذا قُدِّرت بسعر السوق ووُثِّقت رسمياً. مثلاً: «المحاسب تطوّع عشر ساعات، سعر الساعة في السوق ثمانية وعشرون دولاراً، إجمالي المساهمة مئتان وثمانون دولاراً.» هذا يجعل المورد قابلاً للإدراج في الميزانية كمساهمة محلية مقابل منح ماليّة تشترط نسبة تمويل ذاتي، ويُظهر للمانحين أن المجتمع يشارك حقاً وليس فقط يستفيد.',
            en: 'In-kind resources only become real resources in project documents when valued at market rate and formally recorded. For example: "The accountant volunteered ten hours; market rate per hour is $28; total contribution is $280." This makes the resource recordable in the budget as a local contribution against grants requiring co-funding, and shows funders that the community genuinely participates.',
          },
        },
        {
          type: 'quiz',
          id: 'sr-q3',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'تحتاج مشروعك إلى تصميم مواد تثقيفية لكن ميزانيتك لا تتّسع لمصمّمة. إحدى أمّهات المستفيدات مصمّمة جرافيك بخبرة خمس سنوات. كيف تتعامل مع هذا الوضع بطريقة تدعم الاستدامة؟',
            en: 'Your project needs educational materials designed but the budget does not cover a designer. One of the beneficiary mothers is a graphic designer with five years of experience. How do you handle this in a way that supports sustainability?',
          },
          options: [
            {
              ar: 'تطلب منها المساعدة بشكل غير رسمي ودون توثيق حتى لا تُعقَّد الأمور، وتشكرها بهدية رمزية في نهاية المشروع حين تكتمل المواد',
              en: 'Ask for her help informally and without documentation to keep things simple, and thank her with a token gift at the end of the project when the materials are finished',
            },
            {
              ar: 'تتجنّب الطلب منها لأن الاستفادة من المستفيدين أمر غير أخلاقي',
              en: 'Avoid asking her because benefiting from beneficiaries is unethical',
            },
            {
              ar: 'تُبرم معها اتفاقية تطوّع مهني رسمية، وتُقدِّر وقتها بسعر السوق وتُدرجه في ميزانية المشروع كمساهمة عينية',
              en: 'Establish a formal skilled-volunteering agreement, value her time at market rate and record it in the project budget as an in-kind contribution',
            },
            {
              ar: 'تدفع لها من الميزانية التشغيلية وإن تجاوزت الحدود المسموح بها',
              en: 'Pay her from the operational budget even if it exceeds permitted limits',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'طلب التطوّع من المستفيدين ليس غير أخلاقي بحدّ ذاته — غير الأخلاقي هو استغلالهم دون تقدير أو توثيق. الاتفاقية الرسمية تحترم مهارتها وتُقرّ بقيمة مساهمتها وتُدرجها في السجلات المالية. هذا يبني علاقة متكاملة لا علاقة خدمة أحادية الاتجاه. والتوثيق الغير رسمي يحرمك من استخدام هذه المساهمة في تقارير المانحين. الطريقة الرسمية هي الطريقة الصحيحة.',
            en: 'Asking beneficiaries to volunteer is not in itself unethical — what is unethical is exploiting them without recognition or documentation. A formal agreement respects her skills, acknowledges the value of her contribution and records it in financial accounts. This builds a reciprocal relationship, not a one-way service. Informal undocumented help also prevents you from counting the contribution in funder reports.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'sr-m4',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: {
        ar: 'خطة الاستدامة المكتوبة',
        en: 'The Written Sustainability Plan',
      },
      lede: {
        ar: 'خطة الاستدامة التي لم تُكتَب ليست خطّةً — هي نيّة حسنة لن تجد من يُحاسب عليها.',
        en: 'A sustainability plan that was never written is not a plan — it is a good intention with nobody to be held accountable for it.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'خطة الاستدامة وثيقة مختصرة وعملية تجيب على سؤال واحد: ماذا سيحدث لهذا المشروع بعد خمس سنوات أو بعد انتهاء التمويل الحالي، وما الخطوات التي نتّخذها اليوم لضمان أن يكون الجواب شيئاً إيجابياً؟ هي ليست تقريراً أكاديمياً ولا وثيقة استراتيجية ضخمة — هي خريطة طريق واضحة بأسماء ومواعيد ومؤشرات يمكن قياسها. المنظمات التي تكتب هذه الخطّة وتُراجعها سنوياً تُظهر للمانحين نضجاً مؤسسياً حقيقياً، وتخفّف من قلق الفريق حين تتغيّر الظروف، وتجعل الخروج من المشروع أمراً يُخطَّط له لا أمراً يفاجئ الجميع.',
            en: 'A sustainability plan is a concise, practical document that answers one question: what will happen to this project in five years or after the current funding ends, and what steps are we taking today to ensure the answer is something positive? It is not an academic report or a large strategic document — it is a clear roadmap with names, dates and measurable indicators. Organisations that write this plan and review it every year show funders genuine institutional maturity, ease the team\'s anxiety when circumstances change, and make leaving a project something planned for rather than something that takes everyone by surprise.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'وصف الأثر الذي يجب أن يبقى: حدّد بدقّة ما الذي يجب ألّا ينتهي بانتهاء المشروع — المهارة، الخدمة، العلاقة، الهيكل، أيّ منها؟',
              'تحليل الوضع الراهن: من يحمل الأثر حالياً ومن يمكنه حمله مستقبلاً في المجتمع أو المنظمة المحلية أو الجهة الحكومية؟',
              'خطة انتقال المعرفة والمهارة: كيف تُنقَل من الفريق الخارجي إلى الجهة المحلية، وفي أيّ جدول زمني؟',
              'خطة تنويع التمويل: ما المصادر البديلة الممكن بناؤها خلال عمر المشروع وكيف يُبدأ بتفعيلها الآن؟',
              'مؤشرات الاستدامة القابلة للقياس: ما الأرقام أو الإنجازات التي تُخبرك أن المشروع بات مستداماً فعلاً — نسبة التمويل المحلي، عدد الكوادر المحلية المدرَّبة، وجود سياسات مؤسسية موثّقة؟',
              'خطة المراجعة السنوية: من يراجع الخطة ومتى ومن يُحاسب عليها؟',
            ],
            en: [
              'Describe the impact that must remain: define precisely what must not end when the project ends — a skill, a service, a relationship, a structure?',
              'Analyse the current situation: who holds the impact now and who can carry it in future — in the community, local organisation or government body?',
              'Knowledge and skills transfer plan: how are they transferred from the external team to the local party, and on what timeline?',
              'Funding diversification plan: what alternative sources can be built during the project life, and how are they activated now?',
              'Measurable sustainability indicators: what numbers or achievements tell you the project is genuinely sustainable — percentage of local funding, number of trained local staff, existence of documented institutional policies?',
              'Annual review plan: who reviews the plan, when, and who is accountable for it?',
            ],
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'خطة استدامة فعّالة', en: 'An effective sustainability plan' },
          noTitle: { ar: 'خطة استدامة وهمية', en: 'A hollow sustainability plan' },
          yes: {
            ar: [
              'تحدّد جهة محلية بعينها ستتولّى الأنشطة مع نهاية المشروع وباسم المسؤول',
              'تحتوي على جدول زمني لنقل المهارات مع تواريخ وأسماء',
              'تُدرج مؤشرات قابلة للقياس تُراجع كل ستة أشهر',
              'تُعدَّل سنوياً بناءً على ما تغيّر في السياق',
            ],
            en: [
              'Identifies a specific local party by name who will take over activities at the project\'s end',
              'Contains a skills transfer timeline with dates and names',
              'Includes measurable indicators reviewed every six months',
              'Is revised annually based on what has changed in context',
            ],
          },
          no: {
            ar: [
              'تقول «سنعمل على تعزيز قدرات المجتمع» دون تفاصيل',
              'لا تُحدّد من يتولّى ماذا بعد انتهاء التمويل',
              'تُكتَب في أوّل سنة وتُنسى حتى آخر تقرير',
              'تقيس النجاح بعدد الأنشطة لا بأثرها المستمرّ',
            ],
            en: [
              'Says "we will work to strengthen community capacity" with no detail',
              'Does not specify who takes over what when funding ends',
              'Written in year one and forgotten until the final report',
              'Measures success by number of activities rather than their lasting impact',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'قياس مؤشّرات الاستدامة في برامج التطوّع لا يعني انتظار نهاية المشروع ثم السؤال: هل نجحنا؟ بل يعني وضع مؤشّرات قابلة للقياس منذ البداية وتتبّعها على مدار عمر البرنامج. المؤشّر الجيّد للاستدامة يجيب على سؤال واحد: هل يستطيع هذا البرنامج أن يستمرّ بعد انتهاء التمويل الأوّل أو بعد مغادرة الفريق المؤسّس؟\n\nللإجابة بدقّة، تحتاج إلى ثلاثة أنواع من المؤشّرات: مؤشّرات مالية تقيس انخفاض الاعتماد على مصدر تمويل واحد بمرور الوقت، ومؤشّرات بشرية تقيس نقل المهارات من الفريق الخارجي إلى الكوادر المحلية، ومؤشّرات تشغيلية تقيس اكتمال التوثيق وقدرة المنظمة على الاستمرار عند تغيّر الفريق.\n\nعلى الصعيد المالي، أسئلة محدّدة تُساعد: ما نسبة الميزانية المموَّلة محلياً هذا العام مقارنة بالعام الماضي؟ هل الموارد العينية والتطوّع المهني المُوثَّق يتزايد أم يتناقص؟ هل أُضيف مصدر تمويل بديل هذا العام لم يكن موجوداً العام السابق؟ كل تحسُّن في هذه الأرقام علامة حيويّة تُخبرك أن الاستدامة المالية تتحرّك في الاتجاه الصحيح.\n\nعلى الصعيد البشري، المؤشّر الأهمّ ليس عدد الأشخاص المدرَّبين بل ما يستطيعون فعله وحدهم الآن ولم يكونوا يستطيعونه قبل عام. الفرق بين «تلقّى تدريباً» وبين «بات قادراً على إدارة هذه العملية باستقلالية» فرق جوهري، وكثير من التقارير تخلط بينهما. المؤشّر الصادق هو الاختبار الميداني: هل يستطيع الشخص تنفيذ المهمة دون الحاجة إلى مرجع خارجي؟\n\nعلى الصعيد التشغيلي، السؤال الجوهري هو: لو غادر المنسّق الأساسي اليوم، كم سيستغرق الفريق حتى يجد ما يحتاجه في الوثائق الموجودة ويتمكّن من الاستمرار؟ إن كانت الإجابة أكثر من أسبوع، فالتوثيق التشغيلي يحتاج تطوير عاجل. وإن كانت الإجابة يوماً أو يومين، فالمنظمة تُظهر نضجاً مؤسسياً حقيقياً. قياس هذه المؤشّرات بانتظام — كل ستة أشهر على الأقل — يُحوّل الاستدامة من هدف نهائي مجرّد إلى عملية حيّة يمكن تصحيح مسارها قبل أن يفوت الأوان. الأهمّ من القياس هو ما يحدث بعده: هل تُستخدم النتائج لتعديل المسار أم تُكتب في تقرير ثم تُنسى؟ مؤشّر يُقاس ولا يُتّخذ على أساسه قرار هو جهد مهدور.',
            en: 'Measuring sustainability indicators in volunteer programmes does not mean waiting until the project ends and then asking: did we succeed? It means setting measurable indicators from the outset and tracking them throughout the programme\'s life. A good sustainability indicator answers one question: can this programme continue after the first funding ends or after the founding team leaves?\n\nTo answer accurately, you need three types of indicators: financial indicators measuring the decline in dependence on a single funding source over time, human indicators measuring skills transfer from the external team to local staff, and operational indicators measuring documentation completeness and the organisation\'s ability to continue when the team changes.\n\nOn the financial side, specific questions help: what proportion of this year\'s budget is locally funded compared to last year? Is documented in-kind support and skilled volunteering growing or shrinking? Was a new funding source added this year that did not exist last year? Every improvement in these figures is a vital sign telling you financial sustainability is moving in the right direction.\n\nOn the human side, the most important indicator is not the number of people trained but what they can now do independently that they could not do a year ago. The difference between "received training" and "is now able to manage this process independently" is fundamental, and many reports confuse the two. The honest indicator is the field test: can the person carry out the task without needing external reference?\n\nOn the operational side, the fundamental question is: if the lead coordinator left today, how long would it take the team to find what they need in existing documents and be able to continue? If the answer is more than a week, operational documentation needs urgent improvement. If the answer is a day or two, the organisation shows genuine institutional maturity. Measuring these indicators regularly — at least every six months — transforms sustainability from an abstract final goal into a living process whose course can be corrected before it is too late. More important than measuring is what happens after: are results used to adjust course, or written in a report and forgotten? An indicator that is measured but never acted on is wasted effort.',
          },
        },
        {
          type: 'quiz',
          id: 'sr-q4',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'مشروعك يقترب من نهايته بعد ثلاثة أشهر وخطة الاستدامة تقول «ستتولّى المنظمة المجتمعية المحلية الاستمرار». حين تتواصل معها، تكتشف أنها لا تعلم بذلك ولا تملك الكوادر اللازمة. ما الخطوة الأولى؟',
            en: 'Your project ends in three months and the sustainability plan says "the local community organisation will continue." When you contact them, you discover they know nothing about this and lack the necessary staff. What is the first step?',
          },
          options: [
            {
              ar: 'تمديد المشروع لستة أشهر إضافية لإعداد المنظمة المحلية، فالتمديد أسهل من إعادة التفاوض على خطة الانتقال ويمنح الجميع وقتاً كافياً',
              en: 'Extend the project by six months to prepare the local organisation, since an extension is easier than renegotiating the transition plan and gives everyone more time',
            },
            {
              ar: 'تسليم الملفّات كما هي مع تقرير ختامي وإغلاق المشروع في موعده',
              en: 'Hand over files as they are with a final report and close the project on time',
            },
            {
              ar: 'عقد اجتماع طارئ مع المنظمة المحلية والمانح لمراجعة خطة الانتقال وتعديلها بواقعية خلال الوقت المتبقّي',
              en: 'Hold an urgent meeting with the local organisation and the funder to review the transition plan and adjust it realistically within the remaining time',
            },
            {
              ar: 'الاستمرار في تنفيذ الأنشطة مباشرةً بدلاً من المنظمة المحلية',
              en: 'Continue delivering activities directly instead of the local organisation',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'التسليم الرسمي دون استعداد حقيقي يترك المجتمع في فراغ. والاستمرار بدلاً من المنظمة المحلية يُطيل الاعتماد ويُلغي فرصة بناء القدرة. الاجتماع الطارئ هو الخطوة الوحيدة التي تواجه الواقع بصدق وتحاول تصحيح مسار لا يزال فيه وقت للتصحيح. وهذا الموقف نفسه هو السبب في أن خطة الاستدامة يجب أن تُبنى مع الجهة المحلية لا أن تُكتب عنها.',
            en: 'A formal handover without genuine readiness leaves the community in a void. Continuing in place of the local organisation extends dependence and cancels the opportunity to build capacity. The emergency meeting is the only step that confronts reality honestly and tries to correct a course while there is still time to correct it. This situation is itself the reason why a sustainability plan must be built with the local party, not written about them.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'sr-m5',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: {
        ar: 'أخلاقيات جمع الدعم والوعود التي لا تُنفَّذ',
        en: 'Ethics of Fundraising and Promises That Cannot Be Kept',
      },
      lede: {
        ar: 'جمع الدعم بطريقة تُعِد بما لا يمكن تحقيقه هو أقصر طريق لخسارة المانحين والمتطوّعين والمستفيدين في وقت واحد.',
        en: 'Raising support by promising what cannot be delivered is the fastest route to losing funders, volunteers and beneficiaries all at once.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين يشتدّ الضغط المالي، يقع الفريق في إغراء تضخيم الوعود: «سنغيّر حياة ألف أسرة»، «سنُنهي الأمية في المنطقة»، «ستصبح القرية نموذجاً». هذه الجمل تُقنع المانحين أحياناً — لكنها تُنشئ التزامات مستحيلة تُقيَّم المنظمة عليها لاحقاً، وتُحبط المتطوّعين الذين لا يرون النتائج الموعودة، وتُخيّب ظنّ المجتمع الذي آمن بالوعود. الاتصالات الأخلاقية في جمع الدعم لا تعني التواضع الكاذب — تعني الدقّة الصادقة: «هذا ما نستطيع تحقيقه بهذا المبلغ في هذا الوقت، وهذا ما سيتغيّر فعلياً في حياة هؤلاء الناس.» الصدق لا يُضعف المقترحات — يبني الثقة طويلة الأمد التي تُحوِّل المانحين إلى شركاء لا مجرّد ممولّين.',
            en: 'When financial pressure mounts, the temptation is to inflate promises: "we will change the lives of a thousand families", "we will end illiteracy in the region", "the village will become a model". These sentences sometimes persuade funders — but they create impossible obligations by which the organisation is later judged, they demoralise the volunteers who never see the promised results, and they disappoint the community that believed in the promises. Ethical fundraising communications do not mean false modesty — they mean honest precision: "this is what we can achieve with this amount in this time, and this is what will actually change in these people\'s lives." Honesty does not weaken a proposal — it builds the long-term trust that turns funders into partners rather than mere financiers.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'اربط كلّ وعد بمبلغ محدّد وفريق محدّد وجدول زمني واقعي — الوعد غير المرتبط بهذه المعطيات ليس وعداً بل تمنّياً',
              'أطلع المانح على القيود والمخاطر المعروفة مسبقاً بدلاً من اكتشافها في تقرير المنتصف',
              'عدّل الوعود حين تتغيّر الظروف وأبلغ المانح فوراً — التأخير في الإبلاغ أشدّ ضرراً من الخبر السيئ نفسه',
              'وثّق ما حققته وما لم تحقّقه بصدق متساوٍ في التقارير — التقرير الذي يُخفي الإخفاقات يُجعل المنظمة غير موثوقة حين تكشف التدقيق',
              'لا تُصوِّر صورة لشخص متضرّر دون موافقة كريمة، ولا تبالغ في تصوير المعاناة لإثارة العواطف — هذا استغلال حتى لو كان بنيّة حسنة',
              'قدِّر بواقعية ما يمكن تحقيقه وما لا يمكن، وقل ذلك بوضوح — الثقة تُبنى بالصدق لا بالوعود الكبيرة',
            ],
            en: [
              'Tie every promise to a specific amount, specific team and realistic timeline — a promise unconnected to these is a wish, not a commitment',
              'Inform funders of known constraints and risks upfront rather than through a mid-term report',
              'Revise promises when circumstances change and notify the funder immediately — delayed reporting causes more damage than the bad news itself',
              'Document what was and was not achieved with equal honesty in reports',
              'Do not photograph a person affected without dignified consent, and do not exaggerate suffering to stir emotion — this is exploitation even when well-intentioned',
              'Estimate realistically what can and cannot be done, and say so clearly — trust is built by honesty, not large promises',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'الوعد المستحيل يكلّف أكثر من رفض التمويل', en: 'An impossible promise costs more than refusing funding' },
          content: {
            ar: 'المنظمة التي تقبل شروط منحة لا تستطيع الوفاء بها اعتقاداً أن الأمور ستنحلّ تجازف بأكثر من المال: تجازف بسمعتها مع المانح، وثقة المجتمع المستفيد، ومعنويات فريقها حين يعمل تحت ضغط هدف غير قابل للتحقيق. «لا تستطيع أن تعد بما لا تملكه» ليس موقفاً ضعيفاً — هو أساس كلّ شراكة ناجحة على المدى البعيد. والمانح الجيّد يفضّل الصدق ويُعيد التفاوض، بينما المانح الذي لا يريد سماع الحقيقة ليس شريكاً بل ممولّاً يبحث عن قصّة ناجحة بصرف النظر عمّا يحدث فعلاً.',
            en: 'An organisation that accepts grant conditions it cannot meet — believing things will work out — risks more than money: it risks its reputation with the funder, the community\'s trust, and its team\'s morale when working under an unachievable target. Saying "we cannot promise what we do not have" is not weakness — it is the foundation of every successful long-term partnership. A good funder prefers the honest answer and will renegotiate; a funder who does not want to hear the truth is not a partner but a financier looking for a success story regardless of what is actually happening.',
          },
        },
        {
          type: 'quiz',
          id: 'sr-q5',
          label: { ar: 'سيناريو أخلاقي', en: 'Ethical scenario' },
          question: {
            ar: 'كتبت مقترحاً وقدّرت فيه تدريب مئتي شخص. حصلت على التمويل. بعد شهرين، اتّضح أن إمكانياتك الحقيقية خمسة وتسعون شخصاً بسبب قيود لوجستية لم تُقدَّر بدقّة. ماذا تفعل؟',
            en: 'You submitted a proposal estimating training 200 people. You received funding. Two months later, it is clear that your realistic capacity is 95 people due to logistical constraints that were underestimated. What do you do?',
          },
          options: [
            {
              ar: 'تُبقي الرقم في التقارير وتحاول بلوغه بأيّ طريقة ممكنة، فتعديل المؤشّر يُضعف ثقة المانح بالمنظمة',
              en: 'Keep the number in reports and try to reach it by any means possible, since revising the target would weaken the funder\'s confidence in the organisation',
            },
            {
              ar: 'تُبلّغ المانح فوراً بالفجوة والسبب وتقترح تعديل المؤشر أو الطريقة',
              en: 'Notify the funder immediately of the gap, its cause, and propose adjusting the target or method',
            },
            {
              ar: 'تُكمل المشروع على قدر إمكانياتك الحقيقية وتشرح في التقرير النهائي لماذا لم يُحقَّق الهدف العددي المعلن',
              en: 'Complete the project to the limit of your real capacity and explain in the final report why the stated numerical target was not met',
            },
            {
              ar: 'تنهي المشروع مبكّراً لأن الهدف أصبح غير قابل للتحقيق',
              en: 'End the project early because the target has become unachievable',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الإبلاغ الفوري مؤلم لكنه الطريق الوحيد الذي يصون العلاقة مع المانح ويُتيح إيجاد حلٍّ معاً. معظم المانحين يقبلون التعديل المبكّر بمنطق واضح أكثر بكثير من قبولهم الاكتشاف في التقرير النهائي. الانتهاء المبكّر خسارة كاملة، والمطاولة بأيّ طريقة تُنتج بيانات غير أمينة. الصدق المبكّر هو الشكل الأكثر مهنيةً من المساءلة.',
            en: 'Immediate notification is painful but the only path that preserves the relationship and allows a joint solution. Most funders accept early revision with clear reasoning far more readily than discovering the problem in a final report. Early termination is a total loss; pressing ahead by any means produces dishonest data. Early honesty is the most professional form of accountability.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الإبلاغ الشفاف عن استخدام الموارد ليس متطلباً رسمياً فحسب — بل ركيزة الثقة مع المانحين والمستفيدين والمجتمع. التقرير المالي الدقيق الذي يُفصّل كيف أُنفق كل ريال ويُقارن بين المُخطَّط والفعلي هو أداة مساءلة تُقوّي موقف المنظّمة لا تُضعفه. المنظّمات التي تُصدر تقارير شفافة تحصل في الغالب على تجديد التمويل بسهولة أكبر من تلك التي تكتفي بالأرقام الإجمالية.\n\nمبدأ التدرّج في الإفصاح: ليس كل تفصيل مناسب لكل جمهور. التقرير المجتمعي العام يُركّز على الأثر والمستفيدين، بينما التقرير المُقدَّم للمانحين يتضمّن التفاصيل المالية الكاملة. هذا التدرّج ليس تخفياً — بل تصميم اتصال يُراعي سياق كل متلقٍّ ويُقدّم المعلومات بالشكل الأكثر فائدة له.',
            en: 'Transparent reporting on resource use is not just a formal requirement — but a pillar of trust with funders, beneficiaries, and the community. An accurate financial report detailing how every riyal was spent and comparing planned versus actual is an accountability tool that strengthens the organisation\'s position, not weakens it. Organisations that publish transparent reports generally obtain funding renewal more easily than those that settle for aggregate figures.\n\nThe principle of tiered disclosure: not every detail is appropriate for every audience. A general community report focuses on impact and beneficiaries, while a funder report includes full financial details. This tiering is not concealment — but communication design that respects each recipient\'s context and presents information in the form most useful to them.',
          },
        },
        {
          type: 'quiz',
          id: 'sr-q6',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أيّ من التالي يمثّل تعبئةً أخلاقية للموارد في حملة تبرّعات؟',
            en: 'Which of the following represents ethical resource mobilisation in a fundraising campaign?',
          },
          options: [
            {
              ar: 'استخدام صورة طفل مجهول الهوية وعليه نداء عاطفي دون موافقته أو موافقة أسرته، فلا أحد يستطيع التعرّف عليه',
              en: 'Using an unidentified child\'s photo with an emotional appeal, without their or their family\'s consent, since nobody can recognise the child anyway',
            },
            {
              ar: 'وصف المشروع بأنه «سيُنهي الفقر في المنطقة» لأن الجملة أكثر جاذبية والمانحون يستجيبون للوعود الكبيرة',
              en: 'Describing the project as "ending poverty in the region" because the sentence is more attractive and donors respond better to bold claims',
            },
            {
              ar: 'تقديم قصّة حقيقية بموافقة صاحبها ووصف دقيق لما سيحقّقه التبرّع',
              en: 'Presenting a real story with the person\'s consent and an accurate description of what the donation will achieve',
            },
            {
              ar: 'المبالغة في عرض نسبة الإنجاز لأن ذلك يشجّع التبرّع',
              en: 'Exaggerating the achievement rate because it encourages donations',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الموافقة والدقّة هما ركيزتا الاتصالات الأخلاقية في جمع الموارد. القصّة الحقيقية بموافقة صاحبها ووصف صادق لأثر التبرّع تبني ثقة دائمة أقوى بكثير من الصور العاطفية أو الوعود الفضفاضة. والمتبرّع الذي يرى أن ما وُعد به يتحقّق فعلاً يتحوّل إلى داعم دائم — أمّا الذي يشعر بالتضليل فلن يعود.',
            en: 'Consent and accuracy are the two pillars of ethical communications in resource mobilisation. A real story with the person\'s consent and an honest description of a donation\'s impact builds lasting trust far stronger than emotional images or vague promises. A donor who sees what was promised actually delivered becomes a permanent supporter — one who feels misled will not return.',
          },
        },
      ],
    },
  ],
};
