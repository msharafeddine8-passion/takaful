import type { CourseContent } from './types';

/**
 * Level 3 — Leading Teams and Assigning Roles. Pass mark 70.
 *
 * Written around the gap between what most new volunteer coordinators think
 * leadership means (making sure things get done) and what it actually requires
 * (knowing who is doing them, why, and whether they have what they need).
 *
 * The course follows the shape of a leadership cycle: understand the difference
 * between leading and managing → assign roles deliberately → brief and debrief →
 * follow up without becoming surveillance → address shortfall directly before
 * escalating. A sixth module on reading early signs of team fatigue closes the
 * loop back to the first.
 *
 * Quiz questions are scenario-based and set inside realistic volunteer
 * coordination problems. The wrong options are each defensible from a partial
 * reading of common sense — the feedback explains the reasoning, not just the
 * verdict.
 */

export const teamLeadership: CourseContent = {
  slug: 'team-leadership',
  level: 3,
  minutes: 35,
  passMark: 70,
  title: {
    ar: 'قيادة الفرق وتوزيع الأدوار',
    en: 'Leading Teams and Assigning Roles',
  },
  lede: {
    ar: 'الفرق بين أن تقود وأن تدير، وكيف تختار الشخص المناسب للمهمة، وكيف تعالج التقصير من دون أن تكسر أحداً.',
    en: 'The difference between leading and managing, how to match a person to a task, and how to address underperformance without breaking anyone.',
  },
  outcomes: {
    ar: [
      'توزّع الأدوار بناءً على القدرة والتوفّر لا على العلاقة',
      'تُجري Briefing قبل النشاط وDebriefing بعده',
      'تتابع التنفيذ من دون أن تتحوّل المتابعة إلى مراقبة',
      'تعالج التقصير بمحادثة مباشرة موثّقة قبل التصعيد',
    ],
    en: [
      'Assign roles by capacity and availability rather than by relationship',
      'Run a briefing before an activity and a debriefing after it',
      'Follow up on delivery without the follow-up becoming surveillance',
      'Address underperformance in a direct, documented conversation before escalating',
    ],
  },
  sources: [
    'UN Volunteers — Volunteer Management Guidelines (2023 edition)',
    'IFRC — Leading Volunteers: A Practical Handbook for Volunteer Managers',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'tl-m1',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'القيادة والإدارة — الفرق الذي يصنع الفرق', en: 'Leadership and Management — The Difference That Matters' },
      lede: {
        ar: 'القيادة تنظر نحو الأشخاص، والإدارة نحو المهام. حين تخلط بينهما تخسر كليهما.',
        en: 'Leadership looks toward people, management toward tasks. Conflate them and you lose both.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الفرق بين القيادة والإدارة ليس في اللقب ولا في السلطة، بل في الاتجاه الذي ينظر إليه من يمارسها. المدير ينظر نحو المهام: هل أُنجزت؟ وفي الوقت المحدّد؟ وبالجودة المطلوبة؟ القائد ينظر نحو الأشخاص: هل هم قادرون على ما يُطلب منهم؟ هل هم متحمّسون أم مرهقون؟ هل يملكون ما يحتاجونه لإنجاز ما كُلّفوا به؟ الفريق الذي يُدار فقط يُنجز ما يُطلب منه ثم يتوقّف. الفريق الذي يُقاد يبتكر حين تتغيّر الظروف، ويحمل بعضه بعضاً حين يشحّ الوقت. في السياق التطوّعي، هذا الفرق أكثر حدّةً من أيّ سياق آخر، لأن ما يجمع المتطوّعين ليس عقداً وظيفياً بل التزاماً طوعياً — وهذا الالتزام يُبنى أو يُهدم بطريقة القيادة يوماً بيوم. قائد يرى المهمة فقط سيجد الفريق يتناقص مع الوقت. قائد يرى الأشخاص أولاً سيجد الفريق يكبر.',
            en: 'The difference between leadership and management is not in the title or the authority, but in the direction the practitioner looks. A manager looks toward tasks: were they done, on time, to the required standard? A leader looks toward people: are they capable of what is being asked? Are they energised or exhausted? Do they have what they need to deliver what they have been given? A team that is only managed delivers what is asked and stops. A team that is led innovates when circumstances change and carries each other when time is short. In a volunteer context this distinction is sharper than in any other, because what holds volunteers together is not a contract but a voluntary commitment — and that commitment is built or destroyed by how leadership is practised day by day.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'القائد يفعل', en: 'The leader does' },
          noTitle: { ar: 'المدير فقط يفعل', en: 'The manager-only does' },
          yes: {
            ar: [
              'يسأل لماذا يتأخّر الشخص قبل أن يطلب منه التسريع',
              'يعرف ما يُجيده كل فرد في الفريق ويبني التوزيع عليه',
              'يشرح السياق والهدف قبل إعطاء التعليمة',
              'يعترف بالإنجاز علناً ويناقش التقصير خصوصياً',
              'يتعامل مع الخطأ على أنه معلومة تُحسَّن به الخطوة التالية',
            ],
            en: [
              'Asks why someone is behind before asking them to speed up',
              'Knows what each person does well and builds role assignment on that',
              'Explains context and purpose before giving an instruction',
              'Recognises achievement publicly and discusses shortfall privately',
              'Treats a mistake as information to improve the next step',
            ],
          },
          no: {
            ar: [
              'يتابع المهمة دون أن يسأل عن حال من يؤدّيها',
              'يعطي المهمة لمن هو متاح لا لمن هو الأنسب لها',
              'يُصدر الأمر ويتوقّع التنفيذ دون شرح',
              'يُقيَّم الفريق بما أنجز فقط دون سؤال عن كيف أنجزه',
              'يعامل كل تأخير كاستهانة بالمسؤولية',
            ],
            en: [
              'Tracks tasks without asking how the person doing them is faring',
              'Gives a task to whoever is available rather than whoever is best for it',
              'Issues instructions and expects compliance without explanation',
              'Measures the team by output only, never asking how it was produced',
              'Treats every delay as disregard for responsibility',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'فقدان متطوّع خيرٌ من حرقه', en: 'Losing a volunteer to rest is better than burning them out' },
          content: {
            ar: 'متطوّع يغيب لأنه أُرهق لا يخسره الفريق للمهمة الواحدة — قد يخسره للأبد، ومعه كلّ ما استُثمر فيه من تدريب وخبرة وعلاقات. القيادة التي تحترم طاقة الناس وحدودهم هي التي يعودون إليها. حين لا تُراعي هذا، تجد نفسك تُدرّب أناساً جدداً باستمرار لأن القدامى لا يبقون، وتخسر معهم ذاكرة المؤسسة وروحها.',
            en: 'A volunteer who leaves because they were burned out is not just lost for one activity — they may be gone for good, along with everything invested in them. The leadership that respects people\'s energy and limits is the one they return to. When you do not account for this, you find yourself perpetually training new people because the experienced ones do not stay.',
          },
        },
        {
          type: 'quiz',
          id: 'tl-q1',
          label: { ar: 'قرارك كقائد', en: 'Your leadership decision' },
          question: {
            ar: 'منسّقة لاحظت أن سارة تُسلّم مهامها متأخّرة مرّتين متتاليتين. ما الخطوة الأولى؟',
            en: 'A coordinator notices that Sara has delivered her tasks late two weeks running. What is her first step?',
          },
          options: [
            {
              ar: 'ترسل رسالة تُذكّرها بأهمية الالتزام بالمواعيد',
              en: 'Send a message reminding her of the importance of meeting deadlines',
            },
            {
              ar: 'تتّصل بها وتسأل كيف تسير الأمور وما إن كانت تحتاج شيئاً',
              en: 'Call her and ask how things are going and whether she needs anything',
            },
            {
              ar: 'تُبلّغ المسؤول مباشرةً لأن التأخّر تكرّر مرّتين',
              en: 'Report to the supervisor directly since the lateness has happened twice',
            },
            {
              ar: 'تُعطي مهام سارة لشخص آخر بصمت',
              en: 'Quietly reassign Sara\'s tasks to someone else',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'التأخّر مرّتين لا يعني بالضرورة استهانةً — قد يعني أن المهمة أثقل مما بدا، أو أن هناك ظرفاً شخصياً لا تعلمين عنه. السؤال عن الحال يفتح باباً لمعلومة لا تملكينها ويُبقي العلاقة في مسارها. الإبلاغ الفوري والإعادة الصامتة للمهام كلاهما يُغلق الباب ويُشير إلى أن المنسّقة تُدير مهاماً لا تقود أشخاصاً. رسالة التذكير وحدها تفترض أن المشكلة هي النسيان وليس الضغط.',
            en: 'Two late deliveries do not necessarily mean disregard — they may mean the task was heavier than it seemed, or there is personal pressure you don\'t know about. Asking how things are opens the door to information you don\'t have and keeps the relationship intact. Escalating immediately and quietly reassigning both close that door and signal that the coordinator manages tasks, not people.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'tl-m2',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'توزيع الأدوار — من يفعل ماذا ولماذا', en: 'Assigning Roles — Who Does What and Why' },
      lede: {
        ar: 'أكثر أخطاء القادة المبتدئين إعطاء المهام لمن يُحبّونهم لا لمن يُتقنونها.',
        en: 'The most common mistake of new leaders is giving tasks to people they like rather than people who are good at them.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين تُوزَّع الأدوار بناءً على العلاقة لا على القدرة والتوفّر، تتكرّر مشكلتان متلازمتان: الأولى أن من يُكلَّف يجد نفسه في موقف لا يُجيده أو لا طاقة له عليه، فيُخفق أو يُجهَد. والثانية أن من يُجيد المهمة فعلاً يراها تذهب إلى غيره فيشعر بأن مساهمته غير مرئية وأن الاختيار يتمّ وفق اعتبارات لا يستطيع التأثير فيها. كلتا المشكلتين تُنهي فريقاً من الداخل: الأولى بالإرهاق والإخفاق، والثانية بالإحباط والانسحاب التدريجي. توزيع الأدوار العادل يبدأ بفهم واضح لما تتطلّبه كل مهمة، ثم بسؤال صريح عن القدرة والتوفّر — لا بمن تثق به أكثر أو من كان هنا منذ أطول. والسؤال الصريح ليس إهانة؛ هو احترام لوقت الشخص وقدرته الفعلية.',
            en: 'When roles are distributed by relationship rather than capacity and availability, two paired problems repeat themselves: the first is that whoever is assigned finds themselves in a position they are not good at or cannot sustain, and either fails or burns out. The second is that whoever is actually good at the task sees it go to someone else and feels their contribution is invisible. Both problems end a team from within — the first through exhaustion and failure, the second through frustration and gradual withdrawal. Fair role assignment starts with a clear understanding of what each task requires, then an honest question about capacity and availability — not with who you trust most or who has been here longest.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'حدّد ما تتطلّبه المهمة فعلاً قبل أن تفكّر في من سيؤدّيها: مهارة تقنية؟ حضور جسدي؟ تواصل اجتماعي؟',
              'اسأل كل شخص عن قدرته وتوفّره ولا تفترض أيّاً منهما بناءً على تاريخه السابق',
              'راعِ الطاقة الاحتياطية: لا تملأ جدول أحد بالكامل كي يتّسع للطارئ',
              'وثّق التكليف كتابةً لا شفهاً: رسالة قصيرة تُلخّص المهمة والموعد والموارد المتاحة',
              'اعترف مبكراً حين أخطأت التوزيع وعدّله قبل أن تنتظر الإخفاق',
              'بعد كل نشاط اسأل: هل كانت الأدوار مناسبة لمن أُسندت إليه؟',
            ],
            en: [
              'Define what the task actually requires before thinking about who will do it: technical skill, physical presence, social communication?',
              'Ask each person about their capacity and availability — do not assume either from past history',
              'Allow reserve capacity: do not fill anyone\'s schedule completely, leave room for the unexpected',
              'Document the assignment in writing: a short message summarising the task, deadline, and available resources',
              'Acknowledge early when you have assigned badly and adjust before the failure arrives',
              'After every activity ask: were the roles well matched to the people who held them?',
            ],
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'صِف المهمة أولاً', en: 'Describe the task first' },
              text: {
                ar: 'قبل التكليف، اكتب ما تتوقّعه من المهمة في ثلاث جمل. إن عجزت عن ذلك فالمهمة نفسها غير واضحة بعد، وإعطاؤها لأيّ شخص في هذه الحال يُعرّضه للفشل دون أن يكون له دخل في ذلك.',
                en: 'Before assigning, write what you expect of the task in three sentences. If you cannot, the task itself is not yet clear, and assigning it in that state sets anyone up to fail through no fault of their own.',
              },
            },
            {
              title: { ar: 'القدرة والتوفّر معاً', en: 'Capacity and availability together' },
              text: {
                ar: 'القدرة وحدها لا تكفي إن لم يكن الشخص متاحاً. والتوفّر وحده لا يكفي إن لم تكن المهارة حاضرة. اسأل عن كليهما معاً قبل القرار، واقبل إجابة «لا» من دون أن تجعلها إحراجاً.',
                en: 'Capacity alone is not enough if the person is unavailable. Availability alone is not enough if the skill is absent. Ask about both before you decide, and receive a "no" without making it an embarrassment.',
              },
            },
            {
              title: { ar: 'التكليف الموثَّق', en: 'The documented assignment' },
              text: {
                ar: 'رسالة قصيرة بعد الاتّفاق الشفهي تقول «اتّفقنا أنك تتولّى كذا بحلول كذا». ليست ورقة محاسبة — هي ذاكرة مشتركة تُقلّل سوء الفهم وتُريح الطرفين.',
                en: 'A short message after a verbal agreement saying "we agreed you handle X by Y". Not an accountability form — shared memory that reduces misunderstanding and reassures both sides.',
              },
            },
          ],
        },
        {
          type: 'quiz',
          id: 'tl-q2',
          label: { ar: 'قرارك في التوزيع', en: 'Your assignment decision' },
          question: {
            ar: 'لديك مهمة تتطلّب إجادة الكلام أمام الجمهور. أحمد يُتقن ذلك لكنه أخبرك أن أسبوعه مزدحم. ليلى أقل خبرةً لكنها متاحة تماماً. ماذا تفعل؟',
            en: 'You have a task requiring strong public speaking. Ahmad is good at it but told you his week is packed. Leila is less experienced but fully available. What do you do?',
          },
          options: [
            {
              ar: 'تُعطيها لأحمد لأنه الأفضل فيها، وتطلب منه إعادة ترتيب أولويات أسبوعه لأن المهمة تستحقّ',
              en: 'Give it to Ahmad because he is the best at it, and ask him to reorder the priorities of his week because the task warrants it',
            },
            {
              ar: 'تُعطيها لليلى وتدعمها بالتحضير والتدريب المسبق',
              en: 'Give it to Leila and support her with preparation and prior coaching',
            },
            {
              ar: 'تُؤدّيها بنفسك حتى لا تُرهق أيّاً منهما في أسبوع مزدحم',
              en: 'Do the task yourself so as not to burden either of them during a busy week',
            },
            {
              ar: 'تؤجّل المهمة حتى يتوفّر أحمد',
              en: 'Postpone the task until Ahmad is available',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'إعطاء المهمة لمن قال إن أسبوعه مزدحم هو تجاهل لما أخبرك به صراحةً. التأجيل ليس دائماً ممكناً. والقيام بها بنفسك يحلّ اليوم ولكن لا يبني قدرة الفريق. ليلى مع الدعم المناسب تُنجز المهمة وتُطوّر شخصاً في آنٍ معاً. القائد الجيّد لا يبحث عن أفضل شخص فحسب — يبحث عن أفضل توافق بين المهمة والشخص والظرف الفعلي.',
            en: 'Giving the task to someone who told you their week is packed ignores what they explicitly said. Postponing is not always possible. Doing it yourself solves today but builds nothing. Leila with appropriate support accomplishes the task and develops someone simultaneously. A good leader does not just look for the best person — they look for the best match between task, person, and actual circumstance.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'tl-m3',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'Briefing وDebriefing — قبل النشاط وبعده', en: 'Briefing and Debriefing — Before and After' },
      lede: {
        ar: 'دقائق قبل النشاط تُوفّر ساعات من التصحيح بعده، ودقائق بعده تُعلّم ما لا يُعلّمه أيّ تدريب نظري.',
        en: 'Minutes before an activity save hours of correction after it, and minutes after it teach what no classroom training can.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الـBriefing هو اللحظة التي تتحوّل فيها الخطة من ورقة في يد القائد إلى صورة مشتركة في ذهن الفريق بأكمله. حين يبدأ نشاط بلا briefing، يعمل كل شخص بنسخته الخاصة من الخطة المتخيَّلة، وتلك النسخ لن تتطابق حين يقع أيّ طارئ أو تتغيّر أيّ ظروف. الـBriefing الجيّد لا يحتاج أكثر من عشر دقائق ويُجيب عن خمسة أسئلة: ماذا نفعل اليوم بالضبط؟ من مسؤول عن ماذا بالاسم؟ ما الجدول الزمني ونقاط التحوّل فيه؟ ما الاحتمالات التي قد تتغيّر وماذا نفعل حينها؟ ومن نتّصل به إن احتجنا مساعدة تتخطّى صلاحياتنا؟ فريق يسمع هذه الأسئلة ويُجيب عنها معاً يبدأ النشاط بوضوح لا بتخمين.',
            en: 'A briefing is the moment when a plan moves from a sheet in the leader\'s hands to a shared picture in every team member\'s mind. When an activity starts without a briefing, each person works from their own imagined version of the plan, and those versions will not match when anything goes wrong or conditions change. A good briefing takes no more than ten minutes and answers five questions: what exactly are we doing today, who is responsible for what by name, what is the timeline and its turning points, what might change and what do we do then, and who do we call if we need a decision above our authority?',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'ابدأ بالهدف في جملة واحدة: ماذا نريد أن نكون قد أنجزنا في نهاية هذا النشاط؟',
              'وزّع الأدوار بصوت مسموع أمام الجميع حتى يعرف كل شخص ما هو دور غيره لا دوره فحسب',
              'راجع الجدول الزمني ونقاط التحوّل: متى نبدأ، متى نتوقّف، متى نُقيّم',
              'اذكر ما قد يتغيّر وما الخطوة البديلة: «إن حدث كذا نفعل كذا» — لا تترك الطارئ بلا خطة',
              'افتح مجالاً لسؤال واحد: من يلتزم الصمت الآن قد يتصرّف بمبادرة فردية وسط النشاط',
              'أنهِ بجملة تأكيد جماعي: «كلّنا اتّفقنا على هذا» — التأكيد يُقلّل التفسيرات الفردية لاحقاً',
            ],
            en: [
              'Start with the goal in one sentence: what do we want to have accomplished by the end of this activity?',
              'Assign roles out loud in front of everyone so each person knows what role everyone else holds, not just their own',
              'Review the timeline and its turning points: when we start, when we stop, when we assess',
              'Name what might change and the fallback: "if X happens we do Y" — do not leave the unexpected without a plan',
              'Open the floor for one question — whoever stays silent now may act on individual initiative during the activity',
              'Close with collective confirmation: "we are all agreed on this" — confirmation reduces individual interpretation later',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الـDebriefing بعد النشاط هو الفارق بين فريق يكرّر أخطاءه في كل مرة وفريق يتعلّم منها ويتحسّن. الـDebriefing الجيّد لا يبحث عن مَن أخطأ — يبحث عن ما الذي يُحسَّن. يبدأ دائماً بما نجح، لأن فريقاً يسمع فقط ما فعله خطأً يكفّ تدريجياً عن المبادرة ويبدأ بالعمل بالحدّ الأدنى الآمن. ثم ينتقل إلى ما كان يمكن أن يكون أفضل، بلغة وصفية لا اتّهامية: «لاحظنا أن التنسيق تأخّر في المنتصف» لا «أنت أخّرت كذا». ويختتم بقرار واحد ملموس يُطبَّق في النشاط القادم — قرار واحد فحسب، لأن عشرة قرارات لا يُنفَّذ منها شيء، وقراراً واحداً مع اسم شخص وموعد يُنجَز.',
            en: 'The debriefing after an activity is the difference between a team that repeats its mistakes and a team that learns. A good debriefing does not look for who made the mistake — it looks for what can be improved. It always begins with what worked, because a team that only hears what it did wrong gradually stops taking initiative and begins working to the safe minimum. It then moves to what could have been better, in descriptive rather than accusatory language: "we noticed coordination slipped in the middle" rather than "you delayed X". It closes with one concrete decision for the next activity — one only, with a name and a date attached.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'ما الذي نجح بشكل أفضل مما توقّعنا؟ — ابدأ دائماً بهذا السؤال',
              'أين فُقد التنسيق أو الوضوح؟ وما الذي جعله يضيع؟',
              'هل الأدوار كانت مناسبة لمن أُسندت إليه، أم احتجنا إلى تعديل في اللحظة الأخيرة؟',
              'ماذا كنّا سنفعل بشكل مختلف لو أعدنا النشاط غداً؟',
              'قرار واحد نُطبّقه في النشاط القادم — محدّد بوقت واسم',
            ],
            en: [
              'What worked better than we expected? — always start here',
              'Where was coordination or clarity lost, and what caused it to slip?',
              'Were the assigned roles well matched to the people holding them, or did we need last-minute adjustments?',
              'What would we do differently if we repeated the activity tomorrow?',
              'One decision we implement next time — specific, with a time and a name',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'tl-q3',
          label: { ar: 'في نهاية النشاط', en: 'At the end of the activity' },
          question: {
            ar: 'انتهى نشاط وفريقك متعب. أحد الأعضاء اقترح «نحكي عنه المرة الجاية». ماذا تقول؟',
            en: 'An activity has ended and your team is tired. A member suggests "let\'s talk about it next time." What do you say?',
          },
          options: [
            {
              ar: 'موافق، فالتعب يُضعف التفكير والنقاش غداً سيكون أوضح وأنفع للجميع',
              en: 'Fine — tiredness dulls thinking and tomorrow the discussion will be clearer and more useful for everyone',
            },
            {
              ar: 'عشر دقائق الآن: سؤال واحد عمّا نجح وسؤال واحد عمّا نُغيّره، ثم قرار واحد ننصرف بعده',
              en: 'Ten minutes now: one question on what worked, one on what we change, then one decision and we leave',
            },
            {
              ar: 'تكتب أنت ملاحظاتك بمفردك الليلة وترسلها للفريق غداً صباحاً حتى لا نُثقل على أحد بعد يوم طويل',
              en: 'Write up your notes alone tonight and send them to the team tomorrow morning so nobody is burdened after a long day',
            },
            {
              ar: 'لا داعي للنقاش إن سار النشاط بشكل معقول',
              en: 'No need for discussion if the activity went reasonably well',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'التفكير الجماعي الفوري، حتى لو مختصر، أثمن من نقاش مؤجَّل. ما يُحفَظ من تفاصيل الأداء في الساعة التالية يضيع في معظمه بعد أسبوع. عشر دقائق منظّمة بسؤالين وقرار واحد تُنجز ما يحتاجه الفريق. الكتابة الفردية تفقد التفاعل وتبدو وثيقة محاسبة لا لحظة تعلّم. والتخلّي عن الـDebrief لأن الأمور «سارت بشكل معقول» يُغلق باب التعلّم تماماً.',
            en: 'Immediate collective reflection, even brief, is worth far more than a delayed discussion. Details remembered in the following hour are largely gone the following week. Ten structured minutes with two questions and one decision achieves what the team needs. Solo write-up loses the interaction and looks like an accountability document. Skipping the debrief because things "went reasonably" closes the door to learning entirely.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'tl-m4',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'المتابعة بدون مراقبة', en: 'Follow-up Without Surveillance' },
      lede: {
        ar: 'المتابعة التي تُثبّط أكثر مما تدعم ليست متابعة — هي قلق يمشي بصلاحيات.',
        en: 'Follow-up that discourages more than it supports is not follow-up — it is anxiety walking with authority.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'هناك خطّ رفيع بين المتابعة الداعمة والمراقبة المُثبِّطة، والفرق بينهما ليس في عدد مرّات التواصل بل في الرسالة الضمنية التي يحملها كلٌّ منهما. حين تتّصل بمتطوّع وتسأل «كيف تسير الأمور؟ محتاج شيئاً؟» — الرسالة: أنا موجود معك. حين تتّصل كل يوم وتسأل «أين وصلت؟ لماذا لم تُبلّغني؟» — الرسالة: لا أثق بك. الفريق الذي يشعر بأنه مراقَب يؤدّي الحدّ الأدنى المطلوب ويتجنّب المبادرة خشية الخطأ. الفريق الذي يشعر بأنه مدعوم يُبلّغ عن المشكلة قبل أن تكبر، لأنه يثق بأن الإبلاغ لن يُعاقَب عليه. هذا الفارق هو ما يجعل بعض الفرق تحلّ مشاكلها من الداخل وأخرى تخبّئها حتى تنفجر في أسوأ وقت.',
            en: 'There is a thin line between supportive follow-up and discouraging surveillance, and the difference is not in how often you communicate but in the implicit message each carries. When you call a volunteer and ask "how are things going, do you need anything?" — the message is: I am here with you. When you call every day and ask "where are you up to, why no update?" — the message is: I don\'t trust you. A team that feels monitored performs to the minimum required and avoids initiative for fear of mistakes. A team that feels supported reports problems before they grow, because it trusts that reporting will not be punished.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'متابعة داعمة', en: 'Supportive follow-up' },
          noTitle: { ar: 'مراقبة مُثبِّطة', en: 'Discouraging surveillance' },
          yes: {
            ar: [
              'تحدّد في الـBriefing نقطتَي تحقّق واضحتين ومتّفقاً عليهما مسبقاً',
              'تبدأ التواصل بـ «شو محتاج؟» قبل «وين وصلت؟»',
              'تجعل التواصل في الاتجاهين: «أخبرني إن اصطدمت بشيء»',
              'تُبلَّغ بالمشاكل طوعاً لأن الفريق يثق أن الإبلاغ لن يُعاقَب عليه',
              'تُنهي كل تواصل بـ «أنا هنا إن احتجت»',
            ],
            en: [
              'You set two clear check-in points in the briefing, agreed in advance',
              'You open with "what do you need?" before "where are you up to?"',
              'You make communication two-way: "let me know if you hit anything"',
              'Problems are reported voluntarily because the team trusts it won\'t be punished',
              'You end every contact with "I am here if you need me"',
            ],
          },
          no: {
            ar: [
              'تتواصل خارج نقاط التحقّق المتّفق عليها دون سبب واضح',
              'تُراجع العمل مباشرةً بدلاً من السؤال عن العوائق',
              'تجعل التواصل في اتجاه واحد: أنت تسأل وهم يُجيبون',
              'يُخفي الفريق المشاكل لأنهم يخشون ردّ فعلك',
              'تنهي كل تواصل بتذكير بالموعد النهائي',
            ],
            en: [
              'You contact outside agreed check-in points without a clear reason',
              'You review the work directly rather than asking about obstacles',
              'You make communication one-way: you ask, they answer',
              'The team hides problems because they fear your reaction',
              'You end every contact with a deadline reminder',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'اتّفق على المتابعة في الـBriefing', en: 'Agree on check-ins at the briefing' },
          content: {
            ar: 'حين تُحدَّد نقاط التحقّق مسبقاً في الـBriefing ويوافق الجميع عليها، يتوقّف التواصل اللاحق عن أن يبدو مراقبةً ويصبح وفاءً بما اتُّفق عليه. الشخص الذي عرف من البداية أنك ستسأله بعد يومين لا يشعر بالإزعاج من السؤال — يتوقّعه ويتحضّر له. الاتّفاق المسبق يُحوّل المتابعة من فعل يُصدر عنك إلى بنية يعمل ضمنها الجميع.',
            en: 'When check-in points are agreed in advance at the briefing and everyone accepts them, subsequent contact stops feeling like surveillance and becomes honouring what was agreed. The person who knew from the start that you would check in after two days is not bothered by the question — they expect it and prepare. A prior agreement transforms follow-up from something you do to a structure everyone works within.',
          },
        },
        {
          type: 'quiz',
          id: 'tl-q4',
          label: { ar: 'قرارك في المتابعة', en: 'Your follow-up decision' },
          question: {
            ar: 'اتّفقت مع متطوّع أن تتابع معه بعد ثلاثة أيام. مضى يوم ونصف ولم يُرسل أيّ تحديث. ماذا تفعل؟',
            en: 'You agreed with a volunteer to check in after three days. A day and a half has passed with no update from them. What do you do?',
          },
          options: [
            {
              ar: 'تنتظر حتى الموعد المتّفق عليه بعد يوم ونصف',
              en: 'Wait until the agreed time — another day and a half',
            },
            {
              ar: 'تتّصل الآن لأن غيابه عن التواصل مقلق',
              en: 'Call now because the silence worries you',
            },
            {
              ar: 'تُرسل رسالة تُذكّره بالموعد النهائي',
              en: 'Send a message reminding him of the deadline',
            },
            {
              ar: 'تطلب من زميله أن يعرف منه أين وصل',
              en: 'Ask a colleague of his to find out where he has got to',
            },
          ],
          correct: 0,
          feedback: {
            ar: 'الاتّفاق هو الاتّفاق. التدخّل قبل موعد التحقّق المتّفق عليه يُرسل رسالة أنك لا تثق بالاتّفاق نفسه أو بالشخص. غياب التحديثات بين نقاط التحقّق ليس صمتاً مقلقاً — هو الشخص يعمل. إن وجدت نفسك قلقاً بعد يوم ونصف فحسب، فربما نقطة التحقّق كانت طويلة جداً لهذه المهمة بالذات، ومحلّ التصحيح هو الاتّفاق القادم لا التدخّل الآن.',
            en: 'An agreement is an agreement. Intervening before the agreed check-in point signals that you don\'t trust the agreement or the person. No updates between check-in points is not worrying silence — it is the person working. If you are anxious after just a day and a half, the issue may be that the check-in interval was too long for this task — and the fix is the next agreement, not intervening now.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'tl-m5',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'التقصير — كيف تعالجه من دون أن تكسر أحداً', en: 'Underperformance — How to Address It Without Breaking Anyone' },
      lede: {
        ar: 'التقصير مشكلة حقيقية، والسكوت عنه أسوأ، والمعالجة الخاطئة أسوأ من كليهما.',
        en: 'Underperformance is a real problem, silence about it is worse, and addressing it wrongly is worse than either.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين يُقصّر متطوّع، لديك ثلاثة خيارات. الأول أن تتجاهله وتتحمّل العبء بنفسك أو توزّعه على الآخرين — وهذا يُعلّم الفريق بأكمله أن التقصير لا عواقب له ولا محادثات. الثاني أن تُصعّد فوراً إلى مسؤول أعلى — وهذا يُعلّم الفريق أنك لا تستطيع حلّ مشكلة بسيطة وتُحيلها. الثالث أن تُجري محادثة مباشرة موثّقة — وهذا هو الخيار الوحيد الذي يحترم الشخص وينجز الهدف في آنٍ معاً. المحادثة المباشرة ليست مواجهة ولا محاكمة، هي فرصة لأن تفهم ما لم تره، وتتّفق على ما يتغيّر، وتُعطي الشخص ما يحتاجه ليُصلح الأمر. أغلب حالات التقصير ليست تمرّداً — هي سوء فهم، أو إرهاق، أو مهمة لم تكن الأنسب لهذا الشخص في هذا الوقت بالذات. المحادثة وحدها تُميّز بين الحالات، والصمت يجعلها تبدو متساوية.',
            en: 'When a volunteer underperforms, you have three choices. The first is to ignore it and absorb the work yourself or distribute it — which teaches the whole team that underperformance has no consequences. The second is to escalate immediately to a superior — which teaches the team that you cannot resolve simple problems and only refer them. The third is to have a direct, documented conversation — which is the only choice that respects the person and accomplishes the goal simultaneously. A direct conversation is not a confrontation or a trial; it is an opportunity to understand what you did not see, agree on what changes, and give the person what they need to fix things. Most underperformance is not defiance — it is misunderstanding, exhaustion, or a task that was not the right match at the right time. Only the conversation distinguishes between the cases.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'احتفظ بالوقائع لا بالانطباعات: «لم يُسلَّم التقرير في موعده» لا «أنت غير منظّم»',
              'اختر وقتاً خاصاً هادئاً: لا تُعلّق على الأداء أمام الآخرين أبداً',
              'ابدأ بالسؤال لا بالاتهام: «لاحظت كذا — كيف رأيت الأمر أنت؟»',
              'استمع للإجابة كاملةً قبل أن تُقدّم رأيك — قد يكون هناك ما لا تعرفه',
              'اتّفقا معاً على ما سيتغيّر وبأيّ موعد',
              'وثّق الاتّفاق في رسالة قصيرة بعد المحادثة مباشرةً',
              'إن تكرّر التقصير بعد محادثتين واضحتين، صعِّد ومعك التوثيق',
            ],
            en: [
              'Keep to facts not impressions: "the report was not delivered on time" not "you are disorganised"',
              'Choose a private quiet moment — never comment on performance in front of others',
              'Start with a question not an accusation: "I noticed X — how did you see it?"',
              'Listen to the full answer before offering your view — there may be something you don\'t know',
              'Agree together on what will change and by when',
              'Document the agreement in a short message immediately after the conversation',
              'If the shortfall recurs after two clear conversations, escalate — with documentation in hand',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'التوثيق ليس للمحاسبة — هو للوضوح', en: 'Documentation is not for accountability — it is for clarity' },
          content: {
            ar: 'رسالة قصيرة بعد محادثة صعبة تقول «اتّفقنا على أن يُسلَّم كذا بحلول كذا» تُقلّل فرصة النسيان من الطرفين، وتُقلّل القلق لدى الشخص الآخر لأنه يرى بوضوح ما هو المطلوب منه. التوثيق لا يريد أن يُثبت أنه أخطأ — يريد أن يُعطيه خارطة طريق واضحة للإصلاح، ويُريح كليكما من الذاكرة المتعددة للاتّفاق نفسه.',
            en: 'A short message after a difficult conversation saying "we agreed that X will be delivered by Y" reduces the chance of either side forgetting, and reduces anxiety for the other person because they can see clearly what is required. Documentation does not want to prove they were wrong — it wants to give them a clear roadmap for correction, and spares both of you competing memories of the same agreement.',
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'السكوت يُعلّم الفريق كلّه', en: 'Silence teaches the whole team' },
          content: {
            ar: 'حين تتجاهل تقصيراً ظاهراً، لا يراه الشخص المقصِّر فحسب — يراه بقية الفريق أيضاً. ويتعلّم الجميع أن الالتزام اختياري وأن التقصير لا يستدعي محادثة. هذا هو أسرع طريق لانهيار ثقافة الفريق. المعالجة الهادئة المبكرة تحمي ليس فقط الهدف الحالي، بل المعيار الذي يعمل عليه الجميع.',
            en: 'When you ignore visible underperformance, it is not only the person falling short who sees it — the rest of the team sees it too. Everyone learns that commitment is optional and that shortfall draws no conversation. This is the fastest route to collapsing team culture. Quiet, early addressing protects not just the current goal but the standard everyone works to.',
          },
        },
        {
          type: 'quiz',
          id: 'tl-q5',
          label: { ar: 'سيناريو التقصير', en: 'Underperformance scenario' },
          question: {
            ar: 'كرم لم يُنجز المهمة التي كُلّف بها للمرّة الثانية. في المرّة الأولى اكتفيت بمتابعة بسيطة. ماذا تفعل الآن؟',
            en: 'Karam has not completed his assigned task for the second time. The first time you only followed up briefly. What do you do now?',
          },
          options: [
            {
              ar: 'تُبلّغ المسؤول مباشرةً لأن التكرار يثبت وجود مشكلة تتجاوز صلاحياتك',
              en: 'Report to the supervisor directly because repetition proves a problem beyond your authority',
            },
            {
              ar: 'تُجري معه محادثة خاصة تسأل عن السبب وتتّفقان على ما يتغيّر وتُوثّق الاتّفاق',
              en: 'Have a private conversation asking for the reason, agree on what changes, and document the agreement',
            },
            {
              ar: 'تُعطي مهامه لشخص آخر ولا تذكر الأمر',
              en: 'Give his tasks to someone else and say nothing',
            },
            {
              ar: 'تُذكّره علناً في اجتماع الفريق حتى يفهم الجميع أن التقصير له نتائج، وحتى لا يضطرّ أحد إلى تكرار الحديث معه',
              en: 'Remind him publicly in the team meeting so everyone understands that shortfall has consequences, and so nobody has to have the conversation with him twice',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'التصعيد بعد مرّتين دون محادثة مباشرة يتخطّى الخطوة الأهمّ: فهم السبب. كرم قد يمرّ بظرف شخصي أو المهمة لم تكن واضحة أو لم تناسبه. المحادثة الخاصة الموثّقة تُتيح له فرصة إصلاح الأمر بكرامة. التجاهل يُعلّم الفريق بالصمت، والتعليق العلني يُهين الشخص ويُضعف ثقته في القيادة. المسار الصحيح: محادثة مباشرة موثّقة أولاً، وتصعيد إن تكرّر التقصير بعدها.',
            en: 'Escalating after two instances without a direct conversation skips the most important step: understanding the reason. Karam may be going through something personal, or the task may not have been clear or well matched. A private documented conversation gives him the chance to fix things with dignity. Ignoring teaches the team through silence, and a public comment humiliates the person and weakens trust in leadership. The right path: direct documented conversation first, escalation if the shortfall recurs after it.',
          },
        },
        {
          type: 'quiz',
          id: 'tl-q6',
          label: { ar: 'قبل التصعيد', en: 'Before escalating' },
          question: {
            ar: 'ما الذي يجب أن يكون بيدك قبل أن تُصعّد مشكلة تقصير إلى مسؤول أعلى؟',
            en: 'What must you have in hand before escalating an underperformance issue to a higher authority?',
          },
          options: [
            {
              ar: 'رأي زملاء الشخص المقصِّر في الأمر',
              en: 'The opinion of the underperforming person\'s colleagues',
            },
            {
              ar: 'توثيق لمحادثتين مباشرتين جرتا وما اتُّفق عليه في كلٍّ منهما',
              en: 'Documentation of two direct conversations and what was agreed in each',
            },
            {
              ar: 'قائمة مفصّلة بكل المهام التي لم يُنجزها منذ انضمامه ومواعيد تسليم كلٍّ منها',
              en: 'A detailed list of every task he has failed to complete since joining, with the due date of each one',
            },
            {
              ar: 'تقرير موقَّع من ثلاثة أعضاء آخرين في الفريق يؤكّد وجود المشكلة وتكرارها',
              en: 'A report signed by three other team members confirming that the problem exists and recurs',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'التصعيد بلا توثيق محادثة مباشرة سابقة يعني أن المسؤول الأعلى سيكون أمام كلامك وكلام الشخص المقصِّر دون أساس مشترك. توثيق محادثتين يُثبت أنك حاولت حلّ المشكلة داخلياً وأعطيت الشخص فرصتين حقيقيتين. هذا ليس شرطاً شكلياً — هو ما يجعل التصعيد عادلاً للطرفين، وقابلاً للمعالجة الفعلية بدل أن يصبح شكوى مجرّدة.',
            en: 'Escalating without documentation of a prior direct conversation leaves the superior choosing between your word and the underperforming person\'s with no shared foundation. Documentation of two conversations proves you tried to resolve things internally and gave the person two genuine chances. This is not a formality — it is what makes the escalation fair to both sides and workable rather than just a complaint.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 6
    {
      id: 'tl-m6',
      tag: { ar: 'الوحدة السادسة', en: 'Module 6' },
      title: { ar: 'قراءة الفريق — الإجهاد المبكر والحفاظ على الطاقة', en: 'Reading the Team — Early Burnout and Protecting Energy' },
      lede: {
        ar: 'إشارات الإجهاد تظهر قبل أسابيع من الانسحاب. القائد الذي يقرأها مبكراً يُنقذ شخصاً وينقذ مهمة.',
        en: 'Signs of burnout appear weeks before someone withdraws. The leader who reads them early saves a person and saves a task.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'إجهاد الفريق لا يأتي فجأة — يتراكم ببطء ويُصبح واضحاً فجأة. القائد الذي ينتظر حتى يُصبح الإجهاد ظاهراً لكل الفريق قد فات الوقت المناسب للتدخّل. الإشارات المبكرة لا تُعلن عن نفسها بوضوح: تأخيرات خفيفة في التواصل، قلّة في المبادرة ممن كانوا يبادرون دائماً، ردود أقصر مما هي عليه عادةً، غياب طفيف في الاجتماعات أو الأنشطة. هذه ليست إهمالاً — هي رسائل يُرسلها الجسم والعقل قبل أن يستطيع الشخص صياغتها بكلمات. القائد الجيّد يُلاحظ التغيير لأنه يعرف الوضع الطبيعي لكل شخص في فريقه — ولا يستطيع معرفته إن لم يُقرّبهم منه ابتداءً.',
            en: 'Team burnout does not arrive suddenly — it accumulates slowly and becomes obvious all at once. The leader who waits until fatigue is visible to the whole team has already missed the right moment to act. Early signals do not announce themselves clearly: slight delays in communication, less initiative from people who always used to take it, shorter replies than usual, minor absences from meetings or activities. These are not neglect — they are messages the body and mind send before the person can put them into words. A good leader notices the change because they know the normal state of each person in their team — and they cannot know it if they never drew people close in the first place.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'تعرَّف على الـ«وضع الطبيعي» لكل شخص في فريقك: كيف يتواصل، ما إيقاعه، كيف يبدو حين يكون بخير',
              'التغيير عن الوضع الطبيعي هو الإشارة — لا تقارن شخصاً بشخص آخر، قارنه بنفسه',
              'حين تلاحظ تغيّراً، ابدأ بسؤال مفتوح: «كيف أنت مع كل شيء؟» لا «لماذا تأخّرت؟»',
              'أتِح تخفيف الحمل كخيار حقيقي لا مجاملة: «إن احتجت تأجيل هذا الأسبوع، أقدر أُرتّب»',
              'لا تفضح الإجهاد أمام الفريق — تحدّث مع الشخص خصوصياً أولاً',
              'ضع في الجدول وقتاً بلا مهام بعد الأنشطة الكبيرة — التعافي ليس فراغاً، هو جزء من العمل',
            ],
            en: [
              'Know the "normal state" of each person on your team: how they communicate, their rhythm, how they look when they are doing well',
              'Change from the normal state is the signal — do not compare a person to others, compare them to themselves',
              'When you notice a change, start with an open question: "how are you doing with everything?" not "why are you late?"',
              'Offer load reduction as a real option, not a courtesy: "if you need to defer this week I can arrange it"',
              'Do not expose fatigue in front of the team — talk to the person privately first',
              'Schedule rest after major activities — recovery is not empty time, it is part of the work',
            ],
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'إشارات مبكرة تستوجب سؤالاً', en: 'Early signals that warrant a question' },
              text: {
                ar: 'تأخّر التواصل أكثر مما هو معتاد لهذا الشخص بالذات، أو ردود أقصر، أو غياب في نشاط كان يحضر دائماً. ليست جريمة، لكنها دعوة للسؤال.',
                en: 'Slower communication than is normal for this particular person, shorter replies, or absence from an activity they always attended. Not a crime, but an invitation to ask.',
              },
            },
            {
              title: { ar: 'إشارات متأخّرة تستوجب تدخّلاً', en: 'Late signals that require action' },
              text: {
                ar: 'تراجع واضح في جودة العمل، انسحاب من النقاش في الاجتماعات، أو تكرار الاعتذار عن المهام. هنا المحادثة ليست خياراً بل ضرورة.',
                en: 'A visible drop in work quality, withdrawal from discussion in meetings, or repeated apologies for tasks. At this point a conversation is not optional, it is necessary.',
              },
            },
            {
              title: { ar: 'ما يُعيد الطاقة', en: 'What restores energy' },
              text: {
                ar: 'الاعتراف بالإنجاز بصوت عالٍ أمام الفريق، ونشاط يُتقنه الشخص بعد نشاط أرهقه، ووقت صريح بلا توقّعات. البسيط يعمل.',
                en: 'Public recognition of achievement in front of the team, a task the person excels at after one that exhausted them, and explicit time with no expectations. Simple things work.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'القائد الذي يتعب أيضاً', en: 'The leader who also gets tired' },
          content: {
            ar: 'قراءة الفريق وحماية طاقته ممارسة تبدأ بقراءة الذات. قائد يتجاهل إجهاده الخاصّ لا يُلاحظ الإجهاد عند الآخرين — هو مشغول بالبقاء واقفاً. تخصيص وقت منتظم للمراجعة الذاتية، حتى عشر دقائق أسبوعياً، يُبقيك في وضع تستطيع فيه أن ترى الآخرين بوضوح. القيادة الصحية تبدأ من الداخل.',
            en: 'Reading the team and protecting its energy is a practice that begins with reading yourself. A leader who ignores their own fatigue does not notice it in others — they are too busy staying upright. Setting aside regular time for self-reflection, even ten minutes weekly, keeps you in a position to see others clearly. Healthy leadership starts from the inside.',
          },
        },
      ],
    },
  ],
};
