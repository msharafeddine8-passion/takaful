import type { CourseContent } from './types';

/**
 * Level 4 — Conflict Resolution and Mediation. Pass mark 70.
 *
 * The central distinction this course builds is between task conflict and
 * personal conflict — not because one is worse than the other, but because
 * they respond to different interventions. A volunteer who applies personal
 * conflict tools to a task dispute turns a fixable problem into a feelings
 * conversation. A volunteer who applies task tools to a personal conflict
 * skips over the very thing that is blocking the work.
 *
 * The mediation sequence is kept deliberately simple and linear, because the
 * point of a process is that it works when you are stressed and would rather
 * improvise. Every step is one action, not a principle.
 *
 * The final module on authority limits is the one volunteers most often skip
 * in their heads, because they want to help. The course makes the case that
 * referring a conflict is itself a form of help — sometimes the only one that
 * actually works.
 */

export const conflictResolution: CourseContent = {
  slug: 'conflict-resolution',
  level: 4,
  minutes: 35,
  passMark: 70,
  title: {
    ar: 'حل النزاعات والوساطة',
    en: 'Conflict Resolution and Mediation',
  },
  lede: {
    ar: 'نزاع على مهمّة ونزاع شخصي ليسا الشيء نفسه. كيف تستمع للطرفين، وتخفّض التصعيد، وتوثّق حلاً يصمد.',
    en: 'A dispute about a task and a personal dispute are not the same thing. How to hear both sides, de-escalate, and document a resolution that holds.',
  },
  outcomes: {
    ar: [
      'تميّز بين النزاع حول المهام والنزاع الشخصي وتعالج كلاً بطريقته',
      'تفصل الوقائع عن التفسيرات في رواية كل طرف',
      'تخفّض التصعيد وتدير وساطة تنتهي بخطوات عملية',
      'تحدّد متى يتجاوز النزاع صلاحيتك ويجب تحويله للإدارة',
    ],
    en: [
      'Tell a task dispute from a personal one and handle each on its own terms',
      'Separate facts from interpretations in each side\'s account',
      'De-escalate and mediate to an agreement with concrete steps',
      'Recognise when a conflict is past your authority and must go to management',
    ],
  },
  sources: [
    'ICRC — Communication and Negotiation in Humanitarian Settings',
    'IFRC — Volunteer Management and Team Leadership Guidelines (2022)',
    'UN Volunteers — Conflict Sensitivity and Conflict Resolution Handbook',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'conflict-types',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: {
        ar: 'نوعا النزاع ولماذا يهمّ الفرق',
        en: 'The two kinds of conflict and why the difference matters',
      },
      lede: {
        ar: 'معالجة نزاع مهام بأدوات النزاع الشخصي تُعقّد الأمور — ومعالجة نزاع شخصي بأدوات النزاع المهاماتي تتجاهله.',
        en: 'Treating a task dispute with personal-conflict tools complicates matters — and treating a personal dispute as a task issue ignores it.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين يختلف شخصان في الفريق، يرى الجميع النتيجة — الصوت المرتفع، أو الصمت المتصلّب، أو رسالة تُرسَل بعد طول تأخير — لكن السبب الحقيقي في الغالب لا يُرى لأن كلاً من الطرفين لا يجد الكلمات الصحيحة لوصفه، أو لأن الجهة التي أُسند إليها التعامل مع النزاع تفترض مسبقاً أنها تعرف نوعه. النزاع حول المهام نزاع موضوعي: من يتولّى أي دور، ما الأولوية، كيف يُنجَز العمل، من يتّصل بالمستفيد ومتى. يمكن فصله عن الأشخاص وطرحه على الطاولة والبحث عن حلٍّ له بمعزل عن مشاعر أيٍّ من الطرفين. والنزاع الشخصي نزاع علائقي: كيف يشعر كلٌّ منهما بالآخر، وما التجارب التراكمية بينهما، وما الذي تعنيه كلمة سمعها أحدهم من الآخر ولم ينسَها. الخطأ الأكثر شيوعاً في التعامل مع النزاع هو افتراض أن كل خلاف هو خلاف مهاماتي قابل للحلّ بإعادة توزيع الأدوار أو الاتفاق على جدول زمني — لكن حين يكون الشعور بالإهمال أو الاحتقار أو الإقصاء في القلب، فإن توزيع الأدوار من جديد لن يحلّ شيئاً بل قد يضيف طبقة جديدة من الإحباط لأن الشخص يرى أن مشكلته الحقيقية لم تُرَ أصلاً.',
            en: 'When two people in a team disagree, everyone sees the result — a raised voice, a rigid silence, a message sent very late — but the real cause is usually invisible, because neither party finds the right words to describe it, or because whoever handles the conflict assumes they already know what kind it is. A task conflict is objective: who takes which role, what the priority is, how the work gets done, who contacts the beneficiary and when. It can be separated from the people and put on the table and addressed in isolation from either party\'s feelings. A personal conflict is relational: how each person feels about the other, what history has accumulated between them, and what a word from one of them meant when the other heard it and has not forgotten. The most common mistake in handling conflict is assuming every disagreement is a task problem that can be solved by redistributing roles or agreeing on a timeline — but when the feeling of neglect, contempt, or exclusion is at the centre, redistributing roles will solve nothing and may add another layer of frustration because the person sees that their real problem was not even noticed.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'النزاع المهاماتي — ما يبدو عليه', en: 'Task conflict — what it looks like' },
              text: {
                ar: 'خلاف صريح حول قرار أو إجراء: من يتّصل بالمستفيد، ما الجدول الزمني الصحيح، أيّ نهج أفضل لنشاط بعينه. الطرفان يختلفان على المحتوى لا على بعضهما البعض، ويمكن لأيٍّ منهما أن يشرح موقفه دون الإشارة إلى شخصية الآخر.',
                en: 'An explicit disagreement about a decision or procedure: who contacts the beneficiary, what the right timeline is, which approach is better for a given activity. The two sides disagree about content, not about each other, and either of them can explain their position without referring to the other\'s personality.',
              },
            },
            {
              title: { ar: 'النزاع الشخصي — ما يبدو عليه', en: 'Personal conflict — what it looks like' },
              text: {
                ar: 'شدّ عاطفي ينعكس على طريقة الحديث أو عدمه: تجاهل متكرّر، سخرية خفيّة، تشكيك في النوايا، أو شعور بالإقصاء من المعلومة. الموضوع الظاهر كثيراً ما يكون ذريعة لا جوهراً، والطرفان يصعب عليهما إنهاء الحوار حتى لو اتُّفق على الموضوع المطروح.',
                en: 'An emotional pull that shows in how people speak or do not: repeated ignoring, quiet sarcasm, questioning motives, or a feeling of being kept out of information. The surface subject is often a pretext rather than the real issue, and both parties find it hard to close the conversation even if they agree on the topic at hand.',
              },
            },
            {
              title: { ar: 'النزاع المختلط — الأخطر', en: 'Mixed conflict — the most dangerous' },
              text: {
                ar: 'يبدأ كنزاع مهاماتي ثم تتراكم الإحباطات حتى يصبح شخصياً — أو العكس تماماً. التمييز بين المستوَيَين في الوقت المناسب يمنع التحوّل من خلاف حول قرار إلى عداء دائم يؤثّر على كل تعاون مستقبلي بين الشخصين.',
                en: 'It starts as a task conflict, then frustrations accumulate until it becomes personal — or the reverse. Distinguishing the two levels in time prevents a shift from a disagreement about a decision to lasting enmity that affects every future collaboration between the two people.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: {
            ar: 'الاختبار البسيط: هل سيحلّه تغيير الإجراء؟',
            en: 'The simple test: would changing the procedure solve it?',
          },
          content: {
            ar: 'اسأل نفسك: لو اتّفقنا الآن على الأسلوب الصحيح، هل سيشعر الطرفان بالارتياح ويكملان العمل معاً بعد خمس دقائق؟ إن كانت الإجابة نعم، فالنزاع مهاماتي. إن كنت تشعر أن الإجابة لن تكفي — أن أحدهما سيظلّ ساخطاً حتى لو قُبل اقتراحه — فثمّة بُعد علائقي يحتاج إلى معالجة منفصلة. الأداة الخاطئة لا تحلّ المشكلة مهما كانت جيدة.',
            en: 'Ask yourself: if we agreed right now on the right approach, would both sides feel satisfied and get back to work together five minutes later? If the answer is yes, it is a task conflict. If you sense the answer will not be enough — that one of them will still be resentful even if their proposal is accepted — there is a relational dimension that needs separate handling. The wrong tool does not solve the problem, however good it is.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'نزاع المهام يُحلّ بالتفاوض على الحلول وتوزيع الأدوار والاتفاق على خطوات واضحة',
              'النزاع الشخصي يحتاج الاعتراف بالمشاعر والاستماع النشط قبل أي حديث عن حلول عملية',
              'الشخص الذي يبدو «صعباً» في كل موضوع قد يحمل شكاوى علائقية غير معالجة تتراكم',
              'تسمية نوع النزاع بصوت عالٍ أحياناً تفتح الباب لأن يقول أحدهم ما يشعر به حقاً',
              'المعالجة المبكرة للنزاع المهاماتي تمنع تحوّله إلى نزاع شخصي مع مرور الوقت وتكرار الاحتكاك',
            ],
            en: [
              'A task conflict is resolved by negotiating solutions, redistributing roles, and agreeing on clear steps',
              'A personal conflict needs acknowledgement of feelings and active listening before any talk of practical solutions',
              'Someone who seems "difficult" on every topic may be carrying unaddressed relational grievances that accumulate',
              'Naming the type of conflict out loud sometimes opens the door for someone to say what they really feel',
              'Addressing a task conflict early prevents it from turning into a personal one as time passes and friction recurs',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'cr-q1',
          label: { ar: 'قرارك بالميدان', en: 'Your call' },
          question: {
            ar: 'اقترحت متطوّعة تغيير موعد النشاط الأسبوعي، فردّ عليها زميلها برفض حادّ: «دائماً نغيّر كل شيء في اللحظة الأخيرة». ما نوع النزاع على الأرجح؟',
            en: 'A volunteer suggested changing the weekly activity time, and her colleague rejected it sharply: "We always change everything at the last minute." What type of conflict is this most likely?',
          },
          options: [
            { ar: 'نزاع مهاماتي خالص — الخلاف على الموعد فقط', en: 'Pure task conflict — the disagreement is only about the time' },
            {
              ar: 'نزاع مختلط — كلمة «دائماً» تشير إلى تراكم سابق يتجاوز الموعد',
              en: 'Mixed conflict — the word "always" points to accumulated history that goes beyond the time slot',
            },
            { ar: 'نزاع شخصي خالص — الموعد ليس ما يهمّ أصلاً', en: 'Pure personal conflict — the time is not what really matters' },
            { ar: 'مجرد سوء تفاهم بسيط لا يحتاج تصنيفاً', en: 'Just a simple misunderstanding that does not need categorising' },
          ],
          correct: 1,
          feedback: {
            ar: 'كلمة «دائماً» ليست ردّاً على اقتراح موعد — هي رسالة عن نمط يزعجه تراكم على مدى وقت. الموعد موضوع ظاهر، والإحساس بأن قراراته لا تُحترم هو الموضوع الحقيقي. التعامل معه كنزاع مهاماتي فقط سيُفوّت البُعد الثاني، والحلّ الصحيح يبدأ بالاعتراف بالإحساس قبل النقاش عن أي موعد.',
            en: 'The word "always" is not a response to a scheduling proposal — it is a message about a pattern that has been bothering him for some time. The time slot is the surface subject; the feeling that his views are not respected is the real one. Treating it as a task conflict alone misses the second dimension, and the right solution begins by acknowledging the feeling before discussing any schedule.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'facts-interpretations',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: {
        ar: 'فصل الوقائع عن التفسيرات',
        en: 'Separating facts from interpretations',
      },
      lede: {
        ar: 'كلا الطرفين مقتنعان بروايتهما لأن كلاً منهما يسرد ما رآه — لكن ما رأياه ليس مجموع ما حدث.',
        en: 'Both sides are convinced of their account because each is telling what they saw — but what they saw is not the sum of what happened.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين تسمع طرفَي نزاع، ستسمع في الغالب روايتين تبدوان متناقضتين تماماً. ليس لأن أحدهما كاذب، بل لأن كلاً منهما يمزج بين ما حدث فعلاً وبين معنى ما حدث في رأيه. هذا المزج طبيعي تماماً — الذهن البشري لا يسجّل الوقائع مجرّدة، بل يسجّلها مع التفسيرات الفورية. «أرسل التقرير متأخّراً» وقيعة يمكن التحقّق منها بالنظر إلى ساعة الإرسال. «أرسله متأخراً لأنه لا يأبه» تفسير لنيّة لا طريقة لإثباتها أو نفيها مباشرة. «نظرت إليّ بتعالٍ» يستلزم تحقّقاً إضافياً. «قالت ذلك لتُحرجني أمام الجميع» تفسير لقصد لا يعرفه إلا صاحبته. مهمّة الوسيط لا يحكم فيها على مَن مصيب — بل يفصل ما وقع بالفعل عمّا يعتقد كلٌّ منهما أنه يعنيه، ثم يبني المحادثة على الوقائع المشتركة لا على التفسيرات المتعارضة. التفسيرات تولّد دفاعية وتغلق الحوار؛ الوقائع تفتحه لأنها أرضية مشتركة يمكن لكليهما الوقوف عليها معاً.',
            en: 'When you hear both sides of a conflict, you will usually hear two accounts that seem completely contradictory. Not because one of them is lying, but because each mixes what actually happened with what it meant in their view. This mixing is entirely natural — the human mind does not record facts in isolation; it records them with immediate interpretations. "He sent the report late" is a verifiable fact, visible in the send timestamp. "He sent it late because he does not care" is an interpretation of intent that cannot be directly proved or disproved. "She looked at me dismissively" requires further checking. "He said that to embarrass me in front of everyone" is an interpretation of a purpose that only its owner knows. The mediator\'s task is not to rule who is right — but to separate what actually occurred from what each believes it means, then build the conversation on shared facts rather than competing interpretations. Interpretations generate defensiveness and close dialogue; facts open it because they are common ground both parties can stand on together.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ وقيعة قابلة للتحقّق', en: '✔ A verifiable fact' },
          noTitle: { ar: '✘ تفسير أو استنتاج', en: '✘ An interpretation or inference' },
          yes: {
            ar: [
              'أرسل التقرير في الساعة التاسعة مساءً بدل السادسة كما اتُّفق',
              'لم تحضر اجتماع الفريق الثلاثاء الماضي دون إبلاغ مسبق',
              'لم يردّ على الرسالة لمدة أربع ساعات خلال ساعات العمل',
              'أسند الزيارات الميدانية لشخص واحد دون استشارة بقية الفريق',
            ],
            en: [
              'He sent the report at nine in the evening instead of six as agreed',
              'She did not attend last Tuesday\'s team meeting without prior notice',
              'He did not reply to the message for four hours during working hours',
              'She assigned the field visits to one person without consulting the rest of the team',
            ],
          },
          no: {
            ar: [
              'لا يحترم المواعيد ولا يأخذ عمله بجدية كافية',
              'هي لا تريد المشاركة الحقيقية في هذا الفريق',
              'يتجاهلني عمداً في كل مرة ويستمتع بذلك',
              'تفضّل الآخرين عليّ في كل قرار تتخذه',
            ],
            en: [
              'He does not respect deadlines and does not take his work seriously enough',
              'She does not want to truly participate in this team',
              'He deliberately ignores me every time and enjoys it',
              'She favours the others over me in every decision she makes',
            ],
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'ابدأ بسؤال كل طرف «ماذا حدث بالضبط؟» لا «كيف تشعر؟» — الوقائع أولاً والمشاعر تأتي لاحقاً في مكانها',
              'دوّن ما تسمعه وضع رمزاً لكل جملة: (و) لوقيعة و(ت) لتفسير، حتى تتضح لك الصورة',
              'حين يذكر أحدهم تفسيراً، اسأل: «ما الذي رأيته أو سمعته الذي جعلك تصل إلى هذا الاستنتاج؟»',
              'أعِد صياغة التفسير كسؤال مفتوح للطرف الآخر: «قال إنك لم تردّ أربع ساعات — ما الذي كان يجري معك في تلك الفترة؟»',
              'ابنِ ملخّص الجلسة على الوقائع المتّفق عليها فقط، وضع التفسيرات جانباً حتى يُفهَم كل موقف كاملاً',
            ],
            en: [
              'Start by asking each side "exactly what happened?" not "how do you feel?" — facts first, feelings come later in their proper place',
              'Note what you hear and mark each sentence: (F) for fact, (I) for interpretation, so the picture becomes clear to you',
              'When someone states an interpretation, ask: "what did you see or hear that brought you to that conclusion?"',
              'Reframe the interpretation as an open question for the other party: "they said you did not reply for four hours — what was going on for you in that period?"',
              'Build your session summary only on the agreed facts, and set interpretations aside until each position is fully understood',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: {
            ar: 'الوسيط الذي يقبل التفسيرات كوقائع يصبح طرفاً',
            en: 'A mediator who accepts interpretations as facts takes a side',
          },
          content: {
            ar: 'حين تسمع «هو يفعل هذا عمداً» وتسجّله كما لو كان وقيعة محقّقة، فأنت بدأت الحكم على النيّة قبل سماع الطرف الآخر. هذا كافٍ لإفقاد ثقة الطرف الآخر بمجرّد أن يلاحظ طريقة حديثك. الجملة الأهمّ التي تقولها في بداية الجلسة لكلّ طرف هي: «أنا هنا لأفهم ما حدث وليس لأحكم — وهذا يعني أنني لن أقبل أي رواية كاملة حتى أسمع الآخر.»',
            en: 'When you hear "he does this deliberately" and record it as if it were an established fact, you have started judging intent before hearing the other side. That is enough to lose the other party\'s trust the moment they notice how you are speaking. The most important sentence you say at the start of each session to each party is: "I am here to understand what happened, not to judge — which means I will not accept any account in full until I have heard the other."',
          },
        },
        {
          type: 'quiz',
          id: 'cr-q2',
          label: { ar: 'سيناريو', en: 'Scenario' },
          scenario: {
            ar: 'تقول لكِ منسّقة المخيّم: «رامي لم يرتّب الأماكن كما اتّفقنا ولم يُخبرني — هو لا يحترمنا ويعتقد أنه أهمّ شخص في الفريق.»',
            en: 'The camp coordinator tells you: "Rami did not set up the spaces as agreed and did not tell me — he does not respect us and thinks he is the most important person on the team."',
          },
          question: {
            ar: 'أيّ الجمل وقيعة يمكن التحقّق منها؟',
            en: 'Which of the following is a verifiable fact?',
          },
          options: [
            { ar: '«لا يحترمنا» — إذ يُظهر ذلك تصرّفه', en: '"He does not respect us" — his behaviour shows it' },
            { ar: '«يعتقد أنه أهمّ شخص» — هذا واضح من طريقته', en: '"He thinks he is the most important" — it is clear from his manner' },
            {
              ar: '«لم يرتّب الأماكن كما اتُّفق ولم يُبلّغها» — هذان شيئان يمكن التحقّق منهما',
              en: '"He did not set up the spaces as agreed and did not notify her" — these two things can be checked',
            },
            { ar: 'لا شيء منها وقيعة لأن كلها وجهة نظرها', en: 'None of them — they are all her point of view' },
          ],
          correct: 2,
          feedback: {
            ar: 'الوقيعتان الوحيدتان هما أن الأماكن لم تُرتَّب وفق الاتفاق وأن المنسّقة لم تُبلَّغ — وكلاهما يمكن التحقّق منه أو الاستفسار عنه. «لا يحترمنا» و«يعتقد أنه الأهمّ» تفسيران للنيّة والشخصية. الخطوة التالية هي سماع رامي وسؤاله: ماذا حدث ولماذا لم تُبلَّغ المنسّقة؟',
            en: 'The only two facts are that the spaces were not arranged as agreed and that the coordinator was not informed — both can be checked or asked about. "Does not respect us" and "thinks he is the most important" are interpretations of intent and character. The next step is to hear Rami and ask him: what happened, and why was the coordinator not informed?',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'de-escalation',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: {
        ar: 'تخفيض التصعيد',
        en: 'De-escalation',
      },
      lede: {
        ar: 'التصعيد لا يحدث دفعةً واحدة — يمرّ بمراحل، وفي كل مرحلة ثمّة نقطة تدخّل.',
        en: 'Escalation does not happen all at once — it passes through stages, and at each stage there is a point of intervention.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التصعيد نمط حواري قبل أن يكون مشكلة شخصية. يبدأ حين يشعر أحد الطرفين بأنه لم يُسمَع، فيرفع صوته — مجازياً أو حرفياً — ليُسمَع. الطرف الآخر يفسّر الرفع كتهديد أو استفزاز فيردّ بالمقابل، وتدور الحلقة حتى تخرج المحادثة من موضوعها الأصلي وتصبح حول مَن له الحق في الكلام ومَن يُهمَل. الشيء الأكثر فاعلية في هذه اللحظة ليس شرح سبب خطأ الطرف الآخر، ولا مطالبة أيٍّ منهما بالهدوء — بل قطع الحلقة جسدياً وعاطفياً في آنٍ واحد. المتطوّع الذي يدير اجتماعاً أو يقف بين طرفَي خلاف يملك قدرة حقيقية على هذا القطع إن عرف اللحظة المناسبة وامتلك الأداة الملائمة. تخفيض التصعيد ليس تهدئة المشاعر فقط وإسكاتها تحت السطح — هو إعادة توجيه الطاقة من المواجهة إلى حلّ المشكلة التي كانت في الأصل هي سبب التجمّع.',
            en: 'Escalation is a conversational pattern before it is a personal problem. It begins when one side feels unheard and raises their voice — literally or figuratively — to be heard. The other side reads the raising as a threat or provocation and responds in kind, and the loop continues until the conversation leaves its original subject and becomes about who has the right to speak and who is being dismissed. The most effective thing at that moment is not explaining why the other party is wrong, nor demanding that either of them calm down — it is cutting the loop physically and emotionally at the same time. A volunteer managing a meeting or standing between two parties has a real ability to make that cut, if they recognise the right moment and have the right tool. De-escalation is not just calming emotions and silencing them below the surface — it is redirecting energy from confrontation to solving the problem that was the original reason for gathering.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'توقّف المحادثة جسدياً إن لزم: «دعونا نأخذ دقيقتين قبل المتابعة» — الصمت الصغير يقطع الزخم',
              'اعترف بالمشاعر قبل الحلول: «أفهم أن هذا الموضوع مهمّ ومحبط — هذا مفهوم تماماً»',
              'تحدّث بصوت هادئ ومتعمَّد البطء — الصوت المرتفع يصعد مع المرتفع، والهادئ يسحب نحو الهادئ',
              'حوّل الحديث من «مَن يقول ماذا» إلى «ما الذي نحاول حلّه معاً»: «ما الهدف الذي نريد الوصول إليه هنا؟»',
              'إن فشل كل ذلك، أنهِ الجلسة واقترح موعداً جديداً: «يبدو أننا بحاجة لوقت — هل نلتقي غداً في وقت أهدأ؟»',
            ],
            en: [
              'Stop the conversation physically if necessary: "let\'s take two minutes before continuing" — a small silence cuts the momentum',
              'Acknowledge feelings before solutions: "I understand this topic is important and frustrating — that makes complete sense"',
              'Speak in a calm and deliberately slow voice — a raised voice rises to meet a raised voice, and a quiet one draws the quiet out',
              'Shift from "who is saying what" to "what are we trying to solve together": "what is the goal we want to reach here?"',
              'If all of that fails, end the session and propose a new time: "it seems we need some space — can we meet tomorrow at a calmer moment?"',
            ],
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'استخدم «أنا» لا «أنت»: «أنا أشعر بالقلق من مسار هذا الحوار» تفتح، «أنتَ متعصّب» تغلق',
              'ابحث عن نقطة اتفاق صغيرة تعود إليها: «أعتقد أننا متّفقان أننا نريد الأفضل للناس الذين نخدمهم»',
              'لا تقاطع التصعيد بالتفسير — انتظر حتى ينتهي الشخص من جملته ثم اسأل سؤالاً مفتوحاً واحداً',
              'لا تتطوّع بالحكم على مَن بدأ — هذا يحوّل طاقة الجلسة نحو إثبات الذنب لا إيجاد الحلّ',
              'دع كلاً منهما يُكمل جملته الكاملة — المقاطعة تُعيد التصعيد من نقطة الصفر',
              'جسدك يتكلّم أيضاً: تجنّب التحديق المتواصل، احتفظ بوضعية منفتحة وثابتة، لا تضغط على لهجتك',
            ],
            en: [
              'Use "I" not "you": "I am concerned about where this conversation is going" opens things; "you are being stubborn" closes them',
              'Find a small point of agreement to return to: "I think we agree we both want the best for the people we serve"',
              'Do not interrupt the escalation with an explanation — wait until the person finishes their sentence, then ask one open question',
              'Do not volunteer a judgement on who started it — that redirects the session\'s energy toward proving guilt rather than finding a solution',
              'Let each person complete their full sentence — interrupting restarts the escalation from zero',
              'Your body speaks too: avoid continuous staring, keep an open and steady posture, and do not tighten your tone',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'cr-q3',
          label: { ar: 'اختر الاستجابة الصحيحة', en: 'Choose the right response' },
          scenario: {
            ar: 'في اجتماع فريق، رفع نادر صوته على زميله قائلاً: «أنتَ دائماً تفعل هذا — لا تسمع لأحد ولا تحترم قرارات الفريق!» وبدأ الزميل يستعدّ للردّ.',
            en: 'In a team meeting, Nader raised his voice at a colleague: "You always do this — you never listen to anyone and you do not respect the team\'s decisions!" The colleague was preparing to respond in kind.',
          },
          question: {
            ar: 'ما أفضل استجابة فورية كمُدير للاجتماع؟',
            en: 'What is the best immediate response as meeting facilitator?',
          },
          options: [
            { ar: 'اطلب من نادر أن يهدأ لأن أسلوبه غير لائق في الاجتماعات', en: 'Ask Nader to calm down because his manner is inappropriate in meetings' },
            {
              ar: 'أوقف الاجتماع، اعترف بأن الموضوع مهمّ، واقترح توقّفاً قصيراً قبل المتابعة',
              en: 'Pause the meeting, acknowledge that the topic matters, and suggest a short break before continuing',
            },
            { ar: 'اطلب من الزميل أن يردّ لأن ذلك حقّه', en: 'Ask the colleague to respond because that is their right' },
            { ar: 'واصل الاجتماع وتجاهل ما حدث حتى تمرّ اللحظة', en: 'Continue the meeting and ignore what happened until the moment passes' },
          ],
          correct: 1,
          feedback: {
            ar: 'طلب الهدوء بصيغة المطالبة («اهدأ لأن أسلوبك غير لائق») يُصوّر نادر كمشكلة لا كشخص يعبّر عن شيء حقيقي، ويدفعه للدفاع عن أسلوبه عوض التعامل مع المضمون. إيقاف الجلسة مؤقتاً دون توجيه اتهام لأحد، مع الاعتراف بأهمية الموضوع، يقطع الزخم ويُعيد الجميع إلى وضع يمكن فيه الحوار الفعلي.',
            en: 'Demanding calm ("calm down because your manner is inappropriate") frames Nader as the problem rather than as someone expressing something real, and pushes him to defend his manner rather than engage with the content. Pausing the session temporarily without accusing anyone, while acknowledging that the topic matters, cuts the momentum and returns everyone to a position where actual dialogue is possible.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'mediation',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: {
        ar: 'إدارة الوساطة والوصول إلى اتفاق',
        en: 'Managing mediation and reaching an agreement',
      },
      lede: {
        ar: 'الوساطة ليست جلسة يجلس فيها الطرفان حتى يتعبا من الخلاف — هي عملية منظّمة بخطوات واضحة وناتج موثّق.',
        en: 'Mediation is not a session where both sides sit until they tire of disagreeing — it is a structured process with clear steps and a documented outcome.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'دور الوسيط ليس الحكم ولا الإصلاح — هو تهيئة الظروف التي تسمح للطرفين بسماع بعضهما وإيجاد حلٍّ يلتزم به كلٌّ منهما. الاتفاق الذي يفرضه وسيط لا يصمد، لأن من يُفرَض عليه القرار لا يملك سبباً حقيقياً للالتزام به وسيجد طريقة للتحايل عليه عاجلاً أم آجلاً. الاتفاق الذي توصّل إليه الطرفان بأنفسهما — ولو بمساعدة — يصمد لأن كلاً منهما يملك حصّة فيه ويشعر بالمسؤولية نحوه. ولهذا فمهمّة الوسيط الذكية ليست إيجاد الحلّ الصحيح، بل طرح الأسئلة الصحيحة التي تجعل الطرفين يجدانه. «ما الذي تحتاجه كي تستطيع المضيّ قدماً في هذا؟» سؤال أقوى من «هل تقبل هذا الاقتراح؟» لأنه يجعل الشخص ينظر نحو الأمام لا نحو الخلف، ويبحث عن احتياجاته الحقيقية لا عن التثبّت في موقفه.',
            en: 'The mediator\'s role is not to judge or to fix — it is to create the conditions that let both sides hear each other and find a solution they will each commit to. An agreement that a mediator imposes does not hold, because whoever has a decision imposed on them has no real reason to honour it and will find a way around it sooner or later. An agreement the parties reached themselves — even with help — holds because each of them has a stake in it and feels responsibility toward it. This is why the skilled mediator\'s job is not to find the right solution, but to ask the right questions that let the parties find it themselves. "What do you need in order to be able to move forward with this?" is a stronger question than "do you accept this proposal?" because it makes the person look forward rather than back, and search for their real needs rather than entrench in their position.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'الإعداد: التقِ بكل طرف منفرداً قبل الجلسة المشتركة — لفهم موقفه وليس لأخذ جانبه',
              'فتح الجلسة: وضّح دورك («أنا هنا لأساعد في الحوار لا لأحكم»)، والهدف، وقواعد الجلسة',
              'الاستماع المتتالي: اسمع كل طرف يكمل روايته الكاملة دون مقاطعة، ثم أعِد صياغة ما سمعته للتأكيد',
              'تحديد المشترك: ابحث عن مصالح مشتركة خلف المواقف المتعارضة — «كلاكما يريد أن ينجح هذا البرنامج»',
              'توليد الخيارات: اطلب من كل طرف اقتراح حلٍّ أو أكثر، ولو جزئياً، ولا تُقيّم الاقتراحات في هذه المرحلة',
              'توثيق الاتفاق: ما الذي سيفعله كل طرف تحديداً، ومتى، وكيف يعرفان أن الاتفاق قد نُفّذ فعلاً',
              'المتابعة: حدّد موعد مراجعة قصير بعد أسبوع أو أسبوعين للتحقّق من الالتزام',
            ],
            en: [
              'Preparation: meet each party separately before the joint session — to understand their position, not to take their side',
              'Opening: clarify your role ("I am here to help the dialogue, not to judge"), the goal, and the session rules',
              'Sequential listening: hear each party complete their full account without interruption, then reflect back what you heard to confirm',
              'Finding common ground: look for shared interests behind the opposing positions — "you both want this programme to succeed"',
              'Generating options: ask each party to propose one or more solutions, even partial ones, and do not evaluate proposals at this stage',
              'Documenting the agreement: what each party will do specifically, by when, and how they will both know it has actually been carried out',
              'Follow-up: set a short review appointment in a week or two to check on compliance',
            ],
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'الاتفاق الجيّد', en: 'A good agreement' },
              text: {
                ar: 'محدّد بأسماء وتواريخ وأفعال قابلة للقياس. «سنتواصل بشكل أفضل» ليس اتفاقاً. «سيرسل رامي ملخّص كل اجتماع لليلى خلال أربع وعشرين ساعة» اتفاق حقيقي يمكن قياسه.',
                en: 'Specific with names, dates and measurable actions. "We will communicate better" is not an agreement. "Rami will send Layla a summary of each meeting within twenty-four hours" is a real agreement that can be measured.',
              },
            },
            {
              title: { ar: 'التوثيق المكتوب', en: 'Written documentation' },
              text: {
                ar: 'ليس لأن الطرفين لا يُوثق بهما، بل لأن الذاكرة تؤوّل مع مرور الوقت. وثيقة بسيطة بجملتين يوافق عليها كلاهما تُعيد الاتفاق إلى حالته الأصلية حين تُنسى التفاصيل أو يتباعد المفهوم.',
                en: 'Not because the parties cannot be trusted, but because memory reinterprets over time. A simple document with two sentences that both approve returns the agreement to its original form when details are forgotten or understanding drifts.',
              },
            },
            {
              title: { ar: 'متابعة الاتفاق', en: 'Following up on the agreement' },
              text: {
                ar: 'اتفاق بلا متابعة هو نيّة لا التزام. موعد مراجعة بعد أسبوع يرسل رسالة أن الاتفاق حقيقي وأن هناك مساءلة — وهذا وحده يرفع احتمال الالتزام به.',
                en: 'An agreement without follow-up is an intention, not a commitment. A review meeting after a week sends the message that the agreement is real and that there is accountability — and that alone raises the likelihood of compliance.',
              },
            },
          ],
        },
        {
          type: 'quiz',
          id: 'cr-q4',
          label: { ar: 'سيناريو وساطة', en: 'Mediation scenario' },
          scenario: {
            ar: 'بعد ساعة من الجلسة، اتّفق الطرفان على خطوات محدّدة: سلمى ستُرسل جدول المهام كل إثنين، وطارق سيُبلّغها فوراً حين يواجه عائقاً. سألتَهما إن كانا موافقَين فأجابا بنعم.',
            en: 'After an hour, both parties agreed on specific steps: Salma will send the task list every Monday, and Tariq will notify her immediately when he faces an obstacle. You asked both if they agreed and they said yes.',
          },
          question: {
            ar: 'ما الخطوة الأهمّ الآن؟',
            en: 'What is the most important next step now?',
          },
          options: [
            { ar: 'شكر الطرفين وإنهاء الجلسة — الأمر انتهى', en: 'Thank both parties and close the session — it is done' },
            {
              ar: 'تدوين الاتفاق كتابةً بوضوح وتحديد موعد متابعة لمراجعة مدى التنفيذ',
              en: 'Write the agreement down clearly and set a follow-up date to review how it has been implemented',
            },
            { ar: 'إبلاغ الإدارة بتفاصيل ما دار في الجلسة كاملاً', en: 'Inform management of the full details of everything discussed in the session' },
            { ar: 'الانتظار، وإن لم يلتزما سيُبلَّغ عنهما لاحقاً', en: 'Wait and see, and if they do not comply they can be reported later' },
          ],
          correct: 1,
          feedback: {
            ar: 'الاتفاق الشفهي يتلاشى سريعاً تحت الضغط اليومي — لا لأن الطرفين يكذبان بل لأن التفاصيل تُنسى وتُعاد صياغتها. كتابة الاتفاق وتحديد موعد مراجعة يحوّلانه من نيّة حسنة إلى التزام حقيقي. إبلاغ الإدارة بتفاصيل الجلسة دون موافقة الطرفين ينتهك سرية الوساطة ويهدم الثقة التي بنيتَها.',
            en: 'A verbal agreement dissolves quickly under daily pressure — not because the parties are lying but because details are forgotten and reformulated. Writing the agreement and setting a review date turns it from a good intention into a real commitment. Informing management of the session\'s details without the parties\' consent violates mediation confidentiality and destroys the trust you built.',
          },
        },
        {
          type: 'quiz',
          id: 'cr-q5',
          label: { ar: 'مهارة الصياغة', en: 'Wording skill' },
          question: {
            ar: 'أيٌّ من هذه الصياغات يصلح بنداً في اتفاق وساطة مكتوب؟',
            en: 'Which of the following works as a clause in a written mediation agreement?',
          },
          options: [
            { ar: 'سيحاول الطرفان تحسين التواصل فيما بينهما', en: 'Both parties will try to improve their communication with each other' },
            { ar: 'ستتجنّب ليلى التصرّف بأنانية في المستقبل', en: 'Layla will avoid acting selfishly in the future' },
            {
              ar: 'سيُرسل خالد ملاحظات اجتماع الفريق لليلى خلال أربع وعشرين ساعة من نهاية كل اجتماع',
              en: 'Khalid will send Layla the team meeting notes within twenty-four hours of each meeting ending',
            },
            { ar: 'سيحاول الطرفان الانسجام والتعاون بشكل أفضل في المستقبل', en: 'Both parties will try to get along and cooperate better in the future' },
          ],
          correct: 2,
          feedback: {
            ar: 'الاتفاق الجيد يحتوي على فعل محدّد (إرسال)، وفاعل باسمه (خالد)، ومستقبل باسمها (ليلى)، وإطار زمني واضح (أربع وعشرون ساعة من نهاية كل اجتماع). الصياغات الأخرى نوايا لا يمكن قياسها: «تحسين التواصل» و«الانسجام» و«الأنانية» مفاهيم يفسّرها كل شخص بطريقة مختلفة ولا تسمح بأي مساءلة موضوعية.',
            en: 'A good agreement contains a specific action (sending), a named doer (Khalid), a named receiver (Layla), and a clear timeframe (twenty-four hours after each meeting ends). The other formulations are unmeasurable intentions: "improving communication," "getting along," and "selfishness" are concepts each person interprets differently and that permit no objective accountability.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'escalation-limits',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: {
        ar: 'متى يتجاوز النزاع صلاحيتك',
        en: 'When a conflict exceeds your authority',
      },
      lede: {
        ar: 'إدراك حدود دورك شرط النزاهة — وليس اعترافاً بالعجز.',
        en: 'Recognising the limits of your role is a condition of integrity — not an admission of failure.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'المتطوّع الذي يتعامل مع كل نزاع بنفسه لأنه يريد المساعدة يتجاهل أنه أحياناً يجعل الأمور أسوأ. ثمّة نزاعات تتجاوز حدود الوساطة غير الرسمية: حين يتضمّن النزاع اتهامات بالتحرّش أو التمييز أو العنف، يصبح توثيقه والإبلاغ عنه واجباً لا خياراً. وحين يتضمّن خطراً جسيماً على سلامة شخص — جسدية أو نفسية — فمحاولة التعامل معه بأدوات الوساطة العادية قد تُؤخّر التدخّل الضروري الوحيد المؤهَّل له. دورك حين تصل إلى هذا الحدّ لا يتوقّف عند الصمت ولا يمتدّ إلى حلّ كل شيء — هو التوثيق الدقيق والإحالة السريعة مع الحفاظ على خصوصية الأطراف قدر المستطاع. «تجاوز صلاحيتي» ليست جملة اعتذار — هي جملة مسؤولية مهنية تعني أنك تعرف ما صُمِّم دورك من أجله وما لم يُصمَّم من أجله، وأنك تحمي الأشخاص من خطأ التدخّل الخاطئ بنفس القدر الذي تحميهم من خطأ عدم التدخّل.',
            en: 'A volunteer who handles every conflict alone because they want to help ignores that sometimes they make things worse. There are conflicts that go beyond informal mediation limits: when a conflict includes allegations of harassment, discrimination, or violence, documenting and reporting it becomes a duty, not an option. When it includes a serious risk to someone\'s safety — physical or psychological — attempting to handle it with ordinary mediation tools may delay the only intervention that is qualified to help. Your role when you reach this boundary does not stop at silence and does not extend to solving everything — it is accurate documentation and prompt referral while preserving the parties\' privacy as far as possible. "This is past my authority" is not a sentence of apology — it is a sentence of professional responsibility, meaning you know what your role was designed for and what it was not, and that you protect people from the wrong kind of intervention just as much as from the absence of intervention.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'النزاع يتضمّن اتهامات بالتحرّش الجنسي أو التمييز على أساس الهوية — حوّله فوراً إلى الجهة المختصة',
              'أحد الطرفين يعبّر عن الخوف الجسدي من الآخر أو يبدو عليه ذلك — أبلغ فوراً',
              'النزاع بين متطوّع ومشرفه المباشر في مسألة تمسّ التقييم أو الانضباط — خارج دورك',
              'أحد الطرفين يرفض المشاركة في الوساطة رفضاً قاطعاً — لا يمكنك إجباره ولا يجب أن تفعل',
              'جرّبت الوساطة مرّة ولم تُجدِ — الإصرار بأدوات فشلت مرّة لن ينجح في المرّة الثانية',
              'النزاع يمسّ سياسات المنظمة أو الحوكمة أو تضارب المصالح — تحويل رسمي لا مناص منه',
              'أنت نفسك طرف في النزاع أو لديك مصلحة مباشرة في نتيجته — وساطة صاحب المصلحة محكوم عليها بالفشل',
            ],
            en: [
              'The conflict involves allegations of sexual harassment or identity-based discrimination — refer it immediately to the appropriate authority',
              'One party expresses or shows signs of physical fear of the other — report it immediately',
              'The conflict is between a volunteer and their direct supervisor on a matter touching evaluation or discipline — outside your role',
              'One party refuses categorically to participate in mediation — you cannot force them and must not try',
              'Mediation was already tried once and did not work — persisting with a tool that failed once will not succeed a second time',
              'The conflict touches organisational policies, governance, or conflict of interest — a formal referral is unavoidable',
              'You yourself are a party to the conflict or have a direct interest in its outcome — a stakeholder mediating is guaranteed to fail',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: {
            ar: 'حوّل النزاع — لا تحتجزه',
            en: 'Refer the conflict — do not hold it',
          },
          content: {
            ar: 'الوسيط الذي يحتجز نزاعاً يتجاوز صلاحياته — لأنه يريد المساعدة أو لأنه يخشى الاعتراف بالحدود — يُؤخّر تدخّلاً ضرورياً وقد يتحمّل مسؤولية قانونية أو أخلاقية إن تفاقم الوضع. «تجاوز صلاحيتي» دليل نضج مهني، لا اعتراف بالعجز. المشرف أو قسم الموارد البشرية موجودان بالتحديد للحالات التي تبلغ فيها الوساطة غير الرسمية حدودها.',
            en: 'A mediator who holds a conflict that exceeds their authority — because they want to help or because they fear acknowledging limits — delays a necessary intervention and may bear legal or ethical responsibility if things worsen. "This is past my authority" is a sign of professional maturity, not an admission of incapacity. A supervisor or HR function exists precisely for the cases where informal mediation has reached its limits.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: {
            ar: 'كيف تُحيل النزاع بطريقة لائقة',
            en: 'How to refer a conflict with dignity',
          },
          content: {
            ar: 'الإحالة ليست قطعاً لعلاقتك مع الطرفين ولا رفضاً للمساعدة. يمكنك أن تقول: «هذا يحتاج شخصاً يملك صلاحيات أوسع مني وأدوات أكثر. سأساعدك في الوصول إليه إن أردت، وأنا متاح.» الإحالة الجيدة تشرح لكليهما لماذا تتمّ، وتضمن وصولهما للجهة المختصة فعلاً لا تركهما في الهواء.',
            en: 'A referral is not a severing of your relationship with the parties or a refusal to help. You can say: "this needs someone with wider authority and more tools than I have. I can help you reach them if you want, and I am here." A good referral explains to both parties why it is happening, and ensures they actually reach the relevant authority rather than being left without support.',
          },
        },
        {
          type: 'quiz',
          id: 'cr-q6',
          label: { ar: 'سيناريو حسّاس', en: 'A sensitive scenario' },
          scenario: {
            ar: 'أخبرتك متطوّعة في سرية تامة أن مشرفها يعلّق باستمرار على مظهرها الجسدي أمام الزملاء وهي تشعر بعدم الارتياح، وتريد منك مساعدتها في «الحديث معه غير رسمياً».',
            en: 'A volunteer told you in complete confidence that her supervisor repeatedly comments on her physical appearance in front of colleagues and she feels uncomfortable, and she wants your help to "have an informal word with him."',
          },
          question: {
            ar: 'ما استجابتك الصحيحة؟',
            en: 'What is the right response?',
          },
          options: [
            {
              ar: 'تتصرّف بناءً على طلبها وتجلس مع المشرف لـ«حديث غير رسمي» لأنها طلبت ذلك منك',
              en: 'Act on her request and sit with the supervisor for an "informal word" because she asked you to',
            },
            { ar: 'تتجاهل الأمر لأنه شأن بين المشرف وموظّفته ولا يخصّك', en: 'Ignore it because it is between the supervisor and his team member and is not your business' },
            {
              ar: 'تُخبرها بوضوح أن هذا يتجاوز دورك، تشرح لها خيارات الإبلاغ المتاحة، وتعرض مرافقتها إن أرادت',
              en: 'Tell her clearly that this goes beyond your role, explain the reporting options available to her, and offer to accompany her if she wishes',
            },
            { ar: 'تُبلّغ الإدارة فوراً بكل ما أخبرتك إياه دون استئذانها', en: 'Report everything she told you to management immediately without asking her permission' },
          ],
          correct: 2,
          feedback: {
            ar: 'ما وصفته احتمال تحرّش في بيئة العمل — وهذا خارج الوساطة غير الرسمية تماماً ويستلزم قناة إبلاغ رسمية. «حديث غير رسمي» مع مشرفها قد يُربك الأدلة ويعرّضها لانتقام مغطّى دون أي حماية حقيقية. والإبلاغ دون موافقتها يسرق منها السيطرة على موقفها في لحظة هي أكثر ما تحتاج فيها إلى هذه السيطرة. الاستجابة الصحيحة تمنحها المعلومة والخيار والدعم دون أن تتخطّى دورك ودون أن تتركها وحدها.',
            en: 'What she described is a potential workplace harassment situation — entirely outside informal mediation and requiring a formal reporting channel. An "informal word" with her supervisor may disturb any evidence and expose her to covered retaliation with no real protection. Reporting without her consent takes control from her at the moment she most needs it. The right response gives her information, choice, and support without overstepping your role and without leaving her alone.',
          },
        },
      ],
    },
  ],
};
