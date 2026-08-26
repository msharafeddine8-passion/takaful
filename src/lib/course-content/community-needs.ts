import type { CourseContent } from './types';

/**
 * Level 3 — Community Needs Assessment and Accountability. Pass mark 70.
 *
 * Built around a single uncomfortable truth: most aid and volunteer programmes
 * begin with a diagnosis the beneficiaries never gave. The course works through
 * the gap between assumed and expressed need, then gives the volunteer four
 * concrete skills: choosing the right data-collection method, selecting
 * participants fairly, opening a complaints channel that people will actually
 * use, and closing the feedback loop with a reply that reaches the person.
 *
 * The accountability content is practical rather than ethical-philosophical.
 * Ethics are assumed; the challenge is the mechanics — what does a working
 * complaints system look like when the coordinator has twelve other things to do.
 */

export const communityNeeds: CourseContent = {
  slug: 'community-needs',
  level: 3,
  minutes: 40,
  passMark: 70,
  title: {
    ar: 'تقييم احتياجات المجتمع والمساءلة المجتمعية',
    en: 'Community Needs Assessment and Accountability',
  },
  lede: {
    ar: 'الفرق بين ما نفترض أن الناس يحتاجونه وما يقولونه هم — وكيف تسأل، وكيف تختار من تسأله، وكيف تفتح قناة شكاوى، وكيف تُغلق حلقة الملاحظات بردّ يصل لصاحبه.',
    en: 'The gap between what we assume people need and what they say they need — how to ask, who to ask, how to open a complaints channel, and how to close the feedback loop with a reply that reaches the person.',
  },
  outcomes: {
    ar: [
      'تميّز بين الاحتياج المفترض والاحتياج الذي عبّر عنه المجتمع',
      'تختار أداة جمع بيانات مناسبة: مقابلة، مجموعة نقاش، استبيان، ملاحظة',
      'تختار المشاركين بعدالة وتشرح معايير الاستفادة علناً',
      'تفتح قناة شكاوى وتُغلق حلقة الملاحظات بردّ يصل لصاحبها',
    ],
    en: [
      'Distinguish an assumed need from one a community has actually voiced',
      'Choose a fitting method: interview, focus group, survey, observation',
      'Select participants fairly and state the eligibility criteria openly',
      'Open a complaints channel and close the feedback loop with a reply that reaches the person',
    ],
  },
  sources: [
    'Core Humanitarian Standard on Quality and Accountability (CHS Alliance, 2024 edition)',
    'IFRC — Community Engagement and Accountability guidelines',
    'Sphere Handbook: Humanitarian Charter and Minimum Standards in Humanitarian Response (2018)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'cn-m1',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'الاحتياج المُفترض مقابل الاحتياج المُعبَّر عنه', en: 'Assumed need vs expressed need' },
      lede: {
        ar: 'نقطة البداية في أي برنامج مجتمعي ليست ما تعتقده الجهة الداعمة، بل ما يقوله المجتمع نفسه حين تُتاح له فرصة حقيقية للكلام.',
        en: 'The starting point of any community programme is not what the supporting organisation believes, but what the community itself says when genuinely given the chance to speak.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'عندما تدخل جهة إنسانية أو تطوّعية إلى مجتمع ما، فإنها تحمل معها في الغالب تصوّرات مسبقة عمّا يحتاجه هذا المجتمع. هذه التصوّرات قد تستند إلى بيانات وطنية أو إلى خبرة سابقة في مناطق مشابهة أو إلى قراءة دراسات أُجريت في سياقات مختلفة. لكن الاحتياج المُفترض — وهو ما تفترضه الجهة دون أن تسأل — ليس بالضرورة هو ما يعيشه الناس في هذا الحيّ بالذات مع هذه الأسرة بالذات في هذا الوقت بالذات.\n\nالفرق ليس فلسفياً؛ هو عملي تماماً. برنامج توزيع غذاء أُقيم في منطقة لا يفتقر أهلها إلى الغذاء بل إلى الدخل لن يُغيّر من حياتهم شيئاً دائماً. وحملة توعية صحية صُمِّمت لأمراض شائعة على المستوى الوطني لكنها نادرة في هذه البيئة ستستهلك وقت الفريق وثقة المجتمع دون طائل. والأكثر خطورة أن برنامجاً مبنياً على افتراض خاطئ يُعلّم المجتمع أن الجهات التي تأتي لا تسمعهم، وحين يجيء برنامج مناسب لاحقاً سيواجه جداراً من الشكّ صُنعناه نحن.',
            en: 'When a humanitarian or voluntary organisation enters a community, it usually carries pre-formed ideas about what that community needs. These may be grounded in national statistics, previous experience in similar areas, or studies conducted in different contexts. But the assumed need — what the organisation supposes without asking — is not necessarily what the people in this specific neighbourhood with this specific family at this specific moment are living.\n\nThe difference is not philosophical; it is entirely practical. A food-distribution programme set up in an area where people lack income rather than food will change nothing lasting. A health-awareness campaign designed for diseases that are common nationally but rare in this environment will spend the team\'s time and the community\'s trust for nothing. Most dangerously, a programme built on a wrong assumption teaches the community that organisations that come do not listen, and when a suitable programme comes later it will face a wall of scepticism that we ourselves built.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الاحتياج المُعبَّر عنه هو ما يقوله الناس حين تُتاح لهم فرصة حقيقية للكلام: في ظروف مناسبة، بلغتهم، مع ضمان أن إجابتهم لن تعود عليهم بضرر، وأن شخصاً حقيقياً سيسمع ويستجيب. هذا الشرط الأخير أهمّ مما يبدو: الناس يتعلّمون بسرعة أن لا جدوى من الإجابة إذا لم تتغيّر الأشياء أبداً. ومن الأخطاء الشائعة الاعتقاد بأن سؤال «ما الذي تحتاجونه؟» في نهاية اجتماع جماعي يُمثّل تقييماً. الناس في الاجتماعات يتحدّثون وفق ما يرون أنه مقبول اجتماعياً، ووفق ما يعتقدون أن الجهة تريد سماعه، ووفق ما يقوله الشخص الأكثر نفوذاً في المجلس. التعبير الحقيقي يحتاج ظرفاً مصمَّماً له بعناية.',
            en: 'The expressed need is what people say when genuinely given the chance to speak: in suitable conditions, in their own language, with assurance that their answer will not harm them and that a real person will hear and respond. That last condition matters more than it seems: people quickly learn there is no point in answering if nothing ever changes. One common error is to believe that asking "what do you need?" at the end of a group meeting constitutes an assessment. In meetings, people speak in line with what is socially acceptable, what they think the organisation wants to hear, and what the most influential person in the room is saying. Genuine expression needs a context designed for it.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'افتراض: «الأسر تحتاج دروساً لمحو الأمية» — الواقع المُعبَّر: «الأمهات يحتجن رعاية أطفال أثناء الدرس»',
              'افتراض: «الشباب يحتاجون تدريباً مهنياً» — الواقع المُعبَّر: «الشباب يحتاجون شبكة تواصل مهني تُوصّلهم بأصحاب العمل»',
              'افتراض: «كبار السن يحتاجون زيارات منزلية للرعاية الصحية» — الواقع المُعبَّر: «يحتاجون فرصاً للتواصل الاجتماعي لا الرعاية الطبية»',
              'افتراض: «الأطفال يحتاجون مستلزمات مدرسية» — الواقع المُعبَّر: «الحاجة الأكبر هي النقل من وإلى المدرسة»',
            ],
            en: [
              'Assumed: "Families need literacy classes" — Expressed reality: "Mothers need childcare during the class"',
              'Assumed: "Young people need vocational training" — Expressed reality: "Young people need a professional network connecting them to employers"',
              'Assumed: "Older adults need home health visits" — Expressed reality: "They need social connection, not medical care"',
              'Assumed: "Children need school supplies" — Expressed reality: "The main need is transport to and from school"',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'الافتراض بحسن نية ليس عذراً', en: 'Good intentions do not excuse assumption' },
          content: {
            ar: 'أن تأتي بنية طيبة لا يعني أن التدخّل سيفيد. أكثر البرامج الإنسانية التي هدرت موارد المجتمعات الدولية جاءت من جهات مؤمنة إيماناً راسخاً بما تفعله. النية لا تُعوّض المعرفة؛ وما يُعوّضها هو السؤال — الكثير منه، والمنظَّم، والموجَّه للناس الذين يعيشون الواقع لا للذين يشرحونه من بعيد.',
            en: 'Coming with good intentions does not mean the intervention will help. Many of the humanitarian programmes that wasted the most donor resources came from organisations that were deeply convinced of what they were doing. Intention does not replace knowledge. What replaces it is asking — systematically, in quantity, and directed at the people living the reality rather than those explaining it from a distance.',
          },
        },
        {
          type: 'quiz',
          id: 'cn-q1',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أيّ الحالتين التاليتين تمثّل احتياجاً مُعبَّراً عنه بدقة لا مجرّد افتراض؟',
            en: 'Which of the following represents a properly expressed need rather than an assumption?',
          },
          options: [
            {
              ar: 'جهة تلاحظ معدلات تسرّب عالية في المدارس وتقرّر إنشاء برنامج دعم أكاديمي',
              en: 'An organisation notices high school dropout rates and decides to start an academic-support programme',
            },
            {
              ar: 'أمهات في جلسة نقاش يقلن إن أطفالهن يتركون المدرسة لأنهم يعملون صباحاً لمساعدة الأسرة',
              en: 'Mothers in a focus group say their children leave school because they work in the mornings to help the family',
            },
            {
              ar: 'خبير تعليم يوصي بعد قراءة تقارير أن الحلّ هو خفض أعداد الطلاب في الفصل',
              en: 'An education expert recommends after reading reports that the solution is smaller class sizes',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الاحتياج المُعبَّر عنه هو ما قاله الناس أنفسهم في ظرف أُتيح لهم فيه الكلام بصدق. القراءات الإحصائية والتوصيات الخبراتية قد تكون صحيحة لكنها تبقى في حدود الافتراض حتى تُؤكَّد بصوت من يعيش الواقع. الأمهات أخبرنك بالسبب الحقيقي — وهو مختلف تماماً عن التشخيصَين الآخرَين، ما يعني أن التدخّل المناسب مختلف أيضاً.',
            en: 'An expressed need is what people themselves said in a setting that allowed them to speak honestly. Statistical readings and expert recommendations may be accurate, but they remain assumptions until confirmed by the voices of those living the reality. The mothers told you the real reason — which is entirely different from the other two diagnoses, meaning the right intervention is also different.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'cn-m2',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'أدوات جمع البيانات — متى تختار ماذا', en: 'Data-collection tools — choosing the right one' },
      lede: {
        ar: 'لكل أداة سياق تُعطيك فيه معلومات لا تستطيع أداة أخرى إعطاءها. الخطأ ليس في الأداة — هو في اختيار الأداة الخطأ للسؤال الخطأ.',
        en: 'Every tool gives you information that no other tool can in the right context. The error is not the tool — it is picking the wrong tool for the wrong question.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'جمع البيانات المجتمعية ليس إجراءً واحداً، بل مجموعة من الأدوات يختار منها الفريق بحسب نوع السؤال الذي يريد الإجابة عنه وبحسب طبيعة المجتمع الذي يعمل معه. الأداة الخاطئة لا تُعطيك بيانات سيئة فحسب؛ أحياناً تُعطيك بيانات تبدو جيدة وهي مُضلِّلة، وهذا أخطر بكثير. استبيان يسأل «هل تحضر الجلسات بانتظام؟» سيُعطيك غالباً «نعم» لأن الناس يميلون إلى الإجابة الاجتماعية المقبولة. المقابلة الفردية التي تسأل «أخبريني عن آخر مرة تغيّبت فيها» ستُعطيك السبب الحقيقي.',
            en: 'Community data collection is not a single procedure but a set of tools the team selects based on the type of question it wants to answer and the nature of the community it is working with. The wrong tool does not only give you poor data; sometimes it gives you data that looks good but is misleading, which is far more dangerous. A survey asking "do you attend sessions regularly?" will usually get a "yes" because people tend toward the socially acceptable answer. An individual interview asking "tell me about the last time you missed a session" will give you the real reason.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'المقابلة الفردية المعمّقة', en: 'In-depth individual interview' },
              text: {
                ar: 'تُعطيك تجربة شخصية كاملة بكل تفاصيلها. الشخص يتكلّم بلغته ويُصحّح نفسه ويُضيف ما لم تسأل عنه. تستغرق وقتاً وتحتاج مقابِلاً مُدرَّباً وعيّنتها صغيرة — لكنها تُخبرك «لماذا» لا «كم».',
                en: 'Gives you a complete personal experience in full detail. The person speaks in their own words, corrects themselves, and adds what you did not ask. Takes time and needs a trained interviewer with a small sample — but tells you "why", not "how many".',
              },
            },
            {
              title: { ar: 'مجموعة النقاش', en: 'Focus group' },
              text: {
                ar: 'تجمع ستة إلى اثني عشر شخصاً في حوار منظَّم بمسهِّل. تُولّد تفاعلاً بين المشاركين يفتح زوايا لم تكن في خطّتك. مناسبة لاستكشاف تصوّرات جماعية، لكنها لا تصلح حين الموضوع حسّاس أو حين قد يُؤثّر بعض الحضور في إجابات الآخرين.',
                en: 'Brings six to twelve people into a structured conversation with a facilitator. Generates interaction that opens angles you did not plan for. Good for exploring collective views, but unsuitable when the subject is sensitive or when some participants may influence others\' answers.',
              },
            },
            {
              title: { ar: 'الاستبيان', en: 'Survey' },
              text: {
                ar: 'يُعطيك عيّنة أكبر وإمكانية المقارنة بين مجموعات. مناسب حين تعرف مسبقاً الخيارات الممكنة وتريد معرفة توزيعها. لكنه يُقصي من يصعب عليهم القراءة ولا يُصحّح سوء فهم الأسئلة.',
                en: 'Gives you a larger sample and the ability to compare across groups. Useful when you already know the possible options and want to know how they are distributed. But excludes those with difficulty reading and cannot correct misunderstanding of questions.',
              },
            },
            {
              title: { ar: 'الملاحظة المباشرة', en: 'Direct observation' },
              text: {
                ar: 'تُعطيك ما يفعله الناس فعلاً لا ما يقولون إنهم يفعلونه — والفجوة بين الاثنين واسعة في كثير من الحالات. مناسبة لفهم استخدام خدمة أو سلوك في مكان عام، وتحتاج عيناً مُدرَّبة على الملاحظة الموضوعية.',
                en: 'Gives you what people actually do rather than what they say they do — and the gap between the two is wide in many cases. Useful for understanding how a service is used or how people behave in a public setting, and needs an eye trained for objective observation.',
              },
            },
          ],
        },
        {
          type: 'text',
          content: {
            ar: 'المنهجيات الأكثر موثوقية تُثلَّث: تستخدم أكثر من أداة على المجموعة نفسها وتتحقّق من أن إجابات الاستبيان تتّسق مع ما قاله الناس في المقابلات. حين تتعارض النتائج تكون المفاجأة مفيدة أكثر من التطابق — فالتعارض يدلّ على أن سؤالاً صحيحاً لم يُطرح بعد. في الموارد المحدودة التي تعمل فيها معظم الفرق التطوّعية، لا حاجة إلى الكمال: مقابلتان أو ثلاث مقابلات فردية مع مجموعة نقاش واحدة أفضل بكثير من الاكتفاء بانطباع الفريق وحده.',
            en: 'The most reliable methodologies triangulate: they use more than one tool on the same group and check whether survey answers are consistent with what people said in interviews. When results conflict, the surprise is more useful than agreement — conflict signals that the right question has not been asked yet. With the limited resources most volunteer teams have, perfection is not needed: two or three individual interviews with one focus group is far better than relying only on the team\'s impression.',
          },
        },
        {
          type: 'quiz',
          id: 'cn-q2',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'تريد معرفة لماذا تتوقّف نساء كثيرات عن حضور جلسات تدريبية بعد الأسبوعين الأولين. أيّ أداة تبدأ بها؟',
            en: 'You want to know why many women stop attending training sessions after the first two weeks. Which tool do you start with?',
          },
          options: [
            {
              ar: 'استبيان إلكتروني قصير ترسله لكل من سجّلن في الجلسات، يتضمّن سؤالاً متعدّد الخيارات بأرجح أسباب الانقطاع',
              en: 'A short electronic survey sent to everyone who registered for the sessions, with a multiple-choice question listing the likeliest reasons for stopping',
            },
            {
              ar: 'مقابلات فردية مع نساء أتممن الجلسات ومع نساء تركنها في الأسبوعين الأولين',
              en: 'Individual interviews with women who completed the sessions and with women who left in the first two weeks',
            },
            {
              ar: 'ملاحظة حضور الجلسات وتسجيل نسب الغياب أسبوعياً لتحديد الأسبوع الذي يبدأ عنده الانقطاع بدقّة',
              en: 'Observing session attendance and recording absence rates weekly to pinpoint the week at which the drop-off begins',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'السؤال عن «لماذا» يحتاج عمقاً لا توزيعاً. الاستبيان يُعطيك «كم»، والملاحظة تُعطيك «من» غاب لكن لا تُعطيك السبب. المقابلة الفردية هي الأداة الوحيدة التي تتيح للنساء شرح سببهن بكلامهن — وقد يكون السبب شيئاً لم تضعه في خياراتك أصلاً كعدم توافر من يعتني بالأطفال أو موعد لا يناسبهن.',
            en: 'A "why" question needs depth, not distribution. A survey gives you "how many", observation gives you "who" was absent but not the reason. An individual interview is the only tool that allows women to explain their reason in their own words — and the reason may be something you had not listed in your options at all, like no childcare or an inconvenient time.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'cn-m3',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'تصميم الأسئلة وتجنّب التحيّز', en: 'Designing questions and avoiding bias' },
      lede: {
        ar: 'السؤال السيء يُعطيك إجابة — لكنها إجابة على سؤال غيرك طرحه لا على سؤالك أنت.',
        en: 'A poor question gives you an answer — but an answer to someone else\'s question, not your own.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'تصميم الأسئلة مهارة قابلة للتعلّم، وهي ليست مجرّد صياغة مفردات؛ هي تحديد ما تريد فعلاً معرفته ثم اختيار أقصر طريق للوصول إلى تلك المعرفة دون أن تُقحم افتراضاتك في الطريق. أكثر أخطاء تصميم الأسئلة شيوعاً هي الأسئلة التوجيهية، أي تلك التي تُلمّح إلى الإجابة المتوقّعة من خلال صياغتها. «هل تعتقد أن هذا البرنامج المفيد سيساعد أسرتك؟» سؤال توجيهي. «ما رأيك في هذا البرنامج؟» سؤال مفتوح. والفرق في الإجابات هائل.',
            en: 'Designing questions is a learnable skill, and it is not only about choosing words; it is about defining what you actually want to know and then finding the shortest path to that knowledge without inserting your own assumptions along the way. The most common question-design errors are leading questions — those that hint at the expected answer through their phrasing. "Do you think this useful programme will help your family?" is a leading question. "What is your view of this programme?" is an open one. The difference in answers is enormous.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ أسئلة تُعطيك بيانات حقيقية', en: '✔ Questions that give you real data' },
          noTitle: { ar: '✘ أسئلة تُعيد إنتاج افتراضاتك', en: '✘ Questions that reproduce your assumptions' },
          yes: {
            ar: [
              'ما الذي يمنعك من الحضور في بعض الأحيان؟',
              'صِفْ لي آخر مرة استخدمت فيها هذه الخدمة',
              'ما الشيء الذي تودّ تغييره في هذا البرنامج؟',
              'أخبرني عن تجربة واجهتها مع هذه المنظمة',
            ],
            en: [
              'What prevents you from attending sometimes?',
              'Describe the last time you used this service',
              'What one thing would you like to change about this programme?',
              'Tell me about an experience you had with this organisation',
            ],
          },
          no: {
            ar: [
              'هل تعتقد أن البرنامج مفيد؟',
              'ألا تجد أن الجلسات مفيدة جداً؟',
              'هل أنت راضٍ عن الخدمات التي نقدّمها؟',
              'أليس صحيحاً أن الوضع تحسّن منذ أن بدأنا؟',
            ],
            en: [
              'Do you think the programme is useful?',
              'Don\'t you find the sessions very helpful?',
              'Are you satisfied with the services we provide?',
              'Isn\'t it true that things have improved since we started?',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'التحيّز لا يأتي من الصياغة وحدها؛ يأتي أيضاً من الظرف. حين تُجري المقابلة في مقرّ المنظمة، تتلقّى إجابات مختلفة عمّا لو أجريتها في بيت الشخص أو في مكان محايد. حين يكون المقابِل من نفس جنس المُقابَل أو من نفس خلفيته، يتكلّم الناس بصراحة أكبر في بعض المواضيع. وحين تُجري المقابلة بحضور شخص آخر — زوج، رئيس، معلّم — تتغيّر الإجابات لأن الناس لا يُجيبون الباحث بل يُجيبون بحضور الشاهد. واجب الفريق هو التصميم الواعي لظروف الجمع قبل الجمع نفسه، ليس بعده.',
            en: 'Bias does not come from phrasing alone; it also comes from circumstance. When you conduct an interview at the organisation\'s offices, you receive different answers than if you had it in the person\'s home or a neutral location. When the interviewer shares the gender or background of the interviewee, people speak more openly on some topics. And when you conduct the interview in the presence of another person — a spouse, a supervisor, a teacher — the answers change because people are not answering the researcher but answering in front of a witness. The team\'s duty is to design the collection circumstances consciously before the collection, not after.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'الصمت معلومة', en: 'Silence is data' },
          content: {
            ar: 'حين يتردّد شخص قبل الإجابة، أو يُغيّر موضوع الحديث، أو يقول «الأمور جيدة» بسرعة مفرطة — هذا معلومة بقدر ما هي المعلومة الصريحة. المقابل الجيد يُلاحظ ما لا يُقال ويُدوّنه، ويسأل بعدها سؤالاً غير مباشر يفتح المجال للتفصيل.',
            en: 'When someone hesitates before answering, changes the subject, or says "things are fine" with unusual speed — that is data, just as much as a direct statement. A good interviewer notes what is not said and records it, then follows with an indirect question that opens the door to more.',
          },
        },
        {
          type: 'quiz',
          id: 'cn-q3',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'مقابلت أماً وطفلها في نفس الوقت وفي نفس المكان لتعرف رأيها في البرنامج. ما المشكلة المحتملة؟',
            en: 'You interviewed a mother and her child at the same time in the same place to learn her view of the programme. What is the potential problem?',
          },
          options: [
            {
              ar: 'لا مشكلة — الأم أكثر راحةً بوجود طفلها، وهو يذكّرها بتفاصيل عن البرنامج قد تنساها وحدها',
              en: 'No problem — the mother is more comfortable with her child present, and he reminds her of details she may forget',
            },
            {
              ar: 'الأم قد لا تُفصح عن مشاكل تخصّ طفلها بحضوره، وقد تُؤثّر إجاباتها على إجاباته هو',
              en: 'The mother may not disclose issues about her child in his presence, and her answers may influence his',
            },
            {
              ar: 'الوقت سيتضاعف لأن كليهما سيتكلّمان، وستحتاج موعداً ثانياً لإكمال ما لم يُقَل في الجلسة',
              en: 'The session will take twice as long because both will speak, and you will need a second appointment to finish',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'حضور طرف ثالث في المقابلة — حتى لو كان أحد أفراد الأسرة — يُغيّر ما يقوله الناس. الأم قد تتجنّب ذكر صعوبات في علاقتها بطفلها بحضوره، والطفل سيتكيّف إجاباته تلقائياً مع ما سمعه من أمه. المقابلات الفردية تعني فردية حقيقية — شخص واحد مع مقابِل واحد في مكان يتيح الصراحة.',
            en: 'The presence of a third party in an interview — even a family member — changes what people say. The mother may avoid mentioning difficulties in her relationship with her child in his presence, and the child will automatically adapt his answers to what he heard from his mother. Individual interviews mean genuinely individual — one person with one interviewer in a setting that allows honesty.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'cn-m4',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'اختيار المشاركين بعدالة', en: 'Selecting participants fairly' },
      lede: {
        ar: 'من تختار لتتحدّث معه يُقرّر في نهاية المطاف من تعمل لأجله. الوصول الأسهل ليس الوصول الأعدل.',
        en: 'Who you choose to speak with ultimately decides who you are working for. The easiest access is not the fairest access.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'في كل تقييم احتياجات، يواجه الفريق سؤالاً عملياً: مع من نتحدّث؟ والإجابة السهلة — ومن ثمّ الخطرة — هي أن تتحدّث مع من هم متاحون بسهولة، أو من ترحّب بك أسرهم، أو من هم مرئيّون اجتماعياً ومعتادون على الاجتماعات. هذا الخيار يُنتج تقييماً يعكس احتياجات الفئة الأسهل وصولاً، وهي في الغالب الأقلّ هشاشةً والأقلّ احتياجاً. ومن يستحقّ المساعدة أكثر يبقى خارج أي تقييم لأنه خارج دائرة المرئيّين.',
            en: 'In every needs assessment, the team faces a practical question: who do we speak to? The easy — and therefore dangerous — answer is to speak with whoever is readily available, whoever welcomes you, whoever is socially visible and accustomed to meetings. This choice produces an assessment reflecting the needs of the most accessible group, which is usually the least vulnerable and the least in need. Those who need help most remain outside every assessment because they are outside the circle of the visible.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الاختيار العادل يبدأ بتعريف واضح للمجتمع المستهدف: من هم جميع من سيتأثّرون بالبرنامج أو يُفترض أن يستفيدوا منه؟ ثم تسأل: هل مشاركونا يمثّلون هذا التعريف أم يمثّلون جزءاً منه فقط؟ من لا نسمعه؟ ولماذا لا نسمعه؟ الإجابة عن «لماذا» مهمة لأن الأسباب مختلفة وإصلاحها مختلف. من لا يُسمع لأنه بعيد جغرافياً يحتاج أن تذهب إليه. من لا يُسمع لأنه يخشى انعكاسات الكلام يحتاج ضمانات سرية. من لا يُسمع لأن لغته مختلفة يحتاج مترجماً. من لا يُسمع لأن اجتماعاتك في أوقات يعمل فيها يحتاج أوقاتاً مختلفة. الغياب ليس دائماً اختياراً — في أغلب الأحيان هو عائق لم يُزَل.',
            en: 'Fair selection begins with a clear definition of the target community: who are all those who will be affected by or are intended to benefit from the programme? Then ask: do our participants represent that definition, or only part of it? Who are we not hearing? And why are we not hearing them? The answer to "why" matters because the reasons differ and so does the fix. Someone not heard because they are geographically distant needs you to go to them. Someone not heard because they fear consequences of speaking needs confidentiality guarantees. Someone not heard because they speak a different language needs an interpreter. Someone not heard because your meetings are at times when they work needs different times. Absence is not always a choice — usually it is a barrier that has not been removed.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'حدّد مسبقاً معايير الاستفادة من البرنامج وأعلنها بلغة واضحة قبل بدء العمل وفي مكان يراه الجميع',
              'ابحث عن الغائبين بنشاط: تحدّث مع معلّمين وأطباء وجيران عمّن لا يعرفون بوجود البرنامج أصلاً',
              'نوّع أوقات ومواقع جلسات الجمع لتصل إلى من لا يستطيع الحضور في وقت واحد ومكان واحد',
              'تحقّق من تمثيل النساء والشباب وكبار السن والأشخاص ذوي الإعاقة والأقليات كلٌّ على حدة',
              'حين تصطدم بعائق وصول، وثّقه ولا تتجاهله، وابحث عن شريك مجتمعي يستطيع سدّ الفجوة',
              'بعد انتهاء جمع البيانات، قارن تركيبة مشاركيك بالتعريف الأولي وافهم الفجوات قبل إعداد التقرير',
            ],
            en: [
              'Define eligibility criteria beforehand and publish them in plain language before work begins, in a visible place',
              'Actively seek out the absent: speak with teachers, doctors, and neighbours about those who do not know the programme exists',
              'Vary the times and locations of collection sessions to reach those who cannot come to one time and one place',
              'Check the representation of women, young people, older adults, people with disabilities, and minorities separately',
              'When you hit an access barrier, document it and do not overlook it; find a community partner who can bridge the gap',
              'After data collection, compare the composition of your participants against the original definition and understand the gaps before preparing the report',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'cn-q4',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: {
            ar: 'أجرى فريق تقييماً في حيّ وتحدّث مع عشرين أسرة، جاء معظمهم عبر ترشيح عمدة الحيّ. لاحقاً اكتشفوا أن المشاركين كلهم من فئة عمرية واحدة ومن جنس واحد. ما المشكلة الجوهرية؟',
            en: 'A team conducted an assessment in a neighbourhood and spoke with twenty families, most of whom came through the neighbourhood leader\'s referral. Later they found all participants were from the same age group and gender. What is the core problem?',
          },
          options: [
            {
              ar: 'العمدة لم يكن شريكاً مناسباً للعمل معه، وكان على الفريق الوصول إلى الأسر مباشرةً دون أي وسيط مجتمعي',
              en: 'The neighbourhood leader was not a suitable partner to work with, and the team should have reached the families directly without any intermediary',
            },
            {
              ar: 'العيّنة تعكس اختيارات الوسيط لا المجتمع بأسره، وأصوات مجموعات كاملة غائبة عن التقييم',
              en: 'The sample reflects the intermediary\'s choices rather than the whole community, and entire groups\' voices are missing from the assessment',
            },
            {
              ar: 'العدد عشرون أسرة صغير جداً لأي تقييم موثوق، وكان على الفريق مضاعفة العيّنة قبل استخلاص أي نتيجة',
              en: 'Twenty families is too small a number for any reliable assessment, and the team should have doubled the sample before drawing conclusions',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'حين يكون الوسيط المجتمعي هو من يختار المشاركين، تصلك احتياجات من يختارهم هو لا احتياجات المجتمع بأسره. الشباب والنساء من فئات عمرية مختلفة وكثير من الأسر لم يكن لهم صوت لأن قناة الوصول لم تصل إليهم. التقييم العادل يحتاج مراجعة التركيبة الديموغرافية للمشاركين مقارنةً بالمجتمع المستهدف، وهذا يعني البحث النشط عمّن لم يأتِ، لا الاكتفاء بمن جاء.',
            en: 'When a community intermediary selects participants, you receive the needs of those they choose rather than the whole community. Young people, women of different age groups, and many families had no voice because the access channel did not reach them. A fair assessment requires reviewing the demographic composition of participants against the target community — which means actively seeking those who did not come, not only receiving those who did.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'cn-m5',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'فتح قناة الشكاوى والمساءلة', en: 'Opening a complaints channel and accountability' },
      lede: {
        ar: 'من لا يستطيع تقديم شكوى ليس مستفيداً بمعنى الكلمة — هو هدف لبرنامج لا يسأل عن رأيه.',
        en: 'Someone who cannot file a complaint is not a beneficiary in any real sense — they are a target of a programme that does not ask their view.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'المساءلة المجتمعية تبدأ بسؤال بسيط: هل يستطيع شخص يتضرّر من برنامجنا أن يُخبرنا بذلك بطريقة لا تكلّفه شيئاً ولا تعرّضه لأذى؟ الإجابة في معظم البرامج، لو صدقنا مع أنفسنا، هي لا. الشكوى في ثقافات كثيرة تحتاج جرأة اجتماعية لا يملكها الجميع، وتُقدَّم في الغالب لشخص لديه سلطة — وهذان شرطان يجعلان معظم المشاكل الحقيقية مكتومة. الرضا الظاهر في تقييم برنامج لا يملك آليةَ شكاوى آمنة لا يدلّ على الرضا الحقيقي؛ يدلّ على أن الناس تعلّموا أن الكلام لا ينفع.',
            en: 'Community accountability begins with a simple question: can someone harmed by our programme tell us so in a way that costs them nothing and exposes them to no risk? In most programmes, if we are honest with ourselves, the answer is no. Complaining in many cultures requires social courage that not everyone has, and is usually directed at someone in authority — two conditions that keep most real problems suppressed. The apparent satisfaction in an evaluation of a programme without a safe complaints mechanism does not reflect genuine satisfaction; it reflects that people have learned that speaking up does not help.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'آلية الشكاوى الفعّالة لا تنتظر أن يتقدّم الناس إليها؛ بل تذهب إليهم وتُخبرهم عنها وتُسهّل استخدامها وتُثبت بعمل مرئيّ أنها مفيدة. والجزء الأخير هو الأصعب: الناس يستخدمون قنوات الشكوى حين يرون أن شكاوى سابقة غيّرت شيئاً فعلاً، ويتوقّفون عنها حين يرون أنها تختفي في هواء مجهول. بناء الثقة يبدأ من الحالة الأولى: الشكوى الأولى التي تتلقّاها، كيف تردّ عليها وكم تستغرق في الردّ وهل يصل الردّ لصاحبها — هذه ستُقرّر هل سيشتكي أحد مرةً ثانية.',
            en: 'An effective complaints mechanism does not wait for people to come to it; it goes to them, tells them about it, makes it easy to use, and proves through visible action that it works. That last part is the hardest: people use complaints channels when they see that previous complaints actually changed something, and stop when they see them disappear into unknown air. Building trust starts with the first case: the first complaint you receive, how you respond to it, how long you take to respond, and whether the response reaches the person — this will decide whether anyone complains a second time.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'قرّر القنوات المتاحة: صندوق ورقي، رقم هاتف مخصّص، واتساب، بريد إلكتروني، ومقابلة شفهية مع شخص محدّد — ولا بدّ من خيار لمن لا يقرأ ولا يكتب',
              'أعلن عن القناة بصوت مسموع في بداية كل نشاط، وعلى لافتات في مكان مرئيّ، بلغة بسيطة تشرح كيف تعمل',
              'عيّن شخصاً مسؤولاً باسمه يستقبل الشكاوى ويحتفظ بسجلّ مكتوب بها وبمواعيد استلامها',
              'حدّد مدّة الردّ القصوى واكتبها في المكان العام — خمسة أيام عمل حدّ معقول لأغلب الشكاوى — وأبلغ صاحب الشكوى بالمدّة حين يقدّمها',
              'ردّ على كل شكوى حتى تلك التي لا تستطيع حلّها: «وصلتنا، لكنها خارج صلاحياتنا، وقد حوّلناها إلى الجهة المختصة» ردٌّ كامل',
              'راجع الشكاوى كل شهر مجتمعةً لترى إن كان ثمّة نمط متكرّر يدلّ على مشكلة هيكلية لا حالة فردية',
            ],
            en: [
              'Decide which channels are available: a paper box, a dedicated phone number, WhatsApp, email, and a face-to-face option with a named person — there must be an option for those who cannot read or write',
              'Announce the channel out loud at the start of every activity, on visible signs in plain language that explains how it works',
              'Appoint a named responsible person who receives complaints and keeps a written record of them and the dates received',
              'Set a maximum response time and write it in the public space — five working days is reasonable for most complaints — and tell the person who filed the complaint how long to expect',
              'Reply to every complaint, including those you cannot resolve: "We received this, but it is outside our authority, and we have referred it to [party]" is a complete reply',
              'Review complaints monthly as a group to see whether a recurring pattern points to a structural problem rather than an individual case',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'قلّة الشكاوى ليست نجاحاً', en: 'Few complaints is not success' },
          content: {
            ar: 'برنامج يتلقّى شكوى واحدة في ثلاثة أشهر لا يعني أنه برنامج بلا مشاكل؛ يعني في الغالب أن الناس لا يثقون بالآلية أو لا يعرفون عنها. المنظمات الناضجة تقلق حين تنخفض الشكاوى فجأة، لأنها تعرف أن المشاكل لا تختفي — تتحوّل إلى صمت.',
            en: 'A programme that receives one complaint in three months does not mean a programme without problems; it usually means people do not trust the mechanism or do not know about it. Mature organisations worry when complaints suddenly drop, because they know problems do not disappear — they turn into silence.',
          },
        },
        {
          type: 'quiz',
          id: 'cn-q5',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'بعد شهرين من تطبيق برنامج جديد لم يصل فريقك سوى شكوى واحدة. كيف تفسّر هذا؟',
            en: 'Two months into a new programme, your team has received only one complaint. How do you interpret this?',
          },
          options: [
            {
              ar: 'البرنامج يسير بشكل ممتاز والمشاركون راضون عنه بصورة واسعة، ويمكن تسجيل الشكوى الوحيدة كحالة فردية',
              en: 'The programme is running excellently and participants are widely satisfied, so the single complaint can be recorded as an isolated case',
            },
            {
              ar: 'على الأرجح آلية الشكاوى غير مُعلنة كفاية أو غير آمنة أو لم تُثبت جدواها بعد — وهذا يستدعي مراجعة',
              en: 'Most likely the complaints mechanism is not sufficiently publicised, not safe, or has not yet demonstrated its usefulness — which calls for a review',
            },
            {
              ar: 'المشاركون مهذّبون ويتجنّبون الشكوى بطبيعتهم الثقافية، فقلّة الشكاوى متوقّعة هنا ولا ينبغي قراءتها كمؤشّر على خلل',
              en: 'Participants are polite and avoid complaining by cultural nature, so a low number of complaints is expected here and should not be read as a sign of any fault',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'قلّة الشكاوى في برنامج بشري تُعدّ في الغالب علامة تحذيرية لا علامة نجاح. الناس يشتكون حين يشعرون بالأمان وحين يعتقدون أن الشكوى ستُغيّر شيئاً. شكوى واحدة في شهرين تعني أن الآلية مجهولة أو غير موثوقة، وأن الأشياء التي لا تسمعها لا تعمل في صالح البرنامج — بل تعمل في صالح مشاكل ستكبر في الصمت.',
            en: 'Few complaints in a community programme is usually a warning sign, not a success sign. People complain when they feel safe and when they believe a complaint will change something. One complaint in two months means the mechanism is unknown or untrustworthy, and the things you are not hearing are not working in the programme\'s favour — they are working in favour of problems that will grow in silence.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 6
    {
      id: 'cn-m6',
      tag: { ar: 'الوحدة السادسة', en: 'Module 6' },
      title: { ar: 'إغلاق حلقة الملاحظات', en: 'Closing the feedback loop' },
      lede: {
        ar: 'سماع الشكوى نصف الطريق — إغلاق الحلقة هو ما يُعلّم الناس أن كلامهم يصل وأن الاستماع حقيقي.',
        en: 'Hearing a complaint is half the journey — closing the loop is what teaches people that their voice lands and that the listening is real.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'إغلاق حلقة الملاحظات يعني أن الشخص الذي قدّم شكوى أو ملاحظة يتلقّى ردّاً حقيقياً يُثبت أن ما قاله قُرئ وفُهم وأُخذ قرار بشأنه. هذا الردّ قد يكون «صحّحنا المشكلة التي ذكرتها» أو «لا نستطيع تغيير هذا الأمر لهذه الأسباب» أو «حوّلنا طلبك إلى الجهة المختصة». ما ليس مقبولاً هو الصمت — وما هو أسوأ من الصمت هو «شكراً على ملاحظتك القيّمة» من دون أي فعل، لأن هذا النوع من الردود يُقنع الناس أنهم اكتُفي بتهدئتهم لا بسماعهم.',
            en: 'Closing the feedback loop means that the person who filed a complaint or observation receives a real response proving that what they said was read, understood, and acted upon. This response might be "we corrected the problem you mentioned", or "we cannot change this for these reasons", or "we have referred your request to the relevant party". What is not acceptable is silence — and what is worse than silence is "thank you for your valuable observation" without any action, because that kind of response convinces people they were soothed rather than heard.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'كثير من الفرق تُعطي الأولوية لجمع التغذية الراجعة وتهمل الردّ عليها. هذا النمط يُعلّم المجتمع أن مشاركته مجرّد بيانات تُجمع لأغراض الفريق أو لتقارير المانحين، لا صوت يستحقّ الاعتراف به. والنتيجة المتوقّعة في الجولة القادمة: إحجام أكبر عن المشاركة، وإجابات أقلّ صراحةً، وثقة أقلّ بالمنظمة بأسرها. وبناء الثقة يستغرق شهوراً بينما هدمها يستغرق حالة واحدة تُثبت أن الجهة لا تسمع فعلاً.',
            en: 'Many teams prioritise gathering feedback and neglect responding to it. This pattern teaches the community that its participation is merely data collected for the team\'s purposes or donor reports, not a voice worth acknowledging. The predictable result in the next round: greater reluctance to participate, less frank answers, and less trust in the organisation overall. Building trust takes months while destroying it takes one instance that proves the organisation does not really listen.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'أرسل وصل استلام فور تسجيل الشكوى — لا يلزم أن يكون عندك إجابة فورية، لكن الاستلام يُثبت أنك سمعت',
              'احتفظ بسجلّ مركزي يربط كل شكوى بقرار: تمّ التعامل معه، قيد الدراسة، تمّ التحويل — ولكل حالة تاريخ',
              'الردّ الذي لا يصل صاحبه ردٌّ ناقص: اسأل الشخص عن وسيلة التواصل التي يفضّلها ليس التي تفضّلها أنت',
              'اشرح الأسباب حين لا تستطيع التغيير: «لا» بعلّة صادقة أفضل بكثير من وعد لا يتحقّق',
              'خصّص ربع ساعة شهرياً لمراجعة الشكاوى المغلقة والتحقّق من أن الحلول نُفِّذت فعلاً لا على الورق فقط',
              'في السياقات المجتمعية، الردّ العلني — لافتة تقول «سمعنا شكواكم عن كذا وغيّرنا كذا» — أحياناً أقوى من الردّ الفردي',
            ],
            en: [
              'Send an acknowledgement as soon as the complaint is logged — you do not need an immediate answer, but the receipt proves you heard',
              'Keep a central record linking every complaint to a decision: addressed, under review, referred — with a date for each',
              'A response that does not reach the person is an incomplete response: ask which contact method they prefer, not which you prefer',
              'Explain the reasons when you cannot make a change: an honest "no" with explanation is far better than a promise that does not materialise',
              'Set aside fifteen minutes each month to review closed complaints and verify that solutions were actually implemented, not only recorded',
              'In community settings, a public response — a sign saying "we heard your feedback about X and changed Y" — is sometimes stronger than individual replies',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'الحالة الأولى تُقرّر كل ما يليها', en: 'The first case sets the pattern for all the rest' },
          content: {
            ar: 'الشكوى الأولى التي يتلقّاها فريقك هي الاختبار الحقيقي لآليتك. إن أُغلقت بردّ واضح وسريع وصل لصاحبها، تعلّم المجتمع أن القناة تعمل. وإن اختفت في صمت، تعلّم المجتمع أن القناة ديكور — وهذا الدرس لا يُمحى بسهولة بعد ذلك.',
            en: 'The first complaint your team receives is the real test of your mechanism. If it is closed with a clear, timely response that reaches the person, the community learns that the channel works. If it disappears into silence, the community learns the channel is decorative — and that lesson is not easily unlearned afterwards.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'توثيق نتائج التقييم المجتمعي ومشاركتها مع من شارك فيه شرط أخلاقي وعملي في آن واحد. أخلاقي لأن الناس الذين أعطوا وقتهم وآراءهم يستحقّون أن يعرفوا ماذا فُعل بما قالوه. وعملي لأن الفريق الذي يُعيد النتائج إلى المجتمع يبني جسراً من الثقة يُسهّل كل تقييم لاحق.\n\nالمشكلة الشائعة أن نتائج التقييم تُكتب في تقرير يذهب إلى المانح أو إلى أرشيف المنظمة ولا يرى المجتمع منه شيئاً. وحين يأتي الفريق في العام القادم ليجري تقييماً جديداً يجد الناس أقل استعداداً للمشاركة لأنهم لم يلمسوا نتيجة مشاركتهم السابقة. حلقة التقييم تُغلق حين يقول الفريق للمجتمع: هذا ما سمعناه منكم، وهذا ما اكتشفناه، وهذا ما قرّرنا فعله بناءً على ما قلتموه — ثم يُتحقَّق من صحّة هذا الفهم بسؤال إضافي: «هل فهمنا احتياجاتكم بالشكل الصحيح؟»\n\nالصياغة التي تُعيد النتائج للمجتمع لا تحتاج تقنية معقّدة: لافتة في مكان مرئيّ، اجتماع مفتوح يُلخَّص فيه ما جُمع، أو رسالة مكتوبة باللغة التي يفهمها الناس لا بلغة التقارير المهنية. ما يهمّ هو أن يرى الناس أن صوتهم وصل وأن ثمّة قراراً بُني عليه. وعند تقديم النتائج يجب أن تُمسَك التوقّعات بوضوح: لا ضرورة لوعد بتنفيذ كل ما قاله الناس، بل وعد بالصدق في شرح ما يمكن فعله وما لا يمكن. «سمعنا أن الحاجة الأكبر هي مركز رعاية نهارية، لكن ميزانيتنا لا تتيح ذلك هذا العام» صدق أفضل من وعد يتعذّر الوفاء به. إغلاق حلقة التقييم بهذه الطريقة يُحوّل عملية جمع البيانات من أداة تقنية إلى علاقة مجتمعية تُراكم الثقة عاماً بعد عام.',
            en: 'Documenting community needs assessment findings and sharing them with participants is both an ethical and practical requirement. Ethical because the people who gave their time and opinions deserve to know what was done with what they said. And practical because a team that returns findings to the community builds a bridge of trust that makes every subsequent assessment easier.\n\nThe common problem is that assessment findings are written in a report for the funder or the organisation\'s archive, while the community sees nothing of it. When the team returns the following year for a new assessment, people are less willing to participate because they saw no outcome from their previous participation. The assessment loop closes when the team tells the community: this is what we heard from you, this is what we discovered, and this is what we decided to do based on what you told us — then verifies this understanding by asking: "did we understand your needs correctly?"\n\nReturning findings to the community requires no complex technology: a visible sign, an open meeting summarising what was gathered, or a message in plain language rather than professional report language. What matters is that people see their voice was received and a decision was built on it. When presenting findings, expectations must be managed clearly: there is no need to promise implementing everything people said, but a promise of honesty about what can and cannot be done. "We heard the main need is a day care centre, but our budget does not allow it this year" is honesty better than a promise that cannot be kept. Closing the assessment loop this way transforms data collection from a technical tool into a community relationship that accumulates trust year after year.',
          },
        },
        {
          type: 'quiz',
          id: 'cn-q6',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: {
            ar: 'قدّمت إحدى المشاركات شكوى شفهية لأحد أعضاء الفريق في ممرّ المركز منذ ثلاثة أسابيع. لم تتلقَّ أي ردّ حتى الآن. ما الجذر الحقيقي للمشكلة؟',
            en: 'A participant made a verbal complaint to a team member in the centre corridor three weeks ago. She has received no reply. What is the real root of the problem?',
          },
          options: [
            {
              ar: 'عضو الفريق نسي ولم يكن ملتزماً بما يكفي، ويكفي تذكير الفريق كلّه بمسؤولية المتابعة في الاجتماع القادم لمنع تكرار ذلك',
              en: 'The team member forgot and was not committed enough, and reminding the whole team of its follow-up responsibility at the next meeting will stop it recurring',
            },
            {
              ar: 'الشكوى الشفهية لا تلزم الفريق بالردّ الرسمي، فمهلة الردّ لا تبدأ إلا بشكوى تُقدَّم عبر القناة المعلَنة',
              en: 'A verbal complaint does not oblige the team to a formal reply, since the response clock starts only with a complaint filed through the announced channel',
            },
            {
              ar: 'لا يوجد بروتوكول يُحوّل الشكاوى الشفهية إلى سجلّ مكتوب بمسؤول ومهلة — فالمشكلة هيكلية لا فردية',
              en: 'There is no protocol converting verbal complaints into a written record with a named owner and deadline — the problem is structural, not individual',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الشكوى الشفهية التي لا تُسجَّل هي شكوى لم تصل بمعنى الكلمة. عضو الفريق لم يُخطئ بالضرورة؛ المشكلة أن لا يوجد نظام يحوّل ما يُقال في الممرّات إلى إجراء مكتوب. وغياب النظام يعني أن الشكاوى ستضيع بانتظام، وليس هذه المرة فقط. الحلّ ليس تذكير الفريق بالالتزام — هو إنشاء بروتوكول واضح: أي شكوى شفهية تُسجَّل في نفس اليوم باسم المشتكي وموضوع الشكوى وتُسنَد لمسؤول.',
            en: 'A verbal complaint that is not logged has not arrived in any real sense. The team member did not necessarily make a mistake; the problem is that no system converts what is said in corridors into a written action. The absence of a system means complaints will routinely be lost, not only this time. The fix is not reminding the team to be more committed — it is creating a clear protocol: any verbal complaint is logged the same day with the complainant\'s name, the subject, and assigned to a responsible person.',
          },
        },
      ],
    },
  ],
};
