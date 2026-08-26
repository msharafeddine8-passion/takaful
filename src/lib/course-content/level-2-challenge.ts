import type { CourseContent } from './types';

/**
 * Level 2 Challenge — Planning a Field Day.
 *
 * This is an assessment, not a teaching course. Every scenario here draws on
 * something a volunteer should have already learned in the five level 2 courses:
 * how to plan under pressure (life-skills), what to write down (documentation),
 * what to do when something goes wrong (field-safety), what the camera may or
 * may not capture (media-and-content), and what to do before the ambulance
 * arrives (first-aid-basics).
 *
 * The field day below unfolds in real time. Each module is a moment in that
 * day, and each question is a decision the volunteer has to make with what they
 * already know.
 */

export const levelTwoChallenge: CourseContent = {
  slug: 'level-2-challenge',
  level: 2,
  minutes: 30,
  passMark: 70,
  title: {
    ar: 'مراجعة المستوى الثاني: تخطيط يوم ميداني',
    en: 'Level 2 Review: Planning a Field Day',
  },
  lede: {
    ar: 'خطّط يوماً ميدانياً كاملاً: جدول، توثيق، محتوى إعلامي، سجل مخاطر — ثم تقع حالة طارئة وترى ما إذا كانت خطتك تصمد.',
    en: 'Plan a whole field day: a schedule, documentation, media content, a risk log — then an emergency happens and you find out whether your plan holds.',
  },
  outcomes: {
    ar: [
      'تبني خطة يوم ميداني مكتملة بجدول ومسؤوليات وسجل مخاطر',
      'تتعامل مع حالة طارئة ضمن خطة كتبتها بنفسك',
      'توثّق ما جرى بصيغة يقرأها مشرف لم يحضر',
    ],
    en: [
      'Build a complete field-day plan with a schedule, responsibilities and a risk log',
      'Handle an emergency inside a plan you wrote yourself',
      'Document what happened in a form a supervisor who was not there can read',
    ],
  },
  sources: [
    'IFRC — Volunteering Policy and Standards for Field Activities (2022)',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
    'UNDRR — Principles of Emergency Preparedness for Community Events',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'l2c-planning',
      tag: { ar: 'المرحلة الأولى', en: 'Stage 1' },
      title: { ar: 'قبل الوصول: التخطيط والتقييم', en: 'Before arrival: planning and assessment' },
      lede: {
        ar: 'الساعة الثامنة صباحاً. النشاط يبدأ في العاشرة. أمامك ساعتان وقائمة مهام ناقصة.',
        en: 'Eight in the morning. The activity starts at ten. You have two hours and an incomplete task list.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'أنت منسّق نشاط تطوّعي في ملعب مدرسي مفتوح. الحضور المتوقّع: أربعون طفلاً بين ثماني وثلاث عشرة سنة، وعشرة متطوّعين. المنظّم الذي كان مسؤولاً عن سجل المخاطر اعتذر أمس. الملف موجود لكنه ناقص. قرّرت إكماله.',
            en: 'You are coordinating a volunteer activity at an open school grounds. Expected attendance: forty children aged eight to thirteen, and ten volunteers. The organiser who was responsible for the risk log excused himself yesterday. The file exists but is incomplete. You have decided to complete it.',
          },
        },
        {
          type: 'quiz',
          id: 'l2c-q1',
          label: { ar: 'سؤال ١', en: 'Question 1' },
          question: {
            ar: 'عند مراجعة سجل المخاطر وجدت بنداً واحداً فقط: "الطقس السيئ". ما الخطوة الأولى الصحيحة؟',
            en: 'Reviewing the risk log, you find only one entry: "bad weather". What is the correct first step?',
          },
          options: [
            { ar: 'امشِ في الملعب بعينَي أحد المشاركين وأضف ما تراه', en: 'Walk the grounds through a participant\'s eyes and add what you see' },
            { ar: 'أضف بنداً عاماً: "مخاطر متوقّعة" وأرسل الملف', en: 'Add a general entry: "expected risks" and send the file' },
            { ar: 'اعتمد السجل كما هو لأن النشاط في الهواء الطلق وليس خطيراً', en: 'Accept the log as-is since the activity is outdoors and not dangerous' },
          ],
          correct: 0,
          feedback: {
            ar: 'التقييم الجيّد يبدأ بالمشي في المكان بنظرة المستخدم، لا بالجلوس وإضافة بنود عامة. الطقس بند واحد من عشرين.',
            en: 'A good assessment starts with walking the venue through a user\'s eyes, not sitting and adding general entries. Weather is one item out of twenty.',
          },
        },
        {
          type: 'quiz',
          id: 'l2c-q2',
          label: { ar: 'سؤال ٢', en: 'Question 2' },
          question: {
            ar: 'وجدت بوّابة معدنية حادّة الحواف قرب منطقة اللعب. كيف تسجّل هذا الخطر في السجل؟',
            en: 'You find a metal gate with sharp edges near the play area. How do you record this risk in the log?',
          },
          options: [
            { ar: 'الخطر: بوّابة حادّة | الاحتمال: متوقّع | الأثر: جسيم | الإجراء: لفّها بقماش مؤقتاً وتحديد المسؤول', en: 'Risk: sharp gate | Likelihood: probable | Impact: serious | Action: wrap temporarily and assign responsible person' },
            { ar: 'الخطر: معدات خطرة | لا إجراء لأن الأطفال سيتجنّبونها تلقائياً', en: 'Risk: dangerous equipment | No action because children will naturally avoid it' },
            { ar: 'الخطر: بوّابة | الاحتمال: ممكن | الإجراء: تنبيه شفهي للمتطوّعين', en: 'Risk: gate | Likelihood: possible | Action: verbal warning to volunteers' },
          ],
          correct: 0,
          feedback: {
            ar: 'كل بند في سجل المخاطر يحتاج: وصف الخطر، احتمال وقوعه، حجم الأثر، إجراء محدّد، واسم من يتابع. التنبيه الشفهي يُنسى في أول ضجّة.',
            en: 'Every risk entry needs: description, likelihood, impact severity, specific action, and the name of who follows through. A verbal warning disappears at the first moment of noise.',
          },
        },
        {
          type: 'quiz',
          id: 'l2c-q3',
          label: { ar: 'سؤال ٣', en: 'Question 3' },
          question: {
            ar: 'أحد المتطوّعين يقترح أن تبدأ النشاط الساعة التاسعة والنصف بدل العاشرة لأن الجو مناسب. لديك مهام تحضيرية لم تنتهِ. ماذا تفعل؟',
            en: 'A volunteer suggests starting at nine-thirty instead of ten because the weather is good. You have preparation tasks unfinished. What do you do?',
          },
          options: [
            { ar: 'ترفض التبكير وتُكمل التحضير حتى تضمن السلامة قبل وصول الأطفال', en: 'Decline the early start and complete preparation until safety is assured before children arrive' },
            { ar: 'توافق لأن رضا الفريق مهم وبقية المهام ستنتهي بعد البداية', en: 'Agree because team morale matters and remaining tasks can finish after starting' },
            { ar: 'تسأل الأطفال ما يريدون', en: 'Ask the children what they prefer' },
          ],
          correct: 0,
          feedback: {
            ar: 'التحضير السليم ليس ترفاً — هو الفارق بين نشاط آمن وحادث يمكن تجنّبه. الجو الجميل لا يُصلح بوّابة حادّة غير مؤمَّنة.',
            en: 'Proper preparation is not a luxury — it is the difference between a safe activity and an avoidable incident. Good weather does not fix an unsecured sharp gate.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'l2c-media',
      tag: { ar: 'المرحلة الثانية', en: 'Stage 2' },
      title: { ar: 'أثناء النشاط: التوثيق والإعلام', en: 'During the activity: documentation and media' },
      lede: {
        ar: 'النشاط يسير بشكل جيّد. متطوّع يسحب هاتفه ويبدأ بالتصوير. الأسئلة لا تنتظر.',
        en: 'The activity is going well. A volunteer takes out a phone and starts photographing. The questions do not wait.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'أحد المتطوّعين يصوّر مجموعة الأطفال ويريد رفع الصور فوراً على حساب الجمعية في وسائل التواصل. بعض الأطفال يبتسمون للكاميرا، ولم يُوقَّع على استمارات موافقة صريحة بالنشر الرقمي. لاحقاً، وقع حادث بسيط: طفل اصطدم بالجدار وكدم ركبته.',
            en: 'A volunteer is photographing the group of children and wants to post immediately on the organisation\'s social media. Some children are smiling at the camera, but no explicit digital publication consent forms have been signed. Later, a minor incident: a child bumped into the wall and bruised their knee.',
          },
        },
        {
          type: 'quiz',
          id: 'l2c-q4',
          label: { ar: 'سؤال ٤', en: 'Question 4' },
          question: {
            ar: 'المتطوّع يريد رفع الصور الآن. ماذا تفعل؟',
            en: 'The volunteer wants to post photos now. What do you do?',
          },
          options: [
            { ar: 'تطلب إيقاف النشر حتى التحقّق من توافر موافقات النشر الرقمي لكل طفل في الصور', en: 'Ask to halt posting until digital publication consent is confirmed for every child in the photos' },
            { ar: 'توافق لأن الأطفال يبتسمون وهذا يعني الرضا الضمني', en: 'Agree because the children are smiling, which implies implicit consent' },
            { ar: 'تطلب تمييع الوجوه في التطبيق ثم النشر', en: 'Ask to blur faces in an app then post' },
          ],
          correct: 0,
          feedback: {
            ar: 'الابتسامة ليست موافقة. الموافقة الصحيحة توثيق مكتوب، وعدم وجودها يعني عدم النشر — لا تمييع، لا محاصصة.',
            en: 'A smile is not consent. Proper consent is a written record; its absence means no posting — not blurring, not a middle ground.',
          },
        },
        {
          type: 'quiz',
          id: 'l2c-q5',
          label: { ar: 'سؤال ٥', en: 'Question 5' },
          question: {
            ar: 'الطفل الذي كدم ركبته يبكي. ما أول ما تفعله؟',
            en: 'The child who bruised their knee is crying. What is the first thing you do?',
          },
          options: [
            { ar: 'تُقيّم سلامة المكان، تطمئن الطفل، وتستدعي شخصاً مدرّباً إن احتجت', en: 'Assess the scene\'s safety, reassure the child, and call a trained person if needed' },
            { ar: 'تنقل الطفل فوراً لمكان أكثر راحة', en: 'Move the child immediately to a more comfortable place' },
            { ar: 'تتصل بالوالدين أولاً وتنتظر توجيهاتهم', en: 'Call the parents first and wait for their instructions' },
          ],
          correct: 0,
          feedback: {
            ar: 'قاعدة الإسعافات الأولية الأولى: قيّم المكان قبل أن تتحرّك. نقل مصاب قد يُضاعف الأذى إن كانت هناك إصابة خفيّة.',
            en: 'First aid rule one: assess the scene before you move. Moving an injured person may worsen hidden injury.',
          },
        },
        {
          type: 'quiz',
          id: 'l2c-q6',
          label: { ar: 'سؤال ٦', en: 'Question 6' },
          question: {
            ar: 'بعد أن استقر الطفل، ماذا تكتب في تقرير الحادث؟',
            en: 'After the child is stable, what do you write in the incident report?',
          },
          options: [
            { ar: 'الوقت والمكان وما جرى بالضبط دون تفسير أو رأي، واسم من قدّم المساعدة', en: 'Time, location, exactly what happened without interpretation or opinion, and the name of whoever helped' },
            { ar: 'ملاحظة مختصرة: "طفل كدم ركبته، تمّت معالجته"', en: 'A brief note: "child bruised knee, treated"' },
            { ar: 'تصف الحادث من وجهة نظرك وتضيف ما كان يمكن تجنّبه', en: 'Describe the incident from your perspective and add what could have been avoided' },
          ],
          correct: 0,
          feedback: {
            ar: 'تقرير الحادث يفصل الوقائع عن التفسيرات. "يمكن تجنّبه" رأي، والرأي ينتمي للتحليل اللاحق لا للتقرير.',
            en: 'An incident report separates facts from interpretations. "Could have been avoided" is an opinion, and opinions belong in the later analysis, not the report.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'l2c-emergency',
      tag: { ar: 'المرحلة الثالثة', en: 'Stage 3' },
      title: { ar: 'الطارئ الحقيقي', en: 'The real emergency' },
      lede: {
        ar: 'الساعة الثانية عشرة. أحد الأطفال يشكو من ضيق في التنفّس وشحوب واضح. هذا ليس كدمة.',
        en: 'Twelve noon. A child complains of difficulty breathing and looks pale. This is not a bruise.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'فجأة يتجمّع عدد من الأطفال حول طفلة تبلغ العاشرة. تبدو شاحبة وتتنفّس بصعوبة. أحد المتطوّعين يقول إنها تعاني من حساسية مزمنة. لا يوجد طبيب في الموقع. خطتك الطارئة تنصّ على نقطة تجمّع عند المدخل الشمالي ومسؤول سلامة اسمه أحمد.',
            en: 'Suddenly several children gather around a ten-year-old girl. She looks pale and is breathing with difficulty. A volunteer says she has chronic allergies. There is no doctor on site. Your emergency plan states an assembly point at the north entrance and a safety lead named Ahmed.',
          },
        },
        {
          type: 'quiz',
          id: 'l2c-q7',
          label: { ar: 'سؤال ٧', en: 'Question 7' },
          question: {
            ar: 'ما الخطوة الأولى والأسرع الآن؟',
            en: 'What is the first and fastest step right now?',
          },
          options: [
            { ar: 'اتصل بالإسعاف فوراً وأبعد الأطفال الآخرين بهدوء مع إبلاغ أحمد', en: 'Call emergency services immediately and calmly move other children away while alerting Ahmed' },
            { ar: 'ابحث في هاتفك عن أعراض الحساسية الشديدة قبل الاتصال', en: 'Search your phone for severe allergy symptoms before calling' },
            { ar: 'أعطها ماءً واطلب منها التنفّس ببطء', en: 'Give her water and ask her to breathe slowly' },
          ],
          correct: 0,
          feedback: {
            ar: 'ضيق التنفّس مع الشحوب حالة طارئة. الاتصال بالإسعاف يأتي أولاً دائماً — الدقيقة الأولى تحدد الفرق في الحالات التحسّسية الشديدة.',
            en: 'Breathing difficulty with pallor is an emergency. Calling emergency services always comes first — the first minute makes the difference in severe allergic cases.',
          },
        },
        {
          type: 'quiz',
          id: 'l2c-q8',
          label: { ar: 'سؤال ٨', en: 'Question 8' },
          question: {
            ar: 'متطوّع يقترح إعطاءها دواء حساسية موجود في حقيبته. ماذا تفعل؟',
            en: 'A volunteer suggests giving her an allergy medicine he has in his bag. What do you do?',
          },
          options: [
            { ar: 'ترفض: لا يجوز لمتطوّع إعطاء أدوية لطفل ليس طفله — انتظر المختص', en: 'Refuse: a volunteer must not administer medication to a child who is not their own — wait for a trained responder' },
            { ar: 'توافق إن كان الدواء معروفاً وغير منتهي الصلاحية', en: 'Agree if the medicine is known and not expired' },
            { ar: 'تسأل الطفلة إن كانت تريد الدواء', en: 'Ask the girl if she wants the medicine' },
          ],
          correct: 0,
          feedback: {
            ar: 'تقديم دواء لطفل مسؤولية طبية وقانونية لا تقع على عاتق المتطوّع. حدود الدور موجودة لحماية الطفل أولاً.',
            en: 'Administering medication to a child is a medical and legal responsibility that does not rest with the volunteer. Role limits exist to protect the child first.',
          },
        },
        {
          type: 'quiz',
          id: 'l2c-q9',
          label: { ar: 'سؤال ٩', en: 'Question 9' },
          question: {
            ar: 'بعد وصول الإسعاف وانتهاء الحالة، ماذا يجب أن يتضمّن تقريرك لمشرفك؟',
            en: 'After the ambulance arrives and the situation resolves, what must your report to your supervisor include?',
          },
          options: [
            { ar: 'التسلسل الزمني الكامل، ما جرى، من تصرّف وكيف، وما نتجت عنه القرارات', en: 'The full chronological sequence, what happened, who acted and how, and what the decisions led to' },
            { ar: 'ملاحظة أن الطفلة بخير الآن وأن الأمر انتهى', en: 'A note that the girl is fine now and the matter is resolved' },
            { ar: 'تقرير مختصر مع اقتراح لتحسين خطة الطوارئ', en: 'A brief report with a suggestion to improve the emergency plan' },
          ],
          correct: 0,
          feedback: {
            ar: 'التقرير الكامل يوثّق ما جرى بدقّة ليُراجَع لاحقاً ويُحسَّن. "الأمر انتهى" لا يبني درساً مستفاداً.',
            en: 'A complete report documents what happened accurately for later review and improvement. "It\'s over" does not build a lesson.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'l2c-closing',
      tag: { ar: 'المرحلة الرابعة', en: 'Stage 4' },
      title: { ar: 'نهاية اليوم: التقييم والتوثيق', en: 'End of day: evaluation and documentation' },
      lede: {
        ar: 'النشاط انتهى. الأطفال غادروا. الآن يبدأ العمل الأصعب: توثيق ما جرى بصدق.',
        en: 'The activity is over. The children have left. Now the harder work begins: documenting what happened honestly.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'كان يوماً صعباً: نشاط جيّد في مجمله، حادثة بسيطة، وحالة طارئة تعاملتم معها. المشرف سيقرأ تقريرك غداً. قرّرت توثيق كل شيء بصدق، بما فيه اللحظة التي تأخّرتم فيها بالاتصال بالإسعاف بدقيقتين لأن أحد المتطوّعين أصرّ على البحث عن الدواء أولاً.',
            en: 'It was a hard day: a good activity overall, a minor incident, and an emergency you managed. Your supervisor will read your report tomorrow. You have decided to document everything honestly, including the moment you were delayed by two minutes in calling emergency services because a volunteer insisted on looking for medicine first.',
          },
        },
        {
          type: 'quiz',
          id: 'l2c-q10',
          label: { ar: 'سؤال ١٠', en: 'Question 10' },
          question: {
            ar: 'هل تذكر في التقرير أن أحد المتطوّعين تصرّف بشكل خاطئ؟',
            en: 'Do you mention in the report that a volunteer acted incorrectly?',
          },
          options: [
            { ar: 'نعم، تسجّل ما جرى بالوقائع دون أحكام شخصية، لأن التقرير للتعلّم لا للعقاب', en: 'Yes, you record what happened in facts without personal judgements, because the report is for learning not punishment' },
            { ar: 'لا، تحمي زميلك وتُبلّغ عن الحادث دون تسمية أحد', en: 'No, you protect your colleague and report the incident without naming anyone' },
            { ar: 'نعم، وتضيف رأيك في عدم كفاءته', en: 'Yes, and you add your opinion about his incompetence' },
          ],
          correct: 0,
          feedback: {
            ar: 'التوثيق الصادق يخدم التحسين المستمر. الوقائع لا تُوثَّق لمحاكمة أحد — بل لفهم ما جرى وتغييره في المرة القادمة.',
            en: 'Honest documentation serves continuous improvement. Facts are not documented to put anyone on trial — but to understand what happened and change it next time.',
          },
        },
        {
          type: 'quiz',
          id: 'l2c-q11',
          label: { ar: 'سؤال ١١', en: 'Question 11' },
          question: {
            ar: 'بعد إنهاء تقريرك، متطوّع آخر يقترح أن ترفعوا صور اليوم على وسائل التواصل الآن لأن "اليوم كان ناجحاً". ماذا تقول؟',
            en: 'After finishing your report, another volunteer suggests posting today\'s photos on social media now because "the day was a success". What do you say?',
          },
          options: [
            { ar: 'الصور تنتظر التحقّق من موافقات النشر — النجاح لا يُبيح نشر صورة طفل بلا إذن', en: 'Photos wait until publication consent is verified — success does not authorise posting a child\'s photo without permission' },
            { ar: 'توافق لرفع معنويات الفريق بعد يوم صعب', en: 'Agree to boost team morale after a hard day' },
            { ar: 'تقترح نشر الصور على الحساب الشخصي فقط', en: 'Suggest posting only on personal accounts' },
          ],
          correct: 0,
          feedback: {
            ar: 'القاعدة لا تتغيّر بنجاح اليوم. صورة طفل بلا موافقة صريحة على النشر الرقمي لا تُنشر — لا على الحساب الرسمي ولا على الشخصي.',
            en: 'The rule does not change with a successful day. A child\'s photo without explicit digital publication consent is not posted — not on the official account nor the personal one.',
          },
        },
        {
          type: 'quiz',
          id: 'l2c-q12',
          label: { ar: 'سؤال ١٢', en: 'Question 12' },
          question: {
            ar: 'تريد حفظ ملفات التوثيق الكاملة لهذا اليوم. أيّ الطرق أصح؟',
            en: 'You want to save the complete documentation files for this day. Which method is correct?',
          },
          options: [
            { ar: 'تُرفَع على مجلد مشترك آمن بصلاحيات محدودة، لا على مجموعة واتساب الجماعية', en: 'Uploaded to a shared folder with limited access, not to a group WhatsApp' },
            { ar: 'تُحفظ على هاتفك الشخصي لأنه المكان الأأمن', en: 'Saved on your personal phone because it is the safest place' },
            { ar: 'تُرسَل لكل أعضاء الفريق بالبريد الإلكتروني للمراجعة', en: 'Sent to all team members by email for review' },
          ],
          correct: 0,
          feedback: {
            ar: 'ملفات تحتوي بيانات أطفال تخضع لضوابط الخصوصية. المجلد المشترك بصلاحيات محدودة هو الخيار الوحيد المقبول — لا واتساب، لا بريد جماعي.',
            en: 'Files containing children\'s data are subject to privacy rules. A shared folder with limited access is the only acceptable option — not WhatsApp, not a broadcast email.',
          },
        },
      ],
    },
  ],
};
