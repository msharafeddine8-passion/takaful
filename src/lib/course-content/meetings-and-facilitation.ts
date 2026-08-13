import type { CourseContent } from './types';

/**
 * Level 4 — Meetings and Facilitation. Pass mark 70.
 *
 * The premise is simple: most meetings fail before they start, because nobody
 * agreed what they were for. A facilitator who knows why the group is in the
 * room, who holds the pen at the end, and who notices the person who has said
 * nothing for twenty minutes — that facilitator leaves with decisions. Everyone
 * else leaves with a list of things to discuss again next time.
 *
 * The community session module is here because volunteering happens with people,
 * not for them, and the skills that work around a staff table need adjusting
 * when the room is full of people with different levels of power, different
 * reasons to be cautious, and no obligation to come back.
 */

export const meetingsAndFacilitation: CourseContent = {
  slug: 'meetings-and-facilitation',
  level: 4,
  minutes: 35,
  passMark: 70,
  title: {
    ar: 'إدارة الاجتماعات والتيسير',
    en: 'Meetings and Facilitation',
  },
  lede: {
    ar: 'اجتماع له هدف وجدول ووقت ينتهي فيه — وكيف تمنع شخصاً واحداً من احتلال الغرفة، وكيف تخرج بقرارات لا بانطباعات.',
    en: 'A meeting with a purpose, an agenda and an end time — how to stop one person occupying the room, and how to leave with decisions rather than impressions.',
  },
  outcomes: {
    ar: [
      'تحدّد هدف الاجتماع وتكتب جدول أعمال يخدمه',
      'تُيسّر نقاشاً يشارك فيه الصامتون ولا يحتكره أحد',
      'تلخّص القرارات وتوزّع المهام قبل انتهاء الاجتماع',
      'تُيسّر جلسة مجتمعية بقواعد يتّفق عليها الحاضرون',
    ],
    en: [
      'Set a meeting\'s purpose and write an agenda that serves it',
      'Facilitate a discussion where quiet people speak and nobody monopolises',
      'Summarise decisions and assign actions before the meeting ends',
      'Facilitate a community session under ground rules the room agrees to',
    ],
  },
  sources: [
    'IFRC — Facilitation Fundamentals for Volunteers and Community Engagement',
    'UN Volunteers — Participatory Facilitation Handbook',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'mf-purpose',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'هدف الاجتماع وجدول الأعمال', en: 'Meeting Purpose and Agenda' },
      lede: {
        ar: 'الاجتماع الذي لا يعرف أحد سبب انعقاده ينتهي بأن يعرف الجميع سبب ضياع وقتهم.',
        en: 'A meeting nobody knows the reason for ends with everyone knowing why their time was wasted.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'قبل أن تُرسل دعوة اجتماع، اسأل نفسك سؤالاً واحداً: ما الذي يجب أن يكون صحيحاً في نهاية هذا الاجتماع ولم يكن صحيحاً في بدايته؟ إذا لم تستطع الإجابة بجملة واحدة واضحة، فأنت لا تحتاج اجتماعاً — تحتاج إما رسالة بريد إلكتروني أو قراراً تتّخذه أنت وحدك أو محادثة فردية مع الشخص المعنيّ. الاجتماعات مكلفة بمعنى حرفي: إن جمعت عشرة أشخاص لساعة، دفعت عشر ساعات عمل لا تعود. لذا فإن أي اجتماع لا يحقّق شيئاً لا يمكن تحقيقه بطريقة أخرى هو في الحقيقة قرار بإهدار وقت الآخرين.',
            en: 'Before you send a meeting invitation, ask yourself one question: what should be true at the end of this meeting that was not true at the start? If you cannot answer that in one clear sentence, you do not need a meeting — you need either an email, a decision you can make yourself, or a one-to-one conversation with the person involved. Meetings are literally costly: gather ten people for an hour and you spend ten working hours that do not come back. Any meeting that achieves nothing that could not be achieved another way is a decision to waste other people\'s time.',
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'بند جدول مقابل هدف', en: 'Agenda item versus objective' },
          content: {
            ar: '«مناقشة الميزانية» هو بند جدول. «الاتفاق على الميزانية المقترحة أو تعديلها وإرسالها للمراجعة بحلول نهاية الجلسة» هو هدف. الفرق ليس لغوياً: البند يُغلق حين ينتهي الوقت، والهدف يبقى مفتوحاً حتى يتحقّق. الاجتماعات التي تُدار ببنود تنتهي بقوائم؛ الاجتماعات التي تُدار بأهداف تنتهي بقرارات.',
            en: '"Discuss the budget" is an agenda item. "Agree on the proposed budget or amend it and send it for review by the end of the session" is an objective. The difference is not linguistic: an item closes when time is up, an objective stays open until it is achieved. Meetings run on items end in lists; meetings run on objectives end in decisions.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'اكتب هدف الاجتماع في جملة فعلية — «نقرّر» أو «نتّفق» أو «نحدّد» — لا اسمية',
              'رتّب البنود: ما يحتاج قراراً يأتي أولاً حين العقول صافية، ما يحتاج معلومة فقط يأتي أخيراً',
              'أضف وقتاً لكل بند — وقتاً حقيقياً، لا وقتاً متفائلاً',
              'أرسل الجدول قبل الاجتماع بوقت كافٍ لكي يقرأه الناس',
              'احتفظ بخمس دقائق في نهاية الاجتماع لتلخيص القرارات وتوزيع المهام',
            ],
            en: [
              'Write the meeting objective as a verb phrase — "decide", "agree", "identify" — not a noun',
              'Order items: what needs a decision comes first when minds are fresh, what needs only information comes last',
              'Add time to each item — realistic time, not optimistic time',
              'Send the agenda before the meeting with enough time for people to read it',
              'Reserve five minutes at the end to summarise decisions and assign tasks',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'جدول الأعمال ليس بروتوكولاً ولا إجراءً شكلياً — هو عقد ضمني مع كل من في الغرفة: هذا ما نحاول تحقيقه، وهذا ما ستتركه خلفك بعد ساعة من الآن. حين يعرف الناس قبل الاجتماع ما يُتوقّع منهم الوصول إليه، يأتون وقد فكّروا مسبقاً، وتختصر ثلاثين دقيقة من الشرح والبسط. وحين تنتهي كل فقرة وتسأل «هل حقّقنا هدف هذا البند؟» بدل «هل انتهى الوقت؟»، تبقى في المسار. الجدول ليس قفصاً تُحبس فيه — بل هو الطريق الذي يجعل كل انحراف عنه ملحوظاً.',
            en: 'An agenda is not a protocol or a formality — it is an implied contract with everyone in the room: this is what we are trying to achieve, and this is what you will leave behind in an hour. When people know before the meeting what they are expected to arrive at, they come having already thought, and you skip thirty minutes of explanation. When each section ends and you ask "have we achieved the objective for this item?" rather than "has the time run out?", you stay on course. An agenda is not a cage — it is the path that makes every deviation from it visible.',
          },
        },
        {
          type: 'quiz',
          id: 'mf-q1',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'اجتماع مقرّر لساعة ونصف لفريق من ثمانية أشخاص. أيّ الجداول الأعمال التالية يخدم الهدف أكثر؟',
            en: 'A ninety-minute meeting for a team of eight. Which of the following agendas serves the purpose better?',
          },
          options: [
            {
              ar: 'تحديثات من كل شخص (٣٠ د) — نقاش التقرير (٣٠ د) — أسئلة ومتفرّقات (٣٠ د)',
              en: 'Updates from each person (30 min) — Discussion of the report (30 min) — Questions and miscellaneous (30 min)',
            },
            {
              ar: 'الاتفاق على خطة الشهر القادم (٤٥ د) — مراجعة ميزانية الربع الأول واتخاذ قرار بشأن البند الثالث (٣٠ د) — تحديث سريع عن النشاطات الجارية (١٥ د)',
              en: 'Agree on next month\'s plan (45 min) — Review Q1 budget and decide on item 3 (30 min) — Quick update on ongoing activities (15 min)',
            },
            {
              ar: 'اجتماع مفتوح — كل شخص يطرح ما يراه مهمّاً',
              en: 'Open meeting — each person raises whatever they think is important',
            },
            {
              ar: 'عرض تقديمي من المنسّق ثم نقاش حر',
              en: 'Presentation from the coordinator followed by open discussion',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الجدول الثاني يبدأ بفعل — «الاتفاق»، «مراجعة واتخاذ قرار» — ويعطي كل بند وقتاً محدّداً. الجدول الأول مليء بكلمات ضبابية: «نقاش» و«متفرّقات» لا تخبرك ماذا سيتحقّق. الاجتماع المفتوح بلا هدف مصيره إما الفوضى أو احتكاره من الصوت الأعلى. والعرض التقديمي وحده يحوّل الاجتماع إلى محاضرة.',
            en: 'The second agenda begins with verbs — "agree", "review and decide" — and gives each item a specific time. The first is full of vague words: "discussion" and "miscellaneous" tell you nothing about what will be achieved. An open meeting without an objective ends either in chaos or in domination by the loudest voice. A presentation alone turns the meeting into a lecture.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'mf-facilitator',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'دور الميسّر', en: 'The Facilitator\'s Role' },
      lede: {
        ar: 'الميسّر لا يملك الاجتماع ولا يملك الإجابة — يملك العملية التي تصل بالآخرين إلى إجابتهم.',
        en: 'The facilitator does not own the meeting or the answer — they own the process that brings others to theirs.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الخلط الأكثر شيوعاً في الاجتماعات هو أن تتولّى الشخص الأكثر معرفة بالموضوع تيسير النقاش. حين يفعل ذلك، ينزلق بسرعة من التيسير إلى التأثير — وكلّ سؤال يطرحه محمّل بما يريد سماعه، وكل ملخّص يميل نحو موقفه. التيسير دور منفصل عن دور صاحب المحتوى. الميسّر يخدم العملية؛ الخبير يخدم المحتوى. وحين يكونان شخصاً واحداً يحتاج أن يُفصح عن ذلك للغرفة: «أنا أيسّر هذا النقاش، وأنا أيضاً من سيعطيكم الأرقام في الجزء الثاني — سأوضح متى أتحوّل من الدور إلى الدور».',
            en: 'The most common mistake in meetings is assigning the person who knows the most about the topic to facilitate the discussion. When they do, they quickly slide from facilitation to influence — every question they ask carries what they want to hear, and every summary leans toward their position. Facilitation is a separate role from the role of content owner. The facilitator serves the process; the expert serves the content. When they are the same person that needs to be declared to the room: "I am facilitating this discussion, and I am also the one who will give you the numbers in the second part — I will say clearly when I switch from one role to the other."',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'حارس العملية', en: 'Process guardian' },
              text: {
                ar: 'يتأكّد أن النقاش يسير نحو هدفه، يضبط الوقت، يعيد الجماعة إلى المسار حين تنحرف — بدون أن يقرّر نيابةً عنها.',
                en: 'Ensures the discussion moves toward its objective, manages time, returns the group to track when it drifts — without deciding on its behalf.',
              },
            },
            {
              title: { ar: 'صانع الفضاء', en: 'Space maker' },
              text: {
                ar: 'يفتح المجال لمن لم يتكلّم، ويُبطئ من يتكلّم كثيراً — ليس بقطعه، بل بتحويل الدور بسلاسة.',
                en: 'Opens space for whoever has not spoken, and slows down whoever speaks a great deal — not by cutting them off, but by redirecting smoothly.',
              },
            },
            {
              title: { ar: 'سامع الغرفة', en: 'Room listener' },
              text: {
                ar: 'يقرأ ما لم يُقَل: الجسد المنسحب، الصمت بعد رأي مثير للجدل، التوتّر بين شخصين — ويُسمّيه بحذر.',
                en: 'Reads what was not said: the disengaged body, the silence after a controversial opinion, the tension between two people — and names it carefully.',
              },
            },
          ],
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ الميسّر الفعّال', en: '✔ Effective facilitator' },
          noTitle: { ar: '✘ الميسّر الملتبس', en: '✘ Confused facilitator' },
          yes: {
            ar: [
              'يطرح أسئلة تفتح النقاش: «ما رأيكم في هذا؟» «هل هناك وجهة نظر أخرى؟»',
              'يلخّص ما سمعه بدقة ويسأل «هل فهمت صح؟»',
              'يُوزّع وقت الكلام بوعي بين المشاركين',
              'يُفصح حين يتحوّل من الميسّر إلى صاحب رأي',
              'يُنهي كل بند بملخّص واضح وسؤال «هل اتّفقنا؟»',
            ],
            en: [
              'Asks questions that open discussion: "What do you think?" "Is there another perspective?"',
              'Summarises what was heard accurately and asks "Did I understand correctly?"',
              'Distributes speaking time consciously among participants',
              'Declares when switching from facilitator to opinion-holder',
              'Closes each item with a clear summary and the question "Do we agree?"',
            ],
          },
          no: {
            ar: [
              'يعلّق على كل رأي بموافقة أو معارضة ضمنية',
              'يلخّص النقاش ويُقدّم ملخّصه باتجاه يخدم رأيه',
              'يُعطي أشخاصاً بعينهم وقتاً أطول بشكل منتظم',
              'يُغلق البند قبل أن يتّضح أن القرار اتُّخذ',
              'يُجيب على أسئلة الميسّر بنفسه قبل أن يمنح الغرفة فرصة',
            ],
            en: [
              'Comments on each opinion with implicit agreement or disagreement',
              'Summarises the discussion in a direction that serves their own view',
              'Regularly gives certain people more time than others',
              'Closes an item before it is clear a decision was reached',
              'Answers facilitation questions themselves before giving the room a chance',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'الحياد لا يعني غياب الحضور', en: 'Neutrality does not mean absence' },
          content: {
            ar: 'الميسّر المحايد ليس الميسّر الغائب. الحياد يعني عدم التحيّز لرأي بعينه — لا عدم المبادرة. الميسّر الفعّال يتدخّل باستمرار: يُوقف الانحراف عن الموضوع، يُعيد صياغة سوء الفهم، يُسمّي التوتّر الذي يمنع النقاش من التقدّم. الميسّر الغائب ليس محايداً — هو يترك المجال لمن يملأه.',
            en: 'A neutral facilitator is not an absent one. Neutrality means not favouring a particular opinion — not avoiding initiative. An effective facilitator intervenes constantly: stops drift off topic, reframes misunderstandings, names the tension that is blocking the discussion from moving forward. An absent facilitator is not neutral — they are leaving the space for whoever fills it.',
          },
        },
        {
          type: 'quiz',
          id: 'mf-q2',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'أنت تيسّر اجتماعاً وأحد الحاضرين الكبار خبرةً قال رأياً وجاء الصمت التام بعده. لا أحد يردّ. ماذا تقول؟',
            en: 'You are facilitating a meeting and one of the most senior people present stated an opinion, followed by complete silence. Nobody responds. What do you say?',
          },
          options: [
            {
              ar: '«شكراً، هذا واضح. ننتقل للبند التالي.»',
              en: '"Thank you, that is clear. We move to the next item."',
            },
            {
              ar: '«هل هناك من يريد أن يضيف شيئاً أو يطرح وجهة نظر مختلفة؟»',
              en: '"Is there anyone who would like to add something or offer a different perspective?"',
            },
            {
              ar: '«أعتقد أن الجميع متّفق — هل نصوّت؟»',
              en: '"I think everyone agrees — shall we vote?"',
            },
            {
              ar: '«ما رأيك أنتَ، أنتَ صامت منذ البداية؟» — موجّهاً السؤال لأحد الصامتين',
              en: '"What do you think, you have been quiet since the start?" — directing the question at one of the quiet people',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الصمت بعد رأي من شخص أكبر خبرةً غالباً لا يعني اتفاقاً — يعني أن الناس يحسبون تكلفة المعارضة. التحرّك إلى البند التالي يُقرّ الرأي دون نقاش. افتراض الاتفاق هو ما يصنع قرارات الغرفة الصامتة التي لا يلتزم بها أحد لاحقاً. توجيه السؤال لشخص بعينه أمام الجميع يضعه في موقف محرج. السؤال المفتوح للغرفة كلّها هو الطريق الوحيد الذي يصنع فضاءً حقيقياً.',
            en: 'Silence after a senior person\'s opinion usually does not mean agreement — it means people are calculating the cost of disagreeing. Moving to the next item endorses the view without discussion. Assuming agreement is how you make silent-room decisions that nobody later honours. Directing the question at a specific person in front of everyone puts them in an awkward position. An open question to the whole room is the only path that creates genuine space.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'mf-inclusion',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'إشراك الجميع وضبط الهيمنة', en: 'Inclusion and Managing Dominance' },
      lede: {
        ar: 'الاجتماع الذي يتكلّم فيه شخصان فقط لم يُفَدْ بعقول الآخرين ولم يحظَ بالتزامهم.',
        en: 'A meeting in which only two people speak has not drawn on anyone else\'s thinking or earned their commitment.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الصمت في الاجتماع له أسباب كثيرة ولا يشترط أن يكون واحداً منها الاتفاق. الشخص الجديد في الفريق يصمت لأنه لا يعرف ما إذا كان رأيه مرحَّباً به. المرأة في غرفة ذكورية تصمت لأن تجربتها علّمتها أن الكلام مكلف. الشخص الذي جرّب الاختلاف في اجتماع سابق وقُطع أو أُهمل رأيه يصمت. والشخص الذي ما زال يفكّر يصمت لأنه يحتاج وقتاً أطول مما تُفسح له العملية السريعة. الميسّر الذي لا يرى هذه الأسباب يظنّ أن الغرفة متجانسة ويخطئ في قراءة نبضها.',
            en: 'Silence in a meeting has many causes and agreement need not be one of them. A new team member stays quiet because they do not know whether their opinion is welcome. A woman in a male-dominated room stays quiet because experience has taught her that speaking is costly. The person who disagreed in a previous meeting and was cut off or ignored stays quiet. And the person who is still thinking stays quiet because they need more time than a fast-moving process allows. A facilitator who does not see these causes thinks the room is unified and misreads its pulse.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'قبل النقاش: أعطِ دقيقتين للتفكير الفردي الصامت — يُساوي الدخول بين من يفكّر بصوت عالٍ ومن يحتاج هدوءاً',
              'اطرح السؤال أولاً، وانتظر خمس ثوانٍ قبل أن تدعو أحداً للكلام — الصمت الأولي ليس فشلاً، هو تفكير',
              'استخدم الجولة الدورية: «سنسمع من كل شخص جملة واحدة عن هذا البند» — لا أحد يستطيع إغراق الجولة',
              'تابع من كتب ملاحظة ثم توقّف: «لاحظت أنك تكتب — هل تريد إضافة شيء؟»',
              'لا توجّه السؤال لشخص صامت أمام الجميع فجأة — تواصل معه قبل الاجتماع إن كنت تعرف أن لديه رأياً',
              'اجعل المداخلة الجانبية مشروعة: «لو كان عندكم ما لم يُقَل في الاجتماع — الباب مفتوح بعده بعشر دقائق»',
            ],
            en: [
              'Before discussion: give two minutes for silent individual thinking — it levels the field between those who think aloud and those who need quiet',
              'Pose the question first and wait five seconds before inviting anyone to speak — initial silence is not failure, it is thinking',
              'Use a round: "We will hear from each person, one sentence on this item" — nobody can flood a round',
              'Follow up with someone who was writing notes then stopped: "I noticed you were writing — do you want to add something?"',
              'Do not direct a question at a quiet person in front of everyone suddenly — contact them before the meeting if you know they have a view',
              'Make the side conversation legitimate: "If there is something you did not say in the meeting — the door is open for ten minutes afterwards"',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الشخص الذي يحتكر الكلام في الاجتماع لا يحتكره في الغالب بنيّة سيئة — يحتكره لأن الفضاء متاح له ولأن أحداً لا يُقيّد الدخول. مهمّة الميسّر ليست إسكاته بل تحويل الدور بسلاسة: «شكراً لك — هل هناك من لم يسمع صوته بعد؟» أو «سمعنا عدة مرات وجهة نظر مهمّة من هذه الجهة — ما الجهة الأخرى؟». والتقنية الأفعل حين يطول الكلام هي الاتفاق المسبق على قاعدة واضحة تنطبق على الجميع: «كل مداخلة لا تتجاوز دقيقتين — وبعدها أفتح المجال لغيرك». القاعدة التي يتّفق عليها الجميع قبل النقاش ليست عقوبة لأحد — هي عقد جماعي يجعل الميسّر قادراً على تطبيقها دون توتّر.',
            en: 'A person who dominates a meeting usually does not do so with bad intent — they do so because the space is available to them and nobody is managing entry. The facilitator\'s job is not to silence them but to redirect smoothly: "Thank you — is there anyone whose voice we have not heard yet?" or "We have heard an important perspective several times from this direction — what does the other direction say?" The most effective technique when someone speaks at length is a prior agreement on a clear rule that applies to everyone: "Each contribution is no longer than two minutes — then I open the floor to someone else." A rule the whole room agrees to before discussion is not a punishment for anyone — it is a collective contract that lets the facilitator apply it without tension.',
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'الصوت الأعلى ليس الأصوب', en: 'The loudest voice is not the most correct' },
          content: {
            ar: 'الاجتماع الذي تسيطر عليه شخصية واحدة يُنتج قرارات بمدخلات محدودة، وغالباً التزاماً أقلّ من باقي الفريق. الناس لا يلتزمون بقرارات يشعرون أن أحداً اتّخذها نيابةً عنهم. الاستماع لا يعني التباطؤ — يعني أن القرار الذي تصل إليه بعد سماع الغرفة أقوى وأكثر واقعية من الذي تصل إليه بعد سماع صوت واحد.',
            en: 'A meeting dominated by one personality produces decisions with limited input, and usually less commitment from the rest of the team. People do not honour decisions they feel were made by someone on their behalf. Listening is not slowing down — it means the decision you reach after hearing the room is stronger and more realistic than the one you reach after hearing one voice.',
          },
        },
        {
          type: 'quiz',
          id: 'mf-q3',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'أحد المشاركين تكلّم في كل بند من بنود الجدول ومداخلاته تطول، وهناك ثلاثة أشخاص لم يتكلّموا بعد. كيف تتدخّل؟',
            en: 'One participant has spoken on every agenda item at length, and three people have not spoken at all yet. How do you intervene?',
          },
          options: [
            {
              ar: 'تنتظر حتى ينتهي ثم تسأل بشكل عام «هل هناك تعليقات أخرى؟»',
              en: 'Wait until they finish and then ask generally "Are there other comments?"',
            },
            {
              ar: 'تقطعه في منتصف الكلام وتعطي الكلام لشخص آخر',
              en: 'Cut them off mid-sentence and hand the floor to someone else',
            },
            {
              ar: 'تشكره على مداخلته وتقول «أريد أن نسمع ممّن لم يتكلّم بعد — سنعمل جولة سريعة جملة من كل شخص»',
              en: 'Thank them for their contribution and say "I want to hear from those who have not spoken yet — we will do a quick round, one sentence from each person"',
            },
            {
              ar: 'تتحدّث إليه على انفراد أثناء الاجتماع وتطلب منه التوقّف',
              en: 'Speak to them privately during the meeting and ask them to stop',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'السؤال العام «هل هناك تعليقات» يُتيح للمهيمن الردّ أولاً مرة أخرى. القطع في المنتصف مُحرج ويخلق توتراً. الحديث الجانبي أثناء الاجتماع مُلفت وغير مناسب. الشكر والانتقال إلى الجولة يُحترم فيه الشخص وفي نفس الوقت يُوزّع الفضاء — والجولة تنطبق على الجميع فلا تبدو عقوبة شخصية.',
            en: 'The general question "Are there other comments?" allows the dominant person to respond first again. Cutting off mid-sentence is embarrassing and creates tension. A side conversation during the meeting is conspicuous and inappropriate. The thank-you-and-round approach respects the person while distributing the space — and the round applies to everyone so it does not feel like a personal reprimand.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'mf-decisions',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'القرارات والمهام', en: 'Decisions and Action Items' },
      lede: {
        ar: 'اجتماع ينتهي بدون قرارات مكتوبة ومهام موزّعة هو اجتماع مؤجَّل لا منتهٍ.',
        en: 'A meeting that ends without written decisions and assigned tasks is a meeting postponed, not concluded.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الفرق بين نقاش وقرار هو اللحظة التي يقول فيها الميسّر «إذاً اتّفقنا على...» ويُصمت الغرفة للحظة ثم تُقرّ. كثير من الاجتماعات تُناقش ولا تُقرّر: الجميع يتكلّم وفي نهاية الوقت لا أحد يستطيع أن يقول بالضبط ما اتُّفق عليه. وغداً حين يرسل أحدهم بريداً يقول «كما اتّفقنا»، قد يجد أن لا أحد يتذكّر اتفاقاً بتلك الصيغة. المشكلة ليست في سوء النيّة — المشكلة في أن القرار لم يُسمَّ صريحاً ولم يُكتب ولم يُوزَّع. الخمس دقائق التي توفّرها في نهاية الاجتماع لهذا الغرض توفّر ساعات من الإعادة والتوضيح والاتصالات.',
            en: 'The difference between a discussion and a decision is the moment when the facilitator says "So we have agreed that..." and the room is briefly quiet and then it confirms. Many meetings discuss without deciding: everyone speaks and at the end of the time nobody can say exactly what was agreed. And tomorrow when someone sends an email saying "as we agreed", they may find nobody remembers an agreement in those terms. The problem is not bad intent — the problem is that the decision was never named explicitly, written, or distributed. The five minutes you reserve at the end of the meeting for this purpose saves hours of repetition, clarification and phone calls.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'قبل إغلاق كل بند: «إذاً ما قرّرناه هو...» — اقرأه بصوت واضح',
              'اسأل «هل اتّفقنا على هذا؟» — انتظر إقراراً صريحاً لا صمتاً',
              'إن لم يكن الاتفاق واضحاً: «ما الذي لا يزال مختلفاً؟» — وعُد إليه',
              'لكل قرار يتطلّب فعلاً: «من سيفعل هذا؟» «بحلول متى؟»',
              'في آخر الاجتماع: اقرأ قائمة القرارات والمهام بأسماء أصحابها كاملةً',
              'أرسل ملخّص الاجتماع خلال أربع وعشرين ساعة، لا بعد أسبوع',
            ],
            en: [
              'Before closing each item: "So what we have decided is..." — read it aloud clearly',
              'Ask "Are we agreed on this?" — wait for explicit confirmation, not silence',
              'If agreement is not clear: "What is still different?" — and return to it',
              'For every decision that requires action: "Who will do this?" "By when?"',
              'At the end of the meeting: read the full list of decisions and tasks with the names of their owners',
              'Send the meeting summary within twenty-four hours, not a week later',
            ],
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'ماذا', en: 'What' },
              text: {
                ar: 'الفعل الذي يجب أن يحدث بوضوح تام — «إعداد تقرير» أو «التواصل مع الشريك» أو «مراجعة العقد». لا كلمات فضفاضة مثل «المتابعة».',
                en: 'The action that must happen, with complete clarity — "prepare the report" or "contact the partner" or "review the contract". No vague words like "follow up".',
              },
            },
            {
              title: { ar: 'من', en: 'Who' },
              text: {
                ar: 'اسم واحد لا قائمة. «الفريق» لا يفعل شيئاً؛ «سامية» تفعل. حين يتولّى أكثر من شخص مهمّة، أحدهم مسؤول والآخرون يدعمون.',
                en: 'One name, not a list. "The team" does nothing; "Samia" does. When more than one person handles a task, one person is responsible and the others support.',
              },
            },
            {
              title: { ar: 'متى', en: 'When' },
              text: {
                ar: 'تاريخ محدّد. «قريباً» و«هذا الأسبوع» ليسا تاريخاً. الموعد الذي يُتّفق عليه في الغرفة أقوى من الموعد الذي يُفرض لاحقاً.',
                en: 'A specific date. "Soon" and "this week" are not dates. A deadline agreed in the room is stronger than one imposed afterwards.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'الاجتماع لا ينتهي بالوقت — ينتهي بالقرارات', en: 'A meeting does not end with the time — it ends with the decisions' },
          content: {
            ar: 'إذا وصل الوقت المحدّد وأنتم لا تزالون تناقشون بدون خلاصة، الخيار هو: إمّا تمديد الاجتماع بموافقة الجميع لاتخاذ القرار، أو تأجيل البند لاجتماع منفصل بوضوح — لا إغلاق الاجتماع والاكتفاء بإحساس أن الأمر «سينحلّ». المهام التي تُسجَّل أثناء الاجتماع أمام أصحابها تُنجز؛ التي تُكتَب بعده في ملخّص لم يُقرَّ في الغرفة غالباً ما تُناقَش مرة أخرى في الاجتماع القادم.',
            en: 'If the allotted time arrives and you are still discussing without a conclusion, the choice is: extend the meeting with everyone\'s agreement to reach the decision, or explicitly postpone the item to a separate meeting — not close the meeting with a feeling that "it will work out." Tasks recorded during the meeting in front of their owners get done; those written afterwards in a summary that was not confirmed in the room usually get discussed again at the next meeting.',
          },
        },
        {
          type: 'quiz',
          id: 'mf-q4',
          label: { ar: 'سيناريو', en: 'Scenario' },
          scenario: {
            ar: 'الاجتماع انتهى بحسب الوقت. ناقشتم ثلاثة بنود. البند الأول انتهى بقرار واضح وتوزيع مهام. البند الثاني «ناقشتموه» لكن لا أحد قال صراحةً ماذا قرّرتم. البند الثالث لم تصلوا إليه أصلاً.',
            en: 'The meeting has ended according to the time. You discussed three items. The first ended with a clear decision and assigned tasks. The second was "discussed" but nobody said explicitly what you decided. The third was never reached.',
          },
          question: {
            ar: 'ما الخطوات الصحيحة الآن؟',
            en: 'What are the correct steps now?',
          },
          options: [
            {
              ar: 'ترسل ملخّصاً يضمّ ما تفهمه من البند الثاني ويأمل أن يوافق الجميع، وتُسقط البند الثالث',
              en: 'Send a summary with your own understanding of item two and hope everyone agrees, and drop item three',
            },
            {
              ar: 'تمدّد الاجتماع لعشر دقائق، تُغلق البند الثاني صراحةً بإقرار الجميع، وتحدّد موعد اجتماع ثانٍ قصير للبند الثالث',
              en: 'Extend the meeting by ten minutes, close item two explicitly with everyone\'s confirmation, and set a short second meeting for item three',
            },
            {
              ar: 'تترك الأمر للمنسّق يحلّه في رسائل منفردة',
              en: 'Leave it for the coordinator to resolve in individual messages',
            },
            {
              ar: 'تُرسل ملخّصاً وتطلب من كل شخص أن يُؤكّد فهمه بالردّ على البريد',
              en: 'Send a summary and ask each person to confirm their understanding by replying to the email',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'البريد الذي يحمل فهم الميسّر للبند الثاني ليس قراراً — هو موقف شخص واحد. والصمت بعد البريد لا يعني موافقة؛ يعني أن الناس مشغولون. العشر دقائق الإضافية مُكلفة وقتاً لكنها توفّر الاجتماع الثالث الذي يناقش نفس البند مجدّداً. والبند الثالث لا يُسقط — يُعاد جدولته في اجتماع منفصل أو يُحلّ بطريقة أخرى لكن يُذكر صراحةً أنه لم يُعالَج.',
            en: 'An email carrying the facilitator\'s understanding of item two is not a decision — it is one person\'s position. And silence after the email does not mean agreement; it means people are busy. The extra ten minutes are costly in time but save the third meeting that will relitigate the same item. And item three is not dropped — it is rescheduled to a separate meeting or resolved another way, but it is explicitly acknowledged as unaddressed.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'mf-prep',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'التحضير قبل الاجتماع والمتابعة بعده', en: 'Preparation and Follow-Up' },
      lede: {
        ar: 'الاجتماع الجيّد يُبنى قبله بيوم وبعده بساعة، لا فقط في الساعات التي ينعقد فيها.',
        en: 'A good meeting is built the day before and the hour after, not only in the hours it runs.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الميسّر الذي يصل إلى الاجتماع بلا تحضير يقضي الربع الأول منه وهو يفهم الغرفة التي كان يمكنه فهمها قبل الوصول. قبل أي اجتماع يستحقّ التحضير، هناك أسئلة تُجيب عنها: من في الغرفة ومن بينهم علاقات توتّر يجب أن تكون على دراية بها؟ من الذي لديه معلومة لازمة للنقاش ولم يجهّزها بعد؟ هل البند الذي تريد تناوله ناضج للقرار أم لا يزال يحتاج عملاً تمهيدياً؟ هذه الأسئلة تحدّد ما إذا كان الاجتماع يجب أن يُعقد الآن أصلاً، ومن يجب أن يُدعى إليه، وكيف تُصاغ بنوده بطريقة تخدم النقاش لا تعيقه.',
            en: 'A facilitator who arrives at a meeting without preparation spends the first quarter of it understanding a room they could have understood before they arrived. Before any meeting worth preparing for, there are questions to answer: who is in the room and which of them have a tension between them that you need to be aware of? Who holds information essential to the discussion but has not yet prepared it? Is the item you want to address ready for a decision or does it still need preparatory work? These questions determine whether the meeting should happen at all, who should be invited, and how to frame the items in a way that serves the discussion rather than obstructing it.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'أرسل الجدول مع المستندات اللازمة قبل الاجتماع بيوم كامل على الأقلّ — الشخص الذي يرى الورقة لأول مرة أثناء الاجتماع لا يمكنه اتخاذ قرار فيها',
              'تواصل مسبقاً مع من لديهم معلومات أو آراء ضرورية — الاكتشاف أثناء الاجتماع أن أحداً لم يُعدّ ما يحتاجه الآخرون يُضيّع الوقت',
              'حدّد من في الغرفة هو صاحب القرار الفعلي في كل بند — النقاش من دون صاحب قرار حاضر غالباً لا يُفضي إلى نتيجة',
              'بعد الاجتماع مباشرةً: اكتب ملخّص القرارات والمهام قبل أن يتبدّد ما في ذاكرتك',
              'أرسل الملخّص في اليوم نفسه أو في أسوأ الأحوال في اليوم التالي — بعد أسبوع لا أحد يتذكّر التفاصيل',
              'في الاجتماع التالي: ابدأ بمراجعة سريعة لمهام الاجتماع السابق — هذا وحده يُحوّل المهام من توصيات إلى التزامات',
            ],
            en: [
              'Send the agenda with necessary documents at least a full day before — the person who sees a paper for the first time during the meeting cannot make a decision on it',
              'Contact in advance those who hold information or opinions essential to the discussion — discovering during the meeting that someone has not prepared what others need wastes time',
              'Identify who in the room is the actual decision-maker for each item — a discussion without the decision-maker present usually reaches no conclusion',
              'Immediately after the meeting: write the summary of decisions and tasks before your memory fades',
              'Send the summary the same day or at worst the following day — after a week nobody remembers the details',
              'At the next meeting: begin with a quick review of tasks from the previous one — this alone turns tasks from recommendations into commitments',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'ملخّص الاجتماع ليس نسخة طويلة مما جرى — هو وثيقة موجزة تضمّ ثلاثة أشياء فقط: القرارات التي اتُّخذت (بصياغتها الدقيقة لا بما فهمته منها)، والمهام مع أسماء أصحابها ومواعيدها، وأي بند أُجّل مع سبب التأجيل. من يكتب الملخّص يتحمّل مسؤولية التحقّق من أن ما يكتبه هو ما اتُّفق عليه فعلاً لا ما يعتقد أنه اتُّفق عليه — ولهذا فإن الملخّص الجيّد يُرسل إلى المشاركين مع طلب التعليق خلال أربع وعشرين ساعة إن كان هناك ما يستوجب التصحيح.',
            en: 'A meeting summary is not a long version of what happened — it is a brief document containing only three things: the decisions taken (in their precise wording, not your interpretation of them), the tasks with the names of their owners and their deadlines, and any item that was deferred with the reason for deferral. Whoever writes the summary bears the responsibility of verifying that what they write is what was actually agreed, not what they believe was agreed — which is why a good summary is sent to participants with a request to respond within twenty-four hours if anything needs correcting.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'الاجتماع الذي لا يُتابَع كأنه لم يُعقد', en: 'A meeting with no follow-up is as if it never happened' },
          content: {
            ar: 'القرار الذي يُتّخذ في الاجتماع ثم لا يُتابَع له مسار واضح يتحوّل إلى نيّة لا أكثر. الفارق بين المنظمات التي تُنجز وتلك التي تتكرّر اجتماعاتها بنفس البنود هو وجود نظام متابعة: مهمة موثّقة، اسم مسؤول، موعد محدّد، ومراجعة دورية. النظام لا يجب أن يكون معقّداً — ورقة واحدة أو جدول بسيط يُراجَع في بداية كل اجتماع يكفي.',
            en: 'A decision taken in a meeting that is then not followed with a clear path becomes an intention and nothing more. The difference between organisations that deliver and those whose meetings repeat the same items is the presence of a follow-up system: a documented task, a responsible name, a specific deadline, and a regular review. The system does not need to be complex — one sheet or a simple table reviewed at the start of each meeting is enough.',
          },
        },
        {
          type: 'quiz',
          id: 'mf-q5',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أرسلت ملخّص الاجتماع بعد يومين. أحد الأعضاء ردّ يقول «هذا ليس ما اتّفقنا عليه في البند الثالث». ما خطوتك؟',
            en: 'You sent the meeting summary two days later. One member replied saying "this is not what we agreed on item three." What is your step?',
          },
          options: [
            {
              ar: 'تردّ بأن ما كتبته هو ما فهمته وتطلب منه أن يُكمل المهمّة كما هي',
              en: 'Reply that what you wrote is what you understood and ask them to complete the task as written',
            },
            {
              ar: 'تحذف البند الثالث من الملخّص تفادياً للخلاف',
              en: 'Delete item three from the summary to avoid the dispute',
            },
            {
              ar: 'تتواصل معه وتسمع وجهة نظره، ثم إن تبيّن خلاف حقيقي تُعيد فتح البند في اجتماع قصير أو تحلّه باتصال يضمّ أصحاب القرار',
              en: 'Contact them and hear their view, then if a genuine disagreement emerges reopen the item in a short meeting or resolve it in a call with the decision-makers present',
            },
            {
              ar: 'تنتظر الاجتماع القادم لمناقشة الأمر',
              en: 'Wait for the next meeting to discuss the matter',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الإصرار على صياغتك يُثبّت خلافاً وتجاهله يتركه معلّقاً. الانتظار حتى الاجتماع القادم يعني أسبوعاً أو أكثر من الغموض قد يوقف العمل. الخلاف في تذكّر القرار شائع وليس بالضرورة سوء نيّة — أحياناً القرار لم يُصَغ بدقة كافية في اللحظة ذاتها، وهذا هو السبب في أن الملخّص يُرسل مبكراً ويُتاح للتعليق. الحلّ هو استيضاح سريع وتوثيق ما يُتّفق عليه.',
            en: 'Insisting on your wording entrenches a disagreement; ignoring it leaves it unresolved. Waiting for the next meeting means a week or more of ambiguity that may stop work. Disagreement about remembering a decision is common and not necessarily bad intent — sometimes the decision was not phrased precisely enough at the moment, which is why the summary is sent early and left open for comment. The solution is quick clarification and documenting what is agreed.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 6
    {
      id: 'mf-community',
      tag: { ar: 'الوحدة السادسة', en: 'Module 6' },
      title: { ar: 'التيسير المجتمعي', en: 'Community Facilitation' },
      lede: {
        ar: 'الجلسة المجتمعية ليست اجتماع فريق بمشاركين أكثر — هي بيئة مختلفة تماماً تستدعي مهارات مختلفة.',
        en: 'A community session is not a team meeting with more participants — it is an entirely different environment that requires different skills.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين تُيسّر جلسة مجتمعية، أنت في غرفة فيها فروق قوة حقيقية: رجال ونساء، شيوخ وشباب، أصحاب أرض وأصحاب حاجة، مسؤولون ومواطنون. هذه الفروق لا تختفي لأن الكراسي مرتّبة في دائرة. والشخص الذي يصمت في اجتماع الفريق لأنه جديد يصمت في الجلسة المجتمعية لأن شيخ الحارة موجود، أو لأن التجربة علّمته أن رأيه لن يغيّر شيئاً. الميسّر الذي لا يرى هذا يظنّ أن «الجميع تكلّم» — لكن من تكلّم هم من كان آمناً بالكلام أصلاً.',
            en: 'When you facilitate a community session, you are in a room with real power differences: men and women, elders and youth, landowners and those in need, officials and citizens. These differences do not disappear because the chairs are arranged in a circle. And the person who stays quiet in a team meeting because they are new stays quiet in the community session because the neighbourhood elder is present, or because experience has taught them that their opinion will change nothing. A facilitator who does not see this thinks "everyone spoke" — but who spoke was whoever felt safe speaking to begin with.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'القواعد الأساسية في الجلسة المجتمعية لا تُفرض — تُقترح وتُقرَّر من الغرفة. الفرق كبير. القاعدة التي يتّفق عليها الحاضرون أنفسهم أقوى مما يقوله الميسّر لأن الجميع شاركوا في صنعها. ابدأ بسؤال بسيط: «ما الذي تحتاجونه حتى تشعروا أنكم تستطيعون الكلام بحرية اليوم؟» وأصغِ لما يقوله الناس — ستكتشف في الغالب أن طلباتهم معقولة جداً: أن يُسمعوا دون مقاطعة، أن يُعاملوا بالتساوي بغضّ النظر عن مكانتهم، وأن ما يُقال في الغرفة يبقى فيها.',
            en: 'Ground rules in a community session are not imposed — they are proposed and decided by the room. The difference is significant. A rule that the participants themselves agree to is stronger than one the facilitator announces, because everyone had a hand in creating it. Start with a simple question: "What do you need to feel that you can speak freely today?" And listen to what people say — you will usually find their requests are very reasonable: to be heard without interruption, to be treated equally regardless of their status, and that what is said in the room stays there.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'رتّب الكراسي في دائرة أو نصف دائرة — الكراسي خلف بعضها تصنع صفوفاً وصفوف تصنع جمهوراً لا مشاركين',
              'اعرف الغرفة قبل الجلسة: من القيادات غير الرسمية؟ من ليس معتاداً على الكلام أمام الآخرين؟',
              'اقترح قواعد وافتح الباب للإضافة والحذف قبل البدء',
              'استخدم أسلوب المجموعات الصغيرة للنقاش الأولي — الناس أكثر جرأة في مجموعة من ثلاثة من أمام عشرين',
              'ترجم لغة المشاركين: إن كان الكلام بالعامّي والكتابة بالفصحى، الجلسة مُقصية من البداية',
              'قبل إغلاق الجلسة: «هل هناك شيء مهمّ لم يُقَل بعد؟» — وانتظر حقاً',
            ],
            en: [
              'Arrange chairs in a circle or semicircle — chairs behind each other create rows, and rows create an audience, not participants',
              'Know the room before the session: who are the informal leaders? Who is not used to speaking in front of others?',
              'Propose ground rules and open the floor for additions and changes before starting',
              'Use small groups for initial discussion — people are bolder in a group of three than in front of twenty',
              'Bridge the language of participants: if the conversation is in dialect and the writing is in formal Arabic, the session is excluding people from the start',
              'Before closing the session: "Is there anything important that has not been said yet?" — and genuinely wait',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'التيسير ليس قيادة المجتمع', en: 'Facilitation is not leading the community' },
          content: {
            ar: 'الميسّر المجتمعي لا يجيء بحلول — يخلق الظروف التي يصل فيها المجتمع إلى حلوله. هذا يعني قبول أن الجلسة قد تصل إلى نتيجة لا توافق عليها، وأن دورك هو ضمان أن العملية كانت عادلة لا أن النتيجة كانت ما أردت. التيسير المجتمعي الذي يستهدف نتيجة محدّدة مسبقاً ليس تيسيراً — هو إقناع بثياب التشاور.',
            en: 'A community facilitator does not arrive with solutions — they create the conditions in which the community reaches its own. This means accepting that the session may arrive at a conclusion you do not agree with, and that your role is to ensure the process was fair, not that the outcome was what you wanted. Community facilitation that targets a predetermined outcome is not facilitation — it is persuasion dressed as consultation.',
          },
        },
        {
          type: 'quiz',
          id: 'mf-q6',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'في جلسة مجتمعية لمناقشة احتياجات الحارة، شيخ الحارة يتكلّم منذ ربع ساعة والنساء في الغرفة لم تتكلّم منهنّ أحد. ماذا تفعل؟',
            en: 'In a community session to discuss neighbourhood needs, the neighbourhood elder has been speaking for fifteen minutes and none of the women in the room have spoken. What do you do?',
          },
          options: [
            {
              ar: 'تنتظر حتى ينتهي الشيخ وتأمل أن تتكلّم امرأة من تلقاء نفسها',
              en: 'Wait until the elder finishes and hope a woman will speak up on her own',
            },
            {
              ar: 'تقاطعه مباشرةً وتطلب من النساء الكلام',
              en: 'Interrupt him directly and ask the women to speak',
            },
            {
              ar: 'تشكره على مداخلته، تُلخّص ما قاله، ثم تقول «أودّ أن نسمع من جهات أخرى في الغرفة — ما الذي تريد إضافته من لم يتكلّم بعد؟»',
              en: 'Thank him for his contribution, summarise what he said, then say "I would like to hear from other parts of the room — what would those who have not spoken yet like to add?"',
            },
            {
              ar: 'تفتح جلسة منفصلة للنساء وتُغلق الجلسة الحالية',
              en: 'Open a separate session for the women and close the current one',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الانتظار في سياق فروق القوة يعني أن النساء لن يتكلّمن — الانتظار ليس حيادية، هو إقرار بالوضع القائم. القطع المباشر والطلب الصريح من النساء الكلام يضعهنّ في موقف محرج ومباشر قد يزيد الصمت. الجلسة المنفصلة تحلّ جزءاً من المشكلة لكن تصنع فصلاً غير ضروري. الشكر والتلخيص والسؤال المفتوح للغرفة كلّها هو الطريق الذي يحترم الشيخ ويفتح الفضاء دون إحراج لأحد.',
            en: 'Waiting in a context of power differences means the women will not speak — waiting is not neutrality, it is confirming the existing state of affairs. Direct interruption and an explicit request for women to speak puts them in an embarrassing and direct position that may increase silence. A separate session addresses part of the problem but creates an unnecessary division. The thank-you, summary and open question to the whole room is the path that respects the elder and opens the space without embarrassing anyone.',
          },
        },
        {
          type: 'quiz',
          id: 'mf-q7',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'في بداية الجلسة المجتمعية، أحد الحاضرين يقترح قاعدة تقول «لا يتكلّم أحد قبل الشيخ». كيف تتعامل مع هذا الاقتراح؟',
            en: 'At the start of the community session, one participant proposes a rule: "Nobody speaks before the elder." How do you handle this proposal?',
          },
          options: [
            {
              ar: 'توافق على الفور لأن الحاضرين يعرفون ثقافتهم أكثر منك',
              en: 'Agree immediately because the participants know their culture better than you do',
            },
            {
              ar: 'ترفض الاقتراح وتشرح أن كل الأصوات متساوية',
              en: 'Reject the proposal and explain that all voices are equal',
            },
            {
              ar: 'تشكر المقترح وتسأل الغرفة «ما رأي الجميع في هذا؟» — وإن كانت القاعدة ستُقيّد الحوار تُوضح ذلك: «أتساءل هل ستُتيح هذه القاعدة لكل صوت أن يُسمع»',
              en: 'Thank the proposer and ask the room "What does everyone think of this?" — and if the rule would constrain the conversation, name that: "I wonder whether this rule would allow every voice to be heard"',
            },
            {
              ar: 'تتجاوز الاقتراح وتبدأ الجلسة',
              en: 'Move past the proposal and start the session',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الموافقة الفورية تتخلّى عن مسؤوليتك كميسّر في ضمان العدالة الإجرائية. الرفض الصريح يتجاوز سلطتك ويخلق مواجهة. التجاوز يُهين المقترح ويترك التوتّر بلا معالجة. الطريق الوسط هو إعادة الاقتراح للغرفة — هم من يتّخذون القرار — مع إضافة تساؤل حقيقي يفتح الباب لمن لم يتكلّم للتعبير عن تحفّظه دون أن يواجه الاقتراح مباشرةً.',
            en: 'Immediate agreement abandons your responsibility as facilitator to ensure procedural fairness. Explicit rejection oversteps your authority and creates confrontation. Moving past it dismisses the proposer and leaves the tension unaddressed. The middle path is to return the proposal to the room — they make the decision — while adding a genuine question that opens the door for those who have not spoken to express a reservation without directly confronting the proposal.',
          },
        },
      ],
    },
  ],
};
