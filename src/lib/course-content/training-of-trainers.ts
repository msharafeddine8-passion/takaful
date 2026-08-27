import type { CourseContent } from './types';

/**
 * Level 6 — Training of Trainers and Knowledge Management. Pass mark 70.
 *
 * This course addresses a specific trap that volunteer organisations fall into:
 * the person who knows how things really work eventually leaves, and so does
 * everything they know. The result is not just lost expertise — it is a
 * perpetual cycle of relearning the same painful lessons.
 *
 * The three threads that run through it are: how adults actually learn (so
 * the design follows the learner, not the content), how to write an objective
 * that tells you whether you succeeded, and how to document experience in a
 * form that a future volunteer can actually use. These three things together
 * are what makes a training function rather than just an event.
 */

export const trainingOfTrainers: CourseContent = {
  slug: 'training-of-trainers',
  level: 6,
  minutes: 45,
  passMark: 70,
  title: {
    ar: 'تدريب المدرّبين وإدارة المعرفة',
    en: 'Training of Trainers and Knowledge Management',
  },
  lede: {
    ar: 'كيف يتعلّم الكبار، وكيف تصمّم جلسة لها هدف قابل للقياس، وكيف تنقل خبرة الجمعية بحيث لا تخرج مع من يخرج.',
    en: 'How adults learn, how to design a session with a measurable objective, and how to move an organisation\'s experience so it does not leave with whoever leaves.',
  },
  outcomes: {
    ar: [
      'تحدّد احتياجاً تدريبياً وتكتب أهدافاً تعليمية قابلة للقياس',
      'تصمّم جلسة بأنشطة تناسب تعلّم الكبار وتديرها في وقتها',
      'تُقيّم التعلّم لا الرضا فقط، وتقدّم ملاحظات مفيدة',
      'توثّق الخبرة وتبني مكتبة موارد تُستخدم فعلاً',
    ],
    en: [
      'Identify a training need and write measurable learning objectives',
      'Design a session with activities suited to adult learning and run it to time',
      'Evaluate learning rather than only satisfaction, and give useful feedback',
      'Document experience and build a resource library people actually use',
    ],
  },
  sources: [
    'UNESCO Institute for Lifelong Learning — Adult Learning and Education (2022)',
    'IFRC — Volunteer Learning and Development Framework and Trainer\'s Toolkit',
    'Kirkpatrick Partners — The Four Levels of Training Evaluation',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'tot-m1',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'كيف يتعلّم الكبار', en: 'How Adults Learn' },
      lede: {
        ar: 'الكبار لا يتعلّمون لأنك تريد أن تعلّمهم، بل لأنهم يريدون هم أن يتعلّموا ويرون فائدة ما يتعلّمونه.',
        en: 'Adults do not learn because you want to teach them, but because they want to learn and can see the use of what they are learning.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين تُصمَّم جلسة تدريبية كما لو كان المشاركون طلاباً في مدرسة — المدرّب يشرح والجميع يستمع — تضيع معظم الفرصة. الكبار يحملون معهم إلى أي جلسة خبرات حقيقية، وتساؤلات نابعة من مواقف لم يجدوا لها إجابة، وحكماً مسبقة تحتاج إلى ما يُقنعهم بتغييرها، وضيقاً صادقاً من الوقت المهدور. التعلّم الذي يصل إلى الكبار هو الذي يبدأ مما يعرفونه بالفعل، ويربط كل مفهوم جديد بمشكلة يعيشونها أو بموقف يتعاملون معه كل يوم، ويجعلهم يفعلون شيئاً حقيقياً لا يسمعون فقط. وهذا ليس مجرّد نظرية تربوية: أي مدرّب جرّب ورشة تشاركية ثم جرّب محاضرة بالمحتوى نفسه سيخبرك أيّهما يغادر معه المشاركون شيئاً يستخدمونه في اليوم التالي. والإجابة دائماً الورشة، لأن الكبير يتعلّم بالتجربة لا بالتلقّي.',
            en: 'When a training session is designed as if participants were school pupils — the trainer explains and everyone listens — most of the opportunity is lost. Adults bring to any session real experience, questions that grew from situations they had no answer to, pre-existing judgements that need something to persuade them to change, and genuine impatience with wasted time. Learning that reaches adults starts from what they already know, connects every new concept to a problem they live with or a situation they handle every day, and makes them do something real rather than simply listen. This is not merely pedagogical theory: any trainer who has tried a participatory workshop and then delivered the same content as a lecture will tell you which one participants leave with something they use the next day. The answer is always the workshop, because adults learn by doing, not by receiving.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'الكبار يتعلّمون أفضل حين يفهمون لماذا يتعلّمون هذا الشيء بالذات في هذا التوقيت بالذات',
              'الخبرة السابقة نقطة انطلاق لا عائق: ابنِ عليها ولا تتجاهلها ولا تتعامل معها كأنها مشكلة',
              'الكبار يتحمّلون مسؤولية تعلّمهم حين يُعطَون مساحة حقيقية للمشاركة في القرار',
              'الدافع الداخلي أقوى من الخارجي: الشهادة تُحضر الشخص إلى القاعة، والفائدة الفعلية تُبقيه منتبهاً',
              'التعلّم يثبّت حين يُطبَّق فوراً في السياق الحقيقي، ويتلاشى حين يُؤجَّل',
              'المشاركون مصدر تعلّم لبعضهم لا مجرّد متلقّين من المدرّب — الغرفة مليئة بالخبرة قبل أن يقول المدرّب كلمة',
            ],
            en: [
              'Adults learn best when they understand why they are learning this particular thing at this particular moment',
              'Prior experience is a starting point, not an obstacle: build on it, do not ignore it or treat it as a problem',
              'Adults take genuine ownership of their learning when given real space to participate in the decision',
              'Intrinsic motivation outweighs extrinsic: a certificate brings the person to the room, real usefulness keeps them attentive',
              'Learning sticks when applied immediately in the real context, and fades when postponed',
              'Participants are a source of learning for each other, not just receivers from the trainer — the room is full of experience before the trainer says a word',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'المعرفة وحدها لا تُغيّر السلوك', en: 'Knowledge alone does not change behaviour' },
          content: {
            ar: 'أكثر ما تُخطئه التدريبات هو الاعتقاد بأن إعطاء المعلومة يكفي. الناس يعرفون أن التدخين ضارّ ومع ذلك يدخّنون. الناس يعرفون أن توثيق الزيارات مهمّ ولا يوثّقون. الفجوة بين المعرفة والتصرّف تُغلق بالتدرّب على المهارة في سياق واقعي، والتغذية الراجعة الفورية، وإتاحة فرصة تكرار التطبيق. جلسة تدريبية تعطي معلومة ولا تتيح ممارستها قد تكون أسوأ من لا شيء، لأنها توحي أن المشاركين قد «تدرّبوا» وتكتفي بذلك.',
            en: 'The most common training mistake is believing that giving information is enough. People know smoking is harmful and still smoke. People know documenting visits matters and do not document them. The gap between knowledge and action is closed by practising the skill in a realistic context, receiving immediate feedback, and getting the chance to repeat the application. A session that gives information but offers no chance to practise may be worse than nothing, because it suggests participants have been "trained" and leaves it there.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'من أكثر المفاهيم التي تُحدث فرقاً عملياً هو مفهوم «الاستعداد للتعلّم»: الكبير لا يتعلّم أي شيء في أي وقت — بل يتعلّم حين يواجه مشكلة تجعل المحتوى ذا معنى. متطوّع يُعطى تدريباً على إدارة الخلافات قبل أن يعمل في فريق لا يحتاجه بالطريقة نفسها التي يحتاجه حين وقعت له خلافة فعلية مع زميل. هذا لا يعني أن كل تدريب يجب أن يسبقه أزمة، لكنه يعني أن مهمّة المدرّب أن يبدأ بخلق الحاجة: بسؤال يجعل المشارك يشعر بالفجوة، أو سيناريو يُظهر له ما لا يستطيع فعله بعد، أو مشكلة يريد حلّها. الفجوة هي المحرّك، والمحتوى هو الجسر.',
            en: 'One of the most practically significant concepts is "readiness to learn": an adult does not learn anything at any time — they learn when they face a problem that makes the content meaningful. A volunteer given conflict management training before working in a team does not need it in the same way as after an actual disagreement with a colleague. This does not mean every training must be preceded by a crisis, but it means the trainer\'s job is to start by creating the need: a question that makes the participant feel the gap, a scenario that shows them what they cannot yet do, or a problem they want to solve. The gap is the engine; the content is the bridge.',
          },
        },
        {
          type: 'quiz',
          id: 'tot-q1',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أيّ من المبادئ التالية يصف بشكل أدقّ كيف يتعلّم الكبار؟',
            en: 'Which of the following most accurately describes how adults learn?',
          },
          options: [
            { ar: 'يتعلّمون أفضل حين يتلقّون معلومات منظّمة من خبير يشرح بالتفصيل ويُجيب عن الأسئلة في نهاية العرض', en: 'They learn best when they receive organised information from an expert who explains in detail and answers questions at the end of the presentation' },
            { ar: 'يتعلّمون أفضل حين يربطون المحتوى بتجاربهم ويُطبّقونه مباشرة في سياق حقيقي', en: 'They learn best when they connect content to their own experience and apply it immediately in a real context' },
            { ar: 'التعلّم عند الكبار لا يختلف عن التعلّم عند الأطفال في شيء جوهري', en: 'Learning in adults is no different from learning in children in any fundamental way' },
            { ar: 'الدافع الخارجي كالشهادة كافٍ وحده لضمان التعلّم الفعلي والمستدام', en: 'External motivation like a certificate alone is sufficient to ensure genuine and lasting learning' },
          ],
          correct: 1,
          feedback: {
            ar: 'الكبار يجلبون خبراتهم إلى الجلسة ويتعلّمون أفضل حين يُبنى على ما يعرفون ويُتاح لهم تطبيق الجديد فوراً. المحاضرة وحدها تعطي معلومة لكنها لا تغلق الفجوة بين المعرفة والتصرّف. والدافع الخارجي يُحضر الشخص لكن لا يضمن التعلّم الحقيقي.',
            en: 'Adults bring their experience to the session and learn best when it builds on what they know and allows immediate application. A lecture alone gives information but does not close the gap between knowledge and behaviour. External motivation brings the person in but does not guarantee genuine learning.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'tot-m2',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'تحديد الاحتياج التدريبي', en: 'Identifying the Training Need' },
      lede: {
        ar: 'التدريب الذي يُقدَّم قبل تحديد المشكلة الحقيقية قد يحلّ المشكلة الخاطئة بشكل ممتاز.',
        en: 'Training delivered before the real problem is identified may solve the wrong problem excellently.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'ليس كل مشكلة أداء مشكلة تدريبية. حين يخطئ متطوّع في ملء استمارة زيارة ميدانية، قد يكون السبب أنه لم يُدرَّب على ذلك — أو أن الاستمارة غير واضحة في تصميمها، أو أنه لا يملك الوقت الكافي لاستكمالها، أو أن أحداً لم يُخبره أن إكمالها يُشكّل فرقاً حقيقياً في عمل الفريق. إعطاؤه تدريباً في الحالة الثانية والثالثة والرابعة يضيّع وقته ووقتك ويُحبطه، لأن المشكلة الحقيقية لم تُعالَج. تحليل الاحتياج التدريبي يبدأ بسؤال بسيط: هل المشكلة أن الشخص لا يستطيع، أم لا يريد، أم لا يجد الظروف التي تمكّنه؟ التدريب يعالج «لا يستطيع» فقط، وحتى حينها يجب التأكّد من أن التدريب هو الحلّ الأنسب لا مجرّد الأسهل تنفيذاً. التمييز بين هذه الأنواع الثلاثة يوفّر ساعات من التدريب وطاقة من المشاركين.',
            en: 'Not every performance problem is a training problem. When a volunteer makes a mistake filling in a field visit form, the reason might be that they were not trained — or that the form is unclear in its design, or that they do not have enough time to complete it, or that nobody told them it makes a real difference to the team\'s work. Giving them training in the second, third and fourth cases wastes their time and yours and frustrates them, because the real problem was not addressed. Training needs analysis starts with a simple question: is the problem that the person cannot, will not, or does not have the conditions to? Training addresses only "cannot", and even then you must check that training is the most appropriate solution and not just the easiest to arrange. Distinguishing between these three types saves hours of training and the participants\' energy.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'حدّد الفجوة بدقة: ما الذي يحدث الآن وما الذي يجب أن يحدث بدلاً منه؟',
              'اسأل من يعيش المشكلة مباشرة: ماذا يعتقد هو أن سببها وأين يشعر بالصعوبة؟',
              'تحقّق من السياق: هل فعل الشخص هذا بنجاح في ظروف مختلفة؟ إن كانت الإجابة نعم، المشكلة على الأرجح ليست تدريبية',
              'أسقط الحلول غير التدريبية أولاً: هل يمكن توضيح الإجراء، تبسيط النموذج، توفير الأداة، أو إزالة العائق؟',
              'إن بقيت الفجوة بعد إسقاط كل ما هو غير تدريبي، حدّد بدقة المهارة أو المعرفة التي تسدّها',
              'اكتب الاحتياج بجملة واحدة: «يحتاج [من] أن يتعلّم [ماذا] لأنه الآن يفعل [كذا] بدلاً من [كذا]»',
            ],
            en: [
              'Define the gap precisely: what is happening now and what should happen instead?',
              'Ask the person living the problem directly: what do they think is causing it and where do they feel the difficulty?',
              'Check the context: has the person done this successfully before in different conditions? If yes, the problem is probably not a training one',
              'Rule out non-training solutions first: can you clarify the procedure, simplify the form, provide the tool, or remove the barrier?',
              'If a gap remains after ruling out all non-training causes, name precisely the skill or knowledge that would close it',
              'Write the need as one sentence: "[who] needs to learn [what] because they currently [do this] instead of [this]"',
            ],
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'مشكلة تدريبية', en: 'A training problem' },
              text: {
                ar: 'المتطوّع لم يتعلّم كيف يُجري مقابلة دعم نفسي اجتماعي وفق بروتوكول الجمعية. الفجوة في المهارة وتُسدّها ممارسة مُوجَّهة.',
                en: 'The volunteer has not learned how to conduct a psychosocial support interview using the association\'s protocol. The gap is in the skill and is closed by guided practice.',
              },
            },
            {
              title: { ar: 'مشكلة بيئية', en: 'An environmental problem' },
              text: {
                ar: 'المتطوّع يعرف البروتوكول لكن الغرفة المتاحة لا تتيح الخصوصية اللازمة. التدريب لن يُصلح هذا — يُصلحه تغيير المكان.',
                en: 'The volunteer knows the protocol but the available room does not allow the necessary privacy. Training will not fix this — changing the space will.',
              },
            },
            {
              title: { ar: 'مشكلة دوافع', en: 'A motivation problem' },
              text: {
                ar: 'المتطوّع يعرف ويستطيع لكنه لا يرى قيمة في توثيق الجلسات لأحداً استخدم هذا التوثيق من قبل. احتياجه حوار صريح لا دورة تدريبية.',
                en: 'The volunteer knows and is capable but sees no value in documenting sessions because nobody has ever used that documentation. What they need is an honest conversation, not a course.',
              },
            },
          ],
        },
        {
          type: 'quiz',
          id: 'tot-q2',
          label: { ar: 'قرارك', en: 'Your call' },
          question: {
            ar: 'مديرة البرامج تطلب منك تدريباً على مهارات التواصل لأن تقارير المتطوّعين «ضعيفة». أيّ خطوة تأتي أولاً؟',
            en: 'The programmes manager asks you for a communication skills training because volunteer reports are "weak". Which step comes first?',
          },
          options: [
            { ar: 'تُعدّ تدريباً على مهارات الكتابة الواضحة وتبدأ تطبيقه فوراً', en: 'Prepare a clear writing skills session and start delivering it immediately' },
            { ar: 'تطلب أمثلة على تقارير ضعيفة وتسأل المتطوّعين عن تجربتهم لتفهم أين الفجوة فعلاً', en: 'Ask for examples of weak reports and ask the volunteers about their experience to understand where the gap actually is' },
            { ar: 'تُرسل استبياناً لقياس رضا المتطوّعين عن التدريب السابق الذي أُجري قبل ستة أشهر وتنتظر النتائج قبل أيّ قرار', en: 'Send a survey measuring volunteer satisfaction with the previous training conducted six months ago and wait for the results before any decision' },
            { ar: 'تُقرّر أن المشكلة في القالب وتطلب نموذجاً جديداً للتقارير', en: 'Decide the problem is the template and request a new report form' },
          ],
          correct: 1,
          feedback: {
            ar: 'وصف «التقارير ضعيفة» ملاحظة لا احتياجاً تدريبياً. قد تكون المشكلة في مهارة الكتابة، أو في غموض ما يُطلب، أو في قالب سيئ، أو في أن المتطوّع لا يعرف ما الذي تبحث عنه المنسّقة. الخطوة الأولى دائماً فهم الفجوة بدقة قبل اختيار الحلّ — وإلا خاطرت بحلّ المشكلة الخاطئة.',
            en: 'The description "weak reports" is an observation, not a training need. The problem might be writing skill, unclear expectations, a poor template, or the volunteer not knowing what the coordinator is looking for. The first step is always to understand the gap precisely before choosing the solution — otherwise you risk solving the wrong problem.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'tot-m3',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'كتابة الأهداف التعليمية القابلة للقياس', en: 'Writing Measurable Learning Objectives' },
      lede: {
        ar: 'هدف لا يمكن قياسه لا يمكن تحقيقه، ولا يمكن معرفة ما إذا كان قد تحقّق أصلاً.',
        en: 'An objective that cannot be measured cannot be achieved, and you cannot know whether it was ever achieved.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الفرق بين «يفهم المشارك أهمية التوثيق» و«يملأ المشارك نموذج زيارة الحقل بشكل صحيح خلال أربع وعشرين ساعة من انتهاء الزيارة» هو الفرق بين هدف وأمنية. الهدف القابل للقياس يحتوي على ثلاثة عناصر: فعل يمكن ملاحظته من الخارج، وظرف يصف متى أو في أي سياق يُؤدَّى، وأحياناً معيار يحدّد بأيّ مستوى يُعدّ الأداء مقبولاً. هذه الأهداف تُساعدك على ثلاثة أشياء في آنٍ واحد: تختار الأنشطة الصحيحة لأنك تعرف ما الذي تحاول إنتاجه، وتقيس في نهاية الجلسة ما إذا كان المشاركون وصلوا إليه فعلاً، وتُخبر المشاركين من البداية بما ستُعدّهم على فعله — وهذا وحده يرفع التركيز ويخفض القلق. المدرّب الذي لا يعرف بدقة ما الذي يريد أن يخرج به المشاركون يُعدّ تدريباً للتدريب لا تدريباً لهدف.',
            en: 'The difference between "the participant understands the importance of documentation" and "the participant correctly completes the field visit form within twenty-four hours of finishing the visit" is the difference between an objective and a wish. A measurable objective contains three elements: a verb that can be observed from the outside, a condition describing when or in what context it is performed, and sometimes a standard specifying at what level the performance is considered acceptable. These objectives help you with three things at once: you choose the right activities because you know what you are trying to produce; you measure at the end whether participants actually reached it; and you tell participants from the start what you are preparing them to do — which alone increases focus and reduces anxiety. A trainer who does not know precisely what they want participants to leave able to do is preparing training for training\'s sake, not training for a purpose.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'هدف قابل للقياس', en: 'Measurable objective' },
          noTitle: { ar: 'أمنية لا هدف', en: 'A wish, not an objective' },
          yes: {
            ar: [
              'يُجري المشارك مقابلة استماع أوّلية وفق بروتوكول الجمعية في مدّة لا تتجاوز خمس عشرة دقيقة',
              'يكتب المشارك تقرير حادث يحتوي على الوقت والمكان والأطراف والإجراء المتّخذ في يوم وقوعه',
              'يُحدّد المشارك ثلاثة مخاطر محدّدة في مكان النشاط قبل بدء التجهيز',
              'يُقدّم المشارك تغذية راجعة بنّاءة لزميل باستخدام صيغة الملاحظة—الأثر—السؤال',
            ],
            en: [
              'The participant conducts an initial listening interview using the association\'s protocol in no more than fifteen minutes',
              'The participant writes an incident report containing time, place, parties and action taken on the day it occurred',
              'The participant identifies three specific risks in the activity venue before setup begins',
              'The participant gives a colleague constructive feedback using the observation–impact–question format',
            ],
          },
          no: {
            ar: [
              'يُدرك المشارك أهمية الاستماع الفعّال للمستفيدين',
              'يتعلّم المشارك كيفية كتابة التقارير الدقيقة',
              'يُحسّن المشارك وعيه بقضايا السلامة الميدانية',
              'يصبح المشارك قادراً على التعامل مع المواقف الصعبة',
            ],
            en: [
              'The participant appreciates the importance of active listening to beneficiaries',
              'The participant learns how to write accurate reports',
              'The participant improves their awareness of field safety issues',
              'The participant becomes capable of handling difficult situations',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'ليس كل شيء قابلاً للقياس — وهذا لا يعني أنه ليس تعلّماً', en: 'Not everything is measurable — that does not mean it is not learning' },
          content: {
            ar: 'بعض ما نريد أن يحمله المشاركون من جلسة — ثقة أعمق، تعاطف أوسع، نظرة جديدة إلى مهنتهم — لا يُقاس بسهولة بهدف سلوكي. هذا حقيقي ومهمّ ولا ينبغي تجاهله. الحلّ أن يكون لكل جلسة هدف واحد أو اثنان قابلان للقياس الموضوعي وأهداف أخرى تُقيَّم بطرق أقلّ مباشرة كالملاحظة والمحادثة والمتابعة اللاحقة. لكن المدرّب الذي لا يملك أيّ هدف قابل للقياس لا يملك طريقة يعرف بها أن الجلسة حقّقت شيئاً.',
            en: 'Some of what we want participants to carry from a session — deeper confidence, broader empathy, a new perspective on their work — is not easily measured by a behavioural objective. This is true and matters and should not be ignored. The answer is to ensure each session has one or two objectives measurable objectively and others evaluated by less direct means such as observation, conversation and later follow-up. But a trainer with no measurable objective has no way of knowing whether the session achieved anything.',
          },
        },
        {
          type: 'quiz',
          id: 'tot-q3',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أيّ هذه العبارات هدف تعليمي قابل للقياس الموضوعي؟',
            en: 'Which of these is an objectively measurable learning objective?',
          },
          options: [
            { ar: 'يفهم المشارك مبادئ التواصل الفعّال مع المستفيدين في مواقف التوتر والضغط الشديد داخل الميدان', en: 'The participant understands the principles of effective communication with beneficiaries in tense and highly pressured situations in the field' },
            { ar: 'يُدرك المشارك أهمية الحصول على الموافقة المستنيرة قبل جمع أيّ بيانات عن المستفيدين', en: 'The participant appreciates the importance of obtaining informed consent before collecting any data about beneficiaries' },
            { ar: 'يملأ المشارك نموذج الموافقة المستنيرة كاملاً وبشكل صحيح قبل بدء أيّ مقابلة', en: 'The participant fully and correctly completes the informed consent form before beginning any interview' },
            { ar: 'يتعلّم المشارك كيف يحمي بيانات المستفيدين', en: 'The participant learns how to protect beneficiary data' },
          ],
          correct: 2,
          feedback: {
            ar: 'الخيار الثالث وحده يحتوي على فعل قابل للملاحظة المباشرة (يملأ)، ومعيار للجودة (كاملاً وبشكل صحيح)، وظرف يحدّد متى (قبل بدء أي مقابلة). الخيارات الأخرى تصف حالات ذهنية — يفهم، يُدرك، يتعلّم — لا يمكن ملاحظتها من الخارج ولا التحقّق من حدوثها في نهاية الجلسة.',
            en: 'The third option alone contains a directly observable verb (completes), a quality standard (fully and correctly), and a condition specifying when (before beginning any interview). The other options describe mental states — understands, appreciates, learns — that cannot be observed from the outside or verified at the end of the session.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'tot-m4',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'تصميم الجلسة التدريبية وإدارتها', en: 'Designing and Running the Training Session' },
      lede: {
        ar: 'الجلسة الجيّدة تبدأ من النهاية: ما الذي تريد أن يكون المشارك قادراً على فعله حين يخرج؟',
        en: 'A good session starts from the end: what do you want the participant to be able to do when they walk out?',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'تصميم جلسة تبدأ بالمحتوى — «ماذا أشرح اليوم؟» — يوصلك إلى جلسة تُعطي معلومات. تصميم جلسة تبدأ بالهدف — «ما الذي سيستطيع المشاركون فعله في النهاية؟» — يوصلك إلى جلسة تُنتج مهارة. الفرق ليس في النوايا بل في الترتيب. بعد كتابة الهدف، اسأل: «ما الذي يحتاجه المشارك أن يفعله ليؤدّي هذا الهدف؟» — الإجابة تحدّد النشاط المحوري. ثم اسأل: «ماذا يحتاج أن يعرف ليفعل ذلك النشاط؟» — الإجابة تحدّد المحتوى فقط ما يخدم النشاط. والمحتوى الذي لا يخدم النشاط الذي يخدم الهدف لا مكان له في الجلسة مهما بدا مفيداً ومثيراً. هذا القرار صعب حين تحبّ المحتوى، وهو تحديداً القرار الذي يفرّق بين مدرّب ومحاضر.',
            en: 'Designing a session that starts from content — "what do I explain today?" — leads to a session that gives information. Designing one that starts from the objective — "what will participants be able to do at the end?" — leads to a session that produces a skill. The difference is not in intentions but in the order. After writing the objective, ask: "what does the participant need to do in order to perform that objective?" — the answer determines the core activity. Then ask: "what do they need to know to do that activity?" — the answer identifies only the content that serves the activity. And content that does not serve the activity that serves the objective has no place in the session, however useful and interesting it seems. That decision is difficult when you love the content, and it is precisely the decision that separates a trainer from a lecturer.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'الافتتاح — لماذا الآن ولماذا هم', en: 'Opening — why now and why them' },
              text: {
                ar: 'دقيقتان تُخبران المشاركين لماذا هذا الموضوع الآن ولهم تحديداً، وما الذي سيستطيعون فعله بنهاية الجلسة. لا تبدأ بمقدّمة عن المنظمة ولا بشكر على الحضور.',
                en: 'Two minutes telling participants why this topic, why now, why them specifically, and what they will be able to do by the end. Do not open with an introduction to the organisation or thanks for attending.',
              },
            },
            {
              title: { ar: 'تفعيل الخبرة — ما يعرفونه بالفعل', en: 'Activating experience — what they already know' },
              text: {
                ar: 'سؤال أو نشاط قصير يُظهر ما يحمله المشاركون بالفعل ويبني الفضول نحو ما ينقصهم. ما تقوله أنت يُنسى؛ ما يقوله هم يُذكر.',
                en: 'A question or short activity that surfaces what participants already carry and builds curiosity about what they are missing. What you say is forgotten; what they say is remembered.',
              },
            },
            {
              title: { ar: 'النشاط المحوري — يفعلون لا يسمعون', en: 'Core activity — doing not listening' },
              text: {
                ar: 'المشاركون يؤدّون شيئاً مرتبطاً مباشرة بالهدف: تمرين موجَّه، دراسة حالة، تدرّب بالأدوار، أو حلّ مشكلة. وقت المدرّب هنا للتيسير والملاحظة لا للشرح.',
                en: 'Participants do something directly tied to the objective: a guided exercise, case study, role play, or problem-solving. The trainer\'s role here is facilitation and observation, not explanation.',
              },
            },
            {
              title: { ar: 'المناقشة — تحويل التجربة إلى تعلّم', en: 'Discussion — turning experience into learning' },
              text: {
                ar: 'ماذا لاحظتم؟ أين وجدتم صعوبة؟ ما الذي نجح وما الذي تغيّرتم من خلاله؟ هذه المرحلة هي المحرّك الحقيقي للتعلّم.',
                en: 'What did you notice? Where did you find difficulty? What worked and what changed you? This phase is the real engine of learning.',
              },
            },
            {
              title: { ar: 'الختام — جسر إلى الغد', en: 'Close — a bridge to tomorrow' },
              text: {
                ar: 'لا تختم بملخّص لما قيل. اختم بسؤال: ما الشيء الواحد الذي ستفعله بشكل مختلف في أقرب فرصة؟ ثم اسمع الإجابات وسجّلها.',
                en: 'Do not close with a summary of what was said. Close with a question: what is the one thing you will do differently at the next opportunity? Then listen to the answers and record them.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'إدارة الوقت مسؤولية المدرّب لا المشاركين', en: 'Time management is the trainer\'s responsibility, not the participants\'' },
          content: {
            ar: 'حين تمتدّ مناقشة جانبية وتقول «ما دام الموضوع مهمّاً سنكمل»، تُرسل رسالتين في آنٍ واحد: أن الخطة لم تكن مدروسة بعناية، وأن وقت المشاركين ليس ذا قيمة محترمة. وقت الجلسة إطار يُحترم كما يُحترم محتواها. إن كانت مناقشة تحتاج وقتاً أكثر، الحلّ أن تُدار في لقاء منفصل بتوقيت يتّفق عليه الجميع، لا أن تأكل من وقت ما بعدها وتُضغط بقية الجلسة.',
            en: 'When a side discussion overruns and you say "since the topic is important we will continue", you send two messages at once: the plan was not carefully thought through, and the participants\' time is not genuinely valued. The session\'s time frame is respected just as its content is. If a discussion needs more time, the solution is to hold it separately at an agreed time, not to eat into what follows and compress the rest of the session.',
          },
        },
        {
          type: 'budget',
          prompt: {
            ar: 'أمامك ساعتان لتدريب متطوّعين على توثيق زيارات الحقل، ولا شيء غيرهما. اختر ما يدخل الجلسة، واترك الباقي.',
            en: 'You have two hours to train volunteers on documenting field visits, and nothing beyond them. Choose what goes into the session and leave the rest out.',
          },
          limit: 120,
          unit: {
            ar: { zero: 'لا شيء', one: 'دقيقة واحدة', two: 'دقيقتان', few: '{n} دقائق', many: '{n} دقيقة' },
            en: { zero: 'nothing', one: 'one minute', two: 'two minutes', few: '{n} minutes', many: '{n} minutes' },
          },
          options: [
            {
              text: {
                ar: 'افتتاح يقول ما الذي سيصير المشارك قادراً على فعله حين يخرج',
                en: 'An opening that says what the participant will be able to do when they walk out',
              },
              cost: 5,
              take: true,
              because: {
                ar: 'خمس دقائق تشتري لك الجلسة كلّها: المشارك الذي يعرف إلى أين تمضي به يحتمل نشاطاً لا يفهم غايته في لحظته، والذي لا يعرف ينسحب ذهنياً عند أوّل تمرين يبدو له بلا معنى.',
                en: 'Five minutes that buy you the whole session: a participant who knows where they are being taken will sit through an activity whose purpose is not obvious in the moment, and one who does not know checks out at the first exercise that looks pointless.',
              },
            },
            {
              text: {
                ar: 'تنشيط الخبرة السابقة: ماذا يوثّق كلّ منهم اليوم فعلاً، وأين يتعثّر',
                en: 'Activating what they already do: what each of them actually documents today, and where it goes wrong',
              },
              cost: 15,
              take: true,
              because: {
                ar: 'هذا ليس تمهيداً بل جمع بيانات. ربع الساعة هذه تخبرك أين المشكلة الحقيقية عند هذه المجموعة بالذات، فتضبط النشاط الأساسي على ما سمعته بدل أن تدرّبهم على ما افترضته وأنت تكتب الخطة.',
                en: 'This is not a warm-up, it is data collection. The quarter of an hour tells you where the real difficulty sits for this particular group, so you can tune the core activity to what you heard rather than train them on what you assumed while writing the plan.',
              },
            },
            {
              text: {
                ar: 'النشاط الأساسي: سيناريو زيارة حقيقية يملؤون فيه النموذج بأيديهم',
                en: 'The core activity: a real visit scenario in which they fill in the form themselves',
              },
              cost: 40,
              take: true,
              because: {
                ar: 'هذا هو التدريب، وما عداه محيط به. الهدف أن يعرفوا كيف يملؤون النموذج، والطريقة الوحيدة لبلوغه أن يملؤوه — وأربعون دقيقة هي أقلّ ما يكفي لأن يكتب أحدهم ويقرأ ما كتبه ثمّ يعيد الكتابة.',
                en: 'This is the training and everything else surrounds it. The objective is that they know how to fill in the form, and the only route to it is filling it in — and forty minutes is the least that lets somebody write, read back what they wrote, and then write it again.',
              },
            },
            {
              text: {
                ar: 'مناقشة ما كتبوه: تُقرأ ثلاثة نماذج ويُسأل عن الفرق بينها',
                en: 'Discussing what they wrote: three of the forms are read out and the group is asked what separates them',
              },
              cost: 25,
              take: true,
              because: {
                ar: 'التمرين وحده يُنتج ممارسةً لا معياراً. المناقشة هي التي تحوّل «هكذا كتبتُ أنا» إلى «هكذا يُكتب»، وحذفها يترك كلّ واحد بقناعته الأولى وقد صار الآن أشدّ ثقةً بها لأنّه تمرّن عليها.',
                en: 'The exercise on its own produces practice but no standard. The discussion is what turns "this is how I wrote it" into "this is how it is written", and cutting it leaves everyone with the conviction they arrived with, now held more firmly because they have rehearsed it.',
              },
            },
            {
              text: {
                ar: 'الانتقال بين الأنشطة وتوزيع الأوراق وإعادة ترتيب الطاولات',
                en: 'Moving between activities, handing out papers and putting the tables back',
              },
              cost: 10,
              take: true,
              because: {
                ar: 'هذا الوقت يُنفَق سواء كتبته في الخطة أو لم تكتبه، والفرق أنّه إن لم يكن مكتوباً فسيُؤخذ من النشاط الذي يليه. الخطط التي تنهار في الغرفة هي عادةً الخطط التي جمعت الأنشطة ونسيت المسافات بينها.',
                en: 'This time is spent whether or not you wrote it into the plan, and the difference is that if it is not written it will be taken out of whatever comes next. The plans that fall apart in the room are usually the ones that added up the activities and forgot the gaps between them.',
              },
            },
            {
              text: {
                ar: 'استراحة معلنة في منتصف الجلسة، بوقت بدء ووقت عودة',
                en: 'An announced break at the halfway point, with a start time and a return time',
              },
              cost: 10,
              take: true,
              because: {
                ar: 'ساعتان بلا استراحة ليستا ساعتين من الانتباه، بل ساعة ونصفاً من الانتباه ونصف ساعة من الحضور الشكلي. والاستراحة المعلنة بوقتَيها تعود في موعدها؛ أمّا «خذوا خمس دقائق» فتصير خمس عشرة في كلّ مرّة.',
                en: 'Two hours without a break are not two hours of attention; they are ninety minutes of attention and thirty of being in the room. A break announced with both its times comes back on time, where "take five minutes" turns into fifteen every time.',
              },
            },
            {
              text: {
                ar: 'الإغلاق: ماذا سيفعل كلّ واحد على نحو مختلف في زيارته القادمة',
                en: 'The close: what each of them will do differently on their next visit',
              },
              cost: 10,
              take: true,
              because: {
                ar: 'الجلسة التي تنتهي حين ينتهي الوقت تنتهي في الغرفة. الالتزام الذي يُقال بصوت مسموع أمام الآخرين هو الجسر الوحيد بين الجلسة والزيارة القادمة، وهو أرخص عشر دقائق في الخطة كلّها.',
                en: 'A session that ends when the time runs out ends in the room. A commitment said out loud in front of the others is the only bridge between the session and the next field visit, and it is the cheapest ten minutes in the whole plan.',
              },
            },
            {
              text: {
                ar: 'تعريف بالجمعية وتاريخها ومشاريعها بالشرائح',
                en: 'An introduction to the association, its history and its projects, with slides',
              },
              cost: 15,
              take: false,
              because: {
                ar: 'هؤلاء متطوّعون في الجمعية أصلاً؛ التعريف يُطمئن المدرّب ولا يضيف إلى المشارك شيئاً. وحين يُقتطع ربع الساعة من نشاط أو من مناقشة، تكون قد استبدلت بمهارةٍ تقديماً.',
                en: 'These are already volunteers with the association; the introduction reassures the trainer and adds nothing for the participant. When that quarter of an hour comes out of an activity or a discussion, you have traded a skill for a preamble.',
              },
            },
            {
              text: {
                ar: 'لعبة تعارف طويلة يتحرّك فيها الجميع في أرجاء الغرفة',
                en: 'A long icebreaker game with everybody moving around the room',
              },
              cost: 20,
              take: false,
              because: {
                ar: 'المجموعة تعرف بعضها، والدفء الذي تشتريه اللعبة يشتريه تنشيط الخبرة السابقة بلا ثمن لأنّه يُنطق الناس عن عملهم. وعشرون دقيقة هي نصف النشاط الأساسي تقريباً، وهذا ثمن باهظ لأجل جوّ الغرفة.',
                en: 'The group already knows each other, and the warmth the game buys is bought for nothing by activating their prior experience, which gets people talking about their own work. Twenty minutes is roughly half the core activity, which is a steep price for the mood of the room.',
              },
            },
            {
              text: {
                ar: 'محاضرة عن أهمية التوثيق وأثره على جودة البيانات وثقة المموّلين',
                en: 'A lecture on why documentation matters and its effect on data quality and donor confidence',
              },
              cost: 20,
              take: false,
              because: {
                ar: 'لا أحد في الغرفة يعارض أهمية التوثيق؛ مشكلتهم أنّهم لا يعرفون كيف يُكتب سطر صالح. والإقناع بشيء مقتنَع به سلفاً هو أكثر ما يُنفَق عليه وقت التدريب بلا عائد.',
                en: 'Nobody in the room disputes that documentation matters; their problem is that they do not know how a usable line gets written. Persuading people of something they already accept is the single largest waste of training time there is.',
              },
            },
            {
              text: {
                ar: 'قراءة استبيان الرضا بنداً بنداً وتعبئته في الغرفة',
                en: 'Reading the satisfaction survey out item by item and filling it in together in the room',
              },
              cost: 10,
              take: false,
              because: {
                ar: 'الاستبيان يوزَّع ويُملأ في دقيقتين بلا قراءة جماعية، وهو أضعف مستويات التقييم أصلاً. وهو أرخص من كلّ ما أُبقي عليه هنا — وهذا بالذات ما يجعل الاختيار بالسعر وحده دليلاً رديئاً.',
                en: 'The survey is handed out and filled in within two minutes without being read aloud, and it is the weakest level of evaluation to begin with. It is also cheaper than everything kept here — which is precisely what makes choosing by price alone a poor guide.',
              },
            },
          ],
          afterword: {
            ar: 'ما بقي يبلغ مئةً وخمس عشرة دقيقة من مئة وعشرين، والخمس الباقية بلا خطّة عن قصد. الجلسة المملوءة إلى آخر دقيقة تنهار عند أوّل سؤال طويل، وعندها تُؤخذ الدقائق الناقصة من المناقشة والإغلاق — أي من آخر نشاطين وأثمنهما. ولاحظ أنّ أرخص ما تُرك، وهو الاستبيان، أرخص من كلّ ما أُبقي عليه: لو كان الاختيار بالسعر لبقي الاستبيان وسقطت المناقشة.',
            en: 'What survives comes to a hundred and fifteen minutes of a hundred and twenty, and the five left over have nothing planned against them on purpose. A session filled to the last minute collapses at the first long question, and the missing minutes then come out of the discussion and the close — the last two activities, and the two most valuable. Notice too that the cheapest thing dropped, the survey, is cheaper than everything kept: had the choosing been done by price, the survey would have stayed and the discussion would have gone.',
          },
        },
        {
          type: 'quiz',
          id: 'tot-q4',
          label: { ar: 'قرارك بالميدان', en: 'Your call in the field' },
          question: {
            ar: 'تُريد تدريب متطوّعين على توثيق زيارات الحقل. أيّ تصميم يُحقّق الهدف أفضل؟',
            en: 'You want to train volunteers on documenting field visits. Which design best achieves the objective?',
          },
          options: [
            { ar: 'تشرح خطوات التوثيق في عرض تقديمي مفصّل ثم توزّع النموذج عليهم لمراجعته في البيت قبل الزيارة القادمة', en: 'Explain the documentation steps in a detailed presentation, then hand out the form for them to review at home before the next visit' },
            { ar: 'تُحاضر عن أهمية التوثيق وأثره على جودة البيانات وعلى ثقة المموّلين بالمنظمة على المدى الطويل', en: 'Lecture on the importance of documentation and its effect on data quality and on donor confidence in the organisation over the long term' },
            { ar: 'تعطيهم سيناريو زيارة حقيقية يملؤون فيها النموذج ثم تناقش ما كتبوه معاً', en: 'Give them a real visit scenario, they fill in the form, then you discuss together what they wrote' },
            { ar: 'توزّع النموذج وتطلب منهم قراءة التعليمات المطبوعة', en: 'Distribute the form and ask them to read the printed instructions' },
          ],
          correct: 2,
          feedback: {
            ar: 'الخيار الثالث هو الوحيد الذي يجعل المشاركين يفعلون ما هو الهدف بالضبط: يملؤون النموذج. الشرح والمحاضرة وقراءة التعليمات تعطي معلومة لكنها لا تُنتج مهارة. الممارسة الفعلية تكشف أين يتعثّر الناس حقاً، والمناقشة بعدها هي التي تُعالج هذه المواضع وتُثبّت التعلّم.',
            en: 'The third option is the only one that makes participants do exactly what the objective is: fill in the form. Explanation, lecturing and reading instructions give knowledge but do not produce skill. Actual practice reveals where people genuinely stumble, and the discussion afterwards is what addresses those points and consolidates learning.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'tot-m5',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'تقييم التعلّم وتقديم الملاحظات البنّاءة', en: 'Evaluating Learning and Giving Constructive Feedback' },
      lede: {
        ar: 'استبيان الرضا في نهاية الجلسة يقيس درجة الحرارة في الغرفة، لا ما إذا كانت المناعة قد تحسّنت.',
        en: 'The end-of-session satisfaction survey measures the temperature in the room, not whether immunity has improved.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التقييم الذي يُكتفى فيه بسؤال «هل أعجبتك الجلسة؟» يخبرك بشيء، لكنه يخبرك بالشيء الأقلّ أهمية. معدّل رضا ممتاز من خمسة لا يعني أن أحداً تعلّم شيئاً أو غيّر سلوكه. نموذج كيركباتريك للتقييم يُذكّرنا بأن التقييم يعمل على أربعة مستويات متصاعدة: ردّ الفعل — هل أُعجب المشاركون؟، والتعلّم — هل اكتسبوا معرفة أو مهارة جديدة؟، والسلوك — هل غيّروا شيئاً في عملهم الفعلي بعد الجلسة؟، والنتائج — هل أثّر ذلك التغيير على المستفيدين والبرنامج؟ المستوى الأوّل سهل القياس والأقلّ معنىً. المستوى الثاني قياسه ممكن بجهد بسيط وهو الأكثر إهمالاً. المستويان الثالث والرابع يحتاجان متابعة بعد الجلسة بأسابيع لكنهما وحدهما يُجيبان على السؤال الحقيقي: هل التدريب كان يستحق وقت الجميع؟',
            en: 'An evaluation that only asks "did you enjoy the session?" tells you something, but it tells you the least important thing. An excellent average satisfaction score does not mean anyone learned anything or changed their behaviour. The Kirkpatrick evaluation model reminds us that evaluation works at four ascending levels: reaction — did participants enjoy it?; learning — did they gain new knowledge or skill?; behaviour — did they change something in their actual work after the session?; and results — did that change affect beneficiaries and the programme? Level one is easy to measure and least meaningful. Level two is measurable with modest effort and is the most neglected. Levels three and four require follow-up weeks after the session but they alone answer the real question: was the training worth everyone\'s time?',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'قياس التعلّم خلال الجلسة: نشاط تطبيقي تُلاحظه، أو سؤال موقفي يحلّه المشارك، أو مقارنة بين ما أجابه في البداية وما يقوله في النهاية',
              'قياس التعلّم بعد أسبوعين: سؤال واحد أو موقف واحد ترسله لكلّ مشارك: «ماذا فعلت مختلفاً منذ التدريب؟»',
              'ملاحظة ميدانية: تزور أحد المشاركين في عمله وتلاحظ ما تغيّر — أثمن من أي استبيان كتابي',
              'مؤشّرات البرنامج: هل ارتفع عدد التقارير المكتملة في موعدها؟ هل انخفضت الأخطاء المكرّرة؟',
              'جلسة تشاركية بعد شهر: ماذا نجحتم في تطبيقه وما الذي أعاقكم وما الذي تحتاجون فيه دعماً إضافياً؟',
            ],
            en: [
              'Measuring learning during the session: an applied activity you observe, a situational question the participant solves, or a comparison between their answer at the start and at the end',
              'Measuring learning after two weeks: one question or scenario sent to each participant: "what have you done differently since the training?"',
              'Field observation: visit a participant at their work and observe what has changed — more valuable than any written survey',
              'Programme indicators: did the number of reports completed on time increase? Did recurring errors decrease?',
              'A participatory session one month on: what did you manage to apply, what got in the way, and what do you still need additional support with?',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'أما تقديم الملاحظات — ما يُسمّى التغذية الراجعة — فهي مهارة منفصلة تحتاج تعلّماً متعمّداً. الملاحظة المفيدة تتكوّن من ثلاثة أجزاء: ما لاحظته تحديداً في سلوك الشخص أو أدائه، وأثره الملموس على ما كنّا نحاول تحقيقه في الجلسة أو في العمل، ثم سؤال يدعو الشخص لاقتراح بديل أو تعديل بنفسه. «كنت رائعاً» جملة لطيفة لا تقول للشخص ماذا يُكرّر. «هذا كان سيّئاً» تُحبطه وتتركه بلا خريطة للتحسّن. «حين شرحت الخطوة الثالثة لاحظت أن ثلاثة أشخاص في آخر الصف بدأوا يتحدّثون في ما بينهم — ما رأيك بأن نجرّب تقديم الخطوة نفسها بمثال حقيقي من عملهم بدل المثال المجرّد؟» — هذه ملاحظة يمكن التصرّف بها لأنها تصف ما حدث، وتربطه بالهدف، وتدعو لاقتراح مختلف.',
            en: 'As for giving feedback, it is a separate skill that requires deliberate learning. Useful feedback consists of three parts: what you specifically observed in the person\'s behaviour or performance, its concrete effect on what we were trying to achieve in the session or in the work, and then a question inviting the person to suggest an alternative or adjustment themselves. "You were great" is a pleasant sentence that tells the person nothing about what to repeat. "That was poor" discourages them and leaves no map for improvement. "When you explained step three I noticed three people at the back started talking among themselves — what do you think about trying to present that same step using a real example from their work instead of the abstract one?" — that is feedback you can act on because it describes what happened, connects it to the objective, and invites a different suggestion.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'مجتمعات التعلّم المهنية — سواء أكانت مجموعة مدرّبين يلتقون شهرياً أو منتدى رقمي يتبادلون فيه ملاحظاتهم — هي الوسيلة الأفضل لتطوير مهارة التدريب على المدى البعيد. التدريب الانعزالي ينتهي بمدرّب يُكرّر نفس الأساليب سنوات دون أن يلاحظ أن احتياجات الفرق وقدراتهم تغيّرت.\n\nما يجعل هذه المجتمعات فاعلة ليس اللقاء بحدّ ذاته — بل نوع المحادثة التي تُجرى فيه. جلسة يقول فيها كل مدرّب «كان يومي رائعاً» لا تُضيف شيئاً. جلسة يقول فيها «جرّبت هذا الأسلوب وحدث هذا، ثم تصرّفت بهذه الطريقة ولا أعرف إن كانت صحيحة» هي جلسة تعلّم حقيقية.\n\nأربع ممارسات تُميّز مجتمع التعلّم الفاعل: (١) تبادل تجارب الإخفاق بنفس ثقة تبادل النجاح — وهذا يحتاج ثقة وأماناً نفسياً بُنيا بمرور الوقت. (٢) مشاهدة بعضهم أثناء التدريب وتقديم ملاحظات بُنيت على ما لُوحظ لا ما تُخُيّل. (٣) قراءة مصدر مشترك وحوار حوله — كتاب، ورقة بحثية، دراسة حالة. (٤) تصميم جلسة واحدة معاً كل فترة — فالتصميم الجماعي يكشف افتراضات كل مدرّب التي تبقى غير مُختبرة حين يعمل منفرداً.',
            en: 'Professional learning communities — whether a group of trainers who meet monthly or a digital forum where they exchange observations — are the best means for developing training skills over the long term. Isolated training ends with a trainer repeating the same methods for years without noticing that teams\' needs and capabilities have changed.\n\nWhat makes these communities effective is not the meeting itself — but the type of conversation held in it. A session where every trainer says "my day was great" adds nothing. A session where someone says "I tried this approach and this happened, then I acted in this way and I don\'t know if it was right" is real learning.\n\nFour practices distinguish an effective learning community: (1) sharing failure experiences with the same confidence as sharing successes — this requires trust and psychological safety built over time. (2) watching each other during training and providing feedback built on what was observed, not imagined. (3) reading a shared source and discussing it — a book, a research paper, a case study. (4) designing one session together periodically — collective design reveals each trainer\'s assumptions that remain untested when working alone.',
          },
        },
        {
          type: 'quiz',
          id: 'tot-q5',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أنهيت جلسة تدريبية واستلمت استبياناً رضا بمعدّل ٤.٨ من ٥. ماذا يعني هذا عن مدى نجاح التدريب؟',
            en: 'You finished a training session and received a satisfaction survey averaging 4.8 out of 5. What does this tell you about how successful the training was?',
          },
          options: [
            { ar: 'التدريب نجح ويمكن الاستنتاج بثقة أن المشاركين تعلّموا ما يلزمهم لعملهم وأنهم سيُطبّقونه عند عودتهم إلى الميدان في الأسبوع نفسه', en: 'The training succeeded and you can confidently conclude that participants learned what they need for their work and will apply it as soon as they return to the field in the same week' },
            { ar: 'يعني فقط أن المشاركين أُعجبوا بتجربة الجلسة، وهو أوّل مستوى من أربعة مستويات للتقييم والأقلّ دلالة على التعلّم الحقيقي', en: 'It means only that participants enjoyed the session experience, which is the first of four evaluation levels and the least indicative of real learning' },
            { ar: 'نتيجة ممتازة تُثبت أن المدرّب استخدم أساليب تنويع متنوّعة ومناسبة', en: 'An excellent result proving the trainer used varied and appropriate methods' },
            { ar: 'يعني أن المشاركين سيُغيّرون سلوكهم في العمل خلال الأسبوع التالي للجلسة', en: 'It means participants will change their behaviour at work during the week following the session' },
          ],
          correct: 1,
          feedback: {
            ar: 'درجة الرضا المرتفعة مطلوبة وتشير إلى تجربة إيجابية، لكنها تقيس المستوى الأوّل من أربعة. قد يكون التدريب ممتعاً وغير مجدٍ في تغيير السلوك، وقد يكون صعباً ومثيراً للتوتّر وعالي الأثر على العمل. المستويات الثلاثة الأخرى — تعلّم، سلوك، نتائج — هي وحدها التي تُجيب على ما إذا كان التدريب أضاف قيمة حقيقية.',
            en: 'A high satisfaction score is necessary and points to a positive experience, but it measures the first of four levels. Training may be enjoyable and ineffective in changing behaviour, or stressful and anxiety-inducing yet highly impactful on work. The other three levels — learning, behaviour, results — are the only ones that answer whether the training added genuine value.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 6
    {
      id: 'tot-m6',
      tag: { ar: 'الوحدة السادسة', en: 'Module 6' },
      title: { ar: 'توثيق الخبرة وإدارة المعرفة المؤسسية', en: 'Documenting Experience and Managing Institutional Knowledge' },
      lede: {
        ar: 'حين يغادر متطوّع خبير، ما الذي يبقى؟ إن كانت الإجابة «ذكرياته فقط»، الجمعية فقيرة رغم سنوات خبرتها.',
        en: 'When an experienced volunteer leaves, what stays? If the answer is "only their memories", the association is poor despite its years of experience.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'إدارة المعرفة ليست ملفّات في مجلّد مشترك على خادم ما. هي الإجابة العملية على سؤال: «حين يجيء شخص جديد بعد عام من الآن، كيف يصل إلى ما تعلّمناه بألم واجتهاد؟». المعرفة في أي منظمة طوعية موجودة في ثلاثة أماكن: في الأوراق والملفّات المكتوبة، وفي العمليات والأنظمة والإجراءات، وفي رؤوس الناس وخبراتهم الضمنية غير المكتوبة. الأوّل يُؤرشف. الثاني يُوثَّق. الثالث — وهو الأثمن والأكثر عرضة للضياع — يُنقل عبر محادثات موجَّهة وأسئلة مقصودة وتوثيق فوري. المتطوّع الذي يعرف لماذا قرّرت الجمعية قبل ثلاث سنوات أن تتوقّف عن توزيع المواد مباشرةً وتبدأ العمل عبر المجتمعات المحلية يحمل معرفة استراتيجية لا يمكن أن يجدها في أي تقرير — إلا إن أحداً توقّف واستخرجها وكتبها في وقتها.',
            en: 'Knowledge management is not files in a shared folder on some server. It is the practical answer to the question: "When someone new arrives a year from now, how do they access what we learned through effort and sometimes through painful mistakes?" Knowledge in any volunteer organisation lives in three places: in written papers and files, in processes and systems and procedures, and in people\'s heads as unwritten tacit experience. The first is archived. The second is documented. The third — the most valuable and the most exposed to being lost — is transferred through guided conversations, deliberate questions and immediate documentation. The volunteer who knows why the association decided three years ago to stop direct distribution and begin working through local communities holds strategic knowledge that cannot be found in any report — unless someone stopped and extracted and wrote it at the time.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'بعد كل نشاط أو مشروع: اجلس مع الفريق خمس عشرة دقيقة واسأل ثلاثة أسئلة — ما الذي نجح، ما الذي كان ينبغي أن نفعله بشكل مختلف، وما الذي يجب أن يعرفه الفريق القادم قبل أن يبدأ',
              'سجّل الإجابات في وثيقة واحدة موجزة — ليس تقريراً رسمياً طويلاً — وارفعها مرتبطةً بملف النشاط في اليوم نفسه',
              'حين يُعدّ مدرّب أو مدير لجلسة أو مشروع مشابه، يُطلب منه أن يقرأ وثائق «ما تعلّمناه» للأنشطة المشابهة قبل البدء',
              'وثّق الاستثناءات والقرارات الصعبة بالحجج والسياق لا بالنتائج وحدها: «قرّرنا X بدل Y لأن Z كان صحيحاً في ذلك السياق»',
              'احتفظ بمكتبة أدوات حيّة: كل نموذج يُستخدم فعلاً، وكل بروتوكول مُختبر وثبت جدواه، وكل سؤال أثبت فائدته في جلسات التقييم',
              'اجعل الوصول سهلاً وسريعاً — الملفّ الذي يحتاج بحثاً في عشر مجلّدات لا يُفتح. مجلّد واحد بعناوين واضحة ومنطقية يُستخدم',
            ],
            en: [
              'After every activity or project: sit with the team for fifteen minutes and ask three questions — what worked, what we should have done differently, and what the next team needs to know before they begin',
              'Record the answers in one brief document — not a long formal report — and upload it linked to the activity file on the same day',
              'When a trainer or manager is preparing a similar session or project, ask them to first read the "what we learned" documents from comparable activities',
              'Document exceptions and difficult decisions with their reasoning and context, not their outcomes alone: "we chose X over Y because Z was true in that context"',
              'Maintain a living toolkit: every form that is actually used, every tested protocol that proved its worth, every question that demonstrated its value in evaluation sessions',
              'Make access easy and fast — a file that requires searching through ten folders is never opened. One folder with clear, logical headings gets used',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'مكتبة الموارد التي تُستخدم فعلاً', en: 'A resource library people actually use' },
          content: {
            ar: 'الفرق بين مكتبة تُبنى وتُنسى ومكتبة تُستخدم يومياً هو الفرق بين منطق «أحفظ كل شيء لكل شخص» ومنطق «أُجيب على الأسئلة التي تُسأل». ابدأ بتجميع الأسئلة التي تسمعها فعلاً: «أين النموذج الذي نملؤه قبل الزيارة؟»، «كيف أتعامل مع مشارك يرفض التوقيع؟»، «ما الفرق بين التقرير الأسبوعي وتقرير الزيارة الفردية؟». كلّ سؤال يُجاب عليه في وثيقة موجزة قابلة للعثور عليها في ثلاثين ثانية هو قيمة حقيقية ملموسة. ألف ملف لا يعرف أحد كيف يصل إليه ليست مكتبة — هي أرشيف مُهمَل.',
            en: 'The difference between a library built and forgotten and one used daily is the difference between a "save everything for everyone" logic and an "answer the questions that get asked" logic. Start by collecting the questions you actually hear: "Where is the form we fill in before a visit?", "How do I handle a participant who refuses to sign?", "What is the difference between the weekly report and the individual visit report?" Every question answered in a brief document findable in thirty seconds is real, tangible value. A thousand files nobody knows how to reach is not a library — it is a neglected archive.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'تصميم النشاط التدريبي الجيد يتجاوز اختيار موضوع وشرحه — إنه هندسة تجربة تعلّم تدفع المشارك من الفهم الذهني إلى التطبيق العملي. ثلاثة عناصر لكل نشاط ناجح: هدف واضح قابل للقياس (ماذا سيستطيع المشارك فعله في نهاية النشاط؟)، وطريقة تُناسب الهدف (لا تُعلَّم المهارة بالمحاضرة وحدها — المهارات تُكتسب بالتطبيق)، وتغذية راجعة فورية تُعزّز التعلّم وتُصحّح قبل أن تترسّخ الأخطاء.\n\nدراسة الحالة الجماعية مثلاً ليست مجرّد قراءة — بل قراءة ثم نقاش ثم استخلاص ثم ربط بالسياق الخاص لكل مشارك. المُدرّب المبتدئ يُعدّل أسلوبه الواحد ليناسب كل موضوع. المُدرّب المحترف يمتلك مجموعة من الأساليب يختار منها بحسب طبيعة المحتوى وخصائص المجموعة والوقت المتاح.',
            en: 'Designing a good training activity goes beyond choosing a topic and explaining it — it is engineering a learning experience that moves the participant from cognitive understanding to practical application. Three elements for every successful activity: a clear measurable objective (what will the participant be able to do at the activity\'s end?), a method matching the objective (skills are not taught through lecture alone — skills are acquired through application), and immediate feedback that reinforces learning and corrects before errors become entrenched.\n\nA group case study, for example, is not just reading — it is reading then discussion then extraction then connection to each participant\'s own context. A beginning trainer adapts their single method to suit every topic. A professional trainer has a range of methods to choose from according to the nature of the content, the group\'s characteristics, and the available time.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'المُدرّب الذي لم يواجه لحظة صعبة في قاعة التدريب لم يُدرّب بعد بما يكفي. المشارك الصامت تماماً، المجموعة المتسرّعة التي تريد الانتهاء، السؤال المُحرج أمام الجميع، النقاش المنحرف نحو خلاف شخصي — مواقف تتطلّب مهارات إدارة مختلفة عن مهارة الشرح والتدريب.\n\nللمشارك الصامت: أسئلة موجّهة برفق تُتيح المشاركة دون إحراج ("ما الذي لفت انتباهك في ما سمعناه؟"). للمجموعة المتسرّعة: تذكير بالقيمة التي سيحصلون عليها من الوقت المتبقّي. للسؤال المُحرج: "سؤال ممتاز، لأجل الدقة سأُعود إليه بعد أن أتحقّق". للنقاش المنحرف: إعادة التركيز بجملة محايدة تحترم كل الآراء وتُعيد الطاقة للموضوع الأصلي. هذه الأدوات لا تُكتسب بالقراءة فقط — بل بالتطبيق المقصود والتأمّل بعد كل جلسة.',
            en: 'A trainer who has not faced a difficult moment in the training room has not yet trained enough. The completely silent participant, the rushed group wanting to finish, the embarrassing question in front of everyone, the discussion drifting toward personal disagreement — all are situations requiring management skills different from the skill of explanation and training.\n\nFor the silent participant: gently directed questions that enable participation without embarrassment ("What caught your attention in what we heard?"). For the rushed group: a reminder of the value they will gain from the remaining time. For the embarrassing question: "An excellent question — for accuracy I will return to it after I verify." For the drifting discussion: refocusing with a neutral phrase that respects all views and returns energy to the original topic. These tools are not acquired by reading alone — but through deliberate application and reflection after each session.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'التقييم التدريبي ليس ورقة رضا تُوزَّع في النهاية — بل عملية مستمرّة طوال الجلسة. مؤشّرات الفهم الآني التي يُراقبها المُدرّب الجيد: هل الجميع يبدون منتبهين؟ هل الأسئلة تتعلّق بالمحتوى أم بالإجراءات؟ هل مجموعات النقاش تعمل أم تتحدّث عن موضوع آخر؟ هذه الملاحظات تُمكّن المُدرّب من التعديل الفوري: إبطاء الإيقاع، تغيير الأسلوب، إدخال نشاط جديد يُكسر الروتين.\n\nالتقييم الختامي الأكثر فائدة يتضمّن ثلاثة أسئلة محدّدة: ما الذي تعلّمته وأريد تطبيقه فوراً؟ ما الذي أحتاج فيه توضيحاً إضافياً؟ وما الذي كان بإمكان المُدرّب فعله بشكل مختلف؟ هذه الإجابات تُطوّر المُدرّب وتُطوّر الدورة معاً في كل دورة.',
            en: 'Training evaluation is not a satisfaction paper distributed at the end — but an ongoing process throughout the session. Real-time comprehension indicators that a good trainer monitors: does everyone appear attentive? Are questions about content or procedures? Are discussion groups working or talking about another topic? These observations enable the trainer to make immediate adjustments: slowing the pace, changing the method, introducing a new activity to break the routine.\n\nThe most useful final evaluation includes three specific questions: what did I learn and want to apply immediately? What do I need additional clarification on? And what could the trainer have done differently? These answers develop the trainer and develop the course together with each session.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'المُدرّب في بيئة العمل التطوّعي ليس فقط ناقل معرفة — بل بانٍ لمجتمع تعلّم يستمر بعد انتهاء الجلسة. مجتمع التعلّم يعني أن المشاركين يستمرّون في تبادل الخبرات وطرح الأسئلة ودعم بعضهم بعد الدورة، لأنهم شاركوا في بناء المعرفة معاً لا استقبلوها فقط.\n\nكيف تبني ذلك عملياً: أنشئ مجموعة تواصل مع المشاركين تستمر بعد الجلسة، شارك فيها محتوى تطبيقياً مرتبطاً بما تعلّموه، اطرح أسئلة متابعة ("هل طبّق أحد ما تعلّمناه الأسبوع الماضي؟ ماذا حدث؟")، واحتفل بالنجاحات الصغيرة علناً. المُدرّب الذي يُلهم مجتمعاً يُضاعف أثر كل جلسة يُقدّمها — الأثر لا يتوقّف حين تغلق الباب.',
            en: 'A trainer in the volunteering environment is not only a knowledge transmitter — but a builder of a learning community that continues after the session ends. A learning community means participants continue to exchange experiences, raise questions, and support each other after the course, because they participated in building knowledge together rather than just receiving it.\n\nHow to build this practically: create a communication group with participants that continues after the session, share applied content linked to what they learned, ask follow-up questions ("Has anyone applied what we learned last week? What happened?"), and celebrate small successes publicly. A trainer who inspires a community multiplies the impact of every session they deliver — the impact does not stop when you close the door.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'المُدرّب المحترف يبني ملفّاً تدريبياً (Training Portfolio) يوثّق ما صمّمه ونفّذه وتعلّمه عبر الوقت. هذا الملفّ يتضمّن: مواد التدريب التي طوّرها (عروض، حالات دراسية، أوراق عمل)، ملاحظاته على كل جلسة نفّذها وما سيُغيّره في المرة القادمة، وتقييمات المشاركين مُجمَّعة لرؤية الأنماط والتطوّر بمرور الوقت.\n\nهذا الملفّ ليس مجرّد أرشيف — بل مرآة تعكس تطوّرك كمُدرّب. حين تُراجعه بعد عام، تستطيع رؤية الفرق الفعلي بين من كنت حين بدأت ومن أصبحت. والمُدرّب الذي يمتلك ملفّاً كهذا يستطيع التحدّث عن تجربته بأمثلة محدّدة حين يتقدّم لفرصة تدريبية أكبر أو يُقدّم نفسه لمنظّمة جديدة.',
            en: 'A professional trainer builds a Training Portfolio that documents what they designed, delivered, and learned over time. This portfolio includes: training materials they developed (presentations, case studies, worksheets), their notes on every session delivered and what they will change next time, and participant evaluations collected to see patterns and development over time.\n\nThis portfolio is not merely an archive — it is a mirror reflecting your development as a trainer. When you review it after a year, you can see the actual difference between who you were when you started and who you have become. And a trainer who holds such a portfolio can speak about their experience with specific examples when applying for a larger training opportunity or presenting themselves to a new organisation.',
          },
        },
        {
          type: 'quiz',
          id: 'tot-q6',
          label: { ar: 'قرارك', en: 'Your call' },
          question: {
            ar: 'متطوّعة خبيرة ستغادر الجمعية الشهر القادم بعد خمس سنوات. أيّ إجراء يحافظ أفضل على ما تحمله من معرفة مؤسسية؟',
            en: 'An experienced volunteer is leaving the association next month after five years. Which action best preserves the institutional knowledge she carries?',
          },
          options: [
            { ar: 'تطلب منها كتابة تقرير شامل عن كل ما عملت فيه خلال خمس سنوات قبل يوم مغادرتها، على أن يشمل المشاريع والشركاء والدروس المستفادة وتوصياتها للمرحلة القادمة', en: 'Ask her to write a comprehensive report on everything she worked on over five years before her last day, covering the projects, the partners, the lessons learned and her recommendations for the next phase of the programme' },
            { ar: 'تُقيم جلسة تسليم رسمية مع الإدارة يُوقَّع فيها على ملفّ استلام وتسليم', en: 'Hold a formal handover session with management in which a handover document is signed' },
            { ar: 'تُجري معها محادثة موجَّهة بأسئلة ثلاثة محدّدة — ما الذي نجح، ما الذي فشل ولماذا، وما الذي تتمنّى لو أخبرها أحد به في بدايتها — وتُوثَّق الإجابات فوراً', en: 'Conduct a guided conversation with three specific questions — what worked, what failed and why, and what she wishes someone had told her at the start — and document the answers immediately' },
            { ar: 'تطلب منها تدريب خليفتها شفهياً في الأسبوع الأخير قبل مغادرتها', en: 'Ask her to train her replacement verbally during the last week before she leaves' },
          ],
          correct: 2,
          feedback: {
            ar: 'التقرير الشامل يُرهق ولا يُكتب أو يُكتب بشكل سطحي يفتقر للسياق والحجج. الجلسة الرسمية تُنتج محضراً يُودَع في درج ولا يُقرأ. التدريب الشفهي في الأسبوع الأخير يُنسى سريعاً ولا يُوثَّق. المحادثة الموجَّهة بأسئلة ثلاثة محدّدة وتوثيقها فوراً هي الطريقة الوحيدة التي تُنتج معرفة حقيقية قابلة للاسترجاع والمشاركة مع من سيأتي بعدها.',
            en: 'A comprehensive report is exhausting and either is not written at all or is written superficially without context or reasoning. A formal session produces minutes filed in a drawer that are never read. Verbal training in the last week is quickly forgotten and not documented. A guided conversation with three specific questions, documented immediately, is the only method that produces real knowledge that is retrievable and shareable with whoever comes after her.',
          },
        },
      ],
    },
  ],
};
