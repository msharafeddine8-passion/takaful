import type { LevelChallenge } from './types';

/**
 * Level 4 — an afternoon in a room with a municipality and a residents' group.
 *
 * Every course in this level shows up when people disagree, so the run is one
 * session from the hour before it to the ten minutes at the end of it. What
 * makes it a level challenge rather than five separate questions is that the
 * skills interfere with each other: the facilitation move that keeps the room
 * moving is the one that leaves somebody unheard, and the negotiating move that
 * gets the concession is the one that reopens a two-year-old quarrel.
 *
 * The volunteer here is facilitating, not deciding. That is what makes the
 * temptation to fix it themselves the most interesting wrong answer in the file.
 */
export const levelFourRun: LevelChallenge = {
  level: 4,
  title: {
    ar: 'جلسة حول ساحة مشتركة',
    en: 'A session about a shared square',
  },
  lede: {
    ar: 'البلدية، ولجنة أهالي، وأنت تُيسّر. ساعة قبل الجلسة وعشر دقائق في آخرها، وبينهما غرفة لا يتّفق من فيها.',
    en: 'The municipality, a residents’ committee, and you facilitating. An hour before, ten minutes at the end, and in between a room that does not agree.',
  },

  openings: ['l4-heat', 'l4-agenda'],

  steps: [
    // ============================================================== round 1
    {
      id: 'l4-heat',
      round: 1,
      draws: ['emotional-intelligence', 'meetings-and-facilitation'],
      situation: {
        ar: 'قبل ربع ساعة من الجلسة، تخبرك زميلتك أن أحد أعضاء لجنة الأهالي قال أمام آخرين إن مشروعكم «يجلب غرباء إلى الحيّ». أنت من عائلة نزحت إلى هذا الحيّ قبل ثماني سنوات، والرجل سيجلس أمامك بعد قليل، وأنت من يُيسّر.',
        en: 'Fifteen minutes before the session, a colleague tells you that a member of the residents’ committee said in front of others that your project "brings outsiders into the neighbourhood". Your family moved to this neighbourhood eight years ago, the man will be sitting opposite you shortly, and you are the one facilitating.',
      },
      question: {
        ar: 'ماذا تفعل بالربع ساعة؟',
        en: 'What do you do with the fifteen minutes?',
      },
      choices: [
        {
          id: 'l4-heat-a',
          weight: 'sound',
          text: {
            ar: 'تسمّي لنفسك ما تشعر به، وتطلب من زميلتك أن تتولّى التيسير في النقطة التي يتحدّث فيها الرجل، وتتّفقان على إشارة بينكما',
            en: 'Name to yourself what you are feeling, ask your colleague to take the facilitation on the item where the man speaks, and agree a signal between you',
          },
          consequence: {
            ar: 'الذكاء العاطفي ليس ألّا تغضب — هو أن تعرف أنك غاضب قبل أن يقرّر الغضب نيابةً عنك. والمُيسّر الذي له مصلحة شخصية في نقطة بعينها لا يستطيع أن يُيسّرها بعدل مهما حاول، وهذا ليس عيباً فيه بل وصف لموقعه. تسليم النقطة الواحدة لا الجلسة كلّها هو أدقّ ما يمكن فعله في ربع ساعة.',
            en: 'Emotional intelligence is not the absence of anger — it is knowing you are angry before the anger starts deciding on your behalf. And a facilitator with a personal stake in one item cannot facilitate that item fairly however hard they try; that is not a fault in them, it is a description of where they are standing. Handing over the single item rather than the whole session is the most precise thing available in fifteen minutes.',
          },
          next: 'l4-position',
        },
        {
          id: 'l4-heat-b',
          weight: 'costly',
          text: {
            ar: 'تقرّر ألّا تسمح لهذا بأن يؤثّر عليك وتدخل الجلسة كما لو لم تسمع شيئاً',
            en: 'Decide not to let it affect you and walk in as though you had heard nothing',
          },
          consequence: {
            ar: 'ما يُدفن لا يختفي، يخرج في التفاصيل: مقاطعة أقصر لحديثه، وقت أقلّ له، نبرة تسمعها الغرفة ولا تسمعها أنت. وحين يشعر بذلك سيقرأه تأكيداً لما قاله، فيتحوّل تعليق قيل خارج الغرفة إلى موقف داخلها. الاعتراف بالانفعال لنفسك ليس ترفاً نفسياً؛ هو ما يمنعه من إدارة الجلسة.',
            en: 'Buried is not gone; it comes out in the details — a slightly shorter interruption of him, a little less time, a tone the room hears and you do not. And when he feels it, he will read it as confirmation of what he said, and a remark made outside the room becomes a position inside it. Admitting the feeling to yourself is not a psychological luxury; it is what stops it running the session.',
          },
          next: 'l4-silenced',
        },
        {
          id: 'l4-heat-c',
          weight: 'harmful',
          text: {
            ar: 'تفتح الجلسة بتوضيح أن الحيّ يضمّ نازحين منذ سنوات وأن هذا الكلام غير مقبول',
            en: 'Open the session by making clear that the neighbourhood has had displaced families in it for years and that such talk is unacceptable',
          },
          consequence: {
            ar: 'الموقف صحيح والمكان والصفة خاطئان. أنت المُيسّر، ومن يفتتح الجلسة بموقف لم يعد مُيسّراً بل طرفاً — والغرفة كلّها ستعيد ترتيب نفسها حول ذلك خلال دقيقتين. وما قيل قيل خارج الجلسة وأمام أشخاص ليسوا هنا، فمحاكمته هنا تضع رجلاً في موضع دفاع عن جملة لم تُطرح على جدول الأعمال. القضية تستحقّ أفضل من هذا التوقيت.',
            en: 'The stance is right and the setting and the role are wrong. You are the facilitator, and a facilitator who opens with a position has stopped being one and become a party — and the room will rearrange itself around that within two minutes. What was said was said outside the session and in front of people who are not here, so trying it here puts a man on the defensive about a sentence that is not on the agenda. The point deserves better timing than this.',
          },
          next: 'l4-silenced',
        },
      ],
    },
    {
      id: 'l4-agenda',
      round: 1,
      draws: ['meetings-and-facilitation', 'negotiation-and-advocacy'],
      situation: {
        ar: 'قبل ساعة ترسل البلدية جدول أعمال من عندها. فيه بندان تقنيّان طويلان، وقد اختفى منه البند الذي طلبه الأهالي: ساعات استخدام الساحة. الجلسة ساعة ونصف، ولجنة الأهالي لم ترَ الجدول الجديد.',
        en: 'An hour before, the municipality sends its own agenda. It has two long technical items on it, and the item the residents asked for — the square’s opening hours — has disappeared. The session is ninety minutes, and the residents’ committee has not seen the new agenda.',
      },
      question: {
        ar: 'ماذا تفعل قبل أن يجلس أحد؟',
        en: 'What do you do before anyone sits down?',
      },
      choices: [
        {
          id: 'l4-agenda-a',
          weight: 'sound',
          text: {
            ar: 'تتّصل بمسؤول البلدية قبل الجلسة، وتقول إن البند طُلب وسيُطرح، وتقترح وقتاً محدّداً له في الجدول، وترسل الجدول للطرفين قبل الدخول',
            en: 'Phone the municipality’s officer before the session, say the item was requested and will be taken, propose a specific slot for it, and send the agenda to both sides before anyone walks in',
          },
          consequence: {
            ar: 'الجدول ليس ورقة تنظيمية — هو الذي يقرّر ما يمكن أن يُقال. وتسوية ذلك قبل الجلسة يمنع أن تبدأ بنزاع على الترتيب أمام الطرفين، وهو النزاع الذي يستهلك عشرين دقيقة ويترك الغرفة متوتّرة قبل أوّل بند. واقتراح وقت محدّد بدل «سنرى إن اتّسع الوقت» هو الفرق بين بند مطروح وبند مؤجَّل إلى الأبد.',
            en: 'An agenda is not an administrative sheet — it decides what can be said. Settling it before the session stops the meeting opening on a procedural fight in front of both parties, which is the fight that eats twenty minutes and leaves the room tense before the first item. And proposing a fixed slot rather than "if there is time" is the difference between an item taken and an item deferred forever.',
          },
          next: 'l4-silenced',
        },
        {
          id: 'l4-agenda-b',
          weight: 'costly',
          text: {
            ar: 'تقبل الجدول وتخطّط لطرح البند تحت «ما يستجدّ» في آخر الجلسة',
            en: 'Accept the agenda and plan to raise the item under any other business at the end',
          },
          consequence: {
            ar: '«ما يستجدّ» في جلسة مدّتها ساعة ونصف هو المكان الذي تموت فيه البنود: يصل إليه الحاضرون بعد ساعة وربع، وقد بدأ بعضهم يجمع أوراقه. أنت لم تُسقِط البند رسمياً، وأسقطتَه عملياً — وستُقرأ النتيجة على أنها ما حدث لا على أنها ما اخترتَه. الجدول يُتفاوَض عليه قبل الجلسة لأن التفاوض عليه أثناءها مستحيل.',
            en: 'Any other business in a ninety-minute session is where items go to die: people reach it an hour and a quarter in, and some have started gathering their papers. You did not formally drop the item, and you dropped it in practice — and the outcome will be read as what happened rather than as what you chose. Agendas are negotiated before a session because negotiating one inside it is impossible.',
          },
          next: 'l4-position',
        },
        {
          id: 'l4-agenda-c',
          weight: 'harmful',
          text: {
            ar: 'تفتح الجلسة بإعلان أن البلدية حذفت بند الأهالي، وتترك الغرفة تقرّر',
            en: 'Open the session by announcing that the municipality deleted the residents’ item, and let the room decide',
          },
          consequence: {
            ar: 'هذا يبدو شفافية وهو تسليم للغرفة سلاحاً قبل أن تبدأ. الجملة الأولى في الجلسة أصبحت اتّهاماً، ومسؤول البلدية سيقضي الساعة القادمة يدافع بدل أن يقرّر، ولجنة الأهالي دخلت غاضبة على أساس معلومة لم تكن تملكها قبل دقيقة. المناصرة تعني أن تُوصل البند إلى من يملك القرار، لا أن تُشعل الغرفة التي تحتاج قراره.',
            en: 'It looks like transparency and it hands the room a weapon before it starts. The first sentence of the session is now an accusation, the municipal officer will spend the next hour defending rather than deciding, and the residents’ committee walks in angry on the strength of something they did not know a minute ago. Advocacy means getting the item to whoever holds the decision, not setting fire to the room whose decision you need.',
          },
          next: 'l4-position',
        },
      ],
    },

    // ============================================================== round 2
    {
      id: 'l4-silenced',
      round: 2,
      draws: ['inclusion-and-accessibility', 'meetings-and-facilitation'],
      situation: {
        ar: 'مضت أربعون دقيقة. رجل واحد من لجنة الأهالي تكلّم في كل بند وقاطع مرّتين. سيّدتان في اللجنة لم تتكلّما، وحين بدأت إحداهما قاطعها. ومشارك أصمّ يتابع عبر مترجمة، والنقاش يسير أسرع ممّا تستطيع أن تنقله.',
        en: 'Forty minutes in. One man from the residents’ committee has spoken on every item and interrupted twice. Two women on the committee have not spoken, and when one of them began he cut across her. A deaf participant is following through an interpreter, and the discussion is moving faster than she can carry it.',
      },
      question: {
        ar: 'ما تدخّلك؟',
        en: 'What is your intervention?',
      },
      choices: [
        {
          id: 'l4-silence-a',
          weight: 'sound',
          text: {
            ar: 'توقف النقاش، وتضع قاعدة للغرفة كلّها: دور واحد لكلّ متحدّث قبل أن يتكلّم أحد مرّتين، ووقفة بين المتحدّثين لتلحق المترجمة — ثم تعطي الدور للسيّدة التي قوطعت',
            en: 'Stop the discussion and set a rule for the whole room: one turn each before anybody speaks twice, and a pause between speakers so the interpreter can keep up — then give the floor back to the woman who was cut off',
          },
          consequence: {
            ar: 'القاعدة موجَّهة إلى الغرفة لا إلى الرجل، وهذا ما يجعلها قابلة للتطبيق بلا مواجهة. والوقفة بين المتحدّثين ليست لطفاً بالمترجمة — من دونها لا يشارك المشارك الأصمّ في القرار بل يُبلَّغ به لاحقاً، وهذا فرق بين الدمج والحضور. وإعادة الدور إلى من قوطعت تصحّح ما حدث بدل أن تعتذر عنه.',
            en: 'The rule is addressed to the room rather than to the man, which is what makes it enforceable without a confrontation. And the pause between speakers is not a courtesy to the interpreter — without it the deaf participant is not part of the decision, he is told about it afterwards, and that is the difference between inclusion and attendance. Giving the floor back to the woman who was cut off repairs what happened rather than apologising for it.',
          },
          next: 'l4-grudge',
        },
        {
          id: 'l4-silence-b',
          weight: 'costly',
          text: {
            ar: 'تسأل السيّدتين مباشرةً بالاسم عن رأيهما',
            en: 'Ask the two women directly, by name, for their view',
          },
          consequence: {
            ar: 'أفضل من تركهما، وله كلفة: السؤال المباشر أمام غرفة لم تتغيّر قواعدها يضع شخصاً في الضوء من دون أن يحميه ممّا يليه — يمكن أن يقاطعها الرجل مرّة ثالثة، وقد صار الأمر الآن علنياً. وهو يعالج هذه اللحظة ولا يعالج المشارك الأصمّ الذي ما زال متأخّراً عن النقاش. التيسير يغيّر القاعدة، لا يوزّع استثناءات.',
            en: 'Better than leaving them, and it has a cost: a direct question in front of a room whose rules have not changed puts somebody in the light without protecting what comes next — he can cut across her a third time, and now it is public. And it treats this moment while doing nothing for the deaf participant, who is still behind the discussion. Facilitation changes the rule; it does not hand out exceptions.',
          },
          next: 'l4-close',
        },
        {
          id: 'l4-silence-c',
          weight: 'harmful',
          text: {
            ar: 'تترك النقاش يمضي — الوقت ضيّق والرجل يقول أشياء وجيهة والجميع يستطيع أن يتكلّم إن أراد',
            en: 'Let it run — time is short, the man is making good points, and anybody can speak if they want to',
          },
          consequence: {
            ar: '«يستطيع أن يتكلّم إن أراد» هو الافتراض الذي تُبنى عليه كل غرفة يغيب عنها نصف من فيها. القدرة على الكلام ليست موزّعة بالتساوي: من قوطع مرّة يحسب حساب الثانية، ومن يتابع عبر مترجمة يصل متأخّراً بجملة كاملة فيفوته الدور دائماً. والنتيجة أن قراراً عن ساحة يستخدمها الحيّ كلّه سيُتّخذ بصوت رجل واحد، ثم يُقال إنه قرار الأهالي.',
            en: '"Anybody can speak if they want to" is the assumption every room where half the people are missing is built on. The ability to speak is not evenly distributed: somebody cut off once weighs up the second time, and somebody following through an interpreter arrives a full sentence late and so always misses the turn. The result is that a decision about a square the whole neighbourhood uses gets made in one man’s voice, and is then called the residents’ decision.',
          },
          next: 'l4-close',
        },
      ],
    },
    {
      id: 'l4-position',
      round: 2,
      draws: ['negotiation-and-advocacy', 'conflict-resolution'],
      situation: {
        ar: 'مسؤول البلدية يقول إن الساحة تُقفل السادسة مساءً وإن هذا نهائي وغير قابل للنقاش. في الاستراحة تسمعه يقول لزميله إن شكاوى الضجيج من البناية المقابلة وصلت إلى المحافظ مرّتين هذا الشهر.',
        en: 'The municipal officer says the square closes at six and that this is final and not up for discussion. During the break you hear him tell a colleague that noise complaints from the building opposite have reached the governor twice this month.',
      },
      question: {
        ar: 'كيف تفتح النقاش بعد الاستراحة؟',
        en: 'How do you open after the break?',
      },
      choices: [
        {
          id: 'l4-position-a',
          weight: 'sound',
          text: {
            ar: 'تطرح المسألة بوصفها ضجيجاً لا ساعات: تسأل الغرفة كيف يمكن أن تعمل الساحة حتى الثامنة من دون أن تصل شكوى واحدة إلى البلدية',
            en: 'Reframe it as noise rather than as hours: ask the room how the square could run until eight without a single complaint reaching the municipality',
          },
          consequence: {
            ar: 'السادسة موقف، والمصلحة خلفه ألّا تصل شكوى ثالثة إلى المحافظ. من يفاوض على الموقف يربح أو يخسر ساعتين؛ ومن يفاوض على المصلحة يفتح خيارات لم تكن على الطاولة — منطقة الألعاب بعيداً عن البناية، جدول يعرفه السكّان، رقم يتّصلون به قبل أن يشتكوا. والسؤال موجَّه إلى الغرفة لا إليه، فلا يُطلب منه أن يتراجع أمام الجميع.',
            en: 'Six is a position; the interest behind it is that a third complaint must not reach the governor. Negotiate the position and you win or lose two hours; negotiate the interest and options appear that were never on the table — the play area moved away from that building, a schedule the residents know, a number to ring before they complain. And the question is put to the room rather than to him, so he is not being asked to climb down in public.',
          },
          next: 'l4-close',
        },
        {
          id: 'l4-position-b',
          weight: 'costly',
          text: {
            ar: 'تقترح حلّاً وسطاً عند السابعة',
            en: 'Propose splitting the difference at seven',
          },
          consequence: {
            ar: 'الحلّ الوسط يُنهي النقاش بسرعة ولا يحلّ شيئاً: شكاوى الضجيج ستستمرّ عند السابعة، وسيعود الملفّ بعد شهر مغلقاً عند السادسة — وهذه المرّة بحجّة أن الجمعية جرّبت وفشلت. والمساومة على رقم قبل معرفة المصلحة هي كيف تُترَك خيارات على الطاولة لا يعرف أحد أنها كانت هناك.',
            en: 'Splitting the difference ends the argument quickly and settles nothing: the noise complaints will continue at seven, and in a month the file comes back closed at six — this time with the argument that the association tried and failed. Bargaining over a number before you know the interest is how options get left on the table that nobody knows were there.',
          },
          next: 'l4-grudge',
        },
        {
          id: 'l4-position-c',
          weight: 'harmful',
          text: {
            ar: 'تقول أمام الغرفة إنك سمعت أن السبب شكاوى الضجيج، وتسأله لماذا لم يقل ذلك',
            en: 'Say in front of the room that you heard the reason is noise complaints, and ask him why he did not say so',
          },
          consequence: {
            ar: 'أنت استخدمتَ حديثاً خاصّاً سمعتَه في استراحة، وأمام الطرف الآخر. المعلومة صحيحة والطريقة تُنهي إمكانية التفاوض: من هنا فصاعداً لن يقول هذا الرجل شيئاً في أيّ استراحة، وسيدافع عن السادسة لا لأنها الأفضل بل لأن التراجع بعد هذا يعني أنه أُجبر. وخفض التصعيد يبدأ بعدم إحراج من تحتاج قراره.',
            en: 'You used a private remark overheard in a break, and used it in front of the other party. The information is correct and the method ends the possibility of negotiating: from here on that man will say nothing in any break, and he will defend six not because it is best but because backing down now would mean he was forced. De-escalation begins with not embarrassing the person whose decision you need.',
          },
          next: 'l4-grudge',
        },
      ],
    },

    // ============================================================== round 3
    {
      id: 'l4-grudge',
      round: 3,
      draws: ['conflict-resolution', 'emotional-intelligence'],
      situation: {
        ar: 'عضوان في لجنة الأهالي يرفعان صوتيهما فجأة حول خلاف يعود إلى مشروع قبل سنتين لا علاقة له بالساحة. الغرفة صمتت، ومسؤول البلدية ينظر إلى ساعته، وبقي عشرون دقيقة.',
        en: 'Two members of the residents’ committee suddenly raise their voices over a quarrel from a project two years ago that has nothing to do with the square. The room has gone silent, the municipal officer is looking at his watch, and there are twenty minutes left.',
      },
      question: {
        ar: 'ماذا تفعل؟',
        en: 'What do you do?',
      },
      choices: [
        {
          id: 'l4-grudge-a',
          weight: 'sound',
          text: {
            ar: 'تسمّي ما يحدث بهدوء، وتقول إن هذا خلاف حقيقي ويستحقّ جلسة خاصّة به وتعرض أن تُرتَّب، وتُعيد الغرفة إلى البند بسؤال محدّد',
            en: 'Name what is happening, calmly; say this is a real disagreement that deserves a session of its own and offer to arrange one; then bring the room back with a specific question',
          },
          consequence: {
            ar: 'ثلاث خطوات في ترتيبها: الاعتراف بأن الخلاف حقيقي — لأن تجاهله يجعله يعود بعد خمس دقائق أقوى — ثم إخراجه من هذه الغرفة لأنه ليس بندها ولأن حلّه أمام البلدية يكلّف الطرفين ماء وجههما، ثم سؤال محدّد لأن الغرفة لا تعود إلى النقاش بدعوة عامّة. وهذا هو الفرق بين نزاع على مهمّة ونزاع شخصي: الثاني لا يُعالَج على طاولة مشتركة.',
            en: 'Three steps, in that order: acknowledge the disagreement is real — ignoring it brings it back in five minutes, larger — then take it out of this room, because it is not this room’s item and because settling it in front of the municipality costs both men their standing, then a specific question, because a room does not come back to a discussion on a general invitation. That is the difference between a task dispute and a personal one: the second is not worked out at a shared table.',
          },
          next: null,
        },
        {
          id: 'l4-grudge-b',
          weight: 'costly',
          text: {
            ar: 'تعود بالغرفة إلى البند فوراً من دون التعليق على ما جرى',
            en: 'Bring the room straight back to the item without commenting on what just happened',
          },
          consequence: {
            ar: 'تكسب خمس دقائق وتترك رجلين غاضبين في غرفة عليها أن تخرج بقرار مشترك. ما لم يُعترف به لا يُحلّ، وسيظهر في التصويت أو في اعتراض لا علاقة له بموضوعه. جملة واحدة — «هذا خلاف حقيقي وسنعود إليه» — تكلّف عشر ثوانٍ وتفعل ما لا يفعله التجاهل.',
            en: 'You buy five minutes and leave two angry men in a room that has to produce a shared decision. What is not acknowledged is not resolved, and it comes back in the vote or in an objection that has nothing to do with its subject. One sentence — "that is a real disagreement and we will come back to it" — costs ten seconds and does what ignoring it cannot.',
          },
          next: null,
        },
        {
          id: 'l4-grudge-c',
          weight: 'harmful',
          text: {
            ar: 'تطلب من كلٍّ منهما أن يقول روايته أمام الغرفة حتى يُحلّ الأمر الآن',
            en: 'Ask each of them to give his account in front of the room so it can be settled now',
          },
          consequence: {
            ar: 'وساطة في المكان الخطأ أمام الجمهور الخطأ. الروايتان ستُقالان أمام مسؤول بلدية وأمام جيران، وكلاهما سيتحدّث لجمهوره لا للآخر — وهذا ما يجعل الخلاف أصعب حلّاً غداً ممّا كان قبل عشر دقائق. والوساطة تحتاج طرفين قبِلاها وغرفة مغلقة ووقتاً، وليس لديك أيّ من الثلاثة.',
            en: 'Mediation in the wrong place in front of the wrong audience. Both accounts will be given in front of a municipal officer and in front of neighbours, and each man will be speaking to his audience rather than to the other — which makes the quarrel harder to settle tomorrow than it was ten minutes ago. Mediation needs two parties who agreed to it, a closed room and time, and you have none of the three.',
          },
          next: null,
        },
      ],
    },
    {
      id: 'l4-close',
      round: 3,
      draws: ['meetings-and-facilitation', 'inclusion-and-accessibility'],
      situation: {
        ar: 'عشر دقائق أخيرة. لا يوجد اتّفاق كامل، لكن هناك تقارب على جدول تجريبي لشهر. مسؤول البلدية مستعدّ للموافقة إن خرجت الجلسة بشيء مكتوب. السيّدتان تحدّثتا أخيراً واقترحتا تعديلاً لم يعلّق عليه أحد.',
        en: 'The last ten minutes. There is no full agreement, but there is a convergence on a trial schedule for a month. The municipal officer is ready to sign off if the session produces something written. The two women finally spoke and proposed an amendment that nobody responded to.',
      },
      question: {
        ar: 'كيف تُغلق الجلسة؟',
        en: 'How do you close?',
      },
      choices: [
        {
          id: 'l4-close-a',
          weight: 'sound',
          text: {
            ar: 'تُعيد اقتراحهما إلى الطاولة صراحةً، ثم تقرأ القرار والمهام ومن يتولّاها والتاريخ بصوت مسموع، وتسأل إن كان أحد يعترض قبل أن تكتب',
            en: 'Put their amendment explicitly back on the table, then read out the decision, the actions, who owns each and by when — and ask whether anybody objects before you write it down',
          },
          consequence: {
            ar: 'اقتراح لم يُعلَّق عليه ليس اقتراحاً رُفض، هو اقتراح لم يُسمَع — وإعادته إلى الطاولة هي الفرق بين إشراك في القرار وإشراك في الحضور. وقراءة القرار بصوت مسموع قبل الكتابة هي ما يمنع أن يخرج كلّ طرف بفهم مختلف لما اتُّفق عليه، وهو أكثر ما يُفسد جلسات كهذه بعد أسبوعين.',
            en: 'An amendment nobody responded to is not an amendment that was rejected, it is one that was not heard — and putting it back on the table is the difference between being included in a decision and being included in a room. And reading the decision aloud before writing it is what stops each party leaving with a different understanding of what was agreed, which is what ruins sessions like this a fortnight later.',
          },
          next: null,
        },
        {
          id: 'l4-close-b',
          weight: 'costly',
          text: {
            ar: 'تكتب الجدول التجريبي كما تقارب عليه أغلب الحاضرين وترسله للجميع مساءً',
            en: 'Write up the trial schedule as most of the room converged on it and send it round in the evening',
          },
          consequence: {
            ar: 'ستحصل على جدول، ولن تحصل على التزام. القرار الذي لا يُقرأ في الغرفة يُعترض عليه على واتساب بعد ساعتين من أشخاص «لم يفهموا أن هذا ما اتُّفق عليه» — ومنهم السيّدتان اللتان يبقى اقتراحهما بلا جواب. الإرسال مساءً يوثّق الاجتماع ولا يُغلقه.',
            en: 'You will get a schedule and you will not get commitment. A decision not read out in the room gets objected to on WhatsApp two hours later by people who "did not understand that this was what was agreed" — among them the two women whose amendment stays unanswered. Sending it in the evening documents the meeting; it does not close it.',
          },
          next: null,
        },
        {
          id: 'l4-close-c',
          weight: 'harmful',
          text: {
            ar: 'تطلب تصويتاً سريعاً برفع الأيدي لتخرج الجلسة بقرار',
            en: 'Call a quick show of hands so the session ends with a decision',
          },
          consequence: {
            ar: 'التصويت في غرفة فيها بلدية ولجنة أهالي ومترجمة تلحق بجملة متأخّرة ليس قراراً مشتركاً — هو إعلان لمن هو أكثر عدداً وأسرع يداً. والأقليّة التي خسرت رفع الأيدي لن تنفّذ جدولاً صوّتت ضدّه، والمشارك الأصمّ سيرفع يده على سؤال لم يصله كاملاً. القرار المشترك يُبنى بالصياغة لا بالعدّ، خصوصاً حين لا يجلس الطرفان على قدم المساواة.',
            en: 'A vote in a room holding a municipality, a residents’ committee and an interpreter running a sentence behind is not a shared decision — it is an announcement of who is more numerous and quicker with a hand. The minority that lost the show of hands will not deliver a schedule it voted against, and the deaf participant will be raising his hand on a question that did not reach him whole. A shared decision is built by drafting rather than by counting, and most of all when the parties are not sitting as equals.',
          },
          next: null,
        },
      ],
    },
  ],
};
