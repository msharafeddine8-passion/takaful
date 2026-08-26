import type { CourseContent } from './types';

/**
 * Level 3 — Designing Initiatives and Writing Proposals. Pass mark 70.
 *
 * The thread through all six modules is the same question a good proposal
 * answers before a funder ever asks it: not "what will you do?" but "how do
 * you know that doing this will change anything?" Problem statement, logframe
 * logic, needs analysis, a timeline that reveals contradictions, a concept
 * note before the full proposal, and a risk register that turns silent
 * assumptions into things you can actually monitor.
 *
 * Written for volunteers who have an idea and want to turn it into something
 * a community organisation or international funder would take seriously.
 */

export const projectManagement: CourseContent = {
  slug: 'project-management',
  level: 3,
  minutes: 45,
  passMark: 70,
  title: {
    ar: 'تصميم المبادرات وكتابة مقترحات المشاريع',
    en: 'Designing Initiatives and Writing Proposals',
  },
  lede: {
    ar: 'من فكرة مبهمة إلى مقترح مكتوب يمكن تقييمه وتمويله: تحديد المشكلة، تحليل الاحتياج، هدف قابل للقياس، خطّة تنفيذ واضحة، مخاطر موثّقة، وبيانات قبل البدء لا بعد الانتهاء.',
    en: 'From a vague idea to a written proposal that can be assessed and funded: defining the problem, analysing need, a measurable objective, a clear implementation plan, documented risks, and data before the start rather than after the end.',
  },
  outcomes: {
    ar: [
      'تحوّل مشكلة ملاحظة إلى بيان مشكلة قابل للعمل عليه',
      'تصوغ هدفاً ونتائج ومخرجات يمكن قياسها',
      'تكتب Concept Note ثم مقترح مشروع مبسّط',
      'تسجّل المخاطر والافتراضات ومؤشرات النجاح قبل البدء',
    ],
    en: [
      'Turn an observed problem into a problem statement you can work from',
      'Write an objective, outcomes and outputs that can actually be measured',
      'Write a concept note and then a simple project proposal',
      'Record risks, assumptions and success indicators before starting',
    ],
  },
  sources: [
    'UNDP — Project Management Guidelines and Handbook for Civil Society Organizations (2024)',
    'IFRC — Project / Programme Monitoring and Evaluation (M&E) Guide',
    'UN Volunteers — Volunteer Coordination and Project Design Toolkit',
  ],
  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'pm-problem',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'من الفكرة إلى بيان المشكلة', en: 'From idea to problem statement' },
      lede: {
        ar: 'مشروع يبدأ بجملة «نريد نساعد الشباب» لا يعرف متى ينجح ولا متى يفشل، ولا ما الذي يقيس.',
        en: 'A project that starts with "we want to help young people" does not know what success looks like.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'كثير من المبادرات تبدأ بنيّة طيّبة وفكرة عامة: «نريد دعم الشباب في حيّنا»، أو «هناك مشكلة في التوظيف ويجب أن نفعل شيئاً». النيّة ممتازة، لكن الفكرة العامة لا تُبنى عليها خطة، ولا تُقيَّم بعد انتهائها، ولا يمكن معرفة نتائجها. المشكلة ليست أن النيّة سيئة؛ المشكلة أن «مشكلة التوظيف» وصف للعرَض وليس للمشكلة الحقيقية. شباب لا يعرفون كيف يكتبون سيرة ذاتية؟ أصحاب عمل لا يثقون بخرّيجي برامج معيّنة؟ فرص عمل موجودة لكنها في قطاعات الشباب لا يعرفون عنها؟ ثلاث مشكلات مختلفة تماماً، وكل منها تحتاج تدخّلاً مختلفاً ومصادر مختلفة وشركاء مختلفين. بيان المشكلة الجيّد يجيب على خمسة أسئلة: ما الذي يحدث بالضبط؟ لمن يحدث؟ أين بالضبط؟ منذ متى؟ وما حجمه المعروف حتى الآن؟ حين تستطيع الإجابة على هذه الأسئلة بأرقام وأسماء ومواقع ومصادر، أصبحت تملك مشكلة يمكن العمل عليها والدفاع عنها أمام ممول أو شريك.',
            en: 'Many initiatives start with good intent and a general idea: "we want to support youth in our neighbourhood," or "there is an employment problem and we must do something." The intent is excellent, but a general idea cannot be planned, assessed after it finishes, or evaluated for its results. The problem is not that the intent is poor; the problem is that "the employment problem" describes a symptom, not the real issue. Young people who do not know how to write a CV? Employers who do not trust graduates of certain programmes? Jobs that exist but in sectors young people do not know about? Three entirely different problems, each needing a different intervention, different resources, and different partners. A good problem statement answers five questions: what exactly is happening? To whom? Exactly where? Since when? And at what known scale so far? When you can answer those questions with numbers, names, places and sources, you have a problem you can work from and defend to a funder or partner.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'ابدأ بما لاحظتَه: اكتب جملة واحدة تصف ما رأيته بعينيك أو سمعته ممن يعيشون الوضع — هذه مادتك الخام',
              'اسأل «لماذا يحدث هذا؟» ثلاث مرات على الأقل، وسجّل إجابة مختلفة في كل مرة — كل إجابة تقودك طبقة أعمق نحو السبب الجذري',
              'حدّد من يتأثّر بالمشكلة بدقة: ليس «الشباب» بل «شباب بين ١٨ و٢٥ سنة في منطقة بعلبك، خرجوا من الجامعة منذ سنة دون توظيف»',
              'ابحث عن أرقام أو شواهد تدعم ملاحظتك ولو غير رسمية — مسح صغير، إحصاء بلدي، أو ١٠ مقابلات قصيرة تعطيك أرقاماً أفضل من لا شيء',
              'اكتشف ما الذي جرّب حلّه من قبل في هذا السياق وما النتائج — لا تبدأ من الصفر إن سبق أن عمل أحد على هذه المشكلة وفشل أو نجح',
              'اكتب بيان المشكلة في أربع جمل: ما يحدث، من يتأثّر، ما حجمه، وما السبب الجذري الذي تحدّدته',
            ],
            en: [
              'Start with what you observed: write one sentence describing what you saw with your own eyes or heard from people living the situation — this is your raw material',
              'Ask "why does this happen?" at least three times, writing a different answer each time — each answer takes you a layer deeper toward the root cause',
              'Define who is affected precisely: not "youth" but "18–25 year olds in the Baalbek area who graduated a year ago without finding work"',
              'Look for numbers or evidence to support your observation, even informal — a small survey, a municipal statistic, or ten short interviews give you numbers better than nothing',
              'Find out what has been tried before in this context and what happened — do not start from zero if someone has already worked on this problem and succeeded or failed',
              'Write the problem statement in four sentences: what is happening, who is affected, how large it is, and the root cause you identified',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'العَرَض ليس المشكلة — ولا الحلّ المبكّر', en: 'A symptom is not the problem — and neither is an early solution' },
          content: {
            ar: 'حين يقول أحدهم «مشكلتنا أن الشباب لا يحضرون فعالياتنا»، هذا عَرَض. والأخطر من ذلك أن يقفز الفريق مباشرةً إلى الحل: «سنعمل نادياً للشباب» — قبل أن يفهم لماذا لا يأتي الشباب أصلاً. المشكلة قد تكون في توقيت الفعاليات، أو غياب وسائل النقل، أو أن المحتوى لا يلامس اهتماماتهم. مشروع يعالج العَرَض يضع ميزانيته على إعلانات أوفر، ثم يتفاجأ أن الحضور ما زال خفيفاً. مشروع يفهم المشكلة يسأل الشباب أولاً ويبني على ما يسمع.',
            en: 'When someone says "our problem is that young people do not attend our events," that is a symptom. More dangerous still is a team that jumps straight to a solution — "we will build a youth club" — before understanding why young people are not coming in the first place. The problem might be the timing, lack of transport, or content that does not touch their interests. A project that treats the symptom puts the budget into more advertising and is then surprised that attendance is still low. A project that understands the problem asks young people first and builds on what it hears.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'بيان مشكلة ضعيف', en: 'Weak problem statement' },
              text: {
                ar: '«كثير من الشباب في منطقتنا لا يجدون فرص عمل وهذا يؤثّر على مستقبلهم.» — لا أرقام، لا تحديد للمنطقة، لا سبب، لا وصف لحجم الأثر ولا لمن تأثّر بالضبط.',
                en: '"Many young people in our area cannot find jobs and this affects their future." — No numbers, no defined area, no cause, no description of impact scale, and no clarity on who is affected.',
              },
            },
            {
              title: { ar: 'بيان مشكلة أقوى', en: 'Stronger problem statement' },
              text: {
                ar: '«٦٠٪ من خرّيجي الثانوية العامة في قضاء عكّار (٢٠٢٤) يعيشون بطالةً بعد سنة من التخرّج. مقابلات مع ٣٠ منهم كشفت أن ٧٠٪ لم يتقدّموا لأيّ وظيفة لجهلهم بمتطلّبات التقديم وضعف مهارة كتابة السيرة الذاتية.» — محدّد، مؤرَّخ، مدعوم ببيانات، ويشير إلى سبب.',
                en: '"60% of secondary school graduates in the Akkar district (2024) are unemployed a year after graduation. Interviews with 30 of them found that 70% had never applied for any position due to not knowing application requirements and weak CV-writing skills." — specific, dated, data-supported, and points to a cause.',
              },
            },
            {
              title: { ar: 'الفرق عملياً', en: 'The difference in practice' },
              text: {
                ar: 'البيان الأول يجيز أي تدخّل لأنه لا يحدّد السبب — يمكنك تبرير دورة تقنية أو منصة توظيف أو ورشة مهارات أو أيّ شيء آخر. البيان الثاني يحصر التدخّل في مهارات التقديم الوظيفي، ويجعل قياس النجاح ممكناً وواضحاً: هل تقدّم الخرّيجون لوظائف؟ هل حصلوا على مقابلات؟ هل وُظّف منهم عدد محدّد خلال ستة أشهر؟ هذا الوضوح يوفّر على المبادرة موارد كثيرة لأنه يمنع الانتشار في كل الاتجاهات.',
                en: 'The first statement permits any intervention because it does not identify a cause — you could justify a technical course, a jobs platform, a skills workshop, or anything else. The second confines the intervention to job-application skills and makes measuring success both possible and clear: did the graduates apply for jobs? Did they get interviews? Did a set number of them find work within six months? That clarity saves the initiative a great deal of resource, because it stops the work spreading in every direction.',
              },
            },
          ],
        },
        {
          type: 'list',
          items: {
            ar: [
              'هل يمكن قراءة بيان المشكلة لشخص لا يعرف الموضوع ويفهم المقصود بجملة واحدة؟ — إن احتاج شرحاً، فهو ليس جاهزاً',
              'هل تشير الجملة إلى سبب أو عامل محدّد؟ — لا يكفي وصف الوضع، بل يجب الإشارة إلى ما يُبقيه على حاله',
              'هل يمكن معرفة من يتأثّر بدقة؟ — «الناس» أو «المجتمع» تعبيرات فضفاضة لا تبني عليها تدخّلاً',
              'هل هناك أرقام أو بيانات تدعمه؟ — حتى بيانات غير رسمية أفضل من لا شيء لأنها تُحوّل الملاحظة إلى ادّعاء يمكن التحقّق منه',
              'هل يُميّز البيان بين المشكلة والحلّ؟ — «نقص المكتبات» ادّعاء عن سبب، «سنبني مكتبة» حلٌّ — لا تخلط بينهما',
            ],
            en: [
              'Can you read the problem statement to someone unfamiliar with the subject and they understand the point in one sentence? — if it needs explanation, it is not ready',
              'Does the sentence point to a specific cause or factor? — describing the situation is not enough; you must point to what keeps it in place',
              'Can you tell precisely who is affected? — "people" or "the community" are expressions too broad to build an intervention on',
              'Are there numbers or data to support it? — even informal data is better than nothing because it turns an observation into a verifiable claim',
              'Does the statement distinguish between the problem and the solution? — "lack of libraries" is a cause claim; "we will build a library" is a solution — do not mix them',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'pm-q1',
          label: { ar: 'اختبر فهمك', en: 'Check your understanding' },
          question: {
            ar: 'مجموعة متطوّعين لاحظت أن أطفال الحيّ يقضون ساعات طويلة على الهواتف ويعانون من صعوبات في القراءة. أيّ الجمل الثلاث التالية يصلح بياناً للمشكلة؟',
            en: 'A volunteer group noticed that neighbourhood children spend many hours on phones and struggle with reading. Which of the following three phrases works as a problem statement?',
          },
          options: [
            {
              ar: 'الأطفال في حيّنا لا يقرؤون كفاية وهذا سيضرّ بمستقبلهم الدراسي ويجعلهم أقلّ قدرة على المنافسة لاحقاً.',
              en: 'Children in our neighbourhood do not read enough, and this will harm their academic future and leave them less able to compete later.',
            },
            {
              ar: 'نريد إنشاء نادي قراءة أسبوعي في مركز الحيّ بإشراف متطوّعين من الحيّ، يوفّر كتباً مناسبة لأعمار الأطفال ويشجّعهم على القراءة بدل قضاء الوقت على الهواتف.',
              en: 'We want to create a weekly reading club at the neighbourhood centre, run by volunteers, that provides books suited to the ages of the children and encourages them to read instead of spending time on phones.',
            },
            {
              ar: 'استبيان على ٤٥ طفلاً بين ٧ و١٢ سنة في حيّ المزرعة أظهر أن ٦٥٪ منهم يقرؤون بمستوى أدنى من صفّهم الدراسي، وأن ٧٨٪ من أسرهم لا تملك كتباً في المنزل.',
              en: 'A survey of 45 children aged 7–12 in the Mazraa neighbourhood showed that 65% read below their grade level, and that 78% of their families own no books at home.',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الخيار الأول وصف عام بلا أرقام أو سياق. الخيار الثاني حلٌّ مقترح لا بيان مشكلة — تبدأ بالحل قبل أن تفهم المشكلة. الخيار الثالث هو بيان المشكلة الصحيح لأنه يحدّد الفئة العمرية والمنطقة وحجم المشكلة بأرقام، ويشير إلى عامل محتمل — غياب الكتب في المنزل — يمكن أن يوجّه التدخّل.',
            en: 'The first option is a general description without numbers or context. The second is a proposed solution, not a problem statement — you start with the solution before understanding the problem. The third is the correct problem statement because it specifies the age group, the area, the scale in numbers, and points to a contributing factor — no books at home — that can guide the intervention.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'pm-logframe',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'الهدف والنتائج والمخرجات', en: 'Objective, outcomes and outputs' },
      lede: {
        ar: 'الخلط بين هذه المفاهيم الثلاثة أكثر أسباب رفض المقترحات شيوعاً لدى الممولين المحترفين.',
        en: 'Confusing these three concepts is the most common reason proposals are rejected by funders.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'تخيّل مشروعاً يدرّب مئة شابّ على كتابة السيرة الذاتية ومهارات المقابلة الوظيفية. في نهاية الدورة، يكتب تقرير المشروع: «نجحنا في تدريب مئة شابّ». السؤال: هل نجح المشروع؟ لا تعرف. تدريب مئة شابّ هو مخرَج — شيء أنتجه المشروع مباشرةً. النتيجة هي ما الذي تغيّر في حياة هؤلاء الشباب بسبب التدريب: هل تقدّموا فعلاً لوظائف؟ هل قُبل منهم عشرون في مقابلة خلال ستة أشهر؟ هل ارتفع دخلهم؟ والهدف أشمل من ذلك: ما الذي يعنيه هذا التوظيف على مستوى الحيّ أو المنطقة على المدى البعيد — انخفاض معدل بطالة الشباب، مجتمع أكثر استقراراً اقتصادياً؟ المشروع الجيّد يضع خطّاً واضحاً بين ما سيُنتَج (مخرجات)، وما سيتغيّر (نتائج)، وما يريد الإسهام في تحقيقه على المدى البعيد (هدف). وكل مستوى منها يحتاج مؤشراً يقول لك بالأرقام هل وصلت أم لا.',
            en: 'Imagine a project that trains a hundred young people in CV writing and interview skills. At the end, the project report writes: "we successfully trained a hundred young people." The question: did the project succeed? You do not know. Training a hundred young people is an output — something the project directly produced. The outcome is what changed in those young people\'s lives because of the training: did they actually apply for jobs? Were twenty of them accepted for interviews within six months? Did their income rise? And the objective is broader: what does this employment mean for the neighbourhood or area in the long run — a lower youth unemployment rate, a more economically stable community? A good project draws a clear line between what it will produce (outputs), what will change (outcomes), and what it wants to help achieve in the long run (objective). Each level needs an indicator that tells you in numbers whether you have arrived.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'المخرَج — Output', en: 'Output' },
              text: {
                ar: 'ما أنتجه المشروع مباشرةً: عدد الجلسات المنعقدة، عدد المشاركين، الكتيّبات الموزَّعة، الخدمات المقدَّمة. يُعدّ في نهاية كل نشاط. يخبرك أنك فعلت ما وعدت، لكنه لا يخبرك هل غيّرت شيئاً.',
                en: 'What the project directly produced: number of sessions held, participants, booklets distributed, services delivered. Counted at the end of each activity. It tells you that you did what you promised, but not whether you changed anything.',
              },
            },
            {
              title: { ar: 'النتيجة — Outcome', en: 'Outcome' },
              text: {
                ar: 'ما الذي تغيّر لدى المستفيدين بسبب المشروع: مهارة اكتسبوها، سلوك غيّروه، وصول أصبح متاحاً لم يكن كذلك. يُقاس بعد أسابيع أو أشهر من التدخّل. هذا ما تكون المبادرة مسؤولة عنه أمام الممول والمجتمع.',
                en: 'What changed for beneficiaries because of the project: a skill they gained, a behaviour they changed, access that became available. Measured weeks or months after the intervention. This is what the initiative is accountable for in front of the funder and the community.',
              },
            },
            {
              title: { ar: 'الهدف — Objective', en: 'Objective' },
              text: {
                ar: 'التحوّل الكبير الذي تُسهم فيه النتائج مجتمعةً: مجتمع أكثر تماسكاً، معدّل توظيف أعلى، فجوة تعليمية تضيق، منظومة صحّية محلّية تعمل. يتحقّق على المدى البعيد وبمشاركة عوامل أخرى خارج المشروع — المشروع لا يدّعي تحقيقه وحده، بل يدّعي الإسهام فيه.',
                en: 'The large change to which the results together contribute: a more cohesive community, a higher employment rate, a narrowing educational gap, a functioning local health system. Achieved in the long run through other factors beyond the project — the project does not claim to achieve it alone, but to contribute to it.',
              },
            },
          ],
        },
        {
          type: 'compare',
          yesTitle: { ar: 'نتيجة قابلة للقياس ✔', en: 'Measurable outcome ✔' },
          noTitle: { ar: 'نتيجة غير قابلة للقياس ✘', en: 'Not measurable ✘' },
          yes: {
            ar: [
              '٤٠٪ من المتدرّبين يحصلون على مقابلة عمل واحدة على الأقل خلال ثلاثة أشهر من انتهاء الدورة',
              '٢٥ مدرسةً في المنطقة تتبنّى بروتوكول الإسعافات الأولية بحلول نهاية العام الدراسي',
              'يرتفع متوسط درجة اختبار القراءة للمجموعة من ٥٢ إلى ٦٥ بحلول نهاية الفصل الثاني',
              '٣٠ عائلة مسجَّلة في نظام الدعم التغذوي خلال أول ستة أسابيع من المشروع',
            ],
            en: [
              '40% of trainees get at least one job interview within three months of completing the course',
              '25 schools in the area adopt the first-aid protocol by the end of the academic year',
              'The average reading test score for the group rises from 52 to 65 by the end of the second term',
              '30 families registered in the nutritional support system within the first six weeks of the project',
            ],
          },
          no: {
            ar: [
              'تحسين وعي الشباب بفرص التوظيف المتاحة',
              'المساهمة في ترسيخ ثقافة القراءة في المجتمع',
              'دعم المجتمعات الهشّة وتمكين أفرادها',
              'نشر الوعي الصحّي في المدارس والأحياء',
            ],
            en: [
              'Improve youth awareness of available employment opportunities',
              'Contribute to embedding a reading culture in the community',
              'Support and empower vulnerable communities and their members',
              'Spread health awareness in schools and neighbourhoods',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'الخطأ الأكثر شيوعاً: الأنشطة في خانة النتائج', en: 'The most common mistake: activities in the results column' },
          content: {
            ar: 'كثير من المقترحات تكتب في خانة «النتائج»: «سنعقد خمس ورش عمل» أو «سنوزّع ثلاثة آلاف كتيّب». هذه أنشطة ومخرجات — تقول ماذا ستفعل المبادرة، لا ماذا سيتغيّر. الممول يريد أن يعرف لماذا تفعل هذا — ما الذي ستحدثه هذه الأنشطة في حياة الناس. حين تكتب «خمس ورش عمل»، اسأل نفسك: ثم ماذا؟ الإجابة على «ثم ماذا» هي النتيجة. لا تتوقّف عند الفعل، تابع حتى الأثر. هذا الخطأ بالذات هو ما يجعل كثيراً من المشاريع تبدو ناجحة بالأرقام — «نفّذنا مئة نشاط» — بينما لم يتغيّر شيء فعلي في حياة أحد. والممول الجيّد لا ينخدع بعدد الأنشطة، بل يسأل عن الأثر الذي أحدثته على أرض الواقع.',
            en: 'Many proposals write under "results": "we will hold five workshops" or "we will distribute three thousand booklets." These are activities and outputs — they say what the initiative will do, not what will change. A funder wants to know why you are doing this — what these activities will bring about in people\'s lives. When you write "five workshops," ask yourself: then what? The answer to "then what" is the outcome. Do not stop at the action — follow through to the effect. This particular mistake is what makes so many projects look successful on the numbers — "we delivered a hundred activities" — while nothing actually changed in anybody\'s life. A good funder is not taken in by a count of activities; they ask what difference it made on the ground.',
          },
        },
        {
          type: 'quiz',
          id: 'pm-q2',
          label: { ar: 'اختبر فهمك', en: 'Check your understanding' },
          question: {
            ar: 'مشروع يهدف إلى مساعدة أمّهات في تحسين تغذية أطفالهن. من بين العبارات الأربع التالية، أيّها نتيجة (Outcome) لا مخرجاً (Output) ولا نشاطاً؟',
            en: 'A project aims to help mothers improve their children\'s nutrition. Which of the following four phrases is an outcome rather than an output or an activity?',
          },
          options: [
            {
              ar: 'تدريب ٨٠ أمّاً على مبادئ التغذية السليمة خلال ثلاثة أشهر في ست جلسات عملية داخل مركز الحيّ',
              en: 'Training 80 mothers in basic nutrition principles over three months across six practical sessions at the neighbourhood centre',
            },
            {
              ar: '٦٠٪ من الأمّهات المشاركات يوفّرن وجبة كاملة العناصر الغذائية لأطفالهن يومياً بعد ثلاثة أشهر من نهاية البرنامج',
              en: '60% of participating mothers provide a nutritionally complete meal to their children every day three months after the programme ends',
            },
            {
              ar: 'توزيع دليل تغذوي مصوَّر يتضمّن وصفات محلّية منخفضة التكلفة على جميع المشاركات في البرنامج',
              en: 'Distributing an illustrated nutrition guide containing low-cost local recipes to all programme participants',
            },
            {
              ar: 'عقد عشر جلسات توعية شهرية في مراكز الرعاية الصحّية الأولية بحضور أخصّائية تغذية وتوزيع مواد تثقيفية مطبوعة على الحاضرات',
              en: 'Holding ten monthly awareness sessions at primary healthcare centres with a nutritionist present and educational materials handed to attendees',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الخيارات الأول والثالث والرابع مخرجات أو أنشطة: أشياء تنتجها المبادرة أو تنفّذها. الخيار الثاني هو النتيجة لأنه يصف تغيّراً قابلاً للقياس في سلوك الأمّهات بعد انتهاء البرنامج — وهو بالضبط ما يهمّ الممول والمجتمع، لأنه يقول هل أثّر البرنامج فعلاً في حياة المستفيدين.',
            en: 'Options one, three, and four are outputs or activities: things the initiative produces or carries out. Option two is the outcome because it describes a measurable change in mothers\' behaviour after the programme ends — which is exactly what matters to the funder and the community, because it says whether the programme actually affected the beneficiaries\' lives.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'pm-needs',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'تحليل الاحتياج والفئة المستهدفة', en: 'Needs analysis and target group' },
      lede: {
        ar: 'المشروع الذي لم يسأل المستفيدين ماذا يحتاجون سيقدّم لهم في نهاية المطاف ما ظننت أنهم يحتاجون.',
        en: 'A project that never asked its beneficiaries what they need will deliver what you thought they needed.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'تحليل الاحتياج ليس خطوة رسمية تُكتب في المقترح لإرضاء الممول. هو الفرق بين مشروع يحلّ مشكلة حقيقية ومشروع يشغل الناس بأنشطة لا يحتاجونها. المنظمات التي تُحسن تحليل الاحتياج تكتشف أشياء تفاجئها: الأمّهات اللواتي يُفترض أنهن بحاجة لتدريب على التغذية يقلن إن مشكلتهن الأساسية نقص الدخل لا نقص المعرفة — وهذا يعني أن دورة التغذية لوحدها لن تغيّر شيئاً. الشباب الذين يُفترض أنهم بحاجة لدورات تقنية يقولون إنهم يريدون مساحة لبناء العلاقات المهنية لأن شبكة معارفهم هي ما يفتح لهم أبواب سوق العمل. هذا لا يعني أن كل ما يقوله الناس هو كل ما يحتاجون؛ أحياناً يوجد احتياج لا يرى الناس أنفسهم علاقته بما يشكونه. لكن المشروع الجيّد لا يفترض — يحقّق بمنهجية، ثم يصمّم على أساس ما وجد.',
            en: 'Needs analysis is not a formal step you write into the proposal to satisfy the funder. It is the difference between a project that solves a real problem and a project that keeps people busy with activities they do not need. Organisations that do needs analysis well discover things that surprise them: the mothers assumed to need nutrition training say their main problem is insufficient income, not insufficient knowledge — meaning a nutrition course alone will change nothing. The young people assumed to want technical courses say they want a space to build professional networks because their network is what opens doors to the labour market. This does not mean that everything people say is everything they need; sometimes there is a need people do not see a connection to what they are reporting. But a good project does not assume — it investigates methodically, then designs on the basis of what it found.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'حدّد من هم الأشخاص الذين تخدمهم بالضبط قبل أن تسألهم أيّ شيء — الفئة العمرية، الجنس، الموقع الجغرافي، الوضع الاقتصادي، الظروف الخاصة',
              'اجمع بيانات أوّلية من الفئة المستهدفة مباشرةً: مقابلات فردية مع ٦ إلى ١٠ أشخاص، مجموعة بؤرية صغيرة، أو استبيان قصير — استمع أكثر ممّا تتحدّث',
              'اجمع بيانات ثانوية من المصادر الموجودة: دراسات وتقارير عن المنطقة أو الفئة، حتى لو كانت قديمة نسبياً — تعطيك سياقاً لا تستطيع جمعه بمفردك',
              'ابحث عمّا يفعله غيرك في نفس المجال والمنطقة: هل هناك مشاريع مشابهة تعمل الآن؟ ما نتائجها؟ هل ستكمّلها أم ستتداخل معها وتهدر الموارد؟',
              'صنّف الاحتياجات: ما هو حادٌّ وعاجل؟ ما هو مهمّ لكن يمكن التأخّر فيه؟ ما الذي تستطيع مبادرتك معالجته فعلاً بالموارد المتاحة؟',
              'ارجع إلى عيّنة من المستفيدين بما فهمتَه وتحقّق: «هذا ما فهمناه أنه المشكلة الأساسية — هل يوافق ما تعيشون؟» الإجابة السلبية أفضل من مفاجأة بعد التوقيع',
            ],
            en: [
              'Define exactly who you are serving before asking them anything — the age group, gender, location, economic situation, and particular circumstances',
              'Collect primary data directly from the target group: individual interviews with 6–10 people, a small focus group, or a short survey — listen more than you speak',
              'Collect secondary data from existing sources: studies and reports about the area or group, even if relatively dated — they give you context you cannot gather alone',
              'Find out what others are doing in the same field and area: are there similar projects running now? What are their results? Will you complement them or overlap and waste resources?',
              'Categorise the needs: what is acute and urgent? What is important but can wait? What can your initiative realistically address with available resources?',
              'Return to a sample of beneficiaries with your understanding and verify: "this is what we understood to be the core problem — does it match what you are living?" A negative answer is better than a surprise after signing',
            ],
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'من هم المستفيدون المباشرون؟ — من يتعامل مع مشروعك مباشرةً ويتلقّى الخدمة أو التدريب',
              'من هم المستفيدون غير المباشرون؟ — من تتحسّن أوضاعهم بسبب التغيير الذي يحدث للمستفيد المباشر: أسرته، حيّه، صاحب عمله',
              'ما الذي يمنع الفئة المستهدفة من حلّ مشكلتها بنفسها؟ — الحواجز الاقتصادية؟ الثقافية؟ الجغرافية؟ القانونية؟',
              'هل الفئة المستهدفة متجانسة أم تضمّ فئات فرعية تحتاج مقاربات مختلفة؟ — مثلاً «الشباب» قد يعني فئات متباينة من حيث التعليم والجنس والاحتياج',
              'من هم الأكثر هشاشةً داخل الفئة المستهدفة؟ وكيف ستتأكّد من أن المشروع يصل إليهم فعلاً وليس فقط إلى الأسهل وصولاً؟',
              'هل تنتهي الحاجة حين ينتهي المشروع؟ أم أن التحدّي البنيوي يستمر ويجب التخطيط للاستمرارية والانتقال من البداية؟',
            ],
            en: [
              'Who are the direct beneficiaries? — those who interact directly with your project and receive the service or training',
              'Who are the indirect beneficiaries? — those whose situation improves because of the change in the direct beneficiary\'s life: their family, their neighbourhood, their employer',
              'What prevents the target group from solving the problem themselves? — economic barriers? Cultural? Geographic? Legal?',
              'Is the target group homogeneous or does it contain sub-groups needing different approaches? — for example "youth" may mean very different groups in terms of education, gender, and need',
              'Who are the most vulnerable within the target group? And how will you ensure the project actually reaches them, not just those who are easiest to reach?',
              'Will the need end when the project ends? Or does the structural challenge continue and must continuity and transition be planned from the beginning?',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'المستفيد الأوّلي ومن يستفيد خلفه', en: 'The primary beneficiary and those behind them' },
          content: {
            ar: 'برنامج يدرّب معلّمات على تقنيات تعليم القراءة: المعلّمات هنّ المستفيدات المباشرات من التدريب. لكن المستفيدين الفعليين من التحوّل هم تلاميذهن في الفصل. والمستفيدون غير المباشرين هم أسر هؤلاء التلاميذ. تصميم المشروع يجب أن يأخذ هذه الطبقات بعين الاعتبار لأن قياس النجاح لا يتوقّف عند تدريب المعلّمة، بل يمتدّ حتى أثر هذا التدريب على أداء التلاميذ.',
            en: 'A programme training teachers in reading instruction: the teachers are the direct beneficiaries of the training. But the real beneficiaries of the change are their students in the classroom. The indirect beneficiaries are those students\' families. Project design must account for these layers because measuring success does not stop at training the teacher — it extends to the effect of that training on students\' performance.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'الملاحظة الميدانية: اقضِ ساعتين في المكان الذي تعمل فيه قبل أن تسأل أيّ سؤال — ما تراه بعينيك يختلف أحياناً عن ما يقوله الناس حين يُسألون',
              'المقابلة شبه المنظَّمة: جهّز خمسة أسئلة مفتوحة كأسئلة توجيهية، لكن اتبع ما يذكره المتحدّث وليس ترتيب الأسئلة فقط',
              'مجموعة النقاش البؤرية: اجمع ٦ إلى ٨ أشخاص من الفئة المستهدفة وادفعهم للحوار بدل مجرد الإجابة على الأسئلة — الحوار يكشف تناقضات وأولويات لا تظهر في المقابلة الفردية',
              'الاستبيان القصير: فعّال حين تريد قياس انتشار مشكلة على عيّنة أوسع، لكن لا يصلح لاستكشاف التفاصيل — استخدمه بعد المقابلات لا بدلاً منها',
              'مراجعة السجلات والتقارير: تقارير البلدية، سجلّات المدرسة، إحصاءات الصحّة — بيانات ثانوية قد تعطيك أرقاماً لم تستطع جمعها بنفسك',
            ],
            en: [
              'Field observation: spend two hours in the place you will work before asking any question — what you see with your own eyes sometimes differs from what people say when asked',
              'Semi-structured interview: prepare five open questions as guiding prompts, but follow what the speaker mentions rather than just the question order',
              'Focus group discussion: bring 6–8 people from the target group and push them toward dialogue rather than just answering questions — dialogue reveals contradictions and priorities that do not appear in individual interviews',
              'Short survey: effective when you want to measure the prevalence of a problem on a wider sample, but unsuitable for exploring details — use it after interviews, not instead of them',
              'Records and reports review: municipal reports, school records, health statistics — secondary data that may give you numbers you could not collect yourself',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'pm-q3',
          label: { ar: 'سيناريو التحليل', en: 'Analysis scenario' },
          question: {
            ar: 'مبادرة لدعم أصحاب المشاريع الصغيرة في ريف عكّار أجرت مقابلات مع عشرين صاحب محلّ. أغلبهم ذكروا أن مشكلتهم الرئيسية هي صعوبة الوصول إلى شبكات التوزيع في المدن، لا نقص المهارات التجارية. ما الذي يجب أن تفعله المبادرة؟',
            en: 'An initiative to support small-business owners in rural Akkar conducted interviews with twenty shop owners. Most mentioned their main problem is difficulty accessing distribution networks in cities, not a lack of business skills. What should the initiative do?',
          },
          options: [
            {
              ar: 'تعقد ورش عمل لتطوير المهارات التجارية كما خطّطت، لأن الناس لا يدركون دائماً كل ما يحتاجون، ولأن الممول وافق على هذا التدخّل',
              en: 'Hold business-skills workshops as planned, because people do not always recognise everything they need and because the funder has already approved this intervention',
            },
            {
              ar: 'تراجع خطّتها وتصمّم تدخّلاً يعالج الوصول إلى التوزيع، أو تعيد صياغة مشكلتها وتتواصل مع ممول يملك تفويضاً ملائماً',
              en: 'Revise the plan and design an intervention addressing distribution access, or reframe the problem and contact a funder with a suitable mandate',
            },
            {
              ar: 'تُجري المزيد من المقابلات في قرى أخرى إلى أن تجد من يؤكّد أن المهارات التجارية هي المشكلة الأساسية',
              en: 'Conduct more interviews in other villages until someone confirms that business skills are the main problem',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'تحليل الاحتياج وُجد تحديداً ليغيّر الخطّة حين تكشف بيانات حقيقية أنها لا تعالج المشكلة الفعلية. مواصلة الخطّة الأصلية رغم ما سمعته يعني أن التحليل كان شكلياً. وإجراء مقابلات إضافية «بحثاً عمّن يوافق» تحريف للمنهجية. المبادرة الصادقة تعيد التصميم، أو تكون صريحة مع نفسها بأن التدخّل المخطّط لا يطابق الاحتياج المُكتشَف.',
            en: 'Needs analysis exists precisely to change the plan when real data reveals it does not address the actual problem. Continuing the original plan despite what you heard means the analysis was performative. Conducting more interviews "looking for someone who agrees" is a corruption of the methodology. An honest initiative redesigns, or is frank with itself that the planned intervention does not match the discovered need.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'pm-timeline',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'خطّة التنفيذ والجدول الزمني', en: 'Implementation plan and timeline' },
      lede: {
        ar: 'الجدول الزمني لا يُنظَّم الوقت فقط — يكشف التعارضات والاعتماديات في الخطّة قبل أن تبدأ التنفيذ وتكتشفها بطريقة مكلفة.',
        en: 'The timeline does not only organise time — it reveals the contradictions and dependencies in the plan before you start implementing and find them out the expensive way.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'كثير من المشاريع تُكتَب مقترحاتها بترتيب منطقي ظاهري لكن حين يُرسم الجدول الزمني تظهر مشكلات لم تكن مرئية: نشاطان كبيران في الوقت ذاته يحتاج كلاهما الفريق نفسه، أو تدريب يُخطَّط له في أغسطس وهو شهر إجازة في المدارس التي سيُقام فيها، أو مرحلة جمع البيانات تُقرأ في الجدول كأنها تستغرق أسبوعاً بينما الواقع أنها ستستغرق ثلاثة. الجدول الزمني الجيّد ليس لائحة بالأنشطة مع تواريخ بجانبها — هو أداة تفكير تجبرك على الإجابة: من يفعل هذا بالضبط، وكم من الوقت يحتاج فعلاً، وما الذي يجب أن يتمّ قبله حتى يمكن البدء به؟ الخطوط المترابطة في الجدول تُظهر الاعتماديات، وهذه الاعتماديات هي المصدر الأول للتأخيرات في المشاريع.',
            en: 'Many projects are written with an apparently logical order, but when the timeline is drawn, problems become visible that were not there before: two major activities at the same time both needing the same team, or a training planned for August which is the holiday month in the schools where it will be held, or a data collection phase that reads in the schedule as a week when in reality it will take three. A good timeline is not a list of activities with dates beside them — it is a thinking tool that forces you to answer: who exactly does this, how much time does it actually need, and what must be completed first for it to start? The connected lines in the schedule reveal dependencies, and these dependencies are the primary source of delays in projects.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'قائمة الأنشطة الكاملة: اكتب كل نشاط في المشروع حتى الصغير منه — التوقيع على العقود، والتوظيف، والتواصل مع الشركاء، ليست أنشطة تافهة بل تستغرق وقتاً حقيقياً',
              'تسلسل الأنشطة: حدّد ما الذي يجب أن يتمّ قبل بدء كل نشاط — «لا يمكن تدريب الفريق قبل توظيفه» هي اعتمادية واضحة؛ ابحث عن الاعتماديات غير الواضحة أيضاً',
              'تقدير المدّة: كم أسبوعاً أو شهراً يستغرق كل نشاط فعلاً؟ ابدأ بتقديرك ثم اضربه في ١.٣ — معظم الأنشطة تستغرق أطول ممّا نقدّر',
              'توزيع المسؤوليات: اكتب اسم الشخص أو الجهة المسؤولة عن كل نشاط، لا التوصيف الوظيفي فقط، حتى يكون واضحاً من يُحاسَب',
              'المعالم الزمنية (Milestones): حدّد ٤ إلى ٦ نقاط مراجعة رئيسية خلال المشروع — لحظات تقرّر فيها «هل ما حقّقناه حتى الآن يُتيح لنا المضيّ كما خططنا؟»',
              'المخزون الزمني: اترك أسبوعين على الأقل في نهاية المشروع كاحتياطي — ليس كسلاً، بل لأن كل مشروع يواجه حدثاً غير متوقّع مرّة واحدة على الأقل',
            ],
            en: [
              'Full activity list: write every activity in the project including small ones — signing contracts, hiring, communicating with partners are not trivial activities but take real time',
              'Activity sequencing: define what must be completed before each activity starts — "the team cannot be trained before it is hired" is an obvious dependency; look for the non-obvious ones too',
              'Duration estimates: how many weeks or months does each activity actually take? Start with your estimate then multiply by 1.3 — most activities take longer than we estimate',
              'Responsibility assignment: write the name of the person or entity responsible for each activity, not just the job title, so it is clear who is accountable',
              'Milestones: identify 4–6 key review points during the project — moments when you decide "does what we have achieved so far allow us to proceed as planned?"',
              'Time buffer: leave at least two weeks at the end of the project as reserve — not laziness, but because every project faces at least one unexpected event',
            ],
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'مخطّط غانت (Gantt Chart)', en: 'Gantt Chart' },
              text: {
                ar: 'شبكة من الأعمدة (الأشهر أو الأسابيع) والصفوف (الأنشطة). شريط أفقي لكل نشاط يمتدّ من بدايته حتى نهايته. دفاعه هو البساطة — أي شخص في الفريق يفهمه دون شرح.',
                en: 'A grid of columns (months or weeks) and rows (activities). A horizontal bar for each activity spanning from its start to its end. Its virtue is simplicity — any member of the team understands it without explanation.',
              },
            },
            {
              title: { ar: 'الإطار المنطقي (Logframe)', en: 'Logical Framework' },
              text: {
                ar: 'جدول يربط المدخلات بالأنشطة بالمخرجات بالنتائج بالهدف. في كل صف افتراضات مطلوبة ومؤشرات قياس. يُجبرك على التحقّق من أن المنطق سليم قبل التنفيذ.',
                en: 'A table linking inputs to activities to outputs to outcomes to the objective. Each row contains required assumptions and measurement indicators. It forces you to verify that the logic holds before implementation.',
              },
            },
            {
              title: { ar: 'جدول RACI', en: 'RACI Matrix' },
              text: {
                ar: 'لكل نشاط: من المسؤول (Responsible)، من يتحمّل المساءلة (Accountable)، من يُستشار (Consulted)، من يُبلَّغ (Informed). يمنع الازدواجية وغياب المسؤولية في الوقت ذاته.',
                en: 'For each activity: who is Responsible, who is Accountable, who is Consulted, who is Informed. Prevents both duplication and absence of responsibility at the same time.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'الميزانية والجدول الزمني وجهان لعملة واحدة', en: 'Budget and timeline are two sides of the same coin' },
          content: {
            ar: 'كل نشاط في الجدول الزمني له تكلفة: وقت شخص، مواصلات، إيجار مكان، مواد. حين ترسم الجدول الزمني أوّلاً، تصبح الميزانية ترجمةً لقرارات اتّخذتَها مسبقاً، لا أرقاماً تُكتَب بناءً على ما يبدو معقولاً. الجدول الزمني الدقيق يُنتج ميزانية دقيقة؛ الجدول الغامض يُنتج ميزانية مليئة بالفجوات. ابدأ بالجدول، ثم قدّر.',
            en: 'Every activity in the timeline has a cost: someone\'s time, transport, venue rental, materials. When you draw the timeline first, the budget becomes a translation of decisions you have already made, not numbers written based on what seems reasonable. A precise timeline produces a precise budget; a vague timeline produces a budget full of gaps. Start with the timeline, then estimate.',
          },
        },
        {
          type: 'quiz',
          id: 'pm-q4',
          label: { ar: 'سيناريو التخطيط', en: 'Planning scenario' },
          question: {
            ar: 'فريق يخطّط لمشروع مدّته ستة أشهر يبدأ في سبتمبر. في الجدول الزمني اكتشفوا أن نشاطَي «تجنيد المستفيدين» و«التدريب الميداني» مُجدوَلان في الشهر نفسه، وأن «تجنيد المستفيدين» يجب أن يتمّ قبل «التدريب الميداني». ما الذي يجب أن يفعله الفريق؟',
            en: 'A team is planning a six-month project starting in September. In the timeline they discovered that "beneficiary recruitment" and "field training" are scheduled in the same month, and that "beneficiary recruitment" must be completed before "field training". What should the team do?',
          },
          options: [
            {
              ar: 'يُقدَّم نشاط «التدريب الميداني» إلى الشهر الذي يلي اكتمال «تجنيد المستفيدين»، ويُعدَّل الجدول الزمني بأكمله بناءً على ذلك',
              en: 'Move "field training" to the month following the completion of "beneficiary recruitment" and revise the entire timeline accordingly',
            },
            {
              ar: 'يبدأ النشاطان في الشهر نفسه ويُنجزان بشكل متوازٍ لتوفير الوقت وضمان انتهاء المشروع في موعده',
              en: 'Start both activities in the same month and run them in parallel to save time and finish the project on schedule',
            },
            {
              ar: 'يُمدَّد المشروع شهراً إضافياً ويُترك الجدول كما هو حتى يُرى ما سيحدث فعلاً في التنفيذ',
              en: 'Extend the project by one month and leave the schedule as-is to see what actually happens in implementation',
            },
          ],
          correct: 0,
          feedback: {
            ar: 'التوازي لا يعمل حين تكون هناك اعتمادية واضحة: لا يمكن تدريب من لم يُجنَّد بعد، كما لا يمكن تقييم نشاط لم يُنجَز. الغرض من رسم الجدول هو اكتشاف هذه التعارضات قبل البدء. تعديل الجدول الآن يكلّف لا شيء؛ اكتشاف التعارض في الأسبوع الثالث من التنفيذ يكلّف وقتاً ومصداقية. أمّا التمديد مع إبقاء الجدول المتعارض فهو تأجيل للمشكلة لا حلٌّ لها.',
            en: 'Parallel running does not work when there is a clear dependency: you cannot train people who have not yet been recruited. The purpose of drawing the timeline is to discover these conflicts before starting. Adjusting the schedule now costs nothing; discovering the conflict in the third week of implementation costs time and credibility. And extending the project while keeping the conflicting schedule is deferring the problem, not solving it.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'pm-proposal',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'الـ Concept Note والمقترح المبسَّط', en: 'The concept note and simplified proposal' },
      lede: {
        ar: 'الـ Concept Note صفحتان تختبر بهما الفكرة مع الممول قبل أن تستثمر أسابيع في كتابة مقترح كامل قد يُرفَض لسبب يمكن اكتشافه في يوم.',
        en: 'A concept note is two pages to test the idea with the funder before investing weeks in writing a full proposal that may be rejected for a reason discoverable in a day.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'كثير من المنظمات الناشئة تقضي أسابيع في كتابة مقترح مفصّل من عشرين صفحة، ثم تكتشف أن الممول المستهدف لا يموّل هذا النوع من التدخّل أصلاً، أو أن جغرافية المشروع خارج أولوياته الحالية، أو أنه يشترط أن تكون المنظمة مسجّلة من سنتين على الأقل. الـ Concept Note وُجد لتجنّب هذا الهدر: تكتب وثيقة قصيرة من صفحة إلى ثلاث تعرض فيها الفكرة في صميمها وترسلها للممول قبل الاستثمار الكامل في كتابة المقترح. إن أعطاك الممول الضوء الأخضر أو دعاك لتقديم مقترح كامل، تبدأ الكتابة المفصّلة وأنت تعرف أن الفكرة مناسبة من حيث المبدأ. وبعض الممولين يشترطون الـ Concept Note كمرحلة أولى لانتقاء من يُدعى لتقديم مقترح كامل — فهم أيضاً يريدون توفير وقت الجميع.',
            en: 'Many new organisations spend weeks writing a detailed twenty-page proposal, then discover that the target funder does not fund this type of intervention at all, or that the project geography is outside their current priorities, or that they require the organisation to have been registered for at least two years. The concept note exists to avoid this waste: you write a short document of one to three pages presenting the idea at its core and send it to the funder before fully investing in writing the proposal. If the funder gives you the green light or invites you to submit a full proposal, you begin the detailed writing knowing the idea is suitable in principle. Some funders require the concept note as a first stage to select who is invited for a full proposal — they too want to save everyone\'s time.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'عنوان وجملة تلخيصية: اسم المشروع وجملة واحدة تقول ما الذي يفعله ولمن ولماذا الآن',
              'بيان المشكلة: نصف صفحة مبنيّ على بيانات — ما الوضع القائم، من يتأثّر، وما حجمه',
              'النهج المقترح: كيف ستعالج المشكلة؟ ما الأنشطة الرئيسية؟ لماذا هذا النهج على وجه التحديد؟',
              'الفئة المستهدفة: من تخدم؟ كم عددهم؟ وكيف ستصل إليهم بالضبط؟',
              'النتائج المتوقّعة: ما الذي سيكون مختلفاً بحلول نهاية المشروع؟ بمؤشرات قابلة للقياس',
              'الميزانية التقديرية: رقم واحد أو نطاق تقديري — لا تفصيل في هذه المرحلة',
              'المدّة: من متى إلى متى، مع التحفّظ على إمكانية التعديل',
              'من أنتم: جملتان عن المنظمة وتجربتها السابقة في الموضوع أو المنطقة',
            ],
            en: [
              'Title and summary sentence: project name and one sentence saying what it does, for whom, and why now',
              'Problem statement: half a page built on data — the current situation, who is affected, and at what scale',
              'Proposed approach: how will you address the problem? What are the main activities? Why this approach specifically?',
              'Target group: who are you serving? How many? And how exactly will you reach them?',
              'Expected results: what will be different by the project\'s end? With measurable indicators',
              'Indicative budget: one figure or estimated range — no detail at this stage',
              'Duration: from when to when, with a note that adjustment is possible',
              'Who you are: two sentences on the organisation and previous relevant experience in the field or area',
            ],
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'السياق والمشكلة', en: 'Context and problem' },
              text: {
                ar: 'توسيع لبيان المشكلة: البيانات التفصيلية، السياق المحلّي، ما جرّب من قبل ونتائجه، ولماذا هذا التوقيت بالذات مناسب للتدخّل الآن.',
                en: 'An expansion of the problem statement: detailed data, local context, what has been tried before and the results, and why this particular moment is right for intervention.',
              },
            },
            {
              title: { ar: 'الإطار المنطقي', en: 'Logical framework' },
              text: {
                ar: 'جدول يربط الهدف بالنتائج بالمخرجات بالأنشطة بالمدخلات. كل صفّ يجيب: «إذا أنجزنا هذا توفّرت شروط تحقيق ذاك» — يجبرك على التحقّق من المنطق قبل التنفيذ.',
                en: 'A table linking objective to outcomes to outputs to activities to inputs. Each row answers: "if we achieve this, the conditions for achieving that are met" — forcing you to verify the logic before implementation.',
              },
            },
            {
              title: { ar: 'الميزانية التفصيلية', en: 'Detailed budget' },
              text: {
                ar: 'كل بند بالكمية والسعر الوحدوي والمجموع. تُقسَّم بين ما يطلبه المشروع من الممول وما تقدّمه المنظمة كمساهمة ذاتية — المساهمة الذاتية تُظهر جدّية الالتزام.',
                en: 'Every item with quantity, unit price, and total. Divided between what the project requests from the funder and what the organisation contributes itself — the co-contribution demonstrates seriousness of commitment.',
              },
            },
            {
              title: { ar: 'خطّة الرصد والتقييم', en: 'Monitoring and evaluation plan' },
              text: {
                ar: 'كيف ستعرف أن المشروع يسير وفق الخطّة؟ من يجمع البيانات؟ كم مرّة؟ ما المؤشرات؟ وماذا تفعل إن كشف الرصد انحرافاً؟',
                en: 'How will you know the project is on track? Who collects data? How often? What are the indicators? And what do you do if monitoring reveals deviation?',
              },
            },
            {
              title: { ar: 'الاستدامة والخروج', en: 'Sustainability and exit' },
              text: {
                ar: 'ماذا بعد انتهاء التمويل؟ هل يستمر بموارد محلّية؟ هل تنتقل ملكيّته لجهة أخرى؟ الممول يريد هذا الجواب قبل أن يموّل، لأنه لا يريد أن يُحدث أثراً ثم يختفي مع نهاية المشروع.',
                en: 'What happens after the funding ends? Does it continue with local resources? Does ownership transfer to another body? The funder wants this answer before committing, because they do not want to create an effect and then see it disappear with the project\'s end.',
              },
            },
          ],
        },
        {
          type: 'text',
          content: {
            ar: 'للميزانية الأولية في مرحلة الـ Concept Note، ليس المطلوب دقّة حسابية مطلقة — المطلوب صدق في التقدير. المنظمات التي تحدّد ميزانية مضخَّمة تنفّر الممول. والتي تضع ميزانية متدنّية ثم تطلب تعديلات متكرّرة تفقد مصداقيتها. طريقة عملية: اكتب قائمة بالبنود الكبرى — الموارد البشرية، المواصلات، المواد، التشغيل العام — وقدّر كل منها بشكل واقعي. للموارد البشرية: كم يوماً أو ساعةً من عمل كل فرد وما السعر اليومي الواقعي في سياقك؟ للمواد: استفسر عن الأسعار الفعلية بدل التخمين. ثم اضف هامشاً من ١٠ إلى ١٥٪ للطوارئ وتقلّبات الأسعار. هذا الهامش ليس تضخيماً — هو صدق مع نفسك أنك لا تعرف كل شيء مسبقاً. ومن المعتاد أن يطلب الممول ميزانية مقسَّمة على فئات تشغيلية وبشرية ومادية — لذا فكّر بهذا التقسيم منذ البداية حتى لا تضطر لإعادة ترتيب الأرقام لاحقاً. كذلك تحقّق مع كل ممول من سياسته تجاه التكاليف الإدارية (Overhead): بعض الممولين يسمحون بنسبة محدّدة، وبعضهم لا يموّل التكاليف الإدارية إطلاقاً — معرفة ذلك مسبقاً توفّر عليك إعادة كتابة كاملة للميزانية.',
            en: 'For the initial budget in the concept note stage, absolute accounting precision is not required — honest estimation is. Organisations that specify an inflated budget put the funder off. Those that set a deflated budget then request repeated revisions lose credibility. A practical approach: list the major budget lines — human resources, transport, materials, general operations — and estimate each realistically. For human resources: how many days or hours of work from each person, and what is the realistic daily rate in your context? For materials: enquire about actual prices instead of guessing. Then add a 10–15% contingency for emergencies and price fluctuations. This contingency is not inflation — it is honesty with yourself that you do not know everything in advance. Funders usually want the budget split into operational, human and material categories — so think in that split from the outset rather than rearranging the figures later. Check each funder\'s policy on overhead in advance as well: some allow a set percentage, some will not fund administrative costs at all — knowing this beforehand saves you rewriting the entire budget.',
          },
        },
        {
          type: 'quiz',
          id: 'pm-q5',
          label: { ar: 'سيناريو الكتابة', en: 'Writing scenario' },
          question: {
            ar: 'أُبلغتَ أن ممولاً مهتمّاً بمشروعك وطلب Concept Note في خمسة أيام. المشروع لا يزال في مرحلة الفكرة العامة ولم تُجرِ أيّ مقابلات مع الفئة المستهدفة بعد. ما أوّل ما تفعله؟',
            en: 'You are told that a funder is interested in your project and asked for a concept note in five days. The project is still at the general idea stage and you have not conducted any interviews with the target group yet. What is the first thing you do?',
          },
          options: [
            {
              ar: 'تكتب الـ Concept Note الآن بتقديرات ومؤشرات افتراضية مأخوذة من مشاريع مشابهة، وتجمع البيانات الحقيقية بعد الحصول على الموافقة المبدئية من الممول على الفكرة',
              en: 'Write the concept note now with assumed estimates and indicators borrowed from similar projects, then collect the real data after getting initial approval from the funder',
            },
            {
              ar: 'تطلب من الممول تمديد المهلة أسبوعاً أو أسبوعَين لإجراء ثلاث إلى خمس مقابلات قصيرة مع الفئة المستهدفة وتحديد بيان المشكلة بشكل يمكن الدفاع عنه',
              en: 'Ask the funder for a one- or two-week extension to conduct three to five short interviews with the target group and develop a problem statement you can defend',
            },
            {
              ar: 'ترسل الـ Concept Note في الموعد المحدّد استناداً إلى ملاحظاتك الشخصية من الحيّ، وتعدّلها بعد الموافقة الأولية',
              en: 'Send the concept note on the set date based on your own personal observations of the area, and revise it after initial approval',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'إرسال Concept Note مبنيّة على افتراضات غير مُتحقَّق منها يعرّضك لاحقاً لتوقيع اتفاقية على مشروع تكتشف أنه لا يعالج المشكلة الفعلية أو غير قابل للتنفيذ بالشروط المتّفق عليها. طلب التمديد ليس ضعفاً بل احترافية — الممول يفضّل مقترحاً متأنّياً على مقترح مكتوب بتسرّع. وإن كانت المهلة صارمة فعلاً، يمكن إجراء ثلاث مقابلات هاتفية قصيرة في يوم واحد تعطيك ما يكفي لصياغة بيان مشكلة أوّلي يمكن الدفاع عنه.',
            en: 'Sending a concept note built on unverified assumptions risks later signing an agreement for a project you discover does not address the actual problem or is undeliverable under the agreed terms. Asking for an extension is professionalism, not weakness — a funder prefers a careful proposal to a hasty one. And if the deadline is truly fixed, three short phone interviews in one day can give you enough for a first problem statement you can defend.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 6
    {
      id: 'pm-risks',
      tag: { ar: 'الوحدة السادسة', en: 'Module 6' },
      title: { ar: 'المخاطر والافتراضات ومؤشرات النجاح', en: 'Risks, assumptions and success indicators' },
      lede: {
        ar: 'المشروع الذي لم يكتب مخاطره قبل البدء سيكتشفها بعد البدء في أسوأ وقت.',
        en: 'A project that did not write its risks before starting will discover them after starting, at the worst possible moment.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'كتابة المخاطر والافتراضات قبل البدء في تنفيذ المشروع ليست تشاؤماً ولا بيروقراطية فارغة ولا خطوة تُكتَب في المقترح ثم تُنسى — هي الفرق بين فريق يتفاجأ بالعقبات وفريق كان قد فكّر فيها وجهّز بدائل. كل مشروع يقوم على افتراضات صامتة: نفترض أن المستفيدين سيأتون في الأوقات المحدّدة، نفترض أن الشريك المحلّي سيفي بتعهّداته، نفترض أن الأسعار لن ترتفع بشكل حادّ، نفترض أن الوضع السياسي سيبقى مستقرّاً. هذه الافتراضات ليست خاطئة بالضرورة، لكنها إذا لم تُكتَب لم تُختبَر ولم تُوضَع لها خطط بديلة. الخطر هو احتمال حدث خارج سيطرتك قد يؤثّر على المشروع. الافتراض هو شرط يجب أن يتحقّق لكي يعمل الجزء التالي من المشروع وفق الخطّة. والفرق العملي: الخطر تديره بخطّة احترازية مسبقة، والافتراض تراقبه بانتظام وتتصرّف حين يتبيّن أنه لم يعد صحيحاً.',
            en: 'Writing risks and assumptions before beginning project implementation is neither pessimism nor empty bureaucracy — it is the difference between a team surprised by obstacles and a team that had thought about them and prepared alternatives. Every project rests on silent assumptions: we assume beneficiaries will come at the set times, we assume the local partner will honour its commitments, we assume prices will not rise sharply, we assume the political situation will remain stable. These assumptions are not necessarily wrong, but if they are not written they are not tested and no contingency plans are made for them. A risk is the possibility of an event outside your control that may affect the project. An assumption is a condition that must be true for the next part of the project to work as planned. The practical difference: you manage a risk with a prepared contingency plan; you monitor an assumption regularly and act when it proves no longer true.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'خطر — Risk', en: 'Risk' },
          noTitle: { ar: 'افتراض — Assumption', en: 'Assumption' },
          yes: {
            ar: [
              'ارتفاع أسعار المواد بأكثر من ٢٥٪ خلال فترة التنفيذ بسبب التضخّم',
              'انسحاب الشريك المحلّي من المشروع في منتصف التنفيذ',
              'انخفاض حضور المستفيدين عن ٦٠٪ من المجموع في الجلسات الميدانية',
              'تأخّر في الحصول على الموافقات الحكومية اللازمة لتنفيذ الأنشطة',
              'حدث أمني أو كارثة طبيعية في المنطقة يوقف الأنشطة مؤقّتاً',
            ],
            en: [
              'Materials prices rising by more than 25% during implementation due to inflation',
              'The local partner withdrawing from the project midway through implementation',
              'Beneficiary attendance dropping below 60% of the total at field sessions',
              'Delay in obtaining government approvals required to run the activities',
              'A security event or natural disaster in the area temporarily halting activities',
            ],
          },
          no: {
            ar: [
              'المستفيدون يمتلكون هاتفاً ذكياً ومتاحاً للوصول إلى المنصّة الرقمية',
              'الجهات الحكومية ستمنح الإذن للعمل في المنطقة المستهدفة خلال أسبوعين',
              'الشريك المحلّي لديه الطاقة البشرية والإدارية الكافية لتنفيذ أنشطة الميدان',
              'المستفيدون سيكونون متاحين في الأوقات المحدّدة للجلسات طوال فترة المشروع',
              'مبالغ الدفعة الثانية من الممول ستصل في الموعد المتّفق عليه',
            ],
            en: [
              'Beneficiaries own a smartphone available to access the digital platform',
              'Government bodies will grant permission to work in the target area within two weeks',
              'The local partner has sufficient human and administrative capacity for field activities',
              'Beneficiaries will be available at the scheduled session times throughout the project',
              'The second payment from the funder will arrive on the agreed date',
            ],
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'أنتج قائمة بكل ما قد يسوء: اجمع الفريق وضعوا معاً قائمة بكل عقبة محتملة — لا رقابة في هذه المرحلة، كل فكرة مرحَّب بها',
              'لكل خطر محتمل، قدّر احتمال وقوعه (عالٍ / متوسط / منخفض) وأثره المحتمل على المشروع (جسيم / متوسط / هامشي)',
              'ركّز مواردك على المخاطر ذات الاحتمال العالي والأثر الجسيم — هذه تحتاج خططاً احترازية فعلية ومحدّدة بأسماء وإجراءات',
              'لكل خطر ذي أولوية: حدّد إشارة تحذير مبكّرة تُخبرك بأن الخطر يتحقّق، وخطّة بديلة جاهزة إن تحقّق',
              'لكل افتراض: حدّد مؤشراً يُخبرك أن الافتراض لا يزال صحيحاً، وحدّد تردّداً لمراجعته (شهريّاً؟ كل أسبوعين؟)',
              'وثّق كل ذلك في سجلّ مخاطر بسيط — جدول بصفوف وأعمدة — وراجعه في كل اجتماع متابعة دوري',
            ],
            en: [
              'Generate a list of everything that could go wrong: gather the team and together list every possible obstacle — no filtering at this stage, every idea is welcome',
              'For each possible risk, estimate the likelihood of it occurring (high / medium / low) and its potential impact on the project (serious / moderate / marginal)',
              'Focus your resources on risks with high likelihood and serious impact — these need real, specific contingency plans with named people and defined actions',
              'For each priority risk: define an early warning sign that tells you the risk is materialising, and a contingency plan ready if it does',
              'For each assumption: define an indicator telling you the assumption still holds, and set a review frequency (monthly? fortnightly?)',
              'Document all of this in a simple risk register — a table with rows and columns — and review it at every periodic progress meeting',
            ],
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'مؤشر النجاح يجيب على: كيف نعرف أننا حققنا ما وعدنا به؟ — إن لم يكن للمؤشر إجابة واضحة، فهو ليس مؤشراً',
              'المؤشر الجيّد يحدّد أربعة أشياء: الكمية (كم؟)، والمستوى (بأيّ جودة؟)، والتوقيت (بحلول متى؟)، والفئة (لمن؟)',
              'اجعل مؤشراتك قابلة للتحقّق بطرق متعدّدة: سجلّ الحضور، استبيان ما بعد البرنامج، زيارة ميدانية — لا تعتمد على مصدر واحد لأن مصادر التحقّق المتعدّدة تعطيك صورة أدقّ',
              'تجنّب مؤشرات الرأي العام الرضوي: «المستفيدون أبدوا ارتياحاً عالياً» هو رأي، ليس دليلاً على تغيير فعلي — الرضا عن التجربة لا يعني بالضرورة اكتساب مهارة أو تغيير سلوك',
              'حدّد خطّ الأساس (Baseline) قبل البدء: ما هو مستوى الوضع الآن قبل تدخّلك؟ — بدون هذا لا تعرف كم تحرّكت ولا في أيّ اتجاه',
              'ضع ٥ إلى ٧ مؤشرات للمشروع كله بحدّه الأقصى — المؤشرات الكثيرة لا تُقاس جيداً وتحوّل الرصد إلى عبء لا أداة',
            ],
            en: [
              'A success indicator answers: how do we know we achieved what we promised? — if the indicator has no clear answer, it is not an indicator',
              'A good indicator specifies four things: quantity (how much?), level (to what quality?), timing (by when?), and group (for whom?)',
              'Make your indicators verifiable by multiple means: attendance records, a post-programme survey, a field visit — do not rely on one source because multiple verification sources give a more accurate picture',
              'Avoid satisfaction-opinion indicators: "beneficiaries expressed high satisfaction" is an opinion, not evidence of actual change — satisfaction with the experience does not necessarily mean a skill gained or a behaviour changed',
              'Set a baseline before starting: what is the level of the situation now, before your intervention? — without this you cannot know how far you moved or in which direction',
              'Set a maximum of 5–7 indicators for the whole project — too many indicators are not measured well and turn monitoring into a burden rather than a tool',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'الافتراض الذي يودّي بالمشاريع', en: 'The assumption that sinks projects' },
          content: {
            ar: 'أكثر افتراض صامت يدمّر المشاريع هو: «المستفيدون سيأتون». مشاريع كاملة صُمِّمت افتراضاً أن الناس يريدونها ويستطيعون الوصول إليها — ثم تكتشف في الشهر الأول أن أوقات الجلسات تتعارض مع ساعات العمل، أو أن المكان بعيد جداً عن سكن المستهدفين، أو أن الثقافة المحلّية لا تسمح للنساء بالتنقّل في تلك الساعة، أو أن المستفيدين لم يسمعوا بالمشروع أصلاً. هذا الافتراض يجب أن يُكتَب ويُتحقَّق منه قبل إقفال الجدول الزمني وتوقيع عقود الأماكن. المبادرة التي تكتشف في الأسبوع الثالث أن مستفيديها لا يحضرون لأن الموعد لا يناسبهم لم تُجرِ تحليل احتياج حقيقياً.',
            en: 'The most silent assumption that destroys projects is: "the beneficiaries will come." Entire projects designed on the assumption that people want them and can reach them — then in the first month it emerges that session times conflict with working hours, the location is too far from where the target group lives, local culture does not permit women to travel at that hour, or the beneficiaries never heard about the project in the first place. This assumption must be written and verified before the timeline is fixed and venue contracts are signed. An initiative that discovers in the third week that its beneficiaries are not attending because the time does not suit them never did a real needs analysis.',
          },
        },
        {
          type: 'quiz',
          id: 'pm-q6',
          label: { ar: 'تحديد الخطر والافتراض', en: 'Identifying risk and assumption' },
          question: {
            ar: 'مشروع تدريبي للنساء في منطقة ريفية. كتب الفريق في خطّته: «نفترض أن النساء سيحضرن الجلسات في المساء بين السابعة والتاسعة.» ما الوصف الصحيح لهذه الجملة وما الإجراء المناسب؟',
            en: 'A training project for women in a rural area. The team wrote in its plan: "We assume women will attend sessions in the evening between 7 and 9 pm." What is the correct description of this statement, and what is the appropriate action?',
          },
          options: [
            {
              ar: 'خطر — يجب تسجيله في سجل مخاطر المشروع ووضع خطّة احترازية لحالة انخفاض الحضور المسائي، مثل إضافة جلسة صباحية بديلة، وإبلاغ الممول بها قبل بدء التنفيذ',
              en: 'A risk — it should be recorded in the project risk log with a contingency plan for low evening attendance, such as adding an alternative morning session, and the funder informed of that plan before implementation begins',
            },
            {
              ar: 'افتراض يحتاج تحقّقاً فورياً قبل اعتماد الجدول — بسؤال مجموعة من النساء مباشرةً عن تفضيلات التوقيت وإمكانية الحضور في الساعة المساءَية المحدّدة',
              en: 'An assumption that needs immediate verification before fixing the schedule — by asking a group of women directly about time preferences and ability to attend at the specified evening hour',
            },
            {
              ar: 'مؤشر نجاح — يُقيَّم بعد انتهاء المشروع بالمقارنة بين الحضور الفعلي والعدد المستهدف في كل جلسة مسائية',
              en: 'A success indicator — evaluated after the project ends by comparing actual attendance with the target number for each evening session',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'هذه جملة افتراض لأنها شرط يجب أن يتحقّق حتى يعمل الجدول الزمني كما صُمِّم. لكنها افتراض لم يُتحقَّق منه بعد، وإن كان خاطئاً فأثره قد يجعل المشروع بأكمله غير قابل للوصول لفئته المستهدفة. الإجراء الصحيح: تحقّق قبل إقفال الجدول — بمجموعة بؤرية صغيرة أو رسائل هاتفية لخمس نساء من المنطقة. إن أكّدن أن المساء مناسب فاعتمده؛ وإن لم يكن فعدّل الجدول الآن لا بعد توقيع العقود والتزام الممول.',
            en: 'This is an assumption statement because it is a condition that must be true for the schedule to work as designed. But it is an unverified assumption, and if it is wrong the impact could make the entire project unreachable for its target group. The correct action: verify before fixing the schedule — with a small focus group or phone messages to five women from the area. If they confirm evenings work, keep it; if not, adjust the schedule now, not after contracts are signed and the funder is committed.',
          },
        },
      ],
    },
  ],
};
