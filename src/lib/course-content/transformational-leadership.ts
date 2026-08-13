import type { CourseContent } from './types';

/**
 * Level 5 — Transformational and Adaptive Leadership. Pass mark 70.
 *
 * Four interlocking ideas for leaders who work without a clear map:
 * shaping a vision the team can see itself in, meeting resistance rather than
 * routing around it, building a second line of leaders so the organisation
 * does not depend on one person, and holding to values in the moments when
 * breaking them would be faster.
 *
 * The course is built around the gap between intent and practice. Most leaders
 * already know these ideas in principle. The difficulty is not understanding
 * them — it is doing them when the meeting is running long, the deadline is
 * tomorrow, and the easier path is right there.
 */

export const transformationalLeadership: CourseContent = {
  slug: 'transformational-leadership',
  level: 5,
  minutes: 40,
  passMark: 70,
  title: {
    ar: 'القيادة التحويلية والتكيّفية',
    en: 'Transformational and Adaptive Leadership',
  },
  lede: {
    ar: 'قيادة حين لا تكون الصورة واضحة: صياغة رؤية، مواجهة مقاومة، بناء صف ثانٍ من القادة، والتمسّك بالقيم تحت الضغط.',
    en: 'Leading when the picture is not clear: shaping a vision, meeting resistance, building a second line of leaders, and holding to values under pressure.',
  },
  outcomes: {
    ar: [
      'تصوغ رؤية يفهمها الفريق ويرى نفسه فيها',
      'تقود تغييراً وتتعامل مع المقاومة بدل تجاهلها',
      'تبني صفاً ثانياً من القادة بدل أن يعتمد كل شيء عليك',
      'تحافظ على القيم حين يكون خرقها أسرع',
    ],
    en: [
      'Shape a vision the team understands and can see itself in',
      'Lead a change and engage resistance rather than ignoring it',
      'Build a second line of leaders instead of everything depending on you',
      'Hold to the values when breaking them would be faster',
    ],
  },
  sources: [
    'Heifetz, R., Grashow, A. & Linsky, M. — The Practice of Adaptive Leadership (Harvard Business Press)',
    'Burns, J.M. — Leadership (Harper & Row); foundation text on transformational leadership',
    'IFRC — Volunteer Leadership and Management Framework (2023 edition)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'tl-vision',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'صياغة رؤية يرى الفريق نفسه فيها', en: 'Shaping a vision the team can see itself in' },
      lede: {
        ar: 'الرؤية ليست شعاراً يُعلَّق على الجدار، بل قصة يرى فيها كل عضو في الفريق دوره ومعناه.',
        en: 'A vision is not a slogan on the wall; it is a story in which every team member can see their own role and meaning.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الرؤية القيادية الفعّالة ليست وصفاً لما تريده أنت كقائد، بل صورة لما يمكن أن يكون عليه الواقع حين يعمل الفريق بأفضل ما فيه. أغلب القادة حين يُسألون عن رؤيتهم يقدّمون هدفاً رقمياً أو خطة عمل أو مهمة مؤسسية مكتوبة — لا رؤية. الرؤية تجيب على سؤال مختلف: ماذا سيكون مختلفاً في حياة الناس الذين نخدمهم حين ننجح؟ ومن يكون كل واحد منا في تلك الصورة؟ الرؤية التي تُولّد التزاماً حقيقياً تفعل شيئين معاً: تجعل المستقبل ملموساً بما يكفي ليُصدَّق، وتفتح فيه مكاناً لكل شخص في الفريق. القائد الذي يقف أمام فريقه ويقول «نريد أن نصل إلى عشرة آلاف مستفيد» يعطي رقماً. القائد الذي يقول «نريد أن يكون كل طفل في هذا الحي لديه من يهتم إن غاب عن المدرسة» يعطي صورة — وبين الاثنين مسافة بعيدة في الدافعية والمعنى.',
            en: 'An effective leadership vision is not a description of what you as a leader want — it is a picture of what reality can look like when the team is working at its best. Most leaders, when asked about their vision, offer a numeric target, a work plan, or a written institutional mission — not a vision. A vision answers a different question: what will be different in the lives of the people we serve when we succeed? And who is each of us in that picture? A vision that generates real commitment does two things together: it makes the future concrete enough to be believable, and it opens a place inside it for every person on the team. The leader who stands before their team and says "we want to reach ten thousand beneficiaries" gives a number. The leader who says "we want every child in this neighbourhood to have someone who notices when they are absent from school" gives a picture — and between the two there is a large distance in motivation and meaning.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'صياغة الرؤية مع الفريق لا لهم فرق جوهري في ما يحدث بعدها. حين يشترك الناس في بناء الصورة المستقبلية، يصبحون أصحاباً لها لا مُستقبِلين لها. وهذا لا يعني أن القائد يجلس فارغاً ويسأل «ما رؤيتكم؟» ويدوّن ما يُقال — هذا نقاش لا رؤية. بل يعني أن القائد يأتي بمسوّدة رؤية مدروسة، ويعرضها بصدق: «هذا ما أرى، وأريد أن أفهم ما يعني لكم، وما يبدو غائباً عن الصورة بالنسبة إليكم.» الفريق الذي سُئل ووُجد فيه فضاء حقيقي للتعديل والإضافة يمشي بعد ذلك بشكل مختلف تماماً عن فريق تلقّى الرؤية جاهزة ومختومة. والفرق لا يظهر في اجتماع إطلاق المشروع — يظهر في الشهر الثالث حين تصبح الأمور صعبة.',
            en: 'Building a vision with the team rather than for them makes a fundamental difference to what follows. When people take part in constructing the picture of the future, they become its owners rather than its recipients. This does not mean the leader sits empty-handed and asks "what is your vision?" and writes down whatever is said — that is a discussion, not a vision. It means the leader comes with a considered draft and presents it honestly: "this is what I see, and I want to understand what it means to you, and what seems missing from the picture." A team that was genuinely asked and found real space to modify and add will move afterwards in a way that is completely different from a team that received the vision ready-made and sealed. The difference does not show in the project launch meeting — it shows in month three when things become difficult.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'ما الرؤية؟', en: 'What a vision is' },
              text: {
                ar: 'صورة للمستقبل ملموسة، مرتبطة بأثر حقيقي في حياة ناس حقيقيين، تُعرَّف من خلال التغيير لا من خلال الأنشطة.',
                en: 'A concrete picture of the future, tied to real impact in real people\'s lives, defined by the change it describes rather than the activities that produce it.',
              },
            },
            {
              title: { ar: 'ما ليست الرؤية؟', en: 'What a vision is not' },
              text: {
                ar: 'هدف رقمي منفرداً، خطة عمل سنوية، رسالة مؤسسية صِيغت للجمهور، أو قائمة بما ستفعله المنظمة.',
                en: 'A numeric target alone, an annual work plan, an institutional mission written for public consumption, or a list of what the organisation will do.',
              },
            },
            {
              title: { ar: 'كيف تُختبر الرؤية؟', en: 'How to test a vision' },
              text: {
                ar: 'كل عضو في الفريق يستطيع شرحها بكلماته الخاصة، ويستطيع ربط عمله اليومي بها. إن لم يستطع، فهي لم تصل.',
                en: 'Every team member can explain it in their own words and connect their daily work to it. If they cannot, it has not landed.',
              },
            },
            {
              title: { ar: 'لماذا تهمّ القيادة؟', en: 'Why it matters for leadership' },
              text: {
                ar: 'الرؤية توفّر معياراً للقرارات اليومية: «هل هذا يقرّبنا أم يُبعدنا؟» وتُغني عن أن يُسأل القائد في كل تفصيلة.',
                en: 'A vision provides a criterion for daily decisions: "does this bring us closer or take us further?" It reduces the need to ask the leader about every detail.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'الرؤية التي يفهمها المدير فقط لن تتحوّل إلى عمل', en: 'A vision only the manager understands will not become work' },
          content: {
            ar: 'إذا لم يستطع كل متطوّع في فريقك أن يشرح بكلماته ما تفعله المنظمة ولماذا يهمّ، فأنت لا تملك رؤية مشتركة — تملك وثيقة مكتوبة. الاختبار الحقيقي ليس سؤال القيادة بل سؤال الشخص الجديد الذي أتى منذ شهر: «لماذا أنتم هنا؟» إن كانت إجابته عامة ومتذبذبة، فعمل الرؤية لم ينتهِ.',
            en: 'If not every volunteer on your team can explain in their own words what the organisation does and why it matters, you do not have a shared vision — you have a written document. The real test is not asking leadership but asking the person who joined a month ago: "why are you here?" If their answer is vague and unsteady, the vision work is not done.',
          },
        },
        {
          type: 'quiz',
          id: 'tl-q1',
          label: { ar: 'قرارك كقائد', en: 'Your decision as a leader' },
          question: {
            ar: 'متطوّع في فريقك سألك: «لماذا نهتم بهذه المبادرة تحديداً وهناك مشاريع أخرى أكثر وضوحاً؟» أيّ إجابة تعبّر أكثر عن رؤية حقيقية تُلزم؟',
            en: 'A volunteer on your team asks: "why do we focus on this initiative specifically when there are other clearer projects?" Which answer best expresses a real, binding vision?',
          },
          options: [
            { ar: 'لأنها في خطتنا للعام القادم وأُقرّت من مجلس الإدارة', en: 'Because it is in our plan for next year and was approved by the board' },
            { ar: 'لأن هذا المجتمع تحديداً لا أحد يخدمه، ونحن في موقع يمكّننا من تغيير ذلك', en: 'Because this particular community has nobody serving it, and we are in a position that allows us to change that' },
            { ar: 'لأن التمويل متاح لهذا البرنامج وليس لغيره', en: 'Because the funding is available for this programme and not for others' },
            { ar: 'لأن المنظمة الشريكة طلبت منا التركيز هنا', en: 'Because the partner organisation asked us to focus here' },
          ],
          correct: 1,
          feedback: {
            ar: 'الإجابة الثانية وحدها تحكي قصة أثر مرتبط بناس حقيقيين وموقع فعلي للمنظمة في ذلك الأثر. الأولى والثالثة والرابعة إجابات إدارية صحيحة وقد تكون صادقة، لكنها لا تولّد التزاماً لأنها لا تجيب على «لماذا يهمّني هذا أنا». الرؤية هي ما تجعل الناس يختارون البقاء حين تصبح الأمور صعبة — وليست إجابة لسؤال إداري.',
            en: 'Only the second answer tells a story of impact connected to real people and a genuine position the organisation holds in relation to that impact. The first, third and fourth are administratively correct and may well be true, but they do not generate commitment because they do not answer "why does this matter to me." A vision is what makes people choose to stay when things become hard — it is not an answer to an administrative question.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'tl-resistance',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'مواجهة المقاومة بدل تجاهلها', en: 'Meeting resistance rather than ignoring it' },
      lede: {
        ar: 'المقاومة ليست عائقاً أمام التغيير — هي معلومة عنه. القائد الذي يتجاهلها يفوّت أهم بيانات التنفيذ.',
        en: 'Resistance is not an obstacle to change — it is information about it. The leader who ignores it misses the most important implementation data.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين يُعلَن عن تغيير ما في منظمة أو فريق، تبدأ المقاومة عادة قبل أن يُطرح السؤال الأول. وأغلب القادة يتعاملون مع المقاومة كمشكلة في الموقف أو الشخصية — «هذا الشخص لا يريد أن يتغيّر» — لكن هذه النظرة تفوّت شيئاً جوهرياً: المقاومة في أغلب الأحيان رسالة وليست عيباً. الشخص الذي يقاوم يحمل في مقاومته أحد أشياء كثيرة: خوفاً من الخسارة، أو شعوراً بأنه لم يُستشَر، أو فهماً مختلفاً لما سيحدث، أو تجربة سابقة مع تغييرات وُعد بها ولم تتحقّق. القائد الذي يبدأ بالسؤال «ما الذي تخشى أن تخسره؟» بدلاً من «لماذا لا تتعاون؟» يجد نفسه فجأة في محادثة مختلفة تماماً — محادثة فيها معلومة يمكن التصرّف بناءً عليها.',
            en: 'When a change is announced in an organisation or team, resistance usually begins before the first question is asked. Most leaders treat resistance as a problem of attitude or personality — "this person does not want to change" — but this view misses something fundamental: resistance is most often a message, not a flaw. The person who resists carries in their resistance one of many things: fear of loss, a feeling of not having been consulted, a different understanding of what will happen, or a prior experience with promised changes that did not come through. The leader who begins with the question "what are you afraid of losing?" rather than "why are you not cooperating?" suddenly finds themselves in a completely different conversation — one that contains information they can act on.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'التغيير الذي لا يعترف بما يخسره الناس لن يُقبَل ولو كان صحيحاً. هذا مبدأ قيادي محوري يُسمّى أحياناً «الخسارة المعترف بها» — أن تُسمّي ما يتركه الناس وراءهم قبل أن تطلب منهم الانتقال. الانتقال من نظام عمل معروف إلى آخر جديد ليس فقط تعلّم مهارة جديدة — هو أيضاً ترك طريقة عمل أتقنها الشخص وكان يشعر بالكفاءة والثقة فيها. القائد الذي يقول «نعم، سيكون أصعب في البداية، وما بنيتموه معاً لن يضيع — سنحمله معنا إلى المكان الجديد» يفتح باباً. القائد الذي يقول «هذا أسهل وأفضل» ويبدو أنه لا يرى الصعوبة ولا الألم يُغلق الباب — لأن الناس يشعرون أنهم غير مرئيين في عملية التغيير نفسها.',
            en: 'A change that does not acknowledge what people are losing will not be accepted however correct it may be. This is a central leadership principle sometimes called acknowledged loss — naming what people are leaving behind before asking them to move. Transitioning from a familiar way of working to a new one is not just learning a new skill — it is also leaving a way of working the person had mastered and in which they felt competent and confident. The leader who says "yes, it will be harder at first, and what you have built together will not disappear — we will carry it with us to the new place" opens a door. The leader who says "this is easier and better" and appears not to see the difficulty or the pain closes it — because people feel invisible inside the change process itself.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'افتح المحادثة قبل إعلان القرار: «نفكّر في تغيير هذا الجانب، وقبل أن نقرّر أريد أن أفهم تأثيره عليكم»',
              'استمع للمخاوف بلا دفاع — دوّن ما يُقال ولا تردّ على الفور، حتى يشعر الشخص أنه مسموع',
              'افصل بين المخاوف التي تستدعي تعديل القرار والمخاوف التي تستدعي توضيحاً فقط',
              'عدّل ما يمكن تعديله بناءً على ما سمعته، وأخبر الجميع بما تغيّر بسببهم — هذا يُثبت أن المشاركة كانت حقيقية',
              'كن صريحاً بشأن ما لن يتغيّر ولماذا — الغموض في هذا أسوأ بكثير من الرفض الواضح',
              'بعد التطبيق، عُد وتحقّق: ما الذي كنتم تخشونه؟ هل حدث؟ ما الذي لم نتوقّعه معاً؟',
            ],
            en: [
              'Open the conversation before announcing the decision: "we are considering changing this, and before we decide I want to understand its impact on you"',
              'Listen to the concerns without defending — write down what is said and do not respond immediately, so the person feels heard',
              'Separate concerns that call for modifying the decision from concerns that only need clarification',
              'Modify what can be modified based on what you heard, and tell everyone what changed because of them — this proves the participation was real',
              'Be clear about what will not change and why — ambiguity on this is far worse than a clear refusal',
              'After implementation, come back and check: what were you afraid of? Did it happen? What did neither of us anticipate?',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'من يناقش ومن يقاوم', en: 'Who discusses and who resists' },
          content: {
            ar: 'الشخص الذي يطرح أسئلة صعبة ويعترض علناً أحياناً هو أكثر فائدة للتغيير من الشخص الذي يوافق في الاجتماع ولا يُطبّق بعده. المقاومة الصريحة يمكن معالجتها؛ المقاومة الصامتة تظهر في التنفيذ حين يكون التراجع مكلفاً. القائد الذي يُقدّر السؤال الصعب كهدية يبني فريقاً يصارحه، والقائد الذي يعتبره عائقاً يبني فريقاً يوافقه في وجهه ويفعل ما يشاء خلف ظهره.',
            en: 'The person who asks hard questions and objects openly is sometimes more useful to a change than the person who agrees in the meeting and does not follow through afterwards. Open resistance can be addressed; silent resistance shows up in implementation when pulling back is costly. The leader who values a hard question as a gift builds a team that is honest with them; the leader who treats it as an obstacle builds a team that agrees to their face and does what it wants behind their back.',
          },
        },
        {
          type: 'quiz',
          id: 'tl-q2',
          label: { ar: 'قرارك كقائد', en: 'Your decision as a leader' },
          question: {
            ar: 'أعلنتَ تغييراً في آلية تسجيل المتطوّعين. أحد أعضاء الفريق القدامى قال علناً: «هذا النظام الجديد مرهق وغير عملي، نضيع وقتاً بلا طائل.» ما أفضل ردّ فعل؟',
            en: 'You announce a change in volunteer registration. A long-standing team member says publicly: "this new system is exhausting and impractical — we are wasting time for nothing." What is the best response?',
          },
          options: [
            { ar: 'نفهم قلقك، لكن القرار قد اتُّخذ ونحتاج تعاون الجميع للمضيّ قُدُماً', en: 'We understand your concern, but the decision has been made and we need everyone\'s cooperation to move forward' },
            { ar: 'اشرح لي أكثر: ما الذي تجده مرهقاً تحديداً، وهل واجهتَ مشكلة فعلية أم أنها توقّع؟', en: 'Tell me more: what specifically do you find exhausting, and did you encounter an actual problem or is it an expectation?' },
            { ar: 'نحن نسمع الجميع، لكن الأغلبية وافقت على هذا التغيير', en: 'We listen to everyone, but the majority approved this change' },
            { ar: 'سنعطيك وقتاً أطول للتأقلم مع النظام الجديد', en: 'We will give you more time to adapt to the new system' },
          ],
          correct: 1,
          feedback: {
            ar: 'السؤال في الإجابة الثانية يحوّل الاعتراض من موقف إلى معلومة قابلة للتقييم. ربما هناك عيب حقيقي في النظام يجب معالجته، وربما القلق من عدم التجربة الكافية — لكن لا تعرف إلا بالسؤال الصريح. الإجابة الأولى تُغلق المحادثة. الثالثة تُلغي الاعتراض بأغلبية. الرابعة تؤجّله. كل هذه الخيارات تُبقي الشخص خارج التغيير ولا تستفيد من المعلومة التي يحملها.',
            en: 'The question in the second answer turns the objection from a position into assessable information. There may be a real flaw in the system that needs addressing, or the concern may come from insufficient experience — but you do not know without asking directly. The first answer closes the conversation. The third dismisses the objection by majority. The fourth postpones it. All of these leave the person outside the change and fail to use the information they carry.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'tl-adaptive',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'القيادة التكيّفية: المشاكل التي لا تُحلّ بالخبرة', en: 'Adaptive leadership: problems that expertise alone cannot solve' },
      lede: {
        ar: 'المشاكل التقنية لها حلول تقنية. المشاكل التكيّفية تتطلّب أن يغيّر الناس شيئاً في أنفسهم — وهذه وظيفة مختلفة تماماً.',
        en: 'Technical problems have technical solutions. Adaptive problems require people to change something in themselves — and that is a completely different function.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'القيادة التكيّفية مفهوم طوّره رونالد هايفيتز وزملاؤه، وجوهره تمييز بسيط وعميق: بعض المشاكل تُحلّ بخبرة تقنية — نعطيها للمختص وينتهي الأمر بتطبيق الحل. لكن بعض المشاكل لا تُحلّ بهذه الطريقة لأن الحل يتطلّب أن يغيّر الناس مواقفهم أو عاداتهم أو طريقة فهمهم لأدوارهم. وعندما يُعطَى للمشكلة التكيّفية حل تقني، لا تُحلّ — تُؤجَّل أو تُخفى حتى تعود بشكل أكثر تعقيداً. مثال: فريق يعاني من تراجع مشاركة المتطوّعين. الحل التقني هو تحسين طرق التواصل والإعلان عن الفعاليات. لكن إن كان الجذر هو أن المتطوّعين لا يشعرون بأن مساهمتهم مُقدَّرة ولا مرئية، فالإعلان لن يصل، لأن المشكلة تكيّفية: تتطلّب تغيير الطريقة التي يُبنى بها العلاقة بين القيادة والمتطوّع.',
            en: 'Adaptive leadership is a concept developed by Ronald Heifetz and colleagues, and its core is a simple and deep distinction: some problems are solved by technical expertise — we hand them to the specialist and the solution is implemented. But some problems cannot be solved this way because the solution requires people to change their attitudes, habits, or understanding of their roles. When a technical solution is applied to an adaptive problem, it is not solved — it is postponed or hidden until it returns in a more complex form. Example: a team experiencing declining volunteer participation. The technical solution is to improve communication methods and announce events better. But if the root cause is that volunteers do not feel their contribution is valued or visible, better announcements will not reach them, because the problem is adaptive: it requires changing the way the relationship between leadership and volunteer is built.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'مشكلة تقنية', en: 'Technical problem' },
              text: {
                ar: 'ينقص الفريق نظام لجدولة الأنشطة. الحل: اختيار أداة مناسبة وتدريب الفريق عليها. يُعطَى لمن يجيد التقنية، يُطبَّق، ينتهي.',
                en: 'The team lacks a system for scheduling activities. Solution: choose a suitable tool and train the team on it. Handed to whoever has the technical skill, implemented, done.',
              },
            },
            {
              title: { ar: 'مشكلة تكيّفية', en: 'Adaptive problem' },
              text: {
                ar: 'الفريق يعمل في صوامع منفصلة ولا يتشارك المعلومات. لا أداة ستحلّ هذا. الحل يتطلّب تغيير ثقافة العمل نفسها — وهذا يعني أن أشخاصاً يتركون عادات وسلوكيات متجذّرة.',
                en: 'The team works in separate silos and does not share information. No tool will solve this. The solution requires changing the working culture itself — which means people leaving behind deeply rooted habits and behaviours.',
              },
            },
            {
              title: { ar: 'مشكلة مختلطة', en: 'Mixed problem' },
              text: {
                ar: 'جودة تقارير الفريق متدنّية. بعضها مهارة كتابية يمكن تطويرها بتدريب (تقني)، وبعضها شعور بأن التقارير لا يقرأها أحد ولا تُحدث فرقاً (تكيّفي). الحلّ التقني وحده يعالج نصف المشكلة.',
                en: 'The quality of team reports is poor. Some of it is a writing skill that can be developed through training (technical), and some of it is a feeling that reports are read by nobody and make no difference (adaptive). A technical solution alone addresses half the problem.',
              },
            },
          ],
        },
        {
          type: 'text',
          content: {
            ar: 'دور القائد التكيّفي ليس حمل المشكلة بدلاً من الفريق — هذا ما يُسمّيه هايفيتز «أخذ العبء»، وهو فخّ يقع فيه كثير من القادة ذوي الدوافع الطيّبة. حين تحمل المشكلة التكيّفية بدلاً من فريقك، تُريحهم مؤقتاً وتُبقيهم عاجزين على المدى البعيد. الفريق الذي تعلّم أن قائده سيحل المشاكل الصعبة يتوقّف تدريجياً عن تعلّم حلّها، وهذا يجعل القائد لا غنى عنه بطريقة تبدو في ظاهرها شرفاً لكنها في الجوهر هشاشة مؤسسية — لأن المنظمة كلّها تصبح مرتبطة بوجود شخص واحد واستمراريته. القائد التكيّفي لا يعطي الإجابات للمشاكل الصعبة — يطرح الأسئلة الصعبة ويحافظ على مستوى التوتّر الذي يدفع الناس للتغيير دون أن يُكسرهم.',
            en: 'The adaptive leader\'s role is not to carry the problem on behalf of the team — this is what Heifetz calls "taking the work back," a trap that many well-intentioned leaders fall into. When you carry the adaptive problem instead of your team, you relieve them temporarily and keep them incapable in the long run. A team that has learned its leader will solve the hard problems gradually stops learning how to solve them, which makes the leader indispensable in a way that appears like an honour but is in essence institutional fragility — because the whole organisation becomes tied to one person\'s presence and continuity. The adaptive leader does not give answers to hard problems — they ask the hard questions and maintain the level of tension that pushes people toward change without breaking them.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'أسئلة للتمييز بين التقني والتكيّفي', en: 'Questions to distinguish technical from adaptive' },
          content: {
            ar: 'هل الحل «استشر مختصاً وطبّق ما يقول»؟ إذاً غالباً تقني. هل الحل يتطلّب أن يفعل الناس شيئاً صعباً لم يفعلوه من قبل أو يتركوا شيئاً يعتزّون به؟ إذاً غالباً تكيّفي. وكثير من المشاكل مختلطة — التمييز لا يعني الاختيار بينهما، بل يعني معالجة كل جانب بالأدوات المناسبة له.',
            en: 'Is the solution "consult a specialist and apply what they say"? Then it is probably technical. Does the solution require people to do something difficult they have not done before, or leave behind something they value? Then it is probably adaptive. Many problems are mixed — the distinction does not mean choosing between them, but treating each dimension with the tools appropriate to it.',
          },
        },
        {
          type: 'quiz',
          id: 'tl-q3',
          label: { ar: 'قرارك كقائد', en: 'Your decision as a leader' },
          question: {
            ar: 'مديرة برامج ترفع لك مشكلة متكرّرة: بعض الشركاء لا يردّون على البريد الإلكتروني في الوقت المحدد وهذا يُعطّل الجدول. طلبت منك أن «تتدخّل وتحلّ الأمر». كيف تتعامل مع هذا الطلب؟',
            en: 'A programme manager raises a recurring problem with you: some partners do not reply to emails on time and this disrupts the schedule. She asks you to "step in and solve it." How do you handle this request?',
          },
          options: [
            { ar: 'تتّصل بالشركاء مباشرة وتحسم الموضوع', en: 'You call the partners directly and resolve the matter' },
            { ar: 'تسألها: ماذا جرّبتِ حتى الآن؟ وما الذي منعكِ من التصعيد بنفسكِ؟', en: 'You ask her: what have you tried so far? And what prevented you from escalating it yourself?' },
            { ar: 'تضع سياسة جديدة لمتابعة ردود الشركاء', en: 'You create a new policy for tracking partner responses' },
            { ar: 'تُحيل الموضوع إلى المنسّق الإداري للمتابعة', en: 'You refer the matter to the administrative coordinator for follow-up' },
          ],
          correct: 1,
          feedback: {
            ar: 'السؤال يُعيد العبء إلى صاحبته بطريقة لا تبدو رفضاً — بل فضولاً وتفويضاً. التدخّل المباشر يحل الموضوع مرة واحدة ويُعلّمها أن الطريق دائماً أن تأتي إليك. السياسة الجديدة قد تكون مفيدة لكنها تقنية في مشكلة قد يكون جذرها تكيّفياً. الإحالة تتجاهل الفرصة التدريبية الواضحة. المحادثة التي تبدأ بـ «ماذا جرّبتِ» تُبني مديرة قادرة على حل مشاكل مماثلة دون الحاجة إليك في المرة القادمة.',
            en: 'The question returns the work to its owner in a way that does not appear as a refusal — but as curiosity and delegation. Direct intervention solves the matter once and teaches her that the path is always to come to you. A new policy may be useful but is technical in a problem whose root may be adaptive. The referral ignores the clear learning opportunity. The conversation that begins with "what have you tried" builds a manager capable of solving similar problems without needing you next time.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'tl-second-line',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'بناء الصف الثاني من القادة', en: 'Building a second line of leaders' },
      lede: {
        ar: 'المنظمة التي كل شيء فيها يمرّ عبر قائد واحد ليست قوية — هي هشّة. قوّتها حدودها، وغيابه توقّفها.',
        en: 'An organisation where everything passes through one leader is not strong — it is fragile. Its strength is bounded by one person, and their absence stops it.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'القائد الذي لا يبني قادة آخرين يبني لنفسه منظمة تعتمد عليه اعتماداً يبدو في اللحظة الحالية مُريحاً — كل شيء ينجح، والجميع يُقدّرك، والناس يأتون إليك — لكنه في الحقيقة اختناق مؤسسي. كل قرار يحتاجك، وكل أزمة تنتظرك، وكل فكرة جديدة تمرّ عبرك. والمنظمة التي تعتمد على شخص واحد لا تنمو إلا بقدر طاقة ذلك الشخص، ولا تتوسّع إلا حيث يستطيع هو أن يكون حاضراً. وحين يغيب أو يُقرّر الانتقال أو يمرض، تكتشف المنظمة أنها بنت كثيراً حول شخص واحد بدلاً من أن تبني كثيراً داخل الناس. بناء الصف الثاني من القادة هو الاستثمار الأكثر أثراً على المدى البعيد، وهو أيضاً الأكثر تأجيلاً لأنه لا يعطي نتائج مرئية في الأسبوع القادم.',
            en: 'A leader who does not build other leaders builds for themselves an organisation that depends on them in a way that feels comfortable in the present moment — everything works, everyone values you, people come to you — but is in reality an institutional bottleneck. Every decision needs you, every crisis waits for you, every new idea passes through you. An organisation that depends on one person only grows as far as that person\'s capacity, and only expands where they can personally be present. When they are absent, decide to move on, or fall ill, the organisation discovers it has built a great deal around one person instead of building a great deal inside the people. Building a second line of leaders is the highest-impact long-term investment, and also the most postponed, because it yields no visible results next week.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'حدّد بوضوح من في فريقك يملك قدرة قيادية لم تُعطَ له فرصة لإظهارها بعد — القيادة تُرى في أحيان كثيرة في الأزمات والمحادثات الجانبية',
              'أعطِ المهام لا التعليمات: بدلاً من «افعل X بالطريقة Y»، قل «هذه النتيجة المطلوبة، قرّر أنت كيف تصل إليها»',
              'اسمح بالأخطاء في البيئات الآمنة — الخطأ في تجربة صغيرة درس مجاني، والخطأ في غياب التفويض كارثة',
              'اجعل تفكيرك القيادي مرئياً: حين تتخذ قراراً صعباً، شارك عملية تفكيرك لا فقط النتيجة النهائية',
              'تحدّث عن القيادة بصريح العبارة: «أرى فيك قدرة X، وأريد أن نبني عليها معاً — هل تريد؟»',
              'وكّل المسؤولية كاملة غير منقوصة: «هذا المشروع مسؤوليتك» مختلف جوهرياً عن «ساعدني في هذا المشروع»',
            ],
            en: [
              'Identify clearly who on your team has leadership capacity that has not yet had the opportunity to show — leadership is often visible in crises and side conversations',
              'Delegate tasks, not instructions: instead of "do X in way Y", say "this is the outcome needed — you decide how to get there"',
              'Allow mistakes in safe environments — a mistake in a small experiment is a free lesson; a mistake in the absence of delegation is a disaster',
              'Make your leadership thinking visible: when you make a hard decision, share the thinking process, not just the final outcome',
              'Talk about leadership directly: "I see capacity X in you and I want us to build on it together — do you want that?"',
              'Delegate full responsibility, not half of it: "this project is yours" is fundamentally different from "help me with this project"',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'التوكيل الحقيقي يعني قبول أن الشخص قد يفعل الأمر بطريقة مختلفة عن طريقتك — وأن هذا جيد في أغلب الأحيان. القائد الذي يُوكّل ثم يتدخّل في كل تفصيلة أعاد مركزة القرار بشكل غير مُعلَن، وأرسل رسالة واضحة: «أنا لا أثق فعلاً». الفرق بين الإشراف والتدخّل دقيق لكنه جوهري: الإشراف يعني أنك متاح إن احتيج إليك، وتتابع المسار العام. التدخّل يعني أنك تعمل مكان الشخص بينما تبدو أنك تدعمه. الأول يبني قائداً يثق بنفسه. الثاني يبني موظّفاً ينفّذ تحت وهم الاستقلالية — وهو حين يُوضَع في موقف جديد يُقرّر انتظارك.',
            en: 'Real delegation means accepting that the person may do things differently from how you would — and that this is usually fine. A leader who delegates then intervenes in every detail has re-centralised the decision covertly, and sent a clear message: "I do not actually trust you." The difference between supervision and intervention is subtle but fundamental: supervision means you are available if needed and track the overall direction. Intervention means you are doing the work in the person\'s place while appearing to support them. The first builds a leader who trusts themselves. The second builds an employee who executes under the illusion of independence — who, when placed in a new situation, will wait for you.',
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'التفويض بلا دعم ليس تمكيناً', en: 'Delegation without support is not empowerment' },
          content: {
            ar: 'القائد الذي يُعطي مسؤولية من دون موارد ودعم ومتابعة حقيقية لا يُمكّن — يتخلّص من عبء. هذا يُخفق المشروع ويُحبط الشخص معاً، ويجعل الخطوة القادمة في التفويض أصعب لأن الشخص تعلّم أن التفويض معناه الترك. التمكين يتطلّب ثلاثة أشياء معاً: السلطة الكافية لاتخاذ القرارات، والموارد الكافية للتنفيذ، والمتابعة الكافية للتعلّم. الثلاثة معاً أو لا شيء.',
            en: 'A leader who gives responsibility without real resources, support, and follow-through is not empowering — they are offloading a burden. This fails the project and demoralises the person simultaneously, and makes the next step in delegation harder because the person has learned that delegation means abandonment. Empowerment requires three things together: sufficient authority to make decisions, sufficient resources to implement, and sufficient follow-through to learn. All three together — or nothing.',
          },
        },
        {
          type: 'quiz',
          id: 'tl-q4',
          label: { ar: 'قرارك كقائد', en: 'Your decision as a leader' },
          question: {
            ar: 'عيّنتَ زميلاً لقيادة فعالية جديدة. في منتصف التحضير جاءك يقول: «لست متأكّداً من الطريقة الصحيحة للتنسيق مع المتطوّعين، هل تتولّاها أنت؟» ما ردّك؟',
            en: 'You have appointed a colleague to lead a new event. Mid-preparation he comes to you saying: "I\'m not sure of the right way to coordinate with volunteers — could you take that over?" What is your response?',
          },
          options: [
            { ar: 'بالطبع، سأتولّاها حتى لا يتأخّر التحضير ونضمن الجودة', en: 'Of course, I\'ll take it over so preparation doesn\'t fall behind and we guarantee the quality' },
            { ar: 'أخبرني: ما الذي جرّبته حتى الآن؟ وما الذي يجعلك غير متأكّد بالتحديد؟', en: 'Tell me: what have you tried so far? And what specifically makes you unsure?' },
            { ar: 'ثق بنفسك، أنت قادر وستنجح بالتأكيد', en: 'Trust yourself — you are capable and you will definitely succeed' },
            { ar: 'سأعطيك قائمة تفصيلية بالخطوات، اتّبعها خطوة خطوة', en: 'I will give you a detailed list of steps — follow them one by one' },
          ],
          correct: 1,
          feedback: {
            ar: 'السؤال يكشف إن كانت المشكلة نقص مهارة أو نقص ثقة أو نقص معلومة — وكل واحدة لها إجابة مختلفة. الخيار الأول يسحب المسؤولية ويفقده الفرصة التعليمية. الثالث يتجاهل المشكلة بتشجيع فارغ لا يُضيف. الرابع يحلّ الموضوع لمرة واحدة ويُبقيه تابعاً لا قائداً. المحادثة هي الأداة القيادية هنا: اسأل أولاً، ثم قرّر كيف تدعمه بناءً على ما تسمعه.',
            en: 'The question reveals whether the problem is a skill gap, a confidence gap, or an information gap — each has a different answer. Option one withdraws responsibility and denies him the learning opportunity. Three ignores the problem with empty encouragement that adds nothing. Four resolves the matter once and keeps him a follower rather than a leader. The conversation is the leadership tool here: ask first, then decide how to support him based on what you hear.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'tl-values',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'الحفاظ على القيم حين يكون خرقها أسرع', en: 'Holding to values when breaking them would be faster' },
      lede: {
        ar: 'القيم التي لا تُختبر تحت الضغط لا تُعرف حقاً. الضغط لا يُخلق القيم — يكشف ما كان موجوداً فعلاً.',
        en: 'Values that are not tested under pressure are not truly known. Pressure does not create values — it reveals what was actually there.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'في الحياة العادية، القيم سهلة. الشفافية جميلة حين لا يوجد ما تخفيه. الاحترام سهل حين لا يُخطئ أحد ولا يُزعجك أحد. والعدالة مريحة حين لا تكلّف شيئاً. لكن القيم لا تُثبت وجودها إلا في اللحظة التي يكون فيها خرقها أسرع، أو أوفر، أو أقل إزعاجاً. وهذه اللحظات تحدث في العمل اليومي أكثر مما يُعترف بها: حين يكون التسرّع في قرار مريحاً لأن الاجتماع قد طال، وحين يكون تجاهل مشكلة أسهل من رفعها رسمياً، وحين يكون التنازل عن مبدأ ممكناً بحجة «هذه مرة واحدة استثنائية». القائد الذي يُرسّخ القيم لا يفعل ذلك في خطاب التأسيس أو اللافتة المعلّقة على الجدار — يفعله في هذه اللحظات الصغيرة، في مكان يراه الجميع.',
            en: 'In ordinary life, values are easy. Transparency is fine when there is nothing to hide. Respect is easy when nobody makes a mistake or irritates you. And fairness is comfortable when it costs nothing. But values only prove themselves in the moment when breaking them would be faster, cheaper, or less disruptive. These moments happen in daily work more often than is acknowledged: when rushing a decision is comfortable because the meeting has run long, when ignoring a problem is easier than formally raising it, when conceding a principle is possible under the reasoning of "this is one exceptional case." The leader who reinforces values does not do so in the founding speech or the poster on the wall — they do it in these small moments, in a place everyone can see.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'حين يرى الفريق قائده يتنازل عن قيمة مرة واحدة، يتعلّمون درساً ضمنياً: القيم مشروطة بالظروف. وحين يتنازل مرتين، يتعلّمون درساً آخر: المرونة في القيم مكافأة وليست استثناءً. وبعد عدد كافٍ من هذه اللحظات، تُصبح القيم المُعلَنة مجرّد ديكور — والفريق يعمل وفق القيم الفعلية التي رأى أن القائد يُجسّدها فعلاً وليست التي يُعلنها كلاماً. لهذا السبب تحديداً، القيادة بالقيم ليست تذكير الناس بالقيم في اجتماعات الفريق — هي التزامك أنت بها في اللحظات التي يتكلّف فيها الالتزام شيئاً حقيقياً. والفريق يُلاحظ الفرق دائماً، حتى حين لا يقول ذلك.',
            en: 'When the team sees their leader concede a value once, they learn an implicit lesson: values are conditional on circumstances. When the leader concedes twice, they learn another: flexibility with values is a reward, not an exception. After enough such moments, the declared values become mere decoration — and the team operates according to the actual values they have seen the leader embody in practice, not the ones declared in words. For this very reason, leading by values is not reminding people of the values in team meetings — it is your own commitment to them in the moments when commitment costs something real. The team always notices the difference, even when they say nothing.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'حين تثبّت قيادتك القيمية', en: 'When you anchor your values-based leadership' },
          noTitle: { ar: 'حين تتآكل قيادتك القيمية', en: 'When your values-based leadership erodes' },
          yes: {
            ar: [
              'تقول «لا» لطلب لا يتوافق مع القيم وتشرح لماذا، حتى حين يأتي الطلب من جهة أعلى',
              'تُقرّ علناً حين أخذتَ قراراً بسرعة أكثر من اللازم وتشرح ما ستفعل مختلفاً في المرة القادمة',
              'تُعيد فتح نقاش أُغلق بسرعة لأن أحداً في الفريق شعر أنه لم يُستمع إليه',
              'تُحيل مخاوف الفريق القيمية إلى مستوى أعلى حتى حين لا يكون ذلك مريحاً لك',
            ],
            en: [
              'Say "no" to a request that does not align with values and explain why, even when the request comes from above',
              'Acknowledge openly when you made a decision faster than warranted and explain what you will do differently next time',
              'Reopen a discussion that was closed too quickly because someone on the team felt unheard',
              'Escalate the team\'s values-based concerns upward even when that is uncomfortable for you',
            ],
          },
          no: {
            ar: [
              'تقول «هذه مرة واحدة استثنائية» وتبرّر استثناءً يصبح نمطاً مع الوقت',
              'تتجنّب المحادثات الصعبة لأن التوقيت سيئ — والتوقيت سيئ دائماً',
              'تختار من تُطبَّق القيم عليه بحسب الظروف والعلاقة لا بحسب المبدأ',
              'تُغلق باب التساؤل حول القرارات لأن «القرار اتُّخذ ولا معنى للنقاش»',
            ],
            en: [
              'Say "this is one exceptional case" and justify an exception that becomes a pattern over time',
              'Avoid difficult conversations because the timing is bad — and the timing is always bad',
              'Choose who the values apply to based on circumstances and relationships, not on principle',
              'Close the door to questioning decisions because "the decision was made and discussion is pointless"',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'القيم المُطبَّقة انتقائياً تُدمّر الثقة', en: 'Values applied selectively destroy trust' },
          content: {
            ar: 'القائد الذي يدافع عن القيم حين يأتي الضغط من أسفل ويُسقطها حين يأتي الضغط من أعلى يُعلّم الفريق شيئاً واحداً لا لبس فيه: القيم تُطبَّق على من هم أقل قوة. وهذا يُدمّر الثقة بشكل يصعب إصلاحه بسرعة، لأنه يمسّ الشعور بالعدالة — وهو من أعمق الحاجات التي يبحث عنها الناس في بيئة العمل.',
            en: 'A leader who defends values when pressure comes from below and drops them when pressure comes from above teaches the team one unambiguous thing: values apply to those with less power. This destroys trust in a way that is hard to repair quickly, because it touches the sense of fairness — which is among the deepest needs people seek in a working environment.',
          },
        },
        {
          type: 'quiz',
          id: 'tl-q5',
          label: { ar: 'قرارك كقائد', en: 'Your decision as a leader' },
          question: {
            ar: 'في منتصف تنفيذ مشروع، اكتشفتَ أن أحد أعضاء الفريق لم يوثّق جزءاً من العمل كما تتطلّبه السياسة. الموعد النهائي قريب والتوثيق الكامل سيأخذ وقتاً. ماذا تفعل؟',
            en: 'Mid-project, you discover a team member has not documented a portion of the work as policy requires. The deadline is close and full documentation will take time. What do you do?',
          },
          options: [
            { ar: 'تتجاهل الموضوع هذه المرة لأن الموعد لا يحتمل التأخير', en: 'You overlook it this time because the deadline cannot absorb the delay' },
            { ar: 'تخصّص وقتاً من الجدول للتوثيق حتى لو تأخّر التسليم قليلاً، وتتحدّث مع الشخص عن لماذا التوثيق ليس إجراءً إدارياً فارغاً', en: 'You make time in the schedule for documentation even if delivery is slightly delayed, and speak with the person about why documentation is not an empty administrative procedure' },
            { ar: 'توثّق الجزء الناقص أنت بسرعة لإغلاق الموضوع دون إثارة ضجّة', en: 'You quickly document the missing portion yourself to close the matter without making a fuss' },
            { ar: 'تُبلّغ الإدارة بالأمر رسمياً لأن الخطأ في مسؤولية الشخص', en: 'You formally report the matter to management because the error is the person\'s responsibility' },
          ],
          correct: 1,
          feedback: {
            ar: 'الخيار الأول يُعلّم الفريق أن السياسات اختيارية حين يضيق الوقت — وهي ستضيق دائماً في وقت ما. الثالث يُزيل العواقب دون أن يُعلّم شيئاً ويبني اعتماداً على القائد. الرابع يُعاقب دون محادثة وقد يكون غير متناسب مع حجم الخطأ. الثاني هو الأصعب والأكثر تكلفةً في اللحظة — وهو بالضبط لهذا الأثمن. معالجة المشكلة بمحادثة هادئة تشرح لماذا التوثيق مهم للمشروع والناس الذين يخدمهم تُبني ثقافة؛ التغاضي عنها يُفكّكها خطوة هادئة في كل مرة.',
            en: 'Option one teaches the team that policies are optional when time is short — and time will always be short at some point. Three removes consequences without teaching anything and builds dependency on the leader. Four punishes without conversation and may be disproportionate to the scale of the error. Two is the hardest and most costly option in the moment — and for exactly that reason it is the most valuable. Addressing the problem with a calm conversation explaining why documentation matters for the project and the people it serves builds a culture; overlooking it quietly dismantles it, one small step each time.',
          },
        },
        {
          type: 'quiz',
          id: 'tl-q6',
          label: { ar: 'قرارك كقائد', en: 'Your decision as a leader' },
          question: {
            ar: 'لاحظت أن فريقك يتمحور حولك تماماً — كل قرار يحتاج مرورك وكل أزمة تنتظر حضورك. ما الخطوة الأولى لبناء خطّ قيادي داخل الفريق؟',
            en: 'You notice your team revolves entirely around you — every decision needs your approval, every crisis waits for your presence. What is the first step to building a leadership pipeline within the team?',
          },
          options: [
            { ar: 'تُعلن عن منصب نائب قائد رسمي لتوزيع العبء على شخص واحد آخر', en: 'Announce a formal deputy leader position to distribute the load onto one other person' },
            { ar: 'تُحدّد من يُظهر مبادرة طبيعية وقدرة على التأثير في الآخرين ثم تُعطيه مسؤوليات كاملة — لا مهام فرعية — مع دعم واضح', en: 'Identify who shows natural initiative and ability to influence others, then give them full responsibilities — not sub-tasks — with clear support' },
            { ar: 'تنظّم تدريباً على القيادة لكل الفريق دون تمييز لأن إبراز أشخاص بعينهم يخلق توتّراً', en: 'Organise leadership training for the entire team without distinction, because singling out individuals creates tension' },
            { ar: 'تنتظر حتى يطلب أحد أعضاء الفريق المزيد من المسؤولية بنفسه', en: 'Wait until someone on the team asks for more responsibility themselves' },
          ],
          correct: 1,
          feedback: {
            ar: 'تعيين نائب واحد يُعيد إنتاج مشكلة الاعتماد على شخص واحد بصورة مختلفة. التدريب الجماعي بلا تفويض حقيقي يبقى تثقيفاً لا قيادةً. وانتظار من يطلب المسؤولية يُفوّت كثيرين يملكون القدرة لكن يفتقرون إلى التشجيع الصريح. الطريق هو الاختيار المدروس المبنيّ على المراقبة، ثم التفويض الكامل مع دعم حقيقي — لأن القائد الناشئ يحتاج مساحة للتجربة أكثر مما يحتاج تعليمات.',
            en: 'Appointing one deputy reproduces the single-person dependency problem in a different form. Collective training without real delegation remains education rather than leadership. Waiting for those who request responsibility misses many who have the capability but lack explicit encouragement. The path is deliberate selection based on observation, then full delegation with real support — because a developing leader needs space to experiment more than they need instructions.',
          },
        },
        {
          type: 'quiz',
          id: 'tl-q7',
          label: { ar: 'قرارك كقائد', en: 'Your decision as a leader' },
          question: {
            ar: 'تحاول قيادة تحوّل ثقافي في مؤسّستك نحو شفافية أكبر وتشاركية في القرار، لكنك تصطدم بمقاومة من الإدارة العليا التي تعتبر ذلك تهديداً للسلطة. كيف تواجه هذا الوضع؟',
            en: 'You are trying to lead a cultural transformation in your organisation towards greater transparency and shared decision-making, but you meet resistance from senior management who see it as a threat to authority. How do you handle this?',
          },
          options: [
            { ar: 'تواصل التغيير بهدوء دون مواجهة الإدارة العليا وتأمل أن تُقنعهم النتائج لاحقاً', en: 'Continue the change quietly without confronting senior management, hoping results will eventually persuade them' },
            { ar: 'توقف عن المحاولة لأن القيادة التحويلية تحتاج دعماً من الأعلى لكي تنجح', en: 'Stop trying because transformational leadership needs top-down support to succeed' },
            { ar: 'تبني تحالفات مع من يدعم التغيير وتُترجم رؤيتك إلى نتائج مرئية مبكّرة تُقلّل خوف الإدارة من الخسارة وتفتح محادثة صريحة معهم عن مخاوفهم الفعلية', en: 'Build alliances with those who support the change, translate your vision into early visible results that reduce management\'s fear of loss, and open an honest conversation with them about their actual concerns' },
            { ar: 'تستقيل وتبحث عن بيئة أكثر انفتاحاً لأن بعض الثقافات المؤسسية لا تتغيّر', en: 'Resign and look for a more open environment because some organisational cultures do not change' },
          ],
          correct: 2,
          feedback: {
            ar: 'التغيير الصامت دون معالجة مقاومة الإدارة ينطوي على خطر الانفجار المتأخّر. والاستسلام يُضيّع الفرصة قبل أن تُُعطَى. الاستقالة قد تكون خياراً أخيراً لكنها ليست الخطوة الأولى. الطريق الأجدى: تحالف مع من يدعم التغيير، وانجازات مبكّرة تُثبت أن الشفافية لا تضعف السلطة بل تُقوّيها، ومحادثة صادقة مع الإدارة تُسمّي مخاوفهم بدل تجاهلها. القيادة التحويلية في وجه المقاومة تحتاج صبراً استراتيجياً لا استسلاماً ولا تحدّياً أعمى.',
            en: 'Silent change without addressing senior management\'s resistance carries the risk of a delayed explosion. Giving up wastes the opportunity before it is given. Resignation may be a last option but is not the first step. The more productive path: ally with those who support change, early achievements that prove transparency strengthens rather than weakens authority, and an honest conversation with management that names their concerns rather than ignoring them. Transformational leadership in the face of resistance needs strategic patience — neither surrender nor blind confrontation.',
          },
        },
      ],
    },
  ],
};
