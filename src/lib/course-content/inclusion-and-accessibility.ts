import type { CourseContent } from './types';

/**
 * Level 4 — Inclusion, Diversity and Accessibility. Pass mark 70.
 *
 * Built around a single discomfort: the exclusion that nobody noticed.
 * Not the deliberate kind — the kind that happens when you design for the
 * person you picture without asking who that picture leaves out.
 *
 * Three ideas run through all five modules. First, unconscious bias is a
 * feature of cognition, not a character flaw — which means the question is
 * not whether you have it but whether you see it in action. Second,
 * accessibility is a design decision made at the beginning, not an
 * accommodation added at the end when the person is already there. Third,
 * involving people in the decision is different from involving them in the
 * delivery — and the difference is whether their presence changes what
 * happens.
 *
 * The quiz questions are deliberately concrete: a decision you already took,
 * a workshop already planned, a meeting already called. Inclusion is easiest
 * to discuss in the abstract and hardest to apply to last Tuesday.
 */

export const inclusionAndAccessibility: CourseContent = {
  slug: 'inclusion-and-accessibility',
  level: 4,
  minutes: 35,
  passMark: 70,
  title: {
    ar: 'الدمج والتنوّع وإتاحة الوصول',
    en: 'Inclusion, Diversity and Accessibility',
  },
  lede: {
    ar: 'من يغيب عن نشاطك من دون أن تلاحظ؟ التحيّز غير الواعي، الترتيبات التيسيرية، واللغة التي تُدخل بدل أن تُقصي.',
    en: 'Who is missing from your activity without your noticing? Unconscious bias, reasonable adjustments, and language that includes rather than excludes.',
  },
  outcomes: {
    ar: [
      'تتعرّف على تحيّز غير واعٍ في قرار اتّخذته أنت',
      'تصمّم نشاطاً متاحاً لذوي الإعاقة ولمن لا يشبهك',
      'تقدّم ترتيباً تيسيرياً من دون أن تجعله استثناءً محرجاً',
      'تُشرك فئات مختلفة في القرار لا في التنفيذ فقط',
    ],
    en: [
      'Recognise unconscious bias in a decision you made yourself',
      'Design an activity accessible to disabled people and to people unlike you',
      'Offer a reasonable adjustment without making it an awkward exception',
      'Involve different groups in the decision, not only in the delivery',
    ],
  },
  sources: [
    'IFRC — Inclusion, Diversity and Gender Policy (2020)',
    'UN Convention on the Rights of Persons with Disabilities (CRPD), Article 4',
    'Core Humanitarian Standard on Quality and Accountability — Commitment 4 on community participation',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'ia-m1',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'التحيّز غير الواعي', en: 'Unconscious Bias' },
      lede: {
        ar: 'التحيّز الأخطر هو الذي لا تعرف أنه موجود عندك.',
        en: 'The most dangerous bias is the one you do not know you have.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التحيّز غير الواعي ليس انحيازاً مقصوداً أو عدواناً متعمّداً — هو ببساطة طريقة الدماغ في الاختصار. نحن نتلقّى كميات هائلة من المعلومات في كل لحظة، وأدمغتنا تصنّفها بسرعة استناداً إلى أنماط تعلّمتها من تجربتنا ومن ثقافتنا ومن الصور التي رأيناها عبر سنوات طويلة. هذا الاختصار ضروري — لكنه يعني أنّنا نتّخذ بعض قراراتنا قبل أن نكون قد فكّرنا بها فعلاً وبشكل واعٍ. حين تختار من تكلّمه أوّلاً في اجتماع، أو من تثق بحكمه أسرع، أو من تُسنده مهمّة صعبة أو ممتعة — ليس بالضرورة أنك فكّرت في الأمر. ربّما كنت تتبع نمطاً أعمق بكثير مما تظنّ. والمشكلة ليست أنك تتبع هذه الأنماط — بل أنك لا تلاحظها وهي تعمل.',
            en: 'Unconscious bias is not deliberate prejudice or intentional hostility — it is simply how the brain shortcuts. We receive enormous amounts of information at every moment, and our brains classify it quickly by drawing on patterns learned from our experience, our culture and the images we have absorbed across many years. That shortcut is necessary — but it means we make some of our decisions before we have actually and consciously thought about them. When you choose who to speak to first in a meeting, who you trust quickly, who you assign a difficult or interesting task to — you have not necessarily thought about it. You may be following a pattern that runs deeper than you think. The problem is not that you follow these patterns — it is that you do not notice them while they work.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'تحيّز التأكيد: تبحث بلا وعي عن معلومات تثبت ما تعتقده فعلاً عن شخص أو موقف، وتتجاهل ما يتعارض معه',
              'تحيّز الهالة: حكمك الإيجابي على شخص في جانب واحد يمتدّ بصمت إلى تقييمك لكل جوانبه الأخرى',
              'تحيّز الانتماء: تتعاطف أكثر مع من يشبهك ثقافياً أو اجتماعياً أو جيلياً، وتشعر أنك تفهمه بسرعة أكبر',
              'تحيّز الحداثة: تُعطي أوزاناً أكبر لآخر ما رأيته لا لمجموع ما تعرفه عن شخص أو موقف',
              'تحيّز الظهور: تستشير وتكلّف من يبادر ويتكلّم بوضوح وبصوت مرتفع، وتُغفل من يتكلّم بهدوء أو ينتظر دوره بصبر',
            ],
            en: [
              'Confirmation bias: you unconsciously search for information that confirms what you already believe about a person or situation, and ignore what contradicts it',
              'Halo effect: a positive judgement of someone in one area silently spreads to how you assess all other aspects of them',
              'Affinity bias: you feel more sympathy toward those who resemble you culturally, socially or generationally, and find them easier to understand quickly',
              'Recency bias: you give more weight to the most recent thing you observed rather than to the full sum of what you know about a person or situation',
              'Visibility bias: you consult and assign to those who take initiative, speak clearly and loudly, and overlook those who speak quietly or wait patiently for their turn',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'من يقول «أنا لا أميّز» هو الأكثر عرضة للتمييز', en: 'Whoever says "I do not discriminate" is most exposed to it' },
          content: {
            ar: 'الثقة بأننا موضوعيون هي نفسها تحيّز. الأشخاص الذين يؤمنون بأنهم يتعاملون مع الجميع بالتساوي يراقبون سلوكهم بصرامة أقل من غيرهم — وهم الأكثر مفاجأة حين تُظهر الأرقام والنتائج الفعلية عكس ذلك تماماً. الشكّ المنتج في قراراتك الخاصة ليس ضعفاً ولا موقفاً متشدّداً على نفسك؛ هو الأداة الوحيدة الفعّالة التي تجعلك أقل تحيّزاً بالفعل وبمرور الوقت.',
            en: 'Confidence in our own objectivity is itself a bias. People who believe they treat everyone equally monitor their own behaviour less rigorously than others — and they are the most surprised when real numbers and outcomes show the opposite. Productive scepticism about your own decisions is not weakness or harshness toward yourself; it is the only effective tool that actually makes you less biased over time.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'اكتشاف تحيّزك لا يبدأ بالاعتراف العلني أمام الجميع — يبدأ بسؤال هادئ تطرحه أنت على نفسك عن قرار محدّد اتّخذته. هل اخترت متطوّعاً على آخر للمهمّة الأكثر مكانةً؟ لماذا؟ هل شككت في كفاءة أحد أو جدّية احتياجه قبل أن تسمعه يتكلّم؟ لماذا؟ هل افترضت أن شخصاً معيّناً لن يهتمّ بالتفاصيل أو لن يحضر المتابعة دون أن تعطيه فرصة؟ الملاحظة لا تعني الذنب ولا التوبة — تعني الوعي. والوعي هو ما يتيح لك أن تختار بشكل مختلف في المرّة القادمة بدل أن تُعيد النمط نفسه دون أن تدري.',
            en: 'Discovering your bias does not begin with a public confession — it begins with a quiet question you put to yourself about a specific decision you made. Did you choose one volunteer over another for the higher-status task? Why? Did you doubt someone\'s competence or the seriousness of their needs before you had even heard them speak? Why? Did you assume a particular person would not care about the details or would not attend the follow-up without giving them a chance? Noticing is not guilt or repentance — it is awareness. And awareness is what lets you choose differently next time instead of repeating the same pattern without realising.',
          },
        },
        {
          type: 'quiz',
          id: 'ia-q1',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'وزّعت المهام في أول اجتماع، وسألك منسّقك لاحقاً لماذا أسندت المهام الأكثر مسؤولية وتأثيراً لثلاثة متطوّعين من بين ثمانية دون أن يُطلبوا هم ذلك. توقّفت وراجعت — لم تجد تفسيراً واضحاً قائماً على أداء أو مهارة. ماذا يُشير هذا على الأرجح؟',
            en: 'You distributed tasks at the first meeting, and your coordinator later asked why you gave the most responsible and impactful tasks to three out of eight volunteers without them having asked for them. You paused and reviewed — you found no clear explanation based on performance or skill. What does this most likely indicate?',
          },
          options: [
            {
              ar: 'قرار مدروس وصحيح لكنك لم تكن تعرف كيف تُبرّره',
              en: 'A deliberate and correct decision that you simply could not articulate',
            },
            {
              ar: 'تحيّز غير واعٍ بناءً على توقّعات أو صور مسبقة عن من يناسب أداء تلك المهام',
              en: 'Unconscious bias based on prior expectations or images of who is suited to those tasks',
            },
            {
              ar: 'خطأ إداري بسيط لا علاقة له بالتحيّز أو التوقّعات المسبقة، وكان يمكن تفاديه بقائمة توزيع مكتوبة',
              en: 'A simple administrative error unrelated to bias or prior expectations, which a written assignment list would have prevented',
            },
            {
              ar: 'اجتهاد معقول يمكن تبريره بالخبرة الإدارية العامة',
              en: 'A reasonable judgement justifiable by general management experience',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'حين لا يوجد تفسير منطقي واضح للقرار وحين يظهر نمط متكرّر، فالاحتمال الأقوى هو التحيّز غير الواعي — أي قرار بدا طبيعياً في اللحظة لأن الدماغ أكمل الفراغ بناءً على أنماط وتوقّعات مسبقة لم تُلاحَظ. الخطوة المفيدة ليست الشعور بالذنب بل إعادة المراجعة والانتباه للنمط في القرارات اللاحقة بشكل منهجي.',
            en: 'When there is no clear logical explanation and a pattern appears, the strongest likelihood is unconscious bias — a decision that felt natural in the moment because the brain filled the gap drawing on unnoticed prior patterns and expectations. The useful step is not guilt but reviewing the decision and watching systematically for the pattern in future ones.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'ia-m2',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'من يغيب عن نشاطك؟', en: 'Who Is Missing from Your Activity?' },
      lede: {
        ar: 'الغياب لا يُعلن عن نفسه — عليك أنت أن تقرأه بنشاط.',
        en: 'Absence does not announce itself — you have to read it actively.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين تنظر إلى من حضر نشاطك، أنت ترى نجاحاً. حين تسأل من لم يحضر ولماذا، تبدأ تتعلّم شيئاً مختلفاً تماماً وأعمق بكثير. الشخص الذي لم يسجّل لم يقل لك بوضوح «هذا النشاط لا يرحّب بي» — تركك تستنتج بنفسك، ومعظم المنظمات لا تستنتج؛ تفرح بمن جاء وتمضي قُدُماً. لكن السؤال «من غائب؟» هو سؤال عن رسالة أرسلها تصميمك من دون أن تقصدها: الموعد الذي لا يناسب من لديهم مسؤوليات عائلية، والمكان الذي لا تصله وسائل المواصلات العامة بسهولة، وطريقة الإعلان التي تُوحي ضمنياً أن النشاط لشريحة معيّنة فقط. هذه ليست رسائل متعمّدة — لكنها رسائل حقيقية يتلقّاها الناس ويتصرّفون بناءً عليها.',
            en: 'When you look at who came to your activity, you see success. When you ask who did not come and why, you begin to learn something quite different and much deeper. The person who did not register did not tell you clearly "this activity does not welcome me" — they left you to work it out, and most organisations do not; they celebrate those who came and move on. But the question "who is absent?" is a question about a message your design sent without intending to: the time that does not suit people with family responsibilities, the location public transport does not easily reach, the way the announcement implicitly suggested the activity was for a particular group only. These are not deliberate messages — but they are real messages people receive and act on.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الغياب له أنواع متعدّدة: بعضه يخبرك بالعوائق العملية الملموسة كغياب المواصلات أو ارتفاع التكلفة أو تعارض المواعيد مع العمل والدراسة. وبعضه يخبرك بالعوائق الاجتماعية والثقافية: لا يرون أنفسهم في صورة من يتطوّع في هذه المنظمة، أو لا يثقون بها، أو يشعرون أنهم سيكونون خارج المكان اجتماعياً. وبعضه يخبرك بالعوائق الجسدية الصريحة كغياب المصعد أو المواد المطبوعة بخط بارز أو مترجم لغة الإشارة. لا يمكنك إصلاح عائق لا تعرفه. وأفضل طريقة لمعرفته هي الحوار المباشر مع شخص من المجموعة الغائبة — لا في استبانة رقمية تُرسَل بعد انتهاء النشاط، بل بسؤال شخصي دافئ في مرحلة التخطيط قبل اتّخاذ القرارات.',
            en: 'Absence has many types: some tells you about concrete practical barriers like lack of transport, high cost or clashing schedules with work and study. Some tells you about social and cultural barriers: people do not see themselves in the image of who volunteers with this organisation, or they do not trust it, or they feel they would be socially out of place. And some tells you about explicit physical barriers like no lift, no large-print materials, or no sign language interpreter. You cannot fix a barrier you do not know about. And the best way to learn what it is is direct conversation with someone from the absent group — not a digital survey sent after the activity ends, but a warm personal question during the planning stage before decisions are made.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'الوقت والجدول: مواعيد النشاط تتعارض مع أوقات العمل أو التعليم أو مسؤوليات رعاية الأطفال أو كبار السن',
              'المسافة والمواصلات: المكان لا تصله وسائل النقل العامة بسهولة أو بتكلفة معقولة',
              'الإحساس بالانتماء: صور المنظمة وتواصلها لا تعكس التنوّع، فلا يرى الناس أنفسهم فيها',
              'العوائق الجسدية: غياب إمكانية الوصول للكرسي المتحرّك، أو لمواد الإعاقة البصرية، أو خدمات الترجمة',
              'العوائق اللغوية: كل المواد والتواصل بلغة واحدة تُقصي من لا يُتقنها بمستوى كافٍ للمشاركة',
              'التكلفة المخفية: رسوم تسجيل أو اشتراط معدّات أو ملابس يصعب توفيرها على من يعيش بموارد محدودة',
            ],
            en: [
              'Time and schedule: activity times clash with working hours, study, or responsibilities for caring for children or elderly relatives',
              'Distance and transport: the location is not easily reached by public transport or at reasonable cost',
              'Sense of belonging: the organisation\'s imagery and communication does not reflect diversity, so people do not see themselves in it',
              'Physical barriers: no wheelchair access, no materials for visual impairment, no interpretation services',
              'Language barriers: all materials and communication in one language that excludes those who do not speak it at a sufficient level to participate',
              'Hidden cost: registration fees, required equipment or clothing that those living on limited resources cannot easily provide',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'الدعوة ليست الإدماج', en: 'Invitation is not inclusion' },
          content: {
            ar: 'أن تدعو الجميع لا يعني أنك أدمجت الجميع. الدعوة سهلة؛ الإدماج يتطلّب أن تُزيل ما يجعل المجيء صعباً أو مستحيلاً، لا فقط أن تُرسل الإعلان. شخص يُدعى إلى مكان لا يناسبه عملياً أو لا يشعر بالانتماء إليه اجتماعياً لن يأتي، ومن حقّه ألّا يأتي — الفشل كان في تصميم النشاط، لا في استجابة ذلك الشخص للدعوة.',
            en: 'Inviting everyone does not mean you have included everyone. Invitation is easy; inclusion requires removing what makes coming difficult or impossible, not only sending the announcement. Someone invited to a place that does not practically suit them, or where they do not feel they belong socially, will not come — and they are right not to. The failure was in the activity design, not in that person\'s response to the invitation.',
          },
        },
        {
          type: 'quiz',
          id: 'ia-q2',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'تلاحظ أنّ جميع المشاركين في نشاط المتطوّعين الشهري ينتمون إلى نفس الحيّ وتتراوح أعمارهم بين عشرين وخمسة وعشرين عاماً، رغم أنّ الإعلان الذي نُشر كان مفتوحاً للجميع دون قيود. ما الخطوة الأكثر نفعاً التالية؟',
            en: 'You notice that all participants in the monthly volunteering activity come from the same neighbourhood and are between twenty and twenty-five, despite the published announcement being open to all with no restrictions. What is the most useful next step?',
          },
          options: [
            {
              ar: 'الاستمرار في تنظيم النشاط كما هو، فالمهمّ أن الفعالية ناجحة والعدد جيّد، وسيأتي غيرهم من تلقاء أنفسهم مع الوقت',
              en: 'Continue running the activity as it is — what matters is that it is successful and numbers are good, and others will come along on their own in time',
            },
            {
              ar: 'الحديث مباشرة مع أشخاص من فئات غائبة لفهم ما الذي جعل المشاركة صعبة أو غير مشجّعة',
              en: 'Speak directly with people from absent groups to understand what made participation difficult or unappealing',
            },
            {
              ar: 'توسيع قنوات نشر الإعلان في الدورة القادمة وإضافة منصات تواصل اجتماعي جديدة حتى يصل الإعلان إلى أكبر عدد ممكن',
              en: 'Expand the announcement to more channels next time and add new social media platforms so it reaches as many people as possible',
            },
            {
              ar: 'تقليل شروط المشاركة وإزالة أي متطلّبات قد تُحبّط التسجيل',
              en: 'Reduce participation requirements and remove any conditions that might discourage registration',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'توسيع قنوات نشر الإعلان سيصل إلى نفس الشريحة ما لم يتغيّر التصميم نفسه. وتقليل الشروط لا يعالج العائق الحقيقي قبل أن تعرف ما هو. أما التجاهل فيكرّس النمط ويُرسّخه. السؤال المباشر لأشخاص من الفئات الغائبة — أين لم يروا الإعلان؟ ما الذي جعل المشاركة صعبة؟ هل شعروا بأن النشاط لهم أصلاً؟ — هو الطريق الوحيد لمعرفة العائق الحقيقي ومن ثمّ معالجته فعلياً.',
            en: 'Expanding announcement channels will reach the same group unless the design itself changes. Reducing requirements does not address the real barrier before you know what it is. Ignoring the pattern entrenches it. Direct conversation with people from absent groups — where did they not see the announcement? what made participation difficult? did they feel the activity was even for them? — is the only way to find the real barrier and then genuinely address it.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'ia-m3',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'تصميم نشاط متاح', en: 'Designing an Accessible Activity' },
      lede: {
        ar: 'الوصول ليس إضافة في النهاية — هو قرار يُتّخذ في البداية.',
        en: 'Access is not an addition at the end — it is a decision made at the beginning.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'النشاط المتاح لا يعني نشاطاً مختلفاً مصمَّماً بشكل منفصل لكل مجموعة — يعني نشاطاً واحداً صُمِّم من البداية بحيث يُمكن تكيّفه لمن يحتاج ذلك. الفرق بين المقاربتين كبير ومهمّ: في الأولى تصمّم للمتطوّع «الافتراضي» الذي تضعه في ذهنك ثم تحاول إضافة استثناءات وحلول مؤقّتة حين يظهر شخص لا يتناسب مع ذلك التصوّر. وفي الثانية تسأل من البداية: من قد لا يستطيع المشاركة بالشكل الحالي؟ وما الذي يمنعه؟ وكيف يمكن أن يُصمَّم النشاط بحيث يمكن أن يشارك؟ التفكير في الوصول منذ بداية التصميم أرخص بكثير وأكثر نجاعةً وأقل إحراجاً من الارتجال أمام الشخص يوم النشاط عندما لا يوجد وقت لإيجاد حلول.',
            en: 'An accessible activity does not mean a separate different activity designed for each group — it means one activity designed from the start so that it can be adapted for those who need it. The difference between the two approaches is large and important: in the first you design for the "default" volunteer you picture in your head and then try to add exceptions and temporary solutions when someone appears who does not fit that picture. In the second you ask from the start: who might not be able to participate in this form? what prevents them? and how can the activity be designed so that they can? Thinking about access from the beginning of the design is much cheaper, more effective and far less embarrassing than improvising in front of the person on the day when there is no time left for solutions.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'التوصّل إلى تصميم متاح يبدأ بأسئلة محدّدة، لا بقائمة من الحلول الجاهزة. هل يستطيع شخص يستخدم كرسياً متحرّكاً الوصول إلى المكان والتنقّل فيه بشكل مستقل؟ هل التعليمات والمواد مكتوبة بلغة بسيطة واضحة يفهمها من يقرأ ببطء أو يستخدم مكبّر شاشة؟ هل المحتوى البصري — الصور والرسوم والشرائح — لها وصف نصّي لمن لا يرى؟ هل الجدول الزمني يتضمّن استراحات كافية تسمح لمن يحتاج ذلك لأسباب صحية أو جسدية بالمشاركة بشكل كامل؟ هل أنشطة العمل الجماعي مرنة بحيث تسمح بطرق مشاركة متعدّدة لا شكلاً واحداً نمطياً مفروضاً؟ طرح هذه الأسئلة في مرحلة التصميم يكشف معظم العوائق قبل أن تصبح مشكلة يوم النشاط.',
            en: 'Arriving at an accessible design begins with specific questions, not a ready-made list of solutions. Can a wheelchair user reach the venue and move around it independently? Are instructions and materials written in plain clear language understandable to someone who reads slowly or uses a screen reader? Does visual content — images, graphics, slides — have text descriptions for those who cannot see? Does the timetable include sufficient breaks to allow those who need them for health or physical reasons to participate fully? Are group activities flexible enough to allow multiple ways of participating rather than imposing a single fixed form? Asking these questions at the design stage reveals most barriers before they become a problem on the day.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'الوصول المادي', en: 'Physical Access' },
              text: {
                ar: 'المداخل الواسعة والمصاعد ومراحيض الذوي الاحتياجات الخاصة والممرات الخالية من العوائق — هذه ليست وسيلة راحة إضافية بل شرط أساسي لمشاركة متساوية. نشاط في مبنى غير متاح يقول ضمنياً «هذا المكان ليس لكم» حتى لو لم يقصد أحد ذلك.',
                en: 'Wide entrances, lifts, accessible toilets and obstacle-free corridors — these are not additional comforts but a basic condition for equal participation. An activity in an inaccessible building implicitly says "this place is not for you" even if nobody intended that message.',
              },
            },
            {
              title: { ar: 'الوصول المعلوماتي', en: 'Information Access' },
              text: {
                ar: 'مواد مكتوبة بلغة واضحة ومختصرة، بخطّ كبير عند الطلب، بصيغ رقمية متوافقة مع تقنيات المساعدة، ومترجمة إلى لغات المجتمع المستهدف حين يكون ذلك ممكناً ومفيداً.',
                en: 'Written materials in plain clear language, large print on request, digital formats compatible with assistive technologies, and translated into the languages of the target community where possible and useful.',
              },
            },
            {
              title: { ar: 'الوصول التواصلي', en: 'Communication Access' },
              text: {
                ar: 'مترجم لغة إشارة حين يكون هناك من يحتاجه، ترجمة نصية حية للمحتوى الصوتي والمرئي، وقت كافٍ لكل مشارك لتقديم أفكاره دون ضغط سرعة أو مقاطعة.',
                en: 'A sign language interpreter when someone needs one, live text transcription of audio and visual content, and sufficient time for each participant to present their ideas without time pressure or interruption.',
              },
            },
            {
              title: { ar: 'الوصول الزمني', en: 'Time Access' },
              text: {
                ar: 'مرونة في أوقات النشاط والاستراحات تُراعي من يحتاج وقتاً إضافياً لأسباب صحية أو دينية أو عائلية، وتوفير خيار المشاركة عن بُعد حين يكون ذلك ممكناً.',
                en: 'Flexibility in activity times and breaks that accommodates those needing additional time for health, religious or family reasons, and offering a remote participation option where possible.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'اسأل من تصمّم لهم وأشركهم في مرحلة التصميم', en: 'Ask the people you are designing for and involve them at the design stage' },
          content: {
            ar: 'معظم أخطاء تصميم الأنشطة المتاحة تقع حين يصمّمها أشخاص يتحدّثون عن احتياجات لم يعيشوها. إشراك شخص معاق أو ذي خبرة مباشرة في مرحلة التصميم لا في مرحلة التقييم بعد الانتهاء هو الفرق الحاسم بين نشاط يعمل بالفعل لمن صُمِّم لهم ونشاط يبدو في الورق أنه يعمل ثمّ يكتشف الجميع العكس في اليوم نفسه.',
            en: 'Most mistakes in accessible activity design occur when people design while talking about needs they have not lived. Involving a person with disability or with direct experience at the design stage rather than the evaluation stage after everything is finished is the decisive difference between an activity that actually works for those it was designed for and one that looks on paper as though it does, until everyone discovers otherwise on the day itself.',
          },
        },
        {
          type: 'quiz',
          id: 'ia-q3',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'تخطّطون لورشة عمل مدّتها أربع ساعات تستهدف مجتمع المنطقة وتشمل أشخاصاً متنوّعين، ومن بينهم شخص مصاب بإعاقة سمعية. ما الخطوة الأكثر أهمية في مرحلة تصميم الورشة؟',
            en: 'You are planning a four-hour community workshop targeting diverse participants, including someone with a hearing impairment. What is the most important step at the workshop design stage?',
          },
          options: [
            {
              ar: 'تسجيل الورشة كاملةً بالفيديو ليتمكّن من مراجعتها لاحقاً',
              en: 'Record the entire workshop on video so they can review it afterwards',
            },
            {
              ar: 'التواصل مع الشخص مسبقاً لمعرفة ما يحتاجه تحديداً للمشاركة الكاملة',
              en: 'Contact the person in advance to find out specifically what they need for full participation',
            },
            {
              ar: 'توفير مترجم لغة إشارة تلقائياً دون سؤاله لأن هذا هو الخيار الأمثل عادةً',
              en: 'Automatically provide a sign language interpreter without asking, as this is usually the best option',
            },
            {
              ar: 'كتابة ملخّص لكل ما يُقال على لوح أبيض بارز خلال الورشة ليتابع من يحتاج ذلك بالقراءة',
              en: 'Write a summary of everything said on a prominent whiteboard throughout the workshop so anyone who needs to can follow by reading',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'توفير مترجم إشارة تلقائياً قد يكون مفيداً لكنه افتراض قد يخطئ — ليس كل من يعاني من إعاقة سمعية يستخدم لغة الإشارة؛ بعضهم يفضّل الترجمة النصية الحية، وبعضهم الجلوس في موضع معيّن، وبعضهم لديه احتياجات مختلفة تماماً. التسجيل والكتابة على اللوح خيارات مفيدة لكنها لا تحلّ مشكلة المشاركة الفعلية اللحظية. السؤال المباشر والهادئ قبل الورشة هو الطريقة الوحيدة للعلم بما يُفيد هذا الشخص بالذات فعلاً.',
            en: 'Automatically providing a sign language interpreter may be helpful but it is an assumption that may be wrong — not everyone with a hearing impairment uses sign language; some prefer live text transcription, some a particular seating position, and some have entirely different needs. Recording and writing on the board are useful options but do not solve real-time participation. A direct, quiet question before the workshop is the only way to know what will actually help this specific person.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'ia-m4',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'الترتيبات التيسيرية', en: 'Reasonable Adjustments' },
      lede: {
        ar: 'الترتيب التيسيري الجيّد يُمكّن المشاركة بشكل عادي، لا يجعلها ملفتة ومحرجة.',
        en: 'A good reasonable adjustment enables participation normally, rather than making it conspicuous and awkward.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الترتيب التيسيري هو تعديل في طريقة تنظيم النشاط أو تقديمه يتيح لشخص معيّن أن يشارك بشكل كامل وفعّال. ليس استثناءً بطوليّاً، وليس معروفاً يُمنح، وليس تضحية من طرف المنظمة — هو إزالة عائق غير ضروري أو غير مقصود. ما يجعل الترتيب «معقولاً» هو أنه قابل للتطبيق دون أن يُغيّر طبيعة النشاط الجوهرية أو يُلقي عبئاً غير مناسب على بقية المشاركين أو الفريق. مثال ملموس: تمديد وقت إكمال مهمّة كتابية لمن يستخدم تقنية التحويل الصوتي للنص هو ترتيب معقول تماماً — لا يُغيّر الهدف التعليمي أو هدف النشاط، ويُزيل عائقاً تقنياً ظرفياً. مثال آخر: إرسال المواد قبل الجلسة بيومين لمن يحتاج وقتاً إضافياً لمعالجة المعلومات قبل المناقشة.',
            en: 'A reasonable adjustment is a change to how an activity is organised or delivered that allows a particular person to participate fully and effectively. It is not a heroic exception, not a favour granted, and not a sacrifice on the organisation\'s part — it is the removal of an unnecessary or unintended barrier. What makes an adjustment "reasonable" is that it can be applied without changing the core nature of the activity or placing an inappropriate burden on other participants or the team. A concrete example: extending the time to complete a written task for someone using voice-to-text technology is a completely reasonable adjustment — it does not change the learning or activity objective and removes a circumstantial technical barrier. Another: sending materials two days before the session for someone who needs extra time to process information before discussion.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'تقديم الترتيب بلا حرج يبدأ بكيفية السؤال. الفرق بين «هل عندك إعاقة تحتاج مساعدة بسببها؟» وبين «هل هناك أي شيء في طريقة تنظيم النشاط يمكننا تعديله ليجعل مشاركتك أكثر سهولةً وراحة؟» ليس مجرّد فرق في الصياغة — هو رسالة مختلفة جذرياً. الأولى تضع الشخص في موضع المحتاج وتطلب منه تعريف نفسه بإعاقته، والثانية تضع المسؤولية بوضوح على تصميم النشاط وتفتح الباب لطلبات لا تتعلّق بالإعاقة بالضرورة. والوقت المناسب للسؤال هو عند التسجيل، بشكل خاصّ وهادئ، لا في اللحظة الأولى أمام المجموعة ولا في يوم النشاط حين لا يتوفّر وقت لترتيب أي شيء جديد.',
            en: 'Offering an adjustment without embarrassment begins with how you ask. The difference between "Do you have a disability that needs help?" and "Is there anything in how the activity is organised that we could adjust to make your participation easier and more comfortable?" is not just a difference in wording — it is a fundamentally different message. The first places the person in the position of someone who needs help and asks them to identify themselves by their disability; the second places responsibility clearly on the activity design and opens the door to requests not necessarily related to disability. And the right time to ask is at registration, privately and quietly, not at the first moment in front of the group or on the day of the activity when there is no time to arrange anything new.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ كيف تعرض الترتيب', en: '✔ How to offer the adjustment' },
          noTitle: { ar: '✘ كيف لا تعرضه', en: '✘ How not to offer it' },
          yes: {
            ar: [
              'اسأل عند التسجيل بصيغة مفتوحة وغير طبّية: «هل ثمّة ما يجعل المشاركة أيسر لك؟»',
              'تعامل مع الإجابة بهدوء واحترافية كأي تفصيلة لوجستية أخرى تماماً',
              'نفّذ الترتيب المتّفق عليه بشكل طبيعي وهادئ دون الإشارة إليه أمام الآخرين',
              'تابع مع الشخص بعد فترة: «هل الترتيب يعمل كما تحتاج؟»',
            ],
            en: [
              'Ask at registration with an open, non-medical question: "Is there anything that would make participation easier for you?"',
              'Receive the answer calmly and professionally, as you would any other logistical detail',
              'Implement the agreed adjustment naturally and quietly without referring to it in front of others',
              'Follow up with the person after a while: "Is the adjustment working as you need?"',
            ],
          },
          no: {
            ar: [
              '«نحن لا نعتاد هذا، لكن سنحاول من أجلك تحديداً»',
              'الإعلان عن الترتيب أمام المجموعة دون إذن صريح من الشخص المعني',
              'انتظار الشخص حتى يطلب بنفسه دون أن تفتح له أي باب مسبقاً',
              'التعامل مع كل طلب كاستثناء يحتاج موافقة خاصة من جهات متعدّدة',
            ],
            en: [
              '"We do not normally do this, but we will try for you specifically"',
              'Announcing the adjustment to the group without the person\'s explicit permission',
              'Waiting for the person to request on their own without having opened any door in advance',
              'Treating every request as an exception requiring special approval from multiple parties',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'الترتيب لا يُذكر أمام الآخرين إلا بإذن صاحبه', en: 'The adjustment is not mentioned to others without the person\'s permission' },
          content: {
            ar: 'حتى الترتيب الجيّد والمفيد يتحوّل إلى إحراج حين يُذكر أمام الآخرين دون إذن الشخص. «سنعطي عمر وقتاً إضافياً لأنّ لديه...» — هذه الجملة تكشف معلومة صحية أو شخصية خاصة وتضع الشخص في موضع يبدو فيه مختلفاً عن الجميع بطريقة لم يختَرها. الترتيب يُنفَّذ بهدوء وبشكل طبيعي تماماً، ولا يُشار إليه أمام الآخرين إلا حين يختار الشخص نفسه أن يُفصح أو يشرح.',
            en: 'Even a good and helpful adjustment becomes an embarrassment when it is mentioned to others without the person\'s permission. "We will give Omar extra time because he has…" — that sentence discloses private health or personal information and places the person in a position of appearing different from everyone else in a way they did not choose. The adjustment is implemented quietly and completely naturally, and is not referred to in front of others unless the person themselves chooses to disclose or explain.',
          },
        },
        {
          type: 'quiz',
          id: 'ia-q4',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'في بداية ورشة عمل، أعلن المنسّق أمام المجموعة كلّها: «سنعطي ليلى خمس عشرة دقيقة إضافية في التمارين الكتابية لأنها تعاني من صعوبات في القراءة والكتابة.» ما المشكلة الأساسية في هذا التصرّف تحديداً؟',
            en: 'At the start of a workshop, the coordinator announced to the whole group: "We will give Layla fifteen extra minutes on the written exercises because she has reading and writing difficulties." What is the fundamental problem with this specific action?',
          },
          options: [
            {
              ar: 'أن خمس عشرة دقيقة غير كافية وكان يجب أن يكون الوقت الإضافي أطول من ذلك بحسب طبيعة الصعوبة لديها وطول التمارين الكتابية',
              en: 'That fifteen minutes is insufficient and the extra time should have been longer, depending on the nature of her particular difficulty and on the length of the written exercises',
            },
            {
              ar: 'أن الإعلان كشف معلومة شخصية خاصة دون إذنها وجعل الترتيب استثناءً ملفتاً ومحرجاً',
              en: 'That the announcement disclosed personal private information without her permission and made the adjustment a conspicuous and embarrassing exception',
            },
            {
              ar: 'أن الترتيبات التيسيرية من هذا النوع لا ينبغي تطبيقها في الورش عموماً',
              en: 'That adjustments of this type should not be applied in workshops in general',
            },
            {
              ar: 'أن المجموعة قد تشعر بعدم عدالة في طريقة تقييم الأداء بينهم',
              en: 'That the group may feel the performance assessment is unfair between them',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'منح الوقت الإضافي قرار صحيح تماماً ومناسب — المشكلة ليست القرار بل الإعلان عنه أمام الجميع. هذا يكشف صعوبة تعلّم شخصية دون إذن صاحبتها، ويضعها في موضع تبدو فيه مختلفة عن بقية المجموعة بشكل لم تختره. الترتيب الصحيح: يُتّفق عليه في التسجيل بشكل خاصّ، ويُطبَّق في الورشة دون إعلان، وليلى هي من تختار إن أرادت أن تشرح لأي شخص.',
            en: 'Granting extra time is an entirely correct and appropriate decision — the problem is not the decision but announcing it to everyone. This discloses a personal learning difficulty without her permission and places her in a position of appearing different from the group in a way she did not choose. The right approach: agree on it at registration privately, apply it in the workshop without announcement, and Layla is the one who chooses if she wants to explain to anyone.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'ia-m5',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: {
        ar: 'إشراك الفئات في القرار لا في التنفيذ فقط',
        en: 'Involving Different Groups in the Decision, Not Only in the Delivery',
      },
      lede: {
        ar: 'الإشراك الحقيقي يعني التأثير في القرار قبل أن يُتّخذ، لا الاستشارة بعد اتّخاذه.',
        en: 'Genuine involvement means influencing the decision before it is made, not being consulted after it is taken.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الفرق بين الإشراك والتزيين دقيق في الشكل لكنه حاسم في الأثر. الإشراك الحقيقي يعني أنّ الجماعة التي تُستشار تستطيع فعلاً أن تُغيّر ما سيحدث — أن ترى مقترحها يُنفَّذ، أو تسمع سبباً حقيقياً واضحاً حين لا يُنفَّذ. الإشراك الشكلي والرمزي هو أن تُدعى المجموعة إلى اجتماع بعد أن اتُّخذت كل القرارات الأساسية، أو أن تُسأل عن تفاصيل تنفيذ لا عن التوجّه العام. الشعور الذي يخرج به المشاركون من الإشراك الشكلي معروف جيّداً: وقتهم أُضيع وحكمتهم لم تُؤخَذ فعلاً بعين الاعتبار ورأيهم لم يكن مطلوباً لتغيير شيء بل لإضفاء شرعية على ما هو مقرّر مسبقاً. ولا تستطيع منظمة تُشرك الناس بهذه الطريقة أن تبني ثقة حقيقية معهم على المدى البعيد.',
            en: 'The difference between involvement and decoration is subtle in form but decisive in effect. Genuine involvement means the group being consulted can actually change what will happen — they see their suggestion implemented, or they hear a real clear reason when it is not. Tokenistic and symbolic involvement is inviting the group to a meeting after all the core decisions have been taken, or asking them about implementation details rather than the overall direction. The feeling participants leave tokenistic involvement with is well known: their time was wasted, their wisdom was not genuinely considered, and their opinion was not requested to change anything but to lend legitimacy to what was already decided. An organisation that involves people this way cannot build genuine trust with them over the long term.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'إشراك فئات مختلفة في القرار يتطلّب أكثر من مجرّد دعوتهم إلى الطاولة — يتطلّب أن تكون الطاولة نفسها مصمّمة بحيث يستطيعون الجلوس إليها والمشاركة بشكل كامل على قدم المساواة. هذا يعني اختيار أوقات مناسبة لمن سيُشارك لا لمن يُنظّم، وتوفير ترجمة حين تكون اللغة عائقاً، وتبسيط الوثائق والمقترحات حتى تكون مفهومة لمن ليس له خلفية متخصّصة في الموضوع، وإنشاء فضاءات يُمكن فيها التعبير بحرية وأمان دون أن يشعر أحد أن رأيه سيُستخدم ضدّه لاحقاً. ويعني أيضاً أن تُعطى المجموعات المستشارة وقتاً كافياً مسبقاً لدراسة الأمر والتشاور الداخلي بينهم قبل تقديم موقفهم، لا أن تُطلب منهم توصية فورية في جلسة سريعة لم يستعدّوا لها.',
            en: 'Involving different groups in the decision requires more than simply inviting them to the table — it requires that the table itself be designed so they can sit at it and participate fully on equal terms. This means choosing times that suit those who will participate rather than those who are organising, providing interpretation when language is a barrier, simplifying documents and proposals so they are understandable to those without specialist background in the subject, and creating spaces where views can be expressed freely and safely without anyone feeling their opinion will be used against them later. It also means giving the consulted groups sufficient time in advance to study the matter and consult internally among themselves before presenting their position, rather than requesting an instant recommendation in a quick session they had no chance to prepare for.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'حدّد سؤال القرار بدقة ووضوح: ليس «اجتمعنا لنسمعكم» بل «هذا هو ما نحتاج أن نقرّر، وهذه هي الخيارات المطروحة أمامنا»',
              'وزّع المواد والمقترحات مسبقاً بوقت كافٍ يسمح للناس بالتشاور مع مجتمعاتهم قبل اللقاء',
              'استخدم طرق تعبير متعدّدة ومتنوّعة: كتابة حرّة، حوار ثنائي، تصويت مجهول، قصص فردية — لأن الكلام العلني أمام الجميع لا يناسب الجميع',
              'وثّق ما قاله المشاركون بدقة أمانة واعرضه عليهم مرّة أخرى للتحقّق قبل صياغته رسمياً',
              'أخبر المشاركين في وقت لاحق بما تغيّر فعلاً بسبب رأيهم وما لم يتغيّر ولماذا، بشكل مباشر وصريح',
              'أشرِك ممثّلين دائمين مفوَّضين من مجتمعاتهم لا أشخاصاً مختارين بشكل فردي لمرّة واحدة فقط',
            ],
            en: [
              'Define the decision question precisely and clearly: not "we met to hear from you" but "this is what we need to decide, and these are the options before us"',
              'Distribute materials and proposals in advance with enough time for people to consult within their communities before the meeting',
              'Use multiple and varied forms of expression: free writing, paired conversation, anonymous voting, individual stories — because speaking publicly in front of everyone does not suit everyone',
              'Document what participants said accurately and faithfully, and show it back to them to verify before formally drafting it',
              'Tell participants afterwards what actually changed because of their input and what did not and why, directly and honestly',
              'Involve permanent representatives mandated by their communities rather than individuals selected once on a personal basis',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'الاستشارة بعد القرار ليست إشراكاً', en: 'Consultation after the decision is not involvement' },
          content: {
            ar: 'حين تُعقد اجتماعات «لاستشارة المجتمع» بشأن مشروع جاهزة تفاصيله وميزانيّته ووثائقه، يشعر الناس بذلك بسرعة — ولا يعودون في الغالب للمرّة الثانية ولا يوصون بالمشاركة لأحد. الإشراك الذي يأتي في مرحلة التصميم يُغيّر الخطط فعلاً؛ أما الإشراك الذي يأتي في مرحلة التسويق فيبيعها فقط. الفرق بين الأمرين يُقرّر إن كانت العلاقة بين المنظمة والمجتمع ستُبنى على ثقة حقيقية ومتبادلة أم على مجرّد مظهر المشاركة.',
            en: 'When meetings are held "to consult the community" about a project whose details, budget and documents are already complete, people sense this quickly — and they mostly do not return for a second time or recommend participation to anyone. Involvement that comes at the design stage actually changes plans; involvement that comes at the marketing stage only sells them. The difference between the two decides whether the relationship between the organisation and the community will be built on real mutual trust or merely on the appearance of participation.',
          },
        },
        {
          type: 'quiz',
          id: 'ia-q5',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'تخطّط المنظمة لإطلاق برنامج جديد يخدم النساء في حيٍّ معيّن. أيٌّ من المقاربات التالية يُمثّل الإشراك الحقيقي في القرار؟',
            en: 'The organisation is planning a new programme serving women in a particular neighbourhood. Which of the following represents genuine involvement in the decision?',
          },
          options: [
            {
              ar: 'تنظيم يوم افتتاح تُدعى إليه نساء من الحيّ بعد الانتهاء التام من تصميم البرنامج وإقراره',
              en: 'Holding a launch day to which women from the neighbourhood are invited after the programme design is fully complete and approved',
            },
            {
              ar: 'إجراء مشاورات مع ممثّلات من الحيّ في مرحلة التصميم قبل اتّخاذ أي قرارات جوهرية',
              en: 'Holding consultations with representatives from the neighbourhood at the design stage before any core decisions are made',
            },
            {
              ar: 'توزيع استبانة على النساء بعد إطلاق البرنامج لتقييم مدى رضاهن عن الخدمات المقدَّمة وتحسينها لاحقاً',
              en: 'Distributing a survey to women after the programme launches to assess their satisfaction with services delivered and improve them later',
            },
            {
              ar: 'إشراك ممثّلة واحدة من الحيّ في اجتماع اللجنة التوجيهية كضيفة مدعوّة',
              en: 'Including one representative from the neighbourhood in one committee meeting as an invited guest',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الاستشارة في مرحلة التصميم — قبل اتّخاذ القرارات الجوهرية — هي الإشراك الحقيقي لأن آراء النساء في هذه المرحلة قادرة فعلاً على تغيير الشكل النهائي للبرنامج بشكل جذري. الافتتاح والاستبانة بعد الإطلاق تقييم وتسويق لا إشراك. والضيفة الواحدة في اجتماع واحد رمزية بلا تأثير حقيقي — خاصةً إن جاءت بعد أن حسمت اللجنة الأساسيات.',
            en: 'Consulting during the design stage — before core decisions are made — is genuine involvement because at this stage the women\'s views can actually radically change the final shape of the programme. The launch event and the post-launch survey are evaluation and marketing, not involvement. One guest in one meeting is tokenism with no real influence — especially if she comes after the committee has settled the fundamentals.',
          },
        },
        {
          type: 'quiz',
          id: 'ia-q6',
          label: { ar: 'سيناريو حسّاس', en: 'A complex scenario' },
          question: {
            ar: 'في اجتماع تخطيط لبرنامج يخدم ثلاث مجتمعات متنوّعة، يُقترح أن يُمثَّل الجميع بشخص واحد يعرف المنطقة ويتحدّث باسمهم جميعاً لتوفير الوقت. ما المشكلة الجوهرية في هذا الاقتراح؟',
            en: 'In a planning meeting for a programme serving three diverse communities, it is proposed that everyone be represented by one person who knows the area and speaks for all of them, to save time. What is the fundamental problem with this proposal?',
          },
          options: [
            {
              ar: 'أن شخصاً واحداً لا يستطيع أن يُعبّر بدقة عن تنوّع حقيقي بين مجتمعات مختلفة، وغالباً لا يكون مفوَّضاً منها رسمياً',
              en: 'That one person cannot accurately represent real diversity across different communities, and is usually not formally mandated by them',
            },
            {
              ar: 'أن الاجتماعات تستغرق وقتاً أطول وتصبح أقل كفاءة حين يحضر ممثّلون متعدّدون',
              en: 'That meetings take longer and become less efficient when multiple representatives are present',
            },
            {
              ar: 'أن المجتمعات المختلفة لا ترحّب عموماً بمشاركة ممثّليها في اجتماعات مع منظمات من خارجها وتفضّل التعامل معها عبر وسيط واحد معروف',
              en: 'That different communities generally do not welcome their representatives participating in meetings with external organisations and prefer to deal with them through a single known intermediary',
            },
            {
              ar: 'أن هذا النهج يُكلّف المنظمة أكثر لوجستياً مقارنة بالبدائل المتاحة',
              en: 'That this approach costs the organisation more logistically compared to available alternatives',
            },
          ],
          correct: 0,
          feedback: {
            ar: 'الخطأ في الأساس: مجتمعات مختلفة لها احتياجات ومخاوف وأولويات متباينة ومتعدّدة، وشخص واحد لا يستطيع أن يُعبّر بدقة عن هذا التنوّع الحقيقي حتى لو كان صادق النية تماماً. والأخطر أن هذا الشخص في الغالب لم يُفوَّض رسمياً من تلك المجتمعات، مما يعني أن ما يُقدَّم باسم «صوت المجتمع» هو في حقيقته رأي فرد. الإشراك الحقيقي يعني التحدّث مع الناس أنفسهم وسماع أصواتهم المتعدّدة، لا التحدّث عنهم عبر وسيط لم يُختَر بطريقة تمثيلية.',
            en: 'The flaw is foundational: different communities have varied and multiple needs, concerns and priorities, and one person cannot accurately represent this real diversity even with completely honest intentions. More critically, this person is usually not formally mandated by those communities, which means what is presented as "the community\'s voice" is in reality one individual\'s opinion. Genuine involvement means talking with people themselves and hearing their multiple voices, not talking about them through an intermediary not chosen by a representative process.',
          },
        },
      ],
    },
  ],
};
