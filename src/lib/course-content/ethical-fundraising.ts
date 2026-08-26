import type { CourseContent } from './types';

export const ethicalFundraising: CourseContent = {
  slug: 'ethical-fundraising',
  level: 0,
  minutes: 35,
  passMark: 70,
  title: {
    ar: 'جمع الدعم والتبرّعات بطريقة أخلاقية',
    en: 'Ethical Fundraising',
  },
  lede: {
    ar: 'كل تبرّع علاقة ثقة — والثقة تُبنى بمعلومة صادقة وأثر موثَّق، وتنكسر بإعلان مضخّم أو وعد لا يُوفَّى.',
    en: 'Every donation is a relationship of trust — and trust is built with honest information and documented impact, and is broken by exaggerated advertising or unkept promises.',
  },
  outcomes: {
    ar: [
      'تُميّز بين الأساليب الأخلاقية وغير الأخلاقية في جمع التبرّعات',
      'تُصمّم رواية جمع تبرّعات صادقة تحترم كرامة المستفيدين',
      'تُدير علاقة المانح بشفافية في الإنفاق والتقارير',
      'تتعامل مع التبرّعات المشروطة والمشكوك في نزاهتها',
    ],
    en: [
      'Distinguish between ethical and unethical fundraising methods',
      'Design an honest fundraising narrative that respects beneficiary dignity',
      'Manage the donor relationship with transparency in spending and reporting',
      'Handle conditional donations and those of questionable integrity',
    ],
  },
  sources: [
    'AFP — Code of Ethical Standards for Fundraising Professionals',
    'INGO Accountability Charter — Fundraising and Donor Relations Guidelines',
    'Resource Alliance — Ethical Storytelling and Dignity in Fundraising',
    'ACF — Accountability in Fundraising: A Practical Guide for NGOs',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'ef-ethics-basics',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'مبادئ الأخلاقيات في جمع التبرّعات', en: 'Ethics principles in fundraising' },
      lede: {
        ar: 'جمع التبرّعات الأخلاقي ليس مجرّد ترف — بل شرط لبقاء ثقة الجمهور بالعمل غير الربحي على المدى البعيد.',
        en: 'Ethical fundraising is not a luxury — it is a condition for maintaining public trust in non-profit work in the long term.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'جمع التبرّعات الأخلاقي يقوم على ثلاثة أعمدة: الصدق (الرواية والأرقام والأهداف دقيقة وصحيحة)، الاحترام (المستفيدون يُعاملون بكرامة لا كأدوات لاستجلاب العواطف)، والمساءلة (التبرّع يُنفَق كما وُعد ويُبلَّغ عنه بشفافية).\n\nلماذا يهمّ هذا؟ لأن منظومة العمل الخيري تعتمد على ثقة الجمهور جميعاً — فضيحة أخلاقية في جمعية واحدة تُضرّ بالجميع. والمانح الذي يُخدَع مرّة لا يُعطي مرّة ثانية — ليس لجمعيتك فقط، بل لأي جمعية.',
            en: 'Ethical fundraising rests on three pillars: honesty (the narrative, figures, and goals are accurate and correct), respect (beneficiaries are treated with dignity, not used as emotional tools), and accountability (the donation is spent as promised and reported transparently).\n\nWhy does this matter? Because the charitable work ecosystem depends on public trust collectively — an ethical scandal in one organisation harms all. And a donor who is deceived once does not give again — not just to your organisation, but to any organisation.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'الصدق: لا تُضخّم الأرقام ولا تُبسّط مشاكل معقّدة لاستجلاب التبرّع',
              'الاحترام: لا تُظهر المستفيدين في صور أو روايات تنتهك كرامتهم',
              'الموافقة: احصل على موافقة صريحة من المستفيد قبل استخدام قصّته أو صورته',
              'الشفافية: أوضح للمانح كيف ستُوزَّع أمواله وما الذي لا يُغطّيه تبرّعه',
              'الإفصاح: أبلّغ المانحين بالنتائج الحقيقية — سواء كانت ما هُو أو أقلّ',
            ],
            en: [
              'Honesty: do not exaggerate numbers or oversimplify complex problems to solicit donation',
              'Respect: do not show beneficiaries in images or narratives that violate their dignity',
              'Consent: obtain explicit consent from the beneficiary before using their story or image',
              'Transparency: clarify to the donor how their funds will be distributed and what their donation does not cover',
              'Disclosure: report real outcomes to donors — whether what was promised or less',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'التبرّعات المشروطة — التي يُحدّد فيها المانح كيفية الإنفاق بشكل تفصيلي — شائعة وطبيعية، لكنها تُحمل معها مسؤوليات أخلاقية دقيقة تستوجب وضوحاً من البداية.\n\n**أوّلاً: الوضوح في قبول الشرط.** حين يضع مانح شرطاً لاستخدام تبرّعه، يجب أن تُصرّح بوضوح ما إذا كنت تستطيع الوفاء به فعلاً — لا تقبل ما لا تستطيع تنفيذه لمجرّد عدم خسارة التبرّع. موافقتك على شرط لن تُنفّذه هي خيانة مُسبَقة للثقة.\n\n**ثانياً: توثيق الشروط.** كل شرط يُوثَّق في مكاتبة رسمية أو بريد إلكتروني، مع تحديد البرنامج والتوقيت والمستهدفين. هذا التوثيق يحمي الجمعية ويحمي المانح ويُيسّر أي تدقيق مستقبلي.\n\n**ثالثاً: الشروط التي تُعارض مصلحة المستفيدين.** حين يضع مانح شرطاً يُقيّد فئة من المستفيدين أو يتعارض مع مصلحتهم الفضلى — المسار الأمثل هو فهم دافع المانح أوّلاً. أحياناً يكون الشرط ناتجاً عن سوء فهم للبرنامج، وحوار صادق يُصلحه. إن كان الشرط فعلاً يُضرّ بمن يجب خدمتهم، وضّح موقفك بصدق واقترح بدائل.\n\n**رابعاً: الشروط التي تصبح مستحيلة.** إن تغيّرت الظروف وأصبح الوفاء بالشرط متعذّراً — أبلّغ المانح فوراً وناقشه في بدائل. التصرّف بمفردك دون إبلاغ يُحوّل التبرّع المشروط إلى خيانة اتّفاق.',
            en: 'Conditional donations — in which the donor specifies spending in detail — are common and natural, but they carry subtle ethical responsibilities requiring clarity from the start.\n\n**First: clarity in accepting the condition.** When a donor places a condition on using their donation, you must clearly state whether you can actually fulfil it — do not accept what you cannot implement merely to avoid losing the donation. Your agreement to a condition you will not implement is pre-emptive betrayal of trust.\n\n**Second: documenting conditions.** Every condition must be documented in official correspondence or email, specifying the programme, timeline, and targets. This documentation protects the organisation, protects the donor, and facilitates any future auditing.\n\n**Third: conditions conflicting with beneficiaries\' interests.** When a donor places a condition restricting a category of beneficiaries or conflicting with their best interest — the best path is understanding the donor\'s motive first. Sometimes the condition results from a misunderstanding of the programme, and honest dialogue corrects it. If the condition genuinely harms those who should be served, state your position honestly and propose alternatives.\n\n**Fourth: conditions that become impossible.** If circumstances change and fulfilling the condition becomes difficult — inform the donor immediately and discuss alternatives. Acting alone without informing them converts a conditional donation into a breach of agreement.',
          },
        },
        {
          type: 'quiz',
          id: 'ef-q1',
          label: { ar: 'سؤال ١', en: 'Question 1' },
          question: {
            ar: 'حملة تبرّع تُظهر صوراً لأطفال بملابس ممزّقة مع تعليقات مُحزنة لاستجلاب التبرّع. ما المشكلة الأخلاقية؟',
            en: 'A fundraising campaign shows images of children in torn clothing with sad captions to solicit donations. What is the ethical problem?',
          },
          options: [
            { ar: 'استخدام صور تنتهك كرامة الأطفال بدون موافقتهم أو موافقة أوليائهم، وتُقدّم المستفيدين كضحايا لا كأصحاب حقوق', en: 'Using images that violate children\'s dignity without their or their guardians\' consent, and presenting beneficiaries as victims rather than rights-holders' },
            { ar: 'الصور مؤثّرة جداً وقد تُبعد بعض المانحين الذين ينفرون من مشاهد الحزن، فيُستحسن تخفيف حدّتها لتوسيع قاعدة التبرّع', en: 'The images are too emotional and may deter donors who recoil from sad scenes, so softening them would widen the base of people who give' },
            { ar: 'لا مشكلة — الهدف تجميع الموارد لمساعدتهم، وما دام المال يعود إلى الأطفال أنفسهم فالوسيلة مبرّرة بحجم ما تجمعه الحملة', en: 'No problem — the goal is gathering resources to help them, and as long as the money goes back to the children themselves the method is justified by what the campaign raises' },
          ],
          correct: 0,
          feedback: {
            ar: 'حسن النيّة (مساعدة الأطفال) لا يُبيح انتهاك حقوقهم (الكرامة والموافقة والتمثيل الإنساني). رواية جمع التبرّعات يجب أن تُقدّم المستفيدين بكرامة ولا تُختزلهم في مشهد مُحزن.',
            en: 'Good intention (helping children) does not justify violating their rights (dignity, consent, and human representation). The fundraising narrative must present beneficiaries with dignity and not reduce them to a sad image.',
          },
        },
        {
          type: 'quiz',
          id: 'ef-q2',
          label: { ar: 'سؤال ٢', en: 'Question 2' },
          question: {
            ar: 'رواية جمع التبرّعات تقول "بمئة دولار تُغيّر حياة أسرة كاملة". هل هذه الرواية إشكالية؟',
            en: 'A fundraising narrative says "with a hundred dollars you change a whole family\'s life." Is this narrative problematic?',
          },
          options: [
            { ar: 'نعم — تُبسّط وعداً معقّداً وتُغري المانح بتوقّعات قد لا تتحقّق بهذا المبلغ وحده', en: 'Yes — it oversimplifies a complex promise and entices the donor with expectations that may not materialise from this amount alone' },
            { ar: 'لا — التبسيط ضروري في جمع التبرّعات لتسهيل اتّخاذ قرار التبرّع، والمانح لا يقرأ التفاصيل المعقّدة أصلاً', en: 'No — simplification is necessary in fundraising to facilitate the donation decision, and the donor does not read the complicated detail anyway' },
            { ar: 'يعتمد على مدى صحّة الرقم — إن كانت المئة تكفي أسرة فالعبارة دقيقة', en: 'It depends on the accuracy of the figure — if a hundred does cover a family the sentence is accurate' },
          ],
          correct: 0,
          feedback: {
            ar: 'التبسيط الزائد في وعود التأثير يُوجد توقّعات يصعب تحقيقها — وحين يسأل المانح "ما الذي تغيّر بمئة دولاري؟"، الجواب الصادق أعقد كثيراً. الأمانة في صياغة الأثر المتوقّع تبني ثقة أعمق.',
            en: 'Over-simplification in impact promises creates expectations difficult to meet — and when the donor asks "what changed with my hundred dollars?" the honest answer is far more complex. Honesty in framing the expected impact builds deeper trust.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'ef-narrative',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'رواية جمع التبرّعات الصادقة', en: 'Honest fundraising narrative' },
      lede: {
        ar: 'الرواية القوية لا تعتمد على المبالغة — بل على التفاصيل الحقيقية التي تُشعر المانح أن تبرّعه له معنى وأثر فعلي.',
        en: 'A powerful narrative does not rely on exaggeration — but on real details that make the donor feel their donation has meaning and actual impact.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'أقوى روايات جمع التبرّعات ليست الأكثر مأساوية — بل الأكثر صدقاً وتحديداً. بدلاً من "الفقر يُدمّر المجتمعات"، قُل "ثلاث وثمانون أسرة في حيّ X لا تملك وصولاً لمياه نظيفة على بعد كيلومتر واحد من محطّة جديدة".\n\nالموافقة من المستفيدين أساسية في بناء الرواية: قبل استخدام أي قصّة أو صورة، الشخص يُوضَّح له ما سيُستخدَم وكيف، ويُعطى حق الرفض بلا عواقب. هذه ليست إجراءات بيروقراطية — بل حدٌّ أدنى من احترام الإنسانية.',
            en: 'The most powerful fundraising narratives are not the most tragic — but the most honest and specific. Instead of "poverty destroys communities," say "eighty-three families in neighbourhood X have no access to clean water one kilometre from a new station."\n\nConsent from beneficiaries is fundamental in building the narrative: before using any story or image, the person is told what will be used and how, and given the right to refuse without consequences. These are not bureaucratic procedures — they are a minimum of human respect.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'مبدأ "الكرامة أوّلاً" في روايات جمع التبرّعات يعني أن كل شخص تروي قصّته إنسان كامل الحقوق والإنسانية — لا حالة مثيرة للشفقة. الرواية الأخلاقية لا تُقيس نجاحها بكمية الدموع التي تستجلبها، بل بالحقيقة التي تنقلها والكرامة التي تحفظها.\n\n**اللغة:** استبدل مصطلح "ضحايا" بـ"مستفيدين" أو بالاسم والسياق المحدّد. بدلاً من "أطفال فقراء يحتاجون مساعدتك"، قل "مئة وخمسة وعشرون طفلاً في منطقة X لا تصل إليها المدارس الحكومية". الصياغة الثانية أكثر دقّة وأكثر احتراماً وأعمق تأثيراً في بناء الثقة مع المانح.\n\n**الصورة:** لا تستخدم صور حالات المعاناة الحادّة دون موافقة صريحة مستنيرة — موافقة يعلم فيها الشخص بالضبط أين ستُنشر الصورة ولمن وكيف ستُستخدَم، مع حقّه الكامل في الرفض بلا عواقب تطال خدمته.\n\n**بناء الرواية:** ابنِ القصّة حول ما أنجزه المستفيد بدعمك لا حول عجزه. الشخص الذي تجاوز ظرفاً صعباً بمساندة برنامجك قصّته أقوى وأكثر كرامةً من صورة الشخص الغارق في معاناته. المانح يتبرّع لصنع تغيير — لا لتخفيف ذنب.',
            en: 'The "dignity-first" principle in fundraising narratives means every person whose story you tell is a complete human being with full rights and humanity — not a pitiful case. An ethical narrative does not measure its success by the tears it elicits, but by the truth it conveys and the dignity it preserves.\n\n**Language:** replace the term "victims" with "beneficiaries" or with the specific name and context. Instead of "poor children who need your help," say "one hundred and twenty-five children in area X not reached by government schools." The second phrasing is more accurate, more respectful, and more effective in building donor trust.\n\n**Images:** do not use photos of acute suffering without explicit informed consent — consent where the person knows exactly where the photo will be published, for whom, and how it will be used, with their full right to refuse without consequences for their service.\n\n**Building the narrative:** build the story around what the beneficiary achieved with your support, not their incapacity. The person who overcame a difficult circumstance with your programme\'s support has a stronger and more dignified story than an image of someone drowning in their suffering. The donor donates to make change — not to relieve guilt.',
          },
        },
        {
          type: 'quiz',
          id: 'ef-q3',
          label: { ar: 'سؤال ٣', en: 'Question 3' },
          question: {
            ar: 'مستفيد وافق على استخدام قصّته في حملة التبرّع، ثم طلب سحب موافقته قبل نشر الحملة. ماذا تفعل؟',
            en: 'A beneficiary agreed to use their story in a fundraising campaign, then requested to withdraw their consent before the campaign launch. What do you do?',
          },
          options: [
            { ar: 'احترم طلبه واسحب قصّته دون تأخير أو ضغط — الموافقة قابلة للسحب في أي وقت', en: 'Respect their request and withdraw their story without delay or pressure — consent can be withdrawn at any time' },
            { ar: 'أخبره أن الحملة جاهزة وإعادة الصياغة مكلفة — اطلب منه الصبر حتى الحملة التالية بدل سحبها الآن', en: 'Tell them the campaign is ready and rephrasing is costly — ask them to be patient and wait until the next campaign instead' },
            { ar: 'استبدل اسمه ومعرّفاته بأسماء مستعارة وتابع — القصّة تبقى مفيدة ولا يستطيع أحد التعرّف عليه', en: 'Replace their name and identifiers with aliases and continue — the story stays useful and nobody can recognise them' },
          ],
          correct: 0,
          feedback: {
            ar: 'حق سحب الموافقة مطلق — لا يتوقّف على تكلفة الحملة أو توقيتها. الإخلال بهذا الحق يكسر ثقة المستفيدين ويُعرّض الجمعية لمخاطر أخلاقية وقانونية جدية.',
            en: 'The right to withdraw consent is absolute — it does not depend on campaign cost or timing. Breaching this right breaks beneficiary trust and exposes the organisation to serious ethical and legal risks.',
          },
        },
        {
          type: 'quiz',
          id: 'ef-q4',
          label: { ar: 'سؤال ٤', en: 'Question 4' },
          question: {
            ar: 'حملة جمع التبرّعات نجحت وجمعت ضعف الهدف. ما التزامك تجاه المانحين بالمبلغ الإضافي؟',
            en: 'The fundraising campaign succeeded and raised double the target. What is your obligation to donors regarding the additional amount?',
          },
          options: [
            { ar: 'أبلّغ المانحين بالمبلغ الإضافي وأوضح كيف سيُستخدَم — إن لم تُحدَّد الاستخدامات في الحملة الأصلية، اطلب موافقتهم على توجيه مناسب', en: 'Notify donors of the additional amount and clarify how it will be used — if uses were not specified in the original campaign, seek their approval for an appropriate allocation' },
            { ar: 'استخدم المبلغ الإضافي في احتياجات الجمعية العامّة دون إبلاغ لأنك لم تُحدّد المبلغ الأقصى في الحملة، والتشغيل الإداري يحتاجه أكثر من البرنامج', en: 'Use the additional amount for general organisation needs without notification since you did not specify a maximum amount in the campaign, and administrative running costs need it more than the programme does' },
            { ar: 'أعِد المبلغ الإضافي للمانحين فوراً، فالمال الذي جُمع فوق الهدف المُعلن لا يحقّ للجمعية الاحتفاظ به إطلاقاً', en: 'Return the additional amount to donors immediately, since money raised above the announced target is not the organisation’s to keep at all' },
          ],
          correct: 0,
          feedback: {
            ar: 'التبرّع تمّ لهدف محدّد. المبلغ الإضافي لا يصبح ملكاً حرّاً للجمعية تلقائياً. الإبلاغ والشفافية مع المانحين يعكسان أمانة في إدارة ثقتهم — وهذا ما يُعيدهم للتبرّع في المرّة القادمة.',
            en: 'The donation was made for a specific goal. The additional amount does not automatically become free property for the organisation. Notification and transparency with donors reflect honesty in managing their trust — and this is what brings them back to donate next time.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'ef-donor-relations',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'إدارة علاقة المانح بشفافية', en: 'Managing the donor relationship with transparency' },
      lede: {
        ar: 'المانح الذي يُبلَّغ بالنتائج — حتى حين تكون أقلّ من الهدف — أكثر إخلاصاً من المانح الذي يتلقّى تقارير متفائلة دائماً.',
        en: 'A donor who is informed of results — even when less than the target — is more loyal than a donor who always receives optimistic reports.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'العلاقة مع المانح لا تنتهي بتسلّم التبرّع — بل تبدأ. ما يُبقيها قوية:\n\n**التقرير الصادق:** أبلّغ المانح بما تحقّق وما لم يتحقّق. التقرير الإيجابي دائماً يُثير الشكّ؛ التقرير الصادق يبني الثقة.\n\n**الإنفاق الموثَّق:** حين يسأل المانح "أين ذهبت أمواله؟" الجواب يجب أن يكون فورياً وموثَّقاً.\n\n**التواصل الدوري:** تواصل مع المانحين الدائمين حتى حين لا تطلب تبرّعاً — أخبرهم بتطوّرات البرامج. المانح يريد أن يشعر أنه شريك لا مجرّد ممرّ للمال.',
            en: 'The relationship with the donor does not end with receiving the donation — it begins. What keeps it strong:\n\n**Honest reporting:** inform the donor of what was achieved and what was not. Always positive reports raise suspicion; honest reports build trust.\n\n**Documented spending:** when a donor asks "where did their money go?" the answer must be immediate and documented.\n\n**Regular communication:** communicate with regular donors even when not requesting a donation — update them on programme developments. The donor wants to feel like a partner, not just a financial conduit.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الشفافية في الإنفاق لا تعني الإفصاح عن كلّ فاتورة — بل تعني أن يكون بإمكان المانح المعقول أن يفهم كيف استُخدمت أمواله. الفرق بين المؤسسة التي تحظى بثقة المانحين وتلك التي لا تحظى بها غالباً هو في جودة التوثيق لا في حجم النجاح.\n\n**تقارير الإنفاق الفصلية:** لا ينتظر المانح سنة ليعرف ما حدث بتبرّعه. التقرير الفصلي المختصر — ثلاث صفحات لا ثلاثون — يُبقيه مرتبطاً ويُشعره بالشراكة الفعلية. اذكر: ما الذي خُصّصت له الأموال، ما الذي أُنجز، وما الذي تعثّر ولماذا.\n\n**تفاصيل التوزيع:** الشفافية تعني القدرة على القول: "من كلّ ألف دولار تبرّعتَ بها، ذهب ٨٢٠ مباشرةً للبرامج، و١٢٠ للتشغيل الإداري، و٦٠ لتكاليف التسويق وجمع التبرّعات". هذا المستوى من الوضوح نادر — ومن يُقدّمه يتميّز فوراً.\n\n**التفاصيل الحسّاسة:** بعض الإنفاق يتضمّن بيانات مستفيدين أو تفاصيل لوجستية لا يجوز نشرها. في هذه الحالة، اشرح ما لا يمكنك الإفصاح عنه وسبب ذلك — الغموض المُبرَّر أفضل من الإخفاء الذي يُثير الشكّ.',
            en: 'Transparency in spending does not mean disclosing every invoice — it means a reasonable donor can understand how their money was used. The difference between an organisation donors trust and one they do not is usually in documentation quality, not in the scale of success.\n\n**Quarterly spending reports:** a donor does not wait a year to know what happened to their donation. The concise quarterly report — three pages, not thirty — keeps them connected and makes them feel genuine partnership. State: what the money was allocated for, what was accomplished, and what stalled and why.\n\n**Distribution breakdown:** transparency means being able to say: "of every one thousand dollars you donated, eight hundred and twenty went directly to programmes, one hundred and twenty to administrative operations, and sixty to marketing and fundraising costs." This level of clarity is rare — and whoever provides it stands out immediately.\n\n**Sensitive details:** some spending involves beneficiary data or logistical details that cannot be published. In this case, explain what you cannot disclose and why — justified opacity is better than concealment that raises suspicion.',
          },
        },
        {
          type: 'quiz',
          id: 'ef-q5',
          label: { ar: 'سؤال ٥', en: 'Question 5' },
          question: {
            ar: 'مشروع مُموَّل من مانح لم يُحقّق هدفه بسبب ظروف خارجية. كيف تُبلّغ المانح؟',
            en: 'A donor-funded project did not achieve its goal due to external circumstances. How do you inform the donor?',
          },
          options: [
            { ar: 'أبلّغه صادقاً بما حدث وما الظروف التي أثّرت، وما الذي سيتغيّر في الدورة القادمة — الصدق يبني ثقة يصعب بناؤها بالتفاؤل', en: 'Inform them honestly about what happened, what circumstances affected it, and what will change in the next cycle — honesty builds trust that optimism cannot' },
            { ar: 'ضع الأرقام بشكل يُبرز ما تحقّق ويُهوّن ما لم يتحقّق، فالمانح يحتاج أن يرى أثراً لا اعتذاراً كي يجدّد تمويله', en: 'Frame the numbers to highlight what was achieved and minimise what was not, since a funder needs to see impact rather than an apology to renew' },
            { ar: 'تجنّب الإشارة للأهداف الأصلية في التقرير لتجنّب المقارنة المحرجة، واكتفِ بسرد ما أُنجز فعلاً حتى لا تُثير أسئلة عن ظروف خارجة عن يدك', en: 'Avoid mentioning the original goals in the report to avoid an embarrassing comparison, and simply narrate what was done so no questions arise about circumstances beyond your control' },
          ],
          correct: 0,
          feedback: {
            ar: 'الصدق في التقارير يُضعف على المدى القصير ويُقوّي على المدى الطويل. المانح الذي يفهم ما حدث فعلاً يُقدّر الصدق أكثر من تقرير مُلمَّع يُخفي مشكلة حقيقية.',
            en: 'Honesty in reports weakens in the short term and strengthens in the long term. A donor who understands what actually happened values honesty more than a polished report hiding a real problem.',
          },
        },
        {
          type: 'quiz',
          id: 'ef-q6',
          label: { ar: 'سؤال ٦', en: 'Question 6' },
          question: {
            ar: 'مانح يطلب أن تُخصَّص أمواله لبرنامج بعينه، لكن ذلك البرنامج لا يستوعب التمويل كاملاً بكفاءة. ماذا تفعل؟',
            en: 'A donor requests their funds be designated for a specific programme, but that programme cannot efficiently absorb the full funding. What do you do?',
          },
          options: [
            { ar: 'أوضح للمانح الوضع بصدق وناقش معه توزيعاً أكثر كفاءة يحترم هدفه الأصلي — لا تقبل تمويلاً لا يمكن إنفاقه بكفاءة', en: 'Clarify the situation to the donor honestly and discuss a more efficient distribution that respects their original goal — do not accept funding that cannot be spent efficiently' },
            { ar: 'قبل الأموال كاملاً ووزّع ما تبقّى على احتياجات أخرى بشكل هادئ، فالمانح يهمّه أن يُنفَق المال في عمل نافع لا أن يُتابع تفاصيل التوزيع', en: 'Accept the full funds and quietly distribute the remainder to other needs, since what matters to the donor is that the money does useful work, not that they follow every detail of the split' },
            { ar: 'ادّخر المبلغ الإضافي للطوارئ دون إبلاغ، فالاحتياطي يخدم البرنامج نفسه حين تتوسّع قدرته على الاستيعاب لاحقاً', en: 'Save the additional amount for emergencies without notification, since a reserve serves the same programme once its absorption capacity grows later on' },
          ],
          correct: 0,
          feedback: {
            ar: 'قبول تمويل لا يمكن إنفاقه كما وُعد — أو إنفاقه بخلاف ما اتُّفق عليه سراً — خيانة للثقة. الصدق أصعب في اللحظة لكنه يحمي العلاقة على المدى البعيد.',
            en: 'Accepting funding that cannot be spent as promised — or spending it differently than agreed in secret — is a breach of trust. Honesty is harder in the moment but protects the relationship in the long run.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'ef-problematic-donations',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'التعامل مع التبرّعات الإشكالية', en: 'Handling problematic donations' },
      lede: {
        ar: 'ليس كل تبرّع مُفيد بالضرورة — تبرّع من مصدر مشكوك فيه أو بشروط تتعارض مع قيمك قد يكلفك أكثر ممّا يُعطيك.',
        en: 'Not every donation is necessarily beneficial — a donation from a questionable source or with conditions conflicting with your values may cost you more than it gives.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'قبول تبرّع من أي مصدر يبدو خطأ أخلاقياً يضرّ بمصداقية الجمعية ويُعرّضها لمخاطر قانونية وسمعة. ثلاثة أنواع شائعة من التبرّعات الإشكالية:\n\n**التبرّعات المشروطة بشكل تدخّلي:** مانح يضع شروطاً تتحكّم في من تخدمون أو كيف — هذا يُقيّد استقلاليتك ويُعرّض قدرتك على خدمة المستفيدين للخطر.\n\n**التبرّعات من مصادر مشكوك في نزاهتها:** الجمعية يجب أن يكون لها سياسة لمراجعة مصادر التمويل، خاصّة الكبيرة.\n\n**التبرّعات "الغسيل السمعي":** جهة تُريد استخدام اسم جمعيتك لتحسين صورتها — قبولها قد يُورّطك في تضليل الجمهور.',
            en: 'Accepting a donation from any source that appears ethically wrong harms the organisation\'s credibility and exposes it to legal and reputational risks. Three common types of problematic donations:\n\n**Intrusively conditional donations:** a donor placing conditions that control who you serve or how — this restricts your independence and endangers your ability to serve beneficiaries.\n\n**Donations from sources of questionable integrity:** the organisation must have a policy for reviewing funding sources, especially large ones.\n\n**"Reputation laundering" donations:** an entity wanting to use your organisation\'s name to improve their image — accepting it may involve you in misleading the public.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'إدارة علاقات المانحين فنّ يتجاوز جمع التبرّعات — إنها بناء ثقة متراكمة يجعل المانح يعود مراراً لأنه يشعر بأنه شريك حقيقي لا صراف آلي. الطريقة العملية: تواصل مع المانحين ثلاث مرّات خارج سياق الطلب لكل مرّة تطلب فيها — أرسل تحديثاً عن تقدّم البرامج، شارك قصّة نجاح، اعترف بتحدٍّ واجهته وكيف تعاملت معه.\n\nأنشئ قاعدة بيانات بسيطة لمانحيك تُسجّل: تاريخ التبرّعات وقيمها، الاهتمامات والأسباب المحرّكة لكل مانح، طبيعة آخر تواصل. هذه البيانات تُمكّنك من تخصيص تواصلك وجعل كل مانح يشعر بأنك تعرفه فعلاً وتُقدّر مساهمته بشكل شخصي.',
            en: 'Managing donor relationships is an art that goes beyond fundraising — it is building accumulated trust that makes the donor return repeatedly because they feel like a genuine partner, not an ATM. The practical approach: contact donors three times outside the request context for each time you ask — send a programme progress update, share a success story, acknowledge a challenge you faced and how you handled it.\n\nCreate a simple database for your donors recording: donation history and amounts, the interests and motivating causes for each donor, the nature of last contact. This data allows you to personalise your communication and make each donor genuinely feel that you know them and appreciate their contribution personally.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الشفافية في استخدام التبرّعات ليست مجرّد متطلّب أخلاقي — بل استثمار في الاستدامة. المنظّمات التي تُصدر تقارير مالية مفصّلة وتشرح كيف أُنفق كل تبرّع تحصل على ثقة أعلى وتبرّعات متكرّرة أكثر مقارنة بتلك التي تكتفي بالشكر العام.\n\nتقرير الاستخدام المثالي يتضمّن: النسب المئوية لكيفية توزيع الميزانية (برامج، إدارة، جمع تبرّعات)، قصص تأثير مرتبطة بتبرّعات محدّدة، ومقارنة بين ما خطّطت له وما حقّقته فعلاً. المانح الذي يرى تقريراً صادقاً يعترف فيه بالأخطاء ويشرح الدروس المستفادة يثق بالمنظّمة أكثر ممّن يرى فقط النجاحات.',
            en: 'Transparency in the use of donations is not just an ethical requirement — but an investment in sustainability. Organisations that publish detailed financial reports and explain how each donation was spent receive higher trust and more repeat donations compared to those that settle for general thanks.\n\nAn ideal usage report includes: percentages of budget distribution (programmes, administration, fundraising), impact stories linked to specific donations, and a comparison between what you planned and what you actually achieved. A donor who sees an honest report that acknowledges mistakes and explains lessons learned trusts the organisation more than one who only sees successes.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الحدود الأخلاقية في حملات التبرّع تحمي المستفيدين والمانحين والمنظّمة معاً. أربعة خطوط لا تُتجاوز: (١) لا تُضخّم الأزمة لتُثير التعاطف — المبالغة تُضرّ بكرامة المستفيدين وتُشوّه الواقع. (٢) لا تستخدم صور الأطفال أو الحالات الحسّاسة دون موافقة صريحة وبروتوكول حماية واضح. (٣) لا تُقدّم وعوداً لا تستطيع الوفاء بها كاملاً — الوعد الجزئي أفضل من الوعد الكامل المكسور. (٤) لا تُنشئ حاجة وهمية — كن صادقاً حول ما تحتاجه فعلاً والفرق الذي سيُحدثه تبرّع المانح.',
            en: 'Ethical boundaries in fundraising campaigns protect beneficiaries, donors, and the organisation alike. Four lines never to cross: (1) Do not exaggerate the crisis to arouse sympathy — exaggeration harms beneficiaries\' dignity and distorts reality. (2) Do not use photos of children or sensitive cases without explicit consent and a clear protection protocol. (3) Do not make promises you cannot fully keep — a partial promise is better than a broken full promise. (4) Do not create false need — be honest about what you genuinely need and the difference a donor\'s donation will make.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الثقة طويلة الأمد مع المانحين تُبنى على ثلاثة عناصر: الاتساق (تتواصل في مواعيد منتظمة لا فقط حين تحتاج)، الصدق (تُخبر بالصعوبات مع النجاحات)، والتقدير (تُظهر أن مساهمتهم تُحدث فرقاً حقيقياً بأمثلة ملموسة). مانح واحد وفيّ يتبرّع كل عام يُساوي عشرة مانحين جدد من حيث التكلفة والجهد المبذول لاكتسابهم.\n\nحفاظاً على هذه الثقة: استجب للأسئلة والمخاوف في أسرع وقت ممكن، أقرّ بالأخطاء حين تحدث بشكل استباقي قبل أن يكتشفها المانح، واحرص على أن كل تجربة تفاعل مع مانح تُعزّز شعوره بأنه صنع فارقاً.',
            en: 'Long-term trust with donors is built on three elements: consistency (you communicate at regular intervals, not only when you need something), honesty (you report difficulties alongside successes), and appreciation (you show that their contribution makes a real difference with tangible examples). One loyal donor who donates every year equals ten new donors in terms of the cost and effort spent to acquire them.\n\nTo maintain this trust: respond to questions and concerns as quickly as possible, acknowledge mistakes when they occur proactively before the donor discovers them, and ensure that every interaction experience with a donor reinforces their feeling of having made a difference.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'تنويع مصادر التمويل حماية استراتيجية من التعرّض المفرط لمانح واحد أو نوع تمويل واحد. التنويع الصحيّ يشمل: تبرّعات فردية صغيرة (تُبني قاعدة جماهيرية واسعة وثقة شعبية)، منح مؤسّسية وحكومية (تُوفّر استقراراً لكنها تستغرق وقتاً في التقديم والمتابعة)، شراكات محلّية مع مؤسّسات خاصة (توازن في العلاقة الأفضل)، وعائدات من خدمات أو برامج تدريبية تُقدّمها المنظّمة.\n\nالقاعدة الذهبية: لا مانح واحد يُموّل أكثر من ٣٠٪ من ميزانيتك — ما فوق ذلك يجعلك عرضة لأزمة وجودية إن قرّر المانح تغيير أولوياته. التنويع يستغرق وقتاً وجهداً لكنه يُضمن استمراريتك.',
            en: 'Diversifying funding sources is a strategic protection against excessive exposure to a single donor or funding type. Healthy diversification includes: small individual donations (builds a broad popular base and public trust), institutional and government grants (provide stability but take time to apply for and follow up), local partnerships with private institutions (better balanced relationship), and revenues from services or training programmes the organisation offers.\n\nThe golden rule: no single donor funds more than 30% of your budget — above that makes you vulnerable to an existential crisis if the donor decides to change their priorities. Diversification takes time and effort but it guarantees your continuity.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'رفض التبرّع قرار صعب لكنه قد يكون أكثر الأفعال الأخلاقية التي تتّخذها. المنظّمة التي تقبل كلّ مال مهما كان مصدره تتآكل سمعتها تدريجياً وتفقد استقلاليتها مع كل تنازل.\n\n**متى يجب رفض التبرّع؟** ثمّة خطوط حمراء واضحة: حين يكون مصدر المال من أنشطة غير مشروعة أو مشبوهة (غسيل أموال، رشى)؛ حين يشترط المانح توجيه البرامج بما يُعارض مصلحة المستفيدين أو يُمييزهم؛ حين يشكّل قبول التبرّع تغطية لسمعة المانح أو نشاطه الضارّ ("غسيل سمعة خيري")؛ وحين يُعارض التبرّع صراحةً رسالة المنظّمة وقيمها المُعلنة.\n\n**كيف ترفض؟** الرفض لا يستوجب شرحاً طويلاً ولا اعتذاراً مُفرطاً. قل بوضوح: "شكراً على عرضكم، لكنّ هذا التبرّع لا يتوافق مع سياسة قبول التبرّعات لدينا." وجود سياسة مكتوبة لقبول التبرّعات يُحوّل الرفض من موقف شخصي إلى إجراء مؤسّسي — وهذا يحمي الفريق من الضغط المباشر.\n\n**الاحتياط المُسبق:** قبل قبول تبرّعات الشركات والمؤسّسات، ادرس أنشطتها العامّة. الجمعية البيئية التي تقبل تمويلاً من شركة نفط بلا ضمانات واضحة لن تنجو من التساؤلات العامة.\n\nوالمعيار الجوهري الذي يُوحّد كل هذه الحالات: هل قبول هذا التبرّع يُعزّز قدرتنا على خدمة مستفيدينا، أم أنه يُقيّدها أو يُشوّهها؟ حين يكون الجواب الثاني — مهما كبر الرقم — الرفض هو القرار الصحيح.',
            en: 'Refusing a donation is a difficult decision but may be the most ethical action you take. An organisation that accepts any money regardless of its source gradually erodes its reputation and loses its independence with each concession.\n\n**When must a donation be refused?** There are clear red lines: when the money\'s source is from unlawful or suspicious activities (money laundering, bribery); when the donor conditions directing programmes in ways that conflict with beneficiaries\' interests or discriminate among them; when accepting the donation constitutes cover for the donor\'s reputation or harmful activity ("charitable reputation laundering"); and when the donation explicitly contradicts the organisation\'s mission and stated values.\n\n**How to refuse?** Refusal does not require lengthy explanation or excessive apology. Say clearly: "Thank you for your offer, but this donation does not align with our donation acceptance policy." Having a written donation acceptance policy turns refusal from a personal position into an institutional procedure — and this protects the team from direct pressure.\n\n**Advance caution:** before accepting corporate and institutional donations, research their public activities. An environmental charity that accepts funding from an oil company without clear guarantees will not survive the public questioning.\n\nAnd the underlying test that unites all of these cases: does accepting this donation strengthen our capacity to serve our beneficiaries, or does it constrain or distort that capacity? When the answer is the second — however large the figure — refusal is the right decision.',
          },
        },
        {
          type: 'quiz',
          id: 'ef-q7',
          label: { ar: 'سؤال ٧', en: 'Question 7' },
          question: {
            ar: 'شركة تعمل في قطاع تراه إشكالياً بيئياً تُريد "الشراكة" مع جمعيتك البيئية في حملة. ما السؤال الأهمّ قبل القرار؟',
            en: 'A company operating in a sector you consider environmentally problematic wants to "partner" with your environmental organisation in a campaign. What is the most important question before deciding?',
          },
          options: [
            { ar: 'هل هذا التعاون يُحسّن أثرها البيئي الفعلي أم يُعطيها غطاء "أخضر" دون تغيير حقيقي؟', en: 'Does this collaboration improve their actual environmental impact or give them "green" cover without real change?' },
            { ar: 'كم يدفعون، وهل يكفي المبلغ لتمويل كلّ الأنشطة التي خطّطنا لها هذا العام؟', en: 'How much do they pay, and is the amount enough to fund all of the activities we have planned for this year?' },
            { ar: 'هل لديهم حضور إعلامي يُعزّز وصول حملتنا إلى جمهور أوسع ممّا نصله عادةً؟', en: 'Do they have a media presence that extends our campaign’s reach to a wider audience than we normally get?' },
          ],
          correct: 0,
          feedback: {
            ar: 'تعاون مع جهة تستخدم اسمك لـ"غسيل" صورتها دون تغيير حقيقي في ممارساتها هو تضليل للجمهور — ويُضرّ بمصداقيتك البيئية على المدى الطويل أكثر مما يُعطيك مالياً.',
            en: 'Cooperation with an entity using your name to "launder" their image without real change in their practices is misleading the public — and harms your environmental credibility in the long run more than it gives you financially.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الفرق بين التبرّع الذي يُنقذ المشروع والتبرّع الذي يُنقذ المنظّمة — الأوّل حلّ طارئ والثاني استثمار في الاستدامة. الاعتماد على تبرّعات واحدة أو قليلة يجعل كل تغيير في أولويات المانح كارثةً وجودية. التنويع المدروس يعني بناء محفظة تمويل تتضمّن: تبرّعات فردية متكرّرة تُبني عبر التواصل المنتظم، منح مؤسّسية تتطلّب استثماراً في الوقت وجودة التقديم، شراكات محلّية مع القطاع الخاص بالتفاوض على شروط متوازنة، وعائدات من خدمات تُقدّمها المنظّمة.\n\nالقاعدة الذهبية: لا مصدر واحد يُموّل أكثر من ثلاثين بالمئة من الميزانية السنوية. ما فوق ذلك يُحوّل مانحاً واحداً إلى سلطة فعلية على قراراتك، وهذا ما تمنعه الاستدامة المالية بالدرجة الأولى.',
            en: 'The difference between a donation that saves the project and a donation that saves the organisation — the first is an emergency solution and the second is an investment in sustainability. Dependence on one or few donations turns every change in a funder\'s priorities into an existential catastrophe. Thoughtful diversification means building a funding portfolio that includes: recurring individual donations built through regular communication, institutional grants requiring an investment in time and submission quality, local partnerships with the private sector negotiated on balanced terms, and revenues from services the organisation provides.\n\nThe golden rule: no single source funds more than thirty percent of the annual budget. Above that converts a single funder into effective authority over your decisions — and this is precisely what financial sustainability primarily prevents.',
          },
        },
        {
          type: 'quiz',
          id: 'ef-q8',
          label: { ar: 'سؤال ٨', en: 'Question 8' },
          question: {
            ar: 'مانح ضخم يشترط ألا تُساعدوا مجموعة سكانية بعينها (يُعتبر شرطاً تمييزياً). التمويل ضخم وتحتاجه الجمعية. ماذا تفعل؟',
            en: 'A major donor conditions you not to serve a specific population group (considered a discriminatory condition). The funding is large and the organisation needs it. What do you do?',
          },
          options: [
            { ar: 'ارفض الشرط — قبول تمويل يشترط التمييز ينتهك مبدأ عدم التمييز الأساسي وقد يُفقدك ثقة المستفيدين والجمهور الذي يفوق قيمة التمويل', en: 'Refuse the condition — accepting funding that conditions discrimination violates the basic non-discrimination principle and may cost you beneficiary and public trust that exceeds the funding value' },
            { ar: 'قبل الشرط لأن الجمعية تحتاج التمويل لخدمة الفئات الأخرى، وهي التي ستتضرّر أكثر إن رفضتَ المبلغ كلّه ولم يبقَ برنامج', en: 'Accept the condition because the organisation needs the funding to serve other groups, who are the ones harmed most if you refuse the whole amount and no programme survives' },
            { ar: 'قبل الشرط مع التحايل عليه بطرق غير رسمية، فتخدم الفئة المستبعَدة عبر شريك آخر دون أن يظهر ذلك في التقارير', en: 'Accept the condition while circumventing it through unofficial means, serving the excluded group through another partner so it never shows in the reports' },
          ],
          correct: 0,
          feedback: {
            ar: 'التمييز في الخدمة انتهاك أساسي لمبادئ العمل الإنساني والمجتمعي. التحايل على الشرط بطريقة غير رسمية يُضيف كذباً على انتهاك. الرفض الواضح — مع شرح السبب للمانح — هو الموقف المهني والأخلاقي.',
            en: 'Discrimination in service is a fundamental violation of humanitarian and community work principles. Circumventing the condition unofficially adds dishonesty to violation. Clear refusal — with explanation of the reason to the donor — is the professional and ethical position.',
          },
        },
      ],
    },
  ],
};
