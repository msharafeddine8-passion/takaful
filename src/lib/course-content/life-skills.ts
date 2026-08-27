import type { CourseContent } from './types';

/**
 * Level 2 — Time, Pressure and Wellbeing.
 *
 * The slug is `life-skills` and the title is not. That is deliberate:
 * course_attempts and certificates key on the slug, and two volunteers already
 * have history against it. Renaming would orphan them silently. See the note
 * at the top of programme/definition.ts.
 *
 * This is the first course in the programme about the volunteer rather than
 * about the people they serve, and it is written on the assumption that
 * burnout is an organisational failure before it is a personal one. A course
 * that told volunteers to "manage their energy" while the association kept
 * handing them impossible days would be blaming them for the design.
 */

export const lifeSkills: CourseContent = {
  slug: 'life-skills',
  level: 2,
  minutes: 25,
  passMark: 70,
  title: {
    ar: 'إدارة الوقت والضغط والرفاه النفسي',
    en: 'Time, Pressure and Wellbeing',
  },
  lede: {
    ar: 'كيف تخطّط ليوم ميداني، وكيف تعرف أنك تقترب من الإرهاق قبل أن تصل إليه، وكيف تضع حدّاً بين التطوّع وحياتك — من دون أن يُقال لك إن التعب ذنبك.',
    en: 'How to plan a field day, how to know you are approaching burnout before you arrive at it, and how to keep a line between volunteering and your own life — without being told the exhaustion is your fault.',
  },
  outcomes: {
    ar: [
      'ترتّب أولويات يوم ميداني وتخطّط له بوقت واقعي',
      'تتعرّف على علامات الإرهاق النفسي في نفسك وفي زميل',
      'تطلب الدعم قبل أن يتحوّل التعب إلى انسحاب',
      'تضع حدوداً بين التطوّع والحياة الشخصية وتحافظ عليها',
    ],
    en: [
      'Prioritise and plan a field day against realistic time',
      'Recognise the signs of burnout in yourself and in a teammate',
      'Ask for support before exhaustion turns into withdrawal',
      'Set boundaries between volunteering and personal life, and keep them',
    ],
  },
  sources: [
    'IFRC — standards to facilitate the safety, security and well-being of volunteers',
    'IFRC Volunteering Policy (August 2022)',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'planning',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'التخطيط ليوم ميداني', en: 'Planning a field day' },
      lede: {
        ar: 'أغلب الأيام التي تنهار لم تنهر في الميدان. انهارت في الورقة قبلها.',
        en: 'Most days that fall apart did not fall apart in the field. They fell apart on the page beforehand.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'اليوم الميداني ليس قائمة مهام، بل سلسلة يعتمد كل جزء فيها على ما قبله. إن تأخّر التسجيل عشرين دقيقة، لا يتأخّر التسجيل وحده — يقصر النشاط، ويتأخّر التوزيع، ويصل الأهالي قبل أن ينتهي شيء. التخطيط الجيّد ليس تفصيلاً أدقّ، بل معرفة أيّ خطوة إن تعثّرت أوقعت البقية.',
            en: 'A field day is not a task list; it is a chain in which each part rests on the one before. If registration runs twenty minutes late, it is not only registration that slips — the activity shortens, the distribution slides, and families arrive before anything has finished. Good planning is not finer detail; it is knowing which step brings down the rest if it stumbles.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'الوقت الميّت', en: 'Dead time' },
              text: {
                ar: 'الانتقال، والانتظار، والترتيب بين نشاطين. يُنسى دائماً من الخطة ويأكل ربع اليوم.',
                en: 'Travel, waiting, resetting between two activities. Always left out of the plan, and it eats a quarter of the day.',
              },
            },
            {
              title: { ar: 'الخطوة الحرجة', en: 'The critical step' },
              text: {
                ar: 'الخطوة التي إن تأخّرت تأخّر كل شيء بعدها. تُعطى هامشاً، لا تُضغط.',
                en: 'The step whose slippage moves everything after it. It gets slack, not compression.',
              },
            },
            {
              title: { ar: 'ما يمكن إسقاطه', en: 'What can be dropped' },
              text: {
                ar: 'قرّر قبل اليوم ما الذي يُلغى إن ضاق الوقت. القرار وقت الضغط يكون أسوأ.',
                en: 'Decide before the day what gets cut if time runs short. The same decision made under pressure comes out worse.',
              },
            },
          ],
        },
        {
          type: 'quiz',
          id: 'ls-q1',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'خطّة اليوم مضبوطة على الدقيقة من ٩:٠٠ حتى ١:٠٠ بلا فراغات. ما الخطأ فيها؟',
            en: 'The day is planned to the minute from 09:00 to 13:00 with no gaps. What is wrong with it?',
          },
          options: [
            {
              ar: 'لا خطأ — الدقّة مطلوبة في العمل الميداني، والخطّة المضبوطة على الدقيقة هي ما يجعل كل متطوّع يعرف أين يقف في أي لحظة',
              en: 'Nothing — precision is what field work needs, and a to-the-minute plan is what lets every volunteer know exactly where they should be at any moment',
            },
            {
              ar: 'خطّة بلا هوامش تفترض ألّا يتأخّر شيء، فأول تأخير يهدم ما بعده ولا يبقى قرار سوى الإلغاء العشوائي',
              en: 'A plan with no slack assumes nothing slips, so the first delay collapses everything after it and the only decision left is cutting at random',
            },
            {
              ar: 'الخطأ أن اليوم قصير — أربع ساعات لا تكفي لتسجيل ونشاط وتوزيع، والحلّ تمديده إلى الثالثة لا إعادة ترتيب ما فيه',
              en: 'The problem is that four hours is too short for registration, an activity and a distribution — the fix is to run the day until three, not to rearrange what is in it',
            },
            {
              ar: 'الخطأ أنها لم تُكتب بالتشاور مع الفريق، فمن ينفّذ الخطوات أعرف بزمنها',
              en: 'The problem is that it was not written with the team — whoever runs the steps knows the real timings',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الخيار الرابع صحيح كملاحظة وليس هو الخطأ البنيوي. الخطة المضبوطة على الدقيقة تبدو احترافية وهي في الحقيقة هشّة: لم تترك مكاناً للانتقال ولا لطفل يبكي ولا لأهل يتأخّرون. الهامش ليس كسلاً — هو ما يجعل الخطة تصمد حين لا يسير شيء كما كُتب، وهذا ما يحدث في كل يوم ميداني تقريباً.',
            en: 'The fourth is a fair observation but not the structural fault. A to-the-minute plan looks professional and is in fact brittle: it left no room for travel, for a crying child, for families arriving late. Slack is not slack-mindedness — it is what lets the plan survive nothing going as written, which is what happens on nearly every field day.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'pressure',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'الضغط أثناء النشاط', en: 'Pressure during the activity' },
      lede: {
        ar: 'ما تفعله حين يتجاوز الموقف ما خطّطت له بساعة.',
        en: 'What you do when the situation is an hour past what you planned for.',
      },
      blocks: [
        {
          type: 'list',
          items: {
            ar: [
              'اعرف من يقرّر: تحت الضغط، أسوأ ما يحدث أن يقرّر الجميع في وقت واحد',
              'قلّص النشاط ولا تقلّص السلامة — السلامة ليست بنداً قابلاً للاختصار',
              'قل «لا أعرف، سأسأل» بدل تخمين جواب أمام أهل قلقين',
              'اطلب استبدالاً إن شعرت أنك لم تعد قادراً على الانتباه',
              'أجّل ما يمكن تأجيله بصوت مسموع، حتى يعرف الفريق ما سقط',
            ],
            en: [
              'Know who decides: under pressure, the worst outcome is everyone deciding at once',
              'Shorten the activity, never the safety — safety is not a line item you compress',
              'Say "I do not know, I will ask" rather than guessing in front of worried families',
              'Ask to be swapped out if you notice you can no longer pay attention',
              'Drop what can be dropped out loud, so the team knows what fell',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'الاستمرار ليس دائماً الصواب', en: 'Carrying on is not always right' },
          content: {
            ar: 'المتطوّع الذي يكمل نشاطاً وهو غير قادر على التركيز يبدو ملتزماً، وهو في الحقيقة مصدر خطر: الأخطاء في العدّ والانتباه والإشراف تقع هنا. طلب الاستبدال ليس ضعفاً ولا انسحاباً — هو الجزء من الالتزام الذي لا يراه أحد.',
            en: 'A volunteer who finishes an activity while unable to concentrate looks committed and is in fact a hazard: mistakes in counting, attention and supervision happen here. Asking to be swapped out is not weakness or quitting — it is the part of commitment nobody sees.',
          },
        },
        {
          type: 'quiz',
          id: 'ls-q2',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          scenario: {
            ar: 'لم تنم جيداً، وأنت مسؤول عن مجموعة اثني عشر طفلاً في نشاط خارجي. بعد ساعة تلاحظ أنك فقدت عدّ الأطفال مرّتين.',
            en: 'You slept badly, and you are responsible for a group of twelve children on an outdoor activity. An hour in, you notice you have lost count of them twice.',
          },
          question: { ar: 'ماذا تفعل؟', en: 'What do you do?' },
          options: [
            {
              ar: 'تشرب قهوة وتكمل — باقٍ ساعتان فقط',
              en: 'Get a coffee and carry on — only two hours left',
            },
            {
              ar: 'تُخبر المنسّقة فوراً وتطلب أن يشاركك أحد في المجموعة أو يستبدلك',
              en: 'Tell the coordinator immediately and ask for someone to share the group or take it',
            },
            {
              ar: 'تصغّر المجموعة وتترك نصفها لزميل من دون إخبار أحد، فستّة أطفال أسهل عليك من اثني عشر',
              en: 'Split the group and hand half to a colleague without telling anyone — six children are easier to hold than twelve',
            },
            {
              ar: 'تكمل وتنتبه أكثر وتخبر المنسّقة في نهاية اليوم',
              en: 'Carry on and concentrate harder, and tell the coordinator at day’s end',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'فقدان العدّ مرّتين ليس تعباً عابراً — هو فشل في المهمّة الوحيدة التي لا يجوز أن تفشل: معرفة أين الأطفال. و«الانتباه أكثر» ليس خطّة، لأن الانتباه هو تحديداً ما نفد. والتقسيم من دون إخبار أحد يعني أن لا أحد يعرف من المسؤول عن من. الإخبار الفوري يحوّل مشكلتك الشخصية إلى قرار للفريق، وهذا ما هو عليه فعلاً.',
            en: 'Losing count twice is not ordinary tiredness — it is failing at the one task that must not fail: knowing where the children are. "Concentrate harder" is not a plan, because concentration is precisely what ran out. Splitting the group silently means nobody knows who is responsible for whom. Telling the coordinator turns your personal problem into a team decision, which is what it actually is.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'burnout',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'الإرهاق: كيف يبدأ', en: 'Burnout: how it starts' },
      lede: {
        ar: 'لا يبدأ بالتعب. يبدأ عادةً بأن تتوقّف عن الاهتمام.',
        en: 'It does not start with tiredness. It usually starts with you no longer caring.',
      },
      blocks: [
        {
          type: 'compare',
          yesTitle: { ar: 'تعب عادي', en: 'Ordinary tiredness' },
          noTitle: { ar: 'علامات إرهاق', en: 'Signs of burnout' },
          yes: {
            ar: [
              'ترتاح بعد يوم إجازة',
              'ما زلت تنتظر النشاط القادم',
              'تتذكّر لماذا بدأت',
              'تنزعج من موقف بعينه لا من كل شيء',
            ],
            en: [
              'A day off restores you',
              'You still look forward to the next activity',
              'You remember why you started',
              'One situation annoys you, not everything',
            ],
          },
          no: {
            ar: [
              'تستيقظ متعباً مهما نمت',
              'تجد أعذاراً لتغيب',
              'صرت تتحدّث عن المستفيدين بضيق أو سخرية',
              'تشعر أن ما تفعله لا يغيّر شيئاً',
              'تنفعل من أمور صغيرة مع الفريق أو في البيت',
            ],
            en: [
              'You wake tired however much you slept',
              'You find reasons not to go',
              'You have started speaking about the people you serve with irritation or sarcasm',
              'You feel none of it changes anything',
              'Small things set you off, with the team or at home',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'السخرية علامة لا طبع', en: 'Cynicism is a sign, not a personality' },
          content: {
            ar: 'حين يبدأ متطوّع بالحديث عن المستفيدين بضيق أو استخفاف، السبب غالباً ليس أنه صار شخصاً أقسى. هذه واحدة من أوضح علامات الإرهاق المهني، وهي أخطرها لأنها تصيب من نخدمهم مباشرةً. إن سمعتها من زميل، فهي إشارة إلى أنه يحتاج راحة لا إلى أنه يحتاج توبيخاً.',
            en: 'When a volunteer starts speaking about the people they serve with irritation or contempt, the reason is usually not that they have become a harder person. This is one of the clearest signs of professional burnout, and the most dangerous, because it lands directly on the people we serve. If you hear it from a colleague, it is a signal that they need rest rather than a telling-off.',
          },
        },
        {
          type: 'quiz',
          id: 'ls-q3',
          label: { ar: 'سيناريو حسّاس', en: 'A difficult scenario' },
          scenario: {
            ar: 'زميلة كانت من أنشط الفريق صارت تتأخّر وتعتذر عن الأنشطة، وقالت أمس بضيق: «كل مرّة نفس الناس ونفس الشكاوى.»',
            en: 'A colleague who was among the most active has started arriving late and dropping out of activities, and yesterday said with irritation: "It is the same people and the same complaints every time."',
          },
          question: { ar: 'ما التصرّف؟', en: 'What do you do?' },
          options: [
            {
              ar: 'تذكّرها بأهمّية العمل ومن يعتمد عليها، وتقول لها إن الموسم ضاغط وإن كل من في الفريق يمرّ بهذا وإنه سيهدأ بعد أسابيع',
              en: 'Remind her how important the work is and who depends on her, and tell her the season is heavy, that everyone on the team feels it, and that it will settle in a few weeks',
            },
            {
              ar: 'تسألها على انفراد كيف حالها فعلاً، وتقترح راحة أو دوراً أخفّ، وتُخبر المنسّقة أن الفريق يحتاج توزيعاً مختلفاً',
              en: 'Ask her privately how she actually is, suggest a rest or a lighter role, and tell the coordinator the team needs a different distribution',
            },
            {
              ar: 'لا تتدخّل — هذا شأنها الشخصي، والسؤال عن زميلة لم تطلب شيئاً قد يبدو فضولاً',
              en: 'Stay out of it — that is her own business, and asking a colleague who has not asked for anything can seem like prying',
            },
            {
              ar: 'تُبلّغ عنها لأن كلامها عن المستفيدين يجب أن يُعالَج كمسألة سلوك',
              en: 'Report her, because talking that way about the people we serve is a conduct matter',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'التذكير بالأهمّية يضيف حملاً على من يحمل أكثر مما يحتمل أصلاً. وعدم التدخّل يترك زميلة تنزلق وتتركها تخسر شيئاً كانت تحبّه. والإبلاغ يعالج العَرَض ويترك السبب — إلا إذا وصل الكلام إلى المستفيدين أنفسهم، وعندها تصبح مسألة سلوك أيضاً. ثلاث العلامات هنا مجتمعة — الغياب، والتأخّر، والسخرية — نمط لا مزاج، والاستجابة الصحيحة تخفيف الحمل لا زيادته.',
            en: 'Reminding her of the importance adds weight to someone already carrying more than they can. Staying out of it lets a colleague slide and lets her lose something she loved. Reporting treats the symptom and leaves the cause — unless the remarks reach the people themselves, at which point it becomes a conduct matter as well. The three signs together — absence, lateness, cynicism — are a pattern rather than a mood, and the right response is to take weight off rather than add it.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'asking',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'طلب الدعم قبل أن تحتاجه', en: 'Asking for support before you need it' },
      lede: {
        ar: 'أصعب مهارة في هذه الدورة، لأنها الوحيدة التي تبدو اعترافاً بالعجز وهي ليست كذلك.',
        en: 'The hardest skill in this course, because it is the only one that feels like admitting failure and is not.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'أكثر المتطوّعين لا يطلبون الدعم لأنهم لا يعرفون أنه متاح، أو لأنهم يظنّون أن الجميع يتحمّل الحمل نفسه بصمت، أو لأن الطلب في نظرهم يعني أنهم أقلّ قدرة من غيرهم. الثلاثة أسباب مفهومة، وكلّها تنتهي إلى النتيجة نفسها: الفريق يكتشف المشكلة حين تصبح غياباً، لا حين كانت لا تزال قابلة للحلّ بتعديل بسيط.',
            en: 'Most volunteers do not ask for support because they do not know it exists, or because they assume everyone else carries the same load in silence, or because asking would mean they are less capable than the rest. All three are understandable, and all three end in the same place: the team finds out about the problem when it has become an absence, rather than while it was still solvable with a small adjustment.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'والطلب المبكر أرخص على الجميع. متطوّع يقول في بداية الشهر إنه لا يستطيع أكثر من نشاطين يُعاد توزيع الجدول حوله في دقائق. المتطوّع نفسه إن صمت حتى يعتذر عن نشاط في صباح يومه يترك مجموعة بلا مشرف وأسراً وصلت. الفرق بين الحالتين ليس في مقدار ما يستطيع أن يعطيه — هو نفسه — بل في متى قاله.',
            en: 'And asking early is cheaper for everyone. A volunteer who says at the start of the month that two activities is their limit gets the schedule rebuilt around them in minutes. The same volunteer who stays quiet until they pull out on the morning of an activity leaves a group without a supervisor and families already arriving. The difference between the two is not how much they could give — that is identical — but when they said it.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'دعم عملي', en: 'Practical support' },
              text: {
                ar: 'تخفيف عدد الأنشطة، تغيير الدور، مشاركة المهمّة مع زميل، تعديل المواعيد.',
                en: 'Fewer activities, a change of role, sharing a task with a colleague, adjusted timings.',
              },
            },
            {
              title: { ar: 'دعم من الفريق', en: 'Team support' },
              text: {
                ar: 'أن يستمع إليك زميل بعد يوم صعب، وأن يُعقد Debriefing بعد الأنشطة الثقيلة.',
                en: 'A colleague who listens after a hard day, and a debriefing after heavy activities.',
              },
            },
            {
              title: { ar: 'دعم مختص', en: 'Specialist support' },
              text: {
                ar: 'حين يتكرّر المشهد في نومك أو يؤثّر على حياتك خارج التطوّع. هذا ليس دور زميلك.',
                en: 'When a scene keeps returning at night or reaches your life outside volunteering. That is not a colleague’s role.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'ما لا يُطلب من زميل', en: 'What not to ask of a colleague' },
          content: {
            ar: 'زميلك يستطيع أن يسمعك، ويستطيع أن يشاركك مهمّة، ويستطيع أن يقول للمنسّقة إنك تحتاج راحة. لا يستطيع أن يعالجك، ولا أن يحمل عنك ما يحتاج مختصاً، ولا أن يبقى المكان الوحيد الذي تفرغ فيه كل شيء. تحميل زميل هذا الدور يُنهك اثنين بدل واحد — وهذه من أشيع الطرق التي ينتقل بها الإرهاق داخل فريق.',
            en: 'A colleague can listen, can share a task, and can tell the coordinator you need a rest. They cannot treat you, cannot carry what needs a professional, and cannot be the only place you empty everything into. Putting that role on a colleague exhausts two people instead of one — and it is one of the commonest ways burnout travels through a team.',
          },
        },
        {
          type: 'quiz',
          id: 'ls-q4b',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          scenario: {
            ar: 'أنت منسّقة فريق. متطوّع من أفضل من معك أخبرك أنه لا يستطيع الاستمرار بالوتيرة الحالية وأنه يفكّر في التوقّف تماماً.',
            en: 'You are a team coordinator. One of your best volunteers tells you he cannot keep up the current pace and is thinking of stopping altogether.',
          },
          question: { ar: 'ما أفضل ردّ أوّل؟', en: 'What is the best first response?' },
          options: [
            {
              ar: 'تشكره على صراحته وتسأله ما القدر الذي يستطيعه فعلاً، ثم تبني الجدول على جوابه',
              en: 'Thank him for saying so, ask what he can actually manage, and build the schedule around his answer',
            },
            {
              ar: 'تطلب منه أن يصبر شهراً حتى ينتهي الموسم، فأغلب حالات التعب تزول من نفسها بعد الذروة',
              en: 'Ask him to hold on for a month until the season ends, since most tiredness passes on its own once the peak is over',
            },
            {
              ar: 'تقبل توقّفه فوراً حتى لا تضغط عليه، وتتركه يعود متى شاء',
              en: 'Accept that he is stopping, immediately, so as not to pressure him, and leave the door open',
            },
            {
              ar: 'تذكّره كم يعتمد عليه الفريق والأطفال، فمعرفته بأثره قد تُعيد إليه دافعه',
              en: 'Remind him how much the team and the children depend on him, which may revive his motivation',
            },
          ],
          correct: 0,
          feedback: {
            ar: 'الصبر شهراً يطلب منه بالضبط ما قال إنه لا يستطيعه. والقبول الفوري بالتوقّف يقفز فوق خيارات كثيرة بينهما — نشاط واحد بدل ثلاثة، دور أخفّ، انقطاع مؤقّت — ويخسر الفريق شخصاً كان يمكن أن يبقى. والتذكير بمن يعتمد عليه أشدّها ضرراً: يحوّل تعبه إلى ذنب. السؤال «ما القدر الذي تستطيعه؟» يبقي الباب مفتوحاً ويعطيه قراراً بدل أن يضعه بين الاستمرار المستحيل والانسحاب الكامل.',
            en: 'Holding on for a month asks him for exactly what he just said he cannot do. Accepting the stop immediately skips every option in between — one activity instead of three, a lighter role, a temporary break — and loses someone who could have stayed. Reminding him who depends on him is the most damaging of the four: it turns his exhaustion into guilt. "What can you manage?" keeps the door open and gives him a decision, instead of leaving him with a choice between an impossible yes and a total no.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'boundaries',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'الحدّ بين التطوّع وحياتك', en: 'The line between volunteering and your life' },
      lede: {
        ar: 'الحدّ الذي لا تضعه أنت، سيضعه التعب نيابةً عنك.',
        en: 'A line you do not draw is a line exhaustion will draw for you.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الالتزام بالوقت الذي وعدت به التزام. أمّا أن تكون متاحاً دائماً فليس التزاماً — هو غياب حدّ. الفرق بينهما أن الأول يمكن أن يستمرّ سنوات، والثاني ينتهي عادةً بانسحاب مفاجئ يفاجئ الجميع.',
            en: 'Keeping to the hours you promised is commitment. Being permanently available is not commitment — it is the absence of a boundary. The difference is that the first can last for years, and the second usually ends in a sudden withdrawal that surprises everybody.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'قل ما تستطيع أن تعطيه بدقّة قبل أن تبدأ، لا بعد أن تعجز',
              'اجعل التواصل في أوقات معروفة، وأغلق مجموعات العمل خارجها',
              'ارفض المهمّة الإضافية بجملة واحدة واضحة بلا اعتذار طويل',
              'خذ وقتاً بعد الأنشطة الصعبة قبل أن تعود إلى بيتك مباشرةً',
              'تحدّث عمّا رأيته مع شخص من الفريق، لا مع نفسك فقط',
            ],
            en: [
              'Say precisely what you can give before you start, not after you cannot',
              'Keep contact to known hours, and close the work groups outside them',
              'Decline an extra task in one clear sentence, without a long apology',
              'Take time after a hard activity before going straight home',
              'Talk about what you saw with someone on the team, not only to yourself',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'ls-q4',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'طُلب منك نشاط إضافي يوم الأحد، وأنت متعب وعندك التزام عائلي. ما أفضل ردّ؟',
            en: 'You are asked to take an extra activity on Sunday. You are tired and have a family commitment. What is the best reply?',
          },
          options: [
            {
              ar: '«إن شاء الله بحاول» ثم تعتذر يوم السبت إن لم تستطع، فلا تُغلق الباب من الآن',
              en: '"I will try" — then apologise on Saturday if you cannot, so you are not closing the door now',
            },
            {
              ar: '«لا أستطيع الأحد. أستطيع الأحد القادم إن كان ينفع.»',
              en: '"I cannot do Sunday. I could do the following Sunday if that helps."',
            },
            {
              ar: 'توافق لأن الفريق قليل ولا تريد أن تخذلهم، وتدبّر التزامك العائلي بطريقة ما',
              en: 'Say yes, because the team is short-handed and you do not want to let them down',
            },
            {
              ar: 'لا تردّ حتى يجدوا شخصاً آخر دون رفض صريح',
              en: 'Do not reply, so they find someone else without refusing',
            },
          ],
          correct: 1,
          feedback: {
            ar: '«بحاول» ليست إجابة — تجعل المنسّقة تخطّط على أساسك ثم تفاجأ، وهو أسوأ من رفض واضح مبكر. والموافقة رغم عدم القدرة تنتج غياباً لاحقاً أو حضوراً بلا تركيز. وعدم الردّ يترك الفراغ للحظة الأخيرة. الرفض الواضح مع بديل ممكن يحترم وقتك ووقت الفريق معاً، ولا يحتاج اعتذاراً طويلاً.',
            en: '"I will try" is not an answer — it makes the coordinator plan around you and then be surprised, which is worse than an early clear no. Saying yes when you cannot produces either a later absence or an unfocused presence. Not replying leaves the gap until the last minute. A clear no with a possible alternative respects your time and the team’s at once, and needs no long apology.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'ومن الحدود ما لا يخصّ الوقت. بعض ما تراه في الميدان يبقى معك: طفل يبكي ولا تستطيع أن تفعل شيئاً، أسرة تُردّ لأن المعايير لا تشملها، مشهد لم تكن مستعدّاً له. أن تتأثّر بهذا ليس ضعفاً ولا نقص مهنية — هو ما يحدث لمن ما زال يرى الناس بشراً. الخطأ الوحيد هو أن تحمله وحدك وتتصرّف كأن شيئاً لم يكن.',
            en: 'Some boundaries have nothing to do with time. Parts of what you see in the field stay with you: a child crying and nothing you can do about it, a family turned away because the criteria do not reach them, something you were not braced for. Being affected by that is neither weakness nor a lack of professionalism — it is what happens to somebody who still sees people as people. The only mistake is carrying it alone and behaving as though nothing happened.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'لا تعُد من نشاط صعب إلى بيتك مباشرةً — أعطِ نفسك نصف ساعة في الطريق',
              'تحدّث مع شخص من الفريق عمّا رأيت في اليوم نفسه، ولو بجملتين',
              'شارك في Debriefing بعد النشاط إن وُجد، واطلبه إن لم يوجد',
              'انتبه إن تكرّر المشهد في نومك أو تجنّبت نشاطاً بسببه — هذه إشارة لطلب دعم مختص',
              'لا تناقش تفاصيل حالة مع من هو خارج الفريق، ولو للتنفيس',
            ],
            en: [
              'Do not go straight home from a hard activity — give yourself half an hour on the way',
              'Talk to someone on the team about what you saw, the same day, even in two sentences',
              'Take part in the debriefing after an activity if there is one, and ask for one if there is not',
              'Notice if a scene keeps returning at night, or you avoid an activity because of it — that is the point to ask for specialist support',
              'Do not discuss the details of a case with anyone outside the team, not even to unburden yourself',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'التنفيس له حدّ أيضاً', en: 'Unburdening has a limit too' },
          content: {
            ar: 'الحديث عمّا رأيت ضروري، لكن تفاصيل حالة مستفيد ليست ملكك لترويها. الفرق بسيط وواضح: تتحدّث عن أثر ما رأيته عليك أنت، لا عن اسم صاحبه وظروفه. هذا يحميك ويحميه معاً، ويجعل الحديث ممكناً بدل أن يصبح محظوراً.',
            en: 'Talking about what you saw is necessary, but the details of someone’s case are not yours to tell. The distinction is simple: you talk about the effect it had on you, not about whose situation it was. That protects both of you, and it keeps the conversation possible instead of making it forbidden.',
          },
        },
        {
          type: 'quiz',
          id: 'ls-q5',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أيّ الجمل التالية تصف مسؤولية الجمعية لا مسؤوليتك أنت؟',
            en: 'Which of the following describes the association’s responsibility rather than yours?',
          },
          options: [
            {
              ar: 'أن تنام جيداً قبل يوم ميداني وتصل إليه قادراً على الانتباه طوال اليوم',
              en: 'Sleeping properly before a field day so you arrive able to pay attention all day',
            },
            {
              ar: 'ألّا يُطلب من متطوّع واحد أن يشرف على اثني عشر طفلاً وحده',
              en: 'Not asking one volunteer to supervise twelve children alone',
            },
            {
              ar: 'أن تخبر المنسّقة حين تشعر بالإرهاق قبل أن يتحوّل إلى غياب',
              en: 'Telling the coordinator you feel exhausted before it turns into an absence',
            },
            {
              ar: 'أن تضع حدوداً لأوقات تواصلك',
              en: 'Setting boundaries around when you are contactable',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الثلاثة الأخرى مسؤوليتك، وهذه الدورة عنها. لكن الرفاه النفسي ليس مسؤولية فردية بالكامل: توزيع الأحمال، وعدد المشرفين، والراحة بعد الأنشطة الصعبة قرارات تنظيمية. متطوّع يُطلب منه المستحيل ثم يُقال له إنه لا يعتني بنفسه يُحمَّل خطأ ليس خطأه — وهذا المعيار الذي يقيس عليه الاتحاد الدولي سلامة المتطوّعين ورفاههم.',
            en: 'The other three are yours, and this course is about them. But wellbeing is not entirely an individual responsibility: how load is distributed, how many supervisors there are, and rest after difficult activities are organisational decisions. A volunteer asked to do the impossible and then told they are not looking after themselves is being blamed for someone else’s design — which is the standard the IFRC measures volunteer safety and wellbeing against.',
          },
        },
      ],
    },
  ],
};
