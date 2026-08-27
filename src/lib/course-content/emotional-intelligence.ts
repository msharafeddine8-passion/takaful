import type { CourseContent } from './types';

/**
 * Level 4 — Emotional Intelligence and Building Trust. Pass mark 70.
 *
 * The course runs in order because the skills build on each other: you cannot
 * empathise well with someone else's reaction if you have not yet learned to
 * notice your own. Self-awareness comes first, then empathy, then the
 * conditions that make honesty possible inside a team, then apology, and
 * finally what trust is and how it is rebuilt when it breaks.
 *
 * Throughout, the emphasis is on the specific — the sentence you say, the
 * second you pause, the thing you do not promise — rather than abstract advice.
 * Emotional intelligence in voluntary work is not a personality trait;
 * it is a set of concrete practices.
 */

export const emotionalIntelligence: CourseContent = {
  slug: 'emotional-intelligence',
  level: 4,
  minutes: 35,
  passMark: 70,
  title: {
    ar: 'الذكاء العاطفي وبناء الثقة',
    en: 'Emotional Intelligence and Building Trust',
  },
  lede: {
    ar: 'أن تعرف ما تشعر به قبل أن تتصرّف، وأن تتعاطف من دون أن تتجاوز الحدود، وأن تُعيد بناء ثقة انكسرت.',
    en: 'Knowing what you feel before you act, showing empathy without crossing a boundary, and rebuilding trust after it breaks.',
  },
  outcomes: {
    ar: [
      'تتعرّف على انفعالك وتؤجّل الرد حين يلزم',
      'تتعاطف مع شخص من دون أن تعد بما لا تملك',
      'تبني أماناً نفسياً في فريق يسمح بالاعتراف بالخطأ',
      'تعتذر اعتذاراً يُصلح بدل أن يدافع',
    ],
    en: [
      'Recognise your own reaction and hold a reply when you need to',
      'Show empathy without promising what is not yours to give',
      'Build the psychological safety in a team that makes admitting a mistake possible',
      'Apologise in a way that repairs rather than defends',
    ],
  },
  sources: [
    'Daniel Goleman — Emotional Intelligence: Why It Can Matter More Than IQ (1995)',
    'Amy Edmondson — The Fearless Organisation: Creating Psychological Safety in the Workplace (2018)',
    'IFRC Volunteering Policy and Volunteer Well-being Framework (2022)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'ei-self-awareness',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'وعي الانفعال الذاتي', en: 'Recognising Your Own Reaction' },
      lede: {
        ar: 'قبل أن تتصرّف، ثمّة لحظة تستطيع أن تلاحظ فيها ما يجري داخلك. هذه اللحظة هي مفتاح الذكاء العاطفي.',
        en: 'Before you act, there is a moment in which you can notice what is happening inside you. That moment is the key to emotional intelligence.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الذكاء العاطفي لا يعني أنّك لا تشعر بالغضب أو القلق أو الإحباط. يعني أنّك تلاحظ هذه المشاعر قبل أن تسمح لها بأن تقرّر نيابةً عنك. حين تشعر بالضيق في موقف ما، ثمّة استجابة فيزيولوجية تبدأ في ثوانٍ: يرتفع معدّل نبض القلب، وتنقبض العضلات، ويضيق التنفّس، وينشغل الدماغ بما يبدو تهديداً حقيقياً أو متخيَّلاً. الردّ الذي يصدر من هذا المكان غالباً سريع ودفاعي وصعب التراجع عنه لاحقاً. أمّا الردّ الذي يصدر بعد لحظة من الإدراك — «أنا أشعر بالاستياء الآن» — فردّ اخترته أنت، لا اختارك هو. الوعي الذاتي ليس تمريناً نفسياً اختيارياً للمهتمّين بالتطوير الشخصي؛ هو المهارة الأساسية التي تجعل كلّ المهارات الأخرى ممكنة في التعامل مع الفريق والمستفيدين والمواقف الصعبة. المتطوّع الذي يتعلّم أن يُلاحظ انفعاله يملك خياراً. من لا يُلاحظه يُنفّذ ردّ فعله ثم يشرح بعد ذلك لماذا.',
            en: 'Emotional intelligence does not mean you stop feeling anger, anxiety or frustration. It means you notice those feelings before you let them decide on your behalf. When you feel distressed in a situation, a physiological response begins within seconds: heart rate rises, muscles tighten, breathing narrows, and the brain focuses on what seems like a real or imagined threat. The response that comes from that place is usually fast, defensive, and hard to walk back. The response that comes after a moment of awareness — "I am feeling irritated right now" — is one you have chosen, not one that chose you. Self-awareness is not an optional psychological exercise for people interested in personal development; it is the foundational skill that makes every other skill possible in dealing with the team, beneficiaries and difficult situations. The volunteer who learns to notice their reaction has a choice. One who does not notice carries out a reaction and then explains why afterwards.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'تسارع التنفّس أو اتّساعه المفاجئ حين يُستفَزّ أحدٌ',
              'شعور بالحرارة في الوجه أو الرقبة أو الصدر',
              'رغبة في قطع الحديث أو الإجابة قبل انتهاء جملة الطرف الآخر',
              'الإحساس بأنّ كلّ ما يُقال خاطئ أو هجوم شخصي',
              'انشغال الذهن بإعداد الردّ بدلاً من سماع ما يُقال',
              'أجسام مشدودة — فكّ، كتفان، يدان مضمومتان على غير عادة',
              'رغبة مفاجئة في إنهاء الاجتماع أو الخروج من الحديث',
            ],
            en: [
              'Breathing that speeds up or goes shallow when someone is provoked',
              'A feeling of heat in your face, neck or chest',
              'An urge to cut off the conversation or answer before the other person has finished',
              'The sense that everything being said is wrong or a personal attack',
              'A mind that is preparing a reply rather than listening to what is being said',
              'Tightened muscles — jaw, shoulders, hands clenched in an uncharacteristic way',
              'A sudden wish to end the meeting or leave the conversation',
            ],
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'التوقّف قبل الردّ', en: 'Pausing before replying' },
              text: {
                ar: 'عشر ثوانٍ من الصمت المقصود قبل الردّ على كلام أشعل انفعالك تكفي لأن ينتقل الدماغ من وضع الاستجابة الفورية إلى وضع الاختيار. الجملة البسيطة «أحتاج لحظة قبل أن أردّ» ليست اعترافاً بالضعف — هي إعلان عن السيطرة.',
                en: 'Ten seconds of deliberate silence before responding to something that has triggered you is enough for the brain to move from immediate-response mode to choice mode. The simple sentence "I need a moment before I reply" is not an admission of weakness — it is a declaration of control.',
              },
            },
            {
              title: { ar: 'التسمية الداخلية للشعور', en: 'Naming the feeling internally' },
              text: {
                ar: 'قول «أنا غاضب» في داخلك — وليس لأحد — يُخفّف حدّة الانفعال فيزيولوجياً. هذا ما تُثبته أبحاث التصوير الدماغي: تسمية الشعور تُنشّط الفصّ الأمامي المسؤول عن التحكّم وتُخفّف نشاط اللوزة المسؤولة عن الذعر.',
                en: 'Saying "I am angry" to yourself — not to anyone — physiologically reduces the intensity of the emotion. This is what brain imaging research confirms: naming the feeling activates the prefrontal cortex responsible for regulation and dampens the amygdala responsible for alarm.',
              },
            },
            {
              title: { ar: 'الرجوع إلى الهدف', en: 'Returning to the purpose' },
              text: {
                ar: 'سؤال «ما الذي أريد أن يحدث في نهاية هذا الحديث؟» يُعيد انتباهك من الانفعال إلى الغاية. كثيراً ما يكون الجواب شيئاً لا يستلزم الردّ الذي كنت على وشك أن تقوله.',
                en: 'The question "what do I want to have happened at the end of this conversation?" redirects your attention from the reaction to the purpose. Very often the answer is something that does not require the response you were about to give.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'warn',
          title: {
            ar: 'الردّ الفوري ليس دليل قوّة',
            en: 'An immediate response is not a sign of strength',
          },
          content: {
            ar: 'المبادرة بالردّ في اللحظة ذاتها قد تبدو حسماً وثقةً، لكنّها كثيراً ما تعني فقدان السيطرة على توقيت الرسالة ومضمونها معاً. جملة «سأعود إليك في هذا بعد قليل» أو حتى صمت عشر ثوانٍ تعطيك مسافة تُصدر منها رداً تختاره أنت. هذا ليس تراجعاً — هو الفرق بين من يملك انفعاله ومن يُسيّره انفعاله أمام الجميع.',
            en: 'Responding in the very moment can look decisive and confident, but it often means losing control of both the timing and the content of your message. Saying "I will come back to you on this in a moment" or even staying silent for ten seconds gives you the distance from which to deliver a response you have actually chosen. This is not retreat — it is the difference between someone who owns their reaction and someone whose reaction drives them in front of everyone.',
          },
        },
        {
          type: 'quiz',
          id: 'ei-q1',
          label: { ar: 'موقف من الميدان', en: 'A field scenario' },
          scenario: {
            ar: 'في اجتماع الفريق الأسبوعي، انتقد أحد الأعضاء طريقة تنظيمك لنشاط سابق أمام بقية المجموعة بأسلوب يبدو لك فيه قسوة غير ضرورية. شعرت بدفء في وجهك وبرغبة في الردّ الفوري بدفاع مفصّل عن كل قرار اتّخذته.',
            en: 'In the weekly team meeting, one member criticised the way you organised a previous activity in front of the rest of the group, in a way that feels unnecessarily harsh to you. You feel heat in your face and a strong urge to respond immediately with a detailed defence of every decision you made.',
          },
          question: {
            ar: 'ما الخطوة الأولى التي يدعو إليها الذكاء العاطفي في هذا الموقف؟',
            en: 'What is the first step emotional intelligence asks of you in this situation?',
          },
          options: [
            {
              ar: 'الردّ فوراً بتفصيل ودقّة لإثبات أنّ النقد غير دقيق قبل أن يصدّقه بقيّة الفريق',
              en: 'Respond immediately and in detail to show the criticism is inaccurate before the rest of the team believes it',
            },
            {
              ar: 'الانتباه إلى الانفعال الداخلي وإعطاء نفسك لحظة قبل الردّ',
              en: 'Notice your internal reaction and give yourself a moment before you respond',
            },
            {
              ar: 'الصمت التام وعدم الردّ على النقد لتجنّب تصعيد الموقف أمام المجموعة',
              en: 'Stay completely silent and give no response to the criticism to avoid escalating in front of the group',
            },
            {
              ar: 'طلب تأجيل الاجتماع وإعادة النقاش في يوم آخر',
              en: 'Ask to postpone the meeting and revisit the discussion on another day',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الوعي الذاتي لا يطلب الصمت الكامل ولا المغادرة — يطلب لحظة بين الانفعال والردّ. هذه اللحظة تُتيح لك أن تُقرّر ردّاً بدلاً من أن يُقرّره الانفعال نيابةً عنك. الردّ الفوري بالدفاع المفصّل يُشعل الاجتماع ويُحوّل نقاشاً مهنياً إلى مواجهة شخصية. والصمت التام قد يُفهَم كإقرار بالخطأ أو كتحدٍّ صامت. ما بينهما — لحظة ملاحظة الانفعال ثم ردّ مدروس — هو ما يصفه الذكاء العاطفي.',
            en: 'Self-awareness does not ask for complete silence or for leaving — it asks for a moment between the feeling and the response. That moment lets you choose a reply rather than letting the reaction choose for you. An immediate defensive response ignites the meeting and turns a professional discussion into a personal confrontation. Complete silence may be read as conceding the point or as a silent challenge. What lies between — a moment of noticing the reaction, then a considered reply — is what emotional intelligence describes.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'ei-empathy',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'التعاطف بلا وعود لا تملكها', en: 'Empathy Without Promises You Cannot Keep' },
      lede: {
        ar: 'أن تتعاطف لا يعني أن تحلّ المشكلة. يعني أن تجعل الشخص يشعر أنّك تسمعه — وهذا وحده يغيّر الكثير.',
        en: 'Empathy does not mean solving the problem. It means making the person feel heard — and that alone changes a great deal.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'بين التعاطف الحقيقي والعبارات المريحة مسافة يُدركها من يسمعها بوضوح. حين يُخبرك متطوّع أنّه يشعر بالإرهاق ويفكّر في الانسحاب، من السهل أن تقول «كلّنا نمرّ بهذا» أو «الأمور ستتحسّن». هاتان الجملتان تُقفلان الحديث بدلاً من فتحه: الأولى تُصغّر ما يشعر به بجعله ظاهرة عامة لا خبرة شخصية، والثانية تُقدّم وعداً لا تملكه ولا يقرّره أحد. التعاطف الحقيقي هو أن تعكس ما سمعتَه — «يبدو أنّك في مكان صعب الآن» — من دون أن تتسرّع إلى الحلول أو الطمأنة أو الحكايات المشابهة. الشخص يحتاج أن يُسمع قبل أن يُساعَد، وكثيراً ما يكون السماع هو المساعدة نفسها. والوعد الذي لا تملكه أشدّ ضرراً على الثقة من الصمت المحترم: «أنا متأكّد أن الأمور ستتحسّن» كلمات حسنة النية، لكنّها ليست كلمات يملكها المتطوّع الذي يقولها، وحين تُكذَّب يخسر الشخص ثقته بك — وليس مشكلته وحدها.',
            en: 'The distance between real empathy and comfortable phrases is clear to whoever hears them. When a volunteer tells you they feel exhausted and are thinking of leaving, it is easy to say "we all go through this" or "things will get better". Both sentences close the conversation rather than open it: the first minimises the feeling by making it a general phenomenon rather than a personal experience, the second offers a promise nobody holds. Real empathy is reflecting what you heard — "it sounds like you are in a hard place right now" — without rushing to solutions, reassurance or similar stories. The person needs to feel heard before they can be helped, and very often being heard is the help itself. And the promise you cannot keep does more damage to trust than respectful silence: "I am sure things will get better" is well-intentioned, but not something the volunteer saying it controls, and when it proves wrong the person loses their trust in you — not just their problem.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'تعاطف يُقرّب', en: 'Empathy that draws closer' },
          noTitle: { ar: 'ردّ يُبعد', en: 'A response that distances' },
          yes: {
            ar: [
              '«يبدو أن هذا كان صعباً فعلاً — أخبرني أكثر»',
              '«أسمعك. ما الذي تحتاجه الآن؟»',
              '«أنا هنا وليس عليك أن تشرح كل شيء دفعةً واحدة»',
              '«لا أعرف ما هو الحل، لكنّني لن أتركك تواجه هذا وحدك»',
            ],
            en: [
              '"That sounds genuinely hard — tell me more"',
              '"I hear you. What do you need right now?"',
              '"I\'m here and you don\'t have to explain everything at once"',
              '"I don\'t know what the answer is, but I\'m not leaving you to face this alone"',
            ],
          },
          no: {
            ar: [
              '«كلّنا نمرّ بضغط — الأمور ستتحسّن»',
              '«ما كانش لازم تأخذ الأمور بهالطريقة»',
              '«أنا واثق أنّك قادر على تجاوزها»',
              '«عندي نفس المشكلة — دعني أحدّثك عنها»',
            ],
            en: [
              '"We all go through pressure — things will get better"',
              '"You shouldn\'t let it affect you like this"',
              '"I\'m sure you can get through it"',
              '"I have the same problem — let me tell you about mine"',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'ما لا تملكه لا تعِد به', en: 'Do not promise what is not yours to give' },
          content: {
            ar: 'التطوّع يضع المتطوّع أحياناً في مواقف يُسأل فيها عن أشياء لا يقرّرها هو. «هل ستستمرّ برامج المنظمة في العام القادم؟» «هل ستُدفع نفقات التنقّل؟» الإجابة الصادقة «لا أعرف، وسأسأل من يعرف ثم أعود إليك» أقوى على المدى البعيد من وعد يتبيّن لاحقاً أنّه كان مجرّد تطمين. الشخص الذي يعرف حدود ما يملك يبني مصداقية حقيقية؛ والشخص الذي يعِد بما لا يملكه يخسرها في أوّل امتحان.',
            en: 'Volunteering sometimes places you in situations where you are asked about things you do not control. "Will the organisation\'s programmes continue next year?" "Will transport costs be paid?" The honest answer — "I don\'t know, and I will find out from the person who does and come back to you" — is stronger over time than a promise that later proves to have been empty reassurance. A person who knows the limits of what they hold builds real credibility; one who promises what they do not have loses it at the first test.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'أسئلة تفتح الحوار: «ما الذي يُزعجك أكثر في هذا الموقف؟» — «ماذا تحتاج الآن؟» — «كيف يمكنني مساعدتك؟»',
              'جمل تعكس ما سمعته: «إذا فهمتُ صحيح، أنت تشعر بـ...» — «يبدو أنّ هذا مرهق فعلاً»',
              'عبارات تُبقي الفضاء مفتوحاً: «لست مضطراً لشرح كل شيء الآن» — «أنا هنا حين تحتاج»',
              'ما يُبعد: «ستعدي وسيمرّ» — «الكلّ يمرّ بهذا» — «كان ينبغي أن تتوقّع ذلك»',
              'الصمت المقصود: أحياناً البقاء بهدوء بلا إجابة فورية هو أقوى شكل من أشكال الحضور',
            ],
            en: [
              'Questions that open conversation: "What bothers you most about this?" — "What do you need right now?" — "How can I help?"',
              'Phrases that reflect what you heard: "If I understand correctly, you are feeling..." — "That sounds genuinely exhausting"',
              'Expressions that keep the space open: "You don\'t have to explain everything now" — "I\'m here when you need me"',
              'What pushes away: "It will pass" — "Everyone goes through this" — "You should have expected that"',
              'Deliberate silence: sometimes staying quietly present without an immediate answer is the strongest form of support',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'ei-q2',
          label: { ar: 'سيناريو', en: 'Scenario' },
          question: {
            ar: 'جاءك متطوّع يقول إنّه يشعر بأن جهوده لا تُقدَّر في الفريق ويفكّر في التوقّف عن التطوّع. أيّ ردّ يعكس تعاطفاً حقيقياً من دون وعد لا تملكه؟',
            en: 'A volunteer comes to tell you they feel their efforts are not appreciated by the team and are considering stopping volunteering. Which response shows genuine empathy without a promise you cannot keep?',
          },
          options: [
            {
              ar: '«أنا متأكّد أن الجميع يقدّر ما تفعله — ربّما لم يُعبّروا عنه بوضوح»',
              en: '"I am sure everyone appreciates what you do — they probably just haven\'t expressed it clearly"',
            },
            {
              ar: '«هذا يبدو مؤلماً فعلاً. ما الذي جعلك تشعر بهذا؟»',
              en: '"That sounds genuinely painful. What has been making you feel this way?"',
            },
            {
              ar: '«كلّنا نشعر بهذا أحياناً — الأمور ستتحسّن»',
              en: '"We all feel that sometimes — things will improve"',
            },
            {
              ar: '«سأتكلّم مع القيادة وسأضمن أن يُشار إلى جهودك في الاجتماع القادم»',
              en: '"I will speak to leadership and make sure your efforts are mentioned at the next meeting"',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الخيار الأوّل يُطمئن بافتراض لا تعرفه — ليست لديك معرفة بما يفكّر فيه بقية الفريق. الثالث يُقلّل المشكلة بجعلها عامة ويُقدّم وعداً لا سيطرة لك عليه. الرابع وعد تضمينه ليس بيدك ولو أردتَ. الثاني هو الوحيد الذي يُقرّ بأن ما يشعر به حقيقي ويفتح الحوار بدلاً من إغلاقه. التعاطف يبدأ بالسماع لا بالحل.',
            en: 'The first reassures based on an assumption you cannot make — you do not know what the rest of the team thinks. The third minimises the feeling by making it universal and offers a promise outside your control. The fourth is a guarantee you cannot make even if you wanted to. The second is the only one that acknowledges the feeling as real and opens the conversation rather than closing it. Empathy begins with listening, not with solving.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'ei-psych-safety',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'الأمان النفسي في الفريق', en: 'Psychological Safety in the Team' },
      lede: {
        ar: 'الفريق الذي يعترف أعضاؤه بالأخطاء هو الفريق الذي يتعلّم. والأمان النفسي هو ما يجعل الاعتراف ممكناً.',
        en: 'The team whose members admit mistakes is the team that learns. Psychological safety is what makes that admission possible.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الأمان النفسي لا يعني أنّ الفريق لا يختلف ولا يُنتقَد ولا توجد فيه معايير أداء صارمة. يعني أنّ أعضاءه يستطيعون قول «أخطأت» أو «لا أعرف» أو «أختلف مع هذا القرار» من دون خشية السخرية أو العقاب الضمني أو الإقصاء الاجتماعي. وهذا ليس ترفاً نفسياً لفرق لديها وقت فراغ — إنّه شرط العمل الجيّد في أيّ بيئة. فريق يخشى الاعتراف بالأخطاء يُكرّر الخطأ ذاته لأنّ أحداً لم يُعلن أنّه حدث وما الذي أدّى إليه. وفريق يخشى الاختلاف يأخذ قرارات خاطئة لأنّ المعلومة الحقيقية التي كان يملكها أحد الأعضاء لم تُقَل خشية التعارض مع الرأي السائد. والأمان النفسي لا يُبنى بإعلان «هنا يمكنك أن تكون صريحاً» — يُبنى بما يحدث في الدقائق التي تلي أوّل مرّة يكون فيها شخص صريحاً فعلاً ويرى ما الذي تلقّاه.',
            en: 'Psychological safety does not mean the team never disagrees, is never held to account, or has no performance standards. It means its members can say "I was wrong", "I do not know", or "I disagree with this decision" without fear of ridicule, implicit punishment or social exclusion. This is not a psychological luxury for teams with spare time — it is a condition for doing good work in any environment. A team that fears admitting mistakes repeats the same mistake because nobody announced it happened and what led to it. A team that fears disagreement makes bad decisions because the real information one member held was never said, for fear of contradicting the prevailing view. Psychological safety is not built by announcing "you can be honest here" — it is built by what happens in the minutes after the first time someone actually is honest and sees what they receive in return.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'كيف يردّ القائد على الخطأ', en: 'How the leader responds to a mistake' },
              text: {
                ar: 'حين يعترف متطوّع بخطأ ويُقابَل بـ«كيف تفعل هذا؟»، يتعلّم الفريق كلّه ألّا يعترف في المرّة القادمة. وحين يُقابَل بـ«شكراً لإخبارنا — ما الذي نعدّله حتى لا يتكرّر؟»، يتعلّم الفريق أنّ الاعتراف آمن وأنّ المشكلة تُحَلّ لا يُعاقَب عليها.',
                en: 'When a volunteer admits a mistake and is met with "how could you do this?", the whole team learns not to admit mistakes next time. When they are met with "thank you for telling us — what do we change so it does not happen again?", the team learns that admission is safe and that problems are solved rather than punished.',
              },
            },
            {
              title: { ar: 'الاختلاف في الاجتماعات', en: 'Disagreement in meetings' },
              text: {
                ar: 'إن كانت كلّ قرارات الفريق تُؤخذ بموافقة فورية ولا يُسمع نقاش يُذكر، فالاجتماعات ليست للتفكير — إنّها للتصديق الرسمي على ما قرّره أحدهم مسبقاً. الاختلاف الذي يُعبَّر عنه باحترام هو علامة صحّة، لا مؤشّر على توتّر بين الأعضاء.',
                en: 'When every team decision is taken with immediate agreement and barely any discussion, meetings are not for thinking — they are formal ratification of what someone decided beforehand. Respectfully expressed disagreement is a sign of health, not an indicator of tension among members.',
              },
            },
            {
              title: { ar: 'السؤال من دون حرج', en: 'Asking without embarrassment' },
              text: {
                ar: 'حين يُسأل «من يفهم هذا الإجراء الجديد؟» ولا يرفع أحد يده رغم عدم فهم كثيرين، الفريق يعاني أماناً نفسياً منخفضاً. وبناء ثقافة «لا سؤال محرج» يبدأ بأن يُبادر القائد بالأسئلة الأساسية أوّلاً، فيُبيّن أنّه لا يفترض أنّ الجميع يفهم كل شيء.',
                en: 'When "who understands this new procedure?" is asked and nobody raises a hand despite many not understanding, the team has low psychological safety. Building a "no question is embarrassing" culture starts with the leader asking the basic questions first, showing they do not assume everyone already understands everything.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'الأمان لا يعني غياب المساءلة', en: 'Safety does not mean the absence of accountability' },
          content: {
            ar: 'فريق آمن نفسياً يعترف بالأخطاء ليُصلحها لا ليُسامح عليها ويمضي دون تعلّم. الأمان والمساءلة ليسا نقيضين — الأمان هو الشرط الذي يجعل المساءلة عادلة وفعّالة بدلاً من أن تكون عقاباً يجعل الناس يُخفون الأخطاء. مساءلة بلا أمان تُنتج فرقاً تُخفي الأخطاء. وأمان بلا مساءلة يُنتج فرقاً تُهمِل المعايير. الاثنان معاً ضروريّان.',
            en: 'A psychologically safe team admits mistakes to fix them, not to be forgiven and move on without learning. Safety and accountability are not opposites — safety is the condition that makes accountability fair and effective rather than a punishment that makes people hide errors. Accountability without safety produces teams that conceal mistakes. Safety without accountability produces teams that neglect standards. Both together are necessary.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'ابدأ بنفسك: اعترف بخطأ أو بعدم معرفة أمام الفريق — فمن لا يرى القائد يعترف لن يعترف هو',
              'اشكر كلّ اعتراف — حتى الصغير: «شكراً لإخبارنا» تعيد تعريف ما هو مقبول في هذا الفريق',
              'افصل بين تقييم الشخص وتقييم القرار: «هذا القرار ليس الأنسب» مختلف عن «أنت لم تُحسن»',
              'اسأل عن الرأي المختلف صراحةً: «هل يرى أحد هذا بطريقة مختلفة؟» يفتح الباب لمن يُحجم',
              'أعط الوقت الكافي قبل القرار: الاستعجال يُقلّص الأمان — من لا يجد وقتاً للتفكير يوافق بصمت',
            ],
            en: [
              'Start with yourself: admit a mistake or a gap in knowledge in front of the team — those who never see the leader admit anything will not admit anything themselves',
              'Thank every admission — even small ones: "thank you for telling us" redefines what is acceptable in this team',
              'Separate evaluating the person from evaluating the decision: "this decision is not the best fit" is different from "you didn\'t do well"',
              'Explicitly ask for the different view: "does anyone see this differently?" opens the door for those who hesitate',
              'Allow enough time before deciding: rushing shrinks safety — someone given no time to think agrees silently',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'ei-q3',
          label: { ar: 'موقف قيادي', en: 'A leadership moment' },
          question: {
            ar: 'في اجتماع تقييم نشاط، اعترف متطوّع أمام الفريق بأنّه نسي تسجيل حضور المشاركين مما أخّر إعداد تقرير المنظمة. كيف يردّ القائد بطريقة تُعزّز الأمان النفسي؟',
            en: 'In an activity evaluation meeting, a volunteer admits to the team that they forgot to record participant attendance, delaying the organisation\'s report. How should the leader respond in a way that builds psychological safety?',
          },
          options: [
            {
              ar: '«هذا غير مقبول — يجب أن تعرف مدى أهمية تسجيل الحضور للتقرير وللتمويل، وهذا أمر يعرفه كلّ من في الفريق»',
              en: '"This is not acceptable — you should know how important attendance registration is for the report and for the funding, and that is something everyone on the team knows"',
            },
            {
              ar: '«شكراً لأمانتك. ما الذي أدّى إلى نسيان التسجيل هذه المرّة وكيف نتجنّبه في المرّات القادمة؟»',
              en: '"Thank you for being honest. What led to registration being missed this time and how do we prevent it going forward?"',
            },
            {
              ar: '«لا بأس — هذه مجرّد تفاصيل إدارية لا تؤثّر على العمل الحقيقي، وسنكمل التقرير من ذاكرة الحاضرين»',
              en: '"No worries — these are just administrative details that don\'t affect the real work, and we will complete the report from what people remember"',
            },
            {
              ar: '«سنتكلّم في هذا الأمر بيني وبينك بعد انتهاء الاجتماع حتى لا نأخذ من وقت الفريق»',
              en: '"We will discuss this matter between you and me after the meeting ends so we do not take up the team\'s time"',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الردّ الأوّل يُعاقب الصدق ويُعلّم الفريق ألّا يعترف بالمشاكل في المستقبل. الثالث يُقلّل الأثر ويُضيّع فرصة تحسين العملية. الرابع قد يكون ملائماً لمناقشات تفصيلية لكنّه يُخرج الاعتراف من الفضاء الجماعي حيث يكون له قيمة نموذجية. الثاني يشكر الصدق ويُحوّل الطاقة نحو الحل بدلاً من اللوم — وهذا ما يُعلّم الفريق أنّ الاعتراف آمن ومفيد لا خطير.',
            en: 'The first response punishes honesty and teaches the team not to admit problems in the future. The third minimises the impact and wastes a process improvement opportunity. The fourth may suit detailed follow-up discussions but removes the admission from the collective space where it has model value. The second thanks the honesty and redirects energy toward the fix rather than blame — which teaches the team that admission is safe and useful, not dangerous.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'ei-apology',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'الاعتذار الذي يُصلح', en: 'The Apology That Repairs' },
      lede: {
        ar: 'الاعتذار الحقيقي لا يدافع عن النية — يُقرّ بالأثر، ويتحمّل المسؤولية، ويُعطي الطرف الآخر مساحةً للقرار.',
        en: 'A real apology does not defend the intention — it acknowledges the impact, takes responsibility, and gives the other person the space to decide.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الاعتذار الدفاعي يبدأ غالباً بـ«آسف لكن...» أو «ما كانت قصدي كذا». هاتان الجملتان لا تنقضان الاعتذار وحسب — تُحوّلانه إلى شرح مسوَّغ لما جرى، والشخص الذي تأثّر يجد نفسه فجأةً في موقف يُلزَم فيه بتقبّل العذر بدلاً من أن يُسمع أوّلاً. الفرق الجوهري بين الاعتذار الذي يُصلح والاعتذار الذي يدافع بسيط: الأوّل يتكلّم عن أثر ما حدث على الطرف الآخر، والثاني يتكلّم عن نية المعتذر. والنية، مهما كانت طيّبة، لا تلغي الأثر. الشخص الذي يؤذيه شيء لا يحتاج أن يعرف أنّك لم تُرِد أذاه — يحتاج أن يعرف أنّك تفهم ما حدث له وأنّ شيئاً ما سيتغيّر. الاعتذار الذي يُصلح يفعل أربعة أشياء بالتسلسل: يُسمّي ما حدث بالتحديد من دون تقليله، يُقرّ بأثره على الطرف الآخر بكلمات الطرف الآخر لا بكلماتك أنت، يتحمّل المسؤولية من دون «لكن» تنسفها، ويقول ما سيتغيّر فعلاً في السلوك. ولا يُلزَم الطرف الآخر بقبول الاعتذار فور سماعه — هذا حقّه، ومطالبته بالقبول الفوري إضافة جرح فوق الجرح الأوّل.',
            en: 'A defensive apology usually begins with "sorry but..." or "that was not my intention". These phrases do not just undermine the apology — they convert it into a justified explanation of what happened, and the person affected suddenly finds themselves obliged to accept the excuse rather than being heard first. The essential difference between an apology that repairs and one that defends is simple: the first talks about the impact on the other person; the second talks about the apologising person\'s intention. And intention, however good, does not cancel impact. The person who is hurt does not need to know you did not mean to hurt them — they need to know you understand what happened to them and that something will change. An apology that repairs does four things in sequence: names what happened specifically without minimising, acknowledges its impact on the other person in their terms not yours, takes responsibility without a "but" that undoes it, and says what will actually change in behaviour. The other person is not obliged to accept the apology immediately — that is their right, and demanding immediate acceptance is adding a second injury on top of the first.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'سمِّ ما حدث بالتحديد وبدون تقليله: «قاطعتُك ثلاث مرّات أثناء شرحك أمام الفريق»',
              'أقرّ بالأثر على الطرف الآخر بكلمات واضحة: «هذا جعلك تشعر أنّ رأيك لا يُكتمَل ولا يُسمَع»',
              'تحمّل المسؤولية — بدون «لكن» بعدها: «أنا مسؤول عن ذلك»',
              'قل ما سيتغيّر بشكل ملموس: «لن أقاطعك في الاجتماعات. وإن أردتُ إضافةً سأنتظر حتى تنتهي»',
              'أعطِ الطرف الآخر مساحةً للردّ: «أفهم إن كنتَ بحاجة إلى وقت قبل أن تردّ على هذا»',
            ],
            en: [
              'Name what happened specifically and without minimising: "I interrupted you three times while you were explaining to the team"',
              'Acknowledge the impact on the other person in clear terms: "This made you feel your view was neither complete nor heard"',
              'Take responsibility — without a "but" afterwards: "I am responsible for that"',
              'Say what will change concretely: "I will not interrupt you in meetings. If I want to add something I will wait until you have finished"',
              'Give the other person space to respond: "I understand if you need time before you reply to this"',
            ],
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'اعتذار يُصلح', en: 'An apology that repairs' },
          noTitle: { ar: 'اعتذار يدافع', en: 'An apology that defends' },
          yes: {
            ar: [
              '«أنا آسف. ما فعلتُه جعلكَ تشعر بأنّ رأيك لا قيمة له — وهذا لم يكن عادلاً»',
              '«أقرّ بما حدث، وأعرف أنّ كلمة آسف لا تكفي وحدها — ما الذي سيساعد؟»',
              '«ما الذي سيتغيّر من الآن هو أنّني سأتأكّد من...»',
            ],
            en: [
              '"I am sorry. What I did made you feel your opinion had no value — and that was not fair"',
              '"I acknowledge what happened, and I know sorry by itself is not enough — what would actually help?"',
              '"What changes from now is that I will make sure to..."',
            ],
          },
          no: {
            ar: [
              '«آسف إن كنتَ زعلتَ» — يضع المشكلة في ردّ فعل الطرف الآخر لا في الفعل نفسه',
              '«قصدي لم يكن هكذا» — يُحوّل الحديث من الأثر الحقيقي إلى النية الداخلية',
              '«آسف لكن الضغط كان شديداً والوقت ضيّقاً» — اعتذار ينسف نفسه بنفسه',
            ],
            en: [
              '"Sorry if you were upset" — places the problem in the other person\'s reaction, not in the act itself',
              '"That was not my intention" — shifts the conversation from the real impact to the internal intention',
              '"Sorry but the pressure was intense and time was tight" — an apology that undoes itself',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'الاعتذار مرّتين عن الشيء ذاته يفقد معناه', en: 'Apologising twice for the same thing loses its meaning' },
          content: {
            ar: 'إن تكرّر الخطأ ذاته بعد الاعتذار، فالاعتذار الثاني أضعف من الأوّل، والثالث لا يُسمع تقريباً. ما يُعيد الثقة ليس اعتذاراً جديداً — هو ما يتغيّر فعلاً في السلوك على مدى أسابيع. وأحياناً الصمت والفعل المتّسق أكثر تأثيراً في إصلاح ما كُسر من كلمات جديدة تُضاف فوق كلمات سابقة لم تَصدق.',
            en: 'If the same mistake happens again after the apology, the second apology is weaker than the first, and a third is barely heard. What rebuilds trust is not a new apology — it is what actually changes in behaviour over weeks. Sometimes silence and consistent action repair what is broken more effectively than new words added on top of earlier words that did not prove true.',
          },
        },
        {
          type: 'quiz',
          id: 'ei-q4',
          label: { ar: 'اختر الاعتذار الأصح', en: 'Choose the right apology' },
          scenario: {
            ar: 'في نشاط سابق، قاطعتَ أحد المتطوّعين أمام الفريق بينما كان يشرح فكرةً اقترحها. بعد الاجتماع يأتيك ليقول إنّ هذا جعله يتردّد في المشاركة مستقبلاً وجعله يشعر أنّ آراءه لا تُحترَم.',
            en: 'In a previous activity, you interrupted a volunteer in front of the team while they were explaining an idea they had proposed. After the meeting they come to tell you this made them hesitant to contribute in the future and made them feel their views are not respected.',
          },
          question: {
            ar: 'أيّ ردّ يمثّل اعتذاراً يُصلح لا يدافع؟',
            en: 'Which response represents an apology that repairs rather than defends?',
          },
          options: [
            {
              ar: '«آسف إن كنتَ زعلتَ — ما كانت قصدي أوقفك، كنت متحمّساً جداً للنقاش وحريصاً على الوقت، ولو عرفتُ أنّك ستأخذها هكذا لانتبهتُ أكثر»',
              en: '"Sorry if you were upset — I did not mean to stop you, I was just very excited about the discussion and watching the clock, and if I had known you would take it this way I would have been more careful"',
            },
            {
              ar: '«قاطعتُك أمام الجميع وجعلتُك تشعر أنّ فكرتك لم تُكتمَل. هذا لم يكن عادلاً وأنا آسف. لن أفعل هذا مجدّداً»',
              en: '"I interrupted you in front of everyone and made you feel your idea was not completed. That was not fair and I am sorry. I will not do this again"',
            },
            {
              ar: '«ما كان المقصود إلحاق أيّ أذى — الكلّ يتقاطع في النقاشات وهذا طبيعي في فريق متحمّس»',
              en: '"No harm was intended — everyone interrupts in discussions and that is normal in an enthusiastic team"',
            },
            {
              ar: '«أنا آسف — لكن كانت هناك أفكار كثيرة على الطاولة والوقت المتاح كان ضيّقاً جداً علينا جميعاً»',
              en: '"I am sorry — but there were many ideas on the table and the time available was very tight for all of us"',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الخيار الأوّل يُقدّم النية دليلاً على البراءة ويُقلّل المشكلة بوضعها في شعور الطرف الآخر («إن كنتَ زعلتَ»). الثالث يُعمّم الظاهرة ويُسوّغ الفعل. الرابع ينسف نفسه بـ«لكن» التي تلغي الاعتذار وتُعيد الدفاع. الثاني هو الوحيد الذي يُسمّي ما حدث بالتحديد، يُقرّ بالأثر بكلمات مألوفة للطرف الآخر، يتحمّل المسؤولية دون تحفّظ، ويقول ما سيتغيّر — وهو ترتيب الاعتذار الذي يُصلح.',
            en: 'The first presents intention as evidence of innocence and minimises the problem by placing it in the other person\'s feelings ("if you were upset"). The third generalises and justifies the act. The fourth undoes itself with the "but" that cancels the apology and restores the defence. The second is the only one that names what happened specifically, acknowledges the impact in terms familiar to the other person, takes responsibility without reservation, and says what will change — which is the sequence of an apology that repairs.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'ei-trust',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'بناء الثقة وإعادتها بعد الكسر', en: 'Building and Rebuilding Trust' },
      lede: {
        ar: 'الثقة تُبنى ببطء وتُكسر بلحظة. وإعادة بنائها تستغرق وقتاً أطول — لكنّها ممكنة بسلوك متّسق على مدى كافٍ.',
        en: 'Trust builds slowly and breaks in a moment. Rebuilding it takes longer — but it is possible with consistent behaviour over enough time.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'لا توجد وصفة سريعة لإعادة ثقة كُسرت. الثقة ليست قراراً يُتّخذ — إنّها تجربة متراكمة من التطابق بين الكلام والفعل على مدى وقت يكفي لأن يلاحظه الطرف الآخر. ومن فقد ثقته في شخص أو في مؤسسة لن يستعيدها بوعد واحد أو اعتذار واحد أو لقاء حسن النية، بل بسلوك يُثبت يوماً بعد يوم أنّ التغيير حقيقي ومستمرّ لا موسمي. ما يصعب على من أساء فهمه هو أنّ الطرف الآخر قد لا يُظهر أيّ علامة مبكّرة على التحسّن — حتى وهو يُلاحظ التغيير ويُثمّنه داخلياً. هذا ليس عناداً أو رغبة في العقاب؛ هو حذر طبيعي من الإصابة مرّةً ثانية في المكان ذاته. وكثير من جهود إعادة الثقة تفشل لأنّ من أساء يتوقّع عودة الثقة في الوقت الذي يناسبه هو، لا في الوقت الذي يحتاجه الطرف الآخر للتحقّق أنّ التغيير حقيقي. الصبر هنا ليس ضعفاً — هو جزء من الإصلاح نفسه.',
            en: 'There is no quick recipe for rebuilding broken trust. Trust is not a decision that is made — it is an accumulated experience of words matching actions over enough time for the other person to notice it. Someone who has lost trust in a person or institution will not regain it through a single promise, a single apology, or a well-intentioned meeting, but through behaviour that proves day after day that the change is real and continuous, not seasonal. What is hard for the person who caused harm to understand is that the other party may show no early sign of improvement — even while noticing and internally valuing the change. This is not stubbornness or a wish to punish; it is natural caution against being hurt again in the same place. And many trust-rebuilding efforts fail because the person who caused harm expects trust to return on their own convenient timeline, not on the timeline the other person needs to verify that the change is genuine. Patience here is not weakness — it is part of the repair itself.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'أوفِ بالوعود الصغيرة أوّلاً — الثقة تُبنى من التفاصيل التي لا يراها أحد لا من التصريحات الكبيرة أمام الجميع',
              'كن صريحاً في مواضع الصعوبة بدلاً من إخفائها — الصدق البطيء أقوى على المدى البعيد من الانكشاف المتأخّر',
              'لا تطلب من الطرف الآخر أن يثق بك — طلب الثقة لا يُنتجها، السلوك المتّسق هو الذي يُنتجها',
              'إن أخطأتَ مجدّداً، أقرّ به فوراً بدلاً من الانتظار حتى يُلاحَظ من تلقاء نفسه',
              'امنح الطرف الآخر سرعته الخاصّة في التعافي — لكلّ شخص وقته ولا يُلزَم بالعودة في الموعد الذي يناسبك أنت',
              'تجنّب الإشارة إلى «كم تغيّرتَ» — دعِ الآخرين يقولون ذلك حين يرونه بأنفسهم',
            ],
            en: [
              'Honour small promises first — trust is built from details nobody watches, not large declarations made in front of everyone',
              'Be honest in difficult moments rather than hiding them — slow honesty is stronger over time than late exposure',
              'Do not ask the other person to trust you — asking does not produce trust, consistent behaviour does',
              'If you make a mistake again, acknowledge it immediately rather than waiting for it to be noticed on its own',
              'Give the other person their own pace of recovery — everyone has their own timeline and cannot be required to return on yours',
              'Avoid pointing to "how much you have changed" — let others say that when they see it for themselves',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'الثقة في الفريق ليست رفاهية — إنّها بنية تحتية', en: 'Trust in the team is not a luxury — it is infrastructure' },
          content: {
            ar: 'حين يثق المتطوّعون بعضهم ببعض وبقيادتهم، تُقال المعلومة الصعبة في وقتها قبل أن تتفاقم، وتُطلب المساعدة قبل الانهيار، وتُمرَّر المهام من دون الحاجة إلى مراقبة مستمرة. وحين تُكسر هذه الثقة، يخسر الفريق كلّ ذلك — ليس مشاعر طيّبة وحسب، بل قدرة فعلية على العمل. الفريق الذي يعمل بثقة يُنجز أكثر مما يستطيع فرد واحد، والفريق الذي يعمل بلا ثقة يُنجز أقلّ من مجموع أفراده مجتمعين.',
            en: 'When volunteers trust each other and their leadership, the difficult information gets said in time before it escalates, help is asked for before collapse, and tasks are handed over without need for constant supervision. When this trust breaks, the team loses all of that — not just good feelings, but actual working capacity. A team that works with trust achieves more than any one person could, and a team that works without trust achieves less than the sum of its individual members.',
          },
        },
        {
          type: 'quiz',
          id: 'ei-q5',
          label: { ar: 'موقف من الواقع', en: 'A real-life situation' },
          scenario: {
            ar: 'متطوّع في فريقك يمتلك خبرة في التصميم. في نشاط سابق شعر أنّ القرارات المتعلّقة بالمواد المرئية اتُّخذت من دون الرجوع إليه على الإطلاق، وأبلغك بهذا بعد النشاط. الآن تُخطّط للنشاط القادم وتريد إعادة إشراكه بجدّية حقيقية.',
            en: 'A volunteer on your team has expertise in design. In a previous activity they felt that decisions about visual materials were made without consulting them at all, and told you so after the activity. You are now planning the next activity and want to genuinely re-engage them.',
          },
          question: {
            ar: 'ما الخطوة الأكثر تأثيراً في إعادة بناء الثقة مع هذا المتطوّع؟',
            en: 'What is the most effective step in rebuilding trust with this volunteer?',
          },
          options: [
            {
              ar: 'إخباره أنّ الأمور ستكون مختلفة تماماً في النشاط القادم وأنّك ستستشيره في كل شيء، لأنّ وعداً واضحاً منك كافٍ لطمأنته',
              en: 'Tell him that things will be completely different in the next activity and that you will consult him on everything, since a clear promise from you is enough to reassure him',
            },
            {
              ar: 'الاعتراف بما حدث في النشاط السابق، ثم إشراكه فعلياً في أوّل قرار تصميمي يخصّ النشاط القادم',
              en: 'Acknowledge what happened in the previous activity, then actually involve him in the very first design decision for the next one',
            },
            {
              ar: 'تكثيف التواصل الودّي معه في الأيام التالية لإصلاح العلاقة الشخصية',
              en: 'Increase friendly personal communication with him in the following days to repair the relationship',
            },
            {
              ar: 'إعطاؤه مسؤولية كاملة على جميع المواد المرئية للنشاط القادم لإظهار مدى ثقتك به',
              en: 'Give him full responsibility over all visual materials for the next activity to show how much you trust him',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الإخبار بأنّ الأمور ستتغيّر وعد — والوعد وحده هو ما أُهمِل في المرّة الماضية. التواصل الودّي يُحسّن الأجواء لكنّه لا يُعالج المشكلة الجوهرية التي أبلغك بها: أنّه لم يُستشَر في تخصّصه. وإعطاؤه مسؤولية كاملة فجأةً قد يبدو تعويضاً مبالغاً فيه بدلاً من الإصلاح الحقيقي. الاعتراف بما حدث ثم الرجوع إليه في أوّل قرار حقيقي هو ما يُثبت أنّ التغيير فعلي لا وعد. الثقة تُعاد بالفعل المبكّر والمحدّد، لا بالتصريحات العامّة.',
            en: 'Telling him things will change is a promise — and a promise alone is what was neglected last time. Friendly communication improves the atmosphere but does not address the core problem he reported to you: that he was not consulted in his area of expertise. Suddenly giving him full responsibility may look like overcompensation rather than genuine repair. Acknowledging what happened and then consulting him in the very first real decision is what proves the change is actual rather than promised. Trust is rebuilt through early, specific action, not general declarations.',
          },
        },
        {
          type: 'quiz',
          id: 'ei-q6',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أيّ السلوكيات التالية يُبني ثقةً حقيقية على المدى البعيد في فريق عمل تطوّعي؟',
            en: 'Which of the following behaviours genuinely builds long-term trust in a volunteer working team?',
          },
          options: [
            {
              ar: 'الإعلان في كلّ اجتماع عن مدى أهمية الصدق والثقة كقيم جوهرية للفريق',
              en: 'Announcing at every meeting how important honesty and trust are as core team values',
            },
            {
              ar: 'الوفاء بالمواعيد والوعود الصغيرة باستمرار، والاعتراف بالأخطاء فوراً حين تقع',
              en: 'Consistently keeping appointments and small promises, and acknowledging mistakes immediately when they happen',
            },
            {
              ar: 'تنظيم أنشطة بناء فريق دورية لتعزيز الروابط الاجتماعية بين الأعضاء',
              en: 'Organising regular team-building activities to strengthen social bonds between members',
            },
            {
              ar: 'مشاركة الفريق بكلّ المعلومات التفصيلية عن كلّ قرار تتّخذه الإدارة فور اتّخاذه لتعزيز الشفافية',
              en: 'Sharing all the detailed information about every management decision with the team as soon as it is taken to enhance transparency',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الإعلان عن قيمة الثقة لا يُنتجها — السلوك يُنتجها. وأنشطة بناء الفريق مفيدة لكنّها لا تحلّ محلّ الاتّساق اليومي في الأشياء الصغيرة. والشفافية الكاملة في كلّ قرار قد تكون غير ملائمة أو غير ممكنة في بيئات كثيرة. ما يُبني ثقةً حقيقية هو الاتّساق بين الكلام والفعل في أبسط التفاصيل — الوفاء بموعد، وإنجاز ما وُعد به، والاعتراف فوراً حين يُخطأ — لأنّ هذه التفاصيل الصغيرة هي التي يُراقبها الناس فعلاً حين يُقرّرون مدى جديّة ثقتهم في شخص ما.',
            en: 'Announcing the value of trust does not produce it — behaviour does. Team-building activities are useful but do not replace daily consistency in small things. Full transparency on every decision may be neither appropriate nor possible in many environments. What builds genuine trust is consistency between words and actions in the simplest details — keeping an appointment, delivering on a promise, acknowledging a mistake immediately — because it is these small details that people actually watch when deciding how seriously to trust someone.',
          },
        },
      ],
    },
  ],
};
