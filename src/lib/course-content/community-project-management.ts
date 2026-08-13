import type { CourseContent } from './types';

/**
 * Level 5 — Community Project Management, Budget and Risk.
 *
 * The gap this course closes is between someone who can write a proposal and
 * someone who can run what they proposed. Writing a proposal is mostly
 * optimistic; running a project is mostly corrective. Scope creep, a budget
 * that did not hold, a risk that was not in the log, a team that needed more
 * than was estimated — these are the real curriculum here.
 *
 * The emphasis throughout is on discipline, not sophistication: keeping a scope
 * document current, writing a risk log entry nobody will find mysterious in six
 * months, closing a project in a way that the next team can learn from.
 */

export const communityProjectManagement: CourseContent = {
  slug: 'community-project-management',
  level: 5,
  minutes: 45,
  passMark: 70,
  title: {
    ar: 'إدارة المشاريع المجتمعية والميزانية والمخاطر',
    en: 'Community Project Management, Budget and Risk',
  },
  lede: {
    ar: 'دورة حياة مشروع كاملة: نطاق، جدول، ميزانية، سجل مخاطر، إدارة تغيير، وإغلاق يترك دروساً مكتوبة.',
    en: 'A full project lifecycle: scope, timeline, budget, risk log, change control, and a closure that leaves written lessons behind.',
  },
  outcomes: {
    ar: [
      'تحدّد نطاق مشروع وتمنع توسّعه غير المتحكّم فيه',
      'تبني ميزانية واقعية وتدير موارد محدودة',
      'تمسك سجل مخاطر حيّاً وتحدّثه أثناء التنفيذ',
      'تُغلق مشروعاً بتوثيق دروس مستفادة تُقرأ لاحقاً',
    ],
    en: [
      'Define a project\'s scope and stop it expanding uncontrolled',
      'Build a realistic budget and manage limited resources',
      'Keep a risk log alive and update it during delivery',
      'Close a project with lessons documented well enough to be read later',
    ],
  },
  sources: [
    'PMI — A Guide to the Project Management Body of Knowledge (PMBOK Guide), 7th edition',
    'IFRC — Project/Programme Planning: Guidance Manual (2010)',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'cpm-scope',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'النطاق وإدارة التغيير', en: 'Scope and change control' },
      lede: {
        ar: 'المشاريع لا تفشل فجأة — تفشل تدريجياً حين يُضاف طلب بعد طلب بلا قرار مكتوب.',
        en: 'Projects do not fail suddenly — they fail gradually when request follows request with no written decision.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'النطاق هو الحدود المكتوبة للمشروع: ما يشمله وما لا يشمله. وثيقة النطاق ليست وثيقة واحدة تُكتب مرة وتُنسى — بل مرجع يُراجَع عند كل طلب جديد. توسّع النطاق غير المتحكّم فيه، الذي يُسمّى أحياناً "زحف النطاق"، هو السبب الأكثر شيوعاً لتجاوز الميزانية وتأخّر التسليم في المشاريع المجتمعية.\n\nكيف يحدث الزحف؟ ببساطة: طلب صغير لا يبدو مكلفاً، ثم طلب آخر، ثم يجد الفريق نفسه يُنفّذ مشروعاً يختلف عن الذي خطّط له. الحلّ ليس رفض كل تغيير — بل إخضاع كل تغيير لقرار واعٍ يحسب التكلفة والوقت والأثر على التزامات أخرى.',
            en: 'Scope is the written boundary of the project: what it includes and what it does not. A scope document is not written once and forgotten — it is a reference consulted at every new request. Uncontrolled scope expansion, sometimes called scope creep, is the most common reason for budget overrun and late delivery in community projects.\n\nHow does creep happen? Simply: a small request that does not look expensive, then another, until the team finds itself delivering a project quite different from the one planned. The solution is not to refuse every change — it is to subject every change to a conscious decision that accounts for cost, time, and impact on other commitments.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'إدارة توقّعات أصحاب المصلحة مسؤولية مستمرّة طوال عمر المشروع، لا محادثة تحدث مرّة واحدة في بداية التخطيط ثم تُنسى. أصحاب المصلحة في المشاريع المجتمعية متعدّدون ومتباينو التوقّعات: المانح يريد مؤشّرات قابلة للقياس في المواعيد المحدّدة، والمجتمع المستفيد يريد خدمة تُلمَس في حياته اليومية، والفريق يريد وضوح الأولويات والموارد الكافية للتنفيذ، والشركاء يريدون التنسيق والاحترام المتبادل.\n\nحين تتباعد التوقّعات عن الواقع — وهذا يحدث في كل مشروع دون استثناء — تتحوّل الفجوة إلى خيبة أمل إن لم تُعالَج بالشفافية المبكّرة. المشروع الذي يُفاجئ المانح في تقرير المنتصف بتغيير جوهري لم يُذكر سابقاً يُضعف الثقة بشكل يصعب استعادتها. والمجتمع الذي لا يُعلَم بتأخير يؤثّر على المواعيد الموعودة يشعر بالغدر حتى لو كان التأخير خارجاً عن الإرادة. أداة إدارة التوقّعات الأبسط والأكثر فاعلية هي التواصل الاستباقي: إخبار أصحاب المصلحة بما يتغيّر قبل أن يكتشفوه، وشرح السبب، واقتراح خيار بديل. التواصل الاستباقي ليس اعترافاً بالفشل — هو علامة نضج مؤسسي وإدارة محترفة.\n\nمؤشّر صحّة علاقة أصحاب المصلحة بسيط: هل يطرح المانح أو المجتمع أسئلة مفاجئة في اجتماعات التقييم؟ إن كانوا يعرفون دائماً ما تعرفه قبل أن تُخبرهم فأنت تُدير توقّعاتهم بشكل صحيح. وإن كانوا يكتشفون أشياء لم تُخبرهم بها فثمّة فجوة في التواصل تحتاج سدّاً.',
            en: 'Managing stakeholder expectations is an ongoing responsibility throughout the project\'s life — not a conversation that happens once at the planning stage and is then forgotten. Stakeholders in community projects are multiple and have divergent expectations: the funder wants measurable indicators by set deadlines, the beneficiary community wants a service they feel in their daily lives, the team wants clear priorities and adequate resources for delivery, and partners want coordination and mutual respect.\n\nWhen expectations diverge from reality — and this happens in every project without exception — the gap becomes disappointment if not addressed with early transparency. A project that surprises the funder midway with a significant change not previously mentioned weakens trust in a way that is hard to restore. A community not informed of a delay that affects promised timelines feels betrayed even if the delay was beyond anyone\'s control. The simplest and most effective stakeholder management tool is proactive communication: telling stakeholders about changes before they discover them, explaining the reason, and proposing an alternative. Proactive communication is not an admission of failure — it is a sign of institutional maturity and professional management.\n\nThe health indicator for stakeholder relationships is simple: do funders or the community raise unexpected questions in assessment meetings? If they always know what you know before you tell them, you are managing their expectations correctly. If they are discovering things you did not tell them, there is a communication gap that needs closing.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'وثيقة النطاق: الحد الأدنى', en: 'The scope document: minimum requirements' },
          content: {
            ar: 'وثيقة نطاق قابلة للاستخدام تحتوي على ثلاثة أقسام: ما يشمله المشروع (بتفاصيل قابلة للقياس)، ما لا يشمله صراحةً، ومعايير قبول التسليم. الغموض في أيّ من هذه الأقسام الثلاثة هو المدخل الطبيعي للزحف.',
            en: 'A usable scope document has three sections: what the project includes (in measurable detail), what it explicitly does not include, and delivery acceptance criteria. Ambiguity in any of these three sections is the natural entry point for creep.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'اكتب وثيقة نطاق في بداية كل مشروع وأعطها رقم إصدار',
              'عند كل طلب تغيير: قدّر الوقت والتكلفة والأثر على التزامات أخرى',
              'لا تُدرج تغييراً في العمل قبل الحصول على موافقة كتابية من صاحب القرار',
              'حدّث وثيقة النطاق بعد كل تغيير مقبول وأبلغ الفريق',
            ],
            en: [
              'Write a scope document at the start of every project and give it a version number',
              'For every change request: estimate the time, cost and impact on other commitments',
              'Do not incorporate a change before receiving written approval from the decision-maker',
              'Update the scope document after every accepted change and notify the team',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'cpm-q1',
          label: { ar: 'سؤال ١', en: 'Question 1' },
          question: {
            ar: 'في منتصف تنفيذ مشروع تدريبي، طلب مدير البرنامج إضافة دورة خامسة غير مخطّطة "لأن الوقت يسمح". ماذا تفعل؟',
            en: 'Midway through a training project, the programme manager asks to add an unplanned fifth session "because time allows". What do you do?',
          },
          options: [
            { ar: 'تُقدّر الوقت الإضافي والتكلفة والأثر على الجدول وتطلب قراراً كتابياً', en: 'Estimate the additional time, cost and schedule impact and request a written decision' },
            { ar: 'توافق لأن الطلب من المدير وهو يعلم ما يريد', en: 'Agree because the request comes from the manager and they know what they want' },
            { ar: 'ترفض لأن وثيقة النطاق لا تتضمّن دورة خامسة', en: 'Refuse because the scope document does not include a fifth session' },
          ],
          correct: 0,
          feedback: {
            ar: 'الموافقة الفورية تُعرّض الجدول والميزانية للخطر. والرفض الجامد يتجاهل احتياجاً ربما يستحق التعديل. المسار الصحيح: قيّم الأثر وقرّر بوعي.',
            en: 'Immediate agreement puts the schedule and budget at risk. Rigid refusal ignores a need that may deserve a change. The correct path: assess the impact and decide consciously.',
          },
        },
        {
          type: 'quiz',
          id: 'cpm-q2',
          label: { ar: 'سؤال ٢', en: 'Question 2' },
          question: {
            ar: 'وجدت أن فريقك ينفّذ طلبات لم تُدرَج رسمياً في النطاق وفقد الجدول التزامه الزمني. ما الخطوة الأولى لاستعادة السيطرة؟',
            en: 'You find your team executing requests not formally included in the scope, and the schedule has lost its timeline. What is the first step to regain control?',
          },
          options: [
            { ar: 'احصر كل المهام الحالية وقارنها بالنطاق الأصلي لمعرفة حجم الانحراف', en: 'List all current tasks and compare them with the original scope to understand the extent of the deviation' },
            { ar: 'عقد اجتماع عاجل مع الفريق وابدأ من الصفر', en: 'Hold an emergency meeting with the team and start from scratch' },
            { ar: 'أرسل تقريراً للإدارة وانتظر توجيهاتهم', en: 'Send a report to management and wait for their instructions' },
          ],
          correct: 0,
          feedback: {
            ar: 'لا يمكن اتخاذ قرار دون فهم حجم الانحراف أولاً. الخطوة الأولى تشخيصية دائماً — قبل أي اجتماع أو تقرير.',
            en: 'You cannot decide without first understanding the extent of the deviation. The first step is always diagnostic — before any meeting or report.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'cpm-budget',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'بناء الميزانية وإدارتها', en: 'Building and managing a budget' },
      lede: {
        ar: 'الميزانية ليست مجرّد أرقام — بل افتراضات مكتوبة حول كيف سيُنفَق المال ومتى.',
        en: 'A budget is not just numbers — it is written assumptions about how money will be spent and when.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'ميزانية المشروع المجتمعي تختلف عن ميزانية الشركة في شيء واحد جوهري: كل ريال أو دينار أو دولار له جهة منحت أو تبرّعت، وتوقّع استخدامه بحسب الغرض المُعلن. هذا يعني أن إعادة توزيع الميزانية من بند لآخر ليست قراراً يتخذه مدير المشروع وحده — بل يتطلّب في الغالب موافقة المانح أو المجلس.\n\nالمبدأ الأول في بناء ميزانية قابلة للتنفيذ: ابدأ بالنشاط لا بالرقم. اسأل: ما الذي يجب أن يحدث؟ ثم: كم يكلّف ذلك واقعياً؟ والمبدأ الثاني: ضع احتياطياً للطوارئ يتراوح بين خمسة وعشرة بالمئة من الميزانية الإجمالية، ووثّق شروط استخدامه.',
            en: 'A community project budget differs from a business budget in one fundamental way: every unit of currency has a donor or grant source that expected it to be used for the stated purpose. This means redistributing budget from one line to another is not a project manager\'s unilateral decision — it usually requires donor or board approval.\n\nThe first principle in building an executable budget: start with the activity, not the number. Ask: what must happen? Then: what does that actually cost? The second principle: include a contingency reserve of five to ten percent of the total budget, and document the conditions for using it.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'التكاليف المباشرة', en: 'Direct costs' },
              text: { ar: 'مرتبطة بالنشاط مباشرة: مواد تدريبية، إيجار قاعة، مواصلات ميدانية، مستلزمات فعالية. قابلة للتتبّع والإثبات.', en: 'Directly tied to the activity: training materials, venue rental, field transport, event supplies. Traceable and provable.' },
            },
            {
              title: { ar: 'التكاليف غير المباشرة', en: 'Indirect costs' },
              text: { ar: 'حصّة المشروع من التكاليف التشغيلية المشتركة: الإيجار، الكهرباء، الإنترنت، الرواتب الإدارية. تُحسَب بنسبة مئوية متّفق عليها مع المانح.', en: 'The project\'s share of shared operational costs: rent, electricity, internet, administrative salaries. Calculated as a percentage agreed with the donor.' },
            },
            {
              title: { ar: 'احتياطي الطوارئ', en: 'Contingency' },
              text: { ar: 'لا يُصرَف إلا بموافقة مسبقة ولسبب موثّق. ليس "صندوق مصاريف متنوّعة" — بل خط دفاع عن الميزانية الإجمالية.', en: 'Not spent without prior approval and a documented reason. Not a "miscellaneous expenses" pot — but a defence line for the total budget.' },
            },
          ],
        },
        {
          type: 'text',
          content: {
            ar: 'التباين في الميزانية — الفرق بين ما خُطّط إنفاقه وما أُنفق فعلاً — حقيقة في كل مشروع مجتمعي. السؤال ليس إن كان سيحدث بل متى وفي أيّ اتجاه. الإنفاق الزائد يعني خطر نفاد الموارد قبل اكتمال المخرجات. والإنفاق الناقص ليس بالضرورة كفاءةً — قد يعني أن أنشطةً مخطّطة لم تُنفَّذ بالكامل أو أن التكاليف قُدِّرت بمبالغة، وكلتا الحالتين تستحقّ تفسيراً صادقاً.\n\nالإبلاغ الصادق عن تباين الميزانية يتطلّب ثلاثة عناصر: التعرّف المبكّر على الانحراف بأدوات مراقبة منتظمة، وفهم السبب قبل الإبلاغ عنه، وتقديم خيار واضح للمعالجة مع الإبلاغ. تقرير يقول «تجاوزنا بند المواصلات بنسبة عشرين بالمئة» دون تفسير ودون مقترح يُثير قلق المانح أكثر مما يُطمئنه. تقرير يقول «تجاوزنا بند المواصلات بنسبة عشرين بالمئة بسبب ارتفاع أسعار الوقود غير المتوقّع، وقد عوّضنا ذلك بتخفيض بند المطبوعات بعد حصول موافقتكم على هذا التعديل» هو تقرير احترافي يُظهر أن الفريق يتابع ويُفكّر ويُدير. الفارق بين التقريرين ليس في الحقائق بل في ما يوحي به كلٌّ منهما: الأول يُشعر المانح بأنه يكتشف معلومة ناقصة، والثاني يُشعره بأنه شريك في الحلّ.\n\nالثقافة التي تُشجّع الإبلاغ الصادق عن الانحرافات لا تنشأ تلقائياً — تنشأ حين يرى الفريق أن القائد يتعامل مع الخبر السيئ كمعلومة تحتاج حلاً لا كإخفاق يستدعي عقاباً. الفريق الذي يخشى الإبلاغ عن تجاوز يخفيه حتى يكبر؛ والفريق الذي يتعلّم أن الإبلاغ المبكّر يفتح أبواب الحلّ يُبلّغ مبكّراً دائماً.',
            en: 'Budget variance — the difference between what was planned to be spent and what was actually spent — is a fact in every community project. The question is not whether it will happen but when and in which direction. Overspending signals risk of running out of resources before outputs are complete. Underspending is not necessarily efficiency — it may mean planned activities were not fully executed or costs were overestimated, and both cases deserve honest explanation.\n\nHonest reporting of budget variance requires three elements: early detection of the deviation through regular monitoring tools, understanding the cause before reporting it, and presenting a clear correction option alongside the report. A report saying "we exceeded the transport line by twenty percent" with no explanation and no proposal raises the funder\'s concern more than it reassures them. A report saying "we exceeded the transport line by twenty percent due to unexpected fuel price rises, and we have compensated by reducing the print line, pending your approval of this adjustment" is a professional report showing the team is monitoring, thinking, and managing. The difference between the two reports is not in the facts but in what each implies: the first makes the funder feel they are discovering incomplete information; the second makes them feel they are a partner in the solution.\n\nA culture that encourages honest reporting of deviations does not arise automatically — it arises when the team sees that the leader treats bad news as information needing a solution, not as a failure deserving punishment. A team that fears reporting an overspend hides it until it grows; a team that learns early reporting opens doors to solutions always reports early.',
          },
        },
        {
          type: 'quiz',
          id: 'cpm-q3',
          label: { ar: 'سؤال ٣', en: 'Question 3' },
          question: {
            ar: 'وجدت توفيراً في بند المواصلات وأردت استخدامه لشراء هدايا تحفيزية للمتطوّعين. ما الإجراء الصحيح؟',
            en: 'You found savings in the transport line and want to use them to buy motivational gifts for volunteers. What is the correct procedure?',
          },
          options: [
            { ar: 'اطلب موافقة مكتوبة من المانح قبل نقل البند، وفق شروط العقد', en: 'Request written approval from the donor before transferring the line item, per the contract terms' },
            { ar: 'أصرف من الاحتياطي لأنه مخصّص لهذه الحالات', en: 'Spend from contingency because it is reserved for such cases' },
            { ar: 'لا ضرورة لموافقة لأن التوفير ناتج عن كفاءة وليس عن تقصير', en: 'No approval needed because the saving came from efficiency not shortfall' },
          ],
          correct: 0,
          feedback: {
            ar: 'نقل المبالغ بين البنود يتطلّب موافقة المانح وفق الاتفاقية المُبرمة. "التوفير" لا يمنح صلاحية الإعادة التوزيع الذاتية.',
            en: 'Moving amounts between budget lines requires donor approval per the signed agreement. "Savings" do not grant authority for unilateral reallocation.',
          },
        },
        {
          type: 'quiz',
          id: 'cpm-q4',
          label: { ar: 'سؤال ٤', en: 'Question 4' },
          question: {
            ar: 'في منتصف المشروع لاحظت أن الإنفاق الفعلي يتجاوز الخطة بنسبة ١٥٪. ما الخطوة الأولى؟',
            en: 'Midway through the project you notice actual spending exceeds the plan by 15%. What is the first step?',
          },
          options: [
            { ar: 'حلّل البنود المتجاوزة واكتشف السبب قبل الإبلاغ والمعالجة', en: 'Analyse the overspent lines and find the cause before reporting and correcting' },
            { ar: 'قلّص فوراً أنشطة النصف الثاني للتعويض', en: 'Immediately cut second-half activities to compensate' },
            { ar: 'أبلغ المانح الآن قبل أي تحليل لأن الشفافية مطلوبة', en: 'Report to the donor now before any analysis because transparency is required' },
          ],
          correct: 0,
          feedback: {
            ar: 'الإبلاغ قبل الفهم يُشكّل قلقاً غير ضروري. التحليل أولاً: هل الإنفاز يقابل الإنفاق؟ هل هناك بند واحد متجاوز يمكن تعديله؟ ثم القرار المُبلَّغ.',
            en: 'Reporting before understanding creates unnecessary alarm. Analysis first: does spending match delivery? Is there one overspent line that can be corrected? Then the informed report.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'cpm-risk',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'سجل المخاطر الحيّ', en: 'A living risk log' },
      lede: {
        ar: 'سجل المخاطر المكتوب في بداية المشروع ثم المُهمَل ليس سجل مخاطر — بل وثيقة تطمينية.',
        en: 'A risk log written at the project start then ignored is not a risk register — it is a reassurance document.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'المخاطرة في إدارة المشاريع ليست سلبية بطبيعتها — بل هي حدث غير مؤكّد إن وقع سيؤثّر على أهداف المشروع، سواء بالإيجاب أو السلب. لكن في الواقع العملي للمشاريع المجتمعية، المخاطر التي تظهر في السجلات هي دائماً السلبية: تأخّر شريك، انسحاب ممول، تغيّر في الأوضاع الأمنية.\n\nالسجل الحيّ يعني ثلاثة أشياء: يُحدَّث بانتظام لا عند الأزمة، كل خطر له صاحب مسؤول بالاسم، وكل تغيير في حالة الخطر يُسجَّل بتاريخه. خطر تجاوز موعد التسليم يختلف في احتماله بين الأسبوع الأول والأسبوع الثامن — وهذا الفرق يجب أن يكون ظاهراً في السجل.',
            en: 'Risk in project management is not inherently negative — it is an uncertain event that, if it occurs, will affect project objectives, either positively or negatively. In practice, however, the risks that appear in community project registers are almost always negative: partner delays, donor withdrawal, changing security conditions.\n\nA living log means three things: it is updated regularly rather than at crisis points, every risk has a named responsible person, and every change in risk status is recorded with its date. The likelihood of missing a delivery deadline differs between week one and week eight — and that difference must be visible in the log.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'سجل مخاطر فعّال', en: 'Effective risk log' },
          noTitle: { ar: 'سجل مخاطر شكلي', en: 'Cosmetic risk log' },
          yes: {
            ar: ['يُحدَّث كل أسبوعين على الأقل', 'كل خطر له مالك مسؤول بالاسم', 'يتضمّن تاريخ آخر مراجعة وآخر تغيير', 'مرتبط بخطة الاستجابة'],
            en: ['Updated at least every two weeks', 'Every risk has a named responsible owner', 'Includes date of last review and last change', 'Linked to a response plan'],
          },
          no: {
            ar: ['يُكتَب مرة واحدة ولا يُعاد النظر فيه', 'المسؤول: "الفريق"', 'لا تواريخ ولا تتبّع للتغييرات', 'قائمة مخاوف بلا إجراءات'],
            en: ['Written once and never revisited', 'Responsible party: "the team"', 'No dates, no change tracking', 'A list of concerns with no actions'],
          },
        },
        {
          type: 'quiz',
          id: 'cpm-q5',
          label: { ar: 'سؤال ٥', en: 'Question 5' },
          question: {
            ar: 'في سجل مخاطر المشروع هناك بند: "انسحاب الشريك الميداني | الاحتمال: نادر | الأثر: جسيم". الشريك أرسل بريداً يُلمّح فيه لصعوبات مالية. ماذا تفعل؟',
            en: 'Your risk log has: "Field partner withdrawal | Likelihood: rare | Impact: critical". The partner has sent an email hinting at financial difficulties. What do you do?',
          },
          options: [
            { ar: 'حدّث السجل فوراً: غيّر الاحتمال إلى "ممكن" وابدأ خطة بديلة مؤقتة', en: 'Update the log immediately: change likelihood to "possible" and begin a provisional contingency plan' },
            { ar: 'انتظر حتى يتأكّد الانسحاب قبل تغيير السجل', en: 'Wait until the withdrawal is confirmed before changing the log' },
            { ar: 'أبلغ المانح فوراً لأنه خطر جسيم', en: 'Notify the funder immediately because the impact is critical' },
          ],
          correct: 0,
          feedback: {
            ar: 'المعلومة الجديدة تُغيّر تقدير الاحتمال — والسجل الحيّ يعكس هذا التغيير فوراً. الانتظار للتأكّد يُهدر الوقت المتاح للاستعداد.',
            en: 'New information changes the likelihood estimate — and a living log reflects this change immediately. Waiting for confirmation wastes the time available to prepare.',
          },
        },
        {
          type: 'quiz',
          id: 'cpm-q6',
          label: { ar: 'سؤال ٦', en: 'Question 6' },
          question: {
            ar: 'عضو في الفريق يقول: "سجل المخاطر لم يُفِدنا — كل المشاكل التي وقعت لم تكن فيه". ما ردّك؟',
            en: 'A team member says: "The risk log didn\'t help us — every problem that occurred wasn\'t in it." What is your response?',
          },
          options: [
            { ar: 'سجل المخاطر يلتقط المخاطر المتوقّعة — فائدته تظهر في الاستجابة للمتوقَّع بسرعة. لكن هذا درس لتحسين السجل القادم', en: 'The risk log captures anticipated risks — its value shows in responding to expected issues quickly. But this is a lesson to improve the next log' },
            { ar: 'محقّ: لا فائدة من سجل المخاطر في المشاريع المجتمعية الصغيرة', en: 'He\'s right: there\'s no value in a risk log for small community projects' },
            { ar: 'يجب إعادة كتابة السجل الآن لإضافة المشاكل التي وقعت', en: 'The log should be rewritten now to add the problems that occurred' },
          ],
          correct: 0,
          feedback: {
            ar: 'سجل المخاطر لا يتنبّأ بكل شيء — لكنه يضمن أن المعروف يُعالَج منظّماً. الدروس المستفادة بعد المشروع هي مدخل تحسين السجل القادم.',
            en: 'A risk log does not predict everything — but it ensures the known is handled systematically. Lessons learned after the project are the entry point for improving the next log.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'cpm-delivery',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'التنفيذ والمتابعة', en: 'Delivery and monitoring' },
      lede: {
        ar: 'الجدول المكتوب والواقع الميداني نقطتان مختلفتان — مهمّتك سدّ المسافة بينهما.',
        en: 'The written schedule and field reality are two different things — your job is to close the gap.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'المتابعة الفعّالة ليست حضور الاجتماعات الأسبوعية وسماع "كل شيء تمام". بل هي القدرة على رؤية الانحراف قبل أن يصبح أزمة. في المشاريع المجتمعية، الانحراف الشائع ثلاثة أنواع: تأخّر في التنفيذ (التراكمي)، إنفاز أقل مما خُطّط، أو جودة مختلفة عما وعد المشروع.\n\nأداة المتابعة البسيطة: مقارنة الخطة بالواقع في نقاط محدّدة يُسمّيها المشروع "نقاط تحكّم". عند كل نقطة تحكّم، يُسأل: ما نسبة الإنجاز الفعلي مقارنة بالمخطّط؟ وما التفسير للفجوة إن وُجدت؟ التفسير المقبول يُوثَّق، والتفسير المقلق يُعالَج.',
            en: 'Effective monitoring is not attending weekly meetings and hearing "all is fine." It is the ability to see deviation before it becomes a crisis. In community projects, common deviation comes in three forms: cumulative delivery delay, less output than planned, or different quality from what the project promised.\n\nThe simple monitoring tool: comparing the plan to reality at specific points the project calls "control points." At each control point, the question is: what is the actual completion percentage compared to planned? And what explains the gap if there is one? An acceptable explanation is documented; a concerning one is addressed.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'حدّد نقاط تحكّم في بداية المشروع، ليس في نهايته',
              'عند كل نقطة: راجع الإنجاز الفعلي مقابل الخطة ووثّق الفجوة',
              'اطرح "لماذا؟" على الفجوة قبل "كيف نُعالج؟"',
              'لا تُخلط المتابعة بالإشراف — المتابعة تبحث عن المعلومة، الإشراف يبحث عن الالتزام',
            ],
            en: [
              'Set control points at the start of the project, not at the end',
              'At each point: review actual progress against plan and document the gap',
              'Ask "why?" about the gap before "how do we fix it?"',
              'Do not confuse monitoring with supervision — monitoring seeks information, supervision seeks compliance',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'cpm-q7',
          label: { ar: 'سؤال ٧', en: 'Question 7' },
          question: {
            ar: 'في نقطة التحكّم الثالثة وجدت أن الإنجاز ٦٠٪ بينما الخطة تقول ٨٠٪. الفريق يقول "الأمور ستتحسّن". ماذا تفعل؟',
            en: 'At control point three you find 60% completion where the plan says 80%. The team says "things will improve." What do you do?',
          },
          options: [
            { ar: 'اطلب تحليل مكتوب لأسباب الفجوة وخطة تعويض محدّدة الأنشطة والمواعيد', en: 'Request a written analysis of the gap causes and a specific recovery plan with activities and dates' },
            { ar: 'قبل "الأمور ستتحسّن" فهو تفاؤل مشروع في المشاريع', en: 'Accept "things will improve" as legitimate optimism in projects' },
            { ar: 'أعلن أزمة وادعُ اجتماعاً طارئاً مع المانح', en: 'Declare a crisis and call an emergency meeting with the funder' },
          ],
          correct: 0,
          feedback: {
            ar: '"الأمور ستتحسّن" معلومة فارغة. التحليل والخطة المحدّدة هما الأساس لقرار: هل الفجوة قابلة للتعويض في الجدول الحالي؟ هل يحتاج الجدول تعديلاً؟',
            en: '"Things will improve" is empty information. Analysis and a specific plan are the basis for a decision: can the gap be recovered within the current schedule? Does the schedule need adjusting?',
          },
        },
        {
          type: 'quiz',
          id: 'cpm-q8',
          label: { ar: 'سؤال ٨', en: 'Question 8' },
          question: {
            ar: 'متطوّع رئيسي اضطرّ للانسحاب من المشروع في منتصف التنفيذ. كيف تتعامل مع هذا؟',
            en: 'A key volunteer had to withdraw from the project midway through delivery. How do you handle this?',
          },
          options: [
            { ar: 'قيّم أثر الانسحاب على الجدول والإنجاز، وزّع مهامه الحالية، وابحث عن بديل مع تحديث سجل المخاطر', en: 'Assess the withdrawal\'s impact on schedule and deliverables, redistribute their current tasks, seek a replacement, and update the risk log' },
            { ar: 'وزّع مهامه على الفريق دون تغيير الجدول لأن التغيير يخلق ارتباكاً', en: 'Distribute their tasks to the team without changing the schedule because change creates confusion' },
            { ar: 'أبلغ المانح فوراً وانتظر توجيهاته', en: 'Notify the funder immediately and wait for their instructions' },
          ],
          correct: 0,
          feedback: {
            ar: 'الانسحاب المفاجئ خطر تحقّق — والخطوة الأولى تقييم أثره لا توزيع مهامه بشكل تلقائي. تحديث سجل المخاطر جزء من الاستجابة.',
            en: 'A sudden withdrawal is a risk that materialised — and the first step is assessing its impact, not automatically redistributing tasks. Updating the risk log is part of the response.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'cpm-closure',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'إغلاق المشروع والدروس المستفادة', en: 'Project closure and lessons learned' },
      lede: {
        ar: 'المشروع الذي ينتهي دون توثيق دروسه يُعيد اختراع كل أخطائه في المشروع التالي.',
        en: 'A project that ends without documenting its lessons reinvents every mistake in the next project.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'إغلاق المشروع ليس احتفالاً — بل عملية منظّمة لها مخرجات محدّدة. الإغلاق الجيّد يشمل: مراجعة المخرجات مقابل الخطة (ما أُنجز وما لم يُنجز)، تسوية الميزانية، تسليم وثائق المشروع، وكتابة تقرير دروس مستفادة يُقرأ فعلاً في المشروع القادم.\n\nالدرس المستفاد ليس "كانت هناك تحدّيات". الدرس الحقيقي يقول: ماذا حدث بالتحديد، لماذا حدث، وماذا سنفعل لمنع تكراره؟ غياب التحديد يجعل التوثيق أداة تطمين لا تعلّم.',
            en: 'Project closure is not a celebration — it is an organised process with specific outputs. Good closure includes: reviewing deliverables against the plan (what was and was not completed), settling the budget, handing over project documents, and writing a lessons-learned report that is actually read in the next project.\n\nA lesson learned is not "there were challenges." A real lesson says: what specifically happened, why it happened, and what we will do to prevent it recurring. Without specificity, documentation becomes a reassurance tool, not a learning one.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'إغلاق المشروع مرحلة كاملة لها وزنها ومتطلّباتها، وليست مجرّد لحظة ينتهي فيها آخر نشاط. الإغلاق الجيّد يتضمّن ثلاثة أبعاد متميّزة: التوثيق، والتسليم، والاحتفاء المجتمعي — وكلّ منها يخدم غرضاً مختلفاً.\n\nالتوثيق يعني جمع كل ما أُنتج وأُنجز وتعلّمه الفريق في مكان واحد منظّم يستطيع أي شخص جديد فهمه دون الحاجة إلى من كان موجوداً. هذا يشمل وثائق المشروع الأساسية والتقارير المالية وسجلات القرارات والمراسلات المهمة وملاحظات الدروس المستفادة. التوثيق الغائب يجعل المشروع أثراً في ذاكرة الأشخاص لا بنيةً تُبنى عليها. والتوثيق الجيّد يُجيب على سؤال واحد: كيف يستطيع شخص لم يشارك في المشروع أن يفهم ما حدث ويستكمل من حيث توقّف الفريق السابق؟\n\nالتسليم يعني نقل المسؤوليات والمعلومات والعلاقات إلى الجهة التي ستتولّى الاستمرارية. تسليم رسمي يشمل لقاءات تعريفية وإجابة على الأسئلة وفترة تداخل كافية يعمل فيها الطرفان معاً قبل أن يتولّى الجديد وحده.\n\nالاحتفاء المجتمعي لحظة عامّة يعترف فيها الفريق أمام المجتمع بما أُنجز، ويُسمّي من ساهم، ويُعبّر بصدق عن الشكر. هذه اللحظة تبني ذاكرة جماعية إيجابية تُسهّل مشاركة المجتمع في المشاريع القادمة، وتُرسّخ الشعور بالملكية والانتماء لدى المتطوّعين والمستفيدين معاً. ليست مناسبة ترفيهية خارجة عن السياق — بل لحظة تُعلن فيها المنظمة أمام المجتمع: نجحنا معاً، وشكراً لكل من أسهم في ذلك.',
            en: 'Project closure is a complete phase with its own weight and requirements — not merely the moment the last activity ends. Good closure has three distinct dimensions: documentation, handover, and community celebration — each serving a different purpose.\n\nDocumentation means collecting everything produced, accomplished, and learned by the team into one organised place that any new person can understand without needing someone who was there. This includes core project documents, financial reports, decision logs, key correspondence, and lessons-learned notes. Absent documentation turns a project into a trace in individuals\' memories rather than a foundation to build on. Good documentation answers one question: how can someone who did not participate in the project understand what happened and pick up where the previous team left off?\n\nHandover means transferring responsibilities, information, and relationships to whoever will carry on. A formal handover includes introductory meetings, answering questions, and an adequate overlap period where both parties work together before the incoming party takes over alone.\n\nCommunity celebration is a public moment where the team acknowledges before the community what was accomplished, names those who contributed, and expresses genuine thanks. This moment builds a positive collective memory that makes community participation in future projects easier, and reinforces a sense of ownership and belonging among volunteers and beneficiaries alike. It is not an entertainment event outside the main purpose — it is a moment where the organisation declares before the community: we succeeded together, and thank you to everyone who contributed.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'راجع كل مخرجات المشروع واحداً بواحد وسجّل حالتها: مكتمل، مكتمل جزئياً، لم يُنجز',
              'أغلق الميزانية مع التوثيق الكامل للإنفاق وأي بنود مرحّلة',
              'اجمع الوثائق وأرشفها في المكان المتفّق عليه مع بروتوكول الوصول',
              'احضر جلسة دروس مستفادة مع الفريق واكتب التقرير في ٧٢ ساعة من إغلاق المشروع',
            ],
            en: [
              'Review every project deliverable one by one and record its status: complete, partially complete, not delivered',
              'Close the budget with full documentation of spending and any carried-forward items',
              'Collect documents and archive them in the agreed location with an access protocol',
              'Hold a lessons-learned session with the team and write the report within 72 hours of project closure',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'مراجعة ما بعد المشروع عملية مختلفة عن تقرير الإغلاق الرسمي — هي فرصة تعلّم داخلية للفريق تُسأَل فيها أسئلة صريحة لا تُكتب دائماً في التقارير المرفوعة للمانحين. ما الذي فاجأنا في هذا المشروع ولم نتوقّعه في مرحلة التخطيط؟ ما الذي كنّا سنقرّره بشكل مختلف لو عدنا إلى البداية؟ ما الذي جرّبناه لأوّل مرّة وأثبت فاعليّته ويستحقّ التكرار؟\n\nالجلسة الفعّالة للدروس المستفادة تنتج وثيقة عملية لا تقريراً أكاديمياً. كل درس يُكتب بصيغة: ما الذي حدث، لماذا حدث، وماذا سنفعل مختلفاً في المرة القادمة. صيغة «واجهنا تحدّيات في التنسيق» لا تُفيد أحداً. صيغة «شريك التنفيذ الميداني لم يُجبنا على التواصل في المواعيد المحدّدة مما أخّر ثلاثة أنشطة — في المشروع القادم نضع بند التواصل المباشر الأسبوعي شرطاً في اتفاقية الشراكة» هذا درس قابل للتطبيق.\n\nتوقيت الجلسة مهمّ: كلّما كانت أقرب لإغلاق المشروع كلّما كانت التفاصيل أحياءً في ذاكرة الفريق. تأجيلها أسابيع يُضيّع تفاصيل تبدو صغيرة وقت الإغلاق لكنها تُصبح مهمّة جداً حين تتكرّر في المشروع التالي. الاتفاق على توقيت ثابت للجلسة كجزء من خطّة إغلاق المشروع — لا كخطوة تحدث إن أتاح الوقت — هو ما يُحوّلها من نيّة حسنة إلى ممارسة راسخة.',
            en: 'A post-project review is a different process from the formal closure report — it is an internal team learning opportunity where candid questions are asked that do not always appear in reports submitted to funders. What surprised us in this project that we did not anticipate in planning? What would we have decided differently if we had gone back to the start? What did we try for the first time, proved effective, and deserves repeating?\n\nAn effective lessons-learned session produces a practical document, not an academic report. Each lesson is written in the format: what happened, why it happened, and what we will do differently next time. The formula "we faced coordination challenges" helps no one. The formula "the field implementation partner did not respond to communication on schedule, delaying three activities — in the next project we will include a weekly direct communication clause as a condition in the partnership agreement" is an actionable lesson.\n\nTiming of the session matters: the closer it is to project closure, the more detail is alive in the team\'s memory. Delaying it by weeks loses details that seem small at closure but become very significant when they recur in the next project. Agreeing on a fixed time for the session as part of the project closure plan — not as a step that happens if time allows — is what turns it from good intention into established practice.',
          },
        },
        {
          type: 'quiz',
          id: 'cpm-q9',
          label: { ar: 'سؤال ٩', en: 'Question 9' },
          question: {
            ar: 'مشروع انتهى بإنجاز ٩٢٪ من مخرجاته. كيف توثّق الإغلاق؟',
            en: 'A project ended having delivered 92% of its outputs. How do you document the closure?',
          },
          options: [
            { ar: 'تسجّل ٩٢٪ مع تفصيل الـ ٨٪ غير المكتملة وأسبابها والخطوات اللاحقة إن وجدت', en: 'Record 92% with detail on the 8% not completed, their reasons, and next steps if any' },
            { ar: 'تُسجّل المشروع كمكتمل ١٠٠٪ لأن ٩٢٪ قريب جداً من النجاح الكامل', en: 'Record the project as 100% complete because 92% is very close to full success' },
            { ar: 'تُسجّل المشروع كناجح مع ملاحظة عامة أن بعض المهام تأخّرت', en: 'Record the project as successful with a general note that some tasks were delayed' },
          ],
          correct: 0,
          feedback: {
            ar: 'الدقة في التوثيق ليست تشاؤماً — بل أمانة تجاه المانح والمستفيدين والفريق القادم. الـ ٨٪ غير المكتملة معلومة تعليمية وليست فشلاً يُخفى.',
            en: 'Precision in documentation is not pessimism — it is honesty toward the funder, beneficiaries, and the next team. The 8% not completed is educational information, not a failure to hide.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'دروس المشروع المُستخرجة من المراجعة الختامية لا تُكتب لتُحفظ فحسب — بل لتُقرأ وتُوظَّف في التخطيط للمشاريع القادمة. توثيق القرارات التي اتُّخذت وأسبابها يُبني ذاكرة مؤسّسية حقيقية تُغني الفريق القادم وتُعفيه من تكرار الأخطاء ذاتها. أهمّ ما توثّقه ليس ما نجح فحسب — بل لماذا نجح، وما الشروط التي جعلت النجاح ممكناً.\n\nجلسة الدروس المستفادة لا تتمّ على الورق وحده — بل تحتاج نقاشاً جماعياً يُتيح لكل عضو في الفريق المساهمة بمنظوره الخاص. الدرس الذي استخلصه منسّق اللوجستيات يختلف عن الدرس الذي استخلصه منسّق التواصل مع المستفيدين، وكلاهما يُكمل الصورة. ولهذا تُعقد جلسة الدروس المستفادة جماعياً لا فردياً.',
            en: 'Lessons extracted from the final project review are not written just to be stored — but to be read and applied in planning future projects. Documenting decisions taken and their reasons builds real institutional memory that benefits the next team and spares them from repeating the same mistakes. The most important thing to document is not only what succeeded — but why it succeeded, and what conditions made success possible.',
          },
        },
        {
          type: 'quiz',
          id: 'cpm-q10',
          label: { ar: 'سؤال ١٠', en: 'Question 10' },
          question: {
            ar: 'أثناء جلسة الدروس المستفادة، أحد أعضاء الفريق يقول إن تأخير المشروع كان بسبب "ضعف التزام" شخص بعينه. كيف تدير هذه اللحظة؟',
            en: 'During the lessons-learned session, a team member says the project delay was due to "low commitment" from a specific person. How do you manage this moment?',
          },
          options: [
            { ar: 'وجّه النقاش نحو الأنظمة والعمليات: ما الذي جعل هذا ممكناً؟ وما الذي يمنعه في المرة القادمة؟', en: 'Direct the discussion toward systems and processes: what made this possible? And what prevents it next time?' },
            { ar: 'وثّق الاتهام كما هو لأنه رأي أحد أعضاء الفريق', en: 'Document the accusation as-is because it is one team member\'s view' },
            { ar: 'أوقف النقاش وانتقل لبند آخر لتجنّب التوتّر', en: 'Stop the discussion and move to the next item to avoid tension' },
          ],
          correct: 0,
          feedback: {
            ar: 'جلسة الدروس المستفادة تبحث عن تحسين النظام لا تحديد المذنبين. الأشخاص يتغيّرون، العمليات تبقى — لذا الدرس يجب أن يكون على مستوى العملية.',
            en: 'A lessons-learned session seeks to improve the system, not identify the guilty. People change, processes remain — so the lesson must be at the process level.',
          },
        },
      ],
    },
  ],
};
