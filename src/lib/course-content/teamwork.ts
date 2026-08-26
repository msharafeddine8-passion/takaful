import type { CourseContent } from './types';

/**
 * Level 1 · Course 3 — Teamwork.
 * Universal content for any volunteer in any organisation.
 *
 * Six modules, matching the length this course claims. It ran for a while at
 * three, which made "70 minutes" a promise the content did not keep.
 */
export const teamwork: CourseContent = {
  slug: 'teamwork',
  level: 1,
  minutes: 25, // Measured from the content. See volunteering-foundations.
  passMark: 70,
  title: {
    ar: 'العمل ضمن فريق',
    en: 'Working in a Team',
  },
  lede: {
    ar: 'الأدوار، والتنسيق، وحلّ الخلاف قبل أن يكبر. معظم ما يفشل في الميدان ليس نقص نيّة — بل نقص تنظيم.',
    en: 'Roles, coordination, and resolving friction before it grows. Most field failures are not a lack of good intent — they are a lack of organisation.',
  },
  outcomes: {
    ar: [
      'تفهم الأدوار داخل فريق تطوعي ولماذا يحتاج كل نشاط قائداً',
      'تسلّم وتستلم المهام بوضوح دون التباس',
      'تتواصل داخل الفريق بما يمنع الازدواج والفجوات',
      'تتعامل مع الخلاف مبكراً وبلا تصعيد',
      'تتحمّل مسؤولية خطئك وتصحّحه دون تبرير',
      'تدعم زميلاً متعثّراً بدل أن تتجاوزه',
      'تحضر للنشاط قبل يومه لا في صباحه',
      'تفهم لماذا يكلّف غيابك المفاجئ أكثر مما تظنّ',
      'تستقبل متطوّعاً جديداً وتسلّم ما تعرفه قبل أن تغادر',
    ],
    en: [
      'Understand roles in a volunteer team and why every activity needs a lead',
      'Hand over and take on tasks clearly, without ambiguity',
      'Communicate within the team so that nothing is duplicated or dropped',
      'Address disagreement early and without escalation',
      'Own your mistake and correct it without excuses',
      'Support a struggling teammate instead of working around them',
      'Prepare for an activity the day before, not on the morning',
      'Understand why an unannounced absence costs more than you think',
      'Receive a new volunteer, and hand on what you know before you leave',
    ],
  },
  sources: [
    'IFRC Volunteering Policy (August 2022) — volunteer roles and responsibilities',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
    'Do No Harm principle in humanitarian action',
  ],

  modules: [
    {
      id: 'roles',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'الأدوار والمسؤوليات', en: 'Roles and responsibilities' },
      lede: {
        ar: 'فريق بلا أدوار واضحة ليس فريقاً، بل مجموعة أشخاص في المكان نفسه.',
        en: 'A team without clear roles is not a team — it is a group of people in the same place.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'في أي نشاط تطوعي هناك ثلاثة أسئلة يجب أن يكون لها جواب قبل البدء: من يقود؟ ومن يفعل ماذا؟ وإلى من نعود عند المشكلة؟ غياب أي جواب منها هو سبب معظم الفوضى الميدانية.',
            en: 'In any volunteer activity three questions must have answers before you start: who leads? who does what? and who do we go to when something goes wrong? A missing answer to any of these causes most field chaos.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'قائد النشاط', en: 'Activity lead' },
              text: {
                ar: 'يوزّع المهام، يتخذ القرار عند الاختلاف، ويتحمّل النتيجة. وجوده لا يعني أنه الأهم — بل أنه نقطة الحسم.',
                en: 'Assigns tasks, decides when there is disagreement, and carries the outcome. Their role is not to be the most important — it is to be the point of decision.',
              },
            },
            {
              title: { ar: 'المتطوّع المنفّذ', en: 'Delivering volunteer' },
              text: {
                ar: 'ينفّذ مهمته بدقّة، ويبلّغ فوراً إن تعذّر عليه إتمامها. التأخّر في الإبلاغ أسوأ من التعثّر نفسه.',
                en: 'Delivers their task precisely and reports at once if they cannot complete it. Late reporting is worse than the setback itself.',
              },
            },
            {
              title: { ar: 'مسؤول التوثيق', en: 'Documentation focal point' },
              text: {
                ar: 'يسجّل الحضور والأعداد والملاحظات. بدونه يضيع أثر النشاط كله بعد أسبوع.',
                en: 'Records attendance, numbers and observations. Without them the whole activity leaves no trace within a week.',
              },
            },
            {
              title: { ar: 'مسؤول السلامة', en: 'Safety focal point' },
              text: {
                ar: 'ينتبه للمخاطر ويعرف خطة الطوارئ. دوره يظهر فقط حين تسوء الأمور — وعندها يكون حاسماً.',
                en: 'Watches for hazards and knows the emergency plan. Their role only shows when things go wrong — and then it is decisive.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: '💡 تسليم المهمة: ثلاث نقاط لا غنى عنها', en: '💡 Handing over a task: three essentials' },
          content: {
            ar: 'أي مهمة تُسلَّم يجب أن تحمل: <b>ما المطلوب بالضبط</b>، و<b>متى ينتهي</b>، و<b>ما شكل الإنجاز الصحيح</b>. جملة «شوف الموضوع» ليست تسليم مهمة — بل نقل قلق.',
            en: 'Any task handed over must carry: <b>exactly what is required</b>, <b>when it is due</b>, and <b>what “done” looks like</b>. “Take care of it” is not a handover — it is a transfer of anxiety.',
          },
        },
        {
          type: 'quiz',
          id: 'c3q1',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'كُلّفت بتجهيز قاعة النشاط. وصلت فوجدت متطوّعاً آخر يرتّب القاعة بطريقة مختلفة، ويقول إن القائد كلّفه هو أيضاً.',
            en: 'You were assigned to set up the activity hall. You arrive to find another volunteer arranging it differently, saying the lead assigned them too.',
          },
          options: [
            {
              ar: 'تكمل بطريقتك لأنك كُلّفت أولاً وتتركه يعمل بطريقته',
              en: 'Carry on your way since you were assigned first, and let him do his',
            },
            {
              ar: 'تتنازل وتنسحب تجنّباً للخلاف',
              en: 'Give way and withdraw to avoid conflict',
            },
            {
              ar: 'توقفان معاً دقيقة، تتصلان بالقائد ليحسم من المسؤول، ثم تنفّذان قراره',
              en: 'Both pause for a minute, call the lead to settle who is responsible, then follow their decision',
            },
            {
              ar: 'تتجادلان حتى يقتنع أحدكما',
              en: 'Argue until one of you is convinced',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'ازدواج التكليف خطأ القائد لا خطأكما، وحلّه عنده. الاستمرار بطريقتين ينتج قاعة نصفها هكذا ونصفها هكذا، والانسحاب يترك المهمة لشخص قد يكون فهم التكليف خطأً. دقيقة اتصال توفّر ساعة إصلاح.',
            en: 'A duplicated assignment is the lead’s error, not yours, and the fix sits with them. Carrying on both ways produces a half-and-half hall; withdrawing leaves the task to someone who may have misunderstood. One minute on the phone saves an hour of rework.',
          },
        },
      ],
    },

    {
      id: 'coordination',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'التنسيق ومنع الفجوات', en: 'Coordination and closing gaps' },
      lede: {
        ar: 'الفجوة أخطر من الازدواج: الازدواج يُهدر جهداً، أما الفجوة فتترك مستفيداً بلا خدمة.',
        en: 'A gap is more dangerous than a duplication: duplication wastes effort, but a gap leaves someone unserved.',
      },
      blocks: [
        {
          type: 'list',
          items: {
            ar: [
              'اجتماع قصير قبل النشاط: من يفعل ماذا، وأين، ومتى',
              'اجتماع أقصر بعده: ما نجح، وما تعثّر، وما نغيّره',
              'قناة تواصل واحدة للفريق — لا رسائل خاصة متفرّقة تضيع فيها القرارات',
              'إن أنهيت مهمتك، لا تنتظر: اسأل «شو بقي؟» بدل الوقوف جانباً',
              'إن رأيت شيئاً لا يخصّك لكنه خطأ، أبلغ — الصمت ليس تهذيباً',
            ],
            en: [
              'A short briefing before the activity: who does what, where, and when',
              'An even shorter debrief after: what worked, what struggled, what changes',
              'One team channel — not scattered private messages where decisions get lost',
              'If you finish your task, do not wait: ask “what is left?” rather than standing aside',
              'If you see something outside your task that is wrong, report it — silence is not politeness',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: '⚠️ «ظننتُ أن غيري يفعلها»', en: '⚠️ “I thought someone else was doing it”' },
          content: {
            ar: 'هذه الجملة تسبق معظم الإخفاقات الميدانية. علاجها بسيط: عندما لا تكون متأكّداً من أن أحداً يتولّى أمراً — اسأل. سؤال واحد يمنع فجوة كاملة.',
            en: 'This sentence precedes most field failures. The cure is simple: when you are not certain someone is handling something — ask. One question prevents an entire gap.',
          },
        },
        {
          type: 'quiz',
          id: 'c3q2',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أنهيت مهمتك قبل الوقت، ولاحظت أن زميلاً متأخّر في مهمته ويبدو مرهقاً. ما الأنسب؟',
            en: 'You finished early and notice a teammate is behind and looks overwhelmed. What is most appropriate?',
          },
          options: [
            { ar: 'تنتظر انتهاء النشاط لأنك أدّيت ما عليك', en: 'Wait until the activity ends — you did your part' },
            {
              ar: 'تنفّذ مهمته مكانه بسرعة دون إخباره لتوفير الوقت',
              en: 'Quickly do his task for him without telling him, to save time',
            },
            {
              ar: 'تعرض عليه المساعدة، وإن كانت المهمة تتطلّب تنسيقاً تُعلم القائد',
              en: 'Offer to help, and if the task needs coordination, tell the lead',
            },
            { ar: 'تخبر القائد أن زميلك متأخّر', en: 'Tell the lead that your teammate is behind' },
          ],
          correct: 2,
          feedback: {
            ar: 'عرض المساعدة يحفظ كرامة الزميل ويحلّ المشكلة معاً. التنفيذ عنه دون إخباره قد يفسد ترتيباً يعرفه هو ولا تعرفه أنت، والإبلاغ عنه مباشرةً دون أن تعرض عليه شيئاً يحوّل الفريق إلى مراقبة متبادلة.',
            en: 'Offering help preserves your teammate’s dignity and solves the problem together. Doing it for him without telling him can break an arrangement he knows and you do not, and reporting him without first offering turns the team into mutual surveillance.',
          },
        },
      ],
    },

    {
      id: 'conflict',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'الخلاف والخطأ', en: 'Disagreement and mistakes' },
      lede: {
        ar: 'الخلاف طبيعي في أي فريق. غير الطبيعي أن يُكتَم حتى ينفجر.',
        en: 'Disagreement is normal in any team. What is not normal is bottling it up until it bursts.',
      },
      blocks: [
        {
          type: 'ordered',
          items: {
            ar: [
              'تحدّث مع الشخص مباشرةً أولاً، لا مع بقية الفريق عنه',
              'صف السلوك لا الشخص: «تأخّر التسليم أربكنا» لا «أنت غير مسؤول»',
              'اسمع روايته كاملة قبل أن تحكم — قد يكون هناك ما لا تعرفه',
              'ابحثا عن حلّ للمستقبل، لا عن إثبات من كان مخطئاً',
              'إن لم يُحلّ بينكما، اعرضاه على القائد معاً لا منفردَين',
              'لا تناقش خلافاً أمام المستفيدين إطلاقاً',
            ],
            en: [
              'Speak to the person directly first, not to the rest of the team about them',
              'Describe the behaviour, not the person: “the late handover disrupted us”, not “you are irresponsible”',
              'Hear their full account before judging — there may be something you do not know',
              'Look for a fix going forward, not proof of who was wrong',
              'If it is not resolved between you, take it to the lead together, not separately',
              'Never discuss a disagreement in front of the people you serve',
            ],
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ تعامل ناضج مع خطئك', en: '✔ Owning your mistake' },
          noTitle: { ar: '✘ ما يُفسد الثقة', en: '✘ What breaks trust' },
          yes: {
            ar: [
              'تُبلغ فوراً حين تكتشفه',
              'تذكر أثره الحقيقي دون تهوين',
              'تقترح كيف تصلحه',
              'تسأل ما الذي يمنع تكراره',
            ],
            en: [
              'Reporting it as soon as you notice',
              'Stating its real effect without downplaying',
              'Proposing how to fix it',
              'Asking what prevents it recurring',
            ],
          },
          no: {
            ar: [
              'إخفاؤه أملاً بأن يمرّ',
              'تحميل غيرك المسؤولية',
              'الاعتذار المفرط بدل التصحيح',
              'الوعد بأنه «لن يتكرّر» دون تغيير شيء',
            ],
            en: [
              'Hiding it and hoping it passes',
              'Shifting responsibility onto someone else',
              'Excessive apology instead of correction',
              'Promising “it won’t happen again” while changing nothing',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'c3q3',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'اكتشفت أنك سجّلت أعداد المستفيدين خطأً في تقرير نشاط الأمس، والتقرير أُرسل بالفعل إلى الإدارة.',
            en: 'You discover you recorded the beneficiary numbers incorrectly in yesterday’s activity report, and the report has already gone to management.',
          },
          options: [
            {
              ar: 'تصحّحه بصمت في التقرير القادم دون إخبار أحد',
              en: 'Quietly correct it in the next report without telling anyone',
            },
            {
              ar: 'تُبلغ القائد فوراً بالرقم الصحيح وكيف حدث الخطأ',
              en: 'Tell the lead at once with the correct figure and how the error happened',
            },
            {
              ar: 'تتركه لأن الفرق بسيط ولن ينتبه أحد',
              en: 'Leave it — the difference is small and nobody will notice',
            },
            {
              ar: 'تلوم من أملى عليك الأرقام',
              en: 'Blame whoever gave you the numbers',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'أرقام المستفيدين تدخل في تقارير المنظمة للجهات المانحة. رقم خاطئ لا يُصحَّح يصبح جزءاً من سجلّ رسمي، وقد يُكتشف لاحقاً فيضرب مصداقية المنظمة كلها. الإبلاغ الفوري يحوّل خطأً بسيطاً إلى تصحيح روتيني.',
            en: 'Beneficiary figures feed the organisation’s reports to donors. An uncorrected wrong number becomes part of an official record and, if discovered later, damages the credibility of the whole organisation. Immediate reporting turns a small error into a routine correction.',
          },
        },
      ],
    },

    {
      id: 'preparation',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'التحضير قبل النشاط', en: 'Preparing before the activity' },
      lede: {
        ar: 'النشاط الفاشل نادراً ما يفشل في يومه. يفشل في الليلة التي لم يحضّر فيها أحد.',
        en: 'An activity that fails rarely fails on the day. It fails on the night nobody prepared.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الفرق بين فريق مرتاح وفريق يركض طوال اليوم يُصنَع قبل النشاط بأربع وعشرين ساعة. التحضير ليس مهمة القائد وحده: كل متطوّع مسؤول عن جاهزية دوره هو.',
            en: 'The difference between a calm team and one that runs all day is made twenty-four hours before the activity. Preparing is not the lead’s job alone: every volunteer is responsible for the readiness of their own part.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'اقرأ رسالة التكليف كاملة، لا سطرها الأول فقط',
              'تأكّد أنك تعرف المكان وكيف تصل إليه — لا تفترض أنك ستجده',
              'اسأل عن أي شيء غامض قبل الليلة السابقة، لا في الصباح',
              'جهّز ما تحتاجه بنفسك: هويّتك، ما يلزم دورك، ماء',
              'تأكّد أن هاتفك مشحون وأن رقم القائد محفوظ عندك',
              'اعرف موعد الوصول لا موعد البدء — بينهما عادةً نصف ساعة عمل',
            ],
            en: [
              'Read the whole assignment message, not just its first line',
              'Make sure you know the location and how to get there — do not assume you will find it',
              'Ask about anything unclear before the night before, not on the morning',
              'Prepare what you need yourself: your ID, whatever your role requires, water',
              'Make sure your phone is charged and you have the lead’s number saved',
              'Know the arrival time, not the start time — there is usually half an hour of work between them',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: '💡 السؤال الذي يوفّر النشاط كله', en: '💡 The question that saves an activity' },
          content: {
            ar: 'قبل أي نشاط، اسأل نفسك: <b>«لو غبتُ فجأةً، هل يعرف أحد غيري ما كنت سأفعله؟»</b> إن كان الجواب لا، فأنت نقطة انهيار في الخطة، والحلّ أن تكتب دورك لشخص آخر قبل أن تحتاجوه.',
            en: 'Before any activity, ask yourself: <b>“if I disappeared, would anyone else know what I was going to do?”</b> If the answer is no, you are a single point of failure in the plan, and the fix is to write your part down for someone else before it is needed.',
          },
        },
        {
          type: 'quiz',
          id: 'c3q4',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'وصلتك رسالة التكليف قبل ثلاثة أيام. قرأت العنوان وأجّلت الباقي. الليلة قبل النشاط فتحتَها فوجدت أن دورك يحتاج مواد لا تملكها، والمحال مقفلة.',
            en: 'The assignment came three days ago. You read the subject line and left the rest. The night before, you open it and find your role needs materials you do not have, and the shops are shut.',
          },
          options: [
            {
              ar: 'تحضر في الصباح وتشرح للقائد هناك أن المواد ناقصة',
              en: 'Turn up in the morning and explain to the lead there that the materials are missing',
            },
            {
              ar: 'تتصل بالقائد الآن، تشرح الوضع، وتسأل إن كانت المواد متوفّرة عند الجمعية أو عند زميل',
              en: 'Call the lead now, explain, and ask whether the materials are with the association or a teammate',
            },
            {
              ar: 'تعتذر عن المشاركة لأنك غير جاهز',
              en: 'Withdraw from the activity because you are not ready',
            },
            {
              ar: 'تحضر وتدبّر أمرك بما تجده في المكان',
              en: 'Turn up and improvise with whatever is on site',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الخطأ وقع قبل ثلاثة أيام، لكن الليلة ما زالت وقتاً كافياً لإصلاحه: المواد قد تكون في مستودع الجمعية أو مع زميل يمرّ من هناك. الانتظار حتى الصباح يحوّل مشكلتك إلى مشكلة الفريق كله، والاعتذار في اللحظة الأخيرة يترك فجوة لا أحد جاهز لسدّها. أبلغ مبكراً بقدر ما تستطيع — لا بقدر ما يريحك.',
            en: 'The mistake happened three days ago, but tonight is still enough time to fix it: the materials may be in the association’s store or with a teammate passing that way. Waiting until morning turns your problem into the whole team’s. Withdrawing at the last minute leaves a gap nobody is ready to fill. Report as early as you can, not as late as you are comfortable with.',
          },
        },
      ],
    },

    {
      id: 'commitment',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'الوقت والالتزام', en: 'Time and commitment' },
      lede: {
        ar: 'التطوّع بلا أجر، وهذا لا يجعله بلا التزام. الفرق أن الالتزام هنا اختيارك أنت.',
        en: 'Volunteering is unpaid. That does not make it uncommitted — it makes the commitment yours by choice.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين يتأخّر موظّف، تتحمّل المؤسسة الكلفة. وحين يتأخّر متطوّع، يتحمّلها زملاؤه ومن ينتظرهم. لا يوجد بديل جاهز، ولا أحد يُدفع له ليغطّي مكانك. لهذا يُقاس الالتزام في التطوّع بمعيار أعلى لا أدنى.',
            en: 'When an employee is late, the organisation absorbs the cost. When a volunteer is late, their teammates and the people waiting absorb it. There is no cover, and nobody is being paid to fill your place. That is why commitment in volunteering is measured by a higher standard, not a lower one.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ غياب محترم', en: '✔ Absence handled well' },
          noTitle: { ar: '✘ غياب يكلّف', en: '✘ Absence that costs' },
          yes: {
            ar: [
              'تُبلغ فور معرفتك، لا قبل ساعة',
              'تقول السبب باختصار دون تفصيل غير لازم',
              'تقترح من يمكنه أن يحلّ محلّك إن كنت تعرف أحداً',
              'تسلّم ما بحوزتك من مفاتيح أو مواد قبل الموعد',
            ],
            en: [
              'Telling them the moment you know, not an hour before',
              'Giving the reason briefly, without unnecessary detail',
              'Suggesting who could cover, if you know someone',
              'Handing over any keys or materials you hold, ahead of time',
            ],
          },
          no: {
            ar: [
              'الصمت ثم عدم الحضور',
              'رسالة صباح النشاط: «ما رح إقدر»',
              'الوعد بالحضور وأنت غير متأكّد أصلاً',
              'الاعتذار المتكرّر دون تعديل ما تلتزم به',
            ],
            en: [
              'Silence, then simply not appearing',
              'A message on the morning: “I can’t make it”',
              'Promising to come when you were never sure',
              'Repeated apologies without adjusting what you commit to',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: '⚠️ الالتزام الزائد أسوأ من الاعتذار', en: '⚠️ Over-committing is worse than declining' },
          content: {
            ar: 'قول «نعم» لكل نشاط ثم الغياب عن نصفها يضرّ الفريق أكثر من قول «لا أستطيع هذا الأسبوع». المنظمة تخطّط على أساس من قال نعم. اعتذارك المبكر يُعاد التخطيط حوله؛ غيابك المفاجئ لا.',
            en: 'Saying yes to everything and then missing half of it harms the team more than saying “not this week”. The organisation plans around whoever said yes. An early no can be planned around; a sudden absence cannot.',
          },
        },
        {
          type: 'quiz',
          id: 'c3q5',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'التزمت بنشاط يوم السبت. يوم الأربعاء عرف أنك ستضطرّ للسفر. ما الأنسب؟',
            en: 'You committed to Saturday’s activity. On Wednesday you learn you will have to travel. What is most appropriate?',
          },
          options: [
            {
              ar: 'تنتظر حتى الجمعة مساءً لعلّ السفر يُلغى',
              en: 'Wait until Friday evening in case the trip is cancelled',
            },
            {
              ar: 'تُبلغ القائد يوم الأربعاء، وتوضّح أن السفر شبه مؤكّد',
              en: 'Tell the lead on Wednesday, explaining the trip is near-certain',
            },
            {
              ar: 'لا تُبلغ أحداً وتحاول أن تجد بديلاً بنفسك بصمت',
              en: 'Tell nobody and quietly try to find a replacement yourself',
            },
            {
              ar: 'تحضر رغم السفر لأنك وعدت',
              en: 'Go to the activity despite the trip, because you promised',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'ثلاثة أيام تكفي لإعادة توزيع دورك؛ ليلة واحدة لا تكفي. الانتظار «لعلّ الظرف يتغيّر» يحوّل احتمالاً إلى أزمة. وإيجاد بديل بنفسك بصمت يبدو تصرّفاً مسؤولاً لكنه يترك القائد يخطّط على أساس معلومات خاطئة — أبلغ، واقترح البديل، ودع القرار عنده.',
            en: 'Three days is enough to redistribute your part; one night is not. Waiting in case things change turns a possibility into a crisis. Quietly finding your own replacement looks responsible but leaves the lead planning on wrong information — tell them, suggest the replacement, and let the decision sit with them.',
          },
        },
      ],
    },

    {
      id: 'newcomers',
      tag: { ar: 'الوحدة السادسة', en: 'Module 6' },
      title: { ar: 'الجدد، والتسليم قبل المغادرة', en: 'Newcomers, and handing on before you go' },
      lede: {
        ar: 'كل ما تعرفه عن الميدان تعلّمته من شخص سبقك. أنت الآن ذلك الشخص لأحدهم.',
        en: 'Everything you know about the field you learned from someone who came before you. You are now that person for somebody.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'المتطوّع الجديد في يومه الأول لا ينقصه الحماس، بل السياق: أين يقف، بمن يتصل، ما الذي يُقال وما الذي لا يُقال. أغلب من يترك التطوّع مبكراً لا يتركه لأن العمل صعب، بل لأنه شعر أنه زائد عن الحاجة.',
            en: 'A new volunteer on their first day is not short of enthusiasm — they are short of context: where to stand, who to call, what is said and what is not. Most people who leave volunteering early do not leave because the work was hard, but because they felt surplus to requirements.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'عرّفه بالأسماء لا بالأدوار فقط — الناس يتذكّرون الأسماء',
              'أعطه مهمة حقيقية صغيرة من أول يوم، لا مشاهدة فقط',
              'قل له صراحةً ما الذي لا يفعله وحده بعد',
              'اسأله في نهاية اليوم عمّا لم يفهمه — لن يسأل هو أولاً',
              'صحّح خطأه على انفراد، واذكر ما أحسنه أمام الفريق',
            ],
            en: [
              'Introduce him by names, not only roles — people remember names',
              'Give him a small real task on day one, not just watching',
              'Tell him plainly what he should not yet do alone',
              'At the end of the day ask what he did not understand — he will not ask first',
              'Correct his mistake privately, and name what he did well in front of the team',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: '🛑 ما لا يُسلَّم يُفقد', en: '🛑 What is not handed on is lost' },
          content: {
            ar: 'حين يغادر متطوّع دون أن يسلّم ما يعرفه — رقم المخفر، اسم مسؤول القاعة، أي عائلة تحتاج انتباهاً خاصاً — تعود الجمعية إلى نقطة الصفر في ذلك الملف. اكتب ما تعرفه وسلّمه قبل آخر يوم لك، لا فيه.',
            en: 'When a volunteer leaves without handing on what they know — the police station number, the name of the hall keeper, which family needs particular care — the association returns to zero on that file. Write down what you know and hand it over before your last day, not on it.',
          },
        },
        {
          type: 'consequence',
          title: {
            ar: 'أسبوع عاديّ تماماً',
            en: 'An entirely ordinary week',
          },
          situation: {
            ar: 'أنت على ملفّ الحيّ منذ سنة، وتغادر الفريق بعد ثلاثة أسابيع. ثلاثة قرارات صغيرة تنتظرك هذا الأسبوع، ولا واحد منها يبدو قراراً وأنت تتّخذه.',
            en: 'You have carried the neighbourhood file for a year, and you leave the team in three weeks. Three small decisions are waiting for you this week, and not one of them looks like a decision while you are making it.',
          },
          decisions: [
            {
              moment: { ar: 'الاثنين — وصلك تكليف نشاط السبت', en: 'Monday — the brief for Saturday’s activity arrives' },
              question: {
                ar: 'وصلتك رسالة فيها دورك في نشاط السبت وما يلزمه. متى تفتحها؟',
                en: 'A message has arrived with your role in Saturday’s activity and what it needs. When do you open it?',
              },
              choices: [
                {
                  text: {
                    ar: 'تفتحها الآن، وتسأل في مجموعة الفريق عمّا ليس واضحاً فيها',
                    en: 'Open it now, and ask in the team group about anything in it that is not clear',
                  },
                  later: {
                    ar: 'كان الدور يحتاج صندوق أدوات ليس في المستودع. سؤالك يوم الاثنين أعطى المنسّقة أربعة أيّام لتدبيره، فوصل الصندوق صباح السبت ولم يعرف أحد أنّ شيئاً كاد ينقص.',
                    en: 'The role needed a toolbox that was not in the store. Your Monday question gave the coordinator four days to find one, so it arrived on Saturday morning and nobody knew anything had nearly been missing.',
                  },
                },
                {
                  text: {
                    ar: 'تفتحها ليلة الجمعة، حيث يكون الوقت أهدأ وأنت أكثر تركيزاً',
                    en: 'Open it on Friday night, when things are quieter and you can concentrate',
                  },
                  later: {
                    ar: 'ليلة الجمعة اكتشفت أنّ دورك يحتاج موادّ ليست عندك والمحلّات مغلقة. حضرت السبت بنصف ما يلزم وأكملت بما وجدته، وكان الفرق ظاهراً للأطفال قبل أن يكون ظاهراً لأحد من الفريق.',
                    en: 'On Friday night you found that your role needed materials you did not have and the shops were shut. You turned up on Saturday with half of what was needed and improvised the rest, and the difference was visible to the children before it was visible to anyone on the team.',
                  },
                },
                {
                  text: {
                    ar: 'تقرأ سطر العنوان وتكتفي به — الدور سيُشرح في الموقع كالعادة',
                    en: 'Read the subject line and leave it there — the role gets explained on site as it always does',
                  },
                  later: {
                    ar: 'شُرح في الموقع فعلاً، في عشر دقائق والأطفال يدخلون. ما التقطته في تلك الدقائق كان أقلّ بكثير ممّا كنت ستعرفه لو قرأت الرسالة يوم وصولها، والمنسّقة شرحت لك بدل أن تستقبل.',
                    en: 'It was explained on site, in ten minutes with the children already coming in. What you caught in those minutes was far less than you would have known had you read the message the day it arrived, and the coordinator spent them briefing you instead of receiving people.',
                  },
                },
              ],
            },
            {
              moment: { ar: 'الأربعاء — علمت أنّك مسافر السبت', en: 'Wednesday — you learn you have to travel on Saturday' },
              question: {
                ar: 'دورك في السبت محجوز باسمك، وقد صار سفرك مؤكّداً. متى تقول؟',
                en: 'Saturday’s role is booked in your name, and your travel has just become certain. When do you say so?',
              },
              choices: [
                {
                  text: {
                    ar: 'اليوم، وتقول ما هو دورك بالضبط وما الذي يحتاجه من يحلّ محلّك',
                    en: 'Today, saying exactly what your role is and what whoever replaces you will need',
                  },
                  later: {
                    ar: 'ثلاثة أيّام كانت تكفي: أُعيد توزيع الدور في مكالمتين، وحضر السبت متطوّع يعرف ماذا يفعل ولديه ما يلزمه. لم يلاحظ أحد من الأهالي أنّ أحداً تغيّر.',
                    en: 'Three days were enough: the role was redistributed in two phone calls, and on Saturday a volunteer turned up who knew what to do and had what he needed. None of the families noticed that anybody had changed.',
                  },
                },
                {
                  text: {
                    ar: 'تنتظر إلى الجمعة، فقد يتأجّل السفر ولا داعي لإقلاق أحد بلا سبب',
                    en: 'Wait until Friday — the trip may yet be postponed, and there is no sense worrying anybody for nothing',
                  },
                  later: {
                    ar: 'لم يتأجّل. ليلة الجمعة كان أمام المنسّقة اسم واحد متاح لا يعرف دورك، فتولّاه وهو يسأل. المجموعة الأولى انتظرت خمساً وعشرين دقيقة في الشمس، وهو وقت لم يكن ليُدفع لو قلت يوم الأربعاء.',
                    en: 'It was not postponed. On Friday night the coordinator had exactly one name available and he did not know your role, so he took it on while asking his way through it. The first group waited twenty-five minutes in the sun, which is time nobody would have paid had you said so on Wednesday.',
                  },
                },
                {
                  text: {
                    ar: 'تعتذر صباح السبت برسالة تشرح فيها الظرف بوضوح',
                    en: 'Apologise on Saturday morning with a message explaining the situation clearly',
                  },
                  later: {
                    ar: 'وصلت الرسالة والأهالي واقفون عند الباب. الغياب المُعلَن قبل ثلاثة أيّام يُخطَّط حوله، والمُعلَن في صباحه لا يُخطَّط حوله إطلاقاً — والفرق بين الحالتين ليس في مقدار ما أعطيته بل في وقت قولك.',
                    en: 'The message arrived with families already at the door. An absence announced three days ahead gets planned around; one announced on the morning cannot be planned around at all — and the difference between the two is not how much you gave but when you said it.',
                  },
                },
              ],
            },
            {
              moment: { ar: 'الخميس — ريما ستأخذ ملفّ الحيّ بعدك', en: 'Thursday — Rima is taking over the neighbourhood file' },
              question: {
                ar: 'ما تعرفه عن الحيّ ليس مكتوباً في أيّ مكان. متى تسلّمه؟',
                en: 'What you know about the neighbourhood is written down nowhere. When do you hand it on?',
              },
              choices: [
                {
                  text: {
                    ar: 'تجلسان اليوم وتكتبان ورقة واحدة: الأرقام، ومن يُرجَع إليه، والعائلات التي تحتاج انتباهاً خاصاً',
                    en: 'Sit down today and write one page together: the numbers, who to go to, and the families that need particular care',
                  },
                  later: {
                    ar: 'بعد ثلاثة أسابيع احتاجت ريما مسؤول القاعة ليلة الجمعة، فوجدت الاسم والرقم على الورقة واتّصلت. النشاط لم يتأخّر، ولم يعرف أحد في الجمعية أنّ شيئاً كاد يتعطّل.',
                    en: 'Three weeks later Rima needed the hall keeper on a Friday night, found the name and the number on the page, and rang him. The activity was not delayed, and nobody in the association knew that anything had nearly gone wrong.',
                  },
                },
                {
                  text: {
                    ar: 'تخبرها أنّك متاح على الهاتف لأيّ سؤال بعد مغادرتك',
                    en: 'Tell her you are on the end of a phone for any question after you have gone',
                  },
                  later: {
                    ar: 'اتّصلت بك ثلاث مرّات في الأسبوع الأوّل ثمّ توقّفت، لأنّ من يتّصل بشخص غادر يشعر أنّه يُثقل عليه. الأسئلة لم تنتهِ، بل توقّف طرحها — وصارت تُجاب بالتخمين.',
                    en: 'She rang you three times in the first week and then stopped, because ringing somebody who has left feels like an imposition. The questions did not run out; they stopped being asked, and started being answered by guesswork.',
                  },
                },
                {
                  text: {
                    ar: 'تسلّمها كلّ شيء في آخر يوم لك، حين تكون قد أنهيت ما عداه',
                    en: 'Hand everything over on your last day, once you have finished everything else',
                  },
                  later: {
                    ar: 'آخر يوم كان وداعاً وصوراً وثلاث مكالمات، وما سُلّم فيه كان عشرين دقيقة من أسماء لم تُكتب. بعد شهرين لم يبقَ منها في ذاكرة ريما إلّا اسمان، وأحدهما بغير رقم.',
                    en: 'The last day was goodbyes, photographs and three phone calls, and what got handed over was twenty minutes of names that nobody wrote down. Two months on, two of them were left in Rima’s memory, and one of those without a number.',
                  },
                },
              ],
            },
          ],
          when: {
            ar: 'ما عاد إليك من ذلك، في الأسابيع التي تلت',
            en: 'What came back to you, in the weeks that followed',
          },
          afterword: {
            ar: 'القرارات الثلاثة تشترك في شيء واحد: لا واحد منها كان بين صواب وخطأ، بل بين الآن وبعد قليل. وكلّ خيار مؤجَّل هنا كان له سبب وجيه في لحظته — الوقت أهدأ ليلة الجمعة، وقد يتأجّل السفر، وآخر يوم أنسب للتسليم. الثمن لم يظهر في اللحظة التي دُفع فيها، بل بعد أيّام أو أسابيع، وعلى شخص آخر غالباً: المنسّقة التي شرحت بدل أن تستقبل، والمتطوّع الذي تولّى دوراً لا يعرفه، وريما التي تُجيب بالتخمين. وهذا بالذات ما يجعل هذه القرارات تتكرّر: من يدفع ليس من قرّر.',
            en: 'The three decisions share one thing: not one of them was between right and wrong — each was between now and shortly. And every deferral here had a good reason at the time: it is quieter on Friday night, the trip might still be called off, the last day is the natural moment to hand over. The price did not appear when it was incurred but days or weeks later, and usually to somebody else: the coordinator who spent the opening briefing you, the volunteer who took on a role he did not know, Rima answering by guesswork. That is exactly why these decisions keep being made — the person who pays is not the person who chose.',
          },
        },
        {
          type: 'quiz',
          id: 'c3q6',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'متطوّعة جديدة في يومها الأول ارتكبت خطأً أمام الأهالي: أعطت وعداً بخدمة لا تقدّمها الجمعية. الأهالي سمعوا.',
            en: 'A new volunteer on her first day makes a mistake in front of families: she promises a service the association does not provide. The families heard it.',
          },
          options: [
            {
              ar: 'تصحّح أمام الأهالي فوراً وتوضّح للجميع أنها جديدة وأخطأت',
              en: 'Correct it in front of the families at once, explaining she is new and got it wrong',
            },
            {
              ar: 'تصحّح المعلومة للأهالي بهدوء دون لومها، ثم تشرح لها على انفراد بعد ذلك',
              en: 'Calmly correct the information for the families without blaming her, then explain to her privately afterwards',
            },
            {
              ar: 'تصمت الآن وتترك القائد يتصرّف لاحقاً',
              en: 'Stay quiet now and let the lead deal with it later',
            },
            {
              ar: 'تشرح لها على انفراد وتترك الوعد قائماً تجنّباً للإحراج',
              en: 'Explain to her privately and let the promise stand, to avoid embarrassment',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'أمران يجب أن يحدثا، وترتيبهما مهم. المعلومة الخاطئة تُصحَّح فوراً لأن أسرة قد تبني عليها قراراً؛ لكن التصحيح يكون للمعلومة لا للشخص. أما تعليمها فمكانه على انفراد بعد انصراف الأهالي. التصحيح العلني للشخص يكسر ثقتها بنفسها في يومها الأول، وترك الوعد قائماً يجعل الجمعية هي من أخلف.',
            en: 'Two things must happen, and their order matters. The wrong information is corrected at once, because a family may act on it — but what is corrected is the information, not the person. Teaching her belongs privately, after the families have gone. Correcting her publicly breaks her confidence on day one, and letting the promise stand makes the association the one that broke its word.',
          },
        },
      ],
    },
  ],
};
