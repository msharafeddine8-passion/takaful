import type { CourseContent } from './types';

/**
 * Level 3 core — Planning and Running Safe Events. Pass mark 70.
 *
 * The through-line is that a safe, inclusive event is not built on the day —
 * it is built in the weeks before it, in a room without participants, on a
 * sheet of paper. Everything that feels improvised on the day (the volunteer
 * who does not know their role, the participant who cannot get through the
 * door, the child photographed without consent) is actually a planning
 * failure that wore a costume.
 *
 * Disability access sits in Module 2 rather than at the end because it is a
 * design criterion, not a finishing touch. Child safeguarding sits in Module 4
 * because it governs decisions made in registration, in venue choice and in
 * on-day behaviour — not just in a policy document somewhere.
 *
 * The run of show and fallback plan come last because they are the product of
 * all the earlier thinking: you cannot write a good run of show for an event
 * whose audience, venue, roles and risks you have not already worked through.
 */

export const eventsManagement: CourseContent = {
  slug: 'events-management',
  level: 3,
  minutes: 25,
  passMark: 70,
  title: {
    ar: 'تخطيط وتنظيم الفعاليات الآمنة',
    en: 'Planning and Running Safe Events',
  },
  lede: {
    ar: 'من الفكرة إلى Run of Show: الجمهور، المكان، الأدوار، التسجيل، الوصول لذوي الإعاقة، السلامة، وخطة بديلة حين يتغيّر شيء.',
    en: 'From an idea to a run of show: audience, venue, roles, registration, disability access, safety, and a fallback for when something changes.',
  },
  outcomes: {
    ar: [
      'تحوّل فكرة فعالية إلى خطة فيها أدوار ومواعيد ولوجستيات',
      'تضمن وصول الأشخاص ذوي الإعاقة في تصميم الفعالية لا كإضافة لاحقة',
      'تدمج السلامة وحماية الطفل في الخطة قبل يوم الفعالية',
      'تكتب Run of Show وخطة بديلة وتقيّم الفعالية بعدها',
    ],
    en: [
      'Turn an event idea into a plan with roles, timings and logistics',
      'Build disability access into the event design rather than adding it later',
      'Fold safety and child safeguarding into the plan before the day',
      'Write a run of show and a fallback plan, and evaluate the event afterwards',
    ],
  },
  sources: [
    'IFRC — Volunteer Management Handbook (2022 edition)',
    'UN Volunteers — Technical Note on Inclusive Events and Safeguarding',
    'Sphere Handbook — Humanitarian Standards in Humanitarian Response (2018)',
  ],

  /*
   * The through-line of the course is that a safe event is built in a room
   * without participants, on paper, weeks earlier. So the assessment that
   * matches it is the paper — not four options about the paper.
   *
   * Additive: no fingerprint moves and no certificate is affected. See
   * lib/programme/practical.ts.
   */
  practical: {
    id: 'em-run-of-show',
    title: {
      ar: 'خطّة فعاليّة مع Run of Show وخطّة بديلة',
      en: 'An event plan with a run of show and a fallback',
    },
    brief: {
      ar: 'خطّط فعاليّة مدّتها نصف يوم.\n\nاكتب من هم المشاركون وكم عددهم، والمكان ولماذا اخترته، وأدوار الفريق ومن يقوم بكلّ دور. ثمّ اكتب Run of Show بالساعة: ماذا يحدث، ومن يقوده.\n\nاذكر صراحةً كيف يصل شخص ذو إعاقة حركيّة إلى كلّ جزء من الفعاليّة — من وصوله إلى المكان حتّى دورة المياه — وكيف يُحمى الأطفال في التسجيل وفي التصوير.\n\nأنهِ بخطّة بديلة لأمرين قد يتغيّران في اليوم نفسه.',
      en: 'Plan a half-day event.\n\nWrite down who the participants are and how many, the venue and why you chose it, and the team roles with a person against each. Then write the run of show hour by hour: what happens, and who leads it.\n\nSay explicitly how somebody with a mobility impairment reaches every part of it — from arriving at the venue to the toilet — and how children are protected in registration and in photography.\n\nFinish with a fallback for two things that could change on the day itself.',
    },
    looksLike: {
      ar: [
        'جمهور محدّد بعدده، لا «الناس»',
        'أدوار مسندة إلى أشخاص، لا قائمة مهامّ بلا أصحاب',
        'Run of Show فيه ساعات، لا عناوين',
        'الوصول لذوي الإعاقة داخل تصميم الفعاليّة لا مضافاً في آخرها',
        'خطّة بديلة لأمرين محدّدين، لا جملة «سنتصرّف»',
      ],
      en: [
        'A defined audience with a number in it, not "people"',
        'Roles held by people, not a task list with nobody against it',
        'A run of show with hours in it, not headings',
        'Disability access inside the design of the event rather than added at the end',
        'A fallback for two specific things, not "we will manage"',
      ],
    },
    minChars: 450,
    maxChars: 8000,
  },

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'em-idea-to-plan',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'من الفكرة إلى الخطة', en: 'From Idea to Plan' },
      lede: {
        ar: 'الفعالية الناجحة لا تُعاش في يومها وحده — تُبنى في الأسابيع التي تسبقه على ورقة وأسئلة صعبة.',
        en: 'A successful event is not just lived on the day — it is built in the weeks before it, on paper and hard questions.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الفرق بين فعالية تسير بسلاسة وأخرى تُحلّ مشاكلها في يومها ليس في حجم الموارد، بل في جودة التفكير المسبق. الفريق الذي يصل إلى المكان ويكتشف أن القاعة لا تتسع للعدد، أو أن المتطوّعين لا يعرفون ماذا يفعلون، أو أن المشاركين لا يجدون من يستقبلهم — هذا فريق لم يجلس ساعةً قبل أسبوع ليجيب على الأسئلة الأساسية. التخطيط الجيّد لا يلغي المفاجآت، لكنه يضمن أن الفريق جاهز لها وأن المشاكل البسيطة المتوقّعة لا تتحوّل إلى أزمات تستهلك طاقة الفريق وتضرّ تجربة المشاركين.',
            en: 'The difference between an event that runs smoothly and one whose problems are solved on the day is not in the size of resources but in the quality of prior thinking. A team that arrives and finds the hall too small, or volunteers who do not know their roles, or participants with nobody to receive them — that team did not sit for an hour a week earlier to answer the basic questions. Good planning does not eliminate surprises, but it ensures the team is ready for them and that foreseeable small problems do not become crises that drain the team\'s energy and damage participants\' experience.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'حدّد هدف الفعالية في جملة واحدة: ماذا يجب أن يغادر المشاركون وقد حدث معهم أو اكتسبوه؟',
              'حدّد الجمهور المستهدف بدقة: العمر، الخلفية، الاحتياجات الخاصة المتوقّعة، والعدد الواقعي المتوقّع حضوره',
              'اختر التاريخ والتوقيت بعيون الجمهور لا بعيون المنظّمين — ليلة الامتحانات ليست وقتاً مناسباً لفعالية شبابية',
              'اختر المكان بناءً على عدد الحضور المتوقّع وطبيعة النشاط وإمكانية الوصول لذوي الإعاقة وليس فقط التكلفة',
              'قسّم كل مهمة على شخص باسمه مع موعد تسليم محدّد — المهمة التي لا يملكها أحد بالاسم لن تُنجز',
              'ضع ميزانية أولية وحدّد من يوافق على أي إنفاق خارج ما اتُّفق عليه مسبقاً وقبل إنفاقه',
            ],
            en: [
              'Define the event goal in one sentence: what should participants leave having experienced or gained?',
              'Identify the target audience precisely: age, background, likely specific needs, and the realistic expected number',
              'Choose the date and time through the audience\'s eyes, not the organisers\' — exam week is not good timing for a youth event',
              'Choose the venue based on expected attendance, activity type and disability access — not just cost',
              'Assign every task to a named person with a specific deadline — a task nobody owns by name will not be done',
              'Set a preliminary budget and decide who approves any spending outside what was agreed, and before it happens',
            ],
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'الجمهور', en: 'The Audience' },
              text: {
                ar: 'من هم؟ كم عمرهم؟ هل يأتون مع أطفال أو أقارب؟ هل يتوقّعون برنامجاً منظّماً أم مساحة للتفاعل الحر؟ كلما عرفت جمهورك بدقة أكبر كانت كل قرارات التخطيط أوضح وأقل تخميناً.',
                en: 'Who are they, how old, do they come with children or family? Do they expect a structured programme or free interaction? The better you know your audience, the clearer and less guesswork every planning decision becomes.',
              },
            },
            {
              title: { ar: 'المكان', en: 'The Venue' },
              text: {
                ar: 'هل يتسع للعدد المتوقّع مع هامش مناسب؟ هل فيه مرافق صحية كافية؟ هل يمكن الوصول إليه بوسائل النقل العام؟ هل يلبّي شروط الوصول لذوي الإعاقة دون تعديلات استثنائية؟',
                en: 'Does it fit the expected numbers with a reasonable margin? Does it have enough facilities? Is it reachable by public transport? Does it meet disability access standards without exceptional modifications?',
              },
            },
            {
              title: { ar: 'التوقيت', en: 'The Timing' },
              text: {
                ar: 'هل وقت البداية والنهاية يناسبان الفئة المستهدفة؟ هل هناك وقت كافٍ للإعداد قبل وصول المشاركين وللترتيب بعد انتهاء الفعالية قبل إخلاء المكان؟',
                en: 'Does the start and end time suit the target group? Is there enough preparation time before participants arrive, and clearing-up time after, before the venue needs to be vacated?',
              },
            },
            {
              title: { ar: 'الفريق', en: 'The Team' },
              text: {
                ar: 'كم متطوّعاً يكفي لهذا العدد وهذا النشاط بالذات؟ هل الأدوار موزّعة مسبقاً بالاسم؟ هل كل متطوّع يعرف لمن يرجع حين يواجه موقفاً لم يتوقّعه؟',
                en: 'How many volunteers does this specific number and activity need? Are roles assigned by name in advance? Does every volunteer know who to turn to when facing something they did not expect?',
              },
            },
          ],
        },
        {
          type: 'budget',
          prompt: {
            ar: 'يوم مفتوح لسبعين مشاركاً، وميزانيته ستّمئة دولار لا تُزاد. اختر ما تشتريه واترك ما تستغني عنه.',
            en: 'An open day for seventy participants, with a budget of six hundred dollars and no more. Choose what you buy and leave out what you can do without.',
          },
          limit: 600,
          unit: {
            ar: { zero: 'لا شيء', one: 'دولار واحد', two: 'دولاران', few: '{n} دولارات', many: '{n} دولاراً' },
            en: { zero: 'nothing', one: 'one dollar', two: 'two dollars', few: '{n} dollars', many: '{n} dollars' },
          },
          options: [
            {
              text: {
                ar: 'قاعة تتّسع للسبعين مع مخرج ثانٍ ومرافق صحّية كافية',
                en: 'A hall that holds seventy, with a second exit and enough facilities',
              },
              cost: 220,
              take: true,
              because: {
                ar: 'أكبر بند في القائمة، وأوّل ما يحاول الناس تصغيره. القاعة الأصغر بمئة وستّين دولاراً تعني كراسيَ في الممرّات ومخرجاً واحداً، أي أنّك وفّرت ستّين دولاراً على حساب زمن الإخلاء.',
                en: 'The largest line on the list, and the first one people try to shrink. The smaller hall at a hundred and sixty means chairs in the aisles and a single exit, which is sixty dollars saved against the time it takes to get everybody out.',
              },
            },
            {
              text: {
                ar: 'نقل ذهاباً وإياباً لمن لا تصله المواصلات العامّة، بينها سيّارة تتّسع لكرسيّ متحرّك',
                en: 'Return transport for those the public network does not reach, including one vehicle that takes a wheelchair',
              },
              cost: 120,
              take: true,
              because: {
                ar: 'الفعالية التي لا يستطيع جزء من جمهورها الوصول إليها ليست فعالية لسبعين بل لمن يسكن قريباً. وهذا البند يُقصّ عادةً لأنّ غيابه لا يظهر في القاعة: من لم يصل لا يشتكي، ولا يُحصى.',
                en: 'An event a part of its audience cannot reach is not an event for seventy, it is an event for whoever lives nearby. This line gets cut because its absence is invisible in the room: the people who did not arrive do not complain, and do not get counted.',
              },
            },
            {
              text: {
                ar: 'حقيبة إسعافات أوّلية كاملة، ومتطوّع مدرَّب على استخدامها',
                en: 'A complete first-aid kit and a volunteer trained to use it',
              },
              cost: 40,
              take: true,
              because: {
                ar: 'أربعون دولاراً هي أرخص ما تشتريه هنا وأقلّه احتمالاً للاستعمال، وهذا بالذات سبب سقوطه عادةً: البنود التي يُرجى ألّا تُستعمل تبدو دائماً قابلة للتأجيل إلى الفعالية القادمة.',
                en: 'Forty dollars is the cheapest thing here and the least likely to be used, which is exactly why it usually falls: the lines you hope never to touch always look like something the next event can carry instead.',
              },
            },
            {
              text: {
                ar: 'ماء وطعام خفيف لسبعين مشاركاً ولفريق العمل',
                en: 'Water and light food for seventy participants and for the team',
              },
              cost: 90,
              take: true,
              because: {
                ar: 'يوم كامل بلا ماء ليس تقشّفاً بل خطر على من يصوم أو يتناول دواءً أو يأتي من بعيد. ولاحظ أنّ الفريق داخل العدد: المتطوّع الذي لم يأكل منذ الصباح يرتكب في الرابعة أخطاءً لم يكن ليرتكبها في العاشرة.',
                en: 'A whole day without water is not thrift, it is a risk to anyone fasting, on medication, or travelling from far. Note that the team is inside the count: a volunteer who has not eaten since morning makes mistakes at four that they would not have made at ten.',
              },
            },
            {
              text: {
                ar: 'مترجم بلغة الإشارة لجلستَي الافتتاح والختام',
                en: 'A sign language interpreter for the opening and closing sessions',
              },
              cost: 60,
              take: true,
              because: {
                ar: 'إن كان بين المسجّلين من يحتاجه فهذا ليس بنداً تكميلياً بل شرط حضورهم أصلاً. والاستمارة التي تسأل عن الاحتياجات بصياغة مفتوحة تُطرح لهذا السبب: لتعرف قبل أن تُقفل الميزانية لا بعدها.',
                en: 'If somebody on the register needs it, this is not an extra, it is the condition of their attending at all. The registration form asks about needs in open wording for exactly this reason: so that you know before the budget closes rather than after.',
              },
            },
            {
              text: {
                ar: 'احتياطيّ غير مخصّص لما لا يُتوقّع في اليوم نفسه',
                en: 'An unallocated reserve for whatever the day itself throws up',
              },
              cost: 50,
              take: true,
              because: {
                ar: 'البند الوحيد هنا الذي لا يشتري شيئاً بعينه، وأوّل ما يُشطب لأنّه لا يُرى في اليوم. وحين يتعطّل المصعد أو تتأخّر الحافلة، الميزانية التي لا احتياطيّ فيها تدفع من بند الطعام أو لا تدفع.',
                en: 'The only line here that buys nothing in particular, and the first to be struck out because it cannot be seen on the day. When the lift fails or the bus is late, a budget with no reserve pays out of the food line or does not pay at all.',
              },
            },
            {
              text: {
                ar: 'لافتة كبيرة بشعار الجمعية على واجهة القاعة',
                en: 'A large banner with the association\'s logo across the front of the hall',
              },
              cost: 70,
              take: false,
              because: {
                ar: 'اللافتة تجعل الفعالية تبدو منظّمة في الصور ولا تجعلها منظّمة. وسبعون دولاراً هي النقل تقريباً، أي أنّ ثمنها الحقيقيّ ليس سبعين دولاراً بل عدد من لم يصل.',
                en: 'The banner makes the event look organised in photographs; it does not make it organised. Seventy dollars is roughly the transport line, so its real price is not seventy dollars but the number of people who did not arrive.',
              },
            },
            {
              text: {
                ar: 'مصوّر محترف يغطّي اليوم كلّه',
                en: 'A professional photographer covering the whole day',
              },
              cost: 100,
              take: false,
              because: {
                ar: 'التغطية المصوّرة حاجة حقيقية للجمعية، لكنّها حاجة الجمعية لا حاجة المشاركين، ومئة دولار منها ستّون للترجمة وأربعون للإسعافات. متطوّع بهاتف وقائمة بما يلزم تصويره يفي بالغرض في يوم كهذا.',
                en: 'Photographic coverage is a genuine need, but it is the association\'s need rather than the participants\', and a hundred dollars is sixty for the interpreter and forty for the kit. A volunteer with a phone and a list of what to capture does the job on a day like this.',
              },
            },
            {
              text: {
                ar: 'شهادات مطبوعة على ورق مقوّى بأسماء المشاركين',
                en: 'Certificates printed on card with the participants\' names',
              },
              cost: 45,
              take: false,
              because: {
                ar: 'الشهادة تُرسل بالبريد الإلكترونيّ بعد أيّام بلا كلفة تُذكر، والتأجيل هنا لا يُفقد المشارك شيئاً. وهذا هو الشكل السليم للتأجيل: ما يمكن فعله لاحقاً بالجودة نفسها.',
                en: 'A certificate can be emailed a few days later at almost no cost, and deferring it costs the participant nothing. This is what a fair deferral looks like: something that can be done later to the same standard.',
              },
            },
            {
              text: {
                ar: 'هدايا تذكارية صغيرة لكلّ مشارك',
                en: 'A small memento for every participant',
              },
              cost: 80,
              take: false,
              because: {
                ar: 'ثمانون دولاراً لشيء يُحمل إلى البيت ويُنسى. والسؤال الذي يفرز هذا البند عن غيره: هل غيابه يمنع أحداً من المشاركة، أم يجعل المشاركة أقلّ لطفاً؟ الثاني يُؤجَّل، والأوّل لا.',
                en: 'Eighty dollars for something carried home and forgotten. The question that separates this line from the others: does its absence stop anybody taking part, or does it only make taking part less pleasant? The second can wait; the first cannot.',
              },
            },
            {
              text: {
                ar: 'مكبّر صوت إضافيّ مستأجَر لخارج القاعة',
                en: 'An extra hired speaker for outside the hall',
              },
              cost: 35,
              take: false,
              because: {
                ar: 'أرخص بند في القائمة كلّها، وأرخص من حقيبة الإسعافات بخمسة دولارات — ومع ذلك يسقط وتبقى الحقيبة. لو كان الاختيار بالثمن وحده لجاء ترتيبه الأوّل، وهذا ما يجعل الثمن مؤشّراً رديئاً على الأولوية.',
                en: 'The cheapest line on the whole list, and five dollars cheaper than the first-aid kit — and it goes while the kit stays. Chosen by price alone it would have been first in the queue, which is what makes price a poor guide to priority.',
              },
            },
          ],
          afterword: {
            ar: 'ما بقي يبلغ خمسمئة وثمانين دولاراً من ستّمئة، وما سقط ثلاثمئة وثلاثين. البنود التي نجت تشترك في صفة واحدة: غيابها يمنع أحداً من الحضور أو يعرّضه للأذى. والبنود التي سقطت تشترك في صفة واحدة أيضاً: غيابها يجعل اليوم أقلّ لمعاناً ولا يُخرج منه أحداً. والترتيب بالثمن يقلب هذا كلّه — أرخص ما في القائمة سقط، وأربعون دولاراً من الإسعافات بقيت.',
            en: 'What survives comes to five hundred and eighty dollars of six hundred, and what goes comes to three hundred and thirty. The lines that survived share one property: without them somebody cannot attend, or is put at risk. The lines that went share one too: without them the day is less polished and nobody is shut out of it. Ordering by price inverts all of it — the cheapest thing on the list went, and the forty-dollar first-aid kit stayed.',
          },
        },
        {
          type: 'quiz',
          id: 'em-q1',
          label: { ar: 'قرارك', en: 'Your decision' },
          question: {
            ar: 'حجزتم قاعة تتسع لسبعين شخصاً وأرسلتم الدعوات. قبل أسبوع من الفعالية تجاوز عدد المسجّلين التسعين. ما القرار الصحيح؟',
            en: 'You booked a hall for seventy people and sent invitations. One week before the event registrations have exceeded ninety. What is the right decision?',
          },
          options: [
            {
              ar: 'قبول الجميع وترتيب كراسي إضافية في الممرات حتى لا يخيب ظن أحد',
              en: 'Accept everyone and arrange extra chairs in the aisles so as not to disappoint anyone',
            },
            {
              ar: 'إغلاق التسجيل والبحث عن مكان أكبر، أو تقليص العدد إلى ما يسمح به المكان مع قائمة انتظار',
              en: 'Close registrations and look for a larger venue, or reduce numbers to what the venue allows with a waiting list',
            },
            {
              ar: 'قبول الجميع والأمل بأن لا يحضر جميعهم في اليوم نفسه',
              en: 'Accept everyone and hope not all will actually turn up on the day',
            },
            {
              ar: 'إلغاء الفعالية لأن التنظيم وصل إلى طريق مسدود',
              en: 'Cancel the event because the organisation has reached a dead end',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'المكان الذي يتجاوز طاقته يصبح مشكلة سلامة لا مجرد إزعاج — الكراسي في الممرات تُغلق طرق الخروج وتجعل الإخلاء في حالة طوارئ أصعب وأبطأ. وقبول الجميع على أمل غيابهم ليس تخطيطاً، هو مقامرة بسلامة الجميع وبجودة التجربة. البحث عن مكان أكبر صعب في أسبوع لكنه الخيار المسؤول. أو إغلاق التسجيل بشفافية وبناء قائمة انتظار للفعالية التالية. الإلغاء الكامل حلّ أخير حين لا يوجد بديل آخر مقبول.',
            en: 'A venue that exceeds capacity becomes a safety problem, not mere inconvenience — chairs in the aisles close exit routes and make evacuation in an emergency harder and slower. Accepting everyone and hoping they won\'t all come is not planning, it is gambling with everyone\'s safety and experience. Finding a larger venue in one week is difficult but the responsible choice. Or close registrations transparently and build a waiting list for the next event. Full cancellation is a last resort when no other acceptable alternative exists.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'em-access',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'الوصول لذوي الإعاقة في تصميم الفعالية', en: 'Disability Access in Event Design' },
      lede: {
        ar: 'الوصول لذوي الإعاقة ليس رفاهية تُضاف في آخر اللحظة — هو معيار يُبنى عليه كل قرار من اختيار المكان إلى تصميم التسجيل.',
        en: 'Disability access is not a luxury added at the last moment — it is a criterion on which every decision from venue choice to registration design is built.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين يُختار المكان أولاً ثم يُفكَّر في ذوي الإعاقة لاحقاً، تبقى خيارَان كلاهما سيئ: إما إقصاء غير رسمي — «الفعالية للأسف لن تتمكّن من الحضور هذه المرة» — أو ترتيبات مُرهقة تجعل الشخص المعني يشعر بأنه ثقل على الفريق. الوصول الحقيقي يعني أن الشخص ذو الإعاقة يشارك كما يشارك أي شخص آخر — لا بشكل موازٍ أو منفصل أو مشروط بحضور شخص مُساعد. ولهذا الوصول ليس سؤالاً يأتي بعد توقيع عقد الإيجار، بل واحداً من المعايير التي توقّع أو لا توقّع بسببها.',
            en: 'When the venue is chosen first and disability access is considered afterwards, only two options remain, both bad: informal exclusion — "unfortunately you won\'t be able to make it this time" — or burdensome arrangements that make the person feel like a weight on the team. Real access means the person with a disability participates as any other person — not in a parallel or separate way, not conditional on having a helper present. That is why access is not a question that comes after the lease is signed, but one of the criteria by which you sign it or do not.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'هل المدخل الرئيسي يصله كرسي متحرّك بشكل مستقلّ دون درجات ودون الحاجة إلى مساعدة؟',
              'هل يوجد مرحاض مناسب لذوي الإعاقة في نفس الطابق الذي ستُعقد فيه الفعالية؟',
              'هل عرض الممرات الداخلية يسمح بمرور كرسي متحرّك بسهولة بين الطاولات والكراسي؟',
              'هل إضاءة المكان كافية لأشخاص ضعيفي البصر في كل أجزاء القاعة لا في وسطها فقط؟',
              'هل الفعالية ستتضمّن محتوى مسموعاً يحتاج إلى ترجمة لغة إشارة أو نصّ مكتوب موازٍ؟',
              'هل مقاعد ذوي الإعاقة متكاملة مع بقية المشاركين في وسط القاعة لا في الزاوية أو خلف الجميع؟',
              'هل استمارة التسجيل تسأل عن احتياجات خاصة بصياغة مفتوحة تلتقط احتياجات لم تضعها في حسبانك؟',
            ],
            en: [
              'Is the main entrance reachable by wheelchair independently, without steps and without needing help?',
              'Is there an accessible toilet on the same floor where the event will be held?',
              'Is the width of internal corridors enough for a wheelchair to pass easily between tables and chairs?',
              'Is the venue lighting adequate for people with low vision in all parts of the hall, not just the centre?',
              'Will the event include audio content requiring sign-language interpretation or a parallel written text?',
              'Are seats for people with disabilities integrated with other participants in the middle of the hall, not in a corner or behind everyone?',
              'Does the registration form ask about specific needs with open wording that captures needs you did not anticipate?',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'سؤال التسجيل لا يُكتب بهذه الطريقة', en: 'The registration question should not be written this way' },
          content: {
            ar: 'سؤال «هل أنت من ذوي الإعاقة؟ نعم / لا» يُعطي أقل المعلومات المفيدة. الأفيد: «هل هناك أي احتياج خاص يساعدنا معرفته لنضمن مشاركتك الكاملة؟» — هذا يلتقط ما لم يكن في قائمتك: شخص يسمع جزئياً ويحتاج الجلوس في المقدّمة، طفل يحتاج مساحة هادئة، شخص يستخدم عكّازاً لكنه لا يعرّف نفسه بـ«شخص ذي إعاقة».',
            en: 'A question like "are you a person with a disability? Yes / No" gives the least useful information. More useful: "Is there any specific need that would help us know to ensure your full participation?" — this captures what was not on your list: someone who hears partially and needs to sit at the front, a child who needs a quiet space, a person using a cane who does not define themselves as "a person with a disability".',
          },
        },
        {
          type: 'quiz',
          id: 'em-q2',
          label: { ar: 'قرارك', en: 'Your decision' },
          question: {
            ar: 'وصلك تسجيل من شخص يذكر أنه يستخدم كرسياً متحركاً. القاعة التي حجزتها في الطابق الأوّل بلا مصعد. ما القرار الصحيح؟',
            en: 'A registration arrives from someone who mentions using a wheelchair. The hall you booked is on the first floor with no lift. What is the right decision?',
          },
          options: [
            {
              ar: 'تعتذر منه وتشرح أن الفعالية للأسف غير مناسبة له هذه المرة',
              en: 'Apologise and explain that the event is unfortunately not suitable for him this time',
            },
            {
              ar: 'تخصّص متطوّعَين يحملانه عبر الدرج حين يصل',
              en: 'Assign two volunteers to carry him up the stairs when he arrives',
            },
            {
              ar: 'تبحث عن قاعة بديلة في الطابق الأرضي أو تغيّر المكان كاملاً',
              en: 'Look for an alternative hall on the ground floor or change the venue entirely',
            },
            {
              ar: 'تُقيم جزءاً منفصلاً من الفعالية في الطابق الأرضي خصيصاً له حتى يشارك',
              en: 'Hold a separate part of the event on the ground floor specifically for him so he can participate',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الاعتذار إقصاء مؤدَّب ليس أكثر. الحمل ليس حلاً: خطر على الشخص والحاملَين في حالة طوارئ، مُهين في الأحوال العادية، ويعتمد على وجود شخصَين محدّدَين في اللحظة المناسبة. النشاط المنفصل في الطابق الأرضي إقصاء بصيغة أكثر أدباً. المكان هو المشكلة والحل هو تغيير المكان. الوصول ليس ترتيباً استثنائياً لشخص بعينه — هو شرط في المكان نفسه.',
            en: 'Apologising is polite exclusion and nothing more. Carrying is not a solution: it is dangerous to the person and those carrying him in an emergency, demeaning in ordinary circumstances, and depends on two specific people being there at the right moment. A separate activity on the ground floor is exclusion in a more polite form. The venue is the problem and the solution is changing the venue. Access is not an exceptional arrangement for one specific person — it is a condition of the venue itself.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'em-roles',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'الأدوار والتسجيل', en: 'Roles and Registration' },
      lede: {
        ar: 'الفريق الذي يعرف أدواره قبل الفعالية لا يحتاج إلى اجتماع في صباحها.',
        en: 'A team that knows its roles before the event does not need a meeting on the morning of it.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'أكثر ما يسبّب الفوضى في الفعاليات ليس نقص الموارد، بل تداخل الأدوار وغيابها. حين لا يعرف كل شخص بالضبط ماذا يفعل ومتى ولمن يرجع، تُحلّ كل مشكلة بطريقة مختلفة بحسب من صادفها: يُعطي متطوّع معلومات خاطئة لأنه ظنّ أن ذلك دوره، ويغيب شيء من اللوجستيات لأن «كلّاً ظنّ أن الآخر يتولّاه». تحديد الأدوار مكتوباً قبل يوم الفعالية مع تبادل أرقام الهواتف بين كل الفريق، هو ما يحوّل مجموعة من الأشخاص ذوي النوايا الحسنة إلى فريق عمل فعلي يعمل بنفس الفهم.',
            en: 'What most often causes chaos in events is not lack of resources but overlapping or absent roles. When no one knows exactly what they are doing, when, and who to turn to, every problem gets solved differently depending on who encounters it: a volunteer gives wrong information because they thought that was their role, something in logistics is missing because "everyone thought someone else was handling it". Defining roles in writing before the day, with phone numbers shared across the whole team, is what turns a group of well-meaning people into an actual working team that operates with the same understanding.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'منسّق الفعالية', en: 'Event Coordinator' },
              text: {
                ar: 'يتابع الخطة الكاملة، يتخذ قرارات التعديل في اليوم، ويتواصل مع إدارة المنظمة. كل شخص في الفريق يرجع إليه حين يواجه موقفاً خارج نطاق دوره أو حين يحتاج إلى قرار.',
                en: 'Tracks the full plan, makes adjustment decisions on the day, and communicates with the organisation\'s management. Every person on the team refers to them when facing something outside their role or when a decision is needed.',
              },
            },
            {
              title: { ar: 'مسؤول التسجيل', en: 'Registration Officer' },
              text: {
                ar: 'يستقبل المشاركين عند المدخل، يتحقّق من أسمائهم في القائمة، يعطيهم أي مواد أو بطاقات، ويوجّههم إلى أماكن الجلوس. هو أول وجه يراه المشارك فيطبع الانطباع الأول.',
                en: 'Receives participants at the entrance, verifies their names on the list, hands out materials or badges, and directs them to their seats. They are the first face the participant sees, which sets the first impression.',
              },
            },
            {
              title: { ar: 'مسؤول اللوجستيات', en: 'Logistics Officer' },
              text: {
                ar: 'يشرف على المعدات والطعام والمواد التعليمية. يتأكد أن كل شيء جاهز قبل وصول المشاركين بوقت كافٍ ويتعامل مع أي نقص أو عطل في الوقت المناسب قبل أن يلاحظه أحد.',
                en: 'Oversees equipment, catering and educational materials. Ensures everything is ready well before participants arrive and handles any shortage or malfunction in time, before anyone notices.',
              },
            },
            {
              title: { ar: 'مسؤول السلامة', en: 'Safety Officer' },
              text: {
                ar: 'يراقب المكان طوال الفعالية ويتولّى الاستجابة لأي حالة طارئة. يعرف مسبقاً خطة الإخلاء ونقطة التجمّع وأرقام الطوارئ والمستشفى الأقرب من هذا المكان بالذات.',
                en: 'Monitors the venue throughout the event and handles any emergency response. Knows in advance the evacuation plan, assembly point, emergency numbers and the nearest hospital from this specific location.',
              },
            },
          ],
        },
        {
          type: 'list',
          items: {
            ar: [
              'اسأل في استمارة التسجيل عن احتياجات خاصة بصياغة مفتوحة لا مغلقة بـ«نعم / لا»',
              'أرسل تأكيداً مكتوباً واضحاً يتضمّن: العنوان الكامل، خريطة الوصول، وقت البدء الفعلي، وما يحضره المشارك',
              'ضع حداً أقصى للمشاركين يتناسب مع طاقة المكان والفريق ولا تتجاوزه تحت أي ضغط',
              'احتفظ بقائمة انتظار مرتّبة بدل قبول أعداد لا تستطيع خدمتها بجودة تليق بهم',
              'وفّر قناة تواصل واضحة قبل يوم الفعالية: رقم هاتف أو بريد إلكتروني يُرَدّ عليه فعلاً وليس مجرد عنوان رسمي',
              'أبلغ المسجّلين بأي تغيير في المكان أو الوقت فور اتخاذ القرار لا في اليوم السابق للفعالية',
            ],
            en: [
              'Ask about specific needs in the registration form with open wording, not a closed yes/no',
              'Send a clear written confirmation including: full address, directions, actual start time, and what to bring',
              'Set a maximum number of participants matching the venue\'s and team\'s capacity, and do not exceed it under any pressure',
              'Keep an ordered waiting list rather than accepting numbers you cannot serve to a standard they deserve',
              'Provide a clear communication channel before the day: a phone number or email that is actually answered, not just a formal address',
              'Notify registered participants of any venue or time change as soon as the decision is made, not the day before the event',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'em-q3',
          label: { ar: 'سيناريو', en: 'Scenario' },
          question: {
            ar: 'في يوم الفعالية يسألك أحد المشاركين أين يتناول الطعام في الاستراحة. لا تعرف الإجابة لأن اللوجستيات ليست دورك. ماذا تفعل؟',
            en: 'On the day of the event a participant asks you where to eat during the break. You do not know because logistics is not your role. What do you do?',
          },
          options: [
            {
              ar: 'تخمّن إجابة منطقية حتى لا تبدو غير مفيد أمامه',
              en: 'Guess a plausible answer so you do not look unhelpful in front of him',
            },
            {
              ar: 'تقول «لا أعرف» وتكمل عملك',
              en: 'Say "I don\'t know" and continue with your own work',
            },
            {
              ar: 'تحيله إلى مسؤول اللوجستيات أو منسّق الفعالية لأنهما يملكان الإجابة الصحيحة',
              en: 'Direct him to the logistics officer or event coordinator because they have the correct answer',
            },
            {
              ar: 'تطلب منه البحث بنفسه لأن هذا شأن شخصي',
              en: 'Ask him to find out himself because that is a personal matter',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'التخمين قد يُعطي معلومة خاطئة تُضيف ارتباكاً بدل أن تحلّه. قول «لا أعرف» وحده يترك المشارك معلّقاً. معرفة دورك تشمل أيضاً معرفة من يملك الإجابة التي لا تملكها — وإيصال المشارك إليه هو خدمة كاملة. هذا ما يعنيه الفريق المتكامل: لا أحد يعرف كل شيء، لكن كل أحد يعرف لمن يرجع.',
            en: 'Guessing may give wrong information that adds confusion rather than solving it. Saying "I don\'t know" alone leaves the participant hanging. Knowing your role also means knowing who holds the answer you don\'t — and connecting the participant to them is a complete service. This is what an integrated team means: no one knows everything, but everyone knows who to turn to.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'em-safety',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'السلامة وحماية الطفل في الخطة', en: 'Safety and Child Safeguarding in the Plan' },
      lede: {
        ar: 'ما لا يُخطَّط له قبل الفعالية لا يُنفَّذ خلالها حين يكون الضغط في أعلاه.',
        en: 'What is not planned before the event will not be carried out during it when pressure is at its highest.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'السلامة وحماية الطفل ليستا بنودَين يُضافان في آخر قائمة المهام قبل يوم الفعالية — يجب أن يكونا حاضرَين في كل مرحلة من مراحل التخطيط بدءاً من اختيار المكان. اختيار المكان يتضمّن السلامة: هل يفتح الباب الرئيسي على شارع مزدحم؟ هل السلّم آمن لأطفال؟ توزيع الأدوار يتضمّن السلامة: من مسؤول السلامة بالاسم ومن يعرف دوره في حالة طوارئ؟ استمارة التسجيل تتضمّن حماية الطفل: هل حصلنا على إذن التصوير مسبقاً؟ هل هناك حساسيات غذائية أو حالات صحية يجب معرفتها؟ الفعالية التي «تتذكّر» هذا الموضوع في الصباح تجد نفسها تسدّ الثغرات بحلول مؤقتة لا تبني عليها أحداً.',
            en: 'Safety and child safeguarding are not two items added at the bottom of the task list the day before the event — they must be present in every stage of planning from venue selection onward. Choosing the venue involves safety: does the main door open onto a busy street, is the staircase safe for children? Assigning roles involves safety: who is the named safety officer and who knows their role in an emergency? The registration form involves child safeguarding: have we obtained photo consent in advance, are there allergies or health conditions to know about? An event that "remembers" this subject on the morning finds itself plugging gaps with temporary fixes that build nothing.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ ممارسات تحمي الأطفال', en: '✔ Practices that protect children' },
          noTitle: { ar: '✘ ممارسات تعرّضهم للخطر', en: '✘ Practices that put them at risk' },
          yes: {
            ar: [
              'لا يتنقّل طفل في أرجاء المكان دون إشراف بالغ مسمّى يعرفه الجميع',
              'لا يلتقط متطوّع صوراً للأطفال دون إذن خطّي مسبق من أهلهم تضمّنته استمارة التسجيل',
              'لا يبقى متطوّع وحيداً مع طفل في أي مكان غير مرئي لبقية الفريق أو الحاضرين',
              'يُسلَّم الطفل لأهله بالاسم عند نهاية الفعالية ولا يُترك ينتظر وحيداً في المكان',
              'كل متطوّع يعرف اسم المسؤول عن الحماية وكيفية الإبلاغ إذا لاحظ سلوكاً غير لائق',
            ],
            en: [
              'No child moves around the venue without a named adult supervisor known to everyone',
              'No volunteer photographs children without prior written consent from their parents included in the registration form',
              'No volunteer stays alone with a child in any place not visible to the rest of the team or those present',
              'The child is handed to their family by name at the end and not left waiting alone in the venue',
              'Every volunteer knows the safeguarding lead\'s name and how to report if they notice inappropriate behaviour',
            ],
          },
          no: {
            ar: [
              'ترك الأطفال يتنقّلون بحرية في أرجاء المكان دون مراقبة بالغ مسمّى',
              'التقاط صور جماعية للأطفال ونشرها على وسائل التواصل دون استئذان مسبق من الأهل',
              'مساعدة طفل في موضوع شخصي أو عاطفي في زاوية منعزلة بعيدة عن أعين الآخرين',
              'السماح للأطفال بانتظار أهلهم وحدهم في المكان بعد انتهاء الفعالية وانصراف الفريق',
              'افتراض «كل شيء على ما يرام» دون آلية إبلاغ واضحة يعرفها كل متطوّع في الفريق',
            ],
            en: [
              'Letting children move freely around the venue without a named adult supervisor',
              'Taking group photos of children and publishing them on social media without prior consent from their parents',
              'Helping a child with a personal or emotional matter in an isolated corner away from others\' eyes',
              'Allowing children to wait alone for their families after the event ends and the team disperses',
              'Assuming "everything is fine" without a clear reporting mechanism that every volunteer on the team knows',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'إذن التصوير ليس إجراءً بيروقراطياً', en: 'Photo consent is not a bureaucratic procedure' },
          content: {
            ar: 'صورة طفل تُنشر على منصة عامة دون إذن أهله قد تضرّ بعائلته في سياقات معيّنة: عائلات في أوضاع قانونية أو إقامة حسّاسة، أهل يحمون هوية أطفالهم لأسباب خاصة وشخصية. الإذن المسبق في استمارة التسجيل ليس شكلية — هو احترام قرار الأهل حول أطفالهم، وهو ما يُفرَّق به بين فعالية تحترم من تخدم وأخرى تخدمهم بنيّة طيّبة وبلا وعي كافٍ.',
            en: 'A child\'s photo published on a public platform without their parents\' permission may harm their family in certain contexts: families in sensitive legal or residency situations, parents who protect their children\'s identity for personal reasons. Prior consent in the registration form is not a formality — it is respecting parents\' decisions about their children, and it is what distinguishes an event that respects those it serves from one that serves them with good intentions but insufficient awareness.',
          },
        },
        {
          type: 'quiz',
          id: 'em-q4',
          label: { ar: 'قرارك', en: 'Your decision' },
          question: {
            ar: 'خلال الفعالية لاحظت أن متطوّعاً يلتقط صور الأطفال بهاتفه الشخصي دون أن يسأل أحداً. لم يُطلب منك مراقبة المتطوّعين. ماذا تفعل؟',
            en: 'During the event you notice a volunteer taking photos of children with his personal phone without asking anyone. You were not asked to monitor volunteers. What do you do?',
          },
          options: [
            {
              ar: 'لا تتدخّل لأن هذا ليس دورك بالتحديد ولا تريد أن تتجاوز حدودك',
              en: 'Do not intervene because this is not specifically your role and you do not want to overstep your boundaries',
            },
            {
              ar: 'تنبّهه بهدوء الآن بأن التصوير يحتاج إلى إذن مسبق من الأهل، وإن لم يستجب تُبلّغ منسّق الفعالية فوراً',
              en: 'Remind him quietly now that photography requires prior parental consent, and if he does not respond report it to the event coordinator immediately',
            },
            {
              ar: 'تنتظر انتهاء الفعالية وتذكره في جلسة التقييم',
              en: 'Wait until the event ends and mention it in the evaluation session',
            },
            {
              ar: 'تطلب منه إيقاف الهاتف وحذف الصور الآن',
              en: 'Ask him to put the phone down and delete the photos immediately',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'حماية الطفل ليست دور شخص واحد فقط — كل من في الفريق مسؤول بالقدر الذي يسمح به موقفه. تنبيهه بهدوء في اللحظة أفضل بكثير من انتظار التقييم: الصور قد تُنشر قبل ذلك وينتهي الأمر. مطالبته بحذف الصور تجاوز وقد يسبّب موقفاً. والتجاهل بحجة «ليس دوري» يُسقط الحماية عن من يجب أن تخدمهم. إذا لم يستجب بهدوء، المسار الصحيح هو منسّق الفعالية فوراً.',
            en: 'Child safeguarding is not one person\'s role alone — everyone on the team is responsible to the extent their position allows. A quiet reminder in the moment is far better than waiting for the evaluation: the photos may be published before then and the matter closed. Demanding he delete the photos is overstepping and may cause a scene. And ignoring it with "not my role" drops the protection of those you are there to serve. If he does not respond calmly, the right path is the event coordinator immediately.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'em-runofshow',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'Run of Show والخطة البديلة والتقييم', en: 'Run of Show, Fallback Plan and Evaluation' },
      lede: {
        ar: 'الفعالية تُقاد من ورقة؛ الورقة تُكتب قبل الفعالية ويعرفها كل الفريق.',
        en: 'An event is led from a sheet of paper; the paper is written before the event and every member of the team knows it.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'Run of Show ليست برنامجاً يُوزَّع على الحضور — هي وثيقة العمل الداخلية للفريق. تتضمّن كل لحظة في الفعالية مرتّبةً بالدقيقة: ما الفعل، من المسؤول عنه، وما الذي يجب أن يكون جاهزاً قبله. الفريق الذي يعمل بـRun of Show لا يحتاج إلى اجتماعات متكررة في كل تفصيل، لأن الاجتماع كان قبل أسبوع على الورق. والمنسّق الذي يمسك الورقة يعرف في أي لحظة ماذا يجب أن يحدث وماذا يحدث فعلاً، وبالتالي يعرف متى يتدخّل دون أن ينتظر أن ينبّهه أحد.',
            en: 'A run of show is not a programme handed to the audience — it is the team\'s internal working document. It contains every moment in the event ordered by the minute: the action, who is responsible for it, and what must be ready beforehand. A team working with a run of show does not need repeated meetings over every detail, because the meeting happened a week earlier on paper. The coordinator holding the sheet knows at any moment what should be happening and what is actually happening, and therefore knows when to step in without waiting for someone to alert them.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'حدّد ثلاثة أشياء قد تتغيّر في يوم الفعالية وتؤثّر فيها تأثيراً كبيراً: غياب متحدّث رئيسي، عطل في التقنية، قاعة غير متاحة في اللحظة الأخيرة',
              'لكل احتمال حدّد البديل بوضوح: من يحلّ محلّ المتحدّث الغائب؟ ماذا يحدث للبرنامج إذا لم تعمل الشاشة؟ هل هناك مكان احتياطي يمكن الانتقال إليه؟',
              'حدّد من يتخذ قرار التحوّل إلى الخطة البديلة وكيف يُبلَّغ الفريق في ثوانٍ لا دقائق',
              'حدّد متى وكيف يُعلَم المشاركون بأي تعديل، وبأي صيغة لا تُسبّب قلقاً غير ضروري أو تخلق فوضى',
            ],
            en: [
              'Identify three things that could change on the day and significantly affect the event: a key speaker\'s absence, technology failure, venue unavailable at the last moment',
              'For each, name the alternative clearly: who replaces the absent speaker, what happens to the programme if the screen does not work, is there a backup venue to move to?',
              'Decide who calls the switch to the fallback plan and how the team is notified in seconds not minutes',
              'Decide when and how participants are told of any adjustment, and in wording that does not create unnecessary anxiety or chaos',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'التقييم بعد الفعالية ليس عملاً إدارياً إضافياً يجب إنجازه — هو ما يحوّل كل فعالية إلى أساس للفعالية القادمة. جلسة عشر دقائق مع الفريق مباشرةً بعد انتهاء الفعالية، مع استبانة قصيرة للمشاركين قبل مغادرتهم، تُعطي بيانات أصدق وأدق من أي تقرير يُكتب بعد أسبوع من الذاكرة المُصفّاة. ثلاثة أسئلة لا تُحذف أبداً من أي جلسة تقييم: ما الذي نجح وتريد الاحتفاظ به في المرة القادمة؟ ما الذي لم ينجح ولن تكرّره؟ ماذا كنت ستفعل لو كنت تبدأ الفعالية من الصفر الآن وتعرف ما تعرفه اليوم؟',
            en: 'Evaluating after the event is not an additional administrative task that must be completed — it is what turns every event into a foundation for the next one. Ten minutes with the team immediately after the event ends, with a short survey for participants before they leave, give more honest and precise data than any report written a week later from filtered memory. Three questions that must never be dropped from any evaluation session: what worked and you want to keep for next time? What did not work and you will not repeat? What would you do if you were starting the event from scratch now, knowing what you know today?',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'Run of Show بسيط ويعمل', en: 'A simple run of show that works' },
          content: {
            ar: 'جدول بأربعة أعمدة فقط: الوقت، الفعل، المسؤول، وما يُتحقّق منه قبلها. لا يحتاج إلى برنامج خاص — ورقة أو جدول في هاتف يكفي. ما يجعله يعمل ليس تنسيقه أو مظهره، بل أن الفريق كلّه يعرفه ويعمل منه في اليوم نفسه.',
            en: 'A table with just four columns: time, action, who is responsible, and what to verify beforehand. No special software needed — a printed sheet or a phone spreadsheet works. What makes it work is not its format or appearance, but that the whole team knows it and works from it on the day.',
          },
        },
        {
          type: 'quiz',
          id: 'em-q5',
          label: { ar: 'قرارك', en: 'Your decision' },
          question: {
            ar: 'في جلسة التقييم بعد الفعالية يقول أحد المتطوّعين: «كل شيء سار على ما يرام، الجميع كان سعيداً». هل يكفي هذا كتقييم؟',
            en: 'In the evaluation session after the event one volunteer says: "everything went fine, everyone was happy." Is this enough as an evaluation?',
          },
          options: [
            {
              ar: 'نعم، إذا كان المشاركون سعداء فالفعالية حقّقت هدفها',
              en: 'Yes — if participants were happy then the event achieved its goal',
            },
            {
              ar: 'لا — التقييم الحقيقي يحتاج إلى أسئلة محدّدة حول قرارات محدّدة وينتهي بقائمة تعديلات للفعالية القادمة',
              en: 'No — a real evaluation needs specific questions about specific decisions and ends with a list of changes for the next event',
            },
            {
              ar: 'جيّد كبداية لكن يكفي أن نضيف سؤالاً واحداً عن ما يمكن تحسينه',
              en: 'Good as a start but it is enough to add one question about what could be improved',
            },
            {
              ar: 'الأهم هو رأي المشاركين في الاستبانة وما قاله المتطوّع ثانوي',
              en: 'What matters most is participant feedback in the survey and what the volunteer said is secondary',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'رضا المشاركين العام مهم لكنه ليس التقييم — هو نقطة بداية. «الجميع كان سعيداً» لا يخبرك: هل كان وصول ذوي الإعاقة مريحاً فعلاً؟ هل كانت الأدوار واضحة أم أن الفريق حلّها ارتجالاً؟ هل نُفِّذت خطة السلامة أم بقيت على الورق؟ التقييم المفيد يسأل أسئلة محدّدة عن قرارات محدّدة اتُّخذت في التخطيط وينتهي بقائمة ملموسة: ماذا نحتفظ، ماذا نغيّر، ماذا نضيف.',
            en: 'General participant satisfaction matters but it is not the evaluation — it is a starting point. "Everyone was happy" does not tell you: was disability access actually comfortable? Were roles clear or did the team improvise their way through? Was the safety plan carried out or did it stay on paper? A useful evaluation asks specific questions about specific decisions made in planning and ends with a concrete list: what we keep, what we change, what we add.',
          },
        },
      ],
    },
  ],
};
