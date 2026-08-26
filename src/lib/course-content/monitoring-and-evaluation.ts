import type { CourseContent } from './types';

/**
 * Level 5 — Monitoring, Evaluation, Learning and Impact.
 *
 * The distinction this course draws — and draws hard — is between counting and
 * knowing. You can count the number of people who attended a training. That is
 * an output, not an outcome, not an impact. Knowing whether anything changed
 * for them requires a different kind of question asked at a different time to a
 * different person.
 *
 * The other tension the course holds is between honest reporting and optimistic
 * reporting. Inflating an impact figure is not a harmless exaggeration — it
 * misallocates future funding toward what looks good rather than what works.
 */

export const monitoringAndEvaluation: CourseContent = {
  slug: 'monitoring-and-evaluation',
  level: 5,
  minutes: 45,
  passMark: 70,
  title: {
    ar: 'الرصد والتقييم والتعلّم وقياس الأثر',
    en: 'Monitoring, Evaluation, Learning and Impact',
  },
  lede: {
    ar: 'الفرق بين النشاط والمخرج والنتيجة والأثر — ولماذا تضخيم الأثر يضرّ الجمعية أكثر من رقم متواضع صادق.',
    en: 'The difference between an activity, an output, an outcome and an impact — and why inflating impact costs an organisation more than a modest honest figure.',
  },
  outcomes: {
    ar: [
      'تميّز بين النشاط والمخرج والنتيجة والأثر في مشروع حقيقي',
      'تختار مؤشّرات كميّة ونوعية وتحدّد خط أساس وهدفاً',
      'تحكم على جودة بيانات جُمعت وترفض ما لا يصلح',
      'تكتب تقرير أثر مختصراً وصادقاً لا يضخّم',
    ],
    en: [
      'Tell activity from output from outcome from impact in a real project',
      'Choose quantitative and qualitative indicators with a baseline and a target',
      'Judge the quality of collected data and reject what will not hold',
      'Write a short, honest impact report that does not inflate',
    ],
  },
  sources: [
    'OECD DAC — Glossary of Key Terms in Evaluation and Results-Based Management (2002)',
    'BetterEvaluation — Frameworks for Monitoring and Evaluation in Development',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'me-chain',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'سلسلة النتائج: من النشاط إلى الأثر', en: 'The results chain: from activity to impact' },
      lede: {
        ar: 'أقمت دورة تدريبية لثلاثين شخصاً. هذا ما فعلته — لكنه ليس ما أحدثته.',
        en: 'You delivered a training to thirty people. That is what you did — not what you caused.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'سلسلة النتائج هي الإطار الأساسي الذي يُنظّم التفكير في مراحل ما ينتجه المشروع. وهي تتكوّن من أربعة حلقات متتالية:\n\nالنشاط هو ما تفعله: تقيم ورشة، تزرع أشجاراً، توزّع كتيّبات. المخرج هو ما ينتج مباشرة عن النشاط: عدد من تدرّبوا، عدد الأشجار المزروعة، عدد الكتيّبات الموزّعة. النتيجة هي التغيير الذي يطرأ على المستفيدين بعد وقت من التنفيذ: مهارة اكتُسبت، سلوك تغيّر، قدرة بُنيت. والأثر هو التغيير الأوسع في حياة الأشخاص أو المجتمع الذي يُعزى جزئياً لتدخّلنا.\n\nالخلط بين هذه الحلقات ليس مجرّد خطأ في التعريف — بل له تكلفة عملية. حين تُسمّى المخرجات نتائج، تبدو المشاريع أجدى مما هي. وحين تُسمّى النتائج أثراً، تُنسَب لمشروعنا تغييرات سببتها عوامل كثيرة أخرى.',
            en: 'The results chain is the basic framework for thinking about what a project produces in stages. It consists of four consecutive links:\n\nActivity is what you do: run a workshop, plant trees, distribute booklets. Output is what the activity directly produces: the number trained, trees planted, booklets distributed. Outcome is the change in beneficiaries that emerges over time after delivery: a skill acquired, a behaviour changed, a capacity built. And impact is the broader change in people\'s lives or the community that is partly attributable to the intervention.\n\nConfusing these links is not merely a definitional error — it has practical costs. When outputs are called outcomes, projects look more effective than they are. When outcomes are called impact, we attribute to our project changes caused by many other factors.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'النشاط', en: 'Activity' },
              text: { ar: 'ما تفعله أنت: ورشة، توزيع، زيارة ميدانية.', en: 'What you do: a workshop, a distribution, a field visit.' },
            },
            {
              title: { ar: 'المخرج', en: 'Output' },
              text: { ar: 'عدد المستفيدين المباشرين، الكميات الموزّعة، الجلسات المنعقدة.', en: 'Number of direct beneficiaries, quantities distributed, sessions held.' },
            },
            {
              title: { ar: 'النتيجة', en: 'Outcome' },
              text: { ar: 'التغيير في المعرفة أو المهارة أو السلوك — يُقاس بعد فترة، ليس في اليوم نفسه.', en: 'Change in knowledge, skill or behaviour — measured after a period, not on the same day.' },
            },
            {
              title: { ar: 'الأثر', en: 'Impact' },
              text: { ar: 'التغيير الاجتماعي أو الاقتصادي الأوسع — يُعزى جزئياً فقط لتدخّلنا.', en: 'The broader social or economic change — only partly attributable to our intervention.' },
            },
          ],
        },
        {
          type: 'quiz',
          id: 'me-q1',
          label: { ar: 'سؤال ١', en: 'Question 1' },
          question: {
            ar: 'دورة تدريبية حضرها ٤٥ متطوّعاً. بعد شهرين، ٣٠ منهم طبّقوا مهارة الإسعافات الأولية في نشاط ميداني. ما التصنيف الصحيح؟',
            en: 'A training attended by 45 volunteers. Two months later, 30 of them applied first aid skills in a field activity. What is the correct classification?',
          },
          options: [
            { ar: '٤٥ حاضراً = مخرج. ٣٠ طبّقوا المهارة = نتيجة', en: '45 attendees = output. 30 applied the skill = outcome' },
            { ar: 'كلاهما مخرج لأن كلاهما قابل للعدّ', en: 'Both are outputs because both can be counted' },
            { ar: '٣٠ طبّقوا المهارة = أثر لأن هذا هو الهدف الحقيقي للتدريب', en: '30 applied the skill = impact because that is the real goal of training' },
          ],
          correct: 0,
          feedback: {
            ar: 'عدد الحاضرين مخرج مباشر للتدريب. تطبيق المهارة بعد شهرين تغيير في السلوك — وهو نتيجة. الأثر يحتاج أدلة على تغيير أوسع في حياة الناس.',
            en: 'Attendance count is a direct output of the training. Applying the skill two months later is a behavioural change — an outcome. Impact requires evidence of broader change in people\'s lives.',
          },
        },
        {
          type: 'quiz',
          id: 'me-q2',
          label: { ar: 'سؤال ٢', en: 'Question 2' },
          question: {
            ar: 'تقرير جمعية يقول: "حسّنّا أوضاع ٢٠٠٠ أسرة في منطقة X". بناءً على سلسلة النتائج، ما السؤال الأول الذي يجب طرحه؟',
            en: 'An organisation\'s report says: "We improved conditions for 2000 families in area X." Based on the results chain, what is the first question to ask?',
          },
          options: [
            { ar: 'ما الدليل على أن التغيير حدث، وما نسبته التي تُعزى لتدخّلكم تحديداً؟', en: 'What is the evidence that change occurred, and what share of it is attributable specifically to your intervention?' },
            { ar: 'كيف وصلتم إلى هذا العدد الكبير — هل عُدّت كل أسرة على حدة أم قُدّر الرقم من كمّيات الطرود الموزّعة؟', en: 'How did you reach such a large number — was each family counted separately, or was the figure estimated from the quantities distributed?' },
            { ar: 'هل يكفي هذا الرقم لبلوغ الأهداف السنوية المتّفق عليها مع المانح؟', en: 'Is this figure enough to meet the annual objectives agreed with the funder?' },
          ],
          correct: 0,
          feedback: {
            ar: 'الادعاء بالأثر يتطلّب دليلين: أن التغيير حدث فعلاً (بيانات مقارنة)، وأن المشروع كان سببه الجزئي المعقول (النسب والعزو). بدون هذين لا يوجد أثر موثَّق.',
            en: 'Claiming impact requires two pieces of evidence: that the change actually occurred (comparative data), and that the project was a reasonable partial cause (attribution). Without both, there is no documented impact.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'me-indicators',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'المؤشّرات وخط الأساس', en: 'Indicators and baseline' },
      lede: {
        ar: 'مؤشّر لا خط أساس له مثل مسطرة بلا أرقام — يمكنك قياس شيء لكن لا تعرف ماذا.',
        en: 'An indicator without a baseline is like a ruler with no numbers — you can measure something but you cannot know what.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'المؤشّر وسيلة قياس، لا هدف بذاته. "عدد المتطوّعين المدرَّبين" مؤشّر. "٨٠٪ من المتطوّعين المدرَّبين يطبّقون المهارة خلال شهر" هدف يستخدم هذا المؤشّر. الفرق حاسم: المؤشّر يخبرك بالاتجاه، الهدف يخبرك بمدى الاقتراب من التغيير المنشود.\n\nخط الأساس هو قياس الوضع قبل التدخّل. بدونه لا يمكن إثبات أن التدخّل أحدث فرقاً. إن بدأت ورشة تدريبية دون قياس مستوى المعرفة قبلها، ستنتهي الورشة دون أن تعرف إذا تغيّر شيء. الاستثناء الوحيد: إن كانت هناك بيانات تاريخية موثوقة يمكن استخدامها كخط أساس.',
            en: 'An indicator is a measurement tool, not a goal in itself. "Number of volunteers trained" is an indicator. "80% of trained volunteers apply the skill within a month" is a target that uses this indicator. The difference is crucial: an indicator tells you direction, a target tells you how close you are to the desired change.\n\nA baseline is a measurement of the situation before the intervention. Without it, you cannot prove the intervention made a difference. If you begin a training workshop without measuring knowledge beforehand, you will finish the workshop without knowing whether anything changed. The one exception: if reliable historical data exists that can serve as the baseline.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'مؤشّر جيّد (SMART)', en: 'Good indicator (SMART)' },
          noTitle: { ar: 'مؤشّر ضعيف', en: 'Weak indicator' },
          yes: {
            ar: [
              '٪ من المتطوّعين الذين يُجرون تقييم مخاطر مكتوباً قبل كل نشاط',
              'عدد تقارير الحوادث المقدَّمة خلال ٢٤ ساعة',
              'درجة رضا المستفيدين على مقياس ١-٥ بنسبة استجابة ≥٦٠٪',
            ],
            en: [
              '% of volunteers conducting a written risk assessment before each activity',
              'Number of incident reports submitted within 24 hours',
              'Beneficiary satisfaction score on a 1-5 scale with ≥60% response rate',
            ],
          },
          no: {
            ar: [
              'تحسين وعي المتطوّعين بالسلامة',
              'زيادة التقارير',
              'رضا المستفيدين أفضل',
            ],
            en: [
              'Improve volunteer awareness of safety',
              'Increase reports',
              'Better beneficiary satisfaction',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'التقييم التشاركي يختلف عن التقييم التقليدي في جوهره: بدلاً من أن يُطرح المستفيدون كمصدر بيانات يُملأ بها نموذج، يُصبحون شركاء في صياغة الأسئلة وفي تفسير النتائج وأحياناً في بناء التوصيات. هذا التحوّل ليس مجرّد خيار منهجي — بل التزام أخلاقي بالمساءلة أمام من تخدمهم المنظّمة.\n\nتتعدّد أدوات التقييم التشاركي لتناسب سياقات مختلفة. مجموعات النقاش المركّزة تجمع مستفيدين ذوي خصائص مشتركة لمناقشة تجربتهم مع الخدمة — تمتاز بالعمق في الفهم مقارنةً بالاستبيان الكمّي. تقنيات التقييم المجتمعي كالتصنيف بالحصى ورسم الخارطة الاجتماعية مفيدة خاصّة مع فئات لا تُجيد القراءة والكتابة. والمراجعة التشاركية في نهاية المشروع هي جلسة منظّمة يُشارك فيها المستفيدون والفريق معاً في تقييم ما جرى وما يمكن تحسينه، وتجمع بين التوثيق والتعلّم في آنٍ واحد.\n\nقيمة التقييم التشاركي لا تقتصر على البيانات التي يُنتجها — بل تمتدّ لبناء ثقة المستفيد في المنظّمة وانتمائه لها، وتُشعره بأن صوته يصل فعلاً إلى قرارات تمسّه. هذا الأثر يظلّ حاضراً بعد انتهاء التقييم ويُسهم في تراكم الرأسمال الاجتماعي الذي لا يُشترى بالمال.',
            en: 'Participatory evaluation differs from traditional evaluation at its core: rather than treating beneficiaries as a data source to fill into a form, they become partners in shaping the questions, interpreting the findings, and sometimes building recommendations. This shift is not merely a methodological choice — it is an ethical commitment to accountability toward those the organisation serves.\n\nParticipatory evaluation tools vary to suit different contexts. Focus group discussions bring together beneficiaries with shared characteristics to discuss their experience with the service — they offer depth of understanding compared with a quantitative questionnaire. Community evaluation techniques such as stone-ranking and social mapping are particularly useful with groups who are not literate. And the participatory end-of-project review is a structured session where beneficiaries and the team together evaluate what happened and what could be improved, combining documentation and learning at once.\n\nThe value of participatory evaluation is not limited to the data it produces — it extends to building the beneficiary\'s trust in the organisation and sense of belonging, making them feel that their voice genuinely reaches decisions that affect them. This effect remains present after the evaluation ends and contributes to accumulating social capital that cannot be purchased.',
          },
        },
        {
          type: 'quiz',
          id: 'me-q3',
          label: { ar: 'سؤال ٣', en: 'Question 3' },
          question: {
            ar: 'مشروع يدّعي أنه "رفع مستوى الوعي بحقوق الطفل". لم يُقَس الوعي قبل المشروع. ما مشكلة هذا الادعاء؟',
            en: 'A project claims it "raised awareness of children\'s rights." Awareness was not measured before the project. What is the problem with this claim?',
          },
          options: [
            { ar: 'لا يوجد خط أساس للمقارنة، فلا يمكن إثبات أن الوعي ارتفع أو تغيّر', en: 'There is no baseline to compare against, so it is impossible to prove awareness rose or changed' },
            { ar: 'المشكلة في الصياغة فقط — "رفع الوعي" مؤشّر غير قابل للقياس أصلاً، فيكفي إعادة صياغة الجملة بدل السعي لقياسها', en: 'The problem is only in the wording — "raising awareness" cannot be measured at all, so the claim needs rephrasing rather than evidence' },
            { ar: 'لا مشكلة — كشوف الحضور وعدد الكتيّبات الموزّعة أدلّة كافية على أن الوعي قد ارتفع', en: 'No problem — the attendance registers and the number of booklets distributed are sufficient evidence that awareness rose' },
          ],
          correct: 0,
          feedback: {
            ar: 'غياب خط الأساس يجعل أي ادعاء بالتغيير غير قابل للإثبات. يمكن قياس الوعي (اختبار قبلي/بعدي، مقابلات) لكن يجب أن يحدث القياس قبل التدخّل.',
            en: 'The absence of a baseline makes any claim of change impossible to prove. Awareness can be measured (pre/post-test, interviews) but the measurement must happen before the intervention.',
          },
        },
        {
          type: 'quiz',
          id: 'me-q4',
          label: { ar: 'سؤال ٤', en: 'Question 4' },
          question: {
            ar: 'تريد قياس أثر برنامج تدريبي على قدرة المتطوّعين في كتابة التقارير. ما المؤشّر الأنسب؟',
            en: 'You want to measure the impact of a training programme on volunteers\' ability to write reports. What is the most appropriate indicator?',
          },
          options: [
            { ar: 'نسبة التقارير المكتملة (لها كل عناصر التقرير الجيّد) مقارنة بما قبل التدريب', en: 'Percentage of reports that are complete (containing all good-report elements) compared to before training' },
            { ar: 'عدد التقارير المكتوبة خلال الأشهر الثلاثة التالية للتدريب ونسبة ما سُلّم منها في موعده', en: 'Number of reports written in the three months after training and the proportion of them submitted on time' },
            { ar: 'رضا المشرفين عن التقارير على مقياس من ١ إلى ١٠ يُجمع في نهاية كل شهر ويُقارن بين الفرق', en: 'Supervisor satisfaction with reports on a scale of 1 to 10, collected at each month end and compared across teams' },
          ],
          correct: 0,
          feedback: {
            ar: 'المقارنة قبل/بعد بمعيار محدّد (اكتمال التقرير) هي الأقرب لقياس الأثر. عدد التقارير مخرج لا نتيجة، ورضا المشرفين وحده ذاتي ويحتاج معيار واضح.',
            en: 'A before/after comparison using a specific criterion (report completeness) is the closest to measuring outcome. Number of reports is an output not an outcome, and supervisor satisfaction alone is subjective and needs a clear standard.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'me-data',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'جمع البيانات وجودتها', en: 'Data collection and quality' },
      lede: {
        ar: 'بيانات سيّئة وثّقت بإتقان لا تزال بيانات سيّئة — والجداول لا تُصحّح الأسئلة الخاطئة.',
        en: 'Bad data documented beautifully is still bad data — and spreadsheets do not correct for wrong questions.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'جودة البيانات لها أربعة أبعاد رئيسية في السياق الإنساني والمجتمعي: الصحّة (هل البيانات تعكس الواقع؟)، الاكتمال (هل كل من يجب قياسه قد قيس؟)، التوقيت (هل جُمعت في الوقت المناسب؟)، والأخلاقيات (هل جُمعت بموافقة وبشكل آمن؟).\n\nالمشكلة الأكثر شيوعاً في تقارير المشاريع: الاختيار المتحيّز للبيانات. يُعرض ما يدعم النجاح ويُهمَل ما يكشف الإخفاقات. هذا ليس قرار فرد — بل ثقافة تنظيمية تعاقب على نقل الأخبار السيّئة. الحلّ: أُطر تقارير مُقنَّنة تطلب صراحةً ما لم يُنجز وما جرى بشكل مختلف عن المتوقّع.',
            en: 'Data quality has four main dimensions in humanitarian and community contexts: accuracy (does the data reflect reality?), completeness (has everyone who should be measured been measured?), timeliness (was it collected at the right time?), and ethics (was it collected with consent and safely?).\n\nThe most common problem in project reports: biased data selection. What supports success is presented; what reveals failures is omitted. This is not an individual decision — it is an organisational culture that punishes the bearer of bad news. The solution: standardised reporting frameworks that explicitly ask for what was not delivered and what went differently from expected.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'قبل الجمع: ما السؤال المحدّد الذي تجيب عنه هذه البيانات؟',
              'أثناء الجمع: هل المجيبون يفهمون الأسئلة بنفس الطريقة؟',
              'بعد الجمع: هل هناك قيم مفقودة تُضعف الصورة الكاملة؟',
              'قبل الاستخدام: هل جُمعت البيانات بموافقة واضحة؟ هل ستُخزَّن بأمان؟',
            ],
            en: [
              'Before collection: what is the specific question these data answer?',
              'During collection: are respondents interpreting questions the same way?',
              'After collection: are there missing values that weaken the full picture?',
              'Before use: were data collected with clear consent? Will they be stored securely?',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'جودة البيانات في السياق التطوّعي لها تحدّيات خاصّة لا تواجهها المنظّمات الكبرى ذات الفرق المتخصّصة. في كثير من الأحيان، يكون جامع البيانات متطوّعاً يُؤدّي هذه المهمة جانباً إلى مهمّته الأساسية، في ظروف ميدانية متغيّرة، مع مستفيدين لا يُجيدون دائماً اللغة المكتوبة أو يُعبّرون عن رأيهم بأريحية أمام الغرباء. هذا يُنشئ هشاشة خاصّة تحتاج معالجة واعية لا مجرّد الأمل في أن "الأرقام ستتطابق".\n\nأربعة مبادئ تُرسّخ جودة البيانات في هذا السياق: أولاً التبسيط قبل التجميع — أداة الجمع التي تأخذ أكثر من عشر دقائق لملئها ستُملأ بتسرّع في أحسن الأحوال وستُفقَد في الأسوأ، وكلّما كانت الأداة أبسط وأكثر تركيزاً كانت جودة البيانات أعلى. ثانياً تدريب الجامعين — الاستبيان الجيّد لا يُغني عن جامع متدرّب يفهم لماذا يُجمع كل سؤال تحديداً، فيطرحه بأمانة ويُلاحظ إجابات ملتبسة تحتاج توضيحاً. ثالثاً المراجعة الفورية — فحص الاستمارات في نهاية كل يوم ميداني يكشف الأخطاء وهي قابلة للتصحيح. رابعاً الأخلاقيات كجزء من الجودة — البيانات المجموعة دون موافقة واضحة أو التي تعرّض هوية أفراد للخطر لا يجوز استخدامها مهما كانت دقّتها الإحصائية.',
            en: 'Data quality in the volunteering context has specific challenges not faced by large organisations with specialist teams. Often the data collector is a volunteer doing this as a side task alongside their main role, in variable field conditions, with beneficiaries who are not always comfortable writing or expressing opinions freely to strangers. This creates a particular fragility that needs thoughtful handling, not merely hoping that "the numbers will add up."\n\nFour principles reinforce data quality in this context: first, simplify before collecting — a collection tool that takes more than ten minutes to fill will be filled hastily at best and lost at worst; the simpler and more focused the tool, the higher the data quality. Second, train the collectors — a good questionnaire does not replace a trained collector who understands why each specific question is being collected, asks it faithfully, and notices ambiguous answers that need clarification. Third, review immediately — checking forms at the end of each field day reveals errors while they are still correctable. Fourth, ethics as part of quality — data collected without clear consent or that exposes individuals\' identities to risk may not be used regardless of its statistical accuracy.',
          },
        },
        {
          type: 'quiz',
          id: 'me-q5',
          label: { ar: 'سؤال ٥', en: 'Question 5' },
          question: {
            ar: 'جمعت استبيانات رضا وكان معدّل الاستجابة ٢٢٪. هل تستخدم النتائج في التقرير الرئيسي؟',
            en: 'You collected satisfaction questionnaires and the response rate was 22%. Do you use the results in the main report?',
          },
          options: [
            { ar: 'تذكر النتائج مع تحفّظ واضح: معدّل الاستجابة المنخفض يُضعف تمثيلية البيانات', en: 'Mention the results with a clear caveat: the low response rate weakens the representativeness of the data' },
            { ar: 'لا تستخدمها — ٢٢٪ أدنى من أن يُبنى عليها استنتاج، فتُترك جانباً ويُعاد الاستبيان في الدورة القادمة بعيّنة أوسع', en: 'Do not use them — 22% is too low to build any conclusion on, so leave them out and repeat the survey next cycle with a wider sample' },
            { ar: 'تستخدمها بشكل كامل لأن من أجابوا اختاروا ذلك طوعاً، والإجابة الطوعية أصدق من إجابة مفروضة', en: 'Use them fully because those who answered chose to do so voluntarily, and a voluntary answer is more candid than a forced one' },
          ],
          correct: 0,
          feedback: {
            ar: 'معدّل الاستجابة المنخفض لا يُلغي البيانات لكنه يُضيّق نطاق الاستنتاج. الذكر مع التحفّظ أمانة علمية — الاستخدام الكامل يُضلّل، والتجاهل الكلي يُضيّع معلومة جزئية مفيدة.',
            en: 'A low response rate does not invalidate data but narrows what can be concluded. Mentioning with a caveat is scientific honesty — full use misleads, complete omission wastes a partially useful piece of information.',
          },
        },
        {
          type: 'quiz',
          id: 'me-q6',
          label: { ar: 'سؤال ٦', en: 'Question 6' },
          question: {
            ar: 'بعد تحليل بيانات جلسة تدريبية، وجدت أن المشاركين من المدينة أجابوا بشكل مختلف جداً عن المشاركين من الأرياف. ماذا تفعل بهذه الملاحظة؟',
            en: 'After analysing data from a training session, you find that urban participants responded very differently from rural ones. What do you do with this finding?',
          },
          options: [
            { ar: 'تُبرز هذا الفرق في التقرير وتحلّله — فهو قد يكشف احتياجاً تصميمياً مختلفاً', en: 'Highlight this difference in the report and analyse it — it may reveal a different design need' },
            { ar: 'تحسب المعدّل الإجمالي فقط لأن التقرير لا يحتاج هذا القدر من التعقيد والمانح طلب رقماً واحداً', en: 'Calculate only the overall average because the report does not need this much complexity and the funder asked for one figure' },
            { ar: 'تستبعد بيانات المجموعة الأقل عدداً للحصول على صورة أوضح وعيّنة أكثر تجانساً', en: 'Exclude the data of the smaller group to get a clearer picture and a sample that is more homogeneous' },
          ],
          correct: 0,
          feedback: {
            ar: 'التباين بين المجموعات معلومة قيّمة — ليست ضوضاء يجب إزالتها. كثيراً ما تكشف هذه الفوارق أن التدخّل الواحد لا يناسب سياقات مختلفة بنفس الكفاءة.',
            en: 'Variation between groups is valuable information — not noise to be removed. These differences often reveal that a single intervention does not serve different contexts equally well.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'me-reporting',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'التقرير الصادق', en: 'The honest report' },
      lede: {
        ar: 'التقرير الذي يُخفي ما لم يُنجز لا يُغري مانحاً بالتمويل مجدّداً — يُغريه بتمويل وهم.',
        en: 'A report that hides what was not delivered does not persuade a funder to give again — it persuades them to fund an illusion.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'تقرير الأثر الصادق يختلف عن التقرير الترويجي في شيء واحد حاسم: يذكر ما لم يُنجز وما لم يُحقَّق ويشرح السبب. هذا ليس اعترافاً بالفشل — بل تقرير احترافي يُبني الثقة مع المانح والمجتمع أكثر من تقرير مثالي مصطنع.\n\nبنية التقرير الصادق تشمل: ماذا خطّطنا وماذا نفّذنا بالفعل؟ ما النتائج التي حقّقناها والتي لم نحقّقها؟ ما السياق الذي أثّر في الأداء؟ ماذا تعلّمنا وكيف سنُعدّل في الدورة القادمة؟ التقرير الذي يجيب عن هذه الأسئلة لا يحتاج تضخيماً — بل يجعل المستفيد القادم أفضل حالاً مما كان.',
            en: 'An honest impact report differs from a promotional one in one crucial way: it states what was not delivered and not achieved, and explains why. This is not an admission of failure — it is a professional report that builds more trust with the funder and community than a fabricated perfect report.\n\nThe honest report structure includes: what did we plan and what did we actually deliver? Which outcomes did we achieve and which did we not? What context affected performance? What did we learn and how will we adjust next time? A report that answers these questions does not need inflation — and it leaves the next beneficiary better positioned than before.',
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'لماذا يضرّ التضخيم؟', en: 'Why does inflation cause harm?' },
          content: {
            ar: 'حين تضخّم جمعية أرقام أثرها، يتخذ المانح قراره التمويلي على معطيات مغلوطة. يُموَّل برنامج يبدو فعّالاً أكثر مما هو. وينقص التمويل عن برنامج آخر ربما أكثر صدقاً وأقل تضخيماً. على المدى البعيد، تنحرف الموارد نحو من يروي الحكاية الأجمل لا نحو من يُحدث الفرق الحقيقي.',
            en: 'When an organisation inflates its impact figures, the funder makes their funding decision on false data. A programme that appears more effective than it is gets funded. Another programme, perhaps more honest and less inflated, gets less. Over time, resources drift toward whoever tells the best story, not toward whoever makes the real difference.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الفجوة بين التقييم والتحسين هي الفجوة الأكثر شيوعاً في منظّمات التطوّع. تُجمَع البيانات ويُكتَب التقرير، ثم يُوضَع على الرف وتبدأ الدورة التالية كما لو أن التقييم لم يحدث. هذا الانفصال يُهدر الوقت والموارد وثقة المستفيدين الذين أجابوا على أسئلة لم تُفضِ لشيء ملموس يمسّ حياتهم.\n\nترجمة نتائج التقييم إلى تحسين تتطلّب ثلاث خطوات منظّمة. أولاً تحديد ما يمكن تغييره: ليست كل نتيجة سلبية تحتاج استجابة فورية — بعضها هيكلي يحتاج وقتاً وقراراً أعلى، وبعضها خارج سيطرة الجمعية. التمييز بين هذين النوعين يُوجّه الطاقة نحو ما يمكن فيه أثر فعلي. ثانياً صياغة قرارات محدّدة قابلة للتتبّع: "سنُحسّن التواصل مع المستفيدين" ليست قراراً بل نيّة، والقرار هو تحديد الإجراء والمسؤول والموعد بدقّة. ثالثاً بناء التغيير في دورة التخطيط التالية: القرارات المستخلصة من التقييم لا تبقى في تقريره — بل تُدرَج في خطة المشروع القادم كبنود واضحة مع تحديد من يتابع تطبيقها ومتى يُرصد أثرها.\n\nمعيار نجاح التقييم الفعلي ليس جمال التقرير — بل قدرة المنظّمة على أن تُثبت أن قراراً ما في المشروع التالي اختلف بسبب ما عرفته من هذا التقييم.',
            en: 'The gap between evaluation and improvement is the most common gap in volunteering organisations. Data is collected, a report is written, then it is placed on a shelf and the next cycle starts as if the evaluation never happened. This disconnect wastes time, resources, and the trust of beneficiaries who answered questions that led to nothing tangible affecting their lives.\n\nTranslating evaluation findings into improvement requires three organised steps. First, identifying what can be changed: not every negative finding needs an immediate response — some are structural and require time and a higher decision, and some are outside the organisation\'s control. Distinguishing between these two types directs energy toward where real effect is possible. Second, forming specific traceable decisions: "we will improve communication with beneficiaries" is not a decision but an intention; a decision specifies the procedure, the responsible person, and the deadline precisely. Third, building the change into the next planning cycle: decisions drawn from the evaluation do not stay in the evaluation report — they are incorporated into the next project plan as clear items with defined follow-up and measurement timing.\n\nThe real measure of evaluation success is not the beauty of the report — it is the organisation\'s ability to demonstrate that some decision in the next project differed because of what it learned from this evaluation.',
          },
        },
        {
          type: 'quiz',
          id: 'me-q7',
          label: { ar: 'سؤال ٧', en: 'Question 7' },
          question: {
            ar: 'مشروع حقّق ٧٠٪ من أهدافه. المانح يطلب تقريراً. كيف تقدّم النتائج؟',
            en: 'A project achieved 70% of its targets. The funder requests a report. How do you present the results?',
          },
          options: [
            { ar: 'تُقدّم ٧٠٪ بكل تفاصيل ما أُنجز وما لم يُنجز، مع تحليل الأسباب والدروس المستفادة', en: 'Present 70% with full details of what was and was not delivered, along with cause analysis and lessons learned' },
            { ar: 'تُقدّم النتائج المكتملة فقط وتُرجئ ذكر الناقص لتقرير لاحق', en: 'Present only completed results and defer mention of shortfall to a later report' },
            { ar: 'تُعيد تعريف الأهداف لتُلاءم ما أُنجز فعلاً وتُقدّم ١٠٠٪', en: 'Redefine the targets to match what was actually delivered and present 100%' },
          ],
          correct: 0,
          feedback: {
            ar: 'التقرير الصادق يُقدّم ٧٠٪ مع فهم الـ ٣٠٪. إعادة تعريف الأهداف غشٌّ. تأجيل الناقص تلاعب بالتوقيت.',
            en: 'An honest report presents 70% with an understanding of the 30%. Redefining targets is fraud. Deferring the shortfall is timing manipulation.',
          },
        },
        {
          type: 'quiz',
          id: 'me-q8',
          label: { ar: 'سؤال ٨', en: 'Question 8' },
          question: {
            ar: 'مشرفك يقترح "صياغة إيجابية" لنتيجة سلبية في التقرير. ما حدود ما تقبله؟',
            en: 'Your supervisor suggests "positive framing" for a negative result in the report. What is the limit of what you accept?',
          },
          options: [
            { ar: 'يمكن تقديم النتائج السلبية بلغة بنّاءة دون تغيير الحقائق أو إخفاء الأرقام', en: 'Negative results can be presented in constructive language without changing facts or hiding figures' },
            { ar: 'الصياغة الإيجابية مقبولة دائماً لأن الهدف تشجيع الفريق والمانح على مواصلة العمل', en: 'Positive framing is always acceptable because the goal is to encourage the team and the funder to keep going' },
            { ar: 'يجب رفض أي تعديل على الصياغة ما لم يوافق عليه المانح كتابةً قبل إرسال التقرير', en: 'Any change to the wording must be refused unless the funder approves it in writing before the report is sent' },
          ],
          correct: 0,
          feedback: {
            ar: 'اللغة البنّاءة مقبولة: "لم نبلغ الهدف بسبب X وسنُعدّل بـ Y" تختلف عن "حقّقنا نتائج مهمّة في مجال Z". الأولى صادقة وإيجابية، الثانية تتهرّب من الحقيقة.',
            en: 'Constructive language is acceptable: "we did not reach the target due to X and will adjust by Y" differs from "we achieved significant results in area Z". The first is honest and constructive; the second evades the truth.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'me-learning',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'التعلّم المؤسّسي والمعرفة المتراكمة', en: 'Organisational learning and accumulated knowledge' },
      lede: {
        ar: 'التقييم الذي ينتهي بتقرير لا يُقرأ لم يُقيَّم — بل أُهدرت وقته وموارده.',
        en: 'An evaluation that ends with a report nobody reads has not evaluated anything — it has wasted time and resources.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التعلّم المؤسّسي يعني أن التجارب تُبنى فوق بعضها لا تُعاد اختراعاً من الصفر. المشروع الذي لا يُوثَّق لا يُعلَّم منه — وكثيراً ما يُعيد المشروع التالي الأخطاء نفسها بحسن نية تامة.\n\nالأداة البسيطة هي دورة التعلّم: خطّط، نفّذ، راجع، عدّل. مرحلة "راجع" ليست تقييماً عاملاً بمعزل عن البقية — بل لحظة منظّمة تُسأل فيها: ماذا جرى بالضبط؟ ما الذي نفهمه الآن ولم نفهمه في البداية؟ ماذا نُغيّر في الدورة القادمة؟\n\nمعيار نجاح التقييم ليس جمال التقرير — بل وجود قرار مختلف في المشروع التالي بسبب ما عرفناه.',
            en: 'Organisational learning means that experiences build on each other rather than being reinvented from scratch. A project that is not documented teaches nothing — and the next project often repeats the same mistakes with complete good intentions.\n\nThe simple tool is the learning cycle: plan, implement, review, adjust. The "review" phase is not a standalone evaluation exercise — it is a structured moment where you ask: what exactly happened? What do we understand now that we did not at the start? What do we change next time?\n\nThe measure of evaluation success is not the beauty of the report — it is whether the next project makes a different decision because of what we learned.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'التواصل حول نتائج التقييم مع المجتمع يختلف جذرياً عن التقرير المقدَّم للمانح. المانح يريد بيانات وتحليلاً ومنهجية موثّقة. المجتمع يريد أن يفهم: ماذا فعلتم؟ هل أحدثتم فرقاً حقيقياً في حياة الناس؟ وهل أنتم تستمعون فعلاً لما يُقال عنكم؟ هذه أسئلة مختلفة تتطلّب أسلوباً مختلفاً.\n\nالتواصل الجيّد للنتائج مع المجتمع يشمل أربعة عناصر. الوضوح: استخدام لغة يومية لا مصطلحات تقنية — "ارتفعت نسبة الأطفال الحاضرين للجلسات من أربعين إلى خمسة وسبعين بالمئة" أوضح من "حقّقنا زيادة ملحوظة في مؤشّر الحضور". الصدق: ذكر ما لم يُنجز بجانب ما أُنجز — المجتمع الذي يرى جمعية تعترف بإخفاقاتها بشكل بنّاء يمنحها ثقة أعمق من الذي يسمع قصص نجاح متتالية لا تتوقّف. التفاعلية: النتائج ليست بياناً أحادياً يُلقى على المجتمع بل دعوة لحوار — "هذا ما وجدنا، ماذا تفكّرون؟ ما الذي يُفسّر هذه النتائج من وجهة نظركم؟". الاستمرارية: التواصل عن النتائج ليس حدثاً سنوياً بل ممارسة منتظمة، والجمعية التي تُبقي مجتمعها على اطّلاع دوري تبني رأسمالاً اجتماعياً يُصعب انتزاعه.',
            en: 'Communicating evaluation findings to the community differs fundamentally from the report submitted to the funder. The funder wants documented data, analysis, and methodology. The community wants to understand: what did you do? Did you make a real difference in people\'s lives? And are you genuinely listening to what is being said about you? These are different questions requiring a different approach.\n\nGood communication of findings to the community includes four elements. Clarity: using everyday language not technical terminology — "the proportion of children attending sessions rose from forty to seventy-five percent" is clearer than "we achieved a notable increase in the attendance indicator." Honesty: mentioning what was not accomplished alongside what was — the community that sees an organisation acknowledge its shortcomings constructively grants it deeper trust than one that hears successive success stories that never pause. Interactivity: findings are not a one-way statement delivered to the community but an invitation to dialogue — "this is what we found; what do you think? What explains these findings from your perspective?" Continuity: communicating about findings is not an annual event but a regular practice, and the organisation that keeps its community regularly informed builds a social capital that is difficult to erode.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'أدوات جمع البيانات المختلفة تُعطيك صوراً مختلفة عن نفس الواقع — لا صورة واحدة منها كاملة. المقابلات الفردية تُعطيك العمق والسياق والتفاصيل الدقيقة التي لا تظهر في أي استبيان، لكنها وقت مكثّف وعيّنتها محدودة. الاستبيانات تُعطيك نطاقاً أوسع وبيانات قابلة للمقارنة، لكنها تُضيّق الإجابة في خيارات مُسبقة قد لا تعكس ما يريد قوله المستفيد فعلاً. الملاحظة الميدانية المباشرة تُخبرك بما يحدث بالفعل لا ما يُقال أنه يحدث — وهذا الفرق جوهري في تقييم البرامج الاجتماعية حيث يُجيب الناس أحياناً بما يظنّون أنك تريد سماعه.\n\nالنهج المختلط يدمج طرائق متعدّدة للوصول إلى صورة أكثر اكتمالاً: استبيان كمّي يُحدّد الأنماط، ثم مقابلات نوعية تُفسّر تلك الأنماط وتُضيف السياق البشري. الرقم يُخبرك أن سبعين بالمئة من المشاركين أفادوا بتحسّن مهاراتهم — المقابلة تُخبرك لماذا الثلاثين الباقون لم يُفيدوا بذلك، وما الذي كان ينقصهم.',
            en: 'Different data collection tools give you different pictures of the same reality — no single picture is complete. Individual interviews give you depth, context, and fine detail that appear in no survey, but they are time-intensive and their sample is limited. Surveys give you broader reach and comparable data, but they constrain answers to pre-set options that may not reflect what the beneficiary actually wants to say. Direct field observation tells you what actually happens, not what is said to happen — and this difference is fundamental in evaluating social programmes where people sometimes answer with what they think you want to hear.\n\nA mixed approach combines multiple methods for a more complete picture: a quantitative survey identifying patterns, then qualitative interviews interpreting those patterns and adding human context. The number tells you that seventy percent of participants reported improvement in their skills — the interview tells you why the remaining thirty did not, and what they were missing.',
          },
        },
        {
          type: 'quiz',
          id: 'me-q9',
          label: { ar: 'سؤال ٩', en: 'Question 9' },
          question: {
            ar: 'أنهيت تقرير تقييم شاملاً. ما الخطوة التالية لضمان أن التعلّم يصل للمشروع القادم؟',
            en: 'You have completed a comprehensive evaluation report. What is the next step to ensure the learning reaches the next project?',
          },
          options: [
            { ar: 'حدّد القرارات المحدّدة التي يجب أن تتغيّر في المشروع القادم بناءً على التقرير، وأدرجها في وثيقة التخطيط التالية', en: 'Identify the specific decisions that must change in the next project based on the report, and include them in the next planning document' },
            { ar: 'أرسل التقرير لكل أعضاء الفريق واطلب من كل واحد منهم ملاحظاته المكتوبة وانتظر وصولها جميعاً قبل إغلاق ملف المشروع', en: 'Send the report to every team member, ask each of them for written comments, and wait until all the comments have come back before closing the file' },
            { ar: 'أرشف التقرير في مجلّد المشروع المشترك وأتحه لمن يرغب في الرجوع إليه عند التخطيط لاحقاً', en: 'Archive the report in the shared project folder and make it available to anyone who wants to consult it when planning later' },
          ],
          correct: 0,
          feedback: {
            ar: 'الأرشفة والإرسال وحدهما لا يُعلِّمان — الترجمة الفعلية للتعلّم تكون حين يتغيّر قرار مكتوب في الخطة التالية بسبب ما وُجد في التقييم.',
            en: 'Archiving and sending alone do not teach — real learning translation happens when a written decision in the next plan changes because of what was found in the evaluation.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'ترجمة نتائج التقييم إلى قرارات قابلة للتنفيذ هي الفرق بين التقييم الذي يُغيّر والتقييم الذي يُحفظ. قبل إغلاق أي تقرير تقييم، اسأل: ما القرار المحدّد الذي يجب أن يتغيّر في المشروع القادم بناءً على هذه النتيجة؟ من المسؤول عن هذا التغيير؟ وما المهلة الزمنية؟ هذه الأسئلة الثلاثة تُحوّل التقييم من وثيقة تحليلية إلى خطّة عمل.\n\nالأنماط المتكرّرة في تقارير التقييم تستحق مُعالجة هيكلية لا مُعالجة تكرارية. حين يظهر نفس الضعف في ثلاثة مشاريع متتالية، ذلك ليس مشكلة تشغيلية — بل مشكلة في التصميم تستوجب مراجعة عملية النظام نفسها.\n\nمنهجية التعلّم المؤسّسي تبدأ بأرشيف تقييمات يمكن البحث فيه والوصول إليه. حين تُخطّط لمشروع جديد في نفس المجال أو المنطقة أو مع نفس الفئة المستهدفة، أوّل سؤال يجب طرحه: ماذا علّمنا التقييم السابق في هذا السياق؟ المنظّمة التي تجيب على هذا السؤال بسرعة وبأمثلة محدّدة هي منظّمة تتعلّم فعلاً.\n\nتوثيق القرارات التي اتُّخذت بناءً على نتائج التقييم يُبني ذاكرة مؤسّسية لا تُضيع مع دورات قيادية جديدة. حين يُعيّن منسّق جديد للبرنامج، وثيقة التقييم السابقة يجب أن تُجيبه: ماذا كان يعمل، ولماذا قرّرنا تغيير هذا الجانب. هذا هو الفرق بين مؤسّسة تراكم حكمتها ومؤسّسة تبدأ من الصفر في كل دورة.',
            en: 'Translating evaluation findings into actionable decisions is the difference between an evaluation that changes things and one that gets stored. Before closing any evaluation report, ask: what specific decision must change in the next project based on this finding? Who is responsible for this change? And what is the timeline? These three questions transform an evaluation from an analytical document into an action plan.\n\nRecurring patterns in evaluation reports deserve structural treatment rather than repeated treatment. When the same weakness appears in three consecutive projects, that is not an operational problem — but a design problem requiring review of the system process itself.\n\nA method for organisational learning starts with an archive of evaluations that can be searched and reached. When you are planning a new project in the same field, the same area, or with the same target group, the first question to ask is: what did the previous evaluation teach us in this context? The organisation that answers that question quickly and with specific examples is an organisation that genuinely learns.\n\nDocumenting the decisions taken on the basis of evaluation findings builds an institutional memory that is not lost when leadership turns over. When a new programme coordinator is appointed, the previous evaluation document should answer them: what was working, and why we decided to change this particular aspect. That is the difference between an institution that accumulates its wisdom and one that starts from zero every cycle.',
          },
        },
        {
          type: 'quiz',
          id: 'me-q10',
          label: { ar: 'سؤال ١٠', en: 'Question 10' },
          question: {
            ar: 'تقرير تقييم من مشروع سابق يقول: "توقيت التدريب في شهر رمضان أثّر سلباً على الحضور". ما الاستجابة المثلى في التخطيط للمشروع الجديد؟',
            en: 'An evaluation report from a previous project states: "scheduling training during Ramadan negatively affected attendance." What is the ideal response in planning the new project?',
          },
          options: [
            { ar: 'تُدرج في جدول المشروع الجديد تجنّب تدريبات كثيفة في الشهر الكريم وتُثبّت السبب في وثيقة التخطيط', en: 'Include in the new project schedule avoiding intensive training during Ramadan and document the reason in the planning document' },
            { ar: 'تنتظر حتى تتأكّد من أن هذا يُثبَّت في السياق الجديد أيضاً', en: 'Wait until you confirm this applies in the new context too' },
            { ar: 'تضع ملاحظة في التقرير المؤسّسي وتتركها للفريق ليقرّر', en: 'Add a note in the institutional report and leave it to the team to decide' },
          ],
          correct: 0,
          feedback: {
            ar: 'الدرس الجاهز لا يُطبَّق إن لم يُترجَم لقرار مُدوَّن في الخطة. "تجنّب التدريب الكثيف في رمضان" قرار يُكتب — ليس ملاحظة تُذكر وتُنسى.',
            en: 'A ready lesson is not applied unless it is translated into a written decision in the plan. "Avoid intensive training in Ramadan" is a decision to be written — not a note to be mentioned and forgotten.',
          },
        },
      ],
    },
  ],
};
