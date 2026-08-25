import type { LevelChallenge } from './types';

/**
 * Level 3 — after-school study support in a village that asked for something
 * else.
 *
 * Level 3 is the move from doing to designing, so the pressure here is the
 * pressure a designer feels: a decision taken in week one about who is eligible
 * is still binding in week nine, and it is binding on people who were never in
 * the room when it was taken.
 *
 * The safeguarding situation sits in the last round on purpose. A protection
 * case arriving while a project is already running is harder than one arriving
 * on a quiet day, and it is the version that actually happens.
 */
export const levelThreeRun: LevelChallenge = {
  level: 3,
  title: {
    ar: 'دعم دراسي في قرية',
    en: 'Study support in a village',
  },
  lede: {
    ar: 'طُلب منكم مشروع، ومعه فكرة جاهزة عمّا تحتاجه القرية. من هنا حتى الأسبوع التاسع، كل قرار تتّخذه يضيّق الخيارات التي بعده.',
    en: 'You have been asked for a project, and handed a ready-made idea of what the village needs. From here to week nine, every decision you take narrows the ones after it.',
  },

  openings: ['l3-assumed-need', 'l3-roles'],

  steps: [
    // ============================================================== round 1
    {
      id: 'l3-assumed-need',
      round: 1,
      draws: ['community-needs', 'project-management'],
      situation: {
        ar: 'اللجنة المحلّية قرّرت أن القرية تحتاج مختبر حاسوب، وطلبت منكم كتابة المقترح. جولتك الأولى في القرية سمعتَ فيها شيئاً آخر: الأهالي يتحدّثون عن أطفال يتأخّرون سنتين دراسيّتين وعن معلّمة واحدة لثلاثة صفوف. المهلة أسبوعان.',
        en: 'The local committee has decided the village needs a computer lab and has asked you to write the proposal. On your first visit you heard something else: parents talking about children two school years behind, and one teacher covering three classes. You have two weeks.',
      },
      question: {
        ar: 'كيف تكتب المقترح؟',
        en: 'How do you write the proposal?',
      },
      choices: [
        {
          id: 'l3-need-a',
          weight: 'sound',
          text: {
            ar: 'تعود إلى اللجنة بما سمعتَه، وتقترح أسبوعاً واحداً لجلستَي نقاش مع الأهالي والمعلّمة قبل تثبيت المشكلة التي سيعالجها المقترح',
            en: 'Go back to the committee with what you heard, and propose one week for two discussion sessions with parents and the teacher before fixing the problem the proposal will address',
          },
          consequence: {
            ar: 'اللجنة ليست خصماً — هي طرف يملك معلومة ناقصة كما تملك أنت. والفرق بين الاحتياج المفترض والاحتياج المُعبَّر عنه ليس خلافاً في الرأي: مختبر حاسوب لأطفال متأخّرين سنتين في القراءة يعطي صوراً جيّدة ولا يغيّر شيئاً. أسبوع من الأسبوعين ثمن معقول لمشروع يعالج المشكلة الصحيحة.',
            en: 'The committee is not an opponent — it is a party working from incomplete information, exactly as you are. And the gap between an assumed need and a voiced one is not a difference of opinion: a computer lab for children two years behind in reading produces good photographs and changes nothing. One week out of two is a reasonable price for a project that addresses the right problem.',
          },
          next: 'l3-selection',
        },
        {
          id: 'l3-need-b',
          weight: 'costly',
          text: {
            ar: 'تكتب مقترح المختبر كما طُلب، وتضيف فيه بنداً لدعم دراسي كنشاط ثانوي',
            en: 'Write the computer-lab proposal as asked, adding study support inside it as a secondary activity',
          },
          consequence: {
            ar: 'حلّ وسط يُرضي الغرفة ويُبقي المشكلة. الميزانية والزمن سيذهبان إلى البند الرئيسي، وسيُقاس المشروع بما وعد به عنوانه — عدد الأجهزة — فيبدو ناجحاً بينما الأطفال حيث كانوا. وبيان المشكلة الذي كُتب خطأً في الأسبوع الأوّل لا يُصحَّح لاحقاً؛ كل شيء بعده يُبنى عليه.',
            en: 'A compromise that satisfies the room and keeps the problem. Budget and time will go to the headline activity, and the project will be measured against what its title promised — a count of machines — so it will look successful while the children are where they were. A problem statement written wrong in week one is not corrected later; everything after it is built on it.',
          },
          next: 'l3-venue',
        },
        {
          id: 'l3-need-c',
          weight: 'harmful',
          text: {
            ar: 'تكتب مقترح الدعم الدراسي مباشرةً — أنت سمعتَ الأهالي واللجنة لم تسمعهم',
            en: 'Write the study-support proposal outright — you heard the parents and the committee did not',
          },
          consequence: {
            ar: 'ما سمعتَه صحيح على الأرجح، والطريقة تلغي الغرض من سماعه. أنت الآن تتحدّث باسم قرية بناءً على جولة واحدة، أمام لجنة تعيش فيها وستبقى بعد انتهاء المشروع — وهذه اللجنة هي التي ستقرّر إن كان لأحد من الجمعية أن يعود. المساءلة المجتمعية ليست أن تكون على حقّ؛ هي أن يكون القرار مشتركاً مع من يعنيه.',
            en: 'What you heard is probably right, and the method cancels the point of having heard it. You are now speaking for a village on the strength of one visit, in front of a committee that lives there and will still be there after the project ends — and that committee decides whether anybody from the association comes back. Community accountability is not about being right; it is about the decision being shared with the people it lands on.',
          },
          next: 'l3-venue',
        },
      ],
    },
    {
      id: 'l3-roles',
      round: 1,
      draws: ['team-leadership', 'events-management'],
      situation: {
        ar: 'فريقك ستّة متطوّعين وأنت مسؤول عنهم. متطوّع واحد يأخذ كل المهام الظاهرة — التقديم، التواصل مع اللجنة، التصوير — وهو يؤدّيها جيّداً. ومتطوّعة انضمّت قبل شهرين لم تُسنَد إليها مهمّة واحدة بعد، وهي تحضر كل اجتماع. جلسة الإطلاق بعد عشرة أيام.',
        en: 'Your team is six volunteers and you are responsible for them. One takes every visible task — presenting, dealing with the committee, photography — and does them well. A volunteer who joined two months ago has not been given a single task, and attends every meeting. The launch session is in ten days.',
      },
      question: {
        ar: 'كيف توزّع أدوار جلسة الإطلاق؟',
        en: 'How do you assign the roles for the launch?',
      },
      choices: [
        {
          id: 'l3-roles-a',
          weight: 'sound',
          text: {
            ar: 'تسند إليها دوراً حقيقياً في الجلسة مع من يسندها، وتتحدّث إلى المتطوّع الآخر على انفراد عن سبب التغيير قبل أن يسمعه في الاجتماع',
            en: 'Give her a real role in the session with somebody supporting her, and speak to the other volunteer privately about the change before he hears it in the meeting',
          },
          consequence: {
            ar: 'التوزيع بالقدرة والتوفّر لا بالعلاقة هو نصف القيادة، ونصفها الثاني ألّا يكتشف أحد التغيير أمام الفريق. «دور حقيقي مع من يسنده» هو الفرق بين إشراك وإحراج: مهمّة أكبر من قدرة اليوم من دون سند تُثبت لصاحبتها أنها لا تصلح. ومتطوّعة تحضر شهرين بلا مهمّة تغادر في الثالث، ولن تقول لماذا.',
            en: 'Assigning by capacity and availability rather than by relationship is half of leading; the other half is that nobody learns of the change in front of the team. "A real role with somebody supporting her" is the difference between including and exposing: a task beyond today’s ability with no support proves to the person that they cannot do it. And a volunteer who attends for two months with nothing to do leaves in the third, and will not say why.',
          },
          next: 'l3-selection',
        },
        {
          id: 'l3-roles-b',
          weight: 'costly',
          text: {
            ar: 'تُبقي التوزيع كما هو لهذه الجلسة لأنها حسّاسة، وتَعِد بإشراكها في التي بعدها',
            en: 'Keep the assignment as it is for this session because it matters, and promise to involve her in the next one',
          },
          consequence: {
            ar: 'كل جلسة حسّاسة، وهذا بالضبط سبب عدم وصول أحد إلى دور أبداً. تأجيل الإشراك إلى مناسبة أقلّ أهمّية هو الآلية التي تُنتِج فريقاً يعتمد كلّه على شخص واحد — وحين يغيب ذلك الشخص لا يوجد صفّ ثانٍ. والوعد الذي لا يحمل تاريخاً ليس وعداً.',
            en: 'Every session matters, and that is precisely why nobody ever gets a role. Deferring inclusion to some less important occasion is the mechanism that produces a team leaning entirely on one person — and when that person is away there is no second line. A promise with no date on it is not a promise.',
          },
          next: 'l3-venue',
        },
        {
          id: 'l3-roles-c',
          weight: 'harmful',
          text: {
            ar: 'تعلن في الاجتماع أن الأدوار ستتغيّر لأن شخصاً واحداً «استحوذ» على المهام',
            en: 'Announce in the meeting that roles are changing because one person has been "monopolising" the tasks',
          },
          consequence: {
            ar: 'أنت عالجتَ مشكلة توزيع بإهانة متطوّع أدّى ما طُلب منه جيّداً. النتيجة المرجّحة: تخسر الاثنين — هو ينسحب، وهي تحصل على دور وصل إليها عبر واقعة يتذكّرها الفريق كلّه. معالجة التقصير أو الاستحواذ تبدأ بمحادثة مباشرة موثّقة، والعلن آخر الأدوات لا أوّلها.',
            en: 'You have solved an allocation problem by humiliating a volunteer who did what was asked of him, and did it well. The likely result is that you lose both: he withdraws, and she gets a role that reached her through an incident the whole team remembers. Addressing either underperformance or monopolising starts with a direct, documented conversation; the meeting is the last tool, not the first.',
          },
          next: 'l3-venue',
        },
      ],
    },

    // ============================================================== round 2
    {
      id: 'l3-selection',
      round: 2,
      draws: ['community-needs', 'protecting-vulnerable'],
      situation: {
        ar: 'الأماكن خمسة وعشرون والطلبات ستّون. رئيس اللجنة يسلّمك لائحة بخمسة عشر اسماً ويقول إنها «الحالات التي نعرفها». من بين الستّين طلبات لأطفال ذوي إعاقة ولأسر نازحة وصلت القرية هذه السنة.',
        en: 'There are twenty-five places and sixty applications. The committee chair hands you a list of fifteen names and says they are "the cases we know". Among the sixty are applications for disabled children and for displaced families who arrived in the village this year.',
      },
      question: {
        ar: 'كيف تُختار الخمسة والعشرون؟',
        en: 'How are the twenty-five chosen?',
      },
      choices: [
        {
          id: 'l3-select-a',
          weight: 'sound',
          text: {
            ar: 'تضعون معايير مكتوبة ومعلنة قبل النظر في أيّ اسم، وتُعلَن على الستّين، وتُطبَّق على لائحة الرئيس كما على غيرها',
            en: 'Write and publish the criteria before looking at a single name, announce them to all sixty, and apply them to the chair’s list exactly as to everyone else',
          },
          consequence: {
            ar: 'خمسة وثلاثون طفلاً سيُرفضون، وهذا لن يتغيّر. ما يتغيّر هو ما يعرفه أهلهم عن السبب. المعيار المُعلن قبل الأسماء هو الشيء الوحيد الذي يُخرج القرار من دائرة العلاقات، وهو أيضاً ما يحمي رئيس اللجنة نفسه من أن يُطلب منه واسطة كل أسبوع. ولائحته ليست خطأً — هي معلومة تُقرأ بالمعيار مثل غيرها.',
            en: 'Thirty-five children will be turned down, and that will not change. What changes is what their families know about why. Criteria published before the names are looked at are the one thing that takes the decision out of the circle of relationships — and they also protect the chair himself from being asked for a favour every week. His list is not a fault; it is information, read against the criteria like everything else.',
          },
          next: 'l3-disclosure',
        },
        {
          id: 'l3-select-b',
          weight: 'costly',
          text: {
            ar: 'تأخذ لائحة الرئيس كاملة وتختار العشرة الباقين بمعايير تضعها أنت',
            en: 'Take the chair’s fifteen in full and choose the remaining ten against criteria you set yourself',
          },
          consequence: {
            ar: 'أنت أنشأت فئتين: من دخل بالمعرفة ومن دخل بالمعيار. وهذا سيُعرف في القرية قبل نهاية الشهر لأن القرى تعرف. الكلفة لا تقع عليك بل على الأسر النازحة التي لا يعرفها أحد بعد — وهي تحديداً الفئة التي وُضع تقييم الاحتياج ليصل إليها. حسن النيّة مع اللجنة اشتُري بحقّ من ليس له من يذكره.',
            en: 'You have created two categories: those who got in by being known and those who got in by criterion. The village will know this before the end of the month, because villages do. The cost falls not on you but on the displaced families nobody knows yet — precisely the group a needs assessment exists to reach. Goodwill with the committee was bought with the claim of whoever has nobody to mention their name.',
          },
          next: 'l3-scope',
        },
        {
          id: 'l3-select-c',
          weight: 'harmful',
          text: {
            ar: 'تستبعد الأطفال ذوي الإعاقة لأن المكان والمنهج غير مهيّأين، وتوسّع العدد للباقين',
            en: 'Rule out the disabled children because the venue and the method are not set up for them, and widen the numbers for the rest',
          },
          consequence: {
            ar: 'هذا هو الإقصاء في صورته الأكثر شيوعاً: لا يُقال بلغة الرفض بل بلغة عدم الجاهزية، ويبدو عمليّاً. والجاهزية قرار تصميم اتّخذتَه أنت قبل أسبوعين ويمكنك تغييره؛ إعاقة الطفل ليست قراره. المشروع الذي يُقصي من هو أحوج إليه بحجّة أنه غير مجهّز له قد اختار جمهوره الأسهل وسمّاه ظرفاً.',
            en: 'This is exclusion in its commonest form: not said in the language of refusal but in the language of not being ready, and it looks practical. Readiness is a design decision you took a fortnight ago and can change; the child’s disability is not a decision they took. A project that excludes the people who need it most on the grounds that it is not set up for them has chosen its easiest audience and called it a circumstance.',
          },
          next: 'l3-scope',
        },
      ],
    },
    {
      id: 'l3-venue',
      round: 2,
      draws: ['events-management', 'protecting-vulnerable'],
      situation: {
        ar: 'قاعة الجلسات في الطابق الثاني بلا مصعد، وبينها وبين الشارع درج ضيّق. من بين المسجّلين فتاة تستخدم كرسياً متحرّكاً. البديل الوحيد في القرية قاعة أرضية أصغر تتّسع لعشرين لا لثلاثين، وصاحبها يريد إيجاراً مضاعفاً.',
        en: 'The session room is on the second floor with no lift, and a narrow staircase between it and the street. One of the enrolled children uses a wheelchair. The only alternative in the village is a smaller ground-floor hall that seats twenty rather than thirty, and its owner wants double the rent.',
      },
      question: {
        ar: 'ما قرارك؟',
        en: 'What do you decide?',
      },
      choices: [
        {
          id: 'l3-venue-a',
          weight: 'sound',
          text: {
            ar: 'تنتقلون إلى القاعة الأرضية وتقسّمون المجموعة إلى فوجين، وتُعيد حساب الميزانية وتضع الفارق في سجلّ المخاطر بوصفه بنداً قائماً',
            en: 'Move to the ground-floor hall, split the group into two sittings, and rework the budget — putting the difference into the risk log as a live item',
          },
          consequence: {
            ar: 'الفوجان يكلّفان وقت متطوّعين، والإيجار المضاعف يكلّف مالاً، والبديل يكلّف مشاركة طفلة كاملة. الوصول يُبنى في التصميم لا يُضاف بعده — وحين يُكتشف متأخّراً فإن ثمنه يُدفع من الميزانية والوقت، وهذا هو الثمن الصحيح. وتسجيله في سجلّ المخاطر يعني أن الدرس لن يضيع في المشروع القادم.',
            en: 'Two sittings cost volunteer time, double rent costs money, and the alternative costs one child her entire participation. Access is built into a design rather than added to it — and when it is caught late, it is paid for out of budget and time, which is the correct price. Recording it in the risk log is what stops the lesson being lost by the next project.',
          },
          next: 'l3-disclosure',
        },
        {
          id: 'l3-venue-b',
          weight: 'costly',
          text: {
            ar: 'تبقون في القاعة العليا وتنظّمون من يحمل كرسيّها على الدرج في كل جلسة',
            en: 'Stay in the upstairs room and organise volunteers to carry her chair up the stairs each session',
          },
          consequence: {
            ar: 'الحلّ يعمل ويحمل تكلفة لا تظهر في الميزانية: فتاة في الثالثة عشرة تُحمل على درج ضيّق أمام ثلاثين زميلاً مرّتين في الأسبوع لتسعة أسابيع. وهو أيضاً خطر سلامة حقيقي — درج ضيّق وحمل وأشخاص غير مدرَّبين. الترتيب التيسيري الذي يجعل صاحبه استثناءً محرجاً هو نصف حلّ، ونصفه الآخر يدفعه هو.',
            en: 'It works, and it carries a cost that appears in no budget line: a thirteen-year-old carried up a narrow staircase in front of thirty classmates twice a week for nine weeks. It is also a genuine safety risk — a narrow stair, a lift, untrained people. A reasonable adjustment that makes its subject an awkward exception is half a solution, and they pay for the other half.',
          },
          next: 'l3-disclosure',
        },
        {
          id: 'l3-venue-c',
          weight: 'harmful',
          text: {
            ar: 'تبقون في القاعة العليا وتعرضون عليها جلسات فردية في بيتها بدل الحضور',
            en: 'Stay upstairs and offer her one-to-one sessions at home instead of attending',
          },
          consequence: {
            ar: 'هذا يبدو كرماً وهو إخراجها من المشروع مع الاحتفاظ باسمها في اللائحة. نصف قيمة الدعم الدراسي في المجموعة نفسها. وجلسات فردية في بيت طفلة تخالف قاعدة عدم الانفراد وتضع متطوّعاً في وضع لا يُدافَع عنه. حماية الفئات المعرّضة للخطر لا تعني ترتيبات خاصّة لهم بعيداً عن الجميع؛ تعني ألّا يكون البُعد هو الحلّ.',
            en: 'It looks generous and it removes her from the project while keeping her name on the list. Half the value of study support is the group itself. And one-to-one sessions in a child’s home break the never-alone rule and put a volunteer in a position nobody can defend. Protecting people at risk does not mean separate arrangements away from everybody; it means separation is not the answer.',
          },
          next: 'l3-scope',
        },
      ],
    },

    // ============================================================== round 3
    {
      id: 'l3-disclosure',
      round: 3,
      draws: ['protecting-vulnerable', 'team-leadership'],
      situation: {
        ar: 'الأسبوع السادس. أمّ إحدى الفتيات تقول لك على انفراد إن ابنتها ستتوقّف عن الحضور لأن «البيت يحتاجها»، وتضيف بصوت منخفض أنها تعمل منذ الصيف عند صاحب المحلّ وأنها لا تريد أن يعرف زوجها أنها أخبرتك. الفتاة في الثانية عشرة.',
        en: 'Week six. One girl’s mother tells you privately that her daughter will stop coming because "the house needs her", and adds quietly that she has been working at a shop since the summer and that she does not want her husband to know she told you. The girl is twelve.',
      },
      question: {
        ar: 'ماذا تفعل؟',
        en: 'What do you do?',
      },
      choices: [
        {
          id: 'l3-disc-a',
          weight: 'sound',
          text: {
            ar: 'تشرح لها بوضوح أنك لا تستطيع أن تعد بالسرّية في أمر يخصّ سلامة طفلة، وتُبلّغ مسؤول الحماية اليوم بما قيل كما قيل، وتُبقي مكان الفتاة محفوظاً',
            en: 'Tell her clearly that you cannot promise confidentiality about a child’s safety, report to the safeguarding lead today in the words that were used, and keep the girl’s place open',
          },
          consequence: {
            ar: 'الجزء الصعب هو الجملة الأولى، وهي غير قابلة للتفاوض: وعد بالسرّية لا تستطيع الوفاء به يفسد الإجراء ويجعل الأمّ تشعر بأنك خدعتها حين تتحرّك القناة. وأنت تنقل ولا تُقيّم — عمل طفلة في الثانية عشرة ليس تقديراً لك ولا للأمّ. حفظ المكان يبقي الباب مفتوحاً، وهو غالباً ما تبقّى من فرصة تلك الفتاة.',
            en: 'The hard part is the first sentence, and it is not negotiable: a promise of confidentiality you cannot keep compromises the process and makes the mother feel deceived the moment the channel moves. And you pass it on rather than assessing it — a twelve-year-old working is not your judgement to make, nor hers. Keeping the place open keeps a door open, and it is often the most of that girl’s chance that is left.',
          },
          next: null,
        },
        {
          id: 'l3-disc-b',
          weight: 'costly',
          text: {
            ar: 'تعرض على الأمّ تعديل مواعيد الفتاة لتناسب عملها، وتؤجّل الإبلاغ حتى ترى إن كانت ستعود',
            en: 'Offer the mother a change of hours to fit around the girl’s work, and hold off reporting until you see whether she comes back',
          },
          consequence: {
            ar: 'التعديل ذكيّ عملياً وهو يجعل المشروع يتكيّف مع عمل طفلة بدل أن يُبلّغ عنه. والتأجيل «حتى نرى» قرار بعدم التصرّف يرتدي ثوب الحكمة: الأسابيع الثلاثة القادمة هي بالضبط ما يجب أن يعرفه من يستطيع أن يقرّر. أنت أبقيت الفتاة في المشروع وأخرجتها من القناة التي تحميها.',
            en: 'Operationally the change of hours is clever, and it makes the project accommodate a child’s employment rather than report it. And holding off "to see" is a decision not to act dressed as patience: the next three weeks are precisely what somebody who can decide needs to know about now. You kept the girl in the project and took her out of the channel that protects her.',
          },
          next: null,
        },
        {
          id: 'l3-disc-c',
          weight: 'harmful',
          text: {
            ar: 'تعدها بألّا تخبر أحداً وتذهب أنت لتتحدّث إلى صاحب المحلّ',
            en: 'Promise her you will tell nobody, and go and speak to the shop owner yourself',
          },
          consequence: {
            ar: 'وعد لا تملكه، ثم تحقيق ليس دورك، ثم كشف للأمّ أمام زوجها من حيث لا تقصد — لأن صاحب المحلّ سيسأل من أخبرك. ثلاث قواعد في قرار واحد، والضرر يقع على المرأة التي وثقت بك وعلى الفتاة معاً. الإحالة ليست تهرّباً من المسؤولية؛ هي الشكل الوحيد الذي لا يزيد الخطر على من أفصح.',
            en: 'A promise that is not yours to give, then an investigation that is not your role, then exposing the mother to her husband without meaning to — because the shop owner will ask who told you. Three rules in one decision, and the harm lands on the woman who trusted you and on the girl together. Referral is not an evasion of responsibility; it is the only form of it that does not add risk to the person who spoke.',
          },
          next: null,
        },
      ],
    },
    {
      id: 'l3-scope',
      round: 3,
      draws: ['project-management', 'team-leadership'],
      situation: {
        ar: 'الأسبوع السادس. الجهة المموّلة سعيدة وتطلب إضافة عشرين طفلاً من قرية مجاورة، بالميزانية نفسها وبالتاريخ نفسه للإغلاق. فريقك ستّة، وأربعة منهم يعملون أصلاً أكثر ممّا اتّفقتم عليه.',
        en: 'Week six. The funder is pleased and asks you to add twenty children from a neighbouring village, on the same budget and to the same closing date. Your team is six, and four of them are already giving more than what was agreed.',
      },
      question: {
        ar: 'بماذا تردّ؟',
        en: 'What is your answer?',
      },
      choices: [
        {
          id: 'l3-scope-a',
          weight: 'sound',
          text: {
            ar: 'تردّ بما يلزم رقماً: عشرون طفلاً تعني كذا ساعة ومتطوّعين اثنين ومواصلات، وتعرض ثلاثة خيارات — تمويل إضافي، أو تأجيل الإضافة إلى دورة ثانية، أو عدد أصغر ضمن ما هو قائم',
            en: 'Answer with what it would take, in figures: twenty children means so many hours, two more volunteers and transport — then offer three options: more funding, adding them in a second cohort, or a smaller number within what exists',
          },
          consequence: {
            ar: '«لا» وحدها تُقرأ رفضاً للتوسّع، والرقم يُقرأ إدارةً. أنت لم ترفض عشرين طفلاً — أنت أظهرتَ ما يكلّفونه، وهذا يحوّل النقاش من حماس إلى قرار. وثلاثة خيارات تترك للممول باباً يدخل منه من دون أن يخسر ماء وجهه، وتترك فريقك خارج التوسّع غير المتحكَّم فيه الذي يُنهي متطوّعين أكثر ممّا يُنهي مشاريع.',
            en: 'A bare "no" reads as refusing to grow; a figure reads as management. You did not refuse twenty children — you showed what they cost, which turns the conversation from enthusiasm into a decision. And three options leave the funder a way in without losing face, and leave your team outside the uncontrolled expansion that ends more volunteers than it ends projects.',
          },
          next: null,
        },
        {
          id: 'l3-scope-b',
          weight: 'costly',
          text: {
            ar: 'توافق وتطلب من الفريق جهداً إضافياً لتسعة أسابيع، وتعِدهم بتقدير في الختام',
            en: 'Agree, ask the team for extra effort for nine weeks, and promise recognition at the close',
          },
          consequence: {
            ar: 'المشروع سيُغلق في موعده على الأرجح، والفريق لن يكمل. أربعة من ستّة يعملون فوق المتّفق عليه هو رقم يقرأه القائد كإنذار لا كطاقة احتياطية، والتقدير في الختام لا يعيد متطوّعاً غادر في الأسبوع السابع. توسيع النطاق بموارد الفريق هو اقتراض من أشخاص لا يعرفون أنهم أقرضوا.',
            en: 'The project will probably close on time and the team will not finish it. Four out of six already over the agreed commitment is a figure a leader reads as a warning rather than as spare capacity, and recognition at the close does not bring back a volunteer who left in week seven. Widening scope out of the team’s own reserves is borrowing from people who do not know they lent.',
          },
          next: null,
        },
        {
          id: 'l3-scope-c',
          weight: 'harmful',
          text: {
            ar: 'توافق وتخفّض عدد الجلسات لكل طفل حتى يتّسع العدد ضمن الموارد نفسها',
            en: 'Agree, and cut the number of sessions per child so the bigger number fits the same resources',
          },
          consequence: {
            ar: 'خمسة وأربعون طفلاً يتلقّون نصف ما وُعد به خمسة وعشرون. الأسر لن تُبلَّغ بأن التصميم تغيّر، والتقرير سيقول خمسة وأربعين مستفيداً — وهو رقم صحيح شكلاً وكاذب معنى. تغيير النطاق من دون إبلاغ من يعنيه هو ما تسمّيه إدارة المشاريع تغييراً غير مضبوط، وما تسمّيه الأسرة وعداً لم يُوفَ.',
            en: 'Forty-five children receive half of what twenty-five were promised. The families will not be told the design changed, and the report will say forty-five beneficiaries — a figure that is formally true and substantively false. Changing scope without telling the people it lands on is what project management calls uncontrolled change, and what a family calls a promise not kept.',
          },
          next: null,
        },
      ],
    },
  ],
};
