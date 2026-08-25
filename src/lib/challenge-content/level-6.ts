import type { LevelChallenge } from './types';

/**
 * Level 6 — the six weeks before a coordinator hands a centre over.
 *
 * Level 6 is the level about what outlasts a person, so the run is the last six
 * weeks of one: the volunteer who has coordinated a neighbourhood centre for
 * three years and is leaving. Every course in the level names something that can
 * only be done now — the arrangement that was never written, the reasons that
 * live in one head, the successor who is being watched instead of trained, the
 * funder who does not know the name is changing.
 *
 * What makes each of these hard is the departure itself, and that is the whole
 * reason this situation and not another. Every wrong option below is free for
 * the person taking it: they are gone in a month, and the bill arrives for
 * somebody who was not in the room. This is the only one of the six runs where
 * the volunteer's own exit is the pressure rather than the setting, which is
 * exactly what a level about stewardship has to be able to test.
 */
export const levelSixRun: LevelChallenge = {
  level: 6,
  title: {
    ar: 'ستّة أسابيع قبل التسليم',
    en: 'Six weeks before the handover',
  },
  lede: {
    ar: 'ثلاث سنوات في تنسيق مركز الحيّ، وستّة أسابيع قبل أن تُسلّمه. ما تكتبه وما تُوقّعه وما تقوله لمن يأتي بعدك يقرّر ما الذي سيبقى — والثمن يدفعه من لن يكون في الغرفة.',
    en: 'Three years coordinating a neighbourhood centre, and six weeks before you hand it on. What you write, what you sign and what you say to whoever comes next decides what stays — and the bill goes to somebody who will not be in the room.',
  },

  openings: ['l6-successor', 'l6-hall'],

  steps: [
    // ============================================================== round 1
    {
      id: 'l6-successor',
      round: 1,
      draws: ['volunteer-lifecycle', 'training-of-trainers'],
      situation: {
        ar: 'تُغادر بعد ستّة أسابيع، وتنسيق المركز كلّه في رأسك: أيّ عائلة لا يُطرق بابها يوم الخميس، ومن عنده مفتاح المستودع، ولماذا توقّفت الزيارات المنزلية الفردية قبل سنتين. المتطوّعة التي ستحلّ مكانك انضمّت قبل أربعة أشهر وتعمل جيّداً، والمنسّقة تقترح أن ترافقك في كلّ شيء حتى آخر يوم.',
        en: 'You leave in six weeks, and the whole running of the centre is in your head: which family’s door is not knocked on a Thursday, who holds the store-room key, why one-to-one home visits stopped two years ago. The volunteer who will take over joined four months ago and is doing well, and the coordinator suggests she shadow you on everything until your last day.',
      },
      question: {
        ar: 'كيف تُمضي الأسابيع الستّة؟',
        en: 'How do you spend the six weeks?',
      },
      choices: [
        {
          id: 'l6-succ-a',
          weight: 'sound',
          text: {
            ar: 'تُسلّمها مهامّ حقيقية من الأسبوع الأوّل وتقف خلفها لا أمامها، وتكتبان معاً بعد كلّ مهمّة ما لم يكن مكتوباً',
            en: 'Hand her real tasks from the first week and stand behind her rather than in front of her, and after each one write down together whatever was never written',
          },
          consequence: {
            ar: 'المرافقة تُنتج شخصاً رأى الدور، والتسليم يُنتج شخصاً أدّاه — والفرق بين الاثنين يظهر في أوّل يوم تكون فيه وحدها. ستّة أسابيع من الأخطاء الصغيرة وأنت في الغرفة أرخص من خطأ واحد في الأسبوع السابع وأنت في مكان آخر. والكتابة بعد كلّ مهمّة هي الطريقة الوحيدة التي يُكتب بها ما لا يخطر لأحد أنه يحتاج كتابة: أنت لا تعرف ما الذي تعرفه حتى يسألك أحد.',
            en: 'Shadowing produces somebody who has seen the role; handing it over produces somebody who has done it — and the difference between the two shows on the first day she is alone. Six weeks of small mistakes with you in the room are cheaper than one mistake in week seven with you somewhere else. And writing it up after each task is the only way the things nobody thinks to write ever get written: you do not know what you know until somebody asks you.',
          },
          next: 'l6-reference',
        },
        {
          id: 'l6-succ-b',
          weight: 'costly',
          text: {
            ar: 'ترافقها في كلّ شيء ستّة أسابيع، وتكتب لها في الأسبوع الأخير ملفّ تسليم مفصّلاً',
            en: 'Let her shadow everything for six weeks, and write her a detailed handover file in the last week',
          },
          consequence: {
            ar: 'ستّة أسابيع من المشاهدة تُعلّم أقلّ ممّا يُعلّمه أسبوع من التنفيذ، والكبار يتعلّمون وهم يفعلون لا وهم يُشرَح لهم. والملفّ المكتوب في الأسبوع الأخير يُكتب في أسوأ أسبوع متاح — بلا وقت، وبلا سؤال يُوجّهه، ومن ذاكرة رتّبت نفسها — فيخرج شاملاً ومُنظّماً وخالياً من الشيء الوحيد الذي يحتاجه من سيقرأه: لماذا.',
            en: 'Six weeks of watching teaches less than one week of doing, and adults learn while doing rather than while it is explained to them. And a file written in the last week is written in the worst week available — no time, no question shaping it, and a memory that has quietly tidied itself — so it comes out comprehensive, orderly, and missing the one thing its reader needs: why.',
          },
          next: 'l6-renewal',
        },
        {
          id: 'l6-succ-c',
          weight: 'harmful',
          text: {
            ar: 'تُبقي التنسيق بيدك حتى آخر يوم كي لا يختلّ شيء، وتَعِدها بأنك ستبقى على الهاتف بعدها',
            en: 'Keep the coordination in your own hands to the last day so nothing slips, and promise her you will be on the phone afterwards',
          },
          consequence: {
            ar: 'الوعد بالهاتف يبدو كرماً وهو تحديداً ما يمنع التسليم من أن يحدث: من تعرف أن الجواب على بُعد رسالة لا تبني الجواب في نفسها، ومن يعرف أن أحداً ما زال ممسكاً بالخيط لا يمسكه. وأنت بذلك تركت المركز معلّقاً بشخص غادر — وهذا ما يسمّيه هذا المستوى فشلاً في الاستدامة البشرية: عمل يتوقّف حين يتوقّف واحد. بعد ثلاثة أشهر ستردّ أقلّ، ثم لن تردّ، وتكون هي قد خسرت ثلاثة أشهر كان يمكن أن تتعلّم فيها.',
            en: 'The promise of the phone looks like generosity and it is exactly what stops the handover happening: somebody who knows the answer is one message away does not build the answer in herself, and somebody who knows another person is still holding the thread does not take hold of it. You have left the centre hanging off a person who has gone — which is what this level calls a failure of human sustainability: work that stops when one person stops. In three months you will answer less, then not at all, and she will have lost the three months in which she could have been learning.',
          },
          next: 'l6-renewal',
        },
      ],
    },
    {
      id: 'l6-hall',
      round: 1,
      draws: ['partnerships', 'sustainability-and-resources'],
      situation: {
        ar: 'المركز يعمل منذ ثلاث سنوات في قاعة تملكها جمعية خيرية في الحيّ، بلا إيجار وبلا ورقة. الترتيب قائم لأنك ورئيسها تعرفان بعضكما من زمن. وحين أخبرته أنك تُغادر قال ضاحكاً: «القاعة قاعتكم، لا تُشغل بالك».',
        en: 'The centre has run for three years in a hall belonging to a charitable society in the neighbourhood, rent-free and with nothing on paper. The arrangement exists because you and its head have known each other for years. When you told him you were leaving he laughed and said: "the hall is yours, do not give it a thought."',
      },
      question: {
        ar: 'ماذا تفعل قبل أن تُغادر؟',
        en: 'What do you do before you go?',
      },
      choices: [
        {
          id: 'l6-hall-a',
          weight: 'sound',
          text: {
            ar: 'تطلب أن يُكتب الترتيب في مذكّرة قصيرة — المدّة، ومهلة الإشعار، ومن يُوقّع عن كلّ طرف — وتُوقَّع بحضور من ستخلفك، وتُدرَج قيمة القاعة في ميزانية المركز بسعر السوق',
            en: 'Ask for the arrangement to be written into a short memorandum — the term, the notice period, who signs for each side — have it signed with your successor present, and put the hall into the centre’s budget at market value',
          },
          consequence: {
            ar: 'ما لديك ليس شراكة بل صداقة تُنتج قاعة، والصداقة لا تنتقل مع الدور. الورقة ليست شكّاً في الرجل — هي ما يجعل القاعة للمركز بدل أن تكون لك، وما يحميه هو نفسه من أن يُطالبه مجلسه غداً بتفسير لِمَ يُشغَل نصف مبناه بلا مقابل. وحضور من تخلفك عند التوقيع نقلٌ للعلاقة لا إخبارٌ بها. والتقييم بسعر السوق يُظهر في الميزانية ما يدفعه الحيّ فعلاً، وهو بند غائب اليوم عن كلّ تقرير — فيبدو المركز أرخص ممّا هو، والحيّ أقلّ مساهمةً ممّا هو.',
            en: 'What you have is not a partnership but a friendship that produces a hall, and a friendship does not transfer with a role. The paper is not a doubt about the man — it is what makes the hall the centre’s rather than yours, and what protects him from being asked by his own board next year why half his building is occupied for nothing. Your successor being there at the signing is the relationship transferring rather than being announced. And valuing it at market rate puts into the budget what the neighbourhood actually pays, a line missing from every report today — so the centre looks cheaper than it is, and the neighbourhood looks like less of a contributor than it is.',
          },
          next: 'l6-reference',
        },
        {
          id: 'l6-hall-b',
          weight: 'costly',
          text: {
            ar: 'تكتب الترتيب في ملاحظات التسليم وتشرحه لمن تخلفك، ولا تفتح الموضوع معه',
            en: 'Write the arrangement into your handover notes and explain it to your successor, without raising it with him',
          },
          consequence: {
            ar: 'ترتيبٌ يكتبه طرف واحد ليس اتّفاقاً، هو وصف. ومن تخلفك ستقرأ في الملفّ أن للمركز قاعة، بينما الذي تملكه في الحقيقة رقم رجل لا يعرفها ولم يَعِد أحداً بشيء مكتوب. والأسوأ أن الملاحظة ستُشعرها بالأمان فلا تبحث عن بديل، فإن قيل لها بعد سنة إن القاعة صارت لازمة لغرض آخر لم يبقَ أمامها مكان ولا وقت. المحادثة المُحرجة قبل المغادرة أرخص من الأزمة بعدها بسنة.',
            en: 'An arrangement one party writes down is not an agreement, it is a description. Your successor will read in the file that the centre has a hall, when what she actually holds is the number of a man who does not know her and has promised nobody anything in writing. Worse, the note will make her secure enough not to look for an alternative, so when she is told in a year that the hall is needed for something else she will have neither a place nor time. The awkward conversation before you leave is cheaper than the crisis a year after it.',
          },
          next: 'l6-renewal',
        },
        {
          id: 'l6-hall-c',
          weight: 'harmful',
          text: {
            ar: 'تُعرّفهما على بعضهما وتترك العلاقة تنتقل بالثقة — طلب ورقة بعد ثلاث سنوات من الكرم إساءة',
            en: 'Introduce the two of them and let the relationship pass on trust — asking for paperwork after three years of generosity would be an insult',
          },
          consequence: {
            ar: 'الحرج الذي تتجنّبه حرجك أنت، والكلفة يدفعها مركز كامل. الشراكة القائمة على علاقة شخصية لا تنجو من تغيّر الأشخاص — لا من مغادرتك، ولا من مجلس جديد يُنتخَب عندهم بعد سنة ولا يعرف لماذا يُشغَل نصف مبناه بلا مقابل. وثلاث سنوات من الكرم هي بالضبط ما يجعل الورقة ممكنة اليوم: الاتفاقيات تُطلب والعلاقة في أفضل حالاتها، لا حين يبدأ الخلاف. والجمعية التي لا تملك مقرّاً مكتوباً لا تملك مقرّاً.',
            en: 'The awkwardness you are avoiding is yours; the cost is a whole centre’s. A partnership resting on a personal relationship does not survive a change of people — not yours, and not a new board being elected there next year with no idea why half its building is occupied for free. And three years of generosity is precisely what makes the paper possible today: agreements are asked for while a relationship is at its best, not once the disagreement has started. An organisation with no premises in writing has no premises.',
          },
          next: 'l6-renewal',
        },
      ],
    },

    // ============================================================== round 2
    {
      id: 'l6-reference',
      round: 2,
      draws: ['volunteer-lifecycle', 'governance-and-accountability'],
      situation: {
        ar: 'متطوّع غادر المركز قبل ثلاثة أشهر بعد إنذار موثّق في ملفّه — أرسل بيانات أسرة إلى مجموعة خارج قنوات الجمعية. يتّصل بك اليوم: يتقدّم لوظيفة ويريد شهادة خبرة، ويقول إنك آخر من يستطيع كتابتها لأن من سيأتي بعدك لم يره يعمل يوماً واحداً.',
        en: 'A volunteer left the centre three months ago after a warning documented in his file — he sent a family’s details to a group outside the association’s channels. He rings you today: he is applying for a job and wants an experience reference, and says you are the last person who can write one, because whoever comes after you never saw him work a single day.',
      },
      question: {
        ar: 'ماذا تكتب له؟',
        en: 'What do you write him?',
      },
      choices: [
        {
          id: 'l6-ref-a',
          weight: 'sound',
          text: {
            ar: 'تكتب شهادة موضوعية بما فعله فعلاً — الدور والمدّة والمهام والأرقام — بلا رأي فيه وبلا ذكر للإنذار، وتترك الإنذار في ملفّه كما هو',
            en: 'Write an objective reference of what he actually did — role, dates, tasks and figures — with no opinion of him in it and no mention of the warning, and leave the warning in his file exactly as it stands',
          },
          consequence: {
            ar: 'شهادة الخبرة حقّ لمن أدّى العمل لا مكافأة على حسن السيرة، ولهذا تُكتب بالوقائع: «أدار ثمانية عشر لقاءً» جملة يستطيع أيّ أحد التحقّق منها، و«كان متعاوناً» رأيك أنت. والإنذار لا يدخلها ولا يُمحى — الشهادة تصف عملاً والملفّ يصف إجراءً، ولكلٍّ منهما قارئه ووقته. وقوله إنك الأخير صحيح، وهو سبب لأن تكتبها اليوم لا سبب لأن تكتب فيها أكثر ممّا تعرف.',
            en: 'An experience reference is a right earned by doing the work, not a reward for good conduct, which is why it is written in facts: "ran eighteen sessions" is a sentence anybody can check, while "was cooperative" is your opinion. The warning neither goes into it nor gets erased — the reference describes work and the file describes a process, and each has its own reader and its own moment. His point that you are the last one is true, and it is a reason to write it today rather than a reason to write more into it than you know.',
          },
          next: 'l6-memory',
        },
        {
          id: 'l6-ref-b',
          weight: 'costly',
          text: {
            ar: 'تكتب له شهادة دافئة عامّة تُثني على تعاونه وتتجنّب التفاصيل',
            en: 'Write him a warm, general reference praising how cooperative he was, and stay off the detail',
          },
          consequence: {
            ar: 'الشهادة العامّة لا تنفعه ولا تُنصفه: من يقرأ عشر شهادات في اليوم يعرف أن «متعاون ومحبوب» تعني أن كاتبها لم يجد ما يقوله، فيقرأ الدفء علامةً لا تزكية. وأنت خسّرته الشيء الوحيد الذي كان يملكه فعلاً — ثمانية عشر لقاءً وأسر تابعها بنفسه — لأنك أردت أن تتجنّب الحديث عمّا حدث، فحذفت معه كلّ ما لم يحدث فيه شيء. واللطف الذي يُفرغ الوثيقة من مضمونها ليس لطفاً.',
            en: 'A general reference neither helps him nor does him justice: somebody who reads ten a day knows that "cooperative and well liked" means the writer could not find anything to say, so they read the warmth as a flag rather than an endorsement. And you have cost him the one thing he genuinely had — eighteen sessions and families he followed up himself — because you wanted to avoid the subject of what happened, and deleted along with it everything in which nothing happened. Kindness that empties a document of its content is not kindness.',
          },
          next: 'l6-farewell',
        },
        {
          id: 'l6-ref-c',
          weight: 'harmful',
          text: {
            ar: 'تعتذر عن كتابتها وتطلب منه أن يطلبها من الجمعية بعد مغادرتك — لا تريد أن تُوقّع لشخص بعد إنذار',
            en: 'Decline, and tell him to ask the association for one after you have gone — you would rather not sign for somebody who has had a warning',
          },
          consequence: {
            ar: 'أنت حوّلت الشهادة إلى عقوبة ثانية على واقعة عوقب عليها مرّة، وهذا بالذات ما تمنعه هذه الدورة: الشهادة لا تُؤخَّر ولا تُحجَب كأداة ضغط. والإحالة إلى الجمعية بعد مغادرتك ليست إحالة — هي باب مغلق بلغة مهذّبة، لأن لا أحد هناك رآه يعمل. والأثر لا يقف عنده: الفريق كلّه سيعرف أن الخروج من هذا المركز قد يعني الخروج بلا ورقة، ومن يعرف ذلك لا يُبلّغ عن خطئه ولا يعترف به.',
            en: 'You have turned the reference into a second punishment for something already punished once, which is exactly what this course forbids: a reference is neither delayed nor withheld as leverage. And referring him to the association after you have gone is not a referral — it is a closed door in polite language, because nobody there saw him work. The effect does not stop with him: the whole team learns that leaving this centre can mean leaving without a document, and people who know that neither report their own mistakes nor admit to them.',
          },
          next: 'l6-farewell',
        },
      ],
    },
    {
      id: 'l6-renewal',
      round: 2,
      draws: ['sustainability-and-resources', 'partnerships', 'governance-and-accountability'],
      situation: {
        ar: 'طلب تجديد التمويل يُرسَل قبل مغادرتك بأسبوعين، وفيه خانة لاسم المسؤول عن البرنامج في السنتين القادمتين. المانح يغطّي تسعين بالمئة من ميزانية المركز، ومسؤول البرامج عنده قال لك مرّة إن أوّل ما ينظر إليه استقرار الفريق. ومن ستحلّ مكانك في الدور منذ شهرين.',
        en: 'The funding renewal goes in a fortnight before you leave, and it has a field for the name of the person responsible for the programme over the next two years. The funder covers ninety per cent of the centre’s budget, and its programme officer once told you the first thing he looks at is team stability. Your successor has been in the role for two months.',
      },
      question: {
        ar: 'ماذا تكتب في الطلب؟',
        en: 'What goes in the form?',
      },
      choices: [
        {
          id: 'l6-ren-a',
          weight: 'sound',
          text: {
            ar: 'تكتب اسمها وتاريخ التسليم كما هما، وتُرفق خطّة الانتقال ومن يُشرف عليها في الأشهر الثلاثة الأولى، وتطلب مكالمة مع مسؤول البرامج قبل أن يصله الطلب',
            en: 'Put her name and the handover date in as they are, attach the transition plan and who supervises it for the first three months, and ask for a call with the programme officer before the form reaches him',
          },
          consequence: {
            ar: 'التغيير الذي يقرأه المانح في خانة يبدو مفاجأةً، والتغيير الذي يُشرح له قبلها بأسبوع يبدو إدارةً — والفرق كلّه في من أخبره ومتى. وخطّة الانتقال هي ما يحوّل «منسّقة جديدة» إلى «منسّقة جديدة يُشرف عليها فلان ثلاثة أشهر»، وهذه جملة يستطيع مسؤول البرامج أن يدافع عنها أمام لجنته. والرقم الآخر الذي يستحقّ أن يُقال في تلك المكالمة هو التسعون بالمئة: مركز يعيش على مصدر واحد يُسلّم خليفتك مخاطرة أكبر من كلّ ما في هذا الطلب.',
            en: 'A change a funder reads in a box looks like a surprise; the same change explained to him a week earlier looks like management — and the whole difference is who told him and when. The transition plan is what turns "a new coordinator" into "a new coordinator, supervised by a named person for three months", and that is a sentence a programme officer can defend to his committee. And the other figure worth saying on that call is the ninety per cent: a centre living on one source hands your successor a bigger risk than anything on this form.',
          },
          next: 'l6-memory',
        },
        {
          id: 'l6-ren-b',
          weight: 'costly',
          text: {
            ar: 'تكتب اسمك أنت — الطلب عن عمل السنتين الماضيتين، والتغيير يُبلَّغ بعد صدور قرار التجديد',
            en: 'Put your own name in — the form is about the last two years’ work, and the change can be reported once the renewal comes through',
          },
          consequence: {
            ar: 'دفاع سليم عن ورقة، وخسارة كاملة لما بعدها. أوّل ما سيعرفه المانح عن المنسّقة الجديدة أن المركز لم يُخبره، وهذا انطباع لا تُصلحه سنة من التقارير الجيّدة. والمساءلة أمام من يموّل ليست ملء الخانات بما هو صحيح شكلاً — هي أن يُبلَّغ بما تغيّر حين يتغيّر، وأشدّ ما يكون ذلك حين يقع التغيير في الشيء الذي قال لك بنفسه إنه ينظر إليه. أنت اشتريت تجديداً بثمن لن تكون أنت من يدفعه.',
            en: 'A sound defence of a form, and a total loss of everything after it. The first thing the funder will learn about the new coordinator is that the centre did not tell him, and that is an impression a year of good reports does not repair. Accountability to a funder is not filling boxes with what is formally true — it is telling him what changed when it changes, most of all when the change falls in the very thing he told you himself that he looks at. You have bought a renewal at a price you will not be the one to pay.',
          },
          next: 'l6-farewell',
        },
        {
          id: 'l6-ren-c',
          weight: 'harmful',
          text: {
            ar: 'تكتب اسمها وتصفها بأنها «منسّقة المركز منذ سنتين» — الفرق لن يظهر في ورقة',
            en: 'Put her name in and describe her as "coordinator of the centre for two years" — the difference will not show on paper',
          },
          consequence: {
            ar: 'هذا ليس تحسيناً لصياغة، هو بيان غير صحيح إلى جهة تموّل على أساسه. والفرق يظهر: في أوّل زيارة ميدانية، وفي أوّل مكالمة تسأل عن قرار اتُّخذ قبل سنة، وفي سيرتها الذاتية التي ستحمل تاريخاً يخالف ما كُتب. وحين يظهر لن يُقرأ خطأً منك — أنت ستكون قد مشيت — بل سطراً كتبته هي عن نفسها. أن تُوقّع كذبة صغيرة باسم شخص آخر في يومك الأخير هو أسوأ ما يمكن أن تتركه له.',
            en: 'This is not an improvement in wording, it is an untrue statement to a body that funds on the strength of it. And the difference does show: at the first site visit, at the first call asking about a decision taken a year ago, and on her own CV, which will carry dates contradicting what was written. When it shows it will not be read as your mistake — you will have gone — but as a line she wrote about herself. Signing a small lie in somebody else’s name on your last day is the worst thing you can leave them.',
          },
          next: 'l6-farewell',
        },
      ],
    },

    // ============================================================== round 3
    {
      id: 'l6-memory',
      round: 3,
      draws: ['training-of-trainers', 'volunteer-lifecycle'],
      situation: {
        ar: 'أسبوعك الأخير. طُلب منك «ملفّ تسليم». وراءك ثلاث سنوات فيها قرارات لم يُكتب لها سبب: لماذا لم تعد الزيارات المنزلية فردية، ولماذا أُقفل المركز يوم السبت، ولماذا لا تمرّ لوائح الأسماء على مجموعة الفريق. ولم يسألك أحد عن أيٍّ منها.',
        en: 'Your last week. You have been asked for a "handover file". Behind you are three years holding decisions whose reasons were never written down: why home visits stopped being one-to-one, why the centre no longer opens on a Saturday, why name lists do not go through the team’s group. Nobody has asked you about any of it.',
      },
      question: {
        ar: 'ماذا تُخرج من رأسك، وكيف؟',
        en: 'What do you get out of your head, and how?',
      },
      choices: [
        {
          id: 'l6-mem-a',
          weight: 'sound',
          text: {
            ar: 'تجلس ساعةً مع من تخلفك ومع المنسّقة على ثلاثة أسئلة — ما الذي نجح، وما الذي فشل ولماذا، وما الذي كنت تتمنّى أن يقوله لك أحد في أوّلك — ويُكتب الكلام أثناء الجلسة لا بعدها',
            en: 'Sit for an hour with your successor and the coordinator on three questions — what worked, what failed and why, and what you wish somebody had told you at the start — and have it written down during the session rather than after it',
          },
          consequence: {
            ar: 'ما في رأسك لا يخرج بالكتابة وحدها لأنك لا تعرف أين هو؛ يخرج تحت سؤال يطرحه شخص لا يعرف الجواب. والأسئلة الثلاثة تحديداً تُخرج ما لا يُخرجه أيّ نموذج تسليم: السبب لا الإجراء. والكتابة أثناء الجلسة لا بعدها، لأن ما لا يُكتب في ساعته يُكتب مصفّىً أو لا يُكتب. ووجود المنسّقة يعني أن ما قلتَه صار للجمعية لا لشخص واحد قد يغادر هو الآخر بعد سنة.',
            en: 'What is in your head does not come out by writing, because you do not know where it is: it comes out under a question put by somebody who does not know the answer. Those three questions in particular surface what no handover template does — the reason, not the procedure. And it is written during the session rather than afterwards, because what is not written in its own hour gets written filtered, or not at all. The coordinator being there means what you said now belongs to the association rather than to one person who may herself leave in a year.',
          },
          next: null,
        },
        {
          id: 'l6-mem-b',
          weight: 'costly',
          text: {
            ar: 'تكتب ملفّاً مفصّلاً بكلّ ما تعرفه وترفعه على المجلّد المشترك قبل أن تمشي',
            en: 'Write a detailed file of everything you know and upload it to the shared folder before you go',
          },
          consequence: {
            ar: 'ملفّ يكتبه شخص واحد ولا يسأله أحد هو أفضل ما يستطيع ذلك الشخص أن يتذكّره، وهو أقلّ بكثير ممّا يعرفه. ستكتب فيه ما تظنّه مهمّاً، ولن تكتب ما صار بديهياً عندك — والبديهيّات هي بالضبط ما يتعثّر فيه الجديد. ثم إن ملفّاً يحتاج من يعرف بوجوده وأين هو ليس ذاكرة مؤسّسية بل أرشيفاً: المجلّد المشترك مليء بملفّات لم تُفتح، وملفّك سيصير واحداً منها بعد شهرين.',
            en: 'A file written by one person with nobody asking is the best that person can remember, which is a great deal less than what they know. You will write what you think matters and leave out what has become obvious to you — and the obvious is exactly where a newcomer stumbles. And a file that needs somebody to know it exists and where it is is an archive rather than an institutional memory: the shared folder is full of documents nobody has opened, and in two months yours is one of them.',
          },
          next: null,
        },
        {
          id: 'l6-mem-c',
          weight: 'harmful',
          text: {
            ar: 'تكتب الإجراءات كما تُنفَّذ اليوم وتترك الأسباب — من يأتي بعدك له أن يقرّر بطريقته',
            en: 'Write the procedures as they are done today and leave the reasons out — whoever comes after you is entitled to decide their own way',
          },
          consequence: {
            ar: 'قاعدة بلا سببها تُلغى عند أوّل شخص تُضايقه. «لا زيارات فردية» بلا سببها ستُقرأ بيروقراطيةً في أوّل يوم يضيق فيه الوقت، فتعود الزيارات الفردية، وتكون قد كتبت بيدك السطر الذي أُلغيت به قاعدة حماية. والاستقلالية التي تتحدّث عنها حقيقية في «كيف» لا في «لماذا»: من حقّ من يخلفك أن يغيّر الإجراء، وحقّه قبل ذلك أن يعرف ما الذي دفع إليه — وهو حقّ لا يستطيع أن يطالبك به لأنه لا يعرف أنه موجود.',
            en: 'A rule without its reason is repealed by the first person it inconveniences. "No one-to-one visits", stripped of why, reads as bureaucracy on the first day time is short; the one-to-one visits come back, and you will have written with your own hand the line that abolished a safeguarding rule. The autonomy you are talking about is real in the "how" and not in the "why": your successor is entitled to change the procedure, and entitled first to know what drove it — a right she cannot claim from you, because she does not know it exists.',
          },
          next: null,
        },
      ],
    },
    {
      id: 'l6-farewell',
      round: 3,
      draws: ['volunteer-lifecycle', 'sustainability-and-resources', 'governance-and-accountability'],
      situation: {
        ar: 'يومك الأخير. على هاتفك أرقام إحدى عشرة أمّاً كنت تتّصل بهنّ لتذكيرهنّ بالجلسات، ومعها ملاحظاتك عن أين وصلت كلّ واحدة. ثلاث منهنّ اتّصلن هذا الأسبوع يسألن إن كان المركز سيستمرّ، وواحدة قالت إنها لن تتعامل مع أحد غيرك.',
        en: 'Your last day. On your phone are the numbers of eleven mothers you used to ring to remind them of sessions, and with them your notes on where each one has got to. Three of them called this week to ask whether the centre is carrying on, and one said she will not deal with anybody but you.',
      },
      question: {
        ar: 'ماذا تفعل بالأرقام وبالسؤال؟',
        en: 'What do you do with the numbers, and with the question?',
      },
      choices: [
        {
          id: 'l6-far-a',
          weight: 'sound',
          text: {
            ar: 'تتّصل بالإحدى عشرة قبل أن تمشي وتُعرّفهنّ باسم من تخلفك وبرقم المركز، وتنقل ملاحظات المتابعة إلى سجلّ المركز، ثم تمسح الأرقام من هاتفك',
            en: 'Ring all eleven before you go and give them your successor’s name and the centre’s number, move the follow-up notes into the centre’s own record, then delete the numbers from your phone',
          },
          consequence: {
            ar: 'ثلاث حركات في قرار واحد، وكلّ واحدة تذهب إلى مكانها: العلاقة تُسلَّم بصوت من يحملها، لأن التعريف من الشخص نفسه هو ما ينتقل فعلاً؛ والمتابعة تذهب إلى سجلّ الجمعية لأنها ملك المركز لا ملكك؛ والأرقام تخرج من هاتفك لأن الغرض الذي جُمعت له انتهى اليوم. والمكالمة الأخيرة أرخص ما في هذه القائمة وأبقاها أثراً: أمّ تعرف اسم من تتّصل به لا تنقطع، وأمّ لا تعرف تنقطع بصمت ولا يظهر ذلك في تقرير قبل شهرين.',
            en: 'Three moves in one decision, and each goes where it belongs: the relationship is handed over in the voice of the person holding it, because an introduction from that person is what actually transfers; the follow-up goes into the association’s record because it is the centre’s and not yours; and the numbers leave your phone because the purpose they were collected for ended today. The last call is the cheapest item on that list and the one that lasts longest: a mother who knows the name of who to ring does not fall away, and one who does not falls away quietly, and it will not appear in any report for two months.',
          },
          next: null,
        },
        {
          id: 'l6-far-b',
          weight: 'costly',
          text: {
            ar: 'تُعطي رقمك الشخصي لمن تريد أن تبقى على تواصل معك، وتقول لهنّ إنك ستُجيب دائماً',
            en: 'Give your personal number to the ones who want to stay in touch, and tell them you will always answer',
          },
          consequence: {
            ar: 'وفاء حقيقي بعد ثلاث سنوات، وثمنه يدفعه المركز والأمّهات معاً. الأمّ التي قالت إنها لن تتعامل مع أحد غيرك سمعت للتوّ ما يؤكّد لها أنها كانت على حقّ، ومن تخلفك ستُقابل أحد عشر شخصاً يقيسونها بمن غادر ويحتفظون بخطّ خلفيّ إليه. والمتابعة التي تمرّ عبر هاتفك الشخصي لا تدخل سجلّاً ولا يراها أحد ولا تحميك ولا تحميهنّ. الوداع الجيّد ينقل الناس إلى المركز، لا يُبقيهم عندك.',
            en: 'Genuine loyalty after three years, and the centre and the mothers pay for it between them. The mother who said she would deal with nobody but you has just heard the thing that confirms she was right, and your successor will meet eleven people who measure her against somebody who left and who keep a back channel to him. And follow-up that runs through your personal phone enters no record, is seen by nobody, and protects neither you nor them. A good farewell moves people to the centre; it does not keep them with you.',
          },
          next: null,
        },
        {
          id: 'l6-far-c',
          weight: 'harmful',
          text: {
            ar: 'تمسح كلّ شيء من هاتفك في آخر يوم — الأرقام والملاحظات معاً — فقد انتهى دورك ولم تعد هذه البيانات تخصّك',
            en: 'Delete everything from your phone on the last day — numbers and notes together — your role is over and the data is not yours to hold',
          },
          consequence: {
            ar: 'نصف القاعدة صحيح، والنصف الآخر هو الذي يؤذي. الأرقام تُمسح فعلاً لأن غرضها انتهى. أمّا ملاحظات المتابعة فلم تكن ملكك حتى تُتلفها — هي سجلّ المركز عن إحدى عشرة أسرة في منتصف برنامج، وقد أتلفت النسخة الوحيدة منه. والنتيجة أن الجمعية لن تعرف أنها فقدتهنّ، لأن ما يُثبت أنهنّ كنّ داخل البرنامج مُسِح معهنّ. البيانات تُنقل إلى حيث تنتمي قبل أن تُمسح من حيث لا تنتمي، والترتيب هو المسألة كلّها.',
            en: 'Half the rule is right, and it is the other half that does the harm. The numbers do come off, because their purpose has ended. The follow-up notes, though, were never yours to destroy — they are the centre’s record of eleven families in the middle of a programme, and you have destroyed the only copy. The result is that the association will not know it lost them, because the thing proving they were ever in the programme was deleted with them. Data moves to where it belongs before it is erased from where it does not, and the order is the whole matter.',
          },
          next: null,
        },
      ],
    },
  ],
};
