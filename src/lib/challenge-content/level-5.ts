import type { LevelChallenge } from './types';

/**
 * Level 5 — the last quarter of a two-year livelihoods programme.
 *
 * Level 5 is leadership built on values rather than on position, and the only
 * honest way to test that is to make holding the value expensive. Every sound
 * option below costs the association money, a renewal, a photograph or a
 * headline figure, and every harmful one is free this quarter and paid for by
 * somebody else next year.
 *
 * The pressure to inflate a result is the spine of the whole run. It is the one
 * failure in this level that nobody reports, because an inflated figure looks
 * exactly like a good one until somebody checks.
 */
export const levelFiveRun: LevelChallenge = {
  level: 5,
  title: {
    ar: 'الربع الأخير من برنامج',
    en: 'The last quarter of a programme',
  },
  lede: {
    ar: 'سنتان من عمل مع نساء الحيّ، وربع أخير فيه تقرير أثر وميزانية ناقصة ومانح يقرّر التجديد. كل قرار هنا له ثمن يدفعه أحد.',
    en: 'Two years of work with the women of the neighbourhood, and a final quarter holding an impact report, a budget that will not stretch, and a funder deciding on renewal. Every decision here has a price, and somebody pays it.',
  },

  openings: ['l5-numbers', 'l5-resistance'],

  steps: [
    // ============================================================== round 1
    {
      id: 'l5-numbers',
      round: 1,
      draws: ['monitoring-and-evaluation', 'ethical-decision-making'],
      situation: {
        ar: 'تقرير الأثر بعد أسبوع. ما لديكم كشوف حضور فقط: لا خطّ أساس، ولا متابعة بعد التخرّج. والرقم الذي تكرّره الجمعية في منشوراتها منذ سنة — «٢٤٠ امرأة استفدن» — هو عدد المسجّلات، بينما أكملن التدريب ١٣٦، ولا أحد يعرف كم واحدة تعمل اليوم.',
        en: 'The impact report is due in a week. What you have is attendance sheets: no baseline, no follow-up after graduation. And the figure the association has been repeating in its posts for a year — "240 women reached" — is the number who registered, while 136 completed the training, and nobody knows how many are working today.',
      },
      question: {
        ar: 'ماذا يقول التقرير؟',
        en: 'What does the report say?',
      },
      choices: [
        {
          id: 'l5-num-a',
          weight: 'sound',
          text: {
            ar: 'تكتب الأرقام بما هي: ٢٤٠ مسجّلة، ١٣٦ أكملن، ولا بيانات تشغيل — وتضع في التقرير ما ستفعلونه لقياس ذلك من الآن',
            en: 'Write the figures for what they are: 240 registered, 136 completed, no employment data — and put into the report what you will now do to measure it',
          },
          consequence: {
            ar: '«لا نعرف» جملة مشروعة في تقرير أثر، و«٢٤٠ استفدن» ليست. الرقم الأوّل يعرّف الجمعية بأنها جهة تقيس؛ الثاني يجعلها جهة تروي. وحين يسأل مانح بعد سنتين عن مصير المئة والست والثلاثين — وسيسأل — فإن التقرير الصادق هو الذي يبقيها في الغرفة. وذكر خطّة القياس يحوّل نقصاً إلى بند عمل بدل أن يكون اعترافاً معلّقاً.',
            en: '"We do not know" is a legitimate sentence in an impact report; "240 women benefited" is not. The first figure defines the association as a body that measures; the second makes it one that narrates. And when a funder asks in two years what became of the 136 — and they will — the honest report is what keeps the association in the room. Naming the measurement plan turns a gap into an action rather than leaving it as a hanging admission.',
          },
          next: 'l5-pitch',
        },
        {
          id: 'l5-num-b',
          weight: 'costly',
          text: {
            ar: 'تكتب ١٣٦ متخرّجة وتترك رقم الـ٢٤٠ في المنشورات القديمة كما هو',
            en: 'Report 136 graduates and leave the 240 standing in the old posts as it is',
          },
          consequence: {
            ar: 'التقرير صار صادقاً والمنشورات لم تصر. أوّل شخص يقارن بينهما — صحفي، مانح ثانٍ، متطوّعة سابقة — سيقرأ الفرق على أنه تراجع أو تناقض، لا على أنه تصحيح. والتصحيح المعلن يكلّف يوماً من الإحراج؛ الرقمان المتعايشان يكلّفان مصداقية لا تُستعاد بتقرير واحد.',
            en: 'The report has become honest and the posts have not. The first person to compare them — a journalist, a second funder, a former volunteer — reads the difference as a retraction or a contradiction rather than as a correction. A stated correction costs a day of awkwardness; two figures living side by side cost a credibility that no single report buys back.',
          },
          next: 'l5-shortfall',
        },
        {
          id: 'l5-num-c',
          weight: 'harmful',
          text: {
            ar: 'تكتب ٢٤٠ مستفيدة — الرقم صحيح تقنياً، وكل الجمعيات تحسبها هكذا',
            en: 'Report 240 beneficiaries — the figure is technically correct, and everybody counts it that way',
          },
          consequence: {
            ar: '«صحيح تقنياً» هو الوصف الذي يسبق كل رقم مضخَّم. والمشكلة ليست أن أحداً سيكتشف، بل أن القرار القادم سيُبنى عليه: مانح يجدّد لأنه رأى ٢٤٠، وجمعية توسّع لأنها صدّقت رقمها، ومئة وأربع نساء غادرن التدريب من دون أن يسأل أحد لماذا — وهذا بالضبط الرقم الذي كان يمكن أن يُصلح البرنامج. تضخيم الأثر يضرّ الجمعية أكثر ممّا يضرّها رقم متواضع صادق.',
            en: '"Technically correct" is the phrase that precedes every inflated figure. The problem is not that somebody will find out; it is that the next decision gets built on it — a funder renews because they saw 240, an association expands because it believed its own number, and 104 women left the training without anybody asking why, which is exactly the figure that could have fixed the programme. Inflating impact costs an organisation more than a modest honest number ever does.',
          },
          next: 'l5-shortfall',
        },
      ],
    },
    {
      id: 'l5-resistance',
      round: 1,
      draws: ['transformational-leadership', 'community-project-management'],
      situation: {
        ar: 'قرّرتم الانتقال من تدريبات قصيرة متفرّقة إلى أفواج مدّتها ثلاثة أشهر. ثلاث مدرّبات من الأقدم في الفريق لا يعترضن في الاجتماع، لكنّهنّ يواصلن العمل بالطريقة القديمة، وإحداهنّ قالت لمتطوّعة جديدة إن «هذا سيتغيّر بعد ستّة أشهر مثل كل مرّة».',
        en: 'You have decided to move from short scattered trainings to three-month cohorts. Three of the team’s most experienced trainers do not object in meetings, but they carry on working the old way, and one told a new volunteer that "this will change back in six months like it always does".',
      },
      question: {
        ar: 'ماذا تفعل؟',
        en: 'What do you do?',
      },
      choices: [
        {
          id: 'l5-res-a',
          weight: 'sound',
          text: {
            ar: 'تجلس مع الثلاث وتسألهنّ ما الذي يرينه في الطريقة القديمة ولا تراه أنت، وتُدخل ما يصحّ من كلامهنّ في التصميم قبل أن تطلب التنفيذ',
            en: 'Sit with the three and ask what they see in the old way that you do not, and put whatever holds into the design before asking anybody to deliver it',
          },
          consequence: {
            ar: 'المقاومة الصامتة من أقدم ثلاث مدرّبات ليست عناداً، هي غالباً معلومة: يعرفن لماذا تنقطع النساء بعد الأسبوع الرابع، وأنت لا تعرف. والجملة «سيتغيّر بعد ستّة أشهر مثل كل مرّة» تصف تاريخاً حقيقياً في هذه الجمعية، وتجاهله لا يلغيه. القيادة التحويلية تشتبك مع المقاومة لأنها المكان الذي فيه ما ينقص الخطّة.',
            en: 'Quiet resistance from the three most experienced trainers is rarely obstinacy; usually it is information. They know why women drop out after the fourth week and you do not. And "it will change back in six months like it always does" describes a real history in this association, and ignoring it does not make it untrue. Transformational leadership engages resistance because that is where the thing missing from the plan is kept.',
          },
          next: 'l5-shortfall',
        },
        {
          id: 'l5-res-b',
          weight: 'costly',
          text: {
            ar: 'تُعيد شرح الرؤية في الاجتماع القادم بوضوح أكبر ومعها الأرقام التي دفعت إليها',
            en: 'Explain the vision again at the next meeting, more clearly, with the figures behind it',
          },
          consequence: {
            ar: 'الشرح الثاني يفترض أن المشكلة فهم، والمشكلة ليست فهماً. الثلاث فهمن تماماً ولم يقتنعن، وإعادة الشرح تقول لهنّ إن رأيهنّ لم يُطلب في المرّة الأولى ولا في الثانية. الرؤية التي يفهمها الفريق ولا يرى نفسه فيها تبقى رؤيتك أنت، وتُنفَّذ في الاجتماعات فقط.',
            en: 'A second explanation assumes the problem is comprehension, and it is not. The three understood perfectly and were not persuaded, and explaining again tells them their view was not asked for the first time or the second. A vision the team understands but cannot see itself in stays your vision, and gets delivered in meetings only.',
          },
          next: 'l5-pitch',
        },
        {
          id: 'l5-res-c',
          weight: 'harmful',
          text: {
            ar: 'تسند الأفواج الجديدة إلى المتطوّعات الجدد وتترك الثلاث على التدريبات القصيرة',
            en: 'Give the new cohorts to the new volunteers and leave the three on the short trainings',
          },
          consequence: {
            ar: 'أنت تجنّبت المحادثة وبنيت فريقين داخل فريق واحد: واحد يحمل المستقبل بلا خبرة، وواحد يحمل الخبرة ويعرف أنه استُبعد. خلال شهرين ستغادر واحدة على الأقلّ من الثلاث ومعها ما تعرفه عن النساء اللواتي ينقطعن، ولن يكون هناك صفّ ثانٍ لأن الصفّ الأوّل لم يُدرَّب أحداً. تجنّب المقاومة أسرع من الاشتباك بها، وأغلى.',
            en: 'You avoided the conversation and built two teams inside one: one carrying the future with no experience, one carrying the experience and knowing it was set aside. Within two months at least one of the three leaves, and what she knows about the women who drop out leaves with her — and there is no second line, because the first line trained nobody. Avoiding resistance is faster than engaging it, and dearer.',
          },
          next: 'l5-pitch',
        },
      ],
    },

    // ============================================================== round 2
    {
      id: 'l5-shortfall',
      round: 2,
      draws: ['community-project-management', 'ethical-decision-making'],
      situation: {
        ar: 'الميزانية لن تغطّي الربع الأخير. أمامك ثلاثة أبواب: حضانة الأطفال التي تحضر بسببها ثلثا المشاركات، أو أتعاب المدرّبات وهنّ يتقاضين أقلّ من السوق أصلاً، أو طلب تعديل من المانح قبل خمسة أسابيع من قرار التجديد.',
        en: 'The budget will not cover the final quarter. Three doors: the childcare that two-thirds of the participants attend because of, the trainers’ fees — already below the market — or a budget variation requested from the funder five weeks before the renewal decision.',
      },
      question: {
        ar: 'ما قرارك؟',
        en: 'What do you decide?',
      },
      choices: [
        {
          id: 'l5-short-a',
          weight: 'sound',
          text: {
            ar: 'تطلب التعديل مكتوباً مع أرقام ما يعنيه كل بديل: كم مشاركة تسقط بلا حضانة، وكم مدرّبة تنسحب بأتعاب أقلّ',
            en: 'Request the variation in writing, with the figures for what each alternative costs: how many participants fall away without childcare, how many trainers withdraw on lower fees',
          },
          consequence: {
            ar: 'طلب التعديل قبل قرار التجديد يبدو مخاطرة وهو العكس: مانح يكتشف العجز بنفسه في تقرير الإغلاق يرى إدارة سيّئة، ومانح يُبلَّغ قبل خمسة أسابيع بأرقام يرى إدارة. والأرقام هي الفرق بين طلب مال وشرح قرار — «بلا حضانة يسقط ثلثا الصفّ» جملة تُقرأ في دقيقة وتغيّر الجواب.',
            en: 'Asking for a variation before the renewal decision looks like a risk and is the opposite: a funder who discovers the gap for themselves in the closing report sees bad management, and a funder told five weeks out with figures sees management. The figures are the difference between asking for money and explaining a decision — "without childcare two-thirds of the class falls away" is a sentence read in a minute that changes the answer.',
          },
          next: 'l5-close',
        },
        {
          id: 'l5-short-b',
          weight: 'costly',
          text: {
            ar: 'تخفّض أتعاب المدرّبات لهذا الربع وتشرح لهنّ الوضع وتَعِد بتعويض إن جُدّد البرنامج',
            en: 'Cut the trainers’ fees for this quarter, explain the position to them, and promise to make it up if the programme is renewed',
          },
          consequence: {
            ar: 'قرار يحمي المشاركات ويحمّل الكلفة لمن يتقاضى أقلّ من السوق أصلاً. وهو دفاع عن نفسه لو كان مؤقّتاً فعلاً، والوعد المعلّق على تجديد لم يُقرَّر ليس مؤقّتاً بل مشروط. أنت اخترتَ الطرف الأقلّ صوتاً في الميزانية — وهذا هو النمط الذي يجعل العمل المجتمعي يُبنى دائماً على ظهر من لا يفاوض.',
            en: 'A decision that protects the participants and puts the cost on the people already paid below the market. It would defend itself if it were genuinely temporary, and a promise conditional on a renewal nobody has decided is not temporary, it is contingent. You chose the party with the least voice in the budget — which is the pattern by which community work always ends up built on the backs of whoever does not negotiate.',
          },
          next: 'l5-story',
        },
        {
          id: 'l5-short-c',
          weight: 'harmful',
          text: {
            ar: 'توقف الحضانة للربع الأخير — التدريب هو الخدمة الأساسية والحضانة إضافة',
            en: 'Stop the childcare for the final quarter — the training is the core service and childcare is an extra',
          },
          consequence: {
            ar: 'الحضانة ليست إضافة، هي شرط الوصول لثلثي المشاركات، وإيقافها يُخرج نساءً من برنامج بُني لهنّ ثم يُسجَّل خروجهنّ في التقرير كانقطاع. النتيجة المزدوجة أن البرنامج يفقد المستفيدات ويفقد الرقم الذي يفسّر لماذا فقدهنّ. وقرار يُقصي من هو أحوج بحجّة أن ما أُقصي «ليس أساسياً» هو قرار وُصف بلغة ميزانية وأثره أثر إقصاء.',
            en: 'Childcare is not an extra; it is the access condition for two-thirds of the participants, and stopping it pushes women out of a programme built for them — after which their leaving is recorded in the report as dropout. The double result is that the programme loses the beneficiaries and loses the figure that would explain why. A decision that excludes the people who need it most on the grounds that what was cut is "not core" is described in budget language and works as exclusion.',
          },
          next: 'l5-story',
        },
      ],
    },
    {
      id: 'l5-pitch',
      round: 2,
      draws: ['public-speaking', 'monitoring-and-evaluation'],
      situation: {
        ar: 'اثنتا عشرة دقيقة أمام مجلس المانح. النتيجة الصادقة متواضعة: ١٣٦ متخرّجة، تسع عشرة تعمل اليوم بشهادة أنفسهنّ، وأربع فتحن عملاً صغيراً. المنافس على التمويل نفسه عرض الشهر الماضي «تمكين ٨٠٠ امرأة».',
        en: 'Twelve minutes in front of the funder’s board. The honest result is modest: 136 graduates, nineteen in work today by their own account, four who have started something of their own. A competitor for the same funding presented "800 women empowered" last month.',
      },
      question: {
        ar: 'كيف تبني الاثنتي عشرة دقيقة؟',
        en: 'How do you build the twelve minutes?',
      },
      choices: [
        {
          id: 'l5-pitch-a',
          weight: 'sound',
          text: {
            ar: 'تفتح بما لم ينجح وبالسبب، ثم تعرض الأرقام كما هي، ثم ما ستفعلونه بها — وتقول صراحةً إنكم تعدّون المتخرّجات لا المسجّلات',
            en: 'Open with what did not work and why, then the figures as they are, then what you will do with them — and say plainly that you count graduates rather than registrations',
          },
          consequence: {
            ar: 'مجلس مانح رأى «٨٠٠ امرأة» يعرف تماماً كيف تُحسب، وأوّل عرض يقول له كيف يعدّ يكتسب شيئاً لا يشتريه رقم كبير. الافتتاح بما لم ينجح ليس تواضعاً — هو ما يجعل بقيّة الاثنتي عشرة دقيقة قابلة للتصديق. وتسعة عشر امرأة تعملن رقم يمكن الدفاع عنه أمام أيّ سؤال، وهو أكثر ممّا يمكن قوله عن ٨٠٠.',
            en: 'A board that has seen "800 women empowered" knows exactly how that is counted, and the first presentation that tells them how it counts gains something no large number buys. Opening with what did not work is not modesty — it is what makes the rest of the twelve minutes believable. And nineteen women in work is a figure that survives any question, which is more than can be said of 800.',
          },
          next: 'l5-story',
        },
        {
          id: 'l5-pitch-b',
          weight: 'costly',
          text: {
            ar: 'تبني العرض على قصّة مشاركة واحدة نجحت، وتذكر الأرقام سريعاً في الشريحة الأخيرة',
            en: 'Build the presentation around one participant’s success story, and put the figures quickly on the last slide',
          },
          consequence: {
            ar: 'القصّة تعمل — وهذه هي المشكلة. مجلس يخرج بانطباع من قصّة واحدة يقرّر على أساس أفضل حالة لديك، ثم يُقاس البرنامج بها. والأرقام في الشريحة الأخيرة تُقرأ بوصفها ما أردتَ إخفاءه، فيسأل عنها أحدهم في اللحظة التي لم يبقَ فيها وقت للإجابة. القصّة تخدم الفكرة حين تسبقها الفكرة، لا حين تحلّ محلّها.',
            en: 'The story works — which is the problem. A board leaving with an impression from one story decides on the strength of your best case, and the programme is then measured against it. And figures on the last slide read as the thing you wanted buried, so somebody asks about them at the moment when there is no time left to answer. A story serves the point when the point comes first, not when it stands in for it.',
          },
          next: 'l5-close',
        },
        {
          id: 'l5-pitch-c',
          weight: 'harmful',
          text: {
            ar: 'تعرض «٢٤٠ امرأة وصل إليهنّ البرنامج» لأنه المعيار الذي يستخدمه الجميع في هذا القطاع',
            en: 'Present "240 women reached", because that is the measure everybody in the sector uses',
          },
          consequence: {
            ar: 'أن يفعلها الجميع لا يجعلها صحيحة، ويجعل اكتشافها أسهل: مجلس يقارن أربعة عروض يسأل سؤالاً واحداً — «كم أكملن؟» — ولا يوجد جواب يُقال بعد ذلك. والكلفة الأكبر ليست العرض بل ما بعده: إن جُدّد التمويل على ٢٤٠، فإن أهداف السنة القادمة ستُبنى على رقم لا يستطيع البرنامج بلوغه، وستُوقّع الجمعية على ما لن تفي به.',
            en: 'Everybody doing it does not make it true, and it makes it easier to catch: a board comparing four presentations asks one question — "how many completed?" — and there is nothing to say after that. The larger cost is not the presentation but what follows it: if the funding is renewed on 240, next year’s targets are built on a figure the programme cannot reach, and the association will have signed for something it cannot deliver.',
          },
          next: 'l5-close',
        },
      ],
    },

    // ============================================================== round 3
    {
      id: 'l5-story',
      round: 3,
      draws: ['public-speaking', 'ethical-decision-making'],
      situation: {
        ar: 'المانح يريد إحدى المشاركات على المنصّة في حفل الإغلاق. أوضحهنّ قصّة امرأة تركت زوجاً معنّفاً وبدأت عملها الصغير من التدريب. هي موافقة ومتحمّسة، والحفل عامّ وسيُصوَّر، وزوجها السابق يعيش في الحيّ نفسه.',
        en: 'The funder wants a participant on the platform at the closing event. The clearest story is a woman who left an abusive husband and started her small business out of the training. She is willing and eager, the event is public and will be filmed, and her former husband lives in the same neighbourhood.',
      },
      question: {
        ar: 'ماذا تفعل؟',
        en: 'What do you do?',
      },
      choices: [
        {
          id: 'l5-story-a',
          weight: 'sound',
          text: {
            ar: 'تجلس معها على انفراد وتشرح ما يعنيه حفل عامّ مصوَّر في حيّها تحديداً، وتعرض بدائل: تتحدّث عن العمل من دون القصّة، أو صوت من دون صورة، أو لا شيء — والقرار قرارها بعد أن عرفت',
            en: 'Sit with her privately and explain what a filmed public event in her own neighbourhood specifically means, then offer alternatives — speak about the business without the story, voice without image, or not at all — and let her decide, now that she knows',
          },
          consequence: {
            ar: 'موافقتها حقيقية وليست مستنيرة بعد: حماستها مبنيّة على ما ستقوله، لا على من سيشاهده بعد شهر على الإنترنت وفي الحيّ الذي يعيش فيه رجل تركته. شرح الكلفة ليس وصاية عليها — الوصاية هي أن تقرّر أنت نيابةً عنها في الاتّجاهين. وعرض البدائل يعني أنها لا تختار بين الظهور والصمت، وهو خيار زائف يُقدَّم كثيراً لمن نجوا.',
            en: 'Her agreement is genuine and not yet informed: her eagerness is built on what she will say, not on who watches it a month later online, in the neighbourhood where a man she left still lives. Explaining the cost is not deciding for her — deciding for her is what happens in either direction if you skip this. Offering alternatives means she is not choosing between exposure and silence, which is a false choice offered to survivors far too often.',
          },
          next: null,
        },
        {
          id: 'l5-story-b',
          weight: 'costly',
          text: {
            ar: 'توافق على مشاركتها وتطلب من الفريق ألّا يصوّروا هذا الجزء من الحفل',
            en: 'Agree to her taking part, and ask the team not to film that part of the event',
          },
          consequence: {
            ar: 'أنت تحكّمت في كاميرا الجمعية ولا تتحكّم بأربعين هاتفاً في القاعة. والحفل عامّ في حيّها: من يحتاج أن يسمع سيسمع سواء صوّرتم أم لا. القيد على التصوير يعالج الأرشيف لا يعالج الخطر، وهو يعطي شعوراً بأن الاحتياط اتُّخذ — وهذا الشعور هو ما يمنع السؤال الحقيقي عن أن تُروى قصّة كهذه في هذا المكان أصلاً.',
            en: 'You have controlled the association’s camera and you do not control forty phones in the hall. And the event is public in her own neighbourhood: whoever needs to hear will hear whether you filmed it or not. A filming restriction addresses the archive rather than the risk, and it gives a sense that the precaution was taken — which is exactly what prevents the real question being asked about whether a story like this is told in this place at all.',
          },
          next: null,
        },
        {
          id: 'l5-story-c',
          weight: 'harmful',
          text: {
            ar: 'تعتذر للمانح وتضع مشاركة أخرى قصّتها أبسط — من دون أن تخبر الأولى بأنها كانت مطروحة',
            en: 'Decline to the funder and put forward another participant with a simpler story — without telling the first woman she had been considered',
          },
          consequence: {
            ar: 'حماية اتُّخذت بلا صاحبتها. أنت قرّرتَ عن امرأة بالغة ما يناسبها وما لا يناسبها، وحرمتَها من قرار كان لها أن تتّخذه — وهذا هو الشكل المهذّب من تجريد الناجيات من قرارهنّ، ويقع كثيراً باسم حمايتهنّ. وستعرف على الأرجح، من مشاركة أخرى، أن الأمر طُرح ومرّ من فوقها.',
            en: 'Protection taken without the person being protected. You decided, on behalf of an adult woman, what does and does not suit her, and took from her a decision that was hers to make — which is the polite form of stripping survivors of their own agency, and it happens most often in the name of protecting them. And she will probably find out, from another participant, that it came up and passed over her head.',
          },
          next: null,
        },
      ],
    },
    {
      id: 'l5-close',
      round: 3,
      draws: ['monitoring-and-evaluation', 'transformational-leadership'],
      situation: {
        ar: 'الإغلاق. عليك أن تكتب وثيقة الدروس المستفادة. أوضح درسين: أن البرنامج بُني على افتراض عن سوق العمل لم يصحّ، وأن قرار إيقاف الحضانة في برنامج سابق للجمعية أُعيد ارتكابه هنا. مديرة البرامج هي من اتّخذت القرار الثاني في المرّتين.',
        en: 'The close. You have to write the lessons-learned document. The two clearest lessons are that the programme rested on an assumption about the job market that did not hold, and that a decision to cut childcare in an earlier association programme was repeated here. The programmes manager took that second decision both times.',
      },
      question: {
        ar: 'ماذا تكتب؟',
        en: 'What do you write?',
      },
      choices: [
        {
          id: 'l5-close-a',
          weight: 'sound',
          text: {
            ar: 'تكتب الدرسين بوصفهما قرارين وظرفيهما، بلا اسم، وتقترح ما يمنع التكرار — وتُطلع مديرة البرامج على الوثيقة قبل تعميمها',
            en: 'Write both lessons as decisions and the circumstances around them, with no name attached, propose what would stop a repeat — and show the programmes manager the document before it circulates',
          },
          consequence: {
            ar: 'الوثيقة التي تسمّي شخصاً تُقرأ مرّة واحدة ثم لا تُكتب وثيقة أخرى أبداً؛ والوثيقة التي تحذف القرار تحمي الشخص وتضمن المرّة الثالثة. الفرق بينهما هو أن تُكتب الظروف: «أُوقفت الحضانة تحت عجز في الربع الأخير» تسمح لأيّ قارئ أن يرى النمط من دون أن تحاكم أحداً. وإطلاعها قبل التعميم ليس استئذاناً — هو ألّا تقرأ عن قرارها في تعميم.',
            en: 'A document that names a person is read once and then no further document is ever written; a document that omits the decision protects the person and guarantees the third time. What separates them is writing the circumstances: "childcare was stopped under a final-quarter shortfall" lets any reader see the pattern without anybody being put on trial. Showing it to her first is not asking permission — it is her not reading about her own decision in a circular.',
          },
          next: null,
        },
        {
          id: 'l5-close-b',
          weight: 'costly',
          text: {
            ar: 'تكتب درس سوق العمل بالتفصيل وتترك قرار الحضانة لمحادثة شفهية مع المديرة',
            en: 'Write the job-market lesson in full and leave the childcare decision to a verbal conversation with the manager',
          },
          consequence: {
            ar: 'الدرس الذي لا يُكتب لا يوجد بعد سنة. والقرار المتكرّر مرّتين هو بالضبط النوع الذي يحتاج أن يُقرأ من خارج الغرفة — لأنه لن يتكرّر مع المديرة نفسها بالضرورة، بل مع من سيخلفها ولن يكون قد سمع المحادثة. التعلّم المؤسّسي هو ما ينجو من مغادرة الأشخاص، والشفهي لا ينجو منها.',
            en: 'A lesson that is not written does not exist a year later. And a decision taken twice is exactly the kind that needs reading from outside the room — because it will not necessarily recur with the same manager, but with whoever succeeds her and never heard the conversation. Institutional learning is what survives people leaving, and a verbal word does not survive it.',
          },
          next: null,
        },
        {
          id: 'l5-close-c',
          weight: 'harmful',
          text: {
            ar: 'تكتب وثيقة إيجابية بما نجح — الوثيقة ستصل إلى المانح والإغلاق ليس وقت النقد الذاتي',
            en: 'Write a positive document about what worked — it will reach the funder, and a close is not the time for self-criticism',
          },
          consequence: {
            ar: 'وثيقة دروس بلا درس ليست وثيقة، هي ملحق دعائي. وهي تفعل شيئين معاً: تحرم الجمعية من التصحيح الوحيد المتاح لها بعد سنتين عمل، وتُعلّم كل من سيكتب واحدة بعدك أن هذه الوثائق تُكتب للمانحين. القيادة التي تحافظ على القيم حين يكون خرقها أسرع تُختبر هنا تحديداً، في وثيقة لا يقرأها كثيرون.',
            en: 'A lessons document with no lesson in it is not a document, it is a publicity annex. And it does two things at once: it deprives the association of the only correction available to it after two years of work, and it teaches everybody who writes one after you that these are written for funders. Leadership that holds to the values when breaking them would be faster is tested exactly here, in a document not many people read.',
          },
          next: null,
        },
      ],
    },
  ],
};
