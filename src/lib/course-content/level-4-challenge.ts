import type { CourseContent } from './types';

/**
 * Level 4 Challenge: Running a Difficult Meeting
 *
 * A challenge tests whether the level's courses have joined up — nothing
 * here teaches anything new. Every question requires the volunteer to hold
 * facilitation, mediation, negotiation and inclusion together at once, not
 * one after another. A volunteer who memorised four separate toolkits will
 * pass the courses and fail this.
 *
 * The scenario is a single coordination meeting carrying three live problems:
 * an unresolved historical grievance, a party with a fixed negotiating
 * position, and a person nobody has been listening to. The meeting must end
 * with a written shared decision. There is no comfortable sequence that
 * solves one problem cleanly before the next appears.
 */

export const levelFourChallenge: CourseContent = {
  slug: 'level-4-challenge',
  level: 4,
  minutes: 45,
  passMark: 70,
  title: {
    ar: 'مراجعة المستوى الرابع: إدارة اجتماع متأزّم',
    en: 'Level 4 Review: Running a Difficult Meeting',
  },
  lede: {
    ar: 'اجتماع فيه خلاف قديم، وطرف يفاوض، وشخص لا يُسمع صوته، وقرار مشترك لا بد من الخروج به.',
    en: 'A meeting carrying an old disagreement, a party negotiating, a person nobody is hearing, and a shared decision that has to be reached.',
  },
  outcomes: {
    ar: [
      'تُيسّر اجتماعاً متأزّماً وتخرج منه بقرار مشترك موثّق',
      'توازن بين التفاوض والوساطة والدمج في موقف واحد',
      'تتعرّف على من غاب صوته وتُعيده إلى النقاش',
    ],
    en: [
      'Facilitate a tense meeting to a documented shared decision',
      'Balance negotiation, mediation and inclusion within one situation',
      'Notice whose voice is missing and bring it back into the discussion',
    ],
  },
  sources: [
    'IFRC — Handbook on Facilitation Skills for Red Cross and Red Crescent Volunteers',
    'Core Humanitarian Standard on Quality and Accountability (CHS), 2024 edition',
    'UN Volunteers — Effective Coordination and Meeting Facilitation Guide',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'l4c-prep',
      tag: { ar: 'قبل الاجتماع', en: 'Before the meeting' },
      title: {
        ar: 'الاستعداد: ما تعرفه قبل أن تفتح الباب',
        en: 'Preparation: What you know before the door opens',
      },
      lede: {
        ar: 'المنظّمتان الشريكتان تجتمعان لتوزيع الموارد للربع القادم. معك ورقة أجندة، وتقرير من الشهر الماضي يقول إن الاجتماع السابق «انتهى بلا اتفاق».',
        en: 'The two partner organisations are meeting to distribute resources for the coming quarter. You have an agenda and a report from last month that says the previous meeting "ended without agreement".',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'وصلت إلى غرفة الاجتماع قبل ربع ساعة. على الطاولة ثلاثة مقاعد خالية، وعلى الجانب الأيمن جلست مجموعة من ممثلي منظمة «الفجر»، وعلى الأيسر ممثلو «الأمل». لاحظت أنهم رتّبوا أنفسهم على شكل مجموعتين منفصلتين دون أن يطلب أحد ذلك، ولا يتحدّث أحد مع أحد من الجانب الآخر. على الطاولة أمامك ورقة الأجندة: البند الأول توزيع موارد التدريب، البند الثاني تحديد الأولويات الميدانية، البند الثالث بنود متفرقة.\n\nقبل وصول الجميع، تصلك رسالة قصيرة من منسّق منظمة الفجر يقول فيها إنه سيطرح في بداية الاجتماع «مسألة حرجة» تتعلق بالأشهر الثلاثة الماضية ولن يتفاوض بشأنها. هذا المنسّق عمل في المنطقة منذ سبع سنوات، وهو يتكلّم بثقة عالية ويميل إلى شغل معظم وقت الكلام في الاجتماعات. في الوقت نفسه، تعرف من تقارير سابقة أن منظمة الأمل لم تستطع توصيل رسائلها بوضوح في الاجتماعات الأخيرة، وأن منسّقتها الشابة تميل إلى التراجع وقبول الصياغات التي تقترحها الطرف الأقوى صوتاً حتى وإن لم تعكس موقفها الحقيقي.\n\nهناك أيضاً اسم جديد على قائمة الحضور: المنسّق الميداني للمجتمع المضيف. لم يحضر اجتماعاً مشتركاً من قبل، ولا تعرف ما توقّعاته من هذه الجلسة.\n\nمهمّتك اليوم ليست التحكيم ولا إلزام أحد، بل تيسير نقاش يخرج منه الطرفان بقرار مكتوب يلتزمان به فعلاً. هذا صعب بمعنى الكلمة: أنت لا تمتلك سلطة رسمية على أي من الطرفين، لكن تمتلك الأجندة والوقت وشرعية إدارة الحوار. وهذه الأدوات الثلاثة أقوى مما تبدو عليه إذا استُخدمت بوعي.',
            en: 'You arrive at the meeting room fifteen minutes early. Three chairs are empty at the table; on the right side sit representatives from "Al-Fajr" organisation and on the left side representatives from "Al-Amal". You notice they have arranged themselves into two separate clusters without anyone asking them to, and no one is speaking to anyone on the other side. In front of you on the table is the agenda: item one, distributing training resources; item two, setting field priorities; item three, any other business.\n\nBefore everyone arrives, you receive a short message from the Al-Fajr coordinator saying he will raise a "critical matter" at the start of the meeting relating to the past three months, and that he will not negotiate on it. This coordinator has worked in the area for seven years; he speaks with high confidence and tends to take up most of the speaking time in meetings. At the same time, you know from previous reports that Al-Amal has struggled to communicate its points clearly in recent meetings, and that its young coordinator tends to back down and accept formulations proposed by the louder party even when they do not reflect her actual position.\n\nThere is also a new name on the attendance list: the field coordinator from the host community. He has not attended a joint meeting before, and you do not know what he expects from this session.\n\nYour task today is not to arbitrate or to compel anyone, but to facilitate a discussion that ends with a written decision both parties genuinely commit to. That is difficult in the precise sense of the word: you hold no formal authority over either party, but you do hold the agenda, the time, and the legitimate right to manage the conversation. These three tools are more powerful than they appear if used with awareness.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'ترتيب الجلوس المنفصل: يعزّز الحدود بين الطرفين ويقلّل التواصل العابر قبل أن يبدأ النقاش — يستحق معالجة هادئة قبل البدء',
              'رسالة الموقف المسبق: إعلان موقف صارم قبل الاجتماع يختلف عن المفاوضة ويمكن أن يُغلق النقاش قبل أن يُفتح إذا لم يُتعامل معه بدقة',
              'الصوت الخافت: منسّقة الأمل الشابة معرضة لأن تُطغى عليها الأصوات الأعلى وأن تُوقَّع على ما لم تقله فعلاً — تحتاج مراقبة نشطة طوال الاجتماع',
              'الوجه الجديد: المنسّق الميداني لم يُدمج بعد في ديناميكية الاجتماعات ولن يتكلّم دون دعوة صريحة — وقد يحمل الزاوية التي تغيّر مسار النقاش',
              'غياب توثيق الاجتماع السابق: الملفات المعلّقة ستعود اليوم، وستعود في صورة مطالب لا مناقشات',
            ],
            en: [
              'Separate seating arrangement: reinforces dividing lines and reduces cross-party communication before the discussion starts — worth a quiet intervention before you begin',
              'Pre-meeting position statement: announcing a firm position before the meeting is different from negotiating and can close down discussion before it opens if not handled carefully',
              'The quiet voice: the young Al-Amal coordinator is at risk of being drowned out by louder voices and of signing off on things she did not actually say — needs active monitoring throughout the meeting',
              'The new face: the field coordinator has not been integrated into the meeting dynamic yet and will not speak without an explicit invitation — he may carry the angle that shifts the discussion',
              'Absent documentation from the last meeting: unresolved files will return today, and they will return as demands, not discussions',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'l4c-q1',
          label: { ar: 'قرارك في الاجتماع', en: 'Your decision' },
          question: {
            ar: 'الجميع وصل وجلس. قبل أن تبدأ الأجندة، كيف تتعامل مع ترتيب الجلوس الذي يجعل الطرفين في كتلتين منفصلتين؟',
            en: 'Everyone has arrived and is seated. Before starting the agenda, how do you handle the seating arrangement that places both parties in two separate clusters?',
          },
          options: [
            {
              ar: 'تتجاهله — المهم هو الموضوع الذي سيُناقَش لا أين يجلس الناس',
              en: 'Ignore it — what matters is the subject to be discussed, not where people sit',
            },
            {
              ar: 'تقترح بهدوء إعادة الترتيب بحيث يتناوب الجلوس بين الطرفين، وتشرح بجملة واحدة أن هذا الأسلوب يسهّل تدفق الحوار',
              en: 'Gently suggest rearranging so both sides alternate seats, and explain in one sentence that this tends to make conversation flow better',
            },
            {
              ar: 'تطلب من الجميع الوقوف وإعادة الجلوس بشكل عشوائي دون إعطاء سبب',
              en: 'Ask everyone to stand and reseat themselves randomly without giving a reason',
            },
            {
              ar: 'تبدأ الاجتماع وتتدخّل في موضوع الجلوس فقط إذا بدا الخلاف واضحاً',
              en: 'Start the meeting and address the seating only if visible conflict breaks out',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الجلوس ليس تفصيلاً بل بيئة، والبيئة تؤثّر في كيف يسمع الناس بعضهم بعضاً وكيف يبنون أحكامهم. الخيار الأول يترك الطرفين في خندقيهما ويُشجّع على التفكير الجماعي الانعزالي. طلب الوقوف والعشوائية دون سبب يبدو تعسّفياً وقد يبدأ الاجتماع بنبرة تحدٍّ لا تريدها. انتظار ظهور الخلاف يعني أنك ستتدخّل في لحظة شحن لا في لحظة هدوء، حين يكون التدخّل أصعب وأقل فاعلية. الاقتراح الهادئ مع الشرح يحترم استقلالية الحضور ويعطيهم سبباً يقبلونه لا أمراً يشعرون بالإكراه عليه — وهو ما يجعل الخطوة الأولى رسالة عن كيف ستُدار الجلسة.',
            en: 'Seating is not a detail, it is environment, and environment shapes how people hear each other and form their judgements. The first option leaves both parties in their trenches and encourages insular group thinking. Asking people to stand and shuffle randomly without explanation feels arbitrary and could open the meeting on a defiant note you do not want. Waiting for conflict to emerge means you intervene in a heated moment rather than a calm one, when intervention is harder and less effective. A gentle suggestion with an explanation respects the autonomy of those present and gives them a reason they can accept rather than an instruction they feel compelled to obey — and that makes the first step a signal about how the session will be run.',
          },
        },
        {
          type: 'quiz',
          id: 'l4c-q2',
          label: { ar: 'قرارك في الاجتماع', en: 'Your decision' },
          question: {
            ar: 'بعد الترحيب، منسّق الفجر يتكلّم مباشرة: «قبل أي شيء آخر، أريد أن أُسجَّل في محضر الاجتماع أن منظمتكم أخذت مخصّصات التدريب للربع الماضي بطريقة لم يُتّفق عليها.» الجو يتجمّد فجأة. كيف تردّ؟',
            en: 'After the welcome, the Al-Fajr coordinator speaks immediately: "Before anything else, I want it recorded in the minutes that your organisation took last quarter\'s training allocation in a way we never agreed to." The room freezes. How do you respond?',
          },
          options: [
            {
              ar: 'تطلب منه تأجيل هذه النقطة إلى بند «متفرقات» لأنها ليست في الأجندة الرئيسية',
              en: 'Ask him to defer this point to "any other business" because it is not in the main agenda',
            },
            {
              ar: 'تشكره على طرح المسألة، وتقترح تخصيص وقت محدد لها مباشرة بعد البند الأول، وتطلب من الجميع تدوينها',
              en: 'Thank him for raising it, propose setting aside specific time for it right after item one, and ask everyone to note it',
            },
            {
              ar: 'تعطيه الكلمة الآن كاملاً — إذا كانت المسألة بالغة الأهمية بالنسبة إليه فهي تستحق أن تُعالَج أولاً',
              en: 'Give him the full floor now — if the matter is that important to him, it deserves to be dealt with first',
            },
            {
              ar: 'تطلب من ممثل الأمل أن يردّ فوراً ليسمع الطرفان بعضهما من البداية',
              en: 'Ask the Al-Amal representative to respond immediately so both sides can hear each other from the start',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'تأجيل المسألة إلى المتفرقات رسالة ضمنية بأنك لا تعدّها مهمة، وهو ما سيزيد من احتقان صاحبها ويجعله يعود إليها بعد كل بند. إعطاؤه الكلمة كاملاً الآن يُخرج الاجتماع عن مساره قبل أن يبدأ ويعطيه زمام الجلسة كلها. طلب الرد الفوري من الطرف الآخر يفتح مواجهة قبل أن يُبنى أي قدر من الثقة أو يُفهم أي سياق. الشكر مع اقتراح توقيت واضح يعترف بوزن ما قاله دون أن يتركه يتحوّل إلى مدخل لإغراق باقي الاجتماع — وهو يُبقي بنية الحوار بيدك مع احترام صاحب الشكوى.',
            en: 'Deferring to any other business sends an implicit message that you do not consider it important, which will compound his frustration and make him return to it after every item. Giving him the full floor now derails the meeting before it starts and hands him control of the whole session. Asking for an immediate reply from the other side opens a confrontation before any trust has been built or any context understood. Thanking him while proposing clear timing acknowledges the weight of what he said without letting it flood the rest of the meeting — and it keeps the structure of the conversation in your hands while respecting the person raising the concern.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'l4c-history',
      tag: { ar: 'الخلاف القديم', en: 'The old disagreement' },
      title: {
        ar: 'عندما تطفو المظالم',
        en: 'When grievances surface',
      },
      lede: {
        ar: 'وصلتم إلى البند الأول. لكن تحت النقاش يجري خلاف يعود لثلاثة أشهر. الأرقام على الطاولة ولكن التفسيرات مختلفة تماماً.',
        en: 'You have reached item one. But underneath the discussion runs a disagreement that goes back three months. The numbers are on the table but the interpretations are entirely different.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'منسّق الفجر يعرض جدولاً يقول إن منظمة الأمل استخدمت سبعين بالمئة من ميزانية التدريب المشتركة في الربع الأخير، في حين أن الاتفاق كان مناصفة متساوية. منسّقة الأمل ترد بأن الاتفاق كان مرناً ومرتبطاً بعدد المستفيدين لا بنسب ثابتة، وأن منظمتها سجّلت ضعف العدد الذي خدمته الفجر في تلك الفترة. لا يوجد محضر موثَّق من الاجتماع الذي جرى فيه هذا الاتفاق — هذا هو لبّ المشكلة.\n\nهذا النوع من الخلاف لا يُحلّ بالمزيد من الأرقام، لأن المشكلة ليست في الأرقام بل في ما اتُّفق عليه أصلاً. كلا الطرفين مقتنع بروايته، وكلتا الروايتين محتملة في غياب التوثيق. منسّق الفجر يقدّم روايته بنبرة حاسمة كأن الأمر موثَّق، ومنسّقة الأمل تتردّد أكثر مما ينبغي مع أنها تمتلك حجّة وجيهة.\n\nالفخّ الأكبر هنا هو أن يتحوّل الاجتماع إلى محكمة تحاول تحديد من كان محقاً في الربع الماضي. هذا لن ينتهي باتفاق بل بحكم على أحد الطرفين. دورك هو الإبقاء على الاجتماع موجّهاً نحو المستقبل: ما الذي يمكن الاتفاق عليه من الآن إلى الأمام، بآلية لا تترك مجالاً للتأويل في الربع القادم.',
            en: 'The Al-Fajr coordinator presents a table showing that Al-Amal used seventy per cent of the shared training budget last quarter, whereas the agreement was an equal fifty-fifty split. The Al-Amal coordinator replies that the agreement was flexible and linked to beneficiary numbers rather than fixed ratios, and that her organisation registered twice the number served by Al-Fajr in that period. There is no documented record from the meeting where this agreement was supposedly made — that is the heart of the problem.\n\nThis kind of disagreement cannot be resolved with more numbers, because the problem is not in the numbers but in what was actually agreed. Both parties are genuinely convinced of their account, and both accounts are plausible given the absence of documentation. The Al-Fajr coordinator presents his version with a decisive tone as if it were on record, while the Al-Amal coordinator hesitates more than she should despite having a sound argument.\n\nThe biggest trap here is for the meeting to turn into a court trying to determine who was right last quarter. That will not end in an agreement but in a verdict against one party. Your role is to keep the meeting oriented toward the future: what can be agreed from now forward, with a mechanism that leaves no room for interpretation in the coming quarter.',
          },
        },
        {
          type: 'quiz',
          id: 'l4c-q3',
          label: { ar: 'قرارك في الاجتماع', en: 'Your decision' },
          scenario: {
            ar: 'منسّق الفجر يقول بنبرة حازمة: «الأرقام واضحة ولا تحتاج تفسيراً. أنتم أخذتم أكثر مما يحق لكم ونريد تعويضاً في الربع القادم.» منسّقة الأمل تبدأ بالإجابة ثم تتوقّف وتنظر إليك.',
            en: 'The Al-Fajr coordinator says firmly: "The numbers are clear and need no interpretation. You took more than you were entitled to and we want compensation in the next quarter." The Al-Amal coordinator starts to reply, then stops and looks at you.',
          },
          question: {
            ar: 'كيف تدير هذه اللحظة دون أن تنحاز إلى أيٍّ من الطرفين؟',
            en: 'How do you manage this moment without appearing to side with either party?',
          },
          options: [
            {
              ar: 'تطلب من منسّقة الأمل أن تكمل ما بدأت بقوله',
              en: 'Ask the Al-Amal coordinator to finish what she started saying',
            },
            {
              ar: 'تُعيد صياغة ما قاله منسّق الفجر بلغة محايدة وتفتح المجال للطرفين: «يبدو أن هناك قلقاً من أن التوزيع لم يعكس التفاهم السابق. دعونا نسمع وجهتَي النظر»',
              en: 'Reframe what the Al-Fajr coordinator said in neutral language and open the floor to both: "It seems there is a concern that the distribution did not reflect the earlier understanding. Let us hear both perspectives"',
            },
            {
              ar: 'تقترح تشكيل لجنة مشتركة صغيرة لمراجعة أرقام الربع الماضي بعد الاجتماع',
              en: 'Propose forming a small joint committee to review last quarter\'s numbers after the meeting',
            },
            {
              ar: 'توضّح للجميع أن اجتماعاً بلا توثيق لا يُنتج اتفاقاً قابلاً للإثبات، وتطلب تجاوز الربع الماضي والانتقال إلى المستقبل',
              en: 'Clarify to everyone that a meeting without documentation cannot produce a provable agreement, and ask to leave last quarter behind and move to the future',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'إكمال ما بدأته منسّقة الأمل قد يُنتج ردّاً دفاعياً لأن الجو لا يزال مشحوناً ولأنها لم تجمع أفكارها بعد. اللجنة بعد الاجتماع تُؤجّل المشكلة ولا تحلّها، وقد لا تنعقد. إعلان أن الاتفاق غير موثَّق وتجاوزه بقرار أحادي منك هو تجاوز لصلاحيتك وتجاهل لشعور صاحب الشكوى. إعادة الصياغة بلغة محايدة تفعل ثلاثة أشياء في الوقت نفسه: تُظهر أنك سمعت صاحب القلق، وتُزيل الاتهام من اللغة دون إنكاره، وتفتح فضاءً يمكن للطرف الآخر أن يتكلّم فيه دون أن يشعر أنه يدافع عن نفسه في محكمة.',
            en: 'Asking the Al-Amal coordinator to continue may produce a defensive reply because the atmosphere is still charged and she has not gathered her thoughts yet. A post-meeting committee defers the problem rather than resolving it, and it may never meet. Declaring the agreement undocumented and bypassing it by your own decision is an overreach of your role and dismisses the feelings of the person raising the concern. Reframing in neutral language does three things at once: it shows you heard the concern, it removes the accusation from the language without denying it, and it opens a space where the other party can speak without feeling they are defending themselves in a trial.',
          },
        },
        {
          type: 'quiz',
          id: 'l4c-q4',
          label: { ar: 'قرارك في الاجتماع', en: 'Your decision' },
          question: {
            ar: 'منسّق الفجر يصرّ: «لا أريد إعادة صياغة، أريد اعترافاً بأن الأمر لم يسِر على ما يرام.» الجو متوتّر. ماذا تقول؟',
            en: 'The Al-Fajr coordinator insists: "I do not want reframing, I want an acknowledgement that things did not go right." The atmosphere is tense. What do you say?',
          },
          options: [
            {
              ar: 'تقول بوضوح إن دورك هو تيسير الحوار لا إصدار أحكام، وتعيد توجيه النقاش نحو الأمام',
              en: 'State clearly that your role is to facilitate the conversation, not to issue rulings, and redirect the discussion forward',
            },
            {
              ar: 'تطلب من منظمة الأمل أن تُقرّ علناً بأن الأمر كان إشكالياً',
              en: 'Ask Al-Amal to acknowledge publicly that the matter was problematic',
            },
            {
              ar: 'تعترف أنت بالمشكلة نيابةً عن العملية كلّها لتحريك الاجتماع',
              en: 'Acknowledge the problem yourself on behalf of the whole process to move the meeting forward',
            },
            {
              ar: 'تقترح استراحة خمس دقائق لتهدئة الجو',
              en: 'Propose a five-minute break to let the atmosphere settle',
            },
          ],
          correct: 0,
          feedback: {
            ar: 'وضوح دورك هنا ليس تنصّلاً — هو ما يُبقيك قادراً على إكمال العمل. إذا أعلنت رأياً في من كان محقاً فقدت ثقة أحد الطرفين وأصبحت طرفاً لا وسيطاً. طلب الاعتراف من الأمل قرار يخصّهم لا يخصّك، وتنفيذه بضغط منك يُفرغه من قيمته ويزرع استياءً يظهر لاحقاً في التنفيذ. الاعتراف نيابةً عنهم تجاوز صريح لصلاحيتك. الاستراحة أداة مشروعة لكنها هنا هروب من السؤال المطروح لا إجابة عنه. الشرح الهادئ لدورك يضع الحدود ويُحرّر الحضور من انتظار أن تكون أنت من يحكم بينهم.',
            en: 'Being clear about your role is not a withdrawal — it is what keeps you able to complete the work. If you issue an opinion about who was right, you lose the trust of one party and become a side rather than a mediator. Asking Al-Amal to acknowledge is their decision to make, not yours, and executing it under your pressure drains it of value and plants resentment that will surface in implementation. Acknowledging on their behalf is a direct overreach of your authority. A break is a legitimate tool but here it is an evasion of the question being asked rather than an answer. A calm explanation of your role sets boundaries and frees the room from waiting for you to be the judge.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'l4c-voice',
      tag: { ar: 'الصوت المغيّب', en: 'The missing voice' },
      title: {
        ar: 'من لا يُسمع',
        en: 'Who is not being heard',
      },
      lede: {
        ar: 'منسّقة الأمل تكلّمت مرتين وقُطعت في كلتيهما. والمنسّق الميداني لم يُقل اسمه حتى الآن.',
        en: 'The Al-Amal coordinator has spoken twice and been cut off both times. And the field coordinator has not been named yet.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'مرّت خمس وعشرون دقيقة. سيطر منسّق الفجر على نحو سبعين بالمئة من وقت الكلام. منسّقة الأمل حاولت مرتين أن تُكمل فكرة ولم تفلح — مرة قاطعها منسّق الفجر في منتصف الجملة، ومرة أخرى انتهى بها المطاف تقول «على كل حال» وتنسحب قبل أن تُكمل. في الوقت نفسه، لاحظت أن المنسّق الميداني الجالس في نهاية الطاولة لم يُنظر إليه أحد ولم يُسأل أحد عن رأيه طوال الجلسة. يكتب ملاحظات ويتابع بعينيه لكن لا مكان له في النقاش الجاري.\n\nهذه اللحظة تكشف ثلاثة مستويات مختلفة من الصمت تحتاج كل واحدة منها استجابة مختلفة. هناك صمت المقاطَع: شخص يحاول لكن يُقطع قبل أن يُكمل، ويحتاج فضاءً محمياً. وهناك صمت المستسلم: شخص يبدأ ثم يتراجع تحت ثقل الصوت الأعلى، ويحتاج دعوة صريحة ووقتاً بلا ضغط. وهناك صمت الغائب: شخص لم يُعطَ فرصة الوجود في النقاش أصلاً، ويحتاج تسمية من المُيسِّر بالاسم والدور.\n\nالأخير هو الأخطر لأنه غير مرئي تماماً — لا أحد قاطعه لأن أحداً لم يلاحظه أصلاً. والاجتماعات التي يهيمن عليها طرفان كبيران لا تُنتج قرارات تصمد في الميدان، لأن من سيُنفَّذ القرار عليهم لم يكونوا موجودين في النقاش. الإدماج هنا ليس مبدأً أخلاقياً فحسب — هو ما يجعل القرار قابلاً للتنفيذ فعلاً.',
            en: 'Twenty-five minutes have passed. The Al-Fajr coordinator has dominated around seventy per cent of the speaking time. The Al-Amal coordinator has tried twice to complete a thought and has not managed it — once the Al-Fajr coordinator cut her off mid-sentence, and another time she ended up saying "anyway" and retreating before she finished. At the same time, you notice that the field coordinator sitting at the end of the table has not been looked at by anyone and has not been asked for his opinion at any point in the session. He is taking notes and following with his eyes but has no place in the current discussion.\n\nThis moment reveals three different levels of silence, each needing a different response. There is the silence of the interrupted: someone trying but cut off before completing their thought, who needs a protected space. There is the silence of the surrendered: someone who begins then retreats under the weight of the louder voice, who needs an explicit invitation and time without pressure. And there is the silence of the absent: someone who was never given a place in the discussion to begin with, who needs to be named by the facilitator — by name and role.\n\nThe last is the most dangerous because it is completely invisible — no one cut him off because no one noticed him at all. And meetings dominated by two large parties do not produce decisions that hold in the field, because those on whom the decision will be implemented were not present in the discussion. Inclusion here is not only a moral principle — it is what makes a decision genuinely executable.',
          },
        },
        {
          type: 'quiz',
          id: 'l4c-q5',
          label: { ar: 'قرارك في الاجتماع', en: 'Your decision' },
          scenario: {
            ar: 'منسّق الفجر في منتصف جملة طويلة عن الأرقام. منسّقة الأمل بدت كأنها تريد التدخّل ثم أحجمت. المنسّق الميداني ينظر إلى ورقته أمامه.',
            en: 'The Al-Fajr coordinator is in the middle of a long sentence about numbers. The Al-Amal coordinator looked as if she wanted to interject and then held back. The field coordinator is looking at the paper in front of him.',
          },
          question: {
            ar: 'كيف تتدخّل لتُعيد التوازن دون أن تكسر تدفق الحوار بشكل مفاجئ وغير مُبرَّر؟',
            en: 'How do you intervene to restore balance without abruptly and unjustifiably breaking the flow of conversation?',
          },
          options: [
            {
              ar: 'تقاطع منسّق الفجر في منتصف جملته وتعطي الكلمة لمنسّقة الأمل',
              en: 'Interrupt the Al-Fajr coordinator mid-sentence and give the floor to the Al-Amal coordinator',
            },
            {
              ar: 'تنتظر توقّفاً طبيعياً ثم تقول: «شكراً. قبل المتابعة، أودّ أن نسمع النقطة التي بدت نادية تريد قولها، ثم نُعطي الكلمة لأحمد في نهاية الطاولة الذي لم تكن لديه فرصة بعد»',
              en: 'Wait for a natural pause then say: "Thank you. Before we continue, I want to hear the point Nadia seemed to want to make, and then we\'ll give the floor to Ahmad at the end of the table who has not had a turn yet"',
            },
            {
              ar: 'تُعلن استراحة مصغّرة وتتحدّث إلى منسّقة الأمل على انفراد لتشجّعها على الكلام',
              en: 'Announce a mini-break and speak privately to the Al-Amal coordinator to encourage her to speak',
            },
            {
              ar: 'تُدخل نظام التناوب الآن: دقيقتان لكل شخص بالترتيب حتى يُسمع الجميع',
              en: 'Introduce a rotation system now: two minutes per person in order until everyone is heard',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'المقاطعة في منتصف الجملة تبدو تحكّماً وقد تُغضب منسّق الفجر وتضرّ بثقته التي تحتاجها في بقية الاجتماع. الاستراحة والحديث الجانبي تُخرج منسّقة الأمل من السياق ويجعلانها تعيد تقديم فكرتها من الصفر حين تعود. التناوب الصارم بالدقائق يُشعر الحضور بأنهم في نظام بيروقراطي لا حوار إنساني وقد يُضعف التدفق الطبيعي. انتظار التوقّف الطبيعي ثم التسمية الصريحة بالاسم لمن لم يتكلّموا بعد هو ما يجمع الاحتياجات الثلاثة معاً: يُكمل المقاطَع، ويستدعي المستسلم، ويجعل الغائب مرئياً لأول مرة — وكل ذلك بطريقة تحترم إيقاع الاجتماع.',
            en: 'Interrupting mid-sentence looks controlling and may irritate the Al-Fajr coordinator and damage the trust you need for the rest of the meeting. A break with a private conversation takes the Al-Amal coordinator out of context and makes her restart her thought from scratch when she returns. The strict rotation by minutes makes participants feel they are in a bureaucratic system rather than a human conversation and may weaken the natural flow. Waiting for a natural pause and then explicitly naming by name those who have not yet spoken is what addresses all three needs together: it completes the interrupted, recalls the surrendered, and makes the absent visible for the first time — all in a way that respects the rhythm of the meeting.',
          },
        },
        {
          type: 'quiz',
          id: 'l4c-q6',
          label: { ar: 'قرارك في الاجتماع', en: 'Your decision' },
          scenario: {
            ar: 'أعطيت الكلمة للمنسّق الميداني أحمد. بنبرة هادئة قال: «ما يُناقَش هنا لا يعكس ما يحتاجه المجتمع المضيف. أولويات التدريب التي ذكرتموها لا تشمل أكثر الاحتياجات إلحاحاً في منطقتنا.» الطرفان ينظران إليه بصمت.',
            en: 'You gave the floor to field coordinator Ahmad. In a quiet tone he said: "What is being discussed here does not reflect what the host community needs. The training priorities you mentioned do not cover the most urgent needs in our area." Both parties look at him in silence.',
          },
          question: {
            ar: 'كيف تستثمر هذا التدخّل دون أن يُدفن مجدداً في الصمت ويُنسى؟',
            en: 'How do you build on this contribution without letting it get buried again in silence and forgotten?',
          },
          options: [
            {
              ar: 'تشكره وتقول للمجموعة إنكم ستتناولون هذه النقطة في اجتماع قادم',
              en: 'Thank him and tell the group you will take up this point at a future meeting',
            },
            {
              ar: 'تُعلن أن ما قاله يُعيد تأطير النقاش بالكامل وتدعو الجميع لإعادة ترتيب الأجندة',
              en: 'Announce that what he said reframes the whole discussion and invite everyone to reorganise the agenda',
            },
            {
              ar: 'تُلخّص نقطته بصوت واضح ثم تسأل الطرفين: «كيف يتقاطع ما قاله أحمد مع ما كنتم تناقشونه؟»',
              en: 'Summarise his point clearly and then ask both parties: "How does what Ahmad said connect to what you have been discussing?"',
            },
            {
              ar: 'تُدرج ملاحظته في ورقة البنود المتفرقة وتُكمل النقاش الرئيسي',
              en: 'Add his observation to the any other business paper and continue the main discussion',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'تأجيله إلى اجتماع قادم رسالة أنه على هامش ما يُعدّ مهماً — وهو بالضبط ما أراد أن يتجنّبه. إعادة تأطير الأجندة كاملاً قرار كبير يخصّ الحضور لا يخصّك وحدك وقد يُثير مقاومة. إدراجه في المتفرقات إقصاء مؤدَّب. التلخيص الصريح ثم السؤال المفتوح للطرفين يفعل شيئاً جوهرياً: يجعل الطرفين الرئيسيين يعالجان النقطة بدل تجاهلها، ويُدمج صوت المجتمع المضيف في صلب النقاش لا على هامشه. هذا هو الفرق بين الإدماج الشكلي «أعطيته دوراً» والإدماج الحقيقي «جعلت ما قاله يؤثّر في القرار».',
            en: 'Deferring to a future meeting signals that he is on the margin of what counts as important — which is exactly what he was trying to avoid. Reframing the whole agenda is a large decision that belongs to the room, not to you alone, and it may provoke resistance. Adding him to any other business is a polite dismissal. Summarising clearly and then asking an open question to both parties does something fundamental: it makes the two main parties engage with the point rather than bypass it, and it integrates the host community voice into the centre of the discussion rather than its margin. This is the difference between formal inclusion — "I gave him a turn" — and genuine inclusion — "I made what he said influence the decision".',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'l4c-negotiate',
      tag: { ar: 'التفاوض', en: 'Negotiation' },
      title: {
        ar: 'المطالب والمصالح',
        en: 'Demands and interests',
      },
      lede: {
        ar: 'منسّق الفجر يعود إلى مطلبه. لكن الاجتماع الآن مختلف عمّا كان عليه في البداية.',
        en: 'The Al-Fajr coordinator returns to his demand. But the meeting is now different from what it was at the start.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'عاد منسّق الفجر إلى نقطته الأصلية: يريد تخفيض مخصّص الأمل في الربع القادم بنسبة عشرين بالمئة كـ«تعويض» عمّا حدث. منسّقة الأمل قالت إن هذا التخفيض سيؤثّر على عدد المستفيدين الذين تخدمهم منظمتها. المنسّق الميداني أحمد أضاف أن أي تخفيض في ميزانية التدريب سيصل أثره إلى المجتمع المضيف الذي لم يُسأل عن رأيه في هذه المعادلة.\n\nهذه اللحظة تكشف الفرق الجوهري بين المطلب والمصلحة. المطلب هو «عشرون بالمئة». أما المصلحة التي تقبع خلف هذا المطلب فهي «أن تُعامَل الفجر بعدل وألّا تتحمّل وحدها تكلفة قرار لم تُشارك في صياغته». هذان الشيئان ليسا متطابقَين. نسبة العشرين بالمئة طريقة واحدة لتحقيق العدالة المطلوبة، لكنها ليست الطريقة الوحيدة، وقد لا تكون الأنجع.\n\nمهمّتك في هذا الجزء ليست إقناع أحد بالتخلّي عن مطلبه بالقوة أو الضغط، بل مساعدة الطرفين على رؤية ما يريدانه فعلاً تحت ما يقولانه. الحلول التي تعالج المصالح الحقيقية أكثر استدامة من الحلول التي تستجيب للمطالب المُعلنة فحسب — لأن من قبل مطلباً ضاغطاً دون اقتناع داخلي لن يبذل جهداً في تطبيقه.',
            en: 'The Al-Fajr coordinator has returned to his original point: he wants Al-Amal\'s allocation next quarter reduced by twenty per cent as "compensation" for what happened. The Al-Amal coordinator said this reduction would affect the number of beneficiaries her organisation serves. Field coordinator Ahmad added that any reduction in the training budget would reach the host community as well, which was never consulted on this formula.\n\nThis moment reveals the fundamental difference between a demand and an interest. The demand is "twenty per cent". The interest behind that demand is "for Al-Fajr to be treated fairly and not to bear alone the cost of a decision it had no part in making". These two things are not the same. The twenty per cent figure is one way of achieving the fairness being sought, but it is not the only way, and it may not be the most effective one.\n\nYour task in this section is not to persuade anyone to abandon their demand through force or pressure, but to help both parties see what they actually want beneath what they are saying. Solutions that address genuine interests are more durable than solutions that only respond to stated demands — because someone who accepted a pressured demand without inner conviction will not invest effort in implementing it.',
          },
        },
        {
          type: 'quiz',
          id: 'l4c-q7',
          label: { ar: 'قرارك في الاجتماع', en: 'Your decision' },
          question: {
            ar: 'كيف تساعد على إظهار المصلحة الحقيقية التي تقف خلف مطلب العشرين بالمئة دون أن تُشعر صاحبه بأنك تُقلّل من أهمية ما طلبه؟',
            en: 'How do you help surface the real interest behind the twenty per cent demand without making the person feel you are dismissing the importance of what he asked for?',
          },
          options: [
            {
              ar: 'تسأله مباشرة: «لماذا اخترت عشرين بالمئة تحديداً وليس أي رقم آخر؟»',
              en: 'Ask him directly: "Why did you choose twenty per cent specifically and not any other number?"',
            },
            {
              ar: 'تقول: «أفهم أن هناك قلقاً حقيقياً من أن التوزيع لم يعكس ما اتُّفق عليه. إذا تمكّنا من معالجة هذا القلق بآلية موثَّقة وملزِمة للطرفين، هل يبقى الرقم تحديداً شرطاً صارماً؟»',
              en: 'Say: "I understand there is a genuine concern that the distribution did not reflect what was agreed. If we could address that concern through a documented mechanism binding on both parties, would the specific number remain a firm requirement?"',
            },
            {
              ar: 'تقترح الاجتماع على تخفيض أخف: عشرة بالمئة بدلاً من عشرين، وسط بين المطلبين',
              en: 'Suggest the meeting settle on a lighter reduction: ten per cent instead of twenty, a midpoint between the two positions',
            },
            {
              ar: 'تطلب من الطرفين تبادل مواقفهما كتابياً وتلتقون بعد أسبوع بعد التشاور',
              en: 'Ask both parties to exchange their positions in writing and reconvene in a week after consultation',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'السؤال المباشر «لماذا عشرون بالمئة» قد يبدو استجواباً ويدفع صاحب المطلب إلى التحصّن أكثر بدل الانفتاح. عرض نصف الرقم هو تسوية حسابية لا حلّ حقيقي — يُخفض الرقم دون أن يُعالج الشعور الأساسي بعدم العدالة، وكلا الطرفين سيشعر أنه خسر شيئاً لا أنه وصل إلى شيء. التأجيل لأسبوع يُعيد الجميع إلى نفس الخندق ويُفقد الاجتماع مبرّر وجوده. الصياغة المقترحة تفصل الرقم عن المبدأ الذي يخدمه: تعترف بمشروعية القلق وتفتح إمكانية حلّ يُعالجه من دون اشتراط الرقم نفسه. هذه هي خطوة التيسير الأهم في التفاوض: تحوّل السؤال من «هل تقبل أم لا» إلى «ما الذي نحتاجه لنصل معاً».',
            en: 'Asking "why twenty per cent" directly can feel like an interrogation and push the person holding the demand to become more entrenched rather than more open. Offering half the number is an arithmetic settlement not a real solution — it reduces the figure without addressing the underlying feeling of unfairness, and both parties will feel they lost something rather than reached something. Postponing for a week sends everyone back to the same trenches and makes the meeting lose its reason for being. The proposed phrasing separates the number from the principle it serves: it acknowledges the legitimacy of the concern and opens the possibility of a solution that addresses it without requiring the same figure. This is the most important facilitation move in negotiation: it shifts the question from "do you accept or not" to "what do we need in order to get there together".',
          },
        },
        {
          type: 'quiz',
          id: 'l4c-q8',
          label: { ar: 'قرارك في الاجتماع', en: 'Your decision' },
          scenario: {
            ar: 'منسّق الفجر قبل الفكرة وقال إنه سيقبل بآلية موثَّقة بدل التخفيض إن كانت واضحة وملزِمة. أحمد اقترح معياراً: توزيع حصص الربع القادم بناءً على أعداد المستفيدين المسجّلين لدى كل منظمة. منسّقة الأمل وافقت. الجو في الغرفة تغيّر.',
            en: 'The Al-Fajr coordinator accepted the idea and said he would accept a documented mechanism instead of the reduction, provided it is clear and binding. Ahmad suggested a criterion: distribute next quarter\'s shares based on the number of registered beneficiaries at each organisation. The Al-Amal coordinator agreed. The atmosphere in the room has shifted.',
          },
          question: {
            ar: 'الاجتماع وصل إلى نقطة تحوّل. ما أول ما تفعله لتُثبّت ما تمّ التوصّل إليه قبل أن يتبدّد؟',
            en: 'The meeting has reached a turning point. What is the first thing you do to consolidate what has been reached before it dissipates?',
          },
          options: [
            {
              ar: 'تنتقل فوراً إلى البند التالي لاستثمار الزخم الإيجابي قبل أن يتراجع',
              en: 'Move immediately to the next item to capitalise on the positive momentum before it fades',
            },
            {
              ar: 'تُلخّص ما اتُّفق عليه بصوت واضح وتسأل الثلاثة: «هل هذا يعكس ما وصلنا إليه؟» ثم تُسجّله في محضر الاجتماع أمام الجميع',
              en: 'Summarise what was agreed aloud and ask all three: "Does this reflect where we\'ve landed?" then record it in the meeting minutes in front of everyone',
            },
            {
              ar: 'تطلب من كل طرف أن يُعيد صياغة ما فهمه بكلماته الخاصة للتأكّد من تطابق الفهم',
              en: 'Ask each party to restate in their own words what they understood to confirm their understanding matches',
            },
            {
              ar: 'تعتبر الاتفاق منعقداً وتُكمل البنود المتبقية لأن الوقت يضغط',
              en: 'Consider the agreement concluded and complete the remaining items because time is pressing',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الانتقال الفوري يُخاطر بأن يبقى الاتفاق ضمنياً لا صريحاً — وكل طرف قد فهمه بطريقة مختلفة دون أن يعلم ذلك. طلب إعادة الصياغة من كل طرف مفيد ولكنه يستغرق وقتاً وقد يُعيد فتح النقاش إذا كشف عن اختلاف في الفهم. اعتبار الاتفاق منعقداً بلا توثيق صريح يترك فجوة إذا اعترض أحد لاحقاً على ما اتُّفق عليه. التلخيص الصريح مع سؤال تأكيدي ثم التوثيق الفوري بالاسم هو الترتيب الذي يُحوّل الاتفاق الشفهي إلى التزام مكتوب — وهو ما يجعله يصمد بعد أن تُغادر الغرفة وتبدأ ضغوط التنفيذ.',
            en: 'Moving immediately risks leaving the agreement implicit rather than explicit — and each party may have understood it differently without knowing it. Asking each party to restate is useful but takes time and may reopen the discussion if it reveals a difference in understanding. Considering the agreement concluded without explicit documentation leaves a gap if someone objects later to what was agreed. A clear summary with a confirmatory question followed by immediate named documentation is the sequence that converts a verbal agreement into a written commitment — and that is what makes it hold after everyone has left the room and the pressures of implementation begin.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'l4c-close',
      tag: { ar: 'إغلاق الاجتماع', en: 'Closing the meeting' },
      title: {
        ar: 'القرار المشترك الموثَّق',
        en: 'The documented shared decision',
      },
      lede: {
        ar: 'الاجتماع يقترب من نهايته. ما زلت بحاجة إلى تحويل ما وصلتم إليه إلى شيء يصمد خارج الغرفة.',
        en: 'The meeting is approaching its end. You still need to turn what you reached into something that holds outside the room.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'أمامك خمس دقائق. على الورقة أمامك ثلاث نقاط اتُّفق عليها: الأولى، توزيع حصص الربع القادم بناءً على أعداد المستفيدين المسجّلين لدى كل منظمة. الثانية، مراجعة التوزيع بعد ستة أسابيع في اجتماع مشترك. الثالثة، اعتماد محضر موثَّق في كل اجتماع مشترك مستقبلاً. هذه النقاط الثلاث خرجت من الطرفين بعد ساعة من التوتر — وهي أفضل مما دخل الجميع به إلى الغرفة.\n\nشيء واحد مهم يستحق الوقوف عنده: القرار الثالث — اعتماد المحاضر — لم يكن في أجندة أحد. جاء من لحظة تعرّف فيها الجميع على السبب الحقيقي وراء الخلاف التاريخي: غياب التوثيق. هذا النوع من القرارات هو ما ينبثق من الاجتماعات التي تُدار بشكل جيد: الحاضرون يرون معاً الثغرة التي لم يلتفت إليها أحد.\n\nأيضاً: الإدماج لم يكن فضيلة أخلاقية فحسب. المعيار الذي أنهى جمود الأرقام — أعداد المستفيدين المسجّلين — اقترحه المنسّق الميداني أحمد، الذي لم يكن سيتكلّم لولا أنك فتحت الفضاء له بالاسم. القرار الأفضل جاء من الصوت الأهدأ في الغرفة.\n\nما تبقّى هو التأكّد من أن كل شخص في الغرفة يعرف ما التزم به، ومن سيتابع ماذا، وأين يتوجّه إذا نشأت مشكلة في التطبيق. الاجتماع لا ينتهي حتى تكون الخطوة التالية لكل شخص واضحة ومكتوبة.',
            en: 'You have five minutes left. On the paper in front of you are three agreed points: first, next quarter\'s shares will be distributed based on registered beneficiary numbers at each organisation; second, the distribution will be reviewed after six weeks in a joint meeting; third, a documented record will be adopted for every future joint meeting. These three points emerged from both parties after an hour of tension — and they are better than what everyone brought into the room.\n\nOne important thing is worth noting: the third decision — adopting meeting records — was not on anyone\'s agenda. It emerged from the moment when everyone saw together the real reason behind the historical dispute: the absence of documentation. This kind of decision is what emerges from meetings that are well run: those present see together the gap that nobody had noticed.\n\nAlso: inclusion was not only a moral virtue. The criterion that broke the numerical deadlock — registered beneficiary numbers — was proposed by field coordinator Ahmad, who would not have spoken had you not explicitly opened the space for him by name. The better decision came from the quietest voice in the room.\n\nWhat remains is to make sure every person in the room knows what they committed to, who will follow up on what, and where they go if a problem arises in implementation. The meeting does not end until each person\'s next step is clear and written.',
          },
        },
        {
          type: 'quiz',
          id: 'l4c-q9',
          label: { ar: 'قرارك في الاجتماع', en: 'Your decision' },
          question: {
            ar: 'عند الإغلاق، أحد الحاضرين يقول: «أنا أوافق من حيث المبدأ لكن أحتاج مراجعة قانونية قبل أن أُوقِّع على أي وثيقة.» كيف تتعامل مع هذا الموقف؟',
            en: 'At the close, one of those present says: "I agree in principle but I need legal review before I sign any document." How do you handle this?',
          },
          options: [
            {
              ar: 'تعدّه موافقاً وتُسجّله كذلك في المحضر وتُغلق الاجتماع',
              en: 'Count him as having agreed and record him as such in the minutes, then close the meeting',
            },
            {
              ar: 'تقول: «ممتاز. نُسجّل موافقتك المبدئية ونُحدّد خمسة أيام عمل كموعد نهائي للحصول على تأكيدك الكامل — مع تحديد من تتواصل معه في حال احتجت معلومات إضافية. هل هذا مناسب؟»',
              en: 'Say: "Good. We record your agreement in principle and set five working days as a deadline for your full confirmation — along with naming who you can contact if you need more information. Is that workable?"',
            },
            {
              ar: 'تؤجّل إغلاق الاجتماع وتنتظر حتى يُجري المراجعة القانونية ثم تُرسل المحضر',
              en: 'Delay closing the meeting and wait until the legal review is done before sending the minutes',
            },
            {
              ar: 'تطلب منه التوقيع الآن وتُوضح أن المراجعة القانونية تأتي بعد لا قبل التوقيع',
              en: 'Ask him to sign now and clarify that legal review comes after signing, not before',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'تسجيله كموافق بلا شرط خطر حقيقي: الموافقة المبدئية أضعف من الالتزام وقد تنهار عند أول صعوبة تنفيذية. تأجيل إغلاق الاجتماع يعيق الباقين وقد لا يُتاح الوقت لاحقاً. طلب التوقيع الآن يتجاهل قلقاً مشروعاً ويُفقد الاتفاق مصداقيته إذا اعترض لاحقاً. الصياغة المقترحة تفصل الاتفاق المبدئي الذي حصل فعلاً عن التوثيق الرسمي الذي لا يزال معلّقاً، وتُحدّد موعداً ملزماً يُحوّل «ربما» إلى التزام له تاريخ محدد وشخص مسؤول. قرار موثَّق يتضمّن شرطاً بأجل معلوم أفضل من قرار غير موثَّق أصلاً.',
            en: 'Recording him as agreed unconditionally carries genuine risk: agreement in principle is weaker than a commitment and may collapse at the first implementation difficulty. Delaying the close blocks the other participants and time may not be available later. Asking him to sign now dismisses a legitimate concern and undermines the agreement\'s credibility if he objects later. The proposed phrasing separates the agreement in principle that genuinely occurred from the formal documentation that is still outstanding, and sets a binding deadline that converts "maybe" into a commitment with a specific date and a named responsible person. A documented decision that includes a time-bounded condition is better than an undocumented decision.',
          },
        },
        {
          type: 'quiz',
          id: 'l4c-q10',
          label: { ar: 'قرارك في الاجتماع', en: 'Your decision' },
          question: {
            ar: 'الاجتماع انتهى. ماذا يجب أن يحتوي المحضر الذي سترسله خلال أربع وعشرين ساعة؟',
            en: 'The meeting is over. What must the minutes you send within twenty-four hours contain?',
          },
          options: [
            {
              ar: 'ملخص تسلسلي لما قاله كل شخص بترتيب زمني حتى يكون هناك سجل كامل للحوار',
              en: 'A chronological summary of what each person said in order, so there is a full record of the conversation',
            },
            {
              ar: 'القرارات المتخذة فقط مع اسم من التزم بكل قرار ومواعيد المراجعة وأي مسائل تحتاج متابعة مع تحديد من يتابعها',
              en: 'Decisions taken only, with the name of whoever committed to each decision, review dates, and any matters needing follow-up with the person responsible named',
            },
            {
              ar: 'الأجندة الكاملة مع ملاحظات على كل بند وشرح لكيفية سير النقاش وما أفرزه من نتائج',
              en: 'The full agenda with notes on each item and an explanation of how the discussion went and what results it produced',
            },
            {
              ar: 'رسالة موجزة تقول إن الاجتماع سار إيجابياً وأُحرز تقدّم على البنود الرئيسية',
              en: 'A brief message saying the meeting went positively and progress was made on the main items',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الملخص الزمني يوثّق الحوار لا القرارات، وعادةً ما يخلط بين الآراء والالتزامات. الأجندة مع الملاحظات مفيدة للتعلّم التنظيمي لكنها ليست الوثيقة التشغيلية التي تحتاجها الفِرق في الميدان. الرسالة الموجزة لا قيمة قانونية أو تشغيلية لها وتترك الجميع يتساءل «اتُّفق على ماذا بالضبط؟» المحضر الجيد هو الوثيقة التي يستطيع أي شخص لم يحضر الاجتماع أن يعرف منها: من قرّر ماذا، من يتابع ماذا، وما الذي يُراجع ومتى. القرارات والمسؤوليات والمواعيد — هذا ما يُحوّل المحضر من أرشيف إلى أداة عمل حية.',
            en: 'The chronological summary documents the conversation, not the decisions, and usually blurs the line between opinions and commitments. The full agenda with notes is useful for organisational learning but it is not the operational document that field teams need. The brief message has no legal or operational value and leaves everyone asking "what exactly was agreed?" Good minutes are the document from which anyone who did not attend can know: who decided what, who follows up on what, and what is reviewed and when. Decisions, responsibilities, and deadlines — that is what turns minutes from an archive into a living working tool.',
          },
        },
      ],
    },
  ],
};
