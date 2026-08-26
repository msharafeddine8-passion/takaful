import type { CourseContent } from './types';

/**
 * Level 5 — Public Speaking and Persuasive Communication. Pass mark 70.
 *
 * Built around one idea that most public-speaking training skips: the work
 * happens before the talk, not during it. Knowing who is in the room, what
 * they already believe, and what one thing you want them to do when you finish
 * decides the shape of everything else.
 *
 * Three practical disciplines follow from that: building a message short
 * enough to repeat, telling a story that serves the point without borrowing
 * someone else's dignity, and presenting numbers that say what they actually
 * say rather than what you wish they said.
 */

export const publicSpeaking: CourseContent = {
  slug: 'public-speaking',
  level: 5,
  minutes: 35,
  passMark: 70,
  title: {
    ar: 'الخطابة والتواصل المؤثّر',
    en: 'Public Speaking and Persuasive Communication',
  },
  lede: {
    ar: 'أن تعرف لمن تتحدّث قبل ماذا تقول، وأن تروي قصة صادقة، وأن تعرض رقماً من دون أن تضخّمه.',
    en: 'Knowing who you are speaking to before what you will say, telling an honest story, and presenting a number without inflating it.',
  },
  outcomes: {
    ar: [
      'تبني رسالة تناسب جمهوراً محدّداً وتفتتحها بما يمسّه',
      'تروي قصة تخدم الفكرة وتحفظ كرامة أصحابها',
      'تعرض أرقاماً بصدق وتجيب عن سؤال صعب',
      'تقدّم مشروعاً لشريك أو مانح في وقت محدود',
    ],
    en: [
      'Build a message for a specific audience and open on what matters to them',
      "Tell a story that serves the point and keeps its subjects' dignity",
      'Present figures honestly and answer a hard question',
      'Pitch a project to a partner or funder inside a fixed time',
    ],
  },
  sources: [
    'TED Conferences — The Official TED Guide to Public Speaking, Chris Anderson (2016)',
    'Toastmasters International — Competent Communication Manual (CC)',
    'IFRC — Volunteer Advocacy and Communication Capacity Building Framework',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'ps-audience',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'من تخاطب قبل ماذا تقول', en: 'Who You Are Talking To Before What You Will Say' },
      lede: {
        ar: 'الرسالة التي تصلح لأي أحد لا تصل إلى أحد. الخطيب الفعّال لا يبدأ بكلمته، بل بسؤال: من هم الناس الجالسون أمامي، وماذا يحملون معهم إلى هذه القاعة؟',
        en: 'A message that suits everyone reaches no one. The effective speaker does not begin with their words but with a question: who are the people sitting in front of me, and what do they carry with them into this room?',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الجمهور ليس كتلة صمّاء تستمع بأذن واحدة. في القاعة نفسها قد يجلس مانح يريد أن يرى أثر استثماره بالأرقام الصافية، وشريك ميداني يريد أن يطمئنّ أنك تفهم الواقع الذي يعيشه على الأرض كل يوم، ومتطوّع جديد يتساءل ما الذي سيفعله بالضبط يوم غدٍ، وصحفي يبحث عن الزاوية الإخبارية التي تُميّز قصّته عمّا نُشر بالأمس. الكلام الذي يخاطبهم جميعاً بالطريقة ذاتها لا يلمس أياً منهم.\n\nمعرفة جمهورك لا تعني أن تصنع أربع نسخ من حديثك — تعني أن تجد الخيط المشترك بينهم، وتبني حديثك حوله، ثم تضبط أمثلتك وتفاصيلك ولغتك على من أمامك تحديداً. المتحدّث الذي يعرف جمهوره يبدو وكأنه يكلّم كل شخص على حدة، حتى وهو يقف أمام مئة شخص في آنٍ واحد. هذا ليس فنّاً غامضاً — هو نتيجة سؤالين بسيطين طُرحا قبل التحضير: ماذا يعرف هؤلاء الناس أصلاً؟ وماذا يريدون أن يخرجوا به من هذه القاعة؟',
            en: 'An audience is not a silent mass listening with one ear. In the same room there may be a donor who wants to see the impact of their investment in clean numbers, a field partner who wants to be sure you understand the day-to-day reality on the ground, a new volunteer wondering exactly what they will be doing tomorrow, and a journalist looking for the news angle that sets their story apart from what was published yesterday. Speech that addresses them all in the same way touches none of them.\n\nKnowing your audience does not mean making four versions of your talk — it means finding the thread they share, building your talk around it, then calibrating your examples, detail, and language to exactly who is in front of you. A speaker who knows their audience sounds as if they are talking to each person individually, even while standing before a hundred people at once. This is not a mysterious art — it is the result of two simple questions asked before preparation: what do these people already know? And what do they want to leave this room with?',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'ماذا يعرفون أصلاً؟', en: 'What do they already know?' },
              text: {
                ar: 'البدء من ما يعرفه الجمهور يوفّر عليك وقتاً ويحترم وقتهم. الشرح المفصّل لمختصّ استصغار له. والقفز إلى مصطلحات تقنية أمام مبتدئين تضييع لوقتهم ووقتك. اكتشف مستوى جمهورك قبل أن تقرّر من أين تبدأ.',
                en: 'Starting from what the audience already knows saves your time and respects theirs. A detailed explanation to an expert is condescending. Jumping to technical terms before beginners wastes their time and yours. Find out your audience\'s level before you decide where to begin.',
              },
            },
            {
              title: { ar: 'ماذا يقلقهم؟', en: 'What worries them?' },
              text: {
                ar: 'كل جمهور يحضر بسؤال خفيّ غير مُعلَن: هل هذا يخصّني فعلاً؟ هل أستطيع المساهمة؟ هل سيضيع وقتي؟ الرسالة التي تجيب على هذا القلق في أول دقيقة تكسب الانتباه قبل أن تضطرّ إلى استعادته بعد أن فقدته.',
                en: 'Every audience arrives with an unstated hidden question: does this actually concern me? Can I contribute? Will my time be wasted? A message that answers this worry in the first minute wins attention before you have to win it back after losing it.',
              },
            },
            {
              title: { ar: 'ماذا تريد منهم في النهاية؟', en: 'What do you want from them at the end?' },
              text: {
                ar: 'الحديث بلا هدف سلوكي واضح ترف غير مبرَّر. سواء أردت دعماً مالياً أو تطوّعاً أو شراكة أو تغيير رأي — اعرف هذا قبل أن تقول كلمتك الأولى، ثم ابنِ كل جملة وكل مثال وكل قصة نحو هذا الهدف تحديداً.',
                en: 'A talk with no clear behavioural goal is an unjustified luxury. Whether you want financial support, volunteering, partnership, or a changed opinion — know this before you say your first word, then build every sentence, every example, every story toward that specific goal.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'اسأل قبل أن تحضّر، لا بعد أن تنتهي', en: 'Ask before you prepare, not after you finish' },
          content: {
            ar: 'أفضل تحضير لأي حديث يبدأ بسؤال بسيط تطرحه على من دعاك: «من سيكون في القاعة؟ وما الذي يأملون أن يخرجوا به؟ وهل هناك شيء حسّاس أو خلافي في هذا الموضوع بالنسبة لهم؟» هذه الأسئلة الثلاثة تحوّل ساعتين من التحضير في الاتجاه الخاطئ إلى عشرين دقيقة في الاتجاه الصحيح. المنظمون دائماً سعيدون حين تسأل — يعرفون أنك تؤخذ هذا الأمر بجدّية.',
            en: 'The best preparation for any talk starts with a simple question you ask whoever invited you: "Who will be in the room? What do they hope to leave with? And is there anything sensitive or contentious about this topic for them?" These three questions turn two hours of preparation in the wrong direction into twenty minutes in the right one. Organisers are always pleased when you ask — it tells them you are taking this seriously.',
          },
        },
        {
          type: 'quiz',
          id: 'ps-q1',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'دُعيت لتقديم مشروع مجتمعي أمام مجموعة مختلطة تضمّ مانحين دوليين وأهالي مستفيدين ومتطوّعين جدداً. كيف تبدأ التحضير؟',
            en: 'You have been invited to present a community project to a mixed group of international donors, beneficiary families, and new volunteers. How do you begin your preparation?',
          },
          options: [
            { ar: 'تحضّر الحديث المعتاد عن المشروع لأنه جُرّب مرات كثيرة ويغطّي كل ما يهمّ أي جمهور', en: 'Prepare your usual project talk since it has been tested many times and covers everything any audience cares about' },
            { ar: 'تسأل المنظّمين عن أولويات كل فئة ثم تجد رسالة تجمعهم مع أمثلة تناسب كل فئة منهم', en: "Ask the organisers about each group's priorities, then find a connecting message with examples tailored to each" },
            { ar: 'تخاطب المانحين حصراً لأنهم يملكون القرار المالي، ويستفيد الباقون بما يسمعونه بالمناسبة', en: 'Address only the donors since they hold the financial decision, and the others will benefit from what they overhear' },
            { ar: 'تترك الأهالي يتحدّثون بدلاً منك طوال الوقت لأن صوتهم أكثر تأثيراً من أي عرض تقدّمه أنت', en: 'Let the families speak instead of you throughout because their voice carries more impact than any presentation you could give' },
          ],
          correct: 1,
          feedback: {
            ar: 'التحضير الناجح يبدأ بفهم التوقعات المتباينة. جمهور مختلط يحتاج رسالة مشتركة تلمس الجميع — مثلاً الأثر الإنساني الحقيقي — مع طبقات متعدّدة: أرقام للمانحين، قصص للأهالي، دور عملي للمتطوّعين. ترك الأهالي يتحدّثون قرار تكتيكي جيّد، لكنه لا يُغني عن رسالة واضحة تقودها أنت.',
            en: 'Successful preparation starts with understanding the differing expectations. A mixed audience needs a shared message that touches everyone — for example the real human impact — with multiple layers: numbers for donors, stories for families, a practical role for volunteers. Letting families speak is a good tactical choice, but it does not replace a clear message that you lead.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'ps-message',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'بناء الرسالة والافتتاح المؤثّر', en: 'Building the Message and the Powerful Opening' },
      lede: {
        ar: 'عندك ثلاثون ثانية لتكسب انتباه جمهورك قبل أن يقرّروا أين تذهب أذهانهم. ما تقوله فيها — وما لا تقوله — يرسم خريطة الحديث كلّه.',
        en: 'You have thirty seconds to win your audience\'s attention before they decide where their minds will go. What you say in them — and what you do not — maps the entire talk.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الرسالة الجيدة جملة واحدة. جرّب أن تجيب على هذا السؤال: «بعد أن ينتهي حديثي، ما الشيء الواحد الذي أريد أن يتذكّره الجمهور أو يفعله؟» إن لم تستطع الإجابة في جملة واحدة واضحة، فرسالتك لم تنضج بعد، والحديث نفسه لن يكون أوضح من رسالته.\n\nهذه الجملة هي البوصلة التي يُقاس بها كل مثال وكل قصة وكل رقم في حديثك. كل ما لا يخدمها يُحذف — لا لأنه سيئ في حدّ ذاته، بل لأنه يزاحم ما هو حقيقياً مهمّ. وهذا هو القرار الأصعب في بناء أي حديث: ليس قرار ما تقوله، بل قرار ما تتركه خارجاً. المتحدّث الذي يملك رسالة واحدة واضحة يستطيع أن يبدأ من أي نقطة ويعود إليها — والجمهور يشعر بذلك حتى من دون أن يعيه.',
            en: 'A good message is one sentence. Try answering this question: "After my talk ends, what is the one thing I want the audience to remember or do?" If you cannot answer in one clear sentence, your message is not ready yet, and the talk itself will be no clearer than its message.\n\nThat sentence is the compass against which every example, story, and number in your talk is measured. Everything that does not serve it is cut — not because it is bad in itself, but because it crowds out what truly matters. And that is the hardest decision in building any talk: not the decision of what to say, but what to leave out. A speaker who has one clear message can start from any point and return to it — and the audience feels this even without being consciously aware of it.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'صِغ رسالتك في جملة واحدة تبدأ بـ «أريد أن يعرف الجمهور أن...» أو «أريد أن يفعل الجمهور...» — اكتبها على ورقة قبل أي شيء آخر',
              'اختَر أقوى دليل عندك على هذه الرسالة: قصة حقيقية، أو رقم مفاجئ، أو مشهد لا يُنسى',
              'ابدأ بالدليل مباشرةً في الجملة الأولى — لا بالشكر، ولا بتعريف نفسك، ولا بجدول محاور الحديث',
              'قل رسالتك بوضوح في الدقيقتين الأوليين: لا تجعل الجمهور يخمّن ما تريد أن تقوله',
              'اختم بعودة إلى نفس الصورة أو القصة التي فتحت بها — يعطي الحديث إحساساً بالاكتمال والقصد',
            ],
            en: [
              'Frame your message in one sentence starting with "I want the audience to know that…" or "I want the audience to do…" — write it on paper before anything else',
              'Choose your strongest evidence for that message: a real story, a surprising number, an unforgettable scene',
              'Open with the evidence directly in your first sentence — not with thanks, not with an introduction, not with an agenda of topics',
              'State your message clearly within the first two minutes — do not make the audience guess what you are trying to say',
              'Close by returning to the same image or story you opened with — it gives the talk a sense of completion and purpose',
            ],
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'افتتاح يمسك الانتباه', en: 'An opening that holds attention' },
          noTitle: { ar: 'افتتاح يضيّعه', en: 'An opening that loses it' },
          yes: {
            ar: [
              'قصة قصيرة تُلقي المستمع في قلب الفكرة من الجملة الأولى',
              'سؤال يجعل الجمهور يفكّر قبل أن ينطق المتحدّث بجوابه',
              'رقم واحد مفاجئ يكسر ما يعتقده الجمهور أنه يعرفه',
              'مشهد حسّي يضع الجمهور في مكان القصة وزمانها',
              'تصريح جريء يخالف التوقّع السائد في القاعة',
            ],
            en: [
              'A short story that drops the listener into the heart of the idea from the first sentence',
              'A question that makes the audience think before the speaker gives the answer',
              'A single surprising number that breaks what the audience thinks it knows',
              'A sensory scene that puts the audience inside the place and time of the story',
              'A bold statement that goes against the prevailing expectation in the room',
            ],
          },
          no: {
            ar: [
              '«شكراً جزيلاً على هذه الدعوة الكريمة من هذه المؤسسة العريقة...»',
              '«سأتحدّث اليوم عن خمسة محاور، المحور الأول هو...»',
              '«أنا فلان، مسؤول كذا في منظمة كذا منذ كذا سنة...» قبل أي شيء آخر',
              'الاعتذار عن قصر الوقت أو ضعف التحضير في الجملة الأولى',
              'إحصاء عدد الشرائح أو الدقائق المتبقية في البداية',
            ],
            en: [
              '"Thank you so very much for this kind invitation from this venerable institution…"',
              '"I will speak today about five points, the first of which is…"',
              '"I am so-and-so, head of such-and-such at such-and-such organisation for so many years…" before anything else',
              'Apologising for the short time or insufficient preparation in the first sentence',
              'Counting the number of slides or remaining minutes at the start',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'ps-q2',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'تفتتح عرضك أمام لجنة تمويل بالقول: «شكراً على الاستضافة، أنا رنا من مؤسسة الأمل، وسأعرض اليوم نظرة عامة على مشروعنا في خمسة محاور.» ما المشكلة الجوهرية في هذا الافتتاح؟',
            en: 'You open your pitch before a funding committee with: "Thank you for having us, I am Rana from Amal Foundation, and today I will present an overview of our project in five points." What is the core problem with this opening?',
          },
          options: [
            { ar: 'لا مشكلة — هذا افتتاح محترف ومنظّم يطمئن اللجنة إلى أن العرض مرتّب وأن محاوره الخمسة محدّدة بوضوح', en: 'No problem — it is a professional and well-organised opening that reassures the committee that the presentation is orderly and its five points clearly defined' },
            { ar: 'ضيّعت الثلاثين ثانية الأولى في معلومات تعريفية لا تبني انتباهاً ولا تُخبر اللجنة لماذا تهتمّ', en: 'You wasted the first thirty seconds on introductory information that builds no attention and does not tell the committee why they should care' },
            { ar: 'لا ينبغي ذكر اسمك في البداية أبداً لأن اللجنة تقرأ الاسم في الملف ولا تحتاج سماعه منك', en: 'You should never mention your name at the start because the committee reads it in the file and does not need to hear it from you' },
            { ar: 'خمسة محاور كثيرة جداً لعرض واحد، والأفضل اختصارها إلى ثلاثة حتى لا يتشتّت انتباه اللجنة', en: 'Five points is far too many for one presentation, and it would be better to cut them to three so the committee does not lose focus' },
          ],
          correct: 1,
          feedback: {
            ar: 'اللجنة لا تحتاج أن تعرف اسمك قبل أن تهتمّ بما لديك — ستجده في الورقة أمامها. ما تحتاجه في الثلاثين ثانية الأولى هو سبب للاهتمام: رقم يفاجئها، أو مشهد إنساني يضعها في قلب المشكلة. «خمسة محاور» في الافتتاح يعني أن جمهورك سيقضي الحديث يعدّ المحاور لا يسمع محتواها.',
            en: 'The committee does not need your name before they care what you have — they will find it on the paper in front of them. What they need in the first thirty seconds is a reason to care: a surprising number, or a human scene that puts them inside the problem. "Five points" in the opening means your audience will spend the talk counting points rather than hearing their content.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'ps-story',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'رواية القصة بكرامة', en: 'Telling the Story with Dignity' },
      lede: {
        ar: 'القصة أقوى أداة تواصل عرفتها البشرية. وهي أيضاً مسؤولية: حين تروي عن إنسان آخر، أنت تحمل أمانته أمام من يسمع.',
        en: "Story is the most powerful communication tool humanity has known. It is also a responsibility: when you tell about another person, you carry their trust before whoever is listening.",
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين تروي قصة شخص مرّ بمحنة، أنت لا تروي قصّتك — تتولّى قصة إنسان آخر بالنيابة عنه. هذه مسؤولية لا امتياز. القصة الجيدة لا تُشهر الفقر أو المعاناة كي تحرّك المشاعر — تعرض إنساناً كاملاً بنقاط قوّته وخياراته وكرامته، في ظرف صعب ألمّ به. الفرق بين القصتين ليس فقط أخلاقياً: القصة التي تُكرم صاحبها تبني ثقة تدوم مع الجمهور، والقصة التي تختزل إنساناً في محنته تُرضي فضولاً لحظياً وتُهين من وافق أن يُروى عنه — ويعرف من يعرفونه ما قلته عنه.\n\nقبل أن تقصّ: هل طلبت الإذن؟ وهل شرحت تماماً كيف ستُستخدم هذه القصة ومن سيسمعها؟ الإذن الشفهي العجول لا يكفي. الإذن المستنير يعني أن الشخص يعرف السياق كاملاً ولديه حق التراجع. والاسم الحقيقي أمانة خاصة — لا يُذكر إلا بإذن صريح ومُجدَّد.',
            en: 'When you tell the story of someone who has been through hardship, you are not telling your own story — you are holding another person\'s story on their behalf. That is a responsibility, not a privilege. A good story does not brandish poverty or suffering to move feelings — it presents a complete human being with their strengths, choices, and dignity, in a difficult circumstance that came upon them. The difference between the two is not only ethical: a story that honours its subject builds lasting trust with the audience, while a story that reduces a person to their hardship satisfies a momentary curiosity and humiliates whoever agreed to be told — and those who know them will hear what you said about them.\n\nBefore you tell it: did you ask permission? And did you explain fully how this story will be used and who will hear it? A hasty verbal agreement is not enough. Informed consent means the person knows the full context and has the right to withdraw. A real name is a special trust — it is not mentioned without explicit and renewed permission.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'اطلب الإذن بشكل صريح واشرح كيف ستُستخدم القصة: أمام من، ومتى، وفي أي سياق',
              'اعرض الشخص بصفاته الإنسانية الكاملة — ما يحبّه، ما يفعله، ما يطمح إليه — لا بما أصابه وحسب',
              'تجنّب الصور أو الأوصاف التي ترسّخ نظرة «الضحية» من دون سياق يحفظ الكرامة',
              'إذا تغيّر وضع الشخص، لا تستمر في رواية قصة قديمة لا تعكس حياته الآن',
              'اسأل نفسك قبل كل كلمة: لو سمع هذا الشخص ما أقوله عنه الآن، كيف سيشعر؟',
              'الاسم الحقيقي أمانة — لا تذكره إلا بإذن صريح ومعرفة تامة بالسياق الذي سيُذكر فيه',
            ],
            en: [
              'Ask permission explicitly and explain how the story will be used: before whom, when, and in what context',
              'Present the person with their full human qualities — what they love, what they do, what they aspire to — not only what happened to them',
              'Avoid images or descriptions that reinforce a "victim" view without context that preserves dignity',
              'If the person\'s situation has changed, do not keep telling an old story that no longer reflects their life',
              'Ask yourself before every word: if this person heard what I am saying about them right now, how would they feel?',
              'A real name is a trust — do not mention it without explicit permission and full awareness of the context in which it will appear',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'القصة الفعّالة تتبع بنية بسيطة ثبتت فاعليتها عبر الثقافات والعصور: شخص في مكان وزمان محدّدَين يواجه تحدّياً حقيقياً، يتّخذ قرارات، ويصل إلى نتيجة تُغيّر شيئاً في حياته أو في حياة من حوله. الغموض يقتل القصة — والتفاصيل الحسّية تُحييها وتُثبّتها في الذاكرة.\n\n«رجل فقير من الشمال» لا يبقى في ذاكرة أحد. «سامر، معلّم متقاعد في القامشلي، باع مكتبته التي جمعها عشرين عاماً لكي يستمر في دفع إيجار بيت أولاده» يبقى. التفصيل لا يُطوّل القصة — يُعمّقها. والخاتمة التي تتركها مفتوحة قليلاً، بسؤال مُلقى في الهواء أو بإمكانية تنتظر قراراً، تجعل الجمهور جزءاً من القصة لا مجرّد شهوداً عليها.',
            en: 'An effective story follows a simple structure that has proved its power across cultures and ages: a specific person in a specific place and time faces a real challenge, makes decisions, and reaches an outcome that changes something in their life or in the lives of those around them. Vagueness kills a story — sensory detail brings it to life and fixes it in memory.\n\n"A poor man from the north" stays in nobody\'s memory. "Samer, a retired teacher in Qamishli, sold the library he had gathered over twenty years to keep paying his children\'s rent" stays. Detail does not lengthen a story — it deepens it. And an ending left slightly open, with a question hanging in the air or a possibility waiting for a decision, makes the audience part of the story rather than merely witnesses to it.',
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'القصة التي «تنجح» بالإهانة ليست نجاحاً', en: "A story that 'works' through humiliation is not a success" },
          content: {
            ar: 'كثير من حملات التوعية والجمع التبرّعي تكسب أموالاً وتثير تعاطفاً بقصص تُشهر معاناة أشخاص حقيقيين بطريقة لم يوافق عليها أصحابها لو سُئلوا بوضوح. الغاية الطيّبة لا تُبرّر هذه الوسيلة. حين تبني سمعة مؤسستك على كرامة من تخدمهم، تبني مؤسسة تدوم. حين تبنيها على استثمار معاناتهم، تبني إعلاناً يُنسى.',
            en: 'Many awareness and fundraising campaigns win money and sympathy with stories that display the suffering of real people in ways those people would not have consented to if asked clearly. A good purpose does not justify this means. When you build your organisation\'s reputation on the dignity of those you serve, you build an institution that lasts. When you build it on the exploitation of their suffering, you build an advertisement that is forgotten.',
          },
        },
        {
          type: 'quiz',
          id: 'ps-q3',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'تريد أن تروي قصة أسرة استفادت من مشروعك في عرض أمام مانحين. الأسرة وافقت شفهياً وبسرعة حين سألتها. ما الذي لا تزال بحاجة إليه قبل أن تروي القصة؟',
            en: 'You want to tell the story of a family that benefited from your project in a donor presentation. The family agreed quickly and verbally when you asked. What do you still need before you tell the story?',
          },
          options: [
            { ar: 'لا شيء — الموافقة الشفهية كافية، والإصرار على توقيع ورقة مكتوبة قد يُشعر الأسرة بأنك لا تثق بكلمتها', en: 'Nothing — verbal consent is enough, and insisting on a signed paper may make the family feel you do not trust their word' },
            { ar: 'موافقة مكتوبة مع شرح واضح لكيفية استخدام القصة وأمام من، وإمكانية سحب الإذن في أي وقت', en: 'Written consent with a clear explanation of how the story will be used and before whom, with the ability to withdraw permission at any time' },
            { ar: 'إذن من مدير المشروع فقط، لأنه المسؤول عن العلاقة مع الأسرة وهو من يقرّر ما يُعرض على المانحين', en: 'Only the project manager\'s permission, since he owns the relationship with the family and decides what is shown to funders' },
            { ar: 'موافقة شفهية من الأب وحده بوصفه ربّ الأسرة، لأنه من يتحدّث باسمها في الأمور الرسمية وبقية أفرادها يتبعون رأيه', en: 'Verbal consent from the father alone as head of household, since he speaks for the family in all official matters and the others will follow his view' },
          ],
          correct: 1,
          feedback: {
            ar: 'الموافقة الشفهية السريعة قد لا تكون مستنيرة: هل عرفت الأسرة أن قصّتها ستُروى أمام لجنة تمويل دولية؟ أمام وسائل الإعلام؟ بالاسم الصريح أم بهوية مخفية؟ الموافقة المستنيرة تعني أن الأسرة تعرف تماماً كيف ستُستخدم قصّتها ولها حق التراجع في أي وقت. توثيق ذلك حماية لهم أولاً، ولك ثانياً.',
            en: 'A quick verbal agreement may not be informed: did the family know their story would be told before an international funding committee? Before media? With their real name or hidden identity? Informed consent means the family knows exactly how their story will be used and has the right to withdraw at any time. Documenting this protects them first, and you second.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'ps-numbers',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'الأرقام بصدق والأسئلة الصعبة', en: 'Numbers Honestly and Hard Questions' },
      lede: {
        ar: 'الرقم المنتزَع من سياقه كذبة ناعمة. والسؤال الصعب الذي تتهرّب منه يقول لجمهورك أكثر مما تريد أن يعرفه.',
        en: 'A number torn from its context is a polite lie. The hard question you evade tells your audience more than you want them to know.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الأرقام تمنح حديثك مصداقية وقوّة — لكنها تسلبهما أيضاً حين تُستخدم بطريقة انتقائية أو مبالَغ فيها. «وصلنا إلى عشرة آلاف شخص» جملة لا قيمة لها بلا سياق: عشرة آلاف من كم مليون؟ وصلنا بأي خدمة تحديداً؟ مرّة واحدة أم بشكل منتظم طوال أشهر؟ وما المعيار الذي نقيس به «الوصول»؟ الجمهور المتعلّم والمانح المحترف يعرفان متى يُستخدم الرقم زينةً لا دليلاً، ويطرحان هذه الأسئلة حتماً. إذا سبقتهما إليها بنفسك، بنيت مصداقية. وإذا اضطرّا إلى سؤالك عنها، خسرت بعضاً منها.\n\nالصدق الكمّي لا يعني أن تعدّد كل تحفّظاتك وتُضعف حجّتك — يعني أن تضع الرقم في إطاره الحقيقي وألا تطلب منه أن يقول أكثر مما يقوله. رقم صغير في سياقه الحقيقي أقوى من رقم كبير مشكوك فيه.',
            en: 'Numbers grant your talk credibility and power — but they strip both away when used selectively or exaggerated. "We reached ten thousand people" is a sentence with no value without context: ten thousand out of how many million? Reached with what specific service? Once or regularly over months? And what is the standard by which we measure "reaching"? A sophisticated audience and a professional donor know when a number is used as decoration rather than evidence, and they will ask these questions every time. If you get there first yourself, you build credibility. If they have to ask, you have already lost some of it.\n\nQuantitative honesty does not mean listing every caveat and weakening your case — it means placing the number in its real frame and not asking it to say more than it says. A small number in its true context is stronger than a large number under doubt.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'قدّم الرقم دائماً مع مصدره: من جمعه، متى، وبأي منهج — جملة واحدة تكفي',
              'اذكر ما لا يقوله الرقم بنفسك — هذا يبني ثقة أعمق بدلاً من أن يُضعف حجّتك',
              'فرّق بالوضوح بين مستفيد تلقّى خدمة مرّة واحدة ومستفيد مستمر منتظم',
              'قارن الرقم بمعيار موضوعي خارجي لا بنفسك وحدك — النمو بنسبة عشرين في المئة يعني شيئاً في سوق يرتفع خمسين في المئة',
              'اعترف بالفجوات في بياناتك قبل أن يكتشفها شخص آخر: «هذا ما نعرفه الآن، وهذا ما لا نزال نقيسه»',
            ],
            en: [
              'Always present the number with its source: who collected it, when, and by what method — one sentence is enough',
              'Say yourself what the number does not say — this builds deeper trust rather than weakening your case',
              'Clearly distinguish between a beneficiary who received a service once and one who is a regular ongoing participant',
              'Compare the number to an objective external benchmark, not only to yourself — twenty-percent growth means something in a market rising at fifty percent',
              'Acknowledge gaps in your data before someone else discovers them: "this is what we know now, and this is what we are still measuring"',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: '«لا أعرف» إجابة تبني ثقة حين تُقال بالطريقة الصحيحة', en: '"I don\'t know" is an answer that builds trust when said the right way' },
          content: {
            ar: 'حين يطرح أحد سؤالاً لا تملك إجابته، الخيار الوحيد الذي لن تندم عليه هو: «هذا سؤال مهمّ ولا تتوفّر لديّ الإجابة الدقيقة الآن — سأتحقّق منها وأعود إليك مكتوباً قبل نهاية هذا الأسبوع.» هذه الجملة تثبت أنك لا تخترع بيانات، وأن كل ما قلته قبلها يمكن الوثوق به. أما الاختراع أو التهرّب فيُلقيان شكّاً على كل ما سبقهما من كلام.',
            en: 'When someone asks a question you do not have the answer to, the only choice you will not regret is: "That is an important question and I do not have the precise answer right now — I will check and come back to you in writing before the end of this week." That sentence proves you are not inventing data, and that everything you said before it can be trusted. Invention or evasion casts doubt over everything that came before.',
          },
        },
        {
          type: 'quiz',
          id: 'ps-q4',
          label: { ar: 'سيناريو حسّاس', en: 'A difficult scenario' },
          question: {
            ar: 'في منتصف عرضك أمام مانحين، يسألك أحدهم: «ما نسبة المستفيدين الذين أكملوا البرنامج حتى نهايته؟» وأنت لا تعرف الرقم الدقيق. ماذا تفعل؟',
            en: 'Mid-way through your donor presentation, one of them asks: "What percentage of beneficiaries completed the programme through to the end?" You do not know the exact figure. What do you do?',
          },
          options: [
            { ar: 'تعطيه تقديراً تقريبياً يبدو معقولاً ومريحاً للجميع', en: 'Give an approximate estimate that sounds plausible and comfortable for everyone in the room' },
            { ar: 'تقول إن النسبة عالية جداً وتكمل بمثال ناجح من الميدان', en: 'Say the percentage is very high and continue with a successful example from the field' },
            { ar: 'تعترف أن هذا الرقم ليس أمامك الآن وتتعهّد بتزويده كتابةً بتاريخ محدّد', en: 'Acknowledge that this figure is not in front of you now and commit to providing it in writing by a specific date' },
            { ar: 'تُحوّل الحديث إلى قصة نجاح فردية لتتجاوز السؤال بسلاسة ودون إحراج', en: 'Redirect to an individual success story to move past the question smoothly and without embarrassment' },
          ],
          correct: 2,
          feedback: {
            ar: 'الأرقام الوهمية تنكشف — إمّا في الاجتماع نفسه أو في التقارير اللاحقة. والتحويل إلى قصة يقول للمانح أنك تتهرّب. الاعتراف المباشر مع تعهّد بموعد محدّد يثبت أمانتك ويحفظ مصداقية كل ما قلته. المانح المحترف لا يتوقّع منك حفظ كل رقم — يتوقّع منك الصدق حين لا تعرف.',
            en: 'Fictitious numbers come out — either in the same meeting or in subsequent reports. Redirecting to a story tells the donor you are evading. A direct acknowledgment with a commitment to a specific date proves your integrity and preserves the credibility of everything you said. A professional donor does not expect you to know every number — they expect you to be honest when you do not.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'ps-pitch',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'عرض المشروع في وقت محدود', en: 'Pitching the Project in Limited Time' },
      lede: {
        ar: 'دقيقتان أو عشرون — في كلا الحالين مقياس نجاحك هو نفسه: هل يعرف شريكك أو مانحك ماذا تطلب منه، وهل لديه سبب يكفي للموافقة؟',
        en: 'Two minutes or twenty — in both cases your measure of success is the same: does your partner or funder know what you are asking of them, and do they have reason enough to say yes?',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'عرض المشروع ليس تلخيصاً لكل ما تعرفه عنه — هو انتقاء دقيق لأهمّ ما يحتاج أن يسمعه الشخص الذي أمامك لكي يتّخذ القرار الذي تريده منه. المانح يريد أن يعرف: ما المشكلة، ولماذا أنتم تحديداً من يستطيع معالجتها، وما الذي سيتغيّر إذا موّل، وكيف يقيس ذلك. الشريك الميداني يريد أن يعرف: هل نتقاسم نفس الفهم للمشكلة، وما الذي يكسبه من هذا التعاون تحديداً، وكم سيكلّفه من وقت وموارد.\n\nاعرف طلبك قبل أن تفتح فمك. «ما الذي أطلب منه بالضبط في نهاية هذا الحديث؟» إن لم يكن الطلب واضحاً في ذهنك بجملة واحدة، لن يكون واضحاً في ذهنه بعد ربع ساعة من الكلام. والطلب الغامض يأخذ جواباً غامضاً: «نفكّر في الأمر»، «نتواصل لاحقاً» — وهذه الجمل هي رفض مؤدَّب في معظم الأحيان.',
            en: 'Pitching a project is not a summary of everything you know about it — it is a careful selection of what the person in front of you needs to hear to make the decision you want from them. A donor wants to know: what is the problem, why are you specifically the ones who can address it, what will change if they fund it, and how that will be measured. A field partner wants to know: do we share the same understanding of the problem, what do they specifically gain from this collaboration, and how much time and resources will it cost them.\n\nKnow your ask before you open your mouth. "What exactly am I asking of them at the end of this talk?" If the ask is not clear in your mind in one sentence, it will not be clear in their mind after fifteen minutes of talking. A vague ask gets a vague answer: "we\'ll think about it", "let\'s be in touch" — and these phrases are usually polite refusals.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'المشكلة', en: 'The problem' },
              text: {
                ar: 'جملة أو جملتان تحدّدان المشكلة بمشهد ملموس أو رقم موثوق. لا تبدأ بتاريخ مؤسستك أو بالسياق الإقليمي — ابدأ بمن يتأثّر بها ويومياتهم.',
                en: 'One or two sentences that define the problem with a concrete scene or a reliable number. Do not start with your organisation\'s history or the regional context — start with who is affected and their daily reality.',
              },
            },
            {
              title: { ar: 'الحلّ', en: 'The solution' },
              text: {
                ar: 'ما الذي تفعله تحديداً، وكيف يختلف عمّا هو موجود أصلاً في السوق. الوضوح هنا أهمّ من الإبهار — الشريك يريد أن يفهم لا أن يُدهش.',
                en: 'Exactly what you do and how it differs from what already exists. Clarity here matters more than dazzle — the partner wants to understand, not to be amazed.',
              },
            },
            {
              title: { ar: 'الأثر الموثَّق', en: 'The documented impact' },
              text: {
                ar: 'ما الذي تغيّر حتى الآن بالأرقام وبقصة واحدة إنسانية. الرقم يُثبت الحجم والقصة تُثبت أن وراء كل رقم إنساناً بملامح وحياة حقيقية.',
                en: 'What has changed so far, with numbers and one human story. The number proves the scale and the story proves there is a real person with real features and a real life behind every number.',
              },
            },
            {
              title: { ar: 'الطلب', en: 'The ask' },
              text: {
                ar: 'ماذا تطلب بالضبط وبماذا سيُستخدم: مبلغاً محدّداً لغرض محدّد، أو شراكة في نشاط معيّن، أو وصولاً إلى شبكة بعينها. كلّما كان أدقّ، كان أسهل قبولاً.',
                en: 'Exactly what you are asking for and how it will be used: a specific amount for a specific purpose, partnership in a defined activity, or access to a particular network. The more specific it is, the easier it is to say yes to.',
              },
            },
          ],
        },
        {
          type: 'list',
          items: {
            ar: [
              'تدرّب على عرضك بصوت عالٍ مع مؤقّت — لا في رأسك. الوقت الفعلي للكلام دائماً يختلف عن الوقت المتخيَّل بفارق كبير',
              'إذا أُعطيت خمس دقائق حضّر لأربع — تترك دقيقة للأسئلة أو لأي تأخير طبيعي',
              'الشريحة الواحدة فكرة واحدة. عشر شرائح مكتظّة بالنصوص أسوأ بكثير من ثلاث شرائح مقروءة وواضحة',
              'حضّر للسؤال الذي يخيفك أكثر من غيره — لأنه السؤال الذي سيُسأل حتماً',
              'إذا جاء وقتك ولم تنتهِ، أوجز ولا تتجاوز الوقت الممنوح — احترام الوقت هو نفسه رسالة عن احترافيتك',
            ],
            en: [
              'Practise your pitch aloud with a timer — not in your head. Actual speaking time always differs significantly from imagined time',
              'If given five minutes, prepare for four — leave a minute for questions or natural delay',
              'One slide, one idea. Ten slides crammed with text are far worse than three clear and readable ones',
              'Prepare for the question that frightens you most — because it is the question that will certainly be asked',
              'If your time comes and you are not finished, summarise and do not go over — respecting time is itself a message about your professionalism',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'ps-q5',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'لديك خمس دقائق لعرض مشروعك أمام شريك محتمل. وصلت إلى الدقيقة الرابعة ولم تصل بعد إلى الطلب. ماذا تفعل؟',
            en: 'You have five minutes to present your project to a potential partner. You have reached minute four and have not yet reached the ask. What do you do?',
          },
          options: [
            { ar: 'تكمل كما حضّرت وتتجاوز الوقت قليلاً لأن المحتوى مهمّ ولا يمكن حذفه', en: 'Continue as prepared and go slightly over time because the content is important and cannot be cut' },
            { ar: 'تحذف ما تبقّى وتقول طلبك مباشرةً في جملتين ثم تتوقّف', en: 'Drop what remains and state your ask directly in two sentences, then stop' },
            { ar: 'تطلب من المستضيف وقتاً إضافياً لإكمال العرض', en: 'Ask the host for extra time to complete the presentation' },
            { ar: 'تحذف الطلب وترسل التفاصيل كاملة بالبريد الإلكتروني بعد الاجتماع', en: 'Drop the ask and send the full details by email after the meeting' },
          ],
          correct: 1,
          feedback: {
            ar: 'تجاوز الوقت يقول إنك لم تحضّر جيداً أو تضع محتواك فوق احترام وقت شريكك. وحذف الطلب يعني أن هذا الاجتماع لم ينتِج قراراً. الشجاعة الحقيقية هي حذف ما لا يتّسع له الوقت والوصول إلى الطلب — لأن الطلب هو أهمّ جملة في أي عرض.',
            en: 'Going over time says you either did not prepare well or place your content above respecting your partner\'s time. Dropping the ask means this meeting produced no decision. Real courage is cutting what time does not allow and reaching the ask — because the ask is the most important sentence in any presentation.',
          },
        },
        {
          type: 'quiz',
          id: 'ps-q6',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'بعد انتهاء عرضك، يسألك الشريك المحتمل: «ما الفرق الجوهري بين مشروعكم وما تفعله منظمة مجاورة تعمل في نفس المجال؟» كيف تجيب؟',
            en: 'After your presentation ends, the potential partner asks: "What is the fundamental difference between your project and what a neighbouring organisation does in the same field?" How do you answer?',
          },
          options: [
            { ar: 'تقول إن نهجكم أفضل وأن المنظمة الأخرى لا تحقّق النتائج نفسها رغم ميزانيتها الأكبر وفريقها الأوسع', en: 'Say your approach is better and that the other organisation does not achieve the same results despite its larger budget and bigger team' },
            { ar: 'تحدّد الفارق المحدّد في المنهج أو الجمهور أو الجغرافيا من دون تنقيص الآخرين', en: 'Identify the specific difference in approach, audience, or geography without denigrating the others' },
            { ar: 'تقول إنكم مختلفون تماماً وتتركه يكتشف الفارق بنفسه حين يقارن التقارير المنشورة', en: 'Say you are completely different and leave them to discover the difference themselves by comparing published reports' },
            { ar: 'تتجنّب المقارنة وتعود إلى نقاط قوّة مشروعك وحده حتى لا تبدو ناقداً لزملاء في القطاع', en: 'Avoid the comparison and return solely to your project\'s strengths so you do not appear critical of colleagues in the sector' },
          ],
          correct: 1,
          feedback: {
            ar: 'سؤال التميّز مشروع تماماً — الشريك لا يريد تمويل جهد مكرَّر. الإجابة الجيدة تعرف فعلاً ما تفعله المنظمة الأخرى وتحدّد الفارق بصدق: «هم يعملون في المدن ونطاقنا القرى النائية، ونهجنا يعتمد على...» انتقاد الآخرين يشير إلى غياب الثقة بالنفس. والتهرّب يشير إلى غياب المعرفة. الوضوح المحدّد يشير إلى احترافية حقيقية.',
            en: 'A question about distinction is entirely legitimate — the partner does not want to fund duplicated effort. A good answer actually knows what the other organisation does and identifies the difference honestly: "They work in cities and our scope is remote villages, and our approach relies on…" Criticising others signals a lack of self-confidence. Evasion signals a lack of knowledge. Specific clarity signals real professionalism.',
          },
        },
      ],
    },
  ],
};
