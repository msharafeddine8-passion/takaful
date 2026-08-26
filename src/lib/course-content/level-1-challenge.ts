import type { CourseContent } from './types';
import { reportingContact } from '../org';

/**
 * The level 1 challenge: one volunteering day, from arrival to departure.
 *
 * A challenge is not a sixth course. Its job is to find out whether the five
 * courses behind it have joined up — so nothing here teaches anything new, and
 * every question needs at least two of them at once. A volunteer who memorised
 * five sets of rules separately will pass the five courses and fail this.
 *
 * That is also why the wrong answers are written the way they are. Each one is
 * something a decent volunteer would plausibly do, usually because it satisfies
 * one course while breaking another: kind to the child but outside the
 * safeguarding rule, efficient for the team but careless with data, honest
 * with the family but a promise nobody can keep. The feedback names the
 * collision rather than saying "wrong".
 *
 * It runs in order, because the point is that a decision made at nine o'clock
 * is still binding at four.
 */

const focal = reportingContact('safeguarding');

export const levelOneChallenge: CourseContent = {
  slug: 'level-1-challenge',
  level: 1,
  // Fewer words than a course and more thinking per question, so the minutes
  // sit in the questions rather than the reading.
  minutes: 25,
  passMark: 70,
  title: {
    ar: 'مراجعة المستوى الأول: يوم تطوّعي كامل',
    en: 'Level 1 Review: A Full Volunteering Day',
  },
  lede: {
    ar: 'يوم واحد من الوصول حتى المغادرة. كل قرار يحتاج أكثر من دورة واحدة ممّا تعلّمته، ولا يوجد دائماً خيار مريح.',
    en: 'One day, from arrival to departure. Every decision needs more than one of the courses behind it, and there is not always a comfortable option.',
  },
  outcomes: {
    ar: [
      'تتّخذ قرارات متتابعة في يوم ميداني وتشرح سبب كل قرار',
      'تربط القرار بالمبدأ الذي يحكمه بدل الاعتماد على الحدس',
      'تتعرّف على أثر قرارك على الفريق وعلى المستفيد معاً',
    ],
    en: [
      'Make a sequence of decisions across a field day and justify each one',
      'Connect a decision to the principle behind it rather than relying on instinct',
      'Recognise the effect of your decision on the team and on the person served, together',
    ],
  },
  sources: [
    'IFRC Volunteering Policy (August 2022)',
    'International Child Safeguarding Standards — Keeping Children Safe',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
    'Do No Harm principle in humanitarian action',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'arrival',
      tag: { ar: 'الوصول · ٩:٠٠', en: 'Arrival · 09:00' },
      title: { ar: 'قبل أن يصل أحد', en: 'Before anyone arrives' },
      lede: {
        ar: 'نشاط ترفيهي لثلاثين طفلاً في قاعة مستأجرة. أنتم أربعة متطوّعين، ومنسّقة الفريق تأخّرت.',
        en: 'A recreational activity for thirty children in a rented hall. There are four of you, and the team coordinator is running late.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'وصلتم قبل ساعة من الموعد. القاعة أكبر مما توقّعتم، ولها بابان: واحد على الشارع وواحد على ساحة خلفية غير مسوّرة. لا أحد وزّع الأدوار بعد، والجميع ينتظر المنسّقة.',
            en: 'You arrive an hour early. The hall is larger than expected and has two doors: one onto the street and one onto an unfenced yard at the back. Nobody has assigned roles yet, and everyone is waiting for the coordinator.',
          },
        },
        {
          type: 'quiz',
          id: 'ch1-q1',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'باقٍ خمسون دقيقة والمنسّقة لم تصل ولا تردّ. ما أول ما تفعله؟',
            en: 'Fifty minutes left, the coordinator has not arrived and is not answering. What do you do first?',
          },
          options: [
            {
              ar: 'تنتظرون وصولها — توزيع الأدوار مسؤوليتها لا مسؤوليتكم، وأي توزيع تتّفقون عليه قبلها قد تنقضه حين تصل',
              en: 'Wait for her — assigning roles is her responsibility, not yours, and any split you agree without her may be overturned when she arrives',
            },
            {
              ar: 'تقترح أن توزّعوا الأدوار بينكم الآن، وتحدّدوا من يقف عند الباب الخلفي، وتُبلغوا المنسّقة بما اتّفقتم عليه',
              en: 'Propose that you divide the roles now, decide who covers the back door, and tell the coordinator what you agreed',
            },
            {
              ar: 'تبدأ بترتيب القاعة وحدك وتترك الأدوار حتى تصل — الكراسي والطاولات تحتاج هذا الوقت على أي حال، والأدوار دقيقتان',
              en: 'Start setting up the hall on your own and leave the roles until she arrives — the chairs and tables need this time anyway, and the roles take two minutes',
            },
            {
              ar: 'تتّصل بأهالي الأطفال لتأجيل النشاط نصف ساعة حتى تصل المنسّقة، فيبدأ النشاط منظّماً بدل أن يبدأ مرتبكاً',
              en: 'Call the children’s families to push the activity back half an hour until the coordinator arrives, so it starts organised rather than in confusion',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الانتظار يبدو انضباطاً وهو في الحقيقة ترك للنشاط بلا مسؤول سلامة حتى اللحظة الأخيرة. والترتيب وحدك يحلّ مشكلة الكراسي لا مشكلة الأطفال. والاتصال بالأهالي قرار ليس لك. العمل ضمن فريق لا يعني انتظار من يقود — يعني أن تسدّ الفراغ مؤقتاً وتُبلغ من يملك القرار بما فعلت. والباب الخلفي على ساحة غير مسوّرة هو أول ما يجب أن يكون له اسم مسؤول.',
            en: 'Waiting looks like discipline and is in fact leaving the activity with no one on safety until the last minute. Setting up alone solves the chairs, not the children. Calling families is not your call. Working in a team does not mean waiting for whoever leads — it means filling the gap temporarily and telling whoever holds the decision what you did. And the back door onto an unfenced yard is the first thing that needs a name attached to it.',
          },
        },
        {
          type: 'quiz',
          id: 'ch1-q2',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'زميل يقترح إغلاق الباب الخلفي بالمفتاح حتى لا يخرج طفل. ما رأيك؟',
            en: 'A colleague suggests locking the back door so no child can wander out. What do you think?',
          },
          options: [
            {
              ar: 'فكرة ممتازة — تحلّ المشكلة نهائياً: باب واحد يعني نقطة واحدة تُضبط ويتحرّر متطوّع للعمل مع الأطفال',
              en: 'Excellent idea — it solves the problem for good: one door means a single point to control, and it frees a volunteer to work with the children',
            },
            {
              ar: 'لا: باب مقفل بالمفتاح يمنع الخروج في حالة طوارئ. يبقى مغلقاً لا مقفلاً، ومعه شخص مسؤول',
              en: 'No: a locked door blocks the exit in an emergency. It stays shut but unlocked, with someone responsible standing there',
            },
            {
              ar: 'يُقفل ويُعطى المفتاح لطفل كبير يفتحه عند الحاجة — الكبار هنا مسؤولون والمفتاح يبقى قرب الباب',
              en: 'Lock it and give the key to an older child to open if needed — the older ones here are responsible and the key stays by the door',
            },
            {
              ar: 'يُقفل ويُفتح فقط وقت الاستراحة بإشراف متطوّعَين، فيبقى مغلقاً في الأوقات التي ينشغل فيها الجميع بالنشاط',
              en: 'Lock it and open it only at break time under two volunteers’ supervision, so it stays sealed during the times when everyone is busy with the activity',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'هذا المكان الذي تصطدم فيه حماية الطفل بالسلامة، وهو اصطدام حقيقي لا تمرين. منع الخروج هدف صحيح، وإغلاق مخرج على ثلاثين طفلاً وسيلة خاطئة له — لأن الحريق أو الإصابة يجعلان الباب المقفل هو الخطر. القاعدة العامة: لا يُقفل مخرج على مجموعة أبداً. والحلّ ليس تقنياً بل بشري: شخص له اسم يقف هناك.',
            en: 'This is where child safeguarding collides with safety, and the collision is real rather than an exercise. Stopping children wandering out is a correct aim; sealing an exit on thirty children is a wrong means to it — because a fire or an injury turns the locked door into the danger. The general rule: an exit is never locked on a group. The answer is not technical but human: a named person standing there.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'registration',
      tag: { ar: 'التسجيل · ٩:٥٠', en: 'Registration · 09:50' },
      title: { ar: 'الأسماء والصور', en: 'Names and photographs' },
      lede: {
        ar: 'الأطفال يصلون. معك كشف أسماء ورقم هاتف لكل وليّ أمر.',
        en: 'The children start arriving. You are holding a name list with a guardian’s phone number against each one.',
      },
      blocks: [
        {
          type: 'quiz',
          id: 'ch1-q3',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'مسؤول القاعة يطلب نسخة من كشف الأسماء «للسجلّ عندنا». ماذا تفعل؟',
            en: 'The hall manager asks for a copy of the name list "for our records". What do you do?',
          },
          options: [
            { ar: 'تعطيه نسخة — المكان مكانه ومن حقّه أن يعرف من دخل', en: 'Give him a copy — it is his building and he has a right to know who is inside' },
            {
              ar: 'تعتذر، وتعرض عليه عدد الحاضرين فقط، وتحيله إلى منسّقة الفريق إن أراد أكثر',
              en: 'Decline, offer him the head count only, and refer him to the coordinator if he wants more',
            },
            {
              ar: 'تعطيه الكشف بعد حذف أرقام الهواتف، فالرقم هو البيانات الشخصية',
              en: 'Give him the list with the phone numbers removed — the number is the personal data',
            },
            { ar: 'تصوّر الكشف وترسله له على واتساب ليبقى معك الأصل', en: 'Photograph the list and send it to him on WhatsApp so you keep the original' },
          ],
          correct: 1,
          feedback: {
            ar: 'العدد يخدم غرضه المعلن كاملاً — السلامة ومعرفة من في المبنى — من دون كشف أي شيء عن طفل بعينه. حذف الأرقام لا يكفي: الاسم وحده يحدّد الطفل ويربطه بنشاط ومكان وزمن. وواتساب أسوأ الخيارات لأنه يخرج البيانات من أي قناة يمكن للجمعية أن تحكمها. القاعدة: تُشارك المعلومة مع من يحتاجها لعمله، وبالقدر الذي يحتاجه فقط.',
            en: 'The head count fully serves the stated purpose — safety, and knowing who is in the building — without revealing anything about a particular child. Removing the phone numbers is not enough: a name alone identifies a child and ties them to an activity, a place and a time. WhatsApp is the worst option because it moves the data outside any channel the association can govern. The rule: share with whoever needs it for their work, and only as much as they need.',
          },
        },
        {
          type: 'quiz',
          id: 'ch1-q4',
          label: { ar: 'سيناريو حسّاس', en: 'A difficult scenario' },
          scenario: {
            ar: 'أب يسلّم ابنته ويقول: «صوّروها كتير، بحبّ شوف الصور.» وطفلة أخرى بجانبها يرفض أهلها التصوير.',
            en: 'A father hands over his daughter and says, "take lots of photos of her, I like seeing them." Another girl beside her has parents who refuse photography.',
          },
          question: { ar: 'كيف تدير التصوير اليوم؟', en: 'How do you handle photography today?' },
          options: [
            {
              ar: 'تصوّر الأولى ولا تصوّر الثانية، وتنتبه أثناء التصوير وتطلب من الثانية أن تبتعد قليلاً كلّما رفعت الكاميرا، فرفض أهلها يخصّها وحدها',
              en: 'Photograph the first and not the second, be careful while shooting, and ask the second girl to step aside whenever you raise the camera, since her parents’ refusal covers only her',
            },
            {
              ar: 'تصوّر أنشطة لا وجوهاً، من زوايا لا تُظهر ملامح أحد، وتترك الصور الشخصية للحالات التي فيها موافقة مكتوبة للطرفين',
              en: 'Photograph activities rather than faces, from angles that show no one’s features, and leave individual photos to cases with written consent on both sides',
            },
            {
              ar: 'لا تصوّر شيئاً اليوم تفادياً للمشكلة، وتكتب في التقرير أن التوثيق تعذّر لتعارض الموافقات وتؤجّله إلى نشاط تتوحّد فيه',
              en: 'Photograph nothing today to avoid the problem, and note in the report that documentation was impossible because the consents conflicted, leaving it to an activity where they agree',
            },
            {
              ar: 'تصوّر الجميع وتحذف صور الثانية لاحقاً على الهاتف قبل أن ترفع أي شيء، فلا تصل صورة واحدة لها إلى أحد',
              en: 'Photograph everyone and delete the second girl’s photos afterwards on the phone before uploading anything, so not one image of her reaches anybody',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الخيار الأول يبدو منضبطاً وهو غير قابل للتنفيذ عملياً: طفلة واحدة وسط ثلاثين في نشاط متحرّك ستدخل الإطار، والخطأ سيقع. والامتناع التام يحرم الجمعية من توثيق مشروع وهو ردّ فعل لا حلّ. والحذف اللاحق يعني أن الصورة وُجدت وقد نُسخت. الحلّ في طريقة التصوير نفسها لا في الفرز بعده — وهذا ما يجعل موافقة الأب الأول غير كافية وحدها أيضاً: موافقته لا تشمل من يظهر خلف ابنته.',
            en: 'The first looks disciplined and is not workable: one girl among thirty in a moving activity will end up in frame, and the mistake will happen. Refusing altogether denies the association any record of its project and is a reaction rather than a solution. Deleting afterwards means the photo existed and may have been copied. The answer is in how you shoot rather than what you sort out later — which is also why the first father’s consent is not sufficient on its own: it does not cover whoever appears behind his daughter.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'activity',
      tag: { ar: 'النشاط · ١١:٣٠', en: 'The activity · 11:30' },
      title: { ar: 'في وسط اليوم', en: 'The middle of the day' },
      lede: {
        ar: 'النشاط يسير. وهنا تظهر الأمور التي لا يكتبها أحد في الخطة.',
        en: 'The activity is running. This is where the things nobody writes into a plan show up.',
      },
      blocks: [
        {
          type: 'quiz',
          id: 'ch1-q5',
          label: { ar: 'سيناريو حسّاس', en: 'A difficult scenario' },
          scenario: {
            ar: 'طفل في السابعة رفض المشاركة طوال الصباح ويجلس في الزاوية. اقتربت منه فبكى وقال إنه يريد أمّه، ثم قال: «بابا بيزعق كتير لما بيرجع.»',
            en: 'A seven-year-old has refused to join in all morning and sits in the corner. You go over; he cries, says he wants his mother, then says: "Dad shouts a lot when he gets back."',
          },
          question: { ar: 'ماذا تفعل الآن؟', en: 'What do you do now?' },
          options: [
            {
              ar: 'تسأله بلطف عمّا يحدث في البيت لتفهم قبل أن تقرّر إن كان الأمر يستحقّ الإبلاغ، فلا تُحرّك إجراءً ثقيلاً بلا داعٍ',
              en: 'Ask him gently what happens at home, so you understand before deciding whether it is worth reporting, rather than starting a heavy process needlessly',
            },
            {
              ar: 'تطمئنه وتُشركه في نشاط، وتدوّن كلامه كما قاله بلا زيادة، وتُبلّغ مسؤولة الحماية اليوم',
              en: 'Reassure him and bring him into an activity, write his words down exactly as he said them, and report to the safeguarding focal point today',
            },
            {
              ar: 'تخبر والده عند الاستلام أن ابنه بدا متضايقاً اليوم وتراقب ردّة فعله، فهي أسرع طريقة لتعرف ما يجري',
              en: 'Tell his father at pick-up that his son seemed upset today and watch how he reacts — the quickest way to learn what is going on',
            },
            {
              ar: 'تنتظر لترى إن تكرّر الأمر في النشاط القادم وتدوّن ملاحظة لنفسك، فجملة واحدة لا تكفي لبناء بلاغ',
              en: 'Wait and see whether it happens again at the next activity, keeping a note for yourself — one sentence is not enough to build a report on',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'السؤال عمّا يحدث في البيت تحقيق، ولو كان بلطف — وهو يفسد أي إجراء رسمي لاحق ويُعيد على الطفل ما قاله. وإخبار الأب قد يكون إعادة الطفل إلى مصدر ما يخيفه. والانتظار قرار بعدم التصرّف. جملة واحدة غامضة لا تكفي لاستنتاج شيء، وهي بالضبط ما يجب أن يصل إلى من يستطيع أن يقرّر: أنت تنقل، لا تُقيّم.' +
              (focal ? ` القناة: ${focal.name} — ${focal.phone}.` : ''),
            en: 'Asking what happens at home is an investigation, however gently done — it can compromise any later formal process and makes the child relive it. Telling the father may be handing the child back to whatever frightens him. Waiting is a decision not to act. One vague sentence is not enough to conclude anything, and that is exactly what should reach the person who can decide: you pass it on, you do not assess it.' +
              (focal ? ` The channel: ${focal.name} — ${focal.phone}.` : ''),
          },
        },
        {
          type: 'quiz',
          id: 'ch1-q6',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'زميلك يفقد أعصابه ويصرخ في مجموعة أطفال أزعجوه. صمت الأطفال وخاف بعضهم. ما التصرّف؟',
            en: 'A colleague loses his temper and shouts at a group of children who were disrupting him. They fall silent and some look frightened. What do you do?',
          },
          options: [
            {
              ar: 'تصحّح الموقف أمام الأطفال فوراً حتى يعرفوا أن هذا ليس مقبولاً وأن أحداً في الفريق لا يوافق عليه',
              en: 'Correct him in front of the children immediately, so they know it is not acceptable and that no one on the team endorses it',
            },
            {
              ar: 'تتولّى المجموعة بهدوء، وتتحدّث إليه على انفراد بعد النشاط، وتذكر الأمر في تقرير اليوم',
              en: 'Take over the group calmly, speak to him privately after the activity, and note it in the day’s report',
            },
            {
              ar: 'لا تتدخّل — الأطفال كانوا مزعجين فعلاً وهو تحت ضغط، والتدخّل أمامهم يقوّض موقفه',
              en: 'Stay out of it — the children were genuinely disruptive and he is under pressure, and stepping in front of them would undermine him',
            },
            {
              ar: 'تُبلّغ عنه فوراً وتطلب إخراجه من النشاط، فالصراخ في الأطفال مسّ بسلامتهم النفسية',
              en: 'Report him immediately and ask for him to be removed from the activity — shouting at children touches their emotional safety',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'التصحيح أمام الأطفال يحمي الأطفال في اللحظة ويكسر الفريق أمامهم، وهو غالباً ما يجعل الموقف أسوأ لا أفضل. وعدم التدخّل يترك أطفالاً خائفين. والإبلاغ الفوري بطلب الإخراج تصعيد يتجاوز حجم الحدث — إلا إذا تكرّر أو تجاوز الصراخ إلى مسّ أو إهانة، وعندها يصبح الخيار الرابع هو الصحيح. الترتيب الذي تعلّمته: عالج اللحظة، ثم تحدّث مباشرةً، ثم وثّق. والتوثيق ليس وشاية — هو ما يجعل التكرار مرئياً.',
            en: 'Correcting him in front of the children protects them in the moment and breaks the team in front of them, and usually makes the situation worse rather than better. Not intervening leaves frightened children. Reporting immediately and asking for his removal escalates past the size of the event — unless it repeats, or the shouting crossed into contact or humiliation, in which case the fourth option becomes the right one. The order you were taught: handle the moment, then speak to him directly, then document. Documenting is not informing on someone — it is what makes a pattern visible.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'departure',
      tag: { ar: 'المغادرة · ١:٠٠', en: 'Departure · 13:00' },
      title: { ar: 'آخر ساعة', en: 'The last hour' },
      lede: {
        ar: 'الأطفال يغادرون. الأخطاء في هذه الساعة أكثر من أي ساعة أخرى، لأن الجميع متعب ويريد أن ينتهي.',
        en: 'The children are leaving. More mistakes happen in this hour than any other, because everyone is tired and wants it over.',
      },
      blocks: [
        {
          type: 'quiz',
          id: 'ch1-q7',
          label: { ar: 'سيناريو حسّاس', en: 'A difficult scenario' },
          scenario: {
            ar: 'رجل لم تره من قبل يقول إنه عمّ إحدى الطفلات وإن والدتها أرسلته. الطفلة تعرفه وتبدو مرتاحة معه. اسمه ليس على كشف من يُسمح لهم بالاستلام، ورقم الأمّ لا يردّ.',
            en: 'A man you have not seen before says he is one girl’s uncle and that her mother sent him. The girl knows him and seems comfortable. His name is not on the authorised pick-up list, and her mother is not answering.',
          },
          question: { ar: 'ماذا تفعل؟', en: 'What do you do?' },
          options: [
            {
              ar: 'تسلّمه إياها — الطفلة تعرفه وارتياحها دليل كافٍ، ومنعه أمام الناس إهانة لعائلة تعرفونها',
              en: 'Hand her over — she knows him and her ease is evidence enough, and refusing him in public insults a family you know',
            },
            {
              ar: 'لا تسلّمها، وتبقيها معك في مكان آمن ومرئي، وتستمرّ في محاولة الاتصال بالأمّ، وتُبلغ المنسّقة',
              en: 'Do not hand her over; keep her with you somewhere safe and visible, keep trying the mother, and tell the coordinator',
            },
            {
              ar: 'تسأل الطفلة إن كانت تريد الذهاب معه وتعمل بجوابها، فهي أدرى بمن في عائلتها ولها رأي فيمن يأخذها',
              en: 'Ask the girl whether she wants to go with him and act on her answer — she knows her own family best and has a say in who takes her',
            },
            {
              ar: 'تطلب بطاقته وتصوّرها وترسل الصورة إلى المنسّقة ثم تسلّمها، فيصبح لديكم أثر موثّق لمن أخذها',
              en: 'Ask for his ID, photograph it and send the picture to the coordinator, then hand her over — you now have a documented trace of who took her',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'هذا أصعب سؤال في التحدّي لأن الخيار الخاطئ فيه هو الأكثر إنسانية: الرجل غالباً عمّها فعلاً، ومنعه يبدو إهانة له وإزعاجاً للطفلة. لكن كشف من يُسمح لهم بالاستلام موجود تحديداً للحالات التي تبدو طبيعية — من ينوي الأذى يبدو مطمئناً بالضبط كما يبدو العمّ. وسؤال الطفلة يضع قرار سلامتها على طفلة في السابعة. والبطاقة تثبت اسمه لا صلاحيته. لا تُسلَّم طفلة لمن ليس على الكشف مهما كان الموقف محرجاً — والإحراج هنا ثمن مقبول تماماً.',
            en: 'This is the hardest question here because the wrong option is the most humane one: he probably is her uncle, and refusing looks like an insult to him and a nuisance for her. But the authorised list exists precisely for the situations that look normal — someone intending harm looks exactly as reassuring as an uncle does. Asking the girl puts the decision about her own safety on a seven-year-old. An ID proves his name, not his authorisation. A child is not handed to someone who is not on the list, however awkward it gets — and the awkwardness is an entirely acceptable price.',
          },
        },
        {
          type: 'quiz',
          id: 'ch1-q8',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'انتهى اليوم. ما الذي يجب أن يُكتب، ولمن؟',
            en: 'The day is over. What has to be written down, and for whom?',
          },
          options: [
            {
              ar: 'تقرير نشاط قصير فيه العدد وما جرى — والحادثتان (كلام الطفل، وواقعة الاستلام) في بلاغين منفصلين لمن يخصّه كلٌّ منهما',
              en: 'A short activity report with the numbers and what happened — and the two incidents (the child’s remark, and the pick-up) as separate reports, each to whoever it concerns',
            },
            {
              ar: 'تقرير واحد يجمع كل شيء ويُرسل للفريق كلّه، فالجميع كان في القاعة ومن حقّهم أن يعرفوا ويتعلّموا، وهو يوفّر كتابة اليوم نفسه ثلاث مرّات',
              en: 'One report covering everything, sent to the whole team — everyone was in the hall, they have a right to know what happened and learn from it, and it saves writing the same day up three times',
            },
            {
              ar: 'تقرير بالعدد فقط، والباقي شفهي للمنسّقة، فهي تعرف الأسر وتستطيع أن تقرّر ما يستحقّ أن يُكتب وما يبقى بينكم',
              en: 'A report with the numbers only, and the rest verbally to the coordinator — she knows the families and can decide what deserves writing down and what stays between you',
            },
            {
              ar: 'لا شيء — لم يقع ضرر فعلي في النهاية، والكتابة عن وقائع انتهت بخير تملأ الملفات بما لا يقرؤه أحد',
              en: 'Nothing — no actual harm occurred in the end, and writing up incidents that resolved fine only fills the files with things nobody reads',
            },
          ],
          correct: 0,
          feedback: {
            ar: 'الجمع في تقرير واحد يوزّع معلومة حماية على من لا يحتاجها. والاكتفاء بالشفهي يعني أنه بعد شهر لن يكون هناك ما يُقرأ، وأن تكرار الواقعة مع طفل آخر لن يُرى. و«لم يقع ضرر» هو بالضبط ما يُقال قبل المرة التي يقع فيها. القاعدة: الوقائع منفصلة عن الآراء، وكل بلاغ يذهب إلى القناة التي تخصّه وحدها.',
            en: 'Combining them spreads a safeguarding matter to people who do not need it. Keeping it verbal means that in a month there is nothing to read, and that the same thing happening to another child will not be seen. "No harm occurred" is exactly what gets said before the time it does. The rule: facts separate from opinions, and each report goes to its own channel and no other.',
          },
        },
      ],
    },
  ],
};
