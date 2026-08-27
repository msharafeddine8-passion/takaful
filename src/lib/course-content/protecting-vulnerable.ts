import type { CourseContent } from './types';

/**
 * Level 3 — Protecting People at Risk and Safe Referral. Pass mark 80.
 *
 * Extends safeguarding beyond children to every group whose circumstances
 * make it hard to refuse, disclose, or access help: older people, people
 * with disabilities, survivors of violence, displaced people, and anyone
 * caught in a power gap. The course draws a bright line between what a
 * volunteer is expected to do (notice, record, report, refer) and what
 * they must never do (investigate, promise, decide alone).
 */

export const protectingVulnerable: CourseContent = {
  slug: 'protecting-vulnerable',
  level: 3,
  minutes: 40,
  passMark: 80,
  title: {
    ar: 'حماية الفئات المعرّضة للخطر والإحالة الآمنة',
    en: 'Protecting People at Risk and Safe Referral',
  },
  lede: {
    ar: 'أبعد من حماية الطفل: كبار السن، ذوو الإعاقة، الناجون من العنف، النازحون، وكل من لا يستطيع أن يقول لا. ومتى تُحيل بدل أن تتصرّف.',
    en: 'Beyond child safeguarding: older people, people with disabilities, survivors of violence, displaced people, and anyone who cannot say no. And when to refer rather than act.',
  },
  outcomes: {
    ar: [
      'تتعرّف على مؤشّرات الخطر لدى فئات مختلفة',
      'تُجري إحالة آمنة بموافقة الشخص وضمن حدود السرية',
      'ترفض التحقيق مع الشخص ورفض تقديم وعد لا تستطيع تنفيذه',
      'تحدّد اللحظة التي يجب فيها رفع الحالة للمشرف فوراً',
    ],
    en: [
      'Recognise risk indicators across different groups of people',
      'Make a safe referral with the person\'s consent and within the limits of confidentiality',
      'Decline to investigate, and decline to promise what you cannot deliver',
      'Identify the moment a case must go to a supervisor immediately',
    ],
  },
  sources: [
    'ICRC — Professional Standards for Protection Work (4th edition, 2018)',
    'UNHCR — Handbook for the Protection of Internally Displaced Persons (2010)',
    'IFRC — Protection Mainstreaming Guidelines for National Societies (2021)',
    'Inter-Agency Standing Committee (IASC) — Guidelines on Mental Health and Psychosocial Support in Emergency Settings (2007, updated 2020)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'pv-m1',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'مؤشّرات الخطر: كيف تتعرّف عليها', en: 'Risk Indicators: How to Recognise Them' },
      lede: {
        ar: 'المؤشّر ليس دليلاً قاطعاً على وقوع الضرر — بل هو إشارة مهمّة تستدعي الانتباه والمتابعة والإبلاغ دون تأخير.',
        en: 'An indicator is not proof that harm has occurred — it is a signal that calls for attention, follow-up and reporting.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الفئات المعرّضة للخطر ليست مجموعة محدّدة بصفة واحدة، بل هي كل شخص يجد نفسه في وضع يصعب فيه عليه رفض ما يُطلب منه، أو الإفصاح عمّا يتعرّض له، أو الوصول إلى الدعم الذي يحتاجه. قد يكون ذلك بسبب السن، أو الإعاقة، أو النوع الاجتماعي، أو الوضع القانوني، أو الاعتماد الاقتصادي على شخص بعينه، أو مزيج من هذه العوامل مجتمعةً. المتطوّع لا يُشخّص ولا يُحقّق — لكنه يلاحظ، ويُسجّل، ويُبلّغ. وهذه الوظائف الثلاث بالذات هي جوهر ما تحتاجه الحماية في أيّ سياق إنساني.\n\nالمؤشّر هو أيّ شيء لافت تلاحظه في تصرّف شخص ما، أو في ظروفه، أو في طريقة تحدّثه عن وضعه، أو في ردّ فعله على مواقف معيّنة. ليس كل مؤشّر يعني أن شيئاً سيئاً قد حدث بالفعل — ولكن وجوده يعني أن عليك أن تكون أكثر يقظة، وأن توثّق ما تراه، وأن تُبلّغ من يملك التدريب والصلاحية الكافية للتعامل مع الوضع. الوقوف عند الملاحظة دون توثيق أو إبلاغ يُفرغ دورك من معناه، بينما القفز مباشرةً إلى التصرّف قبل الإبلاغ يتجاوز صلاحياتك ويُعرّض الشخص لخطر إضافي.',
            en: 'Vulnerable groups are not defined by a single characteristic — they include any person who finds it difficult to refuse what is asked of them, to disclose what they are experiencing, or to access the support they need. This may be due to age, disability, gender, legal status, economic dependence on a specific person, or a combination of these factors together. A volunteer does not diagnose or investigate — but they observe, record, and report. These three functions are precisely the core of what protection requires in any humanitarian context.\n\nAn indicator is anything you notice that stands out in someone\'s behaviour, circumstances, the way they speak about their situation, or their reaction to particular events. Not every indicator means something bad has already happened — but its presence means you should be more alert, document what you see, and report to someone with the training and authority to handle the situation. Stopping at observation without documentation or reporting empties your role of meaning, while jumping directly to action before reporting exceeds your authority and may expose the person to additional risk.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'مؤشّرات سلوكية', en: 'Behavioural indicators' },
              text: {
                ar: 'الانسحاب المفاجئ عن الأنشطة التي كان يشارك فيها، الخوف غير المبرّر من شخص بعينه دون سبب واضح، تغيّر ملحوظ في المزاج أو الأداء على مدى أيام أو أسابيع، سلوك يتراجع عن العمر الفعلي للشخص مثل التبوّل أو التشبّث المفرط بالمتطوّع.',
                en: 'Sudden withdrawal from activities previously enjoyed, unwarranted fear of a specific person without clear reason, noticeable change in mood or performance over days or weeks, behaviour that regresses below the person\'s actual age such as bedwetting or excessive clinging to a volunteer.',
              },
            },
            {
              title: { ar: 'مؤشّرات جسدية', en: 'Physical indicators' },
              text: {
                ar: 'كدمات أو جروح لا تتوافق مع التفسير المقدَّم أو تتكرّر في مناطق غير معتادة، سوء تغذية واضح في ظل ظروف لا تستدعيه، ملابس غير ملائمة للطقس أو مخفية لأماكن غير عادية، تعب مزمن وظهور حزين دون سبب طبّي مُشخَّص.',
                en: 'Bruising or injuries inconsistent with the given explanation, or recurring in unusual areas; visible malnutrition in circumstances that do not explain it; clothing inappropriate for the weather or concealing unusual areas; persistent fatigue and sad appearance without a diagnosed medical cause.',
              },
            },
            {
              title: { ar: 'مؤشّرات ظرفية', en: 'Situational indicators' },
              text: {
                ar: 'الشخص دائماً برفقة مرافق لا يتركه يتكلّم بمفرده أو يُجيب عن أسئلته بنفسه، تغيير متكرّر في مكان السكن دون تفسير واضح، غياب متواصل عن النشاط يليه عذر مختلف في كل مرة، وجود ديون ضخمة تجعله يعمل في ظروف لا يقبلها باختياره.',
                en: 'Always accompanied by someone who does not allow them to speak alone or answer questions themselves; frequent unexplained changes of residence; persistent absences from the activity followed by a different excuse each time; large debts that force them into working conditions they would not freely accept.',
              },
            },
            {
              title: { ar: 'مؤشّرات تواصلية', en: 'Communication indicators' },
              text: {
                ar: 'يبدأ بالحديث عن مخاوف ثم يتراجع عنها فجأة، يُفصح بصيغة مبهمة ثم يقول «لا شيء، كنت أمزح»، يستفسر عن حقوقه بطريقة غير مباشرة كأنه يسأل «لصديق»، يتجنّب الإجابة عن أيّ سؤال يخصّ بيته أو عائلته أو وضعه المالي.',
                en: 'Begins talking about concerns then withdraws abruptly; discloses in vague terms then says "nothing, I was joking"; asks about their rights indirectly as if asking "for a friend"; avoids answering any question relating to their home, family, or financial situation.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'ما يُلاحَظ يُسجَّل — لا يُحكَم عليه', en: 'What you notice is recorded — not judged' },
          content: {
            ar: 'دورك ليس البتّ في ما إذا كان الشخص يتعرّض للأذى فعلاً. دورك أن تصف ما رأيته بكلمات محدّدة وتوقيت محدّد، من دون إضافة تفسير أو حكم. «في يوم الاثنين الماضي لاحظت أن سامي يتحاشى الجلوس قرب أحمد، ويبدو متوتّراً كلما دخل الأخير إلى الغرفة» — هذا الوصف، حين يُضاف إلى ملاحظات آخرين، يساعد المختصّ على تكوين صورة كاملة. حكمك الشخصي — «أنا أظنّ أن...» أو «أنا متأكّد أن...» — أقل فائدة هنا بكثير من الوصف الدقيق للوقائع كما حدثت.',
            en: 'Your role is not to decide whether the person is actually being harmed. Your role is to describe what you saw in specific words at a specific time, without adding interpretation or judgement. "Last Monday I noticed that Sami avoided sitting near Ahmad and appeared tense whenever Ahmad entered the room" — that description, added to others\' observations, helps the specialist build a complete picture. Your personal judgement — "I think that..." or "I am certain that..." — is far less useful here than a precise description of events as they occurred.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'التوثيق الجيّد يحمل خصائص محدّدة: يذكر التاريخ والوقت والمكان، يستخدم الكلمات الحرفية للشخص حين يقتبس ما قاله، يصف السلوك لا يفسّره، ولا يتضمّن استنتاجات حول النيّة أو السبب. «قالت فاطمة في الساعة الثالثة والنصف: لا أريد أن أعود للبيت» — هذا توثيق. «قالت فاطمة إنها خائفة من زوجها» — هذا تفسير لم تقله هي بهذه الكلمات. الفرق بين الاثنين قد يكون الفرق بين معلومة تفيد التحقيق لاحقاً ومعلومة تُشوّشه.\n\nاحتفظ بتوثيقك في المكان الذي تحدّده المنظمة لهذا الغرض، ولا تتركه في هاتفك الشخصي أو تُشاركه مع أحد خارج دائرة الإبلاغ الرسمية. السرية تبدأ من لحظة الكتابة الأولى.\n\nومن أهم ما يجب مراعاته أن المؤشّرات لا تُقرأ بمعزل عن السياق. كدمة واحدة وتفسير مقبول قد لا تستدعي إجراءً فورياً. أما الكدمات المتكرّرة مع تغيّر في السلوك وغياب عن الأنشطة وتجنّب التحدّث أمام شخص بعينه — فهذه مجتمعةً صورة مختلفة تماماً. التوثيق المتراكم عبر الزمن هو ما يُوضح هذه الأنماط ويُتيح للمختصّين رؤيتها. مهمّتك ليست تفسير كل مؤشّر على حدة — بل التقاطه وتسجيله بأمانة وإيصاله.',
            en: 'Good documentation has specific characteristics: it includes the date, time and place; uses the person\'s exact words when quoting what they said; describes behaviour rather than interpreting it; and contains no conclusions about intention or cause. "Fatima said at three-thirty: I don\'t want to go home" — that is documentation. "Fatima said she is afraid of her husband" — that is an interpretation she did not state in those words. The difference between the two may be the difference between information that helps a later inquiry and information that distorts it.\n\nKeep your documentation in the place the organisation designates for this purpose, and do not leave it on your personal phone or share it with anyone outside the formal reporting chain. Confidentiality begins from the first moment of writing.\n\nOne thing matters above all the rest: indicators are not read in isolation from their context. A single bruise with a plausible explanation may call for no immediate action. Repeated bruises alongside a change in behaviour, absence from activities, and avoiding speaking in front of one particular person — those together are an entirely different picture. It is documentation accumulated over time that makes such patterns visible and lets specialists see them. Your task is not to interpret each indicator on its own. It is to notice it, record it faithfully, and pass it on.',
          },
        },
        {
          type: 'quiz',
          id: 'pv-q1',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'لاحظت أن فاطمة، إحدى مستفيدات النشاط، تظهر بكدمات متكرّرة على ذراعيها وتقول دائماً إنها سقطت. ما الخطوة الصحيحة؟',
            en: 'You notice that Fatima, one of the activity beneficiaries, repeatedly appears with bruising on her arms and always says she fell. What is the right step?',
          },
          options: [
            { ar: 'تسألها بشكل مباشر عمّا يجري في بيتها حتى تعرف الحقيقة وتتمكّن من مساعدتها بنفسك دون تأخير', en: 'Ask her directly what is going on at home so you can learn the truth and help her yourself without delay' },
            { ar: 'تُسجّل ملاحظاتك بالتفصيل وتُبلّغ المشرف في نفس اليوم', en: 'Record your observations in detail and report to the supervisor the same day' },
            { ar: 'تنتظر تكرار الأمر مرّة ثالثة قبل التصرّف حتى تكون متأكّداً من أنّ ما تراه ليس مجرّد صدفة', en: 'Wait for it to happen a third time before acting so you can be certain that what you are seeing is not just coincidence' },
            { ar: 'تتحدّث مع صديقاتها لتعرف ما يعرفنه', en: 'Talk to her friends to find out what they know' },
          ],
          correct: 1,
          feedback: {
            ar: 'التحقيق المباشر قد يضع المستفيدة في خطر إذا علم مسبّب الأذى أنها أُسئلت، وهو ليس دورك بأيّ حال. الانتظار حتى المرّة الثالثة يضيّع وقتاً قد يكون فارقاً في سلامتها. والحديث مع صديقاتها انتهاك للخصوصية وقد يُوصل المعلومة إلى جهات خاطئة. التوثيق الدقيق والإبلاغ للمشرف هما الخطوة المناسبة: أنت تمتلك الملاحظة، والمشرف يمتلك التدريب والصلاحية للتصرّف.',
            en: 'Direct questioning can endanger the beneficiary if the source of harm learns she was asked — and it is not your role in any case. Waiting until a third time wastes time that may be critical to her safety. Speaking with her friends violates privacy and may pass information to the wrong people. Precise documentation and reporting to the supervisor are the correct steps: you hold the observation, and the supervisor holds the training and authority to act.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'pv-m2',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'من هم الأكثر عرضة للخطر؟', en: 'Who Is Most at Risk?' },
      lede: {
        ar: 'الخطر لا يُوزَّع بالتساوي — بعض الناس يجدون أنفسهم في مواقف يصعب فيها قول لا، وهذا بالذات ما يجعلهم بحاجة إلى الحماية.',
        en: 'Risk is not distributed equally — some people find themselves in situations where saying no is very difficult, and that is precisely what makes them need protection.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التحدّث عن «الفئات الهشّة» أو «الأكثر عرضة للخطر» لا يعني أن هؤلاء الأشخاص ضعفاء بطبيعتهم أو يفتقرون إلى الكفاءة — بل يعني أن الظروف المحيطة بهم تُفرز عقبات حقيقية تجعل من الصعب عليهم الدفاع عن أنفسهم أو الوصول إلى الدعم المتاح بالطريقة التي يستطيعها غيرهم. كبير السن الذي يعتمد على ابنه في الانتقال والرعاية الطبية والاحتياجات اليومية، والمرأة التي لا تملك وثائق قانونية مستقلّة ويتحكّم زوجها في دخلها، والشخص ذو الإعاقة الذي يحتاج مساعدة في الحركة والتواصل — كلهم قادرون على أن يعبّروا عن رأيهم ورفضهم، لكنهم يواجهون عقبات هيكلية وموازين قوى غير متكافئة تحول دون ذلك في مواقف كثيرة.\n\nالمتطوّع الذي يعمل مع هذه الفئات يحتاج إلى أن يُقلّص الفجوة في موازين القوى في التعامل: أن يتحدّث مع الشخص على انفراد حين يكون ذلك آمناً وممكناً، وأن لا يُلحّ في الأسئلة التي تُشعره بالضغط، وأن يتذكّر أن ما يُقال في غياب المرافق قد يكون مختلفاً جوهرياً عمّا يُقال أمامه. خلق مساحة آمنة للشخص ليتحدّث دون مراقبة ليس ترفاً — بل هو غالباً الشرط الأوّل لأيّ إفصاح حقيقي.\n\nمن الأخطاء الشائعة أيضاً افتراض أن الشخص الهادئ أو المبتسم «بخير»، وأن من يشكو صريحاً هو الوحيد الذي يحتاج المساعدة. في كثير من السياقات الثقافية، يُعدّ التعبير عن المشكلة للغريب خيانةً للأسرة أو إضعافاً للنفس — لذلك يكون الشخص الأكثر خطراً هو من لا يُظهر شيئاً. التعامل مع هذه الفئات يتطلّب الانتباه إلى ما لا يُقال بقدر ما تنتبه إلى ما يُقال.',
            en: 'Talking about "vulnerable groups" or those "most at risk" does not mean these people are inherently weak or lack capability — it means that the circumstances surrounding them create real obstacles that make it hard for them to advocate for themselves or access available support in the way others can. An older person wholly dependent on their child for transport, medical care and daily needs; a woman with no independent legal documents whose husband controls her income; a person with a disability who needs assistance with movement and communication — all are capable of expressing their views and refusals, but they face structural obstacles and unequal power dynamics that prevent this in many situations.\n\nA volunteer working with these groups needs to reduce the power gap in interactions: speaking with the person alone when it is safe and possible to do so; not pressing with questions that make them feel pressured; and remembering that what is said in the companion\'s absence may be fundamentally different from what is said in their presence. Creating a safe space for the person to speak without surveillance is not a luxury — it is often the first condition for any genuine disclosure.\n\nAnother common error is assuming that the quiet or smiling person is "fine", and that whoever complains openly is the only one who needs help. In many cultural settings, telling a stranger about a problem counts as a betrayal of the family or as making yourself weak — so the person in the most danger is often the one showing nothing at all. Working with these groups asks you to attend to what is not being said as closely as to what is.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'كبار السن: قد يُقلّلون من حدّة ما يتعرّضون له خوفاً من العار على الأسرة أو الانفصال عن أطفالهم، وقد لا يُصدَّقون حين يتكلّمون، وكثيراً ما يُعزَى تغيّر مزاجهم المفاجئ إلى «الشيخوخة» دون تحقيق',
              'ذوو الإعاقة: قد يعتمدون على مسبّب الأذى ذاته في الرعاية الأساسية كالاستحمام والأكل والدواء، مما يجعل الإفصاح قراراً بالغ الخطورة لأن تبعاته المباشرة قد تشمل فقدان الرعاية التي يحتاجونها',
              'الناجون من العنف الجنسي: غالباً يتكلّمون بأسلوب غير مباشر في البداية أو يُفصحون بصورة جزئية ثم يتراجعون بسبب الخوف أو الخجل أو الضغط الأسري أو الخوف من عدم التصديق',
              'الأطفال العاملون والنازحون وغير المصحوبين: عرضة بشكل مضاعف لشبكات الاستغلال والاتجار، وكثيراً ما لا يعرفون أن ما يحدث لهم مخالف للقانون أو حتى أنه غير مقبول لأنه مألوف في محيطهم',
              'الأشخاص بلا وضع قانوني أو بوضع غير نظامي: خوفهم من الترحيل أو الملاحقة القانونية يجعلهم يتحاشون التبليغ عن أيّ شيء ويقبلون بأوضاع إساءة صارخة لأنهم يرون أن لا خيار أمامهم سوى الصمت',
              'النساء في سياقات النزاع والنزوح: يواجهن مخاطر مضاعفة في بيئات مكتظّة أو غير آمنة، وكثيراً ما تُقيَّد حريّتهن في التنقّل مما يحول دون وصولهن إلى خدمات الدعم حتى لو عرفن وجودها',
            ],
            en: [
              'Older people: may minimise what they experience for fear of family shame or separation from their children; may not be believed when they speak; and changes in their mood are often attributed to "age" without investigation',
              'People with disabilities: may depend on the very person causing harm for basic care such as bathing, eating and medication — making disclosure an extremely dangerous decision, since its immediate consequences may include losing the care they need',
              'Survivors of sexual violence: often speak indirectly at first or disclose partially then withdraw, due to fear, shame, family pressure, or fear of not being believed',
              'Child labourers, displaced and unaccompanied children: doubly exposed to exploitation and trafficking networks, and often do not know that what is happening to them is unlawful or even unacceptable because it is familiar in their environment',
              'People without legal status or in irregular situations: fear of deportation or prosecution leads them to avoid reporting anything and to accept blatantly abusive conditions because they see no alternative but silence',
              'Women in conflict and displacement contexts: face compounded risks in crowded or unsafe environments, and their freedom of movement is often restricted in ways that prevent them accessing support services even when they know these exist',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'الإعاقة لا تعني الموافقة ولا تلغي أهليّة القرار', en: 'Disability does not mean consent and does not remove decision-making capacity' },
          content: {
            ar: 'من أكثر الأخطاء الشائعة في التعامل مع ذوي الإعاقة الافتراض بأن الشخص يقبل بأوضاع معيّنة لأن «ليس عنده خيار» أو لأنه «معتاد على هذا». الإعاقة — سواء كانت جسدية أو حسية أو ذهنية — لا تلغي أهليّة الشخص في اتّخاذ القرار ولا تُضعف حقّه القانوني والأخلاقي في رفض ما لا يريده. ما يختلف في الغالب هو موازين القوى في محيطه وليس قدرته الجوهرية على الموافقة أو الرفض. تعامَل مع كل شخص ذي إعاقة باعتباره صاحب رأي ومُتّخذ قرار بالتعاون معه لا بدلاً عنه. وحين تلاحظ مؤشّرات خطر لدى شخص ذي إعاقة، تذكّر أن الإبلاغ عنه يستلزم حرصاً إضافياً على عدم تعريضه لفقدان مقدّم الرعاية — وهذا بالضبط ما يُطرح مع المشرف لا ما يُقرّر بمفردك.',
            en: 'One of the most common errors in working with people with disabilities is assuming that the person accepts certain conditions because "they have no choice" or are "used to it." Disability — whether physical, sensory or intellectual — does not remove a person\'s decision-making capacity or weaken their legal and ethical right to refuse what they do not want. What usually differs is the balance of power in their environment, not their fundamental capacity to consent or refuse. Treat every person with a disability as someone with views and decisions to make, working with them rather than in their place. And when you notice risk indicators in a person with a disability, remember that reporting takes additional care not to expose them to the loss of their carer — which is exactly the kind of thing to raise with your supervisor rather than decide on your own.',
          },
        },
        {
          type: 'quiz',
          id: 'pv-q2',
          label: { ar: 'سيناريو', en: 'Scenario' },
          scenario: {
            ar: 'في نشاط لكبار السن، لاحظت أن السيد يوسف (٧٥ عاماً) يبدو متوتّراً كلّما كان ابنه حاضراً، ويرفض الإجابة على أيّ سؤال يخصّ صحّته أو احتياجاته إذا كان الابن في الغرفة. حين قابلته وحده، بدأ يتكلّم ثم توقّف وقال: «بخير، شكراً».',
            en: 'At an older adults\' activity, you notice that Mr Yusuf (75) appears tense whenever his son is present and refuses to answer any question about his health or needs when his son is in the room. When you met him alone, he began to speak then stopped and said: "I\'m fine, thank you."',
          },
          question: {
            ar: 'ما الذي يجب فعله؟',
            en: 'What should you do?',
          },
          options: [
            {
              ar: 'تقبّل قوله «بخير» وتمضي، فهو بالغ راشد ويستطيع الاعتراض بنفسه إذا أراد ولا تُفرض المساعدة على أحد مهما بدت ملاحظاتك مقلقة',
              en: 'Accept his "I\'m fine" and move on — he is an adult who can object if he wants to, and help is not to be forced on anyone however worrying your observations look',
            },
            {
              ar: 'تسأل الابن مباشرةً عن طبيعة علاقته مع والده وعن سبب توتّر والده في حضوره',
              en: 'Ask the son directly about the nature of his relationship with his father and why his father tenses when he is there',
            },
            { ar: 'توثّق ما لاحظته بدقّة، تُبلّغ المشرف، وتحرص على أن يتضمّن كل لقاء قادم وقتاً منفرداً مع السيد يوسف حين يكون ذلك ممكناً', en: 'Document what you observed precisely, report to the supervisor, and ensure every future meeting includes time alone with Mr Yusuf when possible' },
            {
              ar: 'تتّصل بخدمات حماية المسنّين مباشرةً الآن دون إخبار مشرفك، فالوقت ثمين والمسار الرسمي أسرع من التسلسل الداخلي في مثل هذه الحالات',
              en: 'Contact older adults\' protection services directly now without informing your supervisor — time matters and the official route is faster than the internal chain in cases like this',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'قبول «بخير» في هذا السياق يتجاهل مؤشّرات واضحة على الخوف وعدم الاستعداد للإفصاح أمام المرافق. والسؤال المباشر للابن يُعرّض السيد يوسف للخطر إن كان الابن هو مصدر المشكلة. الاتصال المباشر بالخدمات قبل إبلاغ مشرفك يتجاوز صلاحياتك ويُخلّ بتسلسل الإبلاغ الداخلي للمنظمة. الخطوة الصحيحة هي التوثيق الدقيق والإبلاغ للمشرف الذي يملك أدوات المتابعة وصلاحية التصعيد الآمن.',
            en: 'Accepting "I\'m fine" in this context ignores clear indicators of fear and unwillingness to disclose in the companion\'s presence. Asking the son directly puts Mr Yusuf at risk if the son is the source of the problem. Contacting services directly before informing your supervisor exceeds your authority and disrupts the organisation\'s internal reporting chain. The correct step is precise documentation and reporting to the supervisor, who holds the follow-up tools and authority for safe escalation.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'pv-m3',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'الإحالة الآمنة: الموافقة والسرية', en: 'Safe Referral: Consent and Confidentiality' },
      lede: {
        ar: 'الإحالة ليست مجرّد إعطاء رقم هاتف أو اسم جهة — بل هي عملية كاملة تبدأ بموافقة الشخص الحقيقية وتُراعي سلامته في كل خطوة حتى اللحظة التي تتّصل فيها الجهة المُحال إليها فعلاً.',
        en: 'A referral is not just giving someone a phone number or an organisation name — it is a complete process that begins with the person\'s genuine consent and considers their safety at every step until the referral organisation actually makes contact.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الإحالة الآمنة تعني ربط الشخص بالخدمة أو الجهة التي تستطيع مساعدته بطريقة لا تعرّضه لمزيد من الخطر ولا تنتهك ثقته بك وبالمنظمة. وهي تبدأ دائماً بسؤال واحد: هل هذا الشخص يريد أن يُحال؟ موافقته ليست مجرّد إجراء شكلي — هي أساس العملية كلّها وضمانة شرعيّتها. الشخص الذي يُحال دون موافقته قد يتعرّض للخطر إذا وصلت معلوماته إلى جهات لا يثق بها أو لا يعرفها، وقد يفقد ثقته بالمنظمة ككل فلا يتقدّم للمساعدة مجدّداً حين يحتاجها.\n\nوالموافقة لا تعني مجرّد قول «نعم» حين تُسأل سؤالاً مباشراً. إنها تتطلّب أن يفهم الشخص إلى أين يُحال، وماذا تفعل تلك الجهة تحديداً، وما المعلومات التي ستُشارَك عنه، ومن سيطّلع عليها، وهل يستطيع سحب موافقته لاحقاً. فقط بعد هذا الفهم الواضح تصبح الموافقة حقيقية ومعتبَرة. الموافقة المبنية على نقص المعلومات ليست موافقة فعلية — هي قبول ناشئ عن غياب البدائل الواضحة.',
            en: 'A safe referral means connecting a person to the service or organisation that can help them, in a way that does not expose them to further risk or violate their trust in you and the organisation. It always begins with a single question: does this person want to be referred? Their consent is not a formality — it is the foundation of the entire process and the guarantee of its legitimacy. Someone referred without their consent may be exposed to risk if their information reaches organisations they do not trust or know, and may lose faith in the organisation entirely so that they never seek help again when they need it.\n\nConsent does not mean simply saying "yes" when directly asked. It requires the person to understand where they are being referred to, what that organisation specifically does, what information will be shared about them, who will have access to it, and whether they can withdraw their consent later. Only after this clear understanding does consent become genuine. Consent based on incomplete information is not real consent — it is acceptance arising from the absence of clear alternatives.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'استمع إلى ما يقوله الشخص دون مقاطعة أو استعجال لتعرف ما يحتاجه فعلاً',
              'أخبره بوضوح بالخدمات المتاحة وما تفعله كل منها في جملتين مفهومتين',
              'اسأله إذا كان يريد أن تساعده في الوصول إلى إحداها — ولا تفترض الإجابة',
              'إذا وافق، اسأل تحديداً عن المعلومات التي يأذن لك بمشاركتها مع الجهة المُحال إليها',
              'تحقّق معه أن طريقة التواصل مع الجهة آمنة في بيئته: هل يستطيع تلقّي مكالمات على هاتفه؟ هل يريد استخدام اسم مستعار؟ هل هناك مكان آمن يمكنه استقبال زيارة فيه؟',
              'تابع معه بعد الإحالة: هل تواصلت الجهة معه؟ هل وصل إلى الخدمة؟ هل يشعر بالأمان في هذه اللحظة؟',
            ],
            en: [
              'Listen to what the person says without interrupting or rushing, to understand what they actually need',
              'Explain clearly what services are available and what each does in two comprehensible sentences',
              'Ask whether they would like your help reaching one of these services — do not assume the answer',
              'If they agree, ask specifically what information they authorise you to share with the referral organisation',
              'Check that the method of contact with the organisation is safe in their environment: can they receive calls on their phone? do they want to use a pseudonym? is there a safe place they could receive a visit?',
              'Follow up after the referral: did the organisation contact them? did they reach the service? do they feel safe right now?',
            ],
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'إحالة آمنة', en: 'Safe referral' },
          noTitle: { ar: 'إحالة تُنشئ خطراً', en: 'Referral that creates risk' },
          yes: {
            ar: [
              'تخبر الشخص بكل ما تعرفه عن الجهة قبل أن تُحيله',
              'تسأل عن المعلومات التي يأذن لك بمشاركتها تحديداً',
              'تتحقّق أن طريقة الاتصال بالجهة آمنة في حياته اليومية',
              'تتابع ما إذا كانت الإحالة قد نجحت وإذا كان بأمان',
            ],
            en: [
              'Tell the person everything you know about the organisation before referring them',
              'Ask specifically what information they authorise you to share',
              'Verify that the means of contact is safe in their daily life',
              'Follow up on whether the referral succeeded and whether they are safe',
            ],
          },
          no: {
            ar: [
              'ترسل معلوماته إلى الجهة دون إخباره بذلك',
              'تشارك اسمه وعنوانه الكاملَين تلقائياً دون أن تسأل',
              'تعطيه رقم هاتف وتُنهي المحادثة دون متابعة',
              'تُبلّغ أهله أو مرافقه بتفاصيل الإحالة دون إذنه',
            ],
            en: [
              'Send their details to the organisation without telling them',
              'Automatically share their full name and address without asking',
              'Give them a phone number and end the conversation without follow-up',
              'Tell their family or companion the details of the referral without permission',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'السرية في سياق الحماية لها معنى محدّد وعملي: أنت لا تُفصح عن معلومات الشخص لأيّ طرف لم يأذن بمشاركتها معه، بما في ذلك أفراد الأسرة المقرّبين والزملاء في الفريق من خارج دائرة الإبلاغ والمجتمع المحيط. هذا حتى لو كانت نيّتك حسنة تماماً وحتى لو اعتقدت أن الإفصاح سيفيد الشخص. الاستثناء الوحيد هو حين تكون حياة الشخص أو حياة آخرين في خطر مباشر وحيّ — وحتى في هذه الحالة، تُبلّغ المشرف أوّلاً ولا تتصرّف بمفردك دون توجيه.\n\nالسرية ليست قيداً يمنعك من المساعدة — بل هي تحديداً ما يجعل الإنسان يثق بك بما يكفي لأن يطلب المساعدة من الأساس. منظمة يُشاع أن المتطوّعين فيها يُخبرون الأهل بما يُقال لهم منظمةٌ لا أحد يُفصح فيها عن شيء حقيقي.\n\nمن الأسئلة التي يطرحها المتطوّعون كثيراً: «هل يجوز أن أُخبر زميلتي في الفريق حتى تُساعدني في التعامل مع الحالة؟». الجواب أن مشاركة المعلومة مع أيّ شخص آخر — حتى لو كان متطوّعاً في المنظمة نفسها — تحتاج إلى إذن الشخص المعني وتسلسل إبلاغ واضح. الاستشارة العشوائية مع الزميلة، حتى بنيّة المساعدة، هي انتهاك للسرية. ما تستطيع فعله هو سؤال المشرف: «لديّ وضع أريد استشارتك فيه» — وهو من يقرّر كيف تسير المعلومة بعد ذلك.',
            en: 'Confidentiality in a protection context has a specific and practical meaning: you do not disclose a person\'s information to any party they have not authorised, including close family members, team colleagues outside the reporting chain, and the surrounding community. This applies even when your intention is entirely good and even when you believe disclosure would benefit the person. The only exception is when the person\'s life or the lives of others is in immediate and present danger — and even then, you inform your supervisor first and do not act alone without guidance.\n\nConfidentiality is not a constraint preventing you from helping — it is precisely what makes a person trust you enough to ask for help in the first place. An organisation where it becomes known that volunteers tell families what is said to them is an organisation where nobody discloses anything real.\n\nVolunteers often ask: "May I tell my teammate, so she can help me handle the case?" The answer is that sharing the information with anybody else — even a volunteer in the same organisation — needs the person\'s permission and a clear reporting line. Talking it over informally with a colleague, even meaning to help, is a breach of confidentiality. What you can do is go to your supervisor and say "I have a situation I want your advice on" — and it is then their decision how the information travels.',
          },
        },
        {
          type: 'quiz',
          id: 'pv-q3',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'أخبرتك نور أنها تريد المساعدة في الوصول إلى ملجأ للنساء، لكنها طلبت منك بإلحاح ألّا تُخبر أخاها الذي يوصّلها إلى النشاط. ما الذي تفعله؟',
            en: 'Nour told you she wants help accessing a women\'s shelter, but urgently asked you not to tell her brother who drives her to the activity. What do you do?',
          },
          options: [
            { ar: 'تتّصل بالملجأ الآن وتعطيهم اسمها وعنوانها الكاملَين لتسريع الأمر، قبل أن تتراجع أو يتغيّر وضعها في البيت أو يمتلئ المكان ويضيع عليها', en: 'Call the shelter now and give them her full name and home address to speed things up, before she changes her mind, or her situation at home shifts, or the shelter fills up and the place is gone' },
            { ar: 'تُخبر الأخ لأن سلامتها مسؤوليته بحكم القرابة', en: 'Tell her brother because her safety is his responsibility by virtue of family ties' },
            { ar: 'تتّبع توجيهاتها: تنسّق مع الملجأ بالمعلومات التي أذنت بها فقط، وتتحقّق معها من طريقة التواصل الأكثر أماناً في وضعها', en: 'Follow her direction: coordinate with the shelter using only the information she has authorised, and confirm with her the safest means of contact given her situation' },
            { ar: 'تعتذر وتقول إن المنظمة لا تعمل في مثل هذه الحالات، وتنصحها بأن تبحث بنفسها عن جهة مختصّة لأنّ تدخّلك قد يزيد الأمر تعقيداً عليها', en: 'Apologise and say the organisation does not handle such cases, advising her to look for a specialist body herself since your involvement might only complicate things further for her' },
          ],
          correct: 2,
          feedback: {
            ar: 'إعطاء الاسم والعنوان الكاملَين دون إذن انتهاك صريح للموافقة وقد يعرّضها لخطر جسيم. وإخبار الأخ — بغضّ النظر عن نيّتك — هو بالضبط ما طلبت منك عدم فعله، وقد يكون هو مصدر الخطر في حياتها. والاعتذار يتركها دون مساعدة في لحظة هشّة طلبت فيها. الموافقة الحقيقية تعني إشراكها في كل خطوة: ماذا تُقول، لمن تقوله، وعبر أيّ وسيلة.',
            en: 'Sharing her full name and address without permission is a direct violation of consent and may expose her to serious risk. Telling her brother — regardless of your intention — is exactly what she asked you not to do, and he may be the source of risk in her life. Refusing leaves her without help at a vulnerable moment when she asked for it. Genuine consent means involving her in every step: what you say, to whom you say it, and by what means.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'pv-m4',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'لا تُحقّق ولا تَعِد', en: 'Do Not Investigate, Do Not Promise' },
      lede: {
        ar: 'أكثر ما يضرّ بمستفيد في وضع هشّ هو متطوّع بنيّة حسنة يخطو خطوات لم يُدرَّب عليها ولا تدخل في صلاحيّاته، لأن النيّة الحسنة وحدها لا تحمي من الأثر السيّئ.',
        en: 'What most harms a beneficiary in a vulnerable position is a well-intentioned volunteer taking steps they were not trained for and that fall outside their authority.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين يُفصح شخص عن شيء مؤلم، تكون الاستجابة الطبيعية الأولى أن تفهم أكثر، أن تسأل عن التفاصيل التي تبدو ناقصة، وأن تُطمئنه بأنك ستحلّ الأمر أو ستضمن أن يُحاسَب المسؤول. هاتان الاستجابتان — التحقيق والوعد — هما من أكثر الأخطاء تكراراً في العمل التطوّعي مع الفئات المعرّضة للخطر، وكلتاهما قادرتان على إلحاق الضرر بالشخص بدلاً من حمايته، حتى حين تنبعان من أكثر النيّات صدقاً.\n\nالتحقيق بمعناه هنا هو طرح أسئلة تفصيلية عن الحادثة أو الأشخاص المتورّطين أو التسلسل الزمني للأحداث، بنيّة بناء صورة أوضح عمّا جرى. المشكلة أن أسئلتك قد تُذكّر الشخص بتفاصيل مؤلمة لم يكن مستعدّاً للعودة إليها في هذه اللحظة، وأن إجاباته قد تتأثّر بما تُلمّح إليه أسئلتك فتختلط ذاكرته بتوقّعاتك، وأن الشخص الذي تسأل عنه قد يعلم بذلك فيتّخذ إجراءات وقائية ضدّ من أخبرك أو يُغيّر روايته. والأخطر من كل ذلك أن تحقيقاً غير منهجي من قبل متطوّع قد يُفسد لاحقاً إجراءات تحقيق رسمية يُجريها مختصّون.',
            en: 'When someone discloses something painful, the first natural response is to want to understand more, ask about the details that seem missing, and reassure them that you will resolve the matter or ensure whoever is responsible is held accountable. These two responses — investigation and promises — are among the most repeated errors in volunteer work with at-risk groups, and both are capable of harming the person rather than protecting them, even when they spring from the most sincere of intentions.\n\nInvestigation here means asking detailed questions about the incident, the people involved or the timeline of events, intending to build a clearer picture. The problem is that your questions may remind the person of painful details they were not ready to return to at that moment; their answers may be influenced by what your questions imply, blending their memory with your expectations; and the person you are asking about may learn of this and take protective action against whoever told you or change their account. Most dangerously, an unsystematic investigation by a volunteer may later undermine formal investigative procedures conducted by professionals.',
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'أسئلة لا تُطرح أبداً', en: 'Questions never to ask' },
          content: {
            ar: 'لا تسأل: «لماذا لم تُخبر أحداً من قبل؟» — هذا لوم مُقنَّع يُحمّل الشخص المسؤولية. لا تسأل: «هل أنتِ متأكّدة تماماً ممّا حدث؟» — هذا تشكيك يُهزّ ثقته بذاكرته. لا تسأل: «من فعل هذا بالضبط وأين وكم مرة وما الذي فعله تحديداً؟» — هذا تحقيق ليس من صلاحيّاتك وقد يُسبّب ضرراً. دورك أن تُتيح للشخص أن يقول ما يريد قوله بوتيرته هو — لا أن تستخرج منه ما تحتاج أنت لمعرفته.\n\nوتذكّر أن الصمت من الشخص بعد إفصاح جزئي ليس رفضاً — بل قد يكون اختباراً لمدى أمان التحدّث معك. الاستجابة الصحيحة للصمت هي الصبر واستخدام جملة بسيطة مثل: «أنا هنا إذا أردت الاستمرار. لا ضغط.» وليس طرح سؤال جديد يملأ الصمت بالطريقة التي تريدها أنت.',
            en: 'Never ask: "Why didn\'t you tell anyone before?" — that is disguised blame that places responsibility on the person. Never ask: "Are you completely certain about what happened?" — that is doubt that shakes their trust in their own memory. Never ask: "Who exactly did this, and where, and how many times, and what precisely did they do?" — that is an investigation outside your authority that may cause harm. Your role is to allow the person to say what they want to say at their own pace — not to extract from them what you need to know.\n\nAnd remember that silence after a partial disclosure is not a refusal. It may be a test of how safe you are to talk to. The right response to silence is patience and a simple sentence — "I am here if you want to go on. There is no pressure." — rather than a new question that fills the silence the way you would like it filled.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الوعد الذي لا تستطيع تنفيذه ضرر مزدوج: يُعطي الشخص أملاً كاذباً في وقت تكون فيه حاجته إلى الحقيقة والواقعية لا تقلّ عن حاجته إلى الأمل، ويُضعف ثقته بك وبالمنظمة حين لا يتحقّق ما وعدته به. أكثر الوعود خطورةً في هذا السياق هي:\n\n«سأضمن أن هذا لن يتكرّر» — لا أحد يستطيع ضمان ذلك بلا تحقيق وإجراءات رسمية لم تبدأ بعد.\n«سيُعاقَب من فعل هذا» — أنت لا تملك هذه الصلاحية ولم تسمع إلّا روايةً واحدة.\n«لن يعلم أحد بما قلته» — السرية المطلقة غير ممكنة في إطار مؤسسي، وقد تكون الحياة في خطر يستدعي الكسر الاستثنائي للسرية.\n«ستُحلّ المشكلة بسرعة» — عمليات الحماية تستغرق وقتاً لا تتحكّم فيه ولا تستطيع التنبّؤ بمساره.\n\nما تستطيع قوله بصدق ودون وعد كاذب: «أنا أصدّقك. سأُسجّل ما أخبرتني به وأُوصله إلى من يملك التدريب والصلاحية للمساعدة. سأُبقيك على اطّلاع بما أستطيع مشاركته معك.» هذه الجملة أكثر قيمةً بكثير من وعد كبير لا تستطيع تنفيذه.',
            en: 'A promise you cannot keep causes double harm: it gives the person false hope at a time when their need for truth and realism is no less than their need for hope; and it undermines their trust in you and the organisation when what you promised does not come about. The most dangerous promises in this context are:\n\n"I will make sure this never happens again" — nobody can guarantee that without an investigation and formal procedures that have not yet begun.\n"The person who did this will be punished" — you do not have this authority and have heard only one account.\n"No one will know what you told me" — absolute confidentiality is not possible within an institutional framework, and life may be at risk requiring exceptional breach of confidentiality.\n"This will be resolved quickly" — protection processes take time you cannot control and cannot predict.\n\nWhat you can truthfully say without making false promises: "I believe you. I will record what you have told me and bring it to those who have the training and authority to help. I will keep you informed of what I am able to share." That sentence is far more valuable than a large promise you cannot deliver.',
          },
        },
        {
          type: 'quiz',
          id: 'pv-q4',
          label: { ar: 'سيناريو', en: 'Scenario' },
          scenario: {
            ar: 'أخبرك خالد (١٦ عاماً) أن أحد المشرفين في المخيم يضغط عليه ويهدّده بأن يطرده إذا لم يُعطه مبالغ من المال. بدأ خالد يبكي وقال: «وعدني شخص قبلك أنه سيُساعدني ولم يفعل شيئاً.»',
            en: 'Khalid (16) tells you that one of the camp supervisors pressures him and threatens to expel him if he does not hand over money. Khalid began to cry and said: "Someone before you promised they would help me and did nothing."',
          },
          question: {
            ar: 'ما الردّ الصحيح؟',
            en: 'What is the correct response?',
          },
          options: [
            { ar: 'تقول: «سأتأكّد أن هذا المشرف يُطرد»، لأن خالد يحتاج أن يرى أنك جادّ', en: 'Say: "I will make sure this supervisor is dismissed" — because Khalid needs to see that you are serious' },
            { ar: 'تسأله عن تفاصيل أكثر: كم مرة، وكم المبلغ، وأمام من — لتبني قضية أقوى', en: 'Ask him for more details: how many times, how much money, and in front of whom — to build a stronger case' },
            { ar: 'تقول: «أصدّقك. لن أعدك بما لا أستطيع تنفيذه، لكنني سأُسجّل ما قلته وأُوصله للمشرف الذي يملك صلاحية التصرّف. سأُخبرك بما يحدث.»', en: 'Say: "I believe you. I will not promise what I cannot deliver, but I will record what you\'ve told me and bring it to the supervisor who has the authority to act. I will keep you informed of what happens."' },
            { ar: 'تنتظر حتى يُخبرك طفل آخر بالشيء نفسه قبل التبليغ لتُقوّي روايتك', en: 'Wait until another child tells you the same thing before reporting, to strengthen the account' },
          ],
          correct: 2,
          feedback: {
            ar: 'الوعد بالطرد يتجاوز صلاحيّاتك الكاملة ويُعيد بالضبط ما سبق أن آلمه حين لم يُنفَّذ الوعد. والتحقيق بالتفاصيل ليس دورك وقد يُفسد إجراءات رسمية لاحقة ويُسبّب ضرراً إضافياً. والانتظار لرواية ثانية يُبقيه في وضع خطر قد يستمر. الخيار الثالث وحده يُصدّقه ويُبقيه في الصورة ولا يُعطيه أملاً زائفاً ويُبلّغ الجهة الصحيحة.',
            en: 'Promising dismissal completely exceeds your authority and repeats exactly what hurt him when the promise was not fulfilled. Investigating for details is not your role and may undermine later formal procedures and cause additional harm. Waiting for a second account leaves him in a dangerous situation that may continue. Only the third option believes him, keeps him informed, avoids false hope and reports to the right party.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'pv-m5',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'متى تُصعّد إلى المشرف فوراً', en: 'When to Escalate to a Supervisor Immediately' },
      lede: {
        ar: 'التصعيد الفوري ليس فشلاً ولا اعترافاً بالعجز — بل هو التصرّف الصحيح في المواقف التي تتجاوز حدود دور المتطوّع وتستدعي تدخّل من يملك الصلاحية والتدريب الكافيين.',
        en: 'Immediate escalation is not failure or an admission of incapacity — it is the correct action in situations that exceed the limits of a volunteer\'s role and call for someone with sufficient authority and training.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التصعيد الفوري لا يعني أنك عاجز أو مقصّر — بل يعني أنك تصرّفت بالطريقة الصحيحة في اللحظة الصحيحة. بعض المواقف تتجاوز ما يمكن أن يعالجه متطوّع مهما كان لديه من خبرة أو حسن نيّة، وهذه بالذات هي المواقف التي صُمّمت عمليات التصعيد من أجلها. المشرف أو مسؤول الحماية في المنظمة لا يُبلَّغ فقط حين تُصبح المشكلة واضحة تماماً — بل يُبلَّغ حين تشكّ في أن شيئاً ما غير صحيح ولم تستطع التأكّد منه بنفسك.\n\nالتصعيد الفوري يعني الاتّصال بالمشرف أو مسؤول الحماية في أقرب وقت ممكن — ليس في نهاية الأسبوع ولا بعد تفكير طويل ولا حين «تجد الوقت المناسب». الفارق بين ساعة وثلاث ساعات في بعض الحالات هو الفارق بين سلامة الشخص وتعرّضه لضرر إضافي لا يُمكن تداركه لاحقاً. كل دقيقة تتأخّر فيها الإحالة إلى المختصّ هي دقيقة يظلّ فيها الشخص دون الدعم الذي يحتاجه.',
            en: 'Immediate escalation does not mean you are incapable or falling short — it means you acted correctly at the right moment. Some situations exceed what any volunteer can handle, however experienced or well-intentioned, and these are precisely the situations that escalation procedures were designed for. The supervisor or protection officer is not informed only once the problem is completely clear — but when you sense something is not right and have been unable to confirm it yourself.\n\nImmediate escalation means contacting the supervisor or protection officer as soon as possible — not at the end of the week, not after prolonged reflection, and not when you "find the right time." The difference between one hour and three hours in some cases is the difference between a person\'s safety and their being exposed to additional harm that cannot later be undone. Every minute you delay referring to the specialist is a minute the person remains without the support they need.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'الشخص يُشير بأيّ طريقة — مباشرة أو ضمنية — إلى أفكار إيذاء النفس أو الانتحار، حتى لو قدّمها كمزحة أو تراجع عنها فور قولها',
              'طفل في خطر مباشر أو عُثر عليه في وضع غير آمن أو مع شخص غير موثوق أو بعد غياب غير مبرّر',
              'إفصاح عن اعتداء جنسي حدث خلال الأيام الخمسة الأخيرة، لأن هناك إجراءات طبية حسّاسة للوقت: الوقاية الدوائية من فيروس نقص المناعة تبدأ خلال ٧٢ ساعة من التعرّض، ومنع الحمل الطارئ خلال ١٢٠ ساعة. كلّما كان التصعيد أبكر كانت الخيارات الطبية أوسع، ولا تفترض أن الوقت فات',
              'خطر وشيك من عنف جسدي: تهديد مباشر أو صريح أو وضع يوحي بأن العنف سيقع قريباً',
              'الشخص يُصرح بأنه لن يكون بأمان حين يعود إلى مكان إقامته أو إلى شخص معيّن',
              'أيّ موقف يجعلك تشعر في داخلك بأن شيئاً ما ليس صحيحاً حتى لو لم تستطع تحديده — الشكّ الصادق وحده كافٍ للإبلاغ',
            ],
            en: [
              'The person indicates in any way — directly or implicitly — thoughts of self-harm or suicide, even if presented as a joke or immediately withdrawn',
              'A child is in immediate danger or has been found in an unsafe situation, with an untrustworthy person, or after an unexplained absence',
              'Disclosure of sexual assault that occurred within the last five days, because there are time-critical medical procedures: HIV post-exposure prophylaxis starts within 72 hours of exposure, and emergency contraception within 120 hours. The earlier the escalation, the wider the medical options — and never assume the window has closed',
              'Imminent risk of physical violence: a direct or explicit threat, or a situation suggesting violence is about to occur',
              'The person states they will not be safe when they return to their place of residence or to a specific person',
              'Any situation where you feel internally that something is not right, even if you cannot specify it — genuine doubt alone is sufficient reason to report',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'التردّد في التصعيد مفهوم — التأخير ليس مقبولاً', en: 'Hesitation about escalating is understandable — delay is not acceptable' },
          content: {
            ar: 'كثير من المتطوّعين يترادّدون في التصعيد خشية أن يكونوا «مبالغين» أو يُزعجوا المشرف في غير محلّه أو يُلحقوا الضرر بشخص بسبب سوء فهم. لكن في مجال الحماية، التصعيد الذي لم يكن ضرورياً لا يكلّف شيئاً يُذكر — والتصعيد الذي كان ضرورياً ولم يحدث قد يكلّف كل شيء. مشرفك يُفضّل أن تتصل عشر مرات وتسأل «هل هذا يستحق الإبلاغ؟» على ألّا تتّصل المرّة التي كانت مهمّة حقاً.',
            en: 'Many volunteers hesitate to escalate for fear of "overreacting," disturbing their supervisor unnecessarily, or harming someone due to a misunderstanding. But in protection, escalation that was not needed costs very little — and escalation that was needed and did not happen can cost everything. Your supervisor would rather you call ten times and ask "does this warrant reporting?" than not call the one time that truly mattered.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'ما تقوله للمشرف حين تُصعّد يجب أن يكون وصفاً للوقائع لا تفسيراً لها ولا حكماً عليها. «في الساعة الثالثة قالت سارة إنها لن تعود إلى البيت لأنها خائفة — هذا ما قالته بالحرف» — هذه الجملة تُعطي المشرف المعلومة التي يحتاجها ليقرّر. أما «أعتقد أن سارة في خطر وأن زوجها يضربها» فهذا تحليل وحكم قد يقودك أنت وإيّاه في الاتجاه الخاطئ إذا كانت الحقيقة مختلفة عمّا تتصوّر. الوصف الدقيق للكلمات الحرفية والأفعال الملاحَظة وتوقيتها هو أثمن ما تستطيع تقديمه في هذه اللحظة.\n\nبعد التصعيد، يبقى دورك مهمّاً: كن متاحاً للمشرف إذا احتاج معلومة إضافية، وأبلغ الشخص المعني بأن المشرف قد عُلم بالأمر وأن خطوات ستُتّخذ، وتذكّر أن ما يحدث بعد التصعيد لا تتحكّم فيه بالضرورة — وهذا أمر طبيعي وليس قصوراً منك. حماية الشخص مسؤولية مشتركة تتوزّع على المنظمة بكاملها، والتصعيد هو لحظة انتقال المسؤولية من مستوى إلى آخر، لا لحظة تخلٍّ عن الشخص. استمر في التواصل معه بالدعم العاطفي ضمن حدود دورك بينما يعالج المختصّون الجانب الإجرائي.',
            en: 'What you say to the supervisor when escalating must be a description of facts, not an interpretation of them or a judgement upon them. "At three o\'clock Sarah said she would not go home because she was afraid — those were her exact words" — that sentence gives the supervisor the information they need to decide. "I think Sarah is in danger and her husband is beating her" is analysis and judgement that may lead you and the supervisor in the wrong direction if the truth differs from what you imagine. A precise description of exact words, observed actions, and their timing is the most valuable thing you can offer at that moment.\n\nAfter escalating, write down anything further you learn, tell the person concerned that the supervisor now knows and that steps will be taken, and remember that what happens after the escalation is not necessarily yours to control — which is normal, and not a failing on your part. Protecting someone is a shared responsibility spread across the whole organisation, and escalation is the moment responsibility passes from one level to the next, not the moment you abandon the person. Stay in touch with them, offering emotional support within the limits of your role, while the specialists handle the procedural side.',
          },
        },
        {
          type: 'quiz',
          id: 'pv-q5',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'في نهاية جلسة الدعم النفسي الاجتماعي، قالت مريم (٣٢ عاماً) بهدوء: «أتمنى لو لم أصحَ غداً». حين سألتها، قالت: «لا شيء، كنت أمزح». ما الذي تفعل؟',
            en: 'At the end of a psychosocial support session, Maryam (32) said quietly: "I wish I wouldn\'t wake up tomorrow." When you asked her, she said: "Nothing, I was joking." What do you do?',
          },
          options: [
            { ar: 'تقبّل قولها إنها كانت تمزح وتُنهي الجلسة كالمعتاد', en: 'Accept her explanation that she was joking and end the session as normal' },
            { ar: 'تطلب منها ألّا تقول مثل هذه الأشياء لأنها مُقلقة وتُؤثّر على بقية الفريق', en: 'Ask her not to say such things because they are worrying and affect the rest of the team' },
            { ar: 'تُبقيها بأمان معك وتتواصل مع المشرف فوراً وتنقل ما قالته بكلماتها الحرفية', en: 'Keep her safely with you and contact the supervisor immediately, conveying what she said in her exact words' },
            { ar: 'تتابع الأمر في الجلسة القادمة إن كرّرت شيئاً مشابهاً', en: 'Follow up in the next session if she repeats something similar' },
          ],
          correct: 2,
          feedback: {
            ar: 'قبول «كنت أمزح» في هذا السياق يتجاهل أن الجملة قيلت بهدوء وجدّية قبل التراجع عنها — وهذا النمط بالذات هو ما يُثير القلق أكثر مما يُهدّئه. طلبها عدم تكرار الكلام يضع عليها عبئاً إضافياً ويُرسل رسالة خاطئة. والتأجيل إلى الجلسة القادمة وقت لا تملك التهاون فيه. أيّ إشارة إلى إيذاء النفس — حتى لو قُدّمت كمزحة وتُراجع عنها — تستوجب التصعيد الفوري.',
            en: 'Accepting "I was joking" in this context ignores that the statement was made calmly and seriously before being withdrawn — and that pattern is precisely what causes concern rather than reassurance. Asking her not to repeat such words places an additional burden on her and sends the wrong message. Waiting until the next session is time you cannot afford to delay. Any indication of self-harm — even if presented as a joke and withdrawn — requires immediate escalation.',
          },
        },
        {
          type: 'quiz',
          id: 'pv-q6',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أيّ من الجمل التالية هي الطريقة الصحيحة لنقل المعلومة إلى المشرف عند التصعيد؟',
            en: 'Which of the following correctly conveys information to a supervisor when escalating?',
          },
          options: [
            { ar: '«أعتقد أن أحمد يُعنّف زوجته، أشعر بذلك من طريقة كلامها ومن نظرتها حين يدخل القاعة، وأنا أعرف هذه العائلة منذ سنوات»', en: '"I think Ahmad is abusing his wife — I can sense it from the way she speaks and from her look when he walks into the hall, and I have known this family for years"' },
            { ar: '«قالت زينب في الساعة الثانية: إذا رجعت البيت الليلة ما راح تكون مشكلة صغيرة — هذا ما قالته بالحرف»', en: '"Zainab said at two o\'clock: if I go home tonight it won\'t be a small problem — those were her exact words"' },
            { ar: '«أحمد يبدو عدوانياً لكنه ربما كان متعباً من العمل»', en: '"Ahmad seems aggressive but he was probably just tired from work"' },
            { ar: '«زينب تبكي كثيراً ولا أعرف لماذا، ربما مشكلة عائلية عادية مثل التي تمرّ بها معظم العائلات في مثل هذه الظروف المعيشية»', en: '"Zainab cries a lot and I don\'t know why — probably a normal family issue like the ones most families are going through in these living conditions"' },
          ],
          correct: 1,
          feedback: {
            ar: 'الخيارات الأول والثالث والرابع كلها تحمل تفسيراً أو تخميناً أو تهوينّاً يُقلّل من خطورة الأمر أو يوجّه المشرف في اتجاه قد يكون خاطئاً. الخيار الثاني وحده يُعطي المشرف ما يحتاجه: من تكلّم، ومتى، وبالكلمات الحرفية. هذا هو التصعيد الفعّال — نقل الوقائع لا الآراء أو التفسيرات.',
            en: 'Options one, three and four all carry interpretation, guesswork or minimisation that reduces the perceived seriousness or steers the supervisor in a potentially wrong direction. Only option two gives the supervisor what they need: who spoke, when, and in their exact words. That is effective escalation — conveying facts, not opinions or interpretations.',
          },
        },
      ],
    },
  ],
};
