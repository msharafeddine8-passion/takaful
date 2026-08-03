import type { CourseContent } from './types';

/**
 * Level 1 · Course 3 — Teamwork.
 * Universal content for any volunteer in any organisation.
 * Status: DRAFT — requires review and approval before publication.
 */
export const teamwork: CourseContent = {
  slug: 'teamwork',
  level: 1,
  minutes: 70,
  passMark: 70,
  title: { ar: 'العمل ضمن فريق', en: 'Teamwork' },
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
    ],
    en: [
      'Understand roles in a volunteer team and why every activity needs a lead',
      'Hand over and take on tasks clearly, without ambiguity',
      'Communicate within the team so that nothing is duplicated or dropped',
      'Address disagreement early and without escalation',
      'Own your mistake and correct it without excuses',
      'Support a struggling teammate instead of working around them',
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
  ],
};
