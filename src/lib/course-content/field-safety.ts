import type { CourseContent } from './types';

/**
 * Level 2 — Field Safety and Emergency Preparedness. Pass mark 80.
 *
 * Eighty because the subject is somebody else's survival, and a volunteer who
 * gets a fifth of this wrong is still standing at the door of an activity when
 * something goes wrong.
 *
 * Written around one idea that most safety training buries: the useful work
 * happens before the activity, not during it. A volunteer improvising during
 * an emergency is a volunteer whose team did not do the ten minutes of
 * thinking beforehand. So the risk assessment comes first and the emergency
 * response comes second, in that order, because that is the order in which
 * they actually decide the outcome.
 *
 * It is also deliberately clear about the limits of a volunteer's role. Most
 * harm to volunteers in the field comes from stepping into something they were
 * not trained for, with the best of intentions.
 */

export const fieldSafety: CourseContent = {
  slug: 'field-safety',
  level: 2,
  minutes: 25,
  passMark: 80,
  title: {
    ar: 'السلامة الميدانية والاستعداد للطوارئ',
    en: 'Field Safety and Emergency Preparedness',
  },
  lede: {
    ar: 'تقييم المخاطر قبل النشاط لا بعده، ونقطة تجمّع يعرفها الجميع، وحدود ما يجوز لمتطوّع غير مدرّب أن يتدخّل فيه.',
    en: 'Assessing risk before an activity rather than after, an assembly point everyone knows, and the limits of what an untrained volunteer may step into.',
  },
  outcomes: {
    ar: [
      'تُجري تقييم مخاطر مكتوباً قبل نشاط وتحدّد إجراء لكل خطر',
      'تضع خطة طوارئ فيها نقطة تجمّع ومسؤول سلامة وطريقة تواصل',
      'تنفّذ إجراء إخلاء وتعرف دورك فيه',
      'تتعرّف على الحالة التي يجب ألّا تتدخّل فيها، وتطلب المختص',
    ],
    en: [
      'Carry out a written risk assessment before an activity and assign an action to each risk',
      'Build an emergency plan with an assembly point, a safety lead and a way to communicate',
      'Carry out an evacuation and know your part in it',
      'Recognise the situation you must not step into, and call the person who should',
    ],
  },
  sources: [
    'IFRC — standards to facilitate the safety, security and well-being of volunteers',
    'IFRC Volunteering Policy (August 2022)',
    'UNDRR terminology on disaster risk reduction',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'assessment',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'تقييم المخاطر قبل النشاط', en: 'Assessing risk before the activity' },
      lede: {
        ar: 'عشر دقائق من التفكير قبل النشاط تساوي كل التدريب على الاستجابة أثناءه.',
        en: 'Ten minutes of thinking before an activity is worth all the response training during it.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الخطر ليس ما قد يحدث نظرياً، بل ما يمكن أن يحدث في هذا المكان بالذات مع هؤلاء الناس بالذات. سلّم بلا درابزين ليس خطراً متساوياً مع مجموعة بالغين وبثلاثين طفلاً. وشارع جانبي هادئ صباحاً ليس هو نفسه وقت خروج المدارس. التقييم الجيّد لا يعدّد المخاطر الممكنة — يرتّبها باحتمال وقوعها وحجم أذاها، ويعطي كل واحدة إجراءً باسم شخص.',
            en: 'A risk is not what could theoretically happen; it is what can happen in this particular place with these particular people. A staircase without a handrail is not the same risk with a group of adults as with thirty children. A quiet side street in the morning is not the same street when schools come out. A good assessment does not list possible dangers — it ranks them by how likely they are and how much harm they would do, and gives each one an action with a name attached.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'امشِ في المكان قبل النشاط بعينَي من سيستخدمه، لا بعينيك أنت',
              'اكتب كل خطر تراه، ولو بدا صغيراً — الصغير هو ما يُنسى ثم يقع',
              'ضع لكل خطر احتمالاً (نادر / ممكن / متوقّع) وأثراً (بسيط / متوسط / جسيم)',
              'ابدأ بما هو «متوقّع وجسيم»، ولا تنشغل بما هو «نادر وبسيط»',
              'اكتب إجراءً لكل خطر: ما الذي يُغيَّر، ومن يتولّاه، ومتى',
              'إن بقي خطر جسيم بلا إجراء ممكن، فالقرار هو تغيير المكان أو تأجيل النشاط',
            ],
            en: [
              'Walk the space beforehand through the eyes of whoever will use it, not your own',
              'Write down every risk you see, however small — the small ones are what get forgotten and then happen',
              'Give each a likelihood (rare / possible / expected) and an impact (minor / moderate / serious)',
              'Start with what is expected and serious; do not spend the meeting on rare and minor',
              'Write an action against each: what changes, who does it, by when',
              'If a serious risk is left with no workable action, the decision is to change the venue or postpone',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'الخطر الذي بلا إجراء ليس مُقيَّماً', en: 'A risk with no action has not been assessed' },
          content: {
            ar: 'أكثر تقييمات المخاطر فشلاً هي التي تنتهي بقائمة مخاطر مكتوبة وشعور بالارتياح لأنها كُتبت. كتابة «الشارع خطر» لا تفعل شيئاً؛ «سامر يقف عند البوابة من ٩:٤٥ حتى ١٠:١٥ ولا يخرج طفل من دون مرافق» تفعل. الفرق بين الاثنين هو الفرق بين التقييم والطمأنة الذاتية.',
            en: 'The risk assessments that fail most often are the ones that end in a written list and a feeling of reassurance because it was written. "The street is a hazard" does nothing; "Samer is at the gate from 09:45 to 10:15 and no child leaves unaccompanied" does. The difference between the two is the difference between assessing a risk and reassuring yourself.',
          },
        },
        {
          type: 'quiz',
          id: 'fs-q1',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'في تقييم مخاطر نشاط للأطفال، أيّ بند تعالجه أولاً؟',
            en: 'In a risk assessment for a children’s activity, which do you deal with first?',
          },
          options: [
            { ar: 'انقطاع الكهرباء أثناء النشاط — نادر، أثره بسيط', en: 'A power cut during the activity — rare, minor impact' },
            {
              ar: 'الباب المفتوح على شارع تمرّ فيه سيارات — متوقّع، أثره جسيم',
              en: 'A door opening onto a street with passing cars — expected, serious impact',
            },
            { ar: 'نقص عدد الكراسي — متوقّع، أثره بسيط', en: 'Not enough chairs — expected, minor impact' },
            { ar: 'زلزال — نادر جداً، أثره جسيم', en: 'An earthquake — very rare, serious impact' },
          ],
          correct: 1,
          feedback: {
            ar: 'الترتيب باحتمال الوقوع مضروباً بالأثر. الزلزال جسيم لكنه نادر جداً ولا تملك إجراءً يغيّر احتماله — تملك فقط خطة إخلاء تخدم كل الحالات. والكراسي متوقّعة لكن أثرها إزعاج. الباب هو الوحيد الذي يجمع «سيحدث» و«قد يقتل»، وله إجراء بسيط وفعّال: شخص باسمه يقف هناك.',
            en: 'Ranking is likelihood multiplied by impact. An earthquake is serious but very rare, and you have no action that changes its likelihood — only an evacuation plan, which serves every case anyway. Chairs are expected but the impact is inconvenience. The door is the only one that combines "will happen" with "could kill", and it has a simple effective action: a named person standing there.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'plan',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'خطة الطوارئ', en: 'The emergency plan' },
      lede: {
        ar: 'خطة لا يعرفها إلا من كتبها ليست خطة.',
        en: 'A plan known only to whoever wrote it is not a plan.',
      },
      blocks: [
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'مسؤول السلامة', en: 'The safety lead' },
              text: {
                ar: 'شخص واحد باسمه لكل نشاط. تحت الضغط، أسوأ ما يحدث أن يقرّر الجميع معاً.',
                en: 'One named person per activity. Under pressure, the worst outcome is everyone deciding at once.',
              },
            },
            {
              title: { ar: 'نقطة التجمّع', en: 'The assembly point' },
              text: {
                ar: 'مكان محدّد خارج المبنى، يُقال للجميع قبل البدء، ويُعاد شرحه للأطفال بكلماتهم.',
                en: 'A specific place outside the building, told to everyone before the start, explained again to children in their own words.',
              },
            },
            {
              title: { ar: 'قائمة الحضور', en: 'The attendance list' },
              text: {
                ar: 'ورقة أو هاتف يخرج مع من يخرج. الإخلاء بلا قائمة لا يخبرك من بقي في الداخل.',
                en: 'A sheet or a phone that leaves with whoever leaves. An evacuation without the list cannot tell you who is still inside.',
              },
            },
          ],
        },
        {
          type: 'list',
          items: {
            ar: [
              'من يتّصل بخدمات الطوارئ — شخص واحد، حتى لا يظنّ كلٌّ أن غيره اتّصل',
              'من يبقى مع المصاب ومن يتولّى بقية المجموعة',
              'من يستقبل الإسعاف عند المدخل ويدلّه',
              'من يتواصل مع الأهالي، ومتى، وبأيّ صيغة',
              'أين أقرب مستشفى، ومسار الوصول إليه من هذا المكان بالذات',
            ],
            en: [
              'Who calls the emergency services — one person, so nobody assumes somebody else did',
              'Who stays with the injured person and who takes the rest of the group',
              'Who meets the ambulance at the entrance and directs it',
              'Who contacts families, when, and in what words',
              'Where the nearest hospital is, and the route to it from this particular place',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'وتُقال الخطة بصوت مسموع قبل بدء النشاط، في دقيقة واحدة: هذه نقطة التجمّع، وهذا مسؤول السلامة، وهذا من يتّصل. الدقيقة هذه هي الفرق بين فريق ينفّذ وفريق يتشاور وسط الضجيج. والأطفال يُخبرون أيضاً، بجملة واحدة يفهمونها: «إذا سمعتوا صفّارة، بنوقف كل شي وبنمشي مع [اسم] عالساحة.»',
            en: 'And the plan is said out loud before the activity starts, in one minute: this is the assembly point, this is the safety lead, this is who calls. That minute is the difference between a team that acts and a team that confers in the middle of the noise. The children are told too, in one sentence they can follow: "If you hear a whistle, we stop everything and walk with [name] to the yard."',
          },
        },
        {
          type: 'quiz',
          id: 'fs-q2',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'وقع حريق صغير في المطبخ الملحق بالقاعة. أنتم ثلاثة متطوّعين وخمسة وعشرون طفلاً. ما أول فعل؟',
            en: 'A small fire starts in the kitchen adjoining the hall. There are three of you and twenty-five children. What is the first action?',
          },
          options: [
            { ar: 'محاولة إطفائه بسرعة قبل أن يكبر', en: 'Try to put it out quickly before it grows' },
            {
              ar: 'إخراج الأطفال إلى نقطة التجمّع مع القائمة، ثم الاتصال بالطوارئ، ثم عدّهم',
              en: 'Get the children out to the assembly point with the list, then call emergency services, then count them',
            },
            { ar: 'الاتصال بالطوارئ أولاً ثم إخراج الأطفال', en: 'Call the emergency services first, then evacuate' },
            { ar: 'إخراج الأطفال وترك القائمة لأنها تؤخّر', en: 'Evacuate the children and leave the list behind, it only slows you down' },
          ],
          correct: 1,
          feedback: {
            ar: 'الإطفاء ليس دورك إلا إن كنت مدرّباً وكان الحريق في بدايته وطريق خروجك خلفك — وحتى حينها الأولوية للأطفال. والاتصال قبل الإخلاء يكلّف دقيقة يمكن أن تكون كل شيء؛ الطوارئ تُتّصل من نقطة التجمّع بينما الأطفال بأمان. والقائمة ليست ورقة إدارية: بدونها لا تعرف أن طفلاً بقي في الحمّام، وهو الاحتمال الذي يقتل. الترتيب: إخراج، ثم اتصال، ثم عدّ.',
            en: 'Fighting the fire is not your role unless you are trained, it is in its first moments, and your exit is behind you — and even then the children come first. Calling before evacuating costs a minute that can be everything; you call from the assembly point while the children are already safe. And the list is not an administrative sheet: without it you do not know a child stayed in the toilet, which is the possibility that kills. The order is: out, call, count.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'limits',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'حدود دورك', en: 'The limits of your role' },
      lede: {
        ar: 'أغلب ما يصيب المتطوّعين في الميدان يقع وهم يحاولون المساعدة في شيء لم يُدرَّبوا عليه.',
        en: 'Most harm that comes to volunteers in the field happens while they are trying to help with something they were not trained for.',
      },
      blocks: [
        {
          type: 'compare',
          yesTitle: { ar: '✔ ضمن دورك', en: '✔ Within your role' },
          noTitle: { ar: '✘ خارج دورك', en: '✘ Outside your role' },
          yes: {
            ar: [
              'تأمين المكان وإبعاد الناس عن الخطر',
              'الاتصال بالطوارئ وإعطاؤهم معلومات دقيقة',
              'البقاء مع المصاب والتحدّث إليه',
              'إبقاء بقية المجموعة بعيدة وهادئة',
              'استقبال الإسعاف ودلالته',
            ],
            en: [
              'Making the area safe and moving people away from danger',
              'Calling the emergency services and giving them accurate information',
              'Staying with the injured person and talking to them',
              'Keeping the rest of the group back and calm',
              'Meeting the ambulance and directing it',
            ],
          },
          no: {
            ar: [
              'تحريك مصاب يُشتبه بإصابة في الرقبة أو الظهر',
              'إعطاء دواء أو ماء لمصاب فاقد الوعي',
              'الدخول إلى مبنى يحترق أو مكان غير مستقرّ',
              'التدخّل في شجار أو موقف عنف جسدي',
              'محاولة إنقاذ شخص في الماء أو تحت ركام',
            ],
            en: [
              'Moving someone with a suspected neck or back injury',
              'Giving medicine or water to an unconscious person',
              'Entering a burning building or an unstable structure',
              'Intervening in a fight or a physically violent situation',
              'Attempting a rescue from water or from rubble',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'متطوّع مصاب يضاعف المشكلة', en: 'An injured volunteer doubles the problem' },
          content: {
            ar: 'حين تدخل مكاناً غير آمن لتنقذ أحداً، تتحوّل من شخص يستطيع طلب المساعدة إلى شخص يحتاجها — والفريق الذي كان عنده مصاب واحد صار عنده اثنان، أحدهما مسؤوليته. هذا ليس نقص شجاعة؛ هو أول ما يُدرَّس عليه المستجيبون المحترفون في العالم كلّه، ولهذا يبدأ كل بروتوكول بجملة «هل المكان آمن؟».',
            en: 'When you enter an unsafe place to save someone, you go from being a person who can call for help to a person who needs it — and a team with one casualty now has two, one of them its own responsibility. This is not a lack of courage; it is the first thing professional responders are taught everywhere, which is why every protocol opens with "is the scene safe?".',
          },
        },
        {
          type: 'quiz',
          id: 'fs-q3',
          label: { ar: 'سيناريو حسّاس', en: 'A difficult scenario' },
          scenario: {
            ar: 'سقط طفل عن جدار منخفض ويشتكي من ألم في رقبته. هو واعٍ ويتكلّم، والأرض باردة، والأهل سيصلون بعد قليل.',
            en: 'A child has fallen from a low wall and is complaining of neck pain. He is conscious and talking, the ground is cold, and his family will arrive shortly.',
          },
          question: { ar: 'ماذا تفعل؟', en: 'What do you do?' },
          options: [
            { ar: 'تحمله إلى مكان دافئ ومريح وتنتظر أهله', en: 'Carry him somewhere warm and comfortable and wait for his family' },
            {
              ar: 'تتركه حيث هو، تطمئنه وتطلب منه ألّا يتحرّك، تتّصل بالطوارئ، وتغطّيه من دون تحريك رأسه أو رقبته',
              en: 'Leave him where he is, reassure him and ask him not to move, call the emergency services, and cover him without moving his head or neck',
            },
            { ar: 'تجلسه ببطء وتتأكّد أنه يستطيع تحريك رقبته', en: 'Sit him up slowly and check that he can move his neck' },
            { ar: 'تنتظر أهله ليقرّروا، فهو ابنهم', en: 'Wait for his family to decide — he is their child' },
          ],
          correct: 1,
          feedback: {
            ar: 'الأول والثالث هما التصرّفان الأكثر شيوعاً وهما الأخطر: إصابة الرقبة قد تكون مستقرّة ويحوّلها التحريك إلى ضرر دائم، و«التأكّد أنه يستطيع تحريك رقبته» فحص طبّي لا يجوز أن تُجريه. والانتظار من دون اتصال يضيّع وقتاً لا يُعوَّض. تأمينه وعدم تحريكه والاتصال هي كل ما هو مطلوب منك — وهو أكثر مما يبدو.',
            en: 'The first and third are the commonest responses and the most dangerous: a neck injury may be stable, and moving him can turn it into permanent damage, while "checking he can move his neck" is a clinical examination you are not qualified to perform. Waiting without calling loses time that cannot be recovered. Keeping him still, keeping him safe, and calling is everything asked of you — and it is more than it looks.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'calling',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'الاتصال بالطوارئ', en: 'Calling the emergency services' },
      lede: {
        ar: 'مكالمة واحدة، وترتيب المعلومات فيها يقرّر متى يصل الإسعاف.',
        en: 'One call, and the order of the information in it decides when the ambulance arrives.',
      },
      blocks: [
        {
          type: 'ordered',
          items: {
            ar: [
              'أين أنت بالضبط: العنوان، وأقرب معلم معروف، والطابق إن وُجد',
              'ماذا حدث في جملة واحدة',
              'كم عدد المصابين، وأعمارهم تقريباً',
              'حالتهم: واعٍ أم لا، يتنفّس أم لا، ينزف أم لا',
              'رقمك أنت، ولا تُغلق قبل أن يُغلقوا',
            ],
            en: [
              'Exactly where you are: the address, the nearest known landmark, and the floor if there is one',
              'What happened, in one sentence',
              'How many are injured, and roughly what age',
              'Their condition: conscious or not, breathing or not, bleeding or not',
              'Your own number — and do not hang up before they do',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'المكان أولاً لا الحادث. إن انقطع الخطّ بعد الجملة الأولى، يستطيع الإسعاف أن يتحرّك إن عرف أين — ولا يستطيع شيئاً إن عرف ماذا حدث فقط. وهذا الترتيب هو ما يُنسى تحت الضغط، لأن الرغبة الطبيعية أن تبدأ بما هو أكثر إلحاحاً في نظرك.',
            en: 'Location before incident. If the line drops after your first sentence, an ambulance can move if it knows where — and can do nothing if it only knows what happened. That order is what gets forgotten under pressure, because the natural urge is to start with what feels most urgent to you.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'اعرف الأرقام قبل أن تحتاجها', en: 'Know the numbers before you need them' },
          content: {
            ar: 'أرقام الطوارئ والدفاع المدني والمستشفى الأقرب تُكتب في خطة كل نشاط وتُحفظ على هاتف أكثر من شخص في الفريق، لا على هاتف المنسّقة وحدها. البحث عن رقم أثناء حالة طارئة هو أسوأ لحظة للبحث عنه.',
            en: 'The emergency, civil defence and nearest-hospital numbers go into every activity plan and onto more than one person’s phone — not only the coordinator’s. Searching for a number during an emergency is the worst possible moment to be searching for it.',
          },
        },
        {
          type: 'quiz',
          id: 'fs-q4',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'بماذا تبدأ مكالمة الطوارئ؟',
            en: 'How do you begin an emergency call?',
          },
          options: [
            { ar: 'بوصف ما حدث بالتفصيل حتى يفهموا خطورته', en: 'By describing what happened in detail so they grasp how serious it is' },
            { ar: 'بموقعك بالضبط وأقرب معلم معروف', en: 'With your exact location and the nearest known landmark' },
            { ar: 'باسمك واسم الجمعية', en: 'With your name and the association’s name' },
            { ar: 'بعدد المصابين', en: 'With the number of casualties' },
          ],
          correct: 1,
          feedback: {
            ar: 'كل ما عدا الموقع يمكن أن يُقال بعد ثوانٍ، والموقع وحده هو ما لا يمكن تعويضه إن انقطع الخطّ. التفاصيل والاسم والعدد كلها تأتي بعده مباشرةً — لكن ترتيبها بعده لا قبله.',
            en: 'Everything but the location can be said seconds later, and the location alone is what cannot be recovered if the line drops. The detail, your name and the numbers all come immediately afterwards — but afterwards, not before.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'vulnerable',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'من يتأثّر أكثر في الطوارئ', en: 'Who is hit hardest in an emergency' },
      lede: {
        ar: 'خطة الإخلاء التي تصلح للجميع لا تصلح لأحد.',
        en: 'An evacuation plan that suits everybody suits nobody.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الإخلاء الذي يفترض أن كل من في القاعة يستطيع أن يسمع الإنذار ويمشي بسرعة نحو الباب يترك خلفه من لا يستطيع. الشخص على كرسي متحرّك، والطفل الذي لا يسمع، والمسنّة التي تمشي ببطء، والطفل الذي يخاف فيتجمّد بدل أن يجري — هؤلاء يحتاجون أن يكون لكلٍّ منهم شخص باسمه قبل أن يبدأ النشاط، لا أن يُلاحظ غيابهم عند نقطة التجمّع.',
            en: 'An evacuation that assumes everyone in the hall can hear the alarm and walk quickly to the door leaves behind the people who cannot. The wheelchair user, the child who does not hear, the older woman who walks slowly, the frightened child who freezes rather than runs — each of them needs a named person before the activity starts, not to be noticed missing at the assembly point.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'اسأل عند التسجيل إن كان أحد يحتاج مساعدة في الحركة أو السمع — واسأل بخصوصية لا أمام الجميع',
              'خصّص شخصاً باسمه لكل من يحتاج مرافقة، وأخبره قبل النشاط لا أثناءه',
              'اختر مكاناً بمخرج يصله كرسي متحرّك، أو غيّر المكان',
              'اجعل الإشارة مرئية ومسموعة معاً: صفّارة وإضاءة أو حركة يد متّفق عليها',
              'تذكّر أن الطفل الخائف يتجمّد ولا يجري — لا تفترض أنه سيتبع المجموعة',
            ],
            en: [
              'Ask at registration whether anyone needs help moving or hearing — and ask privately, not in front of everyone',
              'Assign a named person to anyone who needs accompanying, and tell them before the activity rather than during it',
              'Choose a venue with an exit a wheelchair can reach, or change the venue',
              'Make the signal both visible and audible: a whistle plus a light or an agreed hand signal',
              'Remember that a frightened child freezes rather than runs — do not assume they will follow the group',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'fs-q5',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'القاعة الوحيدة المتاحة في الطابق الثاني بلا مصعد، وبين المشاركين شابّ يستخدم كرسياً متحرّكاً. ما القرار؟',
            en: 'The only available hall is on the second floor with no lift, and one participant uses a wheelchair. What is the decision?',
          },
          options: [
            { ar: 'يُقام النشاط ويُخصَّص متطوّعان لحمله عند الحاجة', en: 'Hold the activity and assign two volunteers to carry him if needed' },
            {
              ar: 'يُغيَّر المكان — الحمل في حالة طوارئ خطر عليه وعلى من يحمله، والمكان الذي لا يستطيع أحد مغادرته وحده غير آمن له',
              en: 'Change the venue — carrying someone during an emergency endangers him and whoever carries him, and a place somebody cannot leave unaided is not safe for them',
            },
            { ar: 'يُقام النشاط ويُعتذر منه هذه المرّة', en: 'Hold the activity and leave him out this once' },
            { ar: 'يُقام النشاط في الطابق الثاني ويُنقل هو إلى الطابق الأرضي بنشاط منفصل', en: 'Hold it on the second floor and give him a separate activity on the ground floor' },
          ],
          correct: 1,
          feedback: {
            ar: 'الحمل خطّة تعتمد على وجود شخصين محدّدين ووقت كافٍ وسلّم سالك — ولا شيء من ذلك مضمون في حريق. والاعتذار منه إقصاء صريح. والنشاط المنفصل إقصاء بصيغة مهذّبة. المكان الذي لا يستطيع مشارك مغادرته بنفسه ليس مكاناً متاحاً له، والوصول ليس ترتيباً يُضاف بعد اختيار القاعة — هو أحد معايير اختيارها.',
            en: 'Carrying is a plan that depends on two specific people being there, enough time, and a clear staircase — none of which is guaranteed in a fire. Leaving him out is plain exclusion. A separate activity is exclusion with better manners. A venue a participant cannot leave unaided is not accessible to them, and access is not an arrangement added after the hall is chosen — it is one of the criteria for choosing it.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 6
    {
      id: 'after',
      tag: { ar: 'الوحدة السادسة', en: 'Module 6' },
      title: { ar: 'بعد الحادث', en: 'After the incident' },
      lede: {
        ar: 'ما يحدث في الساعة التالية يقرّر هل تتكرّر الحادثة أم لا.',
        en: 'What happens in the following hour decides whether it happens again.',
      },
      blocks: [
        {
          type: 'ordered',
          items: {
            ar: [
              'تأكّد أن الجميع بأمان وأن أحداً لم يبقَ من دون أن يُسأل عنه',
              'أبلغ المنسّقة فوراً، ولو انتهى الأمر على خير',
              'اكتب تقرير الحادث في اليوم نفسه بالوقائع والاقتباسات',
              'تواصل مع أهل من تأثّر بصيغة متّفق عليها، لا بمبادرة فردية',
              'اجلس مع الفريق ولو عشر دقائق: ماذا حدث، وما الذي نجح، وما الذي كان ناقصاً',
              'عدّل تقييم المخاطر للنشاط القادم بناءً على ما تعلّمتموه',
            ],
            en: [
              'Confirm everyone is safe and nobody has been left unaccounted for',
              'Tell the coordinator immediately, even if it ended well',
              'Write the incident report the same day, with facts and quotations',
              'Contact the families of anyone affected in agreed wording, not on individual initiative',
              'Sit with the team for even ten minutes: what happened, what worked, what was missing',
              'Change the risk assessment for the next activity based on what you learned',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'الحادث الذي لم يقع', en: 'The incident that did not happen' },
          content: {
            ar: 'الطفل الذي كاد يخرج إلى الشارع ولم يخرج، والسلك الذي كاد يوقع أحداً، والباب الذي وُجد مفتوحاً — هذه أهمّ من الحوادث الفعلية، لأنها تحذير مجّاني. المنظمات التي توثّق «ما كاد يحدث» تصلح الأشياء قبل أن تكلّف أحداً شيئاً؛ والتي لا توثّقه تكتشف الخلل من الحادثة نفسها.',
            en: 'The child who nearly got into the street and did not, the cable that nearly tripped someone, the door found open — these matter more than actual incidents, because they are a free warning. Organisations that record near misses fix things before they cost anybody anything; those that do not learn about the fault from the incident itself.',
          },
        },
        {
          type: 'quiz',
          id: 'fs-q6',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'انفتح باب الشارع أثناء النشاط ولاحظه متطوّع فأغلقه قبل أن يقترب أحد. هل يُبلَّغ؟',
            en: 'The street door came open during an activity and a volunteer noticed and shut it before anyone approached. Is it reported?',
          },
          options: [
            { ar: 'لا — لم يقع شيء ولا داعي لإثارة قلق', en: 'No — nothing happened and there is no need to worry anyone' },
            {
              ar: 'نعم — يُسجَّل كـ«ما كاد يحدث»، لأنه يعني أن الإجراء المتّفق عليه لم يُنفَّذ وسيتكرّر',
              en: 'Yes — it is logged as a near miss, because it means the agreed action was not carried out and will not be next time either',
            },
            { ar: 'يُذكر شفهياً في نهاية اليوم إن تذكّره أحد', en: 'Mention it verbally at the end of the day if somebody remembers' },
            { ar: 'يُبلَّغ فقط إن تكرّر مرّة ثانية', en: 'Report it only if it happens a second time' },
          ],
          correct: 1,
          feedback: {
            ar: 'الباب المفتوح يعني أن أحداً لم يقف حيث اتُّفق أن يقف، أو أن الإجراء لم يكن واضحاً أصلاً. الحظّ وحده هو ما فصل بين هذا وبين حادثة. والانتظار حتى يتكرّر يعني انتظار المرّة التي لا يلاحظها أحد. تسجيله يستغرق سطرين ويمنع الحادثة الحقيقية.',
            en: 'An open door means somebody was not standing where it was agreed they would, or the action was never clear in the first place. Only luck separated this from an incident. Waiting for a repeat means waiting for the time nobody notices. Logging it takes two lines and prevents the real thing.',
          },
        },
      ],
    },
  ],
};
